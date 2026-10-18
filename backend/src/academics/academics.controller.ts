import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicsService } from './academics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Academics')
@Controller('academics')
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get('departments')
  @ApiOperation({ summary: 'Get all college departments' })
  async getDepartments() {
    const data = await this.academicsService.getDepartments();
    return { success: true, count: data.length, data };
  }

  @Post('departments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new department (Super Admin & Admin only)' })
  async createDepartment(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Only System Administrator can establish academic departments.');
    }
    const dept = await this.academicsService.createDepartment(body);
    return { success: true, message: `Department ${dept.name} created.`, data: dept };
  }

  @Put('departments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update department (Super Admin & Admin only)' })
  async updateDepartment(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Only System Administrator can modify academic departments.');
    }
    const dept = await this.academicsService.updateDepartment(id, body);
    return { success: true, message: `Department ${dept.name} updated.`, data: dept };
  }

  @Delete('departments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete department (Super Admin only)' })
  async deleteDepartment(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Super Admin can delete academic departments.');
    }
    await this.academicsService.deleteDepartment(id);
    return { success: true, message: 'Department deleted successfully.' };
  }

  @Get('semesters')
  @ApiOperation({ summary: 'Get all college semesters' })
  async getSemesters() {
    const data = await this.academicsService.getSemesters();
    return { success: true, count: data.length, data };
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get active sections' })
  async getSections() {
    const data = await this.academicsService.getSections();
    return { success: true, count: data.length, data };
  }

  @Get('subjects')
  @ApiOperation({ summary: 'Get subjects with optional department and semester filters' })
  async getSubjects(@Query('department') department?: string, @Query('semester') semester?: string) {
    const data = await this.academicsService.getSubjects(department, semester);
    return { success: true, count: data.length, data };
  }

  @Post('subjects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subject (HOD / Admin / Super Admin only)' })
  async createSubject(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'hod' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only HOD or Administrator can create course curricula.');
    }
    const sub = await this.academicsService.createSubject(body);
    return { success: true, message: `Subject ${sub.name} created.`, data: sub };
  }

  @Put('subjects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subject' })
  async updateSubject(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'hod' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const sub = await this.academicsService.updateSubject(id, body);
    return { success: true, message: `Subject ${sub.name} updated.`, data: sub };
  }

  @Delete('subjects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete subject' })
  async deleteSubject(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Super Admin can delete curriculum subjects.');
    }
    await this.academicsService.deleteSubject(id);
    return { success: true, message: 'Subject deleted successfully.' };
  }

  @Get('timetable')
  @ApiOperation({ summary: 'Get weekly academic timetable schedule' })
  getTimetable() {
    return { success: true, data: this.academicsService.getWeeklyTimetable() };
  }

  // Programmes
  @Get('programmes')
  @ApiOperation({ summary: 'Get all degree and diploma programmes' })
  async getProgrammes() {
    const data = await this.academicsService.getProgrammes();
    return { success: true, count: data.length, data };
  }

  @Post('programmes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new institutional programme (B.Tech, BBA, BCA, Diploma)' })
  async createProgramme(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Only Super Admin or Admin can create programmes.');
    }
    const prog = await this.academicsService.createProgramme(body);
    return { success: true, message: `Programme ${prog.name} established.`, data: prog };
  }

  @Put('programmes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update programme details' })
  async updateProgramme(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied.');
    }
    const prog = await this.academicsService.updateProgramme(id, body);
    return { success: true, message: `Programme ${prog.name} updated.`, data: prog };
  }

  // Academic Years
  @Get('academic-years')
  @ApiOperation({ summary: 'Get all institutional academic sessions' })
  async getAcademicYears() {
    const data = await this.academicsService.getAcademicYears();
    return { success: true, count: data.length, data };
  }

  @Post('academic-years')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Establish new academic year session' })
  async createAcademicYear(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied.');
    }
    const year = await this.academicsService.createAcademicYear(body);
    return { success: true, message: `Academic year ${year.year} configured.`, data: year };
  }

  // Course Offerings
  @Get('course-offerings')
  @ApiOperation({ summary: 'Get active course offerings and faculty assignments' })
  async getCourseOfferings(
    @Query('department') department?: string,
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
    @Query('programmeId') programmeId?: string,
  ) {
    const data = await this.academicsService.getCourseOfferings({ department, semester, academicYear, programmeId });
    return { success: true, count: data.length, data };
  }

  @Post('course-offerings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create course offering for session' })
  async createCourseOffering(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin' && role !== 'hod') {
      throw new ForbiddenException('Access denied.');
    }
    const offering = await this.academicsService.createCourseOffering(body);
    return { success: true, message: `Course offering ${offering.subjectCode} created.`, data: offering };
  }

  @Post('faculty-assignments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Allocate faculty to course offering and section' })
  async assignFaculty(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin' && role !== 'hod') {
      throw new ForbiddenException('Access denied. Only HOD or Administrator can assign faculty.');
    }
    const assignment = await this.academicsService.assignFacultyToCourse(body);
    return { success: true, message: 'Faculty assigned successfully!', data: assignment };
  }

  // Student Enrollments & Progression
  @Get('enrollments/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student academic enrollment history across semesters' })
  async getStudentEnrollments(@CurrentUser() user: any, @Param('studentId') studentId: string) {
    const role = normalizeRole(user.role);
    // Student can ONLY access their own enrollments
    if (role === 'student') {
      const myId = user.student?.id || user.identifier;
      if (studentId !== myId && studentId !== user.identifier) {
        throw new ForbiddenException('Access denied. You can only view your own enrollment history.');
      }
    }
    const data = await this.academicsService.getStudentEnrollments(studentId);
    return { success: true, count: data.length, data };
  }

  @Post('progression/promote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Promote student to next academic semester with historical record preservation' })
  async promoteStudent(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin' && role !== 'hod') {
      throw new ForbiddenException('Access denied. Only Academic Administrators can execute semester progression.');
    }
    const result = await this.academicsService.promoteStudentSemester(body);
    return { success: true, message: `Student promoted to ${body.targetSemester} successfully!`, data: result };
  }
}
