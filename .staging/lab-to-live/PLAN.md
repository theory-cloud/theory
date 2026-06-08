# Plan — replicate the remaining 12 theorycloud agents into live (ultracode workflow)

Target namespace: **live** `theorymcp` → `https://theorymcp.ai/theorycloud/mcp`
Source for one agent: **lab** `theorymcp_lab` → `https://lab.theorymcp.ai/theorycloud/mcp`
Already done this session: **keybank-factory** (lab v11 → live v1, verified byte-perfect). `antigravity` install profile already registered in live.

## Operating constraints (givens, not goals)
- The MCP has no filesystem access. All content (souls, skills) must be carried by an agent that has **both** local file tools (Read/Bash) **and** the MCP tools. That agent is each workflow subagent. Transcription-through-context is inherent; the workflow's only leverage is **parallelism** (one subagent per agent / per skill, each in its own context window).
- Soul-first ordering is enforced server-side: `create_agent` → `agent_soul_upsert` must precede any `agent_skill_upsert`; layouts after.
- Two gates: every publish needs a passing post-publish validate AND explicit human authorization. The workflow does all DRAFT authoring + verification automatically; **publish is a separate, gated phase** (`args.authorizePublish === true`).
- Verbatim + checksum: verify every layout entry's `content_sha256` server-side after upsert, and every soul/skill via the post-publish install-plan manifest.

## Roster (12)
| agent_id | display_name | source | skills |
|---|---|---|---|
| progenitor | Agent Generator | **lab MCP** (published v4: soul + 14 skills; no v2 layouts → author them) | 14 |
| apptheory | AppTheory | local `AppTheory/.codex` | 6 |
| autheory | Autheory | local `autheory/.codex` | 14 |
| design | Theory Cloud Design | local `theory-cloud-design/.codex` | 10 |
| facetheory | FaceTheory | local `FaceTheory/.codex` | 8 |
| factory | Theory Factory | local `factory/.codex` | 22 |
| gov | GovTheory | local `GovTheory/.codex` | 7 |
| keeper | Cloud Keeper | local `factory/products/services/cloud-keeper/.codex` | 11 |
| knowledgetheory | KnowledgeTheory | local `KnowledgeTheory/.codex` | 12 |
| mcpserver | MCP Server | local `theory-mcp-server/.codex` (NOT lab's stale v2 — local has soul + 11 skills) | 11 |
| preth | PreTheory - JEPA Data | local `PreTheory/.codex` | 9 |
| tabletheory | TableTheory | local `TableTheory/.codex` | 8 |

## Recipe A — local → cloud (the 11)
Per agent, executed by subagents:
1. Ensure `antigravity` install profile exists in live (idempotent; already present).
2. `create_agent(agent_id, display_name)`.
3. Soul: `Read <repo>/.codex/steward.md` → `agent_soul_upsert(agent_id, body)`.
4. Skills: for each `<repo>/.codex/skills/<slug>/SKILL.md`:
   - `slug` = directory name; `display_order` = index in slug-sorted order.
   - Parse YAML frontmatter → `name`, `description`.
   - `body` = the **full SKILL.md verbatim, including frontmatter** (these agents' skills carry frontmatter; preserve it).
   - `agent_skill_upsert(...)`.
5. Layouts: `agent_install_layout_upsert` for codex / claude_code / antigravity using the shared templates below (only the output-style name/file vary by agent).
6. Verify (pre-publish): `agent_install_layout_list` — the URL/name-independent entries must match the fixed checksums below; `agent_skill_list` count == expected.

## Recipe B — MCP replicate (progenitor)
1–2. Ensure profile; `create_agent(progenitor, "Agent Generator")`.
3. `agent_soul_get` on **lab** → `agent_soul_upsert` on live (verbatim). (Use snapshot v4 if you want the published-pinned body.)
4. `agent_skill_list` + `agent_skill_get` per skill on **lab** → `agent_skill_upsert` on live (verbatim body/slug/name/display_order/description).
5. Layouts: author the 3 (progenitor had no v2 layouts in lab) using the shared templates, output-style name "Agent Generator".
6. Verify as in Recipe A.

## Shared layout templates (verified verbatim against lab keybank-factory)
URL/name-independent entries — `content_sha256` MUST equal these after upsert:
- `{{soul}}` → `26aedc85a90025d3ce2a25314e889c5859ca14611ee0fe88f62b76b03f3902d6`
- `{{skill.body}}` → `2d8a68430fb029995cc8fc531cfaec596336f8656c05d7adbacb39896a4a1b87`
- codex `config.toml` → `58053e10c0492a4910f9fe67f8851c6cb23203db760b42a96275e5b90dfd8fc3`
- claude `.mcp.json` → `eeb97207beb02b68acff04b1ef554ba99cbd8a60e30897646fd25489ee34ca2d`
- antigravity `.agents/mcp_config.json` → `3afdc6a6b25aa0365604c0fede3563222173f6ead1da5205c25d76fda6e1d63b`

Per-agent (name-dependent → checksum varies, self-check by recompute):
- claude `.claude/output-styles/<agent_id>.md` = `---\nname: <display>\ndescription: <one-line>\nkeep-coding-instructions: false\n---\n{{soul}}`
- claude `.claude/settings.json` = `{\n  "outputStyle": "<display>"\n}\n`

Exact template bodies are embedded in the workflow script.

## Workflow shape (`replicate-remaining.workflow.js`)
`pipeline(AGENTS, author, skills, verify)` — per agent, no barrier:
- **author** (1 subagent/agent): profile + create_agent + soul_upsert + 3 layout upserts; returns soul sha256 + skill slug list. Soul-first satisfied here.
- **skills** (fan-out/agent): `parallel()` one subagent per skill → read+parse+upsert that one skill; returns per-skill sha.
- **verify** (1 subagent/agent): draft completeness + fixed-template checksum match.
- **publish** (gated, after the pipeline): only if `args.authorizePublish` — `agent_interface_publish(id, true)` per agent, then `agent_local_install_plan(codex)` and confirm steward.md sha == soul sha and each SKILL.md sha == sent sha. Otherwise the workflow returns a **publish manifest** for human authorization.

## Decision points (set before running)
1. **Skill `body`**: full SKILL.md incl. frontmatter (default) vs. stripped. Default preserves the local artifact exactly.
2. **Soul `summary`**: omit (default) vs. subagent-generated ≤2048-char summary.
3. **output-style description** line: `"<display> steward on Theory Cloud."` (default) vs. per-agent custom.
4. **display_order**: slug-sorted index (default) vs. a curated order.
5. **Publish**: drafts+verify only (default) vs. `authorizePublish:true` to also publish (still one explicit authorization for the batch).

## Run
```
Workflow({ scriptPath: ".staging/lab-to-live/replicate-remaining.workflow.js" })
# limit: args:{ only:["progenitor","tabletheory"] }
# also publish: args:{ authorizePublish:true }
```
