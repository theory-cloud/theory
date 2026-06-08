# Enumerate patterns (Mode 2)

After `scope-agent`, before `design-agent`. This skill names which existing patterns the new agent will instantiate, and surfaces any new patterns observed.

## When to use

- A scoped-agent document is approved
- Before producing the agent design document
- During an `audit-agent` reflexive review (to see if existing agents instantiate patterns coherently)

## When NOT to use

- Mode 1 work (use `scope-need` discipline instead)
- The agent is genuinely new in shape (a new agent kind not yet in v1 scope) — surface to the principal for pattern-catalog work first

## Inputs

- The approved scoped-agent document
- The pattern catalog at `patterns/`
- The references index at `references/exemplar-agents.md`

## Procedure

1. **Read the scoped-agent document.** Especially: agent kind, modes, peers, invariants.
2. **List candidate patterns.**
   - Always: at least one of `codex-steward` / `claude-subagent` / `claude-skill` / `api-agent` / `manager-expert-fleet`
   - Likely: `soul-first-design` (universal), `refusal-list` (universal), `two-modes` (if Mode 2 is named)
   - Possible: `consultation-surface` (if same-tenant peers exist)
3. **Read each candidate pattern doc.** Confirm it applies. Note any places the new agent will deviate from the canonical pattern (deviations are fine if explicit; surprise deviations later are not).
4. **Identify potential new patterns.**
   - Is there a relationship shape in the new agent that no existing pattern doc captures?
   - Is there an instantiation approach the new agent will use that's not in the catalog?
   - If yes, name the new pattern. Note: capturing it is a Mode 1 follow-up (`update-pattern-catalog`); production of the new agent proceeds with the new pattern noted, and the catalog update happens after.
5. **Read at least one exemplar agent.**
   - Use `consult-existing-stewards` to read a similar agent in the corpus.
   - Why: pattern docs describe shape; reading an exemplar grounds the description in actual files.
6. **Produce the patterns-applied document.**

## Output

A patterns-applied document with:

- **Patterns instantiated** — names + brief notes on how
- **Deviations** — places the new agent will not follow the canonical pattern, with reason
- **New patterns observed** — names + brief notes (these will need Mode 1 follow-up to capture in catalog)
- **Exemplar agents read** — pointers to the canonical exemplars used as reference

## Red flags

- **No pattern applies** — refuse; one of `codex-steward` / `subagent` / `skill` / `api-agent` / `fleet` should apply. If genuinely none does, the agent kind is out of v1 scope.
- **Skipping the exemplar read** — refuse; the pattern doc is a description, the exemplar is the fact
- **Capturing a "new pattern" that's actually a variant of an existing one** — extend the existing doc instead
- **Marking deviations without reason** — refuse; deviations require an explicit reason

## After enumeration

- Hand off to `design-agent` for the design document
- If new patterns were observed, queue Mode 1 `update-pattern-catalog` work for after the Mode 2 production completes