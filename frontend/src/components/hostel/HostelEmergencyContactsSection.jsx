import React, { useState } from 'react';
import {
  PhoneCall,
  Shield,
  Activity,
  Zap,
  Building,
  Search,
  Filter,
  CheckCircle2,
  Copy,
  Phone,
  Flame,
  X
} from 'lucide-react';
import { mockEmergencyContactsDirectory } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelEmergencyContactsSection() {
  const [contacts, setContacts] = useState(mockEmergencyContactsDirectory);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeCallModal, setActiveCallModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredContacts = contacts.filter(c => {
    const matchCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${text} to clipboard`);
  };

  return (
    <div className="hostel-section-container">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><PhoneCall size={24} color="#dc2626" /> Emergency Response &amp; Official Hotline Directory</h2>
          <p>24x7 Campus Security · Medical Doctors &amp; Ambulance · Electrical Breakdown · Local Civic Rescue</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            Print Emergency Card
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-filter-group">
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by service, officer name, or hotline..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="hostel-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Campus Security">Campus Security</option>
            <option value="Medical & Ambulance">Medical &amp; Ambulance</option>
            <option value="Hostel Administration">Hostel Administration</option>
            <option value="Electrical & Power">Electrical &amp; Power</option>
            <option value="Civic Services">Civic &amp; Police Services</option>
            <option value="Student Welfare">Student Welfare</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {filteredContacts.length} verified hotlines
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="hostel-cards-grid">
        {filteredContacts.map(contact => {
          const isSecurity = contact.category.includes('Security');
          const isMedical = contact.category.includes('Medical');
          const isCivil = contact.category.includes('Civic');

          return (
            <div
              key={contact.id}
              className="hostel-item-card"
              style={{
                borderTop: isMedical ? '4px solid #dc2626' : (isSecurity ? '4px solid #f97316' : (isCivil ? '4px solid #7c3aed' : '4px solid #2563eb'))
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="h-badge h-badge-medium">{contact.category}</span>
                  <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.02rem', color: '#0f172a', fontWeight: 800 }}>
                    {contact.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                    Officer: {contact.contactPerson}
                  </div>
                </div>
                <span className="h-badge h-badge-approved">
                  ✓ {contact.availability}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Primary Hotline:</span>
                  <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>{contact.phone}</strong>
                </div>
                {contact.altPhone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                    <span>Intercom / Extension:</span>
                    <span>{contact.altPhone}</span>
                  </div>
                )}
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                  Station: 📍 {contact.location}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button
                  className="h-btn h-btn-primary"
                  style={{ flex: 1, fontSize: '0.8rem' }}
                  onClick={() => setActiveCallModal(contact)}
                >
                  <PhoneCall size={14} /> Call Hotline
                </button>
                <button
                  className="h-btn h-btn-secondary"
                  style={{ padding: '0 12px' }}
                  title="Copy number"
                  onClick={() => handleCopy(contact.phone)}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CALL HOTLINE SIMULATION */}
      {activeCallModal && (
        <div className="admin-modal-backdrop" onClick={() => setActiveCallModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '480px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ justifyContent: 'center', borderBottom: 'none' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eff6ff', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                <PhoneCall size={28} color="#2563eb" />
              </div>
            </div>
            <div className="admin-modal-body" style={{ paddingTop: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{activeCallModal.name}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                {activeCallModal.contactPerson} · {activeCallModal.location}
              </p>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dialing Campus Priority Line
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                  {activeCallModal.phone}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                  ● 24x7 Direct Dispatch Enabled
                </div>
              </div>
            </div>
            <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="h-btn h-btn-danger"
                style={{ padding: '8px 24px', fontSize: '0.9rem' }}
                onClick={() => {
                  showToast(`Call ended with ${activeCallModal.name}`);
                  setActiveCallModal(null);
                }}
              >
                Disconnect Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
