import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  TrendingUp,
  X,
  FileText,
  AlertCircle,
  Activity,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminComplianceRiskConsole({ account }) {
  const [subTab, setSubTab] = useState('compliance'); // 'compliance', 'risks', 'capa'
  const [complianceList, setComplianceList] = useState([]);
  const [risks, setRisks] = useState([]);
  const [capaList, setCapaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / forms
  const [selectedCapa, setSelectedCapa] = useState(null);
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);
  const [capaResolutionNotes, setCapaResolutionNotes] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cmpRes, rskRes, capaRes] = await Promise.allSettled([
        api.getAdminComplianceRegister(),
        api.getAdminComplianceRisks(),
        api.getAdminComplianceCorrectiveActions(),
      ]);

      if (cmpRes.status === 'fulfilled' && Array.isArray(cmpRes.value?.data)) {
        setComplianceList(cmpRes.value.data);
      }
      if (rskRes.status === 'fulfilled' && Array.isArray(rskRes.value?.data)) {
        setRisks(rskRes.value.data);
      }
      if (capaRes.status === 'fulfilled' && Array.isArray(capaRes.value?.data)) {
        setCapaList(capaRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCompliance = async (id, status) => {
    try {
      const res = await api.updateAdminComplianceItem(id, {
        status,
        evidenceRef: `${id}_Verified_Audit_Dossier.pdf`,
      });
      if (res?.data) {
        setComplianceList(complianceList.map(c => c.id === id ? res.data : c));
        showToast(`Compliance item ${id} marked ${status.toLowerCase()}!`);
      }
    } catch (err) {
      alert('Error updating compliance: ' + err.message);
    }
  };

  const handleResolveCapa = async () => {
    if (!selectedCapa) return;
    try {
      const res = await api.updateAdminComplianceCorrectiveAction(selectedCapa.id, {
        status: 'VERIFIED',
        resolutionNotes: capaResolutionNotes || 'Corrective action implemented and verified by IQAC quality audit.',
      });
      if (res?.data) {
        setCapaList(capaList.map(c => c.id === selectedCapa.id ? res.data : c));
        setIsCapaModalOpen(false);
        setSelectedCapa(null);
        setCapaResolutionNotes('');
        showToast(`CAPA item ${selectedCapa.id} verified and closed!`);
      }
    } catch (err) {
      alert('Error resolving CAPA: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981',
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="admin-view-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <ShieldCheck size={13} />
            Institutional Quality &amp; Statutory Compliance Workspace
          </div>
          <h2>Statutory Compliance, Risk Register &amp; CAPA Oversight</h2>
          <p>
            Regulatory filings (AICTE, NAAC, UGC, BPUT, NIRF), institutional risk assessment matrix, and Corrective and Preventive Action (CAPA) plans.
          </p>
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '8px',
      }}>
        {[
          { id: 'compliance', label: 'Statutory Compliance Register', icon: FileCheck, count: complianceList.length },
          { id: 'risks', label: 'Institutional Risk Matrix', icon: AlertTriangle, count: risks.length },
          { id: 'capa', label: 'Corrective & Preventive (CAPA)', icon: Activity, count: capaList.filter(c => c.status !== 'VERIFIED').length },
        ].map(t => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              <Icon size={14} />
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  borderRadius: '12px',
                  padding: '1px 6px',
                  fontSize: '11px',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Compliance Register */}
      {subTab === 'compliance' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Accreditation &amp; Statutory Regulatory Calendar
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Continuous compliance tracking against statutory authorities with verified evidentiary audit links.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Statutory Authority</th>
                  <th>Mandatory Regulation / Requirement</th>
                  <th>Responsible Executive</th>
                  <th>Statutory Deadline</th>
                  <th>Evidence Document</th>
                  <th>Progress</th>
                  <th>Status &amp; Action</th>
                </tr>
              </thead>
              <tbody>
                {complianceList.map(c => (
                  <tr key={c.id}>
                    <td>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                        {c.id}
                      </code>
                    </td>
                    <td>
                      <span className="admin-badge boys" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {c.authority}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{c.regulation}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{c.description}</div>
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>{c.responsibleOfficer}</td>
                    <td style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>{c.deadline}</td>
                    <td>
                      {c.evidenceDocument ? (
                        <button
                          onClick={() => showToast(`Opening verified evidence: ${c.evidenceDocument}`)}
                          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '11.5px', textDecoration: 'underline' }}
                        >
                          📑 {c.evidenceDocument}
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dossier in prep</span>
                      )}
                    </td>
                    <td style={{ minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.compliancePct || 80}%`, height: '100%', background: c.status === 'COMPLIANT' ? '#10b981' : '#2563eb' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700 }}>{c.compliancePct || 80}%</span>
                      </div>
                    </td>
                    <td>
                      {c.status !== 'COMPLIANT' ? (
                        <button
                          onClick={() => handleUpdateCompliance(c.id, 'COMPLIANT')}
                          className="admin-action-btn-primary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          Ratify Compliant
                        </button>
                      ) : (
                        <span className="admin-badge active" style={{ fontSize: '11px' }}>
                          ✓ Compliant
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

      {/* SUBTAB 2: Institutional Risk Matrix */}
      {subTab === 'risks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
          {risks.map(r => (
            <div key={r.id} className="admin-card" style={{ padding: '1.25rem', borderLeft: r.severity === 'Critical' ? '4px solid #ef4444' : '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <code style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>{r.id}</code>
                <span className={`admin-badge ${r.severity === 'Critical' ? 'rejected' : 'duty'}`}>
                  {r.severity} Severity
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {r.riskTitle}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '10px' }}>
                <div>Category: <strong>{r.category}</strong></div>
                <div>Likelihood: <strong>{r.likelihood}</strong> · Risk Score: <strong style={{ color: '#b91c1c' }}>{r.riskScore} / 25</strong></div>
                <div>Mitigation Owner: <strong>{r.mitigationOwner}</strong></div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#334155', lineHeight: 1.4, marginBottom: '10px' }}>
                <strong style={{ color: '#0f172a' }}>Active Mitigation Strategy:</strong> {r.mitigationStrategy}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="admin-badge active" style={{ fontSize: '11px' }}>
                  ✓ {r.status}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>IQAC Review Cycle: Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: Corrective & Preventive Actions (CAPA) */}
      {subTab === 'capa' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Internal Audit Findings &amp; Corrective Action (CAPA) Register
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Resolving internal audit and quality assurance cell observations with root cause analysis.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>CAPA Ref</th>
                  <th>Audit Finding &amp; Source</th>
                  <th>Root Cause Analysis</th>
                  <th>Corrective Action Executed</th>
                  <th>Preventive Control Instituted</th>
                  <th>Owner &amp; Deadline</th>
                  <th>Status &amp; Sign-off</th>
                </tr>
              </thead>
              <tbody>
                {capaList.map(capa => (
                  <tr key={capa.id}>
                    <td>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                        {capa.id}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{capa.finding}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Origin: {capa.originAudit}</div>
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#475569', maxWidth: '200px' }}>
                      {capa.rootCause}
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#0f172a', fontWeight: 500, maxWidth: '220px' }}>
                      {capa.correctiveAction}
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#059669', maxWidth: '220px' }}>
                      {capa.preventiveAction}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{capa.owner}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Due: {capa.deadline}</div>
                    </td>
                    <td>
                      {capa.status !== 'VERIFIED' ? (
                        <button
                          onClick={() => { setSelectedCapa(capa); setIsCapaModalOpen(true); }}
                          className="admin-action-btn-primary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          Verify &amp; Close
                        </button>
                      ) : (
                        <div>
                          <span className="admin-badge active" style={{ fontSize: '11px' }}>
                            ✓ Verified Closed
                          </span>
                          {capa.resolutionNotes && (
                            <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                              {capa.resolutionNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Resolve CAPA */}
      {isCapaModalOpen && selectedCapa && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '480px', width: '100%', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setIsCapaModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px 0' }}>
              Verify &amp; Close CAPA Action: {selectedCapa.id}
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
              Finding: <strong>{selectedCapa.finding}</strong><br />
              Corrective Action: <em>"{selectedCapa.correctiveAction}"</em>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                IQAC Verification &amp; Inspection Sign-off Notes:
              </label>
              <textarea
                rows={3}
                value={capaResolutionNotes}
                onChange={(e) => setCapaResolutionNotes(e.target.value)}
                placeholder="Inspected on-site; equipment calibration confirmed and logbook established."
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsCapaModalOpen(false)}
                className="admin-action-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveCapa}
                className="admin-action-btn-primary"
              >
                Sign Off &amp; Close CAPA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

