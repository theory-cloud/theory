# Create a .codex/ steward (Mode 2)

The instantiation skill for the codex-steward pattern. Use only after the design document is confirmed.

## When to use

- The design document is confirmed by the principal
- The agent kind in the design is `codex-steward` or `manager+expert fleet` (the manager itself is a codex-steward)
- The target repo is identified and accessible

## When NOT to use

- The design document is not yet confirmed — go back to `design-agent`
- The agent kind is something other than a steward — use the appropriate `create-*` skill
- The target repo already has a `.codex/` and you have not confirmed with the principal whether to replace or coexist

## Inputs

- The confirmed design document
- The target repo absolute path
- The tenancy URL (e.g., `<host>/<tenant>/agents/<slug>/mcp`)
- The slug (typically a short word: `keeper`, `gov`, `preth`, `progenitor`)

## Procedure

1. **Confirm target.** Read `<target>/.codex/` if it exists. If present, confirm with the principal: replace, coexist, or stop.
2. **Create directory structure.**
   ```
   <target>/.codex/
     stack/
     skills/
   ```
   Add additional dirs if the design calls for them (e.g., `patterns/`, `references/`, `templates/`).
3. **Write `config.toml`.**
   ```toml
   model_instructions_file = "steward.md"

   [mcp_servers.<slug>]
   url = "<tenancy_url>"
   oauth_resource = "<tenancy_url>"
   scopes = ["mcp:tools", "ai.kb.query", "memory.append"]

   [mcp_servers.<slug>.tools.memory_append]
   approval_mode = "approve"
   ```
   Adjust if the design specifies non-default scopes or approval modes.
4. **Write `build.sh`.** Use the canonical concatenation script:
   ```bash
   #!/usr/bin/env bash
   set -euo pipefail

   CODEX_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
   STACK_DIR="$CODEX_DIR/stack"
   OUT="$CODEX_DIR/steward.md"

   shopt -s nullglob
   LAYERS=( "$STACK_DIR"/*.md )
   shopt -u nullglob

   if [[ ${#LAYERS[@]} -eq 0 ]]; then
     echo "build.sh: no layers found in $STACK_DIR" >&2
     exit 1
   fi

   IFS=$'\n' LAYERS_SORTED=( $(printf '%s\n' "${LAYERS[@]}" | sort) )
   unset IFS

   : > "$OUT"
   for layer in "${LAYERS_SORTED[@]}"; do
     cat "$layer" >> "$OUT"
     printf '\n' >> "$OUT"
   done

   echo "build.sh: wrote $OUT from ${#LAYERS_SORTED[@]} layers"
   ```
   Then `chmod +x .codex/build.sh`.
5. **Write the 5 stack layers.**
   - `00-tooling-identity.md` — agent identity, tenancy, what it is, what it is not, two-mode framing (if applicable), position in corpus
   - `01-<philosophy-name>.md` — domain-specific philosophy from the design document. Name the file with a meaningful slug (e.g., `01-genome-philosophy.md`, `01-governed-access-philosophy.md`, `01-research-discipline-philosophy.md`)
   - `02-<discipline-name>.md` — discipline / work shapes / validation gates
   - `03-boundaries.md` — scope, out-of-scope, cross-agent boundaries, destructive-action policy
   - `20-<slug>-soul.md` — refusal list, the cardinal failure framing, posture
6. **Write the skills.**
   - For each skill in the design, create `skills/<skill-name>/SKILL.md`
   - Frontmatter: `name` (matches directory) and `description` (used for skill discovery)
   - Body: typically `When to use`, `When NOT to use`, `Inputs`, `Procedure`, `Output`, `Red flags`, `After completing`
7. **Run validation gate.**
   ```
   bash .codex/build.sh
   wc -l .codex/steward.md
   ```
   - Confirm output line count is within expected range (typically 500-900 for a full steward)
   - Confirm all five stack layers were included
8. **Verify file tree.** Use `ls` or `find` to confirm the expected structure is in place.
9. **Memory-append** the emission outcome: slug, tenancy URL, line count, any deviations from the design document.

## Output

A fully scaffolded `.codex/` directory in the target repo, with `steward.md` assembled by `build.sh`.

## Red flags

- **Fewer than five stack layers** — refuse; the 5-layer stack is minimum durable shape
- **Skills without frontmatter** — refuse; the `name + description` frontmatter is load-bearing for skill discovery
- **Tenancy in config.toml that disagrees with the identity layer** — refuse; reconcile
- **A soul layer with fewer than three concrete refusals** — refuse; expand
- **Skipping the `build.sh` validation gate** — refuse; the build is part of "produced correctly"
- **Overwriting an existing `.codex/` without explicit confirmation** — refuse

## After creating

- Hand back to the principal with: file tree, steward.md line count, summary of design choices encoded
- Memory-append the production event
- If the production surfaced a new pattern, queue Mode 1 `update-pattern-catalog` work