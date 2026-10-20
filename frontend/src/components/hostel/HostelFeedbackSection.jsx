import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Star,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Eye,
  Check,
  X
} from 'lucide-react';
import { mockFeedbackSuggestions } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelFeedbackSection() {
  const [feedbacks, setFeedbacks] = useState(mockFeedbackSuggestions);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedFeedbackModal, setSelectedFeedbackModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const matchCat = categoryFilter === 'ALL' || f.category === categoryFilter;
      const matchSearch = !searchQuery ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.studentName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [feedbacks, categoryFilter, searchQuery]);

  const handleResolveFeedback = (id) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Resolved' } : f));
    if (selectedFeedbackModal?.id === id) {
      setSelectedFeedbackModal(prev => ({ ...prev, status: 'Resolved' }));
    }
    showToast(`Feedback ${id} marked as resolved!`);
  };

  return (
    <div className="hostel-section-container">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><MessageSquare size={24} color="#2563eb" /> Resident Feedback &amp; Suggestions Box</h2>
          <p>Living Comfort Audits · Mess Quality · Wi-Fi Speed · Hygiene &amp; Sports Feedback</p>
        </div>
      </div>

      {/* KPI Cards & Rating Metrics */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><Star size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>4.3 / 5.0</span>
            <span className="hostel-kpi-title">Overall Satisfaction</span>
            <span className="hostel-kpi-subtitle">Term Average (480 reviews)</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Shield size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">4.8 / 5.0</span>
            <span className="hostel-kpi-title">Security &amp; Safety</span>
            <span className="hostel-kpi-subtitle">Highest rated metric</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple"><MessageSquare size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{feedbacks.length}</span>
            <span className="hostel-kpi-title">Active Feedback</span>
            <span className="hostel-kpi-subtitle">Warden Action Queue</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Clock size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>92%</span>
            <span className="hostel-kpi-title">Resolution Rate</span>
            <span className="hostel-kpi-subtitle">Within 72-hour window</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-filter-group">
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search feedback suggestions or keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="hostel-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Feedback Categories</option>
            <option value="Mess & Food">Mess &amp; Food</option>
            <option value="Internet & Wi-Fi">Internet &amp; Wi-Fi</option>
            <option value="Sports & Recreation">Sports &amp; Recreation</option>
            <option value="Cleanliness & Hygiene">Cleanliness &amp; Hygiene</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {filteredFeedbacks.length} feedback submissions
        </div>
      </div>

      {/* Feedback Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredFeedbacks.map(fb => (
          <div key={fb.id} className="hostel-item-card" style={{ borderLeft: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{fb.id}</span>
                  <span className="h-badge h-badge-medium">{fb.category}</span>
                  <span className={`h-badge ${fb.status === 'Resolved' ? 'h-badge-approved' : 'h-badge-pending'}`}>
                    {fb.status}
                  </span>
                  {fb.studentName.includes('Anonymous') && (
                    <span className="h-badge h-badge-low">🔒 Anonymous</span>
                  )}
                </div>
                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.02rem', color: '#0f172a', fontWeight: 800 }}>
                  {fb.title}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {[1, 2, 3, 4, 5].map(st => (
                  <Star
                    key={st}
                    size={14}
                    color={st <= fb.rating ? '#f59e0b' : '#cbd5e1'}
                    fill={st <= fb.rating ? '#f59e0b' : 'none'}
                  />
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.84rem' }}>
              <div><strong>Residence:</strong> {fb.hostel} · Submitted on {fb.date} by {fb.studentName}</div>
              <div style={{ marginTop: '0.35rem', color: '#059669', fontWeight: 600 }}>
                ✓ Warden Action Taken: {fb.actionTaken}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Assigned: {fb.assignedStaff}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {fb.status !== 'Resolved' && (
                <button
                  className="h-btn h-btn-success"
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                  onClick={() => handleResolveFeedback(fb.id)}
                >
                  <Check size={13} /> Mark Resolved
                </button>
              )}
              <button
                className="h-btn h-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => setSelectedFeedbackModal(fb)}
              >
                <Eye size={13} /> Review Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedFeedbackModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedFeedbackModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Feedback Dossier #{selectedFeedbackModal.id}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedFeedbackModal.category} · BPUT Student Resident Grievance Cell
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedFeedbackModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', fontSize: '0.84rem' }}>
                <div><strong>Submission Subject:</strong> {selectedFeedbackModal.title}</div>
                <div style={{ marginTop: '4px' }}><strong>Resident:</strong> {selectedFeedbackModal.studentName}</div>
                <div style={{ marginTop: '4px' }}><strong>Hostel:</strong> {selectedFeedbackModal.hostel}</div>
                <div style={{ marginTop: '4px' }}><strong>Rating Given:</strong> {selectedFeedbackModal.rating} / 5 Stars</div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Action Initiated by Warden
                </div>
                <div style={{ fontSize: '0.88rem', color: '#14532d', lineHeight: 1.5 }}>
                  {selectedFeedbackModal.actionTaken}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              {selectedFeedbackModal.status !== 'Resolved' && (
                <button className="h-btn h-btn-success" onClick={() => handleResolveFeedback(selectedFeedbackModal.id)}>
                  Mark Resolved
                </button>
              )}
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedFeedbackModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
