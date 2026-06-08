---
name: create-linear-project
description: Use after plan-roadmap is approved. Translates a theory-cloud-design roadmap document into Linear milestones and tasks in the design-system rollout project in your tracker (or a follow-on project). Explicitly names cascade milestones in consumer repos so their stewards can pick them up.
---

# Create a Linear project

This skill turns an approved roadmap into Linear state: milestones and issues, typically under the existing design-system rollout project in your tracker for the rollout cascade, or a new project for follow-on work. It does not execute implementation — that is `implement-milestone`'s job.

## Check what tools you have

- Is a Linear MCP tool available on the current session? Prefer direct API calls — the tools are loaded and working.
- Otherwise, produce a well-shaped markdown draft for the user to paste.

Surface which mode you're in at the start.

## The mapping

- **One Linear project** either extends the existing design-system rollout project in your tracker or creates a follow-on project named after the roadmap goal.
- **One Linear milestone per theory-cloud-design phase.** Named with the `tcd-<capability>` convention.
- **One Linear milestone per cascading repo** (FaceTheory / autheory / theory-mcp-server) when the roadmap extends to those repos. Per the project execution model, these are separate milestones in the same project rather than issues inside one milestone.
- **One Linear issue per enumerated change item** within the theory-cloud-design milestone it belongs to.
- **Cascade milestones** (for FaceTheory, autheory, theory-mcp-server) are created with a summary of what they cover but are **owned by their repo's steward to populate with issues**. You create the milestone as a placeholder and coordination anchor; you do not enumerate their commits for them.
- **Cross-phase dependencies become Linear blocking relationships** between milestones.

## Issue description template (for theory-cloud-design issues)

```markdown
**Source**: Roadmap <roadmap name>, Milestone <tcd-milestone-short-name>
**Enumerated item**: #<N>

## Paths
<files or directories touched>

## Area
<brand-document / base-tokens / core-variant / mcp-variant / auth-variant / typed-exports / assets / docs / packaging>

## Brand-document section
<citation, or "none">

## Cascade
<FaceTheory / autheory / theory-mcp-server / none — may list multiple>

## Acceptance criterion
<one sentence: what makes this commit done>

## Validation commands
<`npm run check`, representative-consumer render, asset visual diff>

## Planned Conventional Commit subject
<type(scope): subject — use `feat!:` or `fix!:` if breaking>
```

## Cascade-milestone description template

For milestones in consumer repos (owned by their stewards):

```markdown
**Source**: Roadmap <roadmap name>, cascade from theory-cloud-design milestone <tcd-milestone-short-name>

## Scope
<what this repo needs to do as a result of the theory-cloud-design change>

## Pins required
- theory-cloud-design: <v0.Y.Z> (released by <tcd-milestone-short-name>)
- <FaceTheory: vX.Y.Z — if applicable>

## Owned by
<repo>'s steward

## Depends on
<upstream milestone(s) in the cascade>

## Success criteria
<observable conditions for the reskin / primitive update to be complete>
```

## Labels

Apply consistently:

- `tcd-brand-doc` — touches `theory_cloud_branding_package.md`
- `tcd-tokens` — touches token sets (any of base, Core, MCP, Auth)
- `tcd-core` — specifically affects the Core surface variant
- `tcd-mcp` — specifically affects the MCP surface variant
- `tcd-auth` — specifically affects the Auth surface variant
- `tcd-assets` — touches icon, wordmark, or derivative assets
- `tcd-typed-exports` — touches the public TypeScript surface consumers import
- `tcd-packaging` — touches `package.json`, release-please, or build scripts
- `tcd-docs` — documentation-only
- `tcd-breaking` — breaking change requiring explicit `!` in commit subject
- `cross-repo` — requires coordination with FaceTheory / autheory / theory-mcp-server
- `cascade:facetheory` / `cascade:autheory` / `cascade:theory-mcp-server` — specific cascade flags

## Priority and sequencing

Priority within a milestone follows the enumeration order. Across milestones, priority follows the cascade: theory-cloud-design first, then FaceTheory, then consumer apps. Cascade milestones in Linear reflect this via blocking relationships, not just priority.

## The draft artifact

```markdown
# Linear Project Update: <project name or existing design-system rollout project>

## Addition description
<from roadmap goal>

## Milestones (theory-cloud-design)

### Milestone: <tcd-short-name>
**Goal**: <one sentence>
**Phase**: <which phase from the roadmap>
**Depends on**: <prior milestones or none>

**Issues** (in order):
1. **<issue title>** — [`tcd-tokens`, `tcd-core`, `cascade:facetheory`]
   - Paths: ...
   - Area: ...
   - Brand section: ...
   - Acceptance: ...
   - Validation: ...
   - Commit subject: ...
2. ...

## Cascade milestones (placeholders — populated by downstream stewards)

### FaceTheory milestone: <name>
**Scope**: ...
**Pins required**: ...
**Owned by**: FaceTheory steward

### autheory milestone: <name>
**Scope**: ...
**Pins required**: ...
**Owned by**: autheory steward

### theory-mcp-server milestone: <name>
**Scope**: ...
**Pins required**: ...
**Owned by**: theory-mcp-server steward
```

## Persist

When Linear state exists, persist the Linear project ID and milestone IDs so `implement-milestone` can attach commits without rediscovering. That's the memory entry worth keeping from this skill run.

## Handoff

- Once Linear state exists, invoke `implement-milestone` with the first theory-cloud-design milestone. One milestone at a time.
- For cascade milestones, report to the user that downstream stewards should pick them up in their own repos. You do not implement cascade milestones yourself — those belong to the FaceTheory, autheory, and theory-mcp-server stewards.
- If the user wants to revise the roadmap first, go back to `plan-roadmap`.
