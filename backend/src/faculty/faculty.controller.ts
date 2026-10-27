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
import { FacultyService } from './faculty.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Faculty Portal')
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unified faculty dashboard statistics, work queue, and schedule' })
  async getDashboard(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'hod', 'faculty'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Role ${user.role} is not authorized for Faculty Portal operations.`);
    }

    const facultyName = user.name || user.identifier || 'Dr. S. Mohanty';
    const data = await this.facultyService.getDashboard(facultyName);
    return { success: true, data };
  }

  @Get('assignments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get faculty assigned classes and subjects' })
  async getAssignments(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'hod', 'faculty'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied.`);
    }

    const facultyName = user.name || user.identifier || 'Dr. S. Mohanty';
    const data = await this.facultyService.getAssignments(facultyName);
    return { success: true, count: data.length, data };
  }

  @Get('students')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get class-wise students authorized for logged-in faculty based on assignments' })
  async getStudents(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear?: string,
    @Query('semester') semester?: string,
    @Query('section') section?: string,
    @Query('subjectCode') subjectCode?: string,
    @Query('program') program?: string,
    @Query('search') search?: string,
    @Query('isConsolidated') isConsolidated?: string,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'hod', 'faculty'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied.`);
    }

    const facultyName = user.name || user.identifier || 'Dr. S. Mohanty';
    const data = await this.facultyService.getScopedStudents(facultyName, {
      academicYear,
      semester,
      section,
      subjectCode,
      program,
      search,
      isConsolidated,
    });
    return { success: true, count: data.length, data };
  }

  @Get('classes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get distinct academic classes, sections, semesters, and subjects assigned to faculty' })
  async getClasses(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'hod', 'faculty'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied.`);
    }

    const facultyName = user.name || user.identifier || 'Dr. S. Mohanty';
    const assignments = await this.facultyService.getAssignments(facultyName);

    const academicYears = Array.from(new Set(assignments.map((a) => a.academicYear)));
    const semesters = Array.from(new Set(assignments.map((a) => a.semester)));
    const programs = Array.from(new Set(assignments.map((a) => a.program)));
    const sections = Array.from(new Set(assignments.map((a) => a.section)));
    const subjects = Array.from(new Set(assignments.map((a) => a.subjectCode))).map((code) => {
      const match = assignments.find((a) => a.subjectCode === code);
      return { code, name: match?.subjectName || code };
    });

    return {
      success: true,
      data: {
        academicYears,
        semesters,
        programs,
        sections,
        subjects,
        assignments,
      },
    };
  }

  @Get('attendance/sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance sessions for a subject and section' })
  async getAttendanceSessions(
    @CurrentUser() user: any,
    @Query('subjectCode') subjectCode?: string,
    @Query('section') section?: string
  ) {
    const data = await this.facultyService.getAttendanceSessions(subjectCode || 'CS501', section || 'Section A');
    return { success: true, count: data.length, data };
  }

  @Post('attendance/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit period attendance session for assigned cohort' })
  async submitAttendance(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'faculty' && role !== 'hod' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only course faculty can record attendance.');
    }

    const res = await this.facultyService.submitAttendanceSession({
      ...body,
      facultyName: user.name || user.identifier
    });
    return { success: true, message: res.message, data: res };
  }

  @Get('quizzes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course quizzes and assessment status' })
  async getQuizzes(
    @CurrentUser() user: any,
    @Query('subjectCode') subjectCode?: string,
    @Query('section') section?: string
  ) {
    const data = await this.facultyService.getQuizzes(subjectCode, section);
    return { success: true, count: data.length, data };
  }

  @Post('quizzes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update quiz with questions bank' })
  async createQuiz(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'faculty' && role !== 'hod' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only course faculty can author quizzes.');
    }

    const data = await this.facultyService.createOrUpdateQuiz(body);
    return { success: true, message: data.message, data: data.quiz };
  }

  @Put('quizzes/:id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish scheduled quiz for student access' })
  async publishQuiz(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'faculty' && role !== 'hod' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }

    const data = await this.facultyService.publishQuiz(id);
    return { success: true, message: data.message, data };
  }

  @Get('performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get class continuous internal assessment analytics and score distributions' })
  async getPerformance(
    @CurrentUser() user: any,
    @Query('subjectCode') subjectCode?: string,
    @Query('section') section?: string
  ) {
    const data = await this.facultyService.getClassPerformance(subjectCode || 'CS501', section || 'Section A');
    return { success: true, data };
  }

  @Get('early-warning')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get at-risk students flagged by early-warning rules' })
  async getEarlyWarning(
    @CurrentUser() user: any,
    @Query('subjectCode') subjectCode?: string,
    @Query('section') section?: string
  ) {
    const data = await this.facultyService.getAtRiskStudents(subjectCode || 'CS501', section || 'Section A');
    return { success: true, count: data.length, data };
  }

  @Post('early-warning/intervention')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log faculty remedial intervention for at-risk student' })
  async logIntervention(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'faculty' && role !== 'hod' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }

    const data = await this.facultyService.logRemedialIntervention({
      ...body,
      recordedBy: user.name || user.identifier
    });
    return { success: true, message: data.message, data: data.data };
  }

  @Post('schedule-class')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule upcoming class and notify enrolled cohort' })
  async scheduleClass(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'faculty' && role !== 'hod' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only teaching faculty can schedule classes.');
    }
    const res = await this.facultyService.scheduleClass(body, user);
    return res;
  }

  @Post('reschedule-class')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reschedule class or update venue with duplicate prevention' })
  async rescheduleClass(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'faculty' && role !== 'hod' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only teaching faculty can reschedule classes.');
    }
    const res = await this.facultyService.rescheduleClass(body, user);
    return res;
  }
}

