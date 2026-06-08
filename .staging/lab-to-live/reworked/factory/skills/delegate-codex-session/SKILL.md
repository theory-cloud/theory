---
name: delegate-codex-session
description: Run a bounded nested Codex exec session in another repository by changing Codex's working root with -C and passing through the delegated task. Use when Codex needs read-only help from a repo-local steward/agent without installing a global skill, exposing credentials, publishing artifacts, or directly modifying the target repository.
---

# Delegate Codex Session

## Purpose

Use this skill to ask a repository-local Codex session for bounded, steward-driven execution and analysis help. The inner session runs with the target repo as its working root via `codex exec -C <repo>`, allowing that repo's own Codex configuration and steward/system context to load normally.

This skill is for Factory orchestration. Treat it as a steward coordination surface, not as a way to make the parent orchestrator become the submodule implementer.

## Default shape

Use the bundled helper script:

```bash
.codex/skills/delegate-codex-session/scripts/delegate_codex_session.py \
  --repo /path/to/repo \
  --task "Answer a bounded read-only question about this repo."
```

The helper invokes Codex as:

```bash
codex --yolo exec -C <repo> --ephemeral --json --output-last-message <file> <prompt>
```

The helper does not inspect, summarize, or paste `.codex` / `AGENTS.md` / `CLAUDE.md` contents into the prompt. It passes the delegated task through and relies on `-C <repo>` to put the inner Codex session under the target repo's authority. It writes local logs under `~/.codex/tmp/delegate-codex-session/` by default and prints the inner session's final answer plus log paths.

## Orchestrator responsibility

The outer orchestrator owns cross-cutting context. Do not assume the repo-local delegate knows the parent project state, cross-repo dependencies, security invariant, issue-closing expectations, or proof shape unless the prompt says so.

Before delegating implementation or review rework, provide the delegate with the relevant cross-cutting context and the boundaries it must not infer:

- project and milestone;
- target repo and product plane;
- base branch and PR target;
- issue to close and required `Closes #...` text, when applicable;
- security invariant that must remain true;
- accepted proof shape and validation gates;
- project-board or tracker linkage expectations;
- cross-repo dependencies and contracts;
- explicit non-goals and forbidden surfaces.

The delegate owns repo-local execution under its own instructions. The orchestrator owns review, cross-repo compatibility, claim safety, and deciding whether the returned proof satisfies the assignment.

## Scoped TheoryMCP memory guidance

When the target repo's Codex session has a scoped TheoryMCP memory surface, include memory instructions in implementation and review-rework prompts:

1. Query repo-scoped memory before editing for the project, milestone, issue, security invariant, and relevant prior blockers.
2. Report which memories or repo-local lessons were applied, or report that no relevant scoped memories were found.
3. Append memory only for durable repo-local lessons after a useful resolution, such as a fixed blocker, contract boundary, validation discovery, or security invariant clarification.
4. Do not append chat summaries, routine validation output, secrets, credentials, logs, cross-tenant data, or parent-orchestrator decisions that belong in Factory state.
5. Do not append memory during read-only audits unless the prompt explicitly authorizes memory writes. The default read-only audit posture forbids memory appends.

If the delegate does not have memory tools, it should say so and continue without pretending memory was queried.

## Delegate prompt rubric

For implementation assignments, include this rubric directly in the delegated task. Omit only fields that truly do not apply and say why.

```markdown
Project / milestone: <name>
Target repo: <repo path or owner/name>
Product plane: <plane>
Base branch: <branch>
PR target: <branch>
Issue to close: #<number> or none
Required closing text: Closes #<number> or none
Security invariant: <what must remain true>
Accepted proof shape: <PR + commit + validation output + risks/blockers, or report-only>
Validation gates: <commands and expected evidence>
Project linkage: <project board/status/labels, or none>
Cross-repo deps/contracts: <contracts, fixtures, pinned repos, or none>
Allowed write scope: <files/modules>
Explicit non-goals: <out-of-scope work>
Forbidden actions: <secrets, cloud mutation, sibling repo edits, etc.>
Memory instructions: Query scoped memory before editing; report applied memories/lessons; append only durable repo-local lessons after useful resolution.
Response shape: PR URL, branch, commits, validation output, applied memories/lessons, risks, blockers, and any follow-up requested from the orchestrator.
```

## Read-only audit guard

For read-only audits, the prompt must explicitly state the read-only guard:

```markdown
This is a read-only audit. Do not edit files. Do not create branches or commits. Do not push. Do not open, update, or comment on GitHub issues/PRs. Do not append TheoryMCP memory. Return findings only, with paths and confidence.
```

Use read-only audits for repo-local analysis, invariant discovery, file-location searches, and proof review when no implementation is authorized.

## Review-rework template

When sending a repo-local agent back to rework an existing PR, focus on the accepted proof shape instead of broad improvement language:

```markdown
Project / milestone: <name>
PR to rework: <URL or number>
Base branch / PR target: <branch>
Issue to close: #<number> or none
Accepted proof shape: <exact proof required for approval>
Required fixes: <bounded list of review findings to address>
Security invariant: <what must remain true>
Validation gates: <commands to rerun and report>
Project linkage: <project/status update expected, or none>
Cross-repo deps/contracts: <contracts/fixtures that must stay compatible>
Non-goals: Do not broaden scope, do not refactor unrelated code, do not touch sibling repos, do not mutate cloud state.
Memory instructions: Query scoped memory for this PR/issue before editing; report applied memories/lessons; append only durable repo-local lessons after the rework is complete.
Response shape: Updated PR URL, branch, commits, validation output, how each required fix was addressed, applied memories/lessons, risks/blockers.
```

## Procedure

1. **Confirm the target repo.** Use an absolute path when possible. Do not guess across tenants or sibling repos if the prompt is ambiguous.
2. **Choose the delegation class.** Use read-only audit, implementation assignment, or review rework. Do not blur them.
3. **Keep the task bounded.** Ask for a specific review, summary, file-location search, implementation plan, milestone implementation, or PR rework.
4. **Keep the prompt explicit.** The wrapper passes the task through. If the consultation must be read-only, must not recurse, must not comment on GitHub, or must not write memory, say that in the task.
5. **Provide cross-cutting context.** Include the rubric fields needed for the delegate to avoid inferring parent-owned state.
6. **Use authorized communication channels only.** Do not reference email, mailbox instructions, or peer-consultation routes unless the target agent's channel and allowlist are actually provisioned for this workspace.
7. **Inspect the result.** Treat the inner output as advice or a steward report. Verify important claims before acting on them.
8. **Preserve logs when useful.** If the result informs a larger change, cite the helper's `log_dir` or `final_file` in your notes.

## Good uses

- Ask a repo steward to summarize its local invariants before you touch sibling code.
- Ask a target repo to identify relevant files for a planned change.
- Ask for a read-only audit of whether a specific pattern is present.
- Ask a repo-local agent for one bounded milestone implementation that produces a PR.
- Ask a repo-local agent to rework a PR against a specific accepted proof shape.
- Delegate from a project orchestrator to a repository steward without copying repo-local instructions into the parent prompt.

## Do not use

- Do not use this as a scraping mechanism.
- Do not run recursive nested Codex sessions.
- Do not use it to bypass sandbox, approval, policy, rate-limit, or tenancy boundaries.
- Do not ask the inner session to expose secrets, quote credentials, or dump private keys.
- Do not use delegation to bypass submodule ownership, Factory assignment discipline, or review gates.
- Do not ask for unbounded "fix whatever else you see" work.
- Do not treat the inner output as authoritative without review.

## Examples

Read-only analysis:

```bash
.codex/skills/delegate-codex-session/scripts/delegate_codex_session.py \
  --repo /path/to/progenitor \
  --task "This is a read-only audit. Do not edit files. Do not create branches or commits. Do not push. Do not open, update, or comment on GitHub issues/PRs. Do not append TheoryMCP memory. Read the repo-local instructions and summarize the Mode 1 workflow in five bullets with paths and confidence."
```

Find relevant files:

```bash
.codex/skills/delegate-codex-session/scripts/delegate_codex_session.py \
  --repo /path/to/repo \
  --task "This is a read-only audit. Do not edit files. Do not open or comment on GitHub issues/PRs. Do not append TheoryMCP memory. Which files define the local build/test workflow? Return paths, commands, and warnings."
```

Implementation assignment:

```bash
.codex/skills/delegate-codex-session/scripts/delegate_codex_session.py \
  --repo /path/to/repo \
  --task "$(cat assignments/example-delegate-task.md)"
```

Review rework:

```bash
.codex/skills/delegate-codex-session/scripts/delegate_codex_session.py \
  --repo /path/to/repo \
  --task "$(cat assignments/example-review-rework.md)"
```

Dry run before spending tokens:

```bash
.codex/skills/delegate-codex-session/scripts/delegate_codex_session.py \
  --repo /path/to/repo \
  --task "Summarize local agent boundaries. This is a read-only audit; do not edit files, comment on GitHub, or append memory." \
  --dry-run
```

## Wrapper details

The script validates the target directory, passes the task through to `codex exec -C <repo>`, runs the inner session with `stdin` closed to avoid hangs, and captures JSONL events plus the final message. Use `--print-prompt` to inspect the exact prompt that will be passed. Use `--timeout <seconds>` for long consultations.
