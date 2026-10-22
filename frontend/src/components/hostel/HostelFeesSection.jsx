import React, { useState, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { mockHostelFeesList } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelFeesSection() {
  const [fees, setFees] = useState(mockHostelFeesList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReceiptModal, setSelectedReceiptModal] = useState(null);

  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
      const matchSearch = !searchQuery ||
        f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [fees, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalExpected = fees.reduce((acc, f) => acc + f.amount, 0);
    const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalDues = fees.reduce((acc, f) => acc + f.dues, 0);
    const defaulters = fees.filter(f => f.dues > 0).length;
    return { totalExpected, totalCollected, totalDues, defaulters };
  }, [fees]);

  return (
    <div className="hostel-section-container">
      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><CreditCard size={24} color="#2563eb" /> Hostel Fees, Mess Dues &amp; Accounts Ledger</h2>
          <p>Institutional Accommodation Rent · Term Mess Advance · Caution Deposits · Accounts Verification</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            <Printer size={14} /> Export Dues Report
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
            <span className="hostel-kpi-subtitle">Current Term Dues</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>₹{stats.totalCollected.toLocaleString('en-IN')}</span>
            <span className="hostel-kpi-title">Fees Collected</span>
            <span className="hostel-kpi-subtitle">Accounts Verified</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon rose"><AlertTriangle size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#e11d48' }}>₹{stats.totalDues.toLocaleString('en-IN')}</span>
            <span className="hostel-kpi-title">Outstanding Dues</span>
            <span className="hostel-kpi-subtitle">Unpaid balance</span>
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

      {/* Filter Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-filter-group">
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search resident name, registration number, or receipt..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

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
          Showing {filteredFees.length} ledger records
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
                <th>Fee Category</th>
                <th>Assessed Amount</th>
                <th>Paid Amount</th>
                <th>Dues</th>
                <th>Status</th>
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
                    <div style={{ fontSize: '0.74rem', color: '#475569' }}>Room {fee.roomNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{fee.category}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Due: {fee.dueDate}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{fee.amount.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>₹{fee.paidAmount.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: fee.dues > 0 ? '#e11d48' : '#059669' }}>
                    ₹{fee.dues.toLocaleString('en-IN')}
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
                  Reference #{selectedReceiptModal.receiptNo} · BPUT Finance &amp; Accounts Division
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
                <div><strong>Room Number:</strong> {selectedReceiptModal.roomNumber}</div>
                <div><strong>Fee Head:</strong> {selectedReceiptModal.category}</div>
                <div><strong>Due Date:</strong> {selectedReceiptModal.dueDate}</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem' }}>
                  <span>Total Amount Assessed:</span>
                  <strong>₹{selectedReceiptModal.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem', color: '#059669' }}>
                  <span>Amount Credited &amp; Verified:</span>
                  <strong>₹{selectedReceiptModal.paidAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: '0.92rem', color: selectedReceiptModal.dues > 0 ? '#e11d48' : '#059669', fontWeight: 800 }}>
                  <span>Outstanding Balance:</span>
                  <span>₹{selectedReceiptModal.dues.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                Computer generated fee clearance slip. Accounts verified by BPUT Central Accounts Desk.
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
