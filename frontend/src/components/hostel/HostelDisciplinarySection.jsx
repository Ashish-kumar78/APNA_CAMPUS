import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Lock,
  Plus,
  Eye,
  CheckCircle2,
  Calendar,
  X,
  Check
} from 'lucide-react';
import { mockDisciplinaryRecords } from './hostelData.js';
import { isWardenSuspended, getWardenPermissions, getWardenIdFromAccount } from '../../services/wardenManagementStore.js';
import { getRoomsForHostelAndFloor } from '../../services/hostelRoomStore.js';
import { getAllHostels } from '../../services/hostelAttendanceStore.js';
import './HostelExtraSections.css';

export default function HostelDisciplinarySection({ account, isHostelAdmin = false, isSuspended: propIsSuspended }) {
  const [isSuspended, setIsSuspended] = useState(() => Boolean(propIsSuspended || (!isHostelAdmin && isWardenSuspended(account))));
  const [permsTick, setPermsTick] = useState(0);
  const [hostelList, setHostelList] = useState(() => getAllHostels());

  const wardenId = useMemo(() => getWardenIdFromAccount(account), [account]);

  React.useEffect(() => {
    const handleStatusSync = () => {
      setIsSuspended(Boolean(propIsSuspended || (!isHostelAdmin && isWardenSuspended(account))));
    };
    const handlePermSync = () => setPermsTick(t => t + 1);
    const handleHostelsSync = () => setHostelList(getAllHostels());

    window.addEventListener('bput_warden_status_changed', handleStatusSync);
    window.addEventListener('bput_warden_permissions_changed', handlePermSync);
    window.addEventListener('bput_hostels_updated', handleHostelsSync);
    window.addEventListener('storage', handleStatusSync);
    window.addEventListener('storage', handlePermSync);
    window.addEventListener('storage', handleHostelsSync);

    return () => {
      window.removeEventListener('bput_warden_status_changed', handleStatusSync);
      window.removeEventListener('bput_warden_permissions_changed', handlePermSync);
      window.removeEventListener('bput_hostels_updated', handleHostelsSync);
      window.removeEventListener('storage', handleStatusSync);
      window.removeEventListener('storage', handlePermSync);
      window.removeEventListener('storage', handleHostelsSync);
    };
  }, [propIsSuspended, isHostelAdmin, account]);

  const canRecordDisciplinary = useMemo(() => {
    if (isHostelAdmin) return true;
    if (isSuspended) return false;
    const perms = getWardenPermissions(wardenId);
    return perms.recordDisciplinaryIncidents !== false;
  }, [isHostelAdmin, isSuspended, wardenId, permsTick]);
  const [records, setRecords] = useState(mockDisciplinaryRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedRecordModal, setSelectedRecordModal] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [disciplinaryFloor, setDisciplinaryFloor] = useState('1st Floor');
  const [newIncident, setNewIncident] = useState({
    studentName: '',
    rollNumber: '',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '101',
    category: 'Curfew & Gate Violation',
    description: '',
    actionTaken: 'First Written Warning Issued',
    authorizedOfficial: 'Mr. Rajesh Jena (Chief Warden)',
    followUpDate: '2026-10-25'
  });
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchCat = categoryFilter === 'ALL' || r.category === categoryFilter;
      const matchSearch = !searchQuery ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [records, categoryFilter, searchQuery]);

  const handleCreateIncident = (e) => {
    e.preventDefault();
    if (!canRecordDisciplinary) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    if (!newIncident.studentName || !newIncident.rollNumber || !newIncident.description) {
      alert('Please fill all mandatory fields');
      return;
    }
    const newId = `DISC-2026-0${Math.floor(20 + Math.random() * 80)}`;
    const created = {
      id: newId,
      ...newIncident,
      date: '2026-10-19',
      status: 'Show-Cause Issued'
    };
    setRecords(prev => [created, ...prev]);
    setIsLogModalOpen(false);
    showToast(`Disciplinary inquiry ${newId} initiated`);
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
          <h2><ShieldAlert size={24} color="#dc2626" /> Hostel Disciplinary &amp; Code of Conduct</h2>
          <p>Curfew Infractions · Anti-Ragging Regulatory Compliance · Show-Cause Proceedings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <div
            style={{ display: 'inline-block' }}
            onClick={() => {
              if (!canRecordDisciplinary) {
                showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
              }
            }}
          >
            <button
              className="h-btn h-btn-primary"
              disabled={!canRecordDisciplinary}
              style={!canRecordDisciplinary ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
              onClick={() => {
                if (!canRecordDisciplinary) {
                  showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
                  return;
                }
                setIsLogModalOpen(true);
              }}
              title={!canRecordDisciplinary ? 'Permission restricted by Hostel Administration' : 'Log Disciplinary Incident'}
            >
              <Plus size={15} /> Log Disciplinary Incident
            </button>
          </div>
        </div>
      </div>

      {/* Confidentiality Warning Bar */}
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Lock size={20} color="#b91c1c" />
        <div style={{ fontSize: '0.82rem', color: '#991b1b' }}>
          <strong>CONFIDENTIAL CHIEF WARDEN DOSSIER:</strong> Disciplinary records are restricted strictly to the Chief Warden, Dean Student Welfare (DSW), and Principal Secretariat. Unauthorized dissemination violates student statutory protection laws.
        </div>
      </div>

      {/* Filter Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-filter-group">
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by student name, registration number, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="hostel-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Violation Categories</option>
            <option value="Curfew & Gate Violation">Curfew &amp; Gate Violation</option>
            <option value="Prohibited Electrical Appliance">Prohibited Electrical Appliance</option>
            <option value="Noise & Curfew Disturbance">Noise &amp; Curfew Disturbance</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {filteredRecords.length} records in active case registry
        </div>
      </div>

      {/* Table */}
      <div className="hostel-table-container">
        <div className="hostel-table-scroll">
          <table className="hostel-data-table">
            <thead>
              <tr>
                <th>Case File ID</th>
                <th>Student / Registration</th>
                <th>Hostel &amp; Room</th>
                <th>Category</th>
                <th>Incident Details</th>
                <th>Review Status</th>
                <th>Action Taken</th>
                <th style={{ textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(rec => (
                <tr key={rec.id}>
                  <td style={{ fontWeight: 800, color: '#dc2626' }}>{rec.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.studentName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {rec.rollNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{rec.hostelName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#475569' }}>Room {rec.roomNumber}</div>
                  </td>
                  <td>
                    <span className="h-badge h-badge-urgent">{rec.category}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.84rem', maxWidth: '280px', color: '#334155' }}>
                      {rec.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      Incident Date: {rec.date}
                    </div>
                  </td>
                  <td>
                    <span className={`h-badge ${rec.status.includes('Penalized') ? 'h-badge-rejected' : 'h-badge-pending'}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>
                      {rec.actionTaken}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Auth: {rec.authorizedOfficial}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="h-btn h-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                      onClick={() => setSelectedRecordModal(rec)}
                    >
                      <Eye size={13} /> Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VIEW DOSSIER */}
      {selectedRecordModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedRecordModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ borderBottom: '2px solid #fecaca' }}>
              <div>
                <h3 style={{ margin: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={16} /> Disciplinary Record #{selectedRecordModal.id}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  BPUT Board of Discipline &amp; Student Residence Code
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedRecordModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div><strong>Student Name:</strong> {selectedRecordModal.studentName}</div>
                <div><strong>Registration:</strong> {selectedRecordModal.rollNumber}</div>
                <div><strong>Hostel:</strong> {selectedRecordModal.hostelName}</div>
                <div><strong>Room:</strong> {selectedRecordModal.roomNumber}</div>
                <div><strong>Violation Category:</strong> {selectedRecordModal.category}</div>
                <div><strong>Incident Date:</strong> {selectedRecordModal.date}</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Factual Incident Narrative
                </div>
                <div style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.5 }}>
                  {selectedRecordModal.description}
                </div>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Sanction Imposed &amp; Follow-up
                </div>
                <div style={{ fontSize: '0.86rem', color: '#7f1d1d' }}>
                  <strong>Action:</strong> {selectedRecordModal.actionTaken}
                  <div style={{ marginTop: '4px' }}><strong>Authorized Authority:</strong> {selectedRecordModal.authorizedOfficial}</div>
                  <div style={{ marginTop: '2px' }}><strong>Scheduled Hearing / Follow-up:</strong> {selectedRecordModal.followUpDate}</div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="h-btn h-btn-primary" onClick={() => {
                showToast(`Hearing summons generated for ${selectedRecordModal.studentName}`);
                setSelectedRecordModal(null);
              }}>
                Issue Summons
              </button>
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedRecordModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG NEW INCIDENT */}
      {isLogModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsLogModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateIncident}>
              <div className="admin-modal-header">
                <h3 style={{ margin: 0, color: '#991b1b' }}>Record Disciplinary Violation</h3>
                <button type="button" className="admin-table-action-btn" onClick={() => setIsLogModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Student Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rohan Mishra"
                      value={newIncident.studentName}
                      onChange={e => setNewIncident({ ...newIncident, studentName: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Registration / Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 2305200088"
                      value={newIncident.rollNumber}
                      onChange={e => setNewIncident({ ...newIncident, rollNumber: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Hostel *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newIncident.hostelName}
                      onChange={e => {
                        const newHostel = e.target.value;
                        const available = getRoomsForHostelAndFloor(newHostel, disciplinaryFloor);
                        setNewIncident({
                          ...newIncident,
                          hostelName: newHostel,
                          roomNumber: available[0]?.roomNo || '101'
                        });
                      }}
                    >
                      {hostelList.map(h => (
                        <option key={h.id || h.code} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Floor *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={disciplinaryFloor}
                      onChange={e => {
                        const newFloor = e.target.value;
                        setDisciplinaryFloor(newFloor);
                        const available = getRoomsForHostelAndFloor(newIncident.hostelName, newFloor);
                        setNewIncident({
                          ...newIncident,
                          roomNumber: available[0]?.roomNo || '101'
                        });
                      }}
                    >
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="3rd Floor">3rd Floor</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Room Number *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newIncident.roomNumber}
                      onChange={e => setNewIncident({ ...newIncident, roomNumber: e.target.value })}
                      required
                    >
                      {getRoomsForHostelAndFloor(newIncident.hostelName, disciplinaryFloor).map(r => (
                        <option key={r.roomNo} value={r.roomNo}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Violation Category *
                  </label>
                  <select
                    className="hostel-select"
                    style={{ width: '100%' }}
                    value={newIncident.category}
                    onChange={e => setNewIncident({ ...newIncident, category: e.target.value })}
                  >
                    <option value="Curfew & Gate Violation">Curfew &amp; Gate Violation</option>
                    <option value="Prohibited Electrical Appliance">Prohibited Electrical Appliance</option>
                    <option value="Noise & Curfew Disturbance">Noise &amp; Curfew Disturbance</option>
                    <option value="Unauthorized Guest in Wing">Unauthorized Guest in Wing</option>
                    <option value="Hostel Property Defacement">Hostel Property Defacement</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Incident Description &amp; Evidence *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide exact facts, timing, witnesses, and caretaker statements..."
                    value={newIncident.description}
                    onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="h-btn h-btn-secondary" onClick={() => setIsLogModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="h-btn h-btn-danger">
                  Submit Disciplinary Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
