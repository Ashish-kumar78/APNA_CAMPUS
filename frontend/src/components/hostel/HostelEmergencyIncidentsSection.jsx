import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Flame,
  Zap,
  Activity,
  PhoneCall,
  Shield,
  Clock,
  CheckCircle2,
  Plus,
  Eye,
  X,
  RotateCcw
} from 'lucide-react';
import { mockEmergencyIncidents } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelEmergencyIncidentsSection() {
  const [incidents, setIncidents] = useState(mockEmergencyIncidents);
  const [selectedIncidentModal, setSelectedIncidentModal] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    title: '',
    category: 'Medical Emergency',
    severity: 'High',
    location: '',
    studentAffected: '',
    immediateResponse: '',
    responsibleOfficial: 'Mr. Rajesh Jena (Chief Warden)'
  });
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newLog.title || !newLog.location) {
      alert('Please fill all required incident details');
      return;
    }
    const newId = `EMG-2026-00${incidents.length + 1}`;
    const entry = {
      id: newId,
      ...newLog,
      date: '2026-10-19',
      time: '09:15 PM',
      escalationStatus: 'Notified Chief Security Officer & Dean SW',
      status: 'Under Investigation'
    };
    setIncidents([entry, ...incidents]);
    setIsLogModalOpen(false);
    showToast(`Emergency incident ${newId} logged and escalated!`);
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
          <h2><AlertOctagon size={24} color="#dc2626" /> Emergency &amp; Critical Incident Management</h2>
          <p>Medical Crises · Fire &amp; Electrical Safety · Campus Security Alert Dispatch</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-danger" onClick={() => setIsLogModalOpen(true)}>
            <Plus size={15} /> Log Emergency Incident
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon rose"><Flame size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#e11d48' }}>1</span>
            <span className="hostel-kpi-title">Critical Severity</span>
            <span className="hostel-kpi-subtitle">Immediate Safety</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Activity size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>1</span>
            <span className="hostel-kpi-title">Medical Response</span>
            <span className="hostel-kpi-subtitle">Ambulance dispatched</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>{incidents.filter(i => i.status.includes('Resolved') || i.status.includes('Closed')).length}</span>
            <span className="hostel-kpi-title">Resolved &amp; Closed</span>
            <span className="hostel-kpi-subtitle">All Clear Certified</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Clock size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">5.8 min</span>
            <span className="hostel-kpi-title">Avg Response Time</span>
            <span className="hostel-kpi-subtitle">Emergency Protocol</span>
          </div>
        </div>
      </div>

      {/* Incident List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {incidents.map(inc => (
          <div
            key={inc.id}
            className="hostel-item-card"
            style={{
              borderLeft: inc.severity === 'Critical' ? '5px solid #dc2626' : (inc.severity === 'High' ? '5px solid #f97316' : '5px solid #3b82f6')
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{inc.id}</span>
                  <span className={`h-badge ${inc.severity === 'Critical' ? 'h-badge-critical' : (inc.severity === 'High' ? 'h-badge-urgent' : 'h-badge-medium')}`}>
                    {inc.severity} Severity
                  </span>
                  <span className="h-badge h-badge-low">{inc.category}</span>
                </div>
                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                  {inc.title}
                </h3>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
                <div><strong>{inc.date}</strong> at {inc.time}</div>
                <div style={{ color: '#2563eb', fontWeight: 600 }}>📍 {inc.location}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>Affected Resident(s):</strong> {inc.studentAffected}</div>
              <div><strong>Immediate Response Executed:</strong> {inc.immediateResponse}</div>
              <div><strong>Responsible Official:</strong> {inc.responsibleOfficial}</div>
              <div style={{ color: '#059669', fontWeight: 700 }}>
                Escalation: {inc.escalationStatus}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.4rem' }}>
              <span className={`h-badge ${inc.status.includes('Resolved') || inc.status.includes('Closed') ? 'h-badge-approved' : 'h-badge-urgent'}`}>
                Status: {inc.status}
              </span>
              <button
                className="h-btn h-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => setSelectedIncidentModal(inc)}
              >
                <Eye size={13} /> Full Incident Log
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: FULL INCIDENT DETAILS */}
      {selectedIncidentModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedIncidentModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ borderBottom: '2px solid #cbd5e1' }}>
              <div>
                <h3 style={{ margin: 0 }}>Incident Report · {selectedIncidentModal.id}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Logged on {selectedIncidentModal.date} {selectedIncidentModal.time}
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedIncidentModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div><strong>Category:</strong> {selectedIncidentModal.category}</div>
                <div><strong>Severity:</strong> {selectedIncidentModal.severity}</div>
                <div><strong>Location:</strong> {selectedIncidentModal.location}</div>
                <div><strong>Responsible Official:</strong> {selectedIncidentModal.responsibleOfficial}</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Affected Parties:</strong> {selectedIncidentModal.studentAffected}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Actions Executed &amp; Resolution Notes
                </div>
                <div style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.5 }}>
                  {selectedIncidentModal.immediateResponse}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem', fontSize: '0.84rem' }}>
                <strong>Institutional Escalation:</strong> {selectedIncidentModal.escalationStatus}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="h-btn h-btn-primary" onClick={() => window.print()}>
                Print Statutory Incident Report
              </button>
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedIncidentModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG NEW EMERGENCY */}
      {isLogModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsLogModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-header">
                <h3 style={{ margin: 0, color: '#dc2626' }}>Report Emergency or Critical Incident</h3>
                <button type="button" className="admin-table-action-btn" onClick={() => setIsLogModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="admin-modal-body">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Incident Title / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inmate medical collapse in 2nd floor corridor"
                    value={newLog.title}
                    onChange={e => setNewLog({ ...newLog, title: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newLog.category}
                      onChange={e => setNewLog({ ...newLog, category: e.target.value })}
                    >
                      <option value="Medical Emergency">Medical Emergency</option>
                      <option value="Fire & Safety">Fire &amp; Safety</option>
                      <option value="Power & Infrastructure">Power &amp; Infrastructure</option>
                      <option value="Security Breach">Security Breach</option>
                      <option value="Water Grid Failure">Water Grid Failure</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Severity Level *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newLog.severity}
                      onChange={e => setNewLog({ ...newLog, severity: e.target.value })}
                    >
                      <option value="Critical">Critical (Immediate Danger)</option>
                      <option value="High">High Priority</option>
                      <option value="Moderate">Moderate</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Exact Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarojini Residence 2nd Floor"
                      value={newLog.location}
                      onChange={e => setNewLog({ ...newLog, location: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Affected Resident(s)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Patra (2305200004)"
                      value={newLog.studentAffected}
                      onChange={e => setNewLog({ ...newLog, studentAffected: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Immediate Countermeasures &amp; Response Executed *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe ambulance dispatch, fire extinguisher deployment, or first aid given..."
                    value={newLog.immediateResponse}
                    onChange={e => setNewLog({ ...newLog, immediateResponse: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="h-btn h-btn-secondary" onClick={() => setIsLogModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="h-btn h-btn-danger">
                  Dispatch &amp; Record Emergency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
