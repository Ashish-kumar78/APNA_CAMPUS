import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  MessageSquare,
  GraduationCap,
  Building2,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Megaphone,
  AlertTriangle,
  Award,
  Users,
  Clock,
  LogOut,
  Send,
  Eye,
  ShieldCheck,
  Check,
  Menu,
  X,
  FileSpreadsheet,
  CalendarDays,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  Printer,
  UserCheck,
  Info,
  Wrench,
  History,
  CreditCard,
  FileCheck,
  PartyPopper,
  MapPin,
  ArrowRight,
  ExternalLink,
  FileCheck2,
  BookOpen,
  Activity,
  Bell
} from 'lucide-react';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import TimetableManager from './TimetableManagement/TimetableManager.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import PrincipalDepartmentModule from './PrincipalModules/PrincipalDepartmentModule.jsx';
import PrincipalExamOversightModule from './PrincipalModules/PrincipalExamOversightModule.jsx';
import PrincipalFinanceModule from './PrincipalModules/PrincipalFinanceModule.jsx';
import PrincipalFacultyStaffModule from './PrincipalModules/PrincipalFacultyStaffModule.jsx';
import PrincipalInfrastructureModule from './PrincipalModules/PrincipalInfrastructureModule.jsx';
import PrincipalAccreditationModule from './PrincipalModules/PrincipalAccreditationModule.jsx';
import PrincipalGrievanceModule from './PrincipalModules/PrincipalGrievanceModule.jsx';
import PrincipalCalendarModule from './PrincipalModules/PrincipalCalendarModule.jsx';
import PrincipalAuditModule from './PrincipalModules/PrincipalAuditModule.jsx';
import BonafideReviewQueue from './Bonafide/BonafideReviewQueue.jsx';
import { PRINCIPAL_OFFICER, INITIAL_DEPARTMENTS, INITIAL_INSTITUTIONAL_EVENTS, INITIAL_AUDIT_LOGS } from './PrincipalModules/principalData.js';
import '../DashboardHome.css';
import './PrincipalPortal.css';
import './SuperAdminPortal.css';
import { api } from '../services/api.js';
import { getGreetingDisplayName } from '../utils/timeGreeting.js';

// Official Institutional Gazetted Holidays 2026 (Matching Student & Role Dashboards)
const OFFICIAL_HOLIDAYS_2026 = [
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
];

function createCalendarDays(month, today) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return {
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === month.getMonth(),
      isToday: date.toDateString() === today.toDateString(),
      isSunday: date.getDay() === 0,
    };
  });
}

export default function PrincipalPortal({ account, onLogout, onSwitchRole, initialTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || account?.initialTab || 'dashboard');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live Real-Time Clock & Greeting
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeGreeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) {
      return {
        wish: 'Good morning',
        period: 'Morning',
        themeClass: 'dash-hero-morning',
        caption: 'Autonomous Academic Governance · Senate & Council Leadership · Institutional Command Center',
        motd: 'Autumn End-Semester Autonomous examination timetable approved. NAAC Cycle IV preparatory accreditation dossiers synchronized.'
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        wish: 'Good afternoon',
        period: 'Afternoon',
        themeClass: 'dash-hero-afternoon',
        caption: 'Departmental Academic Reviews · Faculty Workload Monitoring · Campus Operations Oversight',
        motd: 'Mid-term continuous evaluation reports submitted by 8 department HODs. Result moderation active.'
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        wish: 'Good evening',
        period: 'Evening',
        themeClass: 'dash-hero-evening',
        caption: 'Daily Administrative Clearance · Statutory Compliance · Campus Security & Hostel Night Briefing',
        motd: 'Campus evening transit completed safely. 48 lecture halls and 24 computing labs secured for the day.'
      };
    }
    return {
      wish: 'Good night',
      period: 'Night',
      themeClass: 'dash-hero-night',
      caption: '24/7 Security Dispatch · Infrastructure Health · Institutional Emergency Readiness',
      motd: 'Perimeter security active. Automated cloud database snapshot verified at 23:00 hrs.'
    };
  }, [currentTime]);

  const formattedLiveTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(currentTime);
  }, [currentTime]);

  // Calendar State matching Student Dashboard
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [holidayView, setHolidayView] = useState('all');

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(currentMonth);
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    return createCalendarDays(currentMonth, currentTime);
  }, [currentMonth, currentTime]);

  const holidayItems = useMemo(() => {
    const startOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
    return OFFICIAL_HOLIDAYS_2026.map(([raw, name]) => {
      const [d, m, y] = raw.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const daysLeft = Math.round((date - startOfToday) / 86400000);
      return { raw, name, date, daysLeft, key: `${y}-${m - 1}-${d}` };
    });
  }, [currentTime]);

  const displayedHolidays = useMemo(() => {
    if (holidayView === 'upcoming') {
      return holidayItems.filter((h) => h.daysLeft >= 0);
    }
    return holidayItems;
  }, [holidayView, holidayItems]);

  const holidayMap = useMemo(() => {
    return Object.fromEntries(holidayItems.map((h) => [h.key, h.name]));
  }, [holidayItems]);

  const nextHoliday = useMemo(() => {
    return holidayItems.find((h) => h.daysLeft >= 0);
  }, [holidayItems]);

  function updateMonth(direction) {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + direction, 1));
  }

  // Live Data States
  const [overviewData, setOverviewData] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [circulars, setCirculars] = useState([]);

  // Priority Actions & Approvals State
  const [actionFilter, setActionFilter] = useState('All'); // 'All' | 'Critical' | 'Pending' | 'Overdue'
  const [priorityActions, setPriorityActions] = useState([
    {
      id: 'ACT-LEAVE-01',
      type: 'Leave Approval',
      title: 'Dr. S. Mohanty (Faculty · CSE) — Duty Leave (4 Days)',
      description: 'Duty leave request for presenting keynote paper at IEEE International Conference on AI & IoT (Dubai). HOD recommended.',
      department: 'Computer Science',
      applicant: 'Dr. S. Mohanty',
      priority: 'High',
      submittedDate: 'Today, 09:30 AM',
      dueDate: '27 Oct 2026',
      status: 'Pending Final Stamp',
      category: 'leave',
      rawLeaveId: 'L-842',
    },
    {
      id: 'ACT-TIMETABLE-01',
      type: 'Timetable Sign-Off',
      title: 'Autumn 2026 Master Timetable (Odd Sem) Executive Ratification',
      description: 'Comprehensive institutional timetable verified clash-free across 48 lecture halls and 24 computing/core engineering laboratories.',
      department: 'Academic Council',
      applicant: 'Dean Academics',
      priority: 'Critical',
      submittedDate: 'Yesterday, 04:20 PM',
      dueDate: 'Today, 05:00 PM',
      status: 'Awaiting Sign-Off',
      category: 'timetable',
    },
    {
      id: 'ACT-CIRCULAR-01',
      type: 'Circular Clearance',
      title: 'Cisco Systems On-Campus Recruitment Drive 2026 Guidelines',
      description: 'Pre-placement talk, eligibility criteria (CGPA >= 7.50), and virtual coding assessment slots for final year B.Tech candidates.',
      department: 'Training & Placement (TPO)',
      applicant: 'Prof. S. S. Ray (TPO)',
      priority: 'High',
      submittedDate: 'Today, 10:15 AM',
      dueDate: '28 Oct 2026',
      status: 'Pending Clearance',
      category: 'circular',
      rawNoticeId: 'CIR-108',
    },
    {
      id: 'ACT-EXAM-01',
      type: 'Result Moderation',
      title: 'Autumn 2026 Semester 5 Continuous Evaluation Moderation Roster',
      description: 'Internal assessment and quiz marks moderated by departmental academic committees; awaiting gazette publication clearance.',
      department: 'Autonomous Exam Cell',
      applicant: 'Dr. K. C. Patra (CoE)',
      priority: 'Critical',
      submittedDate: 'Today, 08:45 AM',
      dueDate: 'Today, 06:00 PM',
      status: 'Pending Gazette Clearance',
      category: 'exam',
    },
    {
      id: 'ACT-LEAVE-02',
      type: 'Leave Approval',
      title: 'Mr. Biswajit Sahoo (Technical Staff · CCF) — Casual Leave (2 Days)',
      description: 'Casual leave application for family medical emergency. Lab handover arranged with Junior Superintendent.',
      department: 'Technical Operations',
      applicant: 'Mr. Biswajit Sahoo',
      priority: 'Medium',
      submittedDate: 'Today, 11:00 AM',
      dueDate: '28 Oct 2026',
      status: 'Pending Final Stamp',
      category: 'leave',
      rawLeaveId: 'L-843',
    },
    {
      id: 'ACT-FINANCE-01',
      type: 'Budget Requisition',
      title: 'Advanced AI & Machine Learning GPU Lab Cluster (10 Workstations)',
      description: 'Capital expenditure requisition for NVIDIA RTX workstations for AICTE-ATAL grant co-funded research facility.',
      department: 'AI & Machine Learning',
      applicant: 'Dr. S. K. Swain (HOD)',
      priority: 'High',
      submittedDate: '24 Oct 2026',
      dueDate: '30 Oct 2026',
      status: 'Under Scrutiny',
      category: 'finance',
    },
  ]);

  const [selectedActionModal, setSelectedActionModal] = useState(null);

  // Department Overview Search & Sort States
  const [deptSearch, setDeptSearch] = useState('');
  const [deptSort, setDeptSort] = useState('students'); // 'students' | 'faculty' | 'syllabus' | 'cgpa'

  // Leave Approvals Filter & Modal States
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('All');
  const [leaveRoleFilter, setLeaveRoleFilter] = useState('All');
  const [leaveDeptFilter, setLeaveDeptFilter] = useState('All');
  const [approvalModal, setApprovalModal] = useState({ open: false, leave: null });
  const [rejectionModal, setRejectionModal] = useState({ open: false, leave: null, reason: '' });

  // Circular Form & Clearance States
  const [newNotice, setNewNotice] = useState({
    title: '',
    scope: 'College-wide',
    category: 'Academic',
    priority: 'Normal',
    expiryDate: '',
    content: '',
  });
  const [circularSearch, setCircularSearch] = useState('');
  const [circularCategoryFilter, setCircularCategoryFilter] = useState('All');

  // Academic Analytics Filters
  const [academicDeptFilter, setAcademicDeptFilter] = useState('All');
  const [academicSemesterFilter, setAcademicSemesterFilter] = useState('All');

  // Department Inspect Modal
  const [inspectDeptModal, setInspectDeptModal] = useState({ open: false, dept: null });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleQuickApproveAction = (act) => {
    setPriorityActions((prev) =>
      prev.map((a) => (a.id === act.id ? { ...a, status: 'Approved & Recorded' } : a))
    );
    triggerToast(`Action "${act.title.slice(0, 36)}..." officially approved!`);
  };

  const handleQuickRejectAction = (act) => {
    const reason = window.prompt(`Provide institutional reason for rejecting: ${act.title}`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Rejection requires a documented administrative reason.');
      return;
    }
    setPriorityActions((prev) =>
      prev.map((a) => (a.id === act.id ? { ...a, status: 'Rejected' } : a))
    );
    triggerToast(`Action "${act.title.slice(0, 30)}..." rejected with note.`);
  };

  // Initial Data Fetching from Backend APIs
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, academicRes, leavesRes, circularsRes] = await Promise.allSettled([
        api.getPrincipalOverview(),
        api.getPrincipalAcademicAnalytics({ department: academicDeptFilter, semester: academicSemesterFilter }),
        api.getPrincipalLeaves(),
        api.getPrincipalCirculars(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setOverviewData(overviewRes.value.data);
      }
      if (academicRes.status === 'fulfilled' && academicRes.value?.data) {
        setAcademicData(academicRes.value.data);
      }
      if (leavesRes.status === 'fulfilled' && Array.isArray(leavesRes.value)) {
        setLeaveRequests(leavesRes.value);
      } else if (leavesRes.status === 'fulfilled' && leavesRes.value?.data) {
        setLeaveRequests(leavesRes.value.data);
      }
      if (circularsRes.status === 'fulfilled' && Array.isArray(circularsRes.value)) {
        setCirculars(circularsRes.value);
      } else if (circularsRes.status === 'fulfilled' && circularsRes.value?.data) {
        setCirculars(circularsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load Principal portal data:', err);
      setError('Some live metrics could not be loaded. Displaying cached dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Refresh Academic Data when department/semester filter changes
  useEffect(() => {
    const fetchFilteredAcademic = async () => {
      try {
        const res = await api.getPrincipalAcademicAnalytics({
          department: academicDeptFilter,
          semester: academicSemesterFilter,
        });
        if (res?.data) {
          setAcademicData(res.data);
        }
      } catch (err) {
        console.error('Failed to refresh academic analytics:', err);
      }
    };
    fetchFilteredAcademic();
  }, [academicDeptFilter, academicSemesterFilter]);

  // Leave Action Handlers with Confirmation & Rejection Reason
  const confirmApproveLeave = async () => {
    if (!approvalModal.leave) return;
    const leaveId = approvalModal.leave.id;
    try {
      await api.decidePrincipalLeave(leaveId, 'APPROVE', 'Officially approved by Principal / Director');
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, principalStatus: 'Approved' } : l))
      );
      triggerToast(`Leave request #${leaveId} officially approved!`);
    } catch (err) {
      console.error('Error approving leave:', err);
      triggerToast('Leave approved (local state updated).');
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, principalStatus: 'Approved' } : l))
      );
    } finally {
      setApprovalModal({ open: false, leave: null });
    }
  };

  const confirmRejectLeave = async () => {
    if (!rejectionModal.leave) return;
    if (!rejectionModal.reason.trim()) {
      alert('Please provide a specific rejection reason for administrative compliance.');
      return;
    }
    const leaveId = rejectionModal.leave.id;
    try {
      await api.decidePrincipalLeave(leaveId, 'REJECT', rejectionModal.reason);
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, principalStatus: 'Rejected' } : l))
      );
      triggerToast(`Leave request #${leaveId} rejected.`);
    } catch (err) {
      console.error('Error rejecting leave:', err);
      triggerToast('Leave rejected (local state updated).');
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, principalStatus: 'Rejected' } : l))
      );
    } finally {
      setRejectionModal({ open: false, leave: null, reason: '' });
    }
  };

  // Circular Management Handlers
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title) return;
    try {
      const payload = {
        title: newNotice.title,
        content: newNotice.content || newNotice.title,
        scope: newNotice.scope,
        category: newNotice.category,
        priority: newNotice.priority,
        expiryDate: newNotice.expiryDate,
      };
      const res = await api.createPrincipalCircular(payload);
      if (res?.data) {
        setCirculars([res.data, ...circulars]);
      } else {
        const fallbackItem = {
          id: `NOTIF-${Math.floor(200 + Math.random() * 800)}`,
          title: newNotice.title,
          scope: newNotice.scope,
          category: newNotice.category,
          priority: newNotice.priority,
          status: 'Published & Broadcasted',
          author: 'Office of the Principal / Director',
          date: new Date().toLocaleDateString('en-GB'),
        };
        setCirculars([fallbackItem, ...circulars]);
      }
      setNewNotice({
        title: '',
        scope: 'College-wide',
        category: 'Academic',
        priority: 'Normal',
        expiryDate: '',
        content: '',
      });
      triggerToast('Official circular broadcasted across Apna Campus!');
    } catch (err) {
      console.error('Error issuing circular:', err);
      triggerToast('Circular published locally.');
    }
  };

  const handleApproveNotice = async (id) => {
    try {
      await api.decidePrincipalCircular(id, 'APPROVE', 'Cleared by Principal Secretariat');
      setCirculars((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'Approved & Broadcasted' } : n))
      );
      triggerToast(`Notice #${id} approved and published to all students & faculty!`);
    } catch (err) {
      console.error('Error approving circular:', err);
      setCirculars((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'Approved & Broadcasted' } : n))
      );
      triggerToast(`Notice #${id} cleared and broadcasted!`);
    }
  };

  // Filtered Leave List
  const filteredLeaves = leaveRequests.filter((leave) => {
    const matchesSearch =
      !leaveSearch ||
      leave.applicantName?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      leave.applicantId?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      leave.department?.toLowerCase().includes(leaveSearch.toLowerCase());

    const matchesStatus =
      leaveStatusFilter === 'All' ||
      (leaveStatusFilter === 'Pending' && leave.principalStatus?.includes('Pending')) ||
      leave.principalStatus === leaveStatusFilter;

    const matchesRole =
      leaveRoleFilter === 'All' ||
      leave.applicantRole?.toLowerCase().includes(leaveRoleFilter.toLowerCase());

    const matchesDept =
      leaveDeptFilter === 'All' ||
      leave.department?.toLowerCase().includes(leaveDeptFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesRole && matchesDept;
  });

  // Filtered Circulars List
  const filteredCirculars = circulars.filter((c) => {
    const matchesSearch =
      !circularSearch ||
      c.title?.toLowerCase().includes(circularSearch.toLowerCase()) ||
      c.author?.toLowerCase().includes(circularSearch.toLowerCase());
    const matchesCategory =
      circularCategoryFilter === 'All' || c.category === circularCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate unread / pending badge counts
  const pendingLeavesCount = leaveRequests.filter((l) =>
    l.principalStatus?.includes('Pending')
  ).length;
  const pendingNoticesCount = circulars.filter((c) =>
    c.status?.includes('Pending')
  ).length;

  // Export Academic Analytics summary as CSV
  const handleExportAcademicCsv = () => {
    if (!academicData?.departmentResults) return;
    const headers = ['Department Code', 'Department Name', 'Appeared', 'Passed', 'Pass %', 'Average CGPA', 'Backlogs', 'Distinction %'];
    const rows = academicData.departmentResults.map((d) => [
      d.code,
      `"${d.name}"`,
      d.appeared,
      d.passed,
      `${d.passPct}%`,
      d.avgCgpa,
      d.backlogs,
      `${d.distinctionPct}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Academic_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Academic Performance CSV exported successfully!');
  };


  const principalNavSections = [
    {
      title: 'EXECUTIVE GOVERNANCE',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: Layers },
        { id: 'academic_health', label: 'Academic Performance', icon: Award },
        { id: 'timetable', label: 'Timetables & Approval', icon: CalendarDays },
      ]
    },
    {
      title: 'ACADEMIC & DEPARTMENT MANAGEMENT',
      items: [
        { id: 'departments', label: 'Department & HOD Management', icon: GraduationCap },
        { id: 'examinations', label: 'Examination & Results Oversight', icon: FileText },
      ]
    },
    {
      title: 'FINANCE & INSTITUTIONAL RESOURCES',
      items: [
        { id: 'finance', label: 'Finance & Budget Oversight', icon: TrendingUp },
        { id: 'faculty_staff', label: 'Faculty & Staff Overview', icon: Users },
        { id: 'infrastructure', label: 'Infrastructure & Facilities', icon: Wrench },
      ]
    },
    {
      title: 'APPROVALS & COMMUNICATION',
      items: [
        { id: 'leaves', label: 'Leave Approvals', icon: CalendarCheck, badge: pendingLeavesCount || undefined },
        { id: 'notices', label: 'Official Circulars', icon: Megaphone, badge: pendingNoticesCount || undefined },
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
        { id: 'campus-connect', label: 'Campus Connect Broadcast', icon: MessageSquare },
      ]
    },
    {
      title: 'COMPLIANCE & ADMINISTRATION',
      items: [
        { id: 'accreditation', label: 'Accreditation & Compliance', icon: ShieldCheck },
        { id: 'grievances', label: 'Grievance & Disciplinary Oversight', icon: AlertTriangle },
        { id: 'calendar_events', label: 'Institutional Calendar & Events', icon: CalendarDays },
        { id: 'audit_trail', label: 'Audit Trail & Activity Logs', icon: History },
      ]
    }
  ];

  const getPrincipalHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Principal Institutional Command Center',
          subtitle: 'Autonomous Academic Governance, Executive Oversight, and College Operations.'
        };
      case 'governance':
        return {
          title: 'Executive Command · Office of the Principal',
          subtitle: 'Academic Governance, Operational Health, and Autonomous Administration.'
        };
      case 'leaves':
        return {
          title: 'Institutional Leave Application Approvals',
          subtitle: `${pendingLeavesCount} Pending Leave Requests across Faculty and Staff.`
        };
      case 'notices':
        return {
          title: 'Official Executive Circulars & Gazettes',
          subtitle: 'Draft, approve, and sign institution-wide announcements and mandates.'
        };
      case 'academic_health':
        return {
          title: 'Autonomous Academic Performance & Health',
          subtitle: 'Departmental syllabus progress, faculty attendance, and student performance indices.'
        };
      case 'timetable':
        return {
          title: 'Institutional Master Timetables',
          subtitle: 'Review, validate, and give executive sign-off on department timetables.'
        };
      case 'report-generation':
        return {
          title: 'Master ERP Compliance & Accreditations',
          subtitle: 'Generate accredited summaries for Senate, AICTE, and NAAC.'
        };
      case 'campus-connect':
        return {
          title: 'Campus Connect Broadcast',
          subtitle: 'Institutional announcements, department channels, and faculty messaging.'
        };
      case 'departments':
        return {
          title: 'Department & HOD Management',
          subtitle: 'Academic units, HOD leadership roster, syllabus pace, and departmental reports.'
        };
      case 'examinations':
        return {
          title: 'Examination & Results Oversight',
          subtitle: 'Autonomous exam schedules, moderation status, and official gazette clearance.'
        };
      case 'finance':
        return {
          title: 'Finance & Budget Oversight',
          subtitle: 'Simulated budget allocation, fee realization, and capital expenditure queues.'
        };
      case 'faculty_staff':
        return {
          title: 'Faculty & Staff Overview',
          subtitle: 'Cadre distribution, AICTE cadre ratios, attendance, and administrative grant approvals.'
        };
      case 'infrastructure':
        return {
          title: 'Infrastructure & Facilities Oversight',
          subtitle: 'Smart lecture halls, research laboratories, campus energy, and maintenance tickets.'
        };
      case 'accreditation':
        return {
          title: 'Accreditation & Compliance Monitoring',
          subtitle: 'NAAC A++, NBA Tier-1 accreditation, SSR criteria metrics, and evidence dossiers.'
        };
      case 'grievances':
        return {
          title: 'Grievance & Disciplinary Oversight',
          subtitle: 'Confidential executive grievance redressal chamber and remedial directives.'
        };
      case 'calendar_events':
        return {
          title: 'Institutional Academic Calendar & Events',
          subtitle: 'Autonomous milestones, exam dates, Senate sessions, symposiums, and holidays.'
        };
      case 'audit_trail':
        return {
          title: 'Administrative Audit Trail & Activity Logs',
          subtitle: 'Tamper-evident simulated audit records of executive clearances and transactions.'
        };
      default:
        return {
          title: (activeTab || 'Principal Portal').replace(/_/g, ' ').toUpperCase(),
          subtitle: 'Institutional Executive Office'
        };
    }
  };

  const principalHeading = getPrincipalHeading();
  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Standard Universal AppLayout */}
      <AppLayout
        account={account}
        portalName="Principal Portal"
        portalSubtitle="Office of Principal & Director"
        portalHomeTab="dashboard"
        navSections={principalNavSections}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        pageTitle={principalHeading.title}
        pageSubtitle={principalHeading.subtitle}
      >
        <div className="principal-portal-content-wrap">
          <div className="erp-content-body">

  {/* ======================================================== */ }
  {/* TAB 0: EXECUTIVE PRINCIPAL DASHBOARD (STUDENT & ADMIN ALIGNED) */ }
  {/* ======================================================== */ }
  {
    activeTab === 'dashboard' && (
      <RoleDashboardLanding
        account={account}
        roleKey="principal"
        onLogout={onLogout}
        onSwitchRole={onSwitchRole}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigateTab={(tabId) => {
          if (tabId === 'academic' || tabId === 'departments') setActiveTab('departments');
          else if (tabId === 'approvals' || tabId === 'leaves') setActiveTab('leaves');
          else if (tabId === 'reports') setActiveTab('report-generation');
          else if (tabId === 'timetable') setActiveTab('timetable');
          else if (tabId === 'notices') setActiveTab('notices');
          else if (tabId === 'accreditation') setActiveTab('accreditation');
          else if (tabId === 'finance') setActiveTab('finance');
          else if (tabId === 'examinations') setActiveTab('examinations');
          else if (tabId === 'governance') setActiveTab('dashboard');
          else setActiveTab(tabId);
        }}
      />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 1: EXECUTIVE CAMPUS GOVERNANCE (DETAILED DRILLDOWNS) */ }
  {/* ======================================================== */ }
  {
    activeTab === 'bonafide_approvals' && (
      <div style={{ marginTop: '16px' }}>
        <BonafideReviewQueue role="principal" account={account} />
      </div>
    )
  }

  {
    activeTab === 'governance' && (
      <div className="dash">
        {/* ====================================================== */}
        {/* SECTION 1: PRINCIPAL WELCOME BANNER                    */}
        {/* ====================================================== */}
        <section className={`dash-hero ${timeGreeting.themeClass}`} aria-label="Welcome">
          <div className="dash-hero-glow" aria-hidden="true" />
          <div className="dash-hero-main">
            <p className="dash-hero-kicker">
              <Sparkles size={13} /> Academic Leadership · Office of the Principal &amp; Director
            </p>
            <h2 className="dash-hero-title">
              {timeGreeting.wish}, Principal {getGreetingDisplayName(account?.name || 'Dr. B. K. Sarap')}
            </h2>
            <p className="dash-hero-caption">{timeGreeting.caption}</p>
            <div className="dash-motd" role="note" aria-label="Message of the day">
              <span className="dash-motd-icon">
                <Megaphone size={14} />
              </span>
              <strong>Message of the day</strong>
              <span>{timeGreeting.motd}</span>
            </div>
          </div>

          <div className="dash-hero-meta">
            <span className="dash-chip">
              Academic year <strong>2026–27</strong>
            </span>
            <time className="dash-date">
              <CalendarDays size={14} /> {todayLabel}
            </time>
            <span className="dash-chip" style={{ background: 'rgba(0,0,0,0.22)' }}>
              <Clock size={12} /> {formattedLiveTime}
            </span>
          </div>
        </section>

        {/* Quick Action Navigation Bar */}
        <div className="principal-quick-actions" role="toolbar" aria-label="Executive Quick Links">
          <button
            type="button"
            className="principal-quick-btn active"
            onClick={() => {
              const el = document.getElementById('action-center');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <CalendarCheck size={16} color="#ffffff" />
            <span>Priority Actions ({priorityActions.filter(a => a.status.includes('Pending') || a.status.includes('Awaiting') || a.status.includes('Scrutiny')).length})</span>
          </button>
          <button
            type="button"
            className="principal-quick-btn"
            onClick={() => setActiveTab('leaves')}
          >
            <Users size={16} color="#0284c7" />
            <span>Review Leaves ({pendingLeavesCount})</span>
          </button>
          <button
            type="button"
            className="principal-quick-btn"
            onClick={() => setActiveTab('timetable')}
          >
            <CalendarDays size={16} color="#2563eb" />
            <span>Timetable Sign-Off</span>
          </button>
          <button
            type="button"
            className="principal-quick-btn"
            onClick={() => setActiveTab('departments')}
          >
            <GraduationCap size={16} color="#16a34a" />
            <span>Department Matrix</span>
          </button>
          <button
            type="button"
            className="principal-quick-btn"
            onClick={() => setActiveTab('notices')}
          >
            <Megaphone size={16} color="#d97706" />
            <span>Official Circulars</span>
          </button>
          <button
            type="button"
            className="principal-quick-btn"
            onClick={() => setActiveTab('accreditation')}
          >
            <ShieldCheck size={16} color="#7c3aed" />
            <span>NAAC A++ Standing</span>
          </button>
          <button
            type="button"
            className="principal-quick-btn"
            onClick={() => setActiveTab('finance')}
          >
            <TrendingUp size={16} color="#059669" />
            <span>Institutional Finance</span>
          </button>
        </div>

        {/* ====================================================== */}
        {/* SECTION 2: INSTITUTIONAL OVERVIEW KPI CARDS (8 CARDS)   */}
        {/* ====================================================== */}
        <div className="principal-kpi-grid-8" aria-label="Institutional Overview KPIs">
          {/* 1. Total Enrolled Students */}
          <article
            className="dash-stat tone-blue"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('departments')}
            title="Click to view Department & Student Distribution"
          >
            <div className="dash-stat-head">
              <div className="dash-stat-head-left">
                <span className="dash-stat-icon"><Users size={18} /></span>
                <span className="dash-stat-label">Enrolled Students</span>
              </div>
              <span className="dash-stat-badge tone-blue-badge">Autonomous</span>
            </div>
            <div className="dash-stat-body">
              <strong className="dash-stat-value">
                {overviewData?.kpis?.totalStudents?.toLocaleString() || '2,490'}
              </strong>
              <p className="dash-stat-desc">
                {overviewData?.kpis?.activeDepartments || 8} Academic Departments · {overviewData?.kpis?.academicPrograms || 18} Programs
              </p>
            </div>
            <div className="dash-stat-foot">
              <span className="dash-stat-pill">2,130 B.Tech</span>
              <span className="dash-stat-pill">360 PG (MBA/MCA)</span>
              <span className="dash-stat-pill tone-green-pill">Registered</span>
            </div>
          </article>

          {/* 2. Faculty & Staff Strength */}
          <article
            className="dash-stat tone-green"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('faculty_staff')}
            title="Click to inspect Faculty & Staff Overview"
          >
            <div className="dash-stat-head">
              <div className="dash-stat-head-left">
                <span className="dash-stat-icon"><GraduationCap size={18} /></span>
                <span className="dash-stat-label">Faculty &amp; Staff</span>
              </div>
              <span className="dash-stat-badge tone-green-badge">1:17 Ratio</span>
            </div>
            <div className="dash-stat-body">
              <strong className="dash-stat-value">
                {(overviewData?.kpis?.teachingFaculty || 148) + (overviewData?.kpis?.nonTeachingStaff || 74)}
              </strong>
              <p className="dash-stat-desc">
                {overviewData?.kpis?.teachingFaculty || 148} Teaching Faculty · {overviewData?.kpis?.nonTeachingStaff || 74} Staff
              </p>
            </div>
            <div className="dash-stat-foot">
              <span className="dash-stat-pill">142 On Duty Today</span>
              <span className="dash-stat-pill tone-green-pill">96.8% Present</span>
            </div>
          </article>

          {/* 3. Total Departments & Programs */}
          <article
            className="dash-stat tone-indigo"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('departments')}
            title="Click to open Academic Department Management"
          >
            <div className="dash-stat-head">
              <div className="dash-stat-head-left">
                <span className="dash-stat-icon"><Building2 size={18} /></span>
                <span className="dash-stat-label">Departments</span>
              </div>
              <span className="dash-stat-badge tone-indigo-badge">8 Depts</span>
            </div>
            <div className="dash-stat-body">
              <strong className="dash-stat-value">18 Programs</strong>
              <p className="dash-stat-desc">CSE, AIML, ECE, EEE, MECH, CIVIL, MBA, MCA</p>
            </div>
            <div className="dash-stat-foot">
              <span className="dash-stat-pill">6 Engineering</span>
              <span className="dash-stat-pill">2 Postgrad</span>
              <span className="dash-stat-pill tone-green-pill">Autonomous</span>
            </div>
          </article>

          {/* 4. Overall Attendance Rate */}
          <article
            className="dash-stat tone-teal"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('academic_health')}
            title="Click to view Academic Health & Attendance"
          >
            <div className="dash-stat-head">
              <div className="dash-stat-head-left">
                <span className="dash-stat-icon"><CheckCircle2 size={18} /></span>
                <span className="dash-stat-label">Attendance Rate</span>
              </div>
              <span className="dash-stat-badge tone-teal-badge">Eligible</span>
            </div>
            <div className="dash-stat-body">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong className="dash-stat-value">
                  {overviewData?.kpis?.studentAttendanceRate || 88.7}%
                </strong>
                <span className="dash-stat-ratio">Faculty: {overviewData?.kpis?.facultyAttendanceRate || 96.8}%</span>
              </div>
              <div className="dash-progress" aria-hidden="true">
                <i style={{ width: `${overviewData?.kpis?.studentAttendanceRate || 88.7}%` }} />
              </div>
            </div>
            <div className="dash-stat-foot">
              <small className="dash-stat-sub text-green">
                <Check size={13} /> 13.7% above mandatory 75% UGC exam cutoff
              </small>
            </div>
          </article>

          {/* 5. Academic Performance / Pass % */}
          <article
            className="dash-stat tone-violet"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('academic_health')}
            title="Click to view Examination Results & Analytics"
          >
            <div className="dash-stat-head">
              <div className="dash-stat-head-left">
                <span className="dash-stat-icon"><Award size={18} /></span>
                <span className="dash-stat-label">Pass Percentage</span>
              </div>
              <span className="dash-stat-badge tone-violet-badge">Autumn 2026</span>
            </div>
            <div className="dash-stat-body">
              <strong className="dash-stat-value">
                {overviewData?.kpis?.overallPassRate || 94.2}%
              </strong>
              <p className="dash-stat-desc">Campus Avg CGPA: 8.04 · 78.6% Distinction</p>
            </div>
            <div className="dash-stat-foot">
              <span className="dash-stat-sub" style={{ color: '#7c3aed', fontWeight: 600 }}>
                <TrendingUp size={13} /> +1.4% YoY performance gain across exams
              </span>
            </div>
          </article>

          {/* 6. Pending Principal Approvals */}
          <article
            className="dash-stat tone-amber"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const el = document.getElementById('action-center');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Click to review Pending Actions in Action Center"
          >
            <div className="dash-stat-head">
              <div className="dash-stat-head-left">
                <span className="dash-stat-icon"><CalendarCheck size={18} /></span>
                <span className="dash-stat-label">Pending Approvals</span>
              </div>
              <span className="dash-stat-badge tone-amber-badge">Action Required</span>
            </div>
            <div className="dash-stat-body">
              <strong className="dash-stat-value">
                {String(priorityActions.filter(a => !a.status.includes('Approved') && !a.status.includes('Rejected')).length).padStart(2, '0')} Tasks
              </strong>
              <p className="dash-stat-desc">
                {pendingLeavesCount} Faculty Leaves · {pendingNoticesCount} Circulars · 1 Timetable Sign-Off
              </p>
            </div>
            <div className="dash-stat-foot">
              <span className="dash-stat-sub text-amber" style={{ color: '#b45309', fontWeight: 600 }}>
                <Clock size={13} /> Oldest pending docket logged 4 hours ago
              </span>
            </div>
          </article>

          {/* 7. Active Institutional Grievances */}
          <article
            className="dash-stat tone-rose"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('grievances')}
            title="Click to view Grievance & Disciplinary Oversight"
          >
            <div className="dash-stat-head">
              <div className="dash-stat-head-left">
                <span className="dash-stat-icon"><AlertTriangle size={18} /></span>
                <span className="dash-stat-label">Grievance Oversight</span>
              </div>
              <span className="dash-stat-badge tone-rose-badge">0 Critical</span>
            </div>
            <div className="dash-stat-body">
              <strong className="dash-stat-value">04 Logged</strong>
              <p className="dash-stat-desc">2 Infrastructure · 1 Hostel · 1 General Admin</p>
            </div>
            <div className="dash-stat-foot">
              <span className="dash-stat-sub" style={{ color: '#9f1239' }}>
                <CheckCircle2 size={13} /> 19 Grievances resolved &amp; closed this month
              </span>
            </div>
          </article>

          {/* 8. Accreditation & Compliance Status */}
          <article
            className="dash-stat tone-cyan"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('accreditation')}
            title="Click to view Accreditation & Compliance Details"
          >
            <div className="dash-stat-head">
              <div className="dash-stat-head-left">
                <span className="dash-stat-icon"><ShieldCheck size={18} /></span>
                <span className="dash-stat-label">Accreditation</span>
              </div>
              <span className="dash-stat-badge tone-cyan-badge">NAAC A++</span>
            </div>
            <div className="dash-stat-body">
              <strong className="dash-stat-value">CGPA 3.62</strong>
              <p className="dash-stat-desc">NBA Tier-1 Accredited (CSE, ECE, MECH)</p>
            </div>
            <div className="dash-stat-foot">
              <span className="dash-stat-sub" style={{ color: '#0e7490', fontWeight: 600 }}>
                <Check size={13} /> SSR compilation verified · Cycle IV in 45 days
              </span>
            </div>
          </article>
        </div>

        {/* ====================================================== */}
        {/* SECTION 3: PRINCIPAL'S ACTION CENTER                   */}
        {/* ====================================================== */}
        <section className="principal-action-center" id="action-center" aria-label="Priority Actions & Approvals">
          <div className="principal-action-center-header">
            <div className="principal-action-title-group">
              <h3>
                <CalendarCheck size={20} color="#2563eb" />
                Priority Actions &amp; Executive Approvals Center
              </h3>
              <p>Immediate administrative sign-offs, faculty leave endorsements, circular clearances, and academic ratifications</p>
            </div>

            <div className="principal-action-filter-pills" role="tablist" aria-label="Action Priority Filters">
              {['All', 'Critical', 'Pending', 'Overdue'].map((tab) => {
                const count = tab === 'All'
                  ? priorityActions.length
                  : tab === 'Critical'
                    ? priorityActions.filter(a => a.priority === 'Critical').length
                    : tab === 'Pending'
                      ? priorityActions.filter(a => a.status.includes('Pending') || a.status.includes('Awaiting') || a.status.includes('Scrutiny')).length
                      : 0;
                return (
                  <button
                    key={tab}
                    type="button"
                    className={`principal-action-filter-pill ${actionFilter === tab ? 'active' : ''}`}
                    onClick={() => setActionFilter(tab)}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="principal-action-grid">
            {priorityActions
              .filter((act) => {
                if (actionFilter === 'All') return true;
                if (actionFilter === 'Critical') return act.priority === 'Critical';
                if (actionFilter === 'Pending') return act.status.includes('Pending') || act.status.includes('Awaiting') || act.status.includes('Scrutiny');
                if (actionFilter === 'Overdue') return false;
                return true;
              })
              .map((act) => (
                <article
                  key={act.id}
                  className={`principal-action-card priority-${act.priority.toLowerCase()}`}
                >
                  <div className="principal-action-card-top">
                    <span className="principal-action-meta-badge">
                      <Building2 size={12} /> {act.department}
                    </span>
                    <span className={`principal-action-priority-tag priority-tag-${act.priority.toLowerCase()}`}>
                      {act.priority}
                    </span>
                  </div>

                  <div className="principal-action-card-body">
                    <h4>{act.title}</h4>
                    <p>{act.description}</p>
                  </div>

                  <div className="principal-action-details-bar">
                    <span><strong>Submitted:</strong> {act.submittedDate}</span>
                    <span>•</span>
                    <span><strong>Due:</strong> {act.dueDate}</span>
                  </div>

                  <div className="principal-action-card-footer">
                    <span className="principal-action-status-pill">
                      <Clock size={13} /> {act.status}
                    </span>

                    <div className="principal-action-btn-group">
                      <button
                        type="button"
                        className="action-btn-xs action-btn-secondary"
                        onClick={() => setSelectedActionModal(act)}
                      >
                        <Eye size={12} /> Details
                      </button>
                      {!act.status.includes('Approved') && !act.status.includes('Rejected') && (
                        <>
                          <button
                            type="button"
                            className="action-btn-xs action-btn-primary"
                            onClick={() => handleQuickApproveAction(act)}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            type="button"
                            className="action-btn-xs action-btn-danger"
                            onClick={() => handleQuickRejectAction(act)}
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>

        {/* ====================================================== */}
        {/* SECTION 4: ACADEMIC PERFORMANCE OVERVIEW               */}
        {/* ====================================================== */}
        <section className="erp-panel" style={{ marginBottom: '22px' }} aria-label="Academic Performance Overview">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#7c3aed" />
                Academic Performance &amp; Continuous Examination Analytics
              </h3>
              <p>Autonomous pass percentages, CGPA distribution, distinction rates, and remedial action tracking</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="principal-select"
                value={academicDeptFilter}
                onChange={(e) => setAcademicDeptFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="MBA">MBA</option>
                <option value="MCA">MCA</option>
              </select>

              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={handleExportAcademicCsv}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Download size={13} /> Export CSV
              </button>

              <button
                type="button"
                className="erp-btn erp-btn-primary"
                onClick={() => setActiveTab('academic_health')}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                Full Analytics <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Semester 1-8 Pass Rate Trend Visualizer */}
          <div className="semester-trend-grid">
            {(academicData?.semesterWiseResults || [
              { semester: 'Sem 1', passPct: 91.5, avgSgpa: 7.82 },
              { semester: 'Sem 2', passPct: 93.2, avgSgpa: 7.95 },
              { semester: 'Sem 3', passPct: 89.8, avgSgpa: 7.68 },
              { semester: 'Sem 4', passPct: 92.4, avgSgpa: 7.88 },
              { semester: 'Sem 5', passPct: 94.6, avgSgpa: 8.12 },
              { semester: 'Sem 6', passPct: 95.8, avgSgpa: 8.24 },
              { semester: 'Sem 7', passPct: 96.5, avgSgpa: 8.35 },
              { semester: 'Sem 8', passPct: 98.2, avgSgpa: 8.52 },
            ]).map((sem, idx) => (
              <div className="semester-bar-card" key={idx}>
                <div className="semester-bar-wrapper">
                  <div
                    className="semester-bar-fill"
                    style={{
                      height: `${sem.passPct}%`,
                      background: sem.passPct >= 95 ? '#16a34a' : sem.passPct >= 90 ? '#0284c7' : '#d97706',
                    }}
                    title={`${sem.semester}: ${sem.passPct}% Pass Rate, Avg SGPA: ${sem.avgSgpa}`}
                  />
                </div>
                <strong>{sem.semester}</strong>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  {sem.passPct}%
                </span>
                <small>SGPA {sem.avgSgpa}</small>
              </div>
            ))}
          </div>

          {/* Dean's Honor Roll and At-Risk Courses Dual Section */}
          <div className="academic-dual-panels">
            {/* Dean's Honor Roll Highlights */}
            <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} /> Dean's Academic Honor Roll (Autumn 2026)
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#a855f7', fontWeight: 700 }}>Top 5 Scholars</span>
              </div>
              {[
                { rank: 1, name: 'Ananya Sharma', roll: '2305201001', dept: 'CSE (Sem 5)', cgpa: 9.85 },
                { rank: 2, name: 'Rohan Senapati', roll: '2305201004', dept: 'AIML (Sem 5)', cgpa: 9.72 },
                { rank: 3, name: 'Priyanka Mohapatra', roll: '2305201012', dept: 'ECE (Sem 5)', cgpa: 9.64 },
              ].map((s) => (
                <div key={s.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed #f0abfc', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#a855f7', color: '#fff', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.rank}
                    </span>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{s.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.dept} · Roll: {s.roll}</div>
                    </div>
                  </div>
                  <strong style={{ color: '#7c3aed', fontSize: '0.92rem' }}>{s.cgpa} CGPA</strong>
                </div>
              ))}
            </div>

            {/* Remedial & Academic Support Interventions */}
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#e11d48', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> Targeted Remedial Interventions
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#b91c1c', fontWeight: 700 }}>Immediate Coaching</span>
              </div>
              {[
                { code: 'CS502', name: 'Design and Analysis of Algorithms', dept: 'CSE', failureCount: 22, action: 'Tutorials Assigned' },
                { code: 'EC401', name: 'Signals, Systems & DSP', dept: 'ECE', failureCount: 28, action: 'Peer Mentoring Active' },
                { code: 'ME303', name: 'Applied Thermodynamics', dept: 'MECH', failureCount: 31, action: 'Lab Practical Review' },
              ].map((item) => (
                <div key={item.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed #fda4af', fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{item.code}: {item.name}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.dept} · {item.failureCount} remedial candidates</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b91c1c', background: '#ffe4e6', padding: '2px 6px', borderRadius: 4 }}>
                    {item.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* SECTION 5: DEPARTMENT & FACULTY OVERVIEW               */}
        {/* ====================================================== */}
        <section className="erp-panel" style={{ marginBottom: '22px' }} aria-label="Department Governance Matrix">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} color="#0284c7" />
                Academic Department Governance &amp; Faculty Overview
              </h3>
              <p>Live student strength, faculty availability, syllabus completion pace, and departmental health across all 8 branches</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="principal-search-input" style={{ width: '240px' }}>
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search department or HOD..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                />
              </div>

              <select
                className="principal-select"
                value={deptSort}
                onChange={(e) => setDeptSort(e.target.value)}
              >
                <option value="students">Sort by Students</option>
                <option value="faculty">Sort by Faculty</option>
                <option value="syllabus">Sort by Syllabus Pace</option>
                <option value="cgpa">Sort by CGPA</option>
              </select>

              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={() => setActiveTab('departments')}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                View All Departments <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>HOD In-Charge</th>
                  <th>Enrolled Students</th>
                  <th>Faculty Strength</th>
                  <th>Syllabus Completion</th>
                  <th>Avg CGPA</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(overviewData?.departments || INITIAL_DEPARTMENTS)
                  .filter((dept) => {
                    if (!deptSearch.trim()) return true;
                    const q = deptSearch.toLowerCase();
                    return (
                      dept.name?.toLowerCase().includes(q) ||
                      dept.code?.toLowerCase().includes(q) ||
                      dept.hod?.toLowerCase().includes(q)
                    );
                  })
                  .sort((a, b) => {
                    if (deptSort === 'students') return (b.students || b.studentCount || 0) - (a.students || a.studentCount || 0);
                    if (deptSort === 'faculty') return (b.faculty || b.facultyCount || 0) - (a.faculty || a.facultyCount || 0);
                    if (deptSort === 'syllabus') return (b.syllabusPace || b.syllabusProgress || 0) - (a.syllabusPace || a.syllabusProgress || 0);
                    if (deptSort === 'cgpa') return (b.avgCgpa || 0) - (a.avgCgpa || 0);
                    return 0;
                  })
                  .map((dept) => {
                    const studentCount = dept.students || dept.studentCount || 0;
                    const facultyTotal = dept.faculty || dept.facultyCount || 0;
                    const facultyDuty = dept.facultyOnDuty || facultyTotal;
                    const pace = dept.syllabusPace || dept.syllabusProgress || 70;
                    const cgpa = dept.avgCgpa || 8.0;
                    const status = dept.status || (pace >= 70 ? 'On Schedule' : 'Review Needed');

                    return (
                      <tr key={dept.code}>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{dept.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Code: {dept.code} {dept.accreditation ? `· ${dept.accreditation}` : ''}
                          </div>
                        </td>
                        <td style={{ color: '#1e293b', fontWeight: 600 }}>{dept.hod}</td>
                        <td style={{ color: '#1e293b', fontWeight: 700 }}>{studentCount}</td>
                        <td style={{ color: '#1e293b' }}>
                          <strong>{facultyDuty}</strong> / {facultyTotal} On Duty
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${pace}%`,
                                  background: pace >= 70 ? '#16a34a' : '#d97706',
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: pace >= 70 ? '#15803d' : '#b45309' }}>
                              {pace}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#0284c7' }}>{cgpa}</span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: status === 'On Schedule' || status === 'Active' ? '#dcfce7' : '#fef3c7',
                              color: status === 'On Schedule' || status === 'Active' ? '#15803d' : '#b45309',
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="erp-btn erp-btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            onClick={() => setInspectDeptModal({ open: true, dept })}
                          >
                            <Eye size={13} /> Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ====================================================== */}
        {/* SECTION 6: INSTITUTIONAL OPERATIONS & FINANCE          */}
        {/* ====================================================== */}
        <div className="principal-ops-grid" aria-label="Institutional Operations & Finance">
          {/* 1. Finance & Budget Allocation */}
          <div className="principal-ops-card">
            <div>
              <div className="principal-ops-card-head">
                <div>
                  <h4>Fiscal Realization &amp; Budget</h4>
                  <span>Treasury &amp; Capex Utilization</span>
                </div>
                <div className="principal-ops-icon-frame" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <CreditCard size={20} />
                </div>
              </div>

              <div style={{ margin: '14px 0 10px' }}>
                <div className="principal-ops-stat-large" style={{ color: '#059669' }}>₹24.60 Cr</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                  92.5% of ₹26.58 Cr Target · ₹1.98 Cr Remaining
                </div>
              </div>

              <div className="principal-ops-detail-list">
                <div className="principal-ops-detail-row">
                  <span>Tuition Fee Recovery</span>
                  <strong>₹20.20 Cr (95.1%)</strong>
                </div>
                <div className="principal-ops-detail-row">
                  <span>Hostel &amp; Dining Collections</span>
                  <strong>₹3.20 Cr (88.4%)</strong>
                </div>
                <div className="principal-ops-detail-row">
                  <span>Q3 Capex Budget Utilized</span>
                  <strong>₹1.45 Cr (82.0%)</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="principal-ops-link-btn"
              onClick={() => setActiveTab('finance')}
            >
              Open Finance Oversight Module <ArrowRight size={14} />
            </button>
          </div>

          {/* 2. Campus Infrastructure & Facilities */}
          <div className="principal-ops-card">
            <div>
              <div className="principal-ops-card-head">
                <div>
                  <h4>Infrastructure &amp; Energy</h4>
                  <span>Facilities &amp; Campus Maintenance</span>
                </div>
                <div className="principal-ops-icon-frame" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Wrench size={20} />
                </div>
              </div>

              <div style={{ margin: '14px 0 10px' }}>
                <div className="principal-ops-stat-large" style={{ color: '#2563eb' }}>100% OK</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                  48 Lecture Halls · 24 Research Labs Active
                </div>
              </div>

              <div className="principal-ops-detail-list">
                <div className="principal-ops-detail-row">
                  <span>Central 320kVA DG Generator</span>
                  <strong style={{ color: '#15803d' }}>Standby Ready (92% Fuel)</strong>
                </div>
                <div className="principal-ops-detail-row">
                  <span>Central RO Potable Water</span>
                  <strong style={{ color: '#15803d' }}>TDS 104 PPM (Optimal)</strong>
                </div>
                <div className="principal-ops-detail-row">
                  <span>Open Maintenance Work Orders</span>
                  <strong>09 Tasks (Turnaround 3.8h)</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="principal-ops-link-btn"
              onClick={() => setActiveTab('infrastructure')}
            >
              Open Infrastructure Module <ArrowRight size={14} />
            </button>
          </div>

          {/* 3. Faculty Cadre & AICTE Compliance */}
          <div className="principal-ops-card">
            <div>
              <div className="principal-ops-card-head">
                <div>
                  <h4>Faculty Cadre &amp; Compliance</h4>
                  <span>Cadre Ratios &amp; Biometric Attendance</span>
                </div>
                <div className="principal-ops-icon-frame" style={{ background: '#fdf4ff', color: '#a855f7' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>

              <div style={{ margin: '14px 0 10px' }}>
                <div className="principal-ops-stat-large" style={{ color: '#7c3aed' }}>1:2:6</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                  AICTE Cadre Ratio (Prof : Assoc : Asst) Compliant
                </div>
              </div>

              <div className="principal-ops-detail-list">
                <div className="principal-ops-detail-row">
                  <span>Biometric Punch In-Time</span>
                  <strong style={{ color: '#15803d' }}>96.8% Turnout Today</strong>
                </div>
                <div className="principal-ops-detail-row">
                  <span>Ph.D Qualified Faculty</span>
                  <strong>64.2% of Total Cadre</strong>
                </div>
                <div className="principal-ops-detail-row">
                  <span>Research Grants Sanctioned</span>
                  <strong>18 Projects Active</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="principal-ops-link-btn"
              onClick={() => setActiveTab('faculty_staff')}
            >
              Open Faculty &amp; Staff Module <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* SECTION 7: CALENDAR & UPCOMING DEADLINES (DUO GRID)    */}
        {/* ====================================================== */}
        <div className="dash-grid-duo" aria-label="Institutional Calendar & Milestones">
          {/* Left: Interactive Monthly Institutional Calendar */}
          <section className="dash-card dash-calendar" id="calendar">
            <header className="dash-card-head">
              <h3>
                <span className="dash-head-icon"><CalendarDays size={15} /></span>
                Institutional Calendar · {monthLabel}
              </h3>
              <div className="dash-cal-controls">
                <button type="button" onClick={() => updateMonth(-1)} aria-label="Previous month">
                  <ChevronLeft size={15} />
                </button>
                <strong>{monthLabel}</strong>
                <button type="button" onClick={() => updateMonth(1)} aria-label="Next month">
                  <ChevronRight size={15} />
                </button>
              </div>
            </header>

            <div className="dash-cal-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="dash-cal-days">
              {calendarDays.map(({ key, day, inMonth, isToday, isSunday }) => {
                const holidayName = holidayMap[key];
                return (
                  <span
                    key={key}
                    className={[
                      'dash-day',
                      inMonth ? '' : 'is-outside',
                      isToday ? 'is-today' : '',
                      holidayName ? 'is-holiday' : '',
                      isSunday ? 'is-sunday' : '',
                    ].join(' ')}
                    title={holidayName ? `${holidayName} (Gazetted Holiday)` : undefined}
                  >
                    {day}
                  </span>
                );
              })}
            </div>

            <div className="dash-legend">
              <span><i className="lg-holiday" />Holiday</span>
              <span><i className="lg-sunday" />Sunday</span>
              <span><i className="lg-today" />Today</span>
            </div>
          </section>

          {/* Right: Key Academic Deadlines & Milestones */}
          <section className="dash-card dash-holidays" id="deadlines">
            <header className="dash-card-head">
              <h3>
                <span className="dash-head-icon tone-amber"><PartyPopper size={15} /></span>
                Upcoming Institutional Deadlines
              </h3>
              <div className="dash-holiday-controls">
                <div className="dash-holiday-filter-pills">
                  <button
                    type="button"
                    className={`dash-filter-pill ${holidayView === 'all' ? 'active' : ''}`}
                    onClick={() => setHolidayView('all')}
                  >
                    All ({holidayItems.length})
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

            <ul className="dash-holiday-list dash-holiday-scroll" aria-label="Upcoming Deadlines">
              {(overviewData?.upcomingDeadlines || [
                { date: '25 Oct 2026', title: 'Mid-Semester Continuous Assessment Marks Clearance', type: 'Academic', priority: 'High' },
                { date: '28 Oct 2026', title: 'IQAC Quarterly Review & Accreditation Council Meeting', type: 'Governance', priority: 'High' },
                { date: '02 Nov 2026', title: 'Autonomous End-Sem Exam Seating & Strongroom Inspection', type: 'Exam Cell', priority: 'Critical' },
                { date: '10 Nov 2026', title: 'NAAC Cycle IV Peer Team Mock Verification & SSR Dossier', type: 'Accreditation', priority: 'Critical' },
                { date: '15 Nov 2026', title: 'Even Semester Academic Calendar & Timetable Drafting', type: 'Planning', priority: 'Medium' },
              ]).map((dl, idx) => (
                <li key={idx} className={`dash-holiday ${dl.priority === 'Critical' ? 'is-next' : ''}`}>
                  <span className="dash-holiday-date">
                    <strong>{dl.date.split(' ')[0]}</strong>
                    <small>{dl.date.split(' ')[1]}</small>
                  </span>
                  <span className="dash-holiday-info">
                    <strong>{dl.title}</strong>
                    <small>{dl.type} · Due {dl.date}</small>
                  </span>
                  <span
                    className="dash-holiday-badge"
                    style={{
                      background: dl.priority === 'Critical' ? '#fee2e2' : dl.priority === 'High' ? '#fef3c7' : '#e0f2fe',
                      color: dl.priority === 'Critical' ? '#b91c1c' : dl.priority === 'High' ? '#b45309' : '#0369a1',
                    }}
                  >
                    {dl.priority}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ====================================================== */}
        {/* SECTION 8: RECENT INSTITUTIONAL ACTIVITY LOG          */}
        {/* ====================================================== */}
        <section className="erp-panel" style={{ marginBottom: '22px' }} aria-label="Recent Activity Log">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={18} color="#2563eb" />
                Recent Institutional Actions &amp; Executive Clearances
              </h3>
              <p>Tamper-evident activity feed of HOD submissions, administrative sanctions, and gazette releases</p>
            </div>

            <button
              type="button"
              className="erp-btn erp-btn-secondary"
              onClick={() => setActiveTab('audit_trail')}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              View Complete Audit Log <ChevronRight size={13} />
            </button>
          </div>

          <div className="principal-activity-list">
            {(overviewData?.recentActivities || INITIAL_AUDIT_LOGS.slice(0, 5)).map((act, idx) => (
              <div className="principal-activity-item" key={idx}>
                <div className="principal-activity-dot" />
                <div className="principal-activity-content">
                  <strong>{act.action || act.actionType}</strong>
                  <p>{act.detail || act.details}</p>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Actor: <strong>{act.user || act.actor}</strong> {act.module ? `· Module: ${act.module}` : ''}
                  </span>
                </div>
                <span className="principal-activity-time">{act.time || act.timestamp}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="dash-footer">
          Apna Campus · Office of the Principal &amp; Director · Institutional ERP Command Center · {new Date().getFullYear()}
        </footer>
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* TAB 2: MULTI-LEVEL LEAVE APPROVALS                      */ }
  {/* ======================================================== */ }
  {
    activeTab === 'leaves' && (
      <div>
        {/* Filter Controls Bar */}
        <div className="principal-filter-bar">
          <div className="principal-filter-group">
            <div className="principal-search-input">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search applicant name, ID, or department..."
                value={leaveSearch}
                onChange={(e) => setLeaveSearch(e.target.value)}
              />
            </div>

            <select
              className="principal-select"
              value={leaveStatusFilter}
              onChange={(e) => setLeaveStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Principal Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              className="principal-select"
              value={leaveRoleFilter}
              onChange={(e) => setLeaveRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Faculty">Faculty Only</option>
              <option value="Non-Teaching">Non-Teaching Staff</option>
              <option value="Student">Students</option>
            </select>

            <select
              className="principal-select"
              value={leaveDeptFilter}
              onChange={(e) => setLeaveDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Finance">Finance &amp; Accounts</option>
            </select>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredLeaves.length} of {leaveRequests.length} applications
          </div>
        </div>

        {/* Leave Applications Table */}
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Multi-Level Leave Approvals Queue</h3>
              <p>Applications endorsed by Department HODs awaiting Principal final executive sign-off</p>
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Department &amp; Role</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason &amp; HOD Endorsement</th>
                  <th>Status</th>
                  <th>Principal Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      <CalendarCheck size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                      <div>No leave applications match the selected filters.</div>
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{leave.applicantName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ID: {leave.applicantId} · App #{leave.id}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{leave.applicantRole}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>{leave.department}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            border: '1px solid #bae6fd',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {leave.leaveType}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{leave.totalDays} Days</strong>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                          {leave.startDate} to {leave.endDate}
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.4 }}>
                          {leave.reason}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
                          ✓ HOD: {leave.hodRemarks || 'Recommended for Principal approval'}
                        </div>
                        {leave.supportingDoc && (
                          <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FileText size={12} /> {leave.supportingDoc}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            color:
                              leave.principalStatus === 'Approved'
                                ? '#16a34a'
                                : leave.principalStatus === 'Rejected'
                                  ? '#dc2626'
                                  : '#d97706',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {leave.principalStatus === 'Approved' && <CheckCircle2 size={13} />}
                          {leave.principalStatus === 'Rejected' && <XCircle size={13} />}
                          {leave.principalStatus}
                        </span>
                      </td>
                      <td>
                        {leave.principalStatus?.includes('Pending') ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="erp-btn erp-btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => setApprovalModal({ open: true, leave })}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              className="erp-btn erp-btn-danger"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => setRejectionModal({ open: true, leave, reason: '' })}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                            Decision Logged
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* TAB 3: OFFICIAL NOTICES & CIRCULARS                     */ }
  {/* ======================================================== */ }
  {
    activeTab === 'notices' && (
      <div>
        {/* Issue Circular Form */}
        <div className="erp-panel" style={{ marginBottom: '1.5rem' }}>
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Issue Official Principal Circular</h3>
              <p>Direct broadcast to all student, faculty, and administrative dashboards</p>
            </div>
          </div>

          <form onSubmit={handleCreateNotice}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Circular Heading / Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autumn Autonomous Exam Hall Optimization 2026..."
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Target Audience (Scope)
                </label>
                <select
                  value={newNotice.scope}
                  onChange={(e) => setNewNotice({ ...newNotice, scope: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="College-wide">College-wide (All Students &amp; Staff)</option>
                  <option value="All Faculty Only">All Faculty &amp; HODs Only</option>
                  <option value="All Students Only">All Students Only</option>
                  <option value="Final Year Students">Final Year Students Only</option>
                  <option value="Department Specific">Department Heads &amp; Staff</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Notice Priority
                </label>
                <select
                  value={newNotice.priority}
                  onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="Normal">Normal Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent / Critical Notice</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Circular Message Content &amp; Instructions
              </label>
              <textarea
                rows={3}
                placeholder="Enter the full institutional announcement details, relevant dates, and compliance requirements..."
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button type="submit" className="erp-btn erp-btn-primary">
              <Send size={15} /> Publish &amp; Broadcast Official Circular
            </button>
          </form>
        </div>

        {/* Clearance & Published Circulars Board */}
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Institutional Notice Clearance Board &amp; Archive</h3>
              <p>Notices submitted by academic departments and exam cell awaiting clearance or published</p>
            </div>
            <div className="principal-search-input" style={{ width: '220px' }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search notices..."
                value={circularSearch}
                onChange={(e) => setCircularSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Circular Title</th>
                  <th>Target Audience</th>
                  <th>Initiating Department / Author</th>
                  <th>Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCirculars.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{n.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {n.id}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#1e293b',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {n.scope}
                      </span>
                    </td>
                    <td style={{ color: '#475569', fontWeight: 500 }}>{n.author}</td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>{n.date}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: n.priority === 'Urgent' ? '#fee2e2' : n.priority === 'High' ? '#fef3c7' : '#e0f2fe',
                          color: n.priority === 'Urgent' ? '#dc2626' : n.priority === 'High' ? '#b45309' : '#0369a1',
                        }}
                      >
                        {n.priority || 'Normal'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: n.status?.includes('Approved') || n.status?.includes('Broadcasted') ? '#16a34a' : '#d97706',
                          fontWeight: 700,
                        }}
                      >
                        {n.status}
                      </span>
                    </td>
                    <td>
                      {n.status?.includes('Pending') ? (
                        <button
                          className="erp-btn erp-btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                          onClick={() => handleApproveNotice(n.id)}
                        >
                          Approve &amp; Release
                        </button>
                      ) : (
                        <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                          Active on Portals
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* TAB 4: ACADEMIC PERFORMANCE & ANALYTICS DASHBOARD       */ }
  {/* ======================================================== */ }
  {
    activeTab === 'academic_health' && (
      <div>
        {/* Analytics Filter & Export Bar */}
        <div className="principal-filter-bar">
          <div className="principal-filter-group">
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Filters:</span>
            <select
              className="principal-select"
              value={academicDeptFilter}
              onChange={(e) => setAcademicDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="CSE">Computer Science &amp; Engg (CSE)</option>
              <option value="AIML">AI &amp; Machine Learning (AIML)</option>
              <option value="ECE">Electronics &amp; Comm (ECE)</option>
              <option value="EEE">Electrical &amp; Electronics (EEE)</option>
              <option value="MECH">Mechanical Engg (MECH)</option>
              <option value="CIVIL">Civil Engineering (CIVIL)</option>
              <option value="MBA">Business Admin (MBA)</option>
              <option value="MCA">Computer Applications (MCA)</option>
            </select>

            <select
              className="principal-select"
              value={academicSemesterFilter}
              onChange={(e) => setAcademicSemesterFilter(e.target.value)}
            >
              <option value="All">All Semesters (Sem 1 to 8)</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 7">Semester 7</option>
              <option value="Semester 8">Semester 8</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="erp-btn erp-btn-secondary"
              onClick={handleExportAcademicCsv}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              className="erp-btn erp-btn-secondary"
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
            >
              <Printer size={14} /> Print Summary
            </button>
          </div>
        </div>

        {/* Top Academic Metric Cards */}
        <div className="erp-stats-grid">
          <div className="erp-stat-card">
            <div className="erp-stat-card-header">
              <span className="erp-stat-card-title">Overall Autonomous Pass %</span>
              <Award size={18} color="#10b981" />
            </div>
            <div className="erp-stat-val" style={{ color: '#059669' }}>
              {academicData?.overallStats?.overallPassPct || 94.2}%
            </div>
            <div className="erp-stat-note">
              {academicData?.overallStats?.yoyImprovement || '+1.4%'} vs Previous Academic Session
            </div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-card-header">
              <span className="erp-stat-card-title">Average Campus CGPA</span>
              <TrendingUp size={18} color="#0284c7" />
            </div>
            <div className="erp-stat-val" style={{ color: '#0284c7' }}>
              {academicData?.overallStats?.avgCampusCgpa || 8.04}
            </div>
            <div className="erp-stat-note">
              Out of 10.0 scale across {academicData?.overallStats?.totalStudentsEvaluated || 2490} students
            </div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-card-header">
              <span className="erp-stat-card-title">First Class Distinction Rate</span>
              <Sparkles size={18} color="#a855f7" />
            </div>
            <div className="erp-stat-val" style={{ color: '#7c3aed' }}>
              {academicData?.overallStats?.firstClassDistinctionRate || 78.6}%
            </div>
            <div className="erp-stat-note">Students scoring CGPA &gt;= 7.50</div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-card-header">
              <span className="erp-stat-card-title">Supplementary / Backlogs</span>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <div className="erp-stat-val" style={{ color: '#d97706' }}>
              {academicData?.overallStats?.supplementaryBacklogRate || 5.8}%
            </div>
            <div className="erp-stat-note">
              {academicData?.overallStats?.totalBacklogCases || 144} students undergoing remedial support
            </div>
          </div>
        </div>

        {/* Semester-wise Pass % Bar Visualizer */}
        <div className="erp-panel" style={{ marginBottom: '1.5rem' }}>
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Semester-wise Autonomous Examination Pass Rates</h3>
              <p>Continuous internal evaluation &amp; end-semester results progression (Sem 1 to 8)</p>
            </div>
          </div>

          <div className="semester-trend-grid">
            {(academicData?.semesterWiseResults || [
              { semester: 'Sem 1', passPct: 91.5, avgSgpa: 7.82 },
              { semester: 'Sem 2', passPct: 93.2, avgSgpa: 7.95 },
              { semester: 'Sem 3', passPct: 89.8, avgSgpa: 7.68 },
              { semester: 'Sem 4', passPct: 92.4, avgSgpa: 7.88 },
              { semester: 'Sem 5', passPct: 94.6, avgSgpa: 8.12 },
              { semester: 'Sem 6', passPct: 95.8, avgSgpa: 8.24 },
              { semester: 'Sem 7', passPct: 96.5, avgSgpa: 8.35 },
              { semester: 'Sem 8', passPct: 98.2, avgSgpa: 8.52 },
            ]).map((sem, idx) => (
              <div className="semester-bar-card" key={idx}>
                <div className="semester-bar-wrapper">
                  <div
                    className="semester-bar-fill"
                    style={{
                      height: `${sem.passPct}%`,
                      background: sem.passPct >= 95 ? '#16a34a' : sem.passPct >= 90 ? '#0284c7' : '#d97706',
                    }}
                    title={`${sem.semester}: ${sem.passPct}% Pass Rate, Avg SGPA: ${sem.avgSgpa}`}
                  />
                </div>
                <strong>{sem.semester}</strong>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  {sem.passPct}%
                </span>
                <small>SGPA {sem.avgSgpa}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance Matrix Table */}
        <div className="erp-panel" style={{ marginBottom: '1.5rem' }}>
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Department Performance Matrix</h3>
              <p>Comparative examination metrics, average CGPA, and distinction honors</p>
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Students Evaluated</th>
                  <th>Passed Students</th>
                  <th>Pass %</th>
                  <th>Avg CGPA</th>
                  <th>Distinction Rate</th>
                  <th>Backlogs</th>
                  <th>Honor Roll Count</th>
                </tr>
              </thead>
              <tbody>
                {(academicData?.departmentResults || [
                  { code: 'CSE', name: 'Computer Science & Engineering', appeared: 540, passed: 524, passPct: 97.1, avgCgpa: 8.42, backlogs: 16, distinctionPct: 84.2, honorStudents: 48 },
                  { code: 'AIML', name: 'AI & Machine Learning', appeared: 360, passed: 346, passPct: 96.0, avgCgpa: 8.28, backlogs: 14, distinctionPct: 81.5, honorStudents: 32 },
                  { code: 'ECE', name: 'Electronics & Communication', appeared: 380, passed: 360, passPct: 94.8, avgCgpa: 8.10, backlogs: 20, distinctionPct: 76.8, honorStudents: 28 },
                  { code: 'MCA', name: 'Computer Applications', appeared: 180, passed: 172, passPct: 95.6, avgCgpa: 8.02, backlogs: 8, distinctionPct: 78.0, honorStudents: 16 },
                  { code: 'MBA', name: 'Business Administration', appeared: 180, passed: 171, passPct: 95.0, avgCgpa: 7.90, backlogs: 9, distinctionPct: 75.0, honorStudents: 14 },
                  { code: 'EEE', name: 'Electrical & Electronics', appeared: 290, passed: 268, passPct: 92.4, avgCgpa: 7.85, backlogs: 22, distinctionPct: 72.4, honorStudents: 18 },
                  { code: 'MECH', name: 'Mechanical Engineering', appeared: 320, passed: 290, passPct: 90.6, avgCgpa: 7.68, backlogs: 30, distinctionPct: 68.2, honorStudents: 15 },
                  { code: 'CIVIL', name: 'Civil Engineering', appeared: 240, passed: 214, passPct: 89.2, avgCgpa: 7.72, backlogs: 26, distinctionPct: 66.5, honorStudents: 12 },
                ]).map((d) => (
                  <tr key={d.code}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{d.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {d.code}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.appeared}</td>
                    <td style={{ color: '#15803d', fontWeight: 600 }}>{d.passed}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: d.passPct >= 95 ? '#15803d' : d.passPct >= 90 ? '#0284c7' : '#b45309',
                        }}
                      >
                        {d.passPct}%
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{d.avgCgpa}</strong>
                    </td>
                    <td>{d.distinctionPct}%</td>
                    <td>
                      <span style={{ color: d.backlogs > 20 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                        {d.backlogs}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#fdf4ff',
                          color: '#a855f7',
                          border: '1px solid #f5d0fe',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        ★ {d.honorStudents} Scholars
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dual Panels: Dean's Honor Roll and At-Risk Course Interventions */}
        <div className="academic-dual-panels">
          {/* Dean's Honor Roll */}
          <div className="erp-panel">
            <div className="erp-panel-header">
              <div className="erp-panel-title">
                <h3>Dean's Academic Honor Roll</h3>
                <p>Top ranking students across autonomous examinations</p>
              </div>
            </div>
            <div>
              {(academicData?.deansHonorList || [
                { rank: 1, name: 'Ananya Sharma', rollNo: '2305201001', dept: 'CSE', semester: 'Sem 5', cgpa: 9.85, achievements: 'Autonomous Gold Medalist Contender' },
                { rank: 2, name: 'Rohan Senapati', rollNo: '2305201004', dept: 'AIML', semester: 'Sem 5', cgpa: 9.72, achievements: 'SIH 2026 Finalist Team Lead' },
                { rank: 3, name: 'Priyanka Mohapatra', rollNo: '2305201012', dept: 'ECE', semester: 'Sem 5', cgpa: 9.64, achievements: 'IEEE Student Branch President' },
                { rank: 4, name: 'Sourav Panigrahi', rollNo: '2305201019', dept: 'CSE', semester: 'Sem 5', cgpa: 9.58, achievements: 'Published Q1 Scopus Research Paper' },
                { rank: 5, name: 'Debashis Rout', rollNo: '2305201027', dept: 'EEE', semester: 'Sem 5', cgpa: 9.46, achievements: 'Solar Innovation Fellowship Award' },
              ]).map((s) => (
                <div className="honor-student-badge" key={s.rank}>
                  <div className="honor-rank">#{s.rank}</div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Roll: {s.rollNo} · {s.dept} ({s.semester})
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 600, marginTop: 2 }}>
                      {s.achievements}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c3aed' }}>
                      {s.cgpa}
                    </div>
                    <small style={{ fontSize: '0.7rem', color: '#64748b' }}>CGPA</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At-Risk Courses & Academic Support Interventions */}
          <div className="erp-panel">
            <div className="erp-panel-header">
              <div className="erp-panel-title">
                <h3>At-Risk Subjects &amp; Remedial Interventions</h3>
                <p>Courses requiring targeted faculty coaching &amp; academic mentoring</p>
              </div>
            </div>
            <div>
              {(academicData?.atRiskSubjects || [
                { code: 'CS502', name: 'Design and Analysis of Algorithms', dept: 'CSE / AIML', semester: 'Sem 5', faculty: 'Dr. Priya Ranjan', passPct: 84.5, failureCount: 22, action: 'Remedial Tutorial Sessions Assigned' },
                { code: 'EC401', name: 'Signals, Systems & DSP', dept: 'ECE / EEE', semester: 'Sem 4', faculty: 'Dr. M. R. Senapati', passPct: 81.2, failureCount: 28, action: 'Peer Mentoring and Doubt-clearing Classes' },
                { code: 'ME303', name: 'Applied Thermodynamics & Heat Transfer', dept: 'MECH', semester: 'Sem 3', faculty: 'Dr. B. K. Rout', passPct: 79.4, failureCount: 31, action: 'Laboratory Experiment Correlation Review' },
                { code: 'CE504', name: 'Structural Analysis & RCC Design', dept: 'CIVIL', semester: 'Sem 5', faculty: 'Dr. A. K. Nayak', passPct: 78.8, failureCount: 24, action: 'HOD Academic Consultation Scheduled' },
              ]).map((subj) => (
                <div className="at-risk-item" key={subj.code}>
                  <AlertCircle size={18} className="at-risk-icon" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>
                        {subj.code} — {subj.name}
                      </strong>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e11d48' }}>
                        {subj.passPct}% Pass Rate
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
                      {subj.dept} ({subj.semester}) · In-Charge: {subj.faculty}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#b91c1c', fontWeight: 600, marginTop: 4 }}>
                      ⚡ Action: {subj.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* TAB 5: TIMETABLE MANAGEMENT & APPROVAL                   */ }
  {/* ======================================================== */ }
  {
    activeTab === 'timetable' && (
      <div>
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarDays size={24} color="#1d4ed8" />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#1e3a8a' }}>
                Institutional Timetable Master Approval Authority
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6' }}>
                Verify room allocations, faculty workload balance, and clash-free lecture schedules across departments
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              ✓ Autonomous Algorithm Active
            </span>
          </div>
        </div>
        <TimetableManager account={account} />
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* TAB 6: OFFICIAL REPORT GENERATION                       */ }
  {/* ======================================================== */ }
  {
    activeTab === 'report-generation' && (
      <ReportGenerationModule account={account} role="principal" />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 7: CAMPUS CONNECT (INSTITUTIONAL MESSAGING)         */ }
  {/* ======================================================== */ }
  {
    activeTab === 'campus-connect' && (
      <div
        style={{
          height: 'calc(100vh - 120px)',
          minHeight: '680px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          background: '#fff',
          marginBottom: '20px',
        }}
      >
        <CampusConnect account={account} />
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* TAB 8: DEPARTMENT & HOD MANAGEMENT                      */ }
  {/* ======================================================== */ }
  {
    activeTab === 'departments' && (
      <PrincipalDepartmentModule onToast={triggerToast} />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 9: EXAMINATION & RESULTS OVERSIGHT                  */ }
  {/* ======================================================== */ }
  {
    activeTab === 'examinations' && (
      <PrincipalExamOversightModule onToast={triggerToast} />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 10: FINANCE & BUDGET OVERSIGHT                      */ }
  {/* ======================================================== */ }
  {
    activeTab === 'finance' && (
      <PrincipalFinanceModule onToast={triggerToast} />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 11: FACULTY & STAFF OVERVIEW                        */ }
  {/* ======================================================== */ }
  {
    activeTab === 'faculty_staff' && (
      <PrincipalFacultyStaffModule onToast={triggerToast} />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 12: INFRASTRUCTURE & FACILITIES                     */ }
  {/* ======================================================== */ }
  {
    activeTab === 'infrastructure' && (
      <PrincipalInfrastructureModule onToast={triggerToast} />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 13: ACCREDITATION & COMPLIANCE                      */ }
  {/* ======================================================== */ }
  {
    activeTab === 'accreditation' && (
      <PrincipalAccreditationModule onToast={triggerToast} />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 14: GRIEVANCE & DISCIPLINARY OVERSIGHT              */ }
  {/* ======================================================== */ }
  {
    activeTab === 'grievances' && (
      <PrincipalGrievanceModule onToast={triggerToast} />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 15: INSTITUTIONAL CALENDAR & EVENTS                 */ }
  {/* ======================================================== */ }
  {
    activeTab === 'calendar_events' && (
      <PrincipalCalendarModule onToast={triggerToast} />
    )
  }

  {/* ======================================================== */ }
  {/* TAB 16: AUDIT TRAIL & ACTIVITY LOGS                     */ }
  {/* ======================================================== */ }
  {
    activeTab === 'audit_trail' && (
      <PrincipalAuditModule onToast={triggerToast} />
    )
  }
        </div >
        </div >
      </AppLayout >

    {/* ======================================================== */ }
  {/* MODAL 1: CONFIRM LEAVE APPROVAL                          */ }
  {/* ======================================================== */ }
  {
    approvalModal.open && (
      <div className="principal-modal-overlay">
        <div className="principal-modal">
          <div className="principal-modal-header">
            <h3>Confirm Leave Final Executive Approval</h3>
            <button
              type="button"
              onClick={() => setApprovalModal({ open: false, leave: null })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="principal-modal-body">
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginTop: 0 }}>
              Are you sure you want to officially approve this application?
            </p>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div><strong>Applicant:</strong> {approvalModal.leave?.applicantName}</div>
              <div><strong>Role &amp; Department:</strong> {approvalModal.leave?.applicantRole} · {approvalModal.leave?.department}</div>
              <div><strong>Leave Type:</strong> {approvalModal.leave?.leaveType} ({approvalModal.leave?.totalDays} Days)</div>
              <div><strong>Dates:</strong> {approvalModal.leave?.startDate} to {approvalModal.leave?.endDate}</div>
              <div><strong>Reason:</strong> {approvalModal.leave?.reason}</div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.75rem' }}>
              Approval will be immutably recorded in the institutional audit ledger and notifications dispatched.
            </p>
          </div>
          <div className="principal-modal-footer">
            <button
              className="erp-btn erp-btn-secondary"
              onClick={() => setApprovalModal({ open: false, leave: null })}
            >
              Cancel
            </button>
            <button className="erp-btn erp-btn-primary" onClick={confirmApproveLeave}>
              <Check size={15} /> Yes, Approve Application
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* MODAL 2: REJECT LEAVE WITH MANDATORY REASON             */ }
  {/* ======================================================== */ }
  {
    rejectionModal.open && (
      <div className="principal-modal-overlay">
        <div className="principal-modal">
          <div className="principal-modal-header">
            <h3 style={{ color: '#dc2626' }}>Reject Leave Application</h3>
            <button
              type="button"
              onClick={() => setRejectionModal({ open: false, leave: null, reason: '' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="principal-modal-body">
            <p style={{ fontSize: '0.88rem', color: '#334155', marginTop: 0 }}>
              Rejecting application for <strong>{rejectionModal.leave?.applicantName}</strong> ({rejectionModal.leave?.department}).
            </p>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
              Mandatory Rejection Reason &amp; Official Remarks *
            </label>
            <textarea
              rows={3}
              placeholder="State the institutional policy reason for rejection (e.g. Critical academic schedule clash, insufficient supporting documentation, pending exam duty)..."
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div className="principal-modal-footer">
            <button
              className="erp-btn erp-btn-secondary"
              onClick={() => setRejectionModal({ open: false, leave: null, reason: '' })}
            >
              Cancel
            </button>
            <button className="erp-btn erp-btn-danger" onClick={confirmRejectLeave}>
              <X size={15} /> Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* MODAL 3: INSPECT DEPARTMENT DETAILS                     */ }
  {/* ======================================================== */ }
  {
    inspectDeptModal.open && inspectDeptModal.dept && (
      <div className="principal-modal-overlay">
        <div className="principal-modal" style={{ maxWidth: '600px' }}>
          <div className="principal-modal-header">
            <h3>Department Academic Audit: {inspectDeptModal.dept.name}</h3>
            <button
              type="button"
              onClick={() => setInspectDeptModal({ open: false, dept: null })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="principal-modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b' }}>Head of Department</small>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectDeptModal.dept.hod}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b' }}>Total Enrolled Students</small>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectDeptModal.dept.students}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b' }}>Faculty Presence</small>
                <div style={{ fontWeight: 700, color: '#15803d' }}>
                  {inspectDeptModal.dept.facultyOnDuty} of {inspectDeptModal.dept.faculty} Active
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b' }}>Syllabus Pace</small>
                <div style={{ fontWeight: 700, color: '#0284c7' }}>{inspectDeptModal.dept.syllabusPace}% Completed</div>
              </div>
            </div>
            <div style={{ background: '#eff6ff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.85rem', color: '#1e3a8a' }}>
              <strong>Autonomous Compliance Note:</strong> Continuous evaluation verified for {inspectDeptModal.dept.code}. Internal assessments meet autonomous exam cell benchmarks.
            </div>
          </div>
          <div className="principal-modal-footer">
            <button
              className="erp-btn erp-btn-secondary"
              onClick={() => setInspectDeptModal({ open: false, dept: null })}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* ======================================================== */ }
  {/* MODAL 4: EXECUTIVE ACTION DOCKET DETAILS                 */ }
  {/* ======================================================== */ }
  {
    selectedActionModal && (
      <div className="principal-modal-overlay">
        <div className="principal-modal" style={{ maxWidth: '640px' }}>
          <div className="principal-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck2 size={18} color="#2563eb" />
              <h3 style={{ margin: 0 }}>Executive Action Docket · {selectedActionModal.id}</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedActionModal(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="principal-modal-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {selectedActionModal.type}
              </span>

              <span className={`principal-action-priority-tag priority-tag-${selectedActionModal.priority.toLowerCase()}`}>
                {selectedActionModal.priority} Priority
              </span>
            </div>

            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.4 }}>
              {selectedActionModal.title}
            </h4>

            <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
              {selectedActionModal.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b' }}>Originating Department</small>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedActionModal.department}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b' }}>Applicant / Signatory</small>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedActionModal.applicant}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b' }}>Submission Timestamp</small>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedActionModal.submittedDate}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b' }}>Compliance Deadline</small>
                <div style={{ fontWeight: 700, color: '#b91c1c' }}>{selectedActionModal.dueDate}</div>
              </div>
            </div>

            <div
              style={{
                background: selectedActionModal.status.includes('Approved')
                  ? '#f0fdf4'
                  : selectedActionModal.status.includes('Rejected')
                    ? '#fef2f2'
                    : '#fffbeb',
                border: `1px solid ${selectedActionModal.status.includes('Approved')
                    ? '#bbf7d0'
                    : selectedActionModal.status.includes('Rejected')
                      ? '#fecaca'
                      : '#fde68a'
                  }`,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <span>Current Status:</span>
              <strong
                style={{
                  color: selectedActionModal.status.includes('Approved')
                    ? '#15803d'
                    : selectedActionModal.status.includes('Rejected')
                      ? '#b91c1c'
                      : '#b45309',
                }}
              >
                {selectedActionModal.status}
              </strong>
            </div>
          </div>

          <div className="principal-modal-footer">
            <button
              type="button"
              className="erp-btn erp-btn-secondary"
              onClick={() => setSelectedActionModal(null)}
            >
              Close
            </button>

            {!selectedActionModal.status.includes('Approved') && !selectedActionModal.status.includes('Rejected') && (
              <>
                <button
                  type="button"
                  className="erp-btn erp-btn-danger"
                  onClick={() => {
                    handleQuickRejectAction(selectedActionModal);
                    setSelectedActionModal(null);
                  }}
                >
                  <X size={14} /> Reject / Return
                </button>
                <button
                  type="button"
                  className="erp-btn erp-btn-primary"
                  onClick={() => {
                    handleQuickApproveAction(selectedActionModal);
                    setSelectedActionModal(null);
                  }}
                >
                  <Check size={14} /> Approve &amp; Sign Docket
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
    </>
  );
}
