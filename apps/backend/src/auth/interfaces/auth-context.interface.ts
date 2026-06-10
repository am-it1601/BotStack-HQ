import type { WorkspaceContextData } from '../../common/decorators/workspace-context.decorator';

/**
 * Auth-layer view of the authenticated caller (story `86d34ytng`, subtask
 * `86d39mgac`).
 *
 * This is the typed, `camelCase` context the {@link JwtAuthGuard} produces from
 * the raw API Gateway authorizer claims and attaches to the request. It is a
 * structural alias of {@link WorkspaceContextData} (the request-attached shape
 * read by `@WorkspaceContext()` / `@CurrentUser()`) so the codebase has a single
 * source of truth for caller identity — referenced as `AuthContext` from the auth
 * layer and `WorkspaceContextData` from the tenant/decorator layer.
 */
export type AuthContext = WorkspaceContextData;

/**
 * Raw, untyped context injected by the Lambda authorizer and exposed at
 * `request.requestContext.authorizer`. Keys are `snake_case` strings (API Gateway
 * authorizer context is string-only). The {@link JwtAuthGuard} maps this to a
 * typed {@link AuthContext}.
 */
export interface RawAuthorizerContext {
  workspace_id: string;
  user_id: string;
  /** Lowercase JWT role claim: `ca_owner` | `junior_ca` | `support_staff`. */
  role: string;
  org_id: string;
}
