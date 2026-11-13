import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  QrCode,
  Clock,
  User,
  Building2,
  MapPin,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  LogOut,
  LogIn,
  Key,
} from 'lucide-react';
import dynamicQrService from '../../services/dynamicQrService.js';
import QrSvgRenderer from '../Common/QrSvgRenderer.jsx';

function getRoleMeta(user) {
  const rawRole = (user?.role || user?.identityType || 'STUDENT').toUpperCase();
  const isStudent = rawRole === 'STUDENT';
  const isFaculty = rawRole === 'FACULTY';
  const isSecurity = rawRole === 'SECURITY' || rawRole === 'GUARD';
  const isWarden = rawRole === 'WARDEN' || rawRole === 'HOSTEL' || rawRole === 'HOSTEL_ADMIN';
  const isAdmin = rawRole === 'ADMIN' || rawRole === 'SUPER_ADMIN';

  let roleLabel = rawRole.replace(/_/g, ' ');
  let badgeBg = '#8b5cf6';
  let authorizedZones = 'Campus Main Gate, Turnstiles & Common Areas';
  let defaultDept = 'Administration';

  switch (rawRole) {
    case 'STUDENT':
      badgeBg = '#0284c7';
      roleLabel = 'STUDENT';
      defaultDept = user?.program ? `${user.program} · Computer Science` : 'Computer Science & Engineering';
      authorizedZones = 'Hostel Residences, Academic Blocks, Central Library, Mess Hall & Main Gates';
      break;
    case 'FACULTY':
      badgeBg = '#059669';
      roleLabel = 'FACULTY';
      defaultDept = 'Computer Science & Engineering';
      authorizedZones = 'Academic Buildings, Faculty Chambers, Research Labs, Central Library & All Gates';
      break;
    case 'SECURITY':
    case 'GUARD':
      badgeBg = '#7c3aed';
      roleLabel = 'SECURITY';
      defaultDept = 'Campus Security & Access Control';
      authorizedZones = 'Main Gates 1 & 2, Security Booths, Turnstiles, Surveillance HQ & Perimeter';
      break;
    case 'WARDEN':
    case 'HOSTEL':
    case 'HOSTEL_ADMIN':
      badgeBg = '#e11d48';
      roleLabel = 'WARDEN';
      defaultDept = 'Hostel Administration & Residential Life';
      authorizedZones = 'Hostel Blocks 1–4, Warden Office, Dining Hall & Campus Security Gates';
      break;
    case 'ADMIN':
      badgeBg = '#0f172a';
      roleLabel = 'ADMIN';
      defaultDept = 'General Administration';
      authorizedZones = 'Administrative Complex, Examination Vault, Faculty Chambers & All Gates';
      break;
    case 'SUPER_ADMIN':
      badgeBg = '#0f172a';
      roleLabel = 'SUPER ADMIN';
      defaultDept = 'Enterprise IT & Cyber Governance';
      authorizedZones = 'Full Institutional Clearance — Data Center, Server Rooms, All Buildings & Gates';
      break;
    case 'PRINCIPAL':
      badgeBg = '#9333ea';
      roleLabel = 'PRINCIPAL';
      defaultDept = 'Office of the Principal';
      authorizedZones = 'Executive Headquarters, Academic Senate, Faculty Chambers & All Gates';
      break;
    case 'HOD':
      badgeBg = '#0d9488';
      roleLabel = 'HOD';
      defaultDept = 'Computer Science & Engineering';
      authorizedZones = 'Department Complex, Faculty Suites, Laboratories & Campus Gates';
      break;
    case 'EXAM_CELL':
      badgeBg = '#be123c';
      roleLabel = 'EXAM CELL';
      defaultDept = 'Examination Affairs & Evaluation';
      authorizedZones = 'Confidential Exam Vault, Evaluation Center & Administrative Gates';
      break;
    case 'ACCOUNTS':
    case 'SCHOLARSHIP':
      badgeBg = '#16a34a';
      roleLabel = 'ACCOUNTS';
      defaultDept = 'Finance & Accounts Division';
      authorizedZones = 'Cash & Bursar Counters, Central Accounts Office & Gates';
      break;
    case 'LIBRARY':
      badgeBg = '#0891b2';
      roleLabel = 'LIBRARY';
      defaultDept = 'Central University Library';
      authorizedZones = 'Central Library Stack Rooms, Digital Repository & Turnstiles';
      break;
    case 'TRANSPORT':
      badgeBg = '#d97706';
      roleLabel = 'TRANSPORT';
      defaultDept = 'Transport Logistics & Fleet Division';
      authorizedZones = 'Vehicle Depot, Bus Terminal, Fuel Bay & Campus Gates';
      break;
    case 'MESS_MANAGER':
    case 'MESS':
      badgeBg = '#ea580c';
      roleLabel = 'MESS MANAGER';
      defaultDept = 'Central Dining & Hospitality Services';
      authorizedZones = 'Hostel Kitchens, Dining Halls, Food Storage & Supply Gates';
      break;
    case 'PLACEMENT':
      badgeBg = '#4f46e5';
      roleLabel = 'PLACEMENT';
      defaultDept = 'Corporate Relations & Placement Cell';
      authorizedZones = 'Corporate Interview Suites, Auditorium, Placement Office & Gates';
      break;
    case 'ADMISSIONS':
      badgeBg = '#2563eb';
      roleLabel = 'ADMISSIONS';
      defaultDept = 'Admissions & Outreach Division';
      authorizedZones = 'Visitor Welcome Center, Counseling Halls & Campus Gates';
      break;
    case 'MANAGEMENT':
      badgeBg = '#3b82f6';
      roleLabel = 'MANAGEMENT';
      defaultDept = 'Board of Governors & Institutional Trust';
      authorizedZones = 'Executive Board Room, Guest Suites & All Campus Zones';
      break;
    default:
      badgeBg = '#475569';
      roleLabel = rawRole;
      defaultDept = 'Campus Operations';
      authorizedZones = 'Designated Duty Stations, Operational Offices & Campus Gates';
      break;
  }

  const identifier =
    user?.rollNumber ||
    user?.registrationNumber ||
    user?.identifier ||
    user?.employeeId ||
    user?.employeeCode ||
    user?.id ||
    'N/A';

  const name = user?.name || 'Verified Member';
  const department = user?.department || defaultDept;
  const designation = user?.designation || roleLabel;

  return {
    role: rawRole,
    roleLabel,
    badgeBg,
    isStudent,
    isFaculty,
    isSecurity,
    isWarden,
    isAdmin,
    identifier,
    name,
    department,
    designation,
    authorizedZones,
  };
}

export default function UniversalDigitalIdModal({ isOpen, onClose, user, extraContext = {} }) {
  const [qrState, setQrState] = useState(dynamicQrService.getCurrentState());
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'history' | 'permission'

  const userRef = useRef(user);
  userRef.current = user;
  const userIdKey = user
    ? `${user.id || user.identifier || user.employeeId || user.rollNumber || user.registrationNumber || ''}_${user.role || ''}`
    : '';

  useEffect(() => {
    if (!isOpen || !userIdKey) return;

    const cleanup = dynamicQrService.startLiveSession(userRef.current, (state) => {
      setQrState(state);
    });

    return () => {
      cleanup();
    };
  }, [isOpen, userIdKey]);

  if (!isOpen || !user) return null;

  const meta = getRoleMeta(user);
  const campusStatus = extraContext.campusStatus || 'INSIDE_CAMPUS';

  const remaining = qrState.remainingSecs ?? 10;
  const progressPercent = Math.round((qrState.progressFraction ?? 1) * 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)',
              }}
            >
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                APNA CAMPUS DIGITAL IDENTITY
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Secure 10-Second Dynamic Gate Access
              </span>
            </div>
          </div>

          {/* User Quick Info Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#e2e8f0',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid #0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                fontWeight: 700,
              }}
            >
              {user.avatar || user.photo ? (
                <img src={user.avatar || user.photo} alt={meta.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={24} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {meta.name}
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                    background: meta.badgeBg,
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                  }}
                >
                  {meta.roleLabel}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                {meta.isStudent ? `Regd / Roll No: ${meta.identifier}` : `Employee ID: ${meta.identifier}`} • {meta.department}
                {meta.designation && meta.designation !== meta.roleLabel && (
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>{meta.designation}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('qr')}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              background: activeTab === 'qr' ? '#ffffff' : 'transparent',
              color: activeTab === 'qr' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'qr' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <QrCode size={15} /> Dynamic Pass
          </button>
          <button
            onClick={() => setActiveTab('permission')}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              background: activeTab === 'permission' ? '#ffffff' : 'transparent',
              color: activeTab === 'permission' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'permission' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <Key size={15} /> Access Status
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              background: activeTab === 'history' ? '#ffffff' : 'transparent',
              color: activeTab === 'history' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'history' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={15} /> Gate History
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'qr' && (
            <div style={{ textAlign: 'center' }}>
              {/* QR Container */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '1rem',
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  marginBottom: '1rem',
                  transition: 'border-color 0.3s ease',
                  borderColor: remaining <= 2 ? '#f43f5e' : '#e2e8f0',
                }}
              >
                <QrSvgRenderer value={qrState.token || ''} size={190} />
              </div>

              {/* 10-Second Countdown Meter */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color={remaining <= 3 ? '#e11d48' : '#0284c7'} /> Validity Countdown
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <RefreshCw
                      size={12}
                      className={remaining <= 2 ? 'spin' : ''}
                      color={remaining <= 3 ? '#e11d48' : '#0284c7'}
                      style={{ opacity: 0.8 }}
                    />
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        color: remaining <= 3 ? '#e11d48' : '#0284c7',
                        fontFamily: 'monospace',
                      }}
                    >
                      {remaining}s remaining
                    </span>
                  </div>
                </div>

                {/* Live progress bar */}
                <div
                  style={{
                    height: '8px',
                    width: '100%',
                    background: '#e2e8f0',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background:
                        remaining <= 3
                          ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                          : 'linear-gradient(90deg, #0284c7, #2563eb)',
                      borderRadius: '999px',
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#64748b',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <ShieldCheck size={13} color="#10b981" />
                  <span>Strict 10s single-use cryptographic token • Auto-rotates without refresh</span>
                </div>
              </div>

              {/* Security Policy Reminder */}
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Present this screen directly to the security guard's optical scanner.
                Screenshots scanned after expiration are rejected.
              </p>
            </div>
          )}

          {activeTab === 'permission' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                }}
              >
                <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d' }}>
                    Account Active & Gate Access Authorized
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.15rem' }}>
                    Institutional credentials verified. Identity status is clear for gate passage.
                  </div>
                </div>
              </div>

              {/* Current Campus Location Status */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.85rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Current Campus Movement Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: campusStatus === 'INSIDE_CAMPUS' ? '#10b981' : '#f59e0b',
                    }}
                  />
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                    {campusStatus === 'INSIDE_CAMPUS'
                      ? 'Inside Main Campus'
                      : campusStatus === 'AT_HOSTEL'
                      ? 'At Hostel Residence'
                      : 'Outside Campus (On Outpass)'}
                  </strong>
                </div>
              </div>

              {/* Authorized Campus Zones */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.85rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Authorized Clearance Zones
                </div>
                <div style={{ marginTop: '0.35rem', fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.45 }}>
                  {meta.authorizedZones}
                </div>
              </div>

              {/* Leave / Gate Pass Context for Students */}
              {meta.isStudent && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Approved Movement Pass
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#1e293b' }}>
                    <div><strong>Pass Type:</strong> Day-Out (Routine Outpass)</div>
                    <div><strong>Destination:</strong> Central City Library</div>
                    <div><strong>Curfew / Expected In:</strong> 20:00 Today</div>
                    <div><strong>Approval Authority:</strong> Mr. Saroj Kumar Jena (Hostel Warden)</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, marginBottom: '0.6rem' }}>
                Recent Gate Movement Records
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LogIn size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                        Campus Entry Recorded
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Main Campus Gate 1 • Turnstile A
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b' }}>
                    08:15 AM Today
                  </div>
                </div>

                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#fef3c7',
                        color: '#b45309',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LogOut size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                        Campus Exit Recorded
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Main Campus Gate 1 • Optical Gate
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b' }}>
                    Yesterday, 18:30
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            ID: {meta.identifier} • Apna Campus v2.5
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Identity Card
          </button>
        </div>
      </div>
    </div>
  );
}

