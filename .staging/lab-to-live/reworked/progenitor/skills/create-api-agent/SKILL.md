# Create a Claude API agent (Mode 2)

Claude API agents are built directly on the Anthropic SDK. They have no `.codex/` and no `.claude/` — they are a system-prompt + tools + memory scaffold that the host application wires into a Messages API loop.

The agent's identity, philosophy, discipline, boundaries, and soul live in the system prompt. Soul-first design applies even harder here because there is no framework to enforce structure — the system prompt is the entire agent.

## When to use

- The design document specifies agent kind `api-agent`
- The agent will be invoked from a host application that calls the Anthropic API directly (Python or TypeScript SDK)
- The host application owns the runtime (not Claude Code, not Codex CLI)

## When NOT to use

- The design specifies a steward, subagent, or skill — use the appropriate `create-*` skill
- The host application uses a non-Anthropic SDK (LangGraph, OpenAI SDK, etc.) — out of v1 scope

## Inputs

- The confirmed design document
- The target repo absolute path
- The agent name (lowercase, hyphenated)

## Procedure

1. **Confirm target.** Choose a directory shape — typically `agents/<name>/` or `prompts/<name>/`, depending on host repo conventions. Confirm with the principal.
2. **Author the system prompt.** A single markdown file, typically `agents/<name>/system_prompt.md`:
   - **Identity** — who this agent is
   - **Philosophy** — domain-specific commitments
   - **Discipline** — how it works
   - **Tool-use guidance** — when to call which tools, how to interpret results
   - **Boundaries** — scope, out-of-scope
   - **Soul** — refusal list, the cardinal failure framing
   The system prompt should be self-contained — read in isolation, a reader should understand the agent.
3. **Author the tool schemas.** Each tool the agent uses gets a definition file:
   - `agents/<name>/tools/<tool-name>.json` — JSON Schema per the Anthropic SDK tool-use spec
   - Or a single `agents/<name>/tools.py` / `tools.ts` if the host uses code-defined tools
   Tools should be named, described, and parameterized clearly. Vague tool descriptions produce vague tool use.
4. **Document the memory shape.** A short `agents/<name>/memory.md` describing:
   - What the agent persists across conversations
   - Where it persists (file, database, vector store)
   - How memory entries are structured and retrieved
   If the agent has no memory, say so explicitly.
5. **Document the prompt-cache strategy.** A short `agents/<name>/caching.md`:
   - Which prompt prefix is cached (the system prompt and stable tool definitions are typically cached)
   - Expected cache hit rate
   - Cache breakpoints
   Reference the `claude-api` skill if available in the host's `.claude/skills/`.
6. **Document the model choice.** In a `agents/<name>/model.md` or as a header in `system_prompt.md`:
   - Which model the agent uses (Opus 4.7, Sonnet 4.6, Haiku 4.5, etc.)
   - Why (cost, latency, reasoning depth, tool-use accuracy)
   - When to revisit
7. **Author a minimal runtime sketch.** `agents/<name>/runtime.md`:
   - How the host invokes the agent (sample loop or pointer to the host's runner)
   - Streaming vs non-streaming
   - Stop conditions
   - Error handling shape
8. **Memory-append** the emission.

## Output

A directory `agents/<name>/` (or equivalent per host conventions) with:

- `system_prompt.md`
- `tools/<tool>.json` (or `tools.py`/`tools.ts`)
- `memory.md`
- `caching.md`
- `model.md`
- `runtime.md`

## Red flags

- **A system prompt without a soul section** — refuse
- **Tool schemas with vague descriptions** — refuse; tool descriptions drive Claude's tool-use accuracy
- **No documented prompt-cache strategy** — refuse; API agents without caching are expensive and slow
- **No documented model choice** — refuse; the choice has cost and capability implications
- **A system prompt that's actually just a single paragraph** — refuse; system prompts for production agents are typically 50-500 lines and should cover the 5-layer concerns
- **Tools that contradict the agent's identity** — refuse; an "auditor agent" with `delete_record` tool is incoherent

## After creating

- Hand back to the principal with: directory path, system-prompt outline, tool list, model choice, caching strategy
- If the host repo has a `.claude/` for Claude Code use, do not put the API agent there — `agents/` or equivalent at the repo root is the right home
- Memory-append the production event