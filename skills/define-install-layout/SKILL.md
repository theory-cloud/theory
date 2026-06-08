---
name: define-install-layout
description: Author the ADL v2 install layout(s) so the namespace can render the agent onto codex / claude_code / antigravity, via agent_install_layout_upsert. Theory authors entries[] of logic-less mustache templates (never rendered bytes) and the namespace renders the host forms server-side — no hand-scaffolding of .codex/.claude/.agents. Front-loads the two server rejection causes: unknown placeholders and authority fields baked into content.
---

# Define the install layout(s)

This is the Theory-native replacement for progenitor's per-host create-* emitters. Instead of
hand-scaffolding `.codex/build.sh`, `.claude/agents/*.md`, or an SDK directory, you author `entries[]`
of logic-less mustache templates per host profile, and the namespace renders the host forms. You own
the paths and the template bodies; the server owns identity, route, and rendering.

## When to use

- After `author-skills`, to make the authored agent installable on the host profiles named in the shape.

## When NOT to use

- Before the soul and skills exist as drafts.
- To bake any route / OAuth / tenant / entitlement value into content — that is rejected as an authority field.

## Inputs

- The target host profiles from the confirmed shape (subset of `codex`, `claude_code`, `antigravity`).
- The draft soul + skill set (so the layout's `{{soul}}` / `for_each: skills` entries resolve).

## Procedure

1. **Register the client profile in the namespace install-profile catalog FIRST.** A layout alone does
   not make an agent installable — the namespace install-profile catalog is the installability gate
   (verified: a published layout for an *unregistered* profile reports "not installable"). The built-ins
   `codex` and `claude_code` are server-owned and need nothing. For any non-built-in profile (e.g.
   `antigravity`), check `agent_install_profile_list`; if absent, register it with
   `agent_install_profile_upsert(client_profile, display_name, description)` (catalog metadata only —
   never publishes; route / OAuth / entitlement / server identity are refused). **Use a dash-FREE token,
   with underscores like the built-in `claude_code` — never a dash.** codex cannot consume an MCP server
   whose name contains a dash, and `agent_local_install_plan` normalizes a dashed token to underscores on
   lookup, so a token with a dash registers but never installs — even though `upsert`'s pattern
   technically permits dashes.
2. **Validate the token, then upsert the layout per host.** Confirm each `client_profile` is dash-free
   and matches `^[a-z0-9_-]+$`. Call `agent_install_layout_upsert(agent_id, client_profile,
   spec={spec_version: "agent-install-layout-v2", entries: [{path, content, for_each?, media_type?,
   required?, description?}]})`. Do NOT set `layout_version` — the server assigns it monotonically per
   profile. (`agent_interface_status` / `agent_interface_validate` report `supported_clients` = the
   install-profile catalog: the built-ins plus every registered custom profile, so a registered
   `antigravity` appears there.)
3. **Build each entry's content as a LITERAL logic-less mustache template** (never rendered bytes),
   using ONLY the whitelisted placeholders: `{{soul}}`, `{{instructions}}`, `{{skill.slug}}`,
   `{{skill.body}}`, `{{file.skill_slug}}`, `{{file.path}}`, `{{file.body}}`, `{{mcp.url}}`,
   `{{mcp.server_name}}`, `{{client_namespace}}`, `{{agent_id}}`, `{{client_profile}}`. Use
   `for_each: "skills"` to fan one entry over every published skill (`{{skill.slug}}` / `{{skill.body}}`)
   and `for_each: "skill_support_files"` for `{{file.*}}`. Keep the MCP **server name** dash-free too
   (the `[mcp_servers.<name>]` key / `{{mcp.server_name}}`) — `theorymcp` is the convention, again
   because codex rejects a dashed MCP name.
4. **Front-load the two rejection causes** (treat as hard checks): (1) any UNKNOWN placeholder is
   REJECTED; (2) any AUTHORITY FIELD baked into content is REJECTED — never put a literal MCP URL,
   OAuth scope, tenant, namespace, endpoint, entitlement, or server identity in content; route the MCP
   URL ONLY via `{{mcp.url}}`. Path-safety (no traversal / absolute escapes) is the only structural
   guardrail; otherwise you own the paths.
5. **Reuse the verified shapes as STARTING SHAPES, not transplants. CRITICAL skills-path rule:
   codex reads skills from the shared `.agents/skills/`, NOT `.codex/skills/` — there is no
   `.codex/skills/`. So BOTH the codex and antigravity layouts place skills at the SAME path,
   `.agents/skills/{{skill.slug}}/SKILL.md` (idempotent when both materialize into one dir). Only
   `claude_code` uses `.claude/skills/`. `.codex/` holds only `config.toml` + `steward.md`.**
   - **codex** — `.codex/steward.md` (`{{soul}}`); `.codex/config.toml` (`model_instructions_file` +
     `[mcp_servers.theorymcp]` `url = "{{mcp.url}}"`); skills at **`.agents/skills/{{skill.slug}}/SKILL.md`**
     (`for_each: skills`, `{{skill.body}}`) — NOT under `.codex/`.
   - **claude_code** — `.claude/output-styles/<agent>.md` (frontmatter `keep-coding-instructions:false`
     + `{{soul}}`); `.claude/settings.json` (`{"outputStyle":...}`); root `.mcp.json` (`{{mcp.url}}`);
     `.claude/skills/{{skill.slug}}/SKILL.md` (`for_each: skills`).
   - **antigravity** — `GEMINI.md` (`{{soul}}`, additive); `.agents/mcp_config.json` (mcp-remote bridge,
     `{{mcp.url}}`); `.agents/skills/{{skill.slug}}/SKILL.md` (`for_each: skills`).
   The rendered `{{skill.body}}` MUST itself begin with YAML frontmatter (`name` + `description`,
   delimited by `---`): there is no `{{skill.name}}`/`{{skill.description}}` placeholder, so a host
   silently skips any SKILL.md whose body lacks frontmatter (enforced upstream in `author-skills`).
6. **Keep local-vs-server templates in lockstep on the TEMPLATE, not the output.** The layout content
   shapes must match what `render-hosts.sh` implements (skill slug set + order, `{{soul}}` == SOUL.md,
   the host wrappers). Config files are intentionally NOT byte-identical: `render-hosts.sh` bakes the
   literal `ROUTE`, the layout uses `{{mcp.url}}`.
7. **Scope the profiles.** Author exactly the profiles the shape named. `codex`, `claude_code`, and any
   **registered** custom profile (e.g. `antigravity`) are all `agent_local_install_plan` render clients —
   the plan renders the full author-complete pack for each. For `antigravity`, the rendered
   `.agents/mcp_config.json` wires the route through the `mcp-remote` bridge (`setup-mcp-bridge`); that is
   its *runtime* connection method, separate from — and not a limit on — whether the pack renders (it does,
   once the profile is registered per step 1).

## Outputs

- An ADL v2 install layout authored per targeted host profile (validated profile strings, whitelisted
  placeholders only, no authority fields), so the namespace can render the agent onto its hosts.

## Red flags

- An unknown placeholder, or a literal route / scope / tenant / entitlement in content (both rejected).
- Authoring rendered bytes instead of a logic-less template.
- Placing skill entries under `.codex/skills/` — codex does NOT read it; codex skills live in the
  shared `.agents/skills/` (same paths as antigravity). A `.codex/skills/` layout materializes skills
  codex never loads. There is no `.codex/skills/`.
- A `{{skill.body}}` that lacks YAML frontmatter (`name` + `description`) — every host silently skips
  it, and the layout has no name/description placeholder to supply it.
- Authoring a layout for a non-built-in client WITHOUT first registering it in the install-profile
  catalog — uninstallable despite a perfectly valid layout.
- A dash in a `client_profile` token OR in an MCP server name — codex rejects a dashed MCP name, and a
  dashed token registers but never installs (the plan normalizes it to underscores). Use underscores
  (`claude_code`, `theorymcp`).
- A profile string that does not match the `^[a-z0-9_-]+$` pattern, or a typo'd profile that silently never renders.

## After completing

- Hand to `validate-and-publish` — the two-gate terminal step.
