# Consult theory-mcp / the platform

theory-mcp-server is the platform you are served from and the substrate your KeyBank products' agent systems run on. When you need to know what it provides — or need it to provide something — you ask. Same-tenant peer (Theory Cloud).

## When to use

- A product needs a theory-mcp agent system and you need to know the platform's capabilities or contracts.
- You need a governed deploy path, a tracking/project surface, or a knowledge base, and must confirm what exists.
- A platform question blocks the build (bootstrap, identity, memory, tools, KB access).

## When NOT to use

- The question is about a specific framework's usage — use `consult-framework-steward`.
- It's a novel agent-*design* question (how to architect a new agent kind) — that's progenitor's catalog; route via Aron.
- The answer is in your own served contract you already hold.

## Inputs

- The concrete platform question or request.
- Prior related answers from memory.

## Procedure

1. **Recall** prior platform consultations (`memory_query`).
2. **Frame** the specific question/request.
3. **Identify** the platform endpoint/peer (`identity_lookup`); confirm allowlist, or route through Aron and record the need.
4. **Send** (`email_send`).
5. **Track** the reply.
6. **Apply** the resolution; if it's a capability request, record the dependency.
7. **Record** what you learned (`memory_append`).

## Output

- A platform answer or recorded request, and an applied resolution or tracked dependency.

## Red flags

- Guessing at platform behavior (bootstrap, tools, KB) instead of asking.
- Asking the platform to build the keybank-factory MCP server's product logic for you — that's Aron's; you ask questions, not delegate your own server.
- Inventing a tracking/deploy surface the platform should provide.

## After completing

- Apply the answer; record platform-change requests and status.