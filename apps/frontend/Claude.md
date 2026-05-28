# Claude.md — Frontend (React + Vite CA Dashboard)

**You are working in the CA dashboard frontend.** Router for this workspace — read first, then load only what the task needs.

---

## What this app is

React + TypeScript dashboard, built with Vite, hosted on S3 + CloudFront. Server state via **TanStack Query**, UI state via **Zustand** (no Redux). Real-time updates over a WebSocket connection to API Gateway (TanStack cache invalidation on WS events).

**Surfaces (Phase 1):** filing calendar (all clients/filings/statuses, color-coded), client management, conversation monitor, human takeover (live chat), document viewer + extraction results, team management, filing approval queue, basic analytics.

There is **no client web portal** in Phase 1 — clients interact via WhatsApp only. Don't build client-facing UI.

---

## Context loading — read in this order

1. **Always:** `../../context/ai-workflow.md` + `../../context/code_standards.md`
2. **Always for this app:** `context/ai_workflow.md` + `context/code_standards.md`
3. **If the task involves any visual/layout/component work:** `context/ui_system.md`
4. **If you need to know what a screen must show / which roles see what:** `/docs/BotStackHQ_MVP_Scope_Lock.md` (§06 Dashboard) + `/docs/BotStackHQ_Actor_Definition_Document_ComplianceStack.md`

**Do NOT load:** `api_rules.md` or backend context. You consume the API; you don't design it. For the response shape, see the shared types and the envelope note below.

---

## Non-negotiables for this app

- **Server state = TanStack Query. UI state = Zustand.** Don't put server data in Zustand or fetch with raw `useEffect`.
- **Consume shared types** from `packages/shared-types` for all API data — don't redefine DTOs/enums locally.
- API responses are the `{ data, meta, error }` envelope; lists are cursor-paginated (`meta.cursor`, `meta.hasMore`).
- Real-time: subscribe to WS events and invalidate the relevant TanStack queries — don't hand-roll state syncing.
- **No `localStorage`/`sessionStorage` for auth tokens** beyond what AuthKit dictates; follow the auth integration, don't improvise token handling.
- Gate UI by role (`CA_OWNER`, `JUNIOR_CA`, `SUPPORT_STAFF`) per the Actor Definition. A hidden control is not a security boundary — the API enforces it too, but the UI must respect role visibility.

## Report + Backlog

Report → `../../context/report/`. Deferrals → `../../context/Backlog.md`.
