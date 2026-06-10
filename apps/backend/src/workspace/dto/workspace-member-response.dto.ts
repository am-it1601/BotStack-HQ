import type { WorkspaceRole } from '@prisma/client';

/**
 * API representation of a {@link WorkspaceMember} (joined with its {@link User})
 * returned by the member endpoints.
 *
 * Wire shape is `camelCase`; timestamps are ISO 8601 UTC strings. Mapped from
 * the Prisma models in the service — Prisma types are never leaked to the API.
 */
export interface WorkspaceMemberResponseDto {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: WorkspaceRole;
  isActive: boolean;
  /** ISO 8601 UTC. */
  invitedAt: string;
  /** ISO 8601 UTC, or null until the invite is accepted. */
  joinedAt: string | null;
}
