import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintsService, ComplaintFilter } from './complaints.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Anonymous Complaints & Grievance Management')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  // ============================================================================
  // PUBLIC / STUDENT ENDPOINTS (Zero identity tracking)
  // ============================================================================

  @Get('options')
  @ApiOperation({ summary: 'Get complaint categories, faculty list, and subjects for submission form' })
  getOptions() {
    return { success: true, data: this.complaintsService.getOptions() };
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit anonymous student complaint with zero-knowledge identity masking' })
  async submitComplaint(@Body() body: any) {
    const result = await this.complaintsService.submitComplaint(body);
    return result;
  }

  @Get('track/:trackingId')
  @ApiOperation({ summary: 'Track complaint progress, responses, and HOD review status by tracking ID' })
  async trackComplaint(@Param('trackingId') trackingId: string) {
    const data = await this.complaintsService.trackComplaint(trackingId);
    return { success: true, data };
  }

  // ============================================================================
  // FACULTY DASHBOARD ENDPOINTS
  // ============================================================================

  @Get('faculty')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complaints assigned to authorized faculty member' })
  async getFacultyComplaints(
    @CurrentUser() user: any,
    @Query('status') status?: string
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['faculty', 'hod', 'super_admin', 'principal'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Role ${user.role} is not authorized to access faculty complaints.`);
    }

    const facultyName = user.name || user.identifier || 'Dr. S. Mohanty';
    const data = await this.complaintsService.getFacultyComplaints(facultyName, status);
    return { success: true, count: data.length, data };
  }

  @Get('faculty/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full complaint details for faculty review (anonymous complainant)' })
  async getFacultyComplaintById(
    @CurrentUser() user: any,
    @Param('id') id: string
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['faculty', 'hod', 'super_admin', 'principal'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied.`);
    }

    const facultyName = user.name || user.identifier || 'Dr. S. Mohanty';
    const data = await this.complaintsService.getFacultyComplaintById(id, facultyName);
    return { success: true, data };
  }

  @Post('faculty/:id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit formal response and proposed corrective action' })
  async submitFacultyResponse(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { responseComment: string; proposedAction?: string; resolutionSummary?: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['faculty', 'hod', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied. Only authorized faculty can submit complaint responses.`);
    }

    const facultyUser = {
      id: user.id || user.identifier,
      name: user.name || user.identifier || 'Dr. S. Mohanty',
      designation: user.designation || 'Associate Professor'
    };

    return this.complaintsService.submitFacultyResponse(id, facultyUser, body);
  }

  @Put('faculty/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update complaint status with audit remarks' })
  async updateComplaintStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; remarks?: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['faculty', 'hod', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied.`);
    }

    const facultyUser = {
      name: user.name || user.identifier || 'Dr. S. Mohanty',
      role: role.toUpperCase()
    };

    return this.complaintsService.updateComplaintStatus(id, facultyUser, body.status, body.remarks);
  }

  // ============================================================================
  // HOD MONITORING & REVIEW ENDPOINTS
  // ============================================================================

  @Get('hod')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department-wide complaints with multi-criteria filters for HOD' })
  async getHodComplaints(
    @CurrentUser() user: any,
    @Query() query: ComplaintFilter
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hod', 'principal', 'management', 'super_admin', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Role ${user.role} is not authorized for HOD grievance monitoring.`);
    }

    const deptCode = user.departmentCode || user.deptCode || 'CSE';
    const data = await this.complaintsService.getHodComplaints(deptCode, query);
    return { success: true, count: data.length, data };
  }

  @Get('hod/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get HOD complaint analytics, recurrence trends, and turnaround metrics' })
  async getHodAnalytics(
    @CurrentUser() user: any,
    @Query('deptCode') deptCode?: string
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hod', 'principal', 'management', 'super_admin', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied.`);
    }

    const targetDept = deptCode || user.departmentCode || user.deptCode || 'CSE';
    const data = await this.complaintsService.getHodAnalytics(targetDept);
    return { success: true, data };
  }

  @Post('hod/:id/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record HOD evaluation, adequacy review, clarification request, or escalation' })
  async reviewComplaintByHod(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hod', 'principal', 'management', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied. Only Head of Department or Principal can record grievance reviews.`);
    }

    const hodUser = {
      id: user.id || user.identifier,
      name: user.name || 'Dr. P. K. Pattnaik'
    };

    return this.complaintsService.reviewComplaintByHod(id, hodUser, body);
  }
}
