import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { WorkspaceRole } from '@prisma/client';

/**
 * Tenant + caller identity resolved from the validated JWT claims supplied by
 * the API Gateway Lambda authorizer (ADD §12). Every workspace-scoped handler
 * derives its tenant boundary from this object — **never** from the request
 * body, path, or query.
 */
export interface WorkspaceContextData {
  /** Tenant boundary. Sourced from JWT `workspace_id` claim — never from input. */
  workspaceId: string;
  /** RDS `User.id` of the authenticated caller (JWT `user_id`). */
  userId: string;
  /** Caller's role within this workspace (JWT `role`). */
  role: WorkspaceRole;
  /** WorkOS organization id (JWT `org_id`) — idempotency key for provisioning. */
  authkitOrgId: string;
}

/**
 * Injects the {@link WorkspaceContextData} for the current request into a
 * controller handler parameter.
 *
 * The context is attached to the request upstream by the authentication
 * middleware/guard (auth task) after the JWT is validated. This decorator only
 * reads that pre-resolved value — it performs no token parsing itself.
 *
 * @example
 * \@Get()
 * getWorkspace(\@WorkspaceContext() ctx: WorkspaceContextData) { ... }
 */
export const WorkspaceContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WorkspaceContextData => {
    const request = ctx.switchToHttp().getRequest<{ workspaceContext?: WorkspaceContextData }>();

    // TODO(auth): `request.workspaceContext` is populated by the JWT auth
    // guard/middleware (separate task). Until that lands this is undefined at
    // runtime; the cast documents the intended contract for the next implementer.
    return request.workspaceContext as WorkspaceContextData;
  },
);
