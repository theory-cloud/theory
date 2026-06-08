# Create a Claude Code subagent (Mode 2)

Subagents are invoked via Claude Code's Agent tool. They are single-file definitions in `.claude/agents/<name>.md` with frontmatter that drives discovery and an instructional body that drives behavior.

Subagents are lighter-weight than `.codex/` stewards — they do not have their own MCP tenancy, build pipeline, or layered stack. But they still have identity, scope, and refusals. Soul-first design applies.

## When to use

- The design document specifies agent kind `claude-subagent`
- The agent will run as a sub-task within a parent Claude Code session (parallelizing work, protecting context, or running a specialized review)
- The target repo has a `.claude/` directory or will accept one

## When NOT to use

- The design specifies a steward — use `create-codex-steward`
- The design specifies a procedural skill invoked via Skill tool — use `create-claude-skill`
- The subagent's responsibilities are large enough to warrant a full `.codex/` (then redesign as a steward)

## Inputs

- The confirmed design document
- The target repo absolute path
- The subagent name (lowercase, hyphenated, descriptive — e.g., `golang-refactor-expert`, `source-curator`)

## Procedure

1. **Confirm target.** Read `<target>/.claude/agents/` if it exists. Confirm the name doesn't collide with an existing subagent.
2. **Create the file** `<target>/.claude/agents/<name>.md`.
3. **Write the frontmatter.**
   ```yaml
   ---
   name: <name>
   description: <when to use this subagent — used by Agent tool for discovery>
   model: <optional: sonnet / opus / haiku>
   tools: <optional: comma-separated list, or omit to inherit all parent tools>
   ---
   ```
   The `description` is load-bearing. It is how the parent agent decides whether to invoke this subagent. Write it as a clear trigger: "Use when X. Examples: <case 1>, <case 2>."
4. **Write the body.** A subagent body should cover:
   - **Identity** — what this subagent is, in 2-3 sentences
   - **When to engage** — the trigger conditions, in detail
   - **Scope** — what's in, what's out
   - **Invariants** — core truths the subagent holds
   - **Procedure** — how it does its work (loose or strict, depending on the subagent kind)
   - **Refusals** — the soul. At least three concrete refusals.
   - **Output shape** — what it returns to the parent agent
5. **Confirm tools field.** If the subagent should not have full parent tool access (e.g., a read-only research subagent), specify the tool subset.
6. **Verify** the file parses (frontmatter is valid YAML).
7. **Memory-append** the emission.

## Output

A single `.claude/agents/<name>.md` file. Discoverable by the parent Claude Code session via the Agent tool.

## Red flags

- **Frontmatter without `description`** — refuse; Agent tool discovery requires it
- **Description that's vague** ("a helpful agent for various tasks") — refuse; rewrite as a specific trigger
- **A subagent without refusals** — refuse; even lightweight agents have refusals
- **A subagent that duplicates an existing one** — refuse; consolidate or differentiate
- **A subagent whose scope is actually steward-sized** — redesign as a `.codex/` steward instead
- **A subagent with tool access that contradicts its identity** (e.g., a "read-only researcher" with Write access) — refuse; the tool list and identity must agree

## After creating

- Hand back to the principal with: file path, frontmatter summary, scope summary, refusal list
- If the subagent has cross-references with other subagents or skills, note them
- Memory-append the production event