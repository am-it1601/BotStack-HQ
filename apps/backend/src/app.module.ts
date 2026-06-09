import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

/**
 * Root application module. Domain modules (filing, client, workflow,
 * notification, document, llm, audit) are registered here as they are built —
 * see ADD §04 Module Structure.
 *
 * PrismaModule is global — it provides database access to every domain module.
 */
@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
