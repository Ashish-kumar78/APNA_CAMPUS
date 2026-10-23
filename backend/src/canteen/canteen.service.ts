import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodItemDto, OrderLineDto } from './canteen.dto';

const cents = (value: number) => Math.round(value * 100);

@Injectable()
export class CanteenService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenu() {
    return this.prisma.foodItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  }

  async addFoodItem(data: CreateFoodItemDto) {
    return this.prisma.foodItem.create({
      data: {
        name: data.name.trim(),
        category: data.category.trim(),
        price: Number(data.price),
        prepTime: data.prepTime.trim(),
        calories: data.calories.trim(),
        isAvailable: true,
      },
    });
  }

  async toggleAvailability(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.foodItem.findUnique({ where: { id } });
      if (!item) throw new NotFoundException('Menu item not found.');
      return tx.foodItem.update({ where: { id }, data: { isAvailable: !item.isAvailable } });
    });
  }

  async getOrders() {
    return this.prisma.canteenOrder.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getWalletTransactions(studentId: string) {
    return this.prisma.canteenWalletTransaction.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findStudentIdByRollNumber(rollNumber: string) {
    const student = await this.prisma.student.findUnique({ where: { rollNumber }, select: { id: true } });
    if (!student) throw new NotFoundException('Student not found.');
    return student;
  }

  async placeOrder(studentId: string, lines: OrderLineDto[]) {
    if (!lines.length) throw new BadRequestException('An order must contain at least one item.');
    const quantities = new Map<string, number>();
    for (const line of lines) {
      quantities.set(line.itemId, (quantities.get(line.itemId) || 0) + line.quantity);
    }

    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({ where: { id: studentId } });
      if (!student) throw new NotFoundException('Student account is not linked to this user.');

      const menuItems = await tx.foodItem.findMany({ where: { id: { in: [...quantities.keys()] }, isAvailable: true } });
      if (menuItems.length !== quantities.size) {
        throw new BadRequestException('One or more selected menu items are unavailable. Refresh the menu and try again.');
      }

      const itemById = new Map(menuItems.map((item) => [item.id, item]));
      const orderItems = [...quantities].map(([itemId, quantity]) => {
        const item = itemById.get(itemId)!;
        return { itemId, name: item.name, price: item.price, quantity, lineTotal: cents(item.price * quantity) / 100 };
      });
      const totalAmount = cents(orderItems.reduce((total, item) => total + cents(item.lineTotal), 0)) / 100;
      if (totalAmount <= 0) throw new BadRequestException('Order total must be greater than zero.');

      // Atomic conditional debit prevents concurrent orders from overspending the wallet.
      const debit = await tx.student.updateMany({
        where: { id: student.id, walletBalance: { gte: totalAmount } },
        data: { walletBalance: { decrement: totalAmount } },
      });
      if (debit.count !== 1) throw new BadRequestException('Insufficient canteen wallet balance.');

      const updatedStudent = await tx.student.findUniqueOrThrow({ where: { id: student.id }, select: { walletBalance: true } });
      const token = `CAN-${randomUUID()}`;
      const order = await tx.canteenOrder.create({
        data: {
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          items: orderItems,
          totalAmount,
          status: 'Pending',
          paymentMode: 'RFID Smart Card',
          orderedAt: new Date().toISOString(),
          token,
        },
      });
      await tx.canteenWalletTransaction.create({
        data: {
          studentId: student.id,
          type: 'ORDER_PAYMENT',
          amount: -totalAmount,
          balanceAfter: updatedStudent.walletBalance,
          reference: `order:${order.id}`,
          note: `Canteen order ${order.token}`,
        },
      });
      return { order, token, newBalance: updatedStudent.walletBalance };
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.canteenOrder.findUnique({ where: { id } });
      if (!order) throw new NotFoundException('Canteen order not found.');
      const allowed: Record<string, string[]> = {
        Pending: ['Preparing', 'Cancelled'],
        Preparing: ['Ready', 'Cancelled'],
        Ready: ['Completed'],
        Completed: [],
        Cancelled: [],
      };
      if (!allowed[order.status]?.includes(status)) {
        throw new BadRequestException(`Cannot change an order from ${order.status} to ${status}.`);
      }
      // Compare-and-set protects the state machine from two staff actions racing.
      const changed = await tx.canteenOrder.updateMany({
        where: { id, status: order.status },
        data: { status },
      });
      if (changed.count !== 1) {
        throw new ConflictException('This order was updated by another staff member. Refresh and try again.');
      }

      // Wallet debit and order creation are atomic. A cancellation must reverse
      // that debit once, in the same transaction as the status transition.
      if (status === 'Cancelled') {
        if (!order.studentId) {
          throw new ConflictException('This order has no linked student wallet and cannot be refunded automatically.');
        }
        const refundedStudent = await tx.student.update({
          where: { id: order.studentId },
          data: { walletBalance: { increment: order.totalAmount } },
          select: { walletBalance: true },
        });
        await tx.canteenWalletTransaction.create({
          data: {
            studentId: order.studentId,
            type: 'ORDER_REFUND',
            amount: order.totalAmount,
            balanceAfter: refundedStudent.walletBalance,
            reference: `refund:${order.id}`,
            note: `Refund for cancelled canteen order ${order.id}`,
          },
        });
      }

      return tx.canteenOrder.findUniqueOrThrow({ where: { id } });
    });
  }

  async topUpWallet(
    rollNumber: string,
    amount: number,
    reference: string,
    actor: { id: string; role: string },
  ) {
    const normalizedAmount = cents(amount) / 100;
    const ledgerReference = `topup:${reference.trim()}`;
    return this.prisma.$transaction(async (tx) => {
      const prior = await tx.canteenWalletTransaction.findUnique({ where: { reference: ledgerReference } });
      if (prior) {
        if (prior.type !== 'TOP_UP' || prior.amount !== normalizedAmount) {
          throw new ConflictException('This payment reference was already recorded with different details.');
        }
        const student = await tx.student.findUnique({ where: { id: prior.studentId }, select: { rollNumber: true, walletBalance: true } });
        if (!student || student.rollNumber !== rollNumber) {
          throw new ConflictException('This payment reference belongs to a different student.');
        }
        return { balance: student.walletBalance, transaction: prior, idempotentReplay: true };
      }

      const student = await tx.student.findUnique({ where: { rollNumber }, select: { id: true } });
      if (!student) throw new NotFoundException('Student not found.');
      const updated = await tx.student.update({
        where: { id: student.id },
        data: { walletBalance: { increment: normalizedAmount } },
        select: { walletBalance: true },
      });
      const transaction = await tx.canteenWalletTransaction.create({
        data: {
          studentId: student.id,
          type: 'TOP_UP',
          amount: normalizedAmount,
          balanceAfter: updated.walletBalance,
          reference: ledgerReference,
          actorUserId: actor.id,
          actorRole: actor.role,
          note: 'Manual wallet credit recorded by authorized Accounts staff',
        },
      });
      return { balance: updated.walletBalance, transaction, idempotentReplay: false };
    });
  }
}
