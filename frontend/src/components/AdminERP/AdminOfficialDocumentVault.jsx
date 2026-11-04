import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Download,
  Search,
  Filter,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Building2,
  ChevronRight,
  X,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminOfficialDocumentVault({ account }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Statutory Policy',
    issuingAuthority: 'Office of the Principal',
    retentionYears: 10,
    isConfidential: false,
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOfficialDocuments();
      if (res?.data && Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Error fetching official documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleRegisterDoc = async (e) => {
    e.preventDefault();
    try {
      const res = await api.registerAdminOfficialDocument(docForm);
      if (res?.data) {
        setDocuments([res.data, ...documents]);
        setIsDocModalOpen(false);
        showToast(`Document ${res.data.documentNo} archived in vault!`);
      }
    } catch (err) {
      alert('Error registering document: ' + err.message);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.documentNo.toLowerCase().includes(search.toLowerCase()) || d.issuingAuthority.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || d.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchSearch && matchCat;
  });

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <Shield size={13} />
            Institutional Record Archive &amp; Document Management Vault
          </div>
          <h2>Official Institutional Documents, Policies &amp; Minutes Vault</h2>
          <p>
            Cryptographically audited repository for statutory policies, ratified council minutes, accreditation dossiers, and legal MoUs with retention rules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="admin-action-btn-primary" onClick={() => setIsDocModalOpen(true)}>
            <Plus size={14} /> Deposit Official Document
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search by title, document number, authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', width: '280px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '5px 8px', fontSize: '12px' }}
            >
              <option value="ALL">All Categories</option>
              <option value="Statutory Policy">Statutory Policies</option>
              <option value="Governing Body Minutes">Council Minutes</option>
              <option value="Contract & Agreement">Contracts &amp; MoUs</option>
              <option value="Accreditation Evidence">Accreditation Evidence</option>
            </select>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Document No.</th>
                <th>Title &amp; Scope</th>
                <th>Category</th>
                <th>Issuing Authority</th>
                <th>Issued Date</th>
                <th>Version</th>
                <th>Access Policy</th>
                <th>Retention</th>
                <th>Vault Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                      {doc.documentNo}
                    </code>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{doc.title}</strong>
                  </td>
                  <td>
                    <span className="admin-badge boys" style={{ fontSize: '11px' }}>
                      {doc.category}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#334155' }}>{doc.issuingAuthority}</td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>{doc.issuedDate}</td>
                  <td>
                    <code style={{ fontSize: '11px' }}>v{doc.version}</code>
                  </td>
                  <td>
                    {doc.isConfidential ? (
                      <span className="admin-badge rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                        <Lock size={10} /> Confidential (Executive)
                      </span>
                    ) : (
                      <span className="admin-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                        <Unlock size={10} /> Public Institutional
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {doc.retentionYears} Years
                  </td>
                  <td>
                    <button
                      onClick={() => showToast(`Encrypted document ${doc.documentNo} downloaded`)}
                      className="admin-action-btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                    >
                      <Download size={11} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Deposit Document */}
      {isDocModalOpen && (
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
              onClick={() => setIsDocModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 12px 0' }}>
              Deposit Official Document in Vault
            </h3>
            <form onSubmit={handleRegisterDoc} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Document Title</label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g. Institutional Intellectual Property Rights (IPR) Policy 2026"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Category</label>
                <select
                  value={docForm.category}
                  onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Statutory Policy">Statutory Policy</option>
                  <option value="Governing Body Minutes">Governing Body Minutes</option>
                  <option value="Academic Senate Resolution">Academic Senate Resolution</option>
                  <option value="Contract & Agreement">Contract &amp; Agreement (MoU)</option>
                  <option value="Accreditation Evidence">Accreditation Evidence Dossier</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Issuing Authority</label>
                  <input
                    type="text"
                    value={docForm.issuingAuthority}
                    onChange={(e) => setDocForm({ ...docForm, issuingAuthority: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Retention (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={docForm.retentionYears}
                    onChange={(e) => setDocForm({ ...docForm, retentionYears: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="confidentialCheck"
                  checked={docForm.isConfidential}
                  onChange={(e) => setDocForm({ ...docForm, isConfidential: e.target.checked })}
                />
                <label htmlFor="confidentialCheck" style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                  Restricted / Confidential Document (Executive Clearance Only)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="admin-action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                >
                  Archive in Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

