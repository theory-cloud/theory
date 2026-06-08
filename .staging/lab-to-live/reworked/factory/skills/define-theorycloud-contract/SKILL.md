---
name: define-theorycloud-contract
description: "Use to define or revise TheoryCloud.ai contracts: action leases, account classes, registry records, TheorySocket commands/events, runner handoff, receipts, preflight, GovTheory evidence, or CLI/UI/agent boundaries."
---

# Define a TheoryCloud contract

Use before cross-repo implementation consumes a boundary.

## Procedure

1. Name the contract and version.
2. State producers, consumers, and product plane.
3. Define required fields and invariants.
4. Define valid and invalid examples.
5. Identify validation commands or fixture checks.
6. Mark planned/unproven surfaces explicitly.
7. Record unsafe interpretations to block.

## Output

```markdown
# Contract Definition: <name> <version>

## Purpose
## Producers / consumers
## Schema or field shape
## Valid fixtures
## Invalid fixtures
## Validation
## Unproven / planned surfaces
## Unsafe interpretations blocked
```
