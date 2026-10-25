import React from 'react';
import {
  Building2,
  Clock,
  ClipboardCheck,
  CheckCircle,
  Wrench,
  AlertTriangle,
  FileText,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  HardDrive,
  Share2,
  PackagePlus,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function StaffDashboardTab({
  currentBranch,
  activeLabId,
  profile,
  laboratories = [],
  timetable = [],
  equipment = [],
  consumables = [],
  maintenanceOrders = [],
  requisitions = [],
  safetyInspections = [],
  onNavigateTab,
  onOpenQuickAction,
  onStartSession,
  onCompleteSession
}) {
  // Derive real statistics from live data
  const branchLabs = laboratories.filter(l => l.department === currentBranch);
  const todaySessions = timetable.filter(t => t.date === '2026-10-24' || t.date === new Date().toISOString().split('T')[0]);
  const branchEquipment = equipment.filter(e => e.department === currentBranch);
  const availableEq = branchEquipment.filter(e => e.status === 'Available');
  const maintEq = branchEquipment.filter(e => e.status === 'Under Maintenance');
  const branchConsumables = consumables.filter(c => c.department === currentBranch);
  const lowStockItems = branchConsumables.filter(c => c.status === 'Low Stock' || c.status === 'Critical / Out of Stock');
  const pendingReqs = requisitions.filter(r => r.status === 'Pending Approval' || r.status === 'Submitted');
  const openTickets = maintenanceOrders.filter(m => m.status === 'Open' || m.status === 'Assigned' || m.status === 'In Progress');

  // Attendance metrics
  const totalExpected = todaySessions.reduce((acc, s) => acc + (s.expectedStudents || 0), 0);
  const totalPresent = todaySessions.reduce((acc, s) => acc + (s.presentCount || 0), 0);
  const attendancePercent = totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 94;

  // Recharts attendance by batch dataset
  const attendanceChartData = [
    { batch: 'Batch A1', Present: 31, Absent: 1, Late: 1 },
    { batch: 'Batch A2', Present: 30, Absent: 2, Late: 0 },
    { batch: 'Batch B1', Present: 26, Absent: 2, Late: 1 },
    { batch: 'Batch B2', Present: 28, Absent: 1, Late: 0 },
    { batch: 'Batch C1', Present: 29, Absent: 1, Late: 2 },
  ];

  // Recharts lab utilization by time slot dataset
  const utilizationChartData = [
    { time: '08:30 AM', utilization: 15, expectedStudents: 0 },
    { time: '09:30 AM', utilization: 92, expectedStudents: 65 },
    { time: '11:00 AM', utilization: 88, expectedStudents: 60 },
    { time: '12:30 PM', utilization: 40, expectedStudents: 25 },
    { time: '02:00 PM', utilization: 95, expectedStudents: 68 },
    { time: '03:30 PM', utilization: 85, expectedStudents: 55 },
    { time: '05:00 PM', utilization: 20, expectedStudents: 10 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Personalized Greeting Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#dbeafe',
              color: '#1e40af',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              Operational Shift Active
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Academic Year 2026–2027 · Autonomous Semester V &amp; VII
            </span>
          </div>
          <h2 style={{ margin: '6px 0 2px', fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
            Welcome back, {profile.name}
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569' }}>
            {profile.designation} · Assigned Scope: <strong>{branchLabs.map(l => l.name).join(' & ')}</strong>
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onOpenQuickAction?.('record-attendance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <ClipboardCheck size={16} /> Take Attendance
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickAction?.('raise-maintenance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <AlertTriangle size={16} /> Raise Ticket
          </button>
        </div>
      </div>

      {/* 8 Summary Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        {/* 1. Laboratories Assigned */}
        <div
          onClick={() => onNavigateTab('laboratories')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          className="hover:shadow-md hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Laboratories Assigned
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                {branchLabs.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                ● All {branchLabs.length} Operational
              </div>
            </div>
            <div style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '10px' }}>
              <Building2 size={22} />
            </div>
          </div>
        </div>

        {/* 2. Today's Practical Sessions */}
        <div
          onClick={() => onNavigateTab('timetable')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer'
          }}
          className="hover:shadow-md hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Today's Sessions
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                {todaySessions.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                1 In-Progress · 1 Scheduled
              </div>
            </div>
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '10px' }}>
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* 3. Student Attendance Recorded */}
        <div
          onClick={() => onNavigateTab('attendance')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer'
          }}
          className="hover:shadow-md hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Attendance Recorded
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                {attendancePercent}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                61 / 64 Students Marked
              </div>
            </div>
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '10px' }}>
              <ClipboardCheck size={22} />
            </div>
          </div>
        </div>

        {/* 4. Equipment Available */}
        <div
          onClick={() => onNavigateTab('equipment')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer'
          }}
          className="hover:shadow-md hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Equipment Available
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                {availableEq.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Total Asset Count: {branchEquipment.length}
              </div>
            </div>
            <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '10px', borderRadius: '10px' }}>
              <CheckCircle size={22} />
            </div>
          </div>
        </div>

        {/* 5. Equipment Under Maintenance */}
        <div
          onClick={() => onNavigateTab('maintenance')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer'
          }}
          className="hover:shadow-md hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Under Maintenance
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: maintEq.length > 0 ? '#ea580c' : '#0f172a', margin: '4px 0 2px' }}>
                {maintEq.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: maintEq.length > 0 ? '#ea580c' : '#16a34a', fontWeight: 600 }}>
                {maintEq.length > 0 ? 'APC UPS & Node #08' : '0 Assets In Service'}
              </div>
            </div>
            <div style={{ background: '#fff7ed', color: '#ea580c', padding: '10px', borderRadius: '10px' }}>
              <Wrench size={22} />
            </div>
          </div>
        </div>

        {/* 6. Low Stock Items */}
        <div
          onClick={() => onNavigateTab('inventory')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer'
          }}
          className="hover:shadow-md hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Low Stock Items
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: lowStockItems.length > 0 ? '#dc2626' : '#0f172a', margin: '4px 0 2px' }}>
                {lowStockItems.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: lowStockItems.length > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                {lowStockItems.length > 0 ? '1 Critical · 2 Near Reorder' : 'Stock Levels Healthy'}
              </div>
            </div>
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '10px' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* 7. Pending Requisitions */}
        <div
          onClick={() => onNavigateTab('requisitions')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer'
          }}
          className="hover:shadow-md hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Pending Requisitions
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                {pendingReqs.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                ₹8,500 Under HOD Review
              </div>
            </div>
            <div style={{ background: '#f0f9ff', color: '#0284c7', padding: '10px', borderRadius: '10px' }}>
              <FileText size={22} />
            </div>
          </div>
        </div>

        {/* 8. Open Maintenance Tickets */}
        <div
          onClick={() => onNavigateTab('maintenance')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer'
          }}
          className="hover:shadow-md hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Open Work Orders
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                {openTickets.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>
                1 Critical · 1 Assigned
              </div>
            </div>
            <div style={{ background: '#fff1f2', color: '#e11d48', padding: '10px', borderRadius: '10px' }}>
              <AlertCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner (If low stock or overdue maintenance) */}
      {lowStockItems.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, #fef2f2 0%, #fff7ed 100%)',
          borderLeft: '4px solid #ef4444',
          border: '1px solid #fed7aa',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.86rem',
          color: '#991b1b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} color="#dc2626" />
            <div>
              <strong>Inventory Warning:</strong> {lowStockItems[0]?.name} is exhausted ({lowStockItems[0]?.currentStock} {lowStockItems[0]?.unit}).
              Practical bench setups may be impacted.
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('inventory')}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Manage Stock →
          </button>
        </div>
      )}

      {/* Main Grid: Today's Timetable (Left) & Pending Tasks / Approvals (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* Today's Practical Timetable Widget */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#dbeafe', color: '#1e40af', padding: '6px', borderRadius: '6px' }}>
                <Calendar size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Today's Laboratory Timetable
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('timetable')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Full Schedule <ArrowRight size={14} />
            </button>
          </div>

          {todaySessions.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8' }}>
              No laboratory sessions scheduled today in this branch.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todaySessions.map(sess => (
                <div
                  key={sess.id}
                  style={{
                    background: sess.status === 'In-Progress' ? '#f0f9ff' : '#f8fafc',
                    border: sess.status === 'In-Progress' ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: sess.status === 'In-Progress' ? '#0284c7' : (sess.status === 'Completed' ? '#16a34a' : '#64748b'),
                          color: '#ffffff'
                        }}>
                          {sess.status}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                          {sess.timeSlot}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {sess.subject}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {sess.batch} · Faculty: {sess.faculty} · Lab: {sess.labName}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {sess.status === 'Scheduled' && (
                        <button
                          type="button"
                          onClick={() => onStartSession?.(sess.id)}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
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
                          onClick={() => onCompleteSession?.(sess.id)}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onNavigateTab('attendance')}
                        style={{
                          background: '#ffffff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Attendance ({sess.presentCount || 0})
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#475569', background: 'rgba(255, 255, 255, 0.7)', padding: '6px 10px', borderRadius: '6px' }}>
                    📖 <em>{sess.experiment}</em>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks & Approvals Queue */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px', borderRadius: '6px' }}>
                <Activity size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Pending Tasks &amp; Actions
              </h3>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
              {pendingReqs.length + openTickets.length} items requiring attention
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Action 1: Requisition Verification */}
            {pendingReqs.map(req => (
              <div
                key={req.id}
                style={{
                  border: '1px solid #fed7aa',
                  background: '#fffaf0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9a3412' }}>
                    Requisition Approval: {req.requisitionNo}
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                    {req.itemName} ({req.quantity} {req.unit})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Submitted by {req.requestingStaff} · Priority: {req.priority}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('requisitions')}
                  style={{
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Review
                </button>
              </div>
            ))}

            {/* Action 2: Critical Maintenance Ticket */}
            {openTickets.map(ticket => (
              <div
                key={ticket.id}
                style={{
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b91c1c' }}>
                    Work Order #{ticket.id} ({ticket.priority} Priority)
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                    {ticket.assetName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {ticket.assignedTechnician} · Status: {ticket.status}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('maintenance')}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Inspect
                </button>
              </div>
            ))}

            {/* Action 3: Calibration Due */}
            <div style={{
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4338ca' }}>
                  Calibration Due Notice
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                  Fluke 179 True-RMS Digital Multimeter (EQ-CSE-004)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Standard ISO/IEC 17025 verification overdue by 9 days
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('calibration')}
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Log Calibration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Row: Attendance Chart & Lab Utilization Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* Attendance by Batch Chart */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Practical Attendance by Batch
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                Headcount distribution across current week practical turns
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('report_attendance')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Export CSV →
            </button>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="batch" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Present" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Laboratory Utilization Chart */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Laboratory Workstation Utilization (%)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                Real-time workbench occupancy rate across academic shifts
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>
              Peak 95% at 02:00 PM
            </span>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Area type="monotone" dataKey="utilization" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#utilGrad)" name="Occupancy %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Laboratory Activity Timeline */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            Recent Operational Activity Log
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Live Audit Stream · Synchronized with Local Storage
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', marginTop: '6px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                Attendance Finalized for CS-591 Practical (Batch A1)
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                31 students marked Present, 1 Absent. Recorded by {profile.name} at 11:35 AM.
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>1 hour ago</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginTop: '6px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                Morning Pre-Session Safety Checklist Completed
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                All 6 critical safety items in {activeLabId} verified and signed off. Score: 95%.
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>3 hours ago</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginTop: '6px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                Stock Out Recorded: 2 Boxes AMP Cat6 RJ45 Connectors
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Dispensed to CS-591 laboratory racks. Current balance: 3 Boxes.
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>4 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
