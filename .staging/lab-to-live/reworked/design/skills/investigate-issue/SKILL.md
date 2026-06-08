---
name: investigate-issue
description: Use when a user reports a bug, regression, or unexpected behavior in theory-cloud-design — a token that looks wrong in a consumer app, a missing asset, an inconsistent header rendering, or brand-drift signals. Runs before any fix is proposed. Produces an investigation note, not a patch.
---

# Investigate an issue

Investigation comes before implementation. A fix written against a misunderstood symptom ships new bugs — and for a brand pack, wrong fixes cascade through FaceTheory into every consumer app and land in real users' browsers as visual inconsistency.

## Start with memory

Call `memory_recent` first. Scan for prior investigations in the same subsystem — token sets, icon assets, brand-document sections, the surface-chip pattern, release packaging, consumer cascades.

## Capture the claim precisely

Record the user's report literally, then extract:

- **Symptom** — what the user observed, verbatim where possible; include a screenshot reference or a specific page if the symptom is visual
- **Surface** — Core, MCP, Auth, or cross-surface
- **Consumer app** — FaceTheory itself, autheory (`hub-admin-portal`), theory-mcp-server (`control-plane`), or theory-cloud-design directly (an asset or document issue)
- **Release version** — which `theory-cloud-design` tarball is the consumer pinned to? Which FaceTheory release does that pin imply?
- **Token / asset / rule** — if specific, which exact one?
- **Expected vs actual** — what the user thought should render
- **Reproduction path** — URL, screen, or command to trigger

## Ground the investigation

Your first structural questions are always:

1. **Is this a brand-document violation?** If the symptom contradicts `theory_cloud_branding_package.md`, the document is authoritative and the symptom is the bug. Cite the section that governs.
2. **Is this a token-set issue or a consumer-app issue?** If the token value in theory-cloud-design is correct but the consumer app isn't reading it (hardcoded a color, used the wrong surface, reached around the `StitchTokenSet` dimension), the root cause is in the consumer app, not here.
3. **Is this a FaceTheory primitive issue?** If the `BrandHeader` or Topbar slots aren't consuming the tokens correctly, the fix belongs in FaceTheory, not here.
4. **Is this a release pinning issue?** If the consumer is pinned to a stale tarball version, the symptom may already be fixed on `main` and the fix is "update the pin" in the consumer app.
5. **Is this a cross-surface consistency issue?** If the rendering differs between Core / MCP / Auth in a way the brand document doesn't sanction, that's a drift finding.

## Evidence before hypotheses

Gather before theorizing:

- `git log` on `tokens/`, `assets/`, and `theory_cloud_branding_package.md` since the release the consumer is pinned to
- The specific token values in the current repo vs what the consumer app resolved at build time
- The FaceTheory release the consumer app pins, and whether it consumes the current `StitchTokenSet` shape
- A rendered reference of the symptom from the consumer app (screenshot, DOM inspect, computed style)
- `query_knowledge` for cross-repo context — FaceTheory primitives, autheory's UI/reskin planning docs, theory-mcp-server's control-plane structure

If `memory_recent` or `query_knowledge` returns an auth error, stop — investigating brand issues without context continuity produces hypotheses against yesterday's taste.

## The three-surface matrix

For visual symptoms that might cut across surfaces, build this matrix:

| | Core | MCP | Auth |
|---|---|---|---|
| Symptom reproduces? | ? | ? | ? |
| Expected per brand document? | ? | ? | ? |

A symptom that reproduces only on one surface localizes to that surface's token variant. A symptom on all three is a base-token or primitive issue. A symptom on two but not the third is drift between surface variants, which is one of the worst findings because it usually means someone copy-pasted a variant and tweaked it.

## Rank hypotheses by evidence

List theories in descending order of support:

1. **Hypothesis** — one sentence
2. **Evidence for** — commits, token values, consumer-app build references, brand-document citations
3. **Evidence against** — what would be true if this were wrong
4. **Verification step** — the cheapest test to prove or disprove it

## Output: the investigation note

```markdown
## Reported symptom
<verbatim, with screenshot reference if available>

## Surface / consumer / version
<extracted dimensions>

## Brand-document section governing this behavior
<citation from theory_cloud_branding_package.md, or "none — this is a tooling / packaging issue">

## Three-surface matrix (if applicable)
| | Core | MCP | Auth |
|---|---|---|---|
| Symptom reproduces? | ... | ... | ... |
| Expected per brand document? | ... | ... | ... |

## What is definitely true
<verified facts>

## Hypotheses (ranked)
1. <hypothesis> — evidence: <...>
2. <...>

## Verification step
<the one thing to run next>

## Proposed next skill
<investigate-issue again / fix directly / scope-need / audit-brand-compliance / review-surface-application / none — cross-repo report>
```

## Persist

Append only if the investigation surfaces something worth remembering — a recurring drift pattern, a non-obvious consumer coupling, a brand-document ambiguity that needs resolution. Routine "typo in a token" findings aren't memory material.

## Handoff rules

- **Brand-compliance question** (does this asset / UI match the brand document?) — invoke `audit-brand-compliance`.
- **Consumer-app misuse** — invoke `review-surface-application` against the specific consumer.
- **Small, contained fix** in a token, asset, or document line — fix directly after user approval.
- **Design gap** (the brand document doesn't cover the need) — invoke `scope-need`.
- **Cross-repo finding** (the fix belongs in FaceTheory, autheory, or theory-mcp-server) — report cleanly to the user and do not cross the steward boundary.
