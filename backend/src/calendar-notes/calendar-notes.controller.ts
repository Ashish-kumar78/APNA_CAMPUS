import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CalendarNotesService } from './calendar-notes.service';
import { CreateCalendarNoteDto, UpdateCalendarNoteDto } from './calendar-notes.dto';

@ApiTags('Calendar Notes & Mandatory Reminders')
@Controller('calendar-notes')
export class CalendarNotesController {
  constructor(private readonly calendarNotesService: CalendarNotesService) {}

  /**
   * Helper to merge user identity from JWT or request headers
   */
  private extractUser(currentUser: any, req: any) {
    const user = currentUser || {};
    const headerUserId = req?.headers?.['x-user-id'];
    const headerUserRole = req?.headers?.['x-user-role'];
    return {
      ...user,
      id: headerUserId || user.id || user.identifier || 'user-default',
      role: headerUserRole || user.role,
    };
  }

  /**
   * 1. Get notes for the authenticated user
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get calendar notes for the authenticated user' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date YYYY-MM-DD' })
  @ApiQuery({ name: 'month', required: false, description: 'Filter by month YYYY-MM' })
  async getNotes(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Query('date') date?: string,
    @Query('month') month?: string,
  ) {
    const user = this.extractUser(currentUser, req);
    const notes = await this.calendarNotesService.getNotes(user, date, month);
    return { success: true, notes };
  }

  /**
   * 2. Get pending mandatory reminders for CMS login / dashboard open
   */
  @Get('pending-reminders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending reminders for today and overdue dates' })
  @ApiQuery({ name: 'currentDate', required: false, description: 'Current client date YYYY-MM-DD' })
  async getPendingReminders(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Query('currentDate') currentDate?: string,
  ) {
    const user = this.extractUser(currentUser, req);
    const reminders = await this.calendarNotesService.getPendingReminders(user, currentDate);
    return { success: true, reminders };
  }

  /**
   * 3. Create a new personal calendar note
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new personal calendar note' })
  async createNote(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateCalendarNoteDto,
  ) {
    const user = this.extractUser(currentUser, req);
    const note = await this.calendarNotesService.createNote(user, dto);
    return { success: true, note };
  }

  /**
   * 4. Update an existing calendar note (title, description, scheduledDate)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing calendar note' })
  async updateNote(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarNoteDto,
  ) {
    const user = this.extractUser(currentUser, req);
    const note = await this.calendarNotesService.updateNote(user, id, dto);
    return { success: true, note };
  }

  /**
   * 5. Submit note (mark as Completed, permanently clearing from pending reminders)
   */
  @Patch(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a reminder as completed' })
  async submitNote(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    const note = await this.calendarNotesService.submitNote(user, id);
    return { success: true, note };
  }

  /**
   * 6. Delete a calendar note
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a calendar note' })
  async deleteNote(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    const res = await this.calendarNotesService.deleteNote(user, id);
    return res;
  }
}

