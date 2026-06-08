export const meta = {
  name: 'rework-delocalize-content',
  description: 'De-localize blocked/needs-review theorycloud agents into STAGED copies (never the source repos): stage -> apply canonical de-localization transforms -> re-audit -> iterate until clean. No publish.',
  phases: [
    { title: 'Stage', detail: 'copy source (local .codex / lab MCP) into a staged rework dir' },
    { title: 'Rework', detail: 'apply de-localization transforms to the staged copy' },
    { title: 'Re-audit', detail: 'audit the staged copy; loop back to Rework if not clean' },
  ],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const STAGE = `${REPO}/theory/.staging/lab-to-live/reworked`
const LAB = 'theorymcp_lab'
const MAXIT = 3
const AUDIT_FILE = '/tmp/claude-1000/-home-aron-ai-workspace-codebases-theory-cloud-theory/efff5895-5a53-464a-a091-ff43b34ade3b/tasks/w8v7gitqg.output'

const REGISTRY = {
  factory: { source: 'local', path: `${REPO}/factory/.codex`, skills: 22 },
  gov: { source: 'local', path: `${REPO}/GovTheory/.codex`, skills: 7 },
  keeper: { source: 'local', path: `${REPO}/factory/products/services/cloud-keeper/.codex`, skills: 11 },
  knowledgetheory: { source: 'local', path: `${REPO}/KnowledgeTheory/.codex`, skills: 12 },
  preth: { source: 'local', path: `${REPO}/PreTheory/.codex`, skills: 9 },
  design: { source: 'local', path: `${REPO}/theory-cloud-design/.codex`, skills: 10 },
  progenitor: { source: 'lab', labId: 'progenitor', skills: 14 },
}
const DEFAULT_TARGETS = ['factory', 'gov', 'keeper', 'knowledgetheory', 'preth', 'design', 'progenitor']
const TARGETS = (args && Array.isArray(args.only) && args.only.length) ? args.only : DEFAULT_TARGETS
const AGENTS = TARGETS.map(id => Object.assign({ id }, REGISTRY[id])).filter(a => a.source)

const STAGE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'staged_path', 'steward_present', 'skill_slugs'],
  properties: {
    agent_id: { type: 'string' },
    staged_path: { type: 'string' },
    steward_present: { type: 'boolean' },
    skill_slugs: { type: 'array', items: { type: 'string' } },
    notes: { type: 'array', items: { type: 'string' } },
  },
}
const REWORK_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'changes', 'preserved_intent'],
  properties: {
    agent_id: { type: 'string' },
    changes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['file', 'category', 'before', 'after'], properties: {
      file: { type: 'string' }, category: { type: 'string' }, before: { type: 'string' }, after: { type: 'string' },
    } } },
    preserved_intent: { type: 'boolean', description: 'true if the only differences from source are the de-localization changes (no dropped sections, no restyle, no semantic damage)' },
    notes: { type: 'array', items: { type: 'string' } },
  },
}
const AUDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'verdict', 'summary', 'findings'],
  properties: {
    agent_id: { type: 'string' },
    verdict: { type: 'string', enum: ['clean', 'needs-review', 'blocked'] },
    summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['file', 'category', 'severity', 'snippet', 'recommendation'], properties: {
      file: { type: 'string' }, line: { type: 'integer' }, category: { type: 'string', enum: ['localization', 'personalization', 'lab-baggage', 'private-or-source-ref', 'other'] },
      severity: { type: 'string', enum: ['blocker', 'review', 'ok-note'] }, snippet: { type: 'string' }, recommendation: { type: 'string' },
    } } },
  },
}

const CARVE_OUTS = `KEEP (these are NOT defects — do not change them):
- "lab" / "live" / "local" as DEPLOY TIERS (lab/live/local stages, "lab deploy", "lab S3 bucket", "lab mirror", premain->lab) — legitimate platform domain vocabulary.
- Host-ELIDED own/peer endpoints ("…/theorycloud/agents/<slug>/mcp") — already correct.
- Sibling Theory Cloud frameworks/agents (AppTheory, TableTheory, FaceTheory, Autheory, GovTheory, KnowledgeTheory, theory-mcp-server, theory-cli, etc.) as the agent's stack/domain.
- Public theory-cloud GitHub org URLs / package names (github.com/theory-cloud/..., @theory-cloud/...), and the public paytheory.com citation.
- Generic second-person address ("the user", "the operator", "you", "a Theory Cloud team member").
- Generic local-dev guidance ("run locally", "the local machine"), portable ~/.codex/ home convention, generic /tmp scratch, "Codex session" host context.`

const TRANSFORMS = `CANONICAL DE-LOCALIZATION TRANSFORMS — apply comprehensively to the STAGED copy. PRESERVE everything else byte-for-byte: do NOT drop sections, do NOT restyle, do NOT add content. The result must be a faithful GENERALIZATION — identical to the source except these de-localization changes:
1. NAMED HUMAN -> generic principal. Replace the operator's name/handle ("Aron", "Aron's", "aron23", and gendered "he/him/his" where it refers to that person) with "the operator" / "the operator's" / "they/them/their". Fix grammar so sentences read naturally (e.g. "Aron is your principal. He can authorize..." -> "The operator is your principal. They can authorize..."). Headings like "Your relationship to Aron" -> "Your relationship to your operator".
2. AUTHOR ABSOLUTE PATHS -> generic. Replace "/home/aron/ai-workspace/codebases/theory.cloud/<...>" (and any "/home/<user>/...") with a machine-neutral form matching the style used elsewhere in the same file (a repo-relative path, "your <repo> checkout", or "/path/to/<repo>").
3. LITERAL lab MCP ROUTES -> host-elided. Replace "https://lab.theorymcp.ai/<tenant>/..." and "lab.theorymcp.ai/<tenant>/..." route strings that name an agent's/peer's home or serving address with the host-elided form "…/<tenant>/agents/<slug>/mcp" (or "…/<tenant>/mcp"). EXCEPTION: keep "lab" where it is a deploy tier, and keep sentences that explicitly forbid hardcoding the host (those are disciplinary).
4. "<slug>_lab" NAMESPACE-SUFFIXED SURFACES -> host-neutral. Memory-ledger / server-block names like "factory_lab", "keeper_lab", "progenitor_lab" that name a home surface -> the agent's own surface for its installed namespace (drop the "_lab" suffix, e.g. "factory" / "your memory ledger"). Keep deploy-tier "_lab" only where clearly a stage convention.
5. HARDCODED CREDENTIAL PROFILES -> placeholder. "AWS_PROFILE=Penny" (and similar named profiles) -> "AWS_PROFILE=<your-aws-profile>" or "$AWS_PROFILE", with a brief note that the operator sets their own profile.
6. NAMED LOCAL HARDWARE -> generic. "Strix Halo (128 GB)" -> "the local training environment" / "your local training box", preserving the surrounding meaning (v0 environment, escalation discipline).
7. PRIVATE IDs / INTERNAL ARTIFACTS -> genericize or strip. Linear project URLs/UUIDs, internal doc paths (AUTHEORY_UI_REPLACEMENT_PLAN.md, progenitor/docs/issue-*.md, docs/si-m0-v1-bootstrap-content-deltas.md), the named internal Linear project ("Theory Cloud Design System — v1 Rollout"), checkout/venv layouts (local_training/.venv-m95-py312) -> generic descriptive references ("the design-system rollout project in your tracker", "your project's planning docs", "a project-relative interpreter"). Strip private UUIDs entirely; keep the durable behavioral meaning.
8. AUTHORING-HOST BUILD ARTIFACTS -> in-document reference. "./.codex/build.sh", "01-genome-philosophy.md" layer-source refs -> reword as in-document section references (the published soul is a single file, not rebuilt from layers by a consumer).
9. CROSS-TENANT LINEAGE (Pay Theory internal artifacts: partner-factory, partner-manager, mailbox routes, payment-service taxonomy) -> KEEP the guardrail meaning (these are load-bearing "do not copy" boundaries) but abstract genuinely-internal artifact NAMES to generic terms ("a prior parent-orchestrator factory pattern", "another tenant's payment/partner assumptions"). Keep the public paytheory.com citation.
10. PRIVATE ORG -> generic. "equaltoai" as a private source org -> "a parallel-domain source org" (keep only if clearly public).

${CARVE_OUTS}`

function readStaged(a, stagedPath) {
  return `Read the STAGED copy: ${stagedPath}/steward.md and every ${stagedPath}/skills/<slug>/SKILL.md (run: find ${stagedPath}/skills -mindepth 2 -maxdepth 2 -name SKILL.md).`
}

function stagePrompt(a) {
  const staged = `${STAGE}/${a.id}`
  if (a.source === 'lab') {
    return `Stage agent "${a.id}" from the LAB MCP into a local rework dir. Use Bash + your MCP tools.
1. mkdir -p ${staged}/skills
2. ToolSearch "select:mcp__${LAB}__agent_soul_get,mcp__${LAB}__agent_skill_list,mcp__${LAB}__agent_skill_get".
3. Write mcp__${LAB}__agent_soul_get(agent_id="${a.labId}").soul.body verbatim to ${staged}/steward.md (preserve exact bytes incl. trailing newline; avoid shell $(...) trailing-newline stripping — use a heredoc or a file write).
4. mcp__${LAB}__agent_skill_list(agent_id="${a.labId}", limit=100); for each slug, write mcp__${LAB}__agent_skill_get(...).body verbatim to ${staged}/skills/<slug>/SKILL.md.
Return {agent_id:"${a.id}", staged_path:"${staged}", steward_present, skill_slugs[], notes[]}.`
  }
  return `Stage agent "${a.id}" from its local .codex source into a rework dir. Use Bash.
1. mkdir -p ${staged}
2. cp ${a.path}/steward.md ${staged}/steward.md
3. mkdir -p ${staged}/skills; for each <slug> dir under ${a.path}/skills that contains SKILL.md: mkdir -p ${staged}/skills/<slug>; cp ${a.path}/skills/<slug>/SKILL.md ${staged}/skills/<slug>/SKILL.md   (you may cp -r the skills dir then it's fine).
Confirm: steward.md present and the count of staged skills/<slug>/SKILL.md == ${a.skills}.
Return {agent_id:"${a.id}", staged_path:"${staged}", steward_present, skill_slugs[] (the slugs), notes[]}.`
}

function reworkPrompt(a, stagedPath, focus) {
  return `De-localize agent "${a.id}" by editing its STAGED copy IN PLACE. Do NOT touch any source repo; only edit files under ${stagedPath}.
${readStaged(a, stagedPath)}

${TRANSFORMS}

${focus}

You may also consult the prior audit's findings for this agent (a JSON file) for a precise checklist: \`grep\`/read the block for "agent_id": "${a.id}" in ${AUDIT_FILE} (best-effort; if unavailable, rely on the transforms above).

Apply every applicable transform across the soul and ALL skills (edit ${stagedPath}/steward.md and ${stagedPath}/skills/*/SKILL.md). Be thorough — a single missed "Aron", lab route, or hardcoded profile fails the re-audit. Preserve all other bytes, structure, and meaning.
Return {agent_id:"${a.id}", changes:[{file (relative to staged), category, before (<=200 chars), after (<=200 chars)}], preserved_intent (true only if the ONLY changes are de-localization, no dropped sections/restyle), notes[]}.`
}

function auditStagedPrompt(a, stagedPath) {
  return `Audit the STAGED, reworked content for agent "${a.id}" to decide if de-localization is complete. ${readStaged(a, stagedPath)}
Flag every remaining instance of: (1) localization (author paths/hosts/machines/credential profiles), (2) personalization (a specific named human/handle), (3) lab-baggage (literal lab.theorymcp.ai route as home, "<slug>_lab" home surface), (4) private-or-source-ref (private IDs/URLs/internal doc paths/private orgs).
${CARVE_OUTS}
For each finding return {file, line, category, severity (blocker|review|ok-note), snippet (<=220 chars), recommendation}. verdict: "blocked" if any blocker, "needs-review" if any confirmed review and no blocker, "clean" if only ok-notes or nothing. Be skeptical of your own clean verdict: do an independent second read of the soul and every skill before concluding clean.
Return {agent_id:"${a.id}", verdict, summary, findings[]}.`
}

async function reworkUntilClean(a) {
  const staged = await agent(stagePrompt(a), { label: `stage:${a.id}`, phase: 'Stage', schema: STAGE_SCHEMA })
  if (!staged || !staged.steward_present) return { agent_id: a.id, staged_path: staged ? staged.staged_path : '', iterations: 0, final_verdict: 'blocked', audit: null, last_changes: null, error: 'staging failed' }
  const stagedPath = staged.staged_path
  let lastAudit = null, lastChanges = null, iterations = 0
  for (let i = 0; i < MAXIT; i++) {
    iterations = i + 1
    const focus = (lastAudit && lastAudit.findings && lastAudit.findings.length)
      ? `This is rework pass ${i + 1}. Unresolved findings from the last re-audit to FIX now (ignore ok-note): ${JSON.stringify(lastAudit.findings.filter(f => f.severity !== 'ok-note'))}`
      : `This is the first rework pass — apply ALL transforms comprehensively across soul and every skill.`
    lastChanges = await agent(reworkPrompt(a, stagedPath, focus), { label: `rework:${a.id}#${i + 1}`, phase: 'Rework', schema: REWORK_SCHEMA })
    lastAudit = await agent(auditStagedPrompt(a, stagedPath), { label: `reaudit:${a.id}#${i + 1}`, phase: 'Re-audit', schema: AUDIT_SCHEMA })
    if (lastAudit && lastAudit.verdict === 'clean') break
  }
  return { agent_id: a.id, staged_path: stagedPath, skills: a.skills, iterations, final_verdict: lastAudit ? lastAudit.verdict : 'unknown', audit: lastAudit, last_changes: lastChanges }
}

log(`Reworking ${AGENTS.length} agents (de-localize -> re-audit, up to ${MAXIT} passes each): ${AGENTS.map(a => a.id).join(', ')}`)

const results = await parallel(AGENTS.map(a => () => reworkUntilClean(a)))
const ok = results.filter(Boolean)
const clean = ok.filter(r => r.final_verdict === 'clean').map(r => r.agent_id)
const notClean = ok.filter(r => r.final_verdict !== 'clean').map(r => `${r.agent_id}(${r.final_verdict})`)
log(`Rework done. clean=[${clean.join(', ')}] notClean=[${notClean.join(', ') || 'none'}]`)
return { clean, notClean, results: ok }
