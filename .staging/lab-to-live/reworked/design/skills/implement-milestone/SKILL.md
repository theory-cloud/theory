---
name: implement-milestone
description: Use to execute a single Linear milestone end to end for theory-cloud-design. Creates a PR branch off staging, lands one commit per task in enumerated order, runs brand-compliance and consumer-render validation, closes Linear tasks as commits land. Runs one milestone at a time. Only implements theory-cloud-design milestones — cascade milestones in FaceTheory / autheory / theory-mcp-server are owned by those stewards.
---

# Implement a milestone

This skill moves tokens, assets, and brand-document content. Everything before it produced text; this one produces commits, a PR, and closed Linear tasks. Treat it with the care that changes to the Theory Cloud brand deserve — theory-cloud-design's output cascades through FaceTheory into every consumer app and reaches end users as visual identity.

## Hard preconditions

Do not start without all of the following:

- **A specific milestone named**, and specifically a theory-cloud-design milestone. Cascade milestones in FaceTheory, autheory, or theory-mcp-server are owned by those repos' stewards and are out of scope for this skill.
- **The Linear milestone exists** with issues in enumerated order.
- **Clean working tree on `staging`** at a known-green commit. Feature work lands on `staging` first per the three-branch flow.
- **MCP tools healthy.** Call `memory_recent` first.
- **`npm run check` passes** on `staging` as of your checkout (typecheck + lint + asset validation + token validation).
- **The brand document is internally consistent** on `staging` — no section references removed content.

If any precondition fails, stop and surface it.

## Branch and PR setup

One branch per milestone. One PR per milestone. One commit per task.

- **Branch name**: `milestone/<tcd-milestone-short-name>`, kebab-case. Example: `milestone/tcd-brand-pack-foundation`.
- **Branched from**: `staging` at a known-green commit.
- **PR target**: `staging`. The PR merges into `staging`, which flows through the normal three-branch pipeline. It does not merge into `premain` or `main` directly.
- **PR title**: Conventional Commit subject describing the milestone. Use `feat!:` or `fix!:` if breaking.
- **Open the PR as a draft** with the milestone goal and an unchecked task list.

PR description template:

```markdown
## Milestone
<tcd-short-name> — <goal from roadmap>

## Linear
<project link> / <milestone link>

## Brand-system areas affected
<brand-doc / tokens / assets / docs / packaging>

## Surfaces affected
<Core / MCP / Auth / all>

## Cascade implications
<FaceTheory / autheory / theory-mcp-server — with notes on what downstream work will follow>

## Backward compatibility
<additive / breaking — with explicit `!` subject if breaking>

## Tasks
- [ ] <issue 1 title>
- [ ] <issue 2 title>

## Validation
- `npm run check`
- `npm run build` (produces release-candidate tarball contents)
- Representative consumer render (manual check if a consumer sample is available)
- Asset visual diff (for icon / wordmark / asset changes)
- Brand-document consistency check (no broken section references after doc edits)

## Cross-repo coordination
<named cascade milestones in downstream repos, or "none">
```

## The per-task loop

For each issue in the milestone, in enumerated order:

1. **Read the issue.** Confirm acceptance and planned commit subject. If either has drifted from repo state, stop and surface it.
2. **`memory_recent`** — refresh recent context.
3. **Cite the brand-document section** the task implements (or flag explicitly if the task is packaging / build-only).
4. **Make the change.** Only the files in the enumerated paths. Scope creep becomes a new task.
5. **Run local validation.** `npm run check` minimum. For asset changes, ensure SVG optimization ran and derivatives regenerated. For token changes, typecheck the exported surface. For brand-document changes, read back the section to confirm internal consistency.
6. **For assets**, confirm the SVG is optimized, viewBox is standardized, and any raster derivatives (PNG at defined resolutions, favicon ICO, app-tile, social templates) are regenerated from the SVG, not hand-edited.
7. **For token changes**, eyeball the typed export to confirm the change produces the expected typed surface. A token rename without updating dependent type definitions is a broken commit.
8. **For brand-document changes**, re-read adjacent sections to confirm the change doesn't create internal contradictions. The document is the spec; incoherent specs poison everything downstream.
9. **Commit.** Use the planned Conventional Commit subject verbatim. For breaking changes, include `BREAKING CHANGE:` in the body with migration notes for consumers. Never `--no-verify`. Never `--amend` a pushed commit. Never skip GPG signing. Include the Linear issue reference as `Closes <ISSUE-ID>` or `Refs <ISSUE-ID>`.
10. **Push.** Never force-push.
11. **Check the task off** in the PR description and close or progress the Linear issue.
12. **`memory_append`** only when something worth remembering happened during the task — a surprise in how a token interacts with a FaceTheory primitive, a brand-document ambiguity that required judgment, a validated asset-generation pattern. Routine "commit landed, check passed" entries aren't memory material.

## The parity rule enforced at commit time

Inside a milestone, the order from enumeration is non-negotiable:

- **Brand-document updates land before** the tokens or assets that implement them.
- **Base tokens land before surface variants** that depend on them.
- **Typed exports ride with their tokens** in the same commit.
- **Assets ship with their derivatives** in the same commit — never SVG-only with "derivatives to follow."
- **Three-surface variants**, when a change applies to all three, land in the milestone before it can ship. A milestone that updates Core and MCP but not Auth is half-done.
- **Documentation rides with consumer-visible changes.**

## Breaking-change discipline

When a task is flagged breaking:

- The Conventional Commit subject uses `feat!:` or `fix!:` (the `!` is load-bearing — release-please reads it).
- The commit body includes a `BREAKING CHANGE:` line naming the affected consumer apps (FaceTheory, autheory, theory-mcp-server) and describing what they must change to accept the new shape.
- The migration note is precise: "the `surfaceChipBackground` token was renamed to `surfaceChip.background` to match the nested-token convention; consumers using `tokens.core.surfaceChipBackground` should update to `tokens.core.surfaceChip.background`."
- If the breaking change cascades, the PR description names the specific cascade milestones downstream stewards will need to execute.

Pre-1.0 theory-cloud-design can ship breaking changes per semver pre-1.0 convention, but the signal must be explicit. You do not bury breaking changes to avoid the minor bump.

## If `npm run check` goes red mid-milestone

- **Do not** add a "fix check" commit touching unrelated code.
- **Do** stop, investigate, and surface the failure.
- **Do not** weaken a check to make it pass. Token validation, asset optimization, and brand-document consistency checks exist because something broke in the past.
- If the failure is caused by your most recent commit, revert with a new revert commit (not `git reset --hard`) and re-plan the task.

## If a brand-document change breaks section references

- **Stop.** The document is the spec; a broken internal reference is a spec-level regression.
- Re-read the document end to end to find all references to the changed section.
- Fix references in the same commit as the content change, or split the commit into a references-rename commit followed by the content change.
- Under no circumstances ship a brand-document commit that leaves the document internally inconsistent.

## Finishing the milestone

When all tasks in the milestone are committed, pushed, and their Linear issues closed:

1. Run `npm run check` one more time on the tip. Green only.
2. Run `npm run build` to confirm the release-candidate tarball builds cleanly.
3. If the milestone includes asset changes, do a final visual diff against the previous release to confirm no unintended regressions.
4. If the milestone includes brand-document changes, read the document top to bottom one more time to confirm internal consistency.
5. Promote the PR out of draft.
6. Update the PR description: check all task boxes, fill in the validation section with commands actually run and outcomes.
7. **Leave merging to the user.** You do not merge PRs. You do not promote `staging → premain → main`. Those are release decisions that require explicit human authorization.
8. Append a milestone-complete entry only if the milestone surfaced something worth remembering — a pattern, a surprise, a validated design choice. Routine milestone completions aren't memory material.
9. If the milestone has cascade implications, note the downstream stewards' milestones that are now unblocked (in Linear) and remind the user of the cross-repo coordination needed.

## If the milestone needs to pause

- Leave the PR in draft with the partial task list.
- Commit and push what is complete.
- Append a pause entry: milestone name, last-completed task, next task to pick up, any brand-document or token decisions in flight. This *is* memory material — resumption depends on it.
- Tell the user clearly which task is next.

## What this skill will not do

- Will not implement more than one milestone in a single run.
- Will not implement cascade milestones in FaceTheory / autheory / theory-mcp-server — those are owned by their repos' stewards.
- Will not open a PR against `premain` or `main`.
- Will not merge any PR.
- Will not promote `staging → premain` or `premain → main`.
- Will not run `git tag` or create a release.
- Will not touch `.release-please-manifest.json` / `.release-please-manifest.premain.json` — those move only through the release-please pipeline.
- Will not hand-edit `x-release-please-version` comments — release-please maintains them.
- Will not publish to npm.
- Will not ship a commit that leaves the brand document internally inconsistent.
- Will not ship a commit that breaks a representative consumer render in a way the brand document doesn't sanction.
- Will not force-push, amend a pushed commit, or rewrite history on a shared branch.
- Will not push a Theory-Cloud-specific concept into FaceTheory's brand-agnostic primitives.
- Will not add a fourth surface variant without an explicit brand-document update.
