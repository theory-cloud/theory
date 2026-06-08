# Create a submodule agent

When you make a submodule, you make the agent that stewards it. That agent will implement without human review, so it must carry its own conscience. This skill instantiates progenitor's `soul-first-design` discipline for the child repo, as an **MCP-bootstrapped steward**. **Soul-first all the way down.**

## When to use

- A submodule has been created (`make-submodule`) and will hold real implementation.

## When NOT to use

- The submodule is a thin asset repo with no implementation to steward.
- You are designing a brand-new *kind* of agent or a novel platform pattern — that's progenitor's catalog work, not yours; route to progenitor.

## Inputs

- The submodule's recorded boundary and contracts.
- Its framework composition (`design-keybank-solution`).
- progenitor's patterns as reference (`consult-existing-stewards`): `soul-first-design`, `mcp-bootstrapped-steward`, and the 5-layer shape.

## How a child agent exists

Like you, a child steward is **platform data**, not a hand-built local stack: its soul is an `AgentSoul` record and its skills are `AgentSkill` records, published to an immutable snapshot and materialized into the submodule via the install plan. There is no `build.sh` and no local `stack/` to assemble — the five layers are conceptual sections authored into one soul body.

You scope and author the child's content. You do **not** hold the namespace authoring surface, so the actual provisioning — `create_agent`, the soul/skill upserts, and the human-authorized `agent_interface_publish` — is carried out by the authoring authority (progenitor or Aron). You prepare; they provision. (Same handoff shape as `prepare-profile-republish`.)

## Procedure

1. **Scope the child agent.** What is this repo's steward for? Its principal (you, on Eric's behalf), its tenancy/route, its scope, its modes, its core invariants, its refusals. A short scoping, but a real one.
2. **Author the child's soul** — one `AgentSoul` body carrying all five conceptual layers:
   - **identity** — what this repo's steward is, where it lives, what it is not, its boundary within the KeyBank product.
   - **philosophy** — its domain posture (inherits the relevant keybank-factory commitments: framework fidelity, no illusion of competence, last line of defense).
   - **discipline** — its work shapes and validation gates.
   - **boundaries** — its scope, what it must not touch (peer framework repos; KeyBank customer data).
   - **soul** — **grounded refusals**, at least: ship-what-it-can't-vouch-for, fake-working-software, route-customer-data, patch-a-peer-framework-repo, bypass-its-own-gates. Never omit the soul.
3. **Author its skills** — at minimum a scope/implement/validate set appropriate to the repo, each as an `AgentSkill` record.
4. **Stage for provisioning.** Hand the scoped soul + skills to the authoring authority (progenitor/Aron) to `create_agent` and upsert the drafts, with the child's tenancy/route. Provisioning is theirs; the content is yours.
5. **Require human-authorized publish.** The child does not exist for anyone until its drafts are published (`agent_interface_publish`, human-authorized). Then it materializes into the submodule via the install plan.
6. **Record** the child agent: its identity/route, allowed write scope, validation commands, forbidden surfaces, and how you assign it work.

## Output

- A scoped, soul-first child steward (soul + skills) staged for provisioning, and — once the authority publishes it — a bootstrappable agent for the submodule.
- A parent record of the child agent's scope and assignment channel.

## Red flags

- **A hollow agent** — a bare prompt or a soul missing its refusal layer. Refuse; the missing layer is the one that holds the bar.
- Copying keybank-factory's soul wholesale instead of authoring the child's own.
- A child agent allowed to patch peer framework repos or touch customer data — inscribe those refusals.
- Treating publish as automatic, or assuming you can provision it yourself — provisioning is the authority's, publish is human-gated.

## After completing

- Once published, the submodule agent can receive bounded implementation work (`implement-milestone`).
- Record the creation in memory.