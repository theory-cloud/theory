---
name: plan-roadmap
description: Use after enumerate-changes when the work is large enough to need phasing. Takes a flat enumerated change list and sequences it into phases with dependencies, gates, and milestone candidates. Produces a roadmap document, not code or Linear state. Most PreTheory work fits the existing master roadmap; use this for derivative projects or significant roadmap revisions.
---

# Plan a roadmap

Use when `enumerate-changes` produced a list large enough (typically 8+ items, or with significant cross-tenant or governance dependencies) that direct execution would be confused. Output is a roadmap document, not Linear state and not code.

## When NOT to use

- The existing `planning/theoryjepa_model_training_roadmap.md` already absorbs the work. Extending or referencing the master roadmap is usually the right move; don't author a parallel roadmap unless the work is genuinely a derivative project.
- The work is one focused change; just do it.
- The user explicitly wants execution, not planning.

## Your posture

Sequence over scope. The enumerated list told you *what*; this skill decides *in what order, with what dependencies, behind what gates, and across how many phases*.

The PreTheory master roadmap (M0–M14, 7 phases, 5 named gates) is the established frame; align to it where the work fits. Use this skill primarily when:

- The work is large enough to warrant its own derivative roadmap (rare)
- A major revision to the master roadmap is itself the scope (e.g., adding a new phase, splitting a milestone, or reshaping gates after a learning)

## Inputs

- The enumerated-changes document
- The master roadmap (`planning/theoryjepa_model_training_roadmap.md`)
- Memory of prior phasing decisions (`memory_recent`)
- Any cross-tenant dependencies surfaced during enumeration

## The phasing questions

For each enumerated item, decide:

1. **Which phase does it belong to?** Use the master roadmap's 7-phase shape unless this is a genuinely separate project. If extending the master, name the phase explicitly (Phase 0–7) and the milestone (M0–M14) the item slots under.
2. **What dependencies does it have?** Earlier items, governance artifacts, source-family approvals, cross-tenant consultations. Order items by dependency, not just by topical grouping.
3. **What gate does it pass through?** The master roadmap's gates: Gate 1 (corpus eligibility), Gate 2 (event graph readiness), Gate 3 (baseline and graph-collapse signal), Gate 4 (JEPA added signal), Gate 5 (shadow-to-advisory readiness). An item that should be gated names which one.
4. **What's the failure mode if it ships out of order?** Naming this surfaces hidden dependencies.

## The risk overlay

The master roadmap names cross-phase risks: sensitive-data leakage, historical leakage, data alignment noise, overfitting to names, false authority, too few real failures, base-rate effects, model drift. For each phase:

- **Which risks are most acute in this phase?**
- **What mitigation is encoded in the phase's deliverables?**
- **What residual risk remains and is acceptable for now?**

A phase whose risks cannot be named is a phase whose mitigation is not yet designed.

## Output: the roadmap document

For master-roadmap revisions, the output is a diff against `planning/theoryjepa_model_training_roadmap.md` plus an explanation of the revision rationale.

For genuinely derivative projects (rare), the output is a separate roadmap document mirroring the master's shape:

```markdown
# Roadmap: <project name>

## Goal
<one paragraph>

## Linear Tracking
<project link, initiative attachment, parent project if derivative>

## Operating Principles
<inherited from PreTheory + project-specific additions>

## Phases

### Phase N: <name>
**Purpose:** <one line>

#### Milestone <ID>: <name>
**Goal:** <one line>
**Source deliverables:** <numbered references into the enumerated list>
**Subtasks:** <list>
**Acceptance criteria:** <observable, validatable>
**Risks:** <named, with mitigations>

## Cross-Phase Risks
<inherited from PreTheory master roadmap; project-specific additions>

## Cross-Repo Dependencies
<inherited surfaces; new ones>

## Evaluation Gates
<which master gates apply; any project-specific gates>

## Milestone Summary
<table>

## Suggested Timeline
<weeks / months, with overlap noted>

## Decisions
<key project-level decisions, mirroring master-roadmap shape>
```

## Sequencing default rules

When in doubt:

1. **Governance before substantive work.** Source-family approvals, schema versions, ADRs land before tooling that depends on them.
2. **Validators before artifacts they validate.** A new fixture without a validator that exercises it is incomplete.
3. **Cross-tenant consultations before unilateral execution.** When a `consult-factory-steward` or `consult-govtheory-steward` is in the enumeration, it gates substantive items.
4. **Deterministic baselines before model work.** Always. The master roadmap's Phase 4 gates Phase 5; respect this even in derivative projects.
5. **Local-environment readiness before AWS escalation.** M9.5 is a real prerequisite; do not jump it.

## Persist before handoff

Call `memory_append` with the roadmap's short name, phase count, total milestone count, and the gates the work passes through. The full roadmap goes to the user.

## Handoff

- If the user approves and the work warrants Linear tracking, invoke `create-linear-project`.
- If the work fits the existing PreTheory Linear project, the master project absorbs the new milestones / tasks; no new project is needed.
- If the work corresponds to a single milestone in the master roadmap, suggest `implement-milestone` as the execution path.
- If the user wants to revise the master roadmap based on the planning, that's itself a Mode 1 commit to `planning/theoryjepa_model_training_roadmap.md`.
