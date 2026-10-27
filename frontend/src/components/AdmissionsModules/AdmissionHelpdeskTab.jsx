import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  Filter,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Send,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function AdmissionHelpdeskTab({
  tickets = [],
  staff = [],
  onAddTicketReply,
  onUpdateTicketStatus,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);

  const [replyInput, setReplyInput] = useState('');
  const [resolutionRemarksInput, setResolutionRemarksInput] = useState('');
  const [assignedStaffInput, setAssignedStaffInput] = useState('');

  const currentTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const filteredTickets = tickets.filter((t) => {
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.ticketNo?.toLowerCase().includes(q) ||
        t.applicantName?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.applicantId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !currentTicket) return;
    onAddTicketReply &&
      onAddTicketReply(currentTicket.id, replyInput.trim(), 'Ms. Sasmita Mohapatra (Admission Head)');
    setReplyInput('');
  };

  const handleResolveTicket = () => {
    if (!currentTicket) return;
    const remark = prompt('Enter official resolution summary remarks:', 'Query resolved by Admissions Directorate.') || 'Resolved';
    onUpdateTicketStatus && onUpdateTicketStatus(currentTicket.id, 'Resolved', remark);
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Admission Helpdesk &amp; Candidate Grievance Redressal
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Prospective student inquiries, document upload issues, fee verification clarifications, and seat matrix assistance.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card blue">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Total Inquiries</span>
            <div className="adm-kpi-icon-wrap"><HelpCircle size={16} color="#0284c7" /></div>
          </div>
          <div className="adm-kpi-value">{tickets.length}</div>
          <div className="adm-kpi-foot">Logged during Session 2026-27</div>
        </div>

        <div className="adm-kpi-card amber">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Active / Open</span>
            <div className="adm-kpi-icon-wrap"><Clock size={16} color="#d97706" /></div>
          </div>
          <div className="adm-kpi-value">
            {tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length}
          </div>
          <div className="adm-kpi-foot" style={{ color: '#d97706', fontWeight: 600 }}>
            Under staff investigation
          </div>
        </div>

        <div className="adm-kpi-card green">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Resolved</span>
            <div className="adm-kpi-icon-wrap"><CheckCircle2 size={16} color="#059669" /></div>
          </div>
          <div className="adm-kpi-value">
            {tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length}
          </div>
          <div className="adm-kpi-foot">Resolution confirmed</div>
        </div>

        <div className="adm-kpi-card rose">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Urgent Priority</span>
            <div className="adm-kpi-icon-wrap"><AlertTriangle size={16} color="#e11d48" /></div>
          </div>
          <div className="adm-kpi-value">
            {tickets.filter((t) => t.priority === 'Urgent').length}
          </div>
          <div className="adm-kpi-foot" style={{ color: '#e11d48' }}>
            Requires immediate response
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="adm-filter-bar">
        <div className="adm-search-input-wrap">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            className="adm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket number, candidate name, or subject..."
          />
        </div>

        <div className="adm-filter-group">
          <select
            className="adm-select-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Document Upload & Resubmission">Document Upload</option>
            <option value="Fee Payment & Receipt">Fee Payment</option>
            <option value="EWS Certificate Validity">Eligibility &amp; Certificates</option>
            <option value="Seat Matrix & Vacancy">Seat Matrix</option>
            <option value="Hostel Allotment & Accommodation">Hostel &amp; Facilities</option>
          </select>

          <select
            className="adm-select-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="adm-select-control"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: Ticket Master List & Active Ticket Resolution Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Ticket List */}
        <div className="adm-panel-box" style={{ margin: 0 }}>
          <div className="adm-panel-header" style={{ padding: '12px 16px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
              Inquiry Queue ({filteredTickets.length})
            </span>
          </div>

          <div style={{ maxHeight: '640px', overflowY: 'auto' }}>
            {filteredTickets.map((t) => {
              const isSelected = t.id === currentTicket?.id;
              const isResolved = t.status === 'Resolved';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.74rem', color: '#0284c7' }}>
                      {t.ticketNo}
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isResolved ? '#ecfdf5' : '#fef3c7',
                        color: isResolved ? '#047857' : '#b45309',
                      }}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', marginTop: '4px' }}>
                    {t.subject}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    {t.applicantName} ({t.applicantId})
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.68rem', color: '#94a3b8' }}>
                    <span>{t.category}</span>
                    <span style={{ color: t.priority === 'Urgent' ? '#e11d48' : '#64748b', fontWeight: 600 }}>
                      {t.priority} Priority
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Ticket Detail & Thread */}
        {currentTicket ? (
          <div className="adm-panel-box" style={{ margin: 0 }}>
            <div className="adm-panel-header" style={{ background: '#f8fafc' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="adm-badge-pill dark">{currentTicket.ticketNo}</span>
                  <span
                    className={`adm-status-tag ${
                      currentTicket.status === 'Resolved' ? 'verified' : 'under_review'
                    }`}
                  >
                    {currentTicket.status}
                  </span>
                  <span className="adm-badge-pill dark">Assigned: {currentTicket.assignedStaff}</span>
                </div>
                <h3 style={{ margin: '6px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentTicket.subject}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Candidate: <strong>{currentTicket.applicantName}</strong> ({currentTicket.applicantId}) · Submitted: {currentTicket.submissionDate}
                </p>
              </div>

              {currentTicket.status !== 'Resolved' && (
                <button
                  type="button"
                  className="adm-btn-success"
                  onClick={handleResolveTicket}
                >
                  <CheckCircle2 size={14} /> Mark as Resolved
                </button>
              )}
            </div>

            <div className="adm-panel-body" style={{ padding: '20px' }}>
              {/* Resolution Summary Banner */}
              {currentTicket.resolutionRemarks && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.8rem', color: '#166534' }}>
                  <strong>Official Resolution Summary:</strong> {currentTicket.resolutionRemarks}
                </div>
              )}

              {/* Conversation History Thread */}
              <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', fontWeight: 700 }}>
                Inquiry &amp; Response Thread
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '320px', overflowY: 'auto' }}>
                {(currentTicket.conversation || []).map((msg, i) => {
                  const isStaff = msg.sender.includes('Admission') || msg.sender.includes('Officer') || msg.sender.includes('Er.') || msg.sender.includes('Ms.');
                  return (
                    <div
                      key={i}
                      style={{
                        background: isStaff ? '#eff6ff' : '#f8fafc',
                        border: isStaff ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px',
                        maxWidth: '85%',
                        alignSelf: isStaff ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: isStaff ? '#0284c7' : '#334155' }}>{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#0f172a', lineHeight: '1.5' }}>
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                  Post Official Helpdesk Reply
                </label>
                <textarea
                  rows={3}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type official response to candidate..."
                  className="adm-search-input"
                  style={{ padding: '10px', resize: 'vertical' }}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="adm-btn-primary">
                    <Send size={14} /> Send Reply to Candidate
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
