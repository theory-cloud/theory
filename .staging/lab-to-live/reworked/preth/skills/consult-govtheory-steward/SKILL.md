---
name: consult-govtheory-steward
description: Theory Cloud peer consultation surface from preth to govtheory. Use when accepted recurring model findings need to route into a GovTheory action with explicit review, when GovTheory rubric / control / verifier / evidence shape changes affect PreTheory's sample construction, when anti-drift or release-policy semantics need clarification, or when threat-model parity work involves both projects.
---

# Consult govtheory steward

Same-tenant consultation (Theory Cloud peer). `govtheory` lives at `…/theorycloud/agents/govtheory/mcp` (when provisioned); you live at `…/theorycloud/agents/preth/mcp`. The boundary is real but lower-friction than cross-tenant — GovTheory is your peer, not a different organization.

This consultation skill is critical for M3 (governance artifact export), M11 (evaluation against GovTheory rubric/control/evidence), M12 (shadow scoring of GovTheory missing-evidence/control gaps), and M14 (advisory readiness — accepted findings route into GovTheory action review for verifier / rubric / fixture / KT unit / analyzer rule / runbook conversion).

## When to use

- **Accepted finding routing (M14).** A recurring accepted finding needs to enter a dedicated GovTheory action with explicit review. The conversion target may be a verifier, rubric/control row, framework fixture, KT unit, analyzer rule, or runbook update.
- **Rubric / control matrix shape changes (M3, M11).** When GovTheory revises its rubric or control matrix, PreTheory's exports and evaluation samples may need to track the revision.
- **Verifier / evidence path changes (M3, M11, M12).** Verifier references and evidence paths are first-class in GovTheory; their movement affects how PreTheory builds `gov_controls.jsonl`, `verifier_evidence.jsonl`, and missing-evidence/control samples.
- **Anti-drift, release-policy, threat-model parity semantics.** When PreTheory needs to interpret GovTheory artifacts for sample construction, the interpretation should match GovTheory's intent.
- **Defining a new "GovTheory action" type.** If accepted-finding conversion produces a class of action GovTheory hasn't formalized yet, design the action type with GovTheory.
- **Promotion-gate alignment (M14).** Advisory readiness involves explicit review steps that GovTheory hosts; design the review surface together.

## When NOT to use

- **PreTheory-internal governance** (M0 ADR, redaction policy, source-family approvals) — these are PreTheory's domain. GovTheory's domain is Theory Cloud framework governance (rubrics, controls, verifiers, anti-drift, release policy), not PreTheory's R&D data governance.
- **Pay Theory governance / partner-factory release engineering** — those are `consult-factory-steward`.
- **KnowledgeTheory KB ingestion** — that's KnowledgeTheory's steward (no dedicated consultation skill provisioned today; route via user).
- **Routine PreTheory milestone work** that doesn't touch GovTheory artifact shape or accepted-finding conversion.

## Inputs

- The specific question, decision, or input you need
- The driving context: which milestone, which finding(s), what conversion target is contemplated
- Any prior consultation history (`memory_recent`)
- Affected GovTheory artifacts (rubric / control / verifier / evidence / framework fixture / KT unit / analyzer rule / runbook) and PreTheory-side artifacts

## Procedure

1. **Recall prior consultation history.** `memory_recent` for any prior `govtheory` exchanges. Build on prior context; do not re-ask resolved questions.
2. **Frame the question precisely.** Especially for accepted-finding conversion: the conversion target, the finding's evidence (concrete graph edges / source files / PRs / batches / project items), the recurrence count, the calibration context, the proposed deterministic-rule shape.
3. **Compose the email.**
   - **Subject:** `[preth → govtheory] <one-line question or decision summary>`
   - **Body:**
     - Background: what's prompting the consultation (which milestone; if accepted-finding conversion: the finding type, recurrence count, shadow-mode context)
     - The question or decision: precise, with options when they exist
     - Affected GovTheory artifacts: rubric items, control rows, verifier paths, evidence paths, framework fixtures, KT units, analyzer rules, runbooks
     - Affected PreTheory artifacts: which samples, baselines, evaluation reports, shadow-mode logs are evidence
     - Proposed conversion shape (for M14 work): how would the finding become a deterministic surface — verifier command, rubric row, fixture entry, KT unit content, analyzer rule, runbook section
     - What you'd like back: a decision, an opinion, an input, a coordination plan
     - Timeline if relevant
4. **Dispatch via `email_send`.** The govtheory allowlist accepts inbound from `preth`. Verify provisioning if first-time use; surface to user if not in place.
5. **Track the exchange.** Use `email_reply` for clarification rounds.
6. **Memory-append the exchange.** Date, question, govtheory's response, what changed (PreTheory side and / or GovTheory side as a result).
7. **Apply the resolution.** If the consultation produces a conversion approval, advance the deterministic-conversion work (the actual fixture / verifier / rubric row gets authored in GovTheory by govtheory's steward / engineers). PreTheory's role then closes for that finding type — the model is no longer the surface; the deterministic rule is.

## Red flags

- **Consulting on PreTheory-internal governance.** Redaction policy, source-family approvals, M0 invariants — these are PreTheory's. Govtheory is not the review surface for them.
- **Consulting on Pay Theory operational decisions.** Release engineering, partner provisioning, deploy mechanics — those are `consult-factory-steward`.
- **Routing a finding for conversion before sustained shadow evidence.** M14's threshold is real (6-8 active weeks or 100+ events, 30+ reviewed findings, ≥60% acceptance at high confidence, ≥80% on critical/high, false positives within review budget, three+ deterministic-conversion candidates). Premature conversion routing wastes govtheory's attention.
- **Routing a finding without concrete evidence.** The conversion artifact's rationale is the model's evidence trail (graph edges, source files, controls, verifiers, PRs). Hand-waving on evidence weakens the conversion case.
- **A consultation that asks govtheory to validate a model claim** without reciprocal evidence. Govtheory's role is governance shape; the model's claim needs evidence the way any governance proposal does.

## Output

- A dispatched consultation email with a clear question
- Eventually, a captured outcome (`memory_append`)
- Follow-up PreTheory-side work: shadow-mode review note that the finding type is converted; metric / calibration tracking to confirm the conversion produces the expected reduction in the model's role; or revised sample construction if the rubric / control shape changed

## Authorization

- The govtheory email allowlist must accept inbound from `preth`. Verify before first use.
- Conversions of accepted findings into deterministic surfaces are *governance work*, not casual additions. The consultation gates the work.
- M14-stage consultations affecting advisory-readiness review merit explicit user awareness.

## After consulting

- Memory-append the outcome.
- If a conversion landed, the model's role for that finding type closes; surface that to the user and update relevant shadow-mode reports.
- If the rubric / control shape changed, the relevant samples / baselines may need re-derivation; surface as Mode 1 or Mode 2 follow-up.
- If the consultation surfaces a coordination need with another steward (KnowledgeTheory for a KT unit conversion; framework stewards for a fixture conversion), surface to the user — govtheory will route, but PreTheory should be aware.
