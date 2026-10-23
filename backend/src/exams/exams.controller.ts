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
import { CreateExamCycleDto, TransitionExamCycleDto } from './exams.dto';

@ApiTags('Autonomous Examination Management (CoE)')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  private readonly operationalRoles = ['super_admin', 'principal', 'management', 'exam_cell'];

  private assertOperationalAccess(user: any, message: string) {
    if (!this.operationalRoles.includes(normalizeRole(user?.role))) {
      throw new ForbiddenException(message);
    }
  }

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
    this.assertOperationalAccess(user, 'Access denied to examination cycle records.');
    const data = await this.examsService.getExamCycles();
    return { success: true, count: data.length, data };
  }

  @Post('cycles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new examination cycle (CoE only)' })
  async createExamCycle(@CurrentUser() user: any, @Body() body: CreateExamCycleDto) {
    const role = normalizeRole(user?.role);
    if (role !== 'exam_cell' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Examination Cell can create examination cycles.');
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
    @Body() body: TransitionExamCycleDto,
  ) {
    const role = normalizeRole(user?.role);
    if (role !== 'exam_cell' && role !== 'super_admin' && role !== 'principal') {
      throw new ForbiddenException('Access denied to transition examination cycle state.');
    }
    const res = await this.examsService.transitionCycleStatus(id, body.status, user);
    return res;
  }

  // 3. Timetable & Scheduling
  @Get('timetable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exam timetable slots' })
  async getExamTimetable(@CurrentUser() user: any) {
    return this.examsService.getExamTimetable();
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
    return this.examsService.createTimetableEntry(body);
  }

  // 4. Seating & Door Charts
  @Get('seating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hall seating arrangements & door charts' })
  async getSeatingArrangements(@CurrentUser() user: any) {
    this.assertOperationalAccess(user, 'Access denied to examination hall and seating records.');
    return this.examsService.getSeatingArrangements();
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
    return this.examsService.autoOptimizeSeating();
  }

  // 5. Hall Tickets / Admit Cards
  @Get('hall-tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hall ticket eligibility roster' })
  async getHallTickets(@CurrentUser() user: any) {
    this.assertOperationalAccess(user, 'Access denied to the hall ticket eligibility roster.');
    return this.examsService.getHallTickets();
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
    this.assertOperationalAccess(user, 'Access denied to examination moderation records.');
    const data = await this.examsService.getModerationMarks(subjectCode);
    return { success: true, data };
  }

  // 7. SGPA/CGPA Grade Roster
  @Get('results/roster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get autonomous student SGPA/CGPA grade roster' })
  async getGradeRoster(@CurrentUser() user: any) {
    this.assertOperationalAccess(user, 'Access denied to certified examination results.');
    return this.examsService.getGradeRoster();
  }

  // 8. Re-evaluation & Scrutiny
  @Get('re-evaluation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List paper re-evaluation and scrutiny applications' })
  async getReevaluationRequests(@CurrentUser() user: any) {
    this.assertOperationalAccess(user, 'Access denied to re-evaluation requests.');
    return this.examsService.getReevaluationRequests();
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
