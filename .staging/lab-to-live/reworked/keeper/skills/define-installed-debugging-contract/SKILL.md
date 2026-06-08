---
name: define-installed-debugging-contract
description: "Use to define or revise Cloud Keeper install, resource, tool-result, policy, audit, receipt, or GovTheory evidence contracts and fixtures before implementation consumes them."
---

# Define installed debugging contract

Use before cross-surface implementation depends on an install/debugging boundary.

## Procedure

1. Name contract and version.
2. Define producers, consumers, and owning framework/control-plane surface.
3. Define fields, invariants, and refusal cases.
4. Add valid/invalid fixtures when appropriate.
5. Define validation command or manual validation.
6. Mark unproven/planned surfaces explicitly.

## Output

```markdown
# Contract: <name> <version>

## Purpose
## Producers / consumers
## Shape
## Invariants
## Fixtures
## Validation
## Unproven surfaces
## Unsafe interpretations blocked
```
