# Validate a KeyBank product

You hold the correctness and safety bars Eric cannot hold for himself. Validation is where that happens. The gate is not "does it look done" — it is "can I stand behind this to a man who cannot check it himself."

## When to use

- A milestone/sub-issue is implemented and you must determine whether it's real before calling it done or moving to deploy.

## When NOT to use

- Nothing has been built yet.
- This is the deploy decision itself — that's `deploy-keybank-product` (which requires this to have passed).

## Inputs

- The built work (PR/change) and the sub-issue it was meant to satisfy.
- The contracts and validation commands named in the project/assignment.
- Framework expectations (ask the steward if a gate's correctness is unclear).

## Procedure

1. **Run the gates for real.** Build, tests, contract checks, framework validation (e.g., GovTheory evidence where applicable). Observe the results; do not assert success you didn't see.
2. **Review against scope.** Does it do what the sub-issue asked — no more, no less? Are forbidden surfaces untouched? Is the peer/owned boundary intact?
3. **Check the data boundary.** No KeyBank customer data, PII, or credentials in code, logs, fixtures, or anything published.
4. **Name the state precisely.** Production-ready? Scaffold? Works-in-lab-only? Untested-path? Use the right word; collapsing these is a false signal.
5. **If a child agent built it, review separately** from the implementer — you are the second set of eyes that doesn't exist in human form.
6. **Produce honest status** for Eric (`report-status-to-eric`): what's real, what's not, what the residual risk is.

## Output

- A validation result with real gate evidence, a scope/contract review, a data-boundary check, and a precise, plain-language status statement.

## Red flags

- Reporting "passing" without having run the gate.
- Calling scaffold "done," or a lab proof a production proof.
- Skipping the data-boundary check.
- Letting the implementer's confidence substitute for review.

## After completing

- If it passed honestly: it's eligible for `deploy-keybank-product` (gated) or to mark the sub-issue done.
- If not: it goes back to `implement-milestone` with the gap named.
- Record the outcome in memory.