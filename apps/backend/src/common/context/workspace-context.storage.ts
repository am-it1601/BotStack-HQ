import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Per-request tenant context propagated out-of-band via `AsyncLocalStorage`
 * (story `86d34ytng`, subtask `86d39mgcq`).
 *
 * This is the bridge between the HTTP layer and the Prisma RLS middleware
 * (subtask `86d39mgf4`): the {@link WorkspaceContextInterceptor} enters the store
 * at request start, and the RLS middleware — which has no HTTP context — reads
 * `workspaceId` from here to emit `SET LOCAL app.workspace_id`.
 *
 * The store container below is real plumbing (no business logic); the
 * orchestration that *populates* it lives in the interceptor stub.
 */
export interface WorkspaceContextStore {
  /** Tenant boundary for the current async execution — sourced from the JWT. */
  workspaceId: string;
  /** RDS `User.id` of the caller. */
  userId: string;
}

/** Module-scoped ALS instance — one per Lambda container, shared across requests. */
export const workspaceContextStorage = new AsyncLocalStorage<WorkspaceContextStore>();

/**
 * Runs `callback` with `store` bound to the current async context. Everything
 * awaited inside (controllers, services, Prisma middleware) can read it via
 * {@link getWorkspaceContext}.
 *
 * @param store - The tenant context to bind for this execution.
 * @param callback - Work to run within the bound context.
 */
export function runWithWorkspaceContext<T>(store: WorkspaceContextStore, callback: () => T): T {
  return workspaceContextStorage.run(store, callback);
}

/**
 * @returns The active {@link WorkspaceContextStore}, or `undefined` outside a
 * request-bound context (e.g. background jobs that have not entered the store).
 */
export function getWorkspaceContext(): WorkspaceContextStore | undefined {
  return workspaceContextStorage.getStore();
}

/**
 * @returns The active tenant `workspaceId`, or `undefined` when no context is
 * bound. Consumed by the Prisma RLS middleware to scope `SET LOCAL`.
 */
export function getWorkspaceId(): string | undefined {
  return workspaceContextStorage.getStore()?.workspaceId;
}
