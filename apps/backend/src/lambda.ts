import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import type { Handler } from 'aws-lambda';
import { AppModule } from './app.module';

/**
 * AWS Lambda entrypoint (ADD §03, §04). The NestJS application is bootstrapped
 * once per cold start and the serverless-express handler is cached across warm
 * invocations.
 */
let cachedHandler: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp }) as unknown as Handler;
}

export const handler: Handler = async (event, context, callback) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  return cachedHandler(event, context, callback);
};
