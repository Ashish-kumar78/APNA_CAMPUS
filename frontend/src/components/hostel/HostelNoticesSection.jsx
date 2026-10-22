import React, { useState, useMemo } from 'react';
import {
  Bell,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Paperclip,
  Eye,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { mockHostelNotices } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelNoticesSection() {
  const [notices, setNotices] = useState(mockHostelNotices);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetHostelFilter, setTargetHostelFilter] = useState('ALL');
  const [selectedNoticeModal, setSelectedNoticeModal] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    targetHostel: 'All Hostels',
    targetGroup: 'All Boarders & Residents',
    publishDate: '2026-10-19',
    expiryDate: '2026-11-05',
    priority: 'General',
    status: 'Published',
    content: '',
    attachmentName: 'Circular_Ref_Notice.pdf',
    author: 'Office of Chief Warden'
  });
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const matchHostel = targetHostelFilter === 'ALL' || n.targetHostel === targetHostelFilter;
      const matchSearch = !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchHostel && matchSearch;
    });
  }, [notices, targetHostelFilter, searchQuery]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) {
      alert('Please fill notice title and content');
      return;
    }
    const newId = `NTC-HST-0${Math.floor(92 + Math.random() * 50)}`;
    const created = {
      id: newId,
      ...newNotice
    };
    setNotices([created, ...notices]);
    setIsCreateModalOpen(false);
    showToast(`Notice ${newId} published on digital boards`);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this notice?')) {
      setNotices(prev => prev.filter(n => n.id !== id));
      if (selectedNoticeModal?.id === id) setSelectedNoticeModal(null);
      showToast(`Notice removed from broadcast`);
    }
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
          <h2><Bell size={24} color="#2563eb" /> Hostel Notices &amp; Student Circulars</h2>
          <p>Digital Board Broadcasts · Festival Curfews · Maintenance Alerts · Student Advisories</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={15} /> Publish New Notice
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-filter-group">
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search circulars by keyword or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="hostel-select"
            value={targetHostelFilter}
            onChange={e => setTargetHostelFilter(e.target.value)}
          >
            <option value="ALL">All Target Residences</option>
            <option value="All Hostels">All Hostels (Universal)</option>
            <option value="Gandhi Boys Residence">Gandhi Boys Residence</option>
            <option value="Kalam Boys Residence">Kalam Boys Residence</option>
            <option value="Sarojini Girls Residence">Sarojini Girls Residence</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {filteredNotices.length} active broadcast advisories
        </div>
      </div>

      {/* Notices List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredNotices.map(notice => (
          <div key={notice.id} className="hostel-item-card" style={{ borderLeft: notice.priority === 'Urgent' ? '5px solid #dc2626' : '5px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{notice.id}</span>
                  <span className={`h-badge ${notice.priority === 'Urgent' ? 'h-badge-urgent' : 'h-badge-medium'}`}>
                    {notice.priority}
                  </span>
                  <span className={`h-badge ${notice.status === 'Published' ? 'h-badge-approved' : 'h-badge-low'}`}>
                    {notice.status}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    Target: <strong>{notice.targetHostel}</strong> ({notice.targetGroup})
                  </span>
                </div>
                <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                  {notice.title}
                </h3>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', textAlign: 'right' }}>
                <div>Published: <strong>{notice.publishDate}</strong></div>
                <div>Valid Till: {notice.expiryDate}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
              {notice.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.35rem' }}>
              <div>
                {notice.attachmentName ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#2563eb', fontWeight: 600, background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
                    <Paperclip size={12} /> {notice.attachmentName}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>No file attached</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="h-btn h-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                  onClick={() => setSelectedNoticeModal(notice)}
                >
                  <Eye size={13} /> Preview
                </button>
                <button
                  className="h-btn h-btn-danger"
                  style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                  title="Remove Notice"
                  onClick={() => handleDelete(notice.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: PREVIEW NOTICE */}
      {selectedNoticeModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedNoticeModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Notice Bulletin #{selectedNoticeModal.id}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedNoticeModal.author} · BPUT Student Residence Advisory
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedNoticeModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <span className="h-badge h-badge-approved">{selectedNoticeModal.status}</span>
                  <span className="h-badge h-badge-medium">{selectedNoticeModal.priority} Broadcast</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{selectedNoticeModal.title}</h2>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  Audience: <strong>{selectedNoticeModal.targetHostel}</strong> · Effective: {selectedNoticeModal.publishDate} to {selectedNoticeModal.expiryDate}
                </div>
              </div>

              <div style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6, padding: '0.5rem 0' }}>
                {selectedNoticeModal.content}
              </div>

              {selectedNoticeModal.attachmentName && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', fontWeight: 600 }}>
                    <FileText size={18} color="#2563eb" />
                    {selectedNoticeModal.attachmentName}
                  </div>
                  <button className="h-btn h-btn-secondary" style={{ padding: '3px 8px', fontSize: '0.74rem' }} onClick={() => showToast('Opening PDF attachment')}>
                    View Document
                  </button>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="h-btn h-btn-primary" onClick={() => window.print()}>
                Print Notice Circular
              </button>
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedNoticeModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NOTICE */}
      {isCreateModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-header">
                <h3 style={{ margin: 0 }}>Broadcast Institutional Notice</h3>
                <button type="button" className="admin-table-action-btn" onClick={() => setIsCreateModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="admin-modal-body">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Notice Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule for Electrical Maintenance & Curfew Notification"
                    value={newNotice.title}
                    onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Target Hostel *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newNotice.targetHostel}
                      onChange={e => setNewNotice({ ...newNotice, targetHostel: e.target.value })}
                    >
                      <option value="All Hostels">All Hostels (Universal)</option>
                      <option value="Gandhi Boys Residence">Gandhi Boys Residence</option>
                      <option value="Kalam Boys Residence">Kalam Boys Residence</option>
                      <option value="Sarojini Girls Residence">Sarojini Girls Residence</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Priority Level
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newNotice.priority}
                      onChange={e => setNewNotice({ ...newNotice, priority: e.target.value })}
                    >
                      <option value="General">General Notice</option>
                      <option value="Urgent">Urgent Broadcast</option>
                      <option value="Routine">Routine Advisory</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Full Notice Body / Advisory Content *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write detailed student notice instructions..."
                    value={newNotice.content}
                    onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="h-btn h-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="h-btn h-btn-primary">
                  Publish to Hostel Boards
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
