---
name: update-namespace-install
description: Keep a local materialization in sync with the namespace as the source of truth. Reads the local install marker as advisory installed_state, asks agent_local_install_plan whether a newer published version exists, and re-materializes only what changed. Never mutates the namespace.
---

# Update / sync a local materialization

The namespace is the source of truth; local files are a materialization. This skill reconciles them after a republish.

## When to use

- Periodically, or after you know the namespace republished.
- When `verify-install` reports the local marker is behind the published version.

## When NOT to use

- To push local edits *up* to the namespace — authoring is not sync, and is out of scope here.
- Before the agent was first materialized — use `materialize-agent`.

## Inputs

- The local install marker at the plan's `marker_file_path`, read as advisory `installed_state` (server-defined fields: `published_version`, `bundle_checksum`, `snapshot_checksum`, `install_manifest_version`) — plus the `agent_id`, the `client`, and the `target_directory`.

## Procedure

1. Call `agent_local_install_plan(agent_id, client, target_directory, installed_state=<marker values>)`.
2. Read `update_plan`: `update_available`, `recommended_action`, `selected_published_version`. The marker is advisory only — the server selects authority.
3. If no update: report "in sync at version N" and stop.
4. If an update is available: re-fetch and re-verify the pack (`materialize-agent` steps 2–4), write the new files, and rewrite the install marker to the new version.
5. Record what changed (old → new version, files) in plain language.

## Outputs

- "In sync at version N", or a report of the update applied (old → new version, files changed), checksum-verified.

## Red flags

- Treating the local marker as authority — it is advisory input; the server decides.
- Editing local files and calling it "sync" — local is downstream of the namespace.
- Pushing changes to the namespace from here.

## After completing

- Run `verify-install` to confirm the updated materialization is whole.
