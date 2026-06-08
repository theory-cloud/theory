---
name: define-action-lease-policy
description: "Use to define or refine action lease policy for TheoryCloud.ai: requesters, approvers, scopes, TTL, runner handoff, destructive-operation rules, evidence, receipts, expiry, retry, and revocation."
---

# Define action lease policy

Action leases are the authority boundary for cloud-changing managed execution.

## Procedure

1. Identify requester, approver, target account/environment, action, reason, and scope.
2. Define TTL, expiry, revocation, retry, and cancellation behavior.
3. Classify destructive potential.
4. Define runner handoff and validation requirements.
5. Define receipt and GovTheory evidence requirements.
6. Define what a runner must refuse.

## Output

```markdown
# Action Lease Policy: <scope>

## Request / approval model
## Scope and TTL
## Destructive classification
## Runner handoff
## Receipt/evidence requirements
## Refusal cases
## Open questions
```

No managed runner executes a cloud-changing operation without a valid scoped lease.
