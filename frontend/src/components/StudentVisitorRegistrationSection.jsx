import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  ShieldCheck,
  QrCode,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Search,
  Phone,
  Building,
  User,
  Plus,
  ArrowRight,
  Sparkles,
  Share2
} from 'lucide-react';
import api from '../services/api.js';
import { getActiveStudent } from '../services/studentStore.js';
import QrSvgRenderer from './Common/QrSvgRenderer.jsx';

export default function StudentVisitorRegistrationSection({ student: propStudent }) {
  const currentStudent = propStudent || getActiveStudent();
  const [visitors, setVisitors] = useState([
    {
      id: 'vis-pre-01',
      visitorName: 'Mr. Bimal Das',
      relation: 'Father',
      studentName: currentStudent?.name || 'Sneha Mohanty',
      rollNumber: currentStudent?.rollNumber || currentStudent?.registrationNumber || '03',
      inTime: 'Pending Arrival',
      outTime: 'Pending Sign-out',
      passNumber: 'PASS-V-101',
      purpose: 'Hostel Semester Fee Settlement & Family Check-in',
      phone: '+91 94370 10001',
      idProofNumber: 'Aadhaar: Verified on arrival',
      badgeNumber: null,
      verificationCode: '842109',
      status: 'Pre-Approved',
      gateNumber: 'Gate 1',
      visitType: 'PRE_REGISTERED',
      expectedVisitDate: '2026-10-15',
      expectedArrivalTime: '10:30 AM',
      expectedDepartureTime: '04:00 PM',
      numberOfVisitors: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'vis-pre-02',
      visitorName: 'Mrs. Jayanti Patra',
      relation: 'Mother',
      studentName: currentStudent?.name || 'Sneha Mohanty',
      rollNumber: currentStudent?.rollNumber || currentStudent?.registrationNumber || '03',
      inTime: '11:15 AM',
      outTime: 'Pending Sign-out',
      passNumber: 'PASS-V-102',
      purpose: 'Festival Break Pickup & Document Sign-off',
      phone: '+91 94370 20002',
      idProofNumber: 'Voter ID: 8812-OD',
      badgeNumber: 'BADGE-V-08',
      verificationCode: '619352',
      status: 'Checked In',
      gateNumber: 'Gate 1',
      visitType: 'PRE_REGISTERED',
      expectedVisitDate: '2026-10-14',
      expectedArrivalTime: '11:00 AM',
      expectedDepartureTime: '05:30 PM',
      numberOfVisitors: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ]);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPassModal, setSelectedPassModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [rejectModalVisitor, setRejectModalVisitor] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  // Form state matching required fields
  const [formData, setFormData] = useState({
    visitorName: '',
    phone: '',
    relation: 'Father',
    purpose: 'Family Visit',
    expectedVisitDate: new Date().toISOString().slice(0, 10),
    expectedArrivalTime: '10:00 AM',
    expectedDepartureTime: '05:00 PM',
    numberOfVisitors: 1,
    idVerificationStatus: 'Aadhaar Card (Physical Check at Gate)',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleStudentApprove = async (visitorId) => {
    try {
      if (api.studentApproveSecurityVisitor) {
        await api.studentApproveSecurityVisitor(visitorId);
      }
      setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, status: 'Pre-Approved' } : v));
      showToast('✓ Visitor Approved! Security Guard at Gate 1 has been cleared to issue badge.');
      loadVisitors();
    } catch (err) {
      showToast(err.message || 'Failed to approve visitor.');
    }
  };

  const handleStudentReject = async (visitorId) => {
    try {
      if (api.studentRejectSecurityVisitor) {
        await api.studentRejectSecurityVisitor(visitorId, rejectionRemarks || 'Host student declined permission.');
      }
      setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, status: 'Rejected by Student' } : v));
      setRejectModalVisitor(null);
      setRejectionRemarks('');
      showToast('Visitor declined. Gate security has been informed to withhold entry.');
      loadVisitors();
    } catch (err) {
      showToast(err.message || 'Failed to decline visitor.');
    }
  };

  const loadVisitors = async () => {
    try {
      const res = await api.getSecurityVisitors();
      if (res && Array.isArray(res)) {
        // Filter visitors belonging to this student
        const studentRoll = currentStudent?.rollNumber || currentStudent?.registrationNumber || '03';
        const myVisitors = res.filter(v =>
          (v.rollNumber && v.rollNumber.toLowerCase() === studentRoll.toLowerCase()) ||
          (v.studentName && v.studentName.toLowerCase().includes((currentStudent?.name || '').toLowerCase()))
        );
        if (myVisitors.length > 0) {
          setVisitors(prev => {
            const map = new Map();
            [...myVisitors, ...prev].forEach(item => map.set(item.id || item.verificationCode, item));
            return Array.from(map.values());
          });
        }
      }
    } catch (e) {
      // In-memory fallback
    }
  };

  useEffect(() => {
    loadVisitors();
  }, [currentStudent]);

  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      showToast(`✓ Gate Code ${code} copied to clipboard!`);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.visitorName.trim()) {
      showToast('Please enter the visitor full name.');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Please enter the visitor contact number.');
      return;
    }

    setLoading(true);
    const studentName = currentStudent?.name || 'Sneha Mohanty';
    const rollNumber = currentStudent?.rollNumber || currentStudent?.registrationNumber || '03';

    try {
      const payload = {
        visitorName: formData.visitorName.trim(),
        relation: formData.relation,
        purpose: formData.purpose.trim(),
        phone: formData.phone.trim(),
        expectedVisitDate: formData.expectedVisitDate,
        expectedArrivalTime: formData.expectedArrivalTime,
        expectedDepartureTime: formData.expectedDepartureTime,
        numberOfVisitors: Number(formData.numberOfVisitors) || 1,
        idVerificationStatus: formData.idVerificationStatus,
        studentName,
        rollNumber,
      };

      const res = await api.inviteSecurityVisitor(payload);
      const newVis = res?.visitor || {
        id: `vis-${Date.now()}`,
        ...payload,
        passNumber: `PASS-V-${Math.floor(100 + Math.random() * 900)}`,
        verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
        status: 'Pre-Approved',
        inTime: 'Pending Arrival',
        outTime: 'Pending Sign-out',
        gateNumber: 'Gate 1',
        createdAt: new Date().toISOString(),
      };

      setVisitors(prev => [newVis, ...prev]);
      setIsRegisterModalOpen(false);
      setSelectedPassModal(newVis);
      showToast(`✓ Visitor pre-registered! 6-digit Gate Code: ${newVis.verificationCode}`);

      // Reset form
      setFormData({
        visitorName: '',
        phone: '',
        relation: 'Father',
        purpose: 'Family Visit',
        expectedVisitDate: new Date().toISOString().slice(0, 10),
        expectedArrivalTime: '10:00 AM',
        expectedDepartureTime: '05:00 PM',
        numberOfVisitors: 1,
        idVerificationStatus: 'Aadhaar Card (Physical Check at Gate)',
      });
    } catch (err) {
      showToast(err.message || 'Failed to pre-register visitor.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter(v => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.verificationCode && v.verificationCode.includes(searchTerm)) ||
      (v.passNumber && v.passNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'PRE_APPROVED' && (v.status === 'Pre-Approved' || v.status === 'Pending Arrival')) ||
      (filterStatus === 'CHECKED_IN' && v.status === 'Checked In') ||
      (filterStatus === 'CHECKED_OUT' && v.status === 'Checked Out');

    return matchesSearch && matchesStatus;
  });

  const preApprovedCount = visitors.filter(v => v.status === 'Pre-Approved' || v.status === 'Pending Arrival').length;
  const checkedInCount = visitors.filter(v => v.status === 'Checked In').length;
  const pendingStudentApprovals = visitors.filter(v => v.status === 'Awaiting Student Approval');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <Sparkles size={18} style={{ color: '#38bdf8' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SECTION 8.B: INCOMING WALK-IN VISITOR APPROVAL PROMPT */}
      {pendingStudentApprovals.length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '50%', color: '#d97706' }}>
              <AlertCircle size={22} />
            </div>
            <div>
              <strong style={{ color: '#92400e', fontSize: '1.05rem' }}>
                Walk-in Visitor Approval Request at Gate Checkpoint ({pendingStudentApprovals.length})
              </strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#b45309' }}>
                An unexpected visitor has arrived at the campus entrance asking to meet you. Please verify and authorize entry.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingStudentApprovals.map((vis) => (
              <div
                key={vis.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{vis.visitorName}</strong>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700 }}>
                      {vis.relation}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                    <strong>Purpose:</strong> {vis.purpose} · <strong>Phone:</strong> {vis.phone || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                    Gate: {vis.gateNumber || 'Main Gate 1'} · Govt ID: {vis.idProofNumber || 'Inspected by Guard'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => handleStudentApprove(vis.id)}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                    }}
                  >
                    <Check size={16} /> Approve Visitor Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectModalVisitor(vis)}
                    style={{
                      background: '#ffffff',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <X size={16} /> Decline Visit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <ShieldCheck size={14} /> Section 8.A · Pre-Registered Campus Visitor Management
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Pre-Register Campus Visitors</h2>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.88rem', maxWidth: '640px' }}>
            Register your parents, guardians, or official guests prior to arrival. Generates a secure 6-digit verification code and QR badge for swift check-in at Security Turnstiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.75rem 1.4rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
          }}
        >
          <UserPlus size={18} /> Pre-Register New Visitor
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '12px', borderRadius: '10px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{visitors.length}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total Registered Visitors</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '12px', borderRadius: '10px' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{preApprovedCount}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Pre-Approved (Awaiting Gate Entry)</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '10px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{checkedInCount}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Currently On Campus (Checked In)</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterStatus === 'ALL' ? '1px solid #0284c7' : '1px solid #e2e8f0',
              background: filterStatus === 'ALL' ? '#0284c7' : '#ffffff',
              color: filterStatus === 'ALL' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            All Invitations ({visitors.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('PRE_APPROVED')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterStatus === 'PRE_APPROVED' ? '1px solid #d97706' : '1px solid #e2e8f0',
              background: filterStatus === 'PRE_APPROVED' ? '#d97706' : '#ffffff',
              color: filterStatus === 'PRE_APPROVED' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Pre-Approved ({preApprovedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('CHECKED_IN')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterStatus === 'CHECKED_IN' ? '1px solid #16a34a' : '1px solid #e2e8f0',
              background: filterStatus === 'CHECKED_IN' ? '#16a34a' : '#ffffff',
              color: filterStatus === 'CHECKED_IN' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            On Campus ({checkedInCount})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search visitor name, code, pass..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
            }}
          />
        </div>
      </div>

      {/* Visitor Invitations Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>My Visitor Invitations Ledger</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Security guard at Main Gate 1 will verify the 6-digit access code upon arrival.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Visitor Details</th>
                <th style={{ padding: '12px 16px' }}>6-Digit Gate Code</th>
                <th style={{ padding: '12px 16px' }}>Expected Date & Time</th>
                <th style={{ padding: '12px 16px' }}>Purpose of Visit</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((vis) => {
                const isCheckedIn = vis.status === 'Checked In';
                const isCheckedOut = vis.status === 'Checked Out';
                const isPreApproved = !isCheckedIn && !isCheckedOut;

                return (
                  <tr key={vis.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{vis.visitorName}</div>
                      <div style={{ color: '#64748b', fontSize: '0.76rem', marginTop: '2px' }}>
                        {vis.relation} · Phone: {vis.phone}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Pass: {vis.passNumber}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '5px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '1px', color: '#0369a1' }}>
                          {vis.verificationCode || '842109'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(vis.verificationCode)}
                          title="Copy Gate Verification Code"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        <Calendar size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        {vis.expectedVisitDate || '2026-10-15'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.76rem', marginTop: '2px' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                        {vis.expectedArrivalTime || '10:00 AM'} – {vis.expectedDepartureTime || '05:00 PM'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                      <div style={{ color: '#1e293b', fontWeight: 600 }}>{vis.purpose}</div>
                      <div style={{ color: '#64748b', fontSize: '0.74rem', marginTop: '2px' }}>
                        Visitors: {vis.numberOfVisitors || 1} Person{vis.numberOfVisitors > 1 ? 's' : ''}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {isCheckedIn ? (
                        <div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.74rem' }}>
                            <CheckCircle2 size={12} /> Checked In On Campus
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '2px' }}>
                            Badge: {vis.badgeNumber || 'BADGE-V-01'} ({vis.inTime})
                          </div>
                        </div>
                      ) : isCheckedOut ? (
                        <div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.74rem' }}>
                            Checked Out
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                            Departed: {vis.outTime}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.74rem' }}>
                            <Clock size={12} /> Pre-Approved (Gate Ready)
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '2px' }}>
                            Present 6-digit code at Gate 1
                          </div>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedPassModal(vis)}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <QrCode size={13} /> View Gate Pass
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    <Users size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>No visitor invitations found.</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>Click "Pre-Register New Visitor" above to register guests before arrival.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL 1: PRE-REGISTER VISITOR FORM ── */}
      {isRegisterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsRegisterModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '1.25rem 1.5rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Pre-Register Campus Visitor</h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Fill visitor credentials to generate instant 6-digit gate clearance code</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {/* Host Student Info Card (Auto-filled) */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Host Student (You)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{currentStudent?.name || 'Sneha Mohanty'}</strong>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Roll: {currentStudent?.rollNumber || currentStudent?.registrationNumber || '03'}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {currentStudent?.department || 'Computer Science & Engineering'} · {currentStudent?.hostelName || 'Sarojini Girls Residence (Hostel 1)'} Room {currentStudent?.roomNumber || '103'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Visitor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Bimal Das"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94370 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Relation to Student *
                  </label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Local Guardian">Local Guardian</option>
                    <option value="Relative">Relative</option>
                    <option value="Project Collaborator">Project Collaborator / Peer</option>
                    <option value="Official / Academic Guest">Official / Academic Guest</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Purpose of Visit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fee Payment, Family Meeting"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Expected Visit Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedVisitDate}
                    onChange={(e) => setFormData({ ...formData, expectedVisitDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Accompanying Visitors Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.numberOfVisitors}
                    onChange={(e) => setFormData({ ...formData, numberOfVisitors: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Expected Arrival Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={formData.expectedArrivalTime}
                    onChange={(e) => setFormData({ ...formData, expectedArrivalTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Expected Departure Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 05:00 PM"
                    value={formData.expectedDepartureTime}
                    onChange={(e) => setFormData({ ...formData, expectedDepartureTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  ID Verification Status / Govt Proof
                </label>
                <select
                  value={formData.idVerificationStatus}
                  onChange={(e) => setFormData({ ...formData, idVerificationStatus: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                >
                  <option value="Aadhaar Card (Physical Check at Gate)">Aadhaar Card (Physical Check at Gate)</option>
                  <option value="Voter ID Card">Voter ID Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport / Govt Official ID">Passport / Govt Official ID</option>
                  <option value="Verified on Arrival by Security">Verified on Arrival by Security Guard</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {loading ? 'Registering...' : 'Generate 6-Digit Gate Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: VIEW VISITOR GATE PASS & QR ── */}
      {selectedPassModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedPassModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', padding: '1.5rem', color: '#ffffff', position: 'relative' }}>
              <button
                type="button"
                onClick={() => setSelectedPassModal(null)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255, 255, 255, 0.2)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, fontWeight: 700 }}>
                APNA CAMPUS · VISITOR PRE-APPROVAL PASS
              </div>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.3rem', fontWeight: 800 }}>{selectedPassModal.visitorName}</h3>
              <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>{selectedPassModal.relation} · Pass: {selectedPassModal.passNumber}</div>
            </div>

            <div style={{ padding: '1.75rem 1.5rem' }}>
              {/* 6-Digit Code Highlight */}
              <div style={{ background: '#f0fdf4', border: '2px dashed #16a34a', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  6-Digit Gate Entry Verification Code
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '6px', color: '#166534', margin: '4px 0', fontFamily: 'monospace' }}>
                  {selectedPassModal.verificationCode || '842109'}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(selectedPassModal.verificationCode)}
                  style={{
                    background: copiedCode ? '#16a34a' : '#ffffff',
                    color: copiedCode ? '#ffffff' : '#15803d',
                    border: '1px solid #16a34a',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px',
                  }}
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCode ? 'Copied!' : 'Copy Code for Guest'}
                </button>
              </div>

              {/* QR Code */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <div style={{ padding: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <QrSvgRenderer
                    value={`ACVR.${selectedPassModal.verificationCode}.${selectedPassModal.passNumber}.${selectedPassModal.rollNumber}`}
                    size={160}
                  />
                </div>
              </div>

              {/* Visit Details Table */}
              <div style={{ textAlign: 'left', background: '#f8fafc', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Host Student:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedPassModal.studentName} ({selectedPassModal.rollNumber})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Expected Date:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedPassModal.expectedVisitDate || 'Today'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Time Window:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedPassModal.expectedArrivalTime || '10:00 AM'} – {selectedPassModal.expectedDepartureTime || '05:00 PM'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Status:</span>
                  <strong style={{ color: selectedPassModal.status === 'Checked In' ? '#16a34a' : '#d97706' }}>
                    {selectedPassModal.status}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPassModal(null)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

