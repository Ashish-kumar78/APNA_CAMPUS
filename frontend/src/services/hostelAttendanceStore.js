import { updateStudentsHostelAttendanceDate } from './studentStore.js';
// Hostel Attendance, Applicants & Hostels Management Store
// Synchronizes real-time attendance submissions between Warden and Hostel Admin

import api from './api.js';
import { saveHostelComplex, deleteHostelComplex } from './hostelComplexStore.js';

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
  },
  {
    id: 'std-13',
    studentName: 'Tanmaya Kumar Das',
    rollNumber: '13',
    regNo: '2305201013',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GB1',
    roomNumber: '101',
    bedNumber: 'Bed 01',
    department: 'Computer Science & Engineering',
    semester: '5th Sem',
    phone: '+91 98612 11223',
    parentPhone: '+91 94372 99887',
    gender: 'Male',
    status: 'Present',
    remarks: 'Regular attendance'
  },
  {
    id: 'std-14',
    studentName: 'Smruti Ranjan Pradhan',
    rollNumber: '14',
    regNo: '2305201014',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GB1',
    roomNumber: '101',
    bedNumber: 'Bed 02',
    department: 'Mechanical Engineering',
    semester: '5th Sem',
    phone: '+91 98612 22334',
    parentPhone: '+91 94372 88776',
    gender: 'Male',
    status: 'Present',
    remarks: 'Verified'
  },
  {
    id: 'std-15',
    studentName: 'Ashutosh Sahu',
    rollNumber: '15',
    regNo: '2305201015',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GB1',
    roomNumber: '102',
    bedNumber: 'Bed 01',
    department: 'Electrical Engineering',
    semester: '5th Sem',
    phone: '+91 98612 33445',
    parentPhone: '+91 94372 77665',
    gender: 'Male',
    status: 'Absent',
    remarks: 'Absent without gate pass'
  },
  {
    id: 'std-16',
    studentName: 'Jyoti Prakash Swain',
    rollNumber: '16',
    regNo: '2305201016',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GB1',
    roomNumber: '102',
    bedNumber: 'Bed 02',
    department: 'Civil Engineering',
    semester: '5th Sem',
    phone: '+91 98612 44556',
    parentPhone: '+91 94372 66554',
    gender: 'Male',
    status: 'Present',
    remarks: 'Verified'
  },
  {
    id: 'std-17',
    studentName: 'Chandan Kumar Mallick',
    rollNumber: '17',
    regNo: '2305201017',
    hostelName: 'Kalam Boys Residence',
    hostelCode: 'KB1',
    roomNumber: '101',
    bedNumber: 'Bed 01',
    department: 'Electrical Engineering',
    semester: '3rd Sem',
    phone: '+91 98613 55667',
    parentPhone: '+91 94373 55443',
    gender: 'Male',
    status: 'Present',
    remarks: 'Regular attendance'
  },
  {
    id: 'std-18',
    studentName: 'Sambit Mohapatra',
    rollNumber: '18',
    regNo: '2305201018',
    hostelName: 'Kalam Boys Residence',
    hostelCode: 'KB1',
    roomNumber: '101',
    bedNumber: 'Bed 02',
    department: 'Computer Science & Engineering',
    semester: '3rd Sem',
    phone: '+91 98613 66778',
    parentPhone: '+91 94373 44332',
    gender: 'Male',
    status: 'Present',
    remarks: 'Verified'
  },
  {
    id: 'std-19',
    studentName: 'Rajesh Kumar Baral',
    rollNumber: '19',
    regNo: '2305201019',
    hostelName: 'Kalam Boys Residence',
    hostelCode: 'KB1',
    roomNumber: '102',
    bedNumber: 'Bed 01',
    department: 'Information Technology',
    semester: '3rd Sem',
    phone: '+91 98613 77889',
    parentPhone: '+91 94373 33221',
    gender: 'Male',
    status: 'Absent',
    remarks: 'Unreported night curfew absence'
  },
  {
    id: 'std-20',
    studentName: 'Pragyan Priyadarshi',
    rollNumber: '20',
    regNo: '2305201020',
    hostelName: 'Kalam Boys Residence',
    hostelCode: 'KB1',
    roomNumber: '102',
    bedNumber: 'Bed 02',
    department: 'Electronics & Comm. Engg',
    semester: '3rd Sem',
    phone: '+91 98613 88990',
    parentPhone: '+91 94373 22110',
    gender: 'Male',
    status: 'On Leave',
    remarks: 'Approved weekend home pass #HP-2026-45'
  }
];

export const INITIAL_ATTENDANCE_SUBMISSIONS = [
  {
    id: 'ATT-20261028-BN1',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mrs. Nibedita Das (Resident Warden)',
    submittedAt: '28 Oct 2026, 05:17 PM (Updated)',
    verifiedByAdmin: true,
    status: 'Submitted to Hostel Admin',
    stats: {
      total: 4,
      present: 2,
      absent: 2,
      onLeave: 0,
      percentage: '50.0%'
    },
    remarks: 'Night roll call verified. 2 students absent (Amit Pattnaik & Sourav Mohanty).',
    records: [
      { studentName: 'Rakesh Das', rollNumber: '01', regNo: '2305201001', department: 'Computer Science & Engineering', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98610 11223', parentPhone: '+91 94370 99887', remarks: 'Verified by Warden' },
      { studentName: 'Amit Pattnaik', rollNumber: '03', regNo: '2305201003', department: 'Electronics & Comm. Engg', roomNumber: '101', bedNumber: 'Bed 02', status: 'Absent', phone: '+91 98610 33445', parentPhone: '+91 94370 77665', remarks: 'Verified by Warden' },
      { studentName: 'Sourav Mohanty', rollNumber: '05', regNo: '2305201005', department: 'Electrical Engineering', roomNumber: '102', bedNumber: 'Bed 01', status: 'Absent', phone: '+91 98610 55667', parentPhone: '+91 94370 55443', remarks: 'Unreported absence' },
      { studentName: 'Debabrata Jena', rollNumber: '06', regNo: '2305201006', department: 'Mechanical Engineering', roomNumber: '102', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98610 66778', parentPhone: '+91 94370 44332', remarks: 'Verified by Warden' }
    ]
  },
  {
    id: 'ATT-20261028-BN2',
    hostelName: 'Bhabani Hostel-2',
    hostelCode: 'BN2',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Tanmaya Kumar Routray (Resident Warden)',
    submittedAt: '28 Oct 2026, 08:30 PM (Updated)',
    verifiedByAdmin: true,
    status: 'Submitted to Hostel Admin',
    stats: {
      total: 4,
      present: 3,
      absent: 1,
      onLeave: 0,
      percentage: '75.0%'
    },
    remarks: 'Night roll call verified. Deepak Kumar Barik absent.',
    records: [
      { studentName: 'Bikash Rout', rollNumber: '08', regNo: '2305201008', department: 'Civil Engineering', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98610 88990', parentPhone: '+91 94370 22110', remarks: 'Verified by Warden' },
      { studentName: 'Manoj Tripathy', rollNumber: '09', regNo: '2305201009', department: 'Computer Science & Engineering', roomNumber: '101', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98610 99001', parentPhone: '+91 94370 11009', remarks: 'Verified by Warden' },
      { studentName: 'Kishore Sethi', rollNumber: '11', regNo: '2305201011', department: 'Mechanical Engineering', roomNumber: '102', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98611 11223', parentPhone: '+91 94371 99887', remarks: 'Verified by Warden' },
      { studentName: 'Deepak Kumar Barik', rollNumber: '12', regNo: '2305201012', department: 'Information Technology', roomNumber: '102', bedNumber: 'Bed 02', status: 'Absent', phone: '+91 98611 22334', parentPhone: '+91 94371 88776', remarks: 'Overdue library pass' }
    ]
  },
  {
    id: 'ATT-20261028-SG1',
    hostelName: 'Sarojini Girls Residence',
    hostelCode: 'SG1',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Dr. Smita Mishra (Resident Warden)',
    submittedAt: '28 Oct 2026, 08:35 PM (Verified)',
    verifiedByAdmin: true,
    status: 'Submitted to Hostel Admin',
    stats: {
      total: 4,
      present: 3,
      absent: 0,
      onLeave: 1,
      percentage: '75.0%'
    },
    remarks: 'Girls residence night inspection completed. 1 boarder on approved medical leave.',
    records: [
      { studentName: 'Priya Nayak', rollNumber: '02', regNo: '2305201002', department: 'Computer Science & Engineering', roomNumber: '201', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98610 22334', parentPhone: '+91 94370 88776', remarks: 'Verified by Warden' },
      { studentName: 'Subhashree Sahoo', rollNumber: '04', regNo: '2305201004', department: 'Information Technology', roomNumber: '201', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98610 44556', parentPhone: '+91 94370 66554', remarks: 'Verified by Warden' },
      { studentName: 'Ananya Panda', rollNumber: '07', regNo: '2305201007', department: 'Computer Science & Engineering', roomNumber: '202', bedNumber: 'Bed 01', status: 'On Leave', phone: '+91 98610 77889', parentPhone: '+91 94370 33221', remarks: 'Approved medical gate pass #GP-2026-88' },
      { studentName: 'Sasmita Behera', rollNumber: '10', regNo: '2305201010', department: 'Electrical & Electronics Engg', roomNumber: '202', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98610 00112', parentPhone: '+91 94370 00998', remarks: 'Verified by Warden' }
    ]
  },
  {
    id: 'ATT-20261028-GB1',
    hostelName: 'Gandhi Boys Residence',
    hostelCode: 'GB1',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Rajesh Jena (Resident Warden)',
    submittedAt: '28 Oct 2026, 08:25 PM (Verified)',
    verifiedByAdmin: true,
    status: 'Submitted to Hostel Admin',
    stats: {
      total: 4,
      present: 3,
      absent: 1,
      onLeave: 0,
      percentage: '75.0%'
    },
    remarks: 'Gandhi residence roll call completed. Ashutosh Sahu absent.',
    records: [
      { studentName: 'Tanmaya Kumar Das', rollNumber: '13', regNo: '2305201013', department: 'Computer Science & Engineering', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98612 11223', parentPhone: '+91 94372 99887', remarks: 'Regular attendance' },
      { studentName: 'Smruti Ranjan Pradhan', rollNumber: '14', regNo: '2305201014', department: 'Mechanical Engineering', roomNumber: '101', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98612 22334', parentPhone: '+91 94372 88776', remarks: 'Verified by Warden' },
      { studentName: 'Ashutosh Sahu', rollNumber: '15', regNo: '2305201015', department: 'Electrical Engineering', roomNumber: '102', bedNumber: 'Bed 01', status: 'Absent', phone: '+91 98612 33445', parentPhone: '+91 94372 77665', remarks: 'Parent notification sent' },
      { studentName: 'Jyoti Prakash Swain', rollNumber: '16', regNo: '2305201016', department: 'Civil Engineering', roomNumber: '102', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98612 44556', parentPhone: '+91 94372 66554', remarks: 'Verified by Warden' }
    ]
  },
  {
    id: 'ATT-20261028-KB1',
    hostelName: 'Kalam Boys Residence',
    hostelCode: 'KB1',
    date: '2026-10-28',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mr. Sunil Pradhan (Resident Warden)',
    submittedAt: '28 Oct 2026, 08:30 PM (Verified)',
    verifiedByAdmin: true,
    status: 'Submitted to Hostel Admin',
    stats: {
      total: 4,
      present: 2,
      absent: 1,
      onLeave: 1,
      percentage: '50.0%'
    },
    remarks: 'Kalam block roll-call audit log. 1 boarder on leave, 1 absent.',
    records: [
      { studentName: 'Chandan Kumar Mallick', rollNumber: '17', regNo: '2305201017', department: 'Electrical Engineering', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98613 55667', parentPhone: '+91 94373 55443', remarks: 'Regular attendance' },
      { studentName: 'Sambit Mohapatra', rollNumber: '18', regNo: '2305201018', department: 'Computer Science & Engineering', roomNumber: '101', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98613 66778', parentPhone: '+91 94373 44332', remarks: 'Verified by Warden' },
      { studentName: 'Rajesh Kumar Baral', rollNumber: '19', regNo: '2305201019', department: 'Information Technology', roomNumber: '102', bedNumber: 'Bed 01', status: 'Absent', phone: '+91 98613 77889', parentPhone: '+91 94373 33221', remarks: 'Parent alert dispatched' },
      { studentName: 'Pragyan Priyadarshi', rollNumber: '20', regNo: '2305201020', department: 'Electronics & Comm. Engg', roomNumber: '102', bedNumber: 'Bed 02', status: 'On Leave', phone: '+91 98613 88990', parentPhone: '+91 94373 22110', remarks: 'Approved weekend home pass #HP-2026-45' }
    ]
  },
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
      total: 4,
      present: 3,
      absent: 1,
      onLeave: 0,
      percentage: '75.0%'
    },
    remarks: 'All 1st floor rooms inspected. Sourav Mohanty absent without gatepass.',
    records: [
      { studentName: 'Rakesh Das', rollNumber: '01', regNo: '2305201001', department: 'Computer Science & Engineering', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98610 11223', parentPhone: '+91 94370 99887', remarks: 'Verified by Warden' },
      { studentName: 'Amit Pattnaik', rollNumber: '03', regNo: '2305201003', department: 'Electronics & Comm. Engg', roomNumber: '101', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98610 33445', parentPhone: '+91 94370 77665', remarks: 'Verified by Warden' },
      { studentName: 'Sourav Mohanty', rollNumber: '05', regNo: '2305201005', department: 'Electrical Engineering', roomNumber: '102', bedNumber: 'Bed 01', status: 'Absent', phone: '+91 98610 55667', parentPhone: '+91 94370 55443', remarks: 'Parent SMS queued' },
      { studentName: 'Debabrata Jena', rollNumber: '06', regNo: '2305201006', department: 'Mechanical Engineering', roomNumber: '102', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98610 66778', parentPhone: '+91 94370 44332', remarks: 'Verified by Warden' }
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
      { studentName: 'Bikash Rout', rollNumber: '08', regNo: '2305201008', department: 'Civil Engineering', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98610 88990', parentPhone: '+91 94370 22110', remarks: 'Verified' },
      { studentName: 'Manoj Tripathy', rollNumber: '09', regNo: '2305201009', department: 'Computer Science & Engineering', roomNumber: '101', bedNumber: 'Bed 02', status: 'Present', phone: '+91 98610 99001', parentPhone: '+91 94370 11009', remarks: 'Verified' },
      { studentName: 'Kishore Sethi', rollNumber: '11', regNo: '2305201011', department: 'Mechanical Engineering', roomNumber: '102', bedNumber: 'Bed 01', status: 'Present', phone: '+91 98611 11223', parentPhone: '+91 94371 99887', remarks: 'Verified' },
      { studentName: 'Deepak Kumar Barik', rollNumber: '12', regNo: '2305201012', department: 'Information Technology', roomNumber: '102', bedNumber: 'Bed 02', status: 'Absent', phone: '+91 98611 22334', parentPhone: '+91 94371 88776', remarks: 'Library pass overdue' }
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
  const base = getStoredJson(HOSTELS_STORAGE_KEY, INITIAL_HOSTELS);
  if (typeof window !== 'undefined') {
    try {
      const rawComplexes = localStorage.getItem('bput_hostel_complexes_v2');
      if (rawComplexes) {
        const complexes = JSON.parse(rawComplexes);
        if (Array.isArray(complexes)) {
          const map = new Map();
          base.forEach(h => map.set(h.name.toLowerCase(), h));
          complexes.forEach(c => {
            const key = c.name.toLowerCase();
            const existing = map.get(key);
            const code = c.code || (c.name.match(/\b([A-Z])/g) || ['H']).join('').slice(0, 4);
            const totalRooms = Number(c.totalRooms) || 50;
            const item = {
              id: c.id,
              name: c.name,
              code,
              totalBeds: Number(c.totalBeds) || (totalRooms * 3),
              totalRooms,
              warden: c.warden || existing?.warden || 'Resident Warden',
              contact: c.contact || existing?.contact || '+91 94370 00000',
              type: c.type || existing?.type || 'Boys',
              floors: Number(c.totalFloors) || Number(c.floors) || 3,
              status: 'Active',
              bedRooms: c.bedRooms || { 4: `${Math.round(totalRooms * 0.7)} Rooms`, 3: `${Math.round(totalRooms * 0.3)} Rooms` }
            };
            map.set(key, existing ? { ...existing, ...item } : item);
          });
          return Array.from(map.values());
        }
      }
    } catch {}
  }
  return base;
}

export async function syncHostelsFromBackend() {
  try {
    const res = await api.getHostelComplexes().catch(() => api.getHostels());
    const backendList = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(backendList) && backendList.length > 0) {
      const current = getAllHostels();
      const map = new Map();
      current.forEach(h => {
        if (h?.name) map.set(h.name.toLowerCase().trim(), h);
      });
      backendList.forEach(bh => {
        if (!bh?.name) return;
        const key = bh.name.toLowerCase().trim();
        const existing = map.get(key);
        const code = bh.code || (bh.name.match(/\b([A-Z])/g) || ['H']).join('').slice(0, 4);
        const totalRooms = Number(bh.totalRooms) || 50;
        const item = {
          id: bh.id || existing?.id || `hst-${Date.now()}`,
          name: bh.name.trim(),
          code,
          totalBeds: Number(bh.totalBeds) || (totalRooms * 3),
          totalRooms,
          warden: bh.warden || existing?.warden || 'Resident Warden',
          contact: bh.contact || existing?.contact || '+91 94370 00000',
          type: bh.type || existing?.type || 'Boys',
          floors: Number(bh.totalFloors) || Number(bh.floors) || 3,
          status: 'Active',
          bedRooms: existing?.bedRooms || { 4: `${Math.round(totalRooms * 0.7)} Rooms`, 3: `${Math.round(totalRooms * 0.3)} Rooms` }
        };
        map.set(key, existing ? { ...existing, ...item } : item);
      });
      const merged = Array.from(map.values());
      setStoredJson(HOSTELS_STORAGE_KEY, merged);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bput_hostel_complexes_v2', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('bput_hostels_updated', { detail: merged }));
        window.dispatchEvent(new CustomEvent('bput_hostel_complexes_updated', { detail: merged }));
        window.dispatchEvent(new Event('storage'));
      }
      return merged;
    }
  } catch (err) {
    console.warn('Backend syncHostelsFromBackend fallback:', err?.message || err);
  }
  return getAllHostels();
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

  // Cross-sync into hostelComplexStore so all complexes & warden roles reflect this hostel immediately
  try {
    saveHostelComplex({
      id: hostelData.id || `hostel-${(hostelData.code || Date.now()).toString().toLowerCase()}`,
      name: hostelData.name,
      type: hostelData.type || 'Boys',
      totalFloors: Number(hostelData.floors) || 3,
      totalRooms: Number(hostelData.totalRooms) || 50,
      totalBeds: Number(hostelData.totalBeds) || 150,
      warden: hostelData.warden,
      contact: hostelData.contact,
    });
  } catch (e) {
    // Continue
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

  try {
    deleteHostelComplex(hostelId);
  } catch (e) {
    // Continue
  }

  return updated;
}

// ── 2. STUDENT ROSTER & ATTENDANCE ──
export function getStudentsRoster(hostelName = 'ALL') {
  let list = INITIAL_STUDENTS_ROSTER;
  if (hostelName && hostelName !== 'ALL') {
    const clean = hostelName.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
    const matched = INITIAL_STUDENTS_ROSTER.filter(s => {
      const sClean = (s.hostelName || '').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
      const sCode = (s.hostelCode || '').toLowerCase();
      const rawLower = hostelName.toLowerCase();
      return (
        sClean.includes(clean) ||
        clean.includes(sClean) ||
        sCode === clean ||
        rawLower.includes(sCode) ||
        (clean.includes('kalam') && sClean.includes('gandhi'))
      );
    });
    list = matched.length > 0 ? matched : INITIAL_STUDENTS_ROSTER.slice(0, 5);
  }

  return list.map((s, idx) => {
    const rollInt = parseInt(s.rollNumber, 10) || (idx + 1);
    const fallbackPhone = `+91 9861${String(10 + (rollInt % 80)).padStart(2, '0')} ${String(10000 + rollInt * 1111).slice(-5)}`;
    const phone = s.phone || s.contactNumber || s.studentPhone || s.mobile || fallbackPhone;
    return {
      ...s,
      phone,
      contactNumber: phone,
      parentPhone: s.parentPhone || s.guardianPhone || '+91 94370 99887'
    };
  });
}

export function getStudentDeptAndBranch(std) {
  const deptRaw = std?.department || '';
  let branch = std?.branch || '';
  let department = std?.department || 'Computer Science & Engineering';

  if (!branch) {
    if (deptRaw.includes('Computer Science') || deptRaw.includes('CSE')) branch = 'CSE';
    else if (deptRaw.includes('Electronics') || deptRaw.includes('ECE')) branch = 'ECE';
    else if (deptRaw.includes('Electrical') || deptRaw.includes('EE')) branch = 'EE';
    else if (deptRaw.includes('Mechanical') || deptRaw.includes('ME')) branch = 'ME';
    else if (deptRaw.includes('Civil')) branch = 'Civil';
    else if (deptRaw.includes('Information Technology') || deptRaw.includes('IT')) branch = 'IT';
    else branch = deptRaw || 'B.Tech';
  }

  return { department, branch };
}

export function getSubmittedAttendances() {
  const current = getStoredJson(ATTENDANCE_STORAGE_KEY, INITIAL_ATTENDANCE_SUBMISSIONS);
  const missing = INITIAL_ATTENDANCE_SUBMISSIONS.filter(init => !current.some(c => c.id === init.id));
  let list = missing.length > 0 ? [...missing, ...current] : current;

  // Self-heal any submissions that have empty records or 0 total stats or missing student phones
  let updated = false;
  list = list.map(item => {
    let records = item.records;
    if (!records || records.length === 0 || !item.stats || item.stats.total === 0) {
      const roster = getStudentsRoster(item.hostelName || item.hostelCode);
      if (roster && roster.length > 0) {
        updated = true;
        const total = roster.length;
        const present = roster.filter(r => r.status === 'Present').length || total;
        const absent = roster.filter(r => r.status === 'Absent').length;
        const onLeave = roster.filter(r => r.status === 'On Leave').length;
        records = roster.map(r => ({ ...r, status: r.status || 'Present' }));
        return {
          ...item,
          records,
          stats: {
            total,
            present,
            absent,
            onLeave,
            percentage: `${((present / total) * 100).toFixed(1)}%`
          }
        };
      }
    }

    // Ensure all records in every submission have student phone and parent phone populated
    const enrichedRecords = (records || []).map((r, i) => {
      const rollInt = parseInt(r.rollNumber, 10) || (i + 1);
      const fallbackPhone = `+91 9861${String(10 + (rollInt % 80)).padStart(2, '0')} ${String(10000 + rollInt * 1111).slice(-5)}`;
      const phone = r.phone || r.contactNumber || r.studentPhone || r.mobile || fallbackPhone;
      const parentPhone = r.parentPhone || r.guardianPhone || '+91 94370 99887';
      if (!r.phone || !r.parentPhone) updated = true;
      return {
        ...r,
        phone,
        contactNumber: phone,
        parentPhone
      };
    });

    return { ...item, records: enrichedRecords };
  });

  if (missing.length > 0 || updated) {
    setStoredJson(ATTENDANCE_STORAGE_KEY, list);
  }
  return list;
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
 * Submit or Update attendance from Warden - immediately synchronizes and dispatches to Hostel Admin
 */
export function submitHostelAttendance({
  id,
  hostelName,
  hostelCode,
  date,
  session,
  submittedBy,
  records = [],
  remarks = '',
  status,
  verifiedByAdmin = true,
  updatedByAdmin = false,
  adminNotes = ''
}) {
  const current = getSubmittedAttendances();

  const normalizedRecords = (records || []).map((r, i) => {
    const rollInt = parseInt(r.rollNumber, 10) || (i + 1);
    const fallbackPhone = `+91 9861${String(10 + (rollInt % 80)).padStart(2, '0')} ${String(10000 + rollInt * 1111).slice(-5)}`;
    const phone = r.phone || r.contactNumber || r.studentPhone || r.mobile || fallbackPhone;
    const parentPhone = r.parentPhone || r.guardianPhone || '+91 94370 99887';
    return {
      ...r,
      phone,
      contactNumber: phone,
      parentPhone
    };
  });

  const total = normalizedRecords.length;
  const present = normalizedRecords.filter(r => r.status === 'Present').length;
  const absent = normalizedRecords.filter(r => r.status === 'Absent').length;
  const onLeave = normalizedRecords.filter(r => r.status === 'On Leave').length;
  const percentage = total > 0 ? `${((present / total) * 100).toFixed(1)}%` : '0%';

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Check if an existing record exists with the same ID or same hostel + date + session
  const targetHostel = hostelName || 'Bhabani Hostel-1';
  const targetDate = date || new Date().toISOString().split('T')[0];
  const targetSession = session || 'Night Roll Call (08:30 PM)';

  const existingIndex = current.findIndex(s => {
    if (id && s.id === id) return true;
    return s.hostelName?.toLowerCase() === targetHostel.toLowerCase() &&
           s.date === targetDate &&
           s.session === targetSession;
  });

  let targetSubmission;
  let updated;

  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    targetSubmission = {
      ...existing,
      id: id || existing.id,
      hostelName: targetHostel,
      hostelCode: hostelCode || existing.hostelCode || 'BN1',
      date: targetDate,
      session: targetSession,
      submittedBy: submittedBy || existing.submittedBy,
      submittedAt: `${dateFormatted}, ${timeFormatted} (Updated)`,
      verifiedByAdmin: verifiedByAdmin !== undefined ? verifiedByAdmin : true,
      updatedByAdmin: updatedByAdmin || existing.updatedByAdmin || false,
      adminNotes: adminNotes || existing.adminNotes || '',
      status: status || (updatedByAdmin ? 'Verified & Modified by Admin' : (existing.status || 'Submitted to Hostel Admin')),
      stats: {
        total,
        present,
        absent,
        onLeave,
        percentage
      },
      remarks: remarks || existing.remarks || 'Roll call taken and updated by Warden.',
      records: normalizedRecords
    };
    updated = [...current];
    updated[existingIndex] = targetSubmission;
  } else {
    targetSubmission = {
      id: id || `ATT-${Date.now()}`,
      hostelName: targetHostel,
      hostelCode: hostelCode || 'BN1',
      date: targetDate,
      session: targetSession,
      submittedBy: submittedBy || 'Mr. Rajesh Jena (Resident Warden)',
      submittedAt: `${dateFormatted}, ${timeFormatted}`,
      verifiedByAdmin: verifiedByAdmin !== undefined ? verifiedByAdmin : true,
      updatedByAdmin: updatedByAdmin || false,
      adminNotes: adminNotes || '',
      status: status || (updatedByAdmin ? 'Verified & Modified by Admin' : 'Submitted to Hostel Admin'),
      stats: {
        total,
        present,
        absent,
        onLeave,
        percentage
      },
      remarks: remarks || 'Roll call taken and verified by Warden.',
      records: normalizedRecords
    };
    updated = [targetSubmission, ...current];
  }

  // Automatically update last date of hostel attendance for student portal / profile
  try {
    updateStudentsHostelAttendanceDate(normalizedRecords, targetDate);
  } catch (e) {
    console.warn('updateStudentsHostelAttendanceDate error:', e);
  }

  setStoredJson(ATTENDANCE_STORAGE_KEY, updated);

  // Broadcast in real-time to both Hostel Admin and Warden views
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('bput_hostel_attendance_submitted', { detail: targetSubmission })
    );
    window.dispatchEvent(
      new CustomEvent('bput_hostel_attendance_updated', { detail: targetSubmission })
    );
    window.dispatchEvent(new Event('storage'));
  }

  // Persist to backend API asynchronously
  api.submitHostelAttendance(targetSubmission).catch(err => {
    console.warn('Backend submitHostelAttendance sync warning:', err?.message || err);
  });

  return targetSubmission;
}

export function updateHostelAttendance(id, updateData) {
  return submitHostelAttendance({ id, ...updateData });
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
