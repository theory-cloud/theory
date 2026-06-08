---
name: orchestrate-theory-submodule-agents
description: "Use when Factory must supervise dedicated submodule agents through assignment, staging branches, PR review, fixes, merges to staging, next milestones, and final promotion."
---

# Orchestrate Theory submodule agents

Use for Mode 2 parent orchestration.

## Workspace rule

Do not use git worktrees in Factory-orchestrated submodule work. Assignments, reviews, and validations should use normal repository checkouts or isolated fresh full clones only. Avoid mutating the parent submodule checkout while the owning steward may be active.

## Core cadence

1. Reconcile Factory state.
2. Select the next authorized milestone.
3. Prepare or send one bounded assignment.
4. Wait for repo-agent response.
5. Review the PR/report against scope, contracts, and validation.
6. Approve, request fixes, block, or escalate.
7. Record outcome.
8. Send the next assignment only after the prior result is resolved.

## Stop conditions

Pause and consult the operator if work requires unapproved AWS mutation, DNS/cert/account changes, framework edits, secrets, customer data, live receipts, or cross-repo contract changes.

## Output

```markdown
# Orchestration Pass

## State reconciled
## Assignments sent
## PRs reviewed
## Fixes requested
## Blockers
## Next safe action
```
