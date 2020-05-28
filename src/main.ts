import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

const port = process.env.PORT || 8080;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useStaticAssets('uploads');
  await app.listen(port);
  Logger.log(`Currently running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
