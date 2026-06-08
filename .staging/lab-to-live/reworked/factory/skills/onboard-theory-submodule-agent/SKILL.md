---
name: onboard-theory-submodule-agent
description: "Use to onboard or verify a dedicated repo steward for a TheoryCloud.ai submodule: identity, route/channel, write scope, branch policy, validation commands, forbidden surfaces, and Factory assignment protocol."
---

# Onboard a Theory submodule agent

Use when a repository enters Factory-orchestrated work.

## Boundary

Factory records and assigns onboarding. It does not silently edit the submodule's repo-local instructions. If files need to be created in the submodule, that is an explicit onboarding assignment or operator-authorized repo-local change.

## Procedure

1. Record repo name, path, remote, default branch, and intended staging branch.
2. Identify steward identity, MCP/mailbox/issue channel, and current instruction files.
3. Define product plane and responsibility.
4. Define allowed write scope and forbidden surfaces.
5. Define validation commands and hygiene checks.
6. Define branch/PR target convention and the no-worktree workspace rule: normal checkout or fresh full clone only.
7. Record first assignment queue or blocker.
8. Update Factory repository enumeration or produce the update plan.

## Output

```markdown
# Submodule Agent Onboarding: <repo>

## Repository identity
## Product plane / responsibility
## Steward identity and channel
## Branch policy
## Allowed write scope
## Forbidden surfaces
## Validation commands
## First milestone queue
## Factory records updated or planned
## Open blockers
```
