import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { normalizeRole } from '../rbac/rbac';
import { ClassNotesService } from './class-notes.service';

@ApiTags('Class Notes')
@Controller('class-notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassNotesController {
  constructor(private readonly classNotesService: ClassNotesService) {}

  @Get()
  @ApiOperation({ summary: 'List faculty-approved student notes scoped to section' })
  async getVerifiedNotes(
    @Query('subject') subject?: string,
    @Query('date') date?: string,
    @Query('search') search?: string,
    @Query('section') section?: string,
    @Query('semester') semester?: string,
    @CurrentUser() user?: any,
  ) {
    const resolvedSection = section || user?.student?.section || user?.section;
    const resolvedSemester = semester || user?.student?.semester || user?.semester;
    const data = await this.classNotesService.getVerifiedNotes({
      subject,
      date,
      search,
      section: resolvedSection,
      semester: resolvedSemester,
    });
    return { success: true, count: data.length, data };
  }

  @Post()
  @ApiOperation({ summary: 'Submit student notes for faculty review' })
  async uploadNote(@CurrentUser() user: any, @Body() body: any) {
    if (normalizeRole(user.role) !== 'student') {
      throw new ForbiddenException('Only students can submit class notes.');
    }
    const data = await this.classNotesService.uploadNote(
      user.identifier || user.registrationNumber || user.id,
      body,
    );
    return {
      success: true,
      message: 'Class notes submitted for faculty verification.',
      data,
    };
  }
}

@ApiTags('Faculty Class Notes')
@Controller('faculty/class-notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacultyClassNotesController {
  constructor(private readonly classNotesService: ClassNotesService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List student notes awaiting faculty review' })
  async getPendingNotes(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    if (!['faculty', 'hod', 'admin', 'super_admin'].includes(role)) {
      throw new ForbiddenException('Only faculty or academic administrators can review class notes.');
    }
    const data = await this.classNotesService.getPendingNotes(user.department);
    return { success: true, count: data.length, data };
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Approve a student note for publication' })
  async verifyNote(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (!['faculty', 'hod', 'admin', 'super_admin'].includes(role)) {
      throw new ForbiddenException('Only faculty or academic administrators can verify class notes.');
    }
    const data = await this.classNotesService.reviewNote(
      id,
      'VERIFIED',
      user.name || user.identifier,
      user.department,
    );
    return { success: true, message: 'Class note verified and published to students.', data };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a student note with review remarks' })
  async rejectNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('remarks') remarks?: string,
  ) {
    const role = normalizeRole(user.role);
    if (!['faculty', 'hod', 'admin', 'super_admin'].includes(role)) {
      throw new ForbiddenException('Only faculty or academic administrators can review class notes.');
    }
    const data = await this.classNotesService.reviewNote(
      id,
      'REJECTED',
      user.name || user.identifier,
      user.department,
      remarks,
    );
    return { success: true, message: 'Class note rejected.', data };
  }
}
