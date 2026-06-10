/**
 * API query hooks — TanStack Query integration for workspace/member endpoints.
 *
 * Conventions:
 * - Query keys co-located with hooks
 * - Cache invalidation on mutations
 * - Error handling via hook return (no global error boundary)
 * - Server state only (no Zustand mirroring)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ApiResponse,
  InviteMemberDto,
  UpdateMemberDto,
  UpdateWorkspaceDto,
  WorkspaceMemberResponseDto,
  WorkspaceResponseDto,
} from '@botstackhq/shared-types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/** Query key factory for workspace queries. */
const workspaceKeys = {
  all: ['workspace'] as const,
  detail: () => [...workspaceKeys.all, 'detail'] as const,
  members: () => [...workspaceKeys.all, 'members'] as const,
};

/** Fetch helper with JWT auth (token via AuthKit — TODO: integrate when backend ready). */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  // TODO: AuthKit JWT token injection
  // const token = await getAuthKitToken();
  // const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // ...authHeader,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiResponse<T>;
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

/**
 * GET /v1/workspace — fetch workspace details scoped to user's JWT workspace_id.
 * Available to all roles.
 */
export function useWorkspace() {
  return useQuery({
    queryKey: workspaceKeys.detail(),
    queryFn: async () => {
      const res = await apiFetch<WorkspaceResponseDto>('/v1/workspace');
      return res.data;
    },
  });
}

/**
 * PATCH /v1/workspace — update workspace settings (agent name, escalation, language).
 * CA_OWNER only; backend enforces role check.
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateWorkspaceDto) => {
      const res = await apiFetch<WorkspaceResponseDto>('/v1/workspace', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(workspaceKeys.detail(), data);
      }
    },
  });
}

/**
 * GET /v1/workspace/members — list team members (with cursor pagination).
 * CA_OWNER only (enforced by backend); other roles receive 403.
 *
 * NOTE: Backend controller not yet implemented for list endpoint. This hook
 * structure is in place; API contract pending.
 */
export function useWorkspaceMembers() {
  return useQuery({
    queryKey: workspaceKeys.members(),
    queryFn: async () => {
      // TODO: Implement backend GET /v1/workspace/members list endpoint
      const res = await apiFetch<WorkspaceMemberResponseDto[]>('/v1/workspace/members');
      return res.data || [];
    },
  });
}

/**
 * POST /v1/workspace/members — invite a new team member via WorkOS.
 * CA_OWNER only; attempting to assign CA_OWNER returns 403.
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: InviteMemberDto) => {
      const res = await apiFetch<WorkspaceMemberResponseDto>('/v1/workspace/members', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate members list on successful invite
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(),
      });
    },
  });
}

/**
 * PATCH /v1/workspace/members/:id — update member role or deactivate.
 * CA_OWNER only. Deactivation revokes WorkOS session synchronously.
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, dto }: { memberId: string; dto: UpdateMemberDto }) => {
      const res = await apiFetch<WorkspaceMemberResponseDto>(`/v1/workspace/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate members list on successful update
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(),
      });
    },
  });
}
