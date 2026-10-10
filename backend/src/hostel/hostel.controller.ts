import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostelService } from './hostel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Hostel Management')
@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  // ==========================================
  // 1. DASHBOARD & INFRASTRUCTURE
  // ==========================================
  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get reconciled hostel dashboard statistics' })
  async getDashboardStats() {
    const data = await this.hostelService.getHostelDashboardStats();
    return { success: true, data };
  }

  @Get('list')
  @ApiOperation({ summary: 'Get all college hostels and capacities' })
  async getHostels() {
    const data = await this.hostelService.getHostels();
    return { success: true, count: data.length, data };
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get hostel rooms and bed allocation capacities' })
  async getHostelRooms(
    @Query('hostelId') hostelId?: string,
    @Query('floor') floor?: string,
  ) {
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
  async allocateBed(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Warden or Administration can execute bed allocations.');
    }
    const result = await this.hostelService.allocateBed(body);
    return result;
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer student between rooms/hostels' })
  async transferBed(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can transfer room allocations.');
    }
    const result = await this.hostelService.transferBed(body);
    return result;
  }

  @Post('vacate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vacate resident from bed and release capacity' })
  async vacateBed(@CurrentUser() user: any, @Body() body: { studentRoll: string; reason?: string }) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can vacate bed allocations.');
    }
    const result = await this.hostelService.vacateBed(body.studentRoll, body.reason);
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
      const studentRoll = user.student?.rollNumber || user.identifier;
      if (rollNumber && rollNumber.toLowerCase() !== studentRoll.toLowerCase()) {
        throw new ForbiddenException('Access denied. You can only view your own hostel room allocation.');
      }
      targetRoll = studentRoll;
    }

    const data = await this.hostelService.getMyResidence(targetRoll || '01');
    return { success: true, data };
  }

  // ==========================================
  // 4. MAINTENANCE COMPLAINTS
  // ==========================================
  @Get('complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hostel maintenance complaints' })
  async getComplaints(
    @CurrentUser() user: any,
    @Query('rollNumber') rollNumber?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    const role = normalizeRole(user.role);
    let targetRoll = rollNumber;
    if (role === 'student') {
      targetRoll = user.student?.rollNumber || user.identifier;
    }

    const data = await this.hostelService.getComplaints(targetRoll, category, status);
    return { success: true, count: data.length, data };
  }

  @Post('complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lodge new hostel maintenance complaint' })
  async lodgeComplaint(@CurrentUser() user: any, @Body() body: any) {
    const ticket = await this.hostelService.lodgeComplaint(body);
    return { success: true, message: 'Hostel maintenance ticket lodged successfully! The warden has been notified.', data: ticket };
  }

  @Patch('complaints/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update complaint status (Hostel staff / Warden only)' })
  async updateComplaintStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; assignedStaff?: string; resolutionNotes?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Warden or Operations Staff can update complaint status.');
    }

    const updated = await this.hostelService.updateComplaintStatus(id, body.status, body.assignedStaff, body.resolutionNotes);
    return { success: true, message: `Complaint ${id} status updated to ${body.status}`, data: updated };
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
  async issueVisitorPass(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can issue visitor passes.');
    }

    const pass = await this.hostelService.issueVisitorPass(body);
    return { success: true, message: `Visitor pass issued for ${pass.visitorName}!`, data: pass };
  }

  @Patch('visitors/:id/checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in visitor upon arrival' })
  async checkInVisitor(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { badgeNumber?: string }) {
    const updated = await this.hostelService.checkInVisitor(id, body.badgeNumber);
    return { success: true, message: 'Visitor marked as checked in.', data: updated };
  }

  @Patch('visitors/:id/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check out visitor upon departure' })
  async checkOutVisitor(@CurrentUser() user: any, @Param('id') id: string) {
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
    const data = await this.hostelService.getGatePasses(status, hostel);
    return { success: true, count: data.length, data };
  }

  @Post('gate-passes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit gate pass application' })
  async createGatePass(@CurrentUser() user: any, @Body() body: any) {
    const pass = await this.hostelService.createGatePass(body, user);
    return { success: true, message: 'Gate pass submitted for mentor verification and warden approval!', data: pass };
  }

  @Patch('gate-passes/:id/action')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Warden approval, rejection, or physical exit/return recording' })
  async actionGatePass(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' | 'RECORD_EXIT' | 'RECORD_RETURN'; remarks?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Warden or Security Administration can review gate passes.');
    }

    const updated = await this.hostelService.actionGatePass(id, body.action, user.name, body.remarks);
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
    const data = await this.hostelService.getStudentDocuments(rollNumber);
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
