import { CanActivate, ExecutionContext, Injectable, NotImplementedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RolesGuard (story `86d34ytng`, subtask `86d39mgac`).
 *
 * Enforces the declarative `@Roles(...)` metadata: it reads the allowed
 * {@link WorkspaceRole} set via the Nest `Reflector` and compares it to the
 * caller's role on `request.workspaceContext` (populated by {@link JwtAuthGuard}).
 * A mismatch returns 403; a handler with no `@Roles()` is authenticated-only.
 *
 * BOILERPLATE ONLY: `canActivate` is unimplemented. Runs **after**
 * {@link JwtAuthGuard} in the guard chain (context must already be attached).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * @param context - Nest execution context for the inbound request.
   * @returns `true` when the caller's role is permitted (or no roles required).
   * @throws NotImplementedException - Until subtask `86d39mgac` is implemented.
   * @todo Subtask 86d39mgac — read ROLES_KEY metadata, compare to caller role.
   */
  canActivate(context: ExecutionContext): boolean {
    // To be implemented:
    //   1. const required = this.reflector.getAllAndOverride<WorkspaceRole[]>(
    //        ROLES_KEY, [context.getHandler(), context.getClass()]);
    //   2. If !required?.length → return true (authenticated-only route).
    //   3. Compare required against request.workspaceContext.role;
    //      throw ForbiddenException (403) on mismatch.
    void this.reflector;
    void context;
    throw new NotImplementedException('RolesGuard.canActivate is not yet implemented.');
  }
}
