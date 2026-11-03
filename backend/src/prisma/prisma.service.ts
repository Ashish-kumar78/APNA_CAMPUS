import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 8;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        if (attempt > 1) {
          this.logger.log(`🔄 Retrying database connection (attempt ${attempt}/${maxRetries})...`);
        }
        await this.$connect();
        this.logger.log('✅ PostgreSQL Database connected successfully via Prisma.');
        return; // success — exit the loop
      } catch (error) {
        if (attempt >= maxRetries) {
          this.logger.error('⚠️ Could not connect to PostgreSQL database after ' + maxRetries + ' attempts. Please check DATABASE_URL.');
          this.logger.error(error);
          this.logger.warn('➡️ The HTTP server is continuing to run to respond to health checks. Fix DATABASE_URL in Render dashboard.');
          return;
        }
        // Neon free-tier cold start can take several seconds — wait with exponential backoff
        const delayMs = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
        this.logger.warn(`⏳ Database connection attempt ${attempt} failed. Neon may be waking from cold start. Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

