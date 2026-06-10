/**
 * UpdateMemberModal — edit role and deactivation status for a team member.
 *
 * Features:
 * - Change role (JUNIOR_CA / SUPPORT_STAFF)
 * - Deactivate member (revokes WorkOS session)
 * - Current values pre-filled
 * - Confirmation on deactivation
 *
 * CA_OWNER only; hidden from other roles.
 */

import { useState, useMemo } from 'react';
import type { PrismaWorkspaceRole } from '@botstackhq/shared-types';
import { useWorkspaceMembers, useUpdateMember } from '../hooks/api';
import { useTeamUIStore } from '../stores/team';
import { ASSIGNABLE_ROLES, ROLE_METADATA } from '../types/team';

export function UpdateMemberModal() {
  const { selectedMemberId, isUpdateMemberModalOpen, closeUpdateMemberModal } = useTeamUIStore();
  const { data: members } = useWorkspaceMembers();
  const updateMember = useUpdateMember();

  const [selectedRole, setSelectedRole] = useState<PrismaWorkspaceRole | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Get current member data
  const currentMember = useMemo(
    () => members?.find((m) => m.id === selectedMemberId),
    [members, selectedMemberId],
  );

  if (!isUpdateMemberModalOpen || !currentMember || !selectedMemberId) {
    return null;
  }

  const handleChangeRole = async () => {
    if (!selectedRole || selectedRole === currentMember.role) {
      return;
    }

    try {
      await updateMember.mutateAsync({
        memberId: selectedMemberId,
        dto: { role: selectedRole },
      });
      closeUpdateMemberModal();
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleDeactivate = async () => {
    if (
      !confirm(
        `Are you sure you want to remove ${currentMember.fullName}? This will revoke their access immediately.`,
      )
    ) {
      return;
    }

    setIsDeactivating(true);
    try {
      await updateMember.mutateAsync({
        memberId: selectedMemberId,
        dto: { isActive: false },
      });
      closeUpdateMemberModal();
    } catch {
      // Error handled by mutation hook
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Team Member</h2>

        {/* Member info */}
        <div className="mb-6 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-900">{currentMember.fullName}</p>
          <p className="text-sm text-gray-600">{currentMember.email}</p>
        </div>

        {/* Role change section */}
        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Change Role
          </label>
          <select
            id="role"
            value={selectedRole ?? currentMember.role}
            onChange={(e) => setSelectedRole(e.target.value as PrismaWorkspaceRole)}
            disabled={updateMember.isPending || isDeactivating}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {ASSIGNABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_METADATA[role].label}
              </option>
            ))}
          </select>
          {selectedRole && selectedRole !== currentMember.role && (
            <button
              onClick={handleChangeRole}
              disabled={updateMember.isPending || isDeactivating}
              className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMember.isPending ? 'Updating...' : 'Update Role'}
            </button>
          )}
        </div>

        {/* Deactivate section */}
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm font-medium text-gray-900 mb-2">Remove Member</p>
          <p className="text-xs text-gray-600 mb-3">
            This will deactivate {currentMember.fullName}'s access and revoke their WorkOS session
            immediately.
          </p>
          <button
            onClick={handleDeactivate}
            disabled={updateMember.isPending || isDeactivating}
            className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeactivating ? 'Removing...' : 'Remove Member'}
          </button>
        </div>

        {/* Error display */}
        {updateMember.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {updateMember.error.message}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={closeUpdateMemberModal}
          disabled={updateMember.isPending || isDeactivating}
          className="w-full px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Close
        </button>
      </div>
    </div>
  );
}
