import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription('Personal income and expense tracking API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  const errorMessage = error instanceof Error ? error.stack : String(error);

  logger.error('Application failed to start', errorMessage);
  process.exit(1);
});
