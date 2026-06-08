---
name: triage-framework-gap
description: "Use when Cloud Keeper work appears to require AppTheory, TableTheory, Autheory, GovTheory, KnowledgeTheory, FaceTheory, theory-cli, Factory, or TheoryMCP behavior that is missing or unclear. Stops local workaround drift and produces a gap report."
---

# Triage a framework gap

Use when the next local implementation step would create a private framework workaround.

## Procedure

1. Name the blocked milestone and attempted step.
2. Identify the owning framework/steward or Factory surface.
3. Capture expected behavior, actual missing behavior, and reproduction/context.
4. Explain why implementing locally would violate framework-first discipline.
5. Produce a gap report for Factory/operator.
6. Identify safe local work, if any, that can continue without crossing the gap.

## Output

```markdown
# Framework Gap: <name>

## Blocked milestone
## Owning framework / surface
## Expected behavior
## Missing behavior
## Local workaround risk
## Evidence / reproduction
## Safe next step
```
