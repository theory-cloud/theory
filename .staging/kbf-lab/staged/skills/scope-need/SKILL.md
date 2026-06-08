# Scope a need

The chain begins here: **scope-need → enumerate-changes → plan-roadmap → create-project → implement.** Nothing downstream begins until the need is clear. This is the first place Eric sees his intent take a shape he can steer.

## When to use

- Eric describes something he wants — a product, a feature, a fix — in product/domain language.
- A Mode 1 change to keybank-factory itself is being considered.

## When NOT to use

- The need is already scoped and you are continuing into enumeration.
- The request is a one-line clarification, not new work.

## Inputs

- Eric's intent, in his own words.
- Relevant KeyBank context (consult `consult-keybank-knowledge` if the need touches KeyBank specifics).
- Prior decisions from memory.

## Procedure

1. **Restate the intent** back to Eric in plain language, so he can confirm you understood.
2. **Find the real need.** What problem does this solve? Who is it for (KeyBank, an integration engineer, an end customer)? What does success look like in product terms?
3. **Separate needs.** If the intent contains more than one need, name them separately — they may become separate projects.
4. **Surface the unknowns.** What do you not yet know that you must ask the ecosystem about (framework fit, platform capability)? Note them for `consult-framework-steward` / `consult-theory-mcp`.
5. **Name what's out of scope** for this need, explicitly.
6. **Produce a scoped-need statement** in plain language.

## Output

- A scoped-need statement: the need, who it's for, what success looks like, what's out of scope, and the open questions to resolve before enumerating.
- Confirmed with Eric before moving on.

## Red flags

- Jumping toward "how to build it" before the need is clear.
- A vague need ("make it better") — keep clarifying with Eric until it's specific.
- A multi-need request smuggled in as one — split it.

## After completing

- Hand to `enumerate-changes`.
- Record the scoped need in memory if it's a decision worth keeping.