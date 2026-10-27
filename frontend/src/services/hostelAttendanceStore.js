// Hostel Attendance, Applicants & Hostels Management Store
// Synchronizes real-time attendance submissions between Warden and Hostel Admin

const ATTENDANCE_STORAGE_KEY = 'bput_hostel_attendance_records_v2';
const HOSTELS_STORAGE_KEY = 'bput_manage_hostels_v2';
const APPLICANTS_STORAGE_KEY = 'bput_hostel_applicants_v2';

export const INITIAL_HOSTELS = [
  {
    id: 'hst-1',
    name: 'Bhabani Hostel-1',
    code: 'BN1',
    totalBeds: 82,
    bedRooms: {
      11: '(not set)',
      10: '(not set)',
      9: '(not set)',
      8: '(not set)',
      7: '(not set)',
      6: '(not set)',
      5: '(not set)',
      4: '16 Rooms',
      3: '4 Rooms',
      2: '3 Rooms',
      1: '(not set)'
    },
    warden: 'Mr. Rajesh Jena',
    contact: '+91 94370 12345',
    type: 'Boys',
    floors: 3,
    status: 'Active'
  },
  {
    id: 'hst-2',
    name: 'Bhabani Hostel-2',
    code: 'BN2',
    totalBeds: 60,
    bedRooms: {
      11: '(not set)',
      10: '(not set)',
      9: '(not set)',
      8: '(not set)',
      7: '(not set)',
      6: '(not set)',
      5: '(not set)',
      4: '12 Rooms',
      3: '4 Rooms',
      2: '(not set)',
      1: '(not set)'
    },
    warden: 'Mr. Tanmaya Kumar Routray',
    contact: '+91 94370 67890',
    type: 'Boys',
    floors: 3,
    status: 'Active'
  },
  {
    id: 'hst-3',
    name: 'Gandhi Boys Residence',
    code: 'GB1',
    totalBeds: 150,
    bedRooms: {
      11: '(not set)',
      10: '(not set)',
      9: '(not set)',
      8: '(not set)',
      7: '(not set)',
      6: '(not set)',
      5: '(not set)',
      4: '30 Rooms',
      3: '10 Rooms',
      2: '(not set)',
      1: '(not set)'
    },
    warden: 'Mr. Rajesh Jena',
    contact: '+91 94371 11222',
    type: 'Boys',
    floors: 4,
    status: 'Active'
  },
  {
    id: 'hst-4',
    name: 'Kalam Boys Residence',
    code: 'KB1',
    totalBeds: 120,
    bedRooms: {
      11: '(not set)',
      10: '(not set)',
      9: '(not set)',
      8: '(not set)',
      7: '(not set)',
      6: '(not set)',
      5: '(not set)',
      4: '25 Rooms',
      3: '6 Rooms',
      2: '1 Room',
      1: '(not set)'
    },
    warden: 'Mr. Sunil Pradhan',
    contact: '+91 94372 33445',
    type: 'Boys',
    floors: 3,
    status: 'Active'
  },
  {
    id: 'hst-5',
    name: 'Sarojini Girls Residence',
    code: 'SG1',
    totalBeds: 140,
    bedRooms: {
      11: '(not set)',
      10: '(not set)',
      9: '(not set)',
      8: '(not set)',
      7: '(not set)',
      6: '(not set)',
      5: '(not set)',
      4: '28 Rooms',
      3: '8 Rooms',
      2: '2 Rooms',
      1: '(not set)'
    },
    warden: 'Dr. Smita Mishra',
    contact: '+91 94373 55667',
    type: 'Girls',
    floors: 4,
    status: 'Active'
  }
];

export const INITIAL_STUDENTS_ROSTER = [
  {
    id: 'std-1',
    studentName: 'Rakesh Das',
    rollNumber: '01',
    regNo: '2305201001',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    roomNumber: '101',
    bedNumber: 'Bed 01',
    department: 'Computer Science & Engineering',
    semester: '5th Sem',
    phone: '+91 98610 11223',
    parentPhone: '+91 94370 99887',
    gender: 'Male',
    status: 'Present',
    remarks: 'Regular attendance'
  },
  {
    id: 'std-2',
    studentName: 'Priya Nayak',
    rollNumber: '02',
    regNo: '2305201002',
    hostelName: 'Sarojini Girls Residence',
    hostelCode: 'SG1',
    roomNumber: '201',
    bedNumber: 'Bed 01',
    department: 'Computer Science & Engineering',
    semester: '5th Sem',
    phone: '+91 98610 22334',
    parentPhone: '+91 94370 88776',
    gender: 'Female',
    status: 'Present',
    remarks: ''
  },
  {
    id: 'std-3',
    studentName: 'Amit Pattnaik',
    rollNumber: '03',
    regNo: '2305201003',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    roomNumber: '101',
    bedNumber: 'Bed 02',
    department: 'Electronics & Comm. Engg',
    semester: '5th Sem',
    phone: '+91 98610 33445',
    parentPhone: '+91 94370 77665',
    gender: 'Male',
    status: 'Present',
    remarks: ''
  },
  {
    id: 'std-4',
    studentName: 'Subhashree Sahoo',
    rollNumber: '04',
    regNo: '2305201004',
    hostelName: 'Sarojini Girls Residence',
    hostelCode: 'SG1',
    roomNumber: '201',
    bedNumber: 'Bed 02',
    department: 'Information Technology',
    semester: '5th Sem',
    phone: '+91 98610 44556',
    parentPhone: '+91 94370 66554',
    gender: 'Female',
    status: 'Present',
    remarks: ''
  },
  {
    id: 'std-5',
    studentName: 'Sourav Mohanty',
    rollNumber: '05',
    regNo: '2305201005',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    roomNumber: '102',
    bedNumber: 'Bed 01',
    department: 'Electrical Engineering',
    semester: '5th Sem',
    phone: '+91 98610 55667',
    parentPhone: '+91 94370 55443',
    gender: 'Male',
    status: 'Absent',
    remarks: 'Unreported absence tonight'
  },
  {
    id: 'std-6',
    studentName: 'Debabrata Jena',
    rollNumber: '06',
    regNo: '2305201006',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    roomNumber: '102',
    bedNumber: 'Bed 02',
    department: 'Mechanical Engineering',
    semester: '5th Sem',
    phone: '+91 98610 66778',
    parentPhone: '+91 94370 44332',
    gender: 'Male',
    status: 'Present',
    remarks: ''
  },
  {
    id: 'std-7',
    studentName: 'Ananya Panda',
    rollNumber: '07',
    regNo: '2305201007',
    hostelName: 'Sarojini Girls Residence',
    hostelCode: 'SG1',
    roomNumber: '202',
    bedNumber: 'Bed 01',
    department: 'Computer Science & Engineering',
    semester: '5th Sem',
    phone: '+91 98610 77889',
    parentPhone: '+91 94370 33221',
    gender: 'Female',
    status: 'On Leave',
    remarks: 'Approved medical gate pass #GP-2026-88'
  },
  {
    id: 'std-8',
    studentName: 'Bikash Rout',
    rollNumber: '08',
    regNo: '2305201008',
    hostelName: 'Bhabani Hostel-2',
    hostelCode: 'BN2',
    roomNumber: '101',
    bedNumber: 'Bed 01',
    department: 'Civil Engineering',
    semester: '5th Sem',
    phone: '+91 98610 88990',
    parentPhone: '+91 94370 22110',
    gender: 'Male',
    status: 'Present',
    remarks: ''
  },
  {
    id: 'std-9',
    studentName: 'Manoj Tripathy',
    rollNumber: '09',
    regNo: '2305201009',
    hostelName: 'Bhabani Hostel-2',
    hostelCode: 'BN2',
    roomNumber: '101',
    bedNumber: 'Bed 02',
    department: 'Computer Science & Engineering',
    semester: '5th Sem',
    phone: '+91 98610 99001',
    parentPhone: '+91 94370 11009',
    gender: 'Male',
    status: 'Present',
    remarks: ''
  },
  {
    id: 'std-10',
    studentName: 'Sasmita Behera',
    rollNumber: '10',
    regNo: '2305201010',
    hostelName: 'Sarojini Girls Residence',
    hostelCode: 'SG1',
    roomNumber: '202',
    bedNumber: 'Bed 02',
    department: 'Electrical & Electronics Engg',
    semester: '5th Sem',
    phone: '+91 98610 00112',
    parentPhone: '+91 94370 00998',
    gender: 'Female',
    status: 'Present',
    remarks: ''
  },
  {
    id: 'std-11',
    studentName: 'Kishore Sethi',
    rollNumber: '11',
    regNo: '2305201011',
    hostelName: 'Bhabani Hostel-2',
    hostelCode: 'BN2',
    roomNumber: '102',
    bedNumber: 'Bed 01',
    department: 'Mechanical Engineering',
    semester: '3rd Sem',
    phone: '+91 98611 11223',
    parentPhone: '+91 94371 99887',
    gender: 'Male',
    status: 'Present',
    remarks: ''
  },
  {
    id: 'std-12',
    studentName: 'Deepak Kumar Barik',
    rollNumber: '12',
    regNo: '2305201012',
    hostelName: 'Bhabani Hostel-2',
    hostelCode: 'BN2',
    roomNumber: '102',
    bedNumber: 'Bed 02',
    department: 'Information Technology',
    semester: '3rd Sem',
    phone: '+91 98611 22334',
    parentPhone: '+91 94371 88776',
    gender: 'Male',
    status: 'Absent',
    remarks: 'Library pass overdue'
  }
];

export const INITIAL_ATTENDANCE_SUBMISSIONS = [
  {
    id: 'ATT-20261026-BN1',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    date: '2026-10-26',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Rajesh Jena (Resident Warden)',
    submittedAt: '26 Oct 2026, 08:45 PM',
    verifiedByAdmin: true,
    status: 'Submitted to Hostel Admin',
    stats: {
      total: 5,
      present: 4,
      absent: 1,
      onLeave: 0,
      percentage: '80.0%'
    },
    remarks: 'All 1st floor rooms inspected. Sourav Mohanty absent without gatepass.',
    records: [
      { studentName: 'Rakesh Das', rollNumber: '01', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present', remarks: 'Verified by Warden' },
      { studentName: 'Amit Pattnaik', rollNumber: '03', roomNumber: '101', bedNumber: 'Bed 02', status: 'Present', remarks: 'Verified by Warden' },
      { studentName: 'Sourav Mohanty', rollNumber: '05', roomNumber: '102', bedNumber: 'Bed 01', status: 'Absent', remarks: 'Parent SMS queued' },
      { studentName: 'Debabrata Jena', rollNumber: '06', roomNumber: '102', bedNumber: 'Bed 02', status: 'Present', remarks: 'Verified by Warden' }
    ]
  },
  {
    id: 'ATT-20261026-BN2',
    hostelName: 'Bhabani Hostel-2',
    hostelCode: 'BN2',
    date: '2026-10-26',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Tanmaya Kumar Routray (Resident Warden)',
    submittedAt: '26 Oct 2026, 08:40 PM',
    verifiedByAdmin: true,
    status: 'Submitted to Hostel Admin',
    stats: {
      total: 4,
      present: 3,
      absent: 1,
      onLeave: 0,
      percentage: '75.0%'
    },
    remarks: 'Night roll call completed in wing A and B.',
    records: [
      { studentName: 'Bikash Rout', rollNumber: '08', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present', remarks: 'Verified' },
      { studentName: 'Manoj Tripathy', rollNumber: '09', roomNumber: '101', bedNumber: 'Bed 02', status: 'Present', remarks: 'Verified' },
      { studentName: 'Kishore Sethi', rollNumber: '11', roomNumber: '102', bedNumber: 'Bed 01', status: 'Present', remarks: 'Verified' },
      { studentName: 'Deepak Kumar Barik', rollNumber: '12', roomNumber: '102', bedNumber: 'Bed 02', status: 'Absent', remarks: 'Library pass overdue' }
    ]
  }
];

export const INITIAL_APPLICANTS = [
  {
    id: 'HAPP-2026-001',
    applicationNo: 'HAPP/2026/0142',
    studentName: 'Tanmaya Kumar Das',
    regNo: '2301105021',
    rollNo: '23CSE045',
    gender: 'Male',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 3',
    cgpa: '8.85',
    preferredHostel: 'Bhabani Hostel-1',
    allottedHostel: 'Bhabani Hostel-1',
    roomNo: '101',
    bedNo: 'Bed 01',
    phone: '+91 94380 12345',
    guardianName: 'Bhuban Mohan Das',
    guardianPhone: '+91 94370 54321',
    homeCity: 'Rourkela, Sundargarh',
    distanceKm: 340,
    status: 'Allotted',
    feeStatus: 'Paid (₹38,000)',
    appliedDate: '12-07-2026'
  },
  {
    id: 'HAPP-2026-002',
    applicationNo: 'HAPP/2026/0143',
    studentName: 'Smruti Ranjan Pradhan',
    regNo: '2301105089',
    rollNo: '23ME012',
    gender: 'Male',
    branch: 'Mechanical Engineering',
    semester: 'Semester 3',
    cgpa: '8.40',
    preferredHostel: 'Bhabani Hostel-2',
    allottedHostel: 'Bhabani Hostel-2',
    roomNo: '102',
    bedNo: 'Bed 01',
    phone: '+91 98610 99887',
    guardianName: 'Ramesh Pradhan',
    guardianPhone: '+91 94372 11009',
    homeCity: 'Berhampur, Ganjam',
    distanceKm: 180,
    status: 'Allotted',
    feeStatus: 'Paid (₹38,000)',
    appliedDate: '14-07-2026'
  },
  {
    id: 'HAPP-2026-003',
    applicationNo: 'HAPP/2026/0150',
    studentName: 'Subhasree Mohapatra',
    regNo: '2301105112',
    rollNo: '23IT033',
    gender: 'Female',
    branch: 'Information Technology',
    semester: 'Semester 3',
    cgpa: '9.10',
    preferredHostel: 'Sarojini Girls Residence',
    allottedHostel: 'Sarojini Girls Residence',
    roomNo: '201',
    bedNo: 'Bed 02',
    phone: '+91 97770 44556',
    guardianName: 'Ajay Mohapatra',
    guardianPhone: '+91 94371 88776',
    homeCity: 'Sambalpur',
    distanceKm: 310,
    status: 'Allotted',
    feeStatus: 'Paid (₹38,000)',
    appliedDate: '15-07-2026'
  },
  {
    id: 'HAPP-2026-004',
    applicationNo: 'HAPP/2026/0165',
    studentName: 'Priyadarshini Sutar',
    regNo: '2301105144',
    rollNo: '23ECE019',
    gender: 'Female',
    branch: 'Electronics & Communication',
    semester: 'Semester 3',
    cgpa: '8.70',
    preferredHostel: 'Sarojini Girls Residence',
    allottedHostel: 'Sarojini Girls Residence',
    roomNo: '202',
    bedNo: 'Bed 01',
    phone: '+91 99380 55667',
    guardianName: 'Rabindra Sutar',
    guardianPhone: '+91 94373 66554',
    homeCity: 'Balasore',
    distanceKm: 215,
    status: 'Allotted',
    feeStatus: 'Paid (₹38,000)',
    appliedDate: '18-07-2026'
  },
  {
    id: 'HAPP-2026-005',
    applicationNo: 'HAPP/2026/0178',
    studentName: 'Abhilash Mohanty',
    regNo: '2401105005',
    rollNo: '24CSE008',
    gender: 'Male',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 1',
    cgpa: '9.20',
    preferredHostel: 'Bhabani Hostel-1',
    allottedHostel: 'Under Verification',
    roomNo: 'Pending Allotment',
    bedNo: 'Pending Allotment',
    phone: '+91 98612 33445',
    guardianName: 'Santosh Mohanty',
    guardianPhone: '+91 94370 22331',
    homeCity: 'Jharsuguda',
    distanceKm: 380,
    status: 'Under Review',
    feeStatus: 'Challan Uploaded',
    appliedDate: '22-07-2026'
  },
  {
    id: 'HAPP-2026-006',
    applicationNo: 'HAPP/2026/0182',
    studentName: 'Chandan Kumar Mallick',
    regNo: '2401105018',
    rollNo: '24EE022',
    gender: 'Male',
    branch: 'Electrical Engineering',
    semester: 'Semester 1',
    cgpa: '8.10',
    preferredHostel: 'Bhabani Hostel-2',
    allottedHostel: 'Under Verification',
    roomNo: 'Pending Allotment',
    bedNo: 'Pending Allotment',
    phone: '+91 98613 66778',
    guardianName: 'Gopinath Mallick',
    guardianPhone: '+91 94370 77889',
    homeCity: 'Jeypore, Koraput',
    distanceKm: 520,
    status: 'Approved',
    feeStatus: 'Paid (₹38,000)',
    appliedDate: '24-07-2026'
  },
  {
    id: 'HAPP-2026-007',
    applicationNo: 'HAPP/2026/0191',
    studentName: 'Lipsa Tripathy',
    regNo: '2401105030',
    rollNo: '24CSE065',
    gender: 'Female',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 1',
    cgpa: '8.90',
    preferredHostel: 'Sarojini Girls Residence',
    allottedHostel: 'Waiting List #03',
    roomNo: 'Waiting List',
    bedNo: 'Waiting List',
    phone: '+91 97772 11223',
    guardianName: 'Niranjan Tripathy',
    guardianPhone: '+91 94371 44556',
    homeCity: 'Baripada, Mayurbhanj',
    distanceKm: 270,
    status: 'Waitlisted',
    feeStatus: 'Pending',
    appliedDate: '25-07-2026'
  }
];

// Helper: safe local storage load
function getStoredJson(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStoredJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// ── 1. HOSTELS MANAGEMENT (IMAGE 2) ──
export function getAllHostels() {
  return getStoredJson(HOSTELS_STORAGE_KEY, INITIAL_HOSTELS);
}

export function saveHostel(hostelData) {
  const current = getAllHostels();
  const exists = current.find(h => h.code?.toLowerCase() === hostelData.code?.toLowerCase());
  let updated;
  if (exists) {
    updated = current.map(h => (h.code?.toLowerCase() === hostelData.code?.toLowerCase() ? { ...h, ...hostelData } : h));
  } else {
    const newHostel = {
      id: `hst-${Date.now()}`,
      name: hostelData.name,
      code: hostelData.code.toUpperCase(),
      totalBeds: Number(hostelData.totalBeds) || 0,
      bedRooms: hostelData.bedRooms || {
        11: '(not set)',
        10: '(not set)',
        9: '(not set)',
        8: '(not set)',
        7: '(not set)',
        6: '(not set)',
        5: '(not set)',
        4: '(not set)',
        3: '(not set)',
        2: '(not set)',
        1: '(not set)'
      },
      warden: hostelData.warden || 'Mr. Tanmaya Kumar Routray',
      contact: hostelData.contact || '+91 94370 00000',
      type: hostelData.type || 'Boys',
      floors: hostelData.floors || 3,
      status: 'Active'
    };
    updated = [newHostel, ...current];
  }
  setStoredJson(HOSTELS_STORAGE_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_hostels_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  }
  return updated;
}

export function deleteHostel(hostelId) {
  const current = getAllHostels();
  const updated = current.filter(h => h.id !== hostelId && h.code !== hostelId);
  setStoredJson(HOSTELS_STORAGE_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_hostels_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  }
  return updated;
}

// ── 2. STUDENT ROSTER & ATTENDANCE ──
export function getStudentsRoster(hostelName = 'ALL') {
  if (!hostelName || hostelName === 'ALL') {
    return INITIAL_STUDENTS_ROSTER;
  }
  return INITIAL_STUDENTS_ROSTER.filter(s =>
    s.hostelName?.toLowerCase().includes(hostelName.toLowerCase()) ||
    s.hostelCode?.toLowerCase() === hostelName.toLowerCase()
  );
}

export function getSubmittedAttendances() {
  return getStoredJson(ATTENDANCE_STORAGE_KEY, INITIAL_ATTENDANCE_SUBMISSIONS);
}

export function getLatestSubmittedAttendance(hostelName = null) {
  const all = getSubmittedAttendances();
  if (!hostelName || hostelName === 'ALL') {
    return all[0] || null;
  }
  return all.find(a =>
    a.hostelName?.toLowerCase().includes(hostelName.toLowerCase()) ||
    a.hostelCode?.toLowerCase() === hostelName.toLowerCase()
  ) || null;
}

/**
 * Submit attendance from Warden - immediately synchronizes and dispatches to Hostel Admin
 */
export function submitHostelAttendance({
  hostelName,
  hostelCode,
  date,
  session,
  submittedBy,
  records = [],
  remarks = ''
}) {
  const current = getSubmittedAttendances();

  const total = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.filter(r => r.status === 'Absent').length;
  const onLeave = records.filter(r => r.status === 'On Leave').length;
  const percentage = total > 0 ? `${((present / total) * 100).toFixed(1)}%` : '0%';

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const newSubmission = {
    id: `ATT-${Date.now()}`,
    hostelName: hostelName || 'Bhabani Hostel-1',
    hostelCode: hostelCode || 'BN1',
    date: date || new Date().toISOString().split('T')[0],
    session: session || 'Night Roll Call (08:30 PM)',
    submittedBy: submittedBy || 'Mr. Rajesh Jena (Resident Warden)',
    submittedAt: `${dateFormatted}, ${timeFormatted}`,
    verifiedByAdmin: true,
    status: 'Submitted to Hostel Admin',
    stats: {
      total,
      present,
      absent,
      onLeave,
      percentage
    },
    remarks: remarks || 'Roll call taken and verified by Warden.',
    records
  };

  const updated = [newSubmission, ...current];
  setStoredJson(ATTENDANCE_STORAGE_KEY, updated);

  // Broadcast in real-time to Hostel Admin view
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('bput_hostel_attendance_submitted', { detail: newSubmission })
    );
    window.dispatchEvent(new Event('storage'));
  }

  return newSubmission;
}

// ── 3. APPLICANT DETAILS ──
export function getAllApplicants() {
  return getStoredJson(APPLICANTS_STORAGE_KEY, INITIAL_APPLICANTS);
}

export function updateApplicantStatus(applicantId, newStatus, remarks = '') {
  const current = getAllApplicants();
  const updated = current.map(app => {
    if (app.id === applicantId || app.applicationNo === applicantId) {
      return {
        ...app,
        status: newStatus,
        remarks: remarks || app.remarks,
        updatedAt: new Date().toISOString()
      };
    }
    return app;
  });
  setStoredJson(APPLICANTS_STORAGE_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_applicants_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  }
  return updated;
}

export function allotBedToApplicant(applicantId, hostelName, roomNo, bedNo) {
  const current = getAllApplicants();
  const updated = current.map(app => {
    if (app.id === applicantId || app.applicationNo === applicantId) {
      return {
        ...app,
        status: 'Allotted',
        allottedHostel: hostelName,
        roomNo: roomNo,
        bedNo: bedNo,
        allottedAt: new Date().toISOString()
      };
    }
    return app;
  });
  setStoredJson(APPLICANTS_STORAGE_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_applicants_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  }
  return updated;
}
