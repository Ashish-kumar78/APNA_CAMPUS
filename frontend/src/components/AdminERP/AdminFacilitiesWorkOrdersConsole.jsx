import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Building2,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HardHat,
  ChevronRight,
  X,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminFacilitiesWorkOrdersConsole({ account }) {
  const [subTab, setSubTab] = useState('workorders'); // 'workorders', 'inventory', 'preventive', 'safety'
  const [workOrders, setWorkOrders] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [preventive, setPreventive] = useState([]);
  const [safety, setSafety] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [woForm, setWoForm] = useState({
    title: '',
    facility: 'Aryabhata Academic Block - 2nd Floor',
    category: 'Electrical High-Tension',
    priority: 'Normal',
    assignedTeam: 'Estate Facilities - Electrical Unit',
    technician: 'Duty Electrician',
    targetDate: '2026-11-05',
    description: '',
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [woRes, invRes, pmRes, safRes] = await Promise.allSettled([
        api.getAdminFacilitiesWorkOrders(),
        api.getAdminFacilitiesInventory(),
        api.getAdminFacilitiesPreventiveMaintenance(),
        api.getAdminFacilitiesSafetyInspections(),
      ]);

      if (woRes.status === 'fulfilled' && Array.isArray(woRes.value?.data)) {
        setWorkOrders(woRes.value.data);
      }
      if (invRes.status === 'fulfilled' && invRes.value?.data) {
        setInventory(invRes.value.data);
      }
      if (pmRes.status === 'fulfilled' && Array.isArray(pmRes.value?.data)) {
        setPreventive(pmRes.value.data);
      }
      if (safRes.status === 'fulfilled' && Array.isArray(safRes.value?.data)) {
        setSafety(safRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching facilities data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWo = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAdminFacilitiesWorkOrder(woForm);
      if (res?.data) {
        setWorkOrders([res.data, ...workOrders]);
        setIsWoModalOpen(false);
        showToast(`Work order ${res.data.id} created!`);
      }
    } catch (err) {
      alert('Error creating work order: ' + err.message);
    }
  };

  const handleAdvanceWoStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ASSIGNED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      const res = await api.updateAdminFacilitiesWorkOrder(id, {
        status: nextStatus,
        notes: nextStatus === 'COMPLETED' ? 'Work completed and verified by Estate Supervisor' : 'Technician dispatched onsite',
      });
      if (res?.data) {
        setWorkOrders(workOrders.map(w => w.id === id ? res.data : w));
        showToast(`Work order ${id} marked ${nextStatus.toLowerCase()}!`);
      }
    } catch (err) {
      alert('Error updating work order: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981',
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="admin-view-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <Wrench size={13} />
            Facilities, Estate &amp; Maintenance Operations
          </div>
          <h2>Campus Infrastructure, Work Orders &amp; Preventive Maintenance</h2>
          <p>
            Building directories, mechanical, electrical, and HVAC work orders, preventive equipment servicing, and statutory safety certifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {subTab === 'workorders' && (
            <button className="admin-action-btn-primary" onClick={() => setIsWoModalOpen(true)}>
              <Plus size={14} /> Log Work Order
            </button>
          )}
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '8px',
      }}>
        {[
          { id: 'workorders', label: 'Active Work Orders', icon: Wrench, count: workOrders.filter(w => w.status !== 'COMPLETED').length },
          { id: 'inventory', label: 'Campus Buildings & Facilities', icon: Building2 },
          { id: 'preventive', label: 'Preventive Schedules', icon: Calendar, count: preventive.length },
          { id: 'safety', label: 'Safety & Statutory NOCs', icon: ShieldCheck, count: safety.length },
        ].map(t => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              <Icon size={14} />
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  borderRadius: '12px',
                  padding: '1px 6px',
                  fontSize: '11px',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Active Work Orders */}
      {subTab === 'workorders' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Campus Facilities Work Order Management
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Track issues from logging to technician assignment, work execution, and supervisor sign-off.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>WO Number</th>
                  <th>Task Title &amp; Category</th>
                  <th>Location / Facility</th>
                  <th>Assigned Team &amp; Technician</th>
                  <th>Target Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map(wo => (
                  <tr key={wo.id}>
                    <td>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                        {wo.id}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{wo.title}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Category: {wo.category}
                      </div>
                      {wo.workNotes && (
                        <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                          Notes: {wo.workNotes}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#334155' }}>{wo.facility}</td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{wo.assignedTeam}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Tech: {wo.technician}</div>
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#475569' }}>{wo.targetDate}</td>
                    <td>
                      <span className={`admin-badge ${wo.priority === 'Critical' ? 'rejected' : wo.priority === 'High' ? 'duty' : 'active'}`}>
                        {wo.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${wo.status === 'COMPLETED' ? 'active' : wo.status === 'IN_PROGRESS' ? 'duty' : 'pending'}`}>
                        {wo.status}
                      </span>
                    </td>
                    <td>
                      {wo.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleAdvanceWoStatus(wo.id, wo.status)}
                          className="admin-action-btn-primary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          {wo.status === 'ASSIGNED' ? 'Start Work' : 'Mark Done'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                          ✓ Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Campus Buildings & Facilities Inventory */}
      {subTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Academic Blocks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{inventory?.totalBuildings || 6}</div>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>All autonomous buildings operational</div>
            </div>

            <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Instructional Rooms</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#047857', margin: '4px 0' }}>{inventory?.totalRooms || 142}</div>
              <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Smart Classrooms &amp; Lecture Theatres</div>
            </div>

            <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Research &amp; Lab Equipment</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>{inventory?.totalLabEquipment || 164}</div>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>Barcoded assets in Lab register</div>
            </div>

            <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Hostel Rooms</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309', margin: '4px 0' }}>{inventory?.totalHostelRooms || 240}</div>
              <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>Boys &amp; Girls Hostels</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {(inventory?.buildings || [
              { id: 'BLD-01', name: 'Dr. A.P.J. Abdul Kalam Block', totalRooms: 44, floors: 4, primaryUse: 'CSE, IT & Advanced AI Computing Labs' },
              { id: 'BLD-02', name: 'Aryabhata Academic Complex', totalRooms: 38, floors: 4, primaryUse: 'ECE & Electrical Engineering Laboratories' },
              { id: 'BLD-03', name: 'Sir M. Visvesvaraya Mechanical Complex', totalRooms: 26, floors: 3, primaryUse: 'Mechanical & Civil Engineering Workshops' },
              { id: 'BLD-04', name: 'Ramanujan Lecture Theatre Complex', totalRooms: 20, floors: 3, primaryUse: 'Smart Classrooms & Audio-Visual Theatres' },
            ]).map(bld => (
              <div key={bld.id} className="admin-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>{bld.id}</code>
                  <span className="admin-badge boys" style={{ fontSize: '11px' }}>{bld.floors} Floors</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>{bld.name}</h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Total Capacity: <strong>{bld.totalRooms} Rooms / Labs</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px', color: '#334155' }}>
                  Dedicated to: {bld.primaryUse}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Preventive Maintenance */}
      {subTab === 'preventive' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
          {preventive.map(pm => (
            <div key={pm.id} className="admin-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="admin-badge duty" style={{ fontSize: '11px' }}>
                  {pm.frequency} Routine
                </span>
                <span className={`admin-badge ${pm.status === 'SCHEDULED' ? 'active' : 'pending'}`}>
                  {pm.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {pm.asset}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '10px' }}>
                <div>Last Serviced: <strong>{pm.lastExecuted}</strong></div>
                <div>Next Scheduled Due: <strong style={{ color: '#2563eb' }}>{pm.nextDue}</strong></div>
                <div>Assigned To: <strong>{pm.assignedTo}</strong></div>
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                <div style={{ fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Maintenance Checklist:</div>
                <ul style={{ margin: 0, paddingLeft: '16px', color: '#334155' }}>
                  {(pm.checklist || []).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 4: Safety & Statutory NOCs */}
      {subTab === 'safety' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
          {safety.map(saf => (
            <div key={saf.id} className="admin-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="admin-badge boys" style={{ fontSize: '11px' }}>
                  {saf.inspectingAgency}
                </span>
                <span className="admin-badge active" style={{ fontSize: '11px' }}>
                  {saf.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {saf.type}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '10px' }}>
                <div>Inspection Date: <strong>{saf.inspectionDate}</strong></div>
                <div>Valid Until: <strong style={{ color: '#059669' }}>{saf.validUntil}</strong></div>
                <div>Certificate / NOC No: <code>{saf.certificateNo}</code></div>
                <div>Rating Outcome: <strong style={{ color: '#2563eb' }}>{saf.rating}</strong></div>
              </div>

              <button
                onClick={() => showToast(`NOC certificate ${saf.certificateNo} downloaded`)}
                className="admin-action-btn-secondary"
                style={{ width: '100%', fontSize: '11px', padding: '5px' }}
              >
                Download Certified NOC Dossier
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Log Work Order */}
      {isWoModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '500px', width: '100%', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setIsWoModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 12px 0' }}>
              Log Maintenance Work Order
            </h3>
            <form onSubmit={handleCreateWo} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Work Order Title</label>
                <input
                  type="text"
                  required
                  value={woForm.title}
                  onChange={(e) => setWoForm({ ...woForm, title: e.target.value })}
                  placeholder="e.g. Repair of Lab 304 Circuit Breaker"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Facility Location</label>
                <input
                  type="text"
                  required
                  value={woForm.facility}
                  onChange={(e) => setWoForm({ ...woForm, facility: e.target.value })}
                  placeholder="e.g. Dr. A.P.J. Abdul Kalam Block - 3rd Floor Lab 304"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Category</label>
                  <select
                    value={woForm.category}
                    onChange={(e) => setWoForm({ ...woForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="HVAC & Climate Control">HVAC &amp; Climate Control</option>
                    <option value="Electrical High-Tension">Electrical</option>
                    <option value="Water & Sanitation">Plumbing &amp; Sanitation</option>
                    <option value="Audio-Visual & Smart Classrooms">AV &amp; Smart Classrooms</option>
                    <option value="Civil & Carpentry">Civil &amp; Carpentry</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Priority</label>
                  <select
                    value={woForm.priority}
                    onChange={(e) => setWoForm({ ...woForm, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Technician / Assigned Team</label>
                <input
                  type="text"
                  value={woForm.assignedTeam}
                  onChange={(e) => setWoForm({ ...woForm, assignedTeam: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Work Description &amp; Fault Details</label>
                <textarea
                  rows={2}
                  value={woForm.description}
                  onChange={(e) => setWoForm({ ...woForm, description: e.target.value })}
                  placeholder="Details of the breakdown or repair instructions..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsWoModalOpen(false)}
                  className="admin-action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

