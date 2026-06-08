---
name: setup-mcp-bridge
description: Configure the mcp-remote stdio OAuth bridge so a host that speaks stdio MCP but cannot perform MCP OAuth (e.g. Antigravity) can reach a theorymcp.ai route. mcp-remote runs as a local stdio MCP server, terminates the OAuth flow in a browser once, and proxies authenticated requests to the remote HTTP route.
---

# Set up the mcp-remote OAuth bridge

Some hosts speak stdio MCP but do not implement the MCP OAuth handshake — they send `initialize`
without a bearer and get a 401, and static bearer headers are dropped. **Antigravity is the case this
workspace targets.** The fix is a local OAuth-terminating bridge: `mcp-remote` runs as a stdio MCP
server the host can launch, performs the OAuth flow once in a browser, and proxies authenticated
calls to the remote HTTP route.

## When to use

- Wiring `theorymcp` for **Antigravity** (or any stdio-only, OAuth-incapable host).
- When `configure-namespace` reaches the Antigravity step.
- When a host's direct HTTP MCP connection 401s on `initialize` despite a valid route.

## When NOT to use

- For **codex** or **Claude Code** — both perform MCP OAuth natively; configure the HTTP route
  directly (`configure-namespace`). A bridge there is needless indirection.

## Inputs

- The namespace route: `https://theorymcp.ai/<namespace>/mcp`.
- A working `npx` (Node) on the machine; outbound network for the one-time browser OAuth.

## Procedure

1. In the host's stdio MCP config (Antigravity: `.agents/mcp_config.json`), register `theorymcp` as a
   command-launched server:
   ```json
   { "mcpServers": { "theorymcp": { "command": "npx", "args": ["-y", "mcp-remote", "https://theorymcp.ai/<namespace>/mcp"] } } }
   ```
2. Start/restart the host so it launches the bridge. On first connect, `mcp-remote` opens a browser
   for the OAuth flow; the operator approves. The token is cached locally by `mcp-remote` (under
   `~/.mcp-auth/` by default) and reused on later launches.
3. Confirm the bridge by running `discover-namespace` (`describe_interface`) through the host — a
   clean response with the expected `client_namespace` means the bridge authenticated and proxied
   correctly.

## Outputs

- `theorymcp` reachable from the OAuth-incapable host via the local `mcp-remote` bridge,
  authenticated once and cached, verified by a successful `describe_interface`.

## Red flags

- Hardcoding a static `Authorization` header instead of using the bridge — the host drops it and the
  call 401s.
- Pointing the host's HTTP MCP client straight at the route (no bridge) on an OAuth-incapable host.
- Using the bridge on a host that does OAuth natively (codex / Claude Code) — unnecessary.
- Assuming the bridge re-prompts every launch — the token is cached; a re-prompt signals a cleared or
  expired cache, not normal operation.

## After completing

- Return to `configure-namespace` step 4 (verify), then `discover-namespace` → `list-namespace-agents`.
