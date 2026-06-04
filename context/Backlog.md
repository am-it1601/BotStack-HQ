# Backlog — Deferred Items & Action Tracking

**Purpose:** Single tracking file for work that is postponed, discovered, or deferred during agent sessions. Nothing gets silently dropped. Every agent appends here; no one deletes entries — they move them to `Done`.

---

## How to use

When you defer work, discover tech debt, or push something out of scope, append a row to **Open**. Use this format:

```
- [ ] [AREA] <concise description> — reason deferred — (raised: YYYY-MM-DD, by: <task slug>)
```

`AREA` = `backend | frontend | document-ai | infra | data-model | cross`

When an item is completed, move the line to **Done** and check it: `- [x] ...— (done: YYYY-MM-DD)`.

If an item is a **scope change** (requires touching a LOCKED doc), tag it `[SCOPE-CHANGE]` — these need Amit's sign-off before any code, per the Scope Lock change process.

---

## Open

<!-- Append new items below this line -->

- [ ] [infra] Point the registered `botstackhq.com` nameservers at the deployed Route 53 zone's NS (Registered domains → Edit name servers) — one-time operator step after `cdk deploy BotStackHqDns`; NS values are in the `HostedZoneNameServers` output — deferred: requires deploy + console/registrar access — (raised: 2026-06-04, by: domain-dns-setup)
- [ ] [infra] Add subdomain alias (A/AAAA) records — `dashboard` → CloudFront, `api`/`wh` → API Gateway custom domains — deferred: targets don't exist until the CloudFront-hosting and API Gateway tasks land; wire records in those stacks — (raised: 2026-06-04, by: domain-dns-setup)
- [ ] [infra] Multi-env subdomain/zone strategy (delegated sub-zones per env vs. env-prefixed records under the apex zone) — deferred: Sprint 0 provisions the single apex zone + production subdomains only; `domainName` is context-parameterized as the seam — (raised: 2026-06-04, by: domain-dns-setup)

---

## Done

<!-- Completed items moved here -->
