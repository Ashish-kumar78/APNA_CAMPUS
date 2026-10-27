import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Trash2,
  X,
  Search,
  Filter,
  Sparkles,
  Paperclip,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Info,
  Calendar,
  BookOpen,
  CreditCard,
  Building2,
  Briefcase,
  Layers,
  RotateCcw,
  Check,
  Download,
  FileText,
  Volume2
} from 'lucide-react';
import { notificationsStore, normalizeRole } from '../../services/notificationsStore.js';
import OfficialCollegeNoticeModal, { GIFT_MODULAR_TEST_2_NOTICE } from '../ExaminationCell/OfficialCollegeNoticeModal.jsx';
import './NotificationDrawer.css';

export default function NotificationDrawer({
  isOpen,
  onClose,
  account,
  onNavigateTab
}) {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'URGENT' | 'ACADEMIC' | 'SYSTEM'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showOfficialNoticeModal, setShowOfficialNoticeModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const roleKey = normalizeRole(account?.role);
  const roleDisplay = roleKey.replace(/_/g, ' ').toUpperCase();

  // Load and subscribe to store notifications
  const reloadNotifications = () => {
    if (!account) return;
    const list = notificationsStore.getNotifications(account);
    setNotifications(list);
  };

  useEffect(() => {
    reloadNotifications();
    const unsubscribe = notificationsStore.subscribe(() => {
      reloadNotifications();
    });
    return () => unsubscribe();
  }, [account]);

  // Handle escape key to close drawer or modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (selectedNotif) {
          setSelectedNotif(null);
        } else if (isOpen) {
          onClose();
        }
      }
    }
    if (isOpen || selectedNotif) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, selectedNotif, onClose]);

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Actions
  const handleMarkAsRead = (id, e) => {
    if (e) e.stopPropagation();
    notificationsStore.markAsRead(id, account, true);
    showToast('Notification marked as read');
  };

  const handleToggleRead = (id, currentUnread, e) => {
    if (e) e.stopPropagation();
    notificationsStore.markAsRead(id, account, !currentUnread);
  };

  const handleMarkAllRead = () => {
    notificationsStore.markAllAsRead(account);
    showToast('All notifications marked as read');
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    notificationsStore.deleteNotification(id, account);
    if (selectedNotif?.id === id) setSelectedNotif(null);
    showToast('Notification dismissed');
  };

  const handleClearRead = () => {
    notificationsStore.clearAllRead(account);
    showToast('Cleared all read notifications');
  };

  const handleSendTestAlert = () => {
    notificationsStore.sendTestAlert(account);
    showToast('Live test notification dispatched with chime!');
  };

  const handleCardClick = (notif) => {
    setSelectedNotif(notif);
    if (notif.unread) {
      notificationsStore.markAsRead(notif.id, account, true);
    }
  };

  const handleActionNavigate = (actionTab, actionUrl) => {
    setSelectedNotif(null);
    onClose();
    if (actionUrl && actionUrl.startsWith('/')) {
      if (typeof window !== 'undefined' && window.location.pathname !== actionUrl) {
        window.history.pushState({}, '', actionUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    if (actionTab && onNavigateTab) {
      onNavigateTab(actionTab);
    }
  };


  // Filter calculations
  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);
  const urgentCount = useMemo(() => notifications.filter(n => n.priority === 'URGENT').length, [notifications]);

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Tab filter
    if (activeFilter === 'UNREAD') {
      result = result.filter(n => n.unread);
    } else if (activeFilter === 'URGENT') {
      result = result.filter(n => n.priority === 'URGENT' || n.priority === 'IMPORTANT');
    } else if (activeFilter === 'ACADEMIC') {
      result = result.filter(n => ['EXAMINATION', 'ACADEMIC', 'ASSIGNMENT', 'EVALUATION', 'SCRUTINY'].includes(n.category));
    } else if (activeFilter === 'SYSTEM') {
      result = result.filter(n => ['SYSTEM', 'SECURITY', 'BACKUP', 'RBAC', 'OPERATIONS', 'GOVERNANCE'].includes(n.category));
    }

    // Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.message && n.message.toLowerCase().includes(q)) ||
        (n.senderName && n.senderName.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [notifications, activeFilter, searchQuery]);

  // Relative time formatter
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Category Icon helper
  const renderCategoryIcon = (category) => {
    switch (category) {
      case 'EXAMINATION':
      case 'EVALUATION':
      case 'SCRUTINY':
        return <Calendar size={13} />;
      case 'ACADEMIC':
      case 'ASSIGNMENT':
        return <BookOpen size={13} />;
      case 'FEES':
      case 'COLLECTION':
      case 'PAYROLL':
      case 'BUDGET':
        return <CreditCard size={13} />;
      case 'PLACEMENT':
      case 'DRIVES':
      case 'SHORTLISTS':
        return <Briefcase size={13} />;
      case 'SECURITY':
      case 'SYSTEM':
      case 'BACKUP':
      case 'RBAC':
        return <ShieldAlert size={13} />;
      default:
        return <Layers size={13} />;
    }
  };

  if (!isOpen && !selectedNotif) return null;

  return (
    <>
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="apna-notif-toast" role="status" aria-live="polite">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="apna-notif-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <aside
        className={`apna-notif-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apna-notif-heading"
      >
        {/* Drawer Header */}
        <div className="apna-notif-drawer-header">
          <div className="apna-notif-header-info">
            <div className="apna-notif-title-row">
              <span className="apna-notif-bell-icon-wrap">
                <BellRing size={18} className="apna-bell-pulse" />
              </span>
              <div>
                <h2 id="apna-notif-heading" className="apna-notif-title">
                  Institutional Notifications
                </h2>
                <div className="apna-notif-sub-badge">
                  <span className="role-tag">{roleDisplay} SCOPE</span>
                  <span className="bullet">•</span>
                  <span>NAAC A++ AUTONOMOUS CAMPUS</span>
                </div>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="apna-unread-counter-pill">
                {unreadCount} unread
              </span>
            )}
          </div>

          <button
            type="button"
            className="apna-notif-close-btn"
            onClick={onClose}
            aria-label="Close notifications drawer"
            title="Close Drawer (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="apna-notif-toolbar">
          <button
            type="button"
            className="apna-toolbar-btn test-btn"
            onClick={handleSendTestAlert}
            title="Simulate live notification with audio chime"
          >
            <Sparkles size={13} />
            <span>Send Test Alert</span>
          </button>

          <div className="apna-toolbar-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="apna-toolbar-btn"
                onClick={handleMarkAllRead}
                title="Mark all notifications as read"
              >
                <CheckCheck size={13} />
                <span>Mark All Read</span>
              </button>
            )}

            {notifications.length > unreadCount && (
              <button
                type="button"
                className="apna-toolbar-btn muted"
                onClick={handleClearRead}
                title="Clear read notifications"
              >
                <RotateCcw size={12} />
                <span>Clear Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="apna-notif-tabs-bar" role="tablist">
          <button
            type="button"
            className={`apna-tab-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
            role="tab"
            aria-selected={activeFilter === 'ALL'}
          >
            All ({notifications.length})
          </button>

          <button
            type="button"
            className={`apna-tab-pill ${activeFilter === 'UNREAD' ? 'active' : ''}`}
            onClick={() => setActiveFilter('UNREAD')}
            role="tab"
            aria-selected={activeFilter === 'UNREAD'}
          >
            Unread ({unreadCount})
          </button>

          <button
            type="button"
            className={`apna-tab-pill ${activeFilter === 'URGENT' ? 'active' : ''}`}
            onClick={() => setActiveFilter('URGENT')}
            role="tab"
            aria-selected={activeFilter === 'URGENT'}
          >
            Urgent ({urgentCount})
          </button>

          <button
            type="button"
            className={`apna-tab-pill ${activeFilter === 'ACADEMIC' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ACADEMIC')}
            role="tab"
            aria-selected={activeFilter === 'ACADEMIC'}
          >
            Academic
          </button>

          <button
            type="button"
            className={`apna-tab-pill ${activeFilter === 'SYSTEM' ? 'active' : ''}`}
            onClick={() => setActiveFilter('SYSTEM')}
            role="tab"
            aria-selected={activeFilter === 'SYSTEM'}
          >
            System
          </button>
        </div>

        {/* Search Bar */}
        <div className="apna-notif-search-wrap">
          <Search size={14} className="apna-search-icon" />
          <input
            type="text"
            className="apna-notif-search-input"
            placeholder="Search circulars, exams, sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search notifications"
          />
          {searchQuery && (
            <button
              type="button"
              className="apna-search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Notification Cards List */}
        <div className="apna-notif-list-body" tabIndex={0}>
          {filteredNotifications.length === 0 ? (
            <div className="apna-notif-empty-state">
              <div className="apna-empty-icon-circle">
                <Bell size={32} />
              </div>
              <h3>No Notifications Found</h3>
              <p>
                {searchQuery
                  ? 'No notifications match your search query.'
                  : activeFilter === 'UNREAD'
                  ? 'All institutional notifications have been read.'
                  : 'You are all caught up with campus announcements.'}
              </p>
              <button
                type="button"
                className="apna-empty-action-btn"
                onClick={handleSendTestAlert}
              >
                <Sparkles size={14} /> Send Sample Test Notice
              </button>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUrgent = notif.priority === 'URGENT';
              const isImportant = notif.priority === 'IMPORTANT';

              return (
                <article
                  key={notif.id}
                  className={`apna-notif-card ${notif.unread ? 'unread' : 'read'} ${
                    isUrgent ? 'priority-urgent' : isImportant ? 'priority-important' : ''
                  }`}
                  onClick={() => handleCardClick(notif)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${notif.title} - ${notif.unread ? 'Unread' : 'Read'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(notif);
                    }
                  }}
                >
                  {/* Left Indicator & Tags */}
                  <div className="apna-card-top-row">
                    <div className="apna-card-tags">
                      <span className={`apna-cat-badge ${notif.category?.toLowerCase() || 'general'}`}>
                        {renderCategoryIcon(notif.category)}
                        <span>{notif.category?.replace(/_/g, ' ') || 'ANNOUNCEMENT'}</span>
                      </span>

                      {isUrgent && (
                        <span className="apna-priority-pill urgent">
                          <span className="pulse-dot" />
                          URGENT
                        </span>
                      )}

                      {isImportant && !isUrgent && (
                        <span className="apna-priority-pill important">
                          IMPORTANT
                        </span>
                      )}
                    </div>

                    <div className="apna-card-actions-quick" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={`apna-card-action-icon-btn ${notif.unread ? 'is-unread' : 'is-read'}`}
                        onClick={(e) => handleToggleRead(notif.id, notif.unread, e)}
                        title={notif.unread ? 'Mark as read' : 'Mark as unread'}
                        aria-label={notif.unread ? 'Mark as read' : 'Mark as unread'}
                      >
                        <Check size={13} />
                      </button>

                      <button
                        type="button"
                        className="apna-card-action-icon-btn delete"
                        onClick={(e) => handleDelete(notif.id, e)}
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card Title */}
                  <h4 className="apna-card-title">{notif.title}</h4>

                  {/* Card Excerpt */}
                  <p className="apna-card-excerpt">{notif.message}</p>

                  {/* Attachment Pill (if any) */}
                  {notif.attachmentName && (
                    <div className="apna-card-attachment-pill">
                      <Paperclip size={12} />
                      <span>{notif.attachmentName}</span>
                    </div>
                  )}

                  {/* Sender & Timestamp Footer */}
                  <div className="apna-card-footer">
                    <div className="apna-card-sender-meta">
                      <span className="apna-sender-name">{notif.senderName}</span>
                      {notif.senderDept && (
                        <span className="apna-sender-dept">• {notif.senderDept}</span>
                      )}
                    </div>

                    <div className="apna-card-time">
                      <Clock size={11} />
                      <span>{formatTimeAgo(notif.timestamp)}</span>
                    </div>
                  </div>

                  {/* Unread indicator dot */}
                  {notif.unread && <span className="apna-card-unread-dot" aria-hidden="true" />}
                </article>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="apna-notif-drawer-footer">
          <div className="apna-footer-brand">
            <img src="/logo.png" alt="Apna Campus" className="apna-footer-logo" />
            <div>
              <strong>APNA CAMPUS ENTERPRISE NOTIFICATION ENGINE</strong>
              <small>End-to-End Cryptographically Audited Broadcasts</small>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          NOTIFICATION DETAIL INSPECTION MODAL
         ========================================================================= */}
      {selectedNotif && (
        <div
          className="apna-notif-modal-backdrop"
          onClick={() => setSelectedNotif(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apna-modal-title"
        >
          <div
            className="apna-notif-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="apna-modal-header">
              <div className="apna-modal-badge-row">
                <span className={`apna-cat-badge ${selectedNotif.category?.toLowerCase() || 'general'}`}>
                  {renderCategoryIcon(selectedNotif.category)}
                  <span>{selectedNotif.category?.replace(/_/g, ' ') || 'OFFICIAL CIRCULAR'}</span>
                </span>

                {selectedNotif.priority === 'URGENT' && (
                  <span className="apna-priority-pill urgent">
                    <span className="pulse-dot" />
                    URGENT ACTION REQUIRED
                  </span>
                )}

                {selectedNotif.priority === 'IMPORTANT' && (
                  <span className="apna-priority-pill important">
                    IMPORTANT BULLETIN
                  </span>
                )}
              </div>

              <button
                type="button"
                className="apna-modal-close-btn"
                onClick={() => setSelectedNotif(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Title */}
            <h3 id="apna-modal-title" className="apna-modal-title">
              {selectedNotif.title}
            </h3>

            {/* Official Sender Ledger */}
            <div className="apna-modal-sender-ledger">
              <div className="apna-ledger-icon">🏛</div>
              <div className="apna-ledger-details">
                <div className="apna-ledger-author">
                  <strong>{selectedNotif.senderName}</strong>
                  {selectedNotif.senderRole && (
                    <span className="apna-ledger-role">({selectedNotif.senderRole})</span>
                  )}
                </div>
                <div className="apna-ledger-dept">
                  {selectedNotif.senderDept || 'Office of Academic Affairs'} · Published {formatTimeAgo(selectedNotif.timestamp)}
                </div>
              </div>
            </div>

            {/* Modal Body / Full Message */}
            <div className="apna-modal-body-content">
              {selectedNotif.message}
            </div>

            {/* Attachment Download Area */}
            {selectedNotif.attachmentName && (
              <div className="apna-modal-attachment-box">
                <div className="apna-attachment-info">
                  <FileText size={20} className="apna-file-icon" />
                  <div>
                    <strong className="apna-filename">{selectedNotif.attachmentName}</strong>
                    <small>Official Verified Document • PDF format</small>
                  </div>
                </div>

                <a
                  href={selectedNotif.attachmentUrl || '#'}
                  download={selectedNotif.attachmentName}
                  className="apna-download-btn"
                  onClick={(e) => {
                    if (!selectedNotif.attachmentUrl) {
                      e.preventDefault();
                      showToast(`Downloading ${selectedNotif.attachmentName}`);
                    }
                  }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
              </div>
            )}

            {/* Official Modular Test Circular & Timetable Callout */}
            {(selectedNotif.category === 'EXAMINATION' ||
              selectedNotif.title?.toLowerCase().includes('modular') ||
              selectedNotif.title?.toLowerCase().includes('schedule') ||
              selectedNotif.isOfficialModularTestNotice) && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#1e3a8a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}
                  >
                    GIFT
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1e3a8a', lineHeight: 1.3 }}>
                      Official Controller of Examinations Schedule Circular
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                      B.Tech 5th Semester Modular Test-II (All Branches · Nov 2026)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="apna-action-primary-btn"
                  onClick={() => setShowOfficialNoticeModal(true)}
                  style={{ whiteSpace: 'nowrap', padding: '7px 14px' }}
                >
                  <span>View Official Circular</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="apna-modal-footer">
              <div className="apna-modal-footer-left">
                <button
                  type="button"
                  className="apna-toggle-read-btn"
                  onClick={() => {
                    handleToggleRead(selectedNotif.id, selectedNotif.unread);
                    setSelectedNotif(prev => prev ? { ...prev, unread: !prev.unread } : null);
                  }}
                >
                  {selectedNotif.unread ? 'Mark as Read' : 'Mark as Unread'}
                </button>
              </div>

              <div className="apna-modal-footer-right">
                {(selectedNotif.actionTab || selectedNotif.actionUrl) && (
                  <button
                    type="button"
                    className="apna-action-primary-btn"
                    onClick={() => handleActionNavigate(selectedNotif.actionTab, selectedNotif.actionUrl)}
                  >
                    <span>{selectedNotif.actionLabel || 'Navigate to Module'}</span>
                    <ExternalLink size={14} />
                  </button>
                )}


                <button
                  type="button"
                  className="apna-modal-ack-btn"
                  onClick={() => setSelectedNotif(null)}
                >
                  Acknowledge &amp; Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official GIFT Examination Circular Full View */}
      {showOfficialNoticeModal && (
        <OfficialCollegeNoticeModal
          notice={GIFT_MODULAR_TEST_2_NOTICE}
          userBranch={account?.departmentCode || account?.deptCode || 'CSE'}
          onClose={() => setShowOfficialNoticeModal(false)}
        />
      )}
    </>
  );
}
