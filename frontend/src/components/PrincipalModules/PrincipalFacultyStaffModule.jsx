import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Award,
  CalendarCheck,
  Search,
  Filter,
  Check,
  X,
  Eye,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';
import { INITIAL_DEPARTMENTS, INITIAL_STAFF_REQUESTS } from './principalData.js';
import './PrincipalModules.css';

// Sample Teaching & Non-Teaching Staff Cadre
const INITIAL_STAFF_MEMBERS = [
  { id: 'FAC-01', name: 'Dr. P. K. Pattnaik', role: 'Professor & HOD', dept: 'CSE', cadre: 'Teaching', exp: '18 Years', qualification: 'Ph.D (IIT Kgp)', attendance: 'Present', publications: 42, activeLoad: '14 hrs/wk' },
  { id: 'FAC-02', name: 'Dr. S. K. Swain', role: 'Professor & HOD', dept: 'AIML', cadre: 'Teaching', exp: '16 Years', qualification: 'Ph.D (NIT)', attendance: 'Present', publications: 38, activeLoad: '14 hrs/wk' },
  { id: 'FAC-03', name: 'Dr. S. Mohanty', role: 'Associate Professor', dept: 'CSE', cadre: 'Teaching', exp: '11 Years', qualification: 'Ph.D', attendance: 'Present', publications: 26, activeLoad: '16 hrs/wk' },
  { id: 'FAC-04', name: 'Dr. M. R. Senapati', role: 'Professor & HOD', dept: 'ECE', cadre: 'Teaching', exp: '19 Years', qualification: 'Ph.D (IIT Roorkee)', attendance: 'Present', publications: 45, activeLoad: '12 hrs/wk' },
  { id: 'FAC-05', name: 'Prof. Tanmayee Mohanty', role: 'Assistant Professor', dept: 'CSE', cadre: 'Teaching', exp: '6 Years', qualification: 'M.Tech, Ph.D pursuing', attendance: 'On Duty', publications: 12, activeLoad: '18 hrs/wk' },
  { id: 'STF-01', name: 'Mr. Rakesh Jena', role: 'Senior Lab Technician', dept: 'MECH', cadre: 'Non-Teaching', exp: '14 Years', qualification: 'Diploma Mech', attendance: 'Present', publications: 0, activeLoad: 'Workshop Incharge' },
  { id: 'STF-02', name: 'Mrs. Jayashree Das', role: 'Systems Administrator', dept: 'CSE', cadre: 'Non-Teaching', exp: '9 Years', qualification: 'B.Tech IT', attendance: 'Present', publications: 0, activeLoad: 'Server Farm Lead' },
  { id: 'STF-03', name: 'Mr. Subrat Mohapatra', role: 'Assistant Librarian', dept: 'Library', cadre: 'Non-Teaching', exp: '12 Years', qualification: 'M.Lib.Sc', attendance: 'Present', publications: 4, activeLoad: 'Digital Repository' },
];

export default function PrincipalFacultyStaffModule({ onToast }) {
  const [staffMembers, setStaffMembers] = useState(INITIAL_STAFF_MEMBERS);
  const [requests, setRequests] = useState(INITIAL_STAFF_REQUESTS);
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [cadreFilter, setCadreFilter] = useState('All');

  // Modals
  const [profileModal, setProfileModal] = useState(null);
  const [requestModal, setRequestModal] = useState(null); // null or { req: item, action: 'APPROVE' | 'REJECT' }

  // Filtered Directory
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = deptFilter === 'All' || s.dept === deptFilter;
      const matchCadre = cadreFilter === 'All' || s.cadre === cadreFilter;
      return matchSearch && matchDept && matchCadre;
    });
  }, [staffMembers, searchQuery, deptFilter, cadreFilter]);

  const pendingRequestsCount = requests.filter((r) => r.status.includes('Pending')).length;

  // Handle Staff Request Action
  const handleConfirmRequest = (action) => {
    if (!requestModal) return;
    const targetId = requestModal.req.id;

    if (action === 'APPROVE') {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === targetId ? { ...r, status: 'Approved by Principal' } : r
        )
      );
      if (onToast) onToast(`Request ${targetId} approved for ${requestModal.req.applicantName}.`);
    } else {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === targetId ? { ...r, status: 'Declined by Principal' } : r
        )
      );
      if (onToast) onToast(`Request ${targetId} declined.`);
    }

    setRequestModal(null);
  };

  return (
    <div className="principal-module-container">
      {/* Notice Banner */}
      <div className="principal-banner-notice">
        <div className="principal-banner-text">
          <GraduationCap size={18} color="#0284c7" />
          <span>
            <strong>Academic Cadre &amp; Institutional Staff Overview:</strong> Consolidated faculty distribution, AICTE cadre ratios, and executive sanction of FDP grants and duty leaves.
          </span>
        </div>
        <div className="principal-banner-badge">Cadre Strength: 222 Staff</div>
      </div>

      {/* KPI Stat Strip */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Teaching Faculty</span>
            <GraduationCap size={16} color="#0284c7" />
          </div>
          <div className="principal-stat-box-val">148</div>
          <div className="principal-stat-box-sub">92 Ph.D Holders · 38 Professors</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Non-Teaching &amp; Technical</span>
            <Users size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val">74</div>
          <div className="principal-stat-box-sub">Lab Techs, Admin &amp; Library Staff</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Faculty Attendance Today</span>
            <CalendarCheck size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>96.8%</div>
          <div className="principal-stat-box-sub">142 of 148 active on campus</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Pending Staff Grants</span>
            <AlertTriangle size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val" style={{ color: pendingRequestsCount > 0 ? '#d97706' : '#15803d' }}>
            {pendingRequestsCount} Pending
          </div>
          <div className="principal-stat-box-sub">FDP, Travel &amp; Research Leaves</div>
        </div>
      </div>

      {/* SECTION 1: Department-Wise Staff Distribution & Vacancy Summary */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Departmental Staff Distribution &amp; Cadre Balance</h3>
            <p>Faculty-to-student ratio and cadre distribution complying with statutory AICTE requirements</p>
          </div>
          <span className="pbadge info">Cadre Ratio 1:20 Maintained</span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Sanctioned Posts</th>
                <th>Filled Posts</th>
                <th>Vacancies</th>
                <th>Faculty On Duty Today</th>
                <th>Student : Faculty Ratio</th>
                <th>Cadre Health</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => {
                const ratio = Math.round(dept.studentCount / (dept.facultyCount || 1));
                const vacancies = Math.max(0, Math.round(dept.facultyCount * 0.1));
                return (
                  <tr key={dept.code}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{dept.name}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>HOD: {dept.hod}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{dept.facultyCount + vacancies}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{dept.facultyCount}</td>
                    <td style={{ fontWeight: 700, color: vacancies > 2 ? '#b45309' : '#15803d' }}>
                      {vacancies} {vacancies > 0 ? 'Open Posts' : 'Zero'}
                    </td>
                    <td style={{ color: '#15803d', fontWeight: 600 }}>
                      {dept.facultyOnDuty || dept.facultyCount} Active
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: ratio <= 20 ? '#15803d' : '#b45309' }}>
                        1 : {ratio}
                      </span>
                    </td>
                    <td>
                      <span className={`pbadge ${ratio <= 20 ? 'success' : 'warning'}`}>
                        {ratio <= 20 ? 'AICTE Compliant' : 'Recruitment In Progress'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Pending Administrative Staff Requests Queue */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Pending Staff Administrative Requests &amp; Research Grants</h3>
            <p>FDP conference travel, external Ph.D examination duties, and skill upgrades requiring Principal sanction</p>
          </div>
          <span className="pbadge warning">{pendingRequestsCount} Awaiting Decision</span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Applicant &amp; Role</th>
                <th>Department</th>
                <th>Request Type</th>
                <th>Event / Purpose</th>
                <th>Dates</th>
                <th>Sanction Amount</th>
                <th>Status</th>
                <th>Executive Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.applicantName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{req.role} · ID: {req.id}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{req.department}</td>
                  <td>
                    <span className="pbadge slate">{req.requestType}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b', maxWidth: '280px' }}>{req.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>
                      "{req.remarks}"
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#334155' }}>{req.dates}</td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      {req.amountRequested > 0 ? `₹${req.amountRequested.toLocaleString()}` : 'No Financial Implication'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`pbadge ${
                        req.status.includes('Approved')
                          ? 'success'
                          : req.status.includes('Pending')
                          ? 'warning'
                          : 'danger'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status.includes('Pending') ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="erp-btn erp-btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => setRequestModal({ req, action: 'APPROVE' })}
                        >
                          <Check size={13} /> Grant
                        </button>
                        <button
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#dc2626' }}
                          onClick={() => setRequestModal({ req, action: 'REJECT' })}
                        >
                          <X size={13} /> Decline
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Decided</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Faculty & Staff Directory (Searchable & Filterable) */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Faculty &amp; Key Staff Roster</h3>
            <p>Official directory with profiles, research credentials, and active workloads</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="principal-search-bar" style={{ minWidth: '180px' }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search staff name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="principal-select-filter"
              value={cadreFilter}
              onChange={(e) => setCadreFilter(e.target.value)}
            >
              <option value="All">All Cadres</option>
              <option value="Teaching">Teaching Faculty</option>
              <option value="Non-Teaching">Non-Teaching Staff</option>
            </select>
          </div>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Staff Name &amp; ID</th>
                <th>Role &amp; Cadre</th>
                <th>Department</th>
                <th>Qualifications</th>
                <th>Experience</th>
                <th>Attendance</th>
                <th>Research / Workload</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Code: {staff.id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{staff.role}</div>
                    <span className="pbadge slate" style={{ marginTop: 2 }}>{staff.cadre}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{staff.dept}</td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{staff.qualification}</td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>{staff.exp}</td>
                  <td>
                    <span className="pbadge success">{staff.attendance}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                      {staff.activeLoad}
                    </div>
                    {staff.publications > 0 && (
                      <div style={{ fontSize: '0.72rem', color: '#7c3aed' }}>
                        {staff.publications} Scopus Papers
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="erp-btn erp-btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => setProfileModal(staff)}
                    >
                      <Eye size={13} /> Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: STAFF PROFILE PREVIEW                             */}
      {/* ======================================================== */}
      {profileModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '580px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Faculty / Staff Dossier: {profileModal.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setProfileModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>{profileModal.name}</h3>
                    <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600, marginTop: 2 }}>
                      {profileModal.role} · Department of {profileModal.dept}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                      Employee Code: {profileModal.id} · {profileModal.cadre} Cadre
                    </div>
                  </div>
                  <span className="pbadge success">{profileModal.attendance}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Highest Qualification</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{profileModal.qualification}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Total Experience</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{profileModal.exp}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Teaching Load</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{profileModal.activeLoad}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Research Publications</small>
                  <div style={{ fontWeight: 700, color: '#7c3aed' }}>{profileModal.publications} Indexed Articles</div>
                </div>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setProfileModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM REQUEST ACTION                            */}
      {/* ======================================================== */}
      {requestModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '520px' }}>
            <div className="principal-modal-header">
              <h3 style={{ margin: 0, color: requestModal.action === 'APPROVE' ? '#0f172a' : '#dc2626' }}>
                {requestModal.action === 'APPROVE' ? 'Grant Executive Sanction' : 'Decline Staff Request'}
              </h3>
              <button
                type="button"
                onClick={() => setRequestModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: 0 }}>
                {requestModal.action === 'APPROVE'
                  ? `Granting administrative approval for ${requestModal.req.requestType} application by ${requestModal.req.applicantName}.`
                  : `Are you sure you want to decline the request submitted by ${requestModal.req.applicantName}?`}
              </p>
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div><strong>Purpose:</strong> {requestModal.req.title}</div>
                <div><strong>Dates:</strong> {requestModal.req.dates}</div>
                {requestModal.req.amountRequested > 0 && (
                  <div><strong>Financial Grant:</strong> ₹{requestModal.req.amountRequested.toLocaleString()}</div>
                )}
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setRequestModal(null)}>
                Cancel
              </button>
              <button
                className={`erp-btn ${requestModal.action === 'APPROVE' ? 'erp-btn-primary' : 'erp-btn-danger'}`}
                onClick={() => handleConfirmRequest(requestModal.action)}
              >
                {requestModal.action === 'APPROVE' ? 'Confirm Sanction' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
