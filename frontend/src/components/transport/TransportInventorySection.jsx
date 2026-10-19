import React, { useState, useMemo } from 'react';
import { 
  Boxes, AlertTriangle, CheckCircle2, Clock, Search, 
  Filter, Plus, PackageCheck, DollarSign, ArrowDownRight, X, Check 
} from 'lucide-react';
import { mockInventorySpareParts } from './transportData';
import './TransportExtraSections.css';

export default function TransportInventorySection() {
  const [data, setData] = useState(mockInventorySpareParts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [issueModal, setIssueModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [issueQty, setIssueQty] = useState('1');
  const [issueBus, setIssueBus] = useState('OD-02-AK-4411');

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase()) ||
                          item.supplier.toLowerCase().includes(search.toLowerCase()) ||
                          item.location.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [data, search, categoryFilter]);

  // Statistics
  const totalSkus = data.length;
  const totalStockCount = data.reduce((acc, curr) => acc + curr.inStock, 0);
  const totalValuation = data.reduce((acc, curr) => acc + (curr.inStock * curr.unitCost), 0);
  const lowStockCount = data.filter(d => d.inStock <= d.minStock).length;

  const handleIssuePart = (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const qty = parseInt(issueQty, 10) || 1;
    setData(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        const remaining = Math.max(0, item.inStock - qty);
        return {
          ...item,
          inStock: remaining,
          alertLowStock: remaining <= item.minStock
        };
      }
      return item;
    }));
    setIssueModal(false);
    setIssueQty('1');
  };

  return (
    <div className="trans-section-container">
      {/* Header */}
      <div className="trans-section-header">
        <div>
          <h2><Boxes size={24} className="text-sky-600" /> Transport Inventory & Spare Parts</h2>
          <p>Fleet workshop inventory, radial tyre stocks, brake shoes, heavy commercial batteries, and lubricants.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="trans-kpi-grid">
        <div className="trans-kpi-card">
          <div className="trans-kpi-icon sky"><Boxes size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalSkus}</span>
            <span className="trans-kpi-title">Tracked Spare SKUs</span>
            <span className="trans-kpi-subtitle">Bus maintenance parts</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon indigo"><DollarSign size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">₹{totalValuation.toLocaleString('en-IN')}</span>
            <span className="trans-kpi-title">Inventory Valuation</span>
            <span className="trans-kpi-subtitle">Current stock asset value</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon amber"><AlertTriangle size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{lowStockCount}</span>
            <span className="trans-kpi-title">Low Stock Reorders</span>
            <span className="trans-kpi-subtitle" style={{ color: '#d97706', fontWeight: 600 }}>At or below min threshold</span>
          </div>
        </div>

        <div className="trans-kpi-card">
          <div className="trans-kpi-icon emerald"><PackageCheck size={22} /></div>
          <div className="trans-kpi-info">
            <span className="trans-kpi-value">{totalStockCount} Units</span>
            <span className="trans-kpi-title">Stock Available</span>
            <span className="trans-kpi-subtitle">Central workshop warehouse</span>
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
              placeholder="Search part name, category, supplier..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className="trans-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="ALL">All Categories</option>
            <option value="Tyres & Wheels">Tyres & Wheels</option>
            <option value="Braking System">Braking System</option>
            <option value="Lubricants & Fluids">Lubricants & Fluids</option>
            <option value="Safety Equipment">Safety Equipment</option>
            <option value="Electrical">Electrical</option>
          </select>
        </div>

        <div className="trans-filter-group">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredData.length}</strong> catalog items
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="trans-table-container">
        <div className="trans-table-scroll">
          <table className="trans-data-table">
            <thead>
              <tr>
                <th>Item ID & Part Description</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Min Threshold</th>
                <th>Warehouse Bay</th>
                <th>Unit Cost (INR)</th>
                <th>Total Value</th>
                <th>Authorized Supplier</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => {
                const isLow = item.inStock <= item.minStock;
                return (
                  <tr key={item.id} style={{ background: isLow ? '#fffbeb' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{item.id} • {item.condition}</div>
                    </td>
                    <td>
                      <span className="trans-badge info">{item.category}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: isLow ? '#e11d48' : '#0f172a' }}>
                          {item.inStock}
                        </span>
                        {isLow && (
                          <span className="trans-badge danger" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            REORDER
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{item.minStock} units</td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.location}</td>
                    <td style={{ fontWeight: 700 }}>₹{item.unitCost.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 800, color: '#059669' }}>₹{(item.inStock * item.unitCost).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.78rem', color: '#475569', maxWidth: 170 }}>{item.supplier}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="trans-btn trans-btn-outline" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => { setSelectedItem(item); setIssueModal(true); }}
                        disabled={item.inStock === 0}
                      >
                        Issue Part
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Spare Part Modal */}
      {issueModal && selectedItem && (
        <div className="trans-modal-overlay" onClick={() => setIssueModal(false)}>
          <div className="trans-modal" onClick={e => e.stopPropagation()}>
            <div className="trans-modal-header">
              <h3><Boxes size={18} className="text-sky-600" /> Issue Spare Part to Bus Maintenance</h3>
              <button className="trans-modal-close" onClick={() => setIssueModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleIssuePart}>
              <div className="trans-modal-body">
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{selectedItem.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                    SKU: {selectedItem.id} | Available Stock: <strong>{selectedItem.inStock} units</strong>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Allocate to Vehicle</label>
                    <select className="trans-select" style={{ width: '100%' }} value={issueBus} onChange={e => setIssueBus(e.target.value)}>
                      <option value="OD-02-AK-4411">OD-02-AK-4411 (Bus 01)</option>
                      <option value="OD-02-AK-4412">OD-02-AK-4412 (Bus 02)</option>
                      <option value="OD-02-BL-8890">OD-02-BL-8890 (Bus 03)</option>
                      <option value="OD-02-BL-8891">OD-02-BL-8891 (Bus 04)</option>
                      <option value="OD-02-CL-1209">OD-02-CL-1209 (Bus 05)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Quantity to Issue</label>
                    <input type="number" min="1" max={selectedItem.inStock} className="trans-select" style={{ width: '100%' }} value={issueQty} onChange={e => setIssueQty(e.target.value)} required />
                  </div>
                </div>
              </div>
              <div className="trans-modal-footer">
                <button type="button" className="trans-btn trans-btn-outline" onClick={() => setIssueModal(false)}>Cancel</button>
                <button type="submit" className="trans-btn trans-btn-primary">Confirm Issue & Deduct Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
