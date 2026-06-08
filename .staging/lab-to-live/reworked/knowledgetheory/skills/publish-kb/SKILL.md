---
name: publish-kb
description: Use to drive a knowledge base end-to-end through the full publish cycle — canonical source sync, registry seed, ingestion trigger, compilation, DynamoDB write, S3 Vectors publish, and manifest refresh. Runs against lab by default; live requires explicit authorization every time.
---

# Publish a knowledge base

This skill walks a KB through the deterministic publish pipeline. It is the operator-workflow equivalent of `implement-milestone`: tactical, procedural, and touching live stage state.

## Preconditions

- **User has named the KB.** `theorycloud`, `apptheory`, `tabletheory`, or whatever module is in scope. "Publish all" is not a valid input; run one KB per invocation.
- **User has named the stage.** `lab` is the default. `live` requires explicit per-invocation authorization and should not happen without `lab` already being in a known-good state for that KB.
- **MCP tools are healthy.** `memory_recent` first.
- **You are on `premain` (for lab) or `main` (for live)** at a commit that matches what is currently deployed to that stage. A publish from a repo checkout that doesn't match the deployed code is a source of confusion.
- **The `theory` CLI is available and AWS credentials are active** (an AWS profile with deploy credentials is exported — the operator sets their own profile, e.g. `AWS_PROFILE=<your-aws-profile>`).

If any precondition fails, stop.

## The publish pipeline shape

KnowledgeTheory's publish pipeline has these phases for each KB:

1. **Canonical source** — produce or refresh the canonical source material for the KB.
2. **Sync source** — move the canonical source into the stage's sources bucket.
3. **Seed registry** — register or update the KB's entry in the stage's source registry.
4. **Trigger publish** — run the publish worker against the staged source, producing a new snapshot, compiled units, DynamoDB writes, S3 Vectors chunks, and a refreshed manifest.
5. **Verify manifest** — confirm the new manifest is what the stage is now serving and the unit counts match DynamoDB.
6. **Exercise retrieval** — run a representative query against the stage to confirm end-to-end health.

The operator make targets map to these phases:

- `make <kb>-canonical-source`
- `make <kb>-sync-source ...`
- `make <kb>-seed-registry ...`
- `make <kb>-trigger-publish ...`

Some KBs have their own variants. Check `Makefile` for the exact targets available for the KB you are publishing. If a target is missing for a KB you are supposed to publish, stop — that's a scoping conversation, not a run-as-is.

## The per-phase loop

For each phase, do this:

1. **State what you're about to run** in the user-facing output — never quietly kick off a phase that touches stage state.
2. **Run the command** against the target stage.
3. **Capture the output.** Errors, warnings, line counts, unit counts, SSM parameter values read or written.
4. **Verify the phase succeeded** before starting the next one. A failed phase is a stop-and-investigate, not a retry-and-hope.
5. **Append memory** only when the phase surfaced something worth remembering — a non-routine error, a source-shape change, a validated optimization. Routine publish runs aren't memory material per phase.

Never skip verification between phases. A successful sync-source that feeds into a broken seed-registry looks like two successes but produces a silently broken publish.

## Verification checkpoints

After each phase, run the matching verification:

- **After canonical-source**: eyeball the produced artifact. File count, size, timestamps. Does it look like the source content the user expects?
- **After sync-source**: list the stage's sources bucket under the KB's prefix. Do the objects match what was produced?
- **After seed-registry**: read the registry state for the KB. Is the new source pointer in place? Is the `module_id` right?
- **After trigger-publish**: wait for the worker to finish, then check:
  - DynamoDB content table row count for this `module` / `module_id`
  - DynamoDB relations table for the KB's relations
  - S3 Vectors bucket for freshly-indexed chunks
  - The stage's `manifest.json` timestamp and unit count for this module
  - The SSM parameter `/knowledge-theory/<stage>/manifest/key` still points at the current manifest
- **After verify-manifest**: `aws s3 cp` or `curl` the live manifest to confirm it's the version you expect
- **After exercise-retrieval**: run a known-good query through the frontend the KB is served by, and confirm the response is what you expect

## Live-stage rules

Publishing to `live` requires:

- **Explicit user authorization for each phase**, not a blanket "publish to live." Each phase has potential to affect real consumers.
- **Known-good `lab` state** for the same KB. You never publish a KB to live that hasn't been successfully published to lab first on the same commit.
- **Off-hours or pre-announced window** when the user agrees the risk is acceptable.
- **A rollback plan in mind.** KnowledgeTheory's immutability means rollback is "publish the previous state again" — you should know what the previous known-good source snapshot reference was before starting the live publish.

If any of these is missing, stop and surface it. Publishing to live on uncertain ground is how consumers see broken knowledge.

## Failure recovery

If a publish fails partway:

1. **Do not** try to clean up partially-written state by deleting records. Immutability means you leave the partial state alone and publish forward.
2. **Do** capture the error output completely and run `debug-retrieval` or `validate-snapshot` against the partial state to diagnose.
3. **Do not** mutate DynamoDB, S3, or the manifest to "patch" the partial state.
4. **Do** identify the root cause and re-run from the appropriate phase once the cause is fixed.

The common recovery path is: diagnose the failure, fix the underlying code or source issue in a feature branch, merge it through the normal pipeline, redeploy to `lab`, and re-run the publish cycle. Shortcuts here corrupt immutability.

## Output

```markdown
## Publish run: <KB>@<stage>

### Phases executed
1. canonical-source — <outcome + verification>
2. sync-source — <outcome + verification>
3. seed-registry — <outcome + verification>
4. trigger-publish — <outcome + verification>
5. verify-manifest — <outcome>
6. exercise-retrieval — <outcome>

### Final state
- Manifest timestamp: <...>
- Unit count: <...>
- DynamoDB row count: <...>
- S3 Vectors freshness: <...>

### Issues encountered
<any, or "none">

### Next actions
<observation, soak monitoring, promotion readiness, or follow-up>
```

## Persist

Append only if the publish surfaced something worth recalling — a source-shape surprise, a validator finding that will recur, a timing observation that matters for future runs. Routine clean publishes aren't memory material.

## Handoff

- If the publish succeeded and the user is evaluating promotion from `lab` to `live`, invoke `promote-stage` — but only after the soak criteria agreed in the roadmap are met.
- If the publish revealed a compilation or validation issue, invoke `validate-snapshot` to dig deeper.
- If retrieval exercise failed, invoke `debug-retrieval`.
- If there is no follow-up, stop. A clean publish is a complete skill run.
