import React, { useState, useMemo, useEffect } from 'react';
import {
  Bed,
  Home,
  UserPlus,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  X,
  Layers,
  ArrowRightLeft,
  LogOut,
  Plus
} from 'lucide-react';
import {
  getAllHostels,
  getAllApplicants
} from '../../services/hostelAttendanceStore.js';
import {
  getRoomsForHostel,
  addRoomToHostel,
  addBedToRoom,
  addFloorToHostel,
  updateRoomsForHostel,
  subscribeHostelRooms
} from '../../services/hostelRoomStore.js';
import './HostelModules.css';

export default function RoomAllotmentSection({ account }) {
  const isWarden = account?.role === 'warden';
  const isHostelAdmin = !isWarden;

  const [hostels] = useState(() => getAllHostels());
  const [selectedHostel, setSelectedHostel] = useState('Bhabani Hostel-1');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Load rooms from persistent store
  const [rooms, setRooms] = useState(() => getRoomsForHostel('Bhabani Hostel-1'));

  // Sync rooms when selected hostel changes
  useEffect(() => {
    setRooms(getRoomsForHostel(selectedHostel));
    setSelectedFloor('ALL');
  }, [selectedHostel]);

  // Subscribe to real-time updates (cross-tab and admin-to-warden sync)
  useEffect(() => {
    const unsubscribe = subscribeHostelRooms(() => {
      setRooms(getRoomsForHostel(selectedHostel));
    });
    return unsubscribe;
  }, [selectedHostel]);

  // Modal States
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [allocateForm, setAllocateForm] = useState({
    studentName: 'Abhilash Mohanty',
    regNo: '2401105005',
    rollNo: '24CSE008',
    hostelName: 'Bhabani Hostel-1',
    roomNo: '101',
    bedNo: 'Bed 03',
    floor: 'Floor 1'
  });

  const [transferModalData, setTransferModalData] = useState(null);
  const [transferTargetRoom, setTransferTargetRoom] = useState('103');
  const [transferTargetBed, setTransferTargetBed] = useState('Bed 01');

  // New Modals for Add Room, Add Bed, Add Floor
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [addRoomForm, setAddRoomForm] = useState({
    floor: 'Floor 1',
    customFloor: '',
    roomNo: '',
    type: '4-Bed Standard AC',
    capacity: 4
  });

  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState(false);
  const [addBedRoomNo, setAddBedRoomNo] = useState('');
  const [addBedCustomLabel, setAddBedCustomLabel] = useState('');

  const [isAddFloorModalOpen, setIsAddFloorModalOpen] = useState(false);
  const [addFloorForm, setAddFloorForm] = useState({
    floorName: 'Floor 3',
    roomCount: 2,
    startRoomNumber: '301',
    roomType: '4-Bed Standard AC',
    bedsPerRoom: 4
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3800);
  };

  // Dynamically compute available floors
  const availableFloors = useMemo(() => {
    const list = Array.from(new Set(rooms.map(r => r.floor))).filter(Boolean);
    return list.sort();
  }, [rooms]);

  // Reconciled room statistics
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce(
    (acc, r) => acc + r.beds.filter(b => b.status === 'Occupied').length,
    0
  );
  const vacantBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';

  const filteredRooms = useMemo(() => {
    return rooms.filter(rm => {
      const matchFloor = selectedFloor === 'ALL' || rm.floor === selectedFloor;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        rm.roomNo.toLowerCase().includes(query) ||
        rm.type.toLowerCase().includes(query) ||
        rm.beds.some(b => b.resident && b.resident.toLowerCase().includes(query));
      return matchFloor && matchSearch;
    });
  }, [rooms, selectedFloor, searchQuery]);

  // Handle Add Room
  const handleAddRoomSubmit = (e) => {
    e.preventDefault();
    try {
      const targetFloor = addRoomForm.floor === 'CUSTOM' ? addRoomForm.customFloor.trim() : addRoomForm.floor;
      if (!targetFloor) {
        showToast('Please specify a valid floor name.');
        return;
      }
      if (!addRoomForm.roomNo.trim()) {
        showToast('Please specify a room number.');
        return;
      }

      const updated = addRoomToHostel(selectedHostel, {
        roomNo: addRoomForm.roomNo.trim(),
        floor: targetFloor,
        type: addRoomForm.type,
        capacity: addRoomForm.capacity
      });

      setRooms(updated);
      setIsAddRoomModalOpen(false);
      setAddRoomForm({
        floor: availableFloors[0] || 'Floor 1',
        customFloor: '',
        roomNo: '',
        type: '4-Bed Standard AC',
        capacity: 4
      });
      showToast(`✓ Room ${addRoomForm.roomNo} successfully created on ${targetFloor} in ${selectedHostel}! Automatically synced to Hostel Warden.`);
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to add room.'}`);
    }
  };

  // Handle Add Bed
  const handleAddBedSubmit = (e) => {
    e.preventDefault();
    try {
      if (!addBedRoomNo) {
        showToast('Please select a target room.');
        return;
      }
      const updated = addBedToRoom(selectedHostel, addBedRoomNo, addBedCustomLabel.trim() || null);
      setRooms(updated);
      setIsAddBedModalOpen(false);
      setAddBedCustomLabel('');
      showToast(`✓ New bed successfully added to Room ${addBedRoomNo} in ${selectedHostel}! Automatically synced to Hostel Warden.`);
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to add bed.'}`);
    }
  };

  // Handle Add Floor
  const handleAddFloorSubmit = (e) => {
    e.preventDefault();
    try {
      if (!addFloorForm.floorName.trim()) {
        showToast('Please enter a floor name.');
        return;
      }
      const updated = addFloorToHostel(selectedHostel, addFloorForm);
      setRooms(updated);
      setIsAddFloorModalOpen(false);
      showToast(`✓ ${addFloorForm.floorName} created with ${addFloorForm.roomCount} rooms in ${selectedHostel}! Automatically synced to Hostel Warden.`);
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to add floor.'}`);
    }
  };

  // Handle Quick Bed Allotment
  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    const updatedRooms = rooms.map(rm => {
      if (rm.roomNo === allocateForm.roomNo) {
        const updatedBeds = rm.beds.map(b => {
          if (b.bedNo === allocateForm.bedNo) {
            return {
              ...b,
              resident: `${allocateForm.studentName} (${allocateForm.regNo})`,
              roll: allocateForm.rollNo,
              branch: 'CSE',
              status: 'Occupied'
            };
          }
          return b;
        });
        return { ...rm, beds: updatedBeds };
      }
      return rm;
    });

    setRooms(updatedRooms);
    updateRoomsForHostel(selectedHostel, updatedRooms);
    setIsAllocateModalOpen(false);
    showToast(
      `✓ Successfully allotted Room ${allocateForm.roomNo} (${allocateForm.bedNo}) to ${allocateForm.studentName}! Synced across portals.`
    );
  };

  // Handle Vacate Bed
  const handleVacateBed = (roomNo, bedNo, residentName) => {
    if (!window.confirm(`Are you sure you want to vacate ${bedNo} occupied by ${residentName}?`)) {
      return;
    }
    const updatedRooms = rooms.map(rm => {
      if (rm.roomNo === roomNo) {
        return {
          ...rm,
          beds: rm.beds.map(b =>
            b.bedNo === bedNo
              ? { ...b, resident: null, roll: null, branch: null, status: 'Vacant' }
              : b
          )
        };
      }
      return rm;
    });

    setRooms(updatedRooms);
    updateRoomsForHostel(selectedHostel, updatedRooms);
    showToast(`✓ Vacated ${bedNo} in Room ${roomNo}. Bed is now available and synced to Warden.`);
  };

  // Handle Room Transfer
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferModalData) return;

    const updatedRooms = rooms.map(rm => {
      // 1. Remove from source room
      if (rm.roomNo === transferModalData.sourceRoom) {
        return {
          ...rm,
          beds: rm.beds.map(b =>
            b.bedNo === transferModalData.sourceBed
              ? { ...b, resident: null, roll: null, branch: null, status: 'Vacant' }
              : b
          )
        };
      }
      // 2. Put into target room
      if (rm.roomNo === transferTargetRoom) {
        return {
          ...rm,
          beds: rm.beds.map(b =>
            b.bedNo === transferTargetBed
              ? {
                  ...b,
                  resident: transferModalData.resident,
                  roll: transferModalData.roll,
                  branch: transferModalData.branch,
                  status: 'Occupied'
                }
              : b
          )
        };
      }
      return rm;
    });

    setRooms(updatedRooms);
    updateRoomsForHostel(selectedHostel, updatedRooms);
    setTransferModalData(null);
    showToast(
      `✓ Transferred ${transferModalData.resident} to Room ${transferTargetRoom} (${transferTargetBed}). Synced in real-time.`
    );
  };

  return (
    <div className="hostel-unified-module">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="hostel-toast-banner success">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="hostel-page-header">
        <div className="hostel-breadcrumb">
          <span>Home</span> / <span>Hostel</span> / <span className="current">Room Allotment</span>
        </div>
        <div className="hostel-header-title-row">
          <div>
            <h2>Room Allotment &amp; Bed Capacity Management</h2>
            <p>Admin console for block-wise bed capacity, room occupancy visualization, and student bed transfers.</p>
          </div>
          {isWarden ? (
            <div className="hostel-role-tag" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
              <ShieldCheck size={16} /> Hostel Warden View (Synced with Admin)
            </div>
          ) : (
            <div className="hostel-role-tag admin-only">
              <ShieldCheck size={16} /> Exclusive to Hostel Admin Role
            </div>
          )}
        </div>
      </div>

      <div className="hostel-card-container">
        {/* KPI Strip */}
        <div className="attendance-kpi-grid">
          <div className="kpi-box total">
            <div className="kpi-num">{rooms.length}</div>
            <div className="kpi-label">Monitored Rooms</div>
            <div className="kpi-sub">{selectedHostel}</div>
          </div>
          <div className="kpi-box present">
            <div className="kpi-num">{occupiedBeds}</div>
            <div className="kpi-label">Occupied Beds</div>
            <div className="kpi-sub">{occupancyRate}% Occupancy</div>
          </div>
          <div className="kpi-box leave">
            <div className="kpi-num">{vacantBeds}</div>
            <div className="kpi-label">Available / Vacant Beds</div>
            <div className="kpi-sub">Ready for immediate allotment</div>
          </div>
          <div className="kpi-box absent">
            <div className="kpi-num">{totalBeds}</div>
            <div className="kpi-label">Total Bed Capacity</div>
            <div className="kpi-sub">All monitored floors</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="view-attendance-toolbar">
          <div className="toolbar-left">
            <div className="filter-item">
              <label>Hostel Block:</label>
              <select value={selectedHostel} onChange={e => setSelectedHostel(e.target.value)}>
                {hostels.map(h => (
                  <option key={h.code} value={h.name}>{h.name} ({h.code})</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Floor:</label>
              <select value={selectedFloor} onChange={e => setSelectedFloor(e.target.value)}>
                <option value="ALL">All Floors</option>
                {availableFloors.map(fl => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Search Room or Student:</label>
              <div className="input-with-icon">
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Room No, Student Name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="toolbar-right" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* NEW ACTIONS: ADD FLOOR, ADD ROOM, ADD BED */}
            <button
              type="button"
              className="h-btn-action-secondary"
              onClick={() => {
                const nextFloorNum = availableFloors.length + 1;
                setAddFloorForm({
                  floorName: `Floor ${nextFloorNum}`,
                  roomCount: 2,
                  startRoomNumber: `${nextFloorNum}01`,
                  roomType: '4-Bed Standard AC',
                  bedsPerRoom: 4
                });
                setIsAddFloorModalOpen(true);
              }}
              title="Add a new floor to this hostel"
            >
              <Layers size={14} /> + Add Floor
            </button>

            <button
              type="button"
              className="h-btn-action-secondary"
              onClick={() => {
                setAddRoomForm({
                  floor: availableFloors[0] || 'Floor 1',
                  customFloor: '',
                  roomNo: '',
                  type: '4-Bed Standard AC',
                  capacity: 4
                });
                setIsAddRoomModalOpen(true);
              }}
              title="Add a new room to a floor"
            >
              <Home size={14} /> + Add Room
            </button>

            <button
              type="button"
              className="h-btn-action-secondary"
              onClick={() => {
                if (rooms.length > 0) {
                  setAddBedRoomNo(rooms[0].roomNo);
                  setAddBedCustomLabel(`Bed 0${rooms[0].capacity + 1}`);
                }
                setIsAddBedModalOpen(true);
              }}
              title="Add an extra bed to a room"
            >
              <Bed size={14} /> + Add Bed
            </button>

            <button
              type="button"
              className="h-btn-action-primary"
              onClick={() => setIsAllocateModalOpen(true)}
              title="Allocate student to a vacant bed"
            >
              <UserPlus size={15} /> + Allocate New Bed
            </button>
          </div>
        </div>

        {/* Room & Bed Allocation Grid */}
        <div className="room-matrix-grid">
          {filteredRooms.map(rm => {
            const occCount = rm.beds.filter(b => b.status === 'Occupied').length;
            const isFull = occCount === rm.capacity;
            return (
              <div key={rm.roomNo} className={`room-card-box ${isFull ? 'full' : 'has-vacancy'}`}>
                <div className="room-card-header">
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Room {rm.roomNo}</h4>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{rm.floor} · {rm.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className={`room-occ-badge ${isFull ? 'full' : 'vacant'}`}>
                      {occCount} / {rm.capacity} Beds
                    </span>
                    <button
                      type="button"
                      className="quick-add-bed-btn"
                      title={`Add a bed to Room ${rm.roomNo}`}
                      onClick={() => {
                        setAddBedRoomNo(rm.roomNo);
                        setAddBedCustomLabel(`Bed 0${rm.capacity + 1}`);
                        setIsAddBedModalOpen(true);
                      }}
                    >
                      + Bed
                    </button>
                  </div>
                </div>

                <div className="room-beds-list">
                  {rm.beds.map(bed => {
                    const isOccupied = bed.status === 'Occupied';
                    return (
                      <div key={bed.bedNo} className={`bed-slot-item ${isOccupied ? 'occupied' : 'vacant'}`}>
                        <div className="bed-slot-top">
                          <span className="bed-tag">
                            <Bed size={13} /> {bed.bedNo}
                          </span>
                          <span className={`bed-status-indicator ${isOccupied ? 'occ' : 'vac'}`}>
                            {isOccupied ? 'Occupied' : 'Vacant'}
                          </span>
                        </div>

                        {isOccupied ? (
                          <div className="resident-details-box">
                            <strong className="resident-name">{bed.resident}</strong>
                            <div className="resident-meta">Roll: {bed.roll} · {bed.branch}</div>
                            <div className="bed-quick-actions">
                              <button
                                type="button"
                                className="bed-action-btn transfer"
                                title="Transfer to another room"
                                onClick={() =>
                                  setTransferModalData({
                                    sourceRoom: rm.roomNo,
                                    sourceBed: bed.bedNo,
                                    resident: bed.resident,
                                    roll: bed.roll,
                                    branch: bed.branch
                                  })
                                }
                              >
                                ⇄ Transfer
                              </button>
                              <button
                                type="button"
                                className="bed-action-btn vacate"
                                title="Vacate bed"
                                onClick={() => handleVacateBed(rm.roomNo, bed.bedNo, bed.resident)}
                              >
                                ↳ Vacate
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="vacant-slot-cta"
                            onClick={() => {
                              setAllocateForm(prev => ({
                                ...prev,
                                roomNo: rm.roomNo,
                                bedNo: bed.bedNo,
                                floor: rm.floor
                              }));
                              setIsAllocateModalOpen(true);
                            }}
                          >
                            + Click to Allot Bed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL: ADD NEW ROOM ── */}
      {isAddRoomModalOpen && (
        <div className="hostel-modal-overlay" onClick={() => setIsAddRoomModalOpen(false)}>
          <div className="hostel-modal-box" onClick={e => e.stopPropagation()}>
            <div className="hostel-modal-header">
              <div>
                <h3>Add New Room</h3>
                <p>Create a new residential room in {selectedHostel}</p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsAddRoomModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="hostel-modal-body">
              <div className="form-group-field">
                <label>Target Hostel</label>
                <input type="text" value={selectedHostel} disabled style={{ background: '#f8fafc', color: '#64748b' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group-field">
                  <label>Select Floor *</label>
                  <select
                    value={addRoomForm.floor}
                    onChange={e => setAddRoomForm({ ...addRoomForm, floor: e.target.value })}
                  >
                    {availableFloors.map(fl => (
                      <option key={fl} value={fl}>{fl}</option>
                    ))}
                    <option value="CUSTOM">+ Specify New Floor...</option>
                  </select>
                </div>

                <div className="form-group-field">
                  <label>Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104, 203, 301"
                    value={addRoomForm.roomNo}
                    onChange={e => setAddRoomForm({ ...addRoomForm, roomNo: e.target.value })}
                  />
                </div>
              </div>

              {addRoomForm.floor === 'CUSTOM' && (
                <div className="form-group-field">
                  <label>New Floor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Floor 3, Floor 4, Terrace Wing"
                    value={addRoomForm.customFloor}
                    onChange={e => setAddRoomForm({ ...addRoomForm, customFloor: e.target.value })}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group-field">
                  <label>Room Type *</label>
                  <select
                    value={addRoomForm.type}
                    onChange={e => setAddRoomForm({ ...addRoomForm, type: e.target.value })}
                  >
                    <option value="4-Bed Standard AC">4-Bed Standard AC</option>
                    <option value="4-Bed Non-AC Deluxe">4-Bed Non-AC Deluxe</option>
                    <option value="3-Bed Deluxe AC">3-Bed Deluxe AC</option>
                    <option value="2-Bed Double AC">2-Bed Double AC</option>
                    <option value="4-Bed Quad Premium">4-Bed Quad Premium</option>
                  </select>
                </div>

                <div className="form-group-field">
                  <label>Bed Capacity *</label>
                  <select
                    value={addRoomForm.capacity}
                    onChange={e => setAddRoomForm({ ...addRoomForm, capacity: parseInt(e.target.value, 10) })}
                  >
                    <option value={1}>1 Bed (Single)</option>
                    <option value={2}>2 Beds (Double)</option>
                    <option value={3}>3 Beds (Triple)</option>
                    <option value={4}>4 Beds (Quad)</option>
                    <option value={6}>6 Beds (Dorm)</option>
                  </select>
                </div>
              </div>

              <div className="hostel-modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button
                  type="button"
                  className="h-btn-secondary"
                  onClick={() => setIsAddRoomModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="h-btn-action-primary">
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD BED TO ROOM ── */}
      {isAddBedModalOpen && (
        <div className="hostel-modal-overlay" onClick={() => setIsAddBedModalOpen(false)}>
          <div className="hostel-modal-box" onClick={e => e.stopPropagation()}>
            <div className="hostel-modal-header">
              <div>
                <h3>Add Bed to Room</h3>
                <p>Expand capacity of an existing room in {selectedHostel}</p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsAddBedModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBedSubmit} className="hostel-modal-body">
              <div className="form-group-field">
                <label>Target Room *</label>
                <select
                  value={addBedRoomNo}
                  onChange={e => {
                    const r = rooms.find(rm => rm.roomNo === e.target.value);
                    setAddBedRoomNo(e.target.value);
                    if (r) setAddBedCustomLabel(`Bed 0${r.capacity + 1}`);
                  }}
                  required
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.map(rm => (
                    <option key={rm.roomNo} value={rm.roomNo}>
                      Room {rm.roomNo} ({rm.floor} · currently {rm.capacity} beds)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-field">
                <label>Bed Label / Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. Bed 05, Bed 05 (Balcony Side)"
                  value={addBedCustomLabel}
                  onChange={e => setAddBedCustomLabel(e.target.value)}
                />
              </div>

              <div className="hostel-modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button
                  type="button"
                  className="h-btn-secondary"
                  onClick={() => setIsAddBedModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="h-btn-action-primary">
                  Add Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW FLOOR ── */}
      {isAddFloorModalOpen && (
        <div className="hostel-modal-overlay" onClick={() => setIsAddFloorModalOpen(false)}>
          <div className="hostel-modal-box" onClick={e => e.stopPropagation()}>
            <div className="hostel-modal-header">
              <div>
                <h3>Add New Floor</h3>
                <p>Add a new floor and initialize its residential rooms in {selectedHostel}</p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsAddFloorModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFloorSubmit} className="hostel-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group-field">
                  <label>Floor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Floor 3, Floor 4"
                    value={addFloorForm.floorName}
                    onChange={e => setAddFloorForm({ ...addFloorForm, floorName: e.target.value })}
                  />
                </div>

                <div className="form-group-field">
                  <label>Starting Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 301, 401"
                    value={addFloorForm.startRoomNumber}
                    onChange={e => setAddFloorForm({ ...addFloorForm, startRoomNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group-field">
                  <label>Rooms Count *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={addFloorForm.roomCount}
                    onChange={e => setAddFloorForm({ ...addFloorForm, roomCount: e.target.value })}
                  />
                </div>

                <div className="form-group-field">
                  <label>Beds per Room *</label>
                  <select
                    value={addFloorForm.bedsPerRoom}
                    onChange={e => setAddFloorForm({ ...addFloorForm, bedsPerRoom: e.target.value })}
                  >
                    <option value={2}>2 Beds</option>
                    <option value={3}>3 Beds</option>
                    <option value={4}>4 Beds</option>
                    <option value={6}>6 Beds</option>
                  </select>
                </div>

                <div className="form-group-field">
                  <label>Room Type *</label>
                  <select
                    value={addFloorForm.roomType}
                    onChange={e => setAddFloorForm({ ...addFloorForm, roomType: e.target.value })}
                  >
                    <option value="4-Bed Standard AC">Standard AC</option>
                    <option value="4-Bed Non-AC Deluxe">Non-AC Deluxe</option>
                    <option value="4-Bed Deluxe AC">Deluxe AC</option>
                    <option value="4-Bed Quad Premium">Quad Premium</option>
                  </select>
                </div>
              </div>

              <div className="hostel-modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button
                  type="button"
                  className="h-btn-secondary"
                  onClick={() => setIsAddFloorModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="h-btn-action-primary">
                  Create Floor &amp; Rooms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Bed Modal */}
      {isAllocateModalOpen && (
        <div className="hostel-modal-overlay" onClick={() => setIsAllocateModalOpen(false)}>
          <div className="hostel-modal-box" onClick={e => e.stopPropagation()}>
            <div className="hostel-modal-header">
              <div>
                <h3>Allocate Student Bed</h3>
                <p>Assign residential bed to an approved hostel applicant</p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsAllocateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="hostel-modal-body">
              <div className="form-group-field">
                <label>Student Name *</label>
                <input
                  type="text"
                  required
                  value={allocateForm.studentName}
                  onChange={e => setAllocateForm({ ...allocateForm, studentName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-field">
                  <label>Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={allocateForm.regNo}
                    onChange={e => setAllocateForm({ ...allocateForm, regNo: e.target.value })}
                  />
                </div>
                <div className="form-group-field">
                  <label>Class Roll No</label>
                  <input
                    type="text"
                    value={allocateForm.rollNo}
                    onChange={e => setAllocateForm({ ...allocateForm, rollNo: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-field">
                  <label>Target Room Number *</label>
                  <select
                    value={allocateForm.roomNo}
                    onChange={e => {
                      const r = rooms.find(rm => rm.roomNo === e.target.value);
                      setAllocateForm({
                        ...allocateForm,
                        roomNo: e.target.value,
                        floor: r ? r.floor : allocateForm.floor
                      });
                    }}
                  >
                    {rooms.map(rm => (
                      <option key={rm.roomNo} value={rm.roomNo}>
                        Room {rm.roomNo} ({rm.floor})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-field">
                  <label>Target Bed Number *</label>
                  <select
                    value={allocateForm.bedNo}
                    onChange={e => setAllocateForm({ ...allocateForm, bedNo: e.target.value })}
                  >
                    {(() => {
                      const targetRoom = rooms.find(r => r.roomNo === allocateForm.roomNo);
                      const beds = targetRoom ? targetRoom.beds : [];
                      return beds.map(b => (
                        <option key={b.bedNo} value={b.bedNo}>
                          {b.bedNo} ({b.status})
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div className="hostel-modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button
                  type="button"
                  className="h-btn-secondary"
                  onClick={() => setIsAllocateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="h-btn-action-primary">
                  Confirm Bed Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Transfer Modal */}
      {transferModalData && (
        <div className="hostel-modal-overlay" onClick={() => setTransferModalData(null)}>
          <div className="hostel-modal-box" onClick={e => e.stopPropagation()}>
            <div className="hostel-modal-header">
              <div>
                <h3>Student Room Transfer</h3>
                <p>Reassign resident from current bed to a new vacant bed</p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setTransferModalData(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="hostel-modal-body">
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Transferring Resident:</div>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{transferModalData.resident}</strong>
                <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '3px' }}>
                  Current: Room {transferModalData.sourceRoom} ({transferModalData.sourceBed})
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-field">
                  <label>Destination Room *</label>
                  <select
                    value={transferTargetRoom}
                    onChange={e => setTransferTargetRoom(e.target.value)}
                  >
                    {rooms.map(rm => (
                      <option key={rm.roomNo} value={rm.roomNo}>
                        Room {rm.roomNo} ({rm.floor})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-field">
                  <label>Destination Bed *</label>
                  <select
                    value={transferTargetBed}
                    onChange={e => setTransferTargetBed(e.target.value)}
                  >
                    {(() => {
                      const targetRoom = rooms.find(r => r.roomNo === transferTargetRoom);
                      const beds = targetRoom ? targetRoom.beds : [];
                      return beds.map(b => (
                        <option key={b.bedNo} value={b.bedNo}>
                          {b.bedNo} ({b.status})
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div className="hostel-modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button
                  type="button"
                  className="h-btn-secondary"
                  onClick={() => setTransferModalData(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="h-btn-action-primary">
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
