import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { execSync } from 'child_process';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  // Ensure DATABASE_URL is properly formatted with SSL for cloud hosting (Render, Supabase, Neon)
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    if (
      (dbUrl.includes('.render.com') ||
        dbUrl.includes('.supabase.co') ||
        dbUrl.includes('.neon.tech') ||
        dbUrl.includes('pooler.supabase.com')) &&
      !dbUrl.includes('sslmode=')
    ) {
      const sep = dbUrl.includes('?') ? '&' : '?';
      process.env.DATABASE_URL = `${dbUrl}${sep}sslmode=require`;
      logger.log('🔒 Cloud database detected: appended sslmode=require to connection string.');
    }
  }

  // Pre-flight check
  if (!process.env.DATABASE_URL) {
    logger.error('\n❌ [CRITICAL CONFIG ERROR] DATABASE_URL environment variable is missing!');
    logger.error('   Please configure DATABASE_URL in your Render dashboard environment variables:');
    logger.error('   DATABASE_URL="postgresql://user:pass@host:5432/college_management?sslmode=require"\n');
  } else {
    // Attempt auto-migration deploy on startup so production database tables are always created
    try {
      logger.log('🔄 Checking database schema & applying pending Prisma migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      logger.log('✅ Prisma migrations applied successfully.');
    } catch (migErr) {
      logger.warn('⚠️ Prisma migrate deploy encountered an issue or was skipped: ' + (migErr as Error)?.message);
    }
  }

  const app = await NestFactory.create(AppModule);

  // 1. Global API Prefix
  app.setGlobalPrefix('api');

  // Fallbacks for load balancers or monitoring pinging root '/' or '/health' without '/api' prefix
  const expressApp = app.getHttpAdapter().getInstance();
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
  expressApp.get('/health', (_req: any, res: any) => {
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
  const defaultAllowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
  ];

  if (process.env.CLIENT_URL) {
    const urls = process.env.CLIENT_URL.split(',').map((u) => u.trim());
    for (const u of urls) {
      if (u && !defaultAllowedOrigins.includes(u)) {
        defaultAllowedOrigins.push(u);
      }
    }
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Check explicit allowed origins
      if (defaultAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Automatically allow Vercel preview and production domains
      try {
        const hostname = new URL(origin).hostname;
        if (hostname.endsWith('.vercel.app') || hostname === 'localhost') {
          return callback(null, true);
        }
      } catch {
        // invalid URL format
      }

      // Permissive fallback so frontend deployments are never blocked by unexpected origins
      return callback(null, true);
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
