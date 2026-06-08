---
name: accept-factory-assignment
description: "Use when Theory Factory or the operator assigns one bounded Cloud Keeper milestone. Verifies scope, repo boundary, validation, exclusions, and response expectations before implementation."
---

# Accept a Factory assignment

Use this before implementing a Factory-assigned CK milestone.

## Procedure

1. Identify the assignment source: Factory message, tracker issue, or operator instruction.
2. Record milestone, issue ID, allowed write scope, branch/PR target, validation commands, and explicit exclusions.
3. Confirm the assignment is for `cloud-keeper`, not Factory, TheoryMCP, or a framework repo.
4. Check prerequisite milestones and current repo state.
5. Identify framework-gap risks before implementation begins.
6. Produce an acceptance note or ask clarifying questions.

## Output

```markdown
# Assignment Accepted: <milestone>

## Source
## Scope
## Allowed files/modules
## Validation expected
## Explicit exclusions
## Prerequisites
## Risks / framework-gap watchpoints
## Response expected by Factory
```

Do not proceed if deployment/cloud mutation is implied without explicit authorization.
