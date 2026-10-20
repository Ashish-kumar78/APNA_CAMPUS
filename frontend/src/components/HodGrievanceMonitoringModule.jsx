import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertCircle, CheckCircle2, Clock,
  Search, Filter, ChevronRight, X, Send, Eye, FileSpreadsheet,
  MessageSquare, UserX, AlertTriangle, ArrowUpRight, TrendingUp,
  BarChart2, Users, Download, HelpCircle, Check, BookOpen
} from 'lucide-react';
import { complaintsApi } from '../services/complaintsApi';
import './HodGrievanceMonitoringModule.css';
import './FacultyComplaintsModule.css';

export default function HodGrievanceMonitoringModule({ account }) {
  const deptCode = account?.deptCode || 'CSE';
  const hodName = account?.name || 'Dr. P. K. Pattnaik (HOD)';

  const [activeSubTab, setActiveSubTab] = useState('queue'); // 'queue' | 'analytics'
  const [complaints, setComplaints] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    facultyName: 'ALL',
    category: 'ALL',
    subjectCode: 'ALL',
    semester: 'ALL',
    section: 'ALL',
    status: 'ALL',
    isOverdue: false,
    search: ''
  });

  // HOD Evaluation Form State
  const [evalOutcome, setEvalOutcome] = useState('Adequate');
  const [evalObservations, setEvalObservations] = useState('');
  const [isAdequate, setIsAdequate] = useState('yes'); // 'yes' | 'clarification' | 'corrective' | 'escalate'
  const [submittingEval, setSubmittingEval] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [list, analytics] = await Promise.all([
        complaintsApi.getHodComplaints(filters),
        complaintsApi.getHodAnalytics(deptCode)
      ]);
      setComplaints(list);
      setAnalyticsData(analytics);
    } catch (e) {
      console.warn('Failed to load HOD complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const handleUpdate = () => loadAll();
    window.addEventListener('apna_campus_complaints_updated', handleUpdate);
    return () => window.removeEventListener('apna_campus_complaints_updated', handleUpdate);
  }, [filters, deptCode]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = complaints.length;
    const awaitingFaculty = complaints.filter(c => c.status === 'NEW' || c.status === 'UNDER_REVIEW').length;
    const awaitingHod = complaints.filter(c => c.status === 'RESPONSE_SUBMITTED' || c.status === 'AWAITING_HOD_REVIEW').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
    const escalated = complaints.filter(c => c.status === 'ESCALATED' || c.isOverdue).length;

    return { total, awaitingFaculty, awaitingHod, resolved, escalated };
  }, [complaints]);

  const handleOpenEval = (complaint) => {
    setSelectedComplaint(complaint);
    setEvalObservations('');
    if (complaint.status === 'RESPONSE_SUBMITTED' || complaint.status === 'AWAITING_HOD_REVIEW') {
      setEvalOutcome('Adequate');
      setIsAdequate('yes');
    } else if (complaint.status === 'ESCALATED' || complaint.isOverdue) {
      setEvalOutcome('Escalated');
      setIsAdequate('escalate');
    } else {
      setEvalOutcome('Clarification Requested');
      setIsAdequate('clarification');
    }
  };

  const handleCloseModal = () => {
    setSelectedComplaint(null);
    setEvalObservations('');
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!evalObservations.trim()) {
      alert('Please record your HOD assessment observations.');
      return;
    }

    try {
      setSubmittingEval(true);

      const reviewPayload = {
        reviewOutcome: evalOutcome,
        observations: evalObservations.trim(),
        isResponseAdequate: isAdequate === 'yes',
        requiresClarification: isAdequate === 'clarification',
        requiresCorrectiveAction: isAdequate === 'corrective',
        isEscalated: isAdequate === 'escalate',
        escalationReason: isAdequate === 'escalate' ? evalObservations.trim() : null,
        finalReviewStatus: evalOutcome === 'Adequate' ? 'Reviewed & Resolved' : `Reviewed - ${evalOutcome}`
      };

      await complaintsApi.reviewHodComplaint(selectedComplaint.id, reviewPayload, hodName);

      showToast(`HOD evaluation and review decision recorded for ${selectedComplaint.trackingId}.`);
      handleCloseModal();
      loadAll();
    } catch (err) {
      alert(err.message || 'Failed to submit evaluation.');
    } finally {
      setSubmittingEval(false);
    }
  };

  const exportDepartmentReport = () => {
    if (!complaints.length) return;
    const header = ['Tracking ID', 'Category', 'Faculty Member', 'Subject Title', 'Cohort', 'Course Code', 'Current Status', 'Submitted Date', 'Faculty Response Status'];
    const rows = complaints.map(c => [
      c.trackingId,
      c.category,
      `"${c.facultyName}"`,
      `"${(c.subject || '').replace(/"/g, '""')}"`,
      `${c.semester} (${c.section})`,
      c.subjectCode || 'N/A',
      c.status,
      new Date(c.submittedAt).toLocaleDateString('en-IN'),
      (c.responses && c.responses.length > 0) ? 'Responded' : 'Pending Response'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Department_Grievance_Report_${deptCode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCategory = (cat) => {
    switch (cat) {
      case 'TEACHING_RELATED': return 'Teaching & Pedagogy';
      case 'FACULTY_BEHAVIOR': return 'Behavior & Conduct';
      case 'COURSE_MATERIAL': return 'Course Syllabus';
      case 'MARKS_AND_ASSESSMENTS': return 'Marks & Assessments';
      case 'CLASSROOM_ENVIRONMENT': return 'Facilities & Lab';
      default: return cat?.replace(/_/g, ' ') || 'Academic';
    }
  };

  return (
    <div className="hod-grievance-container">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{ background: '#0f766e', color: '#fff', padding: '10px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* Header Area */}
      <div className="hod-grievance-header">
        <div className="hod-grievance-title-area">
          <h2>
            <ShieldAlert size={24} color="#0f766e" /> Department Grievance Monitoring &amp; Complaint Management
          </h2>
          <p>
            Comprehensive academic governance portal for Head of Department. Review grievances concerning department faculty, evaluate proposed corrective actions, and track departmental academic trends.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sub-tab view switcher */}
          <div className="hod-view-mode-tabs">
            <button
              type="button"
              className={`hod-view-mode-btn ${activeSubTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('queue')}
            >
              <MessageSquare size={15} /> Review Queue ({complaints.length})
            </button>
            <button
              type="button"
              className={`hod-view-mode-btn ${activeSubTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('analytics')}
            >
              <BarChart2 size={15} /> Department Analytics
            </button>
          </div>

          <button
            type="button"
            className="admin-action-btn-secondary"
            onClick={exportDepartmentReport}
            style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Download size={14} /> Export Report (CSV)
          </button>
        </div>
      </div>

      {/* Fairness Advisory Callout */}
      <div className="hod-fairness-callout">
        <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Statutory Governance &amp; Fairness Guidelines:</strong> Student grievances are allegations recorded for academic quality refinement, course pacing alignment, and supportive resolution. Faculty members are not automatically penalized or ranked based solely on grievance numbers without formal departmental enquiry and pedagogical context.
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 1: REVIEW QUEUE
      ========================================================================= */}
      {activeSubTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary KPI Cards Grid */}
          <div className="fac-complaints-kpi-grid">
            <div className="fac-kpi-card" onClick={() => setFilters({ ...filters, status: 'ALL' })}>
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Department Total</span>
                <div className="fac-kpi-icon-wrap blue"><MessageSquare size={18} /></div>
              </div>
              <div className="fac-kpi-val">{kpis.total}</div>
              <div className="fac-kpi-sub">Registered across {deptCode} Department</div>
            </div>

            <div className="fac-kpi-card" onClick={() => setFilters({ ...filters, status: 'RESPONSE_SUBMITTED' })}>
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Awaiting HOD Review</span>
                <div className="fac-kpi-icon-wrap amber"><Clock size={18} /></div>
              </div>
              <div className="fac-kpi-val" style={{ color: '#d97706' }}>{kpis.awaitingHod}</div>
              <div className="fac-kpi-sub">Faculty Responded · Action Needed</div>
            </div>

            <div className="fac-kpi-card" onClick={() => setFilters({ ...filters, status: 'NEW' })}>
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Awaiting Faculty</span>
                <div className="fac-kpi-icon-wrap indigo"><Users size={18} /></div>
              </div>
              <div className="fac-kpi-val" style={{ color: '#4f46e5' }}>{kpis.awaitingFaculty}</div>
              <div className="fac-kpi-sub">Pending Initial Faculty Review</div>
            </div>

            <div className="fac-kpi-card" onClick={() => setFilters({ ...filters, status: 'RESOLVED' })}>
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Resolved &amp; Closed</span>
                <div className="fac-kpi-icon-wrap emerald"><CheckCircle2 size={18} /></div>
              </div>
              <div className="fac-kpi-val" style={{ color: '#059669' }}>{kpis.resolved}</div>
              <div className="fac-kpi-sub">HOD Evaluated &amp; Cleared</div>
            </div>

            <div className="fac-kpi-card" onClick={() => setFilters({ ...filters, isOverdue: true })}>
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Overdue / Escalated</span>
                <div className="fac-kpi-icon-wrap purple"><AlertTriangle size={18} /></div>
              </div>
              <div className="fac-kpi-val" style={{ color: '#b91c1c' }}>{kpis.escalated}</div>
              <div className="fac-kpi-sub">&gt; 7 Days Turnaround Alert</div>
            </div>
          </div>

          {/* Multi-Criteria Filter Panel */}
          <div className="hod-filter-panel">
            <div className="hod-filter-field">
              <label>Concerned Faculty</label>
              <select
                value={filters.facultyName}
                onChange={(e) => setFilters({ ...filters, facultyName: e.target.value })}
              >
                <option value="ALL">All Faculty Members</option>
                <option value="Dr. S. Mohanty">Dr. S. Mohanty</option>
                <option value="Prof. R. K. Sahoo">Prof. R. K. Sahoo</option>
                <option value="Prof. S. K. Swain">Prof. S. K. Swain</option>
                <option value="Prof. B. Panda">Prof. B. Panda</option>
              </select>
            </div>

            <div className="hod-filter-field">
              <label>Grievance Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="ALL">All Categories</option>
                <option value="TEACHING_RELATED">Teaching &amp; Pedagogy</option>
                <option value="MARKS_AND_ASSESSMENTS">Marks &amp; Assessments</option>
                <option value="COURSE_MATERIAL">Course Material</option>
                <option value="FACULTY_BEHAVIOR">Behavior &amp; Conduct</option>
                <option value="CLASSROOM_ENVIRONMENT">Facilities &amp; Lab</option>
              </select>
            </div>

            <div className="hod-filter-field">
              <label>Workflow Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESPONSE_SUBMITTED">Response Submitted</option>
                <option value="AWAITING_HOD_REVIEW">Awaiting HOD Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ESCALATED">Escalated</option>
              </select>
            </div>

            <div className="hod-filter-field">
              <label>Subject Code</label>
              <select
                value={filters.subjectCode}
                onChange={(e) => setFilters({ ...filters, subjectCode: e.target.value })}
              >
                <option value="ALL">All Subjects</option>
                <option value="CS501">CS501 (Data Structures)</option>
                <option value="CS502">CS502 (Operating Systems)</option>
                <option value="CS504">CS504 (Algorithms)</option>
              </select>
            </div>

            <div className="hod-filter-field">
              <label>Search Keyword</label>
              <input
                type="text"
                placeholder="ID, keyword..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => setFilters({ facultyName: 'ALL', category: 'ALL', subjectCode: 'ALL', semester: 'ALL', section: 'ALL', status: 'ALL', isOverdue: false, search: '' })}
                style={{ fontSize: '0.74rem', height: '32px' }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="fac-table-card">
            <div className="fac-table-wrapper">
              <table className="fac-complaints-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Concerned Faculty</th>
                    <th>Category</th>
                    <th>Subject &amp; Cohort</th>
                    <th>Submitted</th>
                    <th>Faculty Response</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Evaluation Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                        <ShieldCheck size={36} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>No complaints found</div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
                          No student grievances match your active department filter criteria.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    complaints.map(complaint => {
                      const hasResponse = complaint.responses && complaint.responses.length > 0;
                      const latestResponse = hasResponse ? complaint.responses[complaint.responses.length - 1] : null;

                      return (
                        <tr key={complaint.id}>
                          <td>
                            <span className="fac-tracking-pill">{complaint.trackingId}</span>
                            {complaint.isOverdue && (
                              <div style={{ color: '#dc2626', fontSize: '0.68rem', fontWeight: 800, marginTop: '2px' }}>
                                OVERDUE (&gt;7d)
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{complaint.facultyName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Associate Professor</div>
                          </td>
                          <td>
                            <span className="fac-category-tag">
                              {formatCategory(complaint.category)}
                            </span>
                          </td>
                          <td style={{ maxWidth: '260px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {complaint.subject}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {complaint.subjectName || complaint.subjectCode} · {complaint.semester} ({complaint.section})
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                              {new Date(complaint.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </div>
                          </td>
                          <td>
                            {hasResponse ? (
                              <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={13} /> Responded ({latestResponse?.responseTimeHours || 24}h)
                              </span>
                            ) : (
                              <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={13} /> Pending Response
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`fac-status-badge ${complaint.status.toLowerCase()}`}>
                              {complaint.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="fac-action-btn-primary"
                              onClick={() => handleOpenEval(complaint)}
                            >
                              <Eye size={13} /> Evaluate &amp; Review
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: DEPARTMENT GRIEVANCE ANALYTICS
      ========================================================================= */}
      {activeSubTab === 'analytics' && analyticsData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top KPI Metrics Banner */}
          <div className="fac-complaints-kpi-grid">
            <div className="fac-kpi-card">
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Resolution Rate</span>
                <div className="fac-kpi-icon-wrap emerald"><CheckCircle2 size={18} /></div>
              </div>
              <div className="fac-kpi-val" style={{ color: '#059669' }}>{analyticsData.kpis.resolutionRate}%</div>
              <div className="fac-kpi-sub">{analyticsData.kpis.resolvedCount} of {analyticsData.kpis.totalComplaints} Resolved</div>
            </div>

            <div className="fac-kpi-card">
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Avg Response Turnaround</span>
                <div className="fac-kpi-icon-wrap blue"><Clock size={18} /></div>
              </div>
              <div className="fac-kpi-val">{analyticsData.kpis.avgResponseTimeHours}h</div>
              <div className="fac-kpi-sub">{analyticsData.kpis.avgResponseTimeDays} Academic Days</div>
            </div>

            <div className="fac-kpi-card">
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Awaiting HOD Moderation</span>
                <div className="fac-kpi-icon-wrap amber"><AlertTriangle size={18} /></div>
              </div>
              <div className="fac-kpi-val" style={{ color: '#d97706' }}>{analyticsData.kpis.awaitingHodReview}</div>
              <div className="fac-kpi-sub">Ready for Final Decision</div>
            </div>

            <div className="fac-kpi-card">
              <div className="fac-kpi-top">
                <span className="fac-kpi-label">Overdue / Escalated</span>
                <div className="fac-kpi-icon-wrap purple"><ShieldAlert size={18} /></div>
              </div>
              <div className="fac-kpi-val" style={{ color: '#b91c1c' }}>{analyticsData.kpis.escalatedCount}</div>
              <div className="fac-kpi-sub">Statutory Time Breach</div>
            </div>
          </div>

          <div className="hod-analytics-grid">
            {/* Chart 1: Grievance Breakdown by Category */}
            <div className="hod-analytics-card">
              <div className="hod-analytics-card-title">
                <span>Grievance Distribution by Category</span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{analyticsData.kpis.totalComplaints} Incidents</span>
              </div>
              <div>
                {(analyticsData.categoryBreakdown || []).map((cat, idx) => (
                  <div key={idx} className="hod-bar-row">
                    <div className="hod-bar-row-top">
                      <span>{cat.label}</span>
                      <span>{cat.count} ({cat.percentage}%)</span>
                    </div>
                    <div className="hod-bar-track">
                      <div
                        className="hod-bar-fill"
                        style={{
                          width: `${cat.percentage}%`,
                          background: idx === 0 ? '#0f766e' : idx === 1 ? '#2563eb' : idx === 2 ? '#7c3aed' : '#d97706'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Grievances by Faculty Member (Fairness & Context Preserved) */}
            <div className="hod-analytics-card">
              <div className="hod-analytics-card-title">
                <span>Faculty Review Distribution (Contextualized)</span>
                <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                  Pedagogical Review
                </span>
              </div>
              <div>
                {(analyticsData.facultyBreakdown || []).map((fac, idx) => (
                  <div key={idx} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{fac.facultyName}</strong>
                      <span style={{ fontSize: '0.76rem', color: '#0f766e', fontWeight: 700 }}>
                        {fac.resolvedCount}/{fac.complaintCount} Resolved ({fac.resolutionRate}%)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: '4px' }}>
                      {fac.contextNote}
                    </div>
                    <div className="hod-bar-track">
                      <div className="hod-bar-fill" style={{ width: `${fac.resolutionRate}%`, background: '#059669' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 3: Trends Over Academic Semester */}
            <div className="hod-analytics-card">
              <div className="hod-analytics-card-title">
                <span>Monthly Grievance Resolution Trend</span>
                <TrendingUp size={16} color="#0f766e" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', paddingTop: '20px' }}>
                {(analyticsData.monthlyTrends || []).map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '130px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: `${Math.max(15, t.received * 22)}px`,
                          background: '#38bdf8',
                          borderRadius: '4px 4px 0 0'
                        }}
                        title={`Received: ${t.received}`}
                      />
                      <div
                        style={{
                          width: '16px',
                          height: `${Math.max(15, t.resolved * 22)}px`,
                          background: '#0f766e',
                          borderRadius: '4px 4px 0 0'
                        }}
                        title={`Resolved: ${t.resolved}`}
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{t.month.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '0.72rem', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i style={{ width: '10px', height: '10px', background: '#38bdf8', display: 'inline-block', borderRadius: '2px' }} /> Received</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i style={{ width: '10px', height: '10px', background: '#0f766e', display: 'inline-block', borderRadius: '2px' }} /> Resolved</span>
              </div>
            </div>

            {/* Recurring Issue Notice Box */}
            <div className="hod-analytics-card">
              <div className="hod-analytics-card-title">
                <span>Recurring Academic Pattern Alerts</span>
                <AlertCircle size={16} color="#d97706" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e' }}>
                    ⚠️ Pacing in Dynamic Programming (CS501)
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#78350f', lineHeight: 1.45 }}>
                    Two grievance records identify rapid lecture pacing in Module 4. <em>Recommendation:</em> Department has approved a weekend compensatory tutorial with hands-on practice.
                  </p>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af' }}>
                    ℹ️ Computing Lab 3 Display Hardware
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#1e3a8a', lineHeight: 1.45 }}>
                    Projector cable distortion reported and resolved by Campus IT. Physical verification complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLIDATED EVALUATION & HOD REVIEW MODAL */}
      {selectedComplaint && (
        <div className="fac-modal-backdrop" onClick={handleCloseModal}>
          <div className="fac-modal-card" style={{ maxWidth: '920px' }} onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="fac-tracking-pill">{selectedComplaint.trackingId}</span>
                <span className={`fac-status-badge ${selectedComplaint.status.toLowerCase()}`}>
                  {selectedComplaint.status.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  HOD Consolidated Grievance Assessment
                </span>
              </div>
              <button type="button" onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="fac-modal-body">
              {/* Split layout: Original & Faculty Response on LEFT (50%) + HOD Decision on RIGHT (50%) */}
              <div className="hod-eval-split">
                {/* LEFT COLUMN: Original Submission & Faculty Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* 1. Original Grievance */}
                  <div className="hod-eval-card-section" style={{ borderLeft: '4px solid #0f766e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', marginBottom: '4px' }}>
                      <span className="fac-category-tag">{formatCategory(selectedComplaint.category)}</span>
                      <span>Filed: {new Date(selectedComplaint.submittedAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <h4 style={{ margin: '6px 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedComplaint.subject}
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {selectedComplaint.description}
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                      Cohort: <strong>{selectedComplaint.semester} · {selectedComplaint.section}</strong> · Course: <strong>{selectedComplaint.subjectName || selectedComplaint.subjectCode}</strong>
                    </div>
                  </div>

                  {/* 2. Concerned Faculty & Response */}
                  <div className="hod-eval-card-section">
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Concerned Faculty: {selectedComplaint.facultyName}</span>
                      <span style={{ color: '#059669' }}>
                        {selectedComplaint.responses && selectedComplaint.responses.length > 0 ? 'Responded' : 'Pending Response'}
                      </span>
                    </div>

                    {selectedComplaint.responses && selectedComplaint.responses.length > 0 ? (
                      selectedComplaint.responses.map((resp, i) => (
                        <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', fontSize: '0.8rem', color: '#166534', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px' }}>
                            <span>Faculty Statement</span>
                            <span>Turnaround: {resp.responseTimeHours}h</span>
                          </div>
                          <p style={{ margin: '2px 0 6px', color: '#14532d' }}>{resp.responseComment}</p>
                          {resp.proposedAction && (
                            <div style={{ background: '#dcfce7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.76rem' }}>
                              <strong>Proposed Action:</strong> {resp.proposedAction}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px', fontSize: '0.8rem', color: '#92400e' }}>
                        ⚠️ The concerned faculty member has not yet submitted a formal explanation. As HOD, you may review the allegation directly or return it with a request for prompt response.
                      </div>
                    )}
                  </div>

                  {/* 3. Action History */}
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    <strong>Action Timeline:</strong>
                    <ul style={{ margin: '4px 0 0', paddingLeft: '1.25rem' }}>
                      {(selectedComplaint.statusHistory || []).map((h, i) => (
                        <li key={i} style={{ marginBottom: '2px' }}>
                          {h.fromStatus} → <strong>{h.toStatus}</strong> by {h.changedBy} ({new Date(h.timestamp).toLocaleDateString('en-IN')})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* RIGHT COLUMN: HOD Evaluation & Review Outcome Form */}
                <form onSubmit={handleSubmitEvaluation} className="hod-decision-form">
                  <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.96rem', color: '#134e4a', fontWeight: 800 }}>
                    HOD Review Decision &amp; Observations
                  </h4>

                  {/* Response Adequacy Evaluation */}
                  <div className="fac-form-group">
                    <label>Does the faculty response adequately address the grievance?</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="adequacy"
                          value="yes"
                          checked={isAdequate === 'yes'}
                          onChange={() => { setIsAdequate('yes'); setEvalOutcome('Adequate'); }}
                        />
                        Yes, explanation and corrective action plan are adequate.
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="adequacy"
                          value="clarification"
                          checked={isAdequate === 'clarification'}
                          onChange={() => { setIsAdequate('clarification'); setEvalOutcome('Clarification Requested'); }}
                        />
                        No, additional clarification or details are required from faculty.
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="adequacy"
                          value="corrective"
                          checked={isAdequate === 'corrective'}
                          onChange={() => { setIsAdequate('corrective'); setEvalOutcome('Corrective Action Required'); }}
                        />
                        Mandatory departmental corrective action required.
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="adequacy"
                          value="escalate"
                          checked={isAdequate === 'escalate'}
                          onChange={() => { setIsAdequate('escalate'); setEvalOutcome('Escalated'); }}
                        />
                        Escalate grievance to Academic Council / Principal Office.
                      </label>
                    </div>
                  </div>

                  <div className="fac-form-group">
                    <label htmlFor="evalObservations">HOD Assessment &amp; Governance Remarks *</label>
                    <textarea
                      id="evalObservations"
                      rows={4}
                      placeholder="Record your observations, pedagogical recommendations, or directives for the faculty member..."
                      value={evalObservations}
                      onChange={(e) => setEvalObservations(e.target.value)}
                      required
                    />
                  </div>

                  <div className="fac-form-group">
                    <label htmlFor="evalOutcome">Final Review Workflow Status</label>
                    <select
                      id="evalOutcome"
                      value={evalOutcome}
                      onChange={(e) => setEvalOutcome(e.target.value)}
                    >
                      <option value="Adequate">Approve &amp; Mark Resolved (Closed)</option>
                      <option value="Clarification Requested">Return for Faculty Clarification (Under Review)</option>
                      <option value="Corrective Action Required">Corrective Action Required</option>
                      <option value="Escalated">Escalate to Academic Council</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button type="button" className="admin-action-btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="fac-action-btn-primary"
                      disabled={submittingEval}
                      style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem' }}
                    >
                      <Check size={14} /> {submittingEval ? 'Saving...' : 'Record HOD Review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
