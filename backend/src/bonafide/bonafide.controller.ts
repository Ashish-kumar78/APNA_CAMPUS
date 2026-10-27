import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { BonafideService } from './bonafide.service';
import {
  CreateBonafideDto,
  ReviewBonafideDto,
  ResubmitBonafideDto,
  WithdrawBonafideDto,
} from './dto/create-bonafide.dto';
import { Response } from 'express';

@ApiTags('Bonafide Certificates')
@Controller('bonafide')
export class BonafideController {
  constructor(private readonly bonafideService: BonafideService) {}

  /**
   * 1. Dashboard Statistics
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get summary statistics for student or reviewing staff' })
  async getDashboardStats(@CurrentUser() user: any) {
    const data = await this.bonafideService.getDashboardStats(user);
    return { success: true, data };
  }

  /**
   * 2. Student Application List
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated student application list with filters' })
  async getMyApplications(@CurrentUser() user: any, @Query() query: any) {
    const result = await this.bonafideService.getMyApplications(user, query);
    return { success: true, ...result };
  }

  /**
   * 3. Review Queue for Authorized Staff
   */
  @Get('queue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get review queue for Placement, Scholarship Cell, or Principal' })
  async getReviewQueue(@CurrentUser() user: any, @Query() query: any) {
    const result = await this.bonafideService.getReviewQueue(user, query);
    return { success: true, ...result };
  }

  /**
   * 4. Master Fee Structures
   */
  @Get('fee-structures')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get approved master fee structures for course duration' })
  async getFeeStructures() {
    const data = await this.bonafideService.getFeeStructures();
    return { success: true, data };
  }

  /**
   * 5. Public Verification of Certificate
   */
  @Get('verify/:token')
  @ApiOperation({ summary: 'Verify an issued Bonafide Certificate by token' })
  async verifyCertificate(@Param('token') token: string) {
    const data = await this.bonafideService.verifyCertificate(token);
    return { success: true, ...data };
  }

  /**
   * 6. Get Application Details by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single application details with approval timeline' })
  async getApplicationById(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.bonafideService.getApplicationById(id, user);
    return { success: true, data };
  }

  /**
   * 7. Create New Application
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit or draft a new Bonafide Certificate application' })
  async createApplication(
    @CurrentUser() user: any,
    @Body() dto: CreateBonafideDto,
  ) {
    const data = await this.bonafideService.createApplication(user, dto);
    return {
      success: true,
      message: dto.isDraft ? 'Draft saved successfully!' : 'Application submitted successfully!',
      data,
    };
  }

  /**
   * 8. Update Draft Application
   */
  @Put(':id/draft')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing draft application' })
  async updateDraft(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateBonafideDto,
  ) {
    const data = await this.bonafideService.updateDraft(id, user, dto);
    return { success: true, message: 'Draft updated successfully!', data };
  }

  /**
   * 9. Resubmit Corrected Application
   */
  @Post(':id/resubmit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resubmit a rejected or changes-requested application' })
  async resubmitApplication(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ResubmitBonafideDto,
  ) {
    const data = await this.bonafideService.resubmitApplication(id, user, dto);
    return {
      success: true,
      message: 'Application resubmitted with corrections successfully!',
      data,
    };
  }

  /**
   * 10. Withdraw Application
   */
  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw a pending application' })
  async withdrawApplication(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: WithdrawBonafideDto,
  ) {
    const data = await this.bonafideService.withdrawApplication(id, user, dto);
    return { success: true, message: 'Application withdrawn successfully.', data };
  }

  /**
   * 11. Record Review Decision (Approve / Reject / Request Changes)
   */
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit stage review decision (Placement, Scholarship, Principal)' })
  async recordReviewDecision(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReviewBonafideDto,
  ) {
    const data = await this.bonafideService.recordReviewDecision(id, user, dto);
    return {
      success: true,
      message: `Application decision recorded: ${dto.action}`,
      data,
    };
  }

  /**
   * 12. Download Official Certificate PDF
   */
  @Get(':id/certificate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download final issued official Bonafide Certificate PDF' })
  async downloadCertificate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    return this.bonafideService.generateCertificatePdf(id, user, res);
  }

  /**
   * 13. Preview Draft Certificate PDF
   */
  @Get(':id/preview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preview watermarked draft Certificate PDF' })
  async previewCertificate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    return this.bonafideService.generatePreviewPdf(id, user, res);
  }
}
