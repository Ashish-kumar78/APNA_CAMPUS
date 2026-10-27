import React, { useState, useEffect } from 'react';
import { AppLayout } from './Navigation';
import {
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
  Copy,
  Check,
  X,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  FileCheck2,
  Receipt,
  Megaphone,
  HelpCircle,
  Briefcase,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api.js';
import AccountActivationModal from './AccountActivationModal.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import RegisterStudentWizard from './RegisterStudentWizard.jsx';
import './AdmissionsModules/AdmissionsModules.css';

// Admissions Directorate Modules
import { admissionsStore } from './AdmissionsModules/admissionsStore.js';
import AdmissionsCommandTab from './AdmissionsModules/AdmissionsCommandTab.jsx';
import ApplicantRegistryTab from './AdmissionsModules/ApplicantRegistryTab.jsx';
import SeatMatrixTab from './AdmissionsModules/SeatMatrixTab.jsx';
import ApplicationProcessingTab from './AdmissionsModules/ApplicationProcessingTab.jsx';
import DocumentVerificationTab from './AdmissionsModules/DocumentVerificationTab.jsx';
import EligibilityRulesTab from './AdmissionsModules/EligibilityRulesTab.jsx';
import MeritListTab from './AdmissionsModules/MeritListTab.jsx';
import CounsellingAllotmentTab from './AdmissionsModules/CounsellingAllotmentTab.jsx';
import WaitlistRoundsTab from './AdmissionsModules/WaitlistRoundsTab.jsx';
import FeeVerificationTab from './AdmissionsModules/FeeVerificationTab.jsx';
import EnrollmentConversionTab from './AdmissionsModules/EnrollmentConversionTab.jsx';
import ApplicantCommunicationTab from './AdmissionsModules/ApplicantCommunicationTab.jsx';
import AdmissionHelpdeskTab from './AdmissionsModules/AdmissionHelpdeskTab.jsx';
import StaffTaskManagementTab from './AdmissionsModules/StaffTaskManagementTab.jsx';
import ReportsAnalyticsTab from './AdmissionsModules/ReportsAnalyticsTab.jsx';
import AdmissionCalendarTab from './AdmissionsModules/AdmissionCalendarTab.jsx';

export default function AdmissionsPortal({ account, onLogout, onSwitchRole }) {
  const [activeView, setActiveView] = useState('dashboard');

  // Reactive store synchronization
  const [storeTick, setStoreTick] = useState(0);

  // Modal states preserved from existing portal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [enrolledStudentInfo, setEnrolledStudentInfo] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activationTokenToSimulate, setActivationTokenToSimulate] = useState('');

  // Register New Applicant form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Female',
    dob: '2005-08-15',
    category: 'General',
    appliedCourse: 'B.Tech Computer Science & Engineering',
    courseCode: 'BTECH-CSE',
    tenthMarks: '88.5',
    twelfthMarks: '86.0',
    entranceExam: 'JEE Main 2026',
    entranceRank: '32500',
  });

  // Subscribe to admissionsStore changes
  useEffect(() => {
    const unsubscribe = admissionsStore.subscribe(() => {
      setStoreTick((prev) => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  // Sync API data if backend is available, else admissionsStore is used seamlessly
  useEffect(() => {
    async function tryLoadApiData() {
      try {
        const [applicantsRes, progRes] = await Promise.allSettled([
          api.getApplicants(),
          api.getProgrammes(),
        ]);
        if (applicantsRes.status === 'fulfilled' && applicantsRes.value?.data && applicantsRes.value.data.length > 0) {
          // Merge API applicants into store if available
          applicantsRes.value.data.forEach((app) => {
            if (!admissionsStore.getApplicantById(app.id)) {
              admissionsStore.addApplicant({
                ...app,
                appliedCourse: app.programme?.name || app.programmeName || 'B.Tech Computer Science & Engineering',
                courseCode: app.programme?.code || 'BTECH-CSE',
              });
            }
          });
        }
      } catch (e) {
        // Fallback to store
      }
    }
    tryLoadApiData();
  }, []);

  const courses = admissionsStore.getCourses();
  const applicants = admissionsStore.getApplicants();
  const rules = admissionsStore.getRules();
  const meritLists = admissionsStore.getMeritLists();
  const counsellingSchedules = admissionsStore.getCounsellingSchedules();
  const waitlist = admissionsStore.getWaitlist();
  const tickets = admissionsStore.getHelpdeskTickets();
  const staff = admissionsStore.getStaff();
  const calendarEvents = admissionsStore.getCalendarEvents();
  const communicationLogs = admissionsStore.getCommunicationLogs();

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  }

  // Handle new applicant registration
  const handleRegisterApplicant = (e) => {
    e.preventDefault();
    const newRecord = admissionsStore.addApplicant(formData);
    showToast(`Applicant ${formData.name} registered successfully with ID: ${newRecord.applicationNo}!`);
    setIsRegisterModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'Female',
      dob: '2005-08-15',
      category: 'General',
      appliedCourse: 'B.Tech Computer Science & Engineering',
      courseCode: 'BTECH-CSE',
      tenthMarks: '88.5',
      twelfthMarks: '86.0',
      entranceExam: 'JEE Main 2026',
      entranceRank: '32500',
    });
  };

  // Actions passed down to modules
  const handleVerify = (id, name) => {
    admissionsStore.changeApplicationStatus(id, 'Verified', 'Prerequisites & credentials verified', 'Ms. Sasmita Mohapatra');
    showToast(`Applicant ${name} marked as VERIFIED.`);
  };

  const handleApproveAndEnroll = (id) => {
    if (!window.confirm('Approve admission and provision student account, enrollment and activation link?')) return;
    const res = admissionsStore.enrollStudent(id);
    if (res && res.success && res.data) {
      setEnrolledStudentInfo(res.data);
      showToast(`Student ${res.data.name} admitted & account provisioned!`);
    }
  };

  const handleReject = (id, name) => {
    const reason = window.prompt(`Please provide an official rejection reason for ${name}:`, 'Prerequisites not met');
    if (reason === null) return;
    admissionsStore.changeApplicationStatus(id, 'Rejected', reason, 'Ms. Sasmita Mohapatra');
    showToast(`Applicant ${name} marked as REJECTED.`);
  };

  const copyActivationLink = () => {
    const fullUrl = `${window.location.origin}/#activate?token=${enrolledStudentInfo.activationToken}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // 16 Sidebar Modules organized into 5 Collapsible Groups
  const admissionsNavSections = [
    {
      title: 'ADMISSIONS PIPELINE',
      collapsible: true,
      items: [
        { id: 'dashboard', label: 'Admissions Command', icon: GraduationCap },
        { id: 'applicants', label: 'Applicant Registry', icon: Users, badge: `${applicants.length}` },
        { id: 'seat_matrix', label: 'Seat Matrix & Vacancy', icon: Layers, badge: '80 Vacant' },
      ],
    },
    {
      title: 'APPLICATION MANAGEMENT',
      collapsible: true,
      items: [
        { id: 'app_processing', label: 'Application Processing', icon: FileCheck2, badge: '25 Active' },
        { id: 'doc_verification', label: 'Document Verification', icon: CheckCircle2, badge: '38 Queue' },
        { id: 'eligibility_rules', label: 'Eligibility & Admission Rules', icon: ShieldCheck },
      ],
    },
    {
      title: 'SELECTION & COUNSELLING',
      collapsible: true,
      items: [
        { id: 'merit_list', label: 'Merit List Management', icon: Award, badge: 'Round 2' },
        { id: 'counselling_allotment', label: 'Counselling & Seat Allotment', icon: UserCheck },
        { id: 'waitlist_rounds', label: 'Waitlist & Admission Rounds', icon: Clock, badge: '5 Ranked' },
      ],
    },
    {
      title: 'ENROLLMENT & COMMUNICATION',
      collapsible: true,
      items: [
        { id: 'fee_verification', label: 'Admission Fee Verification', icon: Receipt, badge: '14 Pending' },
        { id: 'enrollment_conversion', label: 'Enrollment & Student Conversion', icon: Sparkles },
        { id: 'applicant_communication', label: 'Applicant Communication', icon: Megaphone },
        { id: 'admission_helpdesk', label: 'Admission Helpdesk', icon: HelpCircle, badge: '5 Open' },
      ],
    },
    {
      title: 'ADMINISTRATION & REPORTS',
      collapsible: true,
      items: [
        { id: 'staff_tasks', label: 'Admission Staff & Tasks', icon: Briefcase },
        { id: 'reports_analytics', label: 'Reports & Analytics', icon: FileSpreadsheet },
        { id: 'calendar_config', label: 'Admission Calendar & Config', icon: Calendar },
      ],
    },
  ];

  const getAdmissionsHeading = () => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: 'Admissions Cell & Enrollment Directorate',
          subtitle: 'Executive command console, prospective student intake, and real-time admission progress.',
        };
      case 'applicants':
        return {
          title: 'Candidate Applications & Verification Registry',
          subtitle: 'Applicant qualification documents, entrance percentiles, domicile status, and admission clearance.',
        };
      case 'seat_matrix':
        return {
          title: 'Seat Matrix & Intake Capacity Audit',
          subtitle: 'Branch-wise approved intakes, reservations, category allocations, and remaining vacancies.',
        };
      case 'app_processing':
        return {
          title: 'Application Scrutiny & Stage Processing',
          subtitle: 'Dossier completeness check, course eligibility validator, deficiency flags, and review remarks.',
        };
      case 'doc_verification':
        return {
          title: 'Document Verification & Scrutiny Desk',
          subtitle: 'Examine marksheets, verify qualifying certificates, and authenticate candidate credentials.',
        };
      case 'eligibility_rules':
        return {
          title: 'Eligibility & Admission Regulations',
          subtitle: 'Configure institutional admission criteria, cutoffs, mandatory subject prerequisites, and state policy.',
        };
      case 'merit_list':
        return {
          title: 'Merit List Publication & Rank Management',
          subtitle: 'Audit candidate rankings, apply approved tie-breaking rules, and gazette merit dockets.',
        };
      case 'counselling_allotment':
        return {
          title: 'Counselling Schedules & Seat Allotment',
          subtitle: 'Coordinate physical & virtual counselling sessions, assign slots, and allocate seats within approved capacity.',
        };
      case 'waitlist_rounds':
        return {
          title: 'Waitlist Management & Subsequent Rounds',
          subtitle: 'Backfill vacancies from declined offers, monitor waitlist positions, and extend merit promotions.',
        };
      case 'fee_verification':
        return {
          title: 'Admission Fee Scrutiny & Ledger Audit',
          subtitle: 'Reconcile seat confirmation deposits, verify bank UTRs, and audit transaction receipts.',
        };
      case 'enrollment_conversion':
        return {
          title: 'Final Enrollment & Student Conversion',
          subtitle: 'Guided 7-step checklist to convert selected applicants into enrolled college students.',
        };
      case 'applicant_communication':
        return {
          title: 'Applicant Communication & Circular Broadcast',
          subtitle: 'Multi-channel broadcast console for announcements, deficiency alerts, and reminders.',
        };
      case 'admission_helpdesk':
        return {
          title: 'Admission Helpdesk & Inquiries',
          subtitle: 'Candidate inquiries, grievance redressal, staff assignment, and resolution history.',
        };
      case 'staff_tasks':
        return {
          title: 'Admission Staff & Workload Delegation',
          subtitle: 'Departmental staff capacity monitoring, task delegation, and scrutiny throughput.',
        };
      case 'reports_analytics':
        return {
          title: 'Admission Reports & Analytics Suite',
          subtitle: 'Course conversion rates, scrutiny yields, fee realizations, and CSV/print reporting.',
        };
      case 'calendar_config':
        return {
          title: 'Admission Master Calendar & Milestones',
          subtitle: 'Regulatory cutoff dates, calendar views, schedule conflict warnings, and deadlines.',
        };
      default:
        return {
          title: (activeView || 'Admissions Portal').toUpperCase(),
          subtitle: 'Central Admissions Directorate',
        };
    }
  };

  const admissionsHeading = getAdmissionsHeading();

  return (
    <AppLayout
      account={account}
      portalName="Admissions Portal"
      portalSubtitle="Central Admissions & Enrollment Cell"
      portalHomeTab="dashboard"
      navSections={admissionsNavSections}
      activeTab={activeView}
      onTabChange={setActiveView}
      onLogout={onLogout}
      pageTitle={admissionsHeading.title}
      pageSubtitle={admissionsHeading.subtitle}
    >
      <div className="admissions-portal-wrap">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', fontWeight: 600 }}>
              <Sparkles size={18} color="#38bdf8" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: ADMISSIONS COMMAND EXECUTIVE DASHBOARD            */}
        {/* ======================================================== */}
        {activeView === 'dashboard' && (
          <AdmissionsCommandTab
            courses={courses}
            applicants={applicants}
            onNavigate={(targetTab) => setActiveView(targetTab)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 2: APPLICANT REGISTRY                                */}
        {/* ======================================================== */}
        {activeView === 'applicants' && (
          <ApplicantRegistryTab
            applicants={applicants}
            courses={courses}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            onVerify={handleVerify}
            onApproveAndEnroll={handleApproveAndEnroll}
            onReject={handleReject}
            onUpdateApplicant={(id, updates) => admissionsStore.updateApplicant(id, updates)}
            onAddReviewNote={(id, author, note) => admissionsStore.addReviewNote(id, author, note)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 3: SEAT MATRIX & VACANCY                             */}
        {/* ======================================================== */}
        {activeView === 'seat_matrix' && (
          <SeatMatrixTab courses={courses} />
        )}

        {/* ======================================================== */}
        {/* TAB 4: APPLICATION PROCESSING                            */}
        {/* ======================================================== */}
        {activeView === 'app_processing' && (
          <ApplicationProcessingTab
            applicants={applicants}
            courses={courses}
            rules={rules}
            onChangeStatus={(id, status, reason, updatedBy) =>
              admissionsStore.changeApplicationStatus(id, status, reason, updatedBy)
            }
            onAddReviewNote={(id, author, note) => admissionsStore.addReviewNote(id, author, note)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 5: DOCUMENT VERIFICATION                             */}
        {/* ======================================================== */}
        {activeView === 'doc_verification' && (
          <DocumentVerificationTab
            applicants={applicants}
            onVerifyDocument={(appId, docId, status, remarks, verifier) =>
              admissionsStore.verifyDocument(appId, docId, status, remarks, verifier)
            }
          />
        )}

        {/* ======================================================== */}
        {/* TAB 6: ELIGIBILITY & ADMISSION RULES                     */}
        {/* ======================================================== */}
        {activeView === 'eligibility_rules' && (
          <EligibilityRulesTab
            rules={rules}
            courses={courses}
            onUpdateRule={(id, updates) => admissionsStore.updateRule(id, updates)}
            onAddRule={(newRule) => admissionsStore.addRule(newRule)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 7: MERIT LIST MANAGEMENT                             */}
        {/* ======================================================== */}
        {activeView === 'merit_list' && (
          <MeritListTab
            meritLists={meritLists}
            courses={courses}
            onUpdateStatus={(id, status, approvedBy) =>
              admissionsStore.updateMeritListStatus(id, status, approvedBy)
            }
          />
        )}

        {/* ======================================================== */}
        {/* TAB 8: COUNSELLING & SEAT ALLOTMENT                      */}
        {/* ======================================================== */}
        {activeView === 'counselling_allotment' && (
          <CounsellingAllotmentTab
            counsellingSchedules={counsellingSchedules}
            applicants={applicants}
            courses={courses}
            onAddSchedule={(sched) => admissionsStore.addCounsellingSchedule(sched)}
            onAllotSeat={(appId, courseCode, slotInfo) => admissionsStore.allotSeat(appId, courseCode, slotInfo)}
            onUpdateApplicant={(id, updates) => admissionsStore.updateApplicant(id, updates)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 9: WAITLIST & ADMISSION ROUNDS                       */}
        {/* ======================================================== */}
        {activeView === 'waitlist_rounds' && (
          <WaitlistRoundsTab
            waitlist={waitlist}
            courses={courses}
            onPromoteCandidate={(id) => admissionsStore.promoteWaitlistCandidate(id)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 10: ADMISSION FEE VERIFICATION                       */}
        {/* ======================================================== */}
        {activeView === 'fee_verification' && (
          <FeeVerificationTab
            applicants={applicants}
            courses={courses}
            onVerifyFee={(appId, status, remarks, verifier) =>
              admissionsStore.verifyFee(appId, status, remarks, verifier)
            }
          />
        )}

        {/* ======================================================== */}
        {/* TAB 11: ENROLLMENT & STUDENT CONVERSION                  */}
        {/* ======================================================== */}
        {activeView === 'enrollment_conversion' && (
          <EnrollmentConversionTab
            applicants={applicants}
            courses={courses}
            onEnrollStudent={(appId, rollNo, section) => admissionsStore.enrollStudent(appId, rollNo, section)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 12: APPLICANT COMMUNICATION                          */}
        {/* ======================================================== */}
        {activeView === 'applicant_communication' && (
          <ApplicantCommunicationTab
            communicationLogs={communicationLogs}
            courses={courses}
            onSendCommunication={(data) => admissionsStore.sendCommunication(data)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 13: ADMISSION HELPDESK                               */}
        {/* ======================================================== */}
        {activeView === 'admission_helpdesk' && (
          <AdmissionHelpdeskTab
            tickets={tickets}
            staff={staff}
            onAddTicketReply={(id, msg, sender, newStatus) =>
              admissionsStore.addTicketReply(id, msg, sender, newStatus)
            }
            onUpdateTicketStatus={(id, status, remarks) =>
              admissionsStore.updateTicketStatus(id, status, remarks)
            }
          />
        )}

        {/* ======================================================== */}
        {/* TAB 14: ADMISSION STAFF & TASK MANAGEMENT                */}
        {/* ======================================================== */}
        {activeView === 'staff_tasks' && (
          <StaffTaskManagementTab
            staff={staff}
            onAssignTask={(staffId, taskName) => admissionsStore.assignStaffTask(staffId, taskName)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 15: ADMISSION REPORTS & ANALYTICS                    */}
        {/* ======================================================== */}
        {activeView === 'reports_analytics' && (
          <ReportsAnalyticsTab
            courses={courses}
            applicants={applicants}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 16: ADMISSION CALENDAR & CONFIGURATION               */}
        {/* ======================================================== */}
        {activeView === 'calendar_config' && (
          <AdmissionCalendarTab
            calendarEvents={calendarEvents}
            onAddCalendarEvent={(ev) => admissionsStore.addCalendarEvent(ev)}
          />
        )}
      </div>

      {/* REGISTER NEW STUDENT WIZARD (FULL 8-STEP COMPREHENSIVE ERP SYSTEM) */}
      <RegisterStudentWizard
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onStudentRegistered={(newStudent) => {
          setIsRegisterModalOpen(false);
          setEnrolledStudentInfo({
            name: newStudent.name,
            rollNumber: newStudent.rollNumber,
            email: newStudent.email,
            program: newStudent.appliedCourse || newStudent.course,
            regNo: newStudent.registrationNumber,
            password: newStudent.defaultPassword || 'Gift@2026',
          });
          showToast(`Candidate ${newStudent.name} registered and enrolled successfully!`);
        }}
      />

      {/* ONBOARDING CREDENTIAL MODAL (Preserved from existing portal) */}
      {enrolledStudentInfo && (
        <div className="adm-modal-backdrop" onClick={() => setEnrolledStudentInfo(null)}>
          <div className="adm-modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', padding: '24px', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Student Enrolled &amp; Account Provisioned</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                    Multi-table atomic transaction committed to college database
                  </p>
                </div>
              </div>
            </div>

            <div className="adm-modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Student Name:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{enrolledStudentInfo.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Assigned Roll / Login ID:</span>
                  <span style={{ fontWeight: 800, color: '#0369a1', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                    {enrolledStudentInfo.rollNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Registered Email:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{enrolledStudentInfo.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Programme &amp; Term:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{enrolledStudentInfo.department} (Sem 1)</span>
                </div>
              </div>

              {/* Secure Activation Link Box */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Unique Student Portal Activation Link
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/#activate?token=${enrolledStudentInfo.activationToken}`}
                    className="adm-search-input"
                    style={{ fontFamily: 'monospace', fontSize: '0.82rem', paddingLeft: '12px', background: '#f8fafc' }}
                  />
                  <button
                    onClick={() => copyActivationLink()}
                    className="adm-btn-primary"
                    style={{ background: copiedLink ? '#059669' : '#0f766e' }}
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  The student uses this one-time link to set their own password and access their student portal.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActivationTokenToSimulate(enrolledStudentInfo.activationToken);
                  }}
                  className="adm-btn-secondary"
                  style={{ flex: 1, padding: '12px', color: '#0f766e', borderColor: '#99f6e4', background: '#f0fdfa' }}
                >
                  <ExternalLink size={16} /> Test Student Activation Now
                </button>
                <button
                  type="button"
                  onClick={() => setEnrolledStudentInfo(null)}
                  className="adm-btn-primary"
                  style={{ background: '#0f172a', padding: '12px 20px' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT TEST ACTIVATION MODAL */}
      {activationTokenToSimulate && (
        <AccountActivationModal
          initialToken={activationTokenToSimulate}
          onClose={() => setActivationTokenToSimulate('')}
          onActivationSuccess={(user) => {
            showToast(`Account for ${user.name} activated successfully!`);
            setActivationTokenToSimulate('');
          }}
        />
      )}
    </AppLayout>
  );
}
