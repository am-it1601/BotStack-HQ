# Claude.md — Backend (NestJS on AWS Lambda)

**You are working in the backend service.** This is the router for this workspace. Read this first, then load only the context files relevant to your task.

---

## What this app is

NestJS (TypeScript) business-logic API, deployed to AWS Lambda behind API Gateway (REST + WebSocket). Event-driven: WhatsApp webhooks, EventBridge filing triggers, SQS async jobs. Talks to RDS PostgreSQL (Prisma) and S3.

**Module structure** (maps to domain boundaries — stay inside it):

```
src/auth · workspace · client · filing · workflow · document · notification · llm · audit · common
```

---

## Context loading — read in this order

1. **Always:** `../../context/ai-workflow.md` (general rules) + `../../context/code_standards.md` (baseline)
2. **Always for this app:** `context/ai_workflow.md` + `context/code_standards.md`
3. **If the task touches HTTP/WS/events:** `context/api_rules.md`
4. **If the task touches the schema:** `/docs/BotStackHQ_Data_Model_Phase_1.md` (authoritative — Prisma schema is generated from it)
5. **If the task touches permissions/roles:** `/docs/BotStackHQ_Actor_Definition_Document_ComplianceStack.md`
6. **If the task touches filing logic/deadlines/dependencies:** `/docs/BotStackHQ_Filing_Compliance_Reference.md`
7. **If the task touches agent conversation/reminders/templates:** `/docs/BotStackHQ_ComplianceStack_Agent_Flow_Specs.md`

**Do NOT load:** `ui_system.md` or any frontend context. This is the API layer.

---

## Non-negotiables for this app

- `workspace_id` comes from JWT claims, set as `app.workspace_id` (RLS) at request start — **never** from request body/URL.
- All list endpoints: cursor pagination. All responses: `{ data, meta, error }` envelope. All routes: `/v1/` prefixed.
- Schema changes are doc-first: define in Data Model doc → generate Prisma → migrate. No ad-hoc fields.
- Stateless handlers — all state in RDS. No in-memory session state (Lambda).
- Enum values must match the Data Model enum reference exactly.

## Report + Backlog

Write your task report to `../../context/report/`. Log deferrals to `../../context/Backlog.md`. (Per ai-workflow.md.)
