---
name: cut-brand-release
description: Use to drive a theory-cloud-design release through the staging → premain → main pipeline, ending in an immutable GitHub Release that consumer apps can pin. Coordinates with downstream stewards (FaceTheory, autheory, theory-mcp-server) when the release cascades.
---

# Cut a brand release

This skill executes the release flow for theory-cloud-design. It does not decide what goes in the release — that's the roadmap's job. It runs the pipeline steps: promote `staging` → `premain`, cut RCs, soak, promote `premain` → `main`, cut the stable release, and notify downstream stewards.

## When this skill runs

Invoke this skill when:

- You are requested to merge through staging to main
- A milestone has merged to `staging` and is ready for RC promotion
- An RC has soaked and is ready for stable promotion
- A hotfix has landed on `staging` and needs to flow through the pipeline
- A downstream consumer (FaceTheory, autheory, theory-mcp-server) is waiting on a release to pin

## Preconditions

- **User has explicitly authorized the release.** "Is the pack ready?" is not an authorization; "cut v0.2.0-rc.1 from premain" is.
- **The target branch is at a known-green commit.** `npm run check` and `npm run build` pass.
- **The brand document is internally consistent.** No broken section references after the merged changes.
- **Cascade implications are known.** If the release contains changes that will require FaceTheory primitive updates or consumer-app reskins, those are acknowledged and downstream stewards are aware.
- **MCP tools healthy**, `memory_recent` first.

If any precondition fails, stop.

## The release types

theory-cloud-design cuts two release types:

1. **Release candidate (RC)** — `v0.Y.Z-rc.N` from `premain`. Published as a **prerelease** GitHub Release. Consumers can pin for early validation but it is not the canonical stable version.
2. **Stable release** — `v0.Y.Z` from `main`. Published as a **regular** GitHub Release. Canonical artifact for that version, immutable.

Hotfix releases follow the same pattern but flow through the pipeline faster (staging → premain → main in rapid succession if the hotfix is narrow and the RC soak can be abbreviated with user authorization).

## The release walk

### Step 1: Capture the pre-release state

- Merge to staging if not already merged.
- Record the `staging` tip commit SHA
- Record the `premain` tip commit SHA (the "pre-release" baseline on the prerelease branch)
- Record the `main` tip commit SHA (the "last stable" baseline)
- Record the current published versions on GitHub Releases (last RC, last stable)
- Record which downstream consumers (FaceTheory, autheory, theory-mcp-server) are currently pinning which version
- Record the changes about to be included in the release, roughly categorized (tokens, assets, brand-document, packaging, docs)

Append this state to memory — the rollback reference if the release doesn't go cleanly. This *is* memory material.

### Step 2: Promote staging → premain (if not already)

If `premain` is not already at the state you want to release-candidate:

- Open a PR from `staging` to `premain`
- PR body: the release plan, including the intended RC version, the changes included, the expected cascade impact
- Confirm the merge landed and `premain` is at the expected SHA


### Step 3: Cut the RC

When `premain` is ready and the user authorizes the RC cut:

- The release-please pipeline running on `premain` produces the RC version and publishes the prerelease GitHub Release automatically
- Confirm the prerelease is published with the expected version tag (`v0.Y.Z-rc.N`)
- Confirm the tarball asset is present and downloadable
- Confirm the changelog entry in the release notes describes the changes
- Run a local pin-and-install test: a consumer's package.json pin resolves to the new RC tarball and typechecks correctly

Append the RC cut to memory: version, SHA, date, any anomalies.

### Step 4: Notify downstream stewards of the RC availability

When the RC is published:

- Report to the user that the RC is live
- Name the downstream stewards who should pin the RC for validation (FaceTheory, autheory, theory-mcp-server, as applicable)
- Remind the user of the soak expectations the roadmap defined (number of consumer validations, specific scenarios to exercise)

The downstream stewards pin the RC on their side; you don't pin for them.

Do not promote to stable while a previously-filed issue is open unless the user explicitly authorizes shipping the known issue.

### Step 6: Promote premain → main (stable)

When the soak is complete and the user authorizes the stable cut:

- Open a PR from `premain` to `main`
- PR body: the stable release plan, the RC history, the soak observations, the consumers that have validated
- The release-please pipeline running on `main` produces the stable version and publishes the GitHub Release
- Confirm `v0.Y.Z` is published as a regular (not prerelease) GitHub Release
- Confirm the tarball asset and changelog are correct

### Step 7: Back-merge main into staging

After the stable release publishes:

```bash
git checkout staging
git pull
git merge main
git push
```

Or through a PR per project convention. `staging` must not lag `main`; the next cycle starts from the just-released baseline.

### Step 8: Coordinate the downstream cascade

When the stable release is live:

- Report to the user that `v0.Y.Z` is the new canonical version
- Name the cascade: which downstream stewards should update their pins, in what order
- Note that the cascade timing is those stewards' call; you don't drive their pin bumps

### Step 9: Persist the release

Append a release-complete entry to memory:

- Version (RC sequence and stable)
- SHAs at each stage
- Date
- Changes categorized
- Consumers that validated during soak
- Cascade status — which downstream stewards have pinned the new version
- Any non-routine observations

Release entries are high-signal memory material. Keep the record.

## If the stable release produces a regression

- Do not retag or modify the published `v0.Y.Z` release. Ever.
- Land the fix on `staging`, flow through the pipeline, cut `v0.Y.Z+1` as a new stable release.
- Consumers who pinned the broken `v0.Y.Z` re-pin the new version.
- Append the regression finding and the corrective release to memory. This is essential history.

## Refusal cases

- **"Retag v0.2.0 to include this fix."** No. Releases are immutable. Cut a new version.
- **"Promote to stable while a known regression is being investigated."** No. Ship a new RC with the fix.
- **"Cut a release from staging directly to main, bypassing premain."** No. The three-branch flow exists because premain soak catches what `npm run check` doesn't.
- **"Publish to npm as a backup distribution."** No. GitHub Releases only.
- **"Hand-edit the x-release-please-version markers to force the version."** No. Release-please automation manages them.

## What this skill will not do

- Will not cut a release without explicit version and authorization.
- Will not promote between branches without a clean check.
- Will not delete or modify published releases.
- Will not drive downstream consumer pin updates — those belong to the consumer stewards.
- Will not skip release-please — the pipeline runs automatically on branch merges and owns version bumping and changelog generation.
- Will not publish to npm.

## Output

```markdown
## Release run

### Target
- Type: <RC / stable>
- Version: <v0.Y.Z-rc.N / v0.Y.Z>
- Source branch: <staging → premain / premain → main>
- Source commit: <SHA>

### Pre-release state
- staging tip: <SHA>
- premain tip: <SHA>
- main tip: <SHA>
- Last published RC: <version>
- Last published stable: <version>
- Downstream pins: <list>

### Changes included
- <category summaries>

### Cascade implications
- <named downstream milestones or "none — internal improvement">

### Pipeline steps executed
1. Promotion PR opened: <yes/no>
2. PR merged by user: <yes/no>
3. Release-please pipeline: <succeeded / failed>
4. Published release: <URL>
5. Back-merge (if stable): <yes/no>

### Status
<RC published / stable published / rolled-back / investigating>

### Downstream coordination
<which consumer stewards were notified and what's next>
```

## Handoff

- **RC published, soak in progress** — stop. Return when soak completes for the next step.
- **Stable published, cascade in progress** — report to the user and stop. Downstream stewards own their pins.
- **Release failed (validation, merge, pipeline)** — invoke `investigate-issue` with the failure details.
- **Post-release regression** — cut `v0.Y.Z+1` through this same skill.
