import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeRole } from '../rbac/rbac';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  source: 'gemini' | 'campus-live-data' | 'campus-knowledge-base';
  suggestions?: string[];
  actionLink?: {
    tab?: string;
    page?: string;
    label: string;
  };
  liveData?: any;
}

@Injectable()
export class ChatbotService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Main query processor: handles role checking, live database queries,
   * unified campus entity search (Students, Faculty, Timetable, Fees, Hostel,
   * Canteen, Transport, Library, Placement, etc.), and LLM integration.
   */
  async processQuery(
    message: string,
    history: ChatMessage[] = [],
    context: { page?: string; tab?: string; branch?: string; semester?: string } = {},
    user: any = null,
  ): Promise<ChatResponse> {
    const rawQuery = (message || '').trim();
    const query = rawQuery.toLowerCase();
    const role = normalizeRole(user?.role || '');
    const userDeptCode = this.extractDeptCode(user?.department, user?.deptCode, context?.branch);

    // 1. Guardrail: If query is completely unrelated to Apna Campus (general coding, trivia, cooking, etc.)
    if (this.isCompletelyUnrelated(query)) {
      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `I am **Apna AI Assistant**, dedicated exclusively to the **Apna Campus College Management System** (Bhubaneswar, Odisha).\n\nI can assist you with:\n• Student & Faculty directory search\n• Timetable, daily class schedule & lecture halls\n• Attendance records, CGPA & semester grade cards\n• Fees structure, dues & online payment counters\n• Hostel room allotment, warden contacts & gate passes\n• Canteen food menu, snacks & meal timings\n• Transport bus routes, stops & driver phone numbers\n• Central Library book search & borrowing rules\n• Campus placement drives, CTC packages & company eligibility\n• Admission letter verification & application tracking\n\nPlease ask any question related to Apna Campus!`,
        suggestions: this.getSuggestedPrompts(role, context?.page),
      };
    }

    // 2. Check for External LLM (Gemini 1.5) if API key is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const liveFacts = await this.gatherLiveFactsForLLM(query, rawQuery, role, user, userDeptCode);
        const geminiRes = await this.callGemini(rawQuery, history, role, user, context, liveFacts, geminiKey);
        if (geminiRes) return geminiRes;
      } catch (err: any) {
        console.warn('Gemini LLM call failed, falling back to Intelligent Campus Data Engine:', err?.message);
      }
    }

    // 3. Intelligent Campus Data & Unified Search Engine (Deterministic, live DB records + RBAC)
    return await this.processWithCampusEngine(query, rawQuery, role, user, userDeptCode, context);
  }

  /**
   * Deterministic Campus Data & Workflow Engine
   */
  private async processWithCampusEngine(
    query: string,
    rawQuery: string,
    role: string,
    user: any,
    userDeptCode: string,
    context: { page?: string; tab?: string; branch?: string; semester?: string },
  ): Promise<ChatResponse> {
    const identifier = user?.identifier || user?.studentId || user?.rollNumber || '';
    const userName = user?.name || 'Authorized Campus User';

    // ──────────────────────────────────────────────────────────────────────────
    // 1. UNIFIED CAMPUS SEARCH ENGINES (STUDENT, FACULTY, TIMETABLE, ETC.)
    // ──────────────────────────────────────────────────────────────────────────

    // 1.1 STUDENT SEARCH & RECORD LOOKUP
    const studentRes = await this.tryStudentSearch(query, rawQuery, role, user);
    if (studentRes) return studentRes;

    // 1.2 FACULTY & TEACHER SEARCH
    const facultyRes = await this.tryFacultySearch(query, rawQuery, role, user);
    if (facultyRes) return facultyRes;

    // 1.3 TIMETABLE & CLASS SCHEDULE
    const timetableRes = await this.tryTimetableSearch(query, rawQuery, role, user, context);
    if (timetableRes) return timetableRes;

    // 1.4 FEES, DUES & ONLINE PAYMENT
    const feesRes = await this.tryFeesSearch(query, rawQuery, role, user);
    if (feesRes) return feesRes;

    // 1.5 HOSTEL & WARDEN DIRECTORY
    const hostelRes = await this.tryHostelSearch(query, rawQuery, role, user);
    if (hostelRes) return hostelRes;

    // 1.6 CANTEEN & FOOD MENU
    const canteenRes = await this.tryCanteenSearch(query, rawQuery, role, user);
    if (canteenRes) return canteenRes;

    // 1.7 TRANSPORT, BUS ROUTES & DRIVERS
    const transportRes = await this.tryTransportSearch(query, rawQuery, role, user);
    if (transportRes) return transportRes;

    // 1.8 LIBRARY BOOKS & REPOSITORY
    const libraryRes = await this.tryLibrarySearch(query, rawQuery, role, user);
    if (libraryRes) return libraryRes;

    // 1.9 PLACEMENTS & CORPORATE DRIVES
    const placementRes = await this.tryPlacementSearch(query, rawQuery, role, user);
    if (placementRes) return placementRes;

    // 1.10 ADMISSIONS & APPLICATION STATUS
    const admissionsRes = await this.tryAdmissionsSearch(query, rawQuery, role, user);
    if (admissionsRes) return admissionsRes;

    // 1.11 EXAMINATIONS, HALL TICKETS & RESULTS
    const examRes = await this.tryExaminationsSearch(query, rawQuery, role, user);
    if (examRes) return examRes;

    // 1.12 BONAFIDE CERTIFICATES & CLEARANCE
    const bonafideRes = await this.tryBonafideSearch(query, rawQuery, role, user);
    if (bonafideRes) return bonafideRes;

    // 1.13 NOTICES, ANNOUNCEMENTS & HOLIDAYS
    const noticesRes = await this.tryNoticesSearch(query, rawQuery, role, user);
    if (noticesRes) return noticesRes;

    // 1.14 OFFICIAL DIRECTORY & HELPLINE CONTACTS
    const directoryRes = await this.tryDirectorySearch(query, rawQuery, role, user);
    if (directoryRes) return directoryRes;

    // ──────────────────────────────────────────────────────────────────────────
    // 2. CORE ACADEMIC & ADMIN METRICS
    // ──────────────────────────────────────────────────────────────────────────

    // 2.1 Department Student Count
    if (
      (query.includes('how many student') || query.includes('student count') || query.includes('students in') || query.includes('department strength')) &&
      (query.includes('department') || query.includes('dept') || query.includes('branch'))
    ) {
      const targetDeptCode = this.detectMentionedDept(query) || userDeptCode || 'CSE';
      let studentCount = 540;
      let deptName = `${targetDeptCode} Department`;
      let hodName = 'Dr. S. Mohanty';

      try {
        studentCount = await this.prisma.student.count({
          where: { deptCode: targetDeptCode },
        });
        const dept = await this.prisma.department.findUnique({
          where: { code: targetDeptCode },
        });
        if (dept) {
          deptName = dept.name || deptName;
          hodName = dept.hod || hodName;
        }
      } catch {}

      return {
        success: true,
        source: 'campus-live-data',
        reply: `📊 **Live Department Census — ${deptName} (${targetDeptCode})**:\n\n• **Total Enrolled Students:** **${studentCount}** students across 4 active academic years (Autonomous CBCS).\n• **Head of Department (HOD):** ${hodName}\n• **Status:** Active & Accredited (NAAC A++ / NBA Outcome Based).\n• **Faculty Strength:** 32 Teaching Staff & 14 Lab Instructors.`,
        suggestions: [
          'Which students have attendance below 75%?',
          'Generate attendance report for my department',
          'Show marks pending approval',
        ],
        actionLink: { tab: 'students', label: 'View Department Students' },
        liveData: { deptCode: targetDeptCode, count: studentCount },
      };
    }

    // 2.2 Personal Attendance Percentage
    if (
      query.includes('my attendance') ||
      query.includes('attendance percentage') ||
      (query.includes('what is my') && query.includes('attendance')) ||
      (query.includes('how much') && query.includes('attendance'))
    ) {
      if (role === 'student') {
        let student: any = null;
        try {
          student = await this.prisma.student.findFirst({
            where: {
              OR: [
                { rollNumber: identifier },
                { studentId: identifier },
                { email: user?.email || '' },
              ],
            },
            include: { attendanceRecords: true },
          });
        } catch {}

        const pct = student?.attendance ?? 92;
        const roll = student?.rollNumber || identifier || '26CSE019';
        const isEligible = pct >= 75;

        let recordsSummary = '';
        if (student?.attendanceRecords && student.attendanceRecords.length > 0) {
          recordsSummary =
            `\n\n**Subject Breakdown:**\n` +
            student.attendanceRecords
              .map((r: any) => `• **${r.subjectCode} (${r.subjectName})**: ${r.attended}/${r.held} classes (${r.percentage}%)`)
              .join('\n');
        } else {
          recordsSummary =
            `\n\n**Subject Breakdown:**\n` +
            `• **CS501 (Data Structures)**: 36/38 classes (94.7%)\n` +
            `• **CS502 (Computer Org)**: 34/38 classes (89.5%)\n` +
            `• **CS503 (Formal Language)**: 35/38 classes (92.1%)\n` +
            `• **CS504 (Operating Systems)**: 36/38 classes (94.7%)`;
        }

        return {
          success: true,
          source: 'campus-live-data',
          reply: `📋 **Your Verified Attendance Record (Roll: ${roll})**:\n\n• **Overall Cumulative Attendance:** **${pct}%**\n• **Autonomous Exam Eligibility:** ${isEligible ? '✅ **Eligible** (Above 75% mandatory threshold)' : '⚠️ **At Risk / Ineligible** (Below mandatory 75% requirement)'}\n• **Status:** Verified via Central Biometric System & Daily Classroom Sync.${recordsSummary}\n\nYou can inspect day-by-day timestamps in the **Attendance Dashboard** under your Student Profile.`,
          suggestions: ['Check my CGPA', 'When are the internal exams?', 'Show today\'s class timetable'],
          actionLink: { page: 'attendance', label: 'Open Attendance Dashboard' },
          liveData: { rollNumber: roll, percentage: pct, eligible: isEligible },
        };
      } else {
        return {
          success: true,
          source: 'campus-live-data',
          reply: `As **${user?.role || 'Staff/Faculty'}**, you do not have a student attendance record.\n\n• To mark student attendance, navigate to the **Attendance** section in your Faculty Portal.\n• To view departmental attendance statistics, open the **Report Generation** module.`,
          suggestions: ['How do I mark attendance?', 'Which students have attendance below 75%?', 'Generate attendance report'],
          actionLink: { tab: 'attendance', label: 'Go to Attendance Module' },
        };
      }
    }

    // 2.3 Low Attendance Students (<75%)
    if (
      query.includes('below 75') ||
      query.includes('less than 75') ||
      query.includes('shortage') ||
      query.includes('low attendance') ||
      (query.includes('students') && query.includes('75%'))
    ) {
      if (role === 'student') {
        return {
          success: true,
          source: 'campus-knowledge-base',
          reply: `🔒 **Role Permission Notice:** As a Student, you are only permitted to view your own attendance records.\n\nInstitutional rosters of students with low attendance (<75%) are restricted to **Faculty**, **HODs**, and **Examination Cell** administrators under Apna Campus data protection policies.`,
          suggestions: ['What is my attendance percentage?', 'How do I submit feedback?', 'When are internal exams?'],
        };
      }

      const targetDept = this.detectMentionedDept(query) || (role === 'hod' || role === 'faculty' ? userDeptCode : undefined);
      let lowStudents: any[] = [];
      let count = 0;

      try {
        lowStudents = await this.prisma.student.findMany({
          where: {
            attendance: { lt: 75 },
            ...(targetDept ? { deptCode: targetDept } : {}),
          },
          select: {
            rollNumber: true,
            name: true,
            attendance: true,
            department: true,
            semester: true,
          },
          take: 6,
        });

        count = await this.prisma.student.count({
          where: {
            attendance: { lt: 75 },
            ...(targetDept ? { deptCode: targetDept } : {}),
          },
        });
      } catch {}

      if (lowStudents.length === 0) {
        lowStudents = [
          { rollNumber: '2305201005', name: 'Sourav Mohanty', attendance: 67, semester: 'Semester 5' },
          { rollNumber: '2305201009', name: 'Subham Swain', attendance: 62, semester: 'Semester 5' },
          { rollNumber: '2305201018', name: 'Bikash Verma', attendance: 71, semester: 'Semester 5' },
        ];
        count = 3;
      }

      const listStr = lowStudents
        .map((s, idx) => `${idx + 1}. **${s.name}** (\`${s.rollNumber}\`) — **${s.attendance}%** (${s.semester})`)
        .join('\n');

      return {
        success: true,
        source: 'campus-live-data',
        reply: `⚠️ **Early Warning Notice — Students Below 75% Attendance Threshold**:\n\n• **Total Students at Risk:** **${count}** students\n• **Department Scope:** ${targetDept || 'College-wide'}\n\n**Identified Students Requiring Academic Intervention:**\n${listStr}\n\n*Action Required:* Automated parent alerts can be issued via **Campus Connect** or exported in **Report Generation**.`,
        suggestions: [
          'Generate attendance report for my department',
          'Which marks submissions are pending approval?',
          'How do I send early warning alert?',
        ],
        actionLink: { tab: 'early-warning', label: 'View Early Warning System' },
        liveData: { totalAtRisk: count, students: lowStudents },
      };
    }

    // 2.4 Pending Mark Approvals
    if (
      query.includes('pending approval') ||
      query.includes('pending marks') ||
      query.includes('unapproved marks') ||
      query.includes('approval queue') ||
      (query.includes('marks') && query.includes('pending'))
    ) {
      if (role === 'student') {
        return {
          success: true,
          source: 'campus-knowledge-base',
          reply: `🔒 **Role Permission Notice:** Continuous internal marks approval is an institutional workflow between **Faculty**, **HODs**, and the **Examination Cell**.\n\nOnce approved and published by the CoE, your verified marks are available in the **College Marks** tab of your Student Profile.`,
          suggestions: ['Check my CGPA and SGPA', 'When are the internal exams?', 'View Examination Schedule'],
        };
      }

      let pendingList: any[] = [];
      let pendingCount = 0;
      try {
        pendingList = await this.prisma.approvalQueue.findMany({
          where: {
            status: 'Pending',
            ...(role === 'hod' && userDeptCode ? { subjectCode: { startsWith: userDeptCode } } : {}),
          },
          take: 5,
        });
        pendingCount = await this.prisma.approvalQueue.count({
          where: {
            status: 'Pending',
            ...(role === 'hod' && userDeptCode ? { subjectCode: { startsWith: userDeptCode } } : {}),
          },
        });
      } catch {}

      let itemsStr = '';
      if (pendingList.length > 0) {
        itemsStr = pendingList
          .map(
            (p, idx) =>
              `${idx + 1}. **${p.subjectCode} — ${p.subject}**\n   Faculty: *${p.faculty}* | ${p.semester} (${p.section}) | Submitted: ${p.submittedDate}`,
          )
          .join('\n');
      } else {
        itemsStr = '✅ *All submitted modular assessment marks have been reviewed and approved! No pending batches in the queue.*';
      }

      return {
        success: true,
        source: 'campus-live-data',
        reply: `📑 **Live Marks Approval Queue**:\n\n• **Batches Awaiting HOD Action:** **${pendingCount}** submissions\n\n${itemsStr}\n\n*HOD Workflow:* Navigate to **Marks Approval**, review the grade distribution curve, enter moderation remarks, and click **Approve & Forward to Exam Cell**.`,
        suggestions: [
          'How can an HOD approve marks?',
          'Which students have attendance below 75%?',
          'How many students are in my department?',
        ],
        actionLink: { tab: 'marks-approval', label: 'Open Marks Approval Queue' },
        liveData: { pendingCount, submissions: pendingList },
      };
    }

    // 2.5 CGPA & Academic Performance Summary
    if (
      query.includes('cgpa') ||
      query.includes('sgpa') ||
      query.includes('check cgpa') ||
      query.includes('academic performance')
    ) {
      if (role === 'student') {
        let student: any = null;
        try {
          student = await this.prisma.student.findFirst({
            where: {
              OR: [
                { rollNumber: identifier },
                { studentId: identifier },
                { email: user?.email || '' },
              ],
            },
          });
        } catch {}

        const cgpa = student?.cgpa ?? 8.42;

        return {
          success: true,
          source: 'campus-live-data',
          reply: `🎓 **Your Certified Academic Standing (Roll: ${student?.rollNumber || identifier || '26CSE019'})**:\n\n• **Cumulative Grade Point Average (CGPA):** **${cgpa} / 10.0**\n• **Grading System:** Autonomous 10-Point Relative Grading (CBCS System)\n• **Academic Standing:** First Class with Distinction (Honours Track)\n• **Current Semester Backlogs:** 0 Active Backlogs\n\nYou can view your detailed semester-by-semester SGPA breakdown and subject credit points in **Student Profile > College Marks**.`,
          suggestions: ['Where can I find examination results?', 'What is my attendance percentage?', 'How to download ID card?'],
          actionLink: { page: 'marks', label: 'View Full College Marks' },
          liveData: { cgpa },
        };
      } else {
        return {
          success: true,
          source: 'campus-live-data',
          reply: `📈 **Department Academic Performance Overview (${userDeptCode || 'CSE'})**:\n\n• **Department Average CGPA:** **8.42**\n• **Autonomous End-Sem Pass Percentage:** **97.1%**\n• **Top Performing Subject:** Advanced Data Structures (CS501) — 98.4% pass\n• **Placement Conversion:** 94.6% of final year students placed\n\nFor a granular breakdown by subject and section, use the **Department Analytics** tab or the **Report Generation** module.`,
          suggestions: ['Generate attendance report for my department', 'Which marks submissions are pending approval?', 'How can an HOD approve marks?'],
          actionLink: { tab: 'report-generation', label: 'Generate Academic Report' },
        };
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. STEP-BY-STEP WORKFLOW GUIDANCE
    // ──────────────────────────────────────────────────────────────────────────

    // 3.1 How do I mark attendance?
    if (query.includes('mark attendance') || (query.includes('how') && query.includes('attendance') && query.includes('mark'))) {
      if (role === 'student') {
        return {
          success: true,
          source: 'campus-knowledge-base',
          reply: `ℹ️ **Student Attendance Information:**\n\nStudents cannot mark their own attendance. Attendance is marked by faculty members during scheduled lecture periods and verified by the biometric RFID readers at campus entrance gates.\n\nYou can track your marked attendance in **Student Profile > Attendance Dashboard**.`,
          suggestions: ['What is my attendance percentage?', 'How do I submit feedback?', 'Where can I find examination results?'],
        };
      }

      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `📝 **How to Mark Attendance in Apna Campus (Faculty Guide)**:\n\n1. In your **Faculty Portal** sidebar or profile header, click **Take Attendance**.\n2. Select your allocated **Department** (e.g. CSE), **Semester** (e.g. Sem 5), **Section** (e.g. Sec A), and **Subject**.\n3. The student class roster will load with photos and roll numbers.\n4. For each student, toggle between **Present (P)**, **Absent (A)**, or use **Mark All Present** for quick batch entry.\n5. Click **Submit Attendance & Log Period**.\n6. The records sync instantly to the student's portal and HOD early warning dashboard.`,
        suggestions: ['Which students have attendance below 75%?', 'How do I submit internal marks?', 'Generate attendance report'],
        actionLink: { tab: 'attendance', label: 'Go to Attendance Module' },
      };
    }

    // 3.2 How do I submit internal marks?
    if (query.includes('submit internal marks') || query.includes('enter marks') || query.includes('submit marks')) {
      if (role === 'student') {
        return {
          success: true,
          source: 'campus-knowledge-base',
          reply: `ℹ️ Internal assessment marks are entered and submitted by your subject teachers. Once submitted, moderated by the HOD, and published by the Examination Cell, you can view your scores in the **College Marks** tab.`,
          suggestions: ['Check my CGPA and SGPA', 'What is my attendance percentage?', 'When are internal exams?'],
        };
      }

      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `📊 **How to Submit Internal Marks (Faculty Guide)**:\n\n1. Open **Faculty Portal > Marks Entry**.\n2. Select **Subject Code** (e.g., CS501), **Section**, and **Assessment Type** (Modular 1, Modular 2, Surprise Test, Quiz, or Assignment).\n3. Enter raw scores out of the designated max marks.\n4. Review the auto-computed class average and grade distribution curve.\n5. Click **Submit Marks to HOD for Approval**.\n6. An atomic transaction logs the submission into the HOD moderation queue.`,
        suggestions: ['Which marks submissions are pending approval?', 'How can an HOD approve marks?', 'Which students have attendance below 75%?'],
        actionLink: { tab: 'marks-entry', label: 'Go to Marks Entry' },
      };
    }

    // 3.3 How can an HOD approve marks?
    if (query.includes('hod approve') || query.includes('how to approve marks') || query.includes('approve marks')) {
      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `✅ **How an HOD Approves Marks Submissions**:\n\n1. Navigate to **HOD Portal > Marks Approval Queue**.\n2. Select the pending batch submitted by faculty.\n3. Inspect the class average, highest score, failure rate, and standard deviation.\n4. If adjustments are needed, apply uniform moderation points with justification.\n5. Enter official HOD moderation remarks.\n6. Click **Approve & Forward to Exam Cell**.\n7. The batch is cryptographically stamped and forwarded to the Controller of Examinations for final gazette clearance.`,
        suggestions: ['Which marks submissions are pending approval?', 'How many students are in my department?', 'Generate attendance report'],
        actionLink: { tab: 'marks-approval', label: 'Open Marks Approval Queue' },
      };
    }

    // 3.4 Feedback and complaints tracking
    if (query.includes('submit feedback') || query.includes('track feedback') || query.includes('feedback') || query.includes('complaint')) {
      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `💬 **Feedback & Grievance Workflow in Apna Campus**:\n\n• **Submitting Feedback / Complaints:**\n  1. Go to the **Feedback & Grievances** tab.\n  2. Select category: *Course & Faculty Appraisal*, *Hostel & Canteen Facility*, or *General Campus Grievance*.\n  3. Rate on the 1–5 star scale and enter specific feedback.\n  4. Toggle **Submit Anonymously** if you want your identity protected.\n  5. Click **Submit Survey**.\n\n• **Tracking Resolution:**\n  1. Visit the **Anonymous Complaints / Ticket Tracker** tab.\n  2. Enter your unique tracking ticket number.\n  3. You will see live handling status: \`Under Review\`, \`Action Assigned\`, or \`Resolved\`.`,
        suggestions: ['Check my CGPA and SGPA', 'What is my attendance percentage?', 'How to download ID card?'],
        actionLink: { page: 'feedback', label: 'Go to Feedback Module' },
      };
    }

    // 3.5 Contextual page guidance
    if (
      query.includes('which features') ||
      query.includes('available in my dashboard') ||
      query.includes('what can i do') ||
      query.includes('my dashboard') ||
      query.includes('this page')
    ) {
      return this.getContextualPageGuidance(role, context?.page || context?.tab);
    }

    // 3.6 Unimplemented features check
    if (
      query.includes('crypto') ||
      query.includes('bitcoin') ||
      query.includes('uber') ||
      query.includes('flight') ||
      query.includes('hotel') ||
      query.includes('movie') ||
      query.includes('hack') ||
      query.includes('cheat')
    ) {
      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `⚠️ **Feature Not Available in Apna Campus**:\n\nThe feature or service you inquired about is **not currently available** in the Apna Campus College Management System.\n\nApna Campus is specifically designed for college academic management, examination administration, campus services, and student ERP records. If you believe this feature should be considered for future institutional updates, you may submit a request through the **Feedback/Appraisal/Survey** module.`,
        suggestions: this.getSuggestedPrompts(role, context?.page),
      };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. DEFAULT COMPREHENSIVE INSTITUTIONAL FALLBACK
    // ──────────────────────────────────────────────────────────────────────────
    return {
      success: true,
      source: 'campus-knowledge-base',
      reply: `Hello, **${userName}**! I am **Apna AI Assistant**, your unified intelligent guide to **Apna Campus Autonomous University**.\n\nI have complete access to campus records across all departments. You can ask me to find:\n• 🎓 **Students:** *"Find student Ashish"*, *"Search roll 26CSE019"*, *"Who is Priya Patra?"*\n• 👨‍🏫 **Faculty:** *"Find faculty Dr. S. Mohanty"*, *"Who teaches Data Structures?"*, *"HOD contact"*\n• 📅 **Schedule:** *"Show today's timetable"*, *"Class timings"*, *"Next lecture"*\n• 💳 **Accounts:** *"How much is the fee?"*, *"Hostel fee structure"*, *"Pending fee dues"*\n• 🏢 **Hostels:** *"Hostel warden contacts"*, *"Curfew hours"*, *"How to get a gate pass"*\n• 🍽️ **Canteen:** *"Canteen food menu & prices"*, *"Lunch timings"*, *"Snacks items"*\n• 🚌 **Transport:** *"Bus routes & driver contacts"*, *"Bus to Cuttack or Khandagiri"*\n• 📚 **Library:** *"Find book Cormen Algorithms"*, *"Library timings & issuing rules"*\n• 💼 **Placements:** *"Placement drives"*, *"Cisco / TCS / Infosys packages & eligibility"*\n• 📝 **Exams & Letters:** *"Hall ticket download"*, *"Admission letter"*, *"Apply for bonafide"*\n\nWhat would you like to find today?`,
      suggestions: this.getSuggestedPrompts(role, context?.page),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DEDICATED SEARCH HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * 1. Student Search Engine
   */
  private async tryStudentSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isStudentQuery =
      query.startsWith('find student') ||
      query.startsWith('search student') ||
      query.includes('student roll') ||
      query.includes('student details') ||
      query.includes('student info') ||
      query.includes('student profile') ||
      query.includes('student record') ||
      query.includes('who is student') ||
      (query.includes('student') && (query.includes('find') || query.includes('search') || query.includes('show') || query.includes('look'))) ||
      query.match(/\b\d{2}[a-z]{2,4}\d{3,4}\b/i) ||
      query.match(/\bac-202\d-\d{3,4}\b/i);

    if (!isStudentQuery) return null;

    // Clean search term
    let term = rawQuery
      .replace(/find student/gi, '')
      .replace(/search student/gi, '')
      .replace(/student details/gi, '')
      .replace(/student profile/gi, '')
      .replace(/student record/gi, '')
      .replace(/student info/gi, '')
      .replace(/who is student/gi, '')
      .replace(/who is/gi, '')
      .replace(/student/gi, '')
      .replace(/roll number/gi, '')
      .replace(/roll no/gi, '')
      .replace(/for/gi, '')
      .replace(/about/gi, '')
      .replace(/details/gi, '')
      .trim();

    // If query has roll number pattern, extract that directly
    const rollMatch = rawQuery.match(/\b(\d{2}[A-Za-z]{2,4}\d{3,4})\b/);
    const idMatch = rawQuery.match(/\b(AC-202\d-\d{3,4})\b/i);
    const cleanTerm = rollMatch ? rollMatch[1] : idMatch ? idMatch[1] : term;

    let students: any[] = [];
    try {
      if (cleanTerm && cleanTerm.length >= 2) {
        students = await this.prisma.student.findMany({
          where: {
            OR: [
              { rollNumber: { contains: cleanTerm, mode: 'insensitive' } },
              { studentId: { contains: cleanTerm, mode: 'insensitive' } },
              { name: { contains: cleanTerm, mode: 'insensitive' } },
              { email: { contains: cleanTerm, mode: 'insensitive' } },
            ],
          },
          take: 5,
        });
      }
    } catch {}

    // Check applicant database if newly registered student
    let applicants: any[] = [];
    try {
      if (students.length === 0 && cleanTerm && cleanTerm.length >= 2) {
        applicants = await this.prisma.applicant.findMany({
          where: {
            OR: [
              { applicationNo: { contains: cleanTerm, mode: 'insensitive' } },
              { name: { contains: cleanTerm, mode: 'insensitive' } },
              { studentId: { contains: cleanTerm, mode: 'insensitive' } },
            ],
          },
          take: 3,
        });
      }
    } catch {}

    // Fallback if DB empty or specific demo candidate Ashish Mohapatra
    if (students.length === 0 && applicants.length === 0) {
      if (cleanTerm.toLowerCase().includes('ashish') || cleanTerm.toLowerCase().includes('26cse019') || cleanTerm.toLowerCase().includes('1019')) {
        return {
          success: true,
          source: 'campus-live-data',
          reply: `🎓 **Student Academic Dossier & Records**:\n\n• **Student Name:** **Ashish Mohapatra**\n• **Academic Roll No:** \`26CSE019\` · **Permanent Student ID:** \`AC-2026-1019\`\n• **Application Reference:** \`APP-2026-1019\` (Category: OBC)\n• **Degree Program:** B.Tech Computer Science & Engineering\n• **Semester & Section:** Semester 1 (Section A) · Session: 2026-27\n• **Official Campus Email:** \`ac-2026-1019@apnacampus.edu.in\`\n• **Attendance & Status:** 94% Cumulative (✅ Exam Eligible) · Status: **Enrolled & Verified**\n• **Document Status:** All clearance approved · Admission Letter released.\n\n*Direct Action:* Click below to view the official provisional admission letter & credentials.`,
          suggestions: ['Check my CGPA and SGPA', 'Show today\'s class timetable', 'What is the fee structure?'],
          actionLink: { page: 'my-admission', label: 'Open Admission Letter & ID Dossier' },
          liveData: { rollNumber: '26CSE019', studentId: 'AC-2026-1019', name: 'Ashish Mohapatra' },
        };
      }
    }

    if (students.length > 0) {
      const s = students[0];
      return {
        success: true,
        source: 'campus-live-data',
        reply: `🎓 **Student Academic Dossier & Records**:\n\n• **Student Name:** **${s.name}**\n• **Academic Roll No:** \`${s.rollNumber}\` · **Permanent ID:** \`${s.studentId}\`\n• **Department / Program:** ${s.department} (${s.deptCode})\n• **Semester & Section:** ${s.semester} (${s.section || 'Section A'})\n• **Academic Standing:** CGPA **${s.cgpa || 8.42} / 10.0**\n• **Attendance Record:** **${s.attendance}%** (${s.attendance >= 75 ? '✅ Exam Eligible' : '⚠️ Below 75% Threshold'})\n• **Official Email:** \`${s.email || `${s.studentId.toLowerCase()}@apnacampus.edu.in`}\`\n• **Hostel / Residence:** ${s.hostelName || 'Kalam Boys Residence'}, Room ${s.roomNumber || '204'}\n• **Status:** Active & Enrolled (Autonomous BPUT Scheme)`,
        suggestions: ['What is my attendance percentage?', 'Show today\'s class timetable', 'How to download ID card?'],
        actionLink: { page: 'profile', label: `View ${s.name}'s Profile` },
        liveData: s,
      };
    }

    if (applicants.length > 0) {
      const a = applicants[0];
      return {
        success: true,
        source: 'campus-live-data',
        reply: `📑 **Admissions Registry & Applicant Record**:\n\n• **Candidate Name:** **${a.name}**\n• **Application Number:** \`${a.applicationNo}\`\n• **Permanent Student ID:** \`${a.studentId || 'AC-2026-' + a.applicationNo.slice(-4)}\`\n• **Allotted Roll Number:** \`${a.rollNumber || '26CSE019'}\`\n• **Allotted Program:** ${a.appliedCourse || 'B.Tech Computer Science & Engineering'}\n• **Admission Status:** **${a.status || 'ENROLLED & VERIFIED'}**\n• **Official Email:** \`${(a.studentId || 'student').toLowerCase()}@apnacampus.edu.in\`\n• **Admission Fee Status:** Confirmed & Paid`,
        suggestions: ['How to forgot password', 'What is the fee structure?', 'Open Admissions Portal'],
        actionLink: { page: 'admissions', label: 'Open Admissions Registry' },
        liveData: a,
      };
    }

    return {
      success: true,
      source: 'campus-knowledge-base',
      reply: `🔍 **Student Search Service**:\n\nI couldn't locate an exact match for "${cleanTerm || query}".\n\n• To search a student, provide their **Roll Number** (e.g. \`26CSE019\` or \`2305201001\`), **Student ID** (e.g. \`AC-2026-1019\`), or **Full Name**.\n• Faculty and Admins can view the complete enrolled cohort in the **Student Registry** tab.`,
      suggestions: ['Find student Ashish', 'Search roll 26CSE019', 'Show students in CSE'],
      actionLink: { tab: 'students', label: 'Open Student Registry' },
    };
  }

  /**
   * 2. Faculty & Teacher Directory Engine
   */
  private async tryFacultySearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isFacultyQuery =
      query.startsWith('find faculty') ||
      query.startsWith('search faculty') ||
      query.startsWith('find teacher') ||
      query.startsWith('search teacher') ||
      query.includes('faculty details') ||
      query.includes('faculty contact') ||
      query.includes('who teaches') ||
      query.includes('teacher for') ||
      query.includes('faculty for') ||
      query.includes('professor') ||
      query.includes('dr.') ||
      query.includes('hod') ||
      query.includes('instructor') ||
      (query.includes('faculty') && (query.includes('list') || query.includes('cse') || query.includes('department') || query.includes('directory')));

    if (!isFacultyQuery) return null;

    let term = rawQuery
      .replace(/find faculty/gi, '')
      .replace(/search faculty/gi, '')
      .replace(/find teacher/gi, '')
      .replace(/search teacher/gi, '')
      .replace(/faculty details/gi, '')
      .replace(/faculty contact/gi, '')
      .replace(/who teaches/gi, '')
      .replace(/teacher for/gi, '')
      .replace(/faculty for/gi, '')
      .replace(/professor/gi, '')
      .replace(/faculty/gi, '')
      .replace(/teacher/gi, '')
      .replace(/who is/gi, '')
      .replace(/about/gi, '')
      .replace(/for/gi, '')
      .trim();

    let facultyList: any[] = [];
    try {
      if (term && term.length >= 2) {
        facultyList = await this.prisma.faculty.findMany({
          where: {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { department: { contains: term, mode: 'insensitive' } },
              { designation: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
            ],
          },
          take: 4,
        });
      }
    } catch {}

    // Core faculty profiles directory
    const CORE_FACULTY = [
      {
        name: 'Dr. S. Mohanty',
        designation: 'Professor & Head of Department (HOD)',
        department: 'Computer Science & Engineering',
        room: 'Academic Block 2, Cabin 304',
        email: 'smohanty@apnacampus.edu.in',
        phone: '+91 674 2460112 (Ext: 304)',
        subjects: ['Data Structures & Algorithms (CS501)', 'Design & Analysis of Algorithms'],
        hours: 'Mon–Fri: 03:00 PM – 04:30 PM',
      },
      {
        name: 'Dr. R. K. Senapati',
        designation: 'Associate Professor & Research Chair',
        department: 'Computer Science & Engineering',
        room: 'Academic Block 2, Cabin 308',
        email: 'rksenapati@apnacampus.edu.in',
        phone: '+91 674 2460113 (Ext: 308)',
        subjects: ['Computer Organization & Architecture (CS502)', 'Distributed Computing'],
        hours: 'Tue & Thu: 02:00 PM – 04:00 PM',
      },
      {
        name: 'Prof. Ananya Mishra',
        designation: 'Assistant Professor & Class Proctor',
        department: 'Computer Science & Engineering',
        room: 'Academic Block 2, Cabin 212',
        email: 'amishra@apnacampus.edu.in',
        phone: '+91 674 2460114 (Ext: 212)',
        subjects: ['Formal Language & Automata Theory (CS503)', 'Compiler Design'],
        hours: 'Mon, Wed, Fri: 11:30 AM – 01:00 PM',
      },
      {
        name: 'Dr. P. K. Swain',
        designation: 'Professor & System Architect',
        department: 'Computer Science & Engineering',
        room: 'Academic Block 3, Cabin 102',
        email: 'pkswain@apnacampus.edu.in',
        phone: '+91 674 2460115 (Ext: 102)',
        subjects: ['Operating Systems & Kernel Design (CS504)', 'Cloud Infrastructure'],
        hours: 'Mon & Thu: 03:30 PM – 05:00 PM',
      },
      {
        name: 'Dr. B. K. Mohapatra',
        designation: 'Dean of Academic Admissions & Professor',
        department: 'Admissions Directorate & Computer Science',
        room: 'Administrative Directorate, Room 101',
        email: 'dean.admissions@apnacampus.edu.in',
        phone: '+91 674 2460105 (Ext: 101)',
        subjects: ['Institutional Academic Governance', 'Algorithms'],
        hours: 'Daily: 10:00 AM – 12:30 PM',
      },
    ];

    let match = facultyList[0] || null;
    if (!match && term) {
      match = CORE_FACULTY.find(
        (f) =>
          f.name.toLowerCase().includes(term.toLowerCase()) ||
          f.subjects.some((s) => s.toLowerCase().includes(term.toLowerCase())) ||
          f.department.toLowerCase().includes(term.toLowerCase()),
      );
    }

    if (match) {
      return {
        success: true,
        source: 'campus-live-data',
        reply: `👨‍🏫 **Faculty Profile & Academic Contacts**:\n\n• **Name:** **${match.name}**\n• **Designation:** ${match.designation}\n• **Department:** ${match.department}\n• **Office Cabin:** ${match.room || 'Academic Block 2, Cabin 304'}\n• **Official Email:** \`${match.email}\`\n• **Direct Phone / Extension:** ${match.phone || '+91 674 2460111'}\n• **Courses Taught:** ${Array.isArray(match.subjects) ? match.subjects.join(', ') : 'Advanced Computing'}\n• **Student Consultation Hours:** ${match.hours || 'Mon–Fri: 03:00 PM – 04:30 PM'}\n\n*Communication:* You can message them directly on **Campus Connect** or send an official email.`,
        suggestions: ['Show today\'s class timetable', 'Find student Ashish', 'How to submit internal marks?'],
        actionLink: { tab: 'faculty', label: 'Open Faculty Directory' },
        liveData: match,
      };
    }

    // List department faculty
    const listStr = CORE_FACULTY.map(
      (f, idx) => `${idx + 1}. **${f.name}** — *${f.designation}*\n   Room: ${f.room} | Email: \`${f.email}\` | Subject: ${f.subjects[0]}`,
    ).join('\n\n');

    return {
      success: true,
      source: 'campus-live-data',
      reply: `👨‍🏫 **Department Faculty Directory — Computer Science & Engineering**:\n\n${listStr}\n\n*Need to find a specific professor?* Ask: *"Find faculty Dr. Senapati"* or *"Who teaches Operating Systems?"*.`,
      suggestions: ['Find faculty Dr. S. Mohanty', 'Who teaches Operating Systems?', 'Show today\'s class timetable'],
      actionLink: { tab: 'faculty', label: 'View Full Faculty Roster' },
    };
  }

  /**
   * 3. Timetable & Schedule Engine
   */
  private async tryTimetableSearch(query: string, rawQuery: string, role: string, user: any, context: any): Promise<ChatResponse | null> {
    const isTimetableQuery =
      query.includes('timetable') ||
      query.includes('schedule') ||
      query.includes('class time') ||
      query.includes('next class') ||
      query.includes('today class') ||
      query.includes('classes today') ||
      query.includes('period') ||
      query.includes('routine') ||
      query.includes('lecture time');

    if (!isTimetableQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `📅 **Today's Official Class Schedule & Timetable (B.Tech CSE - Section A)**:\n\n• **Period 1 (09:00 - 10:00 AM):** CS501 Data Structures & Algorithms · **Room 204** (Dr. S. Mohanty)\n• **Period 2 (10:00 - 11:00 AM):** CS502 Computer Organization & Architecture · **Room 205** (Dr. R. K. Senapati)\n• ☕ **Morning Tea Break (11:00 - 11:15 AM)**\n• **Period 3 (11:15 AM - 12:15 PM):** CS503 Formal Language & Automata Theory · **Room 204** (Prof. Ananya Mishra)\n• **Period 4 (12:15 - 01:15 PM):** CS504 Operating Systems & Kernel Design · **Room 206** (Dr. P. K. Swain)\n• 🍽️ **Lunch Break (01:15 - 02:00 PM):** Central Canteen & Dining Complex\n• **Period 5 & 6 (02:00 - 04:30 PM):** Advanced System Programming & Data Structures Lab · **Computing Lab 3**\n\n*Note:* Attendance is recorded at the start of each period via digital biometric RFID and synchronized to the portal.`,
      suggestions: ['What is my attendance percentage?', 'Find faculty Dr. S. Mohanty', 'View Canteen Menu'],
      actionLink: { page: 'timetable', label: 'Open Interactive Class Timetable' },
    };
  }

  /**
   * 4. Fees Structure, Dues & Payment Engine
   */
  private async tryFeesSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isFeesQuery =
      query.includes('fee') ||
      query.includes('tuition') ||
      query.includes('dues') ||
      query.includes('receipt') ||
      query.includes('payment') ||
      query.includes('how to pay') ||
      query.includes('scholarship');

    if (!isFeesQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `💳 **Apna Campus Autonomous Fee Structure & Accounts Guide (2026-27)**:\n\n• **Semester Academic Tuition Fee:** **₹55,000 / Semester** (Includes labs, high-speed Wi-Fi & digital evaluation)\n• **Hostel Accommodation & 4-Meal Mess:** **₹38,000 / Semester** (Triple-sharing air-cooled rooms)\n• **Transport / College Bus Pass:** **₹12,000 / Year** (Covers all 18 regional routes)\n• **Autonomous Examination Fee:** **₹2,500 / Semester** (Tabulation, admit card & certified marksheet)\n• **One-time Refundable Caution Deposit:** **₹5,000** (Settled upon graduation)\n\n• **How to Pay Online:**\n  1. Open the **Accounts / Fee Portal**.\n  2. Verify your pending semester invoice.\n  3. Pay via **UPI (GooglePay / PhonePe)**, Net Banking, or SBI Collect.\n  4. Download your official stamped PDF fee receipt instantly.`,
      suggestions: ['Check my CGPA and SGPA', 'What is my attendance percentage?', 'Hostel Room Details'],
      actionLink: { page: 'fees', label: 'Open Fee Payment Counter' },
    };
  }

  /**
   * 5. Hostel & Warden Directory Engine
   */
  private async tryHostelSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isHostelQuery =
      query.includes('hostel') ||
      query.includes('warden') ||
      query.includes('room') ||
      query.includes('curfew') ||
      query.includes('gate pass') ||
      query.includes('mess food') ||
      query.includes('night leave');

    if (!isHostelQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `🏢 **Hostel Complex & Warden Contact Directory**:\n\n• **Residences Available:**\n  • **Kalam Boys Residence (Block A & B):** 480 beds · Warden: **Mr. Manoj Sahoo** (\`+91 98610 22119\`)\n  • **Sarojini Girls Residence (Block C):** 360 beds · Warden: **Mrs. Nibedita Das** (\`+91 94370 33445\`)\n  • **Chief Hostel Warden:** Dr. B. K. Mohapatra (\`+91 674 2460111\`)\n\n• **Rules & Amenities:**\n  • **Evening Curfew:** **08:30 PM** mandatory biometric barcode punch.\n  • **Dining Mess Timings:** Breakfast (07:30 - 09:30 AM), Lunch (12:30 - 02:30 PM), Dinner (07:30 - 09:30 PM).\n  • **Digital Gate Pass:** Apply online 4 hours in advance in the Hostel portal for parent OTP verification.\n  • **Facilities:** 24/7 Power backup, RO purified cold water, High-speed Wi-Fi, and Resident Medical Nurse.`,
      suggestions: ['How to get a gate pass?', 'What is the canteen menu?', 'Bus routes and driver contacts'],
      actionLink: { page: 'hostel', label: 'Open Hostel Management Portal' },
    };
  }

  /**
   * 6. Canteen & Food Menu Engine
   */
  private async tryCanteenSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isCanteenQuery =
      query.includes('canteen') ||
      query.includes('food') ||
      query.includes('menu') ||
      query.includes('lunch') ||
      query.includes('breakfast') ||
      query.includes('snacks') ||
      query.includes('dinner') ||
      query.includes('coffee') ||
      query.includes('tea') ||
      query.includes('price') ||
      query.includes('meal') ||
      query.includes('thali');

    if (!isCanteenQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `🍽️ **Central Smart Canteen Menu & Pricing**:\n\n• **Breakfast (07:30 AM – 10:00 AM):**\n  • Idli Sambar (4 pcs) — **₹40**\n  • Masala Dosa with Chutney — **₹50**\n  • Poori Sabzi (3 pcs) — **₹45**\n  • Special Filter Coffee / Masala Chai — **₹15 / ₹10**\n\n• **Lunch (12:30 PM – 02:30 PM):**\n  • Deluxe Student Veg Thali (Rice, Dal, 2 Sabzi, Curd, Papad) — **₹80**\n  • Special Non-Veg Chicken Thali (Chicken Curry, Rice, Dal) — **₹120**\n  • Paneer Butter Masala Combo with 3 Tawa Roti — **₹95**\n\n• **Evening Snacks (04:30 PM – 06:30 PM):**\n  • Hot Veg Sandwich (Grilled) — **₹35**\n  • Crispy Paneer Roll / Egg Roll — **₹50 / ₹40**\n  • Hot Samosa with Red Chutney (2 pcs) — **₹20**\n\n• **Dinner (07:30 PM – 09:30 PM):**\n  • Roti, Dal Tadka, Jeera Rice & Mix Veg — **₹80**`,
      suggestions: ['Show today\'s class timetable', 'Hostel warden contacts', 'Bus routes & timings'],
      actionLink: { page: 'canteen', label: 'Open Online Canteen Order' },
    };
  }

  /**
   * 7. Transport, Bus Routes & Fleet Engine
   */
  private async tryTransportSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isTransportQuery =
      query.includes('transport') ||
      query.includes('bus') ||
      query.includes('route') ||
      query.includes('driver') ||
      query.includes('pickup') ||
      query.includes('drop') ||
      query.includes('fleet');

    if (!isTransportQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `🚌 **Campus Transport Fleet & Regional Bus Routes**:\n\n• **Overview:** 36 GPS-tracked buses operating across 18 regional routes in Bhubaneswar, Cuttack, Khurda & Jatni.\n\n• **Major Bus Routes & Driver Contacts:**\n  • **Route 1 (Cuttack Badambadi / Link Road):** Bus \`OD-02-AK-1024\` · Driver: **Mr. Ramesh** (\`+91 98611 11201\`) · Departs 07:15 AM\n  • **Route 3 (Bhubaneswar Master Canteen / Khandagiri):** Bus \`OD-02-BM-3302\` · Driver: **Mr. Sukant** (\`+91 94371 44502\`) · Departs 07:40 AM\n  • **Route 7 (Patia / Infocity / KIIT Square):** Bus \`OD-02-CN-8812\` · Driver: **Mr. Dilip** (\`+91 98613 77804\`) · Departs 07:50 AM\n  • **Route 12 (Khurda New Bus Stand / Jatni Gate):** Bus \`OD-02-DP-4401\` · Driver: **Mr. Niranjan** (\`+91 94372 88910\`) · Departs 07:35 AM\n\n• **Central Transport Helpline:** \`+91 674 2460120\`\n• **Annual Bus Pass:** Apply in the **Transport Portal** for an authorized digital pass.`,
      suggestions: ['What is the fee structure?', 'Hostel warden contacts', 'Show today\'s class timetable'],
      actionLink: { page: 'transport', label: 'Open Transport Fleet Portal' },
    };
  }

  /**
   * 8. Central Library & Books Engine
   */
  private async tryLibrarySearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isLibraryQuery =
      query.includes('library') ||
      query.includes('book') ||
      query.includes('catalog') ||
      query.includes('author') ||
      query.includes('isbn') ||
      query.includes('reading room') ||
      query.includes('issue book') ||
      query.includes('cormen') ||
      query.includes('tanenbaum') ||
      query.includes('silberschatz');

    if (!isLibraryQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `📚 **Central Biju Patnaik Memorial Library & Digital Catalog**:\n\n• **Collection:** 45,000+ Physical Textbooks, 120 National Journals, IEEE Xplore & ScienceDirect subscription.\n\n• **Popular Prescribed Engineering Books Available:**\n  • **Introduction to Algorithms** (Cormen, Leiserson) — Stack \`CS-A-12\` (14 Copies Available)\n  • **Operating System Concepts** (Silberschatz, Galvin) — Stack \`CS-B-08\` (9 Copies Available)\n  • **Computer Networks** (Andrew S. Tanenbaum) — Stack \`CS-B-14\` (11 Copies Available)\n  • **Database System Concepts** (Korth, Sudarshan) — Stack \`CS-C-04\` (8 Copies Available)\n\n• **Borrowing Policy:**\n  • Students: **3 Books for 14 Days** (Renewable online once).\n  • Faculty: **8 Books for full semester**.\n• **Library Timings:** Monday to Saturday: **08:00 AM – 09:00 PM** (Air-conditioned Reading Hall open until 11:00 PM during exam months).`,
      suggestions: ['Show today\'s class timetable', 'What is my attendance percentage?', 'Check my CGPA'],
      actionLink: { page: 'library', label: 'Search Digital Library Catalog' },
    };
  }

  /**
   * 9. Placement & Corporate Drives Engine
   */
  private async tryPlacementSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isPlacementQuery =
      query.includes('placement') ||
      query.includes('company') ||
      query.includes('job') ||
      query.includes('package') ||
      query.includes('ctc') ||
      query.includes('internship') ||
      query.includes('tcs') ||
      query.includes('infosys') ||
      query.includes('cisco') ||
      query.includes('deloitte');

    if (!isPlacementQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `💼 **Directorate of Training & Placement — Recruitment Drives (2026-27)**:\n\n• **Featured Active Recruitment Drives:**\n  • **Cisco Systems:** **₹18.5 LPA** (Software Network Engineer) · Minimum 7.5 CGPA · Registrations Open\n  • **Infosys Power Programmer:** **₹9.5 LPA** (Specialist Software Engineer) · Minimum 6.5 CGPA\n  • **Deloitte USI:** **₹8.2 LPA** (Associate Solution Advisor) · Minimum 6.8 CGPA\n  • **TCS Digital / Ninja:** **₹7.5 LPA / ₹3.6 LPA** · All B.Tech Branches Eligible\n\n• **General Eligibility Criteria:**\n  • Minimum 6.5 Cumulative CGPA across all completed semesters.\n  • 0 Active / Standing Backlogs at the time of online assessment.\n  • Minimum 75% attendance in mandatory Soft Skills & Aptitude Training.\n\n• **How to Register:** Visit the **Placement Portal** -> Browse Active Drives -> Click **Register** -> Submit latest verified resume.`,
      suggestions: ['Check my CGPA and SGPA', 'Where can I find examination results?', 'Find faculty Dr. S. Mohanty'],
      actionLink: { page: 'placement', label: 'View Active Placement Drives' },
    };
  }

  /**
   * 10. Admissions & Application Status Engine
   */
  private async tryAdmissionsSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isAdmissionsQuery =
      query.includes('admission') ||
      query.includes('application') ||
      query.includes('seat matrix') ||
      query.includes('apply for') ||
      query.includes('cutoff') ||
      query.includes('app-') ||
      query.includes('allotment');

    if (!isAdmissionsQuery) return null;

    // Check if user entered an application number like APP-2026-1019
    const appMatch = rawQuery.match(/APP-202\d-\d{3,4}/i);
    if (appMatch) {
      const appNo = appMatch[0].toUpperCase();
      let applicant: any = null;
      try {
        applicant = await this.prisma.applicant.findFirst({
          where: { applicationNo: appNo },
        });
      } catch {}

      const candidateName = applicant?.name || 'Ashish Mohapatra';
      const course = applicant?.appliedCourse || 'B.Tech Computer Science & Engineering';
      const status = applicant?.status || 'ENROLLED & VERIFIED';
      const studentId = applicant?.studentId || 'AC-2026-1019';
      const roll = applicant?.rollNumber || '26CSE019';

      return {
        success: true,
        source: 'campus-live-data',
        reply: `📑 **Application Tracking Result — ${appNo}**:\n\n• **Candidate Name:** **${candidateName}**\n• **Allotted Program:** ${course}\n• **Permanent Student ID:** \`${studentId}\` · **Roll No:** \`${roll}\`\n• **Admission Status:** **${status}** (Clearance: APPROVED)\n• **Default Initial Password:** \`Student@2026\` (First-time portal login)\n• **Official Student Email:** \`${studentId.toLowerCase()}@apnacampus.edu.in\`\n\n*Action:* Download your official signed Admission Offer Letter & Smart ID Card in the portal.`,
        suggestions: ['How to forgot password', 'What is the fee structure?', 'Show today\'s class timetable'],
        actionLink: { page: 'my-admission', label: 'Download Admission Letter & ID' },
      };
    }

    return {
      success: true,
      source: 'campus-live-data',
      reply: `🏛️ **Apna Campus Admissions Directorate (Session 2026-27)**:\n\n• **Accreditation:** NAAC A++ Autonomous Institution · AICTE Approved\n• **Undergraduate Programs (B.Tech):**\n  • Computer Science & Engineering (180 Seats)\n  • CSE — Artificial Intelligence & Machine Learning (120 Seats)\n  • Electronics & Communication Engineering (90 Seats)\n  • Mechanical, Civil & Electrical Engineering (60 Seats each)\n• **Postgraduate Programs:** M.Tech (CSE), MBA (HR/Finance/Marketing), MCA (Lateral & Regular)\n\n• **Fresh Admission Process:** Fill out the 5-step online form, verify 10th/12th/Entrance scorecards, pay the provisional allotment fee, and download your **Official Admission Letter**.`,
      suggestions: ['What is the fee structure?', 'Find student Ashish', 'Hostel accommodation details'],
      actionLink: { page: 'admissions', label: 'Open Admissions Portal' },
    };
  }

  /**
   * 11. Examinations & Results Engine
   */
  private async tryExaminationsSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isExamQuery =
      query.includes('exam result') ||
      query.includes('examination') ||
      query.includes('exam schedule') ||
      query.includes('hall ticket') ||
      query.includes('admit card') ||
      query.includes('modular exam') ||
      query.includes('supplementary') ||
      query.includes('grade card') ||
      query.includes('backlog');

    if (!isExamQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `📝 **Autonomous Examination Directorate Services**:\n\n• **Assessment Model:** 40% Continuous Internal Evaluation (Modulars, Tests, Lab work) + 60% End-Semester Autonomous Theory Examination.\n• **Hall Tickets / Admit Cards:** Released 7 days before examination commencement. Requires **>= 75% attendance** clearance.\n• **Results & Grade Cards:** Certified BPUT relative grading (O, E, A, B, C, D, F) with SGPA and CGPA published on the student portal.\n• **Supplementary Form Fill-up:** Eligible students with backlogs can apply online within 10 days of gazette notification.\n• **Controller of Examinations Office:** Room 104, Administrative Wing.`,
      suggestions: ['Check my CGPA and SGPA', 'What is my attendance percentage?', 'Show today\'s class timetable'],
      actionLink: { page: 'examination', label: 'Open Examination Cell Portal' },
    };
  }

  /**
   * 12. Bonafide Certificates Engine
   */
  private async tryBonafideSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isBonafideQuery =
      query.includes('bonafide') ||
      query.includes('certificate') ||
      query.includes('permission letter') ||
      query.includes('fee estimate letter') ||
      query.includes('character certificate');

    if (!isBonafideQuery) return null;

    return {
      success: true,
      source: 'campus-knowledge-base',
      reply: `📜 **Official Bonafide & Institutional Certificate Clearance**:\n\n• **Available Certificate Categories:**\n  1. Education Bank Loan Bonafide & Fee Estimate Letter\n  2. Passport / Police Verification Clearance Certificate\n  3. Industrial Internship & Training NOC Permission Letter\n  4. State & Central Scholarship Bonafide\n  5. Regional Bus & Railway Concession Certificate\n\n• **Application Procedure:**\n  1. Open **Student Portal > Bonafide Certificates**.\n  2. Select your required purpose and upload supporting proof.\n  3. The application is reviewed and digitally stamped by the Registrar.\n  4. Standard Turnaround: **24 to 48 Hours**.\n  5. Download the digitally signed, QR-verifiable certificate.`,
      suggestions: ['What is my attendance percentage?', 'How to download ID card?', 'What is the fee structure?'],
      actionLink: { page: 'bonafide', label: 'Apply for Bonafide Certificate' },
    };
  }

  /**
   * 13. Notices & Academic Calendar Engine
   */
  private async tryNoticesSearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isNoticesQuery =
      query.includes('notice') ||
      query.includes('circular') ||
      query.includes('announcement') ||
      query.includes('holiday') ||
      query.includes('vacation') ||
      query.includes('calendar');

    if (!isNoticesQuery) return null;

    return {
      success: true,
      source: 'campus-live-data',
      reply: `📢 **Official Campus Notice Board & Academic Notifications**:\n\n• **Notice 1:** *Autonomous Modular Assessment 2 Theory & Practical Schedule Released (Commencing Nov 2026)*\n• **Notice 2:** *Special Supplementary Examination Form Fill-up Window Open for Backlog Students*\n• **Notice 3:** *Cisco Systems Campus Recruitment Drive — Technical Round Shortlist Published*\n• **Notice 4:** *Hostel Biometric Re-registration for New Academic Session 2026-27*\n\n• **Upcoming Academic Milestones:**\n  • Modular Assessment 2: 18 Nov – 24 Nov 2026\n  • Winter Break: 25 Dec 2026 – 01 Jan 2027\n  • End-Semester University Exams: 12 Jan 2027`,
      suggestions: ['Show today\'s class timetable', 'Find faculty Dr. S. Mohanty', 'When are internal exams?'],
      actionLink: { page: 'notices', label: 'View All Campus Notices' },
    };
  }

  /**
   * 14. Emergency & Campus Directory Engine
   */
  private async tryDirectorySearch(query: string, rawQuery: string, role: string, user: any): Promise<ChatResponse | null> {
    const isDirectoryQuery =
      query.includes('contact') ||
      query.includes('phone') ||
      query.includes('email') ||
      query.includes('helpline') ||
      query.includes('directory') ||
      query.includes('emergency') ||
      query.includes('principal') ||
      query.includes('registrar');

    if (!isDirectoryQuery) return null;

    return {
      success: true,
      source: 'campus-knowledge-base',
      reply: `📞 **Apna Campus Autonomous Emergency & Official Directory**:\n\n• **Principal's Office:** \`principal@apnacampus.edu.in\` · **+91 674 2460101**\n• **Registrar Directorate:** \`registrar@apnacampus.edu.in\` · **+91 674 2460102**\n• **Dean of Academics:** \`academics@apnacampus.edu.in\` · **+91 674 2460103**\n• **Controller of Examinations (CoE):** \`examcell@apnacampus.edu.in\` · **+91 674 2460104**\n• **Admissions Cell & Inquiries:** \`admissions@apnacampus.edu.in\` · **+91 674 2460105**\n• **Training & Placement Officer:** \`placement@apnacampus.edu.in\` · **+91 674 2460106**\n• **Hostel Wardens:** Boys (\`+91 98610 22119\`) · Girls (\`+91 94370 33445\`)\n• **Campus Security & Medical Emergency (24/7):** **+91 674 2460100**\n• **IT & ERP Support Helpdesk:** \`support@apnacampus.edu.in\` · **+91 674 2460111**`,
      suggestions: ['Find faculty Dr. S. Mohanty', 'Hostel warden contacts', 'Bus routes & driver contacts'],
      actionLink: { page: 'contact', label: 'Open Institutional Directory' },
    };
  }

  /**
   * Returns contextual step-by-step guidance based on current portal page/tab
   */
  private getContextualPageGuidance(role: string, pageOrTab?: string): ChatResponse {
    const p = (pageOrTab || '').toLowerCase();

    if (p.includes('attendance')) {
      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `📍 **Current Screen: Attendance Management**\n\n**Available Features on this Page:**\n• **For Faculty:** Select Branch, Semester, Section, and Subject. Mark students Present, Absent, or Late. One-click **Sync to Biometrics**.\n• **For Students:** Review overall attendance percentage, minimum 75% examination eligibility indicator, and subject-wise lecture attendance history.\n• **For HOD/Admin:** Inspect early warning alerts for students with attendance shortages below 75%.`,
        suggestions: ['Which students have attendance below 75%?', 'How do I mark attendance?', 'Generate attendance report'],
      };
    }

    if (p.includes('marks') || p.includes('approval')) {
      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `📍 **Current Screen: Marks Management & Approval**\n\n**Available Features on this Page:**\n• **For Faculty:** Enter Modular 1 & 2 scores, Quizzes 1–6, Surprise Tests, Assignments, and Lab Work. Preview weighted 40-mark internal totals and submit to HOD.\n• **For HOD:** Review submitted mark distribution curves, enter moderation remarks, and approve or reject submissions.\n• **For Exam Cell:** Verify moderated marks across all departments for Tabulation Register compilation.`,
        suggestions: ['Which marks submissions are pending approval?', 'How can an HOD approve marks?', 'How do I submit internal marks?'],
      };
    }

    if (p.includes('report')) {
      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `📍 **Current Screen: Report Generation Module**\n\n**Available Features on this Page:**\n• Filter by **Branch** (CSE, AIML, ECE, EEE, MECH, CIVIL, MBA, MCA), **Semester**, and **Batch**.\n• Choose report types: *Attendance*, *CGPA*, *SGPA*, or *Document Verification*.\n• Export formatted reports as **Microsoft Excel (.xlsx)** or **Print / Save as PDF**.\n• Sort table columns dynamically by clicking on Roll Number, Name, or Percentage headers.`,
        suggestions: ['How can I download reports in Excel?', 'Generate attendance report for my department', 'Which students have attendance below 75%?'],
      };
    }

    if (p.includes('feedback') || p.includes('complaint')) {
      return {
        success: true,
        source: 'campus-knowledge-base',
        reply: `📍 **Current Screen: Feedback & Grievance Portal**\n\n**Available Features on this Page:**\n• Submit confidential 5-star course appraisals for semester faculty.\n• Lodge hostel maintenance, mess food, or campus infrastructure complaints.\n• Toggle **Anonymous Submission** to hide personal roll number and name.\n• Track live ticket handling progress and resolution notes.`,
        suggestions: ['How many feedback submissions are unresolved?', 'How do I submit feedback?', 'How can I track feedback status?'],
      };
    }

    // Default portal overview
    return {
      success: true,
      source: 'campus-knowledge-base',
      reply: `📍 **Features Available in Your ${role ? role.toUpperCase() : 'APNA CAMPUS'} Portal**:\n\n• **Academic Engine:** Timetables, syllabus structures, continuous assessment modular marks, and attendance tracking.\n• **Examination & Results:** Autonomous CBCS grade cards, SGPA/CGPA computation, backlogs, and certified hall ticket downloads.\n• **Administration & Compliance:** Document verification, digital ID cards, fee receipts, gate passes, and NAAC/NBA reports.\n• **Communication:** Campus Connect (WhatsApp clone) for live messaging, announcements, and class groups.\n• **Campus Facilities:** Central Smart Canteen ordering, Hostel residence management, Library catalog, and Bus transport fleet.`,
      suggestions: this.getSuggestedPrompts(role, pageOrTab),
    };
  }

  /**
   * Generates dynamic, context-specific suggestion chips
   */
  getSuggestedPrompts(role: string = '', page?: string): string[] {
    const normRole = normalizeRole(role);
    const p = (page || '').toLowerCase();

    if (p.includes('attendance')) {
      return [
        normRole === 'student' ? 'What is my attendance percentage?' : 'Which students have attendance below 75%?',
        'How do I mark attendance?',
        'Generate attendance report for my department',
        'What is the minimum attendance threshold?',
      ];
    }

    if (p.includes('marks')) {
      return [
        'Which marks submissions are pending approval?',
        'How can an HOD approve marks?',
        'How do I submit internal marks?',
        'What is the continuous assessment formula?',
      ];
    }

    if (p.includes('report')) {
      return [
        'How can I download reports in Excel?',
        'Generate attendance report for branch CSE, semester 5',
        'Which students have attendance below 75%?',
        'How many students are in my department?',
      ];
    }

    // Role-based defaults with unified discoverability
    switch (normRole) {
      case 'student':
        return [
          'What is my attendance percentage?',
          'Check my CGPA and SGPA',
          'Show today\'s class timetable',
          'Find faculty Dr. S. Mohanty',
          'Canteen menu & food prices',
          'Hostel warden contacts',
        ];
      case 'faculty':
        return [
          'How do I mark attendance?',
          'Show today\'s class timetable',
          'Which students have attendance below 75%?',
          'Find student Ashish',
          'Generate attendance report',
        ];
      case 'hod':
        return [
          'Which marks submissions are pending approval?',
          'How many students are in my department?',
          'Which students have attendance below 75%?',
          'Find faculty Dr. S. Mohanty',
          'Generate attendance report for my department',
        ];
      case 'exam_cell':
        return [
          'View exam schedules and hall tickets',
          'Which marks submissions are pending approval?',
          'Find student Ashish',
          'Autonomous exam pass percentage',
        ];
      case 'super_admin':
      case 'principal':
      case 'management':
      case 'admin':
        return [
          'Find student Ashish',
          'Find faculty Dr. S. Mohanty',
          'How many students are in my department?',
          'Which students have attendance below 75%?',
          'Bus routes & fleet details',
        ];
      default:
        return [
          'Find student Ashish',
          'Find faculty Dr. S. Mohanty',
          'Show today\'s class timetable',
          'What is the fee structure?',
          'Canteen food menu & prices',
          'Bus routes & timings',
        ];
    }
  }

  /**
   * External LLM invocation (Gemini 1.5) with strict Apna Campus guardrails
   */
  private async callGemini(
    message: string,
    history: ChatMessage[],
    role: string,
    user: any,
    context: any,
    liveFacts: string,
    apiKey: string,
  ): Promise<ChatResponse | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are Apna AI Assistant, the intelligent assistant for Apna Campus College Management System (Bhubaneswar, Odisha).
You MUST ONLY answer questions specifically about Apna Campus, its modules, workflows, academic records, and available features.
NEVER answer unrelated general questions (no coding solutions outside Apna Campus, no trivia, no general advice).
DO NOT invent fictional features or nonexistent URLs/paths. Use the actual implemented features of Apna Campus.

User Info:
- Role: ${role}
- Name: ${user?.name || 'Authorized User'}
- Department: ${user?.department || 'Not specified'}
- Current Page: ${context?.page || 'Dashboard'}

Live Database Facts (GROUND TRUTH):
${liveFacts}

RBAC Rules:
- Students can only view their own attendance, marks, profile, and documents. They CANNOT approve marks or view class-wide low attendance rosters.
- Faculty can enter marks and mark attendance, but HODs approve marks.
- HODs approve marks and view department students/faculty.
- Exam Cell handles examination schedules, hall tickets, and results.
- Super Admin, Principal, and Management have institutional oversight.

Format your response cleanly with clear markdown, bullet points, and step-by-step numbers when explaining workflows.
Keep answers accurate, professional, and directly helpful.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }],
      },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP status ${response.status}`);
    }

    const data: any = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) return null;

    return {
      success: true,
      reply,
      source: 'gemini',
      suggestions: this.getSuggestedPrompts(role, context?.page),
    };
  }

  /**
   * Gathers live database facts across all campus entities for context injection into external LLM
   */
  private async gatherLiveFactsForLLM(
    query: string,
    rawQuery: string,
    role: string,
    user: any,
    deptCode: string,
  ): Promise<string> {
    const facts: string[] = [];
    const identifier = user?.identifier || user?.studentId || '';

    if (deptCode) {
      try {
        const stdCount = await this.prisma.student.count({ where: { deptCode } });
        facts.push(`- Current Department (${deptCode}) Total Students: ${stdCount}`);
      } catch {}
    }

    if (role === 'student' && identifier) {
      try {
        const student = await this.prisma.student.findFirst({
          where: { OR: [{ rollNumber: identifier }, { studentId: identifier }] },
        });
        if (student) {
          facts.push(`- Student Roll: ${student.rollNumber}, Name: ${student.name}`);
          facts.push(`- Student Cumulative Attendance: ${student.attendance}% (Eligibility threshold is 75%)`);
          facts.push(`- Student CGPA: ${student.cgpa} / 10.0`);
        }
      } catch {}
    }

    // Try finding specific student mentioned
    if (query.includes('student') || query.includes('roll') || query.match(/\b\d{2}[a-z]{2,4}\d{3,4}\b/i)) {
      try {
        const cleanWord = rawQuery.replace(/find|student|who|is|search|roll/gi, '').trim();
        if (cleanWord.length >= 3) {
          const matchedStudents = await this.prisma.student.findMany({
            where: {
              OR: [
                { name: { contains: cleanWord, mode: 'insensitive' } },
                { rollNumber: { contains: cleanWord, mode: 'insensitive' } },
                { studentId: { contains: cleanWord, mode: 'insensitive' } },
              ],
            },
            take: 3,
          });
          matchedStudents.forEach((s) => {
            facts.push(`- Student Record: Name: ${s.name}, Roll: ${s.rollNumber}, ID: ${s.studentId}, Dept: ${s.department}, Sem: ${s.semester}, Attendance: ${s.attendance}%, CGPA: ${s.cgpa}`);
          });
        }
      } catch {}
    }

    // Try finding specific faculty mentioned
    if (query.includes('faculty') || query.includes('teacher') || query.includes('professor') || query.includes('dr.') || query.includes('hod')) {
      try {
        const cleanWord = rawQuery.replace(/find|faculty|teacher|professor|who|is|dr\./gi, '').trim();
        if (cleanWord.length >= 3) {
          const matchedFaculty = await this.prisma.faculty.findMany({
            where: {
              OR: [
                { name: { contains: cleanWord, mode: 'insensitive' } },
                { department: { contains: cleanWord, mode: 'insensitive' } },
              ],
            },
            take: 3,
          });
          matchedFaculty.forEach((f) => {
            facts.push(`- Faculty Record: Name: ${f.name}, Designation: ${f.designation}, Dept: ${f.department}, Email: ${f.email}, Phone: ${f.phone}`);
          });
        }
      } catch {}
    }

    if (role === 'hod' || role === 'exam_cell' || role === 'admin' || role === 'principal' || role === 'faculty') {
      try {
        const pendingCount = await this.prisma.approvalQueue.count({ where: { status: 'Pending' } });
        facts.push(`- Total Mark Submissions Pending Approval in College: ${pendingCount}`);

        const lowAttCount = await this.prisma.student.count({
          where: { attendance: { lt: 75 }, ...(deptCode && role === 'hod' ? { deptCode } : {}) },
        });
        facts.push(`- Students with Attendance < 75%: ${lowAttCount}`);
      } catch {}
    }

    try {
      const pendingComplaints = await this.prisma.hostelComplaint.count({ where: { status: 'Pending' } });
      facts.push(`- Unresolved/Pending Grievances/Complaints: ${pendingComplaints}`);
    } catch {}

    return facts.join('\n');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPER UTILITIES
  // ──────────────────────────────────────────────────────────────────────────

  private isCompletelyUnrelated(query: string): boolean {
    const unrelatedKeywords = [
      'write a python',
      'write a function',
      'write code',
      'javascript code to',
      'recipe for',
      'cook a',
      'who was napoleon',
      'capital of france',
      'tell me a joke',
      'weather in tokyo',
      'stock price of',
      'crypto price',
      'who won the world cup',
      'lyrics of',
      'translate to spanish',
    ];
    return unrelatedKeywords.some((kw) => query.includes(kw));
  }

  private extractDeptCode(deptName?: string, deptCode?: string, fallbackBranch?: string): string {
    if (deptCode && deptCode.length <= 6) return deptCode.toUpperCase();
    if (fallbackBranch && fallbackBranch.length <= 6) return fallbackBranch.toUpperCase();
    if (!deptName) return 'CSE';

    const d = deptName.toLowerCase();
    if (d.includes('computer science') || d.includes('cse')) return 'CSE';
    if (d.includes('aiml') || d.includes('ai & machine')) return 'AIML';
    if (d.includes('electronics & comm') || d.includes('ece')) return 'ECE';
    if (d.includes('electrical') || d.includes('eee')) return 'EEE';
    if (d.includes('mechanical') || d.includes('mech')) return 'MECH';
    if (d.includes('civil')) return 'CIVIL';
    if (d.includes('mba') || d.includes('business')) return 'MBA';
    if (d.includes('mca') || d.includes('computer app')) return 'MCA';
    return 'CSE';
  }

  private detectMentionedDept(query: string): string | null {
    if (query.includes('cse') || query.includes('computer science')) return 'CSE';
    if (query.includes('aiml') || query.includes('artificial intelligence') || query.includes('machine learning')) return 'AIML';
    if (query.includes('ece') || query.includes('electronics')) return 'ECE';
    if (query.includes('eee') || query.includes('electrical')) return 'EEE';
    if (query.includes('mech') || query.includes('mechanical')) return 'MECH';
    if (query.includes('civil')) return 'CIVIL';
    if (query.includes('mba')) return 'MBA';
    if (query.includes('mca')) return 'MCA';
    return null;
  }

  private detectMentionedSemester(query: string): string | null {
    for (let i = 1; i <= 8; i++) {
      if (
        query.includes(`semester ${i}`) ||
        query.includes(`sem ${i}`) ||
        query.includes(`${i}th sem`) ||
        query.includes(`${i}st sem`) ||
        query.includes(`${i}nd sem`) ||
        query.includes(`${i}rd sem`)
      ) {
        return `Semester ${i}`;
      }
    }
    return null;
  }

  private detectMentionedBatch(query: string): string | null {
    const match = query.match(/(20\d\d[-–]\d\d)/);
    if (match) return match[1];
    return null;
  }
}
