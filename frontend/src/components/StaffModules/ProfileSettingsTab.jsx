import React, { useState } from 'react';
import {
  User,
  Bell,
  Settings,
  HelpCircle,
  Shield,
  Building2,
  Mail,
  Phone,
  Clock,
  Briefcase,
  CheckCircle,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  Volume2,
  Sliders
} from 'lucide-react';
import { labStaffStore } from '../../services/labStaffStore.js';
import { BRANCHES_CONFIG } from './labStaffData.js';

export default function ProfileSettingsTab({
  subTab = 'profile',
  profile,
  currentBranch,
  notifications = [],
  onSuccessToast,
  onSwitchBranch
}) {
  const [activeSubTab, setActiveSubTab] = useState(subTab);
  const [preferences, setPreferences] = useState(() => labStaffStore.getPreferences());
  const [notifFilter, setNotifFilter] = useState('ALL');

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleTogglePreference = (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    labStaffStore.updatePreferences(updated);
    onSuccessToast?.('Preferences saved to local storage!');
  };

  const handleMarkRead = (id) => {
    labStaffStore.markNotificationRead(id);
  };

  const handleMarkAllRead = () => {
    labStaffStore.markAllNotificationsRead();
    onSuccessToast?.('All notifications marked as read.');
  };

  const handleResetData = () => {
    if (confirm('Reset demonstration laboratory data back to factory defaults? All newly created records in local storage will be refreshed.')) {
      labStaffStore.resetToDefault();
      onSuccessToast?.('Lab Staff Portal data reset to factory demonstration baseline!');
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (notifFilter === 'UNREAD') return n.unread;
    if (notifFilter !== 'ALL') return n.category === notifFilter;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'profile' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'profile' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'profile' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <User size={16} /> Staff Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'notifications' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'notifications' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'notifications' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Bell size={16} /> Notification Center {unreadCount > 0 && `(${unreadCount})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'settings' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'settings' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'settings' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Settings size={16} /> Portal Preferences
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('help')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'help' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'help' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'help' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <HelpCircle size={16} /> SOPs &amp; Safety Manual
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. STAFF PROFILE */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
        }}>
          {/* Header Card */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800
              }}>
                BS
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    {profile.name}
                  </h3>
                  <span style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    ● {profile.employmentStatus}
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.88rem', color: '#475569' }}>
                  {profile.designation} · Staff ID: <strong>{profile.staffId}</strong>
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px', textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>DEMONSTRATION ROLE</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>{profile.role}</div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            fontSize: '0.86rem'
          }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>DEPARTMENT &amp; CADRE</div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{BRANCHES_CONFIG[profile.department]?.name || profile.department}</div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>Qualification: {profile.qualification}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>OFFICE CABIN &amp; SHIFT</div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{profile.officeRoom}</div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>Shift: {profile.shift}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>REPORTING LAB IN-CHARGE</div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{profile.reportingInCharge}</div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>Department of Computer Science &amp; Engineering</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CONTACT CHANNELS</div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{profile.email}</div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>Intercom / Phone: {profile.phone}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NOTIFICATIONS CENTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'notifications' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Laboratory Alerts &amp; Notification Center
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Upcoming sessions, calibration deadlines, low-stock warnings, and safety reminders.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Mark All as Read
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredNotifs.map(n => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: n.unread ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                  background: n.unread ? '#f0f9ff' : '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: n.unread ? '#2563eb' : '#cbd5e1',
                    marginTop: '6px'
                  }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: n.priority === 'Critical' ? '#fee2e2' : '#f1f5f9',
                        color: n.priority === 'Critical' ? '#b91c1c' : '#475569'
                      }}>
                        {n.category}
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{n.title}</strong>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#475569' }}>
                      {n.message}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SETTINGS & PREFERENCES */}
      {/* ========================================================================= */}
      {activeSubTab === 'settings' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Laboratory Staff Portal Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Audio Alert on Safety &amp; Breakdown Incidents</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Plays gentle acoustic chime when critical equipment or safety warnings fire.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.alertSound}
                onChange={() => handleTogglePreference('alertSound')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Auto-Refresh Real-Time Timetable Feeds</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Synchronize active bench roster counts with other faculty portals.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoRefresh}
                onChange={() => handleTogglePreference('autoRefresh')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Factory Reset Demonstration Data */}
            <div style={{
              marginTop: '16px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong style={{ color: '#dc2626', fontSize: '0.88rem' }}>Reset Demonstration Data Store</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Clears local storage state and restores pre-seeded demo records for all 10 branches.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={15} /> Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HELP & DOCUMENTATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'help' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Laboratory Standard Operating Procedures (SOPs) &amp; Safety Guidelines
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>SOP-01: Laboratory Opening &amp; Power On</div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                1. Obtain master key from Department Secretariat Key Safe.<br />
                2. Unseal main door; verify emergency exit pathways are unblocked.<br />
                3. Switch on secondary UPS battery main breaker before laboratory branch circuits.<br />
                4. Verify ambient temperature (&lt; 22°C for servers, &lt; 25°C for general labs).
              </p>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>SOP-02: Chemical &amp; Fume Hood Protocol</div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                1. Always wear lab coat, nitrile gloves, and splash goggles.<br />
                2. Turn on fume hood exhaust damper 5 minutes before handling concentrated acids.<br />
                3. Dilute acid by pouring ACID INTO WATER slowly, NEVER water into acid.<br />
                4. Dispose of chemical effluent into designated neutralized neutralizing sinks.
              </p>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>SOP-03: Machine Workshop &amp; Lathe Safety</div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                1. Chuck keys MUST be removed immediately after tightening workpiece.<br />
                2. No loose clothing, scarves, ties, rings, or dangling jewellery.<br />
                3. Emergency foot brake must be tested before engaging power feed.<br />
                4. Use brass swarf hook to clean metal chips; never use bare hands.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
