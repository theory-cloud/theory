# Implement a milestone

This is where software gets made. Because no engineer sits beneath you, you implement — directly, or through the soul-first agents you created. Either way, the work stays bounded and reviewable, and the peer/owned boundary holds.

## When to use

- A project exists with bounded milestones/sub-issues and you are building one.

## When NOT to use

- The work isn't scoped/planned yet — run the chain first.
- The change belongs in a peer framework repo — request it through the steward; do not implement it.

## Inputs

- The milestone/sub-issue, with its plain-language goal and technical specifics.
- The solution design and framework fit (`apply-theory-framework`).
- The owning repo (an owned KeyBank product repo) or the submodule agent that will implement.

## Procedure

1. **Confirm ownership.** The target is a KeyBank product repo you own, or a submodule whose agent you created. If the change is really in a peer framework repo, stop — request it instead.
2. **Choose the path:**
   - **Direct:** implement in the owned repo, applying the right framework (`apply-theory-framework`).
   - **Via submodule agent:** give the submodule agent **one bounded assignment** — one milestone, one allowed write scope, named contracts, validation commands, one PR target, explicit exclusions. The agent implements; it does not infer follow-on work.
3. **Stay within scope.** Build the sub-issue, not the things around it. Unscoped extras become new sub-issues, not silent additions.
4. **Keep contracts first.** If this milestone shares a boundary with another repo, the contract is named before the dependent code.
5. **Prepare for validation.** Implementation isn't done until it can pass real gates; set up what `validate-keybank-product` will check.

## Output

- A built milestone/sub-issue (a PR or change in an owned repo), within scope, on framework substrate, ready for validation.

## Red flags

- Reaching into a peer framework repo because the fix is visible there (invasion — refuse).
- Unbounded assignments to a submodule agent ("handle whatever else you find").
- Declaring the milestone done before validation.
- Implementing past the scoped sub-issue.

## After completing

- Hand to `validate-keybank-product`.
- If via a submodule agent, review its output before assigning the next bounded piece.