import { useState, useEffect, useMemo } from 'react'
import {
  Award,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
  Video,
  X,
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Send,
  Bookmark,
  BookmarkCheck,
  Share2,
  UploadCloud,
  ChevronDown,
  Info,
  DollarSign,
  IndianRupee,
  Phone,
  Mail,
  Globe,
  Bell
} from 'lucide-react'
import './PlacementPage.css'
import placementStore from '../services/placementStore.js'
import { api } from '../services/api.js'
import {
  downloadJobDescriptionPdf,
  downloadPlacementOfferLetterPdf,
  downloadPlacementRegistrationSlipPdf
} from '../utils/pdfGenerator.js'

// =========================================================================
// DEFAULT DATA & FALLBACK CONSTANTS
// =========================================================================
const DEFAULT_DRIVES = [
  {
    id: 'DRIVE-2026-01',
    company: 'Cisco Systems India',
    companyName: 'Cisco Systems India',
    companyLogo: 'CS',
    companyColor: '#005073',
    companyWebsite: 'https://www.cisco.com',
    industry: 'Product Engineering, Cloud & Networking',
    tier: 'Super Dream Recruiter',
    role: 'Associate Network & Software Engineer',
    roleTitle: 'Associate Network & Software Engineer',
    jobDescription: 'Architect distributed cloud routing protocols, optimize high-throughput packet streams, and develop automated telemetry systems in C/C++ and Python.',
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
      applicationDeadline: '2026-11-25',
      prePlacementTalkDate: '2026-11-26 (10:00 AM, Auditorium)',
      aptitudeTestDate: '2026-11-27 (02:00 PM, Online Lab)',
      technicalInterviewSchedule: '2026-11-28 (09:00 AM, Virtual)',
      hrInterviewSchedule: '2026-11-29 (11:00 AM, Executive Boardroom)',
      finalSelectionDate: '2026-11-30',
    },
    status: 'Registration Open',
    registeredCount: 84,
    shortlistedCount: 32,
    selectedCount: 6,
    venue: 'Campus Main Auditorium & Webex Virtual Arena',
  },
  {
    id: 'DRIVE-2026-02',
    company: 'Tata Consultancy Services',
    companyName: 'Tata Consultancy Services',
    companyLogo: 'TCS',
    companyColor: '#1a5276',
    companyWebsite: 'https://www.tcs.com',
    industry: 'Tier-1 IT & Global Consulting Services',
    tier: 'Dream Recruiter',
    role: 'Digital Systems Engineer & Innovator',
    roleTitle: 'Digital Systems Engineer & Innovator',
    jobDescription: 'Develop next-generation enterprise applications utilizing cloud-native microservices, AI analytics, and enterprise data models.',
    jobLocation: 'Bhubaneswar / Pan-India',
    employmentType: 'Full-time Regular',
    workMode: 'On-site',
    vacancies: 90,
    requiredSkills: ['Java / Python', 'SQL', 'Data Structures', 'Cloud Fundamentals', 'Problem Solving'],
    packageOffered: '₹7.2 LPA',
    packageLPA: 7.2,
    bond: '1 Year Service Commitment',
    eligibilityCriteria: {
      degree: 'B.Tech / MCA',
      minCgpa: 6.5,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
      passingYear: '2027',
      min10thPercent: 60,
      min12thPercent: 60,
      otherCriteria: 'TCS NQT National Qualifier Test score mandatory.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-10',
      applicationDeadline: '2026-11-20',
      prePlacementTalkDate: '2026-11-21 (11:00 AM, Virtual)',
      aptitudeTestDate: '2026-11-23 (TCS iON Center)',
      technicalInterviewSchedule: '2026-11-25 (09:30 AM)',
      hrInterviewSchedule: '2026-11-26 (02:00 PM)',
      finalSelectionDate: '2026-11-28',
    },
    status: 'Registration Open',
    registeredCount: 310,
    shortlistedCount: 180,
    selectedCount: 42,
    venue: 'Campus Computing Complex & Hall A',
  },
  {
    id: 'DRIVE-2026-03',
    company: 'Cognizant Technology Solutions',
    companyName: 'Cognizant Technology Solutions',
    companyLogo: 'CT',
    companyColor: '#005eb8',
    companyWebsite: 'https://www.cognizant.com',
    industry: 'Global Digital Engineering & Cloud Services',
    tier: 'Dream Recruiter',
    role: 'Programmer Analyst Trainee (GenC Next)',
    roleTitle: 'Programmer Analyst Trainee (GenC Next)',
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
      applicationOpen: '2026-10-15',
      applicationDeadline: '2026-12-05',
      prePlacementTalkDate: '2026-12-06 (10:00 AM)',
      aptitudeTestDate: '2026-12-08 (Automated Virtual Lab)',
      technicalInterviewSchedule: '2026-12-10 (10:00 AM)',
      hrInterviewSchedule: '2026-12-12 (02:00 PM)',
      finalSelectionDate: '2026-12-15',
    },
    status: 'Upcoming Drive',
    registeredCount: 220,
    shortlistedCount: 110,
    selectedCount: 28,
    venue: 'Campus Computing Center Lab 1-4',
  },
  {
    id: 'DRIVE-2026-04',
    company: 'Infosys Limited',
    companyName: 'Infosys Limited',
    companyLogo: 'IF',
    companyColor: '#007DC6',
    companyWebsite: 'https://www.infosys.com',
    industry: 'Digital Services & Consulting',
    tier: 'Dream Recruiter',
    role: 'Specialist Programmer & Systems Engineer',
    roleTitle: 'Specialist Programmer & Systems Engineer',
    jobDescription: 'Algorithmic computing, AI systems integration, core software engineering, and large-scale cloud applications.',
    jobLocation: 'Bhubaneswar / Mysore / Bangalore',
    employmentType: 'Full-time Regular',
    workMode: 'Hybrid',
    vacancies: 75,
    requiredSkills: ['C++', 'Java', 'Algorithms', 'Databases', 'Cloud Tech'],
    packageOffered: '₹9.5 LPA',
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
      applicationOpen: '2026-10-01',
      applicationDeadline: '2026-10-28', // Expired drive demonstration
      prePlacementTalkDate: '2026-10-30',
      aptitudeTestDate: '2026-11-02',
      technicalInterviewSchedule: '2026-11-06',
      hrInterviewSchedule: '2026-11-08',
      finalSelectionDate: '2026-11-12',
    },
    status: 'Closed',
    registeredCount: 280,
    shortlistedCount: 95,
    selectedCount: 30,
    venue: 'Virtual Assessment Arena & Campus Tech Block',
  },
  {
    id: 'DRIVE-2026-05',
    company: 'L&T Technology Services',
    companyName: 'L&T Technology Services',
    companyLogo: 'LT',
    companyColor: '#c0392b',
    companyWebsite: 'https://www.ltts.com',
    industry: 'Engineering R&D & Embedded Systems',
    tier: 'Core Engineering',
    role: 'Graduate Engineer Trainee (R&D)',
    roleTitle: 'Graduate Engineer Trainee (R&D)',
    jobDescription: 'Work on embedded firmware, CAD/CAE simulations, industrial IoT telemetry, and smart sensor telemetry.',
    jobLocation: 'Baroda / Mumbai / Bangalore',
    employmentType: 'Full-time Regular',
    workMode: 'On-site',
    vacancies: 40,
    requiredSkills: ['C/Embedded C', 'MATLAB', 'CAD Modeling', 'Microcontrollers', 'IoT'],
    packageOffered: '₹6.5 LPA',
    packageLPA: 6.5,
    bond: '2 Years Service Agreement',
    eligibilityCriteria: {
      degree: 'B.Tech',
      minCgpa: 7.0,
      maxBacklogs: 0,
      allowedBranches: ['ECE', 'EEE', 'MECH', 'CSE'],
      passingYear: '2027',
      min10thPercent: 65,
      min12thPercent: 65,
      otherCriteria: 'Core electrical & mechanical domain aptitude test mandatory.',
    },
    recruitmentProcess: {
      applicationOpen: '2026-10-20',
      applicationDeadline: '2026-12-01',
      prePlacementTalkDate: '2026-12-02',
      aptitudeTestDate: '2026-12-04',
      technicalInterviewSchedule: '2026-12-07',
      hrInterviewSchedule: '2026-12-09',
      finalSelectionDate: '2026-12-12',
    },
    status: 'Registration Open',
    registeredCount: 140,
    shortlistedCount: 65,
    selectedCount: 18,
    venue: 'Mechanical & Electronics Seminar Hall',
  }
]

const DEFAULT_COURSES = [
  {
    id: 'TRN-101',
    title: 'Data Structures & Algorithms Mastery (LeetCode Track)',
    category: 'Technical Programming',
    provider: 'T&P Cell · Industry Experts',
    trainer: 'Er. S. R. Patnaik (Ex-Amazon)',
    duration: '40 Hours · 20 Modules',
    enrolled: true,
    progress: 75,
    status: 'In Progress',
    totalSeats: 200,
    enrolledCount: 168,
    schedule: 'Mon, Wed, Fri (05:00 PM – 06:30 PM)',
    venue: 'Computing Complex Lab 2 & LMS Virtual',
    description: 'Comprehensive study of arrays, linked lists, dynamic programming, graph algorithms, and system architecture questions.'
  },
  {
    id: 'TRN-102',
    title: 'Full Stack Java Spring Boot & Microservices Bootcamp',
    category: 'Technical Programming',
    provider: 'T&P Innovation Labs',
    trainer: 'Dr. K. R. Mohapatra',
    duration: '35 Hours · 14 Sessions',
    enrolled: true,
    progress: 40,
    status: 'In Progress',
    totalSeats: 150,
    enrolledCount: 132,
    schedule: 'Tue, Thu (04:30 PM – 06:30 PM)',
    venue: 'Campus Innovation Center Lab 4',
    description: 'Build enterprise-grade REST APIs, JPA Hibernate persistence models, and cloud-native microservices.'
  },
  {
    id: 'TRN-103',
    title: 'Quantitative Aptitude & Logical Reasoning Masterclass',
    category: 'Aptitude & Reasoning',
    provider: 'T&P Cell Corporate Trainer',
    trainer: 'Mr. Alok Panda (Lead Aptitude Trainer)',
    duration: '30 Hours · 15 Sessions',
    enrolled: true,
    progress: 100,
    status: 'Completed',
    totalSeats: 300,
    enrolledCount: 294,
    schedule: 'Sat & Sun (10:00 AM – 12:30 PM)',
    venue: 'Main Auditorium Hall A',
    description: 'Fast-track arithmetic math tricks, probability, permutations, syllogisms, and data interpretation.'
  },
  {
    id: 'TRN-104',
    title: 'Corporate Communication, GD Mastery & HR Interview Readiness',
    category: 'Soft Skills',
    provider: 'Department of Humanities & T&P',
    trainer: 'Prof. Snigdha Sen',
    duration: '18 Hours · 9 Sessions',
    enrolled: false,
    progress: 0,
    status: 'Upcoming',
    totalSeats: 120,
    enrolledCount: 88,
    schedule: 'Saturdays (02:00 PM – 04:30 PM)',
    venue: 'Executive Seminar Hall Room 102',
    description: 'Group discussion moderation techniques, body language, accent neutralization, and answering behavioral HR questions.'
  },
  {
    id: 'TRN-105',
    title: 'ATS Resume Studio & Technical Portfolio Workshop',
    category: 'Career Tools',
    provider: 'T&P Directorate',
    trainer: 'Placement Mentorship Council',
    duration: '6 Hours · 2 Workshops',
    enrolled: true,
    progress: 100,
    status: 'Completed',
    totalSeats: 250,
    enrolledCount: 245,
    schedule: 'Self-Paced with 1-on-1 Mentorship',
    venue: 'Virtual LMS Studio',
    description: 'Creating ATS-parseable resumes, LaTeX CV generation, GitHub project profiling, and LinkedIn optimization.'
  }
]

export default function PlacementPage({ account }) {
  // ── Authenticated Student Record ──
  const student = useMemo(() => {
    return {
      name: account?.name || 'BISHNU PRASAD SAHOO',
      rollNumber: account?.rollNumber || account?.registrationNumber || '2401432265',
      registrationNumber: account?.registrationNumber || account?.rollNumber || '2401432265',
      department: account?.department || account?.branch || 'Computer Science & Engineering',
      deptCode: account?.deptCode || 'CSE',
      semester: account?.semester || 'Semester 5',
      batch: account?.batch || '2023–2027',
      cgpa: Number(account?.cgpa ?? 8.42),
      attendance: Number(account?.attendance ?? 92),
      activeBacklogs: Number(account?.activeBacklogs ?? 0),
      tenthPercent: Number(account?.tenthPercent ?? 88.5),
      twelfthPercent: Number(account?.twelfthPercent ?? 86.2),
      degree: account?.degree || 'B.Tech',
      email: account?.email || 'student@apnacampus.edu.in',
      phone: account?.phone || '+91 98610 23010',
    }
  }, [account])

  // ── Navigation & Tabs ──
  const [activeTab, setActiveTab] = useState('drives') // 'drives' | 'applications' | 'courses' | 'records' | 'notices'
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026–27')

  // ── Data States ──
  const [drivesList, setDrivesList] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [myOffers, setMyOffers] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [noticesList, setNoticesList] = useState([])
  const [savedDrives, setSavedDrives] = useState({})
  const [statsData, setStatsData] = useState({
    eligibleCohort: 420,
    placedStudents: 346,
    placementRate: 82.4,
    averageCTC: 7.4,
    highestCTC: 24.0,
    totalOffers: 412,
    totalRecruiters: 86,
    activeDrivesCount: 4,
    upcomingDrivesCount: 3,
  })

  // ── Search, Filter & Sort States ──
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPackageFilter, setSelectedPackageFilter] = useState('ALL')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL')
  const [selectedMinCgpaFilter, setSelectedMinCgpaFilter] = useState('ALL')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('ALL')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('deadline') // 'deadline' | 'package_desc' | 'package_asc' | 'company'

  // ── Modal States ──
  const [selectedDriveModal, setSelectedDriveModal] = useState(null)
  const [showApplyWizard, setShowApplyWizard] = useState(false)
  const [applyStep, setApplyStep] = useState(1) // 1 to 7
  const [applyingDrive, setApplyingDrive] = useState(null)
  const [selectedResume, setSelectedResume] = useState('Primary Technical Resume (Full Stack & DSA) — Verified ✓')
  const [uploadedDocName, setUploadedDocName] = useState('Autonomous_Grade_Sheet_Sem1-4.pdf')
  const [declaration1, setDeclaration1] = useState(false)
  const [declaration2, setDeclaration2] = useState(false)
  const [isSubmittingApp, setIsSubmittingApp] = useState(false)
  const [recentApplicationResult, setRecentApplicationResult] = useState(null)

  // Interview & Offer Modals
  const [selectedInterviewModal, setSelectedInterviewModal] = useState(null)
  const [selectedOfferModal, setSelectedOfferModal] = useState(null)
  const [selectedCourseModal, setSelectedCourseModal] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const triggerToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4500)
  }

  // ── 1. Initial Data Fetching & Reactive Sync ──
  useEffect(() => {
    loadPlacementData()

    const handleSync = () => {
      loadPlacementData()
    }
    const unsub = placementStore.subscribe(handleSync)
    window.addEventListener('cms_placement_updated', handleSync)

    return () => {
      unsub()
      window.removeEventListener('cms_placement_updated', handleSync)
    }
  }, [student.rollNumber])

  const loadPlacementData = async () => {
    // 1. Fetch drives
    try {
      const driveRes = await api.getPlacementDrives()
      if (driveRes && driveRes.success && Array.isArray(driveRes.data) && driveRes.data.length > 0) {
        setDrivesList(driveRes.data)
      } else {
        const storeDrives = placementStore.getPublishedDrives()
        setDrivesList(storeDrives.length > 0 ? storeDrives : DEFAULT_DRIVES)
      }
    } catch {
      const storeDrives = placementStore.getPublishedDrives()
      setDrivesList(storeDrives.length > 0 ? storeDrives : DEFAULT_DRIVES)
    }

    // 2. Fetch student's own applications
    try {
      const appRes = await api.getStudentPlacementApplications(student.rollNumber)
      if (appRes && appRes.success && Array.isArray(appRes.data)) {
        setMyApplications(appRes.data)
      } else {
        const storeApps = placementStore.getApplications()
        const userApps = storeApps.filter(
          a => a.studentRoll === student.rollNumber || a.regNo === student.rollNumber || a.rollNo === student.rollNumber
        )
        setMyApplications(userApps)
      }
    } catch {
      const storeApps = placementStore.getApplications()
      const userApps = storeApps.filter(
        a => a.studentRoll === student.rollNumber || a.regNo === student.rollNumber || a.rollNo === student.rollNumber
      )
      setMyApplications(userApps)
    }

    // 3. Fetch student offers
    try {
      const offerRes = await api.getStudentPlacementOffers(student.rollNumber)
      if (offerRes && offerRes.success && Array.isArray(offerRes.data)) {
        setMyOffers(offerRes.data)
      } else {
        const storeOffers = placementStore.getOffers()
        const userOffers = storeOffers.filter(
          o => o.regNo === student.rollNumber || o.studentRoll === student.rollNumber
        )
        setMyOffers(userOffers)
      }
    } catch {
      const storeOffers = placementStore.getOffers()
      const userOffers = storeOffers.filter(
        o => o.regNo === student.rollNumber || o.studentRoll === student.rollNumber
      )
      setMyOffers(userOffers)
    }

    // 4. Fetch dashboard stats
    try {
      const statsRes = await api.getPlacementDashboardStats()
      if (statsRes && statsRes.success && statsRes.data) {
        setStatsData(prev => ({ ...prev, ...statsRes.data }))
      }
    } catch {
      // Retain standard stats
    }

    // 5. Training programs & notices
    const storeTrn = placementStore.getTrainingPrograms()
    setCoursesList(storeTrn.length > 0 ? storeTrn : DEFAULT_COURSES)

    const storeNotices = placementStore.getNotices()
    setNoticesList(storeNotices)
  }

  // ── 2. Automatic Eligibility Evaluator ──
  const evaluateStudentEligibility = (drive) => {
    if (!drive) return { isEligible: false, reasons: ['Drive specifications not found.'], passed: [] }

    const reasons = []
    const passed = []

    const minCgpa = Number(drive.eligibilityCriteria?.minCgpa ?? drive.minCgpa ?? 6.5)
    const allowedBranches = drive.eligibilityCriteria?.allowedBranches || drive.eligibleBranches || ['CSE', 'ECE']
    const maxBacklogs = Number(drive.eligibilityCriteria?.maxBacklogs ?? 0)

    // CGPA validation
    if (student.cgpa >= minCgpa) {
      passed.push(`CGPA requirement satisfied (${student.cgpa} >= ${minCgpa})`)
    } else {
      reasons.push(`Your CGPA of ${student.cgpa} is below the company requirement of ${minCgpa}`)
    }

    // Branch validation
    const branchMatch = allowedBranches.some(
      b => b.toUpperCase() === student.deptCode.toUpperCase() ||
           student.department.toUpperCase().includes(b.toUpperCase())
    )
    if (branchMatch) {
      passed.push(`Academic department (${student.deptCode}) is an eligible discipline`)
    } else {
      reasons.push(`Department ${student.deptCode} is not listed in eligible branches (${allowedBranches.join(', ')})`)
    }

    // Active Backlogs validation
    if (student.activeBacklogs <= maxBacklogs) {
      passed.push(`Active backlogs check passed (${student.activeBacklogs} backlogs)`)
    } else {
      reasons.push(`Company requires max ${maxBacklogs} backlogs. You have ${student.activeBacklogs} active backlogs.`)
    }

    // Attendance clearance (75% threshold)
    if (student.attendance >= 75) {
      passed.push(`Institutional attendance clearance verified (${student.attendance}% >= 75%)`)
    } else {
      reasons.push(`Attendance (${student.attendance}%) is below mandatory institutional 75% placement clearance`)
    }

    // Expired check
    const deadline = drive.recruitmentProcess?.applicationDeadline || drive.driveDate
    const isClosed = drive.status === 'Closed' || (deadline && new Date(deadline) < new Date(new Date().toDateString()))
    if (isClosed) {
      reasons.push('Application window for this placement drive has officially expired.')
    } else {
      passed.push('Application registration window is open')
    }

    return {
      isEligible: reasons.length === 0,
      reasons,
      passed,
      isClosed,
    }
  }

  // ── 3. Registered Application Lookup ──
  const isAlreadyRegistered = (drive) => {
    const comp = drive.company || drive.companyName
    return myApplications.some(
      app => app.driveId === drive.id ||
             (app.company && comp && app.company.toLowerCase().includes(comp.toLowerCase())) ||
             (comp && app.company && comp.toLowerCase().includes(app.company.toLowerCase()))
    )
  }

  const getApplicationForDrive = (drive) => {
    const comp = drive.company || drive.companyName
    return myApplications.find(
      app => app.driveId === drive.id ||
             (app.company && comp && app.company.toLowerCase().includes(comp.toLowerCase())) ||
             (comp && app.company && comp.toLowerCase().includes(app.company.toLowerCase()))
    )
  }

  // ── 4. Filtering, Searching & Sorting of Drives ──
  const filteredDrives = useMemo(() => {
    return drivesList
      .filter((d) => {
        const compName = (d.company || d.companyName || '').toLowerCase()
        const roleName = (d.role || d.roleTitle || '').toLowerCase()
        const skills = Array.isArray(d.requiredSkills) ? d.requiredSkills.join(' ').toLowerCase() : ''
        const loc = (d.jobLocation || '').toLowerCase()
        const q = searchQuery.toLowerCase().trim()

        // 1. Search Query
        if (q && !compName.includes(q) && !roleName.includes(q) && !skills.includes(q) && !loc.includes(q)) {
          return false
        }

        // 2. Package Filter
        const pkg = Number(d.packageLPA || d.packageOffered?.replace(/[^0-9.]/g, '') || 6)
        if (selectedPackageFilter === 'UNDER_5' && pkg >= 5) return false
        if (selectedPackageFilter === '5_TO_10' && (pkg < 5 || pkg > 10)) return false
        if (selectedPackageFilter === '10_TO_15' && (pkg < 10 || pkg > 15)) return false
        if (selectedPackageFilter === 'ABOVE_15' && pkg < 15) return false

        // 3. Role Filter
        if (selectedRoleFilter !== 'ALL') {
          if (!roleName.includes(selectedRoleFilter.toLowerCase())) return false
        }

        // 4. Branch Filter
        if (selectedBranchFilter !== 'ALL') {
          const branches = d.eligibilityCriteria?.allowedBranches || d.eligibleBranches || []
          if (!branches.some(b => b.toUpperCase() === selectedBranchFilter.toUpperCase())) return false
        }

        // 5. Min CGPA Filter
        if (selectedMinCgpaFilter !== 'ALL') {
          const reqCgpa = Number(d.eligibilityCriteria?.minCgpa || d.minCgpa || 6)
          const target = Number(selectedMinCgpaFilter)
          if (reqCgpa > target) return false
        }

        // 6. Location Filter
        if (selectedLocationFilter !== 'ALL') {
          if (!loc.includes(selectedLocationFilter.toLowerCase())) return false
        }

        // 7. Employment Type Filter
        if (selectedTypeFilter !== 'ALL') {
          const type = (d.employmentType || '').toLowerCase()
          if (!type.includes(selectedTypeFilter.toLowerCase())) return false
        }

        // 8. Status Filter
        const deadline = d.recruitmentProcess?.applicationDeadline || d.driveDate
        const isClosed = d.status === 'Closed' || (deadline && new Date(deadline) < new Date(new Date().toDateString()))
        if (selectedStatusFilter === 'OPEN' && (isClosed || d.status === 'Upcoming Drive')) return false
        if (selectedStatusFilter === 'UPCOMING' && d.status !== 'Upcoming Drive') return false
        if (selectedStatusFilter === 'CLOSED' && !isClosed) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'package_desc') {
          const pA = Number(a.packageLPA || a.packageOffered?.replace(/[^0-9.]/g, '') || 0)
          const pB = Number(b.packageLPA || b.packageOffered?.replace(/[^0-9.]/g, '') || 0)
          return pB - pA
        }
        if (sortBy === 'package_asc') {
          const pA = Number(a.packageLPA || a.packageOffered?.replace(/[^0-9.]/g, '') || 0)
          const pB = Number(b.packageLPA || b.packageOffered?.replace(/[^0-9.]/g, '') || 0)
          return pA - pB
        }
        if (sortBy === 'company') {
          const cA = a.company || a.companyName || ''
          const cB = b.company || b.companyName || ''
          return cA.localeCompare(cB)
        }
        // Default: deadline earliest
        const dA = new Date(a.recruitmentProcess?.applicationDeadline || a.driveDate || '2099-12-31')
        const dB = new Date(b.recruitmentProcess?.applicationDeadline || b.driveDate || '2099-12-31')
        return dA - dB
      })
  }, [
    drivesList,
    searchQuery,
    selectedPackageFilter,
    selectedRoleFilter,
    selectedBranchFilter,
    selectedMinCgpaFilter,
    selectedLocationFilter,
    selectedTypeFilter,
    selectedStatusFilter,
    sortBy,
  ])

  // ── 5. Application Registration Handler ──
  const startRegistration = (drive) => {
    setSelectedDriveModal(null)
    setApplyingDrive(drive)
    setApplyStep(1)
    setDeclaration1(false)
    setDeclaration2(false)
    setShowApplyWizard(true)
  }

  const handleFinalSubmitApplication = async () => {
    if (!declaration1 || !declaration2) {
      triggerToast('Please accept both student declaration confirmations to submit.')
      return
    }

    setIsSubmittingApp(true)
    try {
      const payload = {
        driveId: applyingDrive.id,
        studentRoll: student.rollNumber,
        studentName: student.name,
        branch: student.deptCode,
        cgpa: student.cgpa,
        resumeTitle: selectedResume,
        documents: [{ name: uploadedDocName, type: 'Academic Grade Sheet' }],
        notes: `Applied for ${applyingDrive.roleTitle || applyingDrive.role} at ${applyingDrive.companyName || applyingDrive.company}.`,
      }

      // Try server-side live registration
      let appRecord = null
      try {
        const res = await api.registerPlacementApplication(payload)
        if (res && res.success && res.data) {
          appRecord = res.data
        }
      } catch (err) {
        console.warn('Backend live register note, falling back to reactive store:', err.message)
      }

      // Sync to centralized placementStore
      if (!appRecord) {
        appRecord = placementStore.addStudentApplication({
          driveId: applyingDrive.id,
          studentName: student.name,
          regNo: student.rollNumber,
          rollNo: student.rollNumber,
          branch: student.deptCode,
          deptCode: student.deptCode,
          cgpa: student.cgpa,
          company: applyingDrive.companyName || applyingDrive.company,
          jobRole: applyingDrive.roleTitle || applyingDrive.role,
          ctcOffered: applyingDrive.packageOffered || `₹${applyingDrive.packageLPA} LPA`,
          notes: payload.notes,
        })
      }

      setRecentApplicationResult(appRecord)
      setApplyStep(7) // Confirmation screen
      triggerToast(`Application ID ${appRecord.applicationId || appRecord.id} generated! You are registered for ${applyingDrive.companyName || applyingDrive.company}.`)
      await loadPlacementData()
    } catch (err) {
      triggerToast(err.message || 'Failed to submit application. Please verify criteria.')
    } finally {
      setIsSubmittingApp(false)
    }
  }

  // ── 6. Offer Decision Handlers ──
  const handleOfferDecision = async (offer, action) => {
    try {
      await api.actionPlacementOffer(offer.id, action, `Student action: ${action}`)
      placementStore.updateOfferStatus(offer.id, action === 'ACCEPT_OFFER' ? 'Offer Accepted' : 'Offer Declined')
      triggerToast(`You have successfully ${action === 'ACCEPT_OFFER' ? 'accepted' : 'declined'} the offer from ${offer.company}.`)
      setSelectedOfferModal(null)
      loadPlacementData()
    } catch {
      placementStore.updateOfferStatus(offer.id, action === 'ACCEPT_OFFER' ? 'Offer Accepted' : 'Offer Declined')
      triggerToast(`Offer response recorded: ${action === 'ACCEPT_OFFER' ? 'Accepted' : 'Declined'}`)
      setSelectedOfferModal(null)
      loadPlacementData()
    }
  }

  // ── 7. Toggle Save / Bookmark ──
  const toggleSaveDrive = (id, e) => {
    if (e) e.stopPropagation()
    setSavedDrives(prev => {
      const next = { ...prev, [id]: !prev[id] }
      triggerToast(next[id] ? 'Drive saved to your bookmarks!' : 'Drive removed from bookmarks.')
      return next
    })
  }

  return (
    <div className="placement-page-container">
      {/* ── TOAST ALERT ── */}
      {toastMsg && (
        <div className="placement-floating-toast" role="alert">
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <div className="placement-top-header">
        <div className="header-left">
          <div className="placement-kicker-tag">
            <TrendingUp size={13} />
            <span>DIRECTORATE OF TRAINING &amp; PLACEMENT &bull; APNA CAMPUS</span>
          </div>
          <h1 className="placement-page-title">Campus Placement &amp; Career Development</h1>
          <p className="placement-page-sub">
            Corporate recruitment drives, automated eligibility validation, live ATS application tracking &amp; skill roadmaps.
          </p>
        </div>

        {/* Authenticated Candidate Profile Capsule */}
        <div className="placement-candidate-capsule">
          <div className="candidate-avatar-wrap">
            <div className="candidate-avatar">
              {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
          </div>
          <div className="candidate-details">
            <div className="candidate-name-row">
              <strong>{student.name}</strong>
              <span className="candidate-badge-verified">
                <ShieldCheck size={12} /> Verified Candidate
              </span>
            </div>
            <div className="candidate-academic-row">
              <span>{student.deptCode} &bull; {student.rollNumber}</span>
              <span className="dot-divider">&bull;</span>
              <span className="candidate-cgpa-pill">
                <Star size={11} className="text-amber" /> CGPA: <strong>{student.cgpa.toFixed(2)}</strong>
              </span>
              <span className="dot-divider">&bull;</span>
              <span className="candidate-attendance-pill">
                <CheckCircle2 size={11} className="text-emerald" /> Att: <strong>{student.attendance}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BROADCAST ANNOUNCEMENT BANNER ── */}
      <div className="placement-broadcast-banner">
        <div className="broadcast-icon-box">
          <Briefcase size={20} />
        </div>
        <div className="broadcast-text">
          <strong>📢 Official Campus Placement Broadcast Channel &bull; Autumn 2026 Season</strong>
          <p>
            Super Dream &amp; Dream recruitment drives are active for B.Tech &amp; MCA batches.
            Review eligibility and register before official deadlines.
          </p>
        </div>
        <div className="broadcast-actions">
          <button
            type="button"
            className="btn-broadcast-channel"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: 'conv-placement' } }))
            }}
          >
            Open Placement Channel <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* ── TOP STATS KPI STRIP (SECTION 1) ── */}
      <div className="placement-kpi-grid">
        <div className="placement-kpi-card tone-blue">
          <div className="kpi-header">
            <span className="kpi-label">Eligible Students</span>
            <Users size={16} />
          </div>
          <div className="kpi-val">{statsData.eligibleCohort || 420}</div>
          <div className="kpi-sub">Class of 2027 Cohort</div>
        </div>

        <div className="placement-kpi-card tone-emerald">
          <div className="kpi-header">
            <span className="kpi-label">Students Placed</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="kpi-val">{statsData.placedStudents || 346}</div>
          <div className="kpi-sub">Total Offers: {statsData.totalOffers || 412}</div>
        </div>

        <div className="placement-kpi-card tone-purple">
          <div className="kpi-header">
            <span className="kpi-label">Placement Rate</span>
            <TrendingUp size={16} />
          </div>
          <div className="kpi-val">{statsData.placementRate || 82.4}%</div>
          <div className="kpi-sub">Autonomous Target: 95%</div>
        </div>

        <div className="placement-kpi-card tone-amber">
          <div className="kpi-header">
            <span className="kpi-label">Average CTC</span>
            <IndianRupee size={16} />
          </div>
          <div className="kpi-val">₹{statsData.averageCTC || 7.4} LPA</div>
          <div className="kpi-sub">Median: ₹6.8 LPA</div>
        </div>

        <div className="placement-kpi-card tone-rose">
          <div className="kpi-header">
            <span className="kpi-label">Highest Package</span>
            <Award size={16} />
          </div>
          <div className="kpi-val">₹{statsData.highestCTC || 24.0} LPA</div>
          <div className="kpi-sub">Cisco Systems &bull; Super Dream</div>
        </div>

        <div className="placement-kpi-card tone-slate">
          <div className="kpi-header">
            <span className="kpi-label">Corporate Partners</span>
            <Building2 size={16} />
          </div>
          <div className="kpi-val">{statsData.totalRecruiters || 86}+</div>
          <div className="kpi-sub">Tier 1 &amp; Product MNCs</div>
        </div>
      </div>

      {/* ── PRIMARY TAB NAVIGATION ── */}
      <div className="placement-tab-bar" role="tablist">
        <button
          type="button"
          className={`placement-tab-btn ${activeTab === 'drives' ? 'active' : ''}`}
          onClick={() => setActiveTab('drives')}
        >
          <Briefcase size={16} />
          <span>Placement Drives</span>
          <span className="tab-pill-count">{drivesList.length}</span>
        </button>

        <button
          type="button"
          className={`placement-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <FileCheck size={16} />
          <span>My Applications &amp; ATS Tracker</span>
          <span className="tab-pill-count highlight">{myApplications.length}</span>
        </button>

        <button
          type="button"
          className={`placement-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={16} />
          <span>Skill Development &amp; Tracks</span>
          <span className="tab-pill-count">{coursesList.length}</span>
        </button>

        <button
          type="button"
          className={`placement-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <TrendingUp size={16} />
          <span>Placement Records &amp; Analytics</span>
        </button>

        <button
          type="button"
          className={`placement-tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
          onClick={() => setActiveTab('notices')}
        >
          <Bell size={16} />
          <span>Official Notices &amp; Guidelines</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PLACEMENT DRIVES & AUTOMATIC ELIGIBILITY (SECTIONS 2, 3, 4)   */}
      {/* =================================================================== */}
      {activeTab === 'drives' && (
        <div className="placement-tab-content">
          {/* Search, Filter & Sort Toolbar */}
          <div className="placement-filter-box">
            <div className="search-row">
              <div className="search-input-wrap">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by company name, job role, key skills (e.g. Python, React), or job location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button type="button" className="btn-clear-search" onClick={() => setSearchQuery('')}>
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Sorting */}
              <div className="sort-wrap">
                <span className="sort-label">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select sort-select"
                >
                  <option value="deadline">Application Deadline (Earliest)</option>
                  <option value="package_desc">CTC: High to Low</option>
                  <option value="package_asc">CTC: Low to High</option>
                  <option value="company">Company Name (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Multi-Filters Grid */}
            <div className="filters-grid">
              <div className="filter-item">
                <label>Package Range</label>
                <select
                  value={selectedPackageFilter}
                  onChange={(e) => setSelectedPackageFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Packages</option>
                  <option value="UNDER_5">Below ₹5 LPA</option>
                  <option value="5_TO_10">₹5 LPA – ₹10 LPA</option>
                  <option value="10_TO_15">₹10 LPA – ₹15 LPA</option>
                  <option value="ABOVE_15">Super Dream (₹15+ LPA)</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Job Role</label>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Roles</option>
                  <option value="Software">Software Engineer</option>
                  <option value="Systems">Systems Engineer</option>
                  <option value="Data">Data &amp; Analytics</option>
                  <option value="Graduate">Graduate Engineer Trainee</option>
                  <option value="Network">Cloud &amp; Networking</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Eligible Branch</label>
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Branches</option>
                  <option value="CSE">CSE (Computer Science)</option>
                  <option value="ECE">ECE (Electronics &amp; Comm)</option>
                  <option value="EEE">EEE (Electrical &amp; Electronics)</option>
                  <option value="MECH">MECH (Mechanical)</option>
                  <option value="CIVIL">CIVIL (Civil Engineering)</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Min. CGPA Required</label>
                <select
                  value={selectedMinCgpaFilter}
                  onChange={(e) => setSelectedMinCgpaFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">Any CGPA</option>
                  <option value="6.0">Max 6.0 Cutoff</option>
                  <option value="6.5">Max 6.5 Cutoff</option>
                  <option value="7.0">Max 7.0 Cutoff</option>
                  <option value="7.5">Max 7.5 Cutoff</option>
                  <option value="8.0">Max 8.0 Cutoff</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Job Location</label>
                <select
                  value={selectedLocationFilter}
                  onChange={(e) => setSelectedLocationFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Locations</option>
                  <option value="Bhubaneswar">Bhubaneswar</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Pan-India">Pan-India</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Drive Status</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Registration Open</option>
                  <option value="UPCOMING">Upcoming Drives</option>
                  <option value="CLOSED">Closed / Expired</option>
                </select>
              </div>
            </div>

            {/* Filter Summary & Reset */}
            <div className="filter-footer">
              <span className="results-count">
                Showing <strong>{filteredDrives.length}</strong> of {drivesList.length} Campus Placement Drives
              </span>
              {(searchQuery ||
                selectedPackageFilter !== 'ALL' ||
                selectedRoleFilter !== 'ALL' ||
                selectedBranchFilter !== 'ALL' ||
                selectedMinCgpaFilter !== 'ALL' ||
                selectedLocationFilter !== 'ALL' ||
                selectedStatusFilter !== 'ALL') && (
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedPackageFilter('ALL')
                    setSelectedRoleFilter('ALL')
                    setSelectedBranchFilter('ALL')
                    setSelectedMinCgpaFilter('ALL')
                    setSelectedLocationFilter('ALL')
                    setSelectedTypeFilter('ALL')
                    setSelectedStatusFilter('ALL')
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Drives Cards Grid */}
          {filteredDrives.length > 0 ? (
            <div className="drives-cards-grid">
              {filteredDrives.map((drive) => {
                const compName = drive.company || drive.companyName
                const roleName = drive.role || drive.roleTitle
                const pkg = drive.packageOffered || `₹${drive.packageLPA} LPA`
                const branches = drive.eligibilityCriteria?.allowedBranches || drive.eligibleBranches || []
                const minCgpa = drive.eligibilityCriteria?.minCgpa ?? drive.minCgpa ?? 6.5
                const deadline = drive.recruitmentProcess?.applicationDeadline || drive.driveDate || '2026-11-30'
                const isSaved = !!savedDrives[drive.id]

                // Automatic Eligibility Validation
                const { isEligible, reasons, isClosed } = evaluateStudentEligibility(drive)
                const alreadyRegistered = isAlreadyRegistered(drive)
                const application = getApplicationForDrive(drive)

                return (
                  <div
                    key={drive.id}
                    className={`company-drive-card ${isClosed ? 'drive-closed' : ''}`}
                    onClick={() => setSelectedDriveModal(drive)}
                  >
                    {/* Card Header */}
                    <div className="drive-card-header">
                      <div className="logo-and-name">
                        <div
                          className="drive-company-logo"
                          style={{ background: drive.companyColor || '#005073' }}
                        >
                          {drive.companyLogo || compName.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="tier-tag">{drive.tier || 'Recruitment Partner'}</div>
                          <h3 className="company-title">{compName}</h3>
                        </div>
                      </div>

                      {/* Bookmark button */}
                      <button
                        type="button"
                        className={`btn-bookmark ${isSaved ? 'saved' : ''}`}
                        title={isSaved ? 'Remove bookmark' : 'Save drive'}
                        onClick={(e) => toggleSaveDrive(drive.id, e)}
                      >
                        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    {/* Role & CTC */}
                    <div className="role-and-ctc-row">
                      <div className="role-wrap">
                        <span className="role-label">Designation / Role</span>
                        <h4 className="role-title">{roleName}</h4>
                      </div>
                      <div className="ctc-pill">
                        <span className="ctc-label">Package (CTC)</span>
                        <span className="ctc-amount">{pkg}</span>
                      </div>
                    </div>

                    {/* Job Details Grid */}
                    <div className="drive-meta-grid">
                      <div className="meta-pill">
                        <MapPin size={13} />
                        <span>{drive.jobLocation || 'Bhubaneswar / Hybrid'}</span>
                      </div>
                      <div className="meta-pill">
                        <Briefcase size={13} />
                        <span>{drive.employmentType || 'Full-time Regular'}</span>
                      </div>
                      <div className="meta-pill">
                        <Users size={13} />
                        <span>{drive.vacancies || 25} Vacancies</span>
                      </div>
                      <div className="meta-pill">
                        <Calendar size={13} />
                        <span>Deadline: {deadline}</span>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    {Array.isArray(drive.requiredSkills) && drive.requiredSkills.length > 0 && (
                      <div className="drive-skills-row">
                        <span className="skills-heading">Skills:</span>
                        {drive.requiredSkills.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="skill-pill">
                            {s}
                          </span>
                        ))}
                        {drive.requiredSkills.length > 4 && (
                          <span className="skill-pill more">+{drive.requiredSkills.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* Eligibility Snapshot Bar */}
                    <div className="drive-eligibility-strip">
                      <div className="criteria-col">
                        <span className="crit-title">Minimum CGPA:</span>
                        <span className={`crit-val ${student.cgpa >= minCgpa ? 'pass' : 'fail'}`}>
                          {minCgpa} (You: {student.cgpa.toFixed(2)})
                        </span>
                      </div>
                      <div className="criteria-col">
                        <span className="crit-title">Allowed Branches:</span>
                        <span className="crit-val branches-text">
                          {Array.isArray(branches) ? branches.join(', ') : branches}
                        </span>
                      </div>
                    </div>

                    {/* Footer Status & Actions */}
                    <div className="drive-card-footer" onClick={(e) => e.stopPropagation()}>
                      <div className="eligibility-status-wrap">
                        {alreadyRegistered ? (
                          <span className="status-pill registered">
                            <CheckCircle2 size={13} /> Registered ({application?.stage || 'Applied'})
                          </span>
                        ) : isClosed ? (
                          <span className="status-pill closed">
                            <Clock size={13} /> Applications Closed
                          </span>
                        ) : isEligible ? (
                          <span className="status-pill eligible">
                            <CheckCircle2 size={13} /> Eligible to Apply
                          </span>
                        ) : (
                          <span
                            className="status-pill ineligible"
                            title={reasons.join(' · ')}
                          >
                            <AlertTriangle size={13} /> Ineligible ({reasons[0]?.slice(0, 32)}...)
                          </span>
                        )}
                      </div>

                      <div className="card-action-btns">
                        <button
                          type="button"
                          className="btn-view-details"
                          onClick={() => setSelectedDriveModal(drive)}
                        >
                          View Details
                        </button>

                        {alreadyRegistered ? (
                          <button
                            type="button"
                            className="btn-action-apply registered"
                            onClick={() => setActiveTab('applications')}
                          >
                            Track Status &rarr;
                          </button>
                        ) : isClosed ? (
                          <button type="button" className="btn-action-apply disabled" disabled>
                            Closed
                          </button>
                        ) : isEligible ? (
                          <button
                            type="button"
                            className="btn-action-apply eligible"
                            onClick={() => startRegistration(drive)}
                          >
                            Apply Now &rarr;
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-action-apply ineligible"
                            onClick={() => setSelectedDriveModal(drive)}
                          >
                            Check Why
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="placement-empty-state">
              <Briefcase size={44} className="empty-icon" />
              <h3>No Placement Drives Match Your Criteria</h3>
              <p>Try adjusting your search query, package filters, or department criteria to view more drives.</p>
              <button
                type="button"
                className="btn-reset-filters"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedPackageFilter('ALL')
                  setSelectedRoleFilter('ALL')
                  setSelectedBranchFilter('ALL')
                  setSelectedMinCgpaFilter('ALL')
                  setSelectedLocationFilter('ALL')
                  setSelectedStatusFilter('ALL')
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: MY APPLICATIONS & ATS TRACKER (SECTIONS 6, 7, 8)            */}
      {/* =================================================================== */}
      {activeTab === 'applications' && (
        <div className="placement-tab-content">
          <div className="applications-overview-banner">
            <div>
              <h3>My Campus Recruitment Applications</h3>
              <p>
                Live applicant tracking across recruitment rounds, scheduled technical interviews, and formal offer letters.
              </p>
            </div>
            <div className="apps-count-badge">
              <strong>{myApplications.length}</strong> Active Submissions
            </div>
          </div>

          {/* Applications Listing */}
          {myApplications.length > 0 ? (
            <div className="my-applications-stack">
              {myApplications.map((app) => {
                const stage = (app.stage || app.status || 'Registered').trim()
                const isSelected = stage.toLowerCase().includes('select') || stage.toLowerCase().includes('offer')
                const isRejected = stage.toLowerCase().includes('reject') || stage.toLowerCase().includes('not')
                const isInterview = stage.toLowerCase().includes('interview') || stage.toLowerCase().includes('assessment')

                // Determine ATS Progress Stage Index (1 to 6)
                let currentStepIndex = 1
                if (stage.includes('Review')) currentStepIndex = 2
                if (stage.includes('Assessment') || stage.includes('Aptitude') || stage.includes('Shortlist')) currentStepIndex = 3
                if (stage.includes('Technical')) currentStepIndex = 4
                if (stage.includes('HR')) currentStepIndex = 5
                if (isSelected) currentStepIndex = 6

                return (
                  <div key={app.id || app.applicationId} className={`application-card ${isSelected ? 'selected' : ''}`}>
                    {/* Header */}
                    <div className="app-card-header">
                      <div className="app-comp-info">
                        <div className="app-logo-badge">
                          {(app.company || app.companyName || 'CO').slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="app-id-tag">Application ID: {app.applicationId || app.id}</div>
                          <h3 className="app-company-name">{app.company || app.companyName}</h3>
                          <div className="app-role-subtitle">
                            <strong>{app.jobRole || app.role}</strong> &bull; Package: {app.ctcOffered || app.packageOffered || 'As Notified'}
                          </div>
                        </div>
                      </div>

                      <div className="app-header-right">
                        <div className="app-date-info">
                          <span>Applied on:</span>
                          <strong>{app.appliedDate || app.appliedAt?.split('T')[0] || 'Recently'}</strong>
                        </div>
                        <span className={`app-status-badge ${isSelected ? 'selected' : isRejected ? 'rejected' : 'in-progress'}`}>
                          {isSelected ? <CheckCircle2 size={13} /> : isRejected ? <X size={13} /> : <Clock size={13} />}
                          {stage}
                        </span>
                      </div>
                    </div>

                    {/* ATS Visual Progress Timeline */}
                    <div className="ats-timeline-container">
                      <div className="ats-timeline-track">
                        {[
                          { index: 1, label: 'Applied' },
                          { index: 2, label: 'Resume Review' },
                          { index: 3, label: 'Assessment' },
                          { index: 4, label: 'Tech Round' },
                          { index: 5, label: 'HR Round' },
                          { index: 6, label: isRejected ? 'Outcome' : 'Selection & Offer' },
                        ].map((s) => {
                          const isDone = currentStepIndex > s.index || (isSelected && s.index === 6)
                          const isCurrent = currentStepIndex === s.index && !isSelected
                          return (
                            <div key={s.index} className={`ats-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                              <div className="ats-step-node">
                                {isDone ? <Check size={12} /> : s.index}
                              </div>
                              <span className="ats-step-label">{s.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Interview Alert Box (Section 7) */}
                    {isInterview && (
                      <div className="interview-notice-box">
                        <div className="interview-icon-col">
                          <Video size={22} />
                        </div>
                        <div className="interview-info-col">
                          <strong>🎯 Upcoming Recruitment Interview Round Scheduled</strong>
                          <p>
                            Schedule: <strong>{app.interviewSchedule || 'Tomorrow, 10:00 AM'}</strong> &bull; Venue: <strong>Virtual Webex / Auditorium 204</strong>
                          </p>
                          <div className="interview-checklist">
                            <span>✓ Mandatory Dress Code: Formal Attire</span>
                            <span>✓ Bring: 3 Copies of Resume + College ID</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-view-interview"
                          onClick={() => setSelectedInterviewModal(app)}
                        >
                          View Interview Venue &amp; Instructions &rarr;
                        </button>
                      </div>
                    )}

                    {/* Offer Letter Box (Section 8) */}
                    {isSelected && (
                      <div className="offer-celebration-banner">
                        <div className="celebration-left">
                          <div className="trophy-icon">🏆</div>
                          <div>
                            <h4>Congratulations! Campus Recruitment Offer Released</h4>
                            <p>
                              You have been formally selected for <strong>{app.jobRole || app.role}</strong> at <strong>{app.company || app.companyName}</strong> with compensation of <strong>{app.ctcOffered || '₹18.5 LPA'}</strong>.
                            </p>
                          </div>
                        </div>
                        <div className="celebration-actions">
                          <button
                            type="button"
                            className="btn-download-offer"
                            onClick={() => {
                              downloadPlacementOfferLetterPdf(
                                {
                                  company: app.company || app.companyName,
                                  role: app.jobRole || app.role,
                                  packageOffered: app.ctcOffered,
                                  studentName: student.name,
                                  regNo: student.rollNumber,
                                },
                                student
                              )
                              triggerToast('Downloading official Placement Offer Letter (PDF)...')
                            }}
                          >
                            <Download size={14} /> Download Offer Letter (PDF)
                          </button>
                          <button
                            type="button"
                            className="btn-respond-offer"
                            onClick={() => setSelectedOfferModal(app)}
                          >
                            Accept / Respond to Offer
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="app-card-footer">
                      <div className="notes-snippet">
                        <Info size={13} />
                        <span>{app.internalNotes || 'Application under active scrutiny with T&P Directorate.'}</span>
                      </div>
                      <div className="app-footer-buttons">
                        <button
                          type="button"
                          className="btn-app-secondary"
                          onClick={() => {
                            downloadPlacementRegistrationSlipPdf(app, {}, student)
                            triggerToast('Registration Slip PDF downloaded.')
                          }}
                        >
                          <Download size={13} /> Registration Slip
                        </button>
                        <button
                          type="button"
                          className="btn-app-secondary"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to withdraw your application for ${app.company || app.companyName}?`)) {
                              placementStore.updateApplicationStage(app.id, {
                                stage: 'Withdrawn',
                                status: 'Withdrawn by Student',
                                notes: 'Candidate withdrew application from student portal.',
                              })
                              triggerToast('Application withdrawn successfully.')
                              loadPlacementData()
                            }
                          }}
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="placement-empty-state">
              <FileCheck size={44} className="empty-icon" />
              <h3>No Active Placement Applications Found</h3>
              <p>You have not registered for any campus recruitment drives yet. Explore eligible companies in the Placement Drives tab.</p>
              <button
                type="button"
                className="btn-action-apply eligible"
                onClick={() => setActiveTab('drives')}
              >
                Browse Placement Drives &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: SKILL DEVELOPMENT & CAREER TRACKS (SECTION 9)               */}
      {/* =================================================================== */}
      {activeTab === 'courses' && (
        <div className="placement-tab-content">
          <div className="courses-header-banner">
            <div>
              <h3>Institutional Skill Development &amp; Technical Tracks</h3>
              <p>
                Curated algorithmic bootcamps, full-stack tracks, mock interviews, and corporate communication workshops.
              </p>
            </div>
          </div>

          <div className="courses-grid">
            {coursesList.map((course) => (
              <div key={course.id || course.title} className="skill-card">
                <div className="skill-card-top">
                  <span className="course-category-tag">{course.category || 'Technical Preparation'}</span>
                  <span className={`course-status-tag ${course.progress === 100 ? 'done' : course.enrolled ? 'active' : ''}`}>
                    {course.progress === 100 ? 'Completed ✓' : course.enrolled ? 'Enrolled' : 'Open'}
                  </span>
                </div>

                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-desc">{course.description}</p>

                <div className="course-meta-list">
                  <div>
                    <User size={13} />
                    <span>{course.trainer || course.provider}</span>
                  </div>
                  <div>
                    <Clock size={13} />
                    <span>{course.duration}</span>
                  </div>
                  <div>
                    <MapPin size={13} />
                    <span>{course.venue}</span>
                  </div>
                </div>

                {course.enrolled && (
                  <div className="course-progress-wrapper">
                    <div className="progress-labels">
                      <span>Curriculum Progress:</span>
                      <strong>{course.progress}%</strong>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="skill-card-actions">
                  {course.progress === 100 ? (
                    <button
                      type="button"
                      className="btn-course-action completed"
                      onClick={() => triggerToast('Certificate of Completion will be generated after final semester.')}
                    >
                      <Award size={14} /> Certificate Ready
                    </button>
                  ) : course.enrolled ? (
                    <button
                      type="button"
                      className="btn-course-action continue"
                      onClick={() => triggerToast(`Accessing ${course.title} study repository...`)}
                    >
                      Continue Learning &rarr;
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-course-action enroll"
                      onClick={() => {
                        placementStore.updateTrainingProgram(course.id, { enrolled: true, progress: 10 })
                        triggerToast(`Enrolled successfully in ${course.title}!`)
                        loadPlacementData()
                      }}
                    >
                      Enroll in Course &rarr;
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-syllabus-link"
                    onClick={() => setSelectedCourseModal(course)}
                  >
                    View Syllabus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: PLACEMENT RECORDS & HISTORICAL ANALYTICS (SECTION 10)       */}
      {/* =================================================================== */}
      {activeTab === 'records' && (
        <div className="placement-tab-content">
          <div className="records-header-box">
            <div>
              <h3>Campus Recruitment Records &amp; Historical Insights</h3>
              <p>Audited institutional placement statistics, recruiting partner distribution, and department benchmarks.</p>
            </div>
            <div className="year-selector-wrap">
              <label>Academic Year:</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="filter-select"
              >
                <option value="2026–27">AY 2026–27 (Current Season)</option>
                <option value="2025–26">AY 2025–26</option>
                <option value="2024–25">AY 2024–25</option>
                <option value="2023–24">AY 2023–24</option>
              </select>
            </div>
          </div>

          {/* Tier Statistics Cards */}
          <div className="tier-stats-row">
            <div className="tier-box super-dream">
              <h4>Super Dream Offers (₹12+ LPA)</h4>
              <div className="tier-numbers">
                <strong>28 Offers</strong>
                <span>Highest: ₹24.0 LPA</span>
              </div>
              <p>Top Recruiters: Cisco Systems India, Amazon AWS, Microsoft India, Palo Alto Networks</p>
            </div>

            <div className="tier-box dream">
              <h4>Dream Recruiters (₹6 – ₹12 LPA)</h4>
              <div className="tier-numbers">
                <strong>164 Offers</strong>
                <span>Average: ₹8.4 LPA</span>
              </div>
              <p>Top Recruiters: TCS Digital, Cognizant GenC Next, Infosys Specialist, L&amp;T Technology</p>
            </div>

            <div className="tier-box core">
              <h4>Core &amp; Mass IT (₹3.5 – ₹6 LPA)</h4>
              <div className="tier-numbers">
                <strong>220 Offers</strong>
                <span>Average: ₹4.8 LPA</span>
              </div>
              <p>Top Recruiters: Wipro Turbo, Tech Mahindra, HCL Technologies, Capgemini India</p>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="records-table-container">
            <h4 className="table-heading">Department-Wise Placement Statistics ({selectedAcademicYear})</h4>
            <table className="placement-data-table">
              <thead>
                <tr>
                  <th>Academic Department</th>
                  <th>Eligible Cohort</th>
                  <th>Students Placed</th>
                  <th>Placement Rate</th>
                  <th>Average Package</th>
                  <th>Highest Package</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Computer Science &amp; Engineering (CSE)</strong></td>
                  <td>160</td>
                  <td>152</td>
                  <td><span className="badge-rate high">95.0%</span></td>
                  <td>₹8.4 LPA</td>
                  <td>₹24.0 LPA</td>
                </tr>
                <tr>
                  <td><strong>Electronics &amp; Communication Eng. (ECE)</strong></td>
                  <td>90</td>
                  <td>78</td>
                  <td><span className="badge-rate high">86.7%</span></td>
                  <td>₹6.8 LPA</td>
                  <td>₹14.0 LPA</td>
                </tr>
                <tr>
                  <td><strong>Electrical &amp; Electronics Eng. (EEE)</strong></td>
                  <td>60</td>
                  <td>48</td>
                  <td><span className="badge-rate mid">80.0%</span></td>
                  <td>₹5.8 LPA</td>
                  <td>₹9.2 LPA</td>
                </tr>
                <tr>
                  <td><strong>Mechanical Engineering (MECH)</strong></td>
                  <td>55</td>
                  <td>41</td>
                  <td><span className="badge-rate mid">74.5%</span></td>
                  <td>₹5.2 LPA</td>
                  <td>₹8.0 LPA</td>
                </tr>
                <tr>
                  <td><strong>Civil Engineering (CIVIL)</strong></td>
                  <td>35</td>
                  <td>24</td>
                  <td><span className="badge-rate mid">68.6%</span></td>
                  <td>₹4.8 LPA</td>
                  <td>₹6.5 LPA</td>
                </tr>
                <tr>
                  <td><strong>Master of Computer Applications (MCA)</strong></td>
                  <td>20</td>
                  <td>18</td>
                  <td><span className="badge-rate high">90.0%</span></td>
                  <td>₹6.2 LPA</td>
                  <td>₹10.5 LPA</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Recruiting Partners Grid */}
          <div className="partners-showcase-box">
            <h4>Prominent Corporate Recruiting Partners</h4>
            <div className="partner-badges-flex">
              {[
                'Cisco Systems',
                'Tata Consultancy Services',
                'Infosys',
                'Cognizant',
                'Wipro',
                'L&T Technology Services',
                'HCL Technologies',
                'Tech Mahindra',
                'Capgemini',
                'Accenture',
                'IBM India',
                'Mindtree',
                'Deloitte India',
                'Hexaware',
              ].map((p, idx) => (
                <div key={idx} className="partner-pill-item">
                  <Building2 size={13} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: OFFICIAL NOTICES & POLICY GUIDELINES (SECTION 11)           */}
      {/* =================================================================== */}
      {activeTab === 'notices' && (
        <div className="placement-tab-content">
          <div className="notices-intro-card">
            <Bell size={24} className="text-amber" />
            <div>
              <h3>Training &amp; Placement Directorate Policies &amp; Official Guidelines</h3>
              <p>Mandatory student recruitment code of conduct, dress code specifications, and offer acceptance policies.</p>
            </div>
          </div>

          <div className="notices-list-stack">
            <div className="placement-notice-item">
              <div className="notice-meta">
                <span className="notice-badge urgent">Mandatory Policy</span>
                <span className="notice-date">Published: 15 Oct 2026</span>
              </div>
              <h4>One Student One Offer Standard &bull; Dream Company Upgrade Exemption</h4>
              <p>
                Every candidate securing an initial placement offer must honor the commitment. Candidates may appear for one additional Super Dream drive (CTC &gt;= ₹12 LPA) provided they maintain academic standing without backlogs.
              </p>
            </div>

            <div className="placement-notice-item">
              <div className="notice-meta">
                <span className="notice-badge">Dress Code</span>
                <span className="notice-date">Published: 10 Oct 2026</span>
              </div>
              <h4>Campus Recruitment Drive Interview Dress Code &amp; Protocols</h4>
              <p>
                All candidates attending on-campus or virtual interviews must be dressed in formal institutional attire (Blazer / Formal shirt, tie, and formal shoes). T-shirts, casual footwear, and jeans are strictly prohibited in assessment labs.
              </p>
            </div>

            <div className="placement-notice-item">
              <div className="notice-meta">
                <span className="notice-badge">Pre-Placement</span>
                <span className="notice-date">Published: 05 Oct 2026</span>
              </div>
              <h4>Pre-Placement Talk (PPT) Attendance Rule</h4>
              <p>
                Attendance in corporate Pre-Placement Talks is compulsory for all registered students. Absence from scheduled PPTs without prior medical sanction will result in forfeiture of eligibility for the respective drive.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: PLACEMENT DRIVE DETAILS MODAL (SECTION 3)                 */}
      {/* =================================================================== */}
      {selectedDriveModal && (
        <div className="placement-modal-backdrop" onClick={() => setSelectedDriveModal(null)}>
          <div className="placement-modal-card large" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="placement-modal-close"
              onClick={() => setSelectedDriveModal(null)}
            >
              &times;
            </button>

            {/* Modal Header */}
            <div className="drive-detail-banner">
              <div
                className="drive-detail-logo"
                style={{ background: selectedDriveModal.companyColor || '#005073' }}
              >
                {selectedDriveModal.companyLogo || (selectedDriveModal.company || '').slice(0, 3).toUpperCase()}
              </div>
              <div className="drive-detail-title-col">
                <span className="modal-tier-badge">{selectedDriveModal.tier || 'Recruitment Partner'}</span>
                <h2>{selectedDriveModal.company || selectedDriveModal.companyName}</h2>
                <div className="modal-role-row">
                  <strong>{selectedDriveModal.role || selectedDriveModal.roleTitle}</strong>
                  <span className="modal-ctc-tag">
                    {selectedDriveModal.packageOffered || `₹${selectedDriveModal.packageLPA} LPA`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="modal-specs-bar">
              <div>
                <MapPin size={14} />
                <span>Location: <strong>{selectedDriveModal.jobLocation || 'Bhubaneswar / Hybrid'}</strong></span>
              </div>
              <div>
                <Briefcase size={14} />
                <span>Type: <strong>{selectedDriveModal.employmentType || 'Full-time Regular'}</strong></span>
              </div>
              <div>
                <Users size={14} />
                <span>Openings: <strong>{selectedDriveModal.vacancies || 25} Vacancies</strong></span>
              </div>
              <div>
                <Calendar size={14} />
                <span>Deadline: <strong>{selectedDriveModal.recruitmentProcess?.applicationDeadline || selectedDriveModal.driveDate}</strong></span>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="modal-scroll-body">
              {/* Automatic Eligibility Snapshot for Current Student */}
              {(() => {
                const { isEligible, reasons, passed, isClosed } = evaluateStudentEligibility(selectedDriveModal)
                const alreadyRegistered = isAlreadyRegistered(selectedDriveModal)

                return (
                  <div className={`eligibility-evaluation-box ${alreadyRegistered ? 'registered' : isClosed ? 'closed' : isEligible ? 'pass' : 'fail'}`}>
                    <div className="eval-header">
                      {alreadyRegistered ? (
                        <>
                          <CheckCircle2 size={18} />
                          <strong>Application Status: Already Registered</strong>
                        </>
                      ) : isClosed ? (
                        <>
                          <Clock size={18} />
                          <strong>Application Window Expired</strong>
                        </>
                      ) : isEligible ? (
                        <>
                          <CheckCircle2 size={18} />
                          <strong>You Are Eligible to Apply for this Placement Drive</strong>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={18} />
                          <strong>You Do Not Meet One or More Eligibility Cutoffs</strong>
                        </>
                      )}
                    </div>

                    <div className="eval-criteria-breakdown">
                      {passed.map((p, idx) => (
                        <div key={idx} className="crit-item pass">
                          <Check size={12} /> {p}
                        </div>
                      ))}
                      {reasons.map((r, idx) => (
                        <div key={idx} className="crit-item fail">
                          <X size={12} /> {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Job Description */}
              <div className="modal-section-block">
                <h4><FileText size={16} /> Job Description &amp; Scope of Responsibilities</h4>
                <p>{selectedDriveModal.jobDescription}</p>
              </div>

              {/* Required Skills */}
              <div className="modal-section-block">
                <h4><Target size={16} /> Required Technical &amp; Professional Skills</h4>
                <div className="modal-skills-list">
                  {(selectedDriveModal.requiredSkills || ['Python', 'Data Structures', 'Algorithms', 'SQL']).map((sk, idx) => (
                    <span key={idx} className="modal-skill-chip">{sk}</span>
                  ))}
                </div>
              </div>

              {/* Eligibility Criteria Matrix */}
              <div className="modal-section-block">
                <h4><GraduationCap size={16} /> Detailed Eligibility Criteria</h4>
                <div className="modal-criteria-table-wrap">
                  <table className="modal-table">
                    <tbody>
                      <tr>
                        <td><strong>Degree &amp; Passing Year</strong></td>
                        <td>{selectedDriveModal.eligibilityCriteria?.degree || 'B.Tech / MCA'} &bull; Passing Year {selectedDriveModal.eligibilityCriteria?.passingYear || '2027'}</td>
                      </tr>
                      <tr>
                        <td><strong>Minimum Cumulative CGPA</strong></td>
                        <td>{selectedDriveModal.eligibilityCriteria?.minCgpa ?? selectedDriveModal.minCgpa ?? 6.5} CGPA (On 10-Point Scale)</td>
                      </tr>
                      <tr>
                        <td><strong>Allowed Academic Branches</strong></td>
                        <td>{(selectedDriveModal.eligibilityCriteria?.allowedBranches || selectedDriveModal.eligibleBranches || ['CSE', 'ECE']).join(', ')}</td>
                      </tr>
                      <tr>
                        <td><strong>Backlogs Policy</strong></td>
                        <td>0 Active Backlogs (Strict No-Backlog Rule at Time of Joining)</td>
                      </tr>
                      <tr>
                        <td><strong>10th &amp; 12th Cutoffs</strong></td>
                        <td>Min {selectedDriveModal.eligibilityCriteria?.min10thPercent || 60}% in Class X &bull; Min {selectedDriveModal.eligibilityCriteria?.min12thPercent || 60}% in Class XII</td>
                      </tr>
                      <tr>
                        <td><strong>Service Bond / Commitment</strong></td>
                        <td>{selectedDriveModal.bond || 'No Service Agreement / Bond'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recruitment Stages Timeline */}
              <div className="modal-section-block">
                <h4><Layers size={16} /> Campus Recruitment Stages &amp; Schedule</h4>
                <div className="modal-stages-timeline">
                  <div className="timeline-node">
                    <span className="node-num">1</span>
                    <div>
                      <strong>Pre-Placement Talk (PPT)</strong>
                      <small>{selectedDriveModal.recruitmentProcess?.prePlacementTalkDate || 'As Scheduled'}</small>
                    </div>
                  </div>
                  <div className="timeline-node">
                    <span className="node-num">2</span>
                    <div>
                      <strong>Online Coding / Aptitude Test</strong>
                      <small>{selectedDriveModal.recruitmentProcess?.aptitudeTestDate || 'Online Assessment Lab'}</small>
                    </div>
                  </div>
                  <div className="timeline-node">
                    <span className="node-num">3</span>
                    <div>
                      <strong>Technical Interview Rounds</strong>
                      <small>{selectedDriveModal.recruitmentProcess?.technicalInterviewSchedule || 'Virtual Panel'}</small>
                    </div>
                  </div>
                  <div className="timeline-node">
                    <span className="node-num">4</span>
                    <div>
                      <strong>HR Interview &amp; Final Offer</strong>
                      <small>{selectedDriveModal.recruitmentProcess?.hrInterviewSchedule || 'Executive Boardroom'}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="placement-modal-footer">
              <div className="footer-left-buttons">
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() => {
                    downloadJobDescriptionPdf(selectedDriveModal)
                    triggerToast('Job Description PDF downloaded.')
                  }}
                >
                  <Download size={14} /> Download JD (PDF)
                </button>
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={(e) => toggleSaveDrive(selectedDriveModal.id, e)}
                >
                  <Bookmark size={14} /> {savedDrives[selectedDriveModal.id] ? 'Saved' : 'Save Drive'}
                </button>
              </div>

              <div className="footer-right-buttons">
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() => setSelectedDriveModal(null)}
                >
                  Back to Placement Drives
                </button>

                {(() => {
                  const { isEligible, isClosed } = evaluateStudentEligibility(selectedDriveModal)
                  const alreadyRegistered = isAlreadyRegistered(selectedDriveModal)

                  if (alreadyRegistered) {
                    return (
                      <button
                        type="button"
                        className="btn-modal-primary"
                        onClick={() => {
                          setSelectedDriveModal(null)
                          setActiveTab('applications')
                        }}
                      >
                        Track in My Applications &rarr;
                      </button>
                    )
                  }
                  if (isClosed) {
                    return (
                      <button type="button" className="btn-modal-disabled" disabled>
                        Applications Closed
                      </button>
                    )
                  }
                  if (isEligible) {
                    return (
                      <button
                        type="button"
                        className="btn-modal-primary"
                        onClick={() => startRegistration(selectedDriveModal)}
                      >
                        Apply Now &rarr;
                      </button>
                    )
                  }
                  return (
                    <button type="button" className="btn-modal-disabled" disabled>
                      Criteria Not Met
                    </button>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: 7-STEP PLACEMENT REGISTRATION WIZARD (SECTION 5)          */}
      {/* =================================================================== */}
      {showApplyWizard && applyingDrive && (
        <div className="placement-modal-backdrop" onClick={() => !isSubmittingApp && setShowApplyWizard(false)}>
          <div className="placement-modal-card wizard-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="placement-modal-close"
              onClick={() => !isSubmittingApp && setShowApplyWizard(false)}
            >
              &times;
            </button>

            {/* Wizard Header */}
            <div className="wizard-header">
              <span className="wizard-step-indicator">
                Step {applyStep} of 6 &bull; {applyingDrive.companyName || applyingDrive.company}
              </span>
              <h2 className="wizard-title">
                {applyStep === 1 && '1. Verify Student Academic Eligibility'}
                {applyStep === 2 && '2. Review Academic Record & Profile'}
                {applyStep === 3 && '3. Select Verified Resume for Scrutiny'}
                {applyStep === 4 && '4. Upload Supporting Grade Sheets'}
                {applyStep === 5 && '5. Final Application Review'}
                {applyStep === 6 && '6. Student Declaration & Submission'}
                {applyStep === 7 && 'Registration Successfully Confirmed!'}
              </h2>

              {/* Step Dots Progress */}
              <div className="wizard-progress-track">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className={`step-dot ${applyStep === s ? 'active' : applyStep > s ? 'completed' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Wizard Step Body */}
            <div className="wizard-step-body">
              {/* STEP 1: ELIGIBILITY CHECK */}
              {applyStep === 1 && (
                <div>
                  <p className="step-intro-text">
                    The placement portal deterministic eligibility engine has checked your authenticated academic record:
                  </p>
                  {(() => {
                    const { isEligible, reasons, passed } = evaluateStudentEligibility(applyingDrive)
                    return (
                      <div className="wizard-eligibility-summary">
                        {isEligible ? (
                          <div className="alert-box success">
                            <CheckCircle2 size={20} />
                            <div>
                              <strong>Eligibility Verified Successfully ✓</strong>
                              <p>You meet all corporate requirements for this recruitment position.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="alert-box error">
                            <AlertCircle size={20} />
                            <div>
                              <strong>Ineligible for this Position</strong>
                              <p>{reasons.join(' · ')}</p>
                            </div>
                          </div>
                        )}

                        <div className="wizard-criteria-list">
                          {passed.map((p, idx) => (
                            <div key={idx} className="wizard-crit-item pass">
                              <Check size={14} /> <span>{p}</span>
                            </div>
                          ))}
                          {reasons.map((r, idx) => (
                            <div key={idx} className="wizard-crit-item fail">
                              <X size={14} /> <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* STEP 2: PROFILE VERIFICATION */}
              {applyStep === 2 && (
                <div>
                  <p className="step-intro-text">
                    Verify that your academic record and contact information are accurate for the corporate HR team:
                  </p>
                  <div className="profile-verify-grid">
                    <div className="verify-item">
                      <label>Candidate Full Name</label>
                      <input type="text" readOnly value={student.name} />
                    </div>
                    <div className="verify-item">
                      <label>Registration Number</label>
                      <input type="text" readOnly value={student.rollNumber} />
                    </div>
                    <div className="verify-item">
                      <label>Department / Branch</label>
                      <input type="text" readOnly value={student.department} />
                    </div>
                    <div className="verify-item">
                      <label>Current Semester &amp; Batch</label>
                      <input type="text" readOnly value={`${student.semester} (${student.batch})`} />
                    </div>
                    <div className="verify-item">
                      <label>Cumulative CGPA</label>
                      <input type="text" readOnly value={`${student.cgpa.toFixed(2)} / 10.0`} />
                    </div>
                    <div className="verify-item">
                      <label>Active Backlogs</label>
                      <input type="text" readOnly value={`${student.activeBacklogs} Backlogs`} />
                    </div>
                    <div className="verify-item">
                      <label>Class 10th Aggregate</label>
                      <input type="text" readOnly value={`${student.tenthPercent}%`} />
                    </div>
                    <div className="verify-item">
                      <label>Class 12th Aggregate</label>
                      <input type="text" readOnly value={`${student.twelfthPercent}%`} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: RESUME SELECTION */}
              {applyStep === 3 && (
                <div>
                  <p className="step-intro-text">
                    Select an approved resume from your repository to attach to this application:
                  </p>
                  <div className="resume-select-stack">
                    {[
                      'Primary Technical Resume (Full Stack & DSA) — Verified ✓',
                      'Systems & Cloud Computing Focus Resume — Approved ✓',
                      'Comprehensive Academic & Research CV — Verified ✓',
                    ].map((res, idx) => (
                      <label key={idx} className={`resume-choice-card ${selectedResume === res ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="resume"
                          checked={selectedResume === res}
                          onChange={() => setSelectedResume(res)}
                        />
                        <FileText size={18} />
                        <div className="resume-choice-text">
                          <strong>{res}</strong>
                          <small>Last updated: October 2026 &bull; Verified by Placement Cell Council</small>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: SUPPORTING DOCUMENTS */}
              {applyStep === 4 && (
                <div>
                  <p className="step-intro-text">
                    Attach required academic credentials (Autonomous Semester Grade Sheet / Marksheet):
                  </p>
                  <div className="doc-upload-box">
                    <UploadCloud size={32} />
                    <strong>Attached: {uploadedDocName}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Digitally signed Autonomous Grade Sheet &bull; Verified 1.8 MB PDF
                    </span>
                    <button
                      type="button"
                      className="btn-modal-secondary"
                      style={{ marginTop: '10px' }}
                      onClick={() => triggerToast('Document verified and re-validated.')}
                    >
                      Change Document
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: APPLICATION REVIEW */}
              {applyStep === 5 && (
                <div>
                  <p className="step-intro-text">
                    Review your complete application summary before final submission to the T&amp;P Directorate:
                  </p>
                  <div className="review-summary-card">
                    <div className="review-row">
                      <span>Company Name:</span>
                      <strong>{applyingDrive.companyName || applyingDrive.company}</strong>
                    </div>
                    <div className="review-row">
                      <span>Designation / Role:</span>
                      <strong>{applyingDrive.roleTitle || applyingDrive.role}</strong>
                    </div>
                    <div className="review-row">
                      <span>CTC Package:</span>
                      <strong>{applyingDrive.packageOffered || `₹${applyingDrive.packageLPA} LPA`}</strong>
                    </div>
                    <div className="review-row">
                      <span>Candidate:</span>
                      <strong>{student.name} ({student.rollNumber})</strong>
                    </div>
                    <div className="review-row">
                      <span>Verified CGPA:</span>
                      <strong>{student.cgpa.toFixed(2)}</strong>
                    </div>
                    <div className="review-row">
                      <span>Selected Resume:</span>
                      <strong>{selectedResume}</strong>
                    </div>
                    <div className="review-row">
                      <span>Attached Document:</span>
                      <strong>{uploadedDocName}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: DECLARATION & SUBMISSION */}
              {applyStep === 6 && (
                <div>
                  <p className="step-intro-text">
                    Please acknowledge and confirm your candidate declarations to complete registration:
                  </p>
                  <div className="declarations-stack">
                    <label className="declaration-label">
                      <input
                        type="checkbox"
                        checked={declaration1}
                        onChange={(e) => setDeclaration1(e.target.checked)}
                      />
                      <span>
                        I certify that all academic particulars, percentages, CGPA, and documents submitted herein are authentic, verified, and true.
                      </span>
                    </label>

                    <label className="declaration-label">
                      <input
                        type="checkbox"
                        checked={declaration2}
                        onChange={(e) => setDeclaration2(e.target.checked)}
                      />
                      <span>
                        I agree to punctually participate in all scheduled PPTs, assessments, and interview rounds as per the Apna Campus Autonomous University Placement Directorate Honor Code.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 7: CONFIRMATION VIEW */}
              {applyStep === 7 && recentApplicationResult && (
                <div className="wizard-confirmation-view">
                  <div className="confirmation-icon">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3>Registration Successfully Confirmed!</h3>
                  <p className="confirmation-id">
                    Application ID: <strong>{recentApplicationResult.applicationId || recentApplicationResult.id}</strong>
                  </p>
                  <p className="confirmation-msg">
                    Your application for <strong>{applyingDrive.companyName || applyingDrive.company}</strong> has been transmitted to the Training &amp; Placement Cell. An official confirmation alert has been delivered to your student dashboard.
                  </p>

                  <div className="confirmation-actions">
                    <button
                      type="button"
                      className="btn-modal-primary"
                      onClick={() => {
                        downloadPlacementRegistrationSlipPdf(recentApplicationResult, applyingDrive, student)
                        triggerToast('Downloading Registration Slip PDF...')
                      }}
                    >
                      <Download size={14} /> Download Registration Slip (PDF)
                    </button>
                    <button
                      type="button"
                      className="btn-modal-secondary"
                      onClick={() => {
                        setShowApplyWizard(false)
                        setActiveTab('applications')
                      }}
                    >
                      Track in My Applications &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            {applyStep < 7 && (
              <div className="wizard-footer">
                <button
                  type="button"
                  className="btn-modal-secondary"
                  disabled={isSubmittingApp}
                  onClick={() => {
                    if (applyStep > 1) {
                      setApplyStep(prev => prev - 1)
                    } else {
                      setShowApplyWizard(false)
                    }
                  }}
                >
                  {applyStep === 1 ? 'Cancel' : '&larr; Previous Step'}
                </button>

                {applyStep < 6 ? (
                  <button
                    type="button"
                    className="btn-modal-primary"
                    onClick={() => {
                      const { isEligible } = evaluateStudentEligibility(applyingDrive)
                      if (applyStep === 1 && !isEligible) {
                        triggerToast('You cannot proceed because eligibility criteria are not satisfied.')
                        return
                      }
                      setApplyStep(prev => prev + 1)
                    }}
                  >
                    Proceed to Next Step &rarr;
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-modal-primary"
                    disabled={isSubmittingApp || !declaration1 || !declaration2}
                    onClick={handleFinalSubmitApplication}
                  >
                    {isSubmittingApp ? 'Submitting Application...' : 'Confirm & Submit Application ✓'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: INTERVIEW INSTRUCTIONS MODAL (SECTION 7)                   */}
      {/* =================================================================== */}
      {selectedInterviewModal && (
        <div className="placement-modal-backdrop" onClick={() => setSelectedInterviewModal(null)}>
          <div className="placement-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="placement-modal-close"
              onClick={() => setSelectedInterviewModal(null)}
            >
              &times;
            </button>

            <div className="interview-modal-header">
              <Video size={24} className="text-blue" />
              <div>
                <h3>Recruitment Interview Instructions &amp; Venue</h3>
                <p>
                  Company: <strong>{selectedInterviewModal.company || selectedInterviewModal.companyName}</strong> &bull; Role: <strong>{selectedInterviewModal.jobRole || selectedInterviewModal.role}</strong>
                </p>
              </div>
            </div>

            <div className="interview-modal-body">
              <div className="detail-item-box">
                <label>Interview Stage:</label>
                <strong>{selectedInterviewModal.stage || 'Technical Interview Round 1'}</strong>
              </div>
              <div className="detail-item-box">
                <label>Scheduled Reporting Time:</label>
                <strong>{selectedInterviewModal.interviewSchedule || 'Tomorrow at 10:00 AM'}</strong>
              </div>
              <div className="detail-item-box">
                <label>Mode &amp; Venue:</label>
                <strong>Virtual Cisco Webex / Auditorium Interview Panel 2</strong>
              </div>
              <div className="detail-item-box">
                <label>Virtual Meeting Link:</label>
                <a
                  href="https://meet.google.com/apna-placement-interview"
                  target="_blank"
                  rel="noreferrer"
                  className="meeting-link-anchor"
                >
                  https://meet.google.com/apna-placement-interview <ExternalLink size={13} />
                </a>
              </div>

              <div className="interview-guidelines-box">
                <h4>Mandatory Candidate Guidelines:</h4>
                <ul>
                  <li>Report 15 minutes prior to the scheduled start time.</li>
                  <li>Have 3 physical copies of your approved resume and your Apna Campus ID card ready.</li>
                  <li>Ensure high-speed internet and quiet room if attending virtually.</li>
                  <li>Strict formal business dress code applies to all rounds.</li>
                </ul>
              </div>
            </div>

            <div className="placement-modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setSelectedInterviewModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => {
                  window.open('https://meet.google.com/apna-placement-interview', '_blank')
                }}
              >
                Join Virtual Interview Room &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: OFFER DECISION MODAL (SECTION 8)                           */}
      {/* =================================================================== */}
      {selectedOfferModal && (
        <div className="placement-modal-backdrop" onClick={() => setSelectedOfferModal(null)}>
          <div className="placement-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="placement-modal-close"
              onClick={() => setSelectedOfferModal(null)}
            >
              &times;
            </button>

            <div className="offer-modal-header">
              <Award size={24} className="text-amber" />
              <div>
                <h3>Campus Recruitment Job Offer Response</h3>
                <p>
                  {selectedOfferModal.company || selectedOfferModal.companyName} &bull; Designation: {selectedOfferModal.jobRole || selectedOfferModal.role}
                </p>
              </div>
            </div>

            <div className="offer-modal-body">
              <div className="offer-terms-grid">
                <div>
                  <label>Offered CTC</label>
                  <strong>{selectedOfferModal.ctcOffered || '₹18.5 LPA'}</strong>
                </div>
                <div>
                  <label>Anticipated Joining Date</label>
                  <strong>01 July 2027</strong>
                </div>
                <div>
                  <label>Response Deadline</label>
                  <strong className="text-rose">15 December 2026</strong>
                </div>
                <div>
                  <label>Work Location</label>
                  <strong>Bangalore / Hybrid</strong>
                </div>
              </div>

              <p className="offer-disclaimer">
                Please make your formal decision. Once accepted, your placement record will be updated in the institutional registry, and pre-boarding document verification will commence.
              </p>
            </div>

            <div className="placement-modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setSelectedOfferModal(null)}
              >
                Decide Later
              </button>
              <button
                type="button"
                className="btn-decline-offer"
                onClick={() => handleOfferDecision(selectedOfferModal, 'DECLINE_OFFER')}
              >
                Decline Offer
              </button>
              <button
                type="button"
                className="btn-accept-offer"
                onClick={() => handleOfferDecision(selectedOfferModal, 'ACCEPT_OFFER')}
              >
                Accept Offer ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: COURSE SYLLABUS MODAL (SECTION 9)                          */}
      {/* =================================================================== */}
      {selectedCourseModal && (
        <div className="placement-modal-backdrop" onClick={() => setSelectedCourseModal(null)}>
          <div className="placement-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="placement-modal-close"
              onClick={() => setSelectedCourseModal(null)}
            >
              &times;
            </button>

            <div className="course-modal-header">
              <BookOpen size={24} className="text-blue" />
              <div>
                <h3>{selectedCourseModal.title}</h3>
                <p>Curriculum Outline &bull; Instructor: {selectedCourseModal.trainer || selectedCourseModal.provider}</p>
              </div>
            </div>

            <div className="course-modal-body">
              <p>{selectedCourseModal.description}</p>
              <div className="syllabus-modules-stack">
                <div className="module-item">
                  <strong>Module 1: Foundations &amp; Core Principles</strong>
                  <p>Theoretical framework, problem framing, and industry standard best practices.</p>
                </div>
                <div className="module-item">
                  <strong>Module 2: Practical Coding &amp; Applied Exercises</strong>
                  <p>Hands-on lab coding sessions, algorithmic implementations, and test debugging.</p>
                </div>
                <div className="module-item">
                  <strong>Module 3: Mock Interview Prototyping</strong>
                  <p>Simulated technical rounds with feedback from alumni working in Tier-1 MNCs.</p>
                </div>
              </div>
            </div>

            <div className="placement-modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setSelectedCourseModal(null)}
              >
                Close
              </button>
              {!selectedCourseModal.enrolled && (
                <button
                  type="button"
                  className="btn-modal-primary"
                  onClick={() => {
                    placementStore.updateTrainingProgram(selectedCourseModal.id, { enrolled: true, progress: 10 })
                    triggerToast(`Enrolled in ${selectedCourseModal.title}!`)
                    setSelectedCourseModal(null)
                    loadPlacementData()
                  }}
                >
                  Enroll Now &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
