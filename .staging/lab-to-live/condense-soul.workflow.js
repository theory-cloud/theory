export const meta = {
  name: 'condense-soul-to-fit',
  description: 'Condense an over-limit soul (>49152 bytes) BELOW the server cap while preserving identity, every invariant, and the FULL refusal list. Edits the STAGED soul copy in place; re-verifies size + integrity. No publish.',
  phases: [
    { title: 'Stage', detail: 'ensure the staged soul file exists' },
    { title: 'Condense', detail: 'tighten redundancy until < target bytes (loop)' },
    { title: 'Verify', detail: 'confirm size + sections + full refusal list intact, no localization introduced' },
  ],
}

const REPO = '/home/aron/ai-workspace/codebases/theory.cloud'
const STAGE = `${REPO}/theory/.staging/lab-to-live/reworked`
const LIMIT = 49152
const TARGET = 48000 // margin under the hard cap
const MAXIT = 3

// origin 'clean-source': copy the clean source soul into staged then condense (content already audit-clean).
// origin 'staged': the de-localized soul already exists at STAGE/<id>/steward.md (produced by rework).
const REG = {
  facetheory: { origin: 'clean-source', src: `${REPO}/FaceTheory/.codex/steward.md` },
  gov: { origin: 'staged' },
  preth: { origin: 'staged' },
}
const SET = (args && Array.isArray(args.only) && args.only.length) ? args.only : ['gov', 'preth']
const AGENTS = SET.map(id => Object.assign({ id }, REG[id])).filter(a => a.origin)

const ENSURE_SCHEMA = { type: 'object', additionalProperties: false, required: ['agent_id', 'staged_soul', 'start_bytes', 'present'], properties: {
  agent_id: { type: 'string' }, staged_soul: { type: 'string' }, start_bytes: { type: 'integer' }, present: { type: 'boolean' }, notes: { type: 'array', items: { type: 'string' } },
} }
const CONDENSE_SCHEMA = { type: 'object', additionalProperties: false, required: ['agent_id', 'final_bytes', 'under_limit', 'preserved_intent'], properties: {
  agent_id: { type: 'string' }, final_bytes: { type: 'integer' }, under_limit: { type: 'boolean' }, preserved_intent: { type: 'boolean' },
  cuts: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['area', 'what_was_tightened'], properties: { area: { type: 'string' }, what_was_tightened: { type: 'string' } } } },
  notes: { type: 'array', items: { type: 'string' } },
} }
const VERIFY_SCHEMA = { type: 'object', additionalProperties: false, required: ['agent_id', 'final_bytes', 'under_limit', 'sections_intact', 'refusals_intact', 'no_localization_introduced', 'ok'], properties: {
  agent_id: { type: 'string' }, final_bytes: { type: 'integer' }, under_limit: { type: 'boolean' }, sections_intact: { type: 'boolean' }, refusals_intact: { type: 'boolean' }, no_localization_introduced: { type: 'boolean' }, ok: { type: 'boolean' }, issues: { type: 'array', items: { type: 'string' } },
} }

function ensurePrompt(a) {
  const staged = `${STAGE}/${a.id}/steward.md`
  if (a.origin === 'clean-source') {
    return `Prepare the staged soul for "${a.id}". Bash:
mkdir -p ${STAGE}/${a.id}
cp ${a.src} ${staged}
Report start_bytes = \`wc -c < ${staged}\`, present=true, staged_soul="${staged}".
Return {agent_id:"${a.id}", staged_soul:"${staged}", start_bytes, present, notes[]}.`
  }
  return `Confirm the staged (de-localized) soul exists for "${a.id}" at ${staged}. Bash: if it exists, present=true and start_bytes = \`wc -c < ${staged}\`; else present=false.
Return {agent_id:"${a.id}", staged_soul:"${staged}", start_bytes, present, notes[]}.`
}

function condensePrompt(a, staged, prevBytes) {
  return `Condense the soul file ${staged} to AT MOST ${TARGET} BYTES (currently ~${prevBytes} bytes; the namespace HARD-LIMITS soul bodies to ${LIMIT} bytes, so it MUST end up < ${LIMIT}). This is an IDENTITY document — condense by tightening, not gutting.

PRESERVE (do NOT remove, weaken, or vaguen):
- Every top-level section / heading and its core meaning.
- Every invariant, guarantee, gate, and discipline.
- The COMPLETE refusal list — every individual refusal, each still SPECIFIC and grounded in its invariant. Never drop a refusal or merge two into a vaguer one.
- The agent's identity, principal, boundaries, voice, and all domain-specific technical content (tiers, contracts, deploy stages, schemas, etc.).

REDUCE here (this is where the bytes come from):
- Verbose / redundant prose: tighten wording, remove repetition and restated points, cut filler.
- Multiple examples making the SAME point -> keep the clearest one (or two).
- Long preambles and redundant recaps.

Edit the file IN PLACE with your editor tools. COUNT BYTES, not characters (multi-byte box-drawing/arrow glyphs are present) — verify with \`wc -c ${staged}\`. Iterate your edits until \`wc -c\` reports < ${TARGET}.
Return {agent_id:"${a.id}", final_bytes (the wc -c result), under_limit (final_bytes < ${LIMIT}), preserved_intent (true ONLY if every PRESERVE item is fully intact), cuts:[{area, what_was_tightened}], notes[]}.`
}

function verifyPrompt(a, staged) {
  return `Verify the condensed soul ${staged}. Read it fully.
1. SIZE: final_bytes = \`wc -c < ${staged}\`; under_limit = final_bytes < ${LIMIT}.
2. SECTIONS: every major section/heading still present (sections_intact).
3. REFUSALS: the refusal list is complete and each refusal is still specific + invariant-grounded — none dropped or vagued (refusals_intact). Read the refusal section carefully.
4. NO REGRESSION: condensing introduced no localization/personalization/lab-route/private-ref (no "Aron", /home paths, lab.theorymcp.ai routes, AWS profiles, private IDs) — no_localization_introduced.
ok = under_limit AND sections_intact AND refusals_intact AND no_localization_introduced.
Return {agent_id:"${a.id}", final_bytes, under_limit, sections_intact, refusals_intact, no_localization_introduced, ok, issues[]}.`
}

log(`Condense-to-fit for ${AGENTS.length} over-limit soul(s): ${AGENTS.map(a => a.id).join(', ')} (target < ${TARGET}B, hard cap ${LIMIT}B)`)

const results = await parallel(AGENTS.map(a => () => (async () => {
  const ens = await agent(ensurePrompt(a), { label: `stage:${a.id}`, phase: 'Stage', schema: ENSURE_SCHEMA })
  if (!ens || !ens.present) return { agent_id: a.id, staged_soul: ens ? ens.staged_soul : '', condensed: null, verify: null, error: 'staged soul absent' }
  const staged = ens.staged_soul
  let cond = null, bytes = ens.start_bytes
  for (let i = 0; i < MAXIT; i++) {
    cond = await agent(condensePrompt(a, staged, bytes), { label: `condense:${a.id}#${i + 1}`, phase: 'Condense', schema: CONDENSE_SCHEMA })
    bytes = cond ? cond.final_bytes : bytes
    if (cond && cond.under_limit) break
  }
  const ver = await agent(verifyPrompt(a, staged), { label: `verify:${a.id}`, phase: 'Verify', schema: VERIFY_SCHEMA })
  return { agent_id: a.id, staged_soul: staged, start_bytes: ens.start_bytes, condensed: cond, verify: ver }
})()))

const ok = results.filter(Boolean)
const good = ok.filter(r => r.verify && r.verify.ok).map(r => `${r.agent_id}(${r.verify.final_bytes}B)`)
const bad = ok.filter(r => !(r.verify && r.verify.ok)).map(r => r.agent_id)
log(`Condense done. ok=[${good.join(', ')}] needs-attention=[${bad.join(', ') || 'none'}]`)
return { ok: good, bad, results: ok }
