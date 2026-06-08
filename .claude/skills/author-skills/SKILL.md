---
name: author-skills
description: Author the agent's skills (and at most one optional draft instructions overlay) into the namespace via agent_skill_upsert, AFTER the soul exists — tools follow identity. Each skill is written in Theory's strict house-style SKILL.md shape; a skill missing its When-NOT-to-use or Red flags section is rejected here, not just by the server. Skips prompts/templates/lifecycle packs — those are graduation surface.
---

# Author the skills

Tools follow identity. The soul is already in the namespace; now each skill is written against the
agent the soul shaped. This is the Theory-native replacement for the skill-content half of
progenitor's per-host create-* emitters — minus all per-host scaffolding, because the install layout
(`define-install-layout`) renders the hosts.

## When to use

- After `author-soul` has successfully upserted the agent's draft soul, to write its skills.

## When NOT to use

- Against an agent with no soul yet (soul-first order — refuse).
- To author prompts, templates, or lifecycle packs — those are graduation surface; name the boundary.
- To publish — `agent_skill_upsert` writes drafts only.

## Inputs

- A draft soul already upserted for this `agent_id`.
- The skill set implied by the confirmed shape (slug + purpose + procedure for each).

## Procedure

1. **Confirm soul-first order.** Confirm the soul is already upserted for this `agent_id`; refuse to
   author skills against a soulless agent.
2. **Write each skill in the strict house style:** frontmatter (`name` + `description` only), then a
   one-line intent paragraph, `## When to use`, `## When NOT to use`, `## Inputs`, `## Procedure`
   (numbered), `## Outputs`, `## Red flags`, `## After completing`. A skill missing its
   When-NOT-to-use or Red flags section is rejected by this skill, not just the server.
3. **Upsert once per skill:** `agent_skill_upsert(agent_id, skill_id` (stable, idempotent — reusing it
   updates in place)`, slug` (the `{{skill.slug}}` render key; matches the local dir name)`, name`
   (frontmatter name)`, body` (full SKILL.md text including frontmatter + house-style sections)`,
   description, display_order)` to preserve the soul's canonical flow order. Draft only; never publishes.
4. **Keep drafts coherent.** Reject skills that contradict the soul's boundaries, or skill access that
   contradicts the agent's stated identity. If a previously-authored skill is being dropped, call
   `agent_skill_archive` — do NOT just omit it, or it lingers in drafts and desyncs the
   `for_each: skills` layout fanout.
5. **Optional overlay.** Optionally call `agent_instructions_upsert` ONCE for a draft-only host-facing
   overlay note. That single overlay is the limit — skip prompts / templates / lifecycle packs; if the
   operator asks for them, name the graduation boundary.

## Outputs

- Every skill from the confirmed shape upserted as a draft in house style, in canonical
  `display_order`, coherent with the soul's boundaries; archived any dropped skills; at most one
  optional draft instructions overlay.

## Red flags

- Authoring skills before the soul exists.
- A skill missing When-NOT-to-use or Red flags, or one that contradicts the soul's boundaries.
- Omitting a dropped skill instead of `agent_skill_archive` (it desyncs the layout fanout).
- Authoring prompts / templates / lifecycle packs — graduation surface, not get-started.
- A skill `body` that omits its YAML frontmatter (`name` + `description`, delimited by `---`). The
  install layout renders `{{skill.body}}` verbatim and has NO `{{skill.name}}`/`{{skill.description}}`
  placeholder, so a frontmatter-less body becomes a SKILL.md that codex / claude / antigravity all
  silently skip. Frontmatter lives IN the body — this is why step 2/3 require it.

## After completing

- Hand to `define-install-layout` to author the ADL v2 layouts so the namespace can render the hosts.
