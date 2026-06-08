# Enumerate changes (Mode 1)

After `scope-need` is approved, this skill produces the actual commit-by-commit plan for progenitor's own corpus.

## When to use

- A scoped-need document is approved
- The work warrants more than a single trivial commit
- The change affects multiple files and needs coherent ordering

## When NOT to use

- Single-file trivial change — direct commit is fine
- Mode 2 work — use the design-agent + create-* flow instead

## Inputs

- The approved scoped-need document
- Current state of affected files
- Prior memory entries

## Procedure

1. **Restate the scope.** What is the change set? What invariants are involved?
2. **Identify affected files.** Stack layers, skills, patterns, references, config, build.sh, README.
3. **Order the changes.**
   - Stack-layer revisions before skills that depend on them
   - Pattern docs before agents that reference them (but in Mode 1, pattern docs stand alone — no cross-dependency on Mode 2 outputs)
   - References updates after the pattern they index
   - Config / build.sh changes before the build-verification step
4. **Per change, write a focused commit description.**
   - One concern per commit
   - Conventional Commits style if the project uses it: `feat: ...`, `docs: ...`, `chore: ...`
   - Note any cross-file consistency the commit must preserve
5. **Identify validation steps.**
   - Does `build.sh` still run clean and produce expected `steward.md`?
   - Do the patterns referenced by skills still exist?
   - Are any skills now broken by stack-layer rename?
6. **Confirm with the principal.** Wait for approval before commit execution.

## Output

A flat ordered list of focused commits. Each commit is one concern; each has a description; each has its own validation status.

## Red flags

- **A single commit doing multiple unrelated things** — split
- **A pattern-doc change bundled with a Mode 2 production** — refuse; the bundling will confuse the historical record
- **A stack-layer change without a corresponding build.sh re-run** — the steward.md will drift
- **A new skill without a clear name + description frontmatter** — refuse the frontmatter-less form

## After enumeration

- Execute commits in order, each followed by `bash .codex/build.sh` if any stack layer changed
- Memory-append non-obvious decisions
- If a commit surfaces a need for a new pattern doc that wasn't in the scoped-need, surface to the principal — do not silently add