/**
 * Zustand store for team management UI state.
 *
 * Ephemeral state only: modals, selection, form state. Server state lives in
 * TanStack Query (useWorkspaceMembers, etc.). Never mirror API data here.
 */

import { create } from 'zustand';

interface TeamUIState {
  // Modals
  isInviteModalOpen: boolean;
  openInviteModal: () => void;
  closeInviteModal: () => void;

  // Selection
  selectedMemberId: string | null;
  selectMember: (memberId: string | null) => void;

  // Update member modal
  isUpdateMemberModalOpen: boolean;
  openUpdateMemberModal: (memberId: string) => void;
  closeUpdateMemberModal: () => void;
}

export const useTeamUIStore = create<TeamUIState>((set) => ({
  isInviteModalOpen: false,
  openInviteModal: () => set({ isInviteModalOpen: true }),
  closeInviteModal: () => set({ isInviteModalOpen: false }),

  selectedMemberId: null,
  selectMember: (memberId) => set({ selectedMemberId: memberId }),

  isUpdateMemberModalOpen: false,
  openUpdateMemberModal: (memberId) =>
    set({ isUpdateMemberModalOpen: true, selectedMemberId: memberId }),
  closeUpdateMemberModal: () => set({ isUpdateMemberModalOpen: false, selectedMemberId: null }),
}));
