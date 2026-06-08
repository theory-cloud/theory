---
name: investigate-cloud-keeper-issue
description: "Use when a Cloud Keeper implementation, runtime, auth, masking, read-only, contract, readiness, or TheoryMCP-target issue is reported. Produces findings before fixes."
---

# Investigate a Cloud Keeper issue

Investigation precedes remediation.

## Procedure

1. Identify affected milestone, mode, and surface.
2. Read relevant code/docs/contracts/tests/readiness artifacts.
3. Distinguish facts from inference.
4. Check whether the issue is repo-local, framework-owned, Factory-owned, or TheoryMCP-owned.
5. Check read-only/masking/auth/audit/allowlist implications.
6. Recommend next action and validation.

## Output

```markdown
# Investigation: <issue>

## Facts observed
## Inferences
## Owner / boundary
## Invariant impact
## Recommended next action
## Validation needed
```

Do not fix during investigation unless the operator authorizes a bounded follow-up.
