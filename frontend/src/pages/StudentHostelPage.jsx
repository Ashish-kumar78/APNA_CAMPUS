import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Bed,
  Users,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Phone,
  Plus,
  Send,
  X,
  Upload,
  Image,
  FileText,
  Trash2,
  ShieldCheck,
  Star,
  UserCheck,
  ArrowRight,
  Calendar,
  XCircle,
  Eye,
  Info,
  Building,
  Printer
} from 'lucide-react';
import './StudentHostelPage.css';
import { initialStudentHostelDetail, initialHostelComplaints } from '../data/collegeData.js';
import StudentGatePassSection from '../components/StudentGatePassSection.jsx';
import SmartComplaintModal from '../components/SmartComplaintModal.jsx';
import StudentComplaintFeedbackModal from '../components/StudentComplaintFeedbackModal.jsx';
import ReopenComplaintModal from '../components/ReopenComplaintModal.jsx';
import { getStudentGatePasses } from '../services/gatePassStore.js';
import {
  getAllResidentLeaves,
  getResidentLeavesByStudent,
  createResidentLeave
} from '../services/hostelResidentLeaveStore.js';
import { getActiveStudent } from '../services/studentStore.js';

import { api } from '../services/api.js';
import { getStudentRulesList, subscribeHostelRules } from '../services/hostelRulesStore.js';

export default function StudentHostelPage({ defaultTab = 'overview' }) {
  const [activeSubTab, setActiveSubTab] = useState(defaultTab);
  const [pendingGatePassCount, setPendingGatePassCount] = useState(0);

  // Student Leaves state & synchronization
  const activeStudent = getActiveStudent();
  const [residentLeaves, setResidentLeaves] = useState(() => getAllResidentLeaves());
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('ALL');
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState(null);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [leaveToast, setLeaveToast] = useState(null);

  const [newLeaveForm, setNewLeaveForm] = useState({
    studentName: activeStudent?.name || 'Rakesh Das',
    rollNumber: activeStudent?.rollNumber || '2305200001',
    regNo: activeStudent?.registrationNumber || '2305201001',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '101',
    phone: activeStudent?.phone || '+91 94370 11999',
    startDate: '2026-10-29',
    endDate: '2026-10-31',
    days: 2,
    reason: '',
    guardianName: activeStudent?.guardianName || activeStudent?.fatherName || 'D. Das',
    guardianPhone: activeStudent?.guardianPhone || activeStudent?.fatherPhone || '+91 94370 11888'
  });

  useEffect(() => {
    const handleLeavesSync = () => {
      setResidentLeaves(getAllResidentLeaves());
    };
    window.addEventListener('bput_hostel_leaves_updated', handleLeavesSync);
    window.addEventListener('storage', handleLeavesSync);
    return () => {
      window.removeEventListener('bput_hostel_leaves_updated', handleLeavesSync);
      window.removeEventListener('storage', handleLeavesSync);
    };
  }, []);

  const showLeaveToast = (msg) => {
    setLeaveToast(msg);
    setTimeout(() => setLeaveToast(null), 3500);
  };

  const studentFilteredLeaves = useMemo(() => {
    if (selectedStudentFilter === 'ALL') {
      return residentLeaves;
    }
    return residentLeaves.filter(l =>
      l.rollNumber === selectedStudentFilter ||
      l.regNo === selectedStudentFilter ||
      (selectedStudentFilter === '2305200001' && l.studentName.toLowerCase().includes('rakesh'))
    );
  }, [residentLeaves, selectedStudentFilter]);

  const rejectedLeavesCount = useMemo(() => {
    return residentLeaves.filter(l => l.status === 'Rejected').length;
  }, [residentLeaves]);

  const highPriorityRejection = useMemo(() => {
    return studentFilteredLeaves.find(l => l.status === 'Rejected') || null;
  }, [studentFilteredLeaves]);

  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault();
    if (!newLeaveForm.reason.trim()) {
      alert('Please specify the reason for your outstation leave.');
      return;
    }
    const created = createResidentLeave(newLeaveForm);
    setIsApplyLeaveModalOpen(false);
    showLeaveToast(`✓ Leave Application ${created.id} submitted successfully to Resident Warden.`);
  };

  useEffect(() => {
    setActiveSubTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const updateCount = () => {
      const passes = getStudentGatePasses();
      const p = passes.filter(x => x.status === 'Pending Warden Approval').length;
      setPendingGatePassCount(p);
    };
    updateCount();
    window.addEventListener('bput_gate_passes_changed', updateCount);
    return () => window.removeEventListener('bput_gate_passes_changed', updateCount);
  }, []);

  const [hostelDetail] = useState(initialStudentHostelDetail);
  const [liveRules, setLiveRules] = useState(() => getStudentRulesList());

  useEffect(() => {
    const unsub = subscribeHostelRules(() => {
      setLiveRules(getStudentRulesList());
    });
    return unsub;
  }, []);
  const [complaints, setComplaints] = useState(initialHostelComplaints);

  // Modals for Feedback and Reopening
  const [feedbackModalTarget, setFeedbackModalTarget] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [reopenModalTarget, setReopenModalTarget] = useState(null);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);


  // Load complaints from API if server is up
  useEffect(() => {
    api.getComplaints('01')
      .then(res => {
        if (res && res.data && res.data.length > 0) {
          setComplaints(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: 'Electrical',
    location: 'Room 204 Attached Bathroom',
    title: '',
    description: '',
    priority: 'Medium',
    imageFile: null,
    imagePreview: null,
  });

  // Real-time AI prediction preview state
  const [aiPreview, setAiPreview] = useState({
    loading: false,
    category: '',
    confidence: 0,
    needsReview: false,
    probabilities: {},
    reason: '',
  });

  const [visionResult, setVisionResult] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const fileInputRef = useRef(null);

  // Debounced live AI prediction preview (for text typing)
  useEffect(() => {
    // If image analysis just ran, don't immediately overwrite with empty text
    if (isAnalyzingImage) return;

    const text = [complaintForm.title, complaintForm.description].filter(Boolean).join('. ');
    if (text.trim().length < 8 && !complaintForm.imagePreview) {
      setAiPreview({ loading: false, category: '', confidence: 0, needsReview: false, probabilities: {}, reason: '' });
      return;
    }

    if (complaintForm.imagePreview && text.trim().length < 8) {
      return;
    }

    setAiPreview(prev => ({ ...prev, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await api.previewAIComplaint(text, complaintForm.category);
        if (res && res.data) {
          setAiPreview({
            loading: false,
            category: res.data.category,
            confidence: res.data.confidence,
            needsReview: res.data.needsReview,
            probabilities: res.data.probabilities || {},
            reason: res.data.reviewReason || '',
          });
        }
      } catch (err) {
        // Local heuristic fallback if backend API is cold
        const lower = text.toLowerCase();
        let cat = 'other';
        if (lower.match(/tap|pipe|water|drain|flush|geyser|leak|shower|sink/)) cat = 'plumbing';
        else if (lower.match(/fan|light|switch|mcb|spark|socket|power|breaker/)) cat = 'electrical';
        else if (lower.match(/clean|dirty|dustbin|washroom|corridor|garbage/)) cat = 'cleaning';
        else if (lower.match(/door|desk|window|hinge|chair|lock|plaster/)) cat = 'maintenance';
        else if (lower.match(/wifi|wi-fi|internet|lan|ethernet|network|router/)) cat = 'internet_it';

        setAiPreview({
          loading: false,
          category: cat,
          confidence: 0.85,
          needsReview: false,
          probabilities: { [cat]: 0.85 },
          reason: '',
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [complaintForm.title, complaintForm.description, complaintForm.category, isAnalyzingImage, complaintForm.imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setComplaintForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: base64Data,
      }));

      // Directly trigger AI Vision to identify problem from photo!
      setIsAnalyzingImage(true);
      try {
        const res = await api.previewVisionComplaint(base64Data, file.name, complaintForm.location);
        if (res && res.data) {
          const v = res.data;
          setVisionResult(v);
          const formattedCat = v.category.charAt(0).toUpperCase() + v.category.slice(1);
          setComplaintForm(prev => ({
            ...prev,
            title: prev.title.trim() ? prev.title : v.title,
            description: prev.description.trim() ? prev.description : v.description,
            category: formattedCat,
            priority: v.suggestedPriority || prev.priority,
          }));
          setAiPreview({
            loading: false,
            category: v.category,
            confidence: v.confidence,
            needsReview: v.needsReview,
            probabilities: { [v.category]: v.confidence },
            reason: v.needsReview ? 'Low visual confidence' : '',
          });
        }
      } catch (err) {
        // Local smart image detector fallback
        const fn = (file.name || '').toLowerCase();
        let cat = 'Plumbing';
        let title = 'Water Tap / Pipe Issue Detected';
        let desc = 'Photo indicates water leakage or plumbing fixture defect in need of repair.';
        if (fn.match(/wire|fan|light|switch|spark/)) {
          cat = 'Electrical';
          title = 'Electrical Fixture / Wiring Issue';
          desc = 'Photo indicates electrical fixture or switch requiring repair.';
        } else if (fn.match(/clean|garbage|dustbin|dirty/)) {
          cat = 'Cleaning';
          title = 'Cleaning & Sanitation Request';
          desc = 'Photo indicates housekeeping or cleaning service required.';
        }
        setComplaintForm(prev => ({
          ...prev,
          title: prev.title.trim() ? prev.title : title,
          description: prev.description.trim() ? prev.description : desc,
          category: cat,
        }));
        setAiPreview({
          loading: false,
          category: cat.toLowerCase(),
          confidence: 0.88,
          needsReview: false,
          probabilities: { [cat.toLowerCase()]: 0.88 },
          reason: '',
        });
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setComplaintForm(prev => ({ ...prev, imageFile: null, imagePreview: null }));
    setVisionResult(null);
    setIsAnalyzingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLodgeComplaint = async (e) => {
    e.preventDefault();
    // Allow submission if EITHER title is filled OR an image is uploaded!
    if (!complaintForm.title.trim() && !complaintForm.imagePreview) return;

    setSubmitLoading(true);
    try {
      const finalTitle = complaintForm.title.trim() || (visionResult?.title || 'Maintenance Request from Photo');
      const finalDesc = complaintForm.description.trim() || (visionResult?.description || finalTitle);

      const payload = {
        title: finalTitle,
        description: finalDesc,
        category: complaintForm.category,
        location: complaintForm.location,
        priority: complaintForm.priority,
        hostel: hostelDetail.hostelName,
        roomNumber: hostelDetail.roomNumber,
        rollNumber: '01',
        studentName: 'Rakesh Das',
        attachmentUrl: complaintForm.imagePreview || null,
        filename: complaintForm.imageFile?.name || 'complaint_photo.jpg',
      };

      const res = await api.lodgeComplaint(payload);
      const newTicket = (res && res.data) ? res.data : {
        id: `CMP-${Math.floor(250 + Math.random() * 250)}`,
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: hostelDetail.hostelName,
        roomNumber: hostelDetail.roomNumber,
        location: complaintForm.location,
        category: aiPreview.category ? aiPreview.category.charAt(0).toUpperCase() + aiPreview.category.slice(1) : complaintForm.category,
        predictedCategory: aiPreview.category || complaintForm.category.toLowerCase(),
        confidence: aiPreview.confidence || 0.84,
        needsReview: aiPreview.needsReview,
        title: finalTitle,
        description: finalDesc,
        priority: complaintForm.priority,
        status: aiPreview.needsReview ? 'Needs Review' : 'Assigned',
        assignedStaffName: aiPreview.category === 'plumbing' ? 'Suresh Mohapatra' : aiPreview.category === 'electrical' ? 'Pramod Panda' : 'Campus Maintenance Desk',
        assignedStaffPhone: '+91 94379 11231',
        assignedStaffRole: aiPreview.category === 'plumbing' ? 'Plumber & Water Works' : 'Maintenance Specialist',
        filedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        resolutionNotes: aiPreview.needsReview ? 'Flagged for supervisor triage.' : 'Assigned to qualified staff based on lowest pending workload.',
        imageUrl: complaintForm.imagePreview || null,
      };

      setComplaints(prev => [newTicket, ...prev]);
      setSubmitFeedback({
        type: 'success',
        message: newTicket.assignedStaffName
          ? `Complaint registered! Automatically classified as ${newTicket.category} and assigned to ${newTicket.assignedStaffName}.`
          : 'Complaint registered and queued for supervisor review.',
      });
      setIsLodgeModalOpen(false);
      setComplaintForm({
        category: 'Electrical',
        location: 'Room 204 Attached Bathroom',
        title: '',
        description: '',
        priority: 'Medium',
        imageFile: null,
        imagePreview: null,
      });
      setVisionResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.warn('Complaint submission fallback triggered:', err);
    } finally {
      setSubmitLoading(false);
    }
  };


  const getDeadlineInfo = (c) => {
    if (c.status === 'Resolved') {
      return {
        text: 'Resolved',
        state: 'resolved',
        hoursRemaining: null,
        isOverdue: false,
      };
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
        text: overdueHours === 0 ? 'Deadline exceeded' : `Deadline exceeded (${overdueHours}h overdue)`,
        state: 'exceeded',
        hoursRemaining: diffHours,
        isOverdue: true,
      };
    } else if (diffHours <= 12) {
      return {
        text: `${diffHours} hours remaining — Deadline approaching`,
        state: 'approaching',
        hoursRemaining: diffHours,
        isOverdue: false,
      };
    } else {
      return {
        text: `${diffHours} hours remaining`,
        state: 'safe',
        hoursRemaining: diffHours,
        isOverdue: false,
      };
    }
  };

  const handleFeedbackSuccess = (updatedComplaint) => {
    setComplaints(prev => prev.map(c => c.id === updatedComplaint.id ? { ...c, ...updatedComplaint } : c));
    setIsFeedbackModalOpen(false);
    setSubmitFeedback({
      type: 'success',
      message: `Resolution verified for Ticket #${updatedComplaint.id}! Thank you for your feedback. Details have been recorded and dispatched to both Resident Warden & Hostel Administrator.`
    });
  };

  const handleReopenSuccess = (updatedComplaint) => {
    setComplaints(prev => prev.map(c => c.id === updatedComplaint.id ? { ...c, ...updatedComplaint } : c));
    setIsReopenModalOpen(false);
    setSubmitFeedback({
      type: 'warning',
      message: `Complaint #${updatedComplaint.id} has been reopened. Resident Warden and Hostel Administrator have been alerted for priority rework.`
    });
  };

  const statusColor = (status) => {
    if (status === 'Resolved') return 'approved';
    if (status === 'Awaiting Student Verification' || status === 'Awaiting Verification') return 'pending';
    if (status === 'In Progress' || status === 'Assigned') return 'active';
    if (status === 'Escalated' || status === 'Reopened') return 'rejected';
    return 'pending';
  };

  return (
    <div className="student-hostel-page">
      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'overview' ? '#7c3aed' : '#f1f5f9',
            color: activeSubTab === 'overview' ? '#ffffff' : '#475569',
            boxShadow: activeSubTab === 'overview' ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Home size={16} /> Room Allocation &amp; Maintenance
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('gate-pass')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'gate-pass' ? '#4338ca' : '#f1f5f9',
            color: activeSubTab === 'gate-pass' ? '#ffffff' : '#475569',
            boxShadow: activeSubTab === 'gate-pass' ? '0 4px 12px rgba(67, 56, 202, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <ShieldCheck size={17} /> Hostel Gate Pass (Outing / Home Visit)
          {pendingGatePassCount > 0 && (
            <span style={{
              background: activeSubTab === 'gate-pass' ? '#fde047' : '#f59e0b',
              color: '#0f172a',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '9999px',
              marginLeft: '4px'
            }}>
              {pendingGatePassCount} Pending
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('leaves')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'leaves' ? '#dc2626' : '#f1f5f9',
            color: activeSubTab === 'leaves' ? '#ffffff' : '#475569',
            boxShadow: activeSubTab === 'leaves' ? '0 4px 12px rgba(220, 38, 38, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Calendar size={17} /> Overnight Leave Applications
          {rejectedLeavesCount > 0 && (
            <span style={{
              background: activeSubTab === 'leaves' ? '#fef2f2' : '#fee2e2',
              color: '#991b1b',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '9999px',
              marginLeft: '4px',
              border: '1px solid #fca5a5'
            }}>
              {rejectedLeavesCount} Notice
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'gate-pass' ? (
        <StudentGatePassSection />
      ) : activeSubTab === 'leaves' ? (
        <div className="student-leaves-container">
          {/* Toast message */}
          {leaveToast && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} /> {leaveToast}
            </div>
          )}

          {/* HIGH-PRIORITY WARDEN REJECTION BANNER (User requirement: reason mentioned by warden shown to student) */}
          {highPriorityRejection && (
            <div className="student-leave-rejection-banner">
              <div className="rejection-banner-header">
                <div className="rejection-banner-title">
                  <AlertTriangle size={20} color="#e11d48" />
                  <span>Important Notice: Leave Application {highPriorityRejection.id} Rejected by Resident Warden</span>
                </div>
                <div className="rejection-banner-time">
                  Decided: {highPriorityRejection.rejectedAt || 'Recent'}
                </div>
              </div>

              <div className="rejection-quote-box">
                <div className="rejection-quote-label">
                  <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Reason Stated by Warden for Rejection:
                </div>
                <p className="rejection-quote-text">
                  "{highPriorityRejection.rejectionReason || 'Parent/Guardian telephonic consent could not be verified by hostel warden office.'}"
                </p>
              </div>

              <div className="rejection-banner-footer">
                <div>
                  Action taken by: <strong>{highPriorityRejection.rejectedBy || 'Mr. Rajesh Jena (Resident Warden)'}</strong>
                  &nbsp;·&nbsp; Resident: <strong>{highPriorityRejection.studentName} ({highPriorityRejection.rollNumber})</strong>
                </div>
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderColor: '#fca5a5', color: '#991b1b', background: '#ffffff', fontWeight: 700 }}
                  onClick={() => setSelectedLeaveDetail(highPriorityRejection)}
                >
                  <Eye size={13} /> View Official Rejection Notice
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="student-hostel-header">
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={22} style={{ color: '#dc2626' }} /> My Overnight Leaves &amp; Outstation Requests
              </h1>
              <p>Official registry of overnight leave applications submitted to Resident Warden with real-time approvals and stated rejection reasons.</p>
            </div>
            <button
              type="button"
              className="admin-action-btn-primary"
              style={{ background: '#dc2626' }}
              onClick={() => setIsApplyLeaveModalOpen(true)}
            >
              <Plus size={15} /> Apply for Overnight Leave
            </button>
          </div>

          {/* Demo Profile Switcher Bar */}
          <div className="student-leave-card-wrapper">
            <div className="student-leave-filter-bar">
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Student Profile (Demo Switcher):
              </span>
              <button
                type="button"
                className={`student-leave-filter-btn ${selectedStudentFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedStudentFilter('ALL')}
              >
                All Applications ({residentLeaves.length})
              </button>
              <button
                type="button"
                className={`student-leave-filter-btn ${selectedStudentFilter === '2305200001' ? 'active' : ''}`}
                onClick={() => setSelectedStudentFilter('2305200001')}
              >
                Rakesh Das (LV-2026-039)
              </button>
              <button
                type="button"
                className={`student-leave-filter-btn ${selectedStudentFilter === '2305200002' ? 'rejected-active' : ''}`}
                onClick={() => setSelectedStudentFilter('2305200002')}
              >
                Amit Nayak (LV-2026-042 · Rejected with Reason)
              </button>
              <button
                type="button"
                className={`student-leave-filter-btn ${selectedStudentFilter === '2305200008' ? 'active' : ''}`}
                onClick={() => setSelectedStudentFilter('2305200008')}
              >
                Ananya Mishra (LV-2026-043 · Pending)
              </button>
              <button
                type="button"
                className={`student-leave-filter-btn ${selectedStudentFilter === '2305200012' ? 'rejected-active' : ''}`}
                onClick={() => setSelectedStudentFilter('2305200012')}
              >
                Subrat Jena (LV-2026-038 · Rejected with Reason)
              </button>
              <button
                type="button"
                className={`student-leave-filter-btn ${selectedStudentFilter === '2305200005' ? 'active' : ''}`}
                onClick={() => setSelectedStudentFilter('2305200005')}
              >
                Sourav Mohanty (LV-2026-041 · Approved)
              </button>
            </div>

            {/* Leaves Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>App ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Student / Roll</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Hostel &amp; Room</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Leave Duration</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Reason</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Guardian Verification</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status &amp; Stated Reason</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFilteredLeaves.map(leave => {
                    const isRejected = leave.status === 'Rejected';
                    const isApproved = leave.status === 'Approved';
                    const isPending = leave.status === 'Pending';

                    return (
                      <tr key={leave.id} style={{ borderBottom: '1px solid #f1f5f9', background: isRejected ? '#fffbfb' : '#ffffff' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {leave.id}
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Applied: {leave.appliedOn}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{leave.studentName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {leave.rollNumber || leave.regNo}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{leave.phone}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{leave.hostelName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Room {leave.roomNumber}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {leave.startDate} → {leave.endDate}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                            {leave.days} Days Total
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', maxWidth: '220px' }}>
                          <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                            {leave.reason}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{leave.guardianName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{leave.guardianPhone}</div>
                          <div style={{ fontSize: '0.72rem', color: leave.guardianStatus?.includes('Disapproved') ? '#dc2626' : '#166534', fontWeight: 600, marginTop: '2px' }}>
                            • {leave.guardianStatus}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', minWidth: '240px' }}>
                          {isRejected && (
                            <div>
                              <span className="badge-leave-rejected">
                                <XCircle size={12} /> Rejected
                              </span>
                              {/* Prominently show reason to student */}
                              <div className="student-leave-reason-chip">
                                <div className="student-leave-reason-label">
                                  <AlertCircle size={11} /> Reason Mentioned by Warden:
                                </div>
                                <div className="student-leave-reason-text">
                                  "{leave.rejectionReason || 'Parent/Guardian telephonic consent could not be verified by hostel warden office.'}"
                                </div>
                                <div className="student-leave-reason-by">
                                  By {leave.rejectedBy || 'Mr. Rajesh Jena (Resident Warden)'} · {leave.rejectedAt || 'Recent'}
                                </div>
                              </div>
                            </div>
                          )}

                          {isApproved && (
                            <div>
                              <span className="badge-leave-approved">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                              <span className={leave.returned ? "badge-leave-returned" : "badge-leave-away"}>
                                {leave.returned ? "✓ Returned" : "⏳ Away"}
                              </span>
                              <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px' }}>
                                Sanctioned by {leave.approvedBy || 'Resident Warden'}
                              </div>
                            </div>
                          )}

                          {isPending && (
                            <div>
                              <span className="badge-leave-pending">
                                <Clock size={12} /> Pending Review
                              </span>
                              <div style={{ fontSize: '0.72rem', color: '#854d0e', marginTop: '3px' }}>
                                Under warden verification with parent
                              </div>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-action-btn-secondary"
                            style={{
                              fontSize: '0.78rem',
                              padding: '0.4rem 0.75rem',
                              color: isRejected ? '#991b1b' : '#334155',
                              borderColor: isRejected ? '#fca5a5' : '#cbd5e1',
                              background: isRejected ? '#fef2f2' : '#ffffff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => setSelectedLeaveDetail(leave)}
                          >
                            <Eye size={13} /> {isRejected ? 'View Notice' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {studentFilteredLeaves.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        <Calendar size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>No leave applications found for this student.</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem' }}>Click "Apply for Overnight Leave" above to create an outstation leave request.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── MODAL: VIEW FORMAL LEAVE & REJECTION NOTICE ── */}
          {selectedLeaveDetail && (
            <div className="admin-modal-backdrop" onClick={() => setSelectedLeaveDetail(null)}>
              <div
                className="admin-modal-card"
                style={{ maxWidth: '640px', width: '95vw' }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  className="admin-modal-header"
                  style={{
                    background: selectedLeaveDetail.status === 'Rejected' ? '#fef2f2' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1.25rem 1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {selectedLeaveDetail.status === 'Rejected' ? (
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
                        <XCircle size={22} />
                      </div>
                    ) : (
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                        <Calendar size={22} />
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: selectedLeaveDetail.status === 'Rejected' ? '#991b1b' : '#0f172a', fontWeight: 800 }}>
                        {selectedLeaveDetail.status === 'Rejected' ? 'Hostel Leave Application — Rejection Notice' : 'Hostel Overnight Leave Application Record'}
                      </h3>
                      <small style={{ color: selectedLeaveDetail.status === 'Rejected' ? '#b91c1c' : '#64748b' }}>
                        Application ID: <strong>{selectedLeaveDetail.id}</strong> · Submitted: {selectedLeaveDetail.appliedOn}
                      </small>
                    </div>
                  </div>
                  <button
                    className="admin-table-action-btn"
                    onClick={() => setSelectedLeaveDetail(null)}
                    style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="admin-modal-body" style={{ padding: '1.5rem' }}>
                  {/* REJECTION REASON CARD IF REJECTED */}
                  {selectedLeaveDetail.status === 'Rejected' && (
                    <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        <AlertCircle size={15} /> Official Reason Stated by Resident Warden
                      </div>
                      <div style={{ fontSize: '1.02rem', color: '#881337', fontWeight: 600, lineHeight: '1.5', background: '#ffffff', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #e11d48' }}>
                        "{selectedLeaveDetail.rejectionReason || 'Parent / Guardian telephonic consent could not be verified by hostel warden office.'}"
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#9f1239', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <span>Decided by: <strong>{selectedLeaveDetail.rejectedBy || 'Mr. Rajesh Jena (Resident Warden)'}</strong></span>
                        <span>Date &amp; Time: <strong>{selectedLeaveDetail.rejectedAt || 'Recent'}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Application Data Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Resident Student</span>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedLeaveDetail.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>Reg No: {selectedLeaveDetail.rollNumber || selectedLeaveDetail.regNo}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Hostel &amp; Room</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedLeaveDetail.hostelName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>Room {selectedLeaveDetail.roomNumber}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Leave Period</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedLeaveDetail.startDate} → {selectedLeaveDetail.endDate}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{selectedLeaveDetail.days} Days Total</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Parent / Guardian</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedLeaveDetail.guardianName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>{selectedLeaveDetail.guardianPhone} ({selectedLeaveDetail.guardianStatus})</div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Stated Student Reason</span>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{selectedLeaveDetail.reason}</div>
                    </div>
                  </div>

                  {/* Student Next Steps Notice */}
                  {selectedLeaveDetail.status === 'Rejected' && (
                    <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '0.8rem', color: '#0369a1' }}>
                      <strong>Resolution Guideline:</strong> If you believe the rejection was due to a telephonic miscommunication, have your parent/guardian call the Resident Warden directly at <strong>+91 94370 12345</strong>, or report in person to the Hostel Office between 05:00 PM and 07:00 PM.
                    </div>
                  )}
                </div>

                <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="admin-action-btn-secondary"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Print Notice
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn-primary"
                    style={{ background: '#0f172a' }}
                    onClick={() => setSelectedLeaveDetail(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── MODAL: APPLY FOR NEW OVERNIGHT LEAVE ── */}
          {isApplyLeaveModalOpen && (
            <div className="admin-modal-backdrop" onClick={() => setIsApplyLeaveModalOpen(false)}>
              <div
                className="admin-modal-card"
                style={{ maxWidth: '600px', width: '95vw' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="admin-modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Calendar size={20} color="#dc2626" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                        Apply for Overnight Outstation Leave
                      </h3>
                      <small style={{ color: '#64748b' }}>Application will be submitted directly to Resident Warden for verification.</small>
                    </div>
                  </div>
                  <button
                    className="admin-table-action-btn"
                    onClick={() => setIsApplyLeaveModalOpen(false)}
                    style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleApplyLeaveSubmit}>
                  <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="admin-form-group">
                        <label>Student Name</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={newLeaveForm.studentName}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, studentName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Registration / Roll Number</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={newLeaveForm.rollNumber}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, rollNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                      <div className="admin-form-group">
                        <label>Hostel Residence</label>
                        <select
                          className="admin-form-select"
                          value={newLeaveForm.hostelName}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, hostelName: e.target.value })}
                        >
                          <option value="Gandhi Boys Residence">Gandhi Boys Residence (Hostel 1)</option>
                          <option value="Kalam Boys Residence">Kalam Boys Residence (Hostel 2)</option>
                          <option value="Sarojini Girls Residence">Sarojini Girls Residence (Hostel 1)</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label>Room Number</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={newLeaveForm.roomNumber}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, roomNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="admin-form-group">
                        <label>Leave Start Date</label>
                        <input
                          type="date"
                          className="admin-form-input"
                          value={newLeaveForm.startDate}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Leave End Date</label>
                        <input
                          type="date"
                          className="admin-form-input"
                          value={newLeaveForm.endDate}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Total Days</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          className="admin-form-input"
                          value={newLeaveForm.days}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, days: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>Reason for Outstation Leave *</label>
                      <textarea
                        className="admin-form-input"
                        rows="3"
                        placeholder="State clearly the reason for leaving campus (e.g. Sister's wedding in Berhampur, urgent dental procedure, hackathon)..."
                        value={newLeaveForm.reason}
                        onChange={e => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="admin-form-group">
                        <label>Parent / Guardian Name *</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={newLeaveForm.guardianName}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, guardianName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Parent / Guardian Contact *</label>
                        <input
                          type="tel"
                          className="admin-form-input"
                          value={newLeaveForm.guardianPhone}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, guardianPhone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      onClick={() => setIsApplyLeaveModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-action-btn-primary"
                      style={{ background: '#dc2626' }}
                    >
                      Submit Leave Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="student-hostel-header">
            <div>
              <h1>My Hostel Residence &amp; Accommodation</h1>
              <p>Room allocation, roommates, hostel guidelines, and 24/7 maintenance desk</p>
            </div>
            <button
              className="admin-action-btn-primary"
              style={{ background: '#7c3aed' }}
              onClick={() => setIsLodgeModalOpen(true)}
            >
              <Plus size={15} /> Lodge Maintenance Request
            </button>
          </div>

          {/* Info Cards */}
          <div className="hostel-info-grid">
        <div className="hostel-info-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Allocated Room
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
            Room {hostelDetail.roomNumber}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {hostelDetail.bedNumber} · {hostelDetail.floor}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
            ✓ AC Triple Deluxe Accommodation
          </div>
        </div>

        <div className="hostel-info-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Residence Complex
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {hostelDetail.hostelName}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Resident Warden: <strong>{hostelDetail.wardenName}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#2563eb', marginTop: '0.25rem' }}>
            <Phone size={13} /> {hostelDetail.wardenContact}
          </div>
        </div>

        <div className="hostel-info-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hostel Fee Status
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669' }}>
            Partially Paid
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            ₹20,000 Paid · ₹12,000 Balance Due
          </div>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginTop: '0.25rem' }}>
            Mess Clearance: Active
          </div>
        </div>
      </div>

      {/* Roommates & Rules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Roommates */}
        <div className="hostel-info-card" style={{ gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Room 204 Roommates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {hostelDetail.roommates.map((mate, idx) => (
              <div key={idx} className="roommate-card">
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                  {mate.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{mate.name}</div>
                  <small style={{ color: '#64748b' }}>Roll {mate.roll} · {mate.branch} · {mate.bed}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hostel Rules */}
        <div className="hostel-info-card" style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Hostel Regulations &amp; Code of Conduct</h3>
            <span style={{ fontSize: '0.76rem', color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
              Live Admin Policy
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: '#475569' }}>
            {liveRules && liveRules.length > 0 ? (
              liveRules.map((rule, idx) => (
                <li key={rule.id || idx} style={{ lineHeight: 1.5 }}>
                  {typeof rule === 'string' ? (
                    rule
                  ) : (
                    <>
                      <strong style={{ color: '#0f172a' }}>{rule.title}</strong>
                      {rule.value && (
                        <span style={{
                          marginLeft: '6px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          fontSize: '0.76rem',
                          fontWeight: 700
                        }}>
                          {rule.value}
                        </span>
                      )}
                      {rule.description && (
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                          {rule.description}
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))
            ) : (
              hostelDetail.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* My Maintenance Complaints */}
      <div className="hostel-info-card" style={{ gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>My Maintenance Complaints</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
            {complaints.length} ticket{complaints.length !== 1 ? 's' : ''} recorded
          </span>
        </div>

        {submitFeedback && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            color: '#065f46',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span>{submitFeedback.message}</span>
            <button
              onClick={() => setSubmitFeedback(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {complaints.map(c => {
            const isResolved = c.status === 'Resolved';
            const isAwaitingVerification = c.status === 'Awaiting Student Verification' || c.status === 'Awaiting Verification';
            const isInProgress = c.status === 'In Progress' || isAwaitingVerification || isResolved;
            const isAssigned = c.status === 'Assigned' || isInProgress;
            const isReopened = c.status === 'Reopened';
            const isEscalatedStatus = c.status === 'Escalated' || c.isEscalated;
            const confPercent = Math.round((c.confidence || 0.85) * 100);
            const deadlineInfo = getDeadlineInfo(c);
            const isOverdue = deadlineInfo.isOverdue || isEscalatedStatus;

            return (
              <div key={c.id} className="complaint-card-enhanced">
                {/* Top Row */}
                <div className="complaint-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>{c.title}</strong>
                    <span className={`admin-badge ${c.priority === 'High' ? 'rejected' : 'pending'}`}>{c.priority}</span>
                    <span className="admin-badge active">{c.category}</span>
                    {c.predictedCategory && (
                      <span className="ai-category-badge" title={`Machine Learning confidence: ${confPercent}%`}>
                        ✨ AI: {c.predictedCategory} ({confPercent}%)
                      </span>
                    )}
                    {/* 72h Deadline Remaining Badge */}
                    <span className={`deadline-badge ${deadlineInfo.state}`}>
                      <Clock size={12} /> {deadlineInfo.text}
                    </span>
                    {/* Escalation to Hostel Admin Badge */}
                    {(c.isEscalated || c.status === 'Escalated' || isOverdue) && (
                      <span className="escalated-admin-badge">
                        <AlertTriangle size={13} /> Escalated to Hostel Administrator
                      </span>
                    )}
                  </div>
                  <span className={`admin-badge ${statusColor(c.status)}`} style={{ flexShrink: 0 }}>
                    {c.status}
                  </span>
                </div>

                {/* Location & Ticket Metadata & Assigned Warden */}
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span>Ticket: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>{c.id}</code></span>
                  <span>📅 Filed: {c.filedDate || (c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent')}</span>
                  <span>📍 {c.location || (c.roomNumber ? `Room ${c.roomNumber}` : 'Hostel Complex')}</span>
                  {c.resolutionDeadline && (
                    <span style={{ color: isOverdue ? '#dc2626' : '#475569', fontWeight: 600 }}>
                      ⏰ 72h Deadline: {new Date(c.resolutionDeadline).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Assigned Warden Auto-Routing Indicator */}
                <div style={{
                  fontSize: '0.8rem',
                  color: '#1e40af',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#2563eb" />
                    <span>Assigned Resident Warden: <strong>{c.assignedWardenName || hostelDetail.wardenName}</strong> (Auto-routed by Hostel &amp; Block)</span>
                  </div>
                  {(c.assignedWardenContact || hostelDetail.wardenContact) && (
                    <a
                      href={`tel:${c.assignedWardenContact || hostelDetail.wardenContact}`}
                      style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      <Phone size={12} /> {c.assignedWardenContact || hostelDetail.wardenContact}
                    </a>
                  )}
                </div>

                {/* Description */}
                {c.description && (
                  <div className="complaint-description-block">
                    <FileText size={14} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.84rem', color: '#334155' }}>{c.description}</span>
                  </div>
                )}

                {/* Assigned Staff (Maintenance Worker) Card */}
                {c.assignedStaffName ? (
                  <div className="staff-contact-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="staff-avatar-badge">
                        {c.assignedStaffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                          {c.assignedStaffName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {c.assignedStaffRole || 'Qualified Maintenance Specialist'} · Auto-assigned by workload
                        </div>
                      </div>
                    </div>
                    {c.assignedStaffPhone && (
                      <a href={`tel:${c.assignedStaffPhone}`} className="staff-call-btn">
                        <Phone size={13} /> {c.assignedStaffPhone}
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Clock size={14} />
                    <span>Queued in supervisor triage queue for manual review and staff allocation.</span>
                  </div>
                )}

                {/* 7-Stage Visual Progress Timeline */}
                {/* Submitted -> Assigned -> In Progress -> Awaiting Verification -> Resolved */}
                <div className="complaint-progress-stepper">
                  <div className="stepper-step done">
                    ✓ 1. Submitted
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>→</span>
                  <div className={`stepper-step ${isAssigned ? 'done' : 'active'}`}>
                    {isAssigned ? '✓ 2. Assigned' : '2. Assigned'}
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>→</span>
                  <div className={`stepper-step ${isInProgress ? (isAwaitingVerification || isResolved ? 'done' : 'active') : ''}`}>
                    {isAwaitingVerification || isResolved ? '✓ 3. In Progress' : '3. In Progress'}
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>→</span>
                  <div className={`stepper-step ${isResolved ? 'done' : isAwaitingVerification ? 'active' : ''}`}>
                    {isResolved ? '✓ 4. Awaiting Verification' : isAwaitingVerification ? '⏳ 4. Awaiting Verification' : '4. Awaiting Verification'}
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>→</span>
                  <div className={`stepper-step ${isResolved ? 'done' : ''}`}>
                    {isResolved ? '✓ 5. Resolved' : '5. Resolved'}
                  </div>
                  {isReopened && (
                    <span style={{ marginLeft: '6px', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                      ⚠️ Reopened
                    </span>
                  )}
                </div>

                {/* Completion Verification Actions (When work is completed and awaiting student verification) */}
                {isAwaitingVerification && (
                  <div className="student-verification-box">
                    <div className="student-verification-header">
                      <AlertCircle size={22} color="#7c3aed" style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Work Reported Complete by Maintenance Team</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>
                          Technician has reported this issue as serviced. Please inspect the work in your room and confirm or report if unresolved.
                        </p>
                      </div>
                    </div>
                    <div className="student-verification-actions">
                      <button
                        type="button"
                        className="btn-confirm-completed"
                        onClick={() => {
                          setFeedbackModalTarget(c);
                          setIsFeedbackModalOpen(true);
                        }}
                      >
                        <CheckCircle2 size={16} /> Confirm Work Completed
                      </button>
                      <button
                        type="button"
                        className="btn-problem-unresolved"
                        onClick={() => {
                          setReopenModalTarget(c);
                          setIsReopenModalOpen(true);
                        }}
                      >
                        <X size={16} /> Problem Not Resolved
                      </button>
                    </div>
                  </div>
                )}

                {/* Verified Student Feedback Card (Shown for Resolved tickets) */}
                {isResolved && (c.feedbackRating || c.studentVerifiedAt) && (
                  <div className="student-feedback-recorded-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={16} color="#eab308" fill="#eab308" />
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                          Student Verified Resolution · {c.feedbackRating ? `${c.feedbackRating}/5 Stars` : '5/5 Stars'}
                        </strong>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              size={13}
                              color="#eab308"
                              fill={st <= (c.feedbackRating || 5) ? '#eab308' : '#e2e8f0'}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="flow-dispatch-pill">
                        ✓ Process completed before 72h. Verified feedback provided to both Resident Warden &amp; Hostel Admin
                      </span>
                    </div>
                    {c.feedbackText && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>
                        "{c.feedbackText}"
                      </p>
                    )}
                    {c.studentVerifiedAt && (
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                        Confirmed on: {new Date(c.studentVerifiedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                )}

                {/* Reopen Alert Details */}
                {isReopened && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '0.82rem', color: '#991b1b', marginTop: '8px' }}>
                    <strong>⚠️ Issue Reopened by Student:</strong> {c.reopenReason || 'Problem persisted after initial maintenance check.'}
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '3px' }}>
                      Assigned warden and hostel administrator have been notified for priority rework.
                    </div>
                  </div>
                )}

                {/* Escalation Alert Details */}
                {(c.isEscalated || c.status === 'Escalated') && (
                  <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#9a3412', marginTop: '6px' }}>
                    🚨 <strong>Escalation Notice:</strong> {c.escalationReason || 'Resolution exceeded 72-hour mandatory SLA. Case escalated to Hostel Administrator.'}
                    {c.escalatedAt && (
                      <span style={{ marginLeft: '6px', fontSize: '0.74rem', color: '#c2410c' }}>
                        (Escalated on {new Date(c.escalatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})
                      </span>
                    )}
                  </div>
                )}

                {/* Image thumbnail */}
                {c.imageUrl && (
                  <div className="complaint-image-wrap">
                    <img
                      src={c.imageUrl}
                      alt="Complaint attachment"
                      className="complaint-thumb"
                      onClick={() => setExpandedComplaint(c)}
                      title="Click to view full image"
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      <Image size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      Photo attached
                    </span>
                  </div>
                )}

                {/* Resolution note */}
                <div style={{ fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #7c3aed' }}>
                  ℹ️ <strong>Status Log:</strong> {c.resolutionNotes || (c.statusHistory && c.statusHistory.length > 0 ? c.statusHistory[c.statusHistory.length - 1].note : 'Under standard maintenance SLA')}
                </div>
              </div>
            );
          })}

          {complaints.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
              <AlertCircle size={28} style={{ opacity: 0.4, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
              No active maintenance complaints recorded.
            </div>
          )}
        </div>
      </div>

      {/* SMART COMPLAINT SUBMISSION MODAL (5-SECTION WITH HUMAN VERIFICATION) */}
      <SmartComplaintModal
        isOpen={isLodgeModalOpen}
        onClose={() => setIsLodgeModalOpen(false)}
        onComplaintSubmitted={(newTicket) => {
          setComplaints((prev) => [newTicket, ...prev]);
          setSubmitFeedback({
            type: 'success',
            message: newTicket.assignedStaffName
              ? `Complaint #${newTicket.id} registered! Auto-assigned to Warden ${newTicket.assignedWardenName || 'Nibedita Das'} & Technician ${newTicket.assignedStaffName}. 72h deadline active.`
              : `Complaint #${newTicket.id} registered and auto-assigned to Warden ${newTicket.assignedWardenName || 'Nibedita Das'}.`,
          });
        }}
        defaultLocation={complaintForm.location}
        hostelName={hostelDetail.hostelName}
        roomNumber={hostelDetail.roomNumber}
        studentName="Rakesh Das"
        rollNumber="01"
      />

      {/* Student Feedback Modal */}
      <StudentComplaintFeedbackModal
        isOpen={isFeedbackModalOpen}
        complaint={feedbackModalTarget}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmitted={handleFeedbackSuccess}
        onFeedbackSubmitted={handleFeedbackSuccess}
        onRouteToReopen={(comp, initialReason) => {
          setIsFeedbackModalOpen(false);
          const target = comp || feedbackModalTarget;
          setReopenModalTarget(initialReason ? { ...target, initialReason } : target);
          setIsReopenModalOpen(true);
        }}
        onSwitchToReopen={(comp, initialReason) => {
          setIsFeedbackModalOpen(false);
          const target = comp || feedbackModalTarget;
          setReopenModalTarget(initialReason ? { ...target, initialReason } : target);
          setIsReopenModalOpen(true);
        }}
      />

      {/* Reopen Complaint Modal */}
      <ReopenComplaintModal
        isOpen={isReopenModalOpen}
        complaint={reopenModalTarget}
        onClose={() => setIsReopenModalOpen(false)}
        onReopened={handleReopenSuccess}
      />

      {/* Full Image Viewer Modal */}
      {expandedComplaint && expandedComplaint.imageUrl && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setExpandedComplaint(null)}
          style={{ zIndex: 2000 }}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{expandedComplaint.title}</span>
              <button className="admin-table-action-btn" onClick={() => setExpandedComplaint(null)}>
                <X size={18} />
              </button>
            </div>
            <img
              src={expandedComplaint.imageUrl}
              alt="Complaint full view"
              style={{ maxWidth: '80vw', maxHeight: '75vh', objectFit: 'contain', display: 'block', margin: '1rem auto' }}
            />
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
