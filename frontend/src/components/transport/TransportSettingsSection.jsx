import React, { useState } from 'react';
import { 
  Settings, Shield, Sliders, Bell, CheckCircle2, 
  Lock, Save, RefreshCw, Key, ShieldCheck, FileText 
} from 'lucide-react';
import { mockTransportPolicies } from './transportData';
import './TransportExtraSections.css';

export default function TransportSettingsSection() {
  const [policies, setPolicies] = useState(mockTransportPolicies);
  const [activeTab, setActiveTab] = useState('policies'); // 'policies' | 'parameters' | 'permissions'
  const [saveToast, setSaveToast] = useState('');

  // Config parameters state
  const [speedCeiling, setSpeedCeiling] = useState('60');
  const [morningDispatch, setMorningDispatch] = useState('06:45 AM');
  const [eveningDispatch, setEveningDispatch] = useState('05:15 PM');
  const [passGraceDays, setPassGraceDays] = useState('7');
  const [refundWindowDays, setRefundWindowDays] = useState('30');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoPassRenew, setAutoPassRenew] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setSaveToast('Configuration settings saved successfully (Local Session).');
    setTimeout(() => setSaveToast(''), 3500);
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><Settings size={24} className="text-sky-600" /> Transport Settings & Policies</h2>
          <p>Institutional transit governance, speed governor ceiling thresholds, tariff rules, and administrative roles.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <div className="trans-tab-pills">
            <button 
              className={`trans-tab-pill ${activeTab === 'policies' ? 'active' : ''}`}
              onClick={() => setActiveTab('policies')}
            >
              <FileText size={14} /> Operating Policies
            </button>
            <button 
              className={`trans-tab-pill ${activeTab === 'parameters' ? 'active' : ''}`}
              onClick={() => setActiveTab('parameters')}
            >
              <Sliders size={14} /> System Parameters
            </button>
            <button 
              className={`trans-tab-pill ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <Key size={14} /> Role Permissions
            </button>
          </div>
        </div>
      </div>

      {saveToast && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.85rem 1.25rem', borderRadius: 10, color: '#065f46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} color="#059669" /> {saveToast}
        </div>
      )}

      {/* Tab 1: Policies View */}
      {activeTab === 'policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {policies.map((group, idx) => (
            <div key={idx} className="trans-table-container" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={20} className="text-sky-600" /> {group.category}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {group.items.map((item, itemIdx) => (
                  <div key={itemIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.92rem', color: '#1e293b' }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: System Parameters */}
      {activeTab === 'parameters' && (
        <div className="trans-table-container" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSaveConfig}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', color: '#0f172a' }}>Fleet Governance & Operational Parameters</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Maximum Speed Governor Lock (KM/H)
                </label>
                <input 
                  type="number" 
                  className="trans-select" 
                  style={{ width: '100%' }} 
                  value={speedCeiling} 
                  onChange={e => setSpeedCeiling(e.target.value)} 
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Statutory Odisha State ceiling is 60 km/h</span>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Morning Depot Dispatch Window
                </label>
                <input 
                  type="text" 
                  className="trans-select" 
                  style={{ width: '100%' }} 
                  value={morningDispatch} 
                  onChange={e => setMorningDispatch(e.target.value)} 
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Standard pickup commencement</span>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Evening Campus Return Dispatch Window
                </label>
                <input 
                  type="text" 
                  className="trans-select" 
                  style={{ width: '100%' }} 
                  value={eveningDispatch} 
                  onChange={e => setEveningDispatch(e.target.value)} 
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Post-laboratory campus departure</span>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Unpaid Pass Grace Period (Days)
                </label>
                <input 
                  type="number" 
                  className="trans-select" 
                  style={{ width: '100%' }} 
                  value={passGraceDays} 
                  onChange={e => setPassGraceDays(e.target.value)} 
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Days allowed before pass deactivation</span>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Hostel Conversion Pro-Rata Refund Window (Days)
                </label>
                <input 
                  type="number" 
                  className="trans-select" 
                  style={{ width: '100%' }} 
                  value={refundWindowDays} 
                  onChange={e => setRefundWindowDays(e.target.value)} 
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Max days from semester start</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#1e293b', cursor: 'pointer' }}>
                <input type="checkbox" checked={smsAlerts} onChange={e => setSmsAlerts(e.target.checked)} />
                <span>Transmit automated SMS/In-App alert on trip delays exceeding 15 minutes</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#1e293b', cursor: 'pointer' }}>
                <input type="checkbox" checked={autoPassRenew} onChange={e => setAutoPassRenew(e.target.checked)} />
                <span>Auto-roll over semester bus pass reservations upon clearance of tuition fees</span>
              </label>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button type="submit" className="trans-btn trans-btn-primary">
                <Save size={16} /> Save Transport Policy Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Role Permissions */}
      {activeTab === 'permissions' && (
        <div className="trans-table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700 }}>
            Role-Based Access Control (RBAC) - Transport Operations
          </div>
          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>ERP Role</th>
                  <th>Route & Stop Modification</th>
                  <th>Pass Issuance & Billing</th>
                  <th>Incident Records</th>
                  <th>Fuel & Expenses</th>
                  <th>GPS Telemetry</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Transport Administrator</strong></td>
                  <td><span className="trans-badge success">Full Access</span></td>
                  <td><span className="trans-badge success">Full Access</span></td>
                  <td><span className="trans-badge success">Full Access</span></td>
                  <td><span className="trans-badge success">Full Access</span></td>
                  <td><span className="trans-badge success">Full Access</span></td>
                </tr>
                <tr>
                  <td><strong>Route Supervisor</strong></td>
                  <td><span className="trans-badge warning">Request Only</span></td>
                  <td><span className="trans-badge info">View Only</span></td>
                  <td><span className="trans-badge warning">File Only</span></td>
                  <td><span className="trans-badge warning">Audit Only</span></td>
                  <td><span className="trans-badge success">Full Access</span></td>
                </tr>
                <tr>
                  <td><strong>Accounts Officer</strong></td>
                  <td><span className="trans-badge info">View Only</span></td>
                  <td><span className="trans-badge success">Clearance Auth</span></td>
                  <td><span className="trans-badge info">Insurance Only</span></td>
                  <td><span className="trans-badge success">Finance Signoff</span></td>
                  <td><span className="trans-badge info">View Only</span></td>
                </tr>
                <tr>
                  <td><strong>Bus Pilot / Driver</strong></td>
                  <td><span className="trans-badge danger">No Access</span></td>
                  <td><span className="trans-badge info">Verify QR Only</span></td>
                  <td><span className="trans-badge warning">Report SOS</span></td>
                  <td><span className="trans-badge warning">Submit Slip</span></td>
                  <td><span className="trans-badge success">Broadcast Beacon</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
