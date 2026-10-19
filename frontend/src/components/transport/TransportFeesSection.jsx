import React, { useState, useMemo } from 'react';
import { 
  CreditCard, DollarSign, CheckCircle2, Clock, AlertTriangle, 
  Search, Filter, Receipt, FileText, X, Check, ArrowUpRight 
} from 'lucide-react';
import { mockTransportFees } from './transportData';
import './TransportExtraSections.css';

export default function TransportFeesSection() {
  const [data, setData] = useState(mockTransportFees);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          item.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.routeName.toLowerCase().includes(search.toLowerCase()) ||
                          item.receiptNo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  // Statistics
  const totalBilled = data.reduce((acc, curr) => acc + curr.feeAmount, 0);
  const totalCollected = data.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPendingDues = data.reduce((acc, curr) => acc + curr.dues, 0);
  const overdueCount = data.filter(d => d.status === 'Overdue').length;

  const handleVerify = (id) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, verified: true, status: 'Paid & Verified' } : item));
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><CreditCard size={24} className="text-sky-600" /> Transport Fees & Dues</h2>
          <p>Semester transit tariff audit, student dues reconciliation, and fee clearance status linked to Accounts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-outline" onClick={() => window.print()}>
            <FileText size={16} /> Export Clearance Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><DollarSign size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{totalBilled.toLocaleString('en-IN')}</span>
            <span className="trans-kpi-title">Total Demand</span>
            <span className="trans-kpi-subtitle">Current semester tariff</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{totalCollected.toLocaleString('en-IN')}</span>
            <span className="trans-kpi-title">Collected Fees</span>
            <span className="trans-kpi-subtitle">{((totalCollected/totalBilled)*100).toFixed(0)}% collection efficiency</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{totalPendingDues.toLocaleString('en-IN')}</span>
            <span className="trans-kpi-title">Pending Balances</span>
            <span className="trans-kpi-subtitle">Partial and overdue dues</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><AlertTriangle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{overdueCount}</span>
            <span className="trans-kpi-title">Overdue Defaulters</span>
            <span className="trans-kpi-subtitle" style={{ color: '#e11d48', fontWeight: 600 }}>Bus pass suspended</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="trans-filter-strip">
        <div className="trans-filter-group">
          <div className="trans-search-input">
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search student, roll number, receipt..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid & Verified">Paid & Verified</option>
            <option value="Partial Paid">Partial Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> student billing records
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Student & Roll No</th>
                <th>Assigned Route</th>
                <th>Semester</th>
                <th>Fee Amount</th>
                <th>Paid Amount</th>
                <th>Outstanding Dues</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Accounts Verified</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No transport fee records match your search filter.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id} style={{ background: item.dues > 0 && item.status === 'Overdue' ? '#fff5f5' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.studentName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{item.rollNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.routeName}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{item.semester}</td>
                    <td style={{ fontWeight: 700 }}>₹{item.feeAmount.toLocaleString('en-IN')}</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>₹{item.paidAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: item.dues > 0 ? '#e11d48' : '#059669' }}>
                        ₹{item.dues.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{item.dueDate}</td>
                    <td>
                      <span className={`trans-badge ${
                        item.status === 'Paid & Verified' ? 'success' :
                        item.status === 'Partial Paid' ? 'warning' : 'danger'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.verified ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
                          <Check size={14} /> Reconciled
                        </span>
                      ) : (
                        <span style={{ color: '#d97706', fontSize: '0.78rem', fontWeight: 600 }}>Unverified</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        {item.paidAmount > 0 && (
                          <button 
                            className="trans-btn trans-btn-outline" 
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => setSelectedReceipt(item)}
                          >
                            <Receipt size={13} /> Slip
                          </button>
                        )}
                        {!item.verified && (
                          <button 
                            className="trans-btn trans-btn-success" 
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => handleVerify(item.id)}
                            title="Verify via Accounts Sync"
                          >
                            Verify
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

      {/* Receipt Voucher Modal */}
      {selectedReceipt && (
        <div className="trans-modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Receipt size={18} className="text-sky-600" /> BPUT Transport Fee Receipt</h3>
              <button className="trans-modal-close" onClick={() => setSelectedReceipt(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ border: '2px solid #e2e8f0', borderRadius: 10, padding: '1.25rem', background: '#fafaf9' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, textTransform: 'uppercase' }}>Biju Patnaik University of Technology (BPUT)</h4>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Transport Department E-Fee Clearance Slip</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                  <div><strong>Student Name:</strong> {selectedReceipt.studentName}</div>
                  <div><strong>Roll / Reg No:</strong> {selectedReceipt.rollNumber}</div>
                  <div><strong>Receipt No:</strong> {selectedReceipt.receiptNo}</div>
                  <div><strong>Semester:</strong> {selectedReceipt.semester}</div>
                  <div><strong>Allocated Route:</strong> {selectedReceipt.routeName}</div>
                  <div><strong>Tariff Assessed:</strong> ₹{selectedReceipt.feeAmount.toLocaleString('en-IN')}</div>
                  <div><strong>Amount Paid:</strong> ₹{selectedReceipt.paidAmount.toLocaleString('en-IN')}</div>
                  <div><strong>Balance Dues:</strong> ₹{selectedReceipt.dues.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>✓ Verified with Central Accounts Gateway</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Cleared: ₹{selectedReceipt.paidAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setSelectedReceipt(null)}>Close</button>
              <button className="trans-btn trans-btn-primary" onClick={() => window.print()}>Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
