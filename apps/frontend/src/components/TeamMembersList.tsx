/**
 * TeamMembersList — displays active team members in a table.
 *
 * Shows: email, name, role, invite status, actions (edit, remove).
 * Role gating: CA_OWNER only. Other roles receive hidden UI + 403 from backend.
 *
 * States handled:
 * - Loading: skeleton or spinner
 * - Empty: "No team members yet"
 * - Error: with retry button
 * - Success: table with action buttons
 */

import type { PrismaWorkspaceRole } from '@botstackhq/shared-types';
import { useWorkspaceMembers, useUpdateMember } from '../hooks/api';
import { useTeamUIStore } from '../stores/team';
import { ROLE_METADATA } from '../types/team';

interface TeamMembersListProps {
  /** Current user's role — passed from parent to gate UI. */
  currentUserRole: PrismaWorkspaceRole;
}

export function TeamMembersList({ currentUserRole }: TeamMembersListProps) {
  const { data: members, isLoading, error, refetch } = useWorkspaceMembers();
  const updateMember = useUpdateMember();
  const { openUpdateMemberModal } = useTeamUIStore();

  const canManage = currentUserRole === 'CA_OWNER';

  if (!canManage) {
    return null; // Hidden from non-owners
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">Loading team members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded">
        <p className="text-sm text-red-700 mb-2">Failed to load team members</p>
        <button
          onClick={() => refetch()}
          className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-gray-300 rounded">
        <p className="text-gray-600 mb-2">No team members yet</p>
        <p className="text-sm text-gray-500">Invite team members to get started</p>
      </div>
    );
  }

  const handleDeactivate = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    try {
      await updateMember.mutateAsync({
        memberId,
        dto: { isActive: false },
      });
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 font-semibold text-gray-700">Name</th>
            <th className="text-left p-3 font-semibold text-gray-700">Email</th>
            <th className="text-left p-3 font-semibold text-gray-700">Role</th>
            <th className="text-left p-3 font-semibold text-gray-700">Joined</th>
            <th className="text-left p-3 font-semibold text-gray-700">Status</th>
            <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3 text-gray-900">{member.fullName}</td>
              <td className="p-3 text-gray-600">{member.email}</td>
              <td className="p-3">
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {ROLE_METADATA[member.role].label}
                </span>
              </td>
              <td className="p-3 text-gray-600">{formatDate(member.invitedAt)}</td>
              <td className="p-3">
                {member.joinedAt ? (
                  <span className="text-xs font-medium text-green-600">Active</span>
                ) : (
                  <span className="text-xs font-medium text-yellow-600">Pending</span>
                )}
              </td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => openUpdateMemberModal(member.id)}
                  className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  disabled={updateMember.isPending}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeactivate(member.id)}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  disabled={updateMember.isPending}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Format ISO 8601 timestamp to readable date. */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
