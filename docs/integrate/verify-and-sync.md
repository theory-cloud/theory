---
title: Verify & keep in sync
description: Confirm a materialization came up whole against served checksums, then keep it current as the namespace republishes — re-materializing only what changed.
---

# Verify & keep in sync

Two steps protect the integration invariant after the files land: **verify** (it came up whole) and
**update** (it stays whole as the namespace evolves). Both treat the namespace as the source of
truth.

## Verify — refuse to operate half-formed

Verification re-checks the local files against the served snapshot:

- every local file's `sha256` matches the published `manifest_entries`;
- the soul/instructions and **all** skills are present (nothing dropped);
- the install marker's version matches the published version you installed.

If any of that fails, you **stop and report exactly what's wrong** — you don't operate from a partial
or corrupt materialization, and you don't reconstruct a missing file from memory.

```text
Verify the materialized apptheory install in <target dir> against theorycloud:
re-fetch the published manifest, check every local file's sha256, confirm the soul and all
skills are present, and confirm the install marker matches the published version. Report a
clean bill of health, or the exact files/checksums that don't match — don't fix by guessing.
```

{% capture half %}
A materialization missing pieces is a **failure**, not a smaller success. From the outside you can't
distinguish a whole install from one that's quietly missing a skill — so a failed verify is a hard
stop, not a warning to work around.
{% endcapture %}
{% include callout.html type="danger" title="Whole, or stop" content=half %}

## Update — sync flows namespace → local

The namespace republishes; your local copy drifts behind. Updating reconciles them:

1. read the local install **marker** as advisory `installed_state`;
2. ask `agent_local_install_plan` (on the **namespace route**, naming the child `agent_id`) whether a newer published version exists for your client;
3. if so, **re-materialize only what changed** — same plan → fetch → verify → marker loop;
4. if not, you're current — do nothing.

```text
Check whether the apptheory install in <target dir> is up to date with theorycloud:
read the install marker, call agent_local_install_plan to compare against the current published
version for <host>, and tell me what changed. If there's an update, re-materialize only the
changed files, verify their checksums, and rewrite the marker. Don't touch files that didn't change.
```

## The one rule that makes this safe

**Sync flows namespace → local. Never the other way.** If your local files and the namespace
disagree, the namespace wins and you re-materialize. Editing a local file and calling it "synced" is
the failure this whole flow exists to prevent — the local copy is downstream of published,
route-derived bytes that *you* wrote to disk.

{% capture edit %}
Tempted to "just edit the local file instead of re-materializing"? That breaks the source-of-truth
contract. If the published content is wrong, fix it **upstream** through [authoring](/author/) (a
gated, separate practice) — then re-materialize down. Local edits are never a substitute.
{% endcapture %}
{% include callout.html type="warn" title="Don't edit local and call it sync" content=edit %}

## Good habits

- **Verify right after materializing**, and again before you rely on an install you haven't touched in a while.
- **Keep the marker honest** — it's how `update` knows what you have.
- **Re-materialize, don't patch.** Changed upstream → fetch the change; don't hand-edit to match.

That completes the integration half. The inverse direction — pushing local content *up* into the
namespace — is [Authoring (gated)](/author/).
