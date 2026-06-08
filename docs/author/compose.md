---
title: Compose a new agent
description: Shape one new agent, write its soul first, then its skills, then its install layouts — drafts only, soul-first, ready to validate and publish.
---

# Compose a new agent

Composing is the interview-driven authoring path: shape the agent, then write it into the namespace
**soul-first**, as drafts. Everything here happens after you've [opened the mode](/author/) with a
scope grant.

## Step 1 — Shape it (the reversal point)

One short conversation confirms the agent's **shape** before any namespace write — this is the last
cheap moment to change your mind:

- **purpose** — what the agent is for, in one sentence;
- **principal** — who directs it;
- **host profiles** — which of codex / claude_code / antigravity it targets;
- **invariants** — the rules that must always hold;
- **at least three concrete, invariant-grounded refusals** — what it refuses even when asked.

```text
Let's shape a new agent for theorycloud before writing anything. Interview me to confirm:
its purpose, its principal, the host profiles it targets, its invariants, and at least three
concrete refusals grounded in those invariants. Show me the agreed shape and wait for my
approval before any namespace write.
```

{% capture refusals %}
A soul with fewer than **three concrete, invariant-grounded refusals** is an unfinished agent. "Be
helpful and safe" is not a refusal — "refuses to operate from a partial materialization because a
half-formed install is indistinguishable from a whole one" is. Speed never erodes refusal quality.
{% endcapture %}
{% include callout.html type="warn" title="Refusals are the soul, concretely" content=refusals %}

## Step 2 — Author the soul (identity first)

The soul is written **before any skill**. If the agent is new, create it first, then upsert the soul:

- `create_agent` — registers the agent (`agent_id`, display name, optional initial instructions);
- `agent_soul_upsert` — writes the 5-concern identity draft (identity · philosophy · discipline · boundaries · refusal-list).

```text
Author the soul for the agent we shaped in theorycloud. If it doesn't exist, create_agent first,
then agent_soul_upsert a coherent 5-concern soul (identity, philosophy, discipline, boundaries,
and a refusal list of the ≥3 concrete refusals we agreed). This is a DRAFT. Show it to me before
writing, and don't author any skill yet.
```

{% capture order %}
**Soul-first is enforced, not suggested.** `agent_skill_upsert` targets an agent that
`create_agent` + `agent_soul_upsert` already shaped. Authoring a skill against a soulless agent
breaks the guarantee — the order exists so identity precedes capability.
{% endcapture %}
{% include callout.html type="info" title="Why the order is fixed" content=order %}

## Step 3 — Author the skills (tools follow identity)

Only after the soul exists. One `agent_skill_upsert` per skill, each a self-contained capability with
its own slug and body:

```text
Now author the skills for <new-agent-id> in theorycloud, one agent_skill_upsert each, only because
the soul already exists. For each skill include a clear When-to-use and When-NOT-to-use. Keep them
DRAFTS. List the slugs you wrote.
```

## Step 4 — Define the install layout (the namespace renders the hosts)

You author **ADL v2** layout entries — logic-less templates with placeholders — and the namespace
renders the real host files server-side. You do **not** hand-scaffold `.codex/` / `.claude/` /
`.agents/`.

- `agent_install_layout_upsert` — one layout per host profile, entries of placeholder templates;
- a non-built-in client (e.g. `antigravity`) must first be registered in the namespace install-profile catalog via `agent_install_profile_upsert`;
- client / MCP-server names stay **dash-free** (use underscores, like `claude_code`) because a dashed MCP name is rejected.

```text
Define the ADL v2 install layout(s) for <new-agent-id> in theorycloud, one agent_install_layout_upsert
per target host. Use placeholder templates (e.g. {% raw %}{{soul}}{% endraw %}, {% raw %}{{mcp.url}}{% endraw %}, {% raw %}{{skill.slug}}{% endraw %}) — never
rendered bytes — and let the namespace render the hosts. If antigravity isn't a built-in profile,
register it with agent_install_profile_upsert first.
```

{% capture authority %}
Layout entries **never** carry connection authority. The route appears only as the `{% raw %}{{mcp.url}}{% endraw %}`
placeholder; a literal MCP URL, scope, tenant, or entitlement baked into layout content is rejected
as an authority field. Authority is route-derived and server-owned — it is filled in at render time,
not authored.
{% endcapture %}
{% include callout.html type="danger" title="No authority fields in layouts" content=authority %}

## Then: validate and publish

Drafts don't reach consumers until both gates pass. That's the terminal step →
[Validate & publish](/author/publish/).

## Don't transplant a soul

To create a **new, distinct** agent, instantiate the *shape* — don't copy an existing agent's soul
wholesale. (Copying the **same** agent's published identity verbatim into another namespace under
explicit authorization is a different, sanctioned operation — see [Replicate](/author/replicate/).)
