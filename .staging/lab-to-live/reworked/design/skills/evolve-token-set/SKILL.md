---
name: evolve-token-set
description: Use for any controlled change to the Theory Cloud token sets — the base tokens or the per-surface variants (Core, MCP, Auth). Enforces cross-repo consumer-impact analysis so token changes cascade cleanly through FaceTheory into every consumer app.
---

# Evolve a token set

The token sets are theory-cloud-design's external contract. Every consumer app binds to them through FaceTheory's `StitchTokenSet` surface dimension. When a token moves, the cascade reaches every UI surface that carries the Theory Cloud name. This skill is the discipline that keeps token evolution from silently breaking consumers.

## When this skill runs

Invoke this skill for:

- Adding, removing, renaming, or retyping a token in the base Theory Cloud set
- Adding, removing, renaming, or retyping a token in any surface variant (Core, MCP, Auth)
- Changing a token *value* (color hex, spacing scale, motion timing, typography scale, radius size)
- Changing the shape of the typed export (nested structure, new grouping, flattened path)
- Adding a new surface variant (a spec-level event — requires brand-document update first)

Do not edit `tokens/` or the typed exports outside of this skill. There is no "small token change" — tokens are the contract consumers bind to.

## Preconditions

- **User has named the specific change.** "Evolve the tokens" is not an input; "change `core.accent.primary` from `#2EA7FF` to `#33ADFF`" is.
- **`scope-need` has run** for the underlying feature and confirmed the token change is necessary (not just convenient), and has named the brand-document section that justifies the change.
- **MCP tools healthy**, `memory_recent` first.

## The impact analysis

Before you touch a token, enumerate every consumer affected.

### Direct consumers

- **FaceTheory** — consumes the `StitchTokenSet` surface dimension. A token shape change may require a FaceTheory primitive update (Topbar slots, BrandHeader, or the surface dimension definition itself). A token value change is usually transparent to FaceTheory — the primitives don't care what the values are, only that the shape is stable.
- **autheory (`hub-admin-portal`)** — consumes FaceTheory primitives + the `[Auth]` token set. Token changes propagate when autheory pins a new theory-cloud-design and FaceTheory release.
- **theory-mcp-server (`control-plane`)** — consumes FaceTheory primitives + the `[MCP]` token set. Same cascade pattern.
- **Future consumer apps** — whatever apps adopt the pack next.

### Indirect consumers

- **Brand document** (`theory_cloud_branding_package.md`) — token values are cited in the document (color hex codes in §6 and §27.C, spacing rules in §8). A token value change that contradicts the document is a spec-level change; the document must move first.
- **Assets** — icons, wordmarks, and social templates may reference specific token values. If the token value changes, assets may need regeneration.
- **Documentation, examples, and migration notes** — the repo's `README.md` and any embedded examples.

If you cannot identify every consumer class and their pin status, you do not have a complete impact analysis.

## Additive vs breaking

- **Additive** — new optional token that consumers can adopt (or ignore), new surface accent that doesn't change existing values, new token group under an unused namespace. Existing consumer code continues to work without changes.
- **Breaking** — removed token, renamed token, retyped token (e.g. from string to nested object), changed token value that consumers rely on, changed surface variant shape in a way that alters the `StitchTokenSet` dimension contract. Existing consumer code breaks or renders incorrectly.

Token **value changes** are subtler than shape changes. A new hex value for `core.accent.primary` isn't a typecheck break, but it *is* a visual break for consumers — buttons that were `#2EA7FF` now render `#33ADFF`. Treat value changes that would produce visible UI differences as breaking from a consumer-coordination perspective, even when the type system says they're additive.

Be honest about which you're making. A "tiny color adjustment" framed as additive is a breaking change wearing a disguise — consumer apps' visual regression tests may catch it, and their users will notice.

## The sequence for additive changes

1. **Propose the change** to the user with the impact analysis attached and the brand-document section that justifies it cited.
2. **Update the brand document** in the same change if the addition is spec-visible (new color token added to the palette section, new motion timing added to motion rules). Document updates lead; tokens follow.
3. **Add the new token** to the appropriate set (base or surface variant).
4. **Update the typed export** to expose the new token on the consumed surface.
5. **Update documentation** to describe the new token's intended use.
6. **Run validation**: `npm run check` and `npm run build` to confirm the pack still typechecks and packages cleanly.
7. **Cut a release** through normal pipeline discipline. The release notes name the added token.
8. **Notify FaceTheory's steward** that the new token is available. Primitives may or may not need to expose it, depending on whether it's a primitive-level concern.
9. **Downstream consumer adoption is optional and sequential.** Consumers pick up the new token at their own pace; the release does not force migration.

## The sequence for breaking changes

Breaking changes require more coordination.

1. **Stop.** Before anything else, identify every consumer that will be affected and every steward who will need to coordinate — FaceTheory, autheory, theory-mcp-server at minimum. If you cannot name them, the change is not ready.
2. **Propose the change** with a complete migration plan: old shape, new shape, how consumers migrate, whether a dual-shape transition is feasible, what the release ordering looks like.
3. **Update the brand document** if the change is spec-visible. Document moves first.
4. **Coordinate with consumer stewards** before the change lands. A breaking token change is not a theory-cloud-design-only roadmap; it is a cross-repo roadmap with one milestone per repo it touches.
5. **If a dual-shape transition is feasible** — e.g. the token set exports both the old and new names for one release cycle — do that. Deprecate the old name in the changelog, ship the dual-shape version, confirm every consumer has migrated, then remove the old shape in a later release.
6. **If dual-shape is not feasible**, the change must ship as a synchronized update across theory-cloud-design and every consumer simultaneously, around a declared window.
7. **The release uses `feat!:` or `fix!:`** with a `BREAKING CHANGE:` body naming affected consumers and the migration path.
8. **Release notes enumerate the migration** precisely: the old token, the new token, the sed-command or code-mod that consumers run, the surface variants affected.

## Refusal cases

- **"Just rename the token; consumers will catch up."** No. Renames are breaking changes. Consumers do not catch up automatically.
- **"Change the color value slightly; nobody will notice."** No. Visual changes in a brand pack are visible by definition. Coordinate the change.
- **"Add a new surface variant (Status / Billing / whatever) to the token set without a brand-document update."** No. Surfaces are a spec-level concept. Adding one is a brand-document change first, then a token addition.
- **"Ship the token change now; update the brand document in a follow-up."** No. Document moves first or rides in the same commit. Shipping a token that the document doesn't describe creates a spec gap.
- **"Make the new token required immediately."** No. New tokens are additive and optional; required-ness is a breaking change.
- **"Let FaceTheory's primitive hardcode a value instead of consuming the token."** No. Primitives consume tokens through the surface dimension; hardcoding defeats the system.
- **"Publish the new tokens to npm for convenience."** No. Distribution is GitHub Releases only.

## Output

```markdown
## Token evolution

### Files touched
- `tokens/` paths
- `<typed export>` path
- `theory_cloud_branding_package.md` section edits (if applicable)

### Change classification
<additive / breaking>

### Tokens changed
<enumerated — added, removed, renamed, retyped, revalued>

### Brand-document sections affected
<citations from theory_cloud_branding_package.md>

### Consumer impact
- **FaceTheory**: <primitive impact and coordination status>
- **autheory**: <reskin impact and coordination status>
- **theory-mcp-server**: <reskin impact and coordination status>
- **Future consumers**: <how the change leaves future adoption>

### Migration plan
<for breaking: specific steps from old-state to new-state, with code-mod if applicable>

### Release rollout
<version bump, RC window, soak criteria, stable release — with cascade windows named>

### Coordination record
<who has been notified, who has acknowledged>
```

## Persist

Token evolutions are high-signal. Memory entries from this skill should capture the change classification, the consumer list, the brand-document citation, and the coordination status. Future-you tracing back why a token is the shape it is will thank you.

## Handoff

- Token evolution is a discipline invoked *inside* the normal pipeline. After running this skill, return to wherever you came from — `enumerate-changes` folding the token work into the enumeration, `implement-milestone` executing the token commit with the discipline already applied.
- If the impact analysis reveals the change should really be deferred until the next major (because the cascade is too large for the current cycle), record that and stop the current token path.
- If a breaking change's coordination cannot be completed before the release window, pause and surface it. Do not land a breaking token change on the hope that consumers will adapt.
