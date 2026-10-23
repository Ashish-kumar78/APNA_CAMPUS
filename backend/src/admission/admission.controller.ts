import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionService } from './admission.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Admissions & Intake')
@Controller('admission')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  /**
   * Helper: verify role access
   */
  private checkAccess(user: any, allowedRoles: string[], actionDesc: string) {
    const role = normalizeRole(user.role);
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(`Access denied. ${actionDesc} requires one of: ${allowedRoles.join(', ')}.`);
    }
    return role;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get admission pipeline statistics, metrics, and priority action items' })
  async getAdmissionStats(@CurrentUser() user: any) {
    this.checkAccess(
      user,
      ['super_admin', 'management', 'principal', 'admin', 'admissions', 'hod'],
      'Viewing admission statistics'
    );
    const data = await this.admissionService.getAdmissionStats();
    return { success: true, data };
  }

  @Get('applicants')
  @ApiOperation({ summary: 'Search and filter applicants by status, stage, programme, or term' })
  async getApplicants(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('stage') stage?: string,
    @Query('programmeId') programmeId?: string,
    @Query('academicYear') academicYear?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.checkAccess(
      user,
      ['super_admin', 'management', 'principal', 'admin', 'admissions', 'hod', 'faculty'],
      'Viewing applicants'
    );

    const result = await this.admissionService.getApplicants({
      search,
      status,
      stage,
      programmeId,
      academicYear,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    return { success: true, ...result };
  }

  @Get('applicants/:id')
  @ApiOperation({ summary: 'Get single applicant details with documents, audit trail, and payment status' })
  async getApplicantById(@CurrentUser() user: any, @Param('id') id: string) {
    this.checkAccess(
      user,
      ['super_admin', 'management', 'principal', 'admin', 'admissions', 'hod', 'faculty', 'student'],
      'Viewing applicant details'
    );
    const data = await this.admissionService.getApplicantById(id);
    return { success: true, data };
  }

  @Post('applicants')
  @ApiOperation({ summary: 'Register a new applicant into admission system' })
  async createApplicant(@CurrentUser() user: any, @Body() body: any) {
    this.checkAccess(
      user,
      ['super_admin', 'admin', 'admissions'],
      'Registering applicants'
    );
    const applicant = await this.admissionService.createApplicant(body);
    return {
      success: true,
      message: `Applicant ${applicant.name} registered with App No: ${applicant.applicationNo}`,
      data: applicant,
    };
  }

  @Patch('applicants/:id/document/:docId')
  @ApiOperation({ summary: 'Verify individual document, request replacement, or reject' })
  async verifyDocument(
    @CurrentUser() user: any,
    @Param('id') applicantId: string,
    @Param('docId') docId: string,
    @Body() body: { status: 'VERIFIED' | 'REJECTED' | 'REPLACEMENT_REQUESTED' | 'UNDER_REVIEW'; remarks?: string; replacementReason?: string },
  ) {
    this.checkAccess(
      user,
      ['super_admin', 'admin', 'admissions', 'principal'],
      'Document verification'
    );
    const verifierName = `${user.name} (${user.role})`;
    const updated = await this.admissionService.verifyDocument(applicantId, docId, body, verifierName);
    return {
      success: true,
      message: `Document status updated to ${body.status}.`,
      data: updated,
    };
  }

  @Post('applicants/bulk-verify')
  @ApiOperation({ summary: 'Bulk verify documents for selected applicants' })
  async bulkVerifyDocuments(
    @CurrentUser() user: any,
    @Body('applicantIds') applicantIds: string[],
  ) {
    this.checkAccess(
      user,
      ['super_admin', 'admin', 'admissions'],
      'Bulk document verification'
    );
    const verifierName = `${user.name} (${user.role})`;
    const result = await this.admissionService.bulkVerifyDocuments(applicantIds || [], verifierName);
    return result;
  }

  @Post('applicants/:id/review')
  @ApiOperation({ summary: 'Record admission review decision (approve, reject, waitlist, under review)' })
  async reviewApplicant(
    @CurrentUser() user: any,
    @Param('id') applicantId: string,
    @Body() body: { decision: 'APPROVE' | 'REJECT' | 'WAITLIST' | 'UNDER_REVIEW'; notes?: string; reason?: string; bypassIncompleteDocs?: boolean },
  ) {
    this.checkAccess(
      user,
      ['super_admin', 'principal', 'management', 'admin', 'admissions', 'hod'],
      'Admission review and decision'
    );
    const reviewerName = `${user.name} (${user.role})`;
    const updated = await this.admissionService.reviewApplicant(applicantId, body, reviewerName);
    return {
      success: true,
      message: `Application decision updated to ${body.decision}.`,
      data: updated,
    };
  }

  @Post('applicants/:id/offer')
  @ApiOperation({ summary: 'Generate provisional admission offer letter' })
  async generateAdmissionOffer(
    @CurrentUser() user: any,
    @Param('id') applicantId: string,
    @Body() body: { validUntil?: string; conditions?: string },
  ) {
    this.checkAccess(
      user,
      ['super_admin', 'principal', 'admin', 'admissions'],
      'Issuing admission offers'
    );
    const officerName = `${user.name} (${user.role})`;
    return this.admissionService.generateAdmissionOffer(applicantId, body, officerName);
  }

  @Post('applicants/:id/offer/respond')
  @ApiOperation({ summary: 'Candidate response to offer letter (accept or decline)' })
  async respondToOffer(
    @CurrentUser() user: any,
    @Param('id') applicantId: string,
    @Body() body: { action: 'ACCEPT' | 'DECLINE'; remarks?: string },
  ) {
    // Both applicant/student and admission staff can record response
    const responderName = `${user.name} (${user.role})`;
    const updated = await this.admissionService.respondToOffer(applicantId, body, responderName);
    return {
      success: true,
      message: `Offer ${body.action === 'ACCEPT' ? 'accepted' : 'declined'} successfully.`,
      data: updated,
    };
  }

  @Post('applicants/:id/fee-confirm')
  @ApiOperation({ summary: 'Confirm admission fee deposit' })
  async confirmAdmissionFee(
    @CurrentUser() user: any,
    @Param('id') applicantId: string,
    @Body() body: { amount?: number; receiptRef: string; paymentMode?: string; remarks?: string },
  ) {
    this.checkAccess(
      user,
      ['super_admin', 'admin', 'accounts', 'admissions'],
      'Fee confirmation'
    );
    const confirmedBy = `${user.name} (${user.role})`;
    const updated = await this.admissionService.confirmAdmissionFee(applicantId, body, confirmedBy);
    return {
      success: true,
      message: `Admission fee payment confirmed. Receipt: ${body.receiptRef}`,
      data: updated,
    };
  }

  @Post('applicants/:id/enroll')
  @ApiOperation({ summary: 'Finalize institutional enrollment and provision student account' })
  async approveAndEnroll(
    @CurrentUser() user: any,
    @Param('id') applicantId: string,
    @Body() body?: { section?: string; semester?: string },
  ) {
    this.checkAccess(
      user,
      ['super_admin', 'principal', 'admin', 'admissions'],
      'Finalizing enrollment'
    );
    const approverName = `${user.name} (${user.role})`;
    return this.admissionService.approveAndEnroll(applicantId, approverName, body);
  }

  // Backwards-compatible legacy endpoints
  @Patch('applicants/:id/verify')
  async legacyVerify(@CurrentUser() user: any, @Param('id') id: string) {
    const verifierName = `${user.name} (${user.role})`;
    const updated = await this.admissionService.reviewApplicant(id, { decision: 'APPROVE', bypassIncompleteDocs: true }, verifierName);
    return { success: true, message: `Applicant verified.`, data: updated };
  }

  @Post('applicants/:id/reject')
  async legacyReject(@CurrentUser() user: any, @Param('id') id: string, @Body('reason') reason: string) {
    const reviewerName = `${user.name} (${user.role})`;
    const updated = await this.admissionService.reviewApplicant(id, { decision: 'REJECT', reason }, reviewerName);
    return { success: true, message: `Application rejected.`, data: updated };
  }

  @Post('applicants/:id/approve')
  async legacyApprove(@CurrentUser() user: any, @Param('id') id: string) {
    const approverName = `${user.name} (${user.role})`;
    return this.admissionService.approveAndEnroll(id, approverName);
  }

  // Deadlines
  @Get('deadlines')
  @ApiOperation({ summary: 'Get official admission deadlines' })
  async getDeadlines() {
    const deadlines = await this.admissionService.getAdmissionDeadlines();
    return { success: true, data: deadlines };
  }

  @Post('deadlines')
  @ApiOperation({ summary: 'Create admission deadline' })
  async createDeadline(@CurrentUser() user: any, @Body() body: any) {
    this.checkAccess(user, ['super_admin', 'principal', 'admin', 'admissions'], 'Managing deadlines');
    return this.admissionService.createAdmissionDeadline(body);
  }

  @Patch('deadlines/:id')
  @ApiOperation({ summary: 'Update admission deadline' })
  async updateDeadline(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    this.checkAccess(user, ['super_admin', 'principal', 'admin', 'admissions'], 'Managing deadlines');
    return this.admissionService.updateAdmissionDeadline(id, body);
  }

  @Delete('deadlines/:id')
  @ApiOperation({ summary: 'Delete admission deadline' })
  async deleteDeadline(@CurrentUser() user: any, @Param('id') id: string) {
    this.checkAccess(user, ['super_admin', 'principal', 'admin', 'admissions'], 'Managing deadlines');
    return this.admissionService.deleteAdmissionDeadline(id);
  }

  // Notices
  @Get('notices')
  @ApiOperation({ summary: 'Get official admission notices and circulars' })
  async getNotices() {
    const notices = await this.admissionService.getAdmissionNotices();
    return { success: true, data: notices };
  }

  @Post('notices')
  @ApiOperation({ summary: 'Publish official admission notice' })
  async createNotice(@CurrentUser() user: any, @Body() body: any) {
    this.checkAccess(user, ['super_admin', 'principal', 'admin', 'admissions'], 'Publishing admission notices');
    const publisherName = `${user.name} (${user.role})`;
    const notice = await this.admissionService.createAdmissionNotice(body, publisherName);
    return { success: true, message: 'Admission notice published.', data: notice };
  }

  // Merit List
  @Get('merit-list')
  @ApiOperation({ summary: 'Get calculated merit list and rankings' })
  async getMeritList(
    @CurrentUser() user: any,
    @Query('programmeName') programmeName?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    this.checkAccess(
      user,
      ['super_admin', 'principal', 'management', 'admin', 'admissions', 'hod', 'faculty'],
      'Viewing merit list'
    );
    const data = await this.admissionService.getMeritList({ programmeName, academicYear });
    return { success: true, data };
  }
}
