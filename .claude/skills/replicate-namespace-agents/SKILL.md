---
name: replicate-namespace-agents
description: Replicate one or more EXISTING published agents from a source theorymcp.ai namespace into a target namespace (e.g. lab → live), verbatim and under explicit authorization. Reads each source agent's published soul, skills, and ADL v2 layouts; stages them locally; re-upserts them unchanged into the target; validates and publishes per agent through the two gates. This is the pull+push loop — distinct from authoring a new agent, and it composes nothing.
---

# Replicate namespace agents (source → target)

Verbatim migration of an existing published corpus from one namespace to another. It is NOT authoring
a new agent: there is no interview and nothing is composed — you copy the *same* agent identity
(same `agent_id`, soul, skills, layouts) into the target, preserving it exactly. It IS still gated
authoring on the target side, so every push gate holds.

## When to use

- Migrating/replicating published agents between environments or namespaces (lab → live, or tenant → tenant).
- After `grant-authoring-scope` on the **target**, with the operator's explicit authorization for the replication set.

## When NOT to use

- To author a NEW or *derivative* agent — use `scope-agent-lite` → `author-soul` → `author-skills`.
  Replication copies an existing identity verbatim; it never spawns a new distinct agent from another's soul.
- To "improve" souls/skills mid-migration — replicate verbatim, then make changes as a separate, deliberate authoring act.
- When source and target are the same namespace (no-op / overwrite risk).
- Without target authoring scope, or to bulk-publish around the per-publish human gate.

## Inputs

- A grounded **source** namespace route and the `agent_id`(s) to replicate (or "all active").
- A **target** namespace route with a granted authoring scope (`grant-authoring-scope`).
- The operator's explicit authorization for THIS replication set (which source, which target, which agents) — bounded, not standing.

## Procedure

1. **Confirm authorization + scope.** `grant-authoring-scope` has run for the **target**. Confirm the
   operator's explicit authorization for this replication set (source → target, named `agent_id`s) — a
   bounded, named batch. This does not pre-authorize any publish.
2. **Export from source (read-only, verbatim).** Ground the source (`discover-namespace`). For each
   `agent_id`: confirm active+published (`list_agents` / `agent_interface_status`), then read the
   authoring artifacts unchanged — `agent_soul_get` (soul body), `agent_skill_list` + `agent_skill_get`
   per skill (body, slug, name, display_order), `agent_install_layout_list` + `agent_install_layout_get`
   per `client_profile` (the ADL v2 specs), and `get_agent_identity` (display_name). Record the source
   `published_version` for provenance.
3. **Stage locally.** Write the exported artifacts to the local fs (the staging ground): `soul.md`,
   `skills/<slug>/SKILL.md`, `layouts/<profile>.json`, plus a manifest (`agent_id`, display_name,
   source `published_version`, checksums). These are small authoring-artifact bodies (a full soul is
   ~12 KB) read via the `_get` calls in step 2 — the bytes→disk-not-through-context rule is the
   *install-pack* discipline from `materialize-agent` (truncation risk) and does not apply to these
   `_get` bodies. What matters here: stage the verbatim copy to disk for review + checksum before any
   re-upsert. This is the reviewable copy.
4. **Re-point to target + prepare its catalog.** `configure-namespace` → target route; re-ground
   (`discover-namespace`). Confirm the authoring tools are present, and that every non-built-in
   `client_profile` the layouts use (e.g. `antigravity`) is registered in the target's install-profile
   catalog — `agent_install_profile_list`; register missing ones with `agent_install_profile_upsert`
   (dash-free tokens) before their layouts, or those layouts install nowhere.
5. **Import into target (verbatim, soul-first).** Per agent: `create_agent` if absent (same `agent_id`
   + display_name) → `agent_soul_upsert` with the **exported body verbatim** (sanctioned same-identity
   migration, not a forbidden transplant) → `agent_skill_upsert` per skill (verbatim body/slug/name/
   display_order; `agent_skill_archive` any target-only strays so the `for_each: skills` fanout matches)
   → `agent_install_layout_upsert` per profile (verbatim ADL spec). Soul before skills before layouts.
6. **Validate + publish (two gates, per agent).** Per agent + supported render client:
   `agent_interface_validate` (fresh, must pass — never publish on failed/unrun/stale) and
   `agent_interface_status`; then `agent_interface_publish(direct_user_authorization=true)`. The step-1
   set-authorization bounds only *which* agents are eligible — it never authorizes a publish. Obtain the
   operator's direct authorization for THIS specific agent's publish before setting the flag — per
   agent, never inherited from the set grant and never one blanket "OK" for all. Re-validate
   post-publish; confirm `installable`.
7. **Reconcile + report.** Compare each target published agent against the staged source (soul/skill/
   layout coverage + checksums). Report per agent: source `published_version` → target
   `published_version`, skills/layouts replicated, validate/publish result. Flag any agent that did not
   round-trip.

## Outputs

- The named source agents republished in the target namespace **verbatim**, validated installable,
  with a provenance report (per agent: source → target version, what was copied, gate results).

## Red flags

- Routing replication through `scope-agent-lite` / composing a fresh soul — that is authoring a new
  agent, not replicating an existing one.
- Editing a soul/skill/layout during the copy ("while I'm here") — replicate verbatim; changes are a
  separate authoring act.
- Bulk-publishing as a side-effect of the scope grant or one blanket "OK" — each publish gets its own
  fresh per-agent human authorization and a fresh per-agent validate; the bounded set only scopes which
  agents are eligible.
- Source == target namespace (overwrite risk), or skipping target custom-profile registration (layouts
  present but uninstallable).
- Re-upserting from memory without first staging the verbatim, checksummed copy to disk for review.

## After completing

- Optionally `materialize-agent` + `verify-install` to pull a replicated agent down on the target host;
  or `update-namespace-install` to keep a local materialization in sync. Report the set's provenance to the operator.
