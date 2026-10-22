import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, ShieldAlert, ShieldCheck, AlertTriangle, Search, 
  Upload, Eye, Calendar, FileText, Check, X, RefreshCw 
} from 'lucide-react';
import { mockVehicleCompliance } from './transportData';
import './TransportExtraSections.css';

export default function TransportComplianceSection() {
  const [data, setData] = useState(mockVehicleCompliance);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Upload form state
  const [docBus, setDocBus] = useState('OD-02-AK-4411');
  const [docType, setDocType] = useState('Insurance Certificate');
  const [docNumber, setDocNumber] = useState('');
  const [docExpiry, setDocExpiry] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.busNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.fleetCode.toLowerCase().includes(search.toLowerCase()) ||
                          item.insurancePolicy.toLowerCase().includes(search.toLowerCase()) ||
                          item.permitNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  // Statistics
  const totalBuses = data.length;
  const compliantCount = data.filter(d => d.status === 'Compliant').length;
  const expiringSoonCount = data.filter(d => d.status === 'Expiring Soon').length;
  const expiredCount = data.filter(d => d.status === 'Non-Compliant').length;

  const handleUploadDoc = (e) => {
    e.preventDefault();
    setData(prev => prev.map(item => {
      if (item.busNumber === docBus) {
        return {
          ...item,
          status: 'Compliant',
          daysRemaining: 365,
          insuranceExpiry: docType.includes('Insurance') ? docExpiry : item.insuranceExpiry,
          pucExpiry: docType.includes('PUC') ? docExpiry : item.pucExpiry,
          fitnessExpiry: docType.includes('Fitness') ? docExpiry : item.fitnessExpiry
        };
      }
      return item;
    }));
    setUploadModal(false);
    setDocNumber('');
    setDocExpiry('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><FileCheck2 size={24} className="text-sky-600" /> Vehicle Documents & Compliance</h2>
          <p>RTO Stage Carriage permits, Fitness Certificates, Comprehensive Insurance, and PUC green audit.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-primary" onClick={() => setUploadModal(true)}>
            <Upload size={16} /> Upload & Renew Document
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><FileCheck2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalBuses}</span>
            <span className="trans-kpi-title">Fleet Vehicles</span>
            <span className="trans-kpi-subtitle">All RTO registered</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><ShieldCheck size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{compliantCount}</span>
            <span className="trans-kpi-title">Fully Compliant</span>
            <span className="trans-kpi-subtitle">All 5 documents certified</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><AlertTriangle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{expiringSoonCount}</span>
            <span className="trans-kpi-title">Expiring Soon</span>
            <span className="trans-kpi-subtitle" style={{ color: '#d97706', fontWeight: 600 }}>Expires within 30 days</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><ShieldAlert size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{expiredCount}</span>
            <span className="trans-kpi-title">Defaulter / Expired</span>
            <span className="trans-kpi-subtitle">Immediate ground notice</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="trans-filter-strip">
        <div className="trans-filter-group">
          <div className="trans-search-input">
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search registration, policy, permit..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Compliance Statuses</option>
            <option value="Compliant">Fully Compliant</option>
            <option value="Expiring Soon">Expiring Soon (Alert)</option>
            <option value="Non-Compliant">Non-Compliant</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Audited against <strong>Govt of Odisha Transport Dept</strong> norms
          </span>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Vehicle & Fleet</th>
                <th>Fitness Valid Till</th>
                <th>Insurance Policy & Expiry</th>
                <th>PUC Green Expiry</th>
                <th>Stage Permit Valid Till</th>
                <th>Road Tax</th>
                <th>Compliance Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id} style={{ background: item.status === 'Expiring Soon' ? '#fffbeb' : 'transparent' }}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.busNumber}</div>
                    <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{item.fleetCode}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.fitnessExpiry}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.insuranceExpiry}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{item.insurancePolicy}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.pucExpiry}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{item.pucNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.permitExpiry}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{item.permitNumber}</div>
                  </td>
                  <td>
                    <span className="trans-badge info" style={{ fontSize: '0.72rem' }}>
                      {item.roadTaxStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`trans-badge ${
                      item.status === 'Compliant' ? 'success' :
                      item.status === 'Expiring Soon' ? 'warning' : 'danger'
                    }`}>
                      {item.status} ({item.daysRemaining}d left)
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="trans-btn trans-btn-outline" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedDoc(item)}
                    >
                      <Eye size={13} /> Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Dossier Modal */}
      {selectedDoc && (
        <div className="trans-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><FileCheck2 size={18} className="text-sky-600" /> Compliance Dossier: {selectedDoc.busNumber}</h3>
              <button className="trans-modal-close" onClick={() => setSelectedDoc(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>FITNESS CERTIFICATE</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Valid until {selectedDoc.fitnessExpiry}</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 2 }}>✓ Certified by Regional Transport Office</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>COMPREHENSIVE INSURANCE</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Valid until {selectedDoc.insuranceExpiry}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>Policy: {selectedDoc.insurancePolicy}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>POLLUTION UNDER CONTROL (PUC)</div>
                  <div style={{ fontWeight: 800, color: selectedDoc.daysRemaining <= 30 ? '#d97706' : '#0f172a' }}>
                    Valid until {selectedDoc.pucExpiry}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>Certificate: {selectedDoc.pucNumber}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>STATE TRANSPORT PERMIT</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Valid until {selectedDoc.permitExpiry}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>Permit: {selectedDoc.permitNumber}</div>
                </div>
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setSelectedDoc(null)}>Close</button>
              <button className="trans-btn trans-btn-primary" onClick={() => { setSelectedDoc(null); setUploadModal(true); setDocBus(selectedDoc.busNumber); }}>
                Upload Renewal Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Renewal Modal */}
      {uploadModal && (
        <div className="trans-modal-overlay" onClick={() => setUploadModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Upload size={18} className="text-sky-600" /> Upload Renewed Vehicle Document</h3>
              <button className="trans-modal-close" onClick={() => setUploadModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleUploadDoc}>
              <div className="trans-modal-body">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Select Vehicle</label>
                  <select className="trans-select" style={{ width: '100%' }} value={docBus} onChange={e => setDocBus(e.target.value)}>
                    <option value="OD-02-AK-4411">OD-02-AK-4411 (Bus 01)</option>
                    <option value="OD-02-AK-4412">OD-02-AK-4412 (Bus 02)</option>
                    <option value="OD-02-BL-8890">OD-02-BL-8890 (Bus 03)</option>
                    <option value="OD-02-BL-8891">OD-02-BL-8891 (Bus 04)</option>
                    <option value="OD-02-CL-1209">OD-02-CL-1209 (Bus 05)</option>
                  </select>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Document Type</label>
                  <select className="trans-select" style={{ width: '100%' }} value={docType} onChange={e => setDocType(e.target.value)}>
                    <option value="PUC Green Certificate">Pollution Under Control (PUC) Certificate</option>
                    <option value="Comprehensive Insurance Policy">Comprehensive Insurance Policy</option>
                    <option value="Fitness Inspection Certificate">Fitness Inspection Certificate</option>
                    <option value="Stage Carriage Permit">Stage Carriage Permit</option>
                  </select>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Document Reference No</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="e.g. PUC-2027-991" value={docNumber} onChange={e => setDocNumber(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>New Expiry Date</label>
                    <input type="date" className="trans-select" style={{ width: '100%' }} value={docExpiry} onChange={e => setDocExpiry(e.target.value)} required />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', border: '2px dashed #cbd5e1', padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
                  <Upload size={24} color="#64748b" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>Attach scanned PDF or high-res JPG certificate</div>
                  <input type="file" style={{ marginTop: 6, fontSize: '0.75rem' }} />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setUploadModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Update Compliance Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
