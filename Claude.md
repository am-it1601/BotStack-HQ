# Claude.md — BotStackHQ Monorepo (root)

**Start here.** This is the entry point for any agent session in this repository. It tells you what this repo is, the rules that always apply, and — critically — **where to go next** so you load only the context your task needs and nothing else.

---

## What this repo is

**BotStackHQ — ComplianceStack, Phase 1 MVP.** A bilateral AI-powered compliance workflow automation platform for Chartered Accountants and Legal Service Providers. AI agents handle client interaction over WhatsApp; CAs manage everything from a dashboard.

Monorepo (npm workspaces + Turborepo):

```
apps/backend       → NestJS on AWS Lambda (business logic API)
apps/frontend      → React + Vite CA dashboard (shadcn/ui + Tailwind v4)
apps/document-ai   → Python FastAPI document extraction service
infrastructure     → AWS CDK (TypeScript), region ap-south-1
packages/shared-types → shared TS types across the stack
docs/              → LOCKED product + architecture docs (source of truth)
context/           → repo-wide agent rules, reports, backlog
```

---

## The two things that are always true

1. **The `docs/` are the source of truth and are LOCKED.** Scope, architecture, data model, actors, flows. You build _inside_ them. Deviating requires a hard stop and human sign-off — never improvise. Full authority order in `context/ai-workflow.md` §0.
2. **You load context selectively.** Don't read the whole repo's rules for a one-line API fix. Route to your work area (below), read that area's `Claude.md`, and pull only the context files it points to.

---

## Routing — go to your work area

First, **always read `context/ai-workflow.md`** (the general agentic workflow: task lifecycle, hard stops, ClickUp tracking, reports, backlog). Then route by what you're touching:

| Your task touches…                      | Go to                                                                       | Then it routes you to                                        |
| --------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Backend / API / NestJS / business logic | **`apps/backend/Claude.md`**                                                | app workflow + code standards + `api_rules.md`               |
| Frontend / dashboard / UI / components  | **`apps/frontend/Claude.md`**                                               | app workflow + code standards + `ui_system.md` + `design.md` |
| Document extraction / Python            | **`apps/document-ai/Claude.md`**                                            | app workflow + code standards                                |
| AWS / CDK / infra / deployment          | **`infrastructure/Claude.md`**                                              | app workflow + code standards                                |
| Schema / data model                     | Read `docs/BotStackHQ_Data_Model_Phase_1.md` first, then the backend router | —                                                            |
| Cross-cutting (2+ apps)                 | This file + `context/ai-workflow.md` + each affected app's `Claude.md`      | —                                                            |

**Do not** load a sub-project's context for an area you're not working in (e.g. no `ui_system.md` for an API task, no `api_rules.md` for a UI task). The whole point of this structure is token-efficient, relevant-only context.

Each sub-project also has an `Agent.md` — it's a thin pointer to that folder's `Claude.md` (same content for any agent: Claude, Cursor, Copilot).

---

## Repo-wide rules (apply everywhere — full text in `context/`)

- **`context/ai-workflow.md`** — task lifecycle, hard stops, **ClickUp** progress tracking (In Progress → Review; Blocked on stop), per-task implementation reports, backlog discipline.
- **`context/code_standards.md`** — monorepo-wide non-negotiables: tenant isolation (`workspace_id` from JWT, never input), UTC timestamps, soft deletes, UUID v4 keys, naming, shared-types, Conventional Commits, no secrets in code.
- **`context/report/`** — write one implementation report per completed task.
- **`context/Backlog.md`** — log anything deferred or discovered; never drop work silently.

---

## Quick start for a session

1. Read `context/ai-workflow.md`.
2. Identify your ClickUp task (move it to _In Progress_).
3. Route to your work area's `Claude.md` (table above); load only what it points to.
4. Verify the task is in MVP scope (`docs/BotStackHQ_MVP_Scope_Lock.md`). If OUT/PARTIAL → hard stop, flag.
5. Plan (2–4 lines) → build to the loaded standards → self-check (lint/types/tests).
6. Close out: write the report, comment + move ClickUp task to _Review_, log any deferrals to Backlog.
