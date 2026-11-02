import { Controller, Get, Post, Patch, Delete, Put, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
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
  async getDashboardStats(@Query('hostel') hostel?: string) {
    const data = await this.hostelService.getHostelDashboardStats(hostel);
    return { success: true, data };
  }

  @Get('list')
  @ApiOperation({ summary: 'Get all college hostels and capacities' })
  async getHostels() {
    const data = await this.hostelService.getHostels();
    return { success: true, count: data.length, data };
  }

  @Get('complexes')
  @ApiOperation({ summary: 'Get all hostel complexes' })
  async getHostelComplexes() {
    const data = await this.hostelService.getHostels();
    return { success: true, count: data.length, data };
  }

  @Post('complexes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new hostel complex with dynamic floors and rooms' })
  async createHostelComplex(@CurrentUser() user: any, @Body() body: any) {
    this.hostelService.checkWardenPermission(user, 'editHostelConfiguration', 'Edit Hostel Configuration');
    const data = await this.hostelService.createHostel(body);
    return { success: true, message: 'Hostel complex registered successfully', data };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alias for creating a new hostel complex' })
  async createHostel(@CurrentUser() user: any, @Body() body: any) {
    this.hostelService.checkWardenPermission(user, 'editHostelConfiguration', 'Edit Hostel Configuration');
    const data = await this.hostelService.createHostel(body);
    return { success: true, message: 'Hostel complex registered successfully', data };
  }

  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hostel rooms and bed allocation capacities' })
  async getHostelRooms(
    @CurrentUser() user: any,
    @Query('hostelId') hostelId?: string,
    @Query('floor') floor?: string,
    @Query('hostelName') hostelName?: string,
  ) {
    this.hostelService.checkWardenPermission(user, 'viewRoomAllocations', 'View Bed Allotments');
    const data = await this.hostelService.getHostelRooms(hostelId, floor, hostelName);
    return { success: true, count: data.length, data };
  }

  @Post('rooms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new room to a hostel block' })
  async addHostelRoom(@CurrentUser() user: any, @Body() body: any) {
    this.hostelService.checkWardenPermission(user, 'editHostelConfiguration', 'Edit Hostel Configuration');
    const data = await this.hostelService.addHostelRoom(body);
    return { success: true, message: 'Room added successfully', data };
  }

  @Delete('rooms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a room from a hostel block' })
  async deleteHostelRoom(
    @CurrentUser() user: any,
    @Query('hostelName') hostelName?: string,
    @Query('roomNumber') roomNumber?: string,
    @Query('floor') floor?: string,
    @Query('id') id?: string,
  ) {
    this.hostelService.checkWardenPermission(user, 'editHostelConfiguration', 'Edit Hostel Configuration');
    const data = await this.hostelService.deleteHostelRoom({ id, hostelName, roomNumber, floor });
    return { success: true, message: 'Room removed successfully', data };
  }

  @Post('floors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new floor to a hostel block' })
  async addHostelFloor(@CurrentUser() user: any, @Body() body: any) {
    this.hostelService.checkWardenPermission(user, 'editHostelConfiguration', 'Edit Hostel Configuration');
    const data = await this.hostelService.addHostelFloor(body);
    return { success: true, message: 'Floor added successfully', data };
  }

  @Delete('floors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a floor from a hostel block' })
  async deleteHostelFloor(
    @CurrentUser() user: any,
    @Query('hostelName') hostelName: string,
    @Query('floor') floor: string,
  ) {
    this.hostelService.checkWardenPermission(user, 'editHostelConfiguration', 'Edit Hostel Configuration');
    const data = await this.hostelService.deleteHostelFloor({ hostelName, floor });
    return { success: true, message: 'Floor deleted successfully', data };
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
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Warden or Administration can execute bed allocations.');
    }
    const result = await this.hostelService.allocateBed(body, user);
    return result;
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer student between rooms/hostels' })
  async transferBed(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can transfer room allocations.');
    }
    const result = await this.hostelService.transferBed(body, user);
    return result;
  }

  @Post('vacate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vacate resident from bed and release capacity' })
  async vacateBed(@CurrentUser() user: any, @Body() body: { studentRoll: string; reason?: string }) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can vacate bed allocations.');
    }
    const result = await this.hostelService.vacateBed(body.studentRoll, body.reason, user);
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
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
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
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
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

  @Patch('complaints/:id/document')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload or update supporting document/photograph for maintenance complaint' })
  async uploadComplaintDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { attachmentUrl?: string; supportingDocument?: string; note?: string }
  ) {
    const data = await this.hostelService.attachComplaintDocument(id, user, body);
    return { success: true, message: 'Supporting document uploaded successfully.', data };
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
      body.assignedStaffId,
      user
    );
    return { success: true, message: `Complaint #${id} status updated to "${body.status}"`, data: updated };
  }

  @Get('staff-roster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active staff roster with live workload for manual assignment/reassignment' })
  async getStaffRosterWithWorkload(@CurrentUser() user: any) {
    this.hostelService.checkWardenPermission(user, 'manageStaffDutyRosters', 'Configure Staff Rosters');
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
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administration can issue visitor passes.');
    }

    const pass = await this.hostelService.issueVisitorPass(body, user);
    return { success: true, message: `Visitor pass issued for ${pass.visitorName}!`, data: pass };
  }

  @Patch('visitors/:id/checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in visitor upon arrival' })
  async checkInVisitor(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { badgeNumber?: string }) {
    const updated = await this.hostelService.checkInVisitor(id, body.badgeNumber, user);
    return { success: true, message: 'Visitor marked as checked in.', data: updated };
  }

  @Patch('visitors/:id/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check out visitor upon departure' })
  async checkOutVisitor(@CurrentUser() user: any, @Param('id') id: string) {
    const updated = await this.hostelService.checkOutVisitor(id, user);
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
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Warden or Security Administration can review gate passes.');
    }

    const updated = await this.hostelService.actionGatePass(id, body.action, user.name, body.remarks, user);
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
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Warden can verify resident documentation.');
    }

    const updated = await this.hostelService.verifyDocument(id, body.status, user.name, body.notes);
    return { success: true, message: `Document marked as ${body.status}.`, data: updated };
  }

  // ==========================================
  // 8. FOOD FEEDBACK & MESS CONTROLLER
  // ==========================================
  @Get('mess-menu')
  @ApiOperation({ summary: 'Get daily mess nutrition schedule and menu' })
  async getDailyMessMenu(@Query('date') date?: string) {
    const data = await this.hostelService.getDailyMessMenu(date);
    return { success: true, data };
  }

  @Get('mess-menu/weekly')
  @ApiOperation({ summary: 'Get weekly rotational mess schedule' })
  async getWeeklyMessMenu() {
    const data = await this.hostelService.getWeeklyMessMenu();
    return { success: true, data };
  }

  @Put('mess-menu')
  @ApiOperation({ summary: 'Update daily mess meal menu items (Hostel Admin / Warden)' })
  async updateDailyMessMenu(@Body() payload: { day: string; mealType: string; items: string; time?: string; calories?: string }) {
    const data = await this.hostelService.updateDailyMessMenu(payload);
    return { success: true, message: 'Mess menu updated successfully.', data };
  }

  @Post('food-feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit student food feedback and meal rating' })
  async createFoodFeedback(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.hostelService.createFoodFeedback(user, body);
    return { success: true, message: 'Food feedback submitted successfully.', data };
  }

  @Get('food-feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get food feedback list with filters and role access' })
  async getFoodFeedback(@CurrentUser() user: any, @Query() query: any) {
    const data = await this.hostelService.getFoodFeedback(user, query);
    return { success: true, count: data.length, data };
  }

  @Get('food-feedback/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student self food feedback history' })
  async getMyFoodFeedback(@CurrentUser() user: any, @Query() query: any) {
    const studentUser = { ...user, role: 'student' };
    const data = await this.hostelService.getFoodFeedback(studentUser, query);
    return { success: true, count: data.length, data };
  }

  @Get('food-feedback/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get institutional food feedback analytics and rating trends' })
  async getFoodFeedbackAnalytics(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const data = await this.hostelService.getFoodFeedbackAnalytics(user);
    return { success: true, data };
  }

  @Get('food-feedback/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get food feedback details' })
  async getFoodFeedbackById(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.hostelService.getFoodFeedbackById(id, user);
    return { success: true, data };
  }

  @Patch('food-feedback/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update food feedback status, priority or assigned warden' })
  async updateFoodFeedbackStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; priority?: string; assignedWarden?: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Warden or Admin can update status.');
    }
    const data = await this.hostelService.updateFoodFeedbackStatus(id, user, body.status, body.priority, body.assignedWarden);
    return { success: true, message: 'Status updated.', data };
  }

  @Post('food-feedback/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve student food feedback and record official response' })
  async approveFoodFeedback(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { response?: string; correctiveAction?: string; respondedBy?: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Warden or Admin can approve food feedback.');
    }
    const data = await this.hostelService.approveFoodFeedback(id, user, body?.response, body?.correctiveAction);
    return { success: true, message: 'Food feedback approved successfully.', data };
  }

  @Post('food-feedback/:id/response')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Provide student-visible official response to food feedback' })
  async respondToFoodFeedback(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { response: string; correctiveAction?: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Warden or Admin can respond.');
    }
    const data = await this.hostelService.respondToFoodFeedback(id, user, body.response, body.correctiveAction);
    return { success: true, message: 'Response submitted to student.', data };
  }

  @Post('food-feedback/:id/notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add internal administrative note to food feedback' })
  async addFoodFeedbackInternalNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { note: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.hostelService.addFoodFeedbackInternalNote(id, user, body.note);
    return { success: true, message: 'Internal note saved.', data };
  }

  @Post('food-feedback/:id/forward')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Forward food feedback to Hostel Admin for executive action' })
  async forwardFoodFeedback(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { note?: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.hostelService.forwardFoodFeedback(id, user, body.note);
    return { success: true, message: 'Forwarded to Hostel Administrator.', data };
  }

  // ==========================================
  // 9. ROOM CLEANLINESS COMPLAINTS CONTROLLER
  // ==========================================
  @Post('cleanliness-complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit new hostel room cleanliness complaint' })
  async lodgeCleanlinessComplaint(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.hostelService.lodgeCleanlinessComplaint(user, body);
    return { success: true, message: `Cleanliness complaint #${data.complaintCode} lodged successfully.`, data };
  }

  @Get('cleanliness-complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cleanliness complaints with filters and role authorization' })
  async getCleanlinessComplaints(@CurrentUser() user: any, @Query() query: any) {
    const data = await this.hostelService.getCleanlinessComplaints(user, query);
    return { success: true, count: data.length, data };
  }

  @Get('cleanliness-complaints/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student own cleanliness complaints' })
  async getMyCleanlinessComplaints(@CurrentUser() user: any, @Query() query: any) {
    const studentUser = { ...user, role: 'student' };
    const data = await this.hostelService.getCleanlinessComplaints(studentUser, query);
    return { success: true, count: data.length, data };
  }

  @Get('cleanliness-complaints/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cleanliness insights analytics across hostels' })
  async getCleanlinessAnalytics(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const data = await this.hostelService.getCleanlinessAnalytics(user);
    return { success: true, data };
  }

  @Get('cleanliness-complaints/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cleanliness complaint details and status history' })
  async getCleanlinessComplaintById(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.hostelService.getCleanlinessComplaintById(id, user);
    return { success: true, data };
  }

  @Patch('cleanliness-complaints/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cleanliness complaint status and assignments' })
  async updateCleanlinessStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.hostelService.updateCleanlinessStatus(id, user, body);
    return { success: true, message: `Status updated to ${body.status}.`, data };
  }

  @Post('cleanliness-complaints/:id/notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add internal housekeeping note to cleanliness complaint' })
  async addCleanlinessInternalNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { note: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.hostelService.addCleanlinessInternalNote(id, user, body.note);
    return { success: true, message: 'Internal note saved.', data };
  }

  @Post('cleanliness-complaints/:id/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Warden or staff marks cleaning completed; moves to Awaiting Verification' })
  async resolveCleanlinessComplaint(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { notes?: string; cleaningInstructions?: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.hostelService.resolveCleanlinessComplaint(id, user, body);
    return { success: true, message: 'Work marked completed. Submitted for student verification.', data };
  }

  @Post('cleanliness-complaints/:id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Student verifies room cleanliness (Resolved) or marks unresolved (Reopened)' })
  async verifyCleanlinessComplaint(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { result: 'Confirmed Cleaned' | 'Unresolved'; rating?: number; feedback?: string; reason?: string }
  ) {
    const data = await this.hostelService.verifyCleanlinessComplaint(id, user, body);
    return {
      success: true,
      message: body.result === 'Confirmed Cleaned' ? 'Thank you! Complaint marked as Resolved.' : 'Complaint has been reopened for further action.',
      data
    };
  }



  @Post('cleanliness-complaints/:id/reopen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reopen cleanliness complaint with reason' })
  async reopenCleanlinessComplaint(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { reason: string; attachmentUrl?: string }
  ) {
    const data = await this.hostelService.reopenCleanlinessComplaint(id, user, body);
    return { success: true, message: 'Complaint reopened successfully.', data };
  }

  @Patch('cleanliness-complaints/:id/document')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload or update supporting document/photo for cleanliness complaint' })
  async uploadCleanlinessComplaintDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { attachmentUrl?: string; supportingDocument?: string; note?: string }
  ) {
    const data = await this.hostelService.attachCleanlinessComplaintDocument(id, user, body);
    return { success: true, message: 'Supporting document uploaded successfully.', data };
  }

  @Post('cleanliness-complaints/:id/escalate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Escalate cleanliness complaint to Hostel Administrator' })
  async escalateCleanlinessComplaint(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { reason: string }
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.hostelService.escalateCleanlinessComplaint(id, user, body.reason);
    return { success: true, message: 'Complaint escalated to Hostel Administrator.', data };
  }



  // ==========================================
  // 10. REQUISITIONS & INDENTS (WARDEN & HOSTEL ADMIN)
  // ==========================================
  @Get('indents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all hostel material requisitions and indents' })
  async getHostelIndents(
    @CurrentUser() user: any,
    @Query('hostel') hostel?: string,
    @Query('status') status?: string,
    @Query('raisedBy') raisedBy?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.hostelService.getHostelIndents({ hostel, status, raisedBy, search });
    return { success: true, count: data.length, data };
  }

  @Post('indents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Raise new material requisition/indent (Warden or Admin)' })
  async createHostelIndent(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Warden or Admin privileges required.');
    }
    const data = await this.hostelService.createHostelIndent(body, user);
    return { success: true, message: 'Requisition submitted successfully.', data };
  }

  @Patch('indents/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit or update requisition details (Hostel Admin or Warden)' })
  async updateHostelIndent(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.hostelService.updateHostelIndent(id, body, user);
    return { success: true, message: 'Requisition updated successfully.', data };
  }

  @Patch('indents/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve, Reject, or Issue Requisition (Hostel Admin)' })
  async actionHostelIndent(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' | 'ISSUE'; remarks?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Admin sanction authority required.');
    }
    const data = await this.hostelService.actionHostelIndent(id, body.action, body.remarks, user);
    return { success: true, message: `Requisition marked as ${body.action}.`, data };
  }

  @Delete('indents/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete requisition (Hostel Admin)' })
  async deleteHostelIndent(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Admin privileges required to delete requisitions.');
    }
    const result = await this.hostelService.deleteHostelIndent(id, user);
    return result;
  }

  // ==========================================
  // 11. OUTSTATION RESIDENT LEAVES
  // ==========================================
  @Get('leaves')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get resident outstation leave applications' })
  async getHostelLeaves(
    @CurrentUser() user: any,
    @Query('rollNumber') rollNumber?: string,
    @Query('hostel') hostel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const role = normalizeRole(user.role);
    let targetRoll = rollNumber;
    if (role === 'student') {
      targetRoll = user.student?.rollNumber || user.identifier;
    }

    const data = await this.hostelService.getHostelLeaves({ rollNumber: targetRoll, hostel, status, search });
    return { success: true, count: data.length, data };
  }

  @Post('leaves')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for outstation resident leave' })
  async createHostelLeave(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.hostelService.createHostelLeave(body, user);
    return { success: true, message: 'Outstation leave application submitted.', data };
  }

  @Patch('leaves/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit or update leave application' })
  async updateHostelLeave(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const data = await this.hostelService.updateHostelLeave(id, body, user);
    return { success: true, message: 'Leave application updated.', data };
  }

  @Patch('leaves/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve, Reject or Mark Returned for Leave (Warden or Admin)' })
  async actionHostelLeave(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' | 'MARK_RETURNED'; remarks?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Warden or Admin privileges required.');
    }
    const data = await this.hostelService.actionHostelLeave(id, body.action, body.remarks, user);
    return { success: true, message: `Leave application updated (${body.action}).`, data };
  }

  @Delete('leaves/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete leave application (Hostel Admin)' })
  async deleteHostelLeave(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }
    const result = await this.hostelService.deleteHostelLeave(id, user);
    return result;
  }

  // ==========================================
  // 11b. STAFF & WARDEN LEAVES
  // ==========================================
  @Get('staff-leaves')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all hostel staff & warden leave applications' })
  async getStaffLeaves(@CurrentUser() user: any) {
    const data = await this.hostelService.getStaffLeaves();
    return { success: true, count: data.length, data };
  }

  @Post('staff-leaves')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for or record staff/warden leave' })
  async createStaffLeave(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.hostelService.createStaffLeave(body, user);
    return { success: true, message: 'Staff leave application recorded.', data };
  }

  @Patch('staff-leaves/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or Reject staff/warden leave (Admin / Warden)' })
  async updateStaffLeaveStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; remarks?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'warden', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator or Warden privileges required.');
    }
    const data = await this.hostelService.updateStaffLeaveStatus(id, body.status, body.remarks || '', user);
    return { success: true, message: `Staff leave status updated to ${body.status}.`, data };
  }

  // ==========================================
  // 12. GATE PASSES (UPDATE & DELETE)
  // ==========================================
  @Patch('gate-passes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit or update gate pass details (Hostel Admin or Warden)' })
  async updateGatePass(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const data = await this.hostelService.updateGatePass(id, body, user);
    return { success: true, message: 'Gate pass updated.', data };
  }

  @Delete('gate-passes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete gate pass (Hostel Admin)' })
  async deleteGatePass(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }
    const result = await this.hostelService.deleteGatePass(id, user);
    return result;
  }

  // ==========================================
  // 13. COMPLAINTS (SUPERVISORY EDIT & DELETE)
  // ==========================================
  @Patch('complaints/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit complaint information (Hostel Admin or Warden)' })
  async updateComplaint(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin', 'staff'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.hostelService.updateComplaint(id, body, user);
    return { success: true, message: 'Complaint updated successfully.', data };
  }

  @Delete('complaints/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete complaint (Hostel Admin)' })
  async deleteComplaint(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const result = await this.hostelService.deleteComplaint(id, user);
    return result;
  }

  // ==========================================
  // 14. CLEANLINESS COMPLAINTS (SUPERVISORY EDIT & DELETE)
  // ==========================================
  @Patch('cleanliness-complaints/:id/edit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit cleanliness complaint fields (Hostel Admin or Warden)' })
  async editCleanlinessComplaint(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const data = await this.hostelService.updateCleanlinessComplaint(id, body, user);
    return { success: true, message: 'Cleanliness complaint updated.', data };
  }

  @Delete('cleanliness-complaints/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete cleanliness complaint (Hostel Admin)' })
  async deleteCleanlinessComplaint(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const result = await this.hostelService.deleteCleanlinessComplaint(id, user);
    return result;
  }

  // ==========================================
  // 15. FOOD FEEDBACK (SUPERVISORY EDIT & DELETE)
  // ==========================================
  @Patch('food-feedback/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit food feedback fields (Hostel Admin or Warden)' })
  async updateFoodFeedback(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const data = await this.hostelService.updateFoodFeedback(id, body, user);
    return { success: true, message: 'Food feedback record updated.', data };
  }

  @Delete('food-feedback/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete food feedback (Hostel Admin)' })
  async deleteFoodFeedback(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const result = await this.hostelService.deleteFoodFeedback(id, user);
    return result;
  }

  // ==========================================
  // 16. VISITORS (SUPERVISORY EDIT & DELETE)
  // ==========================================
  @Patch('visitors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit visitor log details (Hostel Admin or Warden)' })
  async updateVisitor(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const data = await this.hostelService.updateVisitor(id, body, user);
    return { success: true, message: 'Visitor record updated.', data };
  }

  @Delete('visitors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete visitor record (Hostel Admin)' })
  async deleteVisitor(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const result = await this.hostelService.deleteVisitor(id, user);
    return result;
  }

  // ==========================================
  // 17. RESIDENT ALLOCATIONS (FULL WARDEN & ADMIN ACCESS)
  // ==========================================
  @Get('residents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all hostel resident students across all rooms and blocks' })
  async getHostelResidents(
    @CurrentUser() user: any,
    @Query('hostelId') hostelId?: string,
    @Query('search') search?: string,
  ) {
    this.hostelService.checkWardenPermission(user, 'viewHostelRecords', 'View Hostel Records');
    const data = await this.hostelService.getHostelResidents(hostelId, search);
    return { success: true, count: data.length, data };
  }

  @Patch('residents/:rollNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit or update resident allocation details (Hostel Admin or Warden)' })
  async updateHostelResident(
    @CurrentUser() user: any,
    @Param('rollNumber') rollNumber: string,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel', 'warden', 'hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Admin or Warden privileges required.');
    }
    const data = await this.hostelService.updateHostelResident(rollNumber, body, user);
    return { success: true, message: 'Resident details updated successfully.', data };
  }

  @Delete('residents/:rollNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove/vacate resident allocation (Hostel Admin)' })
  async deleteHostelResident(@CurrentUser() user: any, @Param('rollNumber') rollNumber: string) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required.');
    }
    const result = await this.hostelService.deleteHostelResident(rollNumber, user);
    return result;
  }


  // 19. WARDEN DIRECTORY & CMS FULL PROFILE

  @Post('wardens')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register and onboard a new hostel warden with full CMS profile & photo' })
  async createWarden(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Only Hostel Administrator can register new wardens.');
    }
    const created = await this.hostelService.createWarden(body, user);
    return { success: true, message: `Warden ${created.name} successfully registered.`, data: created };
  }

  @Get('wardens')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of all hostel wardens (Hostel Admin / Warden)' })
  async getWardens(@CurrentUser() user: any) {
    const data = await this.hostelService.getWardens();
    return { success: true, count: data.length, data };
  }

  @Get('wardens/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete CMS profile for a specific hostel warden' })
  async getWardenById(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.hostelService.getWardenById(id);
    return { success: true, data };
  }

  @Put('wardens/:id/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hostel warden CMS profile dossier' })
  async updateWardenProfile(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'warden', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator or Warden privileges required.');
    }
    const data = await this.hostelService.updateWardenProfile(id, body, user);
    return { success: true, message: 'Warden profile updated successfully.', data };
  }

  @Post('wardens/:id/documents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add verification document to warden profile' })
  async addWardenDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'warden', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator or Warden privileges required.');
    }
    const data = await this.hostelService.addWardenDocument(id, body, user);
    return { success: true, message: 'Document attached successfully.', data };
  }

  @Patch('wardens/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hostel warden account status (Active | Suspended)' })
  async updateWardenStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator privileges required to suspend/reactivate wardens.');
    }
    const status = body.status || 'Suspended';
    const dutyStatus = body.dutyStatus;
    const reason = body.reason || 'Administrative action';
    const data = await this.hostelService.updateWardenStatus(id, status, reason, user, dutyStatus);
    return {
      success: true,
      message: `Warden ${id} status updated to ${status}.`,
      data,
    };
  }



  @Patch('wardens/:id/duty-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hostel warden duty status (On Duty | On Leave)' })
  async updateWardenDutyStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'warden', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Administrator or Warden privileges required.');
    }
    const dutyStatus = body.dutyStatus || (body.onDuty ? 'On Duty' : 'On Leave');
    const reason = body.reason || 'Duty status updated';
    const data = await this.hostelService.updateWardenDutyStatus(id, dutyStatus, reason, user);
    return {
      success: true,
      message: `Warden ${id} duty status updated to ${dutyStatus}.`,
      data,
    };
  }


  // ==========================================
  // WARDEN PERMISSIONS ENDPOINTS
  // ==========================================
  @Get('wardens/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all warden permissions matrix and global default' })
  async getAllWardenPermissions(@CurrentUser() user: any) {
    const data = await this.hostelService.getWardenPermissions();
    return { success: true, data };
  }

  @Get('wardens/:id/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get permissions for a specific hostel warden' })
  async getWardenPermissions(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const data = await this.hostelService.getWardenPermissions(id);
    return { success: true, data };
  }

  @Put('wardens/:id/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update permissions for a warden or apply to all' })
  async updateWardenPermissions(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Hostel Admin authority required to modify permissions.');
    }
    const applyToAll = Boolean(body.applyToAll);
    const permissions = body.permissions || body;
    const data = await this.hostelService.updateWardenPermissions(id, permissions, applyToAll, user);
    return {
      success: true,
      message: applyToAll ? 'Permissions applied to ALL hostel wardens.' : `Permissions updated for warden ${id}.`,
      data,
    };
  }



  @Post('wardens/permissions/apply-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply granular permissions matrix to ALL hostel wardens' })
  async applyWardenPermissionsToAll(
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Hostel Admin authority required.');
    }
    const permissions = body.permissions || body;
    const data = await this.hostelService.applyWardenPermissionsToAll(permissions, user);
    return {
      success: true,
      message: 'Granular permissions successfully applied to ALL hostel wardens in the system.',
      data,
    };
  }



  // ==========================================
  // HOSTEL ATTENDANCE ENDPOINTS
  // ==========================================
  @Get('attendance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get submitted hostel attendance records' })
  async getHostelAttendance(
    @CurrentUser() user: any,
    @Query('hostel') hostel?: string,
    @Query('date') date?: string,
    @Query('session') session?: string,
  ) {
    this.hostelService.checkWardenPermission(user, 'viewHostelRecords', 'View Hostel Records');
    const data = await this.hostelService.getHostelAttendance({ hostel, date, session });
    return { success: true, count: data.length, data };
  }

  @Get('attendance/roster/:hostelName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student roster for taking hostel attendance' })
  async getHostelRoster(
    @CurrentUser() user: any,
    @Param('hostelName') hostelName: string,
  ) {
    this.hostelService.checkWardenPermission(user, 'manageAttendance', 'Take & Record Roll Call');
    const data = await this.hostelService.getHostelRoster(hostelName);
    return { success: true, count: data.length, data };
  }

  @Get('attendance/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific hostel attendance submission by ID' })
  async getHostelAttendanceById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const data = await this.hostelService.getHostelAttendanceById(id);
    return { success: true, data };
  }

  @Post('attendance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit or update hostel roll call attendance' })
  async submitHostelAttendance(
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hostel_admin', 'admin', 'super_admin', 'warden', 'hostel'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. Staff authorization required.');
    }
    const data = await this.hostelService.submitHostelAttendance(body, user);
    return {
      success: true,
      message: 'Hostel attendance recorded and synchronized successfully.',
      data,
    };
  }



  @Get('attendance/student/:identifier')
  @ApiOperation({ summary: 'Get latest hostel attendance date for a student' })
  async getStudentLatestHostelAttendance(@Param('identifier') identifier: string) {
    const data = await this.hostelService.getStudentLatestHostelAttendance(identifier);
    return { success: true, data };
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all hostel rules, policies, and curfew timings' })
  async getHostelRules() {
    const data = await this.hostelService.getHostelRules();
    return { success: true, count: data.length, data };
  }

  @Post('rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new hostel rule or curfew (Hostel Admin or Authorized Warden)' })
  async addHostelRule(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.hostelService.addHostelRule(body, user);
    return { success: true, message: 'Hostel rule created successfully.', data };
  }

  @Put('rules/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing hostel rule or curfew' })
  async updateHostelRule(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const data = await this.hostelService.updateHostelRule(id, body, user);
    return { success: true, message: 'Hostel rule updated successfully.', data };
  }

  @Delete('rules/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a hostel rule or curfew' })
  async deleteHostelRule(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.hostelService.deleteHostelRule(id, user);
    return { success: true, message: 'Hostel rule deleted successfully.', data };
  }

  @Post('rules/reset')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset hostel rules to institutional defaults' })
  async resetHostelRules(@CurrentUser() user: any) {
    const data = await this.hostelService.resetHostelRules(user);
    return { success: true, message: 'Hostel rules reset to defaults.', data };
  }
}
