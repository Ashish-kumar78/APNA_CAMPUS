import React, { useState, useMemo, useEffect } from 'react';
import {
  Building,
  Bed,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  LogOut,
  Search,
  Plus,
  Home,
  ShieldCheck,
  Download,
  Calendar,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  Sparkles,
  Award,
  Printer,
  ArrowRight,
  Info,
  Check,
  QrCode,
  FileCheck
} from 'lucide-react';
import './HostelPortal.css';
import '../components/AdminPortal.css';
import { downloadHostelCensusPdf } from '../utils/pdfGenerator';
import {
  initialHostels,
  initialHostelRooms,
  initialHostelComplaints,
  initialHostelVisitors
} from '../data/collegeData.js';
import { getAllStudents } from '../services/studentStore.js';
import {
  getAllGatePasses,
  approveGatePass,
  rejectGatePass
} from '../services/gatePassStore.js';
import { api } from '../services/api.js';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';
import HandwrittenApplicationLetter from './HandwrittenApplicationLetter.jsx';

export default function HostelPortal({ account, onLogout }) {
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hostels, setHostels] = useState(initialHostels);
  const [rooms, setRooms] = useState(initialHostelRooms);
  const [complaints, setComplaints] = useState(initialHostelComplaints);
  const [visitors, setVisitors] = useState(initialHostelVisitors);
  const [students] = useState(() => getAllStudents());

  // Gate Pass Management State
  const [gatePasses, setGatePasses] = useState(() => getAllGatePasses());
  const [selectedGatePassModal, setSelectedGatePassModal] = useState(null);
  const [gatePassStatusFilter, setGatePassStatusFilter] = useState('ALL');
  const [gatePassHostelFilter, setGatePassHostelFilter] = useState('ALL');
  const [gatePassSearch, setGatePassSearch] = useState('');
  const [wardenReviewRemarks, setWardenReviewRemarks] = useState('Application and mentor verification reviewed. Outstation gate pass granted.');

  // Listen for real-time gate pass updates from Student Portal
  useEffect(() => {
    const syncPasses = () => {
      setGatePasses(getAllGatePasses());
    };
    window.addEventListener('bput_gate_passes_changed', syncPasses);
    window.addEventListener('storage', syncPasses);
    return () => {
      window.removeEventListener('bput_gate_passes_changed', syncPasses);
      window.removeEventListener('storage', syncPasses);
    };
  }, []);

  // Interactive Hostel & Room Drilldown State
  const [selectedHostelId, setSelectedHostelId] = useState('hostel-b1');
  const [expandedRooms, setExpandedRooms] = useState(new Set(['rm-1']));
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [roomFloorFilter, setRoomFloorFilter] = useState('ALL');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');


  const [selectedHostelFilter, setSelectedHostelFilter] = useState('All');
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    relation: 'Father',
    studentName: 'Rakesh Das',
    rollNumber: '01',
    inTime: '05:00 PM',
    purpose: 'Academic visit'
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const pendingGatePassCount = useMemo(() => {
    return gatePasses.filter(p => p.status === 'Pending Warden Approval').length;
  }, [gatePasses]);

  const filteredGatePasses = useMemo(() => {
    return gatePasses.filter(p => {
      const matchesStatus =
        gatePassStatusFilter === 'ALL' ||
        (gatePassStatusFilter === 'PENDING' && p.status === 'Pending Warden Approval') ||
        (gatePassStatusFilter === 'APPROVED' && p.status === 'Approved') ||
        (gatePassStatusFilter === 'REJECTED' && p.status === 'Rejected');

      const matchesHostel =
        gatePassHostelFilter === 'ALL' || p.hostelName === gatePassHostelFilter;

      const query = gatePassSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.id.toLowerCase().includes(query) ||
        p.studentName.toLowerCase().includes(query) ||
        (p.rollNumber && String(p.rollNumber).toLowerCase().includes(query)) ||
        (p.destination && p.destination.toLowerCase().includes(query));

      return matchesStatus && matchesHostel && matchesSearch;
    });
  }, [gatePasses, gatePassStatusFilter, gatePassHostelFilter, gatePassSearch]);

  const handleApproveGatePass = (passId) => {
    const wardenName = account?.name ? `${account.name} (Resident Warden)` : 'Mr. Rajesh Jena (Resident Warden)';
    const approved = approveGatePass(passId, wardenName, wardenReviewRemarks || 'Application and mentor verification reviewed. Outstation gate pass granted.');
    setGatePasses(getAllGatePasses());
    if (selectedGatePassModal && selectedGatePassModal.id === passId) {
      setSelectedGatePassModal(approved);
    }
    showToast(`✓ Gate Pass ${passId} Approved! Status updated automatically for student.`);
  };

  const handleRejectGatePass = (passId) => {
    const wardenName = account?.name ? `${account.name} (Resident Warden)` : 'Mr. Rajesh Jena (Resident Warden)';
    const rejected = rejectGatePass(passId, wardenName, wardenReviewRemarks || 'Application rejected.');
    setGatePasses(getAllGatePasses());
    if (selectedGatePassModal && selectedGatePassModal.id === passId) {
      setSelectedGatePassModal(rejected);
    }
    showToast(`Gate Pass ${passId} rejected.`);
  };


  const handleUpdateComplaintStatus = async (id, newStatus) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          resolutionNotes: newStatus === 'Resolved' ? 'Verified by hostel maintenance supervisor.' : c.resolutionNotes
        };
      }
      return c;
    }));
    showToast(`Complaint ${id} status updated to ${newStatus}`);
    try {
      await api.updateComplaintStatus(id, newStatus);
    } catch (err) {
      console.warn('Backend complaint status sync failed:', err.message);
    }
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    const newVisitor = {
      id: `VIS-${Math.floor(500 + Math.random() * 500)}`,
      visitorName: visitorForm.visitorName,
      relation: visitorForm.relation,
      studentName: visitorForm.studentName,
      rollNumber: visitorForm.rollNumber,
      inTime: visitorForm.inTime,
      outTime: 'Pending Sign-out',
      passNumber: `PASS-${Math.floor(800 + Math.random() * 200)}`,
      purpose: visitorForm.purpose
    };
    setVisitors(prev => [newVisitor, ...prev]);
    setIsVisitorModalOpen(false);
    showToast(`Visitor pass issued for ${newVisitor.visitorName}!`);
    try {
      await api.issueVisitorPass(visitorForm);
    } catch (err) {
      console.warn('Backend visitor pass sync failed:', err.message);
    }
  };

  const totalBeds = hostels.reduce((acc, h) => acc + h.totalBeds, 0);
  const occupiedBeds = hostels.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  const currentHostel = useMemo(() => {
    return hostels.find(h => h.id === selectedHostelId) || hostels[0];
  }, [hostels, selectedHostelId]);

  const toggleRoomExpand = (roomId) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  const expandAllRooms = (allRoomIds) => {
    setExpandedRooms(new Set(allRoomIds));
    showToast('Expanded all room dropdowns.');
  };

  const collapseAllRooms = () => {
    setExpandedRooms(new Set());
    showToast('Collapsed all room dropdowns.');
  };

  // Structured rooms with 4 students in each room
  const hostelRoomsWithResidents = useMemo(() => {
    const isGirlsHostel = selectedHostelId === 'hostel-g1';
    const pool = isGirlsHostel
      ? students.filter(s => s.gender === 'Female')
      : students.filter(s => s.gender !== 'Female');

    const offset = selectedHostelId === 'hostel-b2' ? 20 : 0;
    const studentsToUse = pool.slice(offset).concat(pool.slice(0, offset));

    const roomDefs = [
      { num: '1', floor: 'Floor 1', type: '4-Bed Quad Non-AC Standard', capacity: 4 },
      { num: '2', floor: 'Floor 1', type: '4-Bed Quad Non-AC Standard', capacity: 4 },
      { num: '3', floor: 'Floor 1', type: '4-Bed Quad Non-AC Standard', capacity: 4 },
      { num: '4', floor: 'Floor 2', type: '4-Bed Quad AC Deluxe', capacity: 4 },
      { num: '5', floor: 'Floor 2', type: '4-Bed Quad AC Deluxe', capacity: 4 },
      { num: '6', floor: 'Floor 2', type: '4-Bed Quad AC Deluxe', capacity: 4 },
      { num: '7', floor: 'Floor 3', type: '4-Bed Quad Premium', capacity: 4 },
      { num: '8', floor: 'Floor 3', type: '4-Bed Quad Premium', capacity: 4 },
    ];

    const bedLocations = [
      'Bed 01 (Window Side)',
      'Bed 02 (Study Side)',
      'Bed 03 (Inner Side)',
      'Bed 04 (Door Side)'
    ];

    const attendanceStatuses = [
      'In Hostel (Biometric Verified · 08:15 PM)',
      'In Hostel (Biometric Verified · 07:50 PM)',
      'Campus Central Library (Study Pass)',
      'In Hostel (Biometric Verified · 08:35 PM)'
    ];

    return roomDefs.map((def, rIdx) => {
      const roomResidents = [];
      for (let b = 0; b < def.capacity; b++) {
        const studentIndex = (rIdx * def.capacity + b) % (studentsToUse.length || 1);
        const std = studentsToUse[studentIndex] || {};
        const rollNum = parseInt(std.rollNumber) || (studentIndex + 1);
        roomResidents.push({
          bedNo: bedLocations[b] || `Bed 0${b + 1}`,
          bedIndex: b + 1,
          studentId: std.studentId || `GIFT-2023-${1000 + rollNum}`,
          registrationNumber: std.registrationNumber || `230520${String(rollNum).padStart(4, '0')}`,
          name: std.name || `Resident Student ${b + 1}`,
          rollNumber: std.rollNumber || String(rollNum).padStart(2, '0'),
          gender: std.gender || (isGirlsHostel ? 'Female' : 'Male'),
          section: std.section || 'Section A',
          semester: std.semester || 'Semester 5',
          department: std.department || 'Computer Science & Engineering',
          deptCode: std.deptCode || 'CSE',
          phone: std.phone || `+91 98610 ${String((rollNum * 1111) % 90000 + 10000)}`,
          fatherName: std.fatherName || 'Guardian Senior',
          fatherPhone: std.fatherPhone || `+91 94370 ${String((rollNum * 2222) % 90000 + 10000)}`,
          motherName: std.motherName || 'Mother Guardian',
          permAddress: std.permAddress ? `${std.permAddress}, ${std.permCity || 'Bhubaneswar'}` : 'Plot 18, Unit 4, Bhubaneswar, Odisha',
          bloodGroup: std.bloodGroup || 'B+',
          cgpa: std.cgpa || '8.25',
          attendance: std.attendance || 92,
          biometricStatus: attendanceStatuses[b % attendanceStatuses.length],
          rawStudent: std
        });
      }

      return {
        id: `rm-${def.num}`,
        roomNumber: def.num,
        displayTitle: `Room ${def.num}`,
        floor: def.floor,
        type: def.type,
        capacity: def.capacity,
        occupied: roomResidents.length,
        residents: roomResidents
      };
    });
  }, [selectedHostelId, students]);

  const filteredHostelRooms = useMemo(() => {
    return hostelRoomsWithResidents.filter(rm => {
      if (roomFloorFilter !== 'ALL' && rm.floor !== roomFloorFilter) return false;
      if (roomSearchQuery.trim()) {
        const q = roomSearchQuery.toLowerCase().trim();
        const matchRoom = rm.displayTitle.toLowerCase().includes(q) || rm.roomNumber.includes(q);
        const matchStudent = rm.residents.some(r =>
          r.name.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.rollNumber.includes(q)
        );
        return matchRoom || matchStudent;
      }
      return true;
    });
  }, [hostelRoomsWithResidents, roomFloorFilter, roomSearchQuery]);

  return (
    <div className="hostel-portal-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <CheckCircle2 size={18} color="#a78bfa" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="hostel-header">
        <div className="hostel-brand">
          <div className="hostel-brand-icon">
            <Home size={20} />
          </div>
          <div className="hostel-brand-text">
            <h1>GIFT AUTONOMOUS · HOSTEL & RESIDENTIAL SERVICES</h1>
            <p>Chief Warden & Student Accommodation Office</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="hostel-role-badge">
            <ShieldCheck size={14} />
            Chief Warden
          </span>
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
            {account?.name || 'Chief Hostel Warden'}
          </span>
          <button className="admin-signout-btn" onClick={onLogout} title="Sign Out">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="hostel-layout">
        {/* Sidebar */}
        <aside className="hostel-sidebar">
          <button
            className={`hostel-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={17} /> Dashboard
          </button>
          <button
            className={`hostel-nav-btn ${activeTab === 'hostels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hostels')}
          >
            <Building size={17} /> Hostels & Buildings
          </button>
          <button
            className={`hostel-nav-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            <Bed size={17} /> Rooms & Bed Allocations
          </button>
          <button
            className={`hostel-nav-btn ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <AlertCircle size={17} /> Complaints ({pendingComplaints})
          </button>
          <button
            className={`hostel-nav-btn ${activeTab === 'visitors' ? 'active' : ''}`}
            onClick={() => setActiveTab('visitors')}
          >
            <Users size={17} /> Visitor Management
          </button>
          <button
            className={`hostel-nav-btn ${activeTab === 'gatepasses' ? 'active' : ''}`}
            onClick={() => setActiveTab('gatepasses')}
          >
            <ShieldCheck size={17} /> Gate Pass (Outing / Home)
            {pendingGatePassCount > 0 && (
              <span className="hostel-badge-count">{pendingGatePassCount}</span>
            )}
          </button>
          <button
            className={`hostel-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={17} /> Occupancy Reports
          </button>
          <button
            className={`hostel-nav-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <Download size={17} /> Student Documents
          </button>
        </aside>

        {/* Dynamic Content Pane */}
        <main className="hostel-main">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>{greeting}, {account?.name || 'Chief Warden'}</h2>
                  <p>Hostel Administration &amp; Resident Welfare · Gandhi Block, Kalam Block &amp; Sarojini Girls Block.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="admin-action-btn-secondary" onClick={() => setActiveTab('gatepasses')}>
                    <ShieldCheck size={15} /> Review Gate Passes ({pendingGatePassCount})
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setIsVisitorModalOpen(true)}>
                    <Plus size={15} /> Issue Visitor Pass
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Total Hostels</span>
                    <div className="admin-kpi-card-icon blue"><Building size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">{hostels.length}</div>
                  <small style={{ color: '#64748b' }}>2 Boys & 1 Girls Residence</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Total Rooms</span>
                    <div className="admin-kpi-card-icon emerald"><Home size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">170</div>
                  <small style={{ color: '#64748b' }}>Across 9 residential floors</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Occupied Beds</span>
                    <div className="admin-kpi-card-icon purple"><Bed size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#7c3aed' }}>{occupiedBeds} / {totalBeds}</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>94.5% Current Occupancy</small>
                </div>

                <div className="admin-kpi-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('gatepasses')} title="Click to view gate passes">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Gate Pass Requests</span>
                    <div className="admin-kpi-card-icon amber"><ShieldCheck size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>{pendingGatePassCount} Pending</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>Mentor Verified · Action Needed</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Active Complaints</span>
                    <div className="admin-kpi-card-icon rose"><AlertCircle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#e11d48' }}>{pendingComplaints}</div>
                  <small style={{ color: '#e11d48', fontWeight: 600 }}>Action Required</small>
                </div>
              </div>

              {/* Residential Blocks Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {hostels.map(h => (
                  <div key={h.id} className="admin-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="admin-badge active">{h.type} Hostel</span>
                      <strong style={{ color: '#7c3aed' }}>{h.occupiedBeds} / {h.totalBeds} Beds</strong>
                    </div>
                    <h3 style={{ margin: '0 0 0.4rem 0', color: '#0f172a' }}>{h.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      Warden: <strong>{h.warden}</strong> ({h.contact})
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round((h.occupiedBeds / h.totalBeds) * 100)}%`, height: '100%', background: '#7c3aed', borderRadius: '9999px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                      <span>{h.totalRooms} Rooms · {h.totalFloors} Floors</span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>{h.availableBeds} Vacant</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Maintenance Feed */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Pending Maintenance & Resident Requests</h3>
                  <button className="admin-action-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('complaints')}>
                    View All Complaints
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {complaints.filter(c => c.status !== 'Resolved').map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: `4px solid ${c.priority === 'High' ? '#e11d48' : '#d97706'}` }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{c.title}</strong>
                          <span className={`admin-badge ${c.priority === 'High' ? 'rejected' : 'pending'}`}>{c.priority} Priority</span>
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Reported by: <strong>{c.studentName}</strong> (Roll {c.rollNumber}) · {c.hostel} · Room {c.roomNumber} · {c.filedDate}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="admin-action-btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.775rem' }}
                          onClick={() => handleUpdateComplaintStatus(c.id, 'In Progress')}
                        >
                          Mark In-Progress
                        </button>
                        <button
                          className="admin-action-btn-primary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.775rem', background: '#059669' }}
                          onClick={() => handleUpdateComplaintStatus(c.id, 'Resolved')}
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOSTELS & BUILDINGS */}
          {activeTab === 'hostels' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Hostel Infrastructure &amp; Building Complexes</h2>
                  <p>Click on any hostel complex below to view full details, floor rooms, resident student rosters, and room dropdowns.</p>
                </div>
              </div>

              {/* 3 Interactive Hostel Cards Grid (matching screenshot) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {hostels.map(h => {
                  const isSelected = selectedHostelId === h.id;
                  return (
                    <div
                      key={h.id}
                      className={`admin-card hostel-card-interactive ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedHostelId(h.id);
                        showToast(`Viewing details for ${h.name}`);
                      }}
                      style={{ marginBottom: 0 }}
                    >
                      {isSelected && (
                        <div className="hostel-selected-indicator">
                          <Check size={12} /> Currently Active
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <span className="admin-badge active">{h.type} Hostel</span>
                        <span className="admin-badge approved">Biometric Active</span>
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 800 }}>{h.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                        Resident Warden: <strong>{h.warden}</strong><br />
                        Emergency Contact: <span style={{ color: '#2563eb', fontWeight: 600 }}>{h.contact}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', textAlign: 'center', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed' }}>{h.totalRooms}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Rooms</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{h.occupiedBeds}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Occupied</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{h.availableBeds}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Vacant</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={isSelected ? 'admin-action-btn-primary' : 'admin-action-btn-secondary'}
                        style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHostelId(h.id);
                        }}
                      >
                        {isSelected ? '✓ Viewing Rooms & Resident Roster' : 'Click to View Full Details ▾'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* DETAILED HOSTEL PANEL WITH ROOM DROPDOWNS */}
              <div className="hostel-details-panel">
                {/* Top quick switcher */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Hostel Infrastructure &amp; Room Allocations
                    </span>
                    <h3 style={{ margin: '3px 0 0 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                      {currentHostel.name}
                    </h3>
                  </div>

                  {/* Switcher Buttons */}
                  <div className="hostel-switcher-bar" style={{ margin: 0 }}>
                    {hostels.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        className={`hostel-switcher-tab ${selectedHostelId === h.id ? 'active' : ''}`}
                        onClick={() => setSelectedHostelId(h.id)}
                      >
                        <Building size={14} /> {h.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner with Hostel Amenities & Warden Contacts */}
                <div className="hostel-details-header-card">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
                          {currentHostel.type} Residential Complex
                        </span>
                        <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
                          Biometric Active
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: 800 }}>{currentHostel.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.84rem', opacity: 0.85, lineHeight: 1.4 }}>
                        3 Floors · 60 Rooms · Central Dining Mess Hall &amp; 500 Mbps Wi-Fi
                      </p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.85rem 1.15rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.75, fontWeight: 600 }}>CHIEF RESIDENT WARDEN</div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, margin: '2px 0' }}>{currentHostel.warden}</div>
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
                        <Phone size={13} /> {currentHostel.contact}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                        📶 500 Mbps Wi-Fi
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                        ⚡ 24x7 Power Backup
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                        🛡️ Biometric Turnstiles
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                        🥗 Pure RO Water &amp; Mess
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar for Rooms */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Filter Floor:</span>
                    {['ALL', 'Floor 1', 'Floor 2', 'Floor 3'].map(fl => (
                      <button
                        key={fl}
                        type="button"
                        className={`admin-action-btn-secondary ${roomFloorFilter === fl ? 'active' : ''}`}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.8rem',
                          background: roomFloorFilter === fl ? '#7c3aed' : '#ffffff',
                          color: roomFloorFilter === fl ? '#ffffff' : '#475569',
                          borderColor: roomFloorFilter === fl ? '#7c3aed' : '#cbd5e1'
                        }}
                        onClick={() => setRoomFloorFilter(fl)}
                      >
                        {fl === 'ALL' ? 'All Floors' : fl}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flex: 1, maxWidth: '440px', minWidth: '240px' }}>
                    <div className="admin-search-wrap" style={{ flex: 1, margin: 0 }}>
                      <Search size={14} style={{ color: '#94a3b8' }} />
                      <input
                        className="admin-search-input"
                        placeholder="Search Room (e.g. Room 1) or student name…"
                        value={roomSearchQuery}
                        onChange={e => setRoomSearchQuery(e.target.value)}
                        style={{ padding: '0.45rem 0.75rem 0.45rem 2.2rem', fontSize: '0.82rem' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}
                      onClick={() => expandAllRooms(filteredHostelRooms.map(r => r.id))}
                    >
                      Expand All
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}
                      onClick={collapseAllRooms}
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* ROOM ACCORDION LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredHostelRooms.map(rm => {
                    const isExpanded = expandedRooms.has(rm.id);
                    return (
                      <div key={rm.id} className={`hostel-room-card ${isExpanded ? 'expanded' : ''}`}>
                        {/* Room Header - Clickable Dropdown Trigger */}
                        <div className="hostel-room-header" onClick={() => toggleRoomExpand(rm.id)}>
                          <div className="hostel-room-title">
                            <span className="hostel-room-num-badge">
                              {rm.displayTitle}
                            </span>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                                {rm.displayTitle} · {rm.type}
                              </div>
                              <div className="hostel-room-meta">
                                <span>{rm.floor}</span>
                                <span>·</span>
                                <span>Capacity: <strong>{rm.capacity} Beds</strong></span>
                                <span>·</span>
                                <span style={{ color: '#15803d', fontWeight: 600 }}>
                                  ✓ {rm.occupied} / {rm.capacity} Allocated
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className={`admin-badge ${rm.occupied === rm.capacity ? 'approved' : 'pending'}`}>
                              {rm.occupied === rm.capacity ? 'Full (4 Students)' : `${rm.occupied} Students`}
                            </span>
                            <button
                              type="button"
                              className="hostel-room-dropdown-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRoomExpand(rm.id);
                              }}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={15} /> Hide Residents
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={15} /> View 4 Resident Students ▾
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Dropdown Resident Pane with 4 Students Details & View Option */}
                        {isExpanded && (
                          <div className="hostel-residents-pane">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                📋 Allocated Resident Students (4 Beds Occupied)
                              </div>
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                Click <strong>View</strong> to inspect full student academic, guardian &amp; document details
                              </span>
                            </div>

                            <div className="admin-table-container" style={{ margin: 0, border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                              <table className="hostel-residents-table">
                                <thead>
                                  <tr>
                                    <th style={{ width: '130px' }}>Bed Number</th>
                                    <th style={{ width: '130px' }}>Student ID</th>
                                    <th>Student Name &amp; Branch</th>
                                    <th style={{ width: '80px', textAlign: 'center' }}>Sex</th>
                                    <th style={{ width: '110px' }}>Section &amp; Sem</th>
                                    <th>Contact &amp; Guardian</th>
                                    <th>Biometric Status</th>
                                    <th style={{ textAlign: 'center', width: '90px' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rm.residents.map(resident => (
                                    <tr key={resident.studentId}>
                                      <td>
                                        <span className="hostel-bed-pill">
                                          <Bed size={13} color="#7c3aed" /> {resident.bedNo}
                                        </span>
                                      </td>
                                      <td>
                                        <strong style={{ color: '#1e293b', fontFamily: 'monospace' }}>
                                          {resident.studentId}
                                        </strong>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                          Roll: {resident.rollNumber}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                          <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: resident.gender === 'Female' ? '#fdf2f8' : '#eff6ff',
                                            color: resident.gender === 'Female' ? '#db2777' : '#2563eb',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            border: `1.5px solid ${resident.gender === 'Female' ? '#fbcfe8' : '#bfdbfe'}`
                                          }}>
                                            {resident.name.charAt(0)}
                                          </div>
                                          <div>
                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{resident.name}</div>
                                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{resident.department}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <span className={`std-docs-gender-badge ${resident.gender === 'Female' ? 'girl' : 'boy'}`}>
                                          {resident.gender === 'Female' ? 'Girl' : 'Boy'}
                                        </span>
                                      </td>
                                      <td>
                                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>{resident.section}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{resident.semester}</div>
                                      </td>
                                      <td>
                                        <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                                          📱 {resident.phone}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                          Parent: {resident.fatherPhone}
                                        </div>
                                      </td>
                                      <td>
                                        <span style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          background: '#f0fdf4',
                                          color: '#15803d',
                                          fontSize: '0.74rem',
                                          fontWeight: 600,
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          border: '1px solid #bbf7d0'
                                        }}>
                                          <CheckCircle2 size={12} color="#16a34a" /> {resident.biometricStatus}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <button
                                          type="button"
                                          className="hostel-view-student-btn"
                                          onClick={() => setSelectedStudentModal({
                                            ...resident,
                                            hostelName: currentHostel.name,
                                            roomNumber: rm.displayTitle,
                                            wardenName: currentHostel.warden,
                                            wardenContact: currentHostel.contact
                                          })}
                                          title={`View full student details for ${resident.name}`}
                                        >
                                          <Eye size={13} /> View
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredHostelRooms.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                      <Bed size={40} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>No rooms matched your filter</p>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Try clearing the search query or selecting "All Floors".</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROOMS & BED ALLOCATIONS */}
          {activeTab === 'rooms' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Room & Bed Inventory Matrix</h2>
                  <p>Bed level allocation tracking across triple deluxe, double, and standard resident rooms.</p>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Room #</th>
                      <th>Hostel Residence</th>
                      <th>Floor</th>
                      <th>Room Type</th>
                      <th>Capacity</th>
                      <th>Occupancy Status</th>
                      <th>Allocated Residents</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(rm => (
                      <tr key={rm.id}>
                        <td><strong style={{ fontSize: '1rem', color: '#7c3aed' }}>Room {rm.roomNumber}</strong></td>
                        <td>{rm.hostelName}</td>
                        <td>{rm.floor}</td>
                        <td><span className="admin-badge active">{rm.type}</span></td>
                        <td>{rm.capacity} Beds</td>
                        <td>
                          <span className={`admin-badge ${rm.occupied === rm.capacity ? 'approved' : 'pending'}`}>
                            {rm.occupied} / {rm.capacity} Beds Occupied
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {rm.roomNumber === '204' ? 'Rakesh Das (B1), Priya Patra (B2), Sneha Mohanty (B3)' : 'Resident students enrolled'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-action-btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => showToast(`Room ${rm.roomNumber} allocation details inspected.`)}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Resident Maintenance Complaints Desk</h2>
                  <p>Electrical, plumbing, internet, and carpentry tickets logged by hostel residents.</p>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Student & Roll</th>
                      <th>Hostel & Room</th>
                      <th>Category</th>
                      <th>Issue Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.studentName}</div>
                          <small style={{ color: '#64748b' }}>Roll {c.rollNumber}</small>
                        </td>
                        <td>
                          <div>{c.hostel}</div>
                          <small style={{ color: '#7c3aed', fontWeight: 600 }}>Room {c.roomNumber}</small>
                        </td>
                        <td><span className="admin-badge active">{c.category}</span></td>
                        <td>{c.title}</td>
                        <td>
                          <span className={`admin-badge ${c.priority === 'High' ? 'rejected' : c.priority === 'Medium' ? 'pending' : 'active'}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${c.status === 'Resolved' ? 'approved' : c.status === 'In Progress' ? 'pending' : 'rejected'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <select
                            className="admin-select"
                            value={c.status}
                            onChange={e => handleUpdateComplaintStatus(c.id, e.target.value)}
                            style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: VISITORS */}
          {activeTab === 'visitors' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Hostel Visitor Gate Pass Register</h2>
                  <p>Real-time campus security log of visiting parents, guardians, and approved guests.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setIsVisitorModalOpen(true)}>
                  <Plus size={15} /> Log New Visitor
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Visitor Name & Relation</th>
                      <th>Visiting Resident</th>
                      <th>Time-In</th>
                      <th>Time-Out</th>
                      <th>Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map(v => (
                      <tr key={v.id}>
                        <td><code>{v.passNumber}</code></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.visitorName}</div>
                          <small style={{ color: '#64748b' }}>Relation: {v.relation}</small>
                        </td>
                        <td>
                          <div>{v.studentName}</div>
                          <small style={{ color: '#64748b' }}>Roll {v.rollNumber}</small>
                        </td>
                        <td>{v.inTime}</td>
                        <td>{v.outTime}</td>
                        <td>{v.purpose}</td>
                        <td>
                          <span className={`admin-badge ${v.outTime.includes('Pending') ? 'pending' : 'approved'}`}>
                            {v.outTime.includes('Pending') ? 'On Campus' : 'Departed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Hostel Occupancy & Maintenance Gazettes</h2>
                  <p>Comprehensive accommodation returns for campus administrative records.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 className="admin-card-title">Hostel Occupancy Census Report</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Bed-by-bed resident list across all 3 residences with emergency contact details.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => {
                    downloadHostelCensusPdf(hostels);
                    showToast('Generated and downloaded Hostel Occupancy Census PDF.');
                  }}>
                    <Download size={15} /> Download PDF Census
                  </button>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Maintenance & Infrastructure Audit</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Summary of resolution turnaround times for electrical and plumbing tickets.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => showToast('Exported Maintenance Audit to Excel.')}>
                    <Download size={15} /> Export Excel / CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: STUDENT DOCUMENTS */}
          {activeTab === 'documents' && (
            <StudentDocumentsTable portalRole="warden" />
          )}

          {/* TAB 8: STUDENT GATE PASSES (OUTSTATION / HOME) */}
          {activeTab === 'gatepasses' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Resident Student Outstation &amp; Home Gate Passes</h2>
                  <p>
                    Review student leave requests verified by academic mentors. Approve digital passes for campus exit and biometric turnstile clearance.
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="gate-pass-stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value">{gatePasses.length}</div>
                    <div className="gate-pass-stat-label">Total Outing Passes</div>
                  </div>
                </div>

                <div className="gate-pass-stat-card" style={{ border: pendingGatePassCount > 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
                  <div className="gate-pass-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value" style={{ color: '#d97706' }}>{pendingGatePassCount}</div>
                    <div className="gate-pass-stat-label">Pending Warden Action</div>
                  </div>
                </div>

                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value" style={{ color: '#16a34a' }}>
                      {gatePasses.filter(p => p.status === 'Approved').length}
                    </div>
                    <div className="gate-pass-stat-label">Approved &amp; Active</div>
                  </div>
                </div>

                <div className="gate-pass-stat-card">
                  <div className="gate-pass-stat-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="gate-pass-stat-value" style={{ color: '#7c3aed' }}>
                      {gatePasses.filter(p => p.status === 'Approved').length}
                    </div>
                    <div className="gate-pass-stat-label">Out of Campus / On Leave</div>
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('ALL')}
                  >
                    All Passes ({gatePasses.length})
                  </button>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('PENDING')}
                    style={gatePassStatusFilter === 'PENDING' ? { background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' } : {}}
                  >
                    ⏳ Pending Review ({pendingGatePassCount})
                  </button>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'APPROVED' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('APPROVED')}
                    style={gatePassStatusFilter === 'APPROVED' ? { background: '#16a34a', color: '#fff', borderColor: '#16a34a' } : {}}
                  >
                    ✓ Approved
                  </button>
                  <button
                    type="button"
                    className={`hostel-floor-pill ${gatePassStatusFilter === 'REJECTED' ? 'active' : ''}`}
                    onClick={() => setGatePassStatusFilter('REJECTED')}
                  >
                    ✕ Rejected
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className="admin-select"
                    value={gatePassHostelFilter}
                    onChange={e => setGatePassHostelFilter(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', borderRadius: '8px' }}
                  >
                    <option value="ALL">All Hostels</option>
                    <option value="Gandhi Boys Residence (Hostel 1)">Gandhi Boys Residence (Hostel 1)</option>
                    <option value="Kalam Boys Residence (Hostel 2)">Kalam Boys Residence (Hostel 2)</option>
                    <option value="Sarojini Girls Residence (Hostel 1)">Sarojini Girls Residence (Hostel 1)</option>
                  </select>

                  <div style={{ position: 'relative', width: '240px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Search student, roll, ID..."
                      value={gatePassSearch}
                      onChange={e => setGatePassSearch(e.target.value)}
                      style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Resident Student</th>
                      <th>Hostel &amp; Room</th>
                      <th>Destination &amp; Purpose</th>
                      <th>Departure &amp; Return</th>
                      <th>Mentor Verification</th>
                      <th>Application File</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Warden Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGatePasses.map(pass => {
                      const isPending = pass.status === 'Pending Warden Approval';
                      const isApproved = pass.status === 'Approved';

                      return (
                        <tr key={pass.id}>
                          <td>
                            <strong style={{ color: '#4338ca', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                              {pass.id}
                            </strong>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{pass.appliedAt}</div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: pass.gender === 'Female' ? '#fdf2f8' : '#eff6ff',
                                color: pass.gender === 'Female' ? '#db2777' : '#2563eb',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 700,
                                fontSize: '0.85rem'
                              }}>
                                {pass.studentName.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{pass.studentName}</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                  Roll {pass.rollNumber} · {pass.department}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>
                                  📞 {pass.studentPhone}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{pass.hostelName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700 }}>
                              {pass.roomNumber} ({pass.bedNo})
                            </div>
                          </td>

                          <td>
                            <span className="admin-badge active" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                              {pass.purposeType}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {pass.destination}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.78rem' }}>
                              <span style={{ color: '#64748b' }}>Out:</span> <strong>{pass.outDateTime ? pass.outDateTime.replace('T', ' ') : 'N/A'}</strong>
                            </div>
                            <div style={{ fontSize: '0.78rem' }}>
                              <span style={{ color: '#64748b' }}>In:</span> <strong>{pass.inDateTime ? pass.inDateTime.replace('T', ' ') : 'N/A'}</strong>
                            </div>
                          </td>

                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f0fdf4',
                              color: '#166534',
                              border: '1px solid #bbf7d0',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              <CheckCircle2 size={12} /> {pass.mentorStatus || 'Verified'}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              {pass.mentorName}
                            </div>
                          </td>

                          <td>
                            {pass.uploadedApplicationDoc ? (
                              <button
                                type="button"
                                className="gp-doc-badge"
                                onClick={() => setSelectedGatePassModal(pass)}
                                title="Click to inspect uploaded application"
                              >
                                <FileText size={12} style={{ color: '#4338ca' }} />
                                <span>{pass.uploadedApplicationDoc.fileName}</span>
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No file</span>
                            )}
                          </td>

                          <td>
                            {isApproved && (
                              <div>
                                <span className="gp-badge gp-badge-approved">
                                  <CheckCircle2 size={12} /> Approved
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: '2px' }}>
                                  {pass.approvedAt}
                                </div>
                              </div>
                            )}
                            {isPending && (
                              <span className="gp-badge gp-badge-pending">
                                <Clock size={12} /> Pending Approval
                              </span>
                            )}
                            {pass.status === 'Rejected' && (
                              <span className="gp-badge gp-badge-rejected">
                                Rejected
                              </span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="admin-action-btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  setSelectedGatePassModal(pass);
                                  setWardenReviewRemarks(pass.wardenRemarks || 'Application and mentor clearance verified. Outstation pass granted.');
                                }}
                              >
                                <Eye size={13} /> View
                              </button>

                              {isPending && (
                                <button
                                  type="button"
                                  className="hostel-quick-approve-btn"
                                  onClick={() => handleApproveGatePass(pass.id)}
                                  title="Approve Gate Pass"
                                >
                                  <Check size={13} /> Approve
                                </button>
                              )}

                              {isPending && (
                                <button
                                  type="button"
                                  className="hostel-quick-reject-btn"
                                  onClick={() => handleRejectGatePass(pass.id)}
                                  title="Reject Gate Pass"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredGatePasses.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                          <ShieldCheck size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                          <p style={{ margin: 0, fontWeight: 600 }}>No gate pass records matching the criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ISSUE VISITOR PASS */}
      {isVisitorModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Issue Hostel Gate Visitor Pass</h3>
              <button className="admin-table-action-btn" onClick={() => setIsVisitorModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVisitor}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Visitor Full Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={visitorForm.visitorName}
                      onChange={e => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                      placeholder="e.g. Mr. Ramesh Das"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Relationship</label>
                    <select
                      className="admin-form-select"
                      value={visitorForm.relation}
                      onChange={e => setVisitorForm({ ...visitorForm, relation: e.target.value })}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Local Guardian">Local Guardian</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Resident Roll #</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={visitorForm.rollNumber}
                      onChange={e => setVisitorForm({ ...visitorForm, rollNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Resident Student Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={visitorForm.studentName}
                      onChange={e => setVisitorForm({ ...visitorForm, studentName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Purpose of Visit</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={visitorForm.purpose}
                    onChange={e => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                    placeholder="e.g. Delivering essential study materials"
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsVisitorModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW STUDENT DETAILS ── */}
      {selectedStudentModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedStudentModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '680px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: selectedStudentModal.gender === 'Female' ? '#fdf2f8' : '#eff6ff',
                  color: selectedStudentModal.gender === 'Female' ? '#db2777' : '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: `2px solid ${selectedStudentModal.gender === 'Female' ? '#fbcfe8' : '#bfdbfe'}`
                }}>
                  {selectedStudentModal.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                    {selectedStudentModal.name}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Student ID: <strong>{selectedStudentModal.studentId}</strong> · Reg: {selectedStudentModal.registrationNumber} · Roll: {selectedStudentModal.rollNumber}
                  </p>
                </div>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedStudentModal(null)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Hostel Assignment Box */}
              <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  🏠 Hostel Accommodation &amp; Bed Allocation
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Hostel Residence</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{selectedStudentModal.hostelName}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Room &amp; Bed #</span>
                    <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.92rem' }}>
                      {selectedStudentModal.roomNumber} · {selectedStudentModal.bedNo}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Resident Warden</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                      {selectedStudentModal.wardenName} ({selectedStudentModal.wardenContact})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Biometric Attendance</span>
                    <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>
                      ✓ {selectedStudentModal.biometricStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic & Personal Particulars */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  🎓 Academic &amp; Personal Particulars
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                  <div><strong>Course:</strong> B.Tech - {selectedStudentModal.department}</div>
                  <div><strong>Academic Year:</strong> 2026-27 (Autonomous)</div>
                  <div><strong>Current Semester:</strong> {selectedStudentModal.semester}</div>
                  <div><strong>Section:</strong> {selectedStudentModal.section}</div>
                  <div><strong>Gender / Sex:</strong> {selectedStudentModal.gender === 'Female' ? 'Female (Girl)' : 'Male (Boy)'}</div>
                  <div><strong>Blood Group:</strong> {selectedStudentModal.bloodGroup}</div>
                  <div><strong>CGPA:</strong> {selectedStudentModal.cgpa} / 10.0</div>
                  <div><strong>Class Attendance:</strong> {selectedStudentModal.attendance}%</div>
                </div>
              </div>

              {/* Guardian & Emergency Contacts */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  👨‍👩‍👦 Emergency &amp; Guardian Contacts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                  <div><strong>Student Phone:</strong> {selectedStudentModal.phone}</div>
                  <div><strong>Father / Guardian:</strong> {selectedStudentModal.fatherName} ({selectedStudentModal.fatherPhone})</div>
                  <div><strong>Mother Name:</strong> {selectedStudentModal.motherName}</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Permanent Home Address:</strong> {selectedStudentModal.permAddress}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} /> Print Resident Slip
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                onClick={() => setSelectedStudentModal(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: WARDEN GATE PASS APPLICATION REVIEW DOSSIER ── */}
      {selectedGatePassModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedGatePassModal(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '720px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="admin-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: selectedGatePassModal.gender === 'Female' ? '#fdf2f8' : '#eff6ff',
                  color: selectedGatePassModal.gender === 'Female' ? '#db2777' : '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: `2px solid ${selectedGatePassModal.gender === 'Female' ? '#fbcfe8' : '#bfdbfe'}`
                }}>
                  {selectedGatePassModal.studentName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                    Gate Pass Dossier · {selectedGatePassModal.id}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {selectedGatePassModal.studentName} (Roll: {selectedGatePassModal.rollNumber} · Reg: {selectedGatePassModal.registrationNumber}) · {selectedGatePassModal.department}
                  </p>
                </div>
              </div>
              <button
                className="admin-table-action-btn"
                onClick={() => setSelectedGatePassModal(null)}
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 1. Travel & Residence Particulars */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  🏠 Accommodation &amp; Travel Particulars
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Hostel Residence</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedGatePassModal.hostelName}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Room &amp; Bed #</span>
                    <div style={{ fontWeight: 700, color: '#7c3aed' }}>
                      {selectedGatePassModal.roomNumber} ({selectedGatePassModal.bedNo})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Reason / Purpose</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedGatePassModal.purposeType}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Parent Contact</span>
                    <div style={{ fontWeight: 600, color: '#2563eb' }}>
                      <Phone size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      {selectedGatePassModal.parentPhone || selectedGatePassModal.emergencyContact}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Destination Full Address</span>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{selectedGatePassModal.destination}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Departure Schedule</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {selectedGatePassModal.outDateTime ? selectedGatePassModal.outDateTime.replace('T', ' ') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Expected Return</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {selectedGatePassModal.inDateTime ? selectedGatePassModal.inDateTime.replace('T', ' ') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Mentor Verification & Recommendation Endorsement */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Academic Mentor Verification &amp; Endorsement
                  </div>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', border: '1px solid #86efac' }}>
                    ✓ Mentor Verified
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <strong>Faculty Mentor:</strong> {selectedGatePassModal.mentorName} ({selectedGatePassModal.mentorEmpId || 'Faculty Advisor'})
                  </div>
                  <div>
                    <strong>Department:</strong> {selectedGatePassModal.mentorDepartment || selectedGatePassModal.department}
                  </div>
                  <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #dcfce7', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Mentor Endorsement Remark:</span>
                    <p style={{ margin: '3px 0 0 0', color: '#166534', fontWeight: 600 }}>
                      "{selectedGatePassModal.mentorRemarks || 'Verified attendance norms and exams. Student recommended for leave.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Uploaded Application Document Letter Preview (Handwritten with Mentor Signature) */}
              {selectedGatePassModal.uploadedApplicationDoc && (
                <div style={{ background: '#fdfbf7', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} /> Attached Handwritten Student Application &amp; Approved Mentor Signature
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#1e3a8a', background: '#eff6ff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', fontWeight: 600 }}>
                      ✍️ Verified Handwritten Original · {selectedGatePassModal.uploadedApplicationDoc.fileName}
                    </span>
                  </div>

                  <div style={{ maxHeight: '420px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0.5rem' }}>
                    <HandwrittenApplicationLetter pass={selectedGatePassModal} doc={selectedGatePassModal.uploadedApplicationDoc} />
                  </div>
                </div>
              )}

              {/* 4. Current Status or Approval Action */}
              {selectedGatePassModal.status === 'Approved' ? (
                <div className="hostel-stamp-approved-box">
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                    ✓ OFFICIALLY APPROVED BY HOSTEL WARDEN
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '4px' }}>
                    Approved by: <strong>{selectedGatePassModal.approvedBy}</strong> on {selectedGatePassModal.approvedAt}
                  </div>
                  {selectedGatePassModal.wardenRemarks && (
                    <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '4px', fontStyle: 'italic' }}>
                      Remarks: "{selectedGatePassModal.wardenRemarks}"
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    <QrCode size={14} /> Digital Biometric Exit Code Active at Campus Gates
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.15rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    ✍️ Warden Approval Decision &amp; Instructions
                  </div>
                  <div className="admin-form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78350f' }}>
                      Warden Remarks / Special Permissions
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={wardenReviewRemarks}
                      onChange={e => setWardenReviewRemarks(e.target.value)}
                      placeholder="e.g. Application and mentor verification reviewed. Outstation gate pass granted."
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Dossier
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setSelectedGatePassModal(null)}
                >
                  Close
                </button>

                {selectedGatePassModal.status === 'Pending Warden Approval' && (
                  <>
                    <button
                      type="button"
                      className="hostel-quick-reject-btn"
                      style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                      onClick={() => handleRejectGatePass(selectedGatePassModal.id)}
                    >
                      <X size={15} /> Reject
                    </button>

                    <button
                      type="button"
                      className="admin-action-btn-primary"
                      style={{ background: '#16a34a', padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleApproveGatePass(selectedGatePassModal.id)}
                    >
                      <Check size={16} /> Approve Gate Pass
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

