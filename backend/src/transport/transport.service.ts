import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import {
  INITIAL_FLEET,
  INITIAL_DRIVERS,
  INITIAL_ROUTES,
  INITIAL_PASSES,
  INITIAL_TRIPS,
  INITIAL_TELEMETRY,
  INITIAL_DEFAULT_PERMISSIONS,
} from './transport.initial-data';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateDriverDto,
  UpdateDriverDto,
  CreateRouteDto,
  UpdateRouteDto,
  AllocatePassDto,
  CreateTripDto,
  CreateMaintenanceDto,
  CreateFuelLogDto,
  CreateFeeRecordDto,
  CreateComplaintDto,
  CreateAccidentDto,
  CreateParkingDto,
  CreateStaffAttendanceDto,
  CreateNotificationDto,
  CreateRequestDto,
  CreateSafetyInspectionDto,
  CreateScheduleDto,
  CreateInventoryDto,
  CreatePolicyDto,
  UpdatePermissionDto,
} from './transport.dto';

@Injectable()
export class TransportService {
  private readonly logger = new Logger(TransportService.name);
  private dataFilePath: string;

  // In-memory fallback caches
  private fleetStore: Map<string, any> = new Map();
  private driversStore: Map<string, any> = new Map();
  private routesStore: Map<string, any> = new Map();
  private passesStore: Map<string, any> = new Map();
  private tripsStore: Map<string, any> = new Map();
  private telemetryStore: Map<string, any> = new Map();
  private boardingStore: Map<string, any> = new Map();
  private maintenanceStore: Map<string, any> = new Map();
  private fuelStore: Map<string, any> = new Map();
  private feeStore: Map<string, any> = new Map();
  private complianceStore: Map<string, any> = new Map();
  private complaintsStore: Map<string, any> = new Map();
  private accidentsStore: Map<string, any> = new Map();
  private parkingStore: Map<string, any> = new Map();
  private staffAttendanceStore: Map<string, any> = new Map();
  private notificationsStore: Map<string, any> = new Map();
  private requestsStore: Map<string, any> = new Map();
  private inspectionsStore: Map<string, any> = new Map();
  private schedulesStore: Map<string, any> = new Map();
  private inventoryStore: Map<string, any> = new Map();
  private policiesStore: Map<string, any> = new Map();
  private permissionsStore: Map<string, any> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.dataFilePath = path.resolve(process.cwd(), 'backend', 'data', 'transport_store.json');
    this.initializeStore();
  }

  private initializeStore() {
    // 1. Seed initial data into memory
    INITIAL_FLEET.forEach((v) => this.fleetStore.set(v.id, { ...v }));
    INITIAL_DRIVERS.forEach((d) => this.driversStore.set(d.id, { ...d }));
    INITIAL_ROUTES.forEach((r) => this.routesStore.set(r.id, { ...r }));
    INITIAL_PASSES.forEach((p) => this.passesStore.set(p.id, { ...p }));
    INITIAL_TRIPS.forEach((t) => this.tripsStore.set(t.id, { ...t }));
    INITIAL_TELEMETRY.forEach((t) => this.telemetryStore.set(t.id, { ...t }));
    INITIAL_DEFAULT_PERMISSIONS.forEach((perm) => {
      const key = `${perm.role}_${perm.section}`;
      this.permissionsStore.set(key, { ...perm, id: key });
    });

    // 2. Load disk file if present
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        const disk = JSON.parse(raw);
        if (disk.fleet) disk.fleet.forEach((item: any) => this.fleetStore.set(item.id, item));
        if (disk.drivers) disk.drivers.forEach((item: any) => this.driversStore.set(item.id, item));
        if (disk.routes) disk.routes.forEach((item: any) => this.routesStore.set(item.id, item));
        if (disk.passes) disk.passes.forEach((item: any) => this.passesStore.set(item.id, item));
        if (disk.trips) disk.trips.forEach((item: any) => this.tripsStore.set(item.id, item));
        if (disk.telemetry) disk.telemetry.forEach((item: any) => this.telemetryStore.set(item.id, item));
        if (disk.boarding) disk.boarding.forEach((item: any) => this.boardingStore.set(item.id, item));
        if (disk.maintenance) disk.maintenance.forEach((item: any) => this.maintenanceStore.set(item.id, item));
        if (disk.fuel) disk.fuel.forEach((item: any) => this.fuelStore.set(item.id, item));
        if (disk.fees) disk.fees.forEach((item: any) => this.feeStore.set(item.id, item));
        if (disk.compliance) disk.compliance.forEach((item: any) => this.complianceStore.set(item.id, item));
        if (disk.complaints) disk.complaints.forEach((item: any) => this.complaintsStore.set(item.id, item));
        if (disk.accidents) disk.accidents.forEach((item: any) => this.accidentsStore.set(item.id, item));
        if (disk.parking) disk.parking.forEach((item: any) => this.parkingStore.set(item.id, item));
        if (disk.staffAttendance) disk.staffAttendance.forEach((item: any) => this.staffAttendanceStore.set(item.id, item));
        if (disk.notifications) disk.notifications.forEach((item: any) => this.notificationsStore.set(item.id, item));
        if (disk.requests) disk.requests.forEach((item: any) => this.requestsStore.set(item.id, item));
        if (disk.inspections) disk.inspections.forEach((item: any) => this.inspectionsStore.set(item.id, item));
        if (disk.schedules) disk.schedules.forEach((item: any) => this.schedulesStore.set(item.id, item));
        if (disk.inventory) disk.inventory.forEach((item: any) => this.inventoryStore.set(item.id, item));
        if (disk.policies) disk.policies.forEach((item: any) => this.policiesStore.set(item.id, item));
        if (disk.permissions) disk.permissions.forEach((item: any) => this.permissionsStore.set(item.id, item));
      } else {
        this.saveToDisk();
      }
    } catch (e: any) {
      this.logger.warn(`Could not load local transport file store: ${e?.message}`);
    }
  }

  private saveToDisk() {
    try {
      const data = {
        fleet: Array.from(this.fleetStore.values()),
        drivers: Array.from(this.driversStore.values()),
        routes: Array.from(this.routesStore.values()),
        passes: Array.from(this.passesStore.values()),
        trips: Array.from(this.tripsStore.values()),
        telemetry: Array.from(this.telemetryStore.values()),
        boarding: Array.from(this.boardingStore.values()),
        maintenance: Array.from(this.maintenanceStore.values()),
        fuel: Array.from(this.fuelStore.values()),
        fees: Array.from(this.feeStore.values()),
        compliance: Array.from(this.complianceStore.values()),
        complaints: Array.from(this.complaintsStore.values()),
        accidents: Array.from(this.accidentsStore.values()),
        parking: Array.from(this.parkingStore.values()),
        staffAttendance: Array.from(this.staffAttendanceStore.values()),
        notifications: Array.from(this.notificationsStore.values()),
        requests: Array.from(this.requestsStore.values()),
        inspections: Array.from(this.inspectionsStore.values()),
        schedules: Array.from(this.schedulesStore.values()),
        inventory: Array.from(this.inventoryStore.values()),
        policies: Array.from(this.policiesStore.values()),
        permissions: Array.from(this.permissionsStore.values()),
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e: any) {
      this.logger.warn(`Could not save transport file store: ${e?.message}`);
    }
  }

  // ==========================================================================
  // PERMISSION CHECKING ENGINE
  // ==========================================================================
  public checkPermission(
    user: any,
    section: string,
    action: 'view' | 'create' | 'edit' | 'update' | 'delete' | 'export' | 'settings',
  ): void {
    const rawRole = (user?.role || '').toLowerCase().replace(/-/g, '_');

    // Super Admin has universal full access
    if (rawRole === 'super_admin' || rawRole === 'superadmin') {
      return;
    }

    // Transport role has full access to operational sections
    if (rawRole === 'transport') {
      if (action === 'settings' && section === 'permissions') {
        throw new ForbiddenException('Only Super Admin can configure role permissions.');
      }
      return;
    }

    // Admin / Admin Office role: check configured permissions
    if (rawRole === 'admin' || rawRole === 'admin_office' || rawRole === 'administrative_office') {
      const key = `admin_office_${section}`;
      const perm = this.permissionsStore.get(key) || {
        canView: true,
        canCreate: false,
        canEdit: false,
        canUpdate: false,
        canDelete: false,
        canExport: true,
        canManageSettings: false,
      };

      if (action === 'view' && !perm.canView) {
        throw new ForbiddenException(`Admin Office is not granted View access to Transport ${section}.`);
      }
      if (action === 'create' && !perm.canCreate) {
        throw new ForbiddenException(`Admin Office is not granted Create permission in Transport ${section}.`);
      }
      if ((action === 'edit' || action === 'update') && !perm.canEdit && !perm.canUpdate) {
        throw new ForbiddenException(`Admin Office is not granted Edit/Update permission in Transport ${section}.`);
      }
      if (action === 'delete' && !perm.canDelete) {
        throw new ForbiddenException(`Admin Office is not granted Delete permission in Transport ${section}.`);
      }
      if (action === 'export' && !perm.canExport) {
        throw new ForbiddenException(`Admin Office is not granted Export permission in Transport ${section}.`);
      }
      if (action === 'settings' && !perm.canManageSettings) {
        throw new ForbiddenException(`Admin Office is not granted Settings permission in Transport ${section}.`);
      }
      return;
    }

    // Any other unauthorized role
    throw new ForbiddenException(`Role "${user?.role}" does not have permission to access Transport ${section}.`);
  }

  // ==========================================================================
  // 1. DASHBOARD OVERVIEW & KPIS
  // ==========================================================================
  async getDashboardStats() {
    const fleet = Array.from(this.fleetStore.values());
    const routes = Array.from(this.routesStore.values());
    const passes = Array.from(this.passesStore.values());
    const drivers = Array.from(this.driversStore.values());
    const trips = Array.from(this.tripsStore.values());
    const telemetry = Array.from(this.telemetryStore.values());
    const maintenance = Array.from(this.maintenanceStore.values());
    const requests = Array.from(this.requestsStore.values());
    const fuel = Array.from(this.fuelStore.values());
    const complaints = Array.from(this.complaintsStore.values());
    const fees = Array.from(this.feeStore.values());

    const totalFleet = fleet.length;
    const operationalVehicles = fleet.filter((v) => (v.status || '').toLowerCase().includes('active') || (v.status || '').toLowerCase().includes('available')).length;
    const underMaintenance = fleet.filter((v) => (v.status || '').toLowerCase().includes('maintenance')).length;
    const totalCapacity = fleet.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0);
    const activePassHolders = passes.filter((p) => p.status === 'Active').length;
    const pendingPasses = passes.filter((p) => p.status === 'Pending').length;
    const pendingRequests = requests.filter((r) => (r.status || '').includes('Pending')).length;
    const inTransitTrips = trips.filter((t) => t.status === 'In Transit').length;
    const liveTelemetryCount = telemetry.filter((t) => t.telemetryStatus === 'Live').length;
    const totalCostFuel = fuel.reduce((acc, curr) => acc + (Number(curr.totalCost) || 0), 0);
    const pendingComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;

    return {
      totalFleet,
      operationalVehicles,
      underMaintenance,
      totalRoutes: routes.length,
      totalDrivers: drivers.length,
      totalCapacity,
      activePassHolders,
      pendingPasses,
      pendingRequests,
      seatUtilization: totalCapacity > 0 ? Math.round((activePassHolders / totalCapacity) * 100) : 88,
      inTransitTrips,
      liveTelemetryCount,
      totalCostFuel,
      pendingComplaints,
      maintenanceCount: maintenance.length,
      totalFeeCollected: fees.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0),
      totalFeeDues: fees.reduce((acc, curr) => acc + (Number(curr.dues) || 0), 0),
    };
  }

  // ==========================================================================
  // 2. FLEET VEHICLES
  // ==========================================================================
  async getFleet() {
    return Array.from(this.fleetStore.values());
  }

  async createVehicle(dto: CreateVehicleDto) {
    const id = `VEH-${Date.now()}`;
    const record = {
      id,
      ...dto,
      capacity: Number(dto.capacity) || 52,
      status: dto.status || 'Active (Available)',
      odometerKm: Number(dto.odometerKm) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.fleetStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportVehicle?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateVehicle(id: string, dto: UpdateVehicleDto) {
    const existing = this.fleetStore.get(id);
    if (!existing) throw new NotFoundException(`Vehicle ${id} not found.`);
    const updated = {
      ...existing,
      ...dto,
      capacity: dto.capacity !== undefined ? Number(dto.capacity) : existing.capacity,
      odometerKm: dto.odometerKm !== undefined ? Number(dto.odometerKm) : existing.odometerKm,
      updatedAt: new Date().toISOString(),
    };
    this.fleetStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportVehicle?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteVehicle(id: string) {
    if (!this.fleetStore.has(id)) throw new NotFoundException(`Vehicle ${id} not found.`);
    this.fleetStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportVehicle?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Vehicle ${id} deleted.` };
  }

  async updateVehicleStatus(id: string, status: string, notes?: string) {
    const existing = this.fleetStore.get(id);
    if (!existing) throw new NotFoundException(`Vehicle ${id} not found.`);
    const updated = {
      ...existing,
      status,
      notes: notes || existing.notes,
      updatedAt: new Date().toISOString(),
    };
    this.fleetStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportVehicle?.update({ where: { id }, data: { status, notes } });
    } catch (e) {}

    return updated;
  }

  // ==========================================================================
  // 3. DRIVERS
  // ==========================================================================
  async getDrivers() {
    return Array.from(this.driversStore.values());
  }

  async createDriver(dto: CreateDriverDto) {
    const id = `DRV-${Date.now()}`;
    const record = {
      id,
      ...dto,
      experienceYears: Number(dto.experienceYears) || 5,
      status: dto.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.driversStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportDriver?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateDriver(id: string, dto: UpdateDriverDto) {
    const existing = this.driversStore.get(id);
    if (!existing) throw new NotFoundException(`Driver ${id} not found.`);
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.driversStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportDriver?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteDriver(id: string) {
    if (!this.driversStore.has(id)) throw new NotFoundException(`Driver ${id} not found.`);
    this.driversStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportDriver?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Driver ${id} deleted.` };
  }

  // ==========================================================================
  // 4. ROUTES & STOPS
  // ==========================================================================
  async getRoutes() {
    return Array.from(this.routesStore.values());
  }

  async createRoute(dto: CreateRouteDto) {
    const id = `RT-${Date.now()}`;
    const stopsList = Array.isArray(dto.stops)
      ? dto.stops
      : typeof dto.stops === 'string'
      ? dto.stops.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const record = {
      id,
      name: dto.name,
      routeName: dto.name,
      routeNumber: dto.routeNumber || `R-${this.routesStore.size + 1}`,
      busNumber: dto.busNumber || 'Unassigned',
      driverName: dto.driverName || 'Unassigned',
      driverContact: dto.driverContact || '--',
      totalCapacity: Number(dto.totalCapacity) || 52,
      allocatedCount: 0,
      departureTime: dto.morningDeparture || '07:15 AM',
      morningDeparture: dto.morningDeparture || '07:15 AM',
      eveningArrival: dto.eveningArrival || '05:30 PM',
      stops: stopsList,
      farePerSemester: Number(dto.farePerSemester) || 15000,
      status: 'Active',
      disruptionNote: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.routesStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportRoute?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateRoute(id: string, dto: UpdateRouteDto) {
    const existing = this.routesStore.get(id);
    if (!existing) throw new NotFoundException(`Route ${id} not found.`);

    const stopsList = dto.stops
      ? Array.isArray(dto.stops)
        ? dto.stops
        : typeof dto.stops === 'string'
        ? dto.stops.split(',').map((s) => s.trim()).filter(Boolean)
        : existing.stops
      : existing.stops;

    const updated = {
      ...existing,
      ...dto,
      name: dto.name || existing.name,
      routeName: dto.name || existing.routeName,
      stops: stopsList,
      farePerSemester: dto.farePerSemester !== undefined ? Number(dto.farePerSemester) : existing.farePerSemester,
      totalCapacity: dto.totalCapacity !== undefined ? Number(dto.totalCapacity) : existing.totalCapacity,
      updatedAt: new Date().toISOString(),
    };
    this.routesStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportRoute?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteRoute(id: string) {
    if (!this.routesStore.has(id)) throw new NotFoundException(`Route ${id} not found.`);
    this.routesStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportRoute?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Route ${id} deleted.` };
  }

  async updateRouteDisruption(id: string, disruptionNote?: string, status?: string) {
    const existing = this.routesStore.get(id);
    if (!existing) throw new NotFoundException(`Route ${id} not found.`);
    const updated = {
      ...existing,
      disruptionNote: disruptionNote || null,
      disruptionNotice: disruptionNote || null,
      status: status || (disruptionNote ? 'Diversion Advisory' : 'Active'),
      updatedAt: new Date().toISOString(),
    };
    this.routesStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportRoute?.update({
        where: { id },
        data: { disruptionNote: updated.disruptionNote, status: updated.status },
      });
    } catch (e) {}

    return updated;
  }

  // ==========================================================================
  // 5. DIGITAL PASSES & STUDENT ALLOCATION
  // ==========================================================================
  async getPasses() {
    return Array.from(this.passesStore.values());
  }

  async allocatePass(dto: AllocatePassDto) {
    const id = `PASS-${Date.now()}`;
    const record = {
      id,
      studentName: dto.studentName,
      regNo: dto.regNo,
      rollNumber: dto.rollNumber || dto.regNo,
      department: dto.department || 'General',
      semester: dto.semester || 'Semester 1',
      routeName: dto.routeName,
      stopName: dto.stopName,
      fareAmount: Number(dto.fareAmount) || 15000,
      feePaid: dto.feePaid !== undefined ? dto.feePaid : true,
      status: dto.autoApprove ? 'Active' : 'Pending',
      validUntil: '2027-06-30',
      qrCode: `APNA-PASS-${dto.regNo}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.passesStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportPass?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async actionPass(id: string, action: string, notes?: string) {
    const existing = this.passesStore.get(id);
    if (!existing) throw new NotFoundException(`Pass ${id} not found.`);

    let newStatus = existing.status;
    const act = (action || '').toLowerCase();
    if (act === 'approve' || act === 'active') newStatus = 'Active';
    else if (act === 'suspend' || act === 'suspended') newStatus = 'Suspended';
    else if (act === 'cancel' || act === 'revoke' || act === 'revoked') newStatus = 'Revoked';
    else if (act === 'expire' || act === 'expired') newStatus = 'Expired';
    else if (act === 'renew') newStatus = 'Active';

    const updated = {
      ...existing,
      status: newStatus,
      reviewNotes: notes || existing.reviewNotes,
      updatedAt: new Date().toISOString(),
    };
    this.passesStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportPass?.update({ where: { id }, data: { status: newStatus } });
    } catch (e) {}

    return updated;
  }

  async deletePass(id: string) {
    if (!this.passesStore.has(id)) throw new NotFoundException(`Pass ${id} not found.`);
    this.passesStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportPass?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Pass ${id} deleted.` };
  }

  // ==========================================================================
  // 6. TRIPS & LIVE TRANSIT
  // ==========================================================================
  async getTrips() {
    return Array.from(this.tripsStore.values());
  }

  async createTrip(dto: CreateTripDto) {
    const id = `TRIP-${Date.now()}`;
    const record = {
      id,
      ...dto,
      passengersCount: Number(dto.passengersCount) || 0,
      status: dto.status || 'Scheduled',
      date: dto.date || new Date().toISOString().split('T')[0],
      delayMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tripsStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportTrip?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async actionTrip(id: string, action: string, payload: any = {}) {
    const existing = this.tripsStore.get(id);
    if (!existing) throw new NotFoundException(`Trip ${id} not found.`);

    let status = existing.status;
    let delayMinutes = existing.delayMinutes;
    let delayReason = existing.delayReason;

    const act = (action || '').toLowerCase();
    if (act === 'start' || act === 'dispatch' || act === 'in transit') status = 'In Transit';
    else if (act === 'complete' || act === 'completed') status = 'Completed';
    else if (act === 'cancel' || act === 'cancelled') status = 'Cancelled';
    else if (act === 'delay' || act === 'delayed') {
      status = 'Delayed';
      delayMinutes = Number(payload.delayMinutes) || 15;
      delayReason = payload.reason || 'Traffic congestion';
    }

    const updated = {
      ...existing,
      status,
      delayMinutes,
      delayReason,
      updatedAt: new Date().toISOString(),
    };
    this.tripsStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportTrip?.update({
        where: { id },
        data: { status, delayMinutes, delayReason },
      });
    } catch (e) {}

    return updated;
  }

  // ==========================================================================
  // 7. TELEMETRY & GPS
  // ==========================================================================
  async getTelemetry() {
    return Array.from(this.telemetryStore.values());
  }

  async updateTelemetry(vehicleNumber: string, payload: any) {
    let existing = Array.from(this.telemetryStore.values()).find((t) => t.vehicleNumber === vehicleNumber);
    if (!existing) {
      existing = {
        id: `TEL-${Date.now()}`,
        vehicleNumber,
        fleetCode: payload.fleetCode || 'Bus',
        currentSpeed: 0,
        speedLimit: 60,
        fuelLevelPercent: 80,
        engineTemp: 85,
        latitude: 20.2961,
        longitude: 85.8245,
        locationName: 'Campus Depot',
        telemetryStatus: 'Live',
        lastPingTime: 'Just now',
        ignitionOn: true,
      };
    }
    const updated = {
      ...existing,
      ...payload,
      lastPingTime: 'Just now',
      updatedAt: new Date().toISOString(),
    };
    this.telemetryStore.set(existing.id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportTelemetry?.upsert({
        where: { vehicleNumber },
        update: updated,
        create: updated,
      });
    } catch (e) {}

    return updated;
  }

  // ==========================================================================
  // 8. BOARDING & PASSENGER MANIFEST
  // ==========================================================================
  async getBoarding(date?: string) {
    const list = Array.from(this.boardingStore.values());
    if (date) {
      return list.filter((b) => b.date === date);
    }
    return list;
  }

  async recordBoarding(dto: any) {
    const id = `BRD-${Date.now()}`;
    const record = {
      id,
      ...dto,
      date: dto.date || new Date().toISOString().split('T')[0],
      boardingTime: dto.boardingTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      qrVerified: dto.qrVerified !== undefined ? dto.qrVerified : true,
      boardingStatus: dto.boardingStatus || 'Boarded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.boardingStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportBoarding?.create({ data: record });
    } catch (e) {}

    return record;
  }

  // ==========================================================================
  // 9. VEHICLE MAINTENANCE
  // ==========================================================================
  async getMaintenance() {
    return Array.from(this.maintenanceStore.values());
  }

  async createMaintenance(dto: CreateMaintenanceDto) {
    const id = `MNT-VEH-${Date.now()}`;
    const record = {
      id,
      ...dto,
      cost: Number(dto.cost) || 0,
      odometerKm: Number(dto.odometerKm) || 68000,
      lastServiceDate: new Date().toISOString().split('T')[0],
      status: dto.status || 'Scheduled',
      isOverdue: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.maintenanceStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportMaintenance?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateMaintenance(id: string, dto: any) {
    const existing = this.maintenanceStore.get(id);
    if (!existing) throw new NotFoundException(`Maintenance record ${id} not found.`);
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.maintenanceStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportMaintenance?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteMaintenance(id: string) {
    if (!this.maintenanceStore.has(id)) throw new NotFoundException(`Maintenance record ${id} not found.`);
    this.maintenanceStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportMaintenance?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Maintenance record ${id} deleted.` };
  }

  // ==========================================================================
  // 10. FUEL EXPENSES
  // ==========================================================================
  async getFuelLogs() {
    return Array.from(this.fuelStore.values());
  }

  async createFuelLog(dto: CreateFuelLogDto) {
    const id = `FUL-${Date.now()}`;
    const qty = Number(dto.quantityLitres) || 0;
    const price = Number(dto.pricePerLitre) || 94.8;
    const record = {
      id,
      ...dto,
      quantityLitres: qty,
      pricePerLitre: price,
      totalCost: dto.totalCost !== undefined ? Number(dto.totalCost) : Math.round(qty * price * 100) / 100,
      date: dto.date || new Date().toISOString().split('T')[0],
      status: 'Approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.fuelStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportFuelLog?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateFuelLog(id: string, dto: any) {
    const existing = this.fuelStore.get(id);
    if (!existing) throw new NotFoundException(`Fuel log ${id} not found.`);
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.fuelStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportFuelLog?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteFuelLog(id: string) {
    if (!this.fuelStore.has(id)) throw new NotFoundException(`Fuel log ${id} not found.`);
    this.fuelStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportFuelLog?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Fuel log ${id} deleted.` };
  }

  // ==========================================================================
  // 11. TRANSPORT FEES
  // ==========================================================================
  async getFees() {
    return Array.from(this.feeStore.values());
  }

  async createFeeRecord(dto: CreateFeeRecordDto) {
    const id = `TFEE-${Date.now()}`;
    const fee = Number(dto.feeAmount) || 0;
    const paid = Number(dto.paidAmount) || 0;
    const record = {
      id,
      ...dto,
      feeAmount: fee,
      paidAmount: paid,
      dues: Math.max(0, fee - paid),
      dueDate: dto.dueDate || '2027-01-31',
      status: paid >= fee ? 'Paid & Verified' : paid > 0 ? 'Partial Paid' : 'Pending',
      verified: paid >= fee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.feeStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportFeeRecord?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateFeeRecord(id: string, dto: any) {
    const existing = this.feeStore.get(id);
    if (!existing) throw new NotFoundException(`Fee record ${id} not found.`);
    const fee = dto.feeAmount !== undefined ? Number(dto.feeAmount) : existing.feeAmount;
    const paid = dto.paidAmount !== undefined ? Number(dto.paidAmount) : existing.paidAmount;
    const updated = {
      ...existing,
      ...dto,
      feeAmount: fee,
      paidAmount: paid,
      dues: Math.max(0, fee - paid),
      status: paid >= fee ? 'Paid & Verified' : paid > 0 ? 'Partial Paid' : 'Pending',
      verified: paid >= fee,
      updatedAt: new Date().toISOString(),
    };
    this.feeStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportFeeRecord?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteFeeRecord(id: string) {
    if (!this.feeStore.has(id)) throw new NotFoundException(`Fee record ${id} not found.`);
    this.feeStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportFeeRecord?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Fee record ${id} deleted.` };
  }

  // ==========================================================================
  // 12. COMPLIANCE & PERMITS
  // ==========================================================================
  async getCompliance() {
    return Array.from(this.complianceStore.values());
  }

  async updateCompliance(id: string, dto: any) {
    const existing = this.complianceStore.get(id) || { id, ...dto };
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.complianceStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportCompliance?.upsert({
        where: { busNumber: updated.busNumber },
        update: updated,
        create: updated,
      });
    } catch (e) {}

    return updated;
  }

  // ==========================================================================
  // 13. COMPLAINTS & GRIEVANCES
  // ==========================================================================
  async getComplaints() {
    return Array.from(this.complaintsStore.values());
  }

  async createComplaint(dto: CreateComplaintDto) {
    const id = `TCMP-${Date.now()}`;
    const record = {
      id,
      ...dto,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'In Review',
      assignedStaff: 'Transport Route Supervisor',
      resolutionNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.complaintsStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportComplaint?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateComplaint(id: string, dto: any) {
    const existing = this.complaintsStore.get(id);
    if (!existing) throw new NotFoundException(`Complaint ${id} not found.`);
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.complaintsStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportComplaint?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteComplaint(id: string) {
    if (!this.complaintsStore.has(id)) throw new NotFoundException(`Complaint ${id} not found.`);
    this.complaintsStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportComplaint?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Complaint ${id} deleted.` };
  }

  // ==========================================================================
  // 14. ACCIDENTS & ROAD INCIDENTS
  // ==========================================================================
  async getAccidents() {
    return Array.from(this.accidentsStore.values());
  }

  async createAccident(dto: CreateAccidentDto) {
    const id = `INC-TRN-${Date.now().toString().slice(-4)}`;
    const record = {
      id,
      referenceNo: `BPUT/TRN/2026/INC-${Math.floor(100 + Math.random() * 900)}`,
      ...dto,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      investigationStatus: 'Under Investigation',
      responsibleOfficial: 'Mr. S. K. Behera (Transport Administrator)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.accidentsStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportAccident?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateAccident(id: string, dto: any) {
    const existing = this.accidentsStore.get(id);
    if (!existing) throw new NotFoundException(`Accident record ${id} not found.`);
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.accidentsStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportAccident?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteAccident(id: string) {
    if (!this.accidentsStore.has(id)) throw new NotFoundException(`Accident record ${id} not found.`);
    this.accidentsStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportAccident?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Accident record ${id} deleted.` };
  }

  // ==========================================================================
  // 15. PARKING & BUS BAYS
  // ==========================================================================
  async getParking() {
    return Array.from(this.parkingStore.values());
  }

  async createParking(dto: CreateParkingDto) {
    const id = `PRK-${Date.now()}`;
    const record = {
      id,
      ...dto,
      status: dto.status || 'Available',
      assignedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.parkingStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportParking?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateParking(id: string, dto: any) {
    const existing = this.parkingStore.get(id);
    if (!existing) throw new NotFoundException(`Parking bay ${id} not found.`);
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.parkingStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportParking?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteParking(id: string) {
    if (!this.parkingStore.has(id)) throw new NotFoundException(`Parking bay ${id} not found.`);
    this.parkingStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportParking?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Parking bay ${id} deleted.` };
  }

  // ==========================================================================
  // 16. STAFF ATTENDANCE
  // ==========================================================================
  async getStaffAttendance(date?: string) {
    const list = Array.from(this.staffAttendanceStore.values());
    if (date) {
      return list.filter((a) => a.date === date);
    }
    return list;
  }

  async createStaffAttendance(dto: CreateStaffAttendanceDto) {
    const id = `TSTF-${Date.now()}`;
    const record = {
      id,
      ...dto,
      date: dto.date || new Date().toISOString().split('T')[0],
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      availability: dto.status === 'Present On Duty' ? 'On Route' : 'Leave',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.staffAttendanceStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportStaffAttendance?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateStaffAttendance(id: string, dto: any) {
    const existing = this.staffAttendanceStore.get(id);
    if (!existing) throw new NotFoundException(`Staff attendance ${id} not found.`);
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.staffAttendanceStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportStaffAttendance?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  // ==========================================================================
  // 17. NOTIFICATIONS & ALERTS
  // ==========================================================================
  async getNotifications() {
    return Array.from(this.notificationsStore.values());
  }

  async createNotification(dto: CreateNotificationDto) {
    const id = `NOTIF-TRN-${Date.now()}`;
    const record = {
      id,
      ...dto,
      publishDate: new Date().toISOString().split('T')[0],
      priority: dto.priority || 'General',
      status: 'Published',
      author: dto.author || 'Office of Transport Administrator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.notificationsStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportNotification?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateNotification(id: string, dto: any) {
    const existing = this.notificationsStore.get(id);
    if (!existing) throw new NotFoundException(`Notification ${id} not found.`);
    const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
    this.notificationsStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportNotification?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteNotification(id: string) {
    if (!this.notificationsStore.has(id)) throw new NotFoundException(`Notification ${id} not found.`);
    this.notificationsStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportNotification?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Notification ${id} deleted.` };
  }

  // ==========================================================================
  // 18. STUDENT TRANSPORT REQUESTS
  // ==========================================================================
  async getRequests() {
    return Array.from(this.requestsStore.values());
  }

  async createRequest(dto: CreateRequestDto) {
    const id = `REQ-TRN-${Date.now()}`;
    const record = {
      id,
      ...dto,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending Review',
      reviewNotes: 'Awaiting Transport Desk review.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.requestsStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportRequest?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async decideRequest(id: string, dto: { decision: string; reviewNotes?: string }, reviewerName?: string) {
    return this.actionRequest(id, dto.decision, dto.reviewNotes, reviewerName);
  }

  async actionRequest(id: string, decision: string, reviewNotes?: string, reviewerName?: string) {
    const existing = this.requestsStore.get(id);
    if (!existing) throw new NotFoundException(`Request ${id} not found.`);

    const status = decision === 'Approved' ? 'Approved & Pass Updated' : 'Rejected';
    const updated = {
      ...existing,
      status,
      reviewNotes: reviewNotes || (decision === 'Approved' ? 'Approved by Transport Officer.' : 'Rejected due to vehicle capacity limits.'),
      reviewedBy: reviewerName || 'Transport Administrator',
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.requestsStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportRequest?.update({
        where: { id },
        data: { status, reviewNotes: updated.reviewNotes, reviewedBy: updated.reviewedBy },
      });
    } catch (e) {}

    return updated;
  }

  async deleteRequest(id: string) {
    if (!this.requestsStore.has(id)) throw new NotFoundException(`Request ${id} not found.`);
    this.requestsStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportRequest?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Request ${id} deleted.` };
  }

  // ==========================================================================
  // 19. SAFETY INSPECTIONS
  // ==========================================================================
  async getSafetyInspections() {
    return Array.from(this.inspectionsStore.values());
  }

  async createSafetyInspection(dto: CreateSafetyInspectionDto) {
    const id = `INSP-SAF-${Date.now()}`;
    const record = {
      id,
      ...dto,
      inspectionDate: new Date().toISOString().split('T')[0],
      score: dto.score || '96%',
      status: dto.status || 'Compliant & Certified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.inspectionsStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportSafetyInspection?.create({ data: record });
    } catch (e) {}

    return record;
  }

  // ==========================================================================
  // 20. SCHEDULE CALENDAR
  // ==========================================================================
  async getSchedules() {
    return Array.from(this.schedulesStore.values());
  }

  async createSchedule(dto: CreateScheduleDto) {
    const id = `SCH-${Date.now()}`;
    const record = {
      id,
      ...dto,
      busesDeployed: Number(dto.busesDeployed) || 1,
      studentsTransported: Number(dto.studentsTransported) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.schedulesStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportSchedule?.create({ data: record });
    } catch (e) {}

    return record;
  }

  // ==========================================================================
  // 21. INVENTORY & SPARE PARTS
  // ==========================================================================
  async getInventory() {
    return Array.from(this.inventoryStore.values());
  }

  async createInventory(dto: CreateInventoryDto) {
    const id = `SPR-${Date.now()}`;
    const inStock = Number(dto.inStock) || 0;
    const minStock = Number(dto.minStock) || 2;
    const record = {
      id,
      ...dto,
      inStock,
      minStock,
      unitCost: Number(dto.unitCost) || 0,
      alertLowStock: inStock <= minStock,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.inventoryStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportInventory?.create({ data: record });
    } catch (e) {}

    return record;
  }

  async updateInventory(id: string, dto: any) {
    const existing = this.inventoryStore.get(id);
    if (!existing) throw new NotFoundException(`Inventory item ${id} not found.`);
    const inStock = dto.inStock !== undefined ? Number(dto.inStock) : existing.inStock;
    const minStock = dto.minStock !== undefined ? Number(dto.minStock) : existing.minStock;
    const updated = {
      ...existing,
      ...dto,
      inStock,
      minStock,
      alertLowStock: inStock <= minStock,
      updatedAt: new Date().toISOString(),
    };
    this.inventoryStore.set(id, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportInventory?.update({ where: { id }, data: updated });
    } catch (e) {}

    return updated;
  }

  async deleteInventory(id: string) {
    if (!this.inventoryStore.has(id)) throw new NotFoundException(`Inventory item ${id} not found.`);
    this.inventoryStore.delete(id);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportInventory?.delete({ where: { id } });
    } catch (e) {}

    return { success: true, message: `Inventory item ${id} deleted.` };
  }

  // ==========================================================================
  // 22. POLICIES & GUIDELINES
  // ==========================================================================
  async getPolicies() {
    return Array.from(this.policiesStore.values());
  }

  async createPolicy(dto: CreatePolicyDto) {
    const id = `POL-${Date.now()}`;
    const record = {
      id,
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.policiesStore.set(id, record);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportPolicy?.create({ data: record });
    } catch (e) {}

    return record;
  }

  // ==========================================================================
  // 23. ROLE PERMISSIONS MANAGEMENT (SUPER ADMIN CONTROL)
  // ==========================================================================
  async getPermissions(role?: string) {
    const all = Array.from(this.permissionsStore.values());
    if (role) {
      return all.filter((p) => p.role === role);
    }
    return all;
  }

  async updatePermission(dto: UpdatePermissionDto, updatedBy?: string) {
    const key = `${dto.role}_${dto.section}`;
    const existing = this.permissionsStore.get(key) || {
      id: key,
      role: dto.role,
      section: dto.section,
      canView: true,
      canCreate: false,
      canEdit: false,
      canUpdate: false,
      canDelete: false,
      canExport: true,
      canManageSettings: false,
    };

    const updated = {
      ...existing,
      ...dto,
      updatedBy: updatedBy || 'SUPER_ADMIN',
      updatedAt: new Date().toISOString(),
    };
    this.permissionsStore.set(key, updated);
    this.saveToDisk();

    try {
      await (this.prisma as any).transportPermission?.upsert({
        where: { role_section: { role: dto.role, section: dto.section } },
        update: updated,
        create: updated,
      });
    } catch (e) {}

    return updated;
  }
}
