import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Lock, CheckCircle2, Search, AlertCircle, Clock,
  FileText, ShieldCheck, ChevronRight, Copy, Check, Sparkles
} from 'lucide-react';
import { campusConnectStore } from '../../services/campusConnectStore';

export default function AnonymousComplaintsSection() {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'track'
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [newComplaintGenerated, setNewComplaintGenerated] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Form State
  const [form, setForm] = useState({
    category: 'Hostel Infrastructure',
    subject: '',
    description: '',
    location: '',
  });

  const loadData = () => {
    const list = campusConnectStore.getAnonymousComplaints();
    setComplaints(list);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campus_connect_updated', handleUpdate);
    return () => window.removeEventListener('campus_connect_updated', handleUpdate);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;

    const res = campusConnectStore.submitAnonymousComplaint({
      category: form.category,
      subject: form.subject,
      description: form.description
    });

    setNewComplaintGenerated(res);
    setForm({
      category: 'Hostel Infrastructure',
      subject: '',
      description: '',
      location: '',
    });
    loadData();
  };

  const handleTrack = (e) => {
    e.preventDefault();
    setTrackError('');
    if (!searchTrackingId.trim()) return;

    const found = campusConnectStore.trackComplaint(searchTrackingId.trim());
    if (found) {
      setTrackedComplaint(found);
    } else {
      setTrackedComplaint(null);
      setTrackError(`No complaint found with tracking ID "${searchTrackingId.trim()}". Please verify and try again.`);
    }
  };

  const copyTrackingId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div style={{ background: '#0b0f19', minHeight: '620px', borderRadius: 16, padding: '24px', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Secure Anonymous Grievance & Complaint Cell</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Submit university grievances with 100% cryptographic identity masking. Follow up securely using your generated Tracking ID.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: 6, background: '#111827', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            style={{
              background: activeTab === 'submit' ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'transparent',
              color: activeTab === 'submit' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('submit')}
          >
            Submit Grievance
          </button>
          <button
            type="button"
            style={{
              background: activeTab === 'track' ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'transparent',
              color: activeTab === 'track' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('track')}
          >
            Track by ID
          </button>
        </div>
      </div>

      {/* Security Reassurance Callout */}
      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <ShieldCheck size={26} color="#34d399" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
          <strong style={{ color: '#34d399' }}>Zero-Knowledge Student Privacy:</strong> Your name, college ID, and registration number are strictly stripped from the submission. Administrative committees only receive the grievance content and communicate through the anonymized Tracking ID.
        </div>
      </div>

      {/* TAB 1: SUBMIT GRIEVANCE */}
      {activeTab === 'submit' && (
        <div>
          {newComplaintGenerated ? (
            <div style={{ background: '#131c2e', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 14, padding: '24px', textAlign: 'center', maxWidth: 560, margin: '20px auto' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#fff' }}>Grievance Successfully Registered</h3>
              <p style={{ margin: '0 0 18px 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                Your grievance has been encrypted and submitted to the Autonomous Student Redressal Committee. Please save your Tracking ID:
              </p>

              <div style={{ background: '#0b0f19', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
                  {newComplaintGenerated.trackingId}
                </span>
                <button
                  type="button"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                  onClick={() => copyTrackingId(newComplaintGenerated.trackingId)}
                >
                  {copiedId ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copiedId ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  type="button"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setNewComplaintGenerated(null)}
                >
                  Submit Another Grievance
                </button>
                <button
                  type="button"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => {
                    setSearchTrackingId(newComplaintGenerated.trackingId);
                    setTrackedComplaint(newComplaintGenerated);
                    setActiveTab('track');
                    setNewComplaintGenerated(null);
                  }}
                >
                  Track Live Status →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Grievance Category</label>
                  <select
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Hostel Infrastructure">Hostel Infrastructure & Maintenance</option>
                    <option value="Academic & Evaluation">Academic & Evaluation Concern</option>
                    <option value="Canteen & Food Quality">Canteen & Dining Hygiene</option>
                    <option value="Library & Resources">Library Facilities & Quiet Hours</option>
                    <option value="Harassment & Anti-Ragging">Harassment / Anti-Ragging Cell (Highest Priority)</option>
                    <option value="Campus Transport">Campus Bus Transport</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Incident Location (Optional)</label>
                  <input
                    type="text"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                    placeholder="e.g. Block B 2nd floor, Lab 4, Central Library"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Subject / Issue Summary</label>
                <input
                  type="text"
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                  placeholder="Concise title of the grievance..."
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Detailed Grievance Description</label>
                <textarea
                  rows={4}
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                  placeholder="Provide facts, dates, room numbers, or any relevant details. Your identity is guaranteed to remain confidential."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)', marginTop: 8 }}
              >
                <Lock size={16} /> Submit Grievance Anonymously
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: TRACK BY TRACKING ID */}
      {activeTab === 'track' && (
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              style={{ flex: 1, background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 16px', color: '#fff', fontSize: '0.9rem' }}
              placeholder="Enter your Tracking ID (e.g. GIFT-CMP-84920)..."
              value={searchTrackingId}
              onChange={e => setSearchTrackingId(e.target.value)}
            />
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={16} /> Track Status
            </button>
          </form>

          {trackError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: '0.82rem' }}>
              {trackError}
            </div>
          )}

          {trackedComplaint ? (
            <div style={{ background: '#131c2e', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>Tracking ID: {trackedComplaint.trackingId}</span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', color: '#fff' }}>{trackedComplaint.subject}</h3>
                </div>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', padding: '4px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>
                  {trackedComplaint.status}
                </span>
              </div>

              {/* Status Timeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: '#0b0f19', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { step: 1, label: 'Submitted' },
                  { step: 2, label: 'Under Review' },
                  { step: 3, label: 'Action Taken' },
                  { step: 4, label: 'Resolved' }
                ].map((s) => {
                  const isCurrentOrPast = (trackedComplaint.statusStep || 2) >= s.step;
                  return (
                    <div key={s.step} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: isCurrentOrPast ? '#10b981' : '#334155',
                        color: isCurrentOrPast ? '#fff' : '#94a3b8',
                        margin: '0 auto 6px auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {isCurrentOrPast ? '✓' : s.step}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: isCurrentOrPast ? '#34d399' : '#64748b', fontWeight: 600 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                <strong>Issue Description:</strong>
                <p style={{ margin: '4px 0 0', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                  {trackedComplaint.description}
                </p>
              </div>

              {trackedComplaint.committeeResponse && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: '12px 14px' }}>
                  <strong style={{ fontSize: '0.76rem', color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} /> Official Committee Action / Resolution:
                  </strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#e2e8f0' }}>
                    {trackedComplaint.committeeResponse}
                  </p>
                  <small style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block', marginTop: 4 }}>
                    Last update: {trackedComplaint.lastUpdated}
                  </small>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.85rem' }}>
              Enter your grievance Tracking ID above to review committee actions, response, and resolution timeline.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
