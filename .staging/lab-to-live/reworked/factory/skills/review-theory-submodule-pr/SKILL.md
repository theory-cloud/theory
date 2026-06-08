---
name: review-theory-submodule-pr
description: "Use to review a submodule-agent PR against its Factory assignment, contract compatibility, scope boundaries, validation evidence, and staging-branch discipline."
---

# Review a Theory submodule PR

Use when a repo agent returns a PR or branch for Factory review.

## Workspace rule

Do not use git worktrees for submodule PR review. Use GitHub metadata and, when local validation is needed, an isolated fresh full clone under `/tmp`. Do not mutate the parent submodule checkout while a repo steward may be actively working there.

## Procedure

1. Read the original assignment.
2. Confirm PR target branch matches the assignment.
3. Confirm changed files stay within allowed repo/scope.
4. Check contract compatibility and fixture use.
5. Review validation output.
6. Run safe local checks when appropriate and authorized.
7. Inspect for forbidden surfaces: secrets, local logs, AWS mutation, framework edits, sibling/parent changes, live receipts.
8. Return findings: approve, request fixes, block, or escalate.

## Output

```markdown
# Submodule PR Review: <repo/pr>

## Assignment match
## Scope review
## Contract review
## Validation review
## Findings
## Decision
```

Do not patch the PR yourself unless the operator creates a separate explicit remediation event.
