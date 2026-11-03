const assert = require('assert');

console.log('=== STARTING BACKEND TRANSPORT SERVICE & CONTROLLER AUDIT ===');

async function runBackendAudit() {
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

  // Import compiled service
  const { TransportService } = require('./dist/transport/transport.service');
  const { TransportController } = require('./dist/transport/transport.controller');

  // Mock PrismaService
  const mockPrisma = {
    transportVehicle: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-1', ...data }), update: async ({ data }) => data, delete: async () => ({}) },
    transportDriver: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-2', ...data }), update: async ({ data }) => data, delete: async () => ({}) },
    transportRoute: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-3', ...data }), update: async ({ data }) => data, delete: async () => ({}) },
    transportPass: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-4', ...data }), update: async ({ data }) => data, delete: async () => ({}) },
    transportTrip: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-5', ...data }), update: async ({ data }) => data, delete: async () => ({}) },
    transportMaintenance: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-6', ...data }) },
    transportFuelLog: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-7', ...data }) },
    transportFeeRecord: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-8', ...data }) },
    transportComplaint: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-9', ...data }) },
    transportAccident: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-10', ...data }) },
    transportParking: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-11', ...data }) },
    transportStaffAttendance: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-12', ...data }) },
    transportRequest: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-13', ...data }) },
    transportInventory: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-14', ...data }) },
    transportPolicy: { findMany: async () => [], create: async ({ data }) => ({ id: 'mock-15', ...data }) },
    transportPermission: { findMany: async () => [], upsert: async () => ({}) },
    $transaction: async (fn) => (typeof fn === 'function' ? fn(mockPrisma) : Promise.all(fn)),
  };

  const service = new TransportService(mockPrisma);
  const controller = new TransportController(service);

  // 1. Dashboard Stats
  await testAsync('Backend: getDashboardStats calculates live KPIs', async () => {
    const stats = await service.getDashboardStats();
    assert(stats.totalFleet >= 4, 'totalFleet >= 4');
    assert(stats.totalRoutes >= 4, 'totalRoutes >= 4');
    assert(stats.totalDrivers >= 4, 'totalDrivers >= 4');
    assert(stats.activePassHolders >= 3, 'activePassHolders >= 3');
    assert(stats.operationalVehicles >= 3, 'operationalVehicles >= 3');
  });

  // 2. Permission Engine
  test('Backend: checkPermission enforces RBAC for Super Admin, Transport, Admin Office', () => {
    const superAdmin = { role: 'SUPER_ADMIN' };
    const transportUser = { role: 'TRANSPORT' };
    const adminOffice = { role: 'ADMIN_OFFICE' };
    const studentUser = { role: 'STUDENT' };

    // Super Admin: always allowed
    assert.doesNotThrow(() => service.checkPermission(superAdmin, 'fleet', 'view'));
    assert.doesNotThrow(() => service.checkPermission(superAdmin, 'fleet', 'delete'));
    assert.doesNotThrow(() => service.checkPermission(superAdmin, 'permissions', 'settings'));

    // Transport Officer: allowed operational, blocked from permissions config
    assert.doesNotThrow(() => service.checkPermission(transportUser, 'fleet', 'create'));
    assert.doesNotThrow(() => service.checkPermission(transportUser, 'routes', 'edit'));
    assert.throws(() => service.checkPermission(transportUser, 'permissions', 'settings'), /Only Super Admin can configure role permissions/);

    // Admin Office: allowed view, blocked from delete on fleet by default
    assert.doesNotThrow(() => service.checkPermission(adminOffice, 'fleet', 'view'));
    assert.throws(() => service.checkPermission(adminOffice, 'fleet', 'delete'), /not granted/);

    // Student: blocked completely
    assert.throws(() => service.checkPermission(studentUser, 'fleet', 'view'), /Forbidden/);
  });

  // 3. Fleet Operations
  await testAsync('Backend: Fleet CRUD & Status Updates', async () => {
    const newBus = await service.createVehicle({
      busNumber: 'OD-02-UNIT-7777',
      fleetCode: 'Bus 77',
      type: '52-Seater Coach',
      capacity: 52,
      driver: 'Mahesh Dash',
      routeName: 'Route 1 - Badambadi',
    });
    assert.strictEqual(newBus.busNumber, 'OD-02-UNIT-7777');

    const fleet = await service.getFleet();
    assert(fleet.some(v => v.busNumber === 'OD-02-UNIT-7777'), 'New bus is in fleet');

    const updated = await service.updateVehicleStatus(newBus.id, 'Under Maintenance', 'Engine oil leak detected');
    assert.strictEqual(updated.status, 'Under Maintenance');

    await service.deleteVehicle(newBus.id);
    const fleetAfter = await service.getFleet();
    assert(!fleetAfter.some(v => v.id === newBus.id), 'Bus was deleted');
  });

  // 4. Drivers Operations
  await testAsync('Backend: Driver Enrollment & Update', async () => {
    const driver = await service.createDriver({
      name: 'Biren Pradhan',
      phone: '+91 94379 88888',
      licenseNumber: 'OD-02-2019-999999',
      licenseCategory: 'HMV (Heavy Passenger Vehicle)',
    });
    assert.strictEqual(driver.name, 'Biren Pradhan');

    const updated = await service.updateDriver(driver.id, { shift: 'Evening Run (02:00 PM - 10:00 PM)' });
    assert.strictEqual(updated.shift, 'Evening Run (02:00 PM - 10:00 PM)');

    await service.deleteDriver(driver.id);
  });

  // 5. Routes & Diversions
  await testAsync('Backend: Route Management & Disruption Notices', async () => {
    const route = await service.createRoute({
      routeNumber: 'R-77',
      name: 'Route 77 - Airport Link Express',
      busNumber: 'OD-02-AK-4411',
      farePerSemester: 15500,
    });
    assert.strictEqual(route.routeNumber, 'R-77');

    const disrupted = await service.updateRouteDisruption(route.id, 'Road construction diversion via Airport bypass');
    assert.strictEqual(disrupted.status, 'Diversion Advisory');
    assert(disrupted.disruptionNotice.includes('Airport bypass'));

    await service.deleteRoute(route.id);
  });

  // 6. Passes Operations
  await testAsync('Backend: Pass Allocation, Action & Revocation', async () => {
    const pass = await service.allocatePass({
      studentName: 'Chinmayee Sethi',
      regNo: '2301297777',
      routeName: 'Route 1 - Badambadi',
      feePaid: true,
      autoApprove: true,
    });
    assert.strictEqual(pass.status, 'Active');

    const actioned = await service.actionPass(pass.id, 'suspend', 'Pending semester dues');
    assert.strictEqual(actioned.status, 'Suspended');

    await service.deletePass(pass.id);
  });

  // 7. Trips & Telemetry
  await testAsync('Backend: Trips Dispatch & Telemetry Update', async () => {
    const trip = await service.createTrip({
      tripCode: 'TRP-R1-EVE',
      routeNumber: 'R-01',
      routeName: 'Route 1 - Badambadi',
      busNumber: 'OD-02-AK-4411',
      driverName: 'Rajesh Mohanty',
      scheduledDeparture: '05:30 PM',
      scheduledArrival: '07:00 PM',
    });
    assert.strictEqual(trip.status, 'Scheduled');

    const actioned = await service.actionTrip(trip.id, 'dispatch', {});
    assert.strictEqual(actioned.status, 'In Transit');

    const tele = await service.updateTelemetry('OD-02-AK-4411', { speedKmph: 52, currentLocation: 'Rasulgarh Square' });
    assert.strictEqual(tele.speedKmph, 52);
    assert.strictEqual(tele.currentLocation, 'Rasulgarh Square');
  });

  // 8. Boarding Attendance
  await testAsync('Backend: Boarding Verification', async () => {
    const brd = await service.recordBoarding({
      studentName: 'Subhasish Dash',
      rollNumber: '2201297777',
      routeName: 'Route 1 - Badambadi',
      vehicleNumber: 'OD-02-AK-4411',
      stopName: 'Link Road',
      boardingStatus: 'Boarded',
      qrVerified: true,
    });
    assert.strictEqual(brd.boardingStatus, 'Boarded');
    const all = await service.getBoarding();
    assert(all.some(b => b.id === brd.id));
  });

  // 9. Maintenance & Fuel
  await testAsync('Backend: Maintenance & Fuel Logs', async () => {
    const mnt = await service.createMaintenance({
      busNumber: 'OD-02-AK-4411',
      fleetCode: 'Bus 01',
      category: 'Periodic 10,000 KM Engine Overhaul',
      cost: 9500,
    });
    assert.strictEqual(mnt.status, 'Scheduled');
    await service.deleteMaintenance(mnt.id);

    const fuel = await service.createFuelLog({
      busNumber: 'OD-02-AK-4411',
      fleetCode: 'Bus 01',
      quantityLitres: 60,
      pricePerLitre: 94.80,
      totalCost: 5688,
      bunkName: 'Indian Oil Depot',
      receiptNo: 'IOC-11223',
    });
    assert.strictEqual(fuel.totalCost, 5688);
    await service.deleteFuelLog(fuel.id);
  });

  // 10. Fees, Compliance & Complaints
  await testAsync('Backend: Fees, Compliance & Complaints', async () => {
    const fee = await service.createFeeRecord({
      studentName: 'Priya Nayak',
      rollNumber: '2301297666',
      routeName: 'Route 2 - Patia',
      feeAmount: 15000,
      paidAmount: 15000,
      dues: 0,
      status: 'Paid & Verified',
    });
    assert.strictEqual(fee.status, 'Paid & Verified');
    await service.deleteFeeRecord(fee.id);

    const comp = await service.createComplaint({
      studentName: 'Rajesh Swain',
      rollNumber: '2201297555',
      busNumber: 'OD-02-AK-4411',
      title: 'Bus departed 5 minutes early from Hanspal',
      category: 'Punctuality',
      priority: 'High',
    });
    assert.strictEqual(comp.status, 'In Review');
    await service.deleteComplaint(comp.id);
  });

  // 11. Accidents, Parking & Staff Attendance
  await testAsync('Backend: Accidents, Parking & Attendance', async () => {
    const acc = await service.createAccident({
      referenceNo: 'BPUT/TRN/2026/INC-TEST',
      busNumber: 'OD-02-AK-4411',
      routeName: 'Route 1',
      driverName: 'Rajesh Mohanty',
      category: 'Minor Puncture',
      severity: 'Low',
    });
    assert.strictEqual(acc.severity, 'Low');
    await service.deleteAccident(acc.id);

    const park = await service.createParking({
      bayNumber: 'BAY-99',
      bayType: 'Parking Slot',
      busNumber: 'OD-02-AK-4411',
      assignedDriver: 'Rajesh Mohanty',
      status: 'Occupied',
    });
    assert.strictEqual(park.bayNumber, 'BAY-99');
    await service.deleteParking(park.id);

    const att = await service.createStaffAttendance({
      name: 'Ramesh Behera',
      role: 'Head Mechanic',
      status: 'Present On Duty',
    });
    assert.strictEqual(att.status, 'Present On Duty');
  });

  // 12. Notifications, Requests & Safety Inspections
  await testAsync('Backend: Notifications, Requests & Safety', async () => {
    const notif = await service.createNotification({
      title: 'Semester Transit Pass Renewal Notice',
      targetGroup: 'All Commuters',
      category: 'Pass Alert',
      priority: 'Important',
      content: 'Renew bus passes by 15th December to prevent transit interruption.',
    });
    assert.strictEqual(notif.priority, 'Important');
    await service.deleteNotification(notif.id);

    const req = await service.createRequest({
      studentName: 'Suman Mohapatra',
      rollNumber: '2301297444',
      type: 'Route Alteration',
      currentRoute: 'Route 1',
      requestedRoute: 'Route 2',
      reason: 'Shifted PG accommodation',
    });
    assert.strictEqual(req.status, 'Pending Review');
    const decided = await service.decideRequest(req.id, { decision: 'Approved', reviewNotes: 'Accommodated on Route 2' });
    assert(decided.status.includes('Approved'));
    await service.deleteRequest(req.id);

    const insp = await service.createSafetyInspection({
      busNumber: 'OD-02-AK-4411',
      inspector: 'Transport Safety Officer',
      score: '99%',
      status: 'Compliant & Certified',
    });
    assert.strictEqual(insp.score, '99%');
  });

  // 13. Schedules, Inventory & Policies
  await testAsync('Backend: Schedules, Inventory & Policies', async () => {
    const sched = await service.createSchedule({
      title: 'Convocation Ceremony Special Shuttle',
      category: 'Special Event Transit',
      time: '08:00 AM - 04:00 PM',
      routesActive: 'Campus Convocation Route',
      busesDeployed: 4,
    });
    assert.strictEqual(sched.busesDeployed, 4);

    const inv = await service.createInventory({
      partNumber: 'AIR-FILT-09',
      name: 'Diesel Air Filter Cartridge',
      category: 'Filtration System',
      inStock: 8,
      minStock: 2,
      unitCost: 650,
      supplier: 'Bosch Automotive',
    });
    assert.strictEqual(inv.inStock, 8);
    await service.deleteInventory(inv.id);

    const policy = await service.createPolicy({
      category: 'General Speed & Safety Regulations',
      title: 'Speed Lock 60km/h',
      description: 'Statutory ceiling',
    });
    assert.strictEqual(policy.title, 'Speed Lock 60km/h');
  });

  // 14. Dynamic Permissions Update
  await testAsync('Backend: Permission Matrix Configuration for Admin Office', async () => {
    const updatedPerm = await service.updatePermission({
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
    assert.strictEqual(updatedPerm.canDelete, true);

    // Verify Admin Office now has delete permission on fleet
    const adminOffice = { role: 'ADMIN_OFFICE' };
    assert.doesNotThrow(() => service.checkPermission(adminOffice, 'fleet', 'delete'), 'Delete should now be permitted');

    // Revert back
    await service.updatePermission({
      role: 'admin_office',
      section: 'fleet',
      canView: true,
      canCreate: true,
      canEdit: true,
      canUpdate: true,
      canDelete: false,
      canExport: true,
      canManageSettings: false,
    });
    assert.throws(() => service.checkPermission(adminOffice, 'fleet', 'delete'), /not granted/);
  });

  console.log(`\n========================================`);
  console.log(`BACKEND AUDIT RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runBackendAudit();
