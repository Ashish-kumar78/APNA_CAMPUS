import React, { useState, useMemo } from 'react';
import {
  Building2,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  Check,
  X,
  Layers,
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  Flame
} from 'lucide-react';
import { INITIAL_FACILITIES, INITIAL_MAINTENANCE_TICKETS } from './principalData.js';
import './PrincipalModules.css';

export default function PrincipalInfrastructureModule({ onToast }) {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [tickets, setTickets] = useState(INITIAL_MAINTENANCE_TICKETS);

  // Filters
  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState('All');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('All');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All');

  // Modals
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [updateTicketModal, setUpdateTicketModal] = useState(null); // ticket
  const [facilityDetailsModal, setFacilityDetailsModal] = useState(null);

  // Filtered Facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
        f.department.toLowerCase().includes(facilitySearch.toLowerCase());
      const matchType = facilityTypeFilter === 'All' || f.type.includes(facilityTypeFilter);
      return matchSearch && matchType;
    });
  }, [facilities, facilitySearch, facilityTypeFilter]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchPri = ticketPriorityFilter === 'All' || t.priority === ticketPriorityFilter;
      const matchStatus = ticketStatusFilter === 'All' || t.status === ticketStatusFilter;
      return matchPri && matchStatus;
    });
  }, [tickets, ticketPriorityFilter, ticketStatusFilter]);

  const activeTicketsCount = tickets.filter((t) => t.status !== 'Resolved').length;
  const criticalTicketsCount = tickets.filter((t) => t.priority === 'Critical' && t.status !== 'Resolved').length;

  // Handle Create Ticket
  const handleCreateTicket = (e) => {
    e.preventDefault();
    const form = e.target;
    const facility = form.facility.value.trim();
    const location = form.location.value.trim();
    const category = form.category.value;
    const priority = form.priority.value;
    const description = form.description.value.trim();
    const assignedTo = form.assignedTo.value.trim();

    if (!facility || !description) {
      if (onToast) onToast('Please specify the facility and issue description.');
      return;
    }

    const newTicket = {
      id: `MNT-2026-${Math.floor(450 + Math.random() * 50)}`,
      facility,
      location: location || 'Main Academic Complex',
      category,
      priority,
      description,
      reportedBy: 'Office of the Principal (Executive Dispatch)',
      reportedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      assignedTo: assignedTo || 'Campus Maintenance Team',
      status: 'In Progress',
    };

    setTickets([newTicket, ...tickets]);
    setNewTicketModal(false);
    if (onToast) onToast(`Maintenance ticket ${newTicket.id} logged with priority ${priority}!`);
  };

  // Handle Resolve Ticket
  const handleResolveTicket = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'Resolved' } : t))
    );
    setUpdateTicketModal(null);
    if (onToast) onToast(`Ticket ${ticketId} marked as Resolved.`);
  };

  return (
    <div className="principal-module-container">
      {/* Notice Banner */}
      <div className="principal-banner-notice">
        <div className="principal-banner-text">
          <Building2 size={18} color="#0284c7" />
          <span>
            <strong>Institutional Physical &amp; Digital Estate:</strong> 48 Smart Lecture Halls, 24 Laboratories, Central Computing Hub, 1,200-seat Auditorium, and campus maintenance status.
          </span>
        </div>
        <div className="principal-banner-badge">Infrastructure Health: 97.4%</div>
      </div>

      {/* KPI Stat Strip */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Primary Facilities</span>
            <Building2 size={16} color="#0284c7" />
          </div>
          <div className="principal-stat-box-val">{facilities.length} Blocks</div>
          <div className="principal-stat-box-sub">Lecture Halls, Labs &amp; Common Utilities</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Smart Classrooms</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>100% Operational</div>
          <div className="principal-stat-box-sub">48 Rooms with AV &amp; Hybrid Streaming</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Active Maintenance Tickets</span>
            <Wrench size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val" style={{ color: activeTicketsCount > 0 ? '#d97706' : '#15803d' }}>
            {activeTicketsCount} Active
          </div>
          <div className="principal-stat-box-sub">{criticalTicketsCount} Critical Escalations</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Power &amp; Energy Health</span>
            <Zap size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val">500 kW Solar</div>
          <div className="principal-stat-box-sub">100% Green Energy Net-Metering</div>
        </div>
      </div>

      {/* SECTION 1: Facilities Overview Table */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Institutional Facilities &amp; Physical Infrastructure Assets</h3>
            <p>Classrooms, specialized laboratories, auditorium, and student residential halls</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="principal-search-bar" style={{ minWidth: '180px' }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search facility..."
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
              />
            </div>
            <select
              className="principal-select-filter"
              value={facilityTypeFilter}
              onChange={(e) => setFacilityTypeFilter(e.target.value)}
            >
              <option value="All">All Facility Types</option>
              <option value="Classroom">Smart Classrooms</option>
              <option value="Laboratory">Computer &amp; Engg Labs</option>
              <option value="Examination">Examination Halls</option>
              <option value="Auditorium">Auditorium</option>
              <option value="Library">Library &amp; E-Resources</option>
              <option value="Residence">Hostels / Residences</option>
            </select>
          </div>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Facility Name &amp; ID</th>
                <th>Type</th>
                <th>Seating / Desk Capacity</th>
                <th>Department Custodian</th>
                <th>AV / Smart Enabled</th>
                <th>Operational Status</th>
                <th>Last Inspected</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacilities.map((fac) => (
                <tr key={fac.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{fac.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Asset ID: {fac.id}</div>
                  </td>
                  <td>
                    <span className="pbadge slate">{fac.type}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{fac.capacity}</td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{fac.department}</td>
                  <td>
                    <span className={`pbadge ${fac.avEquipped ? 'success' : 'slate'}`}>
                      {fac.avEquipped ? '✓ Smart AV' : 'Standard'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`pbadge ${
                        fac.status.includes('100%') ? 'success' : 'warning'
                      }`}
                    >
                      {fac.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{fac.lastInspected}</td>
                  <td>
                    <button
                      className="erp-btn erp-btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => setFacilityDetailsModal(fac)}
                    >
                      <Eye size={13} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Maintenance Requests & Equipment Issues Queue */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Campus Maintenance &amp; Equipment Repair Escalations</h3>
            <p>Civil, electrical, plumbing, and laboratory hardware issues under Campus Estate management</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="principal-select-filter"
              value={ticketPriorityFilter}
              onChange={(e) => setTicketPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Normal">Normal Priority</option>
            </select>

            <select
              className="principal-select-filter"
              value={ticketStatusFilter}
              onChange={(e) => setTicketStatusFilter(e.target.value)}
            >
              <option value="All">All Ticket Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Resolved">Resolved</option>
            </select>

            <button className="erp-btn erp-btn-primary" onClick={() => setNewTicketModal(true)}>
              <Plus size={15} /> Log Executive Ticket
            </button>
          </div>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Ticket ID &amp; Facility</th>
                <th>Location</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Issue Description</th>
                <th>Assigned Unit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.id}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{t.facility}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#334155' }}>{t.location}</td>
                  <td>
                    <span className="pbadge slate">{t.category}</span>
                  </td>
                  <td>
                    <span
                      className={`pbadge ${
                        t.priority === 'Critical'
                          ? 'danger'
                          : t.priority === 'High'
                          ? 'warning'
                          : 'info'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: '#1e293b', maxWidth: '280px' }}>
                      {t.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                      Reported by: {t.reportedBy} ({t.reportedDate})
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{t.assignedTo}</td>
                  <td>
                    <span
                      className={`pbadge ${
                        t.status === 'Resolved'
                          ? 'success'
                          : t.status === 'In Progress'
                          ? 'warning'
                          : 'info'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {t.status !== 'Resolved' ? (
                      <button
                        className="erp-btn erp-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#15803d' }}
                        onClick={() => setUpdateTicketModal(t)}
                      >
                        <Check size={13} /> Resolve
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: LOG EXECUTIVE TICKET                           */}
      {/* ======================================================== */}
      {newTicketModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '540px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Log Campus Infrastructure Maintenance Order</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewTicketModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="principal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Facility / Building *
                  </label>
                  <select
                    name="facility"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      background: '#ffffff',
                    }}
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.name}>{fac.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Specific Location / Room Number
                  </label>
                  <input
                    name="location"
                    type="text"
                    placeholder="e.g. Wing B, Room 204 or Substation Bay 1"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Issue Category
                    </label>
                    <select
                      name="category"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: '#ffffff',
                      }}
                    >
                      <option value="Electrical & AV">Electrical &amp; AV</option>
                      <option value="Plumbing & Water Flow">Plumbing &amp; Water Flow</option>
                      <option value="Laboratory Equipment">Laboratory Equipment</option>
                      <option value="Civil & Structural">Civil &amp; Structural</option>
                      <option value="HVAC & Air Conditioning">HVAC &amp; Air Conditioning</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Executive Priority
                    </label>
                    <select
                      name="priority"
                      defaultValue="High"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: '#ffffff',
                      }}
                    >
                      <option value="Critical">Critical Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Normal">Normal Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Detailed Issue Description *
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Describe the malfunction, equipment fault, or safety observation..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Assigned Maintenance Unit
                  </label>
                  <input
                    name="assignedTo"
                    type="text"
                    defaultValue="Campus Maintenance Plumbing & Electrical Unit"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>
              <div className="principal-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setNewTicketModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <CheckCircle2 size={15} /> Dispatch Maintenance Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RESOLVE TICKET CONFIRMATION                    */}
      {/* ======================================================== */}
      {updateTicketModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '480px' }}>
            <div className="principal-modal-header">
              <h3 style={{ margin: 0 }}>Mark Maintenance Order as Resolved</h3>
              <button
                type="button"
                onClick={() => setUpdateTicketModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: 0 }}>
                Confirming completion of repair works for <strong>Ticket {updateTicketModal.id}</strong> ({updateTicketModal.facility}).
              </p>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div><strong>Issue:</strong> {updateTicketModal.description}</div>
                <div><strong>Location:</strong> {updateTicketModal.location}</div>
                <div><strong>Assigned To:</strong> {updateTicketModal.assignedTo}</div>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setUpdateTicketModal(null)}>
                Cancel
              </button>
              <button className="erp-btn erp-btn-primary" onClick={() => handleResolveTicket(updateTicketModal.id)}>
                <CheckCircle2 size={15} /> Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: FACILITY DETAILS PREVIEW                        */}
      {/* ======================================================== */}
      {facilityDetailsModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '540px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Facility Asset: {facilityDetailsModal.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setFacilityDetailsModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#0f172a' }}>{facilityDetailsModal.name}</h4>
                <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600, marginTop: 2 }}>
                  Type: {facilityDetailsModal.type} · Custodian: {facilityDetailsModal.department}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Capacity</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{facilityDetailsModal.capacity}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>AV Equipment</small>
                  <div style={{ fontWeight: 700, color: facilityDetailsModal.avEquipped ? '#15803d' : '#64748b' }}>
                    {facilityDetailsModal.avEquipped ? 'Fully Integrated AV' : 'Standard Audio Only'}
                  </div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Operational Status</small>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>{facilityDetailsModal.status}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Last Fire &amp; Safety Audit</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{facilityDetailsModal.lastInspected}</div>
                </div>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setFacilityDetailsModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
