import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Plus,
  Send,
  Sparkles,
  Layers,
  Check,
  X,
  FileCheck2,
  Database,
  Sliders
} from 'lucide-react';
import { examinationStore } from '../../services/examinationStore';

export default function QuestionPaperVaultModule({ triggerToast, currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('vault'); // 'vault' | 'blueprints'
  const [questionPapers, setQuestionPapers] = useState(() => examinationStore.getQuestionPapers());
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [newPaperModal, setNewPaperModal] = useState(false);
  const [vaultAccessKey, setVaultAccessKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // New Paper Submission Form
  const [form, setForm] = useState({
    code: '',
    subject: '',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    examCycle: 'Autumn End-Semester 2026',
    paperSetter: 'Dr. External Setter (Invited)',
    moderator: 'Prof. S. K. Pradhan (Senior Faculty)',
    maxMarks: 80,
    duration: '3 Hours',
    setsCount: 3,
  });

  const handleUnlockVault = (e) => {
    e.preventDefault();
    if (vaultAccessKey.trim().length >= 4) {
      setIsUnlocked(true);
      triggerToast('CoE Cryptographic Key verified. Strongroom Vault Unlocked.');
    } else {
      triggerToast('Please provide a valid CoE cryptographic access key (min 4 characters).');
    }
  };

  const handleCoEApprove = (id) => {
    examinationStore.approveQuestionPaper(id);
    setQuestionPapers([...examinationStore.getQuestionPapers()]);
    triggerToast(`Question Paper ${id} approved & cryptographically sealed.`);
    if (selectedPaper?.id === id) {
      setSelectedPaper(questionPapers.find(p => p.id === id));
    }
  };

  const handleCreatePaper = (e) => {
    e.preventDefault();
    if (!form.code || !form.subject) return;
    const newPaper = examinationStore.addQuestionPaper({
      ...form,
      setsAvailable: ['Set A (Master)', 'Set B (Reserve 1)', 'Set C (Reserve 2)'],
      selectedSet: 'Set A (Master)',
      securityStatus: 'Awaiting Scrutiny Committee',
      vaultRef: `VAULT-STAGE-${Math.floor(100 + Math.random() * 900)}`,
      encryptionAlgorithm: 'AES-256 GCM',
      bloomTaxonomy: { remember: 20, understand: 25, apply: 30, analyze: 15, evaluate: 10 },
    });
    setQuestionPapers([...examinationStore.getQuestionPapers()]);
    setNewPaperModal(false);
    triggerToast(`Question paper draft for ${newPaper.code} submitted to scrutiny queue.`);
  };

  return (
    <div>
      {/* Sub-tabs header */}
      <div className="coe-subtabs-bar">
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'vault' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('vault')}
        >
          <Lock size={16} />
          <span>Confidential Question Paper Vault</span>
          <span className="coe-subtab-badge">{questionPapers.length} Papers</span>
        </button>
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'blueprints' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('blueprints')}
        >
          <Sliders size={16} />
          <span>Curriculum Blueprint &amp; Bloom Taxonomy</span>
          <span className="coe-subtab-badge">AICTE Compliant</span>
        </button>
      </div>

      {/* Security Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(124, 58, 237, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(139, 92, 246, 0.5)'
          }}>
            <ShieldCheck size={24} color="#a78bfa" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>
                CoE Confidential Paper Strongroom Vault
              </h3>
              <span style={{
                background: '#10b981',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                256-Bit Hardware Encrypted
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
              Restricted Custody: Accessible solely by Controller of Examinations &amp; Dual Keycard Custodians
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isUnlocked ? (
            <form onSubmit={handleUnlockVault} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                placeholder="Enter CoE Master Passkey..."
                value={vaultAccessKey}
                onChange={(e) => setVaultAccessKey(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="erp-btn erp-btn-primary erp-btn-sm">
                <KeyRound size={13} /> Unlock Vault
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Unlock size={14} /> Vault Session Active
              </span>
              <button
                type="button"
                className="erp-btn erp-btn-secondary erp-btn-sm"
                onClick={() => { setIsUnlocked(false); setVaultAccessKey(''); triggerToast('Vault locked.'); }}
              >
                Lock Vault
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: QUESTION PAPER VAULT */}
      {activeSubTab === 'vault' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Autumn 2026 Examination Question Paper Vault</h3>
              <p>Cryptographic custody, multi-set management, external examiner submissions, and CoE sign-off</p>
            </div>
            <div className="erp-panel-actions">
              <button className="erp-btn erp-btn-primary" onClick={() => setNewPaperModal(true)}>
                <Plus size={15} /> Submit Paper Set
              </button>
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Paper Code &amp; Course</th>
                  <th>Paper Setter &amp; Scrutinizer</th>
                  <th>Sets &amp; Active Master</th>
                  <th>Vault Reference</th>
                  <th>Security &amp; Seal</th>
                  <th>Approval Workflow</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questionPapers.map(paper => (
                  <tr key={paper.id}>
                    <td>
                      <strong>{paper.subject}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Code: <code>{paper.code}</code> · {paper.semester}
                      </div>
                    </td>
                    <td>
                      <div><strong>Setter:</strong> {paper.paperSetter}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Scrutinizer: {paper.moderator}</div>
                    </td>
                    <td>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                        {paper.selectedSet}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                        {paper.setsAvailable.length} Sets in Vault
                      </div>
                    </td>
                    <td>
                      <code>{paper.vaultRef}</code>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{paper.encryptionAlgorithm}</div>
                    </td>
                    <td>
                      <span className={`status-pill ${paper.securityStatus.includes('Sealed') ? 'success' : 'warning'}`}>
                        {paper.securityStatus.includes('Sealed') ? <ShieldCheck size={12} /> : <Clock size={12} />}
                        {paper.securityStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${paper.status.includes('Approved') ? 'success' : 'purple'}`}>
                        {paper.status}
                      </span>
                      {paper.coEApprovalDate && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                          Signed: {paper.coEApprovalDate}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="erp-btn erp-btn-outline erp-btn-sm"
                          onClick={() => setSelectedPaper(paper)}
                          title="View Paper Audit Dossier"
                        >
                          <Eye size={13} /> Dossier
                        </button>
                        {paper.status !== 'Approved & Sealed in Strongroom' && (
                          <button
                            className="erp-btn erp-btn-primary erp-btn-sm"
                            onClick={() => handleCoEApprove(paper.id)}
                            title="CoE Final Authorization & Cryptographic Vault Seal"
                          >
                            <Lock size={13} /> Seal Paper
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
      )}

      {/* TAB 2: CURRICULUM BLUEPRINTS & BLOOM'S TAXONOMY */}
      {activeSubTab === 'blueprints' && (
        <div>
          <div className="erp-panel">
            <div className="erp-panel-header">
              <div className="erp-panel-title">
                <h3>Autonomous Question Bank Blueprint Matrix</h3>
                <p>AICTE / NBA Outcome-Based Education (OBE) cognitive domain distribution per examination paper</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {questionPapers.map(p => (
                <div key={p.code} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', color: '#0f172a' }}>{p.subject}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: <code>{p.code}</code> · Max {p.maxMarks} Marks</span>
                    </div>
                    <span className="status-pill success">OBE Aligned</span>
                  </div>

                  <h5 style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>
                    Bloom's Taxonomy Weightage:
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Remember (L1):</span>
                      <strong>{p.bloomTaxonomy?.remember || 20}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.bloomTaxonomy?.remember || 20}%`, height: '100%', background: '#3b82f6' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span>Understand (L2):</span>
                      <strong>{p.bloomTaxonomy?.understand || 25}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.bloomTaxonomy?.understand || 25}%`, height: '100%', background: '#10b981' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span>Apply &amp; Analyze (L3 &amp; L4):</span>
                      <strong>{(p.bloomTaxonomy?.apply || 30) + (p.bloomTaxonomy?.analyze || 15)}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(p.bloomTaxonomy?.apply || 30) + (p.bloomTaxonomy?.analyze || 15)}%`, height: '100%', background: '#7c3aed' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span>Evaluate &amp; Design (L5 &amp; L6):</span>
                      <strong>{p.bloomTaxonomy?.evaluate || 10}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.bloomTaxonomy?.evaluate || 10}%`, height: '100%', background: '#f59e0b' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Standard Question Bank Blueprint Structure */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#0f172a' }}>
                Standard Autonomous Theory Question Paper Blueprint (80 Marks)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong>Part A: Compulsory Short Questions</strong>
                  <p style={{ margin: '4px 0 0', color: '#64748b' }}>10 questions &times; 2 marks = 20 Marks (2 from each syllabus module)</p>
                </div>
                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong>Part B: Analytical / Algorithmic Core</strong>
                  <p style={{ margin: '4px 0 0', color: '#64748b' }}>Answer 4 out of 6 questions &times; 10 marks = 40 Marks (Internal choice module-wise)</p>
                </div>
                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong>Part C: Comprehensive Case Study / Design</strong>
                  <p style={{ margin: '4px 0 0', color: '#64748b' }}>1 question &times; 20 marks = 20 Marks (High order thinking - L5/L6 evaluation)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW DOSSIER */}
      {selectedPaper && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card lg">
            <div className="exam-modal-header">
              <div>
                <h3>Question Paper Custody &amp; Version History Dossier</h3>
                <p>Paper Code: <code>{selectedPaper.code}</code> · {selectedPaper.subject}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setSelectedPaper(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.84rem' }}>
                <div><strong>Paper Code:</strong> <code>{selectedPaper.code}</code></div>
                <div><strong>Semester:</strong> {selectedPaper.semester}</div>
                <div><strong>Cycle:</strong> {selectedPaper.examCycle}</div>
                <div><strong>Paper Setter:</strong> {selectedPaper.paperSetter}</div>
                <div><strong>Moderator:</strong> {selectedPaper.moderator}</div>
                <div><strong>Active Master Set:</strong> <span style={{ fontWeight: 700, color: '#7c3aed' }}>{selectedPaper.selectedSet}</span></div>
                <div><strong>Vault Storage Ref:</strong> <code>{selectedPaper.vaultRef}</code></div>
                <div><strong>Encryption:</strong> {selectedPaper.encryptionAlgorithm}</div>
                <div><strong>CoE Sign-Off:</strong> {selectedPaper.coEApprovalDate || 'Pending Final Seal'}</div>
              </div>

              <h4 style={{ fontSize: '0.88rem', color: '#0f172a', margin: '0 0 10px' }}>CRYPTOGRAPHIC VERSION AUDIT TRAIL</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedPaper.versionHistory.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 800 }}>
                      {v.version}
                    </span>
                    <div style={{ flex: 1, fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <strong>{v.author}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.74rem' }}>{v.date}</span>
                      </div>
                      <p style={{ margin: 0, color: '#475569' }}>{v.notes}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!isUnlocked && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={16} />
                  <span>Confidential question content preview is masked. Unlock with CoE Master Passkey to decrypt.</span>
                </div>
              )}
            </div>
            <div className="exam-modal-footer">
              <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setSelectedPaper(null)}>
                Close
              </button>
              {selectedPaper.status !== 'Approved & Sealed in Strongroom' && (
                <button
                  type="button"
                  className="erp-btn erp-btn-primary"
                  onClick={() => handleCoEApprove(selectedPaper.id)}
                >
                  <Lock size={14} /> Seal &amp; Encrypt Paper
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT NEW PAPER */}
      {newPaperModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Submit New Examination Question Paper</h3>
                <p>Register external/internal setter submission to the confidential queue</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setNewPaperModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePaper}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group">
                    <label className="exam-form-label">Subject Code *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. CS506"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Course Title *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. Compiler Design"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Paper Setter (Examiner) *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. Dr. A. K. Nayak (IIT BBS)"
                      value={form.paperSetter}
                      onChange={(e) => setForm({ ...form, paperSetter: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Internal Scrutinizer *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. Prof. Priya Ranjan"
                      value={form.moderator}
                      onChange={(e) => setForm({ ...form, moderator: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setNewPaperModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Upload size={14} /> Submit Paper Sets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
