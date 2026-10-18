import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
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

  @Get('stats')
  @ApiOperation({ summary: 'Get admission pipeline statistics and conversion rate' })
  async getAdmissionStats(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'management', 'principal', 'admin', 'admissions'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied to admission statistics.');
    }
    const data = await this.admissionService.getAdmissionStats();
    return { success: true, data };
  }

  @Get('applicants')
  @ApiOperation({ summary: 'Search and filter applicants by status, programme, or term' })
  async getApplicants(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('programmeId') programmeId?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'management', 'principal', 'admin', 'admissions'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied. Admission records require administrative clearance.');
    }

    const data = await this.admissionService.getApplicants({ search, status, programmeId, academicYear });
    return { success: true, count: data.length, data };
  }

  @Get('applicants/:id')
  @ApiOperation({ summary: 'Get single applicant details' })
  async getApplicantById(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'management', 'principal', 'admin', 'admissions'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }

    const data = await this.admissionService.getApplicantById(id);
    return { success: true, data };
  }

  @Post('applicants')
  @ApiOperation({ summary: 'Register a new applicant into admission system' })
  async createApplicant(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'admin', 'admissions'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Only Admissions or Administrative staff can register applicants.');
    }

    const applicant = await this.admissionService.createApplicant(body);
    return {
      success: true,
      message: `Applicant ${applicant.name} registered with App No: ${applicant.applicationNo}`,
      data: applicant,
    };
  }

  @Patch('applicants/:id/verify')
  @ApiOperation({ summary: 'Verify applicant academic documents and eligibility' })
  async verifyApplicant(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'admin', 'admissions'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Only Admissions staff can verify applicants.');
    }

    const verifierName = `${user.name} (${user.role})`;
    const updated = await this.admissionService.verifyApplicant(id, verifierName);
    return {
      success: true,
      message: `Applicant ${updated.applicationNo} marked as VERIFIED.`,
      data: updated,
    };
  }

  @Post('applicants/:id/reject')
  @ApiOperation({ summary: 'Reject an application with documented rationale' })
  async rejectApplicant(@CurrentUser() user: any, @Param('id') id: string, @Body('reason') reason: string) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'admin', 'admissions', 'principal'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }

    const reviewerName = `${user.name} (${user.role})`;
    const updated = await this.admissionService.rejectApplicant(id, reason || 'Did not meet admission criteria', reviewerName);
    return {
      success: true,
      message: `Application ${updated.applicationNo} has been rejected.`,
      data: updated,
    };
  }

  @Post('applicants/:id/approve')
  @ApiOperation({ summary: 'Approve admission and provision student account, enrollment and activation link' })
  async approveAndEnroll(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'admin', 'admissions', 'principal'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied. Only Admissions Head, CAO or Super Admin can finalize enrollment.');
    }

    const approverName = `${user.name} (${user.role})`;
    return this.admissionService.approveAndEnroll(id, approverName);
  }
}
