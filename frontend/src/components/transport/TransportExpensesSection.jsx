import React, { useState, useMemo, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Filter,
  PieChart,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';
import { transportStore } from '../../services/transportStore';
import './TransportExtraSections.css';

export default function TransportExpensesSection() {
  const [expenses, setExpenses] = useState(() => transportStore.getTransportExpenses());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    category: 'Fuel (High Speed Diesel & CNG)',
    amount: '',
    voucherNumber: '',
    vendor: '',
    costPerKm: 12.5,
  });

  useEffect(() => {
    const unsub = transportStore.subscribe(() => {
      setExpenses(transportStore.getTransportExpenses());
    });
    return unsub;
  }, []);

  const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const avgCostPerKm = expenses.length > 0 ? (expenses.reduce((sum, e) => sum + (Number(e.costPerKm) || 0), 0) / expenses.length).toFixed(1) : 14.8;
  const costPerCommuter = totalExpense > 0 ? Math.round(totalExpense / 212) : 1120;

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = (e.category || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.vendor || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.voucherNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (e.month || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || e.category.includes(categoryFilter);
      return matchSearch && matchCat;
    });
  }, [expenses, search, categoryFilter]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.vendor) {
      alert('Please fill out amount and vendor details.');
      return;
    }
    await transportStore.addTransportExpense({
      ...form,
      amount: Number(form.amount),
      voucherNumber: form.voucherNumber || `VOUCH-TRN-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
    });
    setShowAddModal(false);
    setForm({
      category: 'Fuel (High Speed Diesel & CNG)',
      amount: '',
      voucherNumber: '',
      vendor: '',
      costPerKm: 12.5,
    });
  };

  const handleExportCSV = () => {
    const rows = [
      ['Billing Month', 'Expenditure Category', 'Voucher Number', 'Vendor / Recipient', 'Amount (₹)', 'Cost Per KM (₹)', 'Approval Status'],
      ...expenses.map(e => [
        `"${e.month}"`,
        `"${e.category}"`,
        e.voucherNumber,
        `"${e.vendor}"`,
        e.amount,
        e.costPerKm,
        e.approvalStatus,
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GIFT_Transport_Operations_Expenditure_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><CreditCard size={24} className="text-sky-600" /> Transport Operational Expenses & Cost Accounting</h2>
          <p>Institutional fleet expenditure tracking: fuel consumption, maintenance work orders, crew overtime, highway FASTag tolls, and cost per kilometer analytics.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="trans-btn trans-btn-secondary" onClick={handleExportCSV}>
            <Download size={15} /> Export Expense Ledger
          </button>
          <button className="trans-btn trans-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Record Expense Voucher
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon rose"><DollarSign size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{totalExpense.toLocaleString()}</span>
            <span className="trans-kpi-title">Monthly Operating Expense</span>
            <span className="trans-kpi-subtitle">Approved university vouchers</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><TrendingUp size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{avgCostPerKm} / KM</span>
            <span className="trans-kpi-title">Fleet Cost Per KM</span>
            <span className="trans-kpi-subtitle">Fuel + maintenance + tolls</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><DollarSign size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{costPerCommuter.toLocaleString()}</span>
            <span className="trans-kpi-title">Monthly Cost / Student</span>
            <span className="trans-kpi-subtitle">Based on 212 regular commuters</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><CheckCircle2 size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">100%</span>
            <span className="trans-kpi-title">Accounts Verification</span>
            <span className="trans-kpi-subtitle">All vouchers audited by Finance</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="trans-filter-bar">
        <div className="trans-search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by category, vendor, voucher ID, or month..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="trans-filter-dropdowns">
          <div className="trans-select-wrap">
            <Filter size={15} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="Fuel">Fuel Expenses</option>
              <option value="Maintenance">Maintenance & Repairs</option>
              <option value="Crew">Crew Allowances & Overtime</option>
              <option value="Tollway">FASTag Tollway & Depot</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="trans-table-card">
        <div className="trans-table-wrap">
          <table className="trans-table">
            <thead>
              <tr>
                <th>Billing Period</th>
                <th>Expense Category</th>
                <th>Voucher Reference</th>
                <th>Authorized Vendor / Payee</th>
                <th>Amount (₹)</th>
                <th>Cost / KM</th>
                <th>Accounts Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                    No expense records match the criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.month}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.category}</div>
                    </td>
                    <td><span className="trans-code-badge">{item.voucherNumber}</span></td>
                    <td>{item.vendor}</td>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '0.94rem' }}>
                        ₹{Number(item.amount || 0).toLocaleString()}
                      </strong>
                    </td>
                    <td>₹{item.costPerKm} / km</td>
                    <td>
                      <span className="trans-status-badge success">
                        <CheckCircle2 size={12} /> {item.approvalStatus || 'Approved by Finance'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="trans-modal-overlay">
          <div className="trans-modal-card" style={{ maxWidth: '520px' }}>
            <div className="trans-modal-header">
              <h3><CreditCard size={20} className="text-sky-600" /> Record Transport Expense Voucher</h3>
              <button className="trans-modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="trans-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Expenditure Category *</label>
                  <select 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option>Fuel (High Speed Diesel & CNG)</option>
                    <option>Preventive & Scheduled Maintenance</option>
                    <option>Driver & Crew Overtime / Special Trip Allowances</option>
                    <option>NHAI Tollway FASTag Recharge & Depot Charges</option>
                    <option>Annual RTO Road Tax & Permit Renewals</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Expense Amount (₹) *</label>
                    <input 
                      type="number" 
                      required 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="e.g. 15000"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Voucher Ref No</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={form.voucherNumber}
                      onChange={(e) => setForm({ ...form, voucherNumber: e.target.value })}
                      placeholder="e.g. VOUCH-TRN-2026-115"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Authorized Vendor / Service Station *</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder="e.g. Indian Oil Phulnakhara COCO, Ashok Leyland Service"
                  />
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-secondary" onClick={() => setShowAddModal(false)}><X size={14} /> Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">
                  <Check size={16} /> Save Expense Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

