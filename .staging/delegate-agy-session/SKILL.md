---
name: delegate-agy-session
description: Delegate bounded, steward-driven execution/analysis to a repository-local Antigravity CLI (agy) session in headless --print mode, the same way delegate-codex-session uses codex. Preferred under frequent delegation because agy holds auth better — central Google OAuth plus the per-repo mcp-remote bridge token store, instead of codex's native MCP token rotation that can revoke a sibling session.
---

# Delegate Agy Session

## Purpose

Use this skill to ask a repository-local **agy** (Antigravity CLI) session for bounded, steward-driven execution and analysis help, running headless via `agy --print`. The inner session runs with the target repo as its working root (the helper sets `cwd` = repo), so that repo's own agy project context — `GEMINI.md`, `.agents/skills/`, and `.agents/mcp_config.json` — loads normally.

This is the agy twin of `delegate-codex-session`: same delegation structure, different runner. It is for Factory orchestration — a steward coordination surface, not a way to make the parent orchestrator become the submodule implementer.

## Why agy here (the auth reason)

Under frequent delegation, codex's authentication refresh can break: each nested `codex exec` shares the codex token store, and an inner session's MCP token rotation can revoke the interactive/sibling session's token family (this is why `delegate-codex-session` grew a `--codex-home` isolation flag). agy avoids that:

- **Account auth is central and shared** — one Google OAuth in `~/.gemini/oauth_creds.json`, not minted per-delegation.
- **theorymcp runs through the per-repo mcp-remote JS bridge** (`.agents/mcp_config.json` → `npx -y mcp-remote <agent-route>`). mcp-remote terminates OAuth once and refreshes the token in **its own** store, so spawning many agy sessions does not rotate-and-revoke a shared family.

So there is nothing per-delegation to isolate — that shared, bridge-held auth is the point.

## Default shape

Use the bundled helper script:

```bash
.agents/skills/delegate-agy-session/scripts/delegate_agy_session.py \
  --repo /path/to/repo \
  --task "Answer a bounded read-only question about this repo."
```

The helper invokes agy headless as (flags before the prompt):

```bash
agy --dangerously-skip-permissions [--model <m>] --print-timeout 10m --print <prompt>
```

run with `cwd = <repo>`. It does not inspect, summarize, or paste `.agents` / `GEMINI.md` / `AGENTS.md` contents into the prompt; it passes the task through and relies on the working directory to put the inner agy session under the target repo's project + steward context. Logs (prompt, raw capture, final answer) land under `~/.gemini/antigravity-cli/tmp/delegate-agy-session/`.

## How it captures output (two agy facts)

- **Headless `agy --print` drops stdout under a non-TTY** (pipe/redirect/subprocess) — exactly the delegation case (antigravity-cli#76). The helper therefore runs agy **under a PTY** so it flushes normally, then strips terminal control sequences. Do not "fix" an empty result by parsing the transcript: `~/.gemini/antigravity-cli/conversations/*.db` are protobuf-encoded blobs, not clean text. The PTY capture is the answer; `--no-pty` exists only for debugging and will reproduce the empty-stdout bug.
- **`--dangerously-skip-permissions`** is agy's no-confirmation (YOLO) mode — required headless so the inner session does not block on tool-permission prompts.

## Orchestrator responsibility

The outer orchestrator owns cross-cutting context. Do not assume the repo-local delegate knows the parent project state, cross-repo dependencies, security invariant, issue-closing expectations, or proof shape unless the prompt says so. Before delegating implementation or review rework, give the delegate the relevant context and the boundaries it must not infer:

- project and milestone; target repo and product plane;
- base branch and PR target; issue to close and required `Closes #...` text, when applicable;
- security invariant that must remain true; accepted proof shape and validation gates;
- project-board/tracker linkage; cross-repo dependencies and contracts;
- explicit non-goals and forbidden surfaces.

The delegate owns repo-local execution under its own instructions. The orchestrator owns review, cross-repo compatibility, claim safety, and deciding whether the returned proof satisfies the assignment.

## Scoped TheoryMCP memory guidance

When the target repo's agy session has a scoped TheoryMCP memory surface (via its `theorymcp` mcp-remote bridge), include memory instructions in implementation/rework prompts:

1. Query repo-scoped memory before editing for the project, milestone, issue, security invariant, and relevant prior blockers.
2. Report which memories/lessons were applied, or that none were found.
3. Append memory only for durable repo-local lessons after a useful resolution (fixed blocker, contract boundary, validation discovery, security clarification).
4. Do not append chat summaries, routine validation output, secrets, credentials, logs, cross-tenant data, or parent-orchestrator decisions that belong in Factory state.
5. Do not append memory during read-only audits unless the prompt explicitly authorizes it.

If the delegate has no memory tools, it should say so and continue without pretending memory was queried.

## Delegate prompt rubric

For implementation assignments, include this rubric directly in the task. Omit only fields that truly do not apply and say why.

```markdown
Project / milestone: <name>
Target repo: <repo path or owner/name>
Product plane: <plane>
Base branch: <branch>
PR target: <branch>
Issue to close: #<number> or none
Required closing text: Closes #<number> or none
Security invariant: <what must remain true>
Accepted proof shape: <PR + commit + validation output + risks/blockers, or report-only>
Validation gates: <commands and expected evidence>
Project linkage: <project board/status/labels, or none>
Cross-repo deps/contracts: <contracts, fixtures, pinned repos, or none>
Allowed write scope: <files/modules>
Explicit non-goals: <out-of-scope work>
Forbidden actions: <secrets, cloud mutation, sibling repo edits, etc.>
Memory instructions: Query scoped memory before editing; report applied memories/lessons; append only durable repo-local lessons after useful resolution.
Response shape: PR URL, branch, commits, validation output, applied memories/lessons, risks, blockers, follow-ups requested.
```

## Read-only audit guard

For read-only audits, state the guard explicitly in the task:

```markdown
This is a read-only audit. Do not edit files. Do not create branches or commits. Do not push. Do not open, update, or comment on GitHub issues/PRs. Do not append TheoryMCP memory. Return findings only, with paths and confidence.
```

## Procedure

1. **Confirm the target repo** (absolute path). It should be a registered agy project (it appears in `~/.gemini/antigravity-cli/cache/projects.json`); if new, agy will discover it on first run from that `cwd`. Do not guess across tenants or sibling repos if the prompt is ambiguous.
2. **Choose the delegation class** — read-only audit, implementation assignment, or review rework. Do not blur them.
3. **Keep the task bounded** — a specific review, summary, file-location search, implementation plan, milestone, or PR rework.
4. **Keep the prompt explicit** — the wrapper passes the task through. If it must be read-only, must not recurse, must not comment on GitHub, or must not write memory, say so in the task.
5. **Provide cross-cutting context** — include the rubric fields the delegate needs so it does not infer parent-owned state.
6. **Use authorized channels only** — do not reference email/mailbox/peer-consult routes unless the target agent's channel + allowlist are actually provisioned.
7. **Inspect the result** — treat the inner output as advice or a steward report; verify important claims before acting.
8. **Preserve logs when useful** — cite the helper's `log_dir` / `final_file` if the result informs a larger change.

## Good uses

- Ask a framework steward (AppTheory / TableTheory / FaceTheory) to summarize its local invariants before you touch sibling code.
- Ask a target repo to identify the files relevant to a planned change.
- Ask for a read-only audit of whether a specific pattern is present.
- Ask a repo-local agent for one bounded milestone implementation that produces a PR.
- Ask a repo-local agent to rework a PR against a specific accepted proof shape.

## Do not use

- As a scraping mechanism, or to dump another repo's private files wholesale.
- To run recursive nested agy sessions.
- To bypass sandbox, approval, policy, rate-limit, or tenancy boundaries.
- To ask the inner session to expose secrets, quote credentials, or dump private keys.
- To bypass submodule ownership, Factory assignment discipline, or review gates.
- To ask for unbounded "fix whatever else you see" work.
- To treat the inner output as authoritative without review.

## Examples

Read-only analysis:

```bash
.agents/skills/delegate-agy-session/scripts/delegate_agy_session.py \
  --repo /abs/path/to/target-repo \
  --task "This is a read-only audit. Do not edit files, create branches/commits, push, or comment on GitHub, and do not append TheoryMCP memory. Summarize the repo's Mode 1 workflow in five bullets with paths and confidence."
```

Implementation assignment from a task file:

```bash
.agents/skills/delegate-agy-session/scripts/delegate_agy_session.py \
  --repo /path/to/repo \
  --task "$(cat assignments/example-delegate-task.md)"
```

Dry run before spending tokens (prints the command + metadata, runs nothing):

```bash
.agents/skills/delegate-agy-session/scripts/delegate_agy_session.py \
  --repo /path/to/repo --task "Summarize local agent boundaries (read-only)." --dry-run
```

## Wrapper details

The script validates the target dir, builds the prompt (task + optional `--extra-instruction`), and runs `agy --dangerously-skip-permissions [--model] --print-timeout <t> --print <prompt>` with `cwd` = repo, **under a PTY** to defeat the non-TTY stdout drop, with an outer `--timeout` (default 900s) on top of agy's own `--print-timeout`. It strips terminal control sequences and writes `prompt.md`, `raw.out`, `final.md`, and `metadata.json` to the run's log dir. Use `--print-prompt` to inspect the exact prompt; `--add-dir` to widen the workspace; `--sandbox` for terminal-restricted runs. It does not isolate auth (that is intentional — agy's shared/bridge-held auth is the reason to use it).
