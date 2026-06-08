---
title: Materialize an agent
description: Plan the install, fetch the pack to disk without routing it through model context, unzip, verify every checksum, and write the install marker.
---

# Materialize an agent

Materializing is the step that writes files. The contract is exact: the server returns a **plan** and
a **checksummed pack**; your host fetches the bytes to disk, unzips, verifies, and records a marker.
Nothing here is improvised — the layout is author-defined and route-derived, and you apply it exactly.

## The one tool

`agent_local_install_plan(agent_id, client, target_directory)` is called on the **namespace route**
(`https://theorymcp.ai/<namespace>/mcp`) — you pass the child `agent_id` you want; it is not a tool on
the agent endpoint. It returns:

- **`manifest_entries`** — every file, each with its `path` and `sha256`;
- **`install_pack_resource`** — how to get the bytes: a one-time `download_url` and/or `read_method: resources/read`, plus a `pack_checksum`;
- **`merge_instructions`** — how to combine with an existing install;
- **`validation`** — the installability status for your client profile.

`client` is one of `codex`, `claude_code`, `antigravity`.

## The five moves

**1 · Plan.** Call `agent_local_install_plan`. Read the manifest and the pack resource. Apply the
layout exactly — don't invent paths or formats.

**2 · Fetch the pack to disk — never through model context.** A real pack is large enough that a host
will *truncate* it in the context window, and a blob you can't fully see is one you can't faithfully
write. So route the bytes straight to a file:

```text
# when the plan includes a one-time, header-free download grant:
curl -fL "<install_pack_resource.download_url>" -o pack.zip
```

- The `download_url` is **single-use** and short-lived (≈10 min). A second GET fails closed (404/410). If a download is partial, mint a fresh plan — the consumed URL is not retryable.
- If there's no `download_url`, fetch `install_pack_resource.uri` via MCP `resources/read`; on hosts that save resource blobs to a file (e.g. Claude Code), use that saved file. Don't paste a base64 blob into a shell.
- For Antigravity, the route reaches the namespace through the [mcp-remote bridge](/connect/mcp-remote-bridge/).

**3 · Unzip** into `target_directory`.

**4 · Verify.** Check every extracted file's `sha256` against the plan's `manifest_entries`, and the
downloaded zip against `pack_checksum`. The pack materializes **whole or not at all** — never drop
files to "shrink" it. (v2 packs carry no in-zip `MANIFEST.json`; verify against the plan.)

**5 · Write the install marker** from the plan, so a future update can compare local `installed_state`
to the published version.

{% capture bytes %}
**Bytes go response → disk, never through your context.** The download grant (or the host's saved
resource) exists precisely so the pack never has to survive a trip through the model. Pasting a blob
into a shell is the failure this rule prevents.
{% endcapture %}
{% include callout.html type="danger" title="The materialize invariant" content=bytes %}

## What lands on disk

The layout is host-specific and author-defined, but as a shape:

```text
codex                        claude_code                      antigravity
.codex/                      .claude/                         GEMINI.md
  config.toml  (theorymcp)     output-styles/<agent>.md       .agents/
  steward.md   (soul)          settings.json (outputStyle)      mcp_config.json (bridge)
.agents/skills/<slug>/         .claude/skills/<slug>/           .agents/skills/<slug>/
  SKILL.md                     SKILL.md                         SKILL.md
                             .mcp.json  (root — theorymcp)
```

(Current convention: codex's skills render under the shared `.agents/skills/`, not `.codex/skills/`;
`.codex/` holds only `config.toml` + `steward.md`. Each `SKILL.md` carries its own YAML frontmatter.)

## A copyable prompt

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

## Red flags (stop if you catch yourself doing these)

- Routing a large pack blob through model context (truncation → corrupt install).
- Hunting for a `resources/read` CLI or curling the MCP endpoint unauthenticated — use the grant or the host's saved resource.
- Dropping files/skills to reduce size — a partial materialization is a failed one.
- Synthesizing MCP URLs or identity from input — authority is server-owned and arrives already resolved inside the rendered files.

Next, confirm it came up whole → [Verify & keep in sync](/integrate/verify-and-sync/).
