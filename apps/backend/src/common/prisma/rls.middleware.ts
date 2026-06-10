import type { PrismaService } from '../../prisma/prisma.service';

/**
 * Prisma RLS middleware (story `86d34ytng`, subtask `86d39mgf4`).
 *
 * Activates PostgreSQL row-level security on every query by emitting
 * `SET LOCAL app.workspace_id = '<id>'` inside the same transaction as the query.
 * The tenant id is read from {@link getWorkspaceId} (AsyncLocalStorage) — Prisma
 * middleware has no HTTP context — and each table's `workspace_isolation` policy
 * filters rows via `current_setting('app.workspace_id')`.
 *
 * BOILERPLATE ONLY: registration + contract are defined; the middleware body is
 * unimplemented. Call this once from {@link PrismaService} after `$connect`.
 *
 * @remarks
 * - `SET LOCAL` (transaction-scoped) is non-negotiable: plain `SET` persists
 *   across pooled connections and leaks workspace context between tenants.
 * - Because `SET LOCAL` only survives within a transaction, the wrapped query
 *   must run in the **same** transaction as the `SET LOCAL` (e.g. via
 *   `$transaction`/`$executeRaw` against one interactive connection).
 * - Queries with no bound workspace context (background jobs) must be handled
 *   explicitly — fail closed rather than run unscoped.
 */

/**
 * Registers the RLS middleware on the given Prisma client.
 *
 * @param prisma - The application {@link PrismaService} instance.
 * @throws Error - Until subtask `86d39mgf4` is implemented.
 * @todo Subtask 86d39mgf4 — register `$use` middleware that wraps each query
 *   with `SET LOCAL app.workspace_id` in a shared transaction.
 */
export function applyRlsMiddleware(prisma: PrismaService): void {
  // To be implemented:
  //   prisma.$use(async (params, next) => {
  //     const workspaceId = getWorkspaceId();          // from AsyncLocalStorage
  //     if (!workspaceId) { /* fail closed — throw or skip per policy */ }
  //     // Run SET LOCAL + the query in one transaction so RLS sees the GUC:
  //     //   await prisma.$executeRaw`SET LOCAL app.workspace_id = ${workspaceId}`;
  //     //   return next(params);
  //   });
  void prisma;
  throw new Error('applyRlsMiddleware is not yet implemented.');
}
