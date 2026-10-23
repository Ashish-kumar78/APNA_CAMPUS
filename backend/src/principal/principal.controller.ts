import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrincipalService } from './principal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Principal / Director Command Center')
@Controller('principal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}

  private checkPrincipalAccess(user: any) {
    const role = normalizeRole(user?.role);
    const allowed = ['principal', 'super_admin'];
    if (!allowed.includes(role)) {
      throw new ForbiddenException(
        'Access denied. Only Principal, Director, or Super Administrator can access executive leadership endpoints.'
      );
    }
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get campus executive overview metrics and department governance status' })
  async getOverview(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear?: string,
  ) {
    this.checkPrincipalAccess(user);
    return this.principalService.getOverview(academicYear);
  }

  @Get('academic-analytics')
  @ApiOperation({ summary: 'Get institutional academic analytics, pass percentages, honors list, and at-risk courses' })
  async getAcademicAnalytics(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear?: string,
    @Query('program') program?: string,
    @Query('department') department?: string,
    @Query('semester') semester?: string,
  ) {
    this.checkPrincipalAccess(user);
    return this.principalService.getAcademicAnalytics(academicYear, program, department, semester);
  }

  @Get('leaves')
  @ApiOperation({ summary: 'Get multi-level leave approvals queue awaiting Principal final clearance' })
  async getLeaves(@CurrentUser() user: any) {
    this.checkPrincipalAccess(user);
    const data = await this.principalService.getLeaves();
    return data;
  }

  @Post('leaves/:id/decision')
  @ApiOperation({ summary: 'Approve or reject leave application with mandatory remarks' })
  async decideLeave(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT'; remarks?: string },
  ) {
    this.checkPrincipalAccess(user);
    return this.principalService.decideLeave(
      id,
      body.action,
      body.remarks || '',
      { name: user.name, role: user.role, identifier: user.identifier }
    );
  }

  @Get('circulars')
  @ApiOperation({ summary: 'Get institutional circulars and notice clearance board' })
  async getCirculars(@CurrentUser() user: any) {
    this.checkPrincipalAccess(user);
    const data = await this.principalService.getCirculars();
    return { success: true, count: data.length, data };
  }

  @Post('circulars')
  @ApiOperation({ summary: 'Publish and broadcast official Principal circular' })
  async createCircular(
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    this.checkPrincipalAccess(user);
    return this.principalService.createCircular(body, user);
  }

  @Post('circulars/:id/clearance')
  @ApiOperation({ summary: 'Approve or reject department-submitted circular clearance' })
  async decideCircular(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT'; remarks?: string },
  ) {
    this.checkPrincipalAccess(user);
    return this.principalService.decideCircular(id, body.action, body.remarks || '', user);
  }
}
