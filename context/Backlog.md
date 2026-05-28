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

---

## Done

<!-- Completed items moved here -->
