import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Campus Administration')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get institutional dashboard KPI overview metrics' })
  async getMetrics(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied. Institutional metrics require management or administrative clearance.`);
    }

    const data = await this.adminService.getMetrics();
    return { success: true, data };
  }

  @Get('diagnostics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run genuine enterprise security and subsystem health diagnostics' })
  async getDiagnostics(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Subsystem diagnostics require administrative clearance.');
    }

    const data = await this.adminService.getDiagnostics();
    return { success: true, data };
  }

  @Get('security-alerts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get actionable security alerts and anomaly detections' })
  async getSecurityAlerts(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Security alerts require security officer clearance.');
    }

    const data = await this.adminService.getSecurityAlerts();
    return { success: true, count: data.length, data };
  }

  // --- Security Incidents ---
  @Get('incidents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security incidents with severity, status, and search filters' })
  async getIncidents(
    @CurrentUser() user: any,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'principal') {
      throw new ForbiddenException('Access denied. Security incident logs require Super Admin clearance.');
    }

    const data = await this.adminService.getIncidents(severity, status, search);
    return { success: true, count: data.length, data };
  }

  @Patch('incidents/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update incident status and add investigation notes' })
  async updateIncident(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Super Administrator can update incident resolution state.');
    }

    const data = await this.adminService.updateIncidentStatus(id, body.status, body.notes || '', user);
    return { success: true, message: `Incident ${id} updated to ${body.status}.`, data };
  }

  // --- System Logs & Monitoring ---
  @Get('system-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sanitized application & system runtime logs' })
  async getSystemLogs(
    @CurrentUser() user: any,
    @Query('level') level?: string,
    @Query('component') component?: string,
    @Query('search') search?: string,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. System logs require Super Administrator authorization.');
    }

    const data = await this.adminService.getSystemLogs(level, component, search);
    return { success: true, data };
  }

  // --- Sessions & Login Security ---
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active administrative and user sessions' })
  async getSessions(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'principal') {
      throw new ForbiddenException('Access denied. Active session directory requires security clearance.');
    }

    const data = await this.adminService.getSessions();
    return { success: true, count: data.length, data };
  }

  @Post('sessions/:id/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke and terminate an active session' })
  async revokeSession(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Super Administrator can revoke live sessions.');
    }

    const result = await this.adminService.revokeSession(id, user);
    return result;
  }

  // --- Integrations & API Management ---
  @Get('integrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get status of campus integrations and external APIs' })
  async getIntegrations(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied to integration management.');
    }

    const data = await this.adminService.getIntegrations();
    return { success: true, data };
  }

  @Post('integrations/:id/test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute connection handshake test on an integration' })
  async testIntegration(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Testing integrations requires Super Administrator privilege.');
    }

    const result = await this.adminService.testIntegration(id);
    return { success: true, data: result };
  }

  // --- User Directory Governance ---
  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get institutional user directory with filters' })
  async getUsers(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('role') roleQuery?: string,
    @Query('status') status?: string,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin' && role !== 'principal') {
      throw new ForbiddenException('Access denied to user directory.');
    }

    const data = await this.adminService.getUsers(search, roleQuery, status);
    return { success: true, count: data.length, data };
  }

  @Post('users/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate or suspend user account' })
  async updateUserStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Only Super Administrator or Campus Administrator can alter user active lifecycle.');
    }

    const updated = await this.adminService.updateUserStatus(id, body.isActive, user);
    return { success: true, message: `User status updated to ${body.isActive ? 'Active' : 'Suspended'}.`, data: updated };
  }

  @Post('users/:id/reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue one-time cryptographic password reset token' })
  async resetUserPassword(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Password reset token issuance requires administrative clearance.');
    }

    const result = await this.adminService.resetUserPassword(id, user);
    return result;
  }

  // --- Backup & Disaster Recovery ---
  @Get('backups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get backup snapshot history and retention status' })
  async getBackups(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied to backup vault.');
    }

    const data = await this.adminService.getBackups();
    return { success: true, count: data.length, data };
  }

  @Post('backups/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger manual database snapshot backup' })
  async triggerBackup(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Only Administrator can trigger immediate snapshots.');
    }

    const backup = await this.adminService.triggerBackup(user);
    return { success: true, message: 'Instant snapshot generated and encrypted in storage vault!', data: backup };
  }

  // Staff Rosters (Wardens, Security, Canteen, Support)
  @Get('staff')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get staff rosters (WARDEN, SECURITY, CANTEEN, SUPPORT)' })
  async getStaff(
    @CurrentUser() user: any,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'admin', 'principal', 'management', 'hostel', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to staff duty rosters.');
    }

    const data = await this.adminService.getStaffRoster(type, search);
    return { success: true, count: data.length, data };
  }

  @Post('staff')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add staff member to duty roster (Admin & Super Admin only)' })
  async createStaff(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Campus Admin or Super Admin can modify duty rosters.');
    }

    const staff = await this.adminService.createStaff(body);
    return { success: true, message: `Staff member ${staff.name} added to roster!`, data: staff };
  }

  @Put('staff/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff member (Admin & Super Admin only)' })
  async updateStaff(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Campus Admin or Super Admin can modify duty rosters.');
    }

    const staff = await this.adminService.updateStaff(id, body);
    return { success: true, message: `Staff member ${staff.name} updated.`, data: staff };
  }

  @Delete('staff/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove staff member from roster (Super Admin only)' })
  async deleteStaff(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Super Admin can purge staff roster records.');
    }

    await this.adminService.deleteStaff(id);
    return { success: true, message: 'Staff member removed from roster.' };
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system audit trail logs (Super Admin & Principal only)' })
  async getAuditLogs(@CurrentUser() user: any, @Query('search') search?: string) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'principal' && role !== 'admin' && role !== 'management') {
      throw new ForbiddenException('Access denied. Audit trail records require security clearance.');
    }

    const data = await this.adminService.getAuditLogs(search);
    return { success: true, count: data.length, data };
  }

  @Post('audit-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new immutable audit trail log' })
  async createAuditLog(@CurrentUser() user: any, @Body() body: any) {
    const log = await this.adminService.createAuditLog({
      ...body,
      user: user.name || user.identifier,
      role: user.role,
    });
    return { success: true, data: log };
  }

  // --- Administrative Approvals Center ---
  @Get('approvals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending high-impact administrative approval queue' })
  async getApprovals(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Approval center requires executive authorization.');
    }

    const data = await this.adminService.getApprovals();
    return { success: true, count: data.length, data };
  }

  @Post('approvals/:id/decide')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject high-impact request with mandatory justification' })
  async decideApproval(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; reason: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'principal') {
      throw new ForbiddenException('Access denied. Only Super Admin or Principal can decide governance clearances.');
    }
    if (!body.reason || body.reason.trim().length < 5) {
      throw new ForbiddenException('A mandatory justification of at least 5 characters is required for sensitive clearances.');
    }

    const result = await this.adminService.decideApproval(id, body.decision, body.reason, user);
    return { success: true, message: `Clearance request ${id} ${body.decision.toLowerCase()}.`, data: result };
  }

  // --- Disaster Recovery Restoration ---
  @Post('backups/:id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore database snapshot with authorization safety token' })
  async restoreBackup(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { confirmationCode: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Super Administrator can execute database restoration.');
    }

    const result = await this.adminService.restoreBackup(id, body.confirmationCode, user);
    return result;
  }

  // --- RBAC & Settings Persistence ---
  @Post('rbac/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update granular permission grants for a designated role' })
  async saveRbacPermissions(
    @CurrentUser() user: any,
    @Body() body: { roleKey: string; permissions: string[] },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Super Administrator can reconfigure RBAC matrix.');
    }

    const result = await this.adminService.saveRbacPermissions(body.roleKey, body.permissions, user);
    return result;
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save institutional and autonomous system configuration' })
  async saveSettings(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Institutional configuration requires administrative clearance.');
    }

    const result = await this.adminService.saveSettings(body, user);
    return result;
  }

  @Post('users/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Provision new institutional user account' })
  async createUserAccount(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Provisioning accounts requires administrative clearance.');
    }

    const result = await this.adminService.createUserAccount(body, user);
    return { success: true, message: `Account for ${result.name} provisioned successfully.`, data: result };
  }
}

