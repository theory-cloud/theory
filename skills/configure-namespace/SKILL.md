---
name: configure-namespace
description: Point this workspace's theorymcp MCP server at a theorymcp.ai namespace route and complete per-host auth. Sets the route in the host's MCP config (codex .codex/config.toml, Claude Code root .mcp.json, Antigravity .agents/mcp_config.json via the mcp-remote bridge), then verifies the connection by grounding. Run this first when adopting the workspace or repointing it to a different namespace.
---

# Configure the workspace namespace

The setup step that comes *before* everything else: tell this workspace which theorymcp.ai namespace
it integrates, and get the host authenticated to it. The route is server-owned authority — you do not
synthesize it; you record the operator's chosen namespace and wire it into the host's MCP config.

## When to use

- First adoption of this workspace — before `discover-namespace`.
- Repointing the workspace from the shipped example namespace to the operator's own namespace.
- After a host upgrade or a fresh clone, to re-establish the `theorymcp` connection.

## When NOT to use

- To change *what* you install — that is `list-namespace-agents` + `materialize-agent`.
- To push anything *up* to the namespace — configuration is local wiring, not authoring.
- Per turn — configure once per workspace/host, then ground with `discover-namespace`.

## Inputs

- The namespace route the operator wants: `https://theorymcp.ai/<namespace>/mcp` (this repo ships
  pointed at `https://theorymcp.ai/theorycloud/mcp` as the worked example).
- Which host(s) this workspace runs under: `codex` | `claude_code` | `antigravity`.

> Confirm the route with the operator. Never invent a namespace, and never treat a route you guessed
> as authority — it resolves namespace identity, entitlement, and what is installable.

## Procedure

Configure only the host(s) in use. The MCP server id is **`theorymcp`** in every host config.

1. **codex** — in `.codex/config.toml`, set the `[mcp_servers.theorymcp]` block:
   ```toml
   [mcp_servers.theorymcp]
   url = "https://theorymcp.ai/<namespace>/mcp"
   oauth_resource = "https://theorymcp.ai/<namespace>/mcp"
   scopes = ["mcp:tools", "ai.kb.query"]
   ```
   Then authenticate: `codex mcp login https://theorymcp.ai/<namespace>/mcp` (the operator
   completes the browser OAuth). codex performs MCP OAuth natively.

2. **Claude Code** — in the repo-root `.mcp.json` (Claude Code reads project MCP config only from
   root), set:
   ```json
   { "mcpServers": { "theorymcp": { "type": "http", "url": "https://theorymcp.ai/<namespace>/mcp" } } }
   ```
   Authenticate from inside Claude Code via `/mcp` → authenticate `theorymcp` (browser OAuth). Claude
   Code performs MCP OAuth natively.

3. **Antigravity** — Antigravity speaks stdio MCP but **cannot perform the MCP OAuth flow**, so route
   `theorymcp` through the `mcp-remote` stdio bridge in `.agents/mcp_config.json`:
   ```json
   { "mcpServers": { "theorymcp": { "command": "npx", "args": ["-y", "mcp-remote", "https://theorymcp.ai/<namespace>/mcp"] } } }
   ```
   The bridge terminates OAuth on first connect (a browser window opens once). See `setup-mcp-bridge`
   for the full bridge recipe and troubleshooting.

4. **Verify.** Reconnect/restart the host so it reloads MCP config, then run `discover-namespace`
   (`describe_interface` on the route). A clean response with the expected `client_namespace` and tool
   list confirms the route + auth are wired correctly.

## Outputs

- The host's `theorymcp` MCP config pointed at the chosen namespace route, authenticated, and
  confirmed by a successful `describe_interface`.
- A short note of what was set: which host(s), which route, and the verified `client_namespace`.

## Red flags

- Synthesizing or guessing a namespace route instead of confirming it with the operator.
- Putting `.mcp.json` anywhere but the repo root for Claude Code (it is read only from root).
- Pointing Antigravity directly at the HTTPS route without the `mcp-remote` bridge — it will 401
  (Antigravity sends no bearer on `initialize`).
- Treating the route as authority you own — it is server-owned; you only record and wire it.
- Reporting "configured" without a verifying `describe_interface` round-trip.

## After completing

- Run `discover-namespace` to ground, then `list-namespace-agents` to choose what to materialize.
