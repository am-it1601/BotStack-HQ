import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceMemberController } from './workspace-member.controller';
import { WorkspaceMemberService } from './workspace-member.service';

/**
 * Workspace domain (ADD §04) — CA workspace management and the multi-tenancy
 * context that every other domain is scoped to. Covers story `86d34ytpj`
 * (10. Workspace & Team Management APIs): workspace lifecycle + team members.
 *
 * BOILERPLATE: controllers/services are wired but their handlers are
 * unimplemented stubs — logic is delivered in the per-endpoint subtasks.
 *
 * PrismaService is available via the @Global PrismaModule (no import needed).
 * WorkspaceService is exported for cross-module use (e.g. provisioning from the
 * auth/JWT flow).
 */
@Module({
  controllers: [WorkspaceController, WorkspaceMemberController],
  providers: [WorkspaceService, WorkspaceMemberService],
  exports: [WorkspaceService, WorkspaceMemberService],
})
export class WorkspaceModule {}
