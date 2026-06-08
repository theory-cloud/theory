---
name: scope-need
description: Use when a user brings a new capability, feature request, or operator need for KnowledgeTheory in vague terms. Interviews conversationally and produces a scoped-need document. Does not write code.
---

# Scope a need

A need arrives fuzzy. A feature arrives sharp. This skill is the conversation that turns one into the other. The output is a document, not code.

## Your posture

You are interviewing, not pitching. Because KnowledgeTheory is a product built to serve `theory-mcp-server` (and `pai-socket`) rather than a general-purpose framework, the scoping question is always **"which frontend's concrete need does this serve?"** If no frontend need is behind the request, the scope burden is higher, not lower — speculative features in a product are a source of drift.

## Start with memory and knowledge

- `memory_recent` — has this need or something adjacent been scoped before?
- `query_knowledge` — what does the current documentation say about the affected area? Often the answer is already there.

If tools are unavailable, surface that and ask the user to re-auth.

## The interview

Ask, one or two at a time, in roughly this order:

1. **Who is asking and why now?** Is this a `theory-mcp-server` need, a `pai-socket` need, an operator pain point, or something else? If no frontend is named, gently probe — a KT change that doesn't serve a concrete consumer is usually either an architectural defense that belongs in a different form, or speculation.
2. **What problem does it solve?** Frame in terms of current pain, not proposed solution.
3. **What is the nearest existing KT surface?** Is there a connector, a validator, a query mode, a schema field, or a make target that gets 80% of the way? Many requests dissolve at this step.
4. **Which plane does this touch?** Ingestion, compilation, query, or multiple? Requests that touch multiple planes need scrutiny — are they re-entangling the planes, or legitimately cross-plane?
5. **Does this require a schema change?** `unit.schema.json`, `manifest.schema.json`, or the retrieval-semantics contract in `spec/knowledge-access-contract.md`? If yes, the scoping conversation has to surface every consumer that will be affected — `theory-mcp-server`, `pai-socket`, any downstream operator tooling.
6. **Stage impact.** Does this change behavior in `lab` only, or eventually `live`? If `live`, is there a rollout sequencing story?
7. **What does success look like?** Observable, not aspirational. "Queries on the `apptheory` module return units within 200ms at p50" is observable. "Better" is not.
8. **What is explicitly out of scope?**

## The architectural-impact question

Before the conversation ends, answer the question that determines everything downstream:

> **Does delivering this need require crossing a stewardship defense?**

The defenses are: plane separation, schema contracts, internal-only boundary, immutability, stage isolation, fail-closed validation. Three possible answers:

1. **No** — can be delivered inside the existing planes, schemas, and connectors. Happy path.
2. **Yes, additively** — requires a new connector, a new validator, a new schema field added without changing existing ones, a new `caller_context` input. Doable, but requires coordination with the consumer(s) that will use it.
3. **Yes, breaking** — requires changing an existing schema shape, altering retrieval semantics, re-entangling planes, or weakening a fail-closed invariant. This is the hard case. Breaking changes to schemas or retrieval semantics affect every frontend simultaneously, and they cannot be shipped without a coordinated plan.

If you suspect (3), say so explicitly. Do not let a breaking change sneak through scoping as if it were (2).

## Output: the scoped-need document

```markdown
# Scoped Need: <short name>

## Background
<one paragraph of context — why the user is asking now>

## Frontend need
<theory-mcp-server / pai-socket / operator / other — with the concrete pain it addresses>

## Problem
<what is broken, missing, or painful today>

## Planes affected
<ingestion / compilation / query / multi>

## Schema impact
<none / additive / breaking — with affected schemas and consumers>

## Architectural impact
<no change / additive / breaking — with justification>

## Success criteria
<observable, testable conditions that define "done">

## Nearest existing surface
<what in KnowledgeTheory today gets partway there>

## Out of scope
<what this need explicitly does not cover>

## Open questions
<things the user hasn't decided yet>
```

## Persist before handoff

Append only if the scoping surfaces something worth remembering — a rejected proposal with a clear reason, a pattern of requests in an area, a user correction about scope boundaries. Routine scope completions aren't memory material.

## Handoff

- If the user approves the scoped need, invoke `enumerate-changes`.
- If the conversation resolved to "we already handle this" or "the nearest surface already does it, the user just hadn't found it," record that in memory and stop. That's a successful scope.
- If the scoped need requires a schema change, note that `evolve-schema` will be needed inside the implementation work, not instead of the pipeline — you still enumerate, roadmap, linearize, and implement, but the schema step is treated with extra care.
- If the user wants to defer, note it in memory and stop.
