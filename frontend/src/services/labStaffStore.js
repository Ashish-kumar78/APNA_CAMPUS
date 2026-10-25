// ==============================================================================
// College Management ERP — Laboratory Staff Reactive Local Data Store
// Manages local state, localStorage persistence, and cross-tab/component reactivity
// ==============================================================================

import {
  BRANCHES_CONFIG,
  STAFF_PROFILE_DEFAULT,
  INITIAL_LABORATORIES,
  INITIAL_TIMETABLE,
  INITIAL_EXPERIMENTS,
  INITIAL_STUDENTS_BATCH_A1,
  INITIAL_EQUIPMENT,
  INITIAL_ISSUE_RETURN,
  INITIAL_CONSUMABLES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_MAINTENANCE_ORDERS,
  INITIAL_PREVENTIVE_SCHEDULE,
  INITIAL_SAFETY_INSPECTIONS,
  INITIAL_REQUISITIONS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_DISPATCH_RECORDS,
  INITIAL_HANDOVERS,
  INITIAL_STAFF_NOTIFICATIONS
} from '../components/StaffModules/labStaffData.js';

const STORAGE_KEY = 'apna_lab_staff_master_v2';

class LabStaffStore {
  constructor() {
    this.listeners = new Set();
    this.data = this.loadInitialData();
  }

  loadInitialData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          currentBranch: parsed.currentBranch || 'CSE',
          activeLabId: parsed.activeLabId || 'CSE-LAB-02',
          profile: parsed.profile || { ...STAFF_PROFILE_DEFAULT },
          laboratories: parsed.laboratories || [...INITIAL_LABORATORIES],
          timetable: parsed.timetable || [...INITIAL_TIMETABLE],
          experiments: parsed.experiments || [...INITIAL_EXPERIMENTS],
          students: parsed.students || [...INITIAL_STUDENTS_BATCH_A1],
          equipment: parsed.equipment || [...INITIAL_EQUIPMENT],
          issueReturn: parsed.issueReturn || [...INITIAL_ISSUE_RETURN],
          consumables: parsed.consumables || [...INITIAL_CONSUMABLES],
          stockMovements: parsed.stockMovements || [...INITIAL_STOCK_MOVEMENTS],
          maintenanceOrders: parsed.maintenanceOrders || [...INITIAL_MAINTENANCE_ORDERS],
          preventiveSchedule: parsed.preventiveSchedule || [...INITIAL_PREVENTIVE_SCHEDULE],
          safetyInspections: parsed.safetyInspections || [...INITIAL_SAFETY_INSPECTIONS],
          requisitions: parsed.requisitions || [...INITIAL_REQUISITIONS],
          purchaseRequests: parsed.purchaseRequests || [...INITIAL_PURCHASE_REQUESTS],
          dispatchRecords: parsed.dispatchRecords || [...INITIAL_DISPATCH_RECORDS],
          handovers: parsed.handovers || [...INITIAL_HANDOVERS],
          notifications: parsed.notifications || [...INITIAL_STAFF_NOTIFICATIONS],
          evaluations: parsed.evaluations || [],
          preferences: parsed.preferences || {
            theme: 'dark-navy',
            pageSize: 10,
            autoRefresh: true,
            alertSound: true
          }
        };
      }
    } catch (e) {
      console.warn('Error reading lab staff state from localStorage', e);
    }

    return {
      currentBranch: 'CSE',
      activeLabId: 'CSE-LAB-02',
      profile: { ...STAFF_PROFILE_DEFAULT },
      laboratories: [...INITIAL_LABORATORIES],
      timetable: [...INITIAL_TIMETABLE],
      experiments: [...INITIAL_EXPERIMENTS],
      students: [...INITIAL_STUDENTS_BATCH_A1],
      equipment: [...INITIAL_EQUIPMENT],
      issueReturn: [...INITIAL_ISSUE_RETURN],
      consumables: [...INITIAL_CONSUMABLES],
      stockMovements: [...INITIAL_STOCK_MOVEMENTS],
      maintenanceOrders: [...INITIAL_MAINTENANCE_ORDERS],
      preventiveSchedule: [...INITIAL_PREVENTIVE_SCHEDULE],
      safetyInspections: [...INITIAL_SAFETY_INSPECTIONS],
      requisitions: [...INITIAL_REQUISITIONS],
      purchaseRequests: [...INITIAL_PURCHASE_REQUESTS],
      dispatchRecords: [...INITIAL_DISPATCH_RECORDS],
      handovers: [...INITIAL_HANDOVERS],
      notifications: [...INITIAL_STAFF_NOTIFICATIONS],
      evaluations: [],
      preferences: {
        theme: 'dark-navy',
        pageSize: 10,
        autoRefresh: true,
        alertSound: true
      }
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save lab staff state to localStorage', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.data);
      } catch (err) {
        console.error('Error in lab staff subscriber callback', err);
      }
    });
  }

  // --- Branch & Profile ---
  getBranch() {
    return this.data.currentBranch;
  }

  setBranch(branchKey) {
    if (BRANCHES_CONFIG[branchKey]) {
      this.data.currentBranch = branchKey;
      const branchLabs = this.data.laboratories.filter(l => l.department === branchKey);
      if (branchLabs.length > 0) {
        this.data.activeLabId = branchLabs[0].id;
        this.data.profile.department = branchKey;
        this.data.profile.assignedLabs = branchLabs.map(l => l.id);
      }
      this.save();
    }
  }

  getActiveLabId() {
    return this.data.activeLabId;
  }

  setActiveLabId(labId) {
    this.data.activeLabId = labId;
    this.save();
  }

  getProfile() {
    return this.data.profile;
  }

  updateProfile(newProfile) {
    this.data.profile = { ...this.data.profile, ...newProfile };
    this.save();
  }

  toggleRole() {
    const nextRole = this.data.profile.role === 'Lab In-Charge' ? 'Lab Technician' : 'Lab In-Charge';
    this.data.profile.role = nextRole;
    this.save();
    return nextRole;
  }

  // --- Laboratories ---
  getLaboratories(branch = null) {
    const list = this.data.laboratories;
    if (branch) return list.filter(l => l.department === branch);
    return list;
  }

  addLaboratory(lab) {
    const newLab = {
      ...lab,
      id: lab.id || `${lab.department}-LAB-${String(this.data.laboratories.length + 1).padStart(2, '0')}`,
      status: lab.status || 'Operational',
      equipmentCount: Number(lab.equipmentCount) || 0,
      activeSessionsToday: 0,
      safetyStatus: 'Compliant'
    };
    this.data.laboratories.unshift(newLab);
    this.save();
    return newLab;
  }

  updateLaboratory(id, patch) {
    this.data.laboratories = this.data.laboratories.map(l => l.id === id ? { ...l, ...patch } : l);
    this.save();
  }

  // --- Timetable & Practical Sessions ---
  getTimetable(branch = null) {
    const list = this.data.timetable;
    if (branch) return list.filter(t => t.department === branch);
    return list;
  }

  addTimetableSession(session) {
    const newSession = {
      ...session,
      id: `SES-${Date.now().toString().slice(-6)}`,
      status: session.status || 'Scheduled',
      attendanceTaken: false,
      presentCount: 0,
      absentCount: 0,
      readinessCompleted: false
    };
    this.data.timetable.unshift(newSession);
    this.save();
    return newSession;
  }

  updateSessionStatus(id, newStatus) {
    this.data.timetable = this.data.timetable.map(s => s.id === id ? { ...s, status: newStatus } : s);
    this.save();
  }

  markSessionReadiness(id, isReady = true, notes = '') {
    this.data.timetable = this.data.timetable.map(s => 
      s.id === id ? { ...s, readinessCompleted: isReady, readinessNotes: notes } : s
    );
    this.save();
  }

  // --- Student Attendance ---
  getStudents() {
    return this.data.students;
  }

  saveAttendance(sessionId, studentList, sessionNotes = '') {
    const present = studentList.filter(s => s.attendanceStatus === 'Present').length;
    const absent = studentList.filter(s => s.attendanceStatus === 'Absent').length;
    const late = studentList.filter(s => s.attendanceStatus === 'Late').length;
    const excused = studentList.filter(s => s.attendanceStatus === 'Excused').length;

    this.data.students = studentList;
    this.data.timetable = this.data.timetable.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          attendanceTaken: true,
          presentCount: present,
          absentCount: absent,
          lateCount: late,
          excusedCount: excused,
          sessionNotes
        };
      }
      return s;
    });
    this.save();
  }

  // --- Experiments & Evaluations ---
  getExperiments(branch = null) {
    const list = this.data.experiments;
    if (branch) return list.filter(e => e.department === branch);
    return list;
  }

  addExperiment(exp) {
    const newExp = {
      ...exp,
      id: `EXP-${exp.department || 'GEN'}-${String(this.data.experiments.length + 1).padStart(3, '0')}`,
      status: exp.status || 'Approved'
    };
    this.data.experiments.unshift(newExp);
    this.save();
    return newExp;
  }

  getEvaluations() {
    return this.data.evaluations;
  }

  saveEvaluation(evaluation) {
    const existingIndex = this.data.evaluations.findIndex(e => e.id === evaluation.id);
    if (existingIndex >= 0) {
      this.data.evaluations[existingIndex] = evaluation;
    } else {
      this.data.evaluations.unshift({
        ...evaluation,
        id: evaluation.id || `EVAL-${Date.now().toString().slice(-6)}`,
        date: evaluation.date || new Date().toISOString().split('T')[0]
      });
    }
    this.save();
  }

  // --- Equipment Register ---
  getEquipment(branch = null) {
    const list = this.data.equipment;
    if (branch) return list.filter(e => e.department === branch);
    return list;
  }

  addEquipment(item) {
    const newItem = {
      ...item,
      id: item.id || `EQ-${item.department || 'GEN'}-${String(this.data.equipment.length + 1).padStart(3, '0')}`,
      condition: item.condition || 'Excellent',
      status: item.status || 'Available',
      responsibleStaff: item.responsibleStaff || this.data.profile.name
    };
    this.data.equipment.unshift(newItem);
    this.save();
    return newItem;
  }

  updateEquipment(id, patch) {
    this.data.equipment = this.data.equipment.map(e => e.id === id ? { ...e, ...patch } : e);
    this.save();
  }

  deleteEquipment(id) {
    this.data.equipment = this.data.equipment.filter(e => e.id !== id);
    this.save();
  }

  // --- Equipment Issue & Return ---
  getIssueReturn(branch = null) {
    const list = this.data.issueReturn;
    if (branch) return list.filter(i => i.department === branch);
    return list;
  }

  issueEquipment(record) {
    const newRecord = {
      ...record,
      id: `ISS-${new Date().getFullYear()}-${String(this.data.issueReturn.length + 80).padStart(3, '0')}`,
      status: 'Issued',
      returnDate: null,
      returnCondition: null
    };
    this.data.issueReturn.unshift(newRecord);

    // Update equipment availability to 'In Use'
    this.data.equipment = this.data.equipment.map(e => {
      if (e.id === record.assetId) {
        return { ...e, status: 'In Use' };
      }
      return e;
    });

    this.save();
    return newRecord;
  }

  returnEquipment(issueId, returnCondition, remarks) {
    let returnedAssetId = null;
    this.data.issueReturn = this.data.issueReturn.map(i => {
      if (i.id === issueId) {
        returnedAssetId = i.assetId;
        return {
          ...i,
          status: 'Returned',
          returnDate: new Date().toISOString().split('T')[0],
          returnCondition: returnCondition || 'Good',
          remarks: remarks ? `${i.remarks} | Return remarks: ${remarks}` : i.remarks
        };
      }
      return i;
    });

    if (returnedAssetId) {
      this.data.equipment = this.data.equipment.map(e => {
        if (e.id === returnedAssetId) {
          return {
            ...e,
            status: returnCondition === 'Damaged' ? 'Damaged' : 'Available',
            condition: returnCondition || e.condition
          };
        }
        return e;
      });
    }

    this.save();
  }

  // --- Consumables & Stock Movements ---
  getConsumables(branch = null) {
    const list = this.data.consumables;
    if (branch) return list.filter(c => c.department === branch);
    return list;
  }

  addConsumable(item) {
    const newItem = {
      ...item,
      id: item.id || `CON-${item.department || 'GEN'}-${String(this.data.consumables.length + 1).padStart(3, '0')}`,
      currentStock: Number(item.currentStock) || 0,
      minStock: Number(item.minStock) || 5,
      reorderQty: Number(item.reorderQty) || 10,
      status: Number(item.currentStock) === 0 ? 'Critical / Out of Stock' : (Number(item.currentStock) <= Number(item.minStock) ? 'Low Stock' : 'Adequate')
    };
    this.data.consumables.unshift(newItem);
    this.save();
    return newItem;
  }

  recordStockMovement({ itemId, movementType, quantity, requestedBy, reason }) {
    const qty = Number(quantity);
    let updatedItem = null;

    this.data.consumables = this.data.consumables.map(item => {
      if (item.id === itemId) {
        let newStock = item.currentStock;
        if (movementType === 'Stock In') {
          newStock += qty;
        } else if (movementType === 'Stock Out') {
          if (newStock < qty) {
            throw new Error(`Insufficient stock: Only ${newStock} ${item.unit} available.`);
          }
          newStock -= qty;
        } else if (movementType === 'Adjustment') {
          newStock = qty;
        }

        let newStatus = 'Adequate';
        if (newStock === 0) newStatus = 'Critical / Out of Stock';
        else if (newStock <= item.minStock) newStatus = 'Low Stock';

        updatedItem = {
          ...item,
          currentStock: newStock,
          status: newStatus
        };
        return updatedItem;
      }
      return item;
    });

    if (updatedItem) {
      const movement = {
        id: `MOV-${new Date().getFullYear()}-${String(this.data.stockMovements.length + 301).padStart(3, '0')}`,
        itemId: updatedItem.id,
        itemName: updatedItem.name,
        movementType,
        quantity: qty,
        unit: updatedItem.unit,
        date: new Date().toLocaleString(),
        requestedBy: requestedBy || this.data.profile.name,
        reason: reason || 'Routine inventory adjustment',
        remainingStock: updatedItem.currentStock
      };
      this.data.stockMovements.unshift(movement);
    }

    this.save();
    return updatedItem;
  }

  getStockMovements() {
    return this.data.stockMovements;
  }

  // --- Maintenance Work Orders ---
  getMaintenanceOrders(branch = null) {
    const list = this.data.maintenanceOrders;
    if (branch) return list.filter(m => m.department === branch);
    return list;
  }

  createMaintenanceOrder(order) {
    const newOrder = {
      ...order,
      id: `WO-${new Date().getFullYear()}-${String(this.data.maintenanceOrders.length + 42).padStart(3, '0')}`,
      status: 'Open',
      reportedDate: new Date().toISOString().split('T')[0],
      reportedBy: order.reportedBy || this.data.profile.name,
      estimatedCost: Number(order.estimatedCost) || 0
    };
    this.data.maintenanceOrders.unshift(newOrder);

    // If an asset is linked, mark it as Under Maintenance
    if (order.assetId) {
      this.data.equipment = this.data.equipment.map(e => {
        if (e.id === order.assetId) {
          return { ...e, status: 'Under Maintenance' };
        }
        return e;
      });
    }

    this.save();
    return newOrder;
  }

  updateMaintenanceOrder(id, patch) {
    this.data.maintenanceOrders = this.data.maintenanceOrders.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...patch };
        // If resolved or closed, restore equipment status to Available
        if ((patch.status === 'Resolved' || patch.status === 'Closed') && updated.assetId) {
          this.data.equipment = this.data.equipment.map(e => 
            e.id === updated.assetId ? { ...e, status: 'Available' } : e
          );
        }
        return updated;
      }
      return m;
    });
    this.save();
  }

  getPreventiveSchedule(branch = null) {
    const list = this.data.preventiveSchedule;
    if (branch) return list.filter(p => p.department === branch);
    return list;
  }

  // --- Safety Inspections ---
  getSafetyInspections(branch = null) {
    const list = this.data.safetyInspections;
    if (branch) return list.filter(s => s.department === branch);
    return list;
  }

  saveSafetyInspection(inspection) {
    const newInspection = {
      ...inspection,
      id: `INSP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      date: inspection.date || new Date().toISOString().split('T')[0],
      inspectorName: inspection.inspectorName || this.data.profile.name
    };
    this.data.safetyInspections.unshift(newInspection);
    this.save();
    return newInspection;
  }

  // --- Consumable Requisitions & Capex ---
  getRequisitions(branch = null) {
    const list = this.data.requisitions;
    if (branch) return list.filter(r => r.department === branch);
    return list;
  }

  createRequisition(req) {
    const newReq = {
      ...req,
      id: `REQ-${new Date().getFullYear()}-${String(this.data.requisitions.length + 109).padStart(3, '0')}`,
      requisitionNo: `REQ/${req.department || 'CSE'}/${new Date().getFullYear()}/${String(this.data.requisitions.length + 43).padStart(3, '0')}`,
      requestDate: new Date().toISOString().split('T')[0],
      requestingStaff: req.requestingStaff || this.data.profile.name,
      status: 'Pending Approval',
      approvalTimeline: [
        { step: 'Requisition Drafted', by: this.data.profile.name, date: new Date().toLocaleString(), status: 'Completed' },
        { step: 'Lab In-Charge Verification', by: this.data.profile.name, date: new Date().toLocaleString(), status: 'Completed' },
        { step: 'HOD Recommendation', by: 'Head of Department', date: 'Pending', status: 'In Review' },
        { step: 'Central Store Dispatch', by: 'Purchase & Stores Officer', date: 'Upcoming', status: 'Pending' }
      ]
    };
    this.data.requisitions.unshift(newReq);
    this.save();
    return newReq;
  }

  updateRequisitionStatus(id, newStatus, reviewerNotes = '') {
    this.data.requisitions = this.data.requisitions.map(r => {
      if (r.id === id) {
        const timeline = [...(r.approvalTimeline || [])];
        timeline.push({
          step: `Status changed to ${newStatus}`,
          by: this.data.profile.name,
          date: new Date().toLocaleString(),
          status: newStatus,
          notes: reviewerNotes
        });
        return {
          ...r,
          status: newStatus,
          approvalTimeline: timeline
        };
      }
      return r;
    });
    this.save();
  }

  getPurchaseRequests(branch = null) {
    const list = this.data.purchaseRequests;
    if (branch) return list.filter(p => p.department === branch);
    return list;
  }

  createPurchaseRequest(pr) {
    const newPr = {
      ...pr,
      id: `PR-${new Date().getFullYear()}-${String(this.data.purchaseRequests.length + 12).padStart(3, '0')}`,
      refNo: `CAPEX/${pr.department || 'CSE'}/${new Date().getFullYear()}/PR-${String(this.data.purchaseRequests.length + 4).padStart(2, '0')}`,
      submittedDate: new Date().toISOString().split('T')[0],
      requestingStaff: pr.requestingStaff || this.data.profile.name,
      status: 'Under Academic Council Review'
    };
    this.data.purchaseRequests.unshift(newPr);
    this.save();
    return newPr;
  }

  // --- Dispatch & Handovers ---
  getDispatchRecords(branch = null) {
    const list = this.data.dispatchRecords;
    if (branch) return list.filter(d => d.department === branch || d.department === 'All Departments');
    return list;
  }

  addDispatchRecord(doc) {
    const newDoc = {
      ...doc,
      id: `DSP-${new Date().getFullYear()}-${String(this.data.dispatchRecords.length + 204).padStart(3, '0')}`,
      date: doc.date || new Date().toISOString().split('T')[0],
      responsibleStaff: doc.responsibleStaff || this.data.profile.name
    };
    this.data.dispatchRecords.unshift(newDoc);
    this.save();
    return newDoc;
  }

  getHandovers(branch = null) {
    const list = this.data.handovers;
    if (branch) return list.filter(h => h.department === branch);
    return list;
  }

  createHandover(handover) {
    const newHandover = {
      ...handover,
      id: `HND-${new Date().getFullYear()}-${String(this.data.handovers.length + 52).padStart(3, '0')}`,
      handoverDate: handover.handoverDate || new Date().toLocaleString(),
      outgoingStaff: handover.outgoingStaff || this.data.profile.name,
      signoffStatus: 'Signed & Acknowledged'
    };
    this.data.handovers.unshift(newHandover);
    this.save();
    return newHandover;
  }

  // --- Notifications ---
  getNotifications() {
    return this.data.notifications;
  }

  markNotificationRead(id) {
    this.data.notifications = this.data.notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    this.save();
  }

  markAllNotificationsRead() {
    this.data.notifications = this.data.notifications.map(n => ({ ...n, unread: false }));
    this.save();
  }

  getUnreadNotificationsCount() {
    return this.data.notifications.filter(n => n.unread).length;
  }

  // --- Preferences ---
  getPreferences() {
    return this.data.preferences;
  }

  updatePreferences(pref) {
    this.data.preferences = { ...this.data.preferences, ...pref };
    this.save();
  }

  // --- Factory Reset ---
  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadInitialData();
    this.notify();
  }
}

export const labStaffStore = new LabStaffStore();
