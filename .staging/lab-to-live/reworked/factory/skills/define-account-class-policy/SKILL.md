---
name: define-account-class-policy
description: "Use to define TheoryCloud.ai account class policy: platform_root, platform_service, platform_control, customer_workload, and customer_dedicated, including break-glass, direct AWS access, runner authority, and support posture."
---

# Define account class policy

Use when work touches account ownership, access, deployment, support, or claims.

## Procedure

1. Identify the account class.
2. Define owner, routine access path, break-glass path, and recovery constraints.
3. Define action lease requirements.
4. Define runner permissions and forbidden operations.
5. Define receipts/evidence requirements.
6. Identify which claims this account class can and cannot prove.

## Output

```markdown
# Account Class Policy: <class>

## Ownership
## Routine access
## Break-glass / recovery
## Runner authority
## Evidence requirements
## Claims allowed / blocked
```

Never use platform-account proof as customer workload proof.
