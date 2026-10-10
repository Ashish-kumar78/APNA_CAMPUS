import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarksService } from './marks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Marks Management')
@Controller('marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Get('student')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student marks with strict self-access enforcement for students' })
  async getStudentMarks(@CurrentUser() user: any, @Query('rollNumber') rollNumber?: string) {
    const role = normalizeRole(user.role);

    // Security Rule: Student can NEVER query another student's marks (IDOR protection)
    let targetRoll = rollNumber;
    if (role === 'student') {
      const studentRoll = user.student?.rollNumber || user.identifier;
      if (rollNumber && rollNumber.toLowerCase() !== studentRoll.toLowerCase()) {
        throw new ForbiddenException('Access denied. You are only authorized to view your own marks.');
      }
      targetRoll = studentRoll;
    }

    const data = await this.marksService.getStudentMarks(targetRoll || '01');
    return { success: true, count: data.length, data };
  }

  @Get('section/:subjectCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get marksheet for a subject and section (Faculty/HOD/Exam/Principal only)' })
  async getSectionMarks(
    @CurrentUser() user: any,
    @Param('subjectCode') subjectCode: string,
    @Query('section') section?: string,
  ) {
    const role = normalizeRole(user.role);
    if (role === 'student') {
      throw new ForbiddenException('Access denied. Students cannot access class marksheets.');
    }
    const authorized = ['super_admin', 'management', 'principal', 'admin', 'hod', 'faculty', 'exam_cell'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied for role ${user.role} to class marksheets.`);
    }

    const data = await this.marksService.getSectionMarks(subjectCode, section || 'Section A');
    return { success: true, count: data.length, data };
  }

  @Put('cell')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update assessment mark (Faculty/HOD/Exam Cell only)' })
  async updateCell(
    @CurrentUser() user: any,
    @Body() body: {
      studentId?: string;
      rollNumber?: string;
      subjectCode: string;
      assessment: string;
      score: number;
      reason?: string;
    },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'hod', 'faculty', 'exam_cell'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied. Role ${user.role} is not permitted to modify marks.`);
    }

    const updated = await this.marksService.updateCellMark({
      ...body,
      user: user.name || user.identifier,
      role: user.role,
    });
    return { success: true, message: 'Mark updated and recalculated.', data: updated };
  }

  @Get('approval-queue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get moderation approval queue' })
  async getApprovalQueue(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'principal', 'hod', 'exam_cell', 'faculty'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to marks moderation queue.');
    }

    const data = await this.marksService.getApprovalQueue();
    return { success: true, count: data.length, data };
  }

  @Post('submit-to-hod')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Faculty submits marks to HOD for moderation' })
  async submitToHod(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'faculty' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only course faculty can submit marks for moderation.');
    }
    const item = await this.marksService.submitToHod(body);
    return { success: true, message: 'Marks submitted to HOD moderation queue.', data: item };
  }

  @Post('hod/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'HOD/Exam Cell approves assessment marks' })
  async approve(@CurrentUser() user: any, @Body() body: { id: string }) {
    const role = normalizeRole(user.role);
    if (role !== 'hod' && role !== 'exam_cell' && role !== 'principal' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only HOD, Exam Cell, or Principal can approve marks moderation.');
    }
    const approved = await this.marksService.approveQueueItem(body.id);
    return { success: true, message: `Marks for ${approved.subject} officially APPROVED and published!`, data: approved };
  }

  @Post('hod/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'HOD rejects marks with revision notes' })
  async reject(@CurrentUser() user: any, @Body() body: { id: string; rejectionReason: string }) {
    const role = normalizeRole(user.role);
    if (role !== 'hod' && role !== 'exam_cell' && role !== 'principal' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only HOD, Exam Cell, or Principal can return marks for revision.');
    }
    const rejected = await this.marksService.rejectQueueItem(body.id, body.rejectionReason);
    return { success: true, message: `Marks for ${rejected.subject} returned to faculty for revision.`, data: rejected };
  }

  @Post('hod/unlock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'HOD unlocks marks for faculty correction' })
  async unlock(@CurrentUser() user: any, @Body() body: { id: string }) {
    const role = normalizeRole(user.role);
    if (role !== 'hod' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only HOD or Super Admin can unlock frozen marks.');
    }
    const unlocked = await this.marksService.unlockQueueItem(body.id);
    return { success: true, message: `Marks for ${unlocked.subject} unlocked for editing.`, data: unlocked };
  }

  @Get('scheme')
  @ApiOperation({ summary: 'Get autonomous continuous evaluation marking scheme' })
  async getMarkingScheme() {
    const data = await this.marksService.getMarkingSchemes();
    return { success: true, count: data.length, data };
  }

  @Put('scheme/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update marking scheme (Admin council only)' })
  async updateMarkingScheme(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin' && role !== 'admin' && role !== 'principal') {
      throw new ForbiddenException('Access denied. Only Academic Council/Admin can modify evaluation schemes.');
    }
    const updated = await this.marksService.updateMarkingScheme(id, body);
    return { success: true, message: 'Marking scheme updated.', data: updated };
  }
}
