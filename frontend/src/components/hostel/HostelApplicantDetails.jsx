import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Printer,
  FileSpreadsheet,
  Building,
  UserCheck,
  Phone,
  MapPin,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  getAllApplicants,
  updateApplicantStatus,
  getAllHostels
} from '../../services/hostelAttendanceStore.js';
import './HostelModules.css';

export default function HostelApplicantDetails({ account }) {
  const [applicants, setApplicants] = useState(() => getAllApplicants());
  const [hostels] = useState(() => getAllHostels());
  const [searchQuery, setSearchQuery] = useState('');
  const [hostelFilter, setHostelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const isHostelAdmin = account?.role === 'hostel_admin' || account?.role === 'admin';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchHostel =
        hostelFilter === 'ALL' ||
        app.preferredHostel === hostelFilter ||
        app.allottedHostel === hostelFilter;

      const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        app.studentName.toLowerCase().includes(query) ||
        app.applicationNo.toLowerCase().includes(query) ||
        (app.rollNo && app.rollNo.toLowerCase().includes(query)) ||
        (app.regNo && app.regNo.toLowerCase().includes(query));

      return matchHostel && matchStatus && matchSearch;
    });
  }, [applicants, hostelFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = applicants.length;
    const allotted = applicants.filter(a => a.status === 'Allotted').length;
    const underReview = applicants.filter(a => a.status === 'Under Review').length;
    const approved = applicants.filter(a => a.status === 'Approved').length;
    const waitlisted = applicants.filter(a => a.status === 'Waitlisted').length;
    return { total, allotted, underReview, approved, waitlisted };
  }, [applicants]);

  const handleUpdateStatus = (appId, newStatus) => {
    const updated = updateApplicantStatus(appId, newStatus);
    setApplicants(updated);
    if (selectedApplicant?.id === appId) {
      setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
    }
    showToast(`Applicant ${appId} status updated to ${newStatus}.`);
  };

  const handleExportCsv = () => {
    const headers = ['Application No', 'Student Name', 'Reg No', 'Roll No', 'Gender', 'Branch', 'Sem', 'CGPA', 'Allotted Hostel', 'Room', 'Bed', 'Parent Phone', 'Status', 'Fee Status'];
    const rows = filteredApplicants.map(a => [
      a.applicationNo,
      a.studentName,
      a.regNo,
      a.rollNo,
      a.gender,
      a.branch,
      a.semester,
      a.cgpa,
      a.allottedHostel,
      a.roomNo,
      a.bedNo,
      a.guardianPhone,
      a.status,
      a.feeStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Applicants_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Exported applicant records to CSV/Excel.');
  };

  return (
    <div className="hostel-unified-module">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="hostel-toast-banner success">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="hostel-page-header">
        <div className="hostel-breadcrumb">
          <span>Home</span> / <span>Hostel</span> / <span className="current">View Applicant Details</span>
        </div>
        <div className="hostel-header-title-row">
          <div>
            <h2>Hostel Accommodation Applicant Details</h2>
            <p>Review boarding applications, merit scores, allotted room credentials, and guardian contacts across all hostel blocks.</p>
          </div>
          <div className="hostel-role-tag">
            <Users size={16} /> Registry Access: {account?.role === 'hostel_admin' ? 'Hostel Admin' : 'Resident Warden'}
          </div>
        </div>
      </div>

      <div className="hostel-card-container">
        {/* KPI Summary Cards */}
        <div className="attendance-kpi-grid">
          <div className="kpi-box total">
            <div className="kpi-num">{stats.total}</div>
            <div className="kpi-label">Total Applications</div>
            <div className="kpi-sub">Academic Session 2026-27</div>
          </div>
          <div className="kpi-box present">
            <div className="kpi-num">{stats.allotted}</div>
            <div className="kpi-label">Allotted Beds</div>
            <div className="kpi-sub">Room &amp; Bed Allocated</div>
          </div>
          <div className="kpi-box leave">
            <div className="kpi-num">{stats.underReview}</div>
            <div className="kpi-label">Under Review</div>
            <div className="kpi-sub">Dossier verification pending</div>
          </div>
          <div className="kpi-box absent">
            <div className="kpi-num">{stats.waitlisted}</div>
            <div className="kpi-label">Waitlisted</div>
            <div className="kpi-sub">Awaiting block vacancy</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="view-attendance-toolbar">
          <div className="toolbar-left">
            <div className="filter-item">
              <label>Filter Hostel:</label>
              <select value={hostelFilter} onChange={e => setHostelFilter(e.target.value)}>
                <option value="ALL">All Hostels</option>
                {hostels.map(h => (
                  <option key={h.code} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Status Filter:</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="Allotted">Allotted</option>
                <option value="Approved">Approved</option>
                <option value="Under Review">Under Review</option>
                <option value="Waitlisted">Waitlisted</option>
              </select>
            </div>

            <div className="filter-item" style={{ minWidth: '220px' }}>
              <label>Search Applicant:</label>
              <div className="input-with-icon">
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Name, App No, Reg No..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="toolbar-right">
            <button
              type="button"
              className="export-btn excel"
              onClick={handleExportCsv}
              title="Download Applicants CSV"
            >
              <FileSpreadsheet size={15} /> EXCEL
            </button>
            <button
              type="button"
              className="export-btn print"
              onClick={() => window.print()}
              title="Print Allotment Registry"
            >
              <Printer size={15} /> Print
            </button>
          </div>
        </div>

        {/* Applicants Data Table */}
        <div className="hostel-table-wrapper">
          <table className="hostel-custom-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>#</th>
                <th>Application No</th>
                <th>Applicant Name</th>
                <th>Branch &amp; Sem</th>
                <th>CGPA</th>
                <th>Hostel &amp; Bed</th>
                <th>Guardian Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-records-cell">
                    No applicant records found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app, idx) => (
                  <tr key={app.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <code style={{ fontWeight: 700, color: '#2563eb' }}>{app.applicationNo}</code>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Applied: {app.appliedDate}</div>
                    </td>
                    <td>
                      <div className="student-name-bold">{app.studentName}</div>
                      <div className="student-subtext">Reg: {app.regNo} · Roll: {app.rollNo}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>{app.branch}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.semester} ({app.gender})</div>
                    </td>
                    <td>
                      <span className="cgpa-pill">{app.cgpa}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.allottedHostel}</div>
                      {app.roomNo && app.roomNo !== 'Pending Allotment' && app.roomNo !== 'Waiting List' ? (
                        <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                          Room {app.roomNo} · {app.bedNo}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#d97706' }}>{app.roomNo}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{app.guardianName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{app.guardianPhone}</div>
                    </td>
                    <td>
                      {app.status === 'Allotted' && <span className="h-status-badge present">✓ Allotted</span>}
                      {app.status === 'Approved' && <span className="h-status-badge leave">Approved</span>}
                      {app.status === 'Under Review' && <span className="h-status-badge review">Under Review</span>}
                      {app.status === 'Waitlisted' && <span className="h-status-badge absent">Waitlist</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="h-btn-inspect"
                        onClick={() => setSelectedApplicant(app)}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Full Detail Modal */}
      {selectedApplicant && (
        <div className="hostel-modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div className="hostel-modal-box" onClick={e => e.stopPropagation()}>
            <div className="hostel-modal-header">
              <div>
                <h3>Hostel Boarding Application Dossier</h3>
                <p>Application ID: {selectedApplicant.applicationNo}</p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedApplicant(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="hostel-modal-body">
              <div className="modal-profile-strip">
                <div className="avatar-circle">
                  {selectedApplicant.studentName.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedApplicant.studentName}</h4>
                  <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.82rem' }}>
                    {selectedApplicant.regNo} · {selectedApplicant.branch} ({selectedApplicant.semester})
                  </p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="cgpa-pill" style={{ fontSize: '0.92rem', padding: '4px 12px' }}>
                    CGPA: {selectedApplicant.cgpa}
                  </span>
                </div>
              </div>

              <div className="modal-grid-2col">
                <div className="modal-info-card">
                  <h5>Accommodation Details</h5>
                  <div className="info-row">
                    <span className="info-lbl">Preferred Hostel:</span>
                    <strong>{selectedApplicant.preferredHostel}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-lbl">Allotted Hostel:</span>
                    <strong>{selectedApplicant.allottedHostel}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-lbl">Room &amp; Bed:</span>
                    <strong>{selectedApplicant.roomNo} ({selectedApplicant.bedNo})</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-lbl">Hostel Fee Status:</span>
                    <strong style={{ color: '#15803d' }}>{selectedApplicant.feeStatus}</strong>
                  </div>
                </div>

                <div className="modal-info-card">
                  <h5>Guardian &amp; Permanent Residence</h5>
                  <div className="info-row">
                    <span className="info-lbl">Guardian Name:</span>
                    <strong>{selectedApplicant.guardianName}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-lbl">Guardian Phone:</span>
                    <strong>{selectedApplicant.guardianPhone}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-lbl">Student Phone:</span>
                    <strong>{selectedApplicant.phone}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-lbl">Home City &amp; Distance:</span>
                    <strong>{selectedApplicant.homeCity} ({selectedApplicant.distanceKm} km from campus)</strong>
                  </div>
                </div>
              </div>

              {/* Status Update for Hostel Admin */}
              {isHostelAdmin && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Hostel Admin Status Sanction</h5>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="bulk-btn mark-present"
                      onClick={() => handleUpdateStatus(selectedApplicant.id, 'Allotted')}
                    >
                      ✓ Sanction Allotment
                    </button>
                    <button
                      type="button"
                      className="bulk-btn"
                      style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                      onClick={() => handleUpdateStatus(selectedApplicant.id, 'Approved')}
                    >
                      Approve Dossier
                    </button>
                    <button
                      type="button"
                      className="bulk-btn mark-absent"
                      onClick={() => handleUpdateStatus(selectedApplicant.id, 'Waitlisted')}
                    >
                      Move to Waitlist
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hostel-modal-footer">
              <button
                type="button"
                className="h-btn-secondary"
                onClick={() => setSelectedApplicant(null)}
              >
                Close Dossier
              </button>
              <button
                type="button"
                className="h-btn-action-primary"
                onClick={() => {
                  window.print();
                  showToast('Preparing printable hostel allotment credentials.');
                }}
              >
                <Printer size={15} /> Print Allotment Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
