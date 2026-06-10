import { SetMetadata } from '@nestjs/common';
import type { WorkspaceRole } from '@prisma/client';

/**
 * Metadata key under which the `@Roles()` decorator stores the set of
 * {@link WorkspaceRole}s allowed to invoke a handler. The RBAC guard (auth task)
 * reads this key via the Nest `Reflector` to enforce access.
 */
export const ROLES_KEY = 'roles';

/**
 * Declares the workspace roles permitted to call a controller handler.
 *
 * This decorator only attaches metadata — enforcement lives in the RBAC guard
 * (implemented in the auth/common task) which compares these roles against the
 * caller's role from the validated JWT claims. A handler with no `@Roles()` is
 * treated as authenticated-only (no role restriction).
 *
 * @example
 * \@Roles(WorkspaceRole.CA_OWNER)
 * \@Patch()
 * updateSettings() { ... }
 *
 * @param roles - One or more roles allowed to invoke the handler.
 */
export const Roles = (...roles: WorkspaceRole[]) => SetMetadata(ROLES_KEY, roles);
