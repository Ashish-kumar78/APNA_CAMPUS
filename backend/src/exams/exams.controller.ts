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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Autonomous Examination Management (CoE)')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // 1. Dashboard Metrics & KPIs
  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get live examination cell operational KPIs and calendar' })
  async getDashboardStats(@CurrentUser() user: any) {
    const role = normalizeRole(user?.role);
    const authorized = ['super_admin', 'principal', 'management', 'exam_cell', 'hod', 'faculty'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to examination operations dashboard.');
    }
    const data = await this.examsService.getDashboardStats();
    return { success: true, data };
  }

  // 2. Exam Cycles
  @Get('cycles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all autonomous examination cycles' })
  async getExamCycles(@CurrentUser() user: any) {
    const data = await this.examsService.getExamCycles();
    return { success: true, count: data.length, data };
  }

  @Post('cycles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new examination cycle (CoE only)' })
  async createExamCycle(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user?.role);
    if (role !== 'exam_cell' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Controller of Examinations can create examination cycles.');
    }
    const data = await this.examsService.createExamCycle(body, user);
    return { success: true, message: 'Examination cycle created successfully.', data };
  }

  @Post('cycles/:id/transition')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transition exam cycle lifecycle state' })
  async transitionCycle(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const role = normalizeRole(user?.role);
    if (role !== 'exam_cell' && role !== 'super_admin' && role !== 'principal') {
      throw new ForbiddenException('Access denied to transition examination cycle state.');
    }
    const res = await this.examsService.transitionCycleStatus(id, status, user);
    return res;
  }

  // 3. Timetable & Scheduling
  @Get('timetable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exam timetable slots' })
  async getExamTimetable(@CurrentUser() user: any) {
    const data = await this.examsService.getExamTimetable();
    return { success: true, count: data.length, data };
  }

  @Post('timetable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule exam paper with conflict validation' })
  async createTimetableEntry(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user?.role);
    if (role !== 'exam_cell' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Examination Cell can schedule papers.');
    }
    const data = await this.examsService.createTimetableEntry(body);
    return { success: true, message: 'Examination paper scheduled successfully.', data };
  }

  // 4. Seating & Door Charts
  @Get('seating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hall seating arrangements & door charts' })
  async getSeatingArrangements(@CurrentUser() user: any) {
    const data = await this.examsService.getSeatingArrangements();
    return { success: true, count: data.length, data };
  }

  @Post('seating/auto-optimize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute anti-cheating roll staggering across halls' })
  async autoOptimizeSeating(@CurrentUser() user: any) {
    const role = normalizeRole(user?.role);
    if (role !== 'exam_cell' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied to execute seating optimization engine.');
    }
    const res = await this.examsService.autoOptimizeSeating();
    return res;
  }

  // 5. Hall Tickets / Admit Cards
  @Get('hall-tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hall ticket eligibility roster' })
  async getHallTickets(@CurrentUser() user: any) {
    const data = await this.examsService.getHallTickets();
    return { success: true, count: data.length, data };
  }

  // 6. Marks Moderation (CIE)
  @Get('moderation/:subjectCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get continuous evaluation marks for moderation' })
  async getModerationMarks(
    @CurrentUser() user: any,
    @Param('subjectCode') subjectCode: string,
  ) {
    const data = await this.examsService.getModerationMarks(subjectCode);
    return { success: true, data };
  }

  // 7. SGPA/CGPA Grade Roster
  @Get('results/roster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get autonomous student SGPA/CGPA grade roster' })
  async getGradeRoster(@CurrentUser() user: any) {
    const data = await this.examsService.getGradeRoster();
    return { success: true, count: data.length, data };
  }

  // 8. Re-evaluation & Scrutiny
  @Get('re-evaluation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List paper re-evaluation and scrutiny applications' })
  async getReevaluationRequests(@CurrentUser() user: any) {
    const data = await this.examsService.getReevaluationRequests();
    return { success: true, count: data.length, data };
  }

  // 9. CoE Circulars
  @Get('circulars')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List official examination circulars' })
  async getExamCirculars(@CurrentUser() user: any) {
    const data = await this.examsService.getExamCirculars();
    return { success: true, count: data.length, data };
  }
}
