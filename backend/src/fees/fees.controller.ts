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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student financial documents and fee receipts' })
  async getStudentDocuments(@CurrentUser() user: any, @Query('rollNumber') rollNumber?: string) {
    const role = normalizeRole(user.role);
    let targetRoll = rollNumber;
    if (role === 'student') {
      const studentRoll = user.student?.rollNumber || user.identifier;
      if (rollNumber && rollNumber.toLowerCase() !== studentRoll.toLowerCase()) {
        throw new ForbiddenException('Access denied. You can only view your own financial documents.');
      }
      targetRoll = studentRoll;
    }
    const data = await this.feesService.getStudentFinancialDocuments(targetRoll);
    return { success: true, count: data.length, data };
  }

  // =========================================================================
  // 9. CONFIGURATION ENDPOINTS
  // =========================================================================
  @Get('config/:key')
  @ApiOperation({ summary: 'Get finance configuration by key' })
  async getFinanceConfig(@Param('key') key: string) {
    const data = await this.feesService.getFinanceConfig(key);
    return { success: true, data };
  }

  @Post('config/:key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save finance configuration by key (Accounts & Admin only)' })
  async saveFinanceConfig(
    @CurrentUser() user: any,
    @Param('key') key: string,
    @Body() body: any,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin' && role !== 'management') {
      throw new ForbiddenException('Only Accounts or Finance management can update finance settings.');
    }
    const data = await this.feesService.saveFinanceConfig(key, body, user);
    return { success: true, message: `Configuration '${key}' saved successfully.`, data };
  }

  // =========================================================================
  // 10. STUDENT LEDGERS ENDPOINTS
  // =========================================================================
  @Get('ledgers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all student fee ledgers and dues' })
  async getStudentLedgers(@CurrentUser() user: any, @Query('search') search?: string) {
    const role = normalizeRole(user.role);
    const authorized = ['accounts', 'super_admin', 'management', 'principal', 'admin'];
    if (!authorized.includes(role)) {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.feesService.getStudentLedgers(search);
    return { success: true, count: data.length, data };
  }

  @Post('ledgers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update or create student fee ledger' })
  async saveStudentLedger(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Only Accounts staff can update student ledgers.');
    }
    const data = await this.feesService.saveStudentLedger(body, user);
    return { success: true, message: 'Student ledger updated.', data };
  }

  // =========================================================================
  // 11. VENDORS & BILLS ENDPOINTS
  // =========================================================================
  @Get('vendors')
  @ApiOperation({ summary: 'Get vendors directory' })
  async getVendors(@Query('search') search?: string) {
    const data = await this.feesService.getVendors(search);
    return { success: true, count: data.length, data };
  }

  @Post('vendors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save vendor (Accounts & Purchase staff only)' })
  async saveVendor(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.feesService.saveVendor(body, user);
    return { success: true, message: 'Vendor saved successfully.', data };
  }

  @Get('bills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor bills & invoices' })
  async getVendorBills(
    @Query('status') statusFilter?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.feesService.getVendorBills(statusFilter, search);
    return { success: true, count: data.length, data };
  }

  @Post('bills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit vendor bill (Accounts & Procurement only)' })
  async saveVendorBill(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.feesService.saveVendorBill(body, user);
    return { success: true, message: 'Vendor bill submitted for approval.', data };
  }

  @Post('bills/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve vendor bill (Bursar / Management only)' })
  async approveVendorBill(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'management' && role !== 'principal' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Bursar or Management can approve vendor bills.');
    }
    const data = await this.feesService.approveVendorBill(id, user, notes);
    return { success: true, message: 'Vendor bill approved for payment.', data };
  }

  @Post('bills/:id/pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record vendor bill payment and issue voucher' })
  async payVendorBill(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() paymentData: any,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied. Only Accounts staff can execute payments.');
    }
    const data = await this.feesService.payVendorBill(id, paymentData, user);
    return { success: true, message: `Payment of ₹${data.paidAmount} recorded via ${data.paymentMode}. Payment voucher ${data.paymentVoucher} generated.`, data };
  }

  // =========================================================================
  // 12. GENERAL LEDGER & DOUBLE-ENTRY JOURNAL
  // =========================================================================
  @Get('chart-of-accounts')
  @ApiOperation({ summary: 'Get institutional Chart of Accounts (COA)' })
  async getChartOfAccounts() {
    const data = await this.feesService.getChartOfAccounts();
    return { success: true, count: data.length, data };
  }

  @Post('chart-of-accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Chart of Accounts (Accounts only)' })
  async saveChartOfAccounts(@CurrentUser() user: any, @Body() body: any[]) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'super_admin') {
      throw new ForbiddenException('Access denied.');
    }
    const data = await this.feesService.saveChartOfAccounts(body, user);
    return { success: true, message: 'Chart of accounts updated.', data };
  }

  @Get('journal')
  @ApiOperation({ summary: 'Get double-entry general ledger journal entries' })
  async getJournalEntries(@Query('search') search?: string) {
    const data = await this.feesService.getJournalEntries(search);
    return { success: true, count: data.length, data };
  }

  @Post('journal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post balanced double-entry journal entry to GL' })
  async saveJournalEntry(@CurrentUser() user: any, @Body() body: any) {
    const role = normalizeRole(user.role);
    if (role !== 'accounts' && role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Only Accounts division can post journal entries.');
    }
    const data = await this.feesService.saveJournalEntry(body, user);
    return { success: true, message: `Journal entry ${data.id} posted to general ledger.`, data };
  }

  // =========================================================================
  // 13. STATUTORY FINANCIAL AUDIT LOGS
  // =========================================================================
  @Get('audit-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statutory financial audit trail' })
  async getFinancialAuditLogs(@Query('search') search?: string) {
    const data = await this.feesService.getFinancialAuditLogs(search);
    return { success: true, count: data.length, data };
  }

  @Post('audit-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record financial audit log entry' })
  async addFinancialAuditLog(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.feesService.addFinancialAuditLog(body, user);
    return { success: true, data };
  }

  // =========================================================================
  // 14. SUPER ADMIN RESTRICTED DEMO DATA RESET
  // =========================================================================
  @Post('reset-demo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset financial test data (Super Admin ONLY with explicit token)' })
  async resetDemoData(
    @CurrentUser() user: any,
    @Body('confirmToken') confirmToken: string,
  ) {
    const role = normalizeRole(user.role);
    if (role !== 'super_admin') {
      throw new ForbiddenException('Access Denied: Financial sandbox reset is strictly restricted to Super Admin.');
    }
    const data = await this.feesService.resetDemoData(confirmToken, user);
    return data;
  }
}

