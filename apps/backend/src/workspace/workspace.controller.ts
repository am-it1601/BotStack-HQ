import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import {
  WorkspaceContext,
  WorkspaceContextData,
} from '../common/decorators/workspace-context.decorator';
import { WorkspaceService } from './workspace.service';
import type { UpdateWorkspaceDto, WorkspaceResponseDto } from './dto';

/**
 * WorkspaceController — workspace lifecycle endpoints (ADD §05, `/v1` prefix).
 *
 * Thin controller: validation + delegation only; business logic lives in
 * {@link WorkspaceService}. Handler returns are wrapped into the
 * `{ data, meta, error }` envelope by the global response interceptor
 * (common module, separate task). Tenant context comes from the JWT via
 * `@WorkspaceContext()` — never from the request body/path.
 *
 * BOILERPLATE ONLY: routes/guards/signatures defined; logic in subtasks.
 *
 * @remarks
 * - `@UseGuards(JwtAuthGuard, RolesGuard)` to be added once the auth/common
 *   guards land; `@Roles()` metadata below is already in place for them.
 * - Swagger/OpenAPI decorators pending the `@nestjs/swagger` dependency
 *   (see Backlog).
 */
@Controller('v1/workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  /**
   * POST /v1/workspace — idempotently provision the caller's workspace on first
   * login (no-op on repeat). CA_OWNER only.
   */
  @Post()
  @Roles(WorkspaceRole.CA_OWNER)
  provision(@WorkspaceContext() context: WorkspaceContextData): Promise<WorkspaceResponseDto> {
    return this.workspaceService.provisionWorkspace(context);
  }

  /**
   * GET /v1/workspace — return the workspace scoped to the caller's JWT
   * `workspace_id`. All roles (read-only).
   */
  @Get()
  getWorkspace(@WorkspaceContext() context: WorkspaceContextData): Promise<WorkspaceResponseDto> {
    return this.workspaceService.getWorkspace(context);
  }

  /**
   * PATCH /v1/workspace — partial update of mutable settings (agent name,
   * escalation threshold, default language). CA_OWNER only.
   */
  @Patch()
  @Roles(WorkspaceRole.CA_OWNER)
  updateSettings(
    @WorkspaceContext() context: WorkspaceContextData,
    @Body() dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    return this.workspaceService.updateSettings(context, dto);
  }
}
