import React, { useState, useEffect } from 'react';
import { AppLayout } from './Navigation';
import {
  Award,
  Layers,
  Users,
  FileCheck,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  LayoutDashboard,
  Building,
  GraduationCap,
  ShieldCheck,
  Scale,
  DollarSign,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Eye,
  FileSpreadsheet,
  Briefcase,
  History,
  TrendingUp,
  CreditCard,
  HelpCircle,
  BarChart3,
  BookmarkCheck,
  ClipboardList
} from 'lucide-react';
import './ScholarshipPortal.css';

// Master Data & Submodules
import {
  SCHOLARSHIP_OFFICER,
  INITIAL_SCHOLARSHIP_SCHEMES,
  INITIAL_APPLICATIONS,
  INITIAL_VERIFICATION_DOCS,
  INITIAL_DISBURSEMENTS,
  INITIAL_FUNDING_SOURCES,
  INITIAL_APPEALS,
  INITIAL_SCHOLARSHIP_AUDIT_LOGS
} from './ScholarshipModules/scholarshipData.js';

import ScholarshipDashboardTab from './ScholarshipModules/ScholarshipDashboardTab.jsx';
import ScholarshipSchemesTab from './ScholarshipModules/ScholarshipSchemesTab.jsx';
import ScholarshipApplicationsTab from './ScholarshipModules/ScholarshipApplicationsTab.jsx';
import ScholarshipVerificationTab from './ScholarshipModules/ScholarshipVerificationTab.jsx';
import ScholarshipSelectionTab from './ScholarshipModules/ScholarshipSelectionTab.jsx';
import ScholarshipDisbursementsTab from './ScholarshipModules/ScholarshipDisbursementsTab.jsx';
import ScholarshipRenewalsTab from './ScholarshipModules/ScholarshipRenewalsTab.jsx';
import ScholarshipReportsTab from './ScholarshipModules/ScholarshipReportsTab.jsx';
import ScholarshipSettingsTab from './ScholarshipModules/ScholarshipSettingsTab.jsx';
import ScholarshipPage from '../pages/ScholarshipPage.jsx';

export default function ScholarshipPortal({ account, onLogout, onSwitchRole }) {
  // Current Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Persistence State
  const [schemes, setSchemes] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_schemes');
      return stored ? JSON.parse(stored) : INITIAL_SCHOLARSHIP_SCHEMES;
    } catch {
      return INITIAL_SCHOLARSHIP_SCHEMES;
    }
  });

  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_applications');
      return stored ? JSON.parse(stored) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_documents');
      return stored ? JSON.parse(stored) : INITIAL_VERIFICATION_DOCS;
    } catch {
      return INITIAL_VERIFICATION_DOCS;
    }
  });

  const [disbursements, setDisbursements] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_disbursements');
      return stored ? JSON.parse(stored) : INITIAL_DISBURSEMENTS;
    } catch {
      return INITIAL_DISBURSEMENTS;
    }
  });

  const [fundingSources, setFundingSources] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_funding');
      return stored ? JSON.parse(stored) : INITIAL_FUNDING_SOURCES;
    } catch {
      return INITIAL_FUNDING_SOURCES;
    }
  });

  const [appeals, setAppeals] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_appeals');
      return stored ? JSON.parse(stored) : INITIAL_APPEALS;
    } catch {
      return INITIAL_APPEALS;
    }
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_audit_logs');
      return stored ? JSON.parse(stored) : INITIAL_SCHOLARSHIP_AUDIT_LOGS;
    } catch {
      return INITIAL_SCHOLARSHIP_AUDIT_LOGS;
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_schemes', JSON.stringify(schemes));
    } catch {}
  }, [schemes]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_applications', JSON.stringify(applications));
    } catch {}
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_documents', JSON.stringify(documents));
    } catch {}
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_disbursements', JSON.stringify(disbursements));
    } catch {}
  }, [disbursements]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_funding', JSON.stringify(fundingSources));
    } catch {}
  }, [fundingSources]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_appeals', JSON.stringify(appeals));
    } catch {}
  }, [appeals]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_audit_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  const handleAddAuditLog = (logEntry) => {
    const newLog = {
      id: `SCH-LOG-${Math.floor(8920 + Math.random() * 900)}`,
      timestamp: 'Just now',
      actor: SCHOLARSHIP_OFFICER.name,
      role: 'Director (Scholarship Cell)',
      ip: '192.168.1.18 (Scholarship Directorate)',
      ...logEntry
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all scholarship demo changes and restore initial fictional institutional records?')) {
      localStorage.removeItem('apna_scholarship_schemes');
      localStorage.removeItem('apna_scholarship_applications');
      localStorage.removeItem('apna_scholarship_documents');
      localStorage.removeItem('apna_scholarship_disbursements');
      localStorage.removeItem('apna_scholarship_funding');
      localStorage.removeItem('apna_scholarship_appeals');
      localStorage.removeItem('apna_scholarship_audit_logs');

      setSchemes(INITIAL_SCHOLARSHIP_SCHEMES);
      setApplications(INITIAL_APPLICATIONS);
      setDocuments(INITIAL_VERIFICATION_DOCS);
      setDisbursements(INITIAL_DISBURSEMENTS);
      setFundingSources(INITIAL_FUNDING_SOURCES);
      setAppeals(INITIAL_APPEALS);
      setAuditLogs(INITIAL_SCHOLARSHIP_AUDIT_LOGS);
      setActiveTab('dashboard');
    }
  };

  // Main Navigation Sections (10 Functional Groups per Section 4 of Master Prompt)
  const navSections = [
    {
      title: 'A. Dashboard',
      collapsible: false,
      items: [
        { id: 'dashboard', label: 'Scholarship Dashboard', icon: LayoutDashboard },
        { id: 'public_portal', label: 'Scholarships & Aid (Student View)', icon: Eye }
      ]
    },
    {
      title: 'B. Scheme Management',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        { id: 'schemes_all', label: 'All Scholarship Schemes', icon: Layers, badge: `${schemes.length}` },
        { id: 'schemes_govt', label: 'Government Scholarships', icon: Building },
        { id: 'schemes_inst', label: 'Institutional Scholarships', icon: Award },
        { id: 'schemes_merit', label: 'Merit-Based Schemes', icon: GraduationCap },
        { id: 'schemes_need', label: 'Need-Based Aid', icon: DollarSign },
        { id: 'schemes_category', label: 'Category-Based Programs', icon: BookmarkCheck },
        { id: 'schemes_private', label: 'Private & CSR Sponsored', icon: Briefcase },
        { id: 'schemes_rules', label: 'Scheme Eligibility Rules', icon: Scale },
        { id: 'schemes_deadlines', label: 'Application Deadlines', icon: Calendar }
      ]
    },
    {
      title: 'C. Application Management',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        { id: 'apps_all', label: 'All Applications', icon: Users, badge: `${applications.length}` },
        { id: 'apps_new', label: 'New Applications', icon: FolderOpen },
        { id: 'apps_draft', label: 'Draft Applications', icon: FileText },
        { id: 'apps_submitted', label: 'Submitted Applications', icon: Send },
        { id: 'apps_incomplete', label: 'Incomplete Applications', icon: AlertTriangle },
        { id: 'apps_review', label: 'Applications Under Review', icon: Clock },
        { id: 'apps_approved', label: 'Approved Applications', icon: CheckCircle2 },
        { id: 'apps_rejected', label: 'Rejected Applications', icon: AlertTriangle },
        { id: 'apps_waitlist', label: 'Waiting List', icon: History },
        { id: 'apps_history', label: 'Application History', icon: ClipboardList }
      ]
    },
    {
      title: 'D. Eligibility and Verification',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        { id: 'verif_screening', label: 'Eligibility Screening', icon: ShieldCheck },
        { id: 'verif_academic', label: 'Academic Verification', icon: GraduationCap },
        { id: 'verif_income', label: 'Income Certificate Check', icon: DollarSign },
        { id: 'verif_category', label: 'Identity & Category Check', icon: BookmarkCheck },
        { id: 'verif_docs', label: 'Supporting Document Review', icon: FileCheck, badge: `${documents.length}` },
        { id: 'verif_discrepancy', label: 'Discrepancy Management', icon: AlertTriangle },
        { id: 'verif_history', label: 'Verification History', icon: History }
      ]
    },
    {
      title: 'E. Student Records',
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'student_profiles', label: 'Student Scholarship Profiles', icon: Users },
        { id: 'student_prev_awards', label: 'Previous Awards Register', icon: Award },
        { id: 'student_history', label: 'Scholarship History', icon: History },
        { id: 'student_renewals', label: 'Renewal Eligibility', icon: RefreshCw },
        { id: 'student_progress', label: 'Academic Progress Review', icon: TrendingUp }
      ]
    },
    {
      title: 'F. Selection and Approvals',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        { id: 'sel_shortlist', label: 'Application Shortlisting', icon: FolderOpen },
        { id: 'sel_ranking', label: 'Merit Ranking Index', icon: TrendingUp },
        { id: 'sel_committee', label: 'Committee Review Console', icon: Users },
        { id: 'sel_approval_queue', label: 'Executive Approval Queue', icon: CheckCircle2 },
        { id: 'sel_award_letters', label: 'Award Letter Management', icon: Award },
        { id: 'sel_appeals', label: 'Appeals & Reconsideration', icon: HelpCircle }
      ]
    },
    {
      title: 'G. Awards & Disbursements',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        { id: 'award_register', label: 'Award Register', icon: Award },
        { id: 'award_amounts', label: 'Award Amount Management', icon: DollarSign },
        { id: 'award_installments', label: 'Installment Schedules', icon: Calendar },
        { id: 'award_disbursements', label: 'Disbursement Tracking', icon: Send, badge: `${disbursements.length}` },
        { id: 'award_sponsors', label: 'Sponsor Funding Pools', icon: Building },
        { id: 'award_payments', label: 'Payment Status', icon: CreditCard },
        { id: 'award_reconciliation', label: 'Disbursement Reconciliation', icon: CheckCircle2 }
      ]
    },
    {
      title: 'H. Renewals and Appeals',
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'ren_applications', label: 'Renewal Applications', icon: RefreshCw },
        { id: 'ren_review', label: 'Renewal Eligibility Review', icon: ShieldCheck },
        { id: 'ren_pending', label: 'Pending Renewals', icon: Clock },
        { id: 'ren_appeals', label: 'Student Appeal Requests', icon: HelpCircle, badge: `${appeals.length}` },
        { id: 'ren_history', label: 'Reconsideration History', icon: History }
      ]
    },
    {
      title: 'I. Reports & Analytics',
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'rep_applications', label: 'Application Reports', icon: BarChart3 },
        { id: 'rep_depts', label: 'Department-Wise Scholarships', icon: Building },
        { id: 'rep_verification', label: 'Eligibility & Verification', icon: ShieldCheck },
        { id: 'rep_distribution', label: 'Award Distribution MIS', icon: Award },
        { id: 'rep_funds', label: 'Fund Utilization Statement', icon: DollarSign },
        { id: 'rep_disbursements', label: 'Disbursement MIS', icon: Send },
        { id: 'rep_renewals', label: 'Renewal & Retention Rates', icon: RefreshCw },
        { id: 'rep_audit', label: 'Statutory Audit Trail', icon: FileText }
      ]
    },
    {
      title: 'J. Settings & Policies',
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'set_academic_year', label: 'Academic Year Config', icon: Calendar },
        { id: 'set_windows', label: 'Application Windows', icon: Clock },
        { id: 'set_eligibility', label: 'Eligibility Templates', icon: Scale },
        { id: 'set_documents', label: 'Document Requirements', icon: FileCheck },
        { id: 'set_workflows', label: 'Review Workflows', icon: Layers },
        { id: 'set_categories', label: 'Scholarship Categories', icon: BookmarkCheck },
        { id: 'set_notifications', label: 'Notification Settings', icon: Send },
        { id: 'set_permissions', label: 'Role & Permissions Demo', icon: ShieldCheck }
      ]
    }
  ];

  // Helper to map activeTab to pageTitle & breadcrumbs
  const getPageMeta = (tab) => {
    switch (tab) {
      case 'public_portal':
        return {
          title: 'Scholarships & Financial Aid Catalog',
          subtitle: 'Student Portal & Public Scheme Opportunities · Academic Session 2026–2027',
          crumbs: ['Scholarship Directorate', 'Public Catalog']
        };
      case 'dashboard':
        return {
          title: 'Scholarship Directorate Command Dashboard',
          subtitle: `Active Cycle 2026–2027 · Autonomous Financial Aid & Welfare Administration`,
          crumbs: ['Scholarship Directorate', 'Executive Dashboard']
        };
      case 'schemes_all':
      case 'schemes_govt':
      case 'schemes_inst':
      case 'schemes_merit':
      case 'schemes_need':
      case 'schemes_category':
      case 'schemes_private':
      case 'schemes_rules':
      case 'schemes_deadlines':
        return {
          title: 'Scholarship Scheme Register & Quota Policies',
          subtitle: 'Statutory government schemes, institutional endowment grants, and corporate CSR programs',
          crumbs: ['Scholarship Directorate', 'Scheme Management', 'Active Schemes']
        };
      case 'apps_all':
      case 'apps_new':
      case 'apps_draft':
      case 'apps_submitted':
      case 'apps_incomplete':
      case 'apps_review':
      case 'apps_approved':
      case 'apps_rejected':
      case 'apps_waitlist':
      case 'apps_history':
        return {
          title: 'Student Scholarship Application Master Registry',
          subtitle: 'End-to-end applicant tracking, qualification assessment, and decision audit',
          crumbs: ['Scholarship Directorate', 'Application Management', 'Registry']
        };
      case 'verif_screening':
      case 'verif_academic':
      case 'verif_income':
      case 'verif_category':
      case 'verif_docs':
      case 'verif_discrepancy':
      case 'verif_history':
        return {
          title: 'Document & Eligibility Verification Workspace',
          subtitle: 'Autonomous Controller of Exams marks clearance and revenue barcode validation',
          crumbs: ['Scholarship Directorate', 'Eligibility & Verification']
        };
      case 'student_profiles':
      case 'student_prev_awards':
      case 'student_history':
      case 'student_renewals':
      case 'student_progress':
        return {
          title: 'Student Scholarship Dossiers & Academic Records',
          subtitle: 'Cumulative historical awards, semester-wise CGPA continuity, and clearance ledgers',
          crumbs: ['Scholarship Directorate', 'Student Records']
        };
      case 'sel_shortlist':
      case 'sel_ranking':
      case 'sel_committee':
      case 'sel_approval_queue':
      case 'sel_award_letters':
      case 'sel_appeals':
        return {
          title: 'Scholarship Committee Selection & Award Sanction',
          subtitle: 'Merit ranking index, multi-stage approval queue, and formal award letter generation',
          crumbs: ['Scholarship Directorate', 'Selection & Approvals']
        };
      case 'award_register':
      case 'award_amounts':
      case 'award_installments':
      case 'award_disbursements':
      case 'award_sponsors':
      case 'award_payments':
      case 'award_reconciliation':
        return {
          title: 'Award Commitments & Multi-Tranche Disbursements',
          subtitle: 'Scheduled installments, mock bank transaction UTR tracking, and sponsor funding registers',
          crumbs: ['Scholarship Directorate', 'Awards & Disbursements']
        };
      case 'ren_applications':
      case 'ren_review':
      case 'ren_pending':
      case 'ren_appeals':
      case 'ren_history':
        return {
          title: 'Scholarship Renewals & Student Appellate Reconsideration',
          subtitle: 'Performance retention screening and independent student grievance review council',
          crumbs: ['Scholarship Directorate', 'Renewals & Appeals']
        };
      case 'rep_applications':
      case 'rep_depts':
      case 'rep_verification':
      case 'rep_distribution':
      case 'rep_funds':
      case 'rep_disbursements':
      case 'rep_renewals':
      case 'rep_audit':
        return {
          title: 'Scholarship Reports, Analytics & Statutory Audit Trail',
          subtitle: 'Departmental statements, fund utilization MIS, printable registers, and CSV data export',
          crumbs: ['Scholarship Directorate', 'Reports & MIS']
        };
      case 'set_academic_year':
      case 'set_windows':
      case 'set_eligibility':
      case 'set_documents':
      case 'set_workflows':
      case 'set_categories':
      case 'set_notifications':
      case 'set_permissions':
        return {
          title: 'Scholarship Directorate Settings & Regulatory Policy',
          subtitle: 'Academic sessions, attendance thresholds, merit scoring weights, and demo data controls',
          crumbs: ['Scholarship Directorate', 'Settings']
        };
      default:
        return {
          title: 'Scholarship & Student Financial Aid Directorate',
          subtitle: 'Apna Campus Autonomous Engineering College',
          crumbs: ['Scholarship Directorate']
        };
    }
  };

  const meta = getPageMeta(activeTab);

  // Render the appropriate submodule based on activeTab
  const renderContent = () => {
    // Public / Student Portal View
    if (activeTab === 'public_portal') {
      return <ScholarshipPage account={account} />;
    }

    // A. Dashboard
    if (activeTab === 'dashboard') {
      return (
        <ScholarshipDashboardTab
          schemes={schemes}
          applications={applications}
          disbursements={disbursements}
          fundingSources={fundingSources}
          onNavigateTab={(targetTab) => setActiveTab(targetTab)}
          onSelectApplication={(app) => {
            setActiveTab('apps_all');
          }}
          onOpenCreateScheme={() => {
            setActiveTab('schemes_all');
          }}
        />
      );
    }

    // B. Scheme Management
    if (activeTab.startsWith('schemes_')) {
      let initialCat = 'All';
      if (activeTab === 'schemes_govt') initialCat = 'Government';
      else if (activeTab === 'schemes_inst') initialCat = 'Institutional';
      else if (activeTab === 'schemes_merit') initialCat = 'Merit';
      else if (activeTab === 'schemes_need') initialCat = 'Need';
      else if (activeTab === 'schemes_category') initialCat = 'Category';
      else if (activeTab === 'schemes_private') initialCat = 'Private';

      return (
        <ScholarshipSchemesTab
          schemes={schemes}
          applications={applications}
          onUpdateSchemes={setSchemes}
          onNavigateTab={(targetTab) => setActiveTab(targetTab)}
          onSelectApplication={(app) => setActiveTab('apps_all')}
          initialCategoryFilter={initialCat}
        />
      );
    }

    // C. Application Management & E. Student Records
    if (activeTab.startsWith('apps_') || activeTab.startsWith('student_')) {
      let initialStatus = 'All';
      if (activeTab === 'apps_new') initialStatus = 'New';
      else if (activeTab === 'apps_review') initialStatus = 'Review';
      else if (activeTab === 'apps_approved') initialStatus = 'Approved';
      else if (activeTab === 'apps_rejected') initialStatus = 'Rejected';
      else if (activeTab === 'apps_waitlist') initialStatus = 'Waitlisted';

      return (
        <ScholarshipApplicationsTab
          applications={applications}
          schemes={schemes}
          onUpdateApplications={setApplications}
          onAddAuditLog={handleAddAuditLog}
          initialStatusFilter={initialStatus}
        />
      );
    }

    // D. Eligibility and Verification
    if (activeTab.startsWith('verif_')) {
      return (
        <ScholarshipVerificationTab
          documents={documents}
          applications={applications}
          onUpdateDocuments={setDocuments}
          onUpdateApplications={setApplications}
          onAddAuditLog={handleAddAuditLog}
        />
      );
    }

    // F. Selection and Approvals
    if (activeTab.startsWith('sel_')) {
      return (
        <ScholarshipSelectionTab
          applications={applications}
          schemes={schemes}
          onUpdateApplications={setApplications}
          onAddAuditLog={handleAddAuditLog}
        />
      );
    }

    // G. Awards and Disbursements
    if (activeTab.startsWith('award_')) {
      return (
        <ScholarshipDisbursementsTab
          disbursements={disbursements}
          fundingSources={fundingSources}
          applications={applications}
          onUpdateDisbursements={setDisbursements}
          onAddAuditLog={handleAddAuditLog}
        />
      );
    }

    // H. Renewals and Appeals
    if (activeTab.startsWith('ren_')) {
      return (
        <ScholarshipRenewalsTab
          applications={applications}
          appeals={appeals}
          onUpdateApplications={setApplications}
          onUpdateAppeals={setAppeals}
          onAddAuditLog={handleAddAuditLog}
        />
      );
    }

    // I. Reports and Analytics
    if (activeTab.startsWith('rep_')) {
      let initialRep = 'applications';
      if (activeTab === 'rep_funds') initialRep = 'funds';
      else if (activeTab === 'rep_audit') initialRep = 'audit';
      else if (activeTab === 'rep_schemes') initialRep = 'schemes';

      return (
        <ScholarshipReportsTab
          schemes={schemes}
          applications={applications}
          disbursements={disbursements}
          fundingSources={fundingSources}
          auditLogs={auditLogs}
          initialReportType={initialRep}
        />
      );
    }

    // J. Settings and Configuration
    if (activeTab.startsWith('set_')) {
      return (
        <ScholarshipSettingsTab
          onResetDemoData={handleResetDemoData}
          onAddAuditLog={handleAddAuditLog}
        />
      );
    }

    return null;
  };

  return (
    <AppLayout
      account={account}
      portalName="Scholarship Portal"
      portalSubtitle="Directorate of Student Welfare & Financial Aid"
      portalHomeTab="dashboard"
      navSections={navSections}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId)}
      onLogout={onLogout}
      pageTitle={meta.title}
      pageSubtitle={meta.subtitle}
      breadcrumbs={meta.crumbs}
    >
      <div className="scholarship-portal-root">
        {renderContent()}
      </div>
    </AppLayout>
  );
}
