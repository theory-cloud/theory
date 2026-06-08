---
name: review-surface-application
description: Use to review how a consumer app (FaceTheory, autheory, theory-mcp-server) is applying the Theory Cloud design system. Checks token bindings, surface-chip usage, header patterns, signature-geometry adherence, and voice consistency. Produces a review report, not code changes in the consumer app.
---

# Review a surface application

theory-cloud-design doesn't render UIs directly — consumer apps do. This skill is how you verify that consumers are applying the design system correctly. The output is a review report with findings; you do not edit consumer-app code. Fixes belong to the consumer's steward.

## When this skill runs

Invoke this skill when:

- A consumer app has completed a reskin milestone and the team wants verification before release
- Someone reports visual inconsistency across Theory Cloud surfaces
- A user asks "does autheory's hosted-auth page match the brand?"
- A new consumer app is onboarding the design system for the first time
- A release-candidate consumer app wants brand sign-off before promotion

## Preconditions

- **The consumer app is named.** FaceTheory, autheory (specifically `hub-admin-portal`), theory-mcp-server (specifically `control-plane`), or a future app.
- **The specific surfaces / screens being reviewed are enumerated.** "Review autheory" is too broad; "review autheory's sign-in, sign-up, MFA challenge, and account management screens" is a review.
- **The app's current pin of theory-cloud-design and FaceTheory is known.** Behavior can differ by pin; the review is against specific versions.
- **MCP tools healthy**, `memory_recent` first.

## The review dimensions

Every surface application is reviewed across these dimensions:

### 1. Token binding correctness

**Check**:
- Does the app consume tokens through FaceTheory's `StitchTokenSet` surface dimension, or does it hardcode color / spacing / typography values?
- If tokens are consumed, is the correct surface variant active for the surface being rendered (Core, MCP, Auth)?
- Are there any values that duplicate a token but diverge slightly (e.g. `#2FA8FF` appearing somewhere when the canonical value is `#2EA7FF`)?
- Are there any unauthorized accents in the palette — a green or orange "just for this callout" — that aren't in the token sets?

**Tools**:
- Grep the consumer-app codebase for color hex values and confirm they all resolve through tokens
- Diff the computed styles of rendered surfaces against what the active surface variant should produce
- Check for any `@emotion`, `styled`, or CSS paths that specify values outside the token system

### 2. Surface-chip and header pattern adherence

**Check**:
- Does the app use FaceTheory's `BrandHeader` component with the correct surface label?
- Does the header render as `Theory Cloud [Core|MCP|Auth]` with the master brand prominent and the surface chip subordinate?
- Does the chip use the correct surface-specific tinting from the active token variant?
- Is the chip compact and context-giving, or has it grown into a second logo?
- Is the Theory Cloud wordmark present in the header, or has it been dropped "to save space"?

**Reference**: `theory_cloud_branding_package.md` §30.C, §30.D.

### 3. Signature geometry and motifs

**Check**:
- Do cards and panels use modular rectangular segmentation with a single curved internal highlight, per the signature UI pattern (§11)?
- Do layouts use clean orthogonal alignment, or have they drifted into rounded SaaS blobs?
- Are phi-based proportions used where size relationships matter?
- Is the Core Blue → Violet Signal gradient used only in hero moments, or has it leaked into body UI (buttons, inputs, standard cards)?
- Are spiral-informed curves used where they echo the icon, or have arbitrary curves been introduced?

**Reference**: `theory_cloud_branding_package.md` §8, §11.

### 4. Motion language

**Check**:
- Do transitions and animations follow the approved motion patterns (segmented alignment, single-curve passes through the core, subtle gradient pulses)?
- Are any forbidden motion patterns in use (elastic bounces, dramatic cinematic effects, particle swarms, excessive glow trails)?
- Does motion feel "structured first, intelligent second," or does it feel consumer-SaaS-playful?

**Reference**: `theory_cloud_branding_package.md` §10, §27.H.

### 5. Voice and copy

**Check**:
- Does user-facing copy follow the voice standards (precise, calm, technical, confident, thoughtful)?
- Are any forbidden phrases present ("revolutionary," "magic," "unlock the future," vague hype)?
- Do labels use canonical terminology (`Theory Cloud`, `[Core]`, `[MCP]`, `[Auth]`, surface role names per §30) rather than ad-hoc naming?
- Does the copy read like "a systems company with taste," or does it read like generic SaaS marketing?

**Reference**: `theory_cloud_branding_package.md` §13, §27.I.

### 6. Asset usage

**Check**:
- Is the Theory Cloud icon used in its canonical form (not distorted, rotated, redrawn, or over-glowed)?
- Is the wordmark present as Adjusted Neutral Sans, not substituted with another font?
- Are favicons, app-tiles, and open-graph images the release-tarball-shipped versions, not ad-hoc screenshots?
- On complex imagery (if any), is the logo contained with proper clearspace?

**Reference**: `theory_cloud_branding_package.md` §4, §27.E.

### 7. Three-surface consistency

**Check**:
- If the review spans multiple surfaces, do Core, MCP, and Auth read as contextual variations of one brand, or do they feel like separate brands?
- Are the inter-surface accent calibrations following the §29.F strategy (Core slightly more Blue-forward, MCP slightly more Violet-forward, Auth more restrained)?
- Do transitions between surfaces preserve continuity (account state, header layout, spacing, motion)?

**Reference**: `theory_cloud_branding_package.md` §29, §30.G.

## The review walk

1. **Set up the review environment.** Confirm the consumer app is running (locally or at a preview URL), at the exact pin versions being reviewed.
2. **For each dimension above, produce a dimension-level finding**: pass, pass-with-notes, or fail. Each fail or pass-with-notes cites the specific brand-document section that governs and names the specific consumer-app path (file:line or URL) where the issue exists.
3. **Classify each finding**:
   - **Token binding issue** — fix in consumer app (consumer's steward)
   - **FaceTheory primitive issue** — fix in FaceTheory (FaceTheory's steward)
   - **Brand-pack gap** — missing token, missing asset, missing rule in theory-cloud-design (your work to scope)
   - **Brand-document ambiguity** — spec is unclear; the consumer made a reasonable choice but the document doesn't resolve it (spec-level conversation)
4. **Rank findings by severity**:
   - **Blocker** — the surface cannot ship as-is without violating the brand contract
   - **High** — visible drift that should be fixed before the next release
   - **Medium** — non-urgent but worth correcting in the next iteration
   - **Low** — cosmetic or aspirational

## Output

```markdown
## Surface application review

### Consumer app
<name, specific surfaces reviewed, pin versions of theory-cloud-design and FaceTheory>

### Dimension findings
1. **Token binding correctness**: <pass / pass-with-notes / fail — details>
2. **Surface-chip and header pattern**: <pass / pass-with-notes / fail — details>
3. **Signature geometry and motifs**: <pass / pass-with-notes / fail — details>
4. **Motion language**: <pass / pass-with-notes / fail — details>
5. **Voice and copy**: <pass / pass-with-notes / fail — details>
6. **Asset usage**: <pass / pass-with-notes / fail — details>
7. **Three-surface consistency**: <pass / pass-with-notes / fail — details>

### Findings, classified and ranked

#### Blockers
- <finding> — classification: <consumer-app / FaceTheory / brand-pack gap / document ambiguity> — section: <brand-doc cite>

#### High
- <finding> — classification — section

#### Medium
- <finding> — classification — section

#### Low
- <finding> — classification — section

### Overall verdict
<ready-to-ship / fix-blockers-first / fix-blockers-and-high / broader-rework-needed>

### Handoffs
- **Consumer-app fixes** → <consumer's steward>
- **FaceTheory primitive fixes** → FaceTheory's steward
- **Brand-pack gaps** → theory-cloud-design (self) → `scope-need` if non-trivial
- **Document ambiguities** → `scope-need` for brand-document clarification
```

## Persist

Review findings that reveal a **pattern** (the same drift appearing across multiple consumer apps, a brand-document ambiguity that keeps producing questions) are high-signal memory material. Individual findings on a specific surface at a specific point in time are less valuable unless they're non-obvious.

## Handoff

- **Consumer-app fixes** — report to the user. The consumer's steward owns the fix; you do not edit consumer-app code.
- **FaceTheory primitive fixes** — report to the user for coordination with FaceTheory's steward.
- **Brand-pack gaps** — invoke `scope-need` if the fix involves new tokens, assets, or document sections.
- **Brand-document ambiguities** — invoke `scope-need` with the user's explicit authorization to propose a document edit.
- **All-pass reviews** — deliver the report and stop. A clean review is a complete skill run.
