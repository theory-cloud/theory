# Scope a need (Mode 1)

Mode 1 work. A change to progenitor's own corpus — a new skill, a revised stack layer, a new pattern doc, an extension to which agent kinds you support, a config or build.sh change.

This is the scope-need shape used across the stewardship corpus, adapted for progenitor's reflexive concerns.

## When to use

- Adding a new skill to progenitor
- Revising a stack layer
- Adding a new pattern to `patterns/`
- Adding support for a new agent kind (e.g., MCP server scaffolding, LangGraph agents)
- Changing config.toml or build.sh
- Updating the references index
- Any change that affects how progenitor produces agents

## When NOT to use

- Producing a new agent for another repo — use `scope-agent` instead
- Tiny clarifications (a typo, a one-line README fix) — direct commit is fine
- A pattern-catalog update bundled with an agent-production event — split into separate work items

## Inputs

- The change request (verbatim from the principal)
- Prior memory entries that touch the same surface (`memory_recent`)
- Current state of the affected stack layer / skill / pattern doc

## Procedure

1. **Recall context.** `memory_recent` for related prior decisions about progenitor's own discipline.
2. **Restate the change in your own words.** Confirm with the principal before proceeding.
3. **Invariant-impact analysis.** Does the change affect:
   - **Soul-first design** — does the change weaken the requirement that every agent has a soul layer?
   - **Pattern catalog discipline** — does the change introduce a "shortcut" path that bypasses the catalog?
   - **scope-agent always first** — does the change introduce an exception to the interview-first rule?
   - **Two-mode discipline** — does the change conflate Mode 1 and Mode 2?
   - **Refusal-list specificity** — does the change weaken any concrete refusal?
   - **Tenancy / authority** — does the change affect how tenancy is inscribed?
4. **If invariant impact is non-trivial, name it explicitly.** A change that weakens an invariant requires the principal's explicit acknowledgment.
5. **Surface options.** When the change has multiple shapes, name them with tradeoffs.
6. **Produce the scoped-need document.** A short markdown doc with:
   - Background
   - Change requested
   - Invariant impact (per axis)
   - Options considered
   - Recommended shape
   - Out of scope
7. **Confirm with the principal.** Wait for approval before handing off to `enumerate-changes`.

## Output

A scoped-need document at `docs/scoped-needs/<date>-<slug>.md` (if progenitor has such a directory; otherwise inline in conversation). Hand-off ready for `enumerate-changes`.

## Red flags

- **"Just add the skill" without scoping** — refuse the framing; the interview matters
- **A change that introduces a bypass for scope-agent** — refuse and root-cause; if the principal believes a bypass is needed, the failure is in the scope-agent skill itself, not in adding an exception
- **A pattern-catalog change without a real new pattern** — patterns are added when new shapes are *observed*, not invented preemptively
- **Mixing this with Mode 2 work** — split

## After scoping

- Hand off to `enumerate-changes` for the focused-commits list
- Memory-append the scoped-need outcome with the invariant-impact decisions made