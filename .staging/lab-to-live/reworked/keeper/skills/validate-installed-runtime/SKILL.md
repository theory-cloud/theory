---
name: validate-installed-runtime
description: "Use after an explicitly authorized Cloud Keeper install/deployment to validate health, MCP discovery, read-only tools, masking, audit/evidence, and TheoryMCP target behavior. Does not authorize or initiate deployment."
---

# Validate installed runtime

Use only after deployment has been explicitly authorized and performed through the approved path.

## Procedure

1. Confirm who authorized deployment and what was deployed.
2. Confirm target environment and endpoint.
3. Run health/discovery checks approved for the environment.
4. Validate MCP `tools/list` and safe read-only `tools/call` checks.
5. Confirm masking and no-secrets behavior.
6. Confirm audit/evidence/receipt pointers where available.
7. Record results and blockers.

## Output

```markdown
# Installed Runtime Validation

## Authorization reference
## Target
## Health / discovery
## Read-only tool checks
## Masking / audit / evidence
## Issues found
## Final verdict
```

Do not perform mutation or broad exploratory reads during validation.
