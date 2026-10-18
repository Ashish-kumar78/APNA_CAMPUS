import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Bed,
  Users,
  AlertCircle,
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
  ShieldCheck
} from 'lucide-react';
import './StudentHostelPage.css';
import { initialStudentHostelDetail, initialHostelComplaints } from '../data/collegeData.js';
import StudentGatePassSection from '../components/StudentGatePassSection.jsx';
import SmartComplaintModal from '../components/SmartComplaintModal.jsx';
import { getStudentGatePasses } from '../services/gatePassStore.js';

import { api } from '../services/api.js';

export default function StudentHostelPage({ defaultTab = 'overview' }) {
  const [activeSubTab, setActiveSubTab] = useState(defaultTab);
  const [pendingGatePassCount, setPendingGatePassCount] = useState(0);

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
  const [complaints, setComplaints] = useState([
    {
      id: 'CMP-2026-101',
      studentName: 'Rakesh Das',
      rollNumber: '01',
      hostel: 'Sarojini Girls Residence (Block A)',
      roomNumber: '204',
      location: 'Room 204 Attached Bathroom',
      category: 'Plumbing',
      predictedCategory: 'plumbing',
      confidence: 0.88,
      needsReview: false,
      title: 'Water tap leaking continuously in bathroom',
      description: 'The bathroom wash basin tap is broken at the valve and dripping water constantly.',
      priority: 'High',
      status: 'In Progress',
      assignedStaffId: 'STF-PLUMB-01',
      assignedStaffName: 'Suresh Mohapatra',
      assignedStaffPhone: '+91 94379 11231',
      assignedStaffRole: 'Plumber & Water Works',
      filedDate: '18 Oct 2026',
      resolutionNotes: 'Assigned to Suresh Mohapatra. Ceramic washer replacement scheduled for 11:30 AM.',
    },
    {
      id: 'CMP-2026-102',
      studentName: 'Rakesh Das',
      rollNumber: '01',
      hostel: 'Sarojini Girls Residence (Block A)',
      roomNumber: '204',
      location: 'Study Area Desk #02',
      category: 'Electrical',
      predictedCategory: 'electrical',
      confidence: 0.82,
      needsReview: false,
      title: 'Ceiling fan making screeching noise',
      description: 'The ceiling fan bearing has deteriorated and makes a loud squeaking sound on speed 4 and 5.',
      priority: 'Medium',
      status: 'Assigned',
      assignedStaffId: 'STF-ELEC-01',
      assignedStaffName: 'Pramod Panda',
      assignedStaffPhone: '+91 94378 99120',
      assignedStaffRole: 'Electrician & Power Maintenance',
      filedDate: '18 Oct 2026',
      resolutionNotes: 'Allocated to Pramod Panda based on lowest pending electrical workload.',
    }
  ]);

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


  const statusColor = (status) =>
    status === 'Resolved' ? 'approved' : (status === 'In Progress' || status === 'Assigned') ? 'pending' : 'rejected';

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
      </div>

      {activeSubTab === 'gate-pass' ? (
        <StudentGatePassSection />
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
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Hostel Regulations &amp; Code of Conduct</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            {hostelDetail.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
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
            const isInProgress = c.status === 'In Progress';
            const isAssigned = c.status === 'Assigned' || isInProgress || isResolved;
            const confPercent = Math.round((c.confidence || 0.85) * 100);

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
                  </div>
                  <span className={`admin-badge ${statusColor(c.status)}`} style={{ flexShrink: 0 }}>
                    {c.status}
                  </span>
                </div>

                {/* Location & Ticket Metadata */}
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span>Ticket: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>{c.id}</code></span>
                  <span>📅 {c.filedDate}</span>
                  <span>📍 {c.location || (c.roomNumber ? `Room ${c.roomNumber}` : 'Hostel Complex')}</span>
                </div>

                {/* Description */}
                {c.description && (
                  <div className="complaint-description-block">
                    <FileText size={14} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.84rem', color: '#334155' }}>{c.description}</span>
                  </div>
                )}

                {/* Assigned Staff Card */}
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

                {/* Progress History Stepper */}
                <div className="complaint-progress-stepper">
                  <div className="stepper-step done">
                    ✓ 1. Filed
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>→</span>
                  <div className={`stepper-step ${isAssigned ? 'done' : 'active'}`}>
                    {isAssigned ? '✓ 2. AI Assigned' : '2. Classification'}
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>→</span>
                  <div className={`stepper-step ${isResolved ? 'done' : isInProgress ? 'active' : ''}`}>
                    {isResolved ? '✓ 3. In Progress' : '3. Work Execution'}
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>→</span>
                  <div className={`stepper-step ${isResolved ? 'done' : ''}`}>
                    {isResolved ? '✓ 4. Resolved' : '4. Verification'}
                  </div>
                </div>

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
                  ℹ️ <strong>Status Log:</strong> {c.resolutionNotes}
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
              ? `Complaint #${newTicket.id} registered! Classified as ${newTicket.category} and assigned to ${newTicket.assignedStaffName}.`
              : `Complaint #${newTicket.id} registered and queued for supervisor triage.`,
          });
        }}
        defaultLocation={complaintForm.location}
        hostelName={hostelDetail.hostelName}
        roomNumber={hostelDetail.roomNumber}
        studentName="Rakesh Das"
        rollNumber="01"
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
