import React, { useState } from 'react';
import {
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  Award,
  ChevronRight,
  UserCheck,
  Send,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function WaitlistRoundsTab({
  waitlist = [],
  courses = [],
  onPromoteCandidate,
}) {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('All');

  const filteredWaitlist = waitlist.filter((w) => {
    if (selectedCourseFilter !== 'All' && w.courseCode !== selectedCourseFilter && w.course !== selectedCourseFilter) {
      return false;
    }
    if (selectedRoundFilter !== 'All' && w.admissionRound !== selectedRoundFilter) {
      return false;
    }
    return true;
  });

  const handlePromote = (item) => {
    if (
      !window.confirm(
        `Extend provisional admission offer to waitlisted candidate ${item.name} (${item.waitlistPosition}) for ${item.course}? Follows approved institutional merit order.`
      )
    ) {
      return;
    }
    onPromoteCandidate && onPromoteCandidate(item.id);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Waitlist Management &amp; Subsequent Admission Rounds
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Track vacancy backfills from declined offers, monitor waitlist positions, extend merit promotions, and preview upcoming counselling rounds.
          </p>
        </div>
      </div>

      {/* Aggregate Vacancy & Promotion KPI */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card amber">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Active Waitlist Pool</span>
            <div className="adm-kpi-icon-wrap"><Clock size={16} color="#d97706" /></div>
          </div>
          <div className="adm-kpi-value">{waitlist.length}</div>
          <div className="adm-kpi-foot">Ranked in merit queue</div>
        </div>

        <div className="adm-kpi-card teal">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Offers Extended</span>
            <div className="adm-kpi-icon-wrap"><Send size={16} color="#0d9488" /></div>
          </div>
          <div className="adm-kpi-value">
            {waitlist.filter((w) => w.offerStatus === 'Offer Extended').length}
          </div>
          <div className="adm-kpi-foot">Awaiting token deposit</div>
        </div>

        <div className="adm-kpi-card blue">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Total Institutional Vacancies</span>
            <div className="adm-kpi-icon-wrap"><Layers size={16} color="#0284c7" /></div>
          </div>
          <div className="adm-kpi-value">80</div>
          <div className="adm-kpi-foot">Across 7 disciplines</div>
        </div>

        <div className="adm-kpi-card green">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Next Planned Round</span>
            <div className="adm-kpi-icon-wrap"><ShieldCheck size={16} color="#059669" /></div>
          </div>
          <div className="adm-kpi-value" style={{ fontSize: '1.35rem' }}>Round 2 Cutoff</div>
          <div className="adm-kpi-foot">30 Oct 2026 publication</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="adm-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Filter Waitlist:</span>
        </div>
        <div className="adm-filter-group">
          <select
            className="adm-select-control"
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
          >
            <option value="All">All Disciplines</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            className="adm-select-control"
            value={selectedRoundFilter}
            onChange={(e) => setSelectedRoundFilter(e.target.value)}
          >
            <option value="All">All Admission Rounds</option>
            <option value="Round 1">Round 1</option>
            <option value="Round 2">Round 2</option>
            <option value="Spot Round">Spot Round</option>
          </select>
        </div>
      </div>

      {/* Main Waitlist Table */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <Clock size={18} color="#0284c7" /> Official Institutional Waitlist Queue
            </h3>
            <p className="adm-panel-desc">
              Candidates ordered by official entrance examination score and institutional merit policy
            </p>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th>Waitlist Position</th>
                <th>Candidate Legal Name</th>
                <th>Application ID</th>
                <th>Course &amp; Discipline</th>
                <th>Candidate Rank</th>
                <th>Admission Round</th>
                <th>Offer Status</th>
                <th>Response Cutoff</th>
                <th>Vacancies</th>
                <th style={{ textAlign: 'right' }}>Next Policy Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWaitlist.map((item) => {
                const isExtended = item.offerStatus === 'Offer Extended';

                return (
                  <tr key={item.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          background: '#fef3c7',
                          color: '#b45309',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {item.waitlistPosition}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 600 }}>
                      {item.applicationNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{item.course}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.candidateRank}</div>
                    </td>
                    <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                      {item.admissionRound}
                    </td>
                    <td>
                      <span
                        className={`adm-status-tag ${
                          isExtended ? 'selected' : 'under_review'
                        }`}
                      >
                        {item.offerStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.74rem', color: '#475569' }}>
                      {item.responseDeadline}
                    </td>
                    <td style={{ fontWeight: 700, color: '#059669', textAlign: 'center' }}>
                      {item.vacanciesAvailable} Seats
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {item.nextAction}
                        </span>
                        {!isExtended && (
                          <button
                            type="button"
                            className="adm-btn-primary"
                            onClick={() => handlePromote(item)}
                            style={{ padding: '4px 8px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                          >
                            <Send size={12} /> Extend Offer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subsequent Rounds Overview */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <TrendingUp size={18} color="#059669" /> Subsequent Admission Rounds Schedule &amp; Projected Vacancies
            </h3>
            <p className="adm-panel-desc">
              Structured round timeline according to state counseling authority guidelines
            </p>
          </div>
        </div>
        <div className="adm-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="adm-badge-pill green">Active Window</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Round 2</span>
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 800 }}>
                Round 2 Counselling &amp; Allotment
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Processing 45 vacant seats resulting from unaccepted Round 1 provisional offers. Merit cutoff adjusted by +5% to +8%.
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#334155' }}>
                <strong>Verification Closes:</strong> 28 Oct 2026 · <strong>Seat Acceptance:</strong> 04 Nov 2026
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="adm-badge-pill dark">Upcoming</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Spot Round</span>
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 800 }}>
                Institutional Open-House Spot Mop-Up
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Direct counseling for all remaining vacant engineering seats and lateral entry diploma candidates at the Campus Auditorium.
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#334155' }}>
                <strong>Scheduled Date:</strong> 08 Nov 2026 (09:30 AM onwards)
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="adm-badge-pill dark">Final Freeze</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>AICTE / BPUT Cutoff</span>
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 800 }}>
                Mandatory University Enrollment Freeze
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                University portal cutoff date. No further admissions permitted after this regulatory freeze.
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#334155' }}>
                <strong>Regulatory Deadline:</strong> 15 Nov 2026 (05:00 PM)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
