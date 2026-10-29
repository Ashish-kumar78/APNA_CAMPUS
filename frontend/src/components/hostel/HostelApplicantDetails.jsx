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
import StudentDossierDashboard from './StudentDossierDashboard.jsx';
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

  if (selectedApplicant) {
    return (
      <div className="hostel-unified-module">
        <StudentDossierDashboard
          applicant={selectedApplicant}
          account={account}
          onBack={() => setSelectedApplicant(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    );
  }

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

    </div>
  );
}
