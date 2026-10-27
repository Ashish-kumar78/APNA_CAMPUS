// Centralized Communication & Document Management Store for APNA CAMPUS
// Frontend-Only Local State & Persistence Adapter for Messages, Forms, Spreadsheets, Documents & Delivery Reports

import { notificationsStore, normalizeRole } from './notificationsStore.js';

const STORAGE_KEYS = {
  SENT_MESSAGES: 'apna_campus_comm_sent_v2',
  DRAFTS: 'apna_campus_comm_drafts_v2',
  SCHEDULED: 'apna_campus_comm_scheduled_v2',
  ARCHIVED: 'apna_campus_comm_archived_v2',
  FORMS: 'apna_campus_comm_forms_v2',
  SPREADSHEETS: 'apna_campus_comm_spreadsheets_v2',
  DOCUMENTS: 'apna_campus_comm_documents_v2',
};

// ── Initial Mock / Master Data ──

const INITIAL_SENT_MESSAGES = [
  {
    id: 'MSG-2026-1001',
    title: 'Continuous Internal Assessment (CIA) Modular 2 Examination Schedule',
    heading: 'Autonomous Examination Cell Official Notification',
    body: 'The Autonomous Examination Cell has scheduled Modular 2 Theory & Practical examinations commencing on 05 Nov 2026. Hall tickets will be issued through student portals. All faculty invigilators are requested to collect examination kits from the Deanery.',
    messageType: 'Examination Notice',
    priority: 'Urgent',
    sender: 'Dr. Pallab Kumar Kar (CoE)',
    department: 'Examination Cell',
    creationDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
    submissionDeadline: null,
    attachments: [
      { id: 'att-1', name: 'CS501_Modular2_Blueprint_and_RoomAllocation.pdf', size: 485000, type: 'application/pdf' }
    ],
    recipients: {
      roles: ['All Students', 'All Faculty Members', 'All HODs'],
      branch: ['CSE', 'CSE (AI)', 'ECE'],
      year: ['Third Year'],
      semester: ['Fifth Semester'],
      sections: ['A', 'B'],
      individualUsers: []
    },
    totalRecipients: 420,
    deliveredCount: 418,
    readCount: 384,
    unreadCount: 34,
    failedCount: 2,
    status: 'Delivered'
  },
  {
    id: 'MSG-2026-1002',
    title: 'TCS & Cognizant Joint On-Campus Recruitment Drive 2026-27',
    heading: 'Training & Placement Cell Campus Circular',
    body: 'Eligible final-year B.Tech & MCA students (minimum 65% aggregate with no active backlogs) must register before 30 October 2026. Technical round interviews will be held in Aryabhata Science & Computing Labs.',
    messageType: 'Placement and Internship',
    priority: 'Important',
    sender: 'Prof. B. Panda',
    department: 'Training & Placement Cell',
    creationDate: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    submissionDeadline: '2026-10-30T23:59:00',
    attachments: [
      { id: 'att-2', name: 'TCS_Cognizant_Drive_Eligibility_Matrix.xlsx', size: 215000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    ],
    recipients: {
      roles: ['All Students'],
      branch: ['CSE', 'CSE (AI)', 'ECE', 'EE', 'MECH'],
      year: ['Final Year'],
      semester: ['Seventh Semester'],
      sections: ['A', 'B', 'C'],
      individualUsers: []
    },
    totalRecipients: 350,
    deliveredCount: 350,
    readCount: 312,
    unreadCount: 38,
    failedCount: 0,
    status: 'Delivered'
  },
  {
    id: 'MSG-2026-1003',
    title: 'Hostel Maintenance & Electrical Inspection Drive',
    heading: 'Hostel Administration Circular',
    body: 'Mandatory quarterly audit of electrical sockets, air conditioner units, and water fixtures will be conducted across all hostel blocks this weekend. Wardens and maintenance staff will accompany inspection engineers.',
    messageType: 'Hostel Notice',
    priority: 'Normal',
    sender: 'Mrs. Nibedita Das',
    department: 'Hostel Administration',
    creationDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    attachments: [],
    recipients: {
      roles: ['Hostel Wardens', 'All Students'],
      branch: [],
      year: [],
      semester: [],
      sections: [],
      individualUsers: []
    },
    totalRecipients: 840,
    deliveredCount: 835,
    readCount: 690,
    unreadCount: 145,
    failedCount: 5,
    status: 'Delivered'
  }
];

const INITIAL_DRAFTS = [
  {
    id: 'DFT-2026-001',
    title: 'Annual Technical Symposium: InnovateX 2026 Call for Papers',
    heading: 'National Student Technical Colloquium & Robotics Challenge',
    body: 'We invite technical submissions for paper presentation, IoT robotics, hackathon, and smart campus innovation tracks. Exciting cash prizes worth ₹1,50,000 to be won.',
    messageType: 'Event Announcement',
    priority: 'Important',
    sender: 'Dr. S. Mohanty',
    department: 'Computer Science & Engineering',
    lastModified: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    attachments: [],
    recipients: {
      roles: ['All Students', 'All Faculty Members'],
      branch: ['All Branches'],
      year: [],
      semester: [],
      sections: [],
      individualUsers: []
    }
  },
  {
    id: 'DFT-2026-002',
    title: 'Library Overdue Book Amnesty Week & Free Book Exchange',
    heading: 'Central Learning Resource Center Notice',
    body: 'All accumulated late fines will be 100% waived for books returned between 1st and 7th November. Students can also donate unused textbooks to junior book banks.',
    messageType: 'Library Notice',
    priority: 'Normal',
    sender: 'Chief Librarian',
    department: 'Central Library',
    lastModified: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    attachments: [],
    recipients: {
      roles: ['All Campus Users'],
      branch: [],
      year: [],
      semester: [],
      sections: [],
      individualUsers: []
    }
  }
];

const INITIAL_SCHEDULED = [
  {
    id: 'SCH-2026-001',
    title: 'Diwali Institutional Vacation & Hostel Curfew Guidelines',
    heading: 'Office of the Principal & Registrar',
    body: 'The college academic blocks and administrative offices will observe holiday from 29 Oct to 02 Nov 2026. Gate passes for outstation boarding students are enabled on the portal.',
    messageType: 'General Announcement',
    priority: 'Important',
    sender: 'Dr. G. K. Rout (Principal)',
    department: 'Principal Office',
    scheduledFor: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    status: 'Scheduled',
    recipients: {
      roles: ['All Campus Users'],
      branch: [],
      year: [],
      semester: [],
      sections: [],
      individualUsers: []
    }
  }
];

const INITIAL_FORMS = [
  {
    id: 'FORM-2026-01',
    title: 'B.Tech Modular Test II Lab Batch & Elective Preference Survey',
    description: 'Autonomous Examination Cell survey to select advanced elective preferences and practical batch timings.',
    instructions: 'Ensure your registration number and branch are accurate. Changes cannot be made after submission deadline.',
    submissionDeadline: '2026-11-04T23:59:00',
    confirmationMessage: 'Thank you! Your elective choice and lab slot have been registered with the Examination Cell.',
    status: 'Active',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    fields: [
      { id: 'f-1', title: 'Student Full Name', type: 'Short Answer', required: true, description: 'As per Matriculation certificate' },
      { id: 'f-2', title: 'Registration / Roll Number', type: 'Registration Number', required: true, description: 'e.g. 2301289001' },
      { id: 'f-3', title: 'Branch / Specialization', type: 'Branch', required: true, options: ['Computer Science & Engineering', 'CSE (Artificial Intelligence)', 'Electronics & Comm.', 'Mechanical Engg.', 'Civil Engg.'] },
      { id: 'f-4', title: 'Academic Semester', type: 'Semester', required: true, options: ['Semester 3', 'Semester 5', 'Semester 7'] },
      { id: 'f-5', title: 'Section', type: 'Section', required: true, options: ['Section A', 'Section B', 'Section C'] },
      { id: 'f-6', title: 'Professional Elective Track Selection', type: 'Single Choice', required: true, options: ['Cloud Computing & Kubernetes Architecture', 'Deep Learning & LLM Systems', 'Cyber Physical Security & Blockchain', 'VLSI Design & Embedded Systems'] },
      { id: 'f-7', title: 'Preferred Lab Batch Time Slot', type: 'Dropdown', required: true, options: ['Slot 1 (08:30 AM - 11:30 AM)', 'Slot 2 (11:45 AM - 02:45 PM)', 'Slot 3 (03:00 PM - 06:00 PM)'] },
      { id: 'f-8', title: 'Rate Overall Course Delivery & Lab Support', type: 'Rating', required: false, description: '1 (Poor) to 5 (Outstanding)' },
      { id: 'f-9', title: 'Additional Academic Remarks or Requirements', type: 'Long Answer', required: false }
    ],
    responses: [
      {
        id: 'resp-1',
        submittedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        respondentName: 'Rakesh Das',
        rollNumber: '2301289001',
        department: 'CSE',
        answers: {
          'f-1': 'Rakesh Das',
          'f-2': '2301289001',
          'f-3': 'CSE (Artificial Intelligence)',
          'f-4': 'Semester 5',
          'f-5': 'Section A',
          'f-6': 'Deep Learning & LLM Systems',
          'f-7': 'Slot 1 (08:30 AM - 11:30 AM)',
          'f-8': 5,
          'f-9': 'Looking forward to PyTorch and distributed training compute clusters in lab.'
        }
      },
      {
        id: 'resp-2',
        submittedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        respondentName: 'Priya Patra',
        rollNumber: '2301289004',
        department: 'CSE',
        answers: {
          'f-1': 'Priya Patra',
          'f-2': '2301289004',
          'f-3': 'Computer Science & Engineering',
          'f-4': 'Semester 5',
          'f-5': 'Section B',
          'f-6': 'Cloud Computing & Kubernetes Architecture',
          'f-7': 'Slot 2 (11:45 AM - 02:45 PM)',
          'f-8': 4,
          'f-9': 'Need hands-on access to AWS academy cloud credits.'
        }
      },
      {
        id: 'resp-3',
        submittedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        respondentName: 'Sneha Mohanty',
        rollNumber: '2301289008',
        department: 'CSE',
        answers: {
          'f-1': 'Sneha Mohanty',
          'f-2': '2301289008',
          'f-3': 'CSE (Artificial Intelligence)',
          'f-4': 'Semester 5',
          'f-5': 'Section A',
          'f-6': 'Deep Learning & LLM Systems',
          'f-7': 'Slot 1 (08:30 AM - 11:30 AM)',
          'f-8': 5,
          'f-9': 'All good.'
        }
      }
    ]
  },
  {
    id: 'FORM-2026-02',
    title: 'Hostel Dining & Food Quality Weekly Feedback',
    description: 'Resident student catering committee inspection and menu feedback.',
    instructions: 'Please be constructive in your ratings to help the mess committee optimize food menu.',
    submissionDeadline: '2026-10-31T20:00:00',
    confirmationMessage: 'Your mess rating has been compiled for the Warden & Canteen committee meeting.',
    status: 'Active',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    fields: [
      { id: 'f-10', title: 'Student Name', type: 'Short Answer', required: true },
      { id: 'f-11', title: 'Hostel Residence', type: 'Dropdown', required: true, options: ['Sarojini Girls Residence (Block A)', 'Sarojini Girls Residence (Block B)', 'Gandhi Boys Residence (Block A)', 'Gandhi Boys Residence (Block B)', 'Kalam Boys Residence'] },
      { id: 'f-12', title: 'Room Number', type: 'Short Answer', required: true },
      { id: 'f-13', title: 'Breakfast Quality Rating', type: 'Rating', required: true },
      { id: 'f-14', title: 'Lunch & Dinner Hygiene Rating', type: 'Rating', required: true },
      { id: 'f-15', title: 'Suggestions for Menu Revision', type: 'Long Answer', required: false }
    ],
    responses: []
  }
];

const INITIAL_SPREADSHEETS = [
  {
    id: 'SHT-2026-01',
    title: 'B.Tech 5th Sem Modular 2 Attendance & Exam Eligibility Ledger',
    category: 'Examination Lists',
    lastModified: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    columns: [
      { key: 'roll', label: 'Roll Number', width: 120, type: 'text' },
      { key: 'name', label: 'Student Name', width: 180, type: 'text' },
      { key: 'branch', label: 'Branch', width: 110, type: 'text' },
      { key: 'sec', label: 'Section', width: 80, type: 'text' },
      { key: 'classesHeld', label: 'Classes Held', width: 100, type: 'number' },
      { key: 'attended', label: 'Attended', width: 90, type: 'number' },
      { key: 'attendancePct', label: 'Attendance %', width: 110, type: 'formula' },
      { key: 'eligibility', label: 'Eligibility Status', width: 130, type: 'text' },
      { key: 'feesCleared', label: 'Fees Cleared', width: 110, type: 'text' }
    ],
    rows: [
      { roll: '2301289001', name: 'Rakesh Das', branch: 'CSE (AI)', sec: 'A', classesHeld: 48, attended: 45, attendancePct: '93.75%', eligibility: 'Eligible', feesCleared: 'Cleared' },
      { roll: '2301289002', name: 'Alok Panda', branch: 'CSE', sec: 'A', classesHeld: 48, attended: 42, attendancePct: '87.50%', eligibility: 'Eligible', feesCleared: 'Cleared' },
      { roll: '2301289003', name: 'Deepak Sethi', branch: 'CSE', sec: 'A', classesHeld: 48, attended: 44, attendancePct: '91.67%', eligibility: 'Eligible', feesCleared: 'Cleared' },
      { roll: '2301289004', name: 'Priya Patra', branch: 'CSE (AI)', sec: 'B', classesHeld: 48, attended: 46, attendancePct: '95.83%', eligibility: 'Eligible', feesCleared: 'Cleared' },
      { roll: '2301289005', name: 'Sneha Mohanty', branch: 'CSE (AI)', sec: 'A', classesHeld: 48, attended: 47, attendancePct: '97.92%', eligibility: 'Eligible', feesCleared: 'Cleared' },
      { roll: '2301289006', name: 'Suman Rout', branch: 'ECE', sec: 'A', classesHeld: 48, attended: 34, attendancePct: '70.83%', eligibility: 'Condonation Req.', feesCleared: 'Pending Due' },
      { roll: '2301289007', name: 'Bikash Jena', branch: 'MECH', sec: 'B', classesHeld: 48, attended: 41, attendancePct: '85.42%', eligibility: 'Eligible', feesCleared: 'Cleared' },
      { roll: '2301289008', name: 'Subhashree Barik', branch: 'CIVIL', sec: 'A', classesHeld: 48, attended: 43, attendancePct: '89.58%', eligibility: 'Eligible', feesCleared: 'Cleared' }
    ]
  },
  {
    id: 'SHT-2026-02',
    title: 'Training & Placement 2026-27 Corporate Drive Tracker',
    category: 'Internship Applications',
    lastModified: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    columns: [
      { key: 'company', label: 'Company Name', width: 160, type: 'text' },
      { key: 'role', label: 'Job Role / Profile', width: 160, type: 'text' },
      { key: 'ctc', label: 'CTC Package', width: 110, type: 'text' },
      { key: 'applied', label: 'Applicants', width: 90, type: 'number' },
      { key: 'shortlisted', label: 'Shortlisted', width: 100, type: 'number' },
      { key: 'placed', label: 'Selected', width: 90, type: 'number' },
      { key: 'driveDate', label: 'Drive Date', width: 110, type: 'text' },
      { key: 'status', label: 'Process Status', width: 120, type: 'text' }
    ],
    rows: [
      { company: 'Tata Consultancy Services', role: 'Digital & Ninja Engineer', ctc: '₹7.0 - 9.0 LPA', applied: 320, shortlisted: 145, placed: 42, driveDate: '2026-10-18', status: 'Completed' },
      { company: 'Cognizant Technology', role: 'Programmer Analyst', ctc: '₹6.5 LPA', applied: 280, shortlisted: 110, placed: 35, driveDate: '2026-10-22', status: 'Completed' },
      { company: 'Infosys Limited', role: 'Systems Engineer Specialist', ctc: '₹6.25 - 9.5 LPA', applied: 310, shortlisted: 95, placed: 28, driveDate: '2026-10-25', status: 'In Evaluation' },
      { company: 'Tech Mahindra', role: 'Software Engineer', ctc: '₹5.5 LPA', applied: 240, shortlisted: 80, placed: 20, driveDate: '2026-10-28', status: 'Scheduled' },
      { company: 'Wipro Technologies', role: 'Project Engineer (Elite)', ctc: '₹6.5 LPA', applied: 260, shortlisted: 85, placed: 22, driveDate: '2026-11-02', status: 'Upcoming' }
    ]
  }
];

const INITIAL_DOCUMENTS = [
  {
    id: 'DOC-2026-01',
    title: 'Autonomous College Modular Examination Guidelines 2026',
    type: 'word',
    owner: 'Dr. Pallab Kumar Kar (CoE)',
    lastModified: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'Official Gazette',
    templateType: 'notice',
    contentHtml: `
      <h2>AUTONOMOUS EXAMINATION CELL NOTIFICATION</h2>
      <p><strong>Sub:</strong> Guidelines for Modular Test-II Examination, Autumn Semester 2026-27.</p>
      <p>All candidates appearing for B.Tech, M.Tech, and MCA Modular Examinations are required to adhere strictly to the autonomous examination code of conduct:</p>
      <ol>
        <li>Candidates must report to designated examination halls at least 15 minutes before commencement.</li>
        <li>Biometric attendance check-in is mandatory at the entrance of each examination floor.</li>
        <li>Programmable calculators, mobile phones, smartwatch devices, and unauthorized study materials are strictly prohibited inside the examination hall.</li>
        <li>Autonomous answer scripts will be digitally scanned and evaluated through the encrypted barcode portal.</li>
      </ol>
      <p>By Order of Controller of Examinations,<br/><strong>GIFT Autonomous College, Bhubaneswar</strong></p>
    `
  },
  {
    id: 'DOC-2026-02',
    title: 'Laboratory Assignment 3: Distributed Hash Tables & Tree Rebalancing',
    type: 'word',
    owner: 'Dr. S. Mohanty',
    lastModified: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'Course Material',
    templateType: 'assignment',
    contentHtml: `
      <h2>Department of Computer Science & Engineering</h2>
      <h3>Course Code: CS501 — Data Structures & Algorithm Design</h3>
      <p><strong>Assignment 3 Problem Statement:</strong></p>
      <p>Implement a self-balancing Red-Black Search Tree supporting insertion, deletion, and rotation operations in C++ or Python with the following constraints:</p>
      <ul>
        <li>Every node is either red or black.</li>
        <li>The root must remain black at all times.</li>
        <li>No two consecutive red nodes may exist on any path.</li>
        <li>Time complexity for search and insertion operations must not exceed O(log N).</li>
      </ul>
      <p><strong>Submission Deadline:</strong> Friday, 17 November 2026, 11:59 PM via Git repository pull request.</p>
    `
  }
];

// ── Store Helper Functions ──

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch (err) {
    console.warn(`Error reading localStorage for ${key}:`, err);
    return fallback;
  }
}

function saveStored(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing localStorage for ${key}:`, err);
  }
}

class CommunicationStore {
  constructor() {
    this.listeners = new Set();
    this.sentMessages = loadStored(STORAGE_KEYS.SENT_MESSAGES, INITIAL_SENT_MESSAGES);
    this.drafts = loadStored(STORAGE_KEYS.DRAFTS, INITIAL_DRAFTS);
    this.scheduled = loadStored(STORAGE_KEYS.SCHEDULED, INITIAL_SCHEDULED);
    this.archived = loadStored(STORAGE_KEYS.ARCHIVED, []);
    this.forms = loadStored(STORAGE_KEYS.FORMS, INITIAL_FORMS);
    this.spreadsheets = loadStored(STORAGE_KEYS.SPREADSHEETS, INITIAL_SPREADSHEETS);
    this.documents = loadStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  // ── Sent Messages ──
  getSentMessages() {
    return [...this.sentMessages];
  }

  sendNewMessage(messageData, account) {
    const newMsg = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      title: messageData.title,
      heading: messageData.heading || 'Institutional Announcement',
      body: messageData.body,
      messageType: messageData.messageType || 'General Announcement',
      priority: messageData.priority || 'Normal',
      sender: messageData.sender || account?.name || 'Administrator',
      department: messageData.department || account?.department || 'Administration',
      creationDate: new Date().toISOString(),
      expiryDate: messageData.expiryDate || null,
      submissionDeadline: messageData.submissionDeadline || null,
      attachments: messageData.attachments || [],
      recipients: messageData.recipients || { roles: ['All Campus Users'] },
      totalRecipients: messageData.estimatedCount || 120,
      deliveredCount: messageData.estimatedCount || 120,
      readCount: 0,
      unreadCount: messageData.estimatedCount || 120,
      failedCount: 0,
      status: 'Delivered'
    };

    this.sentMessages = [newMsg, ...this.sentMessages];
    saveStored(STORAGE_KEYS.SENT_MESSAGES, this.sentMessages);

    // Also dispatch into notificationsStore so inbox reacts dynamically
    try {
      notificationsStore.addNotification({
        id: `notif-${newMsg.id.toLowerCase()}`,
        title: newMsg.title,
        message: newMsg.body.replace(/<[^>]*>/g, '').slice(0, 300),
        category: newMsg.messageType.toUpperCase().replace(/\s+/g, '_'),
        priority: newMsg.priority.toUpperCase(),
        senderName: newMsg.sender,
        senderRole: newMsg.department,
        senderDept: newMsg.department,
        timestamp: newMsg.creationDate,
        unread: true,
        attachmentName: newMsg.attachments.length > 0 ? newMsg.attachments[0].name : null,
      }, account);
    } catch (err) {
      console.warn('Notification sync notice:', err);
    }

    this.notify();
    return newMsg;
  }

  // ── Drafts ──
  getDrafts() {
    return [...this.drafts];
  }

  saveDraft(draftData) {
    let updated;
    const existingIdx = this.drafts.findIndex(d => d.id === draftData.id);
    const entry = {
      ...draftData,
      id: draftData.id || `DFT-${Date.now().toString().slice(-4)}`,
      lastModified: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      updated = [...this.drafts];
      updated[existingIdx] = entry;
    } else {
      updated = [entry, ...this.drafts];
    }

    this.drafts = updated;
    saveStored(STORAGE_KEYS.DRAFTS, this.drafts);
    this.notify();
    return entry;
  }

  deleteDraft(id) {
    this.drafts = this.drafts.filter(d => d.id !== id);
    saveStored(STORAGE_KEYS.DRAFTS, this.drafts);
    this.notify();
  }

  // ── Scheduled Messages ──
  getScheduled() {
    return [...this.scheduled];
  }

  scheduleMessage(scheduledData, account) {
    const entry = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      ...scheduledData,
      sender: scheduledData.sender || account?.name || 'Administrator',
      department: scheduledData.department || account?.department || 'Administration',
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    this.scheduled = [entry, ...this.scheduled];
    saveStored(STORAGE_KEYS.SCHEDULED, this.scheduled);
    this.notify();
    return entry;
  }

  cancelScheduled(id) {
    this.scheduled = this.scheduled.filter(s => s.id !== id);
    saveStored(STORAGE_KEYS.SCHEDULED, this.scheduled);
    this.notify();
  }

  // ── Forms & Surveys ──
  getForms() {
    return [...this.forms];
  }

  saveForm(formData) {
    const existingIdx = this.forms.findIndex(f => f.id === formData.id);
    const entry = {
      ...formData,
      id: formData.id || `FORM-${Date.now().toString().slice(-4)}`,
      createdAt: formData.createdAt || new Date().toISOString(),
      responses: formData.responses || []
    };

    let updated;
    if (existingIdx >= 0) {
      updated = [...this.forms];
      updated[existingIdx] = entry;
    } else {
      updated = [entry, ...this.forms];
    }

    this.forms = updated;
    saveStored(STORAGE_KEYS.FORMS, this.forms);
    this.notify();
    return entry;
  }

  deleteForm(id) {
    this.forms = this.forms.filter(f => f.id !== id);
    saveStored(STORAGE_KEYS.FORMS, this.forms);
    this.notify();
  }

  submitFormResponse(formId, responseData) {
    const targetForm = this.forms.find(f => f.id === formId);
    if (!targetForm) throw new Error('Form not found');

    const newResponse = {
      id: `resp-${Date.now().toString().slice(-4)}`,
      submittedAt: new Date().toISOString(),
      respondentName: responseData.respondentName || 'Student Respondent',
      rollNumber: responseData.rollNumber || '2301289001',
      department: responseData.department || 'CSE',
      answers: responseData.answers || {}
    };

    targetForm.responses = [newResponse, ...(targetForm.responses || [])];
    saveStored(STORAGE_KEYS.FORMS, this.forms);
    this.notify();
    return newResponse;
  }

  // ── Spreadsheets ──
  getSpreadsheets() {
    return [...this.spreadsheets];
  }

  saveSpreadsheet(sheetData) {
    const existingIdx = this.spreadsheets.findIndex(s => s.id === sheetData.id);
    const entry = {
      ...sheetData,
      id: sheetData.id || `SHT-${Date.now().toString().slice(-4)}`,
      lastModified: new Date().toISOString()
    };

    let updated;
    if (existingIdx >= 0) {
      updated = [...this.spreadsheets];
      updated[existingIdx] = entry;
    } else {
      updated = [entry, ...this.spreadsheets];
    }

    this.spreadsheets = updated;
    saveStored(STORAGE_KEYS.SPREADSHEETS, this.spreadsheets);
    this.notify();
    return entry;
  }

  deleteSpreadsheet(id) {
    this.spreadsheets = this.spreadsheets.filter(s => s.id !== id);
    saveStored(STORAGE_KEYS.SPREADSHEETS, this.spreadsheets);
    this.notify();
  }

  // ── Document Studio ──
  getDocuments() {
    return [...this.documents];
  }

  saveDocument(docData, account) {
    const existingIdx = this.documents.findIndex(d => d.id === docData.id);
    const entry = {
      ...docData,
      id: docData.id || `DOC-${Date.now().toString().slice(-4)}`,
      owner: docData.owner || account?.name || 'Faculty / Authority',
      lastModified: new Date().toISOString()
    };

    let updated;
    if (existingIdx >= 0) {
      updated = [...this.documents];
      updated[existingIdx] = entry;
    } else {
      updated = [entry, ...this.documents];
    }

    this.documents = updated;
    saveStored(STORAGE_KEYS.DOCUMENTS, this.documents);
    this.notify();
    return entry;
  }

  deleteDocument(id) {
    this.documents = this.documents.filter(d => d.id !== id);
    saveStored(STORAGE_KEYS.DOCUMENTS, this.documents);
    this.notify();
  }

  // ── Delivery Reports Metrics ──
  getDeliveryMetrics() {
    const totalSent = this.sentMessages.length;
    const totalRecipients = this.sentMessages.reduce((sum, m) => sum + (m.totalRecipients || 0), 0);
    const totalDelivered = this.sentMessages.reduce((sum, m) => sum + (m.deliveredCount || 0), 0);
    const totalRead = this.sentMessages.reduce((sum, m) => sum + (m.readCount || 0), 0);
    const totalUnread = this.sentMessages.reduce((sum, m) => sum + (m.unreadCount || 0), 0);
    const totalFailed = this.sentMessages.reduce((sum, m) => sum + (m.failedCount || 0), 0);
    const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '92.4';

    return {
      totalSent,
      totalRecipients,
      totalDelivered,
      totalRead,
      totalUnread,
      totalFailed,
      readRate
    };
  }
}

export const communicationStore = new CommunicationStore();
