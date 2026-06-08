---
name: investigate-issue
description: Use when a validation fails, a leakage check trips, a baseline metric drifts, a manifest stops validating, a redaction fixture produces unexpected findings, or a calibration / experiment result is anomalous. Runs before any fix is proposed. Produces an investigation note, not a patch.
---

# Investigate an issue

Investigation comes before remediation. A "fix" applied to a misunderstood failure ships new failures. In an R&D project where the data foundation is the deliverable, this is especially true — a wrong fix to a redaction validator or a leakage check propagates into every subsequent milestone.

## Start with memory

Before anything else, call `memory_recent` and scan for prior investigations or findings touching the same area. Past sessions may have already run down this path. If you find a related entry, read it and cite it.

## Capture the failure precisely

Record the failure literally before you reframe it:

- **Symptom** — the validator output, error message, or anomaly verbatim
- **Trigger** — what was run, against what input, with what command and config
- **Expected vs actual** — what success would look like; what was observed instead
- **Scope** — which milestone / artifact / fixture / sample / experiment
- **Recent changes** — git log on the affected paths since last known clean state
- **Reproduction** — can you re-run and observe the same failure deterministically? If not, intermittency is itself a finding

If any of these is missing and the user is present, ask. If they're not, mark Unknown and proceed with what you have.

## Ground the investigation in PreTheory's failure modes

PreTheory has a specific shape of failure modes. Your first structural questions:

### Governance / validation failures

1. **Is this a missing-required-field failure?** A manifest row missing `provenance_hash`, `redaction_version`, `permitted_storage_tiers`, etc. Usually upstream — the collector that produced the row didn't populate.
2. **Is this a schema drift?** Manifest passes pattern but fails enum (a new `source_system` or `artifact_type` not yet in the schema). Schema may need a version bump or extension.
3. **Is this a redaction-fixture-finding mismatch?** Expected findings differ from actual. Either the fixture content changed, the redaction policy semantics changed, or the validator logic changed. Check git log on each.

### Leakage findings

1. **Is the leakage real or fixture-induced?** Some validators run intentional corruption to verify the leakage check fires. A "leakage detected" output on a corruption fixture is success, not failure.
2. **Is the cutoff timestamp wrong?** Sample's `time_cutoff` may be incorrectly later than visible-context cutoff.
3. **Is the source data already poisoned?** Sometimes upstream collection grabbed material past the intended cutoff. Re-collect with correct cutoff, regenerate samples.
4. **Is name leakage hiding as signal?** If a baseline / model is performing suspiciously well, run name ablation. If signal collapses on ablation, the "performance" was name memorization.

### Baseline / experiment anomalies

1. **Is the config pinned?** Encoder version, schema version, redaction version, split manifest, source cutoff, random seeds — confirm each. An unpinned config explains a lot of irreproducibility.
2. **Did upstream data change?** A re-run with the same config but newer underlying data is a different experiment. Use snapshot IDs.
3. **Is the metric itself wrong?** Reported MRR or Recall@K can be wrong if the labeling is wrong. Spot-check sample / target pairs.
4. **Is calibration pathological?** Severe overconfidence on a finding type is a calibration signal, not an arithmetic failure. ECE / reliability curves diagnose it.

### Cross-tenant / source-collection failures

1. **Did source authentication expire?** GitHub token, AWS profile (`AWS_PROFILE=<your-aws-profile>`), Keeper auth.
2. **Did source schema change upstream?** A Pay Theory repo restructured, a Linear field renamed, a partner-factory submodule moved. Re-derive collector against current source.
3. **Was source-family approval scope exceeded?** Collector trying to grab content outside the approved record. Approval needs amendment or collection needs scoping.

## Evidence before hypotheses

Before forming theories, gather:

- **Git log** on the affected paths since last known clean state
- **Validator output** in full (not summarized)
- **Recent commits** to schemas, fixtures, validators, planning docs
- **Memory entries** about prior runs on the same artifact / experiment
- **Linear comments** on the milestone's task(s) — sometimes context lives there
- **KB queries** when cross-repo context is needed (`paytheory` KB for factory / product context, others as relevant)

If memory or KB tools return auth errors, stop and surface to the user. Investigation without continuity is guesswork.

## Rank hypotheses by evidence

When you have enough to form theories, list them in descending order of support:

1. **Hypothesis** — one sentence
2. **Evidence for** — specific files, commits, artifacts, validator output snippets
3. **Evidence against** — what would be true if this hypothesis were wrong, and whether that thing is actually true
4. **Verification step** — the cheapest run / read / diff that proves or disproves

The top-ranked hypothesis is not necessarily correct. It's the one most worth testing next.

## Output: the investigation note

Produce a structured report the user can review before you touch any code or artifact:

```markdown
## Reported failure
<verbatim symptom + trigger + scope>

## What is definitely true
<facts you verified yourself>

## Hypotheses (ranked)
1. <hypothesis> — evidence for: <...>; against: <...>
2. <...>

## Verification step
<the one thing you propose to run next>

## Proposed next skill
<investigate-issue again / fix directly / scope-need / consult-factory-steward / consult-govtheory-steward / none>

## Risk if wrong
<what propagates downstream if the fix is applied to a wrong hypothesis>
```

## Persist the finding

Before handing back, call `memory_append` with the core of the investigation note. Include the affected milestone / artifact / experiment in the body so future-you can find it. Investigation memory is high-value for an R&D project; future failures often echo past ones.

## Handoff rules

- **Small, contained issues** — after the user approves a hypothesis, fix directly. Mode 1 commit. Validation re-run before declaring resolved.
- **Symptom of a governance gap** — invoke `scope-need` to shape the gap into a tracked change (e.g., redaction policy revision, schema version bump, new fixture coverage).
- **Symptom of a cross-tenant change** — invoke `consult-factory-steward` (Pay Theory data) or `consult-govtheory-steward` (governance shape) to coordinate.
- **Symptom of upstream data drift** — name it explicitly. The fix is upstream coordination, not a workaround in PreTheory's collector.
- **Symptom of a model / experiment limitation rather than a bug** — record it as a finding for the relevant milestone's evaluation report, not as a fix.
- **Failed gate decision** — if the investigation surfaces that a gate decision should be "repair" rather than "proceed," say so explicitly. Repair work is its own `scope-need`.
