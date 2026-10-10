import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
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
    if (role !== 'super_admin' && role !== 'principal' && role !== 'admin') {
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
}
