// Campus Connect - Comprehensive University Communication & Collaboration Store
// WhatsApp-style college communication platform deeply integrated with the College Management System
import { playSentSound, playReceivedSound } from './soundEffects.js';

const STORAGE_KEY_PREFIX = 'cms_campus_connect_';

const initialConversations = [
  {
    id: 'conv-ds',
    name: 'Data Structures - Section A',
    category: 'Classes',
    code: 'CS501',
    subject: 'Data Structures',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    faculty: 'Dr. S. Mohanty',
    avatar: '👨‍🏫',
    avatarBg: '#3b82f6',
    membersCount: 64,
    onlineCount: 16,
    unreadCount: 2,
    pinned: '📌 Assignment 3 uploaded. Submission deadline is Friday 11:59 PM. | Midterm Exam: 15 October',
    description: 'Official academic discussion group for CS501 Data Structures theory, practical labs, and algorithms.',
    isClass: true,
    lastMessage: {
      sender: 'Dr. S. Mohanty',
      text: 'Assignment 3 has been uploaded. Submission deadline is Friday.',
      time: '1:20 PM',
      timestamp: Date.now() - 3600000,
      isFaculty: true,
      hasAttachment: true
    }
  },
  {
    id: 'conv-cse-ai',
    name: '📚 CSE - AI GENIUS',
    category: 'Classes',
    code: 'CS505',
    subject: 'Artificial Intelligence',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    faculty: 'Dr. P. Mohapatra',
    avatar: '🤖',
    avatarBg: '#8b5cf6',
    membersCount: 68,
    onlineCount: 21,
    unreadCount: 4,
    pinned: '📌 AI Lab practical examination on Oct 18 · Prepare A* search & Minimax notebooks',
    description: 'CSE Artificial Intelligence batch discussion, lab notebooks, and neural net seminar resources.',
    isClass: true,
    lastMessage: {
      sender: 'Rahul Sharma',
      text: 'Latest: Notes uploaded for Heuristic Search Algorithms.',
      time: '2:45 PM',
      timestamp: Date.now() - 1800000,
      isFaculty: false,
      hasAttachment: true
    }
  },
  {
    id: 'conv-dbms',
    name: 'Database Management System',
    category: 'Classes',
    code: 'CS502',
    subject: 'Database Management System',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    faculty: 'Prof. R. K. Sahoo',
    avatar: '🗄️',
    avatarBg: '#06b6d4',
    membersCount: 64,
    onlineCount: 12,
    unreadCount: 2,
    pinned: '📌 DBMS Lab test on Monday 10:00 AM · SQL Join & B-Tree indexing questions',
    description: 'Relational algebra, SQL query optimization, transaction processing, and normalization lecture group.',
    isClass: true,
    lastMessage: {
      sender: 'Somya Ranjan',
      text: 'Academic Request: Missed today\'s class notes for Normalization & 3NF.',
      time: '11:15 AM',
      timestamp: Date.now() - 14400000,
      isFaculty: false
    }
  },
  {
    id: 'conv-os',
    name: 'Operating Systems - Sec A',
    category: 'Classes',
    code: 'CS504',
    subject: 'Operating Systems',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    faculty: 'Dr. S. Mohanty',
    avatar: '💻',
    avatarBg: '#10b981',
    membersCount: 64,
    onlineCount: 14,
    unreadCount: 0,
    pinned: '📌 Process Scheduling problem sheet solution uploaded to resources.',
    description: 'Operating Systems theory, CPU scheduling, memory management, and deadlock algorithms.',
    isClass: true,
    lastMessage: {
      sender: 'Dr. S. Mohanty',
      text: 'Verified: Process Scheduling Gantt Chart notes by Rohan Sharma are now available.',
      time: 'Yesterday',
      timestamp: Date.now() - 86400000,
      isFaculty: true
    }
  },
  {
    id: 'conv-cn',
    name: 'Computer Networks',
    category: 'Classes',
    code: 'CS503',
    subject: 'Computer Networks',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    faculty: 'Dr. A. Jena',
    avatar: '🌐',
    avatarBg: '#f59e0b',
    membersCount: 64,
    onlineCount: 9,
    unreadCount: 0,
    pinned: '📌 Subnetting practice questions due Oct 14 in class.',
    description: 'OSI 7-layer model, TCP/IP, subnetting calculations, and packet tracer labs.',
    isClass: true,
    lastMessage: {
      sender: 'Dr. A. Jena',
      text: 'Please review IPv4 CIDR addressing slides before tomorrow\'s 11:30 AM class.',
      time: 'Yesterday',
      timestamp: Date.now() - 90000000,
      isFaculty: true
    }
  },
  {
    id: 'conv-univ-announcements',
    name: '📢 University Announcements',
    category: 'Announcements',
    department: 'Central Administration',
    avatar: '📢',
    avatarBg: '#ef4444',
    membersCount: 2480,
    onlineCount: 412,
    unreadCount: 1,
    isBroadcast: true,
    description: 'Official notices, academic calendar, administrative circulars, and university holidays.',
    lastMessage: {
      sender: 'Registrar Office',
      text: 'Exam schedule released for Odd Semester 2026-27 examinations.',
      time: '12:10 PM',
      timestamp: Date.now() - 7200000,
      isBroadcast: true
    }
  },
  {
    id: 'conv-exam-cell',
    name: '📢 Examination Cell',
    category: 'Announcements',
    department: 'Controller of Examinations',
    avatar: '📝',
    avatarBg: '#dc2626',
    membersCount: 2480,
    onlineCount: 310,
    unreadCount: 1,
    isBroadcast: true,
    description: 'Autonomous semester examination notifications, hall tickets, and evaluation results.',
    lastMessage: {
      sender: 'Controller of Examinations',
      text: 'Final schedule for 5th & 7th Semester Mid-Term & Regular Assessments.',
      time: '10:45 AM',
      timestamp: Date.now() - 18000000,
      isBroadcast: true
    }
  },
  {
    id: 'conv-placement',
    name: '📢 Placement Cell',
    category: 'Announcements',
    department: 'Training & Placements',
    avatar: '💼',
    avatarBg: '#059669',
    membersCount: 850,
    onlineCount: 140,
    unreadCount: 0,
    isBroadcast: true,
    description: 'Campus placement drives, corporate internships, interview schedules, and test links.',
    lastMessage: {
      sender: 'Dean T&P',
      text: 'TCS Digital & Ninja campus drive registration deadline extended till Oct 10.',
      time: 'Oct 05',
      timestamp: Date.now() - 172800000,
      isBroadcast: true
    }
  },
  {
    id: 'conv-cse-dept',
    name: '📢 CSE Department',
    category: 'Announcements',
    department: 'Computer Science & Engineering',
    avatar: '🏛️',
    avatarBg: '#6366f1',
    membersCount: 520,
    onlineCount: 78,
    unreadCount: 0,
    isBroadcast: true,
    description: 'Departmental circulars, faculty meetings, guest lectures, and tech fests.',
    lastMessage: {
      sender: 'HOD',
      text: 'Guest Lecture on Generative AI Architectures by Google DeepMind Research Lead this Friday.',
      time: 'Oct 04',
      timestamp: Date.now() - 259200000,
      isBroadcast: true
    }
  },
  {
    id: 'conv-library',
    name: '📢 Library',
    category: 'Announcements',
    department: 'Central Library',
    avatar: '📚',
    avatarBg: '#d97706',
    membersCount: 2480,
    onlineCount: 65,
    unreadCount: 0,
    isBroadcast: true,
    description: 'New book arrivals, IEEE Xplore digital library access, and return reminders.',
    lastMessage: {
      sender: 'Chief Librarian',
      text: 'Extended reading room access available till 10:00 PM during exam weeks.',
      time: 'Oct 03',
      timestamp: Date.now() - 345600000,
      isBroadcast: true
    }
  },
  {
    id: 'conv-cse-3rd-year',
    name: '👥 CSE 3rd Year',
    category: 'Groups',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    avatar: '👥',
    avatarBg: '#4f46e5',
    membersCount: 180,
    onlineCount: 42,
    unreadCount: 3,
    pinned: '📌 HackOdisha 2026 team registrations close this Sunday!',
    description: 'Common cohort collaboration channel for all 3rd year CSE students.',
    lastMessage: {
      sender: 'Rahul',
      text: 'Can someone share the practice questions for tomorrow\'s lab?',
      time: '11:42 AM',
      timestamp: Date.now() - 12000000
    }
  },
  {
    id: 'conv-coding-club',
    name: '⚡ GIFT Coding Club',
    category: 'Clubs',
    department: 'Student Activities',
    avatar: '💻',
    avatarBg: '#2563eb',
    membersCount: 145,
    onlineCount: 28,
    unreadCount: 0,
    pinned: '📌 Weekly LeetCode sprint contest tonight at 8:00 PM!',
    description: 'Competitive programming, algorithmic problem solving, and ICPC practice.',
    lastMessage: {
      sender: 'Club Lead - Ananya',
      text: 'Congrats to Team Binary Beasts for qualifying round 1 of ACM ICPC!',
      time: 'Yesterday',
      timestamp: Date.now() - 86400000
    }
  },
  {
    id: 'conv-ai-club',
    name: '🤖 AI & Robotics Club',
    category: 'Clubs',
    department: 'Student Activities',
    avatar: '🧠',
    avatarBg: '#7c3aed',
    membersCount: 110,
    onlineCount: 18,
    unreadCount: 0,
    pinned: '📌 Autonomous Drone workshop registrations open in Lab 4.',
    description: 'Robotics hardware, computer vision prototypes, and deep learning research.',
    lastMessage: {
      sender: 'Siddharth',
      text: 'We deployed the YOLOv8 model on the campus security camera feed test.',
      time: 'Oct 04',
      timestamp: Date.now() - 250000000
    }
  },
  {
    id: 'conv-fac-mohanty',
    name: 'Dr. S. Mohanty',
    category: 'Faculty',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & Course Lead',
    avatar: '👨‍🏫',
    avatarBg: '#0284c7',
    membersCount: 2,
    onlineCount: 1,
    unreadCount: 0,
    isDirect: true,
    description: 'Direct academic consultation with Dr. S. Mohanty (Faculty Advisor).',
    lastMessage: {
      sender: 'Dr. S. Mohanty',
      text: 'Your midterm internal marks have been verified and submitted to portal.',
      time: 'Oct 02',
      timestamp: Date.now() - 400000000,
      isFaculty: true
    }
  },
  {
    id: 'conv-dm-pm',
    name: 'Dr. P. Mohapatra',
    category: 'Direct',
    department: 'Computer Science & Engineering',
    role: 'faculty',
    designation: 'Professor & HOD',
    phone: '+91 94370 20011',
    email: 'p.mohapatra@apnacampus.edu.in',
    avatar: '👨‍🏫',
    avatarBg: '#3b82f6',
    membersCount: 2,
    onlineCount: 1,
    unreadCount: 1,
    isDirect: true,
    status: 'online',
    description: 'Direct academic consultation and mentoring with Dr. P. Mohapatra (HOD).',
    lastMessage: {
      sender: 'Dr. P. Mohapatra',
      text: 'Have you completed the AI search heuristic problem sets?',
      time: '11:45 AM',
      timestamp: Date.now() - 1200000,
      isFaculty: true,
      status: 'delivered'
    }
  },
  {
    id: 'conv-dm-rs',
    name: 'Rahul Sharma',
    category: 'Direct',
    department: 'Computer Science & Engineering',
    role: 'student',
    registrationNumber: '2305201012',
    phone: '+91 98610 23012',
    email: 'rahul.sharma@student.apnacampus.edu.in',
    avatar: '👨‍🎓',
    avatarBg: '#f59e0b',
    membersCount: 2,
    onlineCount: 1,
    unreadCount: 2,
    isDirect: true,
    status: 'online',
    description: 'Direct study peer chat with Rahul Sharma (Roll 2305201012).',
    lastMessage: {
      sender: 'Rahul Sharma',
      text: '🎤 Voice message (0:14)',
      time: '1:10 PM',
      timestamp: Date.now() - 600000,
      isFaculty: false,
      status: 'read'
    }
  },
  {
    id: 'conv-dm-ps',
    name: 'Pooja Samal',
    category: 'Direct',
    department: 'Computer Science & Engineering',
    role: 'student',
    registrationNumber: '2305201015',
    phone: '+91 98610 23015',
    email: 'pooja.samal@student.apnacampus.edu.in',
    avatar: '👩‍🎓',
    avatarBg: '#ec4899',
    membersCount: 2,
    onlineCount: 0,
    unreadCount: 0,
    isDirect: true,
    status: 'last seen 15 mins ago',
    description: 'Direct study peer chat with Pooja Samal (Roll 2305201015).',
    lastMessage: {
      sender: 'Pooja Samal',
      text: 'Thanks for sharing the DBMS B-Tree diagram!',
      time: 'Yesterday',
      timestamp: Date.now() - 86400000,
      isFaculty: false,
      status: 'read'
    }
  }
];

const initialMessages = {
  'conv-ds': [
    {
      id: 'msg-ds-1',
      sender: 'Dr. S. Mohanty',
      senderRole: 'faculty',
      senderId: 'FAC-042',
      time: '09:15 AM',
      date: 'Today',
      timestamp: Date.now() - 25200000,
      text: 'Good morning students. Today we will cover AVL Tree Rotations (Single & Double Rotations: LL, RR, LR, RL) in Room 204.',
      type: 'text',
      reactions: { '👍': 14, '🙌': 8 }
    },
    {
      id: 'msg-ds-2',
      sender: 'Dr. S. Mohanty',
      senderRole: 'faculty',
      senderId: 'FAC-042',
      time: '1:20 PM',
      date: 'Today',
      timestamp: Date.now() - 3600000,
      text: 'Assignment 3 has been uploaded. Submission deadline is Friday 11:59 PM. Please follow proper code indentation and complexity analysis.',
      type: 'academic_resource',
      resource: {
        id: 'res-ds-assign3',
        title: 'Assignment 3 - AVL & Red-Black Trees.pdf',
        fileType: 'application/pdf',
        fileSize: '1.8 MB',
        subject: 'Data Structures',
        topic: 'Self Balancing Trees & AVL Rotations',
        uploadedBy: 'Dr. S. Mohanty',
        uploadedRole: 'faculty',
        date: '06 October 2026',
        verified: true,
        verifiedBy: 'Dr. S. Mohanty',
        downloadUrl: '/sample_documents/sample_document.pdf'
      },
      reactions: { '👍': 22, '❤️': 6, '📌': 5 }
    },
    {
      id: 'msg-ds-3',
      sender: 'Somya Ranjan',
      senderRole: 'student',
      senderId: '2305201015',
      time: '2:15 PM',
      date: 'Today',
      timestamp: Date.now() - 1800000,
      text: 'I missed today\'s 10:00 AM class due to medical appointment. Could someone please upload the class notes on AVL rotations?',
      type: 'academic_request',
      academicRequest: {
        id: 'req-ds-101',
        subject: 'Data Structures',
        classTime: '10:00 AM',
        date: '06 October 2026',
        requestType: 'Request Notes',
        studentName: 'Somya Ranjan',
        studentRoll: '2305201015',
        requestText: 'I missed today\'s class. Could someone please upload the notes covering AVL tree balancing factors and double rotation diagrams?',
        status: 'WAITING_FOR_RESOURCE', // 'WAITING_FOR_RESOURCE' | 'RESOURCE_UPLOADED' | 'VERIFIED' | 'REJECTED'
        uploadedBy: null,
        uploadFile: null,
        verifiedBy: null,
        contributionAwarded: false
      },
      reactions: { '💡': 4 }
    }
  ],
  'conv-cse-ai': [
    {
      id: 'msg-ai-1',
      sender: 'Dr. P. Mohapatra',
      senderRole: 'faculty',
      senderId: 'HOD-CSE',
      time: '11:00 AM',
      date: 'Today',
      timestamp: Date.now() - 18000000,
      text: 'Students, please complete the A* Heuristic Search algorithm implementation in Python before Friday\'s AI Lab session.',
      type: 'text',
      reactions: { '👍': 19 }
    },
    {
      id: 'msg-ai-2',
      sender: 'Rahul Sharma',
      senderRole: 'student',
      senderId: '2305201012',
      time: '2:45 PM',
      date: 'Today',
      timestamp: Date.now() - 1800000,
      text: 'Here are the handwritten lecture notes and Python code examples for Heuristic Search Algorithms from Dr. Mohapatra\'s lecture.',
      type: 'academic_resource',
      resource: {
        id: 'res-ai-notes-1',
        title: 'AI_Heuristic_Search_A_Star_Notes.pdf',
        fileType: 'application/pdf',
        fileSize: '3.4 MB',
        subject: 'Artificial Intelligence',
        topic: 'Heuristic Search, Admissible Heuristics & A* Graph Traversal',
        uploadedBy: 'Rahul Sharma (2305201012)',
        uploadedRole: 'student',
        date: '06 October 2026',
        verified: true,
        verifiedBy: 'Dr. P. Mohapatra (HOD)',
        downloadUrl: '/sample_documents/sample_document.pdf'
      },
      reactions: { '❤️': 18, '👏': 12, '💡': 9 }
    }
  ],
  'conv-dbms': [
    {
      id: 'msg-dbms-1',
      sender: 'Prof. R. K. Sahoo',
      senderRole: 'faculty',
      senderId: 'FAC-019',
      time: '10:00 AM',
      date: 'Today',
      timestamp: Date.now() - 21600000,
      text: 'Today we completed 3NF and BCNF normalization anomalies with practical schema decomposition examples.',
      type: 'text'
    },
    {
      id: 'msg-dbms-2',
      sender: 'Amit Patel',
      senderRole: 'student',
      senderId: '2305201025',
      time: '11:15 AM',
      date: 'Today',
      timestamp: Date.now() - 14400000,
      text: 'Requesting handwritten notes for today\'s 3NF & BCNF derivation proofs.',
      type: 'academic_request',
      academicRequest: {
        id: 'req-dbms-102',
        subject: 'Database Management System',
        classTime: '10:00 AM',
        date: '06 October 2026',
        requestType: 'Request Notes',
        studentName: 'Amit Patel',
        studentRoll: '2305201025',
        requestText: 'I missed the second half on Lossless Join and Dependency Preservation. Can anyone share notes?',
        status: 'VERIFIED',
        uploadedBy: {
          name: 'Priya Das',
          roll: '2305201018',
          time: '12:30 PM'
        },
        uploadFile: {
          title: 'DBMS_3NF_BCNF_Decomposition_Notes.pdf',
          size: '2.1 MB',
          url: '/sample_documents/sample_document.pdf'
        },
        verifiedBy: 'Prof. R. K. Sahoo',
        verifiedDate: 'Today, 1:15 PM',
        contributionAwarded: true
      },
      reactions: { '👏': 15, '❤️': 8 }
    }
  ],
  'conv-univ-announcements': [
    {
      id: 'msg-univ-1',
      sender: 'Registrar Office',
      senderRole: 'admin',
      time: '12:10 PM',
      date: 'Today',
      timestamp: Date.now() - 7200000,
      text: 'Autonomous Semester Examination Schedule for B.Tech & MCA has been approved by Academic Council.',
      type: 'official_announcement',
      announcement: {
        department: 'EXAMINATION CELL · APNA CAMPUS',
        title: 'End Semester Examination Schedule — Odd Semester 2026–27',
        body: 'The regular and backlog examination timetable for Semester 5 and Semester 7 has been published. Theory examinations commence from 04 November 2026. Hall tickets will be downloadable via the Student Portal beginning 25 October 2026.',
        badge: 'OFFICIAL NOTICE #EXAM/2026/894',
        date: '06 October 2026',
        actionLabel: 'VIEW COMPLETE SCHEDULE (PDF)',
        actionUrl: '/sample_documents/sample_document.pdf'
      },
      reactions: { '📢': 84, '👍': 62 }
    }
  ],
  'conv-exam-cell': [
    {
      id: 'msg-exam-1',
      sender: 'Controller of Examinations',
      senderRole: 'admin',
      time: '10:45 AM',
      date: 'Today',
      timestamp: Date.now() - 18000000,
      text: 'Advisory on Mid-Term Assessment Attendance and Eligibility.',
      type: 'official_announcement',
      announcement: {
        department: 'EXAMINATION CELL',
        title: 'Mid-Term Assessment Attendance Mandatory Requirement',
        body: 'Students with attendance below 75% in any subject must submit medical / condonation certificates to their respective HOD before 12 October 2026.',
        badge: 'MANDATORY ADVISORY',
        date: '06 October 2026',
        actionLabel: 'DOWNLOAD EXAM ADVISORY',
        actionUrl: '/sample_documents/sample_document.pdf'
      },
      reactions: { '⚠️': 31, '👍': 40 }
    }
  ],
  'conv-placement': [
    {
      id: 'msg-place-1',
      sender: 'Dean T&P',
      senderRole: 'admin',
      time: 'Oct 05',
      date: 'Yesterday',
      timestamp: Date.now() - 172800000,
      text: 'Upcoming Recruitment Drive Notification.',
      type: 'official_announcement',
      announcement: {
        department: 'TRAINING & PLACEMENTS CELL',
        title: 'Tata Consultancy Services (TCS) National Qualifier Test 2026–27',
        body: 'Eligible B.Tech CSE / ECE / EE students of 2027 batch can apply for TCS Digital & Ninja roles. Package: ₹7.2 LPA (Digital) / ₹3.6 LPA (Ninja). Direct link active in Placement Module.',
        badge: 'CAMPUS RECRUITMENT',
        date: '05 October 2026',
        actionLabel: 'OPEN PLACEMENT MODULE',
        actionUrl: '#placement'
      },
      reactions: { '🎯': 48, '🔥': 32, '👏': 26 }
    }
  ],
  'conv-cse-3rd-year': [
    {
      id: 'msg-batch-1',
      sender: 'Rahul',
      senderRole: 'student',
      senderId: '2305201012',
      time: '11:42 AM',
      date: 'Today',
      timestamp: Date.now() - 12000000,
      text: 'Can someone share the practice questions for tomorrow\'s lab? Also has anyone formed a 4-person team for HackOdisha?',
      type: 'text',
      reactions: { '👍': 5 }
    },
    {
      id: 'msg-batch-2',
      sender: 'Sneha Mishra',
      senderRole: 'student',
      senderId: '2305201041',
      time: '11:45 AM',
      date: 'Today',
      timestamp: Date.now() - 11800000,
      text: 'Yes! We need one frontend dev for our Smart Agriculture IoT project. Ping me if interested.',
      type: 'text',
      reactions: { '💡': 4 }
    }
  ]
};

// Leadership Scoreboard initial data
const initialLeaderboard = [
  {
    rank: 1,
    studentName: 'Rahul Sharma',
    rollNumber: '2305201012',
    department: 'CSE',
    semester: 'Semester 5',
    points: 85,
    badge: '🏆 Academic Champion',
    badgeColor: '#eab308',
    verifiedUploads: 7,
    requestsAnswered: 8,
    avatar: '👨‍🎓'
  },
  {
    rank: 2,
    studentName: 'Priya Das',
    rollNumber: '2305201018',
    department: 'CSE',
    semester: 'Semester 5',
    points: 70,
    badge: '⭐ Star Notetaker',
    badgeColor: '#06b6d4',
    verifiedUploads: 6,
    requestsAnswered: 6,
    avatar: '👩‍🎓'
  },
  {
    rank: 3,
    studentName: 'Sneha Mishra',
    rollNumber: '2305201041',
    department: 'CSE',
    semester: 'Semester 5',
    points: 55,
    badge: '💎 Peer Helper',
    badgeColor: '#a855f7',
    verifiedUploads: 4,
    requestsAnswered: 5,
    avatar: '👩‍💻'
  },
  {
    rank: 4,
    studentName: 'Rakesh Das',
    rollNumber: '2305201001',
    department: 'CSE',
    semester: 'Semester 5',
    points: 45,
    badge: '🚀 Active Contributor',
    badgeColor: '#3b82f6',
    verifiedUploads: 3,
    requestsAnswered: 4,
    avatar: '👨‍💼'
  },
  {
    rank: 5,
    studentName: 'Amit Patel',
    rollNumber: '2305201025',
    department: 'CSE',
    semester: 'Semester 5',
    points: 30,
    badge: '🌱 Rising Contributor',
    badgeColor: '#10b981',
    verifiedUploads: 2,
    requestsAnswered: 2,
    avatar: '👨‍💻'
  }
];

// Anonymous Complaints initial mock store
const initialComplaints = [
  {
    trackingId: 'GIFT-CMP-84920',
    category: 'Hostel Infrastructure',
    subject: 'Block B 2nd Floor Hot Water Geyser Non-functional',
    description: 'The geyser in the north wing washroom of Block B has been tripping the circuit breaker for 3 days.',
    date: '04 Oct 2026',
    status: 'Under Review',
    statusStep: 2, // 1: Submitted, 2: Under Review, 3: Action Taken, 4: Resolved
    committeeResponse: 'Maintenance wing electrical contractor dispatched for replacement today.',
    lastUpdated: '05 Oct 2026, 02:30 PM'
  },
  {
    trackingId: 'GIFT-CMP-77112',
    category: 'Academic / Canteen',
    subject: 'Excessive noise near Library 1st floor reading hall during evening hours',
    description: 'Students grouping near the exterior canteen pavilion create high decibel levels disrupting quiet research hours.',
    date: '02 Oct 2026',
    status: 'Action Taken',
    statusStep: 3,
    committeeResponse: 'Campus security station assigned at library portico between 5 PM and 9 PM.',
    lastUpdated: '04 Oct 2026, 11:15 AM'
  }
];

// Moderation reports
const initialReports = [
  {
    id: 'REP-001',
    type: 'message',
    targetId: 'msg-sample-9',
    conversation: 'CSE 3rd Year',
    reportedBy: 'Anonymous Student',
    reason: 'Unverified exam rumor shared without official confirmation',
    date: '05 Oct 2026',
    status: 'Resolved',
    resolution: 'Message flagged and explanatory note posted by moderator'
  }
];

// Initial Campus Contacts Directory
export const initialContacts = [
  { id: 'usr-pm', name: 'Dr. P. Mohapatra', role: 'faculty', department: 'Computer Science & Engineering', designation: 'HOD', phone: '+91 94370 20011', email: 'p.mohapatra@apnacampus.edu.in', avatar: '👨‍🏫', avatarBg: '#3b82f6', status: 'online' },
  { id: 'usr-sm', name: 'Dr. S. Mohanty', role: 'faculty', department: 'Computer Science & Engineering', designation: 'Associate Professor', phone: '+91 94370 20012', email: 's.mohanty@apnacampus.edu.in', avatar: '👨‍🏫', avatarBg: '#10b981', status: 'online' },
  { id: 'usr-rks', name: 'Prof. R. K. Sahoo', role: 'faculty', department: 'Computer Science & Engineering', designation: 'Assistant Professor', phone: '+91 94370 20013', email: 'rk.sahoo@apnacampus.edu.in', avatar: '👨‍🏫', avatarBg: '#8b5cf6', status: 'last seen 10 mins ago' },
  { id: 'usr-ad', name: 'Prof. Ananya Das', role: 'faculty', department: 'Basic Science & Humanities', designation: 'Assistant Professor', phone: '+91 94370 20014', email: 'ananya.das@apnacampus.edu.in', avatar: '👩‍🏫', avatarBg: '#ec4899', status: 'online' },
  { id: 'usr-rs', name: 'Rahul Sharma', role: 'student', registrationNumber: '2305201012', department: 'Computer Science & Engineering', phone: '+91 98610 23012', email: 'rahul.sharma@student.apnacampus.edu.in', avatar: '👨‍🎓', avatarBg: '#f59e0b', status: 'online' },
  { id: 'usr-ps', name: 'Pooja Samal', role: 'student', registrationNumber: '2305201015', department: 'Computer Science & Engineering', phone: '+91 98610 23015', email: 'pooja.samal@student.apnacampus.edu.in', avatar: '👩‍🎓', avatarBg: '#ec4899', status: 'last seen 15 mins ago' },
  { id: 'usr-sr', name: 'Somya Ranjan', role: 'student', registrationNumber: '2305201021', department: 'Computer Science & Engineering', phone: '+91 98610 23021', email: 'somya.ranjan@student.apnacampus.edu.in', avatar: '👨‍🎓', avatarBg: '#06b6d4', status: 'online' },
  { id: 'usr-sb', name: 'Subhashree Biswal', role: 'student', registrationNumber: '2305201028', department: 'Computer Science & Engineering', phone: '+91 98610 23028', email: 'subhashree.b@student.apnacampus.edu.in', avatar: '👩‍🎓', avatarBg: '#14b8a6', status: 'last seen yesterday' },
  { id: 'usr-exam', name: 'Examination Controller', role: 'admin', department: 'Examination Cell', phone: '+91 674 2460111', email: 'examcell@apnacampus.edu.in', avatar: '🏛️', avatarBg: '#ef4444', status: 'online' },
  { id: 'usr-place', name: 'Dean Training & Placement', role: 'admin', department: 'Career & Placement Cell', phone: '+91 674 2460222', email: 'placement@apnacampus.edu.in', avatar: '💼', avatarBg: '#f97316', status: 'online' }
];

// Initial Calls Log
export const initialCalls = [
  {
    id: 'call-1',
    contactName: 'Dr. P. Mohapatra',
    contactId: 'usr-pm',
    contactAvatar: '👨‍🏫',
    contactRole: 'faculty',
    type: 'voice',
    direction: 'incoming',
    duration: '04:12',
    time: '11:30 AM',
    date: 'Today',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'call-2',
    contactName: 'Rahul Sharma',
    contactId: 'usr-rs',
    contactAvatar: '👨‍🎓',
    contactRole: 'student',
    type: 'video',
    direction: 'outgoing',
    duration: '09:45',
    time: '02:15 PM',
    date: 'Yesterday',
    timestamp: Date.now() - 86400000
  },
  {
    id: 'call-3',
    contactName: 'Dr. S. Mohanty',
    contactId: 'usr-sm',
    contactAvatar: '👨‍🏫',
    contactRole: 'faculty',
    type: 'voice',
    direction: 'missed',
    duration: '00:00',
    time: '10:05 AM',
    date: 'Oct 05',
    timestamp: Date.now() - 172800000
  },
  {
    id: 'call-4',
    contactName: 'Pooja Samal',
    contactId: 'usr-ps',
    contactAvatar: '👩‍🎓',
    contactRole: 'student',
    type: 'video',
    direction: 'incoming',
    duration: '15:20',
    time: '05:40 PM',
    date: 'Oct 04',
    timestamp: Date.now() - 259200000
  }
];

// LocalStorage helpers with Multi-tab BroadcastChannel Sync
function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('campus_connect_updated', { detail: { key } }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('campus_connect_realtime');
        bc.postMessage({ key, timestamp: Date.now() });
        bc.close();
      } catch (err) {}
    }
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

// Cross-tab real-time listener
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    const realtimeBc = new BroadcastChannel('campus_connect_realtime');
    realtimeBc.onmessage = (ev) => {
      window.dispatchEvent(new CustomEvent('campus_connect_updated', { detail: ev.data }));
    };
  } catch (err) {}
}

export const campusConnectStore = {
  getConversations(role = 'student', category = 'All', searchQuery = '') {
    const all = loadStorage('conversations', initialConversations);
    return all.filter((conv) => {
      // Role filtering if needed: students don't see admin-only internal channels
      if (role === 'student' && conv.category === 'Administrative Restricted') {
        return false;
      }
      
      // Category filter
      if (category === 'Unread' && conv.unreadCount === 0) return false;
      if (category === 'Direct' && !conv.isDirect && conv.category !== 'Direct') return false;
      if (category !== 'All' && category !== 'Unread' && category !== 'Direct' && conv.category !== category) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = conv.name.toLowerCase().includes(q);
        const matchSubject = conv.subject?.toLowerCase().includes(q);
        const matchDept = conv.department?.toLowerCase().includes(q);
        const matchLast = conv.lastMessage?.text?.toLowerCase().includes(q);
        return matchName || matchSubject || matchDept || matchLast;
      }

      return true;
    });
  },

  getConversationById(id) {
    const convs = loadStorage('conversations', initialConversations);
    return convs.find(c => c.id === id) || convs[0];
  },

  getMessages(conversationId) {
    const allMsgs = loadStorage('messages', initialMessages);
    return allMsgs[conversationId] || [];
  },

  sendMessage(conversationId, messagePayload) {
    const allMsgs = loadStorage('messages', initialMessages);
    const convMsgs = allMsgs[conversationId] || [];

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: 'Today',
      timestamp: Date.now(),
      status: 'delivered', // 'sent' | 'delivered' | 'read'
      reactions: {},
      starred: false,
      pinned: false,
      ...messagePayload
    };

    allMsgs[conversationId] = [...convMsgs, newMsg];
    saveStorage('messages', allMsgs);

    // Audio chime on send
    playSentSound();

    // Update conversation last message snippet
    const convs = loadStorage('conversations', initialConversations);
    const targetConv = convs.find(c => c.id === conversationId);
    const updatedConvs = convs.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: {
            sender: newMsg.sender,
            text: newMsg.text || (newMsg.attachments?.[0]?.name ? `📎 ${newMsg.attachments[0].name}` : (newMsg.voiceNote ? '🎤 Voice message' : 'New message')),
            time: newMsg.time,
            timestamp: newMsg.timestamp,
            isFaculty: newMsg.senderRole === 'faculty',
            isBroadcast: newMsg.type === 'official_announcement'
          }
        };
      }
      return c;
    });
    saveStorage('conversations', updatedConvs);

    // Asynchronous backend sync
    if (typeof fetch !== 'undefined') {
      fetch(`/api/campus-connect/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      }).catch(() => {});
    }

    // Interactive Peer Auto-Reply simulation if it's a 1-to-1 direct chat
    if (targetConv && targetConv.isDirect && newMsg.senderRole === 'student') {
      setTimeout(() => {
        // Mark sent message as blue tick (read)
        const currentMsgs = loadStorage('messages', initialMessages);
        if (currentMsgs[conversationId]) {
          currentMsgs[conversationId] = currentMsgs[conversationId].map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m);
          saveStorage('messages', currentMsgs);
        }

        // Show typing indicator
        this.setTyping(conversationId, targetConv.contactId || 'peer', targetConv.name, true);

        setTimeout(() => {
          this.setTyping(conversationId, targetConv.contactId || 'peer', targetConv.name, false);

          const replies = [
            `Understood! I'll check and follow up on this shortly.`,
            `Thanks for sending this over. Reviewing it now.`,
            `Got your message. Let's discuss this during the next session as well.`,
            `Confirmed! Thanks for the timely update.`
          ];
          const replyText = replies[Math.floor(Math.random() * replies.length)];

          const peerMsg = {
            id: `msg-reply-${Date.now()}`,
            sender: targetConv.name,
            senderRole: targetConv.role || 'faculty',
            senderId: targetConv.contactId || 'peer',
            text: replyText,
            type: 'text',
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: 'Today',
            timestamp: Date.now(),
            status: 'read',
            reactions: {}
          };

          const msgsAfter = loadStorage('messages', initialMessages);
          msgsAfter[conversationId] = [...(msgsAfter[conversationId] || []), peerMsg];
          saveStorage('messages', msgsAfter);

          // Update conversation snippet
          const convsAfter = loadStorage('conversations', initialConversations);
          saveStorage('conversations', convsAfter.map(c => c.id === conversationId ? {
            ...c,
            lastMessage: {
              sender: peerMsg.sender,
              text: peerMsg.text,
              time: peerMsg.time,
              timestamp: peerMsg.timestamp
            }
          } : c));

          playReceivedSound();
        }, 1800);
      }, 1000);
    }

    return newMsg;
  },

  addReaction(conversationId, messageId, emoji) {
    const allMsgs = loadStorage('messages', initialMessages);
    const list = allMsgs[conversationId] || [];
    const updated = list.map(m => {
      if (m.id === messageId) {
        const reactions = { ...(m.reactions || {}) };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...m, reactions };
      }
      return m;
    });
    allMsgs[conversationId] = updated;
    saveStorage('messages', allMsgs);
  },

  // ── MISSED CLASS / ACADEMIC REQUEST SYSTEM ──────────────────────────────────
  createAcademicRequest(conversationId, { subject, classTime, date, requestType, requestText, studentName, studentRoll }) {
    const requestObj = {
      id: `req-${Date.now()}`,
      subject: subject || 'Class Subject',
      classTime: classTime || '10:00 AM',
      date: date || new Date().toISOString().split('T')[0],
      requestType: requestType || 'Request Notes',
      studentName: studentName || 'Student',
      studentRoll: studentRoll || '2305201001',
      requestText: requestText || 'Missed today\'s lecture. Could someone please share the verified notes?',
      status: 'WAITING_FOR_RESOURCE',
      uploadedBy: null,
      uploadFile: null,
      verifiedBy: null,
      contributionAwarded: false
    };

    this.sendMessage(conversationId, {
      sender: studentName,
      senderRole: 'student',
      senderId: studentRoll,
      text: `Academic Request: ${requestType} for ${subject} (${classTime}, ${date})`,
      type: 'academic_request',
      academicRequest: requestObj
    });

    return requestObj;
  },

  // Fulfill request by uploading resource -> AUTOMATIC UPLOAD LOCK TRIGGERED
  fulfillAcademicRequest(conversationId, messageId, requestId, { uploaderName, uploaderRoll, fileTitle, fileUrl, fileSize, topicNotes }) {
    const allMsgs = loadStorage('messages', initialMessages);
    const list = allMsgs[conversationId] || [];

    let fulfilledReq = null;
    const updated = list.map(m => {
      if (m.id === messageId && m.academicRequest && m.academicRequest.id === requestId) {
        // Enforce lock: If already uploaded, refuse duplicate
        if (m.academicRequest.status !== 'WAITING_FOR_RESOURCE') {
          return m;
        }

        fulfilledReq = {
          ...m.academicRequest,
          status: 'RESOURCE_UPLOADED', // Upload button is now locked!
          uploadedBy: {
            name: uploaderName,
            roll: uploaderRoll,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          },
          uploadFile: {
            title: fileTitle || `${m.academicRequest.subject}_Lecture_Notes.pdf`,
            url: fileUrl || '/sample_documents/sample_document.pdf',
            size: fileSize || '2.4 MB',
            topic: topicNotes || m.academicRequest.subject
          }
        };

        return {
          ...m,
          academicRequest: fulfilledReq
        };
      }
      return m;
    });

    if (fulfilledReq) {
      allMsgs[conversationId] = updated;
      saveStorage('messages', allMsgs);

      // Also post a confirmation system message in the channel
      this.sendMessage(conversationId, {
        sender: 'System Bot',
        senderRole: 'system',
        text: `✓ Resource for "${fulfilledReq.subject}" uploaded by ${uploaderName}. Awaiting faculty verification before unlocking download for all classmates.`,
        type: 'text'
      });
    }

    return fulfilledReq;
  },

  // Faculty verification of resource
  verifyAcademicRequest(conversationId, messageId, requestId, facultyName = 'Dr. S. Mohanty') {
    const allMsgs = loadStorage('messages', initialMessages);
    const list = allMsgs[conversationId] || [];

    let verifiedReq = null;
    let uploaderInfo = null;

    const updated = list.map(m => {
      if (m.id === messageId && m.academicRequest && m.academicRequest.id === requestId) {
        uploaderInfo = m.academicRequest.uploadedBy;
        verifiedReq = {
          ...m.academicRequest,
          status: 'VERIFIED',
          verifiedBy: facultyName,
          verifiedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          contributionAwarded: true
        };
        return {
          ...m,
          academicRequest: verifiedReq
        };
      }
      return m;
    });

    if (verifiedReq) {
      allMsgs[conversationId] = updated;
      saveStorage('messages', allMsgs);

      // Award +10 points to uploader on leadership scoreboard
      if (uploaderInfo && uploaderInfo.name) {
        this.awardContributionPoints(uploaderInfo.name, uploaderInfo.roll, 10, `Uploaded verified notes for ${verifiedReq.subject}`);
      }

      // Post celebration in class channel
      this.sendMessage(conversationId, {
        sender: facultyName,
        senderRole: 'faculty',
        text: `✓ Faculty Verified: The notes uploaded by ${uploaderInfo?.name || 'contributor'} for ${verifiedReq.subject} have been reviewed and approved! Eligible students can now download them. 🏆 +10 Contribution Points awarded.`,
        type: 'text'
      });
    }

    return verifiedReq;
  },

  // Faculty rejects request resource
  rejectAcademicRequest(conversationId, messageId, requestId, facultyName = 'Dr. S. Mohanty', reason = 'Incomplete or unreadable notes') {
    const allMsgs = loadStorage('messages', initialMessages);
    const list = allMsgs[conversationId] || [];

    const updated = list.map(m => {
      if (m.id === messageId && m.academicRequest && m.academicRequest.id === requestId) {
        return {
          ...m,
          academicRequest: {
            ...m.academicRequest,
            status: 'WAITING_FOR_RESOURCE', // Reopen for classmates
            uploadedBy: null,
            uploadFile: null,
            rejectionNote: `Rejected by ${facultyName}: ${reason}. Reopened for another student to upload.`
          }
        };
      }
      return m;
    });

    allMsgs[conversationId] = updated;
    saveStorage('messages', allMsgs);
  },

  // ── FACULTY VERIFICATION DASHBOARD (Awaiting Verification) ──────────────────
  getAllAwaitingVerifications() {
    const allMsgs = loadStorage('messages', initialMessages);
    const awaiting = [];

    Object.entries(allMsgs).forEach(([convId, msgs]) => {
      msgs.forEach(m => {
        if (m.type === 'academic_request' && m.academicRequest && m.academicRequest.status === 'RESOURCE_UPLOADED') {
          awaiting.push({
            conversationId: convId,
            messageId: m.id,
            request: m.academicRequest
          });
        }
      });
    });

    return awaiting;
  },

  // ── ALL ACADEMIC RESOURCES REPOSITORY ───────────────────────────────────────
  getAllSharedResources(query = '') {
    const allMsgs = loadStorage('messages', initialMessages);
    const resources = [];

    Object.entries(allMsgs).forEach(([convId, msgs]) => {
      msgs.forEach(m => {
        if (m.type === 'academic_resource' && m.resource) {
          resources.push({
            conversationId: convId,
            ...m.resource
          });
        }
        if (m.type === 'academic_request' && m.academicRequest && m.academicRequest.status === 'VERIFIED' && m.academicRequest.uploadFile) {
          resources.push({
            conversationId: convId,
            id: m.academicRequest.id,
            title: m.academicRequest.uploadFile.title,
            fileType: 'application/pdf',
            fileSize: m.academicRequest.uploadFile.size,
            subject: m.academicRequest.subject,
            topic: m.academicRequest.uploadFile.topic || m.academicRequest.subject,
            uploadedBy: m.academicRequest.uploadedBy?.name || 'Class Contributor',
            uploadedRole: 'student',
            date: m.academicRequest.date,
            verified: true,
            verifiedBy: m.academicRequest.verifiedBy,
            downloadUrl: m.academicRequest.uploadFile.url
          });
        }
      });
    });

    if (query.trim()) {
      const q = query.toLowerCase();
      return resources.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.topic?.toLowerCase().includes(q) ||
        r.uploadedBy.toLowerCase().includes(q)
      );
    }

    return resources;
  },

  // ── LEADERSHIP SCOREBOARD ──────────────────────────────────────────────────
  getLeaderboard() {
    return loadStorage('leaderboard', initialLeaderboard);
  },

  awardContributionPoints(studentName, rollNumber, pointsToAdd = 10, reason = '') {
    const leaders = loadStorage('leaderboard', initialLeaderboard);
    let found = false;

    const updated = leaders.map(s => {
      if (s.studentName.toLowerCase().includes(studentName.toLowerCase()) || (rollNumber && s.rollNumber === rollNumber)) {
        found = true;
        const newPts = s.points + pointsToAdd;
        return {
          ...s,
          points: newPts,
          verifiedUploads: s.verifiedUploads + 1,
          requestsAnswered: s.requestsAnswered + 1
        };
      }
      return s;
    });

    if (!found) {
      updated.push({
        rank: updated.length + 1,
        studentName,
        rollNumber: rollNumber || '2305201099',
        department: 'CSE',
        semester: 'Semester 5',
        points: pointsToAdd,
        badge: '🌱 Rising Contributor',
        badgeColor: '#10b981',
        verifiedUploads: 1,
        requestsAnswered: 1,
        avatar: '👨‍🎓'
      });
    }

    // Sort descending by points
    updated.sort((a, b) => b.points - a.points);
    updated.forEach((item, idx) => { item.rank = idx + 1; });

    saveStorage('leaderboard', updated);
  },

  // ── ANONYMOUS COMPLAINTS SYSTEM ─────────────────────────────────────────────
  getAnonymousComplaints() {
    return loadStorage('anonymous_complaints', initialComplaints);
  },

  submitAnonymousComplaint({ category, subject, description }) {
    const current = loadStorage('anonymous_complaints', initialComplaints);
    const trackingId = `GIFT-CMP-${Math.floor(10000 + Math.random() * 90000)}`;

    const newComplaint = {
      trackingId,
      category: category || 'General Academic',
      subject: subject || 'Anonymous Student Grievance',
      description,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Submitted',
      statusStep: 1,
      committeeResponse: 'Grievance recorded by secure student grievance cell. Assigned to internal committee for verification.',
      lastUpdated: 'Just now'
    };

    saveStorage('anonymous_complaints', [newComplaint, ...current]);
    return newComplaint;
  },

  trackComplaint(trackingId) {
    const current = loadStorage('anonymous_complaints', initialComplaints);
    return current.find(c => c.trackingId.trim().toUpperCase() === trackingId.trim().toUpperCase());
  },

  // ── CONTENT REPORTING & MODERATION ──────────────────────────────────────────
  getReports() {
    return loadStorage('moderation_reports', initialReports);
  },

  reportContent({ type, targetId, conversation, reason }) {
    const current = loadStorage('moderation_reports', initialReports);
    const newReport = {
      id: `REP-${String(current.length + 1).padStart(3, '0')}`,
      type: type || 'message',
      targetId,
      conversation,
      reportedBy: 'Concerned Student (Masked)',
      reason,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Reported',
      resolution: null
    };

    saveStorage('moderation_reports', [newReport, ...current]);
    return newReport;
  },

  resolveReport(reportId, actionNote = 'Reviewed and cleared') {
    const current = loadStorage('moderation_reports', initialReports);
    const updated = current.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'Resolved',
          resolution: actionNote
        };
      }
      return r;
    });
    saveStorage('moderation_reports', updated);
  },

  // ── GLOBAL CHAT SEARCH ──────────────────────────────────────────────────────
  globalSearch(query) {
    if (!query || !query.trim()) return null;
    const q = query.toLowerCase().trim();

    const convs = loadStorage('conversations', initialConversations);
    const allMsgs = loadStorage('messages', initialMessages);

    const matchingConvs = convs.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q)
    );

    const matchingMessages = [];
    Object.entries(allMsgs).forEach(([convId, msgs]) => {
      const conv = convs.find(c => c.id === convId);
      msgs.forEach(m => {
        if (m.text?.toLowerCase().includes(q)) {
          matchingMessages.push({
            ...m,
            conversationId: convId,
            conversationName: conv ? conv.name : 'Channel'
          });
        }
      });
    });

    const matchingResources = this.getAllSharedResources(q);
    const matchingRequests = [];
    Object.entries(allMsgs).forEach(([convId, msgs]) => {
      const conv = convs.find(c => c.id === convId);
      msgs.forEach(m => {
        if (m.type === 'academic_request' && m.academicRequest) {
          const req = m.academicRequest;
          if (req.subject.toLowerCase().includes(q) || req.requestText.toLowerCase().includes(q)) {
            matchingRequests.push({
              conversationId: convId,
              conversationName: conv ? conv.name : 'Class Chat',
              request: req
            });
          }
        }
      });
    });

    return {
      conversations: matchingConvs,
      messages: matchingMessages,
      resources: matchingResources,
      requests: matchingRequests
    };
  },

  getTotalUnreadCount() {
    const convs = loadStorage('conversations', initialConversations);
    return convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  },

  getAllAcademicRequests() {
    const convs = loadStorage('conversations', initialConversations);
    const allMsgs = loadStorage('messages', initialMessages);
    const requests = [];

    Object.entries(allMsgs).forEach(([convId, msgs]) => {
      const conv = convs.find(c => c.id === convId);
      msgs.forEach(m => {
        if (m.type === 'academic_request' && m.academicRequest) {
          requests.push({
            id: m.id,
            conversationId: convId,
            conversationName: conv ? conv.name : 'Class Chat',
            subject: m.academicRequest.subject,
            requestType: m.academicRequest.requestType,
            requestText: m.academicRequest.requestText,
            classTime: m.academicRequest.classTime,
            date: m.academicRequest.date,
            status: m.academicRequest.status,
            requesterName: m.academicRequest.requesterName,
            requesterRoll: m.academicRequest.requesterRoll,
            fulfilledBy: m.academicRequest.fulfilledBy,
            fulfilledFileName: m.academicRequest.fulfilledFileName,
            fulfilledFileSize: m.academicRequest.fulfilledFileSize,
            facultyVerified: m.academicRequest.facultyVerified,
            verifiedBy: m.academicRequest.verifiedBy,
            verifiedAt: m.academicRequest.verifiedAt
          });
        }
      });
    });

    return requests.reverse();
  },

  markConversationRead(conversationId) {
    const convs = loadStorage('conversations', initialConversations);
    const updated = convs.map(c => {
      if (c.id === conversationId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    });
    saveStorage('conversations', updated);

    // Mark messages in this conversation as read
    const allMsgs = loadStorage('messages', initialMessages);
    if (allMsgs[conversationId]) {
      allMsgs[conversationId] = allMsgs[conversationId].map(m => ({ ...m, status: 'read' }));
      saveStorage('messages', allMsgs);
    }
  },

  // ── CONTACTS MANAGEMENT ───────────────────────────────────────────
  getContacts(search = '') {
    const contacts = loadStorage('contacts', initialContacts);
    if (!search || !search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.registrationNumber && c.registrationNumber.toLowerCase().includes(q)) ||
      (c.department && c.department.toLowerCase().includes(q))
    );
  },

  addContact(contact) {
    const contacts = loadStorage('contacts', initialContacts);
    const newContact = {
      id: `usr-${Date.now()}`,
      status: 'offline',
      avatar: contact.role === 'faculty' ? '👨‍🏫' : '👤',
      avatarBg: '#3b82f6',
      ...contact
    };
    contacts.unshift(newContact);
    saveStorage('contacts', contacts);

    // Non-blocking background API sync
    if (typeof fetch !== 'undefined') {
      fetch('/api/campus-connect/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      }).catch(() => {});
    }
    return newContact;
  },

  // ── DIRECT 1-TO-1 CHAT CREATION / RETRIEVAL ───────────────────────
  getOrCreateDirectChat(contact, currentUser = { name: 'Student', role: 'student' }) {
    const convs = loadStorage('conversations', initialConversations);
    const existing = convs.find(c => 
      c.isDirect && (
        c.contactId === contact.id ||
        c.name === contact.name ||
        c.id === `conv-dm-${contact.id}`
      )
    );
    if (existing) {
      return existing;
    }

    const newDirectConv = {
      id: `conv-dm-${contact.id || Date.now()}`,
      name: contact.name,
      contactId: contact.id,
      category: 'Direct',
      department: contact.department || 'General',
      role: contact.role || 'student',
      phone: contact.phone || '',
      email: contact.email || '',
      registrationNumber: contact.registrationNumber || '',
      avatar: contact.avatar || (contact.role === 'faculty' ? '👨‍🏫' : '👤'),
      avatarBg: contact.avatarBg || '#2563eb',
      membersCount: 2,
      onlineCount: contact.status === 'online' ? 1 : 0,
      unreadCount: 0,
      isDirect: true,
      status: contact.status || 'last seen recently',
      description: `Direct private conversation with ${contact.name} (${contact.role || 'Student'}).`,
      lastMessage: {
        sender: 'System',
        text: '🔒 Messages and calls are end-to-end encrypted.',
        time: 'Just now',
        timestamp: Date.now()
      }
    };

    convs.unshift(newDirectConv);
    saveStorage('conversations', convs);

    const allMsgs = loadStorage('messages', initialMessages);
    if (!allMsgs[newDirectConv.id]) {
      allMsgs[newDirectConv.id] = [
        {
          id: `msg-e2e-${Date.now()}`,
          sender: 'System',
          senderRole: 'system',
          text: '🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not even the college, can read or listen to them.',
          type: 'system',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          date: 'Today',
          timestamp: Date.now()
        }
      ];
      saveStorage('messages', allMsgs);
    }

    // Sync to backend API
    if (typeof fetch !== 'undefined') {
      fetch('/api/campus-connect/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDirectConv)
      }).catch(() => {});
    }

    return newDirectConv;
  },

  // ── GROUP CREATION & MANAGEMENT ───────────────────────────────────
  createGroup({ name, category = 'Groups', members = [], faculty = '', subject = '', code = '', department = '', description = '', avatar = '👥', avatarBg = '#3b82f6', createdBy = 'Rakesh Das' }) {
    const convs = loadStorage('conversations', initialConversations);
    const grpId = `conv-grp-${Date.now()}`;

    const memberObjects = [
      { id: 'usr-self', name: createdBy, role: 'Admin', isSelf: true },
      ...members.map(m => typeof m === 'string' ? { id: `usr-${m}`, name: m, role: 'Member' } : { ...m, role: m.role || 'Member' })
    ];

    const newGroup = {
      id: grpId,
      name,
      category,
      department: department || 'General',
      subject: subject || '',
      code: code || '',
      faculty: faculty || '',
      description: description || `Group created by ${createdBy}`,
      avatar: avatar || '👥',
      avatarBg: avatarBg || '#3b82f6',
      members: memberObjects,
      membersCount: memberObjects.length,
      onlineCount: Math.ceil(memberObjects.length * 0.4),
      unreadCount: 0,
      isGroup: true,
      settings: {
        onlyAdminsCanPost: false,
        onlyAdminsCanEditInfo: true
      },
      createdBy,
      createdAt: Date.now(),
      lastMessage: {
        sender: 'System',
        text: `Group "${name}" created by ${createdBy}`,
        time: 'Just now',
        timestamp: Date.now()
      }
    };

    convs.unshift(newGroup);
    saveStorage('conversations', convs);

    const allMsgs = loadStorage('messages', initialMessages);
    allMsgs[grpId] = [
      {
        id: `msg-grp-init-${Date.now()}`,
        sender: 'System',
        senderRole: 'system',
        text: `✓ ${createdBy} created group "${name}". 🔒 Messages and calls are end-to-end encrypted.`,
        type: 'system',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        date: 'Today',
        timestamp: Date.now()
      }
    ];
    saveStorage('messages', allMsgs);

    if (typeof fetch !== 'undefined') {
      fetch('/api/campus-connect/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      }).catch(() => {});
    }

    return newGroup;
  },

  updateGroupSettings(convId, settings) {
    const convs = loadStorage('conversations', initialConversations);
    const updated = convs.map(c => {
      if (c.id === convId) {
        return { ...c, settings: { ...(c.settings || {}), ...settings } };
      }
      return c;
    });
    saveStorage('conversations', updated);
  },

  addGroupMembers(convId, newMembers = []) {
    const convs = loadStorage('conversations', initialConversations);
    const updated = convs.map(c => {
      if (c.id === convId) {
        const cur = c.members || [];
        const added = newMembers.filter(nm => !cur.some(m => m.name === (nm.name || nm)));
        const combined = [...cur, ...added.map(m => typeof m === 'string' ? { id: `usr-${m}`, name: m, role: 'Member' } : m)];
        return { ...c, members: combined, membersCount: combined.length };
      }
      return c;
    });
    saveStorage('conversations', updated);
  },

  removeGroupMember(convId, memberName) {
    const convs = loadStorage('conversations', initialConversations);
    const updated = convs.map(c => {
      if (c.id === convId && c.members) {
        const filtered = c.members.filter(m => m.name !== memberName);
        return { ...c, members: filtered, membersCount: filtered.length };
      }
      return c;
    });
    saveStorage('conversations', updated);
  },

  makeGroupAdmin(convId, memberName) {
    const convs = loadStorage('conversations', initialConversations);
    const updated = convs.map(c => {
      if (c.id === convId && c.members) {
        const mems = c.members.map(m => m.name === memberName ? { ...m, role: 'Admin' } : m);
        return { ...c, members: mems };
      }
      return c;
    });
    saveStorage('conversations', updated);
  },

  // ── MESSAGE ACTIONS: REPLY, FORWARD, DELETE, STAR, PIN ───────────
  replyMessage(conversationId, text, replyingTo, extraPayload = {}) {
    return this.sendMessage(conversationId, {
      text,
      replyTo: {
        id: replyingTo.id,
        sender: replyingTo.sender,
        text: replyingTo.text || (replyingTo.attachments?.[0]?.name || 'Attachment'),
        type: replyingTo.type
      },
      ...extraPayload
    });
  },

  forwardMessage(messageToForward, targetConvIds = []) {
    const results = [];
    targetConvIds.forEach(targetId => {
      const forwardedMsg = this.sendMessage(targetId, {
        sender: messageToForward.sender,
        senderRole: messageToForward.senderRole,
        text: messageToForward.text,
        type: messageToForward.type,
        attachments: messageToForward.attachments,
        voiceNote: messageToForward.voiceNote,
        forwarded: true
      });
      results.push(forwardedMsg);
    });
    return results;
  },

  deleteMessage(conversationId, messageId, deleteForEveryone = true) {
    const allMsgs = loadStorage('messages', initialMessages);
    const list = allMsgs[conversationId] || [];
    const updated = list.map(m => {
      if (m.id === messageId) {
        if (deleteForEveryone) {
          return {
            ...m,
            deleted: true,
            text: '🚫 This message was deleted',
            attachments: [],
            voiceNote: null
          };
        }
        return null;
      }
      return m;
    }).filter(Boolean);

    allMsgs[conversationId] = updated;
    saveStorage('messages', allMsgs);

    if (typeof fetch !== 'undefined') {
      fetch(`/api/campus-connect/messages/${conversationId}/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteForEveryone })
      }).catch(() => {});
    }
  },

  toggleStarMessage(conversationId, messageId) {
    const allMsgs = loadStorage('messages', initialMessages);
    const list = allMsgs[conversationId] || [];
    let starredStatus = false;
    const updated = list.map(m => {
      if (m.id === messageId) {
        starredStatus = !m.starred;
        return { ...m, starred: starredStatus };
      }
      return m;
    });
    allMsgs[conversationId] = updated;
    saveStorage('messages', allMsgs);

    if (typeof fetch !== 'undefined') {
      fetch(`/api/campus-connect/messages/${conversationId}/${messageId}/star`, {
        method: 'POST'
      }).catch(() => {});
    }
    return starredStatus;
  },

  togglePinMessage(conversationId, messageId) {
    const allMsgs = loadStorage('messages', initialMessages);
    const list = allMsgs[conversationId] || [];
    let pinnedStatus = false;
    let pinnedText = '';

    const updated = list.map(m => {
      if (m.id === messageId) {
        pinnedStatus = !m.pinned;
        if (pinnedStatus) pinnedText = m.text || '📌 Pinned attachment';
        return { ...m, pinned: pinnedStatus };
      }
      return m;
    });

    allMsgs[conversationId] = updated;
    saveStorage('messages', allMsgs);

    const convs = loadStorage('conversations', initialConversations);
    const updatedConvs = convs.map(c => {
      if (c.id === conversationId) {
        return { ...c, pinned: pinnedStatus ? pinnedText : '' };
      }
      return c;
    });
    saveStorage('conversations', updatedConvs);

    if (typeof fetch !== 'undefined') {
      fetch(`/api/campus-connect/messages/${conversationId}/${messageId}/pin`, {
        method: 'POST'
      }).catch(() => {});
    }
    return pinnedStatus;
  },

  getStarredMessages() {
    const allMsgs = loadStorage('messages', initialMessages);
    const convs = loadStorage('conversations', initialConversations);
    const starred = [];

    Object.entries(allMsgs).forEach(([convId, msgs]) => {
      const conv = convs.find(c => c.id === convId);
      msgs.forEach(m => {
        if (m.starred) {
          starred.push({
            ...m,
            conversationId: convId,
            conversationName: conv ? conv.name : 'Chat',
            conversationAvatar: conv ? conv.avatar : '💬',
            conversationAvatarBg: conv ? conv.avatarBg : '#2563eb'
          });
        }
      });
    });

    return starred.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  },

  searchMessagesInConversation(conversationId, query) {
    if (!query || !query.trim()) return [];
    const msgs = this.getMessages(conversationId);
    const q = query.toLowerCase();
    return msgs.filter(m => 
      (m.text && m.text.toLowerCase().includes(q)) ||
      (m.attachments && m.attachments.some(a => a.name?.toLowerCase().includes(q))) ||
      (m.sender && m.sender.toLowerCase().includes(q))
    );
  },

  // ── VOICE & VIDEO CALLS ───────────────────────────────────────────
  logCall({ type = 'voice', direction = 'outgoing', contactName, contactId, contactAvatar = '👤', contactRole = 'student', duration = '00:00' }) {
    const calls = loadStorage('calls', initialCalls);
    const newCall = {
      id: `call-${Date.now()}`,
      type, // 'voice' | 'video'
      direction, // 'incoming' | 'outgoing' | 'missed'
      contactName: contactName || 'Contact',
      contactId: contactId || '',
      contactAvatar,
      contactRole,
      duration,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: 'Today',
      timestamp: Date.now()
    };
    calls.unshift(newCall);
    saveStorage('calls', calls);

    if (typeof fetch !== 'undefined') {
      fetch('/api/campus-connect/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCall)
      }).catch(() => {});
    }
    return newCall;
  },

  getCallHistory() {
    return loadStorage('calls', initialCalls);
  },

  clearCallHistory() {
    saveStorage('calls', []);
  },

  // ── BLOCK & REPORT USERS ──────────────────────────────────────────
  blockUser(userId) {
    const blocked = loadStorage('blocked_users', []);
    if (!blocked.includes(userId)) {
      blocked.push(userId);
      saveStorage('blocked_users', blocked);
    }
    if (typeof fetch !== 'undefined') {
      fetch('/api/campus-connect/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'block' })
      }).catch(() => {});
    }
  },

  unblockUser(userId) {
    const blocked = loadStorage('blocked_users', []);
    const updated = blocked.filter(id => id !== userId);
    saveStorage('blocked_users', updated);
    if (typeof fetch !== 'undefined') {
      fetch('/api/campus-connect/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'unblock' })
      }).catch(() => {});
    }
  },

  isUserBlocked(userId) {
    const blocked = loadStorage('blocked_users', []);
    return blocked.includes(userId);
  },

  getBlockedUsers() {
    return loadStorage('blocked_users', []);
  },

  // ── TYPING INDICATOR REAL-TIME BUS ────────────────────────────────
  typingState: {},

  setTyping(convId, userId, userName, isTyping) {
    if (!this.typingState[convId]) {
      this.typingState[convId] = {};
    }
    if (isTyping) {
      this.typingState[convId][userId] = { userName, timestamp: Date.now() };
    } else {
      delete this.typingState[convId][userId];
    }
    window.dispatchEvent(new CustomEvent('campus_connect_typing', { detail: { convId, typingState: this.typingState[convId] } }));
  },

  getTypingUsers(convId) {
    const st = this.typingState[convId] || {};
    const now = Date.now();
    return Object.values(st).filter(item => now - item.timestamp < 4000).map(item => item.userName);
  }
};

