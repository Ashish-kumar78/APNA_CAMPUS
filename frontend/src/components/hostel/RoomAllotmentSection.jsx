import React, { useState, useMemo } from 'react';
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
  LogOut
} from 'lucide-react';
import {
  getAllHostels,
  getAllApplicants
} from '../../services/hostelAttendanceStore.js';
import './HostelModules.css';

export default function RoomAllotmentSection({ account }) {
  const [hostels] = useState(() => getAllHostels());
  const [selectedHostel, setSelectedHostel] = useState('Bhabani Hostel-1');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

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

  // Interactive Room Data
  const [rooms, setRooms] = useState([
    {
      roomNo: '101',
      floor: 'Floor 1',
      type: '4-Bed Standard AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Rakesh Das (2305201001)', roll: '01', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Amit Pattnaik (2305201003)', roll: '03', branch: 'ECE', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '102',
      floor: 'Floor 1',
      type: '4-Bed Standard AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Sourav Mohanty (2305201005)', roll: '05', branch: 'EE', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Debabrata Jena (2305201006)', roll: '06', branch: 'ME', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '103',
      floor: 'Floor 1',
      type: '4-Bed Non-AC Deluxe',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Bikash Rout (2305201008)', roll: '08', branch: 'Civil', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Manoj Tripathy (2305201009)', roll: '09', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '201',
      floor: 'Floor 2',
      type: '4-Bed Deluxe AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Kishore Sethi (2305201011)', roll: '11', branch: 'ME', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Deepak Kumar Barik (2305201012)', roll: '12', branch: 'IT', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '202',
      floor: 'Floor 2',
      type: '4-Bed Deluxe AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 02', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

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

  // Handle Quick Bed Allotment
  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    setRooms(prev =>
      prev.map(rm => {
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
      })
    );
    setIsAllocateModalOpen(false);
    showToast(
      `✓ Successfully allotted Room ${allocateForm.roomNo} (${allocateForm.bedNo}) to ${allocateForm.studentName}!`
    );
  };

  // Handle Vacate Bed
  const handleVacateBed = (roomNo, bedNo, residentName) => {
    if (!window.confirm(`Are you sure you want to vacate ${bedNo} occupied by ${residentName}?`)) {
      return;
    }
    setRooms(prev =>
      prev.map(rm => {
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
      })
    );
    showToast(`✓ Vacated ${bedNo} in Room ${roomNo}. Bed is now available.`);
  };

  // Handle Room Transfer
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferModalData) return;

    // 1. Remove from source room
    setRooms(prev =>
      prev.map(rm => {
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
      })
    );

    setTransferModalData(null);
    showToast(
      `✓ Transferred ${transferModalData.resident} to Room ${transferTargetRoom} (${transferTargetBed}).`
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
          <div className="hostel-role-tag admin-only">
            <ShieldCheck size={16} /> Exclusive to Hostel Admin Role
          </div>
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
                <option value="Floor 1">Floor 1</option>
                <option value="Floor 2">Floor 2</option>
                <option value="Floor 3">Floor 3</option>
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

          <div className="toolbar-right">
            <button
              type="button"
              className="h-btn-action-primary"
              onClick={() => setIsAllocateModalOpen(true)}
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
                  <span className={`room-occ-badge ${isFull ? 'full' : 'vacant'}`}>
                    {occCount} / {rm.capacity} Beds
                  </span>
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
                                <ArrowRightLeft size={11} /> Transfer
                              </button>
                              <button
                                type="button"
                                className="bed-action-btn vacate"
                                title="Vacate bed"
                                onClick={() => handleVacateBed(rm.roomNo, bed.bedNo, bed.resident)}
                              >
                                <LogOut size={11} /> Vacate
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
                    onChange={e => setAllocateForm({ ...allocateForm, roomNo: e.target.value })}
                  >
                    <option value="101">Room 101 (Floor 1)</option>
                    <option value="102">Room 102 (Floor 1)</option>
                    <option value="103">Room 103 (Floor 1)</option>
                    <option value="201">Room 201 (Floor 2)</option>
                    <option value="202">Room 202 (Floor 2)</option>
                  </select>
                </div>
                <div className="form-group-field">
                  <label>Target Bed Number *</label>
                  <select
                    value={allocateForm.bedNo}
                    onChange={e => setAllocateForm({ ...allocateForm, bedNo: e.target.value })}
                  >
                    <option value="Bed 01">Bed 01 (Window Side)</option>
                    <option value="Bed 02">Bed 02 (Study Side)</option>
                    <option value="Bed 03">Bed 03 (Inner Side)</option>
                    <option value="Bed 04">Bed 04 (Door Side)</option>
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
                    <option value="101">Room 101</option>
                    <option value="102">Room 102</option>
                    <option value="103">Room 103</option>
                    <option value="201">Room 201</option>
                    <option value="202">Room 202</option>
                  </select>
                </div>
                <div className="form-group-field">
                  <label>Destination Bed *</label>
                  <select
                    value={transferTargetBed}
                    onChange={e => setTransferTargetBed(e.target.value)}
                  >
                    <option value="Bed 01">Bed 01 (Window Side)</option>
                    <option value="Bed 02">Bed 02 (Study Side)</option>
                    <option value="Bed 03">Bed 03 (Inner Side)</option>
                    <option value="Bed 04">Bed 04 (Door Side)</option>
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
