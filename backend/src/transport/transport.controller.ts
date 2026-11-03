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
import { CurrentUser } from '../auth/current-user.decorator';
import { TransportService } from './transport.service';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  UpdateVehicleStatusDto,
  CreateDriverDto,
  UpdateDriverDto,
  CreateRouteDto,
  UpdateRouteDto,
  UpdateRouteDisruptionDto,
  AllocatePassDto,
  ActionPassDto,
  CreateTripDto,
  ActionTripDto,
  CreateMaintenanceDto,
  CreateFuelLogDto,
  CreateFeeRecordDto,
  CreateComplaintDto,
  CreateAccidentDto,
  CreateParkingDto,
  CreateStaffAttendanceDto,
  CreateNotificationDto,
  CreateRequestDto,
  ActionRequestDto,
  CreateSafetyInspectionDto,
  CreateScheduleDto,
  CreateInventoryDto,
  CreatePolicyDto,
  UpdatePermissionDto,
} from './transport.dto';

@ApiTags('Transport Management System')
@Controller('transport')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  private extractUser(currentUser: any, req: any) {
    const user = currentUser || {};
    const headerUserId = req?.headers?.['x-user-id'];
    const headerUserRole = req?.headers?.['x-user-role'];
    return {
      ...user,
      id: headerUserId || user.id || user.identifier || 'user-default',
      role: headerUserRole || user.role || 'transport',
    };
  }

  // 1. Dashboard Stats
  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get transport dashboard statistics and KPIs' })
  async getDashboardStats(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fleet', 'view');
    const data = await this.transportService.getDashboardStats();
    return { success: true, data };
  }

  // 2. Fleet Vehicles
  @Get('fleet')
  @ApiOperation({ summary: 'Get all transport vehicles' })
  async getFleet(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fleet', 'view');
    const data = await this.transportService.getFleet();
    return { success: true, data };
  }

  @Post('fleet')
  @ApiOperation({ summary: 'Create new transport vehicle' })
  async createVehicle(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateVehicleDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fleet', 'create');
    const data = await this.transportService.createVehicle(dto);
    return { success: true, data };
  }

  @Patch('fleet/:id')
  @ApiOperation({ summary: 'Update transport vehicle' })
  async updateVehicle(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fleet', 'update');
    const data = await this.transportService.updateVehicle(id, dto);
    return { success: true, data };
  }

  @Delete('fleet/:id')
  @ApiOperation({ summary: 'Delete transport vehicle' })
  async deleteVehicle(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fleet', 'delete');
    return this.transportService.deleteVehicle(id);
  }

  @Patch('fleet/:id/status')
  @ApiOperation({ summary: 'Update vehicle operational status' })
  async updateVehicleStatus(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateVehicleStatusDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fleet', 'update');
    const data = await this.transportService.updateVehicleStatus(id, body.status, body.notes);
    return { success: true, data };
  }

  // 3. Drivers
  @Get('drivers')
  @ApiOperation({ summary: 'Get all transport drivers' })
  async getDrivers(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'drivers', 'view');
    const data = await this.transportService.getDrivers();
    return { success: true, data };
  }

  @Post('drivers')
  @ApiOperation({ summary: 'Register new driver' })
  async createDriver(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateDriverDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'drivers', 'create');
    const data = await this.transportService.createDriver(dto);
    return { success: true, data };
  }

  @Patch('drivers/:id')
  @ApiOperation({ summary: 'Update driver profile' })
  async updateDriver(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'drivers', 'update');
    const data = await this.transportService.updateDriver(id, dto);
    return { success: true, data };
  }

  @Delete('drivers/:id')
  @ApiOperation({ summary: 'Delete driver record' })
  async deleteDriver(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'drivers', 'delete');
    return this.transportService.deleteDriver(id);
  }

  // 4. Routes
  @Get('routes')
  @ApiOperation({ summary: 'Get all transport routes' })
  async getRoutes(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'routes', 'view');
    const data = await this.transportService.getRoutes();
    return { success: true, data };
  }

  @Post('routes')
  @ApiOperation({ summary: 'Create new transport route' })
  async createRoute(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateRouteDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'routes', 'create');
    const data = await this.transportService.createRoute(dto);
    return { success: true, data };
  }

  @Patch('routes/:id')
  @ApiOperation({ summary: 'Update transport route' })
  async updateRoute(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'routes', 'update');
    const data = await this.transportService.updateRoute(id, dto);
    return { success: true, data };
  }

  @Delete('routes/:id')
  @ApiOperation({ summary: 'Delete transport route' })
  async deleteRoute(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'routes', 'delete');
    return this.transportService.deleteRoute(id);
  }

  @Patch('routes/:id/disruption')
  @ApiOperation({ summary: 'Broadcast route diversion / disruption' })
  async updateRouteDisruption(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateRouteDisruptionDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'routes', 'update');
    const data = await this.transportService.updateRouteDisruption(id, body.disruptionNote, body.status);
    return { success: true, data };
  }

  // 5. Passes
  @Get('passes')
  @ApiOperation({ summary: 'Get all transport passes' })
  async getPasses(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'passes', 'view');
    const data = await this.transportService.getPasses();
    return { success: true, data };
  }

  @Post('passes/allocate')
  @ApiOperation({ summary: 'Allocate new student bus pass' })
  async allocatePass(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: AllocatePassDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'passes', 'create');
    const data = await this.transportService.allocatePass(dto);
    return { success: true, data };
  }

  @Patch('passes/:id/action')
  @ApiOperation({ summary: 'Approve, cancel, or renew pass' })
  async actionPass(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: ActionPassDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'passes', 'update');
    const data = await this.transportService.actionPass(id, body.action, body.notes);
    return { success: true, data };
  }

  @Delete('passes/:id')
  @ApiOperation({ summary: 'Delete bus pass' })
  async deletePass(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'passes', 'delete');
    return this.transportService.deletePass(id);
  }

  // 6. Trips
  @Get('trips')
  @ApiOperation({ summary: 'Get all transport trips' })
  async getTrips(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'trips', 'view');
    const data = await this.transportService.getTrips();
    return { success: true, data };
  }

  @Post('trips')
  @ApiOperation({ summary: 'Create new trip' })
  async createTrip(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateTripDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'trips', 'create');
    const data = await this.transportService.createTrip(dto);
    return { success: true, data };
  }

  @Patch('trips/:id/action')
  @ApiOperation({ summary: 'Perform trip status action (start, delay, complete)' })
  async actionTrip(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: ActionTripDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'trips', 'update');
    const data = await this.transportService.actionTrip(id, body.action, body);
    return { success: true, data };
  }

  // 7. Telemetry & GPS
  @Get('telemetry')
  @ApiOperation({ summary: 'Get live telemetry for all buses' })
  async getTelemetry(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'telemetry', 'view');
    const data = await this.transportService.getTelemetry();
    return { success: true, data };
  }

  @Patch('telemetry/:vehicleNumber')
  @ApiOperation({ summary: 'Update vehicle telemetry ping' })
  async updateTelemetry(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('vehicleNumber') vehicleNumber: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'telemetry', 'update');
    const data = await this.transportService.updateTelemetry(vehicleNumber, body);
    return { success: true, data };
  }

  // 8. Boarding Attendance
  @Get('boarding')
  @ApiOperation({ summary: 'Get passenger boarding attendance manifest' })
  async getBoarding(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Query('date') date?: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fleet', 'view');
    const data = await this.transportService.getBoarding(date);
    return { success: true, data };
  }

  @Post('boarding')
  @ApiOperation({ summary: 'Record QR/RFID boarding entry' })
  async recordBoarding(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fleet', 'create');
    const data = await this.transportService.recordBoarding(body);
    return { success: true, data };
  }

  // 9. Maintenance
  @Get('maintenance')
  @ApiOperation({ summary: 'Get vehicle maintenance records' })
  async getMaintenance(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'maintenance', 'view');
    const data = await this.transportService.getMaintenance();
    return { success: true, data };
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Log vehicle maintenance entry' })
  async createMaintenance(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateMaintenanceDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'maintenance', 'create');
    const data = await this.transportService.createMaintenance(dto);
    return { success: true, data };
  }

  @Patch('maintenance/:id')
  @ApiOperation({ summary: 'Update maintenance log' })
  async updateMaintenance(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'maintenance', 'update');
    const data = await this.transportService.updateMaintenance(id, body);
    return { success: true, data };
  }

  @Delete('maintenance/:id')
  @ApiOperation({ summary: 'Delete maintenance log' })
  async deleteMaintenance(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'maintenance', 'delete');
    return this.transportService.deleteMaintenance(id);
  }

  // 10. Fuel Expenses
  @Get('fuel')
  @ApiOperation({ summary: 'Get fuel expense logs' })
  async getFuelLogs(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fuel', 'view');
    const data = await this.transportService.getFuelLogs();
    return { success: true, data };
  }

  @Post('fuel')
  @ApiOperation({ summary: 'Record fuel expense entry' })
  async createFuelLog(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateFuelLogDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fuel', 'create');
    const data = await this.transportService.createFuelLog(dto);
    return { success: true, data };
  }

  @Patch('fuel/:id')
  @ApiOperation({ summary: 'Update fuel log' })
  async updateFuelLog(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fuel', 'update');
    const data = await this.transportService.updateFuelLog(id, body);
    return { success: true, data };
  }

  @Delete('fuel/:id')
  @ApiOperation({ summary: 'Delete fuel log' })
  async deleteFuelLog(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fuel', 'delete');
    return this.transportService.deleteFuelLog(id);
  }

  // 11. Transport Fees
  @Get('fees')
  @ApiOperation({ summary: 'Get student transport fee records' })
  async getFees(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fees', 'view');
    const data = await this.transportService.getFees();
    return { success: true, data };
  }

  @Post('fees')
  @ApiOperation({ summary: 'Create student transport fee ledger entry' })
  async createFeeRecord(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateFeeRecordDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fees', 'create');
    const data = await this.transportService.createFeeRecord(dto);
    return { success: true, data };
  }

  @Patch('fees/:id')
  @ApiOperation({ summary: 'Update fee record / mark payment' })
  async updateFeeRecord(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fees', 'update');
    const data = await this.transportService.updateFeeRecord(id, body);
    return { success: true, data };
  }

  @Delete('fees/:id')
  @ApiOperation({ summary: 'Delete fee record' })
  async deleteFeeRecord(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'fees', 'delete');
    return this.transportService.deleteFeeRecord(id);
  }

  // 12. Compliance & Permits
  @Get('compliance')
  @ApiOperation({ summary: 'Get vehicle compliance status' })
  async getCompliance(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'compliance', 'view');
    const data = await this.transportService.getCompliance();
    return { success: true, data };
  }

  @Patch('compliance/:busNumber')
  @ApiOperation({ summary: 'Update vehicle compliance record' })
  async updateCompliance(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('busNumber') busNumber: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'compliance', 'update');
    const data = await this.transportService.updateCompliance(busNumber, body);
    return { success: true, data };
  }

  // 13. Complaints & Grievances
  @Get('complaints')
  @ApiOperation({ summary: 'Get commuter complaints' })
  async getComplaints(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'complaints', 'view');
    const data = await this.transportService.getComplaints();
    return { success: true, data };
  }

  @Post('complaints')
  @ApiOperation({ summary: 'Submit transport complaint' })
  async createComplaint(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateComplaintDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'complaints', 'create');
    const data = await this.transportService.createComplaint(dto);
    return { success: true, data };
  }

  @Patch('complaints/:id')
  @ApiOperation({ summary: 'Resolve or update complaint status' })
  async updateComplaint(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'complaints', 'update');
    const data = await this.transportService.updateComplaint(id, body);
    return { success: true, data };
  }

  @Delete('complaints/:id')
  @ApiOperation({ summary: 'Delete complaint record' })
  async deleteComplaint(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'complaints', 'delete');
    return this.transportService.deleteComplaint(id);
  }

  // 14. Accidents & Incidents
  @Get('accidents')
  @ApiOperation({ summary: 'Get road hazard and incident logs' })
  async getAccidents(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'accidents', 'view');
    const data = await this.transportService.getAccidents();
    return { success: true, data };
  }

  @Post('accidents')
  @ApiOperation({ summary: 'Log road incident or hazard' })
  async createAccident(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateAccidentDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'accidents', 'create');
    const data = await this.transportService.createAccident(dto);
    return { success: true, data };
  }

  @Patch('accidents/:id')
  @ApiOperation({ summary: 'Update incident follow-up action' })
  async updateAccident(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'accidents', 'update');
    const data = await this.transportService.updateAccident(id, body);
    return { success: true, data };
  }

  @Delete('accidents/:id')
  @ApiOperation({ summary: 'Delete accident record' })
  async deleteAccident(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'accidents', 'delete');
    return this.transportService.deleteAccident(id);
  }

  // 15. Parking & Bus Bays
  @Get('parking')
  @ApiOperation({ summary: 'Get bus bay allocations' })
  async getParking(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'parking', 'view');
    const data = await this.transportService.getParking();
    return { success: true, data };
  }

  @Post('parking')
  @ApiOperation({ summary: 'Create bus bay slot' })
  async createParking(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateParkingDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'parking', 'create');
    const data = await this.transportService.createParking(dto);
    return { success: true, data };
  }

  @Patch('parking/:id')
  @ApiOperation({ summary: 'Update parking bay status' })
  async updateParking(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'parking', 'update');
    const data = await this.transportService.updateParking(id, body);
    return { success: true, data };
  }

  @Delete('parking/:id')
  @ApiOperation({ summary: 'Delete parking bay' })
  async deleteParking(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'parking', 'delete');
    return this.transportService.deleteParking(id);
  }

  // 16. Staff Attendance
  @Get('staff-attendance')
  @ApiOperation({ summary: 'Get transport staff attendance' })
  async getStaffAttendance(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Query('date') date?: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'staff_attendance', 'view');
    const data = await this.transportService.getStaffAttendance(date);
    return { success: true, data };
  }

  @Post('staff-attendance')
  @ApiOperation({ summary: 'Record staff attendance check-in' })
  async createStaffAttendance(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateStaffAttendanceDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'staff_attendance', 'create');
    const data = await this.transportService.createStaffAttendance(dto);
    return { success: true, data };
  }

  // 17. Notifications & Alerts
  @Get('notifications')
  @ApiOperation({ summary: 'Get transport announcements and alerts' })
  async getNotifications(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'notifications', 'view');
    const data = await this.transportService.getNotifications();
    return { success: true, data };
  }

  @Post('notifications')
  @ApiOperation({ summary: 'Publish transport notification' })
  async createNotification(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateNotificationDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'notifications', 'create');
    const data = await this.transportService.createNotification(dto);
    return { success: true, data };
  }

  @Delete('notifications/:id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'notifications', 'delete');
    return this.transportService.deleteNotification(id);
  }

  // 18. Student Requests
  @Get('requests')
  @ApiOperation({ summary: 'Get student route/pass change requests' })
  async getRequests(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'requests', 'view');
    const data = await this.transportService.getRequests();
    return { success: true, data };
  }

  @Post('requests')
  @ApiOperation({ summary: 'Submit student transit request' })
  async createRequest(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateRequestDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'requests', 'create');
    const data = await this.transportService.createRequest(dto);
    return { success: true, data };
  }

  @Patch('requests/:id/decision')
  @ApiOperation({ summary: 'Approve or reject student transport request' })
  async actionRequest(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: ActionRequestDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'requests', 'update');
    const data = await this.transportService.actionRequest(id, body.decision, body.reviewNotes, user.name);
    return { success: true, data };
  }

  @Delete('requests/:id')
  @ApiOperation({ summary: 'Delete request record' })
  async deleteRequest(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'requests', 'delete');
    return this.transportService.deleteRequest(id);
  }

  // 19. Safety Inspections
  @Get('safety-inspections')
  @ApiOperation({ summary: 'Get daily bus safety checklist audits' })
  async getSafetyInspections(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'safety', 'view');
    const data = await this.transportService.getSafetyInspections();
    return { success: true, data };
  }

  @Post('safety-inspections')
  @ApiOperation({ summary: 'Log safety inspection checklist audit' })
  async createSafetyInspection(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateSafetyInspectionDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'safety', 'create');
    const data = await this.transportService.createSafetyInspection(dto);
    return { success: true, data };
  }

  // 20. Schedules & Calendar
  @Get('schedules')
  @ApiOperation({ summary: 'Get transport schedules and calendar runs' })
  async getSchedules(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'schedule', 'view');
    const data = await this.transportService.getSchedules();
    return { success: true, data };
  }

  @Post('schedules')
  @ApiOperation({ summary: 'Create transit schedule run' })
  async createSchedule(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateScheduleDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'schedule', 'create');
    const data = await this.transportService.createSchedule(dto);
    return { success: true, data };
  }

  // 21. Inventory & Spare Parts
  @Get('inventory')
  @ApiOperation({ summary: 'Get spare parts and workshop inventory' })
  async getInventory(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'inventory', 'view');
    const data = await this.transportService.getInventory();
    return { success: true, data };
  }

  @Post('inventory')
  @ApiOperation({ summary: 'Add inventory spare part item' })
  async createInventory(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreateInventoryDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'inventory', 'create');
    const data = await this.transportService.createInventory(dto);
    return { success: true, data };
  }

  @Patch('inventory/:id')
  @ApiOperation({ summary: 'Update inventory stock count' })
  async updateInventory(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'inventory', 'update');
    const data = await this.transportService.updateInventory(id, body);
    return { success: true, data };
  }

  @Delete('inventory/:id')
  @ApiOperation({ summary: 'Delete inventory item' })
  async deleteInventory(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'inventory', 'delete');
    return this.transportService.deleteInventory(id);
  }

  // 22. Policies
  @Get('policies')
  @ApiOperation({ summary: 'Get transport regulations and commuter guidelines' })
  async getPolicies(@CurrentUser() currentUser: any, @Req() req: any) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'settings', 'view');
    const data = await this.transportService.getPolicies();
    return { success: true, data };
  }

  @Post('policies')
  @ApiOperation({ summary: 'Create transport policy rule' })
  async createPolicy(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: CreatePolicyDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'settings', 'create');
    const data = await this.transportService.createPolicy(dto);
    return { success: true, data };
  }

  // 23. Permissions Management (Super Admin Exclusive)
  @Get('permissions')
  @ApiOperation({ summary: 'Get role-based transport section permissions' })
  async getPermissions(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Query('role') role?: string,
  ) {
    const user = this.extractUser(currentUser, req);
    // Only Super Admin can inspect and edit permission matrices
    this.transportService.checkPermission(user, 'permissions', 'settings');
    const data = await this.transportService.getPermissions(role);
    return { success: true, data };
  }

  @Patch('permissions')
  @ApiOperation({ summary: 'Update transport section permission for a role' })
  async updatePermission(
    @CurrentUser() currentUser: any,
    @Req() req: any,
    @Body() dto: UpdatePermissionDto,
  ) {
    const user = this.extractUser(currentUser, req);
    this.transportService.checkPermission(user, 'permissions', 'settings');
    const data = await this.transportService.updatePermission(dto, user.name || user.id);
    return { success: true, data };
  }
}
