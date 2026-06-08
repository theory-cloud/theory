---
name: validate-and-publish
description: The two-gate terminal step — mechanical validation (agent_interface_validate) AND per-publish human authorization (agent_interface_publish) — the only legitimate path for authored content to leave drafts and become installable. Publish is never inferred from the earlier authoring-scope grant. Optionally closes Theory's pull/push loop by materializing the freshly-published agent back down.
---

# Validate and publish

Two gates, both required, never bundled. The mechanical gate (`agent_interface_validate`) is the
build-gate discipline generalized; the human gate (`agent_interface_publish` with
`direct_user_authorization`) is the per-publish authorization. Authoring scope opened drafting — it is
NOT standing publish authority. Published snapshots are immutable and append-only; you never unpublish.

## When to use

- After `define-install-layout`, when the operator wants to publish the authored agent and make it installable.

## When NOT to use

- On a failed, unrun, or STALE `agent_interface_validate` (a pass is void the moment any draft changed after it).
- Without the operator's direct authorization for THIS specific publish.
- To "fix" a published snapshot in place — recover via restore-into-drafts + a second authorized publish.

## Inputs

- An authored agent in drafts: soul + skills + ADL v2 layout(s) for the targeted host profiles.
- The operator, available to authorize this specific publish.

## Procedure

1. **Inspect drafts directly.** `agent_soul_get` / `agent_skill_list` / `agent_install_layout_list` to
   confirm completeness. Know the first-publish blind spot: `agent_interface_validate` reads PUBLISHED
   state ONLY, so before the first publish it reports incomplete no matter how complete the drafts are
   — do NOT misread that as a draft error.
2. **Gate 1 — mechanical.** Run `agent_interface_validate(agent_id, client)` per supported render
   client — each profile you authored a layout for (the built-ins `codex` / `claude_code` plus any
   registered custom profile such as `antigravity`) — and `agent_interface_status`. Refuse to publish on a failed,
   unrun, or STALE validate — a prior pass is void the moment any soul / skill / layout draft changes,
   so re-run validate as the LAST step before publish (after any draft inspection or change below).
   Confirm all needed v2 layouts are authored — publishing soul + skills with NO v2 layout yields
   published-but-not-installable.
3. **Show the change (optional).** `agent_interface_status`, and for an existing agent
   `agent_interface_snapshot_diff` between the current and prospective versions, so the operator sees
   exactly what will change. Refuse to bundle validate and publish into one unattended step.
4. **Gate 2 — human, per-publish.** Require the operator's direct authorization for THIS specific
   publish, then call `agent_interface_publish(agent_id, direct_user_authorization=true)`. Set the flag
   true ONLY after that authorization; never infer it from the standing scope grant. Publish is
   monotonic-forward — it promotes drafts into a new immutable snapshot (`published_version` N+1).
5. **Post-publish (authoritative gate).** Re-run `agent_interface_validate` per supported render client
   and confirm `outcome: valid` with `installable: true` and the published install layouts passing
   before telling any consumer the agent is installable.

## Outputs

- Either: a published agent (new `published_version`), validated installable on its render clients,
  with a plain report of what was validated and published — or a clear refusal naming the failed gate.

## Red flags

- Inferring publish authorization from the earlier `grant-authoring-scope` opt-in.
- Publishing on a failed / unrun / STALE validate (a pass is void once any draft changes after it), or bundling validate + publish into one unattended step.
- Misreading the pre-first-publish "incomplete" (validate reads published state only) as a draft error.
- Publishing soul + skills with no install layout (published-but-not-installable).
- Editing a snapshot in place or "unpublishing" — recovery is restore-into-drafts + a second publish.

## After completing

- Optionally hand to `materialize-agent` + `verify-install` to pull the freshly-published agent back
  down (closing the pull/push loop). For rollback: `agent_interface_snapshot_list` / `_diff` →
  `agent_interface_restore_from_snapshot(direct_user_authorization=true)` into drafts → a second,
  separately-authorized publish.
