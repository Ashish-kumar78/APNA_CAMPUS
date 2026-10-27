import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  X,
  Check,
  Send,
  Building2,
  Calendar,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export default function ApplicantRegistryTab({
  applicants = [],
  courses = [],
  onOpenRegisterModal,
  onVerify,
  onApproveAndEnroll,
  onReject,
  onUpdateApplicant,
  onAddReviewNote,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [docFilter, setDocFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [roundFilter, setRoundFilter] = useState('All');

  // Sorting
  const [sortField, setSortField] = useState('serialNo');
  const [sortOrder, setSortOrder] = useState('asc');

  // Selected applicant for detailed flyout panel
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState('overview');

  // Edit applicant modal state
  const [editingApplicant, setEditingApplicant] = useState(null);

  // New review note text in details panel
  const [newNoteText, setNewNoteText] = useState('');

  // Filtering logic
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          app.name?.toLowerCase().includes(q) ||
          app.applicationNo?.toLowerCase().includes(q) ||
          app.email?.toLowerCase().includes(q) ||
          app.phone?.includes(q) ||
          app.appliedCourse?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Session
      if (sessionFilter !== 'All' && app.academicSession !== sessionFilter) return false;

      // Course
      if (courseFilter !== 'All' && app.appliedCourse !== courseFilter && app.courseCode !== courseFilter) return false;

      // Status
      if (statusFilter !== 'All' && app.admissionStatus !== statusFilter) return false;

      // Doc Verification
      if (docFilter !== 'All' && app.docVerificationStatus !== docFilter) return false;

      // Eligibility
      if (eligibilityFilter !== 'All' && app.eligibilityStatus !== eligibilityFilter) return false;

      // Round
      if (roundFilter !== 'All' && app.admissionRound !== roundFilter) return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    applicants,
    searchQuery,
    sessionFilter,
    courseFilter,
    statusFilter,
    docFilter,
    eligibilityFilter,
    roundFilter,
    sortField,
    sortOrder,
  ]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingApplicant) return;
    onUpdateApplicant && onUpdateApplicant(editingApplicant.id, editingApplicant);
    if (selectedApplicant?.id === editingApplicant.id) {
      setSelectedApplicant({ ...selectedApplicant, ...editingApplicant });
    }
    setEditingApplicant(null);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedApplicant) return;
    onAddReviewNote && onAddReviewNote(selectedApplicant.id, 'Ms. Sasmita Mohapatra', newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Applicant Master Registry
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Central register of prospective student profiles, eligibility scrutiny, submitted certificates, and review records.
          </p>
        </div>
        <button
          type="button"
          className="adm-btn-primary"
          onClick={onOpenRegisterModal}
        >
          <Plus size={16} /> Register New Institutional Applicant
        </button>
      </div>

      {/* Search & Filters Panel */}
      <div className="adm-filter-bar">
        {/* Search */}
        <div className="adm-search-input-wrap">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            className="adm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, application ID, email, phone, course..."
          />
        </div>

        {/* Filters */}
        <div className="adm-filter-group">
          {/* Academic Session */}
          <select
            className="adm-select-control"
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
          >
            <option value="All">All Sessions</option>
            <option value="2026-2027">2026-2027</option>
            <option value="2025-2026">2025-2026</option>
          </select>

          {/* Course */}
          <select
            className="adm-select-control"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="All">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.code}
              </option>
            ))}
          </select>

          {/* Admission Status */}
          <select
            className="adm-select-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Admission Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Documents Pending">Documents Pending</option>
            <option value="Verified">Verified</option>
            <option value="Eligible">Eligible</option>
            <option value="Selected">Selected</option>
            <option value="Offer Accepted">Offer Accepted</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Doc Status */}
          <select
            className="adm-select-control"
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
          >
            <option value="All">All Doc Status</option>
            <option value="Verified">Docs Verified</option>
            <option value="Pending">Docs Pending</option>
            <option value="Resubmission Required">Resubmission Required</option>
            <option value="Rejected">Docs Rejected</option>
          </select>

          {/* Eligibility */}
          <select
            className="adm-select-control"
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
          >
            <option value="All">All Eligibility</option>
            <option value="Eligible">Eligible</option>
            <option value="Conditional">Conditional</option>
            <option value="Under Review">Under Review</option>
            <option value="Ineligible">Ineligible</option>
          </select>

          {/* Round */}
          <select
            className="adm-select-control"
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
          >
            <option value="All">All Rounds</option>
            <option value="Round 1">Round 1</option>
            <option value="Round 2">Round 2</option>
            <option value="Spot Round">Spot Round</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
              Showing {filteredApplicants.length} of {applicants.length} Records
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Sorted by: <strong>{sortField}</strong> ({sortOrder})
          </span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('serialNo')} style={{ cursor: 'pointer' }}>
                  S.No <ArrowUpDown size={12} />
                </th>
                <th onClick={() => toggleSort('applicationNo')} style={{ cursor: 'pointer' }}>
                  Application ID <ArrowUpDown size={12} />
                </th>
                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                  Applicant Name &amp; Contact <ArrowUpDown size={12} />
                </th>
                <th>Applied Course</th>
                <th>Session</th>
                <th>Submitted</th>
                <th>Eligibility</th>
                <th>Doc Scrutiny</th>
                <th>Admission Status</th>
                <th>Assigned Staff</th>
                <th style={{ textAlign: 'right' }}>Available Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No applicant records match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app, index) => {
                  const statusKey = (app.admissionStatus || 'Applied').toLowerCase().replace(/\s+/g, '_');
                  const docKey = (app.docVerificationStatus || 'Pending').toLowerCase().replace(/\s+/g, '_');

                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600, color: '#64748b' }}>
                        {app.serialNo || index + 1}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                        {app.applicationNo}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {app.email} · {app.phone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{app.appliedCourse}</div>
                        <div style={{ fontSize: '0.71rem', color: '#64748b' }}>
                          {app.entranceExam ? `${app.entranceExam} (Rank: ${app.entranceRank || 'N/A'})` : 'Merit'}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                        {app.academicSession}
                      </td>
                      <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                        {app.submissionDate}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background:
                              app.eligibilityStatus === 'Eligible'
                                ? '#ecfdf5'
                                : app.eligibilityStatus === 'Ineligible'
                                ? '#fef2f2'
                                : '#fef3c7',
                            color:
                              app.eligibilityStatus === 'Eligible'
                                ? '#047857'
                                : app.eligibilityStatus === 'Ineligible'
                                ? '#b91c1c'
                                : '#b45309',
                          }}
                        >
                          {app.eligibilityStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-status-tag ${docKey}`}>
                          {app.docVerificationStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-status-tag ${statusKey}`}>
                          {app.admissionStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#475569' }}>
                        {app.assignedStaff || 'Unassigned'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {/* View Details Button */}
                          <button
                            type="button"
                            className="adm-btn-secondary"
                            onClick={() => {
                              setSelectedApplicant(app);
                              setActiveDrawerTab('overview');
                            }}
                            title="Open Full Applicant Dossier"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          >
                            <Eye size={13} /> View
                          </button>

                          {/* Quick Edit Button */}
                          <button
                            type="button"
                            className="adm-btn-secondary"
                            onClick={() => setEditingApplicant(app)}
                            title="Edit Applicant Details"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          >
                            <Edit size={13} /> Edit
                          </button>

                          {/* Verify Button (if applied or pending) */}
                          {(app.admissionStatus === 'Applied' || app.admissionStatus === 'Under Review') && (
                            <button
                              type="button"
                              className="adm-btn-success"
                              onClick={() => onVerify && onVerify(app.id, app.name)}
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            >
                              Verify
                            </button>
                          )}

                          {/* Approve & Enroll Button */}
                          {(app.admissionStatus === 'Verified' || app.admissionStatus === 'Selected' || app.admissionStatus === 'Offer Accepted') && (
                            <button
                              type="button"
                              className="adm-btn-primary"
                              onClick={() => onApproveAndEnroll && onApproveAndEnroll(app.id)}
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            >
                              Enroll
                            </button>
                          )}

                          {/* Reject Button */}
                          {app.admissionStatus !== 'Enrolled' && app.admissionStatus !== 'Rejected' && (
                            <button
                              type="button"
                              className="adm-btn-danger"
                              onClick={() => onReject && onReject(app.id, app.name)}
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICANT DETAILS FLYOUT / DRAWER MODAL */}
      {selectedApplicant && (
        <div className="adm-modal-backdrop" onClick={() => setSelectedApplicant(null)}>
          <div
            className="adm-modal-card"
            style={{ maxWidth: '840px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="adm-modal-header" style={{ background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="adm-officer-avatar" style={{ width: '42px', height: '42px', fontSize: '1rem' }}>
                  {selectedApplicant.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    {selectedApplicant.name}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    {selectedApplicant.applicationNo} · {selectedApplicant.appliedCourse} · {selectedApplicant.academicSession}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab navigation inside flyout */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 20px' }}>
              {[
                { id: 'overview', label: 'Candidate Profile' },
                { id: 'academics', label: 'Academic Qualifications' },
                { id: 'documents', label: `Documents (${selectedApplicant.documents?.length || 0})` },
                { id: 'notes', label: 'Staff Review Notes' },
                { id: 'history', label: 'Status History' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDrawerTab(tab.id)}
                  style={{
                    padding: '12px 14px',
                    fontSize: '0.8rem',
                    fontWeight: activeDrawerTab === tab.id ? 700 : 500,
                    color: activeDrawerTab === tab.id ? '#0284c7' : '#64748b',
                    borderBottom: activeDrawerTab === tab.id ? '2px solid #0284c7' : 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="adm-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {/* TAB 1: OVERVIEW & PROFILE */}
              {activeDrawerTab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Legal Name</span>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '2px' }}>{selectedApplicant.name}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Email Address</span>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', marginTop: '2px' }}>{selectedApplicant.email}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Phone Contact</span>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', marginTop: '2px' }}>{selectedApplicant.phone}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Category &amp; Gender</span>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', marginTop: '2px' }}>
                        {selectedApplicant.category} · {selectedApplicant.gender}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Date of Birth</span>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', marginTop: '2px' }}>{selectedApplicant.dob || '2005-08-15'}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Domicile Status</span>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', marginTop: '2px', color: '#0284c7' }}>
                        {selectedApplicant.domicile || 'Odisha Home State'}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Permanent Address</span>
                    <div style={{ fontSize: '0.84rem', marginTop: '4px', color: '#334155' }}>
                      {selectedApplicant.address || 'Address provided on application dossier'}
                    </div>
                  </div>

                  <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
                          Current Workflow Stage
                        </span>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0c4a6e', marginTop: '2px' }}>
                          {selectedApplicant.admissionStatus} (Round: {selectedApplicant.admissionRound})
                        </div>
                      </div>
                      <span className="adm-status-tag" style={{ background: '#ffffff', color: '#0284c7', fontWeight: 800 }}>
                        Assigned: {selectedApplicant.assignedStaff || 'Directorate Desk'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMICS & PREFERENCES */}
              {activeDrawerTab === 'academics' && (
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 700 }}>Academic Examination Scores</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Class 10th Board &amp; Marks</span>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginTop: '2px' }}>
                        {selectedApplicant.tenthMarks || '88.5'}%
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{selectedApplicant.tenthBoard || 'BSE Odisha'}</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Class 12th Board &amp; Aggregate</span>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginTop: '2px' }}>
                        {selectedApplicant.twelfthMarks || '86.0'}%
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{selectedApplicant.twelfthBoard || 'CHSE Odisha'} (PCM Stream)</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Qualifying Entrance Exam</span>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0284c7', marginTop: '2px' }}>
                        {selectedApplicant.entranceExam || 'JEE Main 2026'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Rank: <strong>{selectedApplicant.entranceRank || 'Merit'}</strong> ({selectedApplicant.percentile || '92.4%ile'})
                      </div>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 700 }}>Candidate Course Preferences</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(selectedApplicant.coursePreferences || [{ pref: 1, course: selectedApplicant.appliedCourse }]).map((pref, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: i === 0 ? '#0284c7' : '#94a3b8',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {pref.pref || i + 1}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>{pref.course}</span>
                        {i === 0 && (
                          <span className="adm-badge-pill green" style={{ marginLeft: 'auto' }}>
                            Primary Choice (Allotted)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DOCUMENTS */}
              {activeDrawerTab === 'documents' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700 }}>Submitted Document Scrutiny Register</h4>
                    <span className="adm-badge-pill dark">
                      Overall: {selectedApplicant.docVerificationStatus}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedApplicant.documents || []).map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                            {doc.category}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                            File: <code style={{ color: '#0284c7' }}>{doc.filename}</code> · Uploaded: {doc.uploadDate}
                          </div>
                          {doc.remarks && (
                            <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '3px', fontStyle: 'italic' }}>
                              Scrutiny Note: {doc.remarks}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            className={`adm-status-tag ${
                              doc.status === 'Verified'
                                ? 'verified'
                                : doc.status === 'Rejected'
                                ? 'rejected'
                                : 'documents_pending'
                            }`}
                          >
                            {doc.status}
                          </span>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                            Verifier: {doc.verifier}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: STAFF REVIEW NOTES */}
              {activeDrawerTab === 'notes' && (
                <div>
                  <form onSubmit={handleAddNote} style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                      Add Official Admission Review Note
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Type observation, prerequisite check, or verification remark..."
                        className="adm-search-input"
                        style={{ paddingLeft: '14px' }}
                      />
                      <button type="submit" className="adm-btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        <Send size={14} /> Record Note
                      </button>
                    </div>
                  </form>

                  <h4 style={{ margin: '0 0 10px', fontSize: '0.84rem', fontWeight: 700 }}>Recorded Notes History</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(selectedApplicant.staffReviewNotes || []).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No notes recorded for this applicant yet.</p>
                    ) : (
                      (selectedApplicant.staffReviewNotes || []).map((note) => (
                        <div
                          key={note.id}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                            <span style={{ fontWeight: 700, color: '#334155' }}>{note.author}</span>
                            <span>{note.date}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#0f172a' }}>
                            {note.note}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: STATUS HISTORY */}
              {activeDrawerTab === 'history' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.88rem', fontWeight: 700 }}>
                    Admission Progression Audit Trail
                  </h4>
                  <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '8px',
                        bottom: '8px',
                        width: '2px',
                        background: '#e2e8f0',
                      }}
                    />
                    {(selectedApplicant.statusHistory || []).map((step, idx) => (
                      <div key={idx} style={{ position: 'relative', marginBottom: '16px' }}>
                        <div
                          style={{
                            position: 'absolute',
                            left: '-20px',
                            top: '4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: idx === 0 ? '#0284c7' : '#94a3b8',
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                            {step.status}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{step.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                          Action by: <strong>{step.updatedBy}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setSelectedApplicant(null)}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EDIT APPLICANT MODAL */}
      {editingApplicant && (
        <div className="adm-modal-backdrop" onClick={() => setEditingApplicant(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Edit Applicant Information · {editingApplicant.applicationNo}
              </h3>
              <button
                type="button"
                onClick={() => setEditingApplicant(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="adm-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Candidate Legal Name *
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingApplicant.name || ''}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingApplicant.email || ''}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Phone Contact *
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingApplicant.phone || ''}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Target Course
                    </label>
                    <select
                      className="adm-select-control"
                      style={{ width: '100%' }}
                      value={editingApplicant.appliedCourse || ''}
                      onChange={(e) => {
                        const selCourse = courses.find((c) => c.name === e.target.value);
                        setEditingApplicant({
                          ...editingApplicant,
                          appliedCourse: e.target.value,
                          courseCode: selCourse?.code || editingApplicant.courseCode,
                        });
                      }}
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Admission Status
                    </label>
                    <select
                      className="adm-select-control"
                      style={{ width: '100%' }}
                      value={editingApplicant.admissionStatus || 'Applied'}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, admissionStatus: e.target.value })}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Documents Pending">Documents Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Eligible">Eligible</option>
                      <option value="Selected">Selected</option>
                      <option value="Offer Accepted">Offer Accepted</option>
                      <option value="Enrolled">Enrolled</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      10th Marks (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingApplicant.tenthMarks || ''}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, tenthMarks: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      12th Marks (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingApplicant.twelfthMarks || ''}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, twelfthMarks: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Entrance Rank
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingApplicant.entranceRank || ''}
                      onChange={(e) => setEditingApplicant({ ...editingApplicant, entranceRank: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setEditingApplicant(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
