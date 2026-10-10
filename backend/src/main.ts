import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Environment pre-flight check
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ [CRITICAL CONFIG ERROR] DATABASE_URL environment variable is missing!');
    console.error('   Please copy backend/.env.example to backend/.env and set your PostgreSQL connection URL:');
    console.error('   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/college_management?schema=public"\n');
    process.exit(1);
  }

  // 1. Global API Prefix
  app.setGlobalPrefix('api');

  // 2. Global Validation Pipe with automatic payload transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 3. Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. CORS Configuration
  const defaultAllowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
  ];
  const clientUrl = process.env.CLIENT_URL;
  const origins = clientUrl && !defaultAllowedOrigins.includes(clientUrl)
    ? [...defaultAllowedOrigins, clientUrl]
    : defaultAllowedOrigins;

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 5. Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Apna Campus API')
    .setDescription(
      'Comprehensive REST API backend for College Management System, supporting 7 role portals (Student, Faculty, HOD, Admin, Accounts, Warden, Canteen).',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 CollegeFlow NestJS Backend is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger Documentation is available at: http://localhost:${port}/api/docs`);
}

bootstrap();
