import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Lock,
  Building,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { mockHostelRulesConfig } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelSettingsRulesSection() {
  const [rules, setRules] = useState(mockHostelRulesConfig);
  const [expandedCats, setExpandedCats] = useState({
    'Curfew & Gate Timings': true,
    'Visitor & Guest Policies': true,
    'Electrical & Room Safety': false,
    'Anti-Ragging & Code of Conduct': false
  });
  const [config, setConfig] = useState({
    girlsCurfew: '08:30 PM',
    boysCurfew: '09:30 PM',
    quietHoursStart: '11:00 PM',
    quietHoursEnd: '06:00 AM',
    maxPassesPerMonth: 4,
    parentConsentRequiredDays: 2,
    smsAlertsEnabled: true,
    surpriseInspectionRounds: 'Bi-Weekly'
  });
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'config'
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleCategory = (cat) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    showToast('Hostel operating parameters updated successfully!');
  };

  return (
    <div className="hostel-section-container">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><Settings size={24} color="#2563eb" /> Hostel Rules, Policies &amp; System Configuration</h2>
          <p>Institutional Residence Code · Gate Pass Thresholds · Curfew Schedules · Authority Governance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            Print Hostel Manual
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="hostel-tab-pills">
        <button
          className={`hostel-tab-pill ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <BookOpen size={14} /> Hostel Rules Manual &amp; Code of Conduct
        </button>
        <button
          className={`hostel-tab-pill ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Sliders size={14} /> Warden Policy Configuration
        </button>
      </div>

      {/* TAB 1: RULES MANUAL */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rules.map(cat => {
            const isExpanded = expandedCats[cat.category];
            return (
              <div key={cat.category} className="hostel-rule-card">
                <div className="hostel-rule-header" onClick={() => toggleCategory(cat.category)}>
                  <h4>
                    <Shield size={18} color="#2563eb" /> {cat.category}
                  </h4>
                  {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                </div>

                {isExpanded && (
                  <div className="hostel-rule-body">
                    {cat.items.map((item, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '3px solid #2563eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{item.title}</span>
                          <span className="h-badge h-badge-medium">{item.value}</span>
                        </div>
                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CONFIGURATION */}
      {activeTab === 'config' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <Lock size={18} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
              Hostel Governance Parameters (Chief Warden Access Level)
            </h3>
          </div>

          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Sarojini Girls Residence Curfew
                </label>
                <input
                  type="text"
                  value={config.girlsCurfew}
                  onChange={e => setConfig({ ...config, girlsCurfew: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Gandhi &amp; Kalam Boys Residence Curfew
                </label>
                <input
                  type="text"
                  value={config.boysCurfew}
                  onChange={e => setConfig({ ...config, boysCurfew: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Quiet Hours Curfew Start
                </label>
                <input
                  type="text"
                  value={config.quietHoursStart}
                  onChange={e => setConfig({ ...config, quietHoursStart: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Maximum Outstation Passes / Month
                </label>
                <input
                  type="number"
                  value={config.maxPassesPerMonth}
                  onChange={e => setConfig({ ...config, maxPassesPerMonth: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Parent Telephonic Consent Threshold (Days)
                </label>
                <input
                  type="number"
                  value={config.parentConsentRequiredDays}
                  onChange={e => setConfig({ ...config, parentConsentRequiredDays: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Surprise Cleanliness Inspection Cadence
                </label>
                <select
                  className="hostel-select"
                  style={{ width: '100%' }}
                  value={config.surpriseInspectionRounds}
                  onChange={e => setConfig({ ...config, surpriseInspectionRounds: e.target.value })}
                >
                  <option value="Weekly">Weekly Warden Rounds</option>
                  <option value="Bi-Weekly">Bi-Weekly Joint Audits</option>
                  <option value="Monthly">Monthly Estate Audits</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                  Automated Guardian Absence SMS Broadcasts
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Dispatch automated SMS to registered parents if biometric attendance is unrecorded after curfew.
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.smsAlertsEnabled}
                onChange={e => setConfig({ ...config, smsAlertsEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="h-btn h-btn-secondary"
                onClick={() => showToast('Configuration reset to BPUT defaults')}
              >
                <RotateCcw size={14} /> Reset Defaults
              </button>
              <button type="submit" className="h-btn h-btn-primary">
                <Save size={14} /> Save Policy Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
