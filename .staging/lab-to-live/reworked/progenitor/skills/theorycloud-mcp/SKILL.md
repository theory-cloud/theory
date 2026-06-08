# theorycloud-mcp — the authoring + bootstrap substrate

This is progenitor's operating manual for the **TheoryCloud namespace MCP** — the concrete
substrate behind the `mcp-bootstrapped-steward` pattern. An agent profile is **data**, not a
cloned repo: what progenitor authors here maps one-to-one onto platform records, the build
output *is* the distribution source, and a host materializes the agent with **one auth + one
prompt**.

Do not re-derive this from tool-schema descriptions. The schema text on several authoring
tools says the AgentInstructions overlay is "draft-only / never served on agent routes in
this milestone." **That text is stale.** The serving path was implemented and verified
(see *Built contract* below). The overlay **is** served. Trust this skill and the live
snapshots over the schema boilerplate.

## The two MCPs — never conflate them

There are two routes, and they do different jobs. Mixing them up is the single most common
analysis error here.

| | **`theorycloud`** (namespace MCP) | **agent route** (registered as **`theorymcp`** in materialized configs) |
|---|---|---|
| URL | `…/theorycloud/mcp` | `…/theorycloud/agents/<slug>/mcp` |
| Installed | **globally in codex** (and progenitor's session) | written into the materialized `.codex/config.toml` as `[mcp_servers.theorymcp]` |
| Role | **drives bootstrap**: authoring, lifecycle, publish, `agent_local_install_plan`, install-pack resources; serves the **shared** `si-m0-v1` bootstrap convention | the agent's **own operating route** post-materialization: memory, knowledge, email, peer consult; serves the shared convention **composed with that agent's published AgentInstructions overlay** |
| `server_instructions` | shared convention only (`overlay_status: not_applicable`) | shared convention **+ the routed agent's bootstrapping-instructions overlay** |

- progenitor's authoring tools (`mcp__theorycloud__*`) all live on the **namespace** route.
- "theorymcp" is **not a third server** — it is the **name the materialized config gives the
  agent's own route**. Inside a bootstrapped agent's workspace, `theorymcp` = that
  agent's own route.

## The agent model

An agent = **one `AgentSoul` + `AgentSkill[]` + `AgentPrompt[]` + `AgentTemplate[]` +
`LifecyclePack[]` + one `AgentInstructions` overlay**, all written as **drafts**, then frozen
into an **immutable published snapshot** by a single human-authorized `agent_interface_publish`.
The snapshot yields:

- the **`codex_thin` bundle** (the current-download artifact), and
- the **zipped install pack** that `agent_local_install_plan` hands a host as an MCP resource.

Canonical mappings (build output **is** the distribution source — no second divergent copy):

```text
authored .codex/  →  published record         →  materialized in host
steward.md (build.sh) →  AgentSoul.body         →  .codex/steward.md          (model_instructions_file)
skills/<slug>/SKILL.md → AgentSkill[] (slug=route token, body=SKILL.md) → skills/<slug>/SKILL.md
(config)              →  AgentTemplate (target_path .codex/config.toml, optional) → .codex/config.toml
(none / authored)    →  AgentInstructions overlay  →  served as bootstrapping instructions on the agent route
```

Three layers materialize for codex: `.codex/config.toml` (server-generated unless an agent
template owns it), `.codex/steward.md` (the soul), `skills/`, plus an install marker. The soul
file is **`.codex/steward.md`** (the older `AGENTS.md` path is gone) and the config sets
`model_instructions_file = "steward.md"`.

## Where the bootstrapping instructions live (the overlay)

The **AgentInstructions overlay** is the **"host operational addendum for materializing"** —
the decode-as-routine + host-auth-ordering guidance a headless host needs. It is:

- **NOT** part of `steward.md`. The soul is the agent's *operating* identity, read after
  materialization. The overlay is *bootstrapping* guidance, read while materializing. Keeping
  them separate is correct by design — finding the overlay text absent from `steward.md` is
  the expected result.
- **Served** by composition onto the shared `si-m0-v1` convention on the **agent route's**
  `server_instructions` (the route the materialized config calls `theorymcp`).
- Authored/edited with `agent_instructions_get` / `agent_instructions_upsert` /
  `agent_instructions_archive`, versioned, and **published into the snapshot**
  (`agent_instructions_present` + `agent_instructions_version` appear on each snapshot).

The shared `si-m0-v1` convention itself (the generic "decode the returned zip blob" /
checksum / caller-writes-files guidance) is **server-owned** platform content rendered by
theory-mcp-server — progenitor does **not** author it. progenitor's lever for per-agent
bootstrap sharpening is the **overlay**, not the shared convention.

## Built contract (what theory-mcp-server already implements)

These are settled platform facts — do not re-litigate them as open questions:

- **Agent local install pack resources** — the install-pack contract, deployed and in effect:
  - codex profile **non-interactive by default** (`prompt_mode: approve`,
    `default_tools_approval_mode = "approve"`); **safe agent-owned codex config override**:
    a published `AgentTemplate` with a whitelisted `target_path` like `.codex/config.toml`
    participates in materialization **without** path escape, entitlement override, or
    caller-supplied MCP URL authority; Claude Code profile kept headless-safe.
  - deterministic **zipped install packs** delivered as **session-pinned MCP
    resources**; `agent_local_install_plan` returns **bounded metadata only** (URIs +
    manifest + checksums + merge/verify guidance), **no inline bodies**.
  - published bundle config aligned to the new contract; **frozen bundles
    require re-publish** to pick it up (a frozen agent's re-publish is an explicit rollout
    step).
- **Namespace MCP agent installer** — `agent_local_install_plan` is exposed on the namespace
  MCP, with published-interface installability and versioned update/pin planning.

Implication: any historical bootstrap-failure notes in your project's planning docs describe
problems that are **now fixed server-side**. Treat them as history, not as the current
contract. Re-pull the live `agent_local_install_plan` before assuming any of them still bites.

## Tool surface (all on the `theorycloud` namespace route)

**Discovery / knowledge**
- `describe_interface` — authoritative tool list, workflow, visible KBs, next steps. Call
  first; do not assume tool names from memory.
- `server_instructions` — the shared `si-m0-v1` bootstrap convention (namespace route).
- `list_knowledge_bases`, `search_docs`, `get_unit`, `recall_units` — KnowledgeTheory:
  search → `get_unit` for authoritative detail; `recall_units` for deterministic metadata.

**Agent identity / directory**
- `list_agents`, `get_agent_identity`, `update_agent_identity` (display_name only),
  `create_agent` (sets only `agent_id`, `display_name`, optional instructions seed — tenant /
  route / toolset / memory / email / GitHub / principal are **server-derived**; ambiguous
  tenancy is structurally impossible), `agent_integrations_status` (email + GitHub portal
  handoff status), `list_contactable_agents`.

**Draft authoring (versioned, attributable, never auto-publish)**
- `agent_soul_get` / `agent_soul_upsert` — the assembled `steward.md` → `AgentSoul.body`.
- `agent_skill_list` / `agent_skill_get` / `agent_skill_upsert` / `agent_skill_archive` —
  each skill: `name` + `slug` (route token) + `description` + `body` (SKILL.md), plus up to 20
  inline `support_files` (`support|reference|script|template|asset`).
- `agent_prompt_*`, `agent_template_*` (`target_path` + `content_type` — the home for
  agent-owned `.codex/config.toml` and per-child scaffolds), `lifecycle_pack_*`
  (`prompt_ids` + `template_ids` + resources + verifier).
- `agent_instructions_get` / `agent_instructions_upsert` / `agent_instructions_archive` —
  the bootstrapping-instructions overlay (see above).

**Publish + snapshots (human gate + recovery)**
- `agent_interface_publish(agent_id, direct_user_authorization)` — freezes **all** current
  drafts into a new immutable snapshot + bundle. **Requires direct user authorization for the
  specific publish.** Draft writes never publish implicitly.
- `agent_interface_status` / `agent_interface_validate(client)` — published-only
  installability checks (endpoint active, snapshot/manifest available, identity + skills
  complete, client supported).
- `agent_interface_snapshot_list` / `_get` / `_diff` — published version history;
  each entry reports soul/instructions/skill/template/pack counts + checksums.
- `agent_interface_restore_from_snapshot(published_version, direct_user_authorization)` —
  copies a published snapshot **into drafts** (does not publish; re-publish separately).

**Lifecycle / install planning**
- `govern_lifecycle_turn` — read-only sequencing of the namespace govern lifecycle pack.
- `agent_local_install_plan(agent_id, client, target_directory, prompt_mode?,
  include_skills?, published_version?, installed_state?)` — returns **bounded** plan:
  `install_pack_resource.uri` (`resources/read`, `session_pinned`), `manifest_entries`,
  `config_fragments` / `file_fragments` metadata (no bodies), `command_fragments`,
  `merge_instructions`, `verification_steps`, `update_plan`, the shared convention, and the
  `validation` report. `client ∈ {codex, claude_code}`.

## Materialization (what a host does with the plan)

1. `agent_local_install_plan(<agent>, <client>, <target_dir>)` → bounded metadata + an
   `install_pack_resource` zip URI.
2. `resources/read` the URI → the pack arrives as a zip blob (MCP-host dependent: Claude
   Code saves it to disk; a raw codex host gets base64 in the resource contents).
3. **Decode to disk is a routine shell step at any size** — write blob → `base64 -d` →
   `unzip` the **entire** pack into the target dir. Never hunt for a `resources/read` CLI,
   never build an MCP client, never drop skills to shrink the pack.
4. Verify extracted files against `MANIFEST.json` + `pack_checksum`; confirm soul **and every
   skill** present.
5. Codex auth is **order-sensitive**: full pack on disk (`.codex/config.toml`,
   `.codex/steward.md`, `skills/`) → run codex once headless to load the project config →
   `codex mcp login theorymcp` (principal completes browser auth) → identity smoke test
   (`bootstrap_identity` expecting the agent's own `agent_id`) → operate. Launching before
   `steward.md` exists fails with `failed to read model instructions file`.

Steps 3 and 5 are exactly what the **per-agent overlay** (served on the agent route) sharpens
beyond the generic shared convention. The shared convention alone is too bland and headless
codex stalls on it.

## progenitor's authoring workflow (Mode 1 on a served agent)

```
create_agent (once)
  → agent_soul_upsert / agent_skill_upsert / agent_prompt_upsert
    / agent_template_upsert / lifecycle_pack_upsert / agent_instructions_upsert  (drafts)
  → agent_interface_validate(client)            (pre-flight installability)
  → agent_interface_publish(direct_user_authorization=true)   (human gate)
  → confirm new published_version on agent_interface_snapshot_list
```

**Republish discipline:** a draft edit changes nothing a host sees until publish. Frozen
bundles serve the **old** version; already-materialized `.codex/` is stale until
re-materialized. Always confirm the new `published_version` after publishing, and treat
authored `.codex/` vs published profile as drift until reconciled.

## Invariants progenitor holds here

- **Publish is a hard human gate.** Never set `direct_user_authorization=true` without
  explicit per-publish authorization. Same for `restore_from_snapshot`.
- **Route-derived identity only.** Templates/overlays must never inject MCP URL, tenant,
  namespace, agent, or entitlement authority. No `target_path` escape.
- **The whole pack materializes or none of it.** Never trade skills away to shrink a pack;
  skills are body, not ballast.
- **Bootstrap mechanics live in served content, not the prompt.** The per-bootstrap prompt
  collapses toward a single sentence; mechanics belong in the overlay (per-agent) and the
  shared convention (server-owned). A prompt that has to teach decode/auth ordering means the
  overlay is under-authored.
- **Build output is the distribution source.** No second divergent copy of soul/skills.

## When to use / not use

Use when: authoring or republishing a served agent; diagnosing or iterating a bootstrap;
inspecting what a host will actually receive (pull the live `agent_local_install_plan` and
`resources/read` the pack); grounding a pattern-survey against live published agents.

Do not use to: edit the server-owned shared `si-m0-v1` convention (out of progenitor scope —
that is theory-mcp-server's code); publish without authorization; treat draft edits as live.