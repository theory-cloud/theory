# PR evaluation rubric

Use this reference for full PR evaluations.

## Severity

- **Blocker**: likely merge break, release-flow violation, failing required check, security/governance issue, or repo-instruction violation.
- **High risk**: may pass CI but can cause contract drift, cross-language mismatch, migration risk, or hidden runtime failure.
- **Medium risk**: needs clarification, extra tests, docs, or reviewer attention.
- **Low risk**: polish, optional follow-up, or sample-capture note.

## Repo instruction checks

Read relevant `AGENTS.md`/`CLAUDE.md` from the target repo checkout when available. Common Theory Cloud patterns:

- AppTheory: cross-language contract parity; version alignment for `VERSION`, package manifests, release-please manifests; regenerate checked-in SDK/CDK outputs when sources change; run repo rubric when public APIs change.
- TableTheory: Go formatting/lint/tests; canonical `theorydb` tags; version alignment and release-candidate manifest consistency before staging PRs; run `make rubric` when practical.
- FaceTheory: verify stable and release-candidate version alignment for staging PRs.
- GovTheory/KnowledgeTheory: do not weaken governance gates; verifier failures are blockers; avoid licensed/raw standards text.

If exact instructions are unavailable, say so and avoid inventing repo-specific requirements.

## Framework coherence prompts

Check only where relevant to changed files:

- AppTheory handlers: route shape, strict typing, middleware order, Lambda init pattern, generated artifacts, contract tests.
- TableTheory models: primary/sort keys, tags, encryption/TTL semantics, query/index consistency, test coverage.
- Release flow: staging/premain/main branch roles, release-please manifests, changelog/docs implications.
- Governance: new controls/verifiers/templates preserve deterministic behavior and do not weaken gates.
- Cross-language SDKs: Go/TS/Python/API snapshots remain aligned.

## Validation prompts

Report what is observed before recommending more work:

- GitHub checks: passing/failing/pending/absent.
- Local validation: commands actually run and outcome.
- Recommended validation: repo-rubric command, targeted unit tests, contract tests, version-alignment scripts, or generated-artifact checks.

Do not claim a command passed unless it was observed.

## Model shadow scoring interpretation

When a one-off PR shadow score is generated, report it separately from human review:

- `score >= threshold` means the current adapter/model considers the candidate target convention coherent enough to inspect; it is not approval.
- `score < threshold` means low model confidence/coherence under the current feature adapter; it is not rejection.
- Very small scores on human-coherent PRs are evidence of adapter/model mismatch and should become repair data, not PR blockers.
- Always include the artifact path, target convention(s), threshold reference, and calibration caveat.

## PreTheory sample suitability

A good PR shadow/sample candidate has:

- clear metadata-only event identity: repo, PR number, base/head SHAs, timestamps;
- framework/convention tags inferable from file paths/categories, not raw content;
- temporal cutoff before review outcome;
- no raw diffs, commit messages, author identity, logs, secrets, or customer/payment/runtime data;
- later human feedback available as separate outcome, never model prediction as label.

Sample candidate categories:

- `convention_usage_coherence`
- `pre_convention_lineage_transfer`
- `cross_repo_convention_transfer`
- `framework_usage_drift`
- `issue_project_to_commit_resolution`
- `generated_patch_critic`

If any label would require knowing whether the PR ultimately merged or caused a later fix, mark it **future outcome required** and exclude from headline evaluation until the proper cutoff/split process exists.
