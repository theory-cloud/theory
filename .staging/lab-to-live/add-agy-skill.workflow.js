export const meta = {
  name: 'add-delegate-agy-skill-drafts',
  description: 'Upsert the delegate-agy-session skill (body + helper script support_file) as DRAFTS into factory and progenitor, confirm the draft, and recon the current published layout (skill render path + whether support files render). No publish.',
  phases: [{ title: 'Author+Recon', detail: 'per agent: upsert draft skill, confirm, recon published layout' }],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const LIVE = 'theorymcp'
const STAGE = `${REPO}/theory/.staging/delegate-agy-session`
const DESC = 'Delegate bounded, steward-driven execution/analysis to a repository-local Antigravity CLI (agy) session in headless --print mode, the same way delegate-codex-session uses codex. Preferred under frequent delegation because agy holds auth better — central Google OAuth plus the per-repo mcp-remote bridge token store, instead of codex native MCP token rotation that can revoke a sibling session.'

const AGENTS = [
  { id: 'factory', order: 90 },
  { id: 'progenitor', order: 90 },
]

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'draft_upserted', 'draft_confirmed', 'support_file_in_draft', 'current_published_version', 'skill_render_path', 'support_files_render'],
  properties: {
    agent_id: { type: 'string' },
    draft_upserted: { type: 'boolean' },
    draft_confirmed: { type: 'boolean', description: 'agent_skill_get returns delegate-agy-session with body + the script support_file' },
    support_file_in_draft: { type: 'boolean' },
    current_published_version: { type: 'integer' },
    skill_render_path: { type: 'string', description: 'where SKILL.md entries render in the CURRENT published codex plan: ".codex/skills" or ".agents/skills" or "none"' },
    support_files_render: { type: 'boolean', description: 'does the current published codex layout render any scripts/ support-file path?' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const results = await parallel(AGENTS.map(a => () => {
  const prompt = `Author the "delegate-agy-session" skill as a DRAFT into agent "${a.id}" in the LIVE namespace (${LIVE}), confirm it, and recon the current published layout. Do NOT publish.

Load: ToolSearch "select:mcp__${LIVE}__agent_skill_upsert,mcp__${LIVE}__agent_skill_get,mcp__${LIVE}__agent_local_install_plan".

STEP 1 — read the staged skill files (Read tool):
- BODY = full text of ${STAGE}/SKILL.md  (includes its YAML frontmatter — keep it).
- SCRIPT = full text of ${STAGE}/scripts/delegate_agy_session.py.

STEP 2 — upsert the DRAFT (this writes a draft only; it never publishes):
mcp__${LIVE}__agent_skill_upsert(
  agent_id="${a.id}", skill_id="delegate-agy-session", slug="delegate-agy-session",
  name="delegate-agy-session",
  description=${JSON.stringify(DESC)},
  display_order=${a.order},
  body=<BODY>,
  support_files=[{ file_path: "scripts/delegate_agy_session.py", file_role: "script", content_type: "text/x-python", body: <SCRIPT> }]
)
draft_upserted = success.

STEP 3 — confirm: mcp__${LIVE}__agent_skill_get(agent_id="${a.id}", skill_id="delegate-agy-session"). draft_confirmed = it returns the skill with a non-empty body; support_file_in_draft = its support_files contains scripts/delegate_agy_session.py.

STEP 4 — recon the CURRENT published layout (published-only; does not see your new draft): mcp__${LIVE}__agent_local_install_plan(agent_id="${a.id}", client="codex", include_skills=true). From manifest_entries:
- skill_render_path = the directory prefix used for SKILL.md entries — ".codex/skills" or ".agents/skills" (or "none" if no skills render).
- support_files_render = true if ANY manifest entry path contains "/scripts/" (i.e. the layout renders skill support files), else false.
- current_published_version = plan.update_plan.selected_published_version (or validation.published_snapshot.published_version).

Return {agent_id:"${a.id}", draft_upserted, draft_confirmed, support_file_in_draft, current_published_version, skill_render_path, support_files_render, issues[]}.`
  return agent(prompt, { label: `add-agy:${a.id}`, phase: 'Author+Recon', schema: SCHEMA })
}))

const ok = results.filter(Boolean)
log(`Drafts: ${ok.filter(r => r.draft_confirmed).map(r => r.agent_id).join(', ') || 'none confirmed'}`)
log(`Render paths: ${ok.map(r => `${r.agent_id}=${r.skill_render_path}(support_files_render=${r.support_files_render})`).join('  ')}`)
return { results: ok }
