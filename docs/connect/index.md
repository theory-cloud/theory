---
title: Connect a host
description: The exact MCP configuration and OAuth flow for codex, Claude Code, and Antigravity — one server id, one route knob.
---

# Connect a host

Connecting is the same idea on every host: register an MCP server named **`theorymcp`** pointed at
your namespace route, then complete OAuth. Only two things ever change — **where** the host reads MCP
config, and **how** it performs (or can't perform) the OAuth flow.

{% capture authority %}
The route is **server-owned authority**. Don't synthesize it, and don't treat a route you guessed as
if it grants anything — it resolves your namespace identity, entitlement, and what is installable.
Confirm the exact route with whoever owns the namespace before wiring it in.
{% endcapture %}
{% include callout.html type="warn" title="Confirm the route first" content=authority %}

## codex

codex performs MCP OAuth natively. In `.codex/config.toml`:

```toml
[mcp_servers.theorymcp]
url            = "https://theorymcp.ai/theorycloud/mcp"
oauth_resource = "https://theorymcp.ai/theorycloud/mcp"
scopes         = ["mcp:tools", "ai.kb.query"]
```

Then authenticate (a browser window opens for you to approve). `codex mcp login` takes the
**configured server name**, not the URL:

```text
codex mcp login theorymcp
```

{% capture scopes %}
The `scopes` above (`mcp:tools`, `ai.kb.query`) cover namespace tools and knowledge queries. If you
pin scopes by hand for an **agent endpoint** and want the agent to write memory, also include
`memory.append` — otherwise `memory_append` calls fail closed. On routes where scopes aren't pinned
manually, the route's default scope set already covers this.
{% endcapture %}
{% include callout.html type="info" title="Scopes for agent memory" content=scopes %}

## Claude Code

Claude Code reads **project** MCP config only from the repo root `.mcp.json` and performs MCP OAuth
natively:

```json
{
  "mcpServers": {
    "theorymcp": {
      "type": "http",
      "url": "https://theorymcp.ai/theorycloud/mcp"
    }
  }
}
```

Then authenticate from inside Claude Code: open `/mcp`, select `theorymcp`, and complete the browser
OAuth.

## Antigravity

Antigravity speaks stdio MCP but **cannot perform the MCP OAuth flow itself**, so it reaches the
route through the `mcp-remote` stdio bridge. In `.agents/mcp_config.json`:

```json
{
  "mcpServers": {
    "theorymcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://theorymcp.ai/theorycloud/mcp"]
    }
  }
}
```

The bridge terminates OAuth in a browser on first connect and proxies authenticated requests
afterward. See [The mcp-remote bridge](/connect/mcp-remote-bridge/) for setup and troubleshooting.

## A copyable prompt

If your host already has the steward skills (this repo ships them), you can just ask:

```text
Configure this workspace's theorymcp MCP server to point at
https://theorymcp.ai/theorycloud/mcp for <codex | claude_code | antigravity>.
Set the route in the right host config, walk me through authentication, then verify the
connection by grounding (describe_interface). Do not invent the route — use exactly the one above.
```

## After you connect

| Pitfall | What happens | Fix |
| --- | --- | --- |
| Dashes in the server name | codex rejects a dashed MCP server id | Keep it `theorymcp` (and host/client names use underscores, e.g. `claude_code`) |
| Claude Code MCP config in a subfolder | not picked up | It must live in the **repo root** `.mcp.json` |
| Antigravity configured as plain HTTP | OAuth never completes | Route it through `mcp-remote` (see the bridge page) |
| Token for one route used on another | tools missing / access denied | Authorize each route you use — OAuth is route-scoped |

Connected? Always [ground next](/how-it-works/#always-ground-first), then go
[use a namespace](/use/knowledge/) or [an agent MCP](/use/memory/).
