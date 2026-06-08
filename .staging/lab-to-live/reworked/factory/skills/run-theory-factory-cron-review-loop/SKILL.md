---
name: run-theory-factory-cron-review-loop
description: "Use when Factory is invoked by bounded automation to process repo-agent review requests, merge approved PRs to staging, request fixes, send next queued assignments, or self-assign parent-owned Factory tasks. Must not sleep/poll unboundedly."
---

# Run Factory cron review loop

Use only for bounded non-interactive orchestration.

## Procedure

1. Acquire a lock or verify no concurrent run.
2. Reconcile state from docs, memory, issues/PRs/channels, and local repo state.
3. Process ready review requests.
4. Request fixes or record approvals according to policy.
5. Prepare next assignments only when authorized.
6. Record state and release the lock.
7. Exit.

## Prohibited

- No unbounded polling.
- No sleeping for an hour.
- No cloud-changing operations.
- No destructive git operations.
- No submodule patching.

## Output

```markdown
# Cron Review Loop Result

## Processed
## Assignments prepared/sent
## Reviews completed
## Blockers
## Next run recommendation
```
