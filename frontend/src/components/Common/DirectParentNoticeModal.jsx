import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
  CreditCard,
  FileText,
  Smartphone,
  ExternalLink,
  History,
  Copy
} from 'lucide-react';
import {
  getStudentComprehensiveDetails,
  generateParentNoticeTemplates,
  dispatchParentNotice,
  getParentNoticesForStudent
} from '../../services/parentNoticeService.js';

export default function DirectParentNoticeModal({
  isOpen,
  onClose,
  student,
  sender = { name: 'Faculty Advisor', role: 'Faculty', deptCode: 'CSE' },
  initialNoticeType = null,
  onNoticeSent
}) {
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' or 'history'
  const [noticeType, setNoticeType] = useState('ATTENDANCE_CRITICAL');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    portal: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(null);
  const [noticeHistory, setNoticeHistory] = useState([]);
  const [copiedText, setCopiedText] = useState(false);

  const studentDetails = student ? getStudentComprehensiveDetails(student) : null;

  // Auto-select most pressing notice type based on student metrics
  useEffect(() => {
    if (!studentDetails) return;
    const isCritAtt = studentDetails.isCriticalShortage; // < 50%
    const isHighFee = studentDetails.fees?.hasHighDues; // >= 25,000

    if (initialNoticeType) {
      setNoticeType(initialNoticeType);
    } else if (isCritAtt && isHighFee) {
      setNoticeType('DUAL_CRITICAL');
    } else if (isCritAtt) {
      setNoticeType('ATTENDANCE_CRITICAL');
    } else if (isHighFee) {
      setNoticeType('HIGH_FEES_DUE');
    } else {
      setNoticeType('ATTENDANCE_CRITICAL');
    }
  }, [student, initialNoticeType]);

  // Load notice history for this student
  useEffect(() => {
    if (studentDetails) {
      const history = getParentNoticesForStudent(studentDetails.studentId || studentDetails.rollNumber);
      setNoticeHistory(history);
    }
  }, [studentDetails, sentSuccess]);

  // Populate title & message when noticeType changes
  useEffect(() => {
    if (!studentDetails) return;
    const templates = generateParentNoticeTemplates(studentDetails, sender);
    const selected = templates[noticeType] || templates.ATTENDANCE_CRITICAL;
    setCustomTitle(selected.title);
    setCustomMessage(selected.message);
    setSentSuccess(null);
  }, [noticeType, studentDetails, sender]);

  if (!isOpen || !studentDetails) return null;

  const templates = generateParentNoticeTemplates(studentDetails, sender);

  const handleToggleChannel = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendNotice = () => {
    if (!customMessage.trim()) return;
    setIsSubmitting(true);

    const activeChannels = [];
    if (channels.sms) activeChannels.push('SMS');
    if (channels.whatsapp) activeChannels.push('WhatsApp');
    if (channels.email) activeChannels.push('Email');
    if (channels.portal) activeChannels.push('Student Portal');

    setTimeout(() => {
      const result = dispatchParentNotice({
        student: studentDetails,
        sender,
        noticeType,
        title: customTitle,
        message: customMessage,
        channels: activeChannels,
      });

      setIsSubmitting(false);
      setSentSuccess(result);
      if (onNoticeSent) {
        onNoticeSent(result);
      }
    }, 600);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div
      className="admin-modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
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
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '16px 22px',
            background: studentDetails.isCriticalShortage
              ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
              : studentDetails.fees?.hasHighDues
              ? 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Direct Parent Warning &amp; Notice Gateway
                </h3>
                {studentDetails.isCriticalShortage && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Attendance &lt; 50%
                  </span>
                )}
                {studentDetails.fees?.hasHighDues && (
                  <span
                    style={{
                      background: '#ea580c',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    High Dues
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                Official institutional multi-channel dispatch (SMS, WhatsApp, Email) with delivery tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* STUDENT & PARENT SUMMARY DOSSIER STRIP */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '12px 22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            fontSize: '0.8rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Student</span>
            <div style={{ fontWeight: 800, color: '#0f172a' }}>{studentDetails.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Roll <strong>#{studentDetails.rollNumber}</strong> · <code>{studentDetails.registrationNumber || studentDetails.studentId}</code>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Parent / Guardian</span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{studentDetails.parent?.fatherName || 'Guardian'}</div>
            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
              📞 {studentDetails.parent?.phone}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Attendance Record</span>
            <div
              style={{
                fontWeight: 800,
                fontSize: '0.95rem',
                color: studentDetails.isCriticalShortage
                  ? '#dc2626'
                  : studentDetails.isShortage
                  ? '#d97706'
                  : '#059669'
              }}
            >
              {studentDetails.attendance}%
              <span style={{ fontSize: '0.72rem', fontWeight: 600, marginLeft: '6px', color: '#475569' }}>
                ({studentDetails.attendedLectures}/{studentDetails.totalLectures} L)
              </span>
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: studentDetails.isCriticalShortage ? '#dc2626' : '#64748b'
              }}
            >
              {studentDetails.attendanceStatus}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Fee Clearance</span>
            <div
              style={{
                fontWeight: 800,
                fontSize: '0.95rem',
                color: studentDetails.fees?.hasHighDues ? '#dc2626' : studentDetails.fees?.dueFees > 0 ? '#d97706' : '#059669'
              }}
            >
              ₹{Number(studentDetails.fees?.dueFees || 0).toLocaleString('en-IN')} Due
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Paid: ₹{Number(studentDetails.fees?.paidFees || 0).toLocaleString('en-IN')} / ₹1,15,000
            </div>
          </div>
        </div>

        {/* MODAL NAVIGATION TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 22px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            style={{
              padding: '10px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'compose' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'compose' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={14} /> Compose Official Notice
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '10px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'history' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'history' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={14} /> Dispatched Notice History ({noticeHistory.length})
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, maxHeight: '62vh' }}>
          {activeTab === 'compose' ? (
            <div>
              {/* SUCCESS CONFIRMATION BANNER */}
              {sentSuccess && (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '16px',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                      Notice Successfully Transmitted to Parent!
                    </div>
                    <p style={{ margin: '3px 0 6px', fontSize: '0.78rem', color: '#047857' }}>
                      Official notice Ref <strong>{sentSuccess.id}</strong> dispatched to{' '}
                      <strong>{sentSuccess.parentName}</strong> ({sentSuccess.parentPhone}) via{' '}
                      <strong>{sentSuccess.channels.join(', ')}</strong>. A delivery copy has been placed in the student's portal.
                    </p>
                    <div style={{ fontSize: '0.72rem', color: '#065f46', display: 'flex', gap: '16px' }}>
                      <span>Status: <strong style={{ color: '#059669' }}>DELIVERED</strong></span>
                      <span>Time: <strong>{sentSuccess.formattedDate}</strong></span>
                      <span>Sender: <strong>{sentSuccess.sentBy}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTICE TYPE SELECTOR PILLS */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Select Notice Category &amp; Formal Template:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.values(templates).map((tpl) => {
                    const isSelected = noticeType === tpl.key;
                    const isCritAtt = tpl.key === 'ATTENDANCE_CRITICAL' && studentDetails.isCriticalShortage;
                    const isHighFee = tpl.key === 'HIGH_FEES_DUE' && studentDetails.fees?.hasHighDues;
                    const isCombo = tpl.key === 'DUAL_CRITICAL' && (studentDetails.isCriticalShortage && studentDetails.fees?.hasHighDues);

                    return (
                      <button
                        key={tpl.key}
                        type="button"
                        onClick={() => setNoticeType(tpl.key)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: isSelected
                            ? '#eff6ff'
                            : (isCritAtt || isCombo)
                            ? '#fef2f2'
                            : isHighFee
                            ? '#fff7ed'
                            : '#ffffff',
                          color: isSelected
                            ? '#1d4ed8'
                            : (isCritAtt || isCombo)
                            ? '#b91c1c'
                            : isHighFee
                            ? '#c2410c'
                            : '#475569',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {tpl.label}
                        {(isCritAtt || isHighFee || isCombo) && (
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isCritAtt || isCombo ? '#dc2626' : '#ea580c'
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CRITICAL WARNING ADVISORY */}
              {studentDetails.isCriticalShortage && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#991b1b',
                    fontSize: '0.8rem'
                  }}
                >
                  <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Mandatory University Debarment Alert:</strong> Current attendance of{' '}
                    <strong>{studentDetails.attendance}%</strong> triggers statutory university exam detention.
                    Institutional policy requires written parent notice and parent appearance.
                  </div>
                </div>
              )}

              {/* NOTICE TITLE INPUT */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Notice Title / Subject Line
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#0f172a'
                  }}
                />
              </div>

              {/* FORMAL MESSAGE BODY COMPOSER */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155' }}>
                    Official Notice Message Text (Pre-Formatted with Student Specifics):
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedText ? '#059669' : '#2563eb',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Copy size={12} /> {copiedText ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    color: '#1e293b',
                    lineHeight: '1.5',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>Sender Signature: <strong>{sender.name} ({sender.role}), Dept of {sender.deptCode || 'CSE'}</strong></span>
                  <span>{customMessage.length} characters</span>
                </div>
              </div>

              {/* DISPATCH CHANNELS CHECKBOXES */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  Transmit Via Integrated Communication Gateways:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={() => handleToggleChannel('sms')}
                      style={{ accentColor: '#2563eb', width: '16px', height: '16px' }}
                    />
                    <span>
                      <strong>SMS Gateway</strong>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '0.68rem' }}>{studentDetails.parent?.phone}</small>
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={channels.whatsapp}
                      onChange={() => handleToggleChannel('whatsapp')}
                      style={{ accentColor: '#16a34a', width: '16px', height: '16px' }}
                    />
                    <span>
                      <strong style={{ color: '#16a34a' }}>WhatsApp Notice</strong>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '0.68rem' }}>Direct Instant Push</small>
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={() => handleToggleChannel('email')}
                      style={{ accentColor: '#2563eb', width: '16px', height: '16px' }}
                    />
                    <span>
                      <strong>Official Email</strong>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '0.68rem' }}>{studentDetails.parent?.email}</small>
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={channels.portal}
                      onChange={() => handleToggleChannel('portal')}
                      style={{ accentColor: '#9333ea', width: '16px', height: '16px' }}
                    />
                    <span>
                      <strong style={{ color: '#7e22ce' }}>Student Portal</strong>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '0.68rem' }}>Urgent Dashboard Banner</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* DISPATCHED NOTICE HISTORY TAB */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a' }}>
                  Historical Parent Communications for {studentDetails.name}
                </h4>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Total Dispatched: <strong>{noticeHistory.length}</strong>
                </span>
              </div>

              {noticeHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>
                  <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No past warning notices logged for this student.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {noticeHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        background: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                background: item.noticeType.includes('ATTENDANCE')
                                  ? '#fee2e2'
                                  : item.noticeType.includes('FEE')
                                  ? '#ffedd5'
                                  : '#eff6ff',
                                color: item.noticeType.includes('ATTENDANCE')
                                  ? '#b91c1c'
                                  : item.noticeType.includes('FEE')
                                  ? '#c2410c'
                                  : '#1d4ed8',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              {item.id} · {item.noticeType}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                              {item.title}
                            </span>
                          </div>
                          <small style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>
                            Dispatched by <strong>{item.sentBy}</strong> on {item.formattedDate}
                          </small>
                        </div>
                        <span
                          style={{
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 800
                          }}
                        >
                          ✓ DELIVERED
                        </span>
                      </div>

                      <p style={{ margin: '6px 0', fontSize: '0.8rem', color: '#334155', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', lineHeight: 1.45 }}>
                        "{item.message}"
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                        <span>Recipient: <strong>{item.parentName}</strong> ({item.parentPhone})</span>
                        <span>Channels: <strong>{item.channels.join(' · ')}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Recipient: <strong>{studentDetails.parent?.fatherName}</strong> ({studentDetails.parent?.phone})
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="admin-action-btn-secondary"
              onClick={onClose}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              Close
            </button>
            {activeTab === 'compose' && (
              <button
                type="button"
                className="admin-action-btn-primary"
                onClick={handleSendNotice}
                disabled={isSubmitting || !customMessage.trim()}
                style={{
                  padding: '6px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: studentDetails.isCriticalShortage
                    ? '#dc2626'
                    : studentDetails.fees?.hasHighDues
                    ? '#ea580c'
                    : '#2563eb'
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Transmitting Notice…
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Official Parent Notice
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
