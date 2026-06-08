#!/usr/bin/env python3
"""Run a bounded headless agy (Antigravity CLI) session in another repository.

Mirror of delegate-codex-session, but drives `agy --print` (headless) instead of
`codex exec`. The contract is the same: run the agent with the target repo as the
working root and pass the delegated task through; the repo's own agy project
context (GEMINI.md, .agents/skills, .agents/mcp_config.json) loads from there.

Two agy-specific facts shape this wrapper:

1. NON-TTY STDOUT BUG. `agy -p/--print` completes the model round-trip but emits
   nothing on stdout when stdout is NOT a TTY (pipe / redirect / subprocess) —
   exactly the delegation case (google-antigravity/antigravity-cli#76). We run
   agy under a PTY so it flushes normally, then strip terminal control sequences
   from the captured bytes. (Transcripts under ~/.gemini/antigravity-cli/
   conversations are protobuf-encoded SQLite blobs, so there is no clean text
   fallback to parse — the PTY capture is the source of the answer.)
2. AUTH HOLDS BETTER, ON PURPOSE. agy authenticates via the central Google OAuth
   in ~/.gemini and reaches theorymcp through the per-repo mcp-remote bridge
   (`.agents/mcp_config.json` -> `npx -y mcp-remote <route>`), whose own token
   store refreshes independently. There is nothing per-delegation to isolate
   (unlike codex's --codex-home dance); that shared, bridge-held auth is the
   reason to prefer agy under frequent delegation.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import select
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path


def eprint(*args: object) -> None:
    print(*args, file=sys.stderr)


_CTRL = re.compile(
    rb"\x1b\[[0-9;?]*[ -/]*[@-~]"   # CSI sequences (colors, cursor)
    rb"|\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)"  # OSC sequences (titles)
    rb"|\x1b[@-Z\\-_]"              # other 2-byte escapes
    rb"|\r"                          # carriage returns
)


def strip_terminal(raw: bytes) -> str:
    return _CTRL.sub(b"", raw).decode("utf-8", "replace")


def build_prompt(task: str, extra_instruction: str | None) -> str:
    prompt = task.strip()
    if extra_instruction and extra_instruction.strip():
        prompt = f"{prompt}\n\n{extra_instruction.strip()}"
    return prompt


def run_under_pty(cmd: list[str], cwd: str, env: dict, timeout: int) -> tuple[int, bytes, bool]:
    """Run cmd under a PTY (so agy --print flushes), capturing combined output."""
    import pty  # noqa: local import keeps the module importable for --dry-run on odd platforms
    import struct
    import fcntl
    import termios

    master, slave = pty.openpty()
    try:
        fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack("HHHH", 60, 220, 0, 0))
    except Exception:
        pass
    proc = subprocess.Popen(
        cmd, cwd=cwd, env=env,
        stdin=slave, stdout=slave, stderr=slave,
        close_fds=True, start_new_session=True,
    )
    os.close(slave)
    buf = bytearray()
    deadline = time.monotonic() + timeout
    timed_out = False
    try:
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                timed_out = True
                try:
                    os.killpg(proc.pid, signal.SIGKILL)
                except Exception:
                    pass
                break
            try:
                r, _, _ = select.select([master], [], [], min(1.0, remaining))
            except (OSError, ValueError):
                break
            if r:
                try:
                    data = os.read(master, 65536)
                except OSError:
                    break
                if not data:
                    break
                buf.extend(data)
            elif proc.poll() is not None:
                try:
                    while True:
                        r2, _, _ = select.select([master], [], [], 0.2)
                        if not r2:
                            break
                        data = os.read(master, 65536)
                        if not data:
                            break
                        buf.extend(data)
                except OSError:
                    pass
                break
    finally:
        try:
            os.close(master)
        except Exception:
            pass
        try:
            rc = proc.wait(timeout=10)
        except Exception:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except Exception:
                pass
            rc = proc.wait()
    return (-1 if timed_out else rc), bytes(buf), timed_out


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Run a bounded headless agy delegation in another repository.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--repo", required=True, help="Repository directory = the inner agy session's working root (cwd).")
    p.add_argument("--task", help="Delegated task. If omitted, read from stdin.")
    p.add_argument("--extra-instruction", help="Additional instruction appended to the inner prompt.")
    p.add_argument("--model", help="Optional agy model override (else agy's configured default).")
    p.add_argument("--add-dir", action="append", default=[], help="Extra workspace dir for agy (repeatable).")
    p.add_argument("--timeout", type=int, default=900, help="Outer wall-clock timeout (seconds).")
    p.add_argument("--print-timeout", default="10m", help="agy --print-timeout value (e.g. 10m).")
    p.add_argument("--sandbox", action="store_true", help="Pass agy --sandbox (terminal-restricted).")
    p.add_argument("--agy-bin", default="agy", help="agy executable to invoke.")
    p.add_argument(
        "--log-dir",
        default=str(Path.home() / ".gemini" / "antigravity-cli" / "tmp" / "delegate-agy-session"),
        help="Directory for prompt, raw output, and final-answer files.",
    )
    p.add_argument("--no-pty", action="store_true", help="Debug: run without a PTY (will hit the non-TTY stdout bug).")
    p.add_argument("--dry-run", action="store_true", help="Print the command/metadata without running agy.")
    p.add_argument("--print-prompt", action="store_true", help="Echo the generated inner prompt to stderr first.")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    repo = Path(args.repo).expanduser().resolve()
    if not repo.is_dir():
        eprint(f"error: --repo is not a directory: {repo}")
        return 2

    task = args.task if args.task is not None else sys.stdin.read()
    if not task or not task.strip():
        eprint("error: provide --task or pipe a task on stdin")
        return 2

    agy_bin = args.agy_bin if os.path.sep in args.agy_bin else shutil.which(args.agy_bin)
    if not agy_bin:
        eprint(f"error: agy executable not found: {args.agy_bin}")
        return 127

    prompt = build_prompt(task, args.extra_instruction)

    stamp = _dt.datetime.now(_dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = Path(args.log_dir).expanduser().resolve() / f"{stamp}-{repo.name}-{os.getpid()}"
    run_dir.mkdir(parents=True, exist_ok=True)
    prompt_file = run_dir / "prompt.md"
    raw_file = run_dir / "raw.out"
    final_file = run_dir / "final.md"
    meta_file = run_dir / "metadata.json"
    prompt_file.write_text(prompt + "\n", encoding="utf-8")

    # Flags BEFORE the prompt; prompt last after --print (works whether --print is bool+positional or string).
    cmd = [agy_bin, "--dangerously-skip-permissions"]
    if args.model:
        cmd += ["--model", args.model]
    if args.print_timeout:
        cmd += ["--print-timeout", args.print_timeout]
    if args.sandbox:
        cmd += ["--sandbox"]
    for d in args.add_dir:
        cmd += ["--add-dir", str(Path(d).expanduser().resolve())]
    cmd += ["--print", prompt]

    metadata = {
        "tool": "agy",
        "repo": str(repo),
        "cwd": str(repo),
        "prompt_file": str(prompt_file),
        "raw_file": str(raw_file),
        "final_file": str(final_file),
        "command_display": " ".join(cmd[:-1]) + " <prompt>",
        "pty": (not args.no_pty),
        "conversations_dir": str(Path.home() / ".gemini" / "antigravity-cli" / "conversations"),
        "auth": "central Google OAuth (~/.gemini); theorymcp via per-repo mcp-remote bridge",
    }
    meta_file.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")

    if args.print_prompt:
        eprint("--- generated inner prompt ---")
        eprint(prompt)
        eprint("--- end prompt ---")

    if args.dry_run:
        print(json.dumps({**metadata, "metadata_file": str(meta_file), "dry_run": True}, indent=2))
        return 0

    eprint(f"delegate-agy-session: running headless agy in {repo}")
    eprint(f"delegate-agy-session: log dir {run_dir}")

    if args.no_pty:
        try:
            completed = subprocess.run(
                cmd, cwd=str(repo), env=os.environ.copy(),
                stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                timeout=args.timeout, check=False,
            )
            rc, raw, timed_out = completed.returncode, completed.stdout, False
        except subprocess.TimeoutExpired as exc:
            rc, raw, timed_out = -1, (exc.stdout or b""), True
    else:
        rc, raw, timed_out = run_under_pty(cmd, str(repo), os.environ.copy(), args.timeout)

    raw_file.write_bytes(raw)
    answer = strip_terminal(raw).strip()
    final_file.write_text(answer + "\n", encoding="utf-8")

    if timed_out:
        eprint(f"error: inner agy session timed out after {args.timeout}s")
        if answer:
            print(answer)
        eprint(f"raw: {raw_file}")
        return 124

    if not answer:
        eprint("warning: empty captured answer. If you ran with --no-pty this is the known non-TTY")
        eprint("stdout bug; re-run under a PTY (default). Otherwise inspect the conversation transcript:")
        eprint(f"  conversations: {metadata['conversations_dir']}  (resume with: agy -c   or   agy --resume)")
        eprint(f"  raw capture:   {raw_file}")
        return 1 if rc == 0 else (rc or 1)

    print(answer)
    print("\n--- delegate-agy-session metadata ---")
    print(f"tool: agy   repo: {repo}")
    print(f"log_dir: {run_dir}")
    print(f"final_file: {final_file}")
    print(f"raw_file: {raw_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
