import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceContextInterceptor } from './interceptors/workspace-context.interceptor';

/**
 * Common module (ADD §04) — cross-cutting guards, interceptors, pipes, and
 * decorators (e.g. the `{ data, meta, error }` response interceptor and the
 * tenant context propagation) shared across every domain module.
 *
 * Story `86d34ytng` wires the request-context plumbing here:
 * {@link WorkspaceContextInterceptor} (subtask `86d39mgcq`) is provided and
 * exported. The auth guards it depends on come from {@link AuthModule}.
 *
 * BOILERPLATE ONLY: the global registration below is intentionally **commented
 * out**. The guard/interceptor bodies are unimplemented stubs that throw, so
 * registering them globally now would 501 every request and break bootstrap.
 * Uncomment once subtasks `86d39mgac` / `86d39mgcq` land.
 *
 * @example
 * // Global registration (enable after the auth logic is implemented):
 * import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
 * import { JwtAuthGuard } from '../auth/guards/auth.guard';
 * import { RolesGuard } from '../auth/guards/roles.guard';
 *
 * providers: [
 *   WorkspaceContextInterceptor,
 *   { provide: APP_GUARD, useClass: JwtAuthGuard },       // 1st — sets context
 *   { provide: APP_GUARD, useClass: RolesGuard },         // 2nd — enforces @Roles()
 *   { provide: APP_INTERCEPTOR, useClass: WorkspaceContextInterceptor },
 * ]
 */
@Module({
  imports: [AuthModule],
  providers: [WorkspaceContextInterceptor],
  exports: [WorkspaceContextInterceptor],
})
export class CommonModule {}
