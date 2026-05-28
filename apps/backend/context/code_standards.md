# Code Standards — Backend (NestJS / TypeScript)

Extends `../../context/code_standards.md`. Read that first. Below are backend-specific rules.

---

## NestJS structure

- **One module per domain** (`FilingModule`, `ClientModule`, etc.). Module = `*.module.ts`, controller = `*.controller.ts`, service = `*.service.ts`, DTO = `*.dto.ts`.
- **Controllers are thin** — validation + delegation only. Business logic lives in services.
- **Dependency injection** for everything. No `new` on services/repositories.
- **DTOs validated** with `class-validator` decorators. Never trust raw input.
- **Guards** for auth/RBAC, **interceptors** for the response envelope + logging, **pipes** for validation/transform. Keep them in `common/`.

## Data access (Prisma)

- All DB access via Prisma client injected through a repository/service — no Prisma calls in controllers.
- Every tenant-scoped query relies on RLS (`app.workspace_id`) **and** explicitly filters `workspace_id` in app code (defense in depth).
- Migrations generated from the Prisma schema, which is generated from the Data Model doc. Never hand-edit migrations to add domain fields.
- Use the domain schema annotations (`@@schema("filing")` etc.) per the 11-schema map.

## Typescript

- Strict mode is required throughout the project.
- Validate unknown external input at system boundaries before trusting it.

## Types

- Use `interface` for object contracts.
- DTOs/enums that cross to the frontend live in `packages/shared-types`. Import, don't duplicate.
- No `any`. Use `unknown` + narrowing if a type is genuinely dynamic. Strict mode on.
- Return typed results; don't leak Prisma model types directly to the API — map to DTOs.

## Errors & logging

- Throw typed `HttpException` subclasses; let a global filter shape them into the `error` envelope.
- Never `catch` and ignore. Log with `workspace_id` + `user_id` + correlation id.
- Webhook handlers (WhatsApp) verify `X-Hub-Signature-256` and reject events older than 5 minutes — no exceptions.

## Lambda specifics

- Handlers must be stateless. No module-level mutable state that assumes warm reuse for correctness (caching for perf is fine, correctness must not depend on it).
- Keep cold-start weight down — lazy-load heavy deps where practical.

## Async & scheduling

- SQS consumers are idempotent (handle redelivery).
- EventBridge-triggered handlers are safe to re-run for the same filing period.
