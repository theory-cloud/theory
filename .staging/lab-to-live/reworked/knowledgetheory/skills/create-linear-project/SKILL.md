---
name: create-linear-project
description: Use after plan-roadmap is approved. Translates a roadmap document into a Linear project shape with milestones and tasks. Draft form the user can paste into Linear, or direct API calls if a Linear MCP/CLI is available.
---

# Create a Linear project

This skill turns an approved roadmap into Linear state: a project, milestones, and tasks. It does not execute implementation — that is `implement-milestone`'s job.

## Check what tools you have

Before you generate anything, check whether you have access to Linear programmatically:

1. List the MCP tools available on your endpoint. If a Linear MCP integration is wired up, prefer direct API calls over drafted text — the user will thank you.
2. If no Linear MCP tool is available, check whether a Linear CLI is present on the local machine or referenced in `AGENTS.md`.
3. If neither, your output is a well-shaped markdown draft the user can paste into Linear's bulk-import or copy issue by issue.

Surface which mode you're in at the start of the skill run so the user knows what to expect.

## The mapping

The translation from roadmap to Linear state is deterministic:

- **One Linear project per roadmap.** Project name matches the roadmap's goal line, short form.
- **One Linear milestone per roadmap milestone.** Not per phase — a phase may contain multiple milestones. The milestone name is the short-name from the roadmap. Its description is the one-sentence goal.
- **One Linear issue per enumerated change item.** The issue title is the imperative title from the enumerated list. The issue description is the enumerated item metadata, formatted for Linear.
- **Issue ordering inside a milestone matches the enumeration order.** Fixture items come before implementation items, implementation items follow the parity rule (Go → TS → Py), surface and doc items come last within the milestone.
- **Cross-phase dependencies become Linear issue relationships.** Where a milestone depends on another milestone, express it as a blocking relationship so the UI surfaces it.

## Issue description template

Each issue's description should include:

```markdown
**Source**: Roadmap <roadmap name>, Milestone <milestone-short-name>
**Enumerated item**: #<N> from <enumerated-changes doc reference>

## Paths
<files or directories touched>

## Planes
<ingestion / compilation / query / multi / none>

## Schema impact
<none / unit-schema / manifest-schema / access-contract-spec>

## Frontend served
<theory-mcp-server / pai-socket / operator>

## Acceptance criterion
<one sentence: what makes this commit done>

## Validation command
<the command that proves acceptance — usually `bash gov-infra/verifiers/gov-verify-rubric.sh` or a stage-scoped operator command>

## Planned Conventional Commit subject
<type(scope): subject>
```

## Labels

Apply consistently:

- `kt-schema` — touches `schema/*.json` or `spec/knowledge-access-contract.md`
- `kt-ingest` — touches ingestion plane (`internal/ingest/`, connectors)
- `kt-compile` — touches compilation plane (`internal/compiler/`, `internal/validator/`, `internal/parser/`)
- `kt-publish` — touches publish pipeline (`internal/publish/`, `internal/worker/`, `internal/manifest/`)
- `kt-query` — touches query plane (`internal/handlers/`, `internal/search/`, `cmd/api/`)
- `kt-cdk` — touches `cdk/` or `app-theory/app.json`
- `kt-ssm` — touches published SSM parameters
- `kt-ops` — touches `Makefile` targets, `scripts/`, or runbooks
- `kt-gov` — touches `gov-infra/`
- `cross-repo` — requires coordination with another steward (theory-mcp-server, pai-socket, AppTheory, TableTheory)
- `schema-first` — this item must land before any dependent implementation items in the same milestone
- `stage:lab` / `stage:live` — scope of the deployment impact

Labels are queryable state, not decoration.

## Priority and sequencing

Priority within a milestone follows the enumeration order (schema-first, then plane dependencies). Across milestones, priority follows phase order from the roadmap. If the user wants to reprioritize, they are welcome to do so in Linear after the project is created — but you do not invent a different order here.

## The draft artifact

Whether you execute against Linear or produce a draft for the user, the structured output is the same:

```markdown
# Linear Project: <project name>

## Project description
<from roadmap goal>

## Milestones

### Milestone: <short-name>
**Goal**: <one sentence>
**Phase**: <which phase from the roadmap>
**Depends on**: <prior milestones or none>

**Issues** (in order):
1. **<issue title>** — [`kt-schema`, `schema-first`, `stage:lab`]
   - Paths: ...
   - Acceptance: ...
   - Validation: ...
   - Commit subject: ...
2. ...

### Milestone: <next short-name>
...
```

Present this to the user, confirm it matches the roadmap, and only then either call Linear API tools or hand the draft over for manual paste.

## Persist

Once Linear state exists, persist the Linear project ID and milestone IDs so `implement-milestone` can attach commits to issues and close tasks as they land. That's the memory entry worth keeping from this skill run — not the full project structure.

## Handoff

- Once the Linear project exists (either via API or via user paste), invoke `implement-milestone` with the first milestone from Phase 1. One milestone at a time — do not try to implement the whole project in one pass.
- If the user wants to revise the roadmap before creating Linear state, go back to `plan-roadmap`, do not edit the roadmap silently inside this skill.
