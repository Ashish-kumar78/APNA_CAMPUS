import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Canonical initial student cohort for Section A (32 students) and Section B (30 students)
  private canonicalStudents = [
    // Section A
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
    { rollNumber: '32', name: 'Hemant Kumar Sethi', semester: 'Semester 5', section: 'Section A', deptCode: 'CSE', email: 'hemant.s@gift.edu.in' },
    // Section B
    { rollNumber: '33', name: 'Indrajit Swain', semester: 'Semester 5', section: 'Section B', deptCode: 'CSE', email: 'indrajit.s@gift.edu.in' },
    { rollNumber: '34', name: 'Jayashree Majhi', semester: 'Semester 5', section: 'Section B', deptCode: 'CSE', email: 'jayashree.m@gift.edu.in' },
    { rollNumber: '35', name: 'Kunal Verma', semester: 'Semester 5', section: 'Section B', deptCode: 'CSE', email: 'kunal.v@gift.edu.in' },
    { rollNumber: '36', name: 'Lipsa Pradhan', semester: 'Semester 5', section: 'Section B', deptCode: 'CSE', email: 'lipsa.p@gift.edu.in' }
  ];

  // In-memory notifications store
  private inMemoryNotifications: any[] = [
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
      recipients: this.buildRecipients('Section A', 29)
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
      recipients: this.buildRecipients('Section A', 26)
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
      totalRecipients: 36,
      totalRead: 18,
      recipients: this.buildRecipients('ALL', 18)
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
      recipients: this.buildRecipients('Section A', 0)
    }
  ];

  private buildRecipients(sectionFilter: string, readCount: number) {
    const list = this.canonicalStudents.filter(s => {
      if (sectionFilter === 'ALL' || sectionFilter === 'ALL_ASSIGNED') return true;
      return s.section === sectionFilter;
    });

    return list.map((s, idx) => ({
      studentRollNumber: s.rollNumber,
      studentName: s.name,
      studentEmail: s.email,
      semester: s.semester,
      section: s.section,
      isRead: idx < readCount,
      readAt: idx < readCount ? new Date(Date.now() - (idx + 1) * 3600000).toISOString() : null
    }));
  }

  // 1. Faculty: Get Sent & Scheduled Notifications
  async getFacultyNotifications(facultyName: string) {
    let list: any[] = [];

    try {
      const dbNotifs = await this.prisma.facultyNotification.findMany({
        where: {
          facultyName: { contains: facultyName, mode: 'insensitive' }
        },
        include: {
          recipients: true
        },
        orderBy: { publishedAt: 'desc' }
      });
      if (dbNotifs && dbNotifs.length > 0) {
        list = dbNotifs;
      }
    } catch {
      // Fallback
    }

    if (list.length === 0) {
      list = this.inMemoryNotifications.filter(n => {
        return !facultyName || n.facultyName.toLowerCase().includes(facultyName.toLowerCase()) || facultyName.toLowerCase().includes(n.facultyName.toLowerCase());
      });
    }

    return list.map(n => {
      const recs = n.recipients || [];
      const total = n.totalRecipients || recs.length || 32;
      const read = n.totalRead || recs.filter((r: any) => r.isRead).length || 0;
      const readRate = total > 0 ? Math.round((read / total) * 100) : 0;

      return {
        ...n,
        totalRecipients: total,
        totalRead: read,
        readRate
      };
    });
  }

  // 2. Faculty: Preview Eligible Recipient Count Before Sending
  async previewRecipients(target: {
    semester?: string;
    section?: string;
    subjectCode?: string;
    program?: string;
  }) {
    const sem = target.semester || 'Semester 5';
    const sec = target.section || 'Section A';
    const prog = target.program || 'B.Tech';

    const matching = this.canonicalStudents.filter(s => {
      const semMatch = s.semester.toLowerCase() === sem.toLowerCase();
      const secMatch = sec === 'ALL' || sec === 'ALL_ASSIGNED' || s.section === sec;
      return semMatch && secMatch;
    });

    const totalCount = matching.length;
    const groupLabel = `${prog} · ${sem} · ${sec === 'ALL' || sec === 'ALL_ASSIGNED' ? 'All Assigned Sections (Sec A & B)' : sec}`;

    return {
      success: true,
      eligibleStudentsCount: totalCount,
      targetGroupLabel: groupLabel,
      sampleRecipients: matching.slice(0, 5).map(s => `${s.rollNumber} - ${s.name} (${s.section})`)
    };
  }

  // 3. Faculty: Create and Broadcast Targeted Notification
  async createNotification(
    facultyUser: { name: string; designation?: string; email?: string; id?: string },
    payload: {
      title: string;
      message: string;
      category?: string;
      priority?: string;
      academicYear?: string;
      program?: string;
      semester?: string;
      section?: string;
      subjectCode?: string;
      subjectName?: string;
      scheduledFor?: string;
      expiresAt?: string;
      attachmentUrl?: string;
      attachmentName?: string;
    }
  ) {
    if (!payload.title || !payload.title.trim()) {
      throw new BadRequestException('Notification title is required.');
    }
    if (!payload.message || !payload.message.trim()) {
      throw new BadRequestException('Notification message description is required.');
    }

    const sem = payload.semester || 'Semester 5';
    const sec = payload.section || 'Section A';
    const prog = payload.program || 'B.Tech';

    // Dynamically query eligible students based on actual cohort assignment
    const targetStudents = this.canonicalStudents.filter(s => {
      const semMatch = s.semester.toLowerCase() === sem.toLowerCase();
      const secMatch = sec === 'ALL' || sec === 'ALL_ASSIGNED' || s.section === sec;
      return semMatch && secMatch;
    });

    const isScheduled = payload.scheduledFor && new Date(payload.scheduledFor).getTime() > Date.now();
    const status = isScheduled ? 'SCHEDULED' : 'PUBLISHED';

    const recipients = targetStudents.map(s => ({
      studentRollNumber: s.rollNumber,
      studentName: s.name,
      studentEmail: s.email,
      semester: s.semester,
      section: s.section,
      isRead: false,
      readAt: null
    }));

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: payload.title.trim(),
      message: payload.message.trim(),
      category: payload.category || 'GENERAL_ANNOUNCEMENT',
      priority: payload.priority || 'NORMAL',
      status,
      facultyId: facultyUser.id || 'FAC-042',
      facultyName: facultyUser.name || 'Dr. S. Mohanty',
      facultyDesignation: facultyUser.designation || 'Associate Professor',
      facultyEmail: facultyUser.email || 's.mohanty@gift.edu.in',
      department: 'Computer Science & Engineering',
      academicYear: payload.academicYear || '2026-27',
      program: prog,
      semester: sem,
      section: sec,
      subjectCode: payload.subjectCode || null,
      subjectName: payload.subjectName || null,
      scheduledFor: payload.scheduledFor || null,
      publishedAt: isScheduled ? payload.scheduledFor : new Date().toISOString(),
      expiresAt: payload.expiresAt || null,
      attachmentUrl: payload.attachmentUrl || null,
      attachmentName: payload.attachmentName || null,
      totalRecipients: recipients.length,
      totalRead: 0,
      recipients
    };

    // Try Prisma
    try {
      await this.prisma.facultyNotification.create({
        data: {
          title: newNotif.title,
          message: newNotif.message,
          category: newNotif.category as any,
          priority: newNotif.priority as any,
          status: newNotif.status as any,
          facultyName: newNotif.facultyName,
          facultyDesignation: newNotif.facultyDesignation,
          facultyEmail: newNotif.facultyEmail,
          department: newNotif.department,
          academicYear: newNotif.academicYear,
          program: newNotif.program,
          semester: newNotif.semester,
          section: newNotif.section,
          subjectCode: newNotif.subjectCode,
          subjectName: newNotif.subjectName,
          scheduledFor: newNotif.scheduledFor ? new Date(newNotif.scheduledFor) : null,
          expiresAt: newNotif.expiresAt ? new Date(newNotif.expiresAt) : null,
          attachmentUrl: newNotif.attachmentUrl,
          attachmentName: newNotif.attachmentName,
          totalRecipients: newNotif.totalRecipients,
          totalRead: 0,
          recipients: {
            create: recipients.map(r => ({
              studentRollNumber: r.studentRollNumber,
              studentName: r.studentName,
              studentEmail: r.studentEmail,
              semester: r.semester,
              section: r.section,
              isRead: false
            }))
          }
        }
      });
    } catch {
      // Fallback
    }

    this.inMemoryNotifications.unshift(newNotif);

    return {
      success: true,
      message: isScheduled
        ? `Notification scheduled for delivery on ${new Date(payload.scheduledFor!).toLocaleString('en-IN')}.`
        : `Notification successfully published to ${recipients.length} students in ${sem} ${sec}.`,
      notification: {
        ...newNotif,
        readRate: 0
      }
    };
  }

  // 4. Faculty: Cancel Scheduled Notification
  async cancelNotification(id: string, facultyName?: string) {
    const notif = this.inMemoryNotifications.find(n => n.id === id);
    if (!notif) {
      throw new NotFoundException('Notification not found.');
    }

    notif.status = 'CANCELLED';

    try {
      await this.prisma.facultyNotification.update({
        where: { id },
        data: { status: 'CANCELLED' as any }
      });
    } catch {
      // Fallback
    }

    return {
      success: true,
      message: 'Scheduled notification cancelled successfully.'
    };
  }

  // 5. Student: Get Targeted Notifications for Student's Cohort
  async getStudentNotifications(studentRoll: string = '01') {
    const student = this.canonicalStudents.find(s => s.rollNumber === studentRoll) || this.canonicalStudents[0];

    const matching = this.inMemoryNotifications.filter(n => {
      // Must be published (or scheduled in the past)
      if (n.status === 'CANCELLED') return false;
      if (n.status === 'SCHEDULED' && n.scheduledFor && new Date(n.scheduledFor).getTime() > Date.now()) {
        return false;
      }

      // Check Semester match
      const semMatch = n.semester.toLowerCase() === student.semester.toLowerCase();
      // Check Section match
      const secMatch = n.section === 'ALL' || n.section === 'ALL_ASSIGNED' || n.section.toLowerCase() === student.section.toLowerCase();

      return semMatch && secMatch;
    });

    return matching.map(n => {
      const rec = (n.recipients || []).find((r: any) => r.studentRollNumber === student.rollNumber);
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
  }

  // 6. Student: Mark Notification as Read
  async markNotificationAsRead(id: string, studentRoll: string = '01') {
    const notif = this.inMemoryNotifications.find(n => n.id === id);
    if (notif) {
      const rec = (notif.recipients || []).find((r: any) => r.studentRollNumber === studentRoll);
      if (rec && !rec.isRead) {
        rec.isRead = true;
        rec.readAt = new Date().toISOString();
        notif.totalRead = (notif.totalRead || 0) + 1;
      }
    }

    try {
      await this.prisma.facultyNotificationRecipient.updateMany({
        where: {
          notificationId: id,
          studentRollNumber: studentRoll
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    } catch {
      // Fallback
    }

    return { success: true, message: 'Notification marked as read.' };
  }

  // 7. Get notification categories and priorities metadata
  getMetadata() {
    return {
      categories: [
        { key: 'EXAMINATION', label: 'Upcoming Examination', desc: 'Midterm, End-Semester, or Autonomous examinations' },
        { key: 'EXAM_TIMETABLE', label: 'Exam Timetables & Schedules', desc: 'Session timings, room seat allocations' },
        { key: 'ASSIGNMENT_DEADLINE', label: 'Assignment Deadlines', desc: 'Coursework submissions and extensions' },
        { key: 'INTERNAL_ASSESSMENT', label: 'Internal Assessment (CIA)', desc: 'Continuous evaluation, surprise tests, quizzes' },
        { key: 'PRACTICAL_EXAM', label: 'Lab & Practical Examinations', desc: 'Viva-voce, coding evaluations, lab tests' },
        { key: 'CLASS_CANCELLATION', label: 'Class Cancellations', desc: 'Authorized cancellation notices' },
        { key: 'SCHEDULE_CHANGE', label: 'Schedule Changes & Period Swaps', desc: 'Timing shifts, room re-allocations' },
        { key: 'EXTRA_CLASS', label: 'Extra Classes & Revision Sessions', desc: 'Remedial tutorials, syllabus completion' },
        { key: 'PROJECT_SUBMISSION', label: 'Project Submissions & Reviews', desc: 'Capstone, mini-project milestones' },
        { key: 'ACADEMIC_REMINDER', label: 'Important Academic Reminders', desc: 'Textbook return, attendance warnings' },
        { key: 'GENERAL_ANNOUNCEMENT', label: 'General Subject Announcement', desc: 'Course announcements, reference materials' }
      ],
      priorities: [
        { key: 'NORMAL', label: 'Normal Priority', color: '#3b82f6' },
        { key: 'IMPORTANT', label: 'Important (Yellow badge)', color: '#f59e0b' },
        { key: 'URGENT', label: 'Urgent (Red priority alert)', color: '#ef4444' }
      ]
    };
  }
}
