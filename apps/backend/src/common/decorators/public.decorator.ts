import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key under which {@link Public} marks a route as not requiring
 * authentication. The {@link JwtAuthGuard} reads this via the Nest `Reflector`
 * and skips JWT-context enforcement when present.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a controller handler (or controller) as public — no JWT auth required
 * (story `86d34ytng`, subtask `86d39mgac`).
 *
 * Explicit signal, per story constraint: absence of `@Roles()` means
 * "authenticated-only", **not** "public". Use this decorator for the few routes
 * that must bypass {@link JwtAuthGuard} (e.g. health checks). WhatsApp webhook
 * routes are HMAC-verified by a separate guard and are out of scope here.
 *
 * @example
 * \@Public()
 * \@Get('health')
 * health() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
