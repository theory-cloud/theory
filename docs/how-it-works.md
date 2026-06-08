---
title: How it works
description: The mental model behind theorymcp.ai — the route is the identity, the namespace is the source of truth, and every host comes up the same way.
---

# How it works

TheoryMCP is the multi-tenant MCP surface behind `theorymcp.ai`. Before you connect anything, it
pays to hold four ideas in your head. They are small, and everything else on this site is a
consequence of them.

## 1 · The route is the identity

You do **not** tell the server which tenant, namespace, partner, or agent you want through JSON
fields in a tool call. You connect to the **route** for the thing you want, and the platform
resolves the rest server-side from the path and your authenticated token.

| Route shape | What it is |
| --- | --- |
| `https://theorymcp.ai/{namespace}/mcp` | the shared **namespace** surface — mostly read-only knowledge |
| `https://theorymcp.ai/{namespace}/partners/{partner}/mcp` | the namespace narrowed to a **partner** partition |
| `https://theorymcp.ai/{namespace}/agents/{agent}/mcp` | an **agent endpoint** — memory, mailbox, published interface |
| `https://theorymcp.ai/{namespace}/partners/{partner}/agents/{agent}/mcp` | a partner-scoped agent endpoint |

The same shapes exist in lab under `https://lab.theorymcp.ai/...`.

{% capture why_route %}
A token for one route is **not** a free pass to another route. Scope, entitlements, the visible
knowledge bases, and which tools are exposed are all derived server-side from the route plus your
identity. Sending extra fields in a tool call does not widen what you can see or do.
{% endcapture %}
{% include callout.html type="info" title="Authority is server-owned" content=why_route %}

## 2 · The namespace is the source of truth

When you pull an agent down into a workspace, the local files are a **materialization** of what the
namespace published — never the other way around. If local and namespace ever disagree, the
namespace wins and you re-materialize. You don't "fix" the namespace by editing a local file and
calling it sync.

This single rule is why the integration flow looks the way it does: plan → fetch → **verify every
checksum** → write a marker, so a later update can tell exactly what changed upstream.

## 3 · The server returns guidance and bytes; you write the files

TheoryMCP never writes your filesystem. It hands your host a plan, a checksummed pack, and a layout
convention. Your host reviews, writes, and applies. That division is the contract that keeps the
namespace authoritative and the workspace honest — and it's why a half-materialized install is
treated as a failure, not a smaller success.

{% include figure.html src="/assets/img/edu/fragmentation-tax.webp" max="470"
   alt="The fragmentation tax — many accounts versus one coherent operating model"
   caption="Without a control plane, every capability is a separate account, secret, and dashboard. A namespace compresses that sprawl into one routed, authenticated surface." %}

## 4 · Two endpoint kinds, two postures

**Namespace endpoint** — the low-friction, mostly read-only surface. Reach for it when you want
knowledge retrieval, no conversational memory, and the simplest possible tool set.

**Agent endpoint** — the richer surface. It inherits the namespace context and adds append-only
memory, an optional mailbox, and optional published interface resources. Reach for it when you want
continuity across sessions or a named product/domain expert.

| Tool family | Namespace | Agent |
| --- | --- | --- |
| `list_knowledge_bases`, `search_docs` / `query_knowledge`, `get_unit` | yes | yes |
| `list_contactable_agents` | often | often |
| `memory_append` / `memory_recent` / `memory_get` | — | yes |
| `email_*` (mailbox) | — | only when enabled |
| `bootstrap_identity` / published interface | — | only when published |
| `agent_local_install_plan` (materialize) | yes — selects a child `agent_id` | — |

Grounding differs by route too: namespace routes expose **`describe_interface`**; agent endpoints
ground with **`server_instructions`** (plus `bootstrap_identity` when the agent has a published
interface).

## The three modes — never bundled

Everything you do falls into one of three modes, and a careful workflow keeps them distinct:

1. **Integrate** — configure, discover, materialize, verify, update. *Local* changes; the namespace does not.
2. **Operate** — use the materialized agents and the namespace's knowledge to do real work. No install happens as a side-effect.
3. **Author** *(gated)* — push local content *up* into the namespace as drafts, then publish. Off by default; opened only by an explicit grant; the publish is human-authorized **per publish** and validates the drafts as it snapshots them.

A materialization is not a side-effect of operating; operating is not a side-effect of installing;
an authoring push is not a side-effect of either.

## Always ground first

The first thing any session does — before listing, installing, or answering a substantive request —
is **ground** in the namespace:

```text
Ground me in the namespace at https://theorymcp.ai/theorycloud/mcp.
Call describe_interface, then summarize: the available tools, the visible knowledge bases,
whether installs are available, and the route-derived identity (client_namespace, endpoint_kind).
Do not assume any tool name — use what describe_interface returns.
```

Why it matters: a namespace tells you its own tool names, resource families, and knowledge bases.
Assuming them from memory is how you end up calling a tool that doesn't exist on this route, or
missing one that does.

{% include figure.html src="/assets/img/edu/the-concept.webp" max="430"
   alt="Theory Cloud: the concept — from AI code drift to deterministic systems"
   caption="The big idea: constrain the design space, then put a persistent, authenticated identity in front of it. That identity is what you reach through an MCP route." %}

## Where to go next

- **[Getting started](/getting-started/)** — connect a host and make your first call in a few minutes.
- **[Connect a host](/connect/)** — the exact MCP config for codex, Claude Code, and Antigravity.
- **[Route shapes](/reference/routes/)** — the full routing reference.
- **[Copyable prompt library](/reference/prompts/)** — every prompt on this site, in one place.
