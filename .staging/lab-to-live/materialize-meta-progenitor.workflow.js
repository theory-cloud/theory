export const meta = {
  name: 'materialize-meta-progenitor',
  description: 'Materialize a second instance of the published progenitor agent into the factory/products/meta/progenitor submodule, all 3 hosts (codex/claude_code/antigravity): plan -> fetch pack to disk (download_url curl OR ReadMcpResourceTool→disk) -> verify pack checksum -> unzip -> verify every file checksum -> write install marker.',
  phases: [{ title: 'Materialize', detail: 'one subagent per host install' }],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const LIVE = 'theorymcp'
const TARGET = `${REPO}/factory/products/meta/progenitor`
const HOSTDIR = { codex: '.codex', claude_code: '.claude', antigravity: '.agents' }
const HOSTS = ['codex', 'claude_code', 'antigravity']

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'client', 'target_dir', 'pack_checksum_ok', 'files_expected', 'files_verified', 'mismatches', 'marker_written', 'published_version'],
  properties: {
    agent_id: { type: 'string' }, client: { type: 'string' }, target_dir: { type: 'string' },
    pack_checksum_ok: { type: 'boolean' }, files_expected: { type: 'integer' }, files_verified: { type: 'integer' },
    mismatches: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['path'], properties: { path: { type: 'string' }, expected: { type: 'string' }, got: { type: 'string' } } } },
    marker_written: { type: 'boolean' }, published_version: { type: 'integer' },
    fetch_method: { type: 'string' }, issues: { type: 'array', items: { type: 'string' } },
  },
}

log(`Materializing progenitor into ${TARGET} for ${HOSTS.length} hosts.`)

const results = await parallel(HOSTS.map(host => () => {
  const hostdir = HOSTDIR[host]
  const zip = `/tmp/meta-progenitor-${host}.zip`
  const prompt = `Materialize the PUBLISHED agent "progenitor" (client "${host}") from the LIVE namespace into ${TARGET}, fully checksum-verified. ${TARGET} is an existing git submodule checkout of the progenitor repo; its .gitignore already ignores .codex/ .claude/ .agents/ .mcp.json GEMINI.md, so the host install is local-only. Bash + MCP tools available. NEVER route pack bytes through context — fetch to disk; sha256sum prints only hashes.

1. Load tools: ToolSearch "select:mcp__${LIVE}__agent_local_install_plan,ReadMcpResourceTool".
2. PLAN (pins the resource in this MCP session): mcp__${LIVE}__agent_local_install_plan(agent_id="progenitor", client="${host}", target_directory="${TARGET}", include_skills=true). Capture: DL=plan.install_pack_resource.download_url (may be absent); URI=plan.install_pack_resource.uri; PACK_SHA=plan.pack_checksum without "sha256:"; ENTRIES=plan.manifest_entries (.path + .checksum); VER/SNAP/BUNDLE/MANIFEST_V from plan.update_plan.selected_{published_version,snapshot_checksum,bundle_checksum,install_manifest_version}.
3. FETCH to disk:
   - If DL exists: curl -sSL -o ${zip} "$DL" (fetch_method="download_url").
   - ELSE: ReadMcpResourceTool(server="${LIVE}", uri=URI). The harness SAVES the blob to disk and returns a saved-file path (e.g. blobSavedTo) — do NOT expect/echo base64. Copy that file to ${zip} (fetch_method="resources_read_to_disk"). If only inline base64 is returned with no on-disk path, STOP (pack_checksum_ok=false) and report.
4. VERIFY PACK: \`sha256sum ${zip}\` MUST equal PACK_SHA. If not: pack_checksum_ok=false, STOP (no unzip), report.
5. EXTRACT: mkdir -p ${TARGET} && unzip -o -q ${zip} -d ${TARGET}
6. VERIFY EACH FILE: for every ENTRY, \`sha256sum ${TARGET}/<path>\` MUST equal entry.checksum (drop "sha256:"). files_verified=count matched; mismatches[]=differences. files_expected=ENTRIES length.
7. MARKER: write ${TARGET}/${hostdir}/.theory-install.json = {"agent_id":"progenitor","client":"${host}","published_version":VER,"snapshot_checksum":SNAP,"bundle_checksum":BUNDLE,"install_manifest_version":MANIFEST_V}. marker_written=true if written.
8. CONFIRM gitignored: \`git -C ${TARGET} check-ignore ${hostdir}/\` should report it ignored (note in issues if NOT). Then rm -f ${zip}.
Return {agent_id:"progenitor", client:"${host}", target_dir:"${TARGET}", pack_checksum_ok, files_expected, files_verified, mismatches[], marker_written, published_version:VER, fetch_method, issues[]}.`
  return agent(prompt, { label: `materialize:progenitor/${host}`, phase: 'Materialize', schema: SCHEMA })
}))

const ok = results.filter(Boolean)
const good = ok.filter(r => r.pack_checksum_ok && r.files_verified === r.files_expected && (!r.mismatches || r.mismatches.length === 0) && r.marker_written)
const bad = ok.filter(r => !(r.pack_checksum_ok && r.files_verified === r.files_expected && (!r.mismatches || r.mismatches.length === 0) && r.marker_written))
log(`Done. clean=[${good.map(r => r.client).join(', ')}] problems=[${bad.map(r => r.client).join(', ') || 'none'}]`)
return { clean: good.map(r => r.client), problems: bad, results: ok }
