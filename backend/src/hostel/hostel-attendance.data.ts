export interface StudentAttendanceRecord {
  id: string;
  regNo: string;
  rollNumber: string;
  studentName: string;
  roomNumber: string;
  bedNumber: string;
  floor: string;
  department: string;
  semester: string;
  status: 'Present' | 'Absent' | 'On Leave';
  contactNumber?: string;
  phone?: string;
  parentPhone?: string;
  remarks?: string;
}

export interface HostelAttendanceSubmission {
  id: string;
  hostelName: string;
  hostelCode: string;
  date: string;
  session: string;
  submittedBy: string;
  submittedAt: string;
  verifiedByAdmin: boolean;
  updatedByAdmin?: boolean;
  adminNotes?: string;
  status: string;
  stats: {
    total: number;
    present: number;
    absent: number;
    onLeave: number;
    percentage: string;
  };
  remarks: string;
  records: StudentAttendanceRecord[];
}

// Complete student roster per hostel
export const HOSTEL_STUDENTS_ROSTER: Record<string, StudentAttendanceRecord[]> = {
  'Bhabani Hostel-1': [
    {
      id: 'bn1-01',
      regNo: '2305201001',
      rollNumber: '01',
      studentName: 'Rakesh Das',
      roomNumber: '101',
      bedNumber: 'Bed 01',
      floor: '1st Floor',
      department: 'Computer Science & Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 11223',
      parentPhone: '+91 94370 99887',
      remarks: 'Verified by Warden',
    },
    {
      id: 'bn1-02',
      regNo: '2305201003',
      rollNumber: '03',
      studentName: 'Amit Pattnaik',
      roomNumber: '101',
      bedNumber: 'Bed 02',
      floor: '1st Floor',
      department: 'Electronics & Comm. Engg',
      semester: '5th Sem',
      status: 'Absent',
      contactNumber: '+91 98610 33445',
      parentPhone: '+91 94370 77665',
      remarks: 'Unreported absence',
    },
    {
      id: 'bn1-03',
      regNo: '2305201005',
      rollNumber: '05',
      studentName: 'Sourav Mohanty',
      roomNumber: '102',
      bedNumber: 'Bed 01',
      floor: '1st Floor',
      department: 'Electrical Engineering',
      semester: '5th Sem',
      status: 'Absent',
      contactNumber: '+91 98610 55667',
      parentPhone: '+91 94370 55443',
      remarks: 'Late library practicals unconfirmed',
    },
    {
      id: 'bn1-04',
      regNo: '2305201006',
      rollNumber: '06',
      studentName: 'Debabrata Jena',
      roomNumber: '102',
      bedNumber: 'Bed 02',
      floor: '1st Floor',
      department: 'Mechanical Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 66778',
      parentPhone: '+91 94370 44332',
      remarks: 'Verified by Warden',
    },
    {
      id: 'bn1-05',
      regNo: '2305201007',
      rollNumber: '07',
      studentName: 'Manoj Kumar Panda',
      roomNumber: '103',
      bedNumber: 'Bed 01',
      floor: '1st Floor',
      department: 'Mechanical Engineering',
      semester: '5th Sem',
      status: 'On Leave',
      contactNumber: '+91 98610 77889',
      parentPhone: '+91 94370 33221',
      remarks: 'Approved medical outstation leave LV-901',
    },
  ],
  'Gandhi Boys Residence': [
    {
      id: 'gbr-01',
      regNo: '2305201015',
      rollNumber: '15',
      studentName: 'Pritam Samal',
      roomNumber: 'A-101',
      bedNumber: 'Bed 01',
      floor: 'Ground Floor',
      department: 'Computer Science & Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 22331',
      parentPhone: '+91 94370 88771',
      remarks: 'Verified by Chief Warden',
    },
    {
      id: 'gbr-02',
      regNo: '2305201016',
      rollNumber: '16',
      studentName: 'Rohan Tripathy',
      roomNumber: 'A-101',
      bedNumber: 'Bed 02',
      floor: 'Ground Floor',
      department: 'Computer Science & Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 22332',
      parentPhone: '+91 94370 88772',
      remarks: 'Verified by Chief Warden',
    },
    {
      id: 'gbr-03',
      regNo: '2305201017',
      rollNumber: '17',
      studentName: 'Subhasis Nayak',
      roomNumber: 'A-102',
      bedNumber: 'Bed 01',
      floor: 'Ground Floor',
      department: 'Information Technology',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 22333',
      parentPhone: '+91 94370 88773',
      remarks: 'Verified by Chief Warden',
    },
    {
      id: 'gbr-04',
      regNo: '2305201018',
      rollNumber: '18',
      studentName: 'Bhabani Sankar Mishra',
      roomNumber: 'A-102',
      bedNumber: 'Bed 02',
      floor: 'Ground Floor',
      department: 'Civil Engineering',
      semester: '5th Sem',
      status: 'Absent',
      contactNumber: '+91 98610 22334',
      parentPhone: '+91 94370 88774',
      remarks: 'Curfew violation - Parent notified',
    },
  ],
  'Sarojini Girls Residence': [
    {
      id: 'sgr-01',
      regNo: '2305201021',
      rollNumber: '21',
      studentName: 'Ananya Mishra',
      roomNumber: 'W-101',
      bedNumber: 'Bed 01',
      floor: '1st Floor',
      department: 'Computer Science & Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 33441',
      parentPhone: '+91 94370 77661',
      remarks: 'Verified by Warden',
    },
    {
      id: 'sgr-02',
      regNo: '2305201022',
      rollNumber: '22',
      studentName: 'Sneha Priyadarshini',
      roomNumber: 'W-101',
      bedNumber: 'Bed 02',
      floor: '1st Floor',
      department: 'Electronics & Communication',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 33442',
      parentPhone: '+91 94370 77662',
      remarks: 'Verified by Warden',
    },
    {
      id: 'sgr-03',
      regNo: '2305201023',
      rollNumber: '23',
      studentName: 'Pooja Rani Senapati',
      roomNumber: 'W-102',
      bedNumber: 'Bed 01',
      floor: '1st Floor',
      department: 'Information Technology',
      semester: '5th Sem',
      status: 'On Leave',
      contactNumber: '+91 98610 33443',
      parentPhone: '+91 94370 77663',
      remarks: 'Approved home visit pass GP-341',
    },
    {
      id: 'sgr-04',
      regNo: '2305201024',
      rollNumber: '24',
      studentName: 'Madhumita Sahu',
      roomNumber: 'W-102',
      bedNumber: 'Bed 02',
      floor: '1st Floor',
      department: 'Computer Science & Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 33444',
      parentPhone: '+91 94370 77664',
      remarks: 'Verified by Warden',
    },
  ],
  'Bhabani Hostel-2': [
    {
      id: 'bn2-01',
      regNo: '2305201008',
      rollNumber: '08',
      studentName: 'Bikash Rout',
      roomNumber: '101',
      bedNumber: 'Bed 01',
      floor: '1st Floor',
      department: 'Civil Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 88990',
      parentPhone: '+91 94370 22110',
      remarks: 'Verified by Warden',
    },
    {
      id: 'bn2-02',
      regNo: '2305201009',
      rollNumber: '09',
      studentName: 'Manoj Tripathy',
      roomNumber: '101',
      bedNumber: 'Bed 02',
      floor: '1st Floor',
      department: 'Computer Science & Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98610 99001',
      parentPhone: '+91 94370 11009',
      remarks: 'Verified by Warden',
    },
    {
      id: 'bn2-03',
      regNo: '2305201011',
      rollNumber: '11',
      studentName: 'Kishore Sethi',
      roomNumber: '102',
      bedNumber: 'Bed 01',
      floor: '1st Floor',
      department: 'Mechanical Engineering',
      semester: '5th Sem',
      status: 'Present',
      contactNumber: '+91 98611 11223',
      parentPhone: '+91 94371 99887',
      remarks: 'Verified by Warden',
    },
    {
      id: 'bn2-04',
      regNo: '2305201012',
      rollNumber: '12',
      studentName: 'Deepak Kumar Barik',
      roomNumber: '102',
      bedNumber: 'Bed 02',
      floor: '1st Floor',
      department: 'Information Technology',
      semester: '5th Sem',
      status: 'Absent',
      contactNumber: '+91 98611 22334',
      parentPhone: '+91 94371 88776',
      remarks: 'Unreported absence',
    },
  ],
};

// Seed historical attendance submissions across dates and hostels
const initialAttendanceSubmissions: HostelAttendanceSubmission[] = [
  // 30 Oct 2026
  {
    id: 'att-20261030-bn1',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    date: '2026-10-30',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mrs. Nibedita Das (Hostel Warden)',
    submittedAt: '30 Oct 2026, 08:45 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 5, present: 3, absent: 1, onLeave: 1, percentage: '60.0%' },
    remarks: 'Night roll call completed. 1 absent without valid outstation pass.',
    records: HOSTEL_STUDENTS_ROSTER['Bhabani Hostel-1'],
  },
  {
    id: 'att-20261030-gbr',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GBR',
    date: '2026-10-30',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Rajesh Jena (Chief Resident Warden)',
    submittedAt: '30 Oct 2026, 08:42 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 3, absent: 1, onLeave: 0, percentage: '75.0%' },
    remarks: 'Curfew roll call complete. 1 absent border notified.',
    records: HOSTEL_STUDENTS_ROSTER['Gandhi Boys Residence'],
  },
  {
    id: 'att-20261030-sgr',
    hostelName: 'Sarojini Girls Residence',
    hostelCode: 'SG1',
    date: '2026-10-30',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Dr. Swapna Patra (Resident Warden)',
    submittedAt: '30 Oct 2026, 08:35 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 3, absent: 0, onLeave: 1, percentage: '75.0%' },
    remarks: 'All present except 1 approved home leave.',
    records: HOSTEL_STUDENTS_ROSTER['Sarojini Girls Residence'],
  },
  {
    id: 'att-20261030-bn2',
    hostelName: 'Bhabani Hostel-2',
    hostelCode: 'BN2',
    date: '2026-10-30',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Tanmaya Kumar Routray (Hostel Supervisor)',
    submittedAt: '30 Oct 2026, 08:40 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 3, absent: 1, onLeave: 0, percentage: '75.0%' },
    remarks: 'Night roll call recorded.',
    records: HOSTEL_STUDENTS_ROSTER['Bhabani Hostel-2'],
  },

  // 29 Oct 2026
  {
    id: 'att-20261029-bn1',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    date: '2026-10-29',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mrs. Nibedita Das (Hostel Warden)',
    submittedAt: '29 Oct 2026, 08:38 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 5, present: 4, absent: 1, onLeave: 0, percentage: '80.0%' },
    remarks: 'Regular roll call completed.',
    records: HOSTEL_STUDENTS_ROSTER['Bhabani Hostel-1'],
  },
  {
    id: 'att-20261029-gbr',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GBR',
    date: '2026-10-29',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Rajesh Jena (Chief Resident Warden)',
    submittedAt: '29 Oct 2026, 08:40 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 4, absent: 0, onLeave: 0, percentage: '100.0%' },
    remarks: 'Routine inspection complete. All residents present.',
    records: HOSTEL_STUDENTS_ROSTER['Gandhi Boys Residence'].map((r) => ({ ...r, status: 'Present' as const })),
  },
  {
    id: 'att-20261029-sgr',
    hostelName: 'Sarojini Girls Residence',
    hostelCode: 'SG1',
    date: '2026-10-29',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mrs. Nibedita Das (Resident Warden)',
    submittedAt: '29 Oct 2026, 08:30 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 4, absent: 0, onLeave: 0, percentage: '100.0%' },
    remarks: 'All students present in rooms.',
    records: HOSTEL_STUDENTS_ROSTER['Sarojini Girls Residence'].map((r) => ({ ...r, status: 'Present' as const })),
  },

  // 28 Oct 2026
  {
    id: 'att-20261028-bn1',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mrs. Nibedita Das (Resident Warden)',
    submittedAt: '28 Oct 2026, 05:17 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 5, present: 3, absent: 2, onLeave: 0, percentage: '60.0%' },
    remarks: 'Night roll call verified.',
    records: HOSTEL_STUDENTS_ROSTER['Bhabani Hostel-1'],
  },
  {
    id: 'att-20261028-bn2',
    hostelName: 'Bhabani Hostel-2',
    hostelCode: 'BN2',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Tanmaya Kumar Routray (Resident Warden)',
    submittedAt: '28 Oct 2026, 08:30 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 3, absent: 1, onLeave: 0, percentage: '75.0%' },
    remarks: 'Night roll call verified.',
    records: HOSTEL_STUDENTS_ROSTER['Bhabani Hostel-2'],
  },
  {
    id: 'att-20261028-gbr',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GBR',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Rajesh Jena (Chief Resident Warden)',
    submittedAt: '28 Oct 2026, 08:45 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 4, absent: 0, onLeave: 0, percentage: '100.0%' },
    remarks: 'All residents present.',
    records: HOSTEL_STUDENTS_ROSTER['Gandhi Boys Residence'].map((r) => ({ ...r, status: 'Present' as const })),
  },
  {
    id: 'att-20261028-sgr',
    hostelName: 'Sarojini Girls Residence',
    hostelCode: 'SG1',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Dr. Swapna Patra (Resident Warden)',
    submittedAt: '28 Oct 2026, 08:30 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 4, absent: 0, onLeave: 0, percentage: '100.0%' },
    remarks: 'Night roll call completed.',
    records: HOSTEL_STUDENTS_ROSTER['Sarojini Girls Residence'].map((r) => ({ ...r, status: 'Present' as const })),
  },

  // 27 Oct 2026
  {
    id: 'att-20261027-bn1',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    date: '2026-10-27',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mrs. Nibedita Das (Hostel Warden)',
    submittedAt: '27 Oct 2026, 08:30 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 5, present: 4, absent: 1, onLeave: 0, percentage: '80.0%' },
    remarks: 'Attendance synchronized.',
    records: HOSTEL_STUDENTS_ROSTER['Bhabani Hostel-1'],
  },
  {
    id: 'att-20261027-gbr',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GBR',
    date: '2026-10-27',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Rajesh Jena (Chief Resident Warden)',
    submittedAt: '27 Oct 2026, 08:35 PM',
    verifiedByAdmin: true,
    status: 'Verified & Locked',
    stats: { total: 4, present: 4, absent: 0, onLeave: 0, percentage: '100.0%' },
    remarks: 'Night inspection complete.',
    records: HOSTEL_STUDENTS_ROSTER['Gandhi Boys Residence'].map((r) => ({ ...r, status: 'Present' as const })),
  },
];

let attendanceSubmissionsCache: HostelAttendanceSubmission[] = [...initialAttendanceSubmissions];

export function getSubmittedHostelAttendances(filters?: {
  hostel?: string;
  date?: string;
  session?: string;
}): HostelAttendanceSubmission[] {
  let result = [...attendanceSubmissionsCache];

  if (filters?.hostel && filters.hostel !== 'ALL') {
    result = result.filter(
      (a) =>
        a.hostelName.toLowerCase() === filters.hostel!.toLowerCase() ||
        a.hostelName.toLowerCase().includes(filters.hostel!.toLowerCase()) ||
        a.hostelCode.toLowerCase() === filters.hostel!.toLowerCase()
    );
  }

  if (filters?.date && filters.date !== 'ALL') {
    result = result.filter((a) => a.date === filters.date);
  }

  if (filters?.session && filters.session !== 'ALL') {
    result = result.filter((a) => a.session === filters.session);
  }

  // If the admin chose a specific hostel and date with no prior submission, auto-generate on demand
  if (filters?.hostel && filters.hostel !== 'ALL' && filters?.date && filters.date !== 'ALL' && result.length === 0) {
    const targetHostel = filters.hostel;
    const roster = getHostelStudentRoster(targetHostel);
    if (roster && roster.length > 0) {
      const generated: HostelAttendanceSubmission = {
        id: `att-gen-${targetHostel.replace(/\s+/g, '-').toLowerCase()}-${filters.date}`,
        hostelName: targetHostel,
        hostelCode: targetHostel.substring(0, 3).toUpperCase(),
        date: filters.date,
        session: filters.session && filters.session !== 'ALL' ? filters.session : 'Night Roll Call (08:30 PM)',
        submittedBy: 'Hostel System (Roster Synchronized)',
        submittedAt: `${filters.date}, 08:30 PM (Scheduled)`,
        verifiedByAdmin: true,
        status: 'Scheduled / Daily Roster Generated',
        stats: {
          total: roster.length,
          present: roster.length,
          absent: 0,
          onLeave: 0,
          percentage: '100.0%',
        },
        remarks: `Official attendance sheet for ${targetHostel} on ${filters.date}.`,
        records: roster.map((r) => ({ ...r, status: 'Present' as const })),
      };
      attendanceSubmissionsCache.unshift(generated);
      return [generated];
    }
  }

  return result;
}

export function getHostelAttendanceById(id: string): HostelAttendanceSubmission | undefined {
  return attendanceSubmissionsCache.find((a) => a.id === id);
}

export function submitHostelAttendanceRecord(
  payload: any,
  user: any
): HostelAttendanceSubmission {
  const rawRecords: any[] = payload.records || [];
  const records: StudentAttendanceRecord[] = rawRecords.map((r, i) => {
    const rollInt = parseInt(r.rollNumber, 10) || (i + 1);
    const fallbackPhone = `+91 9861${String(10 + (rollInt % 80)).padStart(2, '0')} ${String(10000 + rollInt * 1111).slice(-5)}`;
    const studentPhone = r.phone || r.contactNumber || fallbackPhone;
    return {
      ...r,
      phone: studentPhone,
      contactNumber: studentPhone,
      parentPhone: r.parentPhone || r.guardianPhone || '+91 94370 99887'
    };
  });
  const total = records.length;
  const present = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const onLeave = records.filter((r) => r.status === 'On Leave').length;
  const percentage = total > 0 ? `${((present / total) * 100).toFixed(1)}%` : '0%';

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const hostelName = payload.hostelName || 'Bhabani Hostel-1';
  const hostelCode = payload.hostelCode || 'BN1';
  const date = payload.date || now.toISOString().split('T')[0];
  const session = payload.session || 'Night Roll Call (08:30 PM)';

  const existingIdx = attendanceSubmissionsCache.findIndex(
    (a) =>
      (payload.id && a.id === payload.id) ||
      (a.hostelName.toLowerCase() === hostelName.toLowerCase() &&
        a.date === date &&
        a.session === session)
  );

  const isAdmin = user?.role === 'hostel_admin' || user?.role === 'admin' || user?.role === 'super_admin';

  const newRecord: HostelAttendanceSubmission = {
    id: payload.id || `att-hst-${Date.now()}`,
    hostelName,
    hostelCode,
    date,
    session,
    submittedBy: user?.name
      ? `${user.name} (${isAdmin ? 'Hostel Admin' : 'Hostel Warden'})`
      : payload.submittedBy || 'Hostel Staff',
    submittedAt: `${dateFormatted}, ${timeFormatted}`,
    verifiedByAdmin: isAdmin || Boolean(payload.verifiedByAdmin),
    updatedByAdmin: isAdmin || Boolean(payload.updatedByAdmin),
    adminNotes: payload.adminNotes || '',
    status: payload.status || (isAdmin ? 'Verified & Authorized by Admin' : 'Submitted to Hostel Admin'),
    stats: {
      total,
      present,
      absent,
      onLeave,
      percentage,
    },
    remarks:
      payload.remarks ||
      (isAdmin
        ? 'Attendance verified and updated by Hostel Admin.'
        : 'Roll call taken and submitted by Warden.'),
    records,
  };

  if (existingIdx >= 0) {
    attendanceSubmissionsCache[existingIdx] = {
      ...attendanceSubmissionsCache[existingIdx],
      ...newRecord,
      id: attendanceSubmissionsCache[existingIdx].id,
      submittedAt: `${dateFormatted}, ${timeFormatted} (Updated)`,
    };
    return attendanceSubmissionsCache[existingIdx];
  } else {
    attendanceSubmissionsCache.unshift(newRecord);
    return newRecord;
  }
}

export function getHostelStudentRoster(hostelName: string): StudentAttendanceRecord[] {
  let targetList: StudentAttendanceRecord[] = HOSTEL_STUDENTS_ROSTER['Bhabani Hostel-1'] || [];
  if (hostelName && hostelName !== 'ALL') {
    const clean = hostelName.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
    for (const [key, list] of Object.entries(HOSTEL_STUDENTS_ROSTER)) {
      const cleanKey = key.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
      if (cleanKey.includes(clean) || clean.includes(cleanKey)) {
        targetList = list;
        break;
      }
    }
    if (targetList === HOSTEL_STUDENTS_ROSTER['Bhabani Hostel-1'] && clean.includes('kalam')) {
      targetList = HOSTEL_STUDENTS_ROSTER['Gandhi Boys Residence'] || targetList;
    }
  }

  return targetList.map((r, i) => {
    const rollInt = parseInt(r.rollNumber, 10) || (i + 1);
    const fallbackPhone = `+91 9861${String(10 + (rollInt % 80)).padStart(2, '0')} ${String(10000 + rollInt * 1111).slice(-5)}`;
    const studentPhone = r.phone || r.contactNumber || fallbackPhone;
    return {
      ...r,
      phone: studentPhone,
      contactNumber: studentPhone,
      parentPhone: r.parentPhone || '+91 94370 99887'
    };
  });
}
