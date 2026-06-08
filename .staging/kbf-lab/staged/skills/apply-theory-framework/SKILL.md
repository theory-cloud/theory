# Apply a Theory framework

The frameworks are half of the code-making machine — they make AI-built code deterministic. This skill is how you use them as they're meant to be used, rather than reinventing what they already provide.

## When to use

- Implementing a change that a Theory Cloud framework provides for.
- Scaffolding a submodule on framework substrate.

## When NOT to use

- The need genuinely falls outside every framework (justify the bespoke path in `design-keybank-solution`).
- You're deciding overall architecture — that's `design-keybank-solution`; this skill applies a chosen framework.

## Inputs

- The change to implement and its framework fit (from the solution design).
- The framework's current contracts and patterns — read them; **ask the framework's steward** (`consult-framework-steward`) when the right usage is unclear.

## Procedure

1. **Pick the framework** that owns this capability. Don't spread one concern across hand-rolled code when a framework covers it.
2. **Read its current shape** — its contracts, conventions, and intended usage as they exist now (not as you remember them).
3. **If unsure, ask** the framework's steward a concrete question before writing. Guessing here is how determinism leaks out.
4. **Apply it faithfully** — follow the framework's patterns; don't bend it into a shape it doesn't support, and don't normalize its awkwardness behind a local hack (that's a signal to ask, not to patch).
5. **If the framework is missing something** the product needs, do not patch the framework repo. **Request** the change through its steward and record the dependency.
6. **Validate** that the framework is doing the work (not a parallel bespoke reimplementation alongside it).

## Output

- Implementation that rests on the framework as intended, with any framework-change requests recorded.

## Red flags

- Reimplementing what a framework provides (reinvention — refuse).
- Hand-patching a vendored framework or the framework's own repo (invasion — refuse; request instead).
- Faking framework behavior to move faster.

## After completing

- Continue the milestone implementation.
- Record any framework-change requests and the steward's response.