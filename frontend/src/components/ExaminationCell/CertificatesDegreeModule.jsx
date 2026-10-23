import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  FileText,
  Truck,
  Sparkles,
  QrCode
} from 'lucide-react';
import { examinationStore } from '../../services/examinationStore';

export default function CertificatesDegreeModule({ triggerToast }) {
  const [certificates, setCertificates] = useState(() => examinationStore.getCertificates());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [previewCert, setPreviewCert] = useState(null);
  const [dispatchModal, setDispatchModal] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    certNo: '',
    trackingNo: '',
  });

  const filteredCerts = useMemo(() => {
    return certificates.filter(c => {
      const matchSearch =
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.certificateNo && c.certificateNo.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchType = typeFilter === 'all' || c.requestType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [certificates, searchQuery, statusFilter, typeFilter]);

  const handleApprove = (id) => {
    const certNo = `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = examinationStore.updateCertificateStatus(id, 'Approved & In Printing', certNo);
    setCertificates([...examinationStore.getCertificates()]);
    triggerToast(`Certificate request ${id} approved and forwarded to embossing/printing queue.`);
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    if (!dispatchModal) return;
    const certNo = dispatchForm.certNo || dispatchModal.certificateNo || `CERT-${Math.floor(1000 + Math.random() * 9000)}`;
    examinationStore.updateCertificateStatus(
      dispatchModal.id,
      dispatchModal.issueMode === 'Counter Pickup' ? 'Ready for Collection' : 'Dispatched via Speed Post',
      certNo,
      dispatchForm.trackingNo
    );
    setCertificates([...examinationStore.getCertificates()]);
    setDispatchModal(null);
    triggerToast(`Certificate ${certNo} marked as ready / dispatched.`);
  };

  return (
    <div>
      {/* KPI Stats */}
      <div className="erp-stats-grid">
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Total Certificate Requests</span>
            <Award size={18} color="#7c3aed" />
          </div>
          <div className="erp-stat-val">{certificates.length} Requests</div>
          <div className="erp-stat-note">Degree, Transcripts &amp; PDCs</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Ready for Collection</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div className="erp-stat-val" style={{ color: '#16a34a' }}>
            {certificates.filter(c => c.status.includes('Ready') || c.status.includes('Dispatched')).length}
          </div>
          <div className="erp-stat-note">Counter pickup &amp; postal</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Pending Verification</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div className="erp-stat-val" style={{ color: '#d97706' }}>
            {certificates.filter(c => c.status === 'Under Verification').length}
          </div>
          <div className="erp-stat-note">Document &amp; No-Dues check</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">In Printing / Embossing</span>
            <Printer size={18} color="#0284c7" />
          </div>
          <div className="erp-stat-val" style={{ color: '#0284c7' }}>
            {certificates.filter(c => c.status.includes('Printing')).length}
          </div>
          <div className="erp-stat-note">Security watermark seal</div>
        </div>
      </div>

      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Academic Certificates, Transcripts &amp; Degree Issuance Desk</h3>
            <p>Process Provisional Certificates, Degree Parchments, WES Transcripts, and Duplicate Grade Cards</p>
          </div>
        </div>

        <div className="exam-toolbar">
          <div className="exam-search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by candidate name, roll no, reg no, or certificate no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="exam-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Document Types</option>
            <option value="Provisional Degree Certificate">Provisional Degree (PDC)</option>
            <option value="Official Academic Transcript (WES Format)">Official Transcript (WES)</option>
            <option value="Duplicate Grade Card (Semester 3)">Duplicate Grade Card</option>
            <option value="Migration Certificate">Migration Certificate</option>
          </select>
          <select
            className="exam-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Processing Statuses</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Approved & In Printing">Approved &amp; In Printing</option>
            <option value="Ready for Collection">Ready for Collection</option>
            <option value="Dispatched via Speed Post">Dispatched via Speed Post</option>
          </select>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Request ID &amp; Candidate</th>
                <th>Program &amp; CGPA</th>
                <th>Requested Certificate</th>
                <th>Compliance Checks</th>
                <th>Status &amp; Certificate No</th>
                <th>Dispatch Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.studentName}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Roll: {c.rollNumber} · <code>{c.id}</code>
                    </div>
                  </td>
                  <td>
                    <div>{c.course}</div>
                    <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
                      CGPA: {c.cgpa} ({c.passingYear})
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{c.requestType}</strong>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Fee: {c.feePaid}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.72rem' }}>
                      <span style={{ color: c.requiredDocuments.noDues ? '#16a34a' : '#dc2626' }}>
                        {c.requiredDocuments.noDues ? '✓ Central No Dues' : '✕ Dues Pending'}
                      </span>
                      <span style={{ color: c.requiredDocuments.feeReceipt ? '#16a34a' : '#dc2626' }}>
                        {c.requiredDocuments.feeReceipt ? '✓ Fee Paid' : '✕ Fee Unverified'}
                      </span>
                      <span style={{ color: c.requiredDocuments.idProof ? '#16a34a' : '#dc2626' }}>
                        {c.requiredDocuments.idProof ? '✓ Govt ID Verified' : '✕ ID Proof Awaited'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      c.status.includes('Ready') || c.status.includes('Dispatched') ? 'success' :
                      c.status.includes('Printing') ? 'purple' : 'warning'
                    }`}>
                      {c.status}
                    </span>
                    {c.certificateNo && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                        <code>{c.certificateNo}</code>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.issueMode}</div>
                    {c.trackingNumber && (
                      <div style={{ fontSize: '0.7rem', color: '#0284c7' }}>
                        Track: <code>{c.trackingNumber}</code>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="erp-btn erp-btn-outline erp-btn-sm"
                        onClick={() => setPreviewCert(c)}
                        title="View Official Certificate Layout"
                      >
                        <Eye size={13} /> Certificate
                      </button>
                      {c.status === 'Under Verification' && (
                        <button
                          className="erp-btn erp-btn-primary erp-btn-sm"
                          onClick={() => handleApprove(c.id)}
                          title="Verify Documents & Approve for Printing"
                        >
                          <Check size={13} /> Approve
                        </button>
                      )}
                      {c.status.includes('Printing') && (
                        <button
                          className="erp-btn erp-btn-secondary erp-btn-sm"
                          onClick={() => {
                            setDispatchModal(c);
                            setDispatchForm({
                              certNo: c.certificateNo || `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
                              trackingNo: c.trackingNumber || ''
                            });
                          }}
                          title="Mark Dispatched or Ready for Counter Collection"
                        >
                          <Truck size={13} /> Mark Issued
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

      {/* MODAL 1: PREVIEW OFFICIAL CERTIFICATE */}
      {previewCert && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card lg">
            <div className="exam-modal-header">
              <div>
                <h3>Official Certificate Preview</h3>
                <p>Authentic institutional layout with cryptographic QR verification stamp</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setPreviewCert(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-body">
              <div style={{
                background: '#ffffff',
                border: '4px double #b45309',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  right: '20px',
                  width: '64px',
                  height: '64px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8fafc'
                }}>
                  <QrCode size={40} color="#0f172a" />
                  <span style={{ fontSize: '0.55rem', color: '#64748b' }}>VERIFIED</span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '46px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f2b48', letterSpacing: '0.04em' }}>
                  APNA CAMPUS
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  An Autonomous Institution Affiliated to BPUT, Rourkela | Approved by AICTE, New Delhi
                </p>
                <div style={{
                  display: 'inline-block',
                  borderBottom: '2px solid #b45309',
                  paddingBottom: '3px',
                  marginTop: '1.25rem',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#92400e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  {previewCert.requestType}
                </div>

                <p style={{ margin: '1.75rem 0 1rem', fontSize: '0.92rem', color: '#334155', lineHeight: 1.8 }}>
                  This is to certify that <strong>{previewCert.studentName.toUpperCase()}</strong>,
                  bearing Registration Number <strong>{previewCert.regNo}</strong> and Roll Number <strong>{previewCert.rollNumber}</strong>,
                  has successfully fulfilled all statutory requirements and examinations for the award of
                  <strong> {previewCert.course}</strong> in the year <strong>{previewCert.passingYear}</strong>,
                  securing a Cumulative Grade Point Average (CGPA) of <strong>{previewCert.cgpa}</strong> on a 10.00 Point Scale.
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '2.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ textAlign: 'left', color: '#64748b' }}>
                    <div>Certificate Ref: <strong>{previewCert.certificateNo || 'PENDING-ISSUANCE'}</strong></div>
                    <div>Date of Issue: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
                    <div>Bhubaneswar, Odisha - 752054</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#0f2b48' }}>Dr. K. C. Patra</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Controller of Examinations</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button type="button" className="erp-btn erp-btn-secondary" onClick={() => window.print()}>
                <Printer size={14} /> Print Certificate
              </button>
              <button type="button" className="erp-btn erp-btn-primary" onClick={() => setPreviewCert(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPATCH / ISSUE */}
      {dispatchModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Issue Certificate to Candidate</h3>
                <p>Request: <code>{dispatchModal.id}</code> · {dispatchModal.studentName}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setDispatchModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleDispatch}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Official Certificate Serial Number *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      value={dispatchForm.certNo}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, certNo: e.target.value })}
                    />
                  </div>
                  {dispatchModal.issueMode !== 'Counter Pickup' && (
                    <div className="exam-form-group full">
                      <label className="exam-form-label">Postal / Speed Post Tracking Consignment Number *</label>
                      <input
                        type="text"
                        className="exam-form-input"
                        required
                        placeholder="e.g. EW883918293IN"
                        value={dispatchForm.trackingNo}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, trackingNo: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setDispatchModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Check size={14} /> Confirm &amp; Dispatch Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
