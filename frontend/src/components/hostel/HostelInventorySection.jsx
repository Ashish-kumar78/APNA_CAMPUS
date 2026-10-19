import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Package,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  Eye,
  Plus,
  RotateCcw,
  X
} from 'lucide-react';
import { mockInventoryAssets } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelInventorySection() {
  const [assets, setAssets] = useState(mockInventoryAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [selectedAssetModal, setSelectedAssetModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchCat = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchCond = conditionFilter === 'ALL' || a.condition === conditionFilter;
      const matchSearch = !searchQuery ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.hostel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchCond && matchSearch;
    });
  }, [assets, categoryFilter, conditionFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalQty = assets.reduce((sum, a) => sum + a.totalQty, 0);
    const inUseQty = assets.reduce((sum, a) => sum + a.inUse, 0);
    const needsRepair = assets.filter(a => a.condition.includes('Repair')).length;
    return {
      assetLines: assets.length,
      totalUnits: totalQty,
      inUseUnits: inUseQty,
      availableUnits: totalQty - inUseQty,
      needsRepair
    };
  }, [assets]);

  return (
    <div className="hostel-section-container">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><Boxes size={24} color="#2563eb" /> Hostel Inventory &amp; Physical Asset Registry</h2>
          <p>Furniture · Mattresses · RO Water Coolers · Ceiling Fans · Fire Extinguishers Tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            Export Asset Register
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Boxes size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{stats.totalUnits}</span>
            <span className="hostel-kpi-title">Total Unit Count</span>
            <span className="hostel-kpi-subtitle">Across 3 Residences</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>{stats.inUseUnits}</span>
            <span className="hostel-kpi-title">Assigned / In Use</span>
            <span className="hostel-kpi-subtitle">Resident Rooms</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple"><Package size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#7c3aed' }}>{stats.availableUnits}</span>
            <span className="hostel-kpi-title">Reserve in Store</span>
            <span className="hostel-kpi-subtitle">Buffer stock</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Wrench size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>{stats.needsRepair}</span>
            <span className="hostel-kpi-title">Under Repair / Overhaul</span>
            <span className="hostel-kpi-subtitle">Workshop Service</span>
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
              placeholder="Search asset ID, item name, or hostel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="hostel-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Furniture">Furniture</option>
            <option value="Bedding">Bedding</option>
            <option value="Electrical">Electrical</option>
            <option value="Sanitation & Appliances">Sanitation &amp; Appliances</option>
            <option value="Safety & Security">Safety &amp; Security</option>
          </select>

          <select
            className="hostel-select"
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
          >
            <option value="ALL">All Conditions</option>
            <option value="Good">Good</option>
            <option value="Needs Repair">Needs Repair</option>
            <option value="Certified">Certified</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filteredAssets.length} asset entries
        </div>
      </div>

      {/* Table */}
      <div className="hostel-table-container">
        <div className="hostel-table-scroll">
          <table className="hostel-data-table">
            <thead>
              <tr>
                <th>Asset Tag ID</th>
                <th>Asset Description</th>
                <th>Category</th>
                <th>Hostel &amp; Location</th>
                <th>Total / In-Use</th>
                <th>Condition</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>History</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id}>
                  <td style={{ fontWeight: 800, color: '#2563eb' }}>{asset.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{asset.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Acquired: {asset.acquisitionDate}</div>
                  </td>
                  <td><span className="h-badge h-badge-medium">{asset.category}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{asset.hostel}</div>
                    <div style={{ fontSize: '0.74rem', color: '#475569' }}>{asset.location}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {asset.inUse} / {asset.totalQty} Units
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                      {asset.totalQty - asset.inUse} in reserve
                    </div>
                  </td>
                  <td>
                    <span className={`h-badge ${asset.condition === 'Good' || asset.condition === 'Certified' ? 'h-badge-approved' : 'h-badge-urgent'}`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td>
                    <span className={`h-badge ${asset.status === 'Assigned' ? 'h-badge-low' : 'h-badge-late'}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="h-btn h-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                      onClick={() => setSelectedAssetModal(asset)}
                    >
                      <Eye size={13} /> Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ASSET MAINTENANCE LOG */}
      {selectedAssetModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedAssetModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Asset History · {selectedAssetModal.id}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedAssetModal.name} · BPUT Fixed Assets Register
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedAssetModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div><strong>Category:</strong> {selectedAssetModal.category}</div>
                <div><strong>Hostel:</strong> {selectedAssetModal.hostel}</div>
                <div><strong>Location:</strong> {selectedAssetModal.location}</div>
                <div><strong>Acquisition Date:</strong> {selectedAssetModal.acquisitionDate}</div>
                <div><strong>Total In Inventory:</strong> {selectedAssetModal.totalQty} Units</div>
                <div><strong>Currently In Service:</strong> {selectedAssetModal.inUse} Units</div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Maintenance &amp; Inspection Audit Log
                </div>
                <div style={{ fontSize: '0.88rem', color: '#14532d', lineHeight: 1.5 }}>
                  {selectedAssetModal.maintenanceHistory}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                className="h-btn h-btn-primary"
                onClick={() => {
                  showToast(`Maintenance work order scheduled for ${selectedAssetModal.id}`);
                  setSelectedAssetModal(null);
                }}
              >
                Schedule Maintenance
              </button>
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedAssetModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
