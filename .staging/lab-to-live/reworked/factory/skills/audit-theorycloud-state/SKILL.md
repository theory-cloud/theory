---
name: audit-theorycloud-state
description: "Use to audit current Factory/TheoryCloud.ai state: repos, submodules, branches, assignments, contracts, decisions, release pins, receipts/evidence placeholders, or prototype readiness. Produces a report, not changes."
---

# Audit TheoryCloud state

Use when Factory needs a read-only picture before planning, assignment, release, or cleanup.

## Procedure

1. Select audit scope: repos, contracts, implementation waves, assignments, release packages, dogfood gates, or unsafe claims.
2. Read authoritative Factory records first.
3. Compare records to local/git state where safe.
4. Identify drift, missing records, stale claims, and unowned surfaces.
5. Report findings without silently fixing them.

## Output

```markdown
# TheoryCloud State Audit: <scope>

## Sources checked
## Findings
## Drift / gaps
## Risks
## Recommended remediation
```
