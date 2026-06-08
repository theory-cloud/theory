---
title: Replicate (lab → live)
description: Copy an existing published agent verbatim from one namespace into another — composes nothing, changes nothing, but keeps every gate, per agent.
---

# Replicate (lab → live)

Replication is **not** authoring a new agent. It is a **verbatim copy** of an existing published
agent from a source namespace into a target namespace — the classic case being **lab → live**. It
composes nothing and changes nothing in transit; it re-creates the *same* identity elsewhere. But it
keeps every gate, applied per agent.

## Authoring vs replication

| | Compose a new agent | Replicate |
| --- | --- | --- |
| interview | yes (`scope-agent-lite`) | **no** — there's nothing to shape |
| what it writes | a new, distinct identity | the **same** published identity, unchanged |
| scope | one new agent | a **bounded, explicitly authorized set** (source → target, named ids) |
| gates | grant · soul-first · validate · publish | grant · soul-first · validate · publish **(per agent)** |

## The flow

For each agent in the authorized set:

1. **Read** the source agent's published soul, skills, and ADL v2 layouts from the source namespace;
2. **Stage** them locally (the same caller-writes-files discipline);
3. **Re-upsert** them **unchanged** into the target — soul first, then skills, then layouts;
4. **Validate** the target drafts (`agent_interface_validate`);
5. **Publish** with `direct_user_authorization=true` — its own authorization, per agent.

```text
Replicate these agents from theorycloud on lab.theorymcp.ai into theorycloud on
theorymcp.ai, verbatim: apptheory, tabletheory
For each, in order: read the source's published soul/skills/ADL layouts, stage them locally,
re-upsert them UNCHANGED into the target (soul first, then skills, then layouts), validate, and
publish with direct_user_authorization=true — one explicit authorization per agent. Do not edit
any soul or skill in transit. Stop and report if a validate fails.
```

{% capture verbatim %}
Replication is a **verbatim** copy under an explicit, bounded authorization. It is **never** a
license to edit the soul or skills in transit (that would be a separate, deliberate authoring
change), and **never** a way to bulk-publish around per-publish human authorization. Each replicated
agent passes a fresh validate and its own authorized publish, soul-first.
{% endcapture %}
{% include callout.html type="danger" title="Verbatim, gated, per agent" content=verbatim %}

## Why a separate practice

Bundling a "read from source" and a "publish to target" into one unattended sweep is exactly what the
gates exist to prevent. Replication keeps the **pull** and the **push** explicit and per-agent, so
"the namespace is the source of truth" holds in both namespaces at once: you copy what source
*published*, and target only reaches *published* through its own two gates.

## Open the mode for replication

The scope grant for replication names the bounded set up front:

```text
I want to replicate from theorycloud (lab) to theorycloud (live). Confirm the authoring tools are
present on the target route, then record an authoring-scope grant for a REPLICATION set: source
theorycloud on lab.theorymcp.ai, target theorycloud on theorymcp.ai, agent_ids [apptheory,
tabletheory]. State that this opens the draft
surface only and that each agent's publish needs its own authorization. Then begin, one agent at a
time.
```

Back to the authoring overview → [Authoring & the gates](/author/). Or see the whole tool surface →
[MCP tool surface](/reference/tools/).
