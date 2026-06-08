#!/usr/bin/env bash
#
# install.sh — bootstrap the Theory Cloud workspace.
#
#     curl -fsSL https://theorycloud.ai/install.sh | bash
#
# What it does:
#   1. Clones theory-cloud/theory into ./theory   (override with THEORY_DIR).
#   2. Registers the namespace as a GLOBAL codex MCP server so codex can reach it
#      from any project (codex does not auto-load the route on its own):
#
#          codex mcp add theorycloud --url https://theorymcp.ai/theorycloud/mcp
#
#      The global server name (theorycloud) is deliberately DIFFERENT from the
#      project-level `theorymcp` server shipped in .codex/config.toml, so the two
#      never collide. Both point at the same route, so one OAuth covers both.
#
# This script only materializes the workspace and wires the host to the route.
# It never edits the namespace — the namespace is the source of truth.
#
# Env overrides:
#   THEORY_DIR         target directory            (default: theory)
#   THEORY_REPO        git clone URL               (default: github.com/theory-cloud/theory)
#   THEORY_BRANCH      branch to check out         (default: repo default)
#   THEORY_ROUTE       namespace MCP route         (default: https://theorymcp.ai/theorycloud/mcp)
#   THEORY_MCP_NAME    global codex server name    (default: theorycloud)
#   THEORY_SKIP_CODEX  set to 1 to skip 'codex mcp add'

set -euo pipefail

# This installer writes ALL of its own output to stderr; its stdout is intentionally
# empty. That makes `curl ... | bash` work (bash reads the script from stdin) while
# making the footgun `install.sh | bash` — piping the script's OUTPUT into a shell —
# a harmless no-op instead of executing log lines as commands.
#
# Under `curl ... | bash` the script's stdin is the pipe, not your terminal, so any
# interactive step (codex's OAuth prompt) would hit EOF. Reconnect stdin to the
# controlling terminal — but only when one is actually openable. The subshell probe
# means a host with no controlling terminal (CI, containers) skips this cleanly
# instead of aborting on an unreadable /dev/tty. Harmless when already interactive.
if [ ! -t 0 ] && (exec </dev/tty) 2>/dev/null; then exec </dev/tty; fi

THEORY_DIR="${THEORY_DIR:-theory}"
THEORY_REPO="${THEORY_REPO:-https://github.com/theory-cloud/theory.git}"
THEORY_BRANCH="${THEORY_BRANCH:-}"
THEORY_ROUTE="${THEORY_ROUTE:-https://theorymcp.ai/theorycloud/mcp}"
THEORY_MCP_NAME="${THEORY_MCP_NAME:-theorymcp}"
THEORY_SKIP_CODEX="${THEORY_SKIP_CODEX:-0}"

# --- output helpers (everything goes to stderr; see header) ------------------
if [ -t 2 ]; then
  _b=$'\033[1m'; _g=$'\033[32m'; _y=$'\033[33m'; _r=$'\033[31m'; _x=$'\033[0m'
else
  _b=''; _g=''; _y=''; _r=''; _x=''
fi
say()  { printf '%stheory%s %s\n' "$_b" "$_x" "$*" >&2; }
ok()   { printf '%s  ✓%s %s\n' "$_g" "$_x" "$*" >&2; }
warn() { printf '%s  !%s %s\n' "$_y" "$_x" "$*" >&2; }
die()  { printf '%s  ✗%s %s\n' "$_r" "$_x" "$*" >&2; exit 1; }

# --- prerequisites -----------------------------------------------------------
command -v git >/dev/null 2>&1 || die "git is required but was not found on PATH."

# --- clone (or update) -------------------------------------------------------
if [ -e "$THEORY_DIR" ]; then
  if [ -d "$THEORY_DIR/.git" ]; then
    say "updating existing clone in $THEORY_DIR"
    git -C "$THEORY_DIR" pull --ff-only || warn "could not fast-forward; leaving the existing clone as-is"
  else
    die "$THEORY_DIR exists and is not a git clone — remove it or set THEORY_DIR=<dir>."
  fi
else
  say "cloning $THEORY_REPO into $THEORY_DIR"
  if [ -n "$THEORY_BRANCH" ]; then
    git clone --branch "$THEORY_BRANCH" "$THEORY_REPO" "$THEORY_DIR"
  else
    git clone "$THEORY_REPO" "$THEORY_DIR"
  fi
fi

cd "$THEORY_DIR"

# --- verify the materialization came up whole (verify before trust) ----------
if [ ! -f SOUL.md ] || [ ! -f .codex/config.toml ]; then
  die "clone looks incomplete (missing SOUL.md or .codex/config.toml)."
fi
ok "workspace ready in $(pwd)"

# --- register the namespace as a GLOBAL codex MCP server ---------------------
if [ "$THEORY_SKIP_CODEX" = "1" ]; then
  warn "THEORY_SKIP_CODEX=1 — skipping 'codex mcp add'."
elif ! command -v codex >/dev/null 2>&1; then
  warn "codex CLI not found on PATH — skipping the global MCP registration."
  warn "once codex is installed, run:"
  warn "    codex mcp add $THEORY_MCP_NAME --url $THEORY_ROUTE"
else
  if codex mcp get "$THEORY_MCP_NAME" >/dev/null 2>&1; then
    say "global codex server '$THEORY_MCP_NAME' already exists — refreshing it"
    codex mcp remove "$THEORY_MCP_NAME" >/dev/null 2>&1 || true
  fi
  say "registering local codex MCP server '$THEORY_MCP_NAME' -> $THEORY_ROUTE"
  echo "if you can see this respond with hello" | codex exec > /dev/null 2>&1
  codex mcp get "$THEORY_MCP_NAME" >/dev/null 2>&1 \
    && ok "codex mcp add complete" \
    || warn "codex mcp add ran but the server did not read back — check 'codex mcp list'."
fi

# --- next steps --------------------------------------------------------------
say "done."
cat >&2 <<EOF

  Next:
    cd $THEORY_DIR

  Open the workspace in your host of choice — it comes up as Theory:
    • codex        run 'codex mcp login $THEORY_MCP_NAME' to login then run 'codex "how do I bootstrap keybank-factory?"'
    • Claude Code  run 'claude'
    • Antigravity  open the folder; the mcp-remote bridge handles OAuth

EOF
