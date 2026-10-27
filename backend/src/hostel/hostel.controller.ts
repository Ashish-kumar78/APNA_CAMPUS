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
  // 4. MAINTENANCE COMPLAINTS (AI-POWERED)
  // ==========================================
  @Get('complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campus maintenance complaints with AI triage, role access, and SLA status' })
  async getComplaints(
    @CurrentUser() user: any,
    @Query('rollNumber') rollNumber?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('assignedStaffId') assignedStaffId?: string,
    @Query('needsReview') needsReview?: string,
    @Query('search') search?: string,
    @Query('hostel') hostel?: string,
    @Query('warden') warden?: string,
    @Query('isEscalated') isEscalated?: string,
    @Query('rating') rating?: string,
  ) {
    const role = normalizeRole(user.role);
    let targetRoll = rollNumber;
    let targetStaffId = assignedStaffId;

    // Security & Role Isolation:
    // Students can ONLY view their own complaints
    if (role === 'student') {
      targetRoll = user.student?.rollNumber || user.identifier;
    } else if (role === 'staff' && !targetStaffId) {
      // Staff defaults to their assigned tickets unless admin
      targetStaffId = user.id;
    }

    const data = await this.hostelService.getComplaints({
      rollNumber: targetRoll,
      category,
      status,
      assignedStaffId: role === 'admin' || role === 'super_admin' || role === 'warden' || role === 'hostel' ? assignedStaffId : targetStaffId,
      needsReview: needsReview !== undefined ? needsReview === 'true' : undefined,
      search,
      hostel,
      warden,
      isEscalated: isEscalated !== undefined ? isEscalated === 'true' : undefined,
      rating: rating ? Number(rating) : undefined,
    });
    return { success: true, count: data.length, data };
  }

  @Get('complaints/metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get summary KPI cards data for Hostel Administrator complaints dashboard' })
  async getComplaintMetrics(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const metrics = await this.hostelService.getAdminComplaintMetrics();
    return { success: true, data: metrics };
  }

  @Post('complaints/check-escalations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger automatic 72-hour SLA escalation check' })
  async checkEscalations(@CurrentUser() user: any) {
    const escalated = await this.hostelService.evaluateOverdueEscalations();
    return { success: true, count: escalated.length, data: escalated };
  }

  @Post('complaints/:id/mark-completed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Warden or technician marks work completed; sets status to Awaiting Student Verification' })
  async markWorkCompleted(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only authorized staff or warden can mark work completed.');
    }
    const updated = await this.hostelService.markWorkCompleted(id, user, body.notes);
    return {
      success: true,
      message: `Complaint #${id} marked as completed. Awaiting student verification.`,
      data: updated,
    };
  }

  @Post('complaints/:id/confirm-completed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Student confirms work completed and submits rating & feedback' })
  async confirmCompleted(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { rating: number; feedbackText?: string; adminComments?: string },
  ) {
    const updated = await this.hostelService.confirmWorkCompleted(id, user, body);
    return {
      success: true,
      message: `Thank you! Complaint #${id} has been marked resolved and your feedback was saved.`,
      data: updated,
    };
  }

  @Post('complaints/:id/reopen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Student reports problem not resolved; reopens complaint for further work' })
  async reopenComplaint(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { reason: string; attachmentUrl?: string },
  ) {
    const updated = await this.hostelService.reopenComplaint(id, user, body);
    return {
      success: true,
      message: `Complaint #${id} reopened. Assigned warden and administration have been alerted.`,
      data: updated,
    };
  }

  @Post('complaints/:id/admin-action')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hostel Administrator performs action: Add Note, Reassign Staff, Close Case' })
  async adminAction(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: string; note?: string; assignedStaffId?: string; assignedStaffName?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const updated = await this.hostelService.adminComplaintAction(id, user, body);
    return {
      success: true,
      message: `Administrative action "${body.action}" executed on complaint #${id}.`,
      data: updated,
    };
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

  @Get('complaints/ai-metrics')
  @ApiOperation({ summary: 'Get AI complaint classifier model training provenance and accuracy metrics' })
  async getAiMetrics() {
    const data = await this.hostelService.aiAssignmentService.getAiMetrics();
    return { success: true, data };
  }

  @Post('complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lodge new complaint with automatic AI classification and staff assignment' })
  async lodgeComplaint(@CurrentUser() user: any, @Body() body: any) {
    const payload = {
      ...body,
      studentId: user?.student?.id || user?.id,
      studentName: body.studentName || user?.student?.name || user?.name || 'Rakesh Das',
      rollNumber: body.rollNumber || user?.student?.rollNumber || user?.identifier || '01',
      hostel: body.hostel || user?.student?.hostelName || 'Sarojini Girls Residence (Block A)',
      roomNumber: body.roomNumber || user?.student?.roomNumber || '204',
      title: body.title || '',
      description: body.description || '',
      attachmentUrl: body.attachmentUrl || body.imageUrl || body.imagePreview,
      filename: body.filename,
    };

    const ticket = await this.hostelService.lodgeComplaint(payload);
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
    @Body() body: {
      status: string;
      assignedStaff?: string;
      assignedStaffId?: string;
      resolutionNotes?: string;
    },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'admin', 'super_admin', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only authorized staff or administrators can update complaints.');
    }

    const updated = await this.hostelService.updateComplaintStatus(
      id,
      body.status,
      body.assignedStaff,
      body.resolutionNotes,
      body.assignedStaffId
    );
    return { success: true, message: `Complaint #${id} status updated to "${body.status}"`, data: updated };
  }

  @Get('staff-roster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active staff roster with live workload for manual assignment/reassignment' })
  async getStaffRosterWithWorkload(@CurrentUser() user: any) {
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
