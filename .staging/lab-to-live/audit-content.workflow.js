export const meta = {
  name: 'audit-replication-content',
  description: 'Audit replicated agent content (souls+skills) for localization, personalization (Aron), lab-environment baggage, and private/source references before publish. Handles local-.codex sources and lab-MCP source (progenitor).',
  phases: [
    { title: 'Review', detail: 'one subagent per agent: deep-read soul + every skill, flag findings' },
    { title: 'Verify', detail: 'adversarially re-classify each finding against the legit carve-outs + catch misses' },
  ],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const LAB = 'theorymcp_lab'

// source: 'local' => read steward.md + skills/*/SKILL.md under path. 'lab' => read soul+skills from lab MCP.
const REGISTRY = {
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

// BAKED default = the 9 not-yet-audited agents. args.only may override.
const DEFAULT_TARGETS = ['autheory', 'design', 'factory', 'gov', 'keeper', 'knowledgetheory', 'mcpserver', 'preth', 'progenitor']
const TARGETS = (args && args.only) ? (Array.isArray(args.only) ? args.only : [args.only]) : DEFAULT_TARGETS
const AGENTS = TARGETS.map(id => Object.assign({ id }, REGISTRY[id])).filter(a => a.source)

const FINDING_PROPS = {
  file: { type: 'string', description: 'for local: path relative to .codex (steward.md / skills/<slug>/SKILL.md). for lab: "soul" or "skills/<slug>".' },
  line: { type: 'integer' },
  category: { type: 'string', enum: ['localization', 'personalization', 'lab-baggage', 'private-or-source-ref', 'other'] },
  severity: { type: 'string', enum: ['blocker', 'review', 'ok-note'] },
  snippet: { type: 'string', description: 'the offending text, <= 220 chars' },
  recommendation: { type: 'string' },
}
const REVIEW_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'verdict', 'summary', 'findings'],
  properties: {
    agent_id: { type: 'string' },
    verdict: { type: 'string', enum: ['clean', 'needs-review', 'blocked'] },
    summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['file', 'category', 'severity', 'snippet', 'recommendation'], properties: FINDING_PROPS } },
  },
}
const VFINDING_PROPS = Object.assign({}, FINDING_PROPS, { confirmed: { type: 'boolean', description: 'true if the finding is real at the stated severity after re-check' } })
const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['agent_id', 'verdict', 'summary', 'findings'],
  properties: {
    agent_id: { type: 'string' },
    verdict: { type: 'string', enum: ['clean', 'needs-review', 'blocked'] },
    summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['file', 'category', 'severity', 'snippet', 'recommendation', 'confirmed'], properties: VFINDING_PROPS } },
  },
}

const CARVE_OUTS = `CARVE-OUTS (do NOT flag these as blockers):
- "lab" as a DEPLOY TIER in "lab / live / local" (a stage of the Theory Cloud platform the agent reasons about) is LEGITIMATE DOMAIN VOCABULARY. It is NOT a reference to the lab MCP namespace the agent is being moved out of. Keep it; at most mark ok-note. Only flag "lab" as lab-baggage (review/blocker) if it ties the agent to a lab ROUTE/NAMESPACE/ENTITLEMENT as its home (e.g. lab.theorymcp.ai, "the lab namespace", "your lab tenant").
- Public theory-cloud GitHub org URLs and package names (github.com/theory-cloud/..., @theory-cloud/...), and a public customer citation (paytheory.com), are PUBLIC FACTS about open-source projects. Mark ok-note unless they leak something private.
- References to SIBLING Theory Cloud frameworks/agents (AppTheory, TableTheory, FaceTheory, Autheory, KnowledgeTheory, theory-mcp-server, etc.) as the agent's domain/stack are load-bearing context, NOT private sibling repos a consumer must have checked out. ok-note.
- Generic second-person address ("the user", "the operator", "you", "a Theory Cloud team member") is CORRECT generalization, NOT personalization. Only flag personalization for a SPECIFIC named human, personal email/handle, or framing that only makes sense for one named individual.
- Generic "run it locally" / "the local machine" / "local dev" is fine. Only flag localization when content assumes a SPECIFIC local path, checkout layout, host, or machine. A host-ELIDED own endpoint ("…/theorycloud/agents/<id>/mcp") is NOT lab-baggage.`

function readInstructions(a) {
  if (a.source === 'lab') {
    return `Read this agent's replicated content from the LAB MCP (it has no local .codex):
- ToolSearch "select:mcp__${LAB}__agent_soul_get,mcp__${LAB}__agent_skill_list,mcp__${LAB}__agent_skill_get"
- soul body = mcp__${LAB}__agent_soul_get(agent_id="${a.labId}").soul.body
- skills = mcp__${LAB}__agent_skill_list(agent_id="${a.labId}", limit=100); for each, mcp__${LAB}__agent_skill_get(agent_id="${a.labId}", skill_id=<slug>).body
For 'file' in findings use "soul" or "skills/<slug>". (line may be 0 if not applicable.)`
  }
  return `Read EVERY content file with your Read/Bash tools:
- ${a.path}/steward.md  (the soul)
- every ${a.path}/skills/<slug>/SKILL.md  (run: find ${a.path}/skills -mindepth 2 -maxdepth 2 -name SKILL.md, then Read each in full)
Do NOT read ${a.path}/tmp or ${a.path}/config.toml — config.toml is local host plumbing, NOT replicated agent content, and tmp is a stray build cache. Both are out of scope. For 'file' use the path relative to ${a.path}.`
}

function reviewPrompt(a) {
  return `You are auditing the content that was replicated into the LIVE Theory Cloud namespace for agent "${a.id}". Decide whether this content is fit to publish as a GENERIC, installable Theory Cloud agent that ANY Theory Cloud team member could install — not tied to one author's machine, one named person, or the lab environment.

${readInstructions(a)}

Flag every instance in these FOUR categories:
1. localization — content that assumes the AUTHOR's local machine / filesystem / checkout layout / host: absolute paths (/home/..., ~/...), specific local directories, localhost/ports, machine-specific commands or env.
2. personalization — any reference to a SPECIFIC named human (e.g. "Aron"), a personal email/handle/account, or framing that assumes one specific operator rather than a generic user/operator/team member.
3. lab-baggage — references that tie the agent to the LAB namespace/route/environment as its HOME (lab.theorymcp.ai route, "the lab namespace/tenant", lab-only entitlements).
4. private-or-source-ref — private/internal repos, internal-only systems, or external URLs/context that leak private detail.

${CARVE_OUTS}

For each finding return {file, line, category, severity (blocker|review|ok-note), snippet (<=220 chars), recommendation (concrete)}.
- blocker = must change before publishing (genuinely local, personal, or lab-route baggage).
- review = operator should decide (borderline).
- ok-note = legitimate, recorded for transparency (lab-as-tier, public theory-cloud URL, sibling-framework context).

Set verdict: "blocked" if ANY blocker; "needs-review" if any review and no blocker; "clean" if only ok-notes or nothing. Write a 1-3 sentence summary of how localized/personalized this agent's content is overall.
Return {agent_id:"${a.id}", verdict, summary, findings[]}.`
}

function verifyPrompt(a, review) {
  return `Adversarially RE-CHECK the localization/generalization audit for agent "${a.id}". Default to skepticism: a finding is only real if you can confirm it in the source at the stated severity.

Claimed findings from the first pass:
${JSON.stringify(review && review.findings ? review.findings : [], null, 0)}

${readInstructions(a)}

For EACH claimed finding: confirm (a) the snippet actually exists in the source, (b) the severity is correct GIVEN THE CARVE-OUTS below. Downgrade false positives to ok-note (or mark confirmed=false). In particular: "lab/live/local" deploy-tier usage is NOT a blocker; public theory-cloud URLs are NOT blockers; sibling-framework references are NOT private; generic "user/operator/you" is NOT personalization; a host-elided own endpoint is NOT lab-baggage.

THEN do an INDEPENDENT second read of the agent's soul and every skill and add any finding the first pass MISSED — especially subtle ones: prose that assumes private/shared context ("as we discussed", "the usual setup"), an implicit single-operator assumption, a hardcoded environment detail, or a real lab.theorymcp.ai route inside the soul/skill text.

${CARVE_OUTS}

Return the corrected {agent_id:"${a.id}", verdict, summary, findings[]} where each finding additionally has confirmed (boolean). Recompute verdict from the CONFIRMED findings only.`
}

log(`Auditing ${AGENTS.length} agents: ${AGENTS.map(a => `${a.id}(${a.source})`).join(', ')}`)

const audited = await pipeline(
  AGENTS,
  a => agent(reviewPrompt(a), { label: `review:${a.id}`, phase: 'Review', schema: REVIEW_SCHEMA }),
  (review, a) => agent(verifyPrompt(a, review), { label: `verify:${a.id}`, phase: 'Verify', schema: VERIFY_SCHEMA }),
)

const results = audited.filter(Boolean)
const blocked = results.filter(r => r.verdict === 'blocked').map(r => r.agent_id)
const needsReview = results.filter(r => r.verdict === 'needs-review').map(r => r.agent_id)
const clean = results.filter(r => r.verdict === 'clean').map(r => r.agent_id)
log(`Audit done. clean=[${clean.join(', ')}] needs-review=[${needsReview.join(', ')}] blocked=[${blocked.join(', ')}]`)

return { clean, needsReview, blocked, results }
