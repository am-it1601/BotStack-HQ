import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Auth domain (ADD §04, §13 — story `86d34ytng`) — AuthKit/JWT integration and
 * the RBAC guards that derive tenant identity from validated JWT claims.
 *
 * The JWT signature is verified upstream by the standalone API Gateway Lambda
 * authorizer (`src/authorizer/`, subtask `86d39mg7v`); these guards trust that
 * authorizer context and enforce authentication + role access inside NestJS:
 * - {@link JwtAuthGuard}  — maps authorizer context → `request.workspaceContext`.
 * - {@link RolesGuard}    — enforces `@Roles()` (subtask `86d39mgac`).
 *
 * The companion decorators (`@Roles()`, `@CurrentUser()`, `@Public()`,
 * `@WorkspaceContext()`) live in `common/decorators` as cross-cutting primitives.
 *
 * BOILERPLATE ONLY: guards are wired and exported but their bodies are stubs.
 * They are intentionally **not** yet registered globally (via `APP_GUARD`) — see
 * the commented block in `CommonModule` — so the app still boots while the logic
 * is unimplemented.
 */
@Module({
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
