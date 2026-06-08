---
name: investigate-issue
description: Use when a generated `gov.*` output looks wrong, a verifier reports false-green or false-red, a domain overlay is suspected of weakening base anti-drift, a pin bump produced unexpected migrate-lift output, a schema validation failed on a previously-valid report, or any other pack-affecting symptom surfaces. Runs before any pack change is proposed. Produces an investigation note, not a fix.
---

# Investigate an issue

Investigation comes before pack change. A "fix" applied to a misunderstood symptom propagates into every target repo on next consumer invocation. In a pack project where outputs reach many downstream consumers, this is especially true.

## Start with memory

Before anything else, call `memory_recent` and scan for prior investigations or findings touching the same template / prompt / overlay / schema. Past sessions may have already run down this path. If you find a related entry, read it and cite it.

## Capture the symptom precisely

Record the symptom literally before reframing:

- **Symptom** — verbatim user description, tool output, or generated-artifact diff
- **Trigger** — which `gov.*` action, against which target repo, with what inputs / pack version
- **Expected vs actual** — what should the generated artifact contain; what was observed
- **Scope** — which template / prompt / overlay / schema / pin is the suspected source
- **Recent changes** — git log on suspected paths since last known clean state; CHANGELOG entries
- **Reproduction** — can you re-run and observe the same symptom? Determinism matters here; if a re-run produces a different output, the determinism property is itself a finding

If any of these is missing and the user is present, ask. If they're not, mark Unknown.

## Ground the investigation in pack failure modes

GovTheory has a specific shape of failure modes. First structural questions:

### False-green (the worse failure)

1. **Is the verifier correctly mapped to the rubric ID?** Verifier-evidence parity may have drifted.
2. **Is the threshold what the pack defines?** Per-repo threshold overrides are dilution; check for them.
3. **Is the evidence path populated?** Empty evidence is failed evidence, not green.
4. **Is the verifier actually running?** A verifier that fails silently (missing tool, wrong path) reports "no findings" — which can read as green.
5. **Is the COM check active?** Toolchain pin, config validity, no diluted thresholds, no silent excludes — any of these may have lapsed.

### False-red

1. **Is the assertion brittle?** A regex / string match that happens to match too tightly.
2. **Is the threshold pinned higher than intent?** A typo in a numeric threshold.
3. **Is alternate evidence not recognized?** The standard mapping may not cover legitimate alternate evidence locations.
4. **Is the prompt over-rejecting?** The prompt's safety invariants may be too strict for valid inputs.

### Determinism failure

1. **Same inputs → different outputs?** Stable ordering, IDs, thresholds — verify each.
2. **LLM variance leaking through?** A prompt that allows free-form sections is non-deterministic; check the prompt's structured-output declaration.
3. **Token substitution incomplete?** A `{{TOKEN}}` literal slipping through to output.
4. **Schema-versioned report fields drift?** Report fields not pinned to schema; consumer parsing variance.

### Domain overlay erosion

1. **Is the overlay still additive-only?** A new gate that *replaces* a base gate is erosion, not extension.
2. **Has licensed text crept in?** Standards prose embedded inline.
3. **Are KB references intact?** KB env-var path resolution; KT KB still has the referenced unit.
4. **Verifier-evidence parity preserved?** Every overlay-introduced requirement still maps to a single verifier + evidence path.

### Pin / pack-version drift

1. **`pins.json` matches pack manifest pins?** Publish flow may have skipped the copy step.
2. **Pack-version in target repo's `gov-infra/pack.json` matches consumed pack?** Consumer-side version drift.
3. **Schema-versioned reports match expected schema?** Producer / consumer schema-version alignment.

### Schema validation failure on previously-valid report

1. **Did the report shape change?** A consumer-side update without producer alignment.
2. **Did the schema bump change semantics?** The consumer is generating against an old schema while validating against a new one.
3. **Is the report missing a required field that the schema now demands?** Schema strictness increased without producer update.

## Evidence before hypotheses

Before forming theories, gather:

- **Git log + CHANGELOG** for the affected paths since last known clean state
- **Recent commits** to schemas, prompts, templates, overlays, pins
- **Diff of generated artifact** (target-side `gov-infra/` content) vs. expected
- **Verifier output** in full
- **Pack manifest content** for the consumed version (verify pins, digest, schema version)
- **Memory entries** about prior investigations on the same surface
- **CHANGELOG `[Unreleased]`** for in-flight changes
- **`AGENTS.md` rules** — verify the suspected change does not erode them

If memory or KB tools return auth errors, surface to the user.

## Rank hypotheses by evidence

1. **Hypothesis** — one sentence
2. **Evidence for** — specific files / commits / output snippets / CHANGELOG entries
3. **Evidence against** — what would be true if wrong; whether that thing is actually true
4. **Verification step** — cheapest run / read / diff to prove or disprove

The top-ranked hypothesis is not necessarily correct. It's the one most worth testing next.

## Output: the investigation note

```markdown
## Reported symptom
<verbatim>

## What is definitely true
<facts you verified yourself>

## Hypotheses (ranked)
1. <hypothesis> — evidence for: <...>; against: <...>
2. <...>

## Verification step
<the one thing you propose to run next>

## Failure-mode classification
<false-green / false-red / determinism / overlay erosion / pin drift / schema mismatch>

## Proposed next skill
<investigate-issue again / fix directly / scope-need / consult-knowledgetheory-steward / coordinate via user / none>

## Risk if wrong
<what propagates downstream if the fix is applied to a wrong hypothesis>
```

## Persist the finding

Call `memory_append` with the core of the investigation note. Pack-investigation memory is high-value; future failures often echo past ones.

## Handoff rules

- **Small, contained pack-content issues** — after the user approves a hypothesis, fix directly. Mode 1 commit. Validation re-run before declaring resolved. CHANGELOG entry if the fix affects generated outputs.
- **Symptom of a genome / contract gap** — invoke `scope-need` to shape the gap into a tracked change with full propose-phase analysis.
- **Symptom of a domain-overlay KB-reference issue** — invoke `consult-knowledgetheory-steward`.
- **Symptom of a consumer-side issue** (theory-cli, theory-mcp, pai-socket, pai) — name it explicitly. The fix is consumer-side; surface to the user, do not edit consumers from here.
- **Symptom of a target-repo issue rather than a pack issue** — name it explicitly. The fix is target-side or consumer-side; the pack's job is to define the floor.
- **Symptom of an upstream framework change** (`pins.json` referenced version moved or restructured) — surface for a coordinated pin bump.
- **Symptom of an aspirational-vs-actual confusion** — read the actual code; verify shipped state; correct the user's framing or your own.
