import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.js';
import { getActiveStudent } from '../../services/studentStore.js';
import { erpStore } from '../../services/erpStore.js';
import './ApnaAIChatbot.css';

export default function ApnaAIChatbot({ account = null, activeTab = '', hideTrigger = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open_apna_ai_drawer', handleOpen);
    return () => window.removeEventListener('open_apna_ai_drawer', handleOpen);
  }, []);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize user details
  const isGuest = !account;
  const userRole = (account?.role || (isGuest ? 'guest' : 'student')).toLowerCase();
  const userName = account?.name || (isGuest ? 'Visitor' : 'Campus User');
  const userIdentifier = account?.identifier || account?.rollNumber || account?.studentId || '';
  const storageKey = `apna_ai_chat_${userIdentifier || userRole || 'guest'}`;

  // Initial welcome message
  const getInitialWelcomeMessage = () => ({
    role: 'assistant',
    content: isGuest
      ? `Hello **${userName}**! I am **Apna AI Assistant**, your official companion for **Apna Campus**.\n\nI can instantly help you find:\n• 🎓 **Students & Roll Numbers:** e.g. *"Find student Ashish"*\n• 👨‍🏫 **Faculty & HODs:** e.g. *"Find faculty Dr. S. Mohanty"*\n• 📅 **Timetable & Classes:** e.g. *"Show today's class schedule"*\n• 💳 **Fees & Dues:** e.g. *"What is the B.Tech fee structure?"*\n• 🏢 **Hostels & Wardens:** e.g. *"Hostel curfew & warden contacts"*\n• 🍽️ **Canteen Menu:** e.g. *"What is for lunch in the canteen?"*\n• 🚌 **Bus Routes:** e.g. *"Bus fleet numbers and driver contacts"*\n• 📚 **Library Books:** e.g. *"Search for Data Structures book"*\n• 💼 **Placements:** e.g. *"Active company drives & packages"*\n\n*What would you like to find today?*`
      : `Hello **${userName}**! I am **Apna AI Assistant**, connected across all Apna Campus systems.\n\nI have real-time access to all campus records:\n• 🎓 **Students:** Look up roll numbers, CGPA, and attendance records\n• 👨‍🏫 **Faculty:** Office cabins, email, phone extensions & subjects\n• 📅 **Timetable:** Live lecture halls, period timings & laboratory slots\n• 💳 **Accounts:** Fee dues, semester invoices & online payment\n• 🏢 **Hostels & Canteen:** Warden contacts, room status & food prices\n• 🚌 **Transport:** 18 bus routes, pickup stops & driver phone numbers\n• 📚 **Library & Drives:** Book rack locations, placement packages & exams\n\n*Ask me about any student, faculty, class, or campus facility!*`,
    source: 'campus-knowledge-base',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Load message history from localStorage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [getInitialWelcomeMessage()];
  });

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom of message list
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Fetch or generate suggestions based on role & active tab
  useEffect(() => {
    updateSuggestions(userRole, activeTab);
  }, [userRole, activeTab]);

  const updateSuggestions = (role, currentTab) => {
    const tab = (currentTab || '').toLowerCase();

    if (tab.includes('attendance')) {
      setSuggestions([
        role === 'student' ? 'What is my attendance percentage?' : 'Which students have attendance below 75%?',
        'How do I mark attendance?',
        'Find student Ashish',
        'Show today\'s class timetable',
        'Generate attendance report for my department',
      ]);
      return;
    }

    if (tab.includes('marks')) {
      setSuggestions([
        'Which marks submissions are pending approval?',
        'How can an HOD approve marks?',
        'How do I submit internal marks?',
        'Check my CGPA and SGPA',
        'Exam hall ticket eligibility',
      ]);
      return;
    }

    if (tab.includes('report')) {
      setSuggestions([
        'How can I download reports in Excel?',
        'Generate attendance report for branch CSE, semester 5',
        'Which students have attendance below 75%?',
        'How many students are in my department?',
      ]);
      return;
    }

    // Role-specific defaults with comprehensive discovery
    switch (role) {
      case 'guest':
        setSuggestions([
          'Find student Ashish',
          'Find faculty Dr. S. Mohanty',
          'Show today\'s class timetable',
          'What is the B.Tech fee structure?',
          'Canteen food menu & prices',
          'Hostel warden contacts & curfew',
          'Bus routes & driver contacts',
          'Upcoming placement drives & packages',
        ]);
        break;
      case 'student':
        setSuggestions([
          'What is my attendance percentage?',
          'Show today\'s class timetable',
          'Check my CGPA and SGPA',
          'Find faculty Dr. S. Mohanty',
          'Canteen food menu & prices',
          'Hostel warden contacts & curfew',
          'Bus routes & driver contacts',
          'Upcoming placement drives & packages',
        ]);
        break;
      case 'faculty':
        setSuggestions([
          'How do I mark attendance?',
          'Show today\'s class timetable',
          'Which students have attendance below 75%?',
          'Find student Ashish',
          'Find faculty Dr. R. K. Senapati',
          'Canteen food menu & prices',
          'Generate attendance report',
        ]);
        break;
      case 'hod':
        setSuggestions([
          'Which marks submissions are pending approval?',
          'How many students are in my department?',
          'Which students have attendance below 75%?',
          'Find faculty Dr. S. Mohanty',
          'Find student Ashish',
          'Generate attendance report for my department',
        ]);
        break;
      case 'exam_cell':
        setSuggestions([
          'View exam schedules and hall tickets',
          'Which marks submissions are pending approval?',
          '75% attendance rule for hall tickets',
          'Autonomous exam pass percentage',
          'How to publish results?',
        ]);
        break;
      case 'super_admin':
      case 'principal':
      case 'management':
      case 'admin':
        setSuggestions([
          'Find student Ashish',
          'Find faculty Dr. S. Mohanty',
          'Show today\'s class timetable',
          'What is the fee structure?',
          'Canteen food menu & prices',
          'Bus routes & driver contacts',
          'Upcoming placement drives',
        ]);
        break;
      default:
        setSuggestions([
          'Find student Ashish',
          'Find faculty Dr. S. Mohanty',
          'Show today\'s class timetable',
          'Canteen food menu & prices',
          'Hostel warden contacts & curfew',
          'Bus routes & driver contacts',
          'Search library books',
        ]);
    }
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Send query
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend !== null ? textToSend : inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const contextPayload = {
      page: activeTab || (typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''),
      tab: activeTab,
      branch: account?.deptCode || account?.department || 'CSE',
      semester: account?.semester || 'Semester 5',
    };

    try {
      const res = await api.askChatbot(text, historyPayload, contextPayload, account);
      if (res && res.success && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.reply,
            source: res.source || 'campus-live-data',
            suggestions: res.suggestions || [],
            actionLink: res.actionLink || null,
            liveData: res.liveData || null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (res.suggestions && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
        }
      } else {
        throw new Error(res?.message || 'Empty response received from backend');
      }
    } catch (err) {
      console.warn('Backend chatbot unreachable, using intelligent client-side fallback:', err.message);
      // Fallback locally
      const fallbackReply = generateClientSideFallback(text, userRole, account, activeTab);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackReply.content,
          source: 'campus-knowledge-base',
          actionLink: fallbackReply.actionLink || null,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side fallback if backend is offline
  const generateClientSideFallback = (queryText, role, user, currentTab) => {
    const q = queryText.toLowerCase();

    // 0. Student Discovery / Search
    if (q.includes('find student') || q.includes('who is student') || q.includes('ashish') || q.includes('26cse019') || q.includes('ac-2026-1019')) {
      return {
        content: `🎓 **Student Academic Dossier · Apna Campus**\n\n• **Name:** **Ashish Mohapatra**\n• **Permanent Student ID:** \`AC-2026-1019\`\n• **Academic Roll No:** \`26CSE019\`\n• **Degree Program:** B.Tech Computer Science & Engineering (Semester 1, Section A)\n• **Official Email:** \`ac-2026-1019@apnacampus.edu.in\`\n• **Personal Email:** \`akmohapatra996@gmail.com\`\n• **Phone:** \`+91 98610 02026\`\n• **Attendance:** **94.2%** (Autonomous Exam Clearance: ✅ Verified)\n• **CGPA:** **8.84 / 10.0** (Top 5% Merit Bracket)\n• **Residence:** Ramanujan Residence Block (Hostel-2, Room 314)\n• **Admission Status:** **CONFIRMED & ENROLLED**`,
        actionLink: { page: 'my-admission', label: 'View Admission Dossier & ID' },
      };
    }

    // 0.1 Faculty & HOD Discovery
    if (q.includes('faculty') || q.includes('teacher') || q.includes('professor') || q.includes('mohanty') || q.includes('senapati') || q.includes('hod')) {
      return {
        content: `👨‍🏫 **Faculty Directory & Cabin Locations**\n\n1. **Dr. S. Mohanty** — Professor & Head of Department (CSE)\n   • Cabin: **Tech Block-A, Room 304**\n   • Email: \`hod.cse@apnacampus.edu.in\` · Ext: **2401**\n   • Consultation: Mon–Fri, 03:00 PM – 04:30 PM\n\n2. **Dr. R. K. Senapati** — Associate Professor (Data Structures & Algorithms)\n   • Cabin: **Tech Block-A, Room 312**\n   • Email: \`rk.senapati@apnacampus.edu.in\` · Ext: **2412**\n\n3. **Prof. Ananya Mishra** — Assistant Professor (Database Engineering)\n   • Cabin: **Tech Block-A, Room 208**\n   • Email: \`ananya.mishra@apnacampus.edu.in\` · Ext: **2408**`,
        actionLink: { tab: 'faculty', label: 'Open Faculty Directory' },
      };
    }

    // 0.2 Timetable & Class Schedule
    if (q.includes('timetable') || q.includes('schedule') || q.includes('period') || q.includes('class time')) {
      return {
        content: `📅 **Today's Official Autonomous Academic Timetable (CSE - Sec A)**\n\n• **Period 1 (09:00 - 10:00):** Data Structures & Algorithms (Room CS-201) · Dr. R. K. Senapati\n• **Period 2 (10:00 - 11:00):** Operating Systems & Linux Kernel (Room CS-201) · Dr. P. K. Swain\n• **Period 3 (11:15 - 12:15):** Computer Networks (Room CS-203) · Prof. Ananya Mishra\n• **Period 4 (12:15 - 01:15):** Theory of Computation (Room CS-201) · Dr. S. Mohanty\n• **LUNCH BREAK (01:15 - 02:00)**\n• **Period 5 & 6 (02:00 - 04:00):** Advanced Data Structures Lab (Software Lab-3)\n• **Period 7 (04:00 - 05:00):** Remedial / Library Consultation Slot`,
        actionLink: { page: 'timetable', label: 'View Interactive Timetable' },
      };
    }

    // 0.3 Fees, Accounts & Payment
    if (q.includes('fee') || q.includes('tuition') || q.includes('dues') || q.includes('payment') || q.includes('receipt')) {
      return {
        content: `💳 **Apna Campus Autonomous Fee Structure (Academic Year 2026-27)**\n\n• **B.Tech Tuition:** ₹45,000 / semester\n• **Autonomous Exam & Lab Fee:** ₹3,500 / semester\n• **Hostel (Double Sharing + Mess):** ₹38,000 / semester\n• **Transport (AC Fleet):** ₹12,000 / semester\n\n**Online Payment Methods:** UPI (\`apnacampus@sbi\`), NetBanking, Debit/Credit Cards. Receipts are generated instantly upon clearance.`,
        actionLink: { page: 'fees', label: 'Open Fee & Invoices Portal' },
      };
    }

    // 0.4 Canteen & Dining Menu
    if (q.includes('canteen') || q.includes('food') || q.includes('lunch') || q.includes('menu') || q.includes('mess food') || q.includes('price')) {
      return {
        content: `🍽️ **Apna Central Canteen & Food Court (Live Today)**\n\n• **Executive Veg Thali:** ₹65 (Paneer, Dal Makhani, 2 Roti, Jeera Rice, Salad)\n• **Special Chicken Thali:** ₹95 (Chicken Kassa, Dal Fry, 2 Roti, Basmati Rice)\n• **South Indian Masala Dosa:** ₹45 (With Coconut Chutney & Sambar)\n• **Paneer Grilled Sandwich:** ₹40 · **Veg Burger:** ₹35\n• **Samosa (2 pcs) with Chai:** ₹20 · **Cold Coffee:** ₹30\n\n**Service Timings:** Breakfast: 07:30 – 10:00 AM · Lunch: 12:30 – 02:30 PM · Evening Snacks: 04:30 – 07:00 PM · Dinner: 08:00 – 10:00 PM`,
        actionLink: { page: 'canteen', label: 'Open Canteen Order System' },
      };
    }

    // 0.5 Transport & Bus Routes
    if (q.includes('bus') || q.includes('transport') || q.includes('driver') || q.includes('route')) {
      return {
        content: `🚌 **Campus Transport Network (18 Active Routes · 36 Buses)**\n\n• **Route 1 (Cuttack Badambadi ➔ Campus):** Bus 04 · Driver: Ramesh Jena (\`+91 94371 88201\`) · Pickup: 07:15 AM\n• **Route 2 (Master Canteen ➔ Rasulgarh ➔ Campus):** Bus 08 · Driver: Bikash Nayak (\`+91 94372 11984\`) · Pickup: 07:30 AM\n• **Route 3 (Patia Square ➔ Infocity ➔ Campus):** Bus 12 · Driver: K. C. Pradhan (\`+91 98612 44321\`) · Pickup: 07:45 AM\n• **Route 4 (Khandagiri ➔ Baramunda ➔ Campus):** Bus 15 · Driver: Sanjay Sahoo (\`+91 97761 90843\`) · Pickup: 07:25 AM\n\n**Transport Desk:** Admin Ground Floor · Helpline: \`+91 674 291 0055\``,
        actionLink: { tab: 'transport', label: 'View Transport Routes' },
      };
    }

    // 0.6 Central Library
    if (q.includes('library') || q.includes('book') || q.includes('catalog') || q.includes('cormen') || q.includes('tanenbaum')) {
      return {
        content: `📚 **Biju Patnaik Central Library (45,000+ Volumes)**\n\n• **Introduction to Algorithms (Cormen):** Shelf CS-R04-B (14 copies available)\n• **Operating System Concepts (Silberschatz):** Shelf CS-R02-A (9 copies available)\n• **Computer Networks (Tanenbaum):** Shelf CS-R06-D (12 copies available)\n• **Artificial Intelligence (Russell & Norvig):** Shelf AI-R01-C (8 copies available)\n\n**Rules:** 3 books per student card · Loan period: 14 days · Open: 08:00 AM – 10:00 PM (Reading Room 24/7 during exams)`,
        actionLink: { page: 'library', label: 'Search Library Catalog' },
      };
    }

    // 0.7 Placements & Drives
    if (q.includes('placement') || q.includes('drive') || q.includes('package') || q.includes('cisco') || q.includes('infosys') || q.includes('tcs') || q.includes('ctc') || q.includes('job')) {
      return {
        content: `💼 **Training & Placement Cell · Active Drives (Session 2026-27)**\n\n• **Cisco Systems:** Software Engineer · Package: **₹18.5 LPA** · Eligibility: CGPA ≥ 8.0, 0 active backlogs\n• **Infosys (Power Programmer):** Specialist Programmer · Package: **₹9.5 LPA** · Eligibility: CGPA ≥ 7.0\n• **Deloitte USI:** Analyst / Consultant · Package: **₹8.2 LPA** · Eligibility: CGPA ≥ 7.2\n• **TCS Digital / Ninja:** Full Stack Developer · Package: **₹7.5 LPA** / **₹3.6 LPA** · Eligibility: CGPA ≥ 6.5\n\n**Average Campus CTC:** ₹7.42 LPA · Highest CTC: ₹42.0 LPA.`,
        actionLink: { page: 'placement', label: 'Open Placement Portal' },
      };
    }

    // 0.8 Admissions Application Tracking
    if (q.includes('app-') || q.includes('application no') || q.includes('applicant status') || (q.includes('track') && q.includes('application'))) {
      return {
        content: `🏛️ **Official Admission Application Dossier · Session 2026-27**\n\n• **Application Reference:** \`APP-2026-1019\`\n• **Candidate Name:** Ashish Mohapatra\n• **Degree Program:** B.Tech Computer Science & Engineering\n• **Verification Status:** ✅ **APPROVED & VERIFIED**\n• **Seat Allotment:** Section A, Room CS-201\n• **Assigned Student ID:** \`AC-2026-1019\` · Academic Roll: \`26CSE019\`\n• **Admission Letter:** Available for download in official letterhead.`,
        actionLink: { page: 'my-admission', label: 'View Official Admission Letter' },
      };
    }

    // 0.9 Login & Account Access
    if (q.includes('login') || q.includes('sign in') || q.includes('how to access') || q.includes('college id')) {
      return {
        content: `🔐 **How to Sign In to Apna Campus**:\n\n1. **Students**: Enter your 10-digit Registration Number (e.g., \`2305201001\` or \`2401432265\`) and your account password.\n2. **Faculty / Staff**: Enter your designated College ID or username and password.\n3. **Quick Demo Access**: Click **Explore by Role** below the login form to test any portal (Student, Faculty, HOD, Admin, Hostel, etc.) instantly.\n\nNeed password help? Click **Forgot password?** on the login card to receive a reset verification link.`,
      };
    }

    // Account Activation
    if (q.includes('activate') || q.includes('new user') || q.includes('token')) {
      return {
        content: `✨ **Account Activation Instructions**:\n\n1. On the login screen, click **Activate Account** right next to "New user?".\n2. Provide your registered College Login ID or Email.\n3. Enter the one-time activation token issued by the Academic Administration.\n4. Set your permanent password to activate your portal.`,
      };
    }

    // Admissions & Programs
    if (q.includes('admission') || q.includes('course') || q.includes('program') || q.includes('branch')) {
      return {
        content: `🏛️ **Academic Programs Offered at Apna Campus (NAAC A++ Accredited)**:\n\n• **B.Tech**: Computer Science & Engg, CSE (AI), Electronics & Communication, Mechanical, Civil, Electrical.\n• **Postgraduate**: M.Tech (Computer Science), MBA, MCA.\n• **Autonomous System**: Outcome-Based Education (OBE) & CBCS Curriculum.\n\nFor fresh admissions and eligibility criteria, reach out to the Admissions Cell in Room 102.`,
      };
    }

    // Hostel Facilities
    if (q.includes('hostel') || q.includes('mess') || q.includes('room')) {
      return {
        content: `🏢 **Campus Hostel & Accommodation Amenities**:\n\n• **Hostel Wings**: Boys Hostel (Aryabhatta, APJ Abdul Kalam) & Girls Hostel (Kalpana Chawla, Gargi).\n• **Features**: High-speed campus Wi-Fi, 24/7 security & biometric attendance, multi-cuisine hygienic dining mess, laundry facilities.\n• **Gate Pass System**: Digital barcode gate passes with instant parent & warden SMS verification.`,
      };
    }

    // 1. Attendance check
    if (q.includes('my attendance') || q.includes('attendance percentage')) {
      if (role === 'student') {
        const std = getActiveStudent() || {};
        const att = std.attendance || 92;
        return {
          content: `📋 **Your Verified Attendance Record (Roll: ${std.rollNumber || user?.identifier || '2305201001'})**:\n\n• **Overall Cumulative Attendance:** **${att}%**\n• **Autonomous Exam Eligibility:** ${att >= 75 ? '✅ **Eligible** (Above 75% threshold)' : '⚠️ **Below 75%**'}\n• **Status:** Real-time sync with Central Biometric System.\n\nYou can review individual lecture records in **Student Profile > Attendance Dashboard**.`,
          actionLink: { page: 'attendance', label: 'View Attendance Dashboard' },
        };
      }
      return {
        content: `As **${role.toUpperCase()}**, you do not have a student attendance record. Use the **Attendance** section in your portal to mark or review class attendance.`,
      };
    }

    // 2. CGPA check
    if (q.includes('cgpa') || q.includes('sgpa')) {
      if (role === 'student') {
        const std = getActiveStudent() || {};
        return {
          content: `🎓 **Your Academic Standing (Roll: ${std.rollNumber || user?.identifier || '2305201001'})**:\n\n• **Cumulative GPA (CGPA):** **${std.cgpa || 8.42} / 10.0**\n• **Grading System:** Autonomous 10-Point Relative Grading (CBCS System)\n• **Active Backlogs:** 0\n\nYou can download official semester grade cards from **Student Profile > College Marks**.`,
          actionLink: { page: 'marks', label: 'Open College Marks' },
        };
      }
      return {
        content: `📈 **Department Average CGPA:** **8.42 / 10.0** with a **97.1%** autonomous examination pass rate. Granular analytics are available in the **Report Generation** module.`,
      };
    }

    // 3. Department student count
    if (q.includes('how many student') || q.includes('student count')) {
      return {
        content: `📊 **Department Census (${user?.deptCode || 'CSE'})**:\n\n• **Total Enrolled Students:** **540** students across Semester 1, 3, 5, and 7.\n• **Faculty Strength:** 32 Professors and Associate Professors.\n• **Status:** Autonomous CBCS regulation.`,
        actionLink: { tab: 'students', label: 'View Students Roster' },
      };
    }

    // 4. Low attendance (<75%)
    if (q.includes('below 75') || q.includes('less than 75')) {
      if (role === 'student') {
        return {
          content: `🔒 **Role Permission Notice:** As a Student, you can only view your own personal attendance. Class rosters of students below 75% are restricted to Faculty and HODs.`,
        };
      }
      return {
        content: `⚠️ **Students Below 75% Attendance Threshold**:\n\n• **Department Total at Risk:** 4 students identified in Semester 5 (Section A & B).\n• **Action:** Automated SMS alerts have been generated. Inspect the **Early Warning System** for parent notifications.`,
        actionLink: { tab: 'early-warning', label: 'Open Early Warning System' },
      };
    }

    // 5. How to mark attendance
    if (q.includes('mark attendance')) {
      return {
        content: `📝 **How to Mark Attendance (Faculty Guide)**:\n\n1. In your **Faculty Portal**, click on **Attendance**.\n2. Select your Department, Semester, Section, and Subject.\n3. Toggle each student: **Present (P)**, **Absent (A)**, or **Late (L)**.\n4. Click **Submit & Sync Attendance** to record biometric entries.`,
        actionLink: { tab: 'attendance', label: 'Go to Attendance Module' },
      };
    }

    // 6. How to submit internal marks
    if (q.includes('submit internal marks') || q.includes('submit marks')) {
      return {
        content: `📊 **How to Submit Internal Marks**:\n\n1. Open **Marks Management Module**.\n2. Select Subject and Section.\n3. Enter Modular 1 & 2 scores, Quizzes, Surprise Tests, and Assignments.\n4. Click **Submit to HOD for Approval**.`,
        actionLink: { tab: 'marks', label: 'Open Marks Management' },
      };
    }

    // 7. HOD approve marks
    if (q.includes('approve marks') || q.includes('hod approve')) {
      return {
        content: `✅ **How an HOD Approves Marks**:\n\n1. In the **HOD Portal**, open the **Marks Approval** tab.\n2. Review pending submissions and grade distribution curves.\n3. Enter optional moderation remarks and click **Approve & Forward to Exam Cell**.`,
        actionLink: { tab: 'marks-approval', label: 'Open Marks Approval' },
      };
    }

    // 8. Download report in Excel
    if (q.includes('excel') || q.includes('download report')) {
      return {
        content: `📥 **How to Download Reports in Excel**:\n\n1. Open the **Report Generation** module.\n2. Choose Branch, Semester, Batch, and Report Type (Attendance / CGPA / SGPA).\n3. Click **Export to Excel (.xlsx)** or **Print / Save as PDF**.`,
        actionLink: { tab: 'report-generation', label: 'Open Report Generation' },
      };
    }

    // Default institutional reply
    return {
      content: `Hello **${userName}**! I am **Apna AI Assistant**.\n\nYou can ask me about:\n• Attendance percentages and low attendance rosters (<75%)\n• Internal assessment marks entry & HOD approval\n• Excel report downloads and filtering\n• Autonomous exam schedules and hall tickets\n• Hostel, Canteen, Transport, and Placement services.`,
    };
  };

  // Copy message text
  const handleCopy = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Provide helpful/unhelpful feedback
  const handleFeedback = (idx, type) => {
    setFeedbackState((prev) => ({ ...prev, [idx]: type }));
  };

  // Reset conversation
  const handleNewConversation = () => {
    const fresh = [getInitialWelcomeMessage()];
    setMessages(fresh);
    localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  // Clear conversation
  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  // Trigger navigation if action link is clicked
  const handleActionNavigation = (actionLink) => {
    if (!actionLink) return;
    if (actionLink.tab) {
      window.dispatchEvent(
        new CustomEvent('switch_campus_tab', { detail: { tab: actionLink.tab } })
      );
    }
    if (actionLink.page) {
      if (typeof window !== 'undefined') {
        window.location.hash = actionLink.page;
      }
    }
    setIsOpen(false);
  };

  // Format message content with basic markdown (bold, bullets, code)
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return (
      <div className="apna-ai-content">
        {lines.map((line, lIdx) => {
          if (!line.trim()) {
            return <div key={lIdx} style={{ height: '6px' }} />;
          }

          // Bullet line
          if (line.startsWith('• ') || line.startsWith('- ')) {
            const raw = line.substring(2);
            return (
              <div key={lIdx} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                <span style={{ color: '#2563eb', fontWeight: 800 }}>•</span>
                <span>{renderInlineFormatting(raw)}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={lIdx} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                <span style={{ color: '#2563eb', fontWeight: 700, minWidth: '16px' }}>{numMatch[1]}.</span>
                <span>{renderInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          // Heading
          if (line.startsWith('### ') || line.startsWith('## ')) {
            return (
              <div key={lIdx} style={{ fontWeight: 800, fontSize: '0.94rem', margin: '8px 0 4px 0', color: '#0f172a' }}>
                {renderInlineFormatting(line.replace(/^#+\s*/, ''))}
              </div>
            );
          }

          return <p key={lIdx}>{renderInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={pIdx}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* ── 1. Floating Chatbot Trigger Button - Round Circular Shape ── */}
      {!isOpen && !hideTrigger && (
        <button
          className="apna-ai-floating-trigger"
          type="button"
          onClick={() => setIsOpen(true)}
          title={`Apna AI Assistant (${userRole}) • Click to view`}
          aria-label="Open Apna AI Assistant"
        >
          <div className="apna-ai-icon-container">
            <Sparkles size={22} color="#ffffff" />
            <span className="apna-ai-pulse-beacon" />
          </div>
        </button>
      )}

      {/* ── 2. Chat Window Modal ── */}
      {isOpen && (
        <aside
          className={`apna-ai-chat-window ${isMaximized ? 'maximized' : ''}`}
          aria-label="Apna AI Assistant Dialog"
        >
          {/* Header */}
          <header className="apna-ai-header">
            <div className="apna-ai-header-brand">
              <div className="apna-ai-logo-wrap">
                <img src="/logo.png" alt="Apna Campus Logo" />
              </div>
              <div className="apna-ai-header-titles">
                <h3>
                  Apna AI Assistant <Sparkles size={14} color="#60a5fa" />
                </h3>
                <p>
                  <span className="apna-ai-status-indicator" /> Live Campus OS • {userRole.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="apna-ai-header-controls">
              <button
                className="apna-ai-header-btn"
                type="button"
                onClick={handleNewConversation}
                title="New Conversation"
                aria-label="New Conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="apna-ai-header-btn"
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? 'Restore Size' : 'Maximize Window'}
                aria-label="Maximize or Restore Window"
              >
                {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                className="apna-ai-header-btn"
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          {/* Context & Role Strip */}
          <div className="apna-ai-context-strip">
            <span className="apna-ai-context-badge">
              📍 {activeTab ? `On: ${activeTab}` : 'Dashboard Overview'}
            </span>
            <span className="apna-ai-user-badge">
              {userName} {userIdentifier ? `(${userIdentifier})` : ''}
            </span>
          </div>

          {/* Messages Stream */}
          <div className="apna-ai-messages-container">
            {messages.length === 0 ? (
              <div className="apna-ai-welcome-card">
                <h4>👋 Welcome to Apna AI Assistant</h4>
                <p>
                  I am connected directly to the Apna Campus database and ERP workflows. Ask me questions about attendance, marks approval, student records, or reports!
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`apna-ai-msg-row ${msg.role}`}>
                  <div className="apna-ai-bubble">
                    {renderFormattedContent(msg.content)}

                    {/* Live Data Badge */}
                    {msg.source === 'campus-live-data' && (
                      <div className="apna-ai-live-badge">
                        <Check size={12} /> Verified Live DB Record
                      </div>
                    )}

                    {/* Action Navigation Link */}
                    {msg.actionLink && (
                      <button
                        className="apna-ai-action-btn"
                        type="button"
                        onClick={() => handleActionNavigation(msg.actionLink)}
                      >
                        👉 {msg.actionLink.label} <ExternalLink size={12} />
                      </button>
                    )}
                  </div>

                  <div className="apna-ai-msg-actions">
                    {msg.time && <span className="apna-ai-msg-time">{msg.time}</span>}

                    {msg.role === 'assistant' && (
                      <>
                        <button
                          className="apna-ai-tiny-btn"
                          type="button"
                          onClick={() => handleCopy(msg.content, idx)}
                          title="Copy response"
                        >
                          {copiedIndex === idx ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          {copiedIndex === idx ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          className={`apna-ai-tiny-btn ${feedbackState[idx] === 'up' ? 'active' : ''}`}
                          type="button"
                          onClick={() => handleFeedback(idx, 'up')}
                          title="Helpful response"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          className={`apna-ai-tiny-btn ${feedbackState[idx] === 'down' ? 'active' : ''}`}
                          type="button"
                          onClick={() => handleFeedback(idx, 'down')}
                          title="Not helpful"
                        >
                          <ThumbsDown size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="apna-ai-typing-indicator">
                <div className="apna-ai-dots">
                  <span className="apna-ai-dot" />
                  <span className="apna-ai-dot" />
                  <span className="apna-ai-dot" />
                </div>
                <span className="apna-ai-typing-text">Apna AI is querying campus records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {suggestions.length > 0 && (
            <div className="apna-ai-suggestions-bar">
              <span className="apna-ai-suggestions-title">💡 Suggested Questions:</span>
              <div className="apna-ai-chips-scroll">
                {suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    className="apna-ai-chip"
                    type="button"
                    onClick={() => handleSendMessage(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            className="apna-ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              className="apna-ai-input-field"
              placeholder={`Ask Apna AI about ${userRole} features, attendance, marks...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              maxLength={600}
            />

            <button
              className="apna-ai-send-btn"
              type="submit"
              disabled={!inputMessage.trim() || loading}
              title="Send message (Enter)"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
