import React, { useState, useMemo } from 'react';
import { 
  GitPullRequest, CheckCircle2, XCircle, Clock, Search, 
  Filter, FileText, Check, X, User, AlertCircle 
} from 'lucide-react';
import { mockTransportRequests } from './transportData';
import './TransportExtraSections.css';

export default function TransportRequestsSection() {
  const [data, setData] = useState(mockTransportRequests);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReq, setSelectedReq] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          item.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.reason.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'ALL' || item.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || item.status.includes(statusFilter);
      return matchSearch && matchType && matchStatus;
    });
  }, [data, search, typeFilter, statusFilter]);

  // Statistics
  const totalCount = data.length;
  const pendingCount = data.filter(d => d.status.includes('Pending')).length;
  const approvedCount = data.filter(d => d.status.includes('Approved')).length;
  const rejectedCount = data.filter(d => d.status.includes('Rejected')).length;

  const handleDecision = (id, decision) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: decision === 'Approved' ? 'Approved & Pass Updated' : 'Rejected',
          reviewNotes: reviewNote || (decision === 'Approved' ? 'Approved by Transport Officer.' : 'Rejected due to vehicle capacity limits.')
        };
      }
      return item;
    }));
    setSelectedReq(null);
    setReviewNote('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><GitPullRequest size={24} className="text-sky-600" /> Transport Requests & Approvals</h2>
          <p>Student transit change petitions: route modifications, stoppage shifts, and fee refund clearances.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><GitPullRequest size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalCount}</span>
            <span className="trans-kpi-title">Submitted Petitions</span>
            <span className="trans-kpi-subtitle">Current semester batch</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{pendingCount}</span>
            <span className="trans-kpi-title">Pending Review</span>
            <span className="trans-kpi-subtitle">Awaiting route verification</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{approvedCount}</span>
            <span className="trans-kpi-title">Approved & Synced</span>
            <span className="trans-kpi-subtitle">Bus pass updated</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><XCircle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{rejectedCount}</span>
            <span className="trans-kpi-title">Declined</span>
            <span className="trans-kpi-subtitle">Capacity limits reached</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="trans-filter-strip">
        <div className="trans-filter-group">
          <div className="trans-search-input">
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search student, roll number, reason..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All Request Types</option>
            <option value="Route Change">Route Change</option>
            <option value="New Stop Addition">New Stop Addition</option>
            <option value="Bus Pass Cancellation">Bus Pass Cancellation</option>
          </select>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> student requests
          </span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Student & Roll No</th>
                <th>Request Type</th>
                <th>Current Allocation</th>
                <th>Requested Shift</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Review Findings</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.studentName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{item.rollNumber}</div>
                  </td>
                  <td>
                    <span className="trans-badge info" style={{ fontWeight: 700 }}>{item.type}</span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{item.currentRoute}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>{item.requestedRoute}</div>
                    <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>Stop: {item.requestedStop}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>{item.requestDate}</td>
                  <td>
                    <span className={`trans-badge ${
                      item.status.includes('Approved') ? 'success' :
                      item.status.includes('Rejected') ? 'danger' : 'warning'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#475569', maxWidth: 200 }}>
                    {item.reviewNotes}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="trans-btn trans-btn-outline" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => { setSelectedReq(item); setReviewNote(item.reviewNotes || ''); }}
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="trans-modal-overlay" onClick={() => setSelectedReq(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><GitPullRequest size={18} className="text-sky-600" /> Audit Request: {selectedReq.id}</h3>
              <button className="trans-modal-close" onClick={() => setSelectedReq(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, fontSize: '0.84rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                  <div><strong>Student:</strong> {selectedReq.studentName} ({selectedReq.rollNumber})</div>
                  <div><strong>Type:</strong> {selectedReq.type}</div>
                  <div><strong>Current:</strong> {selectedReq.currentRoute}</div>
                  <div><strong>Requested:</strong> {selectedReq.requestedRoute} ({selectedReq.requestedStop})</div>
                </div>
                <div style={{ marginTop: '0.8rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem' }}>
                  <strong>Applicant's Justification:</strong>
                  <p style={{ margin: '0.3rem 0 0', color: '#334155' }}>{selectedReq.reason}</p>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Transport Officer Review Remarks:
                </label>
                <textarea 
                  rows={3} 
                  className="trans-select" 
                  style={{ width: '100%', resize: 'none' }}
                  placeholder="Seat capacity verified on Bus 02..."
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                />
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setSelectedReq(null)}>Cancel</button>
              <button className="trans-btn trans-btn-danger" onClick={() => handleDecision(selectedReq.id, 'Rejected')}>
                <X size={14} /> Reject Request
              </button>
              <button className="trans-btn trans-btn-success" onClick={() => handleDecision(selectedReq.id, 'Approved')}>
                <Check size={14} /> Approve & Update Bus Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
