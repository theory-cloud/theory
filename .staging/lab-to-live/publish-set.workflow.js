export const meta = {
  name: 'theorycloud-publish-set',
  description: 'Publish already-staged theorycloud drafts in live: per agent fresh draft re-verify -> publish (human-authorized) -> validate -> byte-check via install-plan. Agent set is BAKED IN (no args reliance).',
  phases: [
    { title: 'Publish', detail: 'per agent: re-verify draft, publish, validate, byte-check' },
  ],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const LIVE = 'theorymcp'
const LAB = 'theorymcp_lab'

const FIXED = {
  soul: '26aedc85a90025d3ce2a25314e889c5859ca14611ee0fe88f62b76b03f3902d6',
  skill: '2d8a68430fb029995cc8fc531cfaec596336f8656c05d7adbacb39896a4a1b87',
  configToml: '58053e10c0492a4910f9fe67f8851c6cb23203db760b42a96275e5b90dfd8fc3',
  claudeMcp: 'eeb97207beb02b68acff04b1ef554ba99cbd8a60e30897646fd25489ee34ca2d',
  agMcp: '3afdc6a6b25aa0365604c0fede3563222173f6ead1da5205c25d76fda6e1d63b',
}

const META = {
  apptheory: { skills: 6, path: `${REPO}/AppTheory/.codex` },
  facetheory: { skills: 8, path: `${REPO}/FaceTheory/.codex` },
  tabletheory: { skills: 8, path: `${REPO}/TableTheory/.codex` },
  autheory: { skills: 14, path: `${REPO}/autheory/.codex` },
  design: { skills: 10, path: `${REPO}/theory-cloud-design/.codex` },
  factory: { skills: 22, path: `${REPO}/factory/.codex` },
  gov: { skills: 7, path: `${REPO}/GovTheory/.codex` },
  keeper: { skills: 11, path: `${REPO}/factory/products/services/cloud-keeper/.codex` },
  knowledgetheory: { skills: 12, path: `${REPO}/KnowledgeTheory/.codex` },
  mcpserver: { skills: 11, path: `${REPO}/theory-mcp-server/.codex` },
  preth: { skills: 9, path: `${REPO}/PreTheory/.codex` },
  progenitor: { skills: 14, source: 'lab' },
}

// BAKED set — default is correct regardless of args quirks; args.only may override.
const SET = (args && Array.isArray(args.only) && args.only.length) ? args.only : ['apptheory', 'facetheory', 'tabletheory']

const PUB_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'pre_verify_ok', 'published', 'published_version', 'validate_ok', 'byte_ok'],
  properties: {
    agent_id: { type: 'string' },
    pre_verify_ok: { type: 'boolean' },
    published: { type: 'boolean' },
    published_version: { type: 'integer' },
    validate_ok: { type: 'boolean' },
    byte_ok: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const NOTE = `Load tools first: ToolSearch "select:mcp__${LIVE}__agent_skill_list,mcp__${LIVE}__agent_install_layout_list,mcp__${LIVE}__agent_interface_publish,mcp__${LIVE}__agent_interface_validate,mcp__${LIVE}__agent_local_install_plan". Compute a file's sha256 with: sha256sum FILE.`

log(`Publishing ${SET.length} agent(s) into ${LIVE}: ${SET.join(', ')}`)

const results = await parallel(SET.map(id => () => {
  const m = META[id]
  if (!m) return Promise.resolve({ agent_id: id, pre_verify_ok: false, published: false, published_version: 0, validate_ok: false, byte_ok: false, issues: [`unknown agent_id ${id} — not in META`] })
  const byteSrc = m.source === 'lab'
    ? `This agent was replicated from LAB. Expected content shas: ToolSearch "select:mcp__${LAB}__agent_soul_get,mcp__${LAB}__agent_skill_list,mcp__${LAB}__agent_skill_get". expected steward.md sha = sha256 of mcp__${LAB}__agent_soul_get(agent_id="${id}").soul.body; each SKILL.md sha = sha256 of the matching lab skill body (agent_skill_get).`
    : `Expected content shas come from local files: steward.md sha = sha256sum ${m.path}/steward.md ; each skill SKILL.md sha = sha256sum ${m.path}/skills/<slug>/SKILL.md.`
  const prompt = `Publish agent "${id}" in LIVE (${LIVE}). Its draft is already authored and was verified ready earlier. Publish ONLY if the fresh pre-publish verify below passes.
${NOTE}

STEP 1 — FRESH PRE-PUBLISH VERIFY (drafts), the mechanical gate:
 - agent_skill_list(agent_id="${id}", limit=100): count MUST == ${m.skills}.
 - agent_install_layout_list(agent_id="${id}"): the URL/name-independent entries' content_sha256 MUST match EXACTLY:
     {{soul}} (.codex/steward.md, GEMINI.md) = ${FIXED.soul}
     {{skill.body}} (every SKILL.md entry) = ${FIXED.skill}
     .codex/config.toml = ${FIXED.configToml}
     .mcp.json = ${FIXED.claudeMcp}
     .agents/mcp_config.json = ${FIXED.agMcp}
 If the count is wrong or ANY fixed checksum mismatches: set pre_verify_ok=false, DO NOT PUBLISH, and return with the specific mismatch in issues.

STEP 2 — PUBLISH (only if pre_verify_ok): agent_interface_publish(agent_id="${id}", direct_user_authorization=true). Record published=true and published_version.

STEP 3 — VALIDATE: for each client in [codex, claude_code, antigravity]: agent_interface_validate(agent_id="${id}", client) must report valid / installable. validate_ok = all three valid.

STEP 4 — BYTE-CHECK (post-publish fidelity): agent_local_install_plan(agent_id="${id}", client="codex"). In manifest_entries, the steward.md entry checksum MUST == the expected steward.md sha, and EACH SKILL.md entry checksum MUST == its expected skill sha. ${byteSrc} (config.toml is route-rendered, so it is checked at the template level in STEP 1, not here.) byte_ok = steward.md AND all SKILL.md match.

Return {agent_id:"${id}", pre_verify_ok, published, published_version, validate_ok, byte_ok, issues[]}.`
  return agent(prompt, { label: `publish:${id}`, phase: 'Publish', schema: PUB_SCHEMA })
}))

const ok = results.filter(Boolean)
const published = ok.filter(r => r.published && r.validate_ok && r.byte_ok).map(r => r.agent_id)
const attention = ok.filter(r => !(r.published && r.validate_ok && r.byte_ok)).map(r => r.agent_id)
log(`Published clean: [${published.join(', ')}]  Needs attention: [${attention.join(', ') || 'none'}]`)
return { published, attention, results: ok }
