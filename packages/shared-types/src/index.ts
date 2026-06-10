/**
 * @botstackhq/shared-types
 *
 * Shared TypeScript types used across the BotStackHQ stack (backend, frontend,
 * infrastructure). Aligned with the ComplianceStack Phase 1 domain as defined in
 * the Architecture Decision Document.
 *
 * This is a scaffold — the full entity schema is defined in the Data Model task.
 */

/** Generic health/readiness payload exposed by each service. */
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  timestamp: string;
}

/** Standard API response envelope: `{ data, meta, error }` (ADD §05). */
export interface ApiResponse<T> {
  data: T | null;
  meta?: ApiMeta;
  error?: ApiError | null;
}

export interface ApiMeta {
  /** Opaque cursor for cursor-based pagination on list endpoints. */
  nextCursor?: string | null;
  [key: string]: unknown;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/** Workspace member roles (ADD §12 Authentication & Authorization). */
export type WorkspaceRole = 'workspace_owner' | 'ca_admin' | 'ca_member' | 'agency_admin';

/** Workspace member roles as returned by backend (Prisma enum — synchronized). */
export type PrismaWorkspaceRole = 'CA_OWNER' | 'JUNIOR_CA' | 'SUPPORT_STAFF';

/** Compliance filing types supported in Phase 1 (ADD §08, Product Overview). */
export type FilingType = 'GSTR-1' | 'GSTR-3B' | 'TDS' | 'ADVANCE_TAX' | 'ITR' | 'FORM_16';

/** Lifecycle status of a single filing for a client. */
export type FilingStatus =
  | 'pending'
  | 'inputs_requested'
  | 'inputs_received'
  | 'overdue'
  | 'filed'
  | 'confirmed';

/** Reminder cadence stages relative to a filing deadline (ADD §07, §10). */
export type ReminderStage = 'T-12' | 'T-7' | 'T-3' | 'post-filing';

/** JWT claims injected by the API Gateway Lambda authorizer (ADD §12). */
export interface JwtClaims {
  sub: string;
  workspace_id: string;
  role: PrismaWorkspaceRole;
  permissions: string[];
  org_id: string;
}

/** Workspace response DTO from backend. */
export interface WorkspaceResponseDto {
  id: string;
  name: string;
  slug: string;
  agentName: string;
  agentGreeting: string | null;
  escalationThreshold: string;
  defaultLanguage: string;
  plan: string;
  whatsappVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Workspace member response DTO from backend. */
export interface WorkspaceMemberResponseDto {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: PrismaWorkspaceRole;
  isActive: boolean;
  invitedAt: string;
  joinedAt: string | null;
}

/** Request DTO for inviting a new workspace member. */
export interface InviteMemberDto {
  email: string;
  fullName: string;
  role: PrismaWorkspaceRole;
}

/** Request DTO for updating a workspace member. */
export interface UpdateMemberDto {
  role?: PrismaWorkspaceRole;
  isActive?: boolean;
}

/** Request DTO for updating workspace settings. */
export interface UpdateWorkspaceDto {
  agentName?: string;
  agentGreeting?: string | null;
  escalationThreshold?: string;
  defaultLanguage?: string;
}
