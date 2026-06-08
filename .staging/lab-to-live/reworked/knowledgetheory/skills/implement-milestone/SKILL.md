---
name: implement-milestone
description: Use to execute a single Linear milestone end to end. Creates a PR branch, lands one commit per task in enumerated order, keeps parity across runtimes on every commit, and closes Linear tasks as commits land. Runs one milestone at a time.
---

# Implement a milestone

This is the skill that actually moves code. Everything before this (`investigate`, `scope`, `enumerate`, `roadmap`, `linearize`) produced text; this one produces commits, a PR, and closed Linear tasks. Treat it with the care that change-to-production deserves.

## Hard preconditions

Do not start this skill without all of the following:

- **A specific milestone named.** You implement one milestone per invocation. "Implement the roadmap" is not a valid input.
- **The Linear project and milestone exist** with issues in enumerated order. If they don't, run `create-linear-project` first.
- **You are on a clean working tree** on the repo's `premain` branch (or the branch the milestone is meant to descend from). Stash or commit existing work before starting, do not mix in-progress changes with milestone commits.
- **MCP tools are healthy.** Call `memory_recent` as the first action. If it fails, stop and ask the user to re-auth. You cannot implement a milestone without memory — mid-milestone context is exactly when future-you will need it.
- **`bash gov-infra/verifiers/gov-verify-rubric.sh` passes on `premain` as of your checkout.** If the baseline is already red, you cannot attribute a later failure to your change. Fix the baseline first, or reset to a known-green commit, before starting.

If any precondition fails, stop, surface the problem to the user, and do not create a branch or commit.

## Branch and PR setup

One branch per milestone. One PR per milestone. One commit per task.

- **Branch name**: `milestone/<phase-number>-<milestone-short-name>`, kebab-case. Example: `milestone/2-compiler-validator-hardening`.
- **Branched from**: `premain` at a known-green commit.
- **PR target**: `premain`. The PR merges into `premain`. It does not merge into `main`. Promotion to `main` (and therefore `live`) is a separate user-authorized step.
- **PR title**: Conventional Commit subject describing the milestone as a whole. Usually `feat(<scope>): <milestone goal>` or `fix(<scope>): <milestone goal>`.
- **Open the PR as a draft** at the start, with the milestone goal in the description and an unchecked task list matching the milestone's Linear issues. Promote out of draft when the last task's commit lands and the rubric passes.

PR description template:

```markdown
## Milestone
<short-name> — <goal from roadmap>

## Linear
<project link> / <milestone link>

## Tasks
- [ ] <issue 1 title>
- [ ] <issue 2 title>
- ...

## Contract impact
<fixture-first / internal-only / etc — inherited from enumerated items>

## Validation
Commands run on the final commit:
- `bash gov-infra/verifiers/gov-verify-rubric.sh`
- `./scripts/verify-contract-tests.sh`
- <any milestone-specific validation>

## Cross-repo notes
<any other-steward coordination or "none">
```

## The per-task loop

For each issue in the milestone, in enumerated order, do exactly this:

1. **Read the issue.** Confirm you understand its acceptance criterion and its Conventional Commit subject as planned during `create-linear-project`. If either has drifted from the current state of the repo, stop and surface it — do not silently update scope mid-flight.
2. **`memory_recent`** — refresh recent context. If prior tasks in this milestone recorded surprises, pick them up now.
3. **Make the change.** Only the files required for this one task. If you find yourself touching files outside the enumerated paths, stop — that's scope creep and belongs in a new task, not this commit.
4. **Run local validation.** At minimum `go test ./...`. If the task is contract-visible, run `./scripts/verify-contract-tests.sh`. If any exported surface moved, run `./scripts/update-api-snapshots.sh` and include the snapshot diff in the same commit.
5. **Run `bash gov-infra/verifiers/gov-verify-rubric.sh`** if the task claims to complete a contract-visible change. Yellow rubric is not allowed — if any gate fails, you have not completed the task.
6. **Commit.** Use the planned Conventional Commit subject verbatim. Never `--no-verify`. Never `--amend` a commit that has been pushed. Never skip GPG signing. Include the Linear issue reference in the commit body as `Closes <ISSUE-ID>` or `Refs <ISSUE-ID>` so Linear links the commit automatically.
7. **Push.** `git push` to the milestone branch. Do not force-push.
8. **Check the task off** in the PR description's task list and close or mark-in-progress the corresponding Linear issue.
9. **`memory_append`** — only when something worth remembering happened during the task: a surprising root cause, a user correction, a validated pattern, a non-obvious constraint. Routine "commit landed, tests passed" entries aren't memory material. Narrative over telegraphic when you do write.

Repeat for the next task in order.

## The parity rule enforced at commit time

Inside a milestone, the order from enumeration is non-negotiable:

- A fixture-change commit lands **before** any runtime-implementation commit for the same behavior.
- An api-snapshot update lands **in the same commit** as the change that moved the surface. Not the next commit.
- Operator workflow changes land **after** the runtime they orchestrate.

If you find yourself wanting to split any of these across commits "for clarity," don't. A commit that compiles without its paired artifact is a lie about the repo state.

## If `make rubric` goes red mid-milestone

- **Do not** add a "fix rubric" commit to this milestone if the failure is unrelated to your changes.
- **Do** stop, investigate, and surface the failure to the user. If it's a flake, document it. If it's a real regression, it's a separate scope and needs its own investigation skill run.
- **Do not** bypass the failing gate. The gates exist because something broke in the past; bypassing reopens that failure mode.
- If the failure is caused by your most recent commit, revert that commit (a new revert commit, not `git reset --hard`) and re-plan the task before attempting again.

## Finishing the milestone

When all tasks in the milestone are committed, pushed, and their Linear issues closed:

1. Run `bash gov-infra/verifiers/gov-verify-rubric.sh` one more time on the tip of the branch. Green is the only acceptable state.
2. Promote the PR out of draft.
3. Update the PR description: check all task boxes, fill in the validation section with the commands you actually ran and their outcomes.
4. Leave merging to the user. You do not merge the PR yourself. You do not promote `premain → main`. Those are release decisions that cross the stewardship boundary into release management, and they require explicit human authorization regardless of how clean the PR is.
5. Append a milestone-complete entry only if the milestone surfaced something worth remembering — a pattern, a surprise, a validated design choice. Routine milestone completions aren't memory material.

## If the milestone needs to be paused

Milestones do not always finish in one session. If you have to stop partway:

- Leave the PR in draft with the partial task list.
- Commit and push everything that is complete. Do not leave uncommitted work sitting on the branch.
- Append a pause entry: milestone name, last-completed task, next task to pick up, any decisions-in-flight. This *is* memory material — resumption depends on it.
- Tell the user clearly which task is next so they can resume with the right context.

## What this skill will not do

- Will not implement more than one milestone in a single run.
- Will not open a PR against `main`.
- Will not merge a PR.
- Will not run `theory app up`, `theory app down`, or any deploy operation.
- Will not touch `VERSION`, `.release-please-manifest.json`, or any release manifest — those move only through the release-please pipeline.
- Will not modify `contract-tests/` or `api-snapshots/` unless the task being implemented explicitly requires it.
- Will not force-push, amend a pushed commit, or rewrite history on a shared branch.
