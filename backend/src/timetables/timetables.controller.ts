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
  BadRequestException,
  NotFoundException,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current student course schedule' })
  async getStudentTimetable(
    @CurrentUser() user: any,
    @Query('department') department?: string,
    @Query('semester') semester?: string,
    @Query('section') section?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const role = normalizeRole(user.role);
    if (role === 'student') {
      if (!user.student) throw new NotFoundException('Your account is not linked to a student profile.');
      const student = user.student;
      if (!student.department || !student.semester || !student.section) {
        throw new NotFoundException('Your department, semester, or section is not configured.');
      }
      const data = await this.timetablesService.getStudentTimetable(
        student.department,
        student.semester,
        student.section,
        student.academicYear || undefined,
      );
      return { success: true, data };
    }
    this.checkAuthorizedRole(user, ['super_admin', 'admin', 'principal', 'management', 'hod']);
    if (!department || !semester || !section) {
      throw new BadRequestException('Department, semester, and section are required when an administrator previews a timetable.');
    }
    const data = await this.timetablesService.getStudentTimetable(
      department,
      semester,
      section,
      academicYear,
    );
    return { success: true, data };
  }

  @Get('view/faculty')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get official teaching timetable for a specific faculty member' })
  async getFacultyTimetable(@CurrentUser() user: any) {
    if (normalizeRole(user.role) !== 'faculty') {
      throw new ForbiddenException('This timetable endpoint is scoped to the authenticated faculty account.');
    }
    if (!user.faculty?.id) throw new NotFoundException('Your account is not linked to a faculty profile.');
    const data = await this.timetablesService.getFacultyTimetable(user.faculty.id);
    return { success: true, count: data.length, data };
  }
}
