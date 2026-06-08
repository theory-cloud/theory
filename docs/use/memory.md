---
title: Agent memory
surface: mcp
description: How TheoryMCP agent memory works — append-only, deterministic, agent-routed, and subject-scoped continuity that survives a change of model.
---

# Agent memory

Memory is the most important consumer-facing behavior of an agent endpoint. It's what turns a series
of disconnected calls into a relationship with a durable agent.

## The model

TheoryMCP memory is:

- **append-only** — entries are written into a ledger, not rewritten in place;
- **deterministic** — the same inputs behave the same way;
- **agent-routed** — the agent *route* selects which ledger family is used;
- **subject-scoped** — the authenticated subject selects *whose* visible memory is returned.

The practical outcome:

> Two different users can use the **same** agent endpoint without ever sharing memory with each
> other. And the same user gets continuity across sessions — even if they switch the underlying
> model.

{% include figure.html src="/assets/img/edu/stateful-by-design.webp" max="460"
   alt="Theory Cloud agents: stateful by design — persistent identity, scoped memory, model freedom"
   caption="Stateful by design. Identity and memory live in the cloud, attached to the agent and scoped to you — so they stay stable even when the model changes. No lock-in." %}

## The tools

| Tool | Purpose |
| --- | --- |
| `memory_append` | add a new entry for the authenticated user (server stamps the author) |
| `memory_recent` | fetch the most recent visible entries for the current user on this route |
| `memory_get` | fetch one entry by `memory_entry_id`, if it belongs to the current user |

A `memory_append` returns a server-generated `memory_entry_id`. You never send `author_subject_id`;
the server derives it from your token.

```json
// memory_append input
{ "content": "Customer prefers architecture diagrams before code examples.", "entry_type": "note" }

// representative result
{ "created": true, "memory_entry_id": "mem-abc123…", "entry_type": "note", "created_at": "2026-04-20T13:00:00Z" }
```

## Copyable prompts

**Write something worth remembering:**

```text
On the apptheory agent in theorycloud, append a memory entry: "<the durable fact or preference>"
with entry_type "note". Confirm the memory_entry_id you got back.
```

**Resume where you left off:**

```text
Connect to the apptheory agent endpoint and call memory_recent (limit 10). Summarize what you
already know about me / this project from those entries before we continue.
```

**Idempotent write (safe to retry):**

```text
Append this memory once, even if the step runs twice: content "<fact>", entry_type "note",
idempotency_key "<stable-key-for-this-step>".
```

{% capture idem %}
Pass an `idempotency_key` when a write might be retried (a re-run step, a flaky connection). The
ledger collapses repeats of the same key into one entry, so retries don't duplicate memory.
{% endcapture %}
{% include callout.html type="info" title="Make retries safe" content=idem %}

## What memory is *not*

- It is **not a shared transcript.** There's no common chat log between users on the same agent; each subject's memory stays private.
- It is **not editable in place.** The normal flow appends; you don't rewrite history.
- It does **not cross routes.** Memory on one agent endpoint is that agent's ledger family — a different agent is a different memory.

## Good habits

- **Recall before you act.** Start agent sessions with `memory_recent` so the agent uses what it already knows.
- **Append the durable, not the disposable.** Preferences, decisions, constraints — not this turn's scratch work.
- **Let the server own identity.** Don't send subject ids; the token is the identity.

Next: an agent's optional [mailbox & email](/use/mailbox/), or pull the agent's interface into your
workspace with [Integrate an agent](/integrate/).
