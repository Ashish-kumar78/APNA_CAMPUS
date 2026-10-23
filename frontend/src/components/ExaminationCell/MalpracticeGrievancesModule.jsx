import React, { useState } from 'react';
import {
  ShieldAlert,
  MessageSquare,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  Check,
  X,
  Lock,
  FileText,
  UserX,
  Gavel,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { examinationStore } from '../../services/examinationStore';

export default function MalpracticeGrievancesModule({ triggerToast }) {
  const [activeSubTab, setActiveSubTab] = useState('ufm'); // 'ufm' | 'grievances'
  const [malpracticeCases, setMalpracticeCases] = useState(() => examinationStore.getMalpracticeCases());
  const [grievances, setGrievances] = useState(() => examinationStore.getGrievances());

  const [selectedUfm, setSelectedUfm] = useState(null);
  const [verdictModal, setVerdictModal] = useState(null);
  const [verdictForm, setVerdictForm] = useState({
    verdict: '',
    penaltyLevel: 'Category B Penalty (Paper Cancellation)'
  });

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);
  const [resolveText, setResolveText] = useState('');

  const handleApplyVerdict = (e) => {
    e.preventDefault();
    if (!verdictModal) return;
    examinationStore.updateMalpracticeVerdict(verdictModal.id, verdictForm.verdict, verdictForm.penaltyLevel);
    setMalpracticeCases([...examinationStore.getMalpracticeCases()]);
    setVerdictModal(null);
    triggerToast(`Disciplinary committee verdict finalized for Case ${verdictModal.caseNo}.`);
  };

  const handleResolveGrievance = (e) => {
    e.preventDefault();
    if (!resolveModal) return;
    examinationStore.resolveGrievance(resolveModal.id, resolveText);
    setGrievances([...examinationStore.getGrievances()]);
    setResolveModal(null);
    setResolveText('');
    triggerToast(`Grievance ${resolveModal.ticketNo} resolved.`);
  };

  return (
    <div>
      {/* Sub-tabs header */}
      <div className="coe-subtabs-bar">
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'ufm' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('ufm')}
        >
          <Gavel size={16} />
          <span>Malpractice &amp; Unfair Means (UFM) Register</span>
          <span className="coe-subtab-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
            {malpracticeCases.length} Cases
          </span>
        </button>
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'grievances' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('grievances')}
        >
          <MessageSquare size={16} />
          <span>Student Examination Grievances</span>
          <span className="coe-subtab-badge">
            {grievances.filter(g => g.status !== 'Resolved & Closed').length} Active
          </span>
        </button>
      </div>

      {/* TAB 1: MALPRACTICE (UFM) */}
      {activeSubTab === 'ufm' && (
        <div>
          {/* Security Banner */}
          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.84rem',
            color: '#9f1239'
          }}>
            <ShieldAlert size={20} color="#e11d48" />
            <div>
              <strong>Confidential Disciplinary Record:</strong> Access restricted to Examination Disciplinary Committee, CoE, and Principal. All evidence is archived under sealed statutory custody.
            </div>
          </div>

          <div className="erp-panel">
            <div className="erp-panel-header">
              <div className="erp-panel-title">
                <h3>Autonomous Examination Malpractice (UFM) Hearings</h3>
                <p>Flying squad seizures, disciplinary committee hearings, and statutory penalty orders</p>
              </div>
            </div>

            <div className="erp-table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Case No &amp; Paper</th>
                    <th>Candidate &amp; Roll</th>
                    <th>Detection &amp; Hall</th>
                    <th>Offense Description</th>
                    <th>Penalty Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {malpracticeCases.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong style={{ color: '#be123c' }}>{c.caseNo}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          <code>{c.paperCode}</code> · {c.paperName}
                        </div>
                      </td>
                      <td>
                        <strong>{c.studentName}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Roll {c.rollNumber} · <code>{c.regNo}</code>
                        </div>
                      </td>
                      <td>
                        <div>{c.hall}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.detectingOfficer}</div>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{c.offenseType}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.confiscatedMaterial}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 700 }}>
                          {c.penaltyLevel}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.verdict}</div>
                      </td>
                      <td>
                        <span className={`status-pill ${c.status.includes('Finalized') ? 'danger' : 'warning'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className="erp-btn erp-btn-outline erp-btn-sm"
                            onClick={() => setSelectedUfm(c)}
                            title="View Case File"
                          >
                            <Eye size={13} /> Case File
                          </button>
                          {c.status !== 'Verdict Finalized' && (
                            <button
                              className="erp-btn erp-btn-danger erp-btn-sm"
                              onClick={() => {
                                setVerdictModal(c);
                                setVerdictForm({ verdict: c.verdict, penaltyLevel: 'Category B Penalty (Paper Cancellation)' });
                              }}
                              title="Pass Committee Verdict"
                            >
                              <Gavel size={13} /> Pass Verdict
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

      {/* TAB 2: GRIEVANCES */}
      {activeSubTab === 'grievances' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Examination Grievance &amp; Discrepancy Redressal</h3>
              <p>Resolve student complaints regarding internal assessments, marks entry mismatches, and admit card errors</p>
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Ticket No &amp; Date</th>
                  <th>Candidate &amp; Roll</th>
                  <th>Category &amp; Subject</th>
                  <th>Complaint Description</th>
                  <th>Priority</th>
                  <th>Resolution Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map(g => (
                  <tr key={g.id}>
                    <td>
                      <strong>{g.ticketNo}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{g.dateSubmitted}</div>
                    </td>
                    <td>
                      <strong>{g.studentName}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Roll {g.rollNumber} · <code>{g.regNo}</code></div>
                    </td>
                    <td>
                      <div><strong>{g.category}</strong></div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}><code>{g.subjectCode}</code></div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>
                        {g.description}
                      </p>
                      {g.resolutionNotes && (
                        <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                          Resolution: {g.resolutionNotes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${g.priority === 'High' ? 'danger' : 'info'}`}>
                        {g.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${g.status.includes('Resolved') ? 'success' : 'warning'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td>
                      {g.status !== 'Resolved & Closed' ? (
                        <button
                          className="erp-btn erp-btn-primary erp-btn-sm"
                          onClick={() => setResolveModal(g)}
                        >
                          <Check size={13} /> Resolve
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                          ✓ Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW UFM CASE FILE */}
      {selectedUfm && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card lg">
            <div className="exam-modal-header">
              <div>
                <h3>Confidential UFM Case Dossier</h3>
                <p>Case No: <code>{selectedUfm.caseNo}</code> · {selectedUfm.studentName}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setSelectedUfm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.84rem' }}>
                <div><strong>Candidate:</strong> {selectedUfm.studentName}</div>
                <div><strong>Roll Number:</strong> {selectedUfm.rollNumber}</div>
                <div><strong>Registration:</strong> <code>{selectedUfm.regNo}</code></div>
                <div><strong>Examination Paper:</strong> {selectedUfm.paperCode} ({selectedUfm.paperName})</div>
                <div><strong>Exam Date &amp; Hall:</strong> {selectedUfm.examDate} · {selectedUfm.hall}</div>
                <div><strong>Detecting Authority:</strong> {selectedUfm.detectingOfficer}</div>
              </div>

              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', color: '#9f1239' }}>SEIZED CONTRABAND &amp; OFFENSE SUMMARY</h4>
                <div style={{ fontSize: '0.82rem', color: '#881337' }}><strong>Nature of Offense:</strong> {selectedUfm.offenseType}</div>
                <div style={{ fontSize: '0.82rem', color: '#881337', marginTop: '4px' }}><strong>Material Evidence Confiscated:</strong> {selectedUfm.confiscatedMaterial}</div>
                <div style={{ fontSize: '0.82rem', color: '#881337', marginTop: '4px' }}><strong>Candidate Confession / Statement:</strong> "{selectedUfm.studentStatement}"</div>
              </div>

              <div style={{ background: '#f1f5f9', padding: '12px 14px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', color: '#0f172a' }}>DISCIPLINARY COMMITTEE RECOMMENDATION</h4>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}><strong>Hearing Schedule:</strong> {selectedUfm.committeeHearingDate}</div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}><strong>Statutory Penalty Order:</strong> <span style={{ fontWeight: 800, color: '#dc2626' }}>{selectedUfm.penaltyLevel}</span></div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}><strong>Official Verdict:</strong> {selectedUfm.verdict}</div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setSelectedUfm(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PASS COMMITTEE VERDICT */}
      {verdictModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Execute Disciplinary Committee Verdict</h3>
                <p>Case No: <code>{verdictModal.caseNo}</code> · {verdictModal.studentName}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setVerdictModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleApplyVerdict}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Statutory Penalty Level *</label>
                    <select
                      className="exam-form-select"
                      value={verdictForm.penaltyLevel}
                      onChange={(e) => setVerdictForm({ ...verdictForm, penaltyLevel: e.target.value })}
                    >
                      <option value="Category A Penalty (Written Reprimand / Warning)">Category A Penalty (Written Reprimand / Warning)</option>
                      <option value="Category B Penalty (Paper Cancellation)">Category B Penalty (Current Paper Cancellation)</option>
                      <option value="Category C Penalty (All Semester Papers Cancelled)">Category C Penalty (All Semester Papers Cancelled)</option>
                      <option value="Category D Penalty (Debarred for 1 Academic Year)">Category D Penalty (Debarred for 1 Academic Year)</option>
                    </select>
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Official Committee Verdict Text *</label>
                    <textarea
                      rows={3}
                      className="exam-form-textarea"
                      required
                      placeholder="e.g. Committee examined candidate confession and mobile evidence. Paper CS503 marks nullified."
                      value={verdictForm.verdict}
                      onChange={(e) => setVerdictForm({ ...verdictForm, verdict: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setVerdictModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-danger">
                  <Gavel size={14} /> Seal &amp; Execute Verdict
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESOLVE GRIEVANCE */}
      {resolveModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Resolve Examination Grievance</h3>
                <p>Ticket: <code>{resolveModal.ticketNo}</code> · {resolveModal.studentName}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setResolveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleResolveGrievance}>
              <div className="exam-modal-body">
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '14px' }}>
                  <strong>Student Complaint:</strong> {resolveModal.description}
                </div>
                <div className="exam-form-grid">
                  <div className="exam-form-group full">
                    <label className="exam-form-label">CoE Resolution &amp; Corrective Action Taken *</label>
                    <textarea
                      rows={3}
                      className="exam-form-textarea"
                      required
                      placeholder="e.g. Scrutinized internal mark register with department HOD. Mark updated from 10 to 16 in database."
                      value={resolveText}
                      onChange={(e) => setResolveText(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setResolveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Check size={14} /> Close Grievance Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
