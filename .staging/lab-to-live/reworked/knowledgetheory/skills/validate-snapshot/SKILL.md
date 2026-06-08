---
name: validate-snapshot
description: Use to inspect an ingested snapshot for compilation issues before publish, or to diagnose a compilation failure after the fact. Focuses on the compilation plane — validator output, unit shape, schema compliance, provenance, and relation integrity.
---

# Validate a snapshot

Snapshots are the seam between the ingestion plane and the compilation plane. They are immutable, content-addressed, and the compiler's only input. This skill is the inspection flow for a snapshot that is failing to compile, or that you want to sanity-check before triggering a publish.

## Preconditions

- **A snapshot reference.** Either a specific snapshot ID/hash, or "the most recent snapshot for module X in stage Y." Do not run this skill on "a snapshot" generally — it operates on one at a time.
- **MCP tools healthy**, `memory_recent` first.
- **Read access to the stage's sources bucket and, if needed, the publish worker's execution logs.**

## The four things you check

A snapshot can fail compilation (or almost-fail and produce bad units) in one of four ways. Check each in order:

### 1. Schema compliance

Every unit produced from a snapshot must conform to `schema/unit.schema.json`. Failures here surface as validator errors in the compiler's output.

Common failures:

- **Missing required field** — `unit_id`, `module`, `module_id`, `title`, `summary`, `content`, `source_key`, `source_file`, `source_hash` are required. A parser that drops any of these is buggy.
- **`unit_id` prefix violation** — every `unit_id` must start with `module` + `.`. `apptheory.concept.cdk_constructs` is legal; `cdk_constructs.apptheory` is not. This rule comes from `spec/knowledge-access-contract.md` and is load-bearing for how consumers derive module from id.
- **Wrong type** — a field declared `keyword` received a list, or vice versa.
- **Excess fields the schema doesn't allow** — some schemas are closed; check whether the schema permits extensions.

Run the compiler locally with `ktc` if possible and inspect its output. The compiler's failure messages are your first source of truth.

### 2. Deterministic ID and duplicate detection

`unit_id` is deterministic — the same source produces the same id every time. Failures:

- **Duplicate `unit_id`** — two different pieces of source content hashed to the same id. Usually a parser bug (not hashing enough of the source) or genuine duplication in the source material.
- **Non-deterministic `unit_id`** — the same source, compiled twice, produces different ids. This almost always means the id generator is using something non-stable (timestamp, random, filesystem order). Catastrophic for immutability guarantees.
- **Collisions across modules** — a `unit_id` in module `apptheory` that also appears in module `tabletheory`. Shouldn't happen given the prefix rule, but worth verifying.

### 3. Relation integrity

Units can reference other units via `related[]`. The compiler should validate that every reference resolves within the compilation batch, or at least within known-published state:

- **Dangling `related[]` references** — a unit refers to a `unit_id` that doesn't exist in the snapshot or in the previously-published manifest.
- **Broken cross-module relations** — a unit in `apptheory` references a unit in `tabletheory` that has since been republished under a different id. This is usually a symptom of a missed version bump elsewhere.
- **Circular or self-referential relations** — depending on how `expand_graph` works in retrieval, these can produce infinite loops or just unhelpful query results.

### 4. Provenance

Every unit must carry enough provenance to trace back to its source material:

- `source_key` — where the source bundle came from (bucket key, git ref, etc.)
- `source_file` — the specific file within the source
- `source_hash` — the content hash of that file

Failures:

- **Missing provenance fields** — a parser that forgot to propagate source metadata.
- **Stale provenance** — a `source_hash` that doesn't match the actual content in the snapshot.
- **Wrong `source_key`** — a unit whose provenance points at a different KB's sources bucket, indicating cross-module source contamination.

## Output

```markdown
## Snapshot validation

### Snapshot
<ID / hash / module / stage>

### Schema compliance
<outcome, with specific validator failures listed>

### ID integrity
<outcome — duplicates, non-determinism, collisions>

### Relation integrity
<outcome — dangling refs, broken cross-module, circularity>

### Provenance
<outcome — missing fields, stale hashes, wrong keys>

### Overall verdict
<publishable / not-publishable-fix-source / not-publishable-fix-parser / not-publishable-fix-compiler>

### Root cause
<where in the pipeline the problem originates — source material, connector, parser, validator, compiler core>
```

## When validation exposes a compiler or validator bug

Tempting refusals live here:

- **"The validator is being too strict, let's relax it."** No. The validator's strictness is the only mechanism preventing bad content from reaching consumers. If the validator is wrong about what's valid, the schema is what defines "valid," and the correct change is to the schema — coordinated through `evolve-schema`.
- **"The duplicate unit_id is acceptable; we'll just keep the first one."** No. Deterministic ids mean duplicates are a source-material bug, not a retrieval inconvenience.
- **"Fix the provenance in DynamoDB directly."** No. Immutability forbids this. Fix the source or the parser and republish.

The correct fix is almost always upstream of the snapshot, not downstream of it.

## Persist

Append only when the validation surfaces a recurring pattern or a non-obvious root cause worth remembering — a specific source-shape that reliably confuses the parser, a validator error whose diagnostic path is hard to discover. Routine "parser bug, fixed it" findings aren't memory material.

## Handoff

- If the snapshot is publishable, invoke `publish-kb` (if the user agrees) or simply report readiness.
- If the root cause is in the source material (bad input), report it to the user and whoever owns the source registry entry.
- If the root cause is in a connector or parser, invoke `scope-need` — fixing it is a code change, not an operator action.
- If the root cause is in the compiler core or validator, the fix is a coordinated change that probably touches `evolve-schema` — surface that to the user.
