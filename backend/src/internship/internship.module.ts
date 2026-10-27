import { Module } from '@nestjs/common';
import { InternshipController } from './internship.controller';
import { InternshipService } from './internship.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InternshipController],
  providers: [InternshipService],
  exports: [InternshipService],
})
export class InternshipModule {}
