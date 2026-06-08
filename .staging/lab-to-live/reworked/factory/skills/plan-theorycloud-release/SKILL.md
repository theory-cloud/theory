---
name: plan-theorycloud-release
description: "Use to plan a TheoryCloud.ai release package before execution. Selects repo versions, contracts, submodule pins, validation gates, soak criteria, rollback references, and release handoff details."
---

# Plan a TheoryCloud release

Use for Mode 3 planning. Planning is not execution.

## Procedure

1. Define release purpose and scope.
2. Fix included repos, commits, contract versions, and environment/account class.
3. Define validation gates and soak criteria.
4. Define action lease requirements and runner/operator handoff.
5. Define receipt and GovTheory evidence expectations.
6. Define rollback references.
7. Identify required explicit authorizations.

## Output

```markdown
# TheoryCloud Release Plan: <release>

## Scope
## Included repos/commits
## Contracts
## Environment/account class
## Validation and soak
## Action lease / runner path
## Receipt/evidence expectations
## Rollback reference
## Authorizations required
```
