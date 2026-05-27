import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root application module. Domain modules (filing, client, workflow,
 * notification, document, llm, audit) are registered here as they are built —
 * see ADD §04 Module Structure.
 */
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
