import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { normalizeRole } from '../rbac/rbac';
import { CanteenService } from './canteen.service';
import { CreateFoodItemDto, PlaceOrderDto, UpdateOrderStatusDto, WalletTopUpDto } from './canteen.dto';

@ApiTags('Smart Canteen & Mess')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('canteen')
export class CanteenController {
  constructor(private readonly canteenService: CanteenService) {}

  private requireRole(user: any, allowed: string[]) {
    const role = normalizeRole(user.role);
    if (!allowed.includes(role)) throw new ForbiddenException('Your role cannot perform this canteen operation.');
  }

  @Get('menu')
  @ApiOperation({ summary: 'Get persisted canteen menu and live availability' })
  async getMenu() {
    const data = await this.canteenService.getMenu();
    return { success: true, count: data.length, data };
  }

  @Post('menu')
  async addFoodItem(@CurrentUser() user: any, @Body() body: CreateFoodItemDto) {
    this.requireRole(user, ['canteen', 'admin', 'super_admin']);
    const item = await this.canteenService.addFoodItem(body);
    return { success: true, message: `Added ${item.name} to the canteen menu.`, data: item };
  }

  @Patch('menu/:id/toggle')
  async toggleAvailability(@CurrentUser() user: any, @Param('id') id: string) {
    this.requireRole(user, ['canteen', 'admin', 'super_admin']);
    const item = await this.canteenService.toggleAvailability(id);
    return { success: true, data: item };
  }

  @Get('orders')
  async getOrders(@CurrentUser() user: any) {
    this.requireRole(user, ['canteen', 'admin', 'super_admin']);
    const data = await this.canteenService.getOrders();
    return { success: true, count: data.length, data };
  }

  @Post('order')
  async placeOrder(@CurrentUser() user: any, @Body() body: PlaceOrderDto) {
    this.requireRole(user, ['student']);
    if (!user.student?.id) throw new ForbiddenException('This account is not linked to a student record.');
    const data = await this.canteenService.placeOrder(user.student.id, body.items);
    return { success: true, message: `Order placed. Token ${data.token} issued.`, data };
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    this.requireRole(user, ['canteen', 'admin', 'super_admin']);
    const data = await this.canteenService.updateOrderStatus(id, body.status);
    return { success: true, message: `Order status updated to ${data.status}.`, data };
  }

  @Post('wallet/topup')
  async topUpWallet(@CurrentUser() user: any, @Body() body: WalletTopUpDto) {
    this.requireRole(user, ['accounts', 'admin', 'super_admin']);
    const data = await this.canteenService.topUpWallet(body.rollNumber.trim(), body.amount, body.reference, { id: user.id, role: user.role });
    return { success: true, data };
  }

  @Get('wallet/transactions')
  async getWalletTransactions(@CurrentUser() user: any, @Query('rollNumber') rollNumber?: string) {
    let studentId: string;
    if (normalizeRole(user.role) === 'student') {
      if (!user.student?.id) throw new ForbiddenException('This account is not linked to a student record.');
      studentId = user.student.id;
    } else {
      this.requireRole(user, ['accounts', 'canteen', 'admin', 'super_admin']);
      if (!rollNumber?.trim()) throw new ForbiddenException('A student roll number is required for staff ledger lookup.');
      const student = await this.canteenService.findStudentIdByRollNumber(rollNumber.trim());
      studentId = student.id;
    }
    const data = await this.canteenService.getWalletTransactions(studentId);
    return { success: true, count: data.length, data };
  }
}
