import { useState } from 'react'
import {
  Award,
  BookOpen,
  Briefcase,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
  Video,
} from 'lucide-react'
import './PlacementPage.css'

const companies = [
  { name: 'TCS', logo: 'TCS', color: '#1a5276', package: '3.6 LPA', positions: ['Software Engineer', 'Data Analyst'], deadline: '25 Oct 2026' },
  { name: 'Infosys', logo: 'IF', color: '#007DC6', package: '3.4 LPA', positions: ['Systems Engineer'], deadline: '28 Oct 2026' },
  { name: 'Wipro', logo: 'WP', color: '#521472', package: '3.5 LPA', positions: ['Project Engineer'], deadline: '01 Nov 2026' },
  { name: 'Cognizant', logo: 'CT', color: '#005eb8', package: '4.0 LPA', positions: ['Programmer Analyst'], deadline: '05 Nov 2026' },
  { name: 'HCL Technologies', logo: 'HCL', color: '#0075c2', package: '3.8 LPA', positions: ['Graduate Engineer Trainee'], deadline: '10 Nov 2026' },
  { name: 'Tech Mahindra', logo: 'TM', color: '#d9272e', package: '3.25 LPA', positions: ['Software Engineer'], deadline: '15 Nov 2026' },
]

const courses = [
  { title: 'Aptitude & Reasoning Bootcamp', provider: 'T&P Cell', duration: '20 hours', enrolled: true, progress: 65 },
  { title: 'Resume Writing Workshop', provider: 'T&P Cell', duration: '3 hours', enrolled: true, progress: 100 },
  { title: 'Data Structures for Interviews', provider: 'Self-paced', duration: '15 hours', enrolled: false, progress: 0 },
  { title: 'Communication Skills & GD Prep', provider: 'T&P Cell', duration: '10 hours', enrolled: false, progress: 0 },
  { title: 'Mock Interview Series', provider: 'T&P Cell', duration: '6 sessions', enrolled: true, progress: 33 },
]

const placementStats = {
  batchYear: '2023–2027',
  eligible: 68,
  placed: 42,
  avgPackage: '4.2 LPA',
  highestPackage: '14 LPA',
  topRecruiter: 'Amazon',
}

export default function PlacementPage() {
  const [activeTab, setActiveTab] = useState('drive')
  const [registered, setRegistered] = useState({})
  const [registerMsg, setRegisterMsg] = useState('')

  function register(company) {
    setRegistered((prev) => ({ ...prev, [company.name]: true }))
    setRegisterMsg(`Registered for ${company.name} placement drive. Check your email for further details.`)
    setTimeout(() => setRegisterMsg(''), 5000)
  }

  return (
    <div className="placement-page">
      <div className="placement-header">
        <div>
          <p className="placement-kicker"><TrendingUp size={13} />TRAINING & PLACEMENT</p>
          <h2>Self Development & Placement</h2>
          <p className="placement-caption">Campus recruitment drives, skill development courses and placement records.</p>
        </div>
        <div className="placement-eligibility">
          <Check size={14} />
          <div>
            <strong>Placement Eligible</strong>
            <small>CGPA 8.42 · No Backlogs · Active</small>
          </div>
        </div>
      </div>

      {/* Official Placement Broadcast Channel Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#fff', display: 'block' }}>📢 Official Campus Placement Broadcast Channel</strong>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Latest recruitment drive notifications, eligibility criteria, and interview links are live in Campus Connect.</span>
          </div>
        </div>
        <button
          type="button"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: 'conv-placement' } }));
          }}
        >
          Open Placement Channel →
        </button>
      </div>

      <div className="placement-stats-strip">
        <div><strong>{placementStats.eligible}</strong><small>Eligible Students</small></div>
        <div><strong>{placementStats.placed}</strong><small>Placed (2026)</small></div>
        <div><strong>{placementStats.avgPackage}</strong><small>Avg. Package</small></div>
        <div><strong>{placementStats.highestPackage}</strong><small>Highest Package</small></div>
        <div><strong>{placementStats.topRecruiter}</strong><small>Top Recruiter</small></div>
      </div>

      <div className="placement-tabs" role="tablist">
        {[
          { key: 'drive', label: 'Placement Drives' },
          { key: 'courses', label: 'Skill Development' },
          { key: 'stats', label: 'Placement Records' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={activeTab === key ? 'active' : ''}
            role="tab"
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {registerMsg && <div className="placement-register-msg"><Check size={13} />{registerMsg}</div>}

      {activeTab === 'drive' && (
        <div className="placement-drive-list">
          {companies.map((company) => (
            <div key={company.name} className="company-card">
              <div className="company-logo" style={{ background: company.color }}>{company.logo}</div>
              <div className="company-body">
                <h3>{company.name}</h3>
                <div className="company-meta">
                  <span><Star size={11} />Package: {company.package}</span>
                  <span><Briefcase size={11} />Roles: {company.positions.join(', ')}</span>
                  <span><FileText size={11} />Deadline: {company.deadline}</span>
                </div>
              </div>
              <div className="company-action">
                {registered[company.name] ? (
                  <span className="company-registered"><Check size={13} />Registered</span>
                ) : (
                  <button className="company-register-btn" onClick={() => register(company)}>
                    Register <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="skill-courses-list">
          {courses.map((course, i) => (
            <div key={i} className={`skill-course-card ${course.enrolled ? 'enrolled' : ''}`}>
              <div className="skill-course-icon">
                {course.progress === 100 ? <Award size={20} /> : course.enrolled ? <Video size={20} /> : <BookOpen size={20} />}
              </div>
              <div className="skill-course-body">
                <h3>{course.title}</h3>
                <div className="skill-course-meta">
                  <span><User size={11} />{course.provider}</span>
                  <span><Star size={11} />{course.duration}</span>
                </div>
                {course.enrolled && (
                  <div className="skill-course-progress">
                    <div className="skill-progress-bar">
                      <div className="skill-progress-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span>{course.progress}%</span>
                  </div>
                )}
              </div>
              <div className="skill-course-action">
                {course.progress === 100 ? (
                  <span className="course-completed"><Check size={12} />Completed</span>
                ) : course.enrolled ? (
                  <button className="course-continue-btn">Continue <ChevronRight size={12} /></button>
                ) : (
                  <button className="course-enroll-btn">Enroll <ChevronRight size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="placement-records">
          <div className="records-chart-placeholder">
            <TrendingUp size={32} />
            <strong>Placement Statistics 2026</strong>
            <div className="records-bar-chart">
              {[
                { year: '2022–23', placed: 78, total: 94 },
                { year: '2023–24', placed: 85, total: 102 },
                { year: '2024–25', placed: 91, total: 108 },
                { year: '2025–26', placed: 97, total: 112 },
              ].map((item) => (
                <div key={item.year} className="records-bar-item">
                  <div className="records-bar-wrap">
                    <div
                      className="records-bar"
                      style={{ height: `${(item.placed / item.total) * 100}%` }}
                    />
                  </div>
                  <span>{item.placed}/{item.total}</span>
                  <small>{item.year}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="top-recruiters-section">
            <h3><Users size={14} />Top Recruiters</h3>
            <div className="recruiter-tags">
              {['Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCL', 'Accenture', 'Tech Mahindra', 'IBM', 'Capgemini'].map((r) => (
                <span key={r} className="recruiter-tag">{r}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
