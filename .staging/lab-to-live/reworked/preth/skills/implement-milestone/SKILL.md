---
name: implement-milestone
description: Use to execute a single PreTheory roadmap milestone (M0–M14) end to end. Walks the milestone's subtasks in dependency order, validates against acceptance criteria, authors the milestone acceptance report, and closes Linear tasks as work lands. Runs one milestone at a time.
---

# Implement a milestone

PreTheory's roadmap defines 14 milestones across 7 phases (`planning/theoryjepa_model_training_roadmap.md`). This skill is the operational walker for any one milestone. It covers Mode 1 (commits to schemas, tools, planning) and Mode 2 (collector runs, baselines, experiments, acceptance reports) — most milestones touch both.

## Inputs

- The milestone identifier (M0, M1, M1.1, M2, …, M14)
- The roadmap entry for that milestone (goal, subtasks, acceptance criteria, risks)
- Prior memory entries (`memory_recent`) about the milestone or its prerequisites
- Any existing milestone artifacts already shipped (read `planning/<milestone-dir>/`)
- Linear project state for the milestone

## Pre-flight

1. **Recall context** with `memory_recent`. What's the most recent state? Are there deferred follow-ups from the prior milestone?
2. **Verify prerequisites.** Earlier milestones complete? Required gates passed? Source-family approvals in place for any new sources this milestone consumes?
3. **Check shipped state.** What's already committed in `planning/<milestone-dir>/`, `manifests/`, `schemas/`, `tools/`? A milestone with partial existing work resumes from where it stopped, not from scratch.
4. **Confirm with the user.** "Implementing M<N> — prerequisites satisfied per <verification>; resuming from <state>; expected duration <estimate>." A milestone is a meaningful undertaking; user awareness up front prevents surprise.

## The milestone walk

For each subtask in the milestone, in dependency order:

1. **Open the subtask.** Mark the corresponding Linear task in progress.
2. **Author or execute.** 
   - **Mode 1 subtask** — schema addition, validator extension, planning-doc revision, governance artifact, tooling addition. Focused commit.
   - **Mode 2 subtask** — collector run, validation run, baseline experiment, sample build, training run. Pinned config, captured outputs, run report.
3. **Validate.** Run the relevant validator. Check counts, fixture findings, manifest validation, leakage checks. The acceptance criteria for the milestone name what success looks like; the subtask's contribution to that gets validated explicitly.
4. **Commit (Mode 1) or capture (Mode 2).** Conventional commit message; descriptive subject; PR via `gh` when the work warrants review.
5. **Close the Linear task.** With a brief outcome note; reference the commit SHA or run report path.
6. **Move to the next subtask.**

## Milestone-specific shapes

### M0: Ownership and Governance Baseline (already shipped)

Reference shape; do not re-execute. If revisions to M0 governance are warranted, they go through `scope-need` and `enumerate-changes` as a separate flow.

### M1: GitHub and Operator Trace Collection

- M1.1 GitHub allowlist — already drafted; verify counts, run validator
- M1.2 Operator trace collection — calendar / repo-event metadata for the configured operator (`<operator-handle>`) per scoped sub-deliverables
- Substantive collection runs after allowlist + trace approvals
- Acceptance: reproducible per-org collection; every event row carries full governance metadata; redaction-aware tier for issue/PR bodies and project readmes

### M2: Local Git and Source Snapshot Collection

- Build allowlists for v1 (frameworks, partner-factory + submodules, the parallel-domain source org, GovTheory)
- Clone / refresh non-destructively
- Export commit history, file manifests with content hashes, diff summaries with normalized hashes, submodule gitlinks, framework pins
- Acceptance: clean rerun produces same snapshot manifests; every file/diff record links back to repo + commit + path

### M3: Partner Factory and Governance Artifact Export

- Coordinate with `factory` (`consult-factory-steward`) for Partner Factory KT inventory, relationships, release-batch metadata access
- Coordinate with `govtheory` (`consult-govtheory-steward`) for rubric / control / evidence shape
- Export `nodes.jsonl`, `edges.jsonl`, `release_batches.jsonl`, `release_batch_items.jsonl`, `gov_controls.jsonl`, `verifier_evidence.jsonl`, `framework_pins.jsonl`
- Acceptance: relationship counts reconcile with Partner Factory baseline; every active node resolves or is listed unresolved with reason

### M4: Canonical Event Graph and Validation Suite

- Implement canonical ID generation
- Implement join-confidence taxonomy (exact / strong / inferred / weak / unresolved)
- Build source-to-node, PR-to-diff, PR-to-check, issue-to-PR, project-to-issue, control-to-verifier, verifier-to-evidence, batch-to-service, service-to-framework links
- Enforce temporal cutoff metadata
- Build validation fixtures for duplicate IDs, missing timestamps, weak joins, post-cutoff leakage, unresolved nodes, redaction violations
- Acceptance: validates on v1 corpus; exact/strong joins distinguishable from inferred/weak; temporal leakage checks fail intentional corruption

### M5: Deploy and Runtime Outcome Connector Design

- Coordinate heavily with `factory` (`consult-factory-steward`) for Keeper integration design
- Define schemas: deploy event, runtime window, Keeper source events, allowed runtime summaries, prohibited runtime fields
- Design joins (deploy-to-runtime, Keeper-to-runtime) by repo / SHA / service / stage / partner / Lambda / time window / IDs
- Dry-run plan against the R&D account (`AWS_PROFILE=<your-aws-profile>`; the operator sets their own R&D profile)
- Acceptance: connector design reviewed and approved before broad collection; dry-run can join deploy event to bounded Keeper-derived runtime window without raw log text in `gold_training`

### M6: Encoding Bundle and Embedding Cache

- Define `encoding_bundle.jsonl` schema
- Implement views (graph, KT/framework text, batch, diff, CI/check, GovTheory evidence, operator-trace)
- Implement embedding cache manifest with content hash + encoder version + schema version + redaction version + source cutoff
- Acceptance: bundle validates for all v1 sample families; raw code embeddings referenced via `embedding_manifest` / `serving_cache` only

### M7: Training Samples, Negatives, Splits

- Build sample families (masked_graph_edge, masked_batch_member, missing_evidence_control, pr_contract_impact, generated_patch_critic, cross_domain_transfer)
- Generate hard negatives per family
- Build split manifests (temporal, service-heldout, framework-heldout, Pay Theory heldout, parallel-domain source org heldout)
- Define headline-evaluation subsets (exact/strong only)
- Acceptance: leakage-safe samples; positive/negative ratios reported; cross-domain splits work both directions

### M8: Deterministic Analyzer and Retrieval Baselines

- Implement graph-neighbor, keyword/KT retrieval, generic embedding retrieval, rules-based analyzer
- Capture metrics on frozen benchmark fixtures (Recall@K, MRR, precision at fixed FP budget)
- Acceptance: baselines reproducible; reports cite concrete evidence; analyzer produces useful reports before JEPA

### M9 / M9.5: Graph-Collapse Feasibility / Local Training Environment

- M9: train simple graph embeddings; run masked prediction, corruption discrimination, missing-evidence prediction; ablations including name ablation
- M9.5: local training environment readiness — inventory hardware, define experiment profile, install dependencies, smoke-train, capture telemetry, define AWS escalation criteria
- Acceptance: signal beats simple baselines on at least one benchmark; corruption detection has useful precision; nearest-neighbor explanations are human-plausible; name-ablation does not collapse all signal; **Gate 3 decision recorded explicitly**

### M10: JEPA v0 Training

- Local-first per M9.5
- Frozen encoders, projection heads to shared latent Z, predictor `P(z_visible) -> z_target`
- Losses (cosine/L2 latent, contrastive hard-negative, optional supervised auxiliary)
- Anti-collapse checks
- Logs: training config, data snapshot, split manifest, encoder versions, model version, seeds
- Acceptance: reproducible training; latent collapse checks pass; model artifact stored with registry metadata; **not eligible for enforcement**

### M11: Offline Evaluation, Calibration, Error Analysis

- Evaluate per family (graph, batch, missing evidence/control, PR contract impact, generated patch critic, cross-domain transfer)
- Calibration (ECE, reliability curves)
- Compare against deterministic, retrieval, graph-neighbor, generic embedding, prompt-only baselines
- Error analysis by corpus, repo, sample family, view availability, join confidence, time period
- Acceptance: JEPA beats at least one meaningful baseline on one high-value benchmark or roadmap records why it does not; **Gate 4 decision**

### M12: Shadow Scoring and Human Feedback

- Score new PRs, batches, generated patches, GovTheory evidence gaps in shadow mode
- Store predictions with full lineage (model version, data snapshot, visible context, score, candidate targets, evidence links, uncertainty, recommended validation)
- Implement feedback schema (accepted / rejected / partially_correct / duplicate / unclear / converted_to_rule)
- Monthly shadow reports
- Acceptance: shadow does not block; predictions joined to outcomes without leakage; recurring accepted findings queued for deterministic conversion

### M13: Continuous Training and Model Registry

- Model registry manifest (model version, encoder versions, predictor version, data snapshot, redaction version, schema versions, calibration version, benchmark results, eligibility status)
- Champion/challenger comparison
- Retraining triggers, promotion gates, retirement gates
- Data deletion / regeneration paths for redaction-policy changes
- Acceptance: model version reproducible from registry; champion/challenger reports compare metrics + calibration + error classes

### M14: Advisory Readiness Decision

- Review three streams (offline benchmarks, shadow joins, human feedback)
- Convert recurring findings via `consult-govtheory-steward` to GovTheory action review
- Define advisory output format and suppression / feedback mechanisms
- Define "never gate" categories
- Acceptance: advisory readiness report approved or explicitly rejected; repeated high-value findings have deterministic-hardening tickets; **no CI / deploy gate depends on JEPA-only output**

## Acceptance and reporting

After all subtasks land:

1. **Run all relevant validators.** M0 validator, milestone-specific validators, leakage checks.
2. **Verify acceptance criteria.** Every named criterion gets a yes / partial / deferred status with evidence.
3. **Author the milestone acceptance report** at `planning/<milestone-dir>/<milestone>_acceptance_report.md`. Mirror `m0_acceptance_report.md`'s shape: scope, implemented artifacts, validation command, validation result, acceptance criteria table, deferred items, risks observed, next milestone prerequisites.
4. **Update Linear.** Mark milestone complete; close remaining tasks; link the acceptance report from the milestone description.
5. **Memory-append the milestone outcome.** Date, milestone, validation outcome, deferred follow-ups, gate status (if a gate was attempted), next-milestone prerequisites.
6. **Surface gate decisions.** If the milestone was the gate-eligible one (M0 → Gate 1, M3/M4 → Gate 2, M9 → Gate 3, M11 → Gate 4, M12/M14 → Gate 5), state the gate decision explicitly: proceed / repair / defer.

## Red flags during execution

- **A subtask that wants to skip validation** → refuse. Validation is the gate.
- **A subtask that wants to use `gold_training` shape without governance metadata** → refuse. M0 invariant.
- **A subtask that wants to use post-cutoff context** → refuse. Leakage discipline.
- **A subtask that wants to bypass `consult-factory-steward` for Pay Theory data** → refuse. Cross-tenant respect.
- **A subtask that wants to declare partial acceptance to ship** → refuse. Acceptance criteria are real.
- **A subtask that wants to promote past a failed gate** → refuse. Gate decisions are decisions.
- **Mode mixing** without explicit switch → pause; switch deliberately.

## Completing the milestone

- Hand back to the user with: milestone status, validation outcome, gate decision (if applicable), next-milestone prerequisites.
- If the gate decision is "repair," surface what specifically needs repair; the next session is `scope-need` for the repair work.
- If the milestone produced findings worth memory-pinning beyond the milestone-outcome entry, append them as separate entries.
