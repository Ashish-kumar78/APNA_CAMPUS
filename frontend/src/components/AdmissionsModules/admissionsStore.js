// State Store & Reactive Manager for Admissions Directorate
// Manages local state with localStorage persistence for demo interactions
import {
  INITIAL_COURSES,
  INITIAL_APPLICANTS,
  INITIAL_RULES,
  INITIAL_MERIT_LISTS,
  INITIAL_COUNSELLING,
  INITIAL_WAITLIST,
  INITIAL_HELPDESK_TICKETS,
  INITIAL_STAFF,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_COMMUNICATION_LOGS,
  EXECUTIVE_KPI,
} from './admissionsData.js';
import { api } from '../../services/api.js';
import { saveStudent } from '../../services/studentStore.js';

const STORAGE_KEYS = {
  COURSES: 'apna_admissions_courses_v1',
  APPLICANTS: 'apna_admissions_applicants_v1',
  RULES: 'apna_admissions_rules_v1',
  MERIT: 'apna_admissions_merit_v1',
  COUNSELLING: 'apna_admissions_counselling_v1',
  WAITLIST: 'apna_admissions_waitlist_v1',
  HELPDESK: 'apna_admissions_helpdesk_v1',
  STAFF: 'apna_admissions_staff_v1',
  CALENDAR: 'apna_admissions_calendar_v1',
  COMM: 'apna_admissions_comm_v1',
};

class AdmissionsStore {
  constructor() {
    this.subscribers = new Set();
    this.courses = this.load(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    this.applicants = this.load(STORAGE_KEYS.APPLICANTS, INITIAL_APPLICANTS);
    this.rules = this.load(STORAGE_KEYS.RULES, INITIAL_RULES);
    this.meritLists = this.load(STORAGE_KEYS.MERIT, INITIAL_MERIT_LISTS);
    this.counselling = this.load(STORAGE_KEYS.COUNSELLING, INITIAL_COUNSELLING);
    this.waitlist = this.load(STORAGE_KEYS.WAITLIST, INITIAL_WAITLIST);
    this.helpdesk = this.load(STORAGE_KEYS.HELPDESK, INITIAL_HELPDESK_TICKETS);
    this.staff = this.load(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    this.calendar = this.load(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_EVENTS);
    this.commLogs = this.load(STORAGE_KEYS.COMM, INITIAL_COMMUNICATION_LOGS);
  }

  load(key, fallback) {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  save(key, data) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach((cb) => cb());
  }

  // ---------------- APPLICANTS & PROCESSING ----------------
  getApplicants() {
    return this.applicants;
  }

  getApplicantById(id) {
    return this.applicants.find((a) => a.id === id || a.applicationNo === id);
  }

  addApplicant(newApp) {
    const id = `app-${Date.now().toString().slice(-4)}`;
    const serialNo = this.applicants.length + 1;
    const applicationNo = `APP-2026-${(1000 + serialNo).toString()}`;
    const fullRecord = {
      id,
      serialNo,
      applicationNo,
      academicSession: '2026-2027',
      submissionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      eligibilityStatus: 'Under Review',
      docVerificationStatus: 'Pending',
      admissionStatus: 'Applied',
      assignedStaff: 'Ms. Rashmita Tripathy',
      admissionRound: 'Round 2',
      coursePreferences: [{ pref: 1, course: newApp.appliedCourse || 'B.Tech Computer Science & Engineering' }],
      documents: [
        { id: 'd-1', category: 'Photograph', filename: 'photo_uploaded.jpg', uploadDate: 'Today', status: 'Pending', verifier: 'Er. B. K. Jena', remarks: 'Awaiting scrutiny' },
        { id: 'd-2', category: 'Class 10 Certificate', filename: 'class10_doc.pdf', uploadDate: 'Today', status: 'Pending', verifier: 'Er. B. K. Jena', remarks: 'Awaiting scrutiny' },
        { id: 'd-3', category: 'Class 12 Mark Sheet', filename: 'class12_doc.pdf', uploadDate: 'Today', status: 'Pending', verifier: 'Er. B. K. Jena', remarks: 'Awaiting scrutiny' },
      ],
      staffReviewNotes: [
        { id: `n-${Date.now()}`, author: 'Self (Portal Registration)', date: 'Just now', note: 'Applicant self-registered via Institutional Admissions Portal.' }
      ],
      statusHistory: [
        { status: 'Applied', timestamp: 'Just now', updatedBy: 'Applicant Online' }
      ],
      feeDetails: {
        amount: 115000,
        paidAmount: 0,
        status: 'Pending',
        txnRef: 'N/A',
        date: null,
        receiptNo: null,
        verifier: null,
      },
      counsellingSlot: null,
      enrollmentRecord: null,
      ...newApp,
    };

    this.applicants = [fullRecord, ...this.applicants];
    this.save(STORAGE_KEYS.APPLICANTS, this.applicants);
    this.notify();
    return fullRecord;
  }

  updateApplicant(id, updates) {
    this.applicants = this.applicants.map((a) => {
      if (a.id === id || a.applicationNo === id) {
        return { ...a, ...updates };
      }
      return a;
    });
    this.save(STORAGE_KEYS.APPLICANTS, this.applicants);
    this.notify();
  }

  addReviewNote(appId, author, note) {
    const app = this.getApplicantById(appId);
    if (!app) return;
    const newNote = {
      id: `n-${Date.now()}`,
      author: author || 'Ms. Sasmita Mohapatra',
      date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      note,
    };
    const updatedNotes = [newNote, ...(app.staffReviewNotes || [])];
    this.updateApplicant(appId, { staffReviewNotes: updatedNotes });
  }

  changeApplicationStatus(appId, newStatus, reason, updatedBy = 'Ms. Sasmita Mohapatra') {
    const app = this.getApplicantById(appId);
    if (!app) return;

    const newHistory = [
      {
        status: newStatus,
        timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        updatedBy: updatedBy || 'Ms. Sasmita Mohapatra',
      },
      ...(app.statusHistory || []),
    ];

    const updates = {
      admissionStatus: newStatus,
      statusHistory: newHistory,
    };

    if (newStatus === 'Eligible') {
      updates.eligibilityStatus = 'Eligible';
    } else if (newStatus === 'Rejected') {
      updates.eligibilityStatus = 'Ineligible';
      updates.rejectionReason = reason || 'Criteria not met';
    } else if (newStatus === 'Documents Pending') {
      updates.docVerificationStatus = 'Resubmission Required';
    }

    if (reason) {
      this.addReviewNote(appId, updatedBy, `Status changed to ${newStatus}: ${reason}`);
    }

    this.updateApplicant(appId, updates);
  }

  // ---------------- DOCUMENT VERIFICATION ----------------
  verifyDocument(appId, docId, newStatus, remarks, verifier = 'Er. B. K. Jena') {
    const app = this.getApplicantById(appId);
    if (!app) return;

    const updatedDocs = (app.documents || []).map((doc) => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: newStatus,
          remarks: remarks || doc.remarks,
          verifier: verifier || 'Er. B. K. Jena',
        };
      }
      return doc;
    });

    // Check overall verification status
    const allVerified = updatedDocs.every((d) => d.status === 'Verified');
    const hasRejected = updatedDocs.some((d) => d.status === 'Rejected');
    const hasResubmit = updatedDocs.some((d) => d.status === 'Resubmission Required');

    let overallDocStatus = 'Pending';
    if (allVerified) overallDocStatus = 'Verified';
    else if (hasRejected) overallDocStatus = 'Rejected';
    else if (hasResubmit) overallDocStatus = 'Resubmission Required';

    const updates = {
      documents: updatedDocs,
      docVerificationStatus: overallDocStatus,
    };

    if (allVerified && app.admissionStatus === 'Applied') {
      updates.admissionStatus = 'Verified';
    } else if (hasResubmit) {
      updates.admissionStatus = 'Documents Pending';
    }

    this.updateApplicant(appId, updates);
  }

  // ---------------- COURSES & RULES ----------------
  getCourses() {
    return this.courses;
  }

  getRules() {
    return this.rules;
  }

  updateRule(ruleId, updates) {
    this.rules = this.rules.map((r) => (r.id === ruleId ? { ...r, ...updates, lastModified: 'Just now by Admission Head' } : r));
    this.save(STORAGE_KEYS.RULES, this.rules);
    this.notify();
  }

  addRule(newRule) {
    const id = `rule-${Date.now().toString().slice(-4)}`;
    const rule = { ...newRule, id, lastModified: 'Just now by Sasmita Mohapatra' };
    this.rules = [...this.rules, rule];
    this.save(STORAGE_KEYS.RULES, this.rules);
    this.notify();
  }

  // ---------------- MERIT LISTS ----------------
  getMeritLists() {
    return this.meritLists;
  }

  updateMeritListStatus(id, newStatus, approvedBy) {
    this.meritLists = this.meritLists.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          publicationStatus: newStatus,
          selectionStatus: newStatus,
          approvedBy: approvedBy || m.approvedBy,
          publishedDate: newStatus === 'Published' ? new Date().toLocaleDateString('en-GB') : m.publishedDate,
        };
      }
      return m;
    });
    this.save(STORAGE_KEYS.MERIT, this.meritLists);
    this.notify();
  }

  // ---------------- COUNSELLING & SEAT ALLOTMENT ----------------
  getCounsellingSchedules() {
    return this.counselling;
  }

  addCounsellingSchedule(schedule) {
    const id = `cs-${Date.now().toString().slice(-4)}`;
    this.counselling = [...this.counselling, { ...schedule, id }];
    this.save(STORAGE_KEYS.COUNSELLING, this.counselling);
    this.notify();
  }

  allotSeat(appId, courseCode, slotInfo) {
    const app = this.getApplicantById(appId);
    if (!app) return { success: false, message: 'Applicant not found' };

    // Check intake limit
    const course = this.courses.find((c) => c.code === courseCode || c.name === app.appliedCourse);
    if (course && course.seatsAllotted >= course.approvedIntake) {
      return { success: false, message: `Intake capacity exceeded! ${course.name} already has ${course.seatsAllotted} of ${course.approvedIntake} seats filled.` };
    }

    const counsellingSlot = {
      round: slotInfo?.round || 'Round 2',
      date: slotInfo?.date || new Date().toLocaleDateString('en-GB'),
      time: slotInfo?.time || '10:00 AM - 11:30 AM',
      venue: slotInfo?.venue || 'Counselling Wing · Seminar Hall 1',
      allotmentStatus: 'Allotted',
      candidateAcceptance: 'Accepted',
      reportingDeadline: slotInfo?.reportingDeadline || '04 Nov 2026',
    };

    // Update applicant
    this.updateApplicant(appId, {
      admissionStatus: 'Selected',
      counsellingSlot,
      appliedCourse: course?.name || app.appliedCourse,
      courseCode: course?.code || app.courseCode,
    });

    // Update course allotted count
    if (course) {
      this.courses = this.courses.map((c) => {
        if (c.id === course.id) {
          return {
            ...c,
            seatsAllotted: c.seatsAllotted + 1,
            vacantSeats: Math.max(0, c.approvedIntake - c.confirmedAdmissions - (c.seatsAllotted + 1 - c.confirmedAdmissions)),
          };
        }
        return c;
      });
      this.save(STORAGE_KEYS.COURSES, this.courses);
    }

    this.notify();
    return { success: true, message: `Seat allotted successfully to ${app.name} in ${course?.name || app.appliedCourse}` };
  }

  // ---------------- WAITLIST ----------------
  getWaitlist() {
    return this.waitlist;
  }

  promoteWaitlistCandidate(waitlistId) {
    const item = this.waitlist.find((w) => w.id === waitlistId);
    if (!item) return;

    this.waitlist = this.waitlist.map((w) => {
      if (w.id === waitlistId) {
        return { ...w, offerStatus: 'Offer Extended', nextAction: 'Offer sent. Response awaited.' };
      }
      return w;
    });

    // If candidate exists in applicants
    const app = this.getApplicantById(item.applicationNo);
    if (app) {
      this.updateApplicant(app.id, {
        admissionStatus: 'Selected',
        admissionRound: 'Round 2 (Waitlist Promotion)',
      });
    }

    this.save(STORAGE_KEYS.WAITLIST, this.waitlist);
    this.notify();
  }

  // ---------------- FEES ----------------
  verifyFee(appId, status, remarks, verifier = 'Mr. S. K. Roy (Accounts)') {
    const app = this.getApplicantById(appId);
    if (!app) return;

    const currentFee = app.feeDetails || { amount: 115000, paidAmount: 0 };
    const updatedFee = {
      ...currentFee,
      status,
      verifier,
      paidAmount: status === 'Verified' || status === 'Paid' ? currentFee.amount : currentFee.paidAmount,
      date: new Date().toLocaleDateString('en-GB'),
      remarks,
    };

    const updates = { feeDetails: updatedFee };
    if (status === 'Verified' && app.admissionStatus === 'Selected') {
      updates.admissionStatus = 'Offer Accepted';
    }

    this.updateApplicant(appId, updates);
  }

  // ---------------- ENROLLMENT & STUDENT CONVERSION ----------------
  enrollStudent(appId, rollNumber, section = 'Section A') {
    const app = this.getApplicantById(appId);
    if (!app) return { success: false, message: 'Applicant not found' };

    const deptCode = (app.courseCode || 'CSE').replace(/[^A-Z0-9]/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const assignedRoll = rollNumber || `26${deptCode.slice(-3) || 'CSE'}${randomSuffix}`;
    const studentId = `STU-26-${randomSuffix}`;
    const permanentRegNo = `AC/2026/${deptCode}/000${randomSuffix}`;
    const activationToken = `ACT-2026-${randomSuffix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const enrollmentRecord = {
      studentId,
      registrationNumber: permanentRegNo,
      rollNumber: assignedRoll,
      section: section || 'Section A',
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Enrolled',
      accountProvisioned: true,
      activationToken,
    };

    this.updateApplicant(appId, {
      admissionStatus: 'Enrolled',
      permanentRegistrationNo: permanentRegNo,
      enrollmentRecord,
    });

    // Provision canonical Student record in central studentStore
    try {
      saveStudent({
        id: `std-${randomSuffix}`,
        name: app.name,
        email: app.email,
        phone: app.phone,
        gender: app.gender || 'Female',
        role: 'student',
        registrationNumber: permanentRegNo,
        rollNumber: assignedRoll,
        studentId,
        department: app.appliedCourse || 'Computer Science & Engineering',
        deptCode: deptCode,
        semester: 'Semester 1',
        section: section || 'Section A',
        academicYear: '2026-27',
        status: 'Active',
        defaultPassword: 'Apna@' + new Date().getFullYear(),
        category: app.category || 'General',
        attendance: 100,
        cgpa: 0.0,
        walletBalance: 500.0,
        hostelName: app.hostel ? 'Gandhi Boys Residence' : null,
      });
    } catch (err) {
      console.warn('Local studentStore provisioning fallback:', err.message);
    }

    // Asynchronously synchronize with Backend REST API
    try {
      api.approveAndEnrollApplicant(appId).then((apiRes) => {
        if (apiRes && apiRes.success && apiRes.data) {
          this.updateApplicant(appId, {
            permanentRegistrationNo: apiRes.data.registrationNumber,
            enrollmentRecord: {
              ...enrollmentRecord,
              registrationNumber: apiRes.data.registrationNumber,
              rollNumber: apiRes.data.rollNumber,
              activationToken: apiRes.data.activationToken,
            },
          });
        }
      }).catch((e) => {
        console.warn('Backend API enrollment background sync:', e.message);
      });
    } catch (e) {}

    // Update confirmed admissions count for course
    const course = this.courses.find((c) => c.code === app.courseCode || c.name === app.appliedCourse);
    if (course) {
      this.courses = this.courses.map((c) => {
        if (c.id === course.id) {
          const newConfirmed = c.confirmedAdmissions + 1;
          return {
            ...c,
            confirmedAdmissions: newConfirmed,
            vacantSeats: Math.max(0, c.approvedIntake - newConfirmed),
          };
        }
        return c;
      });
      this.save(STORAGE_KEYS.COURSES, this.courses);
    }

    this.notify();
    return {
      success: true,
      data: {
        name: app.name,
        registrationNumber: permanentRegNo,
        rollNumber: assignedRoll,
        studentId,
        department: app.appliedCourse,
        email: app.email,
        activationToken,
      },
    };
  }

  // ---------------- HELPDESK ----------------
  getHelpdeskTickets() {
    return this.helpdesk;
  }

  addTicketReply(ticketId, message, sender = 'Ms. Sasmita Mohapatra', newStatus) {
    this.helpdesk = this.helpdesk.map((t) => {
      if (t.id === ticketId || t.ticketNo === ticketId) {
        const conversation = [
          ...(t.conversation || []),
          {
            sender,
            time: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            message,
          },
        ];
        return {
          ...t,
          status: newStatus || (t.status === 'Open' ? 'In Progress' : t.status),
          conversation,
        };
      }
      return t;
    });
    this.save(STORAGE_KEYS.HELPDESK, this.helpdesk);
    this.notify();
  }

  updateTicketStatus(ticketId, status, resolutionRemarks) {
    this.helpdesk = this.helpdesk.map((t) => {
      if (t.id === ticketId || t.ticketNo === ticketId) {
        return {
          ...t,
          status,
          resolutionRemarks: resolutionRemarks || t.resolutionRemarks,
        };
      }
      return t;
    });
    this.save(STORAGE_KEYS.HELPDESK, this.helpdesk);
    this.notify();
  }

  // ---------------- STAFF TASKS ----------------
  getStaff() {
    return this.staff;
  }

  assignStaffTask(staffId, taskName) {
    this.staff = this.staff.map((s) => {
      if (s.id === staffId) {
        return {
          ...s,
          assignedTasks: s.assignedTasks + 1,
          workload: Math.min(100, s.workload + 5),
        };
      }
      return s;
    });
    this.save(STORAGE_KEYS.STAFF, this.staff);
    this.notify();
  }

  // ---------------- CALENDAR ----------------
  getCalendarEvents() {
    return this.calendar;
  }

  addCalendarEvent(event) {
    const id = `ev-${Date.now().toString().slice(-4)}`;
    this.calendar = [...this.calendar, { ...event, id }];
    this.save(STORAGE_KEYS.CALENDAR, this.calendar);
    this.notify();
  }

  // ---------------- COMMUNICATION ----------------
  getCommunicationLogs() {
    return this.commLogs;
  }

  sendCommunication(broadcastData) {
    const newLog = {
      id: `comm-${Date.now().toString().slice(-4)}`,
      templateName: broadcastData.templateName || 'Custom Broadcast',
      recipientGroup: broadcastData.recipientGroup || 'All Applicants',
      recipientCount: broadcastData.recipientCount || 1420,
      channel: broadcastData.channel || 'Email & SMS',
      sentAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Sent (100% Delivered)',
      author: 'Ms. Sasmita Mohapatra',
    };
    this.commLogs = [newLog, ...this.commLogs];
    this.save(STORAGE_KEYS.COMM, this.commLogs);
    this.notify();
    return newLog;
  }

  // ---------------- RESET TO MASTER DEFAULTS ----------------
  resetToDefaults() {
    this.courses = INITIAL_COURSES;
    this.applicants = INITIAL_APPLICANTS;
    this.rules = INITIAL_RULES;
    this.meritLists = INITIAL_MERIT_LISTS;
    this.counselling = INITIAL_COUNSELLING;
    this.waitlist = INITIAL_WAITLIST;
    this.helpdesk = INITIAL_HELPDESK_TICKETS;
    this.staff = INITIAL_STAFF;
    this.calendar = INITIAL_CALENDAR_EVENTS;
    this.commLogs = INITIAL_COMMUNICATION_LOGS;

    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    this.notify();
  }
}

export const admissionsStore = new AdmissionsStore();
