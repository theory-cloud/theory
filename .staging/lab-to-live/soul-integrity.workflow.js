export const meta = {
  name: 'soul-integrity-check',
  description: 'READ-ONLY: for each replicated theorycloud agent, compare the live draft soul against the source (local steward.md / lab MCP) by sha256, and report presence + match + published version. No writes.',
  phases: [{ title: 'Check', detail: 'one read-only subagent per agent' }],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const LIVE = 'theorymcp'
const LAB = 'theorymcp_lab'

const REG = {
  apptheory: { source: 'local', path: `${REPO}/AppTheory/.codex` },
  facetheory: { source: 'local', path: `${REPO}/FaceTheory/.codex` },
  tabletheory: { source: 'local', path: `${REPO}/TableTheory/.codex` },
  autheory: { source: 'local', path: `${REPO}/autheory/.codex` },
  design: { source: 'local', path: `${REPO}/theory-cloud-design/.codex` },
  factory: { source: 'local', path: `${REPO}/factory/.codex` },
  gov: { source: 'local', path: `${REPO}/GovTheory/.codex` },
  keeper: { source: 'local', path: `${REPO}/factory/products/services/cloud-keeper/.codex` },
  knowledgetheory: { source: 'local', path: `${REPO}/KnowledgeTheory/.codex` },
  mcpserver: { source: 'local', path: `${REPO}/theory-mcp-server/.codex` },
  preth: { source: 'local', path: `${REPO}/PreTheory/.codex` },
  progenitor: { source: 'lab', labId: 'progenitor' },
}
const SET = ['apptheory', 'facetheory', 'tabletheory', 'autheory', 'design', 'factory', 'gov', 'keeper', 'knowledgetheory', 'mcpserver', 'preth', 'progenitor']

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'source_sha', 'source_bytes', 'draft_present', 'draft_sha', 'draft_matches_source', 'published_version', 'identity_complete'],
  properties: {
    agent_id: { type: 'string' },
    source_sha: { type: 'string' },
    source_bytes: { type: 'integer' },
    draft_present: { type: 'boolean' },
    draft_sha: { type: 'string', description: 'sha256 of the live draft soul body, or "" if absent' },
    draft_matches_source: { type: 'boolean' },
    published_version: { type: 'integer', description: '0 if unpublished' },
    published_soul_sha: { type: 'string', description: 'sha of published steward.md from install-plan, or "" if unpublished/unknown' },
    identity_complete: { type: 'boolean' },
    notes: { type: 'array', items: { type: 'string' } },
  },
}

log(`Soul-integrity (read-only) for ${SET.length} agents.`)

const results = await parallel(SET.map(id => () => {
  const r = REG[id]
  const srcStep = r.source === 'local'
    ? `SOURCE: source_sha = the hash from \`sha256sum ${r.path}/steward.md\`; source_bytes = \`wc -c < ${r.path}/steward.md\`.`
    : `SOURCE (lab): ToolSearch "select:mcp__${LAB}__agent_soul_get"; body = mcp__${LAB}__agent_soul_get(agent_id="${r.labId}").soul.body. To sha it identically to a file, write the body to a temp file WITHOUT adding any trailing newline (e.g. a heredoc or printf '%s' that preserves the exact bytes — beware shell $(...) strips trailing newlines), then \`sha256sum\` that temp file. source_bytes = its byte size.`
  const prompt = `READ-ONLY soul-integrity check for agent "${id}" in LIVE (${LIVE}). Do NOT upsert, publish, or modify anything.
Load: ToolSearch "select:mcp__${LIVE}__agent_soul_get,mcp__${LIVE}__agent_interface_status,mcp__${LIVE}__agent_local_install_plan".

1. ${srcStep}
2. DRAFT: call mcp__${LIVE}__agent_soul_get(agent_id="${id}").
   - If it errors with not-found / "soul draft not found": draft_present=false, draft_sha="", draft_matches_source=false.
   - Else: draft_present=true. If the result carries a content checksum/sha field, use it as draft_sha; otherwise write soul.body to a temp file preserving exact bytes (NO added newline; avoid $(...) trailing-newline stripping) and \`sha256sum\` it. draft_matches_source = (draft_sha == source_sha).
3. STATUS: mcp__${LIVE}__agent_interface_status(agent_id="${id}") → published_version (0 if unpublished), identity_complete.
4. If published_version > 0: mcp__${LIVE}__agent_local_install_plan(agent_id="${id}", client="codex"); published_soul_sha = the manifest_entries checksum for ".codex/steward.md". Else published_soul_sha="".
Return {agent_id:"${id}", source_sha, source_bytes, draft_present, draft_sha, draft_matches_source, published_version, published_soul_sha, identity_complete, notes[]}.`
  return agent(prompt, { label: `soul:${id}`, phase: 'Check', schema: SCHEMA })
}))

const ok = results.filter(Boolean)
const missing = ok.filter(r => !r.draft_present).map(r => r.agent_id)
const mismatch = ok.filter(r => r.draft_present && !r.draft_matches_source).map(r => r.agent_id)
const good = ok.filter(r => r.draft_present && r.draft_matches_source).map(r => r.agent_id)
log(`Souls: matching=[${good.join(', ')}] mismatch=[${mismatch.join(', ')}] missing=[${missing.join(', ')}]`)
return { good, mismatch, missing, results: ok }
