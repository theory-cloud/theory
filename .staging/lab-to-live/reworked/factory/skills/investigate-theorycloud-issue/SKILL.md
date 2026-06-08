---
name: investigate-theorycloud-issue
description: "Use when a user reports a TheoryCloud.ai, Factory, TheorySocket, action lease, runner, receipt, registry, submodule-agent, or deploy-orchestration issue. Produces findings before fixes."
---

# Investigate a TheoryCloud issue

Investigation precedes remediation.

## Procedure

1. Identify the affected mode and product plane.
2. Read relevant Factory records, contracts, assignments, PRs, logs, or receipts that are safely available.
3. Distinguish observed facts from inference.
4. Identify the owning repo/agent if the issue is outside Factory.
5. Identify whether a fix is parent-owned, submodule-owned, framework-owned, or release/authority-bound.
6. Produce findings and recommend next actions.

## Output

```markdown
# Investigation: <issue>

## Facts observed
## Inferences
## Likely owner
## Risk / blast radius
## Recommended next action
## Validation needed
```

Do not fix during investigation unless the operator authorizes a bounded follow-up.
