import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FacultyService } from './faculty.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';
import { SubmitAttendanceDto } from './faculty.dto';

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

    const data = await this.facultyService.getDashboard(user.faculty?.id);
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

    const data = await this.facultyService.getAssignments(user.faculty?.id);
    return { success: true, count: data.length, data };
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
    if (normalizeRole(user.role) !== 'faculty' || !user.faculty?.id) {
      throw new ForbiddenException('A linked faculty profile is required to view attendance sessions.');
    }
    const data = await this.facultyService.getAttendanceSessions(user.faculty.id, subjectCode, section);
    return { success: true, count: data.length, data };
  }

  @Get('attendance/roster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the active student roster for an assigned subject section' })
  async getAttendanceRoster(
    @CurrentUser() user: any,
    @Query('subjectCode') subjectCode?: string,
    @Query('section') section?: string
  ) {
    if (normalizeRole(user.role) !== 'faculty' || !user.faculty?.id) {
      throw new ForbiddenException('A linked faculty profile is required to view an attendance roster.');
    }
    const data = await this.facultyService.getAttendanceRoster(user.faculty.id, subjectCode, section);
    return { success: true, count: data.length, data };
  }

  @Post('attendance/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit period attendance session for assigned cohort' })
  async submitAttendance(@CurrentUser() user: any, @Body() body: SubmitAttendanceDto) {
    if (normalizeRole(user.role) !== 'faculty' || !user.faculty?.id) {
      throw new ForbiddenException('A linked course faculty profile is required to record attendance.');
    }

    const res = await this.facultyService.submitAttendanceSession(user.faculty.id, user.id, body);
    return { success: true, message: res.message, data: res };
  }

  @Get('quizzes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getQuizzes() {
    throw new ServiceUnavailableException('Quiz persistence is not implemented.');
  }

  @Post('quizzes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createQuiz() {
    throw new ServiceUnavailableException('Quiz persistence is not implemented.');
  }

  @Put('quizzes/:id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async publishQuiz() {
    throw new ServiceUnavailableException('Quiz persistence is not implemented.');
  }

  @Get('performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPerformance() {
    throw new ServiceUnavailableException('Verified class performance analytics are not available.');
  }

  @Get('early-warning')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getEarlyWarning() {
    throw new ServiceUnavailableException('Verified faculty early-warning data are not available.');
  }

  @Post('early-warning/intervention')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async logIntervention() {
    throw new ServiceUnavailableException('Persistent remedial intervention logging is not implemented.');
  }
}
