// APNA CAMPUS — Smart Communication & Document Management System
// Sent Messages Section: Dispatched Communications Ledger, Read/Unread Stats & Message Detail Inspection

import React, { useState, useEffect, useMemo } from 'react';
import {
  Send, Search, Filter, Eye, Paperclip, Users, CheckCheck,
  Calendar, Clock, AlertCircle, FileText, ChevronRight, X, ArrowUpRight
} from 'lucide-react';
import { communicationStore } from '../../services/communicationStore.js';

export default function SentMessagesSection({ onOpenComposer }) {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setMessages(communicationStore.getSentMessages());
    };
    refresh();
    const unsub = communicationStore.subscribe(refresh);
    return () => unsub();
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchSearch = !searchQuery.trim() ||
        msg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.heading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.department?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPriority = priorityFilter === 'ALL' || msg.priority?.toUpperCase() === priorityFilter;
      const matchType = typeFilter === 'ALL' || msg.messageType === typeFilter;

      return matchSearch && matchPriority && matchType;
    });
  }, [messages, searchQuery, priorityFilter, typeFilter]);

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'EMERGENCY':
        return 'comm-badge-emergency';
      case 'URGENT':
        return 'comm-badge-urgent';
      case 'IMPORTANT':
        return 'comm-badge-important';
      default:
        return 'comm-badge-normal';
    }
  };

  return (
    <div className="comm-sent-container">
      {/* Sub Header */}
      <div className="comm-sub-header">
        <div className="comm-sub-header-left">
          <div className="comm-sub-icon-badge">
            <Send size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="comm-sub-title">Dispatched & Sent Communications</h2>
            <p className="comm-sub-desc">
              Audit log of institutional announcements, targeted recipient cohorts & read confirmations
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="comm-filter-bar">
        <div className="comm-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search sent circulars, exam notices, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="comm-search-input"
          />
        </div>

        <div className="comm-filter-controls">
          <select
            className="comm-select-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="URGENT">Urgent</option>
            <option value="IMPORTANT">Important</option>
            <option value="NORMAL">Normal</option>
          </select>

          <select
            className="comm-select-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Message Types</option>
            <option value="General Announcement">General Announcement</option>
            <option value="Academic Notice">Academic Notice</option>
            <option value="Examination Notice">Examination Notice</option>
            <option value="Placement and Internship">Placement and Internship</option>
            <option value="Hostel Notice">Hostel Notice</option>
            <option value="Staff Circular">Staff Circular</option>
          </select>
        </div>
      </div>

      {/* Sent Messages List */}
      <div className="comm-sent-list">
        {filteredMessages.map(msg => (
          <div key={msg.id} className="comm-sent-card" onClick={() => setSelectedMessage(msg)}>
            <div className="comm-sent-card-header">
              <div className="comm-sent-tags">
                <span className={`comm-priority-badge ${getPriorityBadgeClass(msg.priority)}`}>
                  {msg.priority}
                </span>
                <span className="comm-type-pill">{msg.messageType}</span>
                <span className="comm-msg-id-pill">{msg.id}</span>
              </div>
              <div className="comm-sent-timestamp">
                <Clock size={13} className="text-slate-400" />
                <span>{new Date(msg.creationDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>

            <div className="comm-sent-card-body">
              <h3 className="comm-sent-title">{msg.title}</h3>
              {msg.heading && <p className="comm-sent-heading-sub">{msg.heading}</p>}
              <p className="comm-sent-snippet">
                {msg.body.replace(/<[^>]*>/g, '').slice(0, 160)}...
              </p>
            </div>

            {/* Recipient summary & Delivery Telemetry Footer */}
            <div className="comm-sent-card-footer">
              <div className="comm-sent-recipients">
                <Users size={14} className="text-slate-500" />
                <span className="comm-recipients-text">
                  To: {msg.recipients?.roles?.join(', ') || 'All Campus Users'}
                  {msg.recipients?.branch?.length > 0 && ` (${msg.recipients.branch.join(', ')})`}
                </span>
              </div>

              <div className="comm-sent-stats">
                {msg.attachments?.length > 0 && (
                  <span className="comm-stat-attachment" title={`${msg.attachments.length} file attached`}>
                    <Paperclip size={13} /> {msg.attachments.length}
                  </span>
                )}
                <div className="comm-stat-metric">
                  <CheckCheck size={14} className="text-sky-600" />
                  <span>Delivered: <strong>{msg.deliveredCount || msg.totalRecipients || 0}</strong></span>
                </div>
                <div className="comm-stat-metric">
                  <Eye size={14} className="text-emerald-600" />
                  <span>Read: <strong>{msg.readCount || 0}</strong></span>
                </div>
                <span className="comm-status-badge status-delivered">
                  {msg.status || 'Delivered'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="comm-empty-state">
            <Send size={40} className="text-slate-300 mb-2" />
            <h4 className="text-slate-700 font-semibold">No Sent Messages Found</h4>
            <p className="text-slate-500 text-sm">
              {searchQuery ? 'Try adjusting your search filters.' : 'Messages you dispatch will appear in this audited communication log.'}
            </p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="comm-modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="comm-modal-container max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="comm-modal-header">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`comm-priority-badge ${getPriorityBadgeClass(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </span>
                  <span className="comm-type-pill">{selectedMessage.messageType}</span>
                  <span className="text-xs text-slate-400 font-mono">{selectedMessage.id}</span>
                </div>
                <h2 className="comm-modal-title">{selectedMessage.title}</h2>
                {selectedMessage.heading && (
                  <p className="text-xs text-slate-500">{selectedMessage.heading}</p>
                )}
              </div>
              <button
                type="button"
                className="comm-btn-icon"
                onClick={() => setSelectedMessage(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="comm-modal-body">
              {/* Sender & Delivery Metadata Box */}
              <div className="comm-detail-meta-box">
                <div className="comm-meta-grid">
                  <div>
                    <span className="comm-meta-lbl">Sender</span>
                    <span className="comm-meta-val">{selectedMessage.sender}</span>
                  </div>
                  <div>
                    <span className="comm-meta-lbl">Department</span>
                    <span className="comm-meta-val">{selectedMessage.department || 'Administration'}</span>
                  </div>
                  <div>
                    <span className="comm-meta-lbl">Dispatched At</span>
                    <span className="comm-meta-val">
                      {new Date(selectedMessage.creationDate).toLocaleString('en-GB')}
                    </span>
                  </div>
                  <div>
                    <span className="comm-meta-lbl">Read Ratio</span>
                    <span className="comm-meta-val text-emerald-600 font-bold">
                      {selectedMessage.deliveredCount > 0
                        ? `${Math.round(((selectedMessage.readCount || 0) / selectedMessage.deliveredCount) * 100)}% (${selectedMessage.readCount}/${selectedMessage.deliveredCount})`
                        : '100%'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <strong>Target Audience:</strong> {selectedMessage.recipients?.roles?.join(', ') || 'All Campus Users'}
                  {selectedMessage.recipients?.branch?.length > 0 && ` | Branch: ${selectedMessage.recipients.branch.join(', ')}`}
                  {selectedMessage.recipients?.year?.length > 0 && ` | Year: ${selectedMessage.recipients.year.join(', ')}`}
                  {selectedMessage.recipients?.sections?.length > 0 && ` | Section: ${selectedMessage.recipients.sections.join(', ')}`}
                </div>
              </div>

              {/* Message Content */}
              <div className="comm-detail-content-area">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message Content</h4>
                <div
                  className="prose text-sm text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
                />
              </div>

              {/* Attachments */}
              {selectedMessage.attachments?.length > 0 && (
                <div className="comm-detail-attachments mt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Attached Files ({selectedMessage.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((att, idx) => (
                      <div key={idx} className="comm-detail-att-item">
                        <FileText size={18} className="text-sky-600" />
                        <span className="comm-att-name">{att.name}</span>
                        <span className="comm-att-size">({(att.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="comm-modal-footer">
              <button
                type="button"
                className="comm-btn-secondary"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
