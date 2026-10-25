import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Save,
  Lock,
  FlaskConical,
  Users,
  Award,
  FileCheck,
  Plus,
  Eye,
  Check
} from 'lucide-react';
import { labStaffStore } from '../../services/labStaffStore.js';
import { BRANCHES_CONFIG } from './labStaffData.js';

export default function AcademicsAttendanceTab({
  subTab = 'attendance',
  currentBranch,
  activeLabId,
  profile,
  timetable = [],
  experiments = [],
  students = [],
  onSuccessToast
}) {
  const [activeSubTab, setActiveSubTab] = useState(subTab);
  const [selectedSessionId, setSelectedSessionId] = useState(timetable[0]?.id || 'SES-2026-101');
  const [searchStudent, setSearchStudent] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [studentList, setStudentList] = useState(() => students.length > 0 ? students : labStaffStore.getStudents());
  const [sessionNotes, setSessionNotes] = useState('');
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [selectedExperimentDetail, setSelectedExperimentDetail] = useState(null);

  // Evaluation states
  const [evaluationData, setEvaluationData] = useState([
    {
      id: 'EVAL-01',
      roll: 'CSE-24-001',
      name: 'Aayush Mohapatra',
      experiment: 'VLAN Configuration & Router on a Stick',
      experimentation: 9,
      viva: 8,
      recordWork: 9,
      timeliness: 10,
      total: 36, // out of 40
      maxMarks: 40,
      status: 'Finalized',
      remarks: 'Configured sub-interfaces flawlessly; answered 802.1Q encapsulation questions correctly.'
    },
    {
      id: 'EVAL-02',
      roll: 'CSE-24-002',
      name: 'Abhilash Tripathy',
      experiment: 'VLAN Configuration & Router on a Stick',
      experimentation: 8,
      viva: 7,
      recordWork: 8,
      timeliness: 9,
      total: 32,
      maxMarks: 40,
      status: 'Finalized',
      remarks: 'Minor delay resolving default gateway routing, overall good performance.'
    },
    {
      id: 'EVAL-03',
      roll: 'CSE-24-003',
      name: 'Aditi Priyadarshini',
      experiment: 'VLAN Configuration & Router on a Stick',
      experimentation: 10,
      viva: 10,
      recordWork: 10,
      timeliness: 10,
      total: 40,
      maxMarks: 40,
      status: 'Finalized',
      remarks: 'Outstanding speed and comprehensive packet tracer network topology documentation.'
    }
  ]);

  const activeSession = timetable.find(s => s.id === selectedSessionId) || timetable[0];

  // Attendance counts
  const presentCount = studentList.filter(s => s.attendanceStatus === 'Present').length;
  const absentCount = studentList.filter(s => s.attendanceStatus === 'Absent').length;
  const lateCount = studentList.filter(s => s.attendanceStatus === 'Late').length;
  const excusedCount = studentList.filter(s => s.attendanceStatus === 'Excused').length;
  const totalStudents = studentList.length;

  const handleStatusChange = (roll, newStatus) => {
    setStudentList(prev => prev.map(s => s.roll === roll ? { ...s, attendanceStatus: newStatus } : s));
  };

  const handleMarkAllPresent = () => {
    setStudentList(prev => prev.map(s => ({ ...s, attendanceStatus: 'Present' })));
    onSuccessToast?.('All students marked as Present for this practical session.');
  };

  const handleSaveAttendance = () => {
    labStaffStore.saveAttendance(selectedSessionId, studentList, sessionNotes);
    onSuccessToast?.(`Attendance for session ${selectedSessionId} saved to local storage!`);
  };

  const handleFinalizeAttendance = () => {
    labStaffStore.saveAttendance(selectedSessionId, studentList, sessionNotes);
    labStaffStore.updateSessionStatus(selectedSessionId, 'Completed');
    setShowFinalizeModal(false);
    onSuccessToast?.(`Session ${selectedSessionId} finalized and locked!`);
  };

  const handleExportCSV = () => {
    const headers = 'Roll Number,Registration No,Student Name,Attendance Status,Remarks\n';
    const rows = studentList.map(s => `${s.roll},${s.regNo},"${s.name}",${s.attendanceStatus},${s.lastGrade || ''}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${activeSession?.id || 'Lab'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onSuccessToast?.('Attendance roster exported as CSV successfully!');
  };

  const filteredStudents = studentList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                          s.roll.toLowerCase().includes(searchStudent.toLowerCase()) ||
                          s.regNo.includes(searchStudent);
    const matchesStatus = statusFilter === 'ALL' || s.attendanceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const branchExperiments = experiments.filter(e => e.department === currentBranch);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Subtab Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('attendance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'attendance' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'attendance' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'attendance' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <ClipboardCheck size={16} /> Student Practical Attendance
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('experiments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'experiments' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'experiments' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'experiments' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <FlaskConical size={16} /> Experiment Catalog ({branchExperiments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('batches')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'batches' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'batches' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'batches' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Users size={16} /> Practical Batches
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('evaluations')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'evaluations' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'evaluations' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'evaluations' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Award size={16} /> Practical Evaluation Rubrics
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('completion')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'completion' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'completion' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'completion' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <FileCheck size={16} /> Completion Records
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT PRACTICAL ATTENDANCE */}
      {/* ========================================================================= */}
      {activeSubTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Session Selector Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                SELECT PRACTICAL LABORATORY SESSION
              </div>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                  marginTop: '4px',
                  minWidth: '320px'
                }}
              >
                {timetable.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {t.subject} ({t.batch} · {t.timeSlot})
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Statistics Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>PRESENT</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}>{presentCount}</div>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>ABSENT</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#b91c1c' }}>{absentCount}</div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>LATE</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706' }}>{lateCount}</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>TOTAL</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{totalStudents}</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✓ Mark All Present
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save size={15} /> Save Roster
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                style={{
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={15} /> CSV
              </button>

              <button
                type="button"
                onClick={() => setShowFinalizeModal(true)}
                style={{
                  background: '#09152b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Lock size={14} /> Finalize Session
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            padding: '12px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search student by name, roll number, or reg number..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.86rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
              {['ALL', 'Present', 'Absent', 'Late', 'Excused'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    border: statusFilter === st ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    background: statusFilter === st ? '#eff6ff' : '#ffffff',
                    color: statusFilter === st ? '#2563eb' : '#64748b',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Student Roster Table */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>Roll Number</th>
                    <th style={{ padding: '12px 16px' }}>Registration No</th>
                    <th style={{ padding: '12px 16px' }}>Student Full Name</th>
                    <th style={{ padding: '12px 16px' }}>Attendance Status</th>
                    <th style={{ padding: '12px 16px' }}>Quick Status Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st, idx) => (
                    <tr key={st.roll} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: '0.78rem' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: '#0f172a' }}>{st.roll}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#475569' }}>{st.regNo}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>{st.name}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: st.attendanceStatus === 'Present' ? '#dcfce7' : (st.attendanceStatus === 'Absent' ? '#fee2e2' : (st.attendanceStatus === 'Late' ? '#fef3c7' : '#f1f5f9')),
                          color: st.attendanceStatus === 'Present' ? '#15803d' : (st.attendanceStatus === 'Absent' ? '#b91c1c' : (st.attendanceStatus === 'Late' ? '#b45309' : '#475569'))
                        }}>
                          ● {st.attendanceStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.roll, 'Present')}
                            style={{
                              background: st.attendanceStatus === 'Present' ? '#15803d' : '#f1f5f9',
                              color: st.attendanceStatus === 'Present' ? '#ffffff' : '#475569',
                              border: 'none',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.roll, 'Absent')}
                            style={{
                              background: st.attendanceStatus === 'Absent' ? '#dc2626' : '#f1f5f9',
                              color: st.attendanceStatus === 'Absent' ? '#ffffff' : '#475569',
                              border: 'none',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.roll, 'Late')}
                            style={{
                              background: st.attendanceStatus === 'Late' ? '#d97706' : '#f1f5f9',
                              color: st.attendanceStatus === 'Late' ? '#ffffff' : '#475569',
                              border: 'none',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.roll, 'Excused')}
                            style={{
                              background: st.attendanceStatus === 'Excused' ? '#475569' : '#f1f5f9',
                              color: st.attendanceStatus === 'Excused' ? '#ffffff' : '#475569',
                              border: 'none',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            E
                          </button>
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

      {/* ========================================================================= */}
      {/* 2. EXPERIMENT CATALOG */}
      {/* ========================================================================= */}
      {activeSubTab === 'experiments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Curriculum Experiment Catalog — {currentBranch}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Syllabus-aligned practical modules, lab manuals, and required apparatus.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSuccessToast?.('New experiment registered in curriculum catalog!')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={15} /> Add Experiment
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {branchExperiments.map(exp => (
              <div
                key={exp.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                    {exp.id}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    Duration: {exp.duration}
                  </span>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {exp.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                    {exp.objective}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Required Apparatus:</strong> {exp.requiredEquipment}</div>
                  <div><strong>Consumables:</strong> {exp.requiredConsumables}</div>
                  <div style={{ color: '#dc2626' }}><strong>Safety Notes:</strong> {exp.safetyNotes}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Faculty: <strong>{exp.facultyInCharge}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedExperimentDetail(exp)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View Manual
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRACTICAL BATCHES */}
      {/* ========================================================================= */}
      {activeSubTab === 'batches' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Academic Practical Batch Divisions &amp; Bench Allocations
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { batch: 'Batch A1', rollRange: 'Roll 01 – 32', count: 32, timing: 'Mon, Wed 09:00 AM', lab: 'CSE-LAB-02', instructor: 'Prof. Ansuman Jena' },
              { batch: 'Batch A2', rollRange: 'Roll 33 – 64', count: 32, timing: 'Mon, Wed 11:45 AM', lab: 'CSE-LAB-02', instructor: 'Dr. Smita Pattnaik' },
              { batch: 'Batch B1', rollRange: 'Roll 01 – 28', count: 28, timing: 'Tue, Thu 02:30 PM', lab: 'CSE-LAB-04', instructor: 'Dr. Debasis Gountia' },
              { batch: 'Batch B2', rollRange: 'Roll 29 – 56', count: 28, timing: 'Tue, Thu 09:00 AM', lab: 'CSE-LAB-04', instructor: 'Prof. Subhasree Mohanty' },
            ].map(b => (
              <div
                key={b.batch}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{b.batch}</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                    {b.count} Students
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  <div>Roster: <strong>{b.rollRange}</strong></div>
                  <div>Weekly Turn: <strong>{b.timing}</strong></div>
                  <div>Lab: <strong>{b.lab}</strong></div>
                  <div>Faculty: <strong>{b.instructor}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PRACTICAL EVALUATION RUBRICS */}
      {/* ========================================================================= */}
      {activeSubTab === 'evaluations' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Continuous Practical Evaluation &amp; Rubrics
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                4-Point Rubric: Experimentation (10) · Viva-Voce (10) · Record Work (10) · Timeliness (10) = 40 Marks Total
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSuccessToast?.('Evaluation marks recorded in academic registry!')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Evaluate Student
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>Roll &amp; Name</th>
                  <th style={{ padding: '12px 14px' }}>Practical Module</th>
                  <th style={{ padding: '12px 14px' }}>Experiment (10)</th>
                  <th style={{ padding: '12px 14px' }}>Viva (10)</th>
                  <th style={{ padding: '12px 14px' }}>Record (10)</th>
                  <th style={{ padding: '12px 14px' }}>Time (10)</th>
                  <th style={{ padding: '12px 14px' }}>Total / 40</th>
                  <th style={{ padding: '12px 14px' }}>Staff Remarks</th>
                </tr>
              </thead>
              <tbody>
                {evaluationData.map(ev => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ev.roll}</div>
                      <div style={{ fontSize: '0.76rem', color: '#475569' }}>{ev.name}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#1e293b', fontWeight: 600 }}>{ev.experiment}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{ev.experimentation}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{ev.viva}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{ev.recordWork}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{ev.timeliness}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color: ev.total >= 35 ? '#15803d' : '#2563eb'
                      }}>
                        {ev.total} / {ev.maxMarks}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.78rem' }}>{ev.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. COMPLETION RECORDS */}
      {/* ========================================================================= */}
      {activeSubTab === 'completion' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Semester Practical Completion Ledger
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#64748b' }}>
            Certified completion records for end-semester autonomous external practical examination eligibility.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>BATCH A1 COMPLETION</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>88%</div>
              <div style={{ fontSize: '0.76rem', color: '#475569' }}>7 of 8 practical experiments completed &amp; signed.</div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>BATCH A2 COMPLETION</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', margin: '4px 0' }}>75%</div>
              <div style={{ fontSize: '0.76rem', color: '#475569' }}>6 of 8 practical experiments completed &amp; signed.</div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>BATCH B1 COMPLETION</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>62%</div>
              <div style={{ fontSize: '0.76rem', color: '#475569' }}>5 of 8 practical experiments completed &amp; signed.</div>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Confirmation Modal */}
      {showFinalizeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Lock size={44} color="#09152b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Finalize Practical Session Attendance?
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                You are about to finalize attendance for <strong>{activeSession?.subject}</strong>.
                {presentCount} students will be recorded as Present, and {absentCount} as Absent.
              </p>
            </div>

            <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeAttendance}
                style={{ background: '#09152b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm &amp; Finalize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
