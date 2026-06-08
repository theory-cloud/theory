export const meta = {
  name: 'bootstrap-sibling-repos-retry',
  description: 'Retry the 3 remaining host installs (progenitor/antigravity, factory/codex, factory/antigravity): plan -> fetch pack to disk (download_url curl OR ReadMcpResourceTool which the harness saves to disk) -> verify pack checksum -> unzip -> verify every file checksum -> write install marker.',
  phases: [{ title: 'Bootstrap', detail: 'one subagent per remaining (agent, host)' }],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const LIVE = 'theorymcp'
const HOSTDIR = { codex: '.codex', claude_code: '.claude', antigravity: '.agents' }

// Only the 3 that did not complete cleanly the first run.
const installs = [
  { id: 'progenitor', dir: `${REPO}/progenitor`, host: 'antigravity' },
  { id: 'factory', dir: `${REPO}/factory`, host: 'codex' },
  { id: 'factory', dir: `${REPO}/factory`, host: 'antigravity' },
]

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

log(`Retrying ${installs.length} remaining host installs.`)

const results = await parallel(installs.map(({ id, dir, host }) => () => {
  const hostdir = HOSTDIR[host]
  const zip = `/tmp/bootstrap-${id}-${host}.zip`
  const prompt = `Materialize the PUBLISHED agent "${id}" (client "${host}") from the LIVE namespace into ${dir}, fully checksum-verified. Bash + MCP tools available. NEVER route pack bytes through your context — fetch to disk; sha256sum only prints hashes.

1. Load tools: ToolSearch "select:mcp__${LIVE}__agent_local_install_plan,ReadMcpResourceTool".
2. PLAN (also pins the resource in this MCP session): mcp__${LIVE}__agent_local_install_plan(agent_id="${id}", client="${host}", target_directory="${dir}", include_skills=true). Capture: DL = plan.install_pack_resource.download_url (may be absent); URI = plan.install_pack_resource.uri; PACK_SHA = plan.pack_checksum without "sha256:"; ENTRIES = plan.manifest_entries (.path + .checksum); VER/SNAP/BUNDLE/MANIFEST_V from plan.update_plan.selected_{published_version,snapshot_checksum,bundle_checksum,install_manifest_version}.
3. FETCH to disk:
   - If DL exists: curl -sSL -o ${zip} "$DL" (fetch_method="download_url").
   - ELSE: call ReadMcpResourceTool(server="${LIVE}", uri=URI). The harness SAVES the blob to disk and returns a saved-file path (e.g. a "blobSavedTo"/path field) — do NOT expect/echo base64. Copy that saved file to ${zip}. fetch_method="resources_read_to_disk". If the tool returns ONLY inline base64 with no on-disk path, STOP (pack_checksum_ok=false) and report — do not reconstruct bytes through context.
4. VERIFY PACK: \`sha256sum ${zip}\` MUST equal PACK_SHA. If not: pack_checksum_ok=false, STOP (no unzip), report.
5. EXTRACT: mkdir -p ${dir} && unzip -o -q ${zip} -d ${dir}
6. VERIFY EACH FILE: for every ENTRY, \`sha256sum ${dir}/<path>\` MUST equal entry.checksum (drop "sha256:"). files_verified = count matched; mismatches[] = any that differ. files_expected = ENTRIES length.
7. MARKER: write ${dir}/${hostdir}/.theory-install.json = {"agent_id":"${id}","client":"${host}","published_version":VER,"snapshot_checksum":SNAP,"bundle_checksum":BUNDLE,"install_manifest_version":MANIFEST_V}. marker_written=true if written.
8. rm -f ${zip}
Return {agent_id:"${id}", client:"${host}", target_dir:"${dir}", pack_checksum_ok, files_expected, files_verified, mismatches[], marker_written, published_version:VER, fetch_method, issues[]}.`
  return agent(prompt, { label: `bootstrap:${id}/${host}`, phase: 'Bootstrap', schema: SCHEMA })
}))

const ok = results.filter(Boolean)
const good = ok.filter(r => r.pack_checksum_ok && r.files_verified === r.files_expected && (!r.mismatches || r.mismatches.length === 0) && r.marker_written)
const bad = ok.filter(r => !(r.pack_checksum_ok && r.files_verified === r.files_expected && (!r.mismatches || r.mismatches.length === 0) && r.marker_written))
log(`Retry done. clean=[${good.map(r => `${r.agent_id}/${r.client}`).join(', ')}] problems=[${bad.map(r => `${r.agent_id}/${r.client}`).join(', ') || 'none'}]`)
return { clean: good.map(r => `${r.agent_id}/${r.client}`), problems: bad, results: ok }
