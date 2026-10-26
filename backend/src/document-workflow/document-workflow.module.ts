import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentWorkflowService } from './document-workflow.service';
import { DocumentWorkflowController } from './document-workflow.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentWorkflowController],
  providers: [DocumentWorkflowService],
  exports: [DocumentWorkflowService],
})
export class DocumentWorkflowModule {}
