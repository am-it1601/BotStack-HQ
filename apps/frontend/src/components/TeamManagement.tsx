/**
 * TeamManagement — main container for team management feature.
 *
 * Surfaces:
 * - Team members list (with invite/edit/remove actions)
 * - Invite modal
 * - Update member modal
 * - Role-gated UI (CA_OWNER only)
 *
 * Props:
 * - currentUserRole: PrismaWorkspaceRole — used for UI gating and permissions
 *
 * Assumes AuthKit integration will provide the user's role via JWT claims.
 * TODO: Wire in actual JWT role once AuthKit backend is ready.
 */

import type { PrismaWorkspaceRole } from '@botstackhq/shared-types';
import { TeamMembersList } from './TeamMembersList';
import { InviteMemberForm } from './InviteMemberForm';
import { UpdateMemberModal } from './UpdateMemberModal';
import { useTeamUIStore } from '../stores/team';

interface TeamManagementProps {
  /** Current user's workspace role (from JWT claims). */
  currentUserRole: PrismaWorkspaceRole;
}

export function TeamManagement({ currentUserRole }: TeamManagementProps) {
  const canManage = currentUserRole === 'CA_OWNER';
  const { isInviteModalOpen, openInviteModal } = useTeamUIStore();

  if (!canManage) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-sm">
          Team management is available to CA Owners only. Contact your workspace owner to manage
          team members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with invite button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your workspace team and permissions</p>
        </div>
        <button
          onClick={openInviteModal}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          + Invite Member
        </button>
      </div>

      {/* Team members list */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <TeamMembersList currentUserRole={currentUserRole} />
      </div>

      {/* Modals */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h2>
            <InviteMemberForm />
          </div>
        </div>
      )}

      <UpdateMemberModal />
    </div>
  );
}
