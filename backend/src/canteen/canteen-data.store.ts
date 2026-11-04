// Apna Campus ERP — Enterprise Canteen Data Store & Engine
import * as fs from 'fs';
import * as path from 'path';
import {
  HostellerRecord,
  BiometricDeviceRecord,
  BiometricStudentMappingRecord,
  MealAttendanceRecord,
  DailyMealSummaryRecord,
  FoodConsumptionRecord,
  KitchenInventoryItem,
  InventoryTransactionRecord,
  CanteenAuditLogRecord,
  MealType,
  AttendanceStatus,
} from './canteen.types';

export class CanteenDataStore {
  private dataFilePath: string;

  public hostellers: Map<string, HostellerRecord> = new Map();
  public biometricDevices: Map<string, BiometricDeviceRecord> = new Map();
  public biometricMappings: Map<string, BiometricStudentMappingRecord> = new Map();
  public attendanceRecords: Map<string, MealAttendanceRecord> = new Map();
  public consumptionRecords: Map<string, FoodConsumptionRecord> = new Map();
  public inventoryItems: Map<string, KitchenInventoryItem> = new Map();
  public inventoryTransactions: Map<string, InventoryTransactionRecord> = new Map();
  public auditLogs: CanteenAuditLogRecord[] = [];

  constructor() {
    const rootDir = process.cwd().endsWith('backend') ? process.cwd() : path.join(process.cwd(), 'backend');
    this.dataFilePath = path.resolve(rootDir, 'data', 'canteen_erp_store.json');
    this.initStore();
  }

  private initStore() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.hostellers && Array.isArray(parsed.hostellers)) {
          parsed.hostellers.forEach((h: HostellerRecord) => this.hostellers.set(h.studentId, h));
        }
        if (parsed.biometricDevices && Array.isArray(parsed.biometricDevices)) {
          parsed.biometricDevices.forEach((d: BiometricDeviceRecord) => this.biometricDevices.set(d.deviceId, d));
        }
        if (parsed.biometricMappings && Array.isArray(parsed.biometricMappings)) {
          parsed.biometricMappings.forEach((m: BiometricStudentMappingRecord) => this.biometricMappings.set(m.studentId, m));
        }
        if (parsed.attendanceRecords && Array.isArray(parsed.attendanceRecords)) {
          parsed.attendanceRecords.forEach((a: MealAttendanceRecord) => this.attendanceRecords.set(a.id, a));
        }
        if (parsed.consumptionRecords && Array.isArray(parsed.consumptionRecords)) {
          parsed.consumptionRecords.forEach((c: FoodConsumptionRecord) => this.consumptionRecords.set(c.id, c));
        }
        if (parsed.inventoryItems && Array.isArray(parsed.inventoryItems)) {
          parsed.inventoryItems.forEach((i: KitchenInventoryItem) => this.inventoryItems.set(i.id, i));
        }
        if (parsed.inventoryTransactions && Array.isArray(parsed.inventoryTransactions)) {
          parsed.inventoryTransactions.forEach((t: InventoryTransactionRecord) => this.inventoryTransactions.set(t.id, t));
        }
        if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
          this.auditLogs = parsed.auditLogs;
        }
      }
    } catch (e) {
      // Fallback
    }

    // Seed defaults if empty
    if (this.hostellers.size === 0) {
      this.seedDefaultHostellers();
    }
    if (this.biometricDevices.size === 0) {
      this.seedDefaultDevices();
    }
    if (this.inventoryItems.size === 0) {
      this.seedDefaultInventory();
    }
    if (this.biometricMappings.size === 0) {
      this.seedDefaultMappings();
    }
    if (this.attendanceRecords.size === 0) {
      this.seedDefaultAttendance();
    }
    if (this.consumptionRecords.size === 0) {
      this.seedDefaultConsumption();
    }
    this.persist();
  }

  public persist() {
    try {
      const payload = {
        hostellers: Array.from(this.hostellers.values()),
        biometricDevices: Array.from(this.biometricDevices.values()),
        biometricMappings: Array.from(this.biometricMappings.values()),
        attendanceRecords: Array.from(this.attendanceRecords.values()),
        consumptionRecords: Array.from(this.consumptionRecords.values()),
        inventoryItems: Array.from(this.inventoryItems.values()),
        inventoryTransactions: Array.from(this.inventoryTransactions.values()),
        auditLogs: this.auditLogs.slice(-500),
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e) {
      // safe fallback
    }
  }

  private seedDefaultHostellers() {
    const list: HostellerRecord[] = [
      {
        id: 'hostel-std-01',
        studentId: '2401432265',
        rollNumber: '24CSE014',
        registrationNumber: 'REG-2024-CSE-014',
        name: 'Bishnu Prasad Sahoo',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        department: 'Computer Science & Engineering (AI)',
        academicYear: '2026-27',
        semester: 'Semester 3',
        hostelName: 'Sarojini Girls Residence',
        hostelBlock: 'Block-A',
        roomNumber: '304',
        hostelWarden: 'Mrs. Nibedita Das (+91 94370 33445)',
        parentContact: '+91 94371 99012 (Mr. Sahoo)',
        studentContact: '+91 77498 44291',
        hostelAdmissionDate: '2024-08-01',
        hostelStatus: 'Active',
        mealPlan: 'Full Board (4 Meals)',
        biometricId: 'BIO-FP-19181',
        mealSubscriptionStatus: 'Active',
        hostelFee: {
          totalHostelFee: 48000,
          paidAmount: 48000,
          pendingAmount: 0,
          paymentStatus: 'Paid',
          lastPaymentDate: '2026-07-15',
          nextDueDate: '2027-01-10',
          receiptNo: 'REC-HST-2026-8812',
        },
        messFee: {
          totalMessFee: 24000,
          paidAmount: 24000,
          pendingAmount: 0,
          paymentStatus: 'Paid',
          lastPaymentDate: '2026-07-15',
          nextDueDate: '2027-01-10',
          receiptNo: 'REC-MSS-2026-1049',
        },
      },
      {
        id: 'hostel-std-02',
        studentId: '2305201001',
        rollNumber: '01',
        registrationNumber: 'REG-2023-MECH-001',
        name: 'Rakesh Das',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        department: 'Mechanical Engineering',
        academicYear: '2026-27',
        semester: 'Semester 5',
        hostelName: 'CV Raman Boys Hall of Residence',
        hostelBlock: 'Block-B',
        roomNumber: '112',
        hostelWarden: 'Prof. S. K. Patnaik (+91 98610 22345)',
        parentContact: '+91 98612 11099 (Mr. Das)',
        studentContact: '+91 98612 44310',
        hostelAdmissionDate: '2023-08-10',
        hostelStatus: 'Active',
        mealPlan: 'Full Board (4 Meals)',
        biometricId: 'BIO-FP-18450',
        mealSubscriptionStatus: 'Active',
        hostelFee: {
          totalHostelFee: 48000,
          paidAmount: 28000,
          pendingAmount: 20000,
          paymentStatus: 'Partial',
          lastPaymentDate: '2026-08-02',
          nextDueDate: '2026-11-15',
          receiptNo: 'REC-HST-2026-7201',
        },
        messFee: {
          totalMessFee: 24000,
          paidAmount: 24000,
          pendingAmount: 0,
          paymentStatus: 'Paid',
          lastPaymentDate: '2026-08-02',
          nextDueDate: '2027-01-10',
          receiptNo: 'REC-MSS-2026-0922',
        },
      },
      {
        id: 'hostel-std-03',
        studentId: '2301289140',
        rollNumber: '23CSE089',
        registrationNumber: 'REG-2023-CSE-089',
        name: 'Subhashree Mohapatra',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        department: 'Computer Science & Engineering',
        academicYear: '2026-27',
        semester: 'Semester 5',
        hostelName: 'Gargi Girls Residence',
        hostelBlock: 'Block-C',
        roomNumber: '208',
        hostelWarden: 'Dr. Sunita Ray (+91 94371 44556)',
        parentContact: '+91 94372 77112 (Mr. Mohapatra)',
        studentContact: '+91 94370 12891',
        hostelAdmissionDate: '2023-08-12',
        hostelStatus: 'Active',
        mealPlan: 'Standard (3 Meals)',
        biometricId: 'BIO-FP-17892',
        mealSubscriptionStatus: 'Active',
        hostelFee: {
          totalHostelFee: 48000,
          paidAmount: 48000,
          pendingAmount: 0,
          paymentStatus: 'Paid',
          lastPaymentDate: '2026-07-20',
          nextDueDate: '2027-01-10',
          receiptNo: 'REC-HST-2026-9044',
        },
        messFee: {
          totalMessFee: 20000,
          paidAmount: 10000,
          pendingAmount: 10000,
          paymentStatus: 'Partial',
          lastPaymentDate: '2026-07-20',
          nextDueDate: '2026-11-20',
          receiptNo: 'REC-MSS-2026-1150',
        },
      },
      {
        id: 'hostel-std-04',
        studentId: '2201405099',
        rollNumber: '22EE045',
        registrationNumber: 'REG-2022-EE-045',
        name: 'Rahul Verma',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        department: 'Electrical Engineering',
        academicYear: '2026-27',
        semester: 'Semester 7',
        hostelName: 'CV Raman Boys Hall of Residence',
        hostelBlock: 'Block-A',
        roomNumber: '402',
        hostelWarden: 'Prof. S. K. Patnaik (+91 98610 22345)',
        parentContact: '+91 99370 55123 (Mr. Verma)',
        studentContact: '+91 99371 40509',
        hostelAdmissionDate: '2022-08-05',
        hostelStatus: 'Active',
        mealPlan: 'Full Board (4 Meals)',
        biometricId: 'BIO-FP-16509',
        mealSubscriptionStatus: 'Active',
        hostelFee: {
          totalHostelFee: 48000,
          paidAmount: 0,
          pendingAmount: 48000,
          paymentStatus: 'Overdue',
          lastPaymentDate: '2026-01-15',
          nextDueDate: '2026-08-10',
          receiptNo: 'REC-HST-2025-4410',
        },
        messFee: {
          totalMessFee: 24000,
          paidAmount: 12000,
          pendingAmount: 12000,
          paymentStatus: 'Partial',
          lastPaymentDate: '2026-08-05',
          nextDueDate: '2026-11-10',
          receiptNo: 'REC-MSS-2026-2001',
        },
      },
      {
        id: 'hostel-std-05',
        studentId: '2401432299',
        rollNumber: '24ECE022',
        registrationNumber: 'REG-2024-ECE-022',
        name: 'Sneha Patel',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        department: 'Electronics & Communication',
        academicYear: '2026-27',
        semester: 'Semester 3',
        hostelName: 'Sarojini Girls Residence',
        hostelBlock: 'Block-B',
        roomNumber: '215',
        hostelWarden: 'Mrs. Nibedita Das (+91 94370 33445)',
        parentContact: '+91 98250 88219 (Mr. Patel)',
        studentContact: '+91 98251 43229',
        hostelAdmissionDate: '2024-08-03',
        hostelStatus: 'Active',
        mealPlan: 'Full Board (4 Meals)',
        biometricId: 'BIO-FP-19299',
        mealSubscriptionStatus: 'Active',
        hostelFee: {
          totalHostelFee: 48000,
          paidAmount: 48000,
          pendingAmount: 0,
          paymentStatus: 'Paid',
          lastPaymentDate: '2026-07-25',
          nextDueDate: '2027-01-10',
          receiptNo: 'REC-HST-2026-9520',
        },
        messFee: {
          totalMessFee: 24000,
          paidAmount: 24000,
          pendingAmount: 0,
          paymentStatus: 'Paid',
          lastPaymentDate: '2026-07-25',
          nextDueDate: '2027-01-10',
          receiptNo: 'REC-MSS-2026-1502',
        },
      },
      {
        id: 'hostel-std-06',
        studentId: '2301552104',
        rollNumber: '23CIV012',
        registrationNumber: 'REG-2023-CIV-012',
        name: 'Deepak Jena',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        department: 'Civil Engineering',
        academicYear: '2026-27',
        semester: 'Semester 5',
        hostelName: 'Kalam Hall of Residence',
        hostelBlock: 'Block-D',
        roomNumber: '108',
        hostelWarden: 'Dr. B. K. Mohanty (+91 94373 88123)',
        parentContact: '+91 94374 55670 (Mr. Jena)',
        studentContact: '+91 94375 52104',
        hostelAdmissionDate: '2023-08-11',
        hostelStatus: 'Active',
        mealPlan: 'Standard (3 Meals)',
        biometricId: 'BIO-FP-18104',
        mealSubscriptionStatus: 'Active',
        hostelFee: {
          totalHostelFee: 48000,
          paidAmount: 48000,
          pendingAmount: 0,
          paymentStatus: 'Paid',
          lastPaymentDate: '2026-07-18',
          nextDueDate: '2027-01-10',
          receiptNo: 'REC-HST-2026-8902',
        },
        messFee: {
          totalMessFee: 20000,
          paidAmount: 20000,
          pendingAmount: 0,
          paymentStatus: 'Paid',
          lastPaymentDate: '2026-07-18',
          nextDueDate: '2027-01-10',
          receiptNo: 'REC-MSS-2026-1280',
        },
      },
    ];

    list.forEach(h => this.hostellers.set(h.studentId, h));
  }

  private seedDefaultDevices() {
    const devices: BiometricDeviceRecord[] = [
      {
        id: 'dev-01',
        deviceId: 'BIO-DEV-MESS-01',
        deviceName: 'MorphoWave Fingerprint Terminal 1',
        terminalName: 'Mess Counter 1 (Main Entrance)',
        location: 'Central Dining Hall, Ground Floor',
        ipAddress: '192.168.10.101',
        macAddress: '00:1A:2B:3C:4D:01',
        firmwareVersion: 'v4.18.2-PROD',
        status: 'Online',
        lastHeartbeat: new Date().toISOString(),
        totalScansToday: 428,
      },
      {
        id: 'dev-02',
        deviceId: 'BIO-DEV-MESS-02',
        deviceName: 'MorphoWave Fingerprint Terminal 2',
        terminalName: 'Mess Counter 2 (North Hall)',
        location: 'Central Dining Hall, North Gate',
        ipAddress: '192.168.10.102',
        macAddress: '00:1A:2B:3C:4D:02',
        firmwareVersion: 'v4.18.2-PROD',
        status: 'Online',
        lastHeartbeat: new Date().toISOString(),
        totalScansToday: 382,
      },
      {
        id: 'dev-03',
        deviceId: 'BIO-DEV-MESS-03',
        deviceName: 'SecuGen Hamster Plus Terminal 3',
        terminalName: 'Mess Counter 3 (South Hall)',
        location: 'Central Dining Hall, South Gate',
        ipAddress: '192.168.10.103',
        macAddress: '00:1A:2B:3C:4D:03',
        firmwareVersion: 'v3.90.1-PROD',
        status: 'Online',
        lastHeartbeat: new Date().toISOString(),
        totalScansToday: 310,
      },
      {
        id: 'dev-04',
        deviceId: 'BIO-DEV-MESS-04',
        deviceName: 'Anviz Biometric Terminal 4',
        terminalName: 'Girls Mess Dedicated Counter',
        location: 'Sarojini Residence Dining Bay',
        ipAddress: '192.168.10.104',
        macAddress: '00:1A:2B:3C:4D:04',
        firmwareVersion: 'v4.02.0-PROD',
        status: 'Online',
        lastHeartbeat: new Date().toISOString(),
        totalScansToday: 265,
      },
      {
        id: 'dev-05',
        deviceId: 'BIO-DEV-MESS-05',
        deviceName: 'RFID Smart Card + Biometric Hybrid',
        terminalName: 'Special Curries & Diet Counter',
        location: 'Central Canteen A-La-Carte Bay',
        ipAddress: '192.168.10.105',
        macAddress: '00:1A:2B:3C:4D:05',
        firmwareVersion: 'v5.10.4-PROD',
        status: 'Online',
        lastHeartbeat: new Date().toISOString(),
        totalScansToday: 198,
      },
      {
        id: 'dev-06',
        deviceId: 'BIO-DEV-MESS-06',
        deviceName: 'Handheld Mobile Terminal 6',
        terminalName: 'Hostel Night Inspection & Backup Scanner',
        location: 'Roaming / Mobile Canteen',
        ipAddress: '192.168.10.106',
        macAddress: '00:1A:2B:3C:4D:06',
        firmwareVersion: 'v2.80.0-PROD',
        status: 'Online',
        lastHeartbeat: new Date().toISOString(),
        totalScansToday: 74,
      },
    ];

    devices.forEach(d => this.biometricDevices.set(d.deviceId, d));
  }

  private seedDefaultMappings() {
    this.hostellers.forEach(h => {
      this.biometricMappings.set(h.studentId, {
        id: `map-${h.studentId}`,
        biometricId: h.biometricId,
        studentId: h.studentId,
        registrationNumber: h.registrationNumber,
        studentName: h.name,
        photo: h.photo,
        hostelName: h.hostelName,
        roomNumber: h.roomNumber,
        deviceId: 'BIO-DEV-MESS-01',
        registrationStatus: 'Active',
        lastVerification: '2026-11-03 13:15:20',
        lastTerminal: 'Mess Counter 1 (Main Entrance)',
        deviceConnectionStatus: 'Online',
        registeredAt: '2024-08-05 10:30:00',
      });
    });
  }

  private seedDefaultInventory() {
    const items: KitchenInventoryItem[] = [
      {
        id: 'inv-01',
        itemCode: 'RAW-GRAIN-001',
        name: 'Basmati & Sona Masoori Rice',
        category: 'Grains & Pulses',
        unit: 'kg',
        openingStock: 1200,
        purchasedQuantity: 600,
        usedQuantity: 340,
        remainingStock: 1460,
        wastage: 5,
        closingStock: 1455,
        standardPerStudentGrams: 120,
        minThreshold: 400,
        costPerUnit: 52,
        lastUpdated: '2026-11-03',
      },
      {
        id: 'inv-02',
        itemCode: 'RAW-GRAIN-002',
        name: 'Toor & Moong Dal Pulses',
        category: 'Grains & Pulses',
        unit: 'kg',
        openingStock: 450,
        purchasedQuantity: 200,
        usedQuantity: 110,
        remainingStock: 540,
        wastage: 2,
        closingStock: 538,
        standardPerStudentGrams: 60,
        minThreshold: 150,
        costPerUnit: 125,
        lastUpdated: '2026-11-03',
      },
      {
        id: 'inv-03',
        itemCode: 'RAW-VEG-003',
        name: 'Fresh Mixed Vegetables & Potatoes',
        category: 'Vegetables & Greens',
        unit: 'kg',
        openingStock: 350,
        purchasedQuantity: 400,
        usedQuantity: 280,
        remainingStock: 470,
        wastage: 12,
        closingStock: 458,
        standardPerStudentGrams: 150,
        minThreshold: 100,
        costPerUnit: 35,
        lastUpdated: '2026-11-03',
      },
      {
        id: 'inv-04',
        itemCode: 'RAW-OIL-004',
        name: 'Refined Mustard & Sunflower Cooking Oil',
        category: 'Cooking Oils',
        unit: 'liters',
        openingStock: 220,
        purchasedQuantity: 150,
        usedQuantity: 65,
        remainingStock: 305,
        wastage: 1,
        closingStock: 304,
        standardPerStudentGrams: 25,
        minThreshold: 80,
        costPerUnit: 138,
        lastUpdated: '2026-11-03',
      },
      {
        id: 'inv-05',
        itemCode: 'RAW-DAIRY-005',
        name: 'Pasteurized Full Cream Dairy Milk',
        category: 'Dairy',
        unit: 'liters',
        openingStock: 300,
        purchasedQuantity: 350,
        usedQuantity: 290,
        remainingStock: 360,
        wastage: 4,
        closingStock: 356,
        standardPerStudentGrams: 200,
        minThreshold: 100,
        costPerUnit: 64,
        lastUpdated: '2026-11-03',
      },
      {
        id: 'inv-06',
        itemCode: 'RAW-FRUIT-006',
        name: 'Seasonal Bananas & Apples',
        category: 'Fruits & Beverages',
        unit: 'units',
        openingStock: 600,
        purchasedQuantity: 500,
        usedQuantity: 480,
        remainingStock: 620,
        wastage: 15,
        closingStock: 605,
        standardPerStudentGrams: 1,
        minThreshold: 200,
        costPerUnit: 8,
        lastUpdated: '2026-11-03',
      },
      {
        id: 'inv-07',
        itemCode: 'RAW-SPICE-007',
        name: 'Assorted Spices, Turmeric, Cumin & Garam Masala',
        category: 'Spices',
        unit: 'kg',
        openingStock: 85,
        purchasedQuantity: 50,
        usedQuantity: 18,
        remainingStock: 117,
        wastage: 0.5,
        closingStock: 116.5,
        standardPerStudentGrams: 10,
        minThreshold: 25,
        costPerUnit: 320,
        lastUpdated: '2026-11-03',
      },
    ];

    items.forEach(i => this.inventoryItems.set(i.id, i));
  }

  private seedDefaultAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const pastDays = [today, '2026-11-02', '2026-11-01'];
    const hostellerList = Array.from(this.hostellers.values());

    pastDays.forEach(date => {
      hostellerList.forEach((h, index) => {
        // Breakfast
        this.attendanceRecords.set(`att-${date}-bk-${h.studentId}`, {
          id: `att-${date}-bk-${h.studentId}`,
          studentId: h.studentId,
          studentName: h.name,
          registrationNumber: h.registrationNumber,
          hostel: h.hostelName,
          roomNumber: h.roomNumber,
          mealType: 'Breakfast',
          mealDate: date,
          verificationTime: '08:15:22',
          biometricId: h.biometricId,
          attendanceStatus: index === 3 ? 'Absent' : 'Present',
          verificationMethod: 'Biometric Fingerprint',
          terminalId: 'BIO-DEV-MESS-01',
          createdAt: `${date}T08:15:22.000Z`,
        });

        // Lunch
        this.attendanceRecords.set(`att-${date}-ln-${h.studentId}`, {
          id: `att-${date}-ln-${h.studentId}`,
          studentId: h.studentId,
          studentName: h.name,
          registrationNumber: h.registrationNumber,
          hostel: h.hostelName,
          roomNumber: h.roomNumber,
          mealType: 'Lunch',
          mealDate: date,
          verificationTime: '13:05:40',
          biometricId: h.biometricId,
          attendanceStatus: 'Present',
          verificationMethod: index === 1 ? 'Supervisor Manual Override' : 'Biometric Fingerprint',
          manualReason: index === 1 ? 'Sensor smudge read retry authorized by warden' : undefined,
          terminalId: 'BIO-DEV-MESS-02',
          createdAt: `${date}T13:05:40.000Z`,
        });

        // Evening Snacks
        this.attendanceRecords.set(`att-${date}-sn-${h.studentId}`, {
          id: `att-${date}-sn-${h.studentId}`,
          studentId: h.studentId,
          studentName: h.name,
          registrationNumber: h.registrationNumber,
          hostel: h.hostelName,
          roomNumber: h.roomNumber,
          mealType: 'Evening Snacks',
          mealDate: date,
          verificationTime: '17:45:10',
          biometricId: h.biometricId,
          attendanceStatus: 'Present',
          verificationMethod: 'Biometric Fingerprint',
          terminalId: 'BIO-DEV-MESS-03',
          createdAt: `${date}T17:45:10.000Z`,
        });

        // Dinner
        this.attendanceRecords.set(`att-${date}-dn-${h.studentId}`, {
          id: `att-${date}-dn-${h.studentId}`,
          studentId: h.studentId,
          studentName: h.name,
          registrationNumber: h.registrationNumber,
          hostel: h.hostelName,
          roomNumber: h.roomNumber,
          mealType: 'Dinner',
          mealDate: date,
          verificationTime: '20:10:15',
          biometricId: h.biometricId,
          attendanceStatus: index === 4 ? 'Excused' : 'Present',
          verificationMethod: 'Biometric Fingerprint',
          manualReason: index === 4 ? 'Official Sports Fest Practice Sanctioned' : undefined,
          terminalId: 'BIO-DEV-MESS-01',
          createdAt: `${date}T20:10:15.000Z`,
        });
      });
    });
  }

  private seedDefaultConsumption() {
    const today = new Date().toISOString().split('T')[0];
    const meals: MealType[] = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];
    const counts = [
      { type: 'Breakfast', eligible: 520, served: 465, prepared: 490, waste: 8, spec: 12 },
      { type: 'Lunch', eligible: 520, served: 495, prepared: 510, waste: 6, spec: 28 },
      { type: 'Evening Snacks', eligible: 520, served: 440, prepared: 460, waste: 5, spec: 15 },
      { type: 'Dinner', eligible: 520, served: 480, prepared: 500, waste: 7, spec: 35 },
    ];

    counts.forEach((c, idx) => {
      this.consumptionRecords.set(`cons-${today}-${idx}`, {
        id: `cons-${today}-${idx}`,
        date: today,
        mealType: c.type as MealType,
        eligibleStudents: c.eligible,
        actualServed: c.served,
        estimatedFoodKg: Math.round(c.served * 0.45),
        actualFoodPreparedKg: Math.round(c.prepared * 0.45),
        actualFoodServedKg: Math.round(c.served * 0.44),
        remainingFoodKg: Math.round((c.prepared - c.served) * 0.45),
        foodWastageKg: c.waste,
        wastagePercentage: Number(((c.waste / (c.prepared * 0.45)) * 100).toFixed(1)),
        specialMealCount: c.spec,
        specialMealNotes: c.spec > 0 ? `${c.spec} orders for extra Paneer/Chicken` : undefined,
        loggedBy: 'Kailash Chandra Sahoo (Canteen In-Charge)',
        createdAt: new Date().toISOString(),
      });
    });
  }

  // --- Core Domain Logic Methods ---

  /**
   * Helper: Is the meal service window closed for the specified meal type?
   * Windows:
   * Breakfast: 07:30 to 10:00
   * Lunch: 12:00 to 14:30
   * Evening Snacks: 17:00 to 18:30
   * Dinner: 19:30 to 22:00
   */
  public isMealWindowClosed(mealType: MealType, dateStr?: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    // If querying past date, window is definitively closed
    if (dateStr && dateStr < today) return true;
    // If querying future date, window is not open or closed yet
    if (dateStr && dateStr > today) return false;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const timeInMins = currentHours * 60 + currentMinutes;

    switch (mealType) {
      case 'Breakfast':
        return timeInMins >= 10 * 60; // After 10:00 AM
      case 'Lunch':
        return timeInMins >= 14 * 60 + 30; // After 02:30 PM
      case 'Evening Snacks':
        return timeInMins >= 18 * 60 + 30; // After 06:30 PM
      case 'Dinner':
        return timeInMins >= 22 * 60; // After 10:00 PM
      default:
        return false;
    }
  }

  /**
   * Resolve attendance status with strict rule:
   * Unserved students are 'Not Yet Served' while the window is active,
   * and only 'Absent' once the window closes!
   */
  public resolveStudentMealStatus(studentId: string, mealType: MealType, dateStr: string): AttendanceStatus {
    const key = `att-${dateStr}-${mealType.toLowerCase().slice(0, 2)}-${studentId}`;
    const directMatch = Array.from(this.attendanceRecords.values()).find(
      r => r.studentId === studentId && r.mealType === mealType && r.mealDate === dateStr
    );

    if (directMatch) {
      return directMatch.attendanceStatus;
    }

    // Not yet scanned in
    const isClosed = this.isMealWindowClosed(mealType, dateStr);
    return isClosed ? 'Absent' : 'Not Yet Served';
  }

  /**
   * Verify meal access
   */
  public verifyMealAccess(params: {
    studentId?: string;
    biometricId?: string;
    mealType: MealType;
    terminalId?: string;
    isManual?: boolean;
    manualReason?: string;
    authorizedBy?: string;
  }): {
    success: boolean;
    message: string;
    code: string;
    student?: HostellerRecord;
    attendance?: MealAttendanceRecord;
  } {
    const { studentId, biometricId, mealType, terminalId, isManual, manualReason, authorizedBy } = params;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    // Find student
    let student: HostellerRecord | undefined;
    if (studentId) {
      student = this.hostellers.get(studentId) || Array.from(this.hostellers.values()).find(h => h.rollNumber === studentId || h.registrationNumber === studentId);
    } else if (biometricId) {
      student = Array.from(this.hostellers.values()).find(h => h.biometricId === biometricId);
    }

    if (!student) {
      this.logAudit({
        actor: authorizedBy || 'Biometric Scanner',
        actorRole: isManual ? 'supervisor' : 'device',
        action: 'VERIFICATION_FAILED',
        target: studentId || biometricId || 'Unknown',
        details: 'Student or Biometric ID not registered in central database',
      });
      return {
        success: false,
        code: 'NOT_FOUND',
        message: 'Biometric or Student Reference not found in Central Institutional Register.',
      };
    }

    // Check active status
    if (student.hostelStatus !== 'Active' || student.mealSubscriptionStatus !== 'Active') {
      this.logAudit({
        actor: authorizedBy || 'Biometric Scanner',
        actorRole: 'device',
        action: 'VERIFICATION_REJECTED',
        target: student.studentId,
        details: `Inactive status: Hostel (${student.hostelStatus}), Subscription (${student.mealSubscriptionStatus})`,
      });
      return {
        success: false,
        code: 'INACTIVE_SUBSCRIPTION',
        message: `Meal Access Denied: Student meal subscription status is ${student.mealSubscriptionStatus}. Please clear mess dues.`,
        student,
      };
    }

    // Check duplicate attendance today
    const existing = Array.from(this.attendanceRecords.values()).find(
      r => r.studentId === student!.studentId && r.mealType === mealType && r.mealDate === today && (r.attendanceStatus === 'Present' || r.attendanceStatus === 'Manual Verification')
    );

    if (existing) {
      this.logAudit({
        actor: authorizedBy || 'Biometric Scanner',
        actorRole: 'device',
        action: 'DUPLICATE_CLAIM_BLOCKED',
        target: student.studentId,
        details: `Duplicate attempt for ${mealType}. Already served at ${existing.verificationTime}`,
      });
      return {
        success: false,
        code: 'DUPLICATE_CLAIM',
        message: `Duplicate Meal Claim Prevented: ${student.name} already claimed ${mealType} today at ${existing.verificationTime}.`,
        student,
        attendance: existing,
      };
    }

    // Record verified attendance
    const recordId = `att-${today}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: MealAttendanceRecord = {
      id: recordId,
      studentId: student.studentId,
      studentName: student.name,
      registrationNumber: student.registrationNumber,
      hostel: student.hostelName,
      roomNumber: student.roomNumber,
      mealType,
      mealDate: today,
      verificationTime: nowTime,
      biometricId: student.biometricId,
      attendanceStatus: isManual ? 'Manual Verification' : 'Present',
      verificationMethod: isManual ? 'Supervisor Manual Override' : 'Biometric Fingerprint',
      terminalId: terminalId || 'BIO-DEV-MESS-01',
      manualReason,
      authorizedBy,
      createdAt: new Date().toISOString(),
    };

    this.attendanceRecords.set(recordId, newRecord);

    // Update mapping last verification
    const mapping = this.biometricMappings.get(student.studentId);
    if (mapping) {
      mapping.lastVerification = `${today} ${nowTime}`;
      mapping.lastTerminal = terminalId || 'BIO-DEV-MESS-01';
      this.biometricMappings.set(student.studentId, mapping);
    }

    // Update device scan count
    if (terminalId && this.biometricDevices.has(terminalId)) {
      const dev = this.biometricDevices.get(terminalId)!;
      dev.totalScansToday += 1;
      dev.lastHeartbeat = new Date().toISOString();
      this.biometricDevices.set(terminalId, dev);
    }

    this.logAudit({
      actor: authorizedBy || 'Biometric Terminal',
      actorRole: isManual ? 'supervisor' : 'device',
      action: 'MEAL_VERIFIED',
      target: student.studentId,
      details: `${student.name} verified for ${mealType} via ${newRecord.verificationMethod}`,
    });

    this.persist();

    return {
      success: true,
      code: 'VERIFIED',
      message: `Verified: ${student.name} granted ${mealType}!`,
      student,
      attendance: newRecord,
    };
  }

  public logAudit(log: Omit<CanteenAuditLogRecord, 'id' | 'timestamp'>) {
    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log,
    });
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
  }
}

export const canteenDataStore = new CanteenDataStore();
