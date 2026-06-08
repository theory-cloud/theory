---
name: consult-factory-steward
description: Cross-tenant consultation surface from preth (Theory Cloud) to factory (Pay Theory). Use when source-family work touches Pay Theory data — partner-factory graph artifacts, service-fleet metadata, Keeper-mediated runtime data, deploy-plane fallback collection, or any source collection against Pay Theory accounts.
---

# Consult factory steward

Cross-tenant consultation. `factory` lives under the Pay Theory tenant at `…/paytheory/agents/factory/mcp`; you live under the Theory Cloud tenant at `…/theorycloud/agents/preth/mcp`. The boundary is real — coordination happens through structured email exchange, not through cross-repo edits.

PreTheory consumes Pay Theory data extensively; this consultation skill is heavily used during M1 (GitHub collection of pay-theory org), M3 (Partner Factory and governance export), and M5 (Keeper integration design + deploy-plane fallback).

## When to use

- **Source-family approval that touches Pay Theory data.** Any new source family pulling from `partner-factory`, the ~74 service repos, partner AWS accounts, Keeper, or deploy-plane CodeBuild / CodePipeline / CloudFormation history.
- **Partner Factory artifact export design (M3).** KT inventory shape, relationships, release-batch metadata, submodule pin export, deploy-order encoding. These are factory's domain; PreTheory consumes them but factory is the source-of-truth steward.
- **Keeper integration design (M5).** Scopes, allowed resources, masking metadata, audit metadata, allowed runtime summaries, prohibited runtime fields. Keeper is `pay-theory/keeper` and factory has the operational view of how partner-account access flows through it.
- **Direct AWS fallback scope (M5).** Which deploy-plane artifacts are not exposed by Keeper and need direct collection via the R&D account (the operator's configured R&D profile)? CodeBuild / CodePipeline / CloudFormation / CDK diff / stack events. Factory knows what's there.
- **Retention, access boundaries, audit metadata** for Pay Theory source data.
- **Source-side schema or contract changes** that affect what PreTheory consumes (e.g., partner-factory submodule restructuring, Linear field renaming on Pay Theory side, deployment script changes that affect collector output).
- **Operational coordination during collection** — rate limits, source-side load, scheduling.

## When NOT to use

- **Pay Theory framework / service code questions** — those go to the relevant service-repo steward / engineers, not to factory.
- **Partner-side business specifics** — those go to `partner-manager` (the Pay Theory partner-fleet meta-steward), not to factory.
- **Theory Cloud-side governance shape** — that's `consult-govtheory-steward`.
- **Routine collector tweaks** that don't change source-side scope or contract.

## Inputs

- The specific question, decision, or input you need
- Your own context: source-family scope, milestone driving the consultation, ADR / approval-record draft state
- Any prior consultation history (`memory_recent`)
- Affected source surfaces and proposed PreTheory-side artifacts

## Procedure

1. **Recall prior consultation history.** `memory_recent` for any prior `factory` exchanges. Build on prior context; do not re-ask resolved questions.
2. **Frame the question precisely.** A sloppy consultation produces a sloppy outcome. The question, the decision options (when they exist), the constraints, the timeline, the alternatives PreTheory has already considered.
3. **Compose the email.**
   - **Subject:** `[preth → factory] <one-line question or decision summary>`
   - **Body:**
     - Background: what's prompting the consultation (which milestone, which source family, what's pending in PreTheory's flow)
     - The question or decision: precise, with options when they exist
     - Affected source surfaces: which Pay Theory repos, accounts, or artifact families
     - Affected PreTheory artifacts: which schemas, manifests, validators, planning docs
     - Governance state: source-family approval record draft state, redaction-policy implications
     - What you'd like back: a decision, an opinion, an input, a coordination plan
     - Timeline if relevant
4. **Dispatch via `email_send`.** The factory allowlist must accept inbound from `preth`. Verify provisioning if first-time use; surface to user if not in place.
5. **Track the exchange.** When factory replies, capture the outcome. Use `email_reply` for clarification rounds.
6. **Memory-append the exchange.** Date, question, factory's response, what changed in PreTheory's flow as a result.
7. **Apply the resolution.** If the consultation produces approval to proceed, advance the source-family approval record + collector work. If it produces a scope adjustment, revise PreTheory-side artifacts to match. If it surfaces an upstream change PreTheory needs to track, capture it as a follow-up.

## Red flags

- **Consulting on Theory Cloud-side substance.** Factory's domain is Pay Theory release engineering; do not ask factory about KnowledgeTheory, GovTheory, or framework-level decisions.
- **Consulting before having the approval-record draft ready.** Factory's review benefits from concrete PreTheory-side artifacts (proposed manifest rows, redaction-policy implications); arriving without them produces hand-waving.
- **Pre-emptive collection before the consultation resolves.** Wait for the reply. Pre-collected data that turns out to be out of scope is governance debt.
- **A consultation that asks factory to do PreTheory's work.** The redaction policy, the schema design, the leakage discipline — those are PreTheory's. Factory's input is on Pay Theory-side scope, access, and contract.
- **A consultation chain that goes silent.** If factory does not respond in a reasonable window, surface to the user — provisioning may be the issue, or other coordination factors.

## Output

- A dispatched consultation email with a clear question
- Eventually, a captured outcome (`memory_append`)
- Follow-up PreTheory-side work driven by the resolution: source-family approval record completed; collector implementation; schema / fixture additions; or a re-scoped milestone

## Authorization

- The factory email allowlist must accept inbound from `preth`. Verify provisioning before first use; surface to user if unclear.
- Consultations whose outcomes commit PreTheory to specific scope (e.g., approving a Keeper integration boundary) merit explicit user awareness — these decisions affect downstream milestones.
- Direct AWS access against Pay Theory accounts is *never* a casual decision; consultations about it default to "no broader collection until factory confirms scope."

## After consulting

- Memory-append the outcome.
- If the resolution opens a path that was previously blocked, advance the relevant `implement-milestone` or `scope-need`.
- If the resolution narrows scope, revise the in-flight artifacts before continuing.
- If the resolution surfaces a need that crosses into another Pay Theory steward's domain (`control`, `portal`, `auto`, `partner-manager`), surface to the user — factory will route, but PreTheory should be aware.
