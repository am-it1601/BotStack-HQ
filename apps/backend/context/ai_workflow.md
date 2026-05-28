# AI Workflow — Backend (NestJS)

App-specific agentic rules. Extends `../../context/ai-workflow.md`. Read that first.

---

## Before writing any backend code

1. **Identify the module.** Which of `auth/workspace/client/filing/workflow/document/notification/llm/audit/common` owns this? Work inside that boundary. Cross-module calls go through services, not by reaching into another module's internals.
2. **Schema impact check.** Does this need a new field/table/enum value? If yes → it must already exist in the Data Model doc. If it doesn't → **STOP**, log a `[SCOPE-CHANGE]` or `[data-model]` backlog item, surface to human. Do not add it to Prisma freehand.
3. **Scope check.** Is the feature IN per the Scope Lock? PARTIAL/OUT → stop.

## Patterns to follow

- **Tenancy:** Every request sets `SET LOCAL app.workspace_id = '<from JWT>'` before DB access. New tenant tables get RLS enabled + the `workspace_isolation` policy. A new tenant-scoped table without RLS is a defect.
- **Workflow state:** Filing/workflow status transitions follow the enums and the Agent Flow Specs state machine. Never introduce an intermediate status not in the `FilingStatus`/`WorkflowStatus` enums.
- **Filing dependencies:** Respect the dependency chain (e.g. GSTR-3B waits for GSTR-1). Encode it from the Filing & Compliance Reference, don't infer it.
- **Async work** (document processing, LLM calls, outbound WhatsApp) goes through SQS, not inline in the request path.
- **Scheduled triggers** use EventBridge Scheduler — never a self-managed cron/queue. (BullMQ/Redis are explicitly rejected by the ADD.)
- **LLM access** goes through the `llm/` abstraction layer. No direct SDK calls scattered across modules. Primary GPT-4o, Claude fallback.

## Testing focus

- State-machine transitions (filing + workflow) — unit tested per valid/invalid transition.
- Tenant isolation — a test proving a query without/with mismatched `workspace_id` returns nothing.
- Filing dependency enforcement — test that a dependent filing can't trigger before its prerequisite.
- Always write new test cases, fix our update test cases to support new changes.

## When done

Validate -> test cases are passing -> no lint errors or warning -> build is clean.
Report → `../../context/report/`. Deferrals → `../../context/Backlog.md`.
