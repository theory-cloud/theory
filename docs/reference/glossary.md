---
title: Glossary
description: The vocabulary of theorymcp.ai — namespace, agent, soul, skills, install layout, snapshot, knowledge base, memory, and the gates.
---

# Glossary

The terms you'll meet across this site, in one place.

## Routing & identity

**Namespace** — a routed, multi-tenant compartment in theorymcp.ai, identified by a public slug
(`client_namespace`, e.g. `theorycloud`). Its base route is `/{namespace}/mcp`. → [Route shapes](/reference/routes/)

**Agent** — a named endpoint inside a namespace, with a stable `agent_id` and route
`/{namespace}/agents/{agent_id}/mcp`. Inherits namespace capabilities and adds memory, optional
mailbox, and an optional published interface. → [Contactable agents](/use/agents/)

**Steward** — an agent that represents a product, system, or domain — a durable expert, not a
throwaway chat.

**Partner** — an optional route-level narrowing (`partner_id`) that scopes a namespace or agent to a
partner partition.

**The route is the identity** — you connect to the route for what you want; the server resolves
tenant, namespace, partner, agent, scope, and tool exposure from the path + your token. You don't
pass those as fields.

**Route-scoped authorization** — an OAuth token authorizes one route only; lab and live, and each
distinct route, are separate authorities.

## Knowledge

**Knowledge base (KB)** — a curated, searchable, ranked collection of domain knowledge managed by
KnowledgeTheory. → [Knowledge & search](/use/knowledge/)

**Unit** — a single knowledge item (`unit_id`, title, summary, body, citations, related). `search_docs`
returns previews; `get_unit` returns the authoritative body.

**Contract pack** — a knowledge base for a regulated domain (financial products, API specs, legal
frameworks), read through the same knowledge tools under stricter access policy.

## Memory

**Memory** — append-only, deterministic, agent-routed, subject-scoped continuity on an agent endpoint.
Two users on the same agent don't share it; the same user keeps it across sessions and across a change
of model. → [Agent memory](/use/memory/)

**`memory_entry_id`** — the server-generated id returned by a write.

**`author_subject_id`** — the authenticated identity the server stamps onto entries; clients never
supply it.

## Interface (what an agent publishes)

**Soul** — the agent's canonical identity, a 5-concern document (identity · philosophy · discipline ·
boundaries · refusal-list). Authored **first**; immutable once part of a published snapshot.

**Skill** — an authored capability with a slug and body. Authored only **after** the soul exists.

**Instructions** — an optional single overlay of instruction text.

**Install layout (ADL v2)** — the host-specific mapping from interface artifacts to client file
paths, expressed as **logic-less mustache templates** with whitelisted placeholders. The namespace
renders the host forms; you don't hand-scaffold them. → [MCP tool surface](/reference/tools/#adl-v2-placeholders)

**Install profile** — a reusable bundle of layouts and client selections; also where a non-built-in
client is registered.

## Materialize (namespace → local)

**Materialization** — local files written from a published agent. The local copy is downstream; the
namespace is the source of truth.

**Install plan** — the output of `agent_local_install_plan`: the manifest (paths + `sha256`), the pack
resource, merge instructions, and installability status.

**Install pack** — the checksummed zip of rendered files. Fetched **to disk**, never through model
context.

**Download grant** — a single-use, short-lived, header-free `download_url` for the pack. Consumed on
first use; mint a fresh plan if a download fails.

**Install marker** — the local record of what version is installed, so updates can compare. →
[Materialize an agent](/integrate/materialize/)

## Publish (local → namespace, gated)

**Draft** — mutable, versioned, attributed content not visible to consumers.

**Published snapshot** — the immutable, append-only result of a publish; identified by an
auto-incrementing `published_version`.

**Publish** — `agent_interface_publish`, the single server-side gate; it **validates the drafts** and
snapshots them, and requires `direct_user_authorization=true` **per publish**.

**Validate** — `agent_interface_validate`, a **post-publish** check of *published-only* installability
for an active child agent + client profile. It does not gate or expose drafts. Pair with
`agent_interface_status`.

**Authoring scope** — the deliberate, session-scoped grant that opens the **draft** surface; a
**workspace discipline**, not a server-side scope claim, and never standing publish authority. →
[Authoring & the gates](/author/)

**Replication** — a verbatim copy of an existing published agent into another namespace; composes
nothing, keeps every gate. → [Replicate](/author/replicate/)

**Restore from snapshot** — copies a published snapshot back into drafts for a re-publish (rollback);
needs authorization, and is followed by a separate publish.

## Hosts

**codex · Claude Code · Antigravity** — the three supported host profiles. The soul mounts as the
system prompt (codex, Claude Code) or always-on workspace rules (Antigravity); the `theorymcp` MCP
server is wired per host. → [Connect a host](/connect/)

**mcp-remote bridge** — a local stdio shim that lets a host without native MCP OAuth (Antigravity)
reach a route. → [The mcp-remote bridge](/connect/mcp-remote-bridge/)
