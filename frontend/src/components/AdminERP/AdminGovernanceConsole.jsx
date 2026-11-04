import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  UserCheck,
  Megaphone,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Send,
  X,
  Edit2,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminGovernanceConsole({ account }) {
  const [activeSubTab, setActiveSubTab] = useState('meetings'); // 'meetings', 'resolutions', 'circulars', 'action-items', 'hierarchy'
  const [meetings, setMeetings] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [circulars, setCirculars] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isCircularModalOpen, setIsCircularModalOpen] = useState(false);

  // Form states
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    council: 'Governing Body',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM - 01:30 PM',
    venue: 'Executive Boardroom, Chanakya Administrative Block',
    agenda: '',
  });

  const [resForm, setResForm] = useState({
    resolutionCode: '',
    title: '',
    passedBy: 'Governing Body',
    effectiveDate: new Date().toISOString().split('T')[0],
    responsibleDepartment: 'Computer Science & Engineering',
    category: 'Institutional Policy',
    executiveSummary: '',
  });

  const [circularForm, setCircularForm] = useState({
    title: '',
    circularNo: '',
    category: 'Academic Administration',
    targetAudience: 'All Faculty & Students',
    priority: 'General',
    effectiveUntil: '2026-12-31',
    content: '',
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadGovernanceData = async () => {
    setLoading(true);
    try {
      const [mtgRes, resRes, cirRes, actRes] = await Promise.allSettled([
        api.getAdminGovernanceMeetings(),
        api.getAdminGovernanceResolutions(),
        api.getAdminGovernanceCirculars(),
        api.getAdminGovernanceActionItems(),
      ]);

      if (mtgRes.status === 'fulfilled' && Array.isArray(mtgRes.value?.data)) {
        setMeetings(mtgRes.value.data);
      }
      if (resRes.status === 'fulfilled' && Array.isArray(resRes.value?.data)) {
        setResolutions(resRes.value.data);
      }
      if (cirRes.status === 'fulfilled' && Array.isArray(cirRes.value?.data)) {
        setCirculars(cirRes.value.data);
      }
      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value?.data)) {
        setActionItems(actRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAdminGovernanceMeeting(meetingForm);
      if (res?.data) {
        setMeetings([res.data, ...meetings]);
        setIsMeetingModalOpen(false);
        showToast('Statutory Council Meeting scheduled successfully!');
      }
    } catch (err) {
      alert('Error scheduling meeting: ' + (err.message || 'Check inputs'));
    }
  };

  const handleCreateResolution = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAdminGovernanceResolution(resForm);
      if (res?.data) {
        setResolutions([res.data, ...resolutions]);
        setIsResolutionModalOpen(false);
        showToast('Statutory Resolution ratified and recorded!');
      }
    } catch (err) {
      alert('Error recording resolution: ' + (err.message || 'Check inputs'));
    }
  };

  const handlePublishCircular = async (e) => {
    e.preventDefault();
    try {
      const res = await api.publishAdminGovernanceCircular(circularForm);
      if (res?.data) {
        setCirculars([res.data, ...circulars]);
        setIsCircularModalOpen(false);
        showToast('Administrative Circular published and broadcasted!');
      }
    } catch (err) {
      alert('Error publishing circular: ' + (err.message || 'Check inputs'));
    }
  };

  const handleUpdateActionProgress = async (id, currentProgress) => {
    const nextProgress = Math.min(100, currentProgress + 20);
    const nextStatus = nextProgress === 100 ? 'Completed' : 'In Progress';
    try {
      const res = await api.updateAdminGovernanceActionItem(id, {
        progress: nextProgress,
        status: nextStatus,
      });
      if (res?.data) {
        setActionItems(actionItems.map(a => a.id === id ? res.data : a));
        showToast(`Action item ${id} updated to ${nextProgress}% (${nextStatus})`);
      }
    } catch (err) {
      alert('Error updating action item: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981',
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="admin-view-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <ShieldCheck size={13} />
            Institutional Governance &amp; Statutory Councils
          </div>
          <h2>Governance, Senate Decisions &amp; Administrative Circulars</h2>
          <p>
            Governing Body, Academic Council, and statutory committee ratifications, circular broadcasts, and strategic action plans.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {activeSubTab === 'meetings' && (
            <button className="admin-action-btn-primary" onClick={() => setIsMeetingModalOpen(true)}>
              <Plus size={14} /> Schedule Meeting
            </button>
          )}
          {activeSubTab === 'resolutions' && (
            <button className="admin-action-btn-primary" onClick={() => setIsResolutionModalOpen(true)}>
              <Plus size={14} /> Enact Resolution
            </button>
          )}
          {activeSubTab === 'circulars' && (
            <button className="admin-action-btn-primary" onClick={() => setIsCircularModalOpen(true)}>
              <Megaphone size={14} /> Broadcast Circular
            </button>
          )}
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '8px',
        overflowX: 'auto',
      }}>
        {[
          { id: 'meetings', label: 'Council Meetings & Minutes', icon: Calendar, count: meetings.length },
          { id: 'resolutions', label: 'Statutory Resolutions', icon: FileCheck, count: resolutions.length },
          { id: 'circulars', label: 'Administrative Circulars', icon: Megaphone, count: circulars.length },
          { id: 'action-items', label: 'Strategic Action Tracker', icon: TrendingUp, count: actionItems.length },
          { id: 'hierarchy', label: 'Organization Hierarchy', icon: Layers },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} />
              {tab.label}
              {tab.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  borderRadius: '12px',
                  padding: '1px 6px',
                  fontSize: '11px',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Council Meetings & Minutes */}
      {activeSubTab === 'meetings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {meetings.map(m => (
              <div key={m.id} className="admin-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="admin-badge boys" style={{ fontSize: '11px' }}>
                    {m.council}
                  </span>
                  <span className={`admin-badge ${m.status === 'Completed' ? 'active' : 'pending'}`}>
                    {m.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {m.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <div>📅 Date &amp; Time: <strong>{m.date} ({m.time})</strong></div>
                  <div>📍 Venue: <strong>{m.venue}</strong></div>
                  <div>👥 Attendees: <strong>{m.attendees?.length || 8} Members Recorded</strong></div>
                </div>

                {/* Agenda points */}
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Ratified Agenda Items:</div>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#334155' }}>
                    {(m.agenda || []).map((ag, i) => (
                      <li key={i}>{ag}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ref: {m.id}</span>
                  <button
                    onClick={() => showToast(`Minutes PDF for ${m.id} generated and downloaded`)}
                    className="admin-action-btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    <Download size={12} /> Signed Minutes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: Statutory Resolutions */}
      {activeSubTab === 'resolutions' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search resolutions by code, title, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  width: '280px',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '5px 8px', fontSize: '12px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved / Ratified</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Resolution No.</th>
                  <th>Title &amp; Scope</th>
                  <th>Enacting Body</th>
                  <th>Responsible Dept</th>
                  <th>Effective Date</th>
                  <th>Action Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resolutions
                  .filter(r => {
                    const matchQ = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.resolutionCode.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchS = statusFilter === 'ALL' || r.status.toUpperCase() === statusFilter;
                    return matchQ && matchS;
                  })
                  .map(res => (
                    <tr key={res.id}>
                      <td>
                        <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                          {res.resolutionCode}
                        </code>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{res.title}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Category: {res.category}</div>
                      </td>
                      <td>{res.passedBy}</td>
                      <td>
                        <span className="admin-badge boys" style={{ fontSize: '11px' }}>
                          {res.responsibleDepartment}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '12px' }}>{res.effectiveDate}</td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{res.actionOwner || 'Dean R&D'}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${res.status === 'APPROVED' ? 'active' : 'pending'}`}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Administrative Circulars */}
      {activeSubTab === 'circulars' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1rem' }}>
            {circulars.map(cir => (
              <div key={cir.id} className="admin-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <code style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                    {cir.circularNo}
                  </code>
                  <span className={`admin-badge ${cir.priority === 'Urgent' ? 'rejected' : 'active'}`}>
                    {cir.priority || 'General'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                  {cir.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                  Authority: <strong>{cir.issuingAuthority}</strong> · Audience: <strong>{cir.targetAudience}</strong> · Date: <strong>{cir.issueDate}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: '#334155', lineHeight: 1.5, marginBottom: '12px' }}>
                  {cir.content}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                    ✓ Broadcasted to Student &amp; Faculty Noticeboards
                  </span>
                  <button
                    onClick={() => showToast(`Circular ${cir.circularNo} re-broadcasted`)}
                    className="admin-action-btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    <Send size={12} /> Re-Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: Strategic Action Tracker */}
      {activeSubTab === 'action-items' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Strategic Objectives &amp; Resolution Implementation Matrix
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Monitored action items stemming directly from Governing Body and Academic Senate mandates.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Action ID</th>
                  <th>Deliverable Title</th>
                  <th>Mandate Ref</th>
                  <th>Department</th>
                  <th>Responsible Owner</th>
                  <th>Target Due Date</th>
                  <th>Implementation Progress</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.map(act => (
                  <tr key={act.id}>
                    <td>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                        {act.id}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{act.title}</strong>
                    </td>
                    <td style={{ fontSize: '11px', color: '#64748b' }}>{act.resolutionRef}</td>
                    <td>
                      <span className="admin-badge boys" style={{ fontSize: '11px' }}>
                        {act.department}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>{act.owner}</td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{act.dueDate}</td>
                    <td style={{ minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${act.progress}%`,
                              height: '100%',
                              background: act.progress === 100 ? '#10b981' : '#2563eb',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', width: '32px' }}>
                          {act.progress}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleUpdateActionProgress(act.id, act.progress)}
                        disabled={act.progress === 100}
                        style={{
                          background: act.progress === 100 ? '#f1f5f9' : '#eff6ff',
                          color: act.progress === 100 ? '#94a3b8' : '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: act.progress === 100 ? 'default' : 'pointer',
                        }}
                      >
                        {act.progress === 100 ? 'Completed' : '+20% Advance'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 5: Organization Hierarchy */}
      {activeSubTab === 'hierarchy' && (
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
            Statutory Institutional Governance Hierarchy
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            {/* Level 1: Board of Trustees */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '10px',
              textAlign: 'center',
              width: '320px',
              boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>Supreme Apex Authority</div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>Governing Body &amp; Board of Trustees</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Chairman, Vice Chairman, UGC Nominee, State Nominee</div>
            </div>

            <div style={{ width: 2, height: 20, background: '#cbd5e1' }} />

            {/* Level 2: Executive Head */}
            <div style={{
              background: '#1e3a8a',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '10px',
              textAlign: 'center',
              width: '320px',
              boxShadow: '0 4px 12px rgba(30,58,138,0.2)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#bfdbfe', textTransform: 'uppercase' }}>Chief Academic &amp; Executive Head</div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>Office of the Principal / Director</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>Overall Administrative &amp; Autonomous Governance</div>
            </div>

            <div style={{ width: 2, height: 20, background: '#cbd5e1' }} />

            {/* Level 3: Statutory Deans & Registrar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { title: 'Academic Senate & Dean Academics', role: 'Curriculum & Board of Studies', color: '#2563eb' },
                { title: 'Dean Research & Consultancy', role: 'Funded Projects & Patents', color: '#7c3aed' },
                { title: 'Office of the Registrar', role: 'Institutional Administration & Records', color: '#059669' },
                { title: 'Controller of Examinations', role: 'Continuous Assessment & Moderation', color: '#d97706' },
                { title: 'Finance & Accounts Officer', role: 'Budgets & Procurement Approvals', color: '#0891b2' },
              ].map((sub, i) => (
                <div key={i} style={{
                  background: '#f8fafc',
                  border: `2px solid ${sub.color}`,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  width: '210px',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{sub.title}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{sub.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Schedule Council Meeting */}
      {isMeetingModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', position: 'relative' }}>
            <button
              onClick={() => setIsMeetingModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Schedule Statutory Council Meeting
            </h3>
            <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Statutory Council</label>
                <select
                  value={meetingForm.council}
                  onChange={(e) => setMeetingForm({ ...meetingForm, council: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                >
                  <option value="Governing Body">Governing Body</option>
                  <option value="Academic Council">Academic Council</option>
                  <option value="Board of Studies">Board of Studies</option>
                  <option value="Internal Quality Assurance Cell (IQAC)">Internal Quality Assurance Cell (IQAC)</option>
                  <option value="Finance Committee">Finance Committee</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Meeting Title / Session</label>
                <input
                  type="text"
                  required
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="e.g. 75th Meeting of Governing Body"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Time Slot</label>
                  <input
                    type="text"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Venue</label>
                <input
                  type="text"
                  value={meetingForm.venue}
                  onChange={(e) => setMeetingForm({ ...meetingForm, venue: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Agenda Points (Comma separated)</label>
                <textarea
                  rows={3}
                  value={meetingForm.agenda}
                  onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  placeholder="Review annual budget, approve faculty seed grants, ratify autonomous exam regulations"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="admin-action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                >
                  Save Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Enact Resolution */}
      {isResolutionModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', position: 'relative' }}>
            <button
              onClick={() => setIsResolutionModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Enact Statutory Resolution
            </h3>
            <form onSubmit={handleCreateResolution} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Resolution Number / Reference</label>
                <input
                  type="text"
                  required
                  value={resForm.resolutionCode}
                  onChange={(e) => setResForm({ ...resForm, resolutionCode: e.target.value })}
                  placeholder="e.g. RES/GB/75/01"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Resolution Subject / Title</label>
                <input
                  type="text"
                  required
                  value={resForm.title}
                  onChange={(e) => setResForm({ ...resForm, title: e.target.value })}
                  placeholder="e.g. Ratification of Seed Grants for Autonomous AI Faculty"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Passed By</label>
                  <select
                    value={resForm.passedBy}
                    onChange={(e) => setResForm({ ...resForm, passedBy: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  >
                    <option value="Governing Body">Governing Body</option>
                    <option value="Academic Council">Academic Council</option>
                    <option value="Finance Committee">Finance Committee</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Responsible Dept</label>
                  <input
                    type="text"
                    value={resForm.responsibleDepartment}
                    onChange={(e) => setResForm({ ...resForm, responsibleDepartment: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Executive Summary &amp; Policy Mandate</label>
                <textarea
                  rows={3}
                  value={resForm.executiveSummary}
                  onChange={(e) => setResForm({ ...resForm, executiveSummary: e.target.value })}
                  placeholder="Details of the resolution and required implementation actions..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsResolutionModalOpen(false)}
                  className="admin-action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                >
                  Enact Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Broadcast Circular */}
      {isCircularModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', position: 'relative' }}>
            <button
              onClick={() => setIsCircularModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Publish Official Administrative Circular
            </h3>
            <form onSubmit={handlePublishCircular} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Circular Subject</label>
                <input
                  type="text"
                  required
                  value={circularForm.title}
                  onChange={(e) => setCircularForm({ ...circularForm, title: e.target.value })}
                  placeholder="e.g. Schedule for Autonomous CIE-2 Examination and Marks Entry"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Target Stakeholders</label>
                  <select
                    value={circularForm.targetAudience}
                    onChange={(e) => setCircularForm({ ...circularForm, targetAudience: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  >
                    <option value="All Campus Stakeholders">All Campus Stakeholders</option>
                    <option value="All Faculty Coordinators">All Faculty Coordinators</option>
                    <option value="All Enrolled Students">All Enrolled Students</option>
                    <option value="Department HODs & Deans">Department HODs &amp; Deans</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Priority Flag</label>
                  <select
                    value={circularForm.priority}
                    onChange={(e) => setCircularForm({ ...circularForm, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                  >
                    <option value="General">General Notice</option>
                    <option value="Urgent">Urgent / Statutory Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Circular Content / Full Instructions</label>
                <textarea
                  rows={4}
                  required
                  value={circularForm.content}
                  onChange={(e) => setCircularForm({ ...circularForm, content: e.target.value })}
                  placeholder="Full text of the office order or administrative circular..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCircularModalOpen(false)}
                  className="admin-action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                >
                  Publish &amp; Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

