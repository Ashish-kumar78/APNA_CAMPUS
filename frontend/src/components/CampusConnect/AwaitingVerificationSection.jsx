import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Check, X, Eye, FileText, Download, Clock, AlertCircle,
  Sparkles, Award, ExternalLink, Filter, Search, CheckCircle2
} from 'lucide-react';
import { campusConnectStore } from '../../services/campusConnectStore';

export default function AwaitingVerificationSection({ account, onOpenConversation }) {
  const [pendingItems, setPendingItems] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Incomplete derivations or illegible handwriting');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadData = () => {
    const list = campusConnectStore.getAllAwaitingVerifications();
    setPendingItems(list);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campus_connect_updated', handleUpdate);
    return () => window.removeEventListener('campus_connect_updated', handleUpdate);
  }, []);

  const handleVerify = (item) => {
    const facultyName = account?.name || 'Dr. S. Mohanty';
    campusConnectStore.verifyAcademicRequest(
      item.conversationId,
      item.messageId,
      item.request.id,
      facultyName
    );
    triggerToast(`✓ Resource verified! Contributor received +10 Contribution Points on the Leadership Scoreboard.`);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectModalItem) return;
    const facultyName = account?.name || 'Dr. S. Mohanty';
    campusConnectStore.rejectAcademicRequest(
      rejectModalItem.conversationId,
      rejectModalItem.messageId,
      rejectModalItem.request.id,
      facultyName,
      rejectionReason
    );
    setRejectModalItem(null);
    triggerToast('✕ Resource rejected. Request reopened for other students to upload.');
  };

  return (
    <div style={{ background: '#0b0f19', minHeight: '600px', borderRadius: 16, padding: '24px', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#1e293b',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.4)',
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Resources Awaiting Faculty Verification</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Review student-uploaded lecture notes & assignments before granting official verification and contributor points.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
            {pendingItems.length} Pending Review
          </span>
        </div>
      </div>

      {/* List */}
      {pendingItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#111827', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <CheckCircle2 size={44} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>All Caught Up!</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            There are currently no student-uploaded notes or academic resources pending verification.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingItems.map((item) => (
            <div
              key={item.request.id}
              style={{
                background: '#131c2e',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 14,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                    {item.request.subject}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Lecture on {item.request.date} ({item.request.classTime})
                  </span>
                </div>
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} /> Upload Locked · Awaiting Your Action
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: 'rgba(0,0,0,0.25)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <strong style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Originally Requested By</strong>
                  <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>{item.request.studentName} ({item.request.studentRoll})</span>
                </div>
                <div>
                  <strong style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Uploaded Contributor</strong>
                  <span style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600 }}>{item.request.uploadedBy?.name} ({item.request.uploadedBy?.roll})</span>
                </div>
                <div>
                  <strong style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Attached Document</strong>
                  <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>{item.request.uploadFile?.title} ({item.request.uploadFile?.size})</span>
                </div>
                <div>
                  <strong style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Submission Timestamp</strong>
                  <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>{item.request.uploadedBy?.time || 'Today'}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.83rem', color: '#cbd5e1', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 6, borderLeft: '3px solid #38bdf8' }}>
                Request Note: "{item.request.requestText}"
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    onClick={() => setSelectedPreview(item)}
                  >
                    <Eye size={14} /> [Preview Notes]
                  </button>
                  <a
                    href={item.request.uploadFile?.url || '/sample_documents/sample_document.pdf'}
                    download={item.request.uploadFile?.title}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                  >
                    <Download size={14} /> Download Sample
                  </a>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '8px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setRejectModalItem(item)}
                  >
                    <X size={15} /> [REJECT]
                  </button>
                  <button
                    type="button"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    onClick={() => handleVerify(item)}
                  >
                    <Check size={16} /> [VERIFY & AWARD +10 PTS]
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={() => setSelectedPreview(null)}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, width: '100%', maxWidth: 640, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={18} color="#38bdf8" /> Preview: {selectedPreview.request.uploadFile?.title}
              </h3>
              <button type="button" onClick={() => setSelectedPreview(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '100%', height: 320, background: '#0b0f19', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                <FileText size={48} color="#38bdf8" style={{ marginBottom: 12 }} />
                <h4 style={{ margin: '0 0 6px 0', color: '#fff' }}>{selectedPreview.request.subject} Verified Lecture Material</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
                  Handwritten diagrams, derivation proofs, and pseudo-code verified against Syllabus.
                </p>
                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: 6, fontSize: '0.74rem', fontWeight: 700 }}>
                    Format: Verified PDF (3.1 MB)
                  </span>
                  <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 10px', borderRadius: 6, fontSize: '0.74rem', fontWeight: 700 }}>
                    Uploaded: {selectedPreview.request.uploadedBy?.name}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 20px', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setSelectedPreview(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
                Close Preview
              </button>
              <button
                type="button"
                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                onClick={() => {
                  handleVerify(selectedPreview);
                  setSelectedPreview(null);
                }}
              >
                Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={() => setRejectModalItem(null)}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#f87171' }}>
                Reject Academic Resource
              </h3>
              <button type="button" onClick={() => setRejectModalItem(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Provide feedback for {rejectModalItem.request.uploadedBy?.name}. The upload lock will be cleared so other students can upload.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>Rejection Reason</label>
                  <select
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: '0.85rem' }}
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  >
                    <option value="Incomplete derivations or illegible handwriting">Incomplete derivations or illegible handwriting</option>
                    <option value="Incorrect algorithm steps or faulty diagrams">Incorrect algorithm steps or faulty diagrams</option>
                    <option value="Wrong lecture date or subject mismatch">Wrong lecture date or subject mismatch</option>
                    <option value="Low resolution blackboard photo">Low resolution blackboard photo</option>
                  </select>
                </div>
              </div>
              <div style={{ padding: '14px 20px', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setRejectModalItem(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
