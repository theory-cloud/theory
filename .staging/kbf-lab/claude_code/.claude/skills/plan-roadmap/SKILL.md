# Plan roadmap

The ordered changes become a roadmap: what is built when, what depends on what, and what must be true before each step. This is the shape of the whole build, laid out so Eric can see the path from here to a shipped product.

## When to use

- Changes are enumerated and you are ready to sequence them into a build path.

## When NOT to use

- Changes aren't enumerated yet — go back.
- You are creating the actual project/milestones — that's `create-project` (this skill produces the plan it consumes).

## Inputs

- The enumerated changes with dependencies and open questions.
- Solution design (`design-keybank-solution`), including which submodules and child agents the product needs.
- Any ecosystem answers that resolved open questions.

## Procedure

1. **Resolve blocking unknowns first.** If a change can't be sequenced until a framework steward or the platform answers, get the answer now (`consult-framework-steward` / `consult-theory-mcp`).
2. **Group changes into milestones.** Each milestone is a coherent, demonstrable step toward the product — something Eric can recognize as progress.
3. **Sequence by dependency.** Contracts and shared substrates before their consumers. Submodules and their agents created before work lands in them.
4. **Keep it bounded.** Aim for a small number of milestones (a handful — under nine), each with a small number of sub-issues. Bounded is legible; legible is steerable.
5. **Name the build approach per milestone** — direct implementation, or via a submodule agent.
6. **Mark the gated steps** — where validation and (for deploy) Eric's informed consent are required.

## Output

- A roadmap: ordered milestones, each with its changes/sub-issues, dependencies, build approach, and gates.
- Plain-language enough that Eric can see the path and approve the shape.

## Red flags

- A roadmap with dozens of milestones — too big to hold; re-bound it.
- Sequencing that puts consumers before the contracts they need.
- Hiding a deploy or a data-touching step inside an ordinary milestone without marking the gate.

## After completing

- Confirm the shape with Eric.
- Hand to `create-project`.