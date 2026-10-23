import React, { useState } from 'react';
import {
  Sliders,
  Award,
  Calendar,
  ShieldCheck,
  Check,
  RotateCcw,
  BookOpen,
  DollarSign,
  AlertCircle,
  Lock,
  Layers,
  Key
} from 'lucide-react';
import { examinationStore } from '../../services/examinationStore';

export default function ExamSettingsModule({ triggerToast }) {
  const [activeSubTab, setActiveSubTab] = useState('grading'); // 'grading' | 'passing' | 'deadlines' | 'rbac'
  const [settings, setSettings] = useState(() => examinationStore.getSettings());
  const [gradingScale, setGradingScale] = useState(settings.gradingScale);
  const [passingCriteria, setPassingCriteria] = useState(settings.passingCriteria);
  const [deadlines, setDeadlines] = useState(settings.deadlines);

  const handleSaveGrading = (e) => {
    e.preventDefault();
    examinationStore.updateSettings({ gradingScale });
    triggerToast('Autonomous 10-Point Grading Scale updated & saved.');
  };

  const handleSavePassing = (e) => {
    e.preventDefault();
    examinationStore.updateSettings({ passingCriteria });
    triggerToast('Statutory Passing Criteria & Moderation Rules saved.');
  };

  const handleSaveDeadlines = (e) => {
    e.preventDefault();
    examinationStore.updateSettings({ deadlines });
    triggerToast('Registration Deadlines & Late Fee Slabs saved.');
  };

  const handleResetDefaults = () => {
    const defaultSettings = examinationStore.getSettings();
    setGradingScale(defaultSettings.gradingScale);
    setPassingCriteria(defaultSettings.passingCriteria);
    setDeadlines(defaultSettings.deadlines);
    triggerToast('Settings reset to default autonomous regulations.');
  };

  return (
    <div>
      {/* Sub-tabs header */}
      <div className="coe-subtabs-bar">
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'grading' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('grading')}
        >
          <Award size={16} />
          <span>Grading Scale &amp; Cutoffs</span>
        </button>
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'passing' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('passing')}
        >
          <BookOpen size={16} />
          <span>Passing Criteria &amp; Grace Rules</span>
        </button>
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'deadlines' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('deadlines')}
        >
          <Calendar size={16} />
          <span>Registration Deadlines &amp; Fees</span>
        </button>
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'rbac' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('rbac')}
        >
          <ShieldCheck size={16} />
          <span>Statutory Policies &amp; RBAC</span>
        </button>
      </div>

      {/* TAB 1: GRADING SCALE */}
      {activeSubTab === 'grading' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>UGC / AICTE Autonomous 10-Point Grading Matrix</h3>
              <p>Configure letter grades, percentage intervals, description designations, and grade points for SGPA/CGPA calculation</p>
            </div>
            <div className="erp-panel-actions">
              <button className="erp-btn erp-btn-secondary" onClick={handleResetDefaults}>
                <RotateCcw size={14} /> Reset
              </button>
              <button className="erp-btn erp-btn-primary" onClick={handleSaveGrading}>
                <Check size={14} /> Save Scale Changes
              </button>
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Letter Grade</th>
                  <th>Qualitative Description</th>
                  <th>Min Percentage</th>
                  <th>Max Percentage</th>
                  <th>Grade Points (Scale of 10)</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                {gradingScale.map((g, idx) => (
                  <tr key={g.grade}>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        background: g.grade === 'O' ? '#dcfce7' : g.grade === 'F' ? '#fee2e2' : '#f3e8ff',
                        color: g.grade === 'O' ? '#15803d' : g.grade === 'F' ? '#b91c1c' : '#6d28d9',
                      }}>
                        {g.grade}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={g.description}
                        onChange={(e) => {
                          const updated = [...gradingScale];
                          updated[idx].description = e.target.value;
                          setGradingScale(updated);
                        }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '100%' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={g.minMarks}
                        onChange={(e) => {
                          const updated = [...gradingScale];
                          updated[idx].minMarks = Number(e.target.value);
                          setGradingScale(updated);
                        }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '70px' }}
                      />%
                    </td>
                    <td>
                      <input
                        type="number"
                        value={g.maxMarks}
                        onChange={(e) => {
                          const updated = [...gradingScale];
                          updated[idx].maxMarks = Number(e.target.value);
                          setGradingScale(updated);
                        }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '70px' }}
                      />%
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{g.points} Pts</strong>
                    </td>
                    <td>
                      <span className={`status-pill ${g.points >= 7 ? 'success' : g.points >= 4 ? 'info' : 'danger'}`}>
                        {g.points >= 9 ? 'Distinction' : g.points >= 6 ? 'First Class' : g.points >= 4 ? 'Second Class' : 'Arrear'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PASSING CRITERIA */}
      {activeSubTab === 'passing' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Statutory Passing Criteria &amp; Moderation Grace Rules</h3>
              <p>Autonomous Academic Regulations: Minimum cut-offs required in internal assessments, end-sem theory, and council grace marks</p>
            </div>
            <div className="erp-panel-actions">
              <button className="erp-btn erp-btn-primary" onClick={handleSavePassing}>
                <Check size={14} /> Update Regulations
              </button>
            </div>
          </div>

          <form onSubmit={handleSavePassing}>
            <div className="exam-form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#0f172a' }}>Evaluation Passing Thresholds</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="exam-form-label">Minimum CIE Internal Assessment (%):</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      value={passingCriteria.minInternalPercentage}
                      onChange={(e) => setPassingCriteria({ ...passingCriteria, minInternalPercentage: Number(e.target.value) })}
                    />
                    <small style={{ color: '#64748b' }}>E.g. 40% = 8 out of 20 marks in Continuous Internal Evaluation</small>
                  </div>
                  <div>
                    <label className="exam-form-label">Minimum End-Semester External (%):</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      value={passingCriteria.minExternalPercentage}
                      onChange={(e) => setPassingCriteria({ ...passingCriteria, minExternalPercentage: Number(e.target.value) })}
                    />
                    <small style={{ color: '#64748b' }}>E.g. 35% = 28 out of 80 marks in Semester Theory Paper</small>
                  </div>
                  <div>
                    <label className="exam-form-label">Minimum Aggregate Passing Score (%):</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      value={passingCriteria.minAggregatePercentage}
                      onChange={(e) => setPassingCriteria({ ...passingCriteria, minAggregatePercentage: Number(e.target.value) })}
                    />
                    <small style={{ color: '#64748b' }}>Combined Internal + External total must be &ge; 40%</small>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#0f172a' }}>Attendance &amp; Moderation Grace Rules</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="exam-form-label">Mandatory Regular Attendance Floor (%):</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      value={passingCriteria.mandatoryRegularAttendance}
                      onChange={(e) => setPassingCriteria({ ...passingCriteria, mandatoryRegularAttendance: Number(e.target.value) })}
                    />
                    <small style={{ color: '#64748b' }}>Standard AICTE requirement: 75% aggregate class attendance</small>
                  </div>
                  <div>
                    <label className="exam-form-label">Medical Condonation Absolute Floor (%):</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      value={passingCriteria.condonationAttendanceFloor}
                      onChange={(e) => setPassingCriteria({ ...passingCriteria, condonationAttendanceFloor: Number(e.target.value) })}
                    />
                    <small style={{ color: '#64748b' }}>Below 65% is strictly un-condonable under university statute</small>
                  </div>
                  <div>
                    <label className="exam-form-label">Maximum Grace Marks Awardable:</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      value={passingCriteria.graceMarksCap}
                      onChange={(e) => setPassingCriteria({ ...passingCriteria, graceMarksCap: Number(e.target.value) })}
                    />
                    <small style={{ color: '#64748b' }}>Max 2 marks awarded solely by CoE Moderation Board</small>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DEADLINES & FEES */}
      {activeSubTab === 'deadlines' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Examination Registration Deadlines &amp; Late Fine Slabs</h3>
              <p>Configure registration windows, late payment surcharges, and admit card release dates</p>
            </div>
            <div className="erp-panel-actions">
              <button className="erp-btn erp-btn-primary" onClick={handleSaveDeadlines}>
                <Check size={14} /> Save Timeline
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveDeadlines}>
            <div className="exam-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="exam-form-group">
                <label className="exam-form-label">Normal Registration Last Date *</label>
                <input
                  type="date"
                  className="exam-form-input"
                  value={deadlines.regularExamFormLastDate}
                  onChange={(e) => setDeadlines({ ...deadlines, regularExamFormLastDate: e.target.value })}
                />
              </div>
              <div className="exam-form-group">
                <label className="exam-form-label">Late Fee Fine Amount (₹) *</label>
                <input
                  type="number"
                  className="exam-form-input"
                  value={deadlines.lateFeeFineAmount}
                  onChange={(e) => setDeadlines({ ...deadlines, lateFeeFineAmount: Number(e.target.value) })}
                />
              </div>
              <div className="exam-form-group">
                <label className="exam-form-label">Late Fee Last Date *</label>
                <input
                  type="date"
                  className="exam-form-input"
                  value={deadlines.lateFeeFormLastDate}
                  onChange={(e) => setDeadlines({ ...deadlines, lateFeeFormLastDate: e.target.value })}
                />
              </div>
              <div className="exam-form-group">
                <label className="exam-form-label">Super-Late Fine Surcharge (₹) *</label>
                <input
                  type="number"
                  className="exam-form-input"
                  value={deadlines.superLateFineAmount}
                  onChange={(e) => setDeadlines({ ...deadlines, superLateFineAmount: Number(e.target.value) })}
                />
              </div>
              <div className="exam-form-group">
                <label className="exam-form-label">Super-Late Cut-Off Date *</label>
                <input
                  type="date"
                  className="exam-form-input"
                  value={deadlines.superLateFormLastDate}
                  onChange={(e) => setDeadlines({ ...deadlines, superLateFormLastDate: e.target.value })}
                />
              </div>
              <div className="exam-form-group">
                <label className="exam-form-label">Admit Card Release Date *</label>
                <input
                  type="date"
                  className="exam-form-input"
                  value={deadlines.hallTicketDownloadOpens}
                  onChange={(e) => setDeadlines({ ...deadlines, hallTicketDownloadOpens: e.target.value })}
                />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: POLICIES & RBAC */}
      {activeSubTab === 'rbac' && (
        <div>
          <div className="erp-panel">
            <div className="erp-panel-header">
              <div className="erp-panel-title">
                <h3>Autonomous Institutional Policies &amp; Role-Based Access Control (RBAC)</h3>
                <p>Statutory security permissions and data governance for examination cell personnel</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#0f172a' }}>Statutory Policy Registry</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {settings.policies.map((p, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{p.title}</div>
                    <div style={{ color: '#475569' }}>{p.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#0f172a' }}>Examination Cell Permission Matrix</h4>
            <div className="erp-table-responsive">
              <table className="erp-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Operational Scope</th>
                    <th>Exam Staff</th>
                    <th>Chief Invigilator</th>
                    <th>Subject Evaluator</th>
                    <th>Controller of Examinations (CoE)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>View Question Paper Vault</strong></td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#d97706' }}>⚠ Assigned Set Only</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>✓ Full Decryption Access</td>
                  </tr>
                  <tr>
                    <td><strong>Marks Moderation &amp; Grace</strong></td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#d97706' }}>⚠ Entry Only</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>✓ Certified Lock &amp; Sign</td>
                  </tr>
                  <tr>
                    <td><strong>Publish Gazette &amp; SGPA/CGPA</strong></td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>✓ Statutory Release Authority</td>
                  </tr>
                  <tr>
                    <td><strong>Attendance Condonation &amp; Debarment</strong></td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#d97706' }}>⚠ Report Only</td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>✓ Quorum Council Sign-off</td>
                  </tr>
                  <tr>
                    <td><strong>Issue Hall Tickets &amp; Door Slips</strong></td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>✓ Generate &amp; Print</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>✓ Door Slip Print</td>
                    <td style={{ color: '#dc2626' }}>✕ Denied</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>✓ Release Toggle</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
