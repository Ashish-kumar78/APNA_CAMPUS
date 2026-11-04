// Warden Pending Tasks & Operational Dockets Store (Backend)
// Manages real-time pending approvals, grievances, room transfers, curfew anomalies, and indents

import { saveWardenCmsProfile, getWardenCmsProfile } from './warden-profiles.data';

export type TaskCategory =
  | 'Gate Pass & Exit'
  | 'Room Maintenance'
  | 'Room Reallocation'
  | 'Curfew & Night Roll Call'
  | 'Dining & Mess'
  | 'Staff & Indents';

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskStatus =
  | 'Pending Warden Approval'
  | 'Awaiting Inspection'
  | 'Under Inspection'
  | 'In Progress'
  | 'Escalated to Admin'
  | 'Pending Verification'
  | 'Pending Approval'
  | 'Approved'
  | 'Resolved'
  | 'Rejected';

export interface TaskHistoryEntry {
  status: string;
  updatedBy: string;
  role?: string;
  timestamp: string;
  remarks?: string;
}

export interface WardenPendingTask {
  id: string;
  docketNumber: string;
  wardenId: string;
  wardenName: string;
  hostelName: string;
  block: string;
  category: TaskCategory;
  taskType: 'gate_pass' | 'complaint' | 'room_transfer' | 'night_curfew' | 'mess' | 'leave';
  title: string;
  description: string;
  studentName?: string;
  studentRoll?: string;
  studentRoom?: string;
  studentPhone?: string;
  studentDepartment?: string;
  parentConsentVerified?: boolean;
  parentContact?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  dueTime?: string;
  assignedStaff?: string;
  remarks?: string;
  resolutionNote?: string;
  history: TaskHistoryEntry[];
}

export const INITIAL_WARDEN_TASKS: Record<string, WardenPendingTask[]> = {
  // WRD-101: Mr. Rajesh Jena (Gandhi Boys Residence) -> 3 Pending
  'WRD-101': [
    {
      id: 'TSK-101-1',
      docketNumber: 'GP-2026-4401',
      wardenId: 'WRD-101',
      wardenName: 'Mr. Rajesh Jena',
      hostelName: 'Gandhi Boys Residence',
      block: 'Block A (Rooms 101-220)',
      category: 'Gate Pass & Exit',
      taskType: 'gate_pass',
      title: 'Weekend Outstation Leave Pass — Cuttack Native Home',
      description: 'Request for weekend leave to visit parents. Faculty mentor verified. Parent consent authenticated via registered SMS.',
      studentName: 'Rohan Mohanty',
      studentRoll: '2301105012',
      studentRoom: 'Room 104-B',
      studentPhone: '+91 98612 34011',
      studentDepartment: 'B.Tech CSE (3rd Sem)',
      parentConsentVerified: true,
      parentContact: '+91 94371 88920 (Father)',
      priority: 'High',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 09:15 AM',
      dueTime: '2026-10-28 06:00 PM',
      history: [
        {
          status: 'Submitted',
          updatedBy: 'Rohan Mohanty (Student)',
          role: 'STUDENT',
          timestamp: '2026-10-28 09:15 AM',
          remarks: 'Submitted via Student Portal.'
        },
        {
          status: 'Mentor Endorsed',
          updatedBy: 'Dr. S. K. Nayak (Faculty Mentor)',
          role: 'FACULTY',
          timestamp: '2026-10-28 10:30 AM',
          remarks: 'Academic attendance > 85%, endorsed for warden sanction.'
        }
      ]
    },
    {
      id: 'TSK-101-2',
      docketNumber: 'CMP-HST-881',
      wardenId: 'WRD-101',
      wardenName: 'Mr. Rajesh Jena',
      hostelName: 'Gandhi Boys Residence',
      block: 'Block B (Rooms 201-320)',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'Electrical Short & Spark in Switchboard (Room 218)',
      description: 'Heavy sparking observed during laptop charging. Main circuit breaker tripped in Block B second floor.',
      studentName: 'Soumya Ranjan Sahoo',
      studentRoll: '2201105108',
      studentRoom: 'Room 218',
      studentPhone: '+91 97780 23145',
      studentDepartment: 'B.Tech Electrical (5th Sem)',
      priority: 'Critical',
      status: 'In Progress',
      assignedStaff: 'Manoj Pradhan (Electrician)',
      createdAt: '2026-10-28 07:45 AM',
      dueTime: '2026-10-28 01:00 PM',
      remarks: 'Electrician dispatched with spare 16A modular switch and MCB.',
      history: [
        {
          status: 'Reported',
          updatedBy: 'Soumya Ranjan Sahoo',
          role: 'STUDENT',
          timestamp: '2026-10-28 07:45 AM',
          remarks: 'Urgent electrical hazard reported.'
        },
        {
          status: 'In Progress',
          updatedBy: 'Mr. Rajesh Jena (Warden)',
          role: 'WARDEN',
          timestamp: '2026-10-28 08:20 AM',
          remarks: 'Assigned to campus electrical maintenance team.'
        }
      ]
    },
    {
      id: 'TSK-101-3',
      docketNumber: 'NRC-FLG-339',
      wardenId: 'WRD-101',
      wardenName: 'Mr. Rajesh Jena',
      hostelName: 'Gandhi Boys Residence',
      block: 'Block A (Rooms 101-220)',
      category: 'Curfew & Night Roll Call',
      taskType: 'night_curfew',
      title: 'Curfew Late Return Verification — Biswajit Behera',
      description: 'Student entered hostel gate at 09:42 PM (curfew cutoff 09:30 PM). Gate security recorded delayed biometric punch. Requires warden justification note.',
      studentName: 'Biswajit Behera',
      studentRoll: '2301105099',
      studentRoom: 'Room 112',
      studentPhone: '+91 94380 44521',
      studentDepartment: 'B.Tech Mechanical (3rd Sem)',
      parentConsentVerified: false,
      priority: 'Medium',
      status: 'Pending Verification',
      createdAt: '2026-10-27 10:15 PM',
      dueTime: '2026-10-28 12:00 PM',
      history: [
        {
          status: 'Flagged by Security',
          updatedBy: 'Security Guard Gate 2',
          role: 'SECURITY',
          timestamp: '2026-10-27 10:15 PM',
          remarks: 'Logged late entry with security log book entry #412.'
        }
      ]
    }
  ],

  // WRD-102: Mrs. Nibedita Das (Sarojini Girls Residence) -> 1 Pending
  'WRD-102': [
    {
      id: 'TSK-102-1',
      docketNumber: 'GP-2026-3890',
      wardenId: 'WRD-102',
      wardenName: 'Mrs. Nibedita Das',
      hostelName: 'Sarojini Girls Residence',
      block: 'Wing A (Floors 1-3)',
      category: 'Gate Pass & Exit',
      taskType: 'gate_pass',
      title: 'Extended Evening Library Research Pass (Till 09:30 PM)',
      description: 'Permission to access Central Library Autonomous Research wing for final year capstone thesis data collection. Faculty supervisor confirmed.',
      studentName: 'Ananya Priyadarshini',
      studentRoll: '2101105189',
      studentRoom: 'Wing A Room 205',
      studentPhone: '+91 94372 99012',
      studentDepartment: 'B.Tech CSE (7th Sem)',
      parentConsentVerified: true,
      parentContact: '+91 94370 12345 (Mother)',
      priority: 'High',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 08:30 AM',
      dueTime: '2026-10-28 05:00 PM',
      history: [
        {
          status: 'Submitted',
          updatedBy: 'Ananya Priyadarshini',
          role: 'STUDENT',
          timestamp: '2026-10-28 08:30 AM',
          remarks: 'Special library curfew extension docket.'
        }
      ]
    }
  ],

  // WRD-103: Mr. Tanmaya Kumar Routray (Bhabani Hostel-2) -> 4 Pending
  'WRD-103': [
    {
      id: 'TSK-103-1',
      docketNumber: 'RM-TRS-102',
      wardenId: 'WRD-103',
      wardenName: 'Mr. Tanmaya Kumar Routray',
      hostelName: 'Bhabani Hostel-2',
      block: 'Main Block (Floors 1-3)',
      category: 'Room Reallocation',
      taskType: 'room_transfer',
      title: 'Room Change Request: Room 108 to Room 312',
      description: 'Student requested mutual room swap with peer to join collaborative departmental project study room on 3rd floor.',
      studentName: 'Debashis Nayak',
      studentRoll: '2301105044',
      studentRoom: 'Room 108 (Floor 1)',
      studentPhone: '+91 98611 23098',
      studentDepartment: 'B.Tech ECE (3rd Sem)',
      priority: 'Medium',
      status: 'Awaiting Inspection',
      createdAt: '2026-10-27 02:20 PM',
      dueTime: '2026-10-29 05:00 PM',
      history: [
        {
          status: 'Initiated',
          updatedBy: 'Debashis Nayak',
          role: 'STUDENT',
          timestamp: '2026-10-27 02:20 PM',
          remarks: 'Form submitted with mutual consent declaration.'
        }
      ]
    },
    {
      id: 'TSK-103-2',
      docketNumber: 'CMP-HST-912',
      wardenId: 'WRD-103',
      wardenName: 'Mr. Tanmaya Kumar Routray',
      hostelName: 'Bhabani Hostel-2',
      block: 'Main Block (Floors 1-3)',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'RO Water Cooler Filter Overflow & Choke (Floor 2)',
      description: 'Drinking water dispenser drainage blocked, causing water accumulation on corridor floor. Requires plumber and sanitization.',
      studentName: 'Subrat Kumar Sahoo',
      studentRoll: '2401105021',
      studentRoom: 'Room 206',
      studentPhone: '+91 97782 11099',
      studentDepartment: 'B.Tech Civil (1st Sem)',
      priority: 'High',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 06:40 AM',
      dueTime: '2026-10-28 02:00 PM',
      history: [
        {
          status: 'Logged',
          updatedBy: 'Subrat Kumar Sahoo',
          role: 'STUDENT',
          timestamp: '2026-10-28 06:40 AM',
          remarks: 'Water spill hazard in corridor.'
        }
      ]
    },
    {
      id: 'TSK-103-3',
      docketNumber: 'GP-2026-4488',
      wardenId: 'WRD-103',
      wardenName: 'Mr. Tanmaya Kumar Routray',
      hostelName: 'Bhabani Hostel-2',
      block: 'Main Block (Floors 1-3)',
      category: 'Gate Pass & Exit',
      taskType: 'gate_pass',
      title: 'Emergency Medical Hospital Pass — Apollo Hospital BBSR',
      description: 'Student experiencing acute dental inflammation; scheduled consultant appointment at Apollo Clinic Bhubaneswar. Parent informed.',
      studentName: 'Subham Das',
      studentRoll: '2301105088',
      studentRoom: 'Room 215',
      studentPhone: '+91 94399 88123',
      studentDepartment: 'B.Tech Mechanical (3rd Sem)',
      parentConsentVerified: true,
      parentContact: '+91 94371 44556',
      priority: 'Critical',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 10:10 AM',
      dueTime: '2026-10-28 12:30 PM',
      history: [
        {
          status: 'Medical Priority Pass',
          updatedBy: 'Campus Dispensary Doctor',
          role: 'DOCTOR',
          timestamp: '2026-10-28 10:10 AM',
          remarks: 'Dispensary referral issued.'
        }
      ]
    },
    {
      id: 'TSK-103-4',
      docketNumber: 'LV-HST-2026-081',
      wardenId: 'WRD-103',
      wardenName: 'Mr. Tanmaya Kumar Routray',
      hostelName: 'Bhabani Hostel-2',
      block: 'Main Block (Floors 1-3)',
      category: 'Staff & Indents',
      taskType: 'leave',
      title: 'Supervisor Casual Leave Endorsement & Duty Handover',
      description: 'Casual leave application for 30-31 Oct 2026 to attend urgent family function. Substitute arrangement endorsed by Mr. P. Mohapatra.',
      studentName: 'Mr. Tanmaya Kumar Routray (Self)',
      priority: 'Medium',
      status: 'Pending Approval',
      createdAt: '2026-10-26 10:30 AM',
      dueTime: '2026-10-29 04:00 PM',
      history: [
        {
          status: 'Submitted',
          updatedBy: 'Mr. Tanmaya Kumar Routray',
          role: 'STAFF',
          timestamp: '2026-10-26 10:30 AM',
          remarks: 'Awaiting Chief Warden / Hostel Admin sign-off.'
        }
      ]
    }
  ],

  // WRD-104: Dr. Swapna Patra (Sarojini Girls Residence) -> 2 Pending
  'WRD-104': [
    {
      id: 'TSK-104-1',
      docketNumber: 'CMP-HST-934',
      wardenId: 'WRD-104',
      wardenName: 'Dr. Swapna Patra',
      hostelName: 'Sarojini Girls Residence',
      block: 'Wing B Extension (Floor 3)',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'Water Geyser Heating Element Tripping MCB (3rd Floor Washroom)',
      description: 'Morning hot water geyser in common washroom not heating. Technician replaced coil, pending warden test inspection and sign-off.',
      studentName: 'Priyanka Samal',
      studentRoll: '2201105312',
      studentRoom: 'Room 304',
      studentPhone: '+91 94378 11200',
      studentDepartment: 'B.Tech IT (5th Sem)',
      priority: 'Medium',
      status: 'In Progress',
      assignedStaff: 'Kailash Sahoo (Plumbing/Electrical)',
      createdAt: '2026-10-27 05:40 PM',
      dueTime: '2026-10-28 02:00 PM',
      history: [
        {
          status: 'Repair Complete / Awaiting Warden Verification',
          updatedBy: 'Kailash Sahoo (Technician)',
          role: 'STAFF',
          timestamp: '2026-10-28 09:00 AM',
          remarks: 'Heating element replaced. Awaiting warden sign-off.'
        }
      ]
    },
    {
      id: 'TSK-104-2',
      docketNumber: 'NRC-FLG-345',
      wardenId: 'WRD-104',
      wardenName: 'Dr. Swapna Patra',
      hostelName: 'Sarojini Girls Residence',
      block: 'Wing B Extension (Floor 3)',
      category: 'Curfew & Night Roll Call',
      taskType: 'night_curfew',
      title: 'Medical Sick Room Reporting — Lipsa Rout',
      description: 'Student marked absent at 09:30 PM biometric curfew roll call due to fever rest in Campus Medical Center. Sick bay docket attached.',
      studentName: 'Lipsa Rout',
      studentRoll: '2301105155',
      studentRoom: 'Room 302',
      studentPhone: '+91 97781 44552',
      studentDepartment: 'B.Tech CSE (3rd Sem)',
      parentConsentVerified: true,
      priority: 'High',
      status: 'Pending Verification',
      createdAt: '2026-10-27 10:00 PM',
      dueTime: '2026-10-28 01:00 PM',
      history: [
        {
          status: 'Dispensary Rest Registered',
          updatedBy: 'Staff Nurse B. Senapati',
          role: 'MEDICAL',
          timestamp: '2026-10-27 10:00 PM',
          remarks: 'Student admitted for overnight observation.'
        }
      ]
    }
  ],

  // WRD-105: Mr. Debendra Sahoo (Bhabani Hostel-1) -> 5 Pending
  'WRD-105': [
    {
      id: 'TSK-105-1',
      docketNumber: 'GP-2026-4510',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Gate Pass & Exit',
      taskType: 'gate_pass',
      title: 'Urgent Family Ceremony Leave — Balasore',
      description: 'Request for 2-day leave to attend elder sister marriage ceremony. Bus ticket and parent verification letter submitted.',
      studentName: 'Prakash Senapati',
      studentRoll: '2401105009',
      studentRoom: 'Room G-04',
      studentPhone: '+91 98614 77890',
      studentDepartment: 'B.Tech Civil (1st Sem)',
      parentConsentVerified: true,
      parentContact: '+91 94371 99882 (Father)',
      priority: 'High',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 07:15 AM',
      dueTime: '2026-10-28 04:00 PM',
      history: [
        {
          status: 'Applied',
          updatedBy: 'Prakash Senapati',
          role: 'STUDENT',
          timestamp: '2026-10-28 07:15 AM',
          remarks: 'Submitted with attached invitation card.'
        }
      ]
    },
    {
      id: 'TSK-105-2',
      docketNumber: 'CMP-HST-940',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'Window Mosquito Mesh Net Torn (Room 102)',
      description: 'Mesh net damaged during heavy gust wind, causing insect nuisance at night. Carpenter requisition required.',
      studentName: 'Amitav Pradhan',
      studentRoll: '2401105033',
      studentRoom: 'Room 102',
      studentPhone: '+91 97788 12344',
      studentDepartment: 'B.Tech Electrical (1st Sem)',
      priority: 'Low',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-27 04:10 PM',
      dueTime: '2026-10-29 05:00 PM',
      history: [
        {
          status: 'Reported',
          updatedBy: 'Amitav Pradhan',
          role: 'STUDENT',
          timestamp: '2026-10-27 04:10 PM',
          remarks: 'Routine carpentry fix needed.'
        }
      ]
    },
    {
      id: 'TSK-105-3',
      docketNumber: 'MSS-DKT-114',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Dining & Mess',
      taskType: 'mess',
      title: 'Mess Hall Sanitization & RO Water TDS Verification',
      description: 'Monthly hygiene compliance check and TDS meter calibration for Bhabani dining hall water filter.',
      studentName: 'Mess Committee Rep (Chandan Sethi)',
      priority: 'Medium',
      status: 'Under Inspection',
      createdAt: '2026-10-27 11:30 AM',
      dueTime: '2026-10-28 05:00 PM',
      history: [
        {
          status: 'Quality Audit Scheduled',
          updatedBy: 'Mess Committee',
          role: 'COMMITTEE',
          timestamp: '2026-10-27 11:30 AM',
          remarks: 'TDS tested at 145 ppm. Awaiting warden sign-off certificate.'
        }
      ]
    },
    {
      id: 'TSK-105-4',
      docketNumber: 'NRC-FLG-350',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Curfew & Night Roll Call',
      taskType: 'night_curfew',
      title: 'Inter-College Football Tournament Late Return Pass',
      description: 'Captain Alok Mishra returned at 10:10 PM with Physical Education Director permission slip following practice.',
      studentName: 'Alok Mishra',
      studentRoll: '2301105077',
      studentRoom: 'Room G-12',
      studentPhone: '+91 94391 22340',
      studentDepartment: 'B.Tech Mechanical (3rd Sem)',
      priority: 'Medium',
      status: 'Pending Verification',
      createdAt: '2026-10-27 10:15 PM',
      dueTime: '2026-10-28 02:00 PM',
      history: [
        {
          status: 'Sports Exemption Submitted',
          updatedBy: 'Director of Physical Education',
          role: 'STAFF',
          timestamp: '2026-10-27 10:15 PM',
          remarks: 'Sports training curfew relaxation.'
        }
      ]
    },
    {
      id: 'TSK-105-5',
      docketNumber: 'RM-CHK-204',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Room Reallocation',
      taskType: 'room_transfer',
      title: 'Post-Renovation Room 106 Fixture Clearance & Handover',
      description: 'Room 106 whitewash, LED tubelight replacement, and wardrobe polishing completed. Requires supervisor handover sign-off before bed re-allotment.',
      studentName: 'Estate Maintenance Team',
      priority: 'Low',
      status: 'Awaiting Inspection',
      createdAt: '2026-10-28 09:30 AM',
      dueTime: '2026-10-29 01:00 PM',
      history: [
        {
          status: 'Maintenance Handover Ready',
          updatedBy: 'Estate Supervisor',
          role: 'ESTATE',
          timestamp: '2026-10-28 09:30 AM',
          remarks: 'Room vacant and ready for warden bed inspection.'
        }
      ]
    }
  ],

  // WRD-106: Mr. Bipin Sethi (Central Hostel Complex) -> 2 Pending
  'WRD-106': [
    {
      id: 'TSK-106-1',
      docketNumber: 'REQ-MNT-552',
      wardenId: 'WRD-106',
      wardenName: 'Mr. Bipin Sethi',
      hostelName: 'Central Hostel Complex (Relief Coverage)',
      block: 'Utility Core & Central Mess',
      category: 'Staff & Indents',
      taskType: 'complaint',
      title: 'Diesel Generator Backup Fuel Log Verification (500 KVA DG Set)',
      description: 'Log book fuel reconciliation for DG Set #2. 400 Litres diesel procured on 24-Oct; requires supervisory signature for billing clearance.',
      studentName: 'Generator Maintenance Tech (B. Swain)',
      priority: 'High',
      status: 'Pending Verification',
      createdAt: '2026-10-27 03:00 PM',
      dueTime: '2026-10-28 04:00 PM',
      history: [
        {
          status: 'Submitted for Audit',
          updatedBy: 'B. Swain (Estate)',
          role: 'ESTATE',
          timestamp: '2026-10-27 03:00 PM',
          remarks: 'Fuel slips and meter readings attached.'
        }
      ]
    },
    {
      id: 'TSK-106-2',
      docketNumber: 'CMP-HST-955',
      wardenId: 'WRD-106',
      wardenName: 'Mr. Bipin Sethi',
      hostelName: 'Central Hostel Complex (Relief Coverage)',
      block: 'Utility Core & Central Mess',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'Central Recreation Room DTH Cable Signal Glitch',
      description: 'Tata Sky set top box in main common recreation hall showing "No Signal (E48-32)". Cable line needs re-termination.',
      studentName: 'Recreation Club Secretary',
      priority: 'Low',
      status: 'In Progress',
      assignedStaff: 'Electronics Tech',
      createdAt: '2026-10-28 08:00 AM',
      dueTime: '2026-10-28 06:00 PM',
      history: [
        {
          status: 'Assigned',
          updatedBy: 'Mr. Bipin Sethi',
          role: 'WARDEN',
          timestamp: '2026-10-28 08:45 AM',
          remarks: 'Technician instructed to check LNB cable connector.'
        }
      ]
    }
  ],

  // WRD-107: Mr. prabhu mohapatra (All Blocks) -> 0 Pending
  'WRD-107': []
};

// Global in-memory cache for tasks
const tasksCache = new Map<string, WardenPendingTask[]>();

// Initialize cache with copy of initial data
Object.entries(INITIAL_WARDEN_TASKS).forEach(([wardenId, tasks]) => {
  tasksCache.set(wardenId.toUpperCase(), JSON.parse(JSON.stringify(tasks)));
});

const PENDING_STATUSES = new Set([
  'Pending Warden Approval',
  'Awaiting Inspection',
  'In Progress',
  'Escalated to Admin',
  'Pending Verification',
  'Pending Approval',
  'Under Inspection',
  'Submitted'
]);

export function countPendingTasksForWarden(wardenId: string): number {
  const cleanId = wardenId.trim().toUpperCase();
  const tasks = tasksCache.get(cleanId) || [];
  return tasks.filter(t => PENDING_STATUSES.has(t.status)).length;
}

export function getWardenPendingTasksBackend(
  wardenId: string,
  filter?: { status?: string; category?: string; priority?: string }
): {
  tasks: WardenPendingTask[];
  pendingCount: number;
  summary: {
    total: number;
    pending: number;
    approved: number;
    resolved: number;
    criticalOrHigh: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
} {
  const cleanId = wardenId.trim().toUpperCase();

  // If requesting 'ALL', aggregate across all wardens
  let allTasks: WardenPendingTask[] = [];
  if (cleanId === 'ALL') {
    tasksCache.forEach(list => {
      allTasks = allTasks.concat(list);
    });
  } else {
    // If not in cache, seed empty or check profile
    if (!tasksCache.has(cleanId)) {
      const profile = getWardenCmsProfile(cleanId);
      tasksCache.set(cleanId, []);
    }
    allTasks = [...(tasksCache.get(cleanId) || [])];
  }

  // Calculate summary before filtering
  const total = allTasks.length;
  const pending = allTasks.filter(t => PENDING_STATUSES.has(t.status)).length;
  const approved = allTasks.filter(t => t.status === 'Approved').length;
  const resolved = allTasks.filter(t => t.status === 'Resolved').length;
  const criticalOrHigh = allTasks.filter(t => t.priority === 'Critical' || t.priority === 'High').length;

  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  allTasks.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  });

  // Apply filters if provided
  let filtered = [...allTasks];
  if (filter?.status && filter.status !== 'ALL') {
    filtered = filtered.filter(t => t.status.toLowerCase() === filter.status!.toLowerCase());
  }
  if (filter?.category && filter.category !== 'ALL') {
    filtered = filtered.filter(t => t.category.toLowerCase() === filter.category!.toLowerCase());
  }
  if (filter?.priority && filter.priority !== 'ALL') {
    filtered = filtered.filter(t => t.priority.toLowerCase() === filter.priority!.toLowerCase());
  }

  return {
    tasks: filtered,
    pendingCount: pending,
    summary: {
      total,
      pending,
      approved,
      resolved,
      criticalOrHigh,
      byCategory,
      byStatus
    }
  };
}

export function updateWardenPendingTaskStatusBackend(
  wardenId: string,
  taskId: string,
  updates: { status: string; remarks?: string; resolutionNote?: string; action?: string },
  user?: any
): { task: WardenPendingTask; pendingCount: number } {
  const cleanId = wardenId.trim().toUpperCase();
  let taskList = tasksCache.get(cleanId);

  // If not found directly, search across all lists
  let targetWardenId = cleanId;
  let task: WardenPendingTask | undefined;

  if (taskList) {
    task = taskList.find(t => t.id === taskId || t.docketNumber === taskId);
  }

  if (!task) {
    for (const [wId, list] of tasksCache.entries()) {
      const found = list.find(t => t.id === taskId || t.docketNumber === taskId);
      if (found) {
        task = found;
        targetWardenId = wId;
        taskList = list;
        break;
      }
    }
  }

  if (!task) {
    throw new Error(`Task '${taskId}' not found for warden '${wardenId}'.`);
  }

  const previousStatus = task.status;
  task.status = updates.status as TaskStatus;
  if (updates.remarks) task.remarks = updates.remarks;
  if (updates.resolutionNote) task.resolutionNote = updates.resolutionNote;

  const updaterName = user?.name || user?.username || 'Hostel Administrator';
  const updaterRole = user?.role ? String(user.role).toUpperCase() : 'ADMIN';

  task.history.push({
    status: task.status,
    updatedBy: updaterName,
    role: updaterRole,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    remarks: updates.remarks || updates.resolutionNote || `Status updated from '${previousStatus}' to '${task.status}'`
  });

  // Recalculate pending count and update warden profile
  const pendingCount = countPendingTasksForWarden(targetWardenId);
  try {
    saveWardenCmsProfile(targetWardenId, { pendingTasks: pendingCount });
  } catch {}

  return { task, pendingCount };
}

export function batchActionWardenPendingTasksBackend(
  wardenId: string,
  body: { taskIds: string[]; action: string; remarks?: string },
  user?: any
): { updatedCount: number; tasks: WardenPendingTask[]; pendingCount: number } {
  const { taskIds, action, remarks } = body;
  const updatedTasks: WardenPendingTask[] = [];

  let newStatus: TaskStatus = 'Approved';
  if (action === 'approve') newStatus = 'Approved';
  else if (action === 'resolve') newStatus = 'Resolved';
  else if (action === 'escalate') newStatus = 'Escalated to Admin';
  else if (action === 'in_progress') newStatus = 'In Progress';
  else if (action === 'reject') newStatus = 'Rejected';

  for (const tid of taskIds) {
    try {
      const result = updateWardenPendingTaskStatusBackend(
        wardenId,
        tid,
        { status: newStatus, remarks: remarks || `Batch ${action} executed by administrator.` },
        user
      );
      updatedTasks.push(result.task);
    } catch {}
  }

  const pendingCount = countPendingTasksForWarden(wardenId);
  return {
    updatedCount: updatedTasks.length,
    tasks: updatedTasks,
    pendingCount
  };
}
