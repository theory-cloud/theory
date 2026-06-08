---
title: Knowledge & search
description: Query a namespace's published knowledge bases — list, search for previews, then fetch authoritative detail with get_unit.
---

# Knowledge & search

A namespace endpoint's main job is **published knowledge**: curated, ranked, searchable domain
content managed by KnowledgeTheory. The query loop is always the same shape — **list** what's
visible, **search** for previews, then **fetch** the authoritative detail.

## The tools

| Tool | What it does | Treat the result as |
| --- | --- | --- |
| `list_knowledge_bases` | lists the KBs visible on this route (name, display name, description, topics, access tier) | the menu |
| `search_docs` | finds units in one KB; returns title, summary, snippet, source_ref, citations, relevance | **previews** |
| `get_unit` | fetches the full authoritative body for a `unit_id` | the source of truth |
| `recall_units` | deterministic lookup by id / source_ref / facet / adjacency — no ranking | exact retrieval |

On agent endpoints the compatibility tool is `query_knowledge` (same idea as `search_docs`, returns
`doc_id` instead of `unit_id`). Always confirm the real names with `describe_interface` first — the
exposed surface is route-dependent.

{% capture preview %}
`search_docs` returns **previews**, not authoritative text. Don't answer from a snippet — find the
right unit, then call `get_unit` (or `recall_units`) and answer from the full body. Cite the
`unit_id` so the answer is traceable.
{% endcapture %}
{% include callout.html type="warn" title="Previews are not the answer" content=preview %}

## The query loop, as a prompt

```text
In the theorycloud namespace, call list_knowledge_bases and show me the visible KBs.
Then search the most relevant KB for "<my question>" and list the top 5 results as
previews (title · summary · relevance). Pick the best match, call get_unit on its unit_id,
and answer my question from the authoritative body. Cite the unit_id(s) you used.
```

## Narrowing to one knowledge base

If you already know the KB, skip the menu:

```text
Search the "<kb_name>" knowledge base in theorycloud for "<query>". Return the top matches
with their unit_ids and relevance, then get_unit the strongest one and summarize it.
```

## Deterministic lookup (no ranking)

When you want a specific unit or everything adjacent to one — not a ranked search — use
`recall_units`:

```text
In theorycloud, use recall_units to fetch the unit with source_ref "<ref>" (or unit_id "<id>"),
plus anything it marks as related. Show titles and unit_ids; don't rank, just retrieve.
```

## Contract packs

Some namespaces publish **contract packs** — curated, regulated-domain knowledge (financial
products, API specifications, legal frameworks). They are knowledge bases with stricter access
policies; you read them through the same tools:

```text
List the knowledge bases in theorycloud and tell me which are contract packs. Then search
the "<pack_name>" pack for "<topic>" and get_unit the authoritative entry.
```

## Good habits

- **Ground first.** `describe_interface` tells you which KBs and tools this route actually exposes.
- **Search wide, read narrow.** Many previews → one authoritative `get_unit`.
- **Cite unit ids.** They make an answer checkable and re-fetchable.
- **Don't widen scope by hand.** Extra fields in a tool call don't unlock more — access is route-resolved.

Want continuity, memory, and a named expert instead of raw knowledge? That's an
[agent MCP](/use/memory/). Want to see which agents a namespace offers? →
[Contactable agents](/use/agents/).
