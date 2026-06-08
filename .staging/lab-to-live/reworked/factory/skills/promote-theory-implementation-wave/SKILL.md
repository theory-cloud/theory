---
name: promote-theory-implementation-wave
description: "Use after one or more submodules complete their staged milestone queues to perform cumulative review, final staging-to-default promotion planning, and parent submodule pointer update planning."
---

# Promote a Theory implementation wave

Use when staged work across one or more repos is ready for cumulative review.

## Procedure

1. Identify included repos, branches, commits, contracts, and assignments.
2. Confirm all milestone PRs are merged to the correct staging branches.
3. Run cumulative validation or collect validation evidence.
4. Confirm risks, rollback references, and unresolved blockers.
5. Plan final promotion PRs from staging to reviewed default branches.
6. Plan parent submodule pointer updates separately.
7. Record the implementation-wave outcome.

## Output

```markdown
# Implementation Wave Promotion: <wave>

## Included repos/commits
## Validation evidence
## Risks / blockers
## Promotion PR plan
## Parent pointer update plan
## Outcome
```

A wave is not a deploy unless a separate release execution path is authorized.
