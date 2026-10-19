import React, { useState, useMemo } from 'react';
import { 
  Fuel, DollarSign, Calendar, Search, Filter, Plus, 
  Receipt, CheckCircle, Clock, FileText, X, AlertCircle 
} from 'lucide-react';
import { mockFuelExpenses } from './transportData';
import './TransportExtraSections.css';

export default function TransportFuelSection() {
  const [data, setData] = useState(mockFuelExpenses);
  const [search, setSearch] = useState('');
  const [busFilter, setBusFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [newLogModal, setNewLogModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // New fuel log form
  const [formBus, setFormBus] = useState('OD-02-AK-4411');
  const [formDriver, setFormDriver] = useState('Ramesh Ch. Jena');
  const [formFuelType, setFormFuelType] = useState('Diesel (BS-VI)');
  const [formQty, setFormQty] = useState('50');
  const [formRate, setFormRate] = useState('94.80');
  const [formOdo, setFormOdo] = useState('68750');
  const [formBunk, setFormBunk] = useState('Indian Oil COCO - Phulnakhara');
  const [formReceipt, setFormReceipt] = useState('IOCL-88290');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.busNumber.toLowerCase().includes(search.toLowerCase()) ||
                          item.driverName.toLowerCase().includes(search.toLowerCase()) ||
                          item.bunkName.toLowerCase().includes(search.toLowerCase()) ||
                          item.receiptNo.toLowerCase().includes(search.toLowerCase());
      const matchBus = busFilter === 'ALL' || item.busNumber === busFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchBus && matchStatus;
    });
  }, [data, search, busFilter, statusFilter]);

  // Statistics
  const totalLitres = data.reduce((acc, curr) => acc + curr.quantityLitres, 0);
  const totalFuelCost = data.reduce((acc, curr) => acc + curr.totalCost, 0);
  const approvedCount = data.filter(d => d.status === 'Approved').length;
  const pendingCount = data.filter(d => d.status === 'Pending Audit').length;

  const handleAddFuel = (e) => {
    e.preventDefault();
    const qty = parseFloat(formQty) || 0;
    const rate = parseFloat(formRate) || 0;
    const cost = qty * rate;

    const newLog = {
      id: `FUL-2026-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      busNumber: formBus,
      fleetCode: formBus === 'OD-02-AK-4411' ? 'Bus 01' : formBus === 'OD-02-AK-4412' ? 'Bus 02' : 'Bus 03',
      driverName: formDriver,
      fuelType: formFuelType,
      quantityLitres: qty,
      pricePerLitre: rate,
      totalCost: cost,
      odometerKm: parseInt(formOdo, 10) || 60000,
      bunkName: formBunk,
      receiptNo: formReceipt,
      status: 'Approved'
    };

    setData([newLog, ...data]);
    setNewLogModal(false);
  };

  const handleApprove = (id) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item));
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><Fuel size={24} className="text-sky-600" /> Fuel & Expense Management</h2>
          <p>Fleet refuelling logs, bunk settlement receipts, fuel efficiency telemetry, and operating expenses.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="trans-btn trans-btn-primary" onClick={() => setNewLogModal(true)}>
            <Plus size={16} /> Log Fuel Dispense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><DollarSign size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{totalFuelCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <span className="trans-kpi-title">Total Fuel Outlay</span>
            <span className="trans-kpi-subtitle">Fleet total this billing cycle</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><Fuel size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalLitres.toFixed(1)} L</span>
            <span className="trans-kpi-title">Fuel Dispensed</span>
            <span className="trans-kpi-subtitle">BS-VI Diesel & CNG</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><CheckCircle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{approvedCount}</span>
            <span className="trans-kpi-title">Audited & Approved</span>
            <span className="trans-kpi-subtitle">Bunk receipts reconciled</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><Clock size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{pendingCount}</span>
            <span className="trans-kpi-title">Pending Slip Audit</span>
            <span className="trans-kpi-subtitle">Awaiting supervisor signoff</span>
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
              placeholder="Search receipt, driver, bunk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={busFilter} onChange={(e) => setBusFilter(e.target.value)}>
            <option value="ALL">All Vehicles</option>
            <option value="OD-02-AK-4411">OD-02-AK-4411 (Bus 01)</option>
            <option value="OD-02-AK-4412">OD-02-AK-4412 (Bus 02)</option>
            <option value="OD-02-BL-8890">OD-02-BL-8890 (Bus 03)</option>
            <option value="OD-02-BL-8891">OD-02-BL-8891 (Bus 04)</option>
            <option value="OD-02-CL-1209">OD-02-CL-1209 (Bus 05)</option>
          </select>

          <select className="trans-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Audit Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending Audit">Pending Audit</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> refuel logs
          </span>
        </div>
      </div>

      {/* Fuel Log Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Date & Receipt</th>
                <th>Bus & Fleet Code</th>
                <th>Driver On Duty</th>
                <th>Fuel Type</th>
                <th>Quantity</th>
                <th>Rate / Litre</th>
                <th>Total Cost (INR)</th>
                <th>Odometer</th>
                <th>Petrol Bunk</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No fuel expense slips match your query.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.date}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{item.receiptNo}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.busNumber}</div>
                      <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{item.fleetCode}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.driverName}</td>
                    <td>
                      <span className="trans-badge info" style={{ fontSize: '0.72rem' }}>
                        {item.fuelType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800 }}>{item.quantityLitres} L</td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>₹{item.pricePerLitre.toFixed(2)}</td>
                    <td style={{ fontWeight: 800, color: '#059669', fontSize: '0.92rem' }}>
                      ₹{item.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                    </td>
                    <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {item.odometerKm.toLocaleString()} KM
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#475569', maxWidth: 170 }}>{item.bunkName}</td>
                    <td>
                      <span className={`trans-badge ${item.status === 'Approved' ? 'success' : 'warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button 
                          className="trans-btn trans-btn-outline" 
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => setSelectedReceipt(item)}
                        >
                          <Receipt size={13} /> Slip
                        </button>
                        {item.status !== 'Approved' && (
                          <button 
                            className="trans-btn trans-btn-success" 
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => handleApprove(item.id)}
                            title="Approve Fuel Bill"
                          >
                            Approve
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

      {/* View Slip Modal */}
      {selectedReceipt && (
        <div className="trans-modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Receipt size={18} className="text-sky-600" /> Fuel Dispense Voucher - {selectedReceipt.receiptNo}</h3>
              <button className="trans-modal-close" onClick={() => setSelectedReceipt(null)}><X size={18} /></button>
            </div>
            <div className="trans-modal-body">
              <div style={{ border: '2px solid #e2e8f0', borderRadius: 10, padding: '1.25rem', background: '#fafaf9' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, textTransform: 'uppercase' }}>BPUT University Transport Division</h4>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Fuel Voucher & Bunk Reconciliation Slip</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                  <div><strong>Date:</strong> {selectedReceipt.date}</div>
                  <div><strong>Receipt No:</strong> {selectedReceipt.receiptNo}</div>
                  <div><strong>Vehicle:</strong> {selectedReceipt.busNumber} ({selectedReceipt.fleetCode})</div>
                  <div><strong>Driver:</strong> {selectedReceipt.driverName}</div>
                  <div><strong>Fueling Station:</strong> {selectedReceipt.bunkName}</div>
                  <div><strong>Odometer:</strong> {selectedReceipt.odometerKm.toLocaleString()} KM</div>
                  <div><strong>Quantity:</strong> {selectedReceipt.quantityLitres} Litres</div>
                  <div><strong>Tariff Rate:</strong> ₹{selectedReceipt.pricePerLitre}/L</div>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800 }}>Total Payable:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>₹{selectedReceipt.totalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            <div className="trans-modal-footer">
              <button className="trans-btn trans-btn-outline" onClick={() => setSelectedReceipt(null)}>Close</button>
              <button className="trans-btn trans-btn-primary" onClick={() => window.print()}>Print Voucher</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Log Dispense */}
      {newLogModal && (
        <div className="trans-modal-overlay" onClick={() => setNewLogModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Plus size={18} className="text-sky-600" /> Log Bus Fuel Dispense</h3>
              <button className="trans-modal-close" onClick={() => setNewLogModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddFuel}>
              <div className="trans-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Vehicle Number</label>
                    <select className="trans-select" style={{ width: '100%' }} value={formBus} onChange={(e) => setFormBus(e.target.value)}>
                      <option value="OD-02-AK-4411">OD-02-AK-4411 (Bus 01)</option>
                      <option value="OD-02-AK-4412">OD-02-AK-4412 (Bus 02)</option>
                      <option value="OD-02-BL-8890">OD-02-BL-8890 (Bus 03)</option>
                      <option value="OD-02-BL-8891">OD-02-BL-8891 (Bus 04)</option>
                      <option value="OD-02-CL-1209">OD-02-CL-1209 (Bus 05)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Fuel Type</label>
                    <select className="trans-select" style={{ width: '100%' }} value={formFuelType} onChange={(e) => setFormFuelType(e.target.value)}>
                      <option value="Diesel (BS-VI)">Diesel (BS-VI)</option>
                      <option value="CNG">CNG</option>
                      <option value="DEF (AdBlue)">DEF (AdBlue Fluid)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Litres / KG</label>
                    <input type="number" step="0.1" className="trans-select" style={{ width: '100%' }} value={formQty} onChange={e => setFormQty(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Rate (₹/Unit)</label>
                    <input type="number" step="0.01" className="trans-select" style={{ width: '100%' }} value={formRate} onChange={e => setFormRate(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Odometer (KM)</label>
                    <input type="number" className="trans-select" style={{ width: '100%' }} value={formOdo} onChange={e => setFormOdo(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Petrol Bunk / Provider</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={formBunk} onChange={e => setFormBunk(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Bunk Cash Receipt No</label>
                    <input type="text" className="trans-select" style={{ width: '100%' }} value={formReceipt} onChange={e => setFormReceipt(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Computed Total Expense:</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#059669' }}>
                    ₹{((parseFloat(formQty) || 0) * (parseFloat(formRate) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setNewLogModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Record Dispense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
