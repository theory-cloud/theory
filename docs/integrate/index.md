---
title: The integration flow
description: Materialize a published agent into your workspace as verified local files — the canonical configure → discover → list → materialize → verify → update flow.
---

# The integration flow

Integration turns a **published agent** into **local files** in your workspace — its soul, its
skills, and the host wiring — faithfully and verifiably. The server returns guidance and a
checksummed pack; **your host writes the files**. The namespace stays the source of truth; the local
copy is a materialization of it.

## The flow, front to back

```text
1. configure   point theorymcp at the namespace route, authenticate          (host wiring)
2. discover    describe_interface the route                                    (ground)
3. list        which agents are published and installable, per host           (choose)
4. materialize plan → fetch pack to disk → unzip → verify checksums → marker   (write)
5. verify      confirm it came up whole; refuse to operate half-formed         (trust)
6. update      reconcile local against the namespace's current version         (stay in sync)
```

You don't skip ahead: no materialize before you've grounded; no operating before you've verified;
no local edit called "sync."

{% include figure.html src="/assets/img/edu/dogfooding.webp" max="450"
   alt="Dogfooding the prototype — using the control plane to manage Theory Cloud itself"
   caption="This repo is the worked example: the workspace dogfoods the flow it documents. Every materialization is planned, written from served bytes, and checksum-verified before it's trusted." %}

## Step 1–3 — Configure, discover, list

The first three steps are covered elsewhere and are quick:

- **Configure** — wire `theorymcp` to the route and authenticate → [Connect a host](/connect/).
- **Discover** — `describe_interface` so you know the real tools and installer availability → [How it works](/how-it-works/#always-ground-first).
- **List** — enumerate what's installable:

```text
In theorycloud, list the published agents and, for each, its published version, the client
profiles it supports (codex / claude_code / antigravity), and whether it is currently
installable. Recommend which to materialize for my host.
```

## Step 4 — Materialize

The core step: plan the install, fetch the pack **to disk** (never through model context), unzip,
**verify every checksum**, and write an install marker. It has enough detail to deserve its own
page → [Materialize an agent](/integrate/materialize/).

## Step 5–6 — Verify and stay in sync

A materialization is whole or it's a failure. After writing files you **verify** them against the
served manifest, and over time you **update** as the namespace republishes — re-materializing only
what changed. Both are on [Verify & keep in sync](/integrate/verify-and-sync/).

## The whole flow as one prompt

```text
Integrate the apptheory agent from theorycloud into <absolute target dir> for <host>:
1) make sure theorymcp is connected to the route and grounded (describe_interface);
2) list the agent's installability and pick the published version;
3) materialize it — plan, fetch the pack to disk, unzip, verify every file's sha256 against
   the plan's manifest, and write the install marker;
4) verify the result is whole and report exactly what was written.
Do not route the pack through your context, and do not drop any files to shrink it.
```

{% capture whole %}
**Whole or not at all.** If a file is missing or a checksum doesn't match, stop and report exactly
what's wrong — don't proceed "because it probably isn't needed," and don't reconstruct a missing
file from memory. A half-materialized agent that acts is more dangerous than one that waits, because
from the outside you can't tell the difference.
{% endcapture %}
{% include callout.html type="danger" title="The integration invariant" content=whole %}

Pushing changes the other direction — *up* into the namespace — is a separate, gated practice. See
[Authoring (gated)](/author/).
