# 9. AuthKit Integration + JWT Validation + RBAC Guards — Boilerplate scaffold

**Date:** 2026-06-09
**Area:** backend
**ClickUp:** [86d34ytng](https://app.clickup.com/t/86d34ytng) (Sprint 1 — Foundation)
**Scope status:** in-scope (auth/authz infrastructure, ADD §04/§12/§13) — hard prerequisite for 86d34ytpj and all downstream backend stories
**Nature:** **Boilerplate only** — flows, method signatures, types/DTOs, module wiring, and JSDoc. No logic; every handler/guard/middleware method throws (`NotImplementedException` in NestJS, `Error` in the plain Lambda). Per explicit request.

## What was done

All four layers of the story scaffolded across `apps/backend/src/`, one boilerplate unit per subtask:

### Layer 1 — Lambda Authorizer (subtask 86d39mg7v) — `src/authorizer/`

- `authorizer.handler.ts` — standalone API Gateway **REQUEST** authorizer Lambda (separate from the NestJS API Lambda). `handler` + `generatePolicy()` stubs; flow documented (extract bearer → verify → Allow policy + inject context / 401).
- `jwks-cache.ts` — module-scoped JWKS cache (`JWKS_CACHE_TTL_MS = 1hr`) + `getJwks()` / `verifyToken()` stubs.
- `authorizer.types.ts` — `WorkOsJwtClaims`, `AuthorizerContext` (string-only, API-GW shape), and the `JWT_ROLE_TO_WORKSPACE_ROLE` map (`ca_owner`→`CA_OWNER`, etc.).

### Layer 2 — NestJS AuthModule (subtask 86d39mgac) — `src/auth/`

- `guards/auth.guard.ts` — `JwtAuthGuard`: trusts the authorizer context (no re-verify), maps raw `request.requestContext.authorizer` → typed context, attaches `request.workspaceContext`. `canActivate` + `mapToAuthContext` stubs.
- `guards/roles.guard.ts` — `RolesGuard`: reads `@Roles()` (`ROLES_KEY`) via `Reflector`, compares to caller role, 403 on mismatch. `canActivate` stub.
- `interfaces/auth-context.interface.ts` — `AuthContext` (alias of `WorkspaceContextData`, single source of truth) + `RawAuthorizerContext` (snake_case authorizer payload).
- `auth.module.ts` — provides + exports both guards.
- Decorators added to `common/decorators/` (alongside the existing `@Roles()`/`@WorkspaceContext()`, per repo precedent): `@CurrentUser()` (alias of `@WorkspaceContext()`, caller perspective) and `@Public()` (`IS_PUBLIC_KEY`, explicit public-route signal).

### Layer 3 — WorkspaceContextInterceptor (subtask 86d39mgcq) — `src/common/`

- `context/workspace-context.storage.ts` — the `AsyncLocalStorage` store + `runWithWorkspaceContext` / `getWorkspaceContext` / `getWorkspaceId` helpers. **Implemented** (pure plumbing primitive, no business logic) so Layers 3 and 4 share one bridge.
- `interceptors/workspace-context.interceptor.ts` — `WorkspaceContextInterceptor`: reads `AuthContext`, mirrors `workspaceId`/`userId`/`userRole` onto the request, enters the ALS store. `intercept` stub.

### Layer 4 — Prisma RLS Middleware (subtask 86d39mgf4) — `src/common/`

- `prisma/rls.middleware.ts` — `applyRlsMiddleware(prisma)`: registers a `$use` middleware that reads `workspaceId` from the ALS store and runs `SET LOCAL app.workspace_id` in the query's transaction. Stub; documents the `SET LOCAL` (not `SET`) and fail-closed constraints.
- `prisma.service.ts` — added a `TODO(86d39mgf4)` hookup comment in `onModuleInit` (left unwired while the middleware is a stub).

Barrels added for each new folder (`auth/guards`, `auth/interfaces`, `common/context`, `common/interceptors`, `common/prisma`); `common/decorators/index.ts` extended.

## Key decisions

- **App still boots.** Global registration (`APP_GUARD` × 2, `APP_INTERCEPTOR`) is intentionally **commented out** in `CommonModule` with a ready-to-uncomment block — wiring throwing stubs globally would 501 every request (incl. the health route) and break bootstrap. Enable once the logic lands.
- **Single source of truth for caller identity.** `AuthContext` is a type alias of the existing `WorkspaceContextData` rather than a competing interface; `@CurrentUser()` and `@WorkspaceContext()` read the same `request.workspaceContext`.
- **Decorators in `common/`, guards in `auth/`** — follows the precedent already set by `@Roles()`/`@WorkspaceContext()` (the existing `roles.decorator.ts` JSDoc explicitly defers enforcement to "the RBAC guard (auth task)").
- **No new dependencies.** `jose` (JWKS verify) is referenced in JSDoc/TODOs only — adding deps is a Hard Stop trigger, out of scope for boilerplate. Logged to Backlog.
- **CDK wiring untouched.** The authorizer Lambda's CDK deployment/attachment lives in `infrastructure/` (separate work area) and is left to its infra subtask — already tracked in Backlog (raised by nestjs-scaffold).
- Lint: `let cache` carries an `eslint-disable prefer-const` (reassigned only in the stubbed body); unused stub params referenced via `void` per the repo's `--max-warnings 0` config.

## Deviations / conflicts

- None against the LOCKED docs. DOD items "deployed via CDK", "registered globally", "Swagger BearerAuth", and "unit/integration tests" are intentionally **not** met — boilerplate only by request. All deferred (see Backlog).

## Follow-ups (logged to `context/Backlog.md`, 2026-06-09)

- [backend] Add `jose`; implement JWKS fetch/cache + JWT verify in the authorizer (86d39mg7v).
- [infra] Deploy the authorizer Lambda via CDK + attach to API Gateway `/v1/*` (extends the existing nestjs-scaffold authorizer item).
- [backend] Implement guard/interceptor/middleware bodies + enable global registration in `CommonModule`; wire `applyRlsMiddleware` in `PrismaService`.
- [backend] Swagger global BearerAuth security scheme (needs `@nestjs/swagger`).
- [backend] Unit + integration tests: JWT valid/expired/malformed, RolesGuard × 3 roles, RLS activation + cross-tenant isolation.

## Verification

- types/build: **pass** (`tsc --noEmit` clean)
- lint: **pass** (`eslint . --max-warnings 0` clean)
- format: **pass** (Prettier `--check` clean)
- tests: n/a (project test script is a no-op placeholder; boilerplate only)
- manual: all files compile, DI for the guards/interceptor resolves, app bootstraps (no global registration of stubs); handlers intentionally throw.
