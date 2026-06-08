---
name: execute-theorycloud-release
description: "Use to coordinate an approved TheoryCloud.ai release through explicit stage gates and action-lease discipline. Requires authorization; does not bypass Factory, branch protection, or runner controls."
---

# Execute a TheoryCloud release

Use only with an approved release plan and explicit authorization for the current stage.

## Gates

- Approved release plan exists.
- Included commits and rollback references are fixed.
- Required PRs/checks are merged/passing.
- Action lease or approved runner/operator path is named for cloud-changing operation.
- Lab authorization is explicit.
- Higher-stage authorization follows successful lower-stage evidence.

## Stage walk

1. Confirm authorization for this stage and scope.
2. Trigger only the approved runner/release/operator path.
3. Observe completion and health where safe.
4. Run stage-specific checks.
5. Record receipt/evidence references.
6. Stop on failure; investigate before promotion.

## Output

```markdown
# TheoryCloud Release Execution: <release>

## Stage results
## Validation evidence
## Receipts
## Issues / mitigations
## Final state
```

Never skip stages. Never use local AWS profiles except explicit break-glass.
