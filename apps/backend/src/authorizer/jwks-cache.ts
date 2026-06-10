import type { WorkOsJwtClaims } from './authorizer.types';

/**
 * In-memory JWKS cache + JWT verifier for the Lambda authorizer (story
 * `86d34ytng`, subtask `86d39mg7v`).
 *
 * The signing keys are fetched once from the WorkOS JWKS endpoint and cached in
 * Lambda memory with a 1hr TTL, so warm invocations never hit WorkOS. The cache
 * lives at module scope (survives across warm invocations of the same container).
 *
 * BOILERPLATE ONLY: cache wiring + method contracts are defined; fetch and
 * verification logic are unimplemented.
 *
 * @remarks
 * Intended dependencies (see Backlog): `jose` (JWKS fetch + `jwtVerify`). The
 * JWKS URL is `https://api.workos.com/sso/jwks/<client_id>`; the client id comes
 * from an env var / Secrets Manager (never hard-coded).
 */

/** Cache TTL — minimum 1hr per story constraints. */
export const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Module-scoped cache slot. Persists across warm Lambda invocations; reset on
 * cold start. Holds the remote key set and the epoch-ms it was fetched.
 */
interface JwksCacheSlot {
  /** Opaque key set returned by the JWKS provider (typed once `jose` lands). */
  keySet: unknown;
  /** Epoch ms the key set was fetched, used to evaluate {@link JWKS_CACHE_TTL_MS}. */
  fetchedAt: number;
}

// eslint-disable-next-line prefer-const -- reassigned by getJwks() once subtask 86d39mg7v lands.
let cache: JwksCacheSlot | null = null;

/**
 * Returns a cached JWKS key set, refreshing it from WorkOS when the cache is
 * empty or older than {@link JWKS_CACHE_TTL_MS}.
 *
 * @returns The cached/refreshed JWKS key set.
 * @throws Error - Until subtask `86d39mg7v` is implemented.
 * @todo Subtask 86d39mg7v — fetch JWKS via `jose.createRemoteJWKSet`, honour TTL.
 */
export async function getJwks(): Promise<unknown> {
  // To be implemented: if `cache` is null or expired (now - fetchedAt >
  // JWKS_CACHE_TTL_MS), fetch the WorkOS JWKS and repopulate `cache`; otherwise
  // return the cached key set. Note: `Date.now()` is the TTL clock.
  void cache;
  throw new Error('jwks-cache.getJwks is not yet implemented.');
}

/**
 * Verifies a raw bearer token's signature against the cached JWKS and returns the
 * decoded claims. Rejects expired/malformed/tampered tokens.
 *
 * @param token - The raw JWT (no `Bearer ` prefix).
 * @returns The verified {@link WorkOsJwtClaims}.
 * @throws Error - On invalid/expired token, or until subtask `86d39mg7v` is implemented.
 * @todo Subtask 86d39mg7v — verify signature + exp/iss/aud via `jose.jwtVerify`.
 */
export async function verifyToken(token: string): Promise<WorkOsJwtClaims> {
  // To be implemented: resolve the key set via getJwks(), verify the token
  // signature + standard claims (exp, iss, aud), and return the decoded payload.
  void token;
  throw new Error('jwks-cache.verifyToken is not yet implemented.');
}
