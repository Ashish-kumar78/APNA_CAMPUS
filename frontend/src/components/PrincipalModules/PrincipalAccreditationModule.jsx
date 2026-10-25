import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Download,
  Eye,
  Check,
  X,
  ExternalLink,
  Printer,
  Calendar,
  Layers
} from 'lucide-react';
import { ACCREDITATION_STATUS, INITIAL_NAAC_CRITERIA, INITIAL_COMPLIANCE_DOSSIERS } from './principalData.js';
import './PrincipalModules.css';

export default function PrincipalAccreditationModule({ onToast }) {
  const [accreditationInfo, setAccreditationInfo] = useState(ACCREDITATION_STATUS);
  const [criteria, setCriteria] = useState(INITIAL_NAAC_CRITERIA);
  const [dossiers, setDossiers] = useState(INITIAL_COMPLIANCE_DOSSIERS);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [previewDossierModal, setPreviewDossierModal] = useState(null);
  const [endorseModal, setEndorseModal] = useState(null); // dossier

  // Filtered Dossiers
  const filteredDossiers = dossiers.filter((d) => {
    return statusFilter === 'All' || d.status === statusFilter;
  });

  const completedDossiersCount = dossiers.filter((d) => d.status === 'Completed').length;

  // Handle Endorse Dossier
  const handleConfirmEndorsement = () => {
    if (!endorseModal) return;
    const targetId = endorseModal.id;

    setDossiers((prev) =>
      prev.map((d) =>
        d.id === targetId
          ? {
              ...d,
              status: 'Completed',
              verifiedBy: 'Dr. B. K. Sarap (Principal & Director)',
            }
          : d
      )
    );

    if (onToast) onToast(`Compliance dossier ${targetId} officially verified and sealed for peer team!`);
    setEndorseModal(null);
  };

  return (
    <div className="principal-module-container">
      {/* Notice Banner */}
      <div className="principal-banner-notice success">
        <div className="principal-banner-text">
          <ShieldCheck size={18} color="#15803d" />
          <span>
            <strong>National Institutional Accreditations:</strong> NAAC Grade A++ (Score 3.62 / 4.00), 4 NBA-Accredited UG Branches, and autonomous compliance monitoring.
          </span>
        </div>
        <div className="principal-banner-badge" style={{ background: '#dcfce7', color: '#166534' }}>
          Autonomous Cycle Valid: 2030
        </div>
      </div>

      {/* Primary Accreditation Standing Cards */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>NAAC Accreditation</span>
            <Award size={16} color="#0284c7" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#0284c7' }}>Grade {accreditationInfo.naacGrade}</div>
          <div className="principal-stat-box-sub">Institutional CGPA {accreditationInfo.naacScore}</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>NBA Accredited Branches</span>
            <ShieldCheck size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>4 UG Branches</div>
          <div className="principal-stat-box-sub">CSE, ECE, MECH, EEE (Tier-1)</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>NIRF Ranking Band</span>
            <Layers size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val">Rank 101–150</div>
          <div className="principal-stat-box-sub">National Engineering Category</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Overall Documentation Pace</span>
            <CheckCircle2 size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>
            {accreditationInfo.overallDocumentationPct}%
          </div>
          <div className="principal-stat-box-sub">
            {completedDossiersCount} of {dossiers.length} Regulatory Dossiers Filed
          </div>
        </div>
      </div>

      {/* SECTION 1: NAAC Criteria Status Table (Criteria 1-7) */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>NAAC Self-Study Report (SSR) — 7 Evaluative Criteria</h3>
            <p>Weightage distribution, benchmark attainments, and assigned dean leads</p>
          </div>
          <span className="pbadge info">Total Weightage: 1,000 Points</span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Criteria #</th>
                <th>Core Evaluative Dimension</th>
                <th>Weightage</th>
                <th>Institutional Score</th>
                <th>Documentation Pace (%)</th>
                <th>Assigned Executive Lead</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>Criterion {c.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{c.name}</strong>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.weightage} Pts</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#15803d' }}>{c.score}</span>
                  </td>
                  <td style={{ minWidth: '120px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="p-progress-track" style={{ flex: 1 }}>
                        <div
                          className="p-progress-fill"
                          style={{
                            width: `${c.completionPct}%`,
                            background: c.completionPct >= 90 ? '#10b981' : '#0284c7',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.completionPct}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#475569' }}>{c.lead}</td>
                  <td>
                    <span className={`pbadge ${c.status === 'Completed' ? 'success' : 'info'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Statutory Compliance Dossiers & Evidence Records */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Statutory Compliance Dossiers &amp; Evidence Records</h3>
            <p>Mandatory disclosures, peer team exhibits, environmental audits, and ranking submissions</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="principal-select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Compliance Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending Review</option>
            </select>
          </div>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Dossier Ref &amp; Title</th>
                <th>Statutory Authority</th>
                <th>Submission Deadline</th>
                <th>Verified By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDossiers.map((dos) => (
                <tr key={dos.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{dos.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Ref: {dos.id} · File: {dos.fileName}</div>
                  </td>
                  <td>
                    <span className="pbadge slate">{dos.authority}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{dos.deadline}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{dos.verifiedBy}</td>
                  <td>
                    <span
                      className={`pbadge ${
                        dos.status === 'Completed'
                          ? 'success'
                          : dos.status === 'In Progress'
                          ? 'warning'
                          : 'danger'
                      }`}
                    >
                      {dos.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="erp-btn erp-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        title="Preview Evidence Document"
                        onClick={() => setPreviewDossierModal(dos)}
                      >
                        <Eye size={13} /> Preview
                      </button>
                      {dos.status !== 'Completed' && (
                        <button
                          className="erp-btn erp-btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Verify & Seal Dossier"
                          onClick={() => setEndorseModal(dos)}
                        >
                          <Check size={13} /> Verify
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

      {/* ======================================================== */}
      {/* MODAL 1: PREVIEW DOSSIER EVIDENCE DOCUMENT               */}
      {/* ======================================================== */}
      {previewDossierModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '640px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Statutory Evidence: {previewDossierModal.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDossierModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                  Statutory Submission Authority: {previewDossierModal.authority}
                </div>
                <h4 style={{ margin: '4px 0 6px', color: '#0f172a' }}>{previewDossierModal.title}</h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Target Deadline: {previewDossierModal.deadline} · Status: <strong>{previewDossierModal.status}</strong>
                </div>
              </div>

              {/* Mock PDF Document Viewer Panel */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontSize: '0.82rem',
                  color: '#334155',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  minHeight: '180px',
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                    AUTONOMOUS INSTITUTIONAL ACCREDITATION DOSSIER
                  </div>
                  <small style={{ color: '#64748b' }}>File: {previewDossierModal.fileName} · Verified Cryptographic Hash: SHA-256-VALID</small>
                </div>
                <p style={{ margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                  This official exhibit contains complete audited departmental returns, faculty teaching hours, research grants received from DST/AICTE, and statutory committee ratifications for cycle review.
                </p>
                <div style={{ background: '#eff6ff', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', color: '#1e40af' }}>
                  ✓ Document verified by: <strong>{previewDossierModal.verifiedBy}</strong>
                </div>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setPreviewDossierModal(null)}>
                Close
              </button>
              <button className="erp-btn erp-btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print Exhibit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CONFIRM VERIFICATION & SEAL                     */}
      {/* ======================================================== */}
      {endorseModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '500px' }}>
            <div className="principal-modal-header">
              <h3 style={{ margin: 0 }}>Executive Verification &amp; Seal</h3>
              <button
                type="button"
                onClick={() => setEndorseModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: 0 }}>
                Certify and endorse compliance file <strong>{endorseModal.title}</strong> to {endorseModal.authority}?
              </p>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div><strong>Deadline:</strong> {endorseModal.deadline}</div>
                <div><strong>Authority:</strong> {endorseModal.authority}</div>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setEndorseModal(null)}>
                Cancel
              </button>
              <button className="erp-btn erp-btn-primary" onClick={handleConfirmEndorsement}>
                <CheckCircle2 size={15} /> Confirm Seal &amp; Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
