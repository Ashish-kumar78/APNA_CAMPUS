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
import { CreateApplicantDto, RejectApplicantDto } from './admission.dto';

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
  async createApplicant(@CurrentUser() user: any, @Body() body: CreateApplicantDto) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'admin', 'admissions'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Only Admissions or Administrative staff can register applicants.');
    }

    const applicant = await this.admissionService.createApplicant(body, {
      name: user.name || user.identifier,
      role: user.role,
    });
    return {
      success: true,
      message: `Applicant ${applicant.name} registered with App No: ${applicant.applicationNo}`,
      data: applicant,
    };
  }

  @Patch('applicants/:id/verify')
  @ApiOperation({ summary: 'Record an admissions eligibility review' })
  async verifyApplicant(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'admin', 'admissions'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Only Admissions staff can verify applicants.');
    }

    const updated = await this.admissionService.verifyApplicant(id, {
      name: user.name || user.identifier,
      role: user.role,
    });
    return {
      success: true,
      message: 'Applicant eligibility verified.',
      data: updated,
    };
  }

  @Post('applicants/:id/reject')
  @ApiOperation({ summary: 'Reject an application with documented rationale' })
  async rejectApplicant(@CurrentUser() user: any, @Param('id') id: string, @Body() body: RejectApplicantDto) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'admin', 'admissions', 'principal'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }

    const updated = await this.admissionService.rejectApplicant(id, body.reason, {
      name: user.name || user.identifier,
      role: user.role,
    });
    return {
      success: true,
      message: 'Application rejected.',
      data: updated,
    };
  }

  @Post('applicants/:id/approve')
  @ApiOperation({ summary: 'Approve admission and create student and enrollment records' })
  async approveAndEnroll(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'admin', 'admissions', 'principal'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied. Only Admissions Head, CAO or Super Admin can finalize enrollment.');
    }

    return this.admissionService.approveAndEnroll(id, {
      id: user.id,
      name: user.name || user.identifier,
      role: user.role,
    });
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
