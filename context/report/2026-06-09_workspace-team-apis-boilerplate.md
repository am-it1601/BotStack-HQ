# 10. Workspace & Team Management APIs — Boilerplate scaffold

**Date:** 2026-06-09
**Area:** backend
**ClickUp:** [86d34ytpj](https://app.clickup.com/t/86d34ytpj) (Sprint 1 — Foundation)
**Scope status:** in-scope (workspace lifecycle + team management, ADD §04/§05)
**Nature:** **Boilerplate only** — method signatures, routes, DTO contracts, and JSDoc. No business logic; every handler/service method throws `NotImplementedException`. Per explicit request.

## What was done

WorkspaceModule (`apps/backend/src/workspace/`) fleshed out from an empty `@Module({})` scaffold into the full structure for the story's 5 REST endpoints:

- **Controllers** (thin, route + delegation only; `@Roles()` metadata + `@WorkspaceContext()` applied):
  - `workspace.controller.ts` — `WorkspaceController` (`/v1/workspace`): `POST` (provision), `GET` (read), `PATCH` (settings).
  - `workspace-member.controller.ts` — `WorkspaceMemberController` (`/v1/workspace/members`): `POST` (invite), `PATCH :id` (role/deactivate).
- **Services** (stubs, `NotImplementedException`, `PrismaService` injected):
  - `workspace.service.ts` — `provisionWorkspace` / `getWorkspace` / `updateSettings`.
  - `workspace-member.service.ts` — `inviteMember` / `updateMember` / `activateInvitedMember` (webhook sync helper).
- **DTOs** (`dto/`): request DTOs as classes (`UpdateWorkspaceDto`, `InviteMemberDto`, `UpdateMemberDto`) with validation rules documented in JSDoc; response DTOs as interfaces (`WorkspaceResponseDto`, `WorkspaceMemberResponseDto`), camelCase wire shape, ISO-8601 UTC timestamps. Barrel `dto/index.ts`.
- **Shared decorators** (`common/decorators/`): `@Roles(...WorkspaceRole)` (SetMetadata marker) and `@WorkspaceContext()` param decorator + `WorkspaceContextData` interface (tenant/caller identity from JWT). Barrel `index.ts`.
- **Module wiring**: `workspace.module.ts` registers both controllers + services and exports the services (for cross-module use, e.g. provisioning from the auth/JWT flow).

Enums (`WorkspaceRole`, `EscalationThreshold`, `Language`, `PlanType`) are consumed from the generated Prisma client per the Data Model (authoritative); the stale role set in `packages/shared-types` was not used.

## Key decisions

- **No new dependencies** added. `class-validator`/`class-transformer` and `@nestjs/swagger` are not installed; adding deps is a Hard Stop trigger and out of scope for a boilerplate task. DTO validation rules and Swagger annotations are captured as JSDoc + TODOs and logged to Backlog.
- **Guards not applied yet.** `JwtAuthGuard`/`RolesGuard`/response interceptor live in `common/` and belong to the auth task. Controllers carry `@Roles()` metadata (harmless, ready for the guard) with TODO markers for `@UseGuards`. The `@WorkspaceContext()` decorator reads `request.workspaceContext` (populated upstream by the future auth middleware).
- **Controllers return domain DTOs**; the `{ data, meta, error }` envelope is applied by the future global response interceptor — avoids double-wrapping.
- Unused stub params are referenced via `void [...]` to satisfy `--max-warnings 0` lint without underscore (config has no `argsIgnorePattern`).

## Deviations / conflicts

- None against the LOCKED docs. The DOD items "tested" and "Swagger annotations complete" are intentionally NOT met — this task is boilerplate only by request; logic + tests + Swagger are deferred (see Backlog).

## Follow-ups (all logged to `context/Backlog.md`, 2026-06-09)

- [backend] Add class-validator/class-transformer + ValidationPipe; decorate DTOs.
- [backend] Add @nestjs/swagger; annotate all 5 endpoints.
- [backend] Build response interceptor + RolesGuard + JwtAuthGuard (attaches `request.workspaceContext`).
- [backend] WorkOS integration (invite, session revocation, membership.created webhook → `activateInvitedMember`).
- [backend] Implement service bodies + unit/integration tests + AuditLog/AuditEvent on every mutation (subtasks 86d39mfkd/86d39mfmj/86d39mfp8/86d39mfrd/86d39mftp).

## Verification

- types/build: **pass** (`nest build` clean)
- lint: **pass** (`eslint . --max-warnings 0` clean)
- format: **pass** (Prettier `--check` clean)
- tests: n/a (project test script is a no-op placeholder; no tests written — boilerplate only)
- manual: each endpoint compiles, routes registered, DI resolves; handlers intentionally throw `NotImplementedException`.
