---
name: grant-authoring-scope
description: The deliberate, operator-driven gate that flips this workspace from pull-only (integrate/operate) to author-capable (Mode 3) for the connected namespace. Confirms the authoring tools are present on the route, records the operator's explicit intent to author — either a single named target agent (compose-new) or a bounded, explicitly authorized replication set (source → target, named agent_ids) — names the get-started boundary, and states that the grant opens the DRAFT surface only, never standing publish authorization. Run this before any author-* / define-install-layout / validate-and-publish / replicate-namespace-agents skill.
---

# Grant authoring scope

Authoring is OFF by default. The soul refuses to mutate the namespace from this workspace *unless
authoring scope has been explicitly granted* — this skill is that grant. It is the one act that opens
Mode 3, and it is session-scoped: it opens the draft surface for one named agent (compose-new) or one
bounded, explicitly authorized replication set (source → target), it never authorizes a publish, and
it is re-confirmed each session rather than persisted as a standing grant.

## When to use

- The operator wants to push local content *up* into the connected namespace from this workspace —
  either author a new agent / revise an existing one's drafts (**compose-new**), or copy an existing
  published corpus into it from another namespace (**replication**).
- Before `scope-agent-lite` / the author-* skills (compose-new) or `replicate-namespace-agents`
  (replication) — they all check that this grant has run.

## When NOT to use

- For pull-only work (integrate / operate). Discovering, listing, materializing, verifying, updating
  need no authoring scope.
- As standing authorization. This grant is session-scoped: a new session re-runs it. For compose-new
  it is per-agent; for replication it covers the one bounded, named set authorized this session — never
  a standing or open-ended grant. It is never a substitute for the per-publish human authorization in
  `validate-and-publish` / `replicate-namespace-agents`.

## Inputs

- A grounded namespace (`discover-namespace`) whose route exposes the authoring tools.
- The operator's explicit, in-their-own-words intent to author, and either the target `agent_id`
  (compose-new; new or existing) or — for replication — the bounded set of source → target `agent_id`s
  being authorized (source ≠ target).

## Procedure

1. **Re-ground read-only.** Run `discover-namespace` (`describe_interface`; `server_instructions` if
   needed) and confirm `endpoint_kind = namespace` AND that the authoring tools appear in
   `available_tools` / `next_steps`: `create_agent`, `agent_soul_upsert`, `agent_skill_upsert`,
   `agent_install_layout_upsert`, `agent_interface_validate`, `agent_interface_publish` (and
   `agent_install_profile_list` / `agent_install_profile_upsert` if you will author for a non-built-in
   client such as `antigravity`, which must be registered in the namespace install-profile catalog
   before its layout will install). Route presence of these tools is **necessary but is NOT the grant**.
2. **Confirm operator intent — and which shape.** Get the operator's explicit intent to AUTHOR into
   THIS namespace from THIS workspace, and name either the target `agent_id` (compose-new; new or
   existing) or the bounded **replication set** (source → target, named `agent_id`s; source ≠ target).
   State plainly that this opens a named third mode (author/push), that a replication set is bounded —
   not a standing grant — and that it is never a side-effect of integrating (Mode 1) or operating
   (Mode 2).
3. **Name the get-started boundary out loud.** Theory authors one agent at a time when *composing*
   (replication copies a bounded, authorized existing set — still per-agent, soul-first, two-gate). If
   the operator needs a pattern catalog, multi-document design pipeline, fleets, cross-agent audit,
   API/SDK agents, or prompt/template/lifecycle-pack authoring, that is formal-progenitor work — say so
   and point them to graduating; do not begin authoring a shape Theory cannot honor.
4. **State the limit of the grant.** It authorizes DRAFT authoring only (soul / skills / install
   layouts via the upsert tools). It never publishes; publish stays separately human-gated per-publish
   at `validate-and-publish` (and per-agent for a replication set). The standing no-upstream-mutation
   refusal now narrows to no-push-without-the-validate-and-human-publish gates.
5. **Record the grant in plain language for the session:** which namespace route, which `agent_id`
   (or which bounded replication set), which host profiles will get install layouts, and that the
   operator authorized it. Until this skill has run and recorded a grant, the soul refuses every
   upsert/publish by default.

## Outputs

- A recorded, session-scoped authoring grant: route + `agent_id` (or the bounded replication set) +
  intended host profiles + the operator's authorization, and an explicit note that publish remains
  separately gated per agent.
- A confirmation that the authoring tools are live on the route.

## Red flags

- Treating route presence of the authoring tools as an automatic grant.
- Authoring without the operator's explicit opt-in, or beginning before naming the get-started boundary.
- Implying the grant authorizes publishing — it opens drafts only; every publish is separately authorized.
- Persisting the grant as a standing authorization rather than re-confirming it per session; or treating
  a replication-set grant as open-ended rather than bounded to the named set.

## After completing

- For **compose-new**, hand to `scope-agent-lite` to confirm the agent's shape before any namespace write.
- For a **replication set**, hand to `replicate-namespace-agents` (no interview — replication composes nothing).
