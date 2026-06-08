# Scope an agent (Mode 2)

The interview that grounds every new agent in something other than pattern-matching. No exceptions. Even for "quick" or "simple" agents — the interview can be short, but it happens.

This is the first skill in any Mode 2 flow.

## When to use

- the principal asks for a new agent of any kind (steward, subagent, skill, fleet, API agent)
- An existing agent is being significantly redesigned (treat as new scoping)
- A new agent kind is being added to v1 scope (do scope-agent for a hypothetical instance to validate the pattern)

## When NOT to use

- Mode 1 work (changes to progenitor itself) — use `scope-need`
- Trivial edits to an existing agent's stack — use the target agent's own `scope-need` (in its own .codex/, if it has one)

## Inputs

- the principal's request (verbatim)
- Target repo or location, if known
- Prior memory entries (`memory_recent`) for related prior agent designs
- The existing corpus (you may run `consult-existing-stewards` mid-interview if useful)

## Procedure

1. **Recall context.** `memory_recent` for related prior scoping. If the principal has scoped a similar agent before, build on that context.
2. **Establish the agent's purpose.**
   - What is the agent for, in one or two sentences?
   - What problem does its existence solve?
   - If the answer involves more than one purpose, separate them — the agent may need to be split.
3. **Establish the principal.**
   - Who directs the agent? the principal? A team? Another agent? Some combination?
   - What is the authorization model? Is the agent fully autonomous within its scope, or does it require confirmation for certain actions?
4. **Establish the runtime context — agent kind.**
   - `.codex/` steward (the 5-layer stack pattern)
   - Manager+expert fleet
   - Claude Code subagent (`.claude/agents/<name>.md`)
   - Claude Code skill (`.claude/skills/<name>/SKILL.md`)
   - Claude API agent (system prompt + tool schemas)
   - Something else (surface to the principal; may require pattern-catalog work)
5. **Establish tenancy (for stewards and fleet agents).**
   - Which tenant? `theorycloud/agents/<slug>/mcp`, `paytheory/agents/<slug>/mcp`, or other?
   - What slug? Confirm with the principal.
   - What scopes? Default: `["mcp:tools", "ai.kb.query", "memory.append"]` with `memory_append` approval-mode `approve`.
6. **Establish peers.**
   - Same-tenant peers (will need `consult-<peer>-steward` skills with email-allowlist consultation)
   - Cross-tenant peers (surfaced via user, generally not direct)
   - Cross-tenant consumers (downstream agents that depend on this one)
7. **Establish modes.**
   - Mode 1 (changing the agent / repo): always present
   - Mode 2 (operational): present only if the agent has an operational dimension distinct from changing its corpus
   - If Mode 2 is present, name it explicitly: "deploy a stage", "produce a new partner expert", "dispatch a release batch", etc.
8. **Establish core invariants.**
   - What truths must the agent hold even when asked to deviate?
   - Examples: read-only-as-wall (keeper), no-licensed-text (gov), training-data-as-first-product (preth), knowledge-curation (a fleet expert).
   - Each invariant should be specific enough that a violation is recognizable.
9. **Draft a refusal list.**
   - At least three concrete refusals.
   - Each refusal grounded in an invariant from step 8.
   - The "let me bypass X just this once" framing should appear at least once.
10. **Identify out-of-scope concerns.**
    - What is this agent explicitly NOT responsible for?
    - Which other agents own those concerns?

## Output

A scoped-agent document covering:

- **Purpose** — one or two sentences
- **Principal & authorization** — who directs; what requires explicit per-event auth
- **Agent kind** — codex-steward / subagent / skill / fleet / API / other
- **Tenancy** — URL, slug, scopes (if applicable)
- **Peers** — same-tenant + cross-tenant
- **Modes** — Mode 1 always; Mode 2 named explicitly if applicable
- **Core invariants** — 3-7 named truths
- **Refusal list (draft)** — at least three concrete refusals
- **Out of scope** — explicit non-responsibilities

The document is shown to the principal, who confirms or revises. Only then proceed to `enumerate-patterns`.

## Red flags

- **"Just emit it, we'll figure out the soul later"** — refuse; soul-first design is the discipline
- **An agent purpose that's vague** ("help with stuff") — keep interviewing until specific
- **Tenancy that's "wherever"** — refuse; tenancy is part of identity
- **A refusal list that's generic** — push back with concrete examples
- **An interview that wants to skip core invariants** — refuse; invariants are the agent's spine
- **A multi-purpose agent** — propose splitting; one agent, one subject

## After scoping

- Hand off to `enumerate-patterns` to identify which existing shapes the new agent will instantiate
- Memory-append the scoped-agent outcome