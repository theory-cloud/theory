---
title: Copyable prompt library
description: Every prompt on this site in one place — connect, ground, query knowledge, use agents and memory, materialize, and author. Copy, swap the placeholders, paste.
---

# Copyable prompt library

Every prompt from across the site, collected. Swap the `<…>` placeholders and paste into your host.
Each block has a copy button. Pair them with the explanations they came from via the links.

## Connect & ground

**Configure a host** → [Connect a host](/connect/)

```text
Configure this workspace's theorymcp MCP server to point at
https://theorymcp.ai/theorycloud/mcp for <codex | claude_code | antigravity>.
Set the route in the right host config, walk me through authentication, then verify the
connection by grounding (describe_interface). Do not invent the route — use exactly the one above.
```

**Set up the mcp-remote bridge (Antigravity)** → [The mcp-remote bridge](/connect/mcp-remote-bridge/)

```text
My host (Antigravity) can't do MCP OAuth directly. Set up the mcp-remote stdio bridge for the
theorymcp server pointed at https://theorymcp.ai/theorycloud/mcp in .agents/mcp_config.json,
then walk me through the one-time browser authorization and confirm the route is reachable by
grounding (describe_interface).
```

**Ground (always first)** → [How it works](/how-it-works/)

```text
Ground me in the namespace at https://theorymcp.ai/theorycloud/mcp.
Call describe_interface and summarize the available tools, the visible knowledge bases,
whether agent installs are available, and the route-derived identity. Use only the tool
names describe_interface returns.
```

**Ground an agent endpoint** (agents don't expose `describe_interface`)

```text
Ground me on the agent endpoint https://theorymcp.ai/theorycloud/agents/apptheory/mcp.
Call server_instructions (and bootstrap_identity if the agent has a published interface) and
summarize who this agent is, what it exposes (knowledge, memory, mailbox), and its identity.
```

## Use a namespace

**Query knowledge (search → detail)** → [Knowledge & search](/use/knowledge/)

```text
In the theorycloud namespace, call list_knowledge_bases and show me the visible KBs.
Then search the most relevant KB for "<my question>" and list the top 5 results as
previews (title · summary · relevance). Pick the best match, call get_unit on its unit_id,
and answer my question from the authoritative body. Cite the unit_id(s) you used.
```

**Deterministic lookup (no ranking)**

```text
In theorycloud, use recall_units to recall the metadata + adjacency for the unit with source_ref
"<ref>" (or unit_id "<id>") and anything it marks as related. Show titles and unit_ids; don't rank.
Then get_unit the one I actually want for its full authoritative body.
```

**Discover agents** → [Contactable agents](/use/agents/)

```text
In the theorycloud namespace, list the contactable agents (list_contactable_agents). It returns each
agent's agent_id, display_name, and email_address — show those, infer the steward role from the
display name and the route from the agent_id (/theorycloud/agents/<agent_id>/mcp), and recommend
which fits "<what I'm trying to do>".
```

## Use an agent MCP

**Resume with memory** → [Agent memory](/use/memory/)

```text
Connect to the apptheory agent endpoint and call memory_recent (limit 10). Summarize what you
already know about me / this project from those entries before we continue.
```

**Append memory (idempotent)**

```text
Append this memory once, even if the step runs twice: content "<fact>", entry_type "note",
idempotency_key "<stable-key-for-this-step>".
```

**Triage a mailbox** → [Mailbox & email](/use/mailbox/)

```text
On the apptheory agent in theorycloud, list unread mailbox items (email_list). For each, show
sender, subject, and the preview. Tell me which look like they need a reply.
```

## Integrate

**Whole flow** → [The integration flow](/integrate/)

```text
Integrate the apptheory agent from theorycloud into <absolute target dir> for <host>:
1) make sure theorymcp is connected to the route and grounded (describe_interface);
2) list the agent's installability and pick the published version;
3) materialize it — plan, fetch the pack to disk, unzip, verify every file's sha256 against
   the plan's manifest, and write the install marker;
4) verify the result is whole and report exactly what was written.
Do not route the pack through your context, and do not drop any files to shrink it.
```

**Materialize (detailed)** → [Materialize an agent](/integrate/materialize/)

```text
Materialize the apptheory agent from theorycloud into <absolute target dir> for <host>:
1) call agent_local_install_plan and show me the manifest (path + sha256) and the pack resource;
2) fetch the pack to disk via the download_url grant (curl -fL ... -o pack.zip), or the host's
   saved resource if there's no grant — do NOT route the blob through your context;
3) unzip into the target;
4) verify every file's sha256 against the plan and the zip against pack_checksum;
5) write the install marker.
If anything is missing or a checksum mismatches, stop and report it exactly. Don't drop files.
```

**Verify** → [Verify & keep in sync](/integrate/verify-and-sync/)

```text
Verify the materialized apptheory install in <target dir> against theorycloud:
re-fetch the published manifest, check every local file's sha256, confirm the soul and all
skills are present, and confirm the install marker matches the published version. Report a
clean bill of health, or the exact files/checksums that don't match — don't fix by guessing.
```

**Update / sync**

```text
Check whether the apptheory install in <target dir> is up to date with theorycloud:
read the install marker, call agent_local_install_plan to compare against the current published
version for <host>, and tell me what changed. If there's an update, re-materialize only the
changed files, verify their checksums, and rewrite the marker. Don't touch files that didn't change.
```

## Author (gated)

**Open the mode** → [Authoring & the gates](/author/)

```text
I want to author a new agent into theorycloud. First confirm the authoring tools are present on
the route, then record an explicit, session-scoped authoring-scope grant for a single new agent
named "<new-agent-id>". State clearly that this opens the DRAFT surface only — not publish authority —
and that each publish will need its own authorization. Then start scope-agent-lite to shape it.
```

**Shape it** → [Compose a new agent](/author/compose/)

```text
Let's shape a new agent for theorycloud before writing anything. Interview me to confirm:
its purpose, its principal, the host profiles it targets, its invariants, and at least three
concrete refusals grounded in those invariants. Show me the agreed shape and wait for my
approval before any namespace write.
```

**Author the soul (first)**

```text
Author the soul for the agent we shaped in theorycloud. If it doesn't exist, create_agent first,
then agent_soul_upsert a coherent 5-concern soul (identity, philosophy, discipline, boundaries,
and a refusal list of the ≥3 concrete refusals we agreed). This is a DRAFT. Show it to me before
writing, and don't author any skill yet.
```

**Author the skills (after the soul)**

```text
Now author the skills for <new-agent-id> in theorycloud, one agent_skill_upsert each, only because
the soul already exists. For each skill include a clear When-to-use and When-NOT-to-use. Keep them
DRAFTS. List the slugs you wrote.
```

**Publish (human-authorized; validates the drafts)** → [Validate & publish](/author/publish/)

```text
Publish <new-agent-id> in theorycloud. Call agent_interface_publish with
direct_user_authorization=true ONLY after I explicitly say "publish now". It validates the drafts
and creates the snapshot; if drafts are incomplete it fails closed — show me that error rather than
forcing it. Report the new published_version. Do not infer authorization from the earlier scope grant.
```

**Verify installability (after publishing)**

```text
Confirm <new-agent-id> is installable in theorycloud: call agent_interface_status for the latest
published version, then agent_interface_validate for each host profile I care about. Report whether
the published snapshot installs cleanly per client, and list any incomplete checks. (These are
post-publish checks — they don't gate or expose drafts.)
```

**Replicate (lab → live)** → [Replicate](/author/replicate/)

```text
Replicate these agents from theorycloud on lab.theorymcp.ai into theorycloud on
theorymcp.ai, verbatim: apptheory, tabletheory
For each, in order: read the source's published soul/skills/ADL layouts, stage them locally,
re-upsert them UNCHANGED into the target (soul first, then skills, then layouts), then publish with
direct_user_authorization=true (publish validates the drafts and snapshots them), then confirm
installability with agent_interface_validate/status — one explicit authorization per agent. Do not
edit any soul or skill in transit. Stop and report if a publish fails closed on incomplete drafts.
```
