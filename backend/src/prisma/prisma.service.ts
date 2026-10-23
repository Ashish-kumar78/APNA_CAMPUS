import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully via Prisma.');
    } catch (error) {
      this.logger.error('Could not connect to the configured database. Please check DATABASE_URL.');
      this.logger.error(error);
      this.logger.warn('➡️ The HTTP server is continuing to run to respond to health checks. Fix DATABASE_URL in Render dashboard.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

