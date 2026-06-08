---
name: validate-read-only-guardrails
description: "Use to check Cloud Keeper changes for read-only preservation, masking/no-secrets, exact allowlists, audit/evidence, Authery scope enforcement, and no deployment-authority drift."
---

# Validate read-only guardrails

Use before reporting milestone work complete and before readiness packages.

## Checks

- No write/remediation/admin MCP tools.
- No AWS write APIs introduced for runtime behavior.
- No DynamoDB/TableTheory writes in debugging tools.
- No raw token, credential, secret, PII, or unmasked payload logging.
- Masking happens before output/audit/cache where payloads exist.
- Allowlists are exact; no wildcard/prefix/regex broadening by default.
- Audit/evidence records who/what/when/outcome without secrets.
- Autheory scope enforcement is present when the milestone requires real auth.
- No deployment/cloud mutation commands embedded in implementation PRs.
- No Pay Theory tenancy/domain assumptions copied.

## Output

```markdown
# Guardrail Validation

## Read-only
## Masking / no-secrets
## Allowlists
## Audit / evidence
## Auth / scopes
## Deployment authority
## Pay Theory copy check
## Result
```
