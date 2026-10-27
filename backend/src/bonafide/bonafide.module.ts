import { Module } from '@nestjs/common';
import { BonafideController } from './bonafide.controller';
import { BonafideService } from './bonafide.service';
import { BonafidePdfService } from './bonafide-pdf.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BonafideController],
  providers: [BonafideService, BonafidePdfService],
  exports: [BonafideService, BonafidePdfService],
})
export class BonafideModule {}
