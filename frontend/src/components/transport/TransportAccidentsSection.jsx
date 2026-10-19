import React, { useState, useMemo } from 'react';
import { 
  AlertOctagon, ShieldAlert, CheckCircle2, Clock, Search, 
  Filter, FileText, Plus, Eye, X, Lock, PhoneCall 
} from 'lucide-react';
import { mockAccidentIncidents } from './transportData';
import './TransportExtraSections.css';

export default function TransportAccidentsSection() {
  const [data, setData] = useState(mockAccidentIncidents);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [newIncidentModal, setNewIncidentModal] = useState(false);

  // Form State
  const [refNo, setRefNo] = useState(`BPUT/TRN/2026/INC-0${data.length + 3}`);
  const [busNo, setBusNo] = useState('OD-02-AK-4411');
  const [route, setRoute] = useState('Route 1: Cuttack Badambadi Express');
  const [driver, setDriver] = useState('Ramesh Ch. Jena');
  const [category, setCategory] = useState('Minor Road Hazard (Flat Tyre)');
  const [severity, setSeverity] = useState('Low');
  const [location, setLocation] = useState('Rasulgarh Square Overbridge');
  const [desc, setDesc] = useState('');
  const [response, setResponse] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
                          item.busNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.location.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase()) ||
                          item.driverName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.investigationStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  // Statistics
  const totalIncidents = data.length;
  const closedCount = data.filter(d => d.investigationStatus === 'Closed').length;
  const underInvestigationCount = data.filter(d => d.investigationStatus !== 'Closed').length;

  const handleCreateIncident = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `INC-TRN-${Date.now().toString().slice(-3)}`,
      referenceNo: refNo,
      busNumber: busNo,
      routeName: route,
      driverName: driver,
      date: new Date().toISOString().split('T')[0],
      time: '08:20 AM',
      location: location,
      category: category,
      severity: severity,
      description: desc || 'Precautionary transit incident report.',
      immediateResponse: response || 'First response team dispatched.',
      emergencyAssistance: 'Not Required',
      responsibleOfficial: 'Mr. S. K. Behera (Transport Administrator)',
      investigationStatus: 'Under Inquiry',
      followUpAction: 'Internal safety review scheduled.'
    };
    setData([newEntry, ...data]);
    setNewIncidentModal(false);
    setDesc('');
    setResponse('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><AlertOctagon size={24} className="text-rose-600" /> Accident & Incident Management</h2>
          <p>Confidential road hazard reports, breakdown incidents, driver response logs, and insurance claims.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-danger" onClick={() => setNewIncidentModal(true)}>
            <Plus size={16} /> File Incident Report
          </button>
        </div>
      </div>

      {/* Access Restriction Notice */}
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: '#991b1b' }}>
        <Lock size={16} color="#dc2626" />
        <span><strong>Confidential Safety Dossier:</strong> Restriced to Transport Administrator, Chief Proctor, and Legal Counsel. All incidents are archived for statutory RTO compliance.</span>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><AlertOctagon size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalIncidents}</span>
            <span className="trans-kpi-title">Total Logged Incidents</span>
            <span className="trans-kpi-subtitle">Current academic session</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{closedCount}</span>
            <span className="trans-kpi-title">Resolved & Closed</span>
            <span className="trans-kpi-subtitle">Formal enquiry completed</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{underInvestigationCount}</span>
            <span className="trans-kpi-title">Under Inquiry</span>
            <span className="trans-kpi-subtitle">Pending final findings</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><PhoneCall size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">0</span>
            <span className="trans-kpi-title">Major Injuries / Casualties</span>
            <span className="trans-kpi-subtitle" style={{ color: '#059669', fontWeight: 700 }}>Clean zero-casualty record</span>
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
              placeholder="Search reference, vehicle, location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Inquiry Statuses</option>
            <option value="Closed">Closed</option>
            <option value="Under Inquiry">Under Inquiry</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> incident dossiers
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Case Reference No</th>
                <th>Date & Time</th>
                <th>Bus & Route</th>
                <th>Driver On Duty</th>
                <th>Incident Nature</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Investigation</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{item.referenceNo}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.responsibleOfficial}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 600 }}>{item.date}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.time}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{item.busNumber}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.routeName}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.driverName}</td>
                  <td>
                    <span className="trans-badge info" style={{ fontSize: '0.74rem' }}>{item.category}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#334155', maxWidth: 170 }}>{item.location}</td>
                  <td>
                    <span className={`trans-badge ${item.severity === 'High' ? 'danger' : item.severity === 'Medium' ? 'warning' : 'info'}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`trans-badge ${item.investigationStatus === 'Closed' ? 'success' : 'warning'}`}>
                      {item.investigationStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="trans-btn trans-btn-outline" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedIncident(item)}
                    >
                      <Eye size={13} /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <div className="trans-modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><AlertOctagon size={18} className="text-rose-600" /> Incident Dossier: {selectedIncident.referenceNo}</h3>
              <button className="trans-modal-close" onClick={() => setSelectedIncident(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: 8, fontSize: '0.84rem' }}>
                <div><strong>Vehicle:</strong> {selectedIncident.busNumber}</div>
                <div><strong>Route:</strong> {selectedIncident.routeName}</div>
                <div><strong>Driver:</strong> {selectedIncident.driverName}</div>
                <div><strong>Occurrence:</strong> {selectedIncident.date} at {selectedIncident.time}</div>
                <div><strong>Location:</strong> {selectedIncident.location}</div>
                <div><strong>Emergency Response:</strong> {selectedIncident.emergencyAssistance}</div>
                <div><strong>Responsible Official:</strong> {selectedIncident.responsibleOfficial}</div>
                <div><strong>Investigation Status:</strong> <span className="trans-badge success">{selectedIncident.investigationStatus}</span></div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Factual Description of Incident:</span>
                <p style={{ margin: '0.3rem 0 0.8rem', background: '#f1f5f9', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem' }}>
                  {selectedIncident.description}
                </p>

                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Immediate On-Site Response:</span>
                <p style={{ margin: '0.3rem 0 0.8rem', background: '#ecfdf5', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem', color: '#065f46' }}>
                  {selectedIncident.immediateResponse}
                </p>

                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Follow-Up & Remedial Actions Taken:</span>
                <p style={{ margin: '0.3rem 0', background: '#eff6ff', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem', color: '#1e40af' }}>
                  {selectedIncident.followUpAction}
                </p>
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setSelectedIncident(null)}>Close</button>
              <button className="trans-btn trans-btn-primary" onClick={() => window.print()}>Print Statutory Report</button>
            </div>
          </div>
        </div>
      )}

      {/* File Incident Modal */}
      {newIncidentModal && (
        <div className="trans-modal-overlay" onClick={() => setNewIncidentModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><AlertOctagon size={18} className="text-rose-600" /> Log Confidential Transit Incident</h3>
              <button className="trans-modal-close" onClick={() => setNewIncidentModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateIncident}>
              <div className="trans-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Vehicle Registration</label>
                    <select className="trans-select" style={{ width: '100%' }} value={busNo} onChange={e => setBusNo(e.target.value)}>
                      <option value="OD-02-AK-4411">OD-02-AK-4411 (Bus 01)</option>
                      <option value="OD-02-AK-4412">OD-02-AK-4412 (Bus 02)</option>
                      <option value="OD-02-BL-8890">OD-02-BL-8890 (Bus 03)</option>
                      <option value="OD-02-BL-8891">OD-02-BL-8891 (Bus 04)</option>
                      <option value="OD-02-CL-1209">OD-02-CL-1209 (Bus 05)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Incident Category</label>
                    <select className="trans-select" style={{ width: '100%' }} value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Minor Road Hazard (Flat Tyre)">Minor Road Hazard (Flat Tyre)</option>
                      <option value="Engine Overheat / Breakdown">Engine Overheat / Breakdown</option>
                      <option value="Minor Scrape / Fender Contact">Minor Scrape / Fender Contact</option>
                      <option value="Traffic Obstruction / Level Crossing Delay">Traffic Obstruction / Level Crossing</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Exact Geographical Location</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={location} onChange={e => setLocation(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Severity Assessment</label>
                    <select className="trans-select" style={{ width: '100%' }} value={severity} onChange={e => setSeverity(e.target.value)}>
                      <option value="Low">Low (No injury, minor delay)</option>
                      <option value="Medium">Medium (Vehicle towed or swapped)</option>
                      <option value="High">High (Medical or statutory referral)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Factual Description</label>
                  <textarea rows={3} className="trans-select" style={{ width: '100%', resize: 'none' }} placeholder="Detail sequence of events..." value={desc} onChange={e => setDesc(e.target.value)} required />
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Immediate Response & Student Safety Measures</label>
                  <textarea rows={2} className="trans-select" style={{ width: '100%', resize: 'none' }} placeholder="Action taken on spot..." value={response} onChange={e => setResponse(e.target.value)} required />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setNewIncidentModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-danger">Register Incident Dossier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
