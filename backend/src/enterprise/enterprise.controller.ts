import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnterpriseService } from './enterprise.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Enterprise Modules')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  // ==========================================
  // 1. EXAM CELL ENDPOINTS
  // ==========================================
  @Get('exam-cell/schedules')
  @ApiOperation({ summary: 'Get exam schedules' })
  async getExamSchedules() {
    const data = await this.enterpriseService.getExamSchedules();
    return { success: true, count: data.length, data };
  }

  @Post('exam-cell/schedules')
  @ApiOperation({ summary: 'Create exam schedule (Exam Cell only)' })
  async createExamSchedule(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'exam_cell' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Examination Cell can schedule examination cycles.');
    }
    const exam = await this.enterpriseService.createExamSchedule(body);
    return { success: true, message: `Exam ${exam.title} registered successfully.`, data: exam };
  }

  @Post('exam-cell/publish-results')
  @ApiOperation({ summary: 'Publish official autonomous results (Exam Cell & Principal only)' })
  async publishResults(@CurrentUser() user: any, @Body() body: { examCode: string }) {
    const role = normalizeRole(user.role);
    if (role !== 'exam_cell' && role !== 'principal' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Examination Cell or Principal can publish results.');
    }
    const updated = await this.enterpriseService.publishExamResults(body.examCode);
    return { success: true, message: `Official results for exam ${body.examCode} published successfully!`, data: updated };
  }

  // ==========================================
  // 2. CENTRAL LIBRARY INFORMATION SYSTEM ENDPOINTS
  // ==========================================
  @Get('library/dashboard-stats')
  @ApiOperation({ summary: 'Get live library KPIs, copies breakdown & monthly circulation' })
  async getLibraryDashboardStats() {
    const data = await this.enterpriseService.getLibraryDashboardStats();
    return { success: true, data };
  }

  @Get('library/books')
  @ApiOperation({ summary: 'Search and browse library catalog' })
  async getLibraryBooks(
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('category') category?: string,
  ) {
    const data = await this.enterpriseService.getLibraryBooks(search, department, category);
    return { success: true, count: data.length, data };
  }

  @Post('library/books')
  @ApiOperation({ summary: 'Add a new bibliographic title to catalog' })
  async createLibraryBook(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'library' && role !== 'super_admin') {
      throw new ForbiddenException('Only Library staff can add catalog titles.');
    }
    const book = await this.enterpriseService.createLibraryBook(body);
    return { success: true, message: `Catalog title "${book.title}" added successfully.`, data: book };
  }

  @Get('library/copies')
  @ApiOperation({ summary: 'Get physical copy inventory' })
  async getLibraryCopies(@Query('bookId') bookId?: string) {
    const data = await this.enterpriseService.getLibraryCopies(bookId);
    return { success: true, count: data.length, data };
  }

  @Post('library/copies')
  @ApiOperation({ summary: 'Register an additional physical copy' })
  async registerLibraryCopy(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'library' && role !== 'super_admin') {
      throw new ForbiddenException('Only Library staff can accession new physical copies.');
    }
    const copy = await this.enterpriseService.registerLibraryCopy(body);
    return { success: true, message: 'Physical copy registered into stack inventory.', data: copy };
  }

  @Patch('library/copies/:id/status')
  @ApiOperation({ summary: 'Update physical copy condition or location' })
  async updateLibraryCopyStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'library' && role !== 'super_admin') {
      throw new ForbiddenException('Only Library staff can alter physical copy statuses.');
    }
    const updated = await this.enterpriseService.updateLibraryCopyStatus(id, body.status, body.notes);
    return { success: true, message: `Copy status updated to ${body.status}.`, data: updated };
  }

  @Get('library/transactions')
  @ApiOperation({ summary: 'Get circulation records (Librarian full view, Student self view)' })
  async getLibraryTransactions(
    @CurrentUser() user: any,
    @Query('studentRoll') studentRoll?: string,
    @Query('status') status?: string,
  ) {
    const role = normalizeRole(user.role);
    let targetRoll = studentRoll;

    if (role === 'student') {
      targetRoll = user.student?.rollNumber || user.identifier;
    }

    const data = await this.enterpriseService.getLibraryTransactions(targetRoll, status);
    return { success: true, count: data.length, data };
  }

  @Post('library/issue')
  @ApiOperation({ summary: 'Issue book copy to borrower (Library role only)' })
  async issueBook(
    @CurrentUser() user: any,
    @Body() body: { bookId: string; studentRoll: string; studentName: string; role?: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'library' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Librarian can execute book circulation issues.');
    }
    const txn = await this.enterpriseService.issueBook(body);
    return { success: true, message: `Book issued to ${body.studentName} (${body.studentRoll})`, data: txn };
  }

  @Post('library/return')
  @ApiOperation({ summary: 'Return issued book (Library role only)' })
  async returnBook(@CurrentUser() user: any, @Body() body: { transactionId: string }) {
    const role = normalizeRole(user.role);
    if (role !== 'library' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Librarian can process book returns.');
    }
    const txn = await this.enterpriseService.returnBook(body.transactionId);
    return { success: true, message: 'Book returned and catalog inventory updated.', data: txn };
  }

  @Post('library/renew')
  @ApiOperation({ summary: 'Renew an active book loan' })
  async renewBook(@CurrentUser() user: any, @Body() body: { transactionId: string }) {
    const txn = await this.enterpriseService.renewBook(body.transactionId);
    return { success: true, message: 'Book loan renewed for an additional period.', data: txn };
  }

  @Get('library/reservations')
  @ApiOperation({ summary: 'Get active book reservations & waitlists' })
  async getLibraryReservations() {
    const data = await this.enterpriseService.getLibraryReservations();
    return { success: true, count: data.length, data };
  }

  @Post('library/reservations')
  @ApiOperation({ summary: 'Place a book reservation' })
  async createLibraryReservation(@Body() body: any) {
    const res = await this.enterpriseService.createLibraryReservation(body);
    return { success: true, message: `Reservation placed for "${body.bookTitle}".`, data: res };
  }

  @Delete('library/reservations/:id')
  @ApiOperation({ summary: 'Cancel a reservation' })
  async cancelLibraryReservation(@Param('id') id: string) {
    await this.enterpriseService.cancelLibraryReservation(id);
    return { success: true, message: 'Reservation cancelled.' };
  }

  @Get('library/fines')
  @ApiOperation({ summary: 'Get overdue fines and penalty ledgers' })
  async getLibraryFines() {
    const data = await this.enterpriseService.getLibraryFines();
    return { success: true, count: data.length, data };
  }

  @Post('library/fines/settle')
  @ApiOperation({ summary: 'Record fine payment settlement' })
  async settleLibraryFine(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'library' && role !== 'accounts' && role !== 'super_admin') {
      throw new ForbiddenException('Only Library or Accounts staff can settle fines.');
    }
    const receipt = await this.enterpriseService.settleLibraryFine(body);
    return { success: true, message: `Fine settlement recorded. Receipt: ${receipt.receiptNo || 'Issued'}`, data: receipt };
  }

  @Post('library/fines/waive')
  @ApiOperation({ summary: 'Waive overdue fine' })
  async waiveLibraryFine(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'library' && role !== 'super_admin') {
      throw new ForbiddenException('Only Chief Librarian can waive penalties.');
    }
    const result = await this.enterpriseService.waiveLibraryFine({
      ...body,
      approvedBy: user.name || 'Chief Librarian',
    });
    return { success: true, message: 'Fine waived with audit justification.', data: result };
  }

  @Get('library/acquisitions')
  @ApiOperation({ summary: 'Get new book acquisitions and indents' })
  async getLibraryAcquisitions() {
    const data = await this.enterpriseService.getLibraryAcquisitions();
    return { success: true, count: data.length, data };
  }

  @Post('library/acquisitions')
  @ApiOperation({ summary: 'Create new purchase indent/order' })
  async createLibraryAcquisition(@CurrentUser() user: any, @Body() body: any) {
    const res = await this.enterpriseService.createLibraryAcquisition(body);
    return { success: true, message: 'Purchase requisition logged.', data: res };
  }

  @Get('library/digital-resources')
  @ApiOperation({ summary: 'Browse e-books, journals, and exam archives' })
  async getLibraryDigitalResources(@Query('search') search?: string) {
    const data = await this.enterpriseService.getLibraryDigitalResources(search);
    return { success: true, count: data.length, data };
  }

  @Get('library/policies')
  @ApiOperation({ summary: 'Get library circulation rules and limits' })
  getLibraryPolicies() {
    const data = this.enterpriseService.getLibraryPolicies();
    return { success: true, data };
  }

  // ==========================================
  // 3. PLACEMENT CELL ENDPOINTS
  // ==========================================
  // 3. TRAINING & PLACEMENT (T&P) ENDPOINTS
  // ==========================================
  @Get('placement/dashboard-stats')
  @ApiOperation({ summary: 'Get placement KPIs and analytics' })
  async getPlacementDashboardStats(@CurrentUser() user: any) {
    const data = await this.enterpriseService.getPlacementDashboardStats();
    return { success: true, data };
  }

  @Get('placement/companies')
  @ApiOperation({ summary: 'Get corporate recruiting partners directory' })
  async getPlacementCompanies() {
    const data = await this.enterpriseService.getPlacementCompanies();
    return { success: true, count: data.length, data };
  }

  @Post('placement/companies')
  @ApiOperation({ summary: 'Add corporate partner (Placement Cell only)' })
  async createPlacementCompany(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'placement' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only T&P Cell can enroll company partners.');
    }
    const company = await this.enterpriseService.createPlacementCompany(body, user);
    return { success: true, message: `Company ${company.name} added to recruiting directory!`, data: company };
  }

  @Get('placement/drives')
  @ApiOperation({ summary: 'Get active and upcoming campus placement drives' })
  async getPlacementDrives() {
    const data = await this.enterpriseService.getPlacementDrives();
    return { success: true, count: data.length, data };
  }

  @Post('placement/drives')
  @ApiOperation({ summary: 'Create placement recruitment drive (Placement Cell only)' })
  async createPlacementDrive(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'placement' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Training & Placement Cell can register recruitment drives.');
    }
    const drive = await this.enterpriseService.createPlacementDrive(body);
    return { success: true, message: `Placement drive for ${drive.companyName} created!`, data: drive };
  }

  @Patch('placement/drives/:id/status')
  @ApiOperation({ summary: 'Update recruitment drive status' })
  async updatePlacementDriveStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { status: string }) {
    const role = normalizeRole(user.role);
    if (role !== 'placement' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const updated = await this.enterpriseService.updatePlacementDriveStatus(id, body.status, user);
    return { success: true, message: 'Drive status updated.', data: updated };
  }

  @Get('placement/drives/:id/evaluate')
  @ApiOperation({ summary: 'Evaluate candidate eligibility using deterministic engine' })
  async evaluateDriveEligibility(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    const authorized = ['placement', 'principal', 'management', 'super_admin', 'hod', 'faculty'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to eligibility evaluation engine.');
    }
    const evaluation = await this.enterpriseService.evaluateDriveEligibility(id);
    return { success: true, data: evaluation };
  }

  @Post('placement/apply')
  @ApiOperation({ summary: 'Student applies for placement drive' })
  async applyToDrive(@CurrentUser() user: any, @Body() body: { driveId: string; cgpa: number }) {
    const role = normalizeRole(user.role);
    if (role !== 'student') {
      throw new ForbiddenException('Only enrolled students can apply for campus placement drives.');
    }
    const studentRoll = user.student?.rollNumber || user.identifier;
    const studentName = user.name;
    const application = await this.enterpriseService.applyToDrive({
      driveId: body.driveId,
      studentRoll,
      studentName,
      cgpa: Number(body.cgpa) || 8.0,
    });
    return { success: true, message: 'Application submitted successfully to T&P cell!', data: application };
  }

  @Get('placement/applications')
  @ApiOperation({ summary: 'View drive applicants across ATS stages' })
  async getPlacementApplications(@CurrentUser() user: any, @Query('driveId') driveId?: string) {
    const role = normalizeRole(user.role);
    const authorized = ['placement', 'principal', 'management', 'super_admin', 'hod'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied to placement applicant records.');
    }
    const data = await this.enterpriseService.getPlacementApplications(driveId);
    return { success: true, count: data.length, data };
  }

  @Post('placement/applications/:id/advance')
  @ApiOperation({ summary: 'Advance applicant through recruitment rounds (ATS pipeline)' })
  async advanceApplicationStage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { nextStage: string; nextStatus: string; notes?: string; score?: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'placement' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const updated = await this.enterpriseService.advanceApplicationStage(id, body, user);
    return { success: true, message: `Applicant advanced to "${body.nextStage}".`, data: updated };
  }

  @Post('placement/offers/release')
  @ApiOperation({ summary: 'Release official placement offer letter to selected student' })
  async releasePlacementOffer(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'placement' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const offer = await this.enterpriseService.releasePlacementOffer(body, user);
    return { success: true, message: `Placement offer letter issued to ${offer.studentName}!`, data: offer };
  }

  @Post('placement/offers/:id/action')
  @ApiOperation({ summary: 'Student accepts or declines job offer' })
  async actionPlacementOffer(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { action: string; notes?: string }) {
    const updated = await this.enterpriseService.actionPlacementOffer(id, body.action, body.notes, user);
    return { success: true, message: `Offer response recorded: ${body.action}`, data: updated };
  }

  // ==========================================
  // 4. TRANSPORT FLEET & LOGISTICS ENDPOINTS
  // ==========================================
  @Get('transport/dashboard-stats')
  @ApiOperation({ summary: 'Get transport fleet & operations KPI stats' })
  async getTransportDashboardStats(@CurrentUser() user: any) {
    const data = await this.enterpriseService.getTransportDashboardStats();
    return { success: true, data };
  }

  @Get('transport/routes')
  @ApiOperation({ summary: 'Get college transit bus routes and timings' })
  async getTransportRoutes() {
    const data = await this.enterpriseService.getTransportRoutes();
    return { success: true, count: data.length, data };
  }

  @Post('transport/routes')
  @ApiOperation({ summary: 'Create transit bus route (Transport role only)' })
  async createTransportRoute(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Only Transport Supervisor can configure fleet transit routes.');
    }
    const route = await this.enterpriseService.createTransportRoute(body);
    return { success: true, message: `Route ${route.routeNumber} (${route.routeName}) registered!`, data: route };
  }

  @Patch('transport/routes/:id/disruption')
  @ApiOperation({ summary: 'Publish route disruption / temporary diversion' })
  async updateRouteDisruption(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { disruptionNotice: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Transport desk can broadcast route diversions.');
    }
    const updated = await this.enterpriseService.updateTransportRouteDisruption(id, body.disruptionNotice);
    return { success: true, message: 'Route operational status updated.', data: updated };
  }

  @Get('transport/fleet')
  @ApiOperation({ summary: 'Get fleet vehicles with compliance certificates' })
  async getTransportFleet() {
    const data = await this.enterpriseService.getTransportFleet();
    return { success: true, count: data.length, data };
  }

  @Post('transport/fleet')
  @ApiOperation({ summary: 'Add vehicle to university fleet' })
  async createTransportVehicle(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Transport Manager can add vehicles.');
    }
    const vehicle = await this.enterpriseService.createTransportVehicle(body, user);
    return { success: true, message: `Vehicle ${vehicle.busNumber} added to fleet!`, data: vehicle };
  }

  @Patch('transport/fleet/:id/status')
  @ApiOperation({ summary: 'Update vehicle operational status' })
  async updateVehicleStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const updated = await this.enterpriseService.updateVehicleStatus(id, body.status, body.notes, user);
    return { success: true, message: `Vehicle status updated to ${body.status}.`, data: updated };
  }

  @Patch('transport/fleet/:id/compliance')
  @ApiOperation({ summary: 'Update vehicle fitness, insurance, and PUC certificates' })
  async updateVehicleCompliance(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const updated = await this.enterpriseService.updateVehicleCompliance(id, body, user);
    return { success: true, message: 'Vehicle compliance certificates renewed.', data: updated };
  }

  @Get('transport/drivers')
  @ApiOperation({ summary: 'Get drivers roster and license validity' })
  async getTransportDrivers() {
    const data = await this.enterpriseService.getTransportDrivers();
    return { success: true, count: data.length, data };
  }

  @Post('transport/drivers')
  @ApiOperation({ summary: 'Add driver to roster' })
  async createTransportDriver(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const driver = await this.enterpriseService.createTransportDriver(body, user);
    return { success: true, message: `Driver ${driver.name} enrolled.`, data: driver };
  }

  @Get('transport/passes')
  @ApiOperation({ summary: 'Get bus pass applications & active passes' })
  async getTransportPasses(@CurrentUser() user: any) {
    const data = await this.enterpriseService.getTransportPasses();
    return { success: true, count: data.length, data };
  }

  @Post('transport/passes/allocate')
  @ApiOperation({ summary: 'Allocate student transport and issue pass' })
  async allocateTransport(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin' && role !== 'admin') {
      throw new ForbiddenException('Access denied.');
    }
    const pass = await this.enterpriseService.allocateStudentTransport(body, user);
    return { success: true, message: `Bus pass ${pass.passNumber} generated for ${pass.studentName}!`, data: pass };
  }

  @Post('transport/passes/:id/action')
  @ApiOperation({ summary: 'Approve, reject, suspend or renew bus pass' })
  async actionTransportPass(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: string; notes?: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const updated = await this.enterpriseService.actionTransportPass(id, body.action, body.notes, user);
    return { success: true, message: `Bus pass action "${body.action}" completed successfully.`, data: updated };
  }

  @Get('transport/trips')
  @ApiOperation({ summary: 'Get today scheduled and active trip operations' })
  async getTransportTrips() {
    const data = await this.enterpriseService.getTransportTrips();
    return { success: true, count: data.length, data };
  }

  @Post('transport/trips/:id/action')
  @ApiOperation({ summary: 'Trip operations action (start, delay, complete, breakdown)' })
  async actionTransportTrip(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: string; delayMinutes?: number; reason?: string; notes?: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'transport' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const updated = await this.enterpriseService.actionTransportTrip(id, body.action, body, user);
    return { success: true, message: `Trip status updated to "${body.action}".`, data: updated };
  }

  @Get('transport/telemetry')
  @ApiOperation({ summary: 'Get live GPS and telematics location freshness' })
  async getTransportTelemetry() {
    const data = await this.enterpriseService.getTransportTelemetry();
    return { success: true, count: data.length, data };
  }

  // ==========================================
  // 5. STAFF (LABS & CAMPUS OPERATIONS) ENDPOINTS
  // ==========================================
  @Get('staff/dashboard-stats')
  @ApiOperation({ summary: 'Get operational console KPI analytics' })
  async getStaffDashboardStats(@CurrentUser() user: any) {
    const data = await this.enterpriseService.getStaffDashboardStats();
    return { success: true, data };
  }

  @Get('staff/equipment')
  @ApiOperation({ summary: 'Get lab instruments & equipment status' })
  async getLabEquipment(@Query('department') department?: string) {
    const data = await this.enterpriseService.getLabEquipment(department);
    return { success: true, count: data.length, data };
  }

  @Patch('staff/equipment/:code/status')
  @ApiOperation({ summary: 'Update equipment operational condition (Staff & Super Admin only)' })
  async updateEquipmentStatus(
    @CurrentUser() user: any,
    @Param('code') code: string,
    @Body() body: { condition: string },
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'staff' && role !== 'super_admin' && role !== 'hod' && role !== 'admin') {
      throw new ForbiddenException('Access denied. Only Lab In-Charge, HOD, or Admin can update equipment calibration status.');
    }
    const updated = await this.enterpriseService.updateEquipmentStatus(code, body.condition);
    return { success: true, message: `Equipment ${code} updated to ${body.condition}`, data: updated };
  }

  // --- Support Tickets ---
  @Get('staff/tickets')
  @ApiOperation({ summary: 'Get campus technical and lab maintenance tickets' })
  async getSupportTickets(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.enterpriseService.getSupportTickets({ status, category, priority, search });
    return { success: true, count: data.length, data };
  }

  @Post('staff/tickets')
  @ApiOperation({ summary: 'Create technical or maintenance support ticket' })
  async createSupportTicket(@CurrentUser() user: any, @Body() body: any) {
    const ticket = await this.enterpriseService.createSupportTicket(body, user);
    return { success: true, message: `Support ticket #${(ticket.details as any)?.ticketNumber || ticket.id} created successfully!`, data: ticket };
  }

  @Patch('staff/tickets/:id/status')
  @ApiOperation({ summary: 'Transition ticket status workflow' })
  async updateTicketStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; resolutionDetails?: string; cancelReason?: string },
  ) {
    const updated = await this.enterpriseService.updateSupportTicketStatus(id, body.status, user, body.resolutionDetails, body.cancelReason);
    return { success: true, message: `Ticket status transitioned to "${body.status}".`, data: updated };
  }

  @Patch('staff/tickets/:id/assign')
  @ApiOperation({ summary: 'Assign or reassign technician' })
  async assignTicket(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { assignedTo: string },
  ) {
    const updated = await this.enterpriseService.assignSupportTicket(id, body.assignedTo, user);
    return { success: true, message: `Ticket assigned to ${body.assignedTo}.`, data: updated };
  }

  @Post('staff/tickets/:id/comments')
  @ApiOperation({ summary: 'Add note or comment to ticket' })
  async addTicketComment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { comment: string; isInternal?: boolean },
  ) {
    const updated = await this.enterpriseService.addTicketComment(id, body.comment, user, body.isInternal);
    return { success: true, message: 'Comment added to ticket history.', data: updated };
  }

  // --- Visitor Gate Passes ---
  @Get('staff/visitors')
  @ApiOperation({ summary: 'Get visitor gate pass register' })
  async getVisitorGatePasses(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.enterpriseService.getVisitorGatePasses({ status, search });
    return { success: true, count: data.length, data };
  }

  @Post('staff/visitors')
  @ApiOperation({ summary: 'Register inward visitor and generate gate pass' })
  async createVisitorGatePass(@CurrentUser() user: any, @Body() body: any) {
    const pass = await this.enterpriseService.createVisitorGatePass(body, user);
    return { success: true, message: `Gate pass #${(pass.details as any)?.passNumber || pass.id} generated!`, data: pass };
  }

  @Post('staff/visitors/:id/action')
  @ApiOperation({ summary: 'Perform check-in, check-out, or cancellation on visitor pass' })
  async actionVisitorGatePass(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'CHECK_IN' | 'CHECK_OUT' | 'CANCEL'; badgeNumber?: string },
  ) {
    const updated = await this.enterpriseService.actionVisitorGatePass(id, body.action, user, body.badgeNumber);
    return { success: true, message: `Visitor pass updated with action ${body.action}.`, data: updated };
  }

  // --- Office Dispatch ---
  @Get('staff/dispatches')
  @ApiOperation({ summary: 'Get administrative inward/outward dispatch register' })
  async getDispatchRecords(
    @Query('dispatchType') dispatchType?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.enterpriseService.getDispatchRecords({ dispatchType, status, department, search });
    return { success: true, count: data.length, data };
  }

  @Post('staff/dispatches')
  @ApiOperation({ summary: 'Index new inward or outward clerical dispatch' })
  async createDispatchRecord(@CurrentUser() user: any, @Body() body: any) {
    const record = await this.enterpriseService.createDispatchRecord(body, user);
    return { success: true, message: `Dispatch document #${(record.details as any)?.refNumber || record.id} registered!`, data: record };
  }

  @Patch('staff/dispatches/:id/status')
  @ApiOperation({ summary: 'Progress dispatch document lifecycle stage' })
  async updateDispatchStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const updated = await this.enterpriseService.updateDispatchStatus(id, body.status, user, body.notes);
    return { success: true, message: `Document transitioned to stage "${body.status}".`, data: updated };
  }

  // ==========================================
  // 6. WORKFLOW & APPROVALS ENDPOINTS
  // ==========================================
  @Get('workflow/requests')
  @ApiOperation({ summary: 'Get multi-stage workflow approval requests' })
  async getWorkflowRequests(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const data = await this.enterpriseService.getWorkflowRequests(role, user.department);
    return { success: true, count: data.length, data };
  }

  @Post('workflow/requests')
  @ApiOperation({ summary: 'Submit approval workflow request' })
  async createWorkflowRequest(@CurrentUser() user: any, @Body() body: any) {
    const req = await this.enterpriseService.createWorkflowRequest({
      ...body,
      requesterId: user.id,
      requesterName: user.name,
      requesterRole: user.role,
      department: user.department,
    });
    return { success: true, message: 'Workflow request submitted into college approval pipeline!', data: req };
  }

  @Post('workflow/requests/:id/action')
  @ApiOperation({ summary: 'Review and approve/reject workflow request' })
  async actionWorkflowRequest(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' | 'RETURN'; notes?: string },
  ) {
    const role = normalizeRole(user.role);
    const authorized = ['hod', 'principal', 'management', 'super_admin', 'exam_cell', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. You do not possess approval delegation authority.');
    }

    const updated = await this.enterpriseService.updateWorkflowStage(
      id,
      body.action,
      { id: user.id, name: user.name, role: user.role },
      body.notes,
    );
    const verb = body.action === 'APPROVE' ? 'APPROVED' : body.action === 'RETURN' ? 'RETURNED FOR REVISION' : 'REJECTED';
    return { success: true, message: `Request successfully ${verb}.`, data: updated };
  }

  // ==========================================
  // 7. SYSTEM SETTINGS (Super Admin Only)
  // ==========================================
  @Get('system/settings')
  @ApiOperation({ summary: 'Get autonomous college system configuration' })
  async getSystemSettings(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    const authorized = ['super_admin', 'management', 'principal'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied. System settings restricted to executive leadership.');
    }
    const data = await this.enterpriseService.getSystemSettings();
    return { success: true, count: data.length, data };
  }

  @Put('system/settings')
  @ApiOperation({ summary: 'Update system setting (Super Admin strictly)' })
  async updateSystemSetting(@CurrentUser() user: any, @Body() body: { key: string; value: string }) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Root system settings can only be altered by Super Admin.');
    }
    const updated = await this.enterpriseService.updateSystemSetting(body.key, body.value, user.name);
    return { success: true, message: `Setting ${body.key} updated!`, data: updated };
  }
}
