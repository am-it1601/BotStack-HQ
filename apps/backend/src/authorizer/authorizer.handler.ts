import type {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
  Handler,
} from 'aws-lambda';
import type { AuthorizerContext } from './authorizer.types';

/**
 * API Gateway **REQUEST** Lambda authorizer (story `86d34ytng`, subtask
 * `86d39mg7v`) — the first-line JWT gate on every `/v1/*` route, invoked before
 * the NestJS API Lambda cold-starts.
 *
 * Flow:
 * 1. Extract the bearer token from the `Authorization` header.
 * 2. Verify its signature against the cached WorkOS JWKS ({@link verifyToken}).
 * 3. On success → return an IAM **Allow** policy and inject
 *    {@link AuthorizerContext} (`workspace_id`, `user_id`, `role`, `org_id`),
 *    readable in NestJS via `event.requestContext.authorizer`.
 * 4. On failure (missing/expired/malformed/tampered) → throw `'Unauthorized'`,
 *    which API Gateway maps to a 401.
 *
 * BOILERPLATE ONLY: this is a standalone Lambda (separate from the NestJS API
 * Lambda), deployed via CDK and attached to the API Gateway authorizer config
 * (infra subtask — see Backlog). Verification/policy logic is unimplemented.
 *
 * @remarks
 * - This is the **only** signature-verification point; NestJS trusts the context.
 * - IAM role: `logs:*` only (least privilege).
 * - WhatsApp webhook routes are excluded from this authorizer (HMAC-verified
 *   separately — out of scope).
 */
export const handler: Handler<
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult
> = async (event) => {
  // To be implemented:
  //   1. const token = extractBearer(event.headers?.Authorization)
  //   2. const claims = await verifyToken(token)   // 401 on failure
  //   3. const ctx = mapClaimsToAuthorizerContext(claims)
  //   4. return generatePolicy(claims.sub, 'Allow', event.methodArn, ctx)
  // Throw 'Unauthorized' (literal string) to make API Gateway return 401.
  void event;
  throw new Error('authorizer.handler is not yet implemented.');
};

/**
 * Builds the IAM policy document API Gateway expects, embedding the tenant
 * context for downstream NestJS consumption.
 *
 * @param principalId - Token subject (WorkOS user id).
 * @param effect - `'Allow'` or `'Deny'`.
 * @param resource - The invoked method ARN (`event.methodArn`).
 * @param context - Flattened tenant context injected on Allow.
 * @returns The authorizer result consumed by API Gateway.
 * @throws Error - Until subtask `86d39mg7v` is implemented.
 * @todo Subtask 86d39mg7v — assemble the policy document.
 */
export function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context: AuthorizerContext,
): APIGatewayAuthorizerResult {
  // To be implemented: return { principalId, policyDocument: { Version,
  // Statement: [{ Action: 'execute-api:Invoke', Effect, Resource }] }, context }.
  void [principalId, effect, resource, context];
  throw new Error('authorizer.generatePolicy is not yet implemented.');
}
