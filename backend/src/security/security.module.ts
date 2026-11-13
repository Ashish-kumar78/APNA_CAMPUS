import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { DynamicQrService } from './dynamic-qr.service';
import { GateAccessDecisionService } from './gate-access-decision.service';

@Module({
  imports: [PrismaModule],
  controllers: [SecurityController],
  providers: [SecurityService, DynamicQrService, GateAccessDecisionService],
  exports: [SecurityService, DynamicQrService, GateAccessDecisionService],
})
export class SecurityModule {}

