import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import cookieParser from 'cookie-parser';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import compression from 'compression';
import express from 'express';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger: LoggerService = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
    ],
    credentials: false,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());
  app.use(compression());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
