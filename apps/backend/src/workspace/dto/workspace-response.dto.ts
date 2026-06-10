import type { EscalationThreshold, Language, PlanType } from '@prisma/client';

/**
 * API representation of a {@link Workspace} returned by the workspace endpoints.
 *
 * Wire shape is `camelCase` (DTO layer) even though DB columns are `snake_case`.
 * Timestamps are ISO 8601 UTC strings. The Prisma model is mapped to this DTO in
 * the service — Prisma types are never leaked directly to the API.
 */
export interface WorkspaceResponseDto {
  id: string;
  name: string;
  slug: string;
  agentName: string;
  agentGreeting: string | null;
  escalationThreshold: EscalationThreshold;
  defaultLanguage: Language;
  plan: PlanType;
  whatsappVerified: boolean;
  isActive: boolean;
  /** ISO 8601 UTC. */
  createdAt: string;
  /** ISO 8601 UTC. */
  updatedAt: string;
}
