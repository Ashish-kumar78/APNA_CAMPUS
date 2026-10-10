import { useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  Clock,
  FileText,
  Filter,
  MessageSquare,
} from 'lucide-react'
import { downloadTimetablePdf } from '../utils/pdfGenerator'
import './TimetablePage.css'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const slots = ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM', '4:30 PM']

const schedule = {
  Monday: {
    '8:30 AM': { subject: 'Artificial Intelligence', code: 'CS501', room: 'Room 301', faculty: 'Dr. P. Mohapatra', type: 'theory' },
    '9:30 AM': { subject: 'Machine Learning', code: 'CS502', room: 'Room 302', faculty: 'Dr. S. Rath', type: 'theory' },
    '10:30 AM': null,
    '11:30 AM': { subject: 'Compiler Design', code: 'CS504', room: 'Room 204', faculty: 'Dr. A. Panda', type: 'theory' },
    '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
    '1:30 PM': { subject: 'AI Lab', code: 'CS505', room: 'CS Lab-1', faculty: 'Dr. P. Mohapatra', type: 'lab' },
    '2:30 PM': { subject: 'AI Lab', code: 'CS505', room: 'CS Lab-1', faculty: 'Dr. P. Mohapatra', type: 'lab' },
    '3:30 PM': null,
    '4:30 PM': null,
  },
  Tuesday: {
    '8:30 AM': { subject: 'Cloud Computing', code: 'CS503', room: 'Room 205', faculty: 'Prof. R. Nayak', type: 'theory' },
    '9:30 AM': { subject: 'Artificial Intelligence', code: 'CS501', room: 'Room 301', faculty: 'Dr. P. Mohapatra', type: 'theory' },
    '10:30 AM': { subject: 'Machine Learning', code: 'CS502', room: 'Room 302', faculty: 'Dr. S. Rath', type: 'theory' },
    '11:30 AM': null,
    '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
    '1:30 PM': { subject: 'Project Work', code: 'CS506', room: 'Lab-3', faculty: 'Dr. S. Mohanty', type: 'project' },
    '2:30 PM': { subject: 'Project Work', code: 'CS506', room: 'Lab-3', faculty: 'Dr. S. Mohanty', type: 'project' },
    '3:30 PM': null,
    '4:30 PM': null,
  },
  Wednesday: {
    '8:30 AM': { subject: 'Compiler Design', code: 'CS504', room: 'Room 204', faculty: 'Dr. A. Panda', type: 'theory' },
    '9:30 AM': null,
    '10:30 AM': { subject: 'Cloud Computing', code: 'CS503', room: 'Room 205', faculty: 'Prof. R. Nayak', type: 'theory' },
    '11:30 AM': { subject: 'Machine Learning', code: 'CS502', room: 'Room 302', faculty: 'Dr. S. Rath', type: 'theory' },
    '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
    '1:30 PM': null,
    '2:30 PM': null,
    '3:30 PM': null,
    '4:30 PM': null,
  },
  Thursday: {
    '8:30 AM': { subject: 'Artificial Intelligence', code: 'CS501', room: 'Room 301', faculty: 'Dr. P. Mohapatra', type: 'theory' },
    '9:30 AM': { subject: 'Compiler Design', code: 'CS504', room: 'Room 204', faculty: 'Dr. A. Panda', type: 'theory' },
    '10:30 AM': null,
    '11:30 AM': { subject: 'Cloud Computing', code: 'CS503', room: 'Room 205', faculty: 'Prof. R. Nayak', type: 'theory' },
    '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
    '1:30 PM': { subject: 'AI Lab', code: 'CS505', room: 'CS Lab-1', faculty: 'Dr. P. Mohapatra', type: 'lab' },
    '2:30 PM': { subject: 'AI Lab', code: 'CS505', room: 'CS Lab-1', faculty: 'Dr. P. Mohapatra', type: 'lab' },
    '3:30 PM': null,
    '4:30 PM': null,
  },
  Friday: {
    '8:30 AM': { subject: 'Machine Learning', code: 'CS502', room: 'Room 302', faculty: 'Dr. S. Rath', type: 'theory' },
    '9:30 AM': { subject: 'Artificial Intelligence', code: 'CS501', room: 'Room 301', faculty: 'Dr. P. Mohapatra', type: 'theory' },
    '10:30 AM': { subject: 'Compiler Design', code: 'CS504', room: 'Room 204', faculty: 'Dr. A. Panda', type: 'theory' },
    '11:30 AM': { subject: 'Cloud Computing', code: 'CS503', room: 'Room 205', faculty: 'Prof. R. Nayak', type: 'theory' },
    '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
    '1:30 PM': { subject: 'Project Work', code: 'CS506', room: 'Lab-3', faculty: 'Dr. S. Mohanty', type: 'project' },
    '2:30 PM': { subject: 'Project Work', code: 'CS506', room: 'Lab-3', faculty: 'Dr. S. Mohanty', type: 'project' },
    '3:30 PM': null,
    '4:30 PM': null,
  },
  Saturday: {
    '8:30 AM': null,
    '9:30 AM': { subject: 'Extra Lecture / Remedial', code: '—', room: 'Room 201', faculty: 'As assigned', type: 'extra' },
    '10:30 AM': { subject: 'Extra Lecture / Remedial', code: '—', room: 'Room 201', faculty: 'As assigned', type: 'extra' },
    '11:30 AM': null,
    '12:30 PM': null,
    '1:30 PM': null,
    '2:30 PM': null,
    '3:30 PM': null,
    '4:30 PM': null,
  },
}

const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

export default function TimetablePage() {
  const [view, setView] = useState('week')
  const [selectedDay, setSelectedDay] = useState(days.includes(today) ? today : 'Monday')

  const displayDays = view === 'week' ? days : [selectedDay]

  return (
    <div className="timetable-page">
      <div className="timetable-header">
        <div>
          <p className="timetable-kicker"><CalendarDays size={13} />WEEKLY SCHEDULE</p>
          <h2>Timetable</h2>
          <p className="timetable-caption">Your class schedule for Semester 5 · Section A (CSE · AI)</p>
        </div>
        <div className="timetable-controls">
          <div className="timetable-view-toggle">
            <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week View</button>
            <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day View</button>
          </div>
          {view === 'day' && (
            <div className="day-selector">
              {days.map((day) => (
                <button
                  key={day}
                  className={selectedDay === day ? 'active' : ''}
                  onClick={() => setSelectedDay(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="timetable-legend">
        {[
          { type: 'theory', label: 'Theory' },
          { type: 'lab', label: 'Lab' },
          { type: 'project', label: 'Project' },
          { type: 'extra', label: 'Extra / Remedial' },
          { type: 'break', label: 'Break' },
        ].map((item) => (
          <span key={item.type} className={`legend-item legend-${item.type}`}>{item.label}</span>
        ))}
      </div>

      <div className="timetable-grid-wrap">
        <div className="timetable-grid" style={{ gridTemplateColumns: `80px repeat(${displayDays.length}, minmax(0,1fr))` }}>
          {/* Header row */}
          <div className="tg-corner" />
          {displayDays.map((day) => (
            <div key={day} className={`tg-day-header ${day === today ? 'today' : ''}`}>
              {day}
              {day === today && <span className="today-indicator">Today</span>}
            </div>
          ))}

          {/* Time slots */}
          {slots.map((slot) => (
            <>
              <div key={slot} className="tg-time">
                <Clock size={10} />
                {slot}
              </div>
              {displayDays.map((day) => {
                const entry = schedule[day]?.[slot]
                if (!entry) return <div key={`${day}-${slot}`} className="tg-cell tg-empty" />
                return (
                  <div key={`${day}-${slot}`} className={`tg-cell tg-filled type-${entry.type}`}>
                    {entry.type === 'break' ? (
                      <span className="tg-break">— Lunch Break —</span>
                    ) : (
                      <>
                        <strong className="tg-subject">{entry.subject}</strong>
                        {entry.code && <code className="tg-code">{entry.code}</code>}
                        {entry.room && <span className="tg-room">{entry.room}</span>}
                        {entry.faculty && <span className="tg-faculty">{entry.faculty}</span>}
                        {entry.code && (
                          <button
                            type="button"
                            style={{
                              marginTop: '4px',
                              background: 'rgba(37, 99, 235, 0.12)',
                              border: '1px solid rgba(37, 99, 235, 0.3)',
                              color: '#1d4ed8',
                              fontSize: '9.5px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              alignSelf: 'flex-start'
                            }}
                            title="Open Campus Connect chat for this class"
                            onClick={(e) => {
                              e.stopPropagation();
                              const convMap = {
                                'CS501': 'conv-cse-ai',
                                'CS502': 'conv-dbms',
                                'CS503': 'conv-cn',
                                'CS504': 'conv-os',
                                'CS505': 'conv-ds',
                                'CS506': 'conv-ds'
                              };
                              window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: convMap[entry.code] || 'conv-ds' } }));
                            }}
                          >
                            <MessageSquare size={10} /> Class Chat
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>

      <div className="timetable-note">
        <AlertCircle size={13} />
        Timetable is subject to change. Any modifications will be announced by the respective department.
        <button className="timetable-download" onClick={() => downloadTimetablePdf(schedule)}>
          <FileText size={12} />Download PDF
        </button>
      </div>
    </div>
  )
}
