import React, { useState, useEffect } from 'react';
import { ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Unlock,
  FileText,
  Search,
  Download,
  LogOut,
  Layers,
  ArrowRight,
  Eye,
  MessageSquare,
  X
} from 'lucide-react';
import './HodPortal.css';
import '../components/AdminPortal.css';
import { downloadDepartmentGazettePdf } from '../utils/pdfGenerator';
import { initialApprovalQueue, initialFaculty, initialSubjects, generateAllStudents } from '../data/collegeData.js';
import MarksManagementModule from '../marks/MarksManagementModule.jsx';
import { api } from '../services/api.js';
import { getDocumentsForRole } from '../services/studentStore.js';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';

export default function HodPortal({ account, onLogout }) {
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [approvalQueue, setApprovalQueue] = useState(initialApprovalQueue);
  const [students] = useState(() => generateAllStudents());
  const [faculty] = useState(initialFaculty);
  const [subjects] = useState(initialSubjects);

  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingMarksItem, setReviewingMarksItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Documents
  const [hodDocs, setHodDocs] = useState(() => getDocumentsForRole('hod'));
  const [hodDocsSearch, setHodDocsSearch] = useState('');
  const [docsViewMode, setDocsViewMode] = useState('student_docs');

  useEffect(() => {
    const handleDocsChange = () => setHodDocs(getDocumentsForRole('hod'));
    window.addEventListener('cms_documents_changed', handleDocsChange);
    window.addEventListener('cms_student_documents_changed', handleDocsChange);
    return () => {
      window.removeEventListener('cms_documents_changed', handleDocsChange);
      window.removeEventListener('cms_student_documents_changed', handleDocsChange);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Actions
  const handleApprove = async (id, subject) => {
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Approved',
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          hodRemarks: 'Approved by HOD. Verified continuous internal assessment components.'
        };
      }
      return item;
    }));
    showToast(`Marks for ${subject} officially APPROVED and published!`);
    try {
      await api.approveMarks(id);
    } catch (e) {
      console.warn('Backend marks approval sync failed:', e.message);
    }
  };

  const handleOpenReject = (item) => {
    setRejectingItem(item);
    setRejectionReason('Quiz 4 marks are missing for 8 students. Please complete and resubmit.');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    const currentItem = rejectingItem;
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === currentItem.id) {
        return {
          ...item,
          status: 'Rejected',
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          hodRemarks: rejectionReason
        };
      }
      return item;
    }));
    showToast(`Marks for ${currentItem.subject} returned to faculty for revision.`);
    setRejectingItem(null);
    try {
      await api.rejectMarks(currentItem.id, rejectionReason);
    } catch (err) {
      console.warn('Backend marks rejection sync failed:', err.message);
    }
  };

  const handleUnlockMarks = async (id, subject) => {
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Pending',
          hodRemarks: 'HOD unlocked marks for faculty correction.'
        };
      }
      return item;
    }));
    showToast(`Marks for ${subject} have been unlocked. Faculty can now edit.`);
    try {
      await api.unlockMarks(id);
    } catch (e) {
      console.warn('Backend marks unlock sync failed:', e.message);
    }
  };

  const pendingCount = approvalQueue.filter(q => q.status === 'Pending').length;
  const approvedCount = approvalQueue.filter(q => q.status === 'Approved').length;

  return (
    <div className="hod-portal-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          borderLeft: '4px solid #0f766e'
        }}>
          <CheckCircle2 size={18} color="#2dd4bf" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="hod-header">
        <div className="hod-brand">
          <div className="hod-brand-icon">HOD</div>
          <div className="hod-brand-text">
            <h1>GIFT AUTONOMOUS · DEPARTMENT OF CSE</h1>
            <p>Head of Department Academic Portal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="hod-role-badge">
            <ShieldCheck size={14} />
            HOD · Computer Science & Engg
          </span>
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
            {account?.name || 'Dr. P. K. Pattnaik'}
          </span>
          <button className="admin-signout-btn" onClick={onLogout} title="Sign Out">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="hod-layout">
        {/* Sidebar */}
        <aside className="hod-sidebar">
          <button
            className={`hod-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={17} /> Dashboard
          </button>
          <button
            className={`hod-nav-btn ${activeTab === 'approval' ? 'active' : ''}`}
            onClick={() => setActiveTab('approval')}
          >
            <CheckCircle2 size={17} /> Marks Approval ({pendingCount})
          </button>
          <button
            className={`hod-nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <GraduationCap size={17} /> Department Students
          </button>
          <button
            className={`hod-nav-btn ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculty')}
          >
            <Users size={17} /> Department Faculty
          </button>
          <button
            className={`hod-nav-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <BookOpen size={17} /> Department Subjects
          </button>
          <button
            className={`hod-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={17} /> Department Reports
          </button>
          <button
            className={`hod-nav-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => { setHodDocs(getDocumentsForRole('hod')); setActiveTab('documents'); }}
          >
            <Download size={17} /> Documents
            <span style={{ marginLeft: 'auto', background: '#7c3aed', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
              {hodDocs.length}
            </span>
          </button>
        </aside>

        {/* Content Pane */}
        <main className="hod-main">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>{greeting}, {account?.name || 'Dr. P. K. Pattnaik'}</h2>
                  <p>HOD Academic Workspace · Department of Computer Science &amp; Engineering · Review faculty assessments &amp; student progress.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setActiveTab('approval')}>
                  Review Pending Marks ({pendingCount})
                </button>
              </div>

              {/* HOD Specific Stats */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Department Students</span>
                    <div className="admin-kpi-card-icon blue"><GraduationCap size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">540</div>
                  <small style={{ color: '#64748b' }}>Across 6 sections</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Department Faculty</span>
                    <div className="admin-kpi-card-icon emerald"><Users size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">32</div>
                  <small style={{ color: '#64748b' }}>Teaching Staff</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Curriculum Subjects</span>
                    <div className="admin-kpi-card-icon purple"><BookOpen size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">48</div>
                  <small style={{ color: '#64748b' }}>Under Autonomous Council</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Marks Pending Approval</span>
                    <div className="admin-kpi-card-icon amber"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>{pendingCount}</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>Action Required</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Marks Finalized</span>
                    <div className="admin-kpi-card-icon emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>{approvedCount}</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Published to Students</small>
                </div>
              </div>

              {/* Pending Approvals Summary */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Continuous Evaluation Submission Status</h3>
                  <span className="admin-badge pending">{pendingCount} Awaiting HOD Action</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {approvalQueue.map(item => (
                    <div key={item.id} className={`hod-approval-card ${item.status.toLowerCase()}`}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{item.subject} ({item.subjectCode})</strong>
                          <span className={`admin-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Faculty: <strong>{item.faculty}</strong> · {item.semester} · {item.section} · Submitted: {item.submittedDate}
                        </div>
                        {item.hodRemarks && (
                          <div style={{ fontSize: '0.8rem', color: item.status === 'Rejected' ? '#e11d48' : '#047857', marginTop: '0.4rem', background: '#f8fafc', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
                            <strong>Remark:</strong> {item.hodRemarks}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="admin-action-btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            setReviewingMarksItem(item);
                            setActiveTab('approval');
                          }}
                        >
                          <Eye size={14} /> Inspect Marks
                        </button>
                        {item.status === 'Pending' && (
                          <>
                            <button className="hod-btn-approve" onClick={() => handleApprove(item.id, item.subject)}>
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button className="hod-btn-reject" onClick={() => handleOpenReject(item)}>
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        {item.status === 'Approved' && (
                          <button className="hod-btn-unlock" onClick={() => handleUnlockMarks(item.id, item.subject)}>
                            <Unlock size={14} /> Unlock Marks
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARKS APPROVAL WORKFLOW */}
          {activeTab === 'approval' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>Department Marks Approval & Moderation</h2>
                  <p>Faculty continuous evaluation submissions. Approve verified grades or reject with actionable feedback.</p>
                </div>
              </div>

              {/* Submissions Queue */}
              <div style={{ marginBottom: '1.5rem' }}>
                {approvalQueue.map(item => (
                  <div key={item.id} className={`hod-approval-card ${item.status.toLowerCase()}`}>
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{item.subject}</strong>
                        <code>{item.subjectCode}</code>
                        <span className={`admin-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                        Submitted by: <strong>{item.faculty}</strong> · Cohort: {item.semester} ({item.section}) · 91 Students
                      </div>
                      {item.hodRemarks && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.825rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: item.status === 'Rejected' ? '#fff1f2' : '#f0fdf4', color: item.status === 'Rejected' ? '#9f1239' : '#166534', border: `1px solid ${item.status === 'Rejected' ? '#fecdd3' : '#bbf7d0'}` }}>
                          <strong>HOD Decision:</strong> {item.hodRemarks}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        className="admin-action-btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                        onClick={() => setReviewingMarksItem(item)}
                      >
                        <Eye size={15} /> Review Class Matrix
                      </button>

                      {item.status === 'Pending' && (
                        <>
                          <button className="hod-btn-approve" onClick={() => handleApprove(item.id, item.subject)}>
                            <CheckCircle2 size={15} /> Approve Marks
                          </button>
                          <button className="hod-btn-reject" onClick={() => handleOpenReject(item)}>
                            <XCircle size={15} /> Reject with Reason
                          </button>
                        </>
                      )}

                      {item.status === 'Approved' && (
                        <button className="hod-btn-unlock" onClick={() => handleUnlockMarks(item.id, item.subject)}>
                          <Unlock size={15} /> Unlock Marks
                        </button>
                      )}

                      {item.status === 'Rejected' && (
                        <span style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>
                          Awaiting Faculty Resubmission
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Integrated Marks View for the Selected Subject */}
              <div className="admin-card" style={{ marginTop: '2rem' }}>
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Live Faculty Grade Sheet Preview</h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '2px 0 0 0' }}>
                      {reviewingMarksItem ? `Inspecting ${reviewingMarksItem.subject} (${reviewingMarksItem.faculty})` : 'Showing Data Structures continuous evaluation matrix'}
                    </p>
                  </div>
                </div>
                <MarksManagementModule initialRole="teacher" />
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENT STUDENTS */}
          {activeTab === 'students' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Students</h2>
                  <p>Roster of 91 students enrolled in Semester 5 Section A.</p>
                </div>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Section</th>
                      <th>Attendance</th>
                      <th>CGPA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 20).map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.rollNumber}</strong></td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td><code>{s.studentId}</code></td>
                        <td>{s.section}</td>
                        <td><strong style={{ color: '#2563eb' }}>{s.attendance}%</strong></td>
                        <td><strong style={{ color: '#059669' }}>{s.cgpa}</strong></td>
                        <td><span className="admin-badge active">{s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DEPARTMENT FACULTY */}
          {activeTab === 'faculty' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Teaching Faculty</h2>
                  <p>32 professors and lecturers across Computing Systems, Algorithms, and Software Engineering.</p>
                </div>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Faculty Name</th>
                      <th>Email</th>
                      <th>Designation</th>
                      <th>Assigned Courses</th>
                      <th>Sections</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.map(f => (
                      <tr key={f.id}>
                        <td><strong>{f.id}</strong></td>
                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                        <td>{f.email}</td>
                        <td><span className="admin-badge active">{f.designation}</span></td>
                        <td>{(Array.isArray(f.assignedSubjects) ? f.assignedSubjects : [f.assignedSubjects]).join(', ')}</td>
                        <td>{(Array.isArray(f.assignedSections) ? f.assignedSections : [f.assignedSections]).join(', ')}</td>
                        <td><span className="admin-badge active">{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DEPARTMENT SUBJECTS */}
          {activeTab === 'subjects' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Curricular Subjects</h2>
                  <p>Autonomous course codes CS501 to CS506 with internal assessment configurations.</p>
                </div>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject Name</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Format</th>
                      <th>Assigned Course Coordinator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(s => (
                      <tr key={s.id}>
                        <td><code style={{ fontWeight: 700, color: '#0f766e' }}>{s.code}</code></td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.semester}</td>
                        <td>{s.credits} Credits</td>
                        <td><span className="admin-badge active">{s.type}</span></td>
                        <td>{s.assignedFaculty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DEPARTMENT REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>Department Reports & Compliance Records</h2>
                  <p>Official internal assessment summaries ready for Academic Council review.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 className="admin-card-title">CSE Internal Marks Comprehensive Report</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Complete grade book for 6 subjects across 91 students with component breakdowns.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => {
                    downloadDepartmentGazettePdf('CSE Department Internal Marks Comprehensive Gazette');
                    showToast('Generated & downloaded CSE Department Internal Marks PDF Report.');
                  }}>
                    <Download size={15} /> Download Gazette PDF
                  </button>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Faculty Submission Compliance Audit</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Verification checklist of quiz, assignment, and modular exam submissions.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => showToast('Exported Compliance Audit Spreadsheet.')}>
                    <Download size={15} /> Export Excel / CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div>
              {/* Sub-tab switcher */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                <button
                  type="button"
                  onClick={() => setDocsViewMode('student_docs')}
                  style={{
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: docsViewMode === 'student_docs' ? '#ffffff' : 'transparent',
                    color: docsViewMode === 'student_docs' ? '#1e293b' : '#64748b',
                    boxShadow: docsViewMode === 'student_docs' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  🎓 Student Uploaded Documents (Section &amp; Semester Registry)
                </button>
                <button
                  type="button"
                  onClick={() => setDocsViewMode('campus_docs')}
                  style={{
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: docsViewMode === 'campus_docs' ? '#ffffff' : 'transparent',
                    color: docsViewMode === 'campus_docs' ? '#1e293b' : '#64748b',
                    boxShadow: docsViewMode === 'campus_docs' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  🏛️ Campus Institutional Files ({hodDocs.length})
                </button>
              </div>

              {docsViewMode === 'student_docs' ? (
                <StudentDocumentsTable portalRole="hod" />
              ) : (() => {
                const catColor = { Academic: '#2563eb', Examination: '#dc2626', Training: '#d97706', Circular: '#7c3aed', Notice: '#059669', Other: '#475569' };
                const fileTypeColor = { PDF: '#dc2626', DOCX: '#2563eb', XLSX: '#16a34a', PPTX: '#d97706', JPG: '#9333ea', PNG: '#0891b2' };
                const filtered = hodDocs.filter(d =>
                  d.title.toLowerCase().includes(hodDocsSearch.toLowerCase()) ||
                  (d.category || '').toLowerCase().includes(hodDocsSearch.toLowerCase()) ||
                  (d.description || '').toLowerCase().includes(hodDocsSearch.toLowerCase())
                );
                return (
                  <div>
                    <div className="hod-view-header">
                      <div>
                        <h2>Campus Documents</h2>
                        <p>Institutional documents shared with HOD by the Administration. ({hodDocs.length} available)</p>
                      </div>
                    </div>
                    <div className="admin-search-wrap" style={{ marginBottom: '1.25rem', maxWidth: '480px' }}>
                      <Search size={15} style={{ color: '#94a3b8' }} />
                      <input className="admin-search-input" placeholder="Search documents…" value={hodDocsSearch} onChange={e => setHodDocsSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                      {filtered.map(doc => (
                        <div key={doc.id} className="admin-card" style={{ marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: catColor[doc.category] || '#2563eb' }} />
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: catColor[doc.category] || '#64748b', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{doc.category}</span>
                            <span style={{ background: fileTypeColor[doc.fileType] || '#64748b', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{doc.fileType || 'FILE'}</span>
                          </div>
                          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.3 }}>{doc.title}</h3>
                          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>{doc.description || 'No description.'}</p>
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                            <span style={{ fontWeight: 600, color: '#475569' }}>{doc.uploadedBy}</span> · {doc.fileSize || '—'} · {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      ))}
                      {filtered.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          <FileText size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
                          <p style={{ margin: 0, fontWeight: 600 }}>No documents available</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: REJECT MARKS WITH REASON */}
      {rejectingItem && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 style={{ color: '#e11d48' }}>Reject Marks Submission</h3>
              <button className="admin-table-action-btn" onClick={() => setRejectingItem(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmReject}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                  You are returning continuous evaluation marks for <strong>{rejectingItem.subject}</strong> ({rejectingItem.faculty}) back to the faculty.
                </p>
                <div className="admin-form-group">
                  <label style={{ fontWeight: 700, color: '#0f172a' }}>Reason for Rejection (Mandatory):</label>
                  <textarea
                    rows={4}
                    className="admin-form-input"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="e.g. Quiz 4 marks are missing for 8 students. Please complete and resubmit."
                    required
                  />
                  <small style={{ color: '#64748b' }}>This reason will be displayed directly to the faculty member upon their next login.</small>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setRejectingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary" style={{ background: '#e11d48' }}>
                  Confirm Rejection & Notify Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
