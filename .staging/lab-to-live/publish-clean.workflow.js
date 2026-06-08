export const meta = {
  name: 'theorycloud-publish-clean',
  description: 'Publish the audit-clean theorycloud agents: ensure soul present (upsert from source if missing) -> verify -> publish (human-authorized) -> validate -> trailing-newline-tolerant byte-check. Set BAKED IN.',
  phases: [
    { title: 'Publish', detail: 'per agent: ensure soul, verify, publish, validate, byte-check' },
  ],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const LIVE = 'theorymcp'

const FIXED = {
  soul: '26aedc85a90025d3ce2a25314e889c5859ca14611ee0fe88f62b76b03f3902d6',
  skill: '2d8a68430fb029995cc8fc531cfaec596336f8656c05d7adbacb39896a4a1b87',
  configToml: '58053e10c0492a4910f9fe67f8851c6cb23203db760b42a96275e5b90dfd8fc3',
  claudeMcp: 'eeb97207beb02b68acff04b1ef554ba99cbd8a60e30897646fd25489ee34ca2d',
  agMcp: '3afdc6a6b25aa0365604c0fede3563222173f6ead1da5205c25d76fda6e1d63b',
}

const META = {
  facetheory: { skills: 8, path: `${REPO}/FaceTheory/.codex` },
  autheory: { skills: 14, path: `${REPO}/autheory/.codex` },
  mcpserver: { skills: 11, path: `${REPO}/theory-mcp-server/.codex` },
}
const SET = (args && Array.isArray(args.only) && args.only.length) ? args.only : ['facetheory', 'autheory', 'mcpserver']

const PUB_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'soul_present', 'pre_verify_ok', 'published', 'published_version', 'validate_ok', 'byte_ok'],
  properties: {
    agent_id: { type: 'string' },
    soul_present: { type: 'boolean' },
    soul_was_upserted: { type: 'boolean' },
    pre_verify_ok: { type: 'boolean' },
    published: { type: 'boolean' },
    published_version: { type: 'integer' },
    validate_ok: { type: 'boolean' },
    byte_ok: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const NOTE = `Load tools: ToolSearch "select:mcp__${LIVE}__agent_soul_get,mcp__${LIVE}__agent_soul_upsert,mcp__${LIVE}__agent_skill_list,mcp__${LIVE}__agent_install_layout_list,mcp__${LIVE}__agent_interface_publish,mcp__${LIVE}__agent_interface_validate,mcp__${LIVE}__agent_local_install_plan". sha256 a file with: sha256sum FILE.`

log(`Publishing ${SET.length} clean agent(s) into ${LIVE}: ${SET.join(', ')}`)

const results = await parallel(SET.map(id => () => {
  const m = META[id]
  if (!m) return Promise.resolve({ agent_id: id, soul_present: false, pre_verify_ok: false, published: false, published_version: 0, validate_ok: false, byte_ok: false, issues: [`unknown agent ${id}`] })
  const prompt = `Publish audit-clean agent "${id}" in LIVE (${LIVE}). Its skills + install layouts are already drafted; its content is audit-clean. Its soul MAY be missing (some souls failed to persist in an earlier run).
${NOTE}

STEP 0 — ENSURE SOUL: call agent_soul_get(agent_id="${id}").
  - If present (returns a soul body): soul_present=true, soul_was_upserted=false.
  - If it errors "soul draft not found" / not-found: read ${m.path}/steward.md and agent_soul_upsert(agent_id="${id}", body=<exact file contents>). Then agent_soul_get again to CONFIRM it now returns a body. soul_present=true, soul_was_upserted=true. (Note: the server normalizes a trailing blank line — \\n\\n becomes \\n — that is expected.)
  - If still absent after upsert: soul_present=false; STOP, do not publish; return the error.

STEP 1 — VERIFY (drafts): agent_skill_list(agent_id="${id}", limit=100) count MUST == ${m.skills}. agent_install_layout_list(agent_id="${id}"): the URL/name-independent entries' content_sha256 MUST match: {{soul}}=${FIXED.soul}, {{skill.body}}=${FIXED.skill}, .codex/config.toml=${FIXED.configToml}, .mcp.json=${FIXED.claudeMcp}, .agents/mcp_config.json=${FIXED.agMcp}. pre_verify_ok = soul_present AND count ok AND all checksums match. If not, DO NOT PUBLISH.

STEP 2 — PUBLISH (only if pre_verify_ok): agent_interface_publish(agent_id="${id}", direct_user_authorization=true). Record published_version.

STEP 3 — VALIDATE: agent_interface_validate(agent_id="${id}", client) for codex, claude_code, antigravity — all must be valid/installable. validate_ok = all three.

STEP 4 — BYTE-CHECK (post-publish, trailing-newline tolerant): agent_local_install_plan(agent_id="${id}", client="codex").
  - SKILLS: each manifest_entries SKILL.md checksum MUST EXACTLY == sha256sum of the matching ${m.path}/skills/<slug>/SKILL.md.
  - SOUL: the manifest ".codex/steward.md" checksum should equal sha256sum of ${m.path}/steward.md; if it differs, confirm the difference is ONLY trailing newline(s) (the server normalizes a trailing blank line) — e.g. compare both with trailing whitespace stripped. If the only difference is trailing newline(s), the soul is faithful.
  - byte_ok = skills all exact AND soul faithful (exact or trailing-newline-normalized).
Return {agent_id:"${id}", soul_present, soul_was_upserted, pre_verify_ok, published, published_version, validate_ok, byte_ok, issues[]}.`
  return agent(prompt, { label: `publish:${id}`, phase: 'Publish', schema: PUB_SCHEMA })
}))

const ok = results.filter(Boolean)
const published = ok.filter(r => r.published && r.validate_ok && r.byte_ok).map(r => r.agent_id)
const attention = ok.filter(r => !(r.published && r.validate_ok && r.byte_ok)).map(r => r.agent_id)
log(`Published clean: [${published.join(', ')}]  Needs attention: [${attention.join(', ') || 'none'}]`)
return { published, attention, results: ok }
