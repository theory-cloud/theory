---
name: implement-milestone
description: Use to execute a single GovTheory milestone (an H-milestone from gov-roadmap.md, an app-integration M-milestone, or a Linear-tracked GovTheory project milestone) end to end. Walks subtasks in dependency order, validates against acceptance criteria, accumulates CHANGELOG entries, and (if the milestone bounds a release) handles the Mode 2 publish.
---

# Implement a milestone

GovTheory's roadmap defines H0–H6 plus the app-integration M0–M5 work orders. This skill is the operational walker for any one milestone. It covers Mode 1 (commits to templates / prompts / overlays / schemas / planning / infra) and, when the milestone bounds a release, Mode 2 (pack publish).

## Inputs

- The milestone identifier (`H<N>`, `M<N>` from app-integration, or a Linear milestone ID)
- The milestone's deliverables and acceptance criteria
- Prior memory entries about the milestone or its prerequisites
- Existing pack state (CHANGELOG `[Unreleased]`, recent commits, current pack version)
- Linear tracking state if applicable

## Pre-flight

1. **Recall context** with `memory_recent`. What's the most recent state? Are there deferred follow-ups from the prior milestone?
2. **Verify prerequisites.** Earlier H-milestones complete? Required CHANGELOG entries from prior milestones present? Required cross-tenant consultations resolved?
3. **Check shipped state.** What's already committed for this milestone? A milestone with partial existing work resumes; do not restart.
4. **Confirm with the user.** "Implementing `<milestone>` — prerequisites satisfied per `<verification>`; resuming from `<state>`; expected CHANGELOG section will batch entries for `<deltas>`. Release planned at end? `<yes/no>`." A milestone is a deliberate undertaking; user awareness up front prevents surprise.

## The milestone walk

For each subtask in dependency order:

1. **Open the subtask.** Mark the corresponding Linear task in progress if tracked.
2. **Author or revise.** Per the relevant work shape (template, prompt, overlay, schema, pin, planning doc, infra). Each is a focused commit.
3. **Validate.**
   - **Token grep** — `rg -n "\\{\\{[A-Z0-9_]+\\}\\}" templates prompts docs/planning` — confirm new tokens declared, no orphan tokens.
   - **Doc-link resolution** — relative links in `docs/planning/` resolve.
   - **Schema validity** — JSON parse + structural sanity for any schema changes.
   - **No-licensed-text scan** — visual review of overlay / template diffs for embedded standards prose.
   - **Determinism scan** — visual review for stable ordering, IDs, thresholds; no `latest` versions; no "approximately" or "where appropriate" wording.
4. **CHANGELOG entry.** Add to `[Unreleased]` if the change affects generated outputs. Format: what changed, why (false-green / false-red analysis), compatibility (breaking / additive).
5. **Commit.** Conventional Commits message; descriptive subject; PR via `gh` when warranted.
6. **Close the Linear task** if tracked. Outcome note + commit SHA reference.
7. **Memory-append** non-obvious decisions (especially false-green / false-red trade-offs).

## Milestone-specific shapes

### H0 — Freeze the Base Genome

- Versioned rubric + changelog
- Completeness/anti-drift gates (toolchain pins, config validity, no diluted thresholds)
- Evidence-as-code mapping (every rubric ID → verifier → evidence)
- Threat ↔ control parity
- Add missing required template surfaces (e.g., threat model)

Acceptance: pack genome reflects vetted standard; CHANGELOG batched entry for `[Unreleased]`.

### H1 — Prompt Hardening

- Convert prompt drafts into pack-owned prompts
- Prompt-injection resistance: untrusted-input treatment; no client-supplied system prompt; structured outputs only

Acceptance: every `prompts/*.prompt.md` declares safety invariants and write scope.

### H1.5 — Output Layout `gov-infra/`

- All target-repo outputs under `gov-infra/`
- Standardize layout (planning, verifiers, evidence, prompts, pack.json)

Acceptance: a fresh `gov.init` produces no files outside `gov-infra/`.

### H1.6 — Deterministic Rubric Verifier

- Single verifier entrypoint (`gov-infra/verifiers/gov-verify-rubric.sh` template)
- Defined verifier contract (reads planning state, runs checks, writes evidence, fixed JSON report)
- Schema versioning (`gov-rubric-report.schema.json`)
- Pack manifest includes verifier digest

Acceptance: `gov.validate` can be implemented by executing only the entrypoint and parsing the report.

### H1.7 — Sign-Time Audit

- Pack-owned audit prompt for `gov.sign`
- Fixed audit report schema (`gov-sign-audit-report.schema.json`)
- Controls↔threat mapping consistency, anti-dilution invariants, additive-only enforcement
- `gov.validate` deterministic preflight; audit runs in `gov.sign`

Acceptance: signing is the terminal verification step; no "trust me" signatures.

### H2 — Domain Overlays

- Define overlay rules; seed PCI + custom + (in progress) react
- KB references only (no licensed text)
- `consult-knowledgetheory-steward` for KB references

Acceptance: overlays additive-only; KB references resolve; verifiers / evidence paths defined.

### H3 — Release to S3 (implemented per roadmap status)

Mode 2 territory primarily. Validate the publish flow holds: versioned bundle + signed manifest → S3 lab → lab validation → S3 live.

### H4 — `gov.init` Review/Repair

- Pack-owned review checklist + repair-loop prompt assets
- Deterministic invariants for review (threat-control parity, no duplicate verifier names, all referenced verifier paths exist, `pack.json` matches loaded pack metadata)
- Forbid writing outside `gov-infra/`

Acceptance: generated outputs self-consistent on first run, or `gov.init` blocks with precise reason.

### H5 — Prompt Generation Assets

- `gov.prompt.baseline` — derivable from `gov-infra/**` only
- `gov.prompt.iterate` — may require repo context; never writes outside `gov-infra/prompts/`
- Stable JSON output format

Acceptance: prompts produced are safe, deterministic, and scoped.

### H6 — Change Control

- CHANGELOG entry required for every output-affecting prompt / template change
- Propose / implement / adopt workflow for new gates

Acceptance: change-control discipline visible in CHANGELOG and commit history.

### App-integration M0–M5

Per the work orders in `docs/planning/app-integration/`:

- M0 — pin source-of-truth (`pins.json`) and policy (already shipped)
- M1 — pack manifest includes pins under signature
- M2 — `migrate-lift` includes Destination (pinned) section
- M3 — `gov.app.init` action surface (instructions only, no code)
- M4 — `gov.app.up/down` support via `app-theory/app.json`
- M5 — End-to-end hardening + docs

Each has its own deliverables and acceptance per the work-order doc.

## Acceptance and reporting

After all subtasks land:

1. **Run all relevant validators** — token grep, doc-link, schema, no-licensed-text, determinism. Visual sweep for refusal-list patterns.
2. **CHANGELOG `[Unreleased]` review.** All output-affecting commits have entries.
3. **Verify acceptance criteria.** Every named criterion gets a yes / partial / deferred status.
4. **Author a milestone outcome note** (often as a CHANGELOG section at release time, or as a brief commit-message summary if no release follows).
5. **Update Linear** if tracked.
6. **Memory-append.** Milestone, deltas, deferred follow-ups.

If the milestone bounds a release:

7. **Bump pack version.** Move `[Unreleased]` to a versioned section.
8. **Lab publish.** `npm run` (or equivalent) writes the bundle + signed manifest to lab S3. Verify SSM `/gov/lab/packVersion` updated.
9. **Lab validate.** Run a `gov.*` action through `theory-cli` / `theory-mcp` / `pai-socket` against a non-production target. Confirm outputs.
10. **Live promote.** When lab validation passes; same versioned bundle to live S3; SSM `/gov/live/packVersion` updated.
11. **Memory-append the release event.**

## Red flags during execution

- **A subtask that wants to skip validation** → refuse
- **A subtask that wants to inline licensed text** → refuse
- **A subtask that wants to loosen a threshold or drop a COM check** → refuse
- **A subtask that wants to edit a versioned schema in place** → refuse; redirect to `vN+1`
- **A subtask that wants to bypass `AGENTS.md` rules** → refuse
- **A release that wants to skip lab validation** → refuse
- **A release that wants to republish under a previously-released version** → refuse
- **A release that wants to ship without lab→live promotion** → refuse
- **Bundling Mode 1 authoring with Mode 2 release in a single implicit flow** → split

## Completing the milestone

- Hand back to user with milestone status, validation outcome, release status (if applicable), next-milestone prerequisites.
- If the milestone surfaces work for a different milestone, name it explicitly as deferred follow-up.
