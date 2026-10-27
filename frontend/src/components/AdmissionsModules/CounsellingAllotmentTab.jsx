import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Award,
  Filter,
  Search,
  Check,
  X,
  Building2,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function CounsellingAllotmentTab({
  counsellingSchedules = [],
  applicants = [],
  courses = [],
  onAddSchedule,
  onAllotSeat,
  onUpdateApplicant,
}) {
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' or 'schedules'
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Allotment Modal State
  const [allotModalState, setAllotModalState] = useState({
    isOpen: false,
    applicant: null,
    selectedCourseCode: '',
    selectedSlot: 'Round 2 - Morning Slot',
  });

  // Create Schedule Modal State
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    round: 'Round 2',
    date: '2026-10-28',
    timeSlot: '10:00 AM – 01:00 PM',
    venue: 'Counselling Wing · Seminar Hall 1',
    courseTarget: 'B.Tech Core Branches',
    intakeTarget: 'General & Quota Seats',
    assignedStaff: 'Ms. Sasmita Mohapatra',
    allocatedCount: 30,
    status: 'Scheduled',
    reportingNotice: 'Carry original 10th/12th marksheets and token fee DD.',
  });

  // Filter candidates eligible for counselling or already allotted
  const candidateQueue = applicants.filter((app) => {
    if (selectedCourseFilter !== 'All' && app.courseCode !== selectedCourseFilter && app.appliedCourse !== selectedCourseFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.name?.toLowerCase().includes(q) ||
        app.applicationNo?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAllotModal = (applicant) => {
    setAllotModalState({
      isOpen: true,
      applicant,
      selectedCourseCode: applicant.courseCode || courses[0]?.code || 'BTECH-CSE',
      selectedSlot: 'Round 2 - Morning Slot (10:00 AM)',
    });
  };

  const handleConfirmAllotment = (e) => {
    e.preventDefault();
    if (!allotModalState.applicant) return;

    // Check course capacity
    const targetCourse = courses.find((c) => c.code === allotModalState.selectedCourseCode);
    if (targetCourse && targetCourse.seatsAllotted >= targetCourse.approvedIntake) {
      alert(`Cannot allot seat! Approved intake limit reached (${targetCourse.seatsAllotted}/${targetCourse.approvedIntake} filled) for ${targetCourse.name}.`);
      return;
    }

    const res = onAllotSeat && onAllotSeat(allotModalState.applicant.id, allotModalState.selectedCourseCode, {
      round: 'Round 2',
      reportingDeadline: '04 Nov 2026',
    });

    if (res && res.message) {
      alert(res.message);
    }

    setAllotModalState({ isOpen: false, applicant: null, selectedCourseCode: '', selectedSlot: '' });
  };

  const handleUpdateAcceptance = (appId, newStatus) => {
    const app = applicants.find((a) => a.id === appId);
    if (!app) return;
    const currentSlot = app.counsellingSlot || {};
    onUpdateApplicant &&
      onUpdateApplicant(appId, {
        counsellingSlot: { ...currentSlot, candidateAcceptance: newStatus },
        admissionStatus: newStatus === 'Accepted' ? 'Offer Accepted' : newStatus === 'Declined' ? 'Rejected' : app.admissionStatus,
      });
  };

  const handleCreateScheduleSubmit = (e) => {
    e.preventDefault();
    onAddSchedule && onAddSchedule(newSchedule);
    setIsCreateScheduleOpen(false);
  };

  return (
    <div>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Counselling &amp; Seat Allotment Desk
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Manage in-person &amp; virtual counselling schedules, assign reporting slots, review candidate course choices, and allot seats against approved intake capacity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => setIsCreateScheduleOpen(true)}
          >
            <Plus size={15} /> Create Counselling Schedule
          </button>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('candidates')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'candidates' ? '#0284c7' : '#ffffff',
            color: activeTab === 'candidates' ? '#ffffff' : '#475569',
            border: activeTab === 'candidates' ? 'none' : '1px solid #cbd5e1',
          }}
        >
          Candidate Seat Allotment Roster
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'schedules' ? '#0284c7' : '#ffffff',
            color: activeTab === 'schedules' ? '#ffffff' : '#475569',
            border: activeTab === 'schedules' ? 'none' : '1px solid #cbd5e1',
          }}
        >
          Counselling Sessions &amp; Time Slots ({counsellingSchedules.length})
        </button>
      </div>

      {/* VIEW 1: CANDIDATES ROSTER */}
      {activeTab === 'candidates' && (
        <div>
          {/* Filter Bar */}
          <div className="adm-filter-bar">
            <div className="adm-search-input-wrap">
              <Search size={16} className="adm-search-icon" />
              <input
                type="text"
                className="adm-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate by name or application number..."
              />
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
            </div>
          </div>

          {/* Table */}
          <div className="adm-panel-box">
            <div className="adm-panel-header">
              <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                Candidate Allotment &amp; Acceptance Status ({candidateQueue.length} Applicants)
              </span>
            </div>

            <div className="adm-table-wrap">
              <table className="adm-data-table">
                <thead>
                  <tr>
                    <th>Applicant ID &amp; Name</th>
                    <th>Preferred / Allotted Course</th>
                    <th>Merit Rank</th>
                    <th>Counselling Slot</th>
                    <th>Allotment Status</th>
                    <th>Candidate Acceptance</th>
                    <th>Reporting Deadline</th>
                    <th style={{ textAlign: 'right' }}>Allotment Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateQueue.map((app) => {
                    const slot = app.counsellingSlot;
                    const isAllotted = slot?.allotmentStatus === 'Allotted' || app.admissionStatus === 'Selected' || app.admissionStatus === 'Offer Accepted' || app.admissionStatus === 'Enrolled';

                    return (
                      <tr key={app.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.name}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#0284c7' }}>
                            {app.applicationNo} · {app.category}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{app.appliedCourse}</div>
                          <div style={{ fontSize: '0.71rem', color: '#64748b' }}>
                            Choice 1: {app.coursePreferences?.[0]?.course || app.appliedCourse}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {app.entranceRank ? `${app.entranceExam?.split(' ')[0] || 'Rank'} #${app.entranceRank}` : '10+2 Merit'}
                          </div>
                          <div style={{ fontSize: '0.71rem', color: '#64748b' }}>
                            12th: {app.twelfthMarks}%
                          </div>
                        </td>
                        <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                          {slot?.venue ? `${slot.date} (${slot.time})` : 'Not Scheduled'}
                        </td>
                        <td>
                          <span
                            className={`adm-status-tag ${
                              isAllotted ? 'selected' : 'under_review'
                            }`}
                          >
                            {isAllotted ? 'Seat Allotted' : 'Pending Allotment'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background:
                                  slot?.candidateAcceptance === 'Accepted'
                                    ? '#ecfdf5'
                                    : slot?.candidateAcceptance === 'Declined'
                                    ? '#fef2f2'
                                    : '#fef3c7',
                                color:
                                  slot?.candidateAcceptance === 'Accepted'
                                    ? '#047857'
                                    : slot?.candidateAcceptance === 'Declined'
                                    ? '#b91c1c'
                                    : '#b45309',
                              }}
                            >
                              {slot?.candidateAcceptance || 'Pending Response'}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.74rem', color: '#475569' }}>
                          {slot?.reportingDeadline || '29 Oct 2026'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {/* Allot Seat Button */}
                            <button
                              type="button"
                              className="adm-btn-primary"
                              onClick={() => handleOpenAllotModal(app)}
                              style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                            >
                              <Award size={13} /> {isAllotted ? 'Change Seat' : 'Allot Seat'}
                            </button>

                            {/* Mark Accepted */}
                            {isAllotted && slot?.candidateAcceptance !== 'Accepted' && (
                              <button
                                type="button"
                                className="adm-btn-success"
                                onClick={() => handleUpdateAcceptance(app.id, 'Accepted')}
                                style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                              >
                                Accept
                              </button>
                            )}

                            {/* Mark Declined */}
                            {isAllotted && slot?.candidateAcceptance !== 'Declined' && (
                              <button
                                type="button"
                                className="adm-btn-danger"
                                onClick={() => handleUpdateAcceptance(app.id, 'Declined')}
                                style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                              >
                                Decline
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
        </div>
      )}

      {/* VIEW 2: COUNSELLING SCHEDULES & SLOTS */}
      {activeTab === 'schedules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          {counsellingSchedules.map((cs) => (
            <div key={cs.id} className="adm-panel-box" style={{ margin: 0 }}>
              <div className="adm-panel-header" style={{ padding: '14px 18px', background: '#f8fafc' }}>
                <div>
                  <span className="adm-badge-pill dark">{cs.round} · {cs.date}</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    {cs.venue}
                  </h3>
                </div>
                <span className="adm-badge-pill green">{cs.status}</span>
              </div>

              <div className="adm-panel-body" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>
                  <Clock size={16} /> Timing: {cs.timeSlot}
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Target Disciplines</span>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', marginTop: '2px', color: '#0f172a' }}>
                    {cs.courseTarget}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Target Cohort: {cs.intakeTarget} · Capacity: {cs.allocatedCount} Candidates
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  <strong>Assigned Panel:</strong> {cs.assignedStaff}
                </div>

                <div style={{ fontSize: '0.74rem', color: '#334155', background: '#fffbeb', padding: '8px 10px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                  <strong>Reporting Notice:</strong> {cs.reportingNotice}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ALLOT SEAT CONFIRMATION MODAL */}
      {allotModalState.isOpen && (
        <div className="adm-modal-backdrop" onClick={() => setAllotModalState({ ...allotModalState, isOpen: false })}>
          <div className="adm-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: '#f0f9ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={22} color="#0284c7" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    Execute Seat Allotment · {allotModalState.applicant?.name}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    {allotModalState.applicant?.applicationNo} · Rank: {allotModalState.applicant?.entranceRank || 'Merit'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllotModalState({ ...allotModalState, isOpen: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmAllotment}>
              <div className="adm-modal-body">
                {/* Notice on capacity constraint */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>Applicant Preferences:</span>
                  <div style={{ fontSize: '0.8rem', color: '#0f172a', marginTop: '4px' }}>
                    1st Choice: <strong>{allotModalState.applicant?.appliedCourse}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Allocate Seat in Program *
                  </label>
                  <select
                    className="adm-select-control"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                    value={allotModalState.selectedCourseCode}
                    onChange={(e) => setAllotModalState({ ...allotModalState, selectedCourseCode: e.target.value })}
                  >
                    {courses.map((c) => {
                      const isFull = c.seatsAllotted >= c.approvedIntake;
                      return (
                        <option key={c.id} value={c.code} disabled={isFull}>
                          {c.code} - {c.name} ({c.confirmedAdmissions}/{c.approvedIntake} Confirmed · {c.vacantSeats} Vacant) {isFull ? '— [CAPACITY FULL]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Assigned Counselling Reporting Slot
                  </label>
                  <select
                    className="adm-select-control"
                    style={{ width: '100%' }}
                    value={allotModalState.selectedSlot}
                    onChange={(e) => setAllotModalState({ ...allotModalState, selectedSlot: e.target.value })}
                  >
                    <option value="Round 2 - Morning Slot">Round 2 - Morning Slot (27 Oct · 10:00 AM)</option>
                    <option value="Round 2 - Afternoon Slot">Round 2 - Afternoon Slot (28 Oct · 02:00 PM)</option>
                    <option value="Spot Round Counseling">Spot Round - Open House (08 Nov · 09:30 AM)</option>
                  </select>
                </div>

                <div style={{ background: '#fef3c7', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.74rem', color: '#92400e' }}>
                  <strong>Hard Capacity Constraint:</strong> Total allotted seats cannot exceed the regulatory intake approved by AICTE and BPUT.
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setAllotModalState({ ...allotModalState, isOpen: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Confirm Allotment &amp; Issue Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUNSELLING SCHEDULE MODAL */}
      {isCreateScheduleOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsCreateScheduleOpen(false)}>
          <div className="adm-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Schedule New Counselling Session
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateScheduleOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateScheduleSubmit}>
              <div className="adm-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Admission Round *
                    </label>
                    <select
                      className="adm-select-control"
                      style={{ width: '100%' }}
                      value={newSchedule.round}
                      onChange={(e) => setNewSchedule({ ...newSchedule, round: e.target.value })}
                    >
                      <option value="Round 2">Round 2</option>
                      <option value="Round 3">Round 3</option>
                      <option value="Spot Round">Spot Round</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={newSchedule.date}
                      onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Time Slot *
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={newSchedule.timeSlot}
                      onChange={(e) => setNewSchedule({ ...newSchedule, timeSlot: e.target.value })}
                      placeholder="e.g. 10:00 AM – 01:00 PM"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Venue *
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={newSchedule.venue}
                      onChange={(e) => setNewSchedule({ ...newSchedule, venue: e.target.value })}
                      placeholder="e.g. Counselling Hall 1"
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                    Target Disciplines *
                  </label>
                  <input
                    type="text"
                    className="adm-search-input"
                    style={{ paddingLeft: '12px' }}
                    value={newSchedule.courseTarget}
                    onChange={(e) => setNewSchedule({ ...newSchedule, courseTarget: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsCreateScheduleOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
