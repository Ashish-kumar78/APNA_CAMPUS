import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Download,
  Eye,
  Edit3,
  RotateCcw,
  RefreshCw,
  Award,
  Briefcase,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import BonafideApplyModal from '../components/Bonafide/BonafideApplyModal';
import BonafideDetailsModal from '../components/Bonafide/BonafideDetailsModal';
import './BonafidePage.css';

export default function BonafidePage({ account }) {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editApplication, setEditApplication] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes] = await Promise.allSettled([
        api.getBonafideStats(),
        api.getMyBonafideApplications(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }

      if (appsRes.status === 'fulfilled' && appsRes.value && appsRes.value.applications) {
        setApplications(appsRes.value.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.warn('Error fetching bonafide data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter application list
  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    const appNum = (app.applicationNumber || '').toLowerCase();
    const purpose = (app.purpose || '').toLowerCase();
    const d = app.formData || {};
    const company = (d.companyName || '').toLowerCase();
    const event = (d.eventName || '').toLowerCase();
    const bank = (d.bankName || '').toLowerCase();

    const matchesSearch =
      !q ||
      appNum.includes(q) ||
      purpose.includes(q) ||
      company.includes(q) ||
      event.includes(q) ||
      bank.includes(q);

    const matchesPurpose = purposeFilter === 'ALL' || app.purpose === purposeFilter;
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesYear = yearFilter === 'ALL' || (app.formData?.academicYear === yearFilter);

    return matchesSearch && matchesPurpose && matchesStatus && matchesYear;
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenDetails = (app) => {
    setSelectedApplication(app);
    setDetailsModalOpen(true);
  };

  const handleEditResubmit = (app) => {
    setEditApplication(app);
    setApplyModalOpen(true);
  };

  const handleDownload = async (app) => {
    try {
      await api.downloadBonafideCertificatePdf(app.id, `Bonafide_${app.applicationNumber}.pdf`);
    } catch (err) {
      alert(err.message || 'Error downloading certificate');
    }
  };

  const getPurposeDetails = (purpose) => {
    switch (purpose) {
      case 'INTERNSHIP':
        return { label: 'Internship Bonafide', icon: Briefcase, color: '#2563eb', bg: '#eff6ff' };
      case 'SCHOLARSHIP_HOSTELLER':
        return { label: 'Scholarship Hosteller', icon: Award, color: '#059669', bg: '#ecfdf5' };
      case 'STUDY_LOAN':
        return { label: 'Study Loan & Fee', icon: DollarSign, color: '#d97706', bg: '#fffbeb' };
      case 'EXTERNAL_EVENT':
        return { label: 'External Event', icon: Users, color: '#7c3aed', bg: '#f5f3ff' };
      default:
        return { label: purpose, icon: FileCheck, color: '#475569', bg: '#f1f5f9' };
    }
  };

  return (
    <div className="bonafide-page-root">
      {/* Page Header */}
      <div className="bonafide-page-header">
        <div className="bonafide-page-header-text">
          <div className="bonafide-page-badge">
            <Sparkles size={13} />
            <span>Official Student Services</span>
          </div>
          <h1 className="bonafide-page-title">Bonafide Certificate</h1>
          <p className="bonafide-page-desc">
            Request official, digitally signed institutional certificates for internships, post-matric scholarship hostel declarations, education loans with verified 4-year fee schedules, and external event authorizations.
          </p>
        </div>

        <div className="bonafide-page-header-actions">
          <button
            className="bonafide-apply-primary-btn"
            onClick={() => {
              setEditApplication(null);
              setApplyModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Apply for Bonafide</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="bonafide-kpi-grid">
        <div className="bonafide-dash-kpi-card kpi-total">
          <div className="kpi-icon-container">
            <FileText size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-heading">Total Applications</span>
            <strong className="kpi-number">{stats.total}</strong>
            <small className="kpi-subtext">All submitted & draft records</small>
          </div>
        </div>

        <div className="bonafide-dash-kpi-card kpi-pending">
          <div className="kpi-icon-container">
            <Clock size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-heading">Pending Applications</span>
            <strong className="kpi-number">{stats.pending}</strong>
            <small className="kpi-subtext">Under departmental review</small>
          </div>
        </div>

        <div className="bonafide-dash-kpi-card kpi-approved">
          <div className="kpi-icon-container">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-heading">Approved Applications</span>
            <strong className="kpi-number">{stats.approved}</strong>
            <small className="kpi-subtext">Issued & ready to download</small>
          </div>
        </div>

        <div className="bonafide-dash-kpi-card kpi-rejected">
          <div className="kpi-icon-container">
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-heading">Action Required / Rejected</span>
            <strong className="kpi-number">{stats.rejected}</strong>
            <small className="kpi-subtext">Corrections or declined</small>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bonafide-controls-bar">
        <div className="bonafide-search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Application Number, Purpose, Company, Bank, or Event..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="bonafide-filters-wrap">
          <div className="bonafide-select-filter">
            <select
              value={purposeFilter}
              onChange={(e) => {
                setPurposeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Purposes</option>
              <option value="INTERNSHIP">Internship Bonafide</option>
              <option value="SCHOLARSHIP_HOSTELLER">Scholarship Hosteller</option>
              <option value="STUDY_LOAN">Education / Study Loan</option>
              <option value="EXTERNAL_EVENT">External Event</option>
            </select>
          </div>

          <div className="bonafide-select-filter">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="bonafide-select-filter">
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Academic Years</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>

          <button className="bonafide-refresh-icon-btn" onClick={fetchData} title="Refresh records">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Applications Table / Empty State */}
      <div className="bonafide-table-card">
        {loading ? (
          <div className="bonafide-loading-state">
            <RefreshCw size={32} className="animate-spin text-blue-600" />
            <p>Retrieving your bonafide certificate records...</p>
          </div>
        ) : applications.length === 0 ? (
          /* High-Value Empty State when student has no applications */
          <div className="bonafide-empty-state">
            <div className="bonafide-empty-icon-wrap">
              <FileCheck size={44} color="#2563eb" />
            </div>
            <h3 className="bonafide-empty-title">No Bonafide Applications Yet</h3>
            <p className="bonafide-empty-desc">
              You haven't requested any bonafide certificates yet. You can apply for verified internship certificates, scholarship hosteller declarations, education loan fee structures, or hackathon authorization letters.
            </p>
            <div className="bonafide-empty-purposes-quick">
              <div className="empty-quick-item" onClick={() => { setEditApplication(null); setApplyModalOpen(true); }}>
                <Briefcase size={16} color="#2563eb" />
                <span>Internship Bonafide</span>
              </div>
              <div className="empty-quick-item" onClick={() => { setEditApplication(null); setApplyModalOpen(true); }}>
                <Award size={16} color="#059669" />
                <span>Hostel Scholarship Declaration</span>
              </div>
              <div className="empty-quick-item" onClick={() => { setEditApplication(null); setApplyModalOpen(true); }}>
                <DollarSign size={16} color="#d97706" />
                <span>4-Year Course Fee Certificate</span>
              </div>
              <div className="empty-quick-item" onClick={() => { setEditApplication(null); setApplyModalOpen(true); }}>
                <Users size={16} color="#7c3aed" />
                <span>Hackathon Authorization</span>
              </div>
            </div>
            <button
              className="bonafide-apply-primary-btn"
              style={{ marginTop: '20px' }}
              onClick={() => {
                setEditApplication(null);
                setApplyModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>Apply for Bonafide</span>
            </button>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bonafide-no-results">
            <p>No applications match your selected search or filter criteria.</p>
            <button
              className="bonafide-reset-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setPurposeFilter('ALL');
                setStatusFilter('ALL');
                setYearFilter('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="bonafide-table-responsive">
              <table className="bonafide-main-table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Certificate Purpose</th>
                    <th>Student Name</th>
                    <th>Roll / Reg No</th>
                    <th>Application Date</th>
                    <th>Current Approval Stage</th>
                    <th>Overall Status</th>
                    <th>Last Updated</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApps.map((app) => {
                    const purposeInfo = getPurposeDetails(app.purpose);
                    const Icon = purposeInfo.icon;
                    const canEdit = ['REJECTED', 'CHANGES_REQUESTED', 'DRAFT'].includes(app.status);
                    const isIssued = app.status === 'CERTIFICATE_ISSUED';
                    const canWithdraw = ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status);

                    return (
                      <tr key={app.id}>
                        <td>
                          <span className="bonafide-table-id">#{app.applicationNumber}</span>
                        </td>
                        <td>
                          <div className="bonafide-purpose-cell">
                            <div className="purpose-pill" style={{ color: purposeInfo.color, background: purposeInfo.bg }}>
                              <Icon size={13} />
                              <span>{purposeInfo.label}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="bonafide-student-name">
                            {app.student?.name || app.formData?.studentName || account?.name || 'Rakesh Das'}
                          </span>
                        </td>
                        <td>
                          <span className="bonafide-roll-number">
                            {app.student?.registrationNumber || app.formData?.registrationNumber || account?.registrationNumber || '2305201001'}
                          </span>
                        </td>
                        <td>
                          <span className="bonafide-date">
                            {new Date(app.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </td>
                        <td>
                          <span className="bonafide-stage-cell">
                            {app.currentStage.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`bonafide-status-pill status-${app.status.toLowerCase()}`}>
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span className="bonafide-date">
                            {new Date(app.updatedAt || app.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </td>
                        <td>
                          <div className="bonafide-actions-cell">
                            <button
                              className="bonafide-action-btn view-btn"
                              onClick={() => handleOpenDetails(app)}
                              title="View Details & Track Stepper"
                            >
                              <Eye size={14} />
                              <span>Details</span>
                            </button>

                            {canEdit && (
                              <button
                                className="bonafide-action-btn edit-btn"
                                onClick={() => handleEditResubmit(app)}
                                title="Edit & Resubmit"
                              >
                                <Edit3 size={14} />
                                <span>Edit</span>
                              </button>
                            )}

                            {isIssued && (
                              <button
                                className="bonafide-action-btn download-btn"
                                onClick={() => handleDownload(app)}
                                title="Download Official Certificate"
                              >
                                <Download size={14} />
                                <span>Download</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bonafide-pagination">
                <span className="pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} applications
                </span>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="pagination-page">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Apply / Edit Modal */}
      {applyModalOpen && (
        <BonafideApplyModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          account={account}
          editApplication={editApplication}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}

      {/* Details & Tracking Stepper Modal */}
      {detailsModalOpen && selectedApplication && (
        <BonafideDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          application={selectedApplication}
          onEditResubmit={(app) => {
            setEditApplication(app);
            setApplyModalOpen(true);
          }}
          onWithdrawSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
