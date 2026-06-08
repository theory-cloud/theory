---
name: enumerate-changes
description: Use after scope-need is approved. Takes the scoped-need document and produces a flat, ordered list of discrete changes — schemas, manifests, validators, tools, planning docs, governance artifacts — each scoped to a single commit or experiment run.
---

# Enumerate changes

Use after `scope-need` produces a clean scoped-need doc. Turns the scope into an ordered list, each entry small enough for one focused commit (Mode 1 work) or one focused experiment + report (Mode 2 work).

## Your posture

Disciplined enumeration. Each item:

- **Focused** — one concept per item
- **Reversible** — can be rolled back cleanly
- **Validated** — has specific validation steps (run validators, check fixture findings, verify manifest counts, confirm leakage checks)
- **Governance-clean** — does not regress M0 invariants (full governance metadata, redaction-version pinning, source-family approval)

## Inputs

- The scoped-need document
- The roadmap milestone(s) the work belongs to
- Linear project context (PreTheory: TheoryJEPA Model Training under TheoryJEPA R&D initiative)
- Any prior `memory_recent` entries about adjacent work

## Enumeration order — typical work shapes

### For a new source family

1. **Approval-record draft** — `planning/m0_governance/source_approvals/<source-family>.md` per the gates doc; pre-filled with what's known, gaps marked
2. **Cross-tenant consultation if needed** — `consult-factory-steward` for Pay Theory data; not a commit, but a named prerequisite step
3. **Schema additions** — extend `corpus_manifest.v1` if new artifact_type / source_system enum values are needed; or define a v2 if shape changes are non-additive
4. **Redaction fixtures** — add fixtures exercising the new family's failure modes
5. **Collector tooling** — under `tools/<milestone>/`; emits manifest rows
6. **Sample manifest rows** — extend `manifests/corpus_manifest.v1.examples.jsonl`
7. **Validator extension** — `tools/m0/validate_m0.py` or a milestone-specific validator passes the new family
8. **Acceptance report addendum** — milestone or M0 acceptance report updated
9. **Memory entry** — date, source family, approval rationale

### For a redaction-policy revision

1. **Policy draft as a new version** — `planning/m0_governance/redaction_policy_v2.md` (do not edit v1)
2. **ADR or addendum** — `planning/m0_governance/ADR-000N-redaction-policy-v2.md`
3. **Fixture additions** — every new prohibited field gets a fixture producing the expected finding
4. **Validator updates** — handle the new policy version
5. **Regeneration plan** — explicit list of `gold_training` rows / `serving_cache` embeddings affected, with regeneration order
6. **Manifest row updates** — when regeneration runs, rows pick up the new `redaction_version`
7. **Acceptance report** — documenting the policy delta
8. **Memory entry** — policy delta, regeneration scope, date

### For a roadmap milestone execution (Mode 2)

The `implement-milestone` skill walks this; enumeration here lists the subtasks as Mode 2 items rather than Mode 1 commits:

1. **Subtask N from the milestone** — concrete deliverable, validation path
2. **Subtask N+1** — …
3. **Acceptance check** — run validators, verify counts, check leakage
4. **Acceptance report authoring** — `planning/<milestone-dir>/<milestone>_acceptance_report.md`
5. **Linear updates** — close milestone tasks, mark milestone complete
6. **Memory entry** — milestone outcome, deferred follow-ups

### For a schema version bump

1. **New schema file** — `schemas/<artifact>.vN.schema.json` (do not edit prior version)
2. **Example rows for vN** — `manifests/<artifact>.vN.examples.jsonl`
3. **Validator updated** to handle both versions during transition
4. **Migration plan** — how existing rows under prior version are reclassified or regenerated
5. **Planning doc update** — referencing the new version where appropriate
6. **Memory entry** — schema delta, transition plan

### For a new sample family (M7 work)

1. **Sample-family contract** — what's the input view, target, label, negative-construction recipe, leakage-safety check
2. **Negative-construction tooling** — produces hard negatives per the family
3. **Split-manifest awareness** — temporal / service-heldout / framework-heldout / cross-domain cohorts cover the family
4. **Validation fixtures** — intentional leakage corruptions that the validator catches
5. **Acceptance criteria from M7** — sample counts, ratios, negative difficulty distribution
6. **Memory entry** — sample family, decisions about negatives and ablations

### For a baseline / experiment (M8–M11 work)

1. **Pinned config** — encoder version, schema version, redaction version, split manifest, source cutoff, random seeds
2. **Run plan** — local training environment first; AWS escalation reason if applicable
3. **Run execution** — captures metrics, ablations, error analysis
4. **Run report** — `planning/<milestone-dir>/<run-name>_report.md`
5. **Registry row** — model registry entry with full lineage if this is a model run
6. **Memory entry** — non-obvious findings (ablation collapses, leakage discoveries, calibration pathologies)

## What each enumerated change includes

For each item:

- **Subject** — Conventional Commits or descriptive (Mode 1) or named experiment (Mode 2)
- **Branch / experiment ID** — repo / Linear convention
- **Files / artifacts touched** — paths
- **Dependencies** — earlier items this assumes
- **Validation** — specific validators, fixture counts, manifest counts, leakage checks, acceptance criteria
- **Governance check** — does this regress M0 invariants? Need an approval record? Need a version bump?
- **Cross-tenant coordination** — flag if `consult-factory-steward` or `consult-govtheory-steward` is required
- **Blast radius** — what breaks if this item is rolled back mid-sequence (especially for schema / redaction-policy bumps)

## Red flags during enumeration

- **An item that adds an artifact to `gold_training` without governance metadata** → refuse; that's the M0 invariant
- **An item that edits `redaction_policy_v1` in place** → refuse if semantics change; redirect to a v2
- **An item that uses post-cutoff context** in evaluation samples → refuse; redirect to leakage-safe construction
- **An item that depends on aspirational planning prose** that may not be implemented → verify the foundation first
- **An item that crosses into Pay Theory or framework repos** → refuse; route to the relevant steward via consultation
- **An item that promotes a model past a gate without acceptance criteria met** → refuse
- **More than 7–8 items** → wants phasing; suggest `plan-roadmap`

## Output: the enumerated-changes document

Produce a numbered list following the structure above. At the end:

- **Total item count**
- **Total phases needed** (usually 1; if >1, flag for `plan-roadmap`)
- **Cross-tenant dependencies** — `consult-factory-steward` / `consult-govtheory-steward` requirements
- **Governance prerequisites** — approval records, version bumps, ADRs
- **Pre-work required** — validation runs, source verification, KB queries

## After enumeration

- Save a memory entry only if the work is large enough or the enumeration decisions were non-obvious
- Suggest `plan-roadmap` if phasing is needed
- Suggest `create-linear-project` only when a derivative project warrants its own surface — most PreTheory work fits the existing project
- If the work corresponds to a roadmap milestone, suggest `implement-milestone` as the execution path
- If governance prerequisites surfaced, name them explicitly as gating
