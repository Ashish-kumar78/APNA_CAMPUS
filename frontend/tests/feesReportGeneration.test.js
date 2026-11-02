import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

// Fee Report Calculation Engine logic mirroring backend & frontend
export function calculateStudentFeesRecord(idx, student, branch = 'CSE') {
  const baseFee = (branch === 'MBA' || branch === 'MCA') ? 75000 : 65000;
  const studentTotalFee = baseFee;
  let paid = 0;
  let unpaid = 0;
  let feeStatus = 'Fully Paid';
  let lastPaymentDate = '2026-07-28';
  let receiptNumber = `BPUT-FEE-2026-${5000 + idx + 1}`;

  if ((idx + 1) % 7 === 0) {
    paid = 0;
    unpaid = studentTotalFee;
    feeStatus = 'Unpaid / Overdue';
    lastPaymentDate = '—';
    receiptNumber = '—';
  } else if ((idx + 1) % 5 === 0) {
    paid = Math.round(studentTotalFee * 0.45);
    unpaid = studentTotalFee - paid;
    feeStatus = 'Partial Due';
    lastPaymentDate = '2026-08-14';
    receiptNumber = `BPUT-FEE-2026-${8000 + idx + 1}`;
  } else {
    paid = studentTotalFee;
    unpaid = 0;
    feeStatus = 'Fully Paid';
  }

  return {
    slNo: idx + 1,
    studentName: student?.name || `Student ${idx + 1}`,
    registrationNumber: student?.studentId || `23052010${String(idx + 1).padStart(2, '0')}`,
    rollNumber: student?.rollNumber || String(idx + 1).padStart(2, '0'),
    branch,
    semester: student?.semester || 'Semester 5',
    totalFees: studentTotalFee,
    totalFeesFormatted: `₹${studentTotalFee.toLocaleString('en-IN')}`,
    paidAmount: paid,
    paidAmountFormatted: `₹${paid.toLocaleString('en-IN')}`,
    unpaidAmount: unpaid,
    unpaidAmountFormatted: `₹${unpaid.toLocaleString('en-IN')}`,
    feeStatus,
    lastPaymentDate,
    receiptNumber,
  };
}

export function computeFeesReportSummary(records) {
  let totalBilled = 0;
  let totalPaid = 0;
  let totalUnpaid = 0;
  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  records.forEach((r) => {
    totalBilled += r.totalFees;
    totalPaid += r.paidAmount;
    totalUnpaid += r.unpaidAmount;
    if (r.feeStatus === 'Fully Paid') paidCount++;
    else if (r.feeStatus === 'Partial Due') partialCount++;
    else unpaidCount++;
  });

  const collectionRate = totalBilled > 0 ? Number(((totalPaid / totalBilled) * 100).toFixed(1)) : 0;

  return {
    totalStudents: records.length,
    totalBilled,
    totalPaid,
    totalUnpaid,
    totalBilledFormatted: `₹${totalBilled.toLocaleString('en-IN')}`,
    totalPaidFormatted: `₹${totalPaid.toLocaleString('en-IN')}`,
    totalUnpaidFormatted: `₹${totalUnpaid.toLocaleString('en-IN')}`,
    collectionRate: `${collectionRate}%`,
    averageMetric: collectionRate,
    metricLabel: 'Fee Collection Rate (%)',
    recordsRequiringAttention: unpaidCount + partialCount,
    attentionLabel: 'Students with Outstanding Dues',
    paidCount,
    partialCount,
    unpaidCount,
  };
}

describe('Fees Collection & Dues Report Generation Tests', () => {
  it('correctly calculates fee breakdowns for Fully Paid, Partial Due, and Unpaid Defaulters', () => {
    // idx 0 -> (idx + 1) = 1: neither %7 nor %5 -> Fully Paid
    const recordPaid = calculateStudentFeesRecord(0, { name: 'Rakesh Das', rollNumber: '01' });
    expect(recordPaid.totalFees).toBe(65000);
    expect(recordPaid.paidAmount).toBe(65000);
    expect(recordPaid.unpaidAmount).toBe(0);
    expect(recordPaid.feeStatus).toBe('Fully Paid');
    expect(recordPaid.receiptNumber).toMatch(/^BPUT-FEE-2026-\d+/);

    // idx 4 -> (idx + 1) = 5: %5 === 0 -> Partial Due
    const recordPartial = calculateStudentFeesRecord(4, { name: 'Sourav Mohanty', rollNumber: '05' });
    expect(recordPartial.totalFees).toBe(65000);
    expect(recordPartial.paidAmount).toBe(Math.round(65000 * 0.45));
    expect(recordPartial.unpaidAmount).toBe(65000 - recordPartial.paidAmount);
    expect(recordPartial.feeStatus).toBe('Partial Due');
    expect(recordPartial.paidAmount + recordPartial.unpaidAmount).toBe(recordPartial.totalFees);

    // idx 6 -> (idx + 1) = 7: %7 === 0 -> Unpaid / Overdue
    const recordUnpaid = calculateStudentFeesRecord(6, { name: 'Deepak Rout', rollNumber: '07' });
    expect(recordUnpaid.totalFees).toBe(65000);
    expect(recordUnpaid.paidAmount).toBe(0);
    expect(recordUnpaid.unpaidAmount).toBe(65000);
    expect(recordUnpaid.feeStatus).toBe('Unpaid / Overdue');
    expect(recordUnpaid.lastPaymentDate).toBe('—');
    expect(recordUnpaid.receiptNumber).toBe('—');
  });

  it('accurately computes summary KPIs: Total Billed, Total Paid, Outstanding Unpaid, and Recovery Rate', () => {
    const studentCount = 35;
    const records = Array.from({ length: studentCount }, (_, i) =>
      calculateStudentFeesRecord(i, { name: `Student ${i + 1}` })
    );

    const summary = computeFeesReportSummary(records);

    expect(summary.totalStudents).toBe(35);
    expect(summary.totalBilled).toBe(35 * 65000);
    expect(summary.totalPaid + summary.totalUnpaid).toBe(summary.totalBilled);
    expect(summary.paidCount + summary.partialCount + summary.unpaidCount).toBe(35);
    expect(summary.unpaidCount).toBeGreaterThan(0);
    expect(summary.partialCount).toBeGreaterThan(0);
    expect(summary.recordsRequiringAttention).toBe(summary.unpaidCount + summary.partialCount);
    expect(summary.totalBilledFormatted).toContain('₹');
    expect(summary.totalPaidFormatted).toContain('₹');
    expect(summary.totalUnpaidFormatted).toContain('₹');
    expect(parseFloat(summary.collectionRate)).toBeGreaterThan(0);
    expect(parseFloat(summary.collectionRate)).toBeLessThanOrEqual(100);
  });

  it('filters records by Payment Status (all, paid, partial, unpaid)', () => {
    const records = Array.from({ length: 40 }, (_, i) =>
      calculateStudentFeesRecord(i, { name: `Student ${i + 1}` })
    );

    const paidOnly = records.filter((r) => r.feeStatus === 'Fully Paid');
    const partialOnly = records.filter((r) => r.feeStatus === 'Partial Due');
    const unpaidOnly = records.filter((r) => r.feeStatus === 'Unpaid / Overdue');

    expect(paidOnly.length).toBeGreaterThan(0);
    expect(partialOnly.length).toBeGreaterThan(0);
    expect(unpaidOnly.length).toBeGreaterThan(0);

    // Each paid student has 0 unpaid dues
    paidOnly.forEach((r) => {
      expect(r.unpaidAmount).toBe(0);
      expect(r.paidAmount).toBe(r.totalFees);
    });

    // Each unpaid student has 0 paid amount
    unpaidOnly.forEach((r) => {
      expect(r.paidAmount).toBe(0);
      expect(r.unpaidAmount).toBe(r.totalFees);
    });

    // Each partial student has non-zero paid and non-zero unpaid
    partialOnly.forEach((r) => {
      expect(r.paidAmount).toBeGreaterThan(0);
      expect(r.unpaidAmount).toBeGreaterThan(0);
      expect(r.paidAmount + r.unpaidAmount).toBe(r.totalFees);
    });
  });

  it('supports sorting by totalFees, paidAmount, and unpaidAmount', () => {
    const records = Array.from({ length: 20 }, (_, i) =>
      calculateStudentFeesRecord(i, { name: `Student ${i + 1}` })
    );

    // Sort by unpaidAmount descending
    const sortedUnpaidDesc = [...records].sort((a, b) => b.unpaidAmount - a.unpaidAmount);
    expect(sortedUnpaidDesc[0].unpaidAmount).toBeGreaterThanOrEqual(sortedUnpaidDesc[1].unpaidAmount);
    expect(sortedUnpaidDesc[0].feeStatus).toBe('Unpaid / Overdue');

    // Sort by paidAmount descending
    const sortedPaidDesc = [...records].sort((a, b) => b.paidAmount - a.paidAmount);
    expect(sortedPaidDesc[0].paidAmount).toBeGreaterThanOrEqual(sortedPaidDesc[sortedPaidDesc.length - 1].paidAmount);
    expect(sortedPaidDesc[0].feeStatus).toBe('Fully Paid');
  });

  it('confirms ReportGenerationModule includes Fees Collection & Dues in the Report Type selector', () => {
    const rgmContent = fs.readFileSync(
      path.resolve(__dirname, '../src/components/ReportGenerationModule.jsx'),
      'utf8'
    );

    expect(rgmContent).toContain('value="fees"');
    expect(rgmContent).toContain('Fees Collection &');
    expect(rgmContent).toContain('Total Fees Demand');
    expect(rgmContent).toContain('Total Fees Paid / Collected');
    expect(rgmContent).toContain('Outstanding / Unpaid Dues');
    expect(rgmContent).toContain('Fee Collection Rate');
    expect(rgmContent).toContain('filter-fee-status');
  });

  it('confirms all 8 major portals mount ReportGenerationModule for universal role accessibility', () => {
    const portals = [
      '../src/components/AdminPortal.jsx',
      '../src/components/ExamCellPortal.jsx',
      '../src/components/FacultyPortal.jsx',
      '../src/components/HodPortal.jsx',
      '../src/components/HostelPortal.jsx',
      '../src/components/ManagementPortal.jsx',
      '../src/components/PrincipalPortal.jsx',
      '../src/components/SuperAdminPortal.jsx',
    ];

    portals.forEach((portalPath) => {
      const fullPath = path.resolve(__dirname, portalPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content).toContain('ReportGenerationModule');
    });
  });

  it('confirms backend ReportsService and ReportsController expose the fees report endpoint', () => {
    const serviceContent = fs.readFileSync(
      path.resolve(__dirname, '../../backend/src/reports/reports.service.ts'),
      'utf8'
    );
    const controllerContent = fs.readFileSync(
      path.resolve(__dirname, '../../backend/src/reports/reports.controller.ts'),
      'utf8'
    );

    expect(serviceContent).toContain("case 'fees':");
    expect(serviceContent).toContain('buildFeesReport');
    expect(serviceContent).toContain('Student Fees Collection & Dues Status Report');
    expect(controllerContent).toContain("@Get('fees')");
    expect(controllerContent).toContain('getFeesReport');
  });
});

