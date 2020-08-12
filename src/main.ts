import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { join } from 'path';

import { AppModule } from './app.module';

import { AllExceptionFilter } from './common/filters/all.exception.filter';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();
  app.useGlobalFilters(new AllExceptionFilter());
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    send: { extensions: ['json'] },
  });
  setupSwagger(app);
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Localization API')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth('Authorization', 'header')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
}

bootstrap();
