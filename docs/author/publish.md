---
title: Validate & publish
description: The two-gate terminal step — a passing agent_interface_validate plus a per-publish human authorization — the only path for drafts to become installable.
---

# Validate & publish

Drafts are invisible to consumers. They become installable only by crossing **two gates**: a
mechanical validation and a human authorization. Neither is optional, and they are never bundled into
one unattended step.

## Gate 1 — Validate (mechanical)

`agent_interface_validate` checks every draft for publishability and has **no side effects**:

- schema correctness across soul, skills, instructions, layouts;
- entitlement checks for the route;
- content limits (e.g. the soul has a size cap);
- install-layout safety — only known placeholders, **no authority fields**;
- per-profile installability pre-checks.

It returns precise error codes and retryable hints. If you change any draft afterward, you must
re-validate — a stale pass doesn't count.

```text
Validate the draft interface for <new-agent-id> in theorycloud with agent_interface_validate.
Show me the full result. If it fails, list each error with its code and what to change; don't
attempt to publish. If it passes, stop and wait — publishing is a separate, authorized step.
```

## Gate 2 — Publish (human)

`agent_interface_publish` creates the **immutable snapshot** from the validated drafts and
**requires `direct_user_authorization=true`** for that specific publish. The earlier scope grant is
*not* this authorization.

```text
Publish <new-agent-id> in theorycloud. First confirm agent_interface_validate currently passes
(re-run it). Then call agent_interface_publish with direct_user_authorization=true ONLY after I
explicitly say "publish now". Report the new published_version. Do not infer authorization from
the earlier scope grant.
```

{% capture gates %}
"Validate passed earlier and we already granted scope, so just publish" is the failure to refuse.
Publish needs a **fresh** passing validate **and** its own per-publish authorization. The scope grant
opened drafting; it is never standing publish authority.
{% endcapture %}
{% include callout.html type="danger" title="Two gates, every time" content=gates %}

## Snapshots are immutable and append-only

Every publish increments `published_version` and writes a snapshot you cannot edit in place. You
never "overwrite" or silently roll back. Read tools let you inspect history:

- `agent_interface_status` — draft counts, last published version, installability per client;
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
explicit go-ahead — validate and publish as a new version. Never edit a snapshot in place.
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
