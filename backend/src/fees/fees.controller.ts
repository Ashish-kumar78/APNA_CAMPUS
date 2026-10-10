import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { normalizeRole } from '../rbac/rbac';

@ApiTags('Fees & Accounts')
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  // 1. Financial Command Center
  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get institutional financial dashboard KPIs and metrics' })
  async getDashboardStats(@Query() query?: any) {
    const data = await this.feesService.getFinancialDashboardStats(query);
    return { success: true, data };
  }

  // 2. Digital Proof Verifications Queue
  @Get('payment-verifications')
  @ApiOperation({ summary: 'Get digital payment proof verification queue' })
  async getPaymentVerifications(
    @Query('status') statusFilter?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.feesService.getPaymentVerifications(statusFilter, search);
    return { success: true, count: data.length, data };
  }

  @Post('payment-proof')
  @ApiOperation({ summary: 'Student submits digital fee payment proof with transaction details' })
  async uploadPaymentProof(@Body() body: any) {
    const data = await this.feesService.uploadPaymentProof(body);
    return { success: true, message: 'Payment proof submitted for Accounts review.', data };
  }

  @Post('payment-verifications/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accounts officer approves payment proof and posts to ledger' })
  async approvePaymentProof(@CurrentUser() user: any, @Param('id') id: string) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Only Accounts or Finance staff can approve payment proofs.');
    }
    const data = await this.feesService.approvePayment(id, user.name || 'Accounts Officer');
    return data;
  }

  @Post('payment-verifications/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accounts officer rejects payment proof with recorded reason' })
  async rejectPaymentProof(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Only Accounts or Finance staff can reject payment proofs.');
    }
    const data = await this.feesService.rejectPayment(id, rejectionReason, user.name || 'Accounts Officer');
    return data;
  }

  // 3. Fee Structures
  @Get('structures')
  @ApiOperation({ summary: 'Get official autonomous fee structures' })
  async getStructures() {
    const data = await this.feesService.getFeeStructures();
    return { success: true, count: data.length, data };
  }

  @Post('structures')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish new fee structure (Accounts & Management only)' })
  async createStructure(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'management' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Accounts or Management can publish fee structures.');
    }
    const data = await this.feesService.createFeeStructure(body);
    return { success: true, message: 'Fee structure published successfully.', data };
  }

  // 4. Payment Transactions Register
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment transactions register' })
  async getTransactions(@CurrentUser() user: any, @Query('search') search?: string) {
    const role = normalizeRole(user.role);
    const authorized = ['accounts', 'super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException(`Access denied. Role ${user.role} cannot inspect financial transactions.`);
    }
    const data = await this.feesService.getTransactions(search);
    return { success: true, count: data.length, data };
  }

  // 5. Counter Payment Collection & Receipts
  @Post('record')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record counter payment and issue receipt (Accounts & Admin only)' })
  async recordPayment(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Accounts department can record fee collections.');
    }
    const txn = await this.feesService.recordPayment(body);
    return {
      success: true,
      message: `Payment of ₹${Number(body.amount).toLocaleString('en-IN')} recorded for Roll ${body.rollNumber}! Receipt generated.`,
      data: txn,
    };
  }

  // 6. Student Fee Ledger & Statement
  @Get('statement')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student fee ledger and dues statement' })
  async getStatement(@CurrentUser() user: any, @Query('rollNumber') rollNumber?: string) {
    const role = normalizeRole(user.role);
    let targetRoll = rollNumber;

    if (role === 'student') {
      const studentRoll = user.student?.rollNumber || user.identifier;
      if (rollNumber && rollNumber.toLowerCase() !== studentRoll.toLowerCase()) {
        throw new ForbiddenException('Access denied. You can only view your own fee statement.');
      }
      targetRoll = studentRoll;
    }

    const data = await this.feesService.getStudentStatement(targetRoll || '2305201001');
    return { success: true, data };
  }

  // 7. Scholarships & Concessions
  @Get('scholarships')
  @ApiOperation({ summary: 'Get available scholarship programs and beneficiaries' })
  async getScholarships() {
    const data = await this.feesService.getScholarships();
    return { success: true, count: data.length, data };
  }

  @Post('scholarships')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sanction scholarship or fee concession' })
  async sanctionScholarship(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'management' && role !== 'super_admin') {
      throw new ForbiddenException('Only Accounts or Management can sanction scholarships.');
    }
    const data = await this.feesService.sanctionScholarship(body);
    return { success: true, message: 'Scholarship sanctioned successfully.', data };
  }

  // 8. Financial Reports & Document Registry
  @Get('reports')
  @ApiOperation({ summary: 'Get financial collection and audit reports' })
  async getFinancialReports(@Query('type') reportType?: string) {
    const data = await this.feesService.getFinancialReportsData(reportType);
    return { success: true, data };
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get student financial documents and fee receipts' })
  async getStudentDocuments(@Query('rollNumber') rollNumber?: string) {
    const data = await this.feesService.getStudentFinancialDocuments(rollNumber);
    return { success: true, count: data.length, data };
  }
}
