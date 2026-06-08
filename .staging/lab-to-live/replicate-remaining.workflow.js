export const meta = {
  name: 'theorycloud-lab-to-live-remaining',
  description: 'Replicate the remaining 12 theorycloud agents (progenitor + 11 local) into the live namespace, drafts+verify by default, publish gated',
  phases: [
    { title: 'Author', detail: 'per agent: ensure profile + create_agent + soul + 3 layouts (soul-first)' },
    { title: 'Skills', detail: 'fan out one subagent per skill: read+parse+upsert' },
    { title: 'Verify', detail: 'draft completeness + fixed-template checksum match' },
    { title: 'Publish', detail: 'gated: only when args.authorizePublish' },
  ],
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const LIVE = 'theorymcp'          // target MCP server name (live)
const LAB = 'theorymcp_lab'       // source MCP server name (lab) — progenitor only

const FIXED_SHA = {
  soul:        '26aedc85a90025d3ce2a25314e889c5859ca14611ee0fe88f62b76b03f3902d6', // {{soul}}
  skill:       '2d8a68430fb029995cc8fc531cfaec596336f8656c05d7adbacb39896a4a1b87', // {{skill.body}}
  configToml:  '58053e10c0492a4910f9fe67f8851c6cb23203db760b42a96275e5b90dfd8fc3',
  claudeMcp:   'eeb97207beb02b68acff04b1ef554ba99cbd8a60e30897646fd25489ee34ca2d',
  agMcp:       '3afdc6a6b25aa0365604c0fede3563222173f6ead1da5205c25d76fda6e1d63b',
}

const CONFIG_TOML = 'model_instructions_file = "steward.md"\n\n[mcp_servers.theorymcp]\nurl = "{{mcp.url}}"\ndefault_tools_approval_mode = "approve"\n\n[mcp_servers.theorymcp.tools.memory_append]\napproval_mode = "approve"\n'
const CLAUDE_MCP = '{\n  "mcpServers": {\n    "theorymcp": {\n      "type": "http",\n      "url": "{{mcp.url}}"\n    }\n  }\n}\n'
const AG_MCP = '{\n  "mcpServers": {\n    "theorymcp": {\n      "command": "npx",\n      "args": ["-y", "mcp-remote", "{{mcp.url}}"]\n    }\n  }\n}\n'

function layoutSpecs(id, display) {
  const desc = `${display} steward on Theory Cloud.`
  const outputStyle = `---\nname: ${display}\ndescription: ${desc}\nkeep-coding-instructions: false\n---\n{{soul}}`
  const settings = `{\n  "outputStyle": "${display}"\n}\n`
  return {
    codex: { spec_version: 'agent-install-layout-v2', entries: [
      { path: '.codex/steward.md', media_type: 'text/markdown', required: true, content: '{{soul}}', description: 'Agent soul as the codex system prompt (wired via config.toml model_instructions_file).' },
      { path: '.codex/config.toml', media_type: 'application/toml', required: true, content: CONFIG_TOML, description: 'Author-controlled codex config: model_instructions_file + clean theorymcp route via {{mcp.url}}.' },
      { path: '.codex/skills/{{skill.slug}}/SKILL.md', for_each: 'skills', media_type: 'text/markdown', required: true, content: '{{skill.body}}', description: 'Each published skill, author-placed under .codex/skills/<slug>/SKILL.md.' },
    ]},
    claude_code: { spec_version: 'agent-install-layout-v2', entries: [
      { path: `.claude/output-styles/${id}.md`, media_type: 'text/markdown', required: true, content: outputStyle, description: 'Soul as a Claude Code output style WITH author-defined frontmatter (system-prompt level; keep-coding-instructions:false).' },
      { path: '.claude/settings.json', media_type: 'application/json', required: true, content: settings, description: 'Activates the output style on session open.' },
      { path: '.mcp.json', media_type: 'application/json', required: true, content: CLAUDE_MCP, description: 'Project MCP config at repo root (theorymcp route via {{mcp.url}}).' },
      { path: '.claude/skills/{{skill.slug}}/SKILL.md', for_each: 'skills', media_type: 'text/markdown', required: true, content: '{{skill.body}}', description: 'Each published skill, author-placed under .claude/skills/<slug>/SKILL.md.' },
    ]},
    antigravity: { spec_version: 'agent-install-layout-v2', entries: [
      { path: 'GEMINI.md', media_type: 'text/markdown', required: true, content: '{{soul}}', description: 'Agent persona/identity as Antigravity workspace rules (GEMINI.md, always-on, highest precedence).' },
      { path: '.agents/skills/{{skill.slug}}/SKILL.md', for_each: 'skills', media_type: 'text/markdown', required: true, content: '{{skill.body}}', description: 'Each published skill as an Antigravity Agent Skill (.agents/skills/<slug>/SKILL.md).' },
      { path: '.agents/mcp_config.json', media_type: 'application/json', required: true, content: AG_MCP, description: 'Workspace MCP config: theorymcp via the mcp-remote stdio OAuth bridge. {{mcp.url}} = the agent route.' },
    ]},
  }
}

const ALL = [
  { id: 'progenitor', display: 'Agent Generator', recipe: 'mcp', skills: 14 },
  { id: 'apptheory', display: 'AppTheory', recipe: 'local', path: `${REPO}/AppTheory/.codex`, skills: 6 },
  { id: 'autheory', display: 'Autheory', recipe: 'local', path: `${REPO}/autheory/.codex`, skills: 14 },
  { id: 'design', display: 'Theory Cloud Design', recipe: 'local', path: `${REPO}/theory-cloud-design/.codex`, skills: 10 },
  { id: 'facetheory', display: 'FaceTheory', recipe: 'local', path: `${REPO}/FaceTheory/.codex`, skills: 8 },
  { id: 'factory', display: 'Theory Factory', recipe: 'local', path: `${REPO}/factory/.codex`, skills: 22 },
  { id: 'gov', display: 'GovTheory', recipe: 'local', path: `${REPO}/GovTheory/.codex`, skills: 7 },
  { id: 'keeper', display: 'Cloud Keeper', recipe: 'local', path: `${REPO}/factory/products/services/cloud-keeper/.codex`, skills: 11 },
  { id: 'knowledgetheory', display: 'KnowledgeTheory', recipe: 'local', path: `${REPO}/KnowledgeTheory/.codex`, skills: 12 },
  { id: 'mcpserver', display: 'MCP Server', recipe: 'local', path: `${REPO}/theory-mcp-server/.codex`, skills: 11 },
  { id: 'preth', display: 'PreTheory - JEPA Data', recipe: 'local', path: `${REPO}/PreTheory/.codex`, skills: 9 },
  { id: 'tabletheory', display: 'TableTheory', recipe: 'local', path: `${REPO}/TableTheory/.codex`, skills: 8 },
]

const only = (args && args.only) ? new Set(args.only) : null
const AGENTS = only ? ALL.filter(a => only.has(a.id)) : ALL
const DO_PUBLISH = !!(args && args.authorizePublish)

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const AUTHOR_SCHEMA = { type: 'object', additionalProperties: false, required: ['agent_id', 'soul_ok', 'soul_sha', 'layouts_ok', 'skill_slugs'], properties: {
  agent_id: { type: 'string' },
  soul_ok: { type: 'boolean' },
  soul_sha: { type: 'string', description: 'sha256 (hex, no prefix) of the soul body that was upserted' },
  layouts_ok: { type: 'boolean' },
  skill_slugs: { type: 'array', items: { type: 'string' }, description: 'slug-sorted skill slugs to upsert' },
  issues: { type: 'array', items: { type: 'string' } },
}}
const SKILL_SCHEMA = { type: 'object', additionalProperties: false, required: ['slug', 'ok', 'sha'], properties: {
  slug: { type: 'string' }, ok: { type: 'boolean' }, sha: { type: 'string', description: 'sha256 (hex) of skill body upserted' }, issue: { type: 'string' },
}}
const VERIFY_SCHEMA = { type: 'object', additionalProperties: false, required: ['agent_id', 'draft_skill_count', 'fixed_checksums_match', 'ready'], properties: {
  agent_id: { type: 'string' }, draft_skill_count: { type: 'integer' }, fixed_checksums_match: { type: 'boolean' }, ready: { type: 'boolean' }, issues: { type: 'array', items: { type: 'string' } },
}}
const PUBLISH_SCHEMA = { type: 'object', additionalProperties: false, required: ['agent_id', 'published_version', 'installable', 'soul_match', 'skills_match'], properties: {
  agent_id: { type: 'string' }, published_version: { type: 'integer' }, installable: { type: 'boolean' }, soul_match: { type: 'boolean' }, skills_match: { type: 'boolean' }, issues: { type: 'array', items: { type: 'string' } },
}}

const MCP_NOTE = `You have Bash/Read and all session MCP tools. Load MCP tools first with ToolSearch, e.g.
ToolSearch "select:mcp__${LIVE}__create_agent,mcp__${LIVE}__agent_soul_upsert,mcp__${LIVE}__agent_skill_upsert,mcp__${LIVE}__agent_install_layout_upsert,mcp__${LIVE}__agent_install_layout_list,mcp__${LIVE}__agent_skill_list,mcp__${LIVE}__agent_install_profile_list,mcp__${LIVE}__agent_install_profile_upsert,mcp__${LIVE}__agent_interface_validate,mcp__${LIVE}__agent_interface_publish,mcp__${LIVE}__agent_local_install_plan".
Compute sha256 with: printf '%s' "$body" | sha256sum  (or on a file: sha256sum FILE).`

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------
async function authorStage(a) {
  const specs = layoutSpecs(a.id, a.display)
  const sourceSoul = a.recipe === 'local'
    ? `Read the soul body from the local file: ${a.path}/steward.md (use it verbatim as agent_soul_upsert body).`
    : `Read the soul body from the LAB MCP: ToolSearch "select:mcp__${LAB}__agent_soul_get" then mcp__${LAB}__agent_soul_get(agent_id="progenitor"); use .soul.body verbatim.`
  const sourceSkills = a.recipe === 'local'
    ? `List skill slugs = the directory names under ${a.path}/skills/ (one dir per skill, each containing SKILL.md). Return them slug-sorted.`
    : `List skill slugs from LAB: ToolSearch "select:mcp__${LAB}__agent_skill_list" then mcp__${LAB}__agent_skill_list(agent_id="progenitor", limit=100); return the slugs slug-sorted.`
  const prompt = `Author agent "${a.id}" (display "${a.display}") into the LIVE namespace (${LIVE}), SOUL-FIRST. Drafts only — do NOT publish.
${MCP_NOTE}

Steps:
1. Ensure the antigravity install profile exists in live: agent_install_profile_list; if "antigravity" absent, agent_install_profile_upsert(client_profile="antigravity", display_name="Antigravity", description="Google Antigravity agentic IDE (workspace .agents/ + GEMINI.md). Reaches a theorymcp route via the mcp-remote stdio OAuth bridge, since Antigravity speaks stdio MCP but does not perform the MCP OAuth flow natively.").
2. create_agent(agent_id="${a.id}", display_name="${a.display}"). If it already exists, continue (the soul upsert will populate it).
3. SOUL: ${sourceSoul} Then agent_soul_upsert(agent_id="${a.id}", body=<soul>). Compute and return sha256 of the exact body you sent (soul_sha).
4. LAYOUTS: agent_install_layout_upsert for each of the 3 profiles with these EXACT specs (verbatim — do not alter content):
   codex: ${JSON.stringify(specs.codex)}
   claude_code: ${JSON.stringify(specs.claude_code)}
   antigravity: ${JSON.stringify(specs.antigravity)}
5. ${sourceSkills} (DO NOT upsert skills in this step — only return the slug list.)
Return {agent_id, soul_ok, soul_sha (hex no prefix), layouts_ok, skill_slugs[], issues[]}.`
  return agent(prompt, { label: `author:${a.id}`, phase: 'Author', schema: AUTHOR_SCHEMA })
}

function skillsStage(authored, a) {
  if (!authored || !authored.skill_slugs) return Promise.resolve([])
  const slugs = authored.skill_slugs
  return parallel(slugs.map((slug, i) => () => {
    const read = a.recipe === 'local'
      ? `Read ${a.path}/skills/${slug}/SKILL.md. body = the FULL file verbatim (including any YAML frontmatter). Parse frontmatter for name and description; if absent, name = Title Case of "${slug}", description = first non-empty prose line.`
      : `From LAB: ToolSearch "select:mcp__${LAB}__agent_skill_get" then mcp__${LAB}__agent_skill_get(agent_id="progenitor", skill_id="${slug}"). Use its body, name, description verbatim.`
    const prompt = `Upsert ONE skill "${slug}" for agent "${a.id}" into LIVE (${LIVE}). The agent + soul already exist.
${MCP_NOTE}
${read}
Call agent_skill_upsert(agent_id="${a.id}", skill_id="${slug}", slug="${slug}", name=<name>, description=<description>, display_order=${i}, body=<body>).
Compute sha256 of the exact body you sent. Return {slug:"${slug}", ok, sha (hex), issue?}.`
    return agent(prompt, { label: `skill:${a.id}/${slug}`, phase: 'Skills', schema: SKILL_SCHEMA })
  }))
}

function verifyStage(a, skilled) {
  const got = (skilled || []).filter(Boolean)
  const prompt = `Verify the LIVE draft for agent "${a.id}" before publish.
${MCP_NOTE}
1. agent_skill_list(agent_id="${a.id}", limit=100): draft_skill_count must == ${a.skills} (expected) and == ${got.length} (upserted this run).
2. agent_install_layout_list(agent_id="${a.id}"): confirm the URL/name-independent entries' content_sha256 match EXACTLY:
   {{soul}} (.codex/steward.md, GEMINI.md) = ${FIXED_SHA.soul}
   {{skill.body}} (all SKILL.md) = ${FIXED_SHA.skill}
   .codex/config.toml = ${FIXED_SHA.configToml}
   .mcp.json = ${FIXED_SHA.claudeMcp}
   .agents/mcp_config.json = ${FIXED_SHA.agMcp}
   (output-style + settings.json contain the display name so their checksums are agent-specific — just confirm they are present.)
Return {agent_id:"${a.id}", draft_skill_count, fixed_checksums_match, ready (true only if count ok AND all fixed checksums match AND soul present), issues[]}.`
  return agent(prompt, { label: `verify:${a.id}`, phase: 'Verify', schema: VERIFY_SCHEMA })
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
log(`Replicating ${AGENTS.length} agents into ${LIVE}. Publish=${DO_PUBLISH ? 'YES (authorized)' : 'NO (drafts+verify only)'}.`)

const verified = await pipeline(
  AGENTS,
  a => authorStage(a),
  (authored, a) => skillsStage(authored, a).then(skills => ({ authored, skills })),
  (bundle, a) => verifyStage(a, bundle && bundle.skills),
)

const report = AGENTS.map((a, i) => ({ agent_id: a.id, verify: verified[i] || null }))
const ready = report.filter(r => r.verify && r.verify.ready).map(r => r.agent_id)
const notReady = report.filter(r => !r.verify || !r.verify.ready).map(r => r.agent_id)
log(`Drafts staged. ready=${ready.length} (${ready.join(', ')}); notReady=${notReady.length} (${notReady.join(', ') || 'none'})`)

if (!DO_PUBLISH) {
  return { phase: 'drafts+verify', ready, notReady, report,
    note: 'Publish gate NOT exercised. Re-run with args.authorizePublish:true (after human authorization) to publish the ready agents.' }
}

// Gated publish phase — only ready agents.
phase('Publish')
const toPublish = AGENTS.filter(a => ready.includes(a.id))
const published = await parallel(toPublish.map(a => () => {
  const prompt = `Publish agent "${a.id}" in LIVE (${LIVE}), then verify byte-perfect.
${MCP_NOTE}
1. agent_interface_publish(agent_id="${a.id}", direct_user_authorization=true).
2. For each client in [codex, claude_code, antigravity]: agent_interface_validate(agent_id="${a.id}", client) must be valid/installable.
3. Byte check: agent_local_install_plan(agent_id="${a.id}", client="codex"). In manifest_entries, steward.md checksum must == the soul sha for this agent; each SKILL.md checksum must match its upserted skill sha. ${a.recipe === 'local' ? `You may recompute expected shas from local files under ${a.path}.` : 'Compare against the lab published values.'}
Return {agent_id:"${a.id}", published_version, installable, soul_match, skills_match, issues[]}.`
  return agent(prompt, { label: `publish:${a.id}`, phase: 'Publish', schema: PUBLISH_SCHEMA })
}))

return { phase: 'published', ready, notReady, published: published.filter(Boolean) }
