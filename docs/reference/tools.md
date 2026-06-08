---
title: MCP tool surface
description: The TheoryMCP tools a consumer or agent sees, grouped by job — discovery, knowledge, memory, mailbox, materialize, authoring, validate/publish, snapshots.
---

# MCP tool surface

This is a map, not a contract. **The exact tools on any route are server-resolved** — confirm first
with `describe_interface` on a namespace route, or `server_instructions` on an agent endpoint. Names
below match the platform's tools; availability depends on whether the route is a namespace, an agent,
or an authoring-enabled namespace draft route.

## Discovery & grounding

| Tool | Purpose | Where |
| --- | --- | --- |
| `describe_interface` | the tools, KBs, next steps, and convention for this route | **namespace · partner-namespace only** |
| `server_instructions` | the composed route-derived instruction text — ground agent endpoints with this | namespace · agent (all routes) |
| `list_knowledge_bases` | visible knowledge bases (name, display, topics, access tier) | namespace · agent |
| `bootstrap_identity` | routed identity, published/unpublished state, version, and a published **bundle** descriptor (format, checksum, `bundle_download_url`) — not soul/skill bodies | agent (when published) |
| `list_contactable_agents` | contactable agents after server-side narrowing — returns `agent_id`, `display_name`, `email_address` only | namespace · agent |

## Knowledge

| Tool | Purpose | Where |
| --- | --- | --- |
| `search_docs` | ranked search in a KB — **previews** (title, summary, snippet, relevance) | namespace |
| `get_unit` | authoritative full body for a `unit_id` | namespace |
| `query_knowledge` | agent-endpoint search (like `search_docs`; returns `doc_id`) | agent |
| `recall_units` | deterministic **metadata + adjacency** recall by id / source_ref / facet (no ranking) — *not* a full-body `get_unit` replacement | namespace · agent (when configured) |

→ How to use them: [Knowledge & search](/use/knowledge/).

## Agent memory

| Tool | Purpose | Where |
| --- | --- | --- |
| `memory_append` | append an entry for the authenticated user (server stamps the author) | agent |
| `memory_recent` | recent visible entries for the current user on this route | agent |
| `memory_get` | one entry by `memory_entry_id`, if owned by the current user | agent |

→ How it works: [Agent memory](/use/memory/).

## Mailbox (optional)

| Tool | Purpose |
| --- | --- |
| `email_list` · `email_get` · `email_get_content` | list / metadata / full inbound body |
| `email_mark_read` · `email_mark_unread` | toggle the read state of an inbound item |
| `email_send` · `email_reply` | send / reply under the agent's mailbox identity |
| `email_check_recipient` | pre-send recipient policy check |

→ Details: [Mailbox & email](/use/mailbox/).

## Install / materialize

| Tool | Purpose | Where |
| --- | --- | --- |
| `agent_local_install_plan` | host-specific install plan + checksummed pack (codex / claude_code / antigravity) | **namespace route**, selecting a child `agent_id` |

→ How to apply it: [Materialize an agent](/integrate/materialize/).

## Authoring — agent management *(namespace draft routes)*

| Tool | Purpose |
| --- | --- |
| `list_agents` | list active child agents in the namespace |
| `create_agent` | create a child agent (id, display name, optional initial instructions) |
| `get_agent_identity` · `update_agent_identity` | read / update agent identity |
| `agent_integrations_status` | email + GitHub integration status (read-only handoff) |

## Authoring — drafts (soul-first)

| Tool family | Purpose |
| --- | --- |
| `agent_soul_get` · `agent_soul_upsert` | the 5-concern identity — **authored first** |
| `agent_instructions_get` · `_upsert` · `_archive` | optional instructions overlay |
| `agent_skill_list` · `_get` · `_upsert` · `_archive` | skills (after the soul exists) |
| `agent_prompt_*` · `agent_template_*` · `lifecycle_pack_*` | prompts / templates / lifecycle packs *(graduation surface)* |
| `agent_install_layout_list` · `_get` · `_upsert` · `_archive` | ADL v2 layouts per host profile |
| `agent_install_profile_list` · `_get` · `_upsert` · `_archive` | reusable install profiles / client registration |

All draft writes are versioned and attributed; nothing here publishes. → [Compose a new agent](/author/compose/).

## Validate & publish

| Tool | Purpose |
| --- | --- |
| `agent_interface_publish` | the **publish gate** — validates the drafts, snapshots them; **requires `direct_user_authorization=true`** |
| `agent_interface_validate` | **post-publish** check — published-only installability for an active child agent + client profile (does not gate or expose drafts) |
| `agent_interface_status` | draft counts, last published version, installability per client |

## Snapshots & restore

| Tool | Purpose |
| --- | --- |
| `agent_interface_snapshot_list` · `_get` | browse / fetch immutable published versions |
| `agent_interface_snapshot_diff` | structural diff between two versions |
| `agent_interface_restore_from_snapshot` | copy a snapshot into drafts (rollback; needs authorization) |

→ Gates and rollback: [Validate & publish](/author/publish/).

## ADL v2 placeholders

Install-layout entries are **logic-less mustache templates** using only these placeholders; the
namespace substitutes them at render time. A literal route/scope/tenant baked into content is rejected
as an authority field.

{% raw %}
```text
{{soul}}              {{instructions}}        {{client_namespace}}   {{agent_id}}
{{skill.slug}}        {{skill.body}}          {{client_profile}}
{{file.skill_slug}}   {{file.path}}           {{file.body}}
{{mcp.url}}           {{mcp.server_name}}

for_each: "skills"               → one entry per published skill ({{skill.slug}} / {{skill.body}})
for_each: "skill_support_files"  → one entry per support file ({{file.*}})
```
{% endraw %}

The route appears **only** as `{% raw %}{{mcp.url}}{% endraw %}`. → [Compose a new agent](/author/compose/).
