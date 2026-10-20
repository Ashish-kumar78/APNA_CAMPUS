import React, { useState, useMemo } from 'react';
import { 
  MessageSquareWarning, AlertCircle, CheckCircle2, Clock, 
  Search, Filter, User, Bus, Check, X, FileText 
} from 'lucide-react';
import { mockTransportComplaints } from './transportData';
import './TransportExtraSections.css';

export default function TransportComplaintsSection() {
  const [data, setData] = useState(mockTransportComplaints);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          item.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase()) ||
                          item.busNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [data, search, statusFilter, priorityFilter]);

  // Statistics
  const totalCount = data.length;
  const inReviewCount = data.filter(d => d.status === 'In Review').length;
  const resolvedCount = data.filter(d => d.status === 'Resolved').length;
  const highPriorityCount = data.filter(d => d.priority === 'High').length;

  const handleResolve = (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    setData(prev => prev.map(item => {
      if (item.id === activeComplaint.id) {
        return {
          ...item,
          status: 'Resolved',
          resolutionNotes: resolutionInput || 'Resolved with driver consultation and route supervisor briefing.'
        };
      }
      return item;
    }));
    setActiveComplaint(null);
    setResolutionInput('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><MessageSquareWarning size={24} className="text-sky-600" /> Transport Complaints & Feedback</h2>
          <p>Passenger grievance management, driver conduct escalation, punctuality disputes, and resolution audits.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><MessageSquareWarning size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalCount}</span>
            <span className="trans-kpi-title">Total Grievances</span>
            <span className="trans-kpi-subtitle">Logged this semester</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{inReviewCount}</span>
            <span className="trans-kpi-title">Under Investigation</span>
            <span className="trans-kpi-subtitle">Assigned to route supervisor</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{resolvedCount}</span>
            <span className="trans-kpi-title">Grievances Resolved</span>
            <span className="trans-kpi-subtitle">{((resolvedCount/totalCount)*100).toFixed(0)}% redressal score</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><AlertCircle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{highPriorityCount}</span>
            <span className="trans-kpi-title">High Priority</span>
            <span className="trans-kpi-subtitle">Safety & rash driving</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="trans-filter-strip">
        <div className="trans-filter-group">
          <div className="trans-search-input">
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search complaint, student, bus..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select className="trans-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> complaints
          </span>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Student & Roll No</th>
                <th>Subject & Category</th>
                <th>Bus & Route</th>
                <th>Date Filed</th>
                <th>Priority</th>
                <th>Assigned Official</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.studentName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{item.rollNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#0284c7' }}>{item.category}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.busNumber}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.routeName}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>{item.submittedDate}</td>
                  <td>
                    <span className={`trans-badge ${
                      item.priority === 'High' ? 'danger' :
                      item.priority === 'Medium' ? 'warning' : 'info'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#475569' }}>{item.assignedStaff}</td>
                  <td>
                    <span className={`trans-badge ${item.status === 'Resolved' ? 'success' : 'warning'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="trans-btn trans-btn-outline" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => { setActiveComplaint(item); setResolutionInput(item.resolutionNotes || ''); }}
                    >
                      Review & Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review / Resolve Modal */}
      {activeComplaint && (
        <div className="trans-modal-overlay" onClick={() => setActiveComplaint(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><MessageSquareWarning size={18} className="text-sky-600" /> Complaint Case: {activeComplaint.id}</h3>
              <button className="trans-modal-close" onClick={() => setActiveComplaint(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleResolve}>
              <div className="trans-modal-body">
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#0f172a' }}>{activeComplaint.title}</h4>
                    <span className={`trans-badge ${activeComplaint.priority === 'High' ? 'danger' : 'warning'}`}>
                      {activeComplaint.priority} Priority
                    </span>
                  </div>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#334155' }}>
                    {activeComplaint.description}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <span><strong>Student:</strong> {activeComplaint.studentName} ({activeComplaint.rollNumber})</span>
                    <span><strong>Bus:</strong> {activeComplaint.busNumber}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Investigation Findings & Redressal Action Taken:
                  </label>
                  <textarea 
                    rows={4} 
                    className="trans-select" 
                    style={{ width: '100%', resize: 'none' }}
                    placeholder="Enter resolution notes, corrective instructions issued to crew..."
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setActiveComplaint(null)}>Close</button>
                <button type="submit" className="trans-btn trans-btn-success">
                  <Check size={14} /> Submit Resolution & Close Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
