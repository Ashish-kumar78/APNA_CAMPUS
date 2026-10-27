import React, { useState } from 'react';
import {
  Layers,
  Filter,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function SeatMatrixTab({ courses = [] }) {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('Round 2');

  const filteredCourses = courses.filter((c) => {
    if (selectedCourseFilter !== 'All' && c.id !== selectedCourseFilter && c.code !== selectedCourseFilter) {
      return false;
    }
    return true;
  });

  const totalIntake = filteredCourses.reduce((sum, c) => sum + (c.approvedIntake || 0), 0);
  const totalApps = filteredCourses.reduce((sum, c) => sum + (c.applicationsReceived || 0), 0);
  const totalEligible = filteredCourses.reduce((sum, c) => sum + (c.eligibleApplicants || 0), 0);
  const totalAllotted = filteredCourses.reduce((sum, c) => sum + (c.seatsAllotted || 0), 0);
  const totalConfirmed = filteredCourses.reduce((sum, c) => sum + (c.confirmedAdmissions || 0), 0);
  const totalVacant = Math.max(0, totalIntake - totalConfirmed);
  const overallOccupancy = totalIntake > 0 ? Math.round((totalConfirmed / totalIntake) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Course Code,Course Name,Degree,Approved Intake,Applications,Eligible,Allotted,Confirmed,Vacant,Occupancy %',
        ...courses.map(
          (c) =>
            `"${c.code}","${c.name}","${c.degree}",${c.approvedIntake},${c.applicationsReceived},${c.eligibleApplicants},${c.seatsAllotted},${c.confirmedAdmissions},${c.vacantSeats},${Math.round(
              (c.confirmedAdmissions / c.approvedIntake) * 100
            )}%`
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `seat_matrix_vacancy_report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Institutional Seat Matrix &amp; Branch Vacancy Audit
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Academic Session 2026–2027 · AICTE Approved Intake Roster · Reservation &amp; Quota Seat Breakdown
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="adm-btn-secondary" onClick={handleSimulateCSV}>
            <FileSpreadsheet size={15} /> Export CSV Report
          </button>
          <button type="button" className="adm-btn-secondary" onClick={handlePrint}>
            <Printer size={15} /> Print Roster
          </button>
        </div>
      </div>

      {/* Aggregate Matrix Summary Ribbon */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card blue">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Approved Intake</span>
            <div className="adm-kpi-icon-wrap"><Building2 size={16} color="#0284c7" /></div>
          </div>
          <div className="adm-kpi-value">{totalIntake}</div>
          <div className="adm-kpi-foot">720 Total across 7 disciplines</div>
        </div>

        <div className="adm-kpi-card teal">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Demand Pool</span>
            <div className="adm-kpi-icon-wrap"><TrendingUp size={16} color="#0d9488" /></div>
          </div>
          <div className="adm-kpi-value">{totalApps}</div>
          <div className="adm-kpi-foot">{totalEligible} Verified eligible</div>
        </div>

        <div className="adm-kpi-card indigo">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Seats Allotted</span>
            <div className="adm-kpi-icon-wrap"><Award size={16} color="#4f46e5" /></div>
          </div>
          <div className="adm-kpi-value">{totalAllotted}</div>
          <div className="adm-kpi-foot">{totalConfirmed} Fee-cleared confirmed</div>
        </div>

        <div className="adm-kpi-card amber">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Current Vacancy</span>
            <div className="adm-kpi-icon-wrap"><Layers size={16} color="#d97706" /></div>
          </div>
          <div className="adm-kpi-value">{totalVacant}</div>
          <div className="adm-kpi-foot" style={{ color: '#d97706', fontWeight: 600 }}>
            Available for Round 2 &amp; Spot
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="adm-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Filter Seat Matrix:</span>
        </div>
        <div className="adm-filter-group">
          <select
            className="adm-select-control"
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
          >
            <option value="All">All Disciplines &amp; Degrees</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          <select
            className="adm-select-control"
            value={selectedRoundFilter}
            onChange={(e) => setSelectedRoundFilter(e.target.value)}
          >
            <option value="Round 1">Round 1 (Closed)</option>
            <option value="Round 2">Round 2 (Active Counseling)</option>
            <option value="Spot Round">Spot Round (Projected)</option>
          </select>
        </div>
      </div>

      {/* Detailed Master Seat Matrix Table */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <Layers size={18} color="#0284c7" /> Approved Intake vs. Admissions Breakdown
            </h3>
            <p className="adm-panel-desc">
              Mandatory quota breakdown: General (50%), OBC (27%), SC (15%), ST (7.5%), and Institutional Vacancy
            </p>
          </div>
          <span className="adm-badge-pill green">
            Institutional Occupancy: {overallOccupancy}%
          </span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th>Course Name &amp; Code</th>
                <th>Intake</th>
                <th>Gen (50%)</th>
                <th>OBC (27%)</th>
                <th>SC (15%)</th>
                <th>ST (7.5%)</th>
                <th>Allotted</th>
                <th>Confirmed</th>
                <th>Vacant</th>
                <th>Occupancy %</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c) => {
                const fillRatio = Math.round((c.confirmedAdmissions / c.approvedIntake) * 100);
                const badgeColor =
                  fillRatio >= 95 ? '#059669' : fillRatio >= 85 ? '#0284c7' : fillRatio >= 75 ? '#d97706' : '#e11d48';

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '0.71rem', color: '#64748b' }}>
                        {c.code} · HOD: {c.hod} · {c.accreditation}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, textAlign: 'center' }}>{c.approvedIntake}</td>
                    <td style={{ textAlign: 'center', color: '#475569' }}>{c.reservations?.gen || Math.round(c.approvedIntake * 0.5)}</td>
                    <td style={{ textAlign: 'center', color: '#475569' }}>{c.reservations?.obc || Math.round(c.approvedIntake * 0.27)}</td>
                    <td style={{ textAlign: 'center', color: '#475569' }}>{c.reservations?.sc || Math.round(c.approvedIntake * 0.15)}</td>
                    <td style={{ textAlign: 'center', color: '#475569' }}>{c.reservations?.st || Math.round(c.approvedIntake * 0.075)}</td>
                    <td style={{ fontWeight: 700, color: '#7c3aed', textAlign: 'center' }}>{c.seatsAllotted}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>{c.confirmedAdmissions}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: c.vacantSeats > 0 ? '#fef3c7' : '#f1f5f9',
                          color: c.vacantSeats > 0 ? '#b45309' : '#64748b',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                        }}
                      >
                        {c.vacantSeats}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '7px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, fillRatio)}%`,
                              background: badgeColor,
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: badgeColor, minWidth: '34px' }}>
                          {fillRatio}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Course Comparison Chart */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <TrendingUp size={18} color="#7c3aed" /> Discipline-Wise Capacity vs. Confirmed Admissions
            </h3>
            <p className="adm-panel-desc">Visual comparison of intake capacity and confirmed student enrollment</p>
          </div>
        </div>
        <div className="adm-panel-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredCourses.map((c) => {
              const confirmedPct = Math.round((c.confirmedAdmissions / c.approvedIntake) * 100);
              const allottedDiffPct = Math.round(((c.seatsAllotted - c.confirmedAdmissions) / c.approvedIntake) * 100);
              const vacantPct = Math.round((c.vacantSeats / c.approvedIntake) * 100);

              return (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.name} ({c.code})</span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      <strong>{c.confirmedAdmissions} Confirmed</strong> · {c.seatsAllotted - c.confirmedAdmissions} Allotted in Review · <strong>{c.vacantSeats} Vacant</strong>
                    </span>
                  </div>
                  {/* Multi-segment stacked bar */}
                  <div style={{ height: '18px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                    <div
                      title={`Confirmed: ${c.confirmedAdmissions}`}
                      style={{ width: `${confirmedPct}%`, background: '#0284c7', height: '100%' }}
                    />
                    <div
                      title={`Allotted (Under Review): ${c.seatsAllotted - c.confirmedAdmissions}`}
                      style={{ width: `${allottedDiffPct}%`, background: '#7c3aed', height: '100%' }}
                    />
                    <div
                      title={`Vacant: ${c.vacantSeats}`}
                      style={{ width: `${vacantPct}%`, background: '#f59e0b', height: '100%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '0.75rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#0284c7', borderRadius: '3px' }} />
              <span>Confirmed Admissions (Fee Cleared)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#7c3aed', borderRadius: '3px' }} />
              <span>Seats Allotted (Acceptance Pending)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '3px' }} />
              <span>Remaining Institutional Vacancies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
