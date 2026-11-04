import assert from 'assert';
import { transportStore } from '../src/services/transportStore.js';

console.log('--- STARTING COMPREHENSIVE TRANSPORT INTEGRATION TESTS ---');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`✗ FAIL: ${name}:`, e.message);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`✗ FAIL: ${name}:`, e.message);
      failed++;
    }
  }

  // 1. Initial State
  test('TransportStore loads initial state across all 23 domains', () => {
    assert(transportStore.getFleet().length >= 4, 'Fleet should have >= 4 vehicles');
    assert(transportStore.getRoutes().length >= 4, 'Routes should have >= 4 routes');
    assert(transportStore.getDrivers().length >= 4, 'Drivers should have >= 4 drivers');
    assert(transportStore.getPasses().length >= 4, 'Passes should have >= 4 passes');
    assert(transportStore.getTrips().length >= 3, 'Trips should have >= 3 trips');
    assert(transportStore.getTelemetry().length >= 4, 'Telemetry should have >= 4 entries');
    assert(transportStore.getBoarding().length >= 5, 'Boarding should have >= 5 entries');
    assert(transportStore.getMaintenance().length >= 3, 'Maintenance should have >= 3 logs');
    assert(transportStore.getFuelLogs().length >= 3, 'Fuel should have >= 3 logs');
    assert(transportStore.getFees().length >= 3, 'Fees should have >= 3 records');
    assert(transportStore.getCompliance().length >= 3, 'Compliance should have >= 3 records');
    assert(transportStore.getComplaints().length >= 2, 'Complaints should have >= 2 records');
    assert(transportStore.getAccidents().length >= 2, 'Accidents should have >= 2 records');
    assert(transportStore.getParking().length >= 4, 'Parking should have >= 4 records');
    assert(transportStore.getStaffAttendance().length >= 4, 'Staff attendance should have >= 4 records');
    assert(transportStore.getNotifications().length >= 2, 'Notifications should have >= 2 records');
    assert(transportStore.getRequests().length >= 2, 'Requests should have >= 2 records');
    assert(transportStore.getSafetyInspections().length >= 2, 'Safety inspections should have >= 2 records');
    assert(transportStore.getSchedules().length >= 2, 'Schedules should have >= 2 records');
    assert(transportStore.getInventory().length >= 4, 'Inventory should have >= 4 items');
    assert(transportStore.getPolicies().length >= 2, 'Policies should have >= 2 groups');
    assert(transportStore.getPermissions('admin_office').length >= 10, 'Permissions should have >= 10 configured sections');
  });

  // 2. Fleet CRUD
  await testAsync('Fleet: Add, Update, Status Change, Delete Vehicle', async () => {
    const initialCount = transportStore.getFleet().length;
    const newVeh = await transportStore.addVehicle({
      busNumber: 'OD-02-TEST-9999',
      fleetCode: 'Bus 99',
      type: '52-Seater Coach',
      capacity: 52,
      driver: 'Test Pilot',
      routeName: 'Test Route 99',
    });
    assert.strictEqual(transportStore.getFleet().length, initialCount + 1, 'Fleet count increased');
    assert.strictEqual(newVeh.busNumber, 'OD-02-TEST-9999');

    await transportStore.updateVehicle(newVeh.id, { status: 'Under Inspection' });
    const updated = transportStore.getFleet().find(v => v.id === newVeh.id);
    assert.strictEqual(updated.status, 'Under Inspection', 'Vehicle status updated');

    await transportStore.deleteVehicle(newVeh.id);
    assert.strictEqual(transportStore.getFleet().length, initialCount, 'Vehicle deleted');
  });

  // 3. Driver CRUD
  await testAsync('Drivers: Enroll, Update Shift, Delete Driver', async () => {
    const initialCount = transportStore.getDrivers().length;
    const newDrv = await transportStore.addDriver({
      name: 'Ranjan Barik',
      phone: '+91 94379 99999',
      licenseNumber: 'OD-02-2020-TEST123',
      licenseCategory: 'HMV (Heavy Passenger Vehicle)',
    });
    assert.strictEqual(transportStore.getDrivers().length, initialCount + 1);

    await transportStore.updateDriver(newDrv.id, { shift: 'Night Shuttle (08:00 PM - 04:00 AM)' });
    const found = transportStore.getDrivers().find(d => d.id === newDrv.id);
    assert.strictEqual(found.shift, 'Night Shuttle (08:00 PM - 04:00 AM)');

    await transportStore.deleteDriver(newDrv.id);
    assert.strictEqual(transportStore.getDrivers().length, initialCount);
  });

  // 4. Routes CRUD
  await testAsync('Routes: Add Route, Broadcast Disruption, Delete', async () => {
    const initialCount = transportStore.getRoutes().length;
    const newRt = await transportStore.addRoute({
      routeNumber: 'R-99',
      name: 'Route 99 - Metro Link Express',
      farePerSemester: 16000,
      busNumber: 'OD-02-AK-4411',
    });
    assert.strictEqual(transportStore.getRoutes().length, initialCount + 1);

    await transportStore.updateRouteDisruption(newRt.id, 'Road diversion due to metro beam launching');
    const rt = transportStore.getRoutes().find(r => r.id === newRt.id);
    assert.strictEqual(rt.status, 'Disrupted');
    assert(rt.disruptionNotice.includes('metro beam'));

    await transportStore.deleteRoute(newRt.id);
    assert.strictEqual(transportStore.getRoutes().length, initialCount);
  });

  // 5. Passes CRUD
  await testAsync('Passes: Allocate, Action (Suspend/Approve), Delete', async () => {
    const initialCount = transportStore.getPasses().length;
    const pass = await transportStore.allocatePass({
      studentName: 'Amitosh Mishra',
      regNo: '2301297999',
      routeName: 'Route 1 - Cuttack Badambadi Express',
      feePaid: true,
      autoApprove: true,
    });
    assert.strictEqual(transportStore.getPasses().length, initialCount + 1);
    assert.strictEqual(pass.status, 'Active');

    await transportStore.actionPass(pass.id, 'Suspend', 'Disciplinary review');
    const found = transportStore.getPasses().find(p => p.id === pass.id);
    assert.strictEqual(found.status, 'Suspended');

    await transportStore.deletePass(pass.id);
    assert.strictEqual(transportStore.getPasses().length, initialCount);
  });

  // 6. Boarding & Attendance
  await testAsync('Boarding: Record verification and headcounts', async () => {
    const rec = await transportStore.recordBoarding({
      studentName: 'Sourav Mohanty',
      rollNumber: '2201297099',
      routeName: 'Route 1 - Cuttack Badambadi Express',
      vehicleNumber: 'OD-02-AK-4411',
      stopName: 'Link Road Cuttack',
      boardingStatus: 'Boarded',
      qrVerified: true,
    });
    const found = transportStore.getBoarding().find(b => b.id === rec.id);
    assert(found, 'Boarding record exists');
    assert.strictEqual(found.boardingStatus, 'Boarded');
  });

  // 7. Maintenance CRUD
  await testAsync('Maintenance: Schedule Work Order and Complete', async () => {
    const initialCount = transportStore.getMaintenance().length;
    const mnt = await transportStore.addMaintenance({
      busNumber: 'OD-02-AK-4411',
      fleetCode: 'Bus 01',
      category: 'Brake Pad Replacement & Hydraulic Bleed',
      serviceProvider: 'Bhubaneswar Central Garage',
      cost: 4500,
    });
    assert.strictEqual(transportStore.getMaintenance().length, initialCount + 1);

    await transportStore.updateMaintenance(mnt.id, { status: 'Completed', cost: 4200 });
    const found = transportStore.getMaintenance().find(m => m.id === mnt.id);
    assert.strictEqual(found.status, 'Completed');
    assert.strictEqual(found.cost, 4200);

    await transportStore.deleteMaintenance(mnt.id);
    assert.strictEqual(transportStore.getMaintenance().length, initialCount);
  });

  // 8. Fuel Logs CRUD
  await testAsync('Fuel: Log Dispense and Audit Approval', async () => {
    const initialCount = transportStore.getFuelLogs().length;
    const fuel = await transportStore.addFuelLog({
      busNumber: 'OD-02-AK-4412',
      fleetCode: 'Bus 02',
      quantityLitres: 45,
      pricePerLitre: 94.80,
      totalCost: 4266,
      bunkName: 'Indian Oil - Mancheswar',
      receiptNo: 'IOCL-99812',
    });
    assert.strictEqual(transportStore.getFuelLogs().length, initialCount + 1);

    await transportStore.updateFuelLog(fuel.id, { status: 'Approved' });
    const found = transportStore.getFuelLogs().find(f => f.id === fuel.id);
    assert.strictEqual(found.status, 'Approved');

    await transportStore.deleteFuelLog(fuel.id);
    assert.strictEqual(transportStore.getFuelLogs().length, initialCount);
  });

  // 9. Fees & Dues
  await testAsync('Fees: Add Fee, Verify Clearance', async () => {
    const initialCount = transportStore.getFees().length;
    const fee = await transportStore.addFeeRecord({
      studentName: 'Kavita Das',
      rollNumber: '2301297888',
      routeName: 'Route 2 - Khandagiri',
      feeAmount: 15000,
      paidAmount: 15000,
      dues: 0,
      status: 'Paid',
    });
    assert.strictEqual(transportStore.getFees().length, initialCount + 1);

    await transportStore.updateFeeRecord(fee.id, { verified: true, status: 'Paid & Verified' });
    const found = transportStore.getFees().find(f => f.id === fee.id);
    assert.strictEqual(found.status, 'Paid & Verified');

    await transportStore.deleteFeeRecord(fee.id);
    assert.strictEqual(transportStore.getFees().length, initialCount);
  });

  // 10. Complaints & Redressal
  await testAsync('Complaints: Submit, Investigate, Resolve', async () => {
    const comp = await transportStore.addComplaint({
      studentName: 'Debabrata Rout',
      rollNumber: '2201297444',
      busNumber: 'OD-02-AK-4411',
      title: 'AC cooling inadequate on evening run',
      category: 'Comfort & Climate Control',
      priority: 'Medium',
    });
    assert.strictEqual(comp.status, 'Under Review');

    await transportStore.updateComplaint(comp.id, {
      status: 'Resolved',
      resolutionNotes: 'AC compressor gas recharged at garage.',
    });
    const found = transportStore.getComplaints().find(c => c.id === comp.id);
    assert.strictEqual(found.status, 'Resolved');

    await transportStore.deleteComplaint(comp.id);
  });

  // 11. Route Change Requests
  await testAsync('Requests: Submit stop alteration and Officer Decision', async () => {
    const req = await transportStore.addRequest({
      studentName: 'Sasmita Sahoo',
      rollNumber: '2301297333',
      type: 'Stop Alteration',
      currentRoute: 'Route 1 - Badambadi',
      requestedRoute: 'Route 1 - Badambadi',
      reason: 'Shifted residence from Hanspal to Phulnakhara',
    });
    assert.strictEqual(req.status, 'Pending Verification');

    await transportStore.decideRequest(req.id, 'Approved', 'Approved as seating capacity accommodates request.');
    const found = transportStore.getRequests().find(r => r.id === req.id);
    assert(found.status.includes('Approved'));

    await transportStore.deleteRequest(req.id);
  });

  // 12. Inventory Spare Parts
  await testAsync('Inventory: Add part SKU, Issue and Deduct stock', async () => {
    const item = await transportStore.addInventory({
      partNumber: 'BRK-PAD-LEYLAND-09',
      name: 'Heavy Duty Front Brake Pads',
      category: 'Braking System',
      inStock: 12,
      minStock: 4,
      unitCost: 1850,
      supplier: 'Ashok Leyland Spares',
    });
    assert.strictEqual(item.inStock, 12);

    await transportStore.updateInventory(item.id, { inStock: 10, alertLowStock: false });
    const found = transportStore.getInventory().find(i => i.id === item.id);
    assert.strictEqual(found.inStock, 10);

    await transportStore.deleteInventory(item.id);
  });

  // 13. Safety Audits & Schedules
  await testAsync('Safety & Schedules: Add inspection audit and transit schedule', async () => {
    const insp = await transportStore.addSafetyInspection({
      busNumber: 'OD-02-AK-4411',
      inspector: 'S. K. Behera',
      score: '98%',
      status: 'Compliant & Certified',
    });
    assert(transportStore.getSafetyInspections().some(s => s.id === insp.id));

    const sched = await transportStore.addSchedule({
      title: 'Annual Athletic Meet Shuttle',
      category: 'Sports Event Transit',
      time: '08:00 AM - 06:00 PM',
      routesActive: 'Campus Stadium Shuttle',
      busesDeployed: 3,
    });
    assert(transportStore.getSchedules().some(s => s.id === sched.id));
  });

  // 14. RBAC & Action-Level Permission Enforcement
  test('RBAC: Super Admin has universal full access', () => {
    assert.strictEqual(transportStore.canPerform('SUPER_ADMIN', 'fleet', 'view'), true);
    assert.strictEqual(transportStore.canPerform('SUPER_ADMIN', 'fleet', 'create'), true);
    assert.strictEqual(transportStore.canPerform('SUPER_ADMIN', 'fleet', 'edit'), true);
    assert.strictEqual(transportStore.canPerform('SUPER_ADMIN', 'fleet', 'delete'), true);
    assert.strictEqual(transportStore.canPerform('SUPER_ADMIN', 'settings', 'settings'), true);
    assert.strictEqual(transportStore.canPerform('SUPER_ADMIN', 'permissions', 'settings'), true);
  });

  test('RBAC: Transport role has full operational access, but no role permission editing', () => {
    assert.strictEqual(transportStore.canPerform('TRANSPORT', 'fleet', 'view'), true);
    assert.strictEqual(transportStore.canPerform('TRANSPORT', 'fleet', 'create'), true);
    assert.strictEqual(transportStore.canPerform('TRANSPORT', 'fleet', 'delete'), true);
    assert.strictEqual(transportStore.canPerform('TRANSPORT', 'permissions', 'settings'), false, 'Transport cannot configure role permissions');
  });

  await testAsync('RBAC: Admin Office permissions are dynamically configurable by Super Admin', async () => {
    // Check initial configured state
    assert.strictEqual(transportStore.canPerform('ADMIN_OFFICE', 'fleet', 'view'), true);
    assert.strictEqual(transportStore.canPerform('ADMIN_OFFICE', 'fleet', 'delete'), false, 'Initially delete is false for admin office');

    // Super Admin grants delete permission for fleet to Admin Office
    await transportStore.updatePermission({
      role: 'admin_office',
      section: 'fleet',
      canView: true,
      canCreate: true,
      canEdit: true,
      canUpdate: true,
      canDelete: true,
      canExport: true,
      canManageSettings: false,
    });

    assert.strictEqual(transportStore.canPerform('ADMIN_OFFICE', 'fleet', 'delete'), true, 'Delete permission now granted');

    // Super Admin revokes create permission for routes
    await transportStore.updatePermission({
      role: 'admin_office',
      section: 'routes',
      canView: true,
      canCreate: false,
      canEdit: false,
      canUpdate: false,
      canDelete: false,
      canExport: true,
      canManageSettings: false,
    });

    assert.strictEqual(transportStore.canPerform('ADMIN_OFFICE', 'routes', 'create'), false, 'Create routes revoked');
  });

  // 15. Operational Alerts & Daily Summary
  test('Operational Alerts & Daily Operations Summary', () => {
    const alerts = transportStore.getOperationalAlerts();
    assert(Array.isArray(alerts) && alerts.length > 0, 'Alerts should be an array');
    const summary = transportStore.getDailyOperationsSummary();
    assert(summary.totalFleet > 0, 'Summary totalFleet should be > 0');
    assert(summary.operational > 0, 'Operational fleet should be > 0');
    assert(typeof summary.fleetReadinessPct === 'number', 'fleetReadinessPct should be numeric');
    assert(typeof summary.todayFuelCost === 'number', 'todayFuelCost should be numeric');
  });

  // 16. Student Transport Applications Workflow
  await testAsync('Student Transport Applications: Intake and Approval with Pass Provisioning', async () => {
    const initialApps = transportStore.getStudentApplications();
    const newApp = await transportStore.addStudentApplication({
      studentName: 'Priyanka Senapati',
      rollNumber: '2401432299',
      department: 'Computer Science',
      semester: 'Semester 3',
      preferredRoute: 'Route 1 - Cuttack Badambadi Express',
      preferredStop: 'Link Road Cuttack',
      parentContact: '+91 94371 99999',
    });
    assert(newApp.id && newApp.status === 'Pending Review');
    assert.strictEqual(transportStore.getStudentApplications().length, initialApps.length + 1);

    // Approve application -> auto provisions bus pass
    await transportStore.decideStudentApplication(newApp.id, 'Approved', 'Seat allocated on Bus 01');
    const updated = transportStore.getStudentApplications().find(a => a.id === newApp.id);
    assert.strictEqual(updated.status, 'Approved');
    const passes = transportStore.getPasses();
    const hasPass = passes.some(p => p.studentName === 'Priyanka Senapati');
    assert.strictEqual(hasPass, true, 'Bus pass must be provisioned upon application approval');
  });

  // 17. Crew Duty Roster & Licence Verification
  await testAsync('Crew Management: Duty Roster & Driving Licence Verification', async () => {
    const roster = await transportStore.assignDutyRoster({
      driverName: 'Ramesh Ch. Jena',
      conductorName: 'Pravat Swain',
      busNumber: 'OD-02-AK-4411',
      routeName: 'Route 1: Cuttack Badambadi Express',
      shift: 'Morning Academic Shift',
    });
    assert(roster.id && roster.status === 'Active Duty');
    assert(transportStore.getDutyRoster().some(r => r.id === roster.id));

    // Licence Verification
    const lics = transportStore.getLicenseVerifications();
    assert(lics.length > 0);
    const targetLic = lics[0];
    await transportStore.verifyLicenseDocument(targetLic.id, {
      verificationStatus: 'Verified',
      validityExpiry: '2029-12-31',
    });
    const updatedLic = transportStore.getLicenseVerifications().find(l => l.id === targetLic.id);
    assert.strictEqual(updatedLic.verificationStatus, 'Verified');
    assert.strictEqual(updatedLic.validityExpiry, '2029-12-31');
  });

  // 18. Breakdown Repairs, Fee Reconciliation, and Transport Expenses
  await testAsync('Maintenance & Finance: Breakdown Repairs, Fee Reconciliation, and Expenses', async () => {
    // Breakdown
    const repair = await transportStore.addBreakdownRepair({
      busNumber: 'OD-02-CL-1209',
      reportedFault: 'Alternator belt snapped on highway',
      breakdownLocation: 'Palasuni Square NH-16',
      totalExpense: 3500,
    });
    assert(repair.id && repair.status === 'Under Repair');
    await transportStore.resolveBreakdownRepair(repair.id, 'New Gates alternator belt fitted');
    const resolved = transportStore.getBreakdownRepairs().find(b => b.id === repair.id);
    assert.strictEqual(resolved.status, 'Resolved & Returned to Service');

    // Fee Reconciliation
    const recons = transportStore.getFeeReconciliation();
    assert(recons.length > 0);
    const firstRecon = recons[0];
    await transportStore.reconcileFeeRecord(firstRecon.id, { accountsVerifiedPaid: 810000 });
    const updatedRecon = transportStore.getFeeReconciliation().find(r => r.id === firstRecon.id);
    assert.strictEqual(updatedRecon.accountsVerifiedPaid, 810000);

    // Expenses
    const expense = await transportStore.addTransportExpense({
      category: 'Fuel (High Speed Diesel & CNG)',
      amount: 18400,
      vendor: 'IOCL Authorized Dealer Phulnakhara',
    });
    assert(expense.id && expense.amount === 18400);
    assert(transportStore.getTransportExpenses().some(e => e.id === expense.id));
  });

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

