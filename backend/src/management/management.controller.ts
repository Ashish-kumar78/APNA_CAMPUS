import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ManagementService, ProposalDecisionDto } from './management.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Management & Governance Portal')
@Controller('management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  private checkManagementAccess(user: any) {
    const role = normalizeRole(user?.role);
    const allowed = ['management', 'super_admin', 'principal'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException(
        'Access denied. Only Governing Body, Management, or Executive Leadership can access institutional governance intelligence.'
      );
    }
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get institution-wide executive KPIs and YoY comparisons' })
  async getOverview(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear?: string,
    @Query('semester') semester?: string,
  ) {
    this.checkManagementAccess(user);
    return this.managementService.getOverview(academicYear, semester);
  }

  @Get('executive-insights')
  @ApiOperation({ summary: 'Get rule-based institutional executive alerts & insights' })
  async getExecutiveInsights(@CurrentUser() user: any) {
    this.checkManagementAccess(user);
    return this.managementService.getExecutiveInsights();
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get comparative department strength, academic, and financial metrics' })
  async getDepartments(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear?: string,
    @Query('semester') semester?: string,
    @Query('department') department?: string,
  ) {
    this.checkManagementAccess(user);
    return this.managementService.getDepartments(academicYear, semester, department);
  }

  @Get('finance')
  @ApiOperation({ summary: 'Get institutional fee realization, revenue breakdown, and budget planning' })
  async getFinancialOverview(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear?: string,
  ) {
    this.checkManagementAccess(user);
    return this.managementService.getFinancialOverview(academicYear);
  }

  @Get('placements')
  @ApiOperation({ summary: 'Get institutional recruitment drives and placement conversion analytics' })
  async getPlacementOverview(@CurrentUser() user: any) {
    this.checkManagementAccess(user);
    return this.managementService.getPlacementOverview();
  }

  @Get('approvals')
  @ApiOperation({ summary: 'Get Governing Body strategic proposals approval queue' })
  async getApprovals(@CurrentUser() user: any) {
    this.checkManagementAccess(user);
    return this.managementService.getApprovals();
  }

  @Post('approvals/:id/decision')
  @ApiOperation({ summary: 'Approve, Reject, or Return strategic proposal for revision' })
  async decideApproval(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ProposalDecisionDto,
  ) {
    this.checkManagementAccess(user);
    return this.managementService.decideApproval(id, dto, {
      id: user.id,
      name: user.name,
      role: user.role,
      identifier: user.identifier,
    });
  }

  @Get('governance')
  @ApiOperation({ summary: 'Get regulatory compliance, institutional notices, and governance milestones' })
  async getGovernanceOverview(@CurrentUser() user: any) {
    this.checkManagementAccess(user);
    return this.managementService.getGovernanceOverview();
  }

  @Get('exceptions')
  @ApiOperation({ summary: 'Get centralized institutional risk and exception monitoring dashboard' })
  async getExceptions(@CurrentUser() user: any) {
    this.checkManagementAccess(user);
    return this.managementService.getExceptions();
  }

  @Get('audit-trail')
  @ApiOperation({ summary: 'Get audit logs for management decisions and governance activities' })
  async getAuditTrail(
    @CurrentUser() user: any,
    @Query('search') search?: string,
  ) {
    this.checkManagementAccess(user);
    return this.managementService.getAuditTrail(search);
  }

  @Post('audit-trail/log')
  @ApiOperation({ summary: 'Log authorized management activity (e.g. report export, notice acknowledgement)' })
  async logActivity(
    @CurrentUser() user: any,
    @Body() body: { action: string; details: string },
  ) {
    this.checkManagementAccess(user);
    return this.managementService.logActivity({
      action: body.action,
      details: body.details,
      user,
    });
  }
}
