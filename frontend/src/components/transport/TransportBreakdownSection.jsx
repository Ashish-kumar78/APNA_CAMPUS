import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertOctagon,
  Bus,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  Wrench,
  X
} from 'lucide-react';
import { transportStore } from '../../services/transportStore';
import './TransportExtraSections.css';

export default function TransportBreakdownSection() {
  const [repairs, setRepairs] = useState(() => transportStore.getBreakdownRepairs());
  const [fleet, setFleet] = useState(() => transportStore.getFleet());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  const [form, setForm] = useState({
    busNumber: '',
    breakdownLocation: '',
    reportedFault: '',
    reliefBusDeployed: 'None Dispatched',
    serviceCenter: 'Campus Central Workshop Bay',
    partsReplaced: '',
    totalExpense: 0,
    downtimeDays: 1,
  });

  useEffect(() => {
    const unsub = transportStore.subscribe(() => {
      setRepairs(transportStore.getBreakdownRepairs());
      setFleet(transportStore.getFleet());
    });
    return unsub;
  }, []);

  const filteredRepairs = useMemo(() => {
    return repairs.filter(r => {
      const matchSearch = (r.busNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.reportedFault || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.breakdownLocation || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.serviceCenter || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || (r.status || '').includes(statusFilter);
      return matchSearch && matchStatus;
    });
  }, [repairs, search, statusFilter]);

  const activeBreakdowns = repairs.filter(r => r.status === 'Under Repair').length;
  const resolvedBreakdowns = repairs.filter(r => r.status.includes('Resolved')).length;
  const totalExpense = repairs.reduce((acc, r) => acc + (Number(r.totalExpense) || 0), 0);

  const handleLogBreakdown = async (e) => {
    e.preventDefault();
    if (!form.busNumber || !form.reportedFault || !form.breakdownLocation) {
      alert('Please fill in vehicle, fault, and location.');
      return;
    }
    const matched = fleet.find(f => f.busNumber === form.busNumber);
    await transportStore.addBreakdownRepair({
      ...form,
      fleetCode: matched?.fleetCode || 'Bus',
    });
    setShowLogModal(false);
    setForm({
      busNumber: '',
      breakdownLocation: '',
      reportedFault: '',
      reliefBusDeployed: 'None Dispatched',
      serviceCenter: 'Campus Central Workshop Bay',
      partsReplaced: '',
      totalExpense: 0,
      downtimeDays: 1,
    });
  };

  const handleResolve = async () => {
    if (!selectedRepair) return;
    await transportStore.resolveBreakdownRepair(selectedRepair.id, resolveNotes || 'Repaired and certified for road fitness.');
    setSelectedRepair(null);
    setResolveNotes('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><AlertOctagon size={24} className="text-rose-600" /> Breakdown & Emergency Repair Management</h2>
          <p>Real-time road breakdown incident dispatch, workshop repair work orders, parts expense tracking, and vehicle downtime audits.</p>
        </div>
        <button className="trans-btn trans-btn-danger" onClick={() => setShowLogModal(true)}>
          <Plus size={15} /> Log Emergency Breakdown
        </button>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><AlertOctagon size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{activeBreakdowns}</span>
            <span className="trans-kpi-title">Active Pit Work Orders</span>
            <span className="trans-kpi-subtitle">Vehicles currently off road</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{resolvedBreakdowns}</span>
            <span className="trans-kpi-title">Resolved & Returned</span>
            <span className="trans-kpi-subtitle">Restored to active fleet</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><DollarSign size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{totalExpense.toLocaleString()}</span>
            <span className="trans-kpi-title">Emergency Repair Cost</span>
            <span className="trans-kpi-subtitle">Parts & workshop labor</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">1.8 Days</span>
            <span className="trans-kpi-title">Avg Fleet Downtime</span>
            <span className="trans-kpi-subtitle">Turnaround time to service</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="trans-filter-bar">
        <div className="trans-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by bus number, breakdown location, workshop, or fault description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="trans-filter-dropdowns">
          <div className="trans-select-wrap">
            <Filter size={15} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Breakdown Statuses</option>
              <option value="Under Repair">Under Repair / In Workshop</option>
              <option value="Resolved">Resolved & Returned</option>
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
                <th>Bus & Fleet Code</th>
                <th>Incident Date & Location</th>
                <th>Reported Mechanical Fault</th>
                <th>Relief Transit Deployed</th>
                <th>Workshop Center & Parts</th>
                <th>Expense</th>
                <th>Downtime</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px' }}>
                    No breakdown incident logs match the criteria.
                  </td>
                </tr>
              ) : (
                filteredRepairs.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{item.busNumber}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.fleetCode}</div>
                    </td>
                    <td>
                      <div>{item.breakdownLocation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.incidentDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#e11d48' }}>{item.reportedFault}</div>
                    </td>
                    <td>
                      <span className="trans-code-badge">{item.reliefBusDeployed}</span>
                    </td>
                    <td>
                      <div>{item.serviceCenter}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.partsReplaced || 'Pending inspection'}</div>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>₹{Number(item.totalExpense || 0).toLocaleString()}</strong>
                    </td>
                    <td>{item.downtimeDays} Days</td>
                    <td>
                      <span className={`trans-status-badge ${item.status === 'Under Repair' ? 'danger' : 'success'}`}>
                        {item.status === 'Under Repair' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === 'Under Repair' ? (
                        <button 
                          className="trans-btn trans-btn-primary" 
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                          onClick={() => setSelectedRepair(item)}
                        >
                          <CheckCircle2 size={13} /> Resolve
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Closed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedRepair && (
        <div className="trans-modal-overlay">
          <div className="trans-modal-card" style={{ maxWidth: '520px' }}>
            <div className="trans-modal-header">
              <h3><Wrench size={20} className="text-emerald-600" /> Close Breakdown & Return to Fleet</h3>
              <button className="trans-modal-close" onClick={() => setSelectedRepair(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Vehicle:</span>
                <strong style={{ display: 'block', color: '#0f172a' }}>{selectedRepair.busNumber} ({selectedRepair.fleetCode})</strong>
                <span style={{ color: '#64748b', marginTop: '6px', display: 'block' }}>Reported Issue:</span>
                <p style={{ margin: 0, color: '#e11d48', fontWeight: 500 }}>{selectedRepair.reportedFault}</p>
              </div>

              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Repairs Completed / Recovery Action:
              </label>
              <textarea 
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                placeholder="Details of workshop repair, replaced spare parts, and mechanical road fitness clearance..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
              />
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-secondary" onClick={() => setSelectedRepair(null)}><X size={14} /> Cancel</button>
              <button className="trans-btn trans-btn-primary" onClick={handleResolve}>
                <Check size={16} /> Mark Road Fit & Return to Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Breakdown Modal */}
      {showLogModal && (
        <div className="trans-modal-overlay">
          <div className="trans-modal-card" style={{ maxWidth: '540px' }}>
            <div className="trans-modal-header">
              <h3><AlertOctagon size={20} className="text-rose-600" /> Log Road Breakdown Incident</h3>
              <button className="trans-modal-close" onClick={() => setShowLogModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleLogBreakdown}>
              <div className="trans-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Select Bus *</label>
                  <select 
                    required 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={form.busNumber}
                    onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
                  >
                    <option value="">-- Choose Bus --</option>
                    {fleet.map(f => (
                      <option key={f.id} value={f.busNumber}>{f.busNumber} ({f.fleetCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Breakdown Location *</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={form.breakdownLocation}
                    onChange={(e) => setForm({ ...form, breakdownLocation: e.target.value })}
                    placeholder="e.g. Near Rasulgarh Flyover NH-16"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Reported Mechanical / Electrical Fault *</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={form.reportedFault}
                    onChange={(e) => setForm({ ...form, reportedFault: e.target.value })}
                    placeholder="e.g. Alternator belt failure, flat tyre, clutch slip"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Relief Bus Deployed</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={form.reliefBusDeployed}
                      onChange={(e) => setForm({ ...form, reliefBusDeployed: e.target.value })}
                      placeholder="e.g. Bus 05 (Relief)"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Repair Workshop Center</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={form.serviceCenter}
                      onChange={(e) => setForm({ ...form, serviceCenter: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Parts Replaced / Required</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={form.partsReplaced}
                      onChange={(e) => setForm({ ...form, partsReplaced: e.target.value })}
                      placeholder="e.g. Fan Belt, Oil Filter"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Total Expense (₹)</label>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={form.totalExpense}
                      onChange={(e) => setForm({ ...form, totalExpense: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-secondary" onClick={() => setShowLogModal(false)}><X size={14} /> Cancel</button>
                <button type="submit" className="trans-btn trans-btn-danger">
                  <Check size={16} /> Save Breakdown Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

