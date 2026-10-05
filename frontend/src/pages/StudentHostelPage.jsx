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
import { getStudentGatePasses } from '../services/gatePassStore.js';

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
  const [complaints, setComplaints] = useState(
    initialHostelComplaints.filter(c => c.rollNumber === '01').map(c => ({
      ...c,
      description: c.resolutionNotes || '',
      imageUrl: null,
    }))
  );
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: 'Electrical',
    title: '',
    description: '',
    priority: 'Medium',
    imageFile: null,
    imagePreview: null,
  });
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setComplaintForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setComplaintForm(prev => ({ ...prev, imageFile: null, imagePreview: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLodgeComplaint = (e) => {
    e.preventDefault();
    if (!complaintForm.title.trim()) return;

    const newTicket = {
      id: `CMP-${Math.floor(250 + Math.random() * 250)}`,
      studentName: 'Rakesh Das',
      rollNumber: '01',
      hostel: hostelDetail.hostelName,
      roomNumber: hostelDetail.roomNumber,
      category: complaintForm.category,
      title: complaintForm.title,
      description: complaintForm.description,
      priority: complaintForm.priority,
      status: 'Pending',
      filedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      resolutionNotes: 'Assigned to resident warden for contractor scheduling.',
      imageUrl: complaintForm.imagePreview || null,
    };

    setComplaints(prev => [newTicket, ...prev]);
    setIsLodgeModalOpen(false);
    setComplaintForm({ category: 'Electrical', title: '', description: '', priority: 'Medium', imageFile: null, imagePreview: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const statusColor = (status) =>
    status === 'Resolved' ? 'approved' : status === 'In Progress' ? 'pending' : 'rejected';

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {complaints.map(c => (
            <div key={c.id} className="complaint-card-enhanced">
              {/* Top Row */}
              <div className="complaint-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{c.title}</strong>
                  <span className={`admin-badge ${c.priority === 'High' ? 'rejected' : 'pending'}`}>{c.priority}</span>
                  <span className="admin-badge active">{c.category}</span>
                </div>
                <span className={`admin-badge ${statusColor(c.status)}`} style={{ flexShrink: 0 }}>
                  {c.status}
                </span>
              </div>

              {/* Meta */}
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Ticket: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>{c.id}</code>
                &nbsp;·&nbsp;Filed: {c.filedDate}
                &nbsp;·&nbsp;Room {c.roomNumber}
              </div>

              {/* Description */}
              {c.description && (
                <div className="complaint-description-block">
                  <FileText size={13} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '0.83rem', color: '#334155' }}>{c.description}</span>
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
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                ℹ️ {c.resolutionNotes}
              </div>
            </div>
          ))}

          {complaints.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              <AlertCircle size={28} style={{ opacity: 0.4, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
              No active maintenance complaints recorded.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: LODGE COMPLAINT */}
      {isLodgeModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsLodgeModalOpen(false)}>
          <div className="admin-modal-card complaint-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Lodge Hostel Maintenance Request</h3>
              <button className="admin-table-action-btn" onClick={() => setIsLodgeModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleLodgeComplaint}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Category + Priority row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      className="admin-form-select"
                      value={complaintForm.category}
                      onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    >
                      <option value="Electrical">Electrical (Fan, Light, Switch)</option>
                      <option value="Plumbing">Plumbing (Tap, Shower, Geyser)</option>
                      <option value="Internet / Wi-Fi">Internet / Wi-Fi</option>
                      <option value="Carpentry">Carpentry (Bed, Table, Almirah)</option>
                      <option value="Housekeeping">Housekeeping &amp; Cleaning</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Priority</label>
                    <select
                      className="admin-form-select"
                      value={complaintForm.priority}
                      onChange={e => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High (Urgent)</option>
                    </select>
                  </div>
                </div>

                {/* Issue Title */}
                <div className="admin-form-group">
                  <label>Issue Title <span style={{ color: '#e11d48' }}>*</span></label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={complaintForm.title}
                    onChange={e => setComplaintForm({ ...complaintForm, title: e.target.value })}
                    placeholder="e.g. Ceiling fan speed regulator broken"
                    required
                  />
                </div>

                {/* Detailed Description */}
                <div className="admin-form-group">
                  <label>Describe What Happened <span style={{ color: '#e11d48' }}>*</span></label>
                  <textarea
                    rows={4}
                    className="admin-form-input"
                    value={complaintForm.description}
                    onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    placeholder="Explain the problem in detail — when it started, how it affects daily routine, and what you observed (e.g. sparking, water leakage, no signal, etc.)"
                    required
                    style={{ resize: 'vertical', minHeight: '90px' }}
                  />
                  <small style={{ color: '#64748b' }}>
                    The more detail you provide, the faster our maintenance team can resolve it.
                  </small>
                </div>

                {/* Image Upload */}
                <div className="admin-form-group">
                  <label>Attach Photo (Optional)</label>
                  {!complaintForm.imagePreview ? (
                    <div
                      className="complaint-upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} style={{ color: '#7c3aed' }} />
                      <span style={{ fontWeight: 600, color: '#7c3aed', fontSize: '0.9rem' }}>Click to upload image</span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>JPG, PNG, WEBP up to 5MB</span>
                    </div>
                  ) : (
                    <div className="complaint-preview-wrap">
                      <img src={complaintForm.imagePreview} alt="Preview" className="complaint-preview-img" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                          ✓ {complaintForm.imageFile?.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', borderRadius: '8px', padding: '0.6rem 0.75rem', borderLeft: '3px solid #7c3aed' }}>
                  🔔 Warden and campus facilities team will inspect within 24 hours of submission.
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsLodgeModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary" style={{ background: '#7c3aed' }}>
                  <Send size={14} /> Submit Maintenance Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
