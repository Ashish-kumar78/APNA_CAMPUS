import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ScrollText,
  TrendingDown,
  TrendingUp,
  XCircle,
  Layers,
  MessageSquare,
  Sparkles,
  Clock,
  BookOpen
} from 'lucide-react'
import { api } from '../services/api'
import { isDemoAccount } from '../utils/authUtils'
import './AttendancePage.css'

function generateClassHistory(sub) {
  const { code, held, attended } = sub
  const absentCount = held - attended

  const dayOffsets = {
    CS501: [1, 3], // Mon, Wed
    CS502: [2, 4], // Tue, Thu
    CS503: [1, 5], // Mon, Fri
    CS504: [2, 5], // Tue, Fri
    CS505: [3],    // Wed
    CS506: [4],    // Thu
  }
  const targetDays = dayOffsets[code] || [1, 3]

  const absentSet = new Set()
  if (absentCount > 0) {
    const step = Math.floor(held / (absentCount + 1)) || 1
    for (let i = 1; i <= absentCount; i++) {
      const pos = Math.min(held, i * step + ((code.charCodeAt(3) || 0) % 2))
      absentSet.add(pos)
    }
  }

  const startDate = new Date(2026, 6, 15)
  const dates = []
  const curr = new Date(startDate)

  let count = 0
  while (count < held && curr <= new Date(2026, 9, 30)) {
    if (targetDays.includes(curr.getDay())) {
      count++
      const dayFormatted = new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        weekday: 'short',
      }).format(curr)

      dates.push({
        slNo: count,
        date: dayFormatted,
        status: absentSet.has(count) ? 'Absent' : 'Present',
      })
    }
    curr.setDate(curr.getDate() + 1)
  }

  return dates
}

const TH = 75

const demoAttendanceRecords = [
  { code: 'CS501', name: 'Design and Analysis of Algorithms', held: 36, attended: 33, faculty: 'Dr. S. Mohanty' },
  { code: 'CS502', name: 'Software Engineering', held: 34, attended: 31, faculty: 'Prof. R. K. Senapati' },
  { code: 'CS503', name: 'Operating Systems', held: 35, attended: 32, faculty: 'Dr. M. K. Panda' },
  { code: 'CS504', name: 'Computer Organisation & Architecture', held: 32, attended: 29, faculty: 'Prof. A. K. Nayak' },
  { code: 'CS505', name: 'Artificial Intelligence & Foundations', held: 33, attended: 30, faculty: 'Dr. P. K. Pattnaik' },
  { code: 'CS506', name: 'Advanced Algorithms Lab', held: 16, attended: 15, faculty: 'Dr. S. Mohanty' }
]

export default function AttendancePage({ account }) {
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.getStudentAttendance()
      .then((res) => {
        if (active && res?.data) {
          setAttendanceData(res.data)
        }
      })
      .catch((err) => {
        console.warn('Attendance sync notice:', err?.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Authentic records vs demo seed data separation
  const isDemo = isDemoAccount(account)
  const rawRecords = attendanceData?.records?.length > 0
    ? attendanceData.records
    : (Array.isArray(account?.attendanceRecords) && account.attendanceRecords.length > 0
      ? account.attendanceRecords
      : (isDemo ? demoAttendanceRecords : []))
  const records = rawRecords
  const hasRecords = Boolean(attendanceData?.hasAttendance || (records.length > 0 && records.some(r => (r.held || 0) > 0)))

  const held = hasRecords ? (attendanceData?.totalHeld ?? records.reduce((s, r) => s + (r.held || 0), 0)) : 0
  const att = hasRecords ? (attendanceData?.totalAttended ?? records.reduce((s, r) => s + (r.attended || 0), 0)) : 0
  const pct = hasRecords && held > 0 ? Math.round((att / held) * 100) : null
  const missed = hasRecords ? Math.max(0, held - att) : 0
  const low = hasRecords ? records.filter(s => s.held > 0 && Math.round((s.attended / s.held) * 100) < TH) : []

  const bs = p => p >= 85 ? 'excellent' : p >= 75 ? 'good' : p >= 65 ? 'warn' : 'danger'

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <p className="att-kicker"><CalendarDays size={13} /> ATTENDANCE DASHBOARD</p>
          <h2>Attendance Dashboard</h2>
          <p className="att-caption">Track class attendance and subject-wise academic logs</p>
        </div>
      </div>

      <div className="att-summary-strip">
        <div className="att-stat-card blue">
          <div className="att-stat-icon"><CalendarDays size={16} /></div>
          <strong>{held}</strong>
          <span>Classes Held</span>
          <small>{hasRecords ? 'Total Lectures' : 'No sessions held'}</small>
        </div>
        <div className="att-stat-card green">
          <div className="att-stat-icon"><CheckCircle2 size={16} /></div>
          <strong>{att}</strong>
          <span>Attended</span>
          <small>{hasRecords ? 'Present in Class' : 'No records yet'}</small>
        </div>
        <div className="att-stat-card red">
          <div className="att-stat-icon"><XCircle size={16} /></div>
          <strong>{missed}</strong>
          <span>Missed</span>
          <small>{hasRecords ? 'Absent Lectures' : 'No missed classes'}</small>
        </div>
        <div className="att-stat-card purple">
          <div className="att-stat-icon"><TrendingUp size={16} /></div>
          <strong>{pct !== null ? `${pct}%` : 'N/A'}</strong>
          <span>Overall Attendance</span>
          <small>{hasRecords ? `${att}/${held} classes` : 'No attendance records available'}</small>
        </div>
      </div>

      {low.length > 0 && (
        <div className="att-alert">
          <AlertTriangle size={15} />
          <div>
            <strong>Low Attendance Warning</strong>
            <span>{low.map(s => s.name).join(', ')} — below {TH}% threshold. Minimum attendance required is {TH}%.</span>
          </div>
        </div>
      )}

      {!hasRecords ? (
        <div className="att-empty-container" style={{ background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', padding: '48px 24px', textAlign: 'center', margin: '24px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <CalendarDays size={32} color="#94a3b8" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
            No attendance records available
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: 460, margin: '0 auto 16px', lineHeight: 1.6 }}>
            Your attendance will appear here after your first class is conducted and logged by faculty.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#f1f5f9', borderRadius: '20px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
            <Clock size={13} />
            <span>Status: Awaiting academic class activity</span>
          </div>
        </div>
      ) : (
        /* Subjects Attendance List */
        <div className="att-subject-list">
          {records.map(sub => {
            const p = sub.held > 0 ? Math.round((sub.attended / sub.held) * 100) : 0
            const st = bs(p)
            const nd = (sub.attended / sub.held) < TH / 100 ? Math.ceil(((TH / 100) * sub.held - sub.attended) / (1 - TH / 100)) : 0
            const isExpanded = expandedSubject === sub.code
            const history = isExpanded ? generateClassHistory(sub) : []
            return (
              <div key={sub.code} className="att-subject-card">
                <div className="att-subject-meta">
                  <div>
                    <span className="att-type-tag">{sub.type || 'Theory'}</span>
                    <strong>{sub.name}</strong>
                    <small>{sub.code} • {sub.faculty || 'Faculty'}</small>
                  </div>
                  <div className="att-subject-numbers">
                    <span className={`att-pct-badge ${st}`}>{p}%</span>
                    <small>{sub.attended}/{sub.held}</small>
                    <button
                      type="button"
                      className={`att-history-toggle ${isExpanded ? 'active' : ''}`}
                      onClick={() => setExpandedSubject(isExpanded ? null : sub.code)}
                      title="Click to view date-wise attendance log"
                    >
                      <ScrollText size={13} />
                      <span>{isExpanded ? 'Hide History' : 'Class History'}</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>
                <div className="att-bar-track">
                  <div className={`att-bar-fill ${st}`} style={{ width: `${p}%` }} role="progressbar" aria-valuenow={p} aria-valuemin="0" aria-valuemax="100" />
                  <div className="att-threshold-marker" style={{ left: `${TH}%` }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  {nd > 0 ? (
                    <p className="att-needed-note" style={{ margin: 0 }}>
                      <TrendingDown size={11} /> Need {nd} more consecutive classes to reach {TH}%.
                    </p>
                  ) : <div />}
                  <button
                    type="button"
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      color: '#2563eb',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="Open Campus Connect Chat for this course"
                    onClick={() => {
                      const convMap = {
                        'CS501': 'conv-cse-ai',
                        'CS502': 'conv-dbms',
                        'CS503': 'conv-cn',
                        'CS504': 'conv-os',
                        'CS505': 'conv-ds',
                        'CS506': 'conv-ds'
                      };
                      window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: convMap[sub.code] || 'conv-ds' } }));
                    }}
                  >
                    <MessageSquare size={12} /> Open Class Chat
                  </button>
                </div>

                {isExpanded && (
                  <div className="att-history-container">
                    <div className="att-history-header">
                      <p className="att-history-title">
                        <ScrollText size={14} /> Date-wise Attendance Log — {sub.name} ({sub.code})
                      </p>
                      <span className="att-history-count">Held: {sub.held} | Present: {sub.attended} | Absent: {sub.held - sub.attended}</span>
                    </div>
                    <div className="att-history-table-wrapper">
                      <table className="att-history-table">
                        <thead>
                          <tr>
                            <th style={{ width: '70px', textAlign: 'center' }}>Sl. No.</th>
                            <th>Class Date</th>
                            <th style={{ width: '180px', textAlign: 'center' }}>Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((row) => (
                            <tr key={row.slNo} className={row.status === 'Absent' ? 'row-absent' : 'row-present'}>
                              <td className="sl-col" style={{ textAlign: 'center' }}>{row.slNo}</td>
                              <td className="date-col">
                                <CalendarDays size={13} />
                                <span>{row.date}</span>
                              </td>
                              <td className="status-col" style={{ textAlign: 'center' }}>
                                {row.status === 'Present' ? (
                                  <span className="att-status-badge present">
                                    <CheckCircle2 size={12} /> Present
                                  </span>
                                ) : (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <span className="att-status-badge absent">
                                      <XCircle size={12} /> Absent
                                    </span>
                                    <button
                                      type="button"
                                      style={{
                                        background: '#fef3c7',
                                        border: '1px solid #fde68a',
                                        color: '#b45309',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                      }}
                                      title="Ask classmates for notes from this missed lecture"
                                      onClick={() => {
                                        window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: 'conv-ds' } }));
                                      }}
                                    >
                                      <Sparkles size={10} /> Ask Notes
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {records.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px', margin: '1rem 0' }}>
          <CalendarDays size={40} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '1rem' }}>No Attendance Records Yet</h3>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
            Your biometric logs and classroom lecture attendance will appear here once faculty conduct your classes.
          </p>
        </div>
      )}
    </div>
  )
}
