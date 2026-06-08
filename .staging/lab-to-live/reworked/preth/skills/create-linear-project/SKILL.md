---
name: create-linear-project
description: Use when a derivative TheoryJEPA project warrants its own Linear surface, or when the master PreTheory project needs significant new milestones / tasks added. Translates a roadmap (or a milestone subset) into Linear shape. Most PreTheory work fits the existing master project; use this only when a separate surface is genuinely warranted.
---

# Create a Linear project (or extend the existing one)

PreTheory already has a Linear project: **PreTheory: TheoryJEPA Model Training**, attached to the **TheoryJEPA R&D** initiative. Most work fits there. Use this skill when:

1. A derivative project warrants its own Linear surface (e.g., a substantive offshoot whose timeline and acceptance differ from the master)
2. The master project needs significant new milestones or tasks added (less commonly invoked as a "create" skill, but the project-extension flow uses the same shape)

## When NOT to use

- The work is one or two new tasks under an existing milestone — just add them in Linear directly
- The work is a single focused commit — no Linear surface needed
- The work is exploratory / experimental — defer Linear until scope solidifies

## Inputs

- The roadmap document (master or derivative)
- The enumerated-changes list
- Scoped need
- Any prior Linear context for related projects under the TheoryJEPA R&D initiative

## Procedure

1. **Decide: extend the master project or create derivative?**
   - **Extend** if the work fits the existing M0–M14 cadence and timeline. Most PreTheory work extends.
   - **Create derivative** if the work is genuinely a separate undertaking that would clutter the master project's tracking or would have different acceptance / timeline shape. Derivative projects attach to the same `TheoryJEPA R&D` initiative.
2. **For extension:** identify which existing milestone(s) absorb the work; draft the new tasks under those milestones; surface to the user for direct Linear updates.
3. **For derivative:** draft the project shape:
   - **Project title** — short, descriptive (e.g., "PreTheory: <Aspect> Pilot")
   - **Description** — one paragraph: goal, why a separate project, scope boundary
   - **Initiative attachment** — `TheoryJEPA R&D` (default; only deviate if the work is genuinely outside R&D scope)
   - **Parent project** — typically `PreTheory: TheoryJEPA Model Training` if the derivative extends from it; otherwise standalone under the initiative
   - **Milestones** — one Linear milestone per roadmap milestone. Title format: `M<N>: <name>`. Description includes goal, source deliverables, acceptance criteria.
   - **Tasks** — one Linear task per enumerated change. Title format: `<short imperative>`. Description includes the enumerated item's full content (paths, validation, dependencies, governance check, cross-tenant coordination, blast radius). Link parent milestone.
   - **Labels** — `R&D`, `governance`, `data-collection`, `redaction`, `schema`, `tooling`, `experiment`, `evaluation` as relevant. Use existing labels in the workspace where possible.
4. **Draft the document for user review.** Present as a markdown table or structured list the user can paste into Linear or that can drive Linear API calls when a Linear MCP / CLI is available.
5. **Linear writeback after user approval.** If the user approves and a Linear surface is available, perform the writeback. Otherwise hand back the draft for manual entry.
6. **Memory-append the project shape.** Project ID once created, milestone count, parent / initiative attachment.

## Default conventions

- **Initiative:** `TheoryJEPA R&D` for all PreTheory-line work unless the user explicitly directs otherwise
- **Project naming:** prefix with `PreTheory:` for top-level; derivative projects are descriptive (e.g., `PreTheory: <Aspect> Pilot`)
- **Milestone naming:** mirror the roadmap (`M0: Ownership and Governance Baseline`)
- **Task naming:** imperative, focused (`Draft source-family approval record for <family>`)
- **Description shape:** every task description includes paths, validation, dependencies, governance check, cross-tenant coordination, blast radius

## Red flags

- **A derivative project that fragments tracking.** If the work could comfortably extend the master, fragmentation is the wrong default.
- **A project without an initiative attachment.** TheoryJEPA R&D is the home; orphaned projects lose visibility.
- **Tasks that bundle multiple commits.** One Linear task = one focused commit (Mode 1) or one experiment + report (Mode 2). Bundling defeats tracking.
- **Tasks without acceptance criteria.** Every task that maps to a milestone deliverable has acceptance criteria; silent acceptance is drift.

## After creation / extension

- Memory-append project / milestone IDs and parent attachments
- Hand off to `implement-milestone` for execution if a milestone is ready to walk
- If the project is significant enough, consider a Linear document summarizing the project's relationship to the master (mirroring the existing "Roadmap Summary" Linear document)
