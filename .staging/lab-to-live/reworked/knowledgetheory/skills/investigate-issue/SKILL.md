---
name: investigate-issue
description: Use when a user reports a bug, regression, unexpected ingestion or compilation failure, or unexpected retrieval behavior in KnowledgeTheory. Runs before any fix is proposed. Produces an investigation note, not a patch.
---

# Investigate an issue

Investigation comes before implementation. A fix written against a misunderstood symptom ships new bugs — and in a knowledge substrate, wrong fixes corrupt downstream retrieval in ways that are hard to unwind.

## Start with memory

Call `memory_recent` before anything else. Scan for prior investigations that touch the same subsystem — ingestion connectors, the compiler, the query API, the manifest pipeline, CDK/SSM. Past-you may have already run down this rabbit hole. If you find a related entry, read it and cite it in the investigation note.

## Capture the claim precisely

Record the user's report literally, then extract:

- **Symptom** — what the user observed, verbatim where possible
- **Stage** — `lab` or `live`? stage isolation matters for every investigation
- **Subsystem** — ingestion, compilation, DynamoDB persistence, S3 Vectors publish, manifest, query API, CDK, SSM
- **Frontend** — is the symptom surfacing through `theory-mcp-server`, `pai-socket`, an operator make target, or direct internal call?
- **Module / module_id** — which KB is affected? All? One?
- **Expected vs actual**
- **Reproduction path** — the commands, queries, or operator workflow that trigger it

If any of these is missing and the user is present, ask. If they're not, mark it Unknown and proceed with what you have.

## Ground the investigation in the architecture

KnowledgeTheory's truth is the two planes and the schemas. Your first structural questions are always:

1. **Which plane is the failure in?** Ingestion, compilation, or query? A retrieval symptom can have roots in any of the three, and mis-attributing it wastes hours.
2. **Is the failure crossing a stage boundary?** A symptom in `live` that reproduces only when you have `lab` state in your head is almost certainly a cross-stage assumption bug, which is always a serious finding.
3. **Does the caller's `caller_context` match the manifest state?** Authorization rejections almost always trace back to a mismatch here. The manifest cache is a discovery aid per §10.6 of `theory-mcp-server/SPEC.md`, not an entitlement source — the entitlement is computed per request against `allowed_kbs`.
4. **Is there a schema drift?** If the symptom looks like "field missing" or "wrong shape," check whether `unit.schema.json` or `manifest.schema.json` has moved recently and whether consumers have caught up.
5. **Is the gov-infra rubric green on the current state?** If the rubric is red for unrelated reasons, your investigation is running on a poisoned baseline.

## Evidence before hypotheses

Before forming a theory, gather:

- `git log` on the affected packages (`internal/ingest/`, `internal/compiler/`, `internal/publish/`, `internal/manifest/`, etc.) since the last known-good deploy
- `git blame` on the lines the reproduction implicates
- Recent deploys: what commit is `lab` on? what commit is `live` on? `premain` vs `main` tip?
- SSM parameters for the affected stage (`aws ssm get-parameter --name /knowledge-theory/<stage>/...`) — are they what you expect?
- Manifest state: is the `manifest.json` in the stage's S3 location current? Does its unit count match DynamoDB?
- The compiler's validator output from the most recent publish
- `gov-infra/evidence/` for any captured evidence that might already describe the symptom
- `query_knowledge` against Theory Cloud docs for cross-repo context (AppTheory runtime behavior, TableTheory data model, theory-mcp-server caller_context shape)

If `memory_recent` or `query_knowledge` returns an auth error or is unavailable, stop and surface it to the user. Investigating without your tools means investigating on a corrupted map.

## Rank hypotheses by evidence

When you have enough to form theories, list them in descending order of support:

1. **Hypothesis** — one sentence
2. **Evidence for** — specific files, commits, SSM params, DynamoDB counts, manifest shape
3. **Evidence against** — what would be true if this were wrong, and whether that thing is actually true
4. **Verification step** — the cheapest thing you can run to prove or disprove it

The top-ranked hypothesis is the one most worth testing next — not necessarily the one most likely to be correct.

## Output: the investigation note

```markdown
## Reported symptom
<verbatim>

## Stage / subsystem / frontend / module
<the extracted dimensions>

## What is definitely true
<facts you verified yourself>

## Hypotheses (ranked)
1. <hypothesis> — evidence: <...>
2. <...>

## Verification step
<the one thing you propose to run next>

## Proposed next skill
<investigate-issue again / fix directly / scope-need / debug-retrieval / validate-snapshot / none>
```

## Persist the finding

Call `memory_append` only if the investigation surfaces something worth remembering — a confirmed non-obvious pattern, a surprising root cause, a user correction that changes how you'll investigate next time. Routine "this was a typo" findings aren't memory material.

## Handoff rules

- **Retrieval-specific failure** (403, empty results, wrong ranking, stale manifest) — invoke `debug-retrieval` for the deep-dive flow.
- **Snapshot-level suspicion** (compilation failing, unit counts wrong, validator complaints) — invoke `validate-snapshot`.
- **Small, contained bug** in a single file — fix directly after user approval. Still commit through normal discipline.
- **Design gap** — invoke `scope-need` to turn the need into a shaped requirement before any code is written.
- **Cross-repo finding** (root cause lives in AppTheory, TableTheory, or theory-mcp-server) — report it cleanly to the user. Do not reach across the steward boundary.
