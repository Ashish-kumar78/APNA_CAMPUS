// Shared Store for Hostel Indents & Material Requisitions
// Synchronizes Warden Indent Requests, Custom Items, and Hostel Admin Approvals

const STORAGE_KEY = 'bput_hostel_indents_v1';

export const PRESET_MATERIALS = [
  { name: 'Aluminium door Stay Handle & lock', code: 'H-301', defaultUnit: 'pcs', approxCost: 120.50 },
  { name: 'Bed Sheet (Single Blue Striped)', code: 'B-102', defaultUnit: 'pcs', approxCost: 285.00 },
  { name: 'Colour Empty Bracket', code: 'E-401', defaultUnit: 'pcs', approxCost: 45.00 },
  { name: 'CPVC end Cap-3/4"', code: 'P-108', defaultUnit: 'pcs', approxCost: 28.50 },
  { name: 'cpvc SOCKET 1.5"', code: 'P-112', defaultUnit: 'pcs', approxCost: 65.00 },
  { name: 'cpvc SOCKET 1"', code: 'P-110', defaultUnit: 'pcs', approxCost: 48.00 },
  { name: 'floor Jali(PHD)-3"', code: 'J-203', defaultUnit: 'pcs', approxCost: 55.00 },
  { name: 'floor Jali(PHD)-4"', code: 'J-204', defaultUnit: 'pcs', approxCost: 75.00 },
  { name: 'Gloves (G) Rubber Heavy Duty', code: 'G-012', defaultUnit: 'pairs', approxCost: 90.00 },
  { name: 'Medice Sprry Nozal', code: 'M-501', defaultUnit: 'pcs', approxCost: 110.00 },
  { name: 'PVC end Cap-1"', code: 'P-101', defaultUnit: 'pcs', approxCost: 32.00 },
  { name: 'Screw (25/6)', code: 'SC-025', defaultUnit: 'box', approxCost: 140.00 },
  { name: 'Shower Spindle 7mm', code: 'P-707', defaultUnit: 'pcs', approxCost: 165.00 },
  { name: 'Stamp Paper Rs-10/-', code: 'ST-010', defaultUnit: 'sheets', approxCost: 12.00 },
  { name: '##Band Cloth', code: 'CL-001', defaultUnit: 'meters', approxCost: 85.00 },
  { name: '##Battery (Attendace Device)', code: 'BT-009', defaultUnit: 'pcs', approxCost: 450.00 },
  { name: '##Draw Lock', code: 'LK-102', defaultUnit: 'pcs', approxCost: 135.00 },
  { name: '##Dust Pan', code: 'DP-004', defaultUnit: 'pcs', approxCost: 65.00 },
  { name: 'File with GIFT Logo (Folder File)', code: 'S-201', defaultUnit: 'pcs', approxCost: 82.18 },
  { name: 'Attendance Register Student', code: 'S-211', defaultUnit: 'pcs', approxCost: 217.11 },
  { name: 'Cover File', code: 'S-202', defaultUnit: 'pcs', approxCost: 109.33 },
  { name: 'Scissor Heavy Brass', code: 'S-104', defaultUnit: 'pcs', approxCost: 126.67 },
  { name: 'Single Bed Coir Mattress (72x36x4)', code: 'MAT-01', defaultUnit: 'pcs', approxCost: 1850.00 },
  { name: 'Ceiling Fan 1200mm (Crompton)', code: 'FAN-03', defaultUnit: 'pcs', approxCost: 1420.00 },
  { name: 'LED Tube Light 20W (Surya)', code: 'LGT-02', defaultUnit: 'pcs', approxCost: 195.00 },
  { name: 'Water Cooler RO Filter Candle 10"', code: 'RO-10', defaultUnit: 'pcs', approxCost: 320.00 },
  { name: 'CUSTOM_ITEM', label: '+ Other / Custom Item (Specify name & details)', code: 'CUST-99' }
];

export const INITIAL_INDENTS = [
  {
    id: 'ind-1',
    referenceNo: 'REQ-7037/15350',
    indentNo: '7037/15350',
    requestTitle: 'Session Student Documentation Cover & Files',
    requestType: 'General Hostel Supplies',
    productName: 'File with GIFT Logo (Folder File)',
    materialName: 'File with GIFT Logo (Folder File)',
    isCustom: false,
    code: 'S-201',
    quantity: '4.00 pcs',
    unit: 'Pieces',
    approxCost: 'RS. 82.18',
    costNum: 82.18,
    estimatedCost: 82.18,
    hostelName: "BPUT Boy's Hostel 1 (Kalam Block)",
    roomLocation: 'Hostel Office & Record Room',
    purpose: 'bh-1,bh-2 (Hostel Office)',
    priority: 'Medium',
    expectedDate: '22-01-2024',
    raisedBy: 'Mr. Tanmaya Kumar Routray (Hostel Warden)',
    currentLevel: 'Level-2 (Store Issued)',
    isApproved: true,
    issued: true,
    status: 'Approved & Issued',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '24-01-2024',
    submittedAt: '22 Jan 2024, 10:15 AM',
    remarks: 'Approved for session student files.'
  },
  {
    id: 'ind-2',
    referenceNo: 'REQ-7037/15349',
    indentNo: '7037/15349',
    requestTitle: 'Curfew & Night Roll-Call Student Attendance Registers',
    requestType: 'General Hostel Supplies',
    productName: 'Attendance Register Student',
    materialName: 'Attendance Register Student',
    isCustom: false,
    code: 'S-211',
    quantity: '2.00 pcs',
    unit: 'Pieces',
    approxCost: 'RS. 217.11',
    costNum: 217.11,
    estimatedCost: 217.11,
    hostelName: "BPUT Boy's Hostel 1 (Kalam Block)",
    roomLocation: 'Warden Guard Booth & Entry Desk',
    purpose: 'bh-1,bh-2 (Guard Station)',
    priority: 'High',
    expectedDate: '22-01-2024',
    raisedBy: 'Mr. Tanmaya Kumar Routray (Hostel Warden)',
    currentLevel: 'Level-2 (Store Issued)',
    isApproved: true,
    issued: true,
    status: 'Approved & Issued',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '23-01-2024',
    submittedAt: '22 Jan 2024, 09:30 AM',
    remarks: 'Approved for night roll-call record register.'
  },
  {
    id: 'ind-3',
    referenceNo: 'REQ-6396/13875',
    indentNo: '6396/13875',
    requestTitle: 'Administrative Filing System Covers',
    requestType: 'General Hostel Supplies',
    productName: 'Cover File',
    materialName: 'Cover File',
    isCustom: false,
    code: 'S-202',
    quantity: '4.00 pcs',
    unit: 'Pieces',
    approxCost: 'RS. 109.33',
    costNum: 109.33,
    estimatedCost: 109.33,
    hostelName: "BPUT Boy's Hostel 2 (Raman Block)",
    roomLocation: 'Warden Archive Desk',
    purpose: 'bh-1,bh-2',
    priority: 'Low',
    expectedDate: '11-10-2023',
    raisedBy: 'Mr. Tanmaya Kumar Routray (Hostel Warden)',
    currentLevel: 'Level-2 (Store Issued)',
    isApproved: true,
    issued: true,
    status: 'Approved & Issued',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '12-10-2023',
    submittedAt: '11 Oct 2023, 11:20 AM',
    remarks: 'Office filing requisitions approved.'
  },
  {
    id: 'ind-4',
    referenceNo: 'REQ-6396/13874',
    indentNo: '6396/13874',
    requestTitle: 'Block Resident Muster Rolls',
    requestType: 'General Hostel Supplies',
    productName: 'Attendance Register Student',
    materialName: 'Attendance Register Student',
    isCustom: false,
    code: 'S-211',
    quantity: '2.00 pcs',
    unit: 'Pieces',
    approxCost: 'RS. 221.75',
    costNum: 221.75,
    estimatedCost: 221.75,
    hostelName: 'Sarojini Girls Hostel (Block A)',
    roomLocation: 'Girls Hostel Ground Desk',
    purpose: 'gh-1 (Sarojini)',
    priority: 'Medium',
    expectedDate: '11-10-2023',
    raisedBy: 'Mrs. Nibedita Das (Hostel Warden)',
    currentLevel: 'Level-2 (Store Issued)',
    isApproved: true,
    issued: true,
    status: 'Approved & Issued',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '12-10-2023',
    submittedAt: '11 Oct 2023, 08:45 AM',
    remarks: 'Approved for Kalam & Sarojini residence blocks.'
  },
  {
    id: 'ind-5',
    referenceNo: 'REQ-2051/4122',
    indentNo: '2051/4122',
    requestTitle: 'Heavy Brass Scissors for Warden Station',
    requestType: 'Room Equipment',
    productName: 'Scissor Heavy Brass',
    materialName: 'Scissor',
    isCustom: false,
    code: 'S-104',
    quantity: '1.00 pcs',
    unit: 'Pieces',
    approxCost: 'RS. 126.67',
    costNum: 126.67,
    estimatedCost: 126.67,
    hostelName: "BPUT Boy's Hostel 1 (Kalam Block)",
    roomLocation: 'Warden Office',
    purpose: 'OFFICE',
    priority: 'Low',
    expectedDate: '03-01-2023',
    raisedBy: 'Mr. Tanmaya Kumar Routray (Hostel Warden)',
    currentLevel: 'Level-2 (Store Issued)',
    isApproved: true,
    issued: true,
    status: 'Approved & Issued',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '04-01-2023',
    submittedAt: '03 Jan 2023, 02:00 PM',
    remarks: 'Stationery procurement.'
  },
  {
    id: 'ind-6',
    referenceNo: 'REQ-8492/18920',
    indentNo: '8492/18920',
    requestTitle: 'Urgent Replacement of Damaged Door Handles and Locks',
    requestType: 'Repair of Existing Item',
    productName: 'Aluminium door Stay Handle & lock',
    materialName: 'Aluminium door Stay Handle & lock',
    isCustom: false,
    code: 'H-301',
    quantity: '12.00 pcs',
    unit: 'Pieces',
    approxCost: 'RS. 1,446.00',
    costNum: 1446.00,
    estimatedCost: 1446.00,
    hostelName: "BPUT Boy's Hostel 1 (Kalam Block)",
    roomLocation: 'Gandhi Block Rooms 101 to 106',
    purpose: 'bh-1 (Gandhi Block Rooms 101-106)',
    priority: 'Urgent',
    expectedDate: '2026-11-02',
    raisedBy: 'Mr. Tanmaya Kumar Routray (Hostel Warden)',
    currentLevel: 'Level-1 (Pending Review)',
    isApproved: false,
    issued: false,
    status: 'Pending Admin Approval',
    approvedBy: null,
    approvedAt: null,
    submittedAt: '26 Oct 2026, 09:15 AM',
    remarks: 'Damaged locks require urgent replacement before winter term exams.',
    description: 'Multiple room door handles are broken and mortise latches are jamming, creating a safety and privacy concern for students in rooms 101 through 106.',
    itemCondition: 'Damaged / Malfunctioning latches',
    repairPossible: 'No - Needs full replacement',
    replacementRequired: 'Yes - Complete set',
    affectedRooms: 6,
    safetyHazard: true
  },
  {
    id: 'ind-7',
    referenceNo: 'REQ-8492/18921',
    indentNo: '8492/18921',
    requestTitle: 'Washroom Shower Spindle and CPVC Fittings Repair',
    requestType: 'Plumbing Problem',
    productName: 'Shower Spindle 7mm & CPVC Sockets',
    materialName: 'Shower Spindle 7mm & CPVC Sockets',
    isCustom: true,
    code: 'P-707-CUST',
    quantity: '8.00 pcs',
    unit: 'Pieces',
    approxCost: 'RS. 860.00',
    costNum: 860.00,
    estimatedCost: 860.00,
    hostelName: 'Sarojini Girls Hostel (Block A)',
    roomLocation: '2nd & 3rd Floor Washroom Block',
    purpose: 'gh-1 (Sarojini Girls Residence)',
    priority: 'High',
    expectedDate: '2026-11-05',
    raisedBy: 'Mrs. Nibedita Das (Hostel Warden)',
    currentLevel: 'Level-1 (Pending Review)',
    isApproved: false,
    issued: false,
    status: 'Pending Admin Approval',
    approvedBy: null,
    approvedAt: null,
    submittedAt: '27 Oct 2026, 04:45 PM',
    remarks: 'Plumbing maintenance on 2nd and 3rd floor washrooms.',
    description: 'High pressure water leakage occurring on the shower junctions causing floor waterlogging. Requires 8 units of 7mm spindles and CPVC connector sockets.',
    itemCondition: 'Leaking / Degraded fittings',
    repairPossible: 'Yes - Can be repaired on campus by technician',
    replacementRequired: 'Yes - Replacement spindles',
    affectedRooms: 12,
    safetyHazard: false
  }
];

export function normalizeIndent(item) {
  if (!item) return item;

  const rawStatus = item.status || 'Pending';
  let cleanStatus = rawStatus;
  if (item.isDraft) {
    cleanStatus = 'Draft';
  } else if (rawStatus === 'Pending' || rawStatus === 'Pending Admin Approval') {
    cleanStatus = 'Pending Admin Approval';
  } else if (rawStatus === 'Approved') {
    cleanStatus = item.issued ? 'Completed' : 'Approved';
  } else if (rawStatus === 'Approved & Issued') {
    cleanStatus = 'Completed';
  }

  const refPart = item.indentNo ? item.indentNo : `${item.id}`;
  const requestRef = item.referenceNo || `REQ-${refPart}`;

  return {
    ...item,
    id: item.id || `ind-${Date.now()}`,
    referenceNo: requestRef,
    indentNo: item.indentNo || refPart,
    productName: item.productName || item.materialName || 'Hostel Maintenance Item',
    materialName: item.materialName || item.productName || 'Hostel Maintenance Item',
    requestTitle: item.requestTitle || item.title || `${item.productName || item.materialName || 'Maintenance'} Requisition`,
    requestType: item.requestType || 'General Hostel Supplies',
    quantity: item.quantity || '1 pcs',
    unit: item.unit || 'Pieces',
    approxCost: item.approxCost || (item.costNum ? `RS. ${Number(item.costNum).toFixed(2)}` : 'RS. 0.00'),
    costNum: typeof item.costNum === 'number' ? item.costNum : 0,
    estimatedCost: typeof item.estimatedCost === 'number' ? item.estimatedCost : (item.costNum || 0),
    hostelName: item.hostelName || (item.purpose && item.purpose.includes('gh-') ? 'Sarojini Girls Hostel (Block A)' : "BPUT Boy's Hostel 1 (Kalam Block)"),
    roomLocation: item.roomLocation || (item.purpose ? item.purpose : 'General Hostel Premises'),
    priority: item.priority || 'Medium',
    expectedDate: item.expectedDate || '2026-11-05',
    raisedBy: item.raisedBy || 'Mr. Tanmaya Kumar Routray (Hostel Warden)',
    status: cleanStatus,
    currentLevel: item.currentLevel || (cleanStatus === 'Pending Admin Approval' ? 'Level-1 (Pending Review)' : cleanStatus),
    isApproved: Boolean(item.isApproved),
    issued: Boolean(item.issued),
    isDraft: Boolean(item.isDraft),
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
    submittedAt: item.submittedAt || (item.approvedAt ? item.approvedAt : 'Recently submitted'),
    remarks: item.remarks || '',
    description: item.description || item.remarks || 'Requisition submitted for hostel maintenance and facilities.'
  };
}

export function getAllIndents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeIndent);
      }
    }
  } catch (err) {
    console.error('Failed reading indents from storage', err);
  }
  return INITIAL_INDENTS.map(normalizeIndent);
}

export function saveIndents(indents) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(indents));
  } catch (err) {
    console.error('Failed saving indents to storage', err);
  }
}

export function raiseNewIndent(formData) {
  const currentIndents = getAllIndents();
  const nextReqPart1 = Math.floor(7000 + Math.random() * 1900);
  const nextReqPart2 = Math.floor(15000 + Math.random() * 4000);
  const newIndentNo = `${nextReqPart1}/${nextReqPart2}`;
  const isDraft = Boolean(formData.isDraft);

  const finalStatus = isDraft ? 'Draft' : 'Pending Admin Approval';
  const finalLevel = isDraft ? 'Draft' : 'Level-1 (Pending Review)';

  const costNum = Number(formData.estimatedCost || formData.approxCost || formData.costNum || 0);
  const qtyNumber = Number(formData.quantity) || 1;
  const unitStr = formData.unit || 'Pieces';

  const newIndent = {
    id: formData.id || `ind-${Date.now()}`,
    referenceNo: `REQ-${newIndentNo}`,
    indentNo: newIndentNo,
    requestTitle: formData.requestTitle || formData.title || `${formData.productName || formData.materialName || 'Maintenance'} Requisition`,
    requestType: formData.requestType || 'General Hostel Supplies',
    productName: formData.productName || formData.materialName || 'Maintenance Item',
    materialName: formData.productName || formData.materialName || 'Maintenance Item',
    description: formData.description || '',
    quantity: `${qtyNumber} ${unitStr}`,
    quantityNum: qtyNumber,
    unit: unitStr,
    approxCost: `RS. ${costNum.toFixed(2)}`,
    costNum: costNum,
    estimatedCost: costNum,
    purpose: `${formData.hostelName || 'Hostel'} - ${formData.roomLocation || 'General'}`,
    hostelName: formData.hostelName || "BPUT Boy's Hostel 1 (Kalam Block)",
    roomLocation: formData.roomLocation || 'General Premises',
    priority: formData.priority || 'Medium',
    expectedDate: formData.expectedDate || new Date().toISOString().split('T')[0],
    raisedBy: formData.raisedBy || 'Mr. Tanmaya Kumar Routray (Hostel Warden)',
    isCustom: Boolean(formData.isCustom),
    code: formData.code || 'REQ-MAT',
    currentLevel: finalLevel,
    isApproved: false,
    issued: false,
    isDraft: isDraft,
    status: finalStatus,
    approvedBy: null,
    approvedAt: null,
    remarks: formData.remarks || formData.additionalRemarks || '',
    itemCondition: formData.itemCondition || '',
    repairPossible: formData.repairPossible || '',
    replacementRequired: formData.replacementRequired || '',
    affectedRooms: Number(formData.affectedRooms) || 1,
    safetyHazard: Boolean(formData.safetyHazard),
    observations: formData.observations || '',
    attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
    submittedAt: isDraft
      ? 'Draft saved'
      : new Intl.DateTimeFormat('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
        }).format(new Date()),
    createdAt: new Date().toISOString()
  };

  let updated;
  if (formData.id && currentIndents.some(i => i.id === formData.id)) {
    updated = currentIndents.map(i => i.id === formData.id ? newIndent : i);
  } else {
    updated = [newIndent, ...currentIndents];
  }

  saveIndents(updated);
  return { newIndent, updated };
}

export function deleteIndent(indentId) {
  const currentIndents = getAllIndents();
  const updated = currentIndents.filter(item => item.id !== indentId && item.indentNo !== indentId);
  saveIndents(updated);
  return updated;
}

export function approveIndentByAdmin(indentId, approverName = 'Mr. Rajesh Jena (Hostel Admin)') {
  const currentIndents = getAllIndents();
  const updated = currentIndents.map(item => {
    if (item.id === indentId || item.indentNo === indentId) {
      return {
        ...item,
        isApproved: true,
        currentLevel: 'Level-2 (Store Issued)',
        status: 'Approved',
        approvedBy: approverName,
        approvedAt: new Intl.DateTimeFormat('en-IN', {
          year: 'numeric', month: 'short', day: '2-digit'
        }).format(new Date())
      };
    }
    return item;
  });

  saveIndents(updated);
  return updated;
}

export function rejectIndentByAdmin(indentId, reason = 'Budget / Stock not approved', rejectorName = 'Hostel Admin') {
  const currentIndents = getAllIndents();
  const updated = currentIndents.map(item => {
    if (item.id === indentId || item.indentNo === indentId) {
      return {
        ...item,
        isApproved: false,
        status: 'Rejected',
        currentLevel: 'Rejected',
        approvedBy: rejectorName,
        remarks: reason ? `[Rejected by Admin]: ${reason}` : item.remarks
      };
    }
    return item;
  });

  saveIndents(updated);
  return updated;
}

export function markIndentIssued(indentId) {
  const currentIndents = getAllIndents();
  const updated = currentIndents.map(item => {
    if (item.id === indentId || item.indentNo === indentId) {
      return {
        ...item,
        issued: true,
        currentLevel: 'Store Dispatched',
        status: 'Completed'
      };
    }
    return item;
  });

  saveIndents(updated);
  return updated;
}

export function resetIndentsToDefault() {
  saveIndents(INITIAL_INDENTS.map(normalizeIndent));
  return INITIAL_INDENTS.map(normalizeIndent);
}
