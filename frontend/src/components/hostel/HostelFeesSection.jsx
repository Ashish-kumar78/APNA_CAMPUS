import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer,
  DollarSign,
  Download,
  Eye,
  X,
  Building2,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { mockHostelFeesList } from './hostelData.js';
import { feesApi } from '../../services/feesApi.js';
import './HostelExtraSections.css';

export default function HostelFeesSection({ account }) {
  const [fees, setFees] = useState(mockHostelFeesList);
  const [hostelBreakdown, setHostelBreakdown] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hostelFilter, setHostelFilter] = useState('ALL');
  const [selectedReceiptModal, setSelectedReceiptModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch live institution-wide hostel fees from NestJS backend
  const fetchHostelFees = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await feesApi.getHostelFeeOverview({
        search: searchQuery,
        hostel: hostelFilter !== 'ALL' ? hostelFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });

      if (res && res.success && Array.isArray(res.records)) {
        // Map backend records to table model
        const mapped = res.records.map((r, i) => ({
          id: r.id || `HST-REC-${i + 1}`,
          receiptNo: r.receiptNo || `HST-2026-${9000 + i}`,
          studentName: r.name,
          rollNumber: r.rollNumber,
          hostelName: r.hostelName,
          roomNumber: r.roomNumber,
          bedNumber: r.bedNumber || 'B1',
          category: r.feePlan || 'Hostel Accommodation & Mess Plan',
          amount: r.totalBilled || 68000,
          paidAmount: r.totalPaid || 0,
          dues: r.outstandingBalance !== undefined ? r.outstandingBalance : Math.max(0, (r.totalBilled || 68000) - (r.totalPaid || 0)),
          status: r.paymentStatus === 'Cleared' ? 'Paid' : (r.paymentStatus === 'Partial Due' ? 'Partial Due' : 'Overdue'),
          dueDate: r.dueDate || '15 Nov 2026',
          lastPaymentDate: r.lastPaymentDate || 'Pending',
          academicYear: r.academicYear || '2026-27',
          installments: r.installments || []
        }));
        setFees(mapped);
        if (Array.isArray(res.hostelBreakdown)) {
          setHostelBreakdown(res.hostelBreakdown);
        }
      } else {
        setFees(mockHostelFeesList);
      }
    } catch (err) {
      console.warn('Backend hostel fees fallback to local store:', err);
      setFees(mockHostelFeesList);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, hostelFilter, statusFilter]);

  useEffect(() => {
    fetchHostelFees();
  }, [fetchHostelFees]);

  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
      const matchHostel = hostelFilter === 'ALL' || f.hostelName.toLowerCase().includes(hostelFilter.toLowerCase());
      const matchSearch = !searchQuery ||
        f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.hostelName && f.hostelName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchHostel && matchSearch;
    });
  }, [fees, statusFilter, hostelFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalExpected = fees.reduce((acc, f) => acc + (f.amount || 0), 0);
    const totalCollected = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const totalDues = fees.reduce((acc, f) => acc + (f.dues || 0), 0);
    const defaulters = fees.filter(f => f.dues > 0).length;
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
    return { totalExpected, totalCollected, totalDues, defaulters, collectionRate };
  }, [fees]);

  // CSV Export
  const handleExportCsv = () => {
    if (!filteredFees.length) return;
    const headers = ['Receipt No', 'Student Name', 'Roll Number', 'Hostel Block', 'Room', 'Fee Category', 'Assessed Amount', 'Paid Amount', 'Outstanding Dues', 'Status', 'Due Date'];
    const rows = filteredFees.map(f => [
      f.receiptNo,
      `"${f.studentName}"`,
      f.rollNumber,
      `"${f.hostelName}"`,
      f.roomNumber,
      `"${f.category}"`,
      f.amount,
      f.paidAmount,
      f.dues,
      f.status,
      f.dueDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="hostel-section-container">
      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><CreditCard size={24} color="#2563eb" /> Institution-Wide Hostel Fees &amp; Accounts Ledger</h2>
          <p>Super Admin &amp; Admin Directorate · Live Residential Dues · Mess Charges · Payment Reconciliations</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={fetchHostelFees} disabled={isRefreshing}>
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> {isRefreshing ? 'Reconciling...' : 'Reconcile DB'}
          </button>
          <button className="h-btn h-btn-secondary" onClick={handleExportCsv}>
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button className="h-btn h-btn-primary" onClick={() => window.print()}>
            <Printer size={14} /> Print Ledger Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><CreditCard size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">₹{stats.totalExpected.toLocaleString('en-IN')}</span>
            <span className="hostel-kpi-title">Total Assessed Fees</span>
            <span className="hostel-kpi-subtitle">Billed Residential Cohort</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>₹{stats.totalCollected.toLocaleString('en-IN')}</span>
            <span className="hostel-kpi-title">Fees Collected ({stats.collectionRate}%)</span>
            <span className="hostel-kpi-subtitle">Accounts Verified</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon rose"><AlertTriangle size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#e11d48' }}>₹{stats.totalDues.toLocaleString('en-IN')}</span>
            <span className="hostel-kpi-title">Outstanding Dues</span>
            <span className="hostel-kpi-subtitle">Unpaid balance remaining</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Receipt size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>{stats.defaulters}</span>
            <span className="hostel-kpi-title">Defaulter Inmates</span>
            <span className="hostel-kpi-subtitle">Pending fee clearance</span>
          </div>
        </div>
      </div>

      {/* Hostel-Wise Breakdown Mini-Bar Cards */}
      {hostelBreakdown.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {hostelBreakdown.map((hb, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                  <Building2 size={16} color="#4f46e5" />
                  {hb.name}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5' }}>
                  {hb.collectionRate}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b' }}>
                <span>Collected: <strong>₹{(hb.collected || 0).toLocaleString('en-IN')}</strong></span>
                <span>Dues: <strong style={{ color: hb.dues > 0 ? '#e11d48' : '#059669' }}>₹{(hb.dues || 0).toLocaleString('en-IN')}</strong></span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${hb.collectionRate || 0}%`,
                    height: '100%',
                    background: (hb.collectionRate || 0) >= 80 ? '#10b981' : ((hb.collectionRate || 0) >= 50 ? '#f59e0b' : '#ef4444'),
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                <span>{hb.residents} Residents</span>
                <span style={{ color: hb.defaulters > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{hb.defaulters} Defaulters</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-filter-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search resident name, registration number, or room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Hostel Filter Dropdown */}
          <select
            value={hostelFilter}
            onChange={e => setHostelFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#334155',
              background: '#ffffff'
            }}
          >
            <option value="ALL">All Residential Complexes</option>
            <option value="Kalam">Kalam Boys Residence</option>
            <option value="Sarojini">Sarojini Naidu Girls Residence</option>
            <option value="Gandhi">Gandhi Boys Residence</option>
          </select>

          <div className="hostel-tab-pills">
            {['ALL', 'Paid', 'Partial Due', 'Overdue'].map(st => (
              <button
                key={st}
                className={`hostel-tab-pill ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? 'All Transactions' : st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filteredFees.length} live records
        </div>
      </div>

      {/* Table */}
      <div className="hostel-table-container">
        <div className="hostel-table-scroll">
          <table className="hostel-data-table">
            <thead>
              <tr>
                <th>Receipt / Ledger ID</th>
                <th>Student / Registration</th>
                <th>Hostel &amp; Room</th>
                <th>Fee Plan &amp; Schedule</th>
                <th>Assessed Amount</th>
                <th>Paid Amount</th>
                <th>Outstanding Dues</th>
                <th>Payment Status</th>
                <th style={{ textAlign: 'center' }}>Receipt Slip</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map(fee => (
                <tr key={fee.id}>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>
                    {fee.receiptNo !== '--' ? fee.receiptNo : fee.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{fee.studentName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {fee.rollNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{fee.hostelName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#475569' }}>Room {fee.roomNumber} (Bed {fee.bedNumber})</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{fee.category}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Due: {fee.dueDate} · Last Paid: {fee.lastPaymentDate}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{(fee.amount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>₹{(fee.paidAmount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: fee.dues > 0 ? '#e11d48' : '#059669' }}>
                    ₹{(fee.dues || 0).toLocaleString('en-IN')}
                  </td>
                  <td>
                    {fee.status === 'Paid' && <span className="h-badge h-badge-paid">✓ Paid &amp; Clear</span>}
                    {fee.status === 'Partial Due' && <span className="h-badge h-badge-late">Partial Paid</span>}
                    {fee.status === 'Overdue' && <span className="h-badge h-badge-overdue">Defaulter / Overdue</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="h-btn h-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                      onClick={() => setSelectedReceiptModal(fee)}
                    >
                      <Eye size={13} /> View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VIEW RECEIPT SLIP */}
      {selectedReceiptModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedReceiptModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Hostel Fee Clearance Slip</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Reference #{selectedReceiptModal.receiptNo} · Institutional Directorate of Accounts
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedReceiptModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div><strong>Resident Name:</strong> {selectedReceiptModal.studentName}</div>
                <div><strong>Registration No:</strong> {selectedReceiptModal.rollNumber}</div>
                <div><strong>Hostel Block:</strong> {selectedReceiptModal.hostelName}</div>
                <div><strong>Room &amp; Bed:</strong> {selectedReceiptModal.roomNumber} ({selectedReceiptModal.bedNumber})</div>
                <div><strong>Fee Plan:</strong> {selectedReceiptModal.category}</div>
                <div><strong>Due Date:</strong> {selectedReceiptModal.dueDate}</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem' }}>
                  <span>Total Amount Assessed:</span>
                  <strong>₹{(selectedReceiptModal.amount || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem', color: '#059669' }}>
                  <span>Amount Credited &amp; Verified:</span>
                  <strong>₹{(selectedReceiptModal.paidAmount || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: '0.92rem', color: selectedReceiptModal.dues > 0 ? '#e11d48' : '#059669', fontWeight: 800 }}>
                  <span>Outstanding Balance:</span>
                  <span>₹{(selectedReceiptModal.dues || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {selectedReceiptModal.installments && selectedReceiptModal.installments.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Installment Milestones</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedReceiptModal.installments.map((inst, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 8px', background: '#f8fafc', borderRadius: '6px' }}>
                        <span>Installment #{inst.installmentNo} (₹{inst.amount.toLocaleString('en-IN')})</span>
                        <span style={{ fontWeight: 600, color: inst.status === 'Paid' ? '#16a34a' : '#d97706' }}>{inst.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>
                Computer generated fee clearance slip. Verified by Central Accounts &amp; Residential Directorate.
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="h-btn h-btn-primary" onClick={() => window.print()}>
                <Printer size={14} /> Print Receipt Slip
              </button>
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedReceiptModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
