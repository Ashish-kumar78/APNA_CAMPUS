import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Building,
  Plus,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowUpDown,
  Search,
  ShieldCheck,
  RotateCcw,
  Bed,
  Home,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  X,
  Layers
} from 'lucide-react';
import {
  getAllHostels,
  saveHostel,
  deleteHostel
} from '../../services/hostelAttendanceStore.js';
import { getAllWardens } from '../../services/wardenManagementStore.js';
import './HostelModules.css';
import './StructuredHostelStyles.css';

/**
 * Generates a structured floor -> room -> bed hierarchy
 * consistent with standard institutional room numbering:
 * Floor 1: 101, 102...
 * Floor 2: 201, 202...
 */
export function generateHostelStructure(floors, roomsPerFloor, bedsPerRoom, customTotalRooms = null) {
  const fCount = Math.max(1, Number(floors) || 1);
  const rCount = Math.max(1, Number(roomsPerFloor) || 1);
  const bCount = Math.max(1, Number(bedsPerRoom) || 1);
  const totalTargetRooms = customTotalRooms ? Math.max(1, Number(customTotalRooms)) : fCount * rCount;

  let roomsRemaining = totalTargetRooms;
  const structure = [];

  for (let f = 1; f <= fCount; f++) {
    const floorRoomsCount = customTotalRooms
      ? Math.max(0, Math.min(roomsRemaining, f === fCount ? roomsRemaining : rCount))
      : rCount;
    roomsRemaining -= floorRoomsCount;

    const floorRooms = [];
    for (let r = 1; r <= floorRoomsCount; r++) {
      const roomNum = r <= 99 ? f * 100 + r : `${f}${String(r).padStart(3, '0')}`;
      const beds = Array.from({ length: bCount }, (_, bIdx) => ({
        id: `Bed ${bIdx + 1}`,
        label: `Bed ${bIdx + 1}`,
        occupied: false,
        resident: null
      }));

      floorRooms.push({
        roomNumber: String(roomNum),
        totalBeds: bCount,
        occupiedBeds: 0,
        availableBeds: bCount,
        beds: beds,
        status: 'Available'
      });
    }

    structure.push({
      floorNumber: f,
      floorLabel: f === 1 ? 'Floor 1 (Ground Level)' : `Floor ${f}`,
      totalRooms: floorRooms.length,
      totalBeds: floorRooms.length * bCount,
      rooms: floorRooms
    });
  }

  return structure;
}

const DEFAULT_FORM_STATE = {
  name: '',
  code: '',
  type: 'Boys',
  wardenId: '',
  floors: 2,
  roomsPerFloor: 10,
  manualTotalRooms: '',
  isManualRooms: false,
  bedsPerRoom: 2,
  status: 'Active',
  address: '',
  notes: ''
};

export default function ManageHostelsSection({ account }) {
  const [hostels, setHostels] = useState(() => getAllHostels());
  const [wardens, setWardens] = useState(() => getAllWardens());
  const [form, setForm] = useState(DEFAULT_FORM_STATE);

  // Validation errors map
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion state for floor preview
  const [expandedFloors, setExpandedFloors] = useState(() => new Set([1, 2]));

  // Structure Inspection Modal for existing hostels
  const [inspectingHostel, setInspectingHostel] = useState(null);

  // Search & Sorting for table
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Load wardens on mount
  useEffect(() => {
    setWardens(getAllWardens());
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Synchronize expanded floors when floor count changes
  useEffect(() => {
    const totalFloors = Math.max(1, Number(form.floors) || 1);
    setExpandedFloors(new Set(Array.from({ length: totalFloors }, (_, i) => i + 1)));
  }, [form.floors]);

  // Derived Calculations
  const calculatedStandardRooms = useMemo(() => {
    const f = Math.max(1, Number(form.floors) || 1);
    const r = Math.max(1, Number(form.roomsPerFloor) || 1);
    return f * r;
  }, [form.floors, form.roomsPerFloor]);

  const effectiveTotalRooms = useMemo(() => {
    if (form.isManualRooms && form.manualTotalRooms) {
      return Math.max(1, Number(form.manualTotalRooms) || 1);
    }
    return calculatedStandardRooms;
  }, [form.isManualRooms, form.manualTotalRooms, calculatedStandardRooms]);

  const effectiveTotalBeds = useMemo(() => {
    const b = Math.max(1, Number(form.bedsPerRoom) || 1);
    return effectiveTotalRooms * b;
  }, [effectiveTotalRooms, form.bedsPerRoom]);

  const hasRoomMismatch = useMemo(() => {
    return form.isManualRooms && Number(form.manualTotalRooms) !== calculatedStandardRooms;
  }, [form.isManualRooms, form.manualTotalRooms, calculatedStandardRooms]);

  // Selected Warden info
  const selectedWarden = useMemo(() => {
    return wardens.find(w => w.id === form.wardenId) || null;
  }, [wardens, form.wardenId]);

  // Live Structure Preview
  const previewStructure = useMemo(() => {
    return generateHostelStructure(
      form.floors,
      form.roomsPerFloor,
      form.bedsPerRoom,
      form.isManualRooms && form.manualTotalRooms ? Number(form.manualTotalRooms) : null
    );
  }, [form.floors, form.roomsPerFloor, form.bedsPerRoom, form.isManualRooms, form.manualTotalRooms]);

  // Field Validations
  const validationErrors = useMemo(() => {
    const errs = {};

    // 1. Hostel Name
    if (!form.name.trim()) {
      errs.name = 'Hostel Name is required.';
    }

    // 2. Hostel Code
    const cleanCode = form.code.trim().toUpperCase();
    if (!cleanCode) {
      errs.code = 'Hostel Code is required.';
    } else if (!/^[A-Z0-9-]+$/.test(cleanCode)) {
      errs.code = 'Hostel Code must contain only alphanumeric characters and hyphens.';
    } else {
      const duplicate = hostels.some(h => h.code?.toUpperCase() === cleanCode);
      if (duplicate) {
        errs.code = `Hostel Code "${cleanCode}" is already registered. Must be unique.`;
      }
    }

    // 3. Hostel Type
    if (!form.type) {
      errs.type = 'Hostel Type must be selected.';
    }

    // 4. Warden Assignment
    if (!form.wardenId) {
      errs.wardenId = 'Assigning a residential warden is required.';
    }

    // 5. Floors
    if (!form.floors || Number(form.floors) < 1) {
      errs.floors = 'Must have at least 1 floor.';
    }

    // 6. Rooms per floor
    if (!form.roomsPerFloor || Number(form.roomsPerFloor) < 1) {
      errs.roomsPerFloor = 'Rooms per floor must be at least 1.';
    }

    // 7. Beds per room
    if (!form.bedsPerRoom || Number(form.bedsPerRoom) < 1) {
      errs.bedsPerRoom = 'Beds per room must be at least 1.';
    }

    return errs;
  }, [form, hostels]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  // Code input handler (auto uppercase + alphanumeric/hyphens only)
  const handleCodeChange = (e) => {
    const raw = e.target.value;
    const sanitized = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setForm(prev => ({ ...prev, code: sanitized }));
  };

  // Accordion toggle helpers
  const toggleFloor = (floorNum) => {
    setExpandedFloors(prev => {
      const next = new Set(prev);
      if (next.has(floorNum)) next.delete(floorNum);
      else next.add(floorNum);
      return next;
    });
  };

  const expandAllFloors = () => {
    setExpandedFloors(new Set(previewStructure.map(f => f.floorNumber)));
  };

  const collapseAllFloors = () => {
    setExpandedFloors(new Set());
  };

  // Reset form
  const handleReset = () => {
    if (form.name || form.code) {
      if (!window.confirm('Reset the hostel configuration form back to default values?')) {
        return;
      }
    }
    setForm(DEFAULT_FORM_STATE);
    setTouched({});
    showToast('Hostel creation form reset to initial configuration.');
  };

  // Handle Create Submit
  const handleCreate = (e) => {
    e.preventDefault();

    // Mark all fields touched
    setTouched({
      name: true,
      code: true,
      type: true,
      wardenId: true,
      floors: true,
      roomsPerFloor: true,
      bedsPerRoom: true
    });

    if (!isFormValid) {
      showToast('⚠️ Please correct validation errors before creating hostel.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const wardenObj = wardens.find(w => w.id === form.wardenId);
        const wardenDisplayName = wardenObj
          ? `${wardenObj.name} (${wardenObj.id})`
          : 'Mr. Tanmaya Kumar Routray';

        const updatedList = saveHostel({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          type: form.type,
          warden: wardenDisplayName,
          wardenId: form.wardenId,
          contact: wardenObj?.phone || '+91 94370 00000',
          floors: Number(form.floors),
          roomsPerFloor: Number(form.roomsPerFloor),
          totalRooms: effectiveTotalRooms,
          bedsPerRoom: Number(form.bedsPerRoom),
          totalBeds: effectiveTotalBeds,
          status: form.status || 'Active',
          address: form.address.trim(),
          notes: form.notes.trim(),
          structure: previewStructure,
          bedRooms: {
            11: '(not set)',
            10: '(not set)',
            9: '(not set)',
            8: '(not set)',
            7: '(not set)',
            6: '(not set)',
            5: '(not set)',
            4: `${Math.floor(effectiveTotalBeds / 4)} Rooms`,
            3: '(not set)',
            2: `${effectiveTotalRooms} Rooms (${Number(form.bedsPerRoom)}-Bed)`,
            1: '(not set)',
            [form.bedsPerRoom]: `${effectiveTotalRooms} Rooms`
          }
        });

        setHostels(updatedList);
        setForm(DEFAULT_FORM_STATE);
        setTouched({});
        setIsSubmitting(false);
        showToast(`✓ Hostel "${form.name.trim()}" (${form.code.trim().toUpperCase()}) registered successfully with ${effectiveTotalBeds} beds!`);
      } catch (err) {
        setIsSubmitting(false);
        alert(`Failed to save hostel: ${err.message}`);
      }
    }, 450);
  };

  const handleDelete = (hostelId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from hostel infrastructure? Historical records will be retained.`)) {
      const updated = deleteHostel(hostelId);
      setHostels(updated);
      showToast(`Hostel ${name} removed from active register.`);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedAndFilteredHostels = useMemo(() => {
    let list = [...hostels];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.code.toLowerCase().includes(q) ||
        (h.warden && h.warden.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [hostels, searchQuery, sortOrder]);

  const handleExportCsv = () => {
    const headers = [
      '#',
      'Hostel Name',
      'Hostel Code',
      'Type',
      'Assigned Warden',
      'Floors',
      'Total Rooms',
      'Total Beds',
      'Status'
    ];
    const rows = sortedAndFilteredHostels.map((h, i) => [
      i + 1,
      h.name,
      h.code,
      h.type || 'Boys',
      h.warden || 'Unassigned',
      h.floors || 3,
      h.totalRooms || Math.floor((h.totalBeds || 60) / 2),
      h.totalBeds || 0,
      h.status || 'Active'
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Manage_Hostels_List_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Manage Hostels table exported to Excel/CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="hostel-unified-module manage-hostels-replica">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="hostel-toast-banner success">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & User Tag */}
      <div className="manage-hostel-top-header">
        <div className="breadcrumb-path">
          <span>Home</span> / <span>Hostel</span> / <span className="active-path">Manage Hostel(s)</span>
        </div>
        <div className="admin-user-profile-badge">
          <span>{account?.name || 'Mr. Rajesh Jena'} (Hostel Admin) ▾</span>
        </div>
      </div>

      {/* UPGRADED STRUCTURED ADD HOSTEL CONTAINER */}
      <div className="add-hostel-container-pro">
        <div className="add-hostel-header-pro">
          <div>
            <h2>
              <Building2 size={20} color="#22c55e" />
              Add New Hostel
            </h2>
            <p>
              Configure hostel identity, floors, rooms, bed capacity, and warden assignment with live structure generation.
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
            Hostel Admin Console
          </span>
        </div>

        {/* 4 DYNAMIC CAPACITY SUMMARY CARDS */}
        <div className="add-hostel-summary-grid">
          <div className="add-hostel-summary-card">
            <div className="add-hostel-summary-icon blue">
              <Building size={22} />
            </div>
            <div className="add-hostel-summary-body">
              <span className="add-hostel-summary-label">Total Floors</span>
              <div className="add-hostel-summary-val">{form.floors} Floors</div>
              <div className="add-hostel-summary-sub">{form.roomsPerFloor} rooms / floor</div>
            </div>
          </div>

          <div className="add-hostel-summary-card">
            <div className="add-hostel-summary-icon purple">
              <Home size={22} />
            </div>
            <div className="add-hostel-summary-body">
              <span className="add-hostel-summary-label">Total Rooms</span>
              <div className="add-hostel-summary-val">{effectiveTotalRooms} Rooms</div>
              <div className="add-hostel-summary-sub">
                {form.isManualRooms ? 'Manually Overridden' : `${form.floors} × ${form.roomsPerFloor} rooms`}
              </div>
            </div>
          </div>

          <div className="add-hostel-summary-card">
            <div className="add-hostel-summary-icon emerald">
              <Bed size={22} />
            </div>
            <div className="add-hostel-summary-body">
              <span className="add-hostel-summary-label">Total Beds</span>
              <div className="add-hostel-summary-val" style={{ color: '#16a34a' }}>
                {effectiveTotalBeds} Beds
              </div>
              <div className="add-hostel-summary-sub">{form.bedsPerRoom} beds / room capacity</div>
            </div>
          </div>

          <div className="add-hostel-summary-card">
            <div className="add-hostel-summary-icon amber">
              <UserCheck size={22} />
            </div>
            <div className="add-hostel-summary-body">
              <span className="add-hostel-summary-label">Assigned Warden</span>
              <div className="add-hostel-summary-val" style={{ fontSize: '0.98rem' }}>
                {selectedWarden ? selectedWarden.name : 'Not Assigned'}
              </div>
              <div className="add-hostel-summary-sub">
                {selectedWarden ? `${selectedWarden.id} · ${selectedWarden.designation}` : 'Select warden below'}
              </div>
            </div>
          </div>
        </div>

        {/* 3-COLUMN STRUCTURED CONFIGURATION FORM */}
        <form onSubmit={handleCreate}>
          <div className="add-hostel-3col-grid">
            {/* COLUMN 1: SECTION A — HOSTEL INFORMATION */}
            <div className="add-hostel-section-card">
              <div className="section-card-title">
                <Building size={16} color="#0284c7" />
                <span>Section A: Hostel Information</span>
                <span className="section-card-badge">Identity</span>
              </div>

              {/* Hostel Name */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Hostel Name <span className="required-star">*</span></span>
                </label>
                <input
                  type="text"
                  className={`form-field-input ${touched.name && validationErrors.name ? 'has-error' : ''}`}
                  placeholder="e.g. Boys Hostel A"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                  required
                />
                {touched.name && validationErrors.name && (
                  <span className="form-field-error">{validationErrors.name}</span>
                )}
              </div>

              {/* Hostel Code */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Hostel Code <span className="required-star">*</span></span>
                  <span className="form-field-hint">Auto-uppercase (A-Z, 0-9, -)</span>
                </label>
                <input
                  type="text"
                  className={`form-field-input ${touched.code && validationErrors.code ? 'has-error' : ''}`}
                  placeholder="e.g. BH-A01"
                  value={form.code}
                  onChange={handleCodeChange}
                  onBlur={() => setTouched(prev => ({ ...prev, code: true }))}
                  maxLength={12}
                  required
                />
                {touched.code && validationErrors.code && (
                  <span className="form-field-error">{validationErrors.code}</span>
                )}
              </div>

              {/* Hostel Type */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Hostel Type <span className="required-star">*</span></span>
                </label>
                <select
                  className={`form-field-select ${touched.type && validationErrors.type ? 'has-error' : ''}`}
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, type: true }))}
                  required
                >
                  <option value="Boys">Boys Hostel</option>
                  <option value="Girls">Girls Hostel</option>
                  <option value="Co-ed">Co-ed Residential Complex</option>
                </select>
                {touched.type && validationErrors.type && (
                  <span className="form-field-error">{validationErrors.type}</span>
                )}
              </div>

              {/* Assign Warden */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Assign Warden <span className="required-star">*</span></span>
                </label>
                <select
                  className={`form-field-select ${touched.wardenId && validationErrors.wardenId ? 'has-error' : ''}`}
                  value={form.wardenId}
                  onChange={e => setForm({ ...form, wardenId: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, wardenId: true }))}
                  required
                >
                  <option value="">-- Choose Warden from Staff Register --</option>
                  {wardens.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.id}) — {w.designation} [{w.hostelName}]
                    </option>
                  ))}
                </select>
                {touched.wardenId && validationErrors.wardenId && (
                  <span className="form-field-error">{validationErrors.wardenId}</span>
                )}
              </div>
            </div>

            {/* COLUMN 2: SECTION B — FLOOR, ROOM & BED CONFIGURATION */}
            <div className="add-hostel-section-card">
              <div className="section-card-title">
                <Layers size={16} color="#7c3aed" />
                <span>Section B: Floor &amp; Bed Capacity</span>
                <span className="section-card-badge">Structure</span>
              </div>

              {/* Number of Floors */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Number of Floors <span className="required-star">*</span></span>
                  <span className="form-field-hint">Min: 1</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className={`form-field-input ${touched.floors && validationErrors.floors ? 'has-error' : ''}`}
                  value={form.floors}
                  onChange={e => setForm({ ...form, floors: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  onBlur={() => setTouched(prev => ({ ...prev, floors: true }))}
                  required
                />
                {touched.floors && validationErrors.floors && (
                  <span className="form-field-error">{validationErrors.floors}</span>
                )}
              </div>

              {/* Rooms per Floor */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Rooms per Floor <span className="required-star">*</span></span>
                  <span className="form-field-hint">Uniform per level</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className={`form-field-input ${touched.roomsPerFloor && validationErrors.roomsPerFloor ? 'has-error' : ''}`}
                  value={form.roomsPerFloor}
                  onChange={e => setForm({ ...form, roomsPerFloor: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  onBlur={() => setTouched(prev => ({ ...prev, roomsPerFloor: true }))}
                  required
                />
                {touched.roomsPerFloor && validationErrors.roomsPerFloor && (
                  <span className="form-field-error">{validationErrors.roomsPerFloor}</span>
                )}
              </div>

              {/* Total Rooms Display & Optional Manual Override */}
              <div className="form-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-field-label" style={{ margin: 0 }}>
                    <span>Total Rooms</span>
                  </label>
                  <button
                    type="button"
                    className="override-toggle-btn"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        isManualRooms: !prev.isManualRooms,
                        manualTotalRooms: !prev.isManualRooms ? String(calculatedStandardRooms) : ''
                      }));
                    }}
                  >
                    {form.isManualRooms ? 'Use Standard Formula' : 'Manual Override'}
                  </button>
                </div>

                {form.isManualRooms ? (
                  <div>
                    <input
                      type="number"
                      min="1"
                      className="form-field-input"
                      value={form.manualTotalRooms}
                      onChange={e => setForm({ ...form, manualTotalRooms: e.target.value })}
                      placeholder={`Calculated standard: ${calculatedStandardRooms}`}
                    />
                    {hasRoomMismatch && (
                      <div className="override-warning-box" style={{ marginTop: '0.35rem' }}>
                        <AlertTriangle size={14} color="#d97706" />
                        <span>Entered {form.manualTotalRooms} rooms differs from standard ({form.floors} × {form.roomsPerFloor} = {calculatedStandardRooms}).</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="calculated-badge-display">
                    <span>{form.floors} Floors × {form.roomsPerFloor} Rooms</span>
                    <span>= {calculatedStandardRooms} Rooms</span>
                  </div>
                )}
              </div>

              {/* Beds per Room */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Beds per Room <span className="required-star">*</span></span>
                  <span className="form-field-hint">Default: 2 Beds</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className={`form-field-input ${touched.bedsPerRoom && validationErrors.bedsPerRoom ? 'has-error' : ''}`}
                  value={form.bedsPerRoom}
                  onChange={e => setForm({ ...form, bedsPerRoom: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  onBlur={() => setTouched(prev => ({ ...prev, bedsPerRoom: true }))}
                  required
                />
                {touched.bedsPerRoom && validationErrors.bedsPerRoom && (
                  <span className="form-field-error">{validationErrors.bedsPerRoom}</span>
                )}
              </div>

              {/* Total Bed Capacity Badge */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Total Bed Capacity</span>
                  <span className="form-field-hint">Dynamic Calculation</span>
                </label>
                <div className="calculated-badge-display" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                  <span>{effectiveTotalRooms} Rooms × {form.bedsPerRoom} Beds/Room</span>
                  <strong style={{ color: '#047857' }}>= {effectiveTotalBeds} Beds</strong>
                </div>
              </div>
            </div>

            {/* COLUMN 3: SECTION C — ADDITIONAL SETTINGS & ACTIONS */}
            <div className="add-hostel-section-card">
              <div className="section-card-title">
                <ShieldCheck size={16} color="#16a34a" />
                <span>Section C: Settings &amp; Actions</span>
                <span className="section-card-badge">Controls</span>
              </div>

              {/* Hostel Status */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Hostel Status</span>
                </label>
                <select
                  className="form-field-select"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Active (Operational &amp; Allotment Open)</option>
                  <option value="Inactive">Inactive (Temporarily Closed)</option>
                  <option value="Maintenance">Maintenance (Renovation / Sanitization)</option>
                </select>
              </div>

              {/* Hostel Address */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Hostel Physical Address (Optional)</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  placeholder="e.g. North Residential Quad, Sector 2"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>

              {/* Description / Notes */}
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Description / Operational Notes</span>
                </label>
                <textarea
                  rows={2}
                  className="form-field-textarea"
                  placeholder="Enter facilities info, Wi-Fi connectivity, or special residency notes..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              {/* Action Buttons */}
              <div className="add-hostel-actions-bar">
                <button
                  type="submit"
                  className="btn-create-hostel"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                      <span>Creating Hostel...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Hostel</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-reset-hostel"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  <RotateCcw size={14} />
                  <span>Reset Form</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* SECTION 4: AUTOMATIC HOSTEL STRUCTURE GENERATION PREVIEW */}
        <div className="add-hostel-preview-section">
          <div className="preview-section-header">
            <div className="preview-title-group">
              <h3>
                <Home size={17} color="#22c55e" />
                Live Hostel Structure Preview ({effectiveTotalRooms} Rooms · {effectiveTotalBeds} Beds Capacity)
              </h3>
              <p>
                Real-time visual floor, room, and bed layout generated automatically based on configuration.
              </p>
            </div>

            <div className="preview-controls-group">
              <span style={{ fontSize: '0.76rem', color: '#64748b', marginRight: '6px' }}>
                Preview Mode: <strong>{form.name || 'Untitled Hostel'}</strong>
              </span>
              <button
                type="button"
                className="preview-control-btn"
                onClick={expandAllFloors}
              >
                Expand All
              </button>
              <button
                type="button"
                className="preview-control-btn"
                onClick={collapseAllFloors}
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Accordion List for each floor */}
          <div className="floors-accordion-list">
            {previewStructure.map((floor) => {
              const isExpanded = expandedFloors.has(floor.floorNumber);
              return (
                <div key={floor.floorNumber} className="floor-accordion-card">
                  <div
                    className="floor-accordion-header"
                    onClick={() => toggleFloor(floor.floorNumber)}
                  >
                    <div className="floor-title-side">
                      <Building2 size={16} color="#0284c7" />
                      <span>{floor.floorLabel}</span>
                    </div>

                    <div className="floor-meta-side">
                      <span className="floor-rooms-pill">
                        {floor.rooms.length} Rooms · {floor.totalBeds} Beds
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="floor-accordion-body">
                      <div className="rooms-preview-grid">
                        {floor.rooms.map((room) => (
                          <div key={room.roomNumber} className="room-preview-box">
                            <div className="room-preview-header">
                              <span className="room-num-badge">Room {room.roomNumber}</span>
                              <span className="room-capacity-chip">{room.totalBeds} Beds</span>
                            </div>

                            <div className="room-beds-container">
                              {room.beds.map((b) => (
                                <span key={b.id} className="bed-tag-pill">
                                  <Bed size={10} color="#64748b" /> {b.label}
                                </span>
                              ))}
                            </div>

                            <div className="room-occupancy-bar">
                              <span>● Initial Occupancy: 0 / {room.totalBeds}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOX 2: Manage Hostel(s) Table */}
      <div className="manage-hostels-table-card">
        <div className="table-card-header">
          <div className="header-title-with-icon">
            <span className="table-icon-bars">☰</span>
            <h3>Manage Hostel(s) Infrastructure Register</h3>
          </div>

          <div className="header-actions-group">
            <button
              type="button"
              className="export-action-btn pdf-btn"
              onClick={handlePrint}
              title="Export PDF Document"
            >
              PDF
            </button>
            <button
              type="button"
              className="export-action-btn excel-btn"
              onClick={handleExportCsv}
              title="Export Excel Spreadsheet"
            >
              EXCEL
            </button>
          </div>
        </div>

        {/* Search bar helper */}
        <div style={{ padding: '0 1.25rem 0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
            <span>Showing <strong>{sortedAndFilteredHostels.length}</strong> registered hostel complexes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search hostel name, code, warden..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '5px 10px',
                fontSize: '0.82rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                outline: 'none',
                minWidth: '220px'
              }}
            />
          </div>
        </div>

        {/* Enhanced Table Grid */}
        <div className="matrix-table-scroll">
          <table className="manage-hostels-grid-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th className="sortable-th" onClick={toggleSort} title="Click to sort">
                  Hostel Name <span className="sort-indicator">↓≡</span>
                </th>
                <th>Hostel Code</th>
                <th>Hostel Type</th>
                <th>Assigned Warden</th>
                <th>Floors</th>
                <th>Total Rooms</th>
                <th>Total Beds</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredHostels.map((h, index) => {
                const floorsCount = h.floors || (h.structure ? h.structure.length : 3);
                const roomsCount = h.totalRooms || Math.floor((h.totalBeds || 60) / 2);
                return (
                  <tr key={h.id || h.code}>
                    <td className="center-cell">{index + 1}</td>
                    <td className="hostel-name-cell">
                      <strong>{h.name}</strong>
                    </td>
                    <td className="code-cell">
                      <span className="reg-no-code">{h.code}</span>
                    </td>
                    <td>
                      <span className={`branch-pill-badge ${h.type === 'Girls' ? 'girls' : 'boys'}`}>
                        {h.type || 'Boys'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                        {h.warden || 'Mr. Tanmaya Kumar Routray'}
                      </div>
                      <small style={{ color: '#64748b' }}>{h.contact || '+91 94370 00000'}</small>
                    </td>
                    <td className="center-cell">{floorsCount}</td>
                    <td className="center-cell">{roomsCount}</td>
                    <td className="beds-cell">{h.totalBeds || (roomsCount * 2)}</td>
                    <td>
                      <span className={`had-badge ${h.status === 'Inactive' ? 'red' : h.status === 'Maintenance' ? 'amber' : 'green'}`}>
                        {h.status || 'Active'}
                      </span>
                    </td>
                    <td className="center-cell">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          className="had-btn had-btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                          onClick={() => setInspectingHostel(h)}
                          title="View Floor and Room Structure"
                        >
                          <Layers size={13} /> View Structure
                        </button>
                        <button
                          type="button"
                          className="delete-icon-btn"
                          onClick={() => handleDelete(h.id, h.name)}
                          title="Delete hostel"
                        >
                          <Trash2 size={13} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STRUCTURE INSPECTION MODAL */}
      {inspectingHostel && (
        <div className="structure-modal-backdrop" onClick={() => setInspectingHostel(null)}>
          <div className="structure-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="structure-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff' }}>
                  {inspectingHostel.name} ({inspectingHostel.code}) — Floor Structure
                </h3>
                <small style={{ color: '#93c5fd' }}>
                  {inspectingHostel.type || 'Boys'} Hostel · Assigned Warden: {inspectingHostel.warden || 'Unassigned'}
                </small>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                onClick={() => setInspectingHostel(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="structure-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="wm-kpi-card" style={{ padding: '0.75rem' }}>
                  <span className="wm-kpi-label">Floors</span>
                  <div className="wm-kpi-val" style={{ fontSize: '1.1rem' }}>
                    {inspectingHostel.floors || 3}
                  </div>
                </div>
                <div className="wm-kpi-card" style={{ padding: '0.75rem' }}>
                  <span className="wm-kpi-label">Total Rooms</span>
                  <div className="wm-kpi-val" style={{ fontSize: '1.1rem' }}>
                    {inspectingHostel.totalRooms || Math.floor((inspectingHostel.totalBeds || 60) / 2)}
                  </div>
                </div>
                <div className="wm-kpi-card" style={{ padding: '0.75rem' }}>
                  <span className="wm-kpi-label">Total Beds</span>
                  <div className="wm-kpi-val" style={{ fontSize: '1.1rem', color: '#16a34a' }}>
                    {inspectingHostel.totalBeds || 60}
                  </div>
                </div>
                <div className="wm-kpi-card" style={{ padding: '0.75rem' }}>
                  <span className="wm-kpi-label">Status</span>
                  <div className="wm-kpi-val" style={{ fontSize: '0.95rem', color: '#0284c7' }}>
                    {inspectingHostel.status || 'Active'}
                  </div>
                </div>
              </div>

              {/* Render structure if present, or generate live */}
              <div className="floors-accordion-list">
                {(inspectingHostel.structure || generateHostelStructure(inspectingHostel.floors || 3, 10, 2)).map(floor => (
                  <div key={floor.floorNumber} className="floor-accordion-card">
                    <div className="floor-accordion-header">
                      <div className="floor-title-side">
                        <Building2 size={16} color="#0284c7" />
                        <span>{floor.floorLabel}</span>
                      </div>
                      <span className="floor-rooms-pill">
                        {floor.rooms.length} Rooms · {floor.totalBeds} Beds
                      </span>
                    </div>

                    <div className="floor-accordion-body">
                      <div className="rooms-preview-grid">
                        {floor.rooms.map(room => (
                          <div key={room.roomNumber} className="room-preview-box">
                            <div className="room-preview-header">
                              <span className="room-num-badge">Room {room.roomNumber}</span>
                              <span className="room-capacity-chip">{room.totalBeds} Beds</span>
                            </div>
                            <div className="room-beds-container">
                              {room.beds.map(b => (
                                <span key={b.id} className="bed-tag-pill">
                                  <Bed size={10} color="#64748b" /> {b.label}
                                </span>
                              ))}
                            </div>
                            <div className="room-occupancy-bar">
                              <span>● Initial Occupancy: 0 / {room.totalBeds}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="structure-modal-footer">
              <button
                type="button"
                className="had-btn had-btn-secondary"
                onClick={() => setInspectingHostel(null)}
              >
                Close Structure Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
