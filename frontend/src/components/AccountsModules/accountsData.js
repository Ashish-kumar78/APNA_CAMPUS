// Master Data & Financial Models for College Management ERP — Accounts & Finance Portal
// Institution: Apna Campus Autonomous Engineering & Technology College
// Directorate of Finance, Accounts & Institutional Bursar

export const ACCOUNTS_OFFICER = {
  name: 'Mr. S. K. Roy',
  id: 'ACC-012',
  employeeCode: 'EMP-FIN-104',
  designation: 'Senior Accounts Officer & Bursar Representative',
  department: 'Finance & Accounts Directorate',
  office: 'Central Administrative Building · Ground Floor Room 104',
  email: 'accounts@apnacampus.edu.in',
  phone: '+91 94370 12044',
  academicYear: '2026–2027',
  financialYear: 'FY 2026–2027'
};

// 1. Master Fee Structures & Programs
export const INITIAL_FEE_STRUCTURES = [
  {
    id: 'FEE-STR-01',
    program: 'B.Tech Computer Science & Engineering',
    courseCode: 'BTECH-CSE',
    academicYear: '2026-27',
    semester: 'Autumn (Semester 5)',
    tuitionFee: 65000,
    developmentFee: 15000,
    labLibraryFee: 10000,
    examinationFee: 3500,
    hostelMessFee: 42000,
    transportFee: 12000,
    totalBaseFee: 93500, // Day scholar (Tuition+Dev+Lab+Exam)
    totalHostelFee: 135500, // With Hostel
    status: 'Active',
    dueDate: '15-Nov-2026'
  },
  {
    id: 'FEE-STR-02',
    program: 'B.Tech AI & Machine Learning',
    courseCode: 'BTECH-AIML',
    academicYear: '2026-27',
    semester: 'Autumn (Semester 5)',
    tuitionFee: 68000,
    developmentFee: 16000,
    labLibraryFee: 12000,
    examinationFee: 3500,
    hostelMessFee: 42000,
    transportFee: 12000,
    totalBaseFee: 99500,
    totalHostelFee: 141500,
    status: 'Active',
    dueDate: '15-Nov-2026'
  },
  {
    id: 'FEE-STR-03',
    program: 'B.Tech Electronics & Communication',
    courseCode: 'BTECH-ECE',
    academicYear: '2026-27',
    semester: 'Autumn (Semester 5)',
    tuitionFee: 62000,
    developmentFee: 14000,
    labLibraryFee: 9500,
    examinationFee: 3500,
    hostelMessFee: 42000,
    transportFee: 12000,
    totalBaseFee: 89000,
    totalHostelFee: 131000,
    status: 'Active',
    dueDate: '15-Nov-2026'
  },
  {
    id: 'FEE-STR-04',
    program: 'B.Tech Electrical & Electronics Engineering',
    courseCode: 'BTECH-EEE',
    academicYear: '2026-27',
    semester: 'Autumn (Semester 5)',
    tuitionFee: 60000,
    developmentFee: 14000,
    labLibraryFee: 9000,
    examinationFee: 3500,
    hostelMessFee: 42000,
    transportFee: 12000,
    totalBaseFee: 86500,
    totalHostelFee: 128500,
    status: 'Active',
    dueDate: '15-Nov-2026'
  },
  {
    id: 'FEE-STR-05',
    program: 'B.Tech Mechanical Engineering',
    courseCode: 'BTECH-MECH',
    academicYear: '2026-27',
    semester: 'Autumn (Semester 5)',
    tuitionFee: 58000,
    developmentFee: 13000,
    labLibraryFee: 8500,
    examinationFee: 3500,
    hostelMessFee: 42000,
    transportFee: 12000,
    totalBaseFee: 83000,
    totalHostelFee: 125000,
    status: 'Active',
    dueDate: '15-Nov-2026'
  },
  {
    id: 'FEE-STR-06',
    program: 'B.Tech Civil Engineering',
    courseCode: 'BTECH-CIVIL',
    academicYear: '2026-27',
    semester: 'Autumn (Semester 5)',
    tuitionFee: 58000,
    developmentFee: 13000,
    labLibraryFee: 8500,
    examinationFee: 3500,
    hostelMessFee: 42000,
    transportFee: 12000,
    totalBaseFee: 83000,
    totalHostelFee: 125000,
    status: 'Active',
    dueDate: '15-Nov-2026'
  }
];

// 2. Student Fee Ledgers & Financial Profiles
export const INITIAL_STUDENT_LEDGERS = [
  {
    studentId: '2305201001',
    name: 'Rakesh Das',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    academicYear: '2026-27',
    admissionCategory: 'OBC (State Quota)',
    residenceType: 'Hostel Resident (B-Block)',
    feeTemplateId: 'FEE-STR-01',
    totalAssessed: 135500,
    concessions: 45000, // PRERANA Scholarship waiver
    totalPaid: 90500,
    refunds: 0,
    outstandingBalance: 0,
    paymentStatus: 'Cleared',
    lastPaymentDate: '18-Aug-2026',
    receiptNo: 'RCPT-2026-0891',
    clearanceStatus: 'Approved (No Dues Issued)'
  },
  {
    studentId: '2305201004',
    name: 'Ananya Sharma',
    department: 'AI & Machine Learning',
    course: 'B.Tech AIML',
    semester: 'Semester 5',
    academicYear: '2026-27',
    admissionCategory: 'General Merit',
    residenceType: 'Day Scholar',
    feeTemplateId: 'FEE-STR-02',
    totalAssessed: 99500,
    concessions: 50000, // Chairman Fellowship
    totalPaid: 49500,
    refunds: 0,
    outstandingBalance: 0,
    paymentStatus: 'Cleared',
    lastPaymentDate: '02-Sep-2026',
    receiptNo: 'RCPT-2026-0902',
    clearanceStatus: 'Approved (No Dues Issued)'
  },
  {
    studentId: '2305201012',
    name: 'Priyanka Mohapatra',
    department: 'Electronics & Communication',
    course: 'B.Tech ECE',
    semester: 'Semester 5',
    academicYear: '2026-27',
    admissionCategory: 'General (EWS)',
    residenceType: 'Hostel Resident (Girls Block C)',
    feeTemplateId: 'FEE-STR-03',
    totalAssessed: 131000,
    concessions: 75000, // Tata Trust Women in Tech
    totalPaid: 28000,
    refunds: 0,
    outstandingBalance: 28000,
    paymentStatus: 'Partial (Tranche 2 Due)',
    lastPaymentDate: '10-Sep-2026',
    receiptNo: 'RCPT-2026-0915',
    clearanceStatus: 'Pending Final Installment'
  },
  {
    studentId: '2305201019',
    name: 'Sourav Panigrahi',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    academicYear: '2026-27',
    admissionCategory: 'General Merit',
    residenceType: 'Day Scholar (College Bus Transit)',
    feeTemplateId: 'FEE-STR-01',
    totalAssessed: 105500, // 93500 + 12000 Transport
    concessions: 0,
    totalPaid: 75000,
    refunds: 0,
    outstandingBalance: 30500,
    paymentStatus: 'Partial (Overdue 24 Days)',
    lastPaymentDate: '20-Aug-2026',
    receiptNo: 'RCPT-2026-0898',
    clearanceStatus: 'Pending Installment 2'
  },
  {
    studentId: '2305201027',
    name: 'Debashis Rout',
    department: 'Electrical & Electronics',
    course: 'B.Tech EEE',
    semester: 'Semester 5',
    academicYear: '2026-27',
    admissionCategory: 'SC Category',
    residenceType: 'Hostel Resident (A-Block)',
    feeTemplateId: 'FEE-STR-04',
    totalAssessed: 128500,
    concessions: 35000, // Dr. Kalam Need Aid
    totalPaid: 93500,
    refunds: 0,
    outstandingBalance: 0,
    paymentStatus: 'Cleared',
    lastPaymentDate: '28-Sep-2026',
    receiptNo: 'RCPT-2026-0925',
    clearanceStatus: 'Approved (No Dues Issued)'
  },
  {
    studentId: '2401432265',
    name: 'Bishnu Prasad Sahoo',
    department: 'Computer Science & Engineering (AI)',
    course: 'B.Tech CSE-AI',
    semester: 'Semester 3',
    academicYear: '2026-27',
    admissionCategory: 'OBC (State Quota)',
    residenceType: 'Day Scholar',
    feeTemplateId: 'FEE-STR-01',
    totalAssessed: 93500,
    concessions: 45000, // PRERANA Grant
    totalPaid: 48500,
    refunds: 0,
    outstandingBalance: 0,
    paymentStatus: 'Cleared',
    lastPaymentDate: '01-Oct-2026',
    receiptNo: 'RCPT-2026-0931',
    clearanceStatus: 'Approved (No Dues Issued)'
  },
  {
    studentId: '2305201035',
    name: 'Alok Kumar Jena',
    department: 'Mechanical Engineering',
    course: 'B.Tech MECH',
    semester: 'Semester 5',
    academicYear: '2026-27',
    admissionCategory: 'General',
    residenceType: 'Day Scholar',
    feeTemplateId: 'FEE-STR-05',
    totalAssessed: 83000,
    concessions: 0,
    totalPaid: 25000,
    refunds: 0,
    outstandingBalance: 58000,
    paymentStatus: 'Overdue (>60 Days)',
    lastPaymentDate: '12-Aug-2026',
    receiptNo: 'RCPT-2026-0884',
    clearanceStatus: 'Defaulter Notice Issued'
  },
  {
    studentId: '2305201042',
    name: 'Smruti Rekha Nayak',
    department: 'Civil Engineering',
    course: 'B.Tech CIVIL',
    semester: 'Semester 5',
    academicYear: '2026-27',
    admissionCategory: 'SEBC Category',
    residenceType: 'Hostel Resident (Girls Block B)',
    feeTemplateId: 'FEE-STR-06',
    totalAssessed: 125000,
    concessions: 0,
    totalPaid: 125000,
    refunds: 0,
    outstandingBalance: 0,
    paymentStatus: 'Cleared',
    lastPaymentDate: '15-Sep-2026',
    receiptNo: 'RCPT-2026-0918',
    clearanceStatus: 'Approved (No Dues Issued)'
  }
];

// 3. Transactions & Receipts Register
export const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-2026-0891',
    receiptNo: 'RCPT-2026-0891',
    date: '18-Aug-2026',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    department: 'CSE',
    feeHead: 'Tuition & Academic Fee',
    amount: 48500,
    mode: 'Net Banking (SBI)',
    reference: 'SBI94829103841',
    status: 'Verified',
    accountOfficer: 'Mr. S. K. Roy'
  },
  {
    id: 'TXN-2026-0892',
    receiptNo: 'RCPT-2026-0892',
    date: '18-Aug-2026',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    department: 'CSE',
    feeHead: 'Hostel & Residential Boarding',
    amount: 42000,
    mode: 'UPI (Google Pay)',
    reference: 'UPI/239019283019',
    status: 'Verified',
    accountOfficer: 'Mr. S. K. Roy'
  },
  {
    id: 'TXN-2026-0902',
    receiptNo: 'RCPT-2026-0902',
    date: '02-Sep-2026',
    studentId: '2305201004',
    studentName: 'Ananya Sharma',
    department: 'AIML',
    feeHead: 'Tuition Fee Balance',
    amount: 49500,
    mode: 'HDFC Net Banking',
    reference: 'HDFC0029481920',
    status: 'Verified',
    accountOfficer: 'Mr. S. K. Roy'
  },
  {
    id: 'TXN-2026-0915',
    receiptNo: 'RCPT-2026-0915',
    date: '10-Sep-2026',
    studentId: '2305201012',
    studentName: 'Priyanka Mohapatra',
    department: 'ECE',
    feeHead: 'Development & Examination Fee',
    amount: 28000,
    mode: 'Debit Card',
    reference: 'POS-TXN-884920',
    status: 'Verified',
    accountOfficer: 'Mr. S. K. Roy'
  },
  {
    id: 'TXN-2026-0925',
    receiptNo: 'RCPT-2026-0925',
    date: '28-Sep-2026',
    studentId: '2305201027',
    studentName: 'Debashis Rout',
    department: 'EEE',
    feeHead: 'Tuition & Hostel Fee',
    amount: 93500,
    mode: 'Bank Challan (SBI)',
    reference: 'CHL-SBI-2026-991',
    status: 'Verified',
    accountOfficer: 'Mr. S. K. Roy'
  },
  {
    id: 'TXN-2026-0931',
    receiptNo: 'RCPT-2026-0931',
    date: '01-Oct-2026',
    studentId: '2401432265',
    studentName: 'Bishnu Prasad Sahoo',
    department: 'CSE',
    feeHead: 'Tuition Fee Balance',
    amount: 48500,
    mode: 'UPI (PhonePe)',
    reference: 'UPI/249102938471',
    status: 'Verified',
    accountOfficer: 'Mr. S. K. Roy'
  }
];

// 4. Employee Payroll Directory & Salary Structures
export const INITIAL_PAYROLL_EMPLOYEES = [
  {
    employeeId: 'EMP-FAC-042',
    name: 'Dr. S. Mohanty',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    employmentType: 'Full-Time Regular',
    payScale: 'Level 13A (₹1,31,400 – ₹2,17,100)',
    basicSalary: 135300,
    hra: 21648, // 16% HRA
    da: 67650,  // 50% DA
    specialAllowance: 12000,
    travelAllowance: 4500,
    providentFund: 16236, // 12% PF
    professionalTax: 250,
    tdsIncomeTax: 18500,
    netSalary: 206112,
    bankAccount: 'SBI 30294819203 (IFSC SBIN0002048)',
    paymentStatus: 'Processed (Oct 2026)'
  },
  {
    employeeId: 'EMP-FAC-011',
    name: 'Dr. P. K. Pattnaik',
    designation: 'Professor & Head of Department',
    department: 'Computer Science & Engineering',
    employmentType: 'Full-Time Regular',
    payScale: 'Level 14 (₹1,44,200 – ₹2,18,200)',
    basicSalary: 162300,
    hra: 25968,
    da: 81150,
    specialAllowance: 18000,
    travelAllowance: 6000,
    providentFund: 19476,
    professionalTax: 250,
    tdsIncomeTax: 26000,
    netSalary: 247692,
    bankAccount: 'HDFC 501002938491 (IFSC HDFC0001824)',
    paymentStatus: 'Processed (Oct 2026)'
  },
  {
    employeeId: 'EMP-FAC-088',
    name: 'Dr. S. K. Swain',
    designation: 'Professor & HOD',
    department: 'AI & Machine Learning',
    employmentType: 'Full-Time Regular',
    payScale: 'Level 14',
    basicSalary: 157500,
    hra: 25200,
    da: 78750,
    specialAllowance: 16500,
    travelAllowance: 5500,
    providentFund: 18900,
    professionalTax: 250,
    tdsIncomeTax: 24500,
    netSalary: 239800,
    bankAccount: 'SBI 30948291048 (IFSC SBIN0002048)',
    paymentStatus: 'Processed (Oct 2026)'
  },
  {
    employeeId: 'EMP-STF-009',
    name: 'Mr. Biswajit Sahoo',
    designation: 'Senior Technical Lab Officer',
    department: 'Computer Science & Engineering',
    employmentType: 'Full-Time Technical',
    payScale: 'Level 7 (₹44,900 – ₹1,42,400)',
    basicSalary: 53600,
    hra: 8576,
    da: 26800,
    specialAllowance: 4000,
    travelAllowance: 2000,
    providentFund: 6432,
    professionalTax: 200,
    tdsIncomeTax: 3500,
    netSalary: 84844,
    bankAccount: 'Canara Bank 1892019283 (IFSC CNRB0001928)',
    paymentStatus: 'Processed (Oct 2026)'
  },
  {
    employeeId: 'EMP-FIN-104',
    name: 'Mr. S. K. Roy',
    designation: 'Senior Accounts Officer',
    department: 'Finance & Accounts',
    employmentType: 'Full-Time Administrative',
    payScale: 'Level 10 (₹56,100 – ₹1,77,500)',
    basicSalary: 73200,
    hra: 11712,
    da: 36600,
    specialAllowance: 6500,
    travelAllowance: 3000,
    providentFund: 8784,
    professionalTax: 250,
    tdsIncomeTax: 7200,
    netSalary: 114778,
    bankAccount: 'SBI 20491829481 (IFSC SBIN0002048)',
    paymentStatus: 'Processed (Oct 2026)'
  }
];

// 5. Vendor Directory & Supplier Invoices
export const INITIAL_VENDORS = [
  {
    id: 'VEND-001',
    name: 'TechCore Computing Systems Pvt Ltd',
    category: 'IT Hardware & Cloud Servers',
    gstin: '21AAACT2948J1Z4',
    contactPerson: 'Mr. Anup Tripathy (+91 98610 44820)',
    address: 'Infocity IT Corridor, Chandaka, Bhubaneswar',
    paymentTerms: 'Net 30 Days',
    totalBilled: 1450000,
    totalPaid: 1200000,
    outstandingPayable: 250000,
    status: 'Active'
  },
  {
    id: 'VEND-002',
    name: 'Utkal Scientific & Instrumentation Lab Supplies',
    category: 'Laboratory Chemicals & Equipment',
    gstin: '21AABCU8921K1Z2',
    contactPerson: 'Dr. R. C. Pradhan (+91 94372 90184)',
    address: 'Industrial Estate, Mancheswar, Bhubaneswar',
    paymentTerms: 'Net 15 Days',
    totalBilled: 820000,
    totalPaid: 820000,
    outstandingPayable: 0,
    status: 'Active'
  },
  {
    id: 'VEND-003',
    name: 'Surya Green Power Solutions LLP',
    category: 'Solar Energy & Campus Maintenance',
    gstin: '21AAKFS9012N1Z8',
    contactPerson: 'Er. S. Mohapatra (+91 99370 82104)',
    address: 'Rasulgarh Square, Bhubaneswar',
    paymentTerms: 'Net 45 Days',
    totalBilled: 2150000,
    totalPaid: 1800000,
    outstandingPayable: 350000,
    status: 'Active'
  },
  {
    id: 'VEND-004',
    name: 'Eastern Book Depot & University Press',
    category: 'Library Books & Journals',
    gstin: '21AAEEB4810M1Z5',
    contactPerson: 'Mr. K. C. Sahoo (+91 94371 67201)',
    address: 'College Road, Cuttack',
    paymentTerms: 'Net 30 Days',
    totalBilled: 540000,
    totalPaid: 460000,
    outstandingPayable: 80000,
    status: 'Active'
  }
];

// 6. Vendor Bills Register
export const INITIAL_VENDOR_BILLS = [
  {
    id: 'BILL-2026-101',
    vendorId: 'VEND-001',
    vendorName: 'TechCore Computing Systems Pvt Ltd',
    invoiceNumber: 'TC-2026/0948',
    date: '12-Oct-2026',
    dueDate: '11-Nov-2026',
    category: 'High Performance AI Server GPU Cluster',
    department: 'AI & Machine Learning Lab',
    amount: 450000,
    tax: 81000, // 18% GST
    totalAmount: 531000,
    paidAmount: 281000,
    balance: 250000,
    status: 'Partially Paid',
    approvalStatus: 'Approved by Bursar'
  },
  {
    id: 'BILL-2026-102',
    vendorId: 'VEND-003',
    vendorName: 'Surya Green Power Solutions LLP',
    invoiceNumber: 'SGP-INV-841',
    date: '05-Oct-2026',
    dueDate: '20-Nov-2026',
    category: 'Solar Inverter Annual Maintenance Contract',
    department: 'Campus Estate & Electrical',
    amount: 350000,
    tax: 63000,
    totalAmount: 413000,
    paidAmount: 63000,
    balance: 350000,
    status: 'Pending Payment',
    approvalStatus: 'Approved by Principal'
  },
  {
    id: 'BILL-2026-103',
    vendorId: 'VEND-004',
    vendorName: 'Eastern Book Depot & University Press',
    invoiceNumber: 'EBD-2026-552',
    date: '18-Sep-2026',
    dueDate: '18-Oct-2026',
    category: 'IEEE Computer Society Conference Proceedings',
    department: 'Central University Library',
    amount: 80000,
    tax: 0,
    totalAmount: 80000,
    paidAmount: 0,
    balance: 80000,
    status: 'Overdue (7 Days)',
    approvalStatus: 'Approved by Chief Librarian'
  }
];

// 7. Operating Expense Register
export const INITIAL_EXPENSES = [
  {
    id: 'EXP-2026-081',
    date: '15-Oct-2026',
    category: 'Campus High-Speed Leased Line Internet (BSNL 1 Gbps)',
    department: 'Central Computing Facility',
    payee: 'BSNL Telecom Odisha Circle',
    amount: 145000,
    paymentMethod: 'Bank Transfer (NEFT)',
    status: 'Paid',
    reference: 'NEFT00294819241',
    approvedBy: 'Bursar & Finance Officer'
  },
  {
    id: 'EXP-2026-082',
    date: '10-Oct-2026',
    category: 'Campus Electricity Tariff (TPCODL High Tension)',
    department: 'Estate Maintenance & Power',
    payee: 'TP Central Odisha Distribution Ltd',
    amount: 485000,
    paymentMethod: 'RTGS Electronic',
    status: 'Paid',
    reference: 'RTGS20491829014',
    approvedBy: 'Principal & Finance Committee'
  },
  {
    id: 'EXP-2026-083',
    date: '02-Oct-2026',
    category: 'Laboratory Chemicals & Consumables',
    department: 'Chemistry & Environmental Lab',
    payee: 'Utkal Scientific Supplies',
    amount: 62000,
    paymentMethod: 'Cheque (#884920)',
    status: 'Paid',
    reference: 'CHQ-884920',
    approvedBy: 'HOD Chemistry'
  },
  {
    id: 'EXP-2026-084',
    date: '20-Oct-2026',
    category: 'Annual Campus Fire Safety & Extinguisher Refill',
    department: 'Safety & Security Operations',
    payee: 'Odisha Fire Tech Services',
    amount: 38000,
    paymentMethod: 'Net Banking',
    status: 'Pending Clearance',
    reference: 'REQ-SAFE-2026-10',
    approvedBy: 'Estate Officer'
  }
];

// 8. Other College Income (Non-Tuition)
export const INITIAL_OTHER_INCOME = [
  {
    id: 'INC-2026-041',
    date: '14-Oct-2026',
    category: 'Hostel & Residential Accommodation Dues',
    payer: 'Boys Hostel Boarding Batch 2026',
    reference: 'HSTL-COLL-OCT-01',
    amount: 620000,
    mode: 'Online Portal Gateway',
    status: 'Realized'
  },
  {
    id: 'INC-2026-042',
    date: '08-Oct-2026',
    category: 'Campus Transit Fleet Passes',
    payer: 'Day Scholar Commuter Batch',
    reference: 'TRANS-BUS-PASS-09',
    amount: 280000,
    mode: 'UPI Collection',
    status: 'Realized'
  },
  {
    id: 'INC-2026-043',
    date: '22-Sep-2026',
    category: 'Autonomous Examination & Backlog Evaluation Fees',
    payer: 'Examination Cell Collection Counter',
    reference: 'EXAM-FEE-2026-AUTUMN',
    amount: 345000,
    mode: 'SBI Treasury Challan',
    status: 'Realized'
  },
  {
    id: 'INC-2026-044',
    date: '15-Sep-2026',
    category: 'Industry R&D Consultancy & Testing Charges',
    payer: 'Odisha Mining Corporation (Civil Testing)',
    reference: 'OMC-CONSULT-2026',
    amount: 450000,
    mode: 'NEFT Transfer',
    status: 'Realized'
  }
];

// 9. Chart of Accounts & General Ledger
export const INITIAL_CHART_OF_ACCOUNTS = [
  // 1000 - Assets
  { code: '1010', name: 'Cash in Hand (Accounts Vault)', category: 'Assets', type: 'Current Asset', balance: 450000 },
  { code: '1020', name: 'State Bank of India (Treasury A/c 3020491)', category: 'Assets', type: 'Bank Asset', balance: 12540000 },
  { code: '1030', name: 'HDFC Bank (Student Fee Collection A/c 50100)', category: 'Assets', type: 'Bank Asset', balance: 5460000 },
  { code: '1040', name: 'Student Fee Receivables (Outstanding Dues)', category: 'Assets', type: 'Accounts Receivable', balance: 5130000 },
  { code: '1050', name: 'Campus Infrastructure & Laboratory Equipment', category: 'Assets', type: 'Fixed Asset', balance: 48500000 },

  // 2000 - Liabilities
  { code: '2010', name: 'Vendor & Supplier Payables', category: 'Liabilities', type: 'Accounts Payable', balance: 680000 },
  { code: '2020', name: 'Faculty & Staff Salary Payable', category: 'Liabilities', type: 'Current Liability', balance: 8240000 },
  { code: '2030', name: 'Student Caution Money & Security Deposit', category: 'Liabilities', type: 'Long-term Liability', balance: 4800000 },
  { code: '2040', name: 'Provident Fund (PF) & Statutory Deductions', category: 'Liabilities', type: 'Current Liability', balance: 940000 },

  // 3000 - Equity & Endowments
  { code: '3010', name: 'College Governing Board Capital Fund', category: 'Equity', type: 'Capital Fund', balance: 42000000 },
  { code: '3020', name: 'Prof. S. P. Panda Chairman Endowment Fund', category: 'Equity', type: 'Restricted Endowment', balance: 2500000 },

  // 4000 - Income
  { code: '4010', name: 'Tuition & Academic Development Fee Income', category: 'Income', type: 'Operating Revenue', balance: 36240000 },
  { code: '4020', name: 'Hostel & Residential Boarding Income', category: 'Income', type: 'Operating Revenue', balance: 6205500 },
  { code: '4030', name: 'Transportation Transit Fee Income', category: 'Income', type: 'Operating Revenue', balance: 2895900 },
  { code: '4040', name: 'Autonomous Examination Fee Income', category: 'Income', type: 'Operating Revenue', balance: 2068500 },

  // 5000 - Expenses
  { code: '5010', name: 'Teaching Faculty & Staff Salaries', category: 'Expenses', type: 'Operating Expense', balance: 82400000 },
  { code: '5020', name: 'Campus Electricity & High-Tension Power', category: 'Expenses', type: 'Operating Expense', balance: 4850000 },
  { code: '5030', name: 'Laboratory Consumables & Research Grants', category: 'Expenses', type: 'Direct Expense', balance: 2450000 },
  { code: '5040', name: 'Estate Maintenance & Solar Upkeep', category: 'Expenses', type: 'Operating Expense', balance: 3150000 }
];

// 10. Double-Entry Journal Entries
export const INITIAL_JOURNAL_ENTRIES = [
  {
    id: 'JRN-2026-091',
    date: '18-Oct-2026',
    description: 'Student Tuition Fee Collection Batch #44 Credit to HDFC Collection A/c',
    reference: 'COLL-BATCH-44',
    debitAccount: '1030 - HDFC Bank (Collection A/c)',
    creditAccount: '4010 - Tuition Fee Income',
    debitAmount: 485000,
    creditAmount: 485000,
    status: 'Posted',
    preparedBy: 'Mr. S. K. Roy (Accounts Officer)'
  },
  {
    id: 'JRN-2026-092',
    date: '15-Oct-2026',
    description: 'Monthly Leased Line Internet Payment to BSNL Odisha Circle',
    reference: 'NEFT00294819241',
    debitAccount: '5040 - Estate & Campus Maintenance',
    creditAccount: '1020 - State Bank of India (Treasury)',
    debitAmount: 145000,
    creditAmount: 145000,
    status: 'Posted',
    preparedBy: 'Mr. S. K. Roy (Accounts Officer)'
  },
  {
    id: 'JRN-2026-093',
    date: '12-Oct-2026',
    description: 'TechCore Computing High Performance Server GPU Cluster Invoice',
    reference: 'TC-2026/0948',
    debitAccount: '1050 - Campus Infrastructure Equipment',
    creditAccount: '2010 - Vendor & Supplier Payables',
    debitAmount: 531000,
    creditAmount: 531000,
    status: 'Posted',
    preparedBy: 'Mr. S. K. Roy (Accounts Officer)'
  },
  {
    id: 'JRN-2026-094',
    date: '01-Oct-2026',
    description: 'October Monthly Teaching & Staff Payroll Disbursement Provision',
    reference: 'PAYROLL-2026-10',
    debitAccount: '5010 - Teaching Faculty & Staff Salaries',
    creditAccount: '2020 - Faculty & Staff Salary Payable',
    debitAmount: 8240000,
    creditAmount: 8240000,
    status: 'Posted',
    preparedBy: 'Dr. A. K. Mishra (Bursar)'
  }
];

// 11. Bank Reconciliation Records
export const INITIAL_BANK_RECONCILIATION = [
  {
    id: 'BREC-2026-10',
    bankName: 'State Bank of India (Treasury A/c 3020491829)',
    statementDate: '30-Sep-2026',
    bookBalance: 12540000,
    bankStatementBalance: 12565000,
    uncreditedReceipts: 45000,
    unpresentedCheques: 70000,
    variance: 0,
    status: 'Reconciled 100%',
    reconciledBy: 'Mr. S. K. Roy',
    dateCompleted: '04-Oct-2026'
  },
  {
    id: 'BREC-2026-11',
    bankName: 'HDFC Bank (Student Fee Collection A/c 501002948)',
    statementDate: '15-Oct-2026',
    bookBalance: 5460000,
    bankStatementBalance: 5460000,
    uncreditedReceipts: 0,
    unpresentedCheques: 0,
    variance: 0,
    status: 'Reconciled 100%',
    reconciledBy: 'Mr. S. K. Roy',
    dateCompleted: '18-Oct-2026'
  }
];

// 12. Institutional Budgets & Utilization
export const INITIAL_BUDGETS = [
  {
    department: 'Computer Science & Engineering',
    category: 'Academic & Lab Infrastructure',
    allocated: 4500000,
    actualSpent: 3620000,
    committed: 450000,
    balance: 430000,
    utilizationRate: 90.4,
    status: 'Optimal 90%'
  },
  {
    department: 'AI & Machine Learning',
    category: 'High Performance GPU Lab',
    allocated: 3500000,
    actualSpent: 2850000,
    committed: 350000,
    balance: 300000,
    utilizationRate: 91.4,
    status: 'Optimal 91%'
  },
  {
    department: 'Electronics & Communication',
    category: 'VLSI & Embedded Systems',
    allocated: 2800000,
    actualSpent: 2100000,
    committed: 300000,
    balance: 400000,
    utilizationRate: 85.7,
    status: 'Optimal 86%'
  },
  {
    department: 'Estate Maintenance & Operations',
    category: 'Solar Power & High Tension Grid',
    allocated: 6500000,
    actualSpent: 5200000,
    committed: 650000,
    balance: 650000,
    utilizationRate: 90.0,
    status: 'Optimal 90%'
  },
  {
    department: 'Central University Library',
    category: 'E-Journals, Books & Subscriptions',
    allocated: 1800000,
    actualSpent: 1350000,
    committed: 150000,
    balance: 300000,
    utilizationRate: 83.3,
    status: 'Healthy 83%'
  }
];

// 13. Statutory Financial Audit Trail Logs
export const INITIAL_ACCOUNTS_AUDIT_LOGS = [
  {
    id: 'FIN-AUD-9410',
    timestamp: 'Today, 11:45 AM',
    actor: 'Mr. S. K. Roy',
    role: 'Senior Accounts Officer',
    actionType: 'FEE_PAYMENT_RECORDED',
    target: 'RCPT-2026-0931 (Bishnu Prasad Sahoo - ₹48,500)',
    details: 'Verified online UPI transaction reference UPI/249102938471 against HDFC collection stream.',
    ip: '192.168.1.14 (Accounts Desk 1)'
  },
  {
    id: 'FIN-AUD-9402',
    timestamp: 'Today, 10:15 AM',
    actor: 'Dr. A. K. Mishra',
    role: 'Bursar & Finance Officer',
    actionType: 'VENDOR_BILL_APPROVED',
    target: 'BILL-2026-101 (TechCore Computing - ₹5,31,000)',
    details: 'Sanctioned payment voucher for AI Server GPU Cluster installation verified by HOD AIML.',
    ip: '192.168.1.10 (Bursar Office)'
  },
  {
    id: 'FIN-AUD-9388',
    timestamp: 'Yesterday, 04:30 PM',
    actor: 'Mr. S. K. Roy',
    role: 'Senior Accounts Officer',
    actionType: 'JOURNAL_ENTRY_POSTED',
    target: 'JRN-2026-091 (Tuition Collection Batch #44)',
    details: 'Posted balanced double-entry voucher of ₹4,85,000 to General Ledger.',
    ip: '192.168.1.14 (Accounts Desk 1)'
  },
  {
    id: 'FIN-AUD-9365',
    timestamp: '22 Oct 2026, 03:00 PM',
    actor: 'Mrs. S. Mohanty',
    role: 'Senior Payroll Officer',
    actionType: 'PAYROLL_DISBURSEMENT_COMMITTED',
    target: 'PAYROLL-2026-10 (Teaching Faculty & Staff)',
    details: 'Generated October 2026 payroll run totaling ₹82,40,000 across 222 employees.',
    ip: '192.168.1.16 (Payroll Section)'
  },
  {
    id: 'FIN-AUD-9340',
    timestamp: '20 Oct 2026, 11:20 AM',
    actor: 'Mr. S. K. Roy',
    role: 'Senior Accounts Officer',
    actionType: 'BANK_RECONCILIATION_FILED',
    target: 'BREC-2026-11 (HDFC Fee Collection Account)',
    details: 'Reconciled 100% of collection transactions with zero variance recorded.',
    ip: '192.168.1.14 (Accounts Desk 1)'
  }
];
