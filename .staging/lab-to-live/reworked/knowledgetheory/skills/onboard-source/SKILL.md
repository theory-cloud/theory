---
name: onboard-source
description: Use when adding a new knowledge source to a KnowledgeTheory module — a new git repo path, S3 prefix, HTTP endpoint, or generated-artifact producer. Walks the source kind, connector, access policy, and registry-seeding work.
---

# Onboard a knowledge source

A knowledge source is a configured upstream content system that feeds a KnowledgeTheory module. Onboarding one is a structured conversation plus a handful of commits plus a registry update plus a first publish exercise.

## Preconditions

- **The target module is named.** You onboard sources into a specific `module`. If the user is onboarding into a *new* module, that's a bigger conversation — run `scope-need` first to shape the new-module work, because module creation has schema, authorization, and frontend coordination implications that source onboarding does not.
- **The source kind is plausibly supported.** KnowledgeTheory supports source kinds through connectors. If the source kind is already implemented (git, S3, HTTP, etc.), this is an onboarding job. If it isn't, the first milestone is *building the connector*, which is a bigger conversation — run `scope-need`.
- **MCP tools healthy**, `memory_recent` first.

## The interview

Before touching code or registry state, ask the user:

1. **Target module and stage.** Lab-first always; live onboarding happens after lab validates.
2. **Source kind.** Git? S3? HTTP? Wiki? Generated artifact?
3. **Source location.** Repo URL + path + branch? S3 bucket + prefix? HTTP endpoint + auth?
4. **Access and credentials.** What credentials does the ingestion plane need to reach the source? Where do they live (Secrets Manager, SSM SecureString, IAM role)? Who authorized them?
5. **Refresh policy.** Is this a one-shot import, a scheduled pull, an on-demand pull, or a push-driven feed? For scheduled: how often?
6. **Normalization expectations.** What does the raw source look like, and what does a compiled knowledge unit from this source look like? Is there a parser transformation required?
7. **Authorization tier.** Public, tenant-scoped, partner-scoped, or internal-only? This affects both `access_tier` on the produced units and the `KnowledgeAccessPolicy` rows the frontends need.
8. **Consumer impact.** Is the user expecting `theory-mcp-server`'s `apptheory` agent (or whoever) to immediately see this content once it's published? If yes, the frontend's entitlement state may need to be updated — which is a cross-repo coordination item, not a KT commit.

## The onboarding walk

A typical source onboarding touches these surfaces, in roughly this order:

1. **Source registry entry** — `make <kb>-seed-registry ...` with the new source pointer. This is usually the *last* step in the working sequence, but it's where you confirm the other pieces are in place.
2. **Connector configuration** — if the connector needs per-source config (rate limit, headers, allow-list), that config lives in KT state. Check `internal/ingest/` and `internal/registry/` for where connector config is held.
3. **Credential wiring** — confirm the ingestion plane's IAM role has access to the credential secret. If new, create the secret, update the IAM role, and verify reachability from the ingestion Lambda.
4. **Parser and normalizer** — if the source requires a new parser transformation (because the content shape is unlike anything existing), that's a compiler-plane change. Implement it under `internal/parser/` and validate it emits correctly-shaped units against `schema/unit.schema.json`.
5. **Access policy overlay** — if the frontend needs to know about this content for authorization, the access policy work happens in the *frontend* (`theory-mcp-server`'s TableTheory records), not in KT. Flag this as cross-repo coordination and report it to the user.
6. **Operator target** — if the KB doesn't already have an operator target sequence (`canonical-source`, `sync-source`, `seed-registry`, `trigger-publish`), add or update the `Makefile` targets to include the new source.
7. **Gov-infra** — if this source onboarding introduces a new source kind or a notable configuration pattern, update `gov-infra` evidence or verifiers to track it.
8. **Docs** — update relevant spec documents and `runbooks/` so the next operator (or the next version of you) can find this source.

## First publish validation

Once the source is wired and registered in `lab`:

1. Invoke `publish-kb` for the target module in `lab`.
2. Watch the ingestion phase carefully — new sources fail here most often (credentials, reachability, unexpected shape).
3. Watch the compilation phase for validator complaints — new sources often expose edge cases the existing parser didn't plan for.
4. After a successful publish, exercise retrieval against the stage's frontend endpoint and confirm the new content is discoverable and correctly shaped.

Only after `lab` is stable do you consider repeating the onboarding in `live`.

## Refusal cases

- **"Onboard this source directly by bypassing the snapshot step, it's small."** No. Every source produces a snapshot. No exceptions.
- **"Give the connector write access to the content store so it can skip the publish pipeline."** No. Ingestion never writes to the compilation side's data stores directly.
- **"Wire up the source with personal credentials."** No. Credentials live in Secrets Manager or equivalent, attached to the ingestion plane's IAM role, not to a human identity.
- **"Onboard the source to `live` first to see if it works."** No. Lab-first, always, for sources as for code.
- **"Add a connector that fetches content at query time instead of at ingestion time."** No. That re-entangles the planes.

## Output

```markdown
## Onboarded source

### Target
- Module: <module>
- Stage: <stage>
- Source kind: <git / S3 / HTTP / etc.>
- Source location: <...>
- Refresh policy: <...>
- Access tier: <public / tenant / partner / internal>

### Changes made
<enumerated list of commits, config updates, registry edits, and credential wiring>

### First publish outcome
<from publish-kb run>

### Frontend impact
<cross-repo coordination needed with theory-mcp-server or pai-socket, or "none">

### Promotion readiness
<lab observed behavior, criteria to meet before onboarding in live>
```

## Persist

Source onboardings are infrequent and each one has distinctive context. Append when the onboarding exposes a non-obvious wiring detail, a source-shape surprise, or a cross-repo coordination finding worth recalling. The source location and access tier alone are searchable in the registry — not memory material on their own.

## Handoff

- If the first lab publish succeeded and the user wants to continue, invoke `publish-kb` again for a follow-up cycle, or leave it for the scheduled refresh.
- If a cross-repo access-policy update is needed, surface it to the user for coordination with the frontend's maintainer.
- If the first publish revealed a parser or validator issue, invoke `validate-snapshot` or `investigate-issue`.
- If the onboarding is complete and running cleanly, stop.
