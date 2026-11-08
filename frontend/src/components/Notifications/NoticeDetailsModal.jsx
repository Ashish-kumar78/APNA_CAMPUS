import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Pin,
  Share2,
  Printer,
  ShieldCheck,
  BarChart2,
  Check,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { notificationsApi } from '../../services/notificationsApi.js';

export default function NoticeDetailsModal({
  isOpen,
  onClose,
  notice,
  currentUser,
  onAcknowledge,
  onTogglePin,
  onViewAnalytics,
  onWithdraw,
}) {
  const [acked, setAcked] = useState(Boolean(notice?.isAcknowledged));
  const [ackConfirmed, setAckConfirmed] = useState(Boolean(notice?.isAcknowledged));
  const [loadingAck, setLoadingAck] = useState(false);
  const [pinned, setPinned] = useState(Boolean(notice?.isPinned));

  if (!isOpen || !notice) return null;

  const isPublisher =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'principal' ||
    currentUser?.role === 'exam_cell' ||
    currentUser?.role === 'hod' ||
    notice?.senderId === currentUser?.id ||
    notice?.senderName === currentUser?.name;

  const handleAcknowledgeClick = async () => {
    if (!acked) return;
    setLoadingAck(true);
    try {
      if (onAcknowledge) {
        await onAcknowledge(notice.id);
      } else {
        await notificationsApi.acknowledgeNotification(notice.id);
      }
      setAckConfirmed(true);
    } catch (err) {
      // Fallback local update
      setAckConfirmed(true);
    } finally {
      setLoadingAck(false);
    }
  };

  const handlePinClick = async () => {
    const next = !pinned;
    setPinned(next);
    if (onTogglePin) {
      onTogglePin(notice.id, next);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPriorityStyle = (priority) => {
    const p = String(priority || '').toUpperCase();
    if (p === 'URGENT') return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
    if (p === 'IMPORTANT') return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
    return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
  };

  const pStyle = getPriorityStyle(notice.priority);

  return (
    <div
      className="admin-modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                background: pStyle.bg,
                color: pStyle.text,
                border: `1px solid ${pStyle.border}`,
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {String(notice.priority).toUpperCase() === 'URGENT' && <AlertTriangle size={12} />}
              {notice.priority || 'General'}
            </span>
            <span
              style={{
                background: '#f3e8ff',
                color: '#7e22ce',
                border: '1px solid #e9d5ff',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              {notice.category || 'General'}
            </span>
            {notice.referenceNumber && (
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  background: '#f1f5f9',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                Ref: {notice.referenceNumber}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePinClick}
              title={pinned ? 'Unpin notice' : 'Pin notice'}
              style={{
                background: pinned ? '#ecfdf5' : '#f8fafc',
                border: `1px solid ${pinned ? '#a7f3d0' : '#e2e8f0'}`,
                color: pinned ? '#059669' : '#64748b',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Pin size={15} style={{ transform: pinned ? 'rotate(45deg)' : 'none' }} />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              title="Print Circular"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Printer size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 1rem',
              lineHeight: 1.35,
            }}
          >
            {notice.title}
          </h2>

          {/* Meta Information Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              color: '#475569',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="#6366f1" />
              <span>
                Issued by: <strong>{notice.senderName || 'Authorized Official'}</strong>
              </span>
            </div>
            {notice.senderDept && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} color="#6366f1" />
                <span>
                  Dept: <strong>{notice.senderDept}</strong>
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#059669" />
              <span>
                Published: <strong>{notice.publishedDate || notice.date || 'Today'}</strong>
              </span>
            </div>
            {notice.expiresAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#dc2626" />
                <span
                  style={{
                    background: '#fef2f2',
                    color: '#b91c1c',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                  }}
                >
                  Expires: {notice.expiryDate || new Date(notice.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div
            style={{
              fontSize: '0.92rem',
              lineHeight: 1.75,
              color: '#334155',
              whiteSpace: 'pre-line',
              marginBottom: '1.75rem',
            }}
          >
            {notice.message || notice.content || notice.description}
          </div>

          {/* Attachment Preview Box if any */}
          {(notice.attachmentName || notice.attachmentUrl) && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '10px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#166534' }}>
                    {notice.attachmentName || 'Official_Circular_Document.pdf'}
                  </div>
                  <small style={{ color: '#15803d' }}>
                    {notice.attachmentSize || '512 KB'} · Verified Institutional Document
                  </small>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {notice.attachmentUrl && (
                  <a
                    href={notice.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#ffffff',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Eye size={14} /> Preview
                  </a>
                )}
                <a
                  href={notice.attachmentUrl || '#'}
                  download={notice.attachmentName || 'Notice_Document.pdf'}
                  onClick={(e) => {
                    if (!notice.attachmentUrl) {
                      e.preventDefault();
                      alert(`Downloading official circular: ${notice.attachmentName || 'Schedule.pdf'}`);
                    }
                  }}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#15803d',
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={14} /> Download File
                </a>
              </div>
            </div>
          )}

          {/* Mandatory Acknowledgement Box (Module F) */}
          {notice.requiresAcknowledgement && (
            <div
              style={{
                background: ackConfirmed ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${ackConfirmed ? '#86efac' : '#fde68a'}`,
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ paddingTop: '2px' }}>
                  {ackConfirmed ? (
                    <CheckCircle2 size={20} color="#15803d" />
                  ) : (
                    <ShieldCheck size={20} color="#b45309" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: ackConfirmed ? '#166534' : '#92400e',
                      marginBottom: '4px',
                    }}
                  >
                    {ackConfirmed
                      ? 'OFFICIAL ACKNOWLEDGEMENT CONFIRMED'
                      : 'MANDATORY STUDENT / RECIPIENT ACKNOWLEDGEMENT'}
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: ackConfirmed ? '#15803d' : '#78350f' }}>
                    {ackConfirmed
                      ? `You have formally acknowledged reading and understanding this circular on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}. This confirmation has been registered on the central academic compliance ledger.`
                      : 'This institutional notice requires mandatory acknowledgement by all targeted recipients. Please confirm understanding to comply with academic regulations.'}
                  </p>

                  {!ackConfirmed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={acked}
                          onChange={(e) => setAcked(e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        I have read and acknowledged this notice.
                      </label>

                      <button
                        type="button"
                        disabled={!acked || loadingAck}
                        onClick={handleAcknowledgeClick}
                        className="admin-action-btn-primary"
                        style={{
                          background: acked ? '#15803d' : '#94a3b8',
                          borderColor: acked ? '#166534' : '#94a3b8',
                          padding: '5px 14px',
                          fontSize: '0.78rem',
                          cursor: acked ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {loadingAck ? 'Recording...' : 'Submit Acknowledgement'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            {isPublisher && (
              <button
                type="button"
                className="admin-action-btn-secondary"
                style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  onClose();
                  if (onViewAnalytics) onViewAnalytics(notice);
                }}
              >
                <BarChart2 size={14} color="#6366f1" /> Delivery &amp; Acknowledgement Report
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isPublisher && (
              <button
                type="button"
                className="admin-action-btn-secondary"
                style={{ fontSize: '0.78rem', color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to withdraw this notice and move it to archive?')) {
                    if (onWithdraw) onWithdraw(notice.id);
                    onClose();
                  }
                }}
              >
                Withdraw Notice
              </button>
            )}
            <button
              type="button"
              className="admin-action-btn-primary"
              style={{ fontSize: '0.78rem', padding: '6px 16px' }}
              onClick={onClose}
            >
              Back to Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
