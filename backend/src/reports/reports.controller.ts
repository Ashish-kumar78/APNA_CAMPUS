import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './reports.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('filters')
  @ApiOperation({ summary: 'Get dynamic report filter configurations and authorized scope' })
  async getFilters(@CurrentUser() user: any) {
    return this.reportsService.getFilterOptions(user);
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Generate student attendance report with classes held, present, absent, percentage' })
  async getAttendanceReport(@Query() query: ReportQueryDto, @CurrentUser() user: any) {
    return this.reportsService.generateReport({ ...query, reportType: 'attendance' }, user);
  }

  @Get('cgpa')
  @ApiOperation({ summary: 'Generate cumulative student CGPA performance report with academic standing' })
  async getCgpaReport(@Query() query: ReportQueryDto, @CurrentUser() user: any) {
    return this.reportsService.generateReport({ ...query, reportType: 'cgpa' }, user);
  }

  @Get('sgpa')
  @ApiOperation({ summary: 'Generate semester SGPA performance report with examination result status' })
  async getSgpaReport(@Query() query: ReportQueryDto, @CurrentUser() user: any) {
    return this.reportsService.generateReport({ ...query, reportType: 'sgpa' }, user);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Generate student document submission and verification compliance report' })
  async getDocumentsReport(@Query() query: ReportQueryDto, @CurrentUser() user: any) {
    return this.reportsService.generateReport({ ...query, reportType: 'document' }, user);
  }

  @Get('export')
  @ApiOperation({ summary: 'Download filtered report as Microsoft Excel (.xlsx) spreadsheet' })
  async exportExcel(
    @Query() query: ReportQueryDto,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.reportsService.generateExcelExport(query, user);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
