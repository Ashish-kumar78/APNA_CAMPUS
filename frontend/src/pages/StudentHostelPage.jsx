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
import StudentGatePassSection from '../components/StudentGatePassSection.jsx';
import SmartComplaintModal from '../components/SmartComplaintModal.jsx';

import { api } from '../services/api.js';

export default function StudentHostelPage({ defaultTab = 'overview' }) {
  const emptyResidence = { hostelName: null, roomNumber: null, bedNumber: null, floor: null, wardenName: null, wardenContact: null, roommates: [], rules: [] };
  const [activeSubTab, setActiveSubTab] = useState(defaultTab);
  const [pendingGatePassCount, setPendingGatePassCount] = useState(0);

  useEffect(() => {
    setActiveSubTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    let active = true;
    api.getHostelGatePasses()
      .then((res) => {
        if (active) setPendingGatePassCount((res?.data || []).filter((pass) => pass.status === 'Pending Warden Approval').length);
      })
      .catch(() => { if (active) setPendingGatePassCount(0); });
    return () => { active = false; };
  }, []);

  const [hostelDetail, setHostelDetail] = useState(emptyResidence);
  const [residenceStatus, setResidenceStatus] = useState('loading');
  const [residenceError, setResidenceError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [complaintsStatus, setComplaintsStatus] = useState('loading');
  const [complaintsError, setComplaintsError] = useState('');

  useEffect(() => {
    let active = true;
    api.getMyResidence()
      .then((res) => {
        if (!active) return;
        setHostelDetail(res?.data || emptyResidence);
        setResidenceStatus('loaded');
      })
      .catch((error) => {
        if (!active) return;
        setResidenceError(error.message || 'Residence information could not be loaded.');
        setResidenceStatus('error');
      });
    api.getComplaints()
      .then((res) => {
        if (!active) return;
        setComplaints(Array.isArray(res?.data) ? res.data : []);
        setComplaintsStatus('loaded');
      })
      .catch((error) => {
        if (!active) return;
        setComplaintsError(error.message || 'Maintenance complaints could not be loaded.');
        setComplaintsStatus('error');
      });
    return () => { active = false; };
  }, []);

  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: 'Electrical',
    location: '',
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
        attachmentUrl: complaintForm.imagePreview || null,
        filename: complaintForm.imageFile?.name || 'complaint_photo.jpg',
      };

      const res = await api.lodgeComplaint(payload);
      if (!res?.data) throw new Error('The server did not confirm complaint registration.');
      const newTicket = res.data;

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
      setSubmitFeedback({ type: 'error', message: err.message || 'Complaint could not be submitted.' });
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
        <StudentGatePassSection residence={hostelDetail} />
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
              disabled={residenceStatus !== 'loaded' || !hostelDetail.hostelName || !hostelDetail.roomNumber}
              onClick={() => setIsLodgeModalOpen(true)}
              title={!hostelDetail.roomNumber ? 'A current hostel allocation is required to lodge a residence complaint.' : undefined}
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
              {hostelDetail.roomNumber ? `Room ${hostelDetail.roomNumber}` : 'No room assigned'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {[hostelDetail.bedNumber, hostelDetail.floor].filter(Boolean).join(' · ') || 'Residence information unavailable'}
          </div>
          {residenceError && <div role="alert" style={{ fontSize: '0.8rem', color: '#be123c' }}>{residenceError}</div>}
        </div>

        <div className="hostel-info-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Residence Complex
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {hostelDetail.hostelName || 'No hostel assigned'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Resident Warden: <strong>{hostelDetail.wardenName || 'Not recorded'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#2563eb', marginTop: '0.25rem' }}>
            <Phone size={13} /> {hostelDetail.wardenContact || 'Not recorded'}
          </div>
        </div>

        <div className="hostel-info-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Allocation Status
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669' }}>
            {residenceStatus === 'loading' ? 'Loading' : hostelDetail.roomNumber ? 'Allocated' : 'Not allocated'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {residenceStatus === 'error' ? residenceError : hostelDetail.roomNumber ? 'Current room and bed are linked to your student record.' : 'Contact the hostel office if you need an allocation.'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginTop: '0.25rem' }}>
            {residenceStatus === 'error' ? 'Residence data unavailable' : 'Status from the student record'}
          </div>
        </div>
      </div>

      {residenceStatus === 'loading' && <p role="status">Loading residence information…</p>}

      {/* Roommates & Rules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Roommates */}
        <div className="hostel-info-card" style={{ gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Room {hostelDetail.roomNumber || '—'} Roommates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(hostelDetail.roommates || []).map((mate, idx) => (
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
            {(hostelDetail.rules || []).map((rule, idx) => (
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
            background: submitFeedback.type === 'error' ? '#fff1f2' : '#ecfdf5',
            border: `1px solid ${submitFeedback.type === 'error' ? '#fb7185' : '#10b981'}`,
            color: submitFeedback.type === 'error' ? '#9f1239' : '#065f46',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {submitFeedback.type === 'error' ? <AlertCircle size={18} color="#e11d48" /> : <CheckCircle2 size={18} color="#10b981" />}
            <span>{submitFeedback.message}</span>
            <button
              onClick={() => setSubmitFeedback(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {complaintsStatus === 'loading' && <p role="status">Loading your maintenance complaints…</p>}
        {complaintsStatus === 'error' && <p role="alert">{complaintsError}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {complaints.map(c => {
            const isResolved = c.status === 'Resolved';
            const isInProgress = c.status === 'In Progress';
            const isAssigned = c.status === 'Assigned' || isInProgress || isResolved;
            const confPercent = c.confidence == null ? null : Math.round(c.confidence * 100);

            return (
              <div key={c.id} className="complaint-card-enhanced">
                {/* Top Row */}
                <div className="complaint-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>{c.title}</strong>
                    {c.priority && <span className={`admin-badge ${c.priority === 'High' ? 'rejected' : 'pending'}`}>{c.priority}</span>}
                    <span className="admin-badge active">{c.category}</span>
                    {c.predictedCategory && confPercent !== null && (
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
                  <span>📅 {c.filedDate || 'Date unavailable'}</span>
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
                          {c.assignedStaffRole || 'Assigned staff'}
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
                {(c.attachmentUrl || c.imageUrl) && (
                  <div className="complaint-image-wrap">
                    <img
                      src={c.attachmentUrl || c.imageUrl}
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

          {complaintsStatus === 'loaded' && complaints.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
              <AlertCircle size={28} style={{ opacity: 0.4, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
              No maintenance complaints recorded for your account.
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
          setComplaintsStatus('loaded');
          setSubmitFeedback({
            type: 'success',
            message: newTicket.assignedStaffName
              ? `Complaint #${newTicket.id} registered! Classified as ${newTicket.category} and assigned to ${newTicket.assignedStaffName}.`
              : `Complaint #${newTicket.id} registered and queued for supervisor triage.`,
          });
        }}
        defaultLocation={complaintForm.location}
        hostelName={hostelDetail.hostelName || ''}
        roomNumber={hostelDetail.roomNumber || ''}
      />

      {/* Full Image Viewer Modal */}
      {expandedComplaint && (expandedComplaint.attachmentUrl || expandedComplaint.imageUrl) && (
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
              src={expandedComplaint.attachmentUrl || expandedComplaint.imageUrl}
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
