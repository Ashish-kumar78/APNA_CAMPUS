import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, Search, 
  Filter, FileText, Check, X, ShieldAlert, Award, Calendar 
} from 'lucide-react';
import { mockSafetyInspections } from './transportData';
import './TransportExtraSections.css';

export default function TransportSafetySection() {
  const [data, setData] = useState(mockSafetyInspections);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [newAuditModal, setNewAuditModal] = useState(false);

  // New Audit State
  const [auditBus, setAuditBus] = useState('OD-02-AK-4412');
  const [inspector, setInspector] = useState('Mr. S. K. Behera (Transport Administrator)');
  const [score, setScore] = useState('96%');
  const [govStatus, setGovStatus] = useState('Calibrated at 60 km/h');
  const [fireExt, setFireExt] = useState('Valid (Certified Pressure)');
  const [firstAid, setFirstAid] = useState('Fully Restocked');
  const [exitDoor, setExitDoor] = useState('Functional & Tested');
  const [tyres, setTyres] = useState('4.5mm (Good)');
  const [findings, setFindings] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.busNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.inspector.toLowerCase().includes(search.toLowerCase()) ||
                          item.findings.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status.includes(statusFilter);
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  // Statistics
  const totalAudits = data.length;
  const certifiedCount = data.filter(d => d.status.includes('Compliant')).length;
  const actionRequiredCount = data.filter(d => d.status.includes('Action')).length;

  const handleSaveAudit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `INSP-SAF-0${data.length + 1}`,
      busNumber: auditBus,
      fleetCode: auditBus === 'OD-02-AK-4411' ? 'Bus 01' : auditBus === 'OD-02-AK-4412' ? 'Bus 02' : 'Bus 04',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspector,
      score,
      status: 'Compliant & Certified',
      checklist: {
        speedGovernor: govStatus,
        fireExtinguisher: fireExt,
        firstAidKit: firstAid,
        emergencyExit: exitDoor,
        tyreTreadDepth: tyres
      },
      findings: findings || 'All critical safety devices inspected and operational.',
      followUpDate: '2026-11-20'
    };
    setData([newEntry, ...data]);
    setNewAuditModal(false);
    setFindings('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><ShieldCheck size={24} className="text-sky-600" /> Transport Safety & Inspections</h2>
          <p>Statutory AIS-140 safety audits, speed governor calibrations, fire equipment checks, and tyre wear logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-primary" onClick={() => setNewAuditModal(true)}>
            <Award size={16} /> Conduct Pre-Trip Safety Audit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><ShieldCheck size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalAudits}</span>
            <span className="trans-kpi-title">Safety Inspections</span>
            <span className="trans-kpi-subtitle">Monthly multi-point check</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{certifiedCount}</span>
            <span className="trans-kpi-title">Certified Fit</span>
            <span className="trans-kpi-subtitle">Passed 10-point checklist</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><AlertTriangle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{actionRequiredCount}</span>
            <span className="trans-kpi-title">Corrective Notice</span>
            <span className="trans-kpi-subtitle">Extinguisher / wiper swap</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">60 km/h</span>
            <span className="trans-kpi-title">Speed Governor Locked</span>
            <span className="trans-kpi-subtitle">AIS-140 RTO standard</span>
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
              placeholder="Search bus, inspector, findings..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Audit Statuses</option>
            <option value="Compliant">Compliant & Certified</option>
            <option value="Action">Action Required</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> statutory inspection logs
          </span>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Bus & Fleet Code</th>
                <th>Audit Date</th>
                <th>Safety Score</th>
                <th>Speed Governor</th>
                <th>Fire Extinguisher</th>
                <th>First Aid Box</th>
                <th>Tyre Tread</th>
                <th>Compliance Status</th>
                <th style={{ textAlign: 'right' }}>Audit Sheet</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.busNumber}</div>
                    <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{item.fleetCode}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>{item.inspectionDate}</td>
                  <td>
                    <span className="trans-badge success" style={{ fontWeight: 800 }}>{item.score}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>{item.checklist.speedGovernor}</td>
                  <td style={{ fontSize: '0.78rem' }}>{item.checklist.fireExtinguisher}</td>
                  <td style={{ fontSize: '0.78rem' }}>{item.checklist.firstAidKit}</td>
                  <td style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{item.checklist.tyreTreadDepth}</td>
                  <td>
                    <span className={`trans-badge ${item.status.includes('Compliant') ? 'success' : 'warning'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="trans-btn trans-btn-outline" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedAudit(item)}
                    >
                      <FileText size={13} /> Sheet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Sheet Modal */}
      {selectedAudit && (
        <div className="trans-modal-overlay" onClick={() => setSelectedAudit(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><ShieldCheck size={18} className="text-sky-600" /> Multi-Point Inspection Certificate: {selectedAudit.busNumber}</h3>
              <button className="trans-modal-close" onClick={() => setSelectedAudit(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, fontSize: '0.84rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                  <div><strong>Vehicle:</strong> {selectedAudit.busNumber} ({selectedAudit.fleetCode})</div>
                  <div><strong>Inspection Date:</strong> {selectedAudit.inspectionDate}</div>
                  <div><strong>Certified Inspector:</strong> {selectedAudit.inspector}</div>
                  <div><strong>Overall Safety Score:</strong> <span className="trans-badge success">{selectedAudit.score}</span></div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Checklist Item Verification:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', fontSize: '0.82rem' }}>
                  <div style={{ background: '#f1f5f9', padding: '0.6rem', borderRadius: 6 }}>
                    <strong>Speed Governor (60 km/h):</strong>
                    <div style={{ color: '#059669', fontWeight: 600 }}>✓ {selectedAudit.checklist.speedGovernor}</div>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '0.6rem', borderRadius: 6 }}>
                    <strong>Fire Extinguisher (4kg ABC):</strong>
                    <div style={{ color: '#059669', fontWeight: 600 }}>✓ {selectedAudit.checklist.fireExtinguisher}</div>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '0.6rem', borderRadius: 6 }}>
                    <strong>Emergency Exit Doors & Latches:</strong>
                    <div style={{ color: '#059669', fontWeight: 600 }}>✓ {selectedAudit.checklist.emergencyExit}</div>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '0.6rem', borderRadius: 6 }}>
                    <strong>Tyre Tread Depth:</strong>
                    <div style={{ color: '#059669', fontWeight: 600 }}>✓ {selectedAudit.checklist.tyreTreadDepth}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Inspector's Detailed Assessment & Corrective Notes:</span>
                <p style={{ margin: '0.3rem 0', background: '#ecfdf5', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem', color: '#065f46' }}>
                  {selectedAudit.findings}
                </p>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4 }}>
                  Mandatory Next Follow-Up Audit: <strong>{selectedAudit.followUpDate}</strong>
                </div>
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setSelectedAudit(null)}>Close</button>
              <button className="trans-btn trans-btn-primary" onClick={() => window.print()}>Print Safety Certificate</button>
            </div>
          </div>
        </div>
      )}

      {/* New Audit Modal */}
      {newAuditModal && (
        <div className="trans-modal-overlay" onClick={() => setNewAuditModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Award size={18} className="text-sky-600" /> Pre-Trip Safety Audit Form</h3>
              <button className="trans-modal-close" onClick={() => setNewAuditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveAudit}>
              <div className="trans-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Bus Registration</label>
                    <select className="trans-select" style={{ width: '100%' }} value={auditBus} onChange={e => setAuditBus(e.target.value)}>
                      <option value="OD-02-AK-4411">OD-02-AK-4411 (Bus 01)</option>
                      <option value="OD-02-AK-4412">OD-02-AK-4412 (Bus 02)</option>
                      <option value="OD-02-BL-8890">OD-02-BL-8890 (Bus 03)</option>
                      <option value="OD-02-BL-8891">OD-02-BL-8891 (Bus 04)</option>
                      <option value="OD-02-CL-1209">OD-02-CL-1209 (Bus 05)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Certified Inspector</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={inspector} onChange={e => setInspector(e.target.value)} required />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Speed Governor (AIS-140)</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={govStatus} onChange={e => setGovStatus(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Fire Extinguisher Condition</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={fireExt} onChange={e => setFireExt(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Tyre Tread Depth (mm)</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={tyres} onChange={e => setTyres(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Calculated Score</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={score} onChange={e => setScore(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Audit Remarks & Certifications</label>
                  <textarea rows={3} className="trans-select" style={{ width: '100%', resize: 'none' }} placeholder="Note any specific items needing maintenance..." value={findings} onChange={e => setFindings(e.target.value)} />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setNewAuditModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Certify & Save Inspection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
