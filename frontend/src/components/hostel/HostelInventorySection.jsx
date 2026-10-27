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
  X,
  FileText,
  Download,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Printer,
  Sparkles,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import {
  getAllIndents,
  raiseNewIndent,
  approveIndentByAdmin,
  rejectIndentByAdmin,
  markIndentIssued,
  resetIndentsToDefault,
  PRESET_MATERIALS
} from '../../services/hostelIndentStore.js';
import { mockInventoryAssets } from './hostelData.js';
import './HostelIndentSection.css';

export default function HostelInventorySection({ account, isHostelAdmin: propIsHostelAdmin }) {
  // Check role: Hostel Admin vs Warden
  const isHostelAdmin = Boolean(
    propIsHostelAdmin ||
    account?.role === 'hostel_admin' ||
    account?.role === 'admin' ||
    account?.role === 'super_admin' ||
    account?.identity === 'WRD-ADM-01' ||
    account?.detail?.toLowerCase().includes('administrator')
  );

  // 2 SECTIONS matching Image 1:
  // Section 1: 'raise_indent' (Raise Indent / View Status)
  // Section 2: 'recommendation_log' (My Recommendation Log & Asset Registry)
  const [activeSection, setActiveSection] = useState('raise_indent');

  const [indents, setIndents] = useState(() => getAllIndents());
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedIndentDetail, setSelectedIndentDetail] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Table Column Filters (Matching Images 2, 3, 4, 5 header filter inputs)
  const [filterMaterial, setFilterMaterial] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'Approved' | 'Pending' | 'Rejected'
  const [filterSearch, setFilterSearch] = useState('');
  const [filterRaisedBy, setFilterRaisedBy] = useState('ALL');

  // Form State for [RAISE IND]
  const defaultWardenName = account?.name || 'Mr. Tanmaya Kumar Routray';
  const [formData, setFormData] = useState({
    materialSelect: PRESET_MATERIALS[0].name,
    isCustom: false,
    customMaterialName: '',
    code: PRESET_MATERIALS[0].code,
    quantity: '4',
    unit: 'pcs',
    approxCost: '82.18',
    purpose: 'bh-1,bh-2',
    expectedDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    raisedBy: defaultWardenName,
    priority: 'Normal',
    remarks: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handle material selection change
  const handleMaterialChange = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM_ITEM') {
      setFormData(prev => ({
        ...prev,
        materialSelect: 'CUSTOM_ITEM',
        isCustom: true,
        customMaterialName: '',
        code: 'CUST-HST',
        approxCost: '0.00'
      }));
    } else {
      const preset = PRESET_MATERIALS.find(m => m.name === val);
      setFormData(prev => ({
        ...prev,
        materialSelect: val,
        isCustom: false,
        code: preset?.code || 'S-GEN',
        unit: preset?.defaultUnit || 'pcs',
        approxCost: preset ? (preset.approxCost * Number(prev.quantity || 1)).toFixed(2) : prev.approxCost
      }));
    }
  };

  // Re-calculate cost when quantity changes for preset materials
  const handleQuantityChange = (qty) => {
    const num = Number(qty) || 1;
    const preset = PRESET_MATERIALS.find(m => m.name === formData.materialSelect);
    const unitPrice = preset ? preset.approxCost : (Number(formData.approxCost) / (Number(formData.quantity) || 1));
    setFormData(prev => ({
      ...prev,
      quantity: qty,
      approxCost: (unitPrice * num).toFixed(2)
    }));
  };

  // Submit Raise Indent
  const handleRaiseSubmit = (e) => {
    e.preventDefault();
    const finalMaterialName = formData.isCustom
      ? formData.customMaterialName.trim()
      : formData.materialSelect;

    if (!finalMaterialName) {
      showToast('Please specify the material name.');
      return;
    }

    const { newIndent, updated } = raiseNewIndent({
      materialName: finalMaterialName,
      isCustom: formData.isCustom,
      code: formData.code,
      quantity: formData.quantity,
      unit: formData.unit,
      approxCost: formData.approxCost,
      purpose: formData.purpose,
      expectedDate: formData.expectedDate,
      raisedBy: formData.raisedBy,
      remarks: formData.remarks
    });

    setIndents(updated);
    setIsRaiseModalOpen(false);
    showToast(`Indent #${newIndent.indentNo} submitted! Status: Pending Hostel Admin Approval.`);
  };

  // Approve Indent (Hostel Admin)
  const handleApprove = (indentId) => {
    const approver = account?.name ? `${account.name} (Hostel Admin)` : 'Mr. Rajesh Jena (Hostel Admin)';
    const updated = approveIndentByAdmin(indentId, approver);
    setIndents(updated);
    if (selectedIndentDetail && selectedIndentDetail.id === indentId) {
      setSelectedIndentDetail(prev => ({ ...prev, isApproved: true, status: 'Approved', currentLevel: 'Level-2 (Store Issued)' }));
    }
    showToast(`Indent #${indentId} APPROVED by Hostel Admin! Ready for Store Issuance.`);
  };

  // Reject Indent (Hostel Admin)
  const handleReject = (indentId) => {
    const updated = rejectIndentByAdmin(indentId, 'Budget constraint or alternative item in store', account?.name || 'Hostel Admin');
    setIndents(updated);
    if (selectedIndentDetail && selectedIndentDetail.id === indentId) {
      setSelectedIndentDetail(prev => ({ ...prev, isApproved: false, status: 'Rejected', currentLevel: 'Rejected' }));
    }
    showToast(`Indent #${indentId} Rejected.`);
  };

  // Mark Issued
  const handleMarkIssued = (indentId) => {
    const updated = markIndentIssued(indentId);
    setIndents(updated);
    if (selectedIndentDetail && selectedIndentDetail.id === indentId) {
      setSelectedIndentDetail(prev => ({ ...prev, issued: true, status: 'Approved & Issued', currentLevel: 'Store Dispatched' }));
    }
    showToast(`Indent #${indentId} marked as Material ISSUED to Hostel.`);
  };

  // Filtered Indents
  const filteredIndents = useMemo(() => {
    return indents.filter(item => {
      // Material match
      const matchMat = filterMaterial === 'ALL' || item.materialName.toLowerCase().includes(filterMaterial.toLowerCase());
      // Status match
      let matchStat = true;
      if (filterStatus === 'Approved') matchStat = item.isApproved === true;
      else if (filterStatus === 'Pending') matchStat = item.status === 'Pending';
      else if (filterStatus === 'Issued') matchStat = item.issued === true;
      else if (filterStatus === 'Rejected') matchStat = item.status === 'Rejected';

      // Raised By match
      const matchRaised = filterRaisedBy === 'ALL' || item.raisedBy.toLowerCase().includes(filterRaisedBy.toLowerCase());

      // Search match
      const q = filterSearch.toLowerCase().trim();
      const matchSearch = !q ||
        item.indentNo.toLowerCase().includes(q) ||
        item.materialName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q) ||
        item.raisedBy.toLowerCase().includes(q);

      return matchMat && matchStat && matchRaised && matchSearch;
    });
  }, [indents, filterMaterial, filterStatus, filterRaisedBy, filterSearch]);

  const stats = useMemo(() => {
    return {
      total: indents.length,
      pending: indents.filter(i => i.status === 'Pending').length,
      approved: indents.filter(i => i.isApproved).length,
      issued: indents.filter(i => i.issued).length,
      totalCost: indents.reduce((acc, curr) => acc + (curr.costNum || 0), 0)
    };
  }, [indents]);

  return (
    <div className="hostel-indent-module-wrap">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="indent-toast" role="status">
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Section Tabs matching Image 1 */}
      <div className="indent-top-bar">
        <div className="indent-breadcrumb">
          <span>Home</span>
          <span className="sep">/</span>
          <span>Inventory</span>
          <span className="sep">/</span>
          <strong>{activeSection === 'raise_indent' ? 'Indent Status' : 'My Recommendation Log'}</strong>
        </div>

        {/* 2 SECTIONS Sub-Navigation Bar matching Image 1 */}
        <div className="indent-nav-pills" role="tablist">
          <button
            type="button"
            className={`indent-nav-pill ${activeSection === 'raise_indent' ? 'active' : ''}`}
            onClick={() => setActiveSection('raise_indent')}
          >
            <span>»</span>
            <span>Raise Indent / View Status</span>
            {stats.pending > 0 && <span className="indent-badge-count">{stats.pending}</span>}
          </button>

          <button
            type="button"
            className={`indent-nav-pill ${activeSection === 'recommendation_log' ? 'active' : ''}`}
            onClick={() => setActiveSection('recommendation_log')}
          >
            <span>»</span>
            <span>My Recommendation Log</span>
          </button>
        </div>
      </div>

      {/* ==============================================================
          SECTION 1: RAISE INDENT & INDENT STATUS (Images 2, 3, 4, 5)
          ============================================================== */}
      {activeSection === 'raise_indent' && (
        <div className="indent-section-body">
          {/* Main Title & Action Buttons Bar */}
          <div className="indent-header-actions-row">
            <div className="indent-page-title">
              <Boxes size={22} color="#0284c7" />
              <h2>Indent Status</h2>
              <span className="indent-role-badge">
                {isHostelAdmin ? 'Hostel Admin (Sanction Authority)' : 'Warden (Requisitioner)'}
              </span>
            </div>

            <div className="indent-btn-group">
              <button
                type="button"
                className="btn-raise-ind"
                onClick={() => setIsRaiseModalOpen(true)}
                title="Raise New Indent for Hostel Needs"
              >
                <span>RAISE IND</span>
              </button>

              <button
                type="button"
                className="btn-pdf-export"
                onClick={() => window.print()}
                title="Export Indent Register to PDF"
              >
                <span>PDF</span>
              </button>

              <button
                type="button"
                className="btn-excel-export"
                onClick={() => showToast('Exporting Indent register to Excel spreadsheet...')}
                title="Export Indent Register to Excel"
              >
                <span>EXCEL</span>
              </button>
            </div>
          </div>

          {/* Warning Banner matching Images 4 & 5 */}
          {showWarningBanner && (
            <div className="indent-warning-box">
              <div className="indent-warning-content">
                <strong>Warning!</strong> Seems like you have {stats.pending} pending requisition(s) awaiting Hostel Admin review!
              </div>
              <button
                type="button"
                className="indent-warning-close"
                onClick={() => setShowWarningBanner(false)}
                title="Dismiss warning"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Quick Stats Strip */}
          <div className="indent-stats-bar">
            <div className="istat-chip">
              <span className="istat-label">Total Indents:</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="istat-chip pending">
              <span className="istat-label">Pending Approval:</span>
              <strong>{stats.pending}</strong>
            </div>
            <div className="istat-chip approved">
              <span className="istat-label">Approved:</span>
              <strong>{stats.approved}</strong>
            </div>
            <div className="istat-chip issued">
              <span className="istat-label">Issued:</span>
              <strong>{stats.issued}</strong>
            </div>
            <div className="istat-chip">
              <span className="istat-label">Estimated Requisition Value:</span>
              <strong>RS. {stats.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <button
              type="button"
              className="btn-reset-demo"
              onClick={() => {
                const def = resetIndentsToDefault();
                setIndents(def);
                showToast('Indent records reset to university sample defaults.');
              }}
              title="Reset records"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Filter Bar with Text Search */}
          <div className="indent-search-strip">
            <div className="indent-search-input-box">
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search Indent No, Material Name, Code, Purpose, Raised By..."
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
              />
            </div>

            <div className="indent-quick-filters">
              <span>Status:</span>
              {['ALL', 'Pending', 'Approved', 'Issued', 'Rejected'].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`quick-pill ${filterStatus === s ? 'active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Main ERP Indent Status Table (Exact Replica of Images 2, 3, 4, 5) */}
          <div className="indent-table-container">
            <table className="indent-erp-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th style={{ minWidth: '130px' }}>Requisition/Indent No.</th>
                  <th style={{ minWidth: '220px' }}>Material Name</th>
                  <th style={{ width: '85px' }}>Code</th>
                  <th style={{ width: '100px' }}>Quantity</th>
                  <th style={{ width: '110px' }}>Aprrox Cost</th>
                  <th style={{ minWidth: '130px' }}>Purpose</th>
                  <th style={{ width: '115px' }}>Expected Date</th>
                  <th style={{ minWidth: '150px' }}>Raised By</th>
                  <th style={{ width: '105px' }}>Current Level</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Is Approved</th>
                  <th style={{ width: '85px', textAlign: 'center' }}>Issued?</th>
                  {isHostelAdmin && <th style={{ width: '140px', textAlign: 'center' }}>Hostel Admin Action</th>}
                </tr>

                {/* Sub-Header Filter Row (Image 2 style filter row) */}
                <tr className="indent-filter-subrow">
                  <th></th>
                  <th>
                    <input
                      type="text"
                      className="table-filter-input"
                      placeholder="Filter..."
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                    />
                  </th>
                  <th>
                    <select
                      className="table-filter-select"
                      value={filterMaterial}
                      onChange={e => setFilterMaterial(e.target.value)}
                    >
                      <option value="ALL">— All Materials —</option>
                      {PRESET_MATERIALS.filter(m => m.name !== 'CUSTOM_ITEM').map(m => (
                        <option key={m.code} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>
                    <select
                      className="table-filter-select"
                      value={filterRaisedBy}
                      onChange={e => setFilterRaisedBy(e.target.value)}
                    >
                      <option value="ALL">— Raised By —</option>
                      <option value="Tanmaya">Tanmaya Kumar Routray</option>
                      <option value="Nibedita">Mrs. Nibedita Das</option>
                    </select>
                  </th>
                  <th></th>
                  <th></th>
                  <th></th>
                  {isHostelAdmin && <th></th>}
                </tr>
              </thead>

              <tbody>
                {filteredIndents.length === 0 ? (
                  <tr>
                    <td colSpan={isHostelAdmin ? 13 : 12} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No requisitions matching selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredIndents.map((item, idx) => (
                    <tr key={item.id} className={item.isApproved ? 'row-approved' : 'row-pending'}>
                      {/* # Play icon + index */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="table-play-btn"
                          onClick={() => setSelectedIndentDetail(item)}
                          title="View Requisition Specification"
                        >
                          ▶
                        </button>
                      </td>

                      {/* Requisition/Indent No. */}
                      <td style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>
                        {item.indentNo}
                      </td>

                      {/* Material Name */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.materialName}</div>
                        {item.isCustom && (
                          <span className="custom-item-chip">★ Custom Warden Requisition</span>
                        )}
                        {item.remarks && (
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                            {item.remarks}
                          </div>
                        )}
                      </td>

                      {/* Code */}
                      <td style={{ fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                        {item.code}
                      </td>

                      {/* Quantity */}
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.quantity}
                      </td>

                      {/* Approx Cost */}
                      <td style={{ fontWeight: 600, color: '#334155' }}>
                        {item.approxCost}
                      </td>

                      {/* Purpose */}
                      <td>
                        <span className="purpose-pill">{item.purpose}</span>
                      </td>

                      {/* Expected Date */}
                      <td style={{ color: '#475569', fontSize: '0.8rem' }}>
                        {item.expectedDate}
                      </td>

                      {/* Raised By */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.raisedBy}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Hostel Warden</div>
                      </td>

                      {/* Current Level */}
                      <td>
                        <span className={`level-pill ${item.currentLevel.includes('Level-2') ? 'level-2' : ''}`}>
                          {item.currentLevel}
                        </span>
                      </td>

                      {/* Is Approved (Green Checkmark as in Image 3 & 4) */}
                      <td style={{ textAlign: 'center' }}>
                        {item.isApproved ? (
                          <div className="icon-check-circle" title={`Approved by ${item.approvedBy || 'Hostel Admin'}`}>
                            <Check size={16} strokeWidth={3} />
                          </div>
                        ) : item.status === 'Rejected' ? (
                          <span className="status-rejected-tag">Rejected</span>
                        ) : (
                          <div className="icon-pending-clock" title="Awaiting Hostel Admin Sanction">
                            <Clock size={15} />
                            <span style={{ fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>Pending</span>
                          </div>
                        )}
                      </td>

                      {/* Issued? (Green Checkmark as in Image 3 & 4) */}
                      <td style={{ textAlign: 'center' }}>
                        {item.issued ? (
                          <div className="icon-check-circle" title="Dispatched from University Central Store">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <span className="status-await-issue" title="Awaiting store dispatch">
                            ○ Pending
                          </span>
                        )}
                      </td>

                      {/* Hostel Admin Action Buttons */}
                      {isHostelAdmin && (
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            {!item.isApproved && item.status !== 'Rejected' && (
                              <>
                                <button
                                  type="button"
                                  className="btn-action approve"
                                  onClick={() => handleApprove(item.id)}
                                  title="Approve Indent as Hostel Admin"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn-action reject"
                                  onClick={() => handleReject(item.id)}
                                  title="Reject Indent"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {item.isApproved && !item.issued && (
                              <button
                                type="button"
                                className="btn-action issue"
                                onClick={() => handleMarkIssued(item.id)}
                                title="Mark as Issued to Hostel"
                              >
                                Mark Issued
                              </button>
                            )}
                            {item.isApproved && item.issued && (
                              <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          SECTION 2: MY RECOMMENDATION LOG & ASSET REGISTRY
          ============================================================== */}
      {activeSection === 'recommendation_log' && (
        <div className="indent-section-body">
          <div className="indent-header-actions-row">
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                My Recommendation Log &amp; Hostel Asset Register
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Complete audit log of warden recommended equipment, maintenance requisitions, and room inventory assets.
              </p>
            </div>
            <button type="button" className="btn-pdf-export" onClick={() => window.print()}>
              Print Asset Register
            </button>
          </div>

          <div className="recommendation-grid">
            <div className="rec-summary-card">
              <h4>Warden Requisition Log Summary</h4>
              <div className="rec-metric-row">
                <span>Total Indents Recommended by Warden:</span>
                <strong>{indents.length} Items</strong>
              </div>
              <div className="rec-metric-row">
                <span>Sanctioned by Hostel Admin:</span>
                <strong style={{ color: '#059669' }}>{stats.approved} ({Math.round((stats.approved / indents.length) * 100)}%)</strong>
              </div>
              <div className="rec-metric-row">
                <span>Physical Materials Issued &amp; Installed:</span>
                <strong style={{ color: '#0284c7' }}>{stats.issued} Items</strong>
              </div>
              <div className="rec-metric-row">
                <span>Pending Approval at Admin Desk:</span>
                <strong style={{ color: '#d97706' }}>{stats.pending} Items</strong>
              </div>
            </div>

            <div className="rec-summary-card">
              <h4>Residential Hostel Asset Inventory</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 10px 0' }}>
                Existing fixed assets under warden custody across hostel blocks:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mockInventoryAssets.slice(0, 4).map(asset => (
                  <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span><strong>{asset.name}</strong> ({asset.hostel})</span>
                    <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{asset.inUse} / {asset.totalQty} Units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: [RAISE IND] — WITH PRESET & CUSTOM MATERIAL OPTIONS
          ============================================================== */}
      {isRaiseModalOpen && (
        <div className="indent-modal-backdrop" onClick={() => setIsRaiseModalOpen(false)}>
          <div className="indent-modal-card" onClick={e => e.stopPropagation()}>
            <div className="indent-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Boxes size={20} color="#059669" />
                <h3>Raise Indent / Hostel Material Requisition</h3>
              </div>
              <button
                type="button"
                className="indent-modal-close"
                onClick={() => setIsRaiseModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRaiseSubmit} className="indent-modal-form">
              {/* Material Dropdown with CUSTOM option */}
              <div className="iform-group">
                <label className="required">Material Name *</label>
                <select
                  value={formData.materialSelect}
                  onChange={handleMaterialChange}
                  className="iform-select"
                  required
                >
                  <optgroup label="Standard Hostel Maintenance &amp; Stationery Catalog">
                    {PRESET_MATERIALS.filter(m => m.name !== 'CUSTOM_ITEM').map(m => (
                      <option key={m.code} value={m.name}>
                        {m.name} [{m.code}] — Approx Rs. {m.approxCost}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom / Specialized Requirement">
                    <option value="CUSTOM_ITEM">
                      ★ + Other / Custom Item (Enter custom item name &amp; specs)
                    </option>
                  </optgroup>
                </select>
              </div>

              {/* Custom Item Text Input (shows when custom option selected) */}
              {formData.isCustom && (
                <div className="iform-group custom-input-highlight">
                  <label className="required">
                    <Sparkles size={14} color="#0284c7" /> Specify Custom Material Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Iron Almirah 3-Tier Rack, Water Geyser 25L, Heavy Duty Door Closer..."
                    value={formData.customMaterialName}
                    onChange={e => setFormData({ ...formData, customMaterialName: e.target.value })}
                    required
                    autoFocus
                  />
                  <small style={{ color: '#0284c7', fontSize: '0.74rem' }}>
                    Custom item will be reviewed and cataloged by the Hostel Admin &amp; Central Store.
                  </small>
                </div>
              )}

              {/* Code & Quantity Row */}
              <div className="iform-row two-col">
                <div className="iform-group">
                  <label>Material Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>

                <div className="iform-group">
                  <label className="required">Quantity *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.quantity}
                      onChange={e => handleQuantityChange(e.target.value)}
                      style={{ flex: 1 }}
                      required
                    />
                    <select
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      style={{ width: '90px' }}
                    >
                      <option value="pcs">pcs</option>
                      <option value="box">box</option>
                      <option value="meters">meters</option>
                      <option value="pairs">pairs</option>
                      <option value="sets">sets</option>
                      <option value="sheets">sheets</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Approx Cost & Expected Date */}
              <div className="iform-row two-col">
                <div className="iform-group">
                  <label className="required">Estimated Approx Cost (RS.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.approxCost}
                    onChange={e => setFormData({ ...formData, approxCost: e.target.value })}
                    required
                  />
                </div>

                <div className="iform-group">
                  <label className="required">Expected Requirement Date *</label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={e => setFormData({ ...formData, expectedDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Purpose & Hostel Block */}
              <div className="iform-group">
                <label className="required">Purpose / Hostel Block *</label>
                <input
                  type="text"
                  placeholder="e.g. bh-1,bh-2 / Gandhi Block Rooms 101-106 / Sarojini Girls Residence / Dining Hall"
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  required
                />
              </div>

              {/* Raised By */}
              <div className="iform-row two-col">
                <div className="iform-group">
                  <label>Raised By</label>
                  <input
                    type="text"
                    value={formData.raisedBy}
                    onChange={e => setFormData({ ...formData, raisedBy: e.target.value })}
                    required
                  />
                </div>

                <div className="iform-group">
                  <label>Requisition Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Normal">Normal (Regular Session Supply)</option>
                    <option value="Urgent">Urgent (Hostel Repair Needed)</option>
                    <option value="Emergency">Emergency (Immediate Safety/Hygiene)</option>
                  </select>
                </div>
              </div>

              {/* Remarks / Justification */}
              <div className="iform-group">
                <label>Justification / Description of Need</label>
                <textarea
                  rows={2}
                  placeholder="Brief justification for hostel administration approval..."
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              {/* Submit Buttons */}
              <div className="indent-modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsRaiseModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit-ind"
                >
                  <Plus size={15} />
                  <span>Submit Indent to Hostel Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: VIEW INDENT SPECIFICATION SLIP
          ============================================================== */}
      {selectedIndentDetail && (
        <div className="indent-modal-backdrop" onClick={() => setSelectedIndentDetail(null)}>
          <div className="indent-modal-card" onClick={e => e.stopPropagation()}>
            <div className="indent-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#0284c7" />
                <h3>Requisition Dossier — {selectedIndentDetail.indentNo}</h3>
              </div>
              <button
                type="button"
                className="indent-modal-close"
                onClick={() => setSelectedIndentDetail(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="indent-modal-body">
              <div className="slip-detail-grid">
                <div className="slip-item">
                  <span className="slabel">Requisition No.</span>
                  <span className="sval" style={{ fontFamily: 'monospace', color: '#1e3a8a', fontWeight: 800 }}>
                    {selectedIndentDetail.indentNo}
                  </span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Material Name</span>
                  <span className="sval" style={{ fontWeight: 700, color: '#0f172a' }}>
                    {selectedIndentDetail.materialName}
                  </span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Material Code</span>
                  <span className="sval">{selectedIndentDetail.code}</span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Quantity Required</span>
                  <span className="sval">{selectedIndentDetail.quantity}</span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Estimated Cost</span>
                  <span className="sval">{selectedIndentDetail.approxCost}</span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Purpose / Allocation</span>
                  <span className="sval">{selectedIndentDetail.purpose}</span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Expected Date</span>
                  <span className="sval">{selectedIndentDetail.expectedDate}</span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Raised By</span>
                  <span className="sval">{selectedIndentDetail.raisedBy}</span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Current Workflow Level</span>
                  <span className="sval">{selectedIndentDetail.currentLevel}</span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Hostel Admin Approval</span>
                  <span className="sval" style={{ color: selectedIndentDetail.isApproved ? '#059669' : '#d97706', fontWeight: 700 }}>
                    {selectedIndentDetail.isApproved ? '✔ Approved' : '⏳ Pending Approval'}
                  </span>
                </div>
                <div className="slip-item">
                  <span className="slabel">Store Issue Status</span>
                  <span className="sval" style={{ color: selectedIndentDetail.issued ? '#059669' : '#64748b', fontWeight: 700 }}>
                    {selectedIndentDetail.issued ? '✔ Material Issued' : '○ Pending Dispatch'}
                  </span>
                </div>
                {selectedIndentDetail.remarks && (
                  <div className="slip-item full">
                    <span className="slabel">Justification / Remarks</span>
                    <p style={{ margin: '4px 0 0 0', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      {selectedIndentDetail.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="indent-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setSelectedIndentDetail(null)}
              >
                Close
              </button>
              {isHostelAdmin && !selectedIndentDetail.isApproved && (
                <button
                  type="button"
                  className="btn-action approve"
                  style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                  onClick={() => {
                    handleApprove(selectedIndentDetail.id);
                  }}
                >
                  Approve Requisition
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
