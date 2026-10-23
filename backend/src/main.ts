import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  // Pre-flight check
  if (!process.env.DATABASE_URL) {
    logger.error('\n❌ [CRITICAL CONFIG ERROR] DATABASE_URL environment variable is missing!');
    logger.error('   Configure DATABASE_URL with the MongoDB Atlas URI in your environment.\n');
  }

  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // 1. Global API Prefix with root exclusions so GET / and GET /health are always reachable
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: '/', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
      { path: 'api', method: RequestMethod.GET },
      { path: 'api/health', method: RequestMethod.GET },
    ],
  });

  // Fallbacks on underlying Express adapter for load balancers or crawlers
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/api/fees/payment-proof', express.json({ limit: '8mb' }));
  expressApp.use('/api/hostel/complaints', express.json({ limit: '8mb' }));
  expressApp.use(express.json({ limit: '100kb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '100kb' }));
  expressApp.get('/', (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is operational.',
      api: '/api',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    });
  });
  expressApp.get('/api', (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is operational.',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    });
  });
  expressApp.get('/health', (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is healthy.',
      timestamp: new Date().toISOString(),
    });
  });
  expressApp.get('/api/health', (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      success: true,
      message: 'Apna Campus (CollegeFlow) NestJS API is healthy.',
      timestamp: new Date().toISOString(),
    });
  });

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
  const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
  ]);

  if (process.env.CLIENT_URL) {
    const urls = process.env.CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean);
    for (const configuredUrl of urls) {
      try {
        allowedOrigins.add(new URL(configuredUrl).origin);
      } catch {
        logger.warn(`Ignoring invalid CLIENT_URL origin: ${configuredUrl}`);
      }
    }
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      let parsedOrigin: URL;
      try {
        parsedOrigin = new URL(origin);
      } catch {
        return callback(null, false);
      }

      const normalizedOrigin = parsedOrigin.origin;
      const isLocalDevelopmentOrigin =
        parsedOrigin.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(parsedOrigin.hostname);

      if (allowedOrigins.has(normalizedOrigin) || isLocalDevelopmentOrigin) {
        return callback(null, true);
      }
      // Reject the browser's CORS permission without throwing an Error into
      // Nest's global exception filter (which made normal preflights look like
      // unhandled server failures).
      return callback(null, false);
    },
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
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 CollegeFlow NestJS Backend is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger Documentation is available at: http://localhost:${port}/api/docs`);
}

bootstrap();
