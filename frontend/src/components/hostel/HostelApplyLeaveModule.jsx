import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
  AlertCircle,
  HelpCircle,
  Send,
  Eye,
  Check,
  X,
  RotateCcw,
  Printer,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building2,
  User,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  getLeaveSummary,
  getAllStaffLeaves,
  applyStaffLeave,
  approveStaffLeave,
  rejectStaffLeave,
  resetStaffLeavesToDefaults
} from '../../services/hostelStaffLeaveStore.js';
import './HostelApplyLeaveModule.css';

export default function HostelApplyLeaveModule({ account, onNavigateLeaves }) {
  // Tabs: 'apply' | 'instructions' | 'approvals'
  const [activeTab, setActiveTab] = useState('apply');
  const [summary, setSummary] = useState(() => getLeaveSummary());
  const [leaves, setLeaves] = useState(() => getAllStaffLeaves());
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Pending Approval' | 'Approved by Hostel Admin' | 'Rejected by Hostel Admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedApplicationModal, setSelectedApplicationModal] = useState(null);

  // Approval modal state
  const [approvalModal, setApprovalModal] = useState(null); // { application, action: 'approve' | 'reject' }
  const [adminRemarksInput, setAdminRemarksInput] = useState('');

  // Apply Form State
  const defaultApplicantName = account?.name || 'Mr. Tanmaya Kumar Routray';
  const defaultEmployeeId = account?.employeeId || account?.id || 'EMP-HST-140';
  const defaultDesignation = account?.role === 'warden' ? 'Hostel Supervisor / Warden' : 'Hostel Resident Staff';

  const [applyForm, setApplyForm] = useState({
    applicantName: defaultApplicantName,
    employeeId: defaultEmployeeId,
    designation: defaultDesignation,
    department: 'Hostel Administration & Student Housing',
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    days: 2,
    session: 'Full Day',
    reason: '',
    alternativeArrangement: 'Assistant Warden / Block Caretaker will supervise roll-call and gate passes during absence.',
    stationLeaving: 'Yes',
    contactAddress: 'Residential Quarters / Native Place',
    contactPhone: account?.phone || '+91 78730 08197'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Re-calculate days when start or end date changes
  useEffect(() => {
    if (applyForm.startDate && applyForm.endDate) {
      const start = new Date(applyForm.startDate);
      const end = new Date(applyForm.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      setApplyForm(prev => ({ ...prev, days: isNaN(diffDays) ? 1 : diffDays }));
    }
  }, [applyForm.startDate, applyForm.endDate]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!applyForm.reason.trim()) {
      showToast('Please specify the Reason for Leave.');
      return;
    }
    if (!applyForm.startDate || !applyForm.endDate) {
      showToast('Please select valid From and To dates.');
      return;
    }

    const { newApplication, updatedLeaves, summary: newSummary } = applyStaffLeave(applyForm);
    setLeaves(updatedLeaves);
    setSummary(newSummary);
    showToast(`Leave application #${newApplication.id} submitted! Awaiting Hostel Admin approval.`);
    
    // Reset form reason
    setApplyForm(prev => ({
      ...prev,
      reason: ''
    }));

    // Switch to approvals tab to see the queued application
    setActiveTab('approvals');
  };

  const handleOpenApprovalModal = (app, action) => {
    setApprovalModal({ application: app, action });
    setAdminRemarksInput(
      action === 'approve'
        ? 'Sanctioned by Hostel Administration as per institutional admissibility guidelines.'
        : 'Application cannot be sanctioned due to institutional requirements / inadequate notice.'
    );
  };

  const handleConfirmApproval = () => {
    if (!approvalModal) return;
    const { application, action } = approvalModal;
    const approver = account?.name ? `${account.name} (Hostel Admin)` : 'Hostel Admin';

    if (action === 'approve') {
      const { updatedLeaves, summary: newSummary } = approveStaffLeave(application.id, adminRemarksInput, approver);
      setLeaves(updatedLeaves);
      setSummary(newSummary);
      showToast(`Leave application #${application.id} APPROVED by Hostel Admin! Balance updated.`);
    } else {
      const { updatedLeaves, summary: newSummary } = rejectStaffLeave(application.id, adminRemarksInput, approver);
      setLeaves(updatedLeaves);
      setSummary(newSummary);
      showToast(`Leave application #${application.id} REJECTED by Hostel Admin.`);
    }

    setApprovalModal(null);
    setAdminRemarksInput('');
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        l.id.toLowerCase().includes(q) ||
        l.applicantName.toLowerCase().includes(q) ||
        l.employeeId.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.leaveType.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [leaves, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'Pending Approval').length,
      approved: leaves.filter(l => l.status === 'Approved by Hostel Admin').length,
      rejected: leaves.filter(l => l.status === 'Rejected by Hostel Admin').length
    };
  }, [leaves]);

  return (
    <div className="hostel-apply-leave-wrapper">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="hal-toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="hal-hero-banner">
        <div className="hal-hero-left">
          <div className="hal-hero-tag">
            <Sparkles size={13} />
            <span>INSTITUTIONAL HUMAN RESOURCES &amp; RESIDENCE WELFARE</span>
          </div>
          <h1 className="hal-hero-title">Hostel Staff &amp; Warden Leave Management</h1>
          <p className="hal-hero-subtitle">
            Apply for leave, review entitlement balances, examine official institutional leave conditions, and process Hostel Admin sanctions.
          </p>
        </div>

        <div className="hal-hero-actions">
          {onNavigateLeaves && (
            <button
              type="button"
              className="hal-btn hal-btn-outline"
              onClick={onNavigateLeaves}
              title="Return to Student Resident Outstation Leaves"
            >
              <Calendar size={15} />
              <span>Resident Leaves</span>
            </button>
          )}
          <button
            type="button"
            className="hal-btn hal-btn-outline"
            onClick={() => {
              const res = resetStaffLeavesToDefaults();
              setLeaves(res.leaves);
              setSummary(res.summary);
              showToast('Leave records & balances reset to official defaults.');
            }}
            title="Reset leave records"
          >
            <RotateCcw size={15} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* 2nd Image: LEAVE SUMMARY OF 2025 - 2026 SESSION (Top Table) */}
      <section className="hal-summary-section" aria-label="Leave Balances Summary">
        <div className="hal-summary-header">
          <div className="hal-summary-header-left">
            <Calendar size={18} color="#0284c7" />
            <h3>Leave Summary of 2025 - 2026 Session</h3>
          </div>
          <span className="hal-session-pill">Session 2025–2026 · Active</span>
        </div>

        <div className="hal-summary-table-wrap">
          <table className="hal-summary-table">
            <thead>
              <tr>
                <th>Casual Leave</th>
                <th>Earned Leave</th>
                <th>Extra Ordinary Leave</th>
                <th>Sick Leave</th>
                <th>1/2 Day Leave</th>
                <th>Special Leave</th>
                <th>Duty Outside the Campus</th>
                <th>LWP</th>
                <th>1/2 OD</th>
                <th>Comp Leave</th>
                <th>Work Home</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong className="hal-bal-highlight">{summary.casualLeave}</strong></td>
                <td><strong>{summary.earnedLeave}</strong></td>
                <td><strong>{summary.extraOrdinaryLeave}</strong></td>
                <td><strong>{summary.sickLeave}</strong></td>
                <td><strong>{summary.halfDayLeave}</strong></td>
                <td><strong>{summary.specialLeave}</strong></td>
                <td><strong>{summary.dutyOutsideCampus}</strong></td>
                <td><span className="hal-zero-val">{summary.lwp}</span></td>
                <td><span className="hal-zero-val">{summary.halfOd}</span></td>
                <td><strong>{summary.compLeave}</strong></td>
                <td><strong>{summary.workHome}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Main Tab Switcher */}
      <div className="hal-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'apply'}
          className={`hal-tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          <CalendarCheck size={16} />
          <span>Apply for Leave</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'instructions'}
          className={`hal-tab-btn ${activeTab === 'instructions' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructions')}
        >
          <FileText size={16} />
          <span>Leave Rules &amp; Admissibility (Instructions)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'approvals'}
          className={`hal-tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <ShieldCheck size={16} />
          <span>Hostel Admin Approvals</span>
          {stats.pending > 0 && <span className="hal-pending-badge">{stats.pending}</span>}
        </button>
      </div>

      {/* ==============================================================
          TAB 1: APPLY FOR LEAVE FORM (With mandatory Reason & Handover)
          ============================================================== */}
      {activeTab === 'apply' && (
        <div className="hal-tab-content">
          <div className="hal-grid-2col">
            {/* Form Column */}
            <div className="hal-form-card">
              <div className="hal-card-head">
                <div>
                  <h3 className="hal-card-title">Leave Application Form</h3>
                  <p className="hal-card-subtitle">
                    Submit leave request with reason, dates, and work alternative arrangement for Hostel Admin sanction.
                  </p>
                </div>
                <span className="hal-rule-tag">Prior approval required (Min 2 days for CL)</span>
              </div>

              <form onSubmit={handleFormSubmit} className="hal-apply-form">
                {/* Applicant Info Row */}
                <div className="hal-form-row two-col">
                  <div className="hal-form-group">
                    <label>Applicant Name</label>
                    <input
                      type="text"
                      value={applyForm.applicantName}
                      onChange={e => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="hal-form-group">
                    <label>Employee / Officer ID</label>
                    <input
                      type="text"
                      value={applyForm.employeeId}
                      onChange={e => setApplyForm({ ...applyForm, employeeId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="hal-form-row two-col">
                  <div className="hal-form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      value={applyForm.designation}
                      onChange={e => setApplyForm({ ...applyForm, designation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="hal-form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={applyForm.department}
                      onChange={e => setApplyForm({ ...applyForm, department: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Leave Parameters */}
                <div className="hal-form-row three-col">
                  <div className="hal-form-group">
                    <label>Type of Leave</label>
                    <select
                      value={applyForm.leaveType}
                      onChange={e => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                    >
                      <option value="Casual Leave">Casual Leave (CL) — Bal: {summary.casualLeave}</option>
                      <option value="Earned Leave">Earned Leave (EL) — Bal: {summary.earnedLeave}</option>
                      <option value="Extra Ordinary Leave">Extra Ordinary Leave (EOL) — Bal: {summary.extraOrdinaryLeave}</option>
                      <option value="Sick Leave">Sick Leave (Half Pay) — Bal: {summary.sickLeave}</option>
                      <option value="1/2 Day Leave">1/2 Day Leave — Bal: {summary.halfDayLeave}</option>
                      <option value="Special Leave">Special Leave — Bal: {summary.specialLeave}</option>
                      <option value="Duty Outside the Campus">Duty Outside Campus (OD) — Bal: {summary.dutyOutsideCampus}</option>
                      <option value="Comp Leave">Compensatory Leave — Bal: {summary.compLeave}</option>
                      <option value="Work Home">Work From Home — Bal: {summary.workHome}</option>
                      <option value="LWP">Leave Without Pay (LWP)</option>
                      <option value="Maternity Leave">Maternity Leave (60 Days)</option>
                      <option value="Study leave">Study / Sabbatical Leave</option>
                    </select>
                  </div>

                  <div className="hal-form-group">
                    <label>Session</label>
                    <select
                      value={applyForm.session}
                      onChange={e => setApplyForm({ ...applyForm, session: e.target.value })}
                    >
                      <option value="Full Day">Full Day</option>
                      <option value="Forenoon (FN)">Forenoon (FN)</option>
                      <option value="Afternoon (AN)">Afternoon (AN)</option>
                    </select>
                  </div>

                  <div className="hal-form-group">
                    <label>Station Leaving?</label>
                    <select
                      value={applyForm.stationLeaving}
                      onChange={e => setApplyForm({ ...applyForm, stationLeaving: e.target.value })}
                    >
                      <option value="Yes">Yes (Leaving Campus/Town)</option>
                      <option value="No">No (Staying in Campus Quarters)</option>
                    </select>
                  </div>
                </div>

                {/* Dates & Day Count */}
                <div className="hal-form-row three-col">
                  <div className="hal-form-group">
                    <label>From Date</label>
                    <input
                      type="date"
                      value={applyForm.startDate}
                      onChange={e => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="hal-form-group">
                    <label>To Date</label>
                    <input
                      type="date"
                      value={applyForm.endDate}
                      onChange={e => setApplyForm({ ...applyForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="hal-form-group">
                    <label>Total Days</label>
                    <div className="hal-days-display">
                      <strong>{applyForm.days}</strong> Day(s)
                    </div>
                  </div>
                </div>

                {/* Reason for Leave (MANDATORY AS REQUESTED) */}
                <div className="hal-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="hal-required-label">Reason for Leave *</label>
                    <span className="hal-hint-text">Genuineness evaluated by sanctioning authority</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="State detailed reason for leave (e.g. Parental medical checkup, attending family ceremony, health rest, personal domestic exigency)..."
                    value={applyForm.reason}
                    onChange={e => setApplyForm({ ...applyForm, reason: e.target.value })}
                    required
                  />

                  {/* Quick Preset Buttons for Common Reasons */}
                  <div className="hal-quick-reasons">
                    <span className="hal-quick-title">Quick reasons:</span>
                    <button
                      type="button"
                      className="hal-quick-chip"
                      onClick={() => setApplyForm(prev => ({
                        ...prev,
                        reason: 'Family urgent domestic ceremony and parental health checkup at native village.'
                      }))}
                    >
                      Parental Health Checkup
                    </button>
                    <button
                      type="button"
                      className="hal-quick-chip"
                      onClick={() => setApplyForm(prev => ({
                        ...prev,
                        reason: 'Attending sibling marriage function as per Institutional Special Leave provisions.'
                      }))}
                    >
                      Family Wedding
                    </button>
                    <button
                      type="button"
                      className="hal-quick-chip"
                      onClick={() => setApplyForm(prev => ({
                        ...prev,
                        reason: 'Doctor prescribed rest and medical treatment for seasonal acute fever.'
                      }))}
                    >
                      Medical / Sick Rest
                    </button>
                    <button
                      type="button"
                      className="hal-quick-chip"
                      onClick={() => setApplyForm(prev => ({
                        ...prev,
                        reason: 'Urgent domestic property and legal documentation work requiring personal presence.'
                      }))}
                    >
                      Urgent Domestic Work
                    </button>
                  </div>
                </div>

                {/* Alternative Arrangement Proposal (REQUIRED BY RULE) */}
                <div className="hal-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Alternative Arrangement / Handover of Work</label>
                    <span className="hal-hint-text">Mandatory proposal as per Institutional guidelines</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Name of colleague / Caretaker managing hostel duties in your absence..."
                    value={applyForm.alternativeArrangement}
                    onChange={e => setApplyForm({ ...applyForm, alternativeArrangement: e.target.value })}
                    required
                  />
                </div>

                {/* Address & Emergency Phone */}
                <div className="hal-form-row two-col">
                  <div className="hal-form-group">
                    <label>Address during Leave</label>
                    <input
                      type="text"
                      placeholder="Destination postal address..."
                      value={applyForm.contactAddress}
                      onChange={e => setApplyForm({ ...applyForm, contactAddress: e.target.value })}
                    />
                  </div>
                  <div className="hal-form-group">
                    <label>Emergency Contact No.</label>
                    <input
                      type="text"
                      value={applyForm.contactPhone}
                      onChange={e => setApplyForm({ ...applyForm, contactPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Submit Row */}
                <div className="hal-form-footer">
                  <button
                    type="button"
                    className="hal-btn hal-btn-secondary"
                    onClick={() => setActiveTab('instructions')}
                  >
                    <HelpCircle size={15} />
                    <span>View Leave Rules</span>
                  </button>

                  <button type="submit" className="hal-btn hal-btn-primary">
                    <Send size={15} />
                    <span>Submit Leave for Hostel Admin Approval</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Guidance Sidebar */}
            <div className="hal-guide-col">
              <div className="hal-guide-card">
                <div className="hal-guide-header">
                  <Info size={18} color="#0284c7" />
                  <h4>Quick Instructions for Staff</h4>
                </div>
                <ul className="hal-guide-list">
                  <li>
                    <strong>Prior Approval Notice:</strong> Casual Leave (CL) must be applied at least <strong>2 days before</strong> the intended date of leave.
                  </li>
                  <li>
                    <strong>Competent Sanction Authority:</strong> Principal / Hostel Admin is the competent authority to sanction Casual Leave and Earned Leave.
                  </li>
                  <li>
                    <strong>Work Alternative:</strong> Proposals must state the alternative colleague who will take charge of residential attendance and student safety.
                  </li>
                  <li>
                    <strong>Sunday/Holidays:</strong> Sundays and public holidays availed in combination with CL shall not be counted towards the total leave days.
                  </li>
                  <li>
                    <strong>Unauthorized Absence:</strong> Any unauthorized leave is subjected to debit of <strong>1.5 CL</strong> or salary deduction.
                  </li>
                  <li>
                    <strong>Annual Lapse:</strong> All leave balances except Extra Ordinary Leave (EOL) lapse at the end of each academic year.
                  </li>
                </ul>

                <button
                  type="button"
                  className="hal-read-full-btn"
                  onClick={() => setActiveTab('instructions')}
                >
                  <span>Read Complete 13 General Conditions &amp; Admissibility</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Status Snapshot Card */}
              <div className="hal-guide-card">
                <div className="hal-guide-header">
                  <ShieldCheck size={18} color="#059669" />
                  <h4>Application Queue Overview</h4>
                </div>
                <div className="hal-queue-stats">
                  <div className="hal-queue-stat">
                    <span className="hal-q-val amber">{stats.pending}</span>
                    <span className="hal-q-lbl">Pending Sanction</span>
                  </div>
                  <div className="hal-queue-stat">
                    <span className="hal-q-val emerald">{stats.approved}</span>
                    <span className="hal-q-lbl">Approved by Admin</span>
                  </div>
                  <div className="hal-queue-stat">
                    <span className="hal-q-val rose">{stats.rejected}</span>
                    <span className="hal-q-lbl">Rejected</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="hal-btn hal-btn-outline"
                  style={{ width: '100%', marginTop: '0.85rem' }}
                  onClick={() => setActiveTab('approvals')}
                >
                  <Eye size={14} />
                  <span>Open Hostel Admin Sanction Console</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: LEAVE RULES & ADMISSIBILITY (FULL REPLICA OF IMAGES 2, 3, 4)
          ============================================================== */}
      {activeTab === 'instructions' && (
        <div className="hal-tab-content">
          <div className="hal-instructions-container">
            {/* 2nd Image Section: Admissibility of Leave */}
            <div className="hal-policy-block">
              <div className="hal-policy-title-row">
                <h3 className="hal-policy-title">Admissibility of Leave</h3>
              </div>
              <p className="hal-policy-subtext">
                The leave as indicated below is admissible to the staff of GIFT, subject to the sanction by the competent authority.
              </p>

              <div className="hal-table-wrap">
                <table className="hal-admissibility-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Sl No</th>
                      <th style={{ width: '220px' }}>Type of leave</th>
                      <th>Days / Year - Applicability</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>(i)</td>
                      <td><strong>Casual Leave</strong></td>
                      <td>15 days : All Staffs</td>
                    </tr>
                    <tr>
                      <td>(ii)</td>
                      <td><strong>Earned Leave</strong></td>
                      <td>10 days or Half of the Days of Summer Vacation, which ever is lower : All Staffs</td>
                    </tr>
                    <tr>
                      <td>(iii)</td>
                      <td><strong>Extra Ordinary Leave</strong></td>
                      <td>
                        <div><strong>Clause-i:</strong> 15 days : Staff who have completed at least continuous service of 7 years.</div>
                        <div style={{ marginTop: '4px' }}><strong>Clause-ii:</strong> 10 days : Staff who has completed at least 3 years of continuous service.</div>
                      </td>
                    </tr>
                    <tr>
                      <td>(iv)</td>
                      <td><strong>Special Leave</strong></td>
                      <td>10 days : Staff who have completed continuous service of 3 years.</td>
                    </tr>
                    <tr>
                      <td>(v)</td>
                      <td><strong>Sick (Half pay Leave)</strong></td>
                      <td>30 days : Staff who have completed at least continuous service of 7 years.</td>
                    </tr>
                    <tr>
                      <td>(vi)</td>
                      <td><strong>Maternity Leave</strong></td>
                      <td>60 days : Staff who have completed at least continuous service of 6 years.</td>
                    </tr>
                    <tr>
                      <td>(vii)</td>
                      <td><strong>Study leave</strong></td>
                      <td>1 year : Staff who have completed at least continuous service of 10 years.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="hal-policy-footer-note">
                <em>The balance of all kinds of leave except "Extra Ordinary Leave" shall lapse at the end of each year. The maximum balance of EOL shall be limited to 60 (sixty) days.</em>
              </div>
            </div>

            {/* 3rd Image: Authority Competent to Sanction Leave */}
            <div className="hal-policy-block">
              <h3 className="hal-policy-title">Authority Competent to Sanction Leave</h3>
              <p className="hal-authority-text">
                <strong>Principal</strong> is the competent authority to sanction <strong>Casual Leave</strong> and <strong>Earned Leave</strong>. <strong>Secretary</strong> is the competent authority for all other types of Leave, the recommendation of the principal along with the proposal of alternative arrangement for management of the works during the period of leave is necessary.
              </p>
            </div>

            {/* 3rd & 4th Images: General Conditions of Leave (All 13 clauses) */}
            <div className="hal-policy-block">
              <h3 className="hal-policy-title">General Conditions of Leave</h3>

              <div className="hal-clauses-list">
                {/* Clause (i) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(i)</span>
                  <div className="hal-clause-body">
                    The leave cannot be claimed as a matter of right. The sanctioning authority concerned may however consider the sanction of leave keeping the interest of the institution in view. Due weightage shall be given to the genuineness of the leave applied for.
                  </div>
                </div>

                {/* Clause (ii) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(ii)</span>
                  <div className="hal-clause-body">
                    The year means academic year i.e. <strong>1st Aug to 31st Jul</strong>. Officers/ officials joined in the middle of the year shall be entitled to leave proportionate to the period of employment during the calendar year.
                  </div>
                </div>

                {/* Clause (iii) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(iii)</span>
                  <div className="hal-clause-body">
                    Sundays &amp; public holidays availed in combination of CL shall not be counted for the purpose of arriving at the total amount of leave.
                  </div>
                </div>

                {/* Clause (iv) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(iv)</span>
                  <div className="hal-clause-body">
                    The CL is not to be treated as absence from duty.
                  </div>
                </div>

                {/* Clause (v) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(v)</span>
                  <div className="hal-clause-body">
                    <strong>Casual Leave shall be granted only:</strong>
                    <ol className="hal-subclause-list">
                      <li>CL can be availed with prior approval of the authority indicated above. The CL is to be applied at least <strong>2 days</strong> before the intended date of leave.</li>
                      <li>Ex-post-facto sanction of CL is permissible only twice in a semester. Such sanction must however be done within 2 working days from the date of joining duty after leave.</li>
                      <li>Noncompliance of the aforesaid process shall result in loss of pay for the period of absence.</li>
                      <li>Every unauthorized/unapproved leave is subjected to debit of <strong>1.5 CL</strong> or proportionate deduction of salary in lieu of CL.</li>
                      <li>Working in official holidays can be compensated as additional CL. For entitlement of such CL, applications with proper authentication and approval have to reach the HR within 2 working days.</li>
                    </ol>
                  </div>
                </div>

                {/* Clause (vi) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(vi)</span>
                  <div className="hal-clause-body">
                    No leave of any kind can be granted to the staff under suspension.
                  </div>
                </div>

                {/* Clause (vii) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(vii)</span>
                  <div className="hal-clause-body">
                    Earned Leave can only be granted to teachers during Summer Vacation, when there are no classes for the period and the teacher has no pending works related to teaching or non-teaching works. E.L. is to be applied at least before one week of requirement.
                  </div>
                </div>

                {/* Clause (viii) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(viii)</span>
                  <div className="hal-clause-body">
                    <strong>Extra Ordinary Leave shall be granted only:</strong>
                    <ol className="hal-subclause-list">
                      <li>Extra Ordinary Leave (Clause-i) shall be granted primarily for up gradation of teaching skill/higher studies/Refresher Course etc. provided there are no classes or teaching/non-teaching assignment in the intervening period. The pay for the period of E.O.L. shall be drawn only after 12 months of return from the said leave. Application for the E.O.L should be submitted at least before 15 days from the date of actual requirement.</li>
                      <li>Extra Ordinary Leave for maximum 10 Days in a Semester during the period when classes or teaching/non teaching assignment are continuing shall be granted for the faculty members who have been permitted by the Institution for perusing P.G. Programme provided they compensate the no. of hours of their absence from the Institution by taking extra classes / doubt clearance classes in off hours. Such daily extra effort shall not exceed 2 hours/day in working days and 7 hours in Holidays. 7 hours of extra classes is required to be taken to compensate each Day sanctioned as Extra Ordinary Leave.</li>
                    </ol>
                  </div>
                </div>

                {/* Clause (ix) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(ix)</span>
                  <div className="hal-clause-body">
                    <strong>Special leave shall to be granted only:</strong>
                    <ol className="hal-subclause-list">
                      <li>For attending obsequies of parents and spouse.</li>
                      <li>For Marriage of Self.</li>
                    </ol>
                  </div>
                </div>

                {/* Clause (x) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(x)</span>
                  <div className="hal-clause-body">
                    Sick leave/ Quarantine leave shall be granted if the person is not sound enough to undertake the work assigned to him or is required to be quarantined for more than 10 days at a time. He/ She shall be paid only half of the total pay due to him during the period of leave.
                  </div>
                </div>

                {/* Clause (xi) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(xi)</span>
                  <div className="hal-clause-body">
                    Maternity leave is to be allowed only in case of lady employees up to the second issue.
                  </div>
                </div>

                {/* Clause (xii) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(xii)</span>
                  <div className="hal-clause-body">
                    Study leave/Sabbatical/Academic leave is allowed to the staff, only if the intended study shall be gainfully used for the benefit of the organization &amp; for the object of increasing their proficiency and usefulness to the institution &amp; higher education system. The same shall only be allowed after the faculty swears by an undertaking (Duly registered by an appropriate authority), to the effect that he/she shall continue to serve in the organization for at least a period equal to 3 times of the actual leave taken. Only 1/3 rd of the pay due to the staff shall be disbursed during the course of the leave. Balance 2/3 rd of the pay shall be disbursed in two installments after completion of 1st and 2nd year from the date of return of such leave.
                  </div>
                </div>

                {/* Clause (xiii) */}
                <div className="hal-clause-item">
                  <span className="hal-clause-num">(xiii)</span>
                  <div className="hal-clause-body">
                    <strong style={{ color: '#dc2626' }}>
                      "Willful absence from duty after expiry of leave will be treated as misconduct leading to disciplinary action."
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="hal-btn hal-btn-primary"
                onClick={() => setActiveTab('apply')}
              >
                <CalendarCheck size={16} />
                <span>Proceed to Apply Leave Application</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: HOSTEL ADMIN APPROVALS & LEAVE APPLICATIONS
          ============================================================== */}
      {activeTab === 'approvals' && (
        <div className="hal-tab-content">
          <div className="hal-approvals-card">
            {/* Header Strip */}
            <div className="hal-approvals-header">
              <div>
                <h3 className="hal-card-title">Hostel Admin Sanction &amp; Applications Console</h3>
                <p className="hal-card-subtitle">
                  Review applicant details, evaluate reasons &amp; alternative arrangements, and grant or reject leave sanctions.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="hal-btn hal-btn-primary"
                  onClick={() => setActiveTab('apply')}
                >
                  <CalendarCheck size={14} />
                  <span>+ New Leave Application</span>
                </button>
              </div>
            </div>

            {/* Filter Strip */}
            <div className="hal-filter-strip">
              <div className="hal-search-box">
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search by ID, staff name, employee code, or reason..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="hal-status-pills">
                {['ALL', 'Pending Approval', 'Approved by Hostel Admin', 'Rejected by Hostel Admin'].map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`hal-status-pill ${statusFilter === s ? 'active' : ''}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === 'ALL' ? 'All Applications' : s.replace(' by Hostel Admin', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="hal-table-wrap">
              <table className="hal-leaves-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Staff / Warden</th>
                    <th>Leave Type &amp; Dates</th>
                    <th>Days</th>
                    <th style={{ minWidth: '220px' }}>Reason for Leave</th>
                    <th>Alternative Arrangement</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center', minWidth: '160px' }}>Hostel Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No leave applications match the selected status or query.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map(leave => {
                      const isPending = leave.status === 'Pending Approval';
                      const isApproved = leave.status === 'Approved by Hostel Admin';
                      const isRejected = leave.status === 'Rejected by Hostel Admin';

                      return (
                        <tr key={leave.id}>
                          <td>
                            <strong className="hal-id-code">{leave.id}</strong>
                            <div className="hal-date-sub">{leave.appliedOn}</div>
                          </td>

                          <td>
                            <div className="hal-applicant-name">{leave.applicantName}</div>
                            <div className="hal-emp-code">ID: {leave.employeeId}</div>
                            <div className="hal-dept-sub">{leave.designation}</div>
                          </td>

                          <td>
                            <div className="hal-leave-type-tag">{leave.leaveType}</div>
                            <div className="hal-date-range">
                              {leave.startDate} → {leave.endDate}
                            </div>
                            <span className="hal-session-sub">{leave.session}</span>
                          </td>

                          <td>
                            <strong className="hal-days-badge">{leave.days} d</strong>
                          </td>

                          {/* REASON FOR LEAVE (MANDATORY REQUIREMENT) */}
                          <td>
                            <div className="hal-reason-box" title={leave.reason}>
                              {leave.reason}
                            </div>
                            {leave.stationLeaving === 'Yes' && (
                              <div className="hal-station-tag">
                                ✈️ Station Leave · Contact: {leave.contactPhone}
                              </div>
                            )}
                          </td>

                          <td>
                            <div className="hal-handover-box" title={leave.alternativeArrangement}>
                              {leave.alternativeArrangement || 'Standard duties delegated'}
                            </div>
                          </td>

                          <td>
                            {isPending && (
                              <span className="hal-status-badge pending">
                                <Clock size={12} /> Pending Approval
                              </span>
                            )}
                            {isApproved && (
                              <div>
                                <span className="hal-status-badge approved">
                                  <CheckCircle2 size={12} /> Approved
                                </span>
                                <div className="hal-approver-sub">
                                  By: {leave.approvedBy || 'Hostel Admin'}
                                </div>
                              </div>
                            )}
                            {isRejected && (
                              <div>
                                <span className="hal-status-badge rejected">
                                  <XCircle size={12} /> Rejected
                                </span>
                                <div className="hal-approver-sub">
                                  {leave.adminRemarks || 'Rejected by Admin'}
                                </div>
                              </div>
                            )}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <div className="hal-action-btn-group">
                              <button
                                type="button"
                                className="hal-btn-action view"
                                title="View Dossier Slip"
                                onClick={() => setSelectedApplicationModal(leave)}
                              >
                                <Eye size={13} />
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    className="hal-btn-action approve"
                                    title="Approve Leave as Hostel Admin"
                                    onClick={() => handleOpenApprovalModal(leave, 'approve')}
                                  >
                                    <Check size={13} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="hal-btn-action reject"
                                    title="Reject Leave as Hostel Admin"
                                    onClick={() => handleOpenApprovalModal(leave, 'reject')}
                                  >
                                    <X size={13} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: HOSTEL ADMIN APPROVAL / REJECTION CONFIRMATION
          ============================================================== */}
      {approvalModal && (
        <div className="hal-modal-backdrop" onClick={() => setApprovalModal(null)}>
          <div className="hal-modal-card" onClick={e => e.stopPropagation()}>
            <div className={`hal-modal-head ${approvalModal.action}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {approvalModal.action === 'approve' ? (
                  <CheckCircle2 size={20} color="#059669" />
                ) : (
                  <XCircle size={20} color="#dc2626" />
                )}
                <h4>
                  {approvalModal.action === 'approve'
                    ? 'Hostel Admin — Sanction Leave Application'
                    : 'Hostel Admin — Reject Leave Application'}
                </h4>
              </div>
              <button
                type="button"
                className="hal-close-modal-btn"
                onClick={() => setApprovalModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="hal-modal-body">
              <div className="hal-modal-info-box">
                <div className="hal-minfo-row">
                  <span>Application ID:</span>
                  <strong>{approvalModal.application.id}</strong>
                </div>
                <div className="hal-minfo-row">
                  <span>Staff / Warden:</span>
                  <strong>{approvalModal.application.applicantName} ({approvalModal.application.employeeId})</strong>
                </div>
                <div className="hal-minfo-row">
                  <span>Leave Type:</span>
                  <strong>{approvalModal.application.leaveType} ({approvalModal.application.days} Days)</strong>
                </div>
                <div className="hal-minfo-row">
                  <span>Duration:</span>
                  <strong>{approvalModal.application.startDate} → {approvalModal.application.endDate}</strong>
                </div>
                <div className="hal-minfo-row">
                  <span>Reason for Leave:</span>
                  <p style={{ margin: '4px 0 0 0', color: '#0f172a', fontWeight: 600 }}>
                    {approvalModal.application.reason}
                  </p>
                </div>
                <div className="hal-minfo-row">
                  <span>Handover:</span>
                  <span>{approvalModal.application.alternativeArrangement}</span>
                </div>
              </div>

              <div className="hal-form-group" style={{ marginTop: '1rem' }}>
                <label>
                  {approvalModal.action === 'approve'
                    ? 'Sanction Remarks / Reference Order (Optional):'
                    : 'Reason for Rejection (Mandatory):'}
                </label>
                <textarea
                  rows={3}
                  value={adminRemarksInput}
                  onChange={e => setAdminRemarksInput(e.target.value)}
                  placeholder={
                    approvalModal.action === 'approve'
                      ? 'e.g. Sanctioned. Handover to Assistant Warden verified.'
                      : 'e.g. Leave cannot be granted due to semester inspection schedule.'
                  }
                  required
                />
              </div>

              {approvalModal.action === 'approve' && (
                <div className="hal-alert-info">
                  ℹ️ Approving will deduct <strong>{approvalModal.application.days} day(s)</strong> from the applicant's <strong>{approvalModal.application.leaveType}</strong> balance in the Leave Summary table.
                </div>
              )}
            </div>

            <div className="hal-modal-footer">
              <button
                type="button"
                className="hal-btn hal-btn-secondary"
                onClick={() => setApprovalModal(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`hal-btn ${approvalModal.action === 'approve' ? 'hal-btn-success' : 'hal-btn-danger'}`}
                onClick={handleConfirmApproval}
              >
                {approvalModal.action === 'approve' ? 'Confirm & Sanction Leave' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: VIEW FULL LEAVE APPLICATION DOSSIER
          ============================================================== */}
      {selectedApplicationModal && (
        <div className="hal-modal-backdrop" onClick={() => setSelectedApplicationModal(null)}>
          <div className="hal-modal-card large" onClick={e => e.stopPropagation()}>
            <div className="hal-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#0284c7" />
                <h4>Official Leave Application Dossier — {selectedApplicationModal.id}</h4>
              </div>
              <button
                type="button"
                className="hal-close-modal-btn"
                onClick={() => setSelectedApplicationModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="hal-modal-body print-area">
              <div className="hal-letterhead">
                <h3>APNA CAMPUS · GANDHI INSTITUTE FOR TECHNOLOGY (GIFT)</h3>
                <p>Office of the Hostel Administration &amp; Residential Welfare</p>
                <small>Autonomous Institution · BPUT Regulated · Session 2025–2026</small>
              </div>

              <div className="hal-dossier-grid">
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Application ID</span>
                  <span className="hal-dval">{selectedApplicationModal.id}</span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Submission Date</span>
                  <span className="hal-dval">{selectedApplicationModal.appliedOn}</span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Applicant Name</span>
                  <span className="hal-dval">{selectedApplicationModal.applicantName}</span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Employee Code</span>
                  <span className="hal-dval">{selectedApplicationModal.employeeId}</span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Designation</span>
                  <span className="hal-dval">{selectedApplicationModal.designation}</span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Department</span>
                  <span className="hal-dval">{selectedApplicationModal.department}</span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Leave Type</span>
                  <span className="hal-dval" style={{ color: '#0284c7', fontWeight: 700 }}>
                    {selectedApplicationModal.leaveType}
                  </span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Total Days Requested</span>
                  <span className="hal-dval">{selectedApplicationModal.days} Day(s)</span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Leave Span</span>
                  <span className="hal-dval">
                    {selectedApplicationModal.startDate} to {selectedApplicationModal.endDate} ({selectedApplicationModal.session})
                  </span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Station Leaving Permission</span>
                  <span className="hal-dval">{selectedApplicationModal.stationLeaving}</span>
                </div>
                <div className="hal-dossier-item full">
                  <span className="hal-dlabel">Reason for Leave</span>
                  <p className="hal-dval-box">{selectedApplicationModal.reason}</p>
                </div>
                <div className="hal-dossier-item full">
                  <span className="hal-dlabel">Alternative Work Handover Arrangement</span>
                  <p className="hal-dval-box">{selectedApplicationModal.alternativeArrangement}</p>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Contact during Absence</span>
                  <span className="hal-dval">{selectedApplicationModal.contactPhone}</span>
                </div>
                <div className="hal-dossier-item">
                  <span className="hal-dlabel">Address during Leave</span>
                  <span className="hal-dval">{selectedApplicationModal.contactAddress}</span>
                </div>
                <div className="hal-dossier-item full">
                  <span className="hal-dlabel">Hostel Admin Sanction Status</span>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`hal-status-badge ${
                      selectedApplicationModal.status.includes('Approved')
                        ? 'approved'
                        : selectedApplicationModal.status.includes('Rejected')
                        ? 'rejected'
                        : 'pending'
                    }`}>
                      {selectedApplicationModal.status}
                    </span>
                    {selectedApplicationModal.approvedBy && (
                      <span style={{ fontSize: '0.8rem', marginLeft: '10px', color: '#475569' }}>
                        Sanctioned by <strong>{selectedApplicationModal.approvedBy}</strong> on {selectedApplicationModal.approvedAt}
                      </span>
                    )}
                    {selectedApplicationModal.adminRemarks && (
                      <div style={{ fontSize: '0.82rem', marginTop: '6px', color: '#334155', fontStyle: 'italic' }}>
                        Remarks: "{selectedApplicationModal.adminRemarks}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="hal-modal-footer">
              <button
                type="button"
                className="hal-btn hal-btn-outline"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Dossier</span>
              </button>
              <button
                type="button"
                className="hal-btn hal-btn-secondary"
                onClick={() => setSelectedApplicationModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
