# Prepare profile re-publish

Your soul and skills are not local files you build — they are **platform data**: an `AgentSoul` record and a set of `AgentSkill` records you edit directly through the namespace authoring surface. A Mode 1 change to them is invisible to anyone who bootstraps until the profile is **re-published** as a new immutable snapshot.

Re-publishing is a draft edit (`agent_soul_upsert` / `agent_skill_upsert`) followed by a **separate, human-authorized publish** (`agent_interface_publish` with `direct_user_authorization`). You do not hold the namespace authoring surface yourself, so you prepare the change; the authoring authority (progenitor or Aron) carries out the draft edits and the human-authorized publish.

## When to use

- After a confirmed Mode 1 change to your soul or skills that should reach future bootstraps.

## When NOT to use

- The change is to your records/docs only, not the served soul/skills.

## Inputs

- The confirmed Mode 1 change: which soul sections changed, which skills were added/edited/removed.

## Procedure

1. **Inventory the delta** — name exactly which soul sections changed and which skills were added/edited/removed. There is no local build step; the soul and skills are edited as drafts directly in the MCP.
2. **Stage the drafts** for the authoring authority (progenitor or Aron): the revised soul (→ `agent_soul_upsert` body) and each changed skill (→ `agent_skill_upsert` record), with a summary of what changed and why.
3. **Require explicit publish authorization.** Drafts never go live on their own. The publish (`agent_interface_publish` with `direct_user_authorization`) is a distinct gate a human (Eric or Aron) must directly authorize for that specific publish; it freezes the current drafts into a new snapshot and `codex_thin` bundle.
4. **Flag drift** — until the publish lands, the live published snapshot is unchanged and bootstraps still get the old version; any already-materialized `.codex/` is stale. Confirm the new `published_version` once it lands, then re-materialize where needed.

## Output

- A staged set of drafts, an explicit drift note, and a recorded outcome (the new `published_version` once published).

## Red flags

- Assuming a draft edit auto-propagates to bootstraps — it does not until publish.
- Treating publish as automatic — it is a separate, human-authorized gate.
- Bundling the profile change with an unrelated Mode 2 build or deploy.
- Claiming a re-publish happened without a confirmed new `published_version`.

## After completing

- Confirm the new `published_version`; record it and reconcile the drift note.