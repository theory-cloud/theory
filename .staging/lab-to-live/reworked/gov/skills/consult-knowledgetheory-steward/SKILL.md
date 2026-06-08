---
name: consult-knowledgetheory-steward
description: Theory Cloud peer consultation surface to knowledgetheory. Use when a domain overlay introduces or revises KB references (PCI_KB_PATH, HIPAA_KB_PATH, etc.), when a pack revision affects how target repos query KBs from gov-infra/ artifacts, when KT unit creation is a target for pack-level evidence references, or when KB schema / contract changes affect what GovTheory references.
---

# Consult knowledgetheory steward

Same-tenant consultation (Theory Cloud peer). `knowledgetheory` lives at `…/theorycloud/agents/knowledgetheory/mcp` (when provisioned); you live at `…/theorycloud/agents/gov/mcp`. Both Theory Cloud — coordination is structured but lower-friction than cross-tenant.

The pack's no-licensed-text discipline relies on KB references being first-class. When an overlay says "PCI control 3.2.1 — see `$PCI_KB_PATH`," the KB has to actually have that unit, and the pack has to be able to trust the reference will resolve. That's the consultation surface this skill handles.

## When to use

- **A new KB reference in an overlay or template** — verify the KB exists, has the referenced unit, has stable IDs, accepts the query shape PreTheory consumers will use
- **A revised KB reference** — confirm the unit ID is still valid; surface any KT-side renames
- **A new domain overlay's KB env-var convention** — coordinate naming (e.g., new `<DOMAIN>_KB_PATH` env var following established pattern)
- **A KT contract change that affects what GovTheory references** — KB schema versioning, ingestion contract changes, query-shape changes; pack templates / prompts may need to track
- **Pack-level evidence references** — when GovTheory authors reference KT units as evidence of standards compliance, coordinate the unit's existence and shape
- **Accepted finding conversion to KT unit** — when PreTheory routes an accepted recurring finding through `consult-govtheory-steward` and the conversion target is a new KT unit, GovTheory in turn consults KT

## When NOT to use

- **Target-repo KB queries** — those are the consumer's runtime concern, not pack-level
- **PreTheory-side consultations** — `preth` consults you directly (`consult-govtheory-steward` from their side); you receive, you don't initiate KT consultations on PreTheory's behalf
- **Pay Theory KB content** — that's `paytheory` KB's domain (factory / product / per-partner subtrees); use `consult-factory-steward` if Pay Theory-side KB matters cross-tenant
- **Routine pack-content tweaks** that don't touch KB references

## Inputs

- The specific question, decision, or input you need
- The pack-side context: which template / prompt / overlay needs the KB reference, what the reference is for, what query shape the consumer will use
- Any prior consultation history (`memory_recent`)
- Affected GovTheory artifacts (overlay JSON / README, template / prompt, schema)

## Procedure

1. **Recall prior consultation history.** `memory_recent` for any prior `knowledgetheory` exchanges. Build on prior context.
2. **Frame the question precisely.** A sloppy KB-reference consultation produces sloppy KB references. Name the env var, the expected unit IDs, the query shape, the consumer use case.
3. **Compose the email.**
   - **Subject:** `[gov → knowledgetheory] <one-line question or decision summary>`
   - **Body:**
     - Background: which pack revision, which overlay / template / prompt, what's prompting the consultation
     - The KB reference: env var name, expected unit ID(s) or unit pattern, query shape
     - Consumer use case: how the reference resolves at consumer runtime (theory-cli, theory-mcp, pai-socket); what the verifier or prompt does with the resolved content
     - Standards traceability: which PCI / HIPAA / framework standard the KT unit corresponds to
     - What you'd like back: confirmation the unit exists; KT-side stable ID; query-shape acknowledgment; or proposed coordination if the unit needs to be authored / restructured
     - Timeline if relevant
4. **Dispatch via `email_send`.** The KT allowlist accepts inbound from `gov`. Verify provisioning if first-time use; surface to user if not in place.
5. **Track the exchange.** Use `email_reply` for clarification rounds.
6. **Memory-append the exchange.** Date, KB reference, KT response, what changed pack-side.
7. **Apply the resolution.** If KT confirms, the overlay / template / prompt lands the reference. If KT requests a unit-authoring step before the pack can rely on it, defer the pack reference until the KT-side work completes.

## Red flags

- **Embedding licensed text instead of referencing KB.** No. The pack's no-licensed-text rule is non-negotiable.
- **Inventing a KB unit ID without KT confirmation.** The unit may not exist; reference will fail at consumer runtime.
- **Bypassing consultation because "the env var is just a string."** The string resolves at runtime; if KT doesn't recognize the unit, the reference is broken.
- **A consultation chain that goes silent.** If KT does not respond, surface to user; provisioning or coordination factors may be the issue.
- **A consultation that proposes pack changes that depend on aspirational KT state.** Verify shipped KT state before proposing pack revisions that lock onto it.

## Output

- A dispatched consultation email with a clear question
- Eventually, a captured outcome (`memory_append`)
- Follow-up pack-side work driven by the resolution: overlay / template / prompt revision; CHANGELOG entry; possibly a pack-version bump if the change affects consumer-visible references

## Authorization

- The KT email allowlist must accept inbound from `gov`. Verify before first use.
- Consultations whose outcomes affect domain-overlay readiness merit explicit user awareness — overlays that depend on unauthored KT units cannot ship.
- M14-stage consultations (PreTheory accepted-finding conversions to KT units) are coordinated with `preth` as well; the user may need to mediate if all three steward surfaces are involved.

## After consulting

- Memory-append the outcome.
- If the resolution opens a path that was previously blocked, advance the relevant `implement-milestone`.
- If KT requests pack-side documentation revisions (e.g., a new overlay README convention referencing KT shape), incorporate.
- If the consultation surfaces work for a different consumer (theory-mcp's tool policy, pai-socket's action runner), surface to the user — KT will route, but GovTheory should be aware.
