import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone, Plus, Clock, Users, CheckCircle2, AlertCircle,
  Calendar, Search, Filter, Trash2, X, Send, Eye, FileText,
  AlertTriangle, Check, BookOpen, Layers
} from 'lucide-react';
import { notificationsApi } from '../services/notificationsApi';
import { erpStore } from '../services/erpStore';
import './FacultyNotificationsModule.css';

export default function FacultyNotificationsModule({ account }) {
  const facultyName = account?.name || account?.identifier || 'Dr. S. Mohanty';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isConfirmMultipleOpen, setIsConfirmMultipleOpen] = useState(false);
  const [viewingDrilldown, setViewingDrilldown] = useState(null);

  // Form State
  const facultyAssignments = useMemo(() => {
    return erpStore.getFacultyAssignedClasses(facultyName);
  }, [facultyName]);

  const defaultAssignment = facultyAssignments[0] || {
    semester: 'Semester 5',
    section: 'Section A',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms'
  };

  const [form, setForm] = useState({
    title: '',
    message: '',
    category: 'EXAMINATION',
    priority: 'NORMAL',
    academicYear: '2026-27',
    program: 'B.Tech',
    semester: defaultAssignment.semester || 'Semester 5',
    section: defaultAssignment.section || 'Section A',
    subjectCode: defaultAssignment.subjectCode || 'CS501',
    subjectName: defaultAssignment.subjectName || 'Data Structures & Algorithms',
    isScheduled: false,
    scheduledFor: '',
    expiresAt: '',
    attachmentUrl: '',
    attachmentName: ''
  });

  const [previewInfo, setPreviewInfo] = useState({ count: 32, label: 'B.Tech · Semester 5 · Section A' });

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await notificationsApi.getFacultyNotifications(facultyName);
      setNotifications(list);
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('apna_campus_notifications_updated', handleUpdate);
    return () => window.removeEventListener('apna_campus_notifications_updated', handleUpdate);
  }, [facultyName]);

  // Update recipient preview whenever cohort targets change
  useEffect(() => {
    const runPreview = async () => {
      const res = await notificationsApi.previewRecipients({
        semester: form.semester,
        section: form.section,
        subjectCode: form.subjectCode,
        program: form.program
      });
      if (res && res.success) {
        setPreviewInfo({
          count: res.eligibleStudentsCount,
          label: res.targetGroupLabel
        });
      }
    };
    runPreview();
  }, [form.semester, form.section, form.program]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = notifications.length;
    const published = notifications.filter(n => n.status === 'PUBLISHED').length;
    const scheduled = notifications.filter(n => n.status === 'SCHEDULED').length;

    let totalRecipientsAll = 0;
    let totalReadCountAll = 0;
    notifications.forEach(n => {
      totalRecipientsAll += (n.totalRecipients || 32);
      totalReadCountAll += (n.totalRead || 0);
    });

    const aggregateReadRate = totalRecipientsAll > 0 ? Math.round((totalReadCountAll / totalRecipientsAll) * 100) : 88.5;

    return { total, published, scheduled, aggregateReadRate };
  }, [notifications]);

  // Filtered List
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchCat =
        filterCategory === 'ALL' ||
        (filterCategory === 'SCHEDULED' ? n.status === 'SCHEDULED' : n.category === filterCategory);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.subjectName && n.subjectName.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [notifications, filterCategory, searchQuery]);

  const handleOpenCompose = () => {
    setForm({
      title: '',
      message: '',
      category: 'EXAMINATION',
      priority: 'NORMAL',
      academicYear: '2026-27',
      program: 'B.Tech',
      semester: defaultAssignment.semester || 'Semester 5',
      section: defaultAssignment.section || 'Section A',
      subjectCode: defaultAssignment.subjectCode || 'CS501',
      subjectName: defaultAssignment.subjectName || 'Data Structures & Algorithms',
      isScheduled: false,
      scheduledFor: '',
      expiresAt: '',
      attachmentUrl: '',
      attachmentName: ''
    });
    setIsComposeOpen(true);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      alert('Please fill in title and description.');
      return;
    }

    // If broadcasting to ALL assigned sections, show confirmation dialog first!
    if (form.section === 'ALL' || form.section === 'ALL_ASSIGNED') {
      setIsConfirmMultipleOpen(true);
    } else {
      executeBroadcast();
    }
  };

  const executeBroadcast = async () => {
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        priority: form.priority,
        academicYear: form.academicYear,
        program: form.program,
        semester: form.semester,
        section: form.section,
        subjectCode: form.subjectCode,
        subjectName: form.subjectName,
        scheduledFor: form.isScheduled && form.scheduledFor ? new Date(form.scheduledFor).toISOString() : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        attachmentUrl: form.attachmentUrl || null,
        attachmentName: form.attachmentName || null
      };

      const res = await notificationsApi.createNotification(payload, { name: facultyName });
      setIsConfirmMultipleOpen(false);
      setIsComposeOpen(false);
      showToast(res.message || 'Notification broadcasted successfully.');
      loadData();
    } catch (err) {
      alert(err.message || 'Broadcast failed.');
    }
  };

  const handleCancelScheduled = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled notification?')) return;
    try {
      await notificationsApi.cancelNotification(id);
      showToast('Scheduled notification cancelled.');
      loadData();
    } catch (err) {
      alert('Failed to cancel notification.');
    }
  };

  const formatCategoryName = (cat) => {
    switch (cat) {
      case 'EXAMINATION': return 'Upcoming Examination';
      case 'EXAM_TIMETABLE': return 'Exam Timetable';
      case 'ASSIGNMENT_DEADLINE': return 'Assignment Deadline';
      case 'INTERNAL_ASSESSMENT': return 'Internal Assessment';
      case 'PRACTICAL_EXAM': return 'Lab Practical Exam';
      case 'CLASS_CANCELLATION': return 'Class Cancellation';
      case 'SCHEDULE_CHANGE': return 'Schedule Change';
      case 'EXTRA_CLASS': return 'Extra / Revision Class';
      case 'PROJECT_SUBMISSION': return 'Project Submission';
      case 'ACADEMIC_REMINDER': return 'Academic Reminder';
      default: return 'Announcement';
    }
  };

  return (
    <div className="fac-notif-container">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{ background: '#0f766e', color: '#fff', padding: '10px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* Header Area */}
      <div className="fac-notif-header">
        <div className="fac-notif-title-area">
          <h2>
            <Megaphone size={24} color="#0f766e" /> Faculty Academic Notifications &amp; Broadcasts
          </h2>
          <p>
            Broadcast urgent academic notices, examination schedules, assignment deadlines, and class modifications strictly targeted to your authorized classes and sections.
          </p>
        </div>

        <button
          type="button"
          className="admin-action-btn-primary"
          onClick={handleOpenCompose}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1.1rem', fontSize: '0.82rem' }}
        >
          <Plus size={16} /> Compose New Notification
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="fac-notif-kpi-grid">
        <div className="fac-notif-card">
          <div className="fac-notif-card-top">
            <span className="fac-notif-card-label">Total Broadcasts</span>
            <div className="fac-kpi-icon-wrap blue"><Megaphone size={18} /></div>
          </div>
          <div className="fac-notif-card-val">{kpis.total}</div>
          <div className="fac-notif-card-sub">Authored Notices</div>
        </div>

        <div className="fac-notif-card">
          <div className="fac-notif-card-top">
            <span className="fac-notif-card-label">Active / Live</span>
            <div className="fac-kpi-icon-wrap emerald"><CheckCircle2 size={18} /></div>
          </div>
          <div className="fac-notif-card-val" style={{ color: '#059669' }}>{kpis.published}</div>
          <div className="fac-notif-card-sub">Visible to Target Students</div>
        </div>

        <div className="fac-notif-card">
          <div className="fac-notif-card-top">
            <span className="fac-notif-card-label">Scheduled Queued</span>
            <div className="fac-kpi-icon-wrap amber"><Clock size={18} /></div>
          </div>
          <div className="fac-notif-card-val" style={{ color: '#d97706' }}>{kpis.scheduled}</div>
          <div className="fac-notif-card-sub">Pending Future Dispatch</div>
        </div>

        <div className="fac-notif-card">
          <div className="fac-notif-card-top">
            <span className="fac-notif-card-label">Student Read Rate</span>
            <div className="fac-kpi-icon-wrap indigo"><Users size={18} /></div>
          </div>
          <div className="fac-notif-card-val" style={{ color: '#4f46e5' }}>{kpis.aggregateReadRate}%</div>
          <div className="fac-notif-card-sub">Cohort Engagement Index</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="fac-complaints-toolbar">
        <div className="fac-filter-pills">
          {[
            { id: 'ALL', label: 'All Notices' },
            { id: 'EXAMINATION', label: 'Examinations' },
            { id: 'ASSIGNMENT_DEADLINE', label: 'Assignments' },
            { id: 'SCHEDULE_CHANGE', label: 'Schedule Changes' },
            { id: 'EXTRA_CLASS', label: 'Extra Classes' },
            { id: 'SCHEDULED', label: 'Scheduled Only' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`fac-filter-btn ${filterCategory === tab.id ? 'active' : ''}`}
              onClick={() => setFilterCategory(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="fac-search-box">
          <Search size={14} className="fac-search-icon" />
          <input
            type="text"
            placeholder="Search notifications by title or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Notifications Table */}
      <div className="fac-table-card">
        <div className="fac-table-wrapper">
          <table className="fac-complaints-table">
            <thead>
              <tr>
                <th>Priority &amp; Category</th>
                <th>Notification Title</th>
                <th>Target Recipient Group</th>
                <th>Publication Date</th>
                <th>Status</th>
                <th>Read Engagement</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <Megaphone size={36} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>No notifications found</div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
                      Click "Compose New Notification" above to dispatch targeted announcements.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map(notif => (
                  <tr key={notif.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className={`fac-priority-badge ${notif.priority.toLowerCase()}`}>
                          {notif.priority}
                        </span>
                        <span className="fac-category-tag" style={{ fontSize: '0.68rem' }}>
                          {formatCategoryName(notif.category)}
                        </span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{notif.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {notif.message}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                        {notif.semester} · {notif.section === 'ALL' || notif.section === 'ALL_ASSIGNED' ? 'All Assigned Sections' : notif.section}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {notif.subjectName || notif.subjectCode} · {notif.totalRecipients} Students
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        {new Date(notif.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(notif.publishedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </td>
                    <td>
                      <span className={`fac-status-badge ${notif.status.toLowerCase()}`}>
                        {notif.status}
                      </span>
                    </td>
                    <td style={{ minWidth: '130px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
                        <span>{notif.totalRead} / {notif.totalRecipients} Read</span>
                        <span>{notif.readRate}%</span>
                      </div>
                      <div className="fac-read-bar-wrap">
                        <div className="fac-read-bar-fill" style={{ width: `${notif.readRate}%` }} />
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="fac-action-btn-primary"
                          onClick={() => setViewingDrilldown(notif)}
                          title="View notification details and recipient drilldown"
                        >
                          <Eye size={13} /> Details
                        </button>
                        {notif.status === 'SCHEDULED' && (
                          <button
                            type="button"
                            className="admin-action-btn-secondary"
                            onClick={() => handleCancelScheduled(notif.id)}
                            style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '4px 8px' }}
                            title="Cancel scheduled dispatch"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPOSE NOTIFICATION MODAL */}
      {isComposeOpen && (
        <div className="fac-modal-backdrop" onClick={() => setIsComposeOpen(false)}>
          <div className="fac-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <h3>Compose Targeted Academic Notification</h3>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePreSubmit}>
              <div className="fac-modal-body">
                {/* Dynamic Recipient Preview Banner */}
                <div className="fac-recipient-preview-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="#0f766e" />
                    <span>
                      Target Audience: <strong>{previewInfo.label}</strong> (<strong>{previewInfo.count} Students</strong> will receive this)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#ccfbf1', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                    Strictly Scoped
                  </span>
                </div>

                <div className="fac-form-group">
                  <label htmlFor="title">Notification Title *</label>
                  <input
                    type="text"
                    id="title"
                    placeholder="e.g. Midterm Modular 2 Syllabus and Hall Ticket Guidelines"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="fac-form-group">
                    <label htmlFor="category">Notification Category *</label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="EXAMINATION">Upcoming Examination</option>
                      <option value="EXAM_TIMETABLE">Exam Timetable &amp; Schedule</option>
                      <option value="ASSIGNMENT_DEADLINE">Assignment Deadline</option>
                      <option value="INTERNAL_ASSESSMENT">Internal Assessment (CIA)</option>
                      <option value="PRACTICAL_EXAM">Lab &amp; Practical Exam</option>
                      <option value="CLASS_CANCELLATION">Class Cancellation</option>
                      <option value="SCHEDULE_CHANGE">Schedule Change / Period Shift</option>
                      <option value="EXTRA_CLASS">Extra / Revision Session</option>
                      <option value="PROJECT_SUBMISSION">Project Submission</option>
                      <option value="ACADEMIC_REMINDER">Important Academic Reminder</option>
                      <option value="GENERAL_ANNOUNCEMENT">General Announcement</option>
                    </select>
                  </div>

                  <div className="fac-form-group">
                    <label htmlFor="priority">Urgency / Priority Level *</label>
                    <select
                      id="priority"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option value="NORMAL">Normal Priority (Blue)</option>
                      <option value="IMPORTANT">Important (Yellow Banner)</option>
                      <option value="URGENT">Urgent (Red Priority Alert)</option>
                    </select>
                  </div>
                </div>

                {/* Scoping Selection derived from faculty's assigned classes */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14} color="#0f766e" /> Select Authorized Target Teaching Cohort
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div className="fac-form-group" style={{ margin: 0 }}>
                      <label htmlFor="semester">Target Semester</label>
                      <select
                        id="semester"
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: e.target.value })}
                      >
                        <option value="Semester 5">Semester 5 (Current Active)</option>
                        <option value="Semester 3">Semester 3</option>
                      </select>
                    </div>

                    <div className="fac-form-group" style={{ margin: 0 }}>
                      <label htmlFor="section">Target Section</label>
                      <select
                        id="section"
                        value={form.section}
                        onChange={(e) => setForm({ ...form, section: e.target.value })}
                      >
                        <option value="Section A">Section A (32 Students)</option>
                        <option value="Section B">Section B (30 Students)</option>
                        <option value="ALL_ASSIGNED">All Assigned Sections (Section A &amp; B)</option>
                      </select>
                    </div>

                    <div className="fac-form-group" style={{ margin: 0 }}>
                      <label htmlFor="subjectCode">Associated Course</label>
                      <select
                        id="subjectCode"
                        value={form.subjectCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          const name = code === 'CS502' ? 'Operating Systems' : 'Data Structures & Algorithms';
                          setForm({ ...form, subjectCode: code, subjectName: name });
                        }}
                      >
                        <option value="CS501">CS501 - Data Structures</option>
                        <option value="CS502">CS502 - Operating Systems</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="fac-form-group" style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="message">Broadcast Message / Description *</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Enter the detailed academic instructions, timing details, room numbers, or syllabus coverage..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="fac-form-group">
                    <label htmlFor="attachmentUrl">Optional Supporting Document / Resource Link</label>
                    <input
                      type="text"
                      id="attachmentUrl"
                      placeholder="e.g. /assets/exam_timetable.pdf or drive link"
                      value={form.attachmentUrl}
                      onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })}
                    />
                  </div>

                  <div className="fac-form-group">
                    <label htmlFor="expiresAt">Notice Expiry Date (Optional)</label>
                    <input
                      type="date"
                      id="expiresAt"
                      value={form.expiresAt}
                      onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    />
                  </div>
                </div>

                {/* Scheduling toggle */}
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Schedule for Future Delivery</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>If enabled, students will only see this announcement after the specified date and time.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isScheduled}
                    onChange={(e) => setForm({ ...form, isScheduled: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                {form.isScheduled && (
                  <div className="fac-form-group">
                    <label htmlFor="scheduledFor">Scheduled Release Date &amp; Time *</label>
                    <input
                      type="datetime-local"
                      id="scheduledFor"
                      value={form.scheduledFor}
                      onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                      required={form.isScheduled}
                    />
                  </div>
                )}
              </div>

              <div className="fac-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fac-action-btn-primary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem' }}
                >
                  <Send size={14} /> {form.isScheduled ? 'Schedule Notification' : 'Broadcast to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR MULTI-SECTION BROADCAST */}
      {isConfirmMultipleOpen && (
        <div className="fac-modal-backdrop" onClick={() => setIsConfirmMultipleOpen(false)}>
          <div className="fac-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706' }}>
                <AlertTriangle size={20} /> Multi-Cohort Confirmation
              </h3>
              <button type="button" onClick={() => setIsConfirmMultipleOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="fac-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                You have selected <strong>All Assigned Sections</strong> ({previewInfo.label}). This notice will simultaneously notify <strong>{previewInfo.count} students</strong> across Section A and Section B.
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px', fontSize: '0.78rem', color: '#92400e', marginTop: '0.75rem' }}>
                Please confirm that the date, time, and instructions apply equally to all recipient sections.
              </div>
            </div>
            <div className="fac-modal-footer">
              <button type="button" className="admin-action-btn-secondary" onClick={() => setIsConfirmMultipleOpen(false)}>
                Back to Edit
              </button>
              <button type="button" className="fac-action-btn-primary" onClick={executeBroadcast}>
                <Check size={14} /> Confirm and Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS & RECIPIENT DRILLDOWN MODAL */}
      {viewingDrilldown && (
        <div className="fac-modal-backdrop" onClick={() => setViewingDrilldown(null)}>
          <div className="fac-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <div>
                <span className={`fac-priority-badge ${viewingDrilldown.priority.toLowerCase()}`} style={{ marginRight: '8px' }}>
                  {viewingDrilldown.priority}
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{viewingDrilldown.title}</span>
              </div>
              <button type="button" onClick={() => setViewingDrilldown(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="fac-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                  <span>Published on: {new Date(viewingDrilldown.publishedAt).toLocaleString('en-IN')}</span>
                  <span>Target: {viewingDrilldown.semester} · {viewingDrilldown.section}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                  {viewingDrilldown.message}
                </p>
                {viewingDrilldown.attachmentUrl && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem' }}>
                    <strong>Attachment:</strong> <a href={viewingDrilldown.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{viewingDrilldown.attachmentName || viewingDrilldown.attachmentUrl}</a>
                  </div>
                )}
              </div>

              {/* Read engagement drilldown */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>
                    Student Read Status Roster ({viewingDrilldown.totalRead} / {viewingDrilldown.totalRecipients} Read · {viewingDrilldown.readRate}%)
                  </h4>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Roll No</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Section</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Read Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewingDrilldown.recipients || []).map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 12px', fontWeight: 700 }}>{r.studentRollNumber}</td>
                          <td style={{ padding: '6px 12px' }}>{r.studentName}</td>
                          <td style={{ padding: '6px 12px' }}>{r.section}</td>
                          <td style={{ padding: '6px 12px' }}>
                            {r.isRead ? (
                              <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={13} /> Read {r.readAt ? `(${new Date(r.readAt).toLocaleDateString('en-IN')})` : ''}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Unread</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="fac-modal-footer">
              <button type="button" className="admin-action-btn-secondary" onClick={() => setViewingDrilldown(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
