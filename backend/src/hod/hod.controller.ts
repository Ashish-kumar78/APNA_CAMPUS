import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HodService } from './hod.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

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
    this.checkHodAccess(user);
    return this.hodService.getDashboard(deptCode || user.department || 'CSE');
  }

  @Get('approval-queue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get continuous internal assessment approval queue' })
  async getApprovalQueue(@CurrentUser() user: any) {
    this.checkHodAccess(user);
    return this.hodService.getApprovalQueue();
  }

  @Post('approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve marks submission' })
  async approveMarks(@CurrentUser() user: any, @Body() body: { id: string }) {
    this.checkHodAccess(user);
    return this.hodService.approveMarks(body.id, user.name || user.identifier);
  }

  @Post('reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject marks submission with mandatory reason' })
  async rejectMarks(@CurrentUser() user: any, @Body() body: { id: string; rejectionReason: string }) {
    this.checkHodAccess(user);
    return this.hodService.rejectMarks(body.id, body.rejectionReason, user.name || user.identifier);
  }

  @Post('unlock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Controlled reopening of approved marks register' })
  async unlockMarks(@CurrentUser() user: any, @Body() body: { id: string; reason?: string }) {
    this.checkHodAccess(user);
    return this.hodService.unlockMarks(body.id, body.reason, user.name || user.identifier);
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
    this.checkHodAccess(user);
    return this.hodService.getAuditLogs();
  }
}
