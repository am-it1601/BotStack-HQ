import { Module } from '@nestjs/common';

/**
 * Auth domain (ADD §04, §13) — AuthKit integration, JWT validation, and the
 * guards that derive `workspace_id` from JWT claims for tenant isolation.
 *
 * Scaffold only. Controllers, services, and guards are added in their dedicated
 * tasks; this module exists so the domain boundary is wired into AppModule.
 */
@Module({})
export class AuthModule {}
