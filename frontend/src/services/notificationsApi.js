// Faculty-to-Student Academic Notification System API Client
// Connects to NestJS Backend (/api/notifications/*) with robust local persistence fallback

import { api } from './api';

const NOTIFICATIONS_STORAGE_KEY = 'apna_campus_faculty_notifications_v2';

const canonicalStudentsSeed = [
  // Section A (32 students)
  { rollNumber: '01', name: 'Debasish Panda', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'debasish.panda@gift.edu.in' },
  { rollNumber: '02', name: 'Alok Kumar Jena', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'alok.jena@gift.edu.in' },
  { rollNumber: '03', name: 'Bhavna Rath', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'bhavna.rath@gift.edu.in' },
  { rollNumber: '04', name: 'Chandan Mohapatra', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'chandan.m@gift.edu.in' },
  { rollNumber: '05', name: 'Deepak Pradhan', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'deepak.p@gift.edu.in' },
  { rollNumber: '06', name: 'Gayatri Sahoo', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'gayatri.s@gift.edu.in' },
  { rollNumber: '07', name: 'Harish Nayak', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'harish.n@gift.edu.in' },
  { rollNumber: '08', name: 'Ipsita Das', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'ipsita.d@gift.edu.in' },
  { rollNumber: '09', name: 'Jitendra Barik', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'jitendra.b@gift.edu.in' },
  { rollNumber: '10', name: 'Kalyani Mishra', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'kalyani.m@gift.edu.in' },
  { rollNumber: '11', name: 'Lalit Kishore Behera', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'lalit.b@gift.edu.in' },
  { rollNumber: '12', name: 'Madhusmita Senapati', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'madhu.s@gift.edu.in' },
  { rollNumber: '13', name: 'Naveen Pattnaik', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'naveen.p@gift.edu.in' },
  { rollNumber: '14', name: 'Omkar Parida', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'omkar.p@gift.edu.in' },
  { rollNumber: '15', name: 'Pooja Priyadarshini', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'pooja.p@gift.edu.in' },
  { rollNumber: '16', name: 'Qasim Ali Khan', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'qasim.k@gift.edu.in' },
  { rollNumber: '17', name: 'Rakesh Roshan Das', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'rakesh.d@gift.edu.in' },
  { rollNumber: '18', name: 'Soumya Ranjan Tripathy', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'soumya.t@gift.edu.in' },
  { rollNumber: '19', name: 'Tanmayee Mohanty', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'tanmayee.m@gift.edu.in' },
  { rollNumber: '20', name: 'Umesh Chandra Rout', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'umesh.r@gift.edu.in' },
  { rollNumber: '21', name: 'Varsha Rani Biswal', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'varsha.b@gift.edu.in' },
  { rollNumber: '22', name: 'Wasim Akram', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'wasim.a@gift.edu.in' },
  { rollNumber: '23', name: 'Yashwant Dalai', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'yashwant.d@gift.edu.in' },
  { rollNumber: '24', name: 'Zahir Hussain', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'zahir.h@gift.edu.in' },
  { rollNumber: '25', name: 'Abhilash Samal', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'abhilash.s@gift.edu.in' },
  { rollNumber: '26', name: 'Bikram Keshari Padhi', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'bikram.p@gift.edu.in' },
  { rollNumber: '27', name: 'Chinmayee Satapathy', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'chinmayee.s@gift.edu.in' },
  { rollNumber: '28', name: 'Debashree Moharana', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'debashree.m@gift.edu.in' },
  { rollNumber: '29', name: 'Eshita Panigrahi', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'eshita.p@gift.edu.in' },
  { rollNumber: '30', name: 'Falguni Nanda', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'falguni.n@gift.edu.in' },
  { rollNumber: '31', name: 'Gourab Chandra Dey', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'gourab.d@gift.edu.in' },
  { rollNumber: '32', name: 'Hemant Kumar Sethi', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'hemant.s@gift.edu.in' }
];

function buildRecipientsList(sec = 'Section A', readRatio = 0.9) {
  const students = canonicalStudentsSeed.filter(s => sec === 'ALL' || sec === 'ALL_ASSIGNED' || s.section === sec);
  const readCount = Math.floor(students.length * readRatio);
  return students.map((s, idx) => ({
    studentRollNumber: s.rollNumber,
    studentName: s.name,
    studentEmail: s.email,
    semester: s.semester,
    section: s.section,
    isRead: idx < readCount,
    readAt: idx < readCount ? new Date(Date.now() - (idx + 1) * 3600000).toISOString() : null
  }));
}

const initialNotificationsSeed = [
  {
    id: 'notif-101',
    title: 'Continuous Internal Assessment (CIA) Modular 2 Examination Schedule',
    message: 'The Autonomous Examination Cell has scheduled Modular 2 Theory & Practical examinations commencing on 15 Oct 2026. Data Structures (CS501) paper will be held from 10:00 AM - 12:00 PM in Block B examination halls. Syllabus covers Binary Search Trees, AVL rotations, Heap sort, and Graph Traversals (BFS/DFS). Hall tickets will be issued only to candidates having >= 75% aggregate attendance.',
    category: 'EXAMINATION',
    priority: 'URGENT',
    status: 'PUBLISHED',
    facultyId: 'FAC-042',
    facultyName: 'Dr. S. Mohanty',
    facultyDesignation: 'Associate Professor & Course Coordinator',
    facultyEmail: 's.mohanty@gift.edu.in',
    department: 'Computer Science & Engineering',
    academicYear: '2026-27',
    program: 'B.Tech',
    semester: 'Semester 5',
    section: 'Section A',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    scheduledFor: null,
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: '2026-10-25T23:59:59.000Z',
    attachmentUrl: '/assets/sample_syllabus_cie2.pdf',
    attachmentName: 'CS501_Modular2_Blueprint_and_RoomAllocation.pdf',
    totalRecipients: 32,
    totalRead: 29,
    recipients: buildRecipientsList('Section A', 29 / 32)
  },
  {
    id: 'notif-102',
    title: 'Assignment 3: Red-Black Tree Implementation Deadline Extension',
    message: 'In response to multiple student requests regarding the complexities of node recoloring and rotations, the submission deadline for Assignment 3 has been extended to Friday, 17 Oct 2026, 11:59 PM. Please push your tested C/C++ repository links through the online portal. Plagiarized submissions will receive zero evaluation marks.',
    category: 'ASSIGNMENT_DEADLINE',
    priority: 'IMPORTANT',
    status: 'PUBLISHED',
    facultyId: 'FAC-042',
    facultyName: 'Dr. S. Mohanty',
    facultyDesignation: 'Associate Professor & Course Coordinator',
    facultyEmail: 's.mohanty@gift.edu.in',
    department: 'Computer Science & Engineering',
    academicYear: '2026-27',
    program: 'B.Tech',
    semester: 'Semester 5',
    section: 'Section A',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    scheduledFor: null,
    publishedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    expiresAt: '2026-10-18T23:59:59.000Z',
    attachmentUrl: null,
    attachmentName: null,
    totalRecipients: 32,
    totalRead: 26,
    recipients: buildRecipientsList('Section A', 26 / 32)
  },
  {
    id: 'notif-103',
    title: 'Special Weekend Remedial Tutorial on Dynamic Programming',
    message: 'A dedicated problem-solving tutorial session for Dynamic Programming (0/1 Knapsack, Longest Common Subsequence, and Matrix Chain Multiplication) is organized for this Saturday (11:00 AM - 01:00 PM) in Computing Lab 3. All students scoring below 60% in Quiz 3 & 4 are strongly advised to attend.',
    category: 'EXTRA_CLASS',
    priority: 'NORMAL',
    status: 'PUBLISHED',
    facultyId: 'FAC-042',
    facultyName: 'Dr. S. Mohanty',
    facultyDesignation: 'Associate Professor & Course Coordinator',
    facultyEmail: 's.mohanty@gift.edu.in',
    department: 'Computer Science & Engineering',
    academicYear: '2026-27',
    program: 'B.Tech',
    semester: 'Semester 5',
    section: 'ALL_ASSIGNED',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    scheduledFor: null,
    publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    expiresAt: '2026-10-20T23:59:59.000Z',
    attachmentUrl: null,
    attachmentName: null,
    totalRecipients: 32,
    totalRead: 19,
    recipients: buildRecipientsList('Section A', 19 / 32)
  },
  {
    id: 'notif-104',
    title: 'Schedule Change: Wednesday Period 3 Operating Systems shifted to Period 5',
    message: 'Due to the Department Board of Studies accreditation meeting on Wednesday morning, the CS502 Operating Systems lecture will be held during Period 5 (02:00 PM - 03:00 PM) in Room 304. Please take note.',
    category: 'SCHEDULE_CHANGE',
    priority: 'NORMAL',
    status: 'SCHEDULED',
    facultyId: 'FAC-042',
    facultyName: 'Dr. S. Mohanty',
    facultyDesignation: 'Associate Professor & Course Coordinator',
    facultyEmail: 's.mohanty@gift.edu.in',
    department: 'Computer Science & Engineering',
    academicYear: '2026-27',
    program: 'B.Tech',
    semester: 'Semester 5',
    section: 'Section A',
    subjectCode: 'CS502',
    subjectName: 'Operating Systems',
    scheduledFor: new Date(Date.now() + 24 * 3600000).toISOString(),
    publishedAt: new Date().toISOString(),
    expiresAt: '2026-10-22T23:59:59.000Z',
    attachmentUrl: null,
    attachmentName: null,
    totalRecipients: 32,
    totalRead: 0,
    recipients: buildRecipientsList('Section A', 0)
  }
];

function loadLocalNotifications() {
  if (typeof localStorage === 'undefined') return initialNotificationsSeed;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse notifications storage:', e);
  }
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotificationsSeed));
  return initialNotificationsSeed;
}

function saveLocalNotifications(data) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('apna_campus_notifications_updated'));
  } catch (e) {
    console.warn('Failed to save notifications:', e);
  }
}

export const notificationsApi = {
  // 1. Get Faculty Sent & Scheduled Notifications
  getFacultyNotifications: async (facultyName = 'Dr. S. Mohanty') => {
    try {
      const res = await api.getFacultyNotifications();
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback
    }

    const current = loadLocalNotifications();
    return current
      .filter(n => !facultyName || n.facultyName.toLowerCase().includes(facultyName.toLowerCase()) || facultyName.toLowerCase().includes(n.facultyName.toLowerCase()))
      .map(n => {
        const total = n.totalRecipients || (n.recipients?.length) || 32;
        const read = n.totalRead || (n.recipients?.filter(r => r.isRead).length) || 0;
        const readRate = total > 0 ? Math.round((read / total) * 100) : 0;
        return {
          ...n,
          totalRecipients: total,
          totalRead: read,
          readRate
        };
      });
  },

  // 2. Preview Recipients Before Sending
  previewRecipients: async (target) => {
    try {
      const res = await api.previewNotificationRecipients(target);
      if (res && res.success) return res;
    } catch {
      // Fallback
    }

    const sec = target.section || 'Section A';
    const sem = target.semester || 'Semester 5';
    const prog = target.program || 'B.Tech';

    const matching = canonicalStudentsSeed.filter(s => {
      const semMatch = s.semester.toLowerCase() === sem.toLowerCase();
      const secMatch = sec === 'ALL' || sec === 'ALL_ASSIGNED' || s.section === sec;
      return semMatch && secMatch;
    });

    return {
      success: true,
      eligibleStudentsCount: matching.length || 32,
      targetGroupLabel: `${prog} · ${sem} · ${sec === 'ALL' || sec === 'ALL_ASSIGNED' ? 'All Assigned Sections' : sec}`,
      sampleRecipients: matching.slice(0, 4).map(s => `${s.rollNumber} - ${s.name}`)
    };
  },

  // 3. Create & Broadcast Notification
  createNotification: async (payload, facultyUser = { name: 'Dr. S. Mohanty' }) => {
    try {
      const res = await api.createFacultyNotification(payload);
      if (res && res.success) {
        const current = loadLocalNotifications();
        saveLocalNotifications([res.notification, ...current]);
        return res;
      }
    } catch {
      // Fallback
    }

    const current = loadLocalNotifications();
    const sem = payload.semester || 'Semester 5';
    const sec = payload.section || 'Section A';
    const isScheduled = payload.scheduledFor && new Date(payload.scheduledFor).getTime() > Date.now();
    const status = isScheduled ? 'SCHEDULED' : 'PUBLISHED';

    const recipients = buildRecipientsList(sec, 0);

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: payload.title.trim(),
      message: payload.message.trim(),
      category: payload.category || 'GENERAL_ANNOUNCEMENT',
      priority: payload.priority || 'NORMAL',
      status,
      facultyId: 'FAC-042',
      facultyName: facultyUser.name || 'Dr. S. Mohanty',
      facultyDesignation: 'Associate Professor & Course Coordinator',
      facultyEmail: 's.mohanty@gift.edu.in',
      department: 'Computer Science & Engineering',
      academicYear: payload.academicYear || '2026-27',
      program: payload.program || 'B.Tech',
      semester: sem,
      section: sec,
      subjectCode: payload.subjectCode || null,
      subjectName: payload.subjectName || null,
      scheduledFor: payload.scheduledFor || null,
      publishedAt: isScheduled ? payload.scheduledFor : new Date().toISOString(),
      expiresAt: payload.expiresAt || null,
      attachmentUrl: payload.attachmentUrl || null,
      attachmentName: payload.attachmentName || null,
      totalRecipients: recipients.length || 32,
      totalRead: 0,
      readRate: 0,
      recipients
    };

    saveLocalNotifications([newNotif, ...current]);

    return {
      success: true,
      message: isScheduled
        ? `Notification scheduled for delivery on ${new Date(payload.scheduledFor).toLocaleString('en-IN')}.`
        : `Notification published successfully to ${recipients.length} students.`,
      notification: newNotif
    };
  },

  // 4. Cancel Scheduled Notification
  cancelNotification: async (id) => {
    try {
      const res = await api.cancelFacultyNotification(id);
      if (res && res.success) {
        const current = loadLocalNotifications();
        saveLocalNotifications(current.map(n => n.id === id ? { ...n, status: 'CANCELLED' } : n));
        return res;
      }
    } catch {
      // Fallback
    }

    const current = loadLocalNotifications();
    saveLocalNotifications(current.map(n => n.id === id ? { ...n, status: 'CANCELLED' } : n));
    return { success: true, message: 'Scheduled notification cancelled.' };
  },

  // 5. Get Student Notifications
  getStudentNotifications: async (studentRoll = '01') => {
    try {
      const res = await api.getStudentNotifications();
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback
    }

    const current = loadLocalNotifications();
    const student = canonicalStudentsSeed.find(s => s.rollNumber === studentRoll) || canonicalStudentsSeed[0];

    const matching = current.filter(n => {
      if (n.status === 'CANCELLED') return false;
      if (n.status === 'SCHEDULED' && n.scheduledFor && new Date(n.scheduledFor).getTime() > Date.now()) {
        return false;
      }
      const semMatch = n.semester.toLowerCase() === student.semester.toLowerCase();
      const secMatch = n.section === 'ALL' || n.section === 'ALL_ASSIGNED' || n.section.toLowerCase() === student.section.toLowerCase();
      return semMatch && secMatch;
    });

    return matching.map(n => {
      const rec = (n.recipients || []).find(r => r.studentRollNumber === student.rollNumber);
      const isRead = rec ? rec.isRead : false;
      return {
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category,
        priority: n.priority,
        facultyName: n.facultyName,
        facultyDesignation: n.facultyDesignation,
        subjectCode: n.subjectCode,
        subjectName: n.subjectName,
        semester: n.semester,
        section: n.section,
        publishedAt: n.publishedAt,
        expiresAt: n.expiresAt,
        attachmentUrl: n.attachmentUrl,
        attachmentName: n.attachmentName,
        isRead,
        readAt: rec?.readAt || null
      };
    });
  },

  // 6. Student: Mark Notification as Read
  markAsRead: async (id, studentRoll = '01') => {
    try {
      await api.markStudentNotificationRead(id);
    } catch {
      // Fallback
    }

    const current = loadLocalNotifications();
    const updated = current.map(n => {
      if (n.id === id) {
        const recs = n.recipients || [];
        let newlyRead = false;
        const newRecs = recs.map(r => {
          if (r.studentRollNumber === studentRoll && !r.isRead) {
            newlyRead = true;
            return { ...r, isRead: true, readAt: new Date().toISOString() };
          }
          return r;
        });
        return {
          ...n,
          totalRead: newlyRead ? (n.totalRead || 0) + 1 : n.totalRead,
          recipients: newRecs
        };
      }
      return n;
    });

    saveLocalNotifications(updated);
    return { success: true };
  }
};
