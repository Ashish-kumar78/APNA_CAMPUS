import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  ShieldCheck,
  Eye,
  RotateCcw,
  Ban,
  Calendar,
  Building,
  GraduationCap,
  FileCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  AlertCircle,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import ApnaCampusSymbol from '../Branding/ApnaCampusSymbol';
import ApnaCampusLogo from '../Branding/ApnaCampusLogo';
import './InternshipCellManagement.css';

export default function InternshipCellManagement({ account }) {
  // ── States ──
  const [stats, setStats] = useState({
    totalEligibleStudents: 0,
    totalApplications: 0,
    activeInternships: 0,
    cardsIssued: 0,
    cardsPending: 0,
    cardsExpired: 0,
    cardsRevoked: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Student Search & Profile
  const [searchRegInput, setSearchRegInput] = useState('2401432265');
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [issuingCard, setIssuingCard] = useState(false);

  // ID Cards Table
  const [cardRecords, setCardRecords] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'view' | 'reissue' | 'renew' | 'revoke'
  const [selectedCard, setSelectedCard] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionExpiry, setActionExpiry] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Feedback Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4500);
  };

  // ── 1. Fetch Live Stats ──
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.getInternshipStats();
      if (res?.success && res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Could not load internship stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── 2. Fetch ID Card Records ──
  const fetchCardRecords = useCallback(async () => {
    setLoadingCards(true);
    try {
      const params = {
        page,
        limit,
        search: tableSearch,
        status: statusFilter,
        department: deptFilter,
      };
      const res = await api.getInternshipIdCards(params);
      if (res?.success) {
        setCardRecords(res.records || []);
        setTotalCards(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.warn('Could not load card records:', err.message);
    } finally {
      setLoadingCards(false);
    }
  }, [page, limit, tableSearch, statusFilter, deptFilter]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchCardRecords();
  }, [fetchStats, fetchCardRecords]);

  // ── 3. Search Student by Registration Number ──
  const handleSearchStudent = async (regToSearch) => {
    const query = (regToSearch || searchRegInput || '').trim();
    if (!query) {
      setSearchError('Please enter a valid Registration Number or Student ID.');
      return;
    }

    setSearchingStudent(true);
    setSearchError('');
    setSelectedStudent(null);
    setPreviewData(null);

    try {
      const res = await api.getInternshipStudent(query);
      if (res?.success && res?.data) {
        setSelectedStudent(res.data);
        // Automatically request validated preview
        const prevRes = await api.previewInternshipIdCard({
          studentIdentifier: query,
          company: res.data.company,
          academicSession: res.data.academicSession,
        });
        if (prevRes?.success) {
          setPreviewData(prevRes.data);
        }
      } else {
        setSearchError('Student record not found. Please verify the registration number.');
      }
    } catch (err) {
      setSearchError(err.message || 'Student record not found. Please verify the registration number.');
    } finally {
      setSearchingStudent(false);
    }
  };

  // Run search for default student on mount
  useEffect(() => {
    handleSearchStudent('2401432265');
  }, []);

  // ── 4. Issue ID Card ──
  const handleIssueCard = async () => {
    if (!selectedStudent) return;
    setIssuingCard(true);
    try {
      const res = await api.issueInternshipIdCard({
        studentIdentifier: selectedStudent.registrationNo || selectedStudent.rollNumber,
        company: selectedStudent.company || 'Central Tool Room and Training Center',
        academicSession: selectedStudent.academicSession || '2026-2027 (SIP)',
      });

      if (res?.success) {
        triggerToast(`ID Card ${res.card?.cardNumber} successfully issued for ${selectedStudent.name}!`);
        // Refresh profile & tables
        await handleSearchStudent(selectedStudent.registrationNo);
        fetchStats();
        fetchCardRecords();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to issue ID card.', 'error');
    } finally {
      setIssuingCard(false);
    }
  };

  // ── 5. Download Card PDF ──
  const handleDownloadPdf = async (card) => {
    if (!card?.id) return;
    try {
      triggerToast(`Preparing official PDF for ${card.studentName}...`, 'info');
      await api.downloadInternshipIdCardPdf(
        card.id,
        `Internship_ID_Card_${card.registrationNo || card.cardNumber}.pdf`
      );
      triggerToast(`PDF downloaded for Card #${card.cardNumber}!`);
    } catch (err) {
      triggerToast(err.message || 'Failed to download ID card PDF.', 'error');
    }
  };

  // ── 6. Card Status Transitions (Reissue, Renew, Revoke) ──
  const handleCardActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;

    setSubmittingAction(true);
    try {
      if (activeModal === 'reissue') {
        if (!actionReason.trim()) {
          triggerToast('Please provide a reason for reissuing the card.', 'error');
          setSubmittingAction(false);
          return;
        }
        await api.reissueInternshipIdCard(selectedCard.id, {
          reason: actionReason,
          expiryDate: actionExpiry || undefined,
        });
        triggerToast(`ID Card reissued successfully!`);
      } else if (activeModal === 'renew') {
        if (!actionExpiry) {
          triggerToast('Please specify a new card expiry date.', 'error');
          setSubmittingAction(false);
          return;
        }
        await api.renewInternshipIdCard(selectedCard.id, {
          expiryDate: actionExpiry,
          reason: actionReason,
        });
        triggerToast(`Card renewed successfully until ${actionExpiry}!`);
      } else if (activeModal === 'revoke') {
        if (!actionReason.trim()) {
          triggerToast('Please provide a justification for revocation.', 'error');
          setSubmittingAction(false);
          return;
        }
        await api.revokeInternshipIdCard(selectedCard.id, { reason: actionReason });
        triggerToast(`Card #${selectedCard.cardNumber} revoked.`, 'error');
      }

      // Close modal & refresh
      setActiveModal(null);
      setSelectedCard(null);
      setActionReason('');
      setActionExpiry('');
      fetchStats();
      fetchCardRecords();
      if (selectedStudent) {
        handleSearchStudent(selectedStudent.registrationNo);
      }
    } catch (err) {
      triggerToast(err.message || 'Operation failed.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="icm-wrapper">
      {/* ── Toast Feedback Notification ── */}
      {toast.show && (
        <div className={`icm-toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Top Header Bar with Apna Campus Branding ── */}
      <header className="icm-top-header">
        <div className="icm-header-brand">
          <ApnaCampusSymbol size={42} />
          <div>
            <div className="icm-brand-badge">DIRECTORATE OF TRAINING &amp; PLACEMENT</div>
            <h1 className="icm-main-title">Internship Cell &amp; ID Card Generation</h1>
            <p className="icm-sub-title">
              Automated Student Identity Issuance, Database Verification &amp; Cryptographic QR Authentication
            </p>
          </div>
        </div>
        <div className="icm-header-actions">
          <button
            type="button"
            className="icm-btn-refresh"
            onClick={() => {
              fetchStats();
              fetchCardRecords();
              if (selectedStudent) handleSearchStudent(selectedStudent.registrationNo);
            }}
            disabled={loadingStats || loadingCards}
          >
            <RefreshCw size={14} className={loadingStats ? 'spin' : ''} />
            <span>Sync Data</span>
          </button>
        </div>
      </header>

      {/* ── PART C: DASHBOARD SUMMARY CARDS ── */}
      <section className="icm-stats-grid" aria-label="Internship Dashboard Metrics">
        <div className="icm-stat-card card-blue">
          <div className="icm-stat-icon-wrap">
            <Users size={22} />
          </div>
          <div className="icm-stat-info">
            <span className="icm-stat-label">Total Eligible Students</span>
            <strong className="icm-stat-val">{stats.totalEligibleStudents}</strong>
            <span className="icm-stat-sub">Active Enrolled Candidates</span>
          </div>
        </div>

        <div className="icm-stat-card card-purple">
          <div className="icm-stat-icon-wrap">
            <Briefcase size={22} />
          </div>
          <div className="icm-stat-info">
            <span className="icm-stat-label">Internship Applications</span>
            <strong className="icm-stat-val">{stats.totalApplications}</strong>
            <span className="icm-stat-sub">Across All Tracks</span>
          </div>
        </div>

        <div className="icm-stat-card card-green">
          <div className="icm-stat-icon-wrap">
            <CheckCircle2 size={22} />
          </div>
          <div className="icm-stat-info">
            <span className="icm-stat-label">Active Internships</span>
            <strong className="icm-stat-val">{stats.activeInternships}</strong>
            <span className="icm-stat-sub">Currently Onboarding/SIP</span>
          </div>
        </div>

        <div className="icm-stat-card card-teal">
          <div className="icm-stat-icon-wrap">
            <ShieldCheck size={22} />
          </div>
          <div className="icm-stat-info">
            <span className="icm-stat-label">ID Cards Issued</span>
            <strong className="icm-stat-val">{stats.cardsIssued}</strong>
            <span className="icm-stat-sub">Authenticated &amp; Live</span>
          </div>
        </div>

        <div className="icm-stat-card card-amber">
          <div className="icm-stat-icon-wrap">
            <Clock size={22} />
          </div>
          <div className="icm-stat-info">
            <span className="icm-stat-label">ID Cards Pending</span>
            <strong className="icm-stat-val">{stats.cardsPending}</strong>
            <span className="icm-stat-sub">Awaiting Card Issuance</span>
          </div>
        </div>

        <div className="icm-stat-card card-rose">
          <div className="icm-stat-icon-wrap">
            <AlertTriangle size={22} />
          </div>
          <div className="icm-stat-info">
            <span className="icm-stat-label">Expired / Revoked</span>
            <strong className="icm-stat-val">{stats.cardsExpired + stats.cardsRevoked}</strong>
            <span className="icm-stat-sub">{stats.cardsRevoked} Revoked · {stats.cardsExpired} Expired</span>
          </div>
        </div>
      </section>

      {/* ── PART E & F: STUDENT SEARCH AND AUTOMATIC ID CARD GENERATION ── */}
      <section className="icm-generation-panel">
        <div className="icm-section-header">
          <div className="icm-section-title-wrap">
            <Search size={18} color="#2563eb" />
            <div>
              <h3>Student Search &amp; Automatic ID Card Generation</h3>
              <p>Enter a Registration Number to fetch verified database details and generate official ID cards.</p>
            </div>
          </div>
        </div>

        {/* Search Bar & Preset Pills */}
        <div className="icm-search-form-row">
          <div className="icm-input-with-icon">
            <Search size={16} className="icm-search-icon" />
            <input
              type="text"
              placeholder="Enter Registration No. (e.g. 2401432265, 2305201001, 01)..."
              value={searchRegInput}
              onChange={(e) => setSearchRegInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
              className="icm-search-input"
            />
            {searchRegInput && (
              <button
                type="button"
                className="icm-btn-clear"
                onClick={() => setSearchRegInput('')}
                aria-label="Clear input"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            className="icm-btn-search"
            onClick={() => handleSearchStudent()}
            disabled={searchingStudent}
          >
            {searchingStudent ? <RefreshCw size={14} className="spin" /> : <Search size={14} />}
            <span>Fetch Student Profile</span>
          </button>
        </div>

        {/* Quick Search Chips */}
        <div className="icm-quick-chips">
          <span className="icm-chips-label">Quick select:</span>
          {['2401432265', '2305201001', '01', '04', '05', '06'].map((roll) => (
            <button
              key={roll}
              type="button"
              className={`icm-chip-btn ${searchRegInput === roll ? 'active' : ''}`}
              onClick={() => {
                setSearchRegInput(roll);
                handleSearchStudent(roll);
              }}
            >
              Reg: {roll}
            </button>
          ))}
        </div>

        {/* Error message */}
        {searchError && (
          <div className="icm-error-banner">
            <AlertCircle size={18} />
            <span>{searchError}</span>
          </div>
        )}

        {/* ── 2-Column Split: Verified Student Bio & ID Card Stage ── */}
        {selectedStudent && (
          <div className="icm-student-stage-grid">
            {/* Left Column: Verified Student Details from Database */}
            <div className="icm-student-bio-card">
              <div className="icm-bio-top-profile">
                <div className="icm-avatar-container">
                  <svg viewBox="0 0 100 100" className="icm-avatar-svg">
                    <rect width="100" height="100" fill="#dbeafe" />
                    <circle cx="50" cy="40" r="22" fill="#3b82f6" />
                    <circle cx="50" cy="38" r="18" fill="#fbd38d" />
                    <path d="M50 54 Q40 64 30 76 Q30 92 70 92 Q70 76 50 54 Z" fill="#1e40af" />
                    <circle cx="50" cy="30" r="12" fill="#1e293b" />
                  </svg>
                </div>
                <div>
                  <h4 className="icm-student-name">{selectedStudent.name}</h4>
                  <div className="icm-pills-cluster">
                    <span className="icm-pill-blue">
                      <GraduationCap size={11} /> {selectedStudent.course}
                    </span>
                    <span className="icm-pill-gray">
                      <Users size={11} /> {selectedStudent.batch}
                    </span>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`icm-status-pill ${selectedStudent.status === 'Active' ? 'active' : 'inactive'}`}>
                      <CheckCircle2 size={11} /> {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio Table */}
              <table className="icm-bio-table">
                <tbody>
                  <tr>
                    <th>Registration No</th>
                    <td><strong>{selectedStudent.registrationNo}</strong></td>
                  </tr>
                  <tr>
                    <th>Student Name</th>
                    <td>{selectedStudent.name}</td>
                  </tr>
                  <tr>
                    <th>Department</th>
                    <td>{selectedStudent.department}</td>
                  </tr>
                  <tr>
                    <th>Academic Session</th>
                    <td>{selectedStudent.academicSession}</td>
                  </tr>
                  <tr>
                    <th>Host Company</th>
                    <td>{selectedStudent.company}</td>
                  </tr>
                  <tr>
                    <th>Mobile</th>
                    <td>{selectedStudent.phone}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{selectedStudent.email}</td>
                  </tr>
                  <tr>
                    <th>Eligibility Status</th>
                    <td>
                      {selectedStudent.isEligible ? (
                        <span className="icm-badge-eligible">
                          <CheckCircle2 size={12} /> Verified Eligible
                        </span>
                      ) : (
                        <span className="icm-badge-ineligible">
                          <AlertTriangle size={12} /> Missing: {selectedStudent.missingFields.join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Card Status Banner */}
              {selectedStudent.hasActiveCard ? (
                <div className="icm-active-card-notice">
                  <ShieldCheck size={18} color="#059669" />
                  <div>
                    <strong>Official ID Card Active</strong>
                    <p>Card #{selectedStudent.activeCard?.cardNumber} was issued on {new Date(selectedStudent.activeCard?.issueDate).toLocaleDateString('en-IN')}.</p>
                  </div>
                </div>
              ) : (
                <div className="icm-pending-card-notice">
                  <Clock size={18} color="#d97706" />
                  <div>
                    <strong>ID Card Not Yet Issued</strong>
                    <p>Student is verified and ready for ID card issuance.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Physical ID Card Template matching User Reference Image */}
            <div className="icm-idcard-preview-stage">
              <div className="icm-stage-top-bar">
                <span className="icm-badge-preview-tag">
                  <Sparkles size={12} /> Dynamic Standardized Template
                </span>
                <div className="icm-stage-actions">
                  {selectedStudent.hasActiveCard ? (
                    <button
                      type="button"
                      className="icm-btn-stage-download"
                      onClick={() => handleDownloadPdf(selectedStudent.activeCard)}
                    >
                      <Download size={14} /> Download Official PDF
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="icm-btn-stage-issue"
                      onClick={handleIssueCard}
                      disabled={issuingCard || !selectedStudent.isEligible}
                    >
                      {issuingCard ? <RefreshCw size={14} className="spin" /> : <ShieldCheck size={14} />}
                      <span>Issue Official ID Card</span>
                    </button>
                  )}
                </div>
              </div>

              {/* The Horizontal Physical ID Card Graphic */}
              <div className="icm-id-card-frame">
                {/* 1. Header (Dark Navy Blue #0f2b48) */}
                <div className="icm-card-header">
                  <div className="icm-card-star-emblem">
                    ★
                  </div>
                  <div className="icm-card-header-title">
                    GIFT | Autonomous, Bhubaneswar
                  </div>
                </div>

                {/* 2. Card Body */}
                <div className="icm-card-body">
                  {/* Photo Container */}
                  <div className="icm-card-photo-box">
                    <svg viewBox="0 0 100 120" className="icm-card-photo-svg">
                      <rect width="100" height="120" fill="#e0f2fe" />
                      <circle cx="50" cy="45" r="24" fill="#1e3a8a" />
                      <circle cx="50" cy="42" r="20" fill="#fbd38d" />
                      <path d="M50 62 Q35 75 22 92 Q22 110 78 110 Q78 75 50 62 Z" fill="#1e40af" />
                    </svg>
                  </div>

                  {/* Student Details Fields */}
                  <div className="icm-card-fields">
                    <div className="icm-field-line">
                      <span className="icm-field-key">Name:</span>
                      <span className="icm-field-val strong">{selectedStudent.name}</span>
                    </div>
                    <div className="icm-field-line">
                      <span className="icm-field-key">Reg. No.:</span>
                      <span className="icm-field-val strong">{selectedStudent.registrationNo}</span>
                    </div>
                    <div className="icm-field-line">
                      <span className="icm-field-key">Session:</span>
                      <span className="icm-field-val">{selectedStudent.academicSession}</span>
                    </div>
                    <div className="icm-field-line">
                      <span className="icm-field-key">Company:</span>
                      <span className="icm-field-val">{selectedStudent.company}</span>
                    </div>
                    <div className="icm-field-line">
                      <span className="icm-field-key">Course:</span>
                      <span className="icm-field-val">{selectedStudent.course}</span>
                    </div>
                    <div className="icm-field-line">
                      <span className="icm-field-key">Batch:</span>
                      <span className="icm-field-val">{selectedStudent.batch}</span>
                    </div>
                    <div className="icm-field-line">
                      <span className="icm-field-key">Mobile:</span>
                      <span className="icm-field-val">{selectedStudent.phone}</span>
                    </div>
                  </div>

                  {/* Cryptographic QR Code Verification Badge */}
                  {previewData?.qrCodeDataUrl && (
                    <div className="icm-card-qr-box" title="Scan to verify official credentials">
                      <img src={previewData.qrCodeDataUrl} alt="QR Verification" className="icm-card-qr-img" />
                      <span className="icm-qr-label">SCAN TO VERIFY</span>
                    </div>
                  )}
                </div>

                {/* 3. Footer (Crimson Red #dc2626) */}
                <div className="icm-card-footer">
                  <div className="icm-card-footer-title">INTERNSHIP ID CARD</div>
                  <div className="icm-card-footer-sub">This card is valid for training/internship purposes only.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── PART K: ID CARD MANAGEMENT TABLE ── */}
      <section className="icm-table-section">
        <div className="icm-table-header-row">
          <div>
            <h3>Issued ID Card Registry</h3>
            <p>Persistent database records of issued, renewed, and revoked internship ID cards.</p>
          </div>
          <div className="icm-table-controls">
            {/* Search */}
            <div className="icm-input-with-icon mini">
              <Search size={14} className="icm-search-icon" />
              <input
                type="text"
                placeholder="Search name, reg, or card #..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="icm-select-filter"
            >
              <option value="ALL">All Statuses</option>
              <option value="ISSUED">Issued / Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="REVOKED">Revoked</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="icm-select-filter"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="EEE">Electrical (EEE)</option>
              <option value="MECH">Mechanical (MECH)</option>
              <option value="CIVIL">Civil (CIVIL)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="icm-table-container">
          {loadingCards ? (
            <div className="icm-table-loading">
              <RefreshCw size={24} className="spin" />
              <span>Loading ID card records from database...</span>
            </div>
          ) : cardRecords.length === 0 ? (
            <div className="icm-table-empty">
              <ShieldCheck size={36} color="#94a3b8" />
              <h4>No ID Cards Found</h4>
              <p>Search an eligible student above and click "Issue Official ID Card" to generate the first persistent record.</p>
            </div>
          ) : (
            <table className="icm-data-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>Sl.</th>
                  <th style={{ width: '50px' }}>Photo</th>
                  <th>Student Name</th>
                  <th>Reg. No.</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>ID Card No.</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cardRecords.map((card, idx) => (
                  <tr key={card.id}>
                    <td>{(page - 1) * limit + idx + 1}</td>
                    <td>
                      <div className="icm-table-avatar">
                        <svg viewBox="0 0 100 100" style={{ width: 28, height: 28, borderRadius: '50%' }}>
                          <circle cx="50" cy="50" r="50" fill="#dbeafe" />
                          <circle cx="50" cy="40" r="20" fill="#2563eb" />
                          <path d="M50 56 Q35 68 25 85 Q25 100 75 100 Q75 68 50 56 Z" fill="#1e40af" />
                        </svg>
                      </div>
                    </td>
                    <td>
                      <strong>{card.studentName}</strong>
                    </td>
                    <td><code>{card.registrationNo}</code></td>
                    <td>{card.department}</td>
                    <td>{card.course}</td>
                    <td>{card.batch}</td>
                    <td>
                      <span className="icm-card-no-tag">{card.cardNumber}</span>
                    </td>
                    <td>{new Date(card.issueDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      {card.expiryDate
                        ? new Date(card.expiryDate).toLocaleDateString('en-IN')
                        : 'Permanent / SIP'}
                    </td>
                    <td>
                      <span className={`icm-badge-status status-${card.status?.toLowerCase()}`}>
                        {card.status}
                      </span>
                    </td>
                    <td>
                      <div className="icm-row-actions">
                        <button
                          type="button"
                          className="icm-btn-action"
                          title="View / Verify Card"
                          onClick={() => {
                            setSelectedCard(card);
                            setActiveModal('view');
                          }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="icm-btn-action download"
                          title="Download PDF"
                          onClick={() => handleDownloadPdf(card)}
                        >
                          <Download size={13} />
                        </button>
                        {card.status !== 'REVOKED' && (
                          <>
                            <button
                              type="button"
                              className="icm-btn-action reissue"
                              title="Reissue Card"
                              onClick={() => {
                                setSelectedCard(card);
                                setActiveModal('reissue');
                                setActionReason('Original card lost or damaged');
                              }}
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button
                              type="button"
                              className="icm-btn-action renew"
                              title="Renew / Extend Card"
                              onClick={() => {
                                setSelectedCard(card);
                                setActiveModal('renew');
                                setActionExpiry('2027-12-31');
                              }}
                            >
                              <Calendar size={13} />
                            </button>
                            <button
                              type="button"
                              className="icm-btn-action revoke"
                              title="Revoke Card"
                              onClick={() => {
                                setSelectedCard(card);
                                setActiveModal('revoke');
                                setActionReason('Internship terminated prematurely');
                              }}
                            >
                              <Ban size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {totalCards > limit && (
          <div className="icm-pagination-bar">
            <span>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCards)} of {totalCards} records
            </span>
            <div className="icm-pagination-buttons">
              <button
                type="button"
                className="icm-btn-page"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="icm-page-indicator">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="icm-btn-page"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── MODALS: VIEW / REISSUE / RENEW / REVOKE ── */}
      {activeModal && selectedCard && (
        <div className="icm-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="icm-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="icm-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#2563eb" />
                <h4>
                  {activeModal === 'view' && `ID Card Details: ${selectedCard.cardNumber}`}
                  {activeModal === 'reissue' && `Reissue ID Card #${selectedCard.cardNumber}`}
                  {activeModal === 'renew' && `Renew ID Card #${selectedCard.cardNumber}`}
                  {activeModal === 'revoke' && `Revoke ID Card #${selectedCard.cardNumber}`}
                </h4>
              </div>
              <button
                type="button"
                className="icm-btn-close-modal"
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="icm-modal-body">
              {activeModal === 'view' && (
                <div className="icm-modal-view-content">
                  <div className="icm-modal-card-display">
                    <div className="icm-id-card-frame mini">
                      <div className="icm-card-header">
                        <div className="icm-card-star-emblem">★</div>
                        <div className="icm-card-header-title">GIFT | Autonomous, Bhubaneswar</div>
                      </div>
                      <div className="icm-card-body">
                        <div className="icm-card-photo-box">
                          <svg viewBox="0 0 100 120" className="icm-card-photo-svg">
                            <rect width="100" height="120" fill="#e0f2fe" />
                            <circle cx="50" cy="45" r="24" fill="#1e3a8a" />
                            <circle cx="50" cy="42" r="20" fill="#fbd38d" />
                            <path d="M50 62 Q35 75 22 92 Q22 110 78 110 Q78 75 50 62 Z" fill="#1e40af" />
                          </svg>
                        </div>
                        <div className="icm-card-fields">
                          <div><strong>Name:</strong> {selectedCard.studentName}</div>
                          <div><strong>Reg. No.:</strong> {selectedCard.registrationNo}</div>
                          <div><strong>Session:</strong> {selectedCard.academicSession}</div>
                          <div><strong>Company:</strong> {selectedCard.company}</div>
                          <div><strong>Course:</strong> {selectedCard.course}</div>
                          <div><strong>Batch:</strong> {selectedCard.batch}</div>
                          <div><strong>Mobile:</strong> {selectedCard.mobile || '7735994528'}</div>
                        </div>
                        {selectedCard.qrCodeDataUrl && (
                          <div className="icm-card-qr-box">
                            <img src={selectedCard.qrCodeDataUrl} alt="QR" className="icm-card-qr-img" />
                          </div>
                        )}
                      </div>
                      <div className="icm-card-footer">
                        <div className="icm-card-footer-title">INTERNSHIP ID CARD</div>
                        <div className="icm-card-footer-sub">This card is valid for training/internship purposes only.</div>
                      </div>
                    </div>
                  </div>

                  <div className="icm-audit-trail-box">
                    <h5>Issuance &amp; Verification Audit Trail</h5>
                    <div className="icm-audit-row">
                      <span>Card Status:</span>
                      <strong className={`icm-badge-status status-${selectedCard.status?.toLowerCase()}`}>
                        {selectedCard.status}
                      </strong>
                    </div>
                    <div className="icm-audit-row">
                      <span>Issued By:</span>
                      <span>{selectedCard.issuedBy}</span>
                    </div>
                    <div className="icm-audit-row">
                      <span>Issue Date:</span>
                      <span>{new Date(selectedCard.issueDate).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="icm-audit-row">
                      <span>Verification Token:</span>
                      <code>{selectedCard.verificationToken}</code>
                    </div>
                    {selectedCard.revocationReason && (
                      <div className="icm-audit-row alert">
                        <span>Revocation Reason:</span>
                        <span>{selectedCard.revocationReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeModal === 'reissue' && (
                <form onSubmit={handleCardActionSubmit} className="icm-modal-form">
                  <p className="icm-modal-instruction">
                    Reissuing this card will create a new distinct card number and QR verification token.
                    The current card will be marked as replaced in the history log.
                  </p>
                  <div className="icm-form-group">
                    <label>Reason for Reissue *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Student reported original card lost / damaged"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                    />
                  </div>
                  <div className="icm-modal-footer">
                    <button type="button" className="icm-btn-cancel" onClick={() => setActiveModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="icm-btn-submit" disabled={submittingAction}>
                      {submittingAction ? 'Processing...' : 'Confirm Reissue'}
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'renew' && (
                <form onSubmit={handleCardActionSubmit} className="icm-modal-form">
                  <p className="icm-modal-instruction">
                    Extend the validity of card #{selectedCard.cardNumber} for student {selectedCard.studentName}.
                  </p>
                  <div className="icm-form-group">
                    <label>New Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={actionExpiry}
                      onChange={(e) => setActionExpiry(e.target.value)}
                    />
                  </div>
                  <div className="icm-form-group">
                    <label>Extension Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Winter / Summer SIP extended by company"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                    />
                  </div>
                  <div className="icm-modal-footer">
                    <button type="button" className="icm-btn-cancel" onClick={() => setActiveModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="icm-btn-submit" disabled={submittingAction}>
                      {submittingAction ? 'Renewing...' : 'Confirm Renewal'}
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'revoke' && (
                <form onSubmit={handleCardActionSubmit} className="icm-modal-form">
                  <div className="icm-revoke-warning">
                    <AlertTriangle size={24} color="#dc2626" />
                    <p>
                      <strong>Are you sure you want to revoke this card?</strong>
                      Once revoked, anyone scanning this card's QR code will receive an immediate invalidation alert.
                    </p>
                  </div>
                  <div className="icm-form-group">
                    <label>Revocation Justification / Reason *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Student completed internship early, failed to meet attendance requirements, or disciplinary grounds"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                    />
                  </div>
                  <div className="icm-modal-footer">
                    <button type="button" className="icm-btn-cancel" onClick={() => setActiveModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="icm-btn-submit danger" disabled={submittingAction}>
                      {submittingAction ? 'Revoking...' : 'Confirm Card Revocation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
