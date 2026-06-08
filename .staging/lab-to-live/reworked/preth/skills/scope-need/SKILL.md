---
name: scope-need
description: Use when a user brings a new R&D need — a new source family, a redaction-policy revision, a roadmap adjustment, a sample-family addition, an experiment proposal — in vague terms. Interviews the user conversationally and produces a scoped-need document. Does not write code.
---

# Scope a need

A need arrives fuzzy. A scoped change arrives sharp. This skill is the conversation that turns one into the other. Output is a document, not code.

## Your posture

You are interviewing, not pitching. The user is bringing a problem; your job is to understand what they actually need, check whether the existing project foundation already covers it, and if not, shape the gap into something `enumerate-changes` can act on.

The default reflex is suspicion of scope expansion. PreTheory has a clear cadence (M0–M14, gates, deliverables). A new "let's also collect X" or "let's also try Y" needs to either fit the cadence cleanly or be refused with a clear rationale.

## Start with memory and shipped state

- **`memory_recent`** — has this need or something adjacent been scoped before? If yes, pick up from there.
- **Read the relevant planning docs.** Roadmap, deliverables list, scoped need (`planning/theoryjepa_training_data_scoped_need.md`), the M0 ADR. Often the need is already absorbed by an existing milestone or explicitly out-of-scope.
- **Check shipped state.** What's actually committed in `manifests/`, `schemas/`, `tools/`, `redaction/`, `planning/m0_governance/`, `planning/m1_github_collection/`? Don't reason from the planning prose alone.

If memory or KB query tools return an auth error, surface to the user. Scoping without continuity is guesswork.

## The interview

Ask the user, in roughly this order, one or two questions at a time (a conversation, not a form):

1. **What category of need is this?** A new source family? A redaction-policy revision? A roadmap milestone scope adjustment? A new sample family proposal? An experiment / baseline addition? A schema versioning need? A tooling improvement?
2. **What problem does it solve?** Frame in terms of current pain or a specific gate / acceptance criterion that won't pass without it.
3. **What governance is required?** Source-family approval record? Redaction-policy version bump? Cross-tenant consultation (factory, govtheory)?
4. **What's the leakage / evaluation impact?** Does the need touch sample construction, evaluation splits, or labels? If yes, the leakage discipline applies.
5. **What does success look like?** Observable, validatable. "Better baseline" is not observable; "Recall@K beats graph-neighbor heuristic on the headline benchmark by N at confidence ≥ X" is.
6. **What is explicitly out of scope?** Just as important as the in-scope list.
7. **What is the nearest existing surface?** Is there a milestone, schema, redaction fixture, validator, or planning document that covers most of the way? If yes, the scope is much smaller than the user thinks.

## The cadence question

Before the conversation ends, answer the question that determines downstream shape:

> **Does this need fit the existing roadmap cadence, or does it require a roadmap revision?**

Three possible answers:

1. **Fits cleanly** — it's milestone-shaped work that maps to an existing M0–M14 entry, or a scoped variation under one. Happy path; scoped-need doc is short.
2. **Fits as an addition** — the cadence absorbs it but a new sub-milestone or deliverable needs to be added. Doable; the scope includes both the substantive work and the roadmap-revision commit.
3. **Requires a roadmap revision** — the need changes phasing, gates, or milestone scope. This is governance — surface explicitly. The downstream work includes a roadmap-revision step before substantive execution.

If you suspect (3), say so. Don't let a roadmap revision sneak through scoping as if it were (2).

## The governance question

A second question, equally important:

> **What governance does this need require?**

Possibilities:

- **Source-family approval record** — for any new source family, per `source_family_approval_gates.md`
- **Redaction-policy version bump** — when prohibited fields, allowed summaries, or training-eligibility semantics change
- **Schema version bump** — when manifest, sample, or registry shape changes
- **ADR** — for ownership / boundary / tier / classification decisions (rare; M0 covered most of these)
- **Cross-tenant consultation** — `consult-factory-steward` for Pay Theory data; `consult-govtheory-steward` for verifier / rubric / framework-fixture conversion paths

If governance is required and not yet planned, the scope includes producing the governance artifact.

## Output: the scoped-need document

Produce this markdown document and confirm it with the user before handing off:

```markdown
# Scoped Need: <short name>

## Background
<one paragraph of context — why now, what's prompting this>

## Problem
<what is missing, broken, or required by a gate that won't pass without it>

## Users and beneficiaries
<who this affects: framework maintainers, Pay Theory leadership, engineers, govtheory, knowledgetheory, future production work>

## Success criteria
<observable, validatable conditions that define "done">

## Cadence impact
<fits cleanly / fits as addition / requires roadmap revision — with justification>

## Governance impact
<source approval / redaction version / schema version / ADR / cross-tenant consultation needed; or "none">

## Nearest existing surface
<what milestone, schema, validator, or planning doc gets partway there>

## Out of scope
<what this scoped need explicitly does not cover>

## Open questions
<things the user hasn't decided yet>

## Linear
<existing PreTheory project + initiative TheoryJEPA R&D, or new project warranted>
```

## Persist before handoff

Call `memory_append` with a summary that future-you can find: the short name, the cadence verdict, the governance verdict, and a one-line hook. The full doc goes to the user; the memory entry is for continuity.

## Handoff

- If the user approves the scoped need, invoke `enumerate-changes`. The enumerated list is the next artifact.
- If the scoping forces the comparison and the user decides the need is already covered by an existing milestone or planning doc, record that in memory and stop. A scope that resolves to "we already cover this, here's how" is a successful scope.
- If the user wants to defer, note it in memory and stop. Do not start enumeration on a need the user hasn't committed to.
- If governance work surfaced (source-family approval, redaction-policy revision, cross-tenant consultation), name it as a prerequisite step before substantive enumeration.
