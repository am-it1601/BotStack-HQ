import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import {
  WorkspaceContext,
  WorkspaceContextData,
} from '../common/decorators/workspace-context.decorator';
import { WorkspaceMemberService } from './workspace-member.service';
import type { InviteMemberDto, UpdateMemberDto, WorkspaceMemberResponseDto } from './dto';

/**
 * WorkspaceMemberController — team member management endpoints (ADD §05,
 * `/v1` prefix).
 *
 * Thin controller: validation + delegation only; logic lives in
 * {@link WorkspaceMemberService}. Returns are wrapped into the
 * `{ data, meta, error }` envelope by the global response interceptor (common
 * module, separate task). Tenant context comes from the JWT — never from input.
 *
 * BOILERPLATE ONLY: routes/guards/signatures defined; logic in subtasks.
 *
 * @remarks
 * - `@UseGuards(JwtAuthGuard, RolesGuard)` to be added once the auth/common
 *   guards land; `@Roles()` metadata is already in place.
 * - Both endpoints are CA_OWNER-only; JUNIOR_CA / SUPPORT_STAFF receive 403.
 * - Swagger/OpenAPI decorators pending the `@nestjs/swagger` dependency.
 */
@Controller('v1/workspace/members')
export class WorkspaceMemberController {
  constructor(private readonly memberService: WorkspaceMemberService) {}

  /**
   * POST /v1/workspace/members — invite a team member via WorkOS. Assigning
   * CA_OWNER returns 403. CA_OWNER only.
   */
  @Post()
  @Roles(WorkspaceRole.CA_OWNER)
  invite(
    @WorkspaceContext() context: WorkspaceContextData,
    @Body() dto: InviteMemberDto,
  ): Promise<WorkspaceMemberResponseDto> {
    return this.memberService.inviteMember(context, dto);
  }

  /**
   * PATCH /v1/workspace/members/:id — update role and/or deactivate a member.
   * Deactivation revokes the WorkOS session synchronously. CA_OWNER only.
   */
  @Patch(':id')
  @Roles(WorkspaceRole.CA_OWNER)
  update(
    @WorkspaceContext() context: WorkspaceContextData,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<WorkspaceMemberResponseDto> {
    return this.memberService.updateMember(context, memberId, dto);
  }
}
