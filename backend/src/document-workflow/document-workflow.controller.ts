import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { DocumentWorkflowService } from './document-workflow.service';

@ApiTags('Document Workflow')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentWorkflowController {
  constructor(private readonly service: DocumentWorkflowService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit a new document for verification and queue routing' })
  async submitDocument(@CurrentUser() user: any, @Body() body: any) {
    const result = await this.service.submitDocument({
      ownerUserId: body.ownerUserId || user.id,
      title: body.title,
      category: body.category,
      purpose: body.purpose,
      relatedEntityType: body.relatedEntityType || 'STUDENT',
      relatedEntityId: body.relatedEntityId || user.id,
      storageReference: body.storageReference,
      originalFileName: body.originalFileName,
      status: body.status,
      currentVerifierUserId: body.currentVerifierUserId,
      accessPolicy: body.accessPolicy,
    });

    return { success: true, data: result };
  }

  @Get('queue')
  @ApiOperation({ summary: 'List documents in the current verification queue' })
  async getQueue(@CurrentUser() user: any, @Query('status') status?: string, @Query('category') category?: string) {
    const result = await this.service.getQueue({
      verifierUserId: user.id,
      verifierRole: user.role,
      category,
      status,
    });

    return { success: true, count: result.length, data: result };
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Approve, reject, request correction, or escalate a document' })
  async reviewDocument(@CurrentUser() user: any, @Param('id') string: string, @Body() body: any) {
    const result = await this.service.reviewDocument({
      documentId: string,
      reviewerUserId: user.id,
      action: body.action,
      reason: body.reason,
      nextVerifierUserId: body.nextVerifierUserId,
    });

    return { success: true, data: result };
  }

  @Post('approvals')
  @ApiOperation({ summary: 'Create a shared approval workflow record for a business request' })
  async createApprovalWorkflow(@CurrentUser() user: any, @Body() body: any) {
    const result = await this.service.createApprovalWorkflow({
      workflowType: body.workflowType,
      linkedEntityType: body.linkedEntityType,
      linkedEntityId: body.linkedEntityId,
      ownerUserId: body.ownerUserId || user.id,
      currentApproverUserId: body.currentApproverUserId,
      currentApproverRole: body.currentApproverRole,
      threshold: body.threshold,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      documentId: body.documentId,
    });

    return { success: true, data: result };
  }

  @Patch('approvals/:id/resolve')
  @ApiOperation({ summary: 'Resolve a shared approval workflow' })
  async resolveApprovalWorkflow(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const result = await this.service.resolveApprovalWorkflow({
      workflowId: id,
      actorUserId: user.id,
      action: body.action,
      note: body.note,
    });

    return { success: true, data: result };
  }
}
