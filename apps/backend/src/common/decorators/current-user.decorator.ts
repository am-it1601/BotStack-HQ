import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { WorkspaceContextData } from './workspace-context.decorator';

/**
 * Injects the authenticated caller's context (story `86d34ytng`, subtask
 * `86d39mgac`) into a controller handler parameter.
 *
 * Reads the pre-resolved `request.workspaceContext` attached by the
 * {@link JwtAuthGuard} after the Lambda authorizer validated the JWT — it parses
 * no token itself. Returns the same {@link WorkspaceContextData} as
 * `@WorkspaceContext()`; the two are aliases differing only in intent
 * (`@CurrentUser()` reads from the caller/identity perspective, `@WorkspaceContext()`
 * from the tenant-boundary perspective).
 *
 * @example
 * \@Get('me')
 * whoAmI(\@CurrentUser() user: WorkspaceContextData) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WorkspaceContextData => {
    const request = ctx.switchToHttp().getRequest<{ workspaceContext?: WorkspaceContextData }>();

    // TODO(auth): `request.workspaceContext` is populated by JwtAuthGuard
    // (subtask 86d39mgac). Until that lands this is undefined at runtime; the
    // cast documents the intended contract for the next implementer.
    return request.workspaceContext as WorkspaceContextData;
  },
);
