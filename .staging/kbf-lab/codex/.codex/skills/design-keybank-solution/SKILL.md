# Design a KeyBank solution

Before building, decide *what* to build it from. This is where framework fidelity is exercised: you compose the product out of the Theory Cloud frameworks and theory-mcp agent systems as they actually are, and you decide the repo/agent structure.

## When to use

- A scoped need (and usually enumerated changes) exists for a KeyBank product, and you must decide architecture before planning the roadmap or building.

## When NOT to use

- The need isn't scoped.
- The "design" is really one small change to an existing product — implement it directly within the owned repo.

## Inputs

- The scoped need and enumerated changes.
- KeyBank specifics (`consult-keybank-knowledge`).
- Framework capabilities — **ask the stewards** (`consult-framework-steward`) and the platform (`consult-theory-mcp`) when you are unsure; do not guess.

## Procedure

1. **Map needs to frameworks.** For each capability the product needs, name the Theory Cloud framework that provides it (AppTheory runtime/HTTP/WebSocket/MCP, TableTheory data model, FaceTheory UI, GovTheory validation/evidence, Autheory identity, theory-cli operator flows). Reach for what exists.
2. **Decide agent systems.** Does the product itself need theory-mcp agent systems? If a product-as-agent-system is involved, that's progenitor's territory — route the agent-design question to progenitor (for now, via Aron) rather than inventing it here.
3. **Decide repo/agent structure.** Does this need a new submodule (or several)? Each submodule that will hold implementation gets its own soul-first child agent.
4. **Confirm fidelity.** Verify with the relevant steward that you are using each framework the way it's meant to be used. Record the confirmation.
5. **Name what's bespoke.** Anything not covered by a framework — justify why it must be bespoke rather than reinvention.

## Output

- A solution design: framework composition, agent-system needs, submodule/child-agent structure, confirmed framework-fit, and any justified bespoke parts.
- Feeds `plan-roadmap`, `make-submodule`, `create-submodule-agent`.

## Red flags

- Inventing architecture a framework already provides (reinvention — refuse).
- Guessing at a framework's behavior instead of asking its steward.
- A product-as-agent-system designed here from scratch instead of routed to progenitor.

## After completing

- Feed the roadmap and the submodule/agent creation steps.
- Record the framework-fit decisions in memory.