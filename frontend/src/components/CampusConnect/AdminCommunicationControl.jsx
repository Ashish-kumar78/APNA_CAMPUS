import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Megaphone, Users, MessageSquare, Flag, Check,
  AlertTriangle, Plus, Trash2, VolumeX, Archive, Send, FileText,
  BarChart2, Sparkles, CheckCircle2, X
} from 'lucide-react';
import { campusConnectStore } from '../../services/campusConnectStore';

export default function AdminCommunicationControl({ account, onOpenConversation }) {
  const [activeTab, setActiveTab] = useState('broadcast'); // 'broadcast' | 'groups' | 'reports' | 'analytics'
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // Broadcast Announcement Form State
  const [broadcastForm, setBroadcastForm] = useState({
    channel: 'conv-univ-announcements',
    department: 'CENTRAL ADMINISTRATION · REGISTRAR',
    title: '',
    body: '',
    badge: 'OFFICIAL NOTICE',
    actionLabel: 'VIEW DETAILS',
    actionUrl: '/sample_documents/sample_document.pdf'
  });

  // Group Creation Form State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    category: 'Groups',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    description: ''
  });

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadData = () => {
    setReports(campusConnectStore.getReports());
    setConversations(campusConnectStore.getConversations('admin', 'All'));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campus_connect_updated', handleUpdate);
    return () => window.removeEventListener('campus_connect_updated', handleUpdate);
  }, []);

  // Handle Broadcast announcement send
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) return;

    campusConnectStore.sendMessage(broadcastForm.channel, {
      sender: broadcastForm.department,
      senderRole: 'admin',
      text: broadcastForm.title,
      type: 'official_announcement',
      announcement: {
        department: broadcastForm.department,
        title: broadcastForm.title,
        body: broadcastForm.body,
        badge: broadcastForm.badge,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        actionLabel: broadcastForm.actionLabel,
        actionUrl: broadcastForm.actionUrl
      }
    });

    setBroadcastForm({
      channel: 'conv-univ-announcements',
      department: 'CENTRAL ADMINISTRATION · REGISTRAR',
      title: '',
      body: '',
      badge: 'OFFICIAL NOTICE',
      actionLabel: 'VIEW DETAILS',
      actionUrl: '/sample_documents/sample_document.pdf'
    });

    triggerToast('📢 Official Announcement broadcasted across university channel successfully!');
  };

  // Resolve moderation report
  const handleResolveReport = (reportId) => {
    campusConnectStore.resolveReport(reportId, 'Reviewed by Dean of Student Affairs: Warning issued & message dismissed');
    triggerToast('✓ Moderation report marked as Resolved.');
  };

  return (
    <div style={{ background: '#0b0f19', borderRadius: 16, padding: '24px', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#1e293b',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: 10,
          padding: '12px 18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Megaphone size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Campus Connect Admin Control & Moderation</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Broadcast official institution notices, moderate flagged messages, and supervise university channel communications.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: 6, background: '#111827', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'broadcast', label: 'Broadcast Notice' },
            { id: 'reports', label: `Moderation Reports (${reports.filter(r => r.status !== 'Resolved').length})` },
            { id: 'groups', label: 'Channel Directory' },
            { id: 'analytics', label: 'Analytics' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              style={{
                background: activeTab === t.id ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'transparent',
                color: activeTab === t.id ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: BROADCAST OFFICIAL ANNOUNCEMENT */}
      {activeTab === 'broadcast' && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ background: '#131c2e', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={18} /> Compose High-Priority Broadcast
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              Official announcements appear as high-visibility broadcast cards pinned directly to the target announcement channels.
            </p>

            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Target Channel</label>
                  <select
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem' }}
                    value={broadcastForm.channel}
                    onChange={e => setBroadcastForm({ ...broadcastForm, channel: e.target.value })}
                  >
                    <option value="conv-univ-announcements">📢 University Announcements (All Campus)</option>
                    <option value="conv-exam-cell">📢 Examination Cell</option>
                    <option value="conv-placement">📢 Placement & Career Cell</option>
                    <option value="conv-cse-dept">📢 CSE Department</option>
                    <option value="conv-library">📢 Central Library</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Publishing Department</label>
                  <input
                    type="text"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem' }}
                    value={broadcastForm.department}
                    onChange={e => setBroadcastForm({ ...broadcastForm, department: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Announcement Title</label>
                <input
                  type="text"
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem' }}
                  placeholder="e.g. End Semester Theory Examination Timetable Published"
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Official Notice Body</label>
                <textarea
                  rows={4}
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                  placeholder="Enter complete circular text, instructions, and deadlines..."
                  value={broadcastForm.body}
                  onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Header Tag / Badge</label>
                  <input
                    type="text"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem' }}
                    value={broadcastForm.badge}
                    onChange={e => setBroadcastForm({ ...broadcastForm, badge: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Action Button Label</label>
                  <input
                    type="text"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem' }}
                    value={broadcastForm.actionLabel}
                    onChange={e => setBroadcastForm({ ...broadcastForm, actionLabel: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}
              >
                <Send size={16} /> Broadcast to Campus Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reports.map((rep) => (
            <div
              key={rep.id}
              style={{
                background: '#131c2e',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                    {rep.id} • {rep.status}
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: '#fff' }}>Channel: {rep.conversation}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reported on {rep.date}</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <strong>Reason Flagged:</strong> {rep.reason}
                </p>
                {rep.resolution && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#34d399' }}>
                    ✓ Resolution: {rep.resolution}
                  </p>
                )}
              </div>

              {rep.status !== 'Resolved' ? (
                <button
                  type="button"
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => handleResolveReport(rep.id)}
                >
                  <Check size={14} /> Mark Resolved
                </button>
              ) : (
                <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={16} /> Resolved
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CHANNEL DIRECTORY */}
      {activeTab === 'groups' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {conversations.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#131c2e',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>{c.avatar}</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#fff' }}>{c.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>{c.category} • {c.membersCount} Members</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {c.description || 'Channel collaboration space.'}
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', borderRadius: 4 }}>
                  {c.department || 'Autonomous'}
                </span>
                <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '2px 6px', borderRadius: 4 }}>
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18 }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Channels</span>
            <h3 style={{ margin: '6px 0 0', fontSize: '1.8rem', color: '#38bdf8' }}>{conversations.length}</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b' }}>Classes, Depts & Clubs</p>
          </div>
          <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18 }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Online Today</span>
            <h3 style={{ margin: '6px 0 0', fontSize: '1.8rem', color: '#34d399' }}>1,842</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b' }}>Active students & faculty</p>
          </div>
          <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18 }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Notes Verified</span>
            <h3 style={{ margin: '6px 0 0', fontSize: '1.8rem', color: '#eab308' }}>22</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b' }}>+220 points awarded</p>
          </div>
          <div style={{ background: '#131c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18 }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Grievance Resolution</span>
            <h3 style={{ margin: '6px 0 0', fontSize: '1.8rem', color: '#a855f7' }}>94%</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b' }}>Avg response &lt; 24h</p>
          </div>
        </div>
      )}
    </div>
  );
}
