# Design an agent (Mode 2)

The reversal point. After scope-agent and enumerate-patterns, this skill produces a design document that the principal can review and revise before any files are emitted into the target repo.

This step exists because emitted files are real artifacts. Producing 800 lines of stack and then discovering the agent's identity was misframed is operational debt. The design document is cheap; emissions are not.

## When to use

- A scoped-agent document and a patterns-applied document are both approved
- Before any files are emitted into the target context

## When NOT to use

- Mode 1 work (scope-need handles its own design step)
- A second pass on the same agent — the design has already been confirmed; further changes go through `scope-need` against the existing agent's own corpus, not against progenitor

## Inputs

- The approved scoped-agent document
- The approved patterns-applied document
- The exemplar agents read during `enumerate-patterns`

## Procedure

1. **Sketch the identity (00 layer).** One paragraph: who this agent is, where it lives, what it is not.
2. **Sketch the philosophy (01 layer).** One paragraph per major commitment. For a steward this is the domain-specific philosophy (e.g., "read-only-as-wall" for keeper). For a subagent or skill, the equivalent is the procedural posture (when to act, when to refuse).
3. **Sketch the discipline (02 layer).** One paragraph: how the agent actually works. Standard work shapes, validation gates.
4. **Sketch the boundaries (03 layer).** One paragraph: scope, out-of-scope, cross-agent boundaries, destructive-action policy.
5. **Draft the soul layer (20 layer).** The refusal list, refined from the scoped-agent draft. Each refusal grounded in an invariant. The "let me bypass X just this once" framing named explicitly.
6. **Enumerate skills.**
   - For each skill: name + one-line description
   - Standard skills for stewards: `scope-need`, `enumerate-changes`, possibly `plan-roadmap`, `create-linear-project`, `implement-milestone`, `investigate-issue`
   - Agent-specific operational skills (Mode 2 if applicable)
   - Consultation skills per same-tenant peer
7. **Specify cross-agent surfaces.**
   - Same-tenant peers with consult-* skills
   - Cross-tenant relationships routed via user
   - Email-allowlist provisioning requirements
8. **Specify tenancy details.**
   - config.toml shape (MCP URL, scopes, approval modes)
   - Identity-layer assertion of the same tenancy
9. **Specify validation criteria.**
   - For codex-steward: `build.sh` runs clean; `steward.md` assembles; expected line count range
   - For subagent: frontmatter parses; body covers identity / scope / refusals
   - For skill: frontmatter has `name` + `description`; body covers inputs / procedure / outputs
   - For API agent: system prompt is self-contained; tool schemas valid
10. **Show the design document to the principal.** Wait for explicit confirmation or revision request before any emission.

## Output

A single design document — typically `docs/agent-designs/<date>-<slug>.md` in progenitor, or inline in conversation for fast cases. Either way: confirmed before emission.

## Red flags

- **Emitting before confirmation** — refuse; the document is the reversal point
- **A soul layer with fewer than three concrete refusals** — refuse; expand
- **Cross-agent surfaces missing for an agent with same-tenant peers** — refuse; expand
- **Tenancy details that contradict the scoped-agent document** — refuse; reconcile
- **A design that copies an exemplar wholesale** — refuse; instantiate the pattern, do not transplant the exemplar

## After designing

- Hand off to the appropriate `create-*` skill (codex-steward / subagent / skill / api-agent)
- Memory-append the design outcome