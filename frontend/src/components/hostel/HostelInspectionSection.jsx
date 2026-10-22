import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building,
  ShieldCheck,
  Search,
  Plus,
  Eye,
  X,
  Check
} from 'lucide-react';
import { mockInspectionCompliance } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelInspectionSection() {
  const [inspections, setInspections] = useState(mockInspectionCompliance);
  const [selectedInspectionModal, setSelectedInspectionModal] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    hostelName: 'Gandhi Boys Residence',
    date: '2026-10-25',
    inspector: 'Mr. Rajesh Jena (Chief Warden)',
    findings: 'Scheduled bi-weekly surprise safety and cleanliness inspection of 2nd and 3rd floors.',
    correctiveAction: 'Check prohibited heating elements, water purifier TDS, and stairwell fire exits.',
    followUpDate: '2026-11-05'
  });
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    const newId = `INSP-2026-0${Math.floor(35 + Math.random() * 50)}`;
    const entry = {
      id: newId,
      ...newSchedule,
      score: '96.0%',
      status: 'Upcoming Audit'
    };
    setInspections([entry, ...inspections]);
    setIsScheduleModalOpen(false);
    showToast(`Inspection ${newId} scheduled successfully`);
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
          <h2><ClipboardCheck size={24} color="#2563eb" /> Hostel Inspection &amp; Statutory Compliance</h2>
          <p>Fire Safety Audits · Sanitary &amp; Hygiene Standards · Prohibited Device Sweep Rounds</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-primary" onClick={() => setIsScheduleModalOpen(true)}>
            <Plus size={15} /> Schedule New Inspection
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><ShieldCheck size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>96.4%</span>
            <span className="hostel-kpi-title">Safety Compliance Score</span>
            <span className="hostel-kpi-subtitle">BPUT Regulatory Benchmark</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Calendar size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">15 Oct 2026</span>
            <span className="hostel-kpi-title">Last Audit Date</span>
            <span className="hostel-kpi-subtitle">Dean SW &amp; Warden Joint</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><AlertTriangle size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>2</span>
            <span className="hostel-kpi-title">Upcoming Rounds</span>
            <span className="hostel-kpi-subtitle">Scheduled within 7 days</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple"><CheckCircle2 size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#7c3aed' }}>100%</span>
            <span className="hostel-kpi-title">Fire Extinguisher Health</span>
            <span className="hostel-kpi-subtitle">Green Gauge Certified</span>
          </div>
        </div>
      </div>

      {/* Audit History Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {inspections.map(insp => (
          <div key={insp.id} className="hostel-item-card" style={{ borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{insp.id}</span>
                  <span className={`h-badge ${insp.status.includes('Excellent') || insp.status.includes('Compliant') ? 'h-badge-approved' : 'h-badge-urgent'}`}>
                    {insp.status} ({insp.score})
                  </span>
                </div>
                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                  {insp.hostelName} · Sanitary &amp; Safety Round
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Inspectors: <strong>{insp.inspector}</strong> · Date: {insp.date}
                </div>
              </div>

              <button
                className="h-btn h-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => setSelectedInspectionModal(insp)}
              >
                <Eye size={13} /> View Audit Checklist
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.84rem' }}>
              <div><strong>Auditor Findings:</strong> {insp.findings}</div>
              <div style={{ marginTop: '0.35rem', color: '#059669', fontWeight: 600 }}>
                ✓ Mandated Corrective Action: {insp.correctiveAction}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Follow-up Re-Inspection: {insp.followUpDate}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: INSPECTION DETAILS */}
      {selectedInspectionModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedInspectionModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Inspection Audit Report · {selectedInspectionModal.id}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedInspectionModal.hostelName} · {selectedInspectionModal.date}
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedInspectionModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div><strong>Hostel Block:</strong> {selectedInspectionModal.hostelName}</div>
                <div><strong>Inspection Date:</strong> {selectedInspectionModal.date}</div>
                <div><strong>Compliance Score:</strong> {selectedInspectionModal.score}</div>
                <div><strong>Audit Status:</strong> {selectedInspectionModal.status}</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Inspection Team:</strong> {selectedInspectionModal.inspector}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Statutory Findings
                </div>
                <div style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.5 }}>
                  {selectedInspectionModal.findings}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Mandated Corrective Protocol
                </div>
                <div style={{ fontSize: '0.88rem', color: '#14532d', lineHeight: 1.5 }}>
                  {selectedInspectionModal.correctiveAction}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="h-btn h-btn-primary" onClick={() => window.print()}>
                Print Compliance Audit Sheet
              </button>
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedInspectionModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE NEW INSPECTION */}
      {isScheduleModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateSchedule}>
              <div className="admin-modal-header">
                <h3 style={{ margin: 0 }}>Schedule Hostel Safety &amp; Cleanliness Audit</h3>
                <button type="button" className="admin-table-action-btn" onClick={() => setIsScheduleModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Hostel Residence *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newSchedule.hostelName}
                      onChange={e => setNewSchedule({ ...newSchedule, hostelName: e.target.value })}
                    >
                      <option value="Gandhi Boys Residence">Gandhi Boys Residence</option>
                      <option value="Kalam Boys Residence">Kalam Boys Residence</option>
                      <option value="Sarojini Girls Residence">Sarojini Girls Residence</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Inspection Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newSchedule.date}
                      onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Inspection Team Members *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchedule.inspector}
                    onChange={e => setNewSchedule({ ...newSchedule, inspector: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Audit Objectives &amp; Focus Areas *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newSchedule.findings}
                    onChange={e => setNewSchedule({ ...newSchedule, findings: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="h-btn h-btn-secondary" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="h-btn h-btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
