import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bus,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  X
} from 'lucide-react';
import { transportStore } from '../../services/transportStore';
import './TransportExtraSections.css';

export default function TransportAlertsSection({ onNavigateSection, userRole = 'TRANSPORT' }) {
  const [alerts, setAlerts] = useState(() => transportStore.getOperationalAlerts());
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [resolvedIds, setResolvedIds] = useState(new Set());

  useEffect(() => {
    const unsub = transportStore.subscribe(() => {
      setAlerts(transportStore.getOperationalAlerts());
    });
    return unsub;
  }, []);

  const activeAlerts = useMemo(() => {
    return alerts.filter(a => !resolvedIds.has(a.id));
  }, [alerts, resolvedIds]);

  const filteredAlerts = useMemo(() => {
    return activeAlerts.filter(a => {
      const matchSearch = (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (a.description || '').toLowerCase().includes(search.toLowerCase()) ||
                          (a.category || '').toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
      const matchCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
      return matchSearch && matchSeverity && matchCategory;
    });
  }, [activeAlerts, search, severityFilter, categoryFilter]);

  const highSeverityCount = activeAlerts.filter(a => a.severity === 'High').length;
  const mediumSeverityCount = activeAlerts.filter(a => a.severity === 'Medium').length;
  const lowSeverityCount = activeAlerts.filter(a => a.severity === 'Low').length;

  const handleResolveAlert = (id) => {
    setResolvedIds(prev => new Set(prev).add(id));
    setSelectedAlert(null);
    setActionNotes('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><AlertTriangle size={24} className="text-amber-500" /> Operational Alerts & Priority Tasks</h2>
          <p>Real-time regulatory warnings, route occupancy ceilings, overdue maintenance, and urgent commuter grievances.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="trans-btn trans-btn-secondary" 
            onClick={() => setAlerts(transportStore.getOperationalAlerts())}
          >
            <RefreshCw size={15} /> Refresh Alerts
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><ShieldAlert size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{highSeverityCount}</span>
            <span className="trans-kpi-title">Critical Attention</span>
            <span className="trans-kpi-subtitle">Requires immediate action</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{mediumSeverityCount}</span>
            <span className="trans-kpi-title">Medium Priority</span>
            <span className="trans-kpi-subtitle">Action required within 48h</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><AlertCircle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{lowSeverityCount}</span>
            <span className="trans-kpi-title">Advisory Notices</span>
            <span className="trans-kpi-subtitle">General operations</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{resolvedIds.size}</span>
            <span className="trans-kpi-title">Resolved Today</span>
            <span className="trans-kpi-subtitle">Action items completed</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="trans-filter-bar">
        <div className="trans-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search operational alerts by title, vehicle, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="trans-filter-dropdowns">
          <div className="trans-select-wrap">
            <Filter size={15} />
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="ALL">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>

          <div className="trans-select-wrap">
            <Filter size={15} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="Compliance Expiry">Compliance Expiry</option>
              <option value="Maintenance Overdue">Maintenance Overdue</option>
              <option value="Route Overcrowding">Route Overcrowding</option>
              <option value="Student Request">Student Request</option>
              <option value="Driver Document">Driver Document</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="trans-empty-state">
            <CheckCircle2 size={42} style={{ color: '#10b981', margin: '0 auto 12px' }} />
            <h4>All Clear! No Pending Operational Alerts</h4>
            <p>Fleet regulatory compliance, route occupancies, and maintenance checks are operating smoothly.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              style={{
                background: '#ffffff',
                border: alert.severity === 'High' ? '1px solid #fecdd3' : alert.severity === 'Medium' ? '1px solid #fef3c7' : '1px solid #e2e8f0',
                borderLeft: alert.severity === 'High' ? '5px solid #ef4444' : alert.severity === 'Medium' ? '5px solid #f59e0b' : '5px solid #0284c7',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 380px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: alert.severity === 'High' ? '#ffe4e6' : alert.severity === 'Medium' ? '#fef3c7' : '#e0f2fe',
                    color: alert.severity === 'High' ? '#b91c1c' : alert.severity === 'Medium' ? '#b45309' : '#0369a1',
                  }}>
                    {alert.severity} Priority
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>• {alert.category}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>{alert.timestamp}</span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#0f172a', fontWeight: 600 }}>{alert.title}</h4>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: 1.45 }}>{alert.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  className="trans-btn trans-btn-primary"
                  style={{ fontSize: '0.82rem', padding: '8px 14px', gap: '6px' }}
                  onClick={() => {
                    if (onNavigateSection && alert.actionTarget) {
                      onNavigateSection(alert.actionTarget);
                    } else {
                      setSelectedAlert(alert);
                    }
                  }}
                >
                  {alert.actionLabel?.includes('RTO') ? <Calendar size={14} /> :
                   alert.actionLabel?.includes('Job Card') ? <Wrench size={14} /> :
                   alert.actionLabel?.includes('Relief') ? <Bus size={14} /> :
                   alert.actionLabel?.includes('Docket') ? <ShieldCheck size={14} /> :
                   alert.actionLabel?.includes('Compliance') ? <ShieldAlert size={14} /> :
                   <ArrowRight size={14} />}
                  {alert.actionLabel || 'Take Action'}
                </button>
                <button 
                  className="trans-btn trans-btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <Check size={14} /> Mark Resolved
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      {selectedAlert && (
        <div className="trans-modal-overlay">
          <div className="trans-modal-card" style={{ maxWidth: '520px' }}>
            <div className="trans-modal-header">
              <h3><ShieldCheck size={20} className="text-emerald-600" /> Log Alert Resolution Action</h3>
              <button className="trans-modal-close" onClick={() => setSelectedAlert(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '14px' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', marginBottom: '4px' }}>{selectedAlert.title}</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{selectedAlert.description}</p>
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Resolution / Corrective Action Notes:
              </label>
              <textarea 
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                placeholder="Detail the corrective actions taken (e.g. Scheduled vehicle inspection, deployed relief bus, contacted parent)..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-secondary" onClick={() => setSelectedAlert(null)}><X size={14} /> Cancel</button>
              <button 
                className="trans-btn trans-btn-primary" 
                onClick={() => handleResolveAlert(selectedAlert.id)}
              >
                <Check size={16} /> Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

