---
title: The mcp-remote bridge
description: How a host that speaks stdio MCP but cannot perform MCP OAuth (e.g. Antigravity) reaches a theorymcp.ai route through the mcp-remote bridge.
---

# The mcp-remote bridge

Some hosts speak **stdio** MCP but cannot run the **MCP OAuth** flow that a remote HTTP route
requires. Antigravity is the common case. The fix is a small local shim: `mcp-remote` runs as a
local stdio MCP server, performs the OAuth handshake in a browser once, and then proxies your
authenticated requests to the remote HTTP route.

```text
host (stdio)  ⇄  mcp-remote (local stdio MCP, holds OAuth)  ⇄  https://theorymcp.ai/theorycloud/mcp (HTTP)
```

## When you need it

- Your host can launch a stdio MCP **command** but has no built-in remote-MCP OAuth.
- You see the route configured but authentication never completes, or every call returns unauthorized.

If your host does MCP OAuth natively (codex, Claude Code), you do **not** need this — wire the route
directly per [Connect a host](/connect/).

## Configure it

Point the `theorymcp` server at the `mcp-remote` command and pass your route as its argument. For
Antigravity, in `.agents/mcp_config.json`:

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

`npx -y mcp-remote <route>` fetches and runs the bridge. On first connect a browser window opens for
you to approve; after that the bridge persists the authorization and refreshes it as needed.

{% capture persist %}
The bridge keeps refresh state in durable local state for the user that ran it. If you wipe that
state (fresh machine, cleared cache), the next connect re-opens the browser once. That's expected —
re-approve and continue.
{% endcapture %}
{% include callout.html type="info" title="The browser opens once" content=persist %}

## A copyable prompt

```text
My host (Antigravity) can't do MCP OAuth directly. Set up the mcp-remote stdio bridge for the
theorymcp server pointed at https://theorymcp.ai/theorycloud/mcp in .agents/mcp_config.json,
then walk me through the one-time browser authorization and confirm the route is reachable by
grounding (describe_interface).
```

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Browser never opens | `npx` can't reach the registry, or no display | Run with network access; on a headless box, follow the printed URL manually |
| Authorizes, then "unauthorized" later | refresh state not persisted | Ensure the bridge runs as a user with a writable home/state dir |
| Works in one repo, not another | per-route authorization | Each distinct route authorizes separately — approve the new one |
| Dashed server name rejected downstream | host/MCP naming rule | Keep the server id `theorymcp` (underscores elsewhere, e.g. `claude_code`) |

Once the bridge is up, the route behaves exactly like a natively-connected one — ground, then
[use the namespace](/use/knowledge/) or [an agent MCP](/use/memory/).
