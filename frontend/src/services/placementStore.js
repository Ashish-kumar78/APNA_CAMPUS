// Training & Placement Cell Centralized Reactive Store & Service Layer
// Enables real-time synchronization between the Placement Cell management portal
// and the existing Student Dashboard (Self Development & Placement and Internship sections).

const PLACEMENT_STORAGE_KEY = 'apna_campus_placement_store_v1';

export const INITIAL_PLACEMENT_DRIVES = [
  {
    id: 'DRIVE-2026-01',
    company: 'Cisco Systems India',
    companyLogo: 'CS',
    companyColor: '#1a5276',
    companyWebsite: 'https://www.cisco.com',
    industry: 'Product Engineering, Cloud & Networking',
    recruiterContact: 'Mr. Vikram Adve (Director University Talent) · hr@cisco.com · +91 80 4429 8800',
    companyDescription: 'Global technology leader that securely connects everything to make anything possible across enterprise networks and cyber systems.',
    role: 'Associate Network & Software Engineer',
    jobDescription: 'Architect distributed cloud routing protocols, perform packet stream optimizations, and develop automated telemetry systems in C/C++ and Python.',
    jobLocation: 'Bangalore / Bhubaneswar (Hybrid)',
    employmentType: 'Full-time Regular',
    workMode: 'Hybrid',
    vacancies: 28,
    requiredSkills: ['Python', 'Networking (TCP/IP)', 'Data Structures', 'Linux', 'Socket Programming'],
    packageOffered: '₹18.5 LPA',
    packageLPA: 18.5,
    bond: 'No Service Bond',
    eligibilityCriteria: {
      degree: 'B.Tech / MCA',
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'ECE'],
      passingYear: '2027',
      min10thPercent: 75,
      min12thPercent: 75,
      otherCriteria: 'Consistent academic record with 75% aggregate in 10th and 12th.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-01',
      applicationDeadline: '2026-10-25',
      prePlacementTalkDate: '2026-10-26 (10:00 AM, Auditorium)',
      aptitudeTestDate: '2026-10-27 (02:00 PM, Online Lab)',
      technicalInterviewSchedule: '2026-10-28 (09:00 AM, Virtual)',
      hrInterviewSchedule: '2026-10-29 (11:00 AM, Executive Boardroom)',
      finalSelectionDate: '2026-10-30',
    },
    status: 'Published', // 'Draft' | 'Published' | 'Closed' | 'Archived'
    registeredCount: 84,
    shortlistedCount: 32,
    selectedCount: 6,
    venue: 'Campus Auditorium & Virtual Assessment Lab',
    attachments: [
      { name: 'Cisco_Campus_Job_Profile_2026.pdf', size: '1.4 MB' },
    ],
  },
  {
    id: 'DRIVE-2026-02',
    company: 'Tata Consultancy Services (TCS Digital & Ninja)',
    companyLogo: 'TCS',
    companyColor: '#1a5276',
    companyWebsite: 'https://www.tcs.com',
    industry: 'Tier-1 IT & Global Consulting Services',
    recruiterContact: 'Ms. Ananya Sengupta (Lead Campus Talent) · campus.hiring@tcs.com · +91 22 6778 9999',
    companyDescription: 'India’s premier IT services, consulting, and business solutions organization offering transformative digital solutions.',
    role: 'Digital Systems Engineer & Innovator',
    jobDescription: 'Develop next-generation enterprise applications utilizing cloud-native microservices, AI analytics, and enterprise data models.',
    jobLocation: 'Bhubaneswar / Pan-India',
    employmentType: 'Full-time Regular',
    workMode: 'On-site',
    vacancies: 90,
    requiredSkills: ['Java / Python', 'SQL', 'Data Structures', 'Cloud Fundamentals', 'Problem Solving'],
    packageOffered: '₹7.2 LPA (Digital) / ₹3.6 LPA (Ninja)',
    packageLPA: 7.2,
    bond: '1 Year Service Commitment',
    eligibilityCriteria: {
      degree: 'B.Tech / MCA',
      minCgpa: 6.5,
      maxBacklogs: 1,
      allowedBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
      passingYear: '2027',
      min10thPercent: 60,
      min12thPercent: 60,
      otherCriteria: 'TCS NQT National Qualifier Test score mandatory.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-09-20',
      applicationDeadline: '2026-10-20',
      prePlacementTalkDate: '2026-10-10 (11:00 AM, Virtual)',
      aptitudeTestDate: '2026-10-15 (TCS iON Center)',
      technicalInterviewSchedule: '2026-10-22 (09:30 AM)',
      hrInterviewSchedule: '2026-10-24 (02:00 PM)',
      finalSelectionDate: '2026-10-28',
    },
    status: 'Published',
    registeredCount: 310,
    shortlistedCount: 180,
    selectedCount: 42,
    venue: 'TCS iON Center & Campus Hall A',
    attachments: [
      { name: 'TCS_Campus_Cadre_Policy_2026.pdf', size: '890 KB' },
    ],
  },
  {
    id: 'DRIVE-2026-03',
    company: 'Cognizant Technology Solutions',
    companyLogo: 'CT',
    companyColor: '#005eb8',
    companyWebsite: 'https://www.cognizant.com',
    industry: 'Global Digital Engineering & Cloud Services',
    recruiterContact: 'Mr. Arvind Krishnan · university.relations@cognizant.com · +91 44 4209 6000',
    companyDescription: 'Cognizant engineers modern businesses, modernizing technology, reimagining processes, and transforming experiences.',
    role: 'Programmer Analyst Trainee (GenC Next)',
    jobDescription: 'Full stack development, cloud engineering, agile deployment, and customer technology modernization initiatives.',
    jobLocation: 'Kolkata / Hyderabad / Pune',
    employmentType: 'Full-time Regular',
    workMode: 'Hybrid',
    vacancies: 60,
    requiredSkills: ['React', 'Node.js', 'Java', 'Data Structures', 'Git'],
    packageOffered: '₹6.75 LPA',
    packageLPA: 6.75,
    bond: 'No Bond',
    eligibilityCriteria: {
      degree: 'B.Tech / MCA',
      minCgpa: 7.0,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'ECE', 'EEE'],
      passingYear: '2027',
      min10thPercent: 65,
      min12thPercent: 65,
      otherCriteria: 'No active academic backlogs at the time of joining.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-05',
      applicationDeadline: '2026-11-02',
      prePlacementTalkDate: '2026-11-03 (10:00 AM)',
      aptitudeTestDate: '2026-11-05 (Automated Virtual Lab)',
      technicalInterviewSchedule: '2026-11-08 (10:00 AM)',
      hrInterviewSchedule: '2026-11-10 (02:00 PM)',
      finalSelectionDate: '2026-11-14',
    },
    status: 'Published',
    registeredCount: 220,
    shortlistedCount: 110,
    selectedCount: 28,
    venue: 'Campus Computing Center Lab 1-4',
    attachments: [
      { name: 'Cognizant_GenC_Next_Notice.pdf', size: '1.1 MB' },
    ],
  },
  {
    id: 'DRIVE-2026-04',
    company: 'Infosys Limited',
    companyLogo: 'IF',
    companyColor: '#007DC6',
    companyWebsite: 'https://www.infosys.com',
    industry: 'Digital Services & Consulting',
    recruiterContact: 'Ms. Rohini Sen · campus_connect@infosys.com · +91 80 2852 0261',
    companyDescription: 'Global leader in next-generation digital services and consulting navigating enterprise transformations.',
    role: 'Specialist Programmer & Systems Engineer',
    jobDescription: 'Algorithmic computing, AI systems integration, core software engineering, and large-scale cloud applications.',
    jobLocation: 'Bhubaneswar / Mysore / Bangalore',
    employmentType: 'Full-time Regular',
    workMode: 'Hybrid',
    vacancies: 75,
    requiredSkills: ['C++', 'Java', 'Algorithms', 'Databases', 'Cloud Tech'],
    packageOffered: '₹9.5 LPA (Specialist) / ₹3.6 LPA (Systems)',
    packageLPA: 9.5,
    bond: '1 Year Foundation Service Agreement',
    eligibilityCriteria: {
      degree: 'B.Tech / MCA',
      minCgpa: 6.8,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'ECE', 'EEE', 'MECH'],
      passingYear: '2027',
      min10thPercent: 65,
      min12thPercent: 65,
      otherCriteria: 'HackWithInfy or InfyTQ qualifiers receive direct interview pass.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-10',
      applicationDeadline: '2026-10-28',
      prePlacementTalkDate: '2026-10-30',
      aptitudeTestDate: '2026-11-02',
      technicalInterviewSchedule: '2026-11-06',
      hrInterviewSchedule: '2026-11-08',
      finalSelectionDate: '2026-11-12',
    },
    status: 'Published',
    registeredCount: 280,
    shortlistedCount: 95,
    selectedCount: 30,
    venue: 'Virtual Assessment Arena & Campus Tech Block',
    attachments: [],
  },
  {
    id: 'DRIVE-2026-05',
    company: 'Wipro Technologies',
    companyLogo: 'WP',
    companyColor: '#521472',
    companyWebsite: 'https://www.wipro.com',
    industry: 'Technology, Cloud & Cybersecurity',
    recruiterContact: 'Ms. Deepika Sharma · talent.wipro@wipro.com · +91 80 4682 7000',
    companyDescription: 'Leading technology services and consulting company focused on building innovative solutions across enterprise clouds.',
    role: 'Project Engineer (Elite National Talent Hunt)',
    jobDescription: 'Software application lifecycle, automated unit testing, deployment operations, and enterprise customer system enhancements.',
    jobLocation: 'Bhubaneswar / Kolkata / Hyderabad',
    employmentType: 'Full-time Regular',
    workMode: 'On-site',
    vacancies: 50,
    requiredSkills: ['Core Java', 'Python', 'Web Fundamentals', 'SQL'],
    packageOffered: '₹3.5 LPA - ₹6.5 LPA (Turbo)',
    packageLPA: 3.5,
    bond: '12 Months Agreement',
    eligibilityCriteria: {
      degree: 'B.Tech / MCA',
      minCgpa: 6.0,
      maxBacklogs: 1,
      allowedBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
      passingYear: '2027',
      min10thPercent: 60,
      min12thPercent: 60,
      otherCriteria: 'Wipro Elite National Talent Hunt cleared.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-01',
      applicationDeadline: '2026-11-01',
      prePlacementTalkDate: '2026-11-04',
      aptitudeTestDate: '2026-11-07',
      technicalInterviewSchedule: '2026-11-12',
      hrInterviewSchedule: '2026-11-14',
      finalSelectionDate: '2026-11-18',
    },
    status: 'Published',
    registeredCount: 195,
    shortlistedCount: 70,
    selectedCount: 20,
    venue: 'Campus Hall B & Virtual Rooms',
    attachments: [],
  },
  {
    id: 'DRIVE-2026-06',
    company: 'HCL Technologies',
    companyLogo: 'HCL',
    companyColor: '#0075c2',
    companyWebsite: 'https://www.hcltech.com',
    industry: 'Next-Gen Global Technology',
    recruiterContact: 'Mr. Debashis Jena · campus@hcl.com',
    companyDescription: 'Global technology company supercharging progress for the world’s leading enterprises.',
    role: 'Graduate Engineer Trainee',
    jobDescription: 'Engineering R&D services, embedded software, cloud migration, and telecom protocol testing.',
    jobLocation: 'Noida / Chennai / Bangalore',
    employmentType: 'Full-time Regular',
    workMode: 'Hybrid',
    vacancies: 40,
    requiredSkills: ['C/C++', 'Python', 'Operating Systems', 'Networking'],
    packageOffered: '₹3.8 LPA',
    packageLPA: 3.8,
    bond: '1 Year',
    eligibilityCriteria: {
      degree: 'B.Tech',
      minCgpa: 6.5,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'ECE', 'EEE'],
      passingYear: '2027',
      min10thPercent: 65,
      min12thPercent: 65,
      otherCriteria: 'Valid college identity and clearance.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-12',
      applicationDeadline: '2026-11-10',
      prePlacementTalkDate: '2026-11-12',
      aptitudeTestDate: '2026-11-15',
      technicalInterviewSchedule: '2026-11-18',
      hrInterviewSchedule: '2026-11-20',
      finalSelectionDate: '2026-11-24',
    },
    status: 'Published',
    registeredCount: 140,
    shortlistedCount: 45,
    selectedCount: 15,
    venue: 'Campus Auditorium',
    attachments: [],
  },
  {
    id: 'DRIVE-2026-07',
    company: 'Tech Mahindra',
    companyLogo: 'TM',
    companyColor: '#d9272e',
    companyWebsite: 'https://www.techmahindra.com',
    industry: 'Digital Transformation & Telecom Consulting',
    recruiterContact: 'Mr. Sudhir K. Patra · campus@techmahindra.com',
    companyDescription: 'Empowering enterprises to rise through digital customer experiences and telecom platforms.',
    role: 'Associate Software Engineer',
    jobDescription: 'Telecom network software, automation script design, database maintenance, and testing pipelines.',
    jobLocation: 'Bhubaneswar / Pune / Hyderabad',
    employmentType: 'Full-time Regular',
    workMode: 'On-site',
    vacancies: 35,
    requiredSkills: ['Java', 'SQL', 'Automation Basics', 'Data Analysis'],
    packageOffered: '₹3.25 LPA',
    packageLPA: 3.25,
    bond: 'None',
    eligibilityCriteria: {
      degree: 'B.Tech / MCA',
      minCgpa: 6.0,
      maxBacklogs: 1,
      allowedBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
      passingYear: '2027',
      min10thPercent: 60,
      min12thPercent: 60,
      otherCriteria: 'Cleared university 4th semester examinations without active backlog.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-15',
      applicationDeadline: '2026-11-15',
      prePlacementTalkDate: '2026-11-16',
      aptitudeTestDate: '2026-11-18',
      technicalInterviewSchedule: '2026-11-21',
      hrInterviewSchedule: '2026-11-23',
      finalSelectionDate: '2026-11-26',
    },
    status: 'Published',
    registeredCount: 110,
    shortlistedCount: 40,
    selectedCount: 12,
    venue: 'Auditorium Hall C',
    attachments: [],
  },
  {
    id: 'DRIVE-2026-08',
    company: 'Amazon Web Services (AWS)',
    companyLogo: 'AMZ',
    companyColor: '#ff9900',
    companyWebsite: 'https://www.amazon.jobs',
    industry: 'Cloud Computing, E-Commerce & AI',
    recruiterContact: 'AWS Campus Relations Team · aws-india-campus@amazon.com',
    companyDescription: 'World’s most comprehensive and broadly adopted cloud platform offering over 200 fully featured services.',
    role: 'Cloud Support Associate / SDE-1 Trainee',
    jobDescription: 'Cloud architecture troubleshooting, software systems reliability, distributed systems scaling, and customer incident debugging.',
    jobLocation: 'Hyderabad / Bangalore',
    employmentType: 'Full-time Regular',
    workMode: 'Hybrid',
    vacancies: 15,
    requiredSkills: ['Linux', 'Networking', 'Python / Java', 'Distributed Systems', 'Cloud Concepts'],
    packageOffered: '₹14.0 LPA - ₹22.0 LPA (Super Dream)',
    packageLPA: 22.0,
    bond: 'None',
    eligibilityCriteria: {
      degree: 'B.Tech',
      minCgpa: 8.5,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'ECE'],
      passingYear: '2027',
      min10thPercent: 80,
      min12thPercent: 80,
      otherCriteria: 'High algorithmic problem solving skills; LeetCode / CodeForces rating preferred.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-25',
      applicationDeadline: '2026-11-20',
      prePlacementTalkDate: '2026-11-22',
      aptitudeTestDate: '2026-11-24',
      technicalInterviewSchedule: '2026-11-27',
      hrInterviewSchedule: '2026-11-29',
      finalSelectionDate: '2026-12-02',
    },
    status: 'Draft', // Placement Cell draft mode
    registeredCount: 0,
    shortlistedCount: 0,
    selectedCount: 0,
    venue: 'Tech Tower Executive Suite',
    attachments: [],
  },
];

export const INITIAL_INTERNSHIPS = [
  {
    id: 'INT-2026-01',
    company: 'TechSurge India Pvt. Ltd.',
    role: 'Machine Learning & Vision Intern',
    title: 'Machine Learning & Vision Intern',
    logo: 'TS',
    color: '#4a90e2',
    website: 'https://techsurge.io',
    description: 'Work alongside senior ML engineers on real-time computer vision models, PyTorch deep learning pipelines, and model quantization for edge inference.',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis', 'OpenCV'],
    eligibleBranches: ['Computer Science & Engineering', 'CSE (AI)', 'ECE'],
    eligibleYears: ['3rd Year (Semester 5/6)', '4th Year (Semester 7/8)'],
    minCgpa: 7.5,
    duration: '2 Months',
    startDate: '2026-11-15',
    endDate: '2027-01-15',
    workMode: 'Hybrid',
    location: 'Bhubaneswar (On-site & Hybrid)',
    isPaid: true,
    stipend: '₹8,000/month',
    applicationOpenDate: '2026-10-01',
    deadline: '20 Oct 2026',
    openings: 8,
    applicationInstructions: 'Upload updated technical resume, GitHub URL, and 4th semester mark sheet. Shortlisted candidates will be invited for live coding interview.',
    requiredDocs: 'Resume PDF, College Bonafide/NOC Certificate, ID Card Copy',
    externalUrl: '',
    contactInfo: 'careers@techsurge.io · +91 674 258 9100',
    terms: 'Candidates must maintain minimum 75% college attendance. Certificate awarded upon final project defense.',
    status: 'Published', // 'Published', 'Draft', 'Closed', 'Archived'
    applicantCount: 28,
    shortlistedCount: 10,
    selectedCount: 4,
  },
  {
    id: 'INT-2026-02',
    company: 'CloudNest Solutions',
    role: 'Cloud & DevOps Engineering Intern',
    title: 'Cloud & DevOps Engineering Intern',
    logo: 'CN',
    color: '#27ae60',
    website: 'https://cloudnest.tech',
    description: 'Build CI/CD pipelines, containerize microservices using Docker, configure Kubernetes clusters, and write Terraform infrastructure-as-code scripts.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    eligibleBranches: ['Computer Science & Engineering', 'CSE (AI)', 'ECE', 'EEE'],
    eligibleYears: ['3rd Year (Semester 5/6)', '4th Year (Semester 7/8)'],
    minCgpa: 7.0,
    duration: '3 Months',
    startDate: '2026-11-01',
    endDate: '2027-01-31',
    workMode: 'Remote',
    location: 'Remote (Virtual Workstation)',
    isPaid: true,
    stipend: '₹12,000/month',
    applicationOpenDate: '2026-09-28',
    deadline: '25 Oct 2026',
    openings: 12,
    applicationInstructions: 'Submit application via portal with project portfolio. Online DevOps screening quiz will be dispatched to registered emails.',
    requiredDocs: 'Resume, GitHub Profile, College Permission Slip',
    externalUrl: '',
    contactInfo: 'talent@cloudnest.tech',
    terms: 'Laptop & high-speed Internet stipend provided. Full-time PPO offered to top performers.',
    status: 'Published',
    applicantCount: 34,
    shortlistedCount: 14,
    selectedCount: 6,
  },
  {
    id: 'INT-2026-03',
    company: 'DataSense Analytics',
    role: 'Data Science & BI Intern',
    title: 'Data Science & BI Intern',
    logo: 'DS',
    color: '#8e44ad',
    website: 'https://datasenseanalytics.com',
    description: 'Perform exploratory data analysis on retail datasets, engineer relational SQL schemas, train predictive regression models, and design Tableau executive dashboards.',
    requiredSkills: ['Python', 'SQL', 'Tableau', 'Machine Learning', 'Pandas'],
    eligibleBranches: ['Computer Science & Engineering', 'CSE (AI)', 'MCA'],
    eligibleYears: ['3rd Year (Semester 5/6)', '4th Year (Semester 7/8)'],
    minCgpa: 7.2,
    duration: '6 Months',
    startDate: '2026-12-01',
    endDate: '2027-05-31',
    workMode: 'Hybrid',
    location: 'Hyderabad (Hybrid / Campus Incubation)',
    isPaid: true,
    stipend: '₹15,000/month',
    applicationOpenDate: '2026-10-02',
    deadline: '30 Oct 2026',
    openings: 6,
    applicationInstructions: 'Demonstrate proficiency in SQL queries and Python data wrangling. Technical interview includes live case study.',
    requiredDocs: 'Resume PDF, Transcripts, College NOC',
    externalUrl: '',
    contactInfo: 'hr@datasenseanalytics.com',
    terms: 'Semester project credit transferable to college curriculum.',
    status: 'Published',
    applicantCount: 22,
    shortlistedCount: 8,
    selectedCount: 2,
  },
  {
    id: 'INT-2026-04',
    company: 'InnoSoft Technologies',
    role: 'Web Development & UI/UX Intern',
    title: 'Web Development & UI/UX Intern',
    logo: 'IS',
    color: '#e67e22',
    website: 'https://innosoft-tech.in',
    description: 'Develop responsive React web components, integrate RESTful APIs with Node.js/Express, manage MongoDB databases, and implement clean Figma UI designs.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'CSS/HTML', 'Figma'],
    eligibleBranches: ['All Engineering Disciplines', 'MCA'],
    eligibleYears: ['2nd Year (Semester 3/4)', '3rd Year (Semester 5/6)'],
    minCgpa: 6.5,
    duration: '2 Months',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    workMode: 'Remote',
    location: 'Remote',
    isPaid: true,
    stipend: '₹6,000/month',
    applicationOpenDate: '2026-09-15',
    deadline: '10 Oct 2026',
    openings: 10,
    applicationInstructions: 'Applications are now closed for the autumn batch. Selected students have been notified.',
    requiredDocs: 'Resume PDF, College ID Card',
    externalUrl: '',
    contactInfo: 'internships@innosoft-tech.in',
    terms: 'Certificate and stipend issued upon completion.',
    status: 'Closed', // Closed status
    applicantCount: 45,
    shortlistedCount: 18,
    selectedCount: 10,
  },
  {
    id: 'INT-2026-05',
    company: 'Central Tool Room and Training Center (CTTC)',
    role: 'Industrial CAD/CAM & Automation Intern',
    title: 'Industrial CAD/CAM & Automation Intern',
    logo: 'CTTC',
    color: '#0284c7',
    website: 'https://cttc.gov.in',
    description: 'Government of India autonomous technology center offering hands-on CNC programming, industrial robotics, PLC automation, and precision manufacturing.',
    requiredSkills: ['AutoCAD', 'SolidWorks', 'PLC Programming', 'CNC Machining'],
    eligibleBranches: ['Mechanical Engineering', 'Electrical & Electronics', 'Civil Engineering'],
    eligibleYears: ['3rd Year (Semester 5/6)', '4th Year (Semester 7/8)'],
    minCgpa: 6.0,
    duration: '1 Month (Summer Industrial Training)',
    startDate: '2026-11-20',
    endDate: '2026-12-20',
    workMode: 'On-site',
    location: 'Bhubaneswar (CTTC Campus)',
    isPaid: false,
    stipend: 'Government Subsidized Training',
    applicationOpenDate: '2026-10-05',
    deadline: '15 Nov 2026',
    openings: 30,
    applicationInstructions: 'Apply via college internship cell. Requires official College Bonafide and NOC certificate.',
    requiredDocs: 'College Bonafide Certificate, Undertaking Form, Passport Photos',
    externalUrl: '',
    contactInfo: 'training@cttc.gov.in',
    terms: 'Approved for institutional 2-credit summer internship evaluation.',
    status: 'Published',
    applicantCount: 52,
    shortlistedCount: 30,
    selectedCount: 30,
  },
];

export const INITIAL_CORPORATE_PARTNERS = [
  {
    id: 'COMP-01',
    name: 'Tata Consultancy Services (TCS)',
    logo: 'TCS',
    category: 'Tier 1 IT Services & Consulting',
    website: 'https://www.tcs.com',
    hrContact: 'Ms. Ananya Sengupta',
    email: 'campus.hiring@tcs.com',
    phone: '+91 22 6778 9999',
    officeLocation: 'Bhubaneswar / Mumbai / Pan-India',
    packageRange: '₹3.6 LPA - ₹9.2 LPA',
    tier: 'Tier 1 Partner',
    mouStatus: 'Signed & Valid (2024–2028)',
    totalHiredFromCampus: 124,
    lastVisitDate: '15 Oct 2026',
    status: 'Active Partner',
    description: 'India’s largest multinational IT services company with dedicated academic engagement MoU with Apna Campus.',
    recruitmentHistory: [
      { year: '2025-26', hired: 46, highestPkg: '₹9.0 LPA', avgPkg: '₹4.8 LPA' },
      { year: '2024-25', hired: 42, highestPkg: '₹7.5 LPA', avgPkg: '₹4.2 LPA' },
      { year: '2023-24', hired: 36, highestPkg: '₹7.0 LPA', avgPkg: '₹3.8 LPA' },
    ],
  },
  {
    id: 'COMP-02',
    name: 'Cognizant Technology Solutions',
    logo: 'CT',
    category: 'Global IT Consulting & Cloud',
    website: 'https://www.cognizant.com',
    hrContact: 'Mr. Arvind Krishnan',
    email: 'university.relations@cognizant.com',
    phone: '+91 44 4209 6000',
    officeLocation: 'Kolkata / Chennai / Hyderabad',
    packageRange: '₹4.5 LPA - ₹10.0 LPA',
    tier: 'Tier 1 Partner',
    mouStatus: 'Signed & Valid (2025–2029)',
    totalHiredFromCampus: 88,
    lastVisitDate: '09 Oct 2026',
    status: 'Active Partner',
    description: 'Premier recruiting partner conducting GenC, GenC Elevate, and GenC Next hiring tracks annually.',
    recruitmentHistory: [
      { year: '2025-26', hired: 32, highestPkg: '₹9.5 LPA', avgPkg: '₹5.2 LPA' },
      { year: '2024-25', hired: 28, highestPkg: '₹8.0 LPA', avgPkg: '₹4.6 LPA' },
      { year: '2023-24', hired: 28, highestPkg: '₹6.8 LPA', avgPkg: '₹4.0 LPA' },
    ],
  },
  {
    id: 'COMP-03',
    name: 'Wipro Technologies',
    logo: 'WP',
    category: 'Technology & Cloud Solutions',
    website: 'https://www.wipro.com',
    hrContact: 'Ms. Deepika Sharma',
    email: 'talent.wipro@wipro.com',
    phone: '+91 80 4682 7000',
    officeLocation: 'Bhubaneswar / Bangalore',
    packageRange: '₹3.8 LPA - ₹6.5 LPA',
    tier: 'Active Partner',
    mouStatus: 'Signed & Valid',
    totalHiredFromCampus: 64,
    lastVisitDate: '12 Sep 2026',
    status: 'Active Partner',
    description: 'Key recruiter for engineering graduates across software development, network support, and cloud services.',
    recruitmentHistory: [
      { year: '2025-26', hired: 24, highestPkg: '₹6.5 LPA', avgPkg: '₹4.0 LPA' },
      { year: '2024-25', hired: 22, highestPkg: '₹6.0 LPA', avgPkg: '₹3.8 LPA' },
      { year: '2023-24', hired: 18, highestPkg: '₹5.5 LPA', avgPkg: '₹3.5 LPA' },
    ],
  },
  {
    id: 'COMP-04',
    name: 'Cisco Systems India',
    logo: 'CS',
    category: 'Product Engineering & Networking',
    website: 'https://www.cisco.com',
    hrContact: 'Mr. Vikram Adve',
    email: 'india.campus@cisco.com',
    phone: '+91 80 4429 8800',
    officeLocation: 'Bangalore / Bhubaneswar',
    packageRange: '₹14.0 LPA - ₹24.0 LPA',
    tier: 'Super Dream Recruiter',
    mouStatus: 'Signed & Valid (Center of Excellence)',
    totalHiredFromCampus: 12,
    lastVisitDate: '04 Oct 2026',
    status: 'Active Partner',
    description: 'Dream tier product company with on-campus Cisco Networking Academy and high-compensation software engineer hiring.',
    recruitmentHistory: [
      { year: '2025-26', hired: 6, highestPkg: '₹24.0 LPA', avgPkg: '₹18.5 LPA' },
      { year: '2024-25', hired: 4, highestPkg: '₹22.0 LPA', avgPkg: '₹17.0 LPA' },
      { year: '2023-24', hired: 2, highestPkg: '₹18.0 LPA', avgPkg: '₹15.0 LPA' },
    ],
  },
  {
    id: 'COMP-05',
    name: 'L&T Technology Services (LTTS)',
    logo: 'LTTS',
    category: 'Engineering R&D Services',
    website: 'https://www.ltts.com',
    hrContact: 'Mr. Rajeshwar Rao',
    email: 'campus@ltts.com',
    phone: '+91 22 6752 5656',
    officeLocation: 'Vadodara / Bangalore / Chennai',
    packageRange: '₹5.5 LPA - ₹8.0 LPA',
    tier: 'Active Partner',
    mouStatus: 'Signed & Valid',
    totalHiredFromCampus: 34,
    lastVisitDate: '28 Aug 2026',
    status: 'Active Partner',
    description: 'Core engineering and technical consulting leader hiring across Mechanical, Electrical, Civil, and CSE branches.',
    recruitmentHistory: [
      { year: '2025-26', hired: 14, highestPkg: '₹8.0 LPA', avgPkg: '₹6.2 LPA' },
      { year: '2024-25', hired: 12, highestPkg: '₹7.5 LPA', avgPkg: '₹5.8 LPA' },
      { year: '2023-24', hired: 8, highestPkg: '₹6.5 LPA', avgPkg: '₹5.2 LPA' },
    ],
  },
  {
    id: 'COMP-06',
    name: 'TechSurge India Pvt. Ltd.',
    logo: 'TS',
    category: 'AI & Machine Learning Ventures',
    website: 'https://techsurge.io',
    hrContact: 'Mr. Anmol Mohapatra',
    email: 'campus@techsurge.io',
    phone: '+91 674 258 9100',
    officeLocation: 'Bhubaneswar (Infocity)',
    packageRange: '₹6.0 LPA - ₹11.0 LPA',
    tier: 'Active Partner',
    mouStatus: 'Signed & Valid',
    totalHiredFromCampus: 18,
    lastVisitDate: '18 Oct 2026',
    status: 'Active Partner',
    description: 'Specialist AI development agency offering high-stipend internships and PPO conversions.',
    recruitmentHistory: [
      { year: '2025-26', hired: 8, highestPkg: '₹11.0 LPA', avgPkg: '₹7.5 LPA' },
      { year: '2024-25', hired: 6, highestPkg: '₹9.0 LPA', avgPkg: '₹6.5 LPA' },
    ],
  },
];

export const INITIAL_STUDENT_APPLICATIONS = [
  {
    id: 'APP-101',
    studentName: 'Rakesh Das',
    regNo: '2305201001',
    rollNo: '01',
    branch: 'Computer Science & Engineering',
    deptCode: 'CSE',
    cgpa: 8.72,
    company: 'Cisco Systems India',
    jobRole: 'Associate Network & Software Engineer',
    appliedDate: '2026-10-02',
    eligibilityStatus: 'Eligible',
    stage: 'Technical Interview', // 'Applied', 'Under Review', 'Shortlisted', 'Aptitude Test', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected', 'Withdrawn'
    interviewSchedule: '28 Oct 2026, 11:30 AM (Virtual Lab 3)',
    finalResult: 'In Progress',
    roundScore: '8.8 / 10',
    ctcOffered: '₹18.5 LPA',
    internalNotes: 'Demonstrated strong socket programming and binary tree optimization skills in round 1.',
    history: [
      { stage: 'Applied', date: '02 Oct 2026', notes: 'Application submitted via student portal' },
      { stage: 'Shortlisted', date: '05 Oct 2026', notes: 'Verified via automated deterministic CGPA cutoff' },
      { stage: 'Aptitude Test', date: '10 Oct 2026', notes: 'Scored 92% in online algorithmic screening' },
      { stage: 'Technical Interview', date: '15 Oct 2026', notes: 'Scheduled for round 2 technical viva' },
    ],
  },
  {
    id: 'APP-102',
    studentName: 'Priya Patra',
    regNo: '2305201004',
    rollNo: '04',
    branch: 'Computer Science & Engineering',
    deptCode: 'CSE',
    cgpa: 9.08,
    company: 'Cisco Systems India',
    jobRole: 'Associate Network & Software Engineer',
    appliedDate: '2026-10-02',
    eligibilityStatus: 'Eligible',
    stage: 'Selected',
    interviewSchedule: 'Completed on 18 Oct 2026',
    finalResult: 'Selected',
    roundScore: '9.4 / 10',
    ctcOffered: '₹18.5 LPA (Dream Package)',
    internalNotes: 'Exceptional system architecture and LeetCode performance. Recommended for Dream offer tier.',
    history: [
      { stage: 'Applied', date: '02 Oct 2026', notes: 'Application registered' },
      { stage: 'Aptitude Test', date: '10 Oct 2026', notes: 'Passed with 96% score' },
      { stage: 'Technical Interview', date: '14 Oct 2026', notes: 'Cleared round 1 and round 2' },
      { stage: 'HR Interview', date: '16 Oct 2026', notes: 'Cleared executive leadership round' },
      { stage: 'Selected', date: '18 Oct 2026', notes: 'Offer letter released and accepted' },
    ],
  },
  {
    id: 'APP-103',
    studentName: 'Amit Nayak',
    regNo: '2305201002',
    rollNo: '02',
    branch: 'Computer Science & Engineering',
    deptCode: 'CSE',
    cgpa: 8.04,
    company: 'Tata Consultancy Services',
    jobRole: 'Digital Systems Engineer & Innovator',
    appliedDate: '2026-09-25',
    eligibilityStatus: 'Eligible',
    stage: 'Selected',
    interviewSchedule: 'Completed on 14 Oct 2026',
    finalResult: 'Selected',
    roundScore: '8.8 / 10',
    ctcOffered: '₹7.2 LPA (TCS Digital)',
    internalNotes: 'Qualified TCS National Qualifier Test (NQT) with 94 percentile. Strong cloud fundamentals.',
    history: [
      { stage: 'Applied', date: '25 Sep 2026', notes: 'Applied for Digital Cadre' },
      { stage: 'Aptitude Test', date: '02 Oct 2026', notes: 'NQT Score 94.2%' },
      { stage: 'Technical Interview', date: '08 Oct 2026', notes: 'Cleared Digital assessment panel' },
      { stage: 'Selected', date: '14 Oct 2026', notes: 'Offer Letter Released' },
    ],
  },
  {
    id: 'APP-104',
    studentName: 'Raj Sahoo',
    regNo: '2305201003',
    rollNo: '03',
    branch: 'Mechanical Engineering',
    deptCode: 'MECH',
    cgpa: 8.12,
    company: 'L&T Technology Services (LTTS)',
    jobRole: 'Graduate Engineer Trainee (R&D)',
    appliedDate: '2026-09-28',
    eligibilityStatus: 'Eligible',
    stage: 'Technical Interview',
    interviewSchedule: '24 Oct 2026, 02:00 PM (Seminar Room 2)',
    finalResult: 'In Progress',
    roundScore: '8.0 / 10',
    ctcOffered: '₹6.5 LPA',
    internalNotes: 'Strong CAD modeling, thermal thermodynamics aptitude, and hands-on lathe machining.',
    history: [
      { stage: 'Applied', date: '28 Sep 2026', notes: 'Applied for R&D Core track' },
      { stage: 'Aptitude Test', date: '08 Oct 2026', notes: 'Cleared core engineering screening' },
      { stage: 'Technical Interview', date: '18 Oct 2026', notes: 'Cleared technical round 1' },
    ],
  },
  {
    id: 'APP-105',
    studentName: 'Bishnu Prasad Sahoo',
    regNo: '2401432265',
    rollNo: '2401432265',
    branch: 'Computer Science & Engineering (Artificial Intelligence)',
    deptCode: 'CSE (AI)',
    cgpa: 8.42,
    company: 'TechSurge India Pvt. Ltd.',
    jobRole: 'Machine Learning & Vision Intern',
    appliedDate: '2026-10-02',
    eligibilityStatus: 'Eligible',
    stage: 'Under Review',
    interviewSchedule: 'Pending Shortlist Schedule',
    finalResult: 'In Progress',
    roundScore: 'Eligibility Verified',
    ctcOffered: '₹8,000 / month Stipend',
    internalNotes: 'Demonstrated deep interest in AI/ML architectures and prompt engineering.',
    history: [
      { stage: 'Applied', date: '02 Oct 2026', notes: 'Internship application logged via student portal' },
      { stage: 'Under Review', date: '04 Oct 2026', notes: 'Resume and GitHub profile undergoing mentor review' },
    ],
  },
  {
    id: 'APP-106',
    studentName: 'Sourav Mohanty',
    regNo: '2305201005',
    rollNo: '05',
    branch: 'Civil Engineering',
    deptCode: 'CIVIL',
    cgpa: 7.45,
    company: 'Cognizant Technology Solutions',
    jobRole: 'Programmer Analyst Trainee',
    appliedDate: '2026-10-06',
    eligibilityStatus: 'Eligible',
    stage: 'Aptitude Test',
    interviewSchedule: '05 Nov 2026 (Virtual Assessment)',
    finalResult: 'In Progress',
    roundScore: 'Awaiting Assessment',
    ctcOffered: '₹6.75 LPA',
    internalNotes: 'Cross-discipline applicant with certified Java and Python coursework.',
    history: [
      { stage: 'Applied', date: '06 Oct 2026', notes: 'Registered for Cognizant non-circuit drive' },
      { stage: 'Aptitude Test', date: '12 Oct 2026', notes: 'Assessment link dispatched' },
    ],
  },
];

export const INITIAL_JOB_OFFERS = [
  {
    id: 'OFFER-01',
    offerToken: 'GIFT-OFFER-2026-01-2305201004',
    studentName: 'Priya Patra',
    regNo: '2305201004',
    department: 'Computer Science & Engineering',
    company: 'Cisco Systems India',
    role: 'Associate Network & Software Engineer',
    packageOffered: '₹18.5 LPA',
    fixedSalary: '₹14.5 LPA',
    variableSalary: '₹4.0 LPA (Performance Bonus & Joining Stocks)',
    joiningDate: '2027-07-01',
    validityDeadline: '2026-12-15',
    status: 'Offer Accepted',
    issuedDate: '2026-10-02',
    letterAttachment: 'Cisco_Official_Letter_of_Intent_Priya_Patra.pdf',
    notes: 'Candidate accepted offer in portal. Dual offer clearance validated.',
  },
  {
    id: 'OFFER-02',
    offerToken: 'GIFT-OFFER-2026-02-2305201002',
    studentName: 'Amit Nayak',
    regNo: '2305201002',
    department: 'Computer Science & Engineering',
    company: 'Tata Consultancy Services',
    role: 'Digital Systems Engineer & Innovator',
    packageOffered: '₹7.2 LPA',
    fixedSalary: '₹6.5 LPA',
    variableSalary: '₹0.7 LPA (Digital Incentive)',
    joiningDate: '2027-06-15',
    validityDeadline: '2026-12-20',
    status: 'Offer Letter Released',
    issuedDate: '2026-10-04',
    letterAttachment: 'TCS_Digital_Offer_Letter_Amit_Nayak.pdf',
    notes: 'Offer letter generated with seal. Student review window open.',
  },
  {
    id: 'OFFER-03',
    offerToken: 'GIFT-OFFER-2026-03-2305201001',
    studentName: 'Rakesh Das',
    regNo: '2305201001',
    department: 'Computer Science & Engineering',
    company: 'Cognizant Technology Solutions',
    role: 'Programmer Analyst Trainee (GenC Next)',
    packageOffered: '₹6.75 LPA',
    fixedSalary: '₹5.8 LPA',
    variableSalary: '₹0.95 LPA',
    joiningDate: '2027-07-15',
    validityDeadline: '2026-12-25',
    status: 'Offer Letter Released',
    issuedDate: '2026-10-08',
    letterAttachment: 'Cognizant_GenC_Next_Rakesh_Das.pdf',
    notes: 'Pre-offer confirmation issued awaiting final semester marks.',
  },
];

export const INITIAL_TRAINING_PROGRAMS = [
  {
    id: 'TRN-01',
    title: 'Aptitude & Reasoning Master Bootcamp',
    category: 'Aptitude Training',
    trainer: 'Prof. Subrat Nayak & FACE Prep Trainers',
    duration: '20 hours',
    schedule: 'Every Monday & Wednesday (04:30 PM - 06:30 PM)',
    venue: 'Auditorium Hall B & Virtual E-Classroom',
    targetBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
    targetYears: ['Semester 5', 'Semester 7'],
    registrationDeadline: '2026-10-25',
    totalSeats: 250,
    enrolledCount: 198,
    status: 'Ongoing',
    progress: 65,
    description: 'Master quantitative aptitude, rapid mental math, logical reasoning, data interpretation, and verbal puzzle solving for Tier-1 screening exams.',
    materials: ['Quantitative_Aptitude_Formulae_Handbook.pdf', 'Logical_Puzzles_Worksheet.pdf'],
  },
  {
    id: 'TRN-02',
    title: 'Resume Writing & Professional Brand Building',
    category: 'Resume Building Workshop',
    trainer: 'T&P Corporate Relations Mentors & HR Alumni',
    duration: '3 hours',
    schedule: 'Saturday (10:00 AM - 01:00 PM)',
    venue: 'Smart E-Classroom 201',
    targetBranches: ['All Engineering Disciplines', 'MCA'],
    targetYears: ['Semester 5', 'Semester 7'],
    registrationDeadline: '2026-10-18',
    totalSeats: 200,
    enrolledCount: 200,
    status: 'Completed',
    progress: 100,
    description: 'ATS-optimized resume crafting, impactful bullet structuring using STAR technique, GitHub/LinkedIn optimization, and portfolio presentation.',
    materials: ['ATS_Resume_Standard_Template.docx', 'Action_Verbs_and_STAR_Guide.pdf'],
  },
  {
    id: 'TRN-03',
    title: 'Data Structures & Algorithms for Dream Interviews',
    category: 'Coding & DSA Sessions',
    trainer: 'Dr. P. K. Pattnaik & Competitive Coders Guild',
    duration: '15 hours',
    schedule: 'Tuesdays & Thursdays (05:00 PM - 07:00 PM)',
    venue: 'Advanced Computing Lab 1',
    targetBranches: ['CSE', 'ECE', 'MCA'],
    targetYears: ['Semester 5', 'Semester 7'],
    registrationDeadline: '2026-10-28',
    totalSeats: 150,
    enrolledCount: 95,
    status: 'Upcoming',
    progress: 0,
    description: 'In-depth problem solving covering dynamic programming, graphs, segment trees, trie structures, and system design patterns for Amazon and Cisco technical rounds.',
    materials: ['DSA_Interview_Cheat_Sheet.pdf'],
  },
  {
    id: 'TRN-04',
    title: 'Communication Skills & Group Discussion (GD) Prep',
    category: 'Soft Skills Training',
    trainer: 'Prof. Ananya Sen & Corporate Soft-Skill Coaches',
    duration: '10 hours',
    schedule: 'Fridays (03:30 PM - 05:30 PM)',
    venue: 'Language Lab & Boardroom 1',
    targetBranches: ['All Engineering Disciplines'],
    targetYears: ['Semester 5', 'Semester 7'],
    registrationDeadline: '2026-10-30',
    totalSeats: 120,
    enrolledCount: 68,
    status: 'Upcoming',
    progress: 0,
    description: 'Mock GD sessions with live video playback feedback, extempore speaking, corporate etiquette, and confident body language techniques.',
    materials: ['GD_Topics_Compendium_2026.pdf'],
  },
  {
    id: 'TRN-05',
    title: 'Industry Mock Interview Series with Tech Alumni',
    category: 'Mock Interviews',
    trainer: 'Alumni Network (Google, Microsoft, Cisco, TCS)',
    duration: '6 sessions',
    schedule: 'Weekends (Saturday & Sunday slots)',
    venue: 'Executive Interview Suites 1-4',
    targetBranches: ['CSE', 'ECE', 'EEE', 'MECH'],
    targetYears: ['Semester 7'],
    registrationDeadline: '2026-10-22',
    totalSeats: 80,
    enrolledCount: 64,
    status: 'Ongoing',
    progress: 33,
    description: 'One-on-one 45-minute technical and managerial mock interviews with senior corporate alumni followed by actionable scorecard reviews.',
    materials: ['Mock_Interview_Rubrics_Scorecard.pdf'],
  },
];

export const INITIAL_PLACEMENT_NOTICES = [
  {
    id: 'NOTIF-PL-01',
    title: 'Cognizant GenC Next Campus Drive Schedule & Online Assessment',
    category: 'Placement Drive Schedule',
    publishDate: '2026-10-18',
    expiryDate: '2026-11-06',
    targetBranches: ['CSE', 'ECE', 'EEE'],
    isUrgent: true,
    content: 'All shortlisted candidates for Cognizant GenC Next must report to Lab 1, 2, and 4 at 09:30 AM sharp in formal uniform with college smart card. Please ensure your laptops have updated Chrome browser and webcams tested for proctoring.',
    attachments: [
      { name: 'Cognizant_Candidate_Instructions_2026.pdf', size: '1.2 MB' },
    ],
    status: 'Published',
  },
  {
    id: 'NOTIF-PL-02',
    title: 'Hearty Congratulations to 28 Students Selected at Cisco Systems India!',
    category: 'Selection Results',
    publishDate: '2026-10-16',
    expiryDate: '2026-11-30',
    targetBranches: ['All Branches'],
    isUrgent: false,
    content: 'The Training & Placement Directorate congratulates 28 final year B.Tech engineering candidates for securing dream package offers of ₹18.5 LPA at Cisco Systems India. Official Letters of Intent are issued.',
    attachments: [
      { name: 'Cisco_Selected_Candidates_Roll_2026.pdf', size: '640 KB' },
    ],
    status: 'Published',
  },
  {
    id: 'NOTIF-PL-03',
    title: 'Mandatory Aptitude & Logical Reasoning Master Bootcamp Attendance',
    category: 'Placement Training',
    publishDate: '2026-10-14',
    expiryDate: '2026-10-31',
    targetBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
    isUrgent: true,
    content: 'Attendance in the ongoing FACE Prep Aptitude Bootcamp is mandatory for all students registered for upcoming 2026-27 recruitment drives. Minimum 85% session attendance is required for drive eligibility clearance.',
    attachments: [],
    status: 'Published',
  },
  {
    id: 'NOTIF-PL-04',
    title: 'Summer Industrial Internship Bonafide & NOC Applications Open',
    category: 'Internship Notice',
    publishDate: '2026-10-10',
    expiryDate: '2026-11-15',
    targetBranches: ['All Branches'],
    isUrgent: false,
    content: 'Students seeking off-campus or corporate partner summer internships (SIP) must apply for official college Bonafide Certificate & No Objection Certificate (NOC) through the student portal before joining.',
    attachments: [],
    status: 'Published',
  },
];

export const INITIAL_NAAC_REPORTS = [
  {
    academicYear: '2026-27',
    cohortEligible: 420,
    studentsPlaced: 346,
    placementRate: 82.4,
    totalOffers: 412,
    highestCTC: '₹24.0 LPA',
    averageCTC: '₹6.8 LPA',
    medianCTC: '₹6.2 LPA',
    companiesVisiting: 42,
    internshipCount: 310,
    branchMetrics: [
      { branch: 'Computer Science & Engineering', code: 'CSE', eligible: 160, placed: 152, offers: 198, placementRate: 95.0, avgCTC: '₹8.4 LPA', highestCTC: '₹24.0 LPA', medianCTC: '₹7.5 LPA' },
      { branch: 'Electronics & Communication', code: 'ECE', eligible: 90, placed: 78, offers: 94, placementRate: 86.7, avgCTC: '₹6.8 LPA', highestCTC: '₹14.0 LPA', medianCTC: '₹6.2 LPA' },
      { branch: 'Electrical & Electronics', code: 'EEE', eligible: 60, placed: 48, offers: 52, placementRate: 80.0, avgCTC: '₹5.8 LPA', highestCTC: '₹9.2 LPA', medianCTC: '₹5.5 LPA' },
      { branch: 'Mechanical Engineering', code: 'MECH', eligible: 55, placed: 41, offers: 42, placementRate: 74.5, avgCTC: '₹5.2 LPA', highestCTC: '₹8.0 LPA', medianCTC: '₹4.8 LPA' },
      { branch: 'Civil Engineering', code: 'CIVIL', eligible: 35, placed: 24, offers: 24, placementRate: 68.6, avgCTC: '₹4.8 LPA', highestCTC: '₹6.5 LPA', medianCTC: '₹4.5 LPA' },
      { branch: 'Master of Computer Applications', code: 'MCA', eligible: 20, placed: 18, offers: 22, placementRate: 90.0, avgCTC: '₹6.2 LPA', highestCTC: '₹10.5 LPA', medianCTC: '₹5.8 LPA' },
    ],
    documents: [
      { name: 'NAAC_Criterion_5_2_1_Placement_Summary_2026_27.pdf', size: '2.8 MB' },
      { name: 'Institutional_Placement_Census_Audit_Report.pdf', size: '4.1 MB' },
    ],
  },
  {
    academicYear: '2025-26',
    cohortEligible: 405,
    studentsPlaced: 338,
    placementRate: 83.5,
    totalOffers: 388,
    highestCTC: '₹22.0 LPA',
    averageCTC: '₹6.4 LPA',
    medianCTC: '₹5.8 LPA',
    companiesVisiting: 39,
    internshipCount: 295,
    branchMetrics: [
      { branch: 'Computer Science & Engineering', code: 'CSE', eligible: 155, placed: 148, offers: 182, placementRate: 95.5, avgCTC: '₹8.0 LPA', highestCTC: '₹22.0 LPA', medianCTC: '₹7.0 LPA' },
      { branch: 'Electronics & Communication', code: 'ECE', eligible: 85, placed: 75, offers: 88, placementRate: 88.2, avgCTC: '₹6.4 LPA', highestCTC: '₹12.5 LPA', medianCTC: '₹6.0 LPA' },
      { branch: 'Electrical & Electronics', code: 'EEE', eligible: 60, placed: 46, offers: 48, placementRate: 76.7, avgCTC: '₹5.5 LPA', highestCTC: '₹8.5 LPA', medianCTC: '₹5.0 LPA' },
      { branch: 'Mechanical Engineering', code: 'MECH', eligible: 55, placed: 39, offers: 40, placementRate: 70.9, avgCTC: '₹5.0 LPA', highestCTC: '₹7.8 LPA', medianCTC: '₹4.5 LPA' },
      { branch: 'Civil Engineering', code: 'CIVIL', eligible: 32, placed: 21, offers: 21, placementRate: 65.6, avgCTC: '₹4.5 LPA', highestCTC: '₹6.0 LPA', medianCTC: '₹4.2 LPA' },
      { branch: 'Master of Computer Applications', code: 'MCA', eligible: 18, placed: 16, offers: 18, placementRate: 88.9, avgCTC: '₹5.8 LPA', highestCTC: '₹9.0 LPA', medianCTC: '₹5.4 LPA' },
    ],
    documents: [
      { name: 'NAAC_Criterion_5_2_1_Verified_2025_26.pdf', size: '3.4 MB' },
    ],
  },
  {
    academicYear: '2024-25',
    cohortEligible: 390,
    studentsPlaced: 312,
    placementRate: 80.0,
    totalOffers: 350,
    highestCTC: '₹18.0 LPA',
    averageCTC: '₹5.8 LPA',
    medianCTC: '₹5.2 LPA',
    companiesVisiting: 35,
    internshipCount: 260,
    branchMetrics: [],
    documents: [],
  },
];

class PlacementStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(PLACEMENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          drives: parsed.drives || INITIAL_PLACEMENT_DRIVES,
          internships: parsed.internships || INITIAL_INTERNSHIPS,
          companies: parsed.companies || INITIAL_CORPORATE_PARTNERS,
          applications: parsed.applications || INITIAL_STUDENT_APPLICATIONS,
          offers: parsed.offers || INITIAL_JOB_OFFERS,
          training: parsed.training || INITIAL_TRAINING_PROGRAMS,
          notices: parsed.notices || INITIAL_PLACEMENT_NOTICES,
          naacReports: parsed.naacReports || INITIAL_NAAC_REPORTS,
        };
      }
    } catch (e) {
      console.warn('PlacementStore fallback to initial state:', e);
    }

    return {
      drives: INITIAL_PLACEMENT_DRIVES,
      internships: INITIAL_INTERNSHIPS,
      companies: INITIAL_CORPORATE_PARTNERS,
      applications: INITIAL_STUDENT_APPLICATIONS,
      offers: INITIAL_JOB_OFFERS,
      training: INITIAL_TRAINING_PROGRAMS,
      notices: INITIAL_PLACEMENT_NOTICES,
      naacReports: INITIAL_NAAC_REPORTS,
    };
  }

  save() {
    try {
      localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save PlacementStore to localStorage:', e);
    }
    this.notify();
    try {
      window.dispatchEvent(new CustomEvent('cms_placement_updated', { detail: { state: this.state } }));
    } catch (_) {}
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.state);
      } catch (e) {
        console.error('PlacementStore listener error:', e);
      }
    });
  }

  // ── 1. PLACEMENT DRIVES ──
  getDrives(filterStatus = null) {
    if (!filterStatus || filterStatus === 'ALL') return [...this.state.drives];
    return this.state.drives.filter(d => (d.status || '').toLowerCase() === filterStatus.toLowerCase());
  }

  getPublishedDrives() {
    return this.state.drives.filter(d => (d.status || '').toLowerCase() === 'published');
  }

  getDriveById(id) {
    return this.state.drives.find(d => d.id === id) || null;
  }

  addDrive(driveData) {
    const newDrive = {
      id: `DRIVE-2026-${Math.floor(10 + Math.random() * 90)}`,
      company: driveData.company,
      companyLogo: driveData.companyLogo || (driveData.company ? driveData.company.slice(0, 3).toUpperCase() : 'CO'),
      companyColor: driveData.companyColor || '#1a5276',
      companyWebsite: driveData.companyWebsite || '',
      industry: driveData.industry || 'Technology Solutions',
      recruiterContact: driveData.recruiterContact || '',
      companyDescription: driveData.companyDescription || '',
      role: driveData.role,
      jobDescription: driveData.jobDescription || '',
      jobLocation: driveData.jobLocation || 'Bhubaneswar / Pan-India',
      employmentType: driveData.employmentType || 'Full-time Regular',
      workMode: driveData.workMode || 'On-site',
      vacancies: Number(driveData.vacancies) || 20,
      requiredSkills: Array.isArray(driveData.requiredSkills)
        ? driveData.requiredSkills
        : (driveData.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
      packageOffered: driveData.packageOffered || `₹${driveData.packageLPA || 6.5} LPA`,
      packageLPA: Number(driveData.packageLPA) || 6.5,
      bond: driveData.bond || 'No Service Bond',
      eligibilityCriteria: {
        degree: driveData.degree || 'B.Tech / MCA',
        minCgpa: Number(driveData.minCgpa) || 6.5,
        maxBacklogs: Number(driveData.maxBacklogs) ?? 0,
        allowedBranches: Array.isArray(driveData.allowedBranches)
          ? driveData.allowedBranches
          : (driveData.allowedBranches || 'CSE, ECE').split(',').map(b => b.trim()).filter(Boolean),
        passingYear: driveData.passingYear || '2027',
        min10thPercent: Number(driveData.min10thPercent) || 60,
        min12thPercent: Number(driveData.min12thPercent) || 60,
        otherCriteria: driveData.otherCriteria || '',
      },
      recruitmentProcess: {
        applicationOpen: driveData.applicationOpen || new Date().toISOString().split('T')[0],
        applicationDeadline: driveData.applicationDeadline || '2026-11-20',
        prePlacementTalkDate: driveData.prePlacementTalkDate || '',
        aptitudeTestDate: driveData.aptitudeTestDate || '',
        technicalInterviewSchedule: driveData.technicalInterviewSchedule || '',
        hrInterviewSchedule: driveData.hrInterviewSchedule || '',
        finalSelectionDate: driveData.finalSelectionDate || '',
      },
      status: driveData.status || 'Published', // Default published so students immediately see
      registeredCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
      venue: driveData.venue || 'Campus Auditorium',
      attachments: driveData.attachments || [],
    };
    this.state.drives = [newDrive, ...this.state.drives];
    this.save();
    return newDrive;
  }

  updateDrive(id, updates) {
    this.state.drives = this.state.drives.map(d => {
      if (d.id === id) {
        return {
          ...d,
          ...updates,
          eligibilityCriteria: {
            ...d.eligibilityCriteria,
            ...(updates.eligibilityCriteria || {}),
          },
          recruitmentProcess: {
            ...d.recruitmentProcess,
            ...(updates.recruitmentProcess || {}),
          },
        };
      }
      return d;
    });
    this.save();
  }

  setDriveStatus(id, newStatus) {
    this.state.drives = this.state.drives.map(d => d.id === id ? { ...d, status: newStatus } : d);
    this.save();
  }

  deleteDrive(id) {
    this.state.drives = this.state.drives.filter(d => d.id !== id);
    this.save();
  }

  // ── 2. INTERNSHIPS ──
  getInternships(filterStatus = null) {
    if (!filterStatus || filterStatus === 'ALL') return [...this.state.internships];
    return this.state.internships.filter(i => (i.status || '').toLowerCase() === filterStatus.toLowerCase());
  }

  getPublishedInternships() {
    return this.state.internships.filter(i => (i.status || '').toLowerCase() === 'published');
  }

  getInternshipById(id) {
    return this.state.internships.find(i => i.id === id) || null;
  }

  addInternship(internshipData) {
    const newIntern = {
      id: `INT-2026-${Math.floor(10 + Math.random() * 90)}`,
      company: internshipData.company,
      role: internshipData.role || internshipData.title,
      title: internshipData.title || internshipData.role,
      logo: internshipData.logo || (internshipData.company ? internshipData.company.slice(0, 2).toUpperCase() : 'IN'),
      color: internshipData.color || '#2563eb',
      website: internshipData.website || '',
      description: internshipData.description || '',
      requiredSkills: Array.isArray(internshipData.requiredSkills)
        ? internshipData.requiredSkills
        : (internshipData.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
      eligibleBranches: Array.isArray(internshipData.eligibleBranches)
        ? internshipData.eligibleBranches
        : (internshipData.eligibleBranches || 'Computer Science & Engineering').split(',').map(s => s.trim()).filter(Boolean),
      eligibleYears: Array.isArray(internshipData.eligibleYears)
        ? internshipData.eligibleYears
        : (internshipData.eligibleYears || '3rd Year').split(',').map(s => s.trim()).filter(Boolean),
      minCgpa: Number(internshipData.minCgpa) || 6.5,
      duration: internshipData.duration || '2 Months',
      startDate: internshipData.startDate || '2026-11-15',
      endDate: internshipData.endDate || '2027-01-15',
      workMode: internshipData.workMode || 'Hybrid',
      location: internshipData.location || 'Bhubaneswar / Remote',
      isPaid: internshipData.isPaid !== false,
      stipend: internshipData.stipend || '₹10,000/month',
      applicationOpenDate: internshipData.applicationOpenDate || new Date().toISOString().split('T')[0],
      deadline: internshipData.deadline || '30 Nov 2026',
      openings: Number(internshipData.openings) || 5,
      applicationInstructions: internshipData.applicationInstructions || 'Submit resume through student portal.',
      requiredDocs: internshipData.requiredDocs || 'Resume, College Bonafide/NOC',
      externalUrl: internshipData.externalUrl || '',
      contactInfo: internshipData.contactInfo || '',
      terms: internshipData.terms || 'Standard attendance norms apply.',
      status: internshipData.status || 'Published',
      applicantCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
    };
    this.state.internships = [newIntern, ...this.state.internships];
    this.save();
    return newIntern;
  }

  updateInternship(id, updates) {
    this.state.internships = this.state.internships.map(i => i.id === id ? { ...i, ...updates } : i);
    this.save();
  }

  setInternshipStatus(id, newStatus) {
    this.state.internships = this.state.internships.map(i => i.id === id ? { ...i, status: newStatus } : i);
    this.save();
  }

  deleteInternship(id) {
    this.state.internships = this.state.internships.filter(i => i.id !== id);
    this.save();
  }

  // ── 3. CORPORATE PARTNERS ──
  getCompanies() {
    return [...this.state.companies];
  }

  addCompany(companyData) {
    const newComp = {
      id: `COMP-${Math.floor(10 + Math.random() * 90)}`,
      name: companyData.name,
      logo: companyData.logo || (companyData.name ? companyData.name.slice(0, 3).toUpperCase() : 'CO'),
      category: companyData.category || 'Information Technology',
      website: companyData.website || '',
      hrContact: companyData.hrContact || 'HR Recruitment Desk',
      email: companyData.email || 'campus@company.com',
      phone: companyData.phone || '+91 22 XXXXXXXX',
      officeLocation: companyData.officeLocation || 'Pan-India',
      packageRange: companyData.packageRange || '₹5.0 LPA - ₹10.0 LPA',
      tier: companyData.tier || 'Active Partner',
      mouStatus: companyData.mouStatus || 'Signed & Valid',
      totalHiredFromCampus: Number(companyData.totalHiredFromCampus) || 0,
      lastVisitDate: companyData.lastVisitDate || new Date().toISOString().split('T')[0],
      status: 'Active Partner',
      description: companyData.description || '',
      recruitmentHistory: companyData.recruitmentHistory || [],
    };
    this.state.companies = [newComp, ...this.state.companies];
    this.save();
    return newComp;
  }

  updateCompany(id, updates) {
    this.state.companies = this.state.companies.map(c => c.id === id ? { ...c, ...updates } : c);
    this.save();
  }

  deleteCompany(id) {
    this.state.companies = this.state.companies.filter(c => c.id !== id);
    this.save();
  }

  // ── 4. STUDENT APPLICATIONS & ATS PIPELINE ──
  getApplications(filterStage = null) {
    if (!filterStage || filterStage === 'ALL') return [...this.state.applications];
    return this.state.applications.filter(a => (a.stage || a.status || '').toLowerCase().includes(filterStage.toLowerCase()));
  }

  addStudentApplication(applicationData) {
    const newApp = {
      id: `APP-${Date.now().toString().slice(-5)}`,
      studentName: applicationData.studentName || 'Student Candidate',
      regNo: applicationData.regNo || applicationData.studentId || '2401432265',
      rollNo: applicationData.rollNo || '01',
      branch: applicationData.branch || 'CSE',
      deptCode: applicationData.deptCode || 'CSE',
      cgpa: Number(applicationData.cgpa) || 8.0,
      company: applicationData.company,
      jobRole: applicationData.jobRole || applicationData.role,
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      eligibilityStatus: 'Eligible',
      stage: 'Applied', // 'Applied', 'Under Review', 'Shortlisted', 'Aptitude Test', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected', 'Withdrawn'
      interviewSchedule: 'Under Review',
      finalResult: 'In Progress',
      roundScore: 'Verified',
      ctcOffered: applicationData.ctcOffered || 'As per drive specifications',
      internalNotes: applicationData.notes || 'Application submitted via student portal.',
      history: [
        { stage: 'Applied', date: new Date().toLocaleDateString('en-GB'), notes: 'Self-registered through Student Dashboard.' },
      ],
    };

    // Increment drive count
    const d = this.state.drives.find(drive => drive.company === applicationData.company || drive.id === applicationData.driveId);
    if (d) d.registeredCount = (d.registeredCount || 0) + 1;

    // Increment internship count
    const i = this.state.internships.find(intern => intern.company === applicationData.company || intern.id === applicationData.internshipId);
    if (i) i.applicantCount = (i.applicantCount || 0) + 1;

    this.state.applications = [newApp, ...this.state.applications];
    this.save();
    return newApp;
  }

  updateApplicationStage(id, { stage, status, notes, interviewSchedule, score, finalResult }) {
    this.state.applications = this.state.applications.map(app => {
      if (app.id === id) {
        const history = [...(app.history || [])];
        if (stage && stage !== app.stage) {
          history.push({
            stage,
            date: new Date().toLocaleDateString('en-GB'),
            notes: notes || `Stage updated to ${stage}`,
          });
        }
        return {
          ...app,
          stage: stage || app.stage,
          status: status || app.status || stage,
          internalNotes: notes || app.internalNotes,
          interviewSchedule: interviewSchedule || app.interviewSchedule,
          roundScore: score || app.roundScore,
          finalResult: finalResult || app.finalResult,
          history,
        };
      }
      return app;
    });
    this.save();
  }

  recordSelectionOutcome(id, outcome, ctcOffered = '') {
    this.state.applications = this.state.applications.map(app => {
      if (app.id === id) {
        const isSelected = outcome === 'Selected';
        const history = [...(app.history || [])];
        history.push({
          stage: isSelected ? 'Selected' : 'Rejected',
          date: new Date().toLocaleDateString('en-GB'),
          notes: isSelected ? `Candidate explicitly selected with compensation ${ctcOffered}` : 'Candidate rejected in review',
        });
        return {
          ...app,
          stage: isSelected ? 'Selected' : 'Rejected',
          finalResult: outcome,
          status: isSelected ? 'Offer Clearance Active' : 'Not Selected',
          ctcOffered: ctcOffered || app.ctcOffered,
          history,
        };
      }
      return app;
    });
    this.save();
  }

  // ── 5. JOB OFFERS & PACKAGES ──
  getOffers() {
    return [...this.state.offers];
  }

  addOffer(offerData) {
    const newOffer = {
      id: `OFFER-${Math.floor(10 + Math.random() * 90)}`,
      offerToken: `GIFT-OFFER-2026-${offerData.regNo || 'REG'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      studentName: offerData.studentName,
      regNo: offerData.regNo,
      department: offerData.department || 'B.Tech Engineering',
      company: offerData.company,
      role: offerData.role,
      packageOffered: offerData.packageOffered || offerData.ctc || '₹7.5 LPA',
      fixedSalary: offerData.fixedSalary || offerData.packageOffered || '₹6.5 LPA',
      variableSalary: offerData.variableSalary || '₹1.0 LPA',
      joiningDate: offerData.joiningDate || '2027-07-01',
      validityDeadline: offerData.validityDeadline || '2026-12-15',
      status: offerData.status || 'Offer Letter Released',
      issuedDate: new Date().toISOString().split('T')[0],
      letterAttachment: offerData.letterAttachment || `${(offerData.company || 'Offer').replace(/[^a-zA-Z0-9]/g, '_')}_LOI_${(offerData.studentName || 'Candidate').replace(/\s+/g, '_')}.pdf`,
      notes: offerData.notes || 'Formal employment letter issued by Training & Placement Directorate.',
    };
    this.state.offers = [newOffer, ...this.state.offers];
    this.save();
    return newOffer;
  }

  updateOfferStatus(id, newStatus) {
    this.state.offers = this.state.offers.map(o => o.id === id ? { ...o, status: newStatus } : o);
    this.save();
  }

  // ── 6. TRAINING & SKILL DEVELOPMENT ──
  getTrainingPrograms() {
    return [...this.state.training];
  }

  addTrainingProgram(trnData) {
    const newTrn = {
      id: `TRN-${Math.floor(10 + Math.random() * 90)}`,
      title: trnData.title,
      category: trnData.category || 'Aptitude Training',
      trainer: trnData.trainer || 'T&P Faculty Experts',
      duration: trnData.duration || '10 hours',
      schedule: trnData.schedule || 'Weekdays (04:30 PM – 06:30 PM)',
      venue: trnData.venue || 'Campus Auditorium Hall B',
      targetBranches: Array.isArray(trnData.targetBranches)
        ? trnData.targetBranches
        : (trnData.targetBranches || 'All Engineering Disciplines').split(',').map(s => s.trim()),
      targetYears: Array.isArray(trnData.targetYears)
        ? trnData.targetYears
        : (trnData.targetYears || 'Semester 5, Semester 7').split(',').map(s => s.trim()),
      registrationDeadline: trnData.registrationDeadline || '2026-11-10',
      totalSeats: Number(trnData.totalSeats) || 150,
      enrolledCount: 0,
      status: trnData.status || 'Upcoming',
      progress: 0,
      description: trnData.description || '',
      materials: trnData.materials || [],
    };
    this.state.training = [newTrn, ...this.state.training];
    this.save();
    return newTrn;
  }

  updateTrainingProgram(id, updates) {
    this.state.training = this.state.training.map(t => t.id === id ? { ...t, ...updates } : t);
    this.save();
  }

  deleteTrainingProgram(id) {
    this.state.training = this.state.training.filter(t => t.id !== id);
    this.save();
  }

  // ── 7. PLACEMENT NOTICES ──
  getNotices() {
    return [...this.state.notices];
  }

  addNotice(noticeData) {
    const newNotice = {
      id: `NOTIF-PL-${Math.floor(10 + Math.random() * 90)}`,
      title: noticeData.title,
      category: noticeData.category || 'Campus Recruitment Notice',
      publishDate: noticeData.publishDate || new Date().toISOString().split('T')[0],
      expiryDate: noticeData.expiryDate || '2026-12-31',
      targetBranches: Array.isArray(noticeData.targetBranches)
        ? noticeData.targetBranches
        : (noticeData.targetBranches || 'All Branches').split(',').map(b => b.trim()),
      isUrgent: !!noticeData.isUrgent,
      content: noticeData.content,
      attachments: noticeData.attachments || [],
      status: noticeData.status || 'Published',
    };
    this.state.notices = [newNotice, ...this.state.notices];
    this.save();
    return newNotice;
  }

  updateNotice(id, updates) {
    this.state.notices = this.state.notices.map(n => n.id === id ? { ...n, ...updates } : n);
    this.save();
  }

  deleteNotice(id) {
    this.state.notices = this.state.notices.filter(n => n.id !== id);
    this.save();
  }

  // ── 8. NAAC REPORTS ──
  getNaacReports() {
    return [...this.state.naacReports];
  }

  // ── 9. ANALYTICS & STATS ──
  getOverviewMetrics() {
    const drives = this.state.drives;
    const publishedDrives = drives.filter(d => (d.status || '').toLowerCase() === 'published');
    const companies = this.state.companies;
    const applications = this.state.applications;
    const offers = this.state.offers;
    const internships = this.state.internships;

    const totalRegisteredStudents = 420;
    const eligibleForPlacements = 380;
    const studentsPlaced = 346;
    const studentsWithInternships = 295;
    const activeDrivesCount = publishedDrives.length;
    const upcomingDrivesCount = publishedDrives.filter(d => new Date(d.recruitmentProcess?.applicationDeadline || d.driveDate) >= new Date()).length;
    const pendingTasksCount = applications.filter(a => a.stage === 'Applied' || a.stage === 'Under Review').length;

    const placementRate = Math.round((studentsPlaced / eligibleForPlacements) * 1000) / 10;
    const averageCTC = '₹6.8 LPA';
    const highestCTC = '₹24.0 LPA';
    const medianCTC = '₹6.2 LPA';

    return {
      totalRegisteredStudents,
      eligibleForPlacements,
      activeDrivesCount,
      upcomingDrivesCount,
      studentsPlaced,
      studentsWithInternships,
      totalCompanies: companies.length,
      pendingTasksCount,
      placementRate,
      averageCTC,
      highestCTC,
      medianCTC,
      totalOffers: offers.length > 400 ? offers.length : 412,
    };
  }
}

export const placementStore = new PlacementStore();
export default placementStore;
