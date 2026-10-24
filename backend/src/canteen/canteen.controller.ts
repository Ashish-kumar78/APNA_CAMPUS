import { Controller, Get, Post, Patch, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CanteenService } from './canteen.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Smart Canteen & Mess')
@Controller('canteen')
export class CanteenController {
  constructor(private readonly canteenService: CanteenService) {}

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
      message: `${item?.name} marked as ${item?.isAvailable ? 'Available' : 'Out of Stock'}.`,
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
      rollNumber: body.rollNumber || user.student?.rollNumber || user.identifier,
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
    const targetRoll = body.rollNumber || user.student?.rollNumber || user.identifier;
    if (role === 'student' && targetRoll !== (user.student?.rollNumber || user.identifier)) {
      throw new ForbiddenException('Students can only top up their own RFID wallet.');
    }
    const res = await this.canteenService.topUpWallet(targetRoll || '01', body.amount);
    return { success: true, message: `Wallet topped up by ₹${body.amount}!`, data: res };
  }
}
