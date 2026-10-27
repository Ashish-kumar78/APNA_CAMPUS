import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InternshipService } from './internship.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';
import { IssueIdCardDto, PreviewIdCardDto } from './dto/issue-id-card.dto';
import { ReissueIdCardDto, RenewIdCardDto, RevokeIdCardDto } from './dto/card-actions.dto';
import { Response } from 'express';

@ApiTags('Internship Cell')
@Controller('internship')
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) {}

  /**
   * 1. Dashboard Statistics
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get live Internship Cell dashboard statistics' })
  async getStats() {
    const data = await this.internshipService.getDashboardStats();
    return { success: true, data };
  }

  @Get('id-cards/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alias for ID card dashboard statistics' })
  async getIdCardStats() {
    const data = await this.internshipService.getDashboardStats();
    return { success: true, data };
  }

  /**
   * 2. Search Eligible Students
   */
  @Get('students')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search students eligible for internship & ID card generation' })
  async searchStudents(
    @CurrentUser() user: any,
    @Query('query') query?: string,
    @Query('department') department?: string,
    @Query('batch') batch?: string,
    @Query('course') course?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'management', 'principal', 'admin', 'placement', 'hod', 'faculty'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied. Only Internship/Placement staff can search student rosters.');
    }

    const result = await this.internshipService.searchStudents({
      query,
      department,
      batch,
      course,
      page,
      limit,
    });
    return { success: true, ...result };
  }

  /**
   * 3. Fetch Single Student by Registration Number
   */
  @Get('students/:registrationNo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve verified student profile and eligibility by registration number' })
  async getStudentByRegistration(
    @CurrentUser() user: any,
    @Param('registrationNo') registrationNo: string,
  ) {
    const role = normalizeRole(user.role);
    // Student can only access their own registration number
    if (role === 'student') {
      const userStudentRoll = user.student?.rollNumber || user.student?.studentId || user.identifier;
      if (userStudentRoll !== registrationNo && user.student?.id !== registrationNo) {
        throw new ForbiddenException('Access denied. You may only view your own internship record.');
      }
    }

    const student = await this.internshipService.getStudentByRegistrationNo(registrationNo);
    return { success: true, data: student };
  }

  /**
   * 4. ID Card List
   */
  @Get('id-cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List persistent ID card records with filters and pagination' })
  async getIdCards(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('batch') batch?: string,
    @Query('status') status?: string,
    @Query('company') company?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const role = normalizeRole(user.role);
    if (role === 'student') {
      const reg = user.student?.rollNumber || user.student?.studentId || user.identifier;
      const result = await this.internshipService.getIdCards({ search: reg, limit: 10 });
      return { success: true, ...result };
    }

    const result = await this.internshipService.getIdCards({
      search,
      department,
      batch,
      status,
      company,
      page,
      limit,
    });
    return { success: true, ...result };
  }

  /**
   * 5. Generate Preview
   */
  @Post('id-cards/preview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate validated ID card preview for an eligible student' })
  async previewIdCard(@Body() dto: PreviewIdCardDto) {
    const preview = await this.internshipService.generatePreview(dto);
    return { success: true, data: preview };
  }

  /**
   * 6. Issue Official ID Card
   */
  @Post('id-cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue an official Internship ID card with persistence' })
  async issueIdCard(@CurrentUser() user: any, @Body() dto: IssueIdCardDto) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'management', 'principal', 'admin', 'placement'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied. Only authorized Internship Cell staff can issue ID cards.');
    }

    const result = await this.internshipService.issueIdCard(dto, user);
    return {
      success: true,
      message: result.message,
      card: result.card,
      data: result.card,
    };
  }

  /**
   * 7. Get ID Card by ID
   */
  @Get('id-cards/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve an individual ID card record by ID or Card Number' })
  async getIdCardById(@Param('id') id: string) {
    const card = await this.internshipService.getIdCardById(id);
    return { success: true, data: card };
  }

  /**
   * 8. Download ID Card PDF
   */
  @Get('id-cards/:id/pdf')
  @ApiOperation({ summary: 'Download official high-resolution ID card PDF' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    await this.internshipService.generateCardPdf(id, res);
  }

  /**
   * 9. Reissue ID Card
   */
  @Post('id-cards/:id/reissue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reissue a lost or damaged ID card' })
  async reissueIdCard(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ReissueIdCardDto,
  ) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'management', 'principal', 'admin', 'placement'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied. Only authorized staff can reissue ID cards.');
    }

    const updated = await this.internshipService.reissueIdCard(id, dto, user);
    return {
      success: true,
      message: `Card successfully reissued as #${updated.cardNumber}!`,
      data: updated,
    };
  }

  /**
   * 10. Renew ID Card
   */
  @Post('id-cards/:id/renew')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renew or extend an existing ID card validity' })
  async renewIdCard(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RenewIdCardDto,
  ) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'management', 'principal', 'admin', 'placement'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied. Only authorized staff can renew ID cards.');
    }

    const updated = await this.internshipService.renewIdCard(id, dto, user);
    return {
      success: true,
      message: `Card #${updated.cardNumber} successfully renewed!`,
      data: updated,
    };
  }

  /**
   * 11. Revoke ID Card
   */
  @Post('id-cards/:id/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke an ID card with reason and audit trail' })
  async revokeIdCard(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RevokeIdCardDto,
  ) {
    const role = normalizeRole(user.role);
    const allowed = ['super_admin', 'management', 'principal', 'admin', 'placement'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException('Access denied. Only authorized staff can revoke ID cards.');
    }

    const updated = await this.internshipService.revokeIdCard(id, dto, user);
    return {
      success: true,
      message: `Card #${updated.cardNumber} has been revoked.`,
      data: updated,
    };
  }

  /**
   * 12. Public Secure QR Code Verification
   */
  @Get('id-cards/verify/:token')
  @ApiOperation({ summary: 'Public endpoint to verify card authenticity without sensitive PII' })
  async verifyCard(@Param('token') token: string) {
    const verification = await this.internshipService.verifyCard(token);
    return { success: true, ...verification };
  }
}
