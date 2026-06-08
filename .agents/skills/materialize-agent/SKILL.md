---
name: materialize-agent
description: Materialize a theorymcp.ai agent's published install layout into a local project directory. Plans the install (agent_local_install_plan), fetches the install pack to disk WITHOUT routing it through model context, unzips into the target, verifies every file against the served manifest checksums, and writes the install marker. Host-aware fetch (download_url grant vs resources/read).
---

# Materialize an agent into the local filesystem

The core integration: turn a published agent into local files, faithfully and verifiably. The server returns bytes and guidance; **you** write the files.

## When to use

- Installing or bootstrapping a namespace agent into a project directory.
- Re-materializing after a republish (see also `update-namespace-install`).

## When NOT to use

- Before `discover-namespace` + `list-namespace-agents`.
- To author or push changes *up* to the namespace — that is not integration and is out of scope here.

## Inputs

- A grounded namespace; the chosen `agent_id`; the target `client` profile (`codex` | `claude_code` | ...); an absolute `target_directory`.

## Procedure

1. **Plan.** Call `agent_local_install_plan(agent_id, client, target_directory)`. Read the output files (`manifest_entries`: each `path` + `sha256`) and the `install_pack_resource` (`download_url` and/or `read_method: resources/read`). The layout is **author-defined and route-derived** — apply it exactly; do not invent paths or formats. (Current convention: codex's skills render under the shared `.agents/skills/`, not `.codex/skills/`; `.codex/` holds only `config.toml` + `steward.md`. A SKILL.md body carries its own YAML frontmatter.)
2. **Fetch the pack to disk — never through model context.** A large pack is truncated in a model's context, so route the bytes straight to a file:
   - If `install_pack_resource.download_url` is present (a single-use, header-free grant): `curl -fL "<download_url>" -o pack.zip`. *(Codex needs this — it truncates large tool results in context.)*
   - Otherwise fetch `install_pack_resource.uri` via MCP `resources/read`; on hosts whose runtime saves resource blobs to a file (e.g. Claude Code), use that saved file. Do **not** try to paste the base64 blob into a shell command.
   - For a host that speaks stdio MCP but cannot perform MCP OAuth (e.g. Antigravity), the route reaches the namespace through the agent layout's `mcp-remote` bridge — see `setup-mcp-bridge`.
3. **Unzip** into `target_directory`.
4. **Verify** every extracted file's sha256 against the plan's `manifest_entries`, and the `pack_checksum` against the downloaded zip. The pack materializes **whole or not at all** — never drop files to "shrink" it. *(v2 packs carry no in-zip `MANIFEST.json`; verify against the plan's `manifest_entries`.)*
5. **Write the install marker** to the **plan-provided `marker_file_path`** — the server names the location; never invent it. Record the server-defined `installed_state` schema so future verify/update planning is deterministic:
   - `marker_file_path` — where this marker lives (echo it back).
   - `published_version` — the installed published version.
   - `bundle_checksum` — checksum of the install pack.
   - `snapshot_checksum` — checksum of the published snapshot.
   - `install_manifest_version` — the manifest schema version.

   These are exactly the fields `agent_local_install_plan` accepts back as `installed_state`; passing anything you synthesized yourself defeats deterministic planning.

## Outputs

- The agent materialized under `target_directory` exactly as the published layout specifies, every file checksum-verified, with an install marker written.
- A plain report: what was written, the checksum result, and any failed step with its exact error.

## Red flags

- Routing a large pack blob through model context (truncation → corrupt/partial install).
- Hunting for a `resources/read` CLI, building an MCP client, or curling the MCP endpoint unauthenticated — use the `download_url` grant or the host's saved resource.
- Dropping files/skills to reduce size — a partial materialization is a failed one.
- Synthesizing MCP URLs or identity from caller input — authority is server-owned and arrives already resolved inside the rendered files.
- Inventing the marker location or schema instead of using the plan's `marker_file_path` and the server-defined `installed_state` fields — the marker is route-derived, not a local convention.

## After completing

- Run `verify-install`. If healthy, the agent is integrated; use `update-namespace-install` to stay in sync.
