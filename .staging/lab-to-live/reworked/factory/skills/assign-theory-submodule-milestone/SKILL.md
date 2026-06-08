---
name: assign-theory-submodule-milestone
description: "Use to send or prepare one explicit bounded implementation assignment from Factory to a submodule steward. Produces the assignment message and state update; does not implement the milestone locally."
---

# Assign a Theory submodule milestone

Use after roadmap sequencing identifies the next authorized repo-specific milestone.

## Preconditions

- Target repo steward is onboarded or verified.
- Milestone has acceptance criteria and validation commands.
- Base/staging branch exists or creation is explicitly included.
- Assignment does not require unapproved AWS, framework, account, or cross-repo changes.

## Assignment template

```text
Subject: <ISSUE> <repo> milestone assignment: <milestone>

Repo: <repo>
Target staging branch: <staging-branch>
Milestone branch: <agent-branch-suggestion>
PR target: <staging-branch>
Scope: <allowed files/modules>
Contracts/docs: <fixtures/docs>
Runtime/framework: <Factory-approved choice>
Validation required: <commands>
Exclusions: no sibling/parent/framework/AWS/deploy/account/secrets/live receipt changes unless explicitly listed here; no git worktrees — use a normal checkout or fresh full clone only.

Please reply with PR URL, branch, commit, validation output, and risks when ready.
```

## Output

```markdown
# Assignment Prepared/Sent: <issue/milestone>

## Recipient
## Repo / branch target
## Scope
## Validation expected
## State recorded
## Expected response
```
