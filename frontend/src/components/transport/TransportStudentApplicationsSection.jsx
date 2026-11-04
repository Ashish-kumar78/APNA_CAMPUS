import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertCircle,
  Bus,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  X,
  XCircle
} from 'lucide-react';
import { transportStore } from '../../services/transportStore';
import './TransportExtraSections.css';

export default function TransportStudentApplicationsSection() {
  const [applications, setApplications] = useState(() => transportStore.getStudentApplications());
  const [routes, setRoutes] = useState(() => transportStore.getRoutes());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    studentName: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    semester: 'Semester 3',
    parentContact: '',
    residentialAddress: '',
    preferredRoute: 'Route 1: Cuttack Badambadi Express',
    preferredStop: '',
  });

  useEffect(() => {
    const unsub = transportStore.subscribe(() => {
      setApplications(transportStore.getStudentApplications());
      setRoutes(transportStore.getRoutes());
    });
    return unsub;
  }, []);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchSearch = (app.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (app.rollNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (app.applicationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (app.preferredRoute || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, search, statusFilter]);

  const totalCount = applications.length;
  const pendingCount = applications.filter(a => a.status === 'Pending Review').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

  const handleDecision = async (decision) => {
    if (!selectedApp) return;
    await transportStore.decideStudentApplication(selectedApp.id, decision, decisionNotes);
    setSelectedApp(null);
    setDecisionNotes('');
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!newAppForm.studentName || !newAppForm.rollNumber || !newAppForm.preferredStop) {
      alert('Please fill out student name, roll number, and designated bus stop.');
      return;
    }
    await transportStore.addStudentApplication(newAppForm);
    setShowNewModal(false);
    setNewAppForm({
      studentName: '',
      rollNumber: '',
      department: 'Computer Science & Engineering',
      semester: 'Semester 3',
      parentContact: '',
      residentialAddress: '',
      preferredRoute: 'Route 1: Cuttack Badambadi Express',
      preferredStop: '',
    });
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><FileText size={24} className="text-sky-600" /> Student Transport Applications & Intake</h2>
          <p>Review new semester commuter applications, verify admission enrollment, audit route seat availability, and approve bus pass generation.</p>
        </div>
        <button className="trans-btn trans-btn-primary" onClick={() => setShowNewModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Plus size={15} /> New Transport Application
        </button>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><FileText size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalCount}</span>
            <span className="trans-kpi-title">Total Applications</span>
            <span className="trans-kpi-subtitle">Current academic intake</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{pendingCount}</span>
            <span className="trans-kpi-title">Pending Verification</span>
            <span className="trans-kpi-subtitle">Awaiting route seat audit</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{approvedCount}</span>
            <span className="trans-kpi-title">Approved & Passes Provisioned</span>
            <span className="trans-kpi-subtitle">Active bus passes issued</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><XCircle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{rejectedCount}</span>
            <span className="trans-kpi-title">Declined Applications</span>
            <span className="trans-kpi-subtitle">Full route or non-payment</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="trans-filter-bar">
        <div className="trans-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by student name, roll number, application ID, or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="trans-filter-dropdowns">
          <div className="trans-select-wrap">
            <Filter size={15} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Application Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="trans-table-card">
        <div className="trans-table-wrap">
          <table className="trans-table">
            <thead>
              <tr>
                <th>App No / Date</th>
                <th>Student Commuter</th>
                <th>Dept & Semester</th>
                <th>Preferred Route & Stop</th>
                <th>Guardian Contact</th>
                <th>Fee Assessment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                    No transport applications match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.applicationNumber || app.id}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.submissionDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.studentName}</div>
                      <span className="trans-code-badge">{app.rollNumber}</span>
                    </td>
                    <td>
                      <div>{app.department}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.semester}</div>
                    </td>
                    <td>
                      <strong>{app.preferredRoute}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>📍 {app.preferredStop}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', color: '#475569' }}>{app.parentContact || 'Registered on file'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                        {app.feeAssessmentStatus || 'Assessed ₹15,000'}
                      </span>
                    </td>
                    <td>
                      <span className={`trans-status-badge ${
                        app.status === 'Approved' ? 'success' :
                        app.status === 'Rejected' ? 'danger' : 'warning'
                      }`}>
                        {app.status === 'Approved' ? <CheckCircle2 size={12} /> :
                         app.status === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="trans-btn trans-btn-secondary" 
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye size={12} className="text-sky-600" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Decision Modal */}
      {selectedApp && (
        <div className="trans-modal-overlay">
          <div className="trans-modal-card" style={{ maxWidth: '560px' }}>
            <div className="trans-modal-header">
              <h3><UserCheck size={20} className="text-sky-600" /> Review Transport Application</h3>
              <button className="trans-modal-close" onClick={() => setSelectedApp(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.86rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Student Name:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{selectedApp.studentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Roll / Reg Number:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{selectedApp.rollNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Academic Program:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{selectedApp.department} ({selectedApp.semester})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Parent Phone:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{selectedApp.parentContact}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b' }}>Residential Address:</span>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{selectedApp.residentialAddress || 'On file with Admissions'}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <span style={{ color: '#64748b' }}>Requested Transit Route:</span>
                    <strong style={{ display: 'block', color: '#0284c7' }}>{selectedApp.preferredRoute} — Stop: {selectedApp.preferredStop}</strong>
                  </div>
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Officer Audit Remarks:
              </label>
              <textarea 
                rows={2}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                placeholder="Remarks (e.g. Seat confirmed on Bus 01, bus pass generated; or route full)..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
              />
            </div>
            <div className="trans-modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="trans-btn trans-btn-danger" 
                onClick={() => handleDecision('Rejected')}
              >
                <X size={16} /> Decline Application
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="trans-btn trans-btn-secondary" onClick={() => setSelectedApp(null)} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><X size={14} /> Cancel</button>
                <button 
                  className="trans-btn trans-btn-primary" 
                  onClick={() => handleDecision('Approved')}
                >
                  <Check size={16} /> Approve & Issue Bus Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Application Intake Modal */}
      {showNewModal && (
        <div className="trans-modal-overlay">
          <div className="trans-modal-card" style={{ maxWidth: '580px' }}>
            <div className="trans-modal-header">
              <h3><FileText size={20} className="text-sky-600" /> New Student Transport Intake Application</h3>
              <button className="trans-modal-close" onClick={() => setShowNewModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateApplication}>
              <div className="trans-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Student Name *</label>
                    <input 
                      type="text" 
                      required 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={newAppForm.studentName}
                      onChange={(e) => setNewAppForm({ ...newAppForm, studentName: e.target.value })}
                      placeholder="e.g. Ananya Mohapatra"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>College Roll / Reg No *</label>
                    <input 
                      type="text" 
                      required 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={newAppForm.rollNumber}
                      onChange={(e) => setNewAppForm({ ...newAppForm, rollNumber: e.target.value })}
                      placeholder="e.g. 2401432299"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Department</label>
                    <select 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={newAppForm.department}
                      onChange={(e) => setNewAppForm({ ...newAppForm, department: e.target.value })}
                    >
                      <option>Computer Science & Engineering</option>
                      <option>Electronics & Communication</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Electrical Engineering</option>
                      <option>MBA / Management</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Semester</label>
                    <select 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={newAppForm.semester}
                      onChange={(e) => setNewAppForm({ ...newAppForm, semester: e.target.value })}
                    >
                      <option>Semester 1</option>
                      <option>Semester 2</option>
                      <option>Semester 3</option>
                      <option>Semester 4</option>
                      <option>Semester 5</option>
                      <option>Semester 6</option>
                      <option>Semester 7</option>
                      <option>Semester 8</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Parent / Guardian Phone</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={newAppForm.parentContact}
                      onChange={(e) => setNewAppForm({ ...newAppForm, parentContact: e.target.value })}
                      placeholder="+91 94370 00000"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Residential Address</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={newAppForm.residentialAddress}
                      onChange={(e) => setNewAppForm({ ...newAppForm, residentialAddress: e.target.value })}
                      placeholder="Street / Locality / City"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Preferred Route *</label>
                  <select 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={newAppForm.preferredRoute}
                    onChange={(e) => setNewAppForm({ ...newAppForm, preferredRoute: e.target.value })}
                  >
                    {routes.map(r => (
                      <option key={r.id || r.routeNumber} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Preferred Boarding / Drop-off Stop *</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={newAppForm.preferredStop}
                    onChange={(e) => setNewAppForm({ ...newAppForm, preferredStop: e.target.value })}
                    placeholder="e.g. Badambadi Square, Link Road, or Vani Vihar"
                  />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-secondary" onClick={() => setShowNewModal(false)} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><X size={14} /> Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">
                  <Check size={16} /> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

