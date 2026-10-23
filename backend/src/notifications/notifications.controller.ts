import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Faculty Academic Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('metadata')
  @ApiOperation({ summary: 'Get notification categories and priority levels' })
  getMetadata() {
    return { success: true, data: this.notificationsService.getMetadata() };
  }

  // ============================================================================
  // FACULTY ENDPOINTS
  // ============================================================================

  @Get('faculty')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of notifications sent by logged-in faculty with read statistics' })
  async getFacultyNotifications(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['faculty', 'hod', 'super_admin', 'principal'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Role ${user.role} is not authorized.`);
    }

    const facultyName = user.name || user.identifier || 'Dr. S. Mohanty';
    const data = await this.notificationsService.getFacultyNotifications(facultyName);
    return { success: true, count: data.length, data };
  }

  @Post('faculty/preview-recipients')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dynamically preview eligible student recipients based on faculty assignment criteria' })
  async previewRecipients(
    @CurrentUser() user: any,
    @Body() body: { semester?: string; section?: string; subjectCode?: string; program?: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['faculty', 'hod', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied.`);
    }

    return this.notificationsService.previewRecipients(body);
  }

  @Post('faculty')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create and broadcast targeted academic notification to students' })
  async createNotification(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['faculty', 'hod', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied. Only authorized faculty or HOD can compose notifications.`);
    }

    const facultyUser = {
      id: user.id || user.identifier,
      name: user.name || user.identifier || 'Dr. S. Mohanty',
      designation: user.designation || 'Associate Professor',
      email: user.email || 's.mohanty@gift.edu.in'
    };

    return this.notificationsService.createNotification(facultyUser, body);
  }

  @Delete('faculty/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a scheduled notification before delivery' })
  async cancelNotification(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['faculty', 'hod', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied.`);
    }

    return this.notificationsService.cancelNotification(id, user.name);
  }

  // ============================================================================
  // STUDENT ENDPOINTS
  // ============================================================================

  @Get('student')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notifications targeted to student academic cohort' })
  async getStudentNotifications(@CurrentUser() user: any) {
    const studentRoll = user.student?.rollNumber || user.identifier || '01';
    const data = await this.notificationsService.getStudentNotifications(studentRoll);
    return { success: true, count: data.length, data };
  }

  @Post('student/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark academic notification as read' })
  async markNotificationRead(@CurrentUser() user: any, @Param('id') id: string) {
    const studentRoll = user.student?.rollNumber || user.identifier || '01';
    return this.notificationsService.markNotificationAsRead(id, studentRoll);
  }
}
