---
name: reconcile-theory-factory-state
description: "Use to reconcile Factory truth across docs, memory, issue tracker, mailbox, GitHub PRs, local submodules, and release pins before assigning more work or after an interrupted orchestration run."
---

# Reconcile Theory Factory state

Use before issuing new submodule assignments or after any interrupted orchestration loop.

## Procedure

1. Read current Factory docs and implementation-wave records.
2. Recall durable memory if available.
3. Check issue/PR/channel state when tools are available.
4. Check local submodule pins and dirty state when submodules exist; do not create or rely on git worktrees while reconciling.
5. Identify assignments that are pending, ready for review, blocked, merged, or stale.
6. Produce a current-state snapshot and safe next actions.

## Output

```markdown
# Factory State Reconciliation

## Sources checked
## Active assignments
## PRs / branches
## Contract state
## Blockers
## Safe next actions
```

Do not send new assignments from stale state.
