import React, { useState, useMemo } from 'react';
import { 
  UserCheck, Users, CheckCircle2, AlertCircle, Clock, 
  Search, Filter, Calendar, Bus, Check, X, Shield 
} from 'lucide-react';
import { mockStaffAttendance } from './transportData';
import './TransportExtraSections.css';

export default function TransportStaffAttendanceSection() {
  const [data, setData] = useState(mockStaffAttendance);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('2026-10-19');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.designation.toLowerCase().includes(search.toLowerCase()) ||
                          item.assignedBus.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status.includes(statusFilter);
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  // Statistics
  const totalStaff = data.length;
  const presentCount = data.filter(d => d.status.includes('Present')).length;
  const leaveCount = data.filter(d => d.status.includes('Leave')).length;
  const onRouteCount = data.filter(d => d.availability === 'On Route').length;

  const toggleAttendance = (id) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        const isCurrentlyPresent = item.status.includes('Present');
        return {
          ...item,
          status: isCurrentlyPresent ? 'On Authorized Leave' : 'Present On Duty',
          checkInTime: isCurrentlyPresent ? '--:--' : '06:30 AM',
          availability: isCurrentlyPresent ? 'Casual Leave' : 'On Route'
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
          <h2><UserCheck size={24} className="text-sky-600" /> Transport Staff Attendance</h2>
          <p>Commercial bus pilots, relief drivers, workshop mechanics, and daily biometric shift logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-outline" onClick={() => window.print()}>
            Print Duty Sheet
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Users size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalStaff}</span>
            <span className="trans-kpi-title">Transport Crew</span>
            <span className="trans-kpi-subtitle">Heavy vehicle licensed staff</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{presentCount}</span>
            <span className="trans-kpi-title">Present On Duty</span>
            <span className="trans-kpi-subtitle">{((presentCount/totalStaff)*100).toFixed(0)}% reporting rate</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><Bus size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{onRouteCount}</span>
            <span className="trans-kpi-title">Pilots On Route</span>
            <span className="trans-kpi-subtitle">Active bus steering shifts</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{leaveCount}</span>
            <span className="trans-kpi-title">Approved Leave</span>
            <span className="trans-kpi-subtitle">Float relief deployed</span>
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
              placeholder="Search staff name, bus, shift..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Present">Present On Duty</option>
            <option value="Leave">On Leave</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#475569' }}>
            <Calendar size={15} />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              className="trans-select" 
              style={{ padding: '0.35rem 0.6rem' }}
            />
          </div>
        </div>
      </div>

      {/* Staff Attendance Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Staff ID & Name</th>
                <th>Designation & License</th>
                <th>Assigned Bus</th>
                <th>Duty Shift Timings</th>
                <th>Biometric Check-In</th>
                <th>Attendance Status</th>
                <th>Duty Availability</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{item.id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.designation}</div>
                    <span className="trans-badge info" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      {item.licenseCategory} Valid
                    </span>
                  </td>
                  <td>
                    <span className="trans-badge info">
                      <Bus size={11} style={{ marginRight: 4 }} /> {item.assignedBus}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#475569' }}>{item.shift}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                    {item.checkInTime}
                  </td>
                  <td>
                    <span className={`trans-badge ${item.status.includes('Present') ? 'success' : 'warning'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.availability === 'On Route' ? '#0284c7' : '#64748b' }}>
                      {item.availability}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className={`trans-btn ${item.status.includes('Present') ? 'trans-btn-outline' : 'trans-btn-success'}`}
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => toggleAttendance(item.id)}
                    >
                      {item.status.includes('Present') ? 'Mark Leave' : 'Mark Present'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
