# Make a submodule

A KeyBank product (or a substantial part of one) usually wants its own repo, coordinated from the parent the way factory/pci-factory coordinate product submodules. This skill creates that repo and pins it — and is followed by scaffolding the repo's soul-first agent.

## When to use

- The solution design calls for a dedicated product repo / submodule.

## When NOT to use

- The work is a small slice that belongs in an existing owned repo — implement it there directly.
- The design routed a product-as-agent-system to progenitor — don't create it here.

## Inputs

- The solution design (what this submodule is for, its boundary, its framework composition).
- The parent workspace structure and submodule conventions (mirror factory's `products/` shape where it fits).

## Procedure

1. **Name the submodule** clearly by product/responsibility.
2. **Create the repo** under the appropriate org/path, with a baseline (README, license, framework scaffolding via `apply-theory-framework`/`theory app init` as appropriate).
3. **Define its boundary** — what this repo owns, what it does not. Record it in the parent.
4. **Pin it in the parent** workspace (submodule pin / enumeration record), so the parent knows the exact commit it coordinates.
5. **Record contracts** this submodule exposes or consumes, if it shares boundaries with other repos — contracts before consumers.
6. **Hand to `create-submodule-agent`** to scaffold the repo's steward before substantial implementation lands.

## Output

- A created, pinned submodule repo with a recorded boundary and contracts.
- A parent enumeration/pin record updated.

## Red flags

- Creating a submodule without then giving it an agent (a repo that implements without a soul-first steward).
- Letting the first consumer define a cross-repo contract instead of naming it first.
- Patching a peer framework repo while "setting up" the submodule — never; coordinate instead.

## After completing

- Run `create-submodule-agent` for the new repo.
- Update the parent's repository enumeration / pins.