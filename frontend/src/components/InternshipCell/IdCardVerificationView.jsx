import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building,
  GraduationCap,
  Calendar,
  X,
  ExternalLink,
  Award,
} from 'lucide-react';
import { api } from '../../services/api';
import ApnaCampusSymbol from '../Branding/ApnaCampusSymbol';

export default function IdCardVerificationView({ token, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function verify() {
      if (!token) {
        setError('No verification token provided.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await api.verifyInternshipIdCard(token);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to verify card credentials with central server.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    verify();
    return () => { isMounted = false; };
  }, [token]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: '#0f2b48',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ApnaCampusSymbol size={32} />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.06em' }}>
                CENTRAL CREDENTIAL GATEWAY
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                ID Card Authentication
              </h3>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Querying Institutional Ledger...</div>
            </div>
          ) : error || !data ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <AlertTriangle size={42} color="#dc2626" style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 6px 0', color: '#991b1b', fontSize: '1.05rem' }}>Verification Failed</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{error || 'Invalid credential payload.'}</p>
            </div>
          ) : data.valid ? (
            <div>
              {/* Authenticated Banner */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={28} color="#16a34a" />
                <div>
                  <strong style={{ display: 'block', color: '#15803d', fontSize: '0.9rem' }}>
                    OFFICIALLY AUTHENTICATED
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#166534' }}>
                    Active &amp; valid credentials verified in Apna Campus ERP database.
                  </span>
                </div>
              </div>

              {/* Verified Details */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.825rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Card Number:</span>
                  <strong style={{ color: '#0f2b48', fontFamily: 'monospace' }}>{data.cardNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Student Name:</span>
                  <strong style={{ color: '#0f172a' }}>{data.studentName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Registration No:</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{data.registrationNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Department:</span>
                  <span style={{ color: '#0f172a' }}>{data.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Host Organization:</span>
                  <span style={{ color: '#0f172a' }}>{data.company}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Issue Date:</span>
                  <span style={{ color: '#0f172a' }}>{new Date(data.issueDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Status:</span>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                    }}
                  >
                    VALID / ACTIVE
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Revoked or Expired Banner */}
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertTriangle size={28} color="#dc2626" />
                <div>
                  <strong style={{ display: 'block', color: '#991b1b', fontSize: '0.9rem' }}>
                    {data.status === 'REVOKED' ? 'CARD REVOKED BY COLLEGE' : 'CARD EXPIRED'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                    {data.message}
                  </span>
                </div>
              </div>

              {data.cardNumber && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem',
                    fontSize: '0.825rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Card Number:</span>
                    <strong style={{ color: '#0f2b48' }}>{data.cardNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Student Name:</span>
                    <span>{data.studentName}</span>
                  </div>
                  {data.revocationReason && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                      <span>Revocation Reason:</span>
                      <strong>{data.revocationReason}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.65rem',
                background: '#0f2b48',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close Verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
