---
name: verify-install
description: Confirm a materialized agent came up whole and matches the namespace's published snapshot. Verifies every local file against the served manifest checksums, confirms the soul/instructions and all skills are present, and checks the install marker against the published version. Refuse to operate from a partial or corrupt materialization.
---

# Verify a local materialization

Integrity gate. A half-materialized agent that acts is more dangerous than one that waits — from the outside you cannot tell the difference.

## When to use

- Immediately after `materialize-agent`.
- After an `update-namespace-install`, or any time files look incomplete or inconsistent.

## When NOT to use

- As a per-turn ritual once verified — re-run on suspicion or after a change.

## Inputs

- The materialized `target_directory`, plus the agent's `agent_local_install_plan` (for `manifest_entries` + `pack_checksum`) or the written install marker.

## Procedure

1. Re-read the plan's `manifest_entries`; for each, sha256 the local file and compare. Report any MISSING or MISMATCH.
2. Confirm the agent's required files are all present: the instructions/soul file at its layout path, every skill, and any config the layout declares.
3. Confirm the install marker matches the plan's selected snapshot. The marker lives at the plan's `marker_file_path`; compare the server-defined `installed_state` fields against the plan: `published_version`, `bundle_checksum`, `snapshot_checksum`, `install_manifest_version`.
4. If anything is missing or inconsistent: **STOP.** Report exactly what is wrong in plain language; re-materialize or escalate. Do not operate.

## Outputs

- A clear "came up whole, version N" statement, or a plain-language report of exactly what is missing/mismatched and the fix (re-materialize / re-auth / escalate).

## Red flags

- Proceeding despite a missing file "because it probably isn't needed."
- Reconstructing a missing file from memory instead of re-materializing.
- Reporting healthy when checksums do not match.
- Expecting codex skills under `.codex/skills/` — codex loads the shared `.agents/skills/` (there is
  no `.codex/skills/`). Verify skills at the layout's actual paths: `.agents/skills/` for codex +
  antigravity, `.claude/skills/` for claude_code.

## After completing

- If whole: the integration is trustworthy. Use `update-namespace-install` to keep it current.
