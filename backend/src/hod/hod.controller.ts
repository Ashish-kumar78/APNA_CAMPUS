import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HodService } from './hod.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';
import { HodQueueActionDto, HodRejectMarksDto, HodUnlockMarksDto } from './hod.dto';

@ApiTags('HOD Academic Governance')
@Controller('hod')
export class HodController {
  constructor(private readonly hodService: HodService) {}

  private checkHodAccess(user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'management', 'hod', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied. Role ${user.role} is not authorized for HOD Department Governance.`);
    }
    return role;
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time department command centre KPIs and analytics' })
  async getDashboard(@CurrentUser() user: any, @Query('deptCode') deptCode?: string) {
    const role = this.checkHodAccess(user);
    const scope = this.reviewScope(user, role);
    if (role === 'hod' && deptCode && !scope.departments.includes(deptCode)) {
      throw new ForbiddenException('HOD dashboard is limited to the assigned department.');
    }
    const selectedDept = role === 'hod' ? (user.hod?.deptCode || scope.departments[0]) : (deptCode || user.department || 'CSE');
    return this.hodService.getDashboard(selectedDept);
  }

  @Get('approval-queue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get continuous internal assessment approval queue' })
  async getApprovalQueue(@CurrentUser() user: any) {
    const role = this.checkHodAccess(user);
    return this.hodService.getApprovalQueue(this.reviewScope(user, role));
  }

  @Post('approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve marks submission' })
  async approveMarks(@CurrentUser() user: any, @Body() body: HodQueueActionDto) {
    const role = this.checkHodAccess(user);
    return this.hodService.approveMarks(body.id, {
      role,
      reviewer: user.name || user.identifier,
      departments: this.reviewScope(user, role).departments,
    });
  }

  @Post('reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject marks submission with mandatory reason' })
  async rejectMarks(@CurrentUser() user: any, @Body() body: HodRejectMarksDto) {
    const role = this.checkHodAccess(user);
    return this.hodService.rejectMarks(body.id, body.rejectionReason, {
      role,
      reviewer: user.name || user.identifier,
      departments: this.reviewScope(user, role).departments,
    });
  }

  @Post('unlock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Controlled reopening of approved marks register' })
  async unlockMarks(@CurrentUser() user: any, @Body() body: HodUnlockMarksDto) {
    const role = this.checkHodAccess(user);
    return this.hodService.unlockMarks(body.id, body.reason, {
      role,
      reviewer: user.name || user.identifier,
      departments: this.reviewScope(user, role).departments,
    });
  }

  @Get('at-risk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department at-risk students registry' })
  async getAtRiskStudents(@CurrentUser() user: any) {
    this.checkHodAccess(user);
    return this.hodService.getAtRiskStudents();
  }

  @Post('interventions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log student remedial intervention' })
  async logIntervention(@CurrentUser() user: any, @Body() body: any) {
    this.checkHodAccess(user);
    return this.hodService.logIntervention(body, user.name || user.identifier);
  }

  @Post('interventions/bulk-dispatch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk dispatch remedial mentoring notices' })
  async bulkDispatchNotices(@CurrentUser() user: any, @Body() body: { count?: number }) {
    this.checkHodAccess(user);
    return this.hodService.bulkDispatchNotices(body.count || 3, user.name || user.identifier);
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department governance audit trail' })
  async getAuditLogs(@CurrentUser() user: any) {
    const role = this.checkHodAccess(user);
    return this.hodService.getAuditLogs(this.reviewScope(user, role));
  }

  private reviewScope(user: any, role: string) {
    const departments = [...new Set([user?.hod?.deptCode, user?.hod?.department, user?.department].filter(Boolean))];
    if (role === 'hod' && !departments.length) {
      throw new ForbiddenException('A verified department assignment is required for HOD operations.');
    }
    return {
      role,
      reviewer: user?.name || user?.identifier || 'Unknown authenticated user',
      departments,
    };
  }
}
