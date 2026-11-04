import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bus,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Fuel,
  Navigation,
  Printer,
  ShieldCheck,
  Users
} from 'lucide-react';
import { transportStore } from '../../services/transportStore';
import './TransportExtraSections.css';

export default function TransportDailySummarySection() {
  const [summary, setSummary] = useState(() => transportStore.getDailyOperationsSummary());
  const [trips, setTrips] = useState(() => transportStore.getTrips());
  const [routes, setRoutes] = useState(() => transportStore.getRoutes());

  useEffect(() => {
    const unsub = transportStore.subscribe(() => {
      setSummary(transportStore.getDailyOperationsSummary());
      setTrips(transportStore.getTrips());
      setRoutes(transportStore.getRoutes());
    });
    return unsub;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummaryCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Fleet Strength', summary.totalFleet],
      ['Operational Vehicles', summary.operational],
      ['Vehicles In Maintenance Bay', summary.maintenance],
      ['Fleet Readiness Score', `${summary.fleetReadinessPct}%`],
      ['Registered Active Commuters', summary.activeCommuters],
      ['Total Boarded Commuters Today', summary.boardedToday],
      ['Boarding Verification Rate', `${summary.boardingCompliancePct}%`],
      ['Crew On Duty', `${summary.presentStaff} of ${summary.totalStaff}`],
      ['Total Fuel Dispatched (L)', `${summary.todayFuelLitres} L`],
      ['Total Fuel Expense', `₹${summary.todayFuelCost}`],
      ['Morning Dispatch', summary.morningTripsStatus],
      ['Evening Dispatch', summary.eveningTripsStatus],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GIFT_Daily_Transport_Operations_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><Clock size={24} className="text-sky-600" /> Daily Operations Summary & Shift Manifest</h2>
          <p>Real-time audit of daily fleet dispatches, passenger turnouts, crew attendance, and fuel consumption for {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="trans-btn trans-btn-secondary" onClick={handlePrint}>
            <Printer size={15} /> Print Daily Manifest
          </button>
          <button className="trans-btn trans-btn-primary" onClick={handleExportSummaryCSV}>
            <Download size={15} /> Export Operations CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Bus size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{summary.operational} / {summary.totalFleet}</span>
            <span className="trans-kpi-title">Active Fleet Deployed</span>
            <span className="trans-kpi-subtitle">{summary.fleetReadinessPct}% operational readiness</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><Users size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{summary.boardedToday}</span>
            <span className="trans-kpi-title">Commuters Boarded</span>
            <span className="trans-kpi-subtitle">Out of {summary.activeCommuters} registered passes</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Users size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{summary.presentStaff} / {summary.totalStaff}</span>
            <span className="trans-kpi-title">Crew Attendance</span>
            <span className="trans-kpi-subtitle">Drivers & conductors on duty</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><Fuel size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{summary.todayFuelCost.toLocaleString()}</span>
            <span className="trans-kpi-title">Fuel Incurred Today</span>
            <span className="trans-kpi-subtitle">{summary.todayFuelLitres} Litres Diesel / CNG</span>
          </div>
        </div>
      </div>

      {/* Shift Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginTop: '16px' }}>
        {/* Morning Shift Card */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px' }}>
              ✓ SHIFT 1: COMPLETED
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>06:30 AM - 08:35 AM</span>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#0f172a' }}>Morning Inbound Academic Transit</h3>
          <p style={{ margin: '0 0 14px', fontSize: '0.86rem', color: '#64748b' }}>
            All 5 major college transit corridors arrived at Campus Central Bay on schedule. Zero breakdowns reported.
          </p>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Scheduled Routes:</span>
              <strong style={{ color: '#0f172a' }}>5 Routes (All Dispatched)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Average Arrival Delay:</span>
              <strong style={{ color: '#16a34a' }}>+0.0 Mins (Punctual)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>First Aid / Walkaround Audit:</span>
              <strong style={{ color: '#0284c7' }}>100% Verified OK</strong>
            </div>
          </div>
        </div>

        {/* Evening Shift Card */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px' }}>
              ● SHIFT 2: BOARDING ACTIVE
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>04:45 PM - 06:45 PM</span>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#0f172a' }}>Evening Outbound Return Transit</h3>
          <p style={{ margin: '0 0 14px', fontSize: '0.86rem', color: '#64748b' }}>
            Buses positioned in bays 1 through 5. RFID & QR scanner terminals active. Departure at 05:00 PM IST.
          </p>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Buses in Departure Bay:</span>
              <strong style={{ color: '#0f172a' }}>5 Buses Stationed</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Expected Return Commuters:</span>
              <strong style={{ color: '#0284c7' }}>212 Students & Staff</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Standby Relief Vehicle:</span>
              <strong style={{ color: '#16a34a' }}>Bus 05 (Ready at Workshop Bay)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Operations Status Table */}
      <div className="trans-table-card" style={{ marginTop: '20px' }}>
        <div className="trans-table-title" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} className="text-sky-600" /> Today's Corridor Transit Dispatch Status
          </h3>
        </div>
        <div className="trans-table-wrap">
          <table className="trans-table">
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Corridor Route</th>
                <th>Assigned Bus</th>
                <th>Designated Driver</th>
                <th>Morning Departure</th>
                <th>Evening Departure</th>
                <th>Dispatched Capacity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id || route.routeNumber}>
                  <td><strong>{route.name}</strong></td>
                  <td><span className="trans-code-badge">{route.routeNumber}</span></td>
                  <td><strong>{route.busNumber}</strong></td>
                  <td>{route.driverName || 'Designated Crew'}</td>
                  <td>{route.morningDeparture}</td>
                  <td>{route.eveningArrival}</td>
                  <td>{route.totalCapacity || 52} Commuters</td>
                  <td>
                    <span className="trans-status-badge success">
                      <CheckCircle2 size={12} /> On Schedule
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

