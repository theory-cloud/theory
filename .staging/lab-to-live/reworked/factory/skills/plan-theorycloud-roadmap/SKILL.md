---
name: plan-theorycloud-roadmap
description: "Use after enumerating changes to sequence TheoryCloud.ai work into milestones, dependencies, risks, validation gates, submodule assignments, and Factory/framework consultation points."
---

# Plan a TheoryCloud roadmap

Use when enumerated changes need sequencing across multiple milestones, repos, contracts, or dogfood stages.

## Procedure

1. Group changes into milestones with one primary owner each.
2. Put contracts before consumers and policy before runner execution.
3. Preserve dogfood order: TheoryMCP lab before Autheory lab before TheoryCloud self-management before customer workload proof.
4. Identify submodule assignments separately from parent Factory work.
5. Name validation gates and evidence expected at each milestone.
6. Name blockers and decisions the operator must resolve.

## Output

```markdown
# Roadmap: <initiative>

## Milestone sequence
## Contract dependencies
## Submodule assignments
## Validation and evidence gates
## Risks and blockers
## Decisions required
```

A roadmap is not authorization to implement every milestone. Each milestone still needs assignment or implementation authorization.
