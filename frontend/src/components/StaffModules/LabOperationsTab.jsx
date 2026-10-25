import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  PlayCircle,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Eye,
  X,
  FileText,
  Key,
  Unlock,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { labStaffStore } from '../../services/labStaffStore.js';
import { BRANCHES_CONFIG } from './labStaffData.js';

export default function LabOperationsTab({
  subTab = 'my-labs',
  currentBranch,
  activeLabId,
  profile,
  laboratories = [],
  timetable = [],
  equipment = [],
  onSuccessToast,
  onNavigateTab
}) {
  const [activeSubTab, setActiveSubTab] = useState(subTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(currentBranch || 'ALL');
  const [selectedLabDetail, setSelectedLabDetail] = useState(null);
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [timetableViewMode, setTimetableViewMode] = useState('list'); // 'day', 'week', 'list'

  // Readiness Checklist local state
  const branchConfig = BRANCHES_CONFIG[currentBranch] || BRANCHES_CONFIG.CSE;
  const [readinessItems, setReadinessItems] = useState([
    { id: 'r1', label: 'Primary 3-Phase & Secondary UPS AC Mains Switched On', checked: true, critical: true },
    { id: 'r2', label: 'Workstation Terminals & Networking Switches Online', checked: true, critical: true },
    { id: 'r3', label: 'Consumables & Practical Material Kits Placed on Student Benches', checked: true, critical: false },
    { id: 'r4', label: 'Safety Eyewash & CO2 Fire Extinguisher Seal Verified', checked: true, critical: true },
    { id: 'r5', label: 'Emergency Evacuation Doors Unlocked & Pathways Clear', checked: true, critical: true },
    { id: 'r6', label: 'Floors Swept, Bins Emptied & Cleanliness Validated', checked: false, critical: false }
  ]);

  // Opening & Closing Register local state
  const [openingClosingRecords, setOpeningClosingRecords] = useState([
    {
      date: '2026-10-24',
      openTime: '08:15 AM',
      openedBy: 'Mr. Biswajit Sahoo',
      keyNumber: 'KEY-C202',
      status: 'Open / In Operation',
      closeTime: 'Pending (Shift Active)',
      closedBy: '—',
      notes: 'Morning shift unsealed. No overnight anomalies.'
    },
    {
      date: '2026-10-23',
      openTime: '08:15 AM',
      openedBy: 'Mr. Biswajit Sahoo',
      keyNumber: 'KEY-C202',
      status: 'Closed & Locked',
      closeTime: '05:10 PM',
      closedBy: 'Mr. Biswajit Sahoo',
      notes: 'All power breakers shut down. All windows secured.'
    }
  ]);

  // New Lab Form state
  const [newLabData, setNewLabData] = useState({
    name: '',
    department: currentBranch,
    building: 'Turing Block-C',
    room: 'Room 205',
    capacity: 60,
    inCharge: 'Dr. Faculty In-Charge',
    assignedStaff: profile.name,
    status: 'Operational'
  });

  // Filtered Laboratories
  const filteredLabs = laboratories.filter(lab => {
    const matchesDept = filterDepartment === 'ALL' || lab.department === filterDepartment;
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Filtered Timetable
  const filteredTimetable = timetable.filter(t => {
    return filterDepartment === 'ALL' || t.department === filterDepartment;
  });

  const handleCreateLab = (e) => {
    e.preventDefault();
    if (!newLabData.name.trim()) return;
    const created = labStaffStore.addLaboratory(newLabData);
    onSuccessToast?.(`Laboratory "${created.name}" created successfully!`);
    setShowAddLabModal(false);
  };

  const toggleReadinessItem = (id) => {
    setReadinessItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleSaveReadiness = () => {
    const unCheckedCritical = readinessItems.filter(i => i.critical && !i.checked);
    if (unCheckedCritical.length > 0) {
      alert(`Warning: ${unCheckedCritical.length} critical safety items are NOT checked!`);
    }
    labStaffStore.markSessionReadiness('SES-2026-103', unCheckedCritical.length === 0, 'Morning checklist validated');
    onSuccessToast?.('Lab readiness checklist saved and logged in central register!');
  };

  const handleSignOffClosing = () => {
    const updated = [...openingClosingRecords];
    if (updated[0]) {
      updated[0].closeTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updated[0].closedBy = profile.name;
      updated[0].status = 'Closed & Locked';
      setOpeningClosingRecords(updated);
      onSuccessToast?.('Evening lab closure recorded with key return signature!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('my-labs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'my-labs' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'my-labs' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'my-labs' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Building2 size={16} /> My Laboratories ({laboratories.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('timetable')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'timetable' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'timetable' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'timetable' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Calendar size={16} /> Lab Timetable ({timetable.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('session-mgmt')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'session-mgmt' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'session-mgmt' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'session-mgmt' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <PlayCircle size={16} /> Practical Session Management
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('readiness')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'readiness' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'readiness' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'readiness' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={16} /> Lab Readiness Checklist
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('opening-closing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'opening-closing' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'opening-closing' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'opening-closing' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Key size={16} /> Opening &amp; Closing Register
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MY LABORATORIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'my-labs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search laboratory by ID, title, or room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.86rem',
                  width: '100%',
                  color: '#0f172a'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.84rem',
                  color: '#334155',
                  outline: 'none'
                }}
              >
                <option value="ALL">All Departments ({laboratories.length})</option>
                {Object.keys(BRANCHES_CONFIG).map(b => (
                  <option key={b} value={b}>{b} Laboratories</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddLabModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Add Laboratory
              </button>
            </div>
          </div>

          {/* Laboratories Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {filteredLabs.map(lab => {
              const labEquipment = equipment.filter(e => e.assignedLab === lab.id);
              return (
                <div
                  key={lab.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:shadow-md hover:border-blue-300"
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 800
                      }}>
                        {lab.id}
                      </span>
                      <span style={{
                        background: lab.status === 'Operational' ? '#dcfce7' : '#fee2e2',
                        color: lab.status === 'Operational' ? '#15803d' : '#b91c1c',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        ● {lab.status}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {lab.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                      {lab.building} · {lab.room} · Capacity: <strong>{lab.capacity} Students</strong>
                    </p>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.76rem',
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div><strong>In-Charge:</strong> {lab.inCharge}</div>
                    <div><strong>Staff on Duty:</strong> {lab.assignedStaff}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span>Assets Registered: <strong>{lab.equipmentCount} units</strong></span>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Safety Validated</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedLabDetail(lab)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#1e293b',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={14} /> Full Profile &amp; Inventory
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        labStaffStore.setActiveLabId(lab.id);
                        onSuccessToast?.(`Active workspace switched to ${lab.id}`);
                      }}
                      style={{
                        background: activeLabId === lab.id ? '#10b981' : '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {activeLabId === lab.id ? '✓ Current Focus' : 'Set as Focus'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LAB TIMETABLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'timetable' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                Academic Timetable Schedule:
              </span>
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                {['list', 'day', 'week'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTimetableViewMode(mode)}
                    style={{
                      background: timetableViewMode === mode ? '#ffffff' : 'transparent',
                      color: timetableViewMode === mode ? '#0f172a' : '#64748b',
                      border: 'none',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {mode.toUpperCase()} VIEW
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSuccessToast?.('Timetable schedule exported to ICS/Excel format!')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Export Schedule (CSV)
            </button>
          </div>

          {/* Table List View */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Session ID &amp; Date</th>
                    <th style={{ padding: '12px 16px' }}>Time Slot</th>
                    <th style={{ padding: '12px 16px' }}>Subject &amp; Experiment</th>
                    <th style={{ padding: '12px 16px' }}>Lab &amp; Department</th>
                    <th style={{ padding: '12px 16px' }}>Faculty / Batch</th>
                    <th style={{ padding: '12px 16px' }}>Students</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimetable.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.id}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{row.date}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563eb' }}>
                        {row.timeSlot}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.subject}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{row.experiment}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{row.labName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.department} · {row.semester}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{row.batch}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{row.faculty}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          {row.presentCount || row.expectedStudents} / {row.expectedStudents}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: row.status === 'Completed' ? '#dcfce7' : (row.status === 'In-Progress' ? '#e0f2fe' : '#fef3c7'),
                          color: row.status === 'Completed' ? '#15803d' : (row.status === 'In-Progress' ? '#0369a1' : '#b45309')
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedSessionDetail(row)}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRACTICAL SESSION MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'session-mgmt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Active Demonstration &amp; Practical Session Console
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Manage live equipment check-outs, experiment preparation checklists, and session progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Take Attendance Now →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
            {filteredTimetable.slice(0, 3).map(sess => (
              <div
                key={sess.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                    {sess.timeSlot}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: sess.status === 'Completed' ? '#16a34a' : '#ea580c' }}>
                    ● {sess.status}
                  </span>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    {sess.subject}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {sess.batch} · Expected: <strong>{sess.expectedStudents} students</strong>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem' }}>
                  <div style={{ color: '#475569', marginBottom: '4px' }}>
                    <strong>Prep Checklist Status:</strong> {sess.readinessCompleted ? '✓ 100% Prepared' : '⚠️ Preparation Pending'}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    Equipment &amp; Consumables allocated to student benches.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  {sess.status === 'Scheduled' && (
                    <button
                      type="button"
                      onClick={() => {
                        labStaffStore.updateSessionStatus(sess.id, 'In-Progress');
                        onSuccessToast?.(`Session ${sess.id} marked as In-Progress!`);
                      }}
                      style={{
                        flex: 1,
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        padding: '7px 0',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Start Session
                    </button>
                  )}

                  {sess.status === 'In-Progress' && (
                    <button
                      type="button"
                      onClick={() => {
                        labStaffStore.updateSessionStatus(sess.id, 'Completed');
                        onSuccessToast?.(`Session ${sess.id} marked as Completed!`);
                      }}
                      style={{
                        flex: 1,
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '7px 0',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Complete Session
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigateTab('attendance')}
                    style={{
                      flex: 1,
                      background: '#f1f5f9',
                      color: '#1e293b',
                      border: '1px solid #cbd5e1',
                      padding: '7px 0',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Attendance ({sess.presentCount || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LAB READINESS CHECKLIST */}
      {/* ========================================================================= */}
      {activeSubTab === 'readiness' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Pre-Session Laboratory Readiness Protocol
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Mandatory inspection checks before students enter {activeLabId}. Critical items must be 100% verified.
              </p>
            </div>
            <span style={{
              background: readinessItems.filter(i => i.critical && !i.checked).length === 0 ? '#dcfce7' : '#fee2e2',
              color: readinessItems.filter(i => i.critical && !i.checked).length === 0 ? '#15803d' : '#b91c1c',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              {readinessItems.filter(i => i.critical && !i.checked).length === 0 ? '✓ Ready For Practical' : '⚠️ Incomplete Critical Items'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {readinessItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleReadinessItem(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: item.checked ? '#f0fdf4' : '#ffffff',
                  border: item.checked ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {}} // handled by parent div
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: item.checked ? '#166534' : '#1e293b',
                    textDecoration: item.checked ? 'none' : 'none'
                  }}>
                    {item.label}
                  </span>
                </div>
                {item.critical && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#dc2626',
                    background: '#fef2f2',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    Critical Protocol
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSaveReadiness}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              ✓ Sign &amp; Save Readiness Protocol
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. OPENING AND CLOSING REGISTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'opening-closing' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Laboratory Security, Key Handover &amp; Opening/Closing Register
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Daily morning key issuance, room unsealing, end-of-day power switch off, and evening locking records.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOffClosing}
              style={{
                background: '#09152b',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Lock size={15} /> Sign-off Evening Lock
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>Unlock Time &amp; Staff</th>
                  <th style={{ padding: '12px 14px' }}>Key Register #</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Lock Time &amp; Staff</th>
                  <th style={{ padding: '12px 14px' }}>Verification Notes</th>
                </tr>
              </thead>
              <tbody>
                {openingClosingRecords.map((rec, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{rec.date}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#16a34a' }}>{rec.openTime}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{rec.openedBy}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600 }}>{rec.keyNumber}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: rec.status.includes('Open') ? '#e0f2fe' : '#f1f5f9',
                        color: rec.status.includes('Open') ? '#0284c7' : '#475569'
                      }}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{rec.closeTime}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{rec.closedBy}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.8rem' }}>{rec.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lab Detail Modal */}
      {selectedLabDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              background: '#0b1830',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{selectedLabDetail.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>{selectedLabDetail.id} · {selectedLabDetail.department}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLabDetail(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><strong>Building:</strong> {selectedLabDetail.building}</div>
                <div><strong>Room:</strong> {selectedLabDetail.room}</div>
                <div><strong>Capacity:</strong> {selectedLabDetail.capacity} Students</div>
                <div><strong>Status:</strong> {selectedLabDetail.status}</div>
                <div><strong>Lab In-Charge:</strong> {selectedLabDetail.inCharge}</div>
                <div><strong>Staff on Duty:</strong> {selectedLabDetail.assignedStaff}</div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <h5 style={{ margin: '0 0 6px', fontWeight: 700 }}>Equipment Registered</h5>
                <p style={{ margin: 0, color: '#64748b' }}>
                  {selectedLabDetail.equipmentCount} major instruments and computing nodes indexed in asset ledger.
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <h5 style={{ margin: '0 0 6px', fontWeight: 700 }}>Safety &amp; Compliance Status</h5>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>● Fully Compliant with Tier-1 AICTE Safety Norms</span>
              </div>
            </div>

            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedLabDetail(null)}
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Laboratory Modal */}
      {showAddLabModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '540px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              background: '#0b1830',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Register New Laboratory</h3>
              <button
                type="button"
                onClick={() => setShowAddLabModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLab} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Laboratory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Embedded IoT & Robotics Laboratory"
                  value={newLabData.name}
                  onChange={(e) => setNewLabData({ ...newLabData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Department</label>
                  <select
                    value={newLabData.department}
                    onChange={(e) => setNewLabData({ ...newLabData, department: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    {Object.keys(BRANCHES_CONFIG).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Capacity (Students)</label>
                  <input
                    type="number"
                    value={newLabData.capacity}
                    onChange={(e) => setNewLabData({ ...newLabData, capacity: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Building Block</label>
                  <input
                    type="text"
                    value={newLabData.building}
                    onChange={(e) => setNewLabData({ ...newLabData, building: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Room / Bay</label>
                  <input
                    type="text"
                    value={newLabData.room}
                    onChange={(e) => setNewLabData({ ...newLabData, room: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Lab In-Charge (Professor)</label>
                <input
                  type="text"
                  value={newLabData.inCharge}
                  onChange={(e) => setNewLabData({ ...newLabData, inCharge: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddLabModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create Laboratory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
