import React, { useState, useEffect } from 'react';
import {
  Bus,
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Phone,
  FileText,
  Plus,
  Navigation,
  LogOut,
  Calendar,
  Menu,
  X,
  Search,
  Filter,
  Download,
  Printer,
  Radio,
  Wrench,
  RotateCw,
  QrCode,
  Check,
  Slash,
  AlertCircle,
  CreditCard,
  UserCheck,
  MessageSquare,
  Fuel,
  FileCheck2,
  MessageSquareWarning,
  AlertOctagon,
  SquareParking,
  Megaphone,
  GitPullRequest,
  CalendarDays,
  Boxes,
  Settings
} from 'lucide-react';
import './TransportPortal.css';
import { MasterSidebarHeader, useMasterSidebarState } from './Navigation/MasterSidebar.jsx';
import './Navigation/MasterNavigation.css';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import { erpStore } from '../services/erpStore.js';
import { api } from '../services/api.js';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';

import TransportBoardingSection from './transport/TransportBoardingSection.jsx';
import TransportMaintenanceSection from './transport/TransportMaintenanceSection.jsx';
import TransportFuelSection from './transport/TransportFuelSection.jsx';
import TransportFeesSection from './transport/TransportFeesSection.jsx';
import TransportComplianceSection from './transport/TransportComplianceSection.jsx';
import TransportComplaintsSection from './transport/TransportComplaintsSection.jsx';
import TransportAccidentsSection from './transport/TransportAccidentsSection.jsx';
import TransportParkingSection from './transport/TransportParkingSection.jsx';
import TransportStaffAttendanceSection from './transport/TransportStaffAttendanceSection.jsx';
import TransportNotificationsSection from './transport/TransportNotificationsSection.jsx';
import TransportRequestsSection from './transport/TransportRequestsSection.jsx';
import TransportSafetySection from './transport/TransportSafetySection.jsx';
import TransportScheduleSection from './transport/TransportScheduleSection.jsx';
import TransportInventorySection from './transport/TransportInventorySection.jsx';
import TransportSettingsSection from './transport/TransportSettingsSection.jsx';

export default function TransportPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useMasterSidebarState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, fleet, routes, passes, drivers, trips, telemetry, reports

  // Reset scroll position to top whenever activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const scrollables = document.querySelectorAll('.erp-main-content, .role-dash-container');
    scrollables.forEach((el) => { el.scrollTop = 0; });
  }, [activeTab]);

  // Core Data States
  const [fleetVehicles, setFleetVehicles] = useState(() => erpStore.getFleetVehicles());
  const [busRoutes, setBusRoutes] = useState(() => erpStore.getBusRoutes());
  const [busPasses, setBusPasses] = useState(() => erpStore.getBusPasses());
  const [drivers, setDrivers] = useState(() => erpStore.getTransportDrivers());
  const [trips, setTrips] = useState(() => erpStore.getTransportTrips());
  const [telemetry, setTelemetry] = useState(() => erpStore.getTransportTelemetry());
  const [dashboardStats, setDashboardStats] = useState(() => erpStore.getTransportDashboardStats());

  // Search & Filter States
  const [fleetSearch, setFleetSearch] = useState('');
  const [fleetStatusFilter, setFleetStatusFilter] = useState('ALL');
  const [passSearch, setPassSearch] = useState('');
  const [passStatusFilter, setPassStatusFilter] = useState('ALL');
  const [routeSearch, setRouteSearch] = useState('');

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAllocatePassModal, setShowAllocatePassModal] = useState(false);
  const [showPrintPassModal, setShowPrintPassModal] = useState(false);
  const [selectedPassForPrint, setSelectedPassForPrint] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedVehicleForStatus, setSelectedVehicleForStatus] = useState(null);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedTripForDelay, setSelectedTripForDelay] = useState(null);
  const [showDisruptionModal, setShowDisruptionModal] = useState(false);
  const [selectedRouteForDisruption, setSelectedRouteForDisruption] = useState(null);

  // Form States
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

  const [vehicleStatusUpdate, setVehicleStatusUpdate] = useState({
    status: 'Available',
    notes: '',
  });

  const [tripDelayUpdate, setTripDelayUpdate] = useState({
    delayMinutes: 15,
    reason: 'Heavy traffic near bridge crossing',
  });

  const [disruptionText, setDisruptionText] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync data from backend APIs on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, fleetRes, routesRes, passesRes, driversRes, tripsRes, teleRes] = await Promise.all([
          api.getTransportDashboardStats().catch(() => null),
          api.getTransportFleet().catch(() => null),
          api.getTransportRoutes().catch(() => null),
          api.getTransportPasses().catch(() => null),
          api.getTransportDrivers().catch(() => null),
          api.getTransportTrips().catch(() => null),
          api.getTransportTelemetry().catch(() => null),
        ]);

        if (statsRes?.data) setDashboardStats(statsRes.data);
        if (fleetRes?.data) setFleetVehicles(fleetRes.data);
        if (routesRes?.data) setBusRoutes(routesRes.data);
        if (passesRes?.data) setBusPasses(passesRes.data);
        if (driversRes?.data) setDrivers(driversRes.data);
        if (tripsRes?.data) setTrips(tripsRes.data);
        if (teleRes?.data) setTelemetry(teleRes.data);
      } catch (err) {
        console.warn('Transport data load error, using local ERP state:', err);
      }
    }
    loadData();
  }, []);

  // Recalculate stats dynamically if changes happen locally
  const currentStats = {
    totalFleet: fleetVehicles.length,
    operationalVehicles: fleetVehicles.filter(v => (v.status || '').includes('Active') || (v.status || '').includes('Available')).length,
    underMaintenance: fleetVehicles.filter(v => (v.status || '').includes('Maintenance') || (v.status || '').includes('Out of Service')).length,
    totalRoutes: busRoutes.length,
    totalCapacity: fleetVehicles.reduce((a, b) => a + (Number(b.capacity) || 0), 0),
    activePassHolders: busPasses.filter(p => (p.status || '').includes('Active')).length,
    pendingPasses: busPasses.filter(p => (p.status || '').includes('Pending')).length,
    seatUtilization: fleetVehicles.length > 0 ? Math.round((busPasses.filter(p => (p.status || '').includes('Active')).length / Math.max(1, fleetVehicles.reduce((a, b) => a + (Number(b.capacity) || 0), 0))) * 100) : 88,
    upcomingExpiries: fleetVehicles.filter(v => {
      const exp = v.fitnessExpiry || v.insuranceExpiry || '';
      return exp.startsWith('2026-11') || exp.startsWith('2026-12') || exp.startsWith('2027-01');
    }).length,
    liveTelemetryCount: telemetry.filter(t => t.telemetryStatus === 'Live').length,
    inTransitTrips: trips.filter(t => t.status === 'In Transit').length,
  };

  // Handlers
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicleForm.busNumber) {
      alert('Please enter vehicle registration number (e.g. OD-02-AK-4415)');
      return;
    }
    try {
      const payload = { ...newVehicleForm };
      await api.createTransportVehicle(payload).catch(() => null);
      const added = erpStore.addFleetVehicle(payload, { name: account?.name || 'Transport Fleet Desk', role: 'TRANSPORT' });
      setFleetVehicles(erpStore.getFleetVehicles());
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
      triggerToast(`Vehicle ${added.busNumber} successfully added to fleet.`);
    } catch (err) {
      alert('Error adding vehicle: ' + err.message);
    }
  };

  const handleUpdateVehicleStatus = async (e) => {
    e.preventDefault();
    if (!selectedVehicleForStatus) return;
    try {
      await api.updateVehicleStatus(selectedVehicleForStatus.id, vehicleStatusUpdate.status, vehicleStatusUpdate.notes).catch(() => null);
      erpStore.updateVehicleStatus(selectedVehicleForStatus.id, vehicleStatusUpdate.status, vehicleStatusUpdate.notes, { name: account?.name || 'Transport Desk', role: 'TRANSPORT' });
      setFleetVehicles(erpStore.getFleetVehicles());
      setShowStatusModal(false);
      setSelectedVehicleForStatus(null);
      triggerToast(`Vehicle operational status updated to "${vehicleStatusUpdate.status}".`);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!newRouteForm.name) {
      alert('Please provide route name.');
      return;
    }
    try {
      const payload = { ...newRouteForm };
      await api.createTransportRoute(payload).catch(() => null);
      const added = erpStore.addBusRoute(payload, { name: account?.name || 'Transport Desk', role: 'TRANSPORT' });
      setBusRoutes(erpStore.getBusRoutes());
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
      triggerToast(`Route "${added.name}" registered successfully.`);
    } catch (err) {
      alert('Error adding route: ' + err.message);
    }
  };

  const handleRouteDisruption = async (e) => {
    e.preventDefault();
    if (!selectedRouteForDisruption) return;
    try {
      await api.updateRouteDisruption(selectedRouteForDisruption.id, disruptionText).catch(() => null);
      erpStore.updateRouteDisruption(selectedRouteForDisruption.id, disruptionText, { name: account?.name || 'Transport Desk', role: 'TRANSPORT' });
      setBusRoutes(erpStore.getBusRoutes());
      setShowDisruptionModal(false);
      setSelectedRouteForDisruption(null);
      setDisruptionText('');
      triggerToast('Route operational status / diversion advisory broadcasted.');
    } catch (err) {
      alert('Error updating disruption: ' + err.message);
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriverForm.name || !newDriverForm.licenseNumber) {
      alert('Please enter driver name and valid license number.');
      return;
    }
    try {
      const payload = { ...newDriverForm };
      await api.createTransportDriver(payload).catch(() => null);
      const added = erpStore.addTransportDriver(payload, { name: account?.name || 'Transport Desk', role: 'TRANSPORT' });
      setDrivers(erpStore.getTransportDrivers());
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
      triggerToast(`Driver ${added.name} successfully enrolled with ${added.licenseCategory}.`);
    } catch (err) {
      alert('Error enrolling driver: ' + err.message);
    }
  };

  const handleAllocatePass = async (e) => {
    e.preventDefault();
    if (!allocatePassForm.regNo || !allocatePassForm.routeName) {
      alert('Please enter registration number and select target route.');
      return;
    }
    // Check duplicate pass
    const duplicate = busPasses.find(p => p.regNo === allocatePassForm.regNo && (p.status || '').includes('Active'));
    if (duplicate) {
      alert(`Student with Reg No ${allocatePassForm.regNo} already holds an active bus pass (${duplicate.passNumber}).`);
      return;
    }
    try {
      const payload = { ...allocatePassForm };
      await api.allocateTransport(payload).catch(() => null);
      const newPass = erpStore.allocateBusPass(payload, { name: account?.name || 'Transport Desk', role: 'TRANSPORT' });
      setBusPasses(erpStore.getBusPasses());
      setBusRoutes(erpStore.getBusRoutes());
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
      triggerToast(`Bus pass ${newPass.passNumber} generated for ${newPass.studentName}.`);
    } catch (err) {
      alert('Error allocating pass: ' + err.message);
    }
  };

  const handlePassAction = async (passId, action) => {
    try {
      await api.actionTransportPass(passId, action, `Actioned by ${account?.name || 'Transport Desk'}`).catch(() => null);
      erpStore.actionBusPass(passId, action, '', { name: account?.name || 'Transport Desk', role: 'TRANSPORT' });
      setBusPasses(erpStore.getBusPasses());
      triggerToast(`Pass marked as "${action}".`);
    } catch (err) {
      alert('Error updating pass: ' + err.message);
    }
  };

  const handleTripAction = async (tripId, action, data = {}) => {
    try {
      await api.actionTransportTrip(tripId, action, data).catch(() => null);
      erpStore.actionTransportTrip(tripId, action, data, { name: account?.name || 'Transport Desk', role: 'TRANSPORT' });
      setTrips(erpStore.getTransportTrips());
      triggerToast(`Trip status updated: ${action.replace('_', ' ')}.`);
    } catch (err) {
      alert('Error actioning trip: ' + err.message);
    }
  };

  const handleRecordDelay = async (e) => {
    e.preventDefault();
    if (!selectedTripForDelay) return;
    await handleTripAction(selectedTripForDelay.id, 'RECORD_DELAY', tripDelayUpdate);
    setShowDelayModal(false);
    setSelectedTripForDelay(null);
  };

  // Export functions
  const exportFleetCSV = () => {
    const headers = ['Vehicle ID,Fleet Code,Registration No,Type,Capacity,Allocated,Assigned Route,Driver,Contact,Fitness Expiry,Insurance Expiry,Status\n'];
    const rows = fleetVehicles.map(v =>
      `"${v.id}","${v.fleetCode}","${v.busNumber}","${v.type}","${v.capacity}","${v.allocatedStudents || 0}","${v.routeName}","${v.driver}","${v.driverPhone}","${v.fitnessExpiry}","${v.insuranceExpiry}","${v.status}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GIFT_Fleet_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    triggerToast('Fleet Inventory CSV downloaded.');
  };

  const exportPassesCSV = () => {
    const headers = ['Pass Number,Student Name,Reg No,Department,Semester,Route,Boarding Stop,Semester Fare,Fee Status,Status,Validity\n'];
    const rows = busPasses.map(p =>
      `"${p.passNumber || p.id}","${p.studentName}","${p.regNo}","${p.department}","${p.semester}","${p.routeName}","${p.stopName}","${p.fareAmount || 15000}","${p.feeStatus}","${p.status}","${p.validity}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GIFT_Bus_Pass_Manifest_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    triggerToast('Bus Pass Manifest CSV downloaded.');
  };

  const exportTripsCSV = () => {
    const headers = ['Trip Code,Route Name,Service Type,Vehicle,Driver,Scheduled Departure,Actual Departure,Scheduled Arrival,Status,Passengers,Delay (mins),Incident\n'];
    const rows = trips.map(t =>
      `"${t.tripCode || t.id}","${t.routeName}","${t.serviceType}","${t.vehicle}","${t.driver}","${t.scheduledDeparture}","${t.actualDeparture || 'N/A'}","${t.scheduledArrival}","${t.status}","${t.passengerCount}","${t.delayMinutes || 0}","${t.incidentReport || 'None'}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GIFT_Trip_Operations_Log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    triggerToast('Trip Operations Log CSV downloaded.');
  };

  // Filtered views
  const filteredVehicles = fleetVehicles.filter(v => {
    const matchesSearch = (v.busNumber || '').toLowerCase().includes(fleetSearch.toLowerCase()) ||
      (v.fleetCode || '').toLowerCase().includes(fleetSearch.toLowerCase()) ||
      (v.routeName || '').toLowerCase().includes(fleetSearch.toLowerCase()) ||
      (v.driver || '').toLowerCase().includes(fleetSearch.toLowerCase());
    if (fleetStatusFilter === 'ALL') return matchesSearch;
    return matchesSearch && (v.status || '').toLowerCase().includes(fleetStatusFilter.toLowerCase());
  });

  const filteredPasses = busPasses.filter(p => {
    const matchesSearch = (p.studentName || '').toLowerCase().includes(passSearch.toLowerCase()) ||
      (p.regNo || '').toLowerCase().includes(passSearch.toLowerCase()) ||
      (p.passNumber || p.id || '').toLowerCase().includes(passSearch.toLowerCase()) ||
      (p.routeName || '').toLowerCase().includes(passSearch.toLowerCase()) ||
      (p.stopName || '').toLowerCase().includes(passSearch.toLowerCase());
    if (passStatusFilter === 'ALL') return matchesSearch;
    return matchesSearch && (p.status || '').toLowerCase().includes(passStatusFilter.toLowerCase());
  });

  const filteredRoutes = busRoutes.filter(r =>
    (r.name || '').toLowerCase().includes(routeSearch.toLowerCase()) ||
    (r.routeNumber || '').toLowerCase().includes(routeSearch.toLowerCase()) ||
    (Array.isArray(r.stops) ? r.stops.join(' ') : (r.stops || '')).toLowerCase().includes(routeSearch.toLowerCase())
  );

  return (
    <div className="erp-transport-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
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
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="erp-sidebar-backdrop active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <aside className="erp-sidebar">
          <MasterSidebarHeader
            roleTitle="TRANSPORT & LOGISTICS"
            onToggle={() => setSidebarOpen(false)}
          />

        <nav className="erp-sidebar-nav">
          <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', padding: '6px 14px 2px' }}>
            Fleet &amp; Operations
          </div>
          {/* 1. Transport Dashboard */}
          <button
            className={`erp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Bus size={18} />
            <span>Transport Dashboard</span>
            <span style={{ marginLeft: 'auto', background: '#0284c7', color: '#fff', fontSize: '0.68rem', padding: '1px 6px', borderRadius: '10px' }}>Live</span>
          </button>
          {/* 2. Vehicles & Fleet */}
          <button
            className={`erp-nav-item ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            <Bus size={18} />
            <span>Vehicles &amp; Fleet</span>
          </button>
          {/* 3. Routes & Stops */}
          <button
            className={`erp-nav-item ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            <MapPin size={18} />
            <span>Routes &amp; Stops</span>
          </button>
          {/* 6. Trip Operations & Dispatch */}
          <button
            className={`erp-nav-item ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            <Clock size={18} />
            <span>Trip Operations &amp; Dispatch</span>
            {currentStats.inTransitTrips > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#22c55e',
                color: '#ffffff',
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}>
                {currentStats.inTransitTrips} Live
              </span>
            )}
          </button>
          {/* 7. GPS Tracking & Telemetry */}
          <button
            className={`erp-nav-item ${activeTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setActiveTab('telemetry')}
          >
            <Radio size={18} />
            <span>GPS Tracking &amp; Telemetry</span>
          </button>
          {/* NEW: Transport Schedule & Calendar */}
          <button
            className={`erp-nav-item ${activeTab === 'schedule-calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule-calendar')}
          >
            <CalendarDays size={18} />
            <span>Transport Schedule &amp; Calendar</span>
          </button>

          <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', padding: '12px 14px 2px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            Commuters &amp; Passes
          </div>
          {/* 4. Bus Passes & Allocations */}
          <button
            className={`erp-nav-item ${activeTab === 'passes' ? 'active' : ''}`}
            onClick={() => setActiveTab('passes')}
          >
            <FileText size={18} />
            <span>Bus Passes &amp; Allocations</span>
            {currentStats.pendingPasses > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#f59e0b',
                color: '#ffffff',
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}>
                {currentStats.pendingPasses}
              </span>
            )}
          </button>
          {/* NEW: Student Boarding & Attendance */}
          <button
            className={`erp-nav-item ${activeTab === 'boarding' ? 'active' : ''}`}
            onClick={() => setActiveTab('boarding')}
          >
            <Users size={18} />
            <span>Student Boarding &amp; Attendance</span>
          </button>
          {/* NEW: Transport Fees & Dues */}
          <button
            className={`erp-nav-item ${activeTab === 'fees-dues' ? 'active' : ''}`}
            onClick={() => setActiveTab('fees-dues')}
          >
            <CreditCard size={18} />
            <span>Transport Fees &amp; Dues</span>
          </button>
          {/* NEW: Transport Requests & Approvals */}
          <button
            className={`erp-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <GitPullRequest size={18} />
            <span>Transport Requests &amp; Approvals</span>
          </button>

          <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', padding: '12px 14px 2px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            Maintenance &amp; Workshop
          </div>
          {/* NEW: Vehicle Maintenance & Service */}
          <button
            className={`erp-nav-item ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            <Wrench size={18} />
            <span>Vehicle Maintenance &amp; Service</span>
          </button>
          {/* NEW: Fuel & Expense Management */}
          <button
            className={`erp-nav-item ${activeTab === 'fuel-expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('fuel-expenses')}
          >
            <Fuel size={18} />
            <span>Fuel &amp; Expense Management</span>
          </button>
          {/* NEW: Parking & Vehicle Assignment */}
          <button
            className={`erp-nav-item ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            <SquareParking size={18} />
            <span>Parking &amp; Vehicle Assignment</span>
          </button>
          {/* NEW: Transport Inventory & Spare Parts */}
          <button
            className={`erp-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Boxes size={18} />
            <span>Transport Inventory &amp; Spare Parts</span>
          </button>

          <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', padding: '12px 14px 2px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            Safety &amp; Compliance
          </div>
          {/* NEW: Vehicle Documents & Compliance */}
          <button
            className={`erp-nav-item ${activeTab === 'compliance' ? 'active' : ''}`}
            onClick={() => setActiveTab('compliance')}
          >
            <FileCheck2 size={18} />
            <span>Vehicle Documents &amp; Compliance</span>
          </button>
          {/* NEW: Transport Safety & Inspections */}
          <button
            className={`erp-nav-item ${activeTab === 'safety-inspections' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety-inspections')}
          >
            <ShieldCheck size={18} />
            <span>Transport Safety &amp; Inspections</span>
          </button>
          {/* NEW: Accident & Incident Management */}
          <button
            className={`erp-nav-item ${activeTab === 'accidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('accidents')}
          >
            <AlertOctagon size={18} />
            <span>Accident &amp; Incident Management</span>
          </button>

          <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', padding: '12px 14px 2px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            Personnel &amp; Administration
          </div>
          {/* 5. Drivers & Duty Roster */}
          <button
            className={`erp-nav-item ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            <UserCheck size={18} />
            <span>Drivers &amp; Duty Roster</span>
          </button>
          {/* NEW: Transport Staff Attendance */}
          <button
            className={`erp-nav-item ${activeTab === 'staff-attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff-attendance')}
          >
            <UserCheck size={18} />
            <span>Transport Staff Attendance</span>
          </button>
          {/* NEW: Transport Complaints & Feedback */}
          <button
            className={`erp-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <MessageSquareWarning size={18} />
            <span>Transport Complaints &amp; Feedback</span>
          </button>
          {/* NEW: Transport Notifications & Announcements */}
          <button
            className={`erp-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Megaphone size={18} />
            <span>Transport Notifications &amp; Announcements</span>
          </button>
          {/* 8. Reports & Accounts Sync */}
          <button
            className={`erp-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <CreditCard size={18} />
            <span>Reports &amp; Accounts Sync</span>
          </button>
          {/* NEW: Transport Settings & Policies */}
          <button
            className={`erp-nav-item ${activeTab === 'settings-policies' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings-policies')}
          >
            <Settings size={18} />
            <span>Transport Settings &amp; Policies</span>
          </button>
        </nav>
      </aside>
    )}

      {/* Main Content */}
      <main className="erp-main-content">
        {activeTab === 'dashboard' ? (
          <RoleDashboardLanding
            roleKey="transport"
            account={account}
            onLogout={onLogout}
            onSwitchRole={onSwitchRole}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            onNavigate={(target) => {
              if (target === 'trans-fleet') setActiveTab('fleet');
              else if (target === 'trans-routes') setActiveTab('routes');
              else if (target === 'trans-passes') setActiveTab('passes');
              else if (target === 'trans-drivers') setActiveTab('drivers');
              else if (target === 'trans-trips') setActiveTab('trips');
              else if (target === 'trans-telemetry') setActiveTab('telemetry');
              else if (target === 'trans-reports') setActiveTab('reports');
              else if (target === 'trans-boarding') setActiveTab('boarding');
              else if (target === 'trans-maintenance') setActiveTab('maintenance');
              else if (target === 'trans-fuel') setActiveTab('fuel-expenses');
              else if (target === 'trans-fees') setActiveTab('fees-dues');
              else if (target === 'trans-compliance') setActiveTab('compliance');
              else if (target === 'trans-complaints') setActiveTab('complaints');
              else if (target === 'trans-accidents') setActiveTab('accidents');
              else if (target === 'trans-parking') setActiveTab('parking');
              else if (target === 'trans-staff') setActiveTab('staff-attendance');
              else if (target === 'trans-notifications') setActiveTab('notifications');
              else if (target === 'trans-requests') setActiveTab('requests');
              else if (target === 'trans-safety') setActiveTab('safety-inspections');
              else if (target === 'trans-schedule') setActiveTab('schedule-calendar');
              else if (target === 'trans-inventory') setActiveTab('inventory');
              else if (target === 'trans-settings') setActiveTab('settings-policies');
              else setActiveTab(target || 'fleet');
            }}
          />
        ) : (
          <>
        <header className="erp-header">
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!sidebarOpen && (
              <button
                className="campus-nav-toggle-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Show Navigation"
                aria-label="Show Navigation"
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid #000000',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                  flexShrink: 0
                }}
              >
                <Menu size={20} color="#ffffff" stroke="#ffffff" />
              </button>
            )}
            <div>
              <h1>Campus Transit &amp; Fleet Operations</h1>
              <p>Fleet Compliance, GPS Telematics, Route Stops &amp; Verified Bus Passes</p>
            </div>
          </div>

          <div className="erp-header-actions">
            <div className="erp-role-badge">
              <ShieldCheck size={14} /> Fleet Manager Access
            </div>

            <div className="campus-user-pill">
              <div className="campus-user-avatar">TRN</div>
              <div className="campus-user-details">
                <strong>{account?.name || 'Transport Fleet Manager'}</strong>
                <small>Campus Transit &amp; Logistics</small>
              </div>
              <button
                className="campus-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="erp-content-body">
          {/* STATS ROW (CLICKABLE TO OPEN FILTERED VIEWS) */}
          <div className="erp-stats-grid">
            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('fleet')}
              title="View fleet registry"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Fleet Strength</span>
                <Bus size={18} color="#0284c7" />
              </div>
              <div className="erp-stat-val">{currentStats.totalFleet} Vehicles</div>
              <div className="erp-stat-note">{currentStats.operationalVehicles} operational · {currentStats.underMaintenance} maintenance</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('passes')}
              title="View commuter passes"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Daily Commuters</span>
                <Users size={18} color="#10b981" />
              </div>
              <div className="erp-stat-val">{currentStats.activePassHolders} Students</div>
              <div className="erp-stat-note">{currentStats.seatUtilization}% seat occupancy across buses</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('routes')}
              title="View routes network"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Active Routes</span>
                <Navigation size={18} color="#f59e0b" />
              </div>
              <div className="erp-stat-val">{currentStats.totalRoutes} Transit Routes</div>
              <div className="erp-stat-note">Morning pickup &amp; evening drop circuits</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('telemetry')}
              title="View GPS tracking status"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">GPS Telemetry</span>
                <span className="telemetry-pulse"></span>
              </div>
              <div className="erp-stat-val">{currentStats.liveTelemetryCount} / {currentStats.totalFleet} Live</div>
              <div className="erp-stat-note">Real-time GPS sync &amp; speed telemetry</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('trips')}
              title="View today's operations"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Today's Trips</span>
                <Clock size={18} color="#8b5cf6" />
              </div>
              <div className="erp-stat-val">{trips.length} Scheduled</div>
              <div className="erp-stat-note">{currentStats.inTransitTrips} currently in transit</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => {
                setActiveTab('fleet');
                setFleetStatusFilter('ALL');
              }}
              title="Compliance certificate check"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Compliance Expiries</span>
                <AlertTriangle size={18} color="#ef4444" />
              </div>
              <div className="erp-stat-val">{currentStats.upcomingExpiries} Due Soon</div>
              <div className="erp-stat-note">Fitness / Insurance certificates</div>
            </div>
          </div>

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 140px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB 1: VEHICLES & FLEET REGISTRY */}
          {activeTab === 'fleet' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>University Vehicle Fleet &amp; Compliance Registry</h3>
                  <p>Registration records, seating capacities, driver assignments, and statutory certificates (Fitness, Insurance, PUC)</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-secondary" onClick={exportFleetCSV}>
                    <Download size={14} /> Export Fleet CSV
                  </button>
                  <button className="erp-btn-primary" onClick={() => setShowAddVehicleModal(true)}>
                    <Plus size={16} /> Add Vehicle to Fleet
                  </button>
                </div>
              </div>

              <div className="erp-filter-bar">
                <div className="erp-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by bus number, fleet code, driver..."
                    value={fleetSearch}
                    onChange={(e) => setFleetSearch(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="#64748b" />
                  <select
                    value={fleetStatusFilter}
                    onChange={(e) => setFleetStatusFilter(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active (On Route)</option>
                    <option value="Available">Available / Idle</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Bus &amp; Fleet ID</th>
                      <th>Type &amp; Capacity</th>
                      <th>Assigned Route</th>
                      <th>Driver Details</th>
                      <th>Compliance Expiries</th>
                      <th>Operating Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No vehicles found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map(v => (
                        <tr key={v.id}>
                          <td>
                            <strong>{v.busNumber}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{v.fleetCode}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Depot: {v.depot || 'Main Yard'}</div>
                          </td>
                          <td>
                            <strong>{v.capacity} Seats</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{v.type}</div>
                            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                              {v.allocatedStudents || 0} students assigned
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.routeName}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Odometer: {v.odometerKm?.toLocaleString() || '12,400'} km</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{v.driver}</div>
                            <div style={{ fontSize: '0.74rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} /> {v.driverPhone}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.74rem' }}>
                              Fitness: <strong>{v.fitnessExpiry}</strong>
                            </div>
                            <div style={{ fontSize: '0.74rem' }}>
                              Insurance: <strong>{v.insuranceExpiry}</strong>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              PUC: {v.pucExpiry || '2027-01-20'}
                            </div>
                          </td>
                          <td>
                            <span className={`badge-status ${v.status.includes('Active') ? 'active' : v.status.includes('Available') ? 'info' : 'warning'}`}>
                              {v.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="erp-btn-secondary erp-btn-sm"
                              onClick={() => {
                                setSelectedVehicleForStatus(v);
                                setVehicleStatusUpdate({ status: v.status, notes: '' });
                                setShowStatusModal(true);
                              }}
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ROUTES & STOPS */}
          {activeTab === 'routes' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Campus Transit Routes, Timetable &amp; Designated Stops</h3>
                  <p>Scheduled morning departures, evening drops, ordered waypoint stops, and semester tariff</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-primary" onClick={() => setShowAddRouteModal(true)}>
                    <Plus size={16} /> Configure New Route
                  </button>
                </div>
              </div>

              <div className="erp-filter-bar">
                <div className="erp-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search route by name, code, stop..."
                    value={routeSearch}
                    onChange={(e) => setRouteSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Route ID &amp; Name</th>
                      <th>Morning Start</th>
                      <th>Campus Drop</th>
                      <th>Key Ordered Stops on Route</th>
                      <th>Semester Fare</th>
                      <th>Occupancy &amp; Pass Holders</th>
                      <th>Status &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoutes.map(r => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.name}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{r.routeNumber || r.id}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Vehicle: {r.busNumber || 'Assigned Coach'}</div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0284c7' }}>{r.morningDeparture}</td>
                        <td style={{ fontWeight: 600, color: '#64748b' }}>{r.eveningArrival}</td>
                        <td style={{ maxWidth: '300px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.4' }}>
                            {Array.isArray(r.stops) ? r.stops.join(' → ') : r.stops}
                          </div>
                        </td>
                        <td>
                          <strong>₹{(r.farePerSemester || 15000).toLocaleString()}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Per Semester</div>
                        </td>
                        <td>
                          <strong style={{ color: '#0284c7' }}>{r.activePassHolders || 0} Students</strong>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            Capacity: {r.totalCapacity || 52} seats
                          </div>
                          <div style={{
                            width: '100px',
                            height: '6px',
                            background: '#e2e8f0',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginTop: '4px',
                          }}>
                            <div style={{
                              width: `${Math.min(100, Math.round(((r.activePassHolders || 0) / (r.totalCapacity || 52)) * 100))}%`,
                              height: '100%',
                              background: '#0284c7',
                            }}></div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status ${r.status?.includes('Diversion') ? 'warning' : 'active'}`} style={{ marginBottom: '6px', display: 'inline-block' }}>
                            {r.status || 'Active'}
                          </span>
                          <div>
                            <button
                              className="erp-btn-secondary erp-btn-sm"
                              onClick={() => {
                                setSelectedRouteForDisruption(r);
                                setDisruptionText(r.disruptionNotice || '');
                                setShowDisruptionModal(true);
                              }}
                            >
                              Advisory / Diversion
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STUDENT BUS PASSES & ALLOCATIONS */}
          {activeTab === 'passes' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Student Bus Passes &amp; Transportation Allocations</h3>
                  <p>Institutional digital transit passes verified against Accounts fee records and student registry</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-secondary" onClick={exportPassesCSV}>
                    <Download size={14} /> Export Passes Manifest
                  </button>
                  <button className="erp-btn-primary" onClick={() => setShowAllocatePassModal(true)}>
                    <Plus size={16} /> Allocate Student Pass
                  </button>
                </div>
              </div>

              <div className="erp-filter-bar">
                <div className="erp-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by student, reg no, route, pass ID..."
                    value={passSearch}
                    onChange={(e) => setPassSearch(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="#64748b" />
                  <select
                    value={passStatusFilter}
                    onChange={(e) => setPassStatusFilter(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active &amp; Verified</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Student &amp; Reg No</th>
                      <th>Branch &amp; Semester</th>
                      <th>Assigned Route &amp; Stop</th>
                      <th>Accounts Fee Status</th>
                      <th>Pass Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPasses.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No student passes found.
                        </td>
                      </tr>
                    ) : (
                      filteredPasses.map(p => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.passNumber || p.id}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Issued: {p.issueDate || '2026-08-01'}</div>
                          </td>
                          <td>
                            <strong>{p.studentName}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{p.regNo}</div>
                          </td>
                          <td>
                            <div>{p.department || 'B.Tech Engineering'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.semester || 'Semester 5'}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{p.routeName}</div>
                            <div style={{ fontSize: '0.74rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={11} /> {p.stopName}
                            </div>
                          </td>
                          <td>
                            <span className={`badge-status ${(p.feeStatus || '').includes('Paid') ? 'active' : 'warning'}`}>
                              {(p.feeStatus || '').includes('Paid') ? '✓ Fee Paid' : 'Pending UTR'}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                              ₹{(p.fareAmount || 15000).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <span className={`badge-status ${(p.status || '').includes('Active') ? 'active' : (p.status || '').includes('Pending') ? 'warning' : 'danger'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                className="erp-btn-secondary erp-btn-sm"
                                onClick={() => {
                                  setSelectedPassForPrint(p);
                                  setShowPrintPassModal(true);
                                }}
                                title="View & Print Official Digital Pass"
                              >
                                <QrCode size={12} /> View Pass
                              </button>
                              {(p.status || '').includes('Pending') && (
                                <button
                                  className="erp-btn-primary erp-btn-sm"
                                  onClick={() => handlePassAction(p.id, 'APPROVE')}
                                  title="Approve pass"
                                >
                                  Approve
                                </button>
                              )}
                              {(p.status || '').includes('Active') && (
                                <button
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => handlePassAction(p.id, 'SUSPEND')}
                                  style={{ color: '#ef4444' }}
                                  title="Suspend pass"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DRIVERS & DUTY ROSTER */}
          {activeTab === 'drivers' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Driver Roster &amp; Statutory Driving Licences</h3>
                  <p>Certified commercial vehicle operators, contact details, emergency contacts, and license validities</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-primary" onClick={() => setShowAddDriverModal(true)}>
                    <Plus size={16} /> Enroll Driver
                  </button>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Driver Name &amp; Contact</th>
                      <th>Emergency Contact</th>
                      <th>Commercial Licence Number</th>
                      <th>Category &amp; Validity</th>
                      <th>Assigned Bus &amp; Route</th>
                      <th>Duty Shift</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(d => (
                      <tr key={d.id}>
                        <td>
                          <strong>{d.name}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={11} /> {d.phone}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>{d.emergencyContact || 'N/A'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Next of Kin</div>
                        </td>
                        <td>
                          <strong>{d.licenseNumber}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Verified RTO Document</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{d.licenseCategory || 'HMV Passenger'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Expires: {d.licenseExpiry}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{d.assignedBus}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.assignedRoute}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.78rem' }}>{d.shift}</div>
                        </td>
                        <td>
                          <span className={`badge-status ${d.status === 'Active' ? 'active' : 'info'}`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TRIP OPERATIONS & DISPATCH */}
          {activeTab === 'trips' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Daily Trip Operations &amp; Live Dispatch Board</h3>
                  <p>Morning student pickup and evening departure tracking, departure logs, and disruption alerts</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-secondary" onClick={exportTripsCSV}>
                    <Download size={14} /> Export Operations Log
                  </button>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Trip Code &amp; Service</th>
                      <th>Transit Route</th>
                      <th>Assigned Coach &amp; Driver</th>
                      <th>Scheduled vs Actual Departure</th>
                      <th>Scheduled vs Actual Arrival</th>
                      <th>Passengers</th>
                      <th>Trip Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map(t => (
                      <tr key={t.id}>
                        <td>
                          <strong>{t.tripCode || t.id}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{t.serviceType}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{t.routeName}</div>
                        </td>
                        <td>
                          <div>{t.vehicle}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{t.driver}</div>
                        </td>
                        <td>
                          <div>Sched: <strong>{t.scheduledDeparture}</strong></div>
                          <div style={{ fontSize: '0.72rem', color: t.actualDeparture ? '#10b981' : '#64748b' }}>
                            Actual: {t.actualDeparture || 'Pending Departure'}
                          </div>
                        </td>
                        <td>
                          <div>Sched: <strong>{t.scheduledArrival}</strong></div>
                          <div style={{ fontSize: '0.72rem', color: t.actualArrival ? '#10b981' : '#64748b' }}>
                            Actual: {t.actualArrival || 'En Route'}
                          </div>
                        </td>
                        <td>
                          <strong>{t.passengerCount} Onboard</strong>
                        </td>
                        <td>
                          <span className={`badge-status ${t.status === 'Completed' ? 'active' : t.status === 'In Transit' ? 'info' : t.status === 'Delayed' ? 'warning' : 'danger'}`}>
                            {t.status}
                          </span>
                          {t.delayMinutes > 0 && (
                            <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                              +{t.delayMinutes} mins delay
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {t.status === 'Scheduled' && (
                              <button
                                className="erp-btn-primary erp-btn-sm"
                                onClick={() => handleTripAction(t.id, 'START_TRIP')}
                              >
                                Start Trip
                              </button>
                            )}
                            {t.status === 'In Transit' && (
                              <>
                                <button
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => handleTripAction(t.id, 'COMPLETE_TRIP')}
                                >
                                  Complete
                                </button>
                                <button
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => {
                                    setSelectedTripForDelay(t);
                                    setShowDelayModal(true);
                                  }}
                                  style={{ color: '#f59e0b' }}
                                >
                                  Log Delay
                                </button>
                              </>
                            )}
                            {t.status !== 'Completed' && (
                              <button
                                className="erp-btn-secondary erp-btn-sm"
                                onClick={() => handleTripAction(t.id, 'REPORT_BREAKDOWN', { notes: 'Engine coolant warning' })}
                                style={{ color: '#ef4444' }}
                                title="Report vehicle breakdown and dispatch backup"
                              >
                                Breakdown
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: GPS TRACKING & TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Fleet GPS Tracking &amp; Live Telematics Health</h3>
                  <p>Real-time vehicle coordinates, speed telemetry, cellular link quality, and control room SOS helpline</p>
                </div>
                <div className="erp-panel-actions">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>
                    <span className="telemetry-pulse"></span> Control Room Link Online
                  </div>
                </div>
              </div>

              {/* Safety Helpline Banner */}
              <div style={{
                margin: '1.25rem 1.5rem 0 1.5rem',
                background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Compass size={28} color="#0284c7" />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0369a1' }}>Campus Transport Central Command Desk</strong>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      24x7 Transit Safety Hotline: <strong>+91 674 2320011</strong> · Emergency Cell: <strong>+91 94371 00214</strong>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                  Telematics Protocol: AIS-140 GPS Compliance
                </div>
              </div>

              <div className="erp-table-responsive" style={{ padding: '1rem 0' }}>
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Vehicle &amp; Route</th>
                      <th>Driver Name</th>
                      <th>Last Reported Location</th>
                      <th>Current Speed &amp; Heading</th>
                      <th>Last Ping Timestamp</th>
                      <th>Signal &amp; Telemetry Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {telemetry.map(t => (
                      <tr key={t.vehicleId}>
                        <td>
                          <strong>{t.fleetCode}</strong> ({t.busNumber})
                          <div style={{ fontSize: '0.74rem', color: '#0284c7' }}>{t.routeName}</div>
                        </td>
                        <td>
                          <div>{t.driverName}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} color="#ef4444" /> {t.location}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: t.speedKmH > 0 ? '#10b981' : '#64748b' }}>
                            {t.speedKmH} km/h
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Heading: {t.heading}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.lastPingTime}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Battery: {t.batteryVoltage}</div>
                        </td>
                        <td>
                          <span className={`badge-status ${t.telemetryStatus === 'Live' ? 'active' : t.telemetryStatus === 'Delayed Updates' ? 'warning' : 'danger'}`}>
                            {t.telemetryStatus === 'Live' ? '🟢 Live GPS' : t.telemetryStatus === 'Delayed Updates' ? '🟡 Delayed' : '🔴 Offline'}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            Link: {t.signalQuality}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS & ACCOUNTS RECONCILIATION */}
          {activeTab === 'reports' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Route Census &amp; Transport Accounts Reconciliation</h3>
                  <p>Semester-wise transport tariff collection, seat occupancy matrix, and dues reconciliation with Finance Department</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-secondary" onClick={() => window.print()}>
                    <Printer size={14} /> Print Census Report
                  </button>
                  <button className="erp-btn-primary" onClick={exportPassesCSV}>
                    <Download size={14} /> Download Fee Reconciliation CSV
                  </button>
                </div>
              </div>

              <div className="erp-content-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {busRoutes.map(r => {
                    const passCount = busPasses.filter(p => p.routeName === r.name && (p.status || '').includes('Active')).length;
                    const fare = r.farePerSemester || 15000;
                    const totalCollection = passCount * fare;
                    const capacity = r.totalCapacity || 52;
                    const vacant = Math.max(0, capacity - passCount);
                    return (
                      <div
                        key={r.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{r.name}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{r.routeNumber || r.id}</div>
                          </div>
                          <span className="badge-status active">Active</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                          <div>Total Capacity: <strong>{capacity} Seats</strong></div>
                          <div>Allocated: <strong style={{ color: '#0284c7' }}>{passCount} Pass Holders</strong></div>
                          <div>Available: <strong style={{ color: '#10b981' }}>{vacant} Vacant</strong></div>
                          <div>Semester Fee: <strong>₹{fare.toLocaleString()}</strong></div>
                        </div>
                        <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Estimated Route Revenue:</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                            ₹{totalCollection.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              15 NEW TRANSPORT MANAGEMENT SUBMODULES
              ========================================================================= */}
          {/* TAB 8: STUDENT BOARDING & ATTENDANCE */}
          {activeTab === 'boarding' && <TransportBoardingSection />}

          {/* TAB 9: VEHICLE MAINTENANCE & SERVICE */}
          {activeTab === 'maintenance' && <TransportMaintenanceSection />}

          {/* TAB 10: FUEL & EXPENSE MANAGEMENT */}
          {activeTab === 'fuel-expenses' && <TransportFuelSection />}

          {/* TAB 11: TRANSPORT FEES & DUES */}
          {activeTab === 'fees-dues' && <TransportFeesSection />}

          {/* TAB 12: VEHICLE DOCUMENTS & COMPLIANCE */}
          {activeTab === 'compliance' && <TransportComplianceSection />}

          {/* TAB 13: TRANSPORT COMPLAINTS & FEEDBACK */}
          {activeTab === 'complaints' && <TransportComplaintsSection />}

          {/* TAB 14: ACCIDENT & INCIDENT MANAGEMENT */}
          {activeTab === 'accidents' && <TransportAccidentsSection />}

          {/* TAB 15: PARKING & VEHICLE ASSIGNMENT */}
          {activeTab === 'parking' && <TransportParkingSection />}

          {/* TAB 16: TRANSPORT STAFF ATTENDANCE */}
          {activeTab === 'staff-attendance' && <TransportStaffAttendanceSection />}

          {/* TAB 17: TRANSPORT NOTIFICATIONS & ANNOUNCEMENTS */}
          {activeTab === 'notifications' && <TransportNotificationsSection />}

          {/* TAB 18: TRANSPORT REQUESTS & APPROVALS */}
          {activeTab === 'requests' && <TransportRequestsSection />}

          {/* TAB 19: TRANSPORT SAFETY & INSPECTIONS */}
          {activeTab === 'safety-inspections' && <TransportSafetySection />}

          {/* TAB 20: TRANSPORT SCHEDULE & CALENDAR */}
          {activeTab === 'schedule-calendar' && <TransportScheduleSection />}

          {/* TAB 21: TRANSPORT INVENTORY & SPARE PARTS */}
          {activeTab === 'inventory' && <TransportInventorySection />}

          {/* TAB 22: TRANSPORT SETTINGS & POLICIES */}
          {activeTab === 'settings-policies' && <TransportSettingsSection />}
        </div>
          </>
        )}
      </main>

      {/* MODAL 1: ADD VEHICLE */}
      {showAddVehicleModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card">
            <div className="erp-modal-header">
              <h3>Add Vehicle to University Fleet</h3>
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label>Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OD-02-AK-4415"
                    value={newVehicleForm.busNumber}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, busNumber: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Fleet ID / Code</label>
                    <input
                      type="text"
                      placeholder="e.g. Bus 06"
                      value={newVehicleForm.fleetCode}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, fleetCode: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Seating Capacity</label>
                    <input
                      type="number"
                      value={newVehicleForm.capacity}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, capacity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="erp-form-group">
                  <label>Vehicle Type</label>
                  <select
                    value={newVehicleForm.type}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, type: e.target.value })}
                  >
                    <option value="52-Seater Coach">52-Seater Coach</option>
                    <option value="52-Seater AC Coach">52-Seater AC Coach</option>
                    <option value="42-Seater Coach">42-Seater Coach</option>
                    <option value="32-Seater Mini Coach">32-Seater Mini Coach</option>
                    <option value="Van / Multi-Utility">Van / Multi-Utility</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Assigned Driver</label>
                    <input
                      type="text"
                      placeholder="Driver Name"
                      value={newVehicleForm.driver}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, driver: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Driver Phone</label>
                    <input
                      type="text"
                      placeholder="+91 94371 XXXXX"
                      value={newVehicleForm.driverPhone}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, driverPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Fitness Certificate Expiry</label>
                    <input
                      type="date"
                      value={newVehicleForm.fitnessExpiry}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, fitnessExpiry: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Insurance Expiry</label>
                    <input
                      type="date"
                      value={newVehicleForm.insuranceExpiry}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, insuranceExpiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddVehicleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ROUTE */}
      {showAddRouteModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card">
            <div className="erp-modal-header">
              <h3>Configure Transit Bus Route</h3>
              <button
                type="button"
                onClick={() => setShowAddRouteModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddRoute}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label>Route Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Route 6: Mancheswar - Rasulgarh - Campus"
                    value={newRouteForm.name}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, name: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Route Code</label>
                    <input
                      type="text"
                      placeholder="e.g. RT-6"
                      value={newRouteForm.routeNumber}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, routeNumber: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Semester Tariff (₹)</label>
                    <input
                      type="number"
                      value={newRouteForm.farePerSemester}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, farePerSemester: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Morning Departure Time</label>
                    <input
                      type="text"
                      placeholder="07:15 AM"
                      value={newRouteForm.morningDeparture}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, morningDeparture: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Evening Campus Drop Time</label>
                    <input
                      type="text"
                      placeholder="05:30 PM"
                      value={newRouteForm.eveningArrival}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, eveningArrival: e.target.value })}
                    />
                  </div>
                </div>
                <div className="erp-form-group">
                  <label>Ordered Waypoint Stops (Comma-separated) *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="e.g. Mancheswar (07:15 AM), Vani Vihar (07:30 AM), Rasulgarh (07:45 AM), GIFT Campus (08:30 AM)"
                    value={newRouteForm.stops}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, stops: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddRouteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Register Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ENROLL DRIVER */}
      {showAddDriverModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card">
            <div className="erp-modal-header">
              <h3>Enroll Transport Driver</h3>
              <button
                type="button"
                onClick={() => setShowAddDriverModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddDriver}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label>Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhusudan Mohapatra"
                    value={newDriverForm.name}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, name: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Primary Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 94371 XXXXX"
                      value={newDriverForm.phone}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Emergency Contact</label>
                    <input
                      type="text"
                      placeholder="+91 98610 XXXXX"
                      value={newDriverForm.emergencyContact}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Driving Licence Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OD-02-2019-DL-10924"
                      value={newDriverForm.licenseNumber}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, licenseNumber: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Licence Expiry</label>
                    <input
                      type="date"
                      value={newDriverForm.licenseExpiry}
                      onChange={(e) => setNewDriverForm({ ...newDriverForm, licenseExpiry: e.target.value })}
                    />
                  </div>
                </div>
                <div className="erp-form-group">
                  <label>Licence Category</label>
                  <select
                    value={newDriverForm.licenseCategory}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, licenseCategory: e.target.value })}
                  >
                    <option value="HMV (Heavy Passenger Vehicle)">HMV (Heavy Passenger Vehicle)</option>
                    <option value="LMV Commercial">LMV Commercial</option>
                    <option value="Transport Multi-Axle">Transport Multi-Axle</option>
                  </select>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddDriverModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Enroll Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ALLOCATE STUDENT BUS PASS */}
      {showAllocatePassModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card">
            <div className="erp-modal-header">
              <h3>Allocate Student Transportation Pass</h3>
              <button
                type="button"
                onClick={() => setShowAllocatePassModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAllocatePass}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Student Registration / Roll No *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2305201012"
                      value={allocatePassForm.regNo}
                      onChange={(e) => setAllocatePassForm({ ...allocatePassForm, regNo: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Student Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Subrat Das"
                      value={allocatePassForm.studentName}
                      onChange={(e) => setAllocatePassForm({ ...allocatePassForm, studentName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="erp-form-group">
                  <label>Select Transit Route *</label>
                  <select
                    required
                    value={allocatePassForm.routeName}
                    onChange={(e) => {
                      const selected = busRoutes.find(r => r.name === e.target.value);
                      setAllocatePassForm({
                        ...allocatePassForm,
                        routeName: e.target.value,
                        fareAmount: selected?.farePerSemester || 15000,
                      });
                    }}
                  >
                    <option value="">-- Choose Route --</option>
                    {busRoutes.map(r => (
                      <option key={r.id} value={r.name}>
                        {r.name} (Fare: ₹{(r.farePerSemester || 15000).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="erp-form-group">
                  <label>Boarding Stop *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Badambadi Bus Stand / Master Canteen"
                    value={allocatePassForm.stopName}
                    onChange={(e) => setAllocatePassForm({ ...allocatePassForm, stopName: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Semester Tariff (₹)</label>
                    <input
                      type="number"
                      value={allocatePassForm.fareAmount}
                      onChange={(e) => setAllocatePassForm({ ...allocatePassForm, fareAmount: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                    <input
                      type="checkbox"
                      id="feePaidCheck"
                      checked={allocatePassForm.feePaid}
                      onChange={(e) => setAllocatePassForm({ ...allocatePassForm, feePaid: e.target.checked })}
                    />
                    <label htmlFor="feePaidCheck" style={{ margin: 0, cursor: 'pointer' }}>
                      Verified in Accounts Fee Ledger
                    </label>
                  </div>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAllocatePassModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Generate Bus Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: PRINTABLE OFFICIAL DIGITAL BUS PASS */}
      {showPrintPassModal && selectedPassForPrint && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card" style={{ maxWidth: '480px' }}>
            <div className="erp-modal-header">
              <h3>Official Student Transit Pass</h3>
              <button
                type="button"
                onClick={() => setShowPrintPassModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="erp-modal-body">
              <div className="digital-bus-pass">
                <div className="pass-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '30px', width: 'auto', background: '#ffffff', borderRadius: '4px', padding: '2px' }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff' }}>APNA CAMPUS</h4>
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>Campus Transit &amp; Logistics Service Pass</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{selectedPassForPrint.passNumber || selectedPassForPrint.id}</div>
                    <small style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 600 }}>Session 2026-27</small>
                  </div>
                </div>

                <div className="pass-grid">
                  <div>
                    <div className="pass-field">
                      <div className="pass-field-label">Student Name</div>
                      <div className="pass-field-val">{selectedPassForPrint.studentName}</div>
                    </div>
                    <div className="pass-field">
                      <div className="pass-field-label">Registration No</div>
                      <div className="pass-field-val" style={{ color: '#38bdf8' }}>{selectedPassForPrint.regNo}</div>
                    </div>
                    <div className="pass-field">
                      <div className="pass-field-label">Assigned Route</div>
                      <div className="pass-field-val" style={{ fontSize: '0.8rem' }}>{selectedPassForPrint.routeName}</div>
                    </div>
                    <div className="pass-field">
                      <div className="pass-field-label">Boarding Stop</div>
                      <div className="pass-field-val" style={{ fontSize: '0.8rem', color: '#facc15' }}>{selectedPassForPrint.stopName}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="pass-qr-box">
                      <QrCode size={64} color="#0f172a" />
                      <small>VERIFIED PASS</small>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700, marginTop: '6px' }}>
                      ✓ {selectedPassForPrint.status}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Validity: {selectedPassForPrint.validity || 'Autumn 2026'}</span>
                  <span>Non-Transferable Official Pass</span>
                </div>
              </div>
            </div>
            <div className="erp-modal-footer">
              <button type="button" className="erp-btn-secondary" onClick={() => setShowPrintPassModal(false)}>
                Close
              </button>
              <button
                type="button"
                className="erp-btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} /> Print Pass Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: UPDATE VEHICLE OPERATIONAL STATUS */}
      {showStatusModal && selectedVehicleForStatus && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card" style={{ maxWidth: '440px' }}>
            <div className="erp-modal-header">
              <h3>Update Status: {selectedVehicleForStatus.busNumber}</h3>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateVehicleStatus}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label>Operational Status</label>
                  <select
                    value={vehicleStatusUpdate.status}
                    onChange={(e) => setVehicleStatusUpdate({ ...vehicleStatusUpdate, status: e.target.value })}
                  >
                    <option value="Active (On Route)">Active (On Route)</option>
                    <option value="Available (Depot Idle)">Available (Depot Idle)</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label>Operational Remarks</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Undergoing scheduled 60,000 km brake pad servicing."
                    value={vehicleStatusUpdate.notes}
                    onChange={(e) => setVehicleStatusUpdate({ ...vehicleStatusUpdate, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: RECORD TRIP DELAY */}
      {showDelayModal && selectedTripForDelay && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card" style={{ maxWidth: '440px' }}>
            <div className="erp-modal-header">
              <h3>Log Traffic Delay: {selectedTripForDelay.tripCode}</h3>
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRecordDelay}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label>Estimated Delay (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={tripDelayUpdate.delayMinutes}
                    onChange={(e) => setTripDelayUpdate({ ...tripDelayUpdate, delayMinutes: e.target.value })}
                  />
                </div>
                <div className="erp-form-group">
                  <label>Traffic / Delay Reason</label>
                  <textarea
                    rows="3"
                    value={tripDelayUpdate.reason}
                    onChange={(e) => setTripDelayUpdate({ ...tripDelayUpdate, reason: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowDelayModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary" style={{ background: '#f59e0b' }}>
                  Broadcast Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: ROUTE DIVERSION / DISRUPTION */}
      {showDisruptionModal && selectedRouteForDisruption && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card" style={{ maxWidth: '460px' }}>
            <div className="erp-modal-header">
              <h3>Route Advisory: {selectedRouteForDisruption.name}</h3>
              <button
                type="button"
                onClick={() => setShowDisruptionModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRouteDisruption}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label>Disruption / Diversion Notice</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Due to road construction near Vani Vihar, bus will divert via Kalpana Square."
                    value={disruptionText}
                    onChange={(e) => setDisruptionText(e.target.value)}
                  ></textarea>
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>
                    Leave blank to restore normal active route status.
                  </small>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowDisruptionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Update Advisory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
