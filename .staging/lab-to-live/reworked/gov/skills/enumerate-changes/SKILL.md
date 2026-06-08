---
name: enumerate-changes
description: Use after scope-need is approved. Takes the scoped-need document and produces a flat, ordered list of focused commits — templates, prompts, overlays, schemas, planning docs, infra — each scoped to a single change. Aware of CHANGELOG, pack-version, and propose / implement / adopt cadence.
---

# Enumerate changes

Use after `scope-need` produces a clean scoped-need doc. Turns the scope into an ordered list of items, each small enough for one focused commit.

## Your posture

Disciplined enumeration. Each item:

- **Focused** — one concept per commit (one template, one prompt, one overlay file, one schema, one planning-doc revision)
- **Reversible** — can be rolled back cleanly
- **Validated** — has specific lightweight checks (token grep, doc-link resolution, schema parse, fixture sanity)
- **Genome-clean** — does not regress determinism, anti-drift, or no-licensed-text invariants
- **CHANGELOG-aware** — if the item affects generated outputs, the CHANGELOG entry is part of the item or its successor

## Inputs

- The scoped-need document
- The propose-phase analysis (false-green / false-red, genome impact)
- The roadmap H-milestone the work belongs to (or the revision target if it's a roadmap change)
- Any prior `memory_recent` entries about adjacent work

## Enumeration order — typical work shapes

### For a new template (or revising one)

1. **Template authoring or revision** — focused commit. New tokens declared; deterministic ordering / IDs / thresholds; no `latest`.
2. **Token documentation update** — `gov-design.md` if new tokens are introduced.
3. **CHANGELOG entry** — same commit or successor; describe what changed and why (false-green / false-red analysis).
4. **Prompt updates if needed** — when the template's consumer prompt references new tokens or new output paths.
5. **Lightweight validation** — `rg -n "\\{\\{[A-Z0-9_]+\\}\\}"` to confirm tokens; doc-link resolution.
6. **Memory entry** — non-obvious decisions.

### For a new or revised prompt

1. **Prompt authoring or revision** — focused commit. Safety invariants stated explicitly; write scope declared (`gov-infra/` or `app-theory/`); structured outputs only; BLOCKED/FAIL paths preserved.
2. **CHANGELOG entry** — what changed; false-green / false-red implications.
3. **`gov-design.md` update** — if action contract semantics shift (new action ID, new write scope, new input set).
4. **Lightweight validation** — token grep, doc-link resolution.
5. **Memory entry** — prompt rationale, especially prompt-injection scenarios.

### For a new domain overlay (or revising one)

1. **`domain.json` authoring or revision** — `schemaVersion`, `id`, `displayName`, `kbEnv`, `constraints` (`additiveOnly`: true, `noLicensedText`: true), `adds.rubricCategories`.
2. **Overlay README** — human-readable scope, required KB / env vars, must-add gates.
3. **Verifier contract entries** — every overlay-introduced requirement maps to a single verifier + evidence path under `gov-infra/evidence/`.
4. **`consult-knowledgetheory-steward`** — for any new KB references, dispatch consultation. Not a commit; a named prerequisite.
5. **CHANGELOG entry** — overlay addition or revision.
6. **Token / doc-link validation.**
7. **Memory entry** — overlay rationale and KT coordination outcome.

### For a schema bump

1. **New schema file** — `templates/schemas/<name>.vN.schema.json` (do not edit prior version when shape changes).
2. **Example artifacts validating against new schema** if helpful for consumers.
3. **Consumer updates** — verifier templates, audit prompts, parser tooling that consume the schema.
4. **Migration plan** — how existing-version artifacts are reclassified or regenerated.
5. **CHANGELOG entry** — schema delta.
6. **Memory entry** — schema decision and migration plan.

### For a pin update

1. **`pins.json` revision** — module path, version, KT-safe docs entrypoints. Confirm upstream version is real and stable.
2. **Manifest publish-flow check** — `infra/scripts/publish-pack.ts` reads pins; verify the pack manifest will copy the new pins under the stable key.
3. **Template / prompt updates** — `gov.app.migrate.lift`, `gov.app.init`, and anything else that references `pack.pins` content.
4. **CHANGELOG entry** — pin bump rationale and compatibility implications.
5. **Memory entry**.

### For a planning-doc revision (gov-design / gov-genome / gov-roadmap / CHANGELOG / app-integration M*)

1. **Doc revision** — focused commit per doc.
2. **Internal-link resolution check** — relative links resolve.
3. **Memory entry** — only if the revision encodes a non-obvious decision.

### For an infra change

1. **CDK code revision** — `infra/lib/`, `infra/scripts/`, etc.
2. **`cdk.json` / `tsconfig.json` / `package.json`** updates if needed.
3. **Lab deploy + validate** before live (Mode 2 territory; coordinate with the release flow).
4. **`infra/README.md` update** if operational steps change.
5. **CHANGELOG entry** if it affects pack manifest or publish behavior.
6. **Memory entry**.

### For a pack release (Mode 2)

The `implement-milestone` skill walks this for milestone-bounded releases; for ad-hoc releases:

1. **Confirm Mode 1 work merged** — all intended deltas in CHANGELOG `[Unreleased]`.
2. **Bump pack version** — move `[Unreleased]` to a versioned section.
3. **Lightweight contract validation** — token grep, doc-link, schema parse.
4. **Lab publish** — `npm run` equivalent; verify `SSM /gov/lab/packVersion`.
5. **Lab validate** against a target repo via `theory-cli` / `theory-mcp` / `pai-socket`.
6. **Live promote** — same versioned bundle to `live` bucket; `SSM /gov/live/packVersion`.
7. **Memory entry** — release event with deltas + lab-validation outcome.

## What each enumerated change includes

For each item:

- **Subject** — Conventional Commits or descriptive
- **Branch** — repo convention
- **Files touched** — paths
- **Dependencies** — earlier items this assumes
- **Validation** — token grep, doc-link, schema parse, fixture sanity, etc.
- **Genome / determinism / anti-drift / no-licensed-text checks** — name explicitly which apply
- **CHANGELOG entry** — required if affects generated outputs; named here
- **Pack-version implication** — does this commit ship in the next version, or wait for batched release?
- **Cross-repo coordination** — flag KT consultation, consumer-side coordination through user
- **Blast radius** — what breaks if this commit rolls back mid-sequence (especially for schema / pin changes)

## Red flags during enumeration

- **An item that loosens a threshold or drops a COM check** → refuse; redirect via scope-need to a different shape
- **An item that adds licensed text inline** → refuse; redirect to KB reference via overlay
- **An item that introduces non-determinism** (free-form output, optional ordering, content-hash IDs) → refuse
- **An item that edits a versioned schema in place** → refuse if shape changes; redirect to `vN+1`
- **An item that bundles pack-content authoring with pack release** → split. Mode 1 commits land first; Mode 2 release follows with version bump.
- **An item that depends on aspirational planning prose** that may not be implemented → verify shipped state first
- **An item that crosses into `theory-cli` / `theory-mcp` / `pai-socket` / `pai` / target repos / KT / framework repos / PreTheory / Pay Theory** → refuse cross-repo edits; route through user
- **An item without a CHANGELOG entry** when it affects generated outputs → require the entry
- **More than 7–8 items** → wants phasing; suggest `plan-roadmap`

## Output: the enumerated-changes document

Produce a numbered list with the structure above. At the end:

- **Total commit count**
- **CHANGELOG entries required** — list explicitly
- **Pack-version implication** — single batched release, multiple releases, or no release until further work
- **Cross-tenant / cross-team coordination** — KT consultations, consumer-side surfaces
- **Pre-work** — KT verification, target-repo validation, scope confirmation

## After enumeration

- Save a memory entry only if the work is large or the enumeration decisions were non-obvious
- Suggest `plan-roadmap` if phasing is needed
- Suggest `create-linear-project` only when scope warrants its own surface
- If the work corresponds to a roadmap H-milestone, suggest `implement-milestone` as the execution path
- If a release follows the enumeration, name the Mode 2 release step explicitly as a successor
