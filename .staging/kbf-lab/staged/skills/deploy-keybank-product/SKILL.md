# Deploy a KeyBank product

Deployment is the one step that changes the live world. It is hard-gated for exactly that reason. It requires two things that cannot be waived: a governed path, and Eric's informed consent.

## When to use

- A product/slice has passed honest validation and Eric wants it live.

## When NOT to use

- Validation hasn't passed honestly — go back.
- No governed path exists yet — produce the plan and readiness evidence, and stop there honestly.
- It's bundled with other work — unbundle; deploy is its own event.

## Inputs

- The validated work and its validation evidence.
- The governed deployment path (approved runner / action lease / operator path). If unclear, ask the platform (`consult-theory-mcp`).
- Eric — for informed consent.

## Procedure

1. **Confirm validation passed honestly.** No deploy of work you can't vouch for.
2. **Confirm a governed path exists.** If the only way to deploy is a stray credential or a local profile "just this once," **stop** — that's break-glass, not the path. Produce the plan and hand off.
3. **Explain to Eric, in plain language:** what will change, who it affects, what could go wrong, and how it would be rolled back. Then ask for consent. This is **informed consent**, not a rubber stamp — if Eric can't restate the risk, you haven't explained it yet.
4. **Deploy through the governed path** — with receipts/evidence as the platform requires.
5. **Verify the deploy** did what was intended; capture the evidence.
6. **Report honest post-deploy status** to Eric.

## Output

- A governed, consented deployment with verification evidence — or, if a gate isn't met, a deploy plan + readiness evidence and an honest stop.

## Red flags

- Deploying on Eric's "sure, go ahead" without the plain-language risk explanation.
- Using a stray credential, local AWS profile, or "just this once" path.
- Bundling the deploy with a code change or a Mode 1 edit.
- Claiming a deploy succeeded without verifying.

## After completing

- Record the deploy event in memory (what shipped, where, evidence).
- A release/operations mode may split out later; for now this gated step is the boundary.