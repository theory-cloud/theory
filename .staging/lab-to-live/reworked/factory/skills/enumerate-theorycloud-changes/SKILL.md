---
name: enumerate-theorycloud-changes
description: "Use after a TheoryCloud.ai scoped need is accepted. Produces a flat ordered list of discrete reviewable changes across Factory docs, contracts, validation, orchestration records, and submodule assignments."
---

# Enumerate TheoryCloud changes

Use after `scope-theorycloud-need` when the need is accepted but before implementation or assignment.

## Procedure

1. Restate the scoped need in one paragraph.
2. Split parent-owned Factory changes from submodule assignments and deployment/release gates.
3. For each change, name the files or artifacts, owner, mode, validation, and dependencies.
4. Keep each item reviewable. If an item requires multiple repos, split it.
5. Flag required operator decisions and explicit authorizations.
6. Identify unsafe claims that must remain blocked.

## Output

```markdown
# Enumerated Changes: <need>

1. <Mode> <owner> <artifact/change>
   - Scope:
   - Validation:
   - Dependencies:
   - Authorization:
```

This skill does not write files and does not assign repo agents by itself.
