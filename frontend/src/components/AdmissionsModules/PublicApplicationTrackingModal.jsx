import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  GraduationCap,
  Award,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function PublicApplicationTrackingModal({
  isOpen,
  onClose,
  initialApplicationNo = '',
  onOpenAdmissionLetter,
}) {
  const [appNoInput, setAppNoInput] = useState(initialApplicationNo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!appNoInput.trim()) {
      setError('Please enter your Application Number (e.g. APP-2026-0001)');
      return;
    }

    setLoading(true);
    setError('');
    setTrackResult(null);

    try {
      const res = await api.trackApplication(appNoInput.trim());
      if (res?.success && res?.data) {
        setTrackResult(res.data);
      } else {
        throw new Error(res?.message || 'Application not found.');
      }
    } catch (err) {
      setError(err.message || 'Unable to locate application. Verify the application number.');
    } finally {
      setLoading(false);
    }
  };

  const applicant = trackResult?.applicant;
  const student = trackResult?.student;

  return (
    <div className="adm-modal-backdrop" onClick={onClose} style={{ zIndex: 99998 }}>
      <div
        className="adm-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          width: 'min(640px, 94vw)',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 22px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
              Track Admission Application Status
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', background: '#fff' }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              className="adm-search-input"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
              placeholder="Enter Application No. (e.g. APP-2026-0001)"
              value={appNoInput}
              onChange={(e) => setAppNoInput(e.target.value)}
              required
            />
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={loading}
              style={{ padding: '0 20px', whiteSpace: 'nowrap' }}
            >
              {loading ? 'Tracking…' : 'Track Status'}
            </button>
          </form>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.82rem',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {applicant && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '0.84rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {applicant.name}
                  </div>
                  <div style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.82rem' }}>
                    {applicant.applicationNo}
                  </div>
                </div>

                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    background:
                      applicant.status === 'ENROLLED'
                        ? '#dcfce7'
                        : applicant.status === 'APPROVED' || applicant.status === 'VERIFIED'
                        ? '#e0f2fe'
                        : applicant.status === 'REJECTED'
                        ? '#fee2e2'
                        : '#fef3c7',
                    color:
                      applicant.status === 'ENROLLED'
                        ? '#15803d'
                        : applicant.status === 'APPROVED' || applicant.status === 'VERIFIED'
                        ? '#0369a1'
                        : applicant.status === 'REJECTED'
                        ? '#b91c1c'
                        : '#b45309',
                  }}
                >
                  {applicant.status === 'ENROLLED' ? '✓ Admission Confirmed & Enrolled' : applicant.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Course / Programme:</span>
                  <div style={{ fontWeight: 600 }}>{applicant.programmeName || applicant.programme?.name}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Academic Session:</span>
                  <div style={{ fontWeight: 600 }}>{applicant.academicYear}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Category:</span>
                  <div style={{ fontWeight: 600 }}>{applicant.category}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Submission Date:</span>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(applicant.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </div>
                </div>
              </div>

              {/* Enrolled details */}
              {student && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <ShieldCheck size={16} /> Official Institutional Account Provisioned
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span>Permanent Student ID: <strong style={{ color: '#0f172a' }}>{student.studentId}</strong></span>
                    <span>Roll Number: <strong style={{ color: '#0f172a' }}>{student.rollNumber}</strong></span>
                  </div>
                </div>
              )}

              {/* Action button if verified/enrolled */}
              {onOpenAdmissionLetter && (applicant.status === 'ENROLLED' || applicant.status === 'APPROVED' || applicant.status === 'VERIFIED') && (
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() => onOpenAdmissionLetter(applicant, student)}
                  style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
                >
                  <Printer size={15} /> View &amp; Print Official Admission Letter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

