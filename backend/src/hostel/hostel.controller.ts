import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostelService } from './hostel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';
import { ActionGatePassDto, AllocateHostelBedDto, CheckInHostelVisitorDto, CreateGatePassDto, IssueHostelVisitorDto, LodgeHostelComplaintDto, TransferHostelBedDto, UpdateHostelComplaintDto, VacateHostelBedDto } from './hostel.dto';

@ApiTags('Hostel Management')
@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  private authorize(user: any, allowedRoles: string[], action: string) {
    const role = normalizeRole(user.role);
    if (!allowedRoles.includes(role)) throw new ForbiddenException(`Access denied. ${action}`);
  }

  // ==========================================
  // 1. DASHBOARD & INFRASTRUCTURE
  // ==========================================
  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reconciled hostel dashboard statistics' })
  async getDashboardStats(@CurrentUser() user: any) {
    this.authorize(user, ['hostel', 'warden', 'admin', 'super_admin', 'management', 'principal'], 'Hostel dashboard access is restricted to authorized hostel staff.');
    const data = await this.hostelService.getHostelDashboardStats();
    return { success: true, data };
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all college hostels and capacities' })
  async getHostels(@CurrentUser() user: any) {
    this.authorize(user, ['hostel', 'warden', 'admin', 'super_admin', 'management', 'principal'], 'Hostel records are restricted to authorized hostel staff.');
    const data = await this.hostelService.getHostels();
    return { success: true, count: data.length, data };
  }

  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hostel rooms and bed allocation capacities' })
  async getHostelRooms(
    @CurrentUser() user: any,
    @Query('hostelId') hostelId?: string,
    @Query('floor') floor?: string,
  ) {
    this.authorize(user, ['hostel', 'warden', 'admin', 'super_admin', 'management', 'principal'], 'Hostel room records are restricted to authorized hostel staff.');
    const data = await this.hostelService.getHostelRooms(hostelId, floor);
    return { success: true, count: data.length, data };
  }

  // ==========================================
  // 2. BED ALLOCATION & TRANSFERS
  // ==========================================
  @Post('allocate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Allocate bed to student (Warden / Admin only)' })
  async allocateBed(@CurrentUser() user: any, @Body() body: AllocateHostelBedDto) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Warden or Administration can execute bed allocations.');
    }
    const result = await this.hostelService.allocateBed(body, {
      id: user.id,
      name: user.name,
      role: role.toUpperCase(),
    });
    return result;
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer student between rooms/hostels' })
  async transferBed(@CurrentUser() user: any, @Body() body: TransferHostelBedDto) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can transfer room allocations.');
    }
    const result = await this.hostelService.transferBed(body, {
      id: user.id,
      name: user.name,
      role: role.toUpperCase(),
    });
    return result;
  }

  @Post('vacate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vacate resident from bed and release capacity' })
  async vacateBed(@CurrentUser() user: any, @Body() body: VacateHostelBedDto) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can vacate bed allocations.');
    }
    const result = await this.hostelService.vacateBed(body.studentRoll, body.reason, { id: user.id, name: user.name });
    return result;
  }

  // ==========================================
  // 3. STUDENT SELF RESIDENCE VIEW
  // ==========================================
  @Get('my-residence')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student hostel room details and roommates' })
  async getMyResidence(@CurrentUser() user: any, @Query('rollNumber') rollNumber?: string) {
    const role = normalizeRole(user.role);
    let targetRoll = rollNumber;
    if (role === 'student') {
      const studentRoll = user.student?.rollNumber;
      if (!studentRoll) throw new ForbiddenException('A linked student record is required to view hostel residence.');
      if (rollNumber && rollNumber.toLowerCase() !== studentRoll.toLowerCase()) {
        throw new ForbiddenException('Access denied. You can only view your own hostel room allocation.');
      }
      targetRoll = studentRoll;
    } else if (!['super_admin', 'management', 'principal', 'admin', 'hostel', 'warden'].includes(role)) {
      throw new ForbiddenException('Access denied. Hostel residence records are restricted to hostel staff and administrators.');
    }

    if (!targetRoll) {
      throw new BadRequestException('A student roll number is required for this residence lookup.');
    }
    const data = await this.hostelService.getMyResidence(targetRoll);
    return { success: true, data };
  }

  // ==========================================
  // 4. MAINTENANCE COMPLAINTS (AI-POWERED)
  // ==========================================
  @Get('complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campus maintenance complaints with AI triage and filters' })
  async getComplaints(
    @CurrentUser() user: any,
    @Query('rollNumber') rollNumber?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('assignedStaffId') assignedStaffId?: string,
    @Query('needsReview') needsReview?: string,
    @Query('search') search?: string,
  ) {
    const role = normalizeRole(user.role);
    let targetRoll = rollNumber;
    let targetStaffId = assignedStaffId;

    if (role === 'student') {
      targetRoll = user.student?.rollNumber;
      if (!targetRoll) throw new ForbiddenException('A linked student record is required to view maintenance complaints.');
    } else if (role === 'staff') {
      targetStaffId = await this.hostelService.getStaffRosterIdForUser(user);
    } else if (!['admin', 'super_admin', 'warden', 'hostel', 'management', 'principal', 'staff'].includes(role)) {
      throw new ForbiddenException('Access denied. Maintenance complaints are restricted to residents and authorized staff.');
    }

    const data = await this.hostelService.getComplaints({
      rollNumber: targetRoll,
      category,
      status,
      assignedStaffId: ['admin', 'super_admin', 'warden', 'hostel', 'management', 'principal'].includes(role) ? assignedStaffId : targetStaffId,
      needsReview: needsReview !== undefined ? needsReview === 'true' : undefined,
      search,
    });
    return { success: true, count: data.length, data };
  }

  @Post('complaints/preview-ai')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preview AI classification and confidence without lodging' })
  async previewAIComplaint(@Body() body: { text: string; categoryHint?: string }) {
    const aiResult = await this.hostelService.aiAssignmentService.predictCategory(
      body.text,
      body.categoryHint
    );
    return { success: true, data: aiResult };
  }

  @Post('complaints/preview-vision')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Directly analyze uploaded photo to identify defect, title, and category' })
  async previewVisionComplaint(@Body() body: { imageBase64: string; filename?: string; locationHint?: string }) {
    const visionResult = await this.hostelService.previewVisionComplaint(
      body.imageBase64,
      body.filename,
      body.locationHint
    );
    return { success: true, data: visionResult };
  }

  @Post('complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lodge new complaint with automatic AI classification and staff assignment' })
  async lodgeComplaint(@CurrentUser() user: any, @Body() body: LodgeHostelComplaintDto) {
    if (normalizeRole(user.role) !== 'student' || !user.student?.id) {
      throw new ForbiddenException('Only a student with a linked resident record can lodge a hostel maintenance complaint.');
    }

    const ticket = await this.hostelService.lodgeComplaint(user.student.id, body);
    return {
      success: true,
      message: ticket.needsReview
        ? 'Complaint received and queued for administrative supervisor review.'
        : `Complaint classified as ${ticket.category} and automatically assigned to ${ticket.assignedStaffName || 'maintenance staff'}.`,
      data: ticket,
    };
  }

  @Patch('complaints/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update complaint status and assign/reassign staff (Staff / Warden / Admin)' })
  async updateComplaintStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: UpdateHostelComplaintDto,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only authorized staff or administrators can update complaints.');
    }

    const staffRosterId = role === 'staff' ? await this.hostelService.getStaffRosterIdForUser(user) : user.id;
    const updated = await this.hostelService.updateComplaintStatus(
      id,
      body.status,
      body.assignedStaff,
      body.resolutionNotes,
      body.assignedStaffId,
      { id: staffRosterId, role },
    );
    return { success: true, message: `Complaint #${id} status updated to "${body.status}"`, data: updated };
  }

  @Get('staff-roster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active staff roster with live workload for manual assignment/reassignment' })
  async getStaffRosterWithWorkload(@CurrentUser() user: any) {
    this.authorize(user, ['hostel', 'warden', 'admin', 'super_admin'], 'Only hostel staff and administrators can view the maintenance roster.');
    const staff = await this.hostelService.prisma.staffRoster.findMany({
      where: { status: { in: ['Active', 'On Duty'] } },
      orderBy: { name: 'asc' },
    });

    const withWorkload = await Promise.all(
      staff.map(async (s) => {
        const activeCount = await this.hostelService.prisma.hostelComplaint.count({
          where: {
            assignedStaffId: s.id,
            status: { in: ['Pending', 'Assigned', 'In Progress'] },
          },
        });
        return {
          ...s,
          activeWorkload: activeCount,
        };
      })
    );

    return { success: true, count: withWorkload.length, data: withWorkload };
  }

  // ==========================================
  // 5. VISITOR MANAGEMENT
  // ==========================================
  @Get('visitors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hostel visitor logs' })
  async getVisitors(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin', 'management', 'principal'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to hostel visitor records.');
    }

    const data = await this.hostelService.getVisitors();
    return { success: true, count: data.length, data };
  }

  @Post('visitors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue digital visitor entry pass' })
  async issueVisitorPass(@CurrentUser() user: any, @Body() body: IssueHostelVisitorDto) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can issue visitor passes.');
    }

    const pass = await this.hostelService.issueVisitorPass(body, user.id);
    return { success: true, message: `Visitor pass issued for ${pass.visitorName}!`, data: pass };
  }

  @Patch('visitors/:id/checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in visitor upon arrival' })
  async checkInVisitor(@CurrentUser() user: any, @Param('id') id: string, @Body() body: CheckInHostelVisitorDto) {
    this.authorize(user, ['hostel', 'warden', 'admin', 'super_admin'], 'Only hostel staff can check in visitors.');
    const updated = await this.hostelService.checkInVisitor(id, body.badgeNumber);
    return { success: true, message: 'Visitor marked as checked in.', data: updated };
  }

  @Patch('visitors/:id/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check out visitor upon departure' })
  async checkOutVisitor(@CurrentUser() user: any, @Param('id') id: string) {
    this.authorize(user, ['hostel', 'warden', 'admin', 'super_admin'], 'Only hostel staff can check out visitors.');
    const updated = await this.hostelService.checkOutVisitor(id);
    return { success: true, message: 'Visitor marked as checked out.', data: updated };
  }

  // ==========================================
  // 6. OUTING & GATE PASSES
  // ==========================================
  @Get('gate-passes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student outstation and outing gate passes' })
  async getGatePasses(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('hostel') hostel?: string,
  ) {
    const role = normalizeRole(user.role);
    const staffRoles = ['hostel', 'warden', 'admin', 'super_admin', 'management', 'principal'];
    if (role !== 'student' && !staffRoles.includes(role)) {
      throw new ForbiddenException('Gate pass records are restricted to the student owner and authorized hostel staff.');
    }
    if (role === 'student' && !user.student?.id) throw new ForbiddenException('A linked student record is required to view gate passes.');
    const data = await this.hostelService.getGatePasses(status, role === 'student' ? undefined : hostel, role === 'student' ? user.id : undefined);
    return { success: true, count: data.length, data };
  }

  @Post('gate-passes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit gate pass application' })
  async createGatePass(@CurrentUser() user: any, @Body() body: CreateGatePassDto) {
    if (normalizeRole(user.role) !== 'student' || !user.student?.id) {
      throw new ForbiddenException('Only a student with a linked hostel record can request a gate pass.');
    }
    const pass = await this.hostelService.createGatePass(body, user);
    return { success: true, message: 'Gate pass submitted for warden approval.', data: pass };
  }

  @Patch('gate-passes/:id/action')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Warden approval, rejection, or physical exit/return recording' })
  async actionGatePass(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: ActionGatePassDto,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Warden or Security Administration can review gate passes.');
    }

    const updated = await this.hostelService.actionGatePass(id, body.action, {
      id: user.id,
      name: user.name,
      role: normalizeRole(user.role),
    }, body.remarks);
    return { success: true, message: `Gate pass successfully updated (${body.action}).`, data: updated };
  }

  // ==========================================
  // 7. RESIDENT DOCUMENTS REPOSITORY
  // ==========================================
  @Get('documents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get resident documentation records' })
  async getStudentDocuments(@CurrentUser() user: any, @Query('rollNumber') rollNumber?: string) {
    const role = normalizeRole(user.role);
    const staffRoles = ['hostel', 'warden', 'admin', 'super_admin', 'management', 'principal'];
    if (role === 'student') {
      if (!user.student?.id || !user.student?.rollNumber) throw new ForbiddenException('A linked student record is required to view hostel documents.');
      if (rollNumber && rollNumber.toLowerCase() !== user.student.rollNumber.toLowerCase()) {
        throw new ForbiddenException('Students can only view their own hostel documents.');
      }
      rollNumber = user.student.rollNumber;
    } else if (!staffRoles.includes(role)) {
      throw new ForbiddenException('Hostel document records are restricted to residents and authorized staff.');
    }
    const data = await this.hostelService.getStudentDocuments(rollNumber, role === 'student' ? user.id : undefined);
    return { success: true, count: data.length, data };
  }

  @Patch('documents/:id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify or reject resident document' })
  async verifyDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: 'Verified' | 'Rejected'; notes?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Warden can verify resident documentation.');
    }

    const updated = await this.hostelService.verifyDocument(id, body.status, user.name, body.notes);
    return { success: true, message: `Document marked as ${body.status}.`, data: updated };
  }
}
