import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { WorkspaceContextData } from '../common/decorators/workspace-context.decorator';
import type { UpdateWorkspaceDto, WorkspaceResponseDto } from './dto';

/**
 * WorkspaceService — workspace lifecycle (provisioning, read, settings update)
 * for the multi-tenant boundary that every other domain is scoped to.
 *
 * BOILERPLATE ONLY: method signatures + contracts are defined; bodies are
 * unimplemented. Logic is delivered in the per-endpoint subtasks of story
 * `86d34ytpj` (10. Workspace & Team Management APIs).
 *
 * Cross-module collaborators (injected once their tasks land):
 * - AuditService (audit module) — write AuditLog + AuditEvent on every mutation.
 * - WorkOS client — identity source of truth.
 */
@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotently provision the workspace for the caller's WorkOS organization on
   * first login. Uses `authkit_org_id` as the idempotency key (Prisma upsert) so
   * repeat logins are a no-op. Defaults: `agent_name: "Arya"`, `plan: STARTER`,
   * `is_active: true`.
   *
   * @param context - Resolved tenant/caller identity from JWT claims.
   * @returns The newly created or existing workspace.
   * @throws NotImplementedException - Until subtask `86d39mfkd` is implemented.
   * @todo Subtask 86d39mfkd — POST /v1/workspace auto-provisioning.
   */
  async provisionWorkspace(context: WorkspaceContextData): Promise<WorkspaceResponseDto> {
    // To be implemented: Prisma upsert on authkit_org_id (idempotent), then
    // write AuditLog + AuditEvent for the provisioning event.
    void context;
    throw new NotImplementedException(
      'WorkspaceService.provisionWorkspace is not yet implemented.',
    );
  }

  /**
   * Fetch the workspace scoped to the caller's JWT `workspace_id`. Read-only;
   * available to all workspace roles (CA_OWNER, JUNIOR_CA, SUPPORT_STAFF).
   *
   * @param context - Resolved tenant/caller identity from JWT claims.
   * @returns The caller's workspace.
   * @throws NotImplementedException - Until subtask `86d39mfmj` is implemented.
   * @todo Subtask 86d39mfmj — GET /v1/workspace.
   */
  async getWorkspace(context: WorkspaceContextData): Promise<WorkspaceResponseDto> {
    // To be implemented: find workspace by context.workspaceId (RLS + explicit
    // workspace_id filter), map Prisma model → WorkspaceResponseDto.
    void context;
    throw new NotImplementedException('WorkspaceService.getWorkspace is not yet implemented.');
  }

  /**
   * Partially update mutable workspace settings (`agent_name`,
   * `escalation_threshold`, `default_language`). Immutable fields (`plan`,
   * `slug`, `authkit_org_id`) are never touched. CA_OWNER only.
   *
   * @param context - Resolved tenant/caller identity from JWT claims.
   * @param dto - Partial settings to apply.
   * @returns The updated workspace.
   * @throws NotImplementedException - Until subtask `86d39mfp8` is implemented.
   * @todo Subtask 86d39mfp8 — PATCH /v1/workspace.
   */
  async updateSettings(
    context: WorkspaceContextData,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    // To be implemented: validate agent_name (non-empty, <=50), apply partial
    // update scoped to context.workspaceId, write AuditLog + AuditEvent (raw diff
    // + human-readable) for the mutation.
    void [context, dto];
    throw new NotImplementedException('WorkspaceService.updateSettings is not yet implemented.');
  }
}
