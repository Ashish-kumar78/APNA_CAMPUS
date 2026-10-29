import React, { useState, useMemo } from 'react';
import {
  Layers,
  Package,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RotateCcw,
  X,
  FileText,
  Download,
  Check,
  ChevronDown,
  Wrench,
  ShieldCheck,
  Printer,
  Sparkles,
  LayoutDashboard,
  ClipboardList,
  Send,
  FileSpreadsheet,
  Paperclip,
  Trash2,
  Eye,
  Flame,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Info,
  ShieldAlert,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import {
  getAllIndents,
  raiseNewIndent,
  deleteIndent,
  PRESET_MATERIALS
} from '../../services/hostelIndentStore.js';
import './WardenInventoryRequisition.css';

// 13 REQUIRED REQUEST TYPES
const REQUEST_TYPES = [
  'Furniture Request',
  'Electrical Problem',
  'Plumbing Problem',
  'Civil / Building Maintenance',
  'Cleaning Materials',
  'Bedding & Mattresses',
  'Room Equipment',
  'Safety & Security Equipment',
  'General Hostel Supplies',
  'Repair of Existing Item',
  'Replacement of Damaged Item',
  'New Product / Material',
  'Other'
];

// UNITS
const UNITS = [
  'Pieces',
  'Sets',
  'Boxes',
  'Packets',
  'Litres',
  'Kilograms',
  'Metres',
  'Other'
];

// AUTHORIZED HOSTELS FOR WARDEN
const AUTHORIZED_HOSTELS = [
  "BPUT Boy's Hostel 1 (Kalam Block)",
  "BPUT Boy's Hostel 2 (Raman Block)",
  "Sarojini Girls Hostel (Block A)",
  "Sarojini Girls Hostel (Block B)",
  "Aryabhatta International Hostel"
];

// CURATED RECOMMENDATIONS FOR HOSTEL WARDEN
const RECOMMENDATIONS = [
  {
    id: 'rec-1',
    category: 'Electrical Problem',
    title: 'Ceiling Fan 1200mm (Crompton)',
    productName: 'Ceiling Fan 1200mm (Crompton)',
    unit: 'Pieces',
    defaultQty: 2,
    approxCost: 1420.00,
    desc: 'High-speed energy efficient 1200mm sweep ceiling fan for student study rooms.',
    recommendedFor: 'Room fan replacement during summer and mid-semester exams.',
    priority: 'High'
  },
  {
    id: 'rec-2',
    category: 'Bedding & Mattresses',
    title: 'Single Bed Coir Mattress (72x36x4)',
    productName: 'Single Bed Coir Mattress (72x36x4)',
    unit: 'Pieces',
    defaultQty: 4,
    approxCost: 1850.00,
    desc: 'Heavy-density orthopaedic coir mattress designed for standard college hostel steel cots.',
    recommendedFor: 'Semester resident bed overhaul and worn-out mattress replacement.',
    priority: 'Medium'
  },
  {
    id: 'rec-3',
    category: 'Repair of Existing Item',
    title: 'Aluminium Door Stay Handle & Lock Set',
    productName: 'Aluminium door Stay Handle & lock',
    unit: 'Pieces',
    defaultQty: 6,
    approxCost: 120.50,
    desc: 'Heavy-duty mortise door handle, latch set, and safety lock for resident student privacy.',
    recommendedFor: 'Corridor door latch repairs and damaged key tumbler fixes.',
    priority: 'Urgent'
  },
  {
    id: 'rec-4',
    category: 'Electrical Problem',
    title: 'LED Tube Light 20W (Surya)',
    productName: 'LED Tube Light 20W (Surya)',
    unit: 'Pieces',
    defaultQty: 10,
    approxCost: 195.00,
    desc: 'Energy efficient cool daylight batten tube light for student study desks and common corridors.',
    recommendedFor: 'Routine block lighting maintenance & fused tube replacement.',
    priority: 'High'
  },
  {
    id: 'rec-5',
    category: 'Plumbing Problem',
    title: 'Shower Spindle 7mm & CPVC Sockets',
    productName: 'Shower Spindle 7mm',
    unit: 'Pieces',
    defaultQty: 8,
    approxCost: 165.00,
    desc: 'Brass shower valve spindle and heavy pressure CPVC pipe connectors for washrooms.',
    recommendedFor: 'Bathroom leak mitigation and washroom fixture repairs.',
    priority: 'High'
  },
  {
    id: 'rec-6',
    category: 'Cleaning Materials',
    title: 'Heavy Duty Rubber Cleaning Gloves',
    productName: 'Gloves (G) Rubber Heavy Duty',
    unit: 'Sets',
    defaultQty: 5,
    approxCost: 90.00,
    desc: 'Chemical-resistant nitrile rubber gloves for hostel housekeeping and sanitation workers.',
    recommendedFor: 'Daily washroom hygiene maintenance and staff protection.',
    priority: 'Low'
  },
  {
    id: 'rec-7',
    category: 'General Hostel Supplies',
    title: 'Student Curfew Attendance Register',
    productName: 'Attendance Register Student',
    unit: 'Pieces',
    defaultQty: 2,
    approxCost: 217.11,
    desc: 'Hardbound ledger with 200 pages for night roll-call entries and curfew biometric audit.',
    recommendedFor: 'Semester student attendance record keeping at the warden booth.',
    priority: 'Medium'
  },
  {
    id: 'rec-8',
    category: 'Safety & Security Equipment',
    title: 'Water Cooler RO Filter Candle 10"',
    productName: 'Water Cooler RO Filter Candle 10"',
    unit: 'Pieces',
    defaultQty: 4,
    approxCost: 320.00,
    desc: 'Pre-carbon and sediment RO filter candle for hostel corridor drinking water coolers.',
    recommendedFor: 'Quarterly drinking water filtration maintenance for student health.',
    priority: 'High'
  }
];

export default function WardenInventoryRequisition({ account }) {
  // Warden Identity
  const wardenName = account?.name || 'Mr. Tanmaya Kumar Routray (Hostel Warden)';
  const defaultHostel = AUTHORIZED_HOSTELS[0];

  // Navigation Tabs: 'overview' | 'create' | 'my-requests' | 'recommendations'
  const [activeTab, setActiveTab] = useState('overview');

  // Shared Indents State
  const [indents, setIndents] = useState(() => getAllIndents());
  const [toastMsg, setToastMsg] = useState(null);

  // View Mode in My Requests: 'grid' | 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Search & Filters for My Requests
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterHostel, setFilterHostel] = useState('ALL');

  // Selected Request Modal (7-Stage Details)
  const [selectedRequestModal, setSelectedRequestModal] = useState(null);

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);

  // Form State for "Create Request"
  const initialFormState = {
    id: null,
    requestType: 'Furniture Request',
    requestTitle: '',
    productName: '',
    description: '',
    quantity: 1,
    unit: 'Pieces',
    hostelName: defaultHostel,
    roomLocation: '',
    priority: 'Medium',
    expectedDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    estimatedCost: '',
    remarks: '',
    // Section B: Adaptive Details
    itemCondition: 'Damaged / Malfunctioning',
    repairPossible: 'Yes - Can be repaired on campus',
    replacementRequired: 'Yes - Complete item',
    affectedRooms: 1,
    safetyHazard: false,
    reasonJustification: 'Standard hostel maintenance requirement',
    // Section C: Attachments
    attachments: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Set of known catalog material names for detecting custom vs catalog items
  const knownCatalogNames = useMemo(() => {
    const names = new Set();
    PRESET_MATERIALS.forEach(m => {
      if (m.name && m.name !== 'CUSTOM_ITEM') names.add(m.name.toLowerCase());
    });
    [
      'study table (wooden with drawer)',
      'hostel study chair (ergonomic armrest)',
      'single bed coir mattress (72x36x4)',
      'iron study rack / bookshelf',
      'ceiling fan 1200mm',
      'ceiling fan 1200mm (crompton)',
      'led tube light 20w (surya)',
      'exhaust fan 9-inch heavy duty',
      'water tap bib cock 1/2 inch',
      'plastic cleaning bucket & mug',
      'floor disinfectant cleaning liquid',
      'mosquito repellent window netting',
      'abc dry chemical fire extinguisher 4kg',
      'door mortise lock & brass handle'
    ].forEach(n => names.add(n));
    return names;
  }, []);

  const isCustomProduct = useMemo(() => {
    if (!formData.productName || !formData.productName.trim()) return false;
    return !knownCatalogNames.has(formData.productName.trim().toLowerCase());
  }, [formData.productName, knownCatalogNames]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Re-fetch all indents from store
  const refreshIndents = () => {
    setIndents(getAllIndents());
  };

  // Calculate 4 Summary KPI Cards
  const stats = useMemo(() => {
    const nonDrafts = indents.filter(i => !i.isDraft);
    const total = nonDrafts.length;
    const pending = nonDrafts.filter(i => i.status === 'Pending Admin Approval' || i.status === 'Pending').length;
    const approved = nonDrafts.filter(i => i.isApproved || i.status === 'Approved').length;
    const issued = nonDrafts.filter(i => i.issued || i.status === 'Completed' || i.status === 'Approved & Issued').length;
    const drafts = indents.filter(i => i.isDraft).length;

    return { total, pending, approved, issued, drafts };
  }, [indents]);

  // Handle Form Change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Autocomplete change: if a recognized material is selected, prefill cost
  const handleProductNameChange = (e) => {
    const val = e.target.value;
    const matched = PRESET_MATERIALS.find(m => m.name.toLowerCase() === val.toLowerCase());
    setFormData(prev => ({
      ...prev,
      productName: val,
      estimatedCost: matched ? (matched.approxCost * (Number(prev.quantity) || 1)).toFixed(2) : prev.estimatedCost,
      unit: matched?.defaultUnit ? (matched.defaultUnit.includes('pc') ? 'Pieces' : matched.defaultUnit) : prev.unit
    }));
    if (formErrors.productName) {
      setFormErrors(prev => ({ ...prev, productName: null }));
    }
  };

  // Handle Catalog Dropdown Selection (+ Custom Material triggers manual mode)
  const handleProductDropdownChange = (e) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      setIsManualEntry(true);
      setFormData(prev => ({
        ...prev,
        productName: isCustomProduct ? prev.productName : ''
      }));
      return;
    }

    setIsManualEntry(false);
    const matched = PRESET_MATERIALS.find(m => m.name.toLowerCase() === val.toLowerCase());
    setFormData(prev => ({
      ...prev,
      productName: val,
      estimatedCost: matched && matched.approxCost ? (matched.approxCost * (Number(prev.quantity) || 1)).toFixed(2) : prev.estimatedCost,
      unit: matched?.defaultUnit ? (matched.defaultUnit.includes('pc') ? 'Pieces' : matched.defaultUnit) : prev.unit
    }));
    if (formErrors.productName) {
      setFormErrors(prev => ({ ...prev, productName: null }));
    }
  };

  const handleToggleProductMode = (manual) => {
    setIsManualEntry(manual);
  };

  // Handle Quantity Change with Auto-Calculation
  const handleQuantityChange = (qty) => {
    const num = Number(qty);
    const matched = PRESET_MATERIALS.find(m => m.name.toLowerCase() === formData.productName.toLowerCase());
    setFormData(prev => ({
      ...prev,
      quantity: qty,
      estimatedCost: matched && num > 0 ? (matched.approxCost * num).toFixed(2) : prev.estimatedCost
    }));
    if (formErrors.quantity) {
      setFormErrors(prev => ({ ...prev, quantity: null }));
    }
  };

  // Handle Attachment Upload (Frontend Only)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map(file => {
      const sizeKb = Math.round(file.size / 1024);
      const isImg = file.type.startsWith('image/');
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`,
        type: file.type,
        previewUrl: isImg ? URL.createObjectURL(file) : null
      };
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
    showToast(`${files.length} supporting attachment(s) added.`);
  };

  const removeAttachment = (attId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }));
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.requestType) errors.requestType = 'Please select a request type';
    if (!formData.requestTitle.trim()) errors.requestTitle = 'Request title is required';
    if (!formData.productName.trim()) errors.productName = 'Product / material name is required';
    if (!formData.description.trim()) errors.description = 'Please describe the problem or requirement';

    const qtyNum = Number(formData.quantity);
    if (!qtyNum || isNaN(qtyNum) || qtyNum <= 0 || !Number.isInteger(qtyNum)) {
      errors.quantity = 'Quantity must be a positive whole number greater than 0';
    }

    if (!formData.hostelName) errors.hostelName = 'Please select a hostel building';
    if (!formData.roomLocation.trim()) errors.roomLocation = 'Room or location is required (e.g., Room 204)';
    if (!formData.priority) errors.priority = 'Priority level is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Action 1: Save as Draft
  const handleSaveDraft = () => {
    if (!formData.requestTitle.trim() && !formData.productName.trim()) {
      showToast('Please enter at least a Request Title or Product Name to save a draft.');
      return;
    }

    const { newIndent } = raiseNewIndent({
      ...formData,
      isDraft: true,
      raisedBy: wardenName
    });

    refreshIndents();
    showToast(`Draft "${newIndent.requestTitle || newIndent.productName}" saved locally.`);
    setFormData(initialFormState);
    setActiveTab('my-requests');
  };

  // Form Action 2: Reset Form
  const handleResetForm = () => {
    setIsManualEntry(false);
    setFormData(initialFormState);
    setFormErrors({});
    showToast('Form reset to default.');
  };

  // Form Action 3: Trigger Submit (Opens Confirmation Modal)
  const handleInitiateSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      showToast('Please complete all required fields highlighted in red.');
      return;
    }

    // Set pending data and open confirmation modal
    setPendingSubmitData({
      ...formData,
      raisedBy: wardenName,
      isDraft: false
    });
    setIsConfirmModalOpen(true);
  };

  // Confirm Submission in Modal
  const handleConfirmSubmission = () => {
    if (!pendingSubmitData) return;

    const { newIndent } = raiseNewIndent(pendingSubmitData);
    refreshIndents();
    setIsConfirmModalOpen(false);
    setPendingSubmitData(null);
    setFormData(initialFormState);
    showToast(`Requisition #${newIndent.referenceNo} successfully submitted to Hostel Admin! Status: Pending Admin Approval.`);
    setActiveTab('my-requests');
  };

  // Use Recommendation Template
  const handleUseRecommendation = (rec) => {
    setIsManualEntry(false);
    setFormData(prev => ({
      ...prev,
      requestType: rec.category,
      requestTitle: `Requisition for ${rec.productName}`,
      productName: rec.productName,
      unit: rec.unit,
      quantity: rec.defaultQty,
      estimatedCost: (rec.approxCost * rec.defaultQty).toFixed(2),
      priority: rec.priority,
      description: `${rec.desc} Recommended purpose: ${rec.recommendedFor}`,
      roomLocation: 'Ground floor maintenance storeroom & student blocks'
    }));
    setActiveTab('create');
    showToast(`Template "${rec.title}" loaded. Customize details & location before submitting.`);
  };

  // Submit existing Draft from My Requests
  const handleSubmitExistingDraft = (draftItem) => {
    const { newIndent } = raiseNewIndent({
      ...draftItem,
      isDraft: false,
      raisedBy: wardenName
    });
    refreshIndents();
    showToast(`Draft requisition #${newIndent.referenceNo} submitted to Hostel Admin!`);
  };

  // Delete Draft
  const handleDeleteDraft = (draftId) => {
    deleteIndent(draftId);
    refreshIndents();
    showToast('Draft deleted.');
  };

  // Filtered Requests for "My Requests" tab
  const filteredRequests = useMemo(() => {
    return indents.filter(item => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        (item.referenceNo && item.referenceNo.toLowerCase().includes(q)) ||
        (item.requestTitle && item.requestTitle.toLowerCase().includes(q)) ||
        (item.productName && item.productName.toLowerCase().includes(q)) ||
        (item.roomLocation && item.roomLocation.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      // Status
      let matchStatus = true;
      if (filterStatus === 'Draft') matchStatus = Boolean(item.isDraft);
      else if (filterStatus === 'Pending Admin Approval') matchStatus = !item.isDraft && (item.status === 'Pending Admin Approval' || item.status === 'Pending');
      else if (filterStatus === 'Approved') matchStatus = !item.isDraft && (item.isApproved && !item.issued && item.status !== 'Completed');
      else if (filterStatus === 'Rejected') matchStatus = item.status === 'Rejected';
      else if (filterStatus === 'Completed') matchStatus = item.issued || item.status === 'Completed' || item.status === 'Approved & Issued';

      // Priority
      const matchPriority = filterPriority === 'ALL' || item.priority === filterPriority;

      // Type
      const matchType = filterType === 'ALL' || item.requestType === filterType;

      // Hostel
      const matchHostel = filterHostel === 'ALL' || item.hostelName === filterHostel;

      return matchSearch && matchStatus && matchPriority && matchType && matchHostel;
    });
  }, [indents, searchQuery, filterStatus, filterPriority, filterType, filterHostel]);

  // Helper for Status Badge Class & Label
  const getStatusBadge = (item) => {
    if (item.isDraft) {
      return <span className="status-badge status-draft"><Clock size={12} /> Draft</span>;
    }
    const status = item.status;
    if (status === 'Pending' || status === 'Pending Admin Approval') {
      return <span className="status-badge status-pending"><Clock size={12} /> Pending Admin Approval</span>;
    }
    if (status === 'Approved') {
      return <span className="status-badge status-approved"><CheckCircle2 size={12} /> Approved</span>;
    }
    if (status === 'Rejected') {
      return <span className="status-badge status-rejected"><AlertCircle size={12} /> Rejected</span>;
    }
    if (status === 'In Progress') {
      return <span className="status-badge status-in-progress"><Clock size={12} /> In Progress</span>;
    }
    if (status === 'Issued') {
      return <span className="status-badge status-issued"><Package size={12} /> Issued</span>;
    }
    if (status === 'Completed' || status === 'Approved & Issued') {
      return <span className="status-badge status-completed"><PackageCheck size={12} /> Completed</span>;
    }
    return <span className="status-badge status-pending">{status}</span>;
  };

  // Helper for Priority Badge
  const getPriorityBadge = (p) => {
    const priority = p || 'Medium';
    if (priority === 'Urgent') {
      return <span className="priority-badge p-urgent"><Flame size={11} /> Urgent</span>;
    }
    if (priority === 'High') {
      return <span className="priority-badge p-high">High</span>;
    }
    if (priority === 'Medium') {
      return <span className="priority-badge p-medium">Medium</span>;
    }
    return <span className="priority-badge p-low">Low</span>;
  };

  // Determine Timeline Active Stage (1 to 7)
  const getTimelineStageInfo = (req) => {
    if (!req) return { currentStep: 1, isRejected: false };
    if (req.isDraft) {
      return { currentStep: 1, isRejected: false };
    }
    if (req.status === 'Rejected') {
      return { currentStep: 4, isRejected: true };
    }
    if (req.issued || req.status === 'Completed' || req.status === 'Approved & Issued') {
      return { currentStep: 7, isRejected: false };
    }
    if (req.status === 'Issued') {
      return { currentStep: 6, isRejected: false };
    }
    if (req.status === 'In Progress') {
      return { currentStep: 5, isRejected: false };
    }
    if (req.isApproved || req.status === 'Approved') {
      return { currentStep: 4, isRejected: false };
    }
    // Default Pending Admin Approval
    return { currentStep: 2, isRejected: false };
  };

  return (
    <div className="warden-requisition-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.85rem 1.35rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.92rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ====================================================================
          A. PAGE HEADER
          ==================================================================== */}
      <div className="warden-page-header">
        <div className="warden-header-left">
          <div className="warden-header-title-row">
            <div className="warden-header-icon-wrap">
              <Layers size={24} />
            </div>
            <h1>Furniture &amp; Inventory</h1>
            <span className="warden-role-tag">
              <ShieldCheck size={13} /> Hostel Warden Requisition Portal
            </span>
          </div>
          <p className="warden-page-subtitle">
            Report hostel maintenance issues, request materials, and track requisition status.
          </p>
        </div>

        <div className="warden-header-actions">
          <button
            type="button"
            className="warden-btn-primary"
            onClick={() => setActiveTab('create')}
            title="Create a new maintenance report or material requisition"
          >
            <Plus size={18} />
            <span>+ Create New Request</span>
          </button>

          <button
            type="button"
            className="warden-btn-secondary"
            onClick={() => setActiveTab('my-requests')}
            title="Track all submitted requisitions and status"
          >
            <ClipboardList size={18} />
            <span>My Requests</span>
            <span className="warden-badge-count-pill">{stats.total}</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          B. SUMMARY CARDS (Top 4 Cards)
          ==================================================================== */}
      <div className="warden-summary-grid">
        {/* Card 1: Total Requests */}
        <div className="warden-kpi-card kpi-total">
          <div className="warden-kpi-icon">
            <Layers size={22} />
          </div>
          <div className="warden-kpi-body">
            <span className="warden-kpi-title">Total Requests</span>
            <span className="warden-kpi-number">{stats.total}</span>
            <span className="warden-kpi-sub">All hostel requisitions</span>
          </div>
        </div>

        {/* Card 2: Pending Admin Approval */}
        <div className="warden-kpi-card kpi-pending">
          <div className="warden-kpi-icon">
            <Clock size={22} />
          </div>
          <div className="warden-kpi-body">
            <span className="warden-kpi-title">Pending Admin Approval</span>
            <span className="warden-kpi-number">{stats.pending}</span>
            <span className="warden-kpi-sub">Awaiting sanction by Admin</span>
          </div>
        </div>

        {/* Card 3: Approved Requests */}
        <div className="warden-kpi-card kpi-approved">
          <div className="warden-kpi-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="warden-kpi-body">
            <span className="warden-kpi-title">Approved Requests</span>
            <span className="warden-kpi-number">{stats.approved}</span>
            <span className="warden-kpi-sub">Sanctioned by Hostel Admin</span>
          </div>
        </div>

        {/* Card 4: Completed / Issued Requests */}
        <div className="warden-kpi-card kpi-completed">
          <div className="warden-kpi-icon">
            <PackageCheck size={22} />
          </div>
          <div className="warden-kpi-body">
            <span className="warden-kpi-title">Completed / Issued Requests</span>
            <span className="warden-kpi-number">{stats.issued}</span>
            <span className="warden-kpi-sub">Materials received in hostel</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          C. MAIN NAVIGATION TABS
          ==================================================================== */}
      <div className="warden-tab-nav" role="tablist">
        <button
          type="button"
          className={`warden-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={17} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`warden-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <Plus size={17} />
          <span>Create Request</span>
        </button>

        <button
          type="button"
          className={`warden-tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-requests')}
        >
          <ClipboardList size={17} />
          <span>My Requests</span>
          {stats.pending > 0 && <span className="warden-tab-badge">{stats.pending}</span>}
        </button>

        <button
          type="button"
          className={`warden-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Sparkles size={17} />
          <span>Recommendations</span>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: OVERVIEW
          ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="warden-overview-wrap">
          {/* Welcome Banner */}
          <div className="warden-welcome-banner">
            <div className="warden-welcome-text">
              <h2>Welcome, {wardenName.split(' ')[0]} {wardenName.split(' ')[1] || ''}</h2>
              <p>
                Manage your residential block facilities, report urgent maintenance faults,
                request replacement furniture, and track sanction progress directly with the Hostel Admin.
              </p>
            </div>
            <div className="warden-assigned-box">
              <Building size={28} color="#93c5fd" />
              <div>
                <div className="hostel-badge-title">Primary Assigned Block</div>
                <div className="hostel-badge-name">{defaultHostel}</div>
              </div>
            </div>
          </div>

          {/* Quick Action Launchpad */}
          <div>
            <div className="warden-section-title-row">
              <h3>
                <Sparkles size={18} color="#2563eb" /> Quick Requisition Launchpad
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Click any shortcut to auto-populate the form
              </span>
            </div>

            <div className="warden-quick-actions-grid">
              <button
                type="button"
                className="warden-action-tile tile-urgent"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    requestType: 'Repair of Existing Item',
                    priority: 'Urgent',
                    requestTitle: 'Urgent Safety / Hazard Repair',
                    itemCondition: 'Damaged / Malfunctioning latches',
                    safetyHazard: true
                  }));
                  setActiveTab('create');
                }}
              >
                <div className="warden-tile-icon"><Flame size={20} /></div>
                <div className="warden-tile-title">Urgent Repair</div>
                <div className="warden-tile-desc">Report immediate hazard, broken door locks, or electrical fault.</div>
              </button>

              <button
                type="button"
                className="warden-action-tile tile-furniture"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    requestType: 'Furniture Request',
                    priority: 'Medium',
                    requestTitle: 'Student Room Furniture Requisition',
                    productName: 'Study table & ergonomic chair'
                  }));
                  setActiveTab('create');
                }}
              >
                <div className="warden-tile-icon"><Layers size={20} /></div>
                <div className="warden-tile-title">Room Furniture</div>
                <div className="warden-tile-desc">Request new beds, study tables, chairs, or book racks for resident rooms.</div>
              </button>

              <button
                type="button"
                className="warden-action-tile tile-electrical"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    requestType: 'Electrical Problem',
                    priority: 'High',
                    requestTitle: 'Electrical Fitting & Lighting Maintenance',
                    productName: 'LED Tube Light 20W'
                  }));
                  setActiveTab('create');
                }}
              >
                <div className="warden-tile-icon"><Wrench size={20} /></div>
                <div className="warden-tile-title">Electrical &amp; Fans</div>
                <div className="warden-tile-desc">Replace burnt ceiling fans, tubes, switches, or geyser wiring.</div>
              </button>

              <button
                type="button"
                className="warden-action-tile tile-plumbing"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    requestType: 'Plumbing Problem',
                    priority: 'High',
                    requestTitle: 'Washroom Plumbing & Water Tap Leakage',
                    productName: 'Shower Spindle 7mm & Tap'
                  }));
                  setActiveTab('create');
                }}
              >
                <div className="warden-tile-icon"><Package size={20} /></div>
                <div className="warden-tile-title">Plumbing &amp; Sanitary</div>
                <div className="warden-tile-desc">Report water leakage, clogged drains, broken taps, or RO issues.</div>
              </button>
            </div>
          </div>

          {/* 2-Column Overview: Recent Requisitions Preview & SLA Guidelines */}
          <div className="warden-overview-cols">
            <div className="warden-recent-card">
              <div className="warden-section-title-row">
                <h3>
                  <ClipboardList size={18} color="#2563eb" /> Recent Hostel Requisitions
                </h3>
                <button
                  type="button"
                  style={{
                    background: 'none', border: 'none', color: '#2563eb',
                    fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer'
                  }}
                  onClick={() => setActiveTab('my-requests')}
                >
                  View All ({stats.total}) &raquo;
                </button>
              </div>

              {indents.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 0',
                    borderBottom: '1px solid #f1f5f9',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: '#2563eb' }}>
                        {item.referenceNo}
                      </span>
                      {getPriorityBadge(item.priority)}
                    </div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.requestTitle || item.productName}
                    </span>
                    <small style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {item.productName} • {item.quantity} • {item.roomLocation}
                    </small>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    {getStatusBadge(item)}
                    <button
                      type="button"
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedRequestModal(item)}
                    >
                      Inspect Timeline
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Institutional SLA & Guidelines Card */}
            <div className="warden-info-card">
              <div className="warden-section-title-row" style={{ marginBottom: '0.2rem' }}>
                <h3>
                  <Info size={18} color="#2563eb" /> Requisition SLA &amp; Guidelines
                </h3>
              </div>

              <div className="warden-info-item">
                <Clock size={18} />
                <div>
                  <h4>Admin Review Turnaround</h4>
                  <p>Standard requisitions are evaluated and sanctioned by the Hostel Admin within 24 to 48 hours.</p>
                </div>
              </div>

              <div className="warden-info-item">
                <Flame size={18} />
                <div>
                  <h4>Urgent Priority Escalation</h4>
                  <p>Marking a requisition as "Urgent" triggers priority flags on the Admin console for same-day inspection.</p>
                </div>
              </div>

              <div className="warden-info-item">
                <Building size={18} />
                <div>
                  <h4>Store Issuance</h4>
                  <p>Once approved, the institutional store delivers materials to your warden station with a receipt voucher.</p>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                padding: '0.75rem',
                borderRadius: '10px',
                fontSize: '0.78rem',
                color: '#475569',
                lineHeight: 1.45
              }}>
                <strong>Tip:</strong> You can enter any custom material name manually. You are not restricted to existing catalog items!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: CREATE REQUEST — MAIN FEATURE
          ==================================================================== */}
      {activeTab === 'create' && (
        <div className="warden-form-container">
          <form onSubmit={handleInitiateSubmit}>
            {/* --------------------------------------------------------------
                SECTION A: REQUEST INFORMATION
                -------------------------------------------------------------- */}
            <div className="warden-form-section">
              <div className="warden-form-section-header">
                <span className="warden-section-badge">A</span>
                <div>
                  <h3>Request Information</h3>
                  <p>Define the hostel issue, item needed, quantities, location, and priority.</p>
                </div>
              </div>

              <div className="warden-form-grid">
                {/* 1. Request Type */}
                <div className="warden-form-field">
                  <label htmlFor="req-type">
                    Request Type <span className="warden-req-star">*</span>
                  </label>
                  <select
                    id="req-type"
                    className={`warden-select ${formErrors.requestType ? 'has-error' : ''}`}
                    value={formData.requestType}
                    onChange={(e) => handleInputChange('requestType', e.target.value)}
                  >
                    {REQUEST_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {formErrors.requestType && (
                    <span className="warden-field-error">{formErrors.requestType}</span>
                  )}
                </div>

                {/* 2. Request Title */}
                <div className="warden-form-field">
                  <label htmlFor="req-title">
                    Request Title <span className="warden-req-star">*</span>
                  </label>
                  <input
                    id="req-title"
                    type="text"
                    className={`warden-input ${formErrors.requestTitle ? 'has-error' : ''}`}
                    placeholder="e.g., Broken ceiling fan in Room 204"
                    value={formData.requestTitle}
                    onChange={(e) => handleInputChange('requestTitle', e.target.value)}
                  />
                  {formErrors.requestTitle && (
                    <span className="warden-field-error">{formErrors.requestTitle}</span>
                  )}
                </div>

                {/* 3. Product / Material Name (Dropdown with + Custom Material & Full Manual Writing) */}
                <div className="warden-form-field">
                  <div className="product-label-row">
                    <label htmlFor={isManualEntry ? "req-product-manual" : "req-product-select"}>
                      Product / Material Name <span className="warden-req-star">*</span>
                    </label>
                    <div className="product-mode-toggle-group">
                      <button
                        type="button"
                        className={`product-mode-pill ${!isManualEntry ? 'active' : ''}`}
                        onClick={() => handleToggleProductMode(false)}
                        title="Select from standard hostel catalog dropdown"
                      >
                        <Package size={12} /> Catalog Dropdown
                      </button>
                      <button
                        type="button"
                        className={`product-mode-pill ${isManualEntry ? 'active' : ''}`}
                        onClick={() => handleToggleProductMode(true)}
                        title="Write custom material name manually"
                      >
                        <Sparkles size={12} /> Write Manually
                      </button>
                    </div>
                  </div>

                  {!isManualEntry ? (
                    <div className="dropdown-mode-wrap">
                      <select
                        id="req-product-select"
                        className={`warden-select ${formErrors.productName ? 'has-error' : ''}`}
                        value={isCustomProduct ? '__CUSTOM__' : (formData.productName || '')}
                        onChange={handleProductDropdownChange}
                      >
                        <option value="">-- Select Product / Material from Catalog --</option>
                        <optgroup label="Popular Furniture & Study Equipment">
                          <option value="Study table (Wooden with drawer)">Study table (Wooden with drawer) — Approx ₹2,400</option>
                          <option value="Hostel Study Chair (Ergonomic Armrest)">Hostel Study Chair (Ergonomic Armrest) — Approx ₹1,150</option>
                          <option value="Single Bed Coir Mattress (72x36x4)">Single Bed Coir Mattress (72x36x4) — Approx ₹1,850</option>
                          <option value="Iron Study Rack / Bookshelf">Iron Study Rack / Bookshelf — Approx ₹1,650</option>
                        </optgroup>
                        <optgroup label="Electrical & Room Fixtures">
                          <option value="Ceiling fan 1200mm">Ceiling fan 1200mm (Crompton) — Approx ₹1,420</option>
                          <option value="LED Tube Light 20W (Surya)">LED Tube Light 20W (Surya) — Approx ₹195</option>
                          <option value="Exhaust Fan 9-inch Heavy Duty">Exhaust Fan 9-inch Heavy Duty — Approx ₹950</option>
                          <option value="Water tap bib cock 1/2 inch">Water tap bib cock 1/2 inch — Approx ₹180</option>
                        </optgroup>
                        <optgroup label="Maintenance, Plumbing & Hardware Catalog">
                          {PRESET_MATERIALS.filter(m => m.name !== 'CUSTOM_ITEM').map(m => (
                            <option key={m.code} value={m.name}>
                              {m.name} [{m.code}] {m.approxCost ? `— Approx ₹${m.approxCost}` : ''}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Custom / Specialized Requirement">
                          <option value="__CUSTOM__">
                            ★ + Add Custom Material (Write Manually)...
                          </option>
                        </optgroup>
                      </select>
                      {formData.productName && !isCustomProduct && (
                        <span className="warden-field-hint" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
                          <Check size={12} /> Catalog item selected. You can also click "+ Add Custom Material" or "Write Manually" to type a custom name.
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="warden-custom-product-container">
                      <div className="custom-input-with-action">
                        <input
                          id="req-product-manual"
                          list="custom-product-suggestions"
                          type="text"
                          className={`warden-input ${formErrors.productName ? 'has-error' : ''}`}
                          placeholder="Enter any product (e.g. Ceiling fan, Study table, LED tube light, Mattress...)"
                          value={formData.productName}
                          onChange={handleProductNameChange}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="switch-back-catalog-btn"
                          onClick={() => handleToggleProductMode(false)}
                          title="Switch back to dropdown selection"
                        >
                          ← Catalog Dropdown
                        </button>
                      </div>
                      <datalist id="custom-product-suggestions">
                        <option value="★ + Add Custom Material (Write Manually)" />
                        <option value="Study table (Wooden with drawer)" />
                        <option value="Hostel Study Chair (Ergonomic Armrest)" />
                        <option value="Single Bed Coir Mattress (72x36x4)" />
                        <option value="Ceiling fan 1200mm" />
                        <option value="Water tap bib cock 1/2 inch" />
                        <option value="Plastic cleaning bucket & mug" />
                        <option value="Floor disinfectant cleaning liquid" />
                        <option value="Mosquito repellent window netting" />
                        <option value="ABC Dry Chemical Fire Extinguisher 4KG" />
                        <option value="Door mortise lock & brass handle" />
                        <option value="Iron Almirah 3-Tier Rack" />
                        <option value="Water Geyser 25L Instant" />
                      </datalist>
                      <span className="warden-custom-active-tag">
                        <Sparkles size={11} /> Manual Entry Active: Type any custom product name freely.
                      </span>
                    </div>
                  )}

                  <span className="warden-field-hint">
                    Type freely or select from catalog. Manual custom names are fully supported.
                  </span>
                  {formErrors.productName && (
                    <span className="warden-field-error">{formErrors.productName}</span>
                  )}
                </div>

                {/* 5. Quantity & 6. Unit */}
                <div className="warden-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="warden-form-field">
                    <label htmlFor="req-qty">
                      Quantity <span className="warden-req-star">*</span>
                    </label>
                    <input
                      id="req-qty"
                      type="number"
                      min="1"
                      step="1"
                      className={`warden-input ${formErrors.quantity ? 'has-error' : ''}`}
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                    />
                    {formErrors.quantity && (
                      <span className="warden-field-error">{formErrors.quantity}</span>
                    )}
                  </div>

                  <div className="warden-form-field">
                    <label htmlFor="req-unit">Unit</label>
                    <select
                      id="req-unit"
                      className="warden-select"
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                    >
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 7. Hostel / Building */}
                <div className="warden-form-field">
                  <label htmlFor="req-hostel">
                    Hostel / Building <span className="warden-req-star">*</span>
                  </label>
                  <select
                    id="req-hostel"
                    className={`warden-select ${formErrors.hostelName ? 'has-error' : ''}`}
                    value={formData.hostelName}
                    onChange={(e) => handleInputChange('hostelName', e.target.value)}
                  >
                    {AUTHORIZED_HOSTELS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {formErrors.hostelName && (
                    <span className="warden-field-error">{formErrors.hostelName}</span>
                  )}
                </div>

                {/* 8. Room / Location */}
                <div className="warden-form-field">
                  <label htmlFor="req-room">
                    Room / Location <span className="warden-req-star">*</span>
                  </label>
                  <input
                    id="req-room"
                    type="text"
                    className={`warden-input ${formErrors.roomLocation ? 'has-error' : ''}`}
                    placeholder="e.g., Room 204 / 2nd Floor Corridor / Study Room / Bathroom Block"
                    value={formData.roomLocation}
                    onChange={(e) => handleInputChange('roomLocation', e.target.value)}
                  />
                  {formErrors.roomLocation && (
                    <span className="warden-field-error">{formErrors.roomLocation}</span>
                  )}
                </div>

                {/* 9. Priority Selection */}
                <div className="warden-form-field full-width">
                  <label>
                    Priority Level <span className="warden-req-star">*</span>
                  </label>
                  <div className="warden-priority-pills">
                    {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`warden-priority-pill p-${p.toLowerCase()} ${formData.priority === p ? `selected p-${p.toLowerCase()}` : ''}`}
                        onClick={() => handleInputChange('priority', p)}
                      >
                        {p === 'Urgent' && <Flame size={14} color="#dc2626" />}
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>

                  {formData.priority === 'Urgent' && (
                    <div className="warden-urgent-alert-notice">
                      <AlertTriangle size={16} />
                      <span>
                        Urgent priority should be reserved for electrical risks, water floods, or safety issues requiring immediate admin intervention.
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Request Description */}
                <div className="warden-form-field full-width">
                  <label htmlFor="req-desc">
                    Request Description <span className="warden-req-star">*</span>
                  </label>
                  <textarea
                    id="req-desc"
                    rows={4}
                    className={`warden-textarea ${formErrors.description ? 'has-error' : ''}`}
                    placeholder="Describe the problem, why the item is needed, its current condition, and any additional information..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                  {formErrors.description && (
                    <span className="warden-field-error">{formErrors.description}</span>
                  )}
                </div>

                {/* 10. Expected Date & 11. Estimated Cost */}
                <div className="warden-form-field">
                  <label htmlFor="req-exp-date">Expected Completion Date</label>
                  <input
                    id="req-exp-date"
                    type="date"
                    className="warden-input"
                    value={formData.expectedDate}
                    onChange={(e) => handleInputChange('expectedDate', e.target.value)}
                  />
                </div>

                <div className="warden-form-field">
                  <label htmlFor="req-cost">Estimated Total Cost (₹, Optional)</label>
                  <input
                    id="req-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    className="warden-input"
                    placeholder="Estimated cost if known (e.g. 1420.00)"
                    value={formData.estimatedCost}
                    onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                  />
                  <span className="warden-field-hint">
                    Official rates will be validated by the college purchase committee.
                  </span>
                </div>

                {/* 12. Additional Remarks */}
                <div className="warden-form-field full-width">
                  <label htmlFor="req-remarks">Additional Remarks (Optional)</label>
                  <textarea
                    id="req-remarks"
                    rows={2}
                    className="warden-textarea"
                    placeholder="Any gate access instructions, delivery time slots, or special technician notes..."
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------
                SECTION B: PROBLEM AND PRODUCT DETAILS (Adaptive)
                -------------------------------------------------------------- */}
            <div className="warden-form-section">
              <div className="warden-form-section-header">
                <span className="warden-section-badge">B</span>
                <div>
                  <h3>Problem &amp; Condition Details</h3>
                  <p>Adaptive diagnostic indicators tailored to your selected request type.</p>
                </div>
              </div>

              <div className="warden-adaptive-box">
                {/* Condition & Repairability */}
                <div className="warden-form-grid">
                  <div className="warden-form-field">
                    <label>Current Item Condition</label>
                    <select
                      className="warden-select"
                      value={formData.itemCondition}
                      onChange={(e) => handleInputChange('itemCondition', e.target.value)}
                    >
                      <option value="Damaged / Malfunctioning">Damaged / Malfunctioning</option>
                      <option value="Severely Worn Out / Broken">Severely Worn Out / Broken</option>
                      <option value="Completely Inoperable">Completely Inoperable</option>
                      <option value="Leaking Water / Sparking Wire">Leaking Water / Sparking Wire</option>
                      <option value="Brand New Requirement">Brand New Requirement</option>
                    </select>
                  </div>

                  <div className="warden-form-field">
                    <label>Is On-Campus Repair Possible?</label>
                    <select
                      className="warden-select"
                      value={formData.repairPossible}
                      onChange={(e) => handleInputChange('repairPossible', e.target.value)}
                    >
                      <option value="Yes - Can be repaired on campus">Yes - Can be repaired on campus by technician</option>
                      <option value="No - Needs full replacement">No - Needs full replacement from store</option>
                      <option value="Uncertain - Technical assessment needed">Uncertain - Technical assessment needed</option>
                    </select>
                  </div>

                  <div className="warden-form-field">
                    <label>Replacement Required?</label>
                    <select
                      className="warden-select"
                      value={formData.replacementRequired}
                      onChange={(e) => handleInputChange('replacementRequired', e.target.value)}
                    >
                      <option value="Yes - Complete item">Yes - Complete item replacement</option>
                      <option value="No - Spare parts only">No - Only specific spare parts needed</option>
                      <option value="Evaluation needed">To be determined by Admin review</option>
                    </select>
                  </div>

                  <div className="warden-form-field">
                    <label>Number of Affected Rooms / Students</label>
                    <input
                      type="number"
                      min="1"
                      className="warden-input"
                      value={formData.affectedRooms}
                      onChange={(e) => handleInputChange('affectedRooms', e.target.value)}
                    />
                  </div>
                </div>

                {/* Safety Hazard Checkbox */}
                <label className="warden-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.safetyHazard}
                    onChange={(e) => handleInputChange('safetyHazard', e.target.checked)}
                  />
                  <span>
                    Item presents an active safety hazard to resident students (e.g. electrical shock, loose fixtures, slipping hazard)
                  </span>
                </label>
              </div>
            </div>

            {/* --------------------------------------------------------------
                SECTION C: ATTACHMENTS (Supporting Evidence)
                -------------------------------------------------------------- */}
            <div className="warden-form-section">
              <div className="warden-form-section-header">
                <span className="warden-section-badge">C</span>
                <div>
                  <h3>Supporting Attachments</h3>
                  <p>Attach photographs of damaged furniture, leaks, broken fittings, or quotations.</p>
                </div>
              </div>

              <label className="warden-upload-dropzone">
                <Paperclip size={28} />
                <span>Click or drag photos and documents here</span>
                <small>Supports PNG, JPG, PDF up to 5MB per file</small>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </label>

              {formData.attachments.length > 0 && (
                <div className="warden-attachment-previews">
                  {formData.attachments.map(att => (
                    <div key={att.id} className="warden-attachment-tile">
                      {att.previewUrl ? (
                        <img src={att.previewUrl} alt={att.name} className="warden-attachment-thumb" />
                      ) : (
                        <div className="warden-attachment-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={20} color="#2563eb" />
                        </div>
                      )}
                      <div className="warden-attachment-meta">
                        <span title={att.name}>{att.name}</span>
                        <small>{att.size}</small>
                      </div>
                      <button
                        type="button"
                        className="warden-remove-attach-btn"
                        onClick={() => removeAttachment(att.id)}
                        title="Remove attachment"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------
                SECTION D: FORM ACTIONS
                -------------------------------------------------------------- */}
            <div className="warden-form-actions-bar">
              <button
                type="button"
                className="warden-btn-draft"
                onClick={handleSaveDraft}
                title="Save this requisition locally as a draft"
              >
                <FileText size={17} />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                className="warden-btn-reset"
                onClick={handleResetForm}
                title="Clear all inputs"
              >
                <RotateCcw size={17} />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                className="warden-btn-submit"
                title="Submit this requisition to the Hostel Admin for review"
              >
                <Send size={18} />
                <span>Submit to Hostel Admin</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          TAB 3: MY REQUESTS — REQUEST TRACKING
          ==================================================================== */}
      {activeTab === 'my-requests' && (
        <div className="warden-tracking-wrap">
          {/* Filter Bar */}
          <div className="warden-filter-bar">
            {/* Search */}
            <div className="warden-search-box">
              <Search size={16} />
              <input
                type="text"
                className="warden-search-input"
                placeholder="Search by title, product, reference, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Selects */}
            <div className="warden-filter-selects">
              {/* Status */}
              <select
                className="warden-filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending Admin Approval">Pending Admin Approval</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed / Issued</option>
                <option value="Rejected">Rejected</option>
                <option value="Draft">Drafts</option>
              </select>

              {/* Priority */}
              <select
                className="warden-filter-select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Request Type */}
              <select
                className="warden-filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">All Request Types</option>
                {REQUEST_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Hostel */}
              <select
                className="warden-filter-select"
                value={filterHostel}
                onChange={(e) => setFilterHostel(e.target.value)}
              >
                <option value="ALL">All Hostels</option>
                {AUTHORIZED_HOSTELS.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="warden-view-toggle">
                <button
                  type="button"
                  className={`warden-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Card Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className={`warden-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="ERP Table View"
                >
                  <TableIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: '#64748b',
            padding: '0 0.25rem'
          }}>
            <span>Showing <strong>{filteredRequests.length}</strong> requisition record(s)</span>
            {searchQuery && (
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>

          {/* VIEW 1: MODERN CARD GRID */}
          {viewMode === 'grid' && (
            <div className="warden-requests-grid">
              {filteredRequests.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <Package size={40} color="#94a3b8" />
                  <h4 style={{ margin: '0.75rem 0 0.25rem 0', color: '#334155' }}>No requisitions match your filter criteria</h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                    Try clearing filters or click "+ Create New Request" to raise a new report.
                  </p>
                </div>
              ) : (
                filteredRequests.map(req => (
                  <div key={req.id} className="warden-req-card">
                    {/* Top Row */}
                    <div className="warden-card-top-row">
                      <span className="warden-card-ref">{req.referenceNo}</span>
                      <div className="warden-card-badges">
                        {getPriorityBadge(req.priority)}
                        {getStatusBadge(req)}
                      </div>
                    </div>

                    {/* Title & Product */}
                    <div className="warden-card-body">
                      <div className="warden-card-title">{req.requestTitle || req.productName}</div>
                      <div className="warden-card-prod">
                        <Wrench size={13} color="#64748b" />
                        <span>{req.productName}</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="warden-card-details-grid">
                      <div className="warden-card-kv">
                        <small>Quantity</small>
                        <span>{req.quantity}</span>
                      </div>
                      <div className="warden-card-kv">
                        <small>Approx Cost</small>
                        <span>{req.approxCost || `₹${req.estimatedCost || '0.00'}`}</span>
                      </div>
                      <div className="warden-card-kv">
                        <small>Location</small>
                        <span title={req.roomLocation}>{req.roomLocation}</span>
                      </div>
                      <div className="warden-card-kv">
                        <small>Expected Date</small>
                        <span>{req.expectedDate}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="warden-card-footer">
                      <span className="warden-card-time">{req.submittedAt}</span>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {req.isDraft ? (
                          <>
                            <button
                              type="button"
                              className="warden-card-btn-view"
                              style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }}
                              onClick={() => handleSubmitExistingDraft(req)}
                            >
                              <Send size={13} /> Submit
                            </button>
                            <button
                              type="button"
                              style={{
                                background: '#fef2f2', border: '1px solid #fecaca',
                                color: '#dc2626', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer'
                              }}
                              onClick={() => handleDeleteDraft(req.id)}
                              title="Delete Draft"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="warden-card-btn-view"
                            onClick={() => setSelectedRequestModal(req)}
                          >
                            <Eye size={14} /> View Details &amp; Timeline
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VIEW 2: CLEAN ERP TABLE */}
          {viewMode === 'table' && (
            <div className="warden-table-wrap">
              <table className="warden-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Request Title &amp; Product</th>
                    <th>Quantity</th>
                    <th>Hostel &amp; Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No requisitions found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                          {req.referenceNo}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.requestTitle}</div>
                          <small style={{ color: '#64748b' }}>{req.productName} ({req.requestType})</small>
                        </td>
                        <td style={{ fontWeight: 600 }}>{req.quantity}</td>
                        <td>
                          <div>{req.roomLocation}</div>
                          <small style={{ color: '#64748b' }}>{req.hostelName}</small>
                        </td>
                        <td>{getPriorityBadge(req.priority)}</td>
                        <td>{getStatusBadge(req)}</td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.submittedAt}</td>
                        <td style={{ textAlign: 'right' }}>
                          {req.isDraft ? (
                            <button
                              type="button"
                              className="warden-card-btn-view"
                              style={{ background: '#2563eb', color: '#ffffff' }}
                              onClick={() => handleSubmitExistingDraft(req)}
                            >
                              <Send size={13} /> Submit
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="warden-card-btn-view"
                              onClick={() => setSelectedRequestModal(req)}
                            >
                              <Eye size={13} /> Timeline
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 4: RECOMMENDATIONS
          ==================================================================== */}
      {activeTab === 'recommendations' && (
        <div className="warden-recommendations-wrap">
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>
                Recommended Hostel Supplies &amp; Maintenance Templates
              </h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                Quickly pre-fill requisition forms using institutional maintenance standards and frequent hostel requests.
              </p>
            </div>
          </div>

          <div className="warden-recom-grid">
            {RECOMMENDATIONS.map(rec => (
              <div key={rec.id} className="warden-recom-card">
                <div>
                  <div className="warden-recom-top">
                    <div className="warden-recom-icon">
                      <Sparkles size={22} />
                    </div>
                    <div className="warden-recom-meta">
                      <span className="warden-recom-cat">{rec.category}</span>
                      <div className="warden-recom-title">{rec.title}</div>
                    </div>
                  </div>

                  <p className="warden-recom-desc" style={{ marginTop: '0.75rem' }}>
                    {rec.desc}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: '#475569', margin: '0.5rem 0' }}>
                    <strong>Recommended for:</strong> {rec.recommendedFor}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="warden-recom-cost-row">
                    <span>Estimated Unit Price:</span>
                    <strong>₹{rec.approxCost.toFixed(2)} / {rec.unit}</strong>
                  </div>

                  <button
                    type="button"
                    className="warden-btn-use-template"
                    onClick={() => handleUseRecommendation(rec)}
                  >
                    <Plus size={16} />
                    <span>+ Use This Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          CONFIRMATION DIALOG MODAL (Before Final Submission)
          ==================================================================== */}
      {isConfirmModalOpen && pendingSubmitData && (
        <div className="warden-modal-overlay">
          <div className="warden-modal-dialog">
            <div className="warden-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Send size={20} color="#2563eb" />
                <h3>Confirm Requisition Submission</h3>
              </div>
              <button
                type="button"
                className="warden-modal-close-btn"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="warden-modal-body">
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', lineHeight: 1.5 }}>
                Are you sure you want to submit this requisition to the <strong>Hostel Admin</strong> for review?
              </p>

              <div className="warden-confirm-summary">
                <div className="warden-confirm-row">
                  <span>Request Title:</span>
                  <strong>{pendingSubmitData.requestTitle}</strong>
                </div>
                <div className="warden-confirm-row">
                  <span>Product / Material:</span>
                  <strong>{pendingSubmitData.productName} ({pendingSubmitData.quantity} {pendingSubmitData.unit})</strong>
                </div>
                <div className="warden-confirm-row">
                  <span>Hostel &amp; Location:</span>
                  <strong>{pendingSubmitData.hostelName} • {pendingSubmitData.roomLocation}</strong>
                </div>
                <div className="warden-confirm-row">
                  <span>Priority:</span>
                  <div>{getPriorityBadge(pendingSubmitData.priority)}</div>
                </div>
                {pendingSubmitData.estimatedCost && (
                  <div className="warden-confirm-row">
                    <span>Estimated Cost:</span>
                    <strong>₹{Number(pendingSubmitData.estimatedCost).toFixed(2)}</strong>
                  </div>
                )}
                <div className="warden-confirm-row">
                  <span>Direct Approving Authority:</span>
                  <strong style={{ color: '#1d4ed8' }}>Hostel Administrator (Assigned Block)</strong>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#64748b',
                background: '#eff6ff',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px'
              }}>
                <ShieldCheck size={16} color="#2563eb" />
                <span>
                  This requisition will be instantly dispatched with initial status <strong>Pending Admin Approval</strong>.
                </span>
              </div>
            </div>

            <div className="warden-modal-footer">
              <button
                type="button"
                className="warden-btn-secondary"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="warden-btn-primary"
                onClick={handleConfirmSubmission}
              >
                <Check size={16} />
                <span>Confirm Submission</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          REQUEST DETAILS AND 7-STAGE VISUAL APPROVAL TIMELINE MODAL
          ==================================================================== */}
      {selectedRequestModal && (
        <div className="warden-modal-overlay">
          <div className="warden-modal-dialog large">
            <div className="warden-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="warden-card-ref">{selectedRequestModal.referenceNo}</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{selectedRequestModal.requestTitle}</h3>
              </div>
              <button
                type="button"
                className="warden-modal-close-btn"
                onClick={() => setSelectedRequestModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="warden-modal-body">
              {/* Status and Priority Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getStatusBadge(selectedRequestModal)}
                  {getPriorityBadge(selectedRequestModal.priority)}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Submitted on: <strong>{selectedRequestModal.submittedAt}</strong> by {selectedRequestModal.raisedBy}
                </div>
              </div>

              {/* ------------------------------------------------------------
                  7-STAGE HORIZONTAL VISUAL TIMELINE
                  Stages:
                  1. Draft Created
                  2. Submitted to Hostel Admin
                  3. Reviewed by Admin
                  4. Approved or Rejected
                  5. In Progress
                  6. Material Issued
                  7. Completed
                  ------------------------------------------------------------ */}
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  Requisition &amp; Sanction Lifecycle Timeline
                </div>

                {(() => {
                  const { currentStep, isRejected } = getTimelineStageInfo(selectedRequestModal);
                  const stages = [
                    { step: 1, label: 'Draft Created' },
                    { step: 2, label: 'Submitted to Admin' },
                    { step: 3, label: 'Reviewed by Admin' },
                    { step: 4, label: isRejected ? 'Rejected by Admin' : 'Approved' },
                    { step: 5, label: 'In Progress' },
                    { step: 6, label: 'Material Issued' },
                    { step: 7, label: 'Completed' }
                  ];

                  // Calculate progress line percentage
                  let progressPercent = 0;
                  if (currentStep >= 7) progressPercent = 100;
                  else if (currentStep === 1) progressPercent = 0;
                  else progressPercent = ((currentStep - 1) / 6) * 100;

                  return (
                    <div className="warden-timeline-wrap">
                      <div className="warden-timeline-line">
                        <div
                          className="warden-timeline-line-progress"
                          style={{
                            width: `${progressPercent}%`,
                            background: isRejected ? '#ef4444' : '#10b981'
                          }}
                        />
                      </div>

                      {stages.map((st) => {
                        let stepClass = '';
                        if (isRejected && st.step === 4) {
                          stepClass = 'rejected';
                        } else if (st.step < currentStep) {
                          stepClass = 'completed';
                        } else if (st.step === currentStep) {
                          stepClass = isRejected ? 'rejected' : 'current';
                        }

                        return (
                          <div key={st.step} className={`warden-timeline-step ${stepClass}`}>
                            <div className="warden-timeline-circle">
                              {st.step < currentStep ? (
                                <Check size={14} />
                              ) : isRejected && st.step === 4 ? (
                                <X size={14} />
                              ) : (
                                st.step
                              )}
                            </div>
                            <span className="warden-timeline-label">{st.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Admin Decision Callout (If Approved or Rejected) */}
              {selectedRequestModal.approvedBy && (
                <div style={{
                  background: selectedRequestModal.status === 'Rejected' ? '#fef2f2' : '#ecfdf5',
                  border: `1px solid ${selectedRequestModal.status === 'Rejected' ? '#fecaca' : '#a7f3d0'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  {selectedRequestModal.status === 'Rejected' ? (
                    <AlertCircle size={20} color="#b91c1c" />
                  ) : (
                    <CheckCircle2 size={20} color="#059669" />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: selectedRequestModal.status === 'Rejected' ? '#991b1b' : '#065f46' }}>
                      {selectedRequestModal.status === 'Rejected' ? 'Sanction Declined by Hostel Admin' : 'Official Sanction Granted'}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#334155' }}>
                      Processed by: <strong>{selectedRequestModal.approvedBy}</strong> {selectedRequestModal.approvedAt ? `on ${selectedRequestModal.approvedAt}` : ''}
                    </div>
                    {selectedRequestModal.remarks && (
                      <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.25rem', fontStyle: 'italic' }}>
                        "{selectedRequestModal.remarks}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requisition Data Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Product / Material Name
                  </small>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedRequestModal.productName}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Quantity &amp; Unit
                  </small>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedRequestModal.quantity}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Hostel Block
                  </small>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                    {selectedRequestModal.hostelName}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Room / Location
                  </small>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                    {selectedRequestModal.roomLocation}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Estimated Total Cost
                  </small>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#16a34a' }}>
                    {selectedRequestModal.approxCost || `₹${selectedRequestModal.estimatedCost || '0.00'}`}
                  </div>
                </div>

                <div>
                  <small style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Expected Completion Date
                  </small>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                    {selectedRequestModal.expectedDate}
                  </div>
                </div>
              </div>

              {/* Full Problem Description */}
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Warden Problem Description &amp; Justification
                </div>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  lineHeight: 1.5
                }}>
                  {selectedRequestModal.description || selectedRequestModal.remarks || 'No detailed description provided.'}
                </div>
              </div>

              {/* Problem Diagnostic Indicators */}
              {(selectedRequestModal.itemCondition || selectedRequestModal.repairPossible) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Condition:</span>
                    <strong>{selectedRequestModal.itemCondition || 'N/A'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Repair Possible:</span>
                    <strong>{selectedRequestModal.repairPossible || 'N/A'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>Safety Hazard:</span>
                    <strong style={{ color: selectedRequestModal.safetyHazard ? '#dc2626' : '#10b981' }}>
                      {selectedRequestModal.safetyHazard ? 'YES - Active Hazard' : 'No Hazard'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Attachments if any */}
              {selectedRequestModal.attachments && selectedRequestModal.attachments.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Supporting Photographic Evidences ({selectedRequestModal.attachments.length})
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {selectedRequestModal.attachments.map((att, idx) => (
                      <div key={idx} style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#ffffff'
                      }}>
                        {att.previewUrl ? (
                          <img src={att.previewUrl} alt={att.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        ) : (
                          <FileText size={20} color="#2563eb" />
                        )}
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{att.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="warden-modal-footer">
              <button
                type="button"
                className="warden-btn-secondary"
                onClick={() => window.print()}
                title="Print official requisition slip or save as PDF"
              >
                <Printer size={16} />
                <span>Print Slip / PDF</span>
              </button>

              <button
                type="button"
                className="warden-btn-primary"
                onClick={() => setSelectedRequestModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
