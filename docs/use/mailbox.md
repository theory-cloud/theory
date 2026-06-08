---
title: Mailbox & email
surface: mcp
description: When an agent has a mailbox, how to read inbound mail, fetch full content, and send or reply — all scoped to the agent's identity.
---

# Mailbox & email

Some agent endpoints expose an optional **mailbox**: an inbox-style surface so the agent can receive
and send email under its own identity. Mailbox tools appear **only when the agent has the mailbox
enabled** — confirm with `describe_interface` before assuming they exist.

## The tools

| Tool | Purpose | Notes |
| --- | --- | --- |
| `email_list` | inbox listing — sender, subject, read state, preview | inbound; lightweight |
| `email_get` | mailbox row metadata + `preview_text` | inbound; lightweight |
| `email_get_content` | full retained inbound body (`content_text`) | inbound only |
| `email_send` | send outbound mail with the agent's mailbox identity | subject to allowlist policy |
| `email_reply` | reply to an inbound item | inbound-scoped |
| `email_check_recipient` | verify a recipient is allowed before sending | read-only pre-check |

{% capture inbound %}
`email_get_content` returns **inbound** content. Reading is inbound-scoped; sending is gated by
recipient policy. Use `email_check_recipient` before `email_send` so a disallowed address fails the
cheap way.
{% endcapture %}
{% include callout.html type="info" title="Inbound vs outbound" content=inbound %}

## Copyable prompts

**Triage the inbox:**

```text
On the apptheory agent in theorycloud, list unread mailbox items (email_list). For each, show
sender, subject, and the preview. Tell me which look like they need a reply.
```

**Read one in full:**

```text
Open mailbox item <id> on the apptheory agent: fetch its full content with email_get_content
and summarize what it's asking for.
```

**Reply safely:**

```text
Draft a reply to mailbox item <id> on the apptheory agent. Before sending, run
email_check_recipient on the recipient; only if it's allowed, send the reply with email_reply.
Show me the draft first and wait for my go-ahead.
```

**Send a new message:**

```text
From the apptheory agent, send an email to <recipient>: subject "<subject>", body "<body>".
Check the recipient is allowed first; if it isn't, stop and tell me.
```

## Good habits

- **Confirm capability first.** No mailbox tools on the route means the agent has no mailbox — don't force it.
- **Check the recipient before sending.** Cheaper than a rejected send and avoids policy surprises.
- **Keep a human in the loop for outbound.** Have the agent show drafts and wait for approval before `email_send`.
- **Reading is inbound.** Don't expect `email_get_content` to return outbound history.

Mailbox is one optional capability of an agent. To bring the agent's **soul and skills** into your
own project as files, continue to [Integrate an agent](/integrate/).
