# Create a Claude Code skill (Mode 2)

Skills are invoked via Claude Code's Skill tool. They are procedural definitions in `.claude/skills/<name>/SKILL.md` (with optional supporting files in the same directory). The frontmatter drives discovery; the body drives execution.

Skills are the most procedural of the agent kinds. They are not interview-driven or open-ended. They are: given these inputs, run this procedure, produce this output.

Even so — soul-first design applies. A skill has identity, scope, and refusals. The refusals appear as `Red flags` and `When NOT to use` sections.

## When to use

- The design document specifies agent kind `claude-skill`
- The work is a repeatable procedure with a stable input → output shape
- The skill belongs to a host repo's `.claude/` directory and will be invoked from that context

## When NOT to use

- The design specifies a steward — use `create-codex-steward`
- The design specifies a subagent invoked via Agent tool — use `create-claude-subagent`
- The work is open-ended / exploratory — a subagent is the right kind, not a skill

## Inputs

- The confirmed design document
- The target repo absolute path
- The skill name (lowercase, hyphenated — matches directory name)

## Procedure

1. **Confirm target.** Read `<target>/.claude/skills/` if it exists. Confirm the name doesn't collide.
2. **Create the directory** `<target>/.claude/skills/<name>/`.
3. **Create the file** `<target>/.claude/skills/<name>/SKILL.md`.
4. **Write the frontmatter.**
   ```yaml
   ---
   name: <name>
   description: <when to use this skill — used by Skill tool for discovery>
   ---
   ```
   The `description` is load-bearing — it determines when the parent agent invokes the skill.
5. **Write the body.** A skill body covers:
   - **When to use** — concrete trigger conditions
   - **When NOT to use** — concrete anti-triggers (this is part of the soul)
   - **Inputs** — what the skill needs to run
   - **Procedure** — the actual steps, in order
   - **Output** — what the skill produces
   - **Red flags** — refusals during execution (this is the soul)
   - **After completing** — cleanup, memory-append, hand-off
6. **Add supporting files if needed.** If the skill ships with templates, examples, or reference data, place them in the same directory: `<target>/.claude/skills/<name>/<support-file>`. Keep these tight and clearly purposed.
7. **Verify** the file parses (frontmatter is valid YAML).
8. **Memory-append** the emission.

## Output

A new directory `<target>/.claude/skills/<name>/` with `SKILL.md` and any supporting files.

## Red flags

- **Frontmatter without `name` or `description`** — refuse; both are required
- **Description that's vague** — refuse; rewrite as a specific trigger
- **A skill that does open-ended exploration** — refuse; redesign as a subagent
- **A skill body without a clear procedure** — refuse; skills are procedural
- **A skill that duplicates an existing one** — consolidate or differentiate
- **A skill with no `When NOT to use` section** — refuse; the anti-triggers are part of the soul
- **A skill with no `Red flags` section** — refuse; refusals during execution are part of the soul

## After creating

- Hand back to the principal with: directory path, frontmatter summary, procedure summary
- If the skill cross-references other skills or subagents, note them
- Memory-append the production event