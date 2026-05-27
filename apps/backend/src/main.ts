import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Local / container entrypoint. On AWS Lambda the application is bootstrapped
 * via `lambda.ts` (serverless-express adapter) instead.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
