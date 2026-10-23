import React, { useState } from 'react';
import {
  FileCheck2,
  Users,
  CheckCircle,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  Printer,
  Download,
  Lock,
  Unlock,
  Check,
  FileSpreadsheet,
  Building2,
  UserCheck
} from 'lucide-react';
import { examinationStore } from '../../services/examinationStore';

export default function PracticalVivaModule({ triggerToast }) {
  const [practicalExams, setPracticalExams] = useState(() => examinationStore.getPracticalExams());
  const [selectedExamId, setSelectedExamId] = useState(practicalExams[0]?.id || 'PRAC-CS591');
  const [isLocked, setIsLocked] = useState(false);

  const activeExam = practicalExams.find(e => e.id === selectedExamId) || practicalExams[0];

  const handleMarkChange = (rollNumber, field, val) => {
    if (isLocked) return;
    const num = Math.max(0, Number(val) || 0);
    const maxVal = field === 'practical' ? activeExam.maxPractical : activeExam.maxViva;
    if (num > maxVal) {
      triggerToast(`Maximum marks for ${field} is ${maxVal}`);
      return;
    }

    const currentStudent = activeExam.students.find(s => s.rollNumber === rollNumber);
    const newPrac = field === 'practical' ? num : currentStudent.practical;
    const newViva = field === 'viva' ? num : currentStudent.viva;

    examinationStore.updatePracticalMarks(activeExam.id, rollNumber, newPrac, newViva, currentStudent.remarks);
    setPracticalExams([...examinationStore.getPracticalExams()]);
  };

  const handleAttendanceToggle = (rollNumber) => {
    if (isLocked) return;
    const currentStudent = activeExam.students.find(s => s.rollNumber === rollNumber);
    const newAtt = currentStudent.attendance === 'Present' ? 'Absent' : 'Present';
    const newPrac = newAtt === 'Absent' ? 0 : currentStudent.practical;
    const newViva = newAtt === 'Absent' ? 0 : currentStudent.viva;

    examinationStore.updatePracticalMarks(activeExam.id, rollNumber, newPrac, newViva, newAtt === 'Absent' ? 'Candidate Absent' : '');
    setPracticalExams([...examinationStore.getPracticalExams()]);
    triggerToast(`Attendance toggled to ${newAtt} for Roll ${rollNumber}.`);
  };

  const handleRemarkChange = (rollNumber, text) => {
    if (isLocked) return;
    const currentStudent = activeExam.students.find(s => s.rollNumber === rollNumber);
    examinationStore.updatePracticalMarks(activeExam.id, rollNumber, currentStudent.practical, currentStudent.viva, text);
    setPracticalExams([...examinationStore.getPracticalExams()]);
  };

  const handleCertify = () => {
    setIsLocked(true);
    triggerToast(`Practical & Viva marks for ${activeExam.code} certified and signed by Internal & External examiners.`);
  };

  const handleExportCsv = () => {
    const rows = activeExam.students.map(s => ({
      Roll: s.rollNumber,
      RegNo: s.regNo,
      Name: s.name,
      Attendance: s.attendance,
      PracticalMarks: s.practical,
      VivaMarks: s.viva,
      TotalMarks: s.total,
      Remarks: s.remarks,
    }));
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent = keys.join(separator) + '\n' +
      rows.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(separator)).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Practical_Viva_${activeExam.code}_Marks.csv`;
    link.click();
    triggerToast(`Marks exported to CSV.`);
  };

  return (
    <div>
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Laboratory Practical &amp; Viva-Voce Examination Command</h3>
            <p>Dual-examiner grading protocol: Lab Experiment (Max 30) + Comprehensive Viva-Voce (Max 20) = Total 50 Marks</p>
          </div>
          <div className="erp-panel-actions">
            <button className="erp-btn erp-btn-secondary" onClick={handleExportCsv}>
              <FileSpreadsheet size={15} /> Export CSV
            </button>
            <button
              className={`erp-btn ${isLocked ? 'erp-btn-success' : 'erp-btn-primary'}`}
              onClick={handleCertify}
              disabled={isLocked}
            >
              {isLocked ? <Check size={14} /> : <Lock size={14} />}
              {isLocked ? 'Marks Certified & Locked' : 'Sign & Certify Marks'}
            </button>
          </div>
        </div>

        {/* Course & Examiners Header Card */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Select Laboratory Subject:</span>
            <div style={{ marginTop: '6px' }}>
              <select
                className="exam-filter-select"
                style={{ width: '100%', fontSize: '0.9rem', fontWeight: 600 }}
                value={selectedExamId}
                onChange={(e) => { setSelectedExamId(e.target.value); setIsLocked(false); }}
              >
                {practicalExams.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.subject} ({p.batch})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#475569' }}>
              <div><strong>Laboratory:</strong> {activeExam.labRoom}</div>
              <div><strong>Scheduled Date:</strong> {activeExam.date}</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Joint Examination Board Signatories:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>INTERNAL EXAMINER</span>
                <div style={{ fontWeight: 600, color: '#7c3aed' }}>{activeExam.internalExaminer}</div>
                <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>✓ Identity Verified</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>EXTERNAL EXAMINER</span>
                <div style={{ fontWeight: 600, color: '#0284c7' }}>{activeExam.externalExaminer}</div>
                <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>✓ Nominated by CoE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Marks Table */}
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Roll Number &amp; Candidate</th>
                <th>Reg Number</th>
                <th>Attendance</th>
                <th>Practical Performance (Max {activeExam.maxPractical})</th>
                <th>Viva-Voce (Max {activeExam.maxViva})</th>
                <th>Total (Max {activeExam.maxTotal})</th>
                <th>Examiner Remarks</th>
              </tr>
            </thead>
            <tbody>
              {activeExam.students.map(s => (
                <tr key={s.rollNumber}>
                  <td>
                    <strong>Roll {s.rollNumber}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{s.name}</div>
                  </td>
                  <td><code>{s.regNo}</code></td>
                  <td>
                    <button
                      type="button"
                      className={`erp-btn erp-btn-sm ${s.attendance === 'Present' ? 'erp-btn-success' : 'erp-btn-danger'}`}
                      onClick={() => handleAttendanceToggle(s.rollNumber)}
                      disabled={isLocked}
                      style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                      title="Click to toggle Present/Absent"
                    >
                      {s.attendance === 'Present' ? '✓ Present' : '✕ Absent'}
                    </button>
                  </td>
                  <td>
                    {isLocked || s.attendance === 'Absent' ? (
                      <strong style={{ fontSize: '0.95rem' }}>{s.practical}</strong>
                    ) : (
                      <input
                        type="number"
                        className="mark-edit-input"
                        min="0"
                        max={activeExam.maxPractical}
                        value={s.practical}
                        onChange={(e) => handleMarkChange(s.rollNumber, 'practical', e.target.value)}
                      />
                    )}
                  </td>
                  <td>
                    {isLocked || s.attendance === 'Absent' ? (
                      <strong style={{ fontSize: '0.95rem' }}>{s.viva}</strong>
                    ) : (
                      <input
                        type="number"
                        className="mark-edit-input"
                        min="0"
                        max={activeExam.maxViva}
                        value={s.viva}
                        onChange={(e) => handleMarkChange(s.rollNumber, 'viva', e.target.value)}
                      />
                    )}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: s.total >= 20 ? '#16a34a' : '#dc2626'
                    }}>
                      {s.total} / {activeExam.maxTotal}
                    </span>
                  </td>
                  <td>
                    {isLocked ? (
                      <span style={{ fontSize: '0.78rem', color: '#475569' }}>{s.remarks}</span>
                    ) : (
                      <input
                        type="text"
                        placeholder="Evaluation note..."
                        value={s.remarks}
                        onChange={(e) => handleRemarkChange(s.rollNumber, e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: '0.78rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1'
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
