import React, { useState } from 'react';
import {
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  X,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../services/api.js';

export default function ForgotPasswordModal({
  isOpen = true,
  initialIdentifier = '',
  onClose,
  onResetSuccess,
}) {
  const [identifier, setIdentifier] = useState(initialIdentifier || '');
  const [step, setStep] = useState(1); // 1 = Request token, 2 = Enter new password
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const [successDone, setSuccessDone] = useState(false);

  if (!isOpen) return null;

  async function handleRequestToken(e) {
    if (e) e.preventDefault();
    setError('');
    setStatusNotice('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your Student ID, Roll Number, or registered Email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(cleanId);
      if (res && res.success) {
        setStatusNotice(res.message || 'Password reset token has been issued.');
        if (res.debugToken) {
          setToken(res.debugToken);
        }
        setStep(2);
      } else {
        setError(res?.message || 'Unable to find an active account matching that identifier.');
      }
    } catch (err) {
      setError(err?.message || 'Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanToken = token.trim();
    if (!cleanToken) {
      setError('Please enter the 24-character reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and retype.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.resetPassword(cleanToken, newPassword);
      if (res && res.success) {
        setSuccessDone(true);
        if (onResetSuccess) {
          onResetSuccess(identifier, newPassword);
        }
      } else {
        setError(res?.message || 'Password reset failed. Token may have expired.');
      }
    } catch (err) {
      setError(err?.message || 'Error updating password. The token may be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              }}
            >
              <KeyRound size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Reset Account Password
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Apna Campus Smart ERP Self-Service Password Recovery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* Default Credentials Guidance Note */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px',
              display: 'flex',
              gap: '10px',
            }}
          >
            <Sparkles size={20} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.45 }}>
              <strong>New Student or First-Time Login?</strong>
              <div style={{ marginTop: '3px' }}>
                Newly registered candidates already have an initial default password:
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  margin: '4px 0',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: '#15803d',
                }}
              >
                Student@2026
              </div>
              <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                Use this with your <strong>Student ID</strong> (e.g., <code>AC-2026-1019</code>) or <strong>Roll No</strong> (e.g., <code>26CSE019</code>) directly on the login screen without resetting.
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#991b1b',
                fontSize: '0.82rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {statusNotice && !error && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1e40af',
                fontSize: '0.82rem',
              }}
            >
              <CheckCircle2 size={16} color="#2563eb" style={{ flexShrink: 0 }} />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {successDone ? (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                Password Updated Successfully!
              </h3>
              <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '0.86rem', lineHeight: 1.5 }}>
                Your account credentials have been securely updated. You can now sign in with your updated password.
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px 24px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Sign In Now <ArrowRight size={16} />
              </button>
            </div>
          ) : step === 1 ? (
            /* STEP 1: IDENTIFIER SUBMISSION */
            <form onSubmit={handleRequestToken} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Enter Your College ID, Roll No, or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      display: 'flex',
                    }}
                  >
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. AC-2026-1019, 26CSE019, or student@apnacampus.edu.in"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 38px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>
                <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '0.74rem' }}>
                  Enter the Student ID or Roll Number mentioned on your Admission Letter.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {isLoading ? 'Generating Token...' : 'Next: Request Reset Token'}
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: ENTER RESET TOKEN & SET NEW PASSWORD */
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  24-Character Reset Token
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste 24-character hex token"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontFamily: 'monospace',
                      color: '#0f172a',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <small style={{ display: 'block', marginTop: '4px', color: '#16a34a', fontSize: '0.72rem' }}>
                  ✓ In Campus Test Mode, your reset token has been auto-filled.
                </small>
              </div>

              {/* New Password */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype new password"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {isLoading ? 'Updating Password...' : 'Save New Password'}
                  <ShieldCheck size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

