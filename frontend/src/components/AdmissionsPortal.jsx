import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  X,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Award,
  Eye,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Megaphone,
  HelpCircle,
  Layers,
  CheckSquare,
  Square,
  FileCheck,
  FileSpreadsheet,
  AlertTriangle,
  Send,
  DollarSign,
  CreditCard,
  ChevronDown,
  Bell,
  UserRound,
  Zap,
  Info,
  SlidersHorizontal,
  Menu,
} from 'lucide-react';
import { api } from '../services/api.js';
import AccountActivationModal from './AccountActivationModal.jsx';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import { MasterSidebarHeader, useMasterSidebarState } from './Navigation/MasterSidebar.jsx';
import './Navigation/MasterNavigation.css';
import './SuperAdminPortal.css';
import './PrincipalPortal.css';
import '../DashboardHome.css';
import './RoleDashboardLanding.css';

// Official Institutional Gazetted Holidays 2026
const OFFICIAL_HOLIDAYS_2026 = [
  ['14-01-2026', 'Makar Sankranti / Pongal'],
  ['23-01-2026', 'Netaji Jayanti / Veer Surendra Sai Jayanti'],
  ['26-01-2026', 'Republic Day'],
  ['15-02-2026', 'Maha Shivratri'],
  ['04-03-2026', 'Dola Purnima / Holi Eve'],
  ['05-03-2026', 'Holi Festival'],
  ['20-03-2026', 'Id-ul-Fitr (Ramzan Id)'],
  ['27-03-2026', 'Sri Ram Navami'],
  ['14-04-2026', 'Maha Vishuba Sankranti / Dr. B. R. Ambedkar Jayanti'],
  ['01-05-2026', 'International May Day'],
  ['08-05-2026', 'Buddha Purnima'],
  ['27-05-2026', 'Bakrid / Id-ul-Zuha'],
  ['16-06-2026', 'Pahili Raja'],
  ['17-06-2026', 'Raja Sankranti'],
  ['26-06-2026', 'Muharram'],
  ['16-07-2026', 'Ratha Yatra (Car Festival)'],
  ['24-07-2026', 'Bahuda Yatra (Return Car Festival)'],
  ['15-08-2026', 'Independence Day'],
  ['28-08-2026', 'Gamha Purnima / Raksha Bandhan'],
  ['04-09-2026', 'Janmashtami'],
  ['14-09-2026', 'Nuakhai'],
  ['16-09-2026', 'Milad-un-Nabi (Prophet’s Birthday)'],
  ['02-10-2026', 'Mahatma Gandhi Jayanti'],
  ['10-10-2026', 'Maha Saptami (Durga Puja)'],
  ['11-10-2026', 'Maha Ashtami / Maha Navami'],
  ['12-10-2026', 'Vijaya Dashami (Dussehra)'],
  ['24-10-2026', 'Kumar Purnima / Lakshmi Puja'],
  ['08-11-2026', 'Deepavali (Diwali) / Kali Puja'],
  ['23-11-2026', 'Rasa Purnima / Guru Nanak Jayanti'],
  ['25-12-2026', 'Christmas Day'],
];

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7.5px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '12.5px' }}>
      <dt style={{ color: '#64748b', fontWeight: 600 }}>{label}</dt>
      <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0, textAlign: 'right' }}>{value || '—'}</dd>
    </div>
  );
}

export default function AdmissionsPortal({ account, onLogout, onSwitchRole }) {
  // Navigation: sidebar open state and active menu tab
  const [sidebarOpen, setSidebarOpen] = useMasterSidebarState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'applicants', 'verification', 'review', 'offers', 'fee', 'enrollment', 'deadlines', 'notices', 'merit', 'reports'
  const [currentTab, setCurrentTab] = useState('all'); // 'all', 'verification', 'review', 'offer', 'enrolled', 'merit'

  // Reset scroll position to top whenever activeTab or currentTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const scrollables = document.querySelectorAll('.erp-main-content, .role-dash-container');
    scrollables.forEach((el) => { el.scrollTop = 0; });
  }, [activeTab, currentTab]);

  // Real backend metrics & pipeline state
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    awaitingReview: 0,
    documentsPending: 0,
    approved: 0,
    offersAwaitingAcceptance: 0,
    offersAccepted: 0,
    feeConfirmed: 0,
    enrolled: 0,
    rejected: 0,
    incomplete: 0,
    conversionRate: '0%',
    pipeline: {
      submitted: 0,
      underReview: 0,
      docsVerified: 0,
      approved: 0,
      offerAccepted: 0,
      feeConfirmed: 0,
      enrolled: 0,
    },
    byProgramme: {},
    byCategory: {},
    pendingTasks: [],
  });

  const [applicants, setApplicants] = useState([]);
  const [totalApplicantsCount, setTotalApplicantsCount] = useState(0);
  const [programmes, setProgrammes] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [notices, setNotices] = useState([]);
  const [meritList, setMeritList] = useState([]);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [progFilter, setProgFilter] = useState('All');
  const [academicYearFilter, setAcademicYearFilter] = useState('2026-27');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState([]);

  // Loading & Toast states
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Selected applicant for Dossier Modal
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [dossierActiveTab, setDossierActiveTab] = useState('personal'); // personal, academic, documents, review, offer, fee, audit
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Document preview state
  const [previewDocument, setPreviewDocument] = useState(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isDeadlinesModalOpen, setIsDeadlinesModalOpen] = useState(false);
  const [isMeritModalOpen, setIsMeritModalOpen] = useState(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [enrolledStudentInfo, setEnrolledStudentInfo] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile tab in officer card
  const [profileTab, setProfileTab] = useState('profile');

  // Form state for new applicant
  const [newApplicantForm, setNewApplicantForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Female',
    dob: '2005-08-15',
    category: 'General',
    programmeId: '',
    programmeName: 'Bachelor of Technology in Computer Science & Engineering',
    tenthMarks: '88.5',
    twelfthMarks: '86.0',
    entranceExam: 'JEE Main 2026',
    entranceRank: '32500',
    address: 'Plot 120, Infocity Avenue',
    city: 'Bhubaneswar',
    state: 'Odisha',
    guardianName: 'Subrat Behera',
    guardianPhone: '+91 94370 44551',
    previousSchool: 'DAV Public School, Chandrasekharpur',
  });

  // Notice form
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    summary: '',
    content: '',
    pinned: true,
  });

  // Deadline form
  const [deadlineForm, setDeadlineForm] = useState({
    title: '',
    category: 'Document Verification',
    programmeCode: 'All',
    deadlineDate: '2026-10-30',
    time: '05:00 PM',
    description: '',
  });

  // Review & Decision Form inside Dossier
  const [reviewForm, setReviewForm] = useState({
    decision: 'APPROVE',
    notes: '',
    reason: '',
    bypassIncompleteDocs: false,
  });

  // Fee confirmation Form inside Dossier
  const [feeForm, setFeeForm] = useState({
    amount: 40000,
    receiptRef: '',
    paymentMode: 'Online Transfer (NEFT/RTGS)',
    remarks: 'Verified against SBI institutional current account statement.',
  });

  // Offer Letter Form inside Dossier
  const [offerForm, setOfferForm] = useState({
    validUntil: '2026-10-31',
    conditions: 'Subject to submission of original migration certificate and final clearance.',
  });

  // Live Clock & Calendar states
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [holidayView, setHolidayView] = useState('all');

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(currentTime);
  }, [currentTime]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(currentMonth);
  }, [currentMonth]);

  // Load backend data
  useEffect(() => {
    loadAllData();
  }, [statusFilter, stageFilter, progFilter, academicYearFilter, sortBy, sortOrder, currentPage, pageSize]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, applicantsRes, progRes, deadRes, notRes, meritRes] = await Promise.allSettled([
        api.getAdmissionStats(),
        api.getApplicants({
          status: statusFilter,
          stage: stageFilter,
          programmeId: progFilter,
          academicYear: academicYearFilter,
          sortBy,
          sortOrder,
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
        }),
        api.getProgrammes(),
        api.getAdmissionDeadlines(),
        api.getAdmissionNotices(),
        api.getAdmissionMeritList(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
      if (applicantsRes.status === 'fulfilled' && applicantsRes.value?.applicants) {
        setApplicants(applicantsRes.value.applicants);
        setTotalApplicantsCount(applicantsRes.value.total || applicantsRes.value.applicants.length);
      }
      if (progRes.status === 'fulfilled' && progRes.value?.data) {
        setProgrammes(progRes.value.data);
        if (!newApplicantForm.programmeId && progRes.value.data.length > 0) {
          setNewApplicantForm((prev) => ({
            ...prev,
            programmeId: progRes.value.data[0].id,
            programmeName: progRes.value.data[0].name,
          }));
        }
      }
      if (deadRes.status === 'fulfilled' && deadRes.value?.data) {
        setDeadlines(deadRes.value.data);
      }
      if (notRes.status === 'fulfilled' && notRes.value?.data) {
        setNotices(notRes.value.data);
      }
      if (meritRes.status === 'fulfilled' && meritRes.value?.meritList) {
        setMeritList(meritRes.value.meritList);
      }
    } catch (err) {
      console.warn('Error loading admissions data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  }

  // Navigate to filtered application list when summary card or action is clicked
  function navigateToFilteredApplicants(filterSettings) {
    if (filterSettings.status) setStatusFilter(filterSettings.status);
    if (filterSettings.stage) setStageFilter(filterSettings.stage);
    if (filterSettings.tab) {
      if (filterSettings.tab === 'verification') setActiveTab('verification');
      else if (filterSettings.tab === 'review') setActiveTab('review');
      else if (filterSettings.tab === 'offers' || filterSettings.tab === 'offer') setActiveTab('offers');
      else if (filterSettings.tab === 'fee') setActiveTab('fee');
      else if (filterSettings.tab === 'enrolled' || filterSettings.tab === 'enrollment') setActiveTab('enrollment');
      else if (filterSettings.tab === 'merit') setActiveTab('merit');
      else {
        setCurrentTab(filterSettings.tab);
        setActiveTab('applicants');
      }
    } else {
      setActiveTab('applicants');
    }
  }

  // Open Dossier for specific applicant
  async function openApplicantDossier(applicantId, tab = 'personal') {
    try {
      const res = await api.getApplicantById(applicantId);
      if (res && res.data) {
        setSelectedApplicant(res.data);
        setDossierActiveTab(tab);
        setFeeForm((prev) => ({
          ...prev,
          amount: res.data.feeAmount || 40000,
          receiptRef: res.data.feeReceiptRef || `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        }));
        setIsDossierModalOpen(true);
      }
    } catch (err) {
      showToast('Error fetching applicant record: ' + (err.message || 'Network error'));
    }
  }

  // Refresh single applicant inside dossier
  async function reloadCurrentApplicant() {
    if (!selectedApplicant) return;
    try {
      const res = await api.getApplicantById(selectedApplicant.id);
      if (res && res.data) {
        setSelectedApplicant(res.data);
      }
      loadAllData();
    } catch (err) {
      console.warn('Error reloading applicant:', err);
    }
  }

  // Handle Document Verification Action
  async function handleVerifyDocument(docId, actionStatus, remarks, replacementReason) {
    if (!selectedApplicant) return;
    try {
      const res = await api.verifyDocument(selectedApplicant.id, docId, {
        status: actionStatus,
        remarks,
        replacementReason,
      });
      if (res && res.success) {
        showToast(`Document status updated to ${actionStatus}.`);
        reloadCurrentApplicant();
      } else {
        alert(res?.message || 'Failed to update document status.');
      }
    } catch (err) {
      alert(err?.message || 'Error updating document verification.');
    }
  }

  // Handle Review Decision (Approve / Reject / Waitlist / Under Review)
  async function handleRecordDecision(decision) {
    if (!selectedApplicant) return;
    if (decision === 'REJECT' && !reviewForm.reason.trim()) {
      alert('Please provide a documented rejection reason before proceeding.');
      return;
    }
    try {
      const res = await api.reviewApplicant(selectedApplicant.id, {
        decision,
        notes: reviewForm.notes,
        reason: reviewForm.reason,
        bypassIncompleteDocs: reviewForm.bypassIncompleteDocs,
      });
      if (res && res.success) {
        showToast(`Application decision recorded: ${decision}`);
        reloadCurrentApplicant();
      } else {
        alert(res?.message || 'Failed to record decision.');
      }
    } catch (err) {
      alert(err?.message || 'Review decision error.');
    }
  }

  // Generate Admission Offer Letter
  async function handleGenerateOffer() {
    if (!selectedApplicant) return;
    try {
      const res = await api.generateAdmissionOffer(selectedApplicant.id, {
        validUntil: offerForm.validUntil,
        conditions: offerForm.conditions,
      });
      if (res && res.success) {
        showToast(`Provisional Offer Letter generated! Valid until ${offerForm.validUntil}`);
        reloadCurrentApplicant();
      } else {
        alert(res?.message || 'Failed to generate offer.');
      }
    } catch (err) {
      alert(err?.message || 'Offer generation failed.');
    }
  }

  // Respond to Offer (Accept / Decline)
  async function handleOfferResponse(action) {
    if (!selectedApplicant) return;
    if (!window.confirm(`Confirm candidate response: ${action}?`)) return;
    try {
      const res = await api.respondToOffer(selectedApplicant.id, { action });
      if (res && res.success) {
        showToast(`Candidate offer response recorded: ${action}`);
        reloadCurrentApplicant();
      } else {
        alert(res?.message || 'Failed to record response.');
      }
    } catch (err) {
      alert(err?.message || 'Offer response failed.');
    }
  }

  // Confirm Admission Fee
  async function handleConfirmFee(e) {
    e.preventDefault();
    if (!selectedApplicant) return;
    if (!feeForm.receiptRef.trim()) {
      alert('Please enter a valid receipt or bank transaction reference (UTR).');
      return;
    }
    try {
      const res = await api.confirmAdmissionFee(selectedApplicant.id, feeForm);
      if (res && res.success) {
        showToast(`Fee confirmed! Payment reference: ${feeForm.receiptRef}`);
        reloadCurrentApplicant();
      } else {
        alert(res?.message || 'Failed to confirm fee.');
      }
    } catch (err) {
      alert(err?.message || 'Fee confirmation error.');
    }
  }

  // Finalize Enrollment (Multi-Step Atomic Transaction)
  async function handleFinalizeEnrollment() {
    if (!selectedApplicant) return;
    if (!window.confirm(`Finalize enrollment and generate permanent student registration for ${selectedApplicant.name}?`)) {
      return;
    }
    try {
      const res = await api.approveAndEnrollApplicant(selectedApplicant.id);
      if (res && res.success && res.data) {
        setEnrolledStudentInfo(res.data);
        showToast(`Student ${res.data.name} enrolled successfully! Student ID: ${res.data.studentId}`);
        reloadCurrentApplicant();
      } else {
        alert(res?.message || 'Failed to finalize enrollment.');
      }
    } catch (err) {
      alert(err?.message || 'Enrollment transaction failed.');
    }
  }

  // Register New Applicant Form Submission
  async function handleRegisterNewApplicant(e) {
    e.preventDefault();
    try {
      const res = await api.createApplicant(newApplicantForm);
      if (res && res.success) {
        showToast(`Applicant ${newApplicantForm.name} registered with App No: ${res.data.applicationNo}!`);
        setIsRegisterModalOpen(false);
        loadAllData();
      } else {
        alert(res?.message || 'Failed to register applicant.');
      }
    } catch (err) {
      alert(err?.message || 'Error creating application. Please check input details.');
    }
  }

  // Bulk Verify Action
  async function handleBulkVerify() {
    if (selectedApplicantIds.length === 0) {
      alert('Please select at least one applicant from the table to verify.');
      return;
    }
    if (!window.confirm(`Bulk verify documents for ${selectedApplicantIds.length} selected applicants?`)) return;
    try {
      const res = await api.bulkVerifyDocuments(selectedApplicantIds);
      if (res && res.success) {
        showToast(`Bulk verified ${res.count} applicants successfully.`);
        setSelectedApplicantIds([]);
        loadAllData();
      }
    } catch (err) {
      alert(err?.message || 'Bulk verify failed.');
    }
  }

  // Create Admission Notice
  async function handleCreateNotice(e) {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      alert('Please provide a title and notice content.');
      return;
    }
    try {
      const res = await api.createAdmissionNotice(noticeForm);
      if (res && res.success) {
        showToast('Official admission notice published successfully.');
        setIsNoticeModalOpen(false);
        setNoticeForm({ title: '', summary: '', content: '', pinned: true });
        loadAllData();
      }
    } catch (err) {
      alert(err?.message || 'Error publishing notice.');
    }
  }

  // Create Admission Deadline
  async function handleCreateDeadline(e) {
    e.preventDefault();
    if (!deadlineForm.title || !deadlineForm.deadlineDate) {
      alert('Please provide deadline title and target date.');
      return;
    }
    try {
      const res = await api.createAdmissionDeadline(deadlineForm);
      if (res && res.success) {
        showToast('Admission deadline added successfully.');
        setIsDeadlinesModalOpen(false);
        loadAllData();
      }
    } catch (err) {
      alert(err?.message || 'Error adding deadline.');
    }
  }

  // Export CSV Report
  function exportAdmissionCSV() {
    if (applicants.length === 0) {
      alert('No applicant records available to export.');
      return;
    }
    const headers = [
      'Application No',
      'Name',
      'Email',
      'Phone',
      'Gender',
      'Category',
      'Programme',
      'Academic Year',
      '10th Marks (%)',
      '12th Marks (%)',
      'Merit Score',
      'Status',
      'Stage',
      'Fee Status',
      'Fee Paid',
      'Student ID',
      'Submission Date',
    ];

    const rows = applicants.map((a) => [
      `"${a.applicationNo || ''}"`,
      `"${a.name || ''}"`,
      `"${a.email || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.gender || ''}"`,
      `"${a.category || ''}"`,
      `"${a.programmeName || ''}"`,
      `"${a.academicYear || ''}"`,
      a.tenthMarks || '',
      a.twelfthMarks || '',
      a.meritScore || '',
      `"${a.status || ''}"`,
      `"${a.stage || ''}"`,
      `"${a.feeStatus || 'Pending'}"`,
      a.feePaid || 0,
      `"${a.studentId || ''}"`,
      `"${new Date(a.createdAt).toLocaleDateString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ApnaCampus_Admissions_Report_${academicYearFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Admissions CSV report downloaded.');
  }

  // Copy activation link
  function copyActivationLink() {
    if (!enrolledStudentInfo?.activationToken) return;
    const fullUrl = `${window.location.origin}/#activate?token=${enrolledStudentInfo.activationToken}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: '', isBlank: true });
    }

    const todayDate = new Date();
    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${String(d).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
      const holiday = OFFICIAL_HOLIDAYS_2026.find((h) => h[0] === dStr);
      const isSunday = new Date(year, month, d).getDay() === 0;
      const isToday =
        todayDate.getFullYear() === year &&
        todayDate.getMonth() === month &&
        todayDate.getDate() === d;

      days.push({
        dayNumber: d,
        dateStr: dStr,
        isSunday,
        isToday,
        isHoliday: Boolean(holiday),
        holidayName: holiday ? holiday[1] : '',
      });
    }
    return days;
  }, [currentMonth]);

  // Officer display details (default or logged-in account)
  const officerName = account?.name || 'Ms. Sasmita Mohapatra';
  const officerRole = account?.role === 'super_admin' ? 'Super Administrator' : account?.role === 'principal' ? 'Principal / Director' : 'Senior Admissions & Counseling Officer';
  const officerDept = account?.department || 'Admissions & Student Intake Office';

  // Tab Title Resolver
  const getActiveTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Admission Management Dashboard';
      case 'applicants': return 'Applications Directory & Intake Database';
      case 'verification': return 'Academic Document Verification Queue';
      case 'review': return 'Faculty Review & Admission Decisions';
      case 'offers': return 'Offer Letters & Candidate Acceptance';
      case 'fee': return 'Admission Seat Acceptance Fee & Ledger';
      case 'enrollment': return 'Student Matriculation & Registration';
      case 'deadlines': return 'Admission Milestones & Deadlines';
      case 'notices': return 'Admission Circulars & Public Notices';
      case 'merit': return 'Merit List Calculation & Seat Allotment';
      case 'reports': return 'Intake Analytics & Report Generation';
      default: return 'Admissions Command Center';
    }
  };

  const getBreadcrumbTabLabel = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'applicants': return 'Applications';
      case 'verification': return 'Verification';
      case 'review': return 'Review & Decisions';
      case 'offers': return 'Offers';
      case 'fee': return 'Fee Ledger';
      case 'enrollment': return 'Enrollment';
      case 'deadlines': return 'Deadlines';
      case 'notices': return 'Circulars';
      case 'merit': return 'Merit List';
      case 'reports': return 'Reports';
      default: return 'Admissions';
    }
  };

  // Funnel & Category CSV Exporters
  function exportPipelineFunnelCSV() {
    const headers = ['Pipeline Stage,Count,Description\n'];
    const rows = [
      `"1. Submitted Applications",${stats.pipeline.submitted},"Candidates who submitted online registration"`,
      `"2. Under Review",${stats.pipeline.underReview},"Candidates in initial screening or awaiting reviewer assignment"`,
      `"3. Documents Verified",${stats.pipeline.docsVerified},"Candidates with all mandatory academic credentials verified"`,
      `"4. Approved for Admission",${stats.pipeline.approved},"Candidates approved by Faculty Admissions Committee"`,
      `"5. Offer Letter Accepted",${stats.pipeline.offerAccepted},"Candidates who accepted provisional seat offer"`,
      `"6. Fee Confirmed",${stats.pipeline.feeConfirmed},"Candidates with verified ₹40,000 seat acceptance fee"`,
      `"7. Matriculated & Enrolled",${stats.pipeline.enrolled},"Provisioned official university students with Roll Numbers"`,
    ];
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApnaCampus_Admission_Pipeline_Funnel_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Admission Pipeline Funnel CSV downloaded.');
  }

  function exportCategoryDistributionCSV() {
    const headers = ['Category,Count,Percentage of Intake\n'];
    const total = stats.total || 1;
    const rows = Object.entries(stats.byCategory || {}).map(([cat, count]) => {
      const pct = ((count / total) * 100).toFixed(1);
      return `"${cat}",${count},"${pct}%"`;
    });
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApnaCampus_Category_Quota_Distribution_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Category Quota Distribution CSV downloaded.');
  }

  return (
    <div className="erp-admissions-layout erp-principal-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
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
          <Sparkles size={18} color="#ffffff" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <aside className="erp-sidebar">
          <MasterSidebarHeader
            roleTitle="ADMISSIONS CENTRAL"
            onToggle={() => setSidebarOpen(false)}
          />

        <nav className="erp-sidebar-nav">
          <div className="erp-nav-section-title" style={{ padding: '0.4rem 0.6rem 0.2rem', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Core Workflows
          </div>

          <button
            className={`erp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={18} />
            <span>Dashboard Overview</span>
            <span style={{ marginLeft: 'auto', background: '#3b82f6', color: '#fff', fontSize: '0.68rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>Live</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('All');
              setStageFilter('All');
              setActiveTab('applicants');
            }}
          >
            <Users size={18} />
            <span>Applications Directory</span>
            <span className="erp-nav-badge">{totalApplicantsCount}</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('DOCS_PENDING');
              setActiveTab('verification');
            }}
          >
            <CheckCircle2 size={18} />
            <span>Document Verification</span>
            {stats.documentsPending > 0 && (
              <span className="erp-nav-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>
                {stats.documentsPending}
              </span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('UNDER_REVIEW');
              setActiveTab('review');
            }}
          >
            <Award size={18} />
            <span>Review & Decisions</span>
            {stats.awaitingReview > 0 && (
              <span className="erp-nav-badge" style={{ background: '#8b5cf6', color: '#ffffff' }}>
                {stats.awaitingReview}
              </span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('OFFER_ISSUED');
              setActiveTab('offers');
            }}
          >
            <Send size={18} />
            <span>Offer Letters &amp; Acceptance</span>
            {stats.offersAwaitingAcceptance > 0 && (
              <span className="erp-nav-badge" style={{ background: '#0284c7', color: '#ffffff' }}>
                {stats.offersAwaitingAcceptance}
              </span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'fee' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('OFFER_ACCEPTED');
              setActiveTab('fee');
            }}
          >
            <CreditCard size={18} />
            <span>Fee Clearance & Ledger</span>
            {stats.feeConfirmed > 0 && (
              <span className="erp-nav-badge" style={{ background: '#10b981', color: '#ffffff' }}>
                {stats.feeConfirmed}
              </span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'enrollment' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('FEE_CONFIRMED');
              setActiveTab('enrollment');
            }}
          >
            <ShieldCheck size={18} />
            <span>Student Enrollment</span>
            {stats.enrolled > 0 && (
              <span className="erp-nav-badge" style={{ background: '#059669', color: '#ffffff' }}>
                {stats.enrolled}
              </span>
            )}
          </button>

          <div className="erp-nav-section-title" style={{ padding: '0.8rem 0.6rem 0.2rem', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Academic & Governance
          </div>

          <button
            className={`erp-nav-item ${activeTab === 'deadlines' ? 'active' : ''}`}
            onClick={() => setActiveTab('deadlines')}
          >
            <Calendar size={18} />
            <span>Deadlines & Milestones</span>
            {deadlines.length > 0 && (
              <span className="erp-nav-badge blue">{deadlines.length}</span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <Megaphone size={18} />
            <span>Circulars & Notices</span>
            {notices.length > 0 && (
              <span className="erp-nav-badge blue">{notices.length}</span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'merit' ? 'active' : ''}`}
            onClick={() => setActiveTab('merit')}
          >
            <SlidersHorizontal size={18} />
            <span>Merit List & Allocation</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileSpreadsheet size={18} />
            <span>Report Generation</span>
          </button>
        </nav>

        {/* Sidebar Footer with Quick CTA */}
        <div className="erp-sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            <Plus size={16} /> New Application
          </button>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <main className="erp-main-content">
        {/* ERP Header */}
        <header className="erp-header">
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 auto' }}>
            {!sidebarOpen && (
              <button
                className="campus-nav-toggle-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Show Navigation Menu"
                aria-label="Show Navigation Menu"
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid #000000',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                  flexShrink: 0,
                }}
              >
                <Menu size={20} color="#ffffff" stroke="#ffffff" />
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', marginBottom: '2px' }}>
                <span>Admissions &amp; Intake</span>
                <span style={{ color: '#cbd5e1' }}>/</span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>{getBreadcrumbTabLabel(activeTab)}</span>
              </div>
              <h1 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getActiveTabTitle(activeTab)}
              </h1>
            </div>
          </div>

          <div className="erp-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}
            >
              <Plus size={15} /> Register Applicant
            </button>

            <button
              className="erp-btn erp-btn-secondary"
              onClick={loadAllData}
              title="Refresh Dashboard Data"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 0.85rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: '#334155' }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>

            <div style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '5px 10px', borderRadius: '12px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
              Cycle 2026–27
            </div>

            <div className="erp-role-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              <ShieldCheck size={14} /> Senior Admissions Officer
            </div>

            {onSwitchRole && (
              <button
                type="button"
                className="role-action-btn"
                onClick={() => onSwitchRole('student')}
                title="Switch Portal Role"
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Switch Role
              </button>
            )}

            {/* User Profile Pill */}
            <div className="campus-user-pill">
              <div className="campus-user-avatar" style={{ background: '#2563eb' }}>AD</div>
              <div className="campus-user-details">
                <strong>{officerName}</strong>
                <small>Admissions Officer</small>
              </div>
              <button
                className="campus-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Views Container */}
        <div className="role-dash-container" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ==========================================================
            A. WELCOME BANNER (Blue/Indigo Gradient with Real Task Indicator)
            ========================================================== */}
        <section className="dash-hero dash-hero-morning" aria-label="Welcome Banner" style={{ padding: '24px 28px' }}>
          <div className="dash-hero-glow" aria-hidden="true" />
          <div className="dash-hero-main">
            <p className="dash-hero-kicker">
              <Sparkles size={14} /> AUTONOMOUS ADMISSIONS OFFICE · OJEE / JEE CENTRAL
            </p>
            <h2 className="dash-hero-title" style={{ fontSize: '1.65rem', margin: '6px 0' }}>
              Welcome, {officerName}
            </h2>
            <p className="dash-hero-caption" style={{ maxWidth: '800px', fontSize: '0.88rem' }}>
              Manage candidate applications, conduct multi-tier academic document verification, publish admission offers, and execute atomic student enrollment into autonomous engineering and management streams.
            </p>

            <div className="dash-motd" role="note" style={{ marginTop: '14px', background: 'rgba(255,255,255,0.18)', borderRadius: '10px' }}>
              <span className="dash-motd-icon">
                <Megaphone size={14} />
              </span>
              <strong>Active Intake Phase</strong>
              <span>
                Academic Session 2026–27 · Spot Round Document Verification & Fee Confirmation is active. {stats.pipeline.enrolled} finalized of 720 institutional intake capacity.
              </span>
            </div>
          </div>

          <div className="dash-hero-meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <span className="dash-chip" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 800 }}>
              Session 2026–2027
            </span>
            <time className="dash-date" style={{ color: '#ffffff' }}>
              <Calendar size={14} /> {todayLabel}
            </time>
            {stats.pendingTasks.length > 0 && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fef08a',
                  color: '#854d0e',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <Bell size={13} /> {stats.pendingTasks.length} Urgent Tasks Pending
              </span>
            )}
          </div>
        </section>

        {/* ==========================================================
            B. QUICK ACTIONS BAR
            ========================================================== */}
        <section className="role-quick-actions-bar" aria-label="Quick Action Shortcuts" style={{ padding: '12px 18px' }}>
          <span className="role-quick-actions-label" style={{ fontWeight: 800, color: '#1e40af' }}>
            <Zap size={15} color="#2563eb" /> Quick Actions:
          </span>
          <button
            type="button"
            className="role-quick-action-pill"
            onClick={() => navigateToFilteredApplicants({ status: 'APPLIED', tab: 'review' })}
          >
            <Users size={14} color="#2563eb" />
            <span>Review Applications ({stats.awaitingReview})</span>
          </button>

          <button
            type="button"
            className="role-quick-action-pill"
            onClick={() => navigateToFilteredApplicants({ stage: 'DOCS_PENDING', tab: 'verification' })}
          >
            <CheckCircle2 size={14} color="#059669" />
            <span>Verify Documents ({stats.documentsPending})</span>
          </button>

          <button
            type="button"
            className="role-quick-action-pill"
            onClick={() => setIsNoticeModalOpen(true)}
          >
            <Megaphone size={14} color="#7c3aed" />
            <span>Create Admission Notice</span>
          </button>

          <button
            type="button"
            className="role-quick-action-pill"
            onClick={() => setIsDeadlinesModalOpen(true)}
          >
            <Calendar size={14} color="#d97706" />
            <span>Manage Deadlines ({deadlines.length})</span>
          </button>

          <button
            type="button"
            className="role-quick-action-pill"
            onClick={() => setIsMeritModalOpen(true)}
          >
            <Award size={14} color="#2563eb" />
            <span>Merit List &amp; Allocation</span>
          </button>

          <button
            type="button"
            className="role-quick-action-pill"
            onClick={exportAdmissionCSV}
          >
            <FileSpreadsheet size={14} color="#0284c7" />
            <span>Export Report (CSV)</span>
          </button>

          <button
            type="button"
            className="role-quick-action-pill"
            onClick={() => setIsCycleModalOpen(true)}
          >
            <SlidersHorizontal size={14} color="#475569" />
            <span>Configure Cycle</span>
          </button>
        </section>

        {/* ==========================================================
            C. SUMMARY CARDS: 8 Real Database-Backed Metrics
            ========================================================== */}
        <section aria-label="Admission Dashboard Summary Metrics">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
            }}
          >
            {/* 1. Total Applications */}
            <div
              onClick={() => navigateToFilteredApplicants({ status: 'All', stage: 'All' })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Applications
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
                  <Users size={16} />
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                {stats.total}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Active 2026–27 Session</span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>View all →</span>
              </div>
            </div>

            {/* 2. Applications Awaiting Review */}
            <div
              onClick={() => navigateToFilteredApplicants({ status: 'APPLIED', stage: 'UNDER_REVIEW' })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d97706')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Awaiting Review
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', background: '#fef3c7', color: '#d97706' }}>
                  <Clock size={16} />
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
                {stats.awaitingReview}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Under eligibility review</span>
                <span style={{ color: '#d97706', fontWeight: 700 }}>Review →</span>
              </div>
            </div>

            {/* 3. Documents Pending Verification */}
            <div
              onClick={() => navigateToFilteredApplicants({ stage: 'DOCS_PENDING' })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ea580c')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Documents Pending
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', background: '#ffedd5', color: '#ea580c' }}>
                  <FileText size={16} />
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>
                {stats.documentsPending}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Replacement or review needed</span>
                <span style={{ color: '#ea580c', fontWeight: 700 }}>Verify →</span>
              </div>
            </div>

            {/* 4. Approved Applications */}
            <div
              onClick={() => navigateToFilteredApplicants({ status: 'APPROVED' })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#059669')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Approved for Admission
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
                  <Award size={16} />
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                {stats.approved}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Awaiting offer acceptance/fee</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>View →</span>
              </div>
            </div>

            {/* 5. Offers Awaiting Acceptance */}
            <div
              onClick={() => navigateToFilteredApplicants({ stage: 'OFFER_SENT' })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7c3aed')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Offers Pending Acceptance
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed' }}>
                  <Send size={16} />
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
                {stats.offersAwaitingAcceptance}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Dispatched provisional offers</span>
                <span style={{ color: '#7c3aed', fontWeight: 700 }}>Track →</span>
              </div>
            </div>

            {/* 6. Enrolled Students */}
            <div
              onClick={() => navigateToFilteredApplicants({ status: 'ENROLLED' })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Finalized Enrolled
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
                  <ShieldCheck size={16} />
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>
                {stats.enrolled}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Roll Nos &amp; accounts active</span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>Directory →</span>
              </div>
            </div>

            {/* 7. Rejected / Withdrawn */}
            <div
              onClick={() => navigateToFilteredApplicants({ status: 'REJECTED' })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#e11d48')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Rejected / Withdrawn
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', background: '#ffe4e6', color: '#e11d48' }}>
                  <AlertCircle size={16} />
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#e11d48', marginTop: '6px' }}>
                {stats.rejected}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Documented reasons</span>
                <span style={{ color: '#e11d48', fontWeight: 700 }}>View →</span>
              </div>
            </div>

            {/* 8. Incomplete Applications */}
            <div
              onClick={() => navigateToFilteredApplicants({ status: 'APPLIED' })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#64748b')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Incomplete Data
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b' }}>
                  <HelpCircle size={16} />
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#475569', marginTop: '6px' }}>
                {stats.incomplete}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Missing marks or uploads</span>
                <span style={{ color: '#475569', fontWeight: 700 }}>Follow-up →</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================
            D. VISUAL ADMISSION PIPELINE FUNNEL
            ========================================================== */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
          aria-label="Visual Admission Pipeline Funnel"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Institutional Admission Pipeline &amp; Conversion Funnel
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Real-time tracking of candidate transitions from intake inquiry to confirmed university matriculation.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#2563eb' }}>
              <Sparkles size={16} /> Overall Conversion Rate: {stats.conversionRate}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
              gap: '10px',
              position: 'relative',
            }}
          >
            {[
              { key: 'submitted', label: '1. Submitted', count: stats.pipeline.submitted, color: '#0284c7', bg: '#f0f9ff' },
              { key: 'underReview', label: '2. Under Review', count: stats.pipeline.underReview, color: '#d97706', bg: '#fffbeb' },
              { key: 'docsVerified', label: '3. Docs Verified', count: stats.pipeline.docsVerified, color: '#059669', bg: '#ecfdf5' },
              { key: 'approved', label: '4. Approved', count: stats.pipeline.approved, color: '#4f46e5', bg: '#eef2ff' },
              { key: 'offerAccepted', label: '5. Offer Accepted', count: stats.pipeline.offerAccepted, color: '#7c3aed', bg: '#f5f3ff' },
              { key: 'feeConfirmed', label: '6. Fee Confirmed', count: stats.pipeline.feeConfirmed, color: '#0891b2', bg: '#ecfeff' },
              { key: 'enrolled', label: '7. Enrolled', count: stats.pipeline.enrolled, color: '#16a34a', bg: '#f0fdf4' },
            ].map((st, i) => (
              <div
                key={st.key}
                style={{
                  background: st.bg,
                  border: `1px solid ${st.color}30`,
                  borderRadius: '12px',
                  padding: '14px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: st.color, textTransform: 'uppercase' }}>
                  {st.label}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {st.count}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                  {stats.total > 0 ? `${Math.round((st.count / stats.total) * 100)}% of intake` : '0%'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={15} color="#2563eb" />
            <span>
              <strong>Crucial Academic Audit Compliance:</strong> Application Approval alone does NOT constitute completed enrollment. Candidates must accept their provisional offer and complete fee clearance prior to unique student registration provisioning.
            </span>
          </div>
        </section>

        {/* ==========================================================
            E. HERO SPLIT: Left Officer Profile + Right Priority Action Panel
            ========================================================== */}
        <div className="dash-hero-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.25fr)', gap: '20px' }}>
          {/* LEFT: Admission Officer Profile Dossier */}
          <aside className="dash-card dash-info dash-info-hero" aria-label="Officer account information">
            <div className="dash-info-cover">
              <div className="dash-passport-photo-frame" title="Senior Admissions Officer ID">
                <img src="/passport_photo_female.svg" alt="Officer" className="dash-passport-img" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{officerName}</strong>
                <small title={officerRole}>{officerRole}</small>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                  {officerDept}
                </div>
              </div>
              <span className="dash-status">
                <i /> Active
              </span>
            </div>

            {/* Profile Sub-Sections Tabs */}
            <div className="dash-info-tab-pills" role="tablist">
              <button
                type="button"
                className={`dash-info-pill ${profileTab === 'profile' ? 'active' : ''}`}
                onClick={() => setProfileTab('profile')}
              >
                Profile Details
              </button>
              <button
                type="button"
                className={`dash-info-pill ${profileTab === 'dossier' ? 'active' : ''}`}
                onClick={() => setProfileTab('dossier')}
              >
                Intake Authority
              </button>
              <button
                type="button"
                className={`dash-info-pill ${profileTab === 'identity' ? 'active' : ''}`}
                onClick={() => setProfileTab('identity')}
              >
                Verification Badge
              </button>
            </div>

            <dl className="dash-info-list">
              {profileTab === 'profile' && (
                <>
                  <DetailRow label="Officer Code" value="EMP-ADM-2019-031" />
                  <DetailRow label="Official Designation" value="Senior Admissions & Counseling Officer" />
                  <DetailRow label="Department" value="Admissions & Student Intake Office" />
                  <DetailRow label="Institutional Desk" value="Counselling Wing · Admission Center" />
                  <DetailRow label="Contact Email" value="admissions@apnacampus.edu.in" />
                  <DetailRow label="Helpline Phone" value="+91 94370 00040" />
                </>
              )}
              {profileTab === 'dossier' && (
                <>
                  <DetailRow label="Assigned Responsibilities" value="OJEE/JEE Counseling, Document Verification, Seat Allocation" />
                  <DetailRow label="Academic Qualifications" value="MBA, PG Diploma in Educational Counseling" />
                  <DetailRow label="Years of Experience" value="9+ Years Intake & Autonomous Counseling" />
                  <DetailRow label="Reporting Authority" value="Dr. Sujit Kumar Khuntia (Principal)" />
                  <DetailRow label="Authorized Academic Term" value="2026–2027 Session" />
                </>
              )}
              {profileTab === 'identity' && (
                <>
                  <DetailRow label="Biometric ID" value="BIO-ADM-031" />
                  <DetailRow label="Aadhaar Masked" value="•••• •••• 4429" />
                  <DetailRow label="Income Tax PAN" value="•••••903R" />
                  <DetailRow label="Identity Clearance" value="Verified Institutional Staff" />
                  <DetailRow label="Active Session Status" value="On Duty · Counter Clearance Open" />
                </>
              )}
            </dl>
          </aside>

          {/* RIGHT: Priority Action Panel */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#ea580c" /> Admission Officer Priority Action Panel
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Tasks requiring immediate administrative attention, ranked by age and statutory deadline.
                </p>
              </div>
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                }}
              >
                {stats.pendingTasks.length} Urgent Items
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '340px' }}>
              {stats.pendingTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
                  <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontWeight: 700 }}>All priority admission tasks are currently cleared!</p>
                  <span style={{ fontSize: '0.78rem' }}>No backlog in document verification or offer confirmations.</span>
                </div>
              ) : (
                stats.pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: task.isOverdue ? '#fff1f2' : '#f8fafc',
                      border: task.isOverdue ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {task.isOverdue ? (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#e11d48', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                            OVERDUE
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                            PENDING
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{task.ageText}</span>
                        <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>{task.applicationNo}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{task.programme}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openApplicantDossier(task.applicantId, task.type === 'DOCUMENT_VERIFICATION' ? 'documents' : task.type === 'FEE_CONFIRMATION' ? 'fee' : task.type === 'FINAL_ENROLLMENT' ? 'enroll' : 'offer')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {task.actionLabel} →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
        )}

        {/* ==========================================================
            F. DEDICATED APPLICATIONS TABLE OR OVERVIEW TABLES
            ========================================================== */}
        {activeTab === 'applicants' && (
          /* ==========================================================
             FULL DEDICATED APPLICATIONS MANAGEMENT VIEW
             ========================================================== */
          <section
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* Header & Filter Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Admission Applications Directory
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Search, verify credentials, record faculty decisions, process offers, and finalize student matriculation.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedApplicantIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkVerify}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle2 size={16} /> Bulk Verify Selected ({selectedApplicantIds.length})
                  </button>
                )}

                <button
                  type="button"
                  onClick={exportAdmissionCSV}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  <FileSpreadsheet size={16} color="#0284c7" /> Export Filtered CSV
                </button>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px', overflowX: 'auto' }}>
              {[
                { id: 'all', label: 'All Applications', filter: { status: 'All', stage: 'All' } },
                { id: 'verification', label: `Pending Verification (${stats.documentsPending})`, filter: { stage: 'DOCS_PENDING' } },
                { id: 'review', label: `Awaiting Review (${stats.awaitingReview})`, filter: { status: 'APPLIED', stage: 'UNDER_REVIEW' } },
                { id: 'offer', label: `Offers Dispatched (${stats.offersAwaitingAcceptance})`, filter: { stage: 'OFFER_SENT' } },
                { id: 'fee', label: `Fee Confirmed (${stats.feeConfirmed})`, filter: { stage: 'FEE_CONFIRMED' } },
                { id: 'enrolled', label: `Enrolled Students (${stats.enrolled})`, filter: { status: 'ENROLLED' } },
                { id: 'rejected', label: `Rejected / Withdrawn (${stats.rejected})`, filter: { status: 'REJECTED' } },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCurrentTab(tab.id);
                    if (tab.filter.status) setStatusFilter(tab.filter.status);
                    if (tab.filter.stage) setStageFilter(tab.filter.stage);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: currentTab === tab.id ? 800 : 600,
                    fontSize: '0.82rem',
                    backgroundColor: currentTab === tab.id ? '#2563eb' : '#f1f5f9',
                    color: currentTab === tab.id ? '#ffffff' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Filters Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search name, App No, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadAllData()}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <select
                  value={progFilter}
                  onChange={(e) => setProgFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    background: '#ffffff',
                  }}
                >
                  <option value="All">All Academic Programmes</option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    background: '#ffffff',
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="APPLIED">Applied / In Review</option>
                  <option value="VERIFIED">Documents Verified</option>
                  <option value="APPROVED">Approved for Seat</option>
                  <option value="ENROLLED">Enrolled (Final)</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    background: '#ffffff',
                  }}
                >
                  <option value="createdAt">Sort: Submission Date</option>
                  <option value="meritScore">Sort: Calculated Merit Score</option>
                  <option value="twelfthMarks">Sort: 12th Board Marks</option>
                  <option value="name">Sort: Candidate Name</option>
                  <option value="applicationNo">Sort: Application ID</option>
                </select>
              </div>
            </div>

            {/* Applications Data Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 14px', width: '38px' }}>
                      <input
                        type="checkbox"
                        checked={selectedApplicantIds.length > 0 && selectedApplicantIds.length === applicants.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedApplicantIds(applicants.map((a) => a.id));
                          else setSelectedApplicantIds([]);
                        }}
                      />
                    </th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Application ID</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Applicant Name</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Program &amp; Dept</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Academic Scores</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Admission Stage</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Fee Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <Users size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                        <p style={{ margin: 0, fontWeight: 700 }}>No admission applications found matching this criteria.</p>
                        <span style={{ fontSize: '0.78rem' }}>Try clearing filters or search parameters.</span>
                      </td>
                    </tr>
                  ) : (
                    applicants.map((app) => {
                      const isSelected = selectedApplicantIds.includes(app.id);
                      return (
                        <tr
                          key={app.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                          }}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedApplicantIds((prev) => [...prev, app.id]);
                                else setSelectedApplicantIds((prev) => prev.filter((id) => id !== app.id));
                              }}
                            />
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontWeight: 800, color: '#1e40af' }}>{app.applicationNo}</span>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {app.phone} · {app.email}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {app.programmeName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Category: <strong>{app.category}</strong> · {app.academicYear}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontSize: '0.78rem' }}>
                              10th: <strong>{app.tenthMarks || '—'}%</strong> · 12th: <strong>{app.twelfthMarks || '—'}%</strong>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                              Merit Score: {app.meritScore || '—'}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            {app.stage === 'ENROLLED' ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Enrolled
                              </span>
                            ) : app.stage === 'FEE_CONFIRMED' ? (
                              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Fee Paid
                              </span>
                            ) : app.stage === 'OFFER_ACCEPTED' ? (
                              <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Offer Accepted
                              </span>
                            ) : app.stage === 'OFFER_SENT' ? (
                              <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Offer Sent
                              </span>
                            ) : app.stage === 'APPROVED' ? (
                              <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Approved
                              </span>
                            ) : app.stage === 'DOCS_PENDING' ? (
                              <span style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Docs Pending
                              </span>
                            ) : app.stage === 'REJECTED' ? (
                              <span style={{ background: '#ffe4e6', color: '#be123c', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Rejected
                              </span>
                            ) : (
                              <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Under Review
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                color: app.feeStatus === 'Paid' ? '#059669' : '#d97706',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            >
                              {app.feeStatus === 'Paid' ? `₹${(app.feePaid || 40000).toLocaleString('en-IN')} Paid` : 'Pending'}
                            </span>
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => openApplicantDossier(app.id, 'personal')}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              Open Dossier →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.82rem', color: '#64748b' }}>
              <div>
                Showing <strong>{applicants.length}</strong> of <strong>{totalApplicantsCount}</strong> total applications
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage <= 1 ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>
                <span>Page {currentPage}</span>
                <button
                  type="button"
                  disabled={applicants.length < pageSize}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: applicants.length < pageSize ? 'not-allowed' : 'pointer',
                    opacity: applicants.length < pageSize ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}


        {/* ==========================================================
            VIEW 3: DEDICATED DOCUMENT VERIFICATION WORKBENCH
            ========================================================== */}
        {activeTab === 'verification' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Academic Screening &amp; Compliance
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Document Verification Queue
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Multi-tier verification of OJEE / JEE rank cards, 10th &amp; 12th board certificates, and reservation credentials for autonomous admission.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleBulkVerify}
                    disabled={selectedApplicantIds.length === 0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: selectedApplicantIds.length > 0 ? '#059669' : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: selectedApplicantIds.length > 0 ? 'pointer' : 'not-allowed',
                      boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
                    }}
                  >
                    <CheckCircle2 size={16} /> Bulk Verify Selected ({selectedApplicantIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={exportAdmissionCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={15} /> Export Verification List
                  </button>
                </div>
              </div>

              {/* KPI Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309' }}>Pending Verification</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{stats.documentsPending}</div>
                  <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '2px' }}>Awaiting officer verification</div>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857' }}>Verified Documents</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{stats.pipeline.docsVerified}</div>
                  <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '2px' }}>Cleared for faculty review</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1d4ed8' }}>Total Processed</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{stats.total}</div>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', marginTop: '2px' }}>Current intake session</div>
                </div>
              </div>
            </div>

            {/* Verification Cards Queue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {applicants.filter(a => a.stage === 'DOCS_PENDING' || a.status?.includes('Pending') || a.stage === 'APPLIED').length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center' }}>
                  <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>All Uploaded Documents Verified!</h3>
                  <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    There are no pending documents in the verification backlog for this session.
                  </p>
                </div>
              ) : (
                applicants
                  .filter(a => a.stage === 'DOCS_PENDING' || a.status?.includes('Pending') || a.stage === 'APPLIED')
                  .map((app) => (
                    <div
                      key={app.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        padding: '20px 24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={selectedApplicantIds.includes(app.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedApplicantIds(prev => [...prev, app.id]);
                              else setSelectedApplicantIds(prev => prev.filter(id => id !== app.id));
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem',
                            }}
                          >
                            {app.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{app.name}</strong>
                              <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                {app.applicationNo}
                              </span>
                              <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                {app.category || 'General'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                              {app.programmeName} · OJEE/JEE Rank: {app.entranceRank || 'Direct'} · 10th: {app.tenthMarks}% · 12th: {app.twelfthMarks}%
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openApplicantDossier(app.id, 'documents')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={15} /> Inspect Documents
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await api.bulkVerifyDocuments([app.id]);
                              showToast(`Documents for ${app.name} officially verified!`);
                              loadAllData();
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#059669',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
                            }}
                          >
                            <CheckCircle2 size={15} /> Verify All Docs
                          </button>
                        </div>
                      </div>

                      {/* Document Status Pills */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        {[
                          { name: '10th Marksheet & Board Cert', status: 'VERIFIED' },
                          { name: '12th Science Marksheet', status: app.stage === 'DOCS_PENDING' ? 'PENDING' : 'VERIFIED' },
                          { name: 'JEE Main / OJEE Rank Card', status: 'VERIFIED' },
                          { name: 'College Leaving Cert (CLC)', status: 'PENDING' },
                          { name: 'Migration Certificate', status: 'PENDING' },
                          { name: 'Caste / Quota Certificate', status: app.category === 'General' ? 'NOT_APPLICABLE' : 'VERIFIED' },
                        ].map((doc, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>{doc.name}</span>
                            <span
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                background: doc.status === 'VERIFIED' ? '#ecfdf5' : doc.status === 'PENDING' ? '#fffbeb' : '#f1f5f9',
                                color: doc.status === 'VERIFIED' ? '#047857' : doc.status === 'PENDING' ? '#b45309' : '#64748b',
                                border: `1px solid ${doc.status === 'VERIFIED' ? '#a7f3d0' : doc.status === 'PENDING' ? '#fde68a' : '#cbd5e1'}`,
                              }}
                            >
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 4: DEDICATED REVIEW & DECISIONS WORKBENCH
            ========================================================== */}
        {activeTab === 'review' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Faculty Admission Committee
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Review &amp; Admission Decisions
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Evaluate candidate merit criteria, conduct departmental scrutiny, record official clearance, or assign waitlist rank.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsMeritModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    <SlidersHorizontal size={15} /> Merit Analysis &amp; Cut-offs
                  </button>
                </div>
              </div>

              {/* KPI Review Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6d28d9' }}>Awaiting Review</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>{stats.awaitingReview}</div>
                  <div style={{ fontSize: '0.72rem', color: '#5b21b6', marginTop: '2px' }}>Faculty panel assigned</div>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857' }}>Approved by Committee</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{stats.approved}</div>
                  <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '2px' }}>Offers ready for release</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1d4ed8' }}>Conversion Rate</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{stats.conversionRate}</div>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', marginTop: '2px' }}>Lead to matriculation</div>
                </div>
              </div>
            </div>

            {/* Candidates Queue for Review */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {applicants.filter(a => a.stage === 'UNDER_REVIEW' || a.stage === 'DOCS_VERIFIED' || a.status === 'APPLIED').map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{app.name}</strong>
                      <span style={{ fontSize: '0.72rem', background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {app.applicationNo}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        Score: {app.meritScore || '—'} / 100
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                      Programme: <strong>{app.programmeName}</strong> · 10th: {app.tenthMarks}% · 12th: {app.twelfthMarks}% · Entrance: {app.entranceExam} (Rank #{app.entranceRank})
                    </div>
                    {app.reviewNotes && (
                      <div style={{ fontSize: '0.75rem', color: '#6b21a8', background: '#faf5ff', padding: '4px 10px', borderRadius: '6px', marginTop: '6px', border: '1px solid #f3e8ff' }}>
                        Reviewer Note: {app.reviewNotes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => openApplicantDossier(app.id, 'review')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(124,58,237,0.25)',
                      }}
                    >
                      <Award size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Review &amp; Decide
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.reviewApplicant(app.id, { decision: 'APPROVE', notes: 'Quick approved by Senior Admissions Officer' });
                        showToast(`Application #${app.applicationNo} officially approved!`);
                        loadAllData();
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Quick Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 5: DEDICATED OFFER LETTERS & ACCEPTANCE TRACKER
            ========================================================== */}
        {activeTab === 'offers' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Candidate Admissions Dispatch
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Offer Letters &amp; Candidate Acceptance Tracker
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Issue provisional seat allotment letters, monitor validity deadlines, and track real-time candidate offer acceptances.
                  </p>
                </div>
              </div>

              {/* KPI Offers Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0369a1' }}>Offers Dispatched</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{stats.offersAwaitingAcceptance + stats.offersAccepted}</div>
                  <div style={{ fontSize: '0.72rem', color: '#075985', marginTop: '2px' }}>Provisional allotment letters</div>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857' }}>Candidate Accepted</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{stats.offersAccepted}</div>
                  <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '2px' }}>Ready for seat fee payment</div>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309' }}>Awaiting Candidate Action</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{stats.offersAwaitingAcceptance}</div>
                  <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '2px' }}>Within validity window</div>
                </div>
              </div>
            </div>

            {/* Offers Table */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Application No</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Candidate Name</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Program</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Offer Validity</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants
                      .filter(a => a.stage === 'OFFER_ISSUED' || a.stage === 'OFFER_ACCEPTED' || a.stage === 'APPROVED' || a.status === 'APPROVED')
                      .map((app) => (
                        <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#2563eb' }}>{app.applicationNo}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{app.name}</td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>{app.programmeName}</td>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>
                            {app.offerValidUntil ? new Date(app.offerValidUntil).toLocaleDateString('en-IN') : '2026-10-31'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: app.stage === 'OFFER_ACCEPTED' ? '#ecfdf5' : '#e0f2fe',
                                color: app.stage === 'OFFER_ACCEPTED' ? '#047857' : '#0369a1',
                              }}
                            >
                              {app.stage === 'OFFER_ACCEPTED' ? 'Offer Accepted' : 'Offer Dispatched'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => openApplicantDossier(app.id, 'offer')}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                }}
                              >
                                View Offer Letter
                              </button>
                              {app.stage !== 'OFFER_ACCEPTED' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await api.respondToOffer(app.id, { action: 'ACCEPT' });
                                    showToast(`Candidate offer marked as Accepted!`);
                                    loadAllData();
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    background: '#059669',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Record Accepted
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 6: DEDICATED FEE CLEARANCE & LEDGER
            ========================================================== */}
        {activeTab === 'fee' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Institutional Accounts &amp; Treasury
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Seat Acceptance Fee &amp; Ledger
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Collect ₹40,000 provisional seat acceptance fee, reconcile SBI e-Collect / NEFT UTR references, and issue official admission receipts.
                  </p>
                </div>
              </div>

              {/* KPI Fee Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857' }}>Total Confirmed Collections</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    ₹{(stats.feeConfirmed * 40000).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '2px' }}>{stats.feeConfirmed} payments verified</div>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309' }}>Pending Seat Acceptance Fees</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    ₹{(stats.offersAccepted * 40000).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '2px' }}>{stats.offersAccepted} accepted candidates</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1d4ed8' }}>Standard Seat Fee</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>₹40,000</div>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', marginTop: '2px' }}>Autonomous intake deposit</div>
                </div>
              </div>
            </div>

            {/* Fee Ledger Table */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Application No</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Candidate Name</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Programme</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Fee Amount</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Payment Status</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Bank Reference (UTR)</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants
                      .filter(a => a.stage === 'FEE_CONFIRMED' || a.stage === 'OFFER_ACCEPTED' || a.stage === 'ENROLLED' || a.feePaid > 0)
                      .map((app) => (
                        <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#2563eb' }}>{app.applicationNo}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{app.name}</td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>{app.programmeName}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                            ₹{(app.feePaid || 40000).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: app.feeStatus === 'Confirmed' || app.feePaid > 0 ? '#ecfdf5' : '#fffbeb',
                                color: app.feeStatus === 'Confirmed' || app.feePaid > 0 ? '#047857' : '#b45309',
                              }}
                            >
                              {app.feeStatus === 'Confirmed' || app.feePaid > 0 ? 'Confirmed' : 'Pending Payment'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.78rem' }}>
                            {app.feeReceiptRef || 'SBI E-Collect UTR-78921'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => openApplicantDossier(app.id, 'fee')}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              Clearance Voucher
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 7: DEDICATED STUDENT ENROLLMENT & MATRICULATION
            ========================================================== */}
        {activeTab === 'enrollment' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    University Matriculation &amp; Student Registration
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Student Enrollment &amp; Account Provisioning
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Finalize candidate enrollment via atomic transaction: creates official Student profile, assigns Registration/Roll Number, and activates student login portal.
                  </p>
                </div>
              </div>

              {/* KPI Enrollment Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857' }}>Enrolled Students</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{stats.enrolled}</div>
                  <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '2px' }}>Fully provisioned accounts</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1d4ed8' }}>Ready for Enrollment</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{stats.feeConfirmed}</div>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', marginTop: '2px' }}>Fee confirmed candidates</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>Total Intake Capacity</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>720</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Approved AICTE seats</div>
                </div>
              </div>
            </div>

            {/* Candidates Queue for Final Enrollment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {applicants
                .filter(a => a.stage === 'FEE_CONFIRMED' || a.stage === 'ENROLLED' || a.status === 'ENROLLED')
                .map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '20px 24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{app.name}</strong>
                        <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {app.applicationNo}
                        </span>
                        {app.studentId && (
                          <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                            Roll No: {app.studentId}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                        Programme: <strong>{app.programmeName}</strong> · Fee: ₹{(app.feePaid || 40000).toLocaleString('en-IN')} (Confirmed)
                      </div>
                    </div>

                    <div>
                      {app.status === 'ENROLLED' || app.studentId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={16} /> Enrolled &amp; Active
                          </span>
                          <button
                            type="button"
                            onClick={() => openApplicantDossier(app.id, 'enroll')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            View Student Dossier
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Finalize enrollment for ${app.name}? This will provision their official Student record and generate login credentials.`)) return;
                            const res = await api.approveAndEnrollApplicant(app.id);
                            if (res && res.success && res.data) {
                              setEnrolledStudentInfo(res.data);
                              showToast(`Student ${res.data.name} enrolled successfully! Student ID: ${res.data.studentId}`);
                              loadAllData();
                            } else {
                              alert(res?.message || 'Enrollment failed.');
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 18px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                          }}
                        >
                          <ShieldCheck size={16} /> Finalize &amp; Provision Student Account
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 8: DEDICATED ADMISSION DEADLINES & MILESTONES
            ========================================================== */}
        {activeTab === 'deadlines' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Academic Calendar &amp; Statutory Deadlines
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Milestones &amp; Deadlines
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Configure cut-off dates for online registration, document verification, seat withdrawal, and spot round counseling.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeadlinesModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  }}
                >
                  <Plus size={16} /> Add Admission Deadline
                </button>
              </div>
            </div>

            {/* Deadlines Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {deadlines.map((d) => (
                <div
                  key={d.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px' }}>
                        {d.category}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb' }}>
                        {d.deadlineDate}
                      </span>
                    </div>
                    <h3 style={{ margin: '10px 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {d.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      {d.description || 'Statutory intake milestone for all autonomous engineering streams.'}
                    </p>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '10px' }}>
                      Applicable: {d.programmeCode || 'All Programmes'} · Closing Time: {d.time || '05:00 PM'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Delete deadline "${d.title}"?`)) return;
                        await api.deleteAdmissionDeadline(d.id);
                        showToast('Deadline removed.');
                        loadAllData();
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Delete Milestone
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 9: DEDICATED CIRCULARS & NOTICES BOARD
            ========================================================== */}
        {activeTab === 'notices' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Official Circulars &amp; Public Bulletins
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Notices &amp; Announcements
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Publish official admission circulars, spot round rules, scholarship guidelines, and fee concession notifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                  }}
                >
                  <Plus size={16} /> Publish New Notice
                </button>
              </div>
            </div>

            {/* Notices List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {notices.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px' }}>
                        {n.tag || 'ADMISSION'}
                      </span>
                      {n.pinned && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef08a', color: '#854d0e', padding: '3px 8px', borderRadius: '4px' }}>
                          PINNED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Published: {n.date}</span>
                  </div>
                  <h3 style={{ margin: '10px 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {n.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                    {n.summary}
                  </p>
                  {n.content && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', borderLeft: '3px solid #2563eb' }}>
                      {n.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 10: DEDICATED MERIT LIST & SEAT ALLOCATION
            ========================================================== */}
        {activeTab === 'merit' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Autonomous Admissions Engine
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Merit List &amp; Seat Allocation Analysis
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Calculated composite ranking based on formula: (35% × 10th Marks) + (55% × 12th Science) + (Normalized Entrance Exam Rank Factor).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportAdmissionCSV}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={15} /> Export Official Merit CSV
                </button>
              </div>
            </div>

            {/* Merit Table */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Merit Rank</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Application No</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Candidate Name</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>10th Marks</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>12th Marks</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Entrance Exam</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Merit Score</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Seat Allotment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(meritList.length > 0 ? meritList : applicants
                      .map((a, idx) => ({ ...a, calcRank: idx + 1 }))
                      .sort((a, b) => (Number(b.meritScore) || 0) - (Number(a.meritScore) || 0)))
                      .map((app, index) => {
                        const rank = app.meritRank || index + 1;
                        return (
                          <tr key={app.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: rank <= 3 ? '#d97706' : '#0f172a' }}>
                              #{rank}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>{app.applicationNo}</td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                              {app.name}
                              {app.eligibilityStatus && (
                                <span style={{ marginLeft: '8px', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: app.eligibilityStatus === 'Eligible' ? '#dcfce7' : '#fef3c7', color: app.eligibilityStatus === 'Eligible' ? '#15803d' : '#b45309', fontWeight: 700 }}>
                                  {app.eligibilityStatus}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#334155' }}>{app.tenthMarks ? `${app.tenthMarks}%` : '—'}</td>
                            <td style={{ padding: '12px 14px', color: '#334155' }}>{app.twelfthMarks ? `${app.twelfthMarks}%` : '—'}</td>
                            <td style={{ padding: '12px 14px', color: '#64748b' }}>
                              {app.entranceExam || 'JEE'}: Rank {app.entranceRank || 'Direct'}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: '#2563eb' }}>
                              {app.meritScore || '—'} / 100
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                {app.programmeName?.split(' ')[0] || 'B.Tech'} Regular Allotment
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 11: DEDICATED REPORT GENERATION & ANALYTICS
            ========================================================== */}
        {activeTab === 'reports' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Statutory &amp; Autonomous Admissions Auditing
                </span>
                <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  Admission Intelligence &amp; Report Generation
                </h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Generate regulatory AICTE &amp; State Higher Education compliance reports, admission pipeline funnels, and category reservation distribution manifests.
                </p>
              </div>

              {/* 3 Instant CSV Exports */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Admission Census Report</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                    Complete list of all candidate applications with full contact, academic scores, and verification stages.
                  </div>
                  <button
                    type="button"
                    onClick={exportAdmissionCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      marginTop: '12px',
                    }}
                  >
                    <Download size={14} /> Download Census CSV
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Pipeline Funnel Conversion</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                    Conversion drop-off across all 7 stages from registration to final university matriculation.
                  </div>
                  <button
                    type="button"
                    onClick={exportPipelineFunnelCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      marginTop: '12px',
                    }}
                  >
                    <Download size={14} /> Download Funnel CSV
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Category Quota Distribution</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                    General, OBC, SC, ST, EWS quota breakdown and compliance with state statutory reservation norms.
                  </div>
                  <button
                    type="button"
                    onClick={exportCategoryDistributionCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      marginTop: '12px',
                    }}
                  >
                    <Download size={14} /> Download Category CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Integrated Standard Report Generation Module */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <ReportGenerationModule account={account} role="admissions" />
            </div>
          </section>
        )}

        </div>
      </main>

      {/* ==========================================================
          MODALS ECOSYSTEM
          ========================================================== */}

      {/* 1. APPLICATION DOSSIER & WORKFLOW DETAILS MODAL */}
      {isDossierModalOpen && selectedApplicant && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{selectedApplicant.name}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                    {selectedApplicant.applicationNo}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                    Stage: {selectedApplicant.stage}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {selectedApplicant.programmeName} · Session {selectedApplicant.academicYear} · Merit Score: {selectedApplicant.meritScore || '—'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDossierModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '0 20px', overflowX: 'auto' }}>
              {[
                { id: 'personal', label: '1. Personal Details' },
                { id: 'academic', label: '2. Academic Qualifications' },
                { id: 'documents', label: `3. Documents Verification (${(selectedApplicant.documents || []).length})` },
                { id: 'review', label: '4. Decision & Scrutiny' },
                { id: 'offer', label: '5. Offer Letter' },
                { id: 'fee', label: '6. Fee Confirmation' },
                { id: 'enroll', label: '7. Final Enrollment' },
                { id: 'audit', label: '8. Audit History' },
              ].map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setDossierActiveTab(tb.id)}
                  style={{
                    padding: '12px 16px',
                    fontWeight: dossierActiveTab === tb.id ? 800 : 600,
                    fontSize: '0.82rem',
                    background: dossierActiveTab === tb.id ? '#ffffff' : 'transparent',
                    color: dossierActiveTab === tb.id ? '#2563eb' : '#64748b',
                    border: 'none',
                    borderBottom: dossierActiveTab === tb.id ? '2px solid #2563eb' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* TAB 1: PERSONAL DETAILS */}
              {dossierActiveTab === 'personal' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Candidate Identity &amp; Contact Records
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <DetailRow label="Full Legal Name" value={selectedApplicant.name} />
                    <DetailRow label="Date of Birth" value={selectedApplicant.dob || '—'} />
                    <DetailRow label="Gender" value={selectedApplicant.gender} />
                    <DetailRow label="Reservation Category" value={selectedApplicant.category} />
                    <DetailRow label="Primary Phone" value={selectedApplicant.phone} />
                    <DetailRow label="Registered Email" value={selectedApplicant.email} />
                    <DetailRow label="Father / Guardian Name" value={selectedApplicant.guardianName || '—'} />
                    <DetailRow label="Guardian Phone" value={selectedApplicant.guardianPhone || '—'} />
                    <DetailRow label="Residential Address" value={selectedApplicant.address || '—'} />
                    <DetailRow label="City & State" value={`${selectedApplicant.city || 'Bhubaneswar'}, ${selectedApplicant.state || 'Odisha'}`} />
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC QUALIFICATIONS */}
              {dossierActiveTab === 'academic' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Prior Educational Record &amp; Entrance Rankings
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <DetailRow label="Previous School / College" value={selectedApplicant.previousSchool || 'Senior Secondary School'} />
                    <DetailRow label="Class 10th / Matriculation Marks" value={`${selectedApplicant.tenthMarks || '—'}%`} />
                    <DetailRow label="Class 12th / Intermediate Marks" value={`${selectedApplicant.twelfthMarks || '—'}%`} />
                    <DetailRow label="Entrance Exam Taken" value={selectedApplicant.entranceExam || 'Direct Merit'} />
                    <DetailRow label="Entrance Exam Rank / Score" value={selectedApplicant.entranceRank ? `#${selectedApplicant.entranceRank}` : 'Direct Intake'} />
                    <DetailRow label="Calculated Institutional Merit Score" value={`${selectedApplicant.meritScore || '—'} / 100`} />
                    <DetailRow label="Allotted Program" value={selectedApplicant.programmeName} />
                    <DetailRow label="Target Academic Session" value={selectedApplicant.academicYear} />
                  </div>
                </div>
              )}

              {/* TAB 3: DOCUMENTS VERIFICATION CHECKLIST */}
              {dossierActiveTab === 'documents' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Mandatory Document Scrutiny &amp; Verification Workflow
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      All items marked (Mandatory) must be verified prior to formal seat approval.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(selectedApplicant.documents || []).map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          background: doc.status === 'VERIFIED' ? '#f0fdf4' : doc.status === 'REPLACEMENT_REQUESTED' ? '#fff7ed' : '#ffffff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{doc.name}</span>
                            {doc.isRequired && (
                              <span style={{ marginLeft: '6px', fontSize: '0.68rem', fontWeight: 800, color: '#e11d48' }}>
                                (Mandatory)
                              </span>
                            )}
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                              File: {doc.fileName || 'Not Uploaded'} {doc.fileSize ? `(${doc.fileSize})` : ''}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: doc.status === 'VERIFIED' ? '#dcfce7' : doc.status === 'REPLACEMENT_REQUESTED' ? '#ffedd5' : '#f1f5f9',
                                color: doc.status === 'VERIFIED' ? '#15803d' : doc.status === 'REPLACEMENT_REQUESTED' ? '#c2410c' : '#475569',
                              }}
                            >
                              {doc.status}
                            </span>

                            {doc.fileName && (
                              <button
                                type="button"
                                onClick={() => setPreviewDocument(doc)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Eye size={13} /> View File
                              </button>
                            )}

                            {doc.status !== 'VERIFIED' && (
                              <button
                                type="button"
                                onClick={() => handleVerifyDocument(doc.id, 'VERIFIED', 'Verified against council records.')}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                ✓ Verify
                              </button>
                            )}

                            {doc.status !== 'REPLACEMENT_REQUESTED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = window.prompt(`Request replacement for ${doc.name}:`, 'Scan is blurry or incomplete');
                                  if (reason) handleVerifyDocument(doc.id, 'REPLACEMENT_REQUESTED', 'Clarification required', reason);
                                }}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#fff7ed',
                                  color: '#c2410c',
                                  border: '1px solid #fed7aa',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Request Replacement
                              </button>
                            )}
                          </div>
                        </div>

                        {doc.remarks && (
                          <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#475569', background: 'rgba(0,0,0,0.02)', padding: '6px 10px', borderRadius: '6px' }}>
                            <strong>Verification Note:</strong> {doc.remarks} {doc.verifiedBy ? `— by ${doc.verifiedBy}` : ''}
                          </div>
                        )}

                        {doc.replacementReason && (
                          <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#b91c1c', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>
                            <strong>Replacement Note to Applicant:</strong> {doc.replacementReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DECISION & WORKFLOW */}
              {dossierActiveTab === 'review' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Review &amp; Statutory Seat Decision
                  </h4>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Eligibility Scrutiny Summary
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                      • Minimum Aggregate Criteria: 60% in qualifying board (Candidate: {selectedApplicant.twelfthMarks || 0}%)<br />
                      • Mandatory Document Clearance: {(selectedApplicant.documents || []).filter((d) => d.isRequired && d.status === 'VERIFIED').length} of {(selectedApplicant.documents || []).filter((d) => d.isRequired).length} verified.<br />
                      • Current Application Stage: <strong>{selectedApplicant.stage}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Reviewer Observations &amp; Decision Remarks
                      </label>
                      <textarea
                        rows={3}
                        value={reviewForm.notes}
                        onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                        placeholder="Add verification and approval notes regarding seat quota, lateral eligibility..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
                      <input
                        type="checkbox"
                        id="bypassIncomplete"
                        checked={reviewForm.bypassIncompleteDocs}
                        onChange={(e) => setReviewForm({ ...reviewForm, bypassIncompleteDocs: e.target.checked })}
                      />
                      <label htmlFor="bypassIncomplete" style={{ cursor: 'pointer' }}>
                        Record authorized institutional provisional exception (e.g. awaiting final board marksheets)
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleRecordDecision('APPROVE')}
                        style={{
                          padding: '10px 18px',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Approve Application for Admission
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const r = window.prompt('Documented Rejection Reason:', 'Does not satisfy autonomous qualifying criteria');
                          if (r) {
                            setReviewForm((prev) => ({ ...prev, reason: r }));
                            handleRecordDecision('REJECT');
                          }
                        }}
                        style={{
                          padding: '10px 18px',
                          background: '#fff1f2',
                          color: '#e11d48',
                          border: '1px solid #fecdd3',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✗ Reject Application
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRecordDecision('WAITLIST')}
                        style={{
                          padding: '10px 18px',
                          background: '#f8fafc',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                        }}
                      >
                        Place on Waitlist
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: OFFER LETTER */}
              {dossierActiveTab === 'offer' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Official Provisional Admission Offer
                    </h4>
                    {selectedApplicant.offerLetterGenerated && (
                      <button
                        type="button"
                        onClick={() => window.print()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Printer size={14} /> Print Letter
                      </button>
                    )}
                  </div>

                  {selectedApplicant.status !== 'APPROVED' && selectedApplicant.status !== 'ENROLLED' ? (
                    <div style={{ padding: '24px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', color: '#b45309', fontSize: '0.84rem' }}>
                      Application must be in <strong>APPROVED</strong> status before an admission offer letter can be generated. Please approve the candidate under the Decision tab first.
                    </div>
                  ) : (
                    <div>
                      {/* Printable Letter Container */}
                      <div
                        style={{
                          border: '2px solid #cbd5e1',
                          borderRadius: '12px',
                          padding: '30px',
                          background: '#ffffff',
                          fontFamily: 'serif',
                          lineHeight: 1.6,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '20px' }}>
                          <h2 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#1e3a8a' }}>
                            Apna Campus College of Engineering &amp; Technology
                          </h2>
                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            Autonomous Institution Accredited by NAAC Grade ‘A+’ · Approved by AICTE, New Delhi
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '6px', textDecoration: 'underline' }}>
                            PROVISIONAL ADMISSION OFFER LETTER — ACADEMIC YEAR {selectedApplicant.academicYear}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '14px' }}>
                          <div>
                            <strong>Ref No:</strong> AC-ADM-{selectedApplicant.applicationNo}<br />
                            <strong>Date of Issue:</strong> {new Date().toLocaleDateString('en-IN')}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong>Offer Valid Until:</strong> {selectedApplicant.offerValidUntil || offerForm.validUntil}
                          </div>
                        </div>

                        <p style={{ fontSize: '0.86rem' }}>
                          Dear <strong>{selectedApplicant.name}</strong>,
                        </p>
                        <p style={{ fontSize: '0.84rem' }}>
                          We are pleased to inform you that based on your performance in qualifying examination / entrance counseling, you have been provisionally granted admission to the following program:
                        </p>

                        <div style={{ background: '#f8fafc', padding: '12px 18px', borderRadius: '8px', margin: '14px 0', fontSize: '0.84rem', borderLeft: '4px solid #2563eb' }}>
                          <strong>Offered Program:</strong> {selectedApplicant.programmeName}<br />
                          <strong>Admission Category:</strong> {selectedApplicant.category}<br />
                          <strong>Session:</strong> {selectedApplicant.academicYear} (Semester 1 Intake)<br />
                          <strong>Prescribed Package:</strong> ₹{(selectedApplicant.feeAmount || 40000).toLocaleString('en-IN')}
                        </div>

                        <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                          Please confirm your acceptance of this offer and deposit the initial semester package prior to the validity deadline to ensure seat allotment. Failure to respond before the validity date will cause the offer to lapse.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '0.82rem' }}>
                          <div>
                            ____________________________<br />
                            Candidate / Guardian Signature
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            ____________________________<br />
                            <strong>Dean (Admissions &amp; Intake)</strong><br />
                            Apna Campus Autonomous Authority
                          </div>
                        </div>
                      </div>

                      {/* Offer Controls */}
                      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {!selectedApplicant.offerLetterGenerated ? (
                          <button
                            type="button"
                            onClick={handleGenerateOffer}
                            style={{
                              padding: '10px 18px',
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                            }}
                          >
                            Dispatch Provisional Offer Letter
                          </button>
                        ) : selectedApplicant.stage === 'OFFER_SENT' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOfferResponse('ACCEPT')}
                              style={{
                                padding: '10px 18px',
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Candidate Accepts Offer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOfferResponse('DECLINE')}
                              style={{
                                padding: '10px 18px',
                                background: '#fff1f2',
                                color: '#e11d48',
                                border: '1px solid #fecdd3',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✗ Candidate Declines
                            </button>
                          </>
                        ) : (
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#059669' }}>
                            ✓ Offer has been accepted by candidate on {selectedApplicant.offerAcceptedAt ? new Date(selectedApplicant.offerAcceptedAt).toLocaleDateString('en-IN') : 'Record'}.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: FEE CONFIRMATION */}
              {dossierActiveTab === 'fee' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Fee &amp; Transaction Verification
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Prescribed Fee</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        ₹{(selectedApplicant.feeAmount || 40000).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Confirmed Payment Amount</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: selectedApplicant.feeStatus === 'Paid' ? '#059669' : '#d97706', marginTop: '4px' }}>
                        ₹{(selectedApplicant.feePaid || 0).toLocaleString('en-IN')} ({selectedApplicant.feeStatus || 'Pending'})
                      </div>
                    </div>
                  </div>

                  {selectedApplicant.feeStatus === 'Paid' ? (
                    <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.88rem' }}>
                        ✓ Payment Verified &amp; Confirmed
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '4px' }}>
                        Receipt / UTR Ref: <strong>{selectedApplicant.feeReceiptRef}</strong><br />
                        Confirmed by: {selectedApplicant.feeConfirmedBy || 'Accounts Division'}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleConfirmFee} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Verified Receipt / Transaction Reference (UTR)*
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. UTR-HDFC-991823, SBI-EPAY-88124..."
                          value={feeForm.receiptRef}
                          onChange={(e) => setFeeForm({ ...feeForm, receiptRef: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Amount Deposited (₹)
                          </label>
                          <input
                            type="number"
                            value={feeForm.amount}
                            onChange={(e) => setFeeForm({ ...feeForm, amount: Number(e.target.value) })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Payment Gateway / Mode
                          </label>
                          <select
                            value={feeForm.paymentMode}
                            onChange={(e) => setFeeForm({ ...feeForm, paymentMode: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                          >
                            <option>Online Transfer (NEFT/RTGS)</option>
                            <option>SBI Collect / Institutional Gateway</option>
                            <option>Demand Draft (DD)</option>
                            <option>Cash Receipt at Accounts Counter</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        style={{
                          marginTop: '10px',
                          padding: '10px 18px',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                        }}
                      >
                        Confirm Admission Fee Payment
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 7: FINAL ENROLLMENT */}
              {dossierActiveTab === 'enroll' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Institutional Student Matriculation &amp; Account Provisioning
                  </h4>

                  {selectedApplicant.status === 'ENROLLED' ? (
                    <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#065f46', fontSize: '1rem' }}>
                        <ShieldCheck size={20} /> Student Enrollment Finalized!
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#047857', marginTop: '6px' }}>
                        Permanent Roll Number: <strong>{selectedApplicant.studentId ? `STU-26-000${selectedApplicant.studentId.slice(-1)}` : 'Enrolled'}</strong><br />
                        Approved By: {selectedApplicant.approvedBy || 'Dean Admissions'}<br />
                        Student LMS Portal Account provisioned with Role STUDENT.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                        Executing final enrollment will atomically:
                        <br />1. Generate institutional Registration Number and Roll Number.
                        <br />2. Create permanent <strong>Student</strong> database record.
                        <br />3. Create Semester 1 <strong>StudentEnrollment</strong> entry.
                        <br />4. Provision <strong>User</strong> login credentials with cryptographic activation token.
                        <br />5. Mark applicant status as <strong>ENROLLED</strong> and log audit trail.
                      </p>

                      <div style={{ marginTop: '16px', padding: '14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e' }}>
                        <strong>Validation Guard:</strong> Fee must be confirmed or candidate offer approved before final enrollment is finalized.
                      </div>

                      <button
                        type="button"
                        onClick={handleFinalizeEnrollment}
                        style={{
                          marginTop: '20px',
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                        }}
                      >
                        ⚡ Finalize Student Enrollment &amp; Issue Roll Number
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: AUDIT HISTORY */}
              {dossierActiveTab === 'audit' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Immutable Compliance Audit Trail &amp; Lifecycle Timeline
                  </h4>
                  {(selectedApplicant.history || []).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                      No audit history entries recorded yet for this applicant.
                    </div>
                  ) : (
                    <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Vertical connecting line */}
                      <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: '#e2e8f0' }} />
                      {(selectedApplicant.history || []).map((ev, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          {/* Dot on line */}
                          <div style={{
                            position: 'absolute',
                            left: '-24px',
                            top: '4px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: ev.action?.includes('ENROLL') ? '#10b981' : ev.action?.includes('REJECT') ? '#ef4444' : ev.action?.includes('OFFER') ? '#8b5cf6' : ev.action?.includes('FEE') ? '#059669' : '#2563eb',
                            border: '3px solid #ffffff',
                            boxShadow: '0 0 0 2px #cbd5e1'
                          }} />
                          <div style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                                {ev.action}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {new Date(ev.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}, {new Date(ev.timestamp).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                              Actor: {ev.user}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                              {ev.note}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. REGISTER NEW APPLICANT MODAL */}
      {isRegisterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Register New Student Applicant
              </h3>
              <button type="button" onClick={() => setIsRegisterModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewApplicant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Full Legal Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={newApplicantForm.name}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address*
                  </label>
                  <input
                    type="email"
                    required
                    value={newApplicantForm.email}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    required
                    value={newApplicantForm.phone}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Gender
                  </label>
                  <select
                    value={newApplicantForm.gender}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={newApplicantForm.category}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                  >
                    <option>General</option>
                    <option>OBC</option>
                    <option>SC</option>
                    <option>ST</option>
                    <option>EWS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Target Academic Programme*
                </label>
                <select
                  value={newApplicantForm.programmeName}
                  onChange={(e) => {
                    const sel = programmes.find((p) => p.name === e.target.value);
                    setNewApplicantForm({
                      ...newApplicantForm,
                      programmeName: e.target.value,
                      programmeId: sel?.id || '',
                    });
                  }}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    10th Marks (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newApplicantForm.tenthMarks}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, tenthMarks: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    12th Marks (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newApplicantForm.twelfthMarks}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, twelfthMarks: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Entrance Exam Rank
                  </label>
                  <input
                    type="number"
                    value={newApplicantForm.entranceRank}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, entranceRank: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CREATE ADMISSION NOTICE MODAL */}
      {isNoticeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '560px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Publish Official Admission Notice / Circular
              </h3>
              <button type="button" onClick={() => setIsNoticeModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Notice Title*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OJEE Final Spot Round Document Verification Closes..."
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Summary Brief*
                </label>
                <input
                  type="text"
                  required
                  placeholder="Concise 1-sentence synopsis for student bulletin..."
                  value={noticeForm.summary}
                  onChange={(e) => setNoticeForm({ ...noticeForm, summary: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Circular Text*
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive details, physical reporting timing, venue..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MANAGE ADMISSION DEADLINES MODAL */}
      {isDeadlinesModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Manage Admission Phases &amp; Deadlines
              </h3>
              <button type="button" onClick={() => setIsDeadlinesModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Active Statutory Deadlines:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {deadlines.map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Category: {d.category} · Phase: {d.programmeCode}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: '#d97706' }}>{d.deadlineDate}</span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateDeadline} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Add New Milestone:</div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Milestone title (e.g. Document Verification Closes)..."
                  value={deadlineForm.title}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="date"
                  required
                  value={deadlineForm.deadlineDate}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, deadlineDate: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
                <input
                  type="text"
                  placeholder="Target Time (e.g. 05:00 PM)"
                  value={deadlineForm.time}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, time: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>
              <button
                type="submit"
                style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', alignSelf: 'flex-start' }}
              >
                + Add Deadline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. MERIT LIST & SEAT ALLOCATION MODAL */}
      {isMeritModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Merit List &amp; Seat Allocation Analysis
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Calculated based on standard autonomous scoring formula: 35% (10th) + 55% (12th) + Entrance Exam weightage.
                </span>
              </div>
              <button type="button" onClick={() => setIsMeritModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px' }}>Rank</th>
                    <th style={{ padding: '10px 12px' }}>Applicant</th>
                    <th style={{ padding: '10px 12px' }}>Programme</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Board Marks</th>
                    <th style={{ padding: '10px 12px' }}>Merit Score</th>
                    <th style={{ padding: '10px 12px' }}>Seat Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...applicants]
                    .sort((a, b) => (b.meritScore || 0) - (a.meritScore || 0))
                    .map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#2563eb' }}>#{idx + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                          {item.name}
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.applicationNo}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{item.programmeName}</td>
                        <td style={{ padding: '10px 12px' }}>{item.category}</td>
                        <td style={{ padding: '10px 12px' }}>
                          10th: {item.tenthMarks || '—'}% · 12th: {item.twelfthMarks || '—'}%
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#059669' }}>
                          {item.meritScore || '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: item.status === 'ENROLLED' ? '#15803d' : '#2563eb' }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIGURE ADMISSION CYCLE MODAL */}
      {isCycleModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Configure Active Admission Cycle
              </h3>
              <button type="button" onClick={() => setIsCycleModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
              <DetailRow label="Academic Year" value="2026–2027" />
              <DetailRow label="Approved B.Tech Intake" value="720 Seats" />
              <DetailRow label="Approved MCA Intake" value="160 Seats" />
              <DetailRow label="Approved MBA Intake" value="180 Seats" />
              <DetailRow label="Total Institutional Capacity" value="1,060 Seats" />
              <DetailRow label="Active Admissions Desk" value="Phase II — Open Mop-up Round" />
              <DetailRow label="Statutory Affiliation" value="Autonomous under BPUT & AICTE" />
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ENROLLED CREDENTIALS NOTIFICATION MODAL */}
      {enrolledStudentInfo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Student Enrollment Finalized!
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              <strong>{enrolledStudentInfo.name}</strong> has been enrolled and matriculated into <strong>{enrolledStudentInfo.department}</strong>.
            </p>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.84rem',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Institutional Roll No:</span>
                <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{enrolledStudentInfo.rollNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Registration Student ID:</span>
                <strong>{enrolledStudentInfo.studentId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Portal Login ID:</span>
                <strong>{enrolledStudentInfo.loginId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Initial Password:</span>
                <span style={{ fontStyle: 'italic', color: '#475569' }}>Self-activation required</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={copyActivationLink}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: copiedLink ? '#059669' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                {copiedLink ? 'Copied Link!' : 'Copy Activation Link'}
              </button>

              <button
                type="button"
                onClick={() => setEnrolledStudentInfo(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DOCUMENT PREVIEW MODAL */}
      {previewDocument && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                Safe Document Preview: {previewDocument.name}
              </div>
              <button type="button" onClick={() => setPreviewDocument(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '80px', height: '100px', border: '2px dashed #94a3b8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', background: '#fff' }}>
                <FileText size={36} color="#2563eb" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{previewDocument.fileName}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                Size: {previewDocument.fileSize || 'Standard Document'} · Verified for Autonomous Admissions Compliance
              </div>
              <div style={{ marginTop: '16px', padding: '8px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}>
                Status: {previewDocument.status}
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
