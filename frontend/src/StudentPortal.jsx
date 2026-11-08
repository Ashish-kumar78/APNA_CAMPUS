import CalendarWidget from './components/CalendarWidget.jsx';
import React, { useEffect, useMemo, useState } from 'react'
import { AppLayout } from './components/Navigation'
import {
  Building2,
  GraduationCap,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Home,
  ArrowLeft,
  Briefcase,
  LibraryBig,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
  CheckCircle2,
  BarChart2,
  Heart,
  Fingerprint,
  Utensils,
  FileText,
  Sparkles,
  Megaphone,
  Clock,
  PartyPopper,
  MapPin,
  Award,
  Maximize2,
  FileCheck,
} from 'lucide-react'
import './StudentPortal.css'
import './DashboardHome.css'
import { CountUpNumber } from './utils/motion.jsx'
import { getGreetingDisplayName } from './utils/timeGreeting.js'
import StudentProfile from './StudentProfile.jsx'
import AcademicsPage from './pages/AcademicsPage.jsx'
import ExaminationPage from './pages/ExaminationPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import GrievanceRedressalPage from './pages/GrievanceRedressalPage.jsx'
import InternshipPage from './pages/InternshipPage.jsx'
import ErrorBoundary from './components/Common/ErrorBoundary.jsx'
import LibraryPage from './pages/LibraryPage.jsx'
import OnlineExamPage from './pages/OnlineExamPage.jsx'
import PlacementPage from './pages/PlacementPage.jsx'
import TimetablePage from './pages/TimetablePage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import MarksPage from './pages/MarksPage.jsx'
import FeesPage from './pages/FeesPage.jsx'
import NoticesPage from './pages/NoticesPage.jsx'
import HealthPage from './pages/HealthPage.jsx'
import IDCardPage from './pages/IDCardPage.jsx'
import BiometricPage from './pages/BiometricPage.jsx'
import CanteenPage from './pages/CanteenPage.jsx'
import StudentHostelPage from './pages/StudentHostelPage.jsx'
import ClassNotesPage from './pages/ClassNotesPage.jsx'
import ScholarshipPage from './pages/ScholarshipPage.jsx'
import BonafidePage from './pages/BonafidePage.jsx'
import CampusConnect from './components/CampusConnect/CampusConnect.jsx'
import AcademicResourcesSection from './components/CampusConnect/AcademicResourcesSection.jsx'
import LeadershipScoreboardSection from './components/CampusConnect/LeadershipScoreboardSection.jsx'
import AnonymousComplaintsSection from './components/CampusConnect/AnonymousComplaintsSection.jsx'
import { campusConnectStore } from './services/campusConnectStore.js'
import { api } from './services/api.js'
import { feesApi } from './services/feesApi.js'
import { getActiveStudent, setActiveStudent, getAllStudents, findStudentByQuery } from './services/studentStore.js'
import { notificationsApi } from './services/notificationsApi.js'
import { notificationsStore } from './services/notificationsStore.js'
import { erpStore } from './services/erpStore.js'

const profilePageTabMap = {
  attendance: 'Attendance Dashboard',
  fees: 'Fee Details',
  health: 'Health & Medical',
}

const campusSubViewMap = {
  'campus-connect': 'chats',
  'class-groups': 'chats',
  'announcements': 'announcements',
  'academic-requests': 'requests',
  'shared-resources': 'resources',
  'leadership': 'leadership',
  'anonymous-complaints': 'complaints',
}

// Speech bubble outline symbol matching user request (shape outline only, transparent inside)
export const ChatBubbleIcon = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`campus-nav-chat-bubble ${className}`}
    style={{
      flexShrink: 0,
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
    aria-hidden="true"
    {...props}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const studentNavSections = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: Home, page: 'dashboard' },
    ]
  },
  {
    title: 'ACADEMICS',
    items: [
      { label: 'Academics', icon: BookOpen, page: 'academics' },
      { label: 'Online Examination', icon: ClipboardList, page: 'online-exam' },
    ]
  },
  {
    title: 'CAMPUS',
    items: [
      { label: 'Hostel Residence', icon: Building2, page: 'hostel' },
      { label: 'Library', icon: LibraryBig, page: 'library' },
      { label: 'Self Development & Placement', icon: TrendingUp, page: 'placement' },
      { label: 'Internship', icon: Briefcase, page: 'internship' },
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { label: 'Grievance Redressal', icon: ShieldCheck, page: 'grievance-redressal' },
      { label: 'Feedback/Appraisal/Survey', icon: ChatBubbleIcon, page: 'feedback' },
    ]
  },
  {
    title: 'SCHOLARSHIP AND BONAFIDE CERTIFICATES',
    items: [
      { label: 'Apply Scholarship', icon: Award, page: 'apply-scholarship' },
      { label: 'Apply Bonafide Certificate', icon: FileCheck, page: 'bonafide' },
    ]
  }
];

const navigation = studentNavSections.flatMap(sec => sec.items);

const latestNotices = [
  { tag: 'SCHOLARSHIP', title: 'PRERANA Scholarship', detail: 'Eligible students can submit their application through the state scholarship portal.', date: '27 Sep 2026' },
  { tag: 'SCHOLARSHIP', title: 'National Scholarship Portal', detail: 'Renewal applications are open. Please verify your bank and identity details before submission.', date: '24 Sep 2026' },
  { tag: 'CAREER', title: 'GATE preparation support', detail: 'Registration for the weekend preparation program is available through the department office.', date: '19 Sep 2026' },
  { tag: 'EXAMINATION', title: 'Internal examination timetable', detail: 'The draft timetable for the upcoming internal assessments is ready for review.', date: '16 Sep 2026' },
]

const archivedNotices = [
  { tag: 'ACADEMIC', title: 'Course feedback window', detail: 'The course feedback form for the previous term is now closed.', date: '02 Sep 2026' },
  { tag: 'CAMPUS', title: 'Library hours during break', detail: 'The central library will operate on revised hours during the term break.', date: '28 Aug 2026' },
]

const holidays = [
  [
    '14-01-2026',
    'Makar Sankranti'
  ],
  [
    '23-01-2026',
    'Netaji Subas Bose Jayanti/ Saraswati Puja'
  ],
  [
    '26-01-2026',
    'Republic Day'
  ],
  [
    '03-03-2026',
    'Dola Purnami'
  ],
  [
    '04-03-2026',
    'Holi'
  ],
  [
    '21-03-2026',
    'Eid-Ul Fitar'
  ],
  [
    '27-03-2026',
    'Ram Navami'
  ],
  [
    '01-04-2026',
    'Utkal Divas'
  ],
  [
    '03-04-2026',
    'Good Friday'
  ],
  [
    '14-04-2026',
    'Maha Vishubha Sankranti'
  ],
  [
    '16-05-2026',
    'Sabitri Amavasya'
  ],
  [
    '28-05-2026',
    'Eid-Ul Zuha'
  ],
  [
    '15-06-2026',
    'Raja Sankrati'
  ],
  [
    '26-06-2026',
    'Muharram'
  ],
  [
    '16-07-2026',
    'Ratha Yatra'
  ],
  [
    '15-08-2026',
    'Independence Day'
  ],
  [
    '26-08-2026',
    'Prophet Muhammad Birthday'
  ],
  [
    '27-08-2026',
    'Jhulana Purnami'
  ],
  [
    '04-09-2026',
    'Janmastami'
  ],
  [
    '14-09-2026',
    'Ganesh Puja'
  ],
  [
    '15-09-2026',
    'Nuakhai'
  ],
  [
    '16-09-2026',
    'Day Following Nuakhai'
  ],
  [
    '02-10-2026',
    'Gandhi Jayanti'
  ],
  [
    '10-10-2026',
    'Mahalaya'
  ],
  [
    '17-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '18-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '19-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '20-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '21-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '22-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '23-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '24-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '09-11-2026',
    'Prathamastami'
  ],
  [
    '24-11-2026',
    'Rahasa Purnima'
  ],
  [
    '25-12-2026',
    'Christmas'
  ]
];

function StudentPortal({ account, onLogout }) {
  const [profileTab, setProfileTab] = useState('')
  const [profileQuickView, setProfileQuickView] = useState('')
  const [studentProfile, setStudentProfile] = useState(null)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    let active = true
    api.getProfile()
      .then((response) => {
        if (!response?.success || !response.data) return
        if (active && response.data) {
          setStudentProfile((prev) => ({ ...(prev || {}), ...response.data }))
          setProfileError('')
        }
      })
      .catch((error) => {
        console.warn('Student profile live sync note:', error?.message)
        // Silently preserve existing account props; do not display abort/transient error banners
        if (active && error?.name !== 'AbortError' && !error?.message?.toLowerCase().includes('abort') && !account?.name) {
          setProfileError(error.message || 'Could not load your student profile.')
        }
      })

    // Real-time synchronization with Accounts & Fees ledger
    const roll = account?.rollNumber || account?.registrationNumber || account?.studentId || '2305201001';
    feesApi.getFeeStatement(roll)
      .then((feeData) => {
        if (!active || !feeData) return;
        const total = Number(feeData.totalOverallFee) || Number(feeData.totalAnnualDues) || 322600;
        const paid = Number(feeData.totalOverallPaid) || Number(feeData.paidAmount) || 194680;
        const dues = Number(feeData.totalOverallDues) || Math.max(0, total - paid);
        setStudentProfile((prev) => ({
          ...(prev || {}),
          totalFees: total,
          paidFees: paid,
          dueFees: dues,
          totalFeesFormatted: `₹${total.toLocaleString('en-IN')}.00`,
          paidFeesFormatted: `₹${paid.toLocaleString('en-IN')}.00`,
          dueFeesFormatted: `₹${dues.toLocaleString('en-IN')}.00`,
          hasFeeRecords: true,
          feeStatement: feeData,
        }));
      })
      .catch(() => {});

    return () => {
      active = false
    }
  }, [account?.name, account?.rollNumber, account?.registrationNumber])

  const studentAccount = useMemo(() => {
    if (!studentProfile) return account
    return {
      ...account,
      ...studentProfile,
      registrationNumber: studentProfile.rollNumber || studentProfile.studentId || account?.registrationNumber,
      identity: studentProfile.rollNumber || studentProfile.studentId || account?.identity,
      program: studentProfile.programme?.name || account?.program,
      branch: studentProfile.department || account?.branch,
    }
  }, [account, studentProfile])

  const getInitial = () => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    if (hash && hash !== 'portal-top') {
      if (campusSubViewMap[hash]) {
        return { page: 'campus-connect', link: 'Campus Connect', tab: '', quickView: '' };
      }
      if (hash === 'profile' || hash === 'student-profile') {
        return { page: 'profile', link: 'Student Profile', tab: 'Personal', quickView: '' };
      }
      if (hash === 'marks' || hash === 'college-marks') {
        return { page: 'profile', link: 'View Profile', tab: '', quickView: 'College Marks' };
      }
      if (profilePageTabMap[hash]) {
        return { page: 'profile', link: 'View Profile', tab: profilePageTabMap[hash], quickView: '' };
      }
      if (hash === 'grievance' || hash === 'grievance-redressal') {
        return { page: 'grievance-redressal', link: 'Grievance Redressal', tab: '', quickView: '' };
      }
      if (hash === 'feedback' || hash === 'appraisal' || hash === 'feedback-appraisal') {
        return { page: 'feedback', link: 'Feedback/Appraisal/Survey', tab: '', quickView: '' };
      }
      if (hash === 'scholarship' || hash === 'apply-scholarship') {
        return { page: 'apply-scholarship', link: 'Apply Scholarship', tab: '', quickView: '' };
      }
      if (hash === 'bonafide' || hash === 'apply-bonafide' || hash === 'bonafide-certificate') {
        return { page: 'bonafide', link: 'Apply Bonafide Certificate', tab: '', quickView: '' };
      }
      const match = navigation.find((n) => n.page === hash);
      if (match) return { page: hash, link: match.label, tab: '', quickView: '' };
    }
    return { page: 'dashboard', link: 'Dashboard', tab: '', quickView: '' };
  };
  const init = getInitial();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(init.link);
  const [activePage, setActivePage] = useState(init.page);
  const [initialConvId, setInitialConvId] = useState('conv-ds');
  const [whatsappDrawerOpen, setWhatsappDrawerOpen] = useState(false);
  const [campusSubView, setCampusSubView] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    return campusSubViewMap[hash] || 'chats';
  });
  const [chatUnreadCount, setChatUnreadCount] = useState(() => {
    return campusConnectStore.getTotalUnreadCount ? campusConnectStore.getTotalUnreadCount() : 12;
  });

  useEffect(() => {
    const updateUnread = () => {
      if (campusConnectStore.getTotalUnreadCount) {
        setChatUnreadCount(campusConnectStore.getTotalUnreadCount());
      }
    };
    window.addEventListener('campus_connect_updated', updateUnread);
    return () => window.removeEventListener('campus_connect_updated', updateUnread);
  }, []);

  useEffect(() => {
    const handleChatNav = (e) => {
      const targetConvId = e.detail?.convId || 'conv-ds';
      setInitialConvId(targetConvId);
      setCampusSubView('chats');
      setActivePage('campus-connect');
      setActiveLink('Campus Connect');
      window.location.hash = 'campus-connect';
      setSidebarOpen(false);
    };
    window.addEventListener('cms_navigate_chat', handleChatNav);
    return () => window.removeEventListener('cms_navigate_chat', handleChatNav);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === 'dashboard' || hash === 'portal-top') {
        setActivePage('dashboard');
        setActiveLink('Dashboard');
        setProfileTab('');
        setProfileQuickView('');
        return;
      }
      if (campusSubViewMap[hash]) {
        setActivePage('campus-connect');
        setActiveLink('Campus Connect');
        setCampusSubView(campusSubViewMap[hash]);
        setProfileTab('');
        setProfileQuickView('');
        return;
      }
      if (hash === 'profile' || hash === 'student-profile') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        setActivePage('profile');
        setActiveLink('Student Profile');
        setProfileTab('Personal');
        setProfileQuickView('');
        return;
      }
      if (hash === 'marks' || hash === 'college-marks') {
        setActivePage('profile');
        setActiveLink('View Profile');
        setProfileTab('');
        setProfileQuickView('College Marks');
        return;
      }
      if (profilePageTabMap[hash]) {
        setActivePage('profile');
        setActiveLink('View Profile');
        setProfileTab(profilePageTabMap[hash]);
        setProfileQuickView('');
        return;
      }
      if (hash === 'grievance' || hash === 'grievance-redressal') {
        setActivePage('grievance-redressal');
        setActiveLink('Grievance Redressal');
        setProfileTab('');
        setProfileQuickView('');
        return;
      }
      if (hash === 'feedback' || hash === 'appraisal' || hash === 'feedback-appraisal') {
        setActivePage('feedback');
        setActiveLink('Feedback/Appraisal/Survey');
        setProfileTab('');
        setProfileQuickView('');
        return;
      }
      const match = navigation.find((n) => n.page === hash);
      if (match) {
        setActivePage(match.page);
        setActiveLink(match.label);
        setProfileTab('');
        setProfileQuickView('');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Scroll restoration: Whenever activePage changes, always scroll instantly to the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const shell = document.querySelector('.campus-os-shell');
    if (shell) shell.scrollTop = 0;
    const main = document.querySelector('.campus-os-main');
    if (main) main.scrollTop = 0;
  }, [activePage]);
  const [noticeTab, setNoticeTab] = useState('Latest')
  const [noticeQuery, setNoticeQuery] = useState('')
  const [expandedNotice, setExpandedNotice] = useState('')
  const [birthdayView, setBirthdayView] = useState('Today')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [holidayView, setHolidayView] = useState('all')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [selectedBroadcastModal, setSelectedBroadcastModal] = useState(null)
  const unreadNotifCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    let isMounted = true;
    const loadNotifications = async () => {
      // 1. Gather instant local/offline exam notices and stored broadcasts
      const examCircs = (erpStore.getExamCirculars() || []).map((c) => ({
        id: c.id,
        tag: 'EXAMINATION NOTICE',
        tagClass: 'notif-tag-exam',
        title: c.title,
        message: c.content,
        facultyInfo: 'Controller of Examinations (CoE)',
        time: c.date || 'Today',
        unread: true,
        isExamNotice: true,
        raw: c,
      }));

      const storeNotifs = (notificationsStore.getNotifications(studentAccount) || []).map((n) => ({
        id: n.id,
        tag: n.priority === 'URGENT' || n.priority === 'HIGH' ? 'URGENT' : (n.category ? n.category.replace(/_/g, ' ') : 'CAMPUS NOTICE'),
        tagClass: n.priority === 'URGENT' || n.priority === 'HIGH' ? 'notif-tag-urgent' : n.category === 'EXAMINATION' ? 'notif-tag-exam' : 'notif-tag-faculty',
        title: n.title,
        message: n.message,
        facultyInfo: `${n.senderName || 'Campus'}${n.senderDept ? ` · ${n.senderDept}` : ''}`,
        time: 'Recently',
        unread: !n.isRead && n.unread !== false,
        isFacultyNotice: true,
        raw: n,
      }));

      try {
        const facultyList = await notificationsApi.getStudentNotifications();
        if (!isMounted) return;

        const formattedFaculty = (facultyList || []).map((f) => {
          let timeAgo = 'Recently';
          if (f.publishedAt) {
            const diffHours = (Date.now() - new Date(f.publishedAt).getTime()) / 3600000;
            if (diffHours < 1) timeAgo = `${Math.max(1, Math.round(diffHours * 60))}m ago`;
            else if (diffHours < 24) timeAgo = `${Math.round(diffHours)}h ago`;
            else timeAgo = new Date(f.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          }

          return {
            id: f.id,
            tag: f.priority === 'URGENT' ? 'URGENT' : (f.category ? f.category.replace(/_/g, ' ') : 'ACADEMIC NOTICE'),
            tagClass: f.priority === 'URGENT' ? 'notif-tag-urgent' : f.category === 'EXAMINATION' ? 'notif-tag-exam' : f.category === 'ASSIGNMENT_DEADLINE' ? 'notif-tag-accounts' : 'notif-tag-faculty',
            title: f.title,
            message: f.message,
            facultyInfo: `${f.facultyName || 'Faculty'}${f.subjectCode ? ` • ${f.subjectCode}` : ''}`,
            time: timeAgo,
            unread: !f.isRead,
            isFacultyNotice: true,
            raw: f,
          };
        });

        // Deduplicate all notices
        const existingMap = new Map();
        for (const item of [...examCircs, ...formattedFaculty, ...storeNotifs]) {
          if (!existingMap.has(item.id)) {
            existingMap.set(item.id, item);
          }
        }
        setNotifications(Array.from(existingMap.values()));
      } catch (err) {
        console.warn('Backend student notification fetch fallback to store:', err?.message);
        if (isMounted) {
          const fallbackMap = new Map();
          for (const item of [...examCircs, ...storeNotifs]) {
            if (!fallbackMap.has(item.id)) {
              fallbackMap.set(item.id, item);
            }
          }
          setNotifications(Array.from(fallbackMap.values()));
        }
      }
    };

    loadNotifications();
    window.addEventListener('apna_campus_notifications_updated', loadNotifications);
    window.addEventListener('apna_campus_notification_dispatched', loadNotifications);
    return () => {
      isMounted = false;
      window.removeEventListener('apna_campus_notifications_updated', loadNotifications);
      window.removeEventListener('apna_campus_notification_dispatched', loadNotifications);
    };
  }, [studentAccount]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleToggleNotif = async (notif) => {
    if (!notif.unread) return;
    try {
      await notificationsApi.markAsRead(notif.id);
      setNotifications((prev) => prev.map((n) => (
        n.id === notif.id ? { ...n, unread: false } : n
      )));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleOpenNoticeDetail = (notif) => {
    setSelectedBroadcastModal(notif);
    if (notif.unread) {
      handleToggleNotif(notif);
    }
  };

  const studentPhoto = useMemo(() => {
    // 1. Explicit photo / photoUrl / avatar
    if (studentAccount?.photo && typeof studentAccount.photo === 'string' && !studentAccount.photo.includes('passport_photo_')) {
      return studentAccount.photo
    }
    if (studentAccount?.photoUrl && typeof studentAccount.photoUrl === 'string' && !studentAccount.photoUrl.includes('passport_photo_')) {
      return studentAccount.photoUrl
    }
    if (studentAccount?.avatar && typeof studentAccount.avatar === 'string' && !studentAccount.avatar.includes('passport_photo_')) {
      return studentAccount.avatar
    }

    // 2. Uploaded Passport Photo from admission documents
    if (Array.isArray(studentAccount?.documents)) {
      const pDoc = studentAccount.documents.find(
        (d) =>
          (d.id === 'photo' || d.category === 'photo' || /photo|passport/i.test(d.name || d.fileName || d.category || '')) &&
          (d.fileUrl || d.dataUrl)
      )
      if (pDoc) return pDoc.fileUrl || pDoc.dataUrl
    }

    // 3. Local session photo cache (stored during admission registration)
    try {
      const regId = studentAccount?.studentId || studentAccount?.rollNumber || studentAccount?.identifier || studentAccount?.registrationNumber
      if (regId) {
        const cached = localStorage.getItem(`apna_student_photo_${regId}`)
        if (cached) return cached
      }
    } catch (_) {}

    if (studentAccount?.photo && !studentAccount.photo.includes('female')) return studentAccount.photo
    return String(studentAccount?.gender || '').toLowerCase().includes('female')
      ? '/passport_photo_female.svg'
      : '/passport_photo_male.svg'
  }, [studentAccount])

  const [today] = useState(() => new Date())
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const timeGreeting = useMemo(() => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) {
      return {
        wish: 'Good morning',
        emoji: '',
        period: 'Morning',
        caption: 'Rise and shine! Have an inspiring, energetic, and productive learning day ahead.',
        motd: 'Morning lectures commence at 09:15 AM. Check your class timetable for room assignments.',
        themeClass: 'dash-hero-morning',
      }
    }
    if (hour >= 12 && hour < 17) {
      return {
        wish: 'Good afternoon',
        emoji: '',
        period: 'Afternoon',
        caption: 'Keep up the strong momentum in your afternoon lectures, lab practicals, and projects.',
        motd: 'Central library research wing and computing center access remain open till 08:00 PM.',
        themeClass: 'dash-hero-afternoon',
      }
    }
    if (hour >= 17 && hour < 22) {
      return {
        wish: 'Good evening',
        emoji: '',
        period: 'Evening',
        caption: 'Review today’s coursework, complete your assignments, and enjoy your evening.',
        motd: 'Scholarship applications for the 2026–27 session are now open.',
        themeClass: 'dash-hero-evening',
      }
    }
    return {
      wish: 'Good night',
      emoji: '',
      period: 'Night',
      caption: 'Rest well tonight and recharge your energy for tomorrow’s achievements.',
      motd: 'Campus quiet hours are in effect. Ensure assignments are submitted and devices charged.',
      themeClass: 'dash-hero-night',
    }
  }, [currentTime])

  const formattedLiveTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }, [currentTime])

  const todayLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
  }).format(today)
  const monthLabel = new Intl.DateTimeFormat('en-IN', {
    month: 'long', year: 'numeric',
  }).format(currentMonth)
  const noticeList = noticeTab === 'Latest' ? latestNotices : archivedNotices
  const visibleNotices = useMemo(() => noticeList.filter((notice) => {
    const query = noticeQuery.trim().toLowerCase()
    return !query || `${notice.title} ${notice.detail} ${notice.tag}`.toLowerCase().includes(query)
  }), [noticeList, noticeQuery])
  const calendarDays = createCalendarDays(currentMonth, today)
  const studentDisplayName = studentAccount?.name || 'Student'
  const initials = studentDisplayName.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('') || 'ST'
  const holidayItems = useMemo(() => {
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return holidays.map(([raw, name]) => {
      const [d, m, y] = raw.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      const daysLeft = Math.round((date - startOfToday) / 86400000)
      return { raw, name, date, daysLeft, key: `${y}-${m - 1}-${d}` }
    })
  }, [today])
  const displayedHolidays = useMemo(() => {
    if (holidayView === 'upcoming') {
      return holidayItems.filter((h) => h.daysLeft >= 0)
    }
    return holidayItems
  }, [holidayView, holidayItems])
  const holidayMap = useMemo(() => Object.fromEntries(holidayItems.map((h) => [h.key, h.name])), [holidayItems])
  const nextHoliday = holidayItems.find((h) => h.daysLeft >= 0)

  function updateMonth(direction) {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + direction, 1))
  }

  // Tab change handler for AppLayout sidebar
  const handleStudentTabChange = (page) => {
    setActivePage(page);
    const match = navigation.find(n => n.page === page);
    setActiveLink(match ? match.label : page);
    setProfileTab('');
    setProfileQuickView('');
    window.location.hash = page;
  };

  // Compute page heading for AppLayout
  const studentHeading = useMemo(() => {
    if (activePage === 'dashboard') return { title: 'Dashboard', subtitle: `Welcome back, ${studentAccount?.name?.split(' ')[0] || 'Student'}` };
    if (activePage === 'profile') return { title: 'Student Profile', subtitle: 'Personal & academic details' };
    if (activePage === 'my-admission') return { title: 'My Admission Dossier', subtitle: 'Provisional Offer, Verification Status & Enrollment Letter' };
    if (activePage === 'grievance-redressal') return { title: 'Grievance Redressal', subtitle: 'Official Student Grievance & Redressal Cell · AICTE/UGC Compliant' };
    if (activePage === 'feedback') return { title: 'Feedback / Appraisal', subtitle: 'Transparent & Anonymous Faculty Evaluation' };
    const match = navigation.find(n => n.page === activePage);
    return { title: match?.label || activeLink || 'Student Portal', subtitle: '' };
  }, [activePage, activeLink, studentAccount]);

  return (
    <div className="campus-os-shell">
      {/* WhatsApp Slide-out Drawer (Side of Notifications Panel Launcher) */}
      {whatsappDrawerOpen && (
        <div className="campus-whatsapp-drawer-overlay" onClick={() => setWhatsappDrawerOpen(false)}>
          <aside className="campus-whatsapp-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="whatsapp-drawer-header">
              <div className="whatsapp-drawer-title">
                <div className="whatsapp-drawer-logo">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3>Campus Connect</h3>
                  <p>College WhatsApp • Live Academic Hub</p>
                </div>
              </div>
              <div className="whatsapp-drawer-actions">
                <button
                  type="button"
                  className="whatsapp-drawer-action-btn"
                  title="Expand to Fullscreen"
                  onClick={() => {
                    setWhatsappDrawerOpen(false);
                    setActivePage('campus-connect');
                    setActiveLink('Campus Connect');
                    window.location.hash = 'campus-connect';
                  }}
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  type="button"
                  className="whatsapp-drawer-action-btn"
                  title="Close Drawer"
                  onClick={() => setWhatsappDrawerOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="whatsapp-drawer-body">
              <CampusConnect
                account={studentAccount}
                isDrawerMode={true}
                initialConversationId={initialConvId}
                initialView={campusSubView}
                onNavigateToModule={(mod) => {
                  setWhatsappDrawerOpen(false);
                  setActivePage(mod);
                  setActiveLink(mod);
                  window.location.hash = mod;
                }}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Standard Universal AppLayout */}
      <AppLayout
        account={studentAccount}
        portalName="Student Portal"
        portalSubtitle={`${studentAccount?.branch || studentAccount?.deptCode || 'B.Tech'} · ${studentAccount?.registrationNumber || 'Student'}`}
        portalHomeTab="dashboard"
        navSections={studentNavSections}
        activeTab={activePage}
        onTabChange={handleStudentTabChange}
        onLogout={onLogout}
        pageTitle={studentHeading.title}
        pageSubtitle={studentHeading.subtitle}
      >
        <div className="campus-os-body">
          {profileError && !profileError.toLowerCase().includes('abort') && (
            <p role="alert" style={{ margin: '0 0 12px', padding: 10, borderRadius: 8, background: '#fff1f2', color: '#b91c1c' }}>
              {profileError}
            </p>
          )}
          {activePage !== 'dashboard' && activePage !== 'profile' ? (
            <div className="portal-feature-page" id={activePage}>
              <div className="portal-breadcrumb">
                <button
                  type="button"
                  className="portal-back-btn"
                  onClick={() => {
                    setActivePage('dashboard')
                    setActiveLink('Dashboard')
                    window.location.hash = 'dashboard'
                  }}
                  title="Back to Dashboard"
                  aria-label="Back to Dashboard"
                >
                  <ArrowLeft size={15} />
                  <span>Back to Dashboard</span>
                </button>
                <span className="portal-breadcrumb-sep">|</span>
                <button
                  type="button"
                  className="portal-breadcrumb-home"
                  onClick={() => {
                    setActivePage('dashboard')
                    setActiveLink('Dashboard')
                    window.location.hash = 'dashboard'
                  }}
                  title="Return to Dashboard"
                  aria-label="Dashboard"
                >
                  <Home size={14} />
                </button>
                <span className="portal-breadcrumb-slash">/</span>
                <strong className="portal-breadcrumb-current">{activeLink}</strong>
              </div>
              {(activePage === 'campus-connect' ||
                activePage === 'class-groups' ||
                activePage === 'announcements' ||
                activePage === 'academic-requests' ||
                activePage === 'shared-resources' ||
                activePage === 'leadership' ||
                activePage === 'anonymous-complaints') && (
                  <CampusConnect
                    account={studentAccount}
                    initialConversationId={initialConvId}
                    initialCategory={activePage === 'class-groups' ? 'Classes' : 'All'}
                    initialView={campusSubView}
                    onBack={() => {
                      setActivePage('dashboard')
                      setActiveLink('Dashboard')
                      window.location.hash = 'dashboard'
                    }}
                    onNavigateToModule={(mod) => {
                      setActivePage(mod);
                      setActiveLink(mod);
                      window.location.hash = mod;
                    }}
                  />
                )}
              {activePage === 'class-notes' && <ClassNotesPage account={studentAccount || account} />}
              {activePage === 'marks' && <MarksPage initialRole="student" account={studentAccount || account} />}
              {activePage === 'hostel' && <StudentHostelPage defaultTab="gate-pass" account={studentAccount || account} />}
              {activePage === 'gate-pass' && <StudentHostelPage defaultTab="gate-pass" account={studentAccount || account} />}
              {activePage === 'food-feedback' && <StudentHostelPage defaultTab="food-feedback" account={studentAccount || account} />}
              {activePage === 'cleanliness-complaints' && <StudentHostelPage defaultTab="cleanliness" account={studentAccount || account} />}
              {activePage === 'fees' && <FeesPage account={studentAccount || account} />}
              {activePage === 'canteen' && <CanteenPage account={studentAccount || account} />}
              {activePage === 'attendance' && <AttendancePage account={studentAccount || account} />}
              {activePage === 'academics' && <AcademicsPage account={studentAccount} />}
              {activePage === 'timetable' && (
                <TimetablePage
                  onClose={() => {
                    setActivePage('dashboard')
                    setActiveLink('Dashboard')
                    window.location.hash = 'dashboard'
                  }}
                />
              )}
              {activePage === 'notices' && (
                <NoticesPage
                  account={studentAccount || account}
                  onNavigateHome={() => {
                    setActivePage('dashboard');
                    setActiveLink('Dashboard');
                    window.location.hash = 'dashboard';
                  }}
                />
              )}
              {activePage === 'idcard' && <IDCardPage />}
              {activePage === 'library' && <LibraryPage />}
              {activePage === 'scholarship' && <ScholarshipPage account={studentAccount} />}
              {activePage === 'internship' && <InternshipPage account={studentAccount} />}
              {activePage === 'online-exam' && <OnlineExamPage account={studentAccount} />}
              {activePage === 'apply-scholarship' && <ScholarshipPage account={studentAccount} />}
              {(activePage === 'bonafide' || activePage === 'apply-bonafide') && (
                <BonafidePage account={studentAccount} />
              )}
              {activePage === 'placement' && <PlacementPage account={studentAccount || account} />}
              {activePage === 'grievance-redressal' && (
                <GrievanceRedressalPage
                  account={studentAccount}
                  onBack={() => {
                    setActivePage('dashboard')
                    setActiveLink('Dashboard')
                    window.location.hash = 'dashboard'
                  }}
                />
              )}
              {activePage === 'feedback' && (
                <FeedbackPage
                  account={studentAccount}
                  onBack={() => {
                    setActivePage('dashboard')
                    setActiveLink('Dashboard')
                    window.location.hash = 'dashboard'
                  }}
                />
              )}
            </div>
          ) : activePage === 'profile' ? (
            <StudentProfile
              account={studentAccount}
              initialTab={profileTab || 'Personal'}
              initialQuickView={profileQuickView || ''}
              onBack={() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                setActivePage('dashboard');
                setActiveLink('Dashboard');
                setProfileTab('');
                setProfileQuickView('');
                window.location.hash = 'dashboard';
              }}
            />
          ) : (
            <div className="dash">
              {/* 3rd Image: Hero greeting that dynamically changes according to time and wishes */}
              <section className={`dash-hero ${timeGreeting.themeClass}`} aria-label="Welcome">
                <div className="dash-hero-glow" aria-hidden="true" />
                <div className="dash-hero-main">
                  <p className="dash-hero-kicker"><Sparkles size={13} /> Student workspace · Semester 5</p>
                  <h2 className="dash-hero-title">{timeGreeting.wish}, {getGreetingDisplayName(studentAccount?.name || 'Student')}</h2>
                  <p className="dash-hero-caption">{timeGreeting.caption}</p>
                  <div className="dash-motd" role="note" aria-label="Message of the day">
                    <span className="dash-motd-icon"><Megaphone size={14} /></span>
                    <strong>Message of the day</strong>
                    <span>{timeGreeting.motd}</span>
                  </div>
                </div>
                <div className="dash-hero-meta">
                  <span className="dash-chip">Academic year <strong>2026–27</strong></span>
                  <time className="dash-date"><CalendarDays size={14} /> {todayLabel}</time>
                  <span className="dash-chip" style={{ background: 'rgba(0,0,0,0.22)' }}>
                    <Clock size={11} /> {formattedLiveTime}
                  </span>
                </div>
              </section>


              {/* Top Hero Split: 1st Image (Student Profile) on LEFT + 2nd Image (2x2 Stats) on RIGHT (50% each) */}
              <div className="dash-hero-split">
                {/* 1st Image: Student Profile Card placed on LEFT SIDE with strict Passport Size Photo */}
                <aside className="dash-card dash-info dash-info-hero" id="student-information" aria-label="Student account information">
                  <div className="dash-info-cover">
                    <div className="dash-passport-photo-frame" title={`${studentAccount?.name || 'Student'} Passport Photograph (Official 35mm x 45mm)`}>
                      <img src={studentPhoto} alt={studentAccount?.name || 'Student'} className="dash-passport-img" />
                    </div>
                    <div>
                      <strong>{studentAccount?.name || 'Student'}</strong>
                      <small>{studentAccount?.registrationNumber || '—'}</small>
                    </div>
                    <span className="dash-status"><i /> Active</span>
                  </div>
                  <dl className="dash-info-list">
                    <DetailRow label="Registration No." value={studentAccount?.registrationNumber || studentAccount?.rollNumber || '—'} />
                    <DetailRow label="Name" value={studentAccount?.name || 'Student'} />
                    <DetailRow label="Program" value={studentAccount?.program || studentAccount?.course || 'B.Tech'} />
                    <DetailRow label="Batch" value={studentAccount?.batch || studentAccount?.academicYear || '2023–2027'} />
                    <DetailRow label="Department" value={studentAccount?.department || 'Computer Science & Engineering'} />
                    <DetailRow
                      label="Section"
                      value={(() => {
                        const sec = studentAccount?.section || studentAccount?.sectionName || 'A';
                        return String(sec).startsWith('Section') ? sec : `Section ${sec}`;
                      })()}
                    />
                    <DetailRow label="Email ID" value={studentAccount?.email || '—'} />
                    <DetailRow label="Mobile No." value={studentAccount?.phone || '—'} />
                  </dl>
                  <button className="dash-btn dash-btn-primary dash-info-btn" type="button" onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    setActivePage('profile');
                    setActiveLink('Student Profile');
                    setProfileTab('Personal');
                    setProfileQuickView('');
                    window.location.hash = 'profile';
                  }}>View profile <ChevronRight size={15} /></button>
                </aside>

                {/* 2nd Image: 2x2 Stats Grid placed on RIGHT SIDE - Content covering the whole box */}
                <section className="dash-stats-2x2" aria-label="Semester snapshot">
                  {/* Card 1: Enrolled Courses */}
                  <article className="dash-stat tone-blue">
                    {(() => {
                      const sem = studentAccount?.currentSemester || studentAccount?.semester || 'Semester 1';
                      const semLabel = String(sem).startsWith('Semester') ? sem : `Semester ${sem}`;
                      const coursesCount = Array.isArray(studentAccount?.enrollments) && studentAccount.enrollments.length > 0
                        ? studentAccount.enrollments.length
                        : Array.isArray(studentAccount?.enrolledSubjects) && studentAccount.enrolledSubjects.length > 0
                        ? studentAccount.enrolledSubjects.length
                        : null;
                      return (
                        <>
                          <div className="dash-stat-head">
                            <div className="dash-stat-head-left">
                              <span className="dash-stat-icon"><BookOpen size={18} /></span>
                              <span className="dash-stat-label">Enrolled courses</span>
                            </div>
                            <span className="dash-stat-badge tone-blue-badge">{semLabel}</span>
                          </div>
                          <div className="dash-stat-body">
                            <strong className="dash-stat-value">
                              {coursesCount !== null ? (
                                <CountUpNumber value={String(coursesCount).padStart(2, '0')} />
                              ) : (
                                'N/A'
                              )}
                            </strong>
                            <p className="dash-stat-desc">
                              {coursesCount !== null
                                ? `${semLabel} · ${coursesCount * 3 + 4} total credits`
                                : `${semLabel} · Awaiting course allocation`}
                            </p>
                          </div>
                          <div className="dash-stat-foot">
                            {coursesCount !== null ? (
                              <>
                                <span className="dash-stat-pill">Core Theory</span>
                                <span className="dash-stat-pill">Practical Labs</span>
                                <span className="dash-stat-pill tone-green-pill">Registered</span>
                              </>
                            ) : (
                              <span className="dash-stat-pill tone-amber-pill">Awaiting Enrollment</span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </article>

                  {/* Card 2: Attendance */}
                  <article className="dash-stat tone-green">
                    {(() => {
                      const hasAtt = Boolean(
                        studentAccount?.hasAttendanceRecords ||
                        (studentAccount?.attendancePercentage !== null && studentAccount?.attendancePercentage !== undefined)
                      );
                      const pct = hasAtt ? Number(studentAccount.attendancePercentage) : null;
                      const held = studentAccount?.classesHeld;
                      const attended = studentAccount?.classesAttended;
                      const isEligible = pct !== null && pct >= 75;

                      return (
                        <>
                          <div className="dash-stat-head">
                            <div className="dash-stat-head-left">
                              <span className="dash-stat-icon"><CheckCircle2 size={18} /></span>
                              <span className="dash-stat-label">Attendance</span>
                            </div>
                            <span className={`dash-stat-badge ${hasAtt ? (isEligible ? 'tone-green-badge' : 'tone-amber-badge') : 'tone-amber-badge'}`}>
                              {hasAtt ? (isEligible ? 'Eligible' : 'Shortage') : 'N/A'}
                            </span>
                          </div>
                          <div className="dash-stat-body">
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <strong className="dash-stat-value">
                                {hasAtt ? <CountUpNumber value={`${pct}%`} /> : 'N/A'}
                              </strong>
                              <span className="dash-stat-ratio" style={{ color: hasAtt ? undefined : '#94a3b8' }}>
                                {hasAtt && held ? `${attended} / ${held} Lectures` : 'No attendance records yet'}
                              </span>
                            </div>
                            <div className="dash-progress" aria-hidden="true">
                              <i style={{ width: hasAtt ? `${pct}%` : '0%', background: hasAtt ? undefined : '#cbd5e1' }} />
                            </div>
                          </div>
                          <div className="dash-stat-foot">
                            {hasAtt ? (
                              <small className={`dash-stat-sub ${isEligible ? 'text-green' : 'text-amber'}`}>
                                <Check size={13} /> {isEligible ? `${pct - 75}% above required 75% examination threshold` : `${75 - pct}% below required 75% threshold`}
                              </small>
                            ) : (
                              <small className="dash-stat-sub" style={{ color: '#64748b' }}>
                                <Check size={13} /> Your attendance records will appear after your classes begin.
                              </small>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </article>

                  {/* Card 3: Academic CGPA & Performance Trend Graph */}
                  <article className="dash-stat tone-violet">
                    {(() => {
                      const hasAtt = Boolean(
                        studentAccount?.hasAttendanceRecords ||
                        (studentAccount?.attendancePercentage !== null && studentAccount?.attendancePercentage !== undefined)
                      );
                      const isNewStudent = Boolean(
                        studentAccount?.isNewlyRegistered ||
                        studentAccount?.hasAcademicRecords === false ||
                        studentAccount?.cgpa === null ||
                        studentAccount?.cgpa === 'N/A'
                      );
                      const hasCgpa = !isNewStudent && (Boolean(studentAccount?.cgpa) || hasAtt);
                      const cgpaVal = studentAccount?.cgpa ? Number(studentAccount.cgpa).toFixed(2) : '8.42';

                      return (
                        <>
                          <div className="dash-stat-head">
                            <div className="dash-stat-head-left">
                              <span className="dash-stat-icon"><TrendingUp size={18} /></span>
                              <span className="dash-stat-label">Cumulative CGPA</span>
                            </div>
                            {hasCgpa ? (
                              <span className="dash-stat-badge tone-violet-badge">
                                Distinction ({cgpaVal})
                              </span>
                            ) : (
                              <span className="dash-stat-badge tone-amber-badge">
                                Awaiting Results
                              </span>
                            )}
                          </div>

                          <div className="dash-stat-body" style={{ margin: '8px 0 6px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <strong className="dash-stat-value">
                                {hasCgpa ? <CountUpNumber value={cgpaVal} /> : 'N/A'}
                                {hasCgpa && <em>/ 10.0</em>}
                              </strong>
                              <span className="dash-stat-ratio" style={{ color: hasCgpa ? '#7c3aed' : '#94a3b8' }}>
                                {hasCgpa ? 'SGPA 8.60 (Sem 4)' : 'No results published yet'}
                              </span>
                            </div>

                            {/* Aesthetic CGPA Trend Area Graph */}
                            {hasCgpa ? (
                              <div className="cgpa-chart-wrapper">
                                <svg
                                  viewBox="0 0 260 56"
                                  className="cgpa-sparkline-svg"
                                  preserveAspectRatio="none"
                                >
                                  <defs>
                                    <linearGradient id="cgpaGlowArea" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
                                      <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.10" />
                                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                                    </linearGradient>
                                    <filter id="cgpaLineShadow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#7c3aed" floodOpacity="0.35" />
                                    </filter>
                                  </defs>

                                  {/* Grid reference guide */}
                                  <line x1="16" y1="16" x2="244" y2="16" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                                  <line x1="16" y1="34" x2="244" y2="34" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                                  <line x1="16" y1="50" x2="244" y2="50" stroke="#f1f5f9" strokeWidth="1" />

                                  {/* Gradient area underneath curve */}
                                  <path
                                    d="M 22,36 C 48,32 58,28 78,28 C 104,28 118,22 138,22 C 162,22 176,16 196,16 L 196,50 L 22,50 Z"
                                    fill="url(#cgpaGlowArea)"
                                  />

                                  {/* Smooth cubic bezier line */}
                                  <path
                                    d="M 22,36 C 48,32 58,28 78,28 C 104,28 118,22 138,22 C 162,22 176,16 196,16"
                                    fill="none"
                                    stroke="#7c3aed"
                                    strokeWidth="2.75"
                                    strokeLinecap="round"
                                    filter="url(#cgpaLineShadow)"
                                  />

                                  {/* Projected trajectory to current ongoing semester */}
                                  <path
                                    d="M 196,16 L 238,16"
                                    fill="none"
                                    stroke="#c4b5fd"
                                    strokeWidth="2"
                                    strokeDasharray="3 3"
                                    strokeLinecap="round"
                                  />

                                  {/* Semester Nodes */}
                                  <circle cx="22" cy="36" r="3.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                                  <circle cx="78" cy="28" r="3.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                                  <circle cx="138" cy="22" r="3.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />

                                  {/* Semester 4 (Active/Latest) */}
                                  <circle cx="196" cy="16" r="6" fill="#7c3aed" fillOpacity="0.25" />
                                  <circle cx="196" cy="16" r="4" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />

                                  {/* Semester 5 (Ongoing) */}
                                  <circle cx="238" cy="16" r="3" fill="#ede9fe" stroke="#a78bfa" strokeWidth="1.5" />
                                </svg>

                                <div className="cgpa-sem-labels">
                                  <span className="cgpa-sem-pill" title="Semester 1 SGPA: 8.14">S1 <b>8.14</b></span>
                                  <span className="cgpa-sem-pill" title="Semester 2 SGPA: 8.42">S2 <b>8.42</b></span>
                                  <span className="cgpa-sem-pill" title="Semester 3 SGPA: 8.56">S3 <b>8.56</b></span>
                                  <span className="cgpa-sem-pill active" title="Semester 4 SGPA: 8.60">S4 <b>8.60</b></span>
                                  <span className="cgpa-sem-pill" style={{ opacity: 0.75 }} title="Semester 5 in Progress">S5 <i>Active</i></span>
                                </div>
                              </div>
                            ) : (
                              <div className="cgpa-chart-wrapper">
                                <svg
                                  viewBox="0 0 260 56"
                                  className="cgpa-sparkline-svg"
                                  preserveAspectRatio="none"
                                >
                                  <line x1="16" y1="36" x2="244" y2="36" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                                  <circle cx="36" cy="36" r="6" fill="#8b5cf6" fillOpacity="0.2" />
                                  <circle cx="36" cy="36" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                                  <circle cx="88" cy="36" r="2.5" fill="#cbd5e1" />
                                  <circle cx="140" cy="36" r="2.5" fill="#cbd5e1" />
                                  <circle cx="192" cy="36" r="2.5" fill="#cbd5e1" />
                                  <circle cx="236" cy="36" r="2.5" fill="#cbd5e1" />
                                </svg>
                                <div className="cgpa-sem-labels" style={{ justifyContent: 'center', gap: '8px' }}>
                                  <span className="cgpa-sem-pill active">Semester 1 · Enrolled</span>
                                  <span className="cgpa-sem-pill" style={{ color: '#94a3b8' }}>Awaiting Examination Results</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="dash-stat-foot">
                            {hasCgpa ? (
                              <small className="dash-stat-sub text-violet" style={{ color: '#7c3aed', fontWeight: 600 }}>
                                <Award size={13} /> Ranked in top 10% · Qualified for Dean's Merit List
                              </small>
                            ) : (
                              <small className="dash-stat-sub" style={{ color: '#64748b' }}>
                                <Check size={13} /> CGPA transcript updates following semester examinations.
                              </small>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </article>

                  {/* Card 4: Fees Details (Replaces Next Holiday) */}
                  <article className="dash-stat tone-amber dash-stat-fees-card">
                    <div className="fees-card-header">
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>₹</span>
                      <span>Fees Details</span>
                    </div>

                    <div className="fees-card-body">
                      {(() => {
                        const hasFeeData = Boolean(
                          studentAccount?.totalFees !== undefined ||
                          studentAccount?.paidFees !== undefined ||
                          studentAccount?.dueFees !== undefined ||
                          studentAccount?.totalFeesFormatted
                        );
                        const totalFeesText = studentAccount?.totalFeesFormatted || (studentAccount?.totalFees !== undefined ? `₹${Number(studentAccount.totalFees).toLocaleString('en-IN')}` : (hasFeeData ? '₹0.00' : 'N/A'));
                        const paidFeesText = studentAccount?.paidFeesFormatted || (studentAccount?.paidFees !== undefined ? `₹${Number(studentAccount.paidFees).toLocaleString('en-IN')}` : (hasFeeData ? '₹0.00' : 'N/A'));
                        const dueFeesText = studentAccount?.dueFeesFormatted || (studentAccount?.dueFees !== undefined ? `₹${Number(studentAccount.dueFees).toLocaleString('en-IN')}` : (hasFeeData ? '₹0.00' : 'N/A'));

                        return (
                          <>
                            {/* Cyan Banner: Total Fees till Date */}
                            <div className="fees-banner-row tone-cyan">
                              <div className="fees-amount">
                                {totalFeesText}
                              </div>
                              <div className="fees-label">
                                Total Fees till Date
                              </div>
                              <span className="fees-watermark" aria-hidden="true">
                                ₹
                              </span>
                            </div>

                            {/* Amber Banner: Total Paid by You till Date */}
                            <div className="fees-banner-row tone-amber">
                              <div className="fees-amount">
                                {paidFeesText}
                              </div>
                              <div className="fees-label">
                                Total Paid by You till Date
                              </div>
                              <span className="fees-watermark" aria-hidden="true">
                                ₹
                              </span>
                            </div>

                            {/* Red Banner: Total Dues */}
                            <div className="fees-banner-row tone-red">
                              <div className="fees-amount">
                                {dueFeesText}
                              </div>
                              <div className="fees-label">
                                Total Dues
                              </div>
                              <span className="fees-watermark" aria-hidden="true">
                                ₹
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </article>
                </section>
              </div>

              {/* Bottom Grid: Calendar & Holiday List Side-by-Side */}
              <div className="dash-grid-duo">
                <CalendarWidget account={account} />

                <section className="dash-card dash-holidays" id="holidays">
                  <header className="dash-card-head">
                    <h3><span className="dash-head-icon tone-amber"><PartyPopper size={15} /></span>Holiday List</h3>
                    <div className="dash-holiday-controls">
                      <div className="dash-holiday-filter-pills">
                        <button
                          type="button"
                          className={`dash-filter-pill ${holidayView === 'all' ? 'active' : ''}`}
                          onClick={() => setHolidayView('all')}
                        >
                          All 2026 ({holidayItems.length})
                        </button>
                        <button
                          type="button"
                          className={`dash-filter-pill ${holidayView === 'upcoming' ? 'active' : ''}`}
                          onClick={() => setHolidayView('upcoming')}
                        >
                          Upcoming ({holidayItems.filter((h) => h.daysLeft >= 0).length})
                        </button>
                      </div>
                    </div>
                  </header>
                  <ul className="dash-holiday-list dash-holiday-scroll" aria-label="Government holidays 2026">
                    {displayedHolidays.map((h) => (
                      <li className={`dash-holiday ${h.daysLeft < 0 ? 'is-past' : ''} ${nextHoliday && nextHoliday.raw === h.raw ? 'is-next' : ''}`} key={h.raw}>
                        <span className="dash-holiday-date">
                          <strong>{h.date.getDate()}</strong>
                          <small>{h.date.toLocaleString('en-IN', { month: 'short' })}</small>
                        </span>
                        <span className="dash-holiday-info">
                          <strong>{h.name}</strong>
                          <small>{h.date.toLocaleString('en-IN', { weekday: 'long' })} · {h.raw}</small>
                        </span>
                        <span className="dash-holiday-badge">
                          {h.daysLeft < 0 ? 'Passed' : h.daysLeft === 0 ? 'Today' : h.daysLeft === 1 ? 'Tomorrow' : `in ${h.daysLeft}d`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <footer className="dash-footer">Apna Campus <span>·</span> Student management portal <span>·</span> {today.getFullYear()}</footer>
            </div>
          )}
        </div>
      </AppLayout>

      {/* Broadcast Notice Inspection Modal */}
      {selectedBroadcastModal && (
        <div className="payment-modal-backdrop" onClick={() => setSelectedBroadcastModal(null)} style={{ zIndex: 10000 }}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span className={`notif-tag-badge ${selectedBroadcastModal.tagClass}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                {selectedBroadcastModal.tag}
              </span>
              <button
                className="payment-modal-close"
                onClick={() => setSelectedBroadcastModal(null)}
                style={{ position: 'static' }}
              >
                ×
              </button>
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 10px', color: '#0a0f1e', lineHeight: 1.35 }}>
              {selectedBroadcastModal.title}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {selectedBroadcastModal.facultyInfo && (
                <span style={{ color: '#0f766e', fontWeight: 600 }}>
                  👨‍🏫 {selectedBroadcastModal.facultyInfo}
                </span>
              )}
              {selectedBroadcastModal.raw?.subjectName && (
                <span>• {selectedBroadcastModal.raw.subjectName}</span>
              )}
              {selectedBroadcastModal.raw?.semester && (
                <span>• {selectedBroadcastModal.raw.semester} ({selectedBroadcastModal.raw.section})</span>
              )}
              <span>• {selectedBroadcastModal.time}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '0.92rem', lineHeight: '1.6', color: '#334155', marginBottom: '20px', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>
              {selectedBroadcastModal.message}
            </div>
            {selectedBroadcastModal.raw?.attachmentName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '16px', fontSize: '0.85rem', color: '#065f46' }}>
                <FileText size={16} />
                <span>Academic Material: <strong>{selectedBroadcastModal.raw.attachmentName}</strong></span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-pay-now"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => setSelectedBroadcastModal(null)}
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PortalPanel({ id, title, icon: Icon, className = '', action, children }) {
  return (
    <section className={`portal-panel ${className}`} id={id}>
      <header className="portal-panel-heading">
        <h2><Icon size={14} />{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}

function DetailRow({ label, value }) {
  return <div className="student-detail-row"><dt>{label}</dt><dd>{value}</dd></div>
}

function FeeBar({ tone, amount, label }) {
  return <div className={`fee-bar ${tone}`}><strong>{amount}</strong><span>{label}</span><CreditCard size={25} aria-hidden="true" /></div>
}

function createCalendarDays(month, today) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    return {
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === month.getMonth(),
      isToday: date.toDateString() === today.toDateString(),
      isSunday: date.getDay() === 0,
    }
  })
}

function GiftMark({ size = 32 }) {
  return (
    <img
      src="/logo.png"
      alt="Apna Campus Logo"
      className="portal-gift-mark"
      style={{
        height: `${size}px`,
        width: 'auto',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}

export default StudentPortal
