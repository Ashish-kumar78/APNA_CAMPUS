import { api } from './api.js';
import {
  mockBoardingAttendance,
  mockVehicleMaintenance,
  mockFuelExpenses,
  mockTransportFees,
  mockVehicleCompliance,
  mockTransportComplaints,
  mockAccidentIncidents,
  mockParkingAssignments,
  mockStaffAttendance,
  mockTransportNotifications,
  mockTransportRequests,
  mockSafetyInspections,
  mockScheduleCalendar,
  mockInventorySpareParts,
  mockTransportPolicies,
} from '../components/transport/transportData.js';

const defaultVehicles = [
  {
    id: 'TR-VEH-001',
    busNumber: 'OD-02-AK-4411',
    fleetCode: 'Bus 01',
    type: '52-Seater Coach',
    capacity: 52,
    driver: 'Rajesh Kumar Mohanty',
    driverPhone: '+91 94371 10291',
    routeName: 'Route 1 - Cuttack Badambadi Express',
    routeNumber: 'R-01',
    status: 'Active',
    fitnessExpiry: '2027-04-15',
    insuranceExpiry: '2027-03-30',
    pollutionExpiry: '2026-12-10',
    depot: 'Campus Central Bus Bay',
    fuelType: 'Diesel (BS-VI)',
    currentFuel: '82%',
    speedKmph: 42,
    location: 'Near Rasulgarh Overbridge',
    lastServiceDate: '2026-10-02',
    nextServiceDue: '2027-01-10',
  },
  {
    id: 'TR-VEH-002',
    busNumber: 'OD-02-AK-4412',
    fleetCode: 'Bus 02',
    type: '52-Seater Coach',
    capacity: 52,
    driver: 'Bhabani Sankar Jena',
    driverPhone: '+91 94372 20382',
    routeName: 'Route 2 - Khandagiri & Patia Loop',
    routeNumber: 'R-02',
    status: 'Active',
    fitnessExpiry: '2027-05-20',
    insuranceExpiry: '2027-04-10',
    pollutionExpiry: '2027-01-05',
    depot: 'Campus Central Bus Bay',
    fuelType: 'Diesel (BS-VI)',
    currentFuel: '68%',
    speedKmph: 35,
    location: 'Near Jayadev Vihar',
    lastServiceDate: '2026-09-28',
    nextServiceDue: '2026-12-28',
  },
  {
    id: 'TR-VEH-003',
    busNumber: 'OD-02-AK-4413',
    fleetCode: 'Bus 03',
    type: '42-Seater Standard',
    capacity: 42,
    driver: 'Pradeep Nayak',
    driverPhone: '+91 94373 31493',
    routeName: 'Route 3 - Master Canteen & Kalpana Square',
    routeNumber: 'R-03',
    status: 'Active',
    fitnessExpiry: '2026-11-28',
    insuranceExpiry: '2026-11-30',
    pollutionExpiry: '2026-12-01',
    depot: 'Campus Central Bus Bay',
    fuelType: 'Diesel (BS-VI)',
    currentFuel: '91%',
    speedKmph: 40,
    location: 'Kalpana Square Crossing',
    lastServiceDate: '2026-10-15',
    nextServiceDue: '2027-01-20',
  },
  {
    id: 'TR-VEH-004',
    busNumber: 'OD-02-AK-4414',
    fleetCode: 'Bus 04',
    type: '32-Seater Mini Coach',
    capacity: 32,
    driver: 'Santosh Rout',
    driverPhone: '+91 94374 42504',
    routeName: 'Route 4 - AIIMS Nagar & Khandagiri',
    routeNumber: 'R-04',
    status: 'Maintenance',
    fitnessExpiry: '2027-06-12',
    insuranceExpiry: '2027-05-18',
    pollutionExpiry: '2027-02-14',
    depot: 'Workshop Shed 2',
    fuelType: 'Diesel (BS-VI)',
    currentFuel: '45%',
    speedKmph: 0,
    location: 'Campus Maintenance Bay',
    lastServiceDate: '2026-10-25',
    nextServiceDue: '2026-11-05',
  },
];

const defaultRoutes = [
  {
    id: 'TR-RT-001',
    name: 'Route 1 - Cuttack Badambadi Express',
    routeNumber: 'R-01',
    busNumber: 'OD-02-AK-4411',
    driverName: 'Rajesh Kumar Mohanty',
    morningDeparture: '07:15 AM',
    eveningArrival: '05:30 PM',
    stops: ['Badambadi Bus Stand', 'Link Road Cuttack', 'Phulnakhara', 'Hanspal', 'Rasulgarh Square', 'Campus Gate 1'],
    totalCapacity: 52,
    allocatedPasses: 48,
    farePerSemester: 16500,
    status: 'On Time',
    disruptionNotice: '',
  },
  {
    id: 'TR-RT-002',
    name: 'Route 2 - Khandagiri & Patia Loop',
    routeNumber: 'R-02',
    busNumber: 'OD-02-AK-4412',
    driverName: 'Bhabani Sankar Jena',
    morningDeparture: '07:30 AM',
    eveningArrival: '05:45 PM',
    stops: ['Khandagiri Square', 'Fire Station', 'CRP Square', 'Jayadev Vihar', 'Damana Square', 'KIIT Square', 'Campus Gate 2'],
    totalCapacity: 52,
    allocatedPasses: 50,
    farePerSemester: 15000,
    status: 'On Time',
    disruptionNotice: '',
  },
  {
    id: 'TR-RT-003',
    name: 'Route 3 - Master Canteen & Kalpana Square',
    routeNumber: 'R-03',
    busNumber: 'OD-02-AK-4413',
    driverName: 'Pradeep Nayak',
    morningDeparture: '07:20 AM',
    eveningArrival: '05:35 PM',
    stops: ['Kalpana Square', 'Master Canteen', 'Vani Vihar', 'Acharya Vihar', 'Palasuni', 'Campus Gate 1'],
    totalCapacity: 42,
    allocatedPasses: 41,
    farePerSemester: 14000,
    status: 'Minor Delay (10 min)',
    disruptionNotice: 'Slow moving traffic at Vani Vihar flyover construction',
  },
  {
    id: 'TR-RT-004',
    name: 'Route 4 - AIIMS Nagar & Khandagiri',
    routeNumber: 'R-04',
    busNumber: 'OD-02-AK-4414',
    driverName: 'Santosh Rout',
    morningDeparture: '07:35 AM',
    eveningArrival: '05:50 PM',
    stops: ['AIIMS Square', 'Patrapada', 'Khandagiri Chowk', 'Baramunda Bus Stand', 'Campus Gate 1'],
    totalCapacity: 32,
    allocatedPasses: 30,
    farePerSemester: 13500,
    status: 'Diverted',
    disruptionNotice: 'Road repair at Patrapada service lane - divert via outer ring road',
  },
];

const defaultDrivers = [
  {
    id: 'TR-DRV-001',
    name: 'Rajesh Kumar Mohanty',
    phone: '+91 94371 10291',
    emergencyContact: '+91 98610 55412',
    licenseNumber: 'OD-02-2012-0048192',
    licenseCategory: 'HMV (Heavy Passenger Vehicle)',
    licenseExpiry: '2029-08-24',
    experienceYears: 14,
    assignedBus: 'OD-02-AK-4411 (Bus 01)',
    shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
    status: 'On Duty',
    rating: 4.9,
    tripsCompleted: 428,
  },
  {
    id: 'TR-DRV-002',
    name: 'Bhabani Sankar Jena',
    phone: '+91 94372 20382',
    emergencyContact: '+91 98612 77123',
    licenseNumber: 'OD-02-2015-0091823',
    licenseCategory: 'HMV (Heavy Passenger Vehicle)',
    licenseExpiry: '2028-11-15',
    experienceYears: 11,
    assignedBus: 'OD-02-AK-4412 (Bus 02)',
    shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
    status: 'On Duty',
    rating: 4.8,
    tripsCompleted: 395,
  },
  {
    id: 'TR-DRV-003',
    name: 'Pradeep Nayak',
    phone: '+91 94373 31493',
    emergencyContact: '+91 98613 88234',
    licenseNumber: 'OD-03-2016-0034189',
    licenseCategory: 'HMV (Heavy Passenger Vehicle)',
    licenseExpiry: '2027-04-18',
    experienceYears: 9,
    assignedBus: 'OD-02-AK-4413 (Bus 03)',
    shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
    status: 'On Duty',
    rating: 4.7,
    tripsCompleted: 340,
  },
  {
    id: 'TR-DRV-004',
    name: 'Santosh Rout',
    phone: '+91 94374 42504',
    emergencyContact: '+91 98614 99345',
    licenseNumber: 'OD-02-2018-0062145',
    licenseCategory: 'HMV (Heavy Passenger Vehicle)',
    licenseExpiry: '2028-09-30',
    experienceYears: 8,
    assignedBus: 'OD-02-AK-4414 (Bus 04)',
    shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
    status: 'On Leave',
    rating: 4.6,
    tripsCompleted: 290,
  },
];

const defaultPasses = [
  {
    id: 'PASS-2026-8801',
    passNumber: 'TRP-2026-001',
    studentName: 'Subhasish Tripathy',
    regNo: '2201297045',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    routeName: 'Route 1 - Cuttack Badambadi Express',
    routeNumber: 'R-01',
    pickupStop: 'Badambadi Bus Stand',
    busNumber: 'OD-02-AK-4411',
    validFrom: '2026-07-01',
    validUpto: '2026-12-31',
    status: 'Active',
    feePaid: true,
    fareAmount: 16500,
    qrCodeData: 'CAMPUS-PASS:TRP-2026-001:2201297045:OD-02-AK-4411',
    issuedAt: '2026-07-05',
  },
  {
    id: 'PASS-2026-8802',
    passNumber: 'TRP-2026-002',
    studentName: 'Priyanka Priyadarshini',
    regNo: '2201297112',
    department: 'Electronics & Telecommunication',
    semester: 'Semester 5',
    routeName: 'Route 2 - Khandagiri & Patia Loop',
    routeNumber: 'R-02',
    pickupStop: 'Jayadev Vihar',
    busNumber: 'OD-02-AK-4412',
    validFrom: '2026-07-01',
    validUpto: '2026-12-31',
    status: 'Active',
    feePaid: true,
    fareAmount: 15000,
    qrCodeData: 'CAMPUS-PASS:TRP-2026-002:2201297112:OD-02-AK-4412',
    issuedAt: '2026-07-06',
  },
  {
    id: 'PASS-2026-8803',
    passNumber: 'TRP-2026-003',
    studentName: 'Aman Kumar Verma',
    regNo: '2301297204',
    department: 'Mechanical Engineering',
    semester: 'Semester 3',
    routeName: 'Route 3 - Master Canteen & Kalpana Square',
    routeNumber: 'R-03',
    pickupStop: 'Master Canteen',
    busNumber: 'OD-02-AK-4413',
    validFrom: '2026-07-01',
    validUpto: '2026-12-31',
    status: 'Active',
    feePaid: true,
    fareAmount: 14000,
    qrCodeData: 'CAMPUS-PASS:TRP-2026-003:2301297204:OD-02-AK-4413',
    issuedAt: '2026-07-10',
  },
  {
    id: 'PASS-2026-8804',
    passNumber: 'TRP-2026-004',
    studentName: 'Sneha Mohapatra',
    regNo: '2401297319',
    department: 'Civil Engineering',
    semester: 'Semester 1',
    routeName: 'Route 4 - AIIMS Nagar & Khandagiri',
    routeNumber: 'R-04',
    pickupStop: 'AIIMS Square',
    busNumber: 'OD-02-AK-4414',
    validFrom: '2026-08-01',
    validUpto: '2026-12-31',
    status: 'Pending Verification',
    feePaid: false,
    fareAmount: 13500,
    qrCodeData: 'CAMPUS-PASS:TRP-2026-004:2401297319:OD-02-AK-4414',
    issuedAt: '2026-08-02',
  },
];

const defaultTrips = [
  {
    id: 'TRIP-2026-1049',
    tripCode: 'TRP-R1-M',
    routeNumber: 'R-01',
    routeName: 'Route 1 - Cuttack Badambadi Express',
    busNumber: 'OD-02-AK-4411',
    driverName: 'Rajesh Kumar Mohanty',
    scheduledDeparture: '07:15 AM',
    actualDeparture: '07:16 AM',
    scheduledArrival: '08:45 AM',
    status: 'In Transit',
    currentStage: 'Hanspal Toll Plaza',
    passengersBoarded: 46,
    delayMinutes: 0,
    speedKmph: 44,
  },
  {
    id: 'TRIP-2026-1050',
    tripCode: 'TRP-R2-M',
    routeNumber: 'R-02',
    routeName: 'Route 2 - Khandagiri & Patia Loop',
    busNumber: 'OD-02-AK-4412',
    driverName: 'Bhabani Sankar Jena',
    scheduledDeparture: '07:30 AM',
    actualDeparture: '07:32 AM',
    scheduledArrival: '08:50 AM',
    status: 'In Transit',
    currentStage: 'Jayadev Vihar Overbridge',
    passengersBoarded: 49,
    delayMinutes: 2,
    speedKmph: 36,
  },
  {
    id: 'TRIP-2026-1051',
    tripCode: 'TRP-R3-M',
    routeNumber: 'R-03',
    routeName: 'Route 3 - Master Canteen & Kalpana Square',
    busNumber: 'OD-02-AK-4413',
    driverName: 'Pradeep Nayak',
    scheduledDeparture: '07:20 AM',
    actualDeparture: '07:25 AM',
    scheduledArrival: '08:40 AM',
    status: 'Delayed',
    currentStage: 'Vani Vihar Junction',
    passengersBoarded: 40,
    delayMinutes: 12,
    speedKmph: 18,
  },
];

const defaultTelemetry = [
  {
    busNumber: 'OD-02-AK-4411',
    routeNumber: 'R-01',
    fleetCode: 'Bus 01',
    driverName: 'Rajesh Kumar Mohanty',
    latitude: 20.2961,
    longitude: 85.8245,
    currentLocation: 'Hanspal Toll Plaza, NH-16',
    speedKmph: 44,
    heading: 'North-East',
    telemetryStatus: 'Live',
    fuelLevelPct: 82,
    engineTemperatureC: 84,
    batteryVoltage: 24.2,
    doorStatus: 'Closed',
    lastPingTime: 'Just now',
  },
  {
    busNumber: 'OD-02-AK-4412',
    routeNumber: 'R-02',
    fleetCode: 'Bus 02',
    driverName: 'Bhabani Sankar Jena',
    latitude: 20.3012,
    longitude: 85.8123,
    currentLocation: 'Jayadev Vihar Flyover, Towards Patia',
    speedKmph: 36,
    heading: 'North',
    telemetryStatus: 'Live',
    fuelLevelPct: 68,
    engineTemperatureC: 82,
    batteryVoltage: 24.1,
    doorStatus: 'Closed',
    lastPingTime: '10s ago',
  },
  {
    busNumber: 'OD-02-AK-4413',
    routeNumber: 'R-03',
    fleetCode: 'Bus 03',
    driverName: 'Pradeep Nayak',
    latitude: 20.2845,
    longitude: 85.8398,
    currentLocation: 'Vani Vihar Junction, Slow Moving',
    speedKmph: 18,
    heading: 'North-West',
    telemetryStatus: 'Live',
    fuelLevelPct: 91,
    engineTemperatureC: 88,
    batteryVoltage: 23.9,
    doorStatus: 'Closed',
    lastPingTime: '5s ago',
  },
  {
    busNumber: 'OD-02-AK-4414',
    routeNumber: 'R-04',
    fleetCode: 'Bus 04',
    driverName: 'Santosh Rout',
    latitude: 20.2711,
    longitude: 85.7723,
    currentLocation: 'Campus Workshop Bay 2 (Stationary)',
    speedKmph: 0,
    heading: 'Stationary',
    telemetryStatus: 'Maintenance Mode',
    fuelLevelPct: 45,
    engineTemperatureC: 32,
    batteryVoltage: 24.4,
    doorStatus: 'Open',
    lastPingTime: '2m ago',
  },
];

const defaultPermissions = [
  { role: 'admin_office', section: 'fleet', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'routes', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'passes', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'drivers', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'trips', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'telemetry', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: false, canManageSettings: false },
  { role: 'admin_office', section: 'boarding', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'maintenance', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'fuel', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'fees', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'compliance', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'complaints', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'accidents', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'parking', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'staff-attendance', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'notifications', canView: true, canCreate: true, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'requests', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'safety-inspections', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'schedules', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'inventory', canView: true, canCreate: true, canEdit: true, canUpdate: true, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'policies', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'reports', canView: true, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: true, canManageSettings: false },
  { role: 'admin_office', section: 'permissions', canView: false, canCreate: false, canEdit: false, canUpdate: false, canDelete: false, canExport: false, canManageSettings: false },
];

class TransportStore {
  constructor() {
    this.state = {
      fleet: defaultVehicles,
      routes: defaultRoutes,
      drivers: defaultDrivers,
      passes: defaultPasses,
      trips: defaultTrips,
      telemetry: defaultTelemetry,
      boarding: mockBoardingAttendance,
      maintenance: mockVehicleMaintenance,
      fuel: mockFuelExpenses,
      fees: mockTransportFees,
      compliance: mockVehicleCompliance,
      complaints: mockTransportComplaints,
      accidents: mockAccidentIncidents,
      parking: mockParkingAssignments,
      staffAttendance: mockStaffAttendance,
      notifications: mockTransportNotifications,
      requests: mockTransportRequests,
      safetyInspections: mockSafetyInspections,
      schedules: mockScheduleCalendar,
      inventory: mockInventorySpareParts,
      policies: mockTransportPolicies,
      permissions: defaultPermissions,
    };

    this.isInitialized = false;
    this.listeners = new Set();
    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const saved = window.localStorage.getItem('apna_campus_transport_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('TransportStore localStorage read error:', e);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem('apna_campus_transport_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('TransportStore localStorage write error:', e);
    }
  }

  notify() {
    this.saveToStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('transport-data-changed', { detail: this.state }));
    }
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('TransportStore listener error:', e);
      }
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async syncWithBackend() {
    try {
      const [
        fleetRes,
        routesRes,
        passesRes,
        driversRes,
        tripsRes,
        teleRes,
        boardingRes,
        mntRes,
        fuelRes,
        feesRes,
        compRes,
        complaintsRes,
        accRes,
        parkRes,
        attRes,
        notifRes,
        reqRes,
        safetyRes,
        schedRes,
        invRes,
        polRes,
        permRes,
      ] = await Promise.all([
        api.getTransportFleet().catch(() => null),
        api.getTransportRoutes().catch(() => null),
        api.getTransportPasses().catch(() => null),
        api.getTransportDrivers().catch(() => null),
        api.getTransportTrips().catch(() => null),
        api.getTransportTelemetry().catch(() => null),
        api.getTransportBoarding().catch(() => null),
        api.getTransportMaintenance().catch(() => null),
        api.getTransportFuelLogs().catch(() => null),
        api.getTransportFees().catch(() => null),
        api.getTransportCompliance().catch(() => null),
        api.getTransportComplaints().catch(() => null),
        api.getTransportAccidents().catch(() => null),
        api.getTransportParking().catch(() => null),
        api.getTransportStaffAttendance().catch(() => null),
        api.getTransportNotifications().catch(() => null),
        api.getTransportRequests().catch(() => null),
        api.getTransportSafetyInspections().catch(() => null),
        api.getTransportSchedules().catch(() => null),
        api.getTransportInventory().catch(() => null),
        api.getTransportPolicies().catch(() => null),
        api.getTransportPermissions().catch(() => null),
      ]);

      if (fleetRes?.data && Array.isArray(fleetRes.data)) this.state.fleet = fleetRes.data;
      if (routesRes?.data && Array.isArray(routesRes.data)) this.state.routes = routesRes.data;
      if (passesRes?.data && Array.isArray(passesRes.data)) this.state.passes = passesRes.data;
      if (driversRes?.data && Array.isArray(driversRes.data)) this.state.drivers = driversRes.data;
      if (tripsRes?.data && Array.isArray(tripsRes.data)) this.state.trips = tripsRes.data;
      if (teleRes?.data && Array.isArray(teleRes.data)) this.state.telemetry = teleRes.data;
      if (boardingRes?.data && Array.isArray(boardingRes.data)) this.state.boarding = boardingRes.data;
      if (mntRes?.data && Array.isArray(mntRes.data)) this.state.maintenance = mntRes.data;
      if (fuelRes?.data && Array.isArray(fuelRes.data)) this.state.fuel = fuelRes.data;
      if (feesRes?.data && Array.isArray(feesRes.data)) this.state.fees = feesRes.data;
      if (compRes?.data && Array.isArray(compRes.data)) this.state.compliance = compRes.data;
      if (complaintsRes?.data && Array.isArray(complaintsRes.data)) this.state.complaints = complaintsRes.data;
      if (accRes?.data && Array.isArray(accRes.data)) this.state.accidents = accRes.data;
      if (parkRes?.data && Array.isArray(parkRes.data)) this.state.parking = parkRes.data;
      if (attRes?.data && Array.isArray(attRes.data)) this.state.staffAttendance = attRes.data;
      if (notifRes?.data && Array.isArray(notifRes.data)) this.state.notifications = notifRes.data;
      if (reqRes?.data && Array.isArray(reqRes.data)) this.state.requests = reqRes.data;
      if (safetyRes?.data && Array.isArray(safetyRes.data)) this.state.safetyInspections = safetyRes.data;
      if (schedRes?.data && Array.isArray(schedRes.data)) this.state.schedules = schedRes.data;
      if (invRes?.data && Array.isArray(invRes.data)) this.state.inventory = invRes.data;
      if (polRes?.data && Array.isArray(polRes.data)) this.state.policies = polRes.data;
      if (permRes?.data && Array.isArray(permRes.data)) this.state.permissions = permRes.data;

      this.isInitialized = true;
      this.notify();
      return true;
    } catch (err) {
      console.warn('TransportStore backend sync error:', err);
      return false;
    }
  }

  // Permission Verification Engine
  canPerform(userRole = '', section = '', action = 'view') {
    const rawRole = (userRole || '').toLowerCase().replace(/-/g, '_');
    if (rawRole === 'super_admin' || rawRole === 'superadmin') return true;
    if (rawRole === 'transport') {
      if (action === 'settings' && section === 'permissions') return false;
      return true;
    }
    if (rawRole === 'admin' || rawRole === 'admin_office' || rawRole === 'administrative_office') {
      const perm = this.state.permissions.find(p => p.role === 'admin_office' && p.section === section);
      if (!perm) return action === 'view';
      if (action === 'view') return !!perm.canView;
      if (action === 'create') return !!perm.canCreate;
      if (action === 'edit' || action === 'update') return !!perm.canEdit || !!perm.canUpdate;
      if (action === 'delete') return !!perm.canDelete;
      if (action === 'export') return !!perm.canExport;
      if (action === 'settings') return !!perm.canManageSettings;
      return false;
    }
    return false;
  }

  // --- FLEET ---
  getFleet() { return this.state.fleet; }
  async addVehicle(vehicle) {
    const newRecord = {
      id: vehicle.id || `TR-VEH-${Date.now().toString().slice(-4)}`,
      ...vehicle,
      status: vehicle.status || 'Active',
    };
    this.state.fleet = [newRecord, ...this.state.fleet];
    this.notify();
    try {
      const res = await api.createTransportVehicle(vehicle);
      if (res?.data?.id) {
        newRecord.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addVehicle error:', e);
    }
    return newRecord;
  }
  async updateVehicle(id, updates) {
    this.state.fleet = this.state.fleet.map(v => (v.id === id || v.busNumber === id ? { ...v, ...updates } : v));
    this.notify();
    try {
      await api.updateTransportVehicle(id, updates);
    } catch (e) {
      console.warn('API updateVehicle error:', e);
    }
  }
  async deleteVehicle(id) {
    this.state.fleet = this.state.fleet.filter(v => v.id !== id && v.busNumber !== id);
    this.notify();
    try {
      await api.deleteTransportVehicle(id);
    } catch (e) {
      console.warn('API deleteVehicle error:', e);
    }
  }

  // --- DRIVERS ---
  getDrivers() { return this.state.drivers; }
  async addDriver(driver) {
    const newDriver = {
      id: driver.id || `TR-DRV-${Date.now().toString().slice(-4)}`,
      ...driver,
      rating: driver.rating || 5.0,
      tripsCompleted: driver.tripsCompleted || 0,
      status: driver.status || 'On Duty',
    };
    this.state.drivers = [newDriver, ...this.state.drivers];
    this.notify();
    try {
      const res = await api.createTransportDriver(driver);
      if (res?.data?.id) {
        newDriver.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addDriver error:', e);
    }
    return newDriver;
  }
  async updateDriver(id, updates) {
    this.state.drivers = this.state.drivers.map(d => (d.id === id ? { ...d, ...updates } : d));
    this.notify();
    try {
      await api.updateTransportDriver(id, updates);
    } catch (e) {
      console.warn('API updateDriver error:', e);
    }
  }
  async deleteDriver(id) {
    this.state.drivers = this.state.drivers.filter(d => d.id !== id);
    this.notify();
    try {
      await api.deleteTransportDriver(id);
    } catch (e) {
      console.warn('API deleteDriver error:', e);
    }
  }

  // --- ROUTES ---
  getRoutes() { return this.state.routes; }
  async addRoute(route) {
    const newRoute = {
      id: route.id || `TR-RT-${Date.now().toString().slice(-4)}`,
      status: 'On Time',
      allocatedPasses: 0,
      ...route,
    };
    this.state.routes = [newRoute, ...this.state.routes];
    this.notify();
    try {
      const res = await api.createTransportRoute(route);
      if (res?.data?.id) {
        newRoute.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addRoute error:', e);
    }
    return newRoute;
  }
  async updateRoute(id, updates) {
    this.state.routes = this.state.routes.map(r => (r.id === id ? { ...r, ...updates } : r));
    this.notify();
    try {
      await api.updateTransportRoute(id, updates);
    } catch (e) {
      console.warn('API updateRoute error:', e);
    }
  }
  async updateRouteDisruption(id, disruptionNotice) {
    this.state.routes = this.state.routes.map(r => (r.id === id ? { ...r, disruptionNotice, status: disruptionNotice ? 'Disrupted' : 'On Time' } : r));
    this.notify();
    try {
      await api.updateRouteDisruption(id, disruptionNotice);
    } catch (e) {
      console.warn('API updateRouteDisruption error:', e);
    }
  }
  async deleteRoute(id) {
    this.state.routes = this.state.routes.filter(r => r.id !== id);
    this.notify();
    try {
      await api.deleteTransportRoute(id);
    } catch (e) {
      console.warn('API deleteRoute error:', e);
    }
  }

  // --- PASSES ---
  getPasses() { return this.state.passes; }
  async allocatePass(pass) {
    const newPass = {
      id: pass.id || `PASS-${Date.now().toString().slice(-4)}`,
      passNumber: pass.passNumber || `TRP-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: pass.autoApprove ? 'Active' : 'Pending Verification',
      issuedAt: new Date().toISOString().split('T')[0],
      qrCodeData: `CAMPUS-PASS:${pass.regNo || Date.now()}:${pass.busNumber || 'UNASSIGNED'}`,
      ...pass,
    };
    this.state.passes = [newPass, ...this.state.passes];
    this.notify();
    try {
      const res = await api.allocateTransport(pass);
      if (res?.data?.id) {
        newPass.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API allocatePass error:', e);
    }
    return newPass;
  }
  async actionPass(id, action, notes) {
    this.state.passes = this.state.passes.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: action === 'Approve' ? 'Active' : action === 'Revoke' ? 'Revoked' : action === 'Suspend' ? 'Suspended' : p.status,
          reviewNotes: notes || p.reviewNotes,
        };
      }
      return p;
    });
    this.notify();
    try {
      await api.actionTransportPass(id, action, notes);
    } catch (e) {
      console.warn('API actionPass error:', e);
    }
  }
  async deletePass(id) {
    this.state.passes = this.state.passes.filter(p => p.id !== id);
    this.notify();
    try {
      await api.deleteTransportPass(id);
    } catch (e) {
      console.warn('API deletePass error:', e);
    }
  }

  // --- TRIPS ---
  getTrips() { return this.state.trips; }
  async createTrip(trip) {
    const newTrip = {
      id: trip.id || `TRIP-${Date.now().toString().slice(-4)}`,
      passengersBoarded: 0,
      delayMinutes: 0,
      status: 'Scheduled',
      ...trip,
    };
    this.state.trips = [newTrip, ...this.state.trips];
    this.notify();
    try {
      const res = await api.createTransportTrip(trip);
      if (res?.data?.id) {
        newTrip.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API createTrip error:', e);
    }
    return newTrip;
  }
  async actionTrip(id, action, payload = {}) {
    this.state.trips = this.state.trips.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: action === 'dispatch' ? 'In Transit' : action === 'complete' ? 'Completed' : action === 'delay' ? 'Delayed' : t.status,
          delayMinutes: payload.delayMinutes !== undefined ? payload.delayMinutes : t.delayMinutes,
          delayReason: payload.reason || t.delayReason,
        };
      }
      return t;
    });
    this.notify();
    try {
      await api.actionTransportTrip(id, action, payload);
    } catch (e) {
      console.warn('API actionTrip error:', e);
    }
  }

  // --- TELEMETRY ---
  getTelemetry() { return this.state.telemetry; }
  async updateTelemetry(vehicleNumber, payload) {
    this.state.telemetry = this.state.telemetry.map(t => (t.busNumber === vehicleNumber ? { ...t, ...payload } : t));
    this.notify();
    try {
      await api.updateTransportTelemetry(vehicleNumber, payload);
    } catch (e) {
      console.warn('API updateTelemetry error:', e);
    }
  }

  // --- BOARDING ---
  getBoarding() { return this.state.boarding; }
  async recordBoarding(entry) {
    const newRecord = {
      id: entry.id || `BRD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Verified & Boarded',
      ...entry,
    };
    this.state.boarding = [newRecord, ...this.state.boarding];
    this.notify();
    try {
      await api.recordTransportBoarding(entry);
    } catch (e) {
      console.warn('API recordBoarding error:', e);
    }
    return newRecord;
  }

  // --- MAINTENANCE ---
  getMaintenance() { return this.state.maintenance; }
  async addMaintenance(log) {
    const newLog = {
      id: log.id || `MNT-VEH-${Date.now().toString().slice(-4)}`,
      lastServiceDate: new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      isOverdue: false,
      ...log,
    };
    this.state.maintenance = [newLog, ...this.state.maintenance];
    this.notify();
    try {
      const res = await api.createTransportMaintenance(log);
      if (res?.data?.id) {
        newLog.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addMaintenance error:', e);
    }
    return newLog;
  }
  async updateMaintenance(id, updates) {
    this.state.maintenance = this.state.maintenance.map(m => (m.id === id ? { ...m, ...updates } : m));
    this.notify();
    try {
      await api.updateTransportMaintenance(id, updates);
    } catch (e) {
      console.warn('API updateMaintenance error:', e);
    }
  }
  async deleteMaintenance(id) {
    this.state.maintenance = this.state.maintenance.filter(m => m.id !== id);
    this.notify();
    try {
      await api.deleteTransportMaintenance(id);
    } catch (e) {
      console.warn('API deleteMaintenance error:', e);
    }
  }

  // --- FUEL ---
  getFuelLogs() { return this.state.fuel; }
  async addFuelLog(fuel) {
    const newLog = {
      id: fuel.id || `FUEL-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Approved & Billed',
      ...fuel,
    };
    this.state.fuel = [newLog, ...this.state.fuel];
    this.notify();
    try {
      const res = await api.createTransportFuelLog(fuel);
      if (res?.data?.id) {
        newLog.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addFuelLog error:', e);
    }
    return newLog;
  }
  async updateFuelLog(id, updates) {
    this.state.fuel = this.state.fuel.map(f => (f.id === id ? { ...f, ...updates } : f));
    this.notify();
    try {
      await api.updateTransportFuelLog(id, updates);
    } catch (e) {
      console.warn('API updateFuelLog error:', e);
    }
  }
  async deleteFuelLog(id) {
    this.state.fuel = this.state.fuel.filter(f => f.id !== id);
    this.notify();
    try {
      await api.deleteTransportFuelLog(id);
    } catch (e) {
      console.warn('API deleteFuelLog error:', e);
    }
  }

  // --- FEES & FINES ---
  getFees() { return this.state.fees; }
  async addFeeRecord(fee) {
    const newFee = {
      id: fee.id || `FEE-${Date.now().toString().slice(-4)}`,
      status: 'Paid',
      dueDate: '2026-12-15',
      ...fee,
    };
    this.state.fees = [newFee, ...this.state.fees];
    this.notify();
    try {
      const res = await api.createTransportFeeRecord(fee);
      if (res?.data?.id) {
        newFee.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addFeeRecord error:', e);
    }
    return newFee;
  }
  async updateFeeRecord(id, updates) {
    this.state.fees = this.state.fees.map(f => (f.id === id ? { ...f, ...updates } : f));
    this.notify();
    try {
      await api.updateTransportFeeRecord(id, updates);
    } catch (e) {
      console.warn('API updateFeeRecord error:', e);
    }
  }
  async deleteFeeRecord(id) {
    this.state.fees = this.state.fees.filter(f => f.id !== id);
    this.notify();
    try {
      await api.deleteTransportFeeRecord(id);
    } catch (e) {
      console.warn('API deleteFeeRecord error:', e);
    }
  }

  // --- COMPLIANCE ---
  getCompliance() { return this.state.compliance; }
  async updateCompliance(busNumber, updates) {
    this.state.compliance = this.state.compliance.map(c => (c.busNumber === busNumber ? { ...c, ...updates } : c));
    this.notify();
    try {
      await api.updateTransportCompliance(busNumber, updates);
    } catch (e) {
      console.warn('API updateCompliance error:', e);
    }
  }

  // --- COMPLAINTS ---
  getComplaints() { return this.state.complaints; }
  async addComplaint(complaint) {
    const newComplaint = {
      id: complaint.id || `CMP-${Date.now().toString().slice(-4)}`,
      dateFiled: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      ...complaint,
    };
    this.state.complaints = [newComplaint, ...this.state.complaints];
    this.notify();
    try {
      const res = await api.createTransportComplaint(complaint);
      if (res?.data?.id) {
        newComplaint.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addComplaint error:', e);
    }
    return newComplaint;
  }
  async updateComplaint(id, updates) {
    this.state.complaints = this.state.complaints.map(c => (c.id === id ? { ...c, ...updates } : c));
    this.notify();
    try {
      await api.updateTransportComplaint(id, updates);
    } catch (e) {
      console.warn('API updateComplaint error:', e);
    }
  }
  async deleteComplaint(id) {
    this.state.complaints = this.state.complaints.filter(c => c.id !== id);
    this.notify();
    try {
      await api.deleteTransportComplaint(id);
    } catch (e) {
      console.warn('API deleteComplaint error:', e);
    }
  }

  // --- ACCIDENTS ---
  getAccidents() { return this.state.accidents; }
  async addAccident(incident) {
    const newInc = {
      id: incident.id || `INC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Reported',
      ...incident,
    };
    this.state.accidents = [newInc, ...this.state.accidents];
    this.notify();
    try {
      const res = await api.createTransportAccident(incident);
      if (res?.data?.id) {
        newInc.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addAccident error:', e);
    }
    return newInc;
  }
  async updateAccident(id, updates) {
    this.state.accidents = this.state.accidents.map(a => (a.id === id ? { ...a, ...updates } : a));
    this.notify();
    try {
      await api.updateTransportAccident(id, updates);
    } catch (e) {
      console.warn('API updateAccident error:', e);
    }
  }
  async deleteAccident(id) {
    this.state.accidents = this.state.accidents.filter(a => a.id !== id);
    this.notify();
    try {
      await api.deleteTransportAccident(id);
    } catch (e) {
      console.warn('API deleteAccident error:', e);
    }
  }

  // --- PARKING ---
  getParking() { return this.state.parking; }
  async addParking(parking) {
    const newPark = {
      id: parking.id || `PRK-${Date.now().toString().slice(-4)}`,
      status: 'Assigned',
      ...parking,
    };
    this.state.parking = [newPark, ...this.state.parking];
    this.notify();
    try {
      const res = await api.createTransportParking(parking);
      if (res?.data?.id) {
        newPark.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addParking error:', e);
    }
    return newPark;
  }
  async updateParking(id, updates) {
    this.state.parking = this.state.parking.map(p => (p.id === id ? { ...p, ...updates } : p));
    this.notify();
    try {
      await api.updateTransportParking(id, updates);
    } catch (e) {
      console.warn('API updateParking error:', e);
    }
  }
  async deleteParking(id) {
    this.state.parking = this.state.parking.filter(p => p.id !== id);
    this.notify();
    try {
      await api.deleteTransportParking(id);
    } catch (e) {
      console.warn('API deleteParking error:', e);
    }
  }

  // --- STAFF ATTENDANCE ---
  getStaffAttendance() { return this.state.staffAttendance; }
  async recordStaffAttendance(attendance) {
    const newAtt = {
      id: attendance.id || `ATT-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...attendance,
    };
    this.state.staffAttendance = [newAtt, ...this.state.staffAttendance];
    this.notify();
    try {
      await api.recordTransportStaffAttendance(attendance);
    } catch (e) {
      console.warn('API recordStaffAttendance error:', e);
    }
    return newAtt;
  }

  // --- NOTIFICATIONS ---
  getNotifications() { return this.state.notifications; }
  async addNotification(notif) {
    const newNotif = {
      id: notif.id || `NTF-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      ...notif,
    };
    this.state.notifications = [newNotif, ...this.state.notifications];
    this.notify();
    try {
      const res = await api.createTransportNotification(notif);
      if (res?.data?.id) {
        newNotif.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addNotification error:', e);
    }
    return newNotif;
  }
  async deleteNotification(id) {
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);
    this.notify();
    try {
      await api.deleteTransportNotification(id);
    } catch (e) {
      console.warn('API deleteNotification error:', e);
    }
  }

  // --- REQUESTS ---
  getRequests() { return this.state.requests; }
  async addRequest(req) {
    const newReq = {
      id: req.id || `REQ-${Date.now().toString().slice(-4)}`,
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'Pending Verification',
      ...req,
    };
    this.state.requests = [newReq, ...this.state.requests];
    this.notify();
    try {
      const res = await api.createTransportRequest(req);
      if (res?.data?.id) {
        newReq.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addRequest error:', e);
    }
    return newReq;
  }
  async decideRequest(id, decision, reviewNotes) {
    this.state.requests = this.state.requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: decision === 'Approved' ? 'Approved & Pass Updated' : 'Rejected',
          reviewNotes: reviewNotes || (decision === 'Approved' ? 'Approved by Transport Officer.' : 'Rejected due to vehicle capacity limits.'),
        };
      }
      return r;
    });
    this.notify();
    try {
      await api.decideTransportRequest(id, { decision, reviewNotes });
    } catch (e) {
      console.warn('API decideRequest error:', e);
    }
  }
  async deleteRequest(id) {
    this.state.requests = this.state.requests.filter(r => r.id !== id);
    this.notify();
    try {
      await api.deleteTransportRequest(id);
    } catch (e) {
      console.warn('API deleteRequest error:', e);
    }
  }

  // --- SAFETY INSPECTIONS ---
  getSafetyInspections() { return this.state.safetyInspections; }
  async addSafetyInspection(inspection) {
    const newInsp = {
      id: inspection.id || `SFT-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Passed',
      ...inspection,
    };
    this.state.safetyInspections = [newInsp, ...this.state.safetyInspections];
    this.notify();
    try {
      const res = await api.createTransportSafetyInspection(inspection);
      if (res?.data?.id) {
        newInsp.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addSafetyInspection error:', e);
    }
    return newInsp;
  }

  // --- SCHEDULES ---
  getSchedules() { return this.state.schedules; }
  async addSchedule(schedule) {
    const newSched = {
      id: schedule.id || `SCH-${Date.now().toString().slice(-4)}`,
      status: 'Active',
      ...schedule,
    };
    this.state.schedules = [newSched, ...this.state.schedules];
    this.notify();
    try {
      const res = await api.createTransportSchedule(schedule);
      if (res?.data?.id) {
        newSched.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addSchedule error:', e);
    }
    return newSched;
  }

  // --- INVENTORY ---
  getInventory() { return this.state.inventory; }
  async addInventory(item) {
    const newItem = {
      id: item.id || `PRT-${Date.now().toString().slice(-4)}`,
      status: 'In Stock',
      ...item,
    };
    this.state.inventory = [newItem, ...this.state.inventory];
    this.notify();
    try {
      const res = await api.createTransportInventory(item);
      if (res?.data?.id) {
        newItem.id = res.data.id;
        this.notify();
      }
    } catch (e) {
      console.warn('API addInventory error:', e);
    }
    return newItem;
  }
  async updateInventory(id, updates) {
    this.state.inventory = this.state.inventory.map(i => (i.id === id ? { ...i, ...updates } : i));
    this.notify();
    try {
      await api.updateTransportInventory(id, updates);
    } catch (e) {
      console.warn('API updateInventory error:', e);
    }
  }
  async deleteInventory(id) {
    this.state.inventory = this.state.inventory.filter(i => i.id !== id);
    this.notify();
    try {
      await api.deleteTransportInventory(id);
    } catch (e) {
      console.warn('API deleteInventory error:', e);
    }
  }

  // --- POLICIES ---
  getPolicies() { return this.state.policies; }
  async updatePolicies(policies) {
    this.state.policies = policies;
    this.notify();
    try {
      await api.updateTransportPolicies(policies);
    } catch (e) {
      console.warn('API updatePolicies error:', e);
    }
  }

  // --- PERMISSIONS ---
  getPermissions(role = 'admin_office') {
    return this.state.permissions.filter(p => !role || p.role === role);
  }
  async updatePermission(payload) {
    const { role = 'admin_office', section, canView, canCreate, canEdit, canUpdate, canDelete, canExport, canManageSettings } = payload;
    const existingIdx = this.state.permissions.findIndex(p => p.role === role && p.section === section);
    if (existingIdx >= 0) {
      this.state.permissions[existingIdx] = { ...this.state.permissions[existingIdx], ...payload };
    } else {
      this.state.permissions.push({ role, section, canView, canCreate, canEdit, canUpdate, canDelete, canExport, canManageSettings });
    }
    this.notify();
    try {
      await api.updateTransportPermission(payload);
    } catch (e) {
      console.warn('API updatePermission error:', e);
    }
  }
}

export const transportStore = new TransportStore();
