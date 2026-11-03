import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';
import { AdminService } from './admin.service';
import {
  CreateAdminUserDto,
  UpdateAdminUserStatusDto,
  CreateStaffRosterDto,
  UpdateStaffRosterDto,
  CreateAuditLogDto,
  UpdateIncidentDto,
  CreateIncidentDto,
  DecideApprovalDto,
  RestoreBackupDto,
  SaveRbacPermissionsDto,
  CreateFacultyDto,
  UpdateFacultyDto,
  CreateHodDto,
  UpdateHodDto,
  UpdateMarkingSchemeDto,
} from './dto';

@ApiTags('Campus Administration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Helper to resolve actor context from request if available,
   * otherwise defaults to standard administrator identity (Rule 5 compliance).
   */
  private getActor(req: any) {
    if (req?.user) {
      return req.user;
    }
    return {
      name: 'System Administrator',
      identifier: 'SYS-ADMIN-01',
      role: 'SUPER_ADMIN',
    };
  }

  // ============================================================================
  // 1. INSTITUTIONAL METRICS & KPIS
  // ============================================================================
  @Get('metrics')
  @ApiOperation({ summary: 'Get institutional dashboard KPI overview metrics' })
  async getMetrics() {
    const data = await this.adminService.getMetrics();
    return { success: true, data };
  }

  @Get('diagnostics')
  @ApiOperation({ summary: 'Run genuine enterprise security and subsystem health diagnostics' })
  async getDiagnostics() {
    const data = await this.adminService.getDiagnostics();
    return { success: true, data };
  }

  @Get('security-alerts')
  @ApiOperation({ summary: 'Get actionable security alerts and anomaly detections' })
  async getSecurityAlerts() {
    const data = await this.adminService.getSecurityAlerts();
    return { success: true, count: data.length, data };
  }

  // ============================================================================
  // 2. SECURITY INCIDENTS
  // ============================================================================
  @Get('incidents')
  @ApiOperation({ summary: 'Get security incidents with severity, status, and search filters' })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getIncidents(
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.getIncidents(severity, status, search);
    return { success: true, count: data.length, data };
  }

  @Patch('incidents/:id')
  @ApiOperation({ summary: 'Update incident status and add investigation notes' })
  async updateIncident(
    @Param('id') id: string,
    @Body() body: UpdateIncidentDto,
    @Req() req: any,
  ) {
    const actor = this.getActor(req);
    const data = await this.adminService.updateIncidentStatus(id, body, actor);
    return { success: true, message: `Incident ${id} updated to ${body.status}.`, data };
  }

  @Post('incidents')
  @ApiOperation({ summary: 'Create new security incident record' })
  async createIncident(@Body() body: CreateIncidentDto, @Req() req: any) {
    const actor = this.getActor(req);
    const data = await this.adminService.createIncident(body, actor);
    return { success: true, message: `Incident ${data.incidentCode} registered.`, data };
  }

  // ============================================================================
  // 3. SYSTEM LOGS & MONITORING
  // ============================================================================
  @Get('system-logs')
  @ApiOperation({ summary: 'Get sanitized application & system runtime logs' })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'component', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getSystemLogs(
    @Query('level') level?: string,
    @Query('component') component?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.getSystemLogs(level, component, search);
    return { success: true, data };
  }

  // ============================================================================
  // 4. SESSIONS & LOGIN SECURITY
  // ============================================================================
  @Get('sessions')
  @ApiOperation({ summary: 'Get active administrative and user sessions' })
  async getSessions() {
    const data = await this.adminService.getSessions();
    return { success: true, count: data.length, data };
  }

  @Post('sessions/:id/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke and terminate an active session' })
  async revokeSession(@Param('id') id: string, @Req() req: any) {
    const actor = this.getActor(req);
    const result = await this.adminService.revokeSession(id, actor);
    return result;
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke and terminate an active session (DELETE alias)' })
  async revokeSessionDelete(@Param('id') id: string, @Req() req: any) {
    return this.revokeSession(id, req);
  }

  // ============================================================================
  // 5. INTEGRATIONS & API MANAGEMENT
  // ============================================================================
  @Get('integrations')
  @ApiOperation({ summary: 'Get status of campus integrations and external APIs' })
  async getIntegrations() {
    const data = await this.adminService.getIntegrations();
    return { success: true, data };
  }

  @Post('integrations/:id/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute connection handshake test on an integration' })
  async testIntegration(@Param('id') id: string) {
    const result = await this.adminService.testIntegration(id);
    return { success: true, data: result };
  }

  @Post('integrations/ping/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute connection handshake test on an integration (ping alias)' })
  async pingIntegration(@Param('id') id: string) {
    return this.testIntegration(id);
  }

  // ============================================================================
  // 6. USER DIRECTORY GOVERNANCE
  // ============================================================================
  @Get('users')
  @ApiOperation({ summary: 'Get institutional user directory with filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getUsers(
    @Query('search') search?: string,
    @Query('role') roleQuery?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.adminService.getUsers(search, roleQuery, status);
    return { success: true, count: data.length, data };
  }

  @Post('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate or suspend user account' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: UpdateAdminUserStatusDto,
    @Req() req: any,
  ) {
    const actor = this.getActor(req);
    const activeState = body.isActive !== undefined ? Boolean(body.isActive) : (body.status === 'Active');
    const updated = await this.adminService.updateUserStatus(id, activeState, actor);
    return {
      success: true,
      message: `User status updated to ${activeState ? 'Active' : 'Suspended'}.`,
      data: updated,
    };
  }

  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate or suspend user account (PATCH alias)' })
  async patchUserStatus(
    @Param('id') id: string,
    @Body() body: UpdateAdminUserStatusDto,
    @Req() req: any,
  ) {
    return this.updateUserStatus(id, body, req);
  }

  @Post('users/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue one-time cryptographic password reset token' })
  async resetUserPassword(@Param('id') id: string, @Req() req: any) {
    const actor = this.getActor(req);
    const result = await this.adminService.resetUserPassword(id, actor);
    return result;
  }

  @Post('users/:id/reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue one-time cryptographic password reset token (reset-token alias)' })
  async resetUserToken(@Param('id') id: string, @Req() req: any) {
    return this.resetUserPassword(id, req);
  }

  @Post('users/create')
  @ApiOperation({ summary: 'Provision new institutional user account' })
  async createUserAccount(@Body() body: CreateAdminUserDto, @Req() req: any) {
    const actor = this.getActor(req);
    const result = await this.adminService.createUserAccount(body, actor);
    return {
      success: true,
      message: `Account for ${result.name} provisioned successfully.`,
      data: result,
    };
  }

  @Post('users')
  @ApiOperation({ summary: 'Provision new institutional user account (POST /users alias)' })
  async createUserAccountAlias(@Body() body: CreateAdminUserDto, @Req() req: any) {
    return this.createUserAccount(body, req);
  }

  // ============================================================================
  // 7. BACKUP & DISASTER RECOVERY
  // ============================================================================
  @Get('backups')
  @ApiOperation({ summary: 'Get backup snapshot history and retention status' })
  async getBackups() {
    const data = await this.adminService.getBackups();
    return { success: true, count: data.length, data };
  }

  @Post('backups/create')
  @ApiOperation({ summary: 'Trigger manual database snapshot backup' })
  async triggerBackup(@Req() req: any) {
    const actor = this.getActor(req);
    const backup = await this.adminService.triggerBackup(actor);
    return {
      success: true,
      message: 'Instant snapshot generated and encrypted in storage vault!',
      data: backup,
    };
  }

  @Post('backups')
  @ApiOperation({ summary: 'Trigger manual database snapshot backup (POST /backups alias)' })
  async triggerBackupAlias(@Req() req: any) {
    return this.triggerBackup(req);
  }

  @Post('backups/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore database snapshot with authorization safety token' })
  async restoreBackup(
    @Param('id') id: string,
    @Body() body: RestoreBackupDto,
    @Req() req: any,
  ) {
    const actor = this.getActor(req);
    const code = body.confirmationCode || body.confirmation;
    const result = await this.adminService.restoreBackup(id, code || '', actor);
    return result;
  }

  // ============================================================================
  // 8. STAFF ROSTER (WARDENS, SECURITY, CANTEEN, SUPPORT)
  // ============================================================================
  @Get('staff')
  @ApiOperation({ summary: 'Get staff rosters (WARDEN, SECURITY, CANTEEN, SUPPORT)' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getStaff(
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.getStaffRoster(type, search);
    return { success: true, count: data.length, data };
  }

  @Post('staff')
  @ApiOperation({ summary: 'Add staff member to duty roster' })
  async createStaff(@Body() body: CreateStaffRosterDto, @Req() req: any) {
    const actor = this.getActor(req);
    const staff = await this.adminService.createStaff(body, actor);
    return {
      success: true,
      message: `Staff member ${staff.name} added to roster!`,
      data: staff,
    };
  }

  @Put('staff/:id')
  @ApiOperation({ summary: 'Update staff member' })
  async updateStaff(
    @Param('id') id: string,
    @Body() body: UpdateStaffRosterDto,
    @Req() req: any,
  ) {
    const actor = this.getActor(req);
    const staff = await this.adminService.updateStaff(id, body, actor);
    return {
      success: true,
      message: `Staff member ${staff.name} updated.`,
      data: staff,
    };
  }

  @Delete('staff/:id')
  @ApiOperation({ summary: 'Remove staff member from roster' })
  async deleteStaff(@Param('id') id: string, @Req() req: any) {
    const actor = this.getActor(req);
    await this.adminService.deleteStaff(id, actor);
    return { success: true, message: 'Staff member removed from roster.' };
  }

  // ============================================================================
  // 9. AUDIT TRAIL LOGS
  // ============================================================================
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get system audit trail logs' })
  @ApiQuery({ name: 'search', required: false })
  async getAuditLogs(@Query('search') search?: string) {
    const data = await this.adminService.getAuditLogs(search);
    return { success: true, count: data.length, data };
  }

  @Post('audit-logs')
  @ApiOperation({ summary: 'Create new immutable audit trail log' })
  async createAuditLog(@Body() body: CreateAuditLogDto) {
    const log = await this.adminService.createAuditLog(body);
    return { success: true, data: log };
  }

  // ============================================================================
  // 10. ADMINISTRATIVE APPROVALS CENTER
  // ============================================================================
  @Get('approvals')
  @ApiOperation({ summary: 'Get pending high-impact administrative approval queue' })
  async getApprovals() {
    const data = await this.adminService.getApprovals();
    return { success: true, count: data.length, data };
  }

  @Post('approvals/:id/decide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject high-impact request with mandatory justification' })
  async decideApproval(
    @Param('id') id: string,
    @Body() body: DecideApprovalDto,
    @Req() req: any,
  ) {
    const actor = this.getActor(req);
    const reasonText = (body.reason || body.justification || '').trim();
    if (reasonText.length < 5) {
      throw new Error('A mandatory justification of at least 5 characters is required for sensitive clearances.');
    }
    const result = await this.adminService.decideApproval(id, body.decision, reasonText, actor);
    return {
      success: true,
      message: `Clearance request ${id} ${body.decision.toLowerCase()}.`,
      data: result,
    };
  }

  // ============================================================================
  // 11. RBAC & SYSTEM CONFIGURATION
  // ============================================================================
  @Get('rbac/permissions')
  @ApiOperation({ summary: 'Get current granular RBAC permissions matrix' })
  async getRbacPermissions() {
    const data = await this.adminService.getRbacPermissions();
    return { success: true, data };
  }

  @Get('rbac')
  @ApiOperation({ summary: 'Get current granular RBAC permissions matrix (alias)' })
  async getRbacAlias() {
    return this.getRbacPermissions();
  }

  @Post('rbac/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update granular permission grants for a designated role' })
  async saveRbacPermissions(@Body() body: SaveRbacPermissionsDto, @Req() req: any) {
    const actor = this.getActor(req);
    const result = await this.adminService.saveRbacPermissions(body.roleKey, body.permissions, actor);
    return result;
  }

  @Post('rbac')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update granular permission grants for a designated role (alias)' })
  async saveRbacAlias(@Body() body: SaveRbacPermissionsDto, @Req() req: any) {
    return this.saveRbacPermissions(body, req);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get institutional and autonomous system configuration' })
  @ApiQuery({ name: 'category', required: false })
  async getSettings(@Query('category') category?: string) {
    const data = await this.adminService.getSettings(category);
    return { success: true, data };
  }

  @Post('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save institutional and autonomous system configuration' })
  async saveSettings(@Body() body: any, @Req() req: any) {
    const actor = this.getActor(req);
    // Body can be { settings: { ... } } or direct dictionary
    const settingsMap = body.settings || body;
    const category = body.category || 'General';
    const result = await this.adminService.saveSettings(settingsMap, actor, category);
    return result;
  }

  // ============================================================================
  // 12. ACADEMIC DIRECTORY: FACULTY CRUD
  // ============================================================================
  @Get('faculty')
  @ApiOperation({ summary: 'Get faculty directory' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'department', required: false })
  async getFaculty(
    @Query('search') search?: string,
    @Query('department') department?: string,
  ) {
    const data = await this.adminService.getFaculty(search, department);
    return { success: true, count: data.length, data };
  }

  @Post('faculty')
  @ApiOperation({ summary: 'Add new faculty member' })
  async createFaculty(@Body() body: CreateFacultyDto, @Req() req: any) {
    const actor = this.getActor(req);
    const faculty = await this.adminService.createFaculty(body, actor);
    return { success: true, message: `Faculty ${faculty.name} added.`, data: faculty };
  }

  @Put('faculty/:id')
  @ApiOperation({ summary: 'Update faculty member' })
  async updateFaculty(
    @Param('id') id: string,
    @Body() body: UpdateFacultyDto,
    @Req() req: any,
  ) {
    const actor = this.getActor(req);
    const faculty = await this.adminService.updateFaculty(id, body, actor);
    return { success: true, message: `Faculty ${faculty.name} updated.`, data: faculty };
  }

  @Delete('faculty/:id')
  @ApiOperation({ summary: 'Delete faculty record' })
  async deleteFaculty(@Param('id') id: string, @Req() req: any) {
    const actor = this.getActor(req);
    const result = await this.adminService.deleteFaculty(id, actor);
    return result;
  }

  // ============================================================================
  // 13. ACADEMIC DIRECTORY: HOD CRUD
  // ============================================================================
  @Get('hods')
  @ApiOperation({ summary: 'Get HOD directory' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'department', required: false })
  async getHods(
    @Query('search') search?: string,
    @Query('department') department?: string,
  ) {
    const data = await this.adminService.getHods(search, department);
    return { success: true, count: data.length, data };
  }

  @Post('hods')
  @ApiOperation({ summary: 'Assign new HOD' })
  async createHod(@Body() body: CreateHodDto, @Req() req: any) {
    const actor = this.getActor(req);
    const hod = await this.adminService.createHod(body, actor);
    return { success: true, message: `HOD ${hod.name} assigned.`, data: hod };
  }

  @Put('hods/:id')
  @ApiOperation({ summary: 'Update HOD details' })
  async updateHod(
    @Param('id') id: string,
    @Body() body: UpdateHodDto,
    @Req() req: any,
  ) {
    const actor = this.getActor(req);
    const hod = await this.adminService.updateHod(id, body, actor);
    return { success: true, message: `HOD ${hod.name} updated.`, data: hod };
  }

  @Delete('hods/:id')
  @ApiOperation({ summary: 'Remove HOD record' })
  async deleteHod(@Param('id') id: string, @Req() req: any) {
    const actor = this.getActor(req);
    const result = await this.adminService.deleteHod(id, actor);
    return result;
  }

  // ============================================================================
  // 14. MARKING SCHEMES
  // ============================================================================
  @Get('marking-schemes')
  @ApiOperation({ summary: 'Get marking scheme evaluation components' })
  async getMarkingSchemes() {
    const data = await this.adminService.getMarkingSchemes();
    return { success: true, count: data.length, data };
  }

  @Put('marking-schemes/:id')
  @ApiOperation({ summary: 'Update marking scheme component' })
  async updateMarkingScheme(
    @Param('id') id: string,
    @Body() body: UpdateMarkingSchemeDto,
    @Req() req: any,
  ) {
    const actor = this.getActor(req);
    const updated = await this.adminService.updateMarkingScheme(id, body, actor);
    return { success: true, message: `Marking scheme ${updated.assessmentType} updated.`, data: updated };
  }

  @Post('users/:id/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign or reassign institutional user role' })
  async updateUserRole(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { role: string; department?: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Role assignment requires administrative clearance.');
    }

    const updated = await this.adminService.updateUserRole(id, body.role, body.department, user);
    return { success: true, message: `Role updated to ${updated.role} successfully.`, data: updated };
  }

  // =========================================================================
  // GOVERNANCE & INSTITUTIONAL WORKFLOWS ENDPOINTS
  // =========================================================================

  @Get('governance/meetings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get institutional statutory and council meeting records' })
  async getGovernanceMeetings(@CurrentUser() user: any, @Query('academicYear') academicYear?: string) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to institutional governance council records.');
    }

    const data = await this.adminService.getGovernanceMeetings(academicYear);
    return { success: true, count: data.length, data };
  }

  @Post('governance/meetings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register or record statutory governance meeting and minutes' })
  async createGovernanceMeeting(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Registering meetings requires executive clearance.');
    }

    const meeting = await this.adminService.createGovernanceMeeting(body, user);
    return { success: true, message: `Meeting ${meeting.title} registered successfully.`, data: meeting };
  }

  @Get('governance/resolutions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statutory resolutions and policy decisions' })
  async getGovernanceResolutions(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to statutory resolutions.');
    }

    const data = await this.adminService.getGovernanceResolutions(status, search);
    return { success: true, count: data.length, data };
  }

  @Post('governance/resolutions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enact or draft institutional statutory resolution' })
  async createGovernanceResolution(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Enacting resolutions requires executive authority.');
    }

    const res = await this.adminService.createGovernanceResolution(body, user);
    return { success: true, message: `Resolution ${res.resolutionCode} recorded successfully.`, data: res };
  }

  @Get('governance/circulars')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get official administrative circulars and office orders' })
  async getGovernanceCirculars(
    @CurrentUser() user: any,
    @Query('targetAudience') targetAudience?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.getGovernanceCirculars(targetAudience, search);
    return { success: true, count: data.length, data };
  }

  @Post('governance/circulars')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish administrative circular and broadcast across portals' })
  async publishGovernanceCircular(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'admin', 'management'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Publishing administrative circulars requires administrative authority.');
    }

    const circular = await this.adminService.publishGovernanceCircular(body, user);
    return { success: true, message: `Circular ${circular.circularNo} published and dispatched.`, data: circular };
  }

  @Get('governance/action-items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get strategic institutional action items and implementation tracking' })
  async getGovernanceActionItems(@CurrentUser() user: any, @Query('status') status?: string) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to strategic action items.');
    }

    const data = await this.adminService.getGovernanceActionItems(status);
    return { success: true, count: data.length, data };
  }

  @Patch('governance/action-items/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update progress and status of strategic action item' })
  async updateActionItemStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; progress: number },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to update strategic action items.');
    }

    const updated = await this.adminService.updateActionItemStatus(id, body.status, body.progress, user);
    return { success: true, message: `Action item ${id} updated to ${body.status}.`, data: updated };
  }

  // =========================================================================
  // 1. HUMAN RESOURCES & WORKFORCE (HR ERP)
  // =========================================================================

  @Get('hr/employees')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unified employee directory (Faculty & Staff)' })
  async getEmployees(
    @CurrentUser() user: any,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to institutional employee directory.');
    }

    const data = await this.adminService.getEmployees(department, status, search);
    return { success: true, count: data.length, data };
  }

  @Get('hr/leaves')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employee leave applications and approval queue' })
  async getLeaveRequests(@CurrentUser() user: any, @Query('status') status?: string) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to staff leave queue.');
    }

    const data = await this.adminService.getLeaveRequests(status);
    return { success: true, count: data.length, data };
  }

  @Post('hr/leaves/:id/decide')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject staff leave application' })
  async decideLeaveRequest(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; reason: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Deciding leaves requires administrative clearance.');
    }

    const result = await this.adminService.decideLeaveRequest(id, body.decision, body.reason || '', user);
    return { success: true, message: `Leave application ${id} ${body.decision.toLowerCase()}.`, data: result };
  }

  @Get('hr/recruitments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get institutional recruitment openings' })
  async getRecruitmentOpenings(@CurrentUser() user: any) {
    const data = await this.adminService.getRecruitmentOpenings();
    return { success: true, count: data.length, data };
  }

  @Post('hr/recruitments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post new institutional recruitment vacancy' })
  async createRecruitmentOpening(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to post recruitment vacancies.');
    }

    const result = await this.adminService.createRecruitmentOpening(body, user);
    return { success: true, message: `Vacancy for ${result.position} published.`, data: result };
  }

  // =========================================================================
  // 2. FINANCE & ADMINISTRATIVE EXPENDITURE (PROCUREMENT ERP)
  // =========================================================================

  @Get('finance/budgets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get administrative and departmental budget allocations and utilization' })
  async getBudgetAllocations(@CurrentUser() user: any, @Query('academicYear') academicYear?: string) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod', 'accounts'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to institutional budget records.');
    }

    const data = await this.adminService.getBudgetAllocations(academicYear);
    return { success: true, data };
  }

  @Get('finance/purchase-requisitions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get purchase requisitions and procurement approval queue' })
  async getPurchaseRequisitions(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('department') department?: string,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod', 'accounts'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to purchase requisitions.');
    }

    const data = await this.adminService.getPurchaseRequisitions(status, department);
    return { success: true, count: data.length, data };
  }

  @Post('finance/purchase-requisitions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create purchase requisition' })
  async createPurchaseRequisition(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod', 'accounts'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to create purchase requisitions.');
    }

    const result = await this.adminService.createPurchaseRequisition(body, user);
    return { success: true, message: `Requisition ${result.prNumber} submitted.`, data: result };
  }

  @Post('finance/purchase-requisitions/:id/decide')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject purchase requisition' })
  async decidePurchaseRequisition(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; remarks: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'accounts'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Approving purchase requisitions requires finance clearance.');
    }

    const result = await this.adminService.decidePurchaseRequisition(id, body.decision, body.remarks || '', user);
    return { success: true, message: `Requisition ${id} ${body.decision.toLowerCase()}.`, data: result };
  }

  @Get('finance/vendors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get institutional vendor and contractor directory' })
  async getVendorDirectory(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'accounts'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to vendor directory.');
    }

    const data = await this.adminService.getVendorDirectory(search, category);
    return { success: true, count: data.length, data };
  }

  @Get('finance/invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor invoices and 3-way matching status' })
  async getVendorInvoices(@CurrentUser() user: any, @Query('status') status?: string) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'accounts'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to vendor invoices.');
    }

    const data = await this.adminService.getVendorInvoices(status);
    return { success: true, count: data.length, data };
  }

  @Post('finance/invoices/:id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify vendor invoice for payment release' })
  async verifyVendorInvoice(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'admin', 'accounts'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to verify invoices.');
    }

    const result = await this.adminService.verifyVendorInvoice(id, body.status, body.notes || '', user);
    return { success: true, message: `Invoice ${id} verified.`, data: result };
  }

  // =========================================================================
  // 3. CAMPUS FACILITIES & OPERATIONS
  // =========================================================================

  @Get('facilities/inventory')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campus infrastructure, buildings, blocks and facilities' })
  async getFacilitiesInventory(@CurrentUser() user: any) {
    const data = await this.adminService.getFacilitiesInventory();
    return { success: true, data };
  }

  @Get('facilities/work-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campus maintenance work orders' })
  async getWorkOrders(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    const data = await this.adminService.getWorkOrders(status, priority);
    return { success: true, count: data.length, data };
  }

  @Post('facilities/work-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create maintenance work order' })
  async createWorkOrder(@CurrentUser() user: any, @Body() body: any) {
    const result = await this.adminService.createWorkOrder(body, user);
    return { success: true, message: `Work order ${result.id} created.`, data: result };
  }

  @Patch('facilities/work-orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update work order status and technician notes' })
  async updateWorkOrderStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const result = await this.adminService.updateWorkOrderStatus(id, body.status, body.notes || '', user);
    return { success: true, message: `Work order ${id} updated to ${body.status}.`, data: result };
  }

  @Get('facilities/preventive-maintenance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get preventive maintenance schedules' })
  async getPreventiveMaintenanceSchedules(@CurrentUser() user: any) {
    const data = await this.adminService.getPreventiveMaintenanceSchedules();
    return { success: true, count: data.length, data };
  }

  @Get('facilities/safety-inspections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get safety inspections and statutory NOCs' })
  async getSafetyInspections(@CurrentUser() user: any) {
    const data = await this.adminService.getSafetyInspections();
    return { success: true, count: data.length, data };
  }

  // =========================================================================
  // 4. STATUTORY COMPLIANCE, QUALITY & RISK MANAGEMENT (CAPA)
  // =========================================================================

  @Get('compliance/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get institutional compliance register (AICTE, NAAC, UGC)' })
  async getComplianceRegister(@CurrentUser() user: any, @Query('status') status?: string) {
    const data = await this.adminService.getComplianceRegister(status);
    return { success: true, count: data.length, data };
  }

  @Patch('compliance/register/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update compliance status and evidence' })
  async updateComplianceItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; evidenceRef?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to update compliance items.');
    }

    const result = await this.adminService.updateComplianceItem(id, body.status, body.evidenceRef, user);
    return { success: true, message: `Compliance item ${id} updated to ${body.status}.`, data: result };
  }

  @Get('compliance/risks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get institutional risk register' })
  async getRiskRegister(@CurrentUser() user: any, @Query('severity') severity?: string) {
    const data = await this.adminService.getRiskRegister(severity);
    return { success: true, count: data.length, data };
  }

  @Get('compliance/corrective-actions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Corrective and Preventive Actions (CAPA)' })
  async getCorrectiveActions(@CurrentUser() user: any, @Query('status') status?: string) {
    const data = await this.adminService.getCorrectiveActions(status);
    return { success: true, count: data.length, data };
  }

  @Patch('compliance/corrective-actions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve or update CAPA plan' })
  async updateCorrectiveAction(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; resolutionNotes?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to update CAPA actions.');
    }

    const result = await this.adminService.updateCorrectiveAction(id, body.status, body.resolutionNotes || '', user);
    return { success: true, message: `CAPA item ${id} updated to ${body.status}.`, data: result };
  }

  // =========================================================================
  // 5. OFFICIAL RECORDS & DOCUMENT MANAGEMENT
  // =========================================================================

  @Get('documents/vault')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get official administrative documents and policies' })
  async getOfficialDocuments(
    @CurrentUser() user: any,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.getOfficialDocuments(category, search);
    return { success: true, count: data.length, data };
  }

  @Post('documents/vault')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register and archive official administrative document' })
  async registerOfficialDocument(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to archive official records.');
    }

    const result = await this.adminService.registerOfficialDocument(body, user);
    return { success: true, message: `Document ${result.documentNo} archived in vault.`, data: result };
  }
}
