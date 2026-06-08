---
name: evolve-schema
description: Use for any controlled change to schema/unit.schema.json, schema/manifest.schema.json, or spec/knowledge-access-contract.md. Enforces cross-repo consumer-impact analysis and coordinated change discipline. These are KnowledgeTheory's only external contracts.
---

# Evolve a schema or contract

`schema/unit.schema.json`, `schema/manifest.schema.json`, and `spec/knowledge-access-contract.md` are KnowledgeTheory's external interface contracts. When they move, every consumer that binds to them has to move too. This skill is the discipline that keeps schema evolution from silently breaking consumers.

## When this skill runs

Invoke this skill for:

- Any change to fields in `schema/unit.schema.json` (add, remove, rename, re-type, change required/optional)
- Any change to fields in `schema/manifest.schema.json`
- Any change to the retrieval-semantics contract in `spec/knowledge-access-contract.md`
- Any change to the canonical identifier rules (`module`, `module_id`, `unit_id`, `unit_id` prefix rule)
- Any change to the `caller_context` shape or the authorization inputs specification

Do not edit any of the above files without running this skill. If you find yourself tempted to make "just a small change" to a schema outside this discipline, stop and run the skill. There is no small schema change.

## Preconditions

- **User has named the specific change.** "Evolve the schema" is not a valid input; "add an `ingested_at` timestamp to `unit.schema.json`" is.
- **`scope-need` has run** for the underlying feature, and the scoped-need document has flagged the schema impact. A schema change that didn't surface in scoping is a missed discovery — go back and run `scope-need`.
- **MCP tools healthy**, `memory_recent` first.

## The impact analysis

Before you touch a schema file, enumerate every consumer affected. KnowledgeTheory has three classes of consumers:

### 1. Primary frontend: `theory-mcp-server`

This is the privileged consumer. Schema changes to `unit.schema.json` or `manifest.schema.json` affect:

- `theory-mcp-server/internal/mcp/tools/query_knowledge.go` and friends — result marshaling and response shaping
- `theory-mcp-server/internal/mcp/tools/list_knowledge_bases.go` — manifest consumption
- `theory-mcp-server/internal/derivedstate/` — any state that caches KT responses
- Any telemetry or logging that references KT field names

Changes to `spec/knowledge-access-contract.md` affect:

- Caller-context construction logic across every MCP tool
- The SigV4 client that calls KT internal routes

### 2. Incumbent frontend: `pai-socket`

The WebSocket frontend is still in active use. Its retrieval semantics must keep working identically per `spec/knowledge-access-contract.md`. Schema changes affect pai-socket's result shaping; contract changes affect its caller-context construction.

If you cannot identify someone who knows pai-socket's current state and can coordinate the change there, you cannot ship a breaking schema change. Period.

### 3. Internal consumers inside KnowledgeTheory

- `internal/compiler/` and `internal/validator/` — the compiler must produce units that match the new schema, and the validator must reject units that don't
- `internal/parser/` — parsers that emit unit fields must populate the new shape
- `internal/manifest/` — manifest writer must produce the new manifest shape
- `internal/handlers/` and `internal/search/` — query handlers that marshal responses from the new shape
- `internal/models/` — TableTheory models that mirror the persisted unit shape
- `schema/` itself — the schemas under test
- `gov-infra/verifiers/` — verifiers that check schema presence or shape

## Additive vs breaking

- **Additive** — a new optional field, a new enum value (for fields where enums are open), a new top-level section in the manifest. Additive changes can usually ship with a staged rollout: compiler emits the new field, frontends gradually adopt it, everything keeps working while the adoption happens.
- **Breaking** — a removed field, a renamed field, a type change, a required-ness change (optional → required), a changed `unit_id` convention, a changed required field in `caller_context`. Breaking changes cannot ship without every consumer updating simultaneously.

Be honest about which you're making. A "rename" framed as additive is a breaking change wearing a disguise — both the old and new names cannot both be canonical for long, and the transition period is fragile.

## The coordinated-change sequence

### For additive changes

1. **Propose the schema change** to the user with consumer impact analysis attached.
2. **Update the schema file** with the new optional field.
3. **Update the spec** (`spec/knowledge-access-contract.md` if applicable) to describe the new field.
4. **Update the compiler / parser / models** to emit the new field. Old units without the field remain valid because the field is optional.
5. **Update the validator** to allow the new field and validate its shape when present.
6. **Notify consumers** through whatever coordination channel the user uses. Frontend stewards need to know the field is available for them to adopt.
7. **Run `publish-kb`** to produce a snapshot and manifest with the new field present.
8. **Run the gov-infra rubric** to confirm the change passes governance checks.
9. **Commit the schema change and its implementation in the same commit.** A schema-only commit that doesn't move the implementation forward creates a window where the schema promises something the compiler doesn't deliver.

### For breaking changes

Breaking changes require more coordination and more time. The sequence:

1. **Stop.** Before anything else, name every consumer and identify the steward who will update each one. If you cannot name them, the change is not ready.
2. **Propose the change** with a complete migration plan: what old state looks like, what new state looks like, how consumers migrate, and whether a dual-shape transition period is feasible.
3. **Coordinate with consumer stewards** before any code lands. The breaking change is not a KnowledgeTheory-only roadmap; it is a coordinated cross-repo roadmap.
4. **If a dual-shape transition is feasible** — e.g. the manifest can contain both old and new field names for one release cycle — do that. Ship the dual-shape version first, confirm every consumer has adopted the new shape, then ship the removal of the old shape.
5. **If dual-shape is not feasible**, the change must ship as a synchronized update across KnowledgeTheory and every consumer simultaneously. This is a real coordination event with a declared window.
6. **Lab-first always.** The breaking change goes to `lab` first, every consumer's `lab` state adopts it, and only after every consumer is verified in `lab` does any promotion to `live` happen.

## Refusal cases

- **"Just rename the field, the consumers will catch up."** No. Renames are breaking changes. Consumers do not catch up automatically.
- **"Make the new field required immediately, we can backfill later."** No. Making a field required in a schema while published state doesn't have it makes every old unit invalid retroactively. Even if you plan to republish, there is a window where the schema and the state disagree.
- **"Skip the spec update, the schema file is the truth."** No. The spec is the coordination artifact that consumers' maintainers actually read. Schema without spec is drift.
- **"Ship the schema now, the implementation in a follow-up commit."** No. Schema and implementation ride together.
- **"This is just for lab, we can be loose."** No. Schema changes in lab are schema changes. Lab feeds into the adoption decisions that gate the promotion to live — being loose in lab produces a broken promotion later.

## Output

```markdown
## Schema evolution

### Files touched
- <schema or spec file paths>

### Change classification
<additive / breaking>

### Fields changed
<enumerated — added, removed, renamed, retyped, required-ness changed>

### Consumer impact analysis
- **theory-mcp-server**: <affected files and coordination status>
- **pai-socket**: <affected files and coordination status>
- **Internal KnowledgeTheory**: <affected packages>
- **Downstream telemetry / logs**: <affected>

### Migration plan
<for breaking: the specific steps from old-state to new-state>

### Coordination record
<who has been notified, who has acknowledged>

### Lab rollout plan
<how this will be validated in lab before any promotion consideration>
```

## Persist

Schema evolution is where the most expensive-to-unwind drift comes from. Memory entries from this skill are high-signal: the change classification, the consumer list, the coordination status. Even routine additive changes deserve a terse entry, because the history of why a schema is the shape it is lives in these notes.

## Handoff

- Schema evolution is a discipline invoked *inside* the normal pipeline. After running this skill, you return to wherever you came from — `enumerate-changes` folding the schema work into the enumeration, `implement-milestone` executing the schema commit with the discipline already applied.
- If the impact analysis reveals a cross-repo coordination requirement that has not been resolved, pause and surface it to the user. Do not land a breaking schema change on the hope that consumers will catch up.
