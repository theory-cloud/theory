---
name: author-soul
description: Author the agent's identity into the namespace via create_agent (if new) + agent_soul_upsert, enforcing soul-first ORDER — this skill completes before author-skills, so identity exists in the namespace before any skill does. Composes a coherent 5-concern soul (identity / philosophy / discipline / boundaries / refusal-list) from the confirmed shape, and enforces the refusal-list specificity rule as HARD refusals, not nudges.
---

# Author the soul

Identity before tools. This is the soul-first guarantee made operational: the agent's soul is written
into the namespace as a draft *before* any skill, instruction, or layout exists for it. A skill
upserted against a soulless agent is the guarantee broken; the namespace enforces the order, and so do
you.

## When to use

- After `scope-agent-lite`, with an operator-approved shape, to write the agent's draft soul.

## When NOT to use

- Before the shape is confirmed, or before authoring scope is granted.
- To publish — `agent_soul_upsert` writes a draft only; publishing is `validate-and-publish`.

## Inputs

- The confirmed shape from `scope-agent-lite` (purpose / principal / hosts / invariants / ≥3 refusals).
- The target `agent_id` from the recorded grant.

## Procedure

1. **Check existence.** Call `list_agents`. If the `agent_id` is absent, call `create_agent(agent_id,
   display_name, optional instructions seed)` — note `create_agent` CANNOT set route / namespace /
   toolset / entitlement (server-derived; the call rejects them), and its optional instructions seed is
   draft-only and never touches soul or skills. If the agent already exists, skip `create_agent` and
   revise its draft soul.
2. **Compose a coherent 5-concern soul** from the confirmed shape, the same layered shape Theory's own
   SOUL.md uses: **identity** (what it is, where it lives, its principal) / **philosophy** (the
   invariants as beliefs) / **discipline** (its canonical flow) / **boundaries** (what it owns vs what
   is upstream / out of scope) / **refusal-list** (the confirmed ≥3 invariant-grounded refusals plus a
   cardinal-failure framing).
3. **Enforce the soul-first guarantee as HARD refusals:** fewer than three concrete refusals → refuse;
   any refusal not traceable to a stated invariant → refuse; transplanting an existing namespace
   agent's soul wholesale → refuse (instantiate the shape, do not copy the exemplar).
4. **Write the draft soul** with `agent_soul_upsert(agent_id, body, summary)`. One call. The body is
   versioned, attributable, and NEVER publishes; it fits the soul body limit (a full soul is ~12 KB,
   well under it).
5. **Confirm** the soul is present as a draft (`agent_soul_get` if needed). Refuse to author any skill
   before this upsert has succeeded.

## Outputs

- The agent's draft soul written into the namespace (5 concerns, ≥3 invariant-grounded refusals),
  with `create_agent` run first if the agent was new — identity in place before any skill.

## Red flags

- Authoring a skill before the soul upsert has succeeded (soul-first order broken).
- Shipping a soul with fewer than three refusals, or refusals not grounded in invariants.
- Copying an existing agent's soul and find-replacing names instead of instantiating the shape.
- Trying to set route / namespace / entitlement via `create_agent` — those are server-derived.

## After completing

- Hand to `author-skills` to write the agent's skills, soul-first order preserved.
