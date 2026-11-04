import React, { useState, useEffect, useMemo } from 'react';
import {
  X, CheckCircle2, XCircle, Clock, AlertTriangle, Search, Filter,
  Building2, Shield, ShieldAlert, User, Phone, ArrowRight, RotateCcw,
  ExternalLink, FileText, Check, CheckSquare, Square, MessageSquare,
  Send, Wrench, RefreshCw, Calendar, Tag, AlertCircle, ChevronDown,
  ChevronUp, CheckCheck
} from 'lucide-react';
import {
  getWardenPendingTasksStore,
  updateWardenPendingTaskStatusStore,
  batchActionWardenPendingTasksStore,
  syncWardenPendingTasksFromBackend
} from '../../../services/wardenManagementStore.js';

export default function WardenPendingTasksModal({
  warden,
  onClose,
  showToast,
  onTaskUpdated
}) {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, resolved: 0, criticalOrHigh: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Selected for batch action
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  // Expanded task history
  const [expandedTaskIds, setExpandedTaskIds] = useState(new Set());

  // Custom remarks per task
  const [remarksMap, setRemarksMap] = useState({});

  // Active action processing
  const [actionProcessingId, setActionProcessingId] = useState(null);

  // Load tasks on mount and sync with backend
  const loadTasks = async (syncBackend = true) => {
    if (!warden) return;
    setIsLoading(true);
    const localData = getWardenPendingTasksStore(warden.id);
    setTasks(localData.tasks || []);
    setSummary(localData.summary || {});
    setIsLoading(false);

    if (syncBackend) {
      setIsSyncing(true);
      try {
        const synced = await syncWardenPendingTasksFromBackend(warden.id);
        if (synced && synced.tasks) {
          setTasks(synced.tasks);
          if (synced.summary) setSummary(synced.summary);
        }
      } catch (err) {
        console.warn('Backend sync error:', err?.message || err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    loadTasks(true);

    const handleUpdate = (e) => {
      if (e.detail && e.detail.wardenId === warden?.id) {
        const updatedData = getWardenPendingTasksStore(warden.id);
        setTasks(updatedData.tasks || []);
        setSummary(updatedData.summary || {});
        if (onTaskUpdated) {
          onTaskUpdated(warden.id, updatedData.pendingCount);
        }
      }
    };

    window.addEventListener('apna_warden_tasks_updated', handleUpdate);
    return () => {
      window.removeEventListener('apna_warden_tasks_updated', handleUpdate);
    };
  }, [warden?.id]);

  // Handle single task status update
  const handleUpdateStatus = async (task, newStatus, actionName = 'Updated') => {
    setActionProcessingId(task.id);
    const remark = remarksMap[task.id] || '';

    try {
      const res = updateWardenPendingTaskStatusStore(
        warden.id,
        task.id,
        { status: newStatus, remarks: remark, resolutionNote: remark },
        'Hostel Administrator'
      );

      if (res && res.task) {
        // Optimistic UI refresh
        const refreshed = getWardenPendingTasksStore(warden.id);
        setTasks(refreshed.tasks);
        setSummary(refreshed.summary);

        if (showToast) {
          showToast(`Docket #${task.docketNumber} marked as ${newStatus}`, 'success');
        }

        if (onTaskUpdated) {
          onTaskUpdated(warden.id, res.pendingCount);
        }

        // Clear remarks for this task
        setRemarksMap(prev => {
          const next = { ...prev };
          delete next[task.id];
          return next;
        });
      }
    } catch (err) {
      console.error('Error updating task:', err);
      if (showToast) {
        showToast(`Failed to update docket: ${err.message}`, 'error');
      }
    } finally {
      setActionProcessingId(null);
    }
  };

  // Handle Batch Actions
  const handleBatchAction = async (action) => {
    if (selectedTaskIds.size === 0) return;
    setIsLoading(true);

    const idList = Array.from(selectedTaskIds);
    try {
      const res = batchActionWardenPendingTasksStore(
        warden.id,
        idList,
        action,
        `Batch ${action} processed by Hostel Administrator.`
      );

      const refreshed = getWardenPendingTasksStore(warden.id);
      setTasks(refreshed.tasks);
      setSummary(refreshed.summary);
      setSelectedTaskIds(new Set());

      if (showToast) {
        showToast(`${res.updatedCount} dockets successfully updated (${action})!`, 'success');
      }

      if (onTaskUpdated) {
        onTaskUpdated(warden.id, res.pendingCount);
      }
    } catch (err) {
      console.error('Batch action error:', err);
      if (showToast) showToast('Failed to execute batch action.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection
  const toggleSelectTask = (taskId) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)));
    }
  };

  const toggleHistory = (taskId) => {
    setExpandedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.docketNumber && t.docketNumber.toLowerCase().includes(q)) ||
        (t.studentName && t.studentName.toLowerCase().includes(q)) ||
        (t.studentRoll && t.studentRoll.toLowerCase().includes(q)) ||
        (t.studentRoom && t.studentRoom.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedStatus !== 'ALL') {
      list = list.filter(t => t.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    if (selectedPriority !== 'ALL') {
      list = list.filter(t => t.priority.toLowerCase() === selectedPriority.toLowerCase());
    }

    return list;
  }, [tasks, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'Gate Pass & Exit', label: 'Gate Passes' },
    { id: 'Room Maintenance', label: 'Complaints & Repairs' },
    { id: 'Room Reallocation', label: 'Room Transfers' },
    { id: 'Curfew & Night Roll Call', label: 'Curfew Flags' },
    { id: 'Dining & Mess', label: 'Mess & Dining' },
    { id: 'Staff & Indents', label: 'Staff Indents' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
      case 'Resolved':
        return 'had-badge success';
      case 'In Progress':
      case 'Under Inspection':
        return 'had-badge info';
      case 'Escalated to Admin':
        return 'had-badge danger';
      case 'Pending Warden Approval':
      case 'Pending Verification':
      case 'Awaiting Inspection':
      case 'Pending Approval':
        return 'had-badge warning';
      default:
        return 'had-badge neutral';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'had-badge danger';
      case 'High':
        return 'had-badge warning';
      case 'Medium':
        return 'had-badge info';
      default:
        return 'had-badge neutral';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Gate Pass & Exit':
        return <ArrowRight size={14} className="text-blue-600" />;
      case 'Room Maintenance':
        return <Wrench size={14} className="text-amber-600" />;
      case 'Room Reallocation':
        return <Building2 size={14} className="text-purple-600" />;
      case 'Curfew & Night Roll Call':
        return <Clock size={14} className="text-rose-600" />;
      case 'Dining & Mess':
        return <FileText size={14} className="text-emerald-600" />;
      default:
        return <Shield size={14} className="text-slate-600" />;
    }
  };

  if (!warden) return null;

  return (
    <div className="wm-modal-backdrop" onClick={onClose}>
      <div
        className="wm-modal"
        style={{ maxWidth: '1050px', maxHeight: '92vh', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="wm-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                background: '#eff6ff',
                color: '#2563eb',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe'
              }}>
                <Clock size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Warden Operational Dockets & Pending Tasks
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span>Supervisory review for <strong>{warden.name}</strong> ({warden.id})</span>
                  <span>·</span>
                  <span>{warden.hostelName}</span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                    {isSyncing ? 'Synchronizing with Campus Backend...' : 'Live Backend Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="had-btn had-btn-secondary"
              onClick={() => loadTasks(true)}
              disabled={isSyncing}
              title="Refresh and sync live from backend"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <RotateCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
            </button>
            <button
              className="had-btn had-btn-secondary"
              onClick={onClose}
              title="Close modal"
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Warden Summary KPI Strip */}
        <div style={{
          padding: '1rem 1.5rem',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem'
        }}>
          {/* Warden Identity Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: 'span 2' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#eff6ff',
              border: '2px solid #3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#1d4ed8',
              fontSize: '1rem',
              flexShrink: 0
            }}>
              {warden.name ? warden.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('') : 'W'}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                {warden.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {warden.designation} · {warden.dutyShift}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>
                {warden.email} · {warden.phone}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '0.65rem 0.9rem',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              Pending Tasks
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
              {summary.pending ?? tasks.filter(t => !['Approved', 'Resolved', 'Rejected'].includes(t.status)).length}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#92400e' }}>Awaiting Action</div>
          </div>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            padding: '0.65rem 0.9rem',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
              High Priority / SLA
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
              {tasks.filter(t => (t.priority === 'Critical' || t.priority === 'High') && !['Approved', 'Resolved', 'Rejected'].includes(t.status)).length}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#991b1b' }}>Requires Urgent Review</div>
          </div>

          <div style={{
            background: '#ecfdf5',
            border: '1px solid #d1fae5',
            padding: '0.65rem 0.9rem',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
              Cleared / Resolved
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              {tasks.filter(t => t.status === 'Approved' || t.status === 'Resolved').length}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#065f46' }}>Completed Dockets</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{
          padding: '0.85rem 1.5rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0.45rem 0.75rem',
            width: '280px'
          }}>
            <Search size={15} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search docket, student, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.82rem',
                color: '#0f172a'
              }}
            />
            {searchQuery && (
              <X
                size={14}
                style={{ color: '#94a3b8', cursor: 'pointer' }}
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', flexWrap: 'wrap' }}>
            {categories.map(c => {
              const active = selectedCategory === c.id;
              const count = c.id === 'ALL'
                ? tasks.length
                : tasks.filter(t => t.category.toLowerCase() === c.id.toLowerCase()).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: active ? '#3b82f6' : '#cbd5e1',
                    background: active ? '#eff6ff' : '#ffffff',
                    color: active ? '#1d4ed8' : '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{c.label}</span>
                  <span style={{
                    fontSize: '0.68rem',
                    background: active ? '#dbeafe' : '#f1f5f9',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    color: active ? '#1e40af' : '#64748b'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status & Priority dropdowns */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.4rem 0.65rem',
                fontSize: '0.78rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#334155'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Warden Approval">Pending Warden Approval</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Inspection">Awaiting Inspection</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Escalated to Admin">Escalated to Admin</option>
              <option value="Approved">Approved</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              style={{
                padding: '0.4rem 0.65rem',
                fontSize: '0.78rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#334155'
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Batch Action Bar if any selected */}
        {selectedTaskIds.size > 0 && (
          <div style={{
            background: '#1e293b',
            color: '#f8fafc',
            padding: '0.65rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <CheckSquare size={16} className="text-blue-400" />
              <span><strong>{selectedTaskIds.size}</strong> task(s) selected</span>
              <button
                onClick={() => setSelectedTaskIds(new Set())}
                style={{ background: 'none', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="had-btn"
                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
                onClick={() => handleBatchAction('approve')}
              >
                <CheckCircle2 size={13} /> Approve Selected
              </button>
              <button
                className="had-btn"
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
                onClick={() => handleBatchAction('resolve')}
              >
                <CheckCheck size={13} /> Mark Resolved
              </button>
              <button
                className="had-btn"
                style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
                onClick={() => handleBatchAction('escalate')}
              >
                <ShieldAlert size={13} /> Escalate to Admin
              </button>
            </div>
          </div>
        )}

        {/* Task Cards Body */}
        <div className="wm-modal-body" style={{ background: '#f8fafc', padding: '1.25rem 1.5rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <RotateCcw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#3b82f6' }} />
              <div>Loading operational pending tasks...</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1'
            }}>
              <CheckCircle2 size={42} style={{ color: '#10b981', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                No Pending Tasks Found
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
                {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                  ? 'No operational dockets match your search or filter criteria. Try resetting filters.'
                  : `All operational tasks, gate passes, complaints, and roll call flags for ${warden.name} are cleared and up to date!`}
              </p>
              {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
                <button
                  className="had-btn had-btn-secondary"
                  style={{ marginTop: '1rem', fontSize: '0.78rem' }}
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                    setSelectedPriority('ALL');
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Select all header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span>Select all ({filteredTasks.length} items)</span>
                </label>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Showing {filteredTasks.length} docket{filteredTasks.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Task Items */}
              {filteredTasks.map(task => {
                const isSelected = selectedTaskIds.has(task.id);
                const isExpanded = expandedTaskIds.has(task.id);
                const isProcessing = actionProcessingId === task.id;
                const isPending = !['Approved', 'Resolved', 'Rejected'].includes(task.status);

                return (
                  <div
                    key={task.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                      boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                      padding: '1.1rem 1.25rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {task.docketNumber}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#475569' }}>
                          {getCategoryIcon(task.category)}
                          <strong style={{ color: '#334155' }}>{task.category}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span className={getPriorityBadgeClass(task.priority)}>
                          {task.priority} Priority
                        </span>
                        <span className={getStatusBadgeClass(task.status)}>
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div style={{ marginTop: '0.65rem' }}>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                        {task.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        {task.description}
                      </p>
                    </div>

                    {/* Student & Location Details Box */}
                    {(task.studentName || task.block) && (
                      <div style={{
                        marginTop: '0.75rem',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        borderRadius: '8px',
                        padding: '0.65rem 0.9rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.5rem',
                        fontSize: '0.76rem'
                      }}>
                        {task.studentName && (
                          <div>
                            <span style={{ color: '#64748b' }}>Applicant: </span>
                            <strong style={{ color: '#0f172a' }}>{task.studentName}</strong>
                            {task.studentRoll && <span style={{ color: '#0284c7' }}> ({task.studentRoll})</span>}
                          </div>
                        )}
                        {task.studentRoom && (
                          <div>
                            <span style={{ color: '#64748b' }}>Assigned Room: </span>
                            <strong style={{ color: '#0f172a' }}>{task.studentRoom}</strong>
                            <span style={{ color: '#64748b' }}> · {task.block}</span>
                          </div>
                        )}
                        {task.studentDepartment && (
                          <div>
                            <span style={{ color: '#64748b' }}>Branch / Cohort: </span>
                            <span style={{ color: '#334155' }}>{task.studentDepartment}</span>
                          </div>
                        )}
                        {task.parentConsentVerified !== undefined && (
                          <div>
                            <span style={{ color: '#64748b' }}>Parent Verification: </span>
                            <span style={{
                              fontWeight: 700,
                              color: task.parentConsentVerified ? '#059669' : '#d97706'
                            }}>
                              {task.parentConsentVerified ? 'Verified via SMS OTP' : 'Pending Parental Call'}
                            </span>
                          </div>
                        )}
                        {task.assignedStaff && (
                          <div>
                            <span style={{ color: '#64748b' }}>Assigned Technician: </span>
                            <strong style={{ color: '#0f172a' }}>{task.assignedStaff}</strong>
                          </div>
                        )}
                        {task.dueTime && (
                          <div>
                            <span style={{ color: '#64748b' }}>SLA Target: </span>
                            <strong style={{ color: '#b45309' }}>{task.dueTime}</strong>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timeline & Submission info */}
                    <div style={{
                      marginTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.72rem',
                      color: '#64748b'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} />
                        <span>Submitted: <strong>{task.createdAt}</strong></span>
                      </div>
                      {task.history && task.history.length > 0 && (
                        <button
                          onClick={() => toggleHistory(task.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <span>{isExpanded ? 'Hide Audit Log' : `View Audit History (${task.history.length})`}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </div>

                    {/* Expanded Audit Log Trail */}
                    {isExpanded && task.history && (
                      <div style={{
                        marginTop: '0.65rem',
                        padding: '0.65rem',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        borderLeft: '3px solid #3b82f6'
                      }}>
                        <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                          Workflow Progression Trail:
                        </div>
                        {task.history.map((h, i) => (
                          <div key={i} style={{ marginBottom: '4px', color: '#475569' }}>
                            • <strong>{h.status}</strong> by {h.updatedBy} at {h.timestamp}
                            {h.remarks && <span style={{ color: '#64748b', fontStyle: 'italic' }}> — "{h.remarks}"</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Remark Input (Only for pending tasks) */}
                    {isPending && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Optional administrative note / endorsement remarks..."
                          value={remarksMap[task.id] || ''}
                          onChange={(e) => setRemarksMap({ ...remarksMap, [task.id]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.76rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            background: '#fff'
                          }}
                        />
                      </div>
                    )}

                    {/* Action Buttons Toolbar */}
                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {task.status !== 'Approved' && (
                        <button
                          className="had-btn"
                          disabled={isProcessing}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleUpdateStatus(task, 'Approved', 'Approved')}
                        >
                          <CheckCircle2 size={13} />
                          <span>Approve Docket</span>
                        </button>
                      )}

                      {task.status !== 'Resolved' && (
                        <button
                          className="had-btn"
                          disabled={isProcessing}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleUpdateStatus(task, 'Resolved', 'Resolved')}
                        >
                          <CheckCheck size={13} />
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      {task.status !== 'In Progress' && task.status !== 'Resolved' && (
                        <button
                          className="had-btn had-btn-secondary"
                          disabled={isProcessing}
                          style={{
                            padding: '0.35rem 0.7rem',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            color: '#0284c7',
                            borderColor: '#bae6fd'
                          }}
                          onClick={() => handleUpdateStatus(task, 'In Progress', 'In Progress')}
                        >
                          <Clock size={13} />
                          <span>Set In Progress</span>
                        </button>
                      )}

                      {task.status !== 'Escalated to Admin' && (
                        <button
                          className="had-btn had-btn-secondary"
                          disabled={isProcessing}
                          style={{
                            padding: '0.35rem 0.7rem',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            color: '#7c3aed',
                            borderColor: '#ddd6fe'
                          }}
                          onClick={() => handleUpdateStatus(task, 'Escalated to Admin', 'Escalated')}
                        >
                          <ShieldAlert size={13} />
                          <span>Escalate</span>
                        </button>
                      )}

                      {task.status !== 'Rejected' && (
                        <button
                          className="had-btn had-btn-secondary"
                          disabled={isProcessing}
                          style={{
                            padding: '0.35rem 0.7rem',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            color: '#dc2626',
                            borderColor: '#fecaca'
                          }}
                          onClick={() => handleUpdateStatus(task, 'Rejected', 'Rejected')}
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="wm-modal-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} className="text-blue-600" />
            <span>Campus Administrative Authority · All updates are auditable and synchronized in real time.</span>
          </div>
          <button
            className="had-btn had-btn-secondary"
            onClick={onClose}
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem' }}
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}

