// Apna Campus ERP — Enterprise Canteen & Mess Operations Controller
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CanteenService } from './canteen.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';
import { MealType } from './canteen.types';

@ApiTags('Smart Canteen & Mess Enterprise')
@Controller('canteen')
export class CanteenController {
  constructor(private readonly canteenService: CanteenService) {}

  // ==========================================
  // 1. HOSTELLER MANAGEMENT
  // ==========================================

  @Get('hostellers')
  @ApiOperation({ summary: 'Get all hostel students with filters and meal eligibility' })
  async getHostellers(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('feeStatus') feeStatus?: string,
    @Query('hostel') hostel?: string,
    @Query('room') room?: string,
    @Query('branch') branch?: string,
    @Query('academicYear') academicYear?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const role = user?.role ? normalizeRole(user.role) : 'canteen';
    return this.canteenService.getHostellers(
      { search, status, feeStatus, hostel, room, branch, academicYear, page, limit },
      role
    );
  }

  @Get('hostellers/fee-status')
  @ApiOperation({ summary: 'Get hostel accommodation fee status (Super Admin, Admin, Accounts only)' })
  async getHostelFeeStatus(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('hostel') hostel?: string,
  ) {
    const role = user?.role ? normalizeRole(user.role) : 'super_admin';
    return this.canteenService.getHostelFeeStatus({ search, status, hostel }, role);
  }

  @Get('hostellers/:studentId')
  @ApiOperation({ summary: 'Get full hosteller details' })
  async getHostellerById(@CurrentUser() user: any, @Param('studentId') studentId: string) {
    const role = user?.role ? normalizeRole(user.role) : 'canteen';
    return this.canteenService.getHostellerById(studentId, role);
  }

  // ==========================================
  // 2. BIOMETRIC MANAGEMENT
  // ==========================================

  @Get('biometric/students')
  @ApiOperation({ summary: 'Get student biometric mappings' })
  async getBiometricStudents(@Query('query') query?: string) {
    return this.canteenService.getBiometricStudents(query);
  }

  @Post('biometric/register')
  @ApiOperation({ summary: 'Register student biometric reference ID and device mapping' })
  async registerBiometric(
    @CurrentUser() user: any,
    @Body() body: { studentId: string; biometricId: string; deviceId: string }
  ) {
    const actor = user?.name || 'Canteen In-Charge';
    return this.canteenService.registerBiometric(body, actor);
  }

  @Patch('biometric/status')
  @ApiOperation({ summary: 'Activate or deactivate student biometric meal access' })
  async toggleBiometricStatus(
    @CurrentUser() user: any,
    @Body() body: { studentId: string; status: 'Active' | 'Inactive' }
  ) {
    const actor = user?.name || 'Supervisor';
    return this.canteenService.toggleBiometricStatus(body.studentId, body.status, actor);
  }

  @Get('biometric/devices')
  @ApiOperation({ summary: 'Get biometric terminal hardware status' })
  async getBiometricDevices() {
    return this.canteenService.getBiometricDevices();
  }

  @Get('biometric/logs')
  @ApiOperation({ summary: 'Get verification audit logs and failed attempts' })
  async getBiometricLogs(@Query('search') search?: string, @Query('type') type?: string) {
    return this.canteenService.getBiometricLogs({ search, type });
  }

  // ==========================================
  // 3. MEAL ATTENDANCE & VERIFICATION
  // ==========================================

  @Post('meals/verify')
  @ApiOperation({ summary: 'Verify student meal access via Biometric or Manual Override' })
  async verifyMealAccess(
    @CurrentUser() user: any,
    @Body() body: {
      studentId?: string;
      biometricId?: string;
      mealType: MealType;
      terminalId?: string;
      isManual?: boolean;
      manualReason?: string;
    }
  ) {
    const actor = user?.name || 'Mess Counter Terminal';
    return this.canteenService.verifyMealAccess(body, actor);
  }

  @Get('meals/attendance')
  @ApiOperation({ summary: 'Get daily meal attendance records' })
  async getMealAttendance(
    @Query('date') date?: string,
    @Query('mealType') mealType?: string,
    @Query('hostel') hostel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.canteenService.getMealAttendance({ date, mealType, hostel, status, search });
  }

  @Get('meals/daily-summary')
  @ApiOperation({ summary: 'Get meal-wise attendance KPIs and hostel breakdown' })
  async getDailyMealSummary(@Query('date') date?: string) {
    return this.canteenService.getDailyMealSummary(date);
  }

  @Get('meals/absent-students')
  @ApiOperation({ summary: 'Get absent students for closed service windows' })
  async getAbsentStudents(
    @Query('date') date?: string,
    @Query('mealType') mealType?: MealType,
    @Query('hostel') hostel?: string,
  ) {
    return this.canteenService.getAbsentStudents({ date, mealType, hostel });
  }

  // ==========================================
  // 4. FOOD CONSUMPTION & KITCHEN INVENTORY
  // ==========================================

  @Get('food-consumption/daily')
  @ApiOperation({ summary: 'Get daily food consumption vs preparation and wastage' })
  async getDailyFoodConsumption(@Query('date') date?: string) {
    return this.canteenService.getDailyFoodConsumption(date);
  }

  @Get('food-consumption/monthly')
  @ApiOperation({ summary: 'Get monthly food consumption analytics' })
  async getMonthlyFoodConsumption(@Query('monthYear') monthYear?: string) {
    return this.canteenService.getMonthlyFoodConsumption(monthYear);
  }

  @Post('food-consumption')
  @ApiOperation({ summary: 'Log meal food prepared, served, and wastage' })
  async logFoodConsumption(
    @CurrentUser() user: any,
    @Body() body: {
      date: string;
      mealType: MealType;
      actualFoodPreparedKg: number;
      actualFoodServedKg: number;
      foodWastageKg: number;
      specialMealCount?: number;
      specialMealNotes?: string;
    }
  ) {
    const actor = user?.name || 'Head Chef';
    return this.canteenService.logFoodConsumption(body, actor);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get kitchen raw ingredients inventory' })
  async getKitchenInventory(@Query('category') category?: string) {
    return this.canteenService.getKitchenInventory(category);
  }

  @Post('inventory/transaction')
  @ApiOperation({ summary: 'Record inventory stock purchase, usage, or wastage' })
  async recordInventoryTransaction(
    @CurrentUser() user: any,
    @Body() body: {
      itemId: string;
      type: 'PURCHASE' | 'DAILY_USAGE' | 'WASTAGE_DISPOSAL' | 'ADJUSTMENT';
      quantity: number;
      unitCost?: number;
      supplier?: string;
      invoiceNo?: string;
      reason?: string;
    }
  ) {
    const actor = user?.name || 'Inventory Manager';
    return this.canteenService.recordInventoryTransaction(body, actor);
  }

  // ==========================================
  // 5. REPORTS & EXPORTS
  // ==========================================

  @Get('reports/daily')
  @ApiOperation({ summary: 'Generate comprehensive daily canteen report' })
  async getDailyReport(@Query('date') date?: string) {
    return this.canteenService.getDailyReport(date);
  }

  @Get('reports/monthly')
  @ApiOperation({ summary: 'Generate monthly canteen analytics report' })
  async getMonthlyReport(@Query('monthYear') monthYear?: string) {
    return this.canteenService.getMonthlyReport(monthYear);
  }

  @Get('reports/student-wise')
  @ApiOperation({ summary: 'Generate student-wise meal attendance and ledger report' })
  async getStudentWiseReport(
    @CurrentUser() user: any,
    @Query('studentId') studentId: string,
  ) {
    const role = user?.role ? normalizeRole(user.role) : 'canteen';
    return this.canteenService.getStudentWiseReport(studentId || '2401432265', role);
  }

  @Get('reports/hostel-wise')
  @ApiOperation({ summary: 'Generate hostel-wise consumption report' })
  async getHostelWiseReport() {
    return this.canteenService.getHostelWiseReport();
  }

  @Get('reports/financial')
  @ApiOperation({ summary: 'Generate canteen financial statement' })
  async getFinancialReport(@CurrentUser() user: any) {
    const role = user?.role ? normalizeRole(user.role) : 'canteen';
    return this.canteenService.getFinancialReport(role);
  }

  // ==========================================
  // 6. MENU & WALLET / SMART CARD ORDERS
  // ==========================================

  @Get('menu')
  @ApiOperation({ summary: 'Get canteen menu food items and live stock availability' })
  async getMenu() {
    const data = await this.canteenService.getMenu();
    return { success: true, count: data.length, data };
  }

  @Post('menu')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add new food item to smart canteen (Canteen & Admin only)' })
  async addFoodItem(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (!['canteen', 'admin', 'super_admin'].includes(role)) {
      throw new ForbiddenException('Access denied. Only Canteen staff or Admin can add food items.');
    }
    const item = await this.canteenService.addFoodItem(body);
    return { success: true, message: `Added ${item.name} (₹${item.price}) to Smart Canteen menu!`, data: item };
  }

  @Patch('menu/:id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle food item availability (Canteen & Admin only)' })
  async toggleAvailability(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (!['canteen', 'admin', 'super_admin'].includes(role)) {
      throw new ForbiddenException('Access denied. Only Canteen staff can toggle availability.');
    }
    const item = await this.canteenService.toggleAvailability(id);
    return {
      success: true,
      message: `${(item as any)?.name || 'Item'} marked as ${(item as any)?.isAvailable ? 'Available' : 'Out of Stock'}.`,
      data: item,
    };
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get live kitchen orders queue' })
  async getOrders(@CurrentUser() user: any) {
    const role = normalizeRole(user.role);
    if (!['canteen', 'admin', 'super_admin', 'student', 'faculty', 'staff'].includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.canteenService.getOrders();
    return { success: true, count: data.length, data };
  }

  @Post('order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place food order and deduct from RFID wallet' })
  async placeOrder(@CurrentUser() user: any, @Body() body: any) {
    const orderData = {
      ...body,
      rollNumber: body.rollNumber || user?.student?.rollNumber || user?.identifier,
    };
    const result = await this.canteenService.placeOrder(orderData);
    return {
      success: true,
      message: `Order placed! Token #${result.token} issued.`,
      data: result,
    };
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update kitchen order status (Canteen & Admin only)' })
  async updateOrderStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { status: string }) {
    const role = normalizeRole(user.role);
    if (!['canteen', 'admin', 'super_admin'].includes(role)) {
      throw new ForbiddenException('Access denied. Only Canteen kitchen staff can update order status.');
    }
    const updated = await this.canteenService.updateOrderStatus(id, body.status);
    return { success: true, message: `Order ${id} is now marked as "${body.status}"!`, data: updated };
  }

  @Post('wallet/topup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top up student RFID smart card balance' })
  async topUpWallet(@CurrentUser() user: any, @Body() body: { rollNumber?: string; amount: number }) {
    const role = normalizeRole(user.role);
    const targetRoll = body.rollNumber || user?.student?.rollNumber || user?.identifier;
    if (role === 'student' && targetRoll !== (user?.student?.rollNumber || user?.identifier)) {
      throw new ForbiddenException('Students can only top up their own RFID wallet.');
    }
    const res = await this.canteenService.topUpWallet(targetRoll || '01', body.amount);
    return { success: true, message: `Wallet topped up by ₹${body.amount}!`, data: res };
  }
}
