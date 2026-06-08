# Consult existing stewards (read-only)

The corpus of existing agents in the Theory Cloud corpus is the ground truth that pattern docs describe. When designing a new agent, capturing a new pattern, or auditing an existing one, you read the corpus.

This skill is **filesystem-only**. It does not modify any other repo. It does not dispatch consultation emails to other stewards — those agents are subject matter to you, not coordination peers.

## When to use

- During `enumerate-patterns` (read at least one exemplar before authoring a new agent design)
- During `design-agent` (cross-check that the design's pattern claims match exemplar reality)
- During `audit-agent` (compare an existing agent against the canonical pattern)
- During `update-pattern-catalog` (cite at least one instance for any new pattern)
- When the principal asks "what does <existing agent> look like" and pattern-level answer is wanted

## When NOT to use

- Modifying any other repo's files — never; this skill is read-only
- Dispatching consultation emails to other stewards — wrong skill; not progenitor's role
- Building a comprehensive index of every steward — too expansive; read targeted exemplars

## Inputs

- The pattern or design question driving the consultation
- The candidate exemplars (from `references/exemplar-agents.md` or from the principal's pointer)

## Procedure

1. **Pick exemplars.** Read `references/exemplar-agents.md` for the canonical pointers. If the question is steward-shape, candidates include keeper, gov, preth, factory, control, knowledgetheory, autheory, lesser, a fleet manager. If the question is subagent or skill shape, look in `.claude/agents/` and `.claude/skills/` across the relevant repos.
2. **Read targeted files.**
   - For a steward: read the relevant `stack/<layer>.md` and one or two `skills/<skill>/SKILL.md`. Avoid reading the entire `steward.md` — read the source layers, not the build artifact.
   - For a subagent: read `.claude/agents/<name>.md`.
   - For a skill: read `.claude/skills/<name>/SKILL.md`.
3. **Extract the relevant shape facts.** Note specific patterns:
   - How is the identity layer structured?
   - How specific are the refusals in the soul layer?
   - How are consultation surfaces named?
   - How are validation gates inscribed?
4. **Cite specifically.** When applying findings, reference the exemplar by repo path and file. Vague "I read keeper and it does X" is less load-bearing than "in `paytheory/keeper/.codex/stack/20-keeper-soul.md` the refusal list grounds each entry in a specific invariant."
5. **Do not transplant.** Reading an exemplar is for understanding shape. The new agent instantiates the pattern; it does not copy the exemplar's content.

## Output

A small reading summary applicable to the driving design or audit question. Cite paths. Identify shape-level findings, not content.

## Red flags

- **Modifying anything in the consulted repo** — refuse; this skill is read-only
- **Wholesale copying of exemplar content into the new agent** — refuse; instantiate the pattern, do not transplant
- **Reading without a driving question** — refuse; consultation is for grounding a specific decision, not browsing
- **Reading `steward.md` instead of source layers** — prefer the source `stack/<layer>.md` files; `steward.md` is a build artifact and may be out of date

## After consulting

- Apply findings to the driving design / audit / pattern question
- Memory-append non-obvious patterns observed across multiple exemplars (these may seed Mode 1 `update-pattern-catalog` work)
- If the consultation surfaced a drift in an existing agent (something its own steward should know about), do NOT silently fix it — surface to the principal; the target agent's own discipline owns the remediation