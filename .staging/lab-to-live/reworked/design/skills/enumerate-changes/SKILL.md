---
name: enumerate-changes
description: Use after scope-need. Takes an approved scoped-need document and produces a flat, ordered list of discrete changes across theory-cloud-design required to deliver it. Each change is scoped to be a single commit.
---

# Enumerate changes

A scoped need describes *what* is being delivered. An enumerated change list describes *what must move in the repo*. This skill is the transformation.

## Input required

An approved scoped-need document from `scope-need`. Load prior context with `memory_recent`.

## The walk

Walk the scoped need against every surface of theory-cloud-design:

1. **Brand document** (`theory_cloud_branding_package.md`) — the spec. If the scoped need touches a rule, section, creative prompt, or architectural model, the document moves in the same commit as its implementation.
2. **Base token set** — common Theory Cloud tokens (Midnight, Core Blue, Violet Signal, Ice White, Steel, Mist, Graphite, Phi Gold; typography tokens; spacing; radii; motion timings; elevation).
3. **Core surface variant** — token overrides for `theorycloud.ai` applications.
4. **MCP surface variant** — token overrides for `theorymcp.ai` applications.
5. **Auth surface variant** — token overrides for `autheory.app` applications.
6. **Typed exports** — the TypeScript surface consumer apps import. When a new token is added or a shape changes, the typed export moves.
7. **Primary icon asset** (`icon-theory-cloud.svg`) — the master SVG and any derivatives (monochrome, inverse, favicon, app-tile, social).
8. **Wordmark lockups** — horizontal, stacked, icon-only, monochrome, inverse variants.
9. **Asset generation pipeline** — SVG optimization (SVGO or equivalent), favicon ICO generation, PNG raster generation, social-template rendering.
10. **Creative direction prompts** — the prompts in `theory_cloud_branding_package.md` §14 and §18 that guide downstream asset generation.
11. **Messaging copy** — taglines, one-liner, expanded description, messaging pillars (§12), surface messages (§29.J).
12. **Voice and copy rules** — writing principles, approved and avoided patterns (§13).
13. **Motion specifications** — approved behaviors, forbidden patterns, timing curves (§10, §27.H).
14. **Header anatomy and surface-chip rules** — the `Theory Cloud [surface]` pattern and its anatomy (§30.C, §30.D).
15. **Documentation** — `README.md`, usage guides, migration notes, changelog surfaces.
16. **Release packaging** — `package.json` exports, lockfile, `x-release-please-version` markers (auto-managed), release-please config.
17. **Build scripts** — typecheck, asset validation, package build, preview tooling.

A change that touches none of these isn't really a change. A change that touches several is fine when they share intent.

## The ordering rules

1. **Brand-document updates come first** when the scoped need involves a document change. The document is the spec; tokens and assets implement it. A token commit that implements a rule not yet in the document is a lie about the spec.
2. **Base tokens land before surface variants.** A surface variant adding a token that references a missing base token is broken.
3. **Tokens land before typed exports** that export them. A typed export referencing a not-yet-defined token doesn't typecheck.
4. **Assets land with their derivatives.** A new primary icon ships with monochrome, inverse, favicon, and raster derivatives in the same commit. Shipping the SVG alone and promising derivatives later is drift waiting to happen.
5. **Documentation rides with its behavior.** A new token shipped without documentation of its intended use is incomplete.
6. **Release packaging changes are their own commits.** Changes to `package.json` exports, release-please configuration, or build scripts ride separately from token or asset changes so the release-tooling behavior can be reviewed cleanly.
7. **`x-release-please-version` markers are automated.** Never hand-edited. Release-please updates them; your commits don't touch them directly.

## The multi-repo cascade rule

For any enumerated change that will cascade, flag the cascade explicitly:

- **`cascade: FaceTheory`** — FaceTheory will need to pin a new release and possibly adjust a primitive (Topbar slots, BrandHeader, `StitchTokenSet` shape).
- **`cascade: autheory`** — autheory will need to pin a new theory-cloud-design + new FaceTheory release and reskin.
- **`cascade: theory-mcp-server`** — theory-mcp-server will need to pin new releases and reskin the control-plane.
- **`cascade: none`** — the change is internal to theory-cloud-design (e.g. a documentation polish, a build-script refactor).

Cascades are not enumerated in this list as commits — they are coordination notes. But they must be named so `plan-roadmap` can sequence them correctly.

## The single-commit rule

Each enumerated item fits in one commit:

- One logical intent
- `npm run check` passes at the end of the commit (typecheck + lint + asset validation + token validation)
- Brand-document changes stay internally consistent (no section references removed content)
- No commit depends on a later item to compile or pass checks

## Output format

```markdown
### N. <imperative title>

- **Paths**: <files or directories touched>
- **Area**: <brand-document / base-tokens / core-variant / mcp-variant / auth-variant / typed-exports / assets / docs / packaging>
- **Brand-document section**: <citation, or "none">
- **Cascade**: <FaceTheory / autheory / theory-mcp-server / none — may list multiple>
- **Acceptance**: <one sentence: what makes this commit done>
- **Validation**: <minimum commands — `npm run check`, representative-consumer render, asset visual diff>
- **Conventional Commit subject**: `<type(scope): subject>` — use `feat!:` or `fix!:` if breaking
```

## Self-check before handing off

- [ ] Brand-document updates are ordered first when present
- [ ] Base tokens land before surface variants that depend on them
- [ ] Typed exports ride with the tokens they export
- [ ] Assets ship with their derivatives in the same commit
- [ ] Every enumerated item has a cascade flag
- [ ] No item requires a future item to typecheck or validate
- [ ] Release manifests and version markers are not enumerated as feature commits
- [ ] The full list satisfies the scoped need's success criteria

## Persist

Append only if the enumeration surfaces something unusual — a token that's doing more than one job, a brand-document section that needs editing for the change to make sense, a consumer coupling you didn't expect. Routine enumerations aren't memory material.

## Handoff

Invoke `plan-roadmap` to sequence the flat list into phases, address the cascades explicitly, and shape milestones per the Linear project structure (one milestone per milestone per repo it touches).
