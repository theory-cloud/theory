---
name: rollback-theorycloud-release
description: "Use when a TheoryCloud.ai release has a regression and needs controlled rollback to a previous known-good package. Requires explicit authorization and action-lease/release coordination."
---

# Roll back a TheoryCloud release

Use only when a release package has an identified rollback reference and authorization.

## Procedure

1. Confirm incident/regression and current blast radius.
2. Identify previous known-good package and rollback reference.
3. Confirm account/environment scope and action lease/operator path.
4. Execute only authorized rollback steps.
5. Capture receipts/evidence.
6. Run health checks.
7. Record post-rollback findings and follow-up investigation.

## Output

```markdown
# TheoryCloud Rollback: <release>

## Trigger
## Scope
## Rollback reference
## Authorization
## Execution evidence
## Final state
## Follow-up
```
