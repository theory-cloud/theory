---
name: enumerate-changes
description: Use after scope-need. Takes an approved scoped-need document and produces a flat, ordered list of discrete changes across KnowledgeTheory required to deliver it. Each change is scoped to be a single commit.
---

# Enumerate changes

A scoped need describes *what* is being delivered. An enumerated change list describes *what must move in the repo*. This skill is the transformation.

## Input required

An approved scoped-need document from `scope-need`. If you don't have one, stop and run scoping first.

Load relevant prior context with `memory_recent`. If `query_knowledge` is available, pull the canonical docs for the subsystems the change will touch.

## The walk

Walk the scoped need against every surface of KnowledgeTheory that could plausibly be affected:

1. **Schemas** (`schema/unit.schema.json`, `schema/manifest.schema.json`) — the interface contracts. A schema change is always the first item in the enumeration and always requires the `evolve-schema` discipline during implementation.
2. **Specs** (`spec/knowledge-access-contract.md`, `spec/module-publishing-system.md`, others) — when a contract moves, the spec moves *in the same commit* as the behavior.
3. **Ingestion connectors** (`internal/ingest/`, related packages) — when a new source kind is added or an existing connector's output shape changes.
4. **Compiler** (`internal/compiler/`, `internal/validator/`, `internal/parser/`) — when compilation logic, validation rules, or unit shape changes.
5. **Publish pipeline** (`internal/publish/`, `internal/worker/`, `internal/manifest/`, `internal/vectors/`, `internal/relations/`) — when the pipeline from snapshot to persisted state changes.
6. **Query API** (`internal/handlers/`, `internal/search/`, `internal/live/`, `cmd/api/`) — when retrieval behavior or the query contract changes.
7. **TableTheory models** (`internal/models/`) — when persisted shape changes. Use TableTheory tags, not raw dynamodbattribute.
8. **AppTheory deploy contract** (`app-theory/app.json`) — when deployment-visible configuration moves.
9. **CDK** (`cdk/`) — when infrastructure changes. Remember the blessed deploy path is `theory app up`, not raw CDK commands.
10. **SSM discovery** — when new parameters are published or existing parameter paths change. This is a breaking change to consumers; treat it as such.
11. **Operator workflows** (`Makefile` targets, `scripts/`) — when operator-facing commands change.
12. **gov-infra** (`gov-infra/verifiers/`, `gov-infra/rubric`, `gov-infra/evidence/`) — when governance checks need to track the new surface.
13. **`ktc` compiler CLI** (`cmd/ktc/`) — when offline compilation tooling changes.
14. **Worker entry points** (`cmd/worker/`) — when background processing changes.
15. **Docs and runbooks** (`README.md`, `runbooks/`, `PROPOSAL-v0.2.md`, `ROADMAP-v0.2.md`, `IMPLEMENTATION_PLAN-v0.2.md`) — when documented behavior changes.

A change that touches none of these isn't really a change. A change that touches several is fine — they can be one commit if they share intent.

## The ordering rules

Unlike AppTheory's fixture-first parity rule, KnowledgeTheory's enumeration ordering is driven by **plane dependencies and schema-first discipline**:

1. **Schema changes come first.** If `unit.schema.json` or `manifest.schema.json` is touched, that item is #1 in the enumeration and triggers `evolve-schema` during implementation.
2. **Spec updates ride with their behavior change.** A change to `spec/knowledge-access-contract.md` and the code that implements the new contract are the same commit.
3. **Compiler before publish before query.** If a change moves through all three planes, the compiler work lands first (so validation fails closed against the new shape), then the publish pipeline, then the query API that exposes it.
4. **Validator changes go with the shape they validate.** A loosened validator without a corresponding schema change is almost always wrong.
5. **CDK/SSM/deploy changes that expose new runtime state come before the code that depends on them.** You do not land code that reads an SSM parameter that doesn't exist yet.
6. **Operator workflow updates come after the runtime they orchestrate is in place.** A new `make` target that calls a not-yet-implemented handler is a broken target.
7. **Docs and runbooks ride with their behavior change** — not before, not after.

## The single-commit rule

Each enumerated item fits in one commit:

- One logical intent per commit
- `bash gov-infra/verifiers/gov-verify-rubric.sh` passes at the end of the commit (the rubric is the gate)
- No commit depends on a later item to compile or pass checks

If an item can't fit in one commit, split it.

## Output format

```markdown
### N. <imperative title>

- **Paths**: <files or directories touched>
- **Planes**: <ingestion / compilation / query / multi / none>
- **Schema impact**: <none / unit-schema / manifest-schema / access-contract-spec>
- **Acceptance**: <one sentence: what makes this commit done>
- **Validation**: <minimum command that proves it — `go test ./...`, `bash gov-infra/verifiers/gov-verify-rubric.sh`, stage-scoped operator commands>
- **Conventional Commit subject**: `<type(scope): subject>`
```

## Self-check before handing off

- [ ] Schema changes are item #1 and flagged for `evolve-schema`
- [ ] Every behavior change that touches a spec also updates the spec in the same commit
- [ ] Compiler items land before publish items land before query items (when all three are present)
- [ ] Every SSM parameter change has the consumers who read it identified
- [ ] No item requires a future item to compile or pass the rubric
- [ ] Operator workflow changes are listed *after* the runtime they orchestrate
- [ ] Cross-repo items are flagged as cross-repo rather than enumerated in this list
- [ ] The full list satisfies the scoped need's success criteria

## Persist

Append only if the enumeration surfaces something unusual worth remembering — a hidden coupling, a primitive doing more than one job, a surface that doesn't fit the pattern cleanly. Routine enumerations aren't memory material.

## Handoff

Invoke `plan-roadmap`. The next skill will sequence this flat list into phases, identify dependencies, and shape it into milestones.
