import React, { useState, useMemo } from 'react';
import { 
  Users, CheckCircle2, Clock, AlertCircle, Search, Filter, 
  QrCode, RefreshCw, Bus, MapPin, Calendar, Check, X, ShieldAlert 
} from 'lucide-react';
import { mockBoardingAttendance } from './transportData';
import './TransportExtraSections.css';

export default function TransportBoardingSection() {
  const [data, setData] = useState(mockBoardingAttendance);
  const [search, setSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('2026-10-19');
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'summary' | 'scanner'
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [manualRoll, setManualRoll] = useState('');

  // Routes list for filter
  const uniqueRoutes = useMemo(() => {
    return Array.from(new Set(data.map(item => item.routeName)));
  }, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          item.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.stopName.toLowerCase().includes(search.toLowerCase());
      const matchRoute = routeFilter === 'ALL' || item.routeName === routeFilter;
      const matchStatus = statusFilter === 'ALL' || item.boardingStatus === statusFilter;
      const matchDate = !selectedDate || item.date === selectedDate;
      return matchSearch && matchRoute && matchStatus && matchDate;
    });
  }, [data, search, routeFilter, statusFilter, selectedDate]);

  // Statistics
  const totalStudents = data.length;
  const boardedCount = data.filter(d => d.boardingStatus === 'Boarded').length;
  const notBoardedCount = data.filter(d => d.boardingStatus === 'Not Boarded').length;
  const absentCount = data.filter(d => d.boardingStatus === 'Absent').length;

  // Route breakdown summary
  const routeSummary = useMemo(() => {
    const summary = {};
    data.forEach(item => {
      if (!summary[item.routeName]) {
        summary[item.routeName] = { route: item.routeName, vehicle: item.vehicleNumber, total: 0, boarded: 0, pending: 0 };
      }
      summary[item.routeName].total += 1;
      if (item.boardingStatus === 'Boarded') summary[item.routeName].boarded += 1;
      else summary[item.routeName].pending += 1;
    });
    return Object.values(summary);
  }, [data]);

  // Toggle boarding status (demo action)
  const toggleBoarding = (id) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        const isNowBoarded = item.boardingStatus !== 'Boarded';
        return {
          ...item,
          boardingStatus: isNowBoarded ? 'Boarded' : 'Not Boarded',
          boardingTime: isNowBoarded ? '08:14 AM' : '--:--',
          qrVerified: isNowBoarded
        };
      }
      return item;
    }));
  };

  const handleSimulateScan = (e) => {
    e.preventDefault();
    if (!manualRoll.trim()) return;
    const target = data.find(d => d.rollNumber.toLowerCase() === manualRoll.trim().toLowerCase());
    if (target) {
      toggleBoarding(target.id);
      setScanMessage(`Success: ${target.studentName} verified and boarded on ${target.vehicleNumber}`);
      setManualRoll('');
    } else {
      setScanMessage(`Notice: Roll number ${manualRoll} not registered on today's transit roster.`);
    }
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><Users size={24} className="text-sky-600" /> Student Boarding & Attendance</h2>
          <p>Real-time transit check-in roster, route-wise passenger headcounts, and electronic QR gate logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-outline" onClick={() => setScannerOpen(true)}>
            <QrCode size={16} /> QR Scanner Simulator
          </button>
          <button className="trans-btn trans-btn-primary" onClick={() => setActiveTab(activeTab === 'live' ? 'summary' : 'live')}>
            {activeTab === 'live' ? 'Route Summary View' : 'Live Passenger Roster'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Users size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalStudents}</span>
            <span className="trans-kpi-title">Registered Commuters</span>
            <span className="trans-kpi-subtitle">Active bus pass holders</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{boardedCount}</span>
            <span className="trans-kpi-title">Students Boarded</span>
            <span className="trans-kpi-subtitle">{((boardedCount/totalStudents)*100).toFixed(0)}% check-in rate</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{notBoardedCount}</span>
            <span className="trans-kpi-title">Not Yet Boarded</span>
            <span className="trans-kpi-subtitle">En route to pickup stops</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><AlertCircle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{absentCount}</span>
            <span className="trans-kpi-title">Reported Absent</span>
            <span className="trans-kpi-subtitle">Prior leave notified</span>
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
              placeholder="Search student, roll no, stop..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
            <option value="ALL">All Routes (5 Active)</option>
            {uniqueRoutes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Boarded">Boarded</option>
            <option value="Not Boarded">Not Boarded</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
            <Calendar size={15} />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="trans-select" 
              style={{ padding: '0.35rem 0.6rem' }}
            />
          </div>
          <button 
            className="trans-btn trans-btn-outline" 
            style={{ padding: '0.45rem 0.75rem' }}
            onClick={() => { setSearch(''); setRouteFilter('ALL'); setStatusFilter('ALL'); }}
            title="Reset Filters"
          >
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {activeTab === 'summary' ? (
        <div className="trans-table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700 }}>
            Route-Wise Passenger Headcount & Boarding Summary
          </div>
          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>Assigned Route</th>
                  <th>Designated Vehicle</th>
                  <th>Registered Pass Holders</th>
                  <th>Boarded Count</th>
                  <th>Pending Pickup</th>
                  <th>Occupancy Rate</th>
                </tr>
              </thead>
              <tbody>
                {routeSummary.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.route}</td>
                    <td>
                      <span className="trans-badge info">
                        <Bus size={12} style={{ marginRight: 4 }} /> {row.vehicle}
                      </span>
                    </td>
                    <td><strong>{row.total}</strong> students</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>{row.boarded}</td>
                    <td style={{ color: '#d97706', fontWeight: 700 }}>{row.pending}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(row.boarded / row.total) * 100}%`, height: '100%', background: '#0284c7' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{((row.boarded / row.total) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="trans-table-container">
          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>Student Name & Reg No</th>
                  <th>Assigned Route</th>
                  <th>Vehicle Number</th>
                  <th>Designated Stop</th>
                  <th>Boarding Status</th>
                  <th>Boarding Time</th>
                  <th>QR Verified</th>
                  <th style={{ textAlign: 'right' }}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No commuter records found matching the active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{item.rollNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.routeName}</div>
                      </td>
                      <td>
                        <span className="trans-badge info">
                          <Bus size={11} style={{ marginRight: 4 }} /> {item.vehicleNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
                          <MapPin size={13} color="#64748b" /> {item.stopName}
                        </div>
                      </td>
                      <td>
                        <span className={`trans-badge ${
                          item.boardingStatus === 'Boarded' ? 'success' :
                          item.boardingStatus === 'Absent' ? 'danger' : 'warning'
                        }`}>
                          {item.boardingStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 600 }}>
                        {item.boardingTime}
                      </td>
                      <td>
                        {item.qrVerified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
                            <Check size={14} /> Scanned
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Unscanned</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className={`trans-btn ${item.boardingStatus === 'Boarded' ? 'trans-btn-outline' : 'trans-btn-success'}`}
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => toggleBoarding(item.id)}
                        >
                          {item.boardingStatus === 'Boarded' ? 'Mark Pending' : 'Mark Boarded'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Scanning Simulator Modal */}
      {scannerOpen && (
        <div className="trans-modal-overlay" onClick={() => setScannerOpen(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><QrCode size={20} className="text-sky-600" /> RFID / Digital QR Boarding Terminal (Simulator)</h3>
              <button className="trans-modal-close" onClick={() => setScannerOpen(false)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
                <QrCode size={64} style={{ margin: '0 auto 1rem', color: '#0284c7' }} />
                <h4 style={{ margin: 0, color: '#0f172a' }}>Bus Gate Scanner Ready</h4>
                <p style={{ margin: '0.4rem 0 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Tap student RFID Smart Card or scan digital transit QR from student portal.
                </p>
                <form onSubmit={handleSimulateScan} style={{ display: 'flex', gap: '0.5rem', maxWidth: 360, margin: '0 auto' }}>
                  <input 
                    type="text" 
                    className="trans-select" 
                    style={{ flex: 1 }}
                    placeholder="Enter Reg / Roll No (e.g. 2401432265)"
                    value={manualRoll}
                    onChange={(e) => setManualRoll(e.target.value)}
                  />
                  <button type="submit" className="trans-btn trans-btn-primary">Verify</button>
                </form>
                {scanMessage && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem', background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                    {scanMessage}
                  </div>
                )}
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={14} color="#d97706" /> Note: Hardware optical scanner interface is simulated using local state demonstration.
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setScannerOpen(false)}>Close Simulator</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
