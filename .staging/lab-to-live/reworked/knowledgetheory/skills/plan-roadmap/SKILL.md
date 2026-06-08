---
name: plan-roadmap
description: Use after enumerate-changes. Takes a flat enumerated change list for KnowledgeTheory and sequences it into phases with dependencies, risks, and milestone candidates. Produces a roadmap document, not code or Linear state.
---

# Plan a roadmap

A flat enumerated list answers "what changes." A roadmap answers "in what order, in what groups, with what risks." This skill is the bridge.

## Input required

An approved enumerated change list from `enumerate-changes`. If you don't have one, stop — planning a roadmap without a concrete change list produces fiction. Load prior context with `memory_recent`; check for past roadmaps in the same subsystem that might share dependencies or constraints.

## Dependency analysis

Walk the enumerated list and draw the dependency graph. For each item, answer:

- **Hard dependencies** — which items must land *before* this one for it to compile, pass tests, or be meaningful?
- **Soft dependencies** — which items *should* land before this one for the change to make sense in review, even if not strictly required?
- **Parallelizable siblings** — which items have no ordering constraint with this one and could be done in any order?

Hard dependencies define the minimum topology. Soft dependencies define the preferred order within it. Siblings define opportunities to batch into a single phase without losing clarity.

## Phase shape

A good KnowledgeTheory roadmap usually has three to five phases. More is usually a sign you're grouping by artifact (runtime, then TS, then Py) rather than by capability. Phases are about *delivered value*, not about *files touched*.

Canonical phase patterns for KnowledgeTheory:

1. **Schema and contract** — schema changes, spec updates, shared contract moves. Lands first because every plane depends on contract stability. If there is no schema change, this phase is empty or skipped.
2. **Ingestion plane** — connector changes, snapshot shape changes, normalization updates. Lands before compilation because compilation consumes snapshots.
3. **Compilation plane** — compiler, validator, parser, publish pipeline, DynamoDB writes, S3 Vectors writes, manifest refresh logic. Lands after ingestion.
4. **Query plane** — query API, handlers, search, retrieval semantics. Lands after compilation because it serves compiled output.
5. **Operator workflows and deploy** — `Makefile` targets, CDK/SSM updates that support operator commands, runbooks.
6. **Verification and cleanup** — gov-infra rubric updates, evidence captures, final end-to-end validation in `lab` before any `premain → main` promotion is considered.

Not every roadmap uses all six. A connector-only roadmap might just have phases 2, 5, 6. A schema evolution roadmap touches every phase because schema changes ripple everywhere.

## Stage rollout is part of the roadmap

Every roadmap must answer: **how does this reach `live`?** The default answer is:

1. Feature branches merge to `premain`.
2. `premain` is deployed to `lab` via `theory app up --stage lab --execute`.
3. In `lab`, the operator workflows exercise the new behavior against real sources (usually a single module or KB at a time).
4. If `lab` is stable after a deliberate soak period, a PR merges `premain` → `main`.
5. `main` is deployed to `live` via `theory app up --stage live --execute`.
6. After promotion, `main` is back-merged into `premain` so the next cycle starts from the same baseline.

Surface the expected lab soak time and the criteria that must be met before promotion. "Soak for a week" is insufficient; "soak until `theorycloud` KB has gone through three successful publish cycles and the query latency hasn't regressed" is a real criterion.

## Risk register

For each phase and the roadmap as a whole:

- **Known unknowns** — things you know you don't know. "We don't know whether the new connector's rate limits will handle the source volume at full scale."
- **Cross-repo risks** — changes that need coordination with `theory-mcp-server` or `pai-socket` maintainers. Name the steward you will need to coordinate with.
- **Schema-drift risks** — if any schema change is in the roadmap, the risk is *every consumer* at once. Plan how consumers learn about the change.
- **Stage-isolation risks** — any proposal that sounds like it touches cross-stage state. Usually a design error worth resolving before the roadmap ships.
- **gov-infra risks** — if the rubric needs to grow to track new surface area, call it out; a silent rubric gap is how drift enters later.

A risk that has no mitigation is a blocker. Call it out and do not proceed until it's resolved.

## Milestone candidates

A milestone is the unit of Linear planning. For KnowledgeTheory:

- A phase with 1–5 items is usually one milestone.
- A phase with 6–15 items splits into two or three milestones by capability cluster.
- A phase with more than 15 items is probably not a single phase — reconsider.

Each milestone has a short name and a one-sentence goal. If you can't write the goal in one sentence, the milestone isn't coherent yet.

## Output format

```markdown
# Roadmap: <scoped-need name>

## Goal
<one paragraph — what the full roadmap delivers and why>

## Phases

### Phase 1: <name>
**Milestone candidates:**
- **<milestone-short-name>** — <one-sentence goal>
  - Items: <enumerated item numbers from the change list>
  - Dependencies: <what must land first>
  - Risks: <bullet list, or "none">

### Phase 2: <name>
...

## Stage rollout plan
<premain → lab soak criteria → premain to main → live, with specifics>

## Cross-phase risks
- <risks that span phases or affect the release model>

## Cross-repo dependencies
- <any changes required outside KnowledgeTheory, with which stewards are affected>

## Deprecation and migration plan
<only if applicable>

## Open questions
<things that must be answered before Linear creation>
```

## Persist

Append only if the roadmap exposes a decision, constraint, or cross-repo coordination requirement worth remembering. Routine roadmaps that flow cleanly aren't memory material.

## Handoff

- If the user approves the roadmap and wants to track it formally, invoke `create-linear-project`.
- If the roadmap reveals cross-repo work, pause and surface it to the user before continuing. Cross-repo changes need coordination with other stewards, which is outside the scope of any single agent.
- If the user wants to defer the roadmap or execute informally without Linear, that's fine — the roadmap document is still useful as a reference. Note the deferral in memory and stop.
