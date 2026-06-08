# Enumerate changes

The scoped need becomes a flat, ordered list of focused changes — each small enough to understand, build, and review. This is where the shape of the work first becomes visible as discrete pieces Eric can follow.

## When to use

- A scoped need is confirmed and you are moving toward a roadmap.

## When NOT to use

- The need isn't scoped yet — go back to `scope-need`.
- You are already planning sequence/dependencies — that's `plan-roadmap`.

## Inputs

- The confirmed scoped-need statement.
- Solution direction, if `design-keybank-solution` has already run (it may run before or after enumeration for product work).
- Open questions to resolve via the ecosystem.

## Procedure

1. **List the changes.** Each change is one focused piece of work — a capability, a contract, a surface, a fix.
2. **Keep them focused.** A change you can't describe in a sentence is too big — split it.
3. **Order them.** Roughly, in the order they'd be built; precise sequencing comes in `plan-roadmap`.
4. **Mark the unknowns.** Which changes depend on an answer you must get from a framework steward or the platform? Flag them; resolve via `consult-framework-steward` / `consult-theory-mcp` before they block.
5. **Note framework fit per change** at a high level — which Theory Cloud framework each change leans on (detailed in `design-keybank-solution`).

## Output

- An ordered list of focused changes, each one sentence, with dependencies and open questions flagged.
- Legible to Eric — he can read the list and understand the work.

## Red flags

- Changes so large they're really projects — split them.
- Hidden changes ("and also wire up X") buried in another item — surface them.
- Enumerating implementation detail Eric can't follow — stay at the change level, not the code level.

## After completing

- Hand to `plan-roadmap`.