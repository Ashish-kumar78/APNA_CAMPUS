export const demoUsers: Array<{
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}> = [];

export const studentSummary = {
  name: 'Aarav Sharma',
  studentId: 'CF-2025-1184',
  semester: 5,
  cgpa: 8.79,
  sgpa: 8.9,
  attendance: 92.5,
  pendingFees: 18950,
  creditsCompleted: 88,
  upcomingExams: 4,
  libraryBooks: 3,
  dueBooks: 1,
  internshipStatus: 'Selected',
  placementStatus: 'In progress',
};

export const studentAttendanceData = [
  { month: 'Jan', value: 88 },
  { month: 'Feb', value: 90 },
  { month: 'Mar', value: 92 },
  { month: 'Apr', value: 94 },
  { month: 'May', value: 93 },
  { month: 'Jun', value: 92.5 },
];

export const subjectPerformance = [
  { name: 'Data Structures', value: 92 },
  { name: 'OS', value: 88 },
  { name: 'DBMS', value: 95 },
  { name: 'Networks', value: 89 },
];

export const feeBreakdown = [
  { name: 'Paid', value: 86 },
  { name: 'Pending', value: 14 },
];

export const noticeFeed = [
  { title: 'Semester registration window', type: 'Academic', date: '2026-10-05', priority: 'High' },
  { title: 'Mid-semester lab evaluation', type: 'Examination', date: '2026-10-08', priority: 'Medium' },
  { title: 'Campus placement drive', type: 'Placement', date: '2026-10-12', priority: 'High' },
];

export const adminKpis = [
  { label: 'Students', value: '12,450', change: '+6.2%' },
  { label: 'Faculty', value: '580', change: '+3.8%' },
  { label: 'Attendance', value: '91.4%', change: '+2.1%' },
  { label: 'Fees Collected', value: '₹7.4 Cr', change: '+8.4%' },
  { label: 'Pending Fees', value: '₹29.5 Lakh', change: '-4.6%' },
  { label: 'Placement Offers', value: '412', change: '+11.9%' },
];

export const recentActivity = [
  'Fee reconciliation completed for 201 students',
  'Semester 5 result review published',
  'New campus placement drive scheduled',
  '3 documents pending verification',
];
