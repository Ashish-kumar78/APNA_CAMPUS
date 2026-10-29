import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  UserCheck,
  Building,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { notificationsStore } from '../services/notificationsStore.js';

export default function StudentComplaintFeedbackModal({
  isOpen,
  complaint,
  onClose,
  onFeedbackSubmitted,
  onSwitchToReopen,
  onSubmitted,
  onRouteToReopen,
}) {
  const [isResolved, setIsResolved] = useState('yes');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [resolvedInTime, setResolvedInTime] = useState('yes');
  const [adminComments, setAdminComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !complaint) return null;

  const starLabels = {
    1: '1 Star — Very Poor',
    2: '2 Stars — Poor',
    3: '3 Stars — Average',
    4: '4 Stars — Good',
    5: '5 Stars — Excellent',
  };

  const triggerReopenRoute = () => {
    const routeFn = onRouteToReopen || onSwitchToReopen;
    if (routeFn) {
      const reasonCombined = feedbackText.trim()
        ? feedbackText.trim() + (adminComments.trim() ? ` (Admin Note: ${adminComments.trim()})` : '')
        : adminComments.trim();
      routeFn(complaint, reasonCombined);
    }
  };

  const handleWorkCompletionChange = (val) => {
    setIsResolved(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isResolved === 'no') {
      triggerReopenRoute();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        rating: Number(rating) || 5,
        feedbackText: feedbackText.trim() || 'Work completed and verified satisfactory by student.',
        adminComments: adminComments.trim() || null,
        isResolved: true,
        resolvedInExpectedTime: resolvedInTime === 'yes',
      };

      const res = await api.confirmComplaintCompleted(complaint.id, payload);
      const updatedTicket = (res && res.data) ? res.data : {
        ...complaint,
        status: 'Resolved',
        resolvedAt: new Date().toISOString(),
        studentVerifiedAt: new Date().toISOString(),
        feedbackRating: payload.rating,
        feedbackText: payload.feedbackText,
        feedbackResolved: true,
        feedbackAdminComments: payload.adminComments,
        feedbackSubmittedAt: new Date().toISOString(),
      };

      // In-app notification to BOTH Hostel Warden and Hostel Administrator
      try {
        notificationsStore.sendNotification({
          title: `Complaint #${complaint.id} Resolved: ${payload.rating}★ Student Feedback`,
          message: `Student ${complaint.studentName || 'Rakesh Das'} confirmed repair of "${complaint.title}" with a ${payload.rating}/5 star rating. Both Resident Warden (${complaint.assignedWardenName || 'Mrs. Nibedita Das'}) and Hostel Administration have been notified.`,
          category: 'HOSTEL',
          priority: 'NORMAL',
          senderName: complaint.studentName || 'Rakesh Das',
          senderRole: 'Student Resident',
          senderDept: `${complaint.hostel || 'Hostel'} · Rm ${complaint.roomNumber || '204'}`,
          actionTab: 'complaints',
        }, ['hostel', 'admin', 'staff']);
      } catch (e) {
        console.warn('Local notification dispatch warning:', e);
      }

      const submitCallback = onFeedbackSubmitted || onSubmitted;
      if (submitCallback) {
        submitCallback(updatedTicket);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit feedback. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="admin-modal-backdrop"
      onClick={() => !isSubmitting && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2100,
        padding: '1rem',
      }}
    >
      <div
        className="complaint-modal"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '580px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', padding: '3px', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={16} />
              </span>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                Completion Verification &amp; Service Feedback
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Ticket: <strong style={{ color: '#7c3aed' }}>{complaint.id}</strong> — {complaint.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Process Flow Indicator Strip */}
        <div
          style={{
            background: '#ecfdf5',
            borderBottom: '1px solid #a7f3d0',
            padding: '8px 16px',
            fontSize: '0.78rem',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontWeight: 700 }}>Workflow:</span>
          <span>Work Done</span>
          <ArrowRight size={12} />
          <span style={{ fontWeight: 700, color: '#047857' }}>Student Verification</span>
          <ArrowRight size={12} />
          <span>Auto-forwarded to Warden &amp; Admin</span>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
              {errorMessage}
            </div>
          )}

          {/* SECTION A: Work Completion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#7c3aed" /> A. Work Completion: Is the problem completely resolved?
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  border: isResolved === 'yes' ? '2px solid #10b981' : '1px solid #cbd5e1',
                  borderRadius: '10px',
                  background: isResolved === 'yes' ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: isResolved === 'yes' ? '#065f46' : '#475569',
                }}
              >
                <input
                  type="radio"
                  name="workResolved"
                  value="yes"
                  checked={isResolved === 'yes'}
                  onChange={() => handleWorkCompletionChange('yes')}
                />
                ✓ Yes, completely resolved
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  border: isResolved === 'no' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                  borderRadius: '10px',
                  background: isResolved === 'no' ? '#fef2f2' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: isResolved === 'no' ? '#991b1b' : '#475569',
                }}
              >
                <input
                  type="radio"
                  name="workResolved"
                  value="no"
                  checked={isResolved === 'no'}
                  onChange={() => handleWorkCompletionChange('no')}
                />
                ✕ No, problem remains
              </label>
            </div>
            {isResolved === 'no' && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ color: '#991b1b', fontSize: '0.82rem', lineHeight: '1.4' }}>
                  <strong>Problem remains:</strong> Reopening this complaint will alert the Resident Warden &amp; Administration for immediate priority follow-up repair.
                </div>
                <button
                  type="button"
                  onClick={triggerReopenRoute}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  Open Report <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* SECTION B: Service Rating */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" /> B. Service Rating: How would you rate the repair?
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: filled ? '#f59e0b' : '#cbd5e1',
                      transition: 'transform 0.15s ease',
                      transform: (hoverRating || rating) === star ? 'scale(1.2)' : 'scale(1)',
                    }}
                    title={starLabels[star]}
                  >
                    <Star size={28} fill={filled ? '#f59e0b' : 'none'} strokeWidth={1.75} />
                  </button>
                );
              })}
              <span style={{ marginLeft: '10px', fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>
                {starLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* SECTION C: Feedback Written Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="student-feedback-text" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} color="#7c3aed" /> C. Feedback: What do you think about the repair service?
            </label>
            <textarea
              id="student-feedback-text"
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Technician Suresh was punctual, replaced the washer neatly, and tested the water pressure. Very satisfied with the quick resolution."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          {/* SECTION D: Optional Additional Information */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              D. Optional Additional Information
            </div>

            {/* Resolved within expected time */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                <Clock size={13} style={{ verticalAlign: 'middle', marginRight: '5px', color: '#64748b' }} />
                Was the issue resolved within the expected 72-hour time?
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="resolvedInTime"
                    value="yes"
                    checked={resolvedInTime === 'yes'}
                    onChange={() => setResolvedInTime('yes')}
                  />
                  Yes
                </label>
                <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="resolvedInTime"
                    value="no"
                    checked={resolvedInTime === 'no'}
                    onChange={() => setResolvedInTime('no')}
                  />
                  No
                </label>
              </div>
            </div>

            {/* Comments for Hostel Administrator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="student-admin-comments" style={{ fontSize: '0.82rem', color: '#1e293b' }}>
                <Building size={13} style={{ verticalAlign: 'middle', marginRight: '5px', color: '#64748b' }} />
                Would you like to add any comments for the Hostel Administrator?
              </label>
              <input
                id="student-admin-comments"
                type="text"
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                placeholder="Optional notes visible to Hostel Administrator..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                }}
              />
            </div>
          </div>

          {/* Process Flow Notification Notice */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={16} color="#0284c7" style={{ flexShrink: 0 }} />
            <span>
              Upon submission, your verified feedback is securely saved and automatically made available on both the <strong>Hostel Warden</strong> and <strong>Hostel Administrator</strong> dashboards.
            </span>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: isResolved === 'no' ? '#dc2626' : '#16a34a',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                boxShadow: isResolved === 'no' ? '0 2px 8px rgba(220, 38, 38, 0.35)' : '0 2px 6px rgba(22, 163, 74, 0.3)',
              }}
            >
              {isResolved === 'no' ? (
                <>
                  <AlertCircle size={16} />
                  Report Problem Not Resolved →
                </>
              ) : (
                <>
                  <Send size={15} />
                  {isSubmitting ? 'Submitting Feedback...' : 'Confirm Resolution & Submit Feedback'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
