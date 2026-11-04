import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  Upload,
  X,
  XCircle
} from 'lucide-react';
import { transportStore } from '../../services/transportStore';
import './TransportExtraSections.css';

export default function TransportLicenseVerificationSection() {
  const [licenses, setLicenses] = useState(() => transportStore.getLicenseVerifications());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLic, setSelectedLic] = useState(null);
  const [renewalForm, setRenewalForm] = useState({
    licenseNumber: '',
    validityExpiry: '',
    medicalFitnessDate: '',
    verificationStatus: 'Verified',
  });

  useEffect(() => {
    const unsub = transportStore.subscribe(() => {
      setLicenses(transportStore.getLicenseVerifications());
    });
    return unsub;
  }, []);

  const filteredLicenses = useMemo(() => {
    return licenses.filter(l => {
      const matchSearch = (l.driverName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (l.licenseNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (l.issuingRTO || '').toLowerCase().includes(search.toLowerCase()) ||
                          (l.psvBadgeNumber || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || l.verificationStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [licenses, search, statusFilter]);

  const verifiedCount = licenses.filter(l => l.verificationStatus === 'Verified').length;
  const expiringSoonCount = licenses.filter(l => l.verificationStatus === 'Expiring Soon').length;
  const pendingCount = licenses.filter(l => l.verificationStatus === 'Pending Review' || l.verificationStatus === 'Action Required').length;

  const handleOpenRenew = (lic) => {
    setSelectedLic(lic);
    setRenewalForm({
      licenseNumber: lic.licenseNumber,
      validityExpiry: lic.validityExpiry,
      medicalFitnessDate: lic.medicalFitnessDate,
      verificationStatus: 'Verified',
    });
  };

  const handleSaveRenewal = async (e) => {
    e.preventDefault();
    if (!selectedLic) return;
    await transportStore.verifyLicenseDocument(selectedLic.id, renewalForm);
    setSelectedLic(null);
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><FileCheck2 size={24} className="text-sky-600" /> Driving Licence & Crew Document Verification</h2>
          <p>Regulatory RTO verification of Heavy Motor Vehicle (HMV) driving licences, PSV passenger transport badges, and mandatory medical fitness audits.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><ShieldCheck size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{verifiedCount}</span>
            <span className="trans-kpi-title">Verified & Valid</span>
            <span className="trans-kpi-subtitle">Compliant HMV licences</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{expiringSoonCount}</span>
            <span className="trans-kpi-title">Expiring Soon (60 Days)</span>
            <span className="trans-kpi-subtitle">Renewal docket requested</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><FileText size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{licenses.length}</span>
            <span className="trans-kpi-title">Total Active Crew Licences</span>
            <span className="trans-kpi-subtitle">BPUT RTO registered records</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><AlertTriangle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{pendingCount}</span>
            <span className="trans-kpi-title">Pending Annual Medical</span>
            <span className="trans-kpi-subtitle">Vision & physical check</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="trans-filter-bar">
        <div className="trans-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by driver name, licence number, PSV badge, or issuing RTO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="trans-filter-dropdowns">
          <div className="trans-select-wrap">
            <Filter size={15} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Verification Statuses</option>
              <option value="Verified">Verified & Valid</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Pending Review">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="trans-table-card">
        <div className="trans-table-wrap">
          <table className="trans-table">
            <thead>
              <tr>
                <th>Driver Name & Staff ID</th>
                <th>Licence Number</th>
                <th>Category</th>
                <th>Issuing RTO</th>
                <th>Licence Expiry</th>
                <th>Medical Fitness Audit</th>
                <th>PSV Badge No</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px' }}>
                    No crew licence records match the query.
                  </td>
                </tr>
              ) : (
                filteredLicenses.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.driverName}</div>
                      <span className="trans-code-badge">{item.employeeId}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#0284c7' }}>{item.licenseNumber}</strong>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.issuingRTO}</td>
                    <td>
                      <strong>{item.validityExpiry}</strong>
                    </td>
                    <td>
                      <div>{item.medicalFitnessStatus}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Last: {item.medicalFitnessDate}</div>
                    </td>
                    <td>
                      <span className="trans-code-badge">{item.psvBadgeNumber}</span>
                    </td>
                    <td>
                      <span className={`trans-status-badge ${item.verificationStatus === 'Verified' ? 'success' : 'warning'}`}>
                        {item.verificationStatus === 'Verified' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="trans-btn trans-btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                        onClick={() => handleOpenRenew(item)}
                      >
                        <Upload size={13} /> Update / Verify
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification / Renewal Modal */}
      {selectedLic && (
        <div className="trans-modal-overlay">
          <div className="trans-modal-card" style={{ maxWidth: '520px' }}>
            <div className="trans-modal-header">
              <h3><ShieldCheck size={20} className="text-emerald-600" /> Verify Driving Licence & Medical Record</h3>
              <button className="trans-modal-close" onClick={() => setSelectedLic(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveRenewal}>
              <div className="trans-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.86rem' }}>
                  <span style={{ color: '#64748b' }}>Driver Name:</span>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{selectedLic.driverName} ({selectedLic.employeeId})</strong>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Licence Number</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={renewalForm.licenseNumber}
                    onChange={(e) => setRenewalForm({ ...renewalForm, licenseNumber: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>New Expiry Date *</label>
                    <input 
                      type="date" 
                      required 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={renewalForm.validityExpiry}
                      onChange={(e) => setRenewalForm({ ...renewalForm, validityExpiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Medical Exam Date *</label>
                    <input 
                      type="date" 
                      required 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={renewalForm.medicalFitnessDate}
                      onChange={(e) => setRenewalForm({ ...renewalForm, medicalFitnessDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Verification Status</label>
                  <select 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={renewalForm.verificationStatus}
                    onChange={(e) => setRenewalForm({ ...renewalForm, verificationStatus: e.target.value })}
                  >
                    <option value="Verified">Verified & Valid</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-secondary" onClick={() => setSelectedLic(null)}><X size={14} /> Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">
                  <Check size={16} /> Save Document Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

