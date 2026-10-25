import React, { useState, useMemo } from 'react';
import {
  FileText,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Filter,
  Search,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Layers,
  GraduationCap
} from 'lucide-react';
import { INITIAL_EXAM_SCHEDULES, INITIAL_DEPARTMENT_RESULTS } from './principalData.js';
import './PrincipalModules.css';

export default function PrincipalExamOversightModule({ onToast }) {
  const [schedules, setSchedules] = useState(INITIAL_EXAM_SCHEDULES);
  const [results, setResults] = useState(INITIAL_DEPARTMENT_RESULTS);

  // Filters
  const [academicYearFilter, setAcademicYearFilter] = useState('2026-27');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [examTypeFilter, setExamTypeFilter] = useState('All');

  // Approval Modals
  const [signOffModal, setSignOffModal] = useState(null); // null or { type: 'dept_result' | 'exam_schedule', item: any }
  const [gazetteSummaryModal, setGazetteSummaryModal] = useState(false);

  // Metrics
  const totalEnrolled = results.reduce((acc, r) => acc + (r.appeared || 0), 0);
  const totalPassed = results.reduce((acc, r) => acc + (r.passed || 0), 0);
  const overallPassPct = ((totalPassed / (totalEnrolled || 1)) * 100).toFixed(1);
  const totalBacklogs = results.reduce((acc, r) => acc + (r.backlogs || 0), 0);
  const pendingApprovalsCount =
    results.filter((r) => r.pendingApproval).length +
    schedules.filter((s) => s.approvalStatus.includes('Pending')).length;

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchDept = deptFilter === 'All' || r.deptCode === deptFilter;
      return matchDept;
    });
  }, [results, deptFilter]);

  // Filtered Schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchType = examTypeFilter === 'All' || s.examType === examTypeFilter;
      return matchType;
    });
  }, [schedules, examTypeFilter]);

  // Executive Sign-off handler
  const handleConfirmSignOff = () => {
    if (!signOffModal) return;

    if (signOffModal.type === 'dept_result') {
      const targetCode = signOffModal.item.deptCode;
      setResults((prev) =>
        prev.map((r) =>
          r.deptCode === targetCode
            ? {
                ...r,
                resultStatus: 'Approved & Gazette Published',
                approvalDate: new Date().toLocaleDateString('en-GB'),
                pendingApproval: false,
              }
            : r
        )
      );
      if (onToast) {
        onToast(`Official Gazette signed and published for ${signOffModal.item.deptName}!`);
      }
    } else if (signOffModal.type === 'exam_schedule') {
      const targetId = signOffModal.item.id;
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === targetId
            ? {
                ...s,
                approvalStatus: 'Approved by Principal',
              }
            : s
        )
      );
      if (onToast) {
        onToast(`Examination schedule ${signOffModal.item.id} ratified with Principal seal!`);
      }
    }
    setSignOffModal(null);
  };

  return (
    <div className="principal-module-container">
      {/* Strategic Notice */}
      <div className="principal-banner-notice">
        <div className="principal-banner-text">
          <ShieldCheck size={18} color="#0284c7" />
          <span>
            <strong>Autonomous Examination Cell Oversight:</strong> Consolidated evaluation schedules, moderation reports, and official Principal gazette clearance authority.
          </span>
        </div>
        <div className="principal-banner-badge">Autonomous Session 2026–27</div>
      </div>

      {/* KPI Stat Strip */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Candidates Enrolled</span>
            <GraduationCap size={16} color="#0284c7" />
          </div>
          <div className="principal-stat-box-val">{totalEnrolled.toLocaleString()}</div>
          <div className="principal-stat-box-sub">Across 8 Engineering &amp; PG Branches</div>
        </div>
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Overall Clearance %</span>
            <Award size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>{overallPassPct}%</div>
          <div className="principal-stat-box-sub">{totalPassed.toLocaleString()} Passed · {totalBacklogs} Backlogs</div>
        </div>
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Upcoming Exam Schedules</span>
            <CalendarCheck size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val">{schedules.length} Sessions</div>
          <div className="principal-stat-box-sub">End-Sem, Mid-Term &amp; Supplementary</div>
        </div>
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Pending Executive Sign-offs</span>
            <AlertTriangle size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val" style={{ color: pendingApprovalsCount > 0 ? '#d97706' : '#15803d' }}>
            {pendingApprovalsCount} Pending
          </div>
          <div className="principal-stat-box-sub">Awaiting Principal Authorization</div>
        </div>
      </div>

      {/* Toolbar: Filters & Quick Actions */}
      <div className="principal-toolbar">
        <div className="principal-toolbar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
            <Filter size={15} /> Scope:
          </div>
          <select
            className="principal-select-filter"
            value={academicYearFilter}
            onChange={(e) => setAcademicYearFilter(e.target.value)}
          >
            <option value="2026-27">Academic Year: 2026–27</option>
            <option value="2025-26">Academic Year: 2025–26</option>
          </select>

          <select
            className="principal-select-filter"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="AIML">AI &amp; Machine Learning (AIML)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="EEE">Electrical (EEE)</option>
            <option value="MECH">Mechanical (MECH)</option>
            <option value="CIVIL">Civil (CIVIL)</option>
            <option value="MBA">Management Studies (MBA)</option>
          </select>

          <select
            className="principal-select-filter"
            value={examTypeFilter}
            onChange={(e) => setExamTypeFilter(e.target.value)}
          >
            <option value="All">All Examination Types</option>
            <option value="End-Semester">End-Semester Autonomous</option>
            <option value="Mid-Term">Continuous Evaluation (CIE-2)</option>
            <option value="Supplementary">Supplementary Clearance</option>
          </select>
        </div>

        <div className="principal-toolbar-right">
          <button className="erp-btn erp-btn-secondary" onClick={() => setGazetteSummaryModal(true)}>
            <FileSpreadsheet size={15} /> Gazette Summary Roster
          </button>
        </div>
      </div>

      {/* SECTION 1: Department-wise Result Publication & Executive Sign-off */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Department Result Publication &amp; Gazette Clearance</h3>
            <p>Consolidated pass rates, distinction indices, and pending Principal executive stamps</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            {results.filter((r) => !r.pendingApproval).length} of {results.length} Gazettes Released
          </span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Enrolled / Appeared</th>
                <th>Passed</th>
                <th>Pass Rate (%)</th>
                <th>Avg CGPA</th>
                <th>Distinctions</th>
                <th>Backlogs</th>
                <th>Gazette Status</th>
                <th>Principal Oversight Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((res) => (
                <tr key={res.deptCode}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{res.deptName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Branch Code: {res.deptCode}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{res.appeared}</td>
                  <td style={{ fontWeight: 700, color: '#15803d' }}>{res.passed}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: res.passPercentage >= 95 ? '#15803d' : res.passPercentage >= 90 ? '#0284c7' : '#b45309',
                        }}
                      >
                        {res.passPercentage}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#7c3aed' }}>{res.avgCgpa}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{res.distinctionCount} Scholars</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: res.backlogs > 20 ? '#dc2626' : '#64748b' }}>
                      {res.backlogs}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`pbadge ${
                        res.pendingApproval
                          ? 'warning'
                          : res.resultStatus.includes('Published')
                          ? 'success'
                          : 'info'
                      }`}
                    >
                      {res.resultStatus}
                    </span>
                    {res.approvalDate && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                        Signed: {res.approvalDate}
                      </div>
                    )}
                  </td>
                  <td>
                    {res.pendingApproval ? (
                      <button
                        className="erp-btn erp-btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        onClick={() => setSignOffModal({ type: 'dept_result', item: res })}
                      >
                        <CheckCircle2 size={14} /> Sign Gazette
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> Authorized
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Upcoming Examinations & Schedules */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Autonomous Examination Schedules &amp; Hall Allocations</h3>
            <p>Seating arrangements, question paper vault security, and examination board ratifications</p>
          </div>
          <span className="pbadge info">Autumn 2026–27 Schedule</span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Exam Session &amp; Title</th>
                <th>Type</th>
                <th>Commencing Date</th>
                <th>Candidates</th>
                <th>Courses</th>
                <th>Seating &amp; Halls</th>
                <th>Moderation / Vault</th>
                <th>Approval Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((sch) => (
                <tr key={sch.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{sch.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Session: {sch.session} · ID: {sch.id}</div>
                  </td>
                  <td>
                    <span className="pbadge slate">{sch.examType}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{sch.commencingDate}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>to {sch.endDate}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{sch.candidatesEnrolled}</td>
                  <td>{sch.totalCourses} Papers</td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{sch.seatingPlanStatus}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{sch.centresAllotted} Exam Halls</div>
                  </td>
                  <td>
                    <span className="pbadge success">{sch.moderationStatus}</span>
                  </td>
                  <td>
                    <span
                      className={`pbadge ${
                        sch.approvalStatus.includes('Approved')
                          ? 'success'
                          : sch.approvalStatus.includes('Pending')
                          ? 'warning'
                          : 'info'
                      }`}
                    >
                      {sch.approvalStatus}
                    </span>
                  </td>
                  <td>
                    {sch.approvalStatus.includes('Pending') ? (
                      <button
                        className="erp-btn erp-btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => setSignOffModal({ type: 'exam_schedule', item: sch })}
                      >
                        <ShieldCheck size={13} /> Ratify Schedule
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ratified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CONFIRM PRINCIPAL SIGN-OFF                      */}
      {/* ======================================================== */}
      {signOffModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '600px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Executive Authorization &amp; Gazette Clearance</h3>
              </div>
              <button
                type="button"
                onClick={() => setSignOffModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#334155',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '0.92rem' }}>
                  Autonomous Academic Senate Declaration:
                </div>
                {signOffModal.type === 'dept_result' ? (
                  <>
                    <p style={{ margin: '0 0 0.5rem' }}>
                      I, <strong>Dr. B. K. Sarap</strong> (Principal &amp; Director), hereby confirm that the continuous internal assessments, laboratory evaluations, and end-semester tabulations for the <strong>Department of {signOffModal.item.deptName}</strong> ({signOffModal.item.deptCode}) have undergone autonomous moderation scrutiny.
                    </p>
                    <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div><strong>Appeared:</strong> {signOffModal.item.appeared} Candidates</div>
                      <div><strong>Passed:</strong> {signOffModal.item.passed} ({signOffModal.item.passPercentage}%)</div>
                      <div><strong>Distinctions:</strong> {signOffModal.item.distinctionCount}</div>
                      <div><strong>Backlogs:</strong> {signOffModal.item.backlogs}</div>
                    </div>
                  </>
                ) : (
                  <p style={{ margin: 0 }}>
                    Ratifying statutory schedule for <strong>{signOffModal.item.title}</strong> across {signOffModal.item.centresAllotted} examination halls.
                  </p>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                This approval officially updates the student records ledger, unlocks the online student portal gazette, and issues digital marksheets.
              </p>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setSignOffModal(null)}>
                Cancel
              </button>
              <button className="erp-btn erp-btn-primary" onClick={handleConfirmSignOff}>
                <CheckCircle2 size={15} /> Yes, Authorize &amp; Sign Gazette
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: GAZETTE SUMMARY ROSTER PREVIEW                   */}
      {/* ======================================================== */}
      {gazetteSummaryModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '750px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={20} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Autumn 2026 Autonomous Gazette Ledger</h3>
              </div>
              <button
                type="button"
                onClick={() => setGazetteSummaryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0f172a' }}>OFFICE OF CONTROLLER OF EXAMINATIONS</h4>
                  <small style={{ color: '#64748b' }}>Executive Gazette Clearance Ledger · Signed by Principal</small>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                  Date: {new Date().toLocaleDateString('en-GB')}
                </div>
              </div>

              <table className="erp-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Appeared</th>
                    <th>Passed</th>
                    <th>Pass %</th>
                    <th>Avg CGPA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.deptCode}>
                      <td><strong>{r.deptCode}</strong> — {r.deptName}</td>
                      <td>{r.appeared}</td>
                      <td style={{ color: '#15803d', fontWeight: 600 }}>{r.passed}</td>
                      <td><strong>{r.passPercentage}%</strong></td>
                      <td>{r.avgCgpa}</td>
                      <td>
                        <span className={`pbadge ${r.pendingApproval ? 'warning' : 'success'}`}>
                          {r.pendingApproval ? 'Pending Stamp' : 'Published'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setGazetteSummaryModal(false)}>
                Close
              </button>
              <button className="erp-btn erp-btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
