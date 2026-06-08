# Update the pattern catalog (Mode 1)

The pattern catalog (`patterns/`) is progenitor's living memory of reusable shapes. When a new shape emerges from Mode 2 work — a new fleet relationship, a new agent kind, a new instantiation approach — this skill captures it.

## When to use

- A Mode 2 agent-production surfaced a pattern not in the catalog
- An existing pattern doc is found to be incomplete or out of date
- A new agent kind is being added to v1 scope (e.g., supporting LangGraph agents would require a new pattern doc)
- An audit (via `audit-agent`) revealed a recurring shape across agents that should be named

## When NOT to use

- The pattern is hypothetical / not observed in an actual agent
- The change is a tiny clarification — direct commit is fine
- A Mode 2 production is in flight — finish the production first, then update the catalog as a separate Mode 1 work item

## Inputs

- The observed pattern (where it appeared, how many instances)
- Prior memory entries about similar patterns
- Existing patterns in the catalog (read them first to avoid duplicates)

## Procedure

1. **Confirm the pattern is real, not hypothetical.** Name at least one (preferably two) observed instances in the corpus.
2. **Survey existing patterns.** `ls .codex/patterns/` and read for overlap. If the new pattern is a variant of an existing one, decide: extend the existing doc, or create a separate doc?
3. **Decide the shape of the pattern doc.** Standard sections:
   - **What it is** — one-paragraph definition
   - **When to use** — concrete trigger conditions
   - **When NOT to use** — concrete anti-triggers
   - **Structure** — the actual shape (files, frontmatter, layout)
   - **Invariants** — what must always be true for an instance of this pattern
   - **Validation** — how to confirm an instance is correct
   - **Observed instances** — pointers to canonical exemplars
   - **Variations** — known variants
4. **Author the pattern doc.**
5. **Update the references index** if the new pattern names new exemplars.
6. **Run `bash .codex/build.sh`** if any stack-layer reference to the catalog needs to update (rare; usually only the index in `02-creation-discipline.md` needs revision if a major new pattern is added).
7. **Commit.** Conventional Commits style: `docs(patterns): add <pattern-name>`.

## Output

A new or revised `patterns/<pattern-name>.md`. The references index may also be updated.

## Red flags

- **Inventing patterns from theory** — refuse; patterns are observed, not invented
- **A pattern doc that is actually a template** — refuse; pattern docs describe shape, they do not contain copy-paste content
- **Bundling with a Mode 2 emission** — split into separate work items
- **Duplicating an existing pattern under a new name** — extend instead

## After updating

- Memory-append: pattern name, instances cited, summary of what it captures
- The next Mode 2 work that fits the pattern uses it; do not retroactively rewrite existing agents to match