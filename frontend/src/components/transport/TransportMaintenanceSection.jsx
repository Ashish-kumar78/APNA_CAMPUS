import React, { useState, useMemo } from 'react';
import { 
  Wrench, AlertTriangle, CheckCircle, Clock, Search, Filter, 
  Calendar, Plus, DollarSign, FileText, X, Check, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { mockVehicleMaintenance } from './transportData';
import './TransportExtraSections.css';

export default function TransportMaintenanceSection() {
  const [data, setData] = useState(mockVehicleMaintenance);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newLogModal, setNewLogModal] = useState(false);

  // New log form state
  const [formBus, setFormBus] = useState('OD-02-AK-4411');
  const [formCategory, setFormCategory] = useState('Periodic 10,000 KM Service');
  const [formProvider, setFormProvider] = useState('Ashok Leyland Service Center, Mancheswar');
  const [formCost, setFormCost] = useState('8500');
  const [formDesc, setFormDesc] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.busNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.fleetCode.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase()) ||
                          item.serviceProvider.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchOverdue = !overdueOnly || item.isOverdue;
      return matchSearch && matchStatus && matchOverdue;
    });
  }, [data, search, statusFilter, overdueOnly]);

  // KPIs
  const totalLogs = data.length;
  const inServiceCount = data.filter(d => d.status === 'In Service').length;
  const scheduledCount = data.filter(d => d.status === 'Scheduled').length;
  const overdueCount = data.filter(d => d.isOverdue).length;
  const totalCost = data.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const handleCreateLog = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `MNT-VEH-${Date.now().toString().slice(-3)}`,
      busNumber: formBus,
      fleetCode: formBus === 'OD-02-AK-4411' ? 'Bus 01' : formBus === 'OD-02-AK-4412' ? 'Bus 02' : 'Bus 03',
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDue: '2027-01-20',
      odometerKm: 69200,
      category: formCategory,
      description: formDesc || 'Regular preventive maintenance and multi-point inspection.',
      serviceProvider: formProvider,
      cost: parseFloat(formCost) || 0,
      status: 'Scheduled',
      isOverdue: false
    };
    setData([newEntry, ...data]);
    setNewLogModal(false);
    setFormDesc('');
  };

  const handleUpdateStatus = (id, newStatus) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          isOverdue: newStatus === 'Completed' ? false : item.isOverdue
        };
      }
      return item;
    }));
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><Wrench size={24} className="text-sky-600" /> Vehicle Maintenance & Service</h2>
          <p>Preventive maintenance scheduling, garage overhaul records, and fitness inspection tracking.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-primary" onClick={() => setNewLogModal(true)}>
            <Plus size={16} /> Schedule Maintenance Work
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Wrench size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalLogs}</span>
            <span className="trans-kpi-title">Fleet Service Logs</span>
            <span className="trans-kpi-subtitle">5 college buses tracked</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><AlertTriangle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{overdueCount}</span>
            <span className="trans-kpi-title">Overdue Maintenance</span>
            <span className="trans-kpi-subtitle" style={{ color: '#e11d48', fontWeight: 600 }}>Needs urgent bay slot</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{inServiceCount}</span>
            <span className="trans-kpi-title">Under Maintenance</span>
            <span className="trans-kpi-subtitle">Currently in authorized bay</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><DollarSign size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{totalCost.toLocaleString('en-IN')}</span>
            <span className="trans-kpi-title">Maintenance Outlay</span>
            <span className="trans-kpi-subtitle">Approved workshop spend</span>
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
              placeholder="Search bus no, category, garage..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Service">In Service</option>
            <option value="Completed">Completed</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={overdueOnly} 
              onChange={(e) => setOverdueOnly(e.target.checked)} 
            />
            Show Overdue Only ({overdueCount})
          </label>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> service records
          </span>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Vehicle & Code</th>
                <th>Category & Description</th>
                <th>Last Service</th>
                <th>Next Due Date</th>
                <th>Odometer</th>
                <th>Service Provider</th>
                <th>Cost (INR)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No vehicle maintenance records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id} style={{ background: item.isOverdue ? '#fff5f5' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.busNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>{item.fleetCode}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.category}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{item.lastServiceDate}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: item.isOverdue ? '#e11d48' : '#0f172a' }}>
                          {item.nextServiceDue}
                        </span>
                        {item.isOverdue && (
                          <span className="trans-badge danger" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {item.odometerKm.toLocaleString()} KM
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {item.serviceProvider}
                    </td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹{item.cost.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`trans-badge ${
                        item.status === 'Completed' ? 'success' :
                        item.status === 'In Service' ? 'warning' : 'info'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button 
                          className="trans-btn trans-btn-outline" 
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => setSelectedRecord(item)}
                        >
                          View
                        </button>
                        {item.status !== 'Completed' && (
                          <button 
                            className="trans-btn trans-btn-success" 
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => handleUpdateStatus(item.id, 'Completed')}
                            title="Mark as Completed"
                          >
                            <Check size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedRecord && (
        <div className="trans-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><FileText size={18} className="text-sky-600" /> Maintenance Record: {selectedRecord.id}</h3>
              <button className="trans-modal-close" onClick={() => setSelectedRecord(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 10 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Vehicle</span>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedRecord.busNumber} ({selectedRecord.fleetCode})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Status</span>
                  <div>
                    <span className={`trans-badge ${selectedRecord.status === 'Completed' ? 'success' : 'warning'}`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Odometer</span>
                  <div style={{ fontWeight: 700 }}>{selectedRecord.odometerKm.toLocaleString()} KM</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Total Cost</span>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>₹{selectedRecord.cost.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Service Category:</span>
                <p style={{ margin: '0.2rem 0 0.8rem', fontWeight: 600 }}>{selectedRecord.category}</p>

                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Authorized Service Provider:</span>
                <p style={{ margin: '0.2rem 0 0.8rem', color: '#334155' }}>{selectedRecord.serviceProvider}</p>

                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Detailed Job Description & Findings:</span>
                <p style={{ margin: '0.2rem 0', background: '#f1f5f9', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem' }}>
                  {selectedRecord.description}
                </p>
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setSelectedRecord(null)}>Close</button>
              {selectedRecord.status !== 'Completed' && (
                <button 
                  className="trans-btn trans-btn-success" 
                  onClick={() => { handleUpdateStatus(selectedRecord.id, 'Completed'); setSelectedRecord(null); }}
                >
                  <Check size={14} /> Mark Service Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Work Modal */}
      {newLogModal && (
        <div className="trans-modal-overlay" onClick={() => setNewLogModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Plus size={18} className="text-sky-600" /> Schedule Vehicle Maintenance</h3>
              <button className="trans-modal-close" onClick={() => setNewLogModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateLog}>
              <div className="trans-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Select Bus</label>
                    <select className="trans-select" style={{ width: '100%' }} value={formBus} onChange={(e) => setFormBus(e.target.value)}>
                      <option value="OD-02-AK-4411">OD-02-AK-4411 (Bus 01)</option>
                      <option value="OD-02-AK-4412">OD-02-AK-4412 (Bus 02)</option>
                      <option value="OD-02-BL-8890">OD-02-BL-8890 (Bus 03 - CNG)</option>
                      <option value="OD-02-BL-8891">OD-02-BL-8891 (Bus 04)</option>
                      <option value="OD-02-CL-1209">OD-02-CL-1209 (Bus 05)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Maintenance Category</label>
                    <select className="trans-select" style={{ width: '100%' }} value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                      <option value="Periodic 10,000 KM Service">Periodic 10,000 KM Service</option>
                      <option value="Clutch & Transmission Overhaul">Clutch & Transmission Overhaul</option>
                      <option value="Brake Linings & Air System">Brake Linings & Air System</option>
                      <option value="AC & Blower Electrics">AC & Blower Electrics</option>
                      <option value="Tyre Rotation & Alignment">Tyre Rotation & Alignment</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Service Provider</label>
                    <input 
                      type="text" 
                      className="trans-select" 
                      style={{ width: '100%' }}
                      value={formProvider}
                      onChange={(e) => setFormProvider(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Estimated Cost (INR)</label>
                    <input 
                      type="number" 
                      className="trans-select" 
                      style={{ width: '100%' }}
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Work Description / Reported Fault</label>
                  <textarea 
                    rows={3} 
                    className="trans-select" 
                    style={{ width: '100%', resize: 'none' }}
                    placeholder="Describe specific symptoms or maintenance checklist..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setNewLogModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Confirm & Book Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
