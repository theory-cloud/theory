---
name: plan-roadmap
description: Use after enumerate-changes when the work is large enough to need phasing, or when the master GovTheory roadmap (gov-roadmap.md, H0–H6) needs revision. Output is a roadmap document, not Linear state. Most pack work fits inside an existing H-milestone; use this for genuine roadmap-level changes.
---

# Plan a roadmap

Use when:

- A scoped need + enumeration is large enough (typically 8+ items, or material cross-tenant or release-flow dependencies) that direct execution would be confused
- The master roadmap (`docs/planning/gov-roadmap.md`, milestones H0–H6) needs revision (new H-milestone, scope shift, gate addition / removal)

## When NOT to use

- The work fits inside an existing H-milestone — extend the milestone, not the roadmap
- The work is one focused change — just do it
- The work is exploratory — defer roadmap commitment

## Your posture

Sequence over scope. The enumerated list named *what*; this skill decides *in what order, with what dependencies, behind what gates, across how many phases*.

The master roadmap defines H0 (Freeze the Base Genome), H1 (Prompt Hardening), H1.5 (Output Layout `gov-infra/`), H1.6 (Deterministic Rubric Verifier), H1.7 (Sign-Time Audit), H2 (Domain Overlays), H3 (Release to S3 — implemented), H4 (`gov.init` Review/Repair), H5 (Prompt Generation Assets), H6 (Change Control). Most new work slots under an existing H-milestone or extends one. A new H-milestone is rare and significant.

## Inputs

- The enumerated-changes document
- The master roadmap (`docs/planning/gov-roadmap.md`)
- Memory of prior phasing decisions (`memory_recent`)
- The CHANGELOG (deltas already accumulating)
- App-integration milestone work orders if relevant (`docs/planning/app-integration/M0`–`M5`)

## The phasing questions

For each enumerated item:

1. **Which H-milestone does it belong to?** Use existing H0–H6. New H-milestone proposals should be rare and explicit.
2. **What dependencies?** Earlier items in the enumeration; KT consultations; consumer-side coordination; existing pack content the change builds on.
3. **What's the propose / implement / adopt phasing?** If the change is non-trivial, the propose phase (the scoped need) is already complete; the implement phase is the enumeration; the adopt phase is the pack release. Name the release step explicitly.
4. **What gates does it pass through?** A pack change does not have the same gate model as a development pipeline; the adoption gate is "lab validation passed; live promote authorized." Name the validation explicitly.
5. **What CHANGELOG entries accumulate?** A multi-commit phase produces a single CHANGELOG section in the next release; itemize.

## The risk overlay

For each phase:

- **What false-green risks does this phase introduce or mitigate?** Phases that consolidate gates often reduce false-green; phases that add new surfaces often introduce new risk.
- **What false-red risks?** Same.
- **What anti-drift risks?** Multi-commit work that lands across multiple sessions can drift between commits if discipline lapses.
- **What release-flow risks?** Phases that affect the publish flow (infra, pin updates, signing) carry consumer-trust risk.

A phase whose risks cannot be named is a phase whose mitigation is not designed.

## Output: the roadmap document

For master-roadmap revisions, the output is a diff against `docs/planning/gov-roadmap.md` plus revision rationale. The diff explicitly:

- Adds, modifies, or removes H-milestones
- Updates "Status" markers (per the existing convention: implemented / in progress)
- Updates Cross-Repo Dependencies if consumer-surface changes
- Updates the Milestone Summary table

For derivative-project roadmaps (rare for pack work), mirror the existing roadmap shape:

```markdown
# Roadmap: <project name>

## Goal
<one paragraph — typically a substantive offshoot of the pack genome>

## Linear Tracking
<project link, GovTheory or new project>

## Operating Principles
<inherited from GovTheory's anti-drift, no-licensed-text, determinism + project-specific>

## Milestones
### H<N> — <name>
**Deliverables:** <enumerated items>
**Acceptance:** <observable; CHANGELOG entries; pack-version implication; lab validation>
**Risks:** <false-green / false-red / anti-drift / release-flow>

## Cross-Repo Dependencies
<inherited consumer surfaces; new ones>

## Status
<per H-milestone, mirroring the master roadmap convention>
```

## Sequencing default rules

When in doubt:

1. **Genome-strengthening commits before genome-extending ones.** Anti-drift hardening (COM, sign-time audit) lands before new domain overlays that depend on the hardened base.
2. **Schema bumps before consumer updates.** A new schema version lands first; consumers (validator templates, parser tooling) update to support both versions during transition.
3. **Token / prompt / template author commits before CHANGELOG batched entry.** CHANGELOG `[Unreleased]` accumulates as commits land; the section moves to versioned at release time.
4. **CHANGELOG batched entry before pack-version bump.** The version bump references a CHANGELOG section that exists.
5. **Pack-version bump before lab publish.** Lab publishes a versioned bundle, not an unversioned working state.
6. **Lab validate before live promote.** Always.
7. **Pin updates before templates that reference new pin contents.** If a template uses `pack.pins.apptheory.version`, the pin must be set first.

## Persist before handoff

Call `memory_append` with the roadmap's short name, phase count, H-milestone alignment, and any new H-milestone proposals.

## Handoff

- If the roadmap revision is to the master, the implementation is itself a Mode 1 commit (or set of commits) to `docs/planning/gov-roadmap.md`, plus the underlying work.
- If the work warrants Linear tracking, suggest `create-linear-project`.
- If the work corresponds to a single H-milestone, suggest `implement-milestone` as the execution path.
- If a pack release follows the work, name the Mode 2 release step explicitly.
