---
name: promote-stage
description: Use to promote KnowledgeTheory from lab to live — the controlled move from premain to main with a corresponding live deploy. Runs after lab has been observed stable for an agreed soak period. Requires explicit user authorization for every step.
---

# Promote from lab to live

This skill is the operator flow for moving `premain` → `main`, triggering a `live` deploy, and verifying the result. It is not a routine action. It touches every consumer of KnowledgeTheory simultaneously, and every step requires explicit user authorization.

## Preconditions — all must be true

- **User has explicitly asked for a promotion**, naming `premain` → `main`. A generic "is it ready to ship?" is not a promotion authorization; it's a readiness discussion.
- **Lab has been observed stable** on the `premain` tip you intend to promote. "Stable" is not a feeling — it's the criteria the roadmap declared when this work was planned (e.g. "three successful publish cycles for the affected KBs, query latency within baseline, no new gov-infra failures").
- **The rubric is green on `premain`.** `bash gov-infra/verifiers/gov-verify-rubric.sh` passes cleanly.
- **No uncommitted scratch state in `lab`.** If someone is running a scratch deploy or a manual publish cycle, the stage is dirty and you are not promoting from it.
- **MCP tools healthy**, `memory_recent` first.
- **The user has named the rollback plan.** What does "this went wrong" look like, and what's the first thing we do if it does?

If any precondition fails, stop and surface it. You do not guess on promotions.

## The promotion sequence

Promotion is a sequence of small, reversible-until-they-aren't steps. Confirm each one with the user before executing it.

### Step 1: Capture the state you're promoting from

Before doing anything:

- Record the `premain` tip commit SHA
- Record the `main` tip commit SHA (the "old live" baseline, needed for rollback)
- Record the current `lab` deploy's commit SHA and confirm it matches `premain` tip — if not, lab is not actually running what you think it is, and you are not promoting
- Record the current `live` deploy's commit SHA and confirm it matches `main` tip
- Read and record the current `manifest.json` for every module in `live` — this is the "pre-promotion" baseline of published knowledge

Append this state to memory before continuing — this is the rollback reference, and promotion pauses or failures need it. This *is* memory material.

### Step 2: Open the promotion PR

- Branch: `promote/premain-to-main-<date>` or similar
- PR target: `main`
- PR title: `promote: premain → main (<date>)` or the Conventional Commit equivalent
- PR body: the promotion plan — commit range, modules affected, frontends affected, soak observations that justify promotion, rollback plan

Open the PR and ask the user to review. Do not merge it yourself.

### Step 3: After user authorizes the merge

- The user merges the PR through normal GitHub tooling. You do not merge it.
- Confirm the merge landed on `main` and the commit SHA matches what you expected.
- Note the merge in memory.

### Step 4: Deploy `main` to `live`

This requires explicit per-invocation authorization. When authorized:

```bash
AWS_PROFILE=<your-aws-profile> theory app up --stage live --execute
```

Capture the deploy output completely. Watch for:

- CloudFormation stack updates completing cleanly
- Lambda function updates
- DynamoDB table updates (none expected for a routine promotion; unexpected table churn is a serious signal)
- SSM parameter updates (any change to published paths is a breaking change for consumers)
- S3 Vectors resource updates

If the deploy fails partway, **stop**. Do not retry blindly. A failed live deploy is a rollback conversation, not a try-again conversation.

### Step 5: Verify the live stage post-deploy

Before declaring success:

- Read the SSM parameters for `live`. Do they point at the expected addresses?
- Check that the live API is reachable and returning 200 for a health check.
- Compare the live `manifest.json` to the pre-promotion baseline. If modules, unit counts, or timestamps have changed unexpectedly, that's a signal.
- Run a representative query through the frontend (`theory-mcp-server`, `pai-socket`) to confirm retrieval is healthy.
- Check CloudWatch for new error patterns in the KT Lambda.
- Wait a deliberate observation period (the roadmap should have stated how long) before declaring the promotion clean.

### Step 6: Back-merge main into premain

After the live deploy is confirmed healthy:

```bash
git checkout premain
git pull
git merge main
git push
```

Or through a PR, whichever the project convention is. `premain` must not lag `main`; the next cycle starts from the just-promoted baseline.

## Rollback

If the live deploy fails or the post-deploy verification surfaces a regression:

- **Do not** try to forward-fix by committing to `main` and redeploying, unless the issue is trivially obvious and the user explicitly authorizes it.
- **Do** redeploy the previous `main` tip to `live`. This means checking out the old `main` commit, running `theory app up --stage live --execute` on that commit, and verifying the rollback succeeded.
- **Do** leave the broken `main` tip as-is; do not force-push or rewrite history to pretend the failed promotion didn't happen. The broken commit is audit evidence.
- **Do** open an investigation (`investigate-issue` or `debug-retrieval` depending on shape) into the root cause *before* attempting another promotion.
- **Do** append a rollback entry to memory with everything you know about what happened. This is high-signal memory material.

## What this skill will not do

- Will not merge the promotion PR itself.
- Will not deploy to `live` without per-invocation authorization from the user.
- Will not promote without `lab` having been observed stable.
- Will not forward-fix a failed live deploy without explicit authorization.
- Will not skip verification steps "to save time."
- Will not touch `live` DynamoDB, S3, or SSM state outside of the normal deploy flow.

## Output

```markdown
## Promotion run

### From
- premain tip: <SHA>
- main tip (pre-merge): <SHA>

### To
- main tip (post-merge): <SHA>
- live deployed commit: <SHA>

### Soak criteria met
<list — tied to the roadmap's declared criteria>

### Verification checkpoints
- SSM parameters: <outcome>
- Manifest diff: <outcome>
- Representative query: <outcome>
- CloudWatch: <outcome>

### Rollback plan on file
<what happens if this goes wrong>

### Post-promotion back-merge
<premain back-merged, yes/no>

### Status
<clean / rolled-back / investigating>
```

## Persist

Promotions are infrequent and consequential. Memory entries from this skill are high-signal: the commit SHAs, the date, the modules affected, the outcome. If a rollback happened, the entry is essential for tracing regressions backward later. Routine clean promotions deserve a terse entry; non-routine ones deserve the full context.

## Handoff

- If the promotion is clean, stop.
- If a regression surfaces in live, invoke `debug-retrieval` or `investigate-issue` immediately.
- If rollback was required, the next step is root-cause investigation — do not attempt another promotion until the cause is understood and fixed in `premain`.
