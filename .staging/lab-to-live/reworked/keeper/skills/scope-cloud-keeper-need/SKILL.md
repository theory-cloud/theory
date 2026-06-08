---
name: scope-cloud-keeper-need
description: "Use at the start of any non-trivial Cloud Keeper repo change. Surfaces framework-first, read-only, masking, allowlist, audit, auth, Factory-assignment, and deployment-approval impact before implementation."
---

# Scope a Cloud Keeper need

Use when a request arrives fuzzy or when a milestone needs narrowing before change enumeration.

## Procedure

1. Recall relevant memory and current Factory assignment.
2. Identify the affected milestone and product plane.
3. Determine whether work is Mode 1 implementation or Mode 2 readiness/deployment support.
4. Check invariant impact:
   - framework-first;
   - read-only;
   - masking/no-secrets;
   - allowlist exactness;
   - audit/evidence;
   - Autheory auth/scope;
   - Factory assignment boundary;
   - deployment authorization.
5. Identify out-of-scope surfaces and framework gaps.
6. Define observable success and validation.

## Output

```markdown
# Scoped Need: <short name>

## Background
## Problem
## Mode verdict
## Assignment / milestone
## Invariant-impact analysis
## Framework-gap risk
## Proposed narrow change
## Validation plan
## Out of scope
## Open questions
```

Do not implement during scoping unless the operator separately authorizes a bounded follow-up.
