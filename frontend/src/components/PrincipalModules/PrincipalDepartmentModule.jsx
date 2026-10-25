import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Award,
  GraduationCap,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  FileSpreadsheet,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FlaskConical,
  Mail,
  Phone
} from 'lucide-react';
import { INITIAL_DEPARTMENTS } from './principalData.js';
import './PrincipalModules.css';

export default function PrincipalDepartmentModule({ onToast }) {
  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_principal_departments');
      return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [accreditationFilter, setAccreditationFilter] = useState('All');

  // Modals
  const [viewDeptModal, setViewDeptModal] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [editModal, setEditModal] = useState(null); // null or { isNew: boolean, dept: {...} }

  // Save changes helper
  const persistDepartments = (updated) => {
    setDepartments(updated);
    try {
      localStorage.setItem('apna_principal_departments', JSON.stringify(updated));
    } catch (e) {
      console.warn('Local storage write failed', e);
    }
  };

  // Filtered List
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.hod.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesAccred = accreditationFilter === 'All' || d.accreditation.includes(accreditationFilter);
      return matchesSearch && matchesStatus && matchesAccred;
    });
  }, [departments, searchQuery, statusFilter, accreditationFilter]);

  // Aggregate Metrics
  const totalFaculty = departments.reduce((acc, d) => acc + (Number(d.facultyCount) || 0), 0);
  const totalStudents = departments.reduce((acc, d) => acc + (Number(d.studentCount) || 0), 0);
  const avgPassPct = (departments.reduce((acc, d) => acc + (Number(d.passPercentage) || 0), 0) / (departments.length || 1)).toFixed(1);
  const totalBudget = departments.reduce((acc, d) => acc + (Number(d.budgetAllocated) || 0), 0);

  // Form submit handler (Add / Edit)
  const handleSaveDepartment = (e) => {
    e.preventDefault();
    const form = e.target;
    const code = form.code.value.trim().toUpperCase();
    const name = form.name.value.trim();
    const hod = form.hod.value.trim();
    const hodEmail = form.hodEmail.value.trim();
    const hodPhone = form.hodPhone.value.trim();
    const facultyCount = parseInt(form.facultyCount.value, 10) || 0;
    const studentCount = parseInt(form.studentCount.value, 10) || 0;
    const status = form.status.value;
    const accreditation = form.accreditation.value.trim();
    const syllabusProgress = parseInt(form.syllabusProgress.value, 10) || 70;
    const programs = form.programs.value.trim();

    if (!code || !name || !hod) {
      if (onToast) onToast('Please complete all mandatory department fields.');
      return;
    }

    let updated;
    if (editModal.isNew) {
      if (departments.some((d) => d.code === code)) {
        if (onToast) onToast(`Department Code ${code} already exists.`);
        return;
      }
      const newDept = {
        code,
        name,
        hod,
        hodEmail: hodEmail || `${code.toLowerCase()}hod@apnacampus.edu.in`,
        hodPhone: hodPhone || '+91 94370 00000',
        facultyCount,
        studentCount,
        programs: programs || `B.Tech in ${name}`,
        status,
        accreditation: accreditation || 'Autonomous Approved',
        passPercentage: 92.0,
        avgCgpa: 8.0,
        distinctionRate: 30.0,
        backlogCount: 12,
        syllabusProgress,
        labsCount: 4,
        facultyOnDuty: facultyCount,
        budgetAllocated: 25000000,
        budgetUtilized: 18000000,
        establishedYear: new Date().getFullYear(),
      };
      updated = [newDept, ...departments];
      if (onToast) onToast(`Department of ${name} (${code}) created successfully.`);
    } else {
      updated = departments.map((d) =>
        d.code === editModal.dept.code
          ? {
              ...d,
              name,
              hod,
              hodEmail,
              hodPhone,
              facultyCount,
              studentCount,
              status,
              accreditation,
              syllabusProgress,
              programs,
            }
          : d
      );
      if (onToast) onToast(`Department of ${name} details updated.`);
    }

    persistDepartments(updated);
    setEditModal(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="principal-module-container">
      {/* Notice Banner */}
      <div className="principal-banner-notice">
        <div className="principal-banner-text">
          <Building2 size={18} color="#0284c7" />
          <span>
            <strong>Academic Council Governance:</strong> Consolidated operational and academic health across all {departments.length} autonomous departments.
          </span>
        </div>
        <div className="principal-banner-badge">Academic Year 2026–27</div>
      </div>

      {/* KPI Stat Strip */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Total Departments</span>
            <Building2 size={16} color="#0284c7" />
          </div>
          <div className="principal-stat-box-val">{departments.length}</div>
          <div className="principal-stat-box-sub">Active Academic Units</div>
        </div>
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Teaching Faculty</span>
            <GraduationCap size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val">{totalFaculty}</div>
          <div className="principal-stat-box-sub">Sanctioned &amp; Assigned Posts</div>
        </div>
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Enrolled Students</span>
            <Users size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val">{totalStudents.toLocaleString()}</div>
          <div className="principal-stat-box-sub">UG, PG &amp; Doctoral Scholars</div>
        </div>
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Institutional Pass %</span>
            <Award size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#d97706' }}>{avgPassPct}%</div>
          <div className="principal-stat-box-sub">Autumn Autonomous Cycle</div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Add Action */}
      <div className="principal-toolbar">
        <div className="principal-toolbar-left">
          <div className="principal-search-bar">
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Search department name, code, or HOD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="principal-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Operational Statuses</option>
            <option value="Active">Active</option>
            <option value="Review Needed">Review Needed</option>
          </select>

          <select
            className="principal-select-filter"
            value={accreditationFilter}
            onChange={(e) => setAccreditationFilter(e.target.value)}
          >
            <option value="All">All Accreditation Tiers</option>
            <option value="NBA">NBA Tier-1 Accredited</option>
            <option value="Autonomous">Autonomous Approved</option>
            <option value="AICTE">AICTE Approved</option>
          </select>
        </div>

        <div className="principal-toolbar-right">
          <button
            className="erp-btn erp-btn-primary"
            onClick={() =>
              setEditModal({
                isNew: true,
                dept: {
                  code: '',
                  name: '',
                  hod: '',
                  hodEmail: '',
                  hodPhone: '',
                  facultyCount: 20,
                  studentCount: 300,
                  status: 'Active',
                  accreditation: 'Autonomous Approved',
                  syllabusProgress: 75,
                  programs: 'B.Tech Program',
                },
              })
            }
          >
            <Plus size={15} /> Add Department
          </button>
        </div>
      </div>

      {/* Main Department Table */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Department Directory &amp; HOD Leadership Roster</h3>
            <p>Authorized executive roster showing faculty allocations, syllabus progress, and performance indices</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredDepartments.length} of {departments.length} departments
          </span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Code &amp; Department</th>
                <th>Head of Department (HOD)</th>
                <th>Faculty Strength</th>
                <th>Student Count</th>
                <th>Syllabus Pace</th>
                <th>Pass % &amp; CGPA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    <Building2 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No departments matched your search filter.</p>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept.code}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{dept.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '6px', marginTop: 2 }}>
                        <span style={{ fontWeight: 700, color: '#0284c7' }}>Code: {dept.code}</span>
                        <span>·</span>
                        <span>{dept.accreditation}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{dept.hod}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{dept.hodEmail}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{dept.facultyCount} Faculty</div>
                      <div style={{ fontSize: '0.74rem', color: '#15803d' }}>
                        {dept.facultyOnDuty || dept.facultyCount} On Duty Today
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{dept.studentCount}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{dept.labsCount || 4} Laboratories</div>
                    </td>
                    <td style={{ minWidth: '130px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: dept.syllabusProgress >= 70 ? '#15803d' : '#b45309' }}>
                          {dept.syllabusProgress}%
                        </span>
                      </div>
                      <div className="p-progress-track">
                        <div
                          className="p-progress-fill"
                          style={{
                            width: `${dept.syllabusProgress}%`,
                            background: dept.syllabusProgress >= 70 ? '#16a34a' : '#d97706',
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: dept.passPercentage >= 95 ? '#15803d' : '#0284c7' }}>
                        {dept.passPercentage}%
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Avg {dept.avgCgpa} CGPA</div>
                    </td>
                    <td>
                      <span className={`pbadge ${dept.status === 'Active' ? 'success' : 'warning'}`}>
                        {dept.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="View Department Profile & HOD Details"
                          onClick={() => setViewDeptModal(dept)}
                        >
                          <Eye size={13} /> Details
                        </button>
                        <button
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Department Executive Report Preview"
                          onClick={() => setReportModal(dept)}
                        >
                          <FileSpreadsheet size={13} /> Report
                        </button>
                        <button
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Edit Department Info"
                          onClick={() => setEditModal({ isNew: false, dept })}
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: VIEW DEPARTMENT PROFILE & HOD DETAILS          */}
      {/* ======================================================== */}
      {viewDeptModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '680px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Department Profile: {viewDeptModal.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewDeptModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              {/* Header Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #091326, #1e293b)',
                  color: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                    Department Code: {viewDeptModal.code} · Established {viewDeptModal.establishedYear || 2004}
                  </div>
                  <h2 style={{ margin: '4px 0 6px', fontSize: '1.25rem', color: '#ffffff' }}>
                    {viewDeptModal.name}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    {viewDeptModal.programs}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: 'rgba(56, 189, 248, 0.2)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {viewDeptModal.accreditation}
                  </span>
                </div>
              </div>

              {/* HOD Profile Section */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Head of Department (Executive Leadership)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{viewDeptModal.hod}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px', marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={13} color="#0284c7" /> {viewDeptModal.hodEmail}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={13} color="#10b981" /> {viewDeptModal.hodPhone}
                      </span>
                    </div>
                  </div>
                  <span className="pbadge success">In-Office / Active</span>
                </div>
              </div>

              {/* Department Vital Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Faculty Strength</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{viewDeptModal.facultyCount}</div>
                  <small style={{ color: '#15803d', fontSize: '0.7rem' }}>{viewDeptModal.facultyOnDuty} on duty today</small>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Student Enrollment</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{viewDeptModal.studentCount}</div>
                  <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Across 4 Semesters</small>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Laboratories</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{viewDeptModal.labsCount || 4} Units</div>
                  <small style={{ color: '#0284c7', fontSize: '0.7rem' }}>Fully equipped</small>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pass Percentage</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>{viewDeptModal.passPercentage}%</div>
                  <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Backlogs: {viewDeptModal.backlogCount || 10}</small>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Average CGPA</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>{viewDeptModal.avgCgpa}</div>
                  <small style={{ color: '#7c3aed', fontSize: '0.7rem' }}>{viewDeptModal.distinctionRate}% Distinctions</small>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Annual Budget</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{((viewDeptModal.budgetAllocated || 25000000) / 10000000).toFixed(2)} Cr
                  </div>
                  <small style={{ color: '#64748b', fontSize: '0.7rem' }}>
                    Utilized: ₹{((viewDeptModal.budgetUtilized || 18000000) / 10000000).toFixed(2)} Cr
                  </small>
                </div>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setViewDeptModal(null)}>
                Close
              </button>
              <button
                className="erp-btn erp-btn-primary"
                onClick={() => {
                  const d = viewDeptModal;
                  setViewDeptModal(null);
                  setReportModal(d);
                }}
              >
                <FileSpreadsheet size={15} /> Open Report Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DEPARTMENT EXECUTIVE REPORT PREVIEW            */}
      {/* ======================================================== */}
      {reportModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '720px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={20} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Executive Briefing: Department of {reportModal.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setReportModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>OFFICE OF THE PRINCIPAL &amp; DIRECTOR</h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>APNA CAMPUS AUTONOMOUS ENGINEERING COLLEGE</p>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>Approved by AICTE · NAAC A++ Accredited · Affiliated Institution</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                  <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</div>
                  <div><strong>Doc ID:</strong> REP-DEPT-{reportModal.code}-2026</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>1. Department Administrative Profile</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <div><strong>Department:</strong> {reportModal.name} ({reportModal.code})</div>
                  <div><strong>HOD:</strong> {reportModal.hod}</div>
                  <div><strong>Programs:</strong> {reportModal.programs}</div>
                  <div><strong>Accreditation:</strong> {reportModal.accreditation}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>2. Academic Health &amp; Evaluation Metrics</h4>
                <table className="erp-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Observed Value</th>
                      <th>Institutional Benchmark</th>
                      <th>Evaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Semester Pass Rate</td>
                      <td><strong>{reportModal.passPercentage}%</strong></td>
                      <td>&gt;= 85.0%</td>
                      <td><span className="pbadge success">Compliant</span></td>
                    </tr>
                    <tr>
                      <td>Average CGPA</td>
                      <td><strong>{reportModal.avgCgpa}</strong></td>
                      <td>&gt;= 7.50</td>
                      <td><span className="pbadge success">Distinction Cadre</span></td>
                    </tr>
                    <tr>
                      <td>Syllabus Completion Pace</td>
                      <td><strong>{reportModal.syllabusProgress}%</strong></td>
                      <td>70% Target</td>
                      <td>
                        <span className={`pbadge ${reportModal.syllabusProgress >= 70 ? 'success' : 'warning'}`}>
                          {reportModal.syllabusProgress >= 70 ? 'On Schedule' : 'Pace Lag'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Faculty-to-Student Ratio</td>
                      <td><strong>1 : {(reportModal.studentCount / (reportModal.facultyCount || 1)).toFixed(0)}</strong></td>
                      <td>1 : 20 (AICTE Norm)</td>
                      <td><span className="pbadge success">Optimal</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Certified by Office of Principal · For Academic Council &amp; Senate Record
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Dr. B. K. Sarap</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Principal &amp; Autonomous Campus Director</div>
                </div>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setReportModal(null)}>
                Close
              </button>
              <button className="erp-btn erp-btn-primary" onClick={handlePrint}>
                <Printer size={15} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD / EDIT DEPARTMENT FORM                     */}
      {/* ======================================================== */}
      {editModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '580px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>
                  {editModal.isNew ? 'Register New Academic Department' : `Edit Department: ${editModal.dept.code}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveDepartment}>
              <div className="principal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Dept Code *
                    </label>
                    <input
                      name="code"
                      type="text"
                      defaultValue={editModal.dept.code}
                      placeholder="e.g. CSE"
                      disabled={!editModal.isNew}
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: editModal.isNew ? '#ffffff' : '#f1f5f9',
                        color: '#0f172a',
                        fontWeight: 700,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Department Name *
                    </label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={editModal.dept.name}
                      placeholder="e.g. Computer Science & Engineering"
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Head of Department (HOD Name) *
                  </label>
                  <input
                    name="hod"
                    type="text"
                    defaultValue={editModal.dept.hod}
                    placeholder="e.g. Dr. P. K. Pattnaik"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      HOD Official Email
                    </label>
                    <input
                      name="hodEmail"
                      type="email"
                      defaultValue={editModal.dept.hodEmail}
                      placeholder="hod@apnacampus.edu.in"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      HOD Official Contact
                    </label>
                    <input
                      name="hodPhone"
                      type="tel"
                      defaultValue={editModal.dept.hodPhone}
                      placeholder="+91 94370 00000"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Faculty Strength
                    </label>
                    <input
                      name="facultyCount"
                      type="number"
                      min="1"
                      max="100"
                      defaultValue={editModal.dept.facultyCount}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Student Count
                    </label>
                    <input
                      name="studentCount"
                      type="number"
                      min="1"
                      max="2000"
                      defaultValue={editModal.dept.studentCount}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={editModal.dept.status}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                        background: '#ffffff',
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Review Needed">Review Needed</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Syllabus Pace (%)
                    </label>
                    <input
                      name="syllabusProgress"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editModal.dept.syllabusProgress}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Accreditation &amp; Affiliation Standing
                  </label>
                  <input
                    name="accreditation"
                    type="text"
                    defaultValue={editModal.dept.accreditation}
                    placeholder="e.g. NBA Accredited (Tier-1)"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Programs Offered
                  </label>
                  <input
                    name="programs"
                    type="text"
                    defaultValue={editModal.dept.programs}
                    placeholder="e.g. B.Tech (CSE), M.Tech (Software Engg)"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#0f172a',
                    }}
                  />
                </div>
              </div>
              <div className="principal-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setEditModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <CheckCircle2 size={15} /> Save Department Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
