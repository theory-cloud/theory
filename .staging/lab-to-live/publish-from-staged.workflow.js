export const meta = {
  name: 'theorycloud-publish-from-staged',
  description: 'Publish reworked/condensed theorycloud agents from STAGED de-localized content: upsert soul (+skills) byte-perfect -> verify -> publish (human-authorized) -> validate -> byte-check vs staged. Layouts already authored (content-independent {{soul}}/{{skill.body}} templates). Set BAKED.',
  phases: [
    { title: 'Publish', detail: 'per agent: upsert staged soul+skills, verify, publish, validate, byte-check' },
  ],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const STAGE = `${REPO}/theory/.staging/lab-to-live/reworked`
const LIVE = 'theorymcp'

const FIXED = {
  soul: '26aedc85a90025d3ce2a25314e889c5859ca14611ee0fe88f62b76b03f3902d6',
  skill: '2d8a68430fb029995cc8fc531cfaec596336f8656c05d7adbacb39896a4a1b87',
  configToml: '58053e10c0492a4910f9fe67f8851c6cb23203db760b42a96275e5b90dfd8fc3',
  claudeMcp: 'eeb97207beb02b68acff04b1ef554ba99cbd8a60e30897646fd25489ee34ca2d',
  agMcp: '3afdc6a6b25aa0365604c0fede3563222173f6ead1da5205c25d76fda6e1d63b',
}

// skillsFromStaged=false => skills already drafted+clean in live, only the soul changed (facetheory); byte-check skills vs srcSkills.
const META = {
  facetheory: { skills: 8, skillsFromStaged: false, srcSkills: `${REPO}/FaceTheory/.codex/skills` },
  factory: { skills: 22, skillsFromStaged: true },
  gov: { skills: 7, skillsFromStaged: true },
  keeper: { skills: 11, skillsFromStaged: true },
  knowledgetheory: { skills: 12, skillsFromStaged: true },
  preth: { skills: 9, skillsFromStaged: true },
  design: { skills: 10, skillsFromStaged: true },
  progenitor: { skills: 14, skillsFromStaged: true },
}
// Final two: gov + preth — condensed souls under cap (47993B / 47974B), de-localized skills staged.
const SET = (args && Array.isArray(args.only) && args.only.length) ? args.only
  : ['gov', 'preth']
const AGENTS = SET.filter(id => META[id])

const PUB_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'soul_ok', 'skills_ok', 'pre_verify_ok', 'published', 'published_version', 'validate_ok', 'byte_ok'],
  properties: {
    agent_id: { type: 'string' }, soul_ok: { type: 'boolean' }, skills_ok: { type: 'boolean' },
    pre_verify_ok: { type: 'boolean' }, published: { type: 'boolean' }, published_version: { type: 'integer' },
    validate_ok: { type: 'boolean' }, byte_ok: { type: 'boolean' }, issues: { type: 'array', items: { type: 'string' } },
  },
}

const NOTE = `Load tools: ToolSearch "select:mcp__${LIVE}__agent_soul_upsert,mcp__${LIVE}__agent_soul_get,mcp__${LIVE}__agent_skill_upsert,mcp__${LIVE}__agent_skill_list,mcp__${LIVE}__agent_install_layout_list,mcp__${LIVE}__agent_interface_publish,mcp__${LIVE}__agent_interface_validate,mcp__${LIVE}__agent_local_install_plan". sha256 a file: sha256sum FILE. The server normalizes a trailing blank line (\\n\\n -> \\n) — treat a soul/skill diff that is ONLY trailing newline(s) as faithful.`

log(`Publishing ${AGENTS.length} reworked agent(s) from staged content into ${LIVE}: ${AGENTS.join(', ')}`)

const results = await parallel(AGENTS.map(id => () => {
  const m = META[id]
  const staged = `${STAGE}/${id}`
  const skillsStep = m.skillsFromStaged
    ? `STEP 1 — SKILLS (from staged, de-localized): list ${staged}/skills/<slug>/SKILL.md (find ${staged}/skills -mindepth 2 -maxdepth 2 -name SKILL.md), slug-sorted. For EACH: body = full file verbatim; parse YAML frontmatter for name + description (if absent, name=Title Case of slug, description=first prose line). agent_skill_upsert(agent_id="${id}", skill_id=<slug>, slug=<slug>, name=<name>, description=<description>, display_order=<index>, body=<body>). This OVERWRITES the earlier localized drafts. skills_ok = all upserted and count == ${m.skills}.`
    : `STEP 1 — SKILLS: this agent's skills are already drafted, clean, and unchanged — do NOT re-upsert. Just confirm agent_skill_list count == ${m.skills}. skills_ok = (count == ${m.skills}).`
  const skillsByte = m.skillsFromStaged
    ? `each published SKILL.md checksum == sha256sum of ${staged}/skills/<slug>/SKILL.md`
    : `each published SKILL.md checksum == sha256sum of ${m.srcSkills}/<slug>/SKILL.md`
  const prompt = `Publish reworked agent "${id}" in LIVE (${LIVE}) from its STAGED de-localized content. Drafts for layouts already exist (content-independent templates).
${NOTE}

STEP 0 — SOUL (from staged): read ${staged}/steward.md. It MUST be < 49152 bytes (\`wc -c\`); if not, STOP, soul_ok=false, report. agent_soul_upsert(agent_id="${id}", body=<exact file bytes>). Then agent_soul_get to confirm present. soul_ok = upserted + present.

${skillsStep}

STEP 2 — VERIFY (drafts): soul present; agent_skill_list count == ${m.skills}; agent_install_layout_list URL/name-independent entries match: {{soul}}=${FIXED.soul}, {{skill.body}}=${FIXED.skill}, .codex/config.toml=${FIXED.configToml}, .mcp.json=${FIXED.claudeMcp}, .agents/mcp_config.json=${FIXED.agMcp}. pre_verify_ok = soul_ok AND skills_ok AND checksums match. If not, DO NOT PUBLISH.

STEP 3 — PUBLISH (if pre_verify_ok): agent_interface_publish(agent_id="${id}", direct_user_authorization=true). Record published_version.

STEP 4 — VALIDATE: agent_interface_validate(agent_id="${id}", client) for codex, claude_code, antigravity — all valid/installable. validate_ok = all three.

STEP 5 — BYTE-CHECK: agent_local_install_plan(agent_id="${id}", client="codex"). SOUL: published .codex/steward.md checksum == sha256sum of ${staged}/steward.md (tolerate trailing-newline normalization). SKILLS: ${skillsByte} (exact). byte_ok = soul faithful AND all skills match.
Return {agent_id:"${id}", soul_ok, skills_ok, pre_verify_ok, published, published_version, validate_ok, byte_ok, issues[]}.`
  return agent(prompt, { label: `publish:${id}`, phase: 'Publish', schema: PUB_SCHEMA })
}))

const ok = results.filter(Boolean)
const published = ok.filter(r => r.published && r.validate_ok && r.byte_ok).map(r => r.agent_id)
const attention = ok.filter(r => !(r.published && r.validate_ok && r.byte_ok)).map(r => r.agent_id)
log(`Published clean: [${published.join(', ')}]  Needs attention: [${attention.join(', ') || 'none'}]`)
return { published, attention, results: ok }
