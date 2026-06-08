#!/usr/bin/env bash
# check.sh — validate that this workspace is coherent and safe to ship.
#
# This is the bulletproof gate. It is NON-MUTATING (it renders nothing, writes
# nothing) and exits non-zero on the first category of failure it finds. It is
# the single source of truth for "is this workspace materialization whole?", and
# it is invoked from three places:
#   • humans, ad hoc:        ./check.sh
#   • render-hosts.sh:       runs it after rendering, so a render can never
#                            "succeed" while producing incoherent output
#   • CI (.github/workflows/validate.yml): the merge gate
#
# What it proves:
#   1. Shell scripts parse (bash -n).
#   2. No internal scratch (.staging/) is tracked into the shipped tree.
#   3. Every SKILL.md frontmatter is valid YAML with name+description, and
#      name == directory slug (the bug that broke skill loading this is the gate for).
#   4. The Claude output-style frontmatter is valid YAML.
#   5. Host config files are well-formed (.mcp.json / mcp_config.json / settings.json
#      are valid JSON; .codex/config.toml is valid TOML with the required keys).
#   6. The soul + skill bodies in every host tree are BYTE-IDENTICAL to the
#      authored source (SOUL.md / skills/), with no orphans — i.e. render is in
#      sync and nobody hand-edited a materialized copy.
#
# Config files (.mcp.json, .codex/config.toml, ...) are validated for well-formedness
# but NOT for byte-equality with render output: the workspace owner may legitimately
# augment them (e.g. add a lab route), so they are owner-owned, render-seeded.
set -euo pipefail
cd "$(dirname "$0")"

fail=0
note() { printf '  %s\n' "$*"; }
group() { printf '\n• %s\n' "$*"; }

# --- 1. shell scripts parse --------------------------------------------------
group "shell scripts parse (bash -n)"
shell_scripts=(render-hosts.sh check.sh docs/install.sh)
for s in "${shell_scripts[@]}"; do
  if [ -f "$s" ]; then
    if bash -n "$s" 2>/tmp/checksh.err; then note "ok    $s"; else fail=1; note "FAIL  $s"; sed 's/^/        /' /tmp/checksh.err; fi
  fi
done
if command -v shellcheck >/dev/null 2>&1; then
  for s in "${shell_scripts[@]}"; do [ -f "$s" ] && { shellcheck -S warning "$s" || fail=1; }; done
else
  note "(shellcheck not installed — skipped; CI runs it)"
fi

# --- 2. no internal scratch tracked into the shipped tree --------------------
group "no internal scratch (.staging/) is tracked"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  tracked_staging="$(git ls-files .staging | wc -l | tr -d ' ')"
  if [ "$tracked_staging" = "0" ]; then note "ok    .staging/ not tracked"; else fail=1; note "FAIL  $tracked_staging files under .staging/ are tracked (run: git rm -r --cached .staging)"; fi
else
  note "(not a git work tree — skipped)"
fi

# --- 3–6. structured validation (YAML / JSON / TOML / sync) ------------------
group "frontmatter, config, and soul/skill sync"
if python3 - <<'PY'; then :; else exit 1; fi
import sys, os, re, json, glob

try:
    import yaml
except Exception as e:
    print(f"  FAIL  PyYAML not importable: {e}"); sys.exit(1)
try:
    import tomllib
except Exception as e:
    print(f"  FAIL  tomllib not importable (need Python 3.11+): {e}"); sys.exit(1)

errors = []
def ok(msg):  print(f"  ok    {msg}")
def bad(msg): errors.append(msg); print(f"  FAIL  {msg}")

def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()

FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
def frontmatter(path):
    txt = read(path)
    m = FM.match(txt)
    if not m:
        bad(f"{path}: missing or malformed YAML frontmatter"); return None
    try:
        data = yaml.safe_load(m.group(1))
    except yaml.YAMLError as e:
        line = str(e).replace("\n", " ")
        bad(f"{path}: invalid YAML frontmatter: {line}"); return None
    if not isinstance(data, dict):
        bad(f"{path}: frontmatter is not a mapping"); return None
    return data

# --- 3. every SKILL.md frontmatter, name == slug -----------------------------
skill_trees = ["skills", ".claude/skills", ".agents/skills"]
for tree in skill_trees:
    for path in sorted(glob.glob(f"{tree}/*/SKILL.md")):
        slug = os.path.basename(os.path.dirname(path))
        data = frontmatter(path)
        if data is None:
            continue
        name = data.get("name"); desc = data.get("description")
        if not isinstance(name, str) or not name.strip():
            bad(f"{path}: empty/missing name")
        elif name != slug:
            bad(f"{path}: name '{name}' != directory slug '{slug}'")
        if not isinstance(desc, str) or not desc.strip():
            bad(f"{path}: empty/missing description")
n_skills = len(glob.glob("skills/*/SKILL.md"))
ok(f"{n_skills} source skills + rendered copies frontmatter checked")

# --- 4. output-style frontmatter ---------------------------------------------
style = ".claude/output-styles/theory.md"
if os.path.exists(style):
    data = frontmatter(style)
    if data is not None:
        for k in ("name", "description", "keep-coding-instructions"):
            if k not in data:
                bad(f"{style}: missing frontmatter key '{k}'")
        ok(f"{style} frontmatter valid")
else:
    bad(f"{style}: missing")

# --- 5. host config files well-formed ----------------------------------------
def load_json(path):
    try:
        return json.loads(read(path))
    except Exception as e:
        bad(f"{path}: invalid JSON: {e}"); return None

j = load_json(".mcp.json")
if j is not None and "mcpServers" not in j: bad(".mcp.json: missing mcpServers")
elif j is not None: ok(".mcp.json valid JSON")

j = load_json(".agents/mcp_config.json")
if j is not None:
    srv = (j.get("mcpServers") or {})
    if not any("command" in v for v in srv.values()):
        bad(".agents/mcp_config.json: no stdio (command) server — antigravity needs the mcp-remote bridge")
    else:
        ok(".agents/mcp_config.json valid JSON")

j = load_json(".claude/settings.json")
if j is not None and "outputStyle" not in j: bad(".claude/settings.json: missing outputStyle")
elif j is not None: ok(".claude/settings.json valid JSON")

try:
    with open(".codex/config.toml", "rb") as fh:
        tom = tomllib.load(fh)
    if "model_instructions_file" not in tom:
        bad(".codex/config.toml: missing model_instructions_file")
    servers = tom.get("mcp_servers") or {}
    if not servers or not any("url" in v for v in servers.values()):
        bad(".codex/config.toml: no [mcp_servers.*] with a url")
    if "model_instructions_file" in tom and servers:
        ok(".codex/config.toml valid TOML")
except FileNotFoundError:
    bad(".codex/config.toml: missing")
except tomllib.TOMLDecodeError as e:
    bad(f".codex/config.toml: invalid TOML: {e}")

# --- 6. soul + skill bodies are byte-identical to source (render in sync) -----
if not os.path.exists("SOUL.md"):
    bad("SOUL.md: missing")
else:
    soul = read("SOUL.md")
    for mount in (".codex/steward.md", "GEMINI.md"):
        if not os.path.exists(mount):
            bad(f"{mount}: missing soul mount")
        elif read(mount) != soul:
            bad(f"{mount}: soul mount differs from SOUL.md (re-run ./render-hosts.sh)")
    # output style must embed SOUL.md verbatim as its body
    if os.path.exists(style) and not read(style).endswith(soul):
        bad(f"{style}: body is not SOUL.md verbatim (re-run ./render-hosts.sh)")

    src_slugs = {os.path.basename(os.path.dirname(p)) for p in glob.glob("skills/*/SKILL.md")}
    for tree in (".claude/skills", ".agents/skills"):
        tree_slugs = {os.path.basename(os.path.dirname(p)) for p in glob.glob(f"{tree}/*/SKILL.md")}
        for orphan in sorted(tree_slugs - src_slugs):
            bad(f"{tree}/{orphan}: rendered skill has no source (stale — re-run ./render-hosts.sh)")
        for slug in sorted(src_slugs):
            rp = f"{tree}/{slug}/SKILL.md"
            if not os.path.exists(rp):
                bad(f"{rp}: source skill not rendered here (re-run ./render-hosts.sh)")
            elif read(rp) != read(f"skills/{slug}/SKILL.md"):
                bad(f"{rp}: differs from source (hand-edited or stale — re-run ./render-hosts.sh)")
    ok("soul mounts + skill bodies in sync with source")

sys.exit(1 if errors else 0)
PY
fail_struct=$?
[ "${fail_struct:-0}" = "0" ] || fail=1

# --- verdict -----------------------------------------------------------------
echo
if [ "$fail" = "0" ]; then
  printf '✓ check.sh: workspace is coherent.\n'
else
  printf '✗ check.sh: FAILURES above. Fix them (often: ./render-hosts.sh) and re-run.\n' >&2
fi
exit "$fail"
