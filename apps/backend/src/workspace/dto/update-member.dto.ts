import type { WorkspaceRole } from '@prisma/client';

/**
 * Body for `PATCH /v1/workspace/members/:id` — update a member's role and/or
 * deactivate them.
 *
 * Deactivation (`isActive: false`) is a dual-action operation: the WorkOS
 * session is revoked **first** (synchronously), then the RDS row is updated.
 * If WorkOS revocation fails the RDS change is rolled back and the endpoint
 * returns 502 (handled in the service).
 *
 * @remarks
 * Validation (via `class-validator`, pending dependency) intended rules:
 * - `role`     — optional, valid {@link WorkspaceRole}; CA_OWNER cannot be
 *   assigned (403).
 * - `isActive` — optional boolean. `false` triggers the deactivation flow.
 * At least one field must be provided.
 */
export class UpdateMemberDto {
  /** New role for the member. CA_OWNER is not assignable (403). */
  role?: WorkspaceRole;

  /** Set to `false` to deactivate the member (revokes access immediately). */
  isActive?: boolean;
}
