// APNA CAMPUS — Smart Communication & Document Management System
// Drafts, Scheduled & Archived Communications Section

import React, { useState, useEffect } from 'react';
import {
  FileEdit, Clock, Archive, Trash2, Edit3, Send, AlertTriangle,
  Calendar, Users, ArrowUpRight, Check, X, RefreshCw
} from 'lucide-react';
import { communicationStore } from '../../services/communicationStore.js';

export default function DraftsScheduledSection({ activeView = 'Drafts', onOpenComposer }) {
  const [drafts, setDrafts] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [archived, setArchived] = useState([]);
  const [actionNotice, setActionNotice] = useState('');

  const refreshData = () => {
    setDrafts(communicationStore.getDrafts());
    setScheduled(communicationStore.getScheduled());
    setArchived(communicationStore.archived || []);
  };

  useEffect(() => {
    refreshData();
    const unsub = communicationStore.subscribe(refreshData);
    return () => unsub();
  }, []);

  const showNotification = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3000);
  };

  // ── Draft Actions ──
  const handleEditDraft = (draft) => {
    if (onOpenComposer) {
      onOpenComposer(draft);
    }
  };

  const handleDeleteDraft = (id) => {
    if (window.confirm('Delete this draft permanently?')) {
      communicationStore.deleteDraft(id);
      showNotification('Draft removed.');
    }
  };

  // ── Scheduled Actions ──
  const handleCancelScheduled = (id) => {
    if (window.confirm('Cancel this scheduled notification dispatch?')) {
      communicationStore.cancelScheduled(id);
      showNotification('Scheduled dispatch cancelled.');
    }
  };

  return (
    <div className="comm-drafts-sched-container">
      {/* Header */}
      <div className="comm-sub-header">
        <div className="comm-sub-header-left">
          <div className="comm-sub-icon-badge">
            {activeView === 'Drafts' && <FileEdit size={22} className="text-amber-600" />}
            {activeView === 'Scheduled' && <Clock size={22} className="text-indigo-600" />}
            {activeView === 'Archived' && <Archive size={22} className="text-slate-600" />}
          </div>
          <div>
            <h2 className="comm-sub-title">
              {activeView === 'Drafts' && 'Saved Communication Drafts'}
              {activeView === 'Scheduled' && 'Scheduled Time-Release Announcements'}
              {activeView === 'Archived' && 'Archived Communications & Gazette History'}
            </h2>
            <p className="comm-sub-desc">
              {activeView === 'Drafts' && 'Resume editing pending circulars, notices or attachments before campus broadcast.'}
              {activeView === 'Scheduled' && 'Automated scheduled delivery queued for future dates and batch timings.'}
              {activeView === 'Archived' && 'Historical records and concluded announcements kept for institutional auditing.'}
            </p>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="comm-alert comm-alert-success">
          <Check size={16} /> {actionNotice}
        </div>
      )}

      {/* ── VIEW 1: DRAFTS ── */}
      {activeView === 'Drafts' && (
        <div className="comm-cards-grid">
          {drafts.map(draft => (
            <div key={draft.id} className="comm-item-card">
              <div className="comm-item-card-header">
                <span className="comm-priority-badge comm-badge-normal">{draft.messageType || 'Draft'}</span>
                <span className="text-xs text-slate-400 font-mono">{draft.id}</span>
              </div>

              <h3 className="comm-item-card-title">{draft.title || 'Untitled Draft'}</h3>
              {draft.heading && (
                <p className="text-xs text-slate-500 font-medium mb-1">{draft.heading}</p>
              )}
              <p className="comm-item-card-desc">
                {draft.body?.replace(/<[^>]*>/g, '').slice(0, 140) || 'No message content...'}
              </p>

              <div className="comm-item-meta-row">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>Modified: {new Date(draft.lastModified).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={12} />
                  <span>{draft.recipients?.roles?.join(', ') || 'Recipients unassigned'}</span>
                </div>
              </div>

              <div className="comm-item-card-actions">
                <button
                  type="button"
                  className="comm-btn-sm comm-btn-secondary"
                  onClick={() => handleDeleteDraft(draft.id)}
                >
                  <Trash2 size={13} className="text-rose-500" /> Delete
                </button>
                <button
                  type="button"
                  className="comm-btn-sm comm-btn-primary"
                  onClick={() => handleEditDraft(draft)}
                >
                  <Edit3 size={13} /> Continue in Composer
                </button>
              </div>
            </div>
          ))}

          {drafts.length === 0 && (
            <div className="comm-empty-state col-span-full">
              <FileEdit size={40} className="text-slate-300 mb-2" />
              <h4 className="text-slate-700 font-semibold">No Pending Drafts</h4>
              <p className="text-slate-500 text-sm">
                Save messages as draft in the Message Composer to resume editing later.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: SCHEDULED ── */}
      {activeView === 'Scheduled' && (
        <div className="comm-cards-grid">
          {scheduled.map(item => (
            <div key={item.id} className="comm-item-card">
              <div className="comm-item-card-header">
                <span className="comm-priority-badge comm-badge-important">Scheduled</span>
                <span className="text-xs text-indigo-600 font-semibold font-mono">{item.id}</span>
              </div>

              <h3 className="comm-item-card-title">{item.title}</h3>
              {item.heading && (
                <p className="text-xs text-slate-500 font-medium mb-1">{item.heading}</p>
              )}
              <p className="comm-item-card-desc">
                {item.body?.replace(/<[^>]*>/g, '').slice(0, 140)}
              </p>

              <div className="comm-scheduled-target-box">
                <div className="flex items-center gap-2 text-xs text-indigo-900 font-medium">
                  <Calendar size={14} className="text-indigo-600" />
                  <span>Release Date: <strong>{new Date(item.scheduledFor).toLocaleString('en-GB')}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                  <Users size={14} className="text-slate-400" />
                  <span>Target: {item.recipients?.roles?.join(', ') || 'All Campus Users'}</span>
                </div>
              </div>

              <div className="comm-item-card-actions">
                <button
                  type="button"
                  className="comm-btn-sm comm-btn-secondary"
                  onClick={() => handleCancelScheduled(item.id)}
                >
                  <X size={13} className="text-rose-500" /> Cancel Schedule
                </button>
                <button
                  type="button"
                  className="comm-btn-sm comm-btn-primary"
                  onClick={() => onOpenComposer && onOpenComposer(item)}
                >
                  <Edit3 size={13} /> Modify Schedule
                </button>
              </div>
            </div>
          ))}

          {scheduled.length === 0 && (
            <div className="comm-empty-state col-span-full">
              <Clock size={40} className="text-slate-300 mb-2" />
              <h4 className="text-slate-700 font-semibold">No Scheduled Messages</h4>
              <p className="text-slate-500 text-sm">
                Schedule announcements for holidays, exam dates, or batch reminders in the Message Composer.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 3: ARCHIVED ── */}
      {activeView === 'Archived' && (
        <div className="comm-cards-grid">
          {archived.map(item => (
            <div key={item.id} className="comm-item-card opacity-90">
              <div className="comm-item-card-header">
                <span className="comm-type-pill">Archived</span>
                <span className="text-xs text-slate-400 font-mono">{item.id}</span>
              </div>
              <h3 className="comm-item-card-title">{item.title}</h3>
              <p className="comm-item-card-desc">{item.body?.slice(0, 120)}...</p>
            </div>
          ))}

          {archived.length === 0 && (
            <div className="comm-empty-state col-span-full">
              <Archive size={40} className="text-slate-300 mb-2" />
              <h4 className="text-slate-700 font-semibold">No Archived Messages</h4>
              <p className="text-slate-500 text-sm">
                Past semester notices and concluded circulars archived by administrators will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
