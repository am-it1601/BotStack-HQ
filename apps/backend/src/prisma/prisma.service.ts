import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Wraps the generated Prisma client and ties its connection lifecycle to the
 * Nest module lifecycle.
 *
 * Tenant isolation note: every workspace-scoped query is protected by
 * PostgreSQL RLS (the `workspace_isolation` policy on each tenant table).
 * The per-request `SET LOCAL app.workspace_id = '<from JWT>'` that activates
 * those policies is wired in a later task (depends on auth/JWT). Until then
 * RLS is enforced in the DB but no workspace context is set by the API.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
    // TODO(86d39mgf4): applyRlsMiddleware(this) — register the `SET LOCAL
    // app.workspace_id` middleware (see common/prisma/rls.middleware.ts) so RLS
    // is activated on every query. Left unwired while the middleware is a stub.
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
