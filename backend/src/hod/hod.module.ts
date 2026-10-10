import { Module } from '@nestjs/common';
import { HodController } from './hod.controller';
import { HodService } from './hod.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HodController],
  providers: [HodService],
  exports: [HodService],
})
export class HodModule {}
