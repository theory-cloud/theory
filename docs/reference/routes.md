---
title: Route shapes
description: The full TheoryMCP routing reference — namespace, partner, and agent routes, lab vs live, and why the route is the identity.
---

# Route shapes

In TheoryMCP, **the route is the identity**. You connect to the route for the thing you want, and the
platform resolves tenant, namespace, partner, agent, scope, and tool exposure from the path plus your
authenticated token. You never pass those as tool fields.

## The four shapes

| Route | Endpoint kind | What you get |
| --- | --- | --- |
| `/{namespace}/mcp` | `namespace` | shared knowledge surface, mostly read-only |
| `/{namespace}/partners/{partner}/mcp` | `partner_namespace` | the namespace narrowed to a partner partition |
| `/{namespace}/agents/{agent}/mcp` | `agent` | an agent endpoint — memory, mailbox, published interface |
| `/{namespace}/partners/{partner}/agents/{agent}/mcp` | `partner_agent` | a partner-scoped agent endpoint |

## Live vs lab

| Environment | Base |
| --- | --- |
| **live** | `https://theorymcp.ai/...` |
| **lab** | `https://lab.theorymcp.ai/...` |

The same four shapes apply in both. Lab and live are distinct authorities — a token for one is not a
token for the other.

## Worked examples

```text
https://theorymcp.ai/theorycloud/mcp
https://theorymcp.ai/theorycloud/agents/apptheory/mcp
https://theorymcp.ai/theorycloud/partners/keybank/mcp
https://theorymcp.ai/theorycloud/partners/keybank/agents/apptheory/mcp
https://lab.theorymcp.ai/theorycloud/agents/mcpserver/mcp
```

## The identifiers

| Term | Meaning | Example |
| --- | --- | --- |
| `client_namespace` | the public routing slug | `theorycloud` |
| `partner_id` | optional route-level narrowing | `keybank` |
| `agent_id` | the stable agent slug inside a namespace | `apptheory` |
| `endpoint_kind` | what the route resolved to | `namespace` · `agent` · … |

These are **route-derived**: the server resolves them from the path. You read them back (e.g. from
`describe_interface`); you never synthesize them from input.

## Authorization is route-scoped

{% capture scoped %}
OAuth is per-route. A token minted for `…/theorycloud/mcp` authorizes that route only — connecting to
`…/agents/apptheory/mcp` is a distinct authorization. Refresh-token families are never shared across
distinct routes, and lab ≠ live. If tools are missing or access is denied, check that you authorized
the **exact** route you're calling.
{% endcapture %}
{% include callout.html type="info" title="One route, one authorization" content=scoped %}

## Picking a route

- **Read-only knowledge, no memory** → the namespace route `/{namespace}/mcp`.
- **Continuity, a named expert, memory, an installable interface** → an agent route `/{namespace}/agents/{agent}/mcp`.
- **A partner-narrowed view of either** → add `/partners/{partner}` before `/mcp` or `/agents/...`.

→ Wire one up: [Connect a host](/connect/). → The reasoning behind it: [How it works](/how-it-works/).
