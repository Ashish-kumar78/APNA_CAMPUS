export interface WardenCmsProfile {
  employeeId: string;
  bputRegdNo: string;
  name: string;
  department: string;
  designation: string;
  category: string;
  mobileNo: string;
  emailId: string;
  status: string;
  dutyStatus?: string;
  relievingWarden?: string;
  avatar: string;

  // Personal Details
  title: string;
  firstName: string;
  lastName: string;
  middleName: string;
  nameAlias: string;
  joiningDate: string;
  empDob: string;
  gender: string;
  birthPlace: string;
  totalExperience: string;
  bloodGroup: string;
  maritalStatus: string;
  caste: string;
  nationality: string;
  religion: string;
  thumb: string;
  lunch: string;
  transport: string;
  breakfast: string;
  dinner: string;

  // Guardians
  fatherName: string;
  motherName: string;
  spouseName: string;
  emergencyContact: string;
  guardianMobile: string;
  relationship: string;
  guardianOccupation: string;

  // Address
  presentAddress1: string;
  presentAddress2: string;
  presentCity: string;
  presentDistrict: string;
  presentState: string;
  presentPin: string;
  presentPS: string;

  permAddress1: string;
  permDistrict: string;
  permState: string;
  permPin: string;
  permPS: string;

  // Other Info
  attendanceCardId: string;
  otherBputRegdNo: string;
  aadhaarNo: string;
  panNo: string;
  voterId: string;
  drivingLicenseNo: string;
  bankAccountNo: string;
  bankName: string;
  ifscCode: string;
  motherNameOther: string;
  reference: string;
  qualification: string;
  specialization: string;
  papersPublished: string;

  // Health
  physicalFitness: string;
  height: string;
  weight: string;
  bloodPressure: string;
  chronicConditions: string;
  vaccinationStatus: string;
  medicalFitnessCert: string;

  // Hostel Assignment
  hostelId: string;
  hostelName: string;
  assignedHostelOrPost?: string;
  assignedBlocks: string[];
  dutyShift: string;
  shiftTimings: string;
  attendanceCompliance: number;
  pendingTasks: number;
  activeResidentsCount: number;
  totalBedsSupervised: number;
  documents: Array<{
    id: string;
    name: string;
    meta: string;
    fileData?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    uploadedAt?: string;
  }>;
}

export const INITIAL_WARDEN_PROFILES: Record<string, WardenCmsProfile> = {
  'WRD-101': {
    employeeId: 'WRD-101',
    bputRegdNo: 'BPUT-EMP-2018-091',
    name: 'Mr. Rajesh Jena',
    department: 'Hostel Administration & Student Housing',
    designation: 'Chief Resident Warden (Boys)',
    category: 'Non Teaching',
    mobileNo: '9437011223',
    emailId: 'rajesh.jena@gift.edu.in',
    status: 'Active',
    avatar: '/candidate_photo_apna.png',

    title: 'Mr.',
    firstName: 'Rajesh',
    middleName: '',
    lastName: 'Jena',
    nameAlias: 'R. Jena',
    joiningDate: '15-07-2018',
    empDob: '12-04-1979',
    gender: 'MALE',
    birthPlace: 'Balipatna, Khordha',
    totalExperience: '16 Year(s) 4 Month(s)',
    bloodGroup: 'B+',
    maritalStatus: 'MARRIED',
    caste: 'General',
    nationality: 'Indian',
    religion: 'Hindu',
    thumb: '412',
    lunch: 'Y',
    transport: 'Y',
    breakfast: 'Y',
    dinner: 'Y',

    fatherName: 'Late S. K. Jena',
    motherName: 'Mrs. K. Jena',
    spouseName: 'Mrs. Manorama Jena',
    emergencyContact: 'Mrs. Manorama Jena',
    guardianMobile: '+91 94370 11224',
    relationship: 'Spouse',
    guardianOccupation: 'High School Teacher',

    presentAddress1: 'Staff Quarters Block A-201',
    presentAddress2: 'Campus Residential Complex',
    presentCity: 'Bhubaneswar',
    presentDistrict: 'Khordha',
    presentState: 'Odisha',
    presentPin: '751024',
    presentPS: 'Chandaka PS',

    permAddress1: 'At/PO - Balipatna, Shanti Nagar',
    permDistrict: 'Khordha',
    permState: 'Odisha',
    permPin: '752102',
    permPS: 'Balipatna PS',

    attendanceCardId: 'CRW-BOYS-01',
    otherBputRegdNo: 'REG-2018-081',
    aadhaarNo: '789123456012',
    panNo: 'ABCPJ1234F',
    voterId: 'OD/12/345/678912',
    drivingLicenseNo: 'OD-0220120034567',
    bankAccountNo: '31098234561',
    bankName: 'SBI',
    ifscCode: 'SBIN0004375',
    motherNameOther: 'Kuntala Jena',
    reference: 'Principal Office GIFT Autonomous',
    qualification: 'M.Tech (Thermal Engg), B.Tech (Mechanical)',
    specialization: 'Hostel Administration & Student Welfare',
    papersPublished: '2 National Conference Papers',

    physicalFitness: 'Excellent · Fit for 24x7 Resident Duty',
    height: '174 cm',
    weight: '72 kg',
    bloodPressure: '122/80 mmHg',
    chronicConditions: 'None',
    vaccinationStatus: 'Fully Vaccinated (Covishield 3 Doses)',
    medicalFitnessCert: 'Certified by Campus Medical Officer (Dr. S. K. Rath)',

    hostelId: 'hst-3',
    hostelName: 'Gandhi Boys Residence',
    assignedBlocks: ['Block A (Rooms 101-220)', 'Block B (Rooms 201-320)'],
    dutyShift: 'General / 24x7 Resident',
    shiftTimings: '06:00 AM - 10:00 PM (On-Call Curfew)',
    attendanceCompliance: 98.4,
    pendingTasks: 3,
    activeResidentsCount: 168,
    totalBedsSupervised: 180,
    documents: [
      { id: 'doc-1', name: 'Chief Resident Warden Appointment Order', meta: 'Issued 15-07-2018 · Autonomous Secretariat' },
      { id: 'doc-2', name: 'Post Graduate & B.Tech Degree Certificates', meta: 'BPUT Autonomous Verified' },
      { id: 'doc-3', name: 'Identity Proof (Aadhaar & PAN)', meta: 'UIDAI & Income Tax Verified' },
      { id: 'doc-4', name: 'Hostel Night Curfew Management Certification', meta: 'Campus Safety Council' },
      { id: 'doc-5', name: 'Annual Health & Physical Fitness Clearance', meta: 'Issued Oct 2026' }
    ]
  },

  'WRD-102': {
    employeeId: 'WRD-102',
    bputRegdNo: 'BPUT-EMP-2017-044',
    name: 'Mrs. Nibedita Das',
    department: 'Hostel Administration & Student Housing',
    designation: 'Chief Resident Warden (Girls)',
    category: 'Non Teaching',
    mobileNo: '9437000120',
    emailId: 'nibedita.das@gift.edu.in',
    status: 'Active',
    avatar: '/candidate_photo_apna.png',

    title: 'Mrs.',
    firstName: 'Nibedita',
    middleName: '',
    lastName: 'Das',
    nameAlias: 'N. Das',
    joiningDate: '01-08-2017',
    empDob: '18-09-1981',
    gender: 'FEMALE',
    birthPlace: 'Jagatsinghpur, Odisha',
    totalExperience: '14 Year(s) 2 Month(s)',
    bloodGroup: 'O+',
    maritalStatus: 'MARRIED',
    caste: 'General',
    nationality: 'Indian',
    religion: 'Hindu',
    thumb: '388',
    lunch: 'Y',
    transport: 'N',
    breakfast: 'Y',
    dinner: 'Y',

    fatherName: 'Late B. C. Mohapatra',
    motherName: 'Mrs. S. Mohapatra',
    spouseName: 'Dr. A. K. Das',
    emergencyContact: 'Dr. A. K. Das',
    guardianMobile: '+91 94370 00129',
    relationship: 'Spouse',
    guardianOccupation: 'Senior Medical Specialist',

    presentAddress1: 'Staff Quarters Block B-104',
    presentAddress2: 'Campus Residential Complex',
    presentCity: 'Bhubaneswar',
    presentDistrict: 'Khordha',
    presentState: 'Odisha',
    presentPin: '751024',
    presentPS: 'Chandaka PS',

    permAddress1: 'At/PO - Jagatsinghpur Town, Ward 8',
    permDistrict: 'Jagatsinghpur',
    permState: 'Odisha',
    permPin: '754103',
    permPS: 'Jagatsinghpur PS',

    attendanceCardId: 'CRW-GIRLS-01',
    otherBputRegdNo: 'REG-2017-032',
    aadhaarNo: '890123456789',
    panNo: 'BCDPD5678G',
    voterId: 'OD/14/456/789012',
    drivingLicenseNo: 'OD-0220140056789',
    bankAccountNo: '50100234567891',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001234',
    motherNameOther: 'Shantilata Mohapatra',
    reference: 'Governing Council Member',
    qualification: 'M.Sc (Chemistry), B.Ed',
    specialization: 'Girls Resident Welfare & Mentor Counseling',
    papersPublished: 'Educational Counseling Manual (2022)',

    physicalFitness: 'Fit · Active Resident Warden Duty',
    height: '162 cm',
    weight: '60 kg',
    bloodPressure: '118/76 mmHg',
    chronicConditions: 'None',
    vaccinationStatus: 'Fully Vaccinated (Covaxin 3 Doses)',
    medicalFitnessCert: 'Certified by Campus Medical Officer',

    hostelId: 'hst-4',
    hostelName: 'Sarojini Girls Residence',
    assignedBlocks: ['Wing A (Floors 1-3)', 'Wing B (Floors 1-2)'],
    dutyShift: 'Morning & Evening Resident',
    shiftTimings: '07:00 AM - 09:30 PM (Curfew Lock)',
    attendanceCompliance: 99.2,
    pendingTasks: 1,
    activeResidentsCount: 192,
    totalBedsSupervised: 200,
    documents: [
      { id: 'doc-1', name: 'Chief Resident Warden Appointment Dossier', meta: 'Issued 01-08-2017' },
      { id: 'doc-2', name: 'M.Sc & B.Ed Degree Transcripts', meta: 'Verified by University' },
      { id: 'doc-3', name: 'UIDAI Aadhaar & PAN Card Proof', meta: 'Digitally Verified' },
      { id: 'doc-4', name: 'Women Student Safety & Biometric Protocol Cert', meta: 'Autonomous Cell' },
      { id: 'doc-5', name: 'Annual Medical Fitness Certificate', meta: 'Issued Sept 2026' }
    ]
  },

  'WRD-103': {
    employeeId: 'WRD-103',
    bputRegdNo: '140',
    name: 'Mr. Tanmaya Kumar Routray',
    department: 'Hostel Administration',
    designation: 'Hostel Supervisor (Boys)',
    category: 'Non Teaching',
    mobileNo: '7873008197',
    emailId: 'tanmaya.routray@gift.edu.in',
    status: 'Active',
    avatar: '/candidate_photo_apna.png',

    title: 'Mr.',
    firstName: 'Tanmaya',
    middleName: 'Kumar',
    lastName: 'Routray',
    nameAlias: 'T. K. Routray',
    joiningDate: '04-06-2015',
    empDob: '06-06-1976',
    gender: 'MALE',
    birthPlace: 'Cuttack, Odisha',
    totalExperience: '20 Year(s) 0 Month(s)',
    bloodGroup: 'A-',
    maritalStatus: 'MARRIED',
    caste: 'General',
    nationality: 'Indian',
    religion: 'Hindu',
    thumb: '374',
    lunch: 'Y',
    transport: 'N',
    breakfast: 'Y',
    dinner: 'Y',

    fatherName: 'Mr. B. N. Routray',
    motherName: 'Mrs. S. Routray',
    spouseName: 'Mrs. P. Routray',
    emergencyContact: 'Mr. B. N. Routray',
    guardianMobile: '+91 94370 88219',
    relationship: 'Father',
    guardianOccupation: 'Retired State Govt Officer',

    presentAddress1: 'Staff Quarters Block C-102',
    presentAddress2: 'Campus Residential Complex',
    presentCity: 'Bhubaneswar',
    presentDistrict: 'Khordha',
    presentState: 'Odisha',
    presentPin: '751024',
    presentPS: 'Chandaka PS',

    permAddress1: 'At/PO - Tangi, Naya Sahi',
    permDistrict: 'Cuttack',
    permState: 'Odisha',
    permPin: '754022',
    permPS: 'Tangi PS',

    attendanceCardId: 'WRD-SUP-03',
    otherBputRegdNo: 'BPUT-EMP-140',
    aadhaarNo: '633542037780',
    panNo: 'AOBPR8901K',
    voterId: 'OD/08/234/123456',
    drivingLicenseNo: 'OD-0120100012345',
    bankAccountNo: '32715690478',
    bankName: 'SBI',
    ifscCode: 'SBIN0004375',
    motherNameOther: 'Urmila Routaraya',
    reference: 'Hostel Committee Secretariat',
    qualification: 'MCA, Diploma in Administration',
    specialization: 'Hostel Infrastructure & Stores Requisition',
    papersPublished: '—',

    physicalFitness: 'Fit to Work 24x7 Resident Duty',
    height: '170 cm',
    weight: '68 kg',
    bloodPressure: '120/80 mmHg',
    chronicConditions: 'None',
    vaccinationStatus: 'Fully Vaccinated (Covishield 3 Doses)',
    medicalFitnessCert: 'Fit to Work 24x7 Resident Duty',

    hostelId: 'hst-2',
    hostelName: 'Bhabani Hostel-2',
    assignedBlocks: ['Main Block (Floors 1-3)'],
    dutyShift: 'Evening & Night Shift',
    shiftTimings: '04:00 PM - 12:00 AM',
    attendanceCompliance: 94.8,
    pendingTasks: 4,
    activeResidentsCount: 52,
    totalBedsSupervised: 60,
    documents: [
      { id: 'doc-1', name: 'Appointment Order & Joining Dossier', meta: 'Issued 04-06-2015 · Autonomous Secretariat' },
      { id: 'doc-2', name: 'Higher Secondary & Technical Qualification Certificates', meta: 'Verified Transcripts · BPUT Board' },
      { id: 'doc-3', name: 'Aadhaar & PAN Identity Verification Record', meta: 'UIDAI & NSDL Digitally Verified' },
      { id: 'doc-4', name: 'Police Verification & Character Clearance Certificate', meta: 'Clear Record · Verified 2024' },
      { id: 'doc-5', name: 'Annual Occupational Health Fitness Certificate', meta: 'Fit to Work 24x7 Resident Duty' }
    ]
  },

  'WRD-104': {
    employeeId: 'WRD-104',
    bputRegdNo: 'BPUT-EMP-2022-118',
    name: 'Dr. Swapna Patra',
    department: 'Hostel Administration',
    designation: 'Assistant Warden (Girls)',
    category: 'Non Teaching',
    mobileNo: '9437233445',
    emailId: 'swapna.patra@gift.edu.in',
    status: 'Active',
    avatar: '/candidate_photo_apna.png',

    title: 'Dr.',
    firstName: 'Swapna',
    middleName: '',
    lastName: 'Patra',
    nameAlias: 'Dr. S. Patra',
    joiningDate: '15-11-2022',
    empDob: '25-01-1988',
    gender: 'FEMALE',
    birthPlace: 'Bhubaneswar, Odisha',
    totalExperience: '7 Year(s) 8 Month(s)',
    bloodGroup: 'AB+',
    maritalStatus: 'SINGLE',
    caste: 'General',
    nationality: 'Indian',
    religion: 'Hindu',
    thumb: '455',
    lunch: 'Y',
    transport: 'N',
    breakfast: 'Y',
    dinner: 'Y',

    fatherName: 'Prof. R. Patra',
    motherName: 'Mrs. M. Patra',
    spouseName: '—',
    emergencyContact: 'Prof. R. Patra',
    guardianMobile: '+91 94372 33449',
    relationship: 'Father',
    guardianOccupation: 'Retired University Professor',

    presentAddress1: 'Faculty Housing Suite D-302',
    presentAddress2: 'Campus Residential Area',
    presentCity: 'Bhubaneswar',
    presentDistrict: 'Khordha',
    presentState: 'Odisha',
    presentPin: '751024',
    presentPS: 'Chandaka PS',

    permAddress1: 'Plot 412, Sailashree Vihar',
    permDistrict: 'Khordha',
    permState: 'Odisha',
    permPin: '751021',
    permPS: 'Chandrasekharpur PS',

    attendanceCardId: 'ASST-WRD-04',
    otherBputRegdNo: 'REG-2022-098',
    aadhaarNo: '901234567890',
    panNo: 'CDEPP9012H',
    voterId: 'OD/11/123/987654',
    drivingLicenseNo: 'OD-0220180098765',
    bankAccountNo: '918020034567891',
    bankName: 'Axis Bank',
    ifscCode: 'UTIB0000123',
    motherNameOther: 'Minati Patra',
    reference: 'Dean Student Affairs',
    qualification: 'Ph.D (Life Sciences), M.Sc (Biotechnology)',
    specialization: 'Student Health & Night Care Protocols',
    papersPublished: '5 International Journal Publications',

    physicalFitness: 'Fit · Medical Relief & Night Roster Qualified',
    height: '165 cm',
    weight: '58 kg',
    bloodPressure: '115/75 mmHg',
    chronicConditions: 'None',
    vaccinationStatus: 'Fully Vaccinated (Covishield 3 Doses)',
    medicalFitnessCert: 'Certified by Campus Health Centre',

    hostelId: 'hst-4',
    hostelName: 'Sarojini Girls Residence',
    assignedBlocks: ['Wing B Extension (Floor 3)'],
    dutyShift: 'Night Relief Shift',
    shiftTimings: '08:00 PM - 06:00 AM',
    attendanceCompliance: 96.5,
    pendingTasks: 2,
    activeResidentsCount: 68,
    totalBedsSupervised: 75,
    documents: [
      { id: 'doc-1', name: 'Assistant Warden Appointment Letter', meta: 'Issued 15-11-2022' },
      { id: 'doc-2', name: 'Doctorate & M.Sc Degree Certificates', meta: 'Utkal University Verified' },
      { id: 'doc-3', name: 'UIDAI Aadhaar & PAN Card Proof', meta: 'Verified' },
      { id: 'doc-4', name: 'Campus First-Aid & Emergency Response Certificate', meta: 'Red Cross Certified' }
    ]
  },

  'WRD-105': {
    employeeId: 'WRD-105',
    bputRegdNo: 'BPUT-EMP-2023-019',
    name: 'Mr. Debendra Sahoo',
    department: 'Hostel Administration',
    designation: 'Hostel Supervisor (Boys Kalam Block)',
    category: 'Non Teaching',
    mobileNo: '9861099887',
    emailId: 'debendra.sahoo@gift.edu.in',
    status: 'Active',
    avatar: '/candidate_photo_apna.png',

    title: 'Mr.',
    firstName: 'Debendra',
    middleName: '',
    lastName: 'Sahoo',
    nameAlias: 'D. Sahoo',
    joiningDate: '20-01-2023',
    empDob: '14-03-1983',
    gender: 'MALE',
    birthPlace: 'Pipili, Puri',
    totalExperience: '11 Year(s) 6 Month(s)',
    bloodGroup: 'O+',
    maritalStatus: 'MARRIED',
    caste: 'OBC',
    nationality: 'Indian',
    religion: 'Hindu',
    thumb: '462',
    lunch: 'Y',
    transport: 'Y',
    breakfast: 'Y',
    dinner: 'N',

    fatherName: 'Mr. N. C. Sahoo',
    motherName: 'Mrs. P. Sahoo',
    spouseName: 'Mrs. Rasmita Sahoo',
    emergencyContact: 'Mrs. Rasmita Sahoo',
    guardianMobile: '+91 98610 99881',
    relationship: 'Spouse',
    guardianOccupation: 'Homemaker',

    presentAddress1: 'Staff Quarters Block C-205',
    presentAddress2: 'Campus Residential Area',
    presentCity: 'Bhubaneswar',
    presentDistrict: 'Khordha',
    presentState: 'Odisha',
    presentPin: '751024',
    presentPS: 'Chandaka PS',

    permAddress1: 'At/PO - Pipili Main Road',
    permDistrict: 'Puri',
    permState: 'Odisha',
    permPin: '752104',
    permPS: 'Pipili PS',

    attendanceCardId: 'SUP-KALAM-05',
    otherBputRegdNo: 'REG-2023-015',
    aadhaarNo: '456789012345',
    panNo: 'DEFPS3456J',
    voterId: 'OD/18/789/456123',
    drivingLicenseNo: 'OD-0220150078912',
    bankAccountNo: '0456000123456789',
    bankName: 'Punjab National Bank',
    ifscCode: 'PUNB0045600',
    motherNameOther: 'Pramila Sahoo',
    reference: 'Hostel Chief Admin',
    qualification: 'B.Com, PG Diploma in Facilities Management',
    specialization: 'Hostel Mess Operations & Material Requisition',
    papersPublished: '—',

    physicalFitness: 'Fit · Day Shift Facilities Operations',
    height: '168 cm',
    weight: '66 kg',
    bloodPressure: '124/82 mmHg',
    chronicConditions: 'None',
    vaccinationStatus: 'Fully Vaccinated (Covishield 3 Doses)',
    medicalFitnessCert: 'Certified by Campus Medical Officer',

    hostelId: 'hst-1',
    hostelName: 'Bhabani Hostel-1',
    assignedBlocks: ['Ground & 1st Floor'],
    dutyShift: 'Day Shift',
    shiftTimings: '08:00 AM - 04:00 PM',
    attendanceCompliance: 92.1,
    pendingTasks: 5,
    activeResidentsCount: 74,
    totalBedsSupervised: 82,
    documents: [
      { id: 'doc-1', name: 'Hostel Supervisor Appointment Order', meta: 'Issued 20-01-2023' },
      { id: 'doc-2', name: 'Graduation & Diploma Transcripts', meta: 'Verified' },
      { id: 'doc-3', name: 'Aadhaar & PAN Verification Card', meta: 'Digitally Verified' }
    ]
  },

  'WRD-106': {
    employeeId: 'WRD-106',
    bputRegdNo: 'BPUT-EMP-2019-063',
    name: 'Mr. Bipin Sethi',
    department: 'Campus Maintenance & Hostel Operations',
    designation: 'Resident Facilities Caretaker & Relief Warden',
    category: 'Non Teaching',
    mobileNo: '9437855667',
    emailId: 'bipin.sethi@gift.edu.in',
    status: 'Active',
    avatar: '/candidate_photo_apna.png',

    title: 'Mr.',
    firstName: 'Bipin',
    middleName: '',
    lastName: 'Sethi',
    nameAlias: 'B. Sethi',
    joiningDate: '10-04-2019',
    empDob: '02-08-1985',
    gender: 'MALE',
    birthPlace: 'Jatni, Khordha',
    totalExperience: '13 Year(s) 3 Month(s)',
    bloodGroup: 'B+',
    maritalStatus: 'MARRIED',
    caste: 'SC',
    nationality: 'Indian',
    religion: 'Hindu',
    thumb: '478',
    lunch: 'Y',
    transport: 'Y',
    breakfast: 'Y',
    dinner: 'Y',

    fatherName: 'Late M. Sethi',
    motherName: 'Mrs. T. Sethi',
    spouseName: 'Mrs. Sabita Sethi',
    emergencyContact: 'Mr. M. Sethi (Brother)',
    guardianMobile: '+91 94378 55660',
    relationship: 'Brother',
    guardianOccupation: 'Technician',

    presentAddress1: 'Utility Quarters U-12',
    presentAddress2: 'Campus Residential Area',
    presentCity: 'Bhubaneswar',
    presentDistrict: 'Khordha',
    presentState: 'Odisha',
    presentPin: '751024',
    presentPS: 'Chandaka PS',

    permAddress1: 'At/PO - Jatni Bazar, Station Road',
    permDistrict: 'Khordha',
    permState: 'Odisha',
    permPin: '752050',
    permPS: 'Jatni PS',

    attendanceCardId: 'RELIEF-WRD-06',
    otherBputRegdNo: 'REG-2019-052',
    aadhaarNo: '567890123456',
    panNo: 'EFGPS7890M',
    voterId: 'OD/17/345/678901',
    drivingLicenseNo: 'OD-0220130067890',
    bankAccountNo: '1234101005678',
    bankName: 'Canara Bank',
    ifscCode: 'CNRB0001234',
    motherNameOther: 'Taramani Sethi',
    reference: 'Estate Maintenance Officer',
    qualification: 'Diploma in Electrical Engineering, Safety Cert',
    specialization: 'Hostel Utilities, Safety Audits & Curfew Enforcement',
    papersPublished: '—',

    physicalFitness: 'Fit · Heavy Utility & Maintenance Certified',
    height: '172 cm',
    weight: '70 kg',
    bloodPressure: '121/79 mmHg',
    chronicConditions: 'None',
    vaccinationStatus: 'Fully Vaccinated (Covishield 3 Doses)',
    medicalFitnessCert: 'Certified by Campus Medical Officer',

    hostelId: 'ALL',
    hostelName: 'Central Hostel Complex (Relief Coverage)',
    assignedBlocks: ['Utility Core & Central Mess'],
    dutyShift: 'General Maintenance & Relief',
    shiftTimings: '09:00 AM - 06:00 PM (Rotational Curfew)',
    attendanceCompliance: 97.8,
    pendingTasks: 2,
    activeResidentsCount: 310,
    totalBedsSupervised: 350,
    documents: [
      { id: 'doc-1', name: 'Facilities Caretaker & Relief Appointment Dossier', meta: 'Issued 10-04-2019' },
      { id: 'doc-2', name: 'Engineering Diploma & Electrical Safety License', meta: 'Verified Board of Tech Education' },
      { id: 'doc-3', name: 'Aadhaar & PAN Identity Verification Record', meta: 'Verified' },
      { id: 'doc-4', name: 'Campus Safety & Fire Audit Certificate', meta: 'ODRAF Certified 2024' }
    ]
  }
};

// Aliases for matching IDs like '140', 'rajesh', etc.
INITIAL_WARDEN_PROFILES['140'] = INITIAL_WARDEN_PROFILES['WRD-103'];
INITIAL_WARDEN_PROFILES['wrd-101'] = INITIAL_WARDEN_PROFILES['WRD-101'];
INITIAL_WARDEN_PROFILES['wrd-102'] = INITIAL_WARDEN_PROFILES['WRD-102'];
INITIAL_WARDEN_PROFILES['wrd-103'] = INITIAL_WARDEN_PROFILES['WRD-103'];
INITIAL_WARDEN_PROFILES['wrd-104'] = INITIAL_WARDEN_PROFILES['WRD-104'];
INITIAL_WARDEN_PROFILES['wrd-105'] = INITIAL_WARDEN_PROFILES['WRD-105'];
INITIAL_WARDEN_PROFILES['wrd-106'] = INITIAL_WARDEN_PROFILES['WRD-106'];

// In-memory runtime cache for edits
const wardenCache: Map<string, WardenCmsProfile> = new Map();

export function getWardenCmsProfile(idOrKey: string): WardenCmsProfile | null {
  const clean = (idOrKey || '').trim().toUpperCase();
  if (wardenCache.has(clean)) {
    return wardenCache.get(clean)!;
  }
  const match =
    INITIAL_WARDEN_PROFILES[clean] ||
    INITIAL_WARDEN_PROFILES[clean.toLowerCase()] ||
    Object.values(INITIAL_WARDEN_PROFILES).find(
      (w) =>
        w.employeeId.toUpperCase() === clean ||
        w.name.toUpperCase().includes(clean) ||
        w.emailId.toUpperCase() === clean
    );
  if (match) {
    const copy = JSON.parse(JSON.stringify(match));
    wardenCache.set(clean, copy);
    wardenCache.set(copy.employeeId.toUpperCase(), copy);
    return copy;
  }
  return null;
}

export function saveWardenCmsProfile(id: string, updates: Partial<WardenCmsProfile>): WardenCmsProfile {
  const existing = getWardenCmsProfile(id) || INITIAL_WARDEN_PROFILES['WRD-101'];
  const hostel =
    updates.hostelName ||
    (updates as any)?.assignedHostelOrPost ||
    existing?.hostelName ||
    (existing as any)?.assignedHostelOrPost;
  const merged = {
    ...existing,
    ...updates,
    ...(hostel ? { hostelName: hostel, assignedHostelOrPost: hostel } : {})
  };
  wardenCache.set(id.trim().toUpperCase(), merged);
  wardenCache.set(merged.employeeId.toUpperCase(), merged);
  return merged;
}

export function appendWardenDocument(id: string, doc: {
  id?: string;
  name: string;
  meta?: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
}) {
  const profile = getWardenCmsProfile(id);
  if (!profile) return null;
  const newDoc = {
    id: doc.id || `doc-${Date.now()}`,
    name: doc.name,
    meta: doc.meta || `Uploaded on ${new Date().toLocaleDateString('en-GB')} by Administrator`,
    fileData: doc.fileData || undefined,
    fileName: doc.fileName || undefined,
    fileType: doc.fileType || undefined,
    fileSize: doc.fileSize || undefined,
    uploadedAt: doc.uploadedAt || new Date().toISOString(),
  };
  profile.documents = [newDoc, ...(profile.documents || [])];
  wardenCache.set(profile.employeeId.toUpperCase(), profile);
  return profile;
}

export function deleteWardenCmsProfile(id: string): boolean {
  const profile = getWardenCmsProfile(id);
  if (!profile) return false;
  wardenCache.delete(id.toUpperCase());
  if (profile.employeeId) wardenCache.delete(profile.employeeId.toUpperCase());
  if (profile.name) wardenCache.delete(profile.name.toUpperCase());
  delete (INITIAL_WARDEN_PROFILES as any)[profile.employeeId];
  return true;
}

export function removeWardenDocument(id: string, docId: string) {
  const profile = getWardenCmsProfile(id);
  if (!profile) return null;
  profile.documents = (profile.documents || []).filter(d => d.id !== docId);
  wardenCache.set(profile.employeeId.toUpperCase(), profile);
  return profile;
}

export function isWardenSuspendedBackend(identifierOrUser: any): boolean {
  if (!identifierOrUser) return false;
  if (typeof identifierOrUser === 'object') {
    if (identifierOrUser.status === 'Suspended' || identifierOrUser.accountStatus === 'Suspended') return true;
    const id = identifierOrUser.identity || identifierOrUser.badgeNumber || identifierOrUser.id;
    if (id && isWardenSuspendedBackend(id)) return true;
    if (identifierOrUser.name && isWardenSuspendedBackend(identifierOrUser.name)) return true;
    return false;
  }
  const key = String(identifierOrUser).trim().toUpperCase();
  const profile = getWardenCmsProfile(key);
  if (profile) {
    return profile.status === 'Suspended';
  }
  return false;
}

export function setWardenStatusBackend(id: string, status: string, dutyStatus?: string): WardenCmsProfile | null {
  const profile = getWardenCmsProfile(id);
  if (!profile) return null;
  const updates: Partial<WardenCmsProfile> = { status };
  if (dutyStatus) updates.dutyStatus = dutyStatus;
  return saveWardenCmsProfile(id, updates);
}

export function setWardenDutyStatusBackend(
  id: string,
  dutyStatus: string,
  relievingWarden?: string
): WardenCmsProfile | null {
  const profile = getWardenCmsProfile(id);
  if (!profile) return null;
  const updates: any = { dutyStatus };
  if (relievingWarden !== undefined) {
    updates.relievingWarden = relievingWarden;
  }
  return saveWardenCmsProfile(id, updates);
}

export function getAllWardenCmsProfiles(): WardenCmsProfile[] {
  const map = new Map<string, WardenCmsProfile>();
  Object.values(INITIAL_WARDEN_PROFILES).forEach((p) => {
    map.set(p.employeeId.toUpperCase(), p);
  });
  wardenCache.forEach((p) => {
    if (p && p.employeeId) {
      map.set(p.employeeId.toUpperCase(), p);
    }
  });
  return Array.from(map.values());
}

export function createWardenCmsProfile(data: Partial<WardenCmsProfile>): WardenCmsProfile {
  const all = getAllWardenCmsProfiles();
  const ids = all
    .map((w) => parseInt(w.employeeId.replace('WRD-', ''), 10))
    .filter((n) => !isNaN(n));
  const maxId = ids.length > 0 ? Math.max(...ids) : 106;
  const id = data.employeeId || `WRD-${maxId + 1}`;
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  const profile: WardenCmsProfile = {
    employeeId: id,
    bputRegdNo: data.bputRegdNo || `BPUT-EMP-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    name: data.name || `${data.title || 'Mr.'} ${data.firstName || ''} ${data.lastName || ''}`.trim(),
    department: data.department || 'Hostel Administration & Student Housing',
    designation: data.designation || 'Resident Warden',
    category: data.category || 'Non Teaching',
    mobileNo: data.mobileNo || '',
    emailId: data.emailId || '',
    status: data.status || 'Active',
    avatar: data.avatar || '/candidate_photo_apna.png',

    title: data.title || 'Mr.',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    middleName: data.middleName || '',
    nameAlias: data.nameAlias || '',
    joiningDate: data.joiningDate || dateFormatted,
    empDob: data.empDob || '01-01-1985',
    gender: data.gender || 'MALE',
    birthPlace: data.birthPlace || 'Bhubaneswar, Odisha',
    totalExperience: data.totalExperience || '5 Year(s)',
    bloodGroup: data.bloodGroup || 'B+',
    maritalStatus: data.maritalStatus || 'MARRIED',
    caste: data.caste || 'General',
    nationality: data.nationality || 'Indian',
    religion: data.religion || 'Hindu',
    thumb: data.thumb || String(Math.floor(300 + Math.random() * 200)),
    lunch: data.lunch || 'Y',
    transport: data.transport || 'Y',
    breakfast: data.breakfast || 'Y',
    dinner: data.dinner || 'Y',

    fatherName: data.fatherName || '',
    motherName: data.motherName || '',
    spouseName: data.spouseName || '',
    emergencyContact: data.emergencyContact || '',
    guardianMobile: data.guardianMobile || '',
    relationship: data.relationship || 'Spouse',
    guardianOccupation: data.guardianOccupation || '',

    presentAddress1: data.presentAddress1 || 'Staff Quarters Block, Campus Residential Complex',
    presentAddress2: data.presentAddress2 || 'Campus Residential Complex',
    presentCity: data.presentCity || 'Bhubaneswar',
    presentDistrict: data.presentDistrict || 'Khordha',
    presentState: data.presentState || 'Odisha',
    presentPin: data.presentPin || '751024',
    presentPS: data.presentPS || 'Chandaka PS',

    permAddress1: data.permAddress1 || data.presentAddress1 || '',
    permDistrict: data.permDistrict || 'Khordha',
    permState: data.permState || 'Odisha',
    permPin: data.permPin || '751024',
    permPS: data.permPS || 'Chandaka PS',

    attendanceCardId: data.attendanceCardId || `CRW-${id}`,
    otherBputRegdNo: data.otherBputRegdNo || `REG-${now.getFullYear()}-${id}`,
    aadhaarNo: data.aadhaarNo || '',
    panNo: data.panNo || '',
    voterId: data.voterId || '',
    drivingLicenseNo: data.drivingLicenseNo || '',
    bankAccountNo: data.bankAccountNo || '',
    bankName: data.bankName || 'SBI',
    ifscCode: data.ifscCode || 'SBIN0004375',
    motherNameOther: data.motherNameOther || '',
    reference: data.reference || 'Principal Office GIFT Autonomous',
    qualification: data.qualification || 'M.Tech / B.Tech',
    specialization: data.specialization || 'Hostel Administration & Student Welfare',
    papersPublished: data.papersPublished || 'None',

    physicalFitness: data.physicalFitness || 'Excellent · Fit for 24x7 Resident Duty',
    height: data.height || '172 cm',
    weight: data.weight || '70 kg',
    bloodPressure: data.bloodPressure || '120/80 mmHg',
    chronicConditions: data.chronicConditions || 'None',
    vaccinationStatus: data.vaccinationStatus || 'Fully Vaccinated',
    medicalFitnessCert: data.medicalFitnessCert || 'Certified by Campus Medical Officer',

    hostelId: data.hostelId || 'hst-1',
    hostelName: data.hostelName || 'Gandhi Boys Residence',
    assignedBlocks: Array.isArray(data.assignedBlocks) ? data.assignedBlocks : [data.assignedBlocks || 'All Blocks'],
    dutyShift: data.dutyShift || 'General / 24x7 Resident',
    shiftTimings: data.shiftTimings || '06:00 AM - 10:00 PM',
    attendanceCompliance: typeof data.attendanceCompliance === 'number' ? data.attendanceCompliance : 100.0,
    pendingTasks: 0,
    activeResidentsCount: data.activeResidentsCount || 0,
    totalBedsSupervised: data.totalBedsSupervised || 150,
    documents: [
      { id: `doc-${Date.now()}-1`, name: 'Official Appointment Order (Warden)', meta: `Issued ${dateFormatted} · Campus Administration` },
      { id: `doc-${Date.now()}-2`, name: 'Educational & Technical Degree Certificates', meta: 'Verified' },
      { id: `doc-${Date.now()}-3`, name: 'Aadhaar Card & Government Identity Card', meta: 'UIDAI Verified' }
    ]
  };

  wardenCache.set(id.toUpperCase(), profile);
  wardenCache.set(profile.employeeId.toUpperCase(), profile);
  if (profile.name) {
    wardenCache.set(profile.name.toUpperCase(), profile);
  }
  return profile;
}

