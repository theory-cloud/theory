---
name: prepare-theorymcp-deployment-readiness
description: "Use to prepare the Cloud Keeper readiness package for the dedicated theory-mcp-server environment. Produces deployment inputs, validations, risks, rollback notes, and evidence expectations; does not execute deployment."
---

# Prepare TheoryMCP deployment readiness

Use for CK-M10 or earlier readiness checks. This is planning/evidence, not execution.

## Procedure

1. Confirm deployment target is dedicated `theory-mcp-server` environment.
2. Confirm implementation milestones and required validations are complete.
3. Identify exact commits, contracts, configs, and AppTheory/GovTheory artifacts.
4. Define expected action/approval path and who must authorize execution.
5. Define smoke tests and evidence/receipt expectations.
6. Define rollback/stop conditions.
7. State explicitly that no deployment is executed by this skill.

## Output

```markdown
# TheoryMCP Deployment Readiness: Cloud Keeper

## Included commit / version
## Target environment
## Preconditions
## Validation completed
## Deployment inputs
## Smoke tests
## Evidence / receipt expectations
## Risks / stop conditions
## Authorization required
```
