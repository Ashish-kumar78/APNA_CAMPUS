import { Building2, CalendarDays, CalendarCheck, UsersRound, Megaphone } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from './Navigation';
import {
  Building,
  Bed,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  LogOut,
  Search,
  Plus,
  Home,
  ShieldCheck,
  Download,
  Calendar,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  Sparkles,
  Award,
  Printer,
  ArrowRight,
  Info,
  Check,
  QrCode,
  FileCheck,
  Menu,
  RotateCcw,
  UserCheck,
  UserPlus,
  AlertTriangle,
  FileSpreadsheet,
  MessageSquare,
  Utensils,
  Wrench,
  Boxes,
  ShieldAlert,
  AlertOctagon,
  LogIn,
  CreditCard,
  ClipboardCheck,
  PhoneCall,
  Settings,
  Bell,
  Shield,
  Star
} from 'lucide-react';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import './HostelPortal.css';
import '../components/AdminPortal.css';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import { downloadHostelCensusPdf } from '../utils/pdfGenerator';
import {
  initialHostels,
  initialHostelRooms,
  initialHostelComplaints,
  initialHostelVisitors
} from '../data/collegeData.js';
import { getAllStudents } from '../services/studentStore.js';
import {
  getAllGatePasses,
  approveGatePass,
  rejectGatePass,
  recordGatePassExit,
  recordGatePassReturn
} from '../services/gatePassStore.js';
import { api } from '../services/api.js';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';
import HandwrittenApplicationLetter from './HandwrittenApplicationLetter.jsx';

// ── 15 New Hostel Warden Submodules ──
import HostelAttendanceSection from './hostel/HostelAttendanceSection.jsx';
import HostelLeaveSection from './hostel/HostelLeaveSection.jsx';
import HostelMessSection from './hostel/HostelMessSection.jsx';
import HostelMaintenanceSection from './hostel/HostelMaintenanceSection.jsx';
import HostelStaffSection from './hostel/HostelStaffSection.jsx';
import HostelDisciplinarySection from './hostel/HostelDisciplinarySection.jsx';
import HostelEmergencyIncidentsSection from './hostel/HostelEmergencyIncidentsSection.jsx';
import HostelInventorySection from './hostel/HostelInventorySection.jsx';
import HostelNoticesSection from './hostel/HostelNoticesSection.jsx';
import HostelCheckinCheckoutSection from './hostel/HostelCheckinCheckoutSection.jsx';
import HostelFeesSection from './hostel/HostelFeesSection.jsx';
import HostelFeedbackSection from './hostel/HostelFeedbackSection.jsx';
import HostelInspectionSection from './hostel/HostelInspectionSection.jsx';
import HostelEmergencyContactsSection from './hostel/HostelEmergencyContactsSection.jsx';
import HostelSettingsRulesSection from './hostel/HostelSettingsRulesSection.jsx';
import WardenEmployeeProfile from './hostel/WardenEmployeeProfile.jsx';
import HostelApplyLeaveModule from './hostel/HostelApplyLeaveModule.jsx';
import TakeHostelAttendance from './hostel/TakeHostelAttendance.jsx';
import ViewHostelAttendance from './hostel/ViewHostelAttendance.jsx';
import HostelApplicantDetails from './hostel/HostelApplicantDetails.jsx';
import RoomAllotmentSection from './hostel/RoomAllotmentSection.jsx';
import ManageHostelsSection from './hostel/ManageHostelsSection.jsx';

export default function HostelPortal({ account, onLogout }) {
  const detectedIsAdmin = Boolean(
    account?.role === 'hostel_admin' ||
    account?.role === 'admin' ||
    account?.role === 'super_admin' ||
    account?.identity === 'WRD-ADM-01' ||
    account?.detail?.toLowerCase().includes('administrator')
  );
  const [rolePerspective, setRolePerspective] = useState(() => (detectedIsAdmin ? 'hostel_admin' : 'warden'));
  const isHostelAdmin = rolePerspective === 'hostel_admin';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hostels, setHostels] = useState(initialHostels);
  const [rooms, setRooms] = useState(initialHostelRooms);
  const [complaints, setComplaints] = useState(initialHostelComplaints);
  const [visitors, setVisitors] = useState(initialHostelVisitors);
  const [students] = useState(() => getAllStudents());

  // Gate Pass Management State
  const [gatePasses, setGatePasses] = useState(() => getAllGatePasses());
  const [selectedGatePassModal, setSelectedGatePassModal] = useState(null);
  const [gatePassStatusFilter, setGatePassStatusFilter] = useState('ALL');
  const [gatePassHostelFilter, setGatePassHostelFilter] = useState('ALL');
  const [gatePassSearch, setGatePassSearch] = useState('');
  const [wardenReviewRemarks, setWardenReviewRemarks] = useState('Application and mentor verification reviewed. Outstation gate pass granted.');

  // Bed Allocation & Transfer Modals
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [allocateForm, setAllocateForm] = useState({
    studentRoll: '',
    hostelId: 'hostel-b1',
    roomNumber: '101',
    bedNumber: 'Bed 01 (Window Side)',
    floor: 'Floor 1',
  });

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    studentRoll: '',
    studentName: '',
    currentRoomNumber: '',
    targetHostelId: 'hostel-b1',
    targetHostelName: 'Gandhi Boys Residence',
    targetRoomNumber: '102',
    targetBedNumber: 'Bed 02 (Study Side)',
    reason: 'Medical accommodation / Room realignment',
  });

  const [isVacateConfirmOpen, setIsVacateConfirmOpen] = useState(false);
  const [vacateTarget, setVacateTarget] = useState(null);

  // Complaints state & filter
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('ALL');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('ALL');
  const [complaintHostelFilter, setComplaintHostelFilter] = useState('ALL');
  const [complaintWardenFilter, setComplaintWardenFilter] = useState('ALL');
  const [complaintEscalationFilter, setComplaintEscalationFilter] = useState('ALL');
  const [complaintRatingFilter, setComplaintRatingFilter] = useState('ALL');
  const [complaintSearchQuery, setComplaintSearchQuery] = useState('');
  const [selectedAdminComplaintModal, setSelectedAdminComplaintModal] = useState(null);
  const [adminActionTab, setAdminActionTab] = useState('NOTE'); // 'NOTE' | 'REASSIGN' | 'CLOSE'
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [adminReassignStaffInput, setAdminReassignStaffInput] = useState('Mr. Suresh Mohapatra (Plumber)');

  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    studentName: 'Rakesh Das',
    rollNumber: '01',
    hostel: 'Gandhi Boys Residence',
    roomNumber: '101',
    category: 'Electrical',
    title: '',
    priority: 'Medium',
    description: '',
  });
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [assignStaffForm, setAssignStaffForm] = useState({
    complaintId: '',
    staffName: 'Mr. Pramod Panda (Electrician)',
    status: 'In Progress',
    resolutionNotes: 'Inspecting issue on-site.',
  });

  // Add Hostel Modal
  const [isAddHostelModalOpen, setIsAddHostelModalOpen] = useState(false);
  const [hostelForm, setHostelForm] = useState({
    name: '',
    type: 'Boys',
    totalFloors: 3,
    totalRooms: 50,
    totalBeds: 150,
    warden: '',
    contact: '+91 94370 00000',
  });

  // Visitor Printable Pass Modal
  const [selectedVisitorForPass, setSelectedVisitorForPass] = useState(null);

  // Listen for real-time gate pass updates from Student Portal
  useEffect(() => {
    const syncPasses = () => {
      setGatePasses(getAllGatePasses());
    };
    window.addEventListener('bput_gate_passes_changed', syncPasses);
    window.addEventListener('storage', syncPasses);
    return () => {
      window.removeEventListener('bput_gate_passes_changed', syncPasses);
      window.removeEventListener('storage', syncPasses);
    };
  }, []);

  // Interactive Hostel & Room Drilldown State
  const [selectedHostelId, setSelectedHostelId] = useState('hostel-b1');
  const [expandedRooms, setExpandedRooms] = useState(new Set(['rm-1']));
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [roomFloorFilter, setRoomFloorFilter] = useState('ALL');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');

  const [selectedHostelFilter, setSelectedHostelFilter] = useState('All');
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    relation: 'Father',
    studentName: 'Rakesh Das',
    rollNumber: '01',
    inTime: '05:00 PM',
    purpose: 'Academic visit',
    badgeNumber: 'BADGE-01'
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Reconciled Metrics Calculations
  const totalBeds = useMemo(() => hostels.reduce((acc, h) => acc + (h.totalBeds || 0), 0), [hostels]);
  const occupiedBeds = useMemo(() => hostels.reduce((acc, h) => acc + (h.occupiedBeds || 0), 0), [hostels]);
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyPercentage = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';
  const totalRoomsCount = useMemo(() => hostels.reduce((acc, h) => acc + (h.totalRooms || 0), 0), [hostels]);

  const pendingGatePassCount = useMemo(() => {
    return gatePasses.filter(p => p.status === 'Pending Warden Approval').length;
  }, [gatePasses]);

  const pendingComplaints = useMemo(() => {
    return complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  }, [complaints]);

  const activeVisitors = useMemo(() => {
    return visitors.filter(v => v.outTime === 'Pending Sign-out' || !v.outTime);
  }, [visitors]);

  const exitedStudentsCount = useMemo(() => {
    return gatePasses.filter(p => p.status === 'Exited Campus').length;
  }, [gatePasses]);

  const overduePasses = useMemo(() => {
    const now = Date.now();
    return gatePasses.filter(p => {
      if (p.status === 'Exited Campus' && p.inDateTime) {
        return new Date(p.inDateTime).getTime() < now;
      }
      return false;
    });
  }, [gatePasses]);

  const filteredGatePasses = useMemo(() => {
    const now = Date.now();
    return gatePasses.filter(p => {
      const isOverdue = p.status === 'Exited Campus' && p.inDateTime && new Date(p.inDateTime).getTime() < now;
      let matchesStatus = true;
      if (gatePassStatusFilter === 'PENDING') matchesStatus = p.status === 'Pending Warden Approval';
      else if (gatePassStatusFilter === 'APPROVED') matchesStatus = p.status === 'Approved';
      else if (gatePassStatusFilter === 'EXITED') matchesStatus = p.status === 'Exited Campus';
      else if (gatePassStatusFilter === 'RETURNED') matchesStatus = p.status === 'Returned to Hostel';
      else if (gatePassStatusFilter === 'REJECTED') matchesStatus = p.status === 'Rejected';
      else if (gatePassStatusFilter === 'OVERDUE') matchesStatus = isOverdue;

      const matchesHostel =
        gatePassHostelFilter === 'ALL' || p.hostelName === gatePassHostelFilter;

      const query = gatePassSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.id.toLowerCase().includes(query) ||
        p.studentName.toLowerCase().includes(query) ||
        (p.rollNumber && String(p.rollNumber).toLowerCase().includes(query)) ||
        (p.destination && p.destination.toLowerCase().includes(query));

      return matchesStatus && matchesHostel && matchesSearch;
    });
  }, [gatePasses, gatePassStatusFilter, gatePassHostelFilter, gatePassSearch]);

  const handleApproveGatePass = (passId) => {
    const wardenName = account?.name ? `${account.name} (Resident Warden)` : 'Mr. Rajesh Jena (Resident Warden)';
    const approved = approveGatePass(passId, wardenName, wardenReviewRemarks || 'Application and mentor verification reviewed. Outstation gate pass granted.');
    setGatePasses(getAllGatePasses());
    if (selectedGatePassModal && selectedGatePassModal.id === passId) {
      setSelectedGatePassModal(approved);
    }
    showToast(`✓ Gate Pass ${passId} Approved! Status updated automatically for student.`);
  };

  const handleRejectGatePass = (passId) => {
    const wardenName = account?.name ? `${account.name} (Resident Warden)` : 'Mr. Rajesh Jena (Resident Warden)';
    const rejected = rejectGatePass(passId, wardenName, wardenReviewRemarks || 'Application rejected.');
    setGatePasses(getAllGatePasses());
    if (selectedGatePassModal && selectedGatePassModal.id === passId) {
      setSelectedGatePassModal(rejected);
    }
    showToast(`Gate Pass ${passId} rejected.`);
  };

  const handleRecordExit = (passId) => {
    recordGatePassExit(passId);
    setGatePasses(getAllGatePasses());
    showToast(`✓ Campus Exit recorded for pass ${passId}. Student is now physically off campus.`);
    try {
      api.actionHostelGatePass(passId, 'RECORD_EXIT', 'Logged at Campus Security Gate');
    } catch (e) {
      console.warn('Backend sync failed:', e);
    }
  };

  const handleRecordReturn = (passId) => {
    recordGatePassReturn(passId);
    setGatePasses(getAllGatePasses());
    showToast(`✓ Campus Return recorded for pass ${passId}. Resident arrival confirmed.`);
    try {
      api.actionHostelGatePass(passId, 'RECORD_RETURN', 'Returned to Hostel');
    } catch (e) {
      console.warn('Backend sync failed:', e);
    }
  };

  // Fetch complaints from backend API & run escalation evaluation
  const refreshComplaints = async () => {
    try {
      const res = await api.getComplaints();
      if (res && res.data && res.data.length > 0) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.warn('Backend complaints load fallback:', err);
    }
  };

  useEffect(() => {
    refreshComplaints();
    api.checkComplaintEscalations().catch(() => {});
  }, []);

  const getComplaintDeadlineInfo = (c) => {
    if (c.status === 'Resolved') {
      return { text: 'Resolved', state: 'resolved', isOverdue: false, diffHours: null };
    }
    let deadlineMs;
    if (c.resolutionDeadline) {
      deadlineMs = new Date(c.resolutionDeadline).getTime();
    } else {
      const baseDate = c.createdAt ? new Date(c.createdAt) : new Date();
      deadlineMs = baseDate.getTime() + 72 * 3600 * 1000;
    }
    const now = Date.now();
    const diffHours = Math.round((deadlineMs - now) / (1000 * 60 * 60));

    if (diffHours <= 0) {
      const overdueHours = Math.abs(diffHours);
      return {
        text: overdueHours === 0 ? 'Deadline exceeded' : `${overdueHours}h overdue`,
        state: 'exceeded',
        isOverdue: true,
        diffHours
      };
    } else if (diffHours <= 12) {
      return {
        text: `${diffHours}h left (Approaching)`,
        state: 'approaching',
        isOverdue: false,
        diffHours
      };
    } else {
      return {
        text: `${diffHours}h remaining`,
        state: 'safe',
        isOverdue: false,
        diffHours
      };
    }
  };

  const handleMarkWorkCompleted = async (complaintId) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        const history = Array.isArray(c.statusHistory) ? [...c.statusHistory] : [];
        history.push({
          status: 'Awaiting Student Verification',
          timestamp: new Date().toISOString(),
          note: 'Maintenance finished by worker. Verification request sent to student.'
        });
        return {
          ...c,
          status: 'Awaiting Student Verification',
          workCompletedAt: new Date().toISOString(),
          statusHistory: history,
          resolutionNotes: 'Work executed on-site. Waiting for student verification.'
        };
      }
      return c;
    }));
    showToast(`✓ Ticket #${complaintId} marked complete! Notification sent to student for verification.`);
    try {
      await api.markComplaintCompleted(complaintId, {
        technicianName: 'Qualified Maintenance Specialist',
        completionNotes: 'Work finished on-site.'
      });
    } catch (err) {
      console.warn('Backend mark completed sync failed:', err);
    }
  };

  const handleAdminActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdminComplaintModal) return;
    const cid = selectedAdminComplaintModal.id;
    const note = adminNoteInput.trim();

    setComplaints(prev => prev.map(c => {
      if (c.id === cid) {
        const history = Array.isArray(c.statusHistory) ? [...c.statusHistory] : [];
        let newStatus = c.status;
        let staffName = c.assignedStaffName;
        let resolutionNotes = c.resolutionNotes;

        if (adminActionTab === 'NOTE') {
          history.push({
            status: c.status,
            timestamp: new Date().toISOString(),
            note: `Administrator Note: ${note || 'Internal review added'}`
          });
        } else if (adminActionTab === 'REASSIGN') {
          staffName = adminReassignStaffInput;
          history.push({
            status: 'Assigned',
            timestamp: new Date().toISOString(),
            note: `Administrator reassigned staff to ${staffName}. ${note}`
          });
          newStatus = 'Assigned';
        } else if (adminActionTab === 'CLOSE') {
          newStatus = 'Resolved';
          resolutionNotes = `Case administratively closed by Hostel Administrator. ${note}`;
          history.push({
            status: 'Resolved',
            timestamp: new Date().toISOString(),
            note: `Administrative case closure: ${note || 'Verified by admin'}`
          });
        }

        return {
          ...c,
          status: newStatus,
          assignedStaffName: staffName,
          resolutionNotes,
          statusHistory: history,
          adminNotes: note ? (c.adminNotes ? `${c.adminNotes} | ${note}` : note) : c.adminNotes
        };
      }
      return c;
    }));

    showToast(`✓ Administrative action executed on Complaint #${cid}`);
    setSelectedAdminComplaintModal(null);
    setAdminNoteInput('');

    try {
      await api.adminComplaintAction(cid, {
        action: adminActionTab === 'NOTE' ? 'ADD_NOTE' : adminActionTab === 'REASSIGN' ? 'REASSIGN' : 'CLOSE_CASE',
        note,
        staffName: adminReassignStaffInput
      });
    } catch (err) {
      console.warn('Backend admin action sync failed:', err);
    }
  };

  const complaintMetrics = useMemo(() => {
    const total = complaints.length;
    const newCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const awaitingVerification = complaints.filter(c => c.status === 'Awaiting Student Verification' || c.status === 'Awaiting Verification').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const reopened = complaints.filter(c => c.status === 'Reopened').length;

    const overdue = complaints.filter(c => {
      if (c.status === 'Resolved') return false;
      if (c.isEscalated || c.status === 'Escalated') return true;
      if (c.resolutionDeadline) {
        return new Date(c.resolutionDeadline).getTime() < Date.now();
      }
      return false;
    }).length;

    const escalated = complaints.filter(c => c.isEscalated || c.status === 'Escalated').length;

    // Average resolution time (hours)
    const resolvedWithTime = complaints.filter(c => c.status === 'Resolved' && (c.studentVerifiedAt || c.workCompletedAt) && (c.createdAt || c.filedDate));
    let avgResolutionHours = '18.5h';
    if (resolvedWithTime.length > 0) {
      const sumHours = resolvedWithTime.reduce((sum, c) => {
        const end = new Date(c.studentVerifiedAt || c.workCompletedAt).getTime();
        const start = new Date(c.createdAt || c.filedDate).getTime();
        const diff = Math.max(1, (end - start) / (1000 * 3600));
        return sum + diff;
      }, 0);
      avgResolutionHours = `${Math.round(sumHours / resolvedWithTime.length)}h`;
    }

    // Average Student Rating
    const ratedComplaints = complaints.filter(c => c.feedbackRating && c.feedbackRating > 0);
    const avgRating = ratedComplaints.length > 0
      ? (ratedComplaints.reduce((acc, c) => acc + c.feedbackRating, 0) / ratedComplaints.length).toFixed(1)
      : '4.8';

    return {
      total,
      newCount,
      inProgress,
      awaitingVerification,
      resolved,
      reopened,
      overdue,
      escalated,
      avgResolutionHours,
      avgRating
    };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchCategory = complaintCategoryFilter === 'ALL' || c.category === complaintCategoryFilter;
      const matchStatus = complaintStatusFilter === 'ALL' ||
        (complaintStatusFilter === 'Overdue' ? ((c.isEscalated || c.status === 'Escalated') || (c.status !== 'Resolved' && c.resolutionDeadline && new Date(c.resolutionDeadline).getTime() < Date.now())) : c.status === complaintStatusFilter);
      const matchHostel = complaintHostelFilter === 'ALL' || (c.hostel && c.hostel.toLowerCase().includes(complaintHostelFilter.toLowerCase()));
      const matchWarden = complaintWardenFilter === 'ALL' || (c.assignedWardenName && c.assignedWardenName.toLowerCase().includes(complaintWardenFilter.toLowerCase()));
      const matchEscalation = complaintEscalationFilter === 'ALL' ||
        (complaintEscalationFilter === 'ESCALATED' ? (c.isEscalated || c.status === 'Escalated') : (!c.isEscalated && c.status !== 'Escalated'));
      const matchRating = complaintRatingFilter === 'ALL' ||
        (complaintRatingFilter === '5' && c.feedbackRating === 5) ||
        (complaintRatingFilter === '4+' && c.feedbackRating >= 4) ||
        (complaintRatingFilter === 'low' && c.feedbackRating && c.feedbackRating < 3);
      const matchSearch = !complaintSearchQuery ||
        c.id.toLowerCase().includes(complaintSearchQuery.toLowerCase()) ||
        (c.title && c.title.toLowerCase().includes(complaintSearchQuery.toLowerCase())) ||
        (c.studentName && c.studentName.toLowerCase().includes(complaintSearchQuery.toLowerCase())) ||
        (c.rollNumber && c.rollNumber.toLowerCase().includes(complaintSearchQuery.toLowerCase()));

      return matchCategory && matchStatus && matchHostel && matchWarden && matchEscalation && matchRating && matchSearch;
    });
  }, [complaints, complaintCategoryFilter, complaintStatusFilter, complaintHostelFilter, complaintWardenFilter, complaintEscalationFilter, complaintRatingFilter, complaintSearchQuery]);

  const escalatedComplaints = useMemo(() => {
    return complaints.filter(c => c.isEscalated || c.status === 'Escalated' || (c.status !== 'Resolved' && c.resolutionDeadline && new Date(c.resolutionDeadline).getTime() < Date.now()));
  }, [complaints]);

  const handleUpdateComplaintStatus = async (id, newStatus) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          resolutionNotes: newStatus === 'Resolved' ? 'Verified by hostel maintenance supervisor.' : c.resolutionNotes
        };
      }
      return c;
    }));
    showToast(`Complaint ${id} status updated to ${newStatus}`);
    try {
      await api.updateComplaintStatus(id, newStatus);
    } catch (err) {
      console.warn('Backend complaint status sync failed:', err.message);
    }
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    const newVisitor = {
      id: `VIS-${Math.floor(500 + Math.random() * 500)}`,
      visitorName: visitorForm.visitorName,
      relation: visitorForm.relation,
      studentName: visitorForm.studentName,
      rollNumber: visitorForm.rollNumber,
      inTime: visitorForm.inTime,
      outTime: 'Pending Sign-out',
      passNumber: `PASS-${Math.floor(800 + Math.random() * 200)}`,
      purpose: visitorForm.purpose,
      badgeNumber: visitorForm.badgeNumber || 'BADGE-01'
    };
    setVisitors(prev => [newVisitor, ...prev]);
    setIsVisitorModalOpen(false);
    showToast(`Visitor pass issued for ${newVisitor.visitorName}!`);
    try {
      await api.issueVisitorPass(visitorForm);
    } catch (err) {
      console.warn('Backend visitor pass sync failed:', err.message);
    }
  };

  const handleCheckOutVisitor = async (visitorId) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setVisitors(prev => prev.map(v => {
      if (v.id === visitorId || v.passNumber === visitorId) {
        return { ...v, outTime: nowTime };
      }
      return v;
    }));
    showToast(`✓ Visitor departure recorded at ${nowTime}. Security badge returned.`);
    try {
      await api.checkOutVisitor(visitorId);
    } catch (e) {
      console.warn('Backend sync failed:', e);
    }
  };

  // Bed Allocation Handler
  const handleAllocateBedSubmit = async (e) => {
    e.preventDefault();
    if (!allocateForm.studentRoll || !allocateForm.roomNumber) {
      showToast('Please select a student and room.');
      return;
    }
    const targetStudent = students.find(s => s.rollNumber === allocateForm.studentRoll);
    if (!targetStudent) {
      showToast('Selected student not found in registry.');
      return;
    }

    setRooms(prev => prev.map(rm => {
      if (rm.roomNumber === allocateForm.roomNumber) {
        if (rm.occupied >= rm.capacity) {
          showToast(`Room ${rm.roomNumber} is already at full capacity (${rm.capacity} beds).`);
          return rm;
        }
        return { ...rm, occupied: rm.occupied + 1 };
      }
      return rm;
    }));

    setHostels(prev => prev.map(h => {
      if (h.id === allocateForm.hostelId || h.name.includes(allocateForm.hostelId)) {
        return { ...h, occupiedBeds: Math.min(h.totalBeds, h.occupiedBeds + 1), availableBeds: Math.max(0, h.availableBeds - 1) };
      }
      return h;
    }));

    setIsAllocateModalOpen(false);
    showToast(`✓ Bed ${allocateForm.bedNumber} in Room ${allocateForm.roomNumber} allocated to ${targetStudent.name} (${targetStudent.rollNumber})!`);
    try {
      await api.allocateBed({
        studentRoll: allocateForm.studentRoll,
        hostelName: allocateForm.hostelId,
        roomNumber: allocateForm.roomNumber,
        bedNumber: allocateForm.bedNumber
      });
    } catch (err) {
      console.warn('Backend allocation sync failed:', err);
    }
  };

  // Room Transfer Handler
  const handleTransferBedSubmit = async (e) => {
    e.preventDefault();
    if (!transferForm.studentRoll || !transferForm.targetRoomNumber) {
      showToast('Please fill all transfer fields.');
      return;
    }
    setRooms(prev => prev.map(rm => {
      if (rm.roomNumber === transferForm.currentRoomNumber && rm.occupied > 0) {
        return { ...rm, occupied: rm.occupied - 1 };
      }
      if (rm.roomNumber === transferForm.targetRoomNumber) {
        return { ...rm, occupied: Math.min(rm.capacity, rm.occupied + 1) };
      }
      return rm;
    }));

    setIsTransferModalOpen(false);
    showToast(`✓ Student ${transferForm.studentName} transferred from Room ${transferForm.currentRoomNumber} to Room ${transferForm.targetRoomNumber}!`);
    try {
      await api.transferBed({
        studentRoll: transferForm.studentRoll,
        newHostelName: transferForm.targetHostelName,
        newRoomNumber: transferForm.targetRoomNumber,
        newBedNumber: transferForm.targetBedNumber,
        transferReason: transferForm.reason
      });
    } catch (err) {
      console.warn('Backend transfer sync failed:', err);
    }
  };

  // Vacate Bed Handler
  const handleVacateBedConfirm = async () => {
    if (!vacateTarget) return;
    setRooms(prev => prev.map(rm => {
      if (rm.roomNumber === vacateTarget.roomNumber && rm.occupied > 0) {
        return { ...rm, occupied: rm.occupied - 1 };
      }
      return rm;
    }));
    setHostels(prev => prev.map(h => {
      if (h.id === selectedHostelId) {
        return { ...h, occupiedBeds: Math.max(0, h.occupiedBeds - 1), availableBeds: h.availableBeds + 1 };
      }
      return h;
    }));
    showToast(`Bed vacated for ${vacateTarget.studentName}. Room ${vacateTarget.roomNumber} capacity restored.`);
    setIsVacateConfirmOpen(false);
    setVacateTarget(null);
    try {
      await api.vacateBed(vacateTarget.studentRoll);
    } catch (err) {
      console.warn('Backend vacate sync failed:', err);
    }
  };

  // Log Complaint Handler
  const handleLogComplaintSubmit = async (e) => {
    e.preventDefault();
    const newComplaint = {
      id: `CMP-${Math.floor(200 + Math.random() * 800)}`,
      studentName: complaintForm.studentName,
      rollNumber: complaintForm.rollNumber,
      hostel: complaintForm.hostel,
      roomNumber: complaintForm.roomNumber,
      category: complaintForm.category,
      title: complaintForm.title,
      description: complaintForm.description || '',
      priority: complaintForm.priority,
      status: 'Pending',
      filedDate: 'Today, Just now',
      resolutionNotes: 'Assigned to warden for contractor scheduling.'
    };
    setComplaints(prev => [newComplaint, ...prev]);
    setIsComplaintModalOpen(false);
    showToast(`✓ Maintenance ticket #${newComplaint.id} logged successfully!`);
    try {
      await api.lodgeComplaint(complaintForm);
    } catch (err) {
      console.warn('Backend complaint sync failed:', err);
    }
  };

  // Assign Staff to Complaint Handler
  const handleAssignStaffSubmit = async (e) => {
    e.preventDefault();
    setComplaints(prev => prev.map(c => {
      if (c.id === assignStaffForm.complaintId) {
        return {
          ...c,
          status: assignStaffForm.status,
          resolutionNotes: `Assigned to ${assignStaffForm.staffName}. ${assignStaffForm.resolutionNotes}`
        };
      }
      return c;
    }));
    setIsAssignStaffModalOpen(false);
    showToast(`✓ Ticket #${assignStaffForm.complaintId} assigned to ${assignStaffForm.staffName}!`);
  };

  // Add Hostel Complex Handler
  const handleAddHostelSubmit = (e) => {
    e.preventDefault();
    const newHostel = {
      id: `hostel-${Date.now().toString().slice(-4)}`,
      name: hostelForm.name,
      type: hostelForm.type,
      totalFloors: Number(hostelForm.totalFloors) || 3,
      totalRooms: Number(hostelForm.totalRooms) || 50,
      totalBeds: Number(hostelForm.totalBeds) || 150,
      occupiedBeds: 0,
      availableBeds: Number(hostelForm.totalBeds) || 150,
      warden: hostelForm.warden,
      contact: hostelForm.contact
    };
    setHostels(prev => [...prev, newHostel]);
    setIsAddHostelModalOpen(false);
    showToast(`✓ Hostel complex "${newHostel.name}" registered into campus infrastructure!`);
  };

  // CSV Exporters
  const exportOccupancyCsv = () => {
    const headers = ['Hostel Name', 'Type', 'Total Floors', 'Total Rooms', 'Total Beds', 'Occupied Beds', 'Available Beds', 'Occupancy Rate', 'Resident Warden', 'Emergency Contact'];
    const rows = hostels.map(h => [
      h.name,
      h.type,
      h.totalFloors,
      h.totalRooms,
      h.totalBeds,
      h.occupiedBeds,
      h.availableBeds,
      `${Math.round(((h.occupiedBeds || 0) / (h.totalBeds || 1)) * 100)}%`,
      h.warden,
      h.contact
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GIFT_Hostel_Occupancy_Census_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Hostel Occupancy Census CSV exported successfully.');
  };

  const exportComplaintsCsv = () => {
    const headers = ['Ticket ID', 'Student Name', 'Roll Number', 'Hostel', 'Room Number', 'Category', 'Issue Title', 'Priority', 'Filed Date', 'Status', 'Resolution Notes'];
    const rows = complaints.map(c => [
      c.id,
      c.studentName,
      c.rollNumber,
      c.hostel,
      c.roomNumber,
      c.category,
      c.title,
      c.priority,
      c.filedDate,
      c.status,
      c.resolutionNotes || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GIFT_Hostel_Complaints_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Hostel Maintenance Complaints Audit CSV exported successfully.');
  };

  const currentHostel = useMemo(() => {
    return hostels.find(h => h.id === selectedHostelId) || hostels[0];
  }, [hostels, selectedHostelId]);

  const toggleRoomExpand = (roomId) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  const expandAllRooms = (allRoomIds) => {
    setExpandedRooms(new Set(allRoomIds));
    showToast('Expanded all room dropdowns.');
  };

  const collapseAllRooms = () => {
    setExpandedRooms(new Set());
    showToast('Collapsed all room dropdowns.');
  };

  // Structured rooms with 4 students in each room
  const hostelRoomsWithResidents = useMemo(() => {
    const isGirlsHostel = selectedHostelId === 'hostel-g1' || (currentHostel && currentHostel.type === 'Girls');
    const pool = isGirlsHostel
      ? students.filter(s => s.gender === 'Female')
      : students.filter(s => s.gender !== 'Female');

    const offset = selectedHostelId === 'hostel-b2' ? 20 : 0;
    const studentsToUse = pool.slice(offset).concat(pool.slice(0, offset));

    const roomDefs = [
      { num: '1', floor: 'Floor 1', type: '4-Bed Quad Non-AC Standard', capacity: 4 },
      { num: '2', floor: 'Floor 1', type: '4-Bed Quad Non-AC Standard', capacity: 4 },
      { num: '3', floor: 'Floor 1', type: '4-Bed Quad Non-AC Standard', capacity: 4 },
      { num: '4', floor: 'Floor 2', type: '4-Bed Quad AC Deluxe', capacity: 4 },
      { num: '5', floor: 'Floor 2', type: '4-Bed Quad AC Deluxe', capacity: 4 },
      { num: '6', floor: 'Floor 2', type: '4-Bed Quad AC Deluxe', capacity: 4 },
      { num: '7', floor: 'Floor 3', type: '4-Bed Quad Premium', capacity: 4 },
      { num: '8', floor: 'Floor 3', type: '4-Bed Quad Premium', capacity: 4 },
    ];

    const bedLocations = [
      'Bed 01 (Window Side)',
      'Bed 02 (Study Side)',
      'Bed 03 (Inner Side)',
      'Bed 04 (Door Side)'
    ];

    const attendanceStatuses = [
      'In Hostel (Biometric Verified · 08:15 PM)',
      'In Hostel (Biometric Verified · 07:50 PM)',
      'Campus Central Library (Study Pass)',
      'In Hostel (Biometric Verified · 08:35 PM)'
    ];

    return roomDefs.map((def, rIdx) => {
      const roomResidents = [];
      for (let b = 0; b < def.capacity; b++) {
        const studentIndex = (rIdx * def.capacity + b) % (studentsToUse.length || 1);
        const std = studentsToUse[studentIndex] || {};
        const rollNum = parseInt(std.rollNumber) || (studentIndex + 1);
        roomResidents.push({
          bedNo: bedLocations[b] || `Bed 0${b + 1}`,
          bedIndex: b + 1,
          studentId: std.studentId || `GIFT-2023-${1000 + rollNum}`,
          registrationNumber: std.registrationNumber || `230520${String(rollNum).padStart(4, '0')}`,
          name: std.name || `Resident Student ${b + 1}`,
          rollNumber: std.rollNumber || String(rollNum).padStart(2, '0'),
          gender: std.gender || (isGirlsHostel ? 'Female' : 'Male'),
          section: std.section || 'Section A',
          semester: std.semester || 'Semester 5',
          department: std.department || 'Computer Science & Engineering',
          deptCode: std.deptCode || 'CSE',
          phone: std.phone || `+91 98610 ${String((rollNum * 1111) % 90000 + 10000)}`,
          fatherName: std.fatherName || 'Guardian Senior',
          fatherPhone: std.fatherPhone || `+91 94370 ${String((rollNum * 2222) % 90000 + 10000)}`,
          motherName: std.motherName || 'Mother Guardian',
          permAddress: std.permAddress ? `${std.permAddress}, ${std.permCity || 'Bhubaneswar'}` : 'Plot 18, Unit 4, Bhubaneswar, Odisha',
          bloodGroup: std.bloodGroup || 'B+',
          cgpa: std.cgpa || '8.25',
          attendance: std.attendance || 92,
          biometricStatus: attendanceStatuses[b % attendanceStatuses.length],
          rawStudent: std
        });
      }

      return {
        id: `rm-${def.num}`,
        roomNumber: def.num,
        displayTitle: `Room ${def.num}`,
        floor: def.floor,
        type: def.type,
        capacity: def.capacity,
        occupiedCount: def.capacity,
        residents: roomResidents,
        amenities: ['4x Study Desk', '4x Steel Wardrobe', 'High-Speed Wi-Fi AP', 'Ceiling Fan & LED']
      };
    });
  }, [selectedHostelId, currentHostel, students]);

  const filteredHostelRooms = useMemo(() => {
    return hostelRoomsWithResidents.filter(rm => {
      const matchFloor = roomFloorFilter === 'ALL' || rm.floor === roomFloorFilter;
      const query = roomSearchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        rm.roomNumber.toLowerCase().includes(query) ||
        rm.type.toLowerCase().includes(query) ||
        rm.residents.some(res =>
          res.name.toLowerCase().includes(query) ||
          res.rollNumber.toLowerCase().includes(query)
        );
      return matchFloor && matchQuery;
    });
  }, [hostelRoomsWithResidents, roomFloorFilter, roomSearchQuery]);


  const hostelNavSections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: isHostelAdmin ? 'Hostel Admin Dashboard' : 'Warden Dashboard',
          icon: Home
        },
      ]
    },
    {
      title: 'HOSTEL',
      items: [
        { id: 'take-attendance', label: 'Take Hostel Attendance', icon: Clock },
        { id: 'view-attendance', label: 'View Hostel Attendance', icon: UserCheck },
        { id: 'applicant-details', label: 'View Applicant Details', icon: Users },
        ...(isHostelAdmin ? [
          { id: 'room-allotment', label: 'Room Allotment', icon: Bed },
          { id: 'manage-hostels', label: 'Manage Hostel(s)', icon: Building2 },
        ] : []),
      ]
    },
    {
      title: 'RESIDENTIAL OPERATIONS',
      items: [
        { id: 'hostels', label: 'Hostel Blocks & Wings', icon: Building2 },
        ...(isHostelAdmin ? [{ id: 'rooms', label: 'Rooms & Bed Allotment', icon: Bed }] : []),
        { id: 'checkin-checkout', label: 'Check-In & Check-Out', icon: UserCheck },
        { id: 'attendance', label: 'Night Roll Call (Biometric)', icon: Clock },
      ]
    },
    {
      title: 'LEAVES & DIGITAL PASSES',
      items: [
        ...(isHostelAdmin ? [
          { id: 'hostel-admin-approvals', label: 'Hostel Admin Approvals', icon: ShieldCheck, badge: 2 }
        ] : []),
        { id: 'leave-mgmt', label: 'Hostel Leaves', icon: CalendarDays },
        { id: 'apply-leave', label: 'Apply Leave', icon: CalendarCheck },
        { id: 'gatepasses', label: 'Digital Gate Passes', icon: ShieldCheck },
        { id: 'visitors', label: 'Visitor Logs', icon: Users },
        { id: 'disciplinary', label: 'Disciplinary Records', icon: AlertTriangle },
        { id: 'emergency-incidents', label: 'Incident Hotline', icon: ShieldAlert },
      ]
    },
    {
      title: 'SERVICES & ASSETS',
      items: [
        { id: 'mess-dining', label: 'Mess & Dining Menu', icon: Utensils },
        { id: 'complaints', label: 'Room Complaints', icon: Wrench },
        { id: 'inventory-assets', label: 'Furniture & Inventory', icon: Layers },
        { id: 'fees-dues', label: 'Hostel Fee Ledger', icon: CreditCard },
        { id: 'staff-mgmt', label: 'Warden & Caretaker Roster', icon: UsersRound },
        { id: 'notices-announcements', label: 'Hostel Notices', icon: Megaphone },
      ]
    },
    {
      title: 'REPORTS & POLICIES',
      items: [
        { id: 'reports', label: 'Occupancy & Meal Reports', icon: FileText },
        { id: 'documents', label: 'Student Resident Docs', icon: Download },
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
        { id: 'settings-rules', label: 'Hostel Rules & Curfew', icon: Settings },
      ]
    }
  ];

  const getHostelHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: isHostelAdmin ? 'Hostel Administrator Executive Console' : 'Hostel & Residential Services Management',
          subtitle: isHostelAdmin
            ? 'Centralized administrative oversight for hostel blocks, warden management, attendance sync, and maintenance SLA.'
            : 'Real-time room occupancy, night roll calls, gate passes, and resident welfare.'
        };
      case 'profile':
        return {
          title: 'Employee Profile',
          subtitle: 'Hostel Administration & Staff Service Record'
        };
      case 'take-attendance':
        return {
          title: 'Take Hostel Attendance',
          subtitle: 'Daily student roll call and curfew inspection. Submissions auto-sync to Hostel Admin in real time.'
        };
      case 'view-attendance':
        return {
          title: 'View Hostel Attendance Console',
          subtitle: 'Real-time attendance ledger automatically fetched from Warden roll call submissions.'
        };
      case 'applicant-details':
        return {
          title: 'Hostel Accommodation Applicant Details',
          subtitle: 'Boarding applications, merit ranks, allotted rooms, and guardian records.'
        };
      case 'room-allotment':
        return {
          title: 'Room Allotment & Bed Capacity Manager',
          subtitle: 'Hostel Admin console for bed allocation, vacancy monitoring, and room transfers.'
        };
      case 'manage-hostels':
        return {
          title: 'Manage Hostel(s)',
          subtitle: 'Add new hostels, configure bed capacity matrix, and export official returns.'
        };
      case 'gatepasses':
        return {
          title: 'Autonomous Digital Gate Pass Registry',
          subtitle: 'Biometric and warden-verified exit/entry logs with parent SMS dispatch.'
        };
      case 'rooms':
        return {
          title: 'Room Allotment & Bed Capacity Manager',
          subtitle: 'Block-wise bed occupancy, vacancy monitoring, and student room transfers.'
        };
      case 'apply-leave':
        return {
          title: isHostelAdmin
            ? 'Hostel Admin Leave Management & ERP Policy'
            : 'Staff & Warden Leave Application & ERP Guidelines',
          subtitle: 'Institutional Leave Policy, Entitlement Summary, Admissibility Clauses & Hostel Admin Approval'
        };
      case 'hostel-admin-approvals':
        return {
          title: 'Hostel Admin Leave Approvals & Sanction Console',
          subtitle: 'Review staff & warden leave applications, inspect reasons & alternative arrangements, and grant official sanctions.'
        };
      case 'mess-dining':
        return {
          title: 'Mess Nutrition, Meal Count & Menu Management',
          subtitle: 'Weekly rotational student menu, meal reservations, and kitchen hygiene audit.'
        };
      case 'inventory-assets':
        return {
          title: 'Hostel Inventory & Requisition Management',
          subtitle: 'Raise Indent / View Status, Custom Materials Requisition, and Recommendation Log.'
        };
      default:
        return {
          title: (activeTab || 'Hostel Portal').replace(/-/g, ' ').toUpperCase(),
          subtitle: 'Office of the Chief Warden & Residential Affairs'
        };
    }
  };

  const hostelHeading = getHostelHeading();
  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Standard Universal AppLayout */}
      <AppLayout
        account={account}
        portalName="Hostel Portal"
        portalSubtitle="Residential Life & Warden Administration"
        portalHomeTab="dashboard"
        navSections={hostelNavSections}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        pageTitle={hostelHeading.title}
        pageSubtitle={hostelHeading.subtitle}
      >
        <div className="hostel-portal-content-wrap">
          {/* Quick Role Perspective Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isHostelAdmin ? '#eff6ff' : '#f0fdf4',
            border: `1px solid ${isHostelAdmin ? '#bfdbfe' : '#bbf7d0'}`,
            padding: '8px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} color={isHostelAdmin ? '#1d4ed8' : '#15803d'} />
              <span>
                Current Active Scope:{' '}
                <strong style={{ color: isHostelAdmin ? '#1d4ed8' : '#15803d' }}>
                  {isHostelAdmin ? 'Hostel Admin Role' : 'Warden Role'}
                </strong>
                {' · '}
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {isHostelAdmin
                    ? 'All 5 Hostel options enabled (Take Attendance, View Attendance, Applicant Details, Room Allotment, Manage Hostels)'
                    : '1st 3 Hostel options enabled (Take Attendance, View Attendance, Applicant Details) — Last 2 reserved for Hostel Admin'}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = isHostelAdmin ? 'warden' : 'hostel_admin';
                setRolePerspective(next);
                showToast(`Switched view to ${next === 'hostel_admin' ? 'Hostel Admin' : 'Warden'} role.`);
              }}
              style={{
                background: isHostelAdmin ? '#1d4ed8' : '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Switch to {isHostelAdmin ? 'Warden View' : 'Hostel Admin View'}
            </button>
          </div>

          {/* TAB: TAKE HOSTEL ATTENDANCE (WARDEN & HOSTEL ADMIN) */}
          {activeTab === 'take-attendance' && (
            <TakeHostelAttendance account={account} onNavigateTab={setActiveTab} />
          )}

          {/* TAB: VIEW HOSTEL ATTENDANCE (AUTO-FETCH TO HOSTEL ADMIN) */}
          {activeTab === 'view-attendance' && (
            <ViewHostelAttendance account={account} onNavigateTab={setActiveTab} />
          )}

          {/* TAB: VIEW APPLICANT DETAILS (WARDEN & HOSTEL ADMIN) */}
          {activeTab === 'applicant-details' && (
            <HostelApplicantDetails account={account} />
          )}

          {/* TAB: ROOM ALLOTMENT (HOSTEL ADMIN ONLY) */}
          {activeTab === 'room-allotment' && (
            isHostelAdmin ? (
              <RoomAllotmentSection account={account} />
            ) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fff', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                <ShieldAlert size={36} color="#ef4444" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ margin: '0 0 6px', color: '#991b1b' }}>Access Restricted to Hostel Admin</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Room Allotment is exclusively managed by the Hostel Administrator.
                </p>
              </div>
            )
          )}

          {/* TAB: MANAGE HOSTEL(S) (HOSTEL ADMIN ONLY - IMAGE 2 REPLICA) */}
          {activeTab === 'manage-hostels' && (
            isHostelAdmin ? (
              <ManageHostelsSection account={account} />
            ) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fff', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                <ShieldAlert size={36} color="#ef4444" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ margin: '0 0 6px', color: '#991b1b' }}>Access Restricted to Hostel Admin</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Manage Hostel(s) infrastructure configuration is exclusively available to Hostel Admin.
                </p>
              </div>
            )
          )}

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 120px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB: WARDEN EMPLOYEE PROFILE (2ND IMAGE REPLICA) */}
          {activeTab === 'profile' && (
            <WardenEmployeeProfile
              account={account}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <RoleDashboardLanding
              roleKey="warden"
              account={account}
              onLogout={onLogout}
              onNavigateTab={(target) => {
                if (target === 'profile') setActiveTab('profile');
                else if (target === 'rooms') setActiveTab('rooms');
                else if (target === 'complaints') setActiveTab('complaints');
                else if (target === 'maintenance') setActiveTab('complaints');
                else if (target === 'attendance') setActiveTab('attendance');
                else if (target === 'leave') setActiveTab('leave-mgmt');
                else if (target === 'mess') setActiveTab('mess-dining');
                else if (target) setActiveTab(target);
                else setActiveTab('rooms');
              }}
              onNavigate={(target) => {
                if (target === 'profile') setActiveTab('profile');
                else if (target === 'rooms') setActiveTab('rooms');
                else if (target === 'complaints') setActiveTab('complaints');
                else if (target === 'maintenance') setActiveTab('complaints');
                else if (target === 'attendance') setActiveTab('attendance');
                else if (target === 'leave') setActiveTab('leave-mgmt');
                else if (target === 'mess') setActiveTab('mess-dining');
                else if (target) setActiveTab(target);
                else setActiveTab('rooms');
              }}
            />
          )}

          {false && activeTab === 'dashboard' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>{greeting}, {account?.name || 'Chief Warden'}</h2>
                  <p>Hostel Administration &amp; Resident Welfare · Gandhi Block, Kalam Block &amp; Sarojini Girls Block.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="admin-action-btn-secondary" onClick={() => setIsAllocateModalOpen(true)}>
                    <UserPlus size={15} /> Allocate Bed
                  </button>
                  <button className="admin-action-btn-secondary" onClick={() => { setActiveTab('gatepasses'); setGatePassStatusFilter('PENDING'); }}>
                    <ShieldCheck size={15} /> Review Gate Passes ({pendingGatePassCount})
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setIsVisitorModalOpen(true)}>
                    <Plus size={15} /> Issue Visitor Pass
                  </button>
                </div>
              </div>

              {/* KPI Grid - Clickable & Database Driven */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card" onClick={() => setActiveTab('hostels')} style={{ cursor: 'pointer' }} title="Click to view hostels">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Total Hostels</span>
                    <div className="admin-kpi-card-icon blue"><Building size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">{hostels.length}</div>
                  <small style={{ color: '#64748b' }}>Active Residential Complexes</small>
                </div>

                <div className="admin-kpi-card" onClick={() => setActiveTab('rooms')} style={{ cursor: 'pointer' }} title="Click to view rooms matrix">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Total Rooms</span>
                    <div className="admin-kpi-card-icon emerald"><Home size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">{totalRoomsCount}</div>
                  <small style={{ color: '#64748b' }}>Across all residential floors</small>
                </div>

                <div className="admin-kpi-card" onClick={() => setActiveTab('rooms')} style={{ cursor: 'pointer' }} title="Click to view bed allocation">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Occupied Beds / Capacity</span>
                    <div className="admin-kpi-card-icon purple"><Bed size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#7c3aed' }}>{occupiedBeds} / {totalBeds}</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>{occupancyPercentage}% Campus Occupancy</small>
                </div>

                <div className="admin-kpi-card" style={{ cursor: 'pointer', border: pendingGatePassCount > 0 ? '1px solid #f59e0b' : 'none' }} onClick={() => { setActiveTab('gatepasses'); setGatePassStatusFilter('PENDING'); }} title="Click to view pending passes">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Pending Gate Passes</span>
                    <div className="admin-kpi-card-icon amber"><ShieldCheck size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>{pendingGatePassCount} Pending</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>Warden Approval Required</small>
                </div>

                <div className="admin-kpi-card" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('complaints'); setComplaintStatusFilter('Pending'); }} title="Click to view complaints">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Active Complaints</span>
                    <div className="admin-kpi-card-icon rose"><AlertCircle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#e11d48' }}>{pendingComplaints}</div>
                  <small style={{ color: '#e11d48', fontWeight: 600 }}>Maintenance Action Required</small>
                </div>

                <div className="admin-kpi-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('visitors')} title="Click to view visitors">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Visitors on Campus</span>
                    <div className="admin-kpi-card-icon blue"><Users size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#2563eb' }}>{activeVisitors.length} Active</div>
                  <small style={{ color: '#64748b' }}>Checked In With Security Badge</small>
                </div>
              </div>

              {/* Overdue alert banner if any */}
              {overduePasses.length > 0 && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertTriangle color="#dc2626" size={22} />
                    <div>
                      <strong style={{ color: '#991b1b', fontSize: '0.92rem' }}>
                        Overdue Student Return Alert ({overduePasses.length} Resident{overduePasses.length > 1 ? 's' : ''})
                      </strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#b91c1c' }}>
                        Students who departed on gate passes have exceeded their scheduled campus return deadline.
                      </p>
                    </div>
                  </div>
                  <button
                    className="admin-action-btn-primary"
                    style={{ background: '#dc2626', fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                    onClick={() => { setActiveTab('gatepasses'); setGatePassStatusFilter('OVERDUE'); }}
                  >
                    View Overdue Records
                  </button>
                </div>
              )}

              {/* Residential Blocks Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {hostels.map(h => (
                  <div key={h.id} className="admin-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="admin-badge active">{h.type} Hostel</span>
                      <strong style={{ color: '#7c3aed' }}>{h.occupiedBeds} / {h.totalBeds} Beds</strong>
                    </div>
                    <h3 style={{ margin: '0 0 0.4rem 0', color: '#0f172a' }}>{h.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      Warden: <strong>{h.warden}</strong> ({h.contact})
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(((h.occupiedBeds || 0) / (h.totalBeds || 1)) * 100)}%`, height: '100%', background: '#7c3aed', borderRadius: '9999px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', alignItems: 'center' }}>
                      <span>{h.totalRooms} Rooms · {h.totalFloors} Floors</span>
                      <button
                        className="admin-action-btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.74rem' }}
                        onClick={() => {
                          setSelectedHostelId(h.id);
                          setActiveTab('hostels');
                        }}
                      >
                        Inspect Rooms →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Maintenance Feed */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Pending Maintenance &amp; Resident Requests</h3>
                  <button className="admin-action-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('complaints')}>
                    View All Complaints
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {complaints.filter(c => c.status !== 'Resolved').map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: `4px solid ${c.priority === 'High' ? '#e11d48' : '#d97706'}` }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{c.title}</strong>
                          <span className={`admin-badge ${c.priority === 'High' ? 'rejected' : 'pending'}`}>{c.priority} Priority</span>
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Reported by: <strong>{c.studentName}</strong> (Roll {c.rollNumber}) · {c.hostel} · Room {c.roomNumber} · {c.filedDate}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="admin-action-btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.775rem' }}
                          onClick={() => handleUpdateComplaintStatus(c.id, 'In Progress')}
                        >
                          Mark In-Progress
                        </button>
                        <button
                          className="admin-action-btn-primary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.775rem', background: '#059669' }}
                          onClick={() => handleUpdateComplaintStatus(c.id, 'Resolved')}
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOSTELS & BUILDINGS */}
          {activeTab === 'hostels' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Hostel Infrastructure &amp; Building Complexes</h2>
                  <p>Campus residential blocks, floor capacities, room specifications, and resident student rosters.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setIsAddHostelModalOpen(true)}>
                  <Plus size={15} /> Add Hostel Complex
                </button>
              </div>

              {/* Interactive Hostel Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {hostels.map(h => {
                  const isSelected = selectedHostelId === h.id;
                  return (
                    <div
                      key={h.id}
                      className={`admin-card hostel-card-interactive ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedHostelId(h.id);
                        showToast(`Viewing details for ${h.name}`);
                      }}
                      style={{ marginBottom: 0 }}
                    >
                      {isSelected && (
                        <div className="hostel-selected-indicator">
                          <Check size={12} /> Currently Active
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <span className="admin-badge active">{h.type} Hostel</span>
                        <span className="admin-badge approved">Biometric Active</span>
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 800 }}>{h.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                        Resident Warden: <strong>{h.warden}</strong><br />
                        Emergency Contact: <span style={{ color: '#2563eb', fontWeight: 600 }}>{h.contact}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', textAlign: 'center', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed' }}>{h.totalRooms}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Rooms</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{h.occupiedBeds}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Occupied</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{h.availableBeds}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Vacant</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={isSelected ? 'admin-action-btn-primary' : 'admin-action-btn-secondary'}
                        style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHostelId(h.id);
                        }}
                      >
                        {isSelected ? '✓ Viewing Rooms & Resident Roster' : 'Click to View Full Details ▾'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* DETAILED HOSTEL PANEL WITH ROOM DROPDOWNS */}
              <div className="hostel-details-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Hostel Infrastructure &amp; Room Allocations
                    </span>
                    <h3 style={{ margin: '3px 0 0 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                      {currentHostel.name}
                    </h3>
                  </div>

                  <div className="hostel-switcher-bar" style={{ margin: 0 }}>
                    {hostels.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        className={`hostel-switcher-tab ${selectedHostelId === h.id ? 'active' : ''}`}
                        onClick={() => setSelectedHostelId(h.id)}
                      >
                        <Building size={14} /> {h.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hostel-details-header-card">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
                          {currentHostel.type} Residential Complex
                        </span>
                        <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
                          Biometric Active
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: 800 }}>{currentHostel.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.84rem', opacity: 0.85, lineHeight: 1.4 }}>
                        {currentHostel.totalFloors} Floors · {currentHostel.totalRooms} Rooms · Central Dining Mess Hall &amp; 500 Mbps Wi-Fi
                      </p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.85rem 1.15rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.75, fontWeight: 600 }}>CHIEF RESIDENT WARDEN</div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, margin: '2px 0' }}>{currentHostel.warden}</div>
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
                        <Phone size={13} /> {currentHostel.contact}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                        📶 500 Mbps Wi-Fi
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                        ⚡ 24x7 Power Backup
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                        🛡️ Biometric Turnstiles
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                        🥗 Pure RO Water &amp; Mess
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter and Expand Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', margin: '1.5rem 0 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['ALL', 'Floor 1', 'Floor 2', 'Floor 3'].map(fl => (
                      <button
                        key={fl}
                        type="button"
                        className={`hostel-floor-pill ${roomFloorFilter === fl ? 'active' : ''}`}
                        onClick={() => setRoomFloorFilter(fl)}
                      >
                        {fl === 'ALL' ? 'All Floors' : fl}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Search Room / Student..."
                        value={roomSearchQuery}
                        onChange={e => setRoomSearchQuery(e.target.value)}
                        className="admin-search-input"
                        style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={() => expandAllRooms(hostelRoomsWithResidents.map(r => r.id))}
                    >
                      Expand All
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={collapseAllRooms}
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* Rooms List with Accordion */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {filteredHostelRooms.map(rm => {
                    const isExpanded = expandedRooms.has(rm.id);
                    return (
                      <div key={rm.id} className="hostel-room-item-card">
                        <div className="hostel-room-header-row" onClick={() => toggleRoomExpand(rm.id)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div className="hostel-room-num-badge">
                              <Bed size={16} /> {rm.displayTitle}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{rm.type}</div>
                              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                {rm.floor} · {rm.amenities.join(' · ')}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className="admin-badge approved" style={{ fontSize: '0.76rem' }}>
                              {rm.occupiedCount} / {rm.capacity} Beds Occupied
                            </span>
                            <button
                              type="button"
                              className="hostel-room-dropdown-btn"
                              aria-label={`Toggle Room ${rm.roomNumber}`}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="hostel-residents-pane">
                            <table className="hostel-residents-table">
                              <thead>
                                <tr>
                                  <th>Bed Position</th>
                                  <th>Resident Student</th>
                                  <th>Roll / Reg Number</th>
                                  <th>Department &amp; Sem</th>
                                  <th>Emergency Contact</th>
                                  <th>Biometric Status</th>
                                  <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rm.residents.map(res => (
                                  <tr key={res.bedIndex}>
                                    <td>
                                      <span className="hostel-bed-pill">
                                        <Bed size={12} /> {res.bedNo}
                                      </span>
                                    </td>
                                    <td>
                                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{res.name}</div>
                                      <small style={{ color: '#64748b' }}>ID: {res.studentId}</small>
                                    </td>
                                    <td>
                                      <div style={{ fontWeight: 600 }}>Roll {res.rollNumber}</div>
                                      <small style={{ color: '#64748b' }}>Reg: {res.registrationNumber}</small>
                                    </td>
                                    <td>
                                      <div>{res.department}</div>
                                      <small style={{ color: '#7c3aed', fontWeight: 600 }}>{res.semester} · {res.section}</small>
                                    </td>
                                    <td>
                                      <div>📞 {res.phone}</div>
                                      <small style={{ color: '#64748b' }}>Father: {res.fatherPhone}</small>
                                    </td>
                                    <td>
                                      <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.78rem' }}>
                                        ✓ {res.biometricStatus}
                                      </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      <button
                                        type="button"
                                        className="hostel-view-student-btn"
                                        onClick={() => setSelectedStudentModal({
                                          ...res,
                                          hostelName: currentHostel.name,
                                          roomNumber: rm.displayTitle,
                                          wardenName: currentHostel.warden,
                                          wardenContact: currentHostel.contact
                                        })}
                                      >
                                        <Eye size={12} /> Inspect
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROOMS & BED ALLOCATIONS */}
          {activeTab === 'rooms' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Room &amp; Bed Inventory Matrix</h2>
                  <p>Bed level allocation tracking across triple deluxe, double, and quad standard resident rooms.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="admin-action-btn-primary" onClick={() => setIsAllocateModalOpen(true)}>
                    <UserPlus size={15} /> Allocate Available Bed
                  </button>
                  <button className="admin-action-btn-secondary" onClick={() => setIsTransferModalOpen(true)}>
                    <RotateCcw size={15} /> Transfer Resident
                  </button>
                </div>
              </div>

              {/* Room Inventory Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Room #</th>
                      <th>Hostel Residence</th>
                      <th>Floor</th>
                      <th>Room Type</th>
                      <th>Capacity</th>
                      <th>Occupancy Status</th>
                      <th>Allocated Residents</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(rm => (
                      <tr key={rm.id}>
                        <td><strong style={{ fontSize: '1rem', color: '#7c3aed' }}>Room {rm.roomNumber}</strong></td>
                        <td>{rm.hostelName}</td>
                        <td>{rm.floor}</td>
                        <td><span className="admin-badge active">{rm.type}</span></td>
                        <td>{rm.capacity} Beds</td>
                        <td>
                          <span className={`admin-badge ${rm.occupied >= rm.capacity ? 'approved' : 'pending'}`}>
                            {rm.occupied} / {rm.capacity} Beds Occupied
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {rm.roomNumber === '204' ? 'Rakesh Das (Bed 01), Priya Patra (Bed 02), Sneha Mohanty (Bed 03)' : `${rm.occupied} Resident students enrolled`}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              className="admin-action-btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => {
                                setTransferForm(prev => ({
                                  ...prev,
                                  currentRoomNumber: rm.roomNumber,
                                  studentName: 'Resident Student'
                                }));
                                setIsTransferModalOpen(true);
                              }}
                            >
                              Transfer
                            </button>
                            {rm.occupied > 0 && (
                              <button
                                className="hostel-quick-reject-btn"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => {
                                  setVacateTarget({
                                    roomNumber: rm.roomNumber,
                                    studentRoll: '01',
                                    studentName: 'Resident Student'
                                  });
                                  setIsVacateConfirmOpen(true);
                                }}
                              >
                                Vacate
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
          )}

          {/* TAB 4: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Resident Maintenance Complaints Desk &amp; SLA Monitoring</h2>
                  <p>72-hour automated SLA resolution tracker, auto-warden assignment, student verification, and admin escalation.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={async () => {
                      showToast('Checking for overdue complaints past 72h SLA...');
                      try {
                        const res = await api.checkComplaintEscalations();
                        await refreshComplaints();
                        showToast(`✓ SLA check complete: ${res?.escalatedCount || 0} overdue ticket(s) escalated.`);
                      } catch (err) {
                        showToast('✓ Escalation check completed.');
                      }
                    }}
                    title="Run background SLA check for overdue complaints"
                  >
                    <RotateCcw size={14} /> Run Escalation Check
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setIsComplaintModalOpen(true)}>
                    <Plus size={15} /> Lodge Maintenance Ticket
                  </button>
                </div>
              </div>

              {/* 10 SUMMARY KPI CARDS */}
              <div className="complaint-kpi-grid">
                <div
                  className={`complaint-kpi-card ${complaintStatusFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setComplaintStatusFilter('ALL')}
                >
                  <span className="complaint-kpi-lbl">Total Complaints</span>
                  <div className="complaint-kpi-val" style={{ color: '#0f172a' }}>{complaintMetrics.total}</div>
                </div>

                <div
                  className={`complaint-kpi-card ${complaintStatusFilter === 'Submitted' ? 'active' : ''}`}
                  onClick={() => setComplaintStatusFilter('Submitted')}
                >
                  <span className="complaint-kpi-lbl">New Complaints</span>
                  <div className="complaint-kpi-val" style={{ color: '#3b82f6' }}>{complaintMetrics.newCount}</div>
                </div>

                <div
                  className={`complaint-kpi-card ${complaintStatusFilter === 'In Progress' ? 'active' : ''}`}
                  onClick={() => setComplaintStatusFilter('In Progress')}
                >
                  <span className="complaint-kpi-lbl">In Progress</span>
                  <div className="complaint-kpi-val" style={{ color: '#8b5cf6' }}>{complaintMetrics.inProgress}</div>
                </div>

                <div
                  className={`complaint-kpi-card ${complaintStatusFilter === 'Awaiting Student Verification' ? 'active' : ''}`}
                  onClick={() => setComplaintStatusFilter('Awaiting Student Verification')}
                >
                  <span className="complaint-kpi-lbl">Awaiting Verification</span>
                  <div className="complaint-kpi-val" style={{ color: '#f59e0b' }}>{complaintMetrics.awaitingVerification}</div>
                </div>

                <div
                  className={`complaint-kpi-card ${complaintStatusFilter === 'Resolved' ? 'active' : ''}`}
                  onClick={() => setComplaintStatusFilter('Resolved')}
                >
                  <span className="complaint-kpi-lbl">Resolved</span>
                  <div className="complaint-kpi-val" style={{ color: '#10b981' }}>{complaintMetrics.resolved}</div>
                </div>

                <div
                  className={`complaint-kpi-card ${complaintStatusFilter === 'Reopened' ? 'active' : ''}`}
                  onClick={() => setComplaintStatusFilter('Reopened')}
                >
                  <span className="complaint-kpi-lbl">Reopened</span>
                  <div className="complaint-kpi-val" style={{ color: '#ef4444' }}>{complaintMetrics.reopened}</div>
                </div>

                <div
                  className={`complaint-kpi-card ${complaintStatusFilter === 'Overdue' ? 'active' : ''}`}
                  onClick={() => setComplaintStatusFilter('Overdue')}
                >
                  <span className="complaint-kpi-lbl">Overdue (&gt;72h)</span>
                  <div className="complaint-kpi-val" style={{ color: '#dc2626' }}>{complaintMetrics.overdue}</div>
                </div>

                <div
                  className={`complaint-kpi-card ${complaintStatusFilter === 'Escalated' ? 'active' : ''}`}
                  onClick={() => setComplaintStatusFilter('Escalated')}
                >
                  <span className="complaint-kpi-lbl">Escalated to Admin</span>
                  <div className="complaint-kpi-val" style={{ color: '#ea580c' }}>{complaintMetrics.escalated}</div>
                </div>

                <div className="complaint-kpi-card">
                  <span className="complaint-kpi-lbl">Avg Resolution Time</span>
                  <div className="complaint-kpi-val" style={{ color: '#0284c7' }}>{complaintMetrics.avgResolutionHours}</div>
                </div>

                <div
                  className={`complaint-kpi-card ${complaintRatingFilter === '5' ? 'active' : ''}`}
                  onClick={() => setComplaintRatingFilter(complaintRatingFilter === '5' ? 'ALL' : '5')}
                >
                  <span className="complaint-kpi-lbl">Avg Student Rating</span>
                  <div className="complaint-kpi-val" style={{ color: '#eab308' }}>⭐ {complaintMetrics.avgRating}</div>
                </div>
              </div>

              {/* DEDICATED ESCALATED COMPLAINTS SECTION */}
              {escalatedComplaints.length > 0 && (
                <div className="escalated-complaints-section">
                  <div className="escalated-complaints-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertOctagon size={20} color="#ea580c" />
                      <strong style={{ fontSize: '1.05rem', color: '#9a3412' }}>
                        Escalated Complaints to Hostel Administrator ({escalatedComplaints.length} Overdue Case{escalatedComplaints.length !== 1 ? 's' : ''})
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#c2410c', background: '#fed7aa', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
                      Mandatory 72h SLA Exceeded
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {escalatedComplaints.map(ec => {
                      const dl = getComplaintDeadlineInfo(ec);
                      return (
                        <div key={ec.id} className="escalated-complaint-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span className="escalation-badge">
                                  <AlertTriangle size={13} /> ESCALATED TO HOSTEL ADMIN
                                </span>
                                <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Ticket #{ec.id} — {ec.title}</strong>
                                <span className="admin-badge active">{ec.category}</span>
                              </div>
                              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                                Student: <strong>{ec.studentName}</strong> (Roll {ec.rollNumber}) · {ec.hostel} · <strong>Room {ec.roomNumber}</strong>
                              </div>
                            </div>

                            <button
                              className="admin-action-btn-primary"
                              style={{ background: '#ea580c', borderColor: '#ea580c', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                              onClick={() => setSelectedAdminComplaintModal(ec)}
                            >
                              <ShieldAlert size={14} /> Review &amp; Take Admin Action
                            </button>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#334155', background: '#fffbeb', padding: '8px 12px', borderRadius: '6px' }}>
                            {ec.description || 'Maintenance defect requires urgent supervisory intervention.'}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                            <div>👤 <strong>Assigned Warden:</strong> {ec.assignedWardenName || 'Hostel Warden'}</div>
                            <div>🔧 <strong>Technician:</strong> {ec.assignedStaffName || 'Unassigned'}</div>
                            <div>⏰ <strong>Original 72h Deadline:</strong> {ec.resolutionDeadline ? new Date(ec.resolutionDeadline).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Overdue'}</div>
                            <div style={{ color: '#dc2626', fontWeight: 700 }}>🚨 <strong>Overdue Duration:</strong> {dl.text}</div>
                          </div>

                          {ec.escalationReason && (
                            <div style={{ fontSize: '0.78rem', color: '#9a3412', fontStyle: 'italic', borderTop: '1px dashed #fed7aa', paddingTop: '6px' }}>
                              ⚠️ <strong>Escalation Reason:</strong> {ec.escalationReason} {ec.escalatedAt && `(${new Date(ec.escalatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COMPREHENSIVE FILTER ROW */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['ALL', 'Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Internet / Wi-Fi', 'Civil Works', 'HVAC'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`hostel-floor-pill ${complaintCategoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setComplaintCategoryFilter(cat)}
                      style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
                    >
                      {cat === 'ALL' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
                  {/* Status filter */}
                  <select
                    className="admin-select"
                    value={complaintStatusFilter}
                    onChange={e => setComplaintStatusFilter(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Awaiting Student Verification">Awaiting Verification</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Reopened">Reopened</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Overdue">Overdue (&gt;72h)</option>
                  </select>

                  {/* Hostel filter */}
                  <select
                    className="admin-select"
                    value={complaintHostelFilter}
                    onChange={e => setComplaintHostelFilter(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  >
                    <option value="ALL">All Hostels &amp; Blocks</option>
                    <option value="Sarojini">Sarojini Girls</option>
                    <option value="Kalpana">Kalpana Chawla Girls</option>
                    <option value="Gandhi">Gandhi Boys</option>
                    <option value="Kalam">Kalam Boys</option>
                  </select>

                  {/* Warden filter */}
                  <select
                    className="admin-select"
                    value={complaintWardenFilter}
                    onChange={e => setComplaintWardenFilter(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  >
                    <option value="ALL">All Wardens</option>
                    <option value="Nibedita">Mrs. Nibedita Das</option>
                    <option value="Pratima">Mrs. Pratima Mohapatra</option>
                    <option value="Rajesh">Mr. Rajesh Jena</option>
                    <option value="Manoj">Mr. Manoj Sahoo</option>
                  </select>

                  {/* Escalation filter */}
                  <select
                    className="admin-select"
                    value={complaintEscalationFilter}
                    onChange={e => setComplaintEscalationFilter(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  >
                    <option value="ALL">All Escalations</option>
                    <option value="ESCALATED">Escalated to Admin Only</option>
                    <option value="NORMAL">Standard SLA Only</option>
                  </select>

                  {/* Rating filter */}
                  <select
                    className="admin-select"
                    value={complaintRatingFilter}
                    onChange={e => setComplaintRatingFilter(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  >
                    <option value="ALL">All Student Ratings</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4+">⭐⭐⭐⭐+ (4+ Stars)</option>
                    <option value="low">Under 3 Stars</option>
                  </select>

                  {/* Search input */}
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Search ID, student, roll..."
                    value={complaintSearchQuery}
                    onChange={e => setComplaintSearchQuery(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '4px 10px', width: '160px' }}
                  />
                </div>
              </div>

              {/* COMPLAINTS DATA TABLE */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket ID &amp; 72h SLA</th>
                      <th>Student &amp; Room</th>
                      <th>Category &amp; Priority</th>
                      <th>Issue Description</th>
                      <th>Assigned Warden</th>
                      <th>Assigned Technician</th>
                      <th>Status</th>
                      <th>Student Feedback</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map(c => {
                      const dl = getComplaintDeadlineInfo(c);
                      const isOverdue = dl.isOverdue || c.isEscalated || c.status === 'Escalated';
                      const isAwaitingVerification = c.status === 'Awaiting Student Verification' || c.status === 'Awaiting Verification';
                      const isResolved = c.status === 'Resolved';
                      const isReopened = c.status === 'Reopened';

                      return (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.id}</strong>
                            <div style={{ marginTop: '3px' }}>
                              <span className={`deadline-badge ${dl.state}`} style={{ fontSize: '0.72rem' }}>
                                <Clock size={11} /> {dl.text}
                              </span>
                            </div>
                            {isOverdue && (
                              <div style={{ marginTop: '2px' }}>
                                <span className="escalation-badge" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                                  🚨 Escalated
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{c.studentName}</div>
                            <small style={{ color: '#64748b' }}>Roll {c.rollNumber}</small>
                            <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
                              {c.hostel} · Room {c.roomNumber}
                            </div>
                          </td>
                          <td>
                            <span className="admin-badge active">{c.category}</span>
                            <div style={{ marginTop: '3px' }}>
                              <span className={`admin-badge ${c.priority === 'High' ? 'rejected' : c.priority === 'Medium' ? 'pending' : 'active'}`}>
                                {c.priority}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{c.title}</div>
                            {c.description && (
                              <small style={{ color: '#64748b', display: 'block', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.description}
                              </small>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e40af' }}>
                              {c.assignedWardenName || 'Mrs. Nibedita Das'}
                            </div>
                            <small style={{ color: '#64748b' }}>
                              {c.assignedWardenContact || '+91 94370 33445'}
                            </small>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                              {c.assignedStaffName || 'Triage Queue'}
                            </div>
                            <small style={{ color: '#64748b' }}>{c.assignedStaffRole || 'Technician'}</small>
                          </td>
                          <td>
                            <span className={`admin-badge ${c.status === 'Resolved' ? 'approved' : isAwaitingVerification ? 'pending' : isReopened || isOverdue ? 'rejected' : 'active'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            {isResolved && c.feedbackRating ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#eab308' }}>
                                  {[1, 2, 3, 4, 5].map(st => (
                                    <Star key={st} size={11} fill={st <= c.feedbackRating ? '#eab308' : '#e2e8f0'} />
                                  ))}
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, marginLeft: '3px', color: '#0f172a' }}>{c.feedbackRating}/5</span>
                                </div>
                                {c.feedbackText && (
                                  <small style={{ color: '#475569', display: 'block', fontStyle: 'italic', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    "{c.feedbackText}"
                                  </small>
                                )}
                                <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                                  ✓ Sent to Warden &amp; Admin
                                </span>
                              </div>
                            ) : isAwaitingVerification ? (
                              <span style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600 }}>
                                ⏳ Student verification requested
                              </span>
                            ) : isReopened ? (
                              <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700 }}>
                                ⚠️ Reopened by student
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Pending completion</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {/* Mark Work as Completed button for active complaints */}
                              {(c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Submitted' || c.status === 'Reopened') && (
                                <button
                                  className="admin-action-btn-primary"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.73rem', background: '#059669', borderColor: '#059669' }}
                                  onClick={() => handleMarkWorkCompleted(c.id)}
                                  title="Mark Work as Completed (transitions to Awaiting Student Verification)"
                                >
                                  <Check size={12} /> Mark Work Done
                                </button>
                              )}

                              {/* Staff Assignment Button */}
                              <button
                                className="admin-action-btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.73rem' }}
                                onClick={() => {
                                  setAssignStaffForm({
                                    complaintId: c.id,
                                    staffName: c.assignedStaffName || 'Mr. Pramod Panda (Electrician)',
                                    status: c.status,
                                    resolutionNotes: c.resolutionNotes || ''
                                  });
                                  setIsAssignStaffModalOpen(true);
                                }}
                              >
                                Staff / Notes
                              </button>

                              {/* Admin Case Management Button */}
                              {(isHostelAdmin || isOverdue || c.isEscalated) && (
                                <button
                                  className="admin-action-btn-secondary"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.73rem', background: isOverdue ? '#fff7ed' : '#f8fafc', borderColor: isOverdue ? '#ea580c' : '#cbd5e1', color: isOverdue ? '#ea580c' : '#334155' }}
                                  onClick={() => setSelectedAdminComplaintModal(c)}
                                  title="Review Case and Audit History"
                                >
                                  <Eye size={12} /> Admin Review
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: VISITORS */}
          {activeTab === 'visitors' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Hostel Visitor Gate Pass Register</h2>
                  <p>Real-time campus security log of visiting parents, guardians, and approved guests.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setIsVisitorModalOpen(true)}>
                  <Plus size={15} /> Log New Visitor
                </button>
              </div>

              {/* Visitor Stats */}
              <div className="gate-pass-stats-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <Users size={22} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value">{visitors.length}</div>
                    <div className="gate-pass-stat-label">Total Registered Visitors</div>
                  </div>
                </div>
                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value" style={{ color: '#16a34a' }}>
                      {visitors.filter(v => v.outTime === 'Pending Sign-out' || !v.outTime).length}
                    </div>
                    <div className="gate-pass-stat-label">Currently on Campus</div>
                  </div>
                </div>
                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
                    <LogOut size={22} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value">
                      {visitors.filter(v => v.outTime && v.outTime !== 'Pending Sign-out').length}
                    </div>
                    <div className="gate-pass-stat-label">Departed / Checked Out</div>
                  </div>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Visitor Name &amp; Relation</th>
                      <th>Visiting Resident</th>
                      <th>Time-In</th>
                      <th>Time-Out</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map(v => {
                      const isOnCampus = v.outTime === 'Pending Sign-out' || !v.outTime;
                      return (
                        <tr key={v.id}>
                          <td><code>{v.passNumber}</code></td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{v.visitorName}</div>
                            <small style={{ color: '#64748b' }}>Relation: {v.relation}</small>
                          </td>
                          <td>
                            <div>{v.studentName}</div>
                            <small style={{ color: '#64748b' }}>Roll {v.rollNumber}</small>
                          </td>
                          <td>{v.inTime}</td>
                          <td>{v.outTime}</td>
                          <td>{v.purpose}</td>
                          <td>
                            <span className={`admin-badge ${isOnCampus ? 'pending' : 'approved'}`}>
                              {isOnCampus ? 'On Campus' : 'Departed'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                className="admin-action-btn-secondary"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                                onClick={() => setSelectedVisitorForPass(v)}
                              >
                                Print Pass
                              </button>
                              {isOnCampus && (
                                <button
                                  className="hostel-quick-reject-btn"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                                  onClick={() => handleCheckOutVisitor(v.id)}
                                >
                                  Check Out
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: GATE PASSES */}
          {activeTab === 'gatepasses' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Resident Student Outstation &amp; Home Gate Passes</h2>
                  <p>
                    Review student leave requests verified by academic mentors. Approve digital passes, record physical departures, and log campus returns.
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="gate-pass-stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value">{gatePasses.length}</div>
                    <div className="gate-pass-stat-label">Total Outing Passes</div>
                  </div>
                </div>

                <div className="gate-pass-stat-card" style={{ border: pendingGatePassCount > 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
                  <div className="gate-pass-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value" style={{ color: '#d97706' }}>{pendingGatePassCount}</div>
                    <div className="gate-pass-stat-label">Pending Warden Action</div>
                  </div>
                </div>

                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value" style={{ color: '#16a34a' }}>
                      {gatePasses.filter(p => p.status === 'Approved').length}
                    </div>
                    <div className="gate-pass-stat-label">Approved &amp; Awaiting Exit</div>
                  </div>
                </div>

                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value" style={{ color: '#7c3aed' }}>
                      {exitedStudentsCount}
                    </div>
                    <div className="gate-pass-stat-label">Currently Outside Campus</div>
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('ALL')}
                  >
                    All Passes ({gatePasses.length})
                  </button>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('PENDING')}
                    style={gatePassStatusFilter === 'PENDING' ? { background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' } : {}}
                  >
                    ⏳ Pending Review ({pendingGatePassCount})
                  </button>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'APPROVED' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('APPROVED')}
                    style={gatePassStatusFilter === 'APPROVED' ? { background: '#16a34a', color: '#fff', borderColor: '#16a34a' } : {}}
                  >
                    ✓ Approved
                  </button>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'EXITED' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('EXITED')}
                  >
                    🚶 Exited Campus
                  </button>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'RETURNED' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('RETURNED')}
                  >
                    🏠 Returned
                  </button>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'OVERDUE' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('OVERDUE')}
                    style={gatePassStatusFilter === 'OVERDUE' ? { background: '#dc2626', color: '#fff', borderColor: '#dc2626' } : {}}
                  >
                    ⚠️ Overdue ({overduePasses.length})
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search Student / Roll / Destination..."
                      value={gatePassSearch}
                      onChange={e => setGatePassSearch(e.target.value)}
                      className="admin-search-input"
                      style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Resident Student</th>
                      <th>Hostel &amp; Room</th>
                      <th>Destination &amp; Purpose</th>
                      <th>Departure &amp; Return</th>
                      <th>Mentor Verification</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Warden Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGatePasses.map(pass => {
                      const isPending = pass.status === 'Pending Warden Approval';
                      const isApproved = pass.status === 'Approved';
                      const isExited = pass.status === 'Exited Campus';
                      const isReturned = pass.status === 'Returned to Hostel';
                      const isOverdue = isExited && pass.inDateTime && new Date(pass.inDateTime).getTime() < Date.now();

                      return (
                        <tr key={pass.id}>
                          <td>
                            <strong style={{ color: '#4338ca', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                              {pass.id}
                            </strong>
                            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>{pass.appliedAt}</div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: pass.gender === 'Female' ? '#fdf2f8' : '#eff6ff',
                                color: pass.gender === 'Female' ? '#db2777' : '#2563eb',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 700,
                                fontSize: '0.85rem'
                              }}>
                                {pass.studentName.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{pass.studentName}</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                  Roll {pass.rollNumber} · {pass.department}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>
                                  📞 {pass.studentPhone}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{pass.hostelName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700 }}>
                              {pass.roomNumber} ({pass.bedNo})
                            </div>
                          </td>

                          <td>
                            <span className="admin-badge active" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                              {pass.purposeType}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {pass.destination}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.78rem' }}>
                              <span style={{ color: '#64748b' }}>Out:</span> <strong>{pass.outDateTime ? pass.outDateTime.replace('T', ' ') : 'N/A'}</strong>
                            </div>
                            <div style={{ fontSize: '0.78rem' }}>
                              <span style={{ color: '#64748b' }}>In:</span> <strong>{pass.inDateTime ? pass.inDateTime.replace('T', ' ') : 'N/A'}</strong>
                            </div>
                          </td>

                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f0fdf4',
                              color: '#166534',
                              border: '1px solid #bbf7d0',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              <CheckCircle2 size={12} /> {pass.mentorStatus || 'Verified'}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              {pass.mentorName}
                            </div>
                          </td>

                          <td>
                            {isOverdue ? (
                              <span className="gp-badge gp-badge-rejected" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                                ⚠️ Overdue Return
                              </span>
                            ) : isExited ? (
                              <span className="gp-badge gp-badge-pending" style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}>
                                🚶 Exited Campus
                              </span>
                            ) : isReturned ? (
                              <span className="gp-badge gp-badge-approved">
                                🏠 Returned to Hostel
                              </span>
                            ) : isApproved ? (
                              <span className="gp-badge gp-badge-approved">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            ) : isPending ? (
                              <span className="gp-badge gp-badge-pending">
                                <Clock size={12} /> Pending Approval
                              </span>
                            ) : (
                              <span className="gp-badge gp-badge-rejected">Rejected</span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="admin-action-btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  setSelectedGatePassModal(pass);
                                  setWardenReviewRemarks(pass.wardenRemarks || 'Application and mentor clearance verified. Outstation pass granted.');
                                }}
                              >
                                <Eye size={13} /> View
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    className="hostel-quick-approve-btn"
                                    onClick={() => handleApproveGatePass(pass.id)}
                                    title="Approve Gate Pass"
                                  >
                                    <Check size={13} /> Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="hostel-quick-reject-btn"
                                    onClick={() => handleRejectGatePass(pass.id)}
                                    title="Reject Gate Pass"
                                  >
                                    <X size={13} />
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <button
                                  type="button"
                                  className="admin-action-btn-primary"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', background: '#4f46e5' }}
                                  onClick={() => handleRecordExit(pass.id)}
                                  title="Record Student Physical Exit at Gate"
                                >
                                  Log Exit
                                </button>
                              )}

                              {isExited && (
                                <button
                                  type="button"
                                  className="admin-action-btn-primary"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', background: '#059669' }}
                                  onClick={() => handleRecordReturn(pass.id)}
                                  title="Record Student Campus Arrival"
                                >
                                  Log Return
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredGatePasses.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                          <ShieldCheck size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                          <p style={{ margin: 0, fontWeight: 600 }}>No gate pass records matching the criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: OCCUPANCY REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Hostel Occupancy Census &amp; Maintenance Gazettes</h2>
                  <p>Comprehensive accommodation returns and maintenance turnarounds for institutional records.</p>
                </div>
              </div>

              {/* Interactive Report Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="admin-card">
                  <h3 className="admin-card-title">Hostel Occupancy Census PDF</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Formatted official printout with residential breakdown, warden rosters, and occupancy metrics.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => {
                    downloadHostelCensusPdf(hostels);
                    showToast('Generated and downloaded Hostel Occupancy Census PDF.');
                  }}>
                    <Download size={15} /> Download PDF Census
                  </button>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Hostel Occupancy Data (CSV)</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Direct spreadsheet export with bed occupancy, vacancy counts, and warden emergency contacts.
                  </p>
                  <button className="admin-action-btn-primary" style={{ background: '#059669' }} onClick={exportOccupancyCsv}>
                    <Download size={15} /> Export Occupancy CSV
                  </button>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Maintenance Complaints Audit (CSV)</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Spreadsheet audit of electrical, plumbing, Wi-Fi, and carpentry tickets with resolution notes.
                  </p>
                  <button className="admin-action-btn-secondary" onClick={exportComplaintsCsv}>
                    <Download size={15} /> Export Complaints CSV
                  </button>
                </div>
              </div>

              {/* Census Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Hostel Complex</th>
                      <th>Category</th>
                      <th>Total Floors</th>
                      <th>Total Rooms</th>
                      <th>Total Beds</th>
                      <th>Occupied Beds</th>
                      <th>Available Beds</th>
                      <th>Occupancy Rate</th>
                      <th>Chief Warden</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostels.map(h => {
                      const rate = Math.round(((h.occupiedBeds || 0) / (h.totalBeds || 1)) * 100);
                      return (
                        <tr key={h.id}>
                          <td><strong>{h.name}</strong></td>
                          <td><span className="admin-badge active">{h.type} Hostel</span></td>
                          <td>{h.totalFloors} Floors</td>
                          <td>{h.totalRooms} Rooms</td>
                          <td>{h.totalBeds} Beds</td>
                          <td><strong style={{ color: '#7c3aed' }}>{h.occupiedBeds}</strong></td>
                          <td><strong style={{ color: '#059669' }}>{h.availableBeds}</strong></td>
                          <td>
                            <span className="admin-badge approved">{rate}%</span>
                          </td>
                          <td>{h.warden}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: STUDENT DOCUMENTS */}
          {activeTab === 'documents' && (
            <StudentDocumentsTable portalRole="warden" />
          )}

          {/* TAB 9: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="hostel" />
          )}

          {/* ── 15 NEW HOSTEL WARDEN SECTIONS ── */}
          {/* TAB 10: HOSTEL ATTENDANCE */}
          {activeTab === 'attendance' && (
            <HostelAttendanceSection />
          )}

          {/* TAB 11: LEAVE MANAGEMENT */}
          {activeTab === 'leave-mgmt' && (
            <HostelLeaveSection onNavigateApplyLeave={() => setActiveTab('apply-leave')} />
          )}

          {/* TAB: HOSTEL ADMIN APPROVALS (Only for Hostel Admin) */}
          {activeTab === 'hostel-admin-approvals' && (
            <HostelApplyLeaveModule
              account={account}
              initialTab="approvals"
              isHostelAdminMode={true}
              onNavigateLeaves={() => setActiveTab('leave-mgmt')}
            />
          )}

          {/* TAB: APPLY LEAVE & INSTRUCTIONS */}
          {activeTab === 'apply-leave' && (
            <HostelApplyLeaveModule
              account={account}
              initialTab="apply"
              isHostelAdminMode={isHostelAdmin}
              onNavigateLeaves={() => setActiveTab('leave-mgmt')}
            />
          )}

          {/* TAB 12: MESS & DINING MANAGEMENT */}
          {activeTab === 'mess-dining' && (
            <HostelMessSection />
          )}

          {/* TAB 13: MAINTENANCE & REPAIRS */}
          {activeTab === 'maintenance-repairs' && (
            <HostelMaintenanceSection />
          )}

          {/* TAB 14: HOSTEL STAFF MANAGEMENT */}
          {activeTab === 'staff-mgmt' && (
            <HostelStaffSection />
          )}

          {/* TAB 15: DISCIPLINARY MANAGEMENT */}
          {activeTab === 'disciplinary' && (
            <HostelDisciplinarySection />
          )}

          {/* TAB 16: EMERGENCY & INCIDENT REPORTS */}
          {activeTab === 'emergency-incidents' && (
            <HostelEmergencyIncidentsSection />
          )}

          {/* TAB 17: INVENTORY & ASSETS */}
          {activeTab === 'inventory-assets' && (
            <HostelInventorySection account={account} isHostelAdmin={isHostelAdmin} />
          )}

          {/* TAB 18: HOSTEL NOTICES & ANNOUNCEMENTS */}
          {activeTab === 'notices-announcements' && (
            <HostelNoticesSection />
          )}

          {/* TAB 19: STUDENT CHECK-IN / CHECK-OUT */}
          {activeTab === 'checkin-checkout' && (
            <HostelCheckinCheckoutSection />
          )}

          {/* TAB 20: HOSTEL FEES & DUES */}
          {activeTab === 'fees-dues' && (
            <HostelFeesSection />
          )}

          {/* TAB 21: FEEDBACK & SUGGESTIONS */}
          {activeTab === 'feedback-suggestions' && (
            <HostelFeedbackSection />
          )}

          {/* TAB 22: INSPECTION & COMPLIANCE */}
          {activeTab === 'inspection-compliance' && (
            <HostelInspectionSection />
          )}

          {/* TAB 23: EMERGENCY CONTACTS */}
          {activeTab === 'emergency-contacts' && (
            <HostelEmergencyContactsSection />
          )}

          {/* TAB 24: SETTINGS & HOSTEL RULES */}
          {activeTab === 'settings-rules' && (
            <HostelSettingsRulesSection />
          )}
        </div>
      </AppLayout>


      {/* ── MODAL: ALLOCATE BED ── */}
      {isAllocateModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAllocateModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Allocate Available Bed</h3>
              <button className="admin-table-action-btn" onClick={() => setIsAllocateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAllocateBedSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Select Student</label>
                  <select
                    className="admin-form-select"
                    value={allocateForm.studentRoll}
                    onChange={e => setAllocateForm({ ...allocateForm, studentRoll: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Resident Student --</option>
                    {students.map(s => (
                      <option key={s.rollNumber} value={s.rollNumber}>
                        {s.name} (Roll: {s.rollNumber} · {s.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Target Hostel</label>
                    <select
                      className="admin-form-select"
                      value={allocateForm.hostelId}
                      onChange={e => setAllocateForm({ ...allocateForm, hostelId: e.target.value })}
                      required
                    >
                      {hostels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Room Number</label>
                    <select
                      className="admin-form-select"
                      value={allocateForm.roomNumber}
                      onChange={e => setAllocateForm({ ...allocateForm, roomNumber: e.target.value })}
                      required
                    >
                      {rooms.map(rm => (
                        <option key={rm.id} value={rm.roomNumber}>
                          Room {rm.roomNumber} ({rm.type} · {rm.occupied}/{rm.capacity} beds)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Bed Allocation</label>
                  <select
                    className="admin-form-select"
                    value={allocateForm.bedNumber}
                    onChange={e => setAllocateForm({ ...allocateForm, bedNumber: e.target.value })}
                    required
                  >
                    <option value="Bed 01 (Window Side)">Bed 01 (Window Side)</option>
                    <option value="Bed 02 (Study Side)">Bed 02 (Study Side)</option>
                    <option value="Bed 03 (Inner Side)">Bed 03 (Inner Side)</option>
                    <option value="Bed 04 (Door Side)">Bed 04 (Door Side)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsAllocateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Confirm Bed Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TRANSFER RESIDENT ── */}
      {isTransferModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsTransferModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Transfer Resident to Another Room</h3>
              <button className="admin-table-action-btn" onClick={() => setIsTransferModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleTransferBedSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Select Resident Student</label>
                  <select
                    className="admin-form-select"
                    value={transferForm.studentRoll}
                    onChange={e => {
                      const std = students.find(s => s.rollNumber === e.target.value);
                      setTransferForm({
                        ...transferForm,
                        studentRoll: e.target.value,
                        studentName: std ? std.name : '',
                        currentRoomNumber: '204'
                      });
                    }}
                    required
                  >
                    <option value="">-- Choose Student to Transfer --</option>
                    {students.map(s => (
                      <option key={s.rollNumber} value={s.rollNumber}>
                        {s.name} (Roll {s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Destination Hostel</label>
                    <select
                      className="admin-form-select"
                      value={transferForm.targetHostelName}
                      onChange={e => setTransferForm({ ...transferForm, targetHostelName: e.target.value })}
                      required
                    >
                      {hostels.map(h => (
                        <option key={h.id} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Destination Room Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={transferForm.targetRoomNumber}
                      onChange={e => setTransferForm({ ...transferForm, targetRoomNumber: e.target.value })}
                      placeholder="e.g. 102"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Reason for Transfer</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={transferForm.reason}
                    onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsTransferModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Execute Atomic Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VACATE CONFIRMATION ── */}
      {isVacateConfirmOpen && vacateTarget && (
        <div className="admin-modal-backdrop" onClick={() => setIsVacateConfirmOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Confirm Bed Release</h3>
              <button className="admin-table-action-btn" onClick={() => setIsVacateConfirmOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to vacate Room <strong>{vacateTarget.roomNumber}</strong> for student <strong>{vacateTarget.studentName}</strong>?
                This will release bed capacity and restore room availability in real-time.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-action-btn-secondary" onClick={() => setIsVacateConfirmOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                style={{ background: '#dc2626' }}
                onClick={handleVacateBedConfirm}
              >
                Confirm Vacate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: LODGE MAINTENANCE COMPLAINT ── */}
      {isComplaintModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsComplaintModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Lodge Resident Maintenance Complaint</h3>
              <button className="admin-table-action-btn" onClick={() => setIsComplaintModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleLogComplaintSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Student Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={complaintForm.studentName}
                      onChange={e => setComplaintForm({ ...complaintForm, studentName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Roll Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={complaintForm.rollNumber}
                      onChange={e => setComplaintForm({ ...complaintForm, rollNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Hostel</label>
                    <select
                      className="admin-form-select"
                      value={complaintForm.hostel}
                      onChange={e => setComplaintForm({ ...complaintForm, hostel: e.target.value })}
                      required
                    >
                      {hostels.map(h => (
                        <option key={h.id} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Room Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={complaintForm.roomNumber}
                      onChange={e => setComplaintForm({ ...complaintForm, roomNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      className="admin-form-select"
                      value={complaintForm.category}
                      onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}
                      required
                    >
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Internet / Wi-Fi">Internet / Wi-Fi</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Safety">Safety</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Priority</label>
                    <select
                      className="admin-form-select"
                      value={complaintForm.priority}
                      onChange={e => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Issue Title</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={complaintForm.title}
                    onChange={e => setComplaintForm({ ...complaintForm, title: e.target.value })}
                    placeholder="e.g. Bathroom geyser not heating properly"
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsComplaintModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Submit Maintenance Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ASSIGN STAFF TO COMPLAINT ── */}
      {isAssignStaffModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAssignStaffModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Assign Technician &amp; Resolution Notes</h3>
              <button className="admin-table-action-btn" onClick={() => setIsAssignStaffModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssignStaffSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Assigned Campus Technician</label>
                  <select
                    className="admin-form-select"
                    value={assignStaffForm.staffName}
                    onChange={e => setAssignStaffForm({ ...assignStaffForm, staffName: e.target.value })}
                    required
                  >
                    <option value="Mr. Pramod Panda (Electrician)">Mr. Pramod Panda (Electrician)</option>
                    <option value="Mr. Suresh Mohapatra (Plumber)">Mr. Suresh Mohapatra (Plumber)</option>
                    <option value="Mr. Tapan Barik (Senior IT Technician)">Mr. Tapan Barik (Senior IT Technician)</option>
                    <option value="Mr. Dilip Behera (HVAC Technician)">Mr. Dilip Behera (HVAC Technician)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Current Status</label>
                  <select
                    className="admin-form-select"
                    value={assignStaffForm.status}
                    onChange={e => setAssignStaffForm({ ...assignStaffForm, status: e.target.value })}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Resolution / Inspection Notes</label>
                  <textarea
                    className="admin-form-input"
                    rows={3}
                    value={assignStaffForm.resolutionNotes}
                    onChange={e => setAssignStaffForm({ ...assignStaffForm, resolutionNotes: e.target.value })}
                    placeholder="Enter technician visit notes or work order details..."
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsAssignStaffModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: HOSTEL ADMINISTRATOR COMPLAINT REVIEW & AUDIT ACTION ── */}
      {selectedAdminComplaintModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedAdminComplaintModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                  Administrator Case Review — #{selectedAdminComplaintModal.id}
                </h3>
                <small style={{ color: '#64748b' }}>
                  Hostel Management SLA Governance &amp; Escalation Resolution
                </small>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedAdminComplaintModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdminActionSubmit}>
              <div className="admin-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                {/* Status & Escalation Alert */}
                {(selectedAdminComplaintModal.isEscalated || selectedAdminComplaintModal.status === 'Escalated' || getComplaintDeadlineInfo(selectedAdminComplaintModal).isOverdue) && (
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '10px 12px', marginBottom: '1rem', color: '#9a3412', fontSize: '0.82rem' }}>
                    <strong>🚨 Case Escalated to Hostel Administrator:</strong>
                    <div>{selectedAdminComplaintModal.escalationReason || 'Resolution deadline of 72 hours has been exceeded. Case requires administrative direction.'}</div>
                    <div style={{ fontSize: '0.74rem', color: '#c2410c', marginTop: '4px' }}>
                      Status: {selectedAdminComplaintModal.status} · SLA Duration Overdue: {getComplaintDeadlineInfo(selectedAdminComplaintModal).text}
                    </div>
                  </div>
                )}

                {/* Complaint Overview */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '0.84rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{selectedAdminComplaintModal.title}</div>
                  <div style={{ color: '#475569', marginTop: '4px' }}>{selectedAdminComplaintModal.description}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                    <div>👤 <strong>Student:</strong> {selectedAdminComplaintModal.studentName} ({selectedAdminComplaintModal.rollNumber})</div>
                    <div>🏠 <strong>Room:</strong> {selectedAdminComplaintModal.hostel} · Room {selectedAdminComplaintModal.roomNumber}</div>
                    <div>🛡️ <strong>Assigned Warden:</strong> {selectedAdminComplaintModal.assignedWardenName || 'Hostel Warden'}</div>
                    <div>🔧 <strong>Technician:</strong> {selectedAdminComplaintModal.assignedStaffName || 'Unassigned'}</div>
                    <div>⏰ <strong>72h SLA Deadline:</strong> {selectedAdminComplaintModal.resolutionDeadline ? new Date(selectedAdminComplaintModal.resolutionDeadline).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '72h from submission'}</div>
                    <div>📅 <strong>Submitted:</strong> {selectedAdminComplaintModal.filedDate || 'Recent'}</div>
                  </div>
                </div>

                {/* Verified Student Feedback (if available) */}
                {selectedAdminComplaintModal.feedbackRating && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={16} fill="#eab308" color="#eab308" />
                      <strong style={{ fontSize: '0.88rem', color: '#166534' }}>
                        Student Verified Feedback ({selectedAdminComplaintModal.feedbackRating}/5 Stars)
                      </strong>
                    </div>
                    {selectedAdminComplaintModal.feedbackText && (
                      <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#14532d', fontStyle: 'italic' }}>
                        "{selectedAdminComplaintModal.feedbackText}"
                      </p>
                    )}
                    <div style={{ fontSize: '0.74rem', color: '#15803d', marginTop: '4px' }}>
                      ✓ Feedback successfully routed to both Resident Warden &amp; Hostel Administrator
                    </div>
                  </div>
                )}

                {/* Status & Audit History Timeline */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Audit History &amp; SLA Event Trail
                  </label>
                  <div className="history-timeline-list">
                    {Array.isArray(selectedAdminComplaintModal.statusHistory) && selectedAdminComplaintModal.statusHistory.length > 0 ? (
                      selectedAdminComplaintModal.statusHistory.map((item, idx) => (
                        <div key={idx} className="history-timeline-item">
                          <div>
                            <strong>{item.status}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '8px' }}>
                              {item.timestamp ? new Date(item.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recorded'}
                            </span>
                          </div>
                          {item.note && <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{item.note}</div>}
                        </div>
                      ))
                    ) : (
                      <div className="history-timeline-item">
                        <div><strong>Submitted</strong> — Initial registration in campus portal</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Administrator Action Selector */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                    Select Administrative Action
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`hostel-floor-pill ${adminActionTab === 'NOTE' ? 'active' : ''}`}
                      onClick={() => setAdminActionTab('NOTE')}
                    >
                      Add Internal Note
                    </button>
                    <button
                      type="button"
                      className={`hostel-floor-pill ${adminActionTab === 'REASSIGN' ? 'active' : ''}`}
                      onClick={() => setAdminActionTab('REASSIGN')}
                    >
                      Reassign Responsible Staff
                    </button>
                    <button
                      type="button"
                      className={`hostel-floor-pill ${adminActionTab === 'CLOSE' ? 'active' : ''}`}
                      onClick={() => setAdminActionTab('CLOSE')}
                    >
                      Close Administrative Case
                    </button>
                  </div>

                  {adminActionTab === 'REASSIGN' && (
                    <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                      <label>Reassign Maintenance Technician / Specialist</label>
                      <select
                        className="admin-form-select"
                        value={adminReassignStaffInput}
                        onChange={e => setAdminReassignStaffInput(e.target.value)}
                      >
                        <option value="Mr. Suresh Mohapatra (Plumber)">Mr. Suresh Mohapatra (Senior Plumber)</option>
                        <option value="Mr. Pramod Panda (Electrician)">Mr. Pramod Panda (Senior Electrician)</option>
                        <option value="Mr. Tapan Barik (Senior IT Technician)">Mr. Tapan Barik (Senior IT Specialist)</option>
                        <option value="Mr. Dilip Behera (HVAC Technician)">Mr. Dilip Behera (HVAC &amp; Cooling Specialist)</option>
                        <option value="Mr. Ramesh Nayak (Carpentry & Civil)">Mr. Ramesh Nayak (Carpentry &amp; Civil Works)</option>
                      </select>
                    </div>
                  )}

                  <div className="admin-form-group">
                    <label>
                      {adminActionTab === 'NOTE' ? 'Internal Administrator Note' : adminActionTab === 'REASSIGN' ? 'Reassignment Reason & Instructions' : 'Case Closure Verification Remarks'}
                    </label>
                    <textarea
                      className="admin-form-input"
                      rows={3}
                      value={adminNoteInput}
                      onChange={e => setAdminNoteInput(e.target.value)}
                      placeholder={
                        adminActionTab === 'NOTE'
                          ? 'Enter internal notes, supervisor directives, or contractor instructions...'
                          : adminActionTab === 'REASSIGN'
                          ? 'Enter instructions for newly assigned technician...'
                          : 'Confirm reason for administrative closure and satisfaction verification...'
                      }
                      required={adminActionTab === 'CLOSE'}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setSelectedAdminComplaintModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary" style={{ background: adminActionTab === 'CLOSE' ? '#059669' : '#7c3aed' }}>
                  {adminActionTab === 'NOTE' ? 'Save Internal Note' : adminActionTab === 'REASSIGN' ? 'Reassign Staff' : 'Close Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAddHostelModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddHostelModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Register New Hostel Complex</h3>
              <button className="admin-table-action-btn" onClick={() => setIsAddHostelModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddHostelSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Hostel Name</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={hostelForm.name}
                    onChange={e => setHostelForm({ ...hostelForm, name: e.target.value })}
                    placeholder="e.g. Ramanujan Boys Residence"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      className="admin-form-select"
                      value={hostelForm.type}
                      onChange={e => setHostelForm({ ...hostelForm, type: e.target.value })}
                    >
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Floors</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={hostelForm.totalFloors}
                      onChange={e => setHostelForm({ ...hostelForm, totalFloors: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Total Rooms</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={hostelForm.totalRooms}
                      onChange={e => setHostelForm({ ...hostelForm, totalRooms: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Approved Bed Capacity</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={hostelForm.totalBeds}
                      onChange={e => setHostelForm({ ...hostelForm, totalBeds: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Resident Warden Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={hostelForm.warden}
                      onChange={e => setHostelForm({ ...hostelForm, warden: e.target.value })}
                      placeholder="e.g. Dr. A. K. Nayak"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Emergency Contact Phone</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={hostelForm.contact}
                    onChange={e => setHostelForm({ ...hostelForm, contact: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsAddHostelModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Register Hostel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PRINTABLE VISITOR PASS ── */}
      {selectedVisitorForPass && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedVisitorForPass(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Digital Visitor Gate Pass</h3>
              <button className="admin-table-action-btn" onClick={() => setSelectedVisitorForPass(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{
                border: '2px dashed #7c3aed',
                borderRadius: '12px',
                padding: '1.5rem',
                background: '#faf5ff'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  APNA CAMPUS · VISITOR GATE PASS
                </div>
                <h3 style={{ margin: '0.5rem 0 0.2rem', color: '#0f172a' }}>{selectedVisitorForPass.visitorName}</h3>
                <span className="admin-badge approved" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                  Relation: {selectedVisitorForPass.relation}
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left', fontSize: '0.84rem', margin: '1rem 0' }}>
                  <div><strong>Pass #:</strong> {selectedVisitorForPass.passNumber}</div>
                  <div><strong>Badge #:</strong> {selectedVisitorForPass.badgeNumber || 'BADGE-01'}</div>
                  <div><strong>Resident:</strong> {selectedVisitorForPass.studentName}</div>
                  <div><strong>Roll #:</strong> {selectedVisitorForPass.rollNumber}</div>
                  <div><strong>Time-In:</strong> {selectedVisitorForPass.inTime}</div>
                  <div><strong>Time-Out:</strong> {selectedVisitorForPass.outTime}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={48} color="#0f172a" />
                  <div style={{ textAlign: 'left', fontSize: '0.72rem', color: '#64748b' }}>
                    <strong>Gate Security Turnstile QR</strong><br />
                    Scan at Main Security Checkpoint
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-action-btn-secondary" onClick={() => window.print()}>
                <Printer size={14} /> Print Pass
              </button>
              <button type="button" className="admin-action-btn-primary" onClick={() => setSelectedVisitorForPass(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ISSUE VISITOR PASS ── */}
      {isVisitorModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsVisitorModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Issue Hostel Gate Visitor Pass</h3>
              <button className="admin-table-action-btn" onClick={() => setIsVisitorModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVisitor}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Visitor Full Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={visitorForm.visitorName}
                      onChange={e => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                      placeholder="e.g. Mr. Ramesh Das"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Relationship</label>
                    <select
                      className="admin-form-select"
                      value={visitorForm.relation}
                      onChange={e => setVisitorForm({ ...visitorForm, relation: e.target.value })}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Local Guardian">Local Guardian</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Resident Roll #</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={visitorForm.rollNumber}
                      onChange={e => setVisitorForm({ ...visitorForm, rollNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Resident Student Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={visitorForm.studentName}
                      onChange={e => setVisitorForm({ ...visitorForm, studentName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Purpose of Visit</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={visitorForm.purpose}
                      onChange={e => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                      placeholder="e.g. Delivering essential study materials"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Security Badge #</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={visitorForm.badgeNumber}
                      onChange={e => setVisitorForm({ ...visitorForm, badgeNumber: e.target.value })}
                      placeholder="BADGE-01"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsVisitorModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW STUDENT DETAILS ── */}
      {selectedStudentModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedStudentModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '680px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: selectedStudentModal.gender === 'Female' ? '#fdf2f8' : '#eff6ff',
                  color: selectedStudentModal.gender === 'Female' ? '#db2777' : '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: `2px solid ${selectedStudentModal.gender === 'Female' ? '#fbcfe8' : '#bfdbfe'}`
                }}>
                  {selectedStudentModal.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                    {selectedStudentModal.name}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Student ID: <strong>{selectedStudentModal.studentId}</strong> · Reg: {selectedStudentModal.registrationNumber} · Roll: {selectedStudentModal.rollNumber}
                  </p>
                </div>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedStudentModal(null)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  🏠 Hostel Accommodation &amp; Bed Allocation
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Hostel Residence</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{selectedStudentModal.hostelName}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Room &amp; Bed #</span>
                    <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.92rem' }}>
                      {selectedStudentModal.roomNumber} · {selectedStudentModal.bedNo}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Resident Warden</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                      {selectedStudentModal.wardenName} ({selectedStudentModal.wardenContact})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Biometric Attendance</span>
                    <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>
                      ✓ {selectedStudentModal.biometricStatus}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  🎓 Academic &amp; Personal Particulars
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                  <div><strong>Course:</strong> B.Tech - {selectedStudentModal.department}</div>
                  <div><strong>Academic Year:</strong> 2026-27 (Autonomous)</div>
                  <div><strong>Current Semester:</strong> {selectedStudentModal.semester}</div>
                  <div><strong>Section:</strong> {selectedStudentModal.section}</div>
                  <div><strong>Gender / Sex:</strong> {selectedStudentModal.gender === 'Female' ? 'Female (Girl)' : 'Male (Boy)'}</div>
                  <div><strong>Blood Group:</strong> {selectedStudentModal.bloodGroup}</div>
                  <div><strong>CGPA:</strong> {selectedStudentModal.cgpa} / 10.0</div>
                  <div><strong>Class Attendance:</strong> {selectedStudentModal.attendance}%</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  👨‍👩‍👦 Emergency &amp; Guardian Contacts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                  <div><strong>Student Phone:</strong> {selectedStudentModal.phone}</div>
                  <div><strong>Father / Guardian:</strong> {selectedStudentModal.fatherName} ({selectedStudentModal.fatherPhone})</div>
                  <div><strong>Mother Name:</strong> {selectedStudentModal.motherName}</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Permanent Home Address:</strong> {selectedStudentModal.permAddress}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} /> Print Resident Slip
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                onClick={() => setSelectedStudentModal(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: WARDEN GATE PASS REVIEW DOSSIER ── */}
      {selectedGatePassModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedGatePassModal(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '720px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="admin-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: selectedGatePassModal.gender === 'Female' ? '#fdf2f8' : '#eff6ff',
                  color: selectedGatePassModal.gender === 'Female' ? '#db2777' : '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: `2px solid ${selectedGatePassModal.gender === 'Female' ? '#fbcfe8' : '#bfdbfe'}`
                }}>
                  {selectedGatePassModal.studentName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                    Gate Pass Dossier · {selectedGatePassModal.id}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {selectedGatePassModal.studentName} (Roll: {selectedGatePassModal.rollNumber} · Reg: {selectedGatePassModal.registrationNumber}) · {selectedGatePassModal.department}
                  </p>
                </div>
              </div>
              <button
                className="admin-table-action-btn"
                onClick={() => setSelectedGatePassModal(null)}
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  🏠 Accommodation &amp; Travel Particulars
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Hostel Residence</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedGatePassModal.hostelName}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Room &amp; Bed #</span>
                    <div style={{ fontWeight: 700, color: '#7c3aed' }}>
                      {selectedGatePassModal.roomNumber} ({selectedGatePassModal.bedNo})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Reason / Purpose</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedGatePassModal.purposeType}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Parent Contact</span>
                    <div style={{ fontWeight: 600, color: '#2563eb' }}>
                      <Phone size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      {selectedGatePassModal.parentPhone || selectedGatePassModal.emergencyContact}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Destination Full Address</span>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{selectedGatePassModal.destination}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Departure Schedule</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {selectedGatePassModal.outDateTime ? selectedGatePassModal.outDateTime.replace('T', ' ') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Expected Return</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {selectedGatePassModal.inDateTime ? selectedGatePassModal.inDateTime.replace('T', ' ') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Academic Mentor Verification &amp; Endorsement
                  </div>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', border: '1px solid #86efac' }}>
                    ✓ Mentor Verified
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <strong>Faculty Mentor:</strong> {selectedGatePassModal.mentorName} ({selectedGatePassModal.mentorEmpId || 'Faculty Advisor'})
                  </div>
                  <div>
                    <strong>Department:</strong> {selectedGatePassModal.mentorDepartment || selectedGatePassModal.department}
                  </div>
                  <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #dcfce7', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Mentor Endorsement Remark:</span>
                    <p style={{ margin: '3px 0 0 0', color: '#166534', fontWeight: 600 }}>
                      "{selectedGatePassModal.mentorRemarks || 'Verified attendance norms and exams. Student recommended for leave.'}"
                    </p>
                  </div>
                </div>
              </div>

              {selectedGatePassModal.uploadedApplicationDoc && (
                <div style={{ background: '#fdfbf7', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} /> Attached Handwritten Student Application &amp; Approved Mentor Signature
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#1e3a8a', background: '#eff6ff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', fontWeight: 600 }}>
                      ✍️ Verified Handwritten Original · {selectedGatePassModal.uploadedApplicationDoc.fileName}
                    </span>
                  </div>

                  <div style={{ maxHeight: '420px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0.5rem' }}>
                    <HandwrittenApplicationLetter pass={selectedGatePassModal} doc={selectedGatePassModal.uploadedApplicationDoc} />
                  </div>
                </div>
              )}

              {selectedGatePassModal.status === 'Approved' ? (
                <div className="hostel-stamp-approved-box">
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                    ✓ OFFICIALLY APPROVED BY HOSTEL WARDEN
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '4px' }}>
                    Approved by: <strong>{selectedGatePassModal.approvedBy}</strong> on {selectedGatePassModal.approvedAt}
                  </div>
                  {selectedGatePassModal.wardenRemarks && (
                    <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '4px', fontStyle: 'italic' }}>
                      Remarks: "{selectedGatePassModal.wardenRemarks}"
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    <QrCode size={14} /> Digital Biometric Exit Code Active at Campus Gates
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.15rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    ✍️ Warden Approval Decision &amp; Instructions
                  </div>
                  <div className="admin-form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78350f' }}>
                      Warden Remarks / Special Permissions
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={wardenReviewRemarks}
                      onChange={e => setWardenReviewRemarks(e.target.value)}
                      placeholder="e.g. Application and mentor verification reviewed. Outstation gate pass granted."
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Dossier
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setSelectedGatePassModal(null)}
                >
                  Close
                </button>

                {selectedGatePassModal.status === 'Pending Warden Approval' && (
                  <>
                    <button
                      type="button"
                      className="hostel-quick-reject-btn"
                      style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                      onClick={() => handleRejectGatePass(selectedGatePassModal.id)}
                    >
                      <X size={15} /> Reject
                    </button>

                    <button
                      type="button"
                      className="admin-action-btn-primary"
                      style={{ background: '#16a34a', padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleApproveGatePass(selectedGatePassModal.id)}
                    >
                      <Check size={16} /> Approve Gate Pass
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
