import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Package,
  PackageCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Plus,
  RotateCcw,
  X,
  FileText,
  FileSpreadsheet,
  Building,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Layers,
  Printer,
  Sparkles,
  User,
  Check,
  XCircle,
  Truck,
  ArrowRight,
  MapPin,
  ClipboardList,
  ShieldCheck,
  BadgeCheck
} from 'lucide-react';
import {
  getAllIndents,
  raiseNewIndent,
  approveIndentByAdmin,
  rejectIndentByAdmin,
  markIndentIssued,
  deleteIndent,
  resetIndentsToDefault,
  PRESET_MATERIALS
} from '../../services/hostelIndentStore.js';
import { mockInventoryAssets } from './hostelData.js';
import './HostelIndentSection.css';
import WardenInventoryRequisition from './WardenInventoryRequisition.jsx';
import RequisitionFormDetailView from './RequisitionFormDetailView.jsx';

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

  // Active section tabs: 'raise_indent' (Raise Indent / View Status) | 'recommendation_log'
  const [activeSection, setActiveSection] = useState('raise_indent');

  const [indents, setIndents] = useState(() => getAllIndents());
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedIndentDetail, setSelectedIndentDetail] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Filters
  const [filterMaterial, setFilterMaterial] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'Approved' | 'Pending' | 'Issued' | 'Rejected'
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
      showToast('⚠️ Please specify the material name.');
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
    showToast(`✓ Indent #${newIndent.indentNo} submitted! Status: Pending Hostel Admin Approval.`);
  };

  // Approve Indent (Hostel Admin)
  const handleApprove = (indentId) => {
    const approver = account?.name ? `${account.name} (Hostel Admin)` : 'Mr. Rajesh Jena (Hostel Admin)';
    const updated = approveIndentByAdmin(indentId, approver);
    setIndents(updated);
    if (selectedIndentDetail && selectedIndentDetail.id === indentId) {
      setSelectedIndentDetail(prev => ({ ...prev, isApproved: true, status: 'Approved', currentLevel: 'Level-2 (Store Issued)' }));
    }
    showToast(`✓ Indent #${indentId} APPROVED by Hostel Admin! Ready for Store Issuance.`);
  };

  // Reject Indent (Hostel Admin)
  const handleReject = (indentId) => {
    const updated = rejectIndentByAdmin(indentId, 'Budget constraint or alternative item in store', account?.name || 'Hostel Admin');
    setIndents(updated);
    if (selectedIndentDetail && selectedIndentDetail.id === indentId) {
      setSelectedIndentDetail(prev => ({ ...prev, isApproved: false, status: 'Rejected', currentLevel: 'Rejected' }));
    }
    showToast(`⚠️ Indent #${indentId} Rejected.`);
  };

  // Mark Issued
  const handleMarkIssued = (indentId) => {
    const updated = markIndentIssued(indentId);
    setIndents(updated);
    if (selectedIndentDetail && selectedIndentDetail.id === indentId) {
      setSelectedIndentDetail(prev => ({ ...prev, issued: true, status: 'Approved & Issued', currentLevel: 'Store Dispatched' }));
    }
    showToast(`✓ Indent #${indentId} marked as Material ISSUED to Hostel.`);
  };

  // Filtered Indents
  const filteredIndents = useMemo(() => {
    return indents.filter(item => {
      // Material match
      let matchMat = true;
      if (filterMaterial === 'Custom') {
        matchMat = item.isCustom === true;
      } else if (filterMaterial !== 'ALL') {
        matchMat = item.materialName.toLowerCase().includes(filterMaterial.toLowerCase());
      }

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
      rejected: indents.filter(i => i.status === 'Rejected').length,
      totalCost: indents.reduce((acc, curr) => acc + (curr.costNum || 0), 0)
    };
  }, [indents]);

  const getWardenInitials = (name) => {
    if (!name) return 'W';
    return name
      .replace(/Mr\.|Mrs\.|Ms\.|Dr\./gi, '')
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="hostel-indent-module-wrap">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="indent-toast" role="status">
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. HERO HEADER BANNER */}
      <div className="indent-hero-banner">
        <div className="indent-hero-left">
          <div className="indent-hero-icon-box">
            <Boxes size={28} />
          </div>
          <div className="indent-hero-title-group">
            <h1>
              Hostel Inventory &amp; Requisition Management
              <span className={`indent-hero-badge ${isHostelAdmin ? 'admin' : 'warden'}`}>
                {isHostelAdmin ? 'Hostel Admin (Sanction Authority)' : 'Hostel Warden (Requisitioner)'}
              </span>
            </h1>
            <p className="indent-hero-subtitle">
              {isHostelAdmin
                ? 'Central Store Indents, Material Procurement, Hostel Maintenance Requisitions & Administrative Sanction Console'
                : 'Raise Indents, Track Store Dispatches, Hostel Maintenance Requisitions & Real-time Material Status'}
            </p>
          </div>
        </div>

        {/* Hero Section Navigation Tabs */}
        <div className="indent-hero-nav-tabs" role="tablist">
          <button
            type="button"
            className={`indent-hero-tab-btn ${activeSection === 'raise_indent' ? 'active' : ''}`}
            onClick={() => setActiveSection('raise_indent')}
          >
            <Boxes size={15} />
            <span>Raise Indent &amp; Sanctions</span>
            {stats.pending > 0 && <span className="indent-hero-tab-count">{stats.pending}</span>}
          </button>

          <button
            type="button"
            className={`indent-hero-tab-btn ${activeSection === 'recommendation_log' ? 'active' : ''}`}
            onClick={() => setActiveSection('recommendation_log')}
          >
            <Layers size={15} />
            <span>Recommendation Log &amp; Assets</span>
          </button>
        </div>
      </div>

      {/* ==============================================================
          SECTION 1: RAISE INDENT & INDENT STATUS
          ============================================================== */}
      {activeSection === 'raise_indent' && (
        <>
          {/* 2. EXECUTIVE KPI CARDS GRID (5-CARDS) */}
          <div className="indent-kpi-grid">
            <div
              className={`indent-kpi-card ${filterStatus === 'ALL' ? 'active-filter' : ''}`}
              onClick={() => setFilterStatus('ALL')}
              title="Click to view all requisitions"
            >
              <div className="indent-kpi-header">
                <span className="indent-kpi-title">Total Requisitions</span>
                <div className="indent-kpi-icon-wrap blue">
                  <Boxes size={20} />
                </div>
              </div>
              <div className="indent-kpi-value">{stats.total}</div>
              <div className="indent-kpi-footer">
                <span className="indent-kpi-badge neutral">Catalog Log</span>
                <span className="indent-kpi-subtext">All filed indents</span>
              </div>
            </div>

            <div
              className={`indent-kpi-card ${filterStatus === 'Pending' ? 'active-filter' : ''}`}
              onClick={() => setFilterStatus('Pending')}
              title="Click to filter pending reviews"
            >
              <div className="indent-kpi-header">
                <span className="indent-kpi-title">Pending Sanctions</span>
                <div className="indent-kpi-icon-wrap amber">
                  <Clock size={20} />
                </div>
              </div>
              <div className="indent-kpi-value warning">
                {stats.pending}
                {stats.pending > 0 && <span className="indent-pulse-indicator" />}
              </div>
              <div className="indent-kpi-footer">
                <span className="indent-kpi-badge amber">Awaiting Admin</span>
                <span className="indent-kpi-subtext">Action required</span>
              </div>
            </div>

            <div
              className={`indent-kpi-card ${filterStatus === 'Approved' ? 'active-filter' : ''}`}
              onClick={() => setFilterStatus('Approved')}
              title="Click to filter approved requisitions"
            >
              <div className="indent-kpi-header">
                <span className="indent-kpi-title">Approved by Admin</span>
                <div className="indent-kpi-icon-wrap emerald">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="indent-kpi-value success">{stats.approved}</div>
              <div className="indent-kpi-footer">
                <span className="indent-kpi-badge emerald">Store Authorized</span>
                <span className="indent-kpi-subtext">Sanction granted</span>
              </div>
            </div>

            <div
              className={`indent-kpi-card ${filterStatus === 'Issued' ? 'active-filter' : ''}`}
              onClick={() => setFilterStatus('Issued')}
              title="Click to filter store issued"
            >
              <div className="indent-kpi-header">
                <span className="indent-kpi-title">Store Dispatched</span>
                <div className="indent-kpi-icon-wrap sky">
                  <PackageCheck size={20} />
                </div>
              </div>
              <div className="indent-kpi-value sky">{stats.issued}</div>
              <div className="indent-kpi-footer">
                <span className="indent-kpi-badge sky">Delivered</span>
                <span className="indent-kpi-subtext">Issued to hostels</span>
              </div>
            </div>

            <div className="indent-kpi-card">
              <div className="indent-kpi-header">
                <span className="indent-kpi-title">Est. Procurement Value</span>
                <div className="indent-kpi-icon-wrap purple">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="indent-kpi-value purple">
                ₹{stats.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="indent-kpi-footer">
                <span className="indent-kpi-badge purple">Budget Supervised</span>
                <span className="indent-kpi-subtext">Campus allocation</span>
              </div>
            </div>
          </div>

          {/* 3. PENDING ACTION ALERT BANNER */}
          {stats.pending > 0 && showWarningBanner && (
            <div className="indent-alert-banner">
              <div className="indent-alert-left">
                <div className="indent-alert-icon-box">
                  <AlertTriangle size={20} />
                </div>
                <div className="indent-alert-text">
                  {isHostelAdmin ? (
                    <><strong>Administrative Action Required:</strong> You have <strong>{stats.pending} pending requisition(s)</strong> awaiting Hostel Admin review and procurement sanction.</>
                  ) : (
                    <><strong>Requisitions Awaiting Review:</strong> You have <strong>{stats.pending} pending requisition(s)</strong> awaiting Hostel Admin sanction &amp; store issuance.</>
                  )}
                </div>
              </div>
              <div className="indent-alert-actions">
                <button
                  type="button"
                  className="indent-alert-btn-filter"
                  onClick={() => setFilterStatus('Pending')}
                >
                  Review Pending ({stats.pending})
                </button>
                <button
                  type="button"
                  className="indent-alert-close-btn"
                  onClick={() => setShowWarningBanner(false)}
                  title="Dismiss alert"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* 4. CONTROLS & FILTER TOOLBAR */}
          <div className="indent-toolbar-card">
            {/* Top Toolbar Row: Search + Action Buttons */}
            <div className="indent-toolbar-top-row">
              <div className="indent-search-box-modern">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by Indent #, Material, Code, Purpose, Warden..."
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                />
                {filterSearch && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setFilterSearch('')}
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="indent-action-buttons-group">
                <button
                  type="button"
                  className="indent-btn-action-primary"
                  onClick={() => setIsRaiseModalOpen(true)}
                  title="Raise New Material Indent"
                >
                  <Plus size={15} />
                  <span>Raise Indent</span>
                </button>

                <button
                  type="button"
                  className="indent-btn-action-outline red"
                  onClick={() => window.print()}
                  title="Export Indent Register to PDF"
                >
                  <Printer size={14} />
                  <span>PDF Export</span>
                </button>

                <button
                  type="button"
                  className="indent-btn-action-outline blue"
                  onClick={() => showToast('Exporting requisition register to Excel spreadsheet...')}
                  title="Export Indent Register to Excel"
                >
                  <FileSpreadsheet size={14} />
                  <span>Excel Export</span>
                </button>

                <button
                  type="button"
                  className="indent-btn-action-ghost"
                  onClick={() => {
                    const def = resetIndentsToDefault();
                    setIndents(def);
                    setFilterSearch('');
                    setFilterMaterial('ALL');
                    setFilterRaisedBy('ALL');
                    setFilterStatus('ALL');
                    showToast('Indent records reset to university sample defaults.');
                  }}
                  title="Reset to default sample data"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Bottom Toolbar Row: Status Pills + Dropdown Filters */}
            <div className="indent-toolbar-bottom-row">
              <div className="indent-status-pills-wrap">
                <span className="filter-pill-label">Status:</span>
                {[
                  { id: 'ALL', label: 'All', count: stats.total },
                  { id: 'Pending', label: 'Pending', count: stats.pending, alert: stats.pending > 0 },
                  { id: 'Approved', label: 'Approved', count: stats.approved },
                  { id: 'Issued', label: 'Issued', count: stats.issued },
                  { id: 'Rejected', label: 'Rejected', count: stats.rejected }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`indent-status-pill ${filterStatus === tab.id ? 'active' : ''} ${tab.alert ? 'has-alert' : ''}`}
                    onClick={() => setFilterStatus(tab.id)}
                  >
                    <span>{tab.label}</span>
                    <span className="pill-badge">{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="indent-select-filters-wrap">
                {/* Material Catalog Filter */}
                <div className="indent-select-filter">
                  <Filter size={13} className="select-icon" />
                  <select
                    value={filterMaterial}
                    onChange={e => setFilterMaterial(e.target.value)}
                  >
                    <option value="ALL">All Materials</option>
                    {PRESET_MATERIALS.filter(m => m.name !== 'CUSTOM_ITEM').map(m => (
                      <option key={m.code} value={m.name}>{m.name}</option>
                    ))}
                    <option value="Custom">Custom Items Only</option>
                  </select>
                </div>

                {/* Raised By Warden Filter */}
                <div className="indent-select-filter">
                  <User size={13} className="select-icon" />
                  <select
                    value={filterRaisedBy}
                    onChange={e => setFilterRaisedBy(e.target.value)}
                  >
                    <option value="ALL">All Requisitioners</option>
                    <option value="Tanmaya">Tanmaya Kumar Routray</option>
                    <option value="Nibedita">Mrs. Nibedita Das</option>
                    <option value="Debendra">Mr. Debendra Sahoo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 5. MAIN MODERN REQUISITION REGISTER TABLE */}
          <div className="indent-table-card">
            <div className="indent-table-card-header">
              <div className="indent-table-title-area">
                <div className="indent-table-title">
                  <Boxes size={18} color="#2563eb" />
                  <h3>Requisition Register &amp; Sanctions Console</h3>
                  <span className="indent-count-pill">{filteredIndents.length} Requisitions</span>
                </div>
                <p className="indent-table-subtitle">
                  Review real-time warden indents, approve procurement budgets, and track store dispatches.
                </p>
              </div>

              {(filterStatus !== 'ALL' || filterSearch || filterMaterial !== 'ALL' || filterRaisedBy !== 'ALL') && (
                <button
                  type="button"
                  className="indent-clear-filters-btn"
                  onClick={() => {
                    setFilterSearch('');
                    setFilterMaterial('ALL');
                    setFilterRaisedBy('ALL');
                    setFilterStatus('ALL');
                  }}
                >
                  <RotateCcw size={12} /> Clear Active Filters
                </button>
              )}
            </div>

            <div className="indent-table-scroll-wrap">
              <table className="indent-modern-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                    <th style={{ minWidth: '145px' }}>Requisition No.</th>
                    <th style={{ minWidth: '220px' }}>Material Name</th>
                    <th style={{ width: '90px' }}>Code</th>
                    <th style={{ width: '105px' }}>Quantity</th>
                    <th style={{ width: '115px' }}>Approx Cost</th>
                    <th style={{ minWidth: '150px' }}>Purpose / Block</th>
                    <th style={{ width: '115px' }}>Expected Date</th>
                    <th style={{ minWidth: '175px' }}>Raised By</th>
                    <th style={{ width: '135px' }}>Current Level</th>
                    <th style={{ width: '95px', textAlign: 'center' }}>Approval</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>Issued?</th>
                    <th style={{ minWidth: '165px', textAlign: 'center' }}>
                      {isHostelAdmin ? 'Administrative Action' : 'Requisition Actions'}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIndents.length === 0 ? (
                    <tr>
                      <td colSpan={13} style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                        <Boxes size={36} color="#cbd5e1" style={{ margin: '0 auto 10px', display: 'block' }} />
                        <strong style={{ fontSize: '1rem', color: '#1e293b' }}>No requisitions matching selected filters</strong>
                        <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                          Try clearing search criteria or adjusting the status pill filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredIndents.map((item) => {
                      const isExpanded = expandedRowId === item.id;
                      return (
                        <React.Fragment key={item.id}>
                          <tr className={item.status === 'Pending' ? 'row-pending' : ''}>
                            {/* Expand Chevron Column */}
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className={`indent-expand-btn ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                                title={isExpanded ? 'Collapse row details' : 'Expand full requisition details'}
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                            </td>

                            {/* Requisition/Indent No */}
                            <td>
                              <span
                                className="indent-id-badge"
                                onClick={() => setSelectedIndentDetail(item)}
                                title="Click to view full Requisition Dossier &amp; Form"
                              >
                                #{item.indentNo}
                              </span>
                            </td>

                            {/* Material Name */}
                            <td>
                              <div className="indent-material-name">{item.materialName}</div>
                              {item.isCustom && (
                                <span className="custom-item-chip">
                                  <Sparkles size={11} color="#d97706" /> Custom Item
                                </span>
                              )}
                              {item.remarks && (
                                <div className="indent-remarks-note">
                                  "{item.remarks.slice(0, 55)}{item.remarks.length > 55 ? '...' : ''}"
                                </div>
                              )}
                            </td>

                            {/* Code */}
                            <td>
                              <span className="indent-code-pill">{item.code}</span>
                            </td>

                            {/* Quantity */}
                            <td>
                              <span className="indent-qty-pill">
                                {item.quantity} <small style={{ color: '#64748b', fontWeight: 600 }}>{item.unit}</small>
                              </span>
                            </td>

                            {/* Approx Cost */}
                            <td>
                              <span className="indent-cost-text">
                                {item.approxCost ? `₹${item.approxCost}` : '—'}
                              </span>
                            </td>

                            {/* Purpose / Scope */}
                            <td>
                              <span className="purpose-pill" title={item.purpose}>
                                <Building size={12} color="#2563eb" />
                                {item.purpose}
                              </span>
                            </td>

                            {/* Expected Date */}
                            <td>
                              <span className="date-pill">
                                <Calendar size={12} />
                                {item.expectedDate || '—'}
                              </span>
                            </td>

                            {/* Raised By Warden */}
                            <td>
                              <div className="indent-raised-by-wrap">
                                <div className="indent-mini-avatar">
                                  {getWardenInitials(item.raisedBy)}
                                </div>
                                <div className="indent-raised-by-meta">
                                  <strong>{item.raisedBy}</strong>
                                  <small>Hostel Warden</small>
                                </div>
                              </div>
                            </td>

                            {/* Current Level */}
                            <td>
                              <span className={`level-pill ${
                                item.currentLevel?.toLowerCase().includes('dispatched') ? 'store-dispatched' :
                                item.currentLevel?.toLowerCase().includes('issued') ? 'store-issued' :
                                item.currentLevel?.toLowerCase().includes('rejected') ? 'rejected' :
                                'pending-review'
                              }`}>
                                {item.currentLevel || 'Level-1 (Pending Review)'}
                              </span>
                            </td>

                            {/* Approval Status Icon */}
                            <td style={{ textAlign: 'center' }}>
                              {item.isApproved ? (
                                <div className="icon-check-circle" title="Approved by Hostel Administration">
                                  <Check size={14} />
                                </div>
                              ) : item.status === 'Rejected' ? (
                                <div className="icon-rejected-cross" title="Rejected by Admin">
                                  <X size={14} />
                                </div>
                              ) : (
                                <div className="icon-pending-clock" title="Pending Admin Review">
                                  <Clock size={14} />
                                </div>
                              )}
                            </td>

                            {/* Issued Status Icon */}
                            <td style={{ textAlign: 'center' }}>
                              {item.issued ? (
                                <div className="icon-check-circle" title="Material Dispatched by Central Store">
                                  <Check size={14} />
                                </div>
                              ) : (
                                <div className="icon-pending-clock" title="Awaiting Store Issuance">
                                  <Clock size={14} />
                                </div>
                              )}
                            </td>

                            {/* Action Column */}
                            <td style={{ textAlign: 'center' }}>
                              <div className="indent-action-cell-group">
                                {isHostelAdmin ? (
                                  <>
                                    {item.status === 'Pending' ? (
                                      <>
                                        <button
                                          type="button"
                                          className="btn-action-modern approve"
                                          onClick={() => handleApprove(item.id)}
                                          title="Approve Indent &amp; Authorize Store"
                                        >
                                          <Check size={12} /> Approve
                                        </button>
                                        <button
                                          type="button"
                                          className="btn-action-modern reject"
                                          onClick={() => handleReject(item.id)}
                                          title="Reject Indent"
                                        >
                                          <X size={12} /> Reject
                                        </button>
                                      </>
                                    ) : item.isApproved && !item.issued ? (
                                      <button
                                        type="button"
                                        className="btn-action-modern issue"
                                        onClick={() => handleMarkIssued(item.id)}
                                        title="Mark as Material Issued &amp; Dispatched"
                                      >
                                        <PackageCheck size={12} /> Issue Item
                                      </button>
                                    ) : item.issued ? (
                                      <span className="indent-completed-badge">
                                        <CheckCircle2 size={12} /> Completed
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700 }}>
                                        Rejected
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      className="btn-action-modern view"
                                      onClick={() => setSelectedIndentDetail(item)}
                                      title="View Full Specification Slip"
                                    >
                                      <Eye size={12} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="btn-action-modern view"
                                      onClick={() => setSelectedIndentDetail(item)}
                                      title="View Full Specification Slip"
                                    >
                                      <Eye size={12} /> Dossier
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-action-modern view"
                                      onClick={() => {
                                        setSelectedIndentDetail(item);
                                        setTimeout(() => window.print(), 300);
                                      }}
                                      title="Print Indent Voucher"
                                    >
                                      <Printer size={12} /> Slip
                                    </button>
                                    {item.status === 'Pending' && (
                                      <button
                                        type="button"
                                        className="btn-action-modern reject"
                                        onClick={() => {
                                          if (window.confirm(`Cancel pending requisition #${item.indentNo || item.id}?`)) {
                                            deleteIndent(item.id);
                                            setIndents(getAllIndents());
                                            showToast(`Requisition #${item.indentNo || item.id} cancelled.`);
                                          }
                                        }}
                                        title="Cancel Pending Requisition"
                                      >
                                        <X size={12} /> Cancel
                                      </button>
                                    )}
                                    {item.issued && (
                                      <span className="indent-completed-badge">
                                        <CheckCircle2 size={12} /> Received
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* 6. EXPANDED INLINE ROW DOSSIER */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={13} style={{ padding: '0 14px 14px', background: '#f8fafc' }}>
                                <div className="indent-expanded-dossier-card">
                                  <div className="indent-dossier-grid">
                                    <div className="indent-dossier-col">
                                      <h5><Boxes size={14} color="#2563eb" /> Item Details &amp; Pricing</h5>
                                      <div className="indent-dossier-text-box">
                                        <div><strong>Material:</strong> {item.materialName} ({item.code})</div>
                                        <div><strong>Quantity Required:</strong> {item.quantity} {item.unit}</div>
                                        <div><strong>Estimated Total Cost:</strong> ₹{item.approxCost}</div>
                                        <div><strong>Expected Requirement Date:</strong> {item.expectedDate}</div>
                                      </div>
                                    </div>

                                    <div className="indent-dossier-col">
                                      <h5><ClipboardList size={14} color="#059669" /> Justification &amp; Purpose</h5>
                                      <div className="indent-dossier-text-box">
                                        <div><strong>Target Hostel / Area:</strong> {item.purpose}</div>
                                        <div><strong>Warden Justification:</strong> {item.remarks || 'Standard hostel operating requirements.'}</div>
                                        <div><strong>Requisitioner:</strong> {item.raisedBy}</div>
                                      </div>
                                    </div>

                                    <div className="indent-dossier-col">
                                      <h5><ShieldCheck size={14} color="#7c3aed" /> Administrative Sanction Status</h5>
                                      <div className="indent-dossier-text-box">
                                        <div><strong>Current Level:</strong> {item.currentLevel}</div>
                                        <div><strong>Approval:</strong> {item.isApproved ? `Approved by ${item.approvedBy || 'Hostel Admin'}` : item.status}</div>
                                        <div><strong>Store Issuance:</strong> {item.issued ? 'Issued to hostel blocks' : 'Awaiting physical dispatch'}</div>
                                        <div style={{ marginTop: '8px' }}>
                                          <button
                                            type="button"
                                            className="indent-btn-action-outline blue"
                                            onClick={() => setSelectedIndentDetail(item)}
                                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                                          >
                                            <FileText size={12} /> Open Full Dossier View
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ==============================================================
          SECTION 2: RECOMMENDATION LOG & ASSET REGISTRY
          ============================================================== */}
      {activeSection === 'recommendation_log' && (
        <div className="indent-section-body" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="#2563eb" />
                Warden Recommendation Log &amp; Hostel Asset Register
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Audit log of warden recommended equipment, maintenance requisitions, and room inventory assets under campus custody.
              </p>
            </div>
            <button
              type="button"
              className="indent-btn-action-outline red"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Print Asset Register
            </button>
          </div>

          <div className="recommendation-grid">
            <div className="rec-summary-card">
              <h4><ClipboardList size={18} color="#2563eb" /> Warden Requisition Log Summary</h4>
              <div className="rec-metric-row">
                <span>Total Indents Recommended by Warden:</span>
                <strong>{indents.length} Items</strong>
              </div>
              <div className="rec-metric-row">
                <span>Sanctioned by Hostel Admin:</span>
                <strong style={{ color: '#059669' }}>{stats.approved} ({indents.length > 0 ? Math.round((stats.approved / indents.length) * 100) : 0}%)</strong>
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
              <h4><Building size={18} color="#059669" /> Residential Hostel Asset Inventory</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 10px 0' }}>
                Existing fixed assets under warden custody across hostel blocks:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mockInventoryAssets.slice(0, 4).map(asset => (
                  <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span><strong>{asset.name}</strong> ({asset.hostel})</span>
                    <span style={{ fontWeight: 800, color: '#1e3a8a' }}>{asset.inUse} / {asset.totalQty} Units</span>
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
                <label className="required">Material Name</label>
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
                    <Sparkles size={14} color="#0284c7" /> Specify Custom Material Name
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
                  <label className="required">Quantity</label>
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
                  <label className="required">Estimated Approx Cost (RS.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.approxCost}
                    onChange={e => setFormData({ ...formData, approxCost: e.target.value })}
                    required
                  />
                </div>

                <div className="iform-group">
                  <label className="required">Expected Requirement Date</label>
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
                <label className="required">Purpose / Hostel Block</label>
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
          <div className="indent-modal-card large-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '980px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="indent-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', padding: '1.15rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Requisition Dossier &amp; Form Details — #{selectedIndentDetail.indentNo}</h3>
              </div>
              <button
                type="button"
                className="indent-modal-close"
                onClick={() => setSelectedIndentDetail(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="indent-modal-body" style={{ padding: '1.5rem' }}>
              <RequisitionFormDetailView
                item={selectedIndentDetail}
                isHostelAdmin={isHostelAdmin}
                isModal={true}
                onApprove={(id) => {
                  handleApprove(id);
                  setSelectedIndentDetail(prev => ({ ...prev, isApproved: true, status: 'Approved', currentLevel: 'Level-2 (Store Issued)' }));
                }}
                onReject={(id) => {
                  handleReject(id);
                  setSelectedIndentDetail(prev => ({ ...prev, isApproved: false, status: 'Rejected', currentLevel: 'Rejected' }));
                }}
                onIssue={(id) => {
                  handleMarkIssued(id);
                  setSelectedIndentDetail(prev => ({ ...prev, issued: true, status: 'Approved & Issued', currentLevel: 'Store Dispatched' }));
                }}
                onClose={() => setSelectedIndentDetail(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
