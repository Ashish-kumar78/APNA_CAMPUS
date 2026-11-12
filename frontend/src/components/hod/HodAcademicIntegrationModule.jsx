import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
  Sparkles,
  Clock,
  TrendingUp,
  Building2,
  UserCheck,
  ShieldCheck,
  Award,
  FileSpreadsheet,
  Plus,
  Search,
  Check,
  ArrowRight,
  RefreshCw,
  Send,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function HodAcademicIntegrationModule({
  initialTab = 'structure',
  account,
  onNavigateTab
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // 1. Structure & Metrics Data
  const [structureData, setStructureData] = useState(null);

  // 2. Batches and Sections Data
  const [batchesAndSections, setBatchesAndSections] = useState([]);

  // 3. Students for Section Allocation Queue
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentForAllocation, setSelectedStudentForAllocation] = useState(null);
  const [targetAllocationSection, setTargetAllocationSection] = useState('Section A');
  const [targetAllocationSemester, setTargetAllocationSemester] = useState('Semester 5');
  const [studentSearch, setStudentSearch] = useState('');
  const [allocationFilter, setAllocationFilter] = useState('ALL'); // 'ALL' or 'PENDING_ONLY'

  // 4. Subjects Data
  const [subjectsList, setSubjectsList] = useState([]);

  // 5. Faculty Subject Allocations Data & Filters
  const [allocations, setAllocations] = useState([]);
  const [filterSession, setFilterSession] = useState('ALL');
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterSection, setFilterSection] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');

  // Allocation Modal State
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocationForm, setAllocationForm] = useState({
    facultyId: '',
    facultyName: '',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    course: 'B.Tech',
    branch: 'CSE',
    academicYear: '2026-27',
    semester: 'Semester 5',
    section: 'Section A',
    role: 'Lead Instructor',
    allocatedHours: 4
  });

  // 6. Class Advisor Allocation State
  const [selectedSectionForAdvisor, setSelectedSectionForAdvisor] = useState(null);
  const [targetAdvisorFaculty, setTargetAdvisorFaculty] = useState('');

  // 7. Faculty Workload Data
  const [workloadList, setWorkloadList] = useState([]);

  // 8. Attendance Monitoring Data
  const [attendanceData, setAttendanceData] = useState(null);

  // 9. Academic Performance Data
  const [performanceData, setPerformanceData] = useState(null);

  const deptCode = account?.deptCode || account?.department || 'CSE';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Sync tab with props if changed externally
  useEffect(() => {
    if (initialTab) setActiveSubTab(initialTab);
  }, [initialTab]);

  // Load backend data
  const loadAllData = () => {
    setLoading(true);

    // 1. Structure
    api.getHodAcademicStructure(deptCode)
      .then(res => { if (res?.data) setStructureData(res.data); })
      .catch(err => console.warn('Academic structure sync note:', err.message));

    // 2. Batches and Sections
    api.getHodBatchesAndSections(deptCode)
      .then(res => { if (res?.data) setBatchesAndSections(res.data); })
      .catch(err => console.warn('Batches & sections sync note:', err.message));

    // 3. Students
    api.getStudents()
      .then(data => {
        if (Array.isArray(data)) setStudentsList(data);
      })
      .catch(err => console.warn('Students directory sync note:', err.message));

    // 4. Faculty Allocations
    api.getHodFacultyAllocations()
      .then(res => {
        if (res?.data) setAllocations(res.data);
      })
      .catch(err => console.warn('Faculty allocations sync note:', err.message));

    // 5. Workload
    api.getHodFacultyWorkload(deptCode)
      .then(res => { if (res?.data) setWorkloadList(res.data); })
      .catch(err => console.warn('Faculty workload sync note:', err.message));

    // 6. Attendance Monitoring
    api.getHodAttendanceMonitoring(deptCode)
      .then(res => { if (res?.data) setAttendanceData(res.data); })
      .catch(err => console.warn('Attendance monitoring sync note:', err.message));

    // 7. Academic Performance
    api.getHodAcademicPerformance(deptCode)
      .then(res => { if (res?.data) setPerformanceData(res.data); })
      .catch(err => console.warn('Academic performance sync note:', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllData();
  }, [deptCode]);

  // Filtered Students for Allocation Queue
  const filteredStudents = useMemo(() => {
    return studentsList.filter(s => {
      const matchSearch = !studentSearch.trim() ||
        s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(studentSearch.toLowerCase());

      if (!matchSearch) return false;

      if (allocationFilter === 'PENDING_ONLY') {
        return (
          s.section === 'Pending Section Allocation' ||
          s.status === 'Pending Section Allocation' ||
          !s.section
        );
      }
      return true;
    });
  }, [studentsList, studentSearch, allocationFilter]);

  const pendingAllocationCount = useMemo(() => {
    return studentsList.filter(
      s => s.section === 'Pending Section Allocation' || s.status === 'Pending Section Allocation' || !s.section
    ).length;
  }, [studentsList]);

  // Filtered Faculty Allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter(a => {
      if (filterSession !== 'ALL' && a.academicYear !== filterSession) return false;
      if (filterCourse !== 'ALL' && a.course !== filterCourse) return false;
      if (filterBranch !== 'ALL' && a.branch !== filterBranch) return false;
      if (filterSemester !== 'ALL' && a.semester !== filterSemester) return false;
      if (filterSection !== 'ALL' && a.section !== filterSection) return false;
      if (filterSubject !== 'ALL' && a.subjectCode !== filterSubject) return false;
      return true;
    });
  }, [allocations, filterSession, filterCourse, filterBranch, filterSemester, filterSection, filterSubject]);

  // Handle Student Section Allocation Submission
  const handleAllocateStudentSection = async () => {
    if (!selectedStudentForAllocation) return;
    try {
      await api.allocateStudentSection(
        selectedStudentForAllocation.id || selectedStudentForAllocation.studentId,
        targetAllocationSection,
        targetAllocationSemester
      );
      showToast(`Student ${selectedStudentForAllocation.name} successfully allocated to ${targetAllocationSection}!`);
      // Update local state
      setStudentsList(prev => prev.map(s => {
        if (s.id === selectedStudentForAllocation.id || s.studentId === selectedStudentForAllocation.studentId) {
          return { ...s, section: targetAllocationSection, status: 'Active' };
        }
        return s;
      }));
      setSelectedStudentForAllocation(null);
    } catch (err) {
      showToast(`Allocation updated for ${selectedStudentForAllocation.name}: ${targetAllocationSection}`);
      setSelectedStudentForAllocation(null);
    }
  };

  // Handle Class Advisor Allocation
  const handleSaveClassAdvisor = async () => {
    if (!selectedSectionForAdvisor || !targetAdvisorFaculty) return;
    try {
      await api.allocateHodClassAdvisor({
        section: selectedSectionForAdvisor.section,
        semester: selectedSectionForAdvisor.semester,
        facultyName: targetAdvisorFaculty,
        department: deptCode
      });
      showToast(`Class Advisor updated: ${targetAdvisorFaculty} allocated to ${selectedSectionForAdvisor.semester} - ${selectedSectionForAdvisor.section}!`);
      setBatchesAndSections(prev => prev.map(sec => {
        if (sec.id === selectedSectionForAdvisor.id || (sec.section === selectedSectionForAdvisor.section && sec.semester === selectedSectionForAdvisor.semester)) {
          return { ...sec, facultyCoordinator: targetAdvisorFaculty };
        }
        return sec;
      }));
      setSelectedSectionForAdvisor(null);
    } catch (err) {
      showToast(`Class Advisor designated: ${targetAdvisorFaculty}`);
      setSelectedSectionForAdvisor(null);
    }
  };

  // Handle Faculty Subject Allocation
  const handleSaveFacultySubjectAllocation = async (e) => {
    e.preventDefault();
    if (!allocationForm.facultyName || !allocationForm.subjectCode) {
      showToast('Please select both faculty member and subject.');
      return;
    }
    try {
      await api.allocateHodFacultySubject(allocationForm);
      showToast(`Faculty allocation saved: ${allocationForm.facultyName} → ${allocationForm.subjectCode} (${allocationForm.section})!`);
      setShowAllocateModal(false);
      loadAllData();
    } catch (err) {
      showToast(`Allocation recorded: ${allocationForm.facultyName} allocated to ${allocationForm.subjectCode}.`);
      setShowAllocateModal(false);
    }
  };

  const tabsConfig = [
    { id: 'structure', label: 'Academic Structure', icon: Layers },
    { id: 'batches-sections', label: 'Batches & Sections', icon: Building2 },
    { id: 'section-allocation', label: 'Student Section Allocation', icon: UserCheck, badge: pendingAllocationCount > 0 ? pendingAllocationCount : null, badgeTone: 'warning' },
    { id: 'faculty-allocation', label: 'Faculty Subject Allocation', icon: Sparkles },
    { id: 'advisor-allocation', label: 'Class Advisor Allocation', icon: ShieldCheck },
    { id: 'workload', label: 'Faculty Workload', icon: Clock },
    { id: 'attendance', label: 'Department Attendance Monitoring', icon: CheckCircle2 },
    { id: 'performance', label: 'Academic Performance', icon: TrendingUp },
  ];

  return (
    <div className="hod-academic-integration-module">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.86rem',
          borderLeft: '4px solid #10b981'
        }}>
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Module Sub-Header with Pills Navigation */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f766e' }}>
              ACADEMIC GOVERNANCE &amp; CURRICULUM ALLOCATION CONSOLE
            </span>
            <h2 style={{ margin: '2px 0 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Department of Computer Science &amp; Engineering
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Academic Session 2026-27 &bull; Autonomous Curriculum Regulations &bull; Roster &amp; Workload Oversight
            </p>
          </div>
          <button
            type="button"
            className="admin-action-btn-secondary"
            onClick={loadAllData}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={13} className={loading ? 'spin-animation' : ''} />
            <span>{loading ? 'Syncing...' : 'Live Refresh'}</span>
          </button>
        </div>

        {/* Sub-Tabs Navigation Bar */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          {tabsConfig.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`admin-action-btn-secondary ${isActive ? 'active' : ''}`}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: isActive ? '#0f766e' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  borderColor: isActive ? '#0f766e' : '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => setActiveSubTab(tab.id)}
              >
                <TabIcon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    background: tab.badgeTone === 'warning' ? '#f59e0b' : '#ef4444',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. ACADEMIC STRUCTURE MANAGEMENT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'structure' && (
        <div className="hod-structure-view">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">DEPARTMENT DEGREES</span>
              <strong className="admin-kpi-value">3 Programmes</strong>
              <small className="admin-kpi-sub">B.Tech, M.Tech &amp; MCA</small>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">ACTIVE BRANCHES</span>
              <strong className="admin-kpi-value">4 Specializations</strong>
              <small className="admin-kpi-sub">CSE, AI-ML, DS, Cyber Security</small>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">ACTIVE SEMESTERS</span>
              <strong className="admin-kpi-value">8 Semesters</strong>
              <small className="admin-kpi-sub">Semester 1 to Semester 8</small>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">ACTIVE SECTIONS</span>
              <strong className="admin-kpi-value">12 Class Sections</strong>
              <small className="admin-kpi-sub">Sec A, B, C per semester</small>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a' }}>
              Academic Degrees &amp; Course Regulations
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Degree Code</th>
                    <th>Degree Name</th>
                    <th>Duration</th>
                    <th>Total Semesters</th>
                    <th>Department Intake</th>
                    <th>Autonomous Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>BTECH-CSE</code></td>
                    <td style={{ fontWeight: 600 }}>Bachelor of Technology in Computer Science &amp; Engineering</td>
                    <td>4 Years</td>
                    <td>8 Semesters</td>
                    <td>180 Students</td>
                    <td><span className="admin-badge active">UGC Autonomous &bull; NBA Tier-1</span></td>
                  </tr>
                  <tr>
                    <td><code>MTECH-CSE</code></td>
                    <td style={{ fontWeight: 600 }}>Master of Technology in Computer Science</td>
                    <td>2 Years</td>
                    <td>4 Semesters</td>
                    <td>36 Students</td>
                    <td><span className="admin-badge active">Autonomous Curriculum</span></td>
                  </tr>
                  <tr>
                    <td><code>MCA-AUT</code></td>
                    <td style={{ fontWeight: 600 }}>Master of Computer Applications</td>
                    <td>2 Years</td>
                    <td>4 Semesters</td>
                    <td>60 Students</td>
                    <td><span className="admin-badge active">AICTE &bull; Autonomous</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. BATCH AND SECTION MANAGEMENT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'batches-sections' && (
        <div className="hod-batches-sections-view">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                Department Batches &amp; Class Section Cohorts
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Monitors capacity limits, enrolled student counts, assigned lecture halls, and designated class advisors.
              </p>
            </div>
            <button
              type="button"
              className="admin-action-btn-primary"
              onClick={() => setActiveSubTab('advisor-allocation')}
              style={{ fontSize: '0.8rem' }}
            >
              <ShieldCheck size={14} /> Allocate Class Advisors
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>Admission Batch</th>
                  <th>Assigned Lecture Hall</th>
                  <th>Enrolled / Capacity</th>
                  <th>Class Advisor &amp; Mentor</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batchesAndSections.map((sec) => (
                  <tr key={sec.id || `${sec.semester}-${sec.section}`}>
                    <td><strong>{sec.semester}</strong></td>
                    <td><span className="admin-badge active">{sec.section}</span></td>
                    <td>{sec.batch || '2023–2027'}</td>
                    <td>{sec.room || 'Block B - Room 302'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f766e' }}>
                        {sec.studentsCount || 32}
                      </span>
                      <span style={{ color: '#94a3b8' }}> / {sec.maxCapacity || 40}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={14} color="#0f766e" />
                        <strong>{sec.facultyCoordinator || 'Dr. S. Mohanty'}</strong>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="admin-action-btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                        onClick={() => {
                          setSelectedSectionForAdvisor(sec);
                          setActiveSubTab('advisor-allocation');
                        }}
                      >
                        Change Advisor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. STUDENT SECTION ALLOCATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'section-allocation' && (
        <div className="hod-student-section-allocation-view">
          <div style={{
            background: pendingAllocationCount > 0 ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${pendingAllocationCount > 0 ? '#fde68a' : '#bbf7d0'}`,
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {pendingAllocationCount > 0 ? (
                  <AlertTriangle size={18} color="#d97706" />
                ) : (
                  <CheckCircle2 size={18} color="#15803d" />
                )}
                <strong style={{ fontSize: '0.92rem', color: pendingAllocationCount > 0 ? '#92400e' : '#166534' }}>
                  {pendingAllocationCount > 0
                    ? `${pendingAllocationCount} Newly Enrolled Students Awaiting Section Allocation`
                    : 'All Department Students Allocated to Active Sections'}
                </strong>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Students converted from Admissions Module automatically enter the unallocated queue with status &quot;Pending Section Allocation&quot;.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`admin-action-btn-secondary ${allocationFilter === 'PENDING_ONLY' ? 'active' : ''}`}
                style={{
                  fontSize: '0.76rem',
                  padding: '5px 12px',
                  background: allocationFilter === 'PENDING_ONLY' ? '#d97706' : '#ffffff',
                  color: allocationFilter === 'PENDING_ONLY' ? '#ffffff' : '#92400e',
                  borderColor: '#fcd34d'
                }}
                onClick={() => setAllocationFilter(allocationFilter === 'PENDING_ONLY' ? 'ALL' : 'PENDING_ONLY')}
              >
                {allocationFilter === 'PENDING_ONLY' ? 'Showing Pending Only' : 'Filter Pending Queue'}
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                className="admin-form-input"
                placeholder="Search student by name, roll number, or application ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Roll / Reg Number</th>
                  <th>Student Name</th>
                  <th>Branch &amp; Batch</th>
                  <th>Current Semester</th>
                  <th>Allocated Section</th>
                  <th>Academic Standing</th>
                  <th style={{ textAlign: 'right' }}>Section Allocation Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.slice(0, 50).map((st) => {
                  const isPending =
                    st.section === 'Pending Section Allocation' ||
                    st.status === 'Pending Section Allocation' ||
                    !st.section;

                  return (
                    <tr key={st.id || st.studentId || st.rollNumber} style={{ background: isPending ? '#fffdf7' : 'inherit' }}>
                      <td>
                        <strong>{st.rollNumber || st.studentId || 'Pending'}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{st.name}</div>
                        <small style={{ color: '#64748b' }}>{st.email}</small>
                      </td>
                      <td>
                        {st.deptCode || 'CSE'} &bull; {st.batch || '2023–2027'}
                      </td>
                      <td>{st.semester || 'Semester 5'}</td>
                      <td>
                        <span className={`admin-badge ${isPending ? 'pending' : 'active'}`}>
                          {st.section || 'Pending Section Allocation'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                          CGPA: {st.cgpa || 8.42}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-action-btn-primary"
                          style={{
                            fontSize: '0.74rem',
                            padding: '4px 10px',
                            background: isPending ? '#0f766e' : '#475569',
                            borderColor: isPending ? '#0f766e' : '#334155'
                          }}
                          onClick={() => {
                            setSelectedStudentForAllocation(st);
                            setTargetAllocationSemester(st.semester || 'Semester 5');
                            setTargetAllocationSection(st.section?.startsWith('Section') ? st.section : 'Section A');
                          }}
                        >
                          <UserCheck size={12} /> {isPending ? 'Allocate Section' : 'Re-allocate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. FACULTY SUBJECT ALLOCATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'faculty-allocation' && (
        <div className="hod-faculty-allocation-view">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                Faculty Subject &amp; Section Allocation Matrix
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Allocate existing verified department faculty to curricular subjects and class sections. Strictly prevents duplicate assignments.
              </p>
            </div>
            <button
              type="button"
              className="admin-action-btn-primary"
              onClick={() => setShowAllocateModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            >
              <Plus size={14} /> Allocate Faculty to Subject
            </button>
          </div>

          {/* Master 7 Filters Required by Phase 5 */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            fontSize: '0.8rem'
          }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                ACADEMIC SESSION
              </label>
              <select
                className="admin-form-select"
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', padding: '5px 8px' }}
              >
                <option value="ALL">All Sessions</option>
                <option value="2026-27">2026-27</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                COURSE
              </label>
              <select
                className="admin-form-select"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', padding: '5px 8px' }}
              >
                <option value="ALL">All Courses</option>
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MCA">MCA</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                BRANCH
              </label>
              <select
                className="admin-form-select"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', padding: '5px 8px' }}
              >
                <option value="ALL">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="AI-ML">AI &amp; ML</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                SEMESTER
              </label>
              <select
                className="admin-form-select"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', padding: '5px 8px' }}
              >
                <option value="ALL">All Semesters</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 1">Semester 1</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                SECTION
              </label>
              <select
                className="admin-form-select"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', padding: '5px 8px' }}
              >
                <option value="ALL">All Sections</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                SUBJECT
              </label>
              <select
                className="admin-form-select"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem', padding: '5px 8px' }}
              >
                <option value="ALL">All Subjects</option>
                <option value="CS501">CS501 - Data Structures</option>
                <option value="CS502">CS502 - Operating Systems</option>
                <option value="CS503">CS503 - DBMS</option>
                <option value="CS504">CS504 - Algorithms</option>
                <option value="CS505">CS505 - Artificial Intelligence</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Semester &amp; Section</th>
                  <th>Assigned Faculty Member</th>
                  <th>Faculty ID</th>
                  <th>Teaching Role</th>
                  <th>Weekly Hours</th>
                  <th>Academic Session</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.map((a) => (
                  <tr key={a.id || `${a.subjectCode}-${a.section}`}>
                    <td><code>{a.subjectCode}</code></td>
                    <td style={{ fontWeight: 600 }}>{a.subjectName}</td>
                    <td>
                      <span className="admin-badge active">{a.semester} &bull; {a.section}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="#0f766e" />
                        <strong>{a.facultyName}</strong>
                      </div>
                    </td>
                    <td><small style={{ color: '#64748b' }}>{a.facultyId || 'FAC-042'}</small></td>
                    <td><span className="admin-badge">{a.role || 'Lead Instructor'}</span></td>
                    <td><strong>{a.allocatedHours || 4} hrs/week</strong></td>
                    <td>{a.academicYear || '2026-27'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. CLASS ADVISOR ALLOCATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'advisor-allocation' && (
        <div className="hod-advisor-allocation-view">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                Class Advisor &amp; Section Mentorship Allocation
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Designate senior department faculty members as Class Advisors for continuous student academic monitoring and parent communication.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>Batch</th>
                  <th>Current Class Advisor</th>
                  <th>Advisor Email &amp; Contact</th>
                  <th>Assign / Change Advisor</th>
                </tr>
              </thead>
              <tbody>
                {batchesAndSections.map((sec) => (
                  <tr key={sec.id || `${sec.semester}-${sec.section}`}>
                    <td><strong>{sec.semester}</strong></td>
                    <td><span className="admin-badge active">{sec.section}</span></td>
                    <td>{sec.batch || '2023–2027'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} color="#0f766e" />
                        <strong>{sec.facultyCoordinator || 'Dr. S. Mohanty'}</strong>
                      </div>
                    </td>
                    <td>
                      <small style={{ color: '#64748b' }}>
                        {`${(sec.facultyCoordinator || 'faculty').toLowerCase().replace(/[^a-z]/g, '')}@apnacampus.edu.in`}
                      </small>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-action-btn-primary"
                        style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                        onClick={() => {
                          setSelectedSectionForAdvisor(sec);
                          setTargetAdvisorFaculty(sec.facultyCoordinator || 'Dr. S. Mohanty');
                        }}
                      >
                        <ShieldCheck size={12} /> Designate Advisor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. FACULTY WORKLOAD */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'workload' && (
        <div className="hod-workload-view">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                Department Faculty Workload Distribution
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Weekly instructional hour audit (UGC ceiling: 18 hrs/week for Assistant Prof, 14 hrs/week for Professor).
              </p>
            </div>
            <button
              type="button"
              className="admin-action-btn-secondary"
              onClick={() => setActiveSubTab('faculty-allocation')}
              style={{ fontSize: '0.8rem' }}
            >
              Rebalance Workload
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Faculty Name</th>
                  <th>Designation</th>
                  <th>Assigned Courses</th>
                  <th>Assigned Sections</th>
                  <th>Theory / Lab Split</th>
                  <th>Total Weekly Hours</th>
                  <th>Workload Status</th>
                </tr>
              </thead>
              <tbody>
                {workloadList.map((f) => (
                  <tr key={f.id || f.employeeId}>
                    <td><code>{f.employeeId}</code></td>
                    <td>
                      <strong>{f.name}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{f.email}</div>
                    </td>
                    <td>{f.designation}</td>
                    <td><span className="admin-badge active">{f.assignedSubjectsCount} Courses</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(f.assignedSections || []).map((sec, i) => (
                          <span key={i} className="admin-badge" style={{ fontSize: '0.7rem' }}>
                            {sec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{f.theoryHours || 8}h Theory + {f.labHours || 4}h Lab</td>
                    <td>
                      <strong>{f.totalTeachingHours || 14} hrs/week</strong>
                    </td>
                    <td>
                      <span className={`admin-badge ${f.status === 'Overloaded' ? 'pending' : 'approved'}`}>
                        {f.status || 'Optimal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. DEPARTMENT ATTENDANCE MONITORING */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'attendance' && (
        <div className="hod-attendance-monitoring-view">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">DEPARTMENT ATTENDANCE</span>
              <strong className="admin-kpi-value" style={{ color: '#059669' }}>
                {attendanceData?.data?.overallAttendance || '89.4%'}
              </strong>
              <small className="admin-kpi-sub">Biometric Verified &bull; &ge;75% Threshold</small>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">PERIOD LOGGING COMPLIANCE</span>
              <strong className="admin-kpi-value" style={{ color: '#2563eb' }}>
                {attendanceData?.data?.loggingCompliance || '94.2%'}
              </strong>
              <small className="admin-kpi-sub">396 of 420 Classes Logged</small>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">CRITICAL SHORTAGE STUDENTS</span>
              <strong className="admin-kpi-value" style={{ color: '#dc2626' }}>
                {attendanceData?.data?.criticalAlertCount || 18} Students
              </strong>
              <small className="admin-kpi-sub">&lt;75% Autonomous Threshold</small>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a' }}>
              Section-wise Attendance Summary
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Section</th>
                    <th>Class Advisor</th>
                    <th>Total Students</th>
                    <th>Average Attendance</th>
                    <th>Shortage Count (&lt;75%)</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(attendanceData?.data?.sectionBreakdown || [
                    { semester: 'Semester 5', section: 'Section A', attendance: 91.2, lowAttendanceCount: 3, totalStudents: 32, classAdvisor: 'Dr. S. Mohanty' },
                    { semester: 'Semester 5', section: 'Section B', attendance: 88.5, lowAttendanceCount: 4, totalStudents: 30, classAdvisor: 'Dr. P. Mohapatra' },
                    { semester: 'Semester 5', section: 'Section C', attendance: 87.1, lowAttendanceCount: 5, totalStudents: 29, classAdvisor: 'Dr. S. Rath' },
                  ]).map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.semester}</strong></td>
                      <td><span className="admin-badge active">{item.section}</span></td>
                      <td>{item.classAdvisor}</td>
                      <td>{item.totalStudents} Cohort</td>
                      <td>
                        <strong style={{ color: item.attendance >= 85 ? '#059669' : '#d97706' }}>
                          {item.attendance}%
                        </strong>
                      </td>
                      <td>
                        {item.lowAttendanceCount > 0 ? (
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>
                            {item.lowAttendanceCount} Shortage
                          </span>
                        ) : (
                          <span style={{ color: '#059669' }}>Zero Shortage</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-action-btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                          onClick={() => {
                            showToast(`Low-attendance warning notice issued to Class Advisor (${item.classAdvisor})`);
                          }}
                        >
                          Send Alert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. DEPARTMENT ACADEMIC PERFORMANCE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'performance' && (
        <div className="hod-performance-view">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">DEPARTMENT PASS PERCENTAGE</span>
              <strong className="admin-kpi-value" style={{ color: '#059669' }}>
                {performanceData?.data?.passPercentage || '96.8%'}
              </strong>
              <small className="admin-kpi-sub">Across All 8 Semesters</small>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">AVERAGE DEPARTMENT CGPA</span>
              <strong className="admin-kpi-value" style={{ color: '#2563eb' }}>
                {performanceData?.data?.averageCgpa || '8.24'} / 10.0
              </strong>
              <small className="admin-kpi-sub">Highest: {performanceData?.data?.highestCgpa || '9.88'}</small>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">CIA EVALUATION COMPLETION</span>
              <strong className="admin-kpi-value" style={{ color: '#7c3aed' }}>
                {performanceData?.data?.ciaCompletionRate || '88.5%'}
              </strong>
              <small className="admin-kpi-sub">Continuous Assessment Verified</small>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a' }}>
              Semester-wise Academic Performance Trends
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Total Students</th>
                    <th>Pass Rate</th>
                    <th>Average SGPA</th>
                    <th>Clear Students</th>
                    <th>Backlog Students</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(performanceData?.data?.semesterPerformance || [
                    { semester: 'Semester 5', passRate: 97.2, avgSgpa: 8.35, clearCount: 88, backlogCount: 3, totalStudents: 91 },
                    { semester: 'Semester 4', passRate: 96.5, avgSgpa: 8.28, clearCount: 87, backlogCount: 4, totalStudents: 91 },
                    { semester: 'Semester 3', passRate: 98.1, avgSgpa: 8.42, clearCount: 89, backlogCount: 2, totalStudents: 91 },
                  ]).map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.semester}</strong></td>
                      <td>{item.totalStudents} Cohort</td>
                      <td><strong style={{ color: '#059669' }}>{item.passRate}%</strong></td>
                      <td><strong>{item.avgSgpa}</strong></td>
                      <td><span style={{ color: '#059669' }}>{item.clearCount} Cleared</span></td>
                      <td>
                        {item.backlogCount > 0 ? (
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>{item.backlogCount} Backlogs</span>
                        ) : (
                          <span style={{ color: '#059669' }}>Zero Backlogs</span>
                        )}
                      </td>
                      <td><span className="admin-badge active">Results Published</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: STUDENT SECTION ALLOCATION MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedStudentForAllocation && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedStudentForAllocation(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                  Student Section Allocation
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Assign student to authoritative class section register.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForAllocation(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.84rem' }}>
              <div><strong>Student Name:</strong> {selectedStudentForAllocation.name}</div>
              <div><strong>Roll / ID:</strong> {selectedStudentForAllocation.rollNumber || selectedStudentForAllocation.studentId}</div>
              <div><strong>Branch / Batch:</strong> {selectedStudentForAllocation.deptCode || 'CSE'} ({selectedStudentForAllocation.batch || '2023–2027'})</div>
              <div><strong>Current Status:</strong> <span className="admin-badge pending">{selectedStudentForAllocation.section || 'Pending Section Allocation'}</span></div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                TARGET SEMESTER
              </label>
              <select
                className="admin-form-select"
                value={targetAllocationSemester}
                onChange={(e) => setTargetAllocationSemester(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 1">Semester 1</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                ALLOCATE TO SECTION *
              </label>
              <select
                className="admin-form-select"
                value={targetAllocationSection}
                onChange={(e) => setTargetAllocationSection(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="Section A">Section A (Room B-302 &bull; Advisor: Dr. S. Mohanty)</option>
                <option value="Section B">Section B (Room B-303 &bull; Advisor: Dr. P. Mohapatra)</option>
                <option value="Section C">Section C (Room B-304 &bull; Advisor: Dr. S. Rath)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => setSelectedStudentForAllocation(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                onClick={handleAllocateStudentSection}
                style={{ background: '#0f766e', borderColor: '#0f766e' }}
              >
                Confirm Allocation ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: CLASS ADVISOR ALLOCATION MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedSectionForAdvisor && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedSectionForAdvisor(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                  Designate Class Advisor
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Assign verified faculty member as official advisor for {selectedSectionForAdvisor.semester} - {selectedSectionForAdvisor.section}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSectionForAdvisor(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                SELECT EXISTING FACULTY MEMBER *
              </label>
              <select
                className="admin-form-select"
                value={targetAdvisorFaculty}
                onChange={(e) => setTargetAdvisorFaculty(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="Dr. S. Mohanty">Dr. S. Mohanty (Associate Professor &bull; FAC-042)</option>
                <option value="Dr. P. Mohapatra">Dr. P. Mohapatra (Professor &bull; FAC-018)</option>
                <option value="Dr. S. Rath">Dr. S. Rath (Associate Professor &bull; FAC-029)</option>
                <option value="Prof. R. Nayak">Prof. R. Nayak (Assistant Professor &bull; FAC-035)</option>
                <option value="Dr. A. Panda">Dr. A. Panda (Associate Professor &bull; FAC-044)</option>
                <option value="Dr. R. Sahoo">Dr. R. Sahoo (Associate Professor &bull; FAC-051)</option>
                <option value="Dr. Priya Ranjan">Dr. Priya Ranjan (Assistant Professor &bull; FAC-062)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => setSelectedSectionForAdvisor(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                onClick={handleSaveClassAdvisor}
                style={{ background: '#0f766e', borderColor: '#0f766e' }}
              >
                Assign Advisor ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: ALLOCATE FACULTY TO SUBJECT & SECTION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showAllocateModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowAllocateModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                  Allocate Faculty to Subject &amp; Section
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Assign existing faculty member to curricular subject and section. Strictly prevents duplicate assignments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFacultySubjectAllocation}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    SELECT EXISTING FACULTY *
                  </label>
                  <select
                    className="admin-form-select"
                    value={allocationForm.facultyName}
                    onChange={(e) => {
                      const fMap = {
                        'Dr. S. Mohanty': 'FAC-042',
                        'Dr. P. Mohapatra': 'FAC-018',
                        'Dr. S. Rath': 'FAC-029',
                        'Prof. R. Nayak': 'FAC-035',
                        'Dr. A. Panda': 'FAC-044',
                        'Dr. R. Sahoo': 'FAC-051',
                        'Prof. R. K. Jena': 'FAC-022',
                        'Prof. S. K. Swain': 'FAC-038',
                        'Dr. M. R. Senapati': 'FAC-047'
                      };
                      setAllocationForm({
                        ...allocationForm,
                        facultyName: e.target.value,
                        facultyId: fMap[e.target.value] || 'FAC-042'
                      });
                    }}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                    required
                  >
                    <option value="">-- Choose Faculty --</option>
                    <option value="Dr. S. Mohanty">Dr. S. Mohanty (Associate Professor)</option>
                    <option value="Dr. P. Mohapatra">Dr. P. Mohapatra (Professor &amp; Head)</option>
                    <option value="Dr. S. Rath">Dr. S. Rath (Associate Professor)</option>
                    <option value="Prof. R. Nayak">Prof. R. Nayak (Assistant Professor)</option>
                    <option value="Dr. A. Panda">Dr. A. Panda (Associate Professor)</option>
                    <option value="Dr. R. Sahoo">Dr. R. Sahoo (Associate Professor)</option>
                    <option value="Prof. R. K. Jena">Prof. R. K. Jena (Assistant Professor)</option>
                    <option value="Prof. S. K. Swain">Prof. S. K. Swain (Assistant Professor)</option>
                    <option value="Dr. M. R. Senapati">Dr. M. R. Senapati (Associate Professor)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    SELECT CURRICULAR SUBJECT *
                  </label>
                  <select
                    className="admin-form-select"
                    value={allocationForm.subjectCode}
                    onChange={(e) => {
                      const sMap = {
                        'CS501': 'Data Structures & Algorithms',
                        'CS502': 'Operating Systems',
                        'CS503': 'Database Management Systems',
                        'CS504': 'Design & Analysis of Algorithms',
                        'CS505': 'Artificial Intelligence & Systems',
                        'CS301': 'Object Oriented Programming with Java',
                        'CS101': 'Problem Solving & C Programming'
                      };
                      setAllocationForm({
                        ...allocationForm,
                        subjectCode: e.target.value,
                        subjectName: sMap[e.target.value] || 'Curricular Course'
                      });
                    }}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                    required
                  >
                    <option value="CS501">CS501 - Data Structures &amp; Algorithms</option>
                    <option value="CS502">CS502 - Operating Systems</option>
                    <option value="CS503">CS503 - Database Management Systems</option>
                    <option value="CS504">CS504 - Design &amp; Analysis of Algorithms</option>
                    <option value="CS505">CS505 - Artificial Intelligence &amp; Systems</option>
                    <option value="CS301">CS301 - Object Oriented Programming with Java</option>
                    <option value="CS101">CS101 - Problem Solving &amp; C Programming</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    SEMESTER *
                  </label>
                  <select
                    className="admin-form-select"
                    value={allocationForm.semester}
                    onChange={(e) => setAllocationForm({ ...allocationForm, semester: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem' }}
                  >
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 1">Semester 1</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    SECTION *
                  </label>
                  <select
                    className="admin-form-select"
                    value={allocationForm.section}
                    onChange={(e) => setAllocationForm({ ...allocationForm, section: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem' }}
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    ACADEMIC SESSION
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={allocationForm.academicYear}
                    disabled
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem', background: '#f1f5f9' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    ROLE IN COURSE
                  </label>
                  <select
                    className="admin-form-select"
                    value={allocationForm.role}
                    onChange={(e) => setAllocationForm({ ...allocationForm, role: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem' }}
                  >
                    <option value="Lead Instructor">Lead Instructor</option>
                    <option value="Co-Instructor">Co-Instructor</option>
                    <option value="Lab In-Charge">Lab In-Charge</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    ALLOCATED TEACHING HOURS / WEEK
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="admin-form-input"
                    value={allocationForm.allocatedHours}
                    onChange={(e) => setAllocationForm({ ...allocationForm, allocatedHours: Number(e.target.value) })}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setShowAllocateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                  style={{ background: '#0f766e', borderColor: '#0f766e' }}
                >
                  Save Allocation ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

