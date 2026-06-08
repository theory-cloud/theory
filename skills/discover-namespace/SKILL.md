---
name: discover-namespace
description: Ground in a theorymcp.ai namespace before doing anything else. Calls describe_interface (and server_instructions) on the routed namespace MCP to learn available tools, resource families, visible knowledge bases, installer availability, and the bootstrap convention. Run this first in any namespace-integration flow.
---

# Discover a namespace

The mandatory first step. Never assume a namespace's tool names, resource families, knowledge bases, or installer availability — discover them from the route.

## When to use

- Starting any work against a theorymcp.ai namespace MCP.
- Before `list-namespace-agents` / `materialize-agent`.
- After reconnecting, to reconfirm the served interface.

## When NOT to use

- As a per-turn ritual once you've grounded this session — re-run on reconnect or suspicion, not every call.

## Inputs

- The namespace MCP route (e.g. `https://theorymcp.ai/<namespace>/mcp`), connected and authenticated in your host.

## Procedure

1. Call `describe_interface` on the routed namespace endpoint. Read: `available_tools`, `resource_families`, visible `knowledge_bases`, `next_steps`, and the `server_instructions_convention` (the shared bootstrap convention).
2. Call `server_instructions` if you need the full route-derived convention text.
3. Note installer availability and the authoring workflow from `next_steps`. Use the returned tool names — do not assume names from memory.
4. Identify the route-derived authority (`client_namespace`, `endpoint_kind`). These are server-owned; never synthesize them from caller input.

## Outputs

- A short grounding note: the namespace, its tools, knowledge bases, installer availability, and the fact that the namespace is the source of truth.

## Red flags

- Calling list / install / author tools before `describe_interface`.
- Assuming a tool name instead of using the returned `available_tools`.
- Inventing endpoint identity from caller input rather than reading it from the route.

## After completing

- Proceed to `list-namespace-agents` to choose an agent (or query the namespace's knowledge bases directly via the discovered `query_knowledge` tool).
