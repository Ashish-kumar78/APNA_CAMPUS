import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  Briefcase,
  Building2,
  Building,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  DollarSign,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Menu,
  X,
  FileText,
  Printer,
  Download,
  Check,
  Slash,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  CalendarDays,
  ExternalLink,
  UserCheck,
  Sparkles,
  FileSpreadsheet,
  MessageSquare,
  BookOpen,
  Megaphone,
  Eye,
  Edit3,
  Trash2,
  Upload,
  AlertTriangle,
  Layers,
  Send,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import './PlacementPortal.css';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import placementStore from '../services/placementStore.js';
import { getAllStudents } from '../services/studentStore.js';
import InternshipCellManagement from './InternshipCell/InternshipCellManagement.jsx';
import BonafideReviewQueue from './Bonafide/BonafideReviewQueue.jsx';

export default function PlacementPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState('');

  // ── Centralized Store Subscriptions ──
  const [drives, setDrives] = useState(() => placementStore.getDrives());
  const [internships, setInternships] = useState(() => placementStore.getInternships());
  const [companies, setCompanies] = useState(() => placementStore.getCompanies());
  const [applications, setApplications] = useState(() => placementStore.getApplications());
  const [offers, setOffers] = useState(() => placementStore.getOffers());
  const [trainingPrograms, setTrainingPrograms] = useState(() => placementStore.getTrainingPrograms());
  const [notices, setNotices] = useState(() => placementStore.getNotices());
  const [naacReports, setNaacReports] = useState(() => placementStore.getNaacReports());
  const allStudents = useMemo(() => getAllStudents(), []);

  // Listen to store updates in real time
  useEffect(() => {
    const syncAll = () => {
      setDrives(placementStore.getDrives());
      setInternships(placementStore.getInternships());
      setCompanies(placementStore.getCompanies());
      setApplications(placementStore.getApplications());
      setOffers(placementStore.getOffers());
      setTrainingPrograms(placementStore.getTrainingPrograms());
      setNotices(placementStore.getNotices());
      setNaacReports(placementStore.getNaacReports());
    };

    const unsub = placementStore.subscribe(syncAll);
    window.addEventListener('cms_placement_updated', syncAll);
    return () => {
      unsub();
      window.removeEventListener('cms_placement_updated', syncAll);
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // ── Navigation Structure Matching Exact User Specification ──
  const placementNavSections = [
    {
      title: 'RECRUITMENT & DRIVES',
      items: [
        { id: 'dashboard', label: 'T&P Dashboard', icon: Briefcase },
        { id: 'drives', label: 'Placement Drives', icon: CalendarDays },
        { id: 'companies', label: 'Corporate Partners', icon: Building2 },
      ],
    },
    {
      title: 'STUDENTS & OUTCOMES',
      items: [
        { id: 'candidates', label: 'Eligible Candidates', icon: Users },
        { id: 'offers', label: 'Job Offers & Packages', icon: Award },
        { id: 'stats', label: 'Salary & CTC Distribution', icon: TrendingUp },
        { id: 'report-generation', label: 'NAAC Placement Reports', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'TRAINING & INTERNSHIPS',
      items: [
        { id: 'internship-cell', label: 'Internship Cell & ID Cards', icon: ShieldCheck },
        { id: 'bonafide-verification', label: 'Bonafide Verification', icon: FileCheck },
        { id: 'internships', label: 'Internship Drives & Ops', icon: Briefcase },
        { id: 'training', label: 'Training & Skill Development', icon: BookOpen },
      ],
    },
    {
      title: 'APPLICATIONS & COMMUNICATION',
      items: [
        { id: 'applications', label: 'Student Applications', icon: UserCheck },
        { id: 'notices', label: 'Placement Notices', icon: Megaphone },
      ],
    },
    {
      title: 'REPORTING',
      items: [
        { id: 'analytics', label: 'Placement Analytics & Reports', icon: FileText },
      ],
    },
  ];

  // ── Search & Filter States ──
  // Drives
  const [driveSearch, setDriveSearch] = useState('');
  const [driveStatusFilter, setDriveStatusFilter] = useState('ALL');

  // Internships
  const [internSearch, setInternSearch] = useState('');
  const [internStatusFilter, setInternStatusFilter] = useState('ALL');

  // Companies
  const [companySearch, setCompanySearch] = useState('');
  const [companyTierFilter, setCompanyTierFilter] = useState('ALL');

  // Candidates Eligibility
  const [selectedDriveForCandidateCheck, setSelectedDriveForCandidateCheck] = useState('ALL');
  const [candidateDeptFilter, setCandidateDeptFilter] = useState('ALL');
  const [candidateMinCgpa, setCandidateMinCgpa] = useState('0');
  const [candidateBacklogFilter, setCandidateBacklogFilter] = useState('ALL');
  const [candidateSearch, setCandidateSearch] = useState('');

  // Applications ATS
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStageFilter, setApplicantStageFilter] = useState('ALL');
  const [applicantCompanyFilter, setApplicantCompanyFilter] = useState('ALL');

  // Training
  const [trainingCategoryFilter, setTrainingCategoryFilter] = useState('ALL');
  const [trainingSearch, setTrainingSearch] = useState('');

  // Notices
  const [noticeSearch, setNoticeSearch] = useState('');

  // ── Modals State ──
  const [showAddDriveModal, setShowAddDriveModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [selectedDrivePreview, setSelectedDrivePreview] = useState(null);

  const [showAddInternshipModal, setShowAddInternshipModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [selectedInternshipPreview, setSelectedInternshipPreview] = useState(null);
  const [selectedInternshipApplicants, setSelectedInternshipApplicants] = useState(null);

  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedCompanyHistory, setSelectedCompanyHistory] = useState(null);

  const [showAdvanceStageModal, setShowAdvanceStageModal] = useState(false);
  const [selectedAppForAdvance, setSelectedAppForAdvance] = useState(null);

  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [selectedAppForSchedule, setSelectedAppForSchedule] = useState(null);

  const [showRecordOutcomeModal, setShowRecordOutcomeModal] = useState(false);
  const [selectedAppForOutcome, setSelectedAppForOutcome] = useState(null);

  const [selectedAppDossier, setSelectedAppDossier] = useState(null);

  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showPrintOfferModal, setShowPrintOfferModal] = useState(false);
  const [selectedOfferForPrint, setSelectedOfferForPrint] = useState(null);

  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);

  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [selectedNoticePreview, setSelectedNoticePreview] = useState(null);

  const [selectedNaacYear, setSelectedNaacYear] = useState('2026-27');

  // ── Form States ──
  // 1. Drive Form
  const [driveForm, setDriveForm] = useState({
    company: '',
    role: '',
    packageOffered: '₹7.5 LPA',
    packageLPA: 7.5,
    minCgpa: 7.0,
    maxBacklogs: 0,
    allowedBranches: 'CSE, ECE',
    passingYear: '2027',
    driveDate: '2026-11-20',
    venue: 'Campus Auditorium & Virtual Arena',
    employmentType: 'Full-time Regular',
    workMode: 'Hybrid',
    vacancies: 25,
    requiredSkills: 'Python, Data Structures, Problem Solving',
    companyWebsite: 'https://',
    recruiterContact: '',
    companyDescription: '',
    jobDescription: '',
    bond: 'No Bond',
    status: 'Published',
  });

  // 2. Internship Form
  const [internshipForm, setInternshipForm] = useState({
    title: '',
    company: '',
    role: '',
    description: '',
    requiredSkills: 'Python, SQL, React',
    eligibleBranches: 'Computer Science & Engineering, ECE',
    eligibleYears: '3rd Year (Semester 5/6)',
    minCgpa: 6.5,
    duration: '2 Months',
    startDate: '2026-12-01',
    endDate: '2027-01-31',
    workMode: 'Hybrid',
    location: 'Bhubaneswar / Remote',
    isPaid: true,
    stipend: '₹10,000/month',
    applicationOpenDate: new Date().toISOString().split('T')[0],
    deadline: '2026-11-25',
    openings: 10,
    applicationInstructions: 'Submit resume via student portal.',
    requiredDocs: 'Resume PDF, College Bonafide/NOC',
    contactInfo: 'careers@company.com',
    status: 'Published',
  });

  // 3. Company Form
  const [companyForm, setCompanyForm] = useState({
    name: '',
    category: 'Information Technology',
    website: 'https://',
    hrContact: '',
    email: '',
    phone: '',
    officeLocation: 'Bhubaneswar / Pan-India',
    packageRange: '₹4.5 LPA - ₹10.0 LPA',
    tier: 'Active Partner',
    mouStatus: 'Signed & Valid',
    description: '',
  });

  // 4. Offer Form
  const [offerForm, setOfferForm] = useState({
    studentName: '',
    regNo: '',
    department: 'Computer Science & Engineering',
    company: '',
    role: '',
    packageOffered: '₹7.5 LPA',
    fixedSalary: '₹6.5 LPA',
    variableSalary: '₹1.0 LPA',
    joiningDate: '2027-07-01',
    validityDeadline: '2026-12-31',
    notes: 'Employment offer issued through campus placement drive.',
  });

  // 5. Training Form
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    category: 'Aptitude Training',
    trainer: '',
    duration: '15 hours',
    schedule: 'Weekdays 04:30 PM - 06:30 PM',
    venue: 'Auditorium Hall B',
    targetBranches: 'CSE, ECE, EEE',
    targetYears: 'Semester 5, Semester 7',
    registrationDeadline: '2026-11-15',
    totalSeats: 150,
    description: '',
    status: 'Upcoming',
  });

  // 6. Notice Form
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'Campus Drive Notice',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '2026-12-15',
    targetBranches: 'All Branches',
    isUrgent: false,
    content: '',
    status: 'Published',
  });

  // 7. Stage Advance & Outcome Forms
  const [advanceForm, setAdvanceForm] = useState({
    nextStage: 'Technical Interview',
    score: '8.5 / 10',
    notes: '',
  });

  const [scheduleInterviewForm, setScheduleInterviewForm] = useState({
    interviewDate: '2026-10-30',
    interviewTime: '11:00 AM',
    venueOrLink: 'Virtual Assessment Lab 2 / Zoom',
    interviewerName: 'Technical Panel 1',
  });

  const [recordOutcomeForm, setRecordOutcomeForm] = useState({
    outcome: 'Selected',
    finalCtc: '₹7.5 LPA',
    notes: 'Candidate cleared all interview rounds and recommended for offer.',
  });

  // ── Handlers ──

  // Drive Handlers
  const handleSaveDrive = (e) => {
    e.preventDefault();
    if (!driveForm.company || !driveForm.role) {
      alert('Please fill Company Name and Role.');
      return;
    }
    if (editingDrive) {
      placementStore.updateDrive(editingDrive.id, driveForm);
      triggerToast(`Drive for ${driveForm.company} updated successfully.`);
      setEditingDrive(null);
    } else {
      const added = placementStore.addDrive(driveForm);
      triggerToast(`Recruitment drive for ${added.company} scheduled & published!`);
    }
    setShowAddDriveModal(false);
  };

  const handleToggleDrivePublish = (drive) => {
    const nextStatus = drive.status === 'Published' ? 'Draft' : 'Published';
    placementStore.setDriveStatus(drive.id, nextStatus);
    triggerToast(`Drive marked as "${nextStatus}". Changes synchronized to student portal.`);
  };

  const handleCloseDrive = (drive) => {
    placementStore.setDriveStatus(drive.id, 'Closed');
    triggerToast(`Applications closed for ${drive.company}.`);
  };

  // Internship Handlers
  const handleSaveInternship = (e) => {
    e.preventDefault();
    if (!internshipForm.title || !internshipForm.company) {
      alert('Please specify Internship Title and Company.');
      return;
    }
    if (editingInternship) {
      placementStore.updateInternship(editingInternship.id, internshipForm);
      triggerToast(`Internship "${internshipForm.title}" updated.`);
      setEditingInternship(null);
    } else {
      const added = placementStore.addInternship(internshipForm);
      triggerToast(`Internship opportunity "${added.title}" published to Student Dashboard!`);
    }
    setShowAddInternshipModal(false);
  };

  const handleToggleInternshipPublish = (intern) => {
    const nextStatus = intern.status === 'Published' ? 'Draft' : 'Published';
    placementStore.setInternshipStatus(intern.id, nextStatus);
    triggerToast(`Internship marked as "${nextStatus}". Reflects live in student portal.`);
  };

  const handleCloseInternship = (intern) => {
    placementStore.setInternshipStatus(intern.id, 'Closed');
    triggerToast(`Applications closed for "${intern.title}".`);
  };

  // Company Handlers
  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (!companyForm.name || !companyForm.email) {
      alert('Please provide Company Name and HR Email.');
      return;
    }
    if (editingCompany) {
      placementStore.updateCompany(editingCompany.id, companyForm);
      triggerToast(`Partner ${companyForm.name} updated.`);
      setEditingCompany(null);
    } else {
      placementStore.addCompany(companyForm);
      triggerToast(`Recruiting Partner ${companyForm.name} enrolled in directory.`);
    }
    setShowAddCompanyModal(false);
  };

  // Offer Handlers
  const handleSaveOffer = (e) => {
    e.preventDefault();
    if (!offerForm.studentName || !offerForm.company) {
      alert('Please specify Student Name and Company.');
      return;
    }
    const newOffer = placementStore.addOffer(offerForm);
    triggerToast(`Official offer letter released for ${newOffer.studentName} (${newOffer.company})!`);
    setShowAddOfferModal(false);
  };

  const handleOfferStatusChange = (offerId, status) => {
    placementStore.updateOfferStatus(offerId, status);
    triggerToast(`Offer status updated to "${status}".`);
  };

  // Training Handlers
  const handleSaveTraining = (e) => {
    e.preventDefault();
    if (!trainingForm.title) {
      alert('Please provide programme title.');
      return;
    }
    if (editingTraining) {
      placementStore.updateTrainingProgram(editingTraining.id, trainingForm);
      triggerToast(`Training session "${trainingForm.title}" updated.`);
      setEditingTraining(null);
    } else {
      placementStore.addTrainingProgram(trainingForm);
      triggerToast(`Skill development programme "${trainingForm.title}" scheduled!`);
    }
    setShowAddTrainingModal(false);
  };

  // Notice Handlers
  const handleSaveNotice = (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      alert('Please provide title and content.');
      return;
    }
    if (editingNotice) {
      placementStore.updateNotice(editingNotice.id, noticeForm);
      triggerToast(`Placement notice "${noticeForm.title}" updated.`);
      setEditingNotice(null);
    } else {
      placementStore.addNotice(noticeForm);
      triggerToast(`Placement notice published to campus broadcast!`);
    }
    setShowAddNoticeModal(false);
  };

  // Stage Advancement & Outcome Handlers
  const handleAdvanceStageSubmit = (e) => {
    e.preventDefault();
    if (!selectedAppForAdvance) return;
    placementStore.updateApplicationStage(selectedAppForAdvance.id, {
      stage: advanceForm.nextStage,
      status: `In ${advanceForm.nextStage}`,
      score: advanceForm.score,
      notes: advanceForm.notes,
    });
    triggerToast(`Advanced ${selectedAppForAdvance.studentName} to "${advanceForm.nextStage}".`);
    setShowAdvanceStageModal(false);
    setSelectedAppForAdvance(null);
  };

  const handleScheduleInterviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedAppForSchedule) return;
    const scheduleStr = `${scheduleInterviewForm.interviewDate} at ${scheduleInterviewForm.interviewTime} (${scheduleInterviewForm.venueOrLink})`;
    placementStore.updateApplicationStage(selectedAppForSchedule.id, {
      interviewSchedule: scheduleStr,
      notes: `Interview scheduled with ${scheduleInterviewForm.interviewerName} on ${scheduleInterviewForm.interviewDate}.`,
    });
    triggerToast(`Interview scheduled for ${selectedAppForSchedule.studentName}.`);
    setShowScheduleInterviewModal(false);
    setSelectedAppForSchedule(null);
  };

  const handleRecordOutcomeSubmit = (e) => {
    e.preventDefault();
    if (!selectedAppForOutcome) return;
    placementStore.recordSelectionOutcome(
      selectedAppForOutcome.id,
      recordOutcomeForm.outcome,
      recordOutcomeForm.finalCtc
    );
    triggerToast(`Candidate marked as "${recordOutcomeForm.outcome}" for ${selectedAppForOutcome.company}.`);
    setShowRecordOutcomeModal(false);
    setSelectedAppForOutcome(null);
  };

  // CSV Exports
  const exportApplicationsCSV = () => {
    const headers = ['Applicant ID,Candidate Name,Reg No,Branch,CGPA,Company,Role,Applied Date,Current Stage,Status,Interview Schedule,Final Outcome\n'];
    const rows = applications.map(a =>
      `"${a.id}","${a.studentName}","${a.regNo}","${a.branch}","${a.cgpa}","${a.company}","${a.jobRole}","${a.appliedDate}","${a.stage}","${a.status}","${a.interviewSchedule || 'N/A'}","${a.finalResult || 'In Progress'}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApnaCampus_Placement_ATS_Candidates_2026.csv`;
    a.click();
    triggerToast('ATS Candidates Manifest CSV downloaded.');
  };

  const exportOffersCSV = () => {
    const headers = ['Offer ID,Offer Token,Student Name,Reg No,Department,Company,Role,Package CTC,Fixed Salary,Variable Bonus,Joining Date,Status\n'];
    const rows = offers.map(o =>
      `"${o.id}","${o.offerToken}","${o.studentName}","${o.regNo}","${o.department}","${o.company}","${o.role}","${o.packageOffered}","${o.fixedSalary}","${o.variableSalary}","${o.joiningDate}","${o.status}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApnaCampus_Official_Offers_2026.csv`;
    a.click();
    triggerToast('Offers Manifest CSV downloaded.');
  };

  const exportCensusCSV = () => {
    const stats = naacReports.find(r => r.academicYear === selectedNaacYear) || naacReports[0];
    const headers = ['Department Code,Branch Name,Eligible Students,Students Placed,Total Offers,Placement Rate (%),Average CTC,Median CTC,Highest CTC\n'];
    const rows = (stats?.branchMetrics || []).map(b =>
      `"${b.code}","${b.branch}","${b.eligible}","${b.placed}","${b.offers}","${b.placementRate}%","${b.avgCTC}","${b.medianCTC}","${b.highestCTC}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApnaCampus_Placement_Census_${selectedNaacYear}.csv`;
    a.click();
    triggerToast(`Placement Census CSV (${selectedNaacYear}) downloaded.`);
  };

  // ── Filtered Queries ──
  const filteredDrives = drives.filter(d => {
    const matchesSearch = (d.company || '').toLowerCase().includes(driveSearch.toLowerCase()) ||
      (d.role || '').toLowerCase().includes(driveSearch.toLowerCase());
    if (driveStatusFilter === 'ALL') return matchesSearch;
    return matchesSearch && (d.status || '').toLowerCase() === driveStatusFilter.toLowerCase();
  });

  const filteredInternships = internships.filter(i => {
    const matchesSearch = (i.company || '').toLowerCase().includes(internSearch.toLowerCase()) ||
      (i.title || i.role || '').toLowerCase().includes(internSearch.toLowerCase());
    if (internStatusFilter === 'ALL') return matchesSearch;
    return matchesSearch && (i.status || '').toLowerCase() === internStatusFilter.toLowerCase();
  });

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.hrContact || '').toLowerCase().includes(companySearch.toLowerCase());
    if (companyTierFilter === 'ALL') return matchesSearch;
    return matchesSearch && (c.tier || c.status || '').toLowerCase().includes(companyTierFilter.toLowerCase());
  });

  const filteredApplications = applications.filter(a => {
    const matchesSearch = (a.studentName || '').toLowerCase().includes(applicantSearch.toLowerCase()) ||
      (a.regNo || '').toLowerCase().includes(applicantSearch.toLowerCase()) ||
      (a.company || '').toLowerCase().includes(applicantSearch.toLowerCase()) ||
      (a.jobRole || '').toLowerCase().includes(applicantSearch.toLowerCase());
    const matchesStage = applicantStageFilter === 'ALL' || (a.stage || '').toLowerCase().includes(applicantStageFilter.toLowerCase());
    const matchesCompany = applicantCompanyFilter === 'ALL' || a.company === applicantCompanyFilter;
    return matchesSearch && matchesStage && matchesCompany;
  });

  const filteredTraining = trainingPrograms.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(trainingSearch.toLowerCase()) ||
      (t.trainer || '').toLowerCase().includes(trainingSearch.toLowerCase());
    if (trainingCategoryFilter === 'ALL') return matchesSearch;
    return matchesSearch && (t.category || '').toLowerCase().includes(trainingCategoryFilter.toLowerCase());
  });

  const filteredNotices = notices.filter(n => {
    return (n.title || '').toLowerCase().includes(noticeSearch.toLowerCase()) ||
      (n.content || '').toLowerCase().includes(noticeSearch.toLowerCase());
  });

  // Candidate Eligibility Engine
  const selectedDriveObject = drives.find(d => d.id === selectedDriveForCandidateCheck || d.company === selectedDriveForCandidateCheck);

  const evaluatedStudents = useMemo(() => {
    return allStudents.map(student => {
      const studentCgpa = Number(student.cgpa) || 8.0;
      const studentDept = student.deptCode || (student.department?.includes('Computer') ? 'CSE' : student.department?.includes('Electronics') ? 'ECE' : 'MECH');
      const studentBacklogs = student.backlogCount !== undefined ? Number(student.backlogCount) : 0;
      const passReasons = [];
      const failReasons = [];

      if (selectedDriveObject) {
        const minCgpa = selectedDriveObject.eligibilityCriteria?.minCgpa || 6.5;
        const maxBacklogs = selectedDriveObject.eligibilityCriteria?.maxBacklogs ?? 0;
        const allowedBranches = selectedDriveObject.eligibilityCriteria?.allowedBranches || ['CSE', 'ECE'];

        if (studentCgpa >= minCgpa) {
          passReasons.push(`CGPA: ${studentCgpa} ≥ ${minCgpa}`);
        } else {
          failReasons.push(`CGPA ${studentCgpa} below cutoff of ${minCgpa}`);
        }

        const isBranchAllowed = allowedBranches.some(b =>
          b.toUpperCase() === studentDept.toUpperCase() ||
          (student.department && student.department.toUpperCase().includes(b.toUpperCase()))
        );
        if (isBranchAllowed) {
          passReasons.push(`Branch ${studentDept} allowed`);
        } else {
          failReasons.push(`Branch ${studentDept} not eligible for drive`);
        }

        if (studentBacklogs <= maxBacklogs) {
          passReasons.push(`Backlogs: ${studentBacklogs} (Max: ${maxBacklogs})`);
        } else {
          failReasons.push(`Has ${studentBacklogs} backlogs (Max: ${maxBacklogs})`);
        }
      } else {
        if (studentCgpa >= 6.5) passReasons.push(`CGPA ${studentCgpa} ≥ 6.5`);
        else failReasons.push(`CGPA ${studentCgpa} below generic threshold`);
        if (studentBacklogs === 0) passReasons.push(`No active backlogs`);
        else failReasons.push(`${studentBacklogs} active backlogs`);
      }

      const isEligible = failReasons.length === 0;

      return {
        ...student,
        calculatedCgpa: studentCgpa,
        calculatedDept: studentDept,
        calculatedBacklogs: studentBacklogs,
        isEligible,
        passReasons,
        failReasons,
        placementRegistrationStatus: 'Registered',
        internshipParticipation: student.id === 'std-1' ? 'Enrolled Active' : 'Completed',
      };
    });
  }, [allStudents, selectedDriveObject]);

  const filteredCandidates = evaluatedStudents.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(candidateSearch.toLowerCase()) ||
      (s.registrationNumber || s.rollNumber || '').toLowerCase().includes(candidateSearch.toLowerCase());
    const matchesDept = candidateDeptFilter === 'ALL' || s.calculatedDept === candidateDeptFilter;
    const matchesCgpa = candidateMinCgpa === '0' || s.calculatedCgpa >= Number(candidateMinCgpa);
    const matchesBacklog = candidateBacklogFilter === 'ALL' ||
      (candidateBacklogFilter === '0' && s.calculatedBacklogs === 0) ||
      (candidateBacklogFilter === '1' && s.calculatedBacklogs <= 1);

    return matchesSearch && matchesDept && matchesCgpa && matchesBacklog;
  });

  const overviewMetrics = placementStore.getOverviewMetrics();

  const getPageHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Training & Corporate Placement Cell',
          subtitle: 'Executive overview of campus recruitment drives, student interview funnels, corporate MoUs, and compensation metrics.',
        };
      case 'drives':
        return {
          title: 'On-Campus & Virtual Recruitment Drives',
          subtitle: 'Create, publish, edit and track enterprise hiring drives. Updates synchronize live to student dashboards.',
        };
      case 'companies':
        return {
          title: 'Corporate Partners & Recruiter Directory',
          subtitle: 'Tier-1 technology firms, core engineering leaders, recruiters, campus visit schedules, and institutional MoUs.',
        };
      case 'candidates':
        return {
          title: 'Student Eligibility Verification Engine',
          subtitle: 'Cohort eligibility evaluation based on deterministic CGPA cutoffs, backlog thresholds, and departmental disciplines.',
        };
      case 'offers':
        return {
          title: 'Official Job Offers & Compensation Verification',
          subtitle: 'Issue Letters of Intent, review fixed/variable compensation structures, and track student acceptance compliance.',
        };
      case 'stats':
        return {
          title: 'Salary & CTC Distribution Analytics',
          subtitle: 'Comprehensive compensation distributions, highest/median benchmarks, and departmental conversion percentages.',
        };
      case 'report-generation':
        return {
          title: 'NAAC Placement Reports (Criterion 5.2.1)',
          subtitle: 'Academic year-wise institutional placement dossiers, salary brackets, and statutory evidence documentation.',
        };
      case 'internships':
        return {
          title: 'Corporate Internship Management',
          subtitle: 'Publish, edit, preview and control summer/industrial internship opportunities that appear on student portals.',
        };
      case 'training':
        return {
          title: 'Training & Skill Development Directorate',
          subtitle: 'Manage aptitude workshops, DSA bootcamps, mock technical interviews, and soft-skills prep programmes.',
        };
      case 'applications':
        return {
          title: 'Student Applications (ATS Pipeline)',
          subtitle: 'End-to-end applicant tracking: screening, technical assessment, interview coordination, and explicit selection outcomes.',
        };
      case 'notices':
        return {
          title: 'Official Placement Notices & Circulars',
          subtitle: 'Publish urgent drive circulars, test schedules, and student announcements to portal and Campus Connect.',
        };
      case 'analytics':
        return {
          title: 'Placement Analytics & Outcome Reports',
          subtitle: 'Conversion funnel analytics, corporate hiring volumes, year-on-year growth, and exportable manifest datasets.',
        };
      default:
        return {
          title: (activeTab || 'Placement Portal').replace(/-/g, ' ').toUpperCase(),
          subtitle: 'Training & Placement Directorate',
        };
    }
  };

  const pageHeading = getPageHeading();

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Universal Standard AppLayout */}
      <AppLayout
        account={account}
        portalName="Placement Portal"
        portalSubtitle="Training & Corporate Relations Cell"
        portalHomeTab="dashboard"
        navSections={placementNavSections}
        activeTab={activeTab === 'applicants' ? 'candidates' : activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={onLogout}
        pageTitle={pageHeading.title}
        pageSubtitle={pageHeading.subtitle}
      >
        <div className="placement-portal-content-wrap">
          <div className="erp-content-body">

            {/* ═════════════════════════════════════════════════════════════
                TAB 1: T&P DASHBOARD (SECTION 4 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <div className="tp-dashboard-wrapper">
                {/* 8 Summary Cards as explicitly mandated in Section 4 */}
                <div className="erp-stats-grid">
                  <div className="erp-stat-card erp-stat-card-clickable" onClick={() => setActiveTab('candidates')}>
                    <div className="erp-stat-card-header">
                      <span className="erp-stat-card-title">Registered Students</span>
                      <Users size={18} color="#2563eb" />
                    </div>
                    <div className="erp-stat-val">{overviewMetrics.totalRegisteredStudents}</div>
                    <div className="erp-stat-sub" style={{ color: '#0284c7' }}>Final Year Batch 2027 Cohort</div>
                  </div>

                  <div className="erp-stat-card erp-stat-card-clickable" onClick={() => setActiveTab('candidates')}>
                    <div className="erp-stat-card-header">
                      <span className="erp-stat-card-title">Eligible Candidates</span>
                      <ShieldCheck size={18} color="#10b981" />
                    </div>
                    <div className="erp-stat-val">{overviewMetrics.eligibleForPlacements}</div>
                    <div className="erp-stat-sub" style={{ color: '#059669' }}>
                      {Math.round((overviewMetrics.eligibleForPlacements / overviewMetrics.totalRegisteredStudents) * 100)}% of cohort verified
                    </div>
                  </div>

                  <div className="erp-stat-card erp-stat-card-clickable" onClick={() => setActiveTab('drives')}>
                    <div className="erp-stat-card-header">
                      <span className="erp-stat-card-title">Active Placement Drives</span>
                      <CalendarDays size={18} color="#8b5cf6" />
                    </div>
                    <div className="erp-stat-val">{overviewMetrics.activeDrivesCount} Live</div>
                    <div className="erp-stat-sub" style={{ color: '#7c3aed' }}>Visible on Student Dashboard</div>
                  </div>

                  <div className="erp-stat-card erp-stat-card-clickable" onClick={() => setActiveTab('drives')}>
                    <div className="erp-stat-card-header">
                      <span className="erp-stat-card-title">Upcoming Drives</span>
                      <Clock size={18} color="#f59e0b" />
                    </div>
                    <div className="erp-stat-val">{overviewMetrics.upcomingDrivesCount} Scheduled</div>
                    <div className="erp-stat-sub" style={{ color: '#d97706' }}>This month on campus</div>
                  </div>

                  <div className="erp-stat-card erp-stat-card-clickable" onClick={() => setActiveTab('stats')}>
                    <div className="erp-stat-card-header">
                      <span className="erp-stat-card-title">Students Placed</span>
                      <Award size={18} color="#ec4899" />
                    </div>
                    <div className="erp-stat-val">{overviewMetrics.studentsPlaced}</div>
                    <div className="erp-stat-sub" style={{ color: '#db2777' }}>
                      {overviewMetrics.placementRate}% placement rate
                    </div>
                  </div>

                  <div className="erp-stat-card erp-stat-card-clickable" onClick={() => setActiveTab('internships')}>
                    <div className="erp-stat-card-header">
                      <span className="erp-stat-card-title">Internship Offers</span>
                      <Briefcase size={18} color="#06b6d4" />
                    </div>
                    <div className="erp-stat-val">{overviewMetrics.studentsWithInternships}</div>
                    <div className="erp-stat-sub" style={{ color: '#0891b2' }}>Summer &amp; Industrial SIP</div>
                  </div>

                  <div className="erp-stat-card erp-stat-card-clickable" onClick={() => setActiveTab('companies')}>
                    <div className="erp-stat-card-header">
                      <span className="erp-stat-card-title">Companies Participating</span>
                      <Building2 size={18} color="#6366f1" />
                    </div>
                    <div className="erp-stat-val">{overviewMetrics.totalCompanies} Companies</div>
                    <div className="erp-stat-sub" style={{ color: '#4f46e5' }}>Active MoU partners</div>
                  </div>

                  <div className="erp-stat-card erp-stat-card-clickable" onClick={() => setActiveTab('applications')}>
                    <div className="erp-stat-card-header">
                      <span className="erp-stat-card-title">Pending Applications</span>
                      <AlertCircle size={18} color="#ea580c" />
                    </div>
                    <div className="erp-stat-val">{overviewMetrics.pendingTasksCount} Tasks</div>
                    <div className="erp-stat-sub" style={{ color: '#c2410c' }}>Requires screening review</div>
                  </div>
                </div>

                {/* Widget Grid: Upcoming Drives + Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>

                  {/* Widget A: Upcoming Placement Drives */}
                  <div className="erp-panel">
                    <div className="erp-panel-header">
                      <div className="erp-panel-title">
                        <h3>Upcoming Campus Drives</h3>
                        <p>Dates, eligible branches, and registration deadlines</p>
                      </div>
                      <button className="erp-btn-secondary erp-btn-sm" onClick={() => setActiveTab('drives')}>
                        View All ({drives.length}) →
                      </button>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {drives.slice(0, 4).map(d => (
                        <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: d.companyColor || '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                              {d.companyLogo || d.company.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>{d.company}</strong>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{d.role} · <strong style={{ color: '#f59e0b' }}>{d.packageOffered}</strong></span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#0284c7', display: 'block' }}>Drive: {d.driveDate}</span>
                            <small style={{ fontSize: '0.7rem', color: '#ef4444' }}>Deadline: {d.recruitmentProcess?.applicationDeadline || 'Open'}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Widget E: Quick Actions */}
                  <div className="erp-panel">
                    <div className="erp-panel-header">
                      <div className="erp-panel-title">
                        <h3>Placement Quick Actions</h3>
                        <p>One-click management actions for placement officers</p>
                      </div>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      <button
                        type="button"
                        className="erp-btn-primary"
                        style={{ padding: '12px', justifyContent: 'center', fontSize: '0.82rem', background: '#2563eb' }}
                        onClick={() => {
                          setEditingDrive(null);
                          setShowAddDriveModal(true);
                        }}
                      >
                        <Plus size={15} /> Create Placement Drive
                      </button>

                      <button
                        type="button"
                        className="erp-btn-primary"
                        style={{ padding: '12px', justifyContent: 'center', fontSize: '0.82rem', background: '#059669' }}
                        onClick={() => {
                          setEditingInternship(null);
                          setShowAddInternshipModal(true);
                        }}
                      >
                        <Briefcase size={15} /> Publish Internship
                      </button>

                      <button
                        type="button"
                        className="erp-btn-secondary"
                        style={{ padding: '12px', justifyContent: 'center', fontSize: '0.82rem' }}
                        onClick={() => {
                          setEditingCompany(null);
                          setShowAddCompanyModal(true);
                        }}
                      >
                        <Building2 size={15} /> Add Corporate Partner
                      </button>

                      <button
                        type="button"
                        className="erp-btn-secondary"
                        style={{ padding: '12px', justifyContent: 'center', fontSize: '0.82rem' }}
                        onClick={() => {
                          setEditingNotice(null);
                          setShowAddNoticeModal(true);
                        }}
                      >
                        <Megaphone size={15} /> Publish Notice
                      </button>

                      <button
                        type="button"
                        className="erp-btn-secondary"
                        style={{ padding: '12px', justifyContent: 'center', fontSize: '0.82rem' }}
                        onClick={() => setActiveTab('applications')}
                      >
                        <UserCheck size={15} /> View Student Applications
                      </button>

                      <button
                        type="button"
                        className="erp-btn-secondary"
                        style={{ padding: '12px', justifyContent: 'center', fontSize: '0.82rem' }}
                        onClick={() => setActiveTab('report-generation')}
                      >
                        <FileSpreadsheet size={15} /> Generate Placement Report
                      </button>
                    </div>

                    {/* Widget D: Pending Actions Alert Strip */}
                    <div style={{ margin: '0 1.25rem 1.25rem', padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '0.78rem', color: '#92400e' }}>
                      <strong>⚠️ Pending Tasks Requiring T&amp;P Attention:</strong>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        <li>1 Draft drive (AWS Super Dream) awaiting publication approval.</li>
                        <li>{overviewMetrics.pendingTasksCount} Student applications pending screening &amp; interview scheduling.</li>
                        <li>2 Issued job offers pending student verification.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Widget B & C: Recent Placement Activities & Statistics Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>

                  {/* Widget B: Recent Placement Activities */}
                  <div className="erp-panel">
                    <div className="erp-panel-header">
                      <div className="erp-panel-title">
                        <h3>Recent Placement Activities</h3>
                        <p>Timeline of campus shortlists, drives, and selection outcomes</p>
                      </div>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <Check size={14} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Cisco Systems Selection Results Declared</strong>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>28 Final-year B.Tech students secured dream offers of ₹18.5 LPA. Letters of intent issued.</span>
                          <small style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Yesterday at 04:30 PM</small>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <Briefcase size={14} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>TechSurge India Machine Learning Internship Drive Live</strong>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>New opportunity published with ₹8,000/month stipend. Open for applications on Student Dashboard.</span>
                          <small style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>18 Oct 2026, 11:00 AM</small>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <UserCheck size={14} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Cognizant GenC Next Assessment Shortlist Released</strong>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>110 Students shortlisted for technical interview round scheduled in Labs 1-4.</span>
                          <small style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>16 Oct 2026, 02:15 PM</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Widget C: Department-wise Placement Statistics */}
                  <div className="erp-panel">
                    <div className="erp-panel-header">
                      <div className="erp-panel-title">
                        <h3>Department Outcomes Snapshot</h3>
                        <p>Conversion rates for Graduation Batch 2026-27</p>
                      </div>
                      <button className="erp-btn-secondary erp-btn-sm" onClick={() => setActiveTab('stats')}>
                        Full Analysis →
                      </button>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { branch: 'Computer Science & Engineering', placed: 152, total: 160, pct: 95.0, color: '#10b981' },
                        { branch: 'Electronics & Communication', placed: 78, total: 90, pct: 86.7, color: '#3b82f6' },
                        { branch: 'Electrical & Electronics', placed: 48, total: 60, pct: 80.0, color: '#8b5cf6' },
                        { branch: 'Mechanical Engineering', placed: 41, total: 55, pct: 74.5, color: '#f59e0b' },
                        { branch: 'Civil Engineering', placed: 24, total: 35, pct: 68.6, color: '#ec4899' },
                      ].map(item => (
                        <div key={item.branch} style={{ fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <strong style={{ color: '#0f172a' }}>{item.branch}</strong>
                            <span style={{ color: '#475569' }}>{item.placed} / {item.total} Placed ({item.pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.pct}%`, height: '100%', background: item.color }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 2: PLACEMENT DRIVES (SECTION 5 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'drives' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Placement Drives Management</h3>
                    <p>Create, edit, preview, publish, unpublish, and close campus recruitment drives</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button
                      type="button"
                      className="erp-btn-primary"
                      onClick={() => {
                        setEditingDrive(null);
                        setDriveForm({
                          company: '',
                          role: '',
                          packageOffered: '₹7.5 LPA',
                          packageLPA: 7.5,
                          minCgpa: 7.0,
                          maxBacklogs: 0,
                          allowedBranches: 'CSE, ECE',
                          passingYear: '2027',
                          driveDate: '2026-11-20',
                          venue: 'Campus Auditorium & Virtual Arena',
                          employmentType: 'Full-time Regular',
                          workMode: 'Hybrid',
                          vacancies: 25,
                          requiredSkills: 'Python, Data Structures, Problem Solving',
                          companyWebsite: 'https://',
                          recruiterContact: '',
                          companyDescription: '',
                          jobDescription: '',
                          bond: 'No Bond',
                          status: 'Published',
                        });
                        setShowAddDriveModal(true);
                      }}
                    >
                      <Plus size={16} /> Schedule Placement Drive
                    </button>
                  </div>
                </div>

                <div className="erp-filter-bar">
                  <div className="erp-search-input">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search drive by company, role, skills..."
                      value={driveSearch}
                      onChange={(e) => setDriveSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} color="#64748b" />
                    <select
                      value={driveStatusFilter}
                      onChange={(e) => setDriveStatusFilter(e.target.value)}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        background: '#ffffff',
                      }}
                    >
                      <option value="ALL">All Publication Statuses</option>
                      <option value="Published">Published (Visible to Students)</option>
                      <option value="Draft">Draft (Internal Only)</option>
                      <option value="Closed">Applications Closed</option>
                    </select>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Company &amp; Role</th>
                        <th>Compensation (CTC)</th>
                        <th>Drive Timeline</th>
                        <th>Eligibility Cutoffs</th>
                        <th>Applicant Counts</th>
                        <th>Status</th>
                        <th>Management Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDrives.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No placement drives match filters.</td></tr>
                      ) : (
                        filteredDrives.map(drive => (
                          <tr key={drive.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: drive.companyColor || '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                                  {drive.companyLogo || drive.company.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{drive.company}</strong>
                                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{drive.role} · {drive.workMode || 'On-site'}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: '#f59e0b', fontSize: '0.92rem' }}>{drive.packageOffered}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Vacancies: {drive.vacancies || 20}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Drive: {drive.driveDate}</div>
                              <div style={{ fontSize: '0.74rem', color: '#ef4444' }}>
                                Deadline: {drive.recruitmentProcess?.applicationDeadline || 'Open'}
                              </div>
                            </td>
                            <td style={{ maxWidth: '240px' }}>
                              <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                                Min CGPA: <strong>{drive.eligibilityCriteria?.minCgpa || 6.5}</strong> · Backlogs: Max {drive.eligibilityCriteria?.maxBacklogs ?? 0}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                                {Array.isArray(drive.eligibilityCriteria?.allowedBranches)
                                  ? drive.eligibilityCriteria.allowedBranches.join(', ')
                                  : drive.eligibilityCriteria?.allowedBranches}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem' }}><strong>{drive.registeredCount || 0}</strong> Registered</div>
                              <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                                {drive.shortlistedCount || 0} Shortlisted · {drive.selectedCount || 0} Offers
                              </div>
                            </td>
                            <td>
                              <span className={`badge-status ${drive.status === 'Published' ? 'active' : drive.status === 'Draft' ? 'warning' : 'danger'}`}>
                                {drive.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => setSelectedDrivePreview(drive)}
                                  title="Preview student opportunity view"
                                >
                                  <Eye size={12} /> Preview
                                </button>
                                <button
                                  type="button"
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => {
                                    setEditingDrive(drive);
                                    setDriveForm({
                                      company: drive.company,
                                      role: drive.role,
                                      packageOffered: drive.packageOffered,
                                      packageLPA: drive.packageLPA,
                                      minCgpa: drive.eligibilityCriteria?.minCgpa || 6.5,
                                      maxBacklogs: drive.eligibilityCriteria?.maxBacklogs ?? 0,
                                      allowedBranches: Array.isArray(drive.eligibilityCriteria?.allowedBranches)
                                        ? drive.eligibilityCriteria.allowedBranches.join(', ')
                                        : drive.eligibilityCriteria?.allowedBranches || '',
                                      passingYear: drive.eligibilityCriteria?.passingYear || '2027',
                                      driveDate: drive.driveDate,
                                      venue: drive.venue,
                                      employmentType: drive.employmentType || 'Full-time Regular',
                                      workMode: drive.workMode || 'Hybrid',
                                      vacancies: drive.vacancies || 20,
                                      requiredSkills: Array.isArray(drive.requiredSkills) ? drive.requiredSkills.join(', ') : drive.requiredSkills || '',
                                      companyWebsite: drive.companyWebsite || '',
                                      recruiterContact: drive.recruiterContact || '',
                                      companyDescription: drive.companyDescription || '',
                                      jobDescription: drive.jobDescription || '',
                                      bond: drive.bond || 'No Bond',
                                      status: drive.status || 'Published',
                                    });
                                    setShowAddDriveModal(true);
                                  }}
                                  title="Edit drive details"
                                >
                                  <Edit3 size={12} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className={`erp-btn-sm ${drive.status === 'Published' ? 'erp-btn-secondary' : 'erp-btn-primary'}`}
                                  onClick={() => handleToggleDrivePublish(drive)}
                                  style={drive.status !== 'Published' ? { background: '#10b981' } : {}}
                                >
                                  {drive.status === 'Published' ? 'Unpublish' : 'Publish'}
                                </button>
                                {drive.status !== 'Closed' && (
                                  <button
                                    type="button"
                                    className="erp-btn-secondary erp-btn-sm"
                                    onClick={() => handleCloseDrive(drive)}
                                    title="Close student applications"
                                  >
                                    Close
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 3: CORPORATE PARTNERS (SECTION 6 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'companies' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Corporate Partners &amp; Recruiter Directory</h3>
                    <p>Company profiles, recruiter HR contact information, campus recruitment history, and MoUs</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button
                      type="button"
                      className="erp-btn-primary"
                      onClick={() => {
                        setEditingCompany(null);
                        setCompanyForm({
                          name: '',
                          category: 'Information Technology',
                          website: 'https://',
                          hrContact: '',
                          email: '',
                          phone: '',
                          officeLocation: 'Bhubaneswar / Pan-India',
                          packageRange: '₹4.5 LPA - ₹10.0 LPA',
                          tier: 'Active Partner',
                          mouStatus: 'Signed & Valid',
                          description: '',
                        });
                        setShowAddCompanyModal(true);
                      }}
                    >
                      <Plus size={16} /> Enroll Corporate Partner
                    </button>
                  </div>
                </div>

                <div className="erp-filter-bar">
                  <div className="erp-search-input">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search company by name, HR contact, category..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} color="#64748b" />
                    <select
                      value={companyTierFilter}
                      onChange={(e) => setCompanyTierFilter(e.target.value)}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        background: '#ffffff',
                      }}
                    >
                      <option value="ALL">All Partner Tiers</option>
                      <option value="Dream">Super Dream / Dream Tier</option>
                      <option value="Tier 1">Tier 1 Partners</option>
                      <option value="Active">Active Partners</option>
                    </select>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Company Profile</th>
                        <th>Industry / Sector</th>
                        <th>Recruiter &amp; HR Contact</th>
                        <th>Typical CTC Range</th>
                        <th>Alumni Hired</th>
                        <th>Tier &amp; MoU Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map(c => (
                        <tr key={c.id}>
                          <td>
                            <strong style={{ fontSize: '0.88rem' }}>{c.name}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.officeLocation || 'Pan-India'}</div>
                          </td>
                          <td style={{ color: '#475569' }}>{c.category}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{c.hrContact}</div>
                            <div style={{ fontSize: '0.74rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={11} /> {c.email}
                            </div>
                            {c.phone && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={10} /> {c.phone}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: '#f59e0b' }}>{c.packageRange}</strong>
                          </td>
                          <td>
                            <strong>{c.totalHiredFromCampus || 0} Engineers</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Last Visit: {c.lastVisitDate || '2026'}</div>
                          </td>
                          <td>
                            <span className={`badge-status ${(c.tier || '').includes('Dream') ? 'warning' : 'active'}`}>
                              {c.tier || c.status}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                              MoU: {c.mouStatus || 'Active'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="erp-btn-secondary erp-btn-sm"
                                onClick={() => setSelectedCompanyHistory(c)}
                                title="View placement history and past hiring records"
                              >
                                View History
                              </button>
                              <button
                                type="button"
                                className="erp-btn-secondary erp-btn-sm"
                                onClick={() => {
                                  setEditingCompany(c);
                                  setCompanyForm({
                                    name: c.name,
                                    category: c.category,
                                    website: c.website || 'https://',
                                    hrContact: c.hrContact,
                                    email: c.email,
                                    phone: c.phone || '',
                                    officeLocation: c.officeLocation || '',
                                    packageRange: c.packageRange,
                                    tier: c.tier || 'Active Partner',
                                    mouStatus: c.mouStatus || 'Signed & Valid',
                                    description: c.description || '',
                                  });
                                  setShowAddCompanyModal(true);
                                }}
                              >
                                <Edit3 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 4: ELIGIBLE CANDIDATES (SECTION 7 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'candidates' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Student Eligibility Verification Engine</h3>
                    <p>Evaluate cohort students against drive criteria, CGPA cutoffs, backlogs, and academic departments</p>
                  </div>
                  <div className="erp-panel-actions">
                    <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                      Showing {filteredCandidates.length} Candidates
                    </span>
                  </div>
                </div>

                {/* Drive Selection & Criteria Strip */}
                <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Evaluate for Drive:</label>
                    <select
                      value={selectedDriveForCandidateCheck}
                      onChange={(e) => setSelectedDriveForCandidateCheck(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '0.84rem', background: '#fff', fontWeight: 600 }}
                    >
                      <option value="ALL">All Drives (Generic Autonomous Cutoff: CGPA 6.5)</option>
                      {drives.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.company} ({d.role}) · Min CGPA {d.eligibilityCriteria?.minCgpa || 6.5}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDriveObject && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#065f46' }}>
                      <strong>Criteria:</strong> CGPA ≥ {selectedDriveObject.eligibilityCriteria?.minCgpa || 6.5} · Max Backlogs: {selectedDriveObject.eligibilityCriteria?.maxBacklogs ?? 0} · Allowed: {Array.isArray(selectedDriveObject.eligibilityCriteria?.allowedBranches) ? selectedDriveObject.eligibilityCriteria.allowedBranches.join(', ') : selectedDriveObject.eligibilityCriteria?.allowedBranches}
                    </div>
                  )}
                </div>

                {/* Multi-Filter Bar */}
                <div className="erp-filter-bar">
                  <div className="erp-search-input">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search student by name, roll no, reg no..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <select
                      value={candidateDeptFilter}
                      onChange={(e) => setCandidateDeptFilter(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="ALL">All Departments</option>
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="EEE">Electrical (EEE)</option>
                      <option value="MECH">Mechanical (MECH)</option>
                      <option value="CIVIL">Civil (CIVIL)</option>
                    </select>

                    <select
                      value={candidateMinCgpa}
                      onChange={(e) => setCandidateMinCgpa(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="0">CGPA: Any Range</option>
                      <option value="8.0">CGPA ≥ 8.0 (Dream Tier)</option>
                      <option value="7.0">CGPA ≥ 7.0 (First Class)</option>
                      <option value="6.0">CGPA ≥ 6.0 (Graduation Cutoff)</option>
                    </select>

                    <select
                      value={candidateBacklogFilter}
                      onChange={(e) => setCandidateBacklogFilter(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="ALL">All Backlog Statuses</option>
                      <option value="0">0 Active Backlogs (Clean)</option>
                      <option value="1">≤ 1 Backlog</option>
                    </select>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Student Candidate</th>
                        <th>Branch &amp; Semester</th>
                        <th>Academic Record (CGPA)</th>
                        <th>Backlogs</th>
                        <th>Placement Registration</th>
                        <th>Eligibility Decision</th>
                        <th>Criteria Breakdown</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map(c => (
                        <tr key={c.id}>
                          <td>
                            <strong style={{ fontSize: '0.88rem' }}>{c.name}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                              Reg: {c.registrationNumber || c.studentId} · Roll: {c.rollNumber}
                            </div>
                          </td>
                          <td>
                            <div>{c.department || c.course}</div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Semester {c.currentSemester || 5} · Batch 2027</span>
                          </td>
                          <td>
                            <strong style={{ color: '#059669', fontSize: '0.92rem' }}>CGPA {c.calculatedCgpa}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Attendance: {c.attendance || 88}%</div>
                          </td>
                          <td>
                            <span className={`badge-status ${c.calculatedBacklogs === 0 ? 'active' : 'danger'}`}>
                              {c.calculatedBacklogs === 0 ? '0 Backlogs' : `${c.calculatedBacklogs} Backlogs`}
                            </span>
                          </td>
                          <td>
                            <span className="badge-status active">Registered</span>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                              Intern: {c.internshipParticipation}
                            </div>
                          </td>
                          <td>
                            <span className={`badge-status ${c.isEligible ? 'active' : 'danger'}`}>
                              {c.isEligible ? 'Eligible' : 'Ineligible'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.72rem', maxWidth: '240px', lineHeight: 1.4 }}>
                              {c.isEligible ? (
                                <span style={{ color: '#059669', fontWeight: 600 }}>
                                  ✓ Meets all configured cutoff criteria
                                </span>
                              ) : (
                                <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                  ✗ {c.failReasons.join('; ')}
                                </span>
                              )}
                            </div>
                            {selectedDriveObject && c.isEligible && (
                              <button
                                type="button"
                                className="erp-btn-primary erp-btn-sm"
                                style={{ marginTop: '4px', fontSize: '0.7rem', padding: '3px 8px' }}
                                onClick={() => {
                                  placementStore.addStudentApplication({
                                    studentName: c.name,
                                    regNo: c.registrationNumber || c.studentId,
                                    rollNo: c.rollNumber,
                                    branch: c.department,
                                    deptCode: c.calculatedDept,
                                    cgpa: c.calculatedCgpa,
                                    company: selectedDriveObject.company,
                                    jobRole: selectedDriveObject.role,
                                    ctcOffered: selectedDriveObject.packageOffered,
                                    notes: 'Directly shortlisted via Student Eligibility Verification Engine.',
                                  });
                                  triggerToast(`Shortlisted ${c.name} for ${selectedDriveObject.company}! Added to ATS pipeline.`);
                                }}
                              >
                                + Shortlist Candidate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 5: JOB OFFERS & PACKAGES (SECTION 11 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'offers' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Official Job Offers &amp; Compensation Verification</h3>
                    <p>Certified corporate employment contracts, fixed/variable breakdown, digital offer letter issuance, and acceptance tracking</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button className="erp-btn-secondary" onClick={exportOffersCSV}>
                      <Download size={14} /> Export Offers CSV
                    </button>
                    <button
                      type="button"
                      className="erp-btn-primary"
                      onClick={() => {
                        setOfferForm({
                          studentName: '',
                          regNo: '',
                          department: 'Computer Science & Engineering',
                          company: '',
                          role: '',
                          packageOffered: '₹7.5 LPA',
                          fixedSalary: '₹6.5 LPA',
                          variableSalary: '₹1.0 LPA',
                          joiningDate: '2027-07-01',
                          validityDeadline: '2026-12-31',
                          notes: 'Campus recruitment offer issued.',
                        });
                        setShowAddOfferModal(true);
                      }}
                    >
                      <Plus size={16} /> Record Job Offer
                    </button>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Offer Token</th>
                        <th>Student Candidate</th>
                        <th>Company &amp; Role</th>
                        <th>Package (CTC)</th>
                        <th>Fixed / Variable Split</th>
                        <th>Joining Date</th>
                        <th>Status</th>
                        <th>Letter Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map(o => (
                        <tr key={o.id}>
                          <td>
                            <strong>{o.id}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>{o.offerToken}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: '0.88rem' }}>{o.studentName}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {o.regNo} · {o.department}</div>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{o.company}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{o.role}</div>
                          </td>
                          <td>
                            <strong style={{ color: '#f59e0b', fontSize: '0.94rem' }}>{o.packageOffered}</strong>
                          </td>
                          <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                            <div>Fixed: {o.fixedSalary}</div>
                            <div>Variable: {o.variableSalary}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{o.joiningDate}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Valid Till: {o.validityDeadline}</div>
                          </td>
                          <td>
                            <span className={`badge-status ${o.status.includes('Accepted') ? 'active' : 'info'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="erp-btn-secondary erp-btn-sm"
                                onClick={() => {
                                  setSelectedOfferForPrint(o);
                                  setShowPrintOfferModal(true);
                                }}
                              >
                                View Letter
                              </button>
                              {o.status !== 'Offer Accepted' && (
                                <button
                                  type="button"
                                  className="erp-btn-primary erp-btn-sm"
                                  style={{ background: '#10b981' }}
                                  onClick={() => handleOfferStatusChange(o.id, 'Offer Accepted')}
                                >
                                  Accept
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 6: SALARY & CTC DISTRIBUTION (SECTION 12 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'stats' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Autonomous Institutional Placement Statistics</h3>
                    <p>Verified salary benchmarks, cohort placement conversions, and compensation bracket breakdown</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button className="erp-btn-secondary" onClick={() => window.print()}>
                      <Printer size={14} /> Print Analytics
                    </button>
                    <button className="erp-btn-primary" onClick={exportCensusCSV}>
                      <Download size={14} /> Download Placement Census
                    </button>
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {/* Summary Metric Cards */}
                  <div className="erp-stats-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="erp-stat-card">
                      <div className="erp-stat-card-header">
                        <span className="erp-stat-card-title">Highest Package</span>
                        <Award size={18} color="#f59e0b" />
                      </div>
                      <div className="erp-stat-val">₹24.0 LPA</div>
                      <div className="erp-stat-sub" style={{ color: '#059669' }}>Cisco Systems (Super Dream)</div>
                    </div>

                    <div className="erp-stat-card">
                      <div className="erp-stat-card-header">
                        <span className="erp-stat-card-title">Average Package</span>
                        <TrendingUp size={18} color="#2563eb" />
                      </div>
                      <div className="erp-stat-val">₹6.8 LPA</div>
                      <div className="erp-stat-sub" style={{ color: '#0284c7' }}>Batch Average</div>
                    </div>

                    <div className="erp-stat-card">
                      <div className="erp-stat-card-header">
                        <span className="erp-stat-card-title">Median Package</span>
                        <DollarSign size={18} color="#8b5cf6" />
                      </div>
                      <div className="erp-stat-val">₹6.2 LPA</div>
                      <div className="erp-stat-sub" style={{ color: '#7c3aed' }}>50th Percentile</div>
                    </div>

                    <div className="erp-stat-card">
                      <div className="erp-stat-card-header">
                        <span className="erp-stat-card-title">Students Placed</span>
                        <Users size={18} color="#10b981" />
                      </div>
                      <div className="erp-stat-val">346 / 420</div>
                      <div className="erp-stat-sub" style={{ color: '#059669' }}>82.4% Verified Conversion</div>
                    </div>
                  </div>

                  {/* Cohort Formula Explanation Box */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    <div>
                      <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>Institutional Metric Calculation Standard:</strong>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                        Placement Rate = (Unique Students Placed: <strong>346</strong>) ÷ (Eligible Cohort: <strong>420</strong>) × 100 = <strong style={{ color: '#2563eb' }}>82.4%</strong>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.76rem', background: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#334155' }}>
                      Total Job Offers Generated: <strong>412</strong> (Single student multi-offer deduplicated)
                    </div>
                  </div>

                  {/* Branch-Wise Matrix Table */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.96rem', color: '#0f172a' }}>
                      Branch-Wise Placement Conversion Breakdown (Graduation Batch 2026-27)
                    </h4>
                    <div className="erp-table-responsive">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>Academic Department</th>
                            <th>Eligible Cohort</th>
                            <th>Students Placed</th>
                            <th>Total Offers</th>
                            <th>Placement Rate</th>
                            <th>Average CTC</th>
                            <th>Highest Verified CTC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { branch: 'Computer Science & Engineering', code: 'CSE', eligible: 160, placed: 152, offers: 198, placementRate: 95.0, avgCTC: '₹8.4 LPA', highestCTC: '₹24.0 LPA' },
                            { branch: 'Electronics & Communication', code: 'ECE', eligible: 90, placed: 78, offers: 94, placementRate: 86.7, avgCTC: '₹6.8 LPA', highestCTC: '₹14.0 LPA' },
                            { branch: 'Electrical & Electronics', code: 'EEE', eligible: 60, placed: 48, offers: 52, placementRate: 80.0, avgCTC: '₹5.8 LPA', highestCTC: '₹9.2 LPA' },
                            { branch: 'Mechanical Engineering', code: 'MECH', eligible: 55, placed: 41, offers: 42, placementRate: 74.5, avgCTC: '₹5.2 LPA', highestCTC: '₹8.0 LPA' },
                            { branch: 'Civil Engineering', code: 'CIVIL', eligible: 35, placed: 24, offers: 24, placementRate: 68.6, avgCTC: '₹4.8 LPA', highestCTC: '₹6.5 LPA' },
                            { branch: 'Master of Computer Applications', code: 'MCA', eligible: 20, placed: 18, offers: 22, placementRate: 90.0, avgCTC: '₹6.2 LPA', highestCTC: '₹10.5 LPA' },
                          ].map(b => (
                            <tr key={b.code}>
                              <td>
                                <strong>{b.branch}</strong>
                                <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700 }}>{b.code}</div>
                              </td>
                              <td>{b.eligible} Candidates</td>
                              <td><strong style={{ color: '#059669' }}>{b.placed} Placed</strong></td>
                              <td>{b.offers} Offers</td>
                              <td>
                                <strong style={{ color: '#2563eb' }}>{b.placementRate}%</strong>
                                <div style={{ width: '80px', height: '5px', background: '#e2e8f0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${b.placementRate}%`, height: '100%', background: '#2563eb' }}></div>
                                </div>
                              </td>
                              <td>{b.avgCTC}</td>
                              <td><strong style={{ color: '#f59e0b' }}>{b.highestCTC}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Package Tier Distribution */}
                  <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {[
                      { tier: 'Super Dream Tier (₹12+ LPA)', companiesCount: 4, offersCount: 28, percentage: 6.8, color: '#f59e0b' },
                      { tier: 'Dream Recruiters (₹6 – ₹12 LPA)', companiesCount: 16, offersCount: 164, percentage: 39.8, color: '#2563eb' },
                      { tier: 'Core & IT Services (₹3.5 – ₹6 LPA)', companiesCount: 28, offersCount: 220, percentage: 53.4, color: '#059669' },
                    ].map(t => (
                      <div
                        key={t.tier}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{t.tier}</strong>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: t.color, margin: '6px 0' }}>
                          {t.offersCount} Offers ({t.percentage}%)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Participating Corporate Partners: <strong>{t.companiesCount} Companies</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 7: NAAC PLACEMENT REPORTS (SECTION 15 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'report-generation' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>NAAC Placement Reports (Criterion 5.2.1)</h3>
                    <p>Annual statutory placement records, compensation percentiles, and documentary evidence audit logs</p>
                  </div>
                  <div className="erp-panel-actions">
                    <select
                      value={selectedNaacYear}
                      onChange={(e) => setSelectedNaacYear(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '0.84rem', background: '#fff', fontWeight: 600 }}
                    >
                      <option value="2026-27">Academic Year 2026-27</option>
                      <option value="2025-26">Academic Year 2025-26</option>
                      <option value="2024-25">Academic Year 2024-25</option>
                    </select>
                    <button className="erp-btn-primary" onClick={exportCensusCSV}>
                      <Download size={14} /> Download NAAC Dossier CSV
                    </button>
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {(() => {
                    const currentReport = naacReports.find(r => r.academicYear === selectedNaacYear) || naacReports[0];
                    return (
                      <>
                        <div className="erp-stats-grid" style={{ marginBottom: '1.5rem' }}>
                          <div className="erp-stat-card">
                            <span className="erp-stat-card-title">Eligible Candidates</span>
                            <div className="erp-stat-val">{currentReport.cohortEligible}</div>
                          </div>
                          <div className="erp-stat-card">
                            <span className="erp-stat-card-title">Students Placed</span>
                            <div className="erp-stat-val" style={{ color: '#059669' }}>{currentReport.studentsPlaced}</div>
                          </div>
                          <div className="erp-stat-card">
                            <span className="erp-stat-card-title">Placement Percentage</span>
                            <div className="erp-stat-val" style={{ color: '#2563eb' }}>{currentReport.placementRate}%</div>
                          </div>
                          <div className="erp-stat-card">
                            <span className="erp-stat-card-title">Highest CTC</span>
                            <div className="erp-stat-val" style={{ color: '#f59e0b' }}>{currentReport.highestCTC}</div>
                          </div>
                          <div className="erp-stat-card">
                            <span className="erp-stat-card-title">Median Salary</span>
                            <div className="erp-stat-val">{currentReport.medianCTC}</div>
                          </div>
                          <div className="erp-stat-card">
                            <span className="erp-stat-card-title">Visiting Enterprises</span>
                            <div className="erp-stat-val">{currentReport.companiesVisiting}</div>
                          </div>
                        </div>

                        {/* Evidence & Supporting Documents Section */}
                        <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                            📁 NAAC Criterion 5.2.1 Audit Evidences &amp; Verification Documents:
                          </strong>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {(currentReport.documents || []).map((doc, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                <FileText size={16} color="#2563eb" />
                                <span style={{ fontSize: '0.8rem', color: '#334155' }}>{doc.name} ({doc.size})</span>
                                <button
                                  type="button"
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => triggerToast(`Previewing verified NAAC evidence ${doc.name}...`)}
                                >
                                  Preview
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="erp-btn-secondary erp-btn-sm"
                              onClick={() => triggerToast('Selected additional NAAC supporting documents.')}
                            >
                              <Upload size={12} /> Upload Additional Evidence
                            </button>
                          </div>
                        </div>

                        {/* Departmental Metrics Table */}
                        <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', color: '#0f172a' }}>
                          Departmental Records for {selectedNaacYear}
                        </h4>
                        <div className="erp-table-responsive">
                          <table className="erp-table">
                            <thead>
                              <tr>
                                <th>Department</th>
                                <th>Eligible</th>
                                <th>Placed</th>
                                <th>Offers</th>
                                <th>Placement %</th>
                                <th>Average CTC</th>
                                <th>Highest CTC</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(currentReport.branchMetrics || []).map(b => (
                                <tr key={b.code}>
                                  <td><strong>{b.branch}</strong> ({b.code})</td>
                                  <td>{b.eligible}</td>
                                  <td><strong style={{ color: '#059669' }}>{b.placed}</strong></td>
                                  <td>{b.offers}</td>
                                  <td><strong>{b.placementRate}%</strong></td>
                                  <td>{b.avgCTC}</td>
                                  <td><strong style={{ color: '#f59e0b' }}>{b.highestCTC}</strong></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                INTERNSHIP CELL & AUTOMATIC ID CARD GENERATION
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'internship-cell' && (
              <InternshipCellManagement account={account} />
            )}

            {activeTab === 'bonafide-verification' && (
              <div className="erp-panel" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <BonafideReviewQueue role="placement" account={account} />
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 8: INTERNSHIP MANAGEMENT (SECTION 9 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'internships' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Corporate Internship Management</h3>
                    <p>Create, publish, edit, preview, and close industrial internships displayed on the Student Portal</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button
                      type="button"
                      className="erp-btn-primary"
                      onClick={() => {
                        setEditingInternship(null);
                        setInternshipForm({
                          title: '',
                          company: '',
                          role: '',
                          description: '',
                          requiredSkills: 'Python, SQL, React',
                          eligibleBranches: 'Computer Science & Engineering, ECE',
                          eligibleYears: '3rd Year (Semester 5/6)',
                          minCgpa: 6.5,
                          duration: '2 Months',
                          startDate: '2026-12-01',
                          endDate: '2027-01-31',
                          workMode: 'Hybrid',
                          location: 'Bhubaneswar / Remote',
                          isPaid: true,
                          stipend: '₹10,000/month',
                          applicationOpenDate: new Date().toISOString().split('T')[0],
                          deadline: '2026-11-25',
                          openings: 10,
                          applicationInstructions: 'Submit resume via student portal.',
                          requiredDocs: 'Resume PDF, College Bonafide/NOC',
                          contactInfo: 'careers@company.com',
                          status: 'Published',
                        });
                        setShowAddInternshipModal(true);
                      }}
                    >
                      <Plus size={16} /> Publish Internship
                    </button>
                  </div>
                </div>

                <div className="erp-filter-bar">
                  <div className="erp-search-input">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search internship by company, title, skill..."
                      value={internSearch}
                      onChange={(e) => setInternSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} color="#64748b" />
                    <select
                      value={internStatusFilter}
                      onChange={(e) => setInternStatusFilter(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="ALL">All Publication Statuses</option>
                      <option value="Published">Published (Live to Students)</option>
                      <option value="Draft">Draft (Internal)</option>
                      <option value="Closed">Applications Closed</option>
                    </select>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Company &amp; Internship Title</th>
                        <th>Stipend &amp; Duration</th>
                        <th>Eligible Disciplines</th>
                        <th>Deadline</th>
                        <th>Applicants</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInternships.map(intern => (
                        <tr key={intern.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: intern.color || '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                                {intern.logo || intern.company.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ fontSize: '0.88rem' }}>{intern.role || intern.title}</strong>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{intern.company} · {intern.workMode || 'Hybrid'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#059669' }}>{intern.stipend || 'Unpaid'}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{intern.duration}</div>
                          </td>
                          <td style={{ maxWidth: '240px' }}>
                            <div style={{ fontSize: '0.76rem', color: '#334155' }}>
                              {Array.isArray(intern.eligibleBranches) ? intern.eligibleBranches.join(', ') : intern.eligibleBranches}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>
                              Min CGPA: {intern.minCgpa || 'None'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{intern.deadline}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Openings: {intern.openings || 5}</div>
                          </td>
                          <td>
                            <strong>{intern.applicantCount || 0} Applicants</strong>
                            <div style={{ fontSize: '0.72rem', color: '#059669' }}>
                              {intern.selectedCount || 0} Selected
                            </div>
                          </td>
                          <td>
                            <span className={`badge-status ${intern.status === 'Published' ? 'active' : intern.status === 'Draft' ? 'warning' : 'danger'}`}>
                              {intern.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="erp-btn-secondary erp-btn-sm"
                                onClick={() => setSelectedInternshipPreview(intern)}
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                className="erp-btn-secondary erp-btn-sm"
                                onClick={() => {
                                  setEditingInternship(intern);
                                  setInternshipForm({
                                    title: intern.title || intern.role,
                                    company: intern.company,
                                    role: intern.role || intern.title,
                                    description: intern.description,
                                    requiredSkills: Array.isArray(intern.requiredSkills) ? intern.requiredSkills.join(', ') : intern.requiredSkills || '',
                                    eligibleBranches: Array.isArray(intern.eligibleBranches) ? intern.eligibleBranches.join(', ') : intern.eligibleBranches || '',
                                    eligibleYears: Array.isArray(intern.eligibleYears) ? intern.eligibleYears.join(', ') : intern.eligibleYears || '',
                                    minCgpa: intern.minCgpa || 6.5,
                                    duration: intern.duration,
                                    startDate: intern.startDate || '',
                                    endDate: intern.endDate || '',
                                    workMode: intern.workMode || 'Hybrid',
                                    location: intern.location || '',
                                    isPaid: intern.isPaid !== false,
                                    stipend: intern.stipend,
                                    applicationOpenDate: intern.applicationOpenDate || '',
                                    deadline: intern.deadline,
                                    openings: intern.openings || 5,
                                    applicationInstructions: intern.applicationInstructions || '',
                                    requiredDocs: intern.requiredDocs || '',
                                    contactInfo: intern.contactInfo || '',
                                    status: intern.status || 'Published',
                                  });
                                  setShowAddInternshipModal(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className={`erp-btn-sm ${intern.status === 'Published' ? 'erp-btn-secondary' : 'erp-btn-primary'}`}
                                onClick={() => handleToggleInternshipPublish(intern)}
                                style={intern.status !== 'Published' ? { background: '#10b981' } : {}}
                              >
                                {intern.status === 'Published' ? 'Unpublish' : 'Publish'}
                              </button>
                              {intern.status !== 'Closed' && (
                                <button
                                  type="button"
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => handleCloseInternship(intern)}
                                >
                                  Close
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 9: TRAINING & SKILL DEVELOPMENT (SECTION 13 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'training' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Training &amp; Skill Development Programmes</h3>
                    <p>Manage aptitude training, coding &amp; DSA bootcamps, mock interviews, and resume workshops</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button
                      type="button"
                      className="erp-btn-primary"
                      onClick={() => {
                        setEditingTraining(null);
                        setTrainingForm({
                          title: '',
                          category: 'Aptitude Training',
                          trainer: '',
                          duration: '15 hours',
                          schedule: 'Weekdays 04:30 PM - 06:30 PM',
                          venue: 'Auditorium Hall B',
                          targetBranches: 'CSE, ECE, EEE',
                          targetYears: 'Semester 5, Semester 7',
                          registrationDeadline: '2026-11-15',
                          totalSeats: 150,
                          description: '',
                          status: 'Upcoming',
                        });
                        setShowAddTrainingModal(true);
                      }}
                    >
                      <Plus size={16} /> Schedule Training Programme
                    </button>
                  </div>
                </div>

                <div className="erp-filter-bar">
                  <div className="erp-search-input">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search training programme, trainer..."
                      value={trainingSearch}
                      onChange={(e) => setTrainingSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} color="#64748b" />
                    <select
                      value={trainingCategoryFilter}
                      onChange={(e) => setTrainingCategoryFilter(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="ALL">All Training Categories</option>
                      <option value="Aptitude">Aptitude Training</option>
                      <option value="Coding">Coding &amp; DSA</option>
                      <option value="Resume">Resume Building</option>
                      <option value="Mock">Mock Interviews</option>
                      <option value="Soft">Soft Skills &amp; GD</option>
                    </select>
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                  {filteredTraining.map(prog => (
                    <div
                      key={prog.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            {prog.category}
                          </span>
                          <span className={`badge-status ${prog.status === 'Ongoing' ? 'active' : prog.status === 'Upcoming' ? 'info' : 'warning'}`}>
                            {prog.status}
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 6px', fontSize: '0.96rem', color: '#0f172a' }}>{prog.title}</h4>
                        <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                          {prog.description}
                        </p>

                        <div style={{ fontSize: '0.76rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                          <div><strong>Trainer / Mentor:</strong> {prog.trainer}</div>
                          <div><strong>Schedule &amp; Venue:</strong> {prog.schedule} · {prog.venue}</div>
                          <div><strong>Duration:</strong> {prog.duration}</div>
                          <div><strong>Deadline:</strong> {prog.registrationDeadline}</div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                            <span style={{ color: '#64748b' }}>Seat Registration</span>
                            <strong>{prog.enrolledCount} / {prog.totalSeats} Enrolled</strong>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, (prog.enrolledCount / prog.totalSeats) * 100)}%`, height: '100%', background: '#2563eb' }}></div>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {prog.materials?.length || 0} Materials Attached
                        </small>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="erp-btn-secondary erp-btn-sm"
                            onClick={() => {
                              setEditingTraining(prog);
                              setTrainingForm({
                                title: prog.title,
                                category: prog.category,
                                trainer: prog.trainer,
                                duration: prog.duration,
                                schedule: prog.schedule,
                                venue: prog.venue,
                                targetBranches: Array.isArray(prog.targetBranches) ? prog.targetBranches.join(', ') : prog.targetBranches,
                                targetYears: Array.isArray(prog.targetYears) ? prog.targetYears.join(', ') : prog.targetYears,
                                registrationDeadline: prog.registrationDeadline,
                                totalSeats: prog.totalSeats,
                                description: prog.description,
                                status: prog.status,
                              });
                              setShowAddTrainingModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="erp-btn-secondary erp-btn-sm"
                            onClick={() => triggerToast(`Training materials verified for ${prog.title}`)}
                          >
                            Resources
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 10: STUDENT APPLICATIONS (SECTION 8 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'applications' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Student Applications &amp; ATS Pipeline</h3>
                    <p>Track recruitment progress across screening, technical viva, HR rounds, and selection outcomes</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button className="erp-btn-secondary" onClick={exportApplicationsCSV}>
                      <Download size={14} /> Export ATS Manifest
                    </button>
                  </div>
                </div>

                <div className="erp-filter-bar">
                  <div className="erp-search-input">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search by student, reg no, company..."
                      value={applicantSearch}
                      onChange={(e) => setApplicantSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      value={applicantStageFilter}
                      onChange={(e) => setApplicantStageFilter(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="ALL">All Recruitment Stages</option>
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Aptitude Test">Aptitude Test</option>
                      <option value="Technical Interview">Technical Interview</option>
                      <option value="HR Interview">HR Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <select
                      value={applicantCompanyFilter}
                      onChange={(e) => setApplicantCompanyFilter(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '0.82rem', background: '#fff' }}
                    >
                      <option value="ALL">All Companies</option>
                      {Array.from(new Set(applications.map(a => a.company))).map(comp => (
                        <option key={comp} value={comp}>{comp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Candidate Details</th>
                        <th>Applied Company &amp; Role</th>
                        <th>Recruitment Stage</th>
                        <th>Interview Schedule</th>
                        <th>Evaluation Score &amp; Notes</th>
                        <th>Result Outcome</th>
                        <th>ATS Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No student applications match selected filters.</td></tr>
                      ) : (
                        filteredApplications.map(app => (
                          <tr key={app.id}>
                            <td>
                              <strong style={{ fontSize: '0.88rem' }}>{app.studentName}</strong>
                              <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                                Reg: {app.regNo} · {app.branch}
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>CGPA: {app.cgpa}</span>
                            </td>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{app.company}</strong>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{app.jobRole}</div>
                              <small style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Applied: {app.appliedDate}</small>
                            </td>
                            <td>
                              <span className="badge-status info">
                                {app.stage}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 600 }}>
                                {app.interviewSchedule || 'Pending Schedule'}
                              </div>
                            </td>
                            <td style={{ maxWidth: '240px' }}>
                              {app.roundScore && (
                                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                                  Score: {app.roundScore}
                                </div>
                              )}
                              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.3 }}>
                                {app.internalNotes}
                              </div>
                            </td>
                            <td>
                              <span className={`badge-status ${app.finalResult === 'Selected' ? 'active' : app.finalResult === 'Rejected' ? 'danger' : 'warning'}`}>
                                {app.finalResult || 'In Progress'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => setSelectedAppDossier(app)}
                                  title="View application timeline history"
                                >
                                  Dossier
                                </button>
                                <button
                                  type="button"
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => {
                                    setSelectedAppForSchedule(app);
                                    setShowScheduleInterviewModal(true);
                                  }}
                                  title="Set interview schedule"
                                >
                                  Schedule
                                </button>
                                <button
                                  type="button"
                                  className="erp-btn-secondary erp-btn-sm"
                                  onClick={() => {
                                    setSelectedAppForAdvance(app);
                                    setAdvanceForm({
                                      nextStage: app.stage.includes('Technical') ? 'HR Interview' : 'Technical Interview',
                                      score: '8.8 / 10',
                                      notes: '',
                                    });
                                    setShowAdvanceStageModal(true);
                                  }}
                                  title="Advance recruitment stage"
                                >
                                  Advance
                                </button>
                                <button
                                  type="button"
                                  className="erp-btn-primary erp-btn-sm"
                                  onClick={() => {
                                    setSelectedAppForOutcome(app);
                                    setRecordOutcomeForm({
                                      outcome: 'Selected',
                                      finalCtc: app.ctcOffered || '₹7.5 LPA',
                                      notes: 'Recommended for final offer letter issuance.',
                                    });
                                    setShowRecordOutcomeModal(true);
                                  }}
                                  title="Record final selection or rejection"
                                  style={{ background: '#059669' }}
                                >
                                  Outcome
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 11: PLACEMENT NOTICES (SECTION 14 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'notices' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Placement Notices &amp; Campus Circulars</h3>
                    <p>Create, preview, schedule, and broadcast official placement announcements</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button
                      type="button"
                      className="erp-btn-primary"
                      onClick={() => {
                        setEditingNotice(null);
                        setNoticeForm({
                          title: '',
                          category: 'Campus Drive Notice',
                          publishDate: new Date().toISOString().split('T')[0],
                          expiryDate: '2026-12-15',
                          targetBranches: 'All Branches',
                          isUrgent: false,
                          content: '',
                          status: 'Published',
                        });
                        setShowAddNoticeModal(true);
                      }}
                    >
                      <Plus size={16} /> Publish Placement Notice
                    </button>
                  </div>
                </div>

                <div className="erp-filter-bar">
                  <div className="erp-search-input">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search notice by title or content..."
                      value={noticeSearch}
                      onChange={(e) => setNoticeSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredNotices.map(n => (
                    <div
                      key={n.id}
                      style={{
                        background: '#ffffff',
                        border: `1px solid ${n.isUrgent ? '#fca5a5' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        padding: '16px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {n.isUrgent && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                              URGENT
                            </span>
                          )}
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1e40af' }}>
                            {n.category}
                          </span>
                          <span className={`badge-status ${n.status === 'Published' ? 'active' : 'warning'}`}>
                            {n.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Published: <strong>{n.publishDate}</strong> · Expiry: <strong>{n.expiryDate}</strong>
                        </div>
                      </div>

                      <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#0f172a' }}>{n.title}</h4>
                      <p style={{ margin: '0 0 12px', fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
                        {n.content}
                      </p>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                          Target: {Array.isArray(n.targetBranches) ? n.targetBranches.join(', ') : n.targetBranches}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="erp-btn-secondary erp-btn-sm"
                            onClick={() => setSelectedNoticePreview(n)}
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            className="erp-btn-secondary erp-btn-sm"
                            onClick={() => {
                              const next = n.status === 'Published' ? 'Draft' : 'Published';
                              placementStore.updateNotice(n.id, { status: next });
                              triggerToast(`Notice marked as ${next}.`);
                            }}
                          >
                            {n.status === 'Published' ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 12: PLACEMENT ANALYTICS & REPORTS (SECTION 16 OF REQUIREMENTS)
                ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'analytics' && (
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Overall Placement Analytics &amp; Conversion Funnel</h3>
                    <p>Stage-by-stage ATS funnel metrics, academic year conversion rates, and comparative outcome reports</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button className="erp-btn-secondary" onClick={() => window.print()}>
                      <Printer size={14} /> Print Summary
                    </button>
                    <button className="erp-btn-primary" onClick={exportCensusCSV}>
                      <Download size={14} /> Export Analytics CSV
                    </button>
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {/* Recruitment Stage Conversion Funnel */}
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.96rem', color: '#0f172a' }}>
                    Campus Recruitment Conversion Funnel (Batch 2027)
                  </h4>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                    {[
                      { stage: '1. Total Candidate Applications Registered', count: 480, pct: 100, color: '#3b82f6' },
                      { stage: '2. Deterministic Eligibility Shortlisted', count: 320, pct: 66.7, color: '#0284c7' },
                      { stage: '3. Online Aptitude / Coding Test Cleared', count: 210, pct: 43.8, color: '#8b5cf6' },
                      { stage: '4. Technical Interview Rounds Cleared', count: 120, pct: 25.0, color: '#f59e0b' },
                      { stage: '5. Executive HR & Director Cleared', count: 85, pct: 17.7, color: '#10b981' },
                      { stage: '6. Final Job Offers Released & Accepted', count: 85, pct: 17.7, color: '#059669' },
                    ].map(funnel => (
                      <div key={funnel.stage}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                          <strong style={{ color: '#0f172a' }}>{funnel.stage}</strong>
                          <span style={{ fontWeight: 700, color: funnel.color }}>{funnel.count} Candidates ({funnel.pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${funnel.pct}%`, height: '100%', background: funnel.color, borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Year on Year Placement Growth Table */}
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.96rem', color: '#0f172a' }}>
                    Institutional Year-on-Year Placement Progress
                  </h4>
                  <div className="erp-table-responsive">
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Academic Batch Year</th>
                          <th>Eligible Cohort</th>
                          <th>Students Placed</th>
                          <th>Total Offers</th>
                          <th>Placement Conversion</th>
                          <th>Average CTC</th>
                          <th>Highest CTC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { year: '2026–2027 (Current Active Batch)', eligible: 420, placed: 346, offers: 412, rate: '82.4%', avg: '₹6.8 LPA', max: '₹24.0 LPA' },
                          { year: '2025–2026', eligible: 405, placed: 338, offers: 388, rate: '83.5%', avg: '₹6.4 LPA', max: '₹22.0 LPA' },
                          { year: '2024–2025', eligible: 390, placed: 312, offers: 350, rate: '80.0%', avg: '₹5.8 LPA', max: '₹18.0 LPA' },
                          { year: '2023–2024', eligible: 360, placed: 280, offers: 310, rate: '77.8%', avg: '₹5.2 LPA', max: '₹16.5 LPA' },
                        ].map(row => (
                          <tr key={row.year}>
                            <td><strong>{row.year}</strong></td>
                            <td>{row.eligible}</td>
                            <td><strong style={{ color: '#059669' }}>{row.placed}</strong></td>
                            <td>{row.offers}</td>
                            <td><strong style={{ color: '#2563eb' }}>{row.rate}</strong></td>
                            <td>{row.avg}</td>
                            <td><strong style={{ color: '#f59e0b' }}>{row.max}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </AppLayout>

      {/* ═════════════════════════════════════════════════════════════
          MODAL 1: SCHEDULE / EDIT PLACEMENT DRIVE
          ═════════════════════════════════════════════════════════════ */}
      {showAddDriveModal && (
        <div className="erp-modal-overlay" onClick={() => setShowAddDriveModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="erp-modal-header">
              <h3>{editingDrive ? 'Edit Campus Recruitment Drive' : 'Schedule Campus Recruitment Drive'}</h3>
              <button
                type="button"
                onClick={() => setShowAddDriveModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDrive}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div className="erp-form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cisco Systems India"
                      value={driveForm.company}
                      onChange={(e) => setDriveForm({ ...driveForm, company: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Job Title / Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Associate Software Engineer"
                      value={driveForm.role}
                      onChange={(e) => setDriveForm({ ...driveForm, role: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Annual Compensation (CTC) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹18.5 LPA"
                      value={driveForm.packageOffered}
                      onChange={(e) => setDriveForm({ ...driveForm, packageOffered: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Numeric CTC (for sorting in LPA) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={driveForm.packageLPA}
                      onChange={(e) => setDriveForm({ ...driveForm, packageLPA: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Minimum CGPA Cutoff</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={driveForm.minCgpa}
                      onChange={(e) => setDriveForm({ ...driveForm, minCgpa: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Maximum Allowed Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      value={driveForm.maxBacklogs}
                      onChange={(e) => setDriveForm({ ...driveForm, maxBacklogs: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Eligible Engineering Disciplines (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. CSE, ECE, EEE"
                      value={driveForm.allowedBranches}
                      onChange={(e) => setDriveForm({ ...driveForm, allowedBranches: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Drive Date</label>
                    <input
                      type="date"
                      value={driveForm.driveDate}
                      onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Registration Deadline</label>
                    <input
                      type="date"
                      value={driveForm.applicationDeadline || '2026-11-20'}
                      onChange={(e) => setDriveForm({ ...driveForm, applicationDeadline: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Work Mode</label>
                    <select
                      value={driveForm.workMode}
                      onChange={(e) => setDriveForm({ ...driveForm, workMode: e.target.value })}
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  <div className="erp-form-group">
                    <label>Publication Status</label>
                    <select
                      value={driveForm.status}
                      onChange={(e) => setDriveForm({ ...driveForm, status: e.target.value })}
                    >
                      <option value="Published">Published (Live to Student Portal)</option>
                      <option value="Draft">Draft (Internal Placement Cell Only)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Job Description &amp; Responsibilities</label>
                    <textarea
                      rows={2}
                      placeholder="Specify key tasks and technical expectations..."
                      value={driveForm.jobDescription}
                      onChange={(e) => setDriveForm({ ...driveForm, jobDescription: e.target.value })}
                    />
                  </div>
                </div>

                {/* File Attachment Simulation */}
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={16} color="#2563eb" />
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>Attach Official Job Description (JD) PDF</span>
                  </div>
                  <button
                    type="button"
                    className="erp-btn-secondary erp-btn-sm"
                    onClick={() => triggerToast('Selected JD document attachment.')}
                  >
                    Browse PDF
                  </button>
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddDriveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  {editingDrive ? 'Save Updates' : 'Publish Recruitment Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 2: PUBLISH / EDIT INTERNSHIP
          ═════════════════════════════════════════════════════════════ */}
      {showAddInternshipModal && (
        <div className="erp-modal-overlay" onClick={() => setShowAddInternshipModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="erp-modal-header">
              <h3>{editingInternship ? 'Edit Internship Opportunity' : 'Publish Corporate Internship Opportunity'}</h3>
              <button
                type="button"
                onClick={() => setShowAddInternshipModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveInternship}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div className="erp-form-group">
                    <label>Internship Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Machine Learning & Vision Intern"
                      value={internshipForm.title}
                      onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Hiring Organization / Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechSurge India Pvt. Ltd."
                      value={internshipForm.company}
                      onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Monthly Stipend *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹12,000/month or Unpaid"
                      value={internshipForm.stipend}
                      onChange={(e) => setInternshipForm({ ...internshipForm, stipend: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Duration *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 Months"
                      value={internshipForm.duration}
                      onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Work Mode</label>
                    <select
                      value={internshipForm.workMode}
                      onChange={(e) => setInternshipForm({ ...internshipForm, workMode: e.target.value })}
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div className="erp-form-group">
                    <label>Application Deadline</label>
                    <input
                      type="date"
                      value={internshipForm.deadline}
                      onChange={(e) => setInternshipForm({ ...internshipForm, deadline: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Minimum CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={internshipForm.minCgpa}
                      onChange={(e) => setInternshipForm({ ...internshipForm, minCgpa: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Publication Status</label>
                    <select
                      value={internshipForm.status}
                      onChange={(e) => setInternshipForm({ ...internshipForm, status: e.target.value })}
                    >
                      <option value="Published">Published (Appears on Student Portal)</option>
                      <option value="Draft">Draft (Internal)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Eligible Engineering Branches</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science & Engineering, ECE"
                      value={internshipForm.eligibleBranches}
                      onChange={(e) => setInternshipForm({ ...internshipForm, eligibleBranches: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Required Skills (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Python, PyTorch, Data Structures"
                      value={internshipForm.requiredSkills}
                      onChange={(e) => setInternshipForm({ ...internshipForm, requiredSkills: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Internship Description &amp; Scope of Work</label>
                    <textarea
                      rows={2}
                      placeholder="Describe projects, mentors, and learning outcomes..."
                      value={internshipForm.description}
                      onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddInternshipModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  {editingInternship ? 'Save Updates' : 'Publish Opportunity to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 3: ENROLL / EDIT CORPORATE PARTNER
          ═════════════════════════════════════════════════════════════ */}
      {showAddCompanyModal && (
        <div className="erp-modal-overlay" onClick={() => setShowAddCompanyModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="erp-modal-header">
              <h3>{editingCompany ? 'Edit Corporate Partner Profile' : 'Enroll Corporate Partner in Recruiter Directory'}</h3>
              <button
                type="button"
                onClick={() => setShowAddCompanyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCompany}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Enterprise / Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Consultancy Services"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Industry Category</label>
                    <input
                      type="text"
                      placeholder="e.g. IT Services / Product R&D"
                      value={companyForm.category}
                      onChange={(e) => setCompanyForm({ ...companyForm, category: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Partner Tier</label>
                    <select
                      value={companyForm.tier}
                      onChange={(e) => setCompanyForm({ ...companyForm, tier: e.target.value })}
                    >
                      <option value="Tier 1 Partner">Tier 1 Partner</option>
                      <option value="Super Dream Recruiter">Super Dream Recruiter</option>
                      <option value="Active Partner">Active Partner</option>
                    </select>
                  </div>

                  <div className="erp-form-group">
                    <label>HR Point of Contact</label>
                    <input
                      type="text"
                      placeholder="e.g. Ms. Ananya Sengupta"
                      value={companyForm.hrContact}
                      onChange={(e) => setCompanyForm({ ...companyForm, hrContact: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>HR Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. campus@company.com"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>HR Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 22 XXXXXXXX"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Typical Package Range</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹4.5 LPA - ₹10.0 LPA"
                      value={companyForm.packageRange}
                      onChange={(e) => setCompanyForm({ ...companyForm, packageRange: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>MoU Status &amp; Validity</label>
                    <input
                      type="text"
                      placeholder="e.g. Signed & Valid (2024–2028)"
                      value={companyForm.mouStatus}
                      onChange={(e) => setCompanyForm({ ...companyForm, mouStatus: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddCompanyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  {editingCompany ? 'Save Updates' : 'Enroll Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 4: RECORD OFFICIAL JOB OFFER
          ═════════════════════════════════════════════════════════════ */}
      {showAddOfferModal && (
        <div className="erp-modal-overlay" onClick={() => setShowAddOfferModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="erp-modal-header">
              <h3>Record Official Placement Job Offer</h3>
              <button
                type="button"
                onClick={() => setShowAddOfferModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOffer}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div className="erp-form-group">
                    <label>Student Candidate Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Patra"
                      value={offerForm.studentName}
                      onChange={(e) => setOfferForm({ ...offerForm, studentName: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Registration / Roll Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2305201004"
                      value={offerForm.regNo}
                      onChange={(e) => setOfferForm({ ...offerForm, regNo: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Recruiting Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cisco Systems India"
                      value={offerForm.company}
                      onChange={(e) => setOfferForm({ ...offerForm, company: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Offered Role / Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Associate Network Engineer"
                      value={offerForm.role}
                      onChange={(e) => setOfferForm({ ...offerForm, role: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Total CTC Package *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹18.5 LPA"
                      value={offerForm.packageOffered}
                      onChange={(e) => setOfferForm({ ...offerForm, packageOffered: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Fixed Salary Component</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹14.5 LPA"
                      value={offerForm.fixedSalary}
                      onChange={(e) => setOfferForm({ ...offerForm, fixedSalary: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Joining Date</label>
                    <input
                      type="date"
                      value={offerForm.joiningDate}
                      onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Offer Acceptance Validity Deadline</label>
                    <input
                      type="date"
                      value={offerForm.validityDeadline}
                      onChange={(e) => setOfferForm({ ...offerForm, validityDeadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddOfferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Generate &amp; Issue Offer Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 5: PRINTABLE DIGITAL OFFER LETTER
          ═════════════════════════════════════════════════════════════ */}
      {showPrintOfferModal && selectedOfferForPrint && (
        <div className="erp-modal-overlay" onClick={() => setShowPrintOfferModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="erp-modal-header no-print">
              <h3>Official College Placement Employment Intent Dossier</h3>
              <button
                type="button"
                onClick={() => setShowPrintOfferModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="erp-modal-body" style={{ background: '#fafafa' }}>
              <div className="digital-offer-card" style={{ borderColor: '#2563eb' }}>
                <div className="offer-header">
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>APNA CAMPUS</h2>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Training &amp; Corporate Relations Directorate</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700 }}>VERIFIED CONTRACT</div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: {selectedOfferForPrint.offerToken}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', margin: '14px 0' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#0f172a' }}>OFFICIAL LETTER OF INTENT</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    Issued on behalf of <strong>{selectedOfferForPrint.company}</strong>
                  </p>
                </div>

                <div className="offer-field-grid">
                  <div className="offer-field">
                    <label>Selected Candidate</label>
                    <strong>{selectedOfferForPrint.studentName}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {selectedOfferForPrint.regNo}</div>
                  </div>
                  <div className="offer-field">
                    <label>Department / Discipline</label>
                    <strong>{selectedOfferForPrint.department}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Designation / Role</label>
                    <strong>{selectedOfferForPrint.role}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Total Offered CTC</label>
                    <strong style={{ color: '#059669', fontSize: '1.1rem' }}>{selectedOfferForPrint.packageOffered}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Scheduled Joining Date</label>
                    <strong>{selectedOfferForPrint.joiningDate}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Offer Acceptance Status</label>
                    <span className="badge-status active">{selectedOfferForPrint.status}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '14px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #2563eb', color: '#2563eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '0.62rem', fontWeight: 800 }}>
                      <span>★ T&amp;P CELL ★</span>
                      <span>AUTONOMOUS</span>
                      <span>SEAL</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>Prof. Sudhanshu S. Ray</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Head of Corporate Relations &amp; Placements</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Apna Campus Higher Education Institute</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="erp-modal-footer no-print">
              <button type="button" className="erp-btn-secondary" onClick={() => setShowPrintOfferModal(false)}>
                Close
              </button>
              <button
                type="button"
                className="erp-btn-primary"
                onClick={() => {
                  window.print();
                  triggerToast('Printing official offer document PDF...');
                }}
              >
                <Printer size={14} /> Print Letter PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 6: ADVANCE RECRUITMENT STAGE
          ═════════════════════════════════════════════════════════════ */}
      {showAdvanceStageModal && selectedAppForAdvance && (
        <div className="erp-modal-overlay" onClick={() => setShowAdvanceStageModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="erp-modal-header">
              <h3>Advance Candidate Recruitment Stage</h3>
              <button
                type="button"
                onClick={() => setShowAdvanceStageModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdvanceStageSubmit}>
              <div className="erp-modal-body">
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                  Candidate: <strong>{selectedAppForAdvance.studentName}</strong> ({selectedAppForAdvance.company})
                  <div style={{ color: '#64748b' }}>Current Stage: <strong>{selectedAppForAdvance.stage}</strong></div>
                </div>

                <div className="erp-form-group">
                  <label>Next Recruitment Stage *</label>
                  <select
                    value={advanceForm.nextStage}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, nextStage: e.target.value })}
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Aptitude Test">Aptitude Test</option>
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="HR Interview">HR Interview</option>
                  </select>
                </div>

                <div className="erp-form-group">
                  <label>Round Score / Evaluation Benchmark</label>
                  <input
                    type="text"
                    placeholder="e.g. 9.0 / 10"
                    value={advanceForm.score}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, score: e.target.value })}
                  />
                </div>

                <div className="erp-form-group">
                  <label>Internal Evaluator Notes (Hidden from students)</label>
                  <textarea
                    rows={2}
                    placeholder="Candidate feedback and observations..."
                    value={advanceForm.notes}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAdvanceStageModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Confirm Stage Advancement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 7: SCHEDULE INTERVIEW
          ═════════════════════════════════════════════════════════════ */}
      {showScheduleInterviewModal && selectedAppForSchedule && (
        <div className="erp-modal-overlay" onClick={() => setShowScheduleInterviewModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="erp-modal-header">
              <h3>Schedule Interview Slot</h3>
              <button
                type="button"
                onClick={() => setShowScheduleInterviewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit}>
              <div className="erp-modal-body">
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                  Candidate: <strong>{selectedAppForSchedule.studentName}</strong> · Company: <strong>{selectedAppForSchedule.company}</strong>
                </div>

                <div className="erp-form-group">
                  <label>Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleInterviewForm.interviewDate}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, interviewDate: e.target.value })}
                  />
                </div>

                <div className="erp-form-group">
                  <label>Interview Time Slot *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={scheduleInterviewForm.interviewTime}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, interviewTime: e.target.value })}
                  />
                </div>

                <div className="erp-form-group">
                  <label>Venue or Virtual Meeting Link *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Campus Interview Suite 1 / Zoom Link"
                    value={scheduleInterviewForm.venueOrLink}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, venueOrLink: e.target.value })}
                  />
                </div>

                <div className="erp-form-group">
                  <label>Designated Interviewer / Panel</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Vikram Adve (Cisco Talent)"
                    value={scheduleInterviewForm.interviewerName}
                    onChange={(e) => setScheduleInterviewForm({ ...scheduleInterviewForm, interviewerName: e.target.value })}
                  />
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowScheduleInterviewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Save Interview Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 8: RECORD SELECTION OUTCOME (EXPLICIT ACTION MANDATE)
          ═════════════════════════════════════════════════════════════ */}
      {showRecordOutcomeModal && selectedAppForOutcome && (
        <div className="erp-modal-overlay" onClick={() => setShowRecordOutcomeModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="erp-modal-header">
              <h3>Record Final Candidate Selection Outcome</h3>
              <button
                type="button"
                onClick={() => setShowRecordOutcomeModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordOutcomeSubmit}>
              <div className="erp-modal-body">
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                  Candidate: <strong>{selectedAppForOutcome.studentName}</strong> ({selectedAppForOutcome.regNo})
                  <div style={{ color: '#64748b' }}>Company: <strong>{selectedAppForOutcome.company}</strong> ({selectedAppForOutcome.jobRole})</div>
                </div>

                <div className="erp-form-group">
                  <label>Final Selection Outcome *</label>
                  <select
                    value={recordOutcomeForm.outcome}
                    onChange={(e) => setRecordOutcomeForm({ ...recordOutcomeForm, outcome: e.target.value })}
                  >
                    <option value="Selected">Selected for Offer</option>
                    <option value="Rejected">Not Selected (Rejected)</option>
                    <option value="Withdrawn">Withdrawn by Student</option>
                  </select>
                </div>

                {recordOutcomeForm.outcome === 'Selected' && (
                  <div className="erp-form-group">
                    <label>Final Offered CTC *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹18.5 LPA"
                      value={recordOutcomeForm.finalCtc}
                      onChange={(e) => setRecordOutcomeForm({ ...recordOutcomeForm, finalCtc: e.target.value })}
                    />
                  </div>
                )}

                <div className="erp-form-group">
                  <label>Outcome Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter placement evaluation comments..."
                    value={recordOutcomeForm.notes}
                    onChange={(e) => setRecordOutcomeForm({ ...recordOutcomeForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowRecordOutcomeModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="erp-btn-primary"
                  style={recordOutcomeForm.outcome === 'Selected' ? { background: '#059669' } : { background: '#dc2626' }}
                >
                  Confirm Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 9: CANDIDATE DOSSIER & HISTORY LOG
          ═════════════════════════════════════════════════════════════ */}
      {selectedAppDossier && (
        <div className="erp-modal-overlay" onClick={() => setSelectedAppDossier(null)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="erp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} color="#2563eb" />
                <h3 style={{ margin: 0 }}>Candidate ATS Dossier &amp; Audit Trail</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppDossier(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="erp-modal-body">
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{selectedAppDossier.studentName}</h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Reg: {selectedAppDossier.regNo} · {selectedAppDossier.branch} · CGPA: <strong>{selectedAppDossier.cgpa}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>
                  {selectedAppDossier.company} — {selectedAppDossier.jobRole}
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  Status Change Timeline History:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #cbd5e1', paddingLeft: '14px', marginLeft: '6px' }}>
                  {(selectedAppDossier.history || []).map((h, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', position: 'absolute', left: '-19px', top: '5px' }}></div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{h.stage}</div>
                      <small style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{h.date}</small>
                      <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>{h.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#92400e' }}>
                <strong>Placement Cell Internal Note:</strong> {selectedAppDossier.internalNotes || 'No special notes recorded.'}
              </div>
            </div>

            <div className="erp-modal-footer">
              <button type="button" className="erp-btn-secondary" onClick={() => setSelectedAppDossier(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 10: DRIVE STUDENT PREVIEW
          ═════════════════════════════════════════════════════════════ */}
      {selectedDrivePreview && (
        <div className="erp-modal-overlay" onClick={() => setSelectedDrivePreview(null)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="erp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#2563eb" />
                <h3 style={{ margin: 0 }}>Student Dashboard Preview: {selectedDrivePreview.company}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrivePreview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="erp-modal-body">
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: selectedDrivePreview.companyColor || '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
                    {selectedDrivePreview.companyLogo || selectedDrivePreview.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{selectedDrivePreview.company}</h4>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{selectedDrivePreview.role}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '12px' }}>
                  <div><strong>Package:</strong> {selectedDrivePreview.packageOffered}</div>
                  <div><strong>Work Mode:</strong> {selectedDrivePreview.workMode || 'Hybrid'}</div>
                  <div><strong>Drive Date:</strong> {selectedDrivePreview.driveDate}</div>
                  <div><strong>Deadline:</strong> {selectedDrivePreview.recruitmentProcess?.applicationDeadline || 'Open'}</div>
                  <div><strong>Min CGPA:</strong> {selectedDrivePreview.eligibilityCriteria?.minCgpa || 6.5}</div>
                  <div><strong>Vacancies:</strong> {selectedDrivePreview.vacancies || 20}</div>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  {selectedDrivePreview.jobDescription || selectedDrivePreview.companyDescription}
                </p>

                <div style={{ fontSize: '0.76rem', color: '#2563eb', fontWeight: 600 }}>
                  Eligible: {Array.isArray(selectedDrivePreview.eligibilityCriteria?.allowedBranches) ? selectedDrivePreview.eligibilityCriteria.allowedBranches.join(', ') : selectedDrivePreview.eligibilityCriteria?.allowedBranches}
                </div>
              </div>
            </div>

            <div className="erp-modal-footer">
              <button type="button" className="erp-btn-secondary" onClick={() => setSelectedDrivePreview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 11: RECRUITMENT HISTORY DIALOG FOR CORPORATE PARTNER
          ═════════════════════════════════════════════════════════════ */}
      {selectedCompanyHistory && (
        <div className="erp-modal-overlay" onClick={() => setSelectedCompanyHistory(null)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="erp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#2563eb" />
                <h3 style={{ margin: 0 }}>Recruitment History: {selectedCompanyHistory.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompanyHistory(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="erp-modal-body">
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div><strong>Category:</strong> {selectedCompanyHistory.category}</div>
                <div><strong>HR Contact:</strong> {selectedCompanyHistory.hrContact} ({selectedCompanyHistory.email})</div>
                <div><strong>MoU Status:</strong> {selectedCompanyHistory.mouStatus || 'Signed & Valid'}</div>
                <div><strong>Total Campus Alumni Hired:</strong> {selectedCompanyHistory.totalHiredFromCampus || 0} Engineers</div>
              </div>

              <h4 style={{ margin: '12px 0 6px', fontSize: '0.9rem', color: '#0f172a' }}>Historical Campus Drives &amp; Hires:</h4>
              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Academic Year</th>
                      <th>Engineers Hired</th>
                      <th>Highest CTC</th>
                      <th>Average CTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedCompanyHistory.recruitmentHistory || []).length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>No archived visit records yet.</td></tr>
                    ) : (
                      selectedCompanyHistory.recruitmentHistory.map((h, idx) => (
                        <tr key={idx}>
                          <td><strong>{h.year}</strong></td>
                          <td><strong style={{ color: '#059669' }}>{h.hired} Hired</strong></td>
                          <td>{h.highestPkg}</td>
                          <td>{h.avgPkg}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="erp-modal-footer">
              <button type="button" className="erp-btn-secondary" onClick={() => setSelectedCompanyHistory(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 12: ADD / EDIT TRAINING PROGRAMME
          ═════════════════════════════════════════════════════════════ */}
      {showAddTrainingModal && (
        <div className="erp-modal-overlay" onClick={() => setShowAddTrainingModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="erp-modal-header">
              <h3>{editingTraining ? 'Edit Training Programme' : 'Schedule Training & Skill Development Programme'}</h3>
              <button
                type="button"
                onClick={() => setShowAddTrainingModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTraining}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Programme Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aptitude & Reasoning Master Bootcamp"
                      value={trainingForm.title}
                      onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Training Category</label>
                    <select
                      value={trainingForm.category}
                      onChange={(e) => setTrainingForm({ ...trainingForm, category: e.target.value })}
                    >
                      <option value="Aptitude Training">Aptitude Training</option>
                      <option value="Coding & DSA Sessions">Coding &amp; DSA Sessions</option>
                      <option value="Resume Building Workshop">Resume Building Workshop</option>
                      <option value="Mock Interviews">Mock Interviews</option>
                      <option value="Soft Skills Training">Soft Skills Training</option>
                      <option value="Technical Workshops">Technical Workshops</option>
                    </select>
                  </div>

                  <div className="erp-form-group">
                    <label>Trainer / Instructor *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. Subrat Nayak & FACE Prep"
                      value={trainingForm.trainer}
                      onChange={(e) => setTrainingForm({ ...trainingForm, trainer: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Total Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 20 hours"
                      value={trainingForm.duration}
                      onChange={(e) => setTrainingForm({ ...trainingForm, duration: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Session Schedule</label>
                    <input
                      type="text"
                      placeholder="e.g. Mon, Wed (04:30 PM - 06:30 PM)"
                      value={trainingForm.schedule}
                      onChange={(e) => setTrainingForm({ ...trainingForm, schedule: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Venue / Link</label>
                    <input
                      type="text"
                      placeholder="e.g. Auditorium Hall B"
                      value={trainingForm.venue}
                      onChange={(e) => setTrainingForm({ ...trainingForm, venue: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Total Available Seats</label>
                    <input
                      type="number"
                      value={trainingForm.totalSeats}
                      onChange={(e) => setTrainingForm({ ...trainingForm, totalSeats: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Description &amp; Syllabus Outline</label>
                    <textarea
                      rows={2}
                      placeholder="Specify topics covered in this training..."
                      value={trainingForm.description}
                      onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddTrainingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  {editingTraining ? 'Save Updates' : 'Schedule Programme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 13: ADD / EDIT PLACEMENT NOTICE
          ═════════════════════════════════════════════════════════════ */}
      {showAddNoticeModal && (
        <div className="erp-modal-overlay" onClick={() => setShowAddNoticeModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="erp-modal-header">
              <h3>{editingNotice ? 'Edit Placement Notice' : 'Publish Official Placement Notice'}</h3>
              <button
                type="button"
                onClick={() => setShowAddNoticeModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNotice}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Notice Headline / Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cognizant GenC Next Campus Drive Schedule"
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Category Tag</label>
                    <select
                      value={noticeForm.category}
                      onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    >
                      <option value="Placement Drive Schedule">Placement Drive Schedule</option>
                      <option value="Selection Results">Selection Results</option>
                      <option value="Placement Training">Placement Training</option>
                      <option value="Internship Notice">Internship Notice</option>
                      <option value="Mandatory Instructions">Mandatory Instructions</option>
                    </select>
                  </div>

                  <div className="erp-form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={noticeForm.expiryDate}
                      onChange={(e) => setNoticeForm({ ...noticeForm, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group">
                    <label>Target Engineering Disciplines</label>
                    <input
                      type="text"
                      placeholder="e.g. All Branches / CSE, ECE"
                      value={noticeForm.targetBranches}
                      onChange={(e) => setNoticeForm({ ...noticeForm, targetBranches: e.target.value })}
                    />
                  </div>

                  <div className="erp-form-group" style={{ justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                      <input
                        type="checkbox"
                        checked={noticeForm.isUrgent}
                        onChange={(e) => setNoticeForm({ ...noticeForm, isUrgent: e.target.checked })}
                      />
                      <span style={{ color: '#b91c1c', fontWeight: 700 }}>Mark as Urgent Announcement</span>
                    </label>
                  </div>

                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Notice Content &amp; Instructions *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write the detailed circular instructions for students..."
                      value={noticeForm.content}
                      onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddNoticeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  {editingNotice ? 'Save Updates' : 'Publish Notice to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
