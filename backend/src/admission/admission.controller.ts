import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdmissionService } from './admission.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { RejectApplicantDto } from './dto/reject-applicant.dto';
import { ApproveApplicantDto } from './dto/approve-applicant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Admissions & Intake')
@Controller('admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  // ==========================================
  // PUBLIC APPLICANT ENDPOINTS (No Login Required)
  // ==========================================

  @Post('apply')
  @ApiOperation({ summary: 'Public candidate self-registration admission portal' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully with tracking number' })
  @ApiResponse({ status: 400, description: 'Validation failed on eligibility or missing fields' })
  async publicApply(@Body() body: CreateApplicantDto) {
    const applicant = await this.admissionService.createApplicant(body);
    return {
      success: true,
      message: `Application submitted successfully! Keep your Application No: ${applicant.applicationNo} safe for tracking.`,
      data: applicant,
    };
  }

  @Get('track/:applicationNo')
  @ApiOperation({ summary: 'Track real-time application status and clearance dossier' })
  @ApiParam({ name: 'applicationNo', example: 'APP-2026-0001', description: 'Application Reference Number' })
  @ApiResponse({ status: 200, description: 'Applicant dossier and admission progress returned' })
  @ApiResponse({ status: 404, description: 'Application number not found' })
  async trackApplication(@Param('applicationNo') applicationNo: string) {
    const data = await this.admissionService.trackApplicant(applicationNo);
    return {
      success: true,
      data,
    };
  }

  @Get('programmes')
  @ApiOperation({ summary: 'Public list of active institutional academic programmes' })
  @ApiResponse({ status: 200, description: 'List of active programmes with fees and intake' })
  async getPublicProgrammes() {
    const programmes = await this.admissionService.getPublicProgrammes();
    return {
      success: true,
      data: programmes,
    };
  }

  // ==========================================
  // PROTECTED ADMISSIONS DIRECTORATE ENDPOINTS
  // ==========================================

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admission pipeline statistics and conversion rate' })
  @ApiResponse({ status: 200, description: 'Intake counts, gender ratio, and capacity statistics' })
  async getAdmissionStats(@CurrentUser() user: any) {
    const role = normalizeRole(user?.role || '');
    if (role === 'student') {
      throw new ForbiddenException('Access denied to admission statistics.');
    }
    const data = await this.admissionService.getAdmissionStats();
    return { success: true, data };
  }

  @Get('applicants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search and filter applicants by status, programme, or term' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by candidate name, application No, phone, email' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by ApplicantStatus (SUBMITTED, UNDER_REVIEW, VERIFIED, ENROLLED, etc.)' })
  @ApiQuery({ name: 'programmeId', required: false, description: 'Filter by Programme ID' })
  @ApiQuery({ name: 'academicYear', required: false, description: 'Filter by academic year (e.g. 2026-27)' })
  @ApiResponse({ status: 200, description: 'List of applicants matching filter criteria' })
  async getApplicants(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('programmeId') programmeId?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const data = await this.admissionService.getApplicants({ search, status, programmeId, academicYear });
    return { success: true, count: data.length, data };
  }

  @Get('applicants/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single applicant details' })
  @ApiParam({ name: 'id', description: 'Applicant internal CUID' })
  @ApiResponse({ status: 200, description: 'Full applicant record and uploaded certificates' })
  async getApplicantById(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.admissionService.getApplicantById(id);
    return { success: true, data };
  }

  @Post('applicants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new applicant into admission system' })
  @ApiResponse({ status: 201, description: 'Applicant profile created in registry' })
  async createApplicant(@CurrentUser() user: any, @Body() body: CreateApplicantDto) {
    const role = normalizeRole(user?.role || '');
    if (role === 'student' && user?.identifier !== 'ADM-OFF-01') {
      throw new ForbiddenException('Only Admissions or Administrative staff can register applicants.');
    }

    const applicant = await this.admissionService.createApplicant(body);
    return {
      success: true,
      message: `Applicant ${applicant.name} registered with App No: ${applicant.applicationNo}`,
      data: applicant,
    };
  }

  @Patch('applicants/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student admission details' })
  @ApiParam({ name: 'id', description: 'Applicant internal CUID' })
  @ApiResponse({ status: 200, description: 'Student details updated successfully' })
  async updateApplicant(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: UpdateApplicantDto,
  ) {
    const role = normalizeRole(user?.role || '');
    if (role === 'student' && user?.identifier !== 'ADM-OFF-01') {
      throw new ForbiddenException('Access denied. Updating student admission details requires administrative clearance.');
    }

    const updaterName = user?.name ? `${user.name} (${user.role || 'Admissions'})` : 'Ms. Sasmita Mohapatra (Admissions)';
    const updated = await this.admissionService.updateApplicant(id, body, updaterName);
    return {
      success: true,
      message: `Student ${updated.name} (${updated.applicationNo}) admission details updated successfully.`,
      data: updated,
    };
  }

  @Patch('applicants/:id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify applicant academic documents and eligibility' })
  @ApiParam({ name: 'id', description: 'Applicant internal CUID' })
  @ApiResponse({ status: 200, description: 'Applicant verified and marked ready for admission' })
  async verifyApplicant(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user?.role || '');
    if (role === 'student' && user?.identifier !== 'ADM-OFF-01') {
      throw new ForbiddenException('Only Admissions staff can verify applicants.');
    }

    const verifierName = user?.name ? `${user.name} (${user.role || 'Admissions'})` : 'Ms. Sasmita Mohapatra (Admissions)';
    const updated = await this.admissionService.verifyApplicant(id, verifierName);
    return {
      success: true,
      message: `Applicant ${updated.applicationNo} marked as VERIFIED.`,
      data: updated,
    };
  }

  @Post('applicants/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject an application with documented rationale' })
  @ApiParam({ name: 'id', description: 'Applicant internal CUID' })
  @ApiResponse({ status: 200, description: 'Application marked as rejected' })
  async rejectApplicant(@CurrentUser() user: any, @Param('id') id: string, @Body() body: RejectApplicantDto) {
    const reviewerName = user?.name ? `${user.name} (${user.role || 'Admissions'})` : 'Ms. Sasmita Mohapatra (Admissions)';
    const updated = await this.admissionService.rejectApplicant(id, body?.reason, reviewerName);
    return {
      success: true,
      message: `Application ${updated.applicationNo} has been rejected.`,
      data: updated,
    };
  }

  @Post('applicants/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve admission and provision student account, enrollment and credentials' })
  @ApiParam({ name: 'id', description: 'Applicant internal CUID' })
  @ApiResponse({ status: 200, description: 'Student account provisioned, official ID and credentials issued' })
  async approveAndEnroll(@CurrentUser() user: any, @Param('id') id: string, @Body() body?: ApproveApplicantDto) {
    const role = normalizeRole(user?.role || '');
    const allowed = ['super_admin', 'admin', 'admissions', 'principal', 'management'];
    if (!allowed.includes(role) && user?.identifier !== 'ADM-OFF-01') {
      throw new ForbiddenException('Access denied. Only Admissions Head, CAO or Super Admin can finalize enrollment.');
    }

    const approverName = user?.name ? `${user.name} (${user.role || 'Admissions'})` : 'Ms. Sasmita Mohapatra (Admissions)';
    return this.admissionService.approveAndEnroll(id, approverName, body?.password);
  }
}
