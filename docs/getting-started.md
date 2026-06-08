---
title: Getting started
description: Connect a host to a theorymcp.ai namespace, ground, and make your first knowledge query — in a few minutes.
---

# Getting started

This page takes you from nothing to your first answer out of a namespace. It assumes you have an AI
host — **codex**, **Claude Code**, or **Antigravity** — and a namespace route. If you just want to
try it, the public worked example is:

```text
https://theorymcp.ai/theorycloud/mcp
```

## Step 1 — Point your host at the route

The MCP server id is `theorymcp` in every host. Pick yours; the full matrix is on
[Connect a host](/connect/).

**codex** — in `.codex/config.toml`:

```toml
[mcp_servers.theorymcp]
url            = "https://theorymcp.ai/theorycloud/mcp"
oauth_resource = "https://theorymcp.ai/theorycloud/mcp"
scopes         = ["mcp:tools", "ai.kb.query"]
```

**Claude Code** — in the repo-root `.mcp.json`:

```json
{
  "mcpServers": {
    "theorymcp": { "type": "http", "url": "https://theorymcp.ai/theorycloud/mcp" }
  }
}
```

**Antigravity** — in `.agents/mcp_config.json`, through the bridge:

```json
{
  "mcpServers": {
    "theorymcp": { "command": "npx", "args": ["-y", "mcp-remote", "https://theorymcp.ai/theorycloud/mcp"] }
  }
}
```

## Step 2 — Authenticate

- **codex:** `codex mcp login theorymcp` (the configured server name) — completes browser OAuth natively.
- **Claude Code:** open `/mcp`, choose `theorymcp`, authenticate in the browser.
- **Antigravity:** the first connection opens a browser once; the [mcp-remote bridge](/connect/mcp-remote-bridge/) holds the token afterward.

{% capture auth_note %}
OAuth is **route-scoped**. The token you mint for `…/theorycloud/mcp` authorizes that route only. If
you later connect an agent endpoint like `…/agents/apptheory/mcp`, that is a distinct authorization.
{% endcapture %}
{% include callout.html type="info" title="One route, one authorization" content=auth_note %}

## Step 3 — Ground before you act

Never assume a namespace's tools. Paste this into your host:

```text
Ground me in the namespace at https://theorymcp.ai/theorycloud/mcp.
Call describe_interface and summarize the available tools, the visible knowledge bases,
whether agent installs are available, and the route-derived identity. Use only the tool
names describe_interface returns.
```

You'll get back the real tool surface for this route, the knowledge bases you can search, and your
resolved `client_namespace` / `endpoint_kind`.

## Step 4 — Ask the namespace something

Now query its knowledge. The pattern is **search first (previews), then fetch detail**:

```text
In the theorycloud namespace, list the knowledge bases, then search the most relevant one
for "<your question>". Show me the top results as previews (title + summary + relevance),
then call get_unit on the best match and answer my question from its authoritative body.
Cite the unit_id you used.
```

That's the whole loop: connect → authenticate → ground → query.

{% include figure.html src="/assets/img/edu/self-serve.webp" max="460"
   alt="Production self-serve — connect and operate without opening a cloud console"
   caption="The self-serve posture: you connect to a route and operate against it. No console, no per-capability account — the platform resolves entitlements server-side." %}

## What next?

- Want **continuity** across sessions and a named expert? → [Use an agent MCP](/use/memory/).
- Want an agent's soul and skills **as files in your project**? → [Integrate an agent](/integrate/).
- Want to **publish your own** agent into the namespace? → [Authoring (gated)](/author/).
- Want the prompts without the prose? → [Copyable prompt library](/reference/prompts/).
