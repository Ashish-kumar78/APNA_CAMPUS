import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Bus,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  X
} from 'lucide-react';
import { transportStore } from '../../services/transportStore';
import './TransportExtraSections.css';

export default function TransportDutyRosterSection() {
  const [roster, setRoster] = useState(() => transportStore.getDutyRoster());
  const [drivers, setDrivers] = useState(() => transportStore.getDrivers());
  const [fleet, setFleet] = useState(() => transportStore.getFleet());
  const [routes, setRoutes] = useState(() => transportStore.getRoutes());
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [form, setForm] = useState({
    driverName: '',
    conductorName: '',
    busNumber: '',
    routeName: '',
    shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
    scheduledStart: '06:30 AM',
    scheduledEnd: '06:30 PM',
  });

  useEffect(() => {
    const unsub = transportStore.subscribe(() => {
      setRoster(transportStore.getDutyRoster());
      setDrivers(transportStore.getDrivers());
      setFleet(transportStore.getFleet());
      setRoutes(transportStore.getRoutes());
    });
    return unsub;
  }, []);

  const filteredRoster = useMemo(() => {
    return roster.filter(r => {
      const matchSearch = (r.driverName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.conductorName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.busNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.routeName || '').toLowerCase().includes(search.toLowerCase());
      const matchShift = shiftFilter === 'ALL' || (r.shift || '').includes(shiftFilter);
      return matchSearch && matchShift;
    });
  }, [roster, search, shiftFilter]);

  const activeDuties = roster.filter(r => r.status === 'Active Duty').length;
  const standbyDuties = roster.filter(r => r.status === 'Workshop Standby' || r.status === 'Reserve').length;

  const handleAssignDuty = async (e) => {
    e.preventDefault();
    if (!form.driverName || !form.busNumber || !form.routeName) {
      alert('Please select driver, vehicle, and route.');
      return;
    }
    // Conflict detection: Is driver already assigned to another active bus today?
    const conflict = roster.find(r => r.driverName === form.driverName && r.busNumber !== form.busNumber);
    if (conflict) {
      const proceed = window.confirm(`Duty Conflict Notice: ${form.driverName} is already assigned to ${conflict.busNumber}. Reassign to ${form.busNumber}?`);
      if (!proceed) return;
    }

    const assignedFleet = fleet.find(f => f.busNumber === form.busNumber);
    await transportStore.assignDutyRoster({
      ...form,
      fleetCode: assignedFleet?.fleetCode || 'Bus Assigned',
    });

    setShowAssignModal(false);
    setForm({
      driverName: '',
      conductorName: '',
      busNumber: '',
      routeName: '',
      shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
      scheduledStart: '06:30 AM',
      scheduledEnd: '06:30 PM',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this duty assignment?')) {
      await transportStore.deleteDutyRoster(id);
    }
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><CalendarDays size={24} className="text-sky-600" /> Crew Duty Roster & Shift Assignments</h2>
          <p>Schedule daily driver and conductor shifts, prevent overlapping duty conflicts, and assign reserve crew members.</p>
        </div>
        <button className="trans-btn trans-btn-primary" onClick={() => setShowAssignModal(true)}>
          <Plus size={16} /> Assign Crew Duty
        </button>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Users size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{roster.length}</span>
            <span className="trans-kpi-title">Total Scheduled Duties</span>
            <span className="trans-kpi-subtitle">Current daily shift sheet</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{activeDuties}</span>
            <span className="trans-kpi-title">Active Route Duties</span>
            <span className="trans-kpi-subtitle">Assigned to corridors</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{standbyDuties}</span>
            <span className="trans-kpi-title">Workshop / Reserve Standby</span>
            <span className="trans-kpi-subtitle">Emergency relief drivers</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Bus size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{fleet.length}</span>
            <span className="trans-kpi-title">Buses Covered</span>
            <span className="trans-kpi-subtitle">100% paired with crew</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="trans-filter-bar">
        <div className="trans-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search roster by driver, conductor, bus number, or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="trans-filter-dropdowns">
          <div className="trans-select-wrap">
            <Filter size={15} />
            <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)}>
              <option value="ALL">All Shifts</option>
              <option value="Morning">Morning Shift</option>
              <option value="General">General / Workshop</option>
              <option value="Special">Special / On-Call</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="trans-table-card">
        <div className="trans-table-wrap">
          <table className="trans-table">
            <thead>
              <tr>
                <th>Driver & Employee ID</th>
                <th>Assigned Conductor</th>
                <th>Bus Number & Fleet</th>
                <th>Transit Corridor Route</th>
                <th>Shift & Timings</th>
                <th>Duty Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                    No duty assignments match the search query.
                  </td>
                </tr>
              ) : (
                filteredRoster.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.driverName}</div>
                      <span className="trans-code-badge">HMV Driver</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#334155' }}>{item.conductorName || 'Staff Assistant'}</div>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Conductor Desk</span>
                    </td>
                    <td>
                      <strong>{item.busNumber}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.fleetCode}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#0284c7' }}>{item.routeName}</div>
                    </td>
                    <td>
                      <div>{item.shift}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.scheduledStart} - {item.scheduledEnd}</div>
                    </td>
                    <td>
                      <span className={`trans-status-badge ${item.status === 'Active Duty' ? 'success' : 'warning'}`}>
                        <CheckCircle2 size={12} /> {item.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="trans-btn trans-btn-danger" 
                        style={{ fontSize: '0.78rem', padding: '5px 8px' }}
                        onClick={() => handleDelete(item.id)}
                      >
                        <X size={12} /> Release
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="trans-modal-overlay">
          <div className="trans-modal-card" style={{ maxWidth: '540px' }}>
            <div className="trans-modal-header">
              <h3><CalendarDays size={20} className="text-sky-600" /> Assign Crew Shift Duty</h3>
              <button className="trans-modal-close" onClick={() => setShowAssignModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAssignDuty}>
              <div className="trans-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Select Driver *</label>
                  <select 
                    required 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={form.driverName}
                    onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                  >
                    <option value="">-- Choose Driver --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.licenseCategory || 'HMV'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Conductor / Assistant Name</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={form.conductorName}
                    onChange={(e) => setForm({ ...form, conductorName: e.target.value })}
                    placeholder="e.g. Pravat Swain"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Assign Bus *</label>
                    <select 
                      required 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={form.busNumber}
                      onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
                    >
                      <option value="">-- Select Bus --</option>
                      {fleet.map(f => (
                        <option key={f.id} value={f.busNumber}>{f.busNumber} ({f.fleetCode})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Corridor Route *</label>
                    <select 
                      required 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={form.routeName}
                      onChange={(e) => setForm({ ...form, routeName: e.target.value })}
                    >
                      <option value="">-- Select Route --</option>
                      {routes.map(r => (
                        <option key={r.id || r.routeNumber} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Shift Schedule</label>
                  <select 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  >
                    <option>Morning & Evening (06:30 AM - 06:30 PM)</option>
                    <option>General Workshop Shift (08:00 AM - 05:00 PM)</option>
                    <option>Special Placement / Event Transit Shift</option>
                  </select>
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-secondary" onClick={() => setShowAssignModal(false)} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><X size={14} /> Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">
                  <Check size={16} /> Save Duty Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

