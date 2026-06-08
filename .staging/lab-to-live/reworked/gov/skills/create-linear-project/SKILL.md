---
name: create-linear-project
description: Use when GovTheory work warrants its own Linear tracking surface — a substantial roadmap revision, a multi-milestone domain-overlay project, a sign-flow hardening initiative. Most pack work fits inside the existing GovTheory tracking; use this when a separate surface is genuinely warranted.
---

# Create a Linear project (or extend existing tracking)

GovTheory's pack work is tracked at varying granularities — H-milestones in the roadmap, app-integration milestones M0–M5, individual CHANGELOG entries, occasional substantive initiatives. This skill is for the cases where Linear surface is helpful: substantial work spanning multiple commits or sessions, work that benefits from cross-team visibility, or roadmap-level revisions worth tracking separately.

## When to use

- A roadmap revision that introduces a new H-milestone with multiple deliverables
- A domain-overlay initiative (PCI, HIPAA, etc.) with significant KB-coordination scope
- A sign-flow / anti-drift hardening project spanning multiple commits
- A consumer-migration coordination project (e.g., `pai-socket` migration of an action surface)
- A substantive infra change (new release flow, new signing strategy)

## When NOT to use

- A single template / prompt / overlay revision — just commit
- A small CHANGELOG-batched delta — just commit
- An infra config tweak — just commit
- Exploratory work — defer until scope solidifies

## Inputs

- The roadmap document (or roadmap-revision diff)
- The enumerated-changes list
- Scoped need (with propose-phase analysis)
- Any prior Linear context (if a related project exists, surface it)

## Procedure

1. **Decide: extend existing tracking or create new?**
   - **Extend** if the work fits an existing H-milestone or an existing GovTheory project. Add tasks; do not fragment.
   - **Create** if the work is genuinely a separate undertaking with its own timeline / acceptance shape and would clutter existing tracking.
2. **For extension:** identify the existing project / milestone; draft the new tasks; surface to the user for direct Linear updates.
3. **For creation:** draft the project shape:
   - **Project title** — short, descriptive (e.g., "GovTheory: PCI Overlay v1," "GovTheory: Sign-Flow Hardening")
   - **Description** — one paragraph: goal, why a separate project, scope boundary
   - **Initiative attachment** — Theory Cloud governance / framework hardening / similar; if no specific initiative fits, propose one and confirm with user
   - **Parent project** — typically a GovTheory umbrella or none
   - **Milestones** — one per logical phase (often mirrors propose / implement / adopt or H-milestone phases). Title format: `<H-milestone or phase>: <name>`. Description includes deliverables, acceptance criteria (CHANGELOG entries, pack-version implication, lab-validation requirement, false-green / false-red coverage).
   - **Tasks** — one per enumerated change. Title format: `<short imperative>` (e.g., "Add COM check for diluted thresholds"). Description includes paths, validation steps, dependencies, genome / determinism / anti-drift / no-licensed-text checks, CHANGELOG entry, blast radius.
   - **Labels** — `genome`, `template`, `prompt`, `overlay`, `schema`, `pin`, `infra`, `release`, `consumer-coordination`, `kt-consultation`, etc., as relevant. Use existing workspace labels where possible.
4. **Draft for user review.** Present as markdown / structured list the user can paste into Linear or that drives Linear API calls when a Linear MCP / CLI is available.
5. **Linear writeback after approval.** If a Linear surface is available, perform the writeback. Otherwise hand back the draft.
6. **Memory-append.** Project ID once created, milestone count, parent / initiative attachment.

## Default conventions

- **Project naming:** prefix with `GovTheory:` for top-level; descriptive subtitle
- **Milestone naming:** mirror H-milestones where applicable (`H4: gov.init Review/Repair`)
- **Task naming:** imperative, focused
- **Description shape:** every task description names paths, validation, genome / determinism / anti-drift / no-licensed-text checks, CHANGELOG entry requirement, blast radius

## Red flags

- **A project that fragments tracking** when extension would suffice
- **A project without an initiative attachment**
- **Tasks that bundle multiple commits**
- **Tasks without acceptance criteria** (CHANGELOG entry, validation steps)
- **A "track everything" project** — keep scope to substantial work; small deltas live in commit history + CHANGELOG

## After creation / extension

- Memory-append project / milestone IDs
- Hand off to `implement-milestone` for execution if a milestone is ready to walk
- If the work corresponds to a roadmap H-milestone revision, the master roadmap update is itself a Mode 1 commit
