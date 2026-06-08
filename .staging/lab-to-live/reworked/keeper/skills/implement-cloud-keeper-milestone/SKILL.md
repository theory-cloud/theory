---
name: implement-cloud-keeper-milestone
description: "Use to implement one assigned CK milestone inside the cloud-keeper repo. Runs repo-local changes only, validates guardrails, and reports one PR/status package for Factory review."
---

# Implement a Cloud Keeper milestone

Use only after accepting a Factory/operator assignment.

## Procedure

1. Confirm milestone, branch, allowed scope, and exclusions.
2. Check current repo status.
3. Implement only the assigned milestone.
4. Stop on framework gaps; do not hand-roll framework-owned behavior.
5. Run available validation and `validate-read-only-guardrails`.
6. Report changed files, validation, risks, and blockers.
7. Prepare PR/status for Factory review.

## Output

```markdown
# Milestone Implementation: <CK-MN>

## Scope implemented
## Changed files
## Validation run
## Guardrail results
## Framework gaps
## PR/status for Factory
## Follow-ups
```

Do not deploy as part of this skill.
