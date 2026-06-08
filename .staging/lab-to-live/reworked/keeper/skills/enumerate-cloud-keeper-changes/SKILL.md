---
name: enumerate-cloud-keeper-changes
description: "Use after a Cloud Keeper need or milestone is scoped. Produces a flat ordered list of focused repo-local changes, validations, and framework-gap checks."
---

# Enumerate Cloud Keeper changes

Use before implementation when a scoped need has more than one concrete step.

## Procedure

1. Restate the accepted scope.
2. Split work into focused repo-local changes.
3. For each change, name files/modules, invariant impact, validation, and dependency.
4. Separate docs/contracts/tests/runtime/CDK/governance work.
5. Identify any step that must stop for Factory/framework input.
6. Confirm no deployment/cloud mutation is included unless explicitly authorized.

## Output

```markdown
# Enumerated Changes: <scope>

1. <change>
   - Files/modules:
   - Invariants:
   - Validation:
   - Dependencies:
   - Stop-line:
```
