import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students with strict RBAC scoping and filters' })
  async getAllStudents(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('semester') semester?: string,
    @Query('section') section?: string,
    @Query('status') status?: string,
  ) {
    const role = normalizeRole(user.role);

    // Rule 1: Student role is strictly forbidden from accessing student rosters
    if (role === 'student') {
      throw new ForbiddenException('Access denied. Students are not authorized to access student rosters.');
    }

    // Roles authorized to view student records
    const allowedRoles = ['super_admin', 'management', 'principal', 'admin', 'hod', 'faculty', 'exam_cell', 'placement', 'accounts'];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(`Access denied for role ${user.role} to view student records.`);
    }

    let scopedDept = department;
    // Rule 2: HOD and Faculty are strictly scoped to their own department
    if (role === 'hod' || role === 'faculty') {
      scopedDept = user.department || 'Computer Science & Engineering';
    }

    const data = await this.studentsService.getAllStudents({ search, department: scopedDept, semester, section, status });
    return { success: true, count: data.length, data };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged-in student full profile' })
  async getProfile(@CurrentUser() user: any) {
    const identifier = user.student?.id || user.student?.rollNumber || user.identifier || user.id;
    const student = await this.studentsService.getProfile(identifier);
    return { success: true, data: student };
  }

  @Post('transfer-preference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save temporary campus preference declaration from student dashboard' })
  async saveTransfer(
    @CurrentUser() user: any,
    @Body() body: { campus: string; city: string; confirmed: boolean },
  ) {
    const student = await this.studentsService.saveTransferPreference(
      user.student?.id || user.identifier || '01',
      body.campus,
      body.city,
    );
    return { success: true, message: `Preference saved: ${body.campus}, ${body.city}.`, data: student };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new student (Admin portal only)' })
  async createStudent(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Campus Admin or Super Admin can register student records.');
    }
    const student = await this.studentsService.createStudent(body);
    return { success: true, message: `Student ${student.name} created successfully!`, data: student };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student by ID (Admin portal only)' })
  async updateStudent(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Campus Admin or Super Admin can modify student records.');
    }
    const updated = await this.studentsService.updateStudent(id, body);
    return { success: true, message: `Student ${updated.name} updated.`, data: updated };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete student by ID (Super Admin only)' })
  async deleteStudent(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Super Admin can purge student records.');
    }
    await this.studentsService.deleteStudent(id);
    return { success: true, message: 'Student deleted successfully.' };
  }
}
