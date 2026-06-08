---
name: debug-retrieval
description: Use when a KnowledgeTheory query is returning wrong results — HTTP 403, empty responses, wrong ranking, stale content, missing modules from list, or `knowledge_query_downstream_rejected` from theory-mcp-server. Deep-dive investigation focused on the query plane and its authorization boundary.
---

# Debug a retrieval failure

Retrieval failures are where the stewardship role earns its keep. A wrong query result reaches every downstream consumer; a silent one reaches them without warning. This skill is the structured deep-dive that `investigate-issue` hands off to when the symptom is retrieval-specific.

## Capture the exact call

Before anything else, pin down:

- **Stage** — `lab` or `live`?
- **Frontend** — was the call via `theory-mcp-server` (which path? namespace or agent endpoint? partner-scoped?), `pai-socket`, or direct SigV4 from an operator terminal?
- **Tool / endpoint** — `list_knowledge_bases`, `query_knowledge`, `get_unit`, or something else?
- **Inputs** — `query`, `module` (or `kb_name`), `max_results`, any filters, any `expand_graph`
- **Response** — HTTP status, KT-side error code (`knowledge_query_downstream_rejected`, `unknown_module`, `unauthorized`, etc.), body excerpts
- **Expected** — what the caller thought should come back

`memory_recent` for any prior retrieval investigations against the same stage/module.

## The four-layer model

Retrieval failures live in one of four layers. Diagnose them in order:

1. **Transport / auth** — did the call reach KnowledgeTheory at all? SigV4 signature valid? IAM principal trusted? Frontend credentials valid?
2. **Caller context** — did KnowledgeTheory receive a well-formed `caller_context`? Fields populated: `tenant_id`, `client_namespace`, `allowed_kbs`, optional `partner_id`?
3. **Entitlement resolution** — does the requested `module` / `kb_name` appear in the caller's `allowed_kbs`? Does the access-policy check pass? Does the manifest know about the module at all?
4. **Retrieval execution** — once authorized, did the compiled query actually find and rank the right content? Are there stale indexes, missing units, wrong filters?

A failure in layer N makes layer N+1 irrelevant. Do not investigate retrieval execution when the caller context is wrong; you will chase a ghost.

## Layer 1: transport and auth

Signals:

- HTTP 401, 403 at the transport level
- "Signature does not match" errors
- SigV4-unrelated TLS failures
- Cloudwatch `AccessDenied` on the KT Lambda

Checks:

- `aws sts get-caller-identity` from the calling context (frontend Lambda role, operator terminal)
- Verify the frontend's IAM role has `lambda:InvokeFunction` or the appropriate `execute-api:Invoke` on the KT route
- Check the KT Lambda's resource policy if it uses one
- If the call is from `theory-mcp-server`, verify its Lambda role trust is correct

If layer 1 is clean, move on.

## Layer 2: caller context

Signals:

- KT returns `invalid_caller_context` or similar validation error
- KT logs show missing `tenant_id` or missing `client_namespace`
- The query reached KT but the context is empty or partial

Checks:

- Inspect the KT Lambda's structured logs for the request to see the received `caller_context`
- Trace backward through the frontend: how did the frontend construct the context? For `theory-mcp-server` this lives in the tools implementation (`internal/mcp/tools/query_knowledge.go` and friends).
- Per `theory-mcp-server/SPEC.md` §12.3, the required fields are `caller_service`, `access_mode`, `tenant_id`, `client_namespace`, `endpoint_kind`, `allowed_knowledge_bases`, `scope_assertions`.

A missing or malformed field here is almost always a frontend bug, not a KT bug — but either way, flag it cleanly.

## Layer 3: entitlement resolution

This is where `knowledge_query_downstream_rejected` and unexpected empty KB lists live. Signals:

- `knowledge_query_downstream_rejected`
- `unknown_module` when the user is sure the module exists
- `list_knowledge_bases` returns a module but `query_knowledge` for the same module fails
- Partner-scoped KB rejected on a non-partner-scoped route

Checks:

1. **Does the module exist in the manifest cache?** Inspect `manifest.json` in the stage's S3 bucket. Check the `access_tier` and any partner metadata.
2. **Does `caller_context.allowed_kbs` actually contain the requested module?** Log inspection, or reconstruct what the frontend would compute from its own state.
3. **Is the module partner-scoped?** Per `theory-mcp-server/SPEC.md` §8.4, partner-scoped KBs require a routed `partner_id` from the path, not just namespace entitlement. A namespace-endpoint call to a partner KB will correctly fail here — listing might still advertise it if the listing and entitlement paths disagree.
4. **Is there a listing/querying mismatch?** If `list_knowledge_bases` advertises what `query_knowledge` cannot serve, the listing is using the manifest cache without filtering by the same effective allow-set the query path enforces. This is a frontend bug in `list_knowledge_bases` and not a KT bug, but confirm which side you're on before reporting.
5. **Is the access policy record present?** For agent endpoints, check `KnowledgeAccessPolicy` rows in the frontend's TableTheory state.

Common verdicts:

- *"The module is partner-scoped and the caller's route lacks partner_id."* Not a bug; the fail-closed is working as designed.
- *"Listing advertises a KB the query path rejects."* Frontend bug; filter listing by the same allow-set.
- *"caller_context is missing the module because the frontend never added it to the access policy."* Data bug in the frontend's tenant configuration.
- *"The manifest is stale and doesn't reflect a recent publish."* A publish-pipeline issue, not an entitlement issue — escalate to `publish-kb` or `validate-snapshot`.

## Layer 4: retrieval execution

Once you know the call is authorized, look at retrieval itself. Signals:

- Empty results but the unit is known to exist
- Wrong ranking order
- Stale content returned (old version of a unit that was recently republished)
- Cross-module leakage (results from a module that shouldn't be in `allowed_kbs`)

Checks:

1. **DynamoDB content table** — is the unit present? What version? Query by `unit_id`.
2. **S3 Vectors** — is the unit's semantic chunk indexed in the stage's S3 Vectors bucket? Check index freshness.
3. **Manifest** — does the manifest's `module` entry point at the right state? Unit count plausible?
4. **Search path** — `internal/search/` and `internal/handlers/`. Are the filters being applied correctly? Is the embedding model producing stable vectors?
5. **Cross-repo** — does `pai-socket`'s retrieval semantics still work identically per `spec/knowledge-access-contract.md`? If one frontend works and the other doesn't, that's a contract divergence.

## Output

```markdown
## Retrieval failure investigation

### Call
<stage, frontend, tool, inputs, response>

### Layer diagnosis
1. Transport/auth: <verdict>
2. Caller context: <verdict>
3. Entitlement resolution: <verdict>
4. Retrieval execution: <verdict>

### Root cause layer
<which layer the root cause is in>

### Root cause verdict
<specific finding>

### Where the fix belongs
<KnowledgeTheory / theory-mcp-server / pai-socket / shared contract / data-level operator action>

### Proposed next skill
<fix directly / scope-need / validate-snapshot / publish-kb / none — report to other steward>
```

## Persist

Retrieval failures recur in predictable shapes — the same layer-level mismatches surface across different modules and stages. Append when the investigation uncovers a non-obvious finding (a specific frontend/KT contract mismatch, a stale-manifest pattern, a consumer-configuration gotcha) that future-you would want to recall. Routine typos aren't memory material.

## Handoff

- If the root cause is in KnowledgeTheory and is small, fix directly after user approval.
- If the root cause is in KnowledgeTheory and is a design gap, invoke `scope-need`.
- If the root cause is a stale manifest or publish, invoke `publish-kb`.
- If the root cause is a corrupted snapshot or missing units, invoke `validate-snapshot`.
- If the root cause is in `theory-mcp-server` or `pai-socket`, **report it to the user cleanly** and do not cross the steward boundary.
