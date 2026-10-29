import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  Send,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api.js';
import { notificationsStore } from '../services/notificationsStore.js';

export default function ReopenComplaintModal({
  isOpen,
  complaint,
  onClose,
  onReopened,
}) {
  const [reason, setReason] = useState(complaint?.initialReason || complaint?.reopenReason || '');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (complaint?.initialReason) {
      setReason(complaint.initialReason);
    } else if (complaint?.reopenReason) {
      setReason(complaint.reopenReason);
    } else {
      setReason('');
    }
    setPhotoPreview(null);
    setPhotoName('');
    setErrorMessage('');
  }, [complaint, isOpen]);

  if (!isOpen || !complaint) return null;

  const compressImage = (file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoName(file.name);
    try {
      const compressed = await compressImage(file);
      setPhotoPreview(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Please describe what remains broken or unresolved before reopening.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        reason: reason.trim(),
        attachmentUrl: photoPreview || null,
      };

      const res = await api.reopenComplaint(complaint.id, payload);
      const updatedTicket = (res && res.data) ? res.data : {
        ...complaint,
        status: 'Reopened',
        reopenedAt: new Date().toISOString(),
        reopenReason: payload.reason,
        reopenAttachmentUrl: payload.attachmentUrl,
      };

      // In-app notifications to Assigned Warden & Hostel Administrator
      try {
        notificationsStore.sendNotification({
          title: `⚠️ Complaint #${complaint.id} Reopened by Student`,
          message: `Student ${complaint.studentName || 'Rakesh Das'} reported issue NOT resolved for "${complaint.title}". Detail: "${payload.reason}". Reopened for priority rework.`,
          category: 'HOSTEL',
          priority: 'URGENT',
          senderName: complaint.studentName || 'Rakesh Das',
          senderRole: 'Student Resident',
          senderDept: `${complaint.hostel || 'Hostel'} · Rm ${complaint.roomNumber || '204'}`,
          actionTab: 'complaints',
        }, ['hostel', 'warden', 'admin']);
      } catch (e) {
        console.warn('Notification dispatch error:', e);
      }

      if (onReopened) {
        onReopened(updatedTicket);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Unable to reopen complaint. Please check your connection.');
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
        zIndex: 2150,
        padding: '1rem',
      }}
    >
      <div
        className="complaint-modal"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '540px',
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
            borderBottom: '1px solid #fee2e2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '4px', display: 'grid', placeItems: 'center' }}>
              <AlertTriangle size={18} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#991b1b', fontWeight: 700 }}>
                Report Problem Not Resolved
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Ticket: <strong>{complaint.id}</strong> — {complaint.title}
              </p>
            </div>
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

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {errorMessage && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
              {errorMessage}
            </div>
          )}

          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '10px 12px', fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
            <ShieldAlert size={15} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#d97706' }} />
            Reopening this complaint will immediately notify Resident Warden <strong>{complaint.assignedWardenName || 'Mrs. Nibedita Das'}</strong> and the Hostel Administration for mandatory reassignment and priority repair.
          </div>

          {/* Description of remaining problem */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="reopen-reason-input" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Please explain why the problem is not fixed: <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              id="reopen-reason-input"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. The water tap was fixed, but it still drips from the joint underneath the washbasin when turned on full pressure."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
              required
            />
          </div>

          {/* Optional photo evidence upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
              Optional Photo of Remaining Defect:
            </label>
            {!photoPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '14px',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <Upload size={16} /> Attach Photo Showing Problem
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                <img src={photoPreview} alt="Defect preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {photoName}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>✓ Attached</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                  title="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
          </div>

          {/* Footer buttons */}
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
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
              }}
            >
              <RotateCcw size={15} />
              {isSubmitting ? 'Reopening Ticket...' : 'Reopen Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
