import React, { useState } from 'react';
import {
  Megaphone,
  Mail,
  Send,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Building2,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { COMMUNICATION_TEMPLATES } from './admissionsData.js';

export default function ApplicantCommunicationTab({
  communicationLogs = [],
  courses = [],
  onSendCommunication,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(COMMUNICATION_TEMPLATES[0].id);
  const [recipientGroup, setRecipientGroup] = useState('All Applicants');
  const [targetCourse, setTargetCourse] = useState('All');
  const [targetRound, setTargetRound] = useState('Round 2');
  const [channel, setChannel] = useState('Email & SMS');
  const [customSubject, setCustomSubject] = useState(COMMUNICATION_TEMPLATES[0].subject);
  const [customBody, setCustomBody] = useState(COMMUNICATION_TEMPLATES[0].body);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const currentTemplate = COMMUNICATION_TEMPLATES.find((t) => t.id === selectedTemplateId) || COMMUNICATION_TEMPLATES[0];

  const handleTemplateSelect = (templateId) => {
    const tmpl = COMMUNICATION_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    setSelectedTemplateId(templateId);
    setCustomSubject(tmpl.subject);
    setCustomBody(tmpl.body);
    setChannel(tmpl.channel);
  };

  // Interpolated Preview Text
  const getInterpolatedText = (text) => {
    return text
      .replace(/{ApplicantName}/g, 'Tanmayee Rout')
      .replace(/{ApplicationNo}/g, 'APP-2026-1001')
      .replace(/{Course}/g, targetCourse !== 'All' ? targetCourse : 'B.Tech Computer Science & Engineering')
      .replace(/{EntranceRank}/g, 'OJEE 1,840')
      .replace(/{MissingDocInfo}/g, 'Class 12 Marksheet clear scan')
      .replace(/{Deadline}/g, '28 Oct 2026, 05:00 PM')
      .replace(/{CounsellingSlot}/g, '27 Oct 2026 at 10:00 AM (Seminar Hall 1)')
      .replace(/{ReportingDeadline}/g, '04 Nov 2026')
      .replace(/{FeeAmount}/g, '1,15,000')
      .replace(/{RollNo}/g, '26CSE015');
  };

  const handleSendBroadcast = (isDraft = false) => {
    const log = {
      templateName: currentTemplate.name,
      recipientGroup: `${recipientGroup} (${targetCourse !== 'All' ? targetCourse : 'All Courses'})`,
      recipientCount: recipientGroup === 'All Applicants' ? 1420 : recipientGroup === 'Selected Candidates' ? 685 : 45,
      channel,
      status: isDraft ? 'Draft Saved' : 'Sent (100% Simulated Delivery)',
    };

    onSendCommunication && onSendCommunication(log);
    setToastMsg(isDraft ? 'Message saved as official draft!' : 'Simulated notification broadcast dispatched successfully!');
    setTimeout(() => setToastMsg(''), 4000);
    setIsPreviewOpen(false);
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Applicant Notification &amp; Multi-Channel Communication Console
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Broadcast admission announcements, document deficiency alerts, counselling invites, selection dockets, and fee reminders.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}

      {/* Two Column Layout: Template Composer & Delivery History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '22px', alignItems: 'start' }}>
        {/* Left Column: Composer */}
        <div className="adm-panel-box" style={{ margin: 0 }}>
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <Megaphone size={18} color="#0284c7" /> Institutional Message Composer
              </h3>
              <p className="adm-panel-desc">Select an approved institutional template or customize circular copy</p>
            </div>
            <span className="adm-badge-pill dark">Frontend Simulation Sandbox</span>
          </div>

          <div className="adm-panel-body" style={{ padding: '20px' }}>
            {/* Template Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                Pre-Approved Institutional Templates *
              </label>
              <select
                className="adm-select-control"
                style={{ width: '100%', fontSize: '0.84rem' }}
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                {COMMUNICATION_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    [{tmpl.category}] {tmpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Group & Channel Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                  Target Recipient Group *
                </label>
                <select
                  className="adm-select-control"
                  style={{ width: '100%' }}
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                >
                  <option value="All Applicants">All Registered Applicants (1,420)</option>
                  <option value="Selected Candidates">Shortlisted &amp; Allotted Candidates (685)</option>
                  <option value="Applicants with Deficient Docs">Deficient / Pending Documents (29)</option>
                  <option value="Fee Pending Candidates">Fee Clearance Pending (45)</option>
                  <option value="Waitlisted Candidates">Waitlisted Pool (Round 2)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                  Course Filter
                </label>
                <select
                  className="adm-select-control"
                  style={{ width: '100%' }}
                  value={targetCourse}
                  onChange={(e) => setTargetCourse(e.target.value)}
                >
                  <option value="All">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                  Delivery Channel
                </label>
                <select
                  className="adm-select-control"
                  style={{ width: '100%' }}
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="Email & SMS">Email &amp; SMS Broadcast</option>
                  <option value="Student Portal Push">Student Portal Notification</option>
                  <option value="SMS Alert Only">SMS Emergency Alert</option>
                  <option value="WhatsApp & Email">WhatsApp &amp; Email Dispatch</option>
                </select>
              </div>
            </div>

            {/* Message Subject */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                Subject Line *
              </label>
              <input
                type="text"
                className="adm-search-input"
                style={{ paddingLeft: '12px' }}
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                required
              />
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                  Message Content &amp; Template Interpolation Variables *
                </label>
                <span style={{ fontSize: '0.72rem', color: '#0284c7' }}>
                  Variables: &#123;ApplicantName&#125;, &#123;ApplicationNo&#125;, &#123;Course&#125;, &#123;Deadline&#125;
                </span>
              </div>
              <textarea
                rows={7}
                className="adm-search-input"
                style={{ padding: '12px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                required
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => handleSendBroadcast(true)}
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye size={14} /> Preview Live Rendering
              </button>
              <button
                type="button"
                className="adm-btn-primary"
                onClick={() => handleSendBroadcast(false)}
              >
                <Send size={14} /> Send Broadcast (Simulated)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Broadcast History */}
        <div className="adm-panel-box" style={{ margin: 0 }}>
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <Clock size={16} color="#059669" /> Delivery Audit Trail
              </h3>
              <p className="adm-panel-desc">Simulated dispatch log</p>
            </div>
          </div>

          <div className="adm-panel-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {communicationLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                      {log.templateName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: log.status.includes('Draft') ? '#fef3c7' : '#ecfdf5',
                        color: log.status.includes('Draft') ? '#b45309' : '#047857',
                      }}
                    >
                      {log.status.includes('Draft') ? 'Draft' : 'Sent'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                    Target: <strong>{log.recipientGroup}</strong> ({log.recipientCount} Recipients)
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
                    <span>Via: {log.channel}</span>
                    <span>{log.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsPreviewOpen(false)}>
          <div className="adm-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  Live Message Preview (Sample Recipient: Tanmayee Rout)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  Channel: {channel} · Variables Interpolated
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="adm-modal-body">
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Subject:</span>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginTop: '2px' }}>
                  {getInterpolatedText(customSubject)}
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '16px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.82rem',
                  lineHeight: '1.6',
                  color: '#1e293b',
                  fontFamily: 'sans-serif',
                }}
              >
                {getInterpolatedText(customBody)}
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setIsPreviewOpen(false)}
              >
                Back to Edit
              </button>
              <button
                type="button"
                className="adm-btn-primary"
                onClick={() => handleSendBroadcast(false)}
              >
                Confirm &amp; Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
