import type { WorkspaceRole } from '@prisma/client';

/**
 * Types for the standalone API Gateway Lambda authorizer (story `86d34ytng`,
 * subtask `86d39mg7v`). This Lambda runs **before** the NestJS API Lambda and is
 * the single JWT signature-verification point in the system — NestJS trusts the
 * context it injects and never re-verifies.
 *
 * BOILERPLATE ONLY: shapes are defined; verification/mapping logic lives in the
 * authorizer handler stub.
 */

/**
 * Decoded WorkOS AuthKit JWT claims (post signature-verification).
 *
 * `org_id` and `role` are native WorkOS claims; `workspace_id` and `user_id` are
 * custom claims mapped to our RDS identities during onboarding. `role` arrives as
 * the lowercase JWT form (`ca_owner` | `junior_ca` | `support_staff`) and is
 * normalised to the {@link WorkspaceRole} enum downstream.
 */
export interface WorkOsJwtClaims {
  /** WorkOS user id (subject). */
  sub: string;
  /** WorkOS organization id — idempotency key for workspace provisioning. */
  org_id: string;
  /** Lowercase JWT role claim: `ca_owner` | `junior_ca` | `support_staff`. */
  role: string;
  /** Custom claim — our RDS `Workspace.id`. */
  workspace_id?: string;
  /** Custom claim — our RDS `User.id`. */
  user_id?: string;
  /** Expiry (epoch seconds). */
  exp: number;
  /** Issued-at (epoch seconds). */
  iat: number;
  [claim: string]: unknown;
}

/**
 * Flat context returned to API Gateway on an Allow. API Gateway authorizer
 * context values must be strings, so everything is serialised. NestJS reads this
 * via `event.requestContext.authorizer`.
 */
export interface AuthorizerContext {
  /** Tenant boundary — RDS `Workspace.id`. */
  workspace_id: string;
  /** RDS `User.id` of the caller. */
  user_id: string;
  /** Lowercase JWT role claim. */
  role: string;
  /** WorkOS organization id. */
  org_id: string;
}

/**
 * Maps the lowercase JWT `role` claim to the {@link WorkspaceRole} enum.
 * Source of truth: story `86d34ytng` authentication-context table.
 *
 * @todo Subtask 86d39mgac — consume from the NestJS RolesGuard when mapping.
 */
export const JWT_ROLE_TO_WORKSPACE_ROLE: Readonly<Record<string, WorkspaceRole>> = {
  ca_owner: 'CA_OWNER' as WorkspaceRole,
  junior_ca: 'JUNIOR_CA' as WorkspaceRole,
  support_staff: 'SUPPORT_STAFF' as WorkspaceRole,
};
