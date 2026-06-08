#!/usr/bin/env bash
# render-hosts.sh — materialize this workspace's committed host layouts from the authored source.
#
# Authored source of truth (edit these):
#   SOUL.md            — the agent identity (one body, three mounts)
#   skills/<slug>/SKILL.md — host-neutral skills. These span BOTH halves of Theory's work: an
#                       integration (pull) half (configure/discover/list/materialize/verify/update)
#                       and an authoring (push) half (grant-authoring-scope/scope-agent-lite/
#                       author-soul/author-skills/define-install-layout/validate-and-publish). All
#                       render the same way — the push skills are not accidental additions.
#
# Rendered output (regenerated; do not hand-edit):
#   codex        -> .codex/{config.toml, steward.md}   (codex reads skills from the shared .agents/skills/)
#   claude_code  -> .claude/{output-styles/theory.md, settings.json, skills/<slug>/SKILL.md} + ./.mcp.json
#   antigravity  -> ./GEMINI.md + .agents/{mcp_config.json, skills/<slug>/SKILL.md}
#   skills       -> .agents/skills/<slug>/SKILL.md (codex + antigravity, shared) AND .claude/skills/<slug>/SKILL.md
#                   (there is NO .codex/skills — codex consumes the shared .agents/skills/ convention)
#
# This mirrors the theory-mcp-server ADL v2 multi-host render: same soul body and same skill bodies
# rendered to per-host paths/wrappers. The namespace MCP is the source of truth; locally, SOUL.md +
# skills/ are the source and the host dirs are the materialization. Repoint ROUTE with the
# `configure-namespace` skill (or by editing it here and re-running).
set -euo pipefail
cd "$(dirname "$0")"

# --- author-controlled knobs -------------------------------------------------
ROUTE="https://theorymcp.ai/theorycloud/mcp"   # theorymcp namespace route (worked example)
DISPLAY_NAME="Theory"                              # output-style name / identity activation
# NOTE: render-hosts.sh bakes the LITERAL $ROUTE into .codex/config.toml, .mcp.json, and
# .agents/mcp_config.json. The namespace-side ADL v2 install layouts authored by the
# define-install-layout skill MUST instead use the {{mcp.url}} placeholder — a literal route (or any
# OAuth/scope/tenant value) baked into layout content is rejected as an authority field. So local
# config files and layout content are intentionally NOT byte-identical; only {{soul}} and
# {{skill.body}} entries render identically on both sides.
# -----------------------------------------------------------------------------

soul="SOUL.md"
[ -f "$soul" ] || { echo "missing $soul" >&2; exit 1; }

echo "rendering host layouts from $soul + skills/  (route: $ROUTE)"

# clean rendered host trees (source SOUL.md + skills/ are never touched)
rm -rf .codex/skills .claude/skills .agents/skills
mkdir -p .claude/output-styles .claude/skills .agents/skills

# --- soul -> three mounts ----------------------------------------------------
cp "$soul" .codex/steward.md                       # codex: model_instructions_file
cp "$soul" GEMINI.md                               # antigravity: workspace rules (additive)

# claude_code: output style WITH frontmatter (system-prompt level)
{
  printf -- '---\n'
  printf 'name: %s\n' "$DISPLAY_NAME"
  printf 'description: Theory Cloud workspace steward — integrates a theorymcp.ai namespace into this workspace.\n'
  printf 'keep-coding-instructions: false\n'
  printf -- '---\n\n'
  cat "$soul"
} > .claude/output-styles/theory.md

# --- skills -> .agents/skills (codex + antigravity, shared) AND .claude/skills ----
# codex reads skills from the shared .agents/skills/ convention — there is NO .codex/skills.
for d in skills/*/; do
  slug="$(basename "$d")"
  [ -f "$d/SKILL.md" ] || continue
  for host in .claude .agents; do
    mkdir -p "$host/skills/$slug"
    cp "$d/SKILL.md" "$host/skills/$slug/SKILL.md"
  done
done

# --- host config files (theorymcp route wired per host) ----------------------
# codex: soul via model_instructions_file + native-OAuth HTTP MCP route
cat > .codex/config.toml <<TOML
model_instructions_file = "steward.md"

[mcp_servers.theorymcp]
url = "$ROUTE"
oauth_resource = "$ROUTE"
scopes = ["mcp:tools", "ai.kb.query"]
TOML

# claude_code: activate output style + root .mcp.json (native OAuth HTTP)
printf '{"outputStyle":"%s"}\n' "$DISPLAY_NAME" > .claude/settings.json
printf '{"mcpServers":{"theorymcp":{"type":"http","url":"%s"}}}\n' "$ROUTE" > .mcp.json

# antigravity: stdio MCP via the mcp-remote OAuth bridge (no native MCP OAuth)
printf '{"mcpServers":{"theorymcp":{"command":"npx","args":["-y","mcp-remote","%s"]}}}\n' "$ROUTE" > .agents/mcp_config.json

echo "done:"
echo "  codex       -> .codex/ (config.toml, steward.md); skills via shared .agents/skills/"
echo "  claude_code -> .claude/ (output-styles/theory.md, settings.json, skills/) + .mcp.json"
echo "  antigravity -> GEMINI.md + .agents/ (mcp_config.json, skills/)"
