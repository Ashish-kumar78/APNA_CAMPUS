/**
 * Parent Notice and Student 360 Comprehensive Analytics Service
 * Enables Faculty & HOD to inspect full student attendance, academic marks, and fee accounts,
 * and dispatch direct official notices (SMS, WhatsApp, Email, In-App) to student parents
 * for critical attendance shortage (<50%), high fee dues, or academic interventions.
 */

import { notificationsStore } from './notificationsStore.js';

const PARENT_NOTICES_STORAGE_KEY = 'apna_parent_notices_log_v1';

// Seed initial dispatched parent notices so history is immediately rich
const INITIAL_PARENT_NOTICES = [
  {
    id: 'PN-2026-0891',
    studentId: 'GIFT-2023-1005',
    rollNumber: '05',
    studentName: 'Sourav Mohanty',
    registrationNumber: '2305201005',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    parentName: 'Mr. Kailash Mohanty',
    parentPhone: '+91 94370 55102',
    parentEmail: 'kailash.mohanty@gmail.com',
    noticeType: 'ATTENDANCE_CRITICAL',
    title: 'Urgent Parent Summon: Critical Attendance Shortage (<50%)',
    message: 'URGENT ATTENDANCE SHORTAGE NOTICE: Dear Parent of Sourav Mohanty (Roll #05, B.Tech CSE), your ward has attended only 66/150 lectures (44%), which is critically below the 50% threshold. Immediate risk of debarment from BPUT/Autonomous Semester Examinations. Please meet HOD/Faculty Mentor this Friday at 11:00 AM.',
    channels: ['SMS', 'WhatsApp', 'Email', 'Student Portal'],
    sentBy: 'Prof. S. R. Pattnaik (HOD CSE)',
    senderRole: 'HOD',
    timestamp: '2026-10-18T10:30:00Z',
    formattedDate: '18 Oct 2026, 10:30 AM',
    deliveryStatus: 'DELIVERED',
    readByParent: true,
  },
  {
    id: 'PN-2026-0874',
    studentId: 'GIFT-2023-1006',
    rollNumber: '06',
    studentName: 'Sneha Mohanty',
    registrationNumber: '2305201006',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    parentName: 'Mr. Dillip Mohanty',
    parentPhone: '+91 94370 66203',
    parentEmail: 'dillip.mohanty@outlook.com',
    noticeType: 'HIGH_FEES_DUE',
    title: 'Statutory Fee Clearance Default Notice (Outstanding Dues: ₹55,000)',
    message: 'OFFICIAL FEE DUES NOTICE: Dear Parent of Sneha Mohanty (Roll #06, B.Tech CSE), an outstanding institutional academic fee balance of ₹55,000 remains overdue for Autumn Semester 2026-27. Examination hall tickets and semester registration will be placed on administrative hold if not cleared before 15 Nov 2026.',
    channels: ['SMS', 'Email', 'Student Portal'],
    sentBy: 'Dr. A. K. Nayak (Faculty Advisor)',
    senderRole: 'Faculty',
    timestamp: '2026-10-14T14:15:00Z',
    formattedDate: '14 Oct 2026, 02:15 PM',
    deliveryStatus: 'DELIVERED',
    readByParent: true,
  },
  {
    id: 'PN-2026-0855',
    studentId: 'GIFT-2023-1012',
    rollNumber: '12',
    studentName: 'Manoj Kumar Panda',
    registrationNumber: '2305201012',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    parentName: 'Mr. Rabindra Panda',
    parentPhone: '+91 94370 88314',
    parentEmail: 'rabindra.panda@yahoo.co.in',
    noticeType: 'DUAL_CRITICAL',
    title: 'Critical Parent Alert: Attendance Shortage (<50%) & Outstanding Fee Balance',
    message: 'CRITICAL PARENT ALERT: Dear Parent of Manoj Kumar Panda (Roll #12, B.Tech CSE), your ward has a critical attendance shortage of 42% (<50%) and outstanding fee dues of ₹65,000. Immediate parent appearance before Department Academic Council is mandatory this Thursday to avert semester debarment.',
    channels: ['SMS', 'WhatsApp', 'Email', 'Student Portal'],
    sentBy: 'Prof. S. R. Pattnaik (HOD CSE)',
    senderRole: 'HOD',
    timestamp: '2026-10-20T09:45:00Z',
    formattedDate: '20 Oct 2026, 09:45 AM',
    deliveryStatus: 'DELIVERED',
    readByParent: true,
  }
];

// Helper to determine specific test scenarios for demo realism
function getStudentOverrides(rollInt) {
  // Designated Critical Attendance (< 50%) students: Roll 5 (44%), 12 (42%), 19 (38%), 27 (46%)
  if (rollInt === 5) {
    return { attendance: 44, dueFees: 12000, paidFees: 103000, cgpa: 6.4, backlogs: 1 };
  }
  if (rollInt === 12) {
    return { attendance: 42, dueFees: 65000, paidFees: 50000, cgpa: 5.8, backlogs: 2 }; // Dual critical
  }
  if (rollInt === 19) {
    return { attendance: 38, dueFees: 15000, paidFees: 100000, cgpa: 5.4, backlogs: 2 };
  }
  if (rollInt === 27) {
    return { attendance: 46, dueFees: 50000, paidFees: 65000, cgpa: 6.1, backlogs: 1 }; // Dual critical
  }

  // Designated High Fees students: Roll 6 (₹55k), 9 (₹72k), 15 (₹48k), 22 (₹60k)
  if (rollInt === 6) {
    return { attendance: 84, dueFees: 55000, paidFees: 60000, cgpa: 7.9, backlogs: 0 };
  }
  if (rollInt === 9) {
    return { attendance: 62, dueFees: 72000, paidFees: 43000, cgpa: 6.8, backlogs: 1 };
  }
  if (rollInt === 15) {
    return { attendance: 78, dueFees: 48000, paidFees: 67000, cgpa: 7.4, backlogs: 0 };
  }
  if (rollInt === 22) {
    return { attendance: 81, dueFees: 60000, paidFees: 55000, cgpa: 7.2, backlogs: 0 };
  }

  // Other students have default distribution
  const att = Math.min(96, Math.max(56, 70 + ((rollInt * 11) % 27)));
  const due = (rollInt % 4 === 0) ? 28000 : (rollInt % 3 === 0) ? 14000 : 0;
  return {
    attendance: att,
    dueFees: due,
    paidFees: 115000 - due,
    cgpa: (6.8 + ((rollInt * 7) % 30) / 10).toFixed(2),
    backlogs: (rollInt % 7 === 0) ? 1 : 0
  };
}

/**
 * Enriches a student record with comprehensive Attendance, Marks, Fees, and Parent info
 */
export function getStudentComprehensiveDetails(student) {
  if (!student) return null;
  const rollInt = parseInt(student.rollNumber, 10) || 1;
  const overrides = getStudentOverrides(rollInt);

  const rawAttendance = student.attendance !== undefined && student.attendance !== null
    ? (rollInt === 5 || rollInt === 12 || rollInt === 19 || rollInt === 27 ? overrides.attendance : student.attendance)
    : overrides.attendance;

  const attendance = Number(rawAttendance);
  const totalLectures = 150;
  const attendedLectures = Math.round((totalLectures * attendance) / 100);

  const isCriticalShortage = attendance < 50;
  const isShortage = attendance < 75;
  const attendanceStatus = isCriticalShortage
    ? 'Critical Shortage (<50%)'
    : isShortage
    ? 'Shortage Warning (<75%)'
    : 'Eligible (≥75%)';

  // Subject-wise attendance calculation
  const subjectsList = [
    { code: 'CS501', name: 'Design & Analysis of Algorithms', credits: 4, faculty: 'Dr. P. K. Pattnaik' },
    { code: 'CS502', name: 'Operating Systems & Architecture', credits: 4, faculty: 'Prof. S. R. Mohapatra' },
    { code: 'CS503', name: 'Database Management Systems', credits: 4, faculty: 'Dr. A. K. Nayak' },
    { code: 'CS504', name: 'Formal Language & Automata', credits: 3, faculty: 'Er. Rashmita Tripathy' },
    { code: 'CS505', name: 'Algorithms & OS Laboratory', credits: 2, faculty: 'Er. B. K. Jena' },
  ];

  const subjectAttendance = subjectsList.map((sub, idx) => {
    const subVariance = ((rollInt * 7 + idx * 5) % 11) - 5;
    const subPct = Math.min(100, Math.max(25, attendance + subVariance));
    const subTotal = 30;
    const subAttended = Math.round((subTotal * subPct) / 100);
    return {
      ...sub,
      percentage: subPct,
      attended: subAttended,
      total: subTotal,
      isShortage: subPct < 75,
      isCritical: subPct < 50,
    };
  });

  // Marks & Continuous Assessment
  const cgpa = student.cgpa ? Number(student.cgpa) : Number(overrides.cgpa);
  const mid1 = Math.min(30, Math.max(10, Math.floor(18 + ((rollInt * 7) % 13))));
  const mid2 = Math.min(30, Math.max(12, Math.floor(20 + ((rollInt * 11) % 11))));
  const assignmentMarks = Math.min(20, Math.max(8, Math.floor(14 + ((rollInt * 3) % 7))));
  const quizMarks = Math.min(10, Math.max(4, Math.floor(7 + ((rollInt * 5) % 4))));
  const labMarks = Math.min(10, Math.max(5, Math.floor(8 + (rollInt % 3))));
  const totalInternal = mid1 + mid2 + assignmentMarks + quizMarks + labMarks;

  const backlogCount = student.backlogCount !== undefined ? student.backlogCount : overrides.backlogs;

  // Fees details
  const totalFees = 115000;
  const dueFees = student.dueFees !== undefined ? Number(student.dueFees) : overrides.dueFees;
  const paidFees = totalFees - dueFees;
  const hasHighDues = dueFees >= 25000;
  const feeStatus = dueFees === 0
    ? 'Cleared'
    : hasHighDues
    ? 'High Dues Pending'
    : 'Partially Paid';

  const feeHeads = [
    { head: 'Tuition Fee (Autumn Term)', assessed: 65000, paid: Math.min(65000, paidFees), balance: Math.max(0, 65000 - paidFees), status: paidFees >= 65000 ? 'Cleared' : 'Pending' },
    { head: 'Institutional Development Fund', assessed: 20000, paid: Math.min(20000, Math.max(0, paidFees - 65000)), balance: Math.max(0, 20000 - Math.max(0, paidFees - 65000)), status: paidFees >= 85000 ? 'Cleared' : 'Pending' },
    { head: 'Laboratory & Examination Fee', assessed: 15000, paid: Math.min(15000, Math.max(0, paidFees - 85000)), balance: Math.max(0, 15000 - Math.max(0, paidFees - 85000)), status: paidFees >= 100000 ? 'Cleared' : 'Pending' },
    { head: 'Library & Student Activities', assessed: 15000, paid: Math.min(15000, Math.max(0, paidFees - 100000)), balance: Math.max(0, 15000 - Math.max(0, paidFees - 100000)), status: paidFees >= 115000 ? 'Cleared' : 'Pending' },
  ];

  // Parents Contact info
  const fName = student.fatherName || 'Sanjay Das';
  const mName = student.motherName || 'Minati Das';
  const parentPhone = student.fatherPhone || student.guardianPhone || `+91 ${9437000000 + (rollInt * 111) % 900000}`;
  const parentEmail = student.fatherEmail || `guardian.${(student.name || 'student').toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

  return {
    ...student,
    attendance,
    totalLectures,
    attendedLectures,
    isCriticalShortage,
    isShortage,
    attendanceStatus,
    subjectAttendance,
    marks: {
      cgpa,
      totalInternal,
      mid1,
      mid2,
      assignmentMarks,
      quizMarks,
      labMarks,
      backlogCount,
      marksStatus: totalInternal >= 60 ? 'Satisfactory' : 'Needs Remedial Intervention',
    },
    fees: {
      totalFees,
      paidFees,
      dueFees,
      hasHighDues,
      feeStatus,
      nextDueDate: '15 Nov 2026',
      feeHeads,
    },
    parent: {
      fatherName: fName,
      motherName: mName,
      phone: parentPhone,
      email: parentEmail,
      address: student.currAddress || student.permAddress || 'Odisha, India',
    },
    examEligibility: isCriticalShortage
      ? 'Debarred (Critical Attendance < 50%)'
      : hasHighDues
      ? 'On Hold (High Fee Dues Overdue)'
      : isShortage
      ? 'Condonation Application Required (< 75%)'
      : 'Eligible for Autonomous Examination',
  };
}

/**
 * Pre-composes standard institutional formal notices for parents
 */
export function generateParentNoticeTemplates(studentDetails, sender = {}) {
  const s = studentDetails;
  const senderName = sender.name || 'Department Faculty Advisor';
  const senderRole = sender.role || 'Faculty / HOD';
  const senderDept = sender.deptCode || sender.department || 'Computer Science & Engineering';

  return {
    ATTENDANCE_CRITICAL: {
      key: 'ATTENDANCE_CRITICAL',
      label: '🚨 Critical Attendance Shortage (<50%)',
      badgeClass: 'badge-critical-red',
      title: `Critical Attendance Warning: Debarment Risk for ${s.name}`,
      subject: `URGENT: Critical Attendance Shortage (<50%) - ${s.name} (${s.rollNumber})`,
      message: `URGENT ATTENDANCE SHORTAGE NOTICE: Dear Parent of ${s.name} (Roll #${s.rollNumber}, Reg #${s.registrationNumber || s.studentId}, ${s.semester || 'Semester 5'} ${s.section || 'Section A'}), your ward has attended only ${s.attendedLectures}/${s.totalLectures} lectures (${s.attendance}%), which is critically below the statutory 50% cutoff. Your ward faces immediate debarment from BPUT/Autonomous End-Semester Examinations. You are requested to meet the HOD & Faculty Proctor this week to discuss attendance condonation procedures. - ${senderName} (${senderRole}), Department of ${senderDept}, Apna Campus Autonomous.`,
      recommendedChannels: ['SMS', 'WhatsApp', 'Email', 'Student Portal'],
    },
    HIGH_FEES_DUE: {
      key: 'HIGH_FEES_DUE',
      label: '💳 Outstanding Fee Dues Notice',
      badgeClass: 'badge-warning-amber',
      title: `Official Fee Dues Reminder: Pending ₹${Number(s.fees?.dueFees || 0).toLocaleString('en-IN')}`,
      subject: `OFFICIAL NOTICE: Outstanding Institutional Academic Fee Balance - ${s.name}`,
      message: `OFFICIAL FEE DUES NOTICE: Dear Parent of ${s.name} (Roll #${s.rollNumber}, ${s.semester || 'Semester 5'}), our accounts audit indicates an outstanding academic fee balance of ₹${Number(s.fees?.dueFees || 0).toLocaleString('en-IN')} (Total Assessed: ₹${Number(s.fees?.totalFees || 115000).toLocaleString('en-IN')}, Paid: ₹${Number(s.fees?.paidFees || 0).toLocaleString('en-IN')}). Examination hall tickets and upcoming semester enrolment will be placed on administrative hold if dues remain unaddressed before ${s.fees?.nextDueDate || '15 Nov 2026'}. Payments can be made via Apna Campus Accounts Portal or RTGS/NEFT. - Accounts & Proctorial Office, Apna Campus.`,
      recommendedChannels: ['SMS', 'Email', 'Student Portal'],
    },
    DUAL_CRITICAL: {
      key: 'DUAL_CRITICAL',
      label: '🔥 Dual Urgent Warning (Attendance & Fees)',
      badgeClass: 'badge-critical-combo',
      title: `Urgent Combined Notice: Attendance Shortage (${s.attendance}%) & Fee Dues`,
      subject: `SUMMONS NOTICE: Academic Attendance & Fee Clearance Hold - ${s.name}`,
      message: `STATUTORY SUMMONS NOTICE: Dear Parent of ${s.name} (Roll #${s.rollNumber}, ${s.department || 'B.Tech CSE'}), your ward has a critical attendance shortage of ${s.attendance}% (<50%) and an outstanding fee balance of ₹${Number(s.fees?.dueFees || 0).toLocaleString('en-IN')}. Both criteria immediately block examination hall ticket generation under university autonomous regulations. A personal parent-teacher meeting is mandatory before Friday. - Office of HOD, ${senderDept}, Apna Campus Autonomous.`,
      recommendedChannels: ['SMS', 'WhatsApp', 'Email', 'Student Portal'],
    },
    ACADEMIC_PERFORMANCE: {
      key: 'ACADEMIC_PERFORMANCE',
      label: '📊 Academic Performance & Remedial Notice',
      badgeClass: 'badge-info-blue',
      title: `Academic Progress & Remedial Support for ${s.name}`,
      subject: `Academic Performance Review - ${s.name} (${s.rollNumber})`,
      message: `ACADEMIC PROGRESS REPORT: Dear Parent of ${s.name} (Roll #${s.rollNumber}), this is to apprise you of your ward's internal continuous assessment marks (Current CGPA: ${s.marks?.cgpa || '6.5'}, Internal Score: ${s.marks?.totalInternal || '62'}/100). Departmental remedial tutorials and mentor consultation have been scheduled every Saturday to support academic improvement. We welcome your partnership. - ${senderName}, Apna Campus.`,
      recommendedChannels: ['Email', 'Student Portal'],
    },
    CUSTOM: {
      key: 'CUSTOM',
      label: '📝 Custom Parent Message / Official Memo',
      badgeClass: 'badge-neutral',
      title: `Official Faculty Notice for Parents of ${s.name}`,
      subject: `Official Institutional Notice regarding ${s.name}`,
      message: `Dear Parent of ${s.name} (Roll #${s.rollNumber}), `,
      recommendedChannels: ['SMS', 'WhatsApp', 'Email', 'Student Portal'],
    }
  };
}

/**
 * Loads all historical parent notices
 */
export function getAllParentNotices() {
  if (typeof localStorage === 'undefined') return INITIAL_PARENT_NOTICES;
  try {
    const raw = localStorage.getItem(PARENT_NOTICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PARENT_NOTICES_STORAGE_KEY, JSON.stringify(INITIAL_PARENT_NOTICES));
      return INITIAL_PARENT_NOTICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PARENT_NOTICES;
  } catch {
    return INITIAL_PARENT_NOTICES;
  }
}

/**
 * Gets parent notices for a specific student
 */
export function getParentNoticesForStudent(studentIdOrRoll) {
  const all = getAllParentNotices();
  if (!studentIdOrRoll) return [];
  const query = String(studentIdOrRoll).trim().toLowerCase();
  return all.filter((n) =>
    (n.studentId && n.studentId.toLowerCase() === query) ||
    (n.rollNumber && n.rollNumber.toLowerCase() === query) ||
    (n.registrationNumber && n.registrationNumber.toLowerCase() === query)
  );
}

/**
 * Dispatches an official parent notice across selected channels
 */
export function dispatchParentNotice({
  student,
  sender = {},
  noticeType = 'ATTENDANCE_CRITICAL',
  title,
  message,
  channels = ['SMS', 'WhatsApp', 'Email', 'Student Portal'],
}) {
  const enriched = getStudentComprehensiveDetails(student);
  const now = new Date();
  const noticeId = `PN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newNotice = {
    id: noticeId,
    studentId: enriched.studentId || enriched.id,
    rollNumber: enriched.rollNumber,
    studentName: enriched.name,
    registrationNumber: enriched.registrationNumber || enriched.studentId,
    department: enriched.department || enriched.branch || 'Computer Science & Engineering',
    semester: enriched.semester || 'Semester 5',
    section: enriched.section || 'Section A',
    parentName: enriched.parent.fatherName || 'Parent / Guardian',
    parentPhone: enriched.parent.phone,
    parentEmail: enriched.parent.email,
    noticeType,
    title: title || `Official Notice for Parents of ${enriched.name}`,
    message,
    channels: channels.length > 0 ? channels : ['SMS', 'WhatsApp', 'Email', 'Student Portal'],
    sentBy: `${sender.name || 'Department Faculty'} (${sender.role || 'Staff'})`,
    senderRole: sender.role || 'Faculty',
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    deliveryStatus: 'DELIVERED',
    readByParent: false,
  };

  // 1. Save to local parent notices store
  const existing = getAllParentNotices();
  const updated = [newNotice, ...existing];
  try {
    localStorage.setItem(PARENT_NOTICES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Storage write error for parent notices:', e);
  }

  // 2. Post a copy to student notifications so the student sees that an official notice was sent to their parent
  try {
    notificationsStore.sendNotification(
      {
        title: `Parent Copy Dispatched: ${newNotice.title}`,
        message: `An official notice has been transmitted to your guardian (${newNotice.parentName}, ${newNotice.parentPhone}) regarding: "${newNotice.message.slice(0, 140)}...". Please consult your Faculty Proctor immediately.`,
        category: noticeType.includes('ATTENDANCE') ? 'ACADEMIC' : 'FINANCE',
        priority: 'URGENT',
        senderName: sender.name || 'Department Faculty',
        senderRole: sender.role || 'Faculty',
        senderDept: sender.deptCode || 'CSE',
        actionLabel: 'View Notice Copy',
      },
      ['student']
    );
  } catch (err) {
    console.warn('Student notification dispatch fallback:', err);
  }

  // Trigger global custom event for live reactive updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apna_parent_notice_sent', { detail: newNotice }));
  }

  return newNotice;
}
