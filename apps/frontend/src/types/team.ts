/**
 * Team management types — UI-specific, beyond the shared DTOs.
 *
 * Primarily for form state, filters, and display transformations.
 */

import type { PrismaWorkspaceRole } from '@botstackhq/shared-types';

/** Role display labels and metadata. */
export const ROLE_METADATA: Record<PrismaWorkspaceRole, { label: string; description: string }> = {
  CA_OWNER: {
    label: 'CA Owner',
    description: 'Full workspace access, team management, filing approvals',
  },
  JUNIOR_CA: {
    label: 'Junior CA',
    description: 'Can manage assigned clients, submit filings, view conversations',
  },
  SUPPORT_STAFF: {
    label: 'Support Staff',
    description: 'Can view conversations, respond to escalations, read-only access',
  },
};

/** Roles that can be assigned via invite (CA_OWNER cannot be assigned). */
export const ASSIGNABLE_ROLES: PrismaWorkspaceRole[] = ['JUNIOR_CA', 'SUPPORT_STAFF'];

/** Form state for invite member modal. */
export interface InviteFormState {
  email: string;
  fullName: string;
  role: PrismaWorkspaceRole;
  isSubmitting?: boolean;
  error?: string | null;
}

/** Form state for update member modal. */
export interface UpdateMemberFormState {
  role?: PrismaWorkspaceRole;
  isActive?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
}
