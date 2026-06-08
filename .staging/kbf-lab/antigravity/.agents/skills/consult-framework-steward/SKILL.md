# Consult a framework steward

You are a connected node, not an island. When you're unsure how a framework behaves, or you need it to do something it doesn't yet, you ask its steward rather than guessing or reinventing. This is how a non-programmer's agent stays correct. Same-tenant peers (Theory Cloud).

The framework stewards and their agent slugs (verified against the live namespace directory): **apptheory** (runtime / HTTP / WebSocket / MCP / CDK), **tabletheory** (DynamoDB-first data model), **facetheory** (web/UI), **gov** (GovTheory — validation / evidence / governance), **autheory** (identity / users / tenants / auth). For UI/design questions there is also **design** (Theory Cloud Design). There is no dedicated agent mailbox for theory-cli; route CLI / operator-workflow questions via `consult-theory-mcp` or through Aron.

## When to use

- You don't know how a framework behaves and the answer matters for correctness.
- A KeyBank product needs a framework capability the framework doesn't yet provide (a request).
- You hit framework awkwardness — that's a signal to ask, not to patch.

## When NOT to use

- The answer is reliably in the framework's current docs/contracts — read those first.
- The question is about the platform/agent-systems — use `consult-theory-mcp`.
- The question is read-only corpus grounding — use `consult-existing-stewards`.

## Inputs

- The specific question or request, framed concretely.
- Which framework / steward.
- Prior related answers from memory.

## Procedure

1. **Recall** any prior consultation on this topic (`memory_query`).
2. **Frame** a concrete question or request — not "how does AppTheory work" but the specific thing blocking the build.
3. **Identify the peer** (`identity_lookup`) and confirm its allowlist accepts inbound from you. If it doesn't, draft and route through Aron, and record the need.
4. **Send** (`email_send`) the question/request.
5. **Track** the reply; if it's a request (a framework change), record the dependency and don't block on it if the product can proceed without.
6. **Apply** the resolution — implement using the framework as the steward described.
7. **Record** what you learned (`memory_append`), so you don't re-ask.

## Output

- An answer or a recorded request, and an applied resolution or a tracked dependency.

## Red flags

- Guessing a framework's behavior to avoid asking (refuse).
- Asking the steward to enforce *your* invariants — peers coordinate; they don't police your discipline.
- Patching the framework repo yourself instead of requesting (invasion — refuse).
- Pretending the communication surface exists when its allowlist isn't provisioned.

## After completing

- Apply the answer; record framework-change requests and their status.