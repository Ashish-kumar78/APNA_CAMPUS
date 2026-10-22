import React, { useState, useMemo } from 'react';
import { 
  Bell, Megaphone, AlertTriangle, Calendar, Plus, 
  Search, Filter, Send, X, Check, Eye, Clock, Users 
} from 'lucide-react';
import { mockTransportNotifications } from './transportData';
import './TransportExtraSections.css';

export default function TransportNotificationsSection() {
  const [data, setData] = useState(mockTransportNotifications);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [newNoticeModal, setNewNoticeModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Safety Alert');
  const [targetGroup, setTargetGroup] = useState('All Commuters & Drivers');
  const [priority, setPriority] = useState('Important');
  const [content, setContent] = useState('');
  const [expiryDate, setExpiryDate] = useState('2026-11-05');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.targetGroup.toLowerCase().includes(search.toLowerCase()) ||
                          item.content.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [data, search, categoryFilter]);

  const handlePublish = (e) => {
    e.preventDefault();
    const newNotice = {
      id: `NOTIF-TRN-0${data.length + 1}`,
      title,
      targetGroup,
      category,
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate,
      priority,
      status: 'Published',
      content,
      author: 'Office of Transport Administrator'
    };
    setData([newNotice, ...data]);
    setNewNoticeModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><Bell size={24} className="text-sky-600" /> Transport Notifications & Announcements</h2>
          <p>Live passenger broadcasts, fog advisories, road diversion alerts, and festive holiday schedules.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-primary" onClick={() => setNewNoticeModal(true)}>
            <Megaphone size={16} /> Broadcast Announcement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Megaphone size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{data.length}</span>
            <span className="trans-kpi-title">Active Circulars</span>
            <span className="trans-kpi-subtitle">Published bulletins</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><AlertTriangle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">
              {data.filter(d => d.priority === 'Urgent').length}
            </span>
            <span className="trans-kpi-title">Urgent Road Warnings</span>
            <span className="trans-kpi-subtitle">Fog & diversion advisories</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><Users size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">212</span>
            <span className="trans-kpi-title">Commuters Notified</span>
            <span className="trans-kpi-subtitle">Sync with student dashboard</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">100%</span>
            <span className="trans-kpi-title">Delivery Rate</span>
            <span className="trans-kpi-subtitle">Portal push feed</span>
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
              placeholder="Search circular title, content..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="ALL">All Circular Categories</option>
            <option value="Safety Alert">Safety Alert</option>
            <option value="Route Change">Route Change</option>
            <option value="Holiday Schedule">Holiday Schedule</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> official circulars
          </span>
        </div>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredData.map(item => (
          <div 
            key={item.id} 
            style={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 12, 
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              borderLeft: item.priority === 'Urgent' ? '4px solid #ef4444' : item.priority === 'Important' ? '4px solid #f59e0b' : '4px solid #0284c7'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{item.title}</h3>
                  <span className={`trans-badge ${item.priority === 'Urgent' ? 'danger' : item.priority === 'Important' ? 'warning' : 'info'}`}>
                    {item.priority}
                  </span>
                  <span className="trans-badge info">{item.category}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                  Target: <strong>{item.targetGroup}</strong> • Published by: {item.author} • Valid until: {item.expiryDate}
                </div>
              </div>
              <span className="trans-badge success">{item.status}</span>
            </div>

            <p style={{ margin: '0.75rem 0', fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
              {item.content}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
              <span>Circular Ref: <code>{item.id}</code></span>
              <button 
                className="trans-btn trans-btn-outline" 
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                onClick={() => setSelectedNotice(item)}
              >
                <Eye size={12} /> Full Notice
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Notice Modal */}
      {selectedNotice && (
        <div className="trans-modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Megaphone size={18} className="text-sky-600" /> BPUT Transport Notice</h3>
              <button className="trans-modal-close" onClick={() => setSelectedNotice(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ border: '2px solid #e2e8f0', borderRadius: 10, padding: '1.25rem', background: '#fafaf9' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, textTransform: 'uppercase' }}>Office of the Transport Administrator</h4>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Biju Patnaik University of Technology, Rourkela / BBSR</div>
                </div>

                <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>{selectedNotice.title}</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                  Date: {selectedNotice.publishDate} | Recipient: {selectedNotice.targetGroup}
                </div>

                <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {selectedNotice.content}
                </div>
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setSelectedNotice(null)}>Close</button>
              <button className="trans-btn trans-btn-primary" onClick={() => window.print()}>Print Official Circular</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {newNoticeModal && (
        <div className="trans-modal-overlay" onClick={() => setNewNoticeModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Megaphone size={18} className="text-sky-600" /> Compose Transport Announcement</h3>
              <button className="trans-modal-close" onClick={() => setNewNoticeModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handlePublish}>
              <div className="trans-modal-body">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Notice Title</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="e.g. Route 3 Morning Stoppage Relocation" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Notice Category</label>
                    <select className="trans-select" style={{ width: '100%' }} value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Safety Alert">Safety Alert / Weather</option>
                      <option value="Route Change">Route Change & Diversion</option>
                      <option value="Holiday Schedule">Holiday Schedule</option>
                      <option value="Bus Delay Notice">Bus Delay Notice</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Target Group</label>
                    <select className="trans-select" style={{ width: '100%' }} value={targetGroup} onChange={e => setTargetGroup(e.target.value)}>
                      <option value="All Commuters & Drivers">All Commuters & Drivers</option>
                      <option value="Route 1 Pass Holders">Route 1 Pass Holders</option>
                      <option value="Route 2 Pass Holders">Route 2 Pass Holders</option>
                      <option value="Route 3 Pass Holders">Route 3 Pass Holders</option>
                      <option value="Bus Drivers Only">Bus Drivers Only</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Priority</label>
                    <select className="trans-select" style={{ width: '100%' }} value={priority} onChange={e => setPriority(e.target.value)}>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent (Flash Banner)</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Expiry Date</label>
                    <input type="date" className="trans-select" style={{ width: '100%' }} value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Circular Text / Instructions</label>
                  <textarea rows={4} className="trans-select" style={{ width: '100%', resize: 'none' }} placeholder="Provide detailed commuter instructions..." value={content} onChange={e => setContent(e.target.value)} required />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setNewNoticeModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">
                  <Send size={14} /> Publish Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
