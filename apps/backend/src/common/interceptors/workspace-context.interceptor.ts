import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotImplementedException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';

/**
 * WorkspaceContextInterceptor (story `86d34ytng`, subtask `86d39mgcq`).
 *
 * Global interceptor that bridges the per-request tenant identity into both the
 * HTTP request object and the AsyncLocalStorage store:
 * - Reads the {@link AuthContext} from `request.workspaceContext` (set by
 *   {@link JwtAuthGuard}).
 * - Mirrors `workspaceId` / `userId` / `userRole` onto the request for ergonomics.
 * - Enters {@link runWithWorkspaceContext} so the downstream call chain — and the
 *   Prisma RLS middleware in particular — can read the tenant without HTTP access.
 *
 * BOILERPLATE ONLY: `intercept` is unimplemented. Registered globally once the
 * logic lands (see the commented `APP_INTERCEPTOR` block in `CommonModule`).
 */
@Injectable()
export class WorkspaceContextInterceptor implements NestInterceptor {
  /**
   * @param context - Nest execution context for the inbound request.
   * @param next - The downstream handler; must be invoked **inside** the bound
   *   AsyncLocalStorage context so the store is visible for the whole chain.
   * @returns The handler's response stream.
   * @throws NotImplementedException - Until subtask `86d39mgcq` is implemented.
   * @todo Subtask 86d39mgcq — read AuthContext, mirror onto request, enter ALS.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // To be implemented:
    //   1. const req = context.switchToHttp().getRequest();
    //   2. const ctx = req.workspaceContext as AuthContext;  (set by JwtAuthGuard)
    //   3. req.workspaceId = ctx.workspaceId; req.userId = ctx.userId;
    //      req.userRole = ctx.role;
    //   4. return runWithWorkspaceContext(
    //        { workspaceId: ctx.workspaceId, userId: ctx.userId },
    //        () => next.handle());
    void context;
    void next;
    throw new NotImplementedException(
      'WorkspaceContextInterceptor.intercept is not yet implemented.',
    );
  }
}
