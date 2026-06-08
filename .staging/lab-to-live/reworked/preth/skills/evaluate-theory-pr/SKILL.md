---
name: evaluate-theory-pr
description: Evaluate and, when possible, internally shadow-score a GitHub pull request URL for Theory Cloud or parallel-domain source org work before merge or review. Use when the user provides a PR URL, asks for PR evaluation, model output, shadow score, merge readiness, coherence review, AppTheory/TableTheory convention impact, or sample-intake suitability. Produces a signal-framed PR evaluation with optional PreTheory model score, governance, leakage, repo-instruction, test, and sample-intake guidance; does not edit other repositories, comment on GitHub, gate CI, or treat model output as a verdict unless the user explicitly authorizes a separate action.
---

# Evaluate a Theory PR

Use this skill when the user gives a GitHub PR URL and wants PreTheory help evaluating it while they work in Theory Cloud or parallel-domain source org repositories.

## Core posture

- Treat the output as **signal, not verdict**. Do not frame the PR as approved/rejected by PreTheory.
- Do not post GitHub comments, request changes, merge, close, edit branches, or mutate PR state unless the user separately authorizes that exact action.
- Do not edit non-PreTheory repositories from this session. If a fix is needed in the target repo, give the user a concrete instruction or patch plan.
- Keep sample/training capture separate from review. A PR can be a shadow event or candidate source, but it cannot become a training label without human feedback and leakage recheck.

## Scope gate

1. Parse the PR URL into `owner/repo#number`.
2. Classify repository scope:
   - **Direct review scope**: `theory-cloud/*` and the parallel-domain source org's repos (`<parallel-domain-org>/*`).
   - **Cross-tenant caution**: Pay Theory repos. Review only with explicit user authorization and do not collect/train/label without source-family approval and, where applicable, `consult-factory-steward`.
   - **Unknown scope**: ask before proceeding if the repo owner is not clearly in scope.
3. State the review mode at the top: `read-only PR evaluation`, `no public comment`, `no enforcement`, `no sample label`.

## Collection workflow

Prefer the GitHub plugin/app tools when available. Use `gh` as fallback when connector coverage is insufficient.

Fetch only what is needed:

- PR title/body, author, state, base branch, head branch, mergeability, labels, milestone, linked issues if available.
- Commits and changed file list with stats.
- Check runs/statuses and failed logs only when needed.
- Review comments only if the user asks to address comments or if unresolved review state affects merge readiness.

If a local checkout exists, inspect it read-only. Always read any `AGENTS.md` or `CLAUDE.md` in scope before reasoning about repo-specific requirements. Do not run destructive commands. Run tests only when the user authorizes or when the repo instructions clearly make them expected for read-only evaluation.

## Model shadow scoring workflow

If the user asks for the model output, shadow score, or PR effectiveness signal, run the bounded one-off scorer when prerequisites exist:

```bash
<project-venv>/bin/python tools/m12/score_github_pr_shadow.py --repo <owner>/<repo> --pr <number>
python3 tools/m12/validate_pr_shadow_prediction.py --input <artifact-dir>/shadow_predictions.v1.jsonl
```

Scoring rules:

- Use metadata-only feature construction: repo/PR number, base/head SHAs, timestamps, changed-file path categories/hashes, check-state counts, and inferred framework/convention tags.
- Do not include PR title/body text, raw diffs, raw source, commit messages, author identity, issue/project titles, logs, secrets, runtime data, or merge outcome.
- Emit `shadow_prediction.v1` rows only under ignored `artifacts/m12_pr_shadow/`.
- Treat the score as an internal shadow signal: no public comment, no verdict, no CI/deploy gate, no enforcement, no training label.
- State calibration caveat: the live-PR adapter maps current PR metadata into the model's current v2 feature view; it is useful for learning whether the model is helpful on new PRs, but it is not yet Gate 5/advisory evidence by itself.

## Evaluation rubric

Load `references/pr-evaluation-rubric.md` when doing a full evaluation or when unsure which checks apply.

Always cover these headings in the report:

1. **PR identity** — repo, PR number, base/head, state, latest commit, checks summary.
2. **Intent and shipped-state delta** — what the PR appears to change, grounded in actual diff/files.
3. **Repo-instruction compliance** — relevant `AGENTS.md` / `CLAUDE.md` / release-flow requirements.
4. **Framework coherence** — AppTheory/TableTheory/FaceTheory/GovTheory/KnowledgeTheory convention alignment when relevant.
5. **Risk and blocker list** — blockers first, then non-blocking risks and questions.
6. **Validation evidence** — checks already passed/failed, tests run locally if any, tests recommended.
7. **Model shadow signal** — score rows if generated; include score, threshold ref, uncertainty, candidate target, artifact path, and calibration caveat.
8. **PreTheory sample handling** — whether the PR is suitable as metadata-only shadow event or future sample candidate; never label from prediction.
9. **Recommended next action** — concise human-actionable steps.

## Sample-intake rule

When a PR looks useful for PreTheory data growth:

- Recommend **metadata-only shadow event capture** first, not training ingestion.
- Capture candidates should include repository, PR number, base/head SHAs, changed-file path hashes or categories, timestamps, labels/check states, and framework/convention tags.
- Exclude raw source, diffs, commit messages, issue/project titles, author identity, secrets, logs, runtime data, and post-cutoff outcomes.
- Do not add rows to `gold_training`, `eval_frozen`, `serving_cache`, or `model_registry` during PR evaluation.
- Training eligibility requires a later batch process, split assignment, leakage validation, human feedback for labels, and an acceptance report.

## Output contract

Use this compact report shape unless the user asks for more detail:

```markdown
# PR Evaluation: <owner>/<repo>#<number>

Mode: read-only signal; no public comment; no gate/verdict; no sample label.

## Summary
<2-4 bullets>

## Blockers
- <none or bullets>

## Risks / questions
- <bullets>

## Validation
- Observed checks: <summary>
- Local commands run: <commands or none>
- Recommended before merge: <commands/checks>

## Framework / convention coherence
<bullets grounded in files and repo instructions>

## Model shadow signal
<score/threshold/artifact if generated; otherwise why unavailable>

## PreTheory sample handling
<metadata-only shadow suitability and label/leakage boundary>

## Recommended next action
<1-5 concrete steps>
```

## Hard stops

Stop and ask before proceeding if:

- the PR is in a Pay Theory repo and the user has not explicitly authorized cross-tenant review;
- the evaluation would require reading or storing raw sensitive content outside the target repo's normal PR surface;
- the user asks to post a public PR comment, merge, close, force-push, or change branch state;
- the user asks to treat a model/shadow score as approval or rejection;
- the PR's value as a training sample depends on post-merge outcomes or future docs.
