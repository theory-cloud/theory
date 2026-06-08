---
title: Authoring & the gates
description: Pushing local content up into a namespace is a gated practice — off by default, opened by an explicit scope grant (a workspace discipline), and published only through a human-authorized publish that validates the drafts.
---

# Authoring & the gates

Authoring is the **inverse** of integration: it pushes local content *up* into the namespace as
drafts, then publishes it so others can install it. Because it mutates the source of truth, it is
**off by default** and wrapped in deliberate gates.

{% capture gated %}
Reading and installing from a namespace are **not** the same as writing to it. Authoring scope is a
**workspace discipline** — a deliberate operator opt-in — not a server-side scope claim. The server's
own gates are what actually hold: draft tools are exposed only on permitted namespace routes, and
publishing requires `direct_user_authorization=true`. The scope grant opens the **draft** surface;
it is never standing publish authority.
{% endcapture %}
{% include callout.html type="warn" title="Authoring is opt-in" content=gated %}

## The two postures

| | Integrate / operate | Author *(gated)* |
| --- | --- | --- |
| direction | namespace → local | local → namespace |
| default | on | **off** |
| opens via | just connecting | an explicit **scope grant** (workspace discipline), re-confirmed each session |
| reaches "published" via | n/a (you only read) | a per-publish **human-authorized publish** that validates the drafts |

## The gates

1. **Scope grant** *(workspace discipline)* — a deliberate, session-scoped opt-in that flips this
   workspace from pull-only to author-capable for the connected namespace. It is re-confirmed each
   session and never persisted as standing authority. It is *your* discipline, not a server-side
   scope — the server gates are below.
2. **Publish** *(the server gate)* — `agent_interface_publish` is the single mutation gate. It
   **validates the drafts internally** (failing closed if they're incomplete), creates the immutable
   snapshot, and **requires `direct_user_authorization=true`** for that specific publish. There is no
   separate pre-publish draft-validate tool; the scope grant is not this authorization, and the two
   are never bundled into one unattended step.
3. **Verify installability** *(after publishing)* — `agent_interface_validate` runs *published-only*
   installability checks for an active child agent + client profile, and `agent_interface_status`
   reports installability per host. Use them to confirm the published agent installs cleanly — they
   do not gate or expose drafts.

## The authoring flow, front to back

```text
grant-authoring-scope     open Mode 3 for this namespace (deliberate, session-scoped)
scope-agent-lite          one conversation: purpose, principal, hosts, invariants, ≥3 refusals
author-soul               create_agent + agent_soul_upsert — identity exists BEFORE any skill
author-skills             agent_skill_upsert per skill — tools follow identity
define-install-layout     agent_install_layout_upsert per host — the namespace renders the hosts
validate-and-publish      agent_interface_publish (human-authorized; validates drafts + snapshots),
                          then agent_interface_validate / agent_interface_status to confirm install
```

**Soul before skills before layouts** isn't advice — it's the order the namespace enforces. A skill
upsert targets an agent that `create_agent` + `agent_soul_upsert` already shaped.

{% include figure.html src="/assets/img/edu/open-source-flywheel.webp" max="440"
   alt="The open-source flywheel — build in public, real usage teaches the models"
   caption="Why publish: a real, visible, well-used agent is a flywheel. Publishing into a namespace makes your work installable, groundable, and improvable — not a one-off." %}

## Two shapes of authoring

- **Compose-new** — the interview-driven flow above: shape one new agent, write its soul, then its skills, then its layouts, then publish. → [Compose a new agent](/author/compose/).
- **Replicate** — a *verbatim* copy of an existing published agent from one namespace into another (e.g. lab → live). It composes nothing — it re-upserts the same identity unchanged — but keeps every gate, per agent. → [Replicate (lab → live)](/author/replicate/).

## Open the mode (a copyable prompt)

```text
I want to author a new agent into theorycloud. First confirm the authoring tools are present on
the route, then record an explicit, session-scoped authoring-scope grant for a single new agent
named "<new-agent-id>". State clearly that this opens the DRAFT surface only — not publish authority —
and that each publish will need its own authorization. Then start scope-agent-lite to shape it.
```

## The boundary (when to graduate)

This is the **get-started on-ramp**: you author **one agent at a time**, soul-first. It is not the
place for a pattern catalog, a multi-document design interview, cross-agent audits, fleets, API/SDK
agents, or prompt/template/lifecycle-pack authoring. When the work needs those, that's a signal to
**graduate to a formal progenitor** — a separate, deliberate step, not something this flow becomes.

Next: shape and write your first agent → [Compose a new agent](/author/compose/).
