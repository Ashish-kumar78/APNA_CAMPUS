import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BellRing,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  GraduationCap,
  Megaphone,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { notificationsStore } from '../../services/notificationsStore.js';
import { erpStore } from '../../services/erpStore.js';
import './InstitutionalNotificationDrawer.css';

const PAGE_SIZE = 12;

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'UNREAD', label: 'Unread' },
  { id: 'URGENT', label: 'Urgent' },
  { id: 'EXAMINATION', label: 'Examination' },
  { id: 'ACADEMIC', label: 'Academic' },
  { id: 'ADMINISTRATIVE', label: 'Administrative' },
  { id: 'PLACEMENT', label: 'Placement' },
  { id: 'FEES', label: 'Finance' },
  { id: 'HOSTEL', label: 'Hostel' },
  { id: 'TRANSPORT', label: 'Transport' },
  { id: 'SYSTEM', label: 'System' },
  { id: 'EMERGENCY', label: 'Emergency' },
];

const CATEGORY_FILTERS = {
  ADMINISTRATIVE: 'ADMISSION',
  FINANCE: 'FEES',
};

function getCategoryIcon(category) {
  if (category === 'EXAMINATION') return CalendarDays;
  if (category === 'ACADEMIC' || category === 'ASSIGNMENT') return BookOpen;
  if (category === 'PLACEMENT') return Briefcase;
  if (category === 'FEES') return CreditCard;
  if (category === 'SECURITY') return ShieldAlert;
  if (category === 'ADMISSION') return GraduationCap;
  return BellRing;
}

function formatDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
}

function formatShortDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

export default function InstitutionalNotificationDrawer({
  isOpen,
  onClose,
  account,
  onNavigateTab,
}) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [allNotifs, setAllNotifs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, unread: 0, urgent: 0 });
  const [selected, setSelected] = useState(null);
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);

  const reload = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Load and merge all notifications from institutional sources
  useEffect(() => {
    if (!isOpen) return undefined;
    let active = true;

    // 1. Gather all official exam circulars from erpStore
    const examCircs = (erpStore.getExamCirculars() || []).map((c) => ({
      id: c.id,
      title: c.title,
      message: c.content,
      category: 'EXAMINATION',
      priority: (c.priority || 'URGENT').toUpperCase(),
      senderName: 'Controller of Examinations (CoE)',
      senderRole: 'Controller of Examinations',
      senderDept: 'Office of the CoE · Autonomous College',
      timestamp: c.date || new Date().toISOString(),
      displayDate: c.date || 'Today',
      unread: true,
      actionTab: 'online-exam',
      actionLabel: 'Open Examination Module',
      attachmentName: `${(c.circularNo || 'COE_Circular').replace(/[\/\\]/g, '_')}.pdf`,
      attachmentUrl: '#',
      isExamNotice: true,
      circularNo: c.circularNo,
      audience: c.audience,
      raw: c,
    }));

    // 2. Gather role & institutional notifications from notificationsStore
    const storeNotifs = (notificationsStore.getNotifications(account) || []).map((n) => ({
      ...n,
      isExamNotice: n.category === 'EXAMINATION' || n.category === 'EXAM' || !!n.isOfficialModularTestNotice,
      displayDate: formatShortDate(n.timestamp),
    }));

    // Build unified map
    const unifiedMap = new Map();
    examCircs.forEach((c) => unifiedMap.set(c.id, c));
    storeNotifs.forEach((n) => {
      if (!unifiedMap.has(n.id)) {
        unifiedMap.set(n.id, n);
      }
    });

    const initialMerged = Array.from(unifiedMap.values());
    if (active) {
      setAllNotifs(initialMerged);
      const unreadCount = initialMerged.filter((n) => n.unread).length;
      const urgentCount = initialMerged.filter((n) => n.priority === 'URGENT' || n.priority === 'HIGH').length;
      setSummary({
        total: initialMerged.length,
        unread: unreadCount,
        urgent: urgentCount,
      });
    }

    // 3. Concurrently fetch any backend user-specific notifications
    setLoading(true);
    api.getMyNotifications({ limit: 50 })
      .then((res) => {
        if (!active) return;
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach((bn) => {
            unifiedMap.set(bn.id, {
              ...bn,
              isExamNotice: bn.category === 'EXAMINATION' || bn.category === 'EXAM',
              displayDate: formatShortDate(bn.timestamp),
            });
          });
          const merged = Array.from(unifiedMap.values());
          setAllNotifs(merged);
          setSummary({
            total: merged.length,
            unread: merged.filter((n) => n.unread).length,
            urgent: merged.filter((n) => n.priority === 'URGENT' || n.priority === 'HIGH').length,
          });
        }
      })
      .catch((err) => {
        console.warn('Backend notification fetch note:', err?.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, refreshVersion, account]);

  useEffect(() => {
    const handleUpdate = () => {
      setRefreshVersion((v) => v + 1);
    };
    window.addEventListener('apna_campus_notifications_updated', handleUpdate);
    window.addEventListener('apna_campus_notification_dispatched', handleUpdate);
    return () => {
      window.removeEventListener('apna_campus_notifications_updated', handleUpdate);
      window.removeEventListener('apna_campus_notification_dispatched', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (selected) setSelected(null);
        else if (isCenterOpen) setIsCenterOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selected, isCenterOpen, onClose]);

  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearch]);

  const roleLabel = useMemo(
    () => String(account?.role || 'User').replace(/_/g, ' ').toUpperCase(),
    [account?.role],
  );

  // Extract top official examination bulletins for the featured spotlight
  const featuredBulletins = useMemo(() => {
    return allNotifs
      .filter((n) => n.isExamNotice || n.category === 'EXAMINATION')
      .slice(0, 3);
  }, [allNotifs]);

  // Filtered and searched notifications list
  const filteredNotifs = useMemo(() => {
    let list = [...allNotifs];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.message && n.message.toLowerCase().includes(q)) ||
          (n.senderName && n.senderName.toLowerCase().includes(q)) ||
          (n.senderDept && n.senderDept.toLowerCase().includes(q)) ||
          (n.circularNo && n.circularNo.toLowerCase().includes(q))
      );
    }

    if (filter === 'UNREAD') {
      list = list.filter((n) => n.unread);
    } else if (filter === 'URGENT') {
      list = list.filter((n) => n.priority === 'URGENT' || n.priority === 'HIGH');
    } else if (filter === 'EMERGENCY') {
      list = list.filter((n) => n.category === 'SECURITY' || n.priority === 'URGENT');
    } else if (filter === 'EXAMINATION') {
      list = list.filter((n) => n.isExamNotice || n.category === 'EXAMINATION' || n.category === 'EXAM');
    } else if (filter === 'ACADEMIC') {
      list = list.filter((n) => n.category === 'ACADEMIC' || n.category === 'ASSIGNMENT');
    } else if (filter === 'ADMINISTRATIVE') {
      list = list.filter((n) => n.category === 'ADMINISTRATIVE' || n.category === 'ADMISSION');
    } else if (filter !== 'ALL') {
      const targetCat = String(CATEGORY_FILTERS[filter] || filter).toUpperCase();
      list = list.filter((n) => String(n.category || '').toUpperCase().includes(targetCat));
    }

    return list;
  }, [allNotifs, debouncedSearch, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifs.length / PAGE_SIZE));
  const paginatedNotifs = useMemo(() => {
    const skip = (page - 1) * PAGE_SIZE;
    return filteredNotifs.slice(skip, skip + PAGE_SIZE);
  }, [filteredNotifs, page]);

  const markRead = async (notification) => {
    if (!notification.unread) return;
    try {
      notificationsStore.markAsRead(notification.id, account);
      await api.markNotificationRead(notification.id);
    } catch {
      // Handled locally
    }
    setAllNotifs((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
    );
    setSelected((current) => (current?.id === notification.id ? { ...current, unread: false } : current));
    window.dispatchEvent(new Event('apna_campus_notifications_updated'));
  };

  const markAllRead = async () => {
    try {
      notificationsStore.markAllAsRead(account);
      await api.markAllNotificationsRead();
    } catch {
      // Handled locally
    }
    setAllNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    setSummary((prev) => ({ ...prev, unread: 0 }));
    window.dispatchEvent(new Event('apna_campus_notifications_updated'));
  };

  const openDetails = (notification) => {
    setSelected(notification);
    markRead(notification);
  };

  const navigate = (notification) => {
    if (notification.actionTab && onNavigateTab) onNavigateTab(notification.actionTab);
    setSelected(null);
    setIsCenterOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`institution-notif-layer ${isCenterOpen ? 'is-center' : ''}`}>
      <button
        type="button"
        className="institution-notif-backdrop"
        onClick={onClose}
        aria-label="Close notifications"
      />
      <section
        className="institution-notif-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="institution-notif-title"
      >
        {/* Header */}
        <header className="institution-notif-header">
          <div className="institution-notif-heading">
            <span className="institution-notif-heading-icon"><BellRing size={18} /></span>
            <div>
              <h2 id="institution-notif-title">
                {isCenterOpen ? 'Notification Center' : 'Institutional Notifications'}
              </h2>
              <p>{roleLabel} · {account?.program || account?.department || 'Apna Campus Autonomous Directorate'}</p>
            </div>
          </div>
          <button type="button" className="institution-notif-icon-btn" onClick={onClose} aria-label="Close notifications">
            <X size={19} />
          </button>
        </header>

        {/* Summary KPIs */}
        <div className="institution-notif-summary" aria-label="Notification summary">
          <div><strong>{summary.total}</strong><span>Total</span></div>
          <div><strong>{summary.unread}</strong><span>Unread</span></div>
          <div><strong>{summary.urgent}</strong><span>Urgent</span></div>
        </div>

        {/* Quick Actions */}
        <div className="institution-notif-actions">
          <button type="button" onClick={markAllRead} disabled={!summary.unread}>
            <CheckCheck size={15} /> Mark all as read
          </button>
          {!isCenterOpen && (
            <button type="button" className="institution-notif-view-all" onClick={() => setIsCenterOpen(true)}>
              View all <ChevronRight size={15} />
            </button>
          )}
          {isCenterOpen && (
            <button type="button" className="institution-notif-view-all" onClick={() => setIsCenterOpen(false)}>
              <ChevronLeft size={15} /> Back to drawer
            </button>
          )}
        </div>

        {/* Search Input */}
        <label className="institution-notif-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, message, circular no, or sender..."
            aria-label="Search notifications"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>
          )}
        </label>

        {/* Filter Pills */}
        <nav className="institution-notif-filters" aria-label="Notification filters">
          {FILTERS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={filter === item.id ? 'active' : ''}
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
            >
              {item.label}
              {item.id === 'UNREAD' && <span>{summary.unread}</span>}
              {item.id === 'URGENT' && <span>{summary.urgent}</span>}
              {item.id === 'EXAMINATION' && <span>{featuredBulletins.length}</span>}
            </button>
          ))}
        </nav>

        {/* OFFICIAL EXAMINATION & CAMPUS NOTICES SPOTLIGHT */}
        {(filter === 'ALL' || filter === 'EXAMINATION') && !search && page === 1 && (
          <section className="institution-exam-bulletins" aria-label="Official Examination and Campus Bulletins">
            <header className="institution-exam-bulletins-header">
              <div className="institution-exam-bulletins-title-wrap">
                <div className="institution-exam-bulletins-icon">
                  <Megaphone size={16} />
                </div>
                <div>
                  <h3 className="institution-exam-bulletins-title">Official Examination &amp; Campus Notices</h3>
                  <p className="institution-exam-bulletins-subtitle">Direct announcements from Controller of Examinations and Academic Directorate</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="institution-exam-bulletins-badge">
                  {Math.max(23, allNotifs.filter((n) => n.isExamNotice || n.category === 'EXAMINATION').length)} Active Notices
                </span>
                <button
                  type="button"
                  className="institution-exam-bulletins-view-all"
                  onClick={() => setFilter('EXAMINATION')}
                  title="View all official examination circulars"
                >
                  View All Bulletins <ChevronRight size={13} />
                </button>
              </div>
            </header>

            <div className="institution-exam-bulletins-grid">
              {featuredBulletins.map((item) => (
                <article
                  key={item.id}
                  className="institution-exam-bulletin-card"
                  onClick={() => openDetails(item)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                      <span className="institution-exam-card-tag">EXAMINATION</span>
                      <span className="institution-exam-card-date">{item.displayDate}</span>
                    </div>
                    <h4 className="institution-exam-card-title">{item.title}</h4>
                    <p className="institution-exam-card-snippet">{item.message}</p>
                  </div>
                  <div className="institution-exam-card-foot">
                    <span className="institution-exam-card-authority">{item.senderName || 'Controller of Examinations (CoE)'}</span>
                    <span className="institution-exam-card-read">
                      Read Notice <ChevronRight size={13} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Notifications List */}
        <div className="institution-notif-list" aria-live="polite">
          {filteredNotifs.length === 0 && (
            <div className="institution-notif-state">
              <BellRing size={22} />
              <strong>No notifications found</strong>
              <p>There are no institutional notices matching the current filter.</p>
            </div>
          )}

          {paginatedNotifs.map((notification) => {
            const CategoryIcon = getCategoryIcon(notification.category);
            return (
              <article
                key={notification.recipientId || notification.id}
                className={`institution-notif-card ${notification.unread ? 'unread' : ''}`}
              >
                <span className={`institution-notif-category ${String(notification.category || '').toLowerCase()}`}>
                  <CategoryIcon size={14} />
                  {String(notification.category || 'General').replace(/_/g, ' ')}
                </span>
                {notification.priority === 'URGENT' && <span className="institution-notif-priority">Urgent</span>}
                <button type="button" className="institution-notif-card-content" onClick={() => openDetails(notification)}>
                  <strong>{notification.title}</strong>
                  <span>{notification.message}</span>
                </button>
                <div className="institution-notif-meta">
                  <span>{notification.senderName || 'Institutional Office'}</span>
                  <time dateTime={notification.timestamp}>{formatDate(notification.timestamp)}</time>
                </div>
                {notification.attachmentName && (
                  <div className="institution-notif-attachment">
                    <FileText size={14} />
                    <span>{notification.attachmentName}</span>
                    {notification.attachmentUrl && (
                      <a href={notification.attachmentUrl} target="_blank" rel="noreferrer" aria-label={`Open ${notification.attachmentName}`}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Pagination Footer */}
        <footer className="institution-notif-pagination">
          <span>Page {page} of {totalPages} ({filteredNotifs.length} total items)</span>
          <div>
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page">
              <ChevronLeft size={17} />
            </button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} aria-label="Next page">
              <ChevronRight size={17} />
            </button>
          </div>
        </footer>
      </section>

      {/* DETAILED NOTICE MODAL VIEW */}
      {selected && (
        <div className="institution-notif-detail-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section className="institution-notif-detail" role="dialog" aria-modal="true" aria-labelledby="institution-notif-detail-title">
            <header>
              <div>
                <span className={`institution-notif-category ${String(selected.category || '').toLowerCase()}`}>
                  {String(selected.category || 'General').replace(/_/g, ' ')}
                </span>
                {selected.circularNo && (
                  <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                    {selected.circularNo}
                  </span>
                )}
                <h2 id="institution-notif-detail-title">{selected.title}</h2>
              </div>
              <button type="button" className="institution-notif-icon-btn" onClick={() => setSelected(null)} aria-label="Close notice details">
                <X size={19} />
              </button>
            </header>

            <div className="institution-notif-detail-byline">
              <strong>{selected.senderName || 'Institutional Office'}</strong>
              <span>{[selected.senderRole, selected.senderDept].filter(Boolean).join(' · ')}</span>
              <time dateTime={selected.timestamp}>{formatDate(selected.timestamp)}</time>
            </div>

            <p className="institution-notif-detail-message" style={{ whiteSpace: 'pre-line' }}>{selected.message}</p>

            {selected.attachmentName && (
              <div style={{ margin: '14px 0' }}>
                <a className="institution-notif-detail-attachment" href={selected.attachmentUrl || '#'} target="_blank" rel="noreferrer">
                  <FileText size={17} /> {selected.attachmentName} <ExternalLink size={14} />
                </a>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 18, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              {selected.actionTab && (
                <button type="button" className="institution-notif-primary" onClick={() => navigate(selected)}>
                  {selected.actionLabel || 'Open related module'} <ExternalLink size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
