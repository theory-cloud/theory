---
title: Validate & publish
description: Publishing is one human-authorized gate — agent_interface_publish validates the drafts and snapshots them. agent_interface_validate is a separate, post-publish installability check.
---

# Validate & publish

Drafts are invisible to consumers. They become installable through **one server-side mutation gate**
— a human-authorized publish — and you confirm the result with a published-installability check.
There is no separate "pre-publish draft validate" tool: validation happens *inside* publish.

## The publish gate

`agent_interface_publish` is the single gate that turns drafts into something installable. It:

- **validates the drafts internally** and **fails closed** if the soul, skills, or layouts are incomplete;
- creates a new **immutable snapshot** from those validated drafts;
- **requires `direct_user_authorization=true`** for that specific publish — draft writes never invoke it implicitly.

```text
Publish <new-agent-id> in theorycloud. Call agent_interface_publish with
direct_user_authorization=true ONLY after I explicitly say "publish now". It validates the drafts
and creates the snapshot; if the drafts are incomplete it fails closed — show me that error rather
than trying to force it. Report the new published_version.
```

{% capture gates %}
"We already granted scope, so just publish" is the failure to refuse. Authoring scope is a workspace
discipline that opened drafting; it is **not** publish authorization. Every publish needs its own
`direct_user_authorization=true`, and the grant and the publish are never bundled into one unattended
step.
{% endcapture %}
{% include callout.html type="danger" title="Authorization is per publish" content=gates %}

## Verify installability — after publishing

`agent_interface_validate` is a **post-publish** check, not a draft gate. It validates *published-only*
installability for an **active child agent** and a selected **client profile** — incomplete snapshot,
identity, skills, manifest, and client-support checks — without exposing draft state. Pair it with
`agent_interface_status`:

- `agent_interface_validate` — does the *published* agent install cleanly for `codex` / `claude_code` / `antigravity`?
- `agent_interface_status` — draft counts, last published version, and installability per client.

```text
Confirm <new-agent-id> is installable in theorycloud: call agent_interface_status for the latest
published version, then agent_interface_validate for each host profile I care about. Report whether
the published snapshot installs cleanly per client, and list any incomplete checks.
```

## Snapshots are immutable and append-only

Every publish increments `published_version` and writes a snapshot you cannot edit in place. You
never "overwrite" or silently roll back. Read tools let you inspect history:

- `agent_interface_snapshot_list` / `_get` — browse and fetch published versions;
- `agent_interface_snapshot_diff` — structural diff between two versions.

## Rolling back = restore + re-publish

To go back to an earlier version you don't mutate the snapshot — you **restore it into drafts**, then
publish again:

1. `agent_interface_restore_from_snapshot` (requires `direct_user_authorization=true`) copies a published snapshot into mutable draft rows;
2. review/adjust the drafts;
3. `agent_interface_publish` again (a new, separately-authorized version — not a patch).

```text
Roll <new-agent-id> in theorycloud back to published_version <N>: restore_from_snapshot it into drafts
(with my authorization), show me the restored drafts and a diff against current, then — only on my
explicit go-ahead — publish as a new version with direct_user_authorization=true. Never edit a
snapshot in place.
```

## Close the loop (optional)

After publishing you can pull the freshly-published agent back **down** to confirm it materializes —
the pull/push loop, end to end:

```text
Now that <new-agent-id> is published at version <N>, materialize it from theorycloud into <target dir>
for <host> and verify every checksum, so we've proven the round trip works.
```

That's the whole authoring practice. For a verbatim copy of an existing published agent into another
namespace, see [Replicate (lab → live)](/author/replicate/).
