import { useEffect, useState } from 'react'
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
  BookOpen,
  Eye,
  Info,
  Layers,
  ArrowRight,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import { notesApi } from '../services/notesApi'
import './AttendancePage.css'

const S = [
  { code: 'CS501', name: 'Artificial Intelligence', faculty: 'Dr. P. Mohapatra', held: 42, attended: 40, type: 'Theory' },
  { code: 'CS502', name: 'Machine Learning', faculty: 'Dr. S. Rath', held: 38, attended: 35, type: 'Theory' },
  { code: 'CS503', name: 'Cloud Computing', faculty: 'Prof. R. Nayak', held: 36, attended: 28, type: 'Theory' },
  { code: 'CS504', name: 'Compiler Design', faculty: 'Dr. A. Panda', held: 40, attended: 38, type: 'Theory' },
  { code: 'CS505', name: 'AI Lab', faculty: 'Dr. P. Mohapatra', held: 20, attended: 20, type: 'Lab' },
  { code: 'CS506', name: 'Project Work - Phase I', faculty: 'Dr. S. Mohanty', held: 14, attended: 13, type: 'Project' }
]

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

export default function AttendancePage() {
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [missedClasses, setMissedClasses] = useState([])

  const held = S.reduce((s, r) => s + r.held, 0)
  const att = S.reduce((s, r) => s + r.attended, 0)
  const pct = Math.round((att / held) * 100)
  const missed = held - att
  const low = S.filter(s => Math.round((s.attended / s.held) * 100) < TH)

  const bs = p => p >= 85 ? 'excellent' : p >= 75 ? 'good' : p >= 65 ? 'warn' : 'danger'

  useEffect(() => {
    loadMissedClasses()
  }, [])

  const loadMissedClasses = async () => {
    const data = await notesApi.getMissedClasses()
    if (data) setMissedClasses(data)
  }

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <p className="att-kicker"><CalendarDays size={13} /> ATTENDANCE & MISSED LECTURES</p>
          <h2>Attendance Dashboard</h2>
          <p className="att-caption">Track class attendance & access peer-shared class notes for missed lectures</p>
        </div>
        <div className="att-overall-badge">
          <span className="att-pct-circle">{pct}%</span>
          <div>
            <strong>Overall Attendance</strong>
            <small>Semester 5 • {att}/{held} classes</small>
          </div>
        </div>
      </div>

      <div className="att-summary-strip">
        <div className="att-stat-card blue"><CalendarDays size={18} /><strong>{held}</strong><span>Classes Held</span></div>
        <div className="att-stat-card green"><CheckCircle2 size={18} /><strong>{att}</strong><span>Attended</span></div>
        <div className="att-stat-card red"><XCircle size={18} /><strong>{missed}</strong><span>Missed</span></div>
        <div className="att-stat-card purple"><TrendingUp size={18} /><strong>{pct}%</strong><span>Rate</span></div>
      </div>

      {/* FEATURE 2 — REQUIREMENTS 10 & 11: MISSED CLASSES & CLASS NOTES CONNECTOR */}
      <div className="missed-classes-card" style={{ background: '#ffffff', border: '1.5px solid #6366f1', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 14px rgba(99,102,241,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: '#4338ca' }} />
              Missed Classes & Available Peer Notes
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Automatically synced with your class attendance log. Access handwritten notes & board photos for lectures you missed.
            </p>
          </div>
          <button 
            type="button" 
            style={{ padding: '6px 12px', background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { window.location.hash = 'class-notes' }}
          >
            All Class Notes Hub <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {missedClasses.map((item) => (
            <div key={item.id} style={{ background: item.notesAvailable ? '#f8fafc' : '#fff5f5', border: item.notesAvailable ? '1px solid #cbd5e1' : '1px solid #fca5a5', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.74rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Status: Absent
                  </span>
                  <small style={{ color: '#64748b' }}>{item.date}</small>
                </div>
                <strong style={{ fontSize: '0.98rem', color: '#0f172a', display: 'block' }}>{item.subject}</strong>
                <p style={{ margin: '4px 0 8px', fontSize: '0.8rem', color: '#475569' }}>Topic: {item.topic}</p>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item.notesAvailable ? (
                  <>
                    <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Notes Available ({item.notesCount} sets)
                    </span>
                    <button 
                      type="button" 
                      style={{ background: '#4338ca', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => { window.location.hash = 'class-notes' }}
                    >
                      <Eye size={12} /> View Notes
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                    ✕ No notes uploaded yet
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '8px 12px', fontSize: '0.76rem', color: '#1e40af', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} />
          <span>Attendance records remain strictly controlled by authorized faculty members. Students cannot edit attendance logs.</span>
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

      {/* Subjects Attendance List */}
      <div className="att-subject-list">
        {S.map(sub => {
          const p = Math.round((sub.attended / sub.held) * 100)
          const st = bs(p)
          const nd = (sub.attended / sub.held) < TH / 100 ? Math.ceil(((TH / 100) * sub.held - sub.attended) / (1 - TH / 100)) : 0
          const isExpanded = expandedSubject === sub.code
          const history = isExpanded ? generateClassHistory(sub) : []
          return (
            <div key={sub.code} className="att-subject-card">
              <div className="att-subject-meta">
                <div>
                  <span className="att-type-tag">{sub.type}</span>
                  <strong>{sub.name}</strong>
                  <small>{sub.code} • {sub.faculty}</small>
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
    </div>
  )
}
