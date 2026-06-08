---
name: scope-need
description: Use at the start of any non-trivial pack change — new gate, new template, new prompt, new domain overlay, schema bump, pin update, planning-doc revision, infra change. Interviews the user conversationally and produces a scoped-need document with explicit propose-phase analysis (false-green / false-red, genome impact). Does not write code.
---

# Scope a need

A need arrives fuzzy. A pack change arrives sharp. This skill is the conversation that turns one into the other. Output is a document, not code.

## Your posture

You are interviewing, not pitching. The pack's discipline (genome integrity, determinism, anti-drift, no-licensed-text) is the floor; the user is bringing a need; your job is to shape the need into something `enumerate-changes` can act on while preserving the floor.

The default reflex is suspicion of pack-content expansion. Pack changes that affect generated outputs propagate to every target repo on next consumer invocation. A new gate, a new template, a loosened threshold — all of these have fanout consequences. Scope cautiously.

## Start with memory and shipped state

- **`memory_recent`** — has this need or something adjacent been scoped before? If yes, pick up from there.
- **Read the relevant docs.** `gov-design.md` (contract), `gov-genome.md` (vetted standard), `gov-roadmap.md` (milestone state H0–H6), `CHANGELOG.md` (recent deltas).
- **Check shipped state.** What templates / prompts / overlays / schemas already exist? What's published to S3 (`SSM /gov/<stage>/packVersion`)?
- **Honor `AGENTS.md`.** The root-level guidance is the canonical contributor floor; new scope must respect determinism, anti-drift, no-licensed-text, token-hygiene rules.

If memory or KB tools return auth errors, surface to the user.

## The interview

Ask the user, in roughly this order, one or two questions at a time (a conversation, not a form):

1. **What category of need is this?** New gate / rubric item? New template? New / revised prompt? New / revised domain overlay? Schema bump? Pin update? Planning-doc revision? Infra change?
2. **What problem does it solve?** Frame in terms of a real failure mode the existing pack misses (false-green or false-red), or a contract gap. "It would be nice" is not a problem.
3. **What's the false-green analysis?** Does the change risk letting a real problem pass undetected? Threshold loosening, exclusion adding, verifier becoming optional, gate becoming advisory — name it explicitly.
4. **What's the false-red analysis?** Does the change risk flagging valid work as failing? Brittle assertion, wrong threshold pin, missing alternate evidence path — name it.
5. **What genome link does this affect?** Scope, threat model, controls, rubric, roadmap, evidence plan, CI gate, validate, sign, drift detection. Strengthens or weakens that link?
6. **Does the change require a CHANGELOG entry?** Almost always yes if it affects generated outputs. Confirm.
7. **Does the change require pack-version bump on adoption?** Yes if it affects consumer-visible contract.
8. **Does the change require schema bump?** If shape of any fixed report or `pack.json` changes, yes.
9. **Does the change require a pin update?** If templates / prompts reference framework versions that need to move, yes.
10. **Does the change require domain-overlay coordination?** If the change affects existing overlays, route to those overlays' maintainers / users.
11. **Does the change require KB references?** If yes, plan a `consult-knowledgetheory-steward` step.
12. **What does success look like?** Observable. "Better" is not observable; "Verifier reports BLOCKED instead of false-green when toolchain pin is missing, validated via fixture X" is.
13. **What is explicitly out of scope?**
14. **What is the nearest existing surface?** Often a similar gate / template / overlay already exists; the work may be smaller than initial framing suggests.

## The propose-phase analysis

Per `gov-genome.md`, pack evolution follows propose / implement / adopt. Scoping *is* the propose phase. Before the conversation ends:

- **Stated rule / gate / artifact.** What is the new or changed pack content?
- **Verifier contract** (if applicable). What command runs? What evidence path? What schema?
- **False-green analysis.** Specifically what failure mode could pass under the new rule?
- **False-red analysis.** Specifically what valid work could fail under the new rule?
- **Genome impact.** Which link(s) affected; tightened or loosened.
- **Anti-drift consideration.** Does the change preserve COM-layer invariants (toolchain pinning, threshold floors, no silent excludes, verifier-evidence parity, threat-control parity)?
- **No-licensed-text check.** Does the change embed licensed standards prose? (If yes, refuse and redirect to KB references.)
- **Determinism check.** Does the change preserve stable ordering, IDs, thresholds, output structure?

If the analysis surfaces a refusal-list pattern (genome erosion, false-green introduction, licensed text, determinism erosion), surface to the user explicitly. The need may need reshaping.

## Output: the scoped-need document

Produce this markdown document and confirm it with the user:

```markdown
# Scoped Need: <short name>

## Background
<one paragraph of context — why now>

## Problem
<what failure mode this addresses, or what contract gap it fills>

## Users and beneficiaries
<who this affects: target-repo authors, auditors, consumers, framework maintainers>

## Proposed change
<the rule / gate / artifact in concrete terms>

## Verifier contract (if applicable)
<command / evidence path / schema>

## False-green analysis
<what failure could pass under this rule; why mitigation is sufficient>

## False-red analysis
<what valid work could fail under this rule; why mitigation is sufficient>

## Genome impact
<which link(s); tightens or loosens; rationale>

## Determinism / anti-drift / no-licensed-text checks
<each named explicitly; pass / refuse / redirect>

## Cadence implication
<H-milestone if it slots into the existing roadmap; otherwise new milestone or revision>

## Versioning implications
<pack version bump? schema bump? pin update? overlay coordination?>

## Cross-repo consultation needed
<consult-knowledgetheory-steward? consumer-side coordination via user?>

## Nearest existing surface
<what template / prompt / overlay / schema gets partway there>

## Out of scope
<what this scoped need explicitly does not cover>

## Open questions
<unresolved>
```

## Persist before handoff

Call `memory_append` with the short name, the propose-phase analysis verdict (especially false-green / false-red), and a one-line hook.

## Handoff

- If the scope is clean, invoke `enumerate-changes`.
- If the scoping forces the comparison and the user decides the existing pack already covers the case, record and stop.
- If the propose-phase analysis surfaces a refusal pattern, do not enumerate. Either reshape the need or refuse.
- If the work is large enough to need phasing, suggest `plan-roadmap` (rare for pack changes; usually fits a single H-milestone).
- If the scope warrants Linear tracking, suggest `create-linear-project`.
- If KB references are part of scope, name the `consult-knowledgetheory-steward` step as a prerequisite.
