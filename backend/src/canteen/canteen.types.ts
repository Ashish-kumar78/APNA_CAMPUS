// Apna Campus ERP — Canteen Directorate & Fleet Enterprise Types

export type MealType = 'Breakfast' | 'Lunch' | 'Evening Snacks' | 'Dinner';

export type AttendanceStatus = 'Present' | 'Absent' | 'Not Yet Served' | 'Excused' | 'Manual Verification';

export type VerificationMethod = 'Biometric Fingerprint' | 'RFID Smart Card' | 'Supervisor Manual Override' | 'Facial Recognition';

export interface HostellerRecord {
  id: string;
  studentId: string;
  rollNumber: string;
  registrationNumber: string;
  name: string;
  photo: string;
  department: string;
  academicYear: string;
  semester: string;
  hostelName: string;
  hostelBlock: string;
  roomNumber: string;
  hostelWarden: string;
  parentContact: string;
  studentContact: string;
  hostelAdmissionDate: string;
  hostelStatus: 'Active' | 'Inactive' | 'Vacated';
  mealPlan: string;
  biometricId: string;
  mealSubscriptionStatus: 'Active' | 'Expired' | 'Suspended' | 'Pending Renewal';
  
  // Separate financial categories
  hostelFee: {
    totalHostelFee: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
    lastPaymentDate: string;
    nextDueDate: string;
    receiptNo: string;
  };

  messFee: {
    totalMessFee: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
    lastPaymentDate: string;
    nextDueDate: string;
    receiptNo: string;
  };
}

export interface BiometricDeviceRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  terminalName: string;
  location: string;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  status: 'Online' | 'Offline' | 'Syncing';
  lastHeartbeat: string;
  totalScansToday: number;
}

export interface BiometricStudentMappingRecord {
  id: string;
  biometricId: string;
  studentId: string;
  registrationNumber: string;
  studentName: string;
  photo: string;
  hostelName: string;
  roomNumber: string;
  deviceId: string;
  registrationStatus: 'Active' | 'Inactive' | 'Pending';
  lastVerification: string | null;
  lastTerminal: string | null;
  deviceConnectionStatus: 'Online' | 'Offline';
  registeredAt: string;
}

export interface MealAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  hostel: string;
  roomNumber: string;
  mealType: MealType;
  mealDate: string; // YYYY-MM-DD
  verificationTime: string;
  biometricId: string;
  attendanceStatus: AttendanceStatus;
  verificationMethod: VerificationMethod;
  terminalId?: string;
  manualReason?: string;
  authorizedBy?: string;
  createdAt: string;
}

export interface DailyMealSummaryRecord {
  date: string;
  totalActiveHostellers: number;
  totalEligibleStudents: number;
  breakfast: { present: number; absent: number; notYetServed: number; excused: number };
  lunch: { present: number; absent: number; notYetServed: number; excused: number };
  snacks: { present: number; absent: number; notYetServed: number; excused: number };
  dinner: { present: number; absent: number; notYetServed: number; excused: number };
  totalMealsServed: number;
  totalAbsentRecords: number;
  hostelBreakdown: Record<string, { present: number; absent: number; notYetServed: number; total: number }>;
}

export interface FoodConsumptionRecord {
  id: string;
  date: string;
  mealType: MealType;
  eligibleStudents: number;
  actualServed: number;
  estimatedFoodKg: number;
  actualFoodPreparedKg: number;
  actualFoodServedKg: number;
  remainingFoodKg: number;
  foodWastageKg: number;
  wastagePercentage: number;
  specialMealCount: number;
  specialMealNotes?: string;
  loggedBy: string;
  createdAt: string;
}

export interface KitchenInventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'Grains & Pulses' | 'Vegetables & Greens' | 'Dairy' | 'Cooking Oils' | 'Spices' | 'Fruits & Beverages' | 'Bakery';
  unit: 'kg' | 'liters' | 'packets' | 'units' | 'bags';
  openingStock: number;
  purchasedQuantity: number;
  usedQuantity: number;
  remainingStock: number;
  wastage: number;
  closingStock: number;
  standardPerStudentGrams: number; // For recipe requirement calculation
  minThreshold: number;
  costPerUnit: number;
  lastUpdated: string;
}

export interface InventoryTransactionRecord {
  id: string;
  itemId: string;
  itemName: string;
  type: 'PURCHASE' | 'DAILY_USAGE' | 'WASTAGE_DISPOSAL' | 'ADJUSTMENT';
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  supplier?: string;
  invoiceNo?: string;
  reason?: string;
  recordedBy: string;
  date: string;
  createdAt: string;
}

export interface CanteenAuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
  ipAddress?: string;
}

