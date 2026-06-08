---
name: audit-brand-compliance
description: Use to check a specific asset, UI, copy block, or motion proposal against the master brand document. Narrower than review-surface-application — this checks a single deliverable, not a whole consumer surface. Applies the "avoid" lists from theory_cloud_branding_package.md as a systematic gate.
---

# Audit brand compliance

This skill is the gate between "this looks okay" and "this ships under the Theory Cloud name." It takes a specific deliverable — an asset, a UI mockup, a copy block, a motion spec, a new brand graphic — and checks it systematically against `theory_cloud_branding_package.md`. The output is a compliance verdict with citations, not a redesign.

## When this skill runs

Invoke this skill when:

- A new asset has been proposed (icon variant, hero graphic, social template, documentation cover)
- A consumer app is shipping copy that will appear on a Theory Cloud-branded surface
- A motion treatment has been prototyped and needs brand sign-off
- A marketing surface has been designed and needs a brand check before it goes live
- Someone asks "is this on-brand?"

## Preconditions

- **The specific deliverable is identified.** A file path, a screenshot, a copy block, a prototype URL, a Figma link — something concrete to audit against.
- **The deliverable's purpose is named.** "Cover art for the Theory Cloud docs site," "hero graphic for the theorymcp.ai launch page," "microcopy for autheory's password reset flow." Purpose shapes which sections of the brand document govern.
- **MCP tools healthy**, `memory_recent` first.

## The audit checklist

The brand document is densely populated with explicit "avoid" rules. This skill treats those rules as a systematic gate. For each applicable category, check the deliverable against the forbidden list and the approved list.

### Logo and icon checks

**Forbidden** (`theory_cloud_branding_package.md` §4):
- Stretched or distorted logo
- Rotated icon
- Drop shadows in standard use
- Over-glowed spiral
- Redrawn internal curve
- Placement on visually noisy backgrounds without containment
- Multiple competing gradients at once

**Required**:
- Clearspace equal to the width of one structural segment (§4, §27.E)
- Minimum sizes: 20px digital icon, 120px wordmark lockup, 8mm print (§4)
- Monochrome version (black, white, or single dark brand tone) available when context demands it (§3)

### Color checks

**Approved palette only** (§6, §27.C):
- Midnight `#081226`, Core Blue `#2EA7FF`, Violet Signal `#7A5CFF`, Ice White `#F4F8FF`
- Steel `#6F7D95`, Mist `#DCE6F5`, Graphite `#1C2433`
- Phi Gold `#C9A96B` (reserve accent only)

**Forbidden**:
- Unauthorized colors (greens, oranges, reds, unless the deliverable is explicitly documentational and references a specific non-brand reference)
- Slightly-off values (e.g. `#2FA8FF` instead of the canonical `#2EA7FF`)
- Gradients in body UI (the Core Blue → Violet Signal gradient is restricted to hero moments, logo highlights, motion treatments, and key marketing assets per §6)

### Typography checks

**Approved directions** (§7, §27.D):
- Adjusted Neutral Sans wordmark (locked)
- Inter / Geist / Suisse Int'l as primary sans references
- JetBrains Mono / Geist Mono / IBM Plex Mono as monospace companions

**Forbidden** (§20):
- Futuristic stencil fonts as wordmark
- Sharp sci-fi terminal fonts as primary wordmark
- Crypto or gaming aesthetics
- Exaggerated custom ligatures
- Overly wide tracking

### Shape and layout checks

**Approved** (§8, §27.G):
- Modular rectangular segmentation
- Quarter curves and spiral-informed inner radii
- Clean orthogonal alignment
- Phi-adjacent proportional thinking
- Thin technical linework

**Forbidden**:
- Random rounded SaaS blobs
- Decorative mesh gradients everywhere
- Overly organic AI visuals
- Crypto/gaming visual language

### Illustration and imagery checks

**Forbidden** (§9):
- Robot heads
- Brains
- Generic chat bubbles
- Cliché circuit motifs
- Stock "AI" visual tropes
- Lifestyle-heavy startup photography

**Approved direction**:
- Abstract systems diagrams
- Layered geometric compositions
- Restrained technical linework
- Subtle glow only where intelligence is being implied

### Motion checks

**Approved** (§10, §27.H):
- Structure first, intelligence second
- Segmented blocks aligning into a system frame
- One arc animating through the core
- Subtle pulse on the inner curve
- Smooth, precise, low-noise behavior

**Forbidden**:
- Flashy elastic effects
- Excessive glow trails
- Particle chaos
- Dramatic cinematic effects that overpower the brand

### Voice and copy checks

**Approved voice attributes** (§13, §27.I):
- Precise, calm, technical, confident, thoughtful
- "A systems company with taste"

**Forbidden phrases**:
- "Revolutionary"
- "Magic"
- "Unlock the future of…"
- "Limitless possibilities"
- Hype language generally
- Vague futurism without concrete capability claims

**Example contrast** (§13):
- **Bad:** "Unlock the future of AI innovation with limitless possibilities."
- **Good:** "Build and deploy intelligent systems with the structure they need to scale."

### Architecture and surface-chip checks

**Required** for any UI deliverable spanning surfaces (§29, §30):
- Master brand (Theory Cloud) prominent
- Surface chip `[Core|MCP|Auth]` contextual, compact, subordinate
- Not treating a surface as a standalone brand
- Accent calibration appropriate to the surface (Core → more Core Blue, MCP → more Violet Signal, Auth → more restrained)

## The audit walk

1. **Identify which checklist categories apply** to the deliverable. An asset audit applies logo/color/shape/illustration. A copy audit applies voice and surface-chip naming. A motion audit applies motion and (if visual) illustration. A full UI audit applies everything.
2. **For each applicable category, check the deliverable against both the forbidden list and the approved list.** Cite specific brand-document sections for each finding.
3. **Produce a verdict per category**: pass, pass-with-notes, fail.
4. **Produce an overall verdict**:
   - **Pass** — compliant, ship as-is
   - **Pass with revisions** — minor fixes needed, no blockers
   - **Fail — revisable** — specific changes will bring it into compliance
   - **Fail — reshape required** — the deliverable is fundamentally off-brand and needs restart

## Output

```markdown
## Brand-compliance audit

### Deliverable
<name, purpose, source reference>

### Applicable categories
<enumerated list of categories that apply to this deliverable>

### Category verdicts

#### Logo and icon
<pass / pass-with-notes / fail>
- <finding>: <description> — §<section cite>

#### Color
<pass / pass-with-notes / fail>
- <finding>: <description> — §<section cite>

#### Typography
<pass / pass-with-notes / fail>
- <finding>: <description> — §<section cite>

#### Shape and layout
<pass / pass-with-notes / fail>
- <finding>: <description> — §<section cite>

#### Illustration and imagery
<pass / pass-with-notes / fail>
- <finding>: <description> — §<section cite>

#### Motion
<pass / pass-with-notes / fail>
- <finding>: <description> — §<section cite>

#### Voice and copy
<pass / pass-with-notes / fail>
- <finding>: <description> — §<section cite>

#### Architecture and surface-chip (if applicable)
<pass / pass-with-notes / fail>
- <finding>: <description> — §<section cite>

### Overall verdict
<pass / pass with revisions / fail — revisable / fail — reshape required>

### Required revisions (if any)
<specific changes needed, each citing the brand-document section>

### Recommended refinements (non-blocking)
<polish-level suggestions>
```

## When the audit fails

- **Describe the failure in terms of the brand document**, not in terms of taste. "Violates §10's approved motion patterns because the proposal uses particle swarms" is useful feedback. "Feels too flashy" is not.
- **Offer the path to compliance** when obvious. If the deliverable uses the wrong gradient direction, the fix is "use the Core Blue → Violet Signal gradient, applied only to the hero focal point per §6."
- **Escalate spec-level conflicts.** If the deliverable's purpose genuinely cannot be achieved within the current brand document, the conflict is a spec-level conversation (invoke `scope-need`), not a rejection of the deliverable.

## Refusal cases

- **"Pass this deliverable even though it uses 'revolutionary' in the headline; we can fix copy later."** No. The audit is the gate. Shipping now and fixing later produces drift.
- **"The purple in this asset is close enough to Violet Signal."** No. Either it's `#7A5CFF` or it's not, and "close enough" is how drift compounds.
- **"This deliverable is just for internal use; strict compliance doesn't matter."** No. Internal drift becomes external drift when internal assets get repurposed. Compliance applies to every Theory Cloud-labeled artifact.
- **"Pass this as-is and open a brand-document discussion later to legitimize the deviation."** No. If the document needs to change, it changes first, then the deliverable complies with the changed document.

## Persist

Audits that surface **recurring failure patterns** (the same brand-document rule being violated across multiple deliverables, the same ambiguity producing repeated questions) are high-signal memory material. Individual one-off findings usually aren't.

## Handoff

- **Pass with revisions** — deliver the report with specific required revisions. The deliverable's author makes the fixes and returns for re-audit if needed.
- **Fail — revisable** — deliver the report with the path to compliance. The author reshapes.
- **Fail — reshape required** — deliver the report with a clear statement that this deliverable's approach cannot be made compliant without fundamental changes. Often this means invoking `scope-need` for a different approach.
- **Brand-document gap** — if the audit exposes a rule that's missing or ambiguous, invoke `scope-need` for a document clarification.
