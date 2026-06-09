import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AgentModule } from './agent/agent.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { CommonModule } from './common/common.module';
import { DocumentModule } from './document/document.module';
import { FilingModule } from './filing/filing.module';
import { LlmModule } from './llm/llm.module';
import { NotificationModule } from './notification/notification.module';
import { WorkflowModule } from './workflow/workflow.module';
import { WorkspaceModule } from './workspace/workspace.module';

/**
 * Root application module wiring the full domain-module map (ADD §04).
 *
 * PrismaModule is @Global — it provides database access to every domain module
 * without each having to import it. The domain modules are scaffolds at this
 * point; their controllers/services are filled in by their dedicated tasks.
 */
@Module({
  imports: [
    PrismaModule,
    CommonModule,
    AuthModule,
    WorkspaceModule,
    ClientModule,
    FilingModule,
    WorkflowModule,
    DocumentModule,
    NotificationModule,
    LlmModule,
    AgentModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
