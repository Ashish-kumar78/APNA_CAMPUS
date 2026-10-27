import { PrismaClient } from '@prisma/client';
import { ManagementService } from '../src/management/management.service';

async function runManagementE2ETest() {
  const prisma = new PrismaClient();
  const service = new ManagementService(prisma as any);

  console.log('====================================================');
  console.log('🧪 RUNNING APNA CAMPUS MANAGEMENT MODULE E2E AUDIT');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
    }
  }

  try {
    // TEST 1: Executive Overview KPIs
    console.log('\n--- 1. Testing Executive Overview KPIs ---');
    const overview = await service.getOverview('2026-27');
    assert(overview.success === true, 'getOverview returns success: true');
    assert(overview.data.kpis.totalStudents >= 2480, `Total student enrollment is realistic (${overview.data.kpis.totalStudents})`);
    assert(overview.data.kpis.totalFaculty >= 140, `Total faculty count is realistic (${overview.data.kpis.totalFaculty})`);
    assert(typeof overview.data.kpis.studentFacultyRatio === 'string' && overview.data.kpis.studentFacultyRatio.startsWith('1:'), `SFR is dynamically computed (${overview.data.kpis.studentFacultyRatio})`);
    assert(overview.data.kpis.avgCgpa > 7.0 && overview.data.kpis.avgCgpa < 10.0, `Average CGPA is valid (${overview.data.kpis.avgCgpa})`);
    assert(overview.data.kpis.avgAttendance > 75.0, `Average attendance is valid (${overview.data.kpis.avgAttendance}%)`);

    // TEST 2: Unified Executive Action Center
    console.log('\n--- 2. Testing Unified Executive Action Center ---');
    const actionCenter = await service.getExecutiveActionCenter();
    assert(actionCenter.success === true, 'getExecutiveActionCenter returns success: true');
    assert(actionCenter.data.length >= 5, `Executive Action Center aggregates at least 5 actionable tasks (Found ${actionCenter.data.length})`);
    assert(actionCenter.counts.critical > 0, `Action Center detects critical urgency tasks (${actionCenter.counts.critical})`);
    assert(actionCenter.counts.high > 0, `Action Center detects high priority tasks (${actionCenter.counts.high})`);
    const sampleItem = actionCenter.data[0];
    assert(
      !!sampleItem.id && !!sampleItem.sourceModule && !!sampleItem.title && !!sampleItem.owner && !!sampleItem.dueDate,
      'Action item contains complete metadata (ID, sourceModule, title, owner, dueDate)'
    );

    // TEST 3: Department Comparison & Dossiers
    console.log('\n--- 3. Testing Department Analytics & Dossiers ---');
    const depts = await service.getDepartments('2026-27', 'All Semesters', 'All');
    assert(depts.success === true, 'getDepartments returns success: true');
    assert(depts.data.length === 8, `Exactly 8 autonomous departments returned (Found ${depts.data.length})`);
    const cse = depts.data.find((d: any) => d.code === 'CSE') as any;
    assert(!!cse, 'CSE department is present');
    if (cse) {
      assert(cse.programsOffered && cse.programsOffered.length > 0, 'Department dossier includes programs offered');
      assert(cse.labsCount > 0, `Department dossier includes laboratory count (${cse.labsCount})`);
      assert(cse.topRecruiters && cse.topRecruiters.length > 0, 'Department dossier includes top recruitment partners');
      assert(cse.budgetRemaining === (cse.budgetAllocated - cse.budgetSpent), 'Department budget remaining matches Sanctioned - Spent');
    }

    // TEST 4: Financial Ledger & Balance Reconciliation
    console.log('\n--- 4. Testing Fee & Financial Reconciliation ---');
    const finance = await service.getFinancialOverview('2026-27');
    assert(finance.success === true, 'getFinancialOverview returns success: true');
    const sumDeptDemand = finance.data.departmentRealization.reduce((s: number, d: any) => s + d.demandRaw, 0);
    const sumDeptCollected = finance.data.departmentRealization.reduce((s: number, d: any) => s + d.collectedRaw, 0);
    const sumDeptDue = finance.data.departmentRealization.reduce((s: number, d: any) => s + d.dueRaw, 0);
    assert(sumDeptDemand === finance.data.summary.totalDemandRaw, `Institutional Fee Demand reconciles with Department Demand Sum (₹${sumDeptDemand})`);
    assert(sumDeptCollected === finance.data.summary.totalCollectedRaw, `Institutional Collected reconciles with Department Collected Sum (₹${sumDeptCollected})`);
    assert(sumDeptDue === finance.data.summary.totalDueRaw, `Institutional Dues reconcile with Department Dues Sum (₹${sumDeptDue})`);
    assert(sumDeptDemand === (sumDeptCollected + sumDeptDue), 'Fundamental Accounting Equality: Demand = Collected + Outstanding Balance');

    // TEST 5: Placement & Careers Analytics
    console.log('\n--- 5. Testing Placement Intelligence ---');
    const placements = await service.getPlacementOverview();
    assert(placements.success === true, 'getPlacementOverview returns success: true');
    assert(placements.data.summary.companiesVisited >= 20, `Companies visited count is realistic (${placements.data.summary.companiesVisited})`);
    assert(placements.data.summary.totalOffersMade >= placements.data.summary.placedStudents, `Total Offers Made (${placements.data.summary.totalOffersMade}) >= Unique Placed (${placements.data.summary.placedStudents})`);
    assert(placements.data.drives.length >= 4, `Recruitment drives list populated from DB (Found ${placements.data.drives.length})`);

    // TEST 6: Strategic Approvals Workflow & Audit Logging
    console.log('\n--- 6. Testing Strategic Approvals Workflow ---');
    const approvals = await service.getApprovals();
    assert(approvals.success === true, 'getApprovals returns success: true');
    assert(approvals.data.length >= 3, `Governing Body proposals queue populated (Found ${approvals.data.length})`);
    
    // Test decision mutation
    const targetProposal = approvals.data.find((p: any) => p.status === 'Pending' || p.status === 'Under Review') || approvals.data[0];
    const decisionResult = await service.decideApproval(
      targetProposal.id,
      { action: 'APPROVE', comments: 'Automated E2E Audit Sanction clearance.' },
      { id: 'MGMT-TEST-01', name: 'Board Auditor', role: 'MANAGEMENT', identifier: 'AUDIT-01' }
    );
    assert(decisionResult.success === true, `Strategic proposal decision applied successfully (${targetProposal.id})`);

    // Verify Audit Log created
    const auditLogs = await service.getAuditTrail(targetProposal.id);
    assert(auditLogs.data.length > 0, `Audit log entry created for proposal decision (${targetProposal.id})`);

    // TEST 7: Governance, Regulations & Capital Works
    console.log('\n--- 7. Testing Governance & Capital Projects ---');
    const governance = await service.getGovernanceOverview();
    assert(governance.success === true, 'getGovernanceOverview returns success: true');
    assert(governance.data.accreditations.length >= 4, 'Accreditation compliance matrix tracked');

    const capitalProjects = await service.getCapitalProjects();
    assert(capitalProjects.success === true, 'getCapitalProjects returns success: true');
    assert(capitalProjects.data.length >= 4, `Capital works tracked (Found ${capitalProjects.data.length})`);
    const cap1 = capitalProjects.data[0];
    assert(cap1.balanceRemaining === (cap1.sanctionedBudget - cap1.paidExpenditure), 'Capital project balance remaining = Sanctioned - Paid');

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log('====================================================\n');

  } catch (err: any) {
    console.error('Fatal test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runManagementE2ETest().catch(console.error);
