# Audit an agent

A reflexive review of any agent — including progenitor itself. The output is an audit note. Remediation is a separate work item, owned by the target agent's own steward / repo.

This skill is read-only against the target. It does not edit the target's files.

## When to use

- the principal asks for a review of an existing agent
- A new pattern has been added to the catalog and you want to check which existing agents could now apply it
- progenitor's reflexive periodic self-audit
- An agent is reported as drifting / misbehaving / showing unexpected gaps
- Before significantly redesigning an existing agent, audit first to know what's already in place

## When NOT to use

- Modifying the target agent's files — this skill is read-only
- Producing a new agent — use the scope-agent / design-agent / create-* flow
- Casual browsing — audits are driven by a specific question or periodic schedule, not idle curiosity

## Inputs

- The target agent (path, name, kind)
- The driving question, if any (specific concern vs. general health)
- The pattern catalog and references index

## Procedure

1. **Identify the agent kind.** Codex steward? Subagent? Skill? API agent? Manager+expert fleet? Read the target's directory shape to confirm.
2. **Read the relevant materials.**
   - For a steward: read `stack/*.md` and a representative sample of `skills/*/SKILL.md`. Read the `config.toml` to confirm tenancy.
   - For a subagent: read `.claude/agents/<name>.md`.
   - For a skill: read `.claude/skills/<name>/SKILL.md` (and supporting files if any).
   - For an API agent: read the system prompt, tool schemas, and supporting docs.
3. **Audit per axis.**

   **Identity axis** — Does the agent know what it is? Is its tenancy / runtime context unambiguous? Does the identity layer match the config?

   **Philosophy axis** — Does the agent have domain-specific commitments? Or is the philosophy layer generic?

   **Discipline axis** — Are work shapes named? Are validation gates inscribed?

   **Boundaries axis** — Is in-scope vs out-of-scope clear? Are cross-agent boundaries explicit? Are destructive actions named?

   **Soul axis** — Are refusals concrete? Is each refusal grounded in an invariant? Is the "let me bypass X just this once" framing present?

   **Skills axis (for stewards)** — Are the skills coherent with the agent's stated discipline? Are consultation skills present for same-tenant peers? Are mode-1 vs mode-2 skills distinguished?

   **Pattern axis** — Which patterns from the catalog does the agent instantiate? Are there deviations? Are the deviations justified?

   **Drift axis** — Are there places where the agent's stated behavior contradicts what it actually does (per the corpus reading and any prior memory entries about its behavior)?

4. **Identify gaps and surface them.**
   - Missing soul-layer concrete refusals
   - Missing consultation surfaces for known peers
   - Tenancy/identity disagreement between config and stack
   - Two-mode framing missing when Mode 2 work clearly exists
   - Pattern catalog gaps (the agent instantiates a pattern not in the catalog)
5. **Produce the audit note.**

## Output

An audit note covering:

- **Target** — agent name, kind, path
- **Per-axis findings** — strong points, weak points, gaps
- **Recommended remediations** — each tagged as: Mode 1 in target's repo / Mode 1 in progenitor (pattern-catalog update) / out of scope
- **Priority** — which remediations are load-bearing vs nice-to-have

## Red flags

- **Modifying the target's files** — refuse; this skill is read-only
- **An audit without a driving question or periodic schedule** — refuse; audits should be purposeful
- **Reading the build artifact (`steward.md`) instead of source layers** — prefer the source `stack/<layer>.md` files
- **Recommending remediations to be applied invisibly** — refuse; remediations are surfaced to the principal and the target's own discipline owns them
- **Auditing as a pretext for content opinions** — audits are about shape and coherence with stated invariants, not about what the agent should believe in its domain

## After auditing

- Hand the audit note to the principal
- If the audit surfaced a Mode 1 follow-up for progenitor (pattern-catalog gap, references-index update), queue it
- If the audit surfaced a Mode 1 follow-up for the target's own steward, surface it — the target's discipline owns the change
- Memory-append the audit findings