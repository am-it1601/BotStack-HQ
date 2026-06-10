import type { EscalationThreshold, Language } from '@prisma/client';

/**
 * Body for `PATCH /v1/workspace` — partial update of workspace settings.
 *
 * Only these three fields are mutable. `plan`, `slug`, and `authkit_org_id` are
 * immutable and must be rejected if present (ADD / task constraints). All fields
 * are optional (partial update); at least one should be provided.
 *
 * @remarks
 * Validation is enforced via `class-validator` decorators once that dependency
 * is added (see Backlog `[dep] class-validator`). Intended rules:
 * - `agentName`     — optional, non-empty string, max 50 chars.
 * - `escalationThreshold` — optional, must be a valid {@link EscalationThreshold}.
 * - `defaultLanguage`     — optional, must be a valid {@link Language}.
 */
export class UpdateWorkspaceDto {
  /** Configurable assistant display name. Non-empty, max 50 characters. */
  agentName?: string;

  /** How aggressively the agent escalates to a human. */
  escalationThreshold?: EscalationThreshold;

  /** Default language for the firm's client communications. */
  defaultLanguage?: Language;
}
