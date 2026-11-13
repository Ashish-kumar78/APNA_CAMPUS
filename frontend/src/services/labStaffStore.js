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
  INITIAL_STAFF_NOTIFICATIONS,
  INITIAL_COMPLAINTS
} from '../components/StaffModules/labStaffData.js';

const STORAGE_KEY = 'apna_lab_staff_master_v2';

const mergeById = (storedList, initialList) => {
  const merged = [...(storedList || [])];
  (initialList || []).forEach(item => {
    if (!merged.some(m => m.id === item.id)) {
      merged.push(item);
    }
  });
  return merged;
};

class LabStaffStore {
  constructor() {
    this.listeners = new Set();
    this.data = this.loadInitialData();
  }

  loadInitialData() {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            currentBranch: parsed.currentBranch || 'CSE',
            activeLabId: parsed.activeLabId || 'CSE-LAB-02',
            profile: parsed.profile || { ...STAFF_PROFILE_DEFAULT },
            laboratories: mergeById(parsed.laboratories, INITIAL_LABORATORIES),
            timetable: mergeById(parsed.timetable, INITIAL_TIMETABLE),
            experiments: mergeById(parsed.experiments, INITIAL_EXPERIMENTS),
            students: mergeById(parsed.students, INITIAL_STUDENTS_BATCH_A1),
            equipment: mergeById(parsed.equipment, INITIAL_EQUIPMENT),
            issueReturn: mergeById(parsed.issueReturn, INITIAL_ISSUE_RETURN),
            consumables: mergeById(parsed.consumables, INITIAL_CONSUMABLES),
            stockMovements: mergeById(parsed.stockMovements, INITIAL_STOCK_MOVEMENTS),
            maintenanceOrders: mergeById(parsed.maintenanceOrders, INITIAL_MAINTENANCE_ORDERS),
            complaints: mergeById(parsed.complaints, INITIAL_COMPLAINTS),
            preventiveSchedule: mergeById(parsed.preventiveSchedule, INITIAL_PREVENTIVE_SCHEDULE),
            safetyInspections: mergeById(parsed.safetyInspections, INITIAL_SAFETY_INSPECTIONS),
            requisitions: mergeById(parsed.requisitions, INITIAL_REQUISITIONS),
            purchaseRequests: mergeById(parsed.purchaseRequests, INITIAL_PURCHASE_REQUESTS),
            dispatchRecords: mergeById(parsed.dispatchRecords, INITIAL_DISPATCH_RECORDS),
            handovers: mergeById(parsed.handovers, INITIAL_HANDOVERS),
            notifications: mergeById(parsed.notifications, INITIAL_STAFF_NOTIFICATIONS),
            auditLogs: parsed.auditLogs || [],
            evaluations: parsed.evaluations || [],
            preferences: parsed.preferences || {
              theme: 'dark-navy',
              pageSize: 10,
              autoRefresh: true,
              alertSound: true
            }
          };
        }
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
      complaints: [...INITIAL_COMPLAINTS],
      preventiveSchedule: [...INITIAL_PREVENTIVE_SCHEDULE],
      safetyInspections: [...INITIAL_SAFETY_INSPECTIONS],
      requisitions: [...INITIAL_REQUISITIONS],
      purchaseRequests: [...INITIAL_PURCHASE_REQUESTS],
      dispatchRecords: [...INITIAL_DISPATCH_RECORDS],
      handovers: [...INITIAL_HANDOVERS],
      notifications: [...INITIAL_STAFF_NOTIFICATIONS],
      auditLogs: [],
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
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
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
      // Asynchronously trigger live synchronization with NestJS backend
      this.syncWithBackend(branchKey).catch(() => {});
    }
  }

  async syncWithBackend(branchKey = this.data.currentBranch) {
    try {
      if (typeof fetch === 'undefined') return;
      const token = typeof window !== 'undefined' ? (window.localStorage?.getItem('auth_token') || '') : '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [labsRes, eqRes, reqRes, cmpRes, sessRes] = await Promise.allSettled([
        fetch(`/api/laboratories?department=${branchKey}`, { headers }),
        fetch(`/api/laboratories/equipment?department=${branchKey}`, { headers }),
        fetch(`/api/laboratories/requisitions?department=${branchKey}`, { headers }),
        fetch(`/api/laboratories/complaints?department=${branchKey}`, { headers }),
        fetch(`/api/laboratories/sessions?department=${branchKey}`, { headers }),
      ]);

      let changed = false;
      if (labsRes.status === 'fulfilled' && labsRes.value.ok) {
        const liveLabs = await labsRes.value.json();
        if (Array.isArray(liveLabs) && liveLabs.length > 0) {
          const formatted = liveLabs.map(l => ({
            id: l.code,
            name: l.name,
            department: l.department,
            building: l.building,
            room: l.room,
            capacity: l.capacity,
            status: l.status,
            safetyStatus: l.safetyStatus,
            assignedStaff: l.assignedStaff || 'Lab Technical Staff',
            inCharge: l.inChargeName || 'Department HOD',
          }));
          this.data.laboratories = [
            ...this.data.laboratories.filter(l => l.department !== branchKey),
            ...formatted,
          ];
          changed = true;
        }
      }

      if (eqRes.status === 'fulfilled' && eqRes.value.ok) {
        const liveEq = await eqRes.value.json();
        if (Array.isArray(liveEq) && liveEq.length > 0) {
          const formatted = liveEq.map(e => ({
            id: e.equipmentCode,
            name: e.equipmentName,
            category: e.category,
            department: e.department,
            assignedLab: e.labCode,
            status: e.status,
            condition: e.condition,
            serialNo: e.equipmentCode,
          }));
          this.data.equipment = [
            ...this.data.equipment.filter(e => e.department !== branchKey),
            ...formatted,
          ];
          changed = true;
        }
      }

      if (reqRes.status === 'fulfilled' && reqRes.value.ok) {
        const liveReqs = await reqRes.value.json();
        if (Array.isArray(liveReqs) && liveReqs.length > 0) {
          const formatted = liveReqs.map(r => ({
            id: r.id,
            requisitionNo: r.requisitionNumber,
            department: r.department,
            labId: r.labCode,
            itemName: r.equipmentName,
            quantity: r.requestedQuantity,
            status: r.status,
            priority: r.urgency,
            reason: r.reason,
            requestingStaff: r.requesterName,
          }));
          this.data.requisitions = [
            ...this.data.requisitions.filter(r => r.department !== branchKey),
            ...formatted,
          ];
          changed = true;
        }
      }

      if (cmpRes.status === 'fulfilled' && cmpRes.value.ok) {
        const liveCmps = await cmpRes.value.json();
        if (Array.isArray(liveCmps) && liveCmps.length > 0) {
          const formattedComplaints = liveCmps.map(c => ({
            id: c.complaintNumber || c.id,
            complaintNumber: c.complaintNumber,
            workOrderNumber: c.workOrderNumber,
            department: c.department,
            labId: c.labCode,
            equipmentId: c.equipmentCode,
            equipmentName: c.equipmentName,
            category: c.issueType,
            status: c.status,
            priority: c.priority,
            description: c.description,
            photoUrl: c.photoUrl,
            assignedTechnician: c.assignedTechnician,
            adminRemarks: c.adminRemarks,
            resolutionNotes: c.resolutionNotes,
            reportedBy: c.reporterName,
            reportedDate: c.createdAt ? c.createdAt.split('T')[0] : '2026-10-24',
          }));

          const formattedOrders = liveCmps
            .filter(c => c.workOrderNumber)
            .map(c => ({
              id: c.workOrderNumber,
              department: c.department,
              labId: c.labCode,
              assetName: c.equipmentName,
              status: c.status,
              priority: c.priority,
              description: c.description,
              assignedTechnician: c.assignedTechnician,
              reportedDate: c.createdAt ? c.createdAt.split('T')[0] : '2026-10-24',
            }));

          this.data.complaints = [
            ...(this.data.complaints || []).filter(c => c.department !== branchKey),
            ...formattedComplaints,
          ];

          if (formattedOrders.length > 0) {
            this.data.maintenanceOrders = [
              ...this.data.maintenanceOrders.filter(m => m.department !== branchKey),
              ...formattedOrders,
            ];
          }
          changed = true;
        }
      }

      if (changed) {
        this.save();
      }
    } catch (e) {
      // Graceful offline fallback
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
  getStudents(branch = null) {
    const list = this.data.students || [];
    if (branch && branch !== 'ALL') {
      return list.filter(s => !s.department || s.department === branch || s.roll?.startsWith(branch));
    }
    return list;
  }

  saveAttendance(sessionId, studentList, sessionNotes = '') {
    const present = studentList.filter(s => s.attendanceStatus === 'Present').length;
    const absent = studentList.filter(s => s.attendanceStatus === 'Absent').length;
    const late = studentList.filter(s => s.attendanceStatus === 'Late').length;
    const excused = studentList.filter(s => s.attendanceStatus === 'Excused').length;

    this.data.students = studentList;
    let updatedSession = null;
    this.data.timetable = this.data.timetable.map(s => {
      if (s.id === sessionId) {
        updatedSession = {
          ...s,
          attendanceTaken: true,
          status: 'Completed',
          presentCount: present,
          absentCount: absent,
          lateCount: late,
          excusedCount: excused,
          sessionNotes
        };
        return updatedSession;
      }
      return s;
    });

    if (updatedSession && Array.isArray(this.data.notifications)) {
      this.data.notifications.unshift({
        id: `NOTIF-ATT-${Date.now().toString().slice(-4)}`,
        category: 'Academics',
        title: 'Practical Attendance Recorded',
        message: `Attendance marked for "${updatedSession.subject || 'Practical Session'}" (${updatedSession.batch}): ${present} Present, ${absent} Absent.`,
        time: 'Just now',
        unread: true,
        priority: 'Medium',
        actionRoute: 'academics'
      });
    }

    this.save();

    // Asynchronously dispatch to backend
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const token = window.localStorage?.getItem('auth_token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const presentStudents = studentList.filter(s => s.attendanceStatus === 'Present' || s.attendanceStatus === 'Late').map(s => s.regNo || s.roll);
        const absentStudents = studentList.filter(s => s.attendanceStatus === 'Absent').map(s => s.regNo || s.roll);

        fetch(`/api/laboratories/sessions/${sessionId}/attendance`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ presentStudents, absentStudents, notes: sessionNotes })
        }).catch(() => {});
      } catch (e) {}
    }

    return updatedSession;
  }

  // --- Experiments & Evaluations ---
  getExperiments(branch = null) {
    const list = this.data.experiments;
    if (branch && branch !== 'ALL') return list.filter(e => e.department === branch);
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

  getEvaluations(branch = null) {
    const list = this.data.evaluations || [];
    if (branch && branch !== 'ALL') {
      return list.filter(e => e.department === branch || e.roll?.startsWith(branch));
    }
    return list;
  }

  saveEvaluation(evaluation) {
    const experimentation = Number(evaluation.experimentation || 0);
    const viva = Number(evaluation.viva || 0);
    const recordWork = Number(evaluation.recordWork || 0);
    const timeliness = Number(evaluation.timeliness || 0);
    const totalScore = evaluation.totalScore ?? (experimentation + viva + recordWork + timeliness);

    let grade = evaluation.grade;
    if (!grade) {
      if (totalScore >= 36) grade = 'O';
      else if (totalScore >= 32) grade = 'A+';
      else if (totalScore >= 28) grade = 'A';
      else if (totalScore >= 24) grade = 'B+';
      else if (totalScore >= 20) grade = 'B';
      else grade = 'C';
    }

    const payload = {
      ...evaluation,
      id: evaluation.id || `EVAL-${Date.now().toString().slice(-6)}`,
      totalScore,
      grade,
      date: evaluation.date || new Date().toISOString().split('T')[0]
    };

    const existingIndex = (this.data.evaluations || []).findIndex(e => e.id === payload.id);
    if (!Array.isArray(this.data.evaluations)) {
      this.data.evaluations = [];
    }
    if (existingIndex >= 0) {
      this.data.evaluations[existingIndex] = payload;
    } else {
      this.data.evaluations.unshift(payload);
    }
    this.save();
    return payload;
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

  // --- Equipment Complaints & Repair Tracking ---
  getComplaints(branch = null) {
    const list = this.data.complaints || [];
    if (branch) return list.filter(c => c.department === branch);
    return list;
  }

  createComplaint(complaintData) {
    const nextSeq = String((this.data.complaints?.length || 0) + 1).padStart(3, '0');
    const nextId = `CMP-${new Date().getFullYear()}-${nextSeq}`;
    
    const newComplaint = {
      id: nextId,
      complaintNumber: nextId,
      department: (complaintData.department || this.data.currentBranch).toUpperCase(),
      labId: complaintData.labId || this.data.activeLabId,
      labName: complaintData.labName || `Laboratory ${complaintData.labId || this.data.activeLabId}`,
      equipmentId: complaintData.equipmentId || null,
      equipmentName: complaintData.equipmentName || 'Laboratory Equipment / Infrastructure',
      category: complaintData.category || 'Damaged instruments',
      priority: complaintData.priority || 'Medium',
      description: complaintData.description || '',
      photoUrl: complaintData.photoUrl || null,
      reportedBy: complaintData.reportedBy || this.data.profile.name,
      reportedDate: new Date().toISOString().split('T')[0],
      status: 'Submitted', // Initial status: Staff Lab submission (Pending Admin Review)
      workOrderNumber: null,
      assignedTechnician: null,
      adminRemarks: null,
      resolutionNotes: null,
    };

    if (!Array.isArray(this.data.complaints)) {
      this.data.complaints = [];
    }
    this.data.complaints.unshift(newComplaint);

    // If linked to an equipment, mark equipment status & condition as 'Damaged' (NOT auto-repaired)
    if (newComplaint.equipmentId) {
      this.data.equipment = this.data.equipment.map(e => {
        if (e.id === newComplaint.equipmentId) {
          return {
            ...e,
            status: 'Damaged',
            condition: 'Damaged'
          };
        }
        return e;
      });
    }

    // Push notification to central feed for Admin oversight
    if (Array.isArray(this.data.notifications)) {
      this.data.notifications.unshift({
        id: `NOTIF-CMP-${Date.now().toString().slice(-4)}`,
        category: 'Maintenance',
        title: 'Equipment Complaint Filed',
        message: `${newComplaint.reportedBy} reported "${newComplaint.category}" on ${newComplaint.equipmentName} in ${newComplaint.labId} (${newComplaint.department}).`,
        time: 'Just now',
        unread: true,
        priority: newComplaint.priority === 'Critical' ? 'Critical' : 'High',
        actionRoute: 'laboratory-management'
      });
    }

    this.save();

    // Asynchronously dispatch to backend NestJS API
    try {
      if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
        const token = window.localStorage?.getItem('auth_token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch('/api/laboratories/complaints', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            department: newComplaint.department,
            labCode: newComplaint.labId,
            equipmentCode: newComplaint.equipmentId,
            equipmentName: newComplaint.equipmentName,
            issueType: newComplaint.category,
            priority: newComplaint.priority,
            description: newComplaint.description,
            photoUrl: newComplaint.photoUrl,
          }),
        }).catch(err => console.warn('Offline: complaint saved locally', err));
      }
    } catch (e) {
      // offline fallback
    }

    return newComplaint;
  }

  updateComplaint(id, patch) {
    if (!Array.isArray(this.data.complaints)) return;
    this.data.complaints = this.data.complaints.map(c => {
      if (c.id === id || c.complaintNumber === id) {
        const updated = { ...c, ...patch };
        // If approved by admin and work order generated -> Under Maintenance
        if (patch.status === 'Approved' || patch.status === 'Assigned' || patch.status === 'In Progress' || patch.status === 'Waiting for Parts') {
          if (updated.equipmentId) {
            this.data.equipment = this.data.equipment.map(e =>
              e.id === updated.equipmentId ? { ...e, status: 'Under Maintenance', condition: 'Under Maintenance' } : e
            );
          }
        }
        // If repair completed -> Available
        if ((patch.status === 'Completed' || patch.status === 'Closed') && updated.equipmentId) {
          this.data.equipment = this.data.equipment.map(e =>
            e.id === updated.equipmentId ? { ...e, status: 'Available', condition: 'Operational / Good' } : e
          );
        }
        return updated;
      }
      return c;
    });
    this.save();
  }

  reviewComplaint(id, { action, assignedTechnician = '', adminRemarks = '', reviewerName = 'Campus Administrator' }) {
    const targetCmp = (this.data.complaints || []).find(c => c.id === id || c.complaintNumber === id);
    if (!targetCmp) {
      throw new Error(`Complaint ${id} not found.`);
    }

    let updatedCmp = null;
    if (action === 'APPROVE') {
      const workOrderNum = `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const nextStatus = assignedTechnician ? 'Assigned' : 'Approved';

      // Update linked equipment condition and status to 'Under Maintenance'
      if (targetCmp.equipmentId) {
        this.data.equipment = (this.data.equipment || []).map(e =>
          e.id === targetCmp.equipmentId
            ? { ...e, status: 'Under Maintenance', condition: 'Under Maintenance' }
            : e
        );
      }

      this.data.complaints = this.data.complaints.map(c => {
        if (c.id === id || c.complaintNumber === id) {
          updatedCmp = {
            ...c,
            status: nextStatus,
            workOrderNumber: workOrderNum,
            assignedTechnician: assignedTechnician || c.assignedTechnician,
            assignedAt: assignedTechnician ? new Date().toISOString() : null,
            adminRemarks: adminRemarks || c.adminRemarks,
            reviewedBy: reviewerName,
            reviewedAt: new Date().toISOString()
          };
          return updatedCmp;
        }
        return c;
      });

      // Also reflect in maintenanceOrders list
      const newMaintOrder = {
        id: workOrderNum,
        complaintId: targetCmp.id,
        department: targetCmp.department,
        labId: targetCmp.labId,
        labName: targetCmp.labName || `Lab ${targetCmp.labId}`,
        assetId: targetCmp.equipmentId,
        assetName: targetCmp.equipmentName,
        category: targetCmp.category,
        priority: targetCmp.priority,
        description: targetCmp.description,
        status: nextStatus,
        assignedTechnician: assignedTechnician || 'Central Maintenance',
        reportedDate: targetCmp.reportedDate,
        targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
      };
      this.data.maintenanceOrders = [newMaintOrder, ...(this.data.maintenanceOrders || [])];

      if (Array.isArray(this.data.notifications)) {
        this.data.notifications.unshift({
          id: `NOTIF-WO-${Date.now().toString().slice(-4)}`,
          category: 'Maintenance',
          title: 'Work Order Generated & Approved',
          message: `Work Order #${workOrderNum} generated for "${targetCmp.equipmentName}". Assigned to ${assignedTechnician || 'Maintenance Division'}. Instrument set to Under Maintenance.`,
          time: 'Just now',
          unread: true,
          priority: 'High',
          actionRoute: 'laboratory-management'
        });
      }
    } else {
      this.data.complaints = this.data.complaints.map(c => {
        if (c.id === id || c.complaintNumber === id) {
          updatedCmp = {
            ...c,
            status: 'Rejected',
            adminRemarks: adminRemarks || c.adminRemarks,
            reviewedBy: reviewerName,
            reviewedAt: new Date().toISOString()
          };
          return updatedCmp;
        }
        return c;
      });

      if (Array.isArray(this.data.notifications)) {
        this.data.notifications.unshift({
          id: `NOTIF-REJ-${Date.now().toString().slice(-4)}`,
          category: 'Maintenance',
          title: 'Equipment Complaint Rejected',
          message: `Complaint #${targetCmp.complaintNumber || targetCmp.id} for "${targetCmp.equipmentName}" was rejected by ${reviewerName}.`,
          time: 'Just now',
          unread: true,
          priority: 'Medium',
          actionRoute: 'laboratory-management'
        });
      }
    }

    if (updatedCmp) {
      this.recordAuditLog({
        user: reviewerName,
        role: 'ADMIN',
        action: action === 'APPROVE' ? 'Approve Complaint & Issue Work Order' : 'Reject Equipment Complaint',
        target: `Complaint #${targetCmp.complaintNumber || targetCmp.id} (${targetCmp.equipmentName})`,
        oldValue: targetCmp.status,
        newValue: updatedCmp.status,
        status: 'Success'
      });
    }

    this.save();

    // Asynchronously dispatch PATCH to backend
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const token = window.localStorage?.getItem('auth_token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch(`/api/laboratories/complaints/${id}/review`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ action, assignedTechnician, adminRemarks })
        }).catch(() => {});
      } catch (e) {}
    }

    return updatedCmp;
  }

  updateWorkOrderProgress(id, { status, resolutionNotes = '', technicianName = '' }) {
    const targetCmp = (this.data.complaints || []).find(c => c.id === id || c.complaintNumber === id || c.workOrderNumber === id);
    if (!targetCmp) {
      throw new Error(`Work order / complaint ${id} not found.`);
    }

    if (targetCmp.status === 'Submitted' && !targetCmp.workOrderNumber) {
      throw new Error(`Cannot update progress on complaint ${id}: Complaint is pending Admin review and has no authorized Work Order.`);
    }

    let updatedCmp = null;
    this.data.complaints = this.data.complaints.map(c => {
      if (c.id === targetCmp.id) {
        updatedCmp = {
          ...c,
          status,
          resolutionNotes: resolutionNotes || c.resolutionNotes,
          completedAt: (status === 'Completed' || status === 'Closed') ? new Date().toISOString() : c.completedAt
        };
        return updatedCmp;
      }
      return c;
    });

    // Update corresponding maintenance order
    if (targetCmp.workOrderNumber) {
      this.data.maintenanceOrders = (this.data.maintenanceOrders || []).map(m =>
        m.id === targetCmp.workOrderNumber ? { ...m, status, resolutionNotes } : m
      );
    }

    // If Completed or Closed -> restore equipment status to Available & condition to Operational / Good
    if ((status === 'Completed' || status === 'Closed') && targetCmp.equipmentId) {
      this.data.equipment = (this.data.equipment || []).map(e =>
        e.id === targetCmp.equipmentId
          ? { ...e, status: 'Available', condition: 'Operational / Good' }
          : e
      );

      if (Array.isArray(this.data.notifications)) {
        this.data.notifications.unshift({
          id: `NOTIF-DONE-${Date.now().toString().slice(-4)}`,
          category: 'Maintenance',
          title: 'Equipment Repair Completed',
          message: `Repair on "${targetCmp.equipmentName}" (WO #${targetCmp.workOrderNumber || targetCmp.id}) completed successfully. Instrument returned to Available inventory.`,
          time: 'Just now',
          unread: true,
          priority: 'Medium',
          actionRoute: 'equipment'
        });
      }
    }

    if (updatedCmp) {
      this.recordAuditLog({
        user: technicianName || 'Central Maintenance',
        role: 'STAFF',
        action: 'Update Work Order Status',
        target: `Work Order #${targetCmp.workOrderNumber || targetCmp.id} (${targetCmp.equipmentName})`,
        oldValue: targetCmp.status,
        newValue: status,
        status: 'Success'
      });
    }

    this.save();

    // Asynchronously dispatch PATCH to backend
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const token = window.localStorage?.getItem('auth_token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch(`/api/laboratories/complaints/${targetCmp.id}/work-order`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status, resolutionNotes })
        }).catch(() => {});
      } catch (e) {}
    }

    return updatedCmp;
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

    // Push notification to central feed for Admin oversight
    if (Array.isArray(this.data.notifications)) {
      this.data.notifications.unshift({
        id: `NOTIF-REQ-${Date.now().toString().slice(-4)}`,
        category: 'Requisition',
        title: 'New Instrument Requisition Submitted',
        message: `${newReq.requestingStaff} requested ${newReq.quantity || 1}x ${newReq.itemName} for ${newReq.labId} (${newReq.department}).`,
        time: 'Just now',
        unread: true,
        priority: newReq.priority === 'Critical' || newReq.priority === 'High' ? 'High' : 'Medium',
        actionRoute: 'laboratory-management'
      });
    }

    this.save();

    // Asynchronously dispatch to NestJS backend /api/laboratories/requisitions
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const token = window.localStorage?.getItem('auth_token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch('/api/laboratories/requisitions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            department: req.department || this.data.currentBranch,
            labCode: req.labId || this.data.activeLabId,
            equipmentName: req.itemName,
            category: req.category || 'Instruments',
            requestedQuantity: Number(req.quantity) || 1,
            estimatedCost: Number(req.estimatedBudget) || 15000,
            urgency: req.priority || 'Normal',
            reason: req.reason || 'Laboratory equipment requirement.'
          })
        }).catch(() => {});
      } catch (e) {}
    }

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

  reviewRequisition(id, { action, adminRemarks = '', reviewerName = 'Campus Administrator' }) {
    let reviewedReq = null;
    const nextStatus = action === 'APPROVE' ? 'Approved' : (action === 'REQUEST_CHANGES' ? 'Changes Requested' : 'Rejected');

    this.data.requisitions = (this.data.requisitions || []).map(r => {
      if (r.id === id || r.requisitionNo === id) {
        const timeline = [...(r.approvalTimeline || [])];
        timeline.push({
          step: `Admin Review: ${nextStatus}`,
          by: reviewerName,
          date: new Date().toLocaleString(),
          status: nextStatus,
          notes: adminRemarks
        });
        reviewedReq = {
          ...r,
          status: nextStatus,
          adminRemarks: adminRemarks || r.adminRemarks,
          reviewedBy: reviewerName,
          reviewedAt: new Date().toISOString(),
          approvalTimeline: timeline
        };
        return reviewedReq;
      }
      return r;
    });

    if (reviewedReq && Array.isArray(this.data.notifications)) {
      this.data.notifications.unshift({
        id: `NOTIF-REV-${Date.now().toString().slice(-4)}`,
        category: 'Requisition',
        title: `Requisition ${nextStatus}`,
        message: `Requisition #${reviewedReq.requisitionNo || reviewedReq.id} for "${reviewedReq.itemName}" was ${nextStatus} by ${reviewerName}.`,
        time: 'Just now',
        unread: true,
        priority: nextStatus === 'Approved' ? 'Medium' : 'High',
        actionRoute: 'requisitions'
      });
    }

    if (reviewedReq) {
      this.recordAuditLog({
        user: reviewerName,
        role: 'ADMIN',
        action: 'Review Lab Requisition',
        target: `Requisition #${reviewedReq.requisitionNo || reviewedReq.id} (${reviewedReq.itemName})`,
        oldValue: 'Pending Approval',
        newValue: nextStatus,
        status: 'Success'
      });
    }

    this.save();

    // Asynchronously dispatch PATCH to backend
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const token = window.localStorage?.getItem('auth_token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch(`/api/laboratories/requisitions/${id}/review`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ action, adminRemarks })
        }).catch(() => {});
      } catch (e) {}
    }

    return reviewedReq;
  }

  issueRequisitionStock(id, { issuedQuantity, adminRemarks = '', issuerName = 'Central Store Officer' }) {
    const targetReq = (this.data.requisitions || []).find(r => r.id === id || r.requisitionNo === id);
    if (!targetReq) {
      throw new Error(`Requisition ${id} not found.`);
    }

    if (targetReq.status !== 'Approved') {
      throw new Error(`Cannot issue stock for a requisition that is in "${targetReq.status}" status. It must be Approved first.`);
    }

    const qty = Number(issuedQuantity) || Number(targetReq.quantity) || 1;

    // Update equipment inventory in target branch / laboratory
    let matched = false;
    this.data.equipment = (this.data.equipment || []).map(e => {
      const isMatch = e.department === targetReq.department &&
        (e.name?.toLowerCase().includes((targetReq.itemName || '').toLowerCase()) ||
         (targetReq.itemName || '').toLowerCase().includes(e.name?.toLowerCase() || ''));
      if (isMatch && !matched) {
        matched = true;
        return {
          ...e,
          quantity: (Number(e.quantity) || 0) + qty,
          availableQuantity: (Number(e.availableQuantity) || 0) + qty,
          status: 'Available',
          condition: e.condition || 'Operational / Good'
        };
      }
      return e;
    });

    if (!matched) {
      const newEquipment = {
        id: `EQ-${targetReq.department}-${Date.now().toString().slice(-3)}`,
        name: targetReq.itemName,
        category: targetReq.category || 'Laboratory Instruments',
        department: targetReq.department,
        assignedLab: targetReq.labId,
        quantity: qty,
        availableQuantity: qty,
        issuedQuantity: 0,
        condition: 'Operational / Good',
        status: 'Available',
        purchaseInfo: `Approved Requisition #${targetReq.requisitionNo || targetReq.id}`,
        responsibleStaff: targetReq.requestingStaff || 'Lab Technical Staff'
      };
      this.data.equipment.unshift(newEquipment);
    }

    // Update requisition status to 'Issued'
    let issuedReq = null;
    this.data.requisitions = this.data.requisitions.map(r => {
      if (r.id === id || r.requisitionNo === id) {
        const timeline = [...(r.approvalTimeline || [])];
        timeline.push({
          step: `Instrument Stock Issued (${qty} units)`,
          by: issuerName,
          date: new Date().toLocaleString(),
          status: 'Issued',
          notes: adminRemarks || 'Stock issued and added to available laboratory inventory.'
        });
        issuedReq = {
          ...r,
          status: 'Issued',
          issuedQuantity: qty,
          issuedBy: issuerName,
          issuedAt: new Date().toISOString(),
          adminRemarks: adminRemarks ? `${r.adminRemarks || ''} | Stock Issued: ${adminRemarks}` : r.adminRemarks,
          approvalTimeline: timeline
        };
        return issuedReq;
      }
      return r;
    });

    if (Array.isArray(this.data.notifications)) {
      this.data.notifications.unshift({
        id: `NOTIF-ISS-${Date.now().toString().slice(-4)}`,
        category: 'Inventory',
        title: 'Instrument Stock Issued',
        message: `${qty}x "${targetReq.itemName}" issued to ${targetReq.labId} (${targetReq.department}). Available inventory has been updated automatically.`,
        time: 'Just now',
        unread: true,
        priority: 'High',
        actionRoute: 'equipment'
      });
    }

    if (issuedReq) {
      this.recordAuditLog({
        user: issuerName,
        role: 'ADMIN',
        action: 'Issue Requisition Stock',
        target: `Requisition #${issuedReq.requisitionNo || issuedReq.id} (${issuedReq.itemName})`,
        oldValue: 'Approved',
        newValue: `Issued (${qty} Units)`,
        status: 'Success'
      });
    }

    this.save();

    // Asynchronously dispatch PATCH to backend
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const token = window.localStorage?.getItem('auth_token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch(`/api/laboratories/requisitions/${id}/issue`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ issuedQuantity: qty, adminRemarks })
        }).catch(() => {});
      } catch (e) {}
    }

    return issuedReq;
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

  // --- Notifications & Real-Time Broadcast Feeds ---
  getNotifications(filter = {}) {
    let list = this.data.notifications || [];
    if (filter.branch && filter.branch !== 'ALL') {
      list = list.filter(n => !n.branch || n.branch === 'ALL' || n.branch === filter.branch);
    }
    if (filter.role && filter.role !== 'ALL') {
      list = list.filter(n => !n.targetRole || n.targetRole === 'ALL' || n.targetRole === filter.role);
    }
    if (filter.priority) {
      list = list.filter(n => n.priority === filter.priority);
    }
    if (filter.unreadOnly) {
      list = list.filter(n => n.unread);
    }
    return list;
  }

  broadcastNotification({
    title,
    message,
    category = 'General Laboratory Announcement',
    priority = 'Medium',
    targetRole = 'ALL',
    branch = 'ALL',
    sender = 'Campus Administration',
    actionRoute = 'laboratory-management'
  }) {
    const newNotif = {
      id: `NOTIF-BC-${Date.now().toString().slice(-6)}`,
      title,
      message,
      category,
      priority,
      targetRole,
      branch: (branch || 'ALL').toUpperCase(),
      sender,
      time: 'Just now',
      timestamp: new Date().toISOString(),
      unread: true,
      isBroadcast: true,
      actionRoute
    };

    if (!Array.isArray(this.data.notifications)) {
      this.data.notifications = [];
    }
    this.data.notifications.unshift(newNotif);

    // If critical priority, also log in institutional audit trail
    if (priority === 'Critical') {
      this.recordAuditLog({
        user: sender,
        role: targetRole === 'ALL' ? 'ADMIN' : targetRole,
        action: 'Critical Laboratory Broadcast Emitted',
        target: `${title} [${branch}]`,
        oldValue: 'Standard Operations',
        newValue: 'Critical Alert Active',
        status: 'Broadcasted'
      });
    }

    this.save();
    return newNotif;
  }

  markNotificationRead(id) {
    this.data.notifications = (this.data.notifications || []).map(n => n.id === id ? { ...n, unread: false } : n);
    this.save();
  }

  markAllNotificationsRead() {
    this.data.notifications = (this.data.notifications || []).map(n => ({ ...n, unread: false }));
    this.save();
  }

  deleteNotification(id) {
    this.data.notifications = (this.data.notifications || []).filter(n => n.id !== id);
    this.save();
  }

  getUnreadNotificationsCount() {
    return (this.data.notifications || []).filter(n => n.unread).length;
  }

  // --- Preferences ---
  getPreferences() {
    return this.data.preferences;
  }

  updatePreferences(pref) {
    this.data.preferences = { ...this.data.preferences, ...pref };
    this.save();
  }

  // --- Super Admin System-Wide Authority & Cross-Branch Overrides ---
  recordAuditLog({ user = 'Super Administrator', role = 'SUPER_ADMIN', action, target, oldValue, newValue, status = 'Success' }) {
    const newLog = {
      id: `AUD-LAB-${Date.now().toString().slice(-6)}`,
      user,
      role,
      action,
      target,
      oldValue: String(oldValue ?? ''),
      newValue: String(newValue ?? ''),
      timestamp: new Date().toLocaleString(),
      ipAddress: '192.168.1.1',
      status
    };

    if (!Array.isArray(this.data.auditLogs)) {
      this.data.auditLogs = [];
    }
    this.data.auditLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  getAuditLogs(filter = {}) {
    let list = this.data.auditLogs || [];
    if (filter.role && filter.role !== 'ALL') {
      list = list.filter(a => a.role === filter.role);
    }
    if (filter.action && filter.action !== 'ALL') {
      list = list.filter(a => a.action?.toLowerCase().includes(filter.action.toLowerCase()));
    }
    if (filter.target) {
      list = list.filter(a => a.target?.toLowerCase().includes(filter.target.toLowerCase()));
    }
    return list;
  }

  clearAuditLogs(requestingUserRole = 'STAFF') {
    if (requestingUserRole !== 'SUPER_ADMIN') {
      throw new Error('Security Error: Insufficient privileges. Only root SUPER_ADMIN can prune or archive institutional audit logs.');
    }
    this.data.auditLogs = [];
    this.save();
  }

  superAdminOverrideComplaint(id, { newStatus, adminRemarks = '', overriddenBy = 'Super Administrator' }) {
    const targetCmp = (this.data.complaints || []).find(c => c.id === id || c.complaintNumber === id);
    if (!targetCmp) {
      throw new Error(`Complaint ${id} not found.`);
    }

    const oldStatus = targetCmp.status;
    let workOrderNum = targetCmp.workOrderNumber;
    if (!workOrderNum && (newStatus === 'Approved' || newStatus === 'Assigned' || newStatus === 'In Progress' || newStatus === 'Completed')) {
      workOrderNum = `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }

    let updatedCmp = null;
    this.data.complaints = this.data.complaints.map(c => {
      if (c.id === targetCmp.id) {
        updatedCmp = {
          ...c,
          status: newStatus,
          workOrderNumber: workOrderNum,
          adminRemarks: adminRemarks ? `[SUPER_ADMIN OVERRIDE] ${adminRemarks}` : `[SUPER_ADMIN OVERRIDE: ${oldStatus} -> ${newStatus}]`,
          reviewedBy: overriddenBy,
          reviewedAt: new Date().toISOString()
        };
        return updatedCmp;
      }
      return c;
    });

    // Equipment state transitions
    if (targetCmp.equipmentId) {
      if (newStatus === 'Completed' || newStatus === 'Closed') {
        this.data.equipment = (this.data.equipment || []).map(e =>
          e.id === targetCmp.equipmentId ? { ...e, status: 'Available', condition: 'Operational / Good' } : e
        );
      } else if (newStatus === 'Approved' || newStatus === 'Assigned' || newStatus === 'In Progress' || newStatus === 'Waiting for Parts') {
        this.data.equipment = (this.data.equipment || []).map(e =>
          e.id === targetCmp.equipmentId ? { ...e, status: 'Under Maintenance', condition: 'Under Maintenance' } : e
        );
      } else if (newStatus === 'Submitted') {
        this.data.equipment = (this.data.equipment || []).map(e =>
          e.id === targetCmp.equipmentId ? { ...e, status: 'Damaged', condition: 'Damaged' } : e
        );
      }
    }

    // Record institutional audit log
    this.recordAuditLog({
      user: overriddenBy,
      role: 'SUPER_ADMIN',
      action: 'Super Admin Complaint Status Override',
      target: `Complaint #${targetCmp.complaintNumber || targetCmp.id} (${targetCmp.equipmentName})`,
      oldValue: oldStatus,
      newValue: newStatus,
      status: 'Success'
    });

    if (Array.isArray(this.data.notifications)) {
      this.data.notifications.unshift({
        id: `NOTIF-SA-CMP-${Date.now().toString().slice(-4)}`,
        category: 'Maintenance',
        title: 'Super Admin Override Applied',
        message: `${overriddenBy} overrode Complaint #${targetCmp.complaintNumber || targetCmp.id} to "${newStatus}".`,
        time: 'Just now',
        unread: true,
        priority: 'Critical',
        actionRoute: 'laboratory-management'
      });
    }

    this.save();
    return updatedCmp;
  }

  superAdminOverrideRequisition(id, { newStatus, adminRemarks = '', overriddenBy = 'Super Administrator' }) {
    const targetReq = (this.data.requisitions || []).find(r => r.id === id || r.requisitionNo === id);
    if (!targetReq) {
      throw new Error(`Requisition ${id} not found.`);
    }

    const oldStatus = targetReq.status;
    let updatedReq = null;
    this.data.requisitions = this.data.requisitions.map(r => {
      if (r.id === targetReq.id) {
        const timeline = [...(r.approvalTimeline || [])];
        timeline.push({
          step: `Super Admin Override: ${newStatus}`,
          by: overriddenBy,
          date: new Date().toLocaleString(),
          status: newStatus,
          notes: adminRemarks || 'Direct root authority override executed.'
        });
        updatedReq = {
          ...r,
          status: newStatus,
          adminRemarks: adminRemarks ? `[SUPER_ADMIN OVERRIDE] ${adminRemarks}` : `[SUPER_ADMIN OVERRIDE: ${oldStatus} -> ${newStatus}]`,
          reviewedBy: overriddenBy,
          reviewedAt: new Date().toISOString(),
          approvalTimeline: timeline
        };
        return updatedReq;
      }
      return r;
    });

    this.recordAuditLog({
      user: overriddenBy,
      role: 'SUPER_ADMIN',
      action: 'Super Admin Requisition Status Override',
      target: `Requisition #${targetReq.requisitionNo || targetReq.id} (${targetReq.itemName})`,
      oldValue: oldStatus,
      newValue: newStatus,
      status: 'Success'
    });

    if (Array.isArray(this.data.notifications)) {
      this.data.notifications.unshift({
        id: `NOTIF-SA-REQ-${Date.now().toString().slice(-4)}`,
        category: 'Requisition',
        title: 'Super Admin Requisition Override',
        message: `${overriddenBy} overrode Requisition #${targetReq.requisitionNo || targetReq.id} to "${newStatus}".`,
        time: 'Just now',
        unread: true,
        priority: 'High',
        actionRoute: 'laboratory-management'
      });
    }

    this.save();
    return updatedReq;
  }

  superAdminDecommissionEquipment(id, { reason = '', decommissionedBy = 'Super Administrator' }) {
    const targetEq = (this.data.equipment || []).find(e => e.id === id || e.equipmentCode === id);
    if (!targetEq) {
      throw new Error(`Equipment ${id} not found.`);
    }

    let updatedEq = null;
    this.data.equipment = this.data.equipment.map(e => {
      if (e.id === targetEq.id) {
        updatedEq = {
          ...e,
          status: 'Decommissioned',
          condition: 'Decommissioned / Written Off',
          availableQuantity: 0,
          decommissionReason: reason || 'End of lifecycle disposal authorized by Super Admin',
          decommissionedBy,
          decommissionedAt: new Date().toISOString()
        };
        return updatedEq;
      }
      return e;
    });

    this.recordAuditLog({
      user: decommissionedBy,
      role: 'SUPER_ADMIN',
      action: 'Equipment Decommissioned / Purged',
      target: `Equipment #${targetEq.id} (${targetEq.name || targetEq.equipmentName})`,
      oldValue: targetEq.status,
      newValue: 'Decommissioned',
      status: 'Success'
    });

    if (Array.isArray(this.data.notifications)) {
      this.data.notifications.unshift({
        id: `NOTIF-SA-DEC-${Date.now().toString().slice(-4)}`,
        category: 'Inventory',
        title: 'Equipment Decommissioned',
        message: `${targetEq.name} was formally decommissioned by ${decommissionedBy}. Reason: ${reason || 'Asset lifecycle write-off'}.`,
        time: 'Just now',
        unread: true,
        priority: 'High',
        actionRoute: 'laboratory-management'
      });
    }

    this.save();
    return updatedEq;
  }

  // --- Factory Reset ---
  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadInitialData();
    this.notify();
  }
}

export const labStaffStore = new LabStaffStore();
