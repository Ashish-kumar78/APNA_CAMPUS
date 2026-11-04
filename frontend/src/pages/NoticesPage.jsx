import { useState, useEffect } from 'react'
import { 
  Search, 
  Pin, 
  Download, 
  Calendar, 
  FileText
} from 'lucide-react'
import { notificationsApi } from '../services/notificationsApi.js'
import { notificationsStore } from '../services/notificationsStore.js'
import { erpStore } from '../services/erpStore.js'
import './NoticesPage.css'

export default function NoticesPage() {
  const [selectedTag, setSelectedTag] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [facultyNotices, setFacultyNotices] = useState([])
  const [campusNotices, setCampusNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isMounted = true;
    const loadFacultyNotices = async () => {
      setLoading(true);
      setLoadError('');

      // Load instant local/offline exam circulars and notifications
      const localExamCircs = (erpStore.getExamCirculars() || []).map((c) => ({
        id: c.id,
        title: c.title,
        tag: 'exam',
        category: 'EXAMINATION',
        date: c.date || 'Today',
        publisher: 'Controller of Examinations (CoE)',
        pinned: c.priority === 'High' || c.priority === 'URGENT',
        summary: (c.content || '').slice(0, 160) + ((c.content || '').length > 160 ? '...' : ''),
        content: c.content,
        attachment: c.circularNo ? `${c.circularNo.replace(/[\/\\]/g, '_')}.pdf` : '',
      }));

      const storeNotifs = (notificationsStore.getNotifications({ role: 'student' }) || []).map((n) => ({
        id: n.id,
        title: n.title,
        tag: ({
          EXAMINATION: 'exam',
          PLACEMENT: 'placement',
          COURSE_UPDATE: 'academic',
          ACADEMIC: 'academic',
          FEES: 'scholarship',
        })[n.category] || 'faculty',
        category: n.category,
        date: n.timestamp
          ? new Date(n.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Recently',
        publisher: `${n.senderName || 'Campus'}${n.senderDept ? ` · ${n.senderDept}` : ''}`,
        pinned: n.priority === 'URGENT' || n.priority === 'HIGH',
        summary: (n.message || '').slice(0, 160) + ((n.message || '').length > 160 ? '...' : ''),
        content: n.message,
        attachment: n.attachmentName || '',
        attachmentUrl: n.attachmentUrl || '',
      }));

      try {
        const [notificationList, officialNotices] = await Promise.allSettled([
          notificationsApi.getStudentNotifications(),
          notificationsApi.getCampusNotices(),
        ]);
        if (!isMounted) return;

        let mappedNotifications = [];
        if (notificationList.status === 'fulfilled' && Array.isArray(notificationList.value)) {
          mappedNotifications = notificationList.value.map((n) => ({
            id: n.id,
            title: n.title,
            tag: ({
              EXAMINATION: 'exam',
              PLACEMENT: 'placement',
              COURSE_UPDATE: 'academic',
              ACADEMIC: 'academic',
              FEES: 'scholarship',
            })[n.category] || 'faculty',
            category: n.category,
            date: n.publishedAt
              ? new Date(n.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Recently',
            publisher: `${n.facultyName || n.senderName || 'Campus'}${n.subjectCode ? ` (${n.subjectCode})` : ''}`,
            pinned: n.priority === 'URGENT',
            summary: (n.message || '').slice(0, 150) + ((n.message || '').length > 150 ? '...' : ''),
            content: n.message,
            attachment: n.attachmentName || '',
            attachmentUrl: n.attachmentUrl || '',
          }));
        }

        let mappedOfficialNotices = [];
        if (officialNotices.status === 'fulfilled' && Array.isArray(officialNotices.value)) {
          mappedOfficialNotices = officialNotices.value.map((notice) => ({
            ...notice,
            tag: ({
              examination: 'exam',
              scholarships: 'scholarship',
              career: 'placement',
            })[String(notice.tag || '').toLowerCase()] || String(notice.tag || 'academic').toLowerCase(),
            date: notice.date || new Date(notice.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            publisher: notice.publisher || 'Campus Administration',
            attachment: notice.attachment || '',
            attachmentUrl: notice.attachmentUrl || '',
          }));
        }

        // Combine all, ensuring deduplication by ID
        const existingIds = new Set();
        const allList = [];
        for (const item of [...mappedNotifications, ...mappedOfficialNotices, ...localExamCircs, ...storeNotifs]) {
          if (!existingIds.has(item.id)) {
            existingIds.add(item.id);
            allList.push(item);
          }
        }

        setFacultyNotices(allList);
        setCampusNotices([]);
      } catch (e) {
        if (isMounted) {
          // Even if backend fails, seamlessly present local and store circulars
          const fallbackList = [...localExamCircs, ...storeNotifs];
          setFacultyNotices(fallbackList);
          setCampusNotices([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFacultyNotices();
    window.addEventListener('apna_campus_notifications_updated', loadFacultyNotices);
    window.addEventListener('apna_campus_notification_dispatched', loadFacultyNotices);
    return () => {
      isMounted = false;
      window.removeEventListener('apna_campus_notifications_updated', loadFacultyNotices);
      window.removeEventListener('apna_campus_notification_dispatched', loadFacultyNotices);
    };
  }, []);

  const combinedNotices = [...campusNotices, ...facultyNotices];

  const filtered = combinedNotices.filter((n) => {
    const matchesTag = selectedTag === 'all' || n.tag === selectedTag
    const matchesQuery = query.trim() === '' || 
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.summary.toLowerCase().includes(query.toLowerCase()) ||
      (n.publisher && n.publisher.toLowerCase().includes(query.toLowerCase()))
    return matchesTag && matchesQuery
  })

  return (
    <div className="notices-page">
      <div className="notices-header">
        <div>
          <h1 className="notices-title">University Circulars & Notice Board</h1>
          <p className="notices-subtitle">Official announcements, examination notifications, and administrative circulars</p>
        </div>
      </div>

      <div className="notices-controls">
        <div className="notices-cats">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'faculty', label: 'Faculty Broadcasts' },
            { id: 'academic', label: 'Academic' },
            { id: 'exam', label: 'Examinations' },
            { id: 'scholarship', label: 'Scholarship' },
            { id: 'placement', label: 'Placement' },
            { id: 'event', label: 'Events' }
          ].map((cat) => (
            <button
              key={cat.id}
              className={`notices-cat-btn ${selectedTag === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedTag(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="notices-search-box">
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search circulars..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="notices-list">
        {loading && <p role="status">Loading notices…</p>}
        {!loading && loadError && <p role="alert">{loadError}</p>}
        {!loading && !loadError && filtered.length === 0 && (
          <p>
            {query.trim() || selectedTag !== 'all'
              ? 'No notices match your current filters.'
              : 'No notices have been published yet.'}
          </p>
        )}
        {filtered.map((item) => (
          <div key={item.id} className={`notice-card ${item.pinned ? 'pinned' : ''}`}>
            <div className="notice-meta-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.pinned && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '0.78rem', fontWeight: 700 }}>
                    <Pin size={13} /> Pinned Circular
                  </span>
                )}
                <span className={`notice-tag-badge ${item.tag}`}>
                  {item.tag}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                <Calendar size={13} />
                <span>{item.date}</span>
                <span>•</span>
                <span>{item.publisher}</span>
              </div>
            </div>

            <div className="notice-card-body">
              <h3 onClick={() => setSelectedNotice(item)}>{item.title}</h3>
              <p>{item.summary}</p>
            </div>

            <div className="notice-footer">
              {item.attachment ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="#64748b" /> {item.attachment}
                </span>
              ) : <span>No attachment</span>}
              <div className="notice-actions">
                {item.attachmentUrl && (
                  <a
                    className="btn-notice-action"
                    href={item.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={14} /> Attachment
                  </a>
                )}
                <button 
                  className="btn-notice-action"
                  onClick={() => setSelectedNotice(item)}
                >
                  Read Full Circular
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedNotice && (
        <div className="payment-modal-backdrop" onClick={() => setSelectedNotice(null)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <button className="payment-modal-close" onClick={() => setSelectedNotice(null)}>×</button>
            <span className={`notice-tag-badge ${selectedNotice.tag}`} style={{ marginBottom: '10px', display: 'inline-block' }}>
              {selectedNotice.tag}
            </span>
            <h2 style={{ fontSize: '1.3rem', margin: '4px 0 10px', color: '#0a0f1e' }}>{selectedNotice.title}</h2>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <span>Published: {selectedNotice.date}</span>
              <span>By: {selectedNotice.publisher}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '0.92rem', lineHeight: '1.6', color: '#334155', marginBottom: '20px' }}>
              {selectedNotice.content}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {selectedNotice.attachmentUrl && (
                <a
                  className="btn-pay-now"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  href={selectedNotice.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={14} /> Open Attachment
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
