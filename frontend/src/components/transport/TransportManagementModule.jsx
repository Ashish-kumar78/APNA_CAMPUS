import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Boxes,
  Bus,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Fuel,
  GitPullRequest,
  MapPin,
  Megaphone,
  MessageSquare,
  MessageSquareWarning,
  Navigation,
  Phone,
  Plus,
  Printer,
  QrCode,
  Radio,
  RotateCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Slash,
  Sparkles,
  SquareParking,
  UserCheck,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { transportStore } from '../../services/transportStore';
import { api } from '../../services/api';
import './TransportExtraSections.css';
import '../TransportPortal.css';

import TransportBoardingSection from './TransportBoardingSection.jsx';
import TransportMaintenanceSection from './TransportMaintenanceSection.jsx';
import TransportFuelSection from './TransportFuelSection.jsx';
import TransportFeesSection from './TransportFeesSection.jsx';
import TransportComplianceSection from './TransportComplianceSection.jsx';
import TransportComplaintsSection from './TransportComplaintsSection.jsx';
import TransportAccidentsSection from './TransportAccidentsSection.jsx';
import TransportParkingSection from './TransportParkingSection.jsx';
import TransportStaffAttendanceSection from './TransportStaffAttendanceSection.jsx';
import TransportNotificationsSection from './TransportNotificationsSection.jsx';
import TransportRequestsSection from './TransportRequestsSection.jsx';
import TransportSafetySection from './TransportSafetySection.jsx';
import TransportScheduleSection from './TransportScheduleSection.jsx';
import TransportInventorySection from './TransportInventorySection.jsx';
import TransportSettingsSection from './TransportSettingsSection.jsx';
import TransportAlertsSection from './TransportAlertsSection.jsx';
import TransportDailySummarySection from './TransportDailySummarySection.jsx';
import TransportStudentApplicationsSection from './TransportStudentApplicationsSection.jsx';
import TransportDutyRosterSection from './TransportDutyRosterSection.jsx';
import TransportLicenseVerificationSection from './TransportLicenseVerificationSection.jsx';
import TransportBreakdownSection from './TransportBreakdownSection.jsx';
import TransportFeeReconciliationSection from './TransportFeeReconciliationSection.jsx';
import TransportExpensesSection from './TransportExpensesSection.jsx';

export default function TransportManagementModule({ account, userRole = 'SUPER_ADMIN' }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState('');

  // Store data state
  const [fleet, setFleet] = useState(() => transportStore.getFleet());
  const [routes, setRoutes] = useState(() => transportStore.getRoutes());
  const [passes, setPasses] = useState(() => transportStore.getPasses());
  const [drivers, setDrivers] = useState(() => transportStore.getDrivers());
  const [trips, setTrips] = useState(() => transportStore.getTrips());
  const [telemetry, setTelemetry] = useState(() => transportStore.getTelemetry());

  // Filters & search
  const [fleetSearch, setFleetSearch] = useState('');
  const [fleetFilter, setFleetFilter] = useState('ALL');
  const [routeSearch, setRouteSearch] = useState('');
  const [passSearch, setPassSearch] = useState('');
  const [passFilter, setPassFilter] = useState('ALL');

  // Modals
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAllocatePassModal, setShowAllocatePassModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newVehicleStatus, setNewVehicleStatus] = useState('Active');

  // Forms
  const [newVehicleForm, setNewVehicleForm] = useState({
    busNumber: '',
    fleetCode: '',
    type: '52-Seater Coach',
    capacity: 52,
    driver: '',
    driverPhone: '',
    routeName: '',
    depot: 'Campus Central Bus Bay',
    fuelType: 'Diesel (BS-VI)',
    fitnessExpiry: '2027-12-31',
    insuranceExpiry: '2027-12-31',
  });

  const [newRouteForm, setNewRouteForm] = useState({
    name: '',
    routeNumber: '',
    morningDeparture: '07:15 AM',
    eveningArrival: '05:30 PM',
    stops: '',
    farePerSemester: 15000,
    busNumber: '',
    totalCapacity: 52,
  });

  const [newDriverForm, setNewDriverForm] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    licenseNumber: '',
    licenseCategory: 'HMV (Heavy Passenger Vehicle)',
    licenseExpiry: '2029-12-31',
    experienceYears: 8,
    assignedBus: '',
    shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
  });

  const [allocatePassForm, setAllocatePassForm] = useState({
    studentName: '',
    regNo: '',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    routeName: '',
    stopName: '',
    fareAmount: 15000,
    feePaid: true,
    autoApprove: true,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    transportStore.syncWithBackend();
    const unsub = transportStore.subscribe(state => {
      if (state.fleet) setFleet(state.fleet);
      if (state.routes) setRoutes(state.routes);
      if (state.passes) setPasses(state.passes);
      if (state.drivers) setDrivers(state.drivers);
      if (state.trips) setTrips(state.trips);
      if (state.telemetry) setTelemetry(state.telemetry);
    });
    return unsub;
  }, []);

  // Filtered views
  const filteredFleet = useMemo(() => {
    return fleet.filter(v => {
      const matchSearch = (v.busNumber || '').toLowerCase().includes(fleetSearch.toLowerCase()) ||
                          (v.fleetCode || '').toLowerCase().includes(fleetSearch.toLowerCase()) ||
                          (v.driver || '').toLowerCase().includes(fleetSearch.toLowerCase()) ||
                          (v.routeName || '').toLowerCase().includes(fleetSearch.toLowerCase());
      const matchFilter = fleetFilter === 'ALL' || (v.status || '').includes(fleetFilter);
      return matchSearch && matchFilter;
    });
  }, [fleet, fleetSearch, fleetFilter]);

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => (r.name || '').toLowerCase().includes(routeSearch.toLowerCase()) ||
                              (r.routeNumber || '').toLowerCase().includes(routeSearch.toLowerCase()));
  }, [routes, routeSearch]);

  const filteredPasses = useMemo(() => {
    return passes.filter(p => {
      const matchSearch = (p.studentName || '').toLowerCase().includes(passSearch.toLowerCase()) ||
                          (p.regNo || '').toLowerCase().includes(passSearch.toLowerCase()) ||
                          (p.passNumber || '').toLowerCase().includes(passSearch.toLowerCase());
      const matchFilter = passFilter === 'ALL' || (p.status || '').includes(passFilter);
      return matchSearch && matchFilter;
    });
  }, [passes, passSearch, passFilter]);

  // Handlers
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!transportStore.canPerform(userRole, 'fleet', 'create')) {
      alert('Action not permitted: Admin Office is not authorized to create vehicles.');
      return;
    }
    if (!newVehicleForm.busNumber) {
      alert('Please enter vehicle registration number (e.g. OD-02-AK-4415)');
      return;
    }
    await transportStore.addVehicle(newVehicleForm);
    setShowAddVehicleModal(false);
    setNewVehicleForm({
      busNumber: '',
      fleetCode: '',
      type: '52-Seater Coach',
      capacity: 52,
      driver: '',
      driverPhone: '',
      routeName: '',
      depot: 'Campus Central Bus Bay',
      fuelType: 'Diesel (BS-VI)',
      fitnessExpiry: '2027-12-31',
      insuranceExpiry: '2027-12-31',
    });
    showToast(`Vehicle ${newVehicleForm.busNumber} successfully added to fleet.`);
  };

  const handleUpdateVehicleStatus = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (!transportStore.canPerform(userRole, 'fleet', 'edit')) {
      alert('Action not permitted: Admin Office is not authorized to edit vehicle status.');
      return;
    }
    await transportStore.updateVehicle(selectedVehicle.id, { status: newVehicleStatus });
    setShowStatusModal(false);
    setSelectedVehicle(null);
    showToast(`Vehicle status updated to ${newVehicleStatus}.`);
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!transportStore.canPerform(userRole, 'routes', 'create')) {
      alert('Action not permitted: Admin Office is not authorized to add routes.');
      return;
    }
    if (!newRouteForm.name) {
      alert('Please provide route name.');
      return;
    }
    await transportStore.addRoute(newRouteForm);
    setShowAddRouteModal(false);
    setNewRouteForm({
      name: '',
      routeNumber: '',
      morningDeparture: '07:15 AM',
      eveningArrival: '05:30 PM',
      stops: '',
      farePerSemester: 15000,
      busNumber: '',
      totalCapacity: 52,
    });
    showToast(`Route "${newRouteForm.name}" registered successfully.`);
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!transportStore.canPerform(userRole, 'drivers', 'create')) {
      alert('Action not permitted: Admin Office is not authorized to enroll drivers.');
      return;
    }
    if (!newDriverForm.name || !newDriverForm.licenseNumber) {
      alert('Please enter driver name and valid license number.');
      return;
    }
    await transportStore.addDriver(newDriverForm);
    setShowAddDriverModal(false);
    setNewDriverForm({
      name: '',
      phone: '',
      emergencyContact: '',
      licenseNumber: '',
      licenseCategory: 'HMV (Heavy Passenger Vehicle)',
      licenseExpiry: '2029-12-31',
      experienceYears: 8,
      assignedBus: '',
      shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
    });
    showToast(`Driver ${newDriverForm.name} successfully enrolled.`);
  };

  const handleAllocatePass = async (e) => {
    e.preventDefault();
    if (!transportStore.canPerform(userRole, 'passes', 'create')) {
      alert('Action not permitted: Admin Office is not authorized to allocate passes.');
      return;
    }
    if (!allocatePassForm.regNo || !allocatePassForm.routeName) {
      alert('Please enter registration number and select target route.');
      return;
    }
    await transportStore.allocatePass(allocatePassForm);
    setShowAllocatePassModal(false);
    setAllocatePassForm({
      studentName: '',
      regNo: '',
      department: 'Computer Science & Engineering',
      semester: 'Semester 5',
      routeName: '',
      stopName: '',
      fareAmount: 15000,
      feePaid: true,
      autoApprove: true,
    });
    showToast(`Bus pass generated for ${allocatePassForm.studentName || allocatePassForm.regNo}.`);
  };

  const handlePassAction = async (id, action) => {
    if (!transportStore.canPerform(userRole, 'passes', 'edit')) {
      alert('Action not permitted: Admin Office is not authorized to action passes.');
      return;
    }
    await transportStore.actionPass(id, action);
    showToast(`Pass updated to ${action}.`);
  };

  // Sections navigation definition
  const navTabs = [
    { id: 'overview', label: 'Overview & KPIs', icon: Sparkles },
    { id: 'alerts', label: 'Operational Alerts', icon: AlertTriangle },
    { id: 'daily-summary', label: 'Daily Shift Summary', icon: Clock },
    { id: 'student-applications', label: 'Student Applications', icon: FileText },
    { id: 'duty-roster', label: 'Crew Duty Roster', icon: CalendarDays },
    { id: 'license-verification', label: 'Licence Verification', icon: FileCheck2 },
    { id: 'breakdown-repair', label: 'Breakdown & Repairs', icon: AlertOctagon },
    { id: 'fee-reconciliation', label: 'Fee Reconciliation', icon: RotateCw },
    { id: 'transport-expenses', label: 'Transport Expenses', icon: CreditCard },
    { id: 'fleet', label: 'Fleet Registry', icon: Bus },
    { id: 'routes', label: 'Route Network', icon: MapPin },
    { id: 'passes', label: 'Bus Passes', icon: Users },
    { id: 'drivers', label: 'Driver Crew', icon: Phone },
    { id: 'trips', label: 'Trips & Dispatch', icon: Navigation },
    { id: 'telemetry', label: 'Live GPS Telemetry', icon: Radio },
    { id: 'boarding', label: 'Student Boarding', icon: QrCode },
    { id: 'maintenance', label: 'Maintenance & Garage', icon: Wrench },
    { id: 'fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
    { id: 'fees-dues', label: 'Fees & Dues', icon: CreditCard },
    { id: 'compliance', label: 'RTO Compliance', icon: FileCheck2 },
    { id: 'complaints', label: 'Grievance Redressal', icon: MessageSquareWarning },
    { id: 'accidents', label: 'Accidents & Safety Log', icon: AlertOctagon },
    { id: 'parking', label: 'Bay & Parking Slots', icon: SquareParking },
    { id: 'staff-attendance', label: 'Staff Attendance', icon: UserCheck },
    { id: 'notifications', label: 'Broadcast Feeds', icon: Megaphone },
    { id: 'requests', label: 'Route Change Requests', icon: GitPullRequest },
    { id: 'safety-inspections', label: 'Safety Audits', icon: ShieldCheck },
    { id: 'schedule-calendar', label: 'Transit Schedules', icon: CalendarDays },
    { id: 'inventory', label: 'Spare Parts Inventory', icon: Boxes },
    { id: 'settings-policies', label: 'Policies & RBAC', icon: Settings },
    { id: 'reports', label: 'Analytics Reports', icon: FileText },
  ];

  return (
    <div className="transport-portal-content-wrap" style={{ padding: '0 0 2rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} color="#10b981" /> {toastMessage}
        </div>
      )}

      {/* Top Scope & Role Badge Banner */}
      <div style={{
        background: userRole === 'SUPER_ADMIN' ? 'linear-gradient(135deg, #1e1b4b, #312e81)' : 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: 14,
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bus size={22} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Transport Management System</h2>
            <span style={{
              background: userRole === 'SUPER_ADMIN' ? '#4338ca' : '#0284c7',
              color: '#ffffff',
              padding: '2px 10px',
              borderRadius: 20,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              {userRole === 'SUPER_ADMIN' ? 'SUPER ADMIN ROOT GOVERNANCE' : 'ADMIN OFFICE RBAC ACTIVE'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
            Unified enterprise logistics engine synchronized with PostgreSQL database & live campus telematics.
          </p>
        </div>

        <button 
          className="trans-btn trans-btn-outline" 
          style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
          onClick={() => { transportStore.syncWithBackend(); showToast('Synchronized with PostgreSQL database.'); }}
        >
          <RotateCw size={14} /> Refresh DB Data
        </button>
      </div>

      {/* Horizontal Sub-Navigation Tab Strip */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '6px',
        padding: '8px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        marginBottom: '1.5rem'
      }}>
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAllowed = userRole === 'SUPER_ADMIN' || transportStore.canPerform(userRole, tab.id, 'view');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!isAllowed}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: isAllowed ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
                background: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : isAllowed ? '#475569' : '#94a3b8',
                opacity: isAllowed ? 1 : 0.45,
                transition: 'all 0.15s ease'
              }}
              title={!isAllowed ? 'Section restricted by Super Admin' : tab.label}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SECTION CONTENTS */}
      {/* 1. OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div>
          <div className="trans-kpi-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="trans-kpi-card">
              <div className="trans-kpi-icon sky"><Bus size={22} /></div>
              <div className="trans-kpi-info">
                <span className="trans-kpi-value">{fleet.length}</span>
                <span className="trans-kpi-title">Fleet Vehicles</span>
                <span className="trans-kpi-subtitle">{fleet.filter(v => v.status === 'Active').length} currently active on routes</span>
              </div>
            </div>
            <div className="trans-kpi-card">
              <div className="trans-kpi-icon emerald"><MapPin size={22} /></div>
              <div className="trans-kpi-info">
                <span className="trans-kpi-value">{routes.length}</span>
                <span className="trans-kpi-title">Transit Routes</span>
                <span className="trans-kpi-subtitle">Covering Twin Cities & Suburbs</span>
              </div>
            </div>
            <div className="trans-kpi-card">
              <div className="trans-kpi-icon indigo"><Users size={22} /></div>
              <div className="trans-kpi-info">
                <span className="trans-kpi-value">{passes.filter(p => p.status === 'Active').length}</span>
                <span className="trans-kpi-title">Active Bus Passes</span>
                <span className="trans-kpi-subtitle">{passes.filter(p => p.status.includes('Pending')).length} pending verification</span>
              </div>
            </div>
            <div className="trans-kpi-card">
              <div className="trans-kpi-icon amber"><Phone size={22} /></div>
              <div className="trans-kpi-info">
                <span className="trans-kpi-value">{drivers.filter(d => d.status === 'On Duty').length} / {drivers.length}</span>
                <span className="trans-kpi-title">Drivers on Duty</span>
                <span className="trans-kpi-subtitle">Heavy passenger license certified</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            <div className="trans-table-container" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Live Fleet Operations Snapshot</strong>
                <button className="trans-btn trans-btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => setActiveTab('fleet')}>
                  View All Fleet <Navigation size={12} />
                </button>
              </div>
              <table className="trans-data-table">
                <thead>
                  <tr>
                    <th>Bus Number</th>
                    <th>Assigned Route</th>
                    <th>Status</th>
                    <th>Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {fleet.slice(0, 4).map(v => (
                    <tr key={v.id}>
                      <td><strong>{v.busNumber}</strong><div style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.fleetCode}</div></td>
                      <td style={{ fontSize: '0.82rem' }}>{v.routeName}</td>
                      <td><span className={`trans-badge ${v.status === 'Active' ? 'success' : v.status === 'Available' ? 'info' : 'warning'}`}>{v.status}</span></td>
                      <td style={{ fontSize: '0.82rem' }}>{v.driver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="trans-table-container" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Live Dispatch & Trips In Transit</strong>
                <button className="trans-btn trans-btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => setActiveTab('trips')}>
                  Dispatch Console <Navigation size={12} />
                </button>
              </div>
              <table className="trans-data-table">
                <thead>
                  <tr>
                    <th>Trip Code</th>
                    <th>Route</th>
                    <th>Stage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.slice(0, 4).map(t => (
                    <tr key={t.id}>
                      <td><strong>{t.tripCode}</strong></td>
                      <td style={{ fontSize: '0.82rem' }}>{t.routeName}</td>
                      <td style={{ fontSize: '0.78rem', color: '#475569' }}>{t.currentStage}</td>
                      <td><span className={`trans-badge ${t.status === 'In Transit' ? 'info' : t.status === 'Delayed' ? 'danger' : 'success'}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLEET REGISTRY */}
      {activeTab === 'fleet' && (
        <div className="trans-table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>University Vehicle Fleet & Compliance Registry</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Statutory fitness certificates, insurance renewals, and driver assignments.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {transportStore.canPerform(userRole, 'fleet', 'create') && (
                <button className="trans-btn trans-btn-primary" onClick={() => setShowAddVehicleModal(true)}>
                  <Plus size={16} /> Add Vehicle to Fleet
                </button>
              )}
            </div>
          </div>

          <div className="trans-filter-strip" style={{ margin: '0.75rem 1rem' }}>
            <div className="trans-filter-group">
              <div className="trans-search-input">
                <Search size={16} color="#64748b" />
                <input 
                  type="text" 
                  placeholder="Search bus number, driver, route..." 
                  value={fleetSearch} 
                  onChange={e => setFleetSearch(e.target.value)} 
                />
              </div>
              <select className="trans-select" value={fleetFilter} onChange={e => setFleetFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>Bus & Fleet ID</th>
                  <th>Capacity</th>
                  <th>Assigned Route</th>
                  <th>Driver Details</th>
                  <th>Statutory Expiries</th>
                  <th>Operating Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFleet.map(v => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.busNumber}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{v.fleetCode}</div>
                    </td>
                    <td>{v.capacity} Seats<div style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.type}</div></td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.routeName}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.driver}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{v.driverPhone}</div>
                    </td>
                    <td style={{ fontSize: '0.74rem' }}>
                      <div>Fit: <strong>{v.fitnessExpiry}</strong></div>
                      <div>Ins: <strong>{v.insuranceExpiry}</strong></div>
                    </td>
                    <td>
                      <span className={`trans-badge ${v.status === 'Active' ? 'success' : v.status === 'Available' ? 'info' : 'warning'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {transportStore.canPerform(userRole, 'fleet', 'edit') && (
                        <button 
                          className="trans-btn trans-btn-outline" 
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => { setSelectedVehicle(v); setNewVehicleStatus(v.status); setShowStatusModal(true); }}
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ROUTES */}
      {activeTab === 'routes' && (
        <div className="trans-table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Transit Route Network & Timetable</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Route numbers, scheduled timing, designated stops, and diversion advisories.</p>
            </div>
            {transportStore.canPerform(userRole, 'routes', 'create') && (
              <button className="trans-btn trans-btn-primary" onClick={() => setShowAddRouteModal(true)}>
                <Plus size={16} /> Register New Route
              </button>
            )}
          </div>

          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>Route Code & Name</th>
                  <th>Designated Bus</th>
                  <th>Driver Name</th>
                  <th>Timing</th>
                  <th>Stops Count</th>
                  <th>Pass Tariff</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map(r => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.routeNumber}</strong>
                      <div style={{ fontSize: '0.82rem', color: '#0f172a' }}>{r.name}</div>
                    </td>
                    <td><span className="trans-badge info">{r.busNumber}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{r.driverName}</td>
                    <td style={{ fontSize: '0.78rem' }}>{r.morningDeparture} - {r.eveningArrival}</td>
                    <td>{Array.isArray(r.stops) ? r.stops.length : 6} stops</td>
                    <td><strong>₹{r.farePerSemester?.toLocaleString('en-IN') || '15,000'}</strong></td>
                    <td><span className={`trans-badge ${r.status === 'On Time' ? 'success' : 'warning'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BUS PASSES */}
      {activeTab === 'passes' && (
        <div className="trans-table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Student & Staff Bus Pass Ledger</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Pass allocations, digital QR credentials, fee clearance, and validity verification.</p>
            </div>
            {transportStore.canPerform(userRole, 'passes', 'create') && (
              <button className="trans-btn trans-btn-primary" onClick={() => setShowAllocatePassModal(true)}>
                <Plus size={16} /> Allocate Bus Pass
              </button>
            )}
          </div>

          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>Pass No</th>
                  <th>Student Name & Reg No</th>
                  <th>Department</th>
                  <th>Route & Stop</th>
                  <th>Fee Status</th>
                  <th>Validity</th>
                  <th>Pass Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.passNumber}</strong></td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.studentName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{p.regNo}</div>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>{p.department}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      <div>{p.routeName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.pickupStop}</div>
                    </td>
                    <td><span className={`trans-badge ${p.feePaid ? 'success' : 'danger'}`}>{p.feePaid ? 'Paid' : 'Unpaid'}</span></td>
                    <td style={{ fontSize: '0.75rem' }}>{p.validUpto}</td>
                    <td><span className={`trans-badge ${p.status === 'Active' ? 'success' : 'warning'}`}>{p.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {transportStore.canPerform(userRole, 'passes', 'edit') && (
                        <button 
                          className="trans-btn trans-btn-outline" 
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                          onClick={() => handlePassAction(p.id, p.status === 'Active' ? 'Suspend' : 'Approve')}
                        >
                          {p.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DRIVERS */}
      {activeTab === 'drivers' && (
        <div className="trans-table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Driver & Crew Roster</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Heavy commercial driving licenses, assigned buses, and duty shift tracking.</p>
            </div>
            {transportStore.canPerform(userRole, 'drivers', 'create') && (
              <button className="trans-btn trans-btn-primary" onClick={() => setShowAddDriverModal(true)}>
                <Plus size={16} /> Enroll New Driver
              </button>
            )}
          </div>

          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Phone & Emergency</th>
                  <th>License Number</th>
                  <th>Assigned Bus</th>
                  <th>Shift Timing</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong><div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.experienceYears} yrs exp</div></td>
                    <td>
                      <div>{d.phone}</div>
                      <div style={{ fontSize: '0.72rem', color: '#e11d48' }}>SOS: {d.emergencyContact}</div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.licenseNumber}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Exp: {d.licenseExpiry}</div>
                    </td>
                    <td><span className="trans-badge info">{d.assignedBus}</span></td>
                    <td style={{ fontSize: '0.78rem' }}>{d.shift}</td>
                    <td>⭐ <strong>{d.rating || '5.0'}</strong></td>
                    <td><span className={`trans-badge ${d.status === 'On Duty' ? 'success' : 'warning'}`}>{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TRIPS & DISPATCH */}
      {activeTab === 'trips' && (
        <div className="trans-table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Real-Time Dispatch Console & Active Trips</strong>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Trip departures, waypoint clearance, passenger count, and transit delays.</p>
          </div>

          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Route Name</th>
                  <th>Vehicle</th>
                  <th>Pilot</th>
                  <th>Departure</th>
                  <th>Current Waypoint</th>
                  <th>Passengers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.tripCode}</strong></td>
                    <td>{t.routeName}</td>
                    <td><span className="trans-badge info">{t.busNumber}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{t.driverName}</td>
                    <td style={{ fontSize: '0.78rem' }}>Sched: {t.scheduledDeparture} | Act: {t.actualDeparture}</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0369a1' }}>{t.currentStage}</td>
                    <td><strong>{t.passengersBoarded}</strong> boarded</td>
                    <td><span className={`trans-badge ${t.status === 'In Transit' ? 'info' : t.status === 'Delayed' ? 'danger' : 'success'}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. LIVE TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="trans-table-container">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Live GPS Telematics & Vehicle Diagnostics</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Satellite tracking, engine temperature, battery voltage, and speed telemetry.</p>
            </div>
            <span className="trans-badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Radio size={12} /> Live Satellite Beacon Active
            </span>
          </div>

          <div className="trans-table-scroll">
            <table className="trans-data-table">
              <thead>
                <tr>
                  <th>Bus & Fleet ID</th>
                  <th>Current Coordinates / Location</th>
                  <th>Speed (KM/H)</th>
                  <th>Fuel Level</th>
                  <th>Engine Temp</th>
                  <th>Battery</th>
                  <th>Telemetry Mode</th>
                </tr>
              </thead>
              <tbody>
                {telemetry.map(tm => (
                  <tr key={tm.busNumber}>
                    <td><strong>{tm.busNumber}</strong><div style={{ fontSize: '0.72rem', color: '#64748b' }}>{tm.fleetCode}</div></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{tm.currentLocation}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Lat: {tm.latitude}, Lon: {tm.longitude}</div>
                    </td>
                    <td><strong>{tm.speedKmph}</strong> km/h</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${tm.fuelLevelPct}%`, height: '100%', background: '#10b981' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{tm.fuelLevelPct}%</span>
                      </div>
                    </td>
                    <td>{tm.engineTemperatureC}°C</td>
                    <td>{tm.batteryVoltage} V</td>
                    <td><span className={`trans-badge ${tm.telemetryStatus === 'Live' ? 'success' : 'warning'}`}>{tm.telemetryStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8-22. SUB-SECTIONS WIRED DIRECTLY */}
      {activeTab === 'boarding' && <TransportBoardingSection userRole={userRole} />}
      {activeTab === 'maintenance' && <TransportMaintenanceSection userRole={userRole} />}
      {activeTab === 'fuel-expenses' && <TransportFuelSection userRole={userRole} />}
      {activeTab === 'fees-dues' && <TransportFeesSection userRole={userRole} />}
      {activeTab === 'compliance' && <TransportComplianceSection userRole={userRole} />}
      {activeTab === 'complaints' && <TransportComplaintsSection userRole={userRole} />}
      {activeTab === 'accidents' && <TransportAccidentsSection userRole={userRole} />}
      {activeTab === 'parking' && <TransportParkingSection userRole={userRole} />}
      {activeTab === 'staff-attendance' && <TransportStaffAttendanceSection userRole={userRole} />}
      {activeTab === 'notifications' && <TransportNotificationsSection userRole={userRole} />}
      {activeTab === 'requests' && <TransportRequestsSection userRole={userRole} />}
      {activeTab === 'safety-inspections' && <TransportSafetySection userRole={userRole} />}
      {activeTab === 'schedule-calendar' && <TransportScheduleSection userRole={userRole} />}
      {activeTab === 'inventory' && <TransportInventorySection userRole={userRole} />}
      {activeTab === 'settings-policies' && <TransportSettingsSection userRole={userRole} />}
      {activeTab === 'alerts' && <TransportAlertsSection onNavigateSection={setActiveTab} userRole={userRole} />}
      {activeTab === 'daily-summary' && <TransportDailySummarySection userRole={userRole} />}
      {activeTab === 'student-applications' && <TransportStudentApplicationsSection userRole={userRole} />}
      {activeTab === 'duty-roster' && <TransportDutyRosterSection userRole={userRole} />}
      {activeTab === 'license-verification' && <TransportLicenseVerificationSection userRole={userRole} />}
      {activeTab === 'breakdown-repair' && <TransportBreakdownSection userRole={userRole} />}
      {activeTab === 'fee-reconciliation' && <TransportFeeReconciliationSection userRole={userRole} />}
      {activeTab === 'transport-expenses' && <TransportExpensesSection userRole={userRole} />}

      {/* 23. REPORTS */}
      {activeTab === 'reports' && (
        <div className="trans-table-container" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#0f172a' }}>Campus Transit Audit & Compliance Reports</h3>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>Generate printable CSV, Excel, and statutory compliance packets for state transport authority inspections.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', background: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Fleet RTO Compliance Summary</h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748b' }}>Comprehensive audit of fitness validity, PUC dates, and commercial passenger permits.</p>
              <button className="trans-btn trans-btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print RTO Dossier
              </button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', background: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Semester Fee Clearance Ledger</h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748b' }}>Student bus pass fee collections, pending balances, and defaulter lists.</p>
              <button className="trans-btn trans-btn-outline" onClick={() => window.print()}>
                <Download size={15} /> Export Dues Report
              </button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', background: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Fuel & Operating Expense Ledger</h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748b' }}>Bunk dispense receipts, route fuel economy (km/l), and month-on-month operational costs.</p>
              <button className="trans-btn trans-btn-outline" onClick={() => window.print()}>
                <Download size={15} /> Download Expense CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      {showAddVehicleModal && (
        <div className="trans-modal-overlay" onClick={() => setShowAddVehicleModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Bus size={20} className="text-sky-600" /> Add Vehicle to Fleet</h3>
              <button className="trans-modal-close" onClick={() => setShowAddVehicleModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddVehicle}>
              <div className="trans-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Bus Registration No *</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="OD-02-AK-4415" value={newVehicleForm.busNumber} onChange={e => setNewVehicleForm({ ...newVehicleForm, busNumber: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Fleet Code *</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="Bus 05" value={newVehicleForm.fleetCode} onChange={e => setNewVehicleForm({ ...newVehicleForm, fleetCode: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Seating Capacity</label>
                  <input type="number" className="trans-select" style={{ width: '100%' }} value={newVehicleForm.capacity} onChange={e => setNewVehicleForm({ ...newVehicleForm, capacity: parseInt(e.target.value, 10) || 52 })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Assigned Driver</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="Driver Name" value={newVehicleForm.driver} onChange={e => setNewVehicleForm({ ...newVehicleForm, driver: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Assigned Route</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="Route 1 - Cuttack Badambadi Express" value={newVehicleForm.routeName} onChange={e => setNewVehicleForm({ ...newVehicleForm, routeName: e.target.value })} />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setShowAddVehicleModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Register Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE VEHICLE STATUS */}
      {showStatusModal && selectedVehicle && (
        <div className="trans-modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Wrench size={20} className="text-sky-600" /> Update Vehicle Status - {selectedVehicle.busNumber}</h3>
              <button className="trans-modal-close" onClick={() => setShowStatusModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateVehicleStatus}>
              <div className="trans-modal-body">
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Operating Status</label>
                <select className="trans-select" style={{ width: '100%' }} value={newVehicleStatus} onChange={e => setNewVehicleStatus(e.target.value)}>
                  <option value="Active">Active (On Route)</option>
                  <option value="Available">Available (Idle at Bay)</option>
                  <option value="Maintenance">Under Maintenance (Garage Pit)</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setShowStatusModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Save Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROUTE */}
      {showAddRouteModal && (
        <div className="trans-modal-overlay" onClick={() => setShowAddRouteModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><MapPin size={20} className="text-sky-600" /> Register Transit Route</h3>
              <button className="trans-modal-close" onClick={() => setShowAddRouteModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddRoute}>
              <div className="trans-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Route Number *</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="R-05" value={newRouteForm.routeNumber} onChange={e => setNewRouteForm({ ...newRouteForm, routeNumber: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Assigned Bus Number</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="OD-02-AK-4411" value={newRouteForm.busNumber} onChange={e => setNewRouteForm({ ...newRouteForm, busNumber: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Route Description / Name *</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="Route 5 - Cuttack Ring Road Special" value={newRouteForm.name} onChange={e => setNewRouteForm({ ...newRouteForm, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Semester Fee Tariff (₹)</label>
                  <input type="number" className="trans-select" style={{ width: '100%' }} value={newRouteForm.farePerSemester} onChange={e => setNewRouteForm({ ...newRouteForm, farePerSemester: parseFloat(e.target.value) || 15000 })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Morning Departure</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} value={newRouteForm.morningDeparture} onChange={e => setNewRouteForm({ ...newRouteForm, morningDeparture: e.target.value })} />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setShowAddRouteModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Create Route</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALLOCATE PASS */}
      {showAllocatePassModal && (
        <div className="trans-modal-overlay" onClick={() => setShowAllocatePassModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Users size={20} className="text-sky-600" /> Allocate Semester Bus Pass</h3>
              <button className="trans-modal-close" onClick={() => setShowAllocatePassModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAllocatePass}>
              <div className="trans-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Student Reg / Roll No *</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="2201297050" value={allocatePassForm.regNo} onChange={e => setAllocatePassForm({ ...allocatePassForm, regNo: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Student Full Name</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="Subhasish Tripathy" value={allocatePassForm.studentName} onChange={e => setAllocatePassForm({ ...allocatePassForm, studentName: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Department</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} value={allocatePassForm.department} onChange={e => setAllocatePassForm({ ...allocatePassForm, department: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Select Route *</label>
                  <select className="trans-select" style={{ width: '100%' }} value={allocatePassForm.routeName} onChange={e => setAllocatePassForm({ ...allocatePassForm, routeName: e.target.value })} required>
                    <option value="">-- Choose Route --</option>
                    {routes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Designated Pickup Stop</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="Hanspal Square" value={allocatePassForm.stopName} onChange={e => setAllocatePassForm({ ...allocatePassForm, stopName: e.target.value })} />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setShowAllocatePassModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Generate Pass</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DRIVER */}
      {showAddDriverModal && (
        <div className="trans-modal-overlay" onClick={() => setShowAddDriverModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Phone size={20} className="text-sky-600" /> Enroll Transport Driver</h3>
              <button className="trans-modal-close" onClick={() => setShowAddDriverModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddDriver}>
              <div className="trans-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Driver Full Name *</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="Rajesh Mohanty" value={newDriverForm.name} onChange={e => setNewDriverForm({ ...newDriverForm, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Official Phone *</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="+91 94371 10291" value={newDriverForm.phone} onChange={e => setNewDriverForm({ ...newDriverForm, phone: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Commercial HMV License No *</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="OD-02-2012-0048192" value={newDriverForm.licenseNumber} onChange={e => setNewDriverForm({ ...newDriverForm, licenseNumber: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Assigned Bus</label>
                  <input type="text" className="trans-select" style={{ width: '100%' }} placeholder="OD-02-AK-4411 (Bus 01)" value={newDriverForm.assignedBus} onChange={e => setNewDriverForm({ ...newDriverForm, assignedBus: e.target.value })} />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setShowAddDriverModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Enroll Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

