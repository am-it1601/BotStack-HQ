import { Module } from '@nestjs/common';

/**
 * Common module (ADD §04) — cross-cutting guards, interceptors, pipes, and
 * decorators (e.g. the `{ data, meta, error }` response interceptor and the
 * tenant guard) shared across every domain module.
 *
 * Scaffold only. Shared providers are added in their dedicated tasks and
 * exported from here.
 */
@Module({})
export class CommonModule {}
