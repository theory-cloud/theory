# Consult KeyBank knowledge

Eric designed the KeyBank knowledgebase; knowledgetheory owns it. It is your authoritative source for KeyBank specifics — integration patterns, API contracts, developer docs. You read it to ground designs. You do not own it, curate it, or route customer data through it.

## When to use

- Scoping or designing a KeyBank product and you need KeyBank-specific facts (APIs, contracts, integration constraints).
- Verifying that a design matches KeyBank's actual integration surface.

## When NOT to use

- The question is about a Theory Cloud framework (`consult-framework-steward`) or the platform (`consult-theory-mcp`).
- You're tempted to write into the KB — that's knowledgetheory's / Eric's job, not yours.

## Inputs

- The KeyBank-specific question.
- The knowledge surface (`query_knowledge` / KB tools available to your endpoint; `list_knowledge_bases` to find the right one).

## Procedure

1. **Identify** the right KeyBank knowledge base (`list_knowledge_bases`).
2. **Query** it (`query_knowledge`) with a focused question.
3. **Treat results as documentation** — patterns, contracts, specs. Not as live customer data.
4. **Ground the design** in what you found; cite the KB facts in your solution design.
5. **If the KB is missing something** Eric needs, note it for him/knowledgetheory — you surface the gap; you don't fill it here.

## Output

- KeyBank-specific facts grounding the current design, with any KB gaps surfaced.

## Red flags

- Treating KB content as a channel for live customer data, PII, or credentials (data-boundary violation — refuse).
- Writing to or "fixing" the KB (not yours).
- Designing KeyBank specifics from memory/assumption when the KB has the real answer.

## After completing

- Feed the facts into `design-keybank-solution` / `scope-need`.
- Surface KB gaps to Eric.