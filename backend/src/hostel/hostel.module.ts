import { Module } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { HostelController } from './hostel.controller';
import { AiAssignmentService } from './ai-assignment.service';

@Module({
  controllers: [HostelController],
  providers: [HostelService, AiAssignmentService],
  exports: [HostelService, AiAssignmentService],
})
export class HostelModule {}

