---
name: list-namespace-agents
description: Enumerate a theorymcp.ai namespace's child agents and their installability. Calls list_agents and agent_interface_status to report each agent's published version, supported client profiles, and whether it is installable — so you can choose what to materialize locally.
---

# List a namespace's agents

The choosing step. Enumerate the namespace's published agents and their installability so you can pick
what `materialize-agent` will write to disk.

## When to use

- After `discover-namespace`, to choose which agent(s) to materialize.
- To check an agent's installability or published version before/after a publish.

## When NOT to use

- Before grounding with `discover-namespace`.

## Inputs

- A grounded namespace (see `discover-namespace`).
- Optionally a target client profile (e.g. `codex`, `claude_code`).

## Procedure

1. Call `list_agents` to list the namespace's active child agents (id, display name, status).
2. For a candidate agent, call `agent_interface_status` (with the target `client`) and read: `installable`, `published_snapshot` (published_version, skill_count), `supported_clients`, and the install-layout checks.
3. Report the choices: which agents are installable, for which clients, at which published version.

## Outputs

- A list of installable agents with published version + supported clients, and a recommended target for `materialize-agent`.

## Red flags

- Treating a draft as installable — only published snapshots install.
- Assuming a client profile is supported without checking `supported_clients`.

## After completing

- `materialize-agent` for the chosen agent + client + target directory.
