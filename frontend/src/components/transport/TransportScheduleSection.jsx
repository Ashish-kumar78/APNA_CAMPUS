import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, Clock, Bus, MapPin, Users, Plus, 
  Search, Filter, CheckCircle2, Calendar, FileText, X 
} from 'lucide-react';
import { mockScheduleCalendar } from './transportData';
import './TransportExtraSections.css';

export default function TransportScheduleSection() {
  const [data, setData] = useState(mockScheduleCalendar);
  const [search, setSearch] = useState('');
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'regular' | 'special'
  const [newEventModal, setNewEventModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Special Event Transit');
  const [time, setTime] = useState('09:00 AM - 01:00 PM');
  const [routes, setRoutes] = useState('Special Campus Shuttle');
  const [buses, setBuses] = useState('2');
  const [students, setStudents] = useState('60');
  const [freq, setFreq] = useState('Saturday 31 Oct 2026');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase()) ||
                          item.routesActive.toLowerCase().includes(search.toLowerCase());
      const matchTab = viewTab === 'all' || 
                       (viewTab === 'regular' && item.category === 'Regular Fleet Run') ||
                       (viewTab === 'special' && item.category !== 'Regular Fleet Run');
      return matchSearch && matchTab;
    });
  }, [data, search, viewTab]);

  const handleAddSchedule = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `SCH-0${data.length + 1}`,
      title,
      category,
      time,
      routesActive: routes,
      busesDeployed: parseInt(buses, 10) || 1,
      studentsTransported: parseInt(students, 10) || 40,
      frequency: freq
    };
    setData([newEntry, ...data]);
    setNewEventModal(false);
    setTitle('');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><CalendarDays size={24} className="text-sky-600" /> Transport Schedule & Calendar</h2>
          <p>Fleet master timetable, morning/evening daily dispatch runs, placement shuttles, and study tour charters.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-primary" onClick={() => setNewEventModal(true)}>
            <Plus size={16} /> Schedule Special Event Trip
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><CalendarDays size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{data.length}</span>
            <span className="trans-kpi-title">Active Time Slots</span>
            <span className="trans-kpi-subtitle">Weekly scheduled runs</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><Bus size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">5 Buses</span>
            <span className="trans-kpi-title">Regular Fleet Roster</span>
            <span className="trans-kpi-subtitle">100% daily availability</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><Users size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">212</span>
            <span className="trans-kpi-title">Daily Passengers</span>
            <span className="trans-kpi-subtitle">Morning & return runs</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">2</span>
            <span className="trans-kpi-title">Upcoming Special Charters</span>
            <span className="trans-kpi-subtitle">Industrial visit & placement</span>
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
              placeholder="Search transit schedule, event..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="trans-tab-pills">
            <button 
              className={`trans-tab-pill ${viewTab === 'all' ? 'active' : ''}`}
              onClick={() => setViewTab('all')}
            >
              All Runs
            </button>
            <button 
              className={`trans-tab-pill ${viewTab === 'regular' ? 'active' : ''}`}
              onClick={() => setViewTab('regular')}
            >
              Regular Academic Runs
            </button>
            <button 
              className={`trans-tab-pill ${viewTab === 'special' ? 'active' : ''}`}
              onClick={() => setViewTab('special')}
            >
              Special Charters & Tours
            </button>
          </div>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> operational schedules
          </span>
        </div>
      </div>

      {/* Schedules Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
        {filteredData.map(item => (
          <div 
            key={item.id} 
            style={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 12, 
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              borderTop: item.category === 'Regular Fleet Run' ? '4px solid #0284c7' : '4px solid #8b5cf6'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`trans-badge ${item.category === 'Regular Fleet Run' ? 'info' : 'purple'}`}>
                  {item.category}
                </span>
                <h3 style={{ margin: '0.5rem 0 0.2rem', fontSize: '1rem', color: '#0f172a' }}>{item.title}</h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} /> {item.frequency}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: 8, fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Dispatch Window:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Coverage / Route:</span>
                <span style={{ fontWeight: 600 }}>{item.routesActive}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Buses Deployed:</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>{item.busesDeployed} Coaches</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Estimated Commuters:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{item.studentsTransported} Students</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Special Event Modal */}
      {newEventModal && (
        <div className="trans-modal-overlay" onClick={() => setNewEventModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><CalendarDays size={18} className="text-sky-600" /> Schedule Special Transportation Run</h3>
              <button className="trans-modal-close" onClick={() => setNewEventModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSchedule}>
              <div className="trans-modal-body">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Trip Name / Event</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="e.g. BPUT Convocation VIP Shuttle" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Event Category</label>
                    <select className="trans-select" style={{ width: '100%' }} value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Special Event Transit">Special Event Transit</option>
                      <option value="Academic Field Trip">Academic Field Trip / Industrial Visit</option>
                      <option value="Placement Campus Shuttle">Placement Campus Shuttle</option>
                      <option value="Sports Tournament Transit">Sports Tournament Transit</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Operational Timing</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={time} onChange={e => setTime(e.target.value)} required />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Transit Route Path</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={routes} onChange={e => setRoutes(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Buses Deployed</label>
                    <input type="number" className="trans-select" style={{ width: '100%' }} value={buses} onChange={e => setBuses(e.target.value)} required />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Estimated Passenger Count</label>
                    <input type="number" className="trans-select" style={{ width: '100%' }} value={students} onChange={e => setStudents(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Date of Transit</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={freq} onChange={e => setFreq(e.target.value)} required />
                  </div>
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setNewEventModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Add Schedule Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
