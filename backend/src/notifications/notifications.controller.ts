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
  ForbiddenException,
  Sse,
  MessageEvent,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';
import { NotificationDispatchInput } from './notification-events';
import * as jwt from 'jsonwebtoken';

@ApiTags('Central Institutional Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('metadata')
  @ApiOperation({ summary: 'Get notification categories and priority levels' })
  getMetadata() {
    return { success: true, data: this.notificationsService.getMetadata() };
  }

  // ============================================================================
  // 1. UNIVERSAL ROLE-BASED NOTIFICATION RETRIEVAL & ACTIONS
  // ============================================================================

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List notifications for current authenticated user with filters & search' })
  async getMyNotifications(
    @CurrentUser() user: any,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getUserNotifications(user, {
      category,
      priority,
      unreadOnly,
      search,
      page,
      limit,
    });
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current unread notification count for active user' })
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user);
    return { success: true, unreadCount: count };
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark specific notification as read for current user' })
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user, id);
  }

  @Post('mark-all-read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all eligible unread notifications as read for current user' })
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user);
  }

  @Post('clear-read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dismiss all read notifications from current user view' })
  async clearRead(@CurrentUser() user: any) {
    return this.notificationsService.clearRead(user);
  }

  // ============================================================================
  // 2. REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
  // ============================================================================

  @Sse('stream')
  @ApiOperation({ summary: 'Subscribe to real-time notification events stream via SSE' })
  streamNotifications(@Req() req: any, @Query('token') queryToken?: string): Observable<MessageEvent> {
    // Authenticate stream via Bearer header or ?token= query parameter (for standard EventSource)
    let token = queryToken;
    if (!token && req.headers?.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      // In development / local testing without token, create demo user
      const guestUser = { id: 'anonymous-guest', role: 'STUDENT', identifier: '01' };
      return this.notificationsService.getRealtimeStream(guestUser);
    }

    try {
      const secret = process.env.JWT_SECRET || '54eca25b55f4effea7c308deebbf95aa';
      const decoded = jwt.verify(token, secret) as any;
      const user = {
        id: decoded.sub || decoded.id,
        role: decoded.role || 'STUDENT',
        identifier: decoded.identifier || decoded.email || '01',
        email: decoded.email,
        student: decoded.student,
      };
      return this.notificationsService.getRealtimeStream(user);
    } catch {
      const fallbackUser = { id: 'fallback-user', role: 'STUDENT', identifier: '01' };
      return this.notificationsService.getRealtimeStream(fallbackUser);
    }
  }

  // ============================================================================
  // 3. SECURE DISPATCH ENDPOINT (Authorized Roles & Internal Workflows)
  // ============================================================================

  @Post('dispatch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dispatch new cross-module notification to resolved recipients' })
  async dispatchNotification(@CurrentUser() user: any, @Body() body: NotificationDispatchInput) {
    const role = normalizeRole(user.role);
    const authorizedRoles = [
      'super_admin',
      'principal',
      'management',
      'admin',
      'exam_cell',
      'hod',
      'faculty',
      'accounts',
      'placement',
      'hostel',
      'warden',
      'transport',
      'admissions',
    ];

    if (!authorizedRoles.includes(role)) {
      throw new ForbiddenException(`Role ${user.role} is not authorized to dispatch notifications.`);
    }

    const payload: NotificationDispatchInput = {
      ...body,
      senderId: body.senderId || user.id,
      senderName: body.senderName || user.name || user.identifier,
      senderRole: body.senderRole || user.role,
      senderDept: body.senderDept || user.department,
    };

    return this.notificationsService.dispatch(payload);
  }

  // ============================================================================
  // 4. USER NOTIFICATION PREFERENCES
  // ============================================================================

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user notification channels preferences' })
  async getPreferences(@CurrentUser() user: any) {
    return this.notificationsService.getPreferences(user);
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification channels preferences' })
  async updatePreferences(@CurrentUser() user: any, @Body() body: any) {
    return this.notificationsService.updatePreferences(user, body);
  }

  // ============================================================================
  // 5. BACKWARDS COMPATIBILITY (Faculty & Student Endpoints)
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
    @Body() body: { semester?: string; section?: string; subjectCode?: string; program?: string },
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
      email: user.email || 's.mohanty@gift.edu.in',
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
