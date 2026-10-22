import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Shield,
  Calendar,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  RotateCcw
} from 'lucide-react';
import { mockHostelStaffList } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelStaffSection() {
  const [staffList, setStaffList] = useState(mockHostelStaffList);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'roster' | 'attendance'
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredStaff = staffList.filter(s =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.hostel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: staffList.length,
    onDuty: staffList.filter(s => s.attendance.includes('Present')).length,
    onLeave: staffList.filter(s => s.attendance.includes('Leave')).length,
    residentWardens: 2
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
          <h2><Users size={24} color="#2563eb" /> Hostel Staff &amp; Warden Duty Roster</h2>
          <p>Wardens · Caretakers · Security Sergeants · Housekeeping &amp; Kitchen Personnel</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            Print Duty Roster
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Users size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{stats.total}</span>
            <span className="hostel-kpi-title">Total Staff</span>
            <span className="hostel-kpi-subtitle">Sanctioned Hostel Cadre</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><UserCheck size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>{stats.onDuty}</span>
            <span className="hostel-kpi-title">Present On Duty</span>
            <span className="hostel-kpi-subtitle">Active across shifts</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Clock size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>{stats.onLeave}</span>
            <span className="hostel-kpi-title">On Authorized Leave</span>
            <span className="hostel-kpi-subtitle">Relief active</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple"><Shield size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#7c3aed' }}>{stats.residentWardens}</span>
            <span className="hostel-kpi-title">24x7 Resident Wardens</span>
            <span className="hostel-kpi-subtitle">Campus Quarter In-House</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="hostel-tab-pills">
        <button
          className={`hostel-tab-pill ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          Staff Directory ({filteredStaff.length})
        </button>
        <button
          className={`hostel-tab-pill ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Weekly Shift Schedule
        </button>
      </div>

      {/* TAB 1: DIRECTORY */}
      {activeTab === 'directory' && (
        <>
          <div className="hostel-filter-strip">
            <div className="hostel-search-input">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search staff by name, designation, or hostel..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Official contact records protected under BPUT Staff Privacy Code
            </div>
          </div>

          <div className="hostel-cards-grid">
            {filteredStaff.map(staff => (
              <div key={staff.id} className="hostel-item-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    border: '2px solid #bfdbfe',
                    flexShrink: 0
                  }}>
                    {staff.name.replace('Mr. ', '').replace('Mrs. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{staff.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>{staff.designation}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Staff ID: {staff.id}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div><strong>Assigned Hostel:</strong> {staff.hostel}</div>
                  <div><strong>Duty Shift:</strong> {staff.shift}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={13} color="#2563eb" />
                    <strong>Official Phone:</strong> {staff.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={13} color="#2563eb" />
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{staff.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <span className={`h-badge ${staff.attendance.includes('Present') ? 'h-badge-approved' : 'h-badge-late'}`}>
                    {staff.attendance}
                  </span>
                  <button
                    className="h-btn h-btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                    onClick={() => showToast(`Calling extension for ${staff.name}`)}
                  >
                    Quick Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: ROSTER */}
      {activeTab === 'roster' && (
        <div className="hostel-table-container">
          <div className="hostel-table-scroll">
            <table className="hostel-data-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Designation</th>
                  <th>Hostel Station</th>
                  <th>Mon - Wed</th>
                  <th>Thu - Sat</th>
                  <th>Sunday Roster</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(st => (
                  <tr key={st.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{st.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{st.id}</div>
                    </td>
                    <td><span className="h-badge h-badge-medium">{st.designation}</span></td>
                    <td>{st.hostel}</td>
                    <td style={{ fontSize: '0.82rem' }}>{st.shift}</td>
                    <td style={{ fontSize: '0.82rem' }}>{st.shift}</td>
                    <td style={{ fontSize: '0.82rem', color: st.attendance.includes('Leave') ? '#e11d48' : '#059669', fontWeight: 600 }}>
                      {st.attendance.includes('Leave') ? 'Relief On Duty' : 'Regular Shift'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
