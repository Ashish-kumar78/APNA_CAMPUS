import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, GraduationCap, Layers, BarChart2, FileText,
  AlertCircle, CheckCircle2, ArrowRight, LogOut, Download,
  Calendar, Clock, Search, Sparkles, ClipboardList, Plus,
  Timer, X, ChevronDown, ShieldCheck, Eye, Flag, Trash2
} from 'lucide-react';
import './FacultyPortal.css';
import '../components/AdminPortal.css';
import { downloadDepartmentGazettePdf } from '../utils/pdfGenerator';
import { generateAllStudents } from '../data/collegeData.js';
import MarksManagementModule from '../marks/MarksManagementModule.jsx';
import { notesApi } from '../services/notesApi.js';
import { getDocumentsForRole } from '../services/studentStore.js';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';

export default function FacultyPortal({ account, onLogout }) {
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState('Data Structures');
  const [students] = useState(() => generateAllStudents());
  const [studentSearch, setStudentSearch] = useState('');

  // Class Notes Moderation State
  const [moderationNotesList, setModerationNotesList] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [viewingNote, setViewingNote] = useState(null);

  // Documents
  const [campusDocs, setCampusDocs] = useState(() => getDocumentsForRole('faculty'));
  const [docsSearch, setDocsSearch] = useState('');
  const [docsViewMode, setDocsViewMode] = useState('student_docs');

  useEffect(() => {
    const handleDocsChange = () => setCampusDocs(getDocumentsForRole('faculty'));
    window.addEventListener('cms_documents_changed', handleDocsChange);
    window.addEventListener('cms_student_documents_changed', handleDocsChange);
    return () => {
      window.removeEventListener('cms_documents_changed', handleDocsChange);
      window.removeEventListener('cms_student_documents_changed', handleDocsChange);
    };
  }, []);


  // ── QUIZ MANAGEMENT STATE ──────────────────────────────────────────────────
  const makeBlankQuestions = () =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      question: '',
      options: ['', '', '', ''],
      correct: 0,
    }));

  const [quizList, setQuizList] = useState([
    {
      id: 'QZ-001', title: 'Data Structures – Quiz 1', subject: 'Data Structures',
      section: 'Section A', date: '2026-10-08', time: 30, totalMarks: 10,
      status: 'Scheduled', attempts: 0, createdAt: '2026-10-05',
      questions: [
        { id:1, question:'What is the time complexity of binary search?', options:['O(n)','O(log n)','O(n²)','O(1)'], correct:1 },
        { id:2, question:'Which data structure uses LIFO?', options:['Queue','Stack','Tree','Graph'], correct:1 },
        { id:3, question:'AVL tree is a type of?', options:['Heap','BST','Trie','B-Tree'], correct:1 },
        { id:4, question:'Which traversal visits root first?', options:['Inorder','Postorder','Preorder','Level order'], correct:2 },
        { id:5, question:'Linked list node contains?', options:['Data only','Pointer only','Data & pointer','Index'], correct:2 },
        { id:6, question:'Which sorting is O(n log n) worst case?', options:['Bubble sort','Insertion sort','Merge sort','Quick sort'], correct:2 },
        { id:7, question:'Hash table collision handled by?', options:['Sorting','Chaining','Recursion','Searching'], correct:1 },
        { id:8, question:'Queue follows?', options:['LIFO','FIFO','LILO','FILO'], correct:1 },
        { id:9, question:'Complete binary tree has nodes at?', options:['Only root','All levels full except last','Only leaves','Root and leaves'], correct:1 },
        { id:10, question:'Depth-first search uses?', options:['Queue','Stack','Heap','Array'], correct:1 },
      ]
    },
    {
      id: 'QZ-002', title: 'Operating Systems – Quiz 1', subject: 'Operating Systems',
      section: 'Section A', date: '2026-10-10', time: 25, totalMarks: 10,
      status: 'Scheduled', attempts: 0, createdAt: '2026-10-05',
      questions: [
        { id:1, question:'Which scheduling gives minimum avg wait time?', options:['FCFS','SJF','Round Robin','Priority'], correct:1 },
        { id:2, question:'Deadlock occurs when?', options:['CPU is busy','Process waits for resources held by others','Memory is full','Disk is slow'], correct:1 },
        { id:3, question:'Page fault occurs when?', options:['Page in RAM','Page not in RAM','RAM overflow','Cache miss'], correct:1 },
        { id:4, question:'Process state after creation is?', options:['Ready','Running','Blocked','Terminated'], correct:0 },
        { id:5, question:'Semaphore is used for?', options:['Sorting','Synchronization','Scheduling','Paging'], correct:1 },
        { id:6, question:'Virtual memory extends?', options:['Cache','RAM using disk','ROM','CPU registers'], correct:1 },
        { id:7, question:'Which is NOT a disk scheduling algorithm?', options:['SSTF','LOOK','Dijkstra','SCAN'], correct:2 },
        { id:8, question:'Mutex allows how many threads in critical section?', options:['Unlimited','2','1','Depends'], correct:2 },
        { id:9, question:'Thrashing is caused by?', options:['Excessive paging','Deadlock','Starvation','Cache miss'], correct:0 },
        { id:10, question:'Context switching is done by?', options:['Compiler','OS Kernel','CPU only','RAM'], correct:1 },
      ]
    },
    {
      id: 'QZ-003', title: 'Data Structures – Quiz 2', subject: 'Data Structures',
      section: 'Section B', date: '2026-10-12', time: 20, totalMarks: 10,
      status: 'Scheduled', attempts: 0, createdAt: '2026-10-05',
      questions: makeBlankQuestions()
    },
    {
      id: 'QZ-004', title: 'Operating Systems – Quiz 2', subject: 'Operating Systems',
      section: 'Section A', date: '2026-10-15', time: 30, totalMarks: 10,
      status: 'Live', attempts: 34, createdAt: '2026-10-04',
      questions: makeBlankQuestions()
    },
    {
      id: 'QZ-005', title: 'Data Structures – Mid Quiz', subject: 'Data Structures',
      section: 'All Sections', date: '2026-10-18', time: 45, totalMarks: 10,
      status: 'Completed', attempts: 88, createdAt: '2026-10-03',
      questions: makeBlankQuestions()
    },
    {
      id: 'QZ-006', title: 'OS Practical Concepts Quiz', subject: 'Operating Systems',
      section: 'Section A', date: '2026-10-20', time: 20, totalMarks: 10,
      status: 'Draft', attempts: 0, createdAt: '2026-10-05',
      questions: makeBlankQuestions()
    },
  ]);

  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [viewQuiz, setViewQuiz] = useState(null);
  const [quizStep, setQuizStep] = useState(1); // 1=meta, 2=questions
  const [quizMeta, setQuizMeta] = useState({
    title: '', subject: 'Data Structures', section: 'Section A',
    date: '', time: 30, totalMarks: 10, status: 'Draft'
  });
  const [quizQuestions, setQuizQuestions] = useState(() => makeBlankQuestions());
  const [quizFormError, setQuizFormError] = useState('');

  const updateQuestion = (idx, field, value) => {
    setQuizQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };
  const updateOption = (qIdx, oIdx, value) => {
    setQuizQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options]; opts[oIdx] = value;
      return { ...q, options: opts };
    }));
  };
  const handleAddQuizSubmit = () => {
    if (!quizMeta.title.trim()) { setQuizFormError('Quiz title is required.'); return; }
    if (!quizMeta.date) { setQuizFormError('Please set the quiz date.'); return; }
    const incomplete = quizQuestions.findIndex(q => !q.question.trim() || q.options.some(o => !o.trim()));
    if (incomplete !== -1) { setQuizFormError(`Question ${incomplete + 1} is incomplete. Fill all options.`); return; }
    const newQuiz = {
      ...quizMeta,
      id: `QZ-${String(quizList.length + 1).padStart(3,'0')}`,
      attempts: 0,
      createdAt: new Date().toISOString().split('T')[0],
      questions: quizQuestions.map((q, i) => ({ ...q, id: i + 1 }))
    };
    setQuizList(prev => [newQuiz, ...prev]);
    triggerToast('✓ Quiz created successfully!');
    setShowAddQuiz(false);
    setQuizStep(1);
    setQuizMeta({ title:'', subject:'Data Structures', section:'Section A', date:'', time:30, totalMarks:10, status:'Draft' });
    setQuizQuestions(makeBlankQuestions());
    setQuizFormError('');
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  React.useEffect(() => {
    loadModerationNotes();
  }, []);

  const loadModerationNotes = async () => {
    const list = await notesApi.getClassNotes({ subject: 'ALL' });
    if (list) setModerationNotesList(list);
  };

  const handleVerifyNote = async (id) => {
    const facultyName = account?.name || 'Dr. Pratyush Mohapatra';
    const res = await notesApi.verifyNoteByFaculty(id, facultyName);
    if (res && res.success) {
      triggerToast('✓ Class note marked as Faculty Verified!');
      await loadModerationNotes();
    }
  };

  const handleHideNote = async (id) => {
    const res = await notesApi.hideNoteByFaculty(id);
    if (res && res.success) {
      triggerToast('✕ Class note hidden from students.');
      await loadModerationNotes();
    }
  };


  const assignedSubjects = [
    {
      code: 'CS501',
      name: 'Data Structures',
      studentsCount: 91,
      cohort: 'Semester 5 - Section A',
      completion: 82,
      pendingAssessments: 2,
      status: 'In Progress',
      lastUpdated: 'Today, 04:30 PM'
    },
    {
      code: 'CS502',
      name: 'Operating Systems',
      studentsCount: 91,
      cohort: 'Semester 5 - Section A',
      completion: 100,
      pendingAssessments: 0,
      status: 'Finalized · Awaiting HOD',
      lastUpdated: 'Yesterday, 06:10 PM'
    }
  ];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNumber.includes(studentSearch)
  );

  return (
    <>
    <div className="faculty-portal-root">
      {/* Top Header */}
      <header className="faculty-header">
        <div className="faculty-brand">
          <div className="faculty-brand-icon">F</div>
          <div className="faculty-brand-text">
            <h1>GIFT AUTONOMOUS · FACULTY PORTAL</h1>
            <p>Department of Computer Science & Engineering</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="faculty-role-badge">
            <BookOpen size={14} />
            Faculty Evaluator
          </span>
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
            {account?.name || 'Dr. S. Mohanty'}
          </span>
          <button className="admin-signout-btn" onClick={onLogout} title="Sign Out">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="faculty-layout">
        {/* Sidebar */}
        <aside className="faculty-sidebar">
          <button
            className={`faculty-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={17} /> Dashboard
          </button>
          <button
            className={`faculty-nav-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <BookOpen size={17} /> My Subjects
          </button>
          <button
            className={`faculty-nav-btn ${activeTab === 'marks' ? 'active' : ''}`}
            onClick={() => setActiveTab('marks')}
          >
            <BarChart2 size={17} /> Marks Management
          </button>
          <button
            className={`faculty-nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <GraduationCap size={17} /> My Students ({students.length})
          </button>
          <button
            className={`faculty-nav-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <Sparkles size={17} /> Class Performance
          </button>
          <button
            className={`faculty-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={17} /> Grade Reports
          </button>
          <button
            className={`faculty-nav-btn ${activeTab === 'notes-moderation' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes-moderation')}
          >
            <ShieldCheck size={17} /> Class Notes Moderation
          </button>
          <button
            className={`faculty-nav-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <ClipboardList size={17} /> Quiz Management
          </button>
          <button
            className={`faculty-nav-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => { setCampusDocs(getDocumentsForRole('faculty')); setActiveTab('documents'); }}
          >
            <Download size={17} /> Documents
            <span style={{ marginLeft: 'auto', background: '#4338ca', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
              {campusDocs.length}
            </span>
          </button>
        </aside>

        {/* Dynamic Content Pane */}
        <main className="faculty-main">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome Header */}
              <div className="admin-view-header">
                <div>
                  <h2>{greeting}, {account?.name || 'Dr. S. Mohanty'}</h2>
                  <p>Faculty Continuous Assessment & Evaluation Workspace · Academic Year 2026-27</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setActiveTab('marks')}>
                  <BarChart2 size={15} /> Enter Marks
                </button>
              </div>

              {/* HOD Feedback Notice Banner */}
              <div className="faculty-rejection-banner">
                <AlertCircle size={22} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#9f1239', fontSize: '0.95rem' }}>
                    Notice from HOD (Dr. P. K. Pattnaik) — Action Required
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#881337' }}>
                    "Please verify Quiz 3 and Quiz 4 continuous evaluation entries for Data Structures. Ensure all 91 students in Section A have non-zero marks before final moderation deadline."
                  </p>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Assigned Subjects</span>
                    <div className="admin-kpi-card-icon blue"><BookOpen size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">2 Courses</div>
                  <small style={{ color: '#64748b' }}>CS501 (DSA) & CS502 (OS)</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Active Students</span>
                    <div className="admin-kpi-card-icon emerald"><Users size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">91</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Semester 5 · Section A</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Evaluation Progress</span>
                    <div className="admin-kpi-card-icon purple"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">91%</div>
                  <small style={{ color: '#64748b' }}>11 of 13 Assessments</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Next Academic Milestone</span>
                    <div className="admin-kpi-card-icon amber"><Clock size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">15 Oct</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>Modular 2 Exams</small>
                </div>
              </div>

              {/* My Assigned Subjects Section */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">My Subjects</h3>
                  <span className="admin-badge active">Semester 5 - Section A</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {assignedSubjects.map(sub => (
                    <div key={sub.code} className="faculty-subject-card">
                      <div className="faculty-subject-card-header">
                        <div>
                          <span className="admin-badge active" style={{ marginBottom: '0.4rem' }}>{sub.code}</span>
                          <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{sub.name}</h4>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{sub.cohort}</div>
                        </div>
                        <span className={`admin-badge ${sub.completion === 100 ? 'approved' : 'pending'}`}>
                          {sub.completion}% Entered
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>
                          <span>{sub.studentsCount} Students Enrolled</span>
                          <span>{sub.pendingAssessments === 0 ? 'All Completed' : `${sub.pendingAssessments} Pending`}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${sub.completion}%`, height: '100%', background: sub.completion === 100 ? '#059669' : '#2563eb', borderRadius: '9999px' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                        <small style={{ color: '#64748b' }}>Updated: {sub.lastUpdated}</small>
                        <button
                          className="admin-action-btn-primary"
                          style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }}
                          onClick={() => {
                            setSelectedSubject(sub.name);
                            setActiveTab('marks');
                          }}
                        >
                          Manage Marks <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY SUBJECTS */}
          {activeTab === 'subjects' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Assigned Teaching Subjects</h2>
                  <p>Curricular subjects assigned by Head of Department for Continuous Evaluation.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {assignedSubjects.map(sub => (
                  <div key={sub.code} className="faculty-subject-card">
                    <div>
                      <span className="admin-badge active">{sub.code}</span>
                      <h3 style={{ margin: '0.5rem 0 0.25rem 0', color: '#0f172a' }}>{sub.name}</h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{sub.cohort} · 4 Credits · Theory + Lab</p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span>Total Students:</span>
                        <strong>{sub.studentsCount}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span>Evaluation Status:</span>
                        <strong style={{ color: sub.completion === 100 ? '#059669' : '#2563eb' }}>{sub.status}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Continuous Components:</span>
                        <strong>13 Assessments</strong>
                      </div>
                    </div>

                    <button
                      className="admin-action-btn-primary"
                      onClick={() => {
                        setSelectedSubject(sub.name);
                        setActiveTab('marks');
                      }}
                    >
                      Open Marks Entry Matrix <ArrowRight size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MARKS MANAGEMENT (FULL MATRIX) */}
          {activeTab === 'marks' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Continuous Assessment Marks Entry</h2>
                  <p>Entering and finalizing marks for {selectedSubject} · 91 Students in Section A.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    className="admin-select"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    style={{ fontWeight: 600 }}
                  >
                    <option value="Data Structures">Data Structures (CS501)</option>
                    <option value="Operating Systems">Operating Systems (CS502)</option>
                  </select>
                </div>
              </div>

              {/* Renders the full fast inline matrix table with keyboard navigation, tabs, CSV upload and Save Draft/Finalize */}
              <MarksManagementModule initialRole="teacher" />
            </div>
          )}

          {/* TAB 4: MY STUDENTS */}
          {activeTab === 'students' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Students Cohort Roster</h2>
                  <p>91 Enrolled students for Semester 5 Section A in Computer Science & Engineering.</p>
                </div>
                <div className="admin-search-wrap" style={{ minWidth: '260px' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search student or roll number..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Attendance</th>
                      <th>Cumulative CGPA</th>
                      <th>Continuous Eval Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.rollNumber}</strong></td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td><code>{s.studentId}</code></td>
                        <td><strong style={{ color: '#2563eb' }}>{s.attendance}%</strong></td>
                        <td><strong style={{ color: '#059669' }}>{s.cgpa}</strong></td>
                        <td>
                          <span className="admin-badge approved">✓ Marks Up-to-date</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CLASS PERFORMANCE */}
          {activeTab === 'performance' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Cohort Assessment Analytics & Analytics</h2>
                  <p>Statistical distribution across modulars, quizzes, assignments, surprise tests, and lab viva.</p>
                </div>
              </div>
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Class Average</span>
                  <div className="admin-kpi-val" style={{ color: '#2563eb' }}>82.4%</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Above autonomous benchmark</small>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Highest Score</span>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>96.0%</div>
                  <small style={{ color: '#64748b' }}>Rakesh Das (Roll 01)</small>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Lowest Score</span>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>58.5%</div>
                  <small style={{ color: '#64748b' }}>Remedial classes allocated</small>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-label">Pass Percentage</span>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>98.9%</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>90 / 91 passed internal criteria</small>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Faculty Grade Reports & Gazette Sheets</h2>
                  <p>Official continuous evaluation returns ready for submission to Head of Department.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 className="admin-card-title">Data Structures (CS501) CIA Gazette</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Official grade sheet breakdown for 91 students across all 13 components.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => downloadDepartmentGazettePdf('Data Structures (CS501) CIA Gazette')}>
                    <Download size={15} /> Download PDF Sheet
                  </button>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Operating Systems (CS502) CIA Gazette</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    100% completed internal assessment register signed by course evaluator.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => downloadDepartmentGazettePdf('Operating Systems (CS502) CIA Gazette')}>
                    <Download size={15} /> Download PDF Sheet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CLASS NOTES MODERATION (FEATURE 2) */}
          {activeTab === 'notes-moderation' && (
            <div>
              {toastMsg && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#0f172a', color: '#fff', padding: '12px 18px', borderRadius: '8px', zIndex: 9999 }}>
                  {toastMsg}
                </div>
              )}

              <div className="admin-view-header">
                <div>
                  <h2>Class Notes & Peer Material Moderation Desk</h2>
                  <p>Review student-uploaded handwritten notes, verify academic accuracy, and moderate reported content.</p>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Subject & Topic</th>
                        <th>Lecture Date</th>
                        <th>Uploaded By</th>
                        <th>Status</th>
                        <th>Reports</th>
                        <th style={{ textAlign: 'center' }}>View</th>
                        <th style={{ textAlign: 'right' }}>Faculty Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moderationNotesList.map((n) => (
                        <tr key={n.id}>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{n.topic}</strong>
                            <div style={{ fontSize: '0.78rem', color: '#4338ca', fontWeight: 600 }}>{n.subject}</div>
                          </td>
                          <td>{n.date}</td>
                          <td>
                            <div>{n.uploadedBy?.name}</div>
                            <small style={{ color: '#64748b' }}>Roll {n.uploadedBy?.rollNumber}</small>
                          </td>
                          <td>
                            {n.isFacultyVerified ? (
                              <span className="admin-badge approved">✓ Faculty Verified</span>
                            ) : n.status === 'HIDDEN' ? (
                              <span className="admin-badge inactive">Hidden</span>
                            ) : (
                              <span className="admin-badge pending">Student Uploaded</span>
                            )}
                          </td>
                          <td>
                            {n.reports?.length > 0 ? (
                              <span style={{ fontSize: '0.78rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                <Flag size={12} /> {n.reports.length} Reports
                              </span>
                            ) : (
                              <small style={{ color: '#94a3b8' }}>Clean</small>
                            )}
                          </td>
                          {/* VIEW COLUMN */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="admin-table-action-btn"
                              style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '6px', border: '1px solid #c7d2fe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => setViewingNote(n)}
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                          {/* FACULTY ACTIONS COLUMN */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              {!n.isFacultyVerified && (
                                <button
                                  type="button"
                                  className="admin-table-action-btn"
                                  style={{ background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '6px', border: '1px solid #86efac' }}
                                  onClick={() => handleVerifyNote(n.id)}
                                >
                                  <ShieldCheck size={14} /> Verify Note
                                </button>
                              )}
                              {n.status !== 'HIDDEN' && (
                                <button
                                  type="button"
                                  className="admin-table-action-btn"
                                  style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fca5a5' }}
                                  onClick={() => handleHideNote(n.id)}
                                >
                                  <Trash2 size={14} /> Hide Note
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: QUIZ MANAGEMENT */}
          {activeTab === 'quiz' && (
            <div>
              {/* Toast */}
              {toastMsg && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '10px', zIndex: 9999, fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  <CheckCircle2 size={16} color="#34d399" /> {toastMsg}
                </div>
              )}

              {/* Header */}
              <div className="admin-view-header">
                <div>
                  <h2>Quiz Management</h2>
                  <p>Create, schedule and manage multiple-choice quizzes for your students. Each quiz has 10 MCQ questions with answer keys.</p>
                </div>
                <button
                  className="admin-action-btn-primary"
                  onClick={() => { setShowAddQuiz(true); setQuizStep(1); setQuizFormError(''); }}
                >
                  <Plus size={15} /> Add Quiz
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Quizzes', val: quizList.length, color: '#3b82f6', bg: '#eff6ff' },
                  { label: 'Live Now', val: quizList.filter(q => q.status === 'Live').length, color: '#059669', bg: '#ecfdf5' },
                  { label: 'Scheduled', val: quizList.filter(q => q.status === 'Scheduled').length, color: '#d97706', bg: '#fffbeb' },
                  { label: 'Completed', val: quizList.filter(q => q.status === 'Completed').length, color: '#7c3aed', bg: '#f5f3ff' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: stat.bg, border: `1.5px solid ${stat.color}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.val}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quiz Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {quizList.map((quiz) => {
                  const statusStyles = {
                    'Live':      { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
                    'Scheduled': { bg: '#fef9c3', color: '#854d0e', dot: '#d97706' },
                    'Completed': { bg: '#f5f3ff', color: '#5b21b6', dot: '#7c3aed' },
                    'Draft':     { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
                  };
                  const ss = statusStyles[quiz.status] || statusStyles['Draft'];

                  return (
                    <div key={quiz.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow 0.2s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                    >
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{quiz.id} · {quiz.subject}</div>
                          <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.3 }}>{quiz.title}</h3>
                        </div>
                        <span style={{ flexShrink: 0, fontSize: '0.72rem', fontWeight: 700, background: ss.bg, color: ss.color, padding: '3px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px', marginLeft: '8px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ss.dot, display: 'inline-block' }} />
                          {quiz.status}
                        </span>
                      </div>

                      {/* Meta info */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="#94a3b8" />
                          <span>{quiz.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Timer size={13} color="#94a3b8" />
                          <span>{quiz.time} minutes</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users size={13} color="#94a3b8" />
                          <span>{quiz.section}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ClipboardList size={13} color="#94a3b8" />
                          <span>10 Questions · {quiz.totalMarks} Marks</span>
                        </div>
                      </div>

                      {/* Progress bar for attempts */}
                      {quiz.status !== 'Draft' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                            <span>Attempts</span>
                            <strong style={{ color: '#0f172a' }}>{quiz.attempts} students</strong>
                          </div>
                          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, (quiz.attempts / 91) * 100)}%`, background: quiz.status === 'Completed' ? '#7c3aed' : quiz.status === 'Live' ? '#16a34a' : '#f59e0b', borderRadius: '99px', transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          type="button"
                          style={{ flex: 1, padding: '6px 0', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                          onClick={() => setViewQuiz(quiz)}
                        >
                          <Eye size={13} /> View Questions
                        </button>
                        {quiz.status === 'Draft' && (
                          <button
                            type="button"
                            style={{ flex: 1, padding: '6px 0', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            onClick={() => {
                              setQuizList(prev => prev.map(q => q.id === quiz.id ? { ...q, status: 'Scheduled' } : q));
                              triggerToast('✓ Quiz scheduled successfully!');
                            }}
                          >
                            <CheckCircle2 size={13} /> Publish
                          </button>
                        )}
                        {quiz.status === 'Scheduled' && (
                          <button
                            type="button"
                            style={{ flex: 1, padding: '6px 0', background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            onClick={() => {
                              setQuizList(prev => prev.map(q => q.id === quiz.id ? { ...q, status: 'Live' } : q));
                              triggerToast('🔴 Quiz is now LIVE!');
                            }}
                          >
                            ● Go Live
                          </button>
                        )}
                        <button
                          type="button"
                          style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => {
                            setQuizList(prev => prev.filter(q => q.id !== quiz.id));
                            triggerToast('Quiz deleted.');
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {quizList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <ClipboardList size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <h3 style={{ color: '#64748b', margin: '0 0 8px' }}>No quizzes yet</h3>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>Click "Add Quiz" to create your first quiz.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>

    {/* ── NOTE VIEWER MODAL ── */}
    {viewingNote && (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        onClick={() => setViewingNote(null)}
      >
        <div
          style={{ background: '#ffffff', borderRadius: '18px', maxWidth: '680px', width: '100%', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={() => setViewingNote(null)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >×</button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', flexShrink: 0 }}>
              <FileText size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{viewingNote.subject}</div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', lineHeight: 1.3 }}>{viewingNote.topic}</h3>
              <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                Lecture Date: <strong>{viewingNote.date}</strong> &nbsp;·&nbsp;
                Uploaded by: <strong>{viewingNote.uploadedBy?.name}</strong>
                <span style={{ color: '#94a3b8', marginLeft: '4px' }}>(Roll {viewingNote.uploadedBy?.rollNumber})</span>
              </div>
            </div>
            {viewingNote.isFacultyVerified ? (
              <span style={{ flexShrink: 0, fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #86efac' }}>
                <ShieldCheck size={13} /> Verified
              </span>
            ) : (
              <span style={{ flexShrink: 0, fontSize: '0.75rem', background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, border: '1px solid #fde68a' }}>Pending</span>
            )}
          </div>

          {/* Note Content */}
          <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {viewingNote.fileType === 'application/pdf' ? (
              <div style={{ color: '#ffffff', padding: '20px' }}>
                <FileText size={56} style={{ color: '#818cf8', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 600 }}>{viewingNote.fileName || 'Class_Notes.pdf'}</div>
                <a
                  href={viewingNote.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', fontSize: '0.82rem', marginTop: '10px', display: 'inline-block' }}
                >
                  Open PDF in New Tab ↗
                </a>
              </div>
            ) : (
              <img
                src={viewingNote.fileUrl}
                alt={viewingNote.topic}
                style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '8px', display: 'block', margin: '0 auto' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {/* Description */}
          {viewingNote.description && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
              <strong style={{ display: 'block', marginBottom: '4px', color: '#0f172a' }}>Summary / Description</strong>
              {viewingNote.description}
            </div>
          )}

          {/* Reports alert */}
          {viewingNote.reports?.length > 0 && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Flag size={16} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.84rem', color: '#7f1d1d' }}>
                <strong>{viewingNote.reports.length} report(s) filed</strong> — Review content before verifying.
                {viewingNote.reports.map((r, i) => (
                  <div key={i} style={{ marginTop: '4px', fontSize: '0.78rem' }}>• {r.reason}</div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              style={{ padding: '8px 18px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setViewingNote(null)}
            >Close</button>
            {!viewingNote.isFacultyVerified && (
              <button
                type="button"
                style={{ padding: '8px 18px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={async () => {
                  await handleVerifyNote(viewingNote.id);
                  setViewingNote(null);
                }}
              >
                <ShieldCheck size={15} /> Verify This Note
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* ── ADD QUIZ MODAL ── */}
    {showAddQuiz && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}
        onClick={() => setShowAddQuiz(false)}
      >
        <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '820px', width: '100%', padding: '32px', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', position: 'relative', marginTop: '20px', marginBottom: '20px' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Modal close */}
          <button onClick={() => setShowAddQuiz(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>

          {/* Modal header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,#4338ca,#7c3aed)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>Create New Quiz</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Step {quizStep} of 2 — {quizStep === 1 ? 'Quiz Details & Settings' : '10 Multiple Choice Questions'}</p>
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '99px', background: s <= quizStep ? '#4338ca' : '#e2e8f0', transition: 'background 0.3s' }} />
            ))}
          </div>

          {/* Error banner */}
          {quizFormError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {quizFormError}
            </div>
          )}

          {/* STEP 1: Quiz Meta */}
          {quizStep === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Quiz Title <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
                    placeholder="e.g. Data Structures – Quiz 3: Trees & Graphs"
                    value={quizMeta.title}
                    onChange={e => setQuizMeta({ ...quizMeta, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Subject <span style={{ color: '#dc2626' }}>*</span></label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', boxSizing: 'border-box' }}
                    value={quizMeta.subject} onChange={e => setQuizMeta({ ...quizMeta, subject: e.target.value })}>
                    <option>Data Structures</option>
                    <option>Operating Systems</option>
                    <option>Computer Networks</option>
                    <option>Artificial Intelligence</option>
                    <option>Machine Learning</option>
                    <option>Compiler Design</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Section <span style={{ color: '#dc2626' }}>*</span></label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', boxSizing: 'border-box' }}
                    value={quizMeta.section} onChange={e => setQuizMeta({ ...quizMeta, section: e.target.value })}>
                    <option>Section A</option>
                    <option>Section B</option>
                    <option>Section C</option>
                    <option>All Sections</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Quiz Date <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="date" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={quizMeta.date} onChange={e => setQuizMeta({ ...quizMeta, date: e.target.value })} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Time Limit (minutes) <span style={{ color: '#dc2626' }}>*</span></label>
                  <input type="number" min={5} max={120} style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={quizMeta.time} onChange={e => setQuizMeta({ ...quizMeta, time: Number(e.target.value) })} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Total Marks</label>
                  <input type="number" min={1} max={100} style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={quizMeta.totalMarks} onChange={e => setQuizMeta({ ...quizMeta, totalMarks: Number(e.target.value) })} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Initial Status</label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', boxSizing: 'border-box' }}
                    value={quizMeta.status} onChange={e => setQuizMeta({ ...quizMeta, status: e.target.value })}>
                    <option value="Draft">Draft (save for later)</option>
                    <option value="Scheduled">Scheduled (publish on date)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  style={{ padding: '9px 22px', background: '#4338ca', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    if (!quizMeta.title.trim()) { setQuizFormError('Quiz title is required.'); return; }
                    if (!quizMeta.date) { setQuizFormError('Please set the quiz date.'); return; }
                    setQuizFormError(''); setQuizStep(2);
                  }}
                >
                  Next: Add Questions →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Questions Builder */}
          {quizStep === 2 && (
            <div>
              <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {quizQuestions.map((q, qi) => (
                  <div key={q.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    {/* Question number + question text */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ flexShrink: 0, width: '26px', height: '26px', background: '#4338ca', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, marginTop: '2px' }}>Q{qi + 1}</span>
                      <input
                        type="text"
                        style={{ flex: 1, padding: '7px 11px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                        placeholder={`Question ${qi + 1} — e.g. What is the time complexity of...`}
                        value={q.question}
                        onChange={e => updateQuestion(qi, 'question', e.target.value)}
                      />
                    </div>

                    {/* 4 Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginLeft: '36px' }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', border: q.correct === oi ? '2px solid #16a34a' : '2px solid #cbd5e1', background: q.correct === oi ? '#dcfce7' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800, color: q.correct === oi ? '#16a34a' : '#94a3b8', title: 'Mark as correct answer' }}
                            onClick={() => updateQuestion(qi, 'correct', oi)}
                          >
                            {String.fromCharCode(65 + oi)}
                          </label>
                          <input
                            type="text"
                            style={{ flex: 1, padding: '6px 10px', border: q.correct === oi ? '1.5px solid #86efac' : '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.82rem', background: q.correct === oi ? '#f0fdf4' : '#fff', outline: 'none' }}
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                            value={opt}
                            onChange={e => updateOption(qi, oi, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginLeft: '36px', marginTop: '6px', fontSize: '0.72rem', color: '#64748b' }}>
                      ✓ Click the circle letter to mark the correct answer
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #e2e8f0', marginTop: '14px' }}>
                <button type="button" style={{ padding: '9px 18px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => { setQuizStep(1); setQuizFormError(''); }}>
                  ← Back
                </button>
                <button type="button" style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#4338ca,#7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}
                  onClick={handleAddQuizSubmit}>
                  <CheckCircle2 size={16} /> Save Quiz
                </button>
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
                  🎓 Student Uploaded Documents (Section & Semester Registry)
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
                  🏛️ Campus Circulars &amp; Notices ({campusDocs.length})
                </button>
              </div>

              {docsViewMode === 'student_docs' ? (
                <StudentDocumentsTable portalRole="faculty" />
              ) : (() => {
                const catColor = { Academic: '#2563eb', Examination: '#dc2626', Training: '#d97706', Circular: '#7c3aed', Notice: '#059669', Other: '#475569' };
                const fileTypeColor = { PDF: '#dc2626', DOCX: '#2563eb', XLSX: '#16a34a', PPTX: '#d97706', JPG: '#9333ea', PNG: '#0891b2' };
                const filtered = campusDocs.filter(d =>
                  d.title.toLowerCase().includes(docsSearch.toLowerCase()) ||
                  (d.category || '').toLowerCase().includes(docsSearch.toLowerCase()) ||
                  (d.description || '').toLowerCase().includes(docsSearch.toLowerCase())
                );
                return (
                  <div>
                    <div className="admin-view-header">
                      <div>
                        <h2>Campus Documents</h2>
                        <p>Institutional documents shared with Faculty by the Administration. ({campusDocs.length} available)</p>
                      </div>
                    </div>

                    <div className="admin-search-wrap" style={{ marginBottom: '1.25rem', maxWidth: '480px' }}>
                      <Search size={15} style={{ color: '#94a3b8' }} />
                      <input
                        className="admin-search-input"
                        placeholder="Search documents…"
                        value={docsSearch}
                        onChange={e => setDocsSearch(e.target.value)}
                      />
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
        </div>
      </div>
    )}

    {/* ── VIEW QUIZ QUESTIONS MODAL ── */}
    {viewQuiz && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}
        onClick={() => setViewQuiz(null)}>
        <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '740px', width: '100%', padding: '30px', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', position: 'relative', marginTop: '20px', marginBottom: '20px' }}
          onClick={e => e.stopPropagation()}>
          <button onClick={() => setViewQuiz(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{viewQuiz.id} · {viewQuiz.subject} · {viewQuiz.section}</div>
            <h2 style={{ margin: '4px 0 6px', color: '#0f172a', fontSize: '1.3rem' }}>{viewQuiz.title}</h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#64748b' }}>
              <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{viewQuiz.date}</span>
              <span><Timer size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{viewQuiz.time} mins</span>
              <span><ClipboardList size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{viewQuiz.totalMarks} Marks</span>
            </div>
          </div>

          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {viewQuiz.questions.map((q, qi) => (
              <div key={q.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ flexShrink: 0, width: '24px', height: '24px', background: '#4338ca', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>Q{qi + 1}</span>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.4 }}>{q.question || <em style={{ color: '#94a3b8' }}>Question not set</em>}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginLeft: '34px' }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 10px', borderRadius: '8px', background: q.correct === oi ? '#dcfce7' : '#ffffff', border: q.correct === oi ? '1.5px solid #86efac' : '1px solid #e2e8f0', fontSize: '0.83rem', color: q.correct === oi ? '#15803d' : '#334155', fontWeight: q.correct === oi ? 700 : 400 }}>
                      <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: q.correct === oi ? '#16a34a' : '#e2e8f0', color: q.correct === oi ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{String.fromCharCode(65 + oi)}</span>
                      {opt || <em style={{ color: '#cbd5e1' }}>Empty</em>}
                      {q.correct === oi && <CheckCircle2 size={13} color="#16a34a" style={{ marginLeft: 'auto' }} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right', paddingTop: '16px', borderTop: '1px solid #e2e8f0', marginTop: '16px' }}>
            <button type="button" style={{ padding: '9px 22px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setViewQuiz(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
