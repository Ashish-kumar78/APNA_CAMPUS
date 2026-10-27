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
    indentNo: '7037/15350',
    materialName: 'File with GIFT Logo (Folder File)',
    isCustom: false,
    code: 'S-201',
    quantity: '4.00 pcs',
    approxCost: 'RS. 82.18',
    costNum: 82.18,
    purpose: 'bh-1,bh-2',
    expectedDate: '22-01-2024',
    raisedBy: 'Tanmaya Kumar Routray',
    currentLevel: 'Level-1',
    isApproved: true,
    issued: true,
    status: 'Approved',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '24-01-2024',
    remarks: 'Approved for session student files.'
  },
  {
    id: 'ind-2',
    indentNo: '7037/15349',
    materialName: 'Attendance Register Student',
    isCustom: false,
    code: 'S-211',
    quantity: '2.00 pcs',
    approxCost: 'RS. 217.11',
    costNum: 217.11,
    purpose: 'bh-1,bh-2',
    expectedDate: '22-01-2024',
    raisedBy: 'Tanmaya Kumar Routray',
    currentLevel: 'Level-1',
    isApproved: true,
    issued: true,
    status: 'Approved',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '23-01-2024',
    remarks: 'Approved for night roll-call record register.'
  },
  {
    id: 'ind-3',
    indentNo: '6396/13875',
    materialName: 'Cover File',
    isCustom: false,
    code: 'S-202',
    quantity: '4.00 pcs',
    approxCost: 'RS. 109.33',
    costNum: 109.33,
    purpose: 'bh-1,bh-2',
    expectedDate: '11-10-2023',
    raisedBy: 'Tanmaya Kumar Routray',
    currentLevel: 'Level-1',
    isApproved: true,
    issued: true,
    status: 'Approved',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '12-10-2023',
    remarks: 'Office filing requisitions approved.'
  },
  {
    id: 'ind-4',
    indentNo: '6396/13874',
    materialName: 'Attendance Register Student',
    isCustom: false,
    code: 'S-211',
    quantity: '2.00 pcs',
    approxCost: 'RS. 221.75',
    costNum: 221.75,
    purpose: 'bh-1,bh-2',
    expectedDate: '11-10-2023',
    raisedBy: 'Tanmaya Kumar Routray',
    currentLevel: 'Level-1',
    isApproved: true,
    issued: true,
    status: 'Approved',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '12-10-2023',
    remarks: 'Approved for Kalam & Sarojini residence blocks.'
  },
  {
    id: 'ind-5',
    indentNo: '2051/4122',
    materialName: 'Scissor',
    isCustom: false,
    code: 'S-104',
    quantity: '1.00 pcs',
    approxCost: 'RS. 126.67',
    costNum: 126.67,
    purpose: 'OFFICE',
    expectedDate: '03-01-2023',
    raisedBy: 'Tanmaya Kumar Routray',
    currentLevel: 'Level-1',
    isApproved: true,
    issued: true,
    status: 'Approved',
    approvedBy: 'Mr. Rajesh Jena (Hostel Admin)',
    approvedAt: '04-01-2023',
    remarks: 'Stationery procurement.'
  },
  {
    id: 'ind-6',
    indentNo: '8492/18920',
    materialName: 'Aluminium door Stay Handle & lock',
    isCustom: false,
    code: 'H-301',
    quantity: '12.00 pcs',
    approxCost: 'RS. 1,446.00',
    costNum: 1446.00,
    purpose: 'bh-1 (Gandhi Block Rooms 101-106)',
    expectedDate: '2026-11-02',
    raisedBy: 'Tanmaya Kumar Routray',
    currentLevel: 'Level-1',
    isApproved: false,
    issued: false,
    status: 'Pending',
    approvedBy: null,
    approvedAt: null,
    remarks: 'Damaged locks require urgent replacement before winter term exams.'
  },
  {
    id: 'ind-7',
    indentNo: '8492/18921',
    materialName: 'Shower Spindle 7mm & CPVC Sockets',
    isCustom: true,
    code: 'P-707-CUST',
    quantity: '8.00 pcs',
    approxCost: 'RS. 860.00',
    costNum: 860.00,
    purpose: 'gh-1 (Sarojini Girls Residence)',
    expectedDate: '2026-11-05',
    raisedBy: 'Mrs. Nibedita Das',
    currentLevel: 'Level-1',
    isApproved: false,
    issued: false,
    status: 'Pending',
    approvedBy: null,
    approvedAt: null,
    remarks: 'Plumbing maintenance on 2nd and 3rd floor washrooms.'
  }
];

export function getAllIndents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading indents from storage', err);
  }
  return [...INITIAL_INDENTS];
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

  const newIndent = {
    id: `ind-${Date.now()}`,
    indentNo: newIndentNo,
    materialName: formData.materialName,
    isCustom: Boolean(formData.isCustom),
    code: formData.code || (formData.isCustom ? 'CUST-SPEC' : 'S-GEN'),
    quantity: `${Number(formData.quantity).toFixed(2)} ${formData.unit || 'pcs'}`,
    approxCost: `RS. ${Number(formData.approxCost || 0).toFixed(2)}`,
    costNum: Number(formData.approxCost || 0),
    purpose: formData.purpose || 'Hostel Campus Blocks',
    expectedDate: formData.expectedDate || new Date().toISOString().split('T')[0],
    raisedBy: formData.raisedBy || 'Hostel Warden',
    currentLevel: 'Level-1',
    isApproved: false,
    issued: false,
    status: 'Pending',
    approvedBy: null,
    approvedAt: null,
    remarks: formData.remarks || ''
  };

  const updated = [newIndent, ...currentIndents];
  saveIndents(updated);
  return { newIndent, updated };
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
        remarks: reason ? `[Rejected]: ${reason}` : item.remarks
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
        status: 'Approved & Issued'
      };
    }
    return item;
  });

  saveIndents(updated);
  return updated;
}

export function resetIndentsToDefault() {
  saveIndents(INITIAL_INDENTS);
  return INITIAL_INDENTS;
}
