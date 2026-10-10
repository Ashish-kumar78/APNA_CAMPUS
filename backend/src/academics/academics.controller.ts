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
}
