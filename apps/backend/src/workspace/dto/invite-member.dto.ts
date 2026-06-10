import type { WorkspaceRole } from '@prisma/client';

/**
 * Body for `POST /v1/workspace/members` — invite a new team member.
 *
 * The invite is dispatched to WorkOS (`inviteOrganizationMember`); the RDS
 * `User` + `WorkspaceMember` rows are created/activated later on the
 * `organizationMembership.created` webhook.
 *
 * @remarks
 * Validation (via `class-validator`, pending dependency) intended rules:
 * - `email`    — required, valid email.
 * - `fullName` — required, non-empty string.
 * - `role`     — required, valid {@link WorkspaceRole}. **CA_OWNER is NOT
 *   assignable here** — attempting it returns 403 (enforced in the service).
 */
export class InviteMemberDto {
  /** Invitee email address — WorkOS sends the invite here. */
  email!: string;

  /** Invitee full name, stored on the mirrored RDS `User`. */
  fullName!: string;

  /** Role to grant within the workspace. Must be JUNIOR_CA or SUPPORT_STAFF. */
  role!: WorkspaceRole;
}
