import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeRole } from '../rbac/rbac';

export type DocumentWorkflowStatus =
  | 'UPLOADED'
  | 'PENDING_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUESTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'EXPIRED';

@Injectable()
export class DocumentWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async submitDocument(input: {
    ownerUserId: string;
    title: string;
    category: string;
    purpose?: string;
    relatedEntityType: string;
    relatedEntityId: string;
    storageReference: string;
    originalFileName: string;
    status?: DocumentWorkflowStatus;
    currentVerifierUserId?: string | null;
    accessPolicy?: string;
  }) {
    const owner = await this.prisma.user.findUnique({ where: { id: input.ownerUserId } });
    if (!owner) throw new NotFoundException('Document owner not found.');

    const document = await this.prisma.documentRecord.create({
      data: {
        documentId: `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        ownerUserId: input.ownerUserId,
        title: input.title,
        category: input.category,
        purpose: input.purpose ?? 'General record',
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        storageReference: input.storageReference,
        originalFileName: input.originalFileName,
        status: (input.status ?? 'PENDING_VERIFICATION') as any,
        currentVerifierId: input.currentVerifierUserId ?? null,
        accessPolicy: input.accessPolicy ?? 'ROLE_BASED',
        version: 1,
      },
      include: {
        ownerUser: true,
        currentVerifier: true,
        versions: true,
      },
    });

    await this.prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        fileName: input.originalFileName,
        storageReference: input.storageReference,
        uploadedByUserId: input.ownerUserId,
        status: document.status,
      },
    });

    await this.prisma.documentAuditEntry.create({
      data: {
        documentId: document.id,
        actorUserId: input.ownerUserId,
        action: 'UPLOADED',
        previousStatus: null,
        newStatus: document.status,
        note: 'Document uploaded for verification.',
      },
    });

    return document;
  }

  async getQueue({ verifierUserId, verifierRole, category, status }: {
    verifierUserId?: string;
    verifierRole?: string;
    category?: string;
    status?: string;
  }) {
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    if (verifierUserId) {
      where.currentVerifierId = verifierUserId;
    } else if (verifierRole) {
      const normalized = normalizeRole(verifierRole);
      if (normalized === 'admin' || normalized === 'super_admin') {
        where.status = { in: ['PENDING_VERIFICATION', 'UNDER_REVIEW', 'CORRECTION_REQUESTED'] };
      }
    }

    return this.prisma.documentRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        ownerUser: true,
        currentVerifier: true,
        versions: true,
        auditEntries: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async reviewDocument(input: {
    documentId: string;
    reviewerUserId: string;
    action: 'VERIFY' | 'REJECT' | 'REQUEST_CORRECTION' | 'ESCALATE';
    reason?: string;
    nextVerifierUserId?: string | null;
  }) {
    const document = await this.prisma.documentRecord.findUnique({
      where: { id: input.documentId },
      include: { ownerUser: true, currentVerifier: true, versions: true },
    });

    if (!document) throw new NotFoundException('Document not found.');

    const reviewer = await this.prisma.user.findUnique({ where: { id: input.reviewerUserId } });
    if (!reviewer) throw new NotFoundException('Reviewer not found.');

    const actorRole = normalizeRole(reviewer.role);
    const authorizedRoles = ['super_admin', 'admin', 'principal', 'management', 'hod', 'faculty', 'accounts'];
    if (!authorizedRoles.includes(actorRole)) {
      throw new ForbiddenException('This user is not authorized to review institutional documents.');
    }

    if (document.ownerUserId === input.reviewerUserId && actorRole !== 'super_admin') {
      throw new ForbiddenException('A user cannot verify their own document submission.');
    }

    let nextStatus: DocumentWorkflowStatus = 'PENDING_VERIFICATION';
    let decision = 'PENDING';

    switch (input.action) {
      case 'VERIFY':
        nextStatus = 'VERIFIED';
        decision = 'VERIFIED';
        break;
      case 'REJECT':
        nextStatus = 'REJECTED';
        decision = 'REJECTED';
        break;
      case 'REQUEST_CORRECTION':
        nextStatus = 'CORRECTION_REQUESTED';
        decision = 'CORRECTION_REQUESTED';
        break;
      case 'ESCALATE':
        nextStatus = 'UNDER_REVIEW';
        decision = 'ESCALATED';
        break;
      default:
        throw new BadRequestException('Unsupported document review action.');
    }

    const updated = await this.prisma.documentRecord.update({
      where: { id: input.documentId },
      data: {
        status: nextStatus as any,
        reviewerDecision: decision,
        reason: input.reason ?? 'No reason provided.',
        decisionAt: new Date(),
        currentVerifierId: input.nextVerifierUserId ?? input.reviewerUserId,
      },
      include: {
        ownerUser: true,
        currentVerifier: true,
        versions: true,
      },
    });

    await this.prisma.documentAuditEntry.create({
      data: {
        documentId: updated.id,
        actorUserId: input.reviewerUserId,
        action: input.action,
        note: input.reason ?? 'No reason provided.',
        previousStatus: document.status,
        newStatus: updated.status,
      },
    });

    return updated;
  }

  async createApprovalWorkflow(input: {
    workflowType: string;
    linkedEntityType: string;
    linkedEntityId: string;
    ownerUserId: string;
    currentApproverUserId?: string | null;
    currentApproverRole?: string | null;
    threshold?: number;
    dueAt?: Date | null;
    documentId?: string | null;
  }) {
    const owner = await this.prisma.user.findUnique({ where: { id: input.ownerUserId } });
    if (!owner) throw new NotFoundException('Workflow owner not found.');

    return this.prisma.approvalWorkflow.create({
      data: {
        workflowType: input.workflowType,
        linkedEntityType: input.linkedEntityType,
        linkedEntityId: input.linkedEntityId,
        currentStep: 'SUBMISSION',
        currentApproverUserId: input.currentApproverUserId ?? null,
        currentApproverRole: input.currentApproverRole ?? null,
        status: 'PENDING',
        threshold: input.threshold ?? 1,
        dueAt: input.dueAt ?? null,
        ownerUserId: input.ownerUserId,
        documentId: input.documentId ?? null,
      },
    });
  }

  async resolveApprovalWorkflow(input: {
    workflowId: string;
    actorUserId: string;
    action: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUESTED' | 'ESCALATED';
    note?: string;
  }) {
    const workflow = await this.prisma.approvalWorkflow.findUnique({
      where: { id: input.workflowId },
      include: { ownerUser: true, events: true },
    });

    if (!workflow) throw new NotFoundException('Approval workflow not found.');

    const actor = await this.prisma.user.findUnique({ where: { id: input.actorUserId } });
    if (!actor) throw new NotFoundException('Actor not found.');

    const statusMap = {
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      CORRECTION_REQUESTED: 'CORRECTION_REQUESTED',
      ESCALATED: 'ESCALATED',
    } as const;

    const updated = await this.prisma.approvalWorkflow.update({
      where: { id: input.workflowId },
      data: {
        status: statusMap[input.action] as any,
        decision: input.action,
        reason: input.note ?? 'No reason provided.',
        decisionAt: new Date(),
        currentStep: input.action === 'APPROVED' ? 'FINALIZED' : 'REVIEW',
      },
    });

    await this.prisma.approvalWorkflowEvent.create({
      data: {
        workflowId: input.workflowId,
        actorUserId: input.actorUserId,
        action: input.action,
        note: input.note ?? 'No note provided.',
      },
    });

    return updated;
  }
}
