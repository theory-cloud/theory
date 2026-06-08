---
name: scope-theorycloud-need
description: "Use when the operator brings a new TheoryCloud.ai capability, repo boundary, orchestration concern, account model question, socket command, runner behavior, or productization change. Produces scoped need before implementation."
---

# Scope a TheoryCloud need

Use this first for non-trivial Mode 1 Factory changes or for new TheoryCloud.ai work that may become Mode 2 or Mode 3.

## When to use

- New product capability, repo boundary, contract, policy, runner behavior, receipt shape, or orchestration concern.
- A request may touch platform accounts, customer workload accounts, action leases, receipts, deployment, or managed runners.
- The user asks for implementation but the responsible repo/contract/authority is not yet clear.

## Procedure

1. Recover relevant memory/state when available.
2. Read Factory instructions and current decisions before treating chat context as authoritative.
3. Classify the plane: identity, agent, operations, command/event, governance/evidence, runner, registry, UI/CLI, or customer workload.
4. Identify whether the request is parent Factory work, submodule work, framework work, or deployment/release work.
5. Surface locked-decision impact and unsafe-claim risk.
6. Identify authority/account impact.
7. Name out-of-scope surfaces.
8. Define success criteria and validation.

## Output

```markdown
# Scoped Need: <short name>

## Background
## Driver
## Problem
## Affected plane(s)
## Mode verdict
## Locked-decision impact
## Authority / account impact
## Cross-repo / Factory impact
## Narrowest-scope proposal
## Out of scope
## Success criteria
## Validation plan
## Open questions
```

Do not implement during scoping unless the operator separately authorizes a bounded follow-up.
