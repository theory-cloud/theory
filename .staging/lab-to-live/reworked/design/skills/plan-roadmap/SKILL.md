---
name: plan-roadmap
description: Use after enumerate-changes. Takes a flat enumerated change list for theory-cloud-design and sequences it into phases with dependencies, risks, and milestone candidates. Explicitly handles the multi-repo cascade. Produces a roadmap document, not code or Linear state.
---

# Plan a roadmap

A flat enumerated list answers "what changes." A roadmap answers "in what order, in what groups, with what risks, across which repos." This skill is the bridge.

theory-cloud-design is the rare Theory Cloud repo where multi-repo cascade is the norm rather than the exception. A roadmap here usually spans theory-cloud-design, FaceTheory, autheory, and theory-mcp-server — with one milestone per milestone per repo it touches, per the Linear project model for the design-system rollout.

## Input required

An approved enumerated change list from `enumerate-changes`. Load prior context with `memory_recent`.

## Dependency analysis

For each enumerated item, identify:

- **Hard dependencies** — items that must land first for this one to typecheck, validate, or be meaningful
- **Soft dependencies** — items that should land first for the change to make sense in review
- **Brand-document dependencies** — items that require a document section to have moved first
- **Cascade dependencies** — items whose value is only realized after FaceTheory pins, which can only happen after theory-cloud-design releases
- **Parallelizable siblings** — items with no ordering constraint

## Phase shape

A theory-cloud-design roadmap usually has three to five phases, shaped around the brand-document / tokens / assets / packaging / cascade layering:

1. **Brand document and spec** — any changes to `theory_cloud_branding_package.md` land first because every other change implements a document line.
2. **Base tokens and typed exports** — the foundational token primitives, followed by their typed surface. Lands before surface variants depend on them.
3. **Surface variants** — Core, MCP, Auth token overrides. Can land in parallel with each other once base is stable.
4. **Assets** — icon set, wordmark lockups, favicons, app tiles, social templates. Often parallel with tokens.
5. **Documentation, packaging, and release preparation** — `README.md`, consumer migration notes, `package.json` exports, release-please configuration. Lands last within theory-cloud-design's phases.
6. **Cut release** — a clean `v0.Y.Z` that consumer apps can pin.

This is the theory-cloud-design side. Downstream phases live in consumer repos and their own stewards' pipelines.

## The multi-repo cascade is part of the roadmap

Every roadmap answers: **which repos does this touch, in what order?** The default cascade for a token or asset change:

1. **theory-cloud-design** — implement the change, cut a release (`v0.Y.Z`).
2. **FaceTheory** — the FaceTheory steward updates the pin, possibly adjusts a primitive (Topbar slots, BrandHeader, `StitchTokenSet` shape), cuts a FaceTheory release.
3. **autheory** — the autheory steward pins the new theory-cloud-design and FaceTheory releases, reskins `hub-admin-portal` against the `[Auth]` surface.
4. **theory-mcp-server** — the theory-mcp-server steward pins the new releases, reskins `control-plane` against the `[MCP]` surface.

Each cascade step is a **separate milestone in its own repo**, owned by that repo's steward. theory-cloud-design's roadmap enumerates and sequences its own work, and notes the downstream work as coordination dependencies rather than enumerated commits.

The Linear project structure follows this: for a cascading change, there is one Linear milestone for theory-cloud-design, one for FaceTheory, one for autheory, one for theory-mcp-server (if affected). Issues within each milestone are that repo's commits.

## Risk register

- **Known unknowns** — things you know you don't know
- **Brand-document consistency risks** — changes that risk creating internal contradictions in `theory_cloud_branding_package.md`
- **Cascade risks** — consumer apps pinning while in the middle of their own releases, creating coordination windows where versions drift
- **Asset regression risks** — icon or wordmark changes that might look right in isolation but produce visual regressions in consumer apps (header chip alignment, favicon legibility at small sizes)
- **Three-surface consistency risks** — changes that apply to one surface variant but whose logic should apply to all
- **Version-pinning risks** — downstream apps pinning to release candidates that haven't soaked enough
- **Rollback story** — what does "this RC produced visual regressions in autheory" look like, and what's the first thing we do?

A risk with no mitigation is a blocker. Call it out and do not proceed.

## Milestone candidates

Each phase maps to one or more milestones. For theory-cloud-design specifically, following the Linear project model:

- A phase with 1–5 items is usually one milestone.
- A phase with 6–15 items splits into two or three milestones by capability cluster.
- A phase with more than 15 items is probably not a single phase — reconsider the phasing.

Each milestone has a short name (`tcd-<capability>`) and a one-sentence goal. If you can't write the goal in one sentence, the milestone isn't coherent yet.

Milestone names should follow the convention already in use in the design-system rollout project in your tracker:

- `tcd-brand-pack-foundation`
- `tcd-facetheory-primitives` (if the cascade extends)
- `tcd-autheory-reskin` (if the cascade extends)
- `tcd-mcp-control-plane-reskin` (if the cascade extends)
- Future: `tcd-<capability>-<scope>`

## Output format

```markdown
# Roadmap: <scoped-need name>

## Goal
<one paragraph — what the full roadmap delivers and why>

## Brand-document area affected
<section citations from theory_cloud_branding_package.md>

## Surfaces affected
<Core / MCP / Auth / all / surface-agnostic>

## Repos in the cascade
<theory-cloud-design / FaceTheory / autheory / theory-mcp-server — with the order>

## Phases (theory-cloud-design side)

### Phase 1: <name>
**Milestone candidates:**
- **<tcd-milestone-short-name>** — <one-sentence goal>
  - Items: <enumerated item numbers>
  - Dependencies: <what must land first>
  - Cascade flag: <none / FaceTheory / autheory / theory-mcp-server>
  - Risks: <bullet list>

### Phase 2: <name>
...

## Cascade phases (downstream repos)

### FaceTheory milestone (if affected)
- Pins required: theory-cloud-design `v0.Y.Z`
- Primitive adjustments: <none / Topbar slot / BrandHeader / StitchTokenSet shape / ...>
- Depends on: <theory-cloud-design milestone>
- Owned by: FaceTheory steward

### autheory milestone (if affected)
- Pins required: theory-cloud-design `v0.Y.Z`, FaceTheory `vX.Y.Z`
- Reskin scope: <specific hub-admin-portal surfaces>
- Depends on: <FaceTheory milestone>
- Owned by: autheory steward

### theory-mcp-server milestone (if affected)
- Pins required: theory-cloud-design `v0.Y.Z`, FaceTheory `vX.Y.Z`
- Reskin scope: <specific control-plane surfaces>
- Depends on: <FaceTheory milestone>
- Owned by: theory-mcp-server steward

## Release rollout plan
<staging → premain → rc → soak → main → stable release, with specifics; cascade windows named>

## Version-bump implication
<patch / minor / major — with pre-1.0 semver justification>

## Cross-phase risks
<risks that span phases or repos>

## Cross-repo coordination
<explicit list of required coordination with FaceTheory / autheory / theory-mcp-server stewards>

## Open questions
<things that must be answered before Linear creation>
```

## Persist

Append only if the roadmap exposes a decision, constraint, or cross-repo coordination pattern worth remembering. Routine roadmaps that flow cleanly aren't memory material.

## Handoff

- If approved, invoke `create-linear-project`.
- If the cascade requires explicit coordination with another steward, pause and surface it before generating Linear state. Do not create Linear milestones in consumer repos — those milestones are for their stewards to create.
- If the roadmap reveals a brand-document contradiction that scoping missed, pause and revisit `scope-need` with user authorization for the document change.
- If the user wants to execute informally without Linear, the roadmap stands alone as a reference.
