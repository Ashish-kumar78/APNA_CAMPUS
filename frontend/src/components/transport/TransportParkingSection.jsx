import React, { useState, useMemo } from 'react';
import { 
  SquareParking, Bus, CheckCircle2, AlertCircle, Search, 
  MapPin, User, Calendar, Edit3, X, Check 
} from 'lucide-react';
import { mockParkingAssignments } from './transportData';
import './TransportExtraSections.css';

export default function TransportParkingSection() {
  const [data, setData] = useState(mockParkingAssignments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reassignModal, setReassignModal] = useState(false);

  // Form state
  const [assignBus, setAssignBus] = useState('OD-02-AK-4411');
  const [assignDriver, setAssignDriver] = useState('Ramesh Ch. Jena');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.bayNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.busNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.assignedDriver.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  // Statistics
  const totalSlots = data.length;
  const occupiedSlots = data.filter(d => d.status === 'Occupied').length;
  const availableSlots = data.filter(d => d.status === 'Available').length;
  const maintenanceSlots = data.filter(d => d.status === 'Maintenance Pit').length;

  const handleReassign = (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setData(prev => prev.map(item => {
      if (item.id === selectedSlot.id) {
        return {
          ...item,
          busNumber: assignBus,
          assignedDriver: assignDriver,
          status: 'Occupied',
          assignedDate: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
    setReassignModal(false);
  };

  const handleReleaseBay = (id) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          busNumber: '--',
          fleetCode: 'Vacant',
          assignedDriver: 'Unassigned',
          status: 'Available',
          assignedDate: '--'
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
          <h2><SquareParking size={24} className="text-sky-600" /> Parking & Vehicle Assignment</h2>
          <p>Depot parking bay allocation, workshop pit berths, and dedicated driver vehicle assignments.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><SquareParking size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalSlots}</span>
            <span className="trans-kpi-title">Total Heavy Bays</span>
            <span className="trans-kpi-subtitle">Central Campus Depot</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><Bus size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{occupiedSlots}</span>
            <span className="trans-kpi-title">Occupied Bays</span>
            <span className="trans-kpi-subtitle">Buses parked / docked</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{availableSlots}</span>
            <span className="trans-kpi-title">Vacant Berths</span>
            <span className="trans-kpi-subtitle">Available for transit buses</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><AlertCircle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{maintenanceSlots}</span>
            <span className="trans-kpi-title">Maintenance Pits</span>
            <span className="trans-kpi-subtitle">In-service overhaul bay</span>
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
              placeholder="Search bay number, bus, driver..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Bay Statuses</option>
            <option value="Occupied">Occupied</option>
            <option value="Available">Available</option>
            <option value="Maintenance Pit">Maintenance Pit</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> designated depot slots
          </span>
        </div>
      </div>

      {/* Parking Bays Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredData.map(bay => (
          <div 
            key={bay.id} 
            style={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 12, 
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              borderLeft: bay.status === 'Available' ? '4px solid #10b981' : bay.status === 'Occupied' ? '4px solid #0284c7' : '4px solid #f59e0b'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{bay.bayNumber}</span>
                <span className={`trans-badge ${bay.status === 'Available' ? 'success' : bay.status === 'Occupied' ? 'info' : 'warning'}`}>
                  {bay.status}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>{bay.type}</div>

              <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 8, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Assigned Vehicle:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{bay.busNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Designated Driver:</span>
                  <span style={{ fontWeight: 600 }}>{bay.assignedDriver}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Allocation Date:</span>
                  <span>{bay.assignedDate}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {bay.status === 'Occupied' ? (
                <>
                  <button 
                    className="trans-btn trans-btn-outline" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => { setSelectedSlot(bay); setReassignModal(true); }}
                  >
                    <Edit3 size={12} /> Reassign
                  </button>
                  <button 
                    className="trans-btn trans-btn-outline" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#e11d48' }}
                    onClick={() => handleReleaseBay(bay.id)}
                  >
                    Release Slot
                  </button>
                </>
              ) : (
                <button 
                  className="trans-btn trans-btn-primary" 
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => { setSelectedSlot(bay); setReassignModal(true); }}
                >
                  Assign Vehicle
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reassign Modal */}
      {reassignModal && selectedSlot && (
        <div className="trans-modal-overlay" onClick={() => setReassignModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><SquareParking size={18} className="text-sky-600" /> Allocate Bay: {selectedSlot.bayNumber}</h3>
              <button className="trans-modal-close" onClick={() => setReassignModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleReassign}>
              <div className="trans-modal-body">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Select Vehicle to Berth</label>
                  <select className="trans-select" style={{ width: '100%' }} value={assignBus} onChange={e => setAssignBus(e.target.value)}>
                    <option value="OD-02-AK-4411">OD-02-AK-4411 (Bus 01)</option>
                    <option value="OD-02-AK-4412">OD-02-AK-4412 (Bus 02)</option>
                    <option value="OD-02-BL-8890">OD-02-BL-8890 (Bus 03)</option>
                    <option value="OD-02-BL-8891">OD-02-BL-8891 (Bus 04)</option>
                    <option value="OD-02-CL-1209">OD-02-CL-1209 (Bus 05)</option>
                  </select>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Designated Bus Pilot / Driver</label>
                  <select className="trans-select" style={{ width: '100%' }} value={assignDriver} onChange={e => setAssignDriver(e.target.value)}>
                    <option value="Ramesh Ch. Jena">Ramesh Ch. Jena (Senior Driver)</option>
                    <option value="Bikash Mohanty">Bikash Mohanty (Senior Driver)</option>
                    <option value="Sanjay Kumar Rout">Sanjay Kumar Rout (Driver)</option>
                    <option value="Kailash Sahoo">Kailash Sahoo (Driver)</option>
                    <option value="Purna Chandra Das">Purna Chandra Das (Relief Driver)</option>
                  </select>
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setReassignModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Confirm Slot Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
