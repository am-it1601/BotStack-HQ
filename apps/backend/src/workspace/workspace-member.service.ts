import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { WorkspaceContextData } from '../common/decorators/workspace-context.decorator';
import type { InviteMemberDto, UpdateMemberDto, WorkspaceMemberResponseDto } from './dto';

/**
 * WorkspaceMemberService — team member operations (invite, role change,
 * deactivation) within a workspace.
 *
 * BOILERPLATE ONLY: signatures + contracts defined; bodies unimplemented. Logic
 * is delivered in subtasks `86d39mfrd` (invite) and `86d39mftp` (update/
 * deactivate) of story `86d34ytpj`.
 *
 * Identity model: WorkOS is the source of truth. RDS `User` + `WorkspaceMember`
 * are local mirrors, synced on invite acceptance (webhook) and deactivation.
 *
 * Cross-module collaborators (injected once their tasks land):
 * - AuditService (audit module) — AuditLog + AuditEvent on every mutation.
 * - WorkOS client — invites and session revocation.
 */
@Injectable()
export class WorkspaceMemberService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invite a team member via WorkOS (`inviteOrganizationMember`). The RDS rows
   * are created/activated later on the `organizationMembership.created` webhook
   * (see {@link activateInvitedMember}).
   *
   * Constraint: CA_OWNER cannot be assigned to an invitee — returns 403.
   *
   * @param context - Resolved tenant/caller identity from JWT claims.
   * @param dto - Invitee email, name, and target role.
   * @returns The pending member record.
   * @throws NotImplementedException - Until subtask `86d39mfrd` is implemented.
   * @todo Subtask 86d39mfrd — POST /v1/workspace/members.
   */
  async inviteMember(
    context: WorkspaceContextData,
    dto: InviteMemberDto,
  ): Promise<WorkspaceMemberResponseDto> {
    // To be implemented: reject CA_OWNER assignment (403), call WorkOS invite,
    // create the pending WorkspaceMember, write AuditLog + AuditEvent.
    void [context, dto];
    throw new NotImplementedException(
      'WorkspaceMemberService.inviteMember is not yet implemented.',
    );
  }

  /**
   * Update a member's role and/or deactivate them.
   *
   * Deactivation (`isActive: false`) is dual-action and ordered: revoke the
   * WorkOS session **first** (synchronous), then update RDS. If WorkOS fails,
   * roll back the RDS change and surface 502. Soft-delete only — members are
   * never hard-deleted. CA_OWNER cannot be assigned via role change (403).
   *
   * @param context - Resolved tenant/caller identity from JWT claims.
   * @param memberId - `WorkspaceMember.id` to update (path param).
   * @param dto - Role change and/or deactivation flag.
   * @returns The updated member record.
   * @throws NotImplementedException - Until subtask `86d39mftp` is implemented.
   * @todo Subtask 86d39mftp — PATCH /v1/workspace/members/:id.
   */
  async updateMember(
    context: WorkspaceContextData,
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<WorkspaceMemberResponseDto> {
    // To be implemented: scope to context.workspaceId, reject CA_OWNER role
    // assignment (403). On deactivation: WorkOS session revocation first, then
    // RDS is_active=false; rollback + 502 on WorkOS failure. Write AuditLog +
    // AuditEvent for the mutation.
    void [context, memberId, dto];
    throw new NotImplementedException(
      'WorkspaceMemberService.updateMember is not yet implemented.',
    );
  }

  /**
   * Sync RDS to a WorkOS `organizationMembership.created` event: create the
   * `User` mirror (if absent) and activate the `WorkspaceMember`. Idempotent —
   * invoked by the WorkOS webhook handler (auth/notification task), not by a
   * REST route.
   *
   * @param context - Tenant context derived from the webhook's organization.
   * @param dto - The invite payload mirrored from WorkOS.
   * @returns The activated member record.
   * @throws NotImplementedException - Until the invite-acceptance flow is built.
   * @todo Subtask 86d39mfrd — webhook-driven invite acceptance.
   */
  async activateInvitedMember(
    context: WorkspaceContextData,
    dto: InviteMemberDto,
  ): Promise<WorkspaceMemberResponseDto> {
    // To be implemented: upsert User by authkit_user_id, activate
    // WorkspaceMember (joined_at = now), write AuditLog + AuditEvent.
    void [context, dto];
    throw new NotImplementedException(
      'WorkspaceMemberService.activateInvitedMember is not yet implemented.',
    );
  }
}
