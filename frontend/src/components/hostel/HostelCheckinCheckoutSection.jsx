import React, { useState } from 'react';
import {
  LogIn,
  LogOut,
  CheckSquare,
  Key,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { mockCheckinCheckoutList } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelCheckinCheckoutSection() {
  const [records, setRecords] = useState(mockCheckinCheckoutList);
  const [activeTab, setActiveTab] = useState('check-in'); // 'check-in' | 'check-out' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordModal, setSelectedRecordModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredRecords = records.filter(r => {
    const matchTab = activeTab === 'all' ||
      (activeTab === 'check-in' && r.type === 'Check-in') ||
      (activeTab === 'check-out' && r.type === 'Check-out');
    const matchSearch = !searchQuery ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hostelName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleCompleteProcess = (id) => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: r.type === 'Check-in' ? 'Completed' : 'Check-out Approved',
          checklist: Object.keys(r.checklist).reduce((acc, k) => ({ ...acc, [k]: true }), {})
        };
      }
      return r;
    }));
    showToast(`Inspection and handover clearance finalized for ${id}`);
    if (selectedRecordModal?.id === id) {
      setSelectedRecordModal(null);
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
          <h2><LogIn size={24} color="#2563eb" /> Student Check-in &amp; Check-out Handover</h2>
          <p>Key Custody · Physical Room Asset Audit · No-Dues Clearance · Inventory Sign-off</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            Print Handover Certificate
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><LogIn size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>
              {records.filter(r => r.type === 'Check-in' && r.status === 'Completed').length}
            </span>
            <span className="hostel-kpi-title">Checked-in Boarders</span>
            <span className="hostel-kpi-subtitle">Current Academic Term</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Clock size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>
              {records.filter(r => r.type === 'Check-in' && r.status === 'Awaiting Check-in').length}
            </span>
            <span className="hostel-kpi-title">Awaiting Verification</span>
            <span className="hostel-kpi-subtitle">Pending smart card</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon rose"><LogOut size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#e11d48' }}>
              {records.filter(r => r.type === 'Check-out' && r.status.includes('Pending')).length}
            </span>
            <span className="hostel-kpi-title">Pending Check-outs</span>
            <span className="hostel-kpi-subtitle">No-dues audit stage</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Key size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">100%</span>
            <span className="hostel-kpi-title">Key Custody Rate</span>
            <span className="hostel-kpi-subtitle">Reconciled with register</span>
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
              placeholder="Search resident name, registration, or hostel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hostel-tab-pills">
            <button
              className={`hostel-tab-pill ${activeTab === 'check-in' ? 'active' : ''}`}
              onClick={() => setActiveTab('check-in')}
            >
              <LogIn size={13} /> Check-in Operations ({records.filter(r => r.type === 'Check-in').length})
            </button>
            <button
              className={`hostel-tab-pill ${activeTab === 'check-out' ? 'active' : ''}`}
              onClick={() => setActiveTab('check-out')}
            >
              <LogOut size={13} /> Check-out Inspections ({records.filter(r => r.type === 'Check-out').length})
            </button>
            <button
              className={`hostel-tab-pill ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Records
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {filteredRecords.length} records in queue
        </div>
      </div>

      {/* Table */}
      <div className="hostel-table-container">
        <div className="hostel-table-scroll">
          <table className="hostel-data-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Resident / Registration</th>
                <th>Hostel &amp; Room</th>
                <th>Date</th>
                <th>Audit Checklist Status</th>
                <th>Handover Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className={`h-badge ${item.type === 'Check-in' ? 'h-badge-approved' : 'h-badge-urgent'}`}>
                      {item.type === 'Check-in' ? 'Check-in Entry' : 'Check-out Departure'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.studentName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {item.rollNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.hostelName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                      Room {item.roomNumber} ({item.bedNumber})
                    </div>
                  </td>
                  <td>{item.date}</td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                      {item.notes}
                    </div>
                  </td>
                  <td>
                    <span className={`h-badge ${item.status === 'Completed' || item.status === 'Check-out Approved' ? 'h-badge-approved' : 'h-badge-pending'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        className="h-btn h-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                        onClick={() => setSelectedRecordModal(item)}
                      >
                        <Eye size={13} /> Review
                      </button>
                      {item.status !== 'Completed' && item.status !== 'Check-out Approved' && (
                        <button
                          className="h-btn h-btn-success"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleCompleteProcess(item.id)}
                        >
                          <Check size={13} /> Finalize
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

      {/* MODAL: CHECKLIST AUDIT */}
      {selectedRecordModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedRecordModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>
                  {selectedRecordModal.type} Inspection Checklist · {selectedRecordModal.id}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Student: {selectedRecordModal.studentName} ({selectedRecordModal.rollNumber})
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedRecordModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div><strong>Hostel Residence:</strong> {selectedRecordModal.hostelName}</div>
                <div><strong>Room &amp; Bed:</strong> Room {selectedRecordModal.roomNumber} ({selectedRecordModal.bedNumber})</div>
                <div><strong>Handover Date:</strong> {selectedRecordModal.date}</div>
                <div><strong>Current Status:</strong> {selectedRecordModal.status}</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Mandatory Verification Checklist
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(selectedRecordModal.checklist).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: val ? '#f0fdf4' : '#fffbeb', borderRadius: '6px', fontSize: '0.84rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span style={{ fontWeight: 800, color: val ? '#059669' : '#d97706' }}>
                        {val ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              {selectedRecordModal.status !== 'Completed' && selectedRecordModal.status !== 'Check-out Approved' && (
                <button
                  className="h-btn h-btn-success"
                  onClick={() => handleCompleteProcess(selectedRecordModal.id)}
                >
                  <Check size={14} /> Complete Inspection &amp; Clearance
                </button>
              )}
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedRecordModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
