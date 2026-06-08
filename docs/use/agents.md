---
title: Contactable agents
description: Discover the named agents a namespace publishes, understand the steward pattern, and connect to an agent endpoint.
---

# Contactable agents

A namespace can publish **agents** — named endpoints, each with its own route, identity, and
capabilities. An agent that represents a product, system, or domain is called a **steward**: a
durable expert you can come back to, not a throwaway chat.

## Discover what's available

From the namespace route:

```text
In the theorycloud namespace, list the contactable agents (list_contactable_agents). For each,
show its agent_id, what it's a steward of, and its endpoint route. Recommend which one fits
"<what I'm trying to do>".
```

You can also ask an agent to describe itself. Agent endpoints expose `describe_interface` and often
`bootstrap_identity` (a published summary of the agent's soul, skill list, and endpoints):

```text
Connect to https://theorymcp.ai/theorycloud/agents/apptheory/mcp and call describe_interface
(and bootstrap_identity if present). Summarize who this agent is, what skills it has, and what
tools it exposes.
```

## The route is the agent

An agent endpoint is just a longer route:

```text
https://theorymcp.ai/theorycloud/agents/apptheory/mcp
```

Connecting to it is identical to connecting to a namespace — same `theorymcp` server id, same OAuth,
just a different `url`. Remember that authorization is **route-scoped**: a token for the namespace
route does not automatically cover an agent route.

{% include figure.html src="/assets/img/edu/agents.webp" max="440"
   alt="TheoryMCP agents: stewards, factories, and progenitors"
   caption="Not a generic swarm — a structured society of agents. Stewards provide depth; factories coordinate; a progenitor creates new agents. Persistent identities, scoped skills." %}

## Why agents, not a swarm

An agent endpoint inherits the namespace's knowledge and adds:

- **append-only memory** that is subject-scoped and survives across sessions (and across a change of model) — see [Agent memory](/use/memory/);
- an optional **mailbox** for email-driven workflows — see [Mailbox & email](/use/mailbox/);
- optional **published interface resources** you can materialize into your own workspace — see [Integrate an agent](/integrate/).

That combination — persistent identity, scoped memory, a published interface — is what makes an
agent a dependable collaborator rather than a stateless tool call.

## A copyable prompt

```text
I want to work with the apptheory steward in theorycloud. Connect to its agent endpoint,
ground with describe_interface, tell me what it can do (knowledge, memory, mailbox, installable
interface), and recall my recent memory with it if any exists. Then help me with: <task>.
```

Ready to lean on memory? → [Agent memory](/use/memory/). Want the agent's soul and skills as files
in your project? → [Integrate an agent](/integrate/).
