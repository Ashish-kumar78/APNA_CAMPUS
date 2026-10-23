import { useEffect, useMemo, useState } from 'react'
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
  Rss,
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
} from 'lucide-react'
import './StudentPortal.css'
import './DashboardHome.css'
import { getGreetingDisplayName } from './utils/timeGreeting.js'
import StudentProfile from './StudentProfile.jsx'
import AcademicsPage from './pages/AcademicsPage.jsx'
import BloggingPage from './pages/BloggingPage.jsx'
import ExaminationPage from './pages/ExaminationPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import InternshipPage from './pages/InternshipPage.jsx'
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
import CampusConnect from './components/CampusConnect/CampusConnect.jsx'
import AcademicResourcesSection from './components/CampusConnect/AcademicResourcesSection.jsx'
import LeadershipScoreboardSection from './components/CampusConnect/LeadershipScoreboardSection.jsx'
import AnonymousComplaintsSection from './components/CampusConnect/AnonymousComplaintsSection.jsx'
import { campusConnectStore } from './services/campusConnectStore.js'
import { api } from './services/api.js'
import { getActiveStudent, setActiveStudent, getAllStudents, findStudentByQuery } from './services/studentStore.js'
import { notificationsApi } from './services/notificationsApi.js'

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

const navSections = [
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
      { label: 'Timetable', icon: CalendarDays, page: 'timetable' },
      { label: 'Online Examination', icon: ClipboardList, page: 'online-exam' },
      { label: 'Class Notes & Sharing', icon: FileText, page: 'class-notes' },
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
      { label: 'Anonymous Complaints', icon: ShieldCheck, page: 'anonymous-complaints' },
      { label: 'Feedback/Appraisal/Survey', icon: ChatBubbleIcon, page: 'feedback' },
      { label: 'Blogging & Stories', icon: Rss, page: 'blogging' },
    ]
  }
];

const navigation = navSections.flatMap(sec => sec.items);

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

const initialStudentNotifications = [
  {
    id: 'notif-1',
    tag: 'SCHOLARSHIP',
    tagClass: 'notif-tag-scholarship',
    title: 'PRERANA Post-Matric Scholarship Sanctioned',
    message: 'Disbursement sanctioned by SSD Department. Verification complete and approved.',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: 'notif-2',
    tag: 'EXAMINATION',
    tagClass: 'notif-tag-exam',
    title: 'Internal Assessment Timetable Released',
    message: 'Internal examination schedule commences from Oct 14, 2026. Review timetable page.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'notif-3',
    tag: 'LIBRARY',
    tagClass: 'notif-tag-library',
    title: 'Book Return Reminder',
    message: '"Introduction to Algorithms (CLRS)" due in 3 days. Return to central desk to avoid fine.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'notif-4',
    tag: 'ACCOUNTS',
    tagClass: 'notif-tag-accounts',
    title: 'Semester VII Tuition Fee Receipt Generated',
    message: 'Official payment receipt #RCP-2026-8821 verified and available in Fees & Accounts.',
    time: '3 days ago',
    unread: false,
  },
]


const holidays = [
  ['14-01-2026', 'Makar Sankranti / Pongal'],
  ['23-01-2026', 'Netaji Jayanti / Veer Surendra Sai Jayanti'],
  ['26-01-2026', 'Republic Day'],
  ['15-02-2026', 'Maha Shivratri'],
  ['04-03-2026', 'Dola Purnima / Holi Eve'],
  ['05-03-2026', 'Holi Festival'],
  ['20-03-2026', 'Id-ul-Fitr (Ramzan Id)'],
  ['27-03-2026', 'Sri Ram Navami'],
  ['01-04-2026', 'Utkal Divas (Odisha Day)'],
  ['03-04-2026', 'Good Friday'],
  ['14-04-2026', 'Dr. B.R. Ambedkar Jayanti / Maha Vishuba Sankranti'],
  ['01-05-2026', 'May Day (International Workers\' Day)'],
  ['27-05-2026', 'Bakrid / Eid-ul-Adha'],
  ['16-07-2026', 'Rath Yatra (Car Festival)'],
  ['24-07-2026', 'Bahuda Yatra'],
  ['26-07-2026', 'Muharram'],
  ['15-08-2026', 'Independence Day'],
  ['04-09-2026', 'Sri Krishna Janmashtami'],
  ['14-09-2026', 'Ganesh Chaturthi / Vinayaka Puja'],
  ['16-09-2026', 'Nuakhai (Western Odisha Festival)'],
  ['02-10-2026', 'Mahatma Gandhi Jayanti'],
  ['10-10-2026', 'Mahalaya'],
  ['14-10-2026', 'Durga Puja (Maha Saptami)'],
  ['15-10-2026', 'Durga Puja (Maha Ashtami)'],
  ['16-10-2026', 'Durga Puja (Maha Navami)'],
  ['17-10-2026', 'Vijaya Dashami (Dussehra)'],
  ['20-10-2026', 'Diwali / Kali Puja'],
  ['24-11-2026', 'Guru Nanak Jayanti / Rahas Purnima'],
  ['25-12-2026', 'Christmas Day'],
]

function StudentPortal({ account, onLogout }) {
  const [profileTab, setProfileTab] = useState('')
  const [profileQuickView, setProfileQuickView] = useState('')

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
      if (hash === 'feedback' || hash === 'appraisal' || hash === 'feedback-appraisal' || hash === 'grievance' || hash === 'grievance-redressal') {
        return { page: 'feedback', link: 'Feedback/Appraisal/Survey', tab: '', quickView: '' };
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
      if (hash === 'feedback' || hash === 'appraisal' || hash === 'feedback-appraisal' || hash === 'grievance' || hash === 'grievance-redressal') {
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
  const [notifications, setNotifications] = useState(initialStudentNotifications)
  const [selectedBroadcastModal, setSelectedBroadcastModal] = useState(null)
  const unreadNotifCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    let isMounted = true;
    const loadNotifications = async () => {
      try {
        const roll = account?.rollNumber || account?.registrationNumber || '01';
        const facultyList = await notificationsApi.getStudentNotifications(roll);
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
            raw: f
          };
        });

        setNotifications([...formattedFaculty, ...initialStudentNotifications]);
      } catch (err) {
        console.warn('Failed to load student notifications:', err);
      }
    };

    loadNotifications();
    window.addEventListener('apna_campus_notifications_updated', loadNotifications);
    return () => {
      isMounted = false;
      window.removeEventListener('apna_campus_notifications_updated', loadNotifications);
    };
  }, [account]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    const roll = account?.rollNumber || '01';
    notifications.forEach((n) => {
      if (n.isFacultyNotice && n.unread) {
        notificationsApi.markAsRead(n.id, roll).catch(() => {});
      }
    });
  };

  const handleToggleNotif = async (notif) => {
    const id = notif.id;
    const newUnread = !notif.unread;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: newUnread } : n)));
    if (notif.isFacultyNotice && !newUnread) {
      const roll = account?.rollNumber || '01';
      notificationsApi.markAsRead(id, roll).catch(() => {});
    }
  };

  const handleOpenNoticeDetail = (notif) => {
    setSelectedBroadcastModal(notif);
    if (notif.unread) {
      handleToggleNotif(notif);
    }
  };

  const studentPhoto = useMemo(() => {
    if (account?.photo && !account.photo.includes('female')) return account.photo
    return '/passport_photo_male.svg'
  }, [account])

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
  const studentDisplayName = account?.name || 'Student'
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
                account={account}
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

      <div className="campus-os-container">
        {/* Floating Sidebar identical to Campus OS Dashboard */}
        {sidebarOpen && (
          <aside className="campus-os-sidebar">
            <div className="campus-os-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="campus-brand-icon" style={{ background: '#ffffff', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div>
                  <p className="campus-brand-kicker">APNA CAMPUS</p>
                  <h2 className="campus-brand-title">Student Portal</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close Navigation"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="campus-os-nav">
              {navSections.map((sec) => (
                <div key={sec.title} className="campus-os-nav-section">
                  <p className="campus-os-nav-section-title">{sec.title}</p>
                  {sec.items.map(({ label, icon: Icon, page, badge }) => (
                    <a
                      className={activeLink === label ? 'active' : ''}
                      href={`#${page}`}
                      aria-current={activeLink === label ? 'page' : undefined}
                      key={label}
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveLink(label)
                        setActivePage(page)
                        window.location.hash = page
                        setSidebarOpen(false)
                      }}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                      {badge && <span className="cc-nav-badge">{badge}</span>}
                    </a>
                  ))}
                </div>
              ))}
            </nav>

            <div
              className="campus-os-role-card"
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                setActivePage('profile');
                setActiveLink('Student Profile');
                setProfileTab('Personal');
                setProfileQuickView('');
                window.location.hash = 'profile';
                setSidebarOpen(false);
              }}
              style={{ cursor: 'pointer' }}
              title="View student profile"
            >
              <div>
                <p className="campus-role-kicker" style={{ margin: 0 }}>CURRENT ROLE</p>
                <p className="campus-role-val" style={{ margin: 0 }}>Student</p>
              </div>
              <small className="campus-role-sub" style={{ marginTop: '6px' }}>{account.name} • {account.registrationNumber}</small>
            </div>
          </aside>
        )}

        {/* Floating Main Content Card identical to Campus OS Dashboard */}
        <main className="campus-os-main">
          <header className="campus-os-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {!sidebarOpen && (
                <button
                  className="campus-nav-toggle-btn"
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  title="Show Navigation"
                  aria-label="Show Navigation"
                >
                  <Menu size={20} />
                </button>
              )}
              <div>
                <p className="campus-header-kicker">OVERVIEW</p>
                <h1 className="campus-header-title">{activeLink === 'Dashboard' ? 'Student dashboard' : activeLink}</h1>
                <p className="campus-header-subtitle">{timeGreeting.wish}, {account?.name || 'Student'}</p>
              </div>
            </div>

            <div className="campus-header-actions">
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  className="campus-icon-btn"
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setShowNotifications((s) => !s)}
                  title="Campus Notifications"
                >
                  <Bell size={18} />
                  {unreadNotifCount > 0 && <span className="campus-bell-dot" />}
                </button>
                {showNotifications && (
                  <div className="campus-notif-popover" role="dialog" aria-label="Notifications">
                    <div className="notif-popover-head">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>Notifications</strong>
                        {unreadNotifCount > 0 && (
                          <span className="notif-count-badge">{unreadNotifCount} new</span>
                        )}
                      </div>
                      <button
                        className="notif-close-btn"
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        aria-label="Close notifications"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="notif-popover-body">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notif-item ${notif.unread ? 'is-unread' : ''}`}
                          onClick={() => handleOpenNoticeDetail(notif)}
                          role="button"
                          tabIndex={0}
                          title="Click to view full announcement details"
                        >
                          <div className="notif-item-top">
                            <span className={`notif-tag-badge ${notif.tagClass}`}>{notif.tag}</span>
                            <span className="notif-time">{notif.time}</span>
                          </div>
                          <h4 className="notif-title">{notif.title}</h4>
                          {notif.facultyInfo && (
                            <div style={{ fontSize: '10.5px', color: '#0f766e', fontWeight: 600, marginBottom: '3px' }}>
                              👨‍🏫 {notif.facultyInfo}
                            </div>
                          )}
                          <p className="notif-message" style={{ display: '-webkit-box', WebKitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {notif.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="notif-popover-footer">
                      <button
                        className="notif-mark-read-btn"
                        type="button"
                        onClick={handleMarkAllRead}
                      >
                        Mark all as read
                      </button>
                      <button
                        className="notif-view-all-btn"
                        type="button"
                        onClick={() => {
                          setShowNotifications(false)
                          setActivePage('notices')
                          setActiveLink('Campus Notices')
                          window.location.hash = 'notices'
                        }}
                      >
                        View all notices →
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="campus-user-pill"
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                  setActivePage('profile');
                  setActiveLink('Student Profile');
                  setProfileTab('Personal');
                  setProfileQuickView('');
                  window.location.hash = 'profile';
                }}
                style={{ cursor: 'pointer' }}
                title="View student profile"
              >
                <div className="campus-user-passport" title={`${account.name} Passport Photo`}>
                  <img src={studentPhoto} alt={account.name} className="campus-user-passport-img" />
                </div>
                <div className="campus-user-details">
                  <strong>{account.name}</strong>
                  <small>Student • {account.registrationNumber}</small>
                </div>
                <button
                  className="campus-logout-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof window !== 'undefined') {
                      window.location.hash = '';
                      if (window.history && window.history.replaceState) {
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                      }
                    }
                    onLogout();
                  }}
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>

          <div className="campus-os-body">
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
                  account={account}
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
              {activePage === 'class-notes' && <ClassNotesPage account={account} />}
              {activePage === 'marks' && <MarksPage initialRole="student" />}
              {activePage === 'hostel' && <StudentHostelPage defaultTab="overview" />}
              {activePage === 'gate-pass' && <StudentHostelPage defaultTab="gate-pass" />}
              {activePage === 'fees' && <FeesPage />}
              {activePage === 'canteen' && <CanteenPage />}
              {activePage === 'attendance' && <AttendancePage />}
              {activePage === 'academics' && <AcademicsPage account={account} />}
              {activePage === 'timetable' && <TimetablePage />}
              {activePage === 'notices' && <NoticesPage />}
              {activePage === 'idcard' && <IDCardPage />}
              {activePage === 'library' && <LibraryPage />}
              {activePage === 'internship' && <InternshipPage account={account} />}
              {activePage === 'online-exam' && <OnlineExamPage />}
              {activePage === 'placement' && <PlacementPage />}
              {activePage === 'feedback' && (
                <FeedbackPage
                  account={account}
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
              account={account}
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
              <h2 className="dash-hero-title">{timeGreeting.wish}, {getGreetingDisplayName(account?.name || 'Student')}</h2>
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
                <div className="dash-passport-photo-frame" title={`${account?.name || 'Student'} Passport Photograph (Official 35mm x 45mm)`}>
                  <img src={studentPhoto} alt={account?.name || 'Student'} className="dash-passport-img" />
                </div>
                <div>
                  <strong>{account?.name || 'Student'}</strong>
                  <small>{account?.registrationNumber || '—'}</small>
                </div>
                <span className="dash-status"><i /> Active</span>
              </div>
              <dl className="dash-info-list">
                <DetailRow label="Registration No." value={account?.registrationNumber || account?.rollNumber || '—'} />
                <DetailRow label="Name" value={account?.name || 'Student'} />
                <DetailRow label="Program" value={account?.program || account?.course || 'B.Tech'} />
                <DetailRow label="Batch" value={account?.batch || '2023–2027'} />
                <DetailRow label="Department" value={account?.department || 'Computer Science & Engineering'} />
                <DetailRow
                  label="Section"
                  value={(() => {
                    const sec = account?.section || account?.sectionName || 'A';
                    return String(sec).startsWith('Section') ? sec : `Section ${sec}`;
                  })()}
                />
                <DetailRow label="Email ID" value={account?.email || `${(account?.name || 'student').toLowerCase().replace(/\s+/g, '.')}@student.apnacampus.edu.in`} />
                <DetailRow label="Mobile No." value={account?.phone || '+91 98610 23010'} />
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
                  const sem = account?.currentSemester || account?.semester || 5;
                  const semLabel = String(sem).startsWith('Semester') ? sem : `Semester ${sem}`;
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
                        <strong className="dash-stat-value">{account?.enrolledSubjects ? String(account.enrolledSubjects.length).padStart(2, '0') : '06'}</strong>
                        <p className="dash-stat-desc">{semLabel} · 22 total credits</p>
                      </div>
                    </>
                  );
                })()}
                <div className="dash-stat-foot">
                  <span className="dash-stat-pill">4 Core Theory</span>
                  <span className="dash-stat-pill">2 Practical Labs</span>
                  <span className="dash-stat-pill tone-green-pill">Registered</span>
                </div>
              </article>

              {/* Card 2: Attendance */}
              <article className="dash-stat tone-green">
                <div className="dash-stat-head">
                  <div className="dash-stat-head-left">
                    <span className="dash-stat-icon"><CheckCircle2 size={18} /></span>
                    <span className="dash-stat-label">Attendance</span>
                  </div>
                  <span className="dash-stat-badge tone-green-badge">Eligible</span>
                </div>
                <div className="dash-stat-body">
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong className="dash-stat-value">92%</strong>
                    <span className="dash-stat-ratio">138 / 150 Lectures</span>
                  </div>
                  <div className="dash-progress" aria-hidden="true">
                    <i style={{ width: '92%' }} />
                  </div>
                </div>
                <div className="dash-stat-foot">
                  <small className="dash-stat-sub text-green">
                    <Check size={13} /> 17% above required 75% examination threshold
                  </small>
                </div>
              </article>

              {/* Card 3: Next Class */}
              <article className="dash-stat tone-violet">
                <div className="dash-stat-head">
                  <div className="dash-stat-head-left">
                    <span className="dash-stat-icon"><Clock size={18} /></span>
                    <span className="dash-stat-label">Next class</span>
                  </div>
                  <span className="dash-stat-badge tone-violet-badge">Starts 10:30 AM</span>
                </div>
                <div className="dash-stat-body">
                  <strong className="dash-stat-value">10:30 <em>AM</em></strong>
                  <p className="dash-stat-desc">Data Structures &amp; Algorithms</p>
                </div>
                <div className="dash-stat-foot">
                  <span className="dash-stat-sub">
                    <MapPin size={13} /> Room 204 · Block B (Dr. S. K. Nayak)
                  </span>
                </div>
              </article>

              {/* Card 4: Next Holiday */}
              <article className="dash-stat tone-amber">
                <div className="dash-stat-head">
                  <div className="dash-stat-head-left">
                    <span className="dash-stat-icon"><PartyPopper size={18} /></span>
                    <span className="dash-stat-label">Next holiday</span>
                  </div>
                  <span className="dash-stat-badge tone-amber-badge">Govt Gazetted</span>
                </div>
                <div className="dash-stat-body">
                  <strong className="dash-stat-value">{nextHoliday ? (nextHoliday.daysLeft === 0 ? 'Today' : nextHoliday.daysLeft === 1 ? 'Tomorrow' : `${nextHoliday.daysLeft} days`) : '5 days'}</strong>
                  <p className="dash-stat-desc">{nextHoliday ? nextHoliday.name : 'Mahalaya'}</p>
                </div>
                <div className="dash-stat-foot">
                  <span className="dash-stat-sub">
                    {nextHoliday?.date ? nextHoliday.date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : 'Sat, 10 Oct, 2026'} · Campus closed
                  </span>
                </div>
              </article>
            </section>
          </div>

          {/* Bottom Grid: Calendar & Holiday List Side-by-Side */}
          <div className="dash-grid-duo">
            <section className="dash-card dash-calendar" id="calendar">
              <header className="dash-card-head">
                <h3><span className="dash-head-icon"><CalendarDays size={15} /></span>Calendar</h3>
                <div className="dash-cal-controls">
                  <button type="button" onClick={() => updateMonth(-1)} aria-label="Previous month"><ChevronLeft size={15} /></button>
                  <strong>{monthLabel}</strong>
                  <button type="button" onClick={() => updateMonth(1)} aria-label="Next month"><ChevronRight size={15} /></button>
                </div>
              </header>
              <div className="dash-cal-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="dash-cal-days">
                {calendarDays.map(({ key, day, inMonth, isToday, isSunday }) => {
                  const holidayName = holidayMap[key]
                  return (
                    <span
                      className={['dash-day', inMonth ? '' : 'is-outside', isToday ? 'is-today' : '', holidayName ? 'is-holiday' : '', isSunday ? 'is-sunday' : ''].join(' ')}
                      title={holidayName || undefined}
                      key={key}
                    >{day}</span>
                  )
                })}
              </div>
              <div className="dash-legend">
                <span><i className="lg-holiday" />Holiday</span>
                <span><i className="lg-sunday" />Sunday</span>
                <span><i className="lg-today" />Today</span>
              </div>
            </section>

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
        </main>
      </div>

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

function GiftMark() {
  return <span className="portal-gift-mark" aria-hidden="true"><span>G</span></span>
}

export default StudentPortal
