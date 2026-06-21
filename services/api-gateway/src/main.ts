import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { setupTelemetry } from './telemetry/telemetry';

async function bootstrap() {
  // Boot OpenTelemetry before anything else
  setupTelemetry();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3001'],
    credentials: true,
  });

  // API versioning
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  // Global pipes & filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VisioneSoft API')
    .setDescription('Enterprise iGaming Platform — v1 API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('aggregator')
    .addTag('b2c')
    .addTag('b2b')
    .addTag('finance')
    .addTag('media')
    .addTag('analytics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 API Gateway running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

void bootstrap();
