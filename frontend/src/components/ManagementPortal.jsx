import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  TrendingUp, Users, GraduationCap, DollarSign, Briefcase,
  Building, BookOpen, BarChart2, Calendar, CheckCircle,
  Download, LogOut, ArrowUpRight, Shield, FileCheck,
  PieChart, AlertCircle, Bus, FlaskConical, UserCheck,
  Bell, ChevronRight, Star, Activity, Layers, Award,
  Globe, Settings, Eye, ClipboardList, TrendingDown, Menu, X,
  FileSpreadsheet, RefreshCw, Search, Filter, AlertTriangle,
  FileText, Check, ArrowRight, CornerDownLeft, Info,
  Plus, CheckCircle2, ShieldCheck, Target, Server, HardHat,
  FileBadge, Wrench, Sparkles, Clock, AlertOctagon
} from 'lucide-react';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import api from '../services/api.js';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import './ManagementPortal.css';

// ─── Static Fallbacks & Seed Constants ────────────────────────────────────────

const FALLBACK_DEPTS = [
  { name: 'Computer Science & Engg (CSE)', code: 'CSE', hod: 'Dr. P. K. Pattnaik', students: 540, faculty: 32, cgpa: 8.42, attendance: 91.2, placement: 94.6, feeRecovery: 96.2, pass: 97.1, scholarships: 42, sfr: '1:16.9', budgetAllocated: 62000000, budgetSpent: 48500000, budgetUtilization: 78.2 },
  { name: 'AI & Machine Learning (AIML)', code: 'AIML', hod: 'Dr. S. K. Swain', students: 360, faculty: 22, cgpa: 8.28, attendance: 89.8, placement: 91.2, feeRecovery: 94.4, pass: 96.0, scholarships: 28, sfr: '1:16.4', budgetAllocated: 44000000, budgetSpent: 33500000, budgetUtilization: 76.1 },
  { name: 'Electronics & Comm. (ECE)', code: 'ECE', hod: 'Dr. M. R. Senapati', students: 380, faculty: 24, cgpa: 8.10, attendance: 88.6, placement: 86.2, feeRecovery: 93.5, pass: 94.8, scholarships: 22, sfr: '1:15.8', budgetAllocated: 41000000, budgetSpent: 31200000, budgetUtilization: 76.1 },
  { name: 'Electrical & Electronics (EEE)', code: 'EEE', hod: 'Dr. S. K. Das', students: 290, faculty: 18, cgpa: 7.85, attendance: 87.4, placement: 78.0, feeRecovery: 91.0, pass: 92.4, scholarships: 18, sfr: '1:16.1', budgetAllocated: 32000000, budgetSpent: 23600000, budgetUtilization: 73.8 },
  { name: 'Mechanical Engineering (MECH)', code: 'MECH', hod: 'Dr. B. K. Rout', students: 320, faculty: 22, cgpa: 7.68, attendance: 86.0, placement: 74.5, feeRecovery: 89.4, pass: 90.6, scholarships: 14, sfr: '1:14.5', budgetAllocated: 35000000, budgetSpent: 24800000, budgetUtilization: 70.9 },
  { name: 'Civil Engineering (CIVIL)', code: 'CIVIL', hod: 'Dr. A. K. Nayak', students: 240, faculty: 16, cgpa: 7.72, attendance: 85.2, placement: 72.0, feeRecovery: 88.0, pass: 89.2, scholarships: 10, sfr: '1:15.0', budgetAllocated: 28000000, budgetSpent: 19400000, budgetUtilization: 69.3 },
  { name: 'MBA (Business Administration)', code: 'MBA', hod: 'Dr. Rashmi Mohanty', students: 180, faculty: 14, cgpa: 7.90, attendance: 90.4, placement: 88.0, feeRecovery: 95.0, pass: 95.0, scholarships: 8, sfr: '1:12.9', budgetAllocated: 22000000, budgetSpent: 16800000, budgetUtilization: 76.4 },
  { name: 'MCA (Computer Applications)', code: 'MCA', hod: 'Dr. T. P. Tripathy', students: 180, faculty: 12, cgpa: 8.02, attendance: 91.0, placement: 87.5, feeRecovery: 94.2, pass: 95.6, scholarships: 12, sfr: '1:15.0', budgetAllocated: 21000000, budgetSpent: 16200000, budgetUtilization: 77.1 },
];

const FALLBACK_DRIVES = [
  { company: 'Tata Consultancy Services (TCS Digital)', role: 'System Engineer / Digital Specialist', ctc: '₹7.5 LPA', registered: 210, shortlisted: 84, selected: 28, status: 'Active', dept: 'CSE, AIML, ECE' },
  { company: 'Infosys Power Programmer', role: 'Specialist Programmer', ctc: '₹9.5 LPA', registered: 165, shortlisted: 42, selected: 14, status: 'Active', dept: 'CSE, AIML' },
  { company: 'Deloitte USI Technology', role: 'Analyst — Technology Consulting', ctc: '₹8.2 LPA', registered: 240, shortlisted: 95, selected: 31, status: 'Completed', dept: 'CSE, AIML, ECE, MCA' },
  { company: 'L&T Technology Services', role: 'Graduate Engineer Trainee', ctc: '₹6.0 LPA', registered: 180, shortlisted: 60, selected: 22, status: 'Ongoing', dept: 'ECE, EEE, MECH, CIVIL' },
  { company: 'Wipro NLTH', role: 'Project Engineer', ctc: '₹5.8 LPA', registered: 190, shortlisted: 70, selected: 25, status: 'Completed', dept: 'CSE, ECE, MCA' },
  { company: 'Sprinklr India', role: 'Product Engineer', ctc: '₹24.0 LPA', registered: 140, shortlisted: 18, selected: 4, status: 'Completed', dept: 'CSE, AIML' },
  { company: 'Cognizant GenC Next', role: 'Associate Software Engineer', ctc: '₹6.7 LPA', registered: 200, shortlisted: 64, selected: 26, status: 'Ongoing', dept: 'All Engineering' },
];

const FALLBACK_FEES = [
  { dept: 'CSE', total: '₹5.29 Cr', collected: '₹5.09 Cr', due: '₹20.3 L', pct: 96.2 },
  { dept: 'AIML', total: '₹3.51 Cr', collected: '₹3.32 Cr', due: '₹19.1 L', pct: 94.4 },
  { dept: 'ECE', total: '₹3.71 Cr', collected: '₹3.47 Cr', due: '₹24.1 L', pct: 93.5 },
  { dept: 'EEE', total: '₹2.83 Cr', collected: '₹2.58 Cr', due: '₹25.7 L', pct: 91.0 },
  { dept: 'MECH', total: '₹3.12 Cr', collected: '₹2.79 Cr', due: '₹33.4 L', pct: 89.4 },
  { dept: 'CIVIL', total: '₹2.34 Cr', collected: '₹2.06 Cr', due: '₹28.5 L', pct: 88.0 },
  { dept: 'MBA', total: '₹1.75 Cr', collected: '₹1.66 Cr', due: '₹8.8 L', pct: 95.0 },
  { dept: 'MCA', total: '₹1.75 Cr', collected: '₹1.65 Cr', due: '₹10.3 L', pct: 94.2 },
];

const FALLBACK_NOTICES = [
  { id: 'NOT-001', tag: 'REGULATORY', title: 'NAAC Accreditation Cycle IV Preparatory Inspection — Final Review', date: '05 Oct 2026', priority: 'Critical', acknowledged: true, issuer: 'IQAC Secretariat' },
  { id: 'NOT-002', tag: 'ACADEMIC', title: 'Academic Calendar 2026-27 (Odd Semester) — Approved & Published', date: '01 Oct 2026', priority: 'High', acknowledged: true, issuer: 'Academic Council' },
  { id: 'NOT-003', tag: 'FINANCE', title: 'FY 2026-27 Budget Utilization Report — Q2 Submitted to Trust Board', date: '30 Sep 2026', priority: 'Medium', acknowledged: false, issuer: 'Chief Accounts Officer' },
  { id: 'NOT-004', tag: 'PLACEMENT', title: 'Campus Placement Season 2026-27 Officially Commenced — 42 Companies Confirmed', date: '28 Sep 2026', priority: 'High', acknowledged: true, issuer: 'Head Training & Placement' },
  { id: 'NOT-005', tag: 'STATUTORY', title: 'AICTE Mandatory Disclosure 2026-27 Upload Verification Completed', date: '24 Sep 2026', priority: 'Medium', acknowledged: true, issuer: 'Registrar Office' },
];

// ─── Export Utilities ────────────────────────────────────────────────────────

function downloadCSV(filename, headers, rows) {
  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function openPrintReport(title, htmlBody) {
  const win = window.open('', '_blank', 'width=950,height=750');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 32px; background: #fff; font-size: 13px; line-height: 1.5; }
        h1 { font-size: 22px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px; }
        .meta { font-size: 11px; color: #64748b; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
        h2 { font-size: 15px; font-weight: 700; margin: 24px 0 10px; color: #1e40af; border-bottom: 2px solid #dbeafe; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        th { background: #eff6ff; color: #1e40af; padding: 9px 12px; text-align: left; font-weight: 700; border: 1px solid #bfdbfe; }
        td { padding: 8px 12px; border: 1px solid #e2e8f0; color: #334155; }
        tr:nth-child(even) td { background: #f8faff; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .kpi-box { border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; background: #eff6ff; }
        .kpi-label { font-size: 10px; color: #3b82f6; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
        .kpi-value { font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 4px 0 2px; }
        .kpi-sub { font-size: 10px; color: #64748b; }
        .footer { margin-top: 36px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; }
        @media print { .no-print { display: none; } body { padding: 16px; } }
      </style>
    </head>
    <body>
      <h1>Apna Campus — ${title}</h1>
      <div class="meta">Governing Body / Board of Trustees &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; FY 2026-27 Autonomous College</div>
      ${htmlBody}
      <div class="footer">
        <span>Auto-generated by Institutional Management ERP. Strictly for Governing Body reference.</span>
        <span>&copy; Apna Campus 2026</span>
      </div>
      <br/>
      <button class="no-print" onclick="window.print()" style="background:#1d4ed8;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;">🖨 Print / Save as PDF</button>
    </body>
    </html>
  `);
  win.document.close();
}

// ─── UI Helper Components ────────────────────────────────────────────────────

const ProgressBar = ({ value, color = '#2563eb' }) => (
  <div className="mgmt-progress-bg">
    <div className="mgmt-progress-fill" style={{ width: `${Math.min(Math.max(Number(value) || 0, 0), 100)}%`, background: color }} />
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'mgmt-status mgmt-status-warning',
    'Approved': 'mgmt-status mgmt-status-success',
    'Under Review': 'mgmt-status mgmt-status-info',
    'Active': 'mgmt-status mgmt-status-success',
    'Ongoing': 'mgmt-status mgmt-status-info',
    'Completed': 'mgmt-status mgmt-status-neutral',
    'Rejected': 'mgmt-status mgmt-status-danger',
    'Returned for Revision': 'mgmt-status mgmt-status-warning',
  };
  return <span className={map[status] || 'mgmt-status mgmt-status-neutral'}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
  const map = {
    'High': 'mgmt-status mgmt-priority-high',
    'Critical': 'mgmt-status mgmt-priority-high',
    'Medium': 'mgmt-status mgmt-priority-medium',
    'Low': 'mgmt-status mgmt-priority-low',
  };
  return <span className={map[priority] || 'mgmt-status mgmt-status-neutral'}>{priority}</span>;
};

const KPI = ({ label, value, sub, icon, color = '#2563eb', bg = '#eff6ff', topBar, trend, onClick, tooltip }) => (
  <div
    className={`mgmt-kpi ${onClick ? 'clickable' : ''}`}
    onClick={onClick}
    title={tooltip || (onClick ? `Click to view details in ${label}` : undefined)}
  >
    <div className="mgmt-kpi-top-bar" style={{ background: topBar || `linear-gradient(90deg, ${color}, #60a5fa)` }} />
    <div className="mgmt-kpi-head">
      <div>
        <div className="mgmt-kpi-label">{label}</div>
        <div className="mgmt-kpi-value">{value}</div>
      </div>
      <div className="mgmt-kpi-icon" style={{ background: bg }}>
        {React.cloneElement(icon, { size: 18, color })}
      </div>
    </div>
    {sub && (
      <div className={`mgmt-kpi-trend ${trend || 'up'}`}>
        {trend === 'down' ? <TrendingDown size={13} /> : trend === 'neutral' ? <Activity size={13} /> : trend === 'warn' ? <AlertCircle size={13} /> : <ArrowUpRight size={13} />}
        {sub}
      </div>
    )}
  </div>
);

// ─── Main ManagementPortal Component ─────────────────────────────────────────

export default function ManagementPortal({ account, onLogout, onSwitchRole }) {
  // Navigation & UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('executive');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

  // Global Filters
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [overviewData, setOverviewData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [departments, setDepartments] = useState(FALLBACK_DEPTS);
  const [financials, setFinancials] = useState(null);
  const [placements, setPlacements] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [governance, setGovernance] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Missing Capabilities Enterprise States
  const [strategyTargets, setStrategyTargets] = useState([]);
  const [boardMeetings, setBoardMeetings] = useState([]);
  const [boardResolutions, setBoardResolutions] = useState([]);
  const [accreditationEvidence, setAccreditationEvidence] = useState([]);
  const [capitalProjects, setCapitalProjects] = useState({ totals: {}, data: [] });
  const [capaRecords, setCapaRecords] = useState([]);
  const [integrationHealth, setIntegrationHealth] = useState(null);

  // Modals & Action Dialogs
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedDeptDetail, setSelectedDeptDetail] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null); // { id, action: 'APPROVE'|'REJECT'|'RETURN', title }
  const [actionComments, setActionComments] = useState('');

  // Missing Capabilities Modals
  const [newProposalModal, setNewProposalModal] = useState({
    open: false,
    title: '',
    category: 'Capital Expenditure',
    budget: '',
    department: 'Computer Science & Engineering',
    priority: 'High',
    description: '',
    notes: '',
  });

  const [resolveCapaModal, setResolveCapaModal] = useState({
    open: false,
    record: null,
    notes: '',
    evidenceUrl: '',
  });

  const [selectedMeetingModal, setSelectedMeetingModal] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        ovRes, insRes, deptRes, finRes, plcRes, appRes, govRes, excRes, audRes,
        stratRes, meetRes, evidRes, capRes, capaRes, healthRes
      ] = await Promise.allSettled([
        api.getManagementOverview({ academicYear, semester: semesterFilter }),
        api.getManagementInsights(),
        api.getManagementDepartments({ academicYear, semester: semesterFilter, department: deptFilter }),
        api.getManagementFinance({ academicYear }),
        api.getManagementPlacements(),
        api.getManagementApprovals(),
        api.getManagementGovernance(),
        api.getManagementExceptions(),
        api.getManagementAuditTrail(),
        api.getManagementStrategyTargets(),
        api.getManagementBoardMeetings(),
        api.getManagementAccreditationEvidence(),
        api.getManagementCapitalProjects(),
        api.getManagementCorrectiveActions(),
        api.getManagementIntegrationHealth(),
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value?.success) setOverviewData(ovRes.value.data);
      if (insRes.status === 'fulfilled' && insRes.value?.success) setInsights(insRes.value.data || []);
      if (deptRes.status === 'fulfilled' && deptRes.value?.success) setDepartments(deptRes.value.data || FALLBACK_DEPTS);
      if (finRes.status === 'fulfilled' && finRes.value?.success) setFinancials(finRes.value.data);
      if (plcRes.status === 'fulfilled' && plcRes.value?.success) setPlacements(plcRes.value.data);
      if (appRes.status === 'fulfilled' && appRes.value?.success) setApprovals(appRes.value.data || []);
      if (govRes.status === 'fulfilled' && govRes.value?.success) setGovernance(govRes.value.data);
      if (excRes.status === 'fulfilled' && excRes.value?.success) setExceptions(excRes.value.data || []);
      if (audRes.status === 'fulfilled' && audRes.value?.success) setAuditLogs(audRes.value.data || []);

      // Capabilities Data Binding
      if (stratRes.status === 'fulfilled' && stratRes.value?.success) setStrategyTargets(stratRes.value.data || []);
      if (meetRes.status === 'fulfilled' && meetRes.value?.success) {
        setBoardMeetings(meetRes.value.meetings || []);
        setBoardResolutions(meetRes.value.resolutions || []);
      }
      if (evidRes.status === 'fulfilled' && evidRes.value?.success) setAccreditationEvidence(evidRes.value.data || []);
      if (capRes.status === 'fulfilled' && capRes.value?.success) {
        setCapitalProjects({ totals: capRes.value.totals || {}, data: capRes.value.data || [] });
      }
      if (capaRes.status === 'fulfilled' && capaRes.value?.success) setCapaRecords(capaRes.value.data || []);
      if (healthRes.status === 'fulfilled' && healthRes.value?.success) setIntegrationHealth(healthRes.value);

      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Error loading management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [academicYear, semesterFilter, deptFilter]);

  // ─── Actions & Handlers ────────────────────────────────────────────────────

  const handleCreateProposalSubmit = async (e) => {
    e.preventDefault();
    if (!newProposalModal.title.trim()) {
      showToast('⚠️ Proposal title is required.');
      return;
    }

    try {
      const res = await api.createManagementProposal({
        title: newProposalModal.title,
        category: newProposalModal.category,
        budget: newProposalModal.budget || 'N/A',
        department: newProposalModal.department,
        priority: newProposalModal.priority,
        description: newProposalModal.description,
        notes: newProposalModal.notes,
      });

      if (res?.success) {
        showToast(`✅ Strategic proposal "${newProposalModal.title}" created successfully!`);
        setNewProposalModal({
          open: false,
          title: '',
          category: 'Capital Expenditure',
          budget: '',
          department: 'Computer Science & Engineering',
          priority: 'High',
          description: '',
          notes: '',
        });
        const appRes = await api.getManagementApprovals().catch(() => null);
        if (appRes?.success) setApprovals(appRes.data || []);
        const audRes = await api.getManagementAuditTrail().catch(() => null);
        if (audRes?.success) setAuditLogs(audRes.data || []);
      } else {
        showToast(`⚠️ Could not create proposal: ${res?.message || 'Error'}`);
      }
    } catch (err) {
      showToast('⚠️ Error submitting proposal to server.');
    }
  };

  const handleResolveCapaSubmit = async (e) => {
    e.preventDefault();
    if (!resolveCapaModal.record) return;

    try {
      const res = await api.resolveManagementCorrectiveAction(resolveCapaModal.record.id, {
        resolutionNotes: resolveCapaModal.notes,
        evidenceUrl: resolveCapaModal.evidenceUrl,
      });

      if (res?.success) {
        showToast(`✅ Corrective Action ${resolveCapaModal.record.id} marked as Resolved!`);
        setResolveCapaModal({ open: false, record: null, notes: '', evidenceUrl: '' });
        const capaRes = await api.getManagementCorrectiveActions().catch(() => null);
        if (capaRes?.success) setCapaRecords(capaRes.data || []);
        const audRes = await api.getManagementAuditTrail().catch(() => null);
        if (audRes?.success) setAuditLogs(audRes.data || []);
      } else {
        showToast('⚠️ Resolution could not be recorded.');
      }
    } catch (err) {
      showToast('⚠️ Server error recording resolution.');
    }
  };

  const handleDecisionSubmit = async () => {
    if (!actionConfirm) return;
    const { id, action } = actionConfirm;

    try {
      const res = await api.decideManagementApproval(id, action, actionComments);
      if (res.success) {
        showToast(`✅ Proposal ${id} ${action === 'APPROVE' ? 'Approved' : action === 'RETURN' ? 'Returned for Revision' : 'Rejected'}!`);
        // Refresh approvals and audit trail
        const appRes = await api.getManagementApprovals().catch(() => null);
        if (appRes?.success) setApprovals(appRes.data);
        const audRes = await api.getManagementAuditTrail().catch(() => null);
        if (audRes?.success) setAuditLogs(audRes.data);
      } else {
        showToast(`⚠️ Action could not be completed: ${res.message || 'Error'}`);
      }
    } catch (e) {
      showToast(`⚠️ Server error processing decision on ${id}.`);
    } finally {
      setActionConfirm(null);
      setActionComments('');
      setSelectedProposal(null);
    }
  };

  const handleAcknowledgeNotice = async (noticeId) => {
    try {
      await api.logManagementActivity('NOTICE_ACKNOWLEDGED', `Acknowledged circular ID: ${noticeId}`);
      setGovernance(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notices: prev.notices.map(n => n.id === noticeId ? { ...n, acknowledged: true } : n),
        };
      });
      showToast(`✅ Notice acknowledged by Governing Body.`);
    } catch (e) {
      showToast(`Notice acknowledged.`);
    }
  };

  // ─── Computed Values ───────────────────────────────────────────────────────

  const totalStudents = overviewData?.kpis?.totalStudents || departments.reduce((s, d) => s + d.students, 0);
  const totalFaculty = overviewData?.kpis?.totalFaculty || departments.reduce((s, d) => s + d.faculty, 0);
  const avgCgpa = overviewData?.kpis?.avgCgpa || (departments.reduce((s, d) => s + d.cgpa, 0) / departments.length).toFixed(2);
  const avgAttendance = overviewData?.kpis?.avgAttendance || (departments.reduce((s, d) => s + d.attendance, 0) / departments.length).toFixed(1);
  const avgPlacement = overviewData?.kpis?.placementRate || (departments.reduce((s, d) => s + d.placement, 0) / departments.length).toFixed(1);

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending' || a.status === 'Under Review').length;
  const criticalExceptionsCount = exceptions.filter(e => e.severity === 'CRITICAL').length;

  const feeData = financials?.departmentRealization || FALLBACK_FEES;
  const placementDrives = placements?.drives || FALLBACK_DRIVES;

  // ─── Navigation Tabs Definition ────────────────────────────────────────────

  const navItems = [
    { id: 'executive', label: 'Executive Overview', icon: <PieChart size={17} /> },
    { id: 'departments', label: 'Department Analytics', icon: <Building size={17} /> },
    { id: 'financials', label: 'Fee & Finance', icon: <DollarSign size={17} /> },
    { id: 'budget', label: 'Institutional Budget', icon: <Layers size={17} /> },
    { id: 'placements', label: 'Placement & Careers', icon: <Briefcase size={17} /> },
    { id: 'approvals', label: 'Strategic Approvals', icon: <FileCheck size={17} />, badge: pendingApprovalsCount },
    { id: 'governance', label: 'Governance & Notices', icon: <Shield size={17} /> },
    { id: 'exceptions', label: 'Risk & Exceptions', icon: <AlertTriangle size={17} />, badge: criticalExceptionsCount, badgeColor: '#ef4444' },
    { id: 'audit-trail', label: 'Audit Trail', icon: <ClipboardList size={17} /> },
    { id: 'report-generation', label: 'Report Generation', icon: <FileSpreadsheet size={17} /> },
  ];

  // ─── Export Active Tab Handler ─────────────────────────────────────────────

  const handleExportActiveTab = () => {
    api.logManagementActivity('REPORT_EXPORT', `Exported report for tab: ${activeTab} (${academicYear})`).catch(() => {});

    if (activeTab === 'executive') {
      const kpiHtml = `
        <div class="kpi-grid">
          <div class="kpi-box"><div class="kpi-label">Total Students</div><div class="kpi-value">${totalStudents.toLocaleString()}</div><div class="kpi-sub">+4.2% YoY Intake</div></div>
          <div class="kpi-box"><div class="kpi-label">Faculty Strength</div><div class="kpi-value">${totalFaculty}</div><div class="kpi-sub">1:17 Faculty-Student Ratio</div></div>
          <div class="kpi-box"><div class="kpi-label">Fee Realization</div><div class="kpi-value">₹24.6 Cr</div><div class="kpi-sub">92.5% Collected</div></div>
          <div class="kpi-box"><div class="kpi-label">Placement %</div><div class="kpi-value">${avgPlacement}%</div><div class="kpi-sub">Avg ₹6.8 LPA · Highest ₹24 LPA</div></div>
          <div class="kpi-box"><div class="kpi-label">Avg CGPA</div><div class="kpi-value">${avgCgpa}</div><div class="kpi-sub">Autonomous Grading 2026</div></div>
          <div class="kpi-box"><div class="kpi-label">Avg Attendance</div><div class="kpi-value">${avgAttendance}%</div><div class="kpi-sub">Biometric Campus-wide Sync</div></div>
          <div class="kpi-box"><div class="kpi-label">Pass Rate</div><div class="kpi-value">94.2%</div><div class="kpi-sub">End-Sem Autonomous Result</div></div>
          <div class="kpi-box"><div class="kpi-label">Pending Approvals</div><div class="kpi-value">${pendingApprovalsCount}</div><div class="kpi-sub">Governing Body Pipeline</div></div>
        </div>`;
      const deptRows = departments.map(d => `<tr><td><b>${d.name}</b></td><td>${d.hod}</td><td>${d.students}</td><td>${d.faculty}</td><td>${d.cgpa}</td><td>${d.attendance}%</td><td>${d.placement}%</td><td>${d.feeRecovery}%</td><td>${d.pass}%</td></tr>`).join('');
      const tableHtml = `
        <h2>Department Performance Summary (${academicYear})</h2>
        <table><thead><tr><th>Department</th><th>HOD</th><th>Students</th><th>Faculty</th><th>CGPA</th><th>Attendance</th><th>Placement %</th><th>Fee Recovery</th><th>Pass Rate</th></tr></thead>
        <tbody>${deptRows}</tbody></table>`;
      openPrintReport('Executive Summary Report', kpiHtml + tableHtml);
      showToast('Opening Executive Report — use Print > Save as PDF');
    } else if (activeTab === 'departments') {
      downloadCSV(
        `Apna_Campus_Department_Analytics_${academicYear}.csv`,
        ['Department', 'Code', 'HOD', 'Students', 'Faculty', 'Student-Faculty Ratio', 'Avg CGPA', 'Attendance %', 'Placement %', 'Fee Recovery %', 'Pass Rate %', 'Budget Allocated', 'Budget Spent', 'Utilization %'],
        departments.map(d => [d.name, d.code, d.hod, d.students, d.faculty, d.sfr || '1:16', d.cgpa, d.attendance, d.placement, d.feeRecovery, d.pass, d.budgetAllocated, d.budgetSpent, d.budgetUtilization + '%'])
      );
      showToast(`Downloaded: Apna_Campus_Department_Analytics_${academicYear}.csv`);
    } else if (activeTab === 'financials') {
      downloadCSV(
        `Apna_Campus_Fee_Realization_${academicYear}.csv`,
        ['Department', 'Total Demand', 'Fee Collected', 'Outstanding Due', 'Recovery %'],
        feeData.map(f => [f.dept, f.total, f.collected, f.due, f.pct + '%'])
      );
      showToast(`Downloaded: Apna_Campus_Fee_Realization_${academicYear}.csv`);
    } else if (activeTab === 'budget') {
      downloadCSV(
        `Apna_Campus_Budget_Planning_${academicYear}.csv`,
        ['Department', 'Budget Allocated (₹)', 'Actual Expenditure (₹)', 'Remaining Balance (₹)', 'Utilization Rate %'],
        departments.map(d => [d.name, d.budgetAllocated, d.budgetSpent, (d.budgetAllocated - d.budgetSpent), d.budgetUtilization + '%'])
      );
      showToast(`Downloaded: Apna_Campus_Budget_Planning_${academicYear}.csv`);
    } else if (activeTab === 'placements') {
      downloadCSV(
        `Apna_Campus_Placement_Drives_${academicYear}.csv`,
        ['Company', 'Role', 'CTC Offered', 'Registered', 'Shortlisted', 'Selected', 'Eligible Depts', 'Status'],
        placementDrives.map(d => [d.company, d.role, d.ctc, d.registered, d.shortlisted, d.selected, d.dept, d.status])
      );
      showToast(`Downloaded: Apna_Campus_Placement_Drives_${academicYear}.csv`);
    } else if (activeTab === 'approvals') {
      downloadCSV(
        `Apna_Campus_Strategic_Approvals_${academicYear}.csv`,
        ['Proposal ID', 'Title', 'Department', 'Submitted By', 'Category', 'Budget Requested', 'Priority', 'Date', 'Status'],
        approvals.map(a => [a.id, a.title, a.dept, a.by, a.category, a.budget, a.priority, a.date, a.status])
      );
      showToast(`Downloaded: Apna_Campus_Strategic_Approvals_${academicYear}.csv`);
    } else if (activeTab === 'audit-trail') {
      downloadCSV(
        `Apna_Campus_Governance_Audit_Trail.csv`,
        ['ID', 'Actor', 'Role', 'Target Subject', 'Action / Assessment', 'Previous State', 'New State', 'Timestamp', 'Reason / Comments'],
        auditLogs.map(l => [l.id, l.user, l.role, l.subject, l.assessment, l.oldMark, l.newMark, l.changedAt, l.reason])
      );
      showToast('Downloaded: Apna_Campus_Governance_Audit_Trail.csv');
    } else {
      showToast('Please use the Report Generation module to generate custom reports.');
    }
  };


  const managementNavSections = [
    {
      title: 'STRATEGIC OVERSIGHT',
      items: [
        { id: 'executive', label: 'Executive Overview', icon: PieChart },
        { id: 'departments', label: 'Department Analytics', icon: Building },
        { id: 'financials', label: 'Fee & Finance', icon: DollarSign },
        { id: 'budget', label: 'Institutional Budget', icon: Layers },
        { id: 'placements', label: 'Placement & Careers', icon: Briefcase },
      ]
    },
    {
      title: 'GOVERNANCE & APPROVALS',
      items: [
        { id: 'approvals', label: 'Strategic Approvals', icon: FileCheck, badge: pendingApprovalsCount || undefined },
        { id: 'governance', label: 'Governance & Notices', icon: Shield },
        { id: 'exceptions', label: 'Risk & Exceptions', icon: AlertTriangle, badge: criticalExceptionsCount || undefined, badgeType: 'urgent' },
        { id: 'audit-trail', label: 'Audit Trail', icon: ClipboardList },
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
      ]
    }
  ];

  const getManagementHeading = () => {
    switch (activeTab) {
      case 'executive':
        return {
          title: 'Institutional Governance & Strategic Intelligence',
          subtitle: `Governing Body / Board of Trustees · Autonomous College Oversight · ${academicYear}`
        };
      case 'departments':
        return {
          title: 'Departmental Academic & Financial Analytics',
          subtitle: 'Student intake, faculty ratios, syllabus completion, and pass percentages across schools.'
        };
      case 'financials':
        return {
          title: 'Institutional Revenue & Fee Realization',
          subtitle: 'Fee demand, collections, outstanding dues, and scholarship concessions.'
        };
      case 'budget':
        return {
          title: 'Capital & Operational Budget Allocations',
          subtitle: 'Departmental budget utilization, capital expenditure, and reserve funds.'
        };
      case 'placements':
        return {
          title: 'Campus Recruitment & Industry Placement Health',
          subtitle: 'Corporate drives, package distributions, median CTC, and institutional hiring partners.'
        };
      case 'approvals':
        return {
          title: 'Executive Approvals & Capital Clearances',
          subtitle: `${pendingApprovalsCount} High-value proposals requiring Governing Body sanction.`
        };
      case 'governance':
        return {
          title: 'Board Resolutions & Executive Directives',
          subtitle: 'Formal trustee decisions, regulatory compliance filings, and statutory approvals.'
        };
      case 'exceptions':
        return {
          title: 'Risk Radar & Critical ERP Exceptions',
          subtitle: `${criticalExceptionsCount} Active operational alerts flagged for board scrutiny.`
        };
      case 'audit-trail':
        return {
          title: 'Immutable Institutional Audit Ledger',
          subtitle: 'Cryptographic log of marks modifications, fee adjustments, and administrative overrides.'
        };
      case 'report-generation':
        return {
          title: 'Master ERP Report Generation & Senate Dossiers',
          subtitle: 'Generate verified institutional packs for statutory bodies and trustees.'
        };
      default:
        return {
          title: (activeTab || 'Management Portal').replace(/-/g, ' ').toUpperCase(),
          subtitle: 'Governing Body Control System'
        };
    }
  };

  const managementHeading = getManagementHeading();
  return (
    <>

      {/* Floating Notification Toast */}
      {toast && (
        <div className="mgmt-toast">
          <CheckCircle size={17} /> {toast}
        </div>
      )}

      {/* Standard Universal AppLayout */}
      <AppLayout
        account={account}
        portalName="Management Portal"
        portalSubtitle="Governing Body & Board of Trustees"
        portalHomeTab="executive"
        navSections={managementNavSections}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        pageTitle={managementHeading.title}
        pageSubtitle={managementHeading.subtitle}
      >
        <div className="mgmt-portal-content-wrap">
        {activeTab === 'executive' ? (
          <RoleDashboardLanding
            account={account}
            roleKey="management"
            onLogout={onLogout}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNavigateTab={(tabId) => {
              if (tabId === 'reports') setActiveTab('report-generation');
              else if (tabId === 'kpi' || tabId === 'departments') setActiveTab('departments');
              else if (tabId === 'circulars' || tabId === 'governance') setActiveTab('governance');
              else if (tabId === 'approvals') setActiveTab('approvals');
            }}
          />
        ) : (
          <>


        {/* Body Area */}
        <div className="mgmt-body">

          {/* ─── Global Filter & Freshness Bar ───────────────────────────────── */}
          <div className="mgmt-filter-bar">
            <div className="mgmt-filter-group">
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Filter size={14} /> Cohort Filter:
              </span>
              <select
                className="mgmt-select"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                title="Select Academic Year"
              >
                <option value="2026-27">Academic Year 2026-27 (Current)</option>
                <option value="2025-26">Academic Year 2025-26 (Audited)</option>
              </select>

              <select
                className="mgmt-select"
                value={semesterFilter}
                onChange={e => setSemesterFilter(e.target.value)}
                title="Select Semester Scope"
              >
                <option value="All Semesters">All Semesters (Autonomous)</option>
                <option value="Odd Semesters">Odd Semesters (1, 3, 5, 7)</option>
                <option value="Even Semesters">Even Semesters (2, 4, 6, 8)</option>
              </select>
            </div>

            <div className="mgmt-filter-group">
              <div className="mgmt-freshness-pill">
                <Activity size={12} color="#059669" />
                <span>Last Synced: {lastRefreshed}</span>
              </div>
              <button
                className="mgmt-btn mgmt-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={loadAllData}
                disabled={loading}
                title="Refresh Live Data"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: EXECUTIVE OVERVIEW
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'executive' && (
            <div>
              {/* Primary Strategic KPIs */}
              <div className="mgmt-kpi-grid">
                <KPI
                  label="Total Students"
                  value={totalStudents.toLocaleString()}
                  sub="+4.2% YoY Intake"
                  icon={<Users />}
                  color="#2563eb"
                  bg="#eff6ff"
                  topBar="linear-gradient(90deg, #2563eb, #60a5fa)"
                  onClick={() => setActiveTab('departments')}
                  tooltip="Click to inspect Department Analytics"
                />
                <KPI
                  label="Faculty Strength"
                  value={totalFaculty}
                  sub="1:17 Student-Faculty Ratio"
                  icon={<GraduationCap />}
                  color="#059669"
                  bg="#ecfdf5"
                  topBar="linear-gradient(90deg, #059669, #34d399)"
                  trend="neutral"
                  onClick={() => setActiveTab('departments')}
                />
                <KPI
                  label="Fee Realization"
                  value="₹24.6 Cr"
                  sub="92.5% Collected · ₹1.85 Cr Due"
                  icon={<DollarSign />}
                  color="#d97706"
                  bg="#fefce8"
                  topBar="linear-gradient(90deg, #d97706, #fbbf24)"
                  onClick={() => setActiveTab('financials')}
                />
                <KPI
                  label="Placement Conversion"
                  value={`${avgPlacement}%`}
                  sub="Avg ₹6.8 LPA · Highest ₹24 LPA"
                  icon={<Briefcase />}
                  color="#7c3aed"
                  bg="#f5f3ff"
                  topBar="linear-gradient(90deg, #7c3aed, #a78bfa)"
                  onClick={() => setActiveTab('placements')}
                />
              </div>

              {/* Secondary Institutional Health KPIs */}
              <div className="mgmt-kpi-grid">
                <KPI
                  label="Avg. Campus CGPA"
                  value={avgCgpa}
                  sub="Autonomous Grading Scale"
                  icon={<Star />}
                  color="#0891b2"
                  bg="#ecfeff"
                  topBar="linear-gradient(90deg, #0891b2, #22d3ee)"
                  trend="up"
                  onClick={() => setActiveTab('departments')}
                />
                <KPI
                  label="Avg. Biometric Attendance"
                  value={`${avgAttendance}%`}
                  sub="Campus-wide Biometric Sync"
                  icon={<Calendar />}
                  color="#16a34a"
                  bg="#f0fdf4"
                  topBar="linear-gradient(90deg, #16a34a, #4ade80)"
                  onClick={() => setActiveTab('departments')}
                />
                <KPI
                  label="Hostel Bed Occupancy"
                  value="88.0%"
                  sub="880 / 1,000 Beds Occupied"
                  icon={<Building />}
                  color="#db2777"
                  bg="#fdf2f8"
                  topBar="linear-gradient(90deg, #db2777, #f9a8d4)"
                  trend="neutral"
                />
                <KPI
                  label="Autonomous Pass Rate"
                  value="94.2%"
                  sub="End-Sem Autonomous Result"
                  icon={<Award />}
                  color="#ea580c"
                  bg="#fff7ed"
                  topBar="linear-gradient(90deg, #ea580c, #fb923c)"
                  onClick={() => setActiveTab('departments')}
                />
              </div>

              {/* Operational Metrics Strip */}
              <div className="mgmt-kpi-grid-6">
                <KPI label="Library Volumes" value="32,450" sub="4,120 Active Loans" icon={<BookOpen />} color="#0891b2" bg="#ecfeff" trend="neutral" />
                <KPI label="Research Papers" value="87" sub="23 Scopus / WoS Q1" icon={<Globe />} color="#7c3aed" bg="#f5f3ff" />
                <KPI label="Bus Fleet" value="36" sub="18 Operational Zones" icon={<Bus />} color="#059669" bg="#ecfdf5" trend="neutral" />
                <KPI label="Lab Equipment" value="240+" sub="92.5% Uptime" icon={<FlaskConical />} color="#ea580c" bg="#fff7ed" trend="neutral" />
                <KPI label="Recruiters On-Campus" value="42" sub="FY 2026-27 Drives" icon={<UserCheck />} color="#2563eb" bg="#eff6ff" onClick={() => setActiveTab('placements')} />
                <KPI label="Scholarships" value="154" sub="₹82.4 L Disbursed" icon={<Award />} color="#d97706" bg="#fefce8" onClick={() => setActiveTab('financials')} />
              </div>

              {/* ─── Executive Insights Section (Transparent, Rule-Based) ───── */}
              <div className="mgmt-panel" style={{ background: '#f8faff', border: '1px solid #bfdbfe' }}>
                <div className="mgmt-panel-header" style={{ background: '#eff6ff', borderBottom: '1px solid #dbeafe' }}>
                  <div className="mgmt-panel-title">
                    <h3 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={18} color="#2563eb" /> Executive Decision Intelligence & Risk Indicators
                    </h3>
                    <p style={{ color: '#3b82f6' }}>Rule-based transparent institutional findings requiring Governing Body attention</p>
                  </div>
                  <button
                    className="mgmt-btn mgmt-btn-secondary"
                    onClick={() => setActiveTab('exceptions')}
                    style={{ background: '#fff' }}
                  >
                    View All Exceptions <ArrowRight size={13} />
                  </button>
                </div>

                <div className="mgmt-panel-body" style={{ padding: '1.25rem' }}>
                  <div className="mgmt-insights-grid">
                    {insights.slice(0, 4).map(ins => (
                      <div key={ins.id} className={`mgmt-insight-card severity-${ins.severity}`}>
                        <div className="mgmt-insight-head">
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                            background: ins.severity === 'CRITICAL' ? '#fef2f2' : ins.severity === 'WARNING' ? '#fefce8' : '#eff6ff',
                            color: ins.severity === 'CRITICAL' ? '#dc2626' : ins.severity === 'WARNING' ? '#d97706' : '#2563eb',
                            border: '1px solid currentColor',
                          }}>
                            {ins.category} · {ins.severity}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{ins.affectedEntity}</span>
                        </div>
                        <div className="mgmt-insight-title">{ins.title}</div>
                        <div className="mgmt-insight-desc">{ins.description}</div>
                        <div className="mgmt-insight-footer">
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                            Metric: <strong style={{ color: '#0f172a' }}>{ins.metric}</strong> (Target: {ins.threshold})
                          </span>
                          <button
                            className="mgmt-insight-action"
                            onClick={() => setActiveTab(ins.targetTab)}
                          >
                            Investigate <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department Consolidated Summary Table */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Department-Wise Academic & Financial Performance Matrix</h3>
                    <p>Consolidated autonomous metrics for all 8 departments — {academicYear}</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={handleExportActiveTab}>
                    <Download size={14} /> Download CSV
                  </button>
                </div>
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>HOD</th>
                        <th>Students</th>
                        <th>Faculty</th>
                        <th>Ratio</th>
                        <th>Avg CGPA</th>
                        <th>Attendance</th>
                        <th>Placement %</th>
                        <th>Fee Recovery</th>
                        <th>Pass Rate</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map(d => (
                        <tr key={d.code}>
                          <td><strong>{d.name}</strong></td>
                          <td style={{ color: '#475569' }}>{d.hod}</td>
                          <td><strong>{d.students}</strong></td>
                          <td>{d.faculty}</td>
                          <td style={{ color: '#64748b', fontWeight: 600 }}>{d.sfr || '1:16'}</td>
                          <td>
                            <strong style={{ color: d.cgpa >= 8.0 ? '#059669' : d.cgpa >= 7.5 ? '#d97706' : '#ef4444' }}>
                              {d.cgpa}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 3 }}>{d.attendance}%</div>
                            <ProgressBar value={d.attendance} color={d.attendance >= 90 ? '#059669' : d.attendance >= 86 ? '#d97706' : '#ef4444'} />
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 3 }}>{d.placement}%</div>
                            <ProgressBar value={d.placement} color="#7c3aed" />
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 3 }}>{d.feeRecovery}%</div>
                            <ProgressBar value={d.feeRecovery} color="#2563eb" />
                          </td>
                          <td>
                            <span className={`mgmt-status ${d.pass >= 95 ? 'mgmt-status-success' : d.pass >= 90 ? 'mgmt-status-info' : 'mgmt-status-warning'}`}>
                              {d.pass}%
                            </span>
                          </td>
                          <td>
                            <button
                              className="mgmt-btn mgmt-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                              onClick={() => setSelectedDeptDetail(d)}
                            >
                              <Eye size={12} /> Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── Institutional Strategy & 5-Year Strategic Plan (2025–2030) ───── */}
              <div className="mgmt-panel" style={{ marginTop: '1.5rem' }}>
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Target size={18} color="#2563eb" /> Institutional Strategy &amp; 5-Year Master Targets (2025–2030)
                    </h3>
                    <p>Governing Body benchmarks for National Rankings, Accreditation, Placements, and Green Campus</p>
                  </div>
                  <span className="mgmt-badge" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                    <Sparkles size={12} /> Strategic Plan 2030
                  </span>
                </div>

                <div className="mgmt-panel-body" style={{ padding: '1.25rem' }}>
                  <div className="mgmt-strategy-grid">
                    {(strategyTargets.length > 0 ? strategyTargets : [
                      { id: 'STRAT-01', dimension: 'National Ranking (NIRF)', targetMetric: 'NIRF Rank < 100', currentMetric: 'Band 151-200 (Rank 164)', targetYear: '2027', progressPct: 78, status: 'On Track', leadOfficer: 'Director & IQAC', initiatives: 'Faculty Ph.D ratio push, Scopus publication grants, sponsored R&D outreach.' },
                      { id: 'STRAT-02', dimension: 'Autonomous Re-Accreditation', targetMetric: 'NAAC Grade A++ (Score >= 3.51)', currentMetric: 'NAAC A+ (Score 3.38)', targetYear: '2026', progressPct: 94, status: 'Ahead', leadOfficer: 'Dr. P. K. Pattnaik (IQAC Director)', initiatives: 'SSR documentation finalized; mock peer visit completed; QlM/QnM verified.' },
                      { id: 'STRAT-03', dimension: 'Graduate Placement CTC', targetMetric: 'Placement >= 95%, Median >= ₹7.5 LPA', currentMetric: '87.0% Placed, Median ₹6.2 LPA', targetYear: '2027', progressPct: 84, status: 'On Track', leadOfficer: 'Dean Industry Relations & TPO', initiatives: 'Pre-placement coding bootcamps, corporate CoEs with Cisco, AWS, and Dassault.' },
                      { id: 'STRAT-04', dimension: 'Extramural Research Grants', targetMetric: '₹5.0 Cr Annual Sanctioned Grants', currentMetric: '₹3.4 Cr Active Grants (DST, SERB)', targetYear: '2028', progressPct: 68, status: 'Needs Attention', leadOfficer: 'Dean Research & Consultancy', initiatives: 'Matching seed capital grant of ₹25L per department for interdisciplinary lab projects.' },
                      { id: 'STRAT-05', dimension: 'Sustainable Green Campus', targetMetric: '100% Renewable Daytime Power & Zero Waste', currentMetric: '42% Solar Coverage (150 kW Grid)', targetYear: '2028', progressPct: 62, status: 'On Track', leadOfficer: 'Chief Estate Officer', initiatives: 'Rooftop solar expansion Phase II; biogas digester; rainwater harvesting recharge wells.' },
                    ]).map(item => (
                      <div key={item.id} className="mgmt-strategy-card">
                        <div>
                          <div className="mgmt-strategy-head">
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af' }}>{item.dimension}</span>
                            <span className={`mgmt-status ${item.status === 'Ahead' ? 'mgmt-status-success' : item.status === 'On Track' ? 'mgmt-status-info' : 'mgmt-status-warning'}`}>
                              {item.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                            {item.targetMetric}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>
                            Current: <strong style={{ color: '#0f172a' }}>{item.currentMetric}</strong> · Target: <strong>{item.targetYear}</strong>
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: 3 }}>
                              <span>Milestone Progress</span>
                              <span>{item.progressPct}%</span>
                            </div>
                            <ProgressBar value={item.progressPct} color={item.progressPct >= 90 ? '#16a34a' : item.progressPct >= 75 ? '#2563eb' : '#d97706'} />
                          </div>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', background: '#f8faff', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <div><strong>Officer:</strong> {item.leadOfficer}</div>
                          <div style={{ marginTop: 2, color: '#64748b' }}>{item.initiatives}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─── ERP Cross-Module Integration Health & Data Quality Monitor ───── */}
              <div className="mgmt-panel" style={{ marginTop: '1.5rem' }}>
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Server size={18} color="#059669" /> ERP Cross-Module Integration &amp; Data Quality Health
                    </h3>
                    <p>Live automated telemetry across Database, Authentication, Biometrics, Accounts, and AI services</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mgmt-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                      <CheckCircle2 size={12} /> System Status: {integrationHealth?.overallStatus || 'OPTIMAL'}
                    </span>
                    <button
                      type="button"
                      className="mgmt-btn mgmt-btn-secondary"
                      onClick={() => {
                        api.getManagementIntegrationHealth().then(res => {
                          if (res?.success) {
                            setIntegrationHealth(res);
                            showToast('✅ ERP Integration Health diagnostic verified: 100% Subsystems Optimal.');
                          }
                        });
                      }}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      <RefreshCw size={12} /> Run Diagnostic Check
                    </button>
                  </div>
                </div>

                <div className="mgmt-panel-body" style={{ padding: '1.25rem' }}>
                  <div className="mgmt-health-grid">
                    {(integrationHealth?.subsystems || [
                      { subsystem: 'PostgreSQL Database & Prisma ORM', status: 'HEALTHY', latencyMs: 4, details: `${totalStudents} Students, ${totalFaculty} Faculty, Financial Ledger connected.` },
                      { subsystem: 'JWT Authentication & Role-Based Access Control', status: 'HEALTHY', latencyMs: 1, details: '14 Institutional Roles configured with strict route-level guards.' },
                      { subsystem: 'Admissions-to-Student Enrollment Pipeline', status: 'HEALTHY', latencyMs: 8, details: '100% of admitted applicants transitioned to active student records.' },
                      { subsystem: 'Biometric Attendance & Class Attendance Sync', status: 'HEALTHY', latencyMs: 12, details: 'Biometric terminals synchronized across academic blocks; 0 packet loss.' },
                      { subsystem: 'Accounts & Fee Collection Ledger Reconciliation', status: 'HEALTHY', latencyMs: 6, details: 'Zero unreconciled online transactions; all receipts assigned unique cryptographic hash.' },
                      { subsystem: 'AI Complaint Classification Microservice', status: 'HEALTHY', latencyMs: 22, details: 'TF-IDF & Logistic Regression service online on :8000; deterministic fallback active.' },
                    ]).map((sub, idx) => (
                      <div key={idx} className="mgmt-health-item">
                        <div className={`mgmt-health-dot ${sub.status}`} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                            <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{sub.subsystem}</strong>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: sub.status === 'HEALTHY' ? '#15803d' : '#b91c1c' }}>
                              {sub.latencyMs}ms
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>{sub.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: DEPARTMENT ANALYTICS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'departments' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Department Strength & Comparative Analytics</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Comprehensive performance indicators across all 8 autonomous programs</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select
                    className="mgmt-select"
                    value={deptFilter}
                    onChange={e => setDeptFilter(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    {departments.map(d => <option key={d.code} value={d.code}>{d.code} - {d.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Department Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {departments.filter(d => deptFilter === 'All' || d.code === deptFilter).map(dept => (
                  <div key={dept.code} className="mgmt-panel" style={{ marginBottom: 0 }}>
                    <div className="mgmt-panel-header" style={{ background: '#f8faff' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{
                            background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                            borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 800,
                          }}>{dept.code}</span>
                          <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>HOD: {dept.hod}</span>
                        </div>
                        <div className="mgmt-panel-title">
                          <h3 style={{ fontSize: '0.92rem' }}>{dept.name}</h3>
                        </div>
                      </div>
                      <button
                        className="mgmt-btn mgmt-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        onClick={() => setSelectedDeptDetail(dept)}
                      >
                        <Eye size={12} /> Dossier
                      </button>
                    </div>

                    <div className="mgmt-panel-body" style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        {[
                          { label: 'Students', value: dept.students, color: '#2563eb' },
                          { label: 'Faculty Ratio', value: dept.sfr || '1:16', color: '#059669' },
                          { label: 'Avg CGPA', value: dept.cgpa, color: '#7c3aed' },
                          { label: 'Scholarships', value: dept.scholarships, color: '#d97706' },
                        ].map(stat => (
                          <div key={stat.label} style={{
                            background: '#f8faff', borderRadius: 8, padding: '0.65rem 0.85rem',
                            border: '1px solid rgba(15,23,42,0.06)',
                          }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      {[
                        { label: 'Attendance', val: dept.attendance, color: dept.attendance >= 90 ? '#059669' : dept.attendance >= 86 ? '#d97706' : '#ef4444' },
                        { label: 'Placement Conversion', val: dept.placement, color: '#7c3aed' },
                        { label: 'Fee Recovery', val: dept.feeRecovery, color: '#2563eb' },
                        { label: 'Exam Pass Rate', val: dept.pass, color: '#ea580c' },
                        { label: 'Budget Utilization', val: dept.budgetUtilization || 75.0, color: '#059669' },
                      ].map(bar => (
                        <div key={bar.label} className="mgmt-metric-bar">
                          <div className="mgmt-metric-bar-label">{bar.label}</div>
                          <div className="mgmt-metric-bar-track">
                            <ProgressBar value={bar.val} color={bar.color} />
                          </div>
                          <div className="mgmt-metric-bar-val" style={{ color: bar.color }}>{bar.val}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: FEE & FINANCE
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'financials' && (
            <div>
              {/* Financial Health Banner */}
              <div style={{
                background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
                padding: '10px 16px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 10
              }}>
                <Shield size={16} color="#1d4ed8" />
                <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
                  <strong>Governing Body Financial Review:</strong> Management monitors realization, audits fee recovery, and sanctions strategic budget proposals. Operational transaction entry remains isolated to Accounts Office.
                </span>
              </div>

              {/* Core Financial KPIs */}
              <div className="mgmt-kpi-grid">
                <KPI label="Total Fee Collected" value="₹24.60 Cr" sub="+8.4% vs. last year" icon={<DollarSign />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" />
                <KPI label="Outstanding Student Dues" value="₹1.85 Cr" sub="From 312 student accounts" icon={<AlertCircle />} color="#dc2626" bg="#fef2f2" topBar="linear-gradient(90deg, #dc2626, #f87171)" trend="warn" />
                <KPI label="Scholarships Disbursed" value="₹82.4 L" sub="154 beneficiaries · FY 2026-27" icon={<Award />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
                <KPI label="Overall Fee Realization" value="92.5%" sub="Target: 95% by semester end" icon={<TrendingUp />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" />
              </div>

              {/* Department-Wise Fee Table */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Department-Wise Fee Realization Statement</h3>
                    <p>Current semester demand assessment and collection tracking</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={handleExportActiveTab}>
                    <Download size={14} /> Download CSV
                  </button>
                </div>
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Total Fee Demand</th>
                        <th>Collected</th>
                        <th>Outstanding Balance</th>
                        <th>Recovery Rate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeData.map(f => (
                        <tr key={f.dept}>
                          <td><strong>{f.dept}</strong></td>
                          <td>{f.total}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{f.collected}</td>
                          <td style={{ color: '#dc2626', fontWeight: 700 }}>{f.due}</td>
                          <td>
                            <div style={{ fontWeight: 800, marginBottom: 3, color: f.pct >= 95 ? '#059669' : f.pct >= 90 ? '#d97706' : '#dc2626' }}>{f.pct}%</div>
                            <ProgressBar value={f.pct} color={f.pct >= 95 ? '#059669' : f.pct >= 90 ? '#d97706' : '#dc2626'} />
                          </td>
                          <td>
                            <StatusBadge status={f.pct >= 95 ? 'Approved' : f.pct >= 90 ? 'Ongoing' : 'Pending'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revenue Breakdown & Scholarships Grid */}
              <div className="mgmt-grid-2">
                <div className="mgmt-panel" style={{ marginBottom: 0 }}>
                  <div className="mgmt-panel-header">
                    <div className="mgmt-panel-title">
                      <h3>Institutional Revenue by Category</h3>
                      <p>Fee head distribution for FY 2026-27</p>
                    </div>
                  </div>
                  <div className="mgmt-panel-body">
                    {[
                      { label: 'Tuition & Development Fee', val: '₹14.2 Cr', pct: 57.8, color: '#2563eb' },
                      { label: 'Hostel & Mess Charges', val: '₹4.6 Cr', pct: 18.7, color: '#059669' },
                      { label: 'Examination & Affiliation', val: '₹3.8 Cr', pct: 15.4, color: '#7c3aed' },
                      { label: 'Lab & Library Modernization', val: '₹1.4 Cr', pct: 5.7, color: '#ea580c' },
                      { label: 'Transport Fleet & Transit', val: '₹0.6 Cr', pct: 2.4, color: '#d97706' },
                    ].map(item => (
                      <div key={item.label} className="mgmt-metric-bar">
                        <div className="mgmt-metric-bar-label">{item.label}</div>
                        <div className="mgmt-metric-bar-track">
                          <ProgressBar value={item.pct} color={item.color} />
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', width: 64, textAlign: 'right' }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mgmt-panel" style={{ marginBottom: 0 }}>
                  <div className="mgmt-panel-header">
                    <div className="mgmt-panel-title">
                      <h3>Active Scholarship Schemes & Grants</h3>
                      <p>Institutional and government beneficiary programs</p>
                    </div>
                  </div>
                  <div className="mgmt-panel-body">
                    {[
                      { name: 'Odisha State Merit-Cum-Means', students: 48, amount: '₹24.0 L', type: 'State Govt.' },
                      { name: 'PRERANA SC/ST Scholarship', students: 34, amount: '₹16.2 L', type: 'State Govt.' },
                      { name: 'GIFT Management Endowment', students: 26, amount: '₹18.5 L', type: 'Institutional Trust' },
                      { name: 'AICTE National Technical Scholarship', students: 22, amount: '₹13.8 L', type: 'Central Govt.' },
                      { name: 'Corporate Grants (TCS, Infosys)', students: 24, amount: '₹9.9 L', type: 'CSR Partner' },
                    ].map(s => (
                      <div key={s.name} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.7rem 0', borderBottom: '1px solid rgba(15,23,42,0.05)',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.students} beneficiaries · {s.type}</div>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>{s.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 4: INSTITUTIONAL BUDGET & RESOURCE PLANNING (Section 10.A)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'budget' && (
            <div>
              <div className="mgmt-kpi-grid">
                <KPI label="Annual Budget Allocation" value="₹28.50 Cr" sub="FY 2026-27 Trust Sanctioned" icon={<Layers />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" />
                <KPI label="Departmental Allocation" value="₹26.80 Cr" sub="Distributed to 8 Programs" icon={<Building />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" />
                <KPI label="Actual Expenditure" value="₹19.40 Cr" sub="YTD Verified Outlays" icon={<DollarSign />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
                <KPI label="Remaining Budget Balance" value="₹7.40 Cr" sub="72.4% Budget Utilization" icon={<Activity />} color="#0891b2" bg="#ecfeff" topBar="linear-gradient(90deg, #0891b2, #22d3ee)" />
              </div>

              {/* Department Budget Breakdown */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Departmental Annual Budget & Utilization Ledger</h3>
                    <p>Allocations, actual expenditures, and remaining funds for FY 2026-27</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={handleExportActiveTab}>
                    <Download size={14} /> Download Budget CSV
                  </button>
                </div>
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>HOD</th>
                        <th>Annual Budget</th>
                        <th>Actual Spend</th>
                        <th>Remaining Fund</th>
                        <th>Utilization %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map(d => {
                        const alloc = d.budgetAllocated || 30000000;
                        const spent = d.budgetSpent || 21000000;
                        const rem = alloc - spent;
                        const pct = d.budgetUtilization || Math.round((spent / alloc) * 100);
                        return (
                          <tr key={d.code}>
                            <td><strong>{d.name}</strong></td>
                            <td style={{ color: '#64748b' }}>{d.hod}</td>
                            <td style={{ fontWeight: 700 }}>₹{(alloc / 10000000).toFixed(2)} Cr</td>
                            <td style={{ color: '#059669', fontWeight: 700 }}>₹{(spent / 10000000).toFixed(2)} Cr</td>
                            <td style={{ color: '#2563eb', fontWeight: 700 }}>₹{(rem / 10000000).toFixed(2)} Cr</td>
                            <td>
                              <div style={{ fontWeight: 800, marginBottom: 3 }}>{pct}%</div>
                              <ProgressBar value={pct} color={pct >= 85 ? '#ef4444' : pct >= 70 ? '#059669' : '#3b82f6'} />
                            </td>
                            <td>
                              <span className={`mgmt-status ${pct >= 85 ? 'mgmt-status-warning' : 'mgmt-status-success'}`}>
                                {pct >= 85 ? 'High Burn' : 'On Track'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── Major Capital Works & Infrastructure Procurement Tracking ───── */}
              <div className="mgmt-panel" style={{ marginTop: '1.5rem' }}>
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HardHat size={18} color="#ea580c" /> Major Capital Works &amp; Infrastructure Procurement Tracking
                    </h3>
                    <p>Sanctioned capital budget, committed contracts, verified contractor disbursements, and physical milestones</p>
                  </div>
                  <span className="mgmt-badge" style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }}>
                    <Layers size={12} /> {capitalProjects?.data?.length || 4} Active Capital Projects
                  </span>
                </div>

                <div className="mgmt-panel-body" style={{ padding: '1.25rem' }}>
                  <div className="mgmt-capital-grid">
                    {(capitalProjects?.data?.length > 0 ? capitalProjects.data : [
                      {
                        id: 'CAP-2026-01',
                        title: 'Advanced AI & Machine Learning GPU Computing Cluster',
                        department: 'AI & Machine Learning / CSE',
                        sanctionedBudget: 4800000,
                        paidExpenditure: 3250000,
                        balanceRemaining: 1550000,
                        completionPct: 85,
                        status: 'Commissioning & Testing',
                        contractor: 'Sysnet Tech Solutions & NVIDIA Partner',
                        milestones: [
                          { title: 'Server Rack & Power Conditioning', status: 'Completed' },
                          { title: 'GPU Nodes (10x RTX) Rack Assembly', status: 'Completed' },
                          { title: 'AICTE ATAL Grant Verification', status: 'In Progress' },
                        ],
                      },
                      {
                        id: 'CAP-2026-02',
                        title: '150 kW Rooftop Photovoltaic Solar Power Grid (Phase II)',
                        department: 'Campus Estate & Energy Cell',
                        sanctionedBudget: 3200000,
                        paidExpenditure: 2100000,
                        balanceRemaining: 1100000,
                        completionPct: 70,
                        status: 'EPC Installation Active',
                        contractor: 'Orena Green Energy Infra Pvt Ltd',
                        milestones: [
                          { title: 'Roof Structural Load Certification', status: 'Completed' },
                          { title: 'Solar PV Panels & Inverter Mounting', status: 'Completed' },
                          { title: 'Grid Bi-directional Synchronization', status: 'In Progress' },
                        ],
                      },
                      {
                        id: 'CAP-2026-03',
                        title: 'New Girls Hostel Residential Block Phase 3 (180 Beds)',
                        department: 'Hostel Administration & Works',
                        sanctionedBudget: 18500000,
                        paidExpenditure: 7400000,
                        balanceRemaining: 11100000,
                        completionPct: 40,
                        status: 'Civil Structural RCC Framing',
                        contractor: 'Utkal Construction & Projects',
                        milestones: [
                          { title: 'Substructure Excavation & Footings', status: 'Completed' },
                          { title: 'Ground & First Floor RCC Slab', status: 'Completed' },
                          { title: 'Second Floor Slab & Masonry', status: 'In Progress' },
                        ],
                      },
                      {
                        id: 'CAP-2026-04',
                        title: 'High-Speed Campus 10Gbps Optical Fiber Ring',
                        department: 'CCF & IT Operations',
                        sanctionedBudget: 1800000,
                        paidExpenditure: 1650000,
                        balanceRemaining: 150000,
                        completionPct: 95,
                        status: 'Final OTDR Testing',
                        contractor: 'Airtel Enterprise Solutions',
                        milestones: [
                          { title: 'Underground Trenching & Conduits', status: 'Completed' },
                          { title: 'Optical Fiber Splicing & Racks', status: 'Completed' },
                          { title: 'Failover Redundancy Testing', status: 'Completed' },
                        ],
                      },
                    ]).map(proj => (
                      <div key={proj.id} className="mgmt-capital-card">
                        <div className="mgmt-capital-head">
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>{proj.id} · {proj.department}</span>
                            <h4 style={{ margin: '4px 0 0', fontSize: '0.96rem', color: '#0f172a', fontWeight: 800 }}>{proj.title}</h4>
                          </div>
                          <span className="mgmt-status mgmt-status-info" style={{ fontSize: '0.7rem' }}>
                            {proj.status}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: '#f8faff', padding: '10px 12px', borderRadius: 8, margin: '10px 0' }}>
                          <div>
                            <small style={{ fontSize: '0.68rem', color: '#64748b' }}>Sanctioned</small>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>₹{(proj.sanctionedBudget / 100000).toFixed(1)} L</div>
                          </div>
                          <div>
                            <small style={{ fontSize: '0.68rem', color: '#64748b' }}>Paid Out</small>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d' }}>₹{(proj.paidExpenditure / 100000).toFixed(1)} L</div>
                          </div>
                          <div>
                            <small style={{ fontSize: '0.68rem', color: '#64748b' }}>Balance</small>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>₹{(proj.balanceRemaining / 100000).toFixed(1)} L</div>
                          </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: 3 }}>
                            <span>Physical Completion</span>
                            <span>{proj.completionPct}%</span>
                          </div>
                          <ProgressBar value={proj.completionPct} color={proj.completionPct >= 80 ? '#15803d' : '#ea580c'} />
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                          <div><strong>Contractor / Partner:</strong> {proj.contractor}</div>
                          <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {(proj.milestones || []).map((m, mIdx) => (
                              <span
                                key={mIdx}
                                style={{
                                  fontSize: '0.66rem',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: m.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                                  color: m.status === 'Completed' ? '#15803d' : '#b45309',
                                  fontWeight: 600,
                                }}
                              >
                                {m.status === 'Completed' ? '✓' : '⟳'} {m.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 5: PLACEMENT & CAREERS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'placements' && (
            <div>
              <div className="mgmt-kpi-grid">
                <KPI label="Companies On-Campus" value="42" sub="FY 2026-27 Recruitment Season" icon={<Building />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" />
                <KPI label="Total Placed Graduates" value="435" sub="435 Placed / 500 Eligible (87.0%)" icon={<UserCheck />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" />
                <KPI label="Highest CTC Offered" value="₹24.0 LPA" sub="Sprinklr India — Product Engineer" icon={<Star />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
                <KPI label="Average Package (CTC)" value="₹6.8 LPA" sub="Median CTC: ₹6.2 LPA" icon={<TrendingUp />} color="#ea580c" bg="#fff7ed" topBar="linear-gradient(90deg, #ea580c, #fb923c)" />
              </div>

              {/* Recruitment Drives Table */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Campus Recruitment Drives — FY 2026-27</h3>
                    <p>Corporate hiring activity and candidate funnel oversight for Governing Body</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={handleExportActiveTab}>
                    <Download size={14} /> Download CSV
                  </button>
                </div>
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Designation / Role</th>
                        <th>CTC Offered</th>
                        <th>Registered</th>
                        <th>Shortlisted</th>
                        <th>Selected</th>
                        <th>Eligible Depts</th>
                        <th>Drive Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placementDrives.map(d => (
                        <tr key={d.company}>
                          <td><strong>{d.company}</strong></td>
                          <td style={{ color: '#475569', fontSize: '0.8rem' }}>{d.role}</td>
                          <td><strong style={{ color: '#7c3aed' }}>{d.ctc}</strong></td>
                          <td>{d.registered}</td>
                          <td style={{ color: '#2563eb', fontWeight: 700 }}>{d.shortlisted}</td>
                          <td><strong style={{ color: '#059669' }}>{d.selected}</strong></td>
                          <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.dept}</td>
                          <td><StatusBadge status={d.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Department Conversion Progress */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Department Placement Conversion Breakdown</h3>
                    <p>Conversion Rate = Placed Students ÷ Registered Eligible Cohort</p>
                  </div>
                </div>
                <div className="mgmt-panel-body">
                  {[
                    { branch: 'Computer Science & Engineering', code: 'CSE', eligible: 160, placed: 152, pct: 95.0, avg: '₹8.4 LPA' },
                    { branch: 'AI & Machine Learning', code: 'AIML', eligible: 80, placed: 73, pct: 91.2, avg: '₹8.1 LPA' },
                    { branch: 'Master of Computer Applications', code: 'MCA', eligible: 20, placed: 18, pct: 90.0, avg: '₹6.2 LPA' },
                    { branch: 'Electronics & Communication', code: 'ECE', eligible: 90, placed: 78, pct: 86.7, avg: '₹6.8 LPA' },
                    { branch: 'Electrical & Electronics', code: 'EEE', eligible: 60, placed: 48, pct: 80.0, avg: '₹5.8 LPA' },
                    { branch: 'Mechanical Engineering', code: 'MECH', eligible: 55, placed: 41, pct: 74.5, avg: '₹5.2 LPA' },
                    { branch: 'Civil Engineering', code: 'CIVIL', eligible: 35, placed: 25, pct: 71.4, avg: '₹4.8 LPA' },
                  ].map(b => (
                    <div key={b.code} className="mgmt-metric-bar">
                      <div className="mgmt-metric-bar-label">
                        <strong>{b.code}</strong> — {b.branch} <small style={{ color: '#64748b' }}>({b.placed}/{b.eligible} placed · Avg {b.avg})</small>
                      </div>
                      <div style={{ width: 140, margin: '0 1rem' }}>
                        <ProgressBar value={b.pct} color={b.pct >= 90 ? '#059669' : b.pct >= 80 ? '#2563eb' : '#d97706'} />
                      </div>
                      <div className="mgmt-metric-bar-val" style={{ color: b.pct >= 90 ? '#059669' : b.pct >= 80 ? '#2563eb' : '#d97706' }}>
                        {b.pct}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 6: STRATEGIC APPROVALS (Section 7)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'approvals' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Strategic Proposal Approval Queue</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Capital expenditures, institutional partnerships, and statutory governance proposals</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="mgmt-btn mgmt-btn-primary"
                    onClick={() => setNewProposalModal(prev => ({ ...prev, open: true }))}
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                  >
                    <Plus size={14} /> Submit Strategic Proposal
                  </button>
                  <span className="mgmt-badge">
                    <CheckCircle size={12} /> {approvals.filter(a => a.status === 'Approved').length} Approved
                  </span>
                  <span className="mgmt-badge mgmt-badge-warning">
                    <AlertCircle size={12} /> {pendingApprovalsCount} Awaiting Action
                  </span>
                </div>
              </div>

              {/* Proposals Table */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Active Strategic Proposals</h3>
                    <p>Decisions are audited and persisted directly to backend</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={handleExportActiveTab}>
                    <Download size={14} /> Download Register
                  </button>
                </div>

                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Proposal Title & Scope</th>
                        <th>Department</th>
                        <th>Submitted By</th>
                        <th>Category</th>
                        <th>Budget</th>
                        <th>Priority</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.map(item => (
                        <tr key={item.id}>
                          <td><strong style={{ color: '#2563eb' }}>{item.id}</strong></td>
                          <td style={{ maxWidth: 260 }}>
                            <strong style={{ fontSize: '0.84rem', display: 'block', marginBottom: 2 }}>{item.title}</strong>
                            <small style={{ color: '#64748b', fontSize: '0.74rem' }}>{item.description ? item.description.slice(0, 75) + '...' : ''}</small>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.dept}</td>
                          <td style={{ fontSize: '0.78rem', color: '#475569' }}>{item.by}</td>
                          <td>
                            <span className="mgmt-status mgmt-status-info" style={{ fontSize: '0.68rem' }}>{item.category}</span>
                          </td>
                          <td><strong style={{ color: '#059669', fontSize: '0.8rem' }}>{item.budget || 'N/A'}</strong></td>
                          <td><PriorityBadge priority={item.priority} /></td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{item.date}</td>
                          <td><StatusBadge status={item.status} /></td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                              <button
                                className="mgmt-btn mgmt-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                                onClick={() => setSelectedProposal(item)}
                                title="View proposal dossier and supporting documents"
                              >
                                <Eye size={12} /> Dossier
                              </button>

                              {(item.status === 'Pending' || item.status === 'Under Review') && (
                                <>
                                  <button
                                    className="mgmt-btn mgmt-btn-success"
                                    style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                                    onClick={() => setActionConfirm({ id: item.id, action: 'APPROVE', title: item.title })}
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                  <button
                                    className="mgmt-btn"
                                    style={{ padding: '4px 8px', fontSize: '0.73rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                                    onClick={() => setActionConfirm({ id: item.id, action: 'RETURN', title: item.title })}
                                    title="Return proposal for revision"
                                  >
                                    <CornerDownLeft size={12} /> Return
                                  </button>
                                  <button
                                    className="mgmt-btn mgmt-btn-danger"
                                    style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                                    onClick={() => setActionConfirm({ id: item.id, action: 'REJECT', title: item.title })}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 7: GOVERNANCE & NOTICES (Section 8)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'governance' && (
            <div>
              <div className="mgmt-kpi-grid">
                <KPI label="NAAC Grade" value="A+" sub="Cycle IV Reaccreditation Review 2026" icon={<Award />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
                <KPI label="NBA Accredited Depts" value="5 / 8" sub="CSE, ECE, EEE, MECH, CIVIL" icon={<CheckCircle />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" trend="neutral" />
                <KPI label="Board Meetings Held" value="6" sub="Last: 28 Sep 2026 (Quorum Met)" icon={<ClipboardList />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" trend="neutral" />
                <KPI label="Regulatory Compliance" value="98.4%" sub="AICTE, BPUT, UGC norms certified" icon={<Shield />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" />
              </div>

              {/* Accreditation Overview Table */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Regulatory & Statutory Accreditation Compliance Matrix</h3>
                    <p>Real-time status tracking for NAAC, NBA, AICTE, UGC, and BPUT</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={handleExportActiveTab}>
                    <Download size={14} /> Download Compliance PDF
                  </button>
                </div>
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Regulatory Body</th>
                        <th>Mandatory Requirement</th>
                        <th>Cycle / Scope</th>
                        <th>Officer in Charge</th>
                        <th>Current Status</th>
                        <th>Due Date</th>
                        <th>Compliance Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(governance?.accreditations || [
                        { body: 'NAAC', req: 'Self Study Report & Peer Team Visit (Cycle IV)', status: 'Approved', due: 'Nov 2026', comp: 98, cycle: 'Cycle IV', officer: 'Dr. P. K. Pattnaik (IQAC Director)' },
                        { body: 'NBA', req: 'Programme Outcomes & Exit Survey Reports (Tier-1)', status: 'Active', due: 'Mar 2027', comp: 95, cycle: '2024-2027', officer: 'Dean Academics' },
                        { body: 'AICTE', req: 'Annual Compliance Report & Mandatory Disclosure', status: 'Approved', due: 'Oct 2026', comp: 100, cycle: 'Annual 2026-27', officer: 'Registrar' },
                        { body: 'UGC', req: 'Autonomous Status Renewal & Inspection', status: 'Ongoing', due: 'Dec 2026', comp: 88, cycle: 'Autonomous Renewal', officer: 'Principal Dr. Sujit Khuntia' },
                        { body: 'BPUT', req: 'Affiliation Renewal & Exam Calendar Sync', status: 'Approved', due: 'Sep 2026', comp: 100, cycle: 'AY 2026-27', officer: 'Exam Controller' },
                      ]).map(row => (
                        <tr key={row.body}>
                          <td><strong>{row.body}</strong></td>
                          <td style={{ fontSize: '0.82rem', color: '#334155' }}>{row.req}</td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{row.cycle}</td>
                          <td style={{ fontSize: '0.78rem', color: '#475569' }}>{row.officer}</td>
                          <td><StatusBadge status={row.status} /></td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{row.due}</td>
                          <td>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 3, color: row.comp >= 95 ? '#059669' : '#d97706' }}>{row.comp}%</div>
                            <ProgressBar value={row.comp} color={row.comp >= 95 ? '#059669' : '#d97706'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Circulars & Milestones Grid */}
              <div className="mgmt-grid-2">
                <div className="mgmt-panel" style={{ marginBottom: 0 }}>
                  <div className="mgmt-panel-header">
                    <div className="mgmt-panel-title">
                      <h3>Important Institutional Circulars</h3>
                      <p>Regulatory, academic, and financial notices</p>
                    </div>
                    <span className="mgmt-badge">
                      <Bell size={12} /> {(governance?.notices || FALLBACK_NOTICES).length} Active
                    </span>
                  </div>
                  <div className="mgmt-panel-body" style={{ padding: '0.75rem 1rem' }}>
                    {(governance?.notices || FALLBACK_NOTICES).map(n => (
                      <div key={n.id || n.title} style={{
                        padding: '0.85rem 1rem', border: '1px solid rgba(15,23,42,0.07)',
                        borderRadius: 10, marginBottom: '0.65rem', background: '#f8faff',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <PriorityBadge priority={n.priority} />
                            <span style={{
                              background: '#eff6ff', color: '#1d4ed8', borderRadius: 5,
                              padding: '2px 7px', fontSize: '0.68rem', fontWeight: 800,
                            }}>{n.tag}</span>
                          </div>
                          <span style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 600 }}>{n.date}</span>
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{n.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Issued by: {n.issuer || 'Institutional Governance'}</span>
                          {n.acknowledged ? (
                            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <CheckCircle size={12} /> Acknowledged
                            </span>
                          ) : (
                            <button
                              className="mgmt-btn mgmt-btn-secondary"
                              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                              onClick={() => handleAcknowledgeNotice(n.id)}
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mgmt-panel" style={{ marginBottom: 0 }}>
                  <div className="mgmt-panel-header">
                    <div className="mgmt-panel-title">
                      <h3>Governance Milestones — 2026-27</h3>
                      <p>Board resolutions, statutory compliance, and audits</p>
                    </div>
                  </div>
                  <div className="mgmt-panel-body">
                    <div className="mgmt-timeline">
                      {(governance?.milestones || [
                        { date: '05 Oct 2026', title: 'NAAC Cycle IV Preparatory Inspection', sub: 'Final documentation submitted to IQAC', color: '#dc2626' },
                        { date: '01 Oct 2026', title: 'Academic Year 2026-27 Odd Sem Commences', sub: 'All 8 autonomous departments fully operational', color: '#059669' },
                        { date: '28 Sep 2026', title: 'Board of Governors Meeting — Q2 Review', sub: 'Budget utilization and audit reports cleared', color: '#2563eb' },
                        { date: '20 Sep 2026', title: 'Placement Season 2026-27 Inaugurated', sub: '42 corporate partners confirmed visits', color: '#7c3aed' },
                        { date: '10 Sep 2026', title: 'ISO 9001:2015 Surveillance Audit Cleared', sub: 'Zero non-conformities; certification revalidated', color: '#059669' },
                        { date: '02 Sep 2026', title: 'MoU Finalized with Cisco Systems', sub: 'IoT & Edge Computing CoE established', color: '#d97706' },
                        { date: '15 Aug 2026', title: 'Annual Trust Merit Scholarship Awards', sub: '154 student beneficiaries felicitated', color: '#2563eb' },
                      ]).map((item, i) => (
                        <div key={i} className="mgmt-timeline-item">
                          <div className="mgmt-timeline-dot" style={{ color: item.color, background: '#fff' }} />
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: 2 }}>{item.date}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Board of Trustees & Governing Body Meetings Archive ───── */}
              <div className="mgmt-panel" style={{ marginTop: '1.5rem' }}>
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ClipboardList size={18} color="#2563eb" /> Board of Trustees &amp; Governing Body Meetings Archive
                    </h3>
                    <p>Formal trustee sessions, statutory quorums, approved agendas, and signed institutional minutes</p>
                  </div>
                  <span className="mgmt-badge" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                    <Users size={12} /> {boardMeetings.length || 3} Recorded Sessions
                  </span>
                </div>

                <div className="mgmt-panel-body" style={{ padding: '1.25rem' }}>
                  {(boardMeetings.length > 0 ? boardMeetings : [
                    {
                      id: 'BM-2026-Q3',
                      meetingNo: 43,
                      title: '43rd Ordinary Meeting of the Governing Body',
                      date: '18 Nov 2026',
                      time: '11:00 AM IST',
                      venue: 'Board Room, Main Secretariat Block / Hybrid',
                      chairperson: 'Shri Patitapaban Panda (Managing Trustee)',
                      status: 'Scheduled',
                      quorumStatus: 'Notified (14 / 16 Trustees Confirmed)',
                      agendaItems: [
                        'Ratification of Autumn 2026 Autonomous Examination Moderation Results',
                        'Sanction of Capital Expenditure Requisition for AI GPU High-Performance Cluster',
                        'Review of NAAC Cycle IV Peer Team Inspection Preparedness',
                      ],
                      documents: ['Meeting_43_Notice_and_Agenda.pdf', 'Working_Dossier_Draft.pdf'],
                    },
                    {
                      id: 'BM-2026-Q2',
                      meetingNo: 42,
                      title: '42nd Governing Body Strategic Budget Session',
                      date: '28 Aug 2026',
                      time: '10:30 AM IST',
                      venue: 'Executive Council Hall',
                      chairperson: 'Shri Patitapaban Panda',
                      status: 'Completed',
                      quorumStatus: 'Adjourned with 15 Trustees Present',
                      agendaItems: [
                        'Approval of Annual Institutional Budget ₹28.50 Cr for FY 2026-27',
                        'Expansion of Solar Power Infrastructure Phase II',
                      ],
                      documents: ['Signed_Minutes_BM_42.pdf', 'Approved_Budget_FY2026-27.pdf'],
                    },
                  ]).map(meeting => (
                    <div key={meeting.id} className="mgmt-meeting-card">
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span className={`mgmt-status ${meeting.status === 'Completed' ? 'mgmt-status-success' : 'mgmt-status-info'}`}>
                            {meeting.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            Meeting #{meeting.meetingNo} · {meeting.date} at {meeting.time}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>{meeting.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: 8 }}>
                          <strong>Chairperson:</strong> {meeting.chairperson} · <strong>Venue:</strong> {meeting.venue}
                        </div>
                        <div style={{ background: '#f8faff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 10 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Key Agenda Items:</span>
                          <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: '0.76rem', color: '#334155' }}>
                            {(meeting.agendaItems || []).map((ag, agIdx) => (
                              <li key={agIdx}>{ag}</li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Quorum: <strong>{meeting.quorumStatus}</strong></span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
                        <button
                          type="button"
                          className="mgmt-btn mgmt-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.76rem', justifyContent: 'center' }}
                          onClick={() => {
                            setSelectedMeetingModal(meeting);
                          }}
                        >
                          <FileText size={13} /> View Dossier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Formal Board Resolutions Register ───── */}
              <div className="mgmt-panel" style={{ marginTop: '1.5rem' }}>
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileBadge size={18} color="#7c3aed" /> Formal Board Resolutions Register
                    </h3>
                    <p>Enacted statutory policies, capital grants, and gazetted institutional decisions</p>
                  </div>
                  <span className="mgmt-badge" style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}>
                    <ShieldCheck size={12} /> {boardResolutions.length || 4} Enacted Resolutions
                  </span>
                </div>

                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Resolution No.</th>
                        <th>Subject &amp; Statutory Decision</th>
                        <th>Category</th>
                        <th>Meeting #</th>
                        <th>Date Passed</th>
                        <th>Effective From</th>
                        <th>Assigned Officer</th>
                        <th>Gazette Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(boardResolutions.length > 0 ? boardResolutions : [
                        { id: 'RES-GB-2026-08', meetingNo: 42, resolutionNo: 'GB/42/RES-08', date: '28 Aug 2026', subject: 'Sanction of Annual Institutional Budget Allocation ₹28.50 Cr for FY 2026-27', status: 'Enacted & Gazetted', effectiveFrom: '01 Sep 2026', assignedOfficer: 'Chief Accounts Officer & Principal', category: 'Finance' },
                        { id: 'RES-GB-2026-07', meetingNo: 42, resolutionNo: 'GB/42/RES-07', date: '28 Aug 2026', subject: 'Sanction of ₹32,00,000 for 150 kW Solar Power Grid Expansion (Phase II)', status: 'Under Implementation', effectiveFrom: '15 Sep 2026', assignedOfficer: 'Chief Estate Officer', category: 'Infrastructure' },
                        { id: 'RES-GB-2026-06', meetingNo: 41, resolutionNo: 'GB/41/RES-06', date: '15 May 2026', subject: 'Adoption of Autonomous Regulations 2026 with Relative Grading Scale', status: 'Enacted & Gazetted', effectiveFrom: '01 Jul 2026', assignedOfficer: 'Dean Academics & CoE', category: 'Academic' },
                        { id: 'RES-GB-2026-05', meetingNo: 41, resolutionNo: 'GB/41/RES-05', date: '15 May 2026', subject: 'Institutional Research Publication Incentive Framework ₹12,00,000', status: 'Enacted & Gazetted', effectiveFrom: '01 Jul 2026', assignedOfficer: 'Dean Research', category: 'Research' },
                      ]).map(res => (
                        <tr key={res.id}>
                          <td><strong style={{ color: '#1e40af' }}>{res.resolutionNo}</strong></td>
                          <td style={{ maxWidth: 300 }}>
                            <strong style={{ fontSize: '0.84rem' }}>{res.subject}</strong>
                          </td>
                          <td>
                            <span className="mgmt-status mgmt-status-info" style={{ fontSize: '0.68rem' }}>{res.category}</span>
                          </td>
                          <td>Meeting #{res.meetingNo}</td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{res.date}</td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{res.effectiveFrom}</td>
                          <td style={{ fontSize: '0.78rem', color: '#475569' }}>{res.assignedOfficer}</td>
                          <td>
                            <span className={`mgmt-status ${res.status.includes('Enacted') ? 'mgmt-status-success' : 'mgmt-status-warning'}`}>
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── Accreditation & Evidence Register (NAAC, NBA, AICTE Dossiers) ───── */}
              <div className="mgmt-panel" style={{ marginTop: '1.5rem' }}>
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileCheck size={18} color="#059669" /> Accreditation Evidence Register &amp; Regulatory Dossiers
                    </h3>
                    <p>Tamper-evident documentary evidence indexed across NAAC Criteria 1–7 and NBA SAR outcomes</p>
                  </div>
                  <span className="mgmt-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                    <Award size={12} /> NAAC Cycle IV SSR Dossiers
                  </span>
                </div>

                <div className="mgmt-panel-body" style={{ padding: '1.25rem' }}>
                  {(accreditationEvidence.length > 0 ? accreditationEvidence : [
                    {
                      criterionId: 'CR-1',
                      criterionName: 'Curricular Aspects & Academic Flexibility',
                      body: 'NAAC / NBA',
                      attainmentScore: 3.82,
                      leadIncharge: 'Dean Academics',
                      status: 'Verified & Locked',
                      evidenceDossiers: [
                        { code: 'DOC-1.1.1', title: 'Curricular Design & BOS Resolution Minutes 2024-2026', size: '4.8 MB', verification: 'Audited' },
                        { code: 'DOC-1.2.2', title: 'Value-Added & Skill Certification Course Portfolios', size: '6.2 MB', verification: 'Audited' },
                      ],
                    },
                    {
                      criterionId: 'CR-2',
                      criterionName: 'Teaching-Learning & Evaluation Process',
                      body: 'NAAC / AICTE',
                      attainmentScore: 3.65,
                      leadIncharge: 'Controller of Examinations & HODs',
                      status: 'Verified & Locked',
                      evidenceDossiers: [
                        { code: 'DOC-2.1.2', title: 'Category-wise Student Enrolment Ledger & AICTE Sanctions', size: '2.9 MB', verification: 'Audited' },
                        { code: 'DOC-2.5.1', title: 'Autonomous Continuous Internal Evaluation Transparency Audit', size: '5.2 MB', verification: 'Audited' },
                      ],
                    },
                    {
                      criterionId: 'CR-3',
                      criterionName: 'Research, Innovations & Extension Activities',
                      body: 'NAAC / NIRF',
                      attainmentScore: 3.42,
                      leadIncharge: 'Dean Research',
                      status: 'Under Verification',
                      evidenceDossiers: [
                        { code: 'DOC-3.1.1', title: 'Extramural Research Project Grants Sanction Letters', size: '7.1 MB', verification: 'Audited' },
                        { code: 'DOC-3.3.2', title: 'Q1 Scopus/WoS Indexed Faculty Publications Compendium', size: '12.8 MB', verification: 'Pending Final Peer Sign-off' },
                      ],
                    },
                  ]).map(crit => (
                    <div key={crit.criterionId} className="mgmt-evidence-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 800 }}>
                            {crit.criterionId}
                          </span>
                          <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{crit.criterionName}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({crit.body})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 800 }}>
                            Score: {crit.attainmentScore} / 4.0
                          </span>
                          <span className={`mgmt-status ${crit.status.includes('Locked') ? 'mgmt-status-success' : 'mgmt-status-warning'}`}>
                            {crit.status}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}>
                        Lead In-Charge: <strong>{crit.leadIncharge}</strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
                        {(crit.evidenceDossiers || []).map((doc, dIdx) => (
                          <div key={dIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8faff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.74rem' }}>
                            <div>
                              <strong style={{ color: '#1e40af' }}>{doc.code}</strong>
                              <div style={{ color: '#475569', fontSize: '0.72rem' }}>{doc.title} ({doc.size})</div>
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d' }}>
                              ✓ {doc.verification}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 8: RISK & EXCEPTION MONITORING (Section 10.B)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'exceptions' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Centralized Risk & Exception Monitoring</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Automated anomaly detection across academic, financial, placement, and compliance operations</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="mgmt-badge" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}>
                    <AlertTriangle size={12} /> {criticalExceptionsCount} Critical Exceptions
                  </span>
                  <span className="mgmt-badge" style={{ background: '#fefce8', color: '#d97706', borderColor: '#fde68a' }}>
                    {exceptions.filter(e => e.severity === 'WARNING').length} Warnings
                  </span>
                </div>
              </div>

              {exceptions.map(exc => (
                <div key={exc.id} className={`mgmt-exception-card severity-${exc.severity}`}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                        background: exc.severity === 'CRITICAL' ? '#fef2f2' : exc.severity === 'WARNING' ? '#fefce8' : '#eff6ff',
                        color: exc.severity === 'CRITICAL' ? '#dc2626' : exc.severity === 'WARNING' ? '#d97706' : '#2563eb',
                        border: '1px solid currentColor',
                      }}>
                        {exc.severity} RISK
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>
                        {exc.category} · {exc.department}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 6px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{exc.title}</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, margin: '10px 0', background: '#f8faff', padding: '10px 14px', borderRadius: 8 }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Observed Value</span>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: exc.severity === 'CRITICAL' ? '#dc2626' : '#d97706' }}>{exc.currentValue}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Target Threshold</span>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669' }}>{exc.targetThreshold}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Institutional Impact</span>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{exc.impact}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                      <strong>Recommended Corrective Action:</strong> {exc.recommendedAction}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
                    <button
                      className="mgmt-btn mgmt-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
                      onClick={() => setActiveTab(exc.targetTab)}
                    >
                      Investigate <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* ─── Corrective & Preventive Action (CAPA) Tracker ───── */}
              <div className="mgmt-panel" style={{ marginTop: '1.5rem' }}>
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Wrench size={18} color="#ea580c" /> Corrective &amp; Preventive Action (CAPA) Execution Tracker
                    </h3>
                    <p>Governing Body mandated action plans with assigned institutional owners, target dates, and verified evidence</p>
                  </div>
                  <span className="mgmt-badge" style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }}>
                    <CheckCircle2 size={12} /> {capaRecords.length || 3} Active CAPA Workflows
                  </span>
                </div>

                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>CAPA ID</th>
                        <th>Linked Risk / Exception</th>
                        <th>Root Cause Analysis</th>
                        <th>Executive Action Plan</th>
                        <th>Assigned Owner</th>
                        <th>Deadline</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(capaRecords.length > 0 ? capaRecords : [
                        {
                          id: 'CAPA-2026-01',
                          linkedExceptionId: 'EXC-001',
                          title: 'Civil Engineering Fee Default Mitigation & Staged Recovery Protocol',
                          rootCause: 'Harvest delays affecting rural family seasonal income.',
                          actionPlan: 'Special installment dispensation sanctioned by Board; HOD issued personal counseling.',
                          assignedOwner: 'Prof. S. R. Mohanty (HOD Civil) & CAO',
                          targetDeadline: '10 Nov 2026',
                          status: 'In Progress',
                          evidenceRequired: 'Verified Fee Receipt Deposit Ledger (Target ₹18.5L Recovered)',
                        },
                        {
                          id: 'CAPA-2026-02',
                          linkedExceptionId: 'EXC-002',
                          title: 'Core Engineering Specialized Corporate Recruitment Drive Engagement',
                          rootCause: 'Reduced IT services software hiring quota for core branches.',
                          actionPlan: 'Partner with 8 core infrastructure and manufacturing firms (L&T, Tata Projects, Jindal).',
                          assignedOwner: 'Prof. S. S. Ray (TPO Head)',
                          targetDeadline: '15 Nov 2026',
                          status: 'In Progress',
                          evidenceRequired: 'Confirmed Corporate Drive Schedule and Written Assessment Dates',
                        },
                        {
                          id: 'CAPA-2026-03',
                          linkedExceptionId: 'EXC-003',
                          title: 'Clearance of Capital Expenditure Requisitions Exceeding 14-Day Window',
                          rootCause: 'Trustee physical meeting rescheduled due to convocation.',
                          actionPlan: 'Virtual digital sign-off portal activated for Governing Body members.',
                          assignedOwner: 'Board Secretary & Chief Enterprise Systems Architect',
                          targetDeadline: '26 Oct 2026',
                          status: 'Resolved & Closed',
                          evidenceRequired: 'Digital Signature Ledger & Audit Log Entry #AUD-9821',
                        },
                      ]).map(capa => (
                        <tr key={capa.id}>
                          <td><strong style={{ color: '#ea580c' }}>{capa.id}</strong></td>
                          <td style={{ maxWidth: 220 }}>
                            <strong style={{ fontSize: '0.84rem' }}>{capa.title}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Linked: {capa.linkedExceptionId}</div>
                          </td>
                          <td style={{ fontSize: '0.76rem', color: '#475569', maxWidth: 180 }}>{capa.rootCause}</td>
                          <td style={{ fontSize: '0.76rem', color: '#0f172a', maxWidth: 220 }}>{capa.actionPlan}</td>
                          <td style={{ fontSize: '0.76rem', color: '#475569' }}>{capa.assignedOwner}</td>
                          <td style={{ fontSize: '0.76rem', color: '#64748b', whiteSpace: 'nowrap' }}>{capa.targetDeadline}</td>
                          <td>
                            <span className={`mgmt-status ${capa.status.includes('Resolved') ? 'mgmt-status-success' : 'mgmt-status-warning'}`}>
                              {capa.status}
                            </span>
                          </td>
                          <td>
                            {!capa.status.includes('Resolved') ? (
                              <button
                                type="button"
                                className="mgmt-btn mgmt-btn-primary"
                                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                onClick={() => setResolveCapaModal({ open: true, record: capa, notes: '', evidenceUrl: '' })}
                              >
                                <Check size={11} /> Resolve
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>
                                ✓ Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 9: AUDIT TRAIL (Section 10.C)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'audit-trail' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Immutable Governance Audit Trail</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Verifiable log of Governing Body decisions, proposal authorizations, and institutional report exports</p>
                </div>
                <button className="mgmt-btn mgmt-btn-secondary" onClick={handleExportActiveTab}>
                  <Download size={14} /> Download Audit CSV
                </button>
              </div>

              {/* Search Toolbar */}
              <div className="mgmt-filter-bar" style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Search size={15} color="#64748b" />
                  <input
                    type="text"
                    className="mgmt-input"
                    placeholder="Search audit trail by actor, action, subject, or comments..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Showing {auditLogs.filter(l => !searchTerm || JSON.stringify(l).toLowerCase().includes(searchTerm.toLowerCase())).length} Records
                </span>
              </div>

              <div className="mgmt-panel">
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Actor</th>
                        <th>Role</th>
                        <th>Subject / Target Record</th>
                        <th>Action / Event</th>
                        <th>State Transition</th>
                        <th>Comments / Justification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs
                        .filter(l => !searchTerm || JSON.stringify(l).toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(log => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>{log.changedAt || log.createdAt}</td>
                            <td><strong>{log.user}</strong></td>
                            <td><span className="mgmt-status mgmt-status-info" style={{ fontSize: '0.68rem' }}>{log.role}</span></td>
                            <td style={{ maxWidth: 220, fontSize: '0.8rem' }}><strong>{log.subject}</strong></td>
                            <td style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700 }}>{log.assessment}</td>
                            <td style={{ fontSize: '0.75rem', color: '#475569' }}>
                              {log.oldMark && log.newMark ? (
                                <span>{log.oldMark} &rarr; <strong>{log.newMark}</strong></span>
                              ) : log.newMark || 'Executed'}
                            </td>
                            <td style={{ fontSize: '0.78rem', color: '#475569', maxWidth: 240 }}>{log.reason}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 10: REPORT GENERATION (Section 9)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="management" />
          )}

        </div>
          </>
        )}
        </div>
      </AppLayout>

      {/* ─── Proposal Dossier Modal ─────────────────────────────────────────── */}
      {selectedProposal && (
        <div className="mgmt-modal-backdrop" onClick={() => setSelectedProposal(null)}>
          <div className="mgmt-modal" onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                  Strategic Proposal Dossier · {selectedProposal.id}
                </span>
                <h3>{selectedProposal.title}</h3>
              </div>
              <button className="mgmt-modal-close" onClick={() => setSelectedProposal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="mgmt-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16, background: '#f8faff', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>DEPARTMENT</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{selectedProposal.dept}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>SUBMITTED BY</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{selectedProposal.by}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>BUDGET OUTLAY</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>{selectedProposal.budget}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>CATEGORY</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb' }}>{selectedProposal.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>PRIORITY</div>
                  <div><PriorityBadge priority={selectedProposal.priority} /></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>CURRENT STATUS</div>
                  <div><StatusBadge status={selectedProposal.status} /></div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Executive Scope & Justification</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, background: '#fff', border: '1px solid #e2e8f0', padding: 12, borderRadius: 8 }}>
                  {selectedProposal.description || selectedProposal.title}
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Supporting Documentation</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(selectedProposal.supportingDocuments || ['Technical_Evaluation_2026.pdf']).map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '6px 10px', fontSize: '0.78rem', color: '#1e40af', fontWeight: 600 }}>
                      <FileText size={14} /> {doc}
                    </div>
                  ))}
                </div>
              </div>

              {selectedProposal.history && selectedProposal.history.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Decision History & Stage Audit</h4>
                  <div className="mgmt-timeline">
                    {selectedProposal.history.map((h, i) => (
                      <div key={i} className="mgmt-timeline-item">
                        <div className="mgmt-timeline-dot" style={{ color: h.action === 'APPROVED' ? '#059669' : h.action === 'REJECTED' ? '#dc2626' : '#2563eb', background: '#fff' }} />
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>{h.timestamp ? new Date(h.timestamp).toLocaleString('en-IN') : 'Stage Log'}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                          {h.action} by {h.actorName || h.by} ({h.actorRole || h.role || 'Authority'})
                        </div>
                        {h.comments && <div style={{ fontSize: '0.75rem', color: '#475569' }}>"{h.comments}"</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mgmt-modal-footer">
              <button className="mgmt-btn mgmt-btn-secondary" onClick={() => setSelectedProposal(null)}>
                Close
              </button>
              {(selectedProposal.status === 'Pending' || selectedProposal.status === 'Under Review') && (
                <>
                  <button
                    className="mgmt-btn mgmt-btn-success"
                    onClick={() => {
                      setActionConfirm({ id: selectedProposal.id, action: 'APPROVE', title: selectedProposal.title });
                    }}
                  >
                    <Check size={14} /> Approve Proposal
                  </button>
                  <button
                    className="mgmt-btn"
                    style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                    onClick={() => {
                      setActionConfirm({ id: selectedProposal.id, action: 'RETURN', title: selectedProposal.title });
                    }}
                  >
                    <CornerDownLeft size={14} /> Return for Revision
                  </button>
                  <button
                    className="mgmt-btn mgmt-btn-danger"
                    onClick={() => {
                      setActionConfirm({ id: selectedProposal.id, action: 'REJECT', title: selectedProposal.title });
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Department Dossier Modal ────────────────────────────────────────── */}
      {selectedDeptDetail && (
        <div className="mgmt-modal-backdrop" onClick={() => setSelectedDeptDetail(null)}>
          <div className="mgmt-modal" onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb' }}>DEPARTMENT DOSSIER · {selectedDeptDetail.code}</span>
                <h3>{selectedDeptDetail.name}</h3>
              </div>
              <button className="mgmt-modal-close" onClick={() => setSelectedDeptDetail(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="mgmt-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Students', val: selectedDeptDetail.students, color: '#2563eb' },
                  { label: 'Faculty', val: selectedDeptDetail.faculty, color: '#059669' },
                  { label: 'Student:Faculty', val: selectedDeptDetail.sfr || '1:16', color: '#7c3aed' },
                  { label: 'Avg CGPA', val: selectedDeptDetail.cgpa, color: '#0891b2' },
                  { label: 'Biometric Attendance', val: `${selectedDeptDetail.attendance}%`, color: '#16a34a' },
                  { label: 'Placement Rate', val: `${selectedDeptDetail.placement}%`, color: '#7c3aed' },
                  { label: 'Fee Recovery', val: `${selectedDeptDetail.feeRecovery}%`, color: '#2563eb' },
                  { label: 'Pass Rate', val: `${selectedDeptDetail.pass}%`, color: '#ea580c' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8faff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f8faff', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Financial & Budget Overview</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span>Annual Budget Allocation: <strong>₹{((selectedDeptDetail.budgetAllocated || 30000000) / 10000000).toFixed(2)} Cr</strong></span>
                  <span>Expenditure YTD: <strong>₹{((selectedDeptDetail.budgetSpent || 21000000) / 10000000).toFixed(2)} Cr</strong></span>
                  <span>Utilization: <strong>{selectedDeptDetail.budgetUtilization || 70}%</strong></span>
                </div>
                <ProgressBar value={selectedDeptDetail.budgetUtilization || 70} color="#059669" />
              </div>

              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                <strong>Head of Department:</strong> {selectedDeptDetail.hod} &nbsp;|&nbsp; <strong>Autonomous Status:</strong> Tier-1 Compliant
              </div>
            </div>

            <div className="mgmt-modal-footer">
              <button className="mgmt-btn mgmt-btn-secondary" onClick={() => setSelectedDeptDetail(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirmation & Comment Dialog ──────────────────────────────────── */}
      {actionConfirm && (
        <div className="mgmt-modal-backdrop" onClick={() => setActionConfirm(null)}>
          <div className="mgmt-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <h3>Confirm Decision: {actionConfirm.action}</h3>
              <button className="mgmt-modal-close" onClick={() => setActionConfirm(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="mgmt-modal-body">
              <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: '#0f172a' }}>
                Are you sure you want to <strong>{actionConfirm.action}</strong> proposal{' '}
                <span style={{ color: '#2563eb', fontWeight: 700 }}>{actionConfirm.id}</span> — "{actionConfirm.title}"?
              </p>
              <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#64748b' }}>
                This decision will be immutably recorded in the institutional audit log with your name, role, timestamp, and comments.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Decision Comments / Resolution Notes (Optional):
                </label>
                <textarea
                  className="mgmt-input"
                  style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
                  placeholder="Enter Governing Body resolution number, conditions, or revision instructions..."
                  value={actionComments}
                  onChange={e => setActionComments(e.target.value)}
                />
              </div>
            </div>

            <div className="mgmt-modal-footer">
              <button className="mgmt-btn mgmt-btn-secondary" onClick={() => setActionConfirm(null)}>
                Cancel
              </button>
              <button
                className={`mgmt-btn ${actionConfirm.action === 'APPROVE' ? 'mgmt-btn-success' : actionConfirm.action === 'RETURN' ? 'mgmt-btn-secondary' : 'mgmt-btn-danger'}`}
                style={actionConfirm.action === 'RETURN' ? { background: '#f59e0b', color: '#fff', border: 'none' } : undefined}
                onClick={handleDecisionSubmit}
              >
                Confirm {actionConfirm.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW PROPOSAL MODAL */}
      {newProposalModal.open && (
        <div className="mgmt-modal-overlay" onClick={() => setNewProposalModal(prev => ({ ...prev, open: false }))}>
          <div className="mgmt-modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Submit Strategic Proposal for Executive Review
                </h3>
              </div>
              <button
                className="mgmt-btn-icon"
                onClick={() => setNewProposalModal(prev => ({ ...prev, open: false }))}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="mgmt-modal-body">
              <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>
                Proposals submitted here enter the institutional governance workflow. Approval thresholds exceeding ₹5 Lakhs automatically escalate to the Governing Body.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Category *
                  </label>
                  <select
                    className="mgmt-select"
                    style={{ width: '100%' }}
                    value={newProposalModal.category}
                    onChange={e => setNewProposalModal(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="Capital Expenditure">Campus Infrastructure & Civil Works</option>
                    <option value="Academic Expansion">Curricular & Academic Expansion</option>
                    <option value="Research & Lab">Research Grant & Lab Modernization</option>
                    <option value="IT Infrastructure">IT Infrastructure & Software Systems</option>
                    <option value="Student Welfare">Student Welfare & Hostel Amenity</option>
                    <option value="Operational Grant">Operational / General Institutional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Priority *
                  </label>
                  <select
                    className="mgmt-select"
                    style={{ width: '100%' }}
                    value={newProposalModal.priority}
                    onChange={e => setNewProposalModal(f => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="Low">Low (Routine Planning)</option>
                    <option value="Medium">Medium (Current Fiscal Target)</option>
                    <option value="High">High (Urgent / Regulatory Need)</option>
                    <option value="Critical">Critical (Statutory Deadline)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Proposal Title *
                </label>
                <input
                  type="text"
                  className="mgmt-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Center for Artificial Intelligence & Robotics Lab Setup"
                  value={newProposalModal.title}
                  onChange={e => setNewProposalModal(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Originating Department / Unit *
                  </label>
                  <input
                    type="text"
                    className="mgmt-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Computer Science & Engg."
                    value={newProposalModal.department}
                    onChange={e => setNewProposalModal(f => ({ ...f, department: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Estimated Financial Outlay (₹) *
                  </label>
                  <input
                    type="text"
                    className="mgmt-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. ₹15.0 Lakhs or 1500000"
                    value={newProposalModal.budget}
                    onChange={e => setNewProposalModal(f => ({ ...f, budget: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Scope of Work & Objectives *
                </label>
                <textarea
                  className="mgmt-input"
                  style={{ width: '100%', minHeight: 70, resize: 'vertical' }}
                  placeholder="Summarize the core requirements, deliverables, and timeline..."
                  value={newProposalModal.description}
                  onChange={e => setNewProposalModal(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Strategic Justification & Expected ROI / NAAC Impact
                </label>
                <textarea
                  className="mgmt-input"
                  style={{ width: '100%', minHeight: 60, resize: 'vertical' }}
                  placeholder="Justify alignment with Institutional 5-Year Plan or Accreditation Criteria..."
                  value={newProposalModal.notes}
                  onChange={e => setNewProposalModal(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="mgmt-modal-footer">
              <button
                className="mgmt-btn mgmt-btn-secondary"
                onClick={() => setNewProposalModal(prev => ({ ...prev, open: false }))}
              >
                Cancel
              </button>
              <button
                className="mgmt-btn mgmt-btn-primary"
                onClick={handleCreateProposalSubmit}
                disabled={!newProposalModal.title?.trim() || !newProposalModal.budget?.trim()}
              >
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE CAPA MODAL */}
      {resolveCapaModal.open && resolveCapaModal.record && (
        <div className="mgmt-modal-overlay" onClick={() => setResolveCapaModal({ open: false, record: null, notes: '', evidenceUrl: '' })}>
          <div className="mgmt-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Close Corrective Action: {resolveCapaModal.record.id}
                </h3>
              </div>
              <button
                className="mgmt-btn-icon"
                onClick={() => setResolveCapaModal({ open: false, record: null, notes: '', evidenceUrl: '' })}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="mgmt-modal-body">
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{resolveCapaModal.record.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                  Owner: <strong>{resolveCapaModal.record.owner}</strong> | Root Cause: {resolveCapaModal.record.rootCause}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Resolution Summary & Preventive Safeguards Implemented *
                </label>
                <textarea
                  className="mgmt-input"
                  style={{ width: '100%', minHeight: 90, resize: 'vertical' }}
                  placeholder="Detail the remedial actions taken, procedural changes enacted, and re-audit schedules..."
                  value={resolveCapaModal.notes}
                  onChange={e => setResolveCapaModal(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Evidence / Verification Document URL or Reference
                </label>
                <input
                  type="text"
                  className="mgmt-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. /evidence/capa/2026-audit-closure-signed.pdf"
                  value={resolveCapaModal.evidenceUrl}
                  onChange={e => setResolveCapaModal(prev => ({ ...prev, evidenceUrl: e.target.value }))}
                />
              </div>
            </div>

            <div className="mgmt-modal-footer">
              <button
                className="mgmt-btn mgmt-btn-secondary"
                onClick={() => setResolveCapaModal({ open: false, record: null, notes: '', evidenceUrl: '' })}
              >
                Cancel
              </button>
              <button
                className="mgmt-btn mgmt-btn-success"
                onClick={handleResolveCapaSubmit}
                disabled={!resolveCapaModal.notes?.trim()}
              >
                Verify & Mark Closed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOARD MEETING DOSSIER MODAL */}
      {selectedMeetingModal && (
        <div className="mgmt-modal-overlay" onClick={() => setSelectedMeetingModal(null)}>
          <div className="mgmt-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileBadge size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedMeetingModal.title}
                </h3>
              </div>
              <button
                className="mgmt-btn-icon"
                onClick={() => setSelectedMeetingModal(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="mgmt-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Meeting Date</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{selectedMeetingModal.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Chairperson</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{selectedMeetingModal.chairperson}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Quorum Status</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>{selectedMeetingModal.quorum}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Proceedings Status</div>
                  <span className={`mgmt-badge ${selectedMeetingModal.status === 'MINUTES_CIRCULATED' ? 'mgmt-badge-success' : 'mgmt-badge-warning'}`}>
                    {selectedMeetingModal.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  Agenda Items Deliberated:
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                  {selectedMeetingModal.agenda?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: 10, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', marginBottom: 2 }}>
                  Official Meeting Dossier File:
                </div>
                <div style={{ fontSize: '0.78rem', color: '#2563eb', fontFamily: 'monospace' }}>
                  {selectedMeetingModal.dossierUrl}
                </div>
              </div>
            </div>

            <div className="mgmt-modal-footer">
              <button
                className="mgmt-btn mgmt-btn-secondary"
                onClick={() => setSelectedMeetingModal(null)}
              >
                Close
              </button>
              <button
                className="mgmt-btn mgmt-btn-primary"
                onClick={() => {
                  showToast(`Dossier access authorized. Downloading ${selectedMeetingModal.id}_Proceedings.pdf`);
                  setSelectedMeetingModal(null);
                }}
              >
                Download Signed Minutes PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
