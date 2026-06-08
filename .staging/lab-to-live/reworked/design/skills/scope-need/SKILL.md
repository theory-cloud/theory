---
name: scope-need
description: Use when a user brings a new capability, asset, token, or brand-document change for theory-cloud-design in vague terms. Interviews conversationally and produces a scoped-need document. Does not write code or edit tokens.
---

# Scope a need

A need arrives fuzzy. A feature arrives sharp. This skill is the conversation that turns one into the other. The output is a document, not code or tokens.

## Your posture

You are interviewing, not pitching. Because theory-cloud-design is the brand pack, the scoping question is always **"does this fit inside `theory_cloud_branding_package.md`, or does it require the brand document to grow, or does it contradict the brand document?"**

The brand document is the spec. Needs that fit inside it are additive. Needs that grow it are spec-level conversations requiring user authorization. Needs that contradict it are high-scrutiny — the convincing question is not "is this useful" but "is the brand document wrong?"

## Start with the brand document, memory, and knowledge

- **Read the relevant section of `theory_cloud_branding_package.md` before the conversation begins.** Every need intersects some part of the document; knowing which part grounds the interview.
- `memory_recent` — has this need or adjacent work been scoped before?
- `query_knowledge` — what does current cross-repo documentation say?

If tools are unavailable, surface it and ask the user to re-auth.

## The interview

Ask, one or two at a time:

1. **Who is asking and why now?** Is this driven by a specific consumer (FaceTheory primitive need, autheory reskin requirement, theory-mcp-server control-plane requirement, future surface), by observed drift, by a marketing surface need, or by an operational gap in the pack itself?
2. **What problem does it solve?** Current pain or gap, not proposed solution.
3. **Which part of the brand system does it touch?** Logo, color, typography, shape language, motion, UI pattern, voice, messaging, architecture, assets, release packaging.
4. **Is this a token change, an asset change, a brand-document change, or multiple?** Each has different cascade implications.
5. **Does this affect the three surfaces asymmetrically?** Does it apply to Core, MCP, Auth, or all three? A change that only affects one surface needs explicit justification — surfaces are contextual, not separate brands.
6. **Who consumes it and how?** Which consumer apps will see this change when they pin a new release? What is the expected downstream work in FaceTheory and in each consumer app?
7. **What does success look like?** Observable. "The login page feels more trustworthy" is not observable; "the `[Auth]` token variant renders surface accents with at most 40% Violet Signal emphasis on the header chip, and the CTA button uses neutral surface over accent-heavy treatments" is.
8. **What is explicitly out of scope?**

## The brand-document-impact question

Before the conversation ends, answer:

> **Does this fit inside `theory_cloud_branding_package.md` as it stands, grow the document additively, or contradict it?**

Three possible answers:

1. **Fits inside the document** — the need can be delivered using existing tokens, existing assets, existing patterns. Happy path.
2. **Additive growth** — requires adding a new token, a new asset in an enumerated category, a new creative-direction prompt, a new surface-specific variant rule. The brand document grows in the same change as the implementation.
3. **Contradicts the document** — requires changing an existing token value, removing a pattern, loosening a visual rule, introducing a pattern the document forbids. High scrutiny. The convincing question is "is the document wrong?" If the document is wrong, the change is a spec-level proposal requiring user authorization, not a token edit.

If you suspect (3), surface it explicitly. The brand document is not infallible, but contradicting it is a decision, not a side effect.

## The three-surface test

Before accepting the scoped need, check: **how does this behave across Core, MCP, and Auth?** If it only makes sense in one surface, the need may be narrower than scoped (a Core-only concern, for example). If it behaves inconsistently across surfaces without a brand-document-sanctioned reason, that's drift in the scope itself and needs reshaping.

## The consumer-cascade test

Check: **what downstream work does this imply?**

- Does FaceTheory need a primitive update?
- Do autheory and theory-mcp-server need to pin a new release and adjust?
- Is there a coordination window required across the four repos?

If the cascade is significant, it belongs in the scoped-need document as a named concern, not as an afterthought.

## Output: the scoped-need document

```markdown
# Scoped Need: <short name>

## Background
<one paragraph of context>

## Driver
<FaceTheory primitive need / autheory requirement / theory-mcp-server requirement / observed drift / future surface / operational gap>

## Problem
<what is broken, missing, or painful today>

## Brand-system area affected
<logo / color / typography / shape / motion / UI pattern / voice / messaging / architecture / assets / release packaging — with the specific SECTION of theory_cloud_branding_package.md named>

## Surfaces affected
<Core / MCP / Auth / all / surface-agnostic>

## Brand-document impact
<fits inside / additive growth / contradicts — with the specific section named and the justification>

## Consumer cascade
<which consumer apps need to pin new releases and what the downstream work looks like>

## Success criteria
<observable, testable conditions>

## Nearest existing surface
<what in theory-cloud-design or the brand document today gets partway there>

## Out of scope
<what this need explicitly does not cover>

## Open questions
<unresolved>
```

## Persist before handoff

Append only if the scoping surfaces something worth remembering — a rejected pattern with a clear reason, a recurring request category, a brand-document ambiguity the conversation exposed. Routine scope completions aren't memory material.

## Handoff

- If approved and the impact is "fits inside" or "additive growth," invoke `enumerate-changes`.
- If the impact is "additive growth" *and* it requires a brand-document section edit, note that `enumerate-changes` will include the document update as an enumerated item (it rides with the tokens or assets it governs).
- If the impact is "contradicts the document," pause and surface explicitly that this is a spec-level proposal. Do not enumerate changes against a contradictory need without explicit user authorization to change the document.
- If the conversation resolved to "this is a FaceTheory primitive concern, not a brand-pack concern" or "the brand document already covers this, here's how," record that and stop. That's a successful scope.
- If the user defers, record it and stop.
