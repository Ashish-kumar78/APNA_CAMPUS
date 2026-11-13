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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { LaboratoryService } from './laboratory.service';
import {
  CreateRequisitionDto,
  ReviewRequisitionDto,
  IssueStockDto,
  CreateComplaintDto,
  ReviewComplaintDto,
  UpdateWorkOrderDto,
  RecordPracticalAttendanceDto,
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './dto/laboratory.dto';

@ApiTags('Laboratory Operations, Requisitions & Maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('laboratories')
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  // 1. LABORATORIES DIRECTORY
  @Get()
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN, Role.FACULTY, Role.HOD, Role.STUDENT)
  @ApiOperation({ summary: 'Get all laboratories filtered dynamically by department/branch' })
  async getLaboratories(@Query('department') department?: string) {
    return this.laboratoryService.getLaboratories(department);
  }

  @Get('code/:code')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN, Role.FACULTY, Role.HOD)
  @ApiOperation({ summary: 'Get laboratory details by unique code' })
  async getLaboratoryByCode(@Param('code') code: string) {
    return this.laboratoryService.getLaboratoryByCode(code);
  }

  // 2. EQUIPMENT & INVENTORY
  @Get('equipment')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN, Role.FACULTY, Role.HOD)
  @ApiOperation({ summary: 'Get laboratory equipment catalog filtered by branch and room' })
  async getEquipment(
    @Query('department') department?: string,
    @Query('labCode') labCode?: string,
  ) {
    return this.laboratoryService.getEquipment(department, labCode);
  }

  @Post('equipment')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new equipment record' })
  async createEquipment(@Body() dto: CreateEquipmentDto) {
    return this.laboratoryService.createEquipment(dto);
  }

  @Patch('equipment/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Update equipment inventory or maintenance status' })
  async updateEquipment(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.laboratoryService.updateEquipment(id, dto);
  }

  @Delete('equipment/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete equipment record (Super Admin only)' })
  async deleteEquipment(@Param('id') id: string) {
    return this.laboratoryService.deleteEquipment(id);
  }

  // 3. INSTRUMENT REQUISITIONS (Staff Lab -> Admin Review -> Approval -> Stock Issuance)
  @Get('requisitions')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN, Role.HOD)
  @ApiOperation({ summary: 'Get requisitions filtered by branch and approval status' })
  async getRequisitions(
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.laboratoryService.getRequisitions(department, status);
  }

  @Post('requisitions')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Submit new instrument requisition (Staff Lab)' })
  async createRequisition(@Body() dto: CreateRequisitionDto, @Req() req: any) {
    return this.laboratoryService.createRequisition(dto, req.user || {});
  }

  @Patch('requisitions/:id/review')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin review and approval/rejection of requisition' })
  async reviewRequisition(
    @Param('id') id: string,
    @Body() dto: ReviewRequisitionDto,
    @Req() req: any,
  ) {
    return this.laboratoryService.reviewRequisition(id, dto, req.user || {});
  }

  @Patch('requisitions/:id/issue')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Issue stock and update available equipment inventory' })
  async issueStock(
    @Param('id') id: string,
    @Body() dto: IssueStockDto,
    @Req() req: any,
  ) {
    return this.laboratoryService.issueStock(id, dto, req.user || {});
  }

  // 4. EQUIPMENT REPAIR & COMPLAINTS WORKFLOW (Staff Lab -> Complaint -> Admin -> Work Order -> Repair)
  @Get('complaints')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN, Role.MAINTENANCE, Role.HOD)
  @ApiOperation({ summary: 'Get laboratory complaints and repair work orders' })
  async getComplaints(
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.laboratoryService.getComplaints(department, status);
  }

  @Post('complaints')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Submit damaged equipment complaint (Staff Lab)' })
  async createComplaint(@Body() dto: CreateComplaintDto, @Req() req: any) {
    return this.laboratoryService.createComplaint(dto, req.user || {});
  }

  @Patch('complaints/:id/review')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin review, approval, and work order assignment' })
  async reviewComplaint(
    @Param('id') id: string,
    @Body() dto: ReviewComplaintDto,
    @Req() req: any,
  ) {
    return this.laboratoryService.reviewComplaint(id, dto, req.user || {});
  }

  @Patch('complaints/:id/work-order')
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN, Role.MAINTENANCE)
  @ApiOperation({ summary: 'Update work order status: In Progress, Completed, Closed' })
  async updateWorkOrder(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Req() req: any,
  ) {
    return this.laboratoryService.updateWorkOrder(id, dto, req.user || {});
  }

  // 5. PRACTICAL SESSIONS & ATTENDANCE
  @Get('sessions')
  @Roles(Role.STAFF, Role.FACULTY, Role.ADMIN, Role.SUPER_ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get practical laboratory sessions and timetable' })
  async getSessions(
    @Query('department') department?: string,
    @Query('labCode') labCode?: string,
    @Query('date') date?: string,
  ) {
    return this.laboratoryService.getSessions(department, labCode, date);
  }

  @Post('sessions/:id/attendance')
  @Roles(Role.STAFF, Role.FACULTY, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Record practical session attendance' })
  async recordAttendance(
    @Param('id') id: string,
    @Body() dto: RecordPracticalAttendanceDto,
  ) {
    return this.laboratoryService.recordAttendance(id, dto);
  }

  // 6. ADMINISTRATIVE AGGREGATE SUMMARY
  @Get('admin/summary')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cross-branch laboratory and maintenance executive summary' })
  async getAdminSummary() {
    return this.laboratoryService.getAdminSummary();
  }

  // 7. AUDIT TRAIL LOGS
  @Get('audit-logs')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get laboratory system audit trail and compliance logs' })
  async getAuditLogs(
    @Query('role') role?: string,
    @Query('action') action?: string,
  ) {
    return this.laboratoryService.getAuditLogs(role, action);
  }
}

