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
  Res,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { TimetablesService } from './timetables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Automated Timetable Management')
@Controller('timetables')
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  private checkAuthorizedRole(user: any, allowedRoles: string[]) {
    const role = normalizeRole(user.role);
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(
        `Access denied. Role "${user.role}" does not have privileges for this timetable operation.`,
      );
    }
    return role;
  }

  // ==========================================
  // DASHBOARD STATISTICS & KPIS
  // ==========================================
  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get live real-time dashboard statistics across academic departments' })
  async getDashboardStats(
    @Query('department') department?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const data = await this.timetablesService.getDashboardStats(department, academicYear || '2026-27');
    return { success: true, data };
  }

  // ==========================================
  // ACADEMIC SELECTIONS & DYNAMIC OPTIONS
  // ==========================================
  @Get('sections')
  @ApiOperation({ summary: 'Get sections with optional department and semester filter' })
  async getSections(
    @Query('department') department?: string,
    @Query('semester') semester?: string,
  ) {
    const data = await this.timetablesService.getSections(department, semester);
    return { success: true, count: data.length, data };
  }

  @Post('sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new section' })
  async createSection(@CurrentUser() user: any, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const data = await this.timetablesService.createSection(body);
    return { success: true, message: `Section ${data.section} added successfully.`, data };
  }

  @Put('sections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing section' })
  async updateSection(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const data = await this.timetablesService.updateSection(id, body);
    return { success: true, message: `Section updated successfully.`, data };
  }

  @Delete('sections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a section' })
  async deleteSection(@CurrentUser() user: any, @Param('id') id: string) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    await this.timetablesService.deleteSection(id);
    return { success: true, message: `Section deleted successfully.` };
  }

  @Get('branches')
  @ApiOperation({ summary: 'Get degree branches/programmes' })
  async getBranches(@Query('department') department?: string) {
    const data = await this.timetablesService.getBranches(department);
    return { success: true, count: data.length, data };
  }

  @Post('branches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new branch/programme' })
  async createBranch(@CurrentUser() user: any, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const data = await this.timetablesService.createBranch(body);
    return { success: true, message: `Branch ${data.name} created.`, data };
  }

  @Get('academic-years')
  @ApiOperation({ summary: 'Get institutional academic sessions' })
  async getAcademicYears() {
    const data = await this.timetablesService.getAcademicYears();
    return { success: true, count: data.length, data };
  }

  @Post('academic-years')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new academic year' })
  async createAcademicYear(@CurrentUser() user: any, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const data = await this.timetablesService.createAcademicYear(body);
    return { success: true, message: `Academic year ${data.year} registered.`, data };
  }

  @Get('semesters')
  @ApiOperation({ summary: 'Get semesters' })
  async getSemesters() {
    const data = await this.timetablesService.getSemesters();
    return { success: true, count: data.length, data };
  }

  @Post('semesters')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new semester' })
  async createSemester(@CurrentUser() user: any, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const data = await this.timetablesService.createSemester(body);
    return { success: true, message: `Semester ${data.label} registered.`, data };
  }

  @Post('subjects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new curriculum subject' })
  async createSubject(@CurrentUser() user: any, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const data = await this.timetablesService.createSubject(body);
    return { success: true, message: `Subject ${data.code} registered.`, data };
  }

  // ==========================================
  // ROOMS & LABORATORIES
  // ==========================================
  @Get('rooms')
  @ApiOperation({ summary: 'Get all college rooms and laboratories' })
  async getRooms(
    @Query('department') department?: string,
    @Query('isLab') isLab?: string,
  ) {
    const isLabBool = isLab !== undefined ? isLab === 'true' : undefined;
    const data = await this.timetablesService.getRooms(department, isLabBool);
    return { success: true, count: data.length, data };
  }

  @Post('rooms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new classroom or laboratory' })
  async createRoom(@CurrentUser() user: any, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const room = await this.timetablesService.createRoom(body);
    return { success: true, message: `Room ${room.roomNumber} registered.`, data: room };
  }

  @Put('rooms/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room specifications' })
  async updateRoom(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const room = await this.timetablesService.updateRoom(id, body);
    return { success: true, message: `Room ${room.roomNumber} updated.`, data: room };
  }

  @Delete('rooms/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a room (Super Admin only)' })
  async deleteRoom(@CurrentUser() user: any, @Param('id') id: string) {
    this.checkAuthorizedRole(user, ['super_admin']);
    await this.timetablesService.deleteRoom(id);
    return { success: true, message: 'Room removed.' };
  }

  // ==========================================
  // ACADEMIC SCHEDULE CONFIGURATION
  // ==========================================
  @Get('config')
  @ApiOperation({ summary: 'Get institutional timetable configuration' })
  async getScheduleConfig(
    @Query('academicYear') academicYear?: string,
    @Query('department') department?: string,
  ) {
    const data = await this.timetablesService.getScheduleConfig(academicYear || '2026-27', department || 'CSE');
    return { success: true, data };
  }

  @Put('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update academic schedule periods, breaks, and limits' })
  async updateScheduleConfig(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear: string,
    @Query('department') department: string,
    @Body() body: any,
  ) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const config = await this.timetablesService.updateScheduleConfig(
      academicYear || '2026-27',
      department || 'CSE',
      body,
    );
    return { success: true, message: 'Timetable schedule policy updated.', data: config };
  }

  // ==========================================
  // FACULTY AVAILABILITY
  // ==========================================
  @Get('faculty-availability')
  @ApiOperation({ summary: 'Get faculty slot availability constraints' })
  async getFacultyAvailabilities(@Query('facultyId') facultyId?: string) {
    const data = await this.timetablesService.getFacultyAvailabilities(facultyId);
    return { success: true, count: data.length, data };
  }

  @Post('faculty-availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set faculty availability for specific days/periods' })
  async setFacultyAvailability(@CurrentUser() user: any, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod', 'faculty']);
    const data = await this.timetablesService.setFacultyAvailability(body);
    return { success: true, message: 'Faculty availability updated.', data };
  }

  // ==========================================
  // PRE-FLIGHT VALIDATION & SOLVER GENERATION
  // ==========================================
  @Post('pre-validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate master data and prerequisites before generation' })
  async preValidate(@CurrentUser() user: any, @Body() body: any) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const report = await this.timetablesService.preValidate({
      department: body.department || user.department || 'CSE',
      semester: body.semester || 'Semester 5',
      section: body.section || 'Section A',
      academicYear: body.academicYear || '2026-27',
    });
    return { success: true, data: report };
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate automated timetable generation job using Google OR-Tools CP-SAT' })
  async generateTimetable(@CurrentUser() user: any, @Body() body: any) {
    const role = this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);

    // HODs can only generate for their own department
    let department = body.department || user.department || 'CSE';
    if (role === 'hod' && user.department && user.department !== department) {
      department = user.department;
    }

    const job = await this.timetablesService.createGenerationJob({
      department,
      academicYear: body.academicYear || '2026-27',
      semester: body.semester || 'Semester 5',
      section: body.section || 'Section A',
      programmeId: body.programmeId,
      scope: body.scope || 'SECTION',
      constraintsConfig: body.constraintsConfig || {},
      initiatedBy: user.name || user.identifier || 'Academic Administrator',
    });

    return {
      success: true,
      message: 'Timetable generation job initiated with OR-Tools CP-SAT.',
      jobId: job.id,
      job,
    };
  }

  @Get('generation-jobs/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check real-time timetable generation job status and progress' })
  async getGenerationJob(@CurrentUser() user: any, @Param('id') id: string) {
    const job = await this.timetablesService.getGenerationJob(id);
    return { success: true, data: job };
  }

  @Post('generation-jobs/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an ongoing generation job' })
  async cancelGenerationJob(@CurrentUser() user: any, @Param('id') id: string) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const job = await this.timetablesService.cancelGenerationJob(id);
    return { success: true, message: 'Generation job cancelled.', data: job };
  }

  // ==========================================
  // TIMETABLES RETRIEVAL & CONFLICTS
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'List generated timetables with status and filters' })
  async getTimetables(
    @Query('academicYear') academicYear?: string,
    @Query('department') department?: string,
    @Query('semester') semester?: string,
    @Query('section') section?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.timetablesService.getTimetables({
      academicYear,
      department,
      semester,
      section,
      status,
    });
    return { success: true, count: data.length, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complete timetable with all scheduled slots and conflict diagnostics' })
  async getTimetableById(@Param('id') id: string) {
    const data = await this.timetablesService.getTimetableById(id);
    return { success: true, data };
  }

  @Get(':id/conflicts')
  @ApiOperation({ summary: 'Run validation service and return all hard and soft conflicts' })
  async getTimetableConflicts(@Param('id') id: string) {
    const data = await this.timetablesService.getTimetableConflicts(id);
    return { success: true, data };
  }

  // ==========================================
  // MANUAL EDITOR (SLOT REASSIGNMENT)
  // ==========================================
  @Patch(':id/entries/:entryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually move a session or change room/faculty with immediate conflict detection' })
  async updateTimetableEntry(
    @CurrentUser() user: any,
    @Param('id') timetableId: string,
    @Param('entryId') entryId: string,
    @Body() body: any,
  ) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    return this.timetablesService.updateTimetableEntry(timetableId, entryId, body, user);
  }

  @Patch(':id/entries/:entryId/lock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle lock state on a timetable session' })
  async toggleEntryLock(
    @CurrentUser() user: any,
    @Param('id') timetableId: string,
    @Param('entryId') entryId: string,
  ) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const entry = await this.timetablesService.toggleEntryLock(timetableId, entryId);
    return { success: true, message: 'Session lock status toggled.', data: entry };
  }

  @Post(':id/regenerate-unlocked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Partially re-generate unlocked slots preserving locked sessions' })
  async regenerateUnlockedEntries(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'hod']);
    const timetable = await this.timetablesService.regenerateUnlockedEntries(id, user);
    return { success: true, message: 'Unlocked sessions regenerated without clashes.', data: timetable };
  }

  // ==========================================
  // APPROVAL & PUBLISHING LIFECYCLE
  // ==========================================
  @Post(':id/submit-for-approval')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit validated draft timetable for Principal approval (HOD & Admin only)' })
  async submitForApproval(@CurrentUser() user: any, @Param('id') id: string) {
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'hod']);
    return this.timetablesService.submitForApproval(id, user);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve draft timetable (Principal & Super Admin only)' })
  async approveTimetable(@CurrentUser() user: any, @Param('id') id: string) {
    this.checkAuthorizedRole(user, ['super_admin', 'principal']);
    return this.timetablesService.approveTimetable(id, user);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish approved timetable to students and faculty (Principal & Super Admin only)' })
  async publishTimetable(@CurrentUser() user: any, @Param('id') id: string) {
    this.checkAuthorizedRole(user, ['super_admin', 'principal', 'admin']);
    return this.timetablesService.publishTimetable(id, user);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject draft timetable with mandatory review remarks' })
  async rejectTimetable(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
  ) {
    this.checkAuthorizedRole(user, ['super_admin', 'principal']);
    return this.timetablesService.rejectTimetable(id, body.rejectionReason, user);
  }

  // ==========================================
  // EXPORTS & REPORTS
  // ==========================================
  @Get(':id/export/excel')
  @ApiOperation({ summary: 'Download timetable as an institutional Excel spreadsheet' })
  async exportExcel(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.timetablesService.exportToExcel(id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Timetable_${id}.xlsx`);
    res.send(buffer);
  }

  @Get('reports/workload')
  @ApiOperation({ summary: 'Get faculty weekly teaching load and compliance distribution' })
  async getWorkloadReport(
    @Query('department') department?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const data = await this.timetablesService.getWorkloadReport(department || 'CSE', academicYear || '2026-27');
    return { success: true, count: data.length, data };
  }

  @Get('reports/room-utilization')
  @ApiOperation({ summary: 'Get classroom and laboratory utilization rate report' })
  async getRoomUtilizationReport(
    @Query('department') department?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const data = await this.timetablesService.getRoomUtilizationReport(department || 'CSE', academicYear || '2026-27');
    return { success: true, count: data.length, data };
  }

  // ==========================================
  // ROLE-SPECIFIC TIMETABLE VIEWS
  // ==========================================
  @Get('view/student')
  @ApiOperation({ summary: 'Get current student course schedule' })
  async getStudentTimetable(
    @Query('department') department?: string,
    @Query('semester') semester?: string,
    @Query('section') section?: string,
  ) {
    const data = await this.timetablesService.getStudentTimetable(
      department || 'CSE',
      semester || 'Semester 5',
      section || 'Section A',
    );
    return { success: true, data };
  }

  @Get('view/faculty')
  @ApiOperation({ summary: 'Get official teaching timetable for a specific faculty member' })
  async getFacultyTimetable(@Query('facultyName') facultyName: string) {
    const data = await this.timetablesService.getFacultyTimetable(facultyName || 'Dr. P. Mohapatra');
    return { success: true, count: data.length, data };
  }
}
