// Comprehensive Academic CMS Dossier Profiles for Faculty, HOD, Principal, and Academic Roles

export const DEFAULT_FACULTY_PROFILE = {
  // Left Summary
  employeeId: 'FAC-042',
  bputRegdNo: 'BPUT-FAC-2019-042',
  name: 'Dr. S. Mohanty',
  department: 'Computer Science & Engineering',
  designation: 'Assistant Professor',
  category: 'Teaching',
  mobileNo: '9437011223',
  emailId: 's.mohanty@apnacampus.edu.in',
  status: 'Active',
  avatar: '/passport_photo_male.svg',
  activeRolePerspective: 'Faculty Member / Assistant Professor',
  roleTitle: 'Faculty Official CMS Profile',

  // 1. Personal Tab Details
  title: 'Dr.',
  firstName: 'S.',
  lastName: 'Mohanty',
  middleName: '',
  nameAlias: 'Dr. S. Mohanty',
  joiningDate: '10-07-2019',
  empDob: '18-05-1985',
  gender: 'MALE',
  birthPlace: 'Bhubaneswar, Khordha',
  totalExperience: '12 Year(s) 6 Month(s)',
  bloodGroup: 'B+',
  maritalStatus: 'MARRIED',
  caste: 'General',
  nationality: 'Indian',
  religion: 'Hindu',
  thumb: '108',
  lunch: 'Y',
  transport: 'Y',
  breakfast: 'Y',
  dinner: 'N',

  // 2. Guardians Tab
  fatherName: 'Prof. R. N. Mohanty',
  motherName: 'Mrs. Minati Mohanty',
  spouseName: 'Dr. Smita Mohanty',
  emergencyContact: 'Dr. Smita Mohanty',
  guardianMobile: '+91 94370 11225',
  relationship: 'Spouse',
  guardianOccupation: 'Associate Professor & Researcher',

  // 3. Address Tab
  presentAddress1: 'Flat 402, Faculty Enclave Block B',
  presentAddress2: 'Campus Residential Complex',
  presentCity: 'Bhubaneswar',
  presentDistrict: 'Khordha',
  presentState: 'Odisha',
  presentPin: '751024',
  presentPS: 'Chandaka PS',

  permAddress1: 'Plot 112, Saheed Nagar',
  permDistrict: 'Khordha',
  permState: 'Odisha',
  permPin: '751007',
  permPS: 'Saheed Nagar PS',

  // 4. Other Info Tab
  attendanceCardId: 'FAC-CSE-042',
  otherBputRegdNo: 'BPUT-REG-2019-042',
  aadhaarNo: '542198763210',
  panNo: 'AKLPM8872D',
  voterId: 'OD/04/112/987654',
  drivingLicenseNo: 'OD-0220140087654',
  bankAccountNo: '38920145672',
  bankName: 'State Bank of India',
  ifscCode: 'SBIN0004375',
  motherNameOther: 'Minati Mohanty',
  reference: 'Dean Academic & HOD CSE GIFT Autonomous',
  qualification: 'Ph.D. (Computer Science & Engineering), M.Tech (CSE), B.Tech (IT)',
  specialization: 'Artificial Intelligence, Machine Learning, Data Structures & Algorithms',
  papersPublished: '18 Scopus / IEEE Indexed International Publications',
  booksWritten: '2 Books ("Advanced Algorithms in Practice", "Foundations of AI")',
  rdProjectUndertaken: 'AICTE Research Promotion Scheme (Principal Investigator, ₹14.5 Lakhs)',
  membershipProfessionalSociety: 'Senior Member IEEE, Life Member CSI, Member ACM',
  workshopsAttended: '16 National Level FDPs & High-Performance Computing Workshops',
  nationalConferencesAttended: '8 National Academic Conferences',
  internationalConferencesAttended: '6 IEEE International Conferences',
  languages: 'English, Odia, Hindi',
  hobbies: 'Coding, Technical Writing, Chess, Campus Badminton',

  // 5. Health Tab
  physicalFitness: 'Excellent · Medically Certified Fit for Full-Time Academic Teaching & Research',
  height: '173 cm',
  weight: '70 kg',
  bloodPressure: '120/80 mmHg',
  chronicConditions: 'None',
  vaccinationStatus: 'Fully Vaccinated (3 Doses)',
  medicalFitnessCert: 'Certified by Campus Medical Officer (Dr. S. K. Rath)',
  insuranceScheme: 'Faculty Group Health Insurance Scheme',
  policyNumber: 'GIFT-FAC-HLTH-2026-042',
  emergencyHospital: 'Campus Health Center & Apollo Hospitals',

  // Documents
  documents: [
    { id: 'doc-fac-1', name: 'Faculty Appointment Order & Autonomous Ratification', meta: 'Issued 10-07-2019 · Autonomous Secretariat' },
    { id: 'doc-fac-2', name: 'Doctoral Degree (Ph.D.) in Computer Science & Engineering', meta: 'Verified Primary Transcripts · BPUT Board' },
    { id: 'doc-fac-3', name: 'M.Tech Transcripts & B.Tech Degree Certificates', meta: 'Autonomous Academic Council Verified' },
    { id: 'doc-fac-4', name: 'Identity Proof (Aadhaar & PAN Digital Verification)', meta: 'UIDAI & NSDL Digitally Verified' },
    { id: 'doc-fac-5', name: 'Annual Academic Performance Index (API) & Appraisal Dossier', meta: 'Score 94.6/100 · Evaluated Oct 2026' }
  ]
};

export const DEFAULT_HOD_PROFILE = {
  // Left Summary
  employeeId: 'HOD-CSE-001',
  bputRegdNo: 'BPUT-HOD-2014-001',
  name: 'Dr. P. K. Pattnaik',
  department: 'Computer Science & Engineering',
  designation: 'Professor & Head of Department',
  category: 'Teaching (Department Head)',
  mobileNo: '+91 94370 55102',
  emailId: 'hod.cse@apnacampus.edu.in',
  status: 'Active',
  avatar: '/passport_photo_male.svg',
  activeRolePerspective: 'Department Head (HOD)',
  roleTitle: 'HOD Official CMS Profile',

  // 1. Personal Tab Details
  title: 'Dr.',
  firstName: 'Prasant',
  lastName: 'Pattnaik',
  middleName: 'Kumar',
  nameAlias: 'Dr. P. K. Pattnaik',
  joiningDate: '12-06-2014',
  empDob: '15-08-1974',
  gender: 'MALE',
  birthPlace: 'Cuttack, Odisha',
  totalExperience: '22 Year(s) 8 Month(s)',
  bloodGroup: 'O+',
  maritalStatus: 'MARRIED',
  caste: 'General',
  nationality: 'Indian',
  religion: 'Hindu',
  thumb: '204',
  lunch: 'Y',
  transport: 'Y',
  breakfast: 'Y',
  dinner: 'N',

  // 2. Guardians Tab
  fatherName: 'Late Dr. B. Pattnaik',
  motherName: 'Mrs. S. Pattnaik',
  spouseName: 'Dr. Ranjita Pattnaik',
  emergencyContact: 'Dr. Ranjita Pattnaik',
  guardianMobile: '+91 94370 55103',
  relationship: 'Spouse',
  guardianOccupation: 'Professor & Department Dean',

  // 3. Address Tab
  presentAddress1: 'Executive Bungalow EB-02, Senior Faculty Enclave',
  presentAddress2: 'Campus Residential Complex',
  presentCity: 'Bhubaneswar',
  presentDistrict: 'Khordha',
  presentState: 'Odisha',
  presentPin: '751024',
  presentPS: 'Chandaka PS',

  permAddress1: 'Plot 45, Tulsipur',
  permDistrict: 'Cuttack',
  permState: 'Odisha',
  permPin: '753008',
  permPS: 'Bidanasi PS',

  // 4. Other Info Tab
  attendanceCardId: 'HOD-CSE-01',
  otherBputRegdNo: 'BPUT-REG-2014-001',
  aadhaarNo: '621984537102',
  panNo: 'BKNPP4321A',
  voterId: 'OD/01/204/876543',
  drivingLicenseNo: 'OD-0120100098765',
  bankAccountNo: '40987123654',
  bankName: 'State Bank of India',
  ifscCode: 'SBIN0004375',
  motherNameOther: 'Sarojini Pattnaik',
  reference: 'Principal & Director Office GIFT Autonomous',
  qualification: 'Ph.D. (Computer Science & Engg), M.Tech (CSE), B.E. (Computer Science)',
  specialization: 'Distributed Systems, Cloud Architecture, Big Data Analytics, Academic Governance',
  papersPublished: '42 International Refereed Journal Publications (IEEE, Elsevier, Springer)',
  booksWritten: '4 Textbooks on Distributed Systems and Cloud Computing Architecture',
  rdProjectUndertaken: 'DST-SERB Core Research Grant (Principal Investigator, ₹38.2 Lakhs)',
  membershipProfessionalSociety: 'Fellow IETE, Senior Member IEEE, Life Member CSI, Member BPUT Academic Council',
  workshopsAttended: '28 International Workshops, Keynote Addresses & Academic Summits',
  nationalConferencesAttended: '15 National Conferences',
  internationalConferencesAttended: '12 IEEE International Conferences',
  languages: 'English, Odia, Hindi, Bengali',
  hobbies: 'Academic Research, Reading Biographies, Gardening',

  // 5. Health Tab
  physicalFitness: 'Excellent · Medically Certified Fit for Department Leadership & Teaching',
  height: '175 cm',
  weight: '74 kg',
  bloodPressure: '124/82 mmHg',
  chronicConditions: 'None',
  vaccinationStatus: 'Fully Vaccinated (3 Doses)',
  medicalFitnessCert: 'Certified by Campus Medical Officer (Dr. S. K. Rath)',
  insuranceScheme: 'Senior Academic Leadership Medical Health Plan',
  policyNumber: 'GIFT-HOD-HLTH-2026-001',
  emergencyHospital: 'Campus Health Center & Kalinga Hospital',

  // Documents
  documents: [
    { id: 'doc-hod-1', name: 'Head of Department Appointment & Executive Order', meta: 'Issued 12-06-2014 · Board of Governors' },
    { id: 'doc-hod-2', name: 'Doctoral Degree (Ph.D.) & Post-Graduate Degree Dossier', meta: 'Autonomous Secretariat Verified' },
    { id: 'doc-hod-3', name: 'Identity Verification (Aadhaar & PAN Digital Records)', meta: 'UIDAI & NSDL Digitally Authenticated' },
    { id: 'doc-hod-4', name: 'DST-SERB Research Project Sanction Dossier', meta: 'Government of India Sanction Letter' },
    { id: 'doc-hod-5', name: 'Institutional Governance & Academic Council Accreditation Record', meta: 'NAAC Tier-1 Compliance' }
  ]
};

export const DEFAULT_PRINCIPAL_PROFILE = {
  // Left Summary
  employeeId: 'OFF-PRIN-01',
  bputRegdNo: 'BPUT-DIR-2010-001',
  name: 'Dr. B. K. Sarap',
  department: 'Office of the Principal',
  designation: 'Principal & Autonomous Campus Director',
  category: 'Institutional Academic Leadership',
  mobileNo: '+91 94370 00000',
  emailId: 'principal@apnacampus.edu.in',
  status: 'Active',
  avatar: '/principal_avatar.jpg',
  activeRolePerspective: 'Principal & Campus Director',
  roleTitle: 'Principal Official CMS Profile',

  // 1. Personal Tab Details
  title: 'Dr.',
  firstName: 'B.',
  lastName: 'Sarap',
  middleName: 'K.',
  nameAlias: 'Dr. B. K. Sarap',
  joiningDate: '01-08-2010',
  empDob: '05-04-1968',
  gender: 'MALE',
  birthPlace: 'Sambalpur, Odisha',
  totalExperience: '28 Year(s) 0 Month(s)',
  bloodGroup: 'A+',
  maritalStatus: 'MARRIED',
  caste: 'General',
  nationality: 'Indian',
  religion: 'Hindu',
  thumb: '001',
  lunch: 'Y',
  transport: 'Y',
  breakfast: 'Y',
  dinner: 'Y',

  // 2. Guardians Tab
  fatherName: 'Late Dr. G. Sarap',
  motherName: 'Mrs. P. Sarap',
  spouseName: 'Prof. Anita Sarap',
  emergencyContact: 'Prof. Anita Sarap',
  guardianMobile: '+91 94370 00001',
  relationship: 'Spouse',
  guardianOccupation: 'Professor & Dean of Academic Planning',

  // 3. Address Tab
  presentAddress1: 'Director Residence, Campus Green Enclave',
  presentAddress2: 'Autonomous Campus Headquarters',
  presentCity: 'Bhubaneswar',
  presentDistrict: 'Khordha',
  presentState: 'Odisha',
  presentPin: '751024',
  presentPS: 'Chandaka PS',

  permAddress1: 'Sarap Niwas, Danipali',
  permDistrict: 'Sambalpur',
  permState: 'Odisha',
  permPin: '768004',
  permPS: 'Dhanupali PS',

  // 4. Other Info Tab
  attendanceCardId: 'DIR-PRIN-01',
  otherBputRegdNo: 'BPUT-REG-2010-001',
  aadhaarNo: '782190345612',
  panNo: 'AAAP09871B',
  voterId: 'OD/03/001/567890',
  drivingLicenseNo: 'OD-0320050012345',
  bankAccountNo: '51098432109',
  bankName: 'State Bank of India',
  ifscCode: 'SBIN0004375',
  motherNameOther: 'Pratima Sarap',
  reference: 'Governing Body & Chairman GIFT Autonomous',
  qualification: 'Ph.D. (Fluid Dynamics, IIT Kharagpur), M.Tech (Mechanical Engg), B.Sc. (Engineering)',
  specialization: 'Fluid Dynamics, Higher Education Governance, Autonomous Institutional Management',
  papersPublished: '64 International Refereed Journals (ASME, Springer, Elsevier)',
  booksWritten: '5 Higher Education Handbooks & Technical Monographs',
  rdProjectUndertaken: 'AICTE-MODROBS & World Bank TEQIP Institutional Project Lead',
  membershipProfessionalSociety: 'Fellow Institution of Engineers (FIE), Life Member ISTE, Member AICTE Advisory',
  workshopsAttended: '45 National & International Higher Education Leadership Summits',
  nationalConferencesAttended: '22 National Keynotes',
  internationalConferencesAttended: '18 International Conferences',
  languages: 'English, Odia, Hindi, Sambalpuri',
  hobbies: 'Campus Mentorship, Classical Literature, Photography',

  // 5. Health Tab
  physicalFitness: 'Excellent · Medically Certified Fit for Autonomous Institutional Direction',
  height: '176 cm',
  weight: '76 kg',
  bloodPressure: '126/82 mmHg',
  chronicConditions: 'None',
  vaccinationStatus: 'Fully Vaccinated (3 Doses)',
  medicalFitnessCert: 'Certified by Campus Medical Officer (Dr. S. K. Rath)',
  insuranceScheme: 'Institutional Executive Health Cover',
  policyNumber: 'GIFT-EXEC-HLTH-2026-001',
  emergencyHospital: 'Campus Health Center & Kalinga Hospital',

  // Documents
  documents: [
    { id: 'doc-prin-1', name: 'Governing Body Principal Appointment Dossier & Ratification', meta: 'Issued 01-08-2010 · Board of Governors' },
    { id: 'doc-prin-2', name: 'Ph.D. Degree Transcripts (IIT Kharagpur)', meta: 'Autonomous Secretariat Verified' },
    { id: 'doc-prin-3', name: 'Autonomous Institute Statutory Approval & AICTE Recognition', meta: 'AICTE / BPUT Gazette Record' },
    { id: 'doc-prin-4', name: 'NAAC A++ Institutional Leadership Accreditation Record', meta: 'National Assessment & Accreditation Council' },
    { id: 'doc-prin-5', name: 'Executive Health & Medical Fitness Dossier', meta: 'Certified Annual Review 2026' }
  ]
};

/**
 * Resolves an official academic profile according to the logged-in user's account and role
 */
export function resolveAcademicProfile(account = {}, role = '') {
  const effectiveRole = (role || account.role || '').toLowerCase();
  const rawId = account.identity || account.employeeId || account.registrationNumber || '';

  let base = DEFAULT_FACULTY_PROFILE;

  if (effectiveRole === 'hod' || rawId.toLowerCase().includes('hod')) {
    base = DEFAULT_HOD_PROFILE;
  } else if (effectiveRole === 'principal' || rawId.toLowerCase().includes('prin')) {
    base = DEFAULT_PRINCIPAL_PROFILE;
  } else if (effectiveRole === 'faculty' || rawId.toLowerCase().includes('fac')) {
    base = DEFAULT_FACULTY_PROFILE;
  }

  // Clone base so we do not mutate templates
  const resolved = JSON.parse(JSON.stringify(base));

  // Dynamically overlay account details if provided
  if (account.name) {
    resolved.name = account.name;
    const parts = account.name.trim().split(/\s+/);
    if (parts.length > 0) {
      if (parts[0].includes('Dr.') || parts[0].includes('Prof.') || parts[0].includes('Mr.') || parts[0].includes('Mrs.')) {
        resolved.title = parts[0];
        resolved.firstName = parts[1] || '';
        resolved.lastName = parts.slice(2).join(' ') || '';
      } else {
        resolved.firstName = parts[0];
        resolved.lastName = parts.slice(1).join(' ') || '';
      }
    }
  }

  if (account.identity || account.employeeId) {
    resolved.employeeId = account.identity || account.employeeId;
  }
  if (account.department) {
    resolved.department = account.department;
  }
  if (account.designation) {
    resolved.designation = account.designation;
  }
  if (account.email) {
    resolved.emailId = account.email;
  }
  if (account.phone || account.mobile) {
    resolved.mobileNo = account.phone || account.mobile;
  }
  if (account.avatar) {
    resolved.avatar = account.avatar;
  }

  // Role perspective customizations
  if (effectiveRole === 'hod') {
    resolved.activeRolePerspective = 'Department Head (HOD)';
    resolved.roleTitle = `HOD Official CMS Profile: ${resolved.name}`;
    resolved.category = 'Teaching (Department Head)';
  } else if (effectiveRole === 'principal') {
    resolved.activeRolePerspective = 'Principal & Campus Director';
    resolved.roleTitle = `Principal Official CMS Profile: ${resolved.name}`;
    resolved.category = 'Institutional Academic Leadership';
  } else if (effectiveRole === 'faculty') {
    resolved.activeRolePerspective = 'Faculty Member / Assistant Professor';
    resolved.roleTitle = `Faculty Official CMS Profile: ${resolved.name}`;
    resolved.category = 'Teaching';
  }

  return resolved;
}

